const std = @import("std");
const zig_config = @import("zig-config");
const deps = @import("../deps/parser.zig");

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

    // Get dependencies field
    const deps_val = config.config.object.get("dependencies") orelse {
        return dependencies.toOwnedSlice(allocator);
    };

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

                try dependencies.append(allocator, .{
                    .name = try allocator.dupe(u8, pkg_name),
                    .version = try allocator.dupe(u8, version),
                    .global = global_flag,
                });
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
                    });
                }
            }
        },
        else => {}, // Unsupported format, skip
    }

    return dependencies.toOwnedSlice(allocator);
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
