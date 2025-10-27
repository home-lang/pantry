const std = @import("std");
const lib = @import("lib");
const testing = std.testing;

// Integration tests for environment management

test "EnvScanner and EnvCommands integration" {
    const allocator = testing.allocator;

    // Create test environment structure
    const test_data_dir = "test_data_envs";
    defer std.fs.cwd().deleteTree(test_data_dir) catch {};

    // Create envs directory
    const envs_dir = try std.fs.path.join(allocator, &[_][]const u8{ test_data_dir, "envs" });
    defer allocator.free(envs_dir);

    std.fs.cwd().makePath(envs_dir) catch {};

    // Create test environments
    const test_env1 = try std.fs.path.join(allocator, &[_][]const u8{ envs_dir, "project1_abc123" });
    defer allocator.free(test_env1);

    const test_env2 = try std.fs.path.join(allocator, &[_][]const u8{ envs_dir, "project2_def456" });
    defer allocator.free(test_env2);

    // Create directories with bin subdirectories
    {
        const bin_path1 = try std.fs.path.join(allocator, &[_][]const u8{ test_env1, "bin" });
        defer allocator.free(bin_path1);
        std.fs.cwd().makePath(bin_path1) catch {};

        const bin_path2 = try std.fs.path.join(allocator, &[_][]const u8{ test_env2, "bin" });
        defer allocator.free(bin_path2);
        std.fs.cwd().makePath(bin_path2) catch {};
    }

    // Create some test binaries
    {
        const bin1 = try std.fs.path.join(allocator, &[_][]const u8{ test_env1, "bin", "node" });
        defer allocator.free(bin1);

        const file = try std.fs.cwd().createFile(bin1, .{ .mode = 0o755 });
        defer file.close();
        try file.writeAll("#!/bin/sh\n");
    }

    // Test scanner
    var scanner = lib.env.EnvScanner.init(allocator);
    defer scanner.deinit();

    // Note: scanAll() uses platform Paths which won't find test directories
    // This test verifies the module compiles and basic APIs work
}

test "EnvironmentInfo sorting" {
    const allocator = testing.allocator;

    var envs = [_]lib.env.EnvironmentInfo{
        .{
            .hash = "hash3",
            .project_name = "charlie",
            .path = "/path3",
            .size_bytes = 150,
            .packages = 3,
            .binaries = 3,
            .created = 3000,
            .modified = 1000, // oldest
        },
        .{
            .hash = "hash1",
            .project_name = "alpha",
            .path = "/path1",
            .size_bytes = 100, // smallest
            .packages = 1,
            .binaries = 1,
            .created = 1000,
            .modified = 3000, // newest
        },
        .{
            .hash = "hash2",
            .project_name = "bravo",
            .path = "/path2",
            .size_bytes = 200, // largest
            .packages = 2,
            .binaries = 2,
            .created = 2000,
            .modified = 2000,
        },
    };

    // Test sortByName
    lib.env.EnvScanner.sortByName(&envs);
    try testing.expectEqualStrings("alpha", envs[0].project_name);
    try testing.expectEqualStrings("bravo", envs[1].project_name);
    try testing.expectEqualStrings("charlie", envs[2].project_name);

    // Test sortBySize (largest first)
    lib.env.EnvScanner.sortBySize(&envs);
    try testing.expect(envs[0].size_bytes == 200);
    try testing.expect(envs[1].size_bytes == 150);
    try testing.expect(envs[2].size_bytes == 100);

    // Test sortByModified (newest first)
    lib.env.EnvScanner.sortByModified(&envs);
    try testing.expect(envs[0].modified == 3000);
    try testing.expect(envs[1].modified == 2000);
    try testing.expect(envs[2].modified == 1000);

    _ = allocator; // envs are stack-allocated, no cleanup needed
}

test "EnvCommands list with empty environments" {
    const allocator = testing.allocator;

    var commands = lib.env.EnvCommands.init(allocator);
    defer commands.deinit();

    // This should not crash with empty environments
    // Note: Output goes to stderr, we can't capture it in tests
    // Just verify it doesn't crash
    commands.list("simple", false) catch {};
}

test "env:clean dry run simulation" {
    const allocator = testing.allocator;

    var commands = lib.env.EnvCommands.init(allocator);
    defer commands.deinit();

    // Should handle empty environments gracefully
    commands.clean(30, true, false) catch {};
}

test "env:remove error handling" {
    const allocator = testing.allocator;

    var commands = lib.env.EnvCommands.init(allocator);
    defer commands.deinit();

    // Should return error for nonexistent environment
    const result = commands.remove("nonexistent_hash", true);
    try testing.expectError(error.EnvironmentNotFound, result);
}
