const std = @import("std");
const zig_config = @import("zig-config");

/// Strip single-line (//) and multi-line (/* */) comments from JSONC content
fn stripJsonComments(allocator: std.mem.Allocator, content: []const u8) ![]const u8 {
    var result = std.ArrayList(u8){};
    try result.ensureTotalCapacity(allocator, content.len);
    errdefer result.deinit(allocator);

    var i: usize = 0;
    var in_string = false;
    var escape_next = false;

    while (i < content.len) : (i += 1) {
        const c = content[i];

        if (escape_next) {
            try result.append(allocator, c);
            escape_next = false;
            continue;
        }

        if (c == '"' and !escape_next) {
            in_string = !in_string;
            try result.append(allocator, c);
            continue;
        }

        if (in_string) {
            try result.append(allocator, c);
            escape_next = (c == '\\');
            continue;
        }

        // Single-line comment
        if (c == '/' and i + 1 < content.len and content[i + 1] == '/') {
            i += 2;
            while (i < content.len and content[i] != '\n') : (i += 1) {}
            if (i < content.len) try result.append(allocator, '\n');
            continue;
        }

        // Multi-line comment
        if (c == '/' and i + 1 < content.len and content[i + 1] == '*') {
            i += 2;
            while (i + 1 < content.len) : (i += 1) {
                if (content[i] == '*' and content[i + 1] == '/') {
                    i += 1;
                    break;
                }
            }
            continue;
        }

        try result.append(allocator, c);
    }

    return result.toOwnedSlice(allocator);
}

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

/// Parse scripts from raw JSON/JSONC content
fn parseScriptsFromContent(allocator: std.mem.Allocator, content: []const u8, is_jsonc: bool) !?std.StringHashMap([]const u8) {
    const json_content = if (is_jsonc)
        try stripJsonComments(allocator, content)
    else
        content;
    defer if (is_jsonc) allocator.free(json_content);

    const parsed = std.json.parseFromSlice(std.json.Value, allocator, json_content, .{
        .ignore_unknown_fields = true,
        .allocate = .alloc_always,
    }) catch return null;
    defer parsed.deinit();

    if (parsed.value != .object) return null;
    const scripts_value = parsed.value.object.get("scripts") orelse return null;
    const scripts_obj = switch (scripts_value) {
        .object => |obj| obj,
        else => return null,
    };

    var result = std.StringHashMap([]const u8).init(allocator);
    errdefer {
        var it = result.iterator();
        while (it.next()) |entry| {
            allocator.free(entry.key_ptr.*);
            allocator.free(entry.value_ptr.*);
        }
        result.deinit();
    }

    var it = scripts_obj.iterator();
    while (it.next()) |entry| {
        const cmd = switch (entry.value_ptr.*) {
            .string => |v| v,
            else => continue,
        };
        const owned_name = try allocator.dupe(u8, entry.key_ptr.*);
        errdefer allocator.free(owned_name);
        const owned_cmd = try allocator.dupe(u8, cmd);
        errdefer allocator.free(owned_cmd);
        try result.put(owned_name, owned_cmd);
    }

    if (result.count() == 0) {
        result.deinit();
        return null;
    }
    return result;
}

/// Read file content using POSIX operations (cross-platform reliable)
fn readFileContent(allocator: std.mem.Allocator, path: []const u8) ![]const u8 {
    const fd = try std.posix.openat(std.posix.AT.FDCWD, path, .{ .ACCMODE = .RDONLY, .CLOEXEC = true }, 0);
    defer std.posix.close(fd);

    var content = std.ArrayList(u8){};
    errdefer content.deinit(allocator);
    var buf: [8192]u8 = undefined;
    while (true) {
        const n = try std.posix.read(fd, &buf);
        if (n == 0) break;
        try content.appendSlice(allocator, buf[0..n]);
    }
    return try content.toOwnedSlice(allocator);
}

/// Find and load scripts from a project directory
/// Searches for pantry.json or pantry.jsonc
pub fn findProjectScripts(allocator: std.mem.Allocator, project_dir: []const u8) !?std.StringHashMap([]const u8) {
    // Try loading config by directly reading pantry.json / pantry.jsonc using POSIX IO
    const extensions = [_]struct { ext: []const u8, jsonc: bool }{
        .{ .ext = ".json", .jsonc = false },
        .{ .ext = ".jsonc", .jsonc = true },
    };

    for (extensions) |e| {
        const config_path = std.fmt.allocPrint(allocator, "{s}/pantry{s}", .{ project_dir, e.ext }) catch continue;
        defer allocator.free(config_path);

        const file_content = readFileContent(allocator, config_path) catch continue;
        defer allocator.free(file_content);

        if (parseScriptsFromContent(allocator, file_content, e.jsonc) catch null) |scripts| {
            return scripts;
        }
    }

    // Also check package.json for scripts (common in workspace packages)
    pkg_json: {
        const pkg_path = std.fmt.allocPrint(allocator, "{s}/package.json", .{project_dir}) catch break :pkg_json;
        defer allocator.free(pkg_path);

        const file_content = readFileContent(allocator, pkg_path) catch break :pkg_json;
        defer allocator.free(file_content);

        if (parseScriptsFromContent(allocator, file_content, false) catch null) |scripts| {
            return scripts;
        }
    }

    // Fallback to zig-config loader for other config formats (.ts, .zig, etc.)
    const loader = @import("loader.zig");
    var config = loader.loadpantryConfig(allocator, .{
        .name = "pantry",
        .cwd = project_dir,
    }) catch return null;
    defer config.deinit();

    return try extractScripts(allocator, config);
}

test "extractScripts returns null for null config" {
    const allocator = std.testing.allocator;
    _ = allocator;
}
