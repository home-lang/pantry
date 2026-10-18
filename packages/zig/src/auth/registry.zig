const std = @import("std");
const io_helper = @import("../io_helper.zig");
const http = std.http;
const oidc = @import("oidc.zig");

/// Decompress gzip data if it looks like gzip (starts with magic bytes 0x1f 0x8b)
/// Returns a copy of the data if not gzip, or the decompressed data if it is.
/// Uses native std.compress.flate (no subprocess).
pub fn maybeDecompressGzip(allocator: std.mem.Allocator, data: []const u8) ![]const u8 {
    // Check for gzip magic bytes
    if (data.len >= 2 and data[0] == 0x1f and data[1] == 0x8b) {
        var input_reader: std.Io.Reader = .fixed(data);
        var window_buf: [65536]u8 = undefined;
        var decompressor: std.compress.flate.Decompress = .init(&input_reader, .gzip, &window_buf);

        // Stream decompressed data to an allocating writer
        var alloc_writer = std.Io.Writer.Allocating.init(allocator);
        _ = decompressor.reader.stream(&alloc_writer.writer, .unlimited) catch {
            alloc_writer.deinit();
            return try allocator.dupe(u8, data);
        };

        const result = try allocator.dupe(u8, alloc_writer.writer.buffer[0..alloc_writer.writer.end]);
        alloc_writer.deinit();
        return result;
    }

    // Not gzip, return a copy
    return try allocator.dupe(u8, data);
}

/// URL-encode a package name for use in registry URLs
/// Scoped packages like "@scope/name" need special handling
/// npm's registry path keeps the leading @ literal and escapes the slash:
/// `@scope/name` -> `@scope%2fname` (npm-package-arg's `escapedName`).
pub fn urlEncodePackageName(allocator: std.mem.Allocator, package_name: []const u8) ![]u8 {
    // npm registry expects scoped packages with special chars percent-encoded
    // e.g., @scope/name -> @scope%2fname. Encoding the @ as %40 works for
    // some existing-package routes but first-time publishes are rejected with
    // `invalid path: package/`.
    var encoded_len: usize = 0;
    for (package_name) |c| {
        encoded_len += switch (c) {
            '/', ' ', '#', '?', '&', '=', '+', '%' => @as(usize, 3),
            else => @as(usize, 1),
        };
    }

    // If no encoding needed, just dupe
    if (encoded_len == package_name.len) {
        return try allocator.dupe(u8, package_name);
    }

    // Allocate and encode
    const result = try allocator.alloc(u8, encoded_len);
    errdefer allocator.free(result);

    var i: usize = 0;
    for (package_name) |c| {
        switch (c) {
            '/' => {
                result[i] = '%';
                result[i + 1] = '2';
                result[i + 2] = 'F';
                i += 3;
            },
            ' ' => {
                result[i] = '%';
                result[i + 1] = '2';
                result[i + 2] = '0';
                i += 3;
            },
            '#' => {
                result[i] = '%';
                result[i + 1] = '2';
                result[i + 2] = '3';
                i += 3;
            },
            '?' => {
                result[i] = '%';
                result[i + 1] = '3';
                result[i + 2] = 'F';
                i += 3;
            },
            '&' => {
                result[i] = '%';
                result[i + 1] = '2';
                result[i + 2] = '6';
                i += 3;
            },
            '=' => {
                result[i] = '%';
                result[i + 1] = '3';
                result[i + 2] = 'D';
                i += 3;
            },
            '+' => {
                result[i] = '%';
                result[i + 1] = '2';
                result[i + 2] = 'B';
                i += 3;
            },
            '%' => {
                result[i] = '%';
                result[i + 1] = '2';
                result[i + 2] = '5';
                i += 3;
            },
            else => {
                result[i] = c;
                i += 1;
            },
        }
    }

    return result;
}

/// Whether a publish request's status means the registry accepted the upload.
///
/// `200 OK`, `201 Created` and **`202 Accepted`**. The third one is the reason
/// this is a named function rather than an inline comparison: npm answers 202
/// when it *queues* a publish rather than completing it inline, which it does
/// routinely for larger packages and for publishes carrying provenance. The
/// upload is accepted; public metadata and immutable bytes still need checking.
///
/// Reading 202 as a failure cost a failed release job on every single release,
/// in two distinct ways:
///
///   - a package whose publish returned 202 was reported failed while being
///     live on the registry — the log line was literally
///     `202 Error: {"success":true}`;
///   - worse, a 202 on the first attempt *staged* the version, the caller read
///     failure and retried, and the retry came back
///     `409 Cannot publish over previously staged version` — a conflict the
///     publisher had created for itself one attempt earlier.
///
/// Deliberately an explicit list rather than "any 2xx". The failure mode of
/// being too generous here is a publish that did not happen being reported as
/// one that did, which is the more expensive direction to be wrong in.
pub fn publishSucceeded(status: std.http.Status) bool {
    return switch (status) {
        .ok, .created, .accepted => true,
        else => false,
    };
}

test "a queued publish is an accepted upload" {
    // npm returns 202 when it accepts a publish for asynchronous processing,
    // which it does for large packages and for provenance. Public completion
    // is verified separately against the metadata and immutable tarball.
    try std.testing.expect(publishSucceeded(.ok));
    try std.testing.expect(publishSucceeded(.created));
    try std.testing.expect(publishSucceeded(.accepted));
}

test "and everything the registry refuses is not" {
    // Including 409, which this very check used to cause: a 202 read as failure
    // was retried, and the retry conflicted with the version the first attempt
    // had already staged.
    try std.testing.expect(!publishSucceeded(.unauthorized));
    try std.testing.expect(!publishSucceeded(.forbidden));
    try std.testing.expect(!publishSucceeded(.not_found));
    try std.testing.expect(!publishSucceeded(.conflict));
    try std.testing.expect(!publishSucceeded(.unprocessable_entity));
    try std.testing.expect(!publishSucceeded(.internal_server_error));
    try std.testing.expect(!publishSucceeded(.no_content));
}

test "npm registry path encoding preserves scoped package at-sign" {
    const encoded = try urlEncodePackageName(std.testing.allocator, "@ts-charts/graph");
    defer std.testing.allocator.free(encoded);
    try std.testing.expectEqualStrings("@ts-charts%2Fgraph", encoded);
}

test "npm registry path encoding escapes unscoped reserved characters" {
    const encoded = try urlEncodePackageName(std.testing.allocator, "package name");
    defer std.testing.allocator.free(encoded);
    try std.testing.expectEqualStrings("package%20name", encoded);
}

/// Escape a string for embedding inside a JSON string value.
/// Handles: " → \", \ → \\, and control characters.
fn jsonEscapeAlloc(allocator: std.mem.Allocator, input: []const u8) ![]u8 {
    var escaped_len: usize = 0;
    for (input) |c| {
        escaped_len += switch (c) {
            '"', '\\' => @as(usize, 2),
            '\n', '\r', '\t' => @as(usize, 2),
            else => if (c < 0x20) @as(usize, 6) else @as(usize, 1),
        };
    }

    const result = try allocator.alloc(u8, escaped_len);
    errdefer allocator.free(result);

    var i: usize = 0;
    for (input) |c| {
        switch (c) {
            '"' => {
                result[i] = '\\';
                result[i + 1] = '"';
                i += 2;
            },
            '\\' => {
                result[i] = '\\';
                result[i + 1] = '\\';
                i += 2;
            },
            '\n' => {
                result[i] = '\\';
                result[i + 1] = 'n';
                i += 2;
            },
            '\r' => {
                result[i] = '\\';
                result[i + 1] = 'r';
                i += 2;
            },
            '\t' => {
                result[i] = '\\';
                result[i + 1] = 't';
                i += 2;
            },
            else => {
                if (c < 0x20) {
                    const hex_chars_ctrl = "0123456789abcdef";
                    result[i] = '\\';
                    result[i + 1] = 'u';
                    result[i + 2] = '0';
                    result[i + 3] = '0';
                    result[i + 4] = hex_chars_ctrl[c >> 4];
                    result[i + 5] = hex_chars_ctrl[c & 0x0F];
                    i += 6;
                } else {
                    result[i] = c;
                    i += 1;
                }
            },
        }
    }

    return result;
}

/// Registry client for publishing packages
pub const RegistryClient = struct {
    allocator: std.mem.Allocator,
    registry_url: []const u8,
    http_client: http.Client,
    /// Raw package.json content — set before publishing so npm metadata
    /// includes all fields (types, exports, module, dependencies, etc.)
    package_json: ?[]const u8 = null,
    /// Resolved publish settings used in the npm registry document.
    publish_access: []const u8 = "public",
    publish_tag: []const u8 = "latest",
    publish_otp: ?[]const u8 = null,

    pub fn init(allocator: std.mem.Allocator, registry_url: []const u8) !RegistryClient {
        return RegistryClient{
            .allocator = allocator,
            .registry_url = registry_url,
            // Publish requests use Pantry's shared concurrent backend so a
            // deadline can cancel a stalled socket rather than pinning the
            // entire release until the CI job is killed.
            .http_client = http.Client{ .allocator = allocator, .io = io_helper.getIo() },
        };
    }

    pub fn deinit(self: *RegistryClient) void {
        self.http_client.deinit();
    }

    /// Publish package using OIDC authentication with full token validation
    /// This is the recommended method - validates signature before publishing
    pub fn publishWithOIDCValidated(
        self: *RegistryClient,
        package_name: []const u8,
        version: []const u8,
        tarball_path: []const u8,
        raw_token: []const u8,
        provider: *const oidc.OIDCProvider,
    ) !PublishResponse {
        // Validate the token completely (signature + claims + expiration)
        var validated_token = oidc.validateTokenComplete(
            self.allocator,
            raw_token,
            provider,
            null, // audience validation is optional for npm
        ) catch |err| {
            return PublishResponse{
                .success = false,
                .status_code = 401,
                .message = switch (err) {
                    error.InvalidSignature => try self.allocator.dupe(u8, "OIDC token signature verification failed"),
                    error.ExpiredToken => try self.allocator.dupe(u8, "OIDC token has expired"),
                    error.InvalidIssuer => try self.allocator.dupe(u8, "OIDC token issuer does not match provider"),
                    error.InvalidAudience => try self.allocator.dupe(u8, "OIDC token audience mismatch"),
                    error.UnsupportedAlgorithm => try self.allocator.dupe(u8, "OIDC token uses unsupported algorithm"),
                    error.InvalidToken => try self.allocator.dupe(u8, "Invalid OIDC token format"),
                    error.InvalidJWKS => try self.allocator.dupe(u8, "Failed to fetch or parse JWKS"),
                    error.NetworkError => try self.allocator.dupe(u8, "Network error fetching JWKS"),
                    else => try self.allocator.dupe(u8, "OIDC token validation failed"),
                },
            };
        };
        defer validated_token.deinit(self.allocator);

        // Now publish with the validated token
        return self.publishWithOIDC(package_name, version, tarball_path, &validated_token);
    }

    /// Publish package using OIDC authentication (assumes token is already validated)
    /// Use publishWithOIDCValidated for automatic validation
    pub fn publishWithOIDC(
        self: *RegistryClient,
        package_name: []const u8,
        version: []const u8,
        tarball_path: []const u8,
        token: *const oidc.OIDCToken,
    ) !PublishResponse {
        // URL-encode package name for scoped packages
        const encoded_name = try urlEncodePackageName(self.allocator, package_name);
        defer self.allocator.free(encoded_name);

        // Construct registry URL for package publish
        const url = try std.fmt.allocPrint(
            self.allocator,
            "{s}/{s}",
            .{ self.registry_url, encoded_name },
        );
        defer self.allocator.free(url);

        // Read tarball using io_helper (blocking std.fs API)
        const tarball = try io_helper.readFileAlloc(self.allocator, tarball_path, 100 * 1024 * 1024); // 100 MB max
        defer self.allocator.free(tarball);

        // Create package metadata JSON
        const metadata = try self.createPackageMetadata(package_name, version, tarball);
        defer self.allocator.free(metadata);

        // Parse URI
        const uri = try std.Uri.parse(url);

        // Create authorization header
        const auth_header = try std.fmt.allocPrint(
            self.allocator,
            "Bearer {s}",
            .{token.raw_token},
        );
        defer self.allocator.free(auth_header);

        // Create extra headers (npm requires specific headers)
        // npm-auth-type: oidc tells npm this is OIDC authentication
        // Accept-Encoding: identity prevents gzip responses we can't decode
        const extra_headers = [_]http.Header{
            .{ .name = "Authorization", .value = auth_header },
            .{ .name = "Content-Type", .value = "application/json" },
            .{ .name = "Accept", .value = "application/json" },
            .{ .name = "Accept-Encoding", .value = "identity" },
            .{ .name = "User-Agent", .value = "pantry/0.1.0" },
            .{ .name = "npm-command", .value = "publish" },
            .{ .name = "npm-auth-type", .value = "oidc" },
        };

        // Make HTTP request
        var req = try self.http_client.request(.PUT, uri, .{
            .extra_headers = &extra_headers,
        });
        defer req.deinit();

        req.transfer_encoding = .{ .content_length = metadata.len };
        try req.sendBodyComplete(@constCast(metadata));

        var redirect_buffer: [4096]u8 = undefined;
        var response = try req.receiveHead(&redirect_buffer);

        // Read response body
        const body_reader = response.reader(&.{});
        const raw_body = body_reader.allocRemaining(self.allocator, std.Io.Limit.limited(1024 * 1024)) catch |err| switch (err) {
            error.StreamTooLong => return error.ResponseTooLarge,
            else => |e| return e,
        };
        defer self.allocator.free(raw_body);

        // Decompress if gzip (npm CDN sometimes ignores Accept-Encoding header)
        const body = try maybeDecompressGzip(self.allocator, raw_body);
        defer self.allocator.free(body);

        const success = publishSucceeded(response.head.status);
        const status_code = @backingInt(response.head.status);

        const message = if (body.len > 0)
            try self.allocator.dupe(u8, body)
        else
            null;

        // Parse error details if publish failed
        const error_details = if (!success and body.len > 0)
            parseErrorDetails(self.allocator, body)
        else
            null;

        // For retryable failures, see if the server told us how long to wait.
        const retry_after_seconds = if (!success and body.len > 0)
            parseRetryAfter(body)
        else
            null;

        return PublishResponse{
            .success = success,
            .status_code = status_code,
            .message = message,
            .error_details = error_details,
            .retry_after_seconds = retry_after_seconds,
        };
    }

    /// Exchange GitHub OIDC token for npm publish token
    /// npm requires this exchange before publishing with OIDC
    /// Endpoint: /-/npm/v1/oidc/token/exchange/package/<package-name>
    pub fn exchangeOIDCToken(self: *RegistryClient, oidc_token: []const u8, package_name: []const u8) !?[]const u8 {
        // URL-encode package name for scoped packages
        const encoded_name = try urlEncodePackageName(self.allocator, package_name);
        defer self.allocator.free(encoded_name);

        const url = try std.fmt.allocPrint(
            self.allocator,
            "{s}/-/npm/v1/oidc/token/exchange/package/{s}",
            .{ self.registry_url, encoded_name },
        );
        defer self.allocator.free(url);

        const uri = try std.Uri.parse(url);

        const auth_header = try std.fmt.allocPrint(
            self.allocator,
            "Bearer {s}",
            .{oidc_token},
        );
        defer self.allocator.free(auth_header);

        const extra_headers = [_]http.Header{
            .{ .name = "Authorization", .value = auth_header },
            .{ .name = "Content-Type", .value = "application/json" },
            .{ .name = "Accept", .value = "application/json" },
        };

        var req = try self.http_client.request(.POST, uri, .{
            .extra_headers = &extra_headers,
        });
        defer req.deinit();

        // Send empty body (POST requires a body, even if empty)
        req.transfer_encoding = .{ .content_length = 0 };
        try req.sendBodyComplete(&.{});

        var redirect_buffer: [4096]u8 = undefined;
        var response = try req.receiveHead(&redirect_buffer);

        const body_reader = response.reader(&.{});
        const raw_body = body_reader.allocRemaining(self.allocator, std.Io.Limit.limited(1024 * 1024)) catch |err| switch (err) {
            error.StreamTooLong => return error.ResponseTooLarge,
            else => |e| return e,
        };
        defer self.allocator.free(raw_body);

        // Decompress if gzip (npm CDN sometimes ignores Accept-Encoding header)
        const body = try maybeDecompressGzip(self.allocator, raw_body);
        defer self.allocator.free(body);

        if (response.head.status != .ok and response.head.status != .created) {
            return null;
        }

        // Parse JSON response to extract token
        const parsed = std.json.parseFromSlice(std.json.Value, self.allocator, body, .{}) catch {
            return null;
        };
        defer parsed.deinit();

        if (parsed.value.object.get("token")) |token_val| {
            if (token_val == .string) {
                return try self.allocator.dupe(u8, token_val.string);
            }
        }

        return null;
    }

    /// Publish package using OIDC authentication with Sigstore provenance bundle
    /// This is the full npm provenance flow as documented at https://docs.npmjs.com/generating-provenance-statements
    pub fn publishWithOIDCAndProvenance(
        self: *RegistryClient,
        package_name: []const u8,
        version: []const u8,
        tarball_path: []const u8,
        token: *const oidc.OIDCToken,
        sigstore_bundle: ?[]const u8,
    ) !PublishResponse {
        // Step 1: Exchange OIDC token with npm for a publish token
        const npm_token = try self.exchangeOIDCToken(token.raw_token, package_name) orelse {
            // Allocate strings for error details since PublishResponse.deinit will free them
            const code = try self.allocator.dupe(u8, "EOTP");
            const summary = try self.allocator.dupe(u8, "OIDC authentication failed. Check trusted publisher configuration on npm.");
            return PublishResponse{
                .success = false,
                .status_code = 401,
                .not_sent = true,
                .message = try self.allocator.dupe(u8, "Failed to exchange OIDC token with npm"),
                .error_details = .{
                    .code = code,
                    .summary = summary,
                    .suggestion = null,
                },
            };
        };
        defer self.allocator.free(npm_token);

        // URL-encode package name for scoped packages
        const encoded_name = try urlEncodePackageName(self.allocator, package_name);
        defer self.allocator.free(encoded_name);

        // Construct registry URL for package publish
        const url = try std.fmt.allocPrint(
            self.allocator,
            "{s}/{s}",
            .{ self.registry_url, encoded_name },
        );
        defer self.allocator.free(url);

        // Read tarball using io_helper (blocking std.fs API)
        const tarball = try io_helper.readFileAlloc(self.allocator, tarball_path, 100 * 1024 * 1024); // 100 MB max
        defer self.allocator.free(tarball);

        // Create package metadata JSON with provenance
        const metadata = try self.createPackageMetadataWithProvenance(
            package_name,
            version,
            tarball,
            sigstore_bundle,
        );
        defer self.allocator.free(metadata);

        // Parse URI
        const uri = try std.Uri.parse(url);

        // Create authorization header using the exchanged npm token
        const auth_header = try std.fmt.allocPrint(
            self.allocator,
            "Bearer {s}",
            .{npm_token},
        );
        defer self.allocator.free(auth_header);

        // Create extra headers (npm requires specific headers for OIDC provenance)
        // npm-auth-type: oidc tells npm this is OIDC authentication
        // Accept-Encoding: identity prevents gzip responses we can't decode
        const extra_headers = [_]http.Header{
            .{ .name = "Authorization", .value = auth_header },
            .{ .name = "Content-Type", .value = "application/json" },
            .{ .name = "Accept", .value = "application/json" },
            .{ .name = "Accept-Encoding", .value = "identity" },
            .{ .name = "User-Agent", .value = "pantry/0.1.0" },
            .{ .name = "npm-command", .value = "publish" },
            .{ .name = "npm-auth-type", .value = "oidc" },
        };

        // Make HTTP request
        var req = try self.http_client.request(.PUT, uri, .{
            .extra_headers = &extra_headers,
        });
        defer req.deinit();

        req.transfer_encoding = .{ .content_length = metadata.len };
        try req.sendBodyComplete(@constCast(metadata));

        var redirect_buffer: [4096]u8 = undefined;
        var response = try req.receiveHead(&redirect_buffer);

        // Read response body
        const body_reader = response.reader(&.{});
        const raw_body = body_reader.allocRemaining(self.allocator, std.Io.Limit.limited(1024 * 1024)) catch |err| switch (err) {
            error.StreamTooLong => return error.ResponseTooLarge,
            else => |e| return e,
        };
        defer self.allocator.free(raw_body);

        // Decompress if gzip (npm CDN sometimes ignores Accept-Encoding header)
        const body = try maybeDecompressGzip(self.allocator, raw_body);
        defer self.allocator.free(body);

        const success = publishSucceeded(response.head.status);
        const status_code = @backingInt(response.head.status);

        const message = if (body.len > 0)
            try self.allocator.dupe(u8, body)
        else
            null;

        // Parse error details if publish failed
        const error_details = if (!success and body.len > 0)
            parseErrorDetails(self.allocator, body)
        else
            null;

        // For retryable failures, see if the server told us how long to wait.
        const retry_after_seconds = if (!success and body.len > 0)
            parseRetryAfter(body)
        else
            null;

        return PublishResponse{
            .success = success,
            .status_code = status_code,
            .message = message,
            .error_details = error_details,
            .retry_after_seconds = retry_after_seconds,
        };
    }

    /// Publish package using traditional token authentication
    pub fn publishWithToken(
        self: *RegistryClient,
        package_name: []const u8,
        version: []const u8,
        tarball_path: []const u8,
        auth_token: []const u8,
    ) !PublishResponse {
        // URL-encode package name for scoped packages
        const encoded_name = try urlEncodePackageName(self.allocator, package_name);
        defer self.allocator.free(encoded_name);

        const url = try std.fmt.allocPrint(
            self.allocator,
            "{s}/{s}",
            .{ self.registry_url, encoded_name },
        );
        defer self.allocator.free(url);

        // Read tarball using io_helper (blocking std.fs API)
        const tarball = try io_helper.readFileAlloc(self.allocator, tarball_path, 100 * 1024 * 1024);
        defer self.allocator.free(tarball);

        // Create package metadata
        const metadata = try self.createPackageMetadata(package_name, version, tarball);
        defer self.allocator.free(metadata);

        // Parse URI
        const uri = try std.Uri.parse(url);

        // Trim whitespace/newlines from auth token (GitHub secrets may have trailing whitespace)
        const trimmed_token = std.mem.trim(u8, auth_token, " \t\r\n");

        // Create authorization header
        const auth_header = try std.fmt.allocPrint(
            self.allocator,
            "Bearer {s}",
            .{trimmed_token},
        );
        defer self.allocator.free(auth_header);

        // Extract scope from scoped package name (e.g., "@glenn123/foo" → "@glenn123")
        // npm's CDN uses this header for routing, especially for first-time publishes
        const npm_scope: []const u8 = if (package_name[0] == '@')
            if (std.mem.indexOf(u8, package_name, "/")) |idx| package_name[0..idx] else ""
        else
            "";

        // Create extra headers matching npm CLI behavior
        // npm-auth-type: legacy — tells npm this is token auth (vs OIDC/web)
        // npm-scope — helps npm's CDN route requests for scoped packages
        // Accept-Encoding: identity prevents gzip responses we can't decode
        const base_headers = [_]http.Header{
            .{ .name = "Authorization", .value = auth_header },
            .{ .name = "Content-Type", .value = "application/json" },
            .{ .name = "Accept", .value = "application/json" },
            .{ .name = "Accept-Encoding", .value = "identity" },
            .{ .name = "User-Agent", .value = "pantry/0.1.0" },
            .{ .name = "npm-command", .value = "publish" },
            .{ .name = "npm-auth-type", .value = "legacy" },
            .{ .name = "npm-scope", .value = npm_scope },
        };
        var extra_headers = std.ArrayList(http.Header).empty;
        defer extra_headers.deinit(self.allocator);
        try extra_headers.appendSlice(self.allocator, &base_headers);
        if (self.publish_otp) |otp| {
            try extra_headers.append(self.allocator, .{ .name = "npm-otp", .value = otp });
        }

        // Make HTTP request
        var req = try self.http_client.request(.PUT, uri, .{
            .extra_headers = extra_headers.items,
        });
        defer req.deinit();

        req.transfer_encoding = .{ .content_length = metadata.len };
        try req.sendBodyComplete(@constCast(metadata));

        var redirect_buffer: [4096]u8 = undefined;
        var response = try req.receiveHead(&redirect_buffer);

        // Read response body
        const body_reader = response.reader(&.{});
        const raw_body = body_reader.allocRemaining(self.allocator, std.Io.Limit.limited(1024 * 1024)) catch |err| switch (err) {
            error.StreamTooLong => return error.ResponseTooLarge,
            else => |e| return e,
        };
        defer self.allocator.free(raw_body);

        // Decompress if gzip (npm CDN sometimes ignores Accept-Encoding header)
        const body = try maybeDecompressGzip(self.allocator, raw_body);
        defer self.allocator.free(body);

        const success = publishSucceeded(response.head.status);
        const status_code = @backingInt(response.head.status);

        const message = if (body.len > 0)
            try self.allocator.dupe(u8, body)
        else
            null;

        // Parse error details if publish failed
        const error_details = if (!success and body.len > 0)
            parseErrorDetails(self.allocator, body)
        else
            null;

        // For retryable failures, see if the server told us how long to wait.
        const retry_after_seconds = if (!success and body.len > 0)
            parseRetryAfter(body)
        else
            null;

        return PublishResponse{
            .success = success,
            .status_code = status_code,
            .message = message,
            .error_details = error_details,
            .retry_after_seconds = retry_after_seconds,
        };
    }

    const PublishResult = anyerror!PublishResponse;

    fn publishWithTokenTask(
        self: *RegistryClient,
        package_name: []const u8,
        version: []const u8,
        tarball_path: []const u8,
        auth_token: []const u8,
    ) PublishResult {
        return self.publishWithToken(package_name, version, tarball_path, auth_token);
    }

    fn publishTimeoutTask(timeout_ms: u64) void {
        const ns: i96 = @intCast(@as(u128, timeout_ms) * @as(u128, std.time.ns_per_ms));
        io_helper.getIo().sleep(.{ .nanoseconds = ns }, .awake) catch {};
    }

    /// Publish with a bounded end-to-end deadline.
    ///
    /// npm can accept a PUT and then stop making progress while Pantry waits
    /// for its response. In a monorepo release that used to strand every
    /// package after the stalled one until the CI job timeout. The caller can
    /// safely retry this timeout: it confirms whether the version landed
    /// before attempting another upload.
    pub fn publishWithTokenTimeout(
        self: *RegistryClient,
        package_name: []const u8,
        version: []const u8,
        tarball_path: []const u8,
        auth_token: []const u8,
        timeout_ms: u64,
    ) !PublishResponse {
        if (timeout_ms == 0) return self.publishWithToken(package_name, version, tarball_path, auth_token);

        const Selection = union(enum) {
            response: PublishResult,
            timeout: void,
        };
        var result_buffer: [2]Selection = undefined;
        var select = std.Io.Select(Selection).init(io_helper.getIo(), &result_buffer);

        try select.concurrent(.response, publishWithTokenTask, .{ self, package_name, version, tarball_path, auth_token });
        select.concurrent(.timeout, publishTimeoutTask, .{timeout_ms}) catch |err| {
            while (select.cancel()) |result| {
                if (result == .response) {
                    if (result.response) |response| {
                        var owned_response = response;
                        owned_response.deinit(self.allocator);
                    } else |_| {}
                }
            }
            return err;
        };

        const first = try select.await();
        switch (first) {
            .response => |response| {
                while (select.cancel()) |_| {}
                return response;
            },
            .timeout => {
                while (select.cancel()) |result| {
                    if (result == .response) {
                        if (result.response) |response| {
                            var owned_response = response;
                            owned_response.deinit(self.allocator);
                        } else |_| {}
                    }
                }
                return error.Timeout;
            },
        }
    }

    /// Check whether a specific (name, version) is already published.
    /// Returns true if the version exists on the registry, false if 404.
    /// Network errors propagate up — callers decide whether to skip the
    /// pre-check or fail. Designed for monorepo publishes where most
    /// packages are unchanged release-to-release; skipping their re-publish
    /// avoids both wasted requests and Cloudflare 429 rate-limiting.
    pub fn versionExists(
        self: *RegistryClient,
        package_name: []const u8,
        version: []const u8,
    ) !bool {
        const encoded_name = try urlEncodePackageName(self.allocator, package_name);
        defer self.allocator.free(encoded_name);

        const url = try std.fmt.allocPrint(
            self.allocator,
            "{s}/{s}/{s}",
            .{ self.registry_url, encoded_name, version },
        );
        defer self.allocator.free(url);

        const uri = try std.Uri.parse(url);

        var req = try self.http_client.request(.GET, uri, .{});
        defer req.deinit();

        try req.sendBodiless();

        var redirect_buffer: [4096]u8 = undefined;
        var response = try req.receiveHead(&redirect_buffer);

        // Drain body so the underlying connection can be reused for the
        // next call. We don't care about the contents — only the status.
        const body_reader = response.reader(&.{});
        if (body_reader.allocRemaining(self.allocator, std.Io.Limit.limited(64 * 1024))) |raw_body| {
            self.allocator.free(raw_body);
        } else |_| {}

        const status = @backingInt(response.head.status);
        if (status == 200) return true;
        if (status == 404) return false;
        // Treat other statuses as "unknown" — caller will fall through to a
        // real publish attempt rather than incorrectly skipping.
        return error.RegistryError;
    }

    fn publicBytes(self: *RegistryClient, url: []const u8, limit: usize) !?[]u8 {
        const uri = try std.Uri.parse(url);
        const headers = [_]http.Header{
            .{ .name = "Accept-Encoding", .value = "identity" },
            .{ .name = "Cache-Control", .value = "no-cache" },
        };
        // Public readback never forwards a publish credential to the tarball
        // host, which may differ from the registry host.
        // A canceled read must close its owned connection. Returning an
        // incomplete response to the keep-alive pool makes Request.deinit
        // drain the stalled body after cancellation, defeating our deadline.
        var req = try self.http_client.request(.GET, uri, .{
            .extra_headers = &headers,
            .keep_alive = false,
        });
        defer req.deinit();
        try req.sendBodiless();
        var redirect_buffer: [4096]u8 = undefined;
        var response = try req.receiveHead(&redirect_buffer);
        if (response.head.status == .not_found) return null;
        if (response.head.status != .ok) return error.RegistryUnavailable;
        return try response.reader(&.{}).allocRemaining(self.allocator, std.Io.Limit.limited(limit));
    }

    fn publicationString(value: std.json.Value, key: []const u8) ![]const u8 {
        if (value != .object) return error.InvalidPublicationMetadata;
        const field = value.object.get(key) orelse return error.InvalidPublicationMetadata;
        if (field != .string) return error.InvalidPublicationMetadata;
        return field.string;
    }

    /// A version endpoint alone does not prove a package can be installed.
    /// Require its named version and the exact SHA-512 bytes we uploaded.
    fn publicationReady(self: *RegistryClient, package_name: []const u8, version: []const u8, expected_integrity: ?[]const u8) !bool {
        const encoded = try urlEncodePackageName(self.allocator, package_name);
        defer self.allocator.free(encoded);
        const url = try std.fmt.allocPrint(self.allocator, "{s}/{s}/{s}", .{ std.mem.trimEnd(u8, self.registry_url, "/"), encoded, version });
        defer self.allocator.free(url);
        const body = try self.publicBytes(url, 1024 * 1024) orelse return false;
        defer self.allocator.free(body);
        const parsed = try std.json.parseFromSlice(std.json.Value, self.allocator, body, .{});
        defer parsed.deinit();
        const matching_name = std.mem.eql(u8, try publicationString(parsed.value, "name"), package_name);
        const matching_version = std.mem.eql(u8, try publicationString(parsed.value, "version"), version);
        if (!matching_name or !matching_version) return error.PublicationMetadataMismatch;
        const dist = parsed.value.object.get("dist") orelse return error.InvalidPublicationMetadata;
        const integrity = publicationString(dist, "integrity") catch null;
        const shasum = publicationString(dist, "shasum") catch null;
        if (integrity == null and shasum == null) return error.InvalidPublicationMetadata;
        if (expected_integrity) |expected| {
            if (integrity) |advertised| {
                if (!std.mem.eql(u8, advertised, expected)) return error.PublicationIntegrityMismatch;
            }
        }
        const tarball_url = try publicationString(dist, "tarball");
        const tarball = try self.publicBytes(tarball_url, 100 * 1024 * 1024) orelse return false;
        defer self.allocator.free(tarball);
        var digest: [64]u8 = undefined;
        std.crypto.hash.sha2.Sha512.hash(tarball, &digest, .{});
        var actual: [95]u8 = undefined;
        @memcpy(actual[0..7], "sha512-");
        _ = std.base64.standard.Encoder.encode(actual[7..], &digest);
        if (expected_integrity) |expected| {
            if (!std.mem.eql(u8, &actual, expected)) return error.PublicationIntegrityMismatch;
        }
        if (integrity) |advertised| {
            if (!std.mem.eql(u8, &actual, advertised)) return error.PublicationIntegrityMismatch;
        } else if (shasum) |advertised| {
            // Historical npm versions may advertise only SHA-1. This applies
            // to verified skip-existing, not a weaker check of our new upload.
            var sha1: [20]u8 = undefined;
            std.crypto.hash.Sha1.hash(tarball, &sha1, .{});
            const actual_sha1 = std.fmt.bytesToHex(sha1, .lower);
            if (!std.ascii.eqlIgnoreCase(&actual_sha1, advertised)) return error.PublicationIntegrityMismatch;
        }
        return true;
    }

    fn awaitPublicationTask(self: *RegistryClient, package_name: []const u8, version: []const u8, expected_integrity: ?[]const u8) anyerror!bool {
        var delay_ms: u64 = 1000;
        while (true) {
            const ready = self.publicationReady(package_name, version, expected_integrity) catch |err| switch (err) {
                error.Canceled, error.PublicationMetadataMismatch, error.PublicationIntegrityMismatch => return err,
                else => false,
            };
            if (ready) return true;
            try io_helper.getIo().sleep(.{ .nanoseconds = @as(i96, @intCast(delay_ms * std.time.ns_per_ms)) }, .awake);
            delay_ms = @min(delay_ms * 2, 8000);
        }
    }

    /// Bound the entire readback, including a server that stalls mid-body.
    /// Timing out means pending, never that an accepted upload should be sent
    /// again. Cancel and reap every outstanding I/O task before returning.
    pub fn confirmPublication(self: *RegistryClient, package_name: []const u8, version: []const u8, expected_integrity: ?[]const u8, timeout_ms: u64) !bool {
        const Selection = union(enum) {
            ready: anyerror!bool,
            timeout: void,
        };
        var result_buffer: [2]Selection = undefined;
        var selection = std.Io.Select(Selection).init(io_helper.getIo(), &result_buffer);
        defer {
            while (selection.cancel()) |_| {}
        }
        try selection.concurrent(.ready, awaitPublicationTask, .{ self, package_name, version, expected_integrity });
        try selection.concurrent(.timeout, publishTimeoutTask, .{timeout_ms});
        return switch (try selection.await()) {
            .ready => |ready| try ready,
            .timeout => false,
        };
    }

    // Private helper methods

    fn createPackageMetadata(
        self: *RegistryClient,
        package_name: []const u8,
        version: []const u8,
        tarball: []const u8,
    ) ![]u8 {
        return self.createPackageMetadataWithProvenance(package_name, version, tarball, null);
    }

    /// Create package metadata with optional Sigstore provenance attestation
    fn createPackageMetadataWithProvenance(
        self: *RegistryClient,
        package_name: []const u8,
        version: []const u8,
        tarball: []const u8,
        sigstore_bundle: ?[]const u8,
    ) ![]u8 {
        // Base64 encode tarball
        const encoder = std.base64.standard.Encoder;
        const encoded_len = encoder.calcSize(tarball.len);
        const encoded_tarball = try self.allocator.alloc(u8, encoded_len);
        defer self.allocator.free(encoded_tarball);
        _ = encoder.encode(encoded_tarball, tarball);

        // Calculate SHA-1 shasum (hex)
        var sha1: [20]u8 = undefined;
        std.crypto.hash.Sha1.hash(tarball, &sha1, .{});
        const hex_chars = "0123456789abcdef";
        var shasum_buf: [40]u8 = undefined;
        for (sha1, 0..) |byte, i| {
            shasum_buf[i * 2] = hex_chars[byte >> 4];
            shasum_buf[i * 2 + 1] = hex_chars[byte & 0x0F];
        }

        // Calculate SHA-512 integrity (base64)
        var sha512: [64]u8 = undefined;
        std.crypto.hash.sha2.Sha512.hash(tarball, &sha512, .{});
        var integrity_buf: [88]u8 = undefined;
        _ = std.base64.standard.Encoder.encode(&integrity_buf, &sha512);

        // Build tarball URL
        const encoded_name = try urlEncodePackageName(self.allocator, package_name);
        defer self.allocator.free(encoded_name);

        const tarball_basename = if (std.mem.indexOf(u8, package_name, "/")) |idx|
            package_name[idx + 1 ..]
        else
            package_name;

        // Build the version object from package.json (includes all fields npm needs:
        // types, exports, module, dependencies, bin, etc.)
        var version_obj = std.ArrayList(u8).empty;
        defer version_obj.deinit(self.allocator);

        if (self.package_json) |pkg_json| {
            // Use the full package.json as the version object base,
            // then inject _id and dist fields.
            // Find the last '}' and insert our fields before it.
            const last_brace = std.mem.lastIndexOf(u8, pkg_json, "}") orelse
                return error.InvalidPackageJson;

            try version_obj.appendSlice(self.allocator, pkg_json[0..last_brace]);
            // Add _id and dist fields
            const dist_fields = try std.fmt.allocPrint(
                self.allocator,
                \\,"_id":"{s}@{s}","dist":{{"integrity":"sha512-{s}","shasum":"{s}","tarball":"{s}/{s}/-/{s}-{s}.tgz"}}}}
            ,
                .{
                    package_name,      version,
                    &integrity_buf,    &shasum_buf,
                    self.registry_url, encoded_name,
                    tarball_basename,  version,
                },
            );
            defer self.allocator.free(dist_fields);
            try version_obj.appendSlice(self.allocator, dist_fields);
        } else {
            // Fallback: minimal version object (legacy behavior)
            const minimal = try std.fmt.allocPrint(
                self.allocator,
                \\{{"_id":"{s}@{s}","name":"{s}","version":"{s}","dist":{{"integrity":"sha512-{s}","shasum":"{s}","tarball":"{s}/{s}/-/{s}-{s}.tgz"}}}}
            ,
                .{
                    package_name,      version,
                    package_name,      version,
                    &integrity_buf,    &shasum_buf,
                    self.registry_url, encoded_name,
                    tarball_basename,  version,
                },
            );
            defer self.allocator.free(minimal);
            try version_obj.appendSlice(self.allocator, minimal);
        }

        // Build sigstore attachment section if we have a Sigstore bundle
        var sigstore_attachment = std.ArrayList(u8).empty;
        defer sigstore_attachment.deinit(self.allocator);

        if (sigstore_bundle) |bundle| {
            const media_type: []const u8 = mt_blk: {
                const bundle_parsed = std.json.parseFromSlice(std.json.Value, self.allocator, bundle, .{}) catch
                    break :mt_blk try self.allocator.dupe(u8, "application/vnd.dev.sigstore.bundle.v0.3+json");
                defer bundle_parsed.deinit();
                if (bundle_parsed.value == .object) {
                    if (bundle_parsed.value.object.get("mediaType")) |mt| {
                        if (mt == .string) {
                            break :mt_blk try self.allocator.dupe(u8, mt.string);
                        }
                    }
                }
                break :mt_blk try self.allocator.dupe(u8, "application/vnd.dev.sigstore.bundle.v0.3+json");
            };
            defer self.allocator.free(media_type);

            const escaped_bundle = try jsonEscapeAlloc(self.allocator, bundle);
            defer self.allocator.free(escaped_bundle);

            const attachment_json = try std.fmt.allocPrint(
                self.allocator,
                \\,
                \\    "{s}-{s}.sigstore": {{
                \\      "content_type": "{s}",
                \\      "data": "{s}",
                \\      "length": {d}
                \\    }}
            ,
                .{ package_name, version, media_type, escaped_bundle, bundle.len },
            );
            defer self.allocator.free(attachment_json);
            try sigstore_attachment.appendSlice(self.allocator, attachment_json);
        }

        // Create JSON metadata (NPM registry format)
        // The version object contains the full package.json + _id + dist
        const escaped_publish_tag = try jsonEscapeAlloc(self.allocator, self.publish_tag);
        defer self.allocator.free(escaped_publish_tag);
        const escaped_publish_access = try jsonEscapeAlloc(self.allocator, self.publish_access);
        defer self.allocator.free(escaped_publish_access);
        const metadata = try std.fmt.allocPrint(
            self.allocator,
            \\{{
            \\  "_id": "{s}",
            \\  "name": "{s}",
            \\  "dist-tags": {{
            \\    "{s}": "{s}"
            \\  }},
            \\  "versions": {{
            \\    "{s}": {s}
            \\  }},
            \\  "access": "{s}",
            \\  "_attachments": {{
            \\    "{s}-{s}.tgz": {{
            \\      "content_type": "application/octet-stream",
            \\      "data": "{s}",
            \\      "length": {d}
            \\    }}{s}
            \\  }}
            \\}}
        ,
            .{
                package_name, // _id
                package_name, // name
                escaped_publish_tag, // dist-tag name
                version, // dist-tags.latest
                version, // versions key
                version_obj.items, // full version object (package.json + _id + dist)
                escaped_publish_access, // npm package access
                package_name, version, // _attachments key (tgz) — must use full scoped name like npm CLI
                encoded_tarball, // _attachments data (tgz)
                tarball.len, // _attachments length (tgz)
                sigstore_attachment.items, // sigstore attachment (or empty)
            },
        );

        return metadata;
    }
};

test "npm publish metadata applies resolved access and dist-tag" {
    var client = try RegistryClient.init(std.testing.allocator, "https://registry.npmjs.org");
    defer client.deinit();
    client.publish_access = "restricted";
    client.publish_tag = "next";

    const metadata = try client.createPackageMetadata("@example/pkg", "1.2.3", "tgz");
    defer std.testing.allocator.free(metadata);

    const parsed = try std.json.parseFromSlice(std.json.Value, std.testing.allocator, metadata, .{});
    defer parsed.deinit();

    try std.testing.expectEqualStrings("restricted", parsed.value.object.get("access").?.string);
    const dist_tags = parsed.value.object.get("dist-tags").?.object;
    try std.testing.expectEqualStrings("1.2.3", dist_tags.get("next").?.string);
    try std.testing.expect(dist_tags.get("latest") == null);
}

/// Response from registry publish operation
pub const PublishResponse = struct {
    success: bool,
    status_code: u16,
    message: ?[]const u8 = null,
    /// The upload was never made: the failure came first (an OIDC token npm
    /// would not exchange), so the version cannot have landed and there is
    /// nothing to wait for.
    not_sent: bool = false,
    /// Detailed error information for debugging
    error_details: ?ErrorDetails = null,
    /// Server-suggested retry delay in seconds (from `retry_after` field of
    /// 429 / 503 response bodies, or the HTTP `Retry-After` header). Null
    /// when the server didn't tell us how long to wait.
    retry_after_seconds: ?u32 = null,

    pub const ErrorDetails = struct {
        /// Error code from registry (e.g., "E403", "ENEEDAUTH")
        code: ?[]const u8 = null,
        /// Human-readable error summary
        summary: ?[]const u8 = null,
        /// Suggested action to fix the error
        suggestion: ?[]const u8 = null,

        pub fn deinit(self: *ErrorDetails, allocator: std.mem.Allocator) void {
            if (self.code) |c| allocator.free(c);
            if (self.summary) |s| allocator.free(s);
            if (self.suggestion) |sg| allocator.free(sg);
        }
    };

    pub fn deinit(self: *PublishResponse, allocator: std.mem.Allocator) void {
        if (self.message) |msg| {
            allocator.free(msg);
        }
        if (self.error_details) |*ed| {
            ed.deinit(allocator);
        }
    }

    /// Get a human-readable error description
    pub fn getErrorDescription(self: *const PublishResponse) []const u8 {
        if (self.success) return "Success";

        return switch (self.status_code) {
            400 => "Bad Request: The package metadata is malformed or invalid",
            401 => "Unauthorized: Authentication failed - check your OIDC token or credentials",
            403 => "Forbidden: You don't have permission to publish this package",
            404 => "Not Found: The package or registry endpoint doesn't exist",
            409 => "Conflict: This version already exists - bump the version number",
            413 => "Payload Too Large: The package tarball exceeds the size limit",
            422 => "Unprocessable Entity: The package failed validation",
            429 => "Too Many Requests: Rate limited - wait before retrying",
            500 => "Internal Server Error: Registry is experiencing issues",
            502 => "Bad Gateway: Registry proxy error",
            503 => "Service Unavailable: Registry is temporarily unavailable",
            else => "Unknown error occurred",
        };
    }

    /// Check if the error is retryable
    pub fn isRetryable(self: *const PublishResponse) bool {
        return switch (self.status_code) {
            408, 429, 500, 502, 503, 504 => true,
            else => false,
        };
    }
};

/// Registry operation errors with detailed information
pub const RegistryError = error{
    /// Network connectivity issues
    NetworkError,
    /// Authentication failed
    AuthenticationFailed,
    /// Authorization denied
    AuthorizationDenied,
    /// Package not found
    PackageNotFound,
    /// Version conflict
    VersionConflict,
    /// Rate limited
    RateLimited,
    /// Registry temporarily unavailable
    ServiceUnavailable,
    /// Invalid response from registry
    InvalidResponse,
    /// Response too large
    ResponseTooLarge,
    /// Generic registry error
    RegistryError,
};

/// Parse error details from NPM registry JSON response
/// npm responses vary in format:
///   {"error": "Forbidden", "message": "Package name too similar..."}
///   {"error": "Package name too similar to existing package..."}
///   {"error": "code E403", "reason": "..."}
///   Plain text error body (non-JSON)
/// Parse `retry_after` (in seconds) from a 429 / 503 response body.
/// Cloudflare's edge rate-limit (error 1015) returns a JSON body containing
/// `"retry_after": <seconds>`. We honor that value when scheduling retries
/// instead of using a fixed exponential backoff that may be too short.
fn parseRetryAfter(body: []const u8) ?u32 {
    // Quick bail: keys we don't expect to find → don't even parse
    if (std.mem.indexOf(u8, body, "retry_after") == null) return null;

    // Use a fixed buffer so this is allocation-free in the hot path.
    var buf: [16 * 1024]u8 = undefined;
    var fba = std.heap.FixedBufferAllocator.init(&buf);
    const parsed = std.json.parseFromSlice(
        std.json.Value,
        fba.allocator(),
        body,
        .{},
    ) catch return null;
    defer parsed.deinit();
    if (parsed.value != .object) return null;
    const v = parsed.value.object.get("retry_after") orelse return null;
    return switch (v) {
        .integer => |i| if (i > 0 and i < std.math.maxInt(u32)) @intCast(i) else null,
        .float => |f| if (f > 0 and f < std.math.maxInt(u32)) @intFromFloat(f) else null,
        else => null,
    };
}

fn parseErrorDetails(allocator: std.mem.Allocator, body: []const u8) ?PublishResponse.ErrorDetails {
    const parsed = std.json.parseFromSlice(
        std.json.Value,
        allocator,
        body,
        .{},
    ) catch {
        // Non-JSON body — treat the whole body as the error summary
        if (body.len > 0 and body.len < 2048) {
            return PublishResponse.ErrorDetails{
                .summary = allocator.dupe(u8, body) catch null,
            };
        }
        return null;
    };
    defer parsed.deinit();

    if (parsed.value != .object) return null;
    const obj = parsed.value.object;

    var details = PublishResponse.ErrorDetails{};

    // Extract explicit "code" field (e.g., "E403", "EOTP", "EPUBLISHCONFLICT")
    if (obj.get("code")) |code_val| {
        if (code_val == .string) {
            details.code = allocator.dupe(u8, code_val.string) catch null;
        }
    }

    // Extract "error" field — may be a short code or a full message
    var error_str: ?[]const u8 = null;
    if (obj.get("error")) |err_val| {
        if (err_val == .string) {
            error_str = err_val.string;

            // Check for version conflict
            if (std.mem.indexOf(u8, err_val.string, "cannot publish over the previously published version") != null or
                std.mem.indexOf(u8, err_val.string, "Cannot publish over previously published version") != null)
            {
                details.code = allocator.dupe(u8, "EPUBLISHCONFLICT") catch null;
                details.summary = allocator.dupe(u8, err_val.string) catch null;
                details.suggestion = allocator.dupe(u8, "Bump the version in package.json before publishing. Use 'npm version patch/minor/major' or edit manually.") catch null;
                return details;
            }

            // If no explicit code yet, and this looks like a short code, use it as code
            if (details.code == null and err_val.string.len <= 20) {
                details.code = allocator.dupe(u8, err_val.string) catch null;
            }
        }
    }

    // Extract summary from "message" field (preferred)
    if (obj.get("message")) |msg_val| {
        if (msg_val == .string and msg_val.string.len > 0) {
            details.summary = allocator.dupe(u8, msg_val.string) catch null;
        }
    }

    // Fallback: try "reason" field
    if (details.summary == null) {
        if (obj.get("reason")) |reason_val| {
            if (reason_val == .string and reason_val.string.len > 0) {
                details.summary = allocator.dupe(u8, reason_val.string) catch null;
            }
        }
    }

    // Fallback: use "error" field as summary if we still don't have one
    if (details.summary == null) {
        if (error_str) |err_s| {
            if (err_s.len > 0) {
                details.summary = allocator.dupe(u8, err_s) catch null;
            }
        }
    }

    // Check if we got any useful info
    if (details.code != null or details.summary != null) {
        return details;
    }

    return null;
}

/// Registry configuration
pub const RegistryConfig = struct {
    /// Registry URL (e.g., "https://registry.npmjs.org")
    url: []const u8,

    /// Registry name (e.g., "npm", "pantry")
    name: []const u8,

    /// Whether OIDC is supported
    oidc_supported: bool = true,

    /// Whether traditional token auth is supported
    token_auth_supported: bool = true,

    pub fn deinit(self: *RegistryConfig, allocator: std.mem.Allocator) void {
        allocator.free(self.url);
        allocator.free(self.name);
    }
};

/// Default registry configurations
pub const DefaultRegistries = struct {
    pub fn npm(allocator: std.mem.Allocator) !RegistryConfig {
        return RegistryConfig{
            .url = try allocator.dupe(u8, "https://registry.npmjs.org"),
            .name = try allocator.dupe(u8, "npm"),
            .oidc_supported = true,
            .token_auth_supported = true,
        };
    }

    pub fn pantry(allocator: std.mem.Allocator, url: ?[]const u8) !RegistryConfig {
        const registry_url = url orelse "https://registry.pantry.dev";
        return RegistryConfig{
            .url = try allocator.dupe(u8, registry_url),
            .name = try allocator.dupe(u8, "pantry"),
            .oidc_supported = true,
            .token_auth_supported = true,
        };
    }
};
