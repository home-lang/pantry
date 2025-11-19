const std = @import("std");
const zig_config = @import("zig-config");

/// Extract scripts from a config object
/// Returns a StringHashMap of script_name -> script_command
/// Caller owns the returned map and all strings in it
pub fn extractScripts(allocator: std.mem.Allocator, config: anytype) !?std.StringHashMap([]const u8) {
    var result = std.StringHashMap([]const u8).init(allocator);
    errdefer {
        var it = result.iterator();
        while (it.next()) |entry| {
            allocator.free(entry.key_ptr.*);
            allocator.free(entry.value_ptr.*);
        }
        result.deinit();
    }

    // Check if config is an object
    if (config.config != .object) {
        return null;
    }

    // Try to get scripts object from config
    const scripts_value = config.config.object.get("scripts") orelse {
        return null;
    };

    // Scripts should be an object
    const scripts_obj = switch (scripts_value) {
        .object => |obj| obj,
        else => return null,
    };

    // Iterate over all script entries
    var it = scripts_obj.iterator();
    while (it.next()) |entry| {
        const script_name = entry.key_ptr.*;
        const script_value = entry.value_ptr.*;

        // Script value should be a string
        const script_command = switch (script_value) {
            .string => |v| v,
            else => continue,
        };

        // Store owned copies
        const owned_name = try allocator.dupe(u8, script_name);
        errdefer allocator.free(owned_name);
        const owned_command = try allocator.dupe(u8, script_command);
        errdefer allocator.free(owned_command);

        try result.put(owned_name, owned_command);
    }

    if (result.count() == 0) {
        result.deinit();
        return null;
    }

    return result;
}

/// Find and load scripts from a project directory
/// Searches for pantry.json or pantry.jsonc
pub fn findProjectScripts(allocator: std.mem.Allocator, project_dir: []const u8) !?std.StringHashMap([]const u8) {
    const loader = @import("loader.zig");

    // Try to load pantry config from the project directory
    var config = loader.loadpantryConfig(allocator, .{
        .name = "pantry",
        .cwd = project_dir,
    }) catch return null;
    defer config.deinit();

    return try extractScripts(allocator, config);
}

test "extract scripts from config file" {
    const allocator = std.testing.allocator;

    // Create a temporary directory with a config file
    var tmp_dir = std.testing.tmpDir(.{});
    defer tmp_dir.cleanup();

    // Create package.json with scripts
    const package_json =
        \\{
        \\  "name": "test-project",
        \\  "scripts": {
        \\    "dev": "bun run src/index.ts",
        \\    "build": "bun build src/index.ts",
        \\    "test": "bun test"
        \\  }
        \\}
    ;

    const file = try tmp_dir.dir.createFile("package.json", .{});
    defer file.close();
    try file.writeAll(package_json);

    // Get absolute path to the temp directory
    const cwd_path = try tmp_dir.dir.realpathAlloc(allocator, ".");
    defer allocator.free(cwd_path);

    // Load config from the temp directory
    const config_loader = @import("../config.zig");
    var config = try config_loader.loadpantryConfig(allocator, .{
        .name = "test-project",
        .cwd = cwd_path,
    });
    defer config.deinit();

    const scripts = try extractScripts(allocator, config);
    if (scripts) |s| {
        var scripts_map = s;
        defer {
            var it = scripts_map.iterator();
            while (it.next()) |entry| {
                allocator.free(entry.key_ptr.*);
                allocator.free(entry.value_ptr.*);
            }
            scripts_map.deinit();
        }

        try std.testing.expectEqual(@as(usize, 3), scripts_map.count());
        try std.testing.expectEqualStrings("bun run src/index.ts", scripts_map.get("dev").?);
        try std.testing.expectEqualStrings("bun build src/index.ts", scripts_map.get("build").?);
        try std.testing.expectEqualStrings("bun test", scripts_map.get("test").?);
    } else {
        try std.testing.expect(false); // Should have found scripts
    }
}

test "no scripts in config file" {
    const allocator = std.testing.allocator;

    // Create a temporary directory with a config file
    var tmp_dir = std.testing.tmpDir(.{});
    defer tmp_dir.cleanup();

    // Create package.json without scripts
    const package_json =
        \\{
        \\  "name": "test-project",
        \\  "dependencies": {}
        \\}
    ;

    const file = try tmp_dir.dir.createFile("package.json", .{});
    defer file.close();
    try file.writeAll(package_json);

    // Get absolute path to the temp directory
    const cwd_path = try tmp_dir.dir.realpathAlloc(allocator, ".");
    defer allocator.free(cwd_path);

    // Load config from the temp directory
    const config_loader = @import("../config.zig");
    var config = try config_loader.loadpantryConfig(allocator, .{
        .name = "test-project",
        .cwd = cwd_path,
    });
    defer config.deinit();

    const scripts = try extractScripts(allocator, config);
    try std.testing.expect(scripts == null);
}
