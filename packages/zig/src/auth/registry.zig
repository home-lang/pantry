const std = @import("std");
const io_helper = @import("../io_helper.zig");
const http = std.http;
const oidc = @import("oidc.zig");

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

/// Registry client for publishing packages
pub const RegistryClient = struct {
    allocator: std.mem.Allocator,
    registry_url: []const u8,
    http_client: http.Client,

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

        std.debug.print("Publishing to URL: {s}\n", .{url});

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
        const extra_headers = [_]http.Header{
            .{ .name = "Authorization", .value = auth_header },
            .{ .name = "Content-Type", .value = "application/json" },
            .{ .name = "Accept", .value = "application/json" },
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
        const body = body_reader.allocRemaining(self.allocator, std.Io.Limit.limited(1024 * 1024)) catch |err| switch (err) {
            error.StreamTooLong => return error.ResponseTooLarge,
            else => |e| return e,
        };
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

        std.debug.print("Publishing to URL: {s}\n", .{url});

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

        // Create authorization header
        const auth_header = try std.fmt.allocPrint(
            self.allocator,
            "Bearer {s}",
            .{token.raw_token},
        );
        defer self.allocator.free(auth_header);

        // Create extra headers (npm requires specific headers for OIDC provenance)
        // npm-auth-type: oidc tells npm this is OIDC authentication
        const extra_headers = [_]http.Header{
            .{ .name = "Authorization", .value = auth_header },
            .{ .name = "Content-Type", .value = "application/json" },
            .{ .name = "Accept", .value = "application/json" },
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
        const body = body_reader.allocRemaining(self.allocator, std.Io.Limit.limited(1024 * 1024)) catch |err| switch (err) {
            error.StreamTooLong => return error.ResponseTooLarge,
            else => |e| return e,
        };
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

        std.debug.print("Publishing to URL (token): {s}\n", .{url});

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
        const extra_headers = [_]http.Header{
            .{ .name = "Authorization", .value = auth_header },
            .{ .name = "Content-Type", .value = "application/json" },
            .{ .name = "Accept", .value = "application/json" },
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
        const body = body_reader.allocRemaining(self.allocator, std.Io.Limit.limited(1024 * 1024)) catch |err| switch (err) {
            error.StreamTooLong => return error.ResponseTooLarge,
            else => |e| return e,
        };
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
        var integrity_buf: [88]u8 = undefined; // base64 of 64 bytes
        const integrity_len = std.base64.standard.Encoder.encode(&integrity_buf, &sha512);
        _ = integrity_len;

        // Build tarball URL - for scoped packages, encode the / as %2f
        const encoded_name = try urlEncodePackageName(self.allocator, package_name);
        defer self.allocator.free(encoded_name);

        // npm tarball URLs use: registry/package/-/package-version.tgz
        // For scoped packages: registry/@scope%2fname/-/name-version.tgz
        // Extract just the package name part (after the scope) for the tarball filename
        const tarball_basename = if (std.mem.indexOf(u8, package_name, "/")) |idx|
            package_name[idx + 1 ..]
        else
            package_name;

        // Create JSON metadata (NPM registry format)
        const metadata = try std.fmt.allocPrint(
            self.allocator,
            \\{{
            \\  "_id": "{s}",
            \\  "name": "{s}",
            \\  "dist-tags": {{
            \\    "latest": "{s}"
            \\  }},
            \\  "versions": {{
            \\    "{s}": {{
            \\      "_id": "{s}@{s}",
            \\      "name": "{s}",
            \\      "version": "{s}",
            \\      "dist": {{
            \\        "integrity": "sha512-{s}",
            \\        "shasum": "{s}",
            \\        "tarball": "{s}/{s}/-/{s}-{s}.tgz"
            \\      }}
            \\    }}
            \\  }},
            \\  "access": "public",
            \\  "_attachments": {{
            \\    "{s}-{s}.tgz": {{
            \\      "content_type": "application/octet-stream",
            \\      "data": "{s}",
            \\      "length": {d}
            \\    }}
            \\  }}
            \\}}
        ,
            .{
                package_name, // _id
                package_name, // name
                version, // dist-tags.latest
                version, // versions key
                package_name, version, // versions[v]._id
                package_name, // versions[v].name
                version, // versions[v].version
                &integrity_buf, // dist.integrity
                &shasum_buf, // dist.shasum
                self.registry_url, encoded_name, // dist.tarball (registry/encoded_name)
                tarball_basename, version, // dist.tarball (/-/name-version.tgz)
                tarball_basename, version, // _attachments key
                encoded_tarball, // _attachments data
                tarball.len, // _attachments length
            },
        );

        return metadata;
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

        // Build tarball URL - for scoped packages, encode the / as %2f
        const encoded_name = try urlEncodePackageName(self.allocator, package_name);
        defer self.allocator.free(encoded_name);

        // Extract just the package name part (after the scope) for the tarball filename
        const tarball_basename = if (std.mem.indexOf(u8, package_name, "/")) |idx|
            package_name[idx + 1 ..]
        else
            package_name;

        // Build attestations section if we have a Sigstore bundle
        // npm expects attestations as an array under _attachments
        var attestations_section = std.ArrayList(u8).empty;
        defer attestations_section.deinit(self.allocator);

        if (sigstore_bundle) |bundle| {
            // npm expects attestations to be associated with the tarball attachment
            // The format is: attestations array with predicateType and bundle
            const attestation_json = try std.fmt.allocPrint(
                self.allocator,
                \\,
                \\  "_attestations": {{
                \\    "url": "/.well-known/npm/attestation/{s}@{s}",
                \\    "provenance": {{
                \\      "predicateType": "https://slsa.dev/provenance/v1",
                \\      "bundle": {s}
                \\    }}
                \\  }}
            ,
                .{ package_name, version, bundle },
            );
            defer self.allocator.free(attestation_json);
            try attestations_section.appendSlice(self.allocator, attestation_json);
        }

        // Create JSON metadata with provenance (NPM registry format)
        const metadata = try std.fmt.allocPrint(
            self.allocator,
            \\{{
            \\  "_id": "{s}",
            \\  "name": "{s}",
            \\  "dist-tags": {{
            \\    "latest": "{s}"
            \\  }},
            \\  "versions": {{
            \\    "{s}": {{
            \\      "_id": "{s}@{s}",
            \\      "name": "{s}",
            \\      "version": "{s}",
            \\      "dist": {{
            \\        "integrity": "sha512-{s}",
            \\        "shasum": "{s}",
            \\        "tarball": "{s}/{s}/-/{s}-{s}.tgz"
            \\      }}
            \\    }}
            \\  }},
            \\  "access": "public",
            \\  "_attachments": {{
            \\    "{s}-{s}.tgz": {{
            \\      "content_type": "application/octet-stream",
            \\      "data": "{s}",
            \\      "length": {d}
            \\    }}
            \\  }}{s}
            \\}}
        ,
            .{
                package_name, // _id
                package_name, // name
                version, // dist-tags.latest
                version, // versions key
                package_name, version, // versions[v]._id
                package_name, // versions[v].name
                version, // versions[v].version
                &integrity_buf, // dist.integrity
                &shasum_buf, // dist.shasum
                self.registry_url, encoded_name, // dist.tarball (registry/encoded_name)
                tarball_basename, version, // dist.tarball (/-/name-version.tgz)
                tarball_basename, version, // _attachments key
                encoded_tarball, // _attachments data
                tarball.len, // _attachments length
                attestations_section.items, // attestations section (or empty)
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

    if (obj.get("error")) |err_val| {
        if (err_val == .string) {
            details.code = allocator.dupe(u8, err_val.string) catch null;
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
