const std = @import("std");
const http = std.http;
const oidc = @import("oidc.zig");

/// Registry client for publishing packages
pub const RegistryClient = struct {
    allocator: std.mem.Allocator,
    registry_url: []const u8,
    http_client: http.Client,

    io: std.Io.Threaded,

    pub fn init(allocator: std.mem.Allocator, registry_url: []const u8) RegistryClient {
        var io = std.Io.Threaded.init(allocator);
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
    }

    /// Publish package using OIDC authentication
    pub fn publishWithOIDC(
        self: *RegistryClient,
        package_name: []const u8,
        version: []const u8,
        tarball_path: []const u8,
        token: *const oidc.OIDCToken,
    ) !PublishResponse {
        // Construct registry URL for package publish
        const url = try std.fmt.allocPrint(
            self.allocator,
            "{s}/{s}",
            .{ self.registry_url, package_name },
        );
        defer self.allocator.free(url);

        // Read tarball
        const tarball = try std.fs.cwd().readFileAlloc(
            tarball_path,
            self.allocator,
            std.Io.Limit.limited(100 * 1024 * 1024), // 100 MB max
        );
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

        // Create extra headers
        const extra_headers = [_]http.Header{
            .{ .name = "Authorization", .value = auth_header },
            .{ .name = "Content-Type", .value = "application/json" },
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

        const message = if (body.len > 0)
            try self.allocator.dupe(u8, body)
        else
            null;

        return PublishResponse{
            .success = response.head.status == .ok or response.head.status == .created,
            .status_code = @intFromEnum(response.head.status),
            .message = message,
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
        const url = try std.fmt.allocPrint(
            self.allocator,
            "{s}/{s}",
            .{ self.registry_url, package_name },
        );
        defer self.allocator.free(url);

        // Read tarball
        const tarball = try std.fs.cwd().readFileAlloc(
            tarball_path,
            self.allocator,
            std.Io.Limit.limited(100 * 1024 * 1024),
        );
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

        // Create extra headers
        const extra_headers = [_]http.Header{
            .{ .name = "Authorization", .value = auth_header },
            .{ .name = "Content-Type", .value = "application/json" },
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

        const message = if (body.len > 0)
            try self.allocator.dupe(u8, body)
        else
            null;

        return PublishResponse{
            .success = response.head.status == .ok or response.head.status == .created,
            .status_code = @intFromEnum(response.head.status),
            .message = message,
        };
    }

    /// Add trusted publisher to package
    pub fn addTrustedPublisher(
        self: *RegistryClient,
        package_name: []const u8,
        publisher: *const oidc.TrustedPublisher,
        auth_token: []const u8,
    ) !void {
        const url = try std.fmt.allocPrint(
            self.allocator,
            "{s}/{s}/-/oidc/publishers",
            .{ self.registry_url, package_name },
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
        const url = try std.fmt.allocPrint(
            self.allocator,
            "{s}/{s}/-/oidc/publishers",
            .{ self.registry_url, package_name },
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
        const url = try std.fmt.allocPrint(
            self.allocator,
            "{s}/{s}/-/oidc/publishers/{s}",
            .{ self.registry_url, package_name, publisher_id },
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

        // Calculate SHA integrity
        var sha256: [32]u8 = undefined;
        std.crypto.hash.sha2.Sha256.hash(tarball, &sha256, .{});

        // Convert to hex string
        const hex_chars = "0123456789abcdef";
        var integrity_buf: [64]u8 = undefined;
        for (sha256, 0..) |byte, i| {
            integrity_buf[i * 2] = hex_chars[byte >> 4];
            integrity_buf[i * 2 + 1] = hex_chars[byte & 0x0F];
        }
        const integrity = try self.allocator.dupe(u8, &integrity_buf);

        // Create JSON metadata (NPM registry format)
        const metadata = try std.fmt.allocPrint(
            self.allocator,
            \\{{
            \\  "_id": "{s}",
            \\  "name": "{s}",
            \\  "version": "{s}",
            \\  "_attachments": {{
            \\    "{s}-{s}.tgz": {{
            \\      "content_type": "application/octet-stream",
            \\      "data": "{s}",
            \\      "length": {d}
            \\    }}
            \\  }},
            \\  "dist": {{
            \\    "shasum": "{s}"
            \\  }}
            \\}}
        ,
            .{
                package_name,
                package_name,
                version,
                package_name,
                version,
                encoded_tarball,
                tarball.len,
                integrity,
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
                if (publisher.workflow) |w| try std.fmt.allocPrint(self.allocator, "\"{s}\"", .{w}) else "null",
                if (publisher.environment) |e| try std.fmt.allocPrint(self.allocator, "\"{s}\"", .{e}) else "null",
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

    pub fn deinit(self: *PublishResponse, allocator: std.mem.Allocator) void {
        if (self.message) |msg| {
            allocator.free(msg);
        }
    }
};

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
