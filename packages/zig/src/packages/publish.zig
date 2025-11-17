const std = @import("std");
const types = @import("types.zig");
const jsonc = @import("../utils/jsonc.zig");

/// Package metadata required for publishing
pub const PackageMetadata = struct {
    name: []const u8,
    version: []const u8,
    description: ?[]const u8 = null,
    author: ?[]const u8 = null,
    license: ?[]const u8 = null,
    repository: ?[]const u8 = null,
    homepage: ?[]const u8 = null,
    keywords: ?[][]const u8 = null,
    dependencies: ?std.StringHashMap([]const u8) = null,
    publish_config: ?PublishConfig = null,

    pub fn deinit(self: *PackageMetadata, allocator: std.mem.Allocator) void {
        allocator.free(self.name);
        allocator.free(self.version);
        if (self.description) |d| allocator.free(d);
        if (self.author) |a| allocator.free(a);
        if (self.license) |l| allocator.free(l);
        if (self.repository) |r| allocator.free(r);
        if (self.homepage) |h| allocator.free(h);
        if (self.keywords) |keywords| {
            for (keywords) |kw| {
                allocator.free(kw);
            }
            allocator.free(keywords);
        }
        if (self.dependencies) |*deps| {
            var it = deps.iterator();
            while (it.next()) |entry| {
                allocator.free(entry.key_ptr.*);
                allocator.free(entry.value_ptr.*);
            }
            deps.deinit();
        }
        if (self.publish_config) |*pc| {
            var mut_pc = pc.*;
            mut_pc.deinit(allocator);
        }
    }
};

/// Publish configuration from pantry.json/package.json
pub const PublishConfig = struct {
    registry: ?[]const u8 = null,
    access: ?[]const u8 = null,
    tag: ?[]const u8 = null,

    pub fn deinit(self: *PublishConfig, allocator: std.mem.Allocator) void {
        if (self.registry) |r| allocator.free(r);
        if (self.access) |a| allocator.free(a);
        if (self.tag) |t| allocator.free(t);
    }
};

/// Validation errors
pub const ValidationError = error{
    MissingName,
    MissingVersion,
    InvalidVersion,
    InvalidName,
    PackageConfigNotFound,
    InvalidPackageConfig,
};

/// Validate package name (similar to npm rules)
pub fn validatePackageName(name: []const u8) !void {
    if (name.len == 0) return error.InvalidName;
    if (name.len > 214) return error.InvalidName;

    // Must start with alphanumeric or @ for scoped packages
    if (!std.ascii.isAlphanumeric(name[0]) and name[0] != '@') {
        return error.InvalidName;
    }

    // Only allowed characters: alphanumeric, -, _, ., @, /
    for (name) |char| {
        if (!std.ascii.isAlphanumeric(char) and
            char != '-' and char != '_' and
            char != '.' and char != '@' and char != '/')
        {
            return error.InvalidName;
        }
    }
}

/// Validate semantic version
pub fn validateVersion(version: []const u8) !void {
    if (version.len == 0) return error.InvalidVersion;

    // Simple semver validation: X.Y.Z where X, Y, Z are numbers
    var parts = std.mem.splitScalar(u8, version, '.');
    var count: usize = 0;

    while (parts.next()) |part| {
        count += 1;
        if (count > 3) return error.InvalidVersion;

        // Each part must be a number
        _ = std.fmt.parseInt(u32, part, 10) catch {
            return error.InvalidVersion;
        };
    }

    if (count != 3) return error.InvalidVersion;
}

/// Extract package metadata from pantry.json or config file
pub fn extractMetadata(
    allocator: std.mem.Allocator,
    config_path: []const u8,
) !PackageMetadata {
    // Read the config file
    const contents = std.fs.cwd().readFileAlloc(allocator, config_path, 10 * 1024 * 1024) catch {
        return error.PackageConfigNotFound;
    };
    defer allocator.free(contents);

    // Check if this is a JSONC file (ends with .jsonc)
    const is_jsonc = std.mem.endsWith(u8, config_path, ".jsonc");

    // Strip comments if JSONC, otherwise use contents as-is
    const json_contents = if (is_jsonc)
        try jsonc.stripComments(allocator, contents)
    else
        contents;

    // Only free stripped contents if we created a new allocation
    defer if (is_jsonc) allocator.free(json_contents);

    // Parse JSON
    const parsed = std.json.parseFromSlice(
        std.json.Value,
        allocator,
        json_contents,
        .{},
    ) catch {
        return error.InvalidPackageConfig;
    };
    defer parsed.deinit();

    const root = parsed.value;
    if (root != .object) return error.InvalidPackageConfig;

    // Extract required fields
    const name_val = root.object.get("name") orelse return error.MissingName;
    const version_val = root.object.get("version") orelse return error.MissingVersion;

    if (name_val != .string) return error.MissingName;
    if (version_val != .string) return error.MissingVersion;

    const name = name_val.string;
    const version = version_val.string;

    // Validate
    try validatePackageName(name);
    try validateVersion(version);

    // Extract optional fields
    const description = if (root.object.get("description")) |d|
        if (d == .string) try allocator.dupe(u8, d.string) else null
    else
        null;

    const author = if (root.object.get("author")) |a|
        if (a == .string) try allocator.dupe(u8, a.string) else null
    else
        null;

    const license = if (root.object.get("license")) |l|
        if (l == .string) try allocator.dupe(u8, l.string) else null
    else
        null;

    const repository = if (root.object.get("repository")) |r|
        if (r == .string) try allocator.dupe(u8, r.string) else null
    else
        null;

    const homepage = if (root.object.get("homepage")) |h|
        if (h == .string) try allocator.dupe(u8, h.string) else null
    else
        null;

    // Extract keywords array
    var keywords: ?[][]const u8 = null;
    if (root.object.get("keywords")) |kw_val| {
        if (kw_val == .array) {
            var kw_list = try std.ArrayList([]const u8).initCapacity(allocator, kw_val.array.items.len);
            for (kw_val.array.items) |item| {
                if (item == .string) {
                    try kw_list.append(allocator, try allocator.dupe(u8, item.string));
                }
            }
            keywords = try kw_list.toOwnedSlice(allocator);
        }
    }

    // Extract dependencies
    var dependencies: ?std.StringHashMap([]const u8) = null;
    if (root.object.get("dependencies")) |deps_val| {
        if (deps_val == .object) {
            var deps_map = std.StringHashMap([]const u8).init(allocator);
            var it = deps_val.object.iterator();
            while (it.next()) |entry| {
                const dep_name = try allocator.dupe(u8, entry.key_ptr.*);
                const dep_version = if (entry.value_ptr.* == .string)
                    try allocator.dupe(u8, entry.value_ptr.string)
                else
                    try allocator.dupe(u8, "*");
                try deps_map.put(dep_name, dep_version);
            }
            dependencies = deps_map;
        }
    }

    // Extract publishConfig
    var publish_config: ?PublishConfig = null;
    if (root.object.get("publishConfig")) |pc_val| {
        if (pc_val == .object) {
            const registry = if (pc_val.object.get("registry")) |r|
                if (r == .string) try allocator.dupe(u8, r.string) else null
            else
                null;

            const access = if (pc_val.object.get("access")) |a|
                if (a == .string) try allocator.dupe(u8, a.string) else null
            else
                null;

            const tag = if (pc_val.object.get("tag")) |t|
                if (t == .string) try allocator.dupe(u8, t.string) else null
            else
                null;

            publish_config = PublishConfig{
                .registry = registry,
                .access = access,
                .tag = tag,
            };
        }
    }

    return PackageMetadata{
        .name = try allocator.dupe(u8, name),
        .version = try allocator.dupe(u8, version),
        .description = description,
        .author = author,
        .license = license,
        .repository = repository,
        .homepage = homepage,
        .keywords = keywords,
        .dependencies = dependencies,
        .publish_config = publish_config,
    };
}

/// Find package config file in directory
pub fn findPackageConfig(allocator: std.mem.Allocator, dir: []const u8) ![]const u8 {
    const config_files = [_][]const u8{
        "pantry.json",
        "pantry.jsonc",
        "package.json",
        "package.jsonc",
    };

    for (config_files) |config_file| {
        const full_path = try std.fs.path.join(allocator, &[_][]const u8{ dir, config_file });
        defer allocator.free(full_path);

        std.fs.accessAbsolute(full_path, .{}) catch continue;

        // Found a config file
        return try allocator.dupe(u8, full_path);
    }

    return error.PackageConfigNotFound;
}
