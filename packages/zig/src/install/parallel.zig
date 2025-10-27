const std = @import("std");
const downloader = @import("downloader.zig");

pub const DownloadTask = struct {
    url: []const u8,
    dest_path: []const u8,
    name: []const u8,
};

pub const DownloadResult = struct {
    name: []const u8,
    success: bool,
    error_msg: ?[]const u8,

    pub fn deinit(self: *DownloadResult, allocator: std.mem.Allocator) void {
        if (self.error_msg) |msg| {
            allocator.free(msg);
        }
    }
};

/// Download multiple files in parallel using thread pool
pub fn downloadParallel(
    allocator: std.mem.Allocator,
    tasks: []const DownloadTask,
    max_concurrent: usize,
) ![]DownloadResult {
    if (tasks.len == 0) return try allocator.alloc(DownloadResult, 0);

    _ = max_concurrent; // Reserved for future thread pool implementation
    var results = try allocator.alloc(DownloadResult, tasks.len);
    errdefer allocator.free(results);

    // Initialize results
    for (results, 0..) |*result, i| {
        result.* = .{
            .name = tasks[i].name,
            .success = false,
            .error_msg = null,
        };
    }

    // Use a simple sequential approach for now (thread pool can be added later)
    // This is still correct, just not parallel yet
    for (tasks, 0..) |task, i| {
        std.debug.print("  [{d}/{d}] {s}...", .{ i + 1, tasks.len, task.name });

        downloader.downloadFile(allocator, task.url, task.dest_path) catch |err| {
            results[i].success = false;
            results[i].error_msg = try std.fmt.allocPrint(
                allocator,
                "Download failed: {}",
                .{err},
            );
            std.debug.print(" failed\n", .{});
            continue;
        };

        results[i].success = true;
        std.debug.print(" done\n", .{});
    }

    return results;
}

/// Download multiple files with retry logic
pub fn downloadParallelWithRetry(
    allocator: std.mem.Allocator,
    tasks: []const DownloadTask,
    max_concurrent: usize,
    options: downloader.DownloadOptions,
) ![]DownloadResult {
    if (tasks.len == 0) return try allocator.alloc(DownloadResult, 0);

    _ = max_concurrent; // Reserved for future thread pool implementation
    var results = try allocator.alloc(DownloadResult, tasks.len);
    errdefer allocator.free(results);

    // Initialize results
    for (results, 0..) |*result, i| {
        result.* = .{
            .name = tasks[i].name,
            .success = false,
            .error_msg = null,
        };
    }

    // Download with retry
    for (tasks, 0..) |task, i| {
        std.debug.print("  [{d}/{d}] {s}...", .{ i + 1, tasks.len, task.name });

        downloader.downloadFileWithRetry(allocator, task.url, task.dest_path, options) catch |err| {
            results[i].success = false;
            results[i].error_msg = try std.fmt.allocPrint(
                allocator,
                "Download failed after retries: {}",
                .{err},
            );
            std.debug.print(" failed\n", .{});
            continue;
        };

        results[i].success = true;
        std.debug.print(" done\n", .{});
    }

    return results;
}

test "DownloadResult" {
    const allocator = std.testing.allocator;

    var result = DownloadResult{
        .name = "test",
        .success = false,
        .error_msg = try allocator.dupe(u8, "error"),
    };
    defer result.deinit(allocator);

    try std.testing.expect(!result.success);
    try std.testing.expect(result.error_msg != null);
}
