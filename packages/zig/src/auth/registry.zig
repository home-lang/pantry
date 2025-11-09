const std = @import("std");
const http = std.http;
const oidc = @import("oidc.zig");

/// Registry client for publishing packages
pub const RegistryClient = struct {
    allocator: std.mem.Allocator,
    registry_url: []const u8,
    http_client: http.Client,

    pub fn init(allocator: std.mem.Allocator, registry_url: []const u8) RegistryClient {
        return RegistryClient{
            .allocator = allocator,
            .registry_url = registry_url,
            .http_client = http.Client{ .allocator = allocator },
        };
    }

    pub fn deinit(self: *RegistryClient) void {
        self.http_client.deinit();
    }

    /// Publish package using OIDC authentication
    pub fn publishWithOIDC(
        self: *RegistryClient,
        package_name: []const u8,
        version: []const u8,
        tarball_path: []const u8,
        token: *const oidc.OIDCToken,
    ) !PublishResponse {
        _ = package_name;
        _ = version;
        _ = tarball_path;
        _ = token;

        // TODO: Implement HTTP client for OIDC publishing
        // This requires updating to match Zig 0.15's HTTP client API
        // For now, return a success response for testing purposes
        return PublishResponse{
            .success = false,
            .status_code = 501, // Not Implemented
            .message = try self.allocator.dupe(u8, "OIDC publishing not yet implemented - HTTP client needs Zig 0.15 API update"),
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
        _ = package_name;
        _ = version;
        _ = tarball_path;
        _ = auth_token;

        // TODO: Implement HTTP client for token-based publishing
        // This requires updating to match Zig 0.15's HTTP client API
        return PublishResponse{
            .success = false,
            .status_code = 501,
            .message = try self.allocator.dupe(u8, "Token-based publishing not yet implemented - HTTP client needs Zig 0.15 API update"),
        };
    }

    /// Add trusted publisher to package
    pub fn addTrustedPublisher(
        self: *RegistryClient,
        package_name: []const u8,
        publisher: *const oidc.TrustedPublisher,
        auth_token: []const u8,
    ) !void {
        _ = self;
        _ = package_name;
        _ = publisher;
        _ = auth_token;

        // TODO: Implement HTTP client for adding trusted publishers
        // This requires updating to match Zig 0.15's HTTP client API
        return error.NetworkError;
    }

    /// List trusted publishers for a package
    pub fn listTrustedPublishers(
        self: *RegistryClient,
        package_name: []const u8,
        auth_token: []const u8,
    ) ![]oidc.TrustedPublisher {
        _ = self;
        _ = package_name;
        _ = auth_token;

        // TODO: Implement HTTP client for listing trusted publishers
        // This requires updating to match Zig 0.15's HTTP client API
        return error.NetworkError;
    }

    /// Remove trusted publisher from package
    pub fn removeTrustedPublisher(
        self: *RegistryClient,
        package_name: []const u8,
        publisher_id: []const u8,
        auth_token: []const u8,
    ) !void {
        _ = self;
        _ = package_name;
        _ = publisher_id;
        _ = auth_token;

        // TODO: Implement HTTP client for removing trusted publishers
        // This requires updating to match Zig 0.15's HTTP client API
        return error.NetworkError;
    }

    // Private helper methods

    fn createPackageMetadata(
        self: *RegistryClient,
        package_name: []const u8,
        version: []const u8,
        tarball: []const u8,
    ) ![]const u8 {
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

    fn parsePublishResponse(self: *RegistryClient, req: *http.Client.Request) !PublishResponse {
        const status = req.response.status;

        const body = try req.reader().readAllAlloc(self.allocator, 1024 * 1024);
        defer self.allocator.free(body);

        return PublishResponse{
            .success = status == .ok or status == .created,
            .status_code = @intFromEnum(status),
            .message = if (body.len > 0) try self.allocator.dupe(u8, body) else null,
        };
    }

    fn serializeTrustedPublisher(self: *RegistryClient, publisher: *const oidc.TrustedPublisher) ![]const u8 {
        // Build allowed_refs array
        var refs_json = std.ArrayList(u8).init(self.allocator);
        defer refs_json.deinit();

        if (publisher.allowed_refs) |refs| {
            try refs_json.appendSlice("[");
            for (refs, 0..) |ref, i| {
                if (i > 0) try refs_json.appendSlice(", ");
                try refs_json.appendSlice("\"");
                try refs_json.appendSlice(ref);
                try refs_json.appendSlice("\"");
            }
            try refs_json.appendSlice("]");
        } else {
            try refs_json.appendSlice("null");
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
        var publishers = std.ArrayList(oidc.TrustedPublisher).init(self.allocator);

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

            try publishers.append(oidc.TrustedPublisher{
                .type = try self.allocator.dupe(u8, publisher_type.string),
                .owner = try self.allocator.dupe(u8, owner.string),
                .repository = try self.allocator.dupe(u8, repository.string),
                .workflow = workflow,
                .environment = environment,
                .allowed_refs = allowed_refs,
            });
        }

        return publishers.toOwnedSlice();
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
        const registry_url = url orelse "https://registry.pantry.sh";
        return RegistryConfig{
            .url = try allocator.dupe(u8, registry_url),
            .name = try allocator.dupe(u8, "pantry"),
            .oidc_supported = true,
            .token_auth_supported = true,
        };
    }
};
