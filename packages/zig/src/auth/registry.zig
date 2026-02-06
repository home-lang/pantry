const std = @import("std");
const io_helper = @import("../io_helper.zig");
const http = std.http;
const oidc = @import("oidc.zig");
const style = @import("../cli/style.zig");

/// Decompress gzip data if it looks like gzip (starts with magic bytes 0x1f 0x8b)
/// Returns a copy of the data if not gzip, or the decompressed data if it is
fn maybeDecompressGzip(allocator: std.mem.Allocator, data: []const u8) ![]const u8 {
    // Check for gzip magic bytes
    if (data.len >= 2 and data[0] == 0x1f and data[1] == 0x8b) {
        // It's gzip compressed - use gunzip to decompress
        // Write to temp file, decompress, read result
        const tmp_dir = io_helper.getTempDir();
        var tmp_gz_buf: [std.fs.max_path_bytes]u8 = undefined;
        const tmp_gz = std.fmt.bufPrint(&tmp_gz_buf, "{s}/pantry_resp.gz", .{tmp_dir}) catch {
            return try allocator.dupe(u8, data);
        };

        // Write compressed data to temp file
        const gz_file = io_helper.createFile(tmp_gz, .{}) catch {
            return try allocator.dupe(u8, data);
        };
        io_helper.writeAllToFile(gz_file, data) catch {
            io_helper.closeFile(gz_file);
            return try allocator.dupe(u8, data);
        };
        io_helper.closeFile(gz_file);

        // Run gunzip
        const result = io_helper.childRun(allocator, &.{ "gunzip", "-c", tmp_gz }) catch {
            io_helper.deleteFile(tmp_gz) catch {};
            return try allocator.dupe(u8, data);
        };
        defer allocator.free(result.stderr);

        // Clean up temp file
        io_helper.deleteFile(tmp_gz) catch {};

        if (result.term == .exited and result.term.exited == 0) {
            return result.stdout; // Already allocated
        }

        allocator.free(result.stdout);
        return try allocator.dupe(u8, data);
    }

    // Not gzip, return a copy
    return try allocator.dupe(u8, data);
}

/// URL-encode a package name for use in registry URLs
/// Scoped packages like "@scope/name" need special handling
/// npm expects the / to be encoded as %2F in the URL path
fn urlEncodePackageName(allocator: std.mem.Allocator, package_name: []const u8) ![]u8 {
    // npm registry expects scoped packages with / encoded as %2F
    // e.g., @scope/name -> @scope%2fname
    var encoded_len: usize = 0;
    for (package_name) |c| {
        encoded_len += switch (c) {
            '/' => 3, // %2F
            else => 1,
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
                result[i + 2] = 'f'; // lowercase per npm convention
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

    io: *std.Io.Threaded,

    pub fn init(allocator: std.mem.Allocator, registry_url: []const u8) !RegistryClient {
        // Heap-allocate Io.Threaded so http_client.io reference remains valid
        const io = try allocator.create(std.Io.Threaded);
        io.* = .init_single_threaded;
        return RegistryClient{
            .allocator = allocator,
            .registry_url = registry_url,
            .io = io,
            .http_client = http.Client{ .allocator = allocator, .io = io.io() },
        };
    }

    pub fn deinit(self: *RegistryClient) void {
        self.http_client.deinit();
        self.io.deinit();
        self.allocator.destroy(self.io);
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

        style.print("Publishing to URL: {s}\n", .{url});

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

        const success = response.head.status == .ok or response.head.status == .created;
        const status_code = @intFromEnum(response.head.status);

        const message = if (body.len > 0)
            try self.allocator.dupe(u8, body)
        else
            null;

        // Parse error details if publish failed
        const error_details = if (!success and body.len > 0)
            parseErrorDetails(self.allocator, body)
        else
            null;

        return PublishResponse{
            .success = success,
            .status_code = status_code,
            .message = message,
            .error_details = error_details,
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

        style.print("Exchanging OIDC token with npm registry for {s}...\n", .{package_name});
        style.print("Token exchange URL: {s}\n", .{url});

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
        const body = body_reader.allocRemaining(self.allocator, std.Io.Limit.limited(1024 * 1024)) catch |err| switch (err) {
            error.StreamTooLong => return error.ResponseTooLarge,
            else => |e| return e,
        };
        defer self.allocator.free(body);

        if (response.head.status != .ok and response.head.status != .created) {
            style.print("npm token exchange failed with status {d}: {s}\n", .{ @intFromEnum(response.head.status), body });
            return null;
        }

        // Parse JSON response to extract token
        const parsed = std.json.parseFromSlice(std.json.Value, self.allocator, body, .{}) catch {
            style.print("Failed to parse npm token response\n", .{});
            return null;
        };
        defer parsed.deinit();

        if (parsed.value.object.get("token")) |token_val| {
            if (token_val == .string) {
                style.print("✓ Received npm publish token\n", .{});
                return try self.allocator.dupe(u8, token_val.string);
            }
        }

        style.print("npm token response missing 'token' field: {s}\n", .{body});
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

        style.print("Publishing to URL: {s}\n", .{url});

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

        const success = response.head.status == .ok or response.head.status == .created;
        const status_code = @intFromEnum(response.head.status);

        const message = if (body.len > 0)
            try self.allocator.dupe(u8, body)
        else
            null;

        // Parse error details if publish failed
        const error_details = if (!success and body.len > 0)
            parseErrorDetails(self.allocator, body)
        else
            null;

        return PublishResponse{
            .success = success,
            .status_code = status_code,
            .message = message,
            .error_details = error_details,
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

        style.print("Publishing to URL (token): {s}\n", .{url});

        // Read tarball using io_helper (blocking std.fs API)
        const tarball = try io_helper.readFileAlloc(self.allocator, tarball_path, 100 * 1024 * 1024);
        defer self.allocator.free(tarball);

        // Create package metadata
        const metadata = try self.createPackageMetadata(package_name, version, tarball);
        defer self.allocator.free(metadata);

        // Parse URI
        const uri = try std.Uri.parse(url);

        // Create authorization header
        const auth_header = try std.fmt.allocPrint(
            self.allocator,
            "Bearer {s}",
            .{auth_token},
        );
        defer self.allocator.free(auth_header);

        // Create extra headers (npm requires specific headers)
        // Accept-Encoding: identity prevents gzip responses we can't decode
        const extra_headers = [_]http.Header{
            .{ .name = "Authorization", .value = auth_header },
            .{ .name = "Content-Type", .value = "application/json" },
            .{ .name = "Accept", .value = "application/json" },
            .{ .name = "Accept-Encoding", .value = "identity" },
            .{ .name = "User-Agent", .value = "pantry/0.1.0" },
            .{ .name = "npm-command", .value = "publish" },
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

        const success = response.head.status == .ok or response.head.status == .created;
        const status_code = @intFromEnum(response.head.status);

        const message = if (body.len > 0)
            try self.allocator.dupe(u8, body)
        else
            null;

        // Parse error details if publish failed
        const error_details = if (!success and body.len > 0)
            parseErrorDetails(self.allocator, body)
        else
            null;

        return PublishResponse{
            .success = success,
            .status_code = status_code,
            .message = message,
            .error_details = error_details,
        };
    }

    /// Add trusted publisher to package
    pub fn addTrustedPublisher(
        self: *RegistryClient,
        package_name: []const u8,
        publisher: *const oidc.TrustedPublisher,
        auth_token: []const u8,
    ) !void {
        // URL-encode package name for scoped packages
        const encoded_name = try urlEncodePackageName(self.allocator, package_name);
        defer self.allocator.free(encoded_name);

        const url = try std.fmt.allocPrint(
            self.allocator,
            "{s}/{s}/-/oidc/publishers",
            .{ self.registry_url, encoded_name },
        );
        defer self.allocator.free(url);

        // Create publisher configuration JSON
        const publisher_json = try self.serializeTrustedPublisher(publisher);
        defer self.allocator.free(publisher_json);

        // Parse URI
        const uri = try std.Uri.parse(url);

        // Create authorization header
        const auth_header = try std.fmt.allocPrint(
            self.allocator,
            "Bearer {s}",
            .{auth_token},
        );
        defer self.allocator.free(auth_header);

        // Create headers
        const extra_headers = [_]http.Header{
            .{ .name = "Authorization", .value = auth_header },
            .{ .name = "Content-Type", .value = "application/json" },
        };

        // Make HTTP request
        var req = try self.http_client.request(.POST, uri, .{
            .extra_headers = &extra_headers,
        });
        defer req.deinit();

        req.transfer_encoding = .{ .content_length = publisher_json.len };
        try req.sendBodyComplete(@constCast(publisher_json));

        var redirect_buffer: [4096]u8 = undefined;
        const response = try req.receiveHead(&redirect_buffer);

        if (response.head.status != .ok and response.head.status != .created) {
            return error.RegistryError;
        }
    }

    /// List trusted publishers for a package
    pub fn listTrustedPublishers(
        self: *RegistryClient,
        package_name: []const u8,
        auth_token: []const u8,
    ) ![]oidc.TrustedPublisher {
        // URL-encode package name for scoped packages
        const encoded_name = try urlEncodePackageName(self.allocator, package_name);
        defer self.allocator.free(encoded_name);

        const url = try std.fmt.allocPrint(
            self.allocator,
            "{s}/{s}/-/oidc/publishers",
            .{ self.registry_url, encoded_name },
        );
        defer self.allocator.free(url);

        // Parse URI
        const uri = try std.Uri.parse(url);

        // Create authorization header
        const auth_header = try std.fmt.allocPrint(
            self.allocator,
            "Bearer {s}",
            .{auth_token},
        );
        defer self.allocator.free(auth_header);

        // Create headers
        const extra_headers = [_]http.Header{
            .{ .name = "Authorization", .value = auth_header },
        };

        // Make HTTP request
        var req = try self.http_client.request(.GET, uri, .{
            .extra_headers = &extra_headers,
        });
        defer req.deinit();

        try req.sendBodiless();

        var redirect_buffer: [4096]u8 = undefined;
        var response = try req.receiveHead(&redirect_buffer);

        if (response.head.status != .ok) {
            return error.RegistryError;
        }

        // Read response body
        const body_reader = response.reader(&.{});
        const body = body_reader.allocRemaining(self.allocator, std.Io.Limit.limited(1024 * 1024)) catch |err| switch (err) {
            error.StreamTooLong => return error.ResponseTooLarge,
            else => |e| return e,
        };
        defer self.allocator.free(body);

        // Parse publishers from JSON
        return try self.parsePublishersResponse(body);
    }

    /// Remove trusted publisher from package
    pub fn removeTrustedPublisher(
        self: *RegistryClient,
        package_name: []const u8,
        publisher_id: []const u8,
        auth_token: []const u8,
    ) !void {
        // URL-encode package name for scoped packages
        const encoded_name = try urlEncodePackageName(self.allocator, package_name);
        defer self.allocator.free(encoded_name);

        const url = try std.fmt.allocPrint(
            self.allocator,
            "{s}/{s}/-/oidc/publishers/{s}",
            .{ self.registry_url, encoded_name, publisher_id },
        );
        defer self.allocator.free(url);

        // Parse URI
        const uri = try std.Uri.parse(url);

        // Create authorization header
        const auth_header = try std.fmt.allocPrint(
            self.allocator,
            "Bearer {s}",
            .{auth_token},
        );
        defer self.allocator.free(auth_header);

        // Create headers
        const extra_headers = [_]http.Header{
            .{ .name = "Authorization", .value = auth_header },
        };

        // Make HTTP request
        var req = try self.http_client.request(.DELETE, uri, .{
            .extra_headers = &extra_headers,
        });
        defer req.deinit();

        try req.sendBodiless();

        var redirect_buffer: [4096]u8 = undefined;
        const response = try req.receiveHead(&redirect_buffer);

        if (response.head.status != .ok and response.head.status != .no_content) {
            return error.RegistryError;
        }
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
        const metadata = try std.fmt.allocPrint(
            self.allocator,
            \\{{
            \\  "_id": "{s}",
            \\  "name": "{s}",
            \\  "dist-tags": {{
            \\    "latest": "{s}"
            \\  }},
            \\  "versions": {{
            \\    "{s}": {s}
            \\  }},
            \\  "access": "public",
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
                version, // dist-tags.latest
                version, // versions key
                version_obj.items, // full version object (package.json + _id + dist)
                tarball_basename, version, // _attachments key (tgz)
                encoded_tarball, // _attachments data (tgz)
                tarball.len, // _attachments length (tgz)
                sigstore_attachment.items, // sigstore attachment (or empty)
            },
        );

        return metadata;
    }

    fn serializeTrustedPublisher(self: *RegistryClient, publisher: *const oidc.TrustedPublisher) ![]u8 {
        // Build allowed_refs array
        var refs_json = std.ArrayList(u8){};
        defer refs_json.deinit(self.allocator);

        if (publisher.allowed_refs) |refs| {
            try refs_json.appendSlice(self.allocator, "[");
            for (refs, 0..) |ref, i| {
                if (i > 0) try refs_json.appendSlice(self.allocator, ", ");
                try refs_json.appendSlice(self.allocator, "\"");
                try refs_json.appendSlice(self.allocator, ref);
                try refs_json.appendSlice(self.allocator, "\"");
            }
            try refs_json.appendSlice(self.allocator, "]");
        } else {
            try refs_json.appendSlice(self.allocator, "null");
        }

        // Build workflow and environment strings, tracking allocations for cleanup
        const workflow_str: []const u8 = if (publisher.workflow) |w|
            try std.fmt.allocPrint(self.allocator, "\"{s}\"", .{w})
        else
            "null";
        defer if (publisher.workflow != null) self.allocator.free(workflow_str);

        const environment_str: []const u8 = if (publisher.environment) |e|
            try std.fmt.allocPrint(self.allocator, "\"{s}\"", .{e})
        else
            "null";
        defer if (publisher.environment != null) self.allocator.free(environment_str);

        const json = try std.fmt.allocPrint(
            self.allocator,
            \\{{
            \\  "type": "{s}",
            \\  "owner": "{s}",
            \\  "repository": "{s}",
            \\  "workflow": {s},
            \\  "environment": {s},
            \\  "allowed_refs": {s}
            \\}}
        ,
            .{
                publisher.type,
                publisher.owner,
                publisher.repository,
                workflow_str,
                environment_str,
                refs_json.items,
            },
        );

        return json;
    }

    fn parsePublishersResponse(self: *RegistryClient, body: []const u8) ![]oidc.TrustedPublisher {
        const parsed = try std.json.parseFromSlice(
            std.json.Value,
            self.allocator,
            body,
            .{},
        );
        defer parsed.deinit();

        const publishers_array = parsed.value.array;
        var publishers = std.ArrayList(oidc.TrustedPublisher){};

        for (publishers_array.items) |item| {
            const obj = item.object;

            const publisher_type = obj.get("type") orelse continue;
            const owner = obj.get("owner") orelse continue;
            const repository = obj.get("repository") orelse continue;

            const workflow = if (obj.get("workflow")) |w| if (w != .null) try self.allocator.dupe(u8, w.string) else null else null;
            const environment = if (obj.get("environment")) |e| if (e != .null) try self.allocator.dupe(u8, e.string) else null else null;

            var allowed_refs: ?[][]const u8 = null;
            if (obj.get("allowed_refs")) |refs_value| {
                if (refs_value != .null) {
                    const refs_array = refs_value.array;
                    const refs = try self.allocator.alloc([]const u8, refs_array.items.len);
                    for (refs_array.items, 0..) |ref, i| {
                        refs[i] = try self.allocator.dupe(u8, ref.string);
                    }
                    allowed_refs = refs;
                }
            }

            try publishers.append(self.allocator, oidc.TrustedPublisher{
                .type = try self.allocator.dupe(u8, publisher_type.string),
                .owner = try self.allocator.dupe(u8, owner.string),
                .repository = try self.allocator.dupe(u8, repository.string),
                .workflow = workflow,
                .environment = environment,
                .allowed_refs = allowed_refs,
            });
        }

        return publishers.toOwnedSlice(self.allocator);
    }
};

/// Response from registry publish operation
pub const PublishResponse = struct {
    success: bool,
    status_code: u16,
    message: ?[]const u8 = null,
    /// Detailed error information for debugging
    error_details: ?ErrorDetails = null,

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
fn parseErrorDetails(allocator: std.mem.Allocator, body: []const u8) ?PublishResponse.ErrorDetails {
    const parsed = std.json.parseFromSlice(
        std.json.Value,
        allocator,
        body,
        .{},
    ) catch return null;
    defer parsed.deinit();

    if (parsed.value != .object) return null;
    const obj = parsed.value.object;

    var details = PublishResponse.ErrorDetails{};

    // npm returns error messages in the "error" field
    if (obj.get("error")) |err_val| {
        if (err_val == .string) {
            const err_str = err_val.string;

            // Check for version conflict (trying to republish existing version)
            if (std.mem.indexOf(u8, err_str, "cannot publish over the previously published version") != null or
                std.mem.indexOf(u8, err_str, "Cannot publish over previously published version") != null)
            {
                details.code = allocator.dupe(u8, "EPUBLISHCONFLICT") catch null;
                details.summary = allocator.dupe(u8, err_str) catch null;
                details.suggestion = allocator.dupe(u8, "Bump the version in package.json before publishing. Use 'npm version patch/minor/major' or edit manually.") catch null;
                return details;
            }

            details.code = allocator.dupe(u8, err_str) catch null;
        }
    }

    if (obj.get("message")) |msg_val| {
        if (msg_val == .string) {
            details.summary = allocator.dupe(u8, msg_val.string) catch null;
        }
    }

    if (obj.get("reason")) |reason_val| {
        if (reason_val == .string) {
            details.summary = allocator.dupe(u8, reason_val.string) catch null;
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
