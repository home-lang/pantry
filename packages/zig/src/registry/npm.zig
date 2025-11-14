const std = @import("std");
const core = @import("core.zig");
const http = std.http;

/// NPM Registry implementation
pub const NpmRegistry = struct {
    allocator: std.mem.Allocator,
    config: core.RegistryConfig,
    http_client: http.Client,

    pub fn init(allocator: std.mem.Allocator, config: core.RegistryConfig) !NpmRegistry {
        return .{
            .allocator = allocator,
            .config = config,
            .http_client = http.Client{ .allocator = allocator },
        };
    }

    pub fn deinit(self: *NpmRegistry) void {
        self.http_client.deinit();
    }

    /// Fetch package metadata from npm registry
    pub fn fetchMetadata(
        self: *NpmRegistry,
        allocator: std.mem.Allocator,
        package_name: []const u8,
        version: ?[]const u8,
    ) !core.PackageMetadata {
        // Build URL: https://registry.npmjs.org/{package}
        const url = if (version) |v|
            try std.fmt.allocPrint(allocator, "{s}/{s}/{s}", .{ self.config.url, package_name, v })
        else
            try std.fmt.allocPrint(allocator, "{s}/{s}", .{ self.config.url, package_name });
        defer allocator.free(url);

        // Parse URI
        const uri = try std.Uri.parse(url);

        // Prepare auth headers
        var headers_buf: [4]http.Header = undefined;
        var headers_count: usize = 0;

        // Add authorization if configured
        switch (self.config.auth) {
            .bearer => |token| {
                const auth_value = try std.fmt.allocPrint(allocator, "Bearer {s}", .{token});
                defer allocator.free(auth_value);
                headers_buf[headers_count] = .{ .name = "Authorization", .value = auth_value };
                headers_count += 1;
            },
            else => {},
        }

        // Make HTTP request
        var req = try self.http_client.request(.GET, uri, .{
            .extra_headers = headers_buf[0..headers_count],
        });
        defer req.deinit();

        try req.sendBodiless();

        var redirect_buffer: [4096]u8 = undefined;
        var response = try req.receiveHead(&redirect_buffer);

        if (response.head.status != .ok) {
            return error.PackageNotFound;
        }

        // Read response body
        const body_reader = response.reader(&.{});
        const body = try body_reader.allocRemaining(allocator, std.Io.Limit.limited(10 * 1024 * 1024));
        defer allocator.free(body);

        // Parse JSON response
        const parsed = try std.json.parseFromSlice(std.json.Value, allocator, body, .{});
        defer parsed.deinit();

        return try parseNpmPackageJson(allocator, parsed.value, version);
    }

    /// Download package tarball
    pub fn downloadTarball(
        self: *NpmRegistry,
        allocator: std.mem.Allocator,
        package_name: []const u8,
        version: []const u8,
        dest_path: []const u8,
    ) !void {
        // First, get metadata to find tarball URL
        const metadata = try self.fetchMetadata(allocator, package_name, version);
        defer {
            var mut_metadata = metadata;
            mut_metadata.deinit(allocator);
        }

        const tarball_url = metadata.tarball_url orelse return error.NoTarballUrl;

        // Download tarball
        const uri = try std.Uri.parse(tarball_url);

        var req = try self.http_client.request(.GET, uri, .{});
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
        self: *NpmRegistry,
        allocator: std.mem.Allocator,
        query: []const u8,
    ) ![]core.PackageMetadata {
        // NPM search API: https://registry.npmjs.org/-/v1/search?text=query
        const url = try std.fmt.allocPrint(
            allocator,
            "{s}/-/v1/search?text={s}&size=20",
            .{ self.config.url, query },
        );
        defer allocator.free(url);

        const uri = try std.Uri.parse(url);

        var req = try self.http_client.request(.GET, uri, .{});
        defer req.deinit();

        try req.sendBodiless();

        var redirect_buffer: [4096]u8 = undefined;
        var response = try req.receiveHead(&redirect_buffer);

        if (response.head.status != .ok) {
            return error.SearchFailed;
        }

        const body_reader = response.reader(&.{});
        const body = try body_reader.allocRemaining(allocator, std.Io.Limit.limited(10 * 1024 * 1024));
        defer allocator.free(body);

        const parsed = try std.json.parseFromSlice(std.json.Value, allocator, body, .{});
        defer parsed.deinit();

        return try parseNpmSearchResults(allocator, parsed.value);
    }

    /// List all versions of a package
    pub fn listVersions(
        self: *NpmRegistry,
        allocator: std.mem.Allocator,
        package_name: []const u8,
    ) ![][]const u8 {
        const url = try std.fmt.allocPrint(allocator, "{s}/{s}", .{ self.config.url, package_name });
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
        const body = try body_reader.allocRemaining(allocator, std.Io.Limit.limited(10 * 1024 * 1024));
        defer allocator.free(body);

        const parsed = try std.json.parseFromSlice(std.json.Value, allocator, body, .{});
        defer parsed.deinit();

        return try parseNpmVersions(allocator, parsed.value);
    }

    /// Publish a package to npm registry
    pub fn publish(
        self: *NpmRegistry,
        allocator: std.mem.Allocator,
        metadata: *const core.PackageMetadata,
        tarball_path: []const u8,
    ) !void {
        _ = self;
        _ = allocator;
        _ = metadata;
        _ = tarball_path;
        // TODO: Implement npm publish
        return error.NotImplemented;
    }

    /// Create registry interface
    pub fn interface(self: *NpmRegistry) core.RegistryInterface {
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
        const self: *NpmRegistry = @ptrCast(@alignCast(ptr));
        return self.fetchMetadata(allocator, package_name, version);
    }

    fn downloadTarballVTable(
        ptr: *anyopaque,
        allocator: std.mem.Allocator,
        package_name: []const u8,
        version: []const u8,
        dest_path: []const u8,
    ) anyerror!void {
        const self: *NpmRegistry = @ptrCast(@alignCast(ptr));
        return self.downloadTarball(allocator, package_name, version, dest_path);
    }

    fn searchVTable(
        ptr: *anyopaque,
        allocator: std.mem.Allocator,
        query: []const u8,
    ) anyerror![]core.PackageMetadata {
        const self: *NpmRegistry = @ptrCast(@alignCast(ptr));
        return self.search(allocator, query);
    }

    fn listVersionsVTable(
        ptr: *anyopaque,
        allocator: std.mem.Allocator,
        package_name: []const u8,
    ) anyerror![][]const u8 {
        const self: *NpmRegistry = @ptrCast(@alignCast(ptr));
        return self.listVersions(allocator, package_name);
    }

    fn publishVTable(
        ptr: *anyopaque,
        allocator: std.mem.Allocator,
        metadata: *const core.PackageMetadata,
        tarball_path: []const u8,
    ) anyerror!void {
        const self: *NpmRegistry = @ptrCast(@alignCast(ptr));
        return self.publish(allocator, metadata, tarball_path);
    }

    fn deinitVTable(ptr: *anyopaque) void {
        const self: *NpmRegistry = @ptrCast(@alignCast(ptr));
        self.deinit();
    }
};

/// Parse npm package.json response
fn parseNpmPackageJson(
    allocator: std.mem.Allocator,
    json: std.json.Value,
    version: ?[]const u8,
) !core.PackageMetadata {
    if (json != .object) return error.InvalidResponse;

    const obj = json.object;

    // If specific version requested, get from versions object
    if (version) |v| {
        const versions = obj.get("versions") orelse return error.VersionNotFound;
        if (versions != .object) return error.InvalidResponse;

        const version_obj = versions.object.get(v) orelse return error.VersionNotFound;
        if (version_obj != .object) return error.InvalidResponse;

        return parseVersionObject(allocator, version_obj.object);
    }

    // Otherwise, get latest version from dist-tags
    const dist_tags = obj.get("dist-tags");
    const latest_version = if (dist_tags) |tags| blk: {
        if (tags != .object) break :blk null;
        const latest = tags.object.get("latest");
        if (latest) |l| {
            if (l == .string) break :blk l.string;
        }
        break :blk null;
    } else null;

    if (latest_version) |v| {
        const versions = obj.get("versions") orelse return error.NoVersions;
        if (versions != .object) return error.InvalidResponse;

        const version_obj = versions.object.get(v) orelse return error.VersionNotFound;
        if (version_obj != .object) return error.InvalidResponse;

        return parseVersionObject(allocator, version_obj.object);
    }

    return error.NoLatestVersion;
}

/// Parse version object from npm response
fn parseVersionObject(allocator: std.mem.Allocator, obj: std.json.ObjectMap) !core.PackageMetadata {
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

    const homepage = if (obj.get("homepage")) |h|
        if (h == .string) try allocator.dupe(u8, h.string) else null
    else
        null;

    const license = if (obj.get("license")) |l|
        if (l == .string) try allocator.dupe(u8, l.string) else null
    else
        null;

    // Get tarball URL from dist
    var tarball_url: ?[]const u8 = null;
    var checksum: ?[]const u8 = null;

    if (obj.get("dist")) |dist| {
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
        .homepage = homepage,
        .license = license,
        .tarball_url = tarball_url,
        .checksum = checksum,
        .dependencies = null,
        .dev_dependencies = null,
    };
}

/// Parse npm search results
fn parseNpmSearchResults(allocator: std.mem.Allocator, json: std.json.Value) ![]core.PackageMetadata {
    if (json != .object) return error.InvalidResponse;

    const obj = json.object;
    const objects = obj.get("objects") orelse return error.NoResults;

    if (objects != .array) return error.InvalidResponse;

    var results = std.ArrayList(core.PackageMetadata).init(allocator);
    errdefer {
        for (results.items) |*item| {
            item.deinit(allocator);
        }
        results.deinit();
    }

    for (objects.array.items) |item| {
        if (item != .object) continue;

        const package = item.object.get("package") orelse continue;
        if (package != .object) continue;

        const pkg_obj = package.object;

        const name = if (pkg_obj.get("name")) |n|
            if (n == .string) try allocator.dupe(u8, n.string) else continue
        else
            continue;

        const version = if (pkg_obj.get("version")) |v|
            if (v == .string) try allocator.dupe(u8, v.string) else "latest"
        else
            "latest";

        const description = if (pkg_obj.get("description")) |d|
            if (d == .string) try allocator.dupe(u8, d.string) else null
        else
            null;

        try results.append(core.PackageMetadata{
            .name = name,
            .version = try allocator.dupe(u8, version),
            .description = description,
            .repository = null,
            .homepage = null,
            .license = null,
            .tarball_url = null,
            .checksum = null,
            .dependencies = null,
            .dev_dependencies = null,
        });
    }

    return results.toOwnedSlice();
}

/// Parse versions from npm package response
fn parseNpmVersions(allocator: std.mem.Allocator, json: std.json.Value) ![][]const u8 {
    if (json != .object) return error.InvalidResponse;

    const obj = json.object;
    const versions = obj.get("versions") orelse return error.NoVersions;

    if (versions != .object) return error.InvalidResponse;

    var results = std.ArrayList([]const u8).init(allocator);
    errdefer {
        for (results.items) |item| {
            allocator.free(item);
        }
        results.deinit();
    }

    var it = versions.object.iterator();
    while (it.next()) |entry| {
        try results.append(try allocator.dupe(u8, entry.key_ptr.*));
    }

    return results.toOwnedSlice();
}
