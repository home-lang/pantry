const std = @import("std");
const io_helper = @import("../io_helper.zig");
const core = @import("core.zig");
const npm = @import("npm.zig");
const http = std.http;

/// Pantry Registry implementation
/// The official Pantry package registry with npm fallback support.
///
/// API endpoints:
/// GET  /packages/{name}              - Get package metadata
/// GET  /packages/{name}/{version}    - Get specific version
/// GET  /packages/{name}/{version}/tarball - Download tarball
/// GET  /packages/{name}/versions     - List all versions
/// GET  /search?q={query}             - Search packages
/// POST /publish                      - Publish package
///
/// If a package is not found in Pantry, it automatically falls back to npm.
pub const PantryRegistry = struct {
    allocator: std.mem.Allocator,
    config: core.RegistryConfig,
    http_client: http.Client,
    npm_fallback: bool = true,

    /// Default Pantry registry URL
    pub const DEFAULT_URL = "https://registry.stacksjs.com";

    /// npm registry URL for fallback
    pub const NPM_URL = "https://registry.npmjs.org";

    pub fn init(allocator: std.mem.Allocator, config: core.RegistryConfig) !PantryRegistry {
        return .{
            .allocator = allocator,
            .config = config,
            .http_client = http.Client{ .allocator = allocator },
            .npm_fallback = true,
        };
    }

    pub fn initWithDefaults(allocator: std.mem.Allocator) !PantryRegistry {
        const config = try core.RegistryConfig.pantry(allocator);
        return init(allocator, config);
    }

    pub fn deinit(self: *PantryRegistry) void {
        self.http_client.deinit();
    }

    /// Fetch package metadata (with npm fallback)
    pub fn fetchMetadata(
        self: *PantryRegistry,
        allocator: std.mem.Allocator,
        package_name: []const u8,
        version: ?[]const u8,
    ) !core.PackageMetadata {
        // Try Pantry registry first
        if (self.fetchFromPantry(allocator, package_name, version)) |metadata| {
            return metadata;
        } else |err| {
            // If not found and npm fallback is enabled, try npm
            if (self.npm_fallback and (err == error.PackageNotFound or err == error.RequestFailed)) {
                return self.fetchFromNpm(allocator, package_name, version);
            }
            return err;
        }
    }

    /// Fetch from Pantry registry
    fn fetchFromPantry(
        self: *PantryRegistry,
        allocator: std.mem.Allocator,
        package_name: []const u8,
        version: ?[]const u8,
    ) !core.PackageMetadata {
        const url = if (version) |v|
            try std.fmt.allocPrint(allocator, "{s}/packages/{s}/{s}", .{ self.config.url, package_name, v })
        else
            try std.fmt.allocPrint(allocator, "{s}/packages/{s}", .{ self.config.url, package_name });
        defer allocator.free(url);

        const response_body = try self.makeRequest(allocator, .GET, url, null);
        defer allocator.free(response_body);

        const parsed = try std.json.parseFromSlice(std.json.Value, allocator, response_body, .{});
        defer parsed.deinit();

        return try parsePantryPackageResponse(allocator, parsed.value);
    }

    /// Fetch from npm registry (fallback)
    fn fetchFromNpm(
        self: *PantryRegistry,
        allocator: std.mem.Allocator,
        package_name: []const u8,
        version: ?[]const u8,
    ) !core.PackageMetadata {
        const url = try std.fmt.allocPrint(allocator, "{s}/{s}", .{ NPM_URL, package_name });
        defer allocator.free(url);

        const uri = try std.Uri.parse(url);

        var req = try self.http_client.request(.GET, uri, .{});
        defer req.deinit();

        try req.sendBodiless();

        var redirect_buffer: [4096]u8 = undefined;
        var response = try req.receiveHead(&redirect_buffer);

        if (response.head.status != .ok) {
            return error.PackageNotFound;
        }

        const body_reader = response.reader(&.{});
        const response_body = try body_reader.allocRemaining(allocator, std.Io.Limit.limited(10 * 1024 * 1024));
        defer allocator.free(response_body);

        const parsed = try std.json.parseFromSlice(std.json.Value, allocator, response_body, .{});
        defer parsed.deinit();

        return try parseNpmPackageResponse(allocator, parsed.value, version);
    }

    /// Download package tarball (with npm fallback)
    pub fn downloadTarball(
        self: *PantryRegistry,
        allocator: std.mem.Allocator,
        package_name: []const u8,
        version: []const u8,
        dest_path: []const u8,
    ) !void {
        // Try Pantry first
        if (self.downloadFromPantry(allocator, package_name, version, dest_path)) {
            return;
        } else |err| {
            if (self.npm_fallback and (err == error.DownloadFailed or err == error.PackageNotFound)) {
                // Get tarball URL from npm metadata
                const metadata = try self.fetchFromNpm(allocator, package_name, version);
                defer {
                    var mut_metadata = metadata;
                    mut_metadata.deinit(allocator);
                }

                if (metadata.tarball_url) |tarball_url| {
                    return self.downloadFromUrl(allocator, tarball_url, dest_path);
                }
            }
            return err;
        }
    }

    /// Download from Pantry registry
    fn downloadFromPantry(
        self: *PantryRegistry,
        allocator: std.mem.Allocator,
        package_name: []const u8,
        version: []const u8,
        dest_path: []const u8,
    ) !void {
        const url = try std.fmt.allocPrint(
            allocator,
            "{s}/packages/{s}/{s}/tarball",
            .{ self.config.url, package_name, version },
        );
        defer allocator.free(url);

        return self.downloadFromUrl(allocator, url, dest_path);
    }

    /// Download from a specific URL
    fn downloadFromUrl(
        self: *PantryRegistry,
        allocator: std.mem.Allocator,
        url: []const u8,
        dest_path: []const u8,
    ) !void {
        _ = allocator;
        const uri = try std.Uri.parse(url);

        var headers_buf: [4]http.Header = undefined;
        const headers = try self.buildAuthHeaders(&headers_buf);

        var req = try self.http_client.request(.GET, uri, .{
            .extra_headers = headers,
        });
        defer req.deinit();

        try req.sendBodiless();

        var redirect_buffer: [4096]u8 = undefined;
        var response = try req.receiveHead(&redirect_buffer);

        if (response.head.status != .ok) {
            return error.DownloadFailed;
        }

        const file = try io_helper.cwd().createFile(io_helper.io, dest_path, .{});
        defer file.close(io_helper.io);

        const body_reader = response.reader(&.{});
        var buffer: [8192]u8 = undefined;
        while (true) {
            const bytes_read = try body_reader.read(&buffer);
            if (bytes_read == 0) break;
            try io_helper.writeAllToFile(file, buffer[0..bytes_read]);
        }
    }

    /// Search for packages
    pub fn search(
        self: *PantryRegistry,
        allocator: std.mem.Allocator,
        query: []const u8,
    ) ![]core.PackageMetadata {
        const url = try std.fmt.allocPrint(allocator, "{s}/search?q={s}", .{ self.config.url, query });
        defer allocator.free(url);

        const response_body = try self.makeRequest(allocator, .GET, url, null);
        defer allocator.free(response_body);

        const parsed = try std.json.parseFromSlice(std.json.Value, allocator, response_body, .{});
        defer parsed.deinit();

        return try parsePantrySearchResults(allocator, parsed.value);
    }

    /// List all versions
    pub fn listVersions(
        self: *PantryRegistry,
        allocator: std.mem.Allocator,
        package_name: []const u8,
    ) ![][]const u8 {
        const url = try std.fmt.allocPrint(allocator, "{s}/packages/{s}/versions", .{ self.config.url, package_name });
        defer allocator.free(url);

        const response_body = try self.makeRequest(allocator, .GET, url, null);
        defer allocator.free(response_body);

        const parsed = try std.json.parseFromSlice(std.json.Value, allocator, response_body, .{});
        defer parsed.deinit();

        return try parsePantryVersions(allocator, parsed.value);
    }

    /// Publish package to Pantry registry
    pub fn publish(
        self: *PantryRegistry,
        allocator: std.mem.Allocator,
        metadata: *const core.PackageMetadata,
        tarball_path: []const u8,
    ) !void {
        // Read tarball file
        const tarball_data = try io_helper.readFileAlloc(allocator, tarball_path, 100 * 1024 * 1024);
        defer allocator.free(tarball_data);

        // Generate multipart boundary
        const boundary = "----PantryFormBoundary";

        // Build multipart/form-data body
        var body = try std.ArrayList(u8).initCapacity(allocator, tarball_data.len + 1024);
        defer body.deinit(allocator);

        // Add metadata field
        try body.print(allocator, "--{s}\r\n", .{boundary});
        try body.print(allocator, "Content-Disposition: form-data; name=\"metadata\"\r\n", .{});
        try body.print(allocator, "Content-Type: application/json\r\n\r\n", .{});

        // Serialize metadata to JSON
        try body.print(allocator, "{{\"name\":\"{s}\",\"version\":\"{s}\"", .{ metadata.name, metadata.version });
        if (metadata.description) |desc| {
            try body.print(allocator, ",\"description\":\"{s}\"", .{desc});
        }
        if (metadata.license) |license| {
            try body.print(allocator, ",\"license\":\"{s}\"", .{license});
        }
        if (metadata.repository) |repo| {
            try body.print(allocator, ",\"repository\":\"{s}\"", .{repo});
        }
        if (metadata.homepage) |homepage| {
            try body.print(allocator, ",\"homepage\":\"{s}\"", .{homepage});
        }
        try body.print(allocator, "}}\r\n", .{});

        // Add tarball file field
        try body.print(allocator, "--{s}\r\n", .{boundary});
        try body.print(allocator, "Content-Disposition: form-data; name=\"tarball\"; filename=\"{s}-{s}.tgz\"\r\n", .{ metadata.name, metadata.version });
        try body.print(allocator, "Content-Type: application/gzip\r\n\r\n", .{});
        try body.appendSlice(allocator, tarball_data);
        try body.print(allocator, "\r\n", .{});

        // End boundary
        try body.print(allocator, "--{s}--\r\n", .{boundary});

        const multipart_body = try body.toOwnedSlice(allocator);
        defer allocator.free(multipart_body);

        // Construct publish URL
        const publish_url = try std.fmt.allocPrint(allocator, "{s}/publish", .{self.config.url});
        defer allocator.free(publish_url);

        const uri = try std.Uri.parse(publish_url);

        // Build headers
        var headers_buf: [4]http.Header = undefined;
        var headers_count: usize = 0;

        const content_type = try std.fmt.allocPrint(
            allocator,
            "multipart/form-data; boundary={s}",
            .{boundary},
        );
        defer allocator.free(content_type);

        headers_buf[headers_count] = .{ .name = "Content-Type", .value = content_type };
        headers_count += 1;

        // Add auth header if configured
        var auth_header: ?[]const u8 = null;
        defer if (auth_header) |h| allocator.free(h);

        switch (self.config.auth) {
            .bearer => |token| {
                auth_header = try std.fmt.allocPrint(allocator, "Bearer {s}", .{token});
                headers_buf[headers_count] = .{ .name = "Authorization", .value = auth_header.? };
                headers_count += 1;
            },
            .oidc => |token| {
                auth_header = try std.fmt.allocPrint(allocator, "Bearer {s}", .{token});
                headers_buf[headers_count] = .{ .name = "Authorization", .value = auth_header.? };
                headers_count += 1;
            },
            else => {},
        }

        var req = try self.http_client.request(.POST, uri, .{
            .extra_headers = headers_buf[0..headers_count],
        });
        defer req.deinit();

        try req.sendBody(multipart_body);

        var redirect_buffer: [4096]u8 = undefined;
        var response = try req.receiveHead(&redirect_buffer);

        if (response.head.status != .ok and response.head.status != .created) {
            return error.PublishFailed;
        }
    }

    /// Make HTTP request with authentication
    fn makeRequest(
        self: *PantryRegistry,
        allocator: std.mem.Allocator,
        method: http.Method,
        url: []const u8,
        body: ?[]const u8,
    ) ![]const u8 {
        const uri = try std.Uri.parse(url);

        var headers_buf: [4]http.Header = undefined;
        const headers = try self.buildAuthHeaders(&headers_buf);

        var req = try self.http_client.request(method, uri, .{
            .extra_headers = headers,
        });
        defer req.deinit();

        if (body) |b| {
            try req.sendBody(b);
        } else {
            try req.sendBodiless();
        }

        var redirect_buffer: [4096]u8 = undefined;
        var response = try req.receiveHead(&redirect_buffer);

        if (response.head.status == .not_found) {
            return error.PackageNotFound;
        }

        if (response.head.status != .ok) {
            return error.RequestFailed;
        }

        const body_reader = response.reader(&.{});
        return try body_reader.allocRemaining(allocator, std.Io.Limit.limited(10 * 1024 * 1024));
    }

    /// Build authentication headers
    fn buildAuthHeaders(self: *PantryRegistry, buffer: []http.Header) ![]http.Header {
        var count: usize = 0;

        switch (self.config.auth) {
            .bearer => |token| {
                const auth_value = try std.fmt.allocPrint(self.allocator, "Bearer {s}", .{token});
                buffer[count] = .{ .name = "Authorization", .value = auth_value };
                count += 1;
            },
            .oidc => |token| {
                const auth_value = try std.fmt.allocPrint(self.allocator, "Bearer {s}", .{token});
                buffer[count] = .{ .name = "Authorization", .value = auth_value };
                count += 1;
            },
            .basic => |creds| {
                const combined = try std.fmt.allocPrint(self.allocator, "{s}:{s}", .{ creds.username, creds.password });
                defer self.allocator.free(combined);

                const encoder = std.base64.standard.Encoder;
                const encoded_len = encoder.calcSize(combined.len);
                const encoded = try self.allocator.alloc(u8, encoded_len);
                _ = encoder.encode(encoded, combined);

                const auth_value = try std.fmt.allocPrint(self.allocator, "Basic {s}", .{encoded});
                self.allocator.free(encoded);

                buffer[count] = .{ .name = "Authorization", .value = auth_value };
                count += 1;
            },
            .custom => |header| {
                buffer[count] = .{ .name = header.name, .value = header.value };
                count += 1;
            },
            else => {},
        }

        return buffer[0..count];
    }

    /// Create registry interface
    pub fn interface(self: *PantryRegistry) core.RegistryInterface {
        return .{
            .ptr = self,
            .vtable = &.{
                .fetchMetadata = fetchMetadataVTable,
                .downloadTarball = downloadTarballVTable,
                .search = searchVTable,
                .listVersions = listVersionsVTable,
                .publish = publishVTable,
                .deinit = deinitVTable,
            },
        };
    }

    // VTable implementations
    fn fetchMetadataVTable(
        ptr: *anyopaque,
        allocator: std.mem.Allocator,
        package_name: []const u8,
        version: ?[]const u8,
    ) anyerror!core.PackageMetadata {
        const self: *PantryRegistry = @ptrCast(@alignCast(ptr));
        return self.fetchMetadata(allocator, package_name, version);
    }

    fn downloadTarballVTable(
        ptr: *anyopaque,
        allocator: std.mem.Allocator,
        package_name: []const u8,
        version: []const u8,
        dest_path: []const u8,
    ) anyerror!void {
        const self: *PantryRegistry = @ptrCast(@alignCast(ptr));
        return self.downloadTarball(allocator, package_name, version, dest_path);
    }

    fn searchVTable(
        ptr: *anyopaque,
        allocator: std.mem.Allocator,
        query: []const u8,
    ) anyerror![]core.PackageMetadata {
        const self: *PantryRegistry = @ptrCast(@alignCast(ptr));
        return self.search(allocator, query);
    }

    fn listVersionsVTable(
        ptr: *anyopaque,
        allocator: std.mem.Allocator,
        package_name: []const u8,
    ) anyerror![][]const u8 {
        const self: *PantryRegistry = @ptrCast(@alignCast(ptr));
        return self.listVersions(allocator, package_name);
    }

    fn publishVTable(
        ptr: *anyopaque,
        allocator: std.mem.Allocator,
        metadata: *const core.PackageMetadata,
        tarball_path: []const u8,
    ) anyerror!void {
        const self: *PantryRegistry = @ptrCast(@alignCast(ptr));
        return self.publish(allocator, metadata, tarball_path);
    }

    fn deinitVTable(ptr: *anyopaque) void {
        const self: *PantryRegistry = @ptrCast(@alignCast(ptr));
        self.deinit();
    }
};

/// Parse Pantry registry package response
fn parsePantryPackageResponse(allocator: std.mem.Allocator, json: std.json.Value) !core.PackageMetadata {
    if (json != .object) return error.InvalidResponse;

    const obj = json.object;

    const name = if (obj.get("name")) |n|
        if (n == .string) try allocator.dupe(u8, n.string) else return error.MissingName
    else
        return error.MissingName;

    const version = if (obj.get("version")) |v|
        if (v == .string) try allocator.dupe(u8, v.string) else return error.MissingVersion
    else
        return error.MissingVersion;

    const description = if (obj.get("description")) |d|
        if (d == .string) try allocator.dupe(u8, d.string) else null
    else
        null;

    const repository = if (obj.get("repository")) |r|
        if (r == .string) try allocator.dupe(u8, r.string) else null
    else
        null;

    const homepage = if (obj.get("homepage")) |h|
        if (h == .string) try allocator.dupe(u8, h.string) else null
    else
        null;

    const license = if (obj.get("license")) |l|
        if (l == .string) try allocator.dupe(u8, l.string) else null
    else
        null;

    const tarball_url = if (obj.get("tarballUrl")) |t|
        if (t == .string) try allocator.dupe(u8, t.string) else null
    else
        null;

    const checksum = if (obj.get("checksum")) |c|
        if (c == .string) try allocator.dupe(u8, c.string) else null
    else
        null;

    return core.PackageMetadata{
        .name = name,
        .version = version,
        .description = description,
        .repository = repository,
        .homepage = homepage,
        .license = license,
        .tarball_url = tarball_url,
        .checksum = checksum,
        .dependencies = null,
        .dev_dependencies = null,
    };
}

/// Parse npm registry package response (for fallback)
fn parseNpmPackageResponse(allocator: std.mem.Allocator, json: std.json.Value, requested_version: ?[]const u8) !core.PackageMetadata {
    if (json != .object) return error.InvalidResponse;

    const obj = json.object;

    const name = if (obj.get("name")) |n|
        if (n == .string) try allocator.dupe(u8, n.string) else return error.MissingName
    else
        return error.MissingName;

    // Get the specific version or latest
    const versions_obj = obj.get("versions") orelse return error.NoVersions;
    if (versions_obj != .object) return error.InvalidResponse;

    const version_to_use = requested_version orelse blk: {
        // Get dist-tags.latest
        if (obj.get("dist-tags")) |dist_tags| {
            if (dist_tags == .object) {
                if (dist_tags.object.get("latest")) |latest| {
                    if (latest == .string) {
                        break :blk latest.string;
                    }
                }
            }
        }
        return error.NoVersions;
    };

    const version_data = versions_obj.object.get(version_to_use) orelse return error.VersionNotFound;
    if (version_data != .object) return error.InvalidResponse;

    const version_obj = version_data.object;

    const version = try allocator.dupe(u8, version_to_use);

    const description = if (version_obj.get("description")) |d|
        if (d == .string) try allocator.dupe(u8, d.string) else null
    else
        null;

    const license = if (version_obj.get("license")) |l|
        if (l == .string) try allocator.dupe(u8, l.string) else null
    else
        null;

    var tarball_url: ?[]const u8 = null;
    var checksum: ?[]const u8 = null;

    if (version_obj.get("dist")) |dist| {
        if (dist == .object) {
            if (dist.object.get("tarball")) |t| {
                if (t == .string) {
                    tarball_url = try allocator.dupe(u8, t.string);
                }
            }
            if (dist.object.get("shasum")) |s| {
                if (s == .string) {
                    checksum = try allocator.dupe(u8, s.string);
                }
            }
        }
    }

    return core.PackageMetadata{
        .name = name,
        .version = version,
        .description = description,
        .repository = null,
        .homepage = null,
        .license = license,
        .tarball_url = tarball_url,
        .checksum = checksum,
        .dependencies = null,
        .dev_dependencies = null,
    };
}

/// Parse search results
fn parsePantrySearchResults(allocator: std.mem.Allocator, json: std.json.Value) ![]core.PackageMetadata {
    if (json != .object) return error.InvalidResponse;

    const obj = json.object;
    const results = obj.get("results") orelse return &[_]core.PackageMetadata{};

    if (results != .array) return error.InvalidResponse;

    var packages = std.ArrayList(core.PackageMetadata).init(allocator);
    errdefer {
        for (packages.items) |*pkg| {
            pkg.deinit(allocator);
        }
        packages.deinit();
    }

    for (results.array.items) |item| {
        const pkg = parsePantryPackageResponse(allocator, item) catch continue;
        try packages.append(pkg);
    }

    return packages.toOwnedSlice();
}

/// Parse versions list
fn parsePantryVersions(allocator: std.mem.Allocator, json: std.json.Value) ![][]const u8 {
    if (json != .object) return error.InvalidResponse;

    const obj = json.object;
    const versions = obj.get("versions") orelse return &[_][]const u8{};

    if (versions != .array) return error.InvalidResponse;

    var results = std.ArrayList([]const u8).init(allocator);
    errdefer {
        for (results.items) |item| {
            allocator.free(item);
        }
        results.deinit();
    }

    for (versions.array.items) |item| {
        if (item == .string) {
            try results.append(try allocator.dupe(u8, item.string));
        }
    }

    return results.toOwnedSlice();
}
