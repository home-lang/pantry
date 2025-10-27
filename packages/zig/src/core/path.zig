const std = @import("std");

/// Returns the base name (final component) of a path
/// Examples:
///   basename("/foo/bar/baz.txt") => "baz.txt"
///   basename("/foo/bar/") => "bar"
///   basename("foo") => "foo"
///   basename("/") => ""
pub fn basename(path: []const u8) []const u8 {
    if (path.len == 0) return "";

    // Handle trailing slashes
    var end = path.len;
    while (end > 0 and path[end - 1] == '/') {
        end -= 1;
    }

    if (end == 0) return "";

    // Find the last slash before the end
    var i = end;
    while (i > 0) {
        i -= 1;
        if (path[i] == '/') {
            return path[i + 1 .. end];
        }
    }

    return path[0..end];
}

/// Returns the directory name (all but the final component) of a path
/// Examples:
///   dirname("/foo/bar/baz.txt") => "/foo/bar"
///   dirname("/foo/bar/") => "/foo"
///   dirname("foo") => "."
///   dirname("/foo") => "/"
///   dirname("/") => "/"
pub fn dirname(path: []const u8) []const u8 {
    if (path.len == 0) return ".";

    // Handle trailing slashes
    var end = path.len;
    while (end > 1 and path[end - 1] == '/') {
        end -= 1;
    }

    // Find the last slash before the end
    var i = end;
    while (i > 0) {
        i -= 1;
        if (path[i] == '/') {
            // If we're at the root
            if (i == 0) return "/";

            // Remove trailing slashes from the dirname
            while (i > 1 and path[i - 1] == '/') {
                i -= 1;
            }

            return path[0..i];
        }
    }

    return ".";
}

/// Joins path components with platform-appropriate separators
/// Allocates memory for the result
pub fn join(allocator: std.mem.Allocator, parts: []const []const u8) ![]const u8 {
    if (parts.len == 0) return try allocator.dupe(u8, "");
    if (parts.len == 1) return try allocator.dupe(u8, parts[0]);

    // Calculate total size needed
    var total_len: usize = 0;
    for (parts) |part| {
        total_len += part.len;
    }
    // Add separators (n-1 for n parts)
    total_len += parts.len - 1;

    var result = try allocator.alloc(u8, total_len);
    var pos: usize = 0;

    for (parts, 0..) |part, i| {
        @memcpy(result[pos..][0..part.len], part);
        pos += part.len;

        if (i < parts.len - 1) {
            result[pos] = '/';
            pos += 1;
        }
    }

    return result;
}

/// Returns the file extension (including the dot)
/// Examples:
///   extension("foo.txt") => ".txt"
///   extension("foo.tar.gz") => ".gz"
///   extension("foo") => ""
pub fn extension(path: []const u8) []const u8 {
    const base = basename(path);

    var i = base.len;
    while (i > 0) {
        i -= 1;
        if (base[i] == '.') {
            // Don't treat dot at the start as extension
            if (i == 0) return "";
            return base[i..];
        }
    }

    return "";
}

/// Normalizes a path by resolving . and .. components
/// Allocates memory for the result
pub fn normalize(allocator: std.mem.Allocator, path: []const u8) ![]const u8 {
    if (path.len == 0) return try allocator.dupe(u8, ".");

    const is_absolute = path[0] == '/';

    var parts = try std.ArrayList([]const u8).initCapacity(allocator, 8);
    defer parts.deinit(allocator);

    var it = std.mem.tokenizeScalar(u8, path, '/');
    while (it.next()) |component| {
        if (std.mem.eql(u8, component, ".")) {
            continue;
        } else if (std.mem.eql(u8, component, "..")) {
            if (parts.items.len > 0 and !std.mem.eql(u8, parts.items[parts.items.len - 1], "..")) {
                _ = parts.pop();
            } else if (!is_absolute) {
                try parts.append(allocator, "..");
            }
        } else {
            try parts.append(allocator, component);
        }
    }

    if (parts.items.len == 0) {
        return try allocator.dupe(u8, if (is_absolute) "/" else ".");
    }

    // Join parts
    var total_len: usize = if (is_absolute) @as(usize, 1) else @as(usize, 0);
    for (parts.items) |part| {
        total_len += part.len;
    }
    total_len += parts.items.len - 1; // separators

    var result = try allocator.alloc(u8, total_len);
    var pos: usize = 0;

    if (is_absolute) {
        result[0] = '/';
        pos = 1;
    }

    for (parts.items, 0..) |part, i| {
        @memcpy(result[pos..][0..part.len], part);
        pos += part.len;

        if (i < parts.items.len - 1) {
            result[pos] = '/';
            pos += 1;
        }
    }

    return result;
}

// Tests
test "basename" {
    const testing = std.testing;

    try testing.expectEqualStrings("baz.txt", basename("/foo/bar/baz.txt"));
    try testing.expectEqualStrings("bar", basename("/foo/bar/"));
    try testing.expectEqualStrings("foo", basename("foo"));
    try testing.expectEqualStrings("", basename("/"));
    try testing.expectEqualStrings("", basename(""));
    try testing.expectEqualStrings("file", basename("dir/file"));
}

test "dirname" {
    const testing = std.testing;

    try testing.expectEqualStrings("/foo/bar", dirname("/foo/bar/baz.txt"));
    try testing.expectEqualStrings("/foo", dirname("/foo/bar/"));
    try testing.expectEqualStrings(".", dirname("foo"));
    try testing.expectEqualStrings("/", dirname("/foo"));
    try testing.expectEqualStrings("/", dirname("/"));
    try testing.expectEqualStrings("dir", dirname("dir/file"));
}

test "extension" {
    const testing = std.testing;

    try testing.expectEqualStrings(".txt", extension("foo.txt"));
    try testing.expectEqualStrings(".gz", extension("foo.tar.gz"));
    try testing.expectEqualStrings("", extension("foo"));
    try testing.expectEqualStrings("", extension(".hidden"));
    try testing.expectEqualStrings(".conf", extension(".hidden.conf"));
}

test "join" {
    const testing = std.testing;
    const allocator = testing.allocator;

    {
        const parts = [_][]const u8{ "foo", "bar", "baz" };
        const result = try join(allocator, &parts);
        defer allocator.free(result);
        try testing.expectEqualStrings("foo/bar/baz", result);
    }

    {
        const parts = [_][]const u8{"foo"};
        const result = try join(allocator, &parts);
        defer allocator.free(result);
        try testing.expectEqualStrings("foo", result);
    }
}

test "normalize" {
    const testing = std.testing;
    const allocator = testing.allocator;

    {
        const result = try normalize(allocator, "/foo/./bar/../baz");
        defer allocator.free(result);
        try testing.expectEqualStrings("/foo/baz", result);
    }

    {
        const result = try normalize(allocator, "foo/bar/..");
        defer allocator.free(result);
        try testing.expectEqualStrings("foo", result);
    }

    {
        const result = try normalize(allocator, "../foo");
        defer allocator.free(result);
        try testing.expectEqualStrings("../foo", result);
    }
}
