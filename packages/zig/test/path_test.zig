const std = @import("std");
const testing = std.testing;
const lib = @import("lib");

test "Paths - home returns valid path" {
    const allocator = testing.allocator;

    const home = try lib.Paths.home(allocator);
    defer allocator.free(home);

    try testing.expect(home.len > 0);
    try testing.expect(std.fs.path.isAbsolute(home));
}

test "Path - basename extracts filename" {
    const path = "/usr/local/bin/pantry";
    const result = lib.path.basename(path);
    try testing.expectEqualStrings("pantry", result);
}

test "Path - basename handles no directory" {
    const path = "file.txt";
    const result = lib.path.basename(path);
    try testing.expectEqualStrings("file.txt", result);
}

test "Path - basename handles trailing slash" {
    const path = "/usr/local/bin/";
    const result = lib.path.basename(path);
    try testing.expectEqualStrings("bin", result);
}

test "Path - dirname extracts directory" {
    const path = "/usr/local/bin/pantry";
    const result = lib.path.dirname(path);
    try testing.expectEqualStrings("/usr/local/bin", result);
}

test "Path - dirname handles root" {
    const path = "/file.txt";
    const result = lib.path.dirname(path);
    try testing.expectEqualStrings("/", result);
}

test "Path - join combines paths" {
    const allocator = testing.allocator;

    const parts = [_][]const u8{ "usr", "local", "bin" };
    const result = try lib.path.join(allocator, &parts);
    defer allocator.free(result);

    try testing.expect(std.mem.indexOf(u8, result, "usr") != null);
    try testing.expect(std.mem.indexOf(u8, result, "local") != null);
    try testing.expect(std.mem.indexOf(u8, result, "bin") != null);
}

test "Path - extension returns file extension" {
    const path = "/usr/local/file.txt";
    const result = lib.path.extension(path);
    try testing.expectEqualStrings(".txt", result);
}

test "Path - extension handles no extension" {
    const path = "/usr/local/file";
    const result = lib.path.extension(path);
    try testing.expectEqualStrings("", result);
}

test "Path - normalize removes redundant slashes" {
    const allocator = testing.allocator;

    const path = "/usr//local///bin";
    const result = try lib.path.normalize(allocator, path);
    defer allocator.free(result);

    try testing.expect(std.mem.indexOf(u8, result, "//") == null);
}
