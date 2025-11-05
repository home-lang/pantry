//! Watch Mode Integration Test
//!
//! Tests the file watcher functionality for detecting changes in workspace packages.

const std = @import("std");
const file_watcher = @import("../src/packages/file_watcher.zig");
const types = @import("../src/packages/types.zig");

test "FileWatcher - basic initialization" {
    const allocator = std.testing.allocator;

    const members = [_]types.WorkspaceMember{
        .{
            .name = "test-pkg",
            .path = "./test-pkg",
            .abs_path = "/tmp/watch-test/test-pkg",
            .config_path = null,
            .deps_file_path = null,
        },
    };

    var watcher = try file_watcher.FileWatcher.init(allocator, &members, .{
        .poll_interval_ms = 100,
        .debounce_ms = 50,
    });
    defer watcher.deinit();

    try std.testing.expect(!watcher.should_stop.load(.acquire));
    try std.testing.expectEqual(@as(usize, 1), watcher.members.len);
}

test "FileWatcher - ignore patterns" {
    const allocator = std.testing.allocator;

    const members = [_]types.WorkspaceMember{
        .{
            .name = "test-pkg",
            .path = "./test-pkg",
            .abs_path = "/tmp/watch-test/test-pkg",
            .config_path = null,
            .deps_file_path = null,
        },
    };

    var watcher = try file_watcher.FileWatcher.init(allocator, &members, .{});
    defer watcher.deinit();

    // Test default ignore patterns
    try std.testing.expect(watcher.shouldIgnore("node_modules"));
    try std.testing.expect(watcher.shouldIgnore(".git"));
    try std.testing.expect(watcher.shouldIgnore("pantry_modules"));
    try std.testing.expect(watcher.shouldIgnore(".zig-cache"));
    try std.testing.expect(watcher.shouldIgnore("zig-out"));
    try std.testing.expect(watcher.shouldIgnore(".DS_Store"));

    // Test non-ignored patterns
    try std.testing.expect(!watcher.shouldIgnore("src"));
    try std.testing.expect(!watcher.shouldIgnore("index.ts"));
    try std.testing.expect(!watcher.shouldIgnore("package.json"));
}

test "FileWatcher - stop mechanism" {
    const allocator = std.testing.allocator;

    const members = [_]types.WorkspaceMember{
        .{
            .name = "test-pkg",
            .path = "./test-pkg",
            .abs_path = "/tmp/watch-test/test-pkg",
            .config_path = null,
            .deps_file_path = null,
        },
    };

    var watcher = try file_watcher.FileWatcher.init(allocator, &members, .{});
    defer watcher.deinit();

    try std.testing.expect(!watcher.should_stop.load(.acquire));
    watcher.stop();
    try std.testing.expect(watcher.should_stop.load(.acquire));
}
