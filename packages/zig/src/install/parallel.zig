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

/// Thread context for parallel downloads using work-stealing pattern
const DownloadThreadContext = struct {
    tasks: []const DownloadTask,
    results: []DownloadResult,
    next: *std.atomic.Value(usize),
    alloc: std.mem.Allocator,
    total: usize,

    fn worker(ctx: *DownloadThreadContext) void {
        while (true) {
            const i = ctx.next.fetchAdd(1, .monotonic);
            if (i >= ctx.tasks.len) break;

            const task = ctx.tasks[i];
            std.debug.print("  [{d}/{d}] {s}...", .{ i + 1, ctx.total, task.name });

            downloader.downloadFile(ctx.alloc, task.url, task.dest_path) catch |err| {
                ctx.results[i] = .{
                    .name = task.name,
                    .success = false,
                    .error_msg = std.fmt.allocPrint(
                        ctx.alloc,
                        "Download failed: {}",
                        .{err},
                    ) catch null,
                };
                std.debug.print(" failed\n", .{});
                return;
            };

            ctx.results[i] = .{
                .name = task.name,
                .success = true,
                .error_msg = null,
            };
            std.debug.print(" done\n", .{});
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

    const results = try allocator.alloc(DownloadResult, tasks.len);
    errdefer allocator.free(results);

    // Initialize results
    for (results, 0..) |*result, i| {
        result.* = .{
            .name = tasks[i].name,
            .success = false,
            .error_msg = null,
        };
    }

    // For single task, just do it directly (no thread overhead)
    if (tasks.len == 1) {
        std.debug.print("  [1/1] {s}...", .{tasks[0].name});
        downloader.downloadFile(allocator, tasks[0].url, tasks[0].dest_path) catch |err| {
            results[0].error_msg = try std.fmt.allocPrint(allocator, "Download failed: {}", .{err});
            std.debug.print(" failed\n", .{});
            return results;
        };
        results[0].success = true;
        std.debug.print(" done\n", .{});
        return results;
    }

    // Parallel download using thread pool with work-stealing
    const cpu_count = std.Thread.getCpuCount() catch 4;
    const effective_max = @min(max_concurrent, @min(cpu_count, 32));
    const thread_count = @min(tasks.len, effective_max);

    var threads = try allocator.alloc(?std.Thread, thread_count);
    defer allocator.free(threads);
    for (threads) |*t| t.* = null;

    var next_idx = std.atomic.Value(usize).init(0);

    var ctx = DownloadThreadContext{
        .tasks = tasks,
        .results = results,
        .next = &next_idx,
        .alloc = allocator,
        .total = tasks.len,
    };

    // Spawn worker threads
    for (0..thread_count) |t| {
        threads[t] = std.Thread.spawn(.{}, DownloadThreadContext.worker, .{&ctx}) catch null;
    }

    // Main thread also participates
    ctx.worker();

    // Join all threads
    for (threads) |*t| {
        if (t.*) |thread| {
            thread.join();
            t.* = null;
        }
    }

    return results;
}

/// Thread context for parallel downloads with retry
const RetryDownloadThreadContext = struct {
    tasks: []const DownloadTask,
    results: []DownloadResult,
    next: *std.atomic.Value(usize),
    alloc: std.mem.Allocator,
    options: downloader.DownloadOptions,
    total: usize,

    fn worker(ctx: *RetryDownloadThreadContext) void {
        while (true) {
            const i = ctx.next.fetchAdd(1, .monotonic);
            if (i >= ctx.tasks.len) break;

            const task = ctx.tasks[i];
            std.debug.print("  [{d}/{d}] {s}...", .{ i + 1, ctx.total, task.name });

            downloader.downloadFileWithRetry(ctx.alloc, task.url, task.dest_path, ctx.options) catch |err| {
                ctx.results[i] = .{
                    .name = task.name,
                    .success = false,
                    .error_msg = std.fmt.allocPrint(
                        ctx.alloc,
                        "Download failed after retries: {}",
                        .{err},
                    ) catch null,
                };
                std.debug.print(" failed\n", .{});
                return;
            };

            ctx.results[i] = .{
                .name = task.name,
                .success = true,
                .error_msg = null,
            };
            std.debug.print(" done\n", .{});
        }
    }
};

/// Download multiple files with retry logic (parallel)
pub fn downloadParallelWithRetry(
    allocator: std.mem.Allocator,
    tasks: []const DownloadTask,
    max_concurrent: usize,
    options: downloader.DownloadOptions,
) ![]DownloadResult {
    if (tasks.len == 0) return try allocator.alloc(DownloadResult, 0);

    const results = try allocator.alloc(DownloadResult, tasks.len);
    errdefer allocator.free(results);

    // Initialize results
    for (results, 0..) |*result, i| {
        result.* = .{
            .name = tasks[i].name,
            .success = false,
            .error_msg = null,
        };
    }

    // For single task, just do it directly
    if (tasks.len == 1) {
        std.debug.print("  [1/1] {s}...", .{tasks[0].name});
        downloader.downloadFileWithRetry(allocator, tasks[0].url, tasks[0].dest_path, options) catch |err| {
            results[0].error_msg = try std.fmt.allocPrint(allocator, "Download failed after retries: {}", .{err});
            std.debug.print(" failed\n", .{});
            return results;
        };
        results[0].success = true;
        std.debug.print(" done\n", .{});
        return results;
    }

    // Parallel download with retry
    const cpu_count = std.Thread.getCpuCount() catch 4;
    const effective_max = @min(max_concurrent, @min(cpu_count, 32));
    const thread_count = @min(tasks.len, effective_max);

    var threads = try allocator.alloc(?std.Thread, thread_count);
    defer allocator.free(threads);
    for (threads) |*t| t.* = null;

    var next_idx = std.atomic.Value(usize).init(0);

    var ctx = RetryDownloadThreadContext{
        .tasks = tasks,
        .results = results,
        .next = &next_idx,
        .alloc = allocator,
        .options = options,
        .total = tasks.len,
    };

    for (0..thread_count) |t| {
        threads[t] = std.Thread.spawn(.{}, RetryDownloadThreadContext.worker, .{&ctx}) catch null;
    }
    ctx.worker();

    for (threads) |*t| {
        if (t.*) |thread| {
            thread.join();
            t.* = null;
        }
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

test "downloadParallel with empty tasks" {
    const allocator = std.testing.allocator;

    const tasks = try allocator.alloc(DownloadTask, 0);
    defer allocator.free(tasks);

    const results = try downloadParallel(allocator, tasks, 4);
    defer allocator.free(results);

    try std.testing.expectEqual(@as(usize, 0), results.len);
}
