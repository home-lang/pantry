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
        // Read tarball file
        const tarball_data = try std.fs.cwd().readFileAlloc(tarball_path, allocator, std.Io.Limit.limited(100 * 1024 * 1024));
        defer allocator.free(tarball_data);

        // Base64 encode the tarball
        const base64_encoder = std.base64.standard.Encoder;
        const encoded_len = base64_encoder.calcSize(tarball_data.len);
        const encoded_tarball = try allocator.alloc(u8, encoded_len);
        defer allocator.free(encoded_tarball);
        _ = base64_encoder.encode(encoded_tarball, tarball_data);

        // Build npm publish payload
        // Format: https://github.com/npm/registry/blob/master/docs/REGISTRY-API.md#publishing
        var payload = std.json.ObjectMap.init(allocator);
        defer payload.deinit();

        // Package name and version
        try payload.put("_id", .{ .string = metadata.name });
        try payload.put("name", .{ .string = metadata.name });
        try payload.put("version", .{ .string = metadata.version });

        // Optional fields
        if (metadata.description) |desc| {
            try payload.put("description", .{ .string = desc });
        }
        if (metadata.homepage) |home| {
            try payload.put("homepage", .{ .string = home });
        }
        if (metadata.license) |lic| {
            try payload.put("license", .{ .string = lic });
        }
        if (metadata.repository) |repo| {
            var repo_obj = std.json.ObjectMap.init(allocator);
            try repo_obj.put("type", .{ .string = "git" });
            try repo_obj.put("url", .{ .string = repo });
            try payload.put("repository", .{ .object = repo_obj });
        }

        // Dependencies
        if (metadata.dependencies) |deps| {
            var deps_obj = std.json.ObjectMap.init(allocator);
            var it = deps.iterator();
            while (it.next()) |entry| {
                try deps_obj.put(entry.key_ptr.*, .{ .string = entry.value_ptr.* });
            }
            try payload.put("dependencies", .{ .object = deps_obj });
        }

        // Dev dependencies
        if (metadata.dev_dependencies) |devDeps| {
            var dev_deps_obj = std.json.ObjectMap.init(allocator);
            var it = devDeps.iterator();
            while (it.next()) |entry| {
                try dev_deps_obj.put(entry.key_ptr.*, .{ .string = entry.value_ptr.* });
            }
            try payload.put("devDependencies", .{ .object = dev_deps_obj });
        }

        // Add _attachments with the tarball
        var attachments = std.json.ObjectMap.init(allocator);
        const tarball_filename = try std.fmt.allocPrint(allocator, "{s}-{s}.tgz", .{ metadata.name, metadata.version });
        defer allocator.free(tarball_filename);

        var attachment = std.json.ObjectMap.init(allocator);
        try attachment.put("content_type", .{ .string = "application/octet-stream" });
        try attachment.put("data", .{ .string = encoded_tarball });
        try attachment.put("length", .{ .integer = @intCast(tarball_data.len) });

        try attachments.put(tarball_filename, .{ .object = attachment });
        try payload.put("_attachments", .{ .object = attachments });

        // Add dist-tags
        var dist_tags = std.json.ObjectMap.init(allocator);
        try dist_tags.put("latest", .{ .string = metadata.version });
        try payload.put("dist-tags", .{ .object = dist_tags });

        // Versions object
        var versions = std.json.ObjectMap.init(allocator);
        var version_obj = std.json.ObjectMap.init(allocator);
        try version_obj.put("name", .{ .string = metadata.name });
        try version_obj.put("version", .{ .string = metadata.version });
        if (metadata.description) |desc| {
            try version_obj.put("description", .{ .string = desc });
        }

        // Add dist info to version object
        var dist = std.json.ObjectMap.init(allocator);
        const shasum = if (metadata.checksum) |cs| cs else ""; // Should calculate if not provided
        try dist.put("shasum", .{ .string = shasum });
        try dist.put("tarball", .{ .string = tarball_filename });
        try version_obj.put("dist", .{ .object = dist });

        try versions.put(metadata.version, .{ .object = version_obj });
        try payload.put("versions", .{ .object = versions });

        // Serialize to JSON
        const json_bytes = try std.json.Stringify.valueAlloc(allocator, payload, .{});
        defer allocator.free(json_bytes);

        // Build URL for publishing
        const url = try std.fmt.allocPrint(allocator, "{s}/{s}", .{ self.config.url, metadata.name });
        defer allocator.free(url);

        const uri = try std.Uri.parse(url);

        // Prepare headers
        var headers_buf: [8]http.Header = undefined;
        var headers_count: usize = 0;

        // Content-Type
        headers_buf[headers_count] = .{ .name = "Content-Type", .value = "application/json" };
        headers_count += 1;

        // Authorization
        switch (self.config.auth) {
            .bearer => |token| {
                const auth_value = try std.fmt.allocPrint(allocator, "Bearer {s}", .{token});
                defer allocator.free(auth_value);
                headers_buf[headers_count] = .{ .name = "Authorization", .value = auth_value };
                headers_count += 1;
            },
            .oidc => |token| {
                const auth_value = try std.fmt.allocPrint(allocator, "Bearer {s}", .{token});
                defer allocator.free(auth_value);
                headers_buf[headers_count] = .{ .name = "Authorization", .value = auth_value };
                headers_count += 1;
            },
            .basic => |creds| {
                const auth_str = try std.fmt.allocPrint(allocator, "{s}:{s}", .{ creds.username, creds.password });
                defer allocator.free(auth_str);

                const base64_size = std.base64.standard.Encoder.calcSize(auth_str.len);
                const auth_encoded = try allocator.alloc(u8, base64_size);
                defer allocator.free(auth_encoded);
                _ = std.base64.standard.Encoder.encode(auth_encoded, auth_str);

                const auth_value = try std.fmt.allocPrint(allocator, "Basic {s}", .{auth_encoded});
                defer allocator.free(auth_value);
                headers_buf[headers_count] = .{ .name = "Authorization", .value = auth_value };
                headers_count += 1;
            },
            else => {
                return error.AuthenticationRequired;
            },
        }

        // Make PUT request
        var req = try self.http_client.request(.PUT, uri, .{
            .extra_headers = headers_buf[0..headers_count],
        });
        defer req.deinit();

        req.transfer_encoding = .{ .content_length = json_bytes.len };
        try req.send(.{});
        try req.writer().writeAll(json_bytes);
        try req.finish();

        var redirect_buffer: [4096]u8 = undefined;
        var response = try req.receiveHead(&redirect_buffer);

        // Check response status
        switch (response.head.status) {
            .ok, .created => {
                // Success
                return;
            },
            .unauthorized => return error.Unauthorized,
            .forbidden => return error.Forbidden,
            .conflict => return error.PackageAlreadyExists,
            else => {
                // Read error response for debugging
                const body_reader = response.reader(&.{});
                const error_body = body_reader.allocRemaining(allocator, std.Io.Limit.limited(10 * 1024)) catch "";
                defer allocator.free(error_body);

                std.debug.print("Publish failed with status {}: {s}\n", .{ response.head.status, error_body });
                return error.PublishFailed;
            },
        }
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

/// Semver constraint types for NPM version resolution
pub const SemverConstraint = struct {
    type: ConstraintType,
    major: u32,
    minor: u32,
    patch: u32,

    pub const ConstraintType = enum {
        exact, // 1.2.3
        caret, // ^1.2.3 - compatible with version
        tilde, // ~1.2.3 - approximately equivalent
        gte, // >=1.2.3
        lte, // <=1.2.3
        gt, // >1.2.3
        lt, // <1.2.3
        any, // * or latest
    };

    /// Parse a semver version string into major.minor.patch
    pub fn parseVersion(version: []const u8) !struct { major: u32, minor: u32, patch: u32 } {
        var clean_version = version;

        // Strip 'v' prefix if present
        if (std.mem.startsWith(u8, clean_version, "v")) {
            clean_version = clean_version[1..];
        }

        // Split by '.' and '-' (for pre-release versions)
        var parts = std.mem.splitAny(u8, clean_version, ".-+");

        const major_str = parts.next() orelse return error.InvalidVersion;
        const minor_str = parts.next() orelse "0";
        const patch_str = parts.next() orelse "0";

        const major = std.fmt.parseInt(u32, major_str, 10) catch return error.InvalidVersion;
        const minor = std.fmt.parseInt(u32, minor_str, 10) catch 0;
        const patch = std.fmt.parseInt(u32, patch_str, 10) catch 0;

        return .{ .major = major, .minor = minor, .patch = patch };
    }

    /// Parse a version constraint string like "^1.2.3" or ">=1.0.0"
    pub fn parse(constraint_str: []const u8) !SemverConstraint {
        var version_str = constraint_str;
        var constraint_type = ConstraintType.exact;

        // Handle special cases
        if (std.mem.eql(u8, constraint_str, "*") or
            std.mem.eql(u8, constraint_str, "latest") or
            constraint_str.len == 0)
        {
            return SemverConstraint{
                .type = .any,
                .major = 0,
                .minor = 0,
                .patch = 0,
            };
        }

        // Detect constraint type and strip prefix
        if (std.mem.startsWith(u8, version_str, "^")) {
            constraint_type = .caret;
            version_str = version_str[1..];
        } else if (std.mem.startsWith(u8, version_str, "~")) {
            constraint_type = .tilde;
            version_str = version_str[1..];
        } else if (std.mem.startsWith(u8, version_str, ">=")) {
            constraint_type = .gte;
            version_str = version_str[2..];
        } else if (std.mem.startsWith(u8, version_str, "<=")) {
            constraint_type = .lte;
            version_str = version_str[2..];
        } else if (std.mem.startsWith(u8, version_str, ">")) {
            constraint_type = .gt;
            version_str = version_str[1..];
        } else if (std.mem.startsWith(u8, version_str, "<")) {
            constraint_type = .lt;
            version_str = version_str[1..];
        } else if (std.mem.startsWith(u8, version_str, "=")) {
            constraint_type = .exact;
            version_str = version_str[1..];
        }

        const version = try parseVersion(version_str);

        return SemverConstraint{
            .type = constraint_type,
            .major = version.major,
            .minor = version.minor,
            .patch = version.patch,
        };
    }

    /// Check if a version satisfies this constraint
    pub fn satisfies(self: SemverConstraint, version_str: []const u8) bool {
        // Any constraint matches everything
        if (self.type == .any) return true;

        const version = parseVersion(version_str) catch return false;

        return switch (self.type) {
            .exact => version.major == self.major and
                version.minor == self.minor and
                version.patch == self.patch,

            // ^1.2.3 := >=1.2.3 <2.0.0
            .caret => blk: {
                if (self.major == 0) {
                    if (self.minor == 0) {
                        // ^0.0.x only matches exact patch
                        break :blk version.major == 0 and
                            version.minor == 0 and
                            version.patch == self.patch;
                    }
                    // ^0.x.y allows patch updates only
                    break :blk version.major == 0 and
                        version.minor == self.minor and
                        version.patch >= self.patch;
                } else {
                    // ^1.2.3 allows 1.x.x but not 2.0.0
                    break :blk version.major == self.major and
                        (version.minor > self.minor or
                            (version.minor == self.minor and version.patch >= self.patch));
                }
            },

            // ~1.2.3 := >=1.2.3 <1.3.0
            .tilde => version.major == self.major and
                version.minor == self.minor and
                version.patch >= self.patch,

            .gte => version.major > self.major or
                (version.major == self.major and version.minor > self.minor) or
                (version.major == self.major and version.minor == self.minor and version.patch >= self.patch),

            .lte => version.major < self.major or
                (version.major == self.major and version.minor < self.minor) or
                (version.major == self.major and version.minor == self.minor and version.patch <= self.patch),

            .gt => version.major > self.major or
                (version.major == self.major and version.minor > self.minor) or
                (version.major == self.major and version.minor == self.minor and version.patch > self.patch),

            .lt => version.major < self.major or
                (version.major == self.major and version.minor < self.minor) or
                (version.major == self.major and version.minor == self.minor and version.patch < self.patch),

            .any => true,
        };
    }
};

/// Compare two semver versions, returns >0 if a > b, <0 if a < b, 0 if equal
fn compareVersions(a: []const u8, b: []const u8) i32 {
    const va = SemverConstraint.parseVersion(a) catch return 0;
    const vb = SemverConstraint.parseVersion(b) catch return 0;

    if (va.major != vb.major) {
        return if (va.major > vb.major) @as(i32, 1) else @as(i32, -1);
    }
    if (va.minor != vb.minor) {
        return if (va.minor > vb.minor) @as(i32, 1) else @as(i32, -1);
    }
    if (va.patch != vb.patch) {
        return if (va.patch > vb.patch) @as(i32, 1) else @as(i32, -1);
    }
    return 0;
}

/// Result of version resolution
pub const VersionResolution = struct {
    /// The resolved version string
    version: []const u8,
    /// Whether this is the latest version
    is_latest: bool,
    /// Whether an update is available (resolved > current)
    has_update: bool,

    pub fn deinit(self: *VersionResolution, allocator: std.mem.Allocator) void {
        allocator.free(self.version);
    }
};

/// Resolve the best matching version from NPM registry based on constraint
/// Returns the highest version that satisfies the constraint
pub fn resolveVersion(
    registry: *NpmRegistry,
    allocator: std.mem.Allocator,
    package_name: []const u8,
    constraint_str: []const u8,
    current_version: ?[]const u8,
) !VersionResolution {
    // Fetch all available versions from NPM
    const versions = try registry.listVersions(allocator, package_name);
    defer {
        for (versions) |v| {
            allocator.free(v);
        }
        allocator.free(versions);
    }

    if (versions.len == 0) {
        return error.NoVersions;
    }

    // Parse the constraint
    const constraint = SemverConstraint.parse(constraint_str) catch {
        // If constraint is invalid, treat as exact match or latest
        return VersionResolution{
            .version = try allocator.dupe(u8, versions[0]),
            .is_latest = true,
            .has_update = false,
        };
    };

    // Find the highest version that satisfies the constraint
    var best_version: ?[]const u8 = null;
    var highest_version: ?[]const u8 = null;

    for (versions) |version| {
        // Track the absolute highest version for "latest" check
        if (highest_version == null or compareVersions(version, highest_version.?) > 0) {
            highest_version = version;
        }

        // Check if this version satisfies the constraint
        if (constraint.satisfies(version)) {
            if (best_version == null or compareVersions(version, best_version.?) > 0) {
                best_version = version;
            }
        }
    }

    const resolved = best_version orelse highest_version orelse versions[0];
    const is_latest = highest_version != null and std.mem.eql(u8, resolved, highest_version.?);

    // Check if there's an update available
    var has_update = false;
    if (current_version) |current| {
        has_update = compareVersions(resolved, current) > 0;
    }

    return VersionResolution{
        .version = try allocator.dupe(u8, resolved),
        .is_latest = is_latest,
        .has_update = has_update,
    };
}

/// Get the latest version of a package from NPM
pub fn getLatestVersion(
    registry: *NpmRegistry,
    allocator: std.mem.Allocator,
    package_name: []const u8,
) ![]const u8 {
    // Use fetchMetadata with null version to get latest
    const metadata = try registry.fetchMetadata(allocator, package_name, null);
    defer {
        var mut_metadata = metadata;
        mut_metadata.deinit(allocator);
    }

    return try allocator.dupe(u8, metadata.version);
}

/// Check if a package has updates available based on constraint
pub fn checkForUpdates(
    registry: *NpmRegistry,
    allocator: std.mem.Allocator,
    package_name: []const u8,
    current_version: []const u8,
    constraint_str: []const u8,
) !?[]const u8 {
    const resolution = try resolveVersion(registry, allocator, package_name, constraint_str, current_version);

    if (resolution.has_update) {
        return resolution.version;
    } else {
        allocator.free(resolution.version);
        return null;
    }
}
