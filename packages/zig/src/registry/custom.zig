const std = @import("std");
const core = @import("core.zig");
const http = std.http;

/// Custom HTTP Registry implementation
/// Follows a simple REST API convention:
/// GET  /packages/{name}          - Get package metadata
/// GET  /packages/{name}/{version} - Get specific version metadata
/// GET  /packages/{name}/{version}/tarball - Download tarball
/// GET  /search?q={query}         - Search packages
/// POST /packages                 - Publish package
pub const CustomRegistry = struct {
    allocator: std.mem.Allocator,
    config: core.RegistryConfig,
    http_client: http.Client,

    pub fn init(allocator: std.mem.Allocator, config: core.RegistryConfig) !CustomRegistry {
        return .{
            .allocator = allocator,
            .config = config,
            .http_client = http.Client{ .allocator = allocator },
        };
    }

    pub fn deinit(self: *CustomRegistry) void {
        self.http_client.deinit();
    }

    /// Fetch package metadata
    pub fn fetchMetadata(
        self: *CustomRegistry,
        allocator: std.mem.Allocator,
        package_name: []const u8,
        version: ?[]const u8,
    ) !core.PackageMetadata {
        // Build URL
        const url = if (version) |v|
            try std.fmt.allocPrint(allocator, "{s}/packages/{s}/{s}", .{ self.config.url, package_name, v })
        else
            try std.fmt.allocPrint(allocator, "{s}/packages/{s}", .{ self.config.url, package_name });
        defer allocator.free(url);

        // Make request with auth
        const response_body = try self.makeRequest(allocator, .GET, url, null);
        defer allocator.free(response_body);

        // Parse JSON response
        const parsed = try std.json.parseFromSlice(std.json.Value, allocator, response_body, .{});
        defer parsed.deinit();

        return try parseCustomPackageResponse(allocator, parsed.value);
    }

    /// Download package tarball
    pub fn downloadTarball(
        self: *CustomRegistry,
        allocator: std.mem.Allocator,
        package_name: []const u8,
        version: []const u8,
        dest_path: []const u8,
    ) !void {
        // Build tarball URL
        const url = try std.fmt.allocPrint(
            allocator,
            "{s}/packages/{s}/{s}/tarball",
            .{ self.config.url, package_name, version },
        );
        defer allocator.free(url);

        const uri = try std.Uri.parse(url);

        // Prepare auth headers
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

        // Write to file
        const file = try std.fs.cwd().createFile(dest_path, .{});
        defer file.close();

        const body_reader = response.reader(&.{});
        var buffer: [8192]u8 = undefined;
        while (true) {
            const bytes_read = try body_reader.read(&buffer);
            if (bytes_read == 0) break;
            try file.writeAll(buffer[0..bytes_read]);
        }
    }

    /// Search for packages
    pub fn search(
        self: *CustomRegistry,
        allocator: std.mem.Allocator,
        query: []const u8,
    ) ![]core.PackageMetadata {
        const url = try std.fmt.allocPrint(allocator, "{s}/search?q={s}", .{ self.config.url, query });
        defer allocator.free(url);

        const response_body = try self.makeRequest(allocator, .GET, url, null);
        defer allocator.free(response_body);

        const parsed = try std.json.parseFromSlice(std.json.Value, allocator, response_body, .{});
        defer parsed.deinit();

        return try parseCustomSearchResults(allocator, parsed.value);
    }

    /// List all versions
    pub fn listVersions(
        self: *CustomRegistry,
        allocator: std.mem.Allocator,
        package_name: []const u8,
    ) ![][]const u8 {
        const url = try std.fmt.allocPrint(allocator, "{s}/packages/{s}/versions", .{ self.config.url, package_name });
        defer allocator.free(url);

        const response_body = try self.makeRequest(allocator, .GET, url, null);
        defer allocator.free(response_body);

        const parsed = try std.json.parseFromSlice(std.json.Value, allocator, response_body, .{});
        defer parsed.deinit();

        return try parseCustomVersions(allocator, parsed.value);
    }

    /// Publish package
    pub fn publish(
        self: *CustomRegistry,
        allocator: std.mem.Allocator,
        metadata: *const core.PackageMetadata,
        tarball_path: []const u8,
    ) !void {
        // Read tarball file
        const tarball_data = try std.fs.cwd().readFileAlloc(tarball_path, allocator, std.Io.Limit.limited(100 * 1024 * 1024)); // 100MB max
        defer allocator.free(tarball_data);

        // Generate multipart boundary
        const boundary = "----PantryFormBoundary";

        // Build multipart/form-data body
        var body = std.ArrayList(u8){};
        defer body.deinit(allocator);

        const writer = body.writer(allocator);

        // Add metadata field
        try writer.print("--{s}\r\n", .{boundary});
        try writer.print("Content-Disposition: form-data; name=\"metadata\"\r\n", .{});
        try writer.print("Content-Type: application/json\r\n\r\n", .{});

        // Serialize metadata to JSON
        var metadata_json = std.ArrayList(u8){};
        defer metadata_json.deinit(allocator);
        const json_writer = metadata_json.writer(allocator);

        try json_writer.print("{{", .{});
        try json_writer.print("\"name\":\"{s}\",", .{metadata.name});
        try json_writer.print("\"version\":\"{s}\"", .{metadata.version});
        if (metadata.description) |desc| {
            try json_writer.print(",\"description\":\"{s}\"", .{desc});
        }
        try json_writer.print("}}", .{});

        try writer.print("{s}\r\n", .{metadata_json.items});

        // Add tarball file field
        try writer.print("--{s}\r\n", .{boundary});
        try writer.print("Content-Disposition: form-data; name=\"tarball\"; filename=\"{s}-{s}.tgz\"\r\n", .{ metadata.name, metadata.version });
        try writer.print("Content-Type: application/gzip\r\n\r\n", .{});
        try writer.writeAll(tarball_data);
        try writer.print("\r\n", .{});

        // End boundary
        try writer.print("--{s}--\r\n", .{boundary});

        const multipart_body = try body.toOwnedSlice(allocator);
        defer allocator.free(multipart_body);

        // Construct publish URL
        const publish_url = try std.fmt.allocPrint(
            allocator,
            "{s}/publish",
            .{self.registry_url},
        );
        defer allocator.free(publish_url);

        // Make request with multipart content type
        const uri = try std.Uri.parse(publish_url);

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

        if (self.auth_token) |token| {
            const auth_header = try std.fmt.allocPrint(allocator, "Bearer {s}", .{token});
            defer allocator.free(auth_header);
            headers_buf[headers_count] = .{ .name = "Authorization", .value = auth_header };
            headers_count += 1;
        }

        var client = http.Client{ .allocator = allocator };
        defer client.deinit();

        var request_headers = http.Headers.init(allocator);
        defer request_headers.deinit();

        for (headers_buf[0..headers_count]) |header| {
            try request_headers.append(header.name, header.value);
        }

        var req = try client.open(.POST, uri, request_headers, .{});
        defer req.deinit();

        req.transfer_encoding = .{ .content_length = multipart_body.len };
        try req.send(.{});
        try req.writeAll(multipart_body);
        try req.finish();

        try req.wait();

        if (req.response.status != .ok and req.response.status != .created) {
            return error.PublishFailed;
        }
    }

    /// Make HTTP request with authentication
    fn makeRequest(
        self: *CustomRegistry,
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

        if (response.head.status != .ok) {
            return error.RequestFailed;
        }

        const body_reader = response.reader(&.{});
        return try body_reader.allocRemaining(allocator, std.Io.Limit.limited(10 * 1024 * 1024));
    }

    /// Build authentication headers
    fn buildAuthHeaders(self: *CustomRegistry, buffer: []http.Header) ![]http.Header {
        var count: usize = 0;

        switch (self.config.auth) {
            .bearer => |token| {
                const auth_value = try std.fmt.allocPrint(self.allocator, "Bearer {s}", .{token});
                buffer[count] = .{ .name = "Authorization", .value = auth_value };
                count += 1;
            },
            .basic => |creds| {
                // Encode username:password in base64
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
    pub fn interface(self: *CustomRegistry) core.RegistryInterface {
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
        const self: *CustomRegistry = @ptrCast(@alignCast(ptr));
        return self.fetchMetadata(allocator, package_name, version);
    }

    fn downloadTarballVTable(
        ptr: *anyopaque,
        allocator: std.mem.Allocator,
        package_name: []const u8,
        version: []const u8,
        dest_path: []const u8,
    ) anyerror!void {
        const self: *CustomRegistry = @ptrCast(@alignCast(ptr));
        return self.downloadTarball(allocator, package_name, version, dest_path);
    }

    fn searchVTable(
        ptr: *anyopaque,
        allocator: std.mem.Allocator,
        query: []const u8,
    ) anyerror![]core.PackageMetadata {
        const self: *CustomRegistry = @ptrCast(@alignCast(ptr));
        return self.search(allocator, query);
    }

    fn listVersionsVTable(
        ptr: *anyopaque,
        allocator: std.mem.Allocator,
        package_name: []const u8,
    ) anyerror![][]const u8 {
        const self: *CustomRegistry = @ptrCast(@alignCast(ptr));
        return self.listVersions(allocator, package_name);
    }

    fn publishVTable(
        ptr: *anyopaque,
        allocator: std.mem.Allocator,
        metadata: *const core.PackageMetadata,
        tarball_path: []const u8,
    ) anyerror!void {
        const self: *CustomRegistry = @ptrCast(@alignCast(ptr));
        return self.publish(allocator, metadata, tarball_path);
    }

    fn deinitVTable(ptr: *anyopaque) void {
        const self: *CustomRegistry = @ptrCast(@alignCast(ptr));
        self.deinit();
    }
};

/// Parse custom registry package response
/// Expected format:
/// {
///   "name": "package-name",
///   "version": "1.0.0",
///   "description": "...",
///   "tarballUrl": "https://...",
///   "checksum": "sha256:..."
/// }
fn parseCustomPackageResponse(allocator: std.mem.Allocator, json: std.json.Value) !core.PackageMetadata {
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

/// Parse search results
/// Expected format:
/// {
///   "results": [
///     {"name": "...", "version": "...", "description": "..."},
///     ...
///   ]
/// }
fn parseCustomSearchResults(allocator: std.mem.Allocator, json: std.json.Value) ![]core.PackageMetadata {
    if (json != .object) return error.InvalidResponse;

    const obj = json.object;
    const results = obj.get("results") orelse return error.NoResults;

    if (results != .array) return error.InvalidResponse;

    var packages = std.ArrayList(core.PackageMetadata).init(allocator);
    errdefer {
        for (packages.items) |*pkg| {
            pkg.deinit(allocator);
        }
        packages.deinit();
    }

    for (results.array.items) |item| {
        const pkg = parseCustomPackageResponse(allocator, item) catch continue;
        try packages.append(pkg);
    }

    return packages.toOwnedSlice();
}

/// Parse versions list
/// Expected format:
/// {
///   "versions": ["1.0.0", "1.0.1", "1.1.0", ...]
/// }
fn parseCustomVersions(allocator: std.mem.Allocator, json: std.json.Value) ![][]const u8 {
    if (json != .object) return error.InvalidResponse;

    const obj = json.object;
    const versions = obj.get("versions") orelse return error.NoVersions;

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
