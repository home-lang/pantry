const std = @import("std");
const zig_config = @import("zig-config");
const deps = @import("../deps/parser.zig");
const types = @import("../packages/types.zig");

/// Extract bin paths from a loaded configuration
/// Returns a map of executable names to their paths within the package
pub fn extractBinPaths(
    allocator: std.mem.Allocator,
    config: zig_config.UntypedConfigResult,
) !?std.StringHashMap([]const u8) {
    // Check if config is an object
    if (config.config != .object) {
        return null;
    }

    // Get bin field
    const bin_val = config.config.object.get("bin") orelse {
        return null;
    };

    var bin_map = std.StringHashMap([]const u8).init(allocator);
    errdefer {
        var it = bin_map.iterator();
        while (it.next()) |entry| {
            allocator.free(entry.key_ptr.*);
            allocator.free(entry.value_ptr.*);
        }
        bin_map.deinit();
    }

    switch (bin_val) {
        .object => |bin_obj| {
            // Object format: { "executable": "path/to/bin", ... }
            var iter = bin_obj.iterator();
            while (iter.next()) |entry| {
                const bin_name = entry.key_ptr.*;
                const bin_path = switch (entry.value_ptr.*) {
                    .string => |v| v,
                    else => continue, // Skip non-string values
                };

                try bin_map.put(
                    try allocator.dupe(u8, bin_name),
                    try allocator.dupe(u8, bin_path),
                );
            }
        },
        .string => |bin_str| {
            // String format: single executable path
            // Use the basename as the executable name
            const basename = std.fs.path.basename(bin_str);
            try bin_map.put(
                try allocator.dupe(u8, basename),
                try allocator.dupe(u8, bin_str),
            );
        },
        else => return null, // Unsupported format
    }

    if (bin_map.count() == 0) {
        bin_map.deinit();
        return null;
    }

    return bin_map;
}

/// Extract package dependencies from a loaded configuration
/// Supports:
/// - dependencies as object: { "bun": "^1.2.19", "redis.io": "^8.0.0" }
/// - dependencies as array: ["bun", "redis.io"]
/// - dependencies as string: "bun redis.io"
/// - devDependencies (same formats as dependencies)
/// - peerDependencies (same formats as dependencies)
/// - global flag at top level
pub fn extractDependencies(
    allocator: std.mem.Allocator,
    config: zig_config.UntypedConfigResult,
) ![]deps.PackageDependency {
    var dependencies = try std.ArrayList(deps.PackageDependency).initCapacity(allocator, 8);
    errdefer {
        for (dependencies.items) |*dep| dep.deinit(allocator);
        dependencies.deinit(allocator);
    }

    // Check if config is an object
    if (config.config != .object) {
        return dependencies.toOwnedSlice(allocator);
    }

    // Get global flag (defaults to false)
    const global_flag = if (config.config.object.get("global")) |global_val|
        if (global_val == .bool) global_val.bool else false
    else
        false;

    // Extract regular dependencies
    if (config.config.object.get("dependencies")) |deps_val| {
        try extractDependencyField(allocator, deps_val, global_flag, .normal, &dependencies);
    }

    // Extract devDependencies
    if (config.config.object.get("devDependencies")) |deps_val| {
        try extractDependencyField(allocator, deps_val, global_flag, .dev, &dependencies);
    }

    // Extract peerDependencies
    if (config.config.object.get("peerDependencies")) |deps_val| {
        try extractDependencyField(allocator, deps_val, global_flag, .peer, &dependencies);
    }

    return dependencies.toOwnedSlice(allocator);
}

/// Helper to extract dependencies from a field (dependencies, devDependencies, or peerDependencies)
fn extractDependencyField(
    allocator: std.mem.Allocator,
    deps_val: std.json.Value,
    global_flag: bool,
    dep_type: deps.DependencyType,
    dependencies: *std.ArrayList(deps.PackageDependency),
) !void {
    switch (deps_val) {
        .object => |deps_obj| {
            // Object format: { "package": "version", ... }
            var iter = deps_obj.iterator();
            while (iter.next()) |entry| {
                const pkg_name = entry.key_ptr.*;
                const version = switch (entry.value_ptr.*) {
                    .string => |v| v,
                    else => "latest", // Default to latest if not a string
                };

                // Check if version is a GitHub URL
                if (deps.parseGitHubUrl(allocator, version)) |github_ref| {
                    try dependencies.append(allocator, .{
                        .name = try allocator.dupe(u8, pkg_name),
                        .version = try allocator.dupe(u8, version),
                        .global = global_flag,
                        .dep_type = dep_type,
                        .source = .github,
                        .github_ref = github_ref,
                    });
                } else |_| {
                    // Not a GitHub URL, treat as registry package
                    try dependencies.append(allocator, .{
                        .name = try allocator.dupe(u8, pkg_name),
                        .version = try allocator.dupe(u8, version),
                        .global = global_flag,
                        .dep_type = dep_type,
                    });
                }
            }
        },
        .array => |deps_arr| {
            // Array format: ["package1", "package2", ...]
            for (deps_arr.items) |dep_val| {
                if (dep_val == .string) {
                    try dependencies.append(allocator, .{
                        .name = try allocator.dupe(u8, dep_val.string),
                        .version = try allocator.dupe(u8, "latest"),
                        .global = global_flag,
                        .dep_type = dep_type,
                    });
                }
            }
        },
        .string => |deps_str| {
            // String format: "package1 package2 ..."
            var iter = std.mem.tokenizeScalar(u8, deps_str, ' ');
            while (iter.next()) |pkg| {
                const trimmed = std.mem.trim(u8, pkg, " \t\r\n");
                if (trimmed.len > 0) {
                    try dependencies.append(allocator, .{
                        .name = try allocator.dupe(u8, trimmed),
                        .version = try allocator.dupe(u8, "latest"),
                        .global = global_flag,
                        .dep_type = dep_type,
                    });
                }
            }
        },
        else => {}, // Unsupported format, skip
    }
}

test "extractDependencies from object format" {
    const allocator = std.testing.allocator;

    // Create a mock config with dependencies object
    var config_obj = std.json.ObjectMap.init(allocator);
    defer config_obj.deinit();

    var deps_obj = std.json.ObjectMap.init(allocator);
    defer deps_obj.deinit();

    try deps_obj.put("bun", .{ .string = "^1.2.19" });
    try deps_obj.put("redis.io", .{ .string = "^8.0.0" });

    try config_obj.put("dependencies", .{ .object = deps_obj });
    try config_obj.put("global", .{ .bool = false });

    const config_result = zig_config.UntypedConfigResult{
        .config = .{ .object = config_obj },
        .source = .file_local,
        .sources = &[_]zig_config.SourceInfo{},
        .loaded_at = 0,
        .allocator = allocator,
    };

    const result = try extractDependencies(allocator, config_result);
    defer {
        for (result) |*dep| dep.deinit(allocator);
        allocator.free(result);
    }

    try std.testing.expectEqual(@as(usize, 2), result.len);

    // Find bun dependency
    var found_bun = false;
    for (result) |dep| {
        if (std.mem.eql(u8, dep.name, "bun")) {
            found_bun = true;
            try std.testing.expectEqualStrings("^1.2.19", dep.version);
            try std.testing.expectEqual(false, dep.global);
        }
    }
    try std.testing.expect(found_bun);
}

test "extractDependencies from array format" {
    const allocator = std.testing.allocator;

    var config_obj = std.json.ObjectMap.init(allocator);
    defer config_obj.deinit();

    var deps_array = std.json.Array.init(allocator);
    defer deps_array.deinit();

    try deps_array.append(.{ .string = "bun" });
    try deps_array.append(.{ .string = "redis.io" });

    try config_obj.put("dependencies", .{ .array = deps_array });
    try config_obj.put("global", .{ .bool = true });

    const config_result = zig_config.UntypedConfigResult{
        .config = .{ .object = config_obj },
        .source = .file_local,
        .sources = &[_]zig_config.SourceInfo{},
        .loaded_at = 0,
        .allocator = allocator,
    };

    const result = try extractDependencies(allocator, config_result);
    defer {
        for (result) |*dep| dep.deinit(allocator);
        allocator.free(result);
    }

    try std.testing.expectEqual(@as(usize, 2), result.len);
    for (result) |dep| {
        try std.testing.expectEqualStrings("latest", dep.version);
        try std.testing.expectEqual(true, dep.global);
    }
}

test "extractDependencies from string format" {
    const allocator = std.testing.allocator;

    var config_obj = std.json.ObjectMap.init(allocator);
    defer config_obj.deinit();

    try config_obj.put("dependencies", .{ .string = "bun redis.io postgresql.org" });

    const config_result = zig_config.UntypedConfigResult{
        .config = .{ .object = config_obj },
        .source = .file_local,
        .sources = &[_]zig_config.SourceInfo{},
        .loaded_at = 0,
        .allocator = allocator,
    };

    const result = try extractDependencies(allocator, config_result);
    defer {
        for (result) |*dep| dep.deinit(allocator);
        allocator.free(result);
    }

    try std.testing.expectEqual(@as(usize, 3), result.len);
}

/// Extract workspace patterns from a loaded configuration
/// Returns an array of glob patterns like ["packages/*", "apps/*"]
pub fn extractWorkspacePatterns(
    allocator: std.mem.Allocator,
    config: zig_config.UntypedConfigResult,
) !?[][]const u8 {
    // Check if config is an object
    if (config.config != .object) {
        return null;
    }

    // Get workspaces field
    const workspaces_val = config.config.object.get("workspaces") orelse {
        return null;
    };

    // We'll use a simple dynamic approach to collect patterns
    var patterns_list: [][]const u8 = undefined;

    switch (workspaces_val) {
        .array => |workspaces_arr| {
            // Array format: ["packages/*", "apps/*"]
            patterns_list = try allocator.alloc([]const u8, workspaces_arr.items.len);
            var count: usize = 0;
            for (workspaces_arr.items) |pattern_val| {
                if (pattern_val == .string) {
                    patterns_list[count] = try allocator.dupe(u8, pattern_val.string);
                    count += 1;
                }
            }
            // Resize if needed
            if (count < patterns_list.len) {
                patterns_list = try allocator.realloc(patterns_list, count);
            }
        },
        .string => |workspaces_str| {
            // String format: "packages/*"
            patterns_list = try allocator.alloc([]const u8, 1);
            patterns_list[0] = try allocator.dupe(u8, workspaces_str);
        },
        else => return null, // Unsupported format
    }

    if (patterns_list.len == 0) {
        allocator.free(patterns_list);
        return null;
    }

    return patterns_list;
}

/// Extract workspace name from configuration
pub fn extractWorkspaceName(
    allocator: std.mem.Allocator,
    config: zig_config.UntypedConfigResult,
    fallback: []const u8,
) ![]const u8 {
    // Check if config is an object
    if (config.config != .object) {
        return try allocator.dupe(u8, fallback);
    }

    // Get name field
    const name_val = config.config.object.get("name") orelse {
        return try allocator.dupe(u8, fallback);
    };

    if (name_val == .string) {
        return try allocator.dupe(u8, name_val.string);
    }

    return try allocator.dupe(u8, fallback);
}

/// Extract concurrentScripts configuration from config
/// Returns the number of concurrent scripts allowed, or null to use default
pub fn extractConcurrentScripts(config: zig_config.UntypedConfigResult) ?usize {
    // Check if config is an object
    if (config.config != .object) {
        return null;
    }

    // Get concurrentScripts field
    const concurrent_val = config.config.object.get("concurrentScripts") orelse {
        return null;
    };

    // Should be an integer
    return switch (concurrent_val) {
        .integer => |v| if (v > 0) @as(usize, @intCast(v)) else null,
        .float => |v| if (v > 0) @as(usize, @intFromFloat(v)) else null,
        else => null,
    };
}

/// Extract minimumReleaseAge configuration from config (in seconds)
/// Returns the minimum age in seconds, or null to use default (259200 = 3 days)
pub fn extractMinimumReleaseAge(config: zig_config.UntypedConfigResult) ?u64 {
    // Check if config is an object
    if (config.config != .object) {
        return null;
    }

    // Get minimumReleaseAge field
    const age_val = config.config.object.get("minimumReleaseAge") orelse {
        return null;
    };

    // Should be an integer (seconds)
    return switch (age_val) {
        .integer => |v| if (v > 0) @as(u64, @intCast(v)) else null,
        .float => |v| if (v > 0) @as(u64, @intFromFloat(v)) else null,
        else => null,
    };
}

/// Extract minimumReleaseAgeExcludes configuration from config
/// Returns array of package names to exclude from minimum age check
/// Caller owns the returned array and all strings in it
pub fn extractMinimumReleaseAgeExcludes(
    allocator: std.mem.Allocator,
    config: zig_config.UntypedConfigResult,
) !?[][]const u8 {
    // Check if config is an object
    if (config.config != .object) {
        return null;
    }

    // Get minimumReleaseAgeExcludes field
    const excludes_val = config.config.object.get("minimumReleaseAgeExcludes") orelse {
        return null;
    };

    // Should be an array of strings
    const excludes_array = switch (excludes_val) {
        .array => |arr| arr,
        else => return null,
    };

    if (excludes_array.items.len == 0) {
        return null;
    }

    // Use fixed buffer for excludes (max 256 entries)
    var buffer: [256][]const u8 = undefined;
    var count: usize = 0;

    for (excludes_array.items) |item| {
        if (count >= buffer.len) break;

        const pkg_name = switch (item) {
            .string => |s| s,
            else => continue,
        };

        buffer[count] = try allocator.dupe(u8, pkg_name);
        count += 1;
    }

    if (count == 0) {
        return null;
    }

    const result = try allocator.alloc([]const u8, count);
    @memcpy(result, buffer[0..count]);
    return result;
}
