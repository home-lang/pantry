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
/// Searches for pantry.json, pantry.jsonc, or package.json
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

test "extract scripts from config" {
    const allocator = std.testing.allocator;

    // Create a simple config with scripts
    const json_str =
        \\{
        \\  "name": "test-project",
        \\  "scripts": {
        \\    "dev": "bun run src/index.ts",
        \\    "build": "bun build src/index.ts",
        \\    "test": "bun test"
        \\  }
        \\}
    ;

    var config = try zig_config.loadConfig(allocator, .{
        .name = "test",
        .sources = &[_]zig_config.ConfigSource{
            .{ .json_string = json_str },
        },
    });
    defer config.deinit();

    const scripts = try extractScripts(allocator, config);
    if (scripts) |*s| {
        defer {
            var it = s.iterator();
            while (it.next()) |entry| {
                allocator.free(entry.key_ptr.*);
                allocator.free(entry.value_ptr.*);
            }
            s.deinit();
        }

        try std.testing.expectEqual(@as(usize, 3), s.count());
        try std.testing.expectEqualStrings("bun run src/index.ts", s.get("dev").?);
        try std.testing.expectEqualStrings("bun build src/index.ts", s.get("build").?);
        try std.testing.expectEqualStrings("bun test", s.get("test").?);
    } else {
        try std.testing.expect(false); // Should have found scripts
    }
}

test "no scripts in config" {
    const allocator = std.testing.allocator;

    const json_str =
        \\{
        \\  "name": "test-project",
        \\  "dependencies": {}
        \\}
    ;

    var config = try zig_config.loadConfig(allocator, .{
        .name = "test",
        .sources = &[_]zig_config.ConfigSource{
            .{ .json_string = json_str },
        },
    });
    defer config.deinit();

    const scripts = try extractScripts(allocator, config);
    try std.testing.expectEqual(@as(?std.StringHashMap([]const u8), null), scripts);
}
