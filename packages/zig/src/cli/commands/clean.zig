const std = @import("std");
const common = @import("common.zig");
const lib = @import("../../lib.zig");

const CommandResult = common.CommandResult;
const Paths = lib.Paths;

/// Clean targets
pub const CleanTarget = enum {
    cache,
    temp,
    logs,
    all,

    pub fn fromString(s: []const u8) ?CleanTarget {
        if (std.mem.eql(u8, s, "cache")) return .cache;
        if (std.mem.eql(u8, s, "temp")) return .temp;
        if (std.mem.eql(u8, s, "logs")) return .logs;
        if (std.mem.eql(u8, s, "all")) return .all;
        return null;
    }
};

/// Clean cache and temporary files
pub fn execute(allocator: std.mem.Allocator, args: []const []const u8) !CommandResult {
    const stdout = std.io.getStdOut().writer();

    // Parse args
    var target = CleanTarget.all;
    var force = false;

    for (args) |arg| {
        if (std.mem.eql(u8, arg, "--force") or std.mem.eql(u8, arg, "-f")) {
            force = true;
        } else if (CleanTarget.fromString(arg)) |t| {
            target = t;
        }
    }

    // Confirm unless --force
    if (!force) {
        try stdout.print("This will remove cached packages and temporary files.\n", .{});
        try stdout.print("Are you sure? (y/N): ", .{});

        var stdin = std.io.getStdIn().reader();
        var buffer: [10]u8 = undefined;
        const input = (try stdin.readUntilDelimiterOrEof(&buffer, '\n')) orelse "";

        if (input.len == 0 or (input[0] != 'y' and input[0] != 'Y')) {
            return CommandResult.success(allocator, "Cancelled");
        }
    }

    try stdout.print("\n🧹 Cleaning...\n\n", .{});

    var total_size: usize = 0;
    var files_removed: usize = 0;

    // Clean based on target
    switch (target) {
        .cache => {
            const result = try cleanCache(allocator);
            total_size += result.size;
            files_removed += result.count;
        },
        .temp => {
            const result = try cleanTemp(allocator);
            total_size += result.size;
            files_removed += result.count;
        },
        .logs => {
            const result = try cleanLogs(allocator);
            total_size += result.size;
            files_removed += result.count;
        },
        .all => {
            var result = try cleanCache(allocator);
            total_size += result.size;
            files_removed += result.count;

            result = try cleanTemp(allocator);
            total_size += result.size;
            files_removed += result.count;

            result = try cleanLogs(allocator);
            total_size += result.size;
            files_removed += result.count;
        },
    }

    // Format size
    const size_str = try formatSize(allocator, total_size);
    defer allocator.free(size_str);

    try stdout.print("\n✨ Cleaned {d} file{s} ({s})\n", .{
        files_removed,
        if (files_removed == 1) "" else "s",
        size_str,
    });

    const message = try std.fmt.allocPrint(
        allocator,
        "Freed {s} of disk space",
        .{size_str},
    );

    return CommandResult{
        .exit_code = 0,
        .message = message,
    };
}

const CleanResult = struct {
    count: usize,
    size: usize,
};

/// Clean package cache
fn cleanCache(allocator: std.mem.Allocator) !CleanResult {
    const stdout = std.io.getStdOut().writer();
    try stdout.print("Cleaning package cache... ", .{});

    const cache_dir = try Paths.cache(allocator);
    defer allocator.free(cache_dir);

    const result = try removeDirectory(allocator, cache_dir);

    // Recreate empty cache directory
    try std.fs.cwd().makePath(cache_dir);

    try stdout.print("✓ Removed {d} files\n", .{result.count});

    return result;
}

/// Clean temporary files
fn cleanTemp(allocator: std.mem.Allocator) !CleanResult {
    const stdout = std.io.getStdOut().writer();
    try stdout.print("Cleaning temporary files... ", .{});

    const data_dir = try Paths.data(allocator);
    defer allocator.free(data_dir);

    const temp_dir = try std.fmt.allocPrint(allocator, "{s}/tmp", .{data_dir});
    defer allocator.free(temp_dir);

    const result = try removeDirectory(allocator, temp_dir);

    // Recreate empty temp directory
    try std.fs.cwd().makePath(temp_dir);

    try stdout.print("✓ Removed {d} files\n", .{result.count});

    return result;
}

/// Clean log files
fn cleanLogs(allocator: std.mem.Allocator) !CleanResult {
    const stdout = std.io.getStdOut().writer();
    try stdout.print("Cleaning log files... ", .{});

    const data_dir = try Paths.data(allocator);
    defer allocator.free(data_dir);

    const logs_dir = try std.fmt.allocPrint(allocator, "{s}/logs", .{data_dir});
    defer allocator.free(logs_dir);

    const result = try removeDirectory(allocator, logs_dir);

    // Recreate empty logs directory
    try std.fs.cwd().makePath(logs_dir);

    try stdout.print("✓ Removed {d} files\n", .{result.count});

    return result;
}

/// Remove directory and return stats
fn removeDirectory(allocator: std.mem.Allocator, path: []const u8) !CleanResult {
    _ = allocator;

    var count: usize = 0;
    var size: usize = 0;

    var dir = std.fs.cwd().openDir(path, .{ .iterate = true }) catch {
        // Directory doesn't exist or can't be opened
        return CleanResult{ .count = 0, .size = 0 };
    };
    defer dir.close();

    var iter = dir.iterate();
    while (try iter.next()) |entry| {
        if (entry.kind == .file) {
            const stat = dir.statFile(entry.name) catch continue;
            size += stat.size;
            count += 1;

            dir.deleteFile(entry.name) catch {};
        } else if (entry.kind == .directory) {
            dir.deleteTree(entry.name) catch {};
            count += 1;
        }
    }

    return CleanResult{
        .count = count,
        .size = size,
    };
}

/// Format size in human-readable format
fn formatSize(allocator: std.mem.Allocator, bytes: usize) ![]const u8 {
    if (bytes >= 1024 * 1024 * 1024) {
        const gb = @as(f64, @floatFromInt(bytes)) / (1024.0 * 1024.0 * 1024.0);
        return try std.fmt.allocPrint(allocator, "{d:.2} GB", .{gb});
    } else if (bytes >= 1024 * 1024) {
        const mb = @as(f64, @floatFromInt(bytes)) / (1024.0 * 1024.0);
        return try std.fmt.allocPrint(allocator, "{d:.2} MB", .{mb});
    } else if (bytes >= 1024) {
        const kb = @as(f64, @floatFromInt(bytes)) / 1024.0;
        return try std.fmt.allocPrint(allocator, "{d:.2} KB", .{kb});
    } else {
        return try std.fmt.allocPrint(allocator, "{d} bytes", .{bytes});
    }
}
