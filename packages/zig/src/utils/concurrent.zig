const std = @import("std");
const io_helper = @import("../io_helper.zig");

/// Configuration for concurrent script execution
pub const ConcurrentConfig = struct {
    /// Maximum number of scripts to run concurrently
    max_concurrent: usize,
    /// Working directory for script execution
    cwd: []const u8,
    /// Allocator for managing resources
    allocator: std.mem.Allocator,
};

/// Result of a script execution
pub const ScriptResult = struct {
    name: []const u8,
    exit_code: u8,
    stdout: []const u8,
    stderr: []const u8,
    success: bool,

    pub fn deinit(self: *ScriptResult, allocator: std.mem.Allocator) void {
        allocator.free(self.name);
        allocator.free(self.stdout);
        allocator.free(self.stderr);
    }
};

/// Task for executing a script
const ScriptTask = struct {
    name: []const u8,
    command: []const u8,
    args: []const []const u8,
};

/// Execute multiple scripts concurrently with a concurrency limit
/// scripts: array of (name, command, args) tuples
/// config: configuration for concurrent execution
/// Returns array of ScriptResult
pub fn executeConcurrent(
    scripts: []const ScriptTask,
    config: ConcurrentConfig,
) ![]ScriptResult {
    const allocator = config.allocator;

    // No scripts to execute
    if (scripts.len == 0) {
        return try allocator.alloc(ScriptResult, 0);
    }

    // Single script - no need for concurrency
    if (scripts.len == 1) {
        var results = try allocator.alloc(ScriptResult, 1);
        results[0] = try executeScript(scripts[0], config);
        return results;
    }

    // Multiple scripts - use thread pool with concurrency limit
    const actual_concurrent = @min(config.max_concurrent, scripts.len);

    const results = try allocator.alloc(ScriptResult, scripts.len);
    errdefer {
        for (results, 0..) |*result, i| {
            if (i < scripts.len) {
                result.deinit(allocator);
            }
        }
        allocator.free(results);
    }

    // Use a mutex to protect shared state
    var mutex = std.Thread.Mutex{};
    var next_idx: usize = 0;
    var error_occurred = false;

    // Worker thread function
    const Worker = struct {
        fn run(
            tasks: []const ScriptTask,
            cfg: ConcurrentConfig,
            res: []ScriptResult,
            mtx: *std.Thread.Mutex,
            idx: *usize,
            had_error: *bool,
        ) void {
            while (true) {
                // Get next task index
                mtx.lock();
                const task_idx = idx.*;
                if (task_idx >= tasks.len or had_error.*) {
                    mtx.unlock();
                    return;
                }
                idx.* += 1;
                mtx.unlock();

                // Execute task
                res[task_idx] = executeScript(tasks[task_idx], cfg) catch |err| {
                    mtx.lock();
                    had_error.* = true;
                    mtx.unlock();

                    // Return error result
                    res[task_idx] = ScriptResult{
                        .name = cfg.allocator.dupe(u8, tasks[task_idx].name) catch "unknown",
                        .exit_code = 1,
                        .stdout = cfg.allocator.dupe(u8, "") catch "",
                        .stderr = std.fmt.allocPrint(cfg.allocator, "Error: {}", .{err}) catch "Error executing script",
                        .success = false,
                    };
                    return;
                };
            }
        }
    };

    // Create worker threads
    const threads = try allocator.alloc(std.Thread, actual_concurrent);
    defer allocator.free(threads);

    for (threads) |*thread| {
        thread.* = try std.Thread.spawn(.{}, Worker.run, .{
            scripts,
            config,
            results,
            &mutex,
            &next_idx,
            &error_occurred,
        });
    }

    // Wait for all threads to complete
    for (threads) |thread| {
        thread.join();
    }

    return results;
}

/// Execute a single script
fn executeScript(task: ScriptTask, config: ConcurrentConfig) !ScriptResult {
    const allocator = config.allocator;

    // Build argv for shell execution
    var argv_buf: [128][]const u8 = undefined;
    argv_buf[0] = "sh";
    argv_buf[1] = "-c";
    argv_buf[2] = task.command;
    argv_buf[3] = "_"; // sh placeholder for $0

    var argc: usize = 4;
    for (task.args) |arg| {
        if (argc >= argv_buf.len) break;
        argv_buf[argc] = arg;
        argc += 1;
    }

    // Execute the script
    const result = std.process.Child.run(.{
        .allocator = allocator,
        .argv = argv_buf[0..argc],
        .cwd = config.cwd,
    }) catch |err| {
        return ScriptResult{
            .name = try allocator.dupe(u8, task.name),
            .exit_code = 1,
            .stdout = try allocator.dupe(u8, ""),
            .stderr = try std.fmt.allocPrint(allocator, "Failed to execute: {}", .{err}),
            .success = false,
        };
    };

    return ScriptResult{
        .name = try allocator.dupe(u8, task.name),
        .exit_code = @as(u8, @intCast(result.term.Exited)),
        .stdout = result.stdout,
        .stderr = result.stderr,
        .success = result.term.Exited == 0,
    };
}

test "executeConcurrent with single script" {
    const allocator = std.testing.allocator;

    var tasks = [_]ScriptTask{
        .{
            .name = "echo-test",
            .command = "echo 'Hello, World!'",
            .args = &[_][]const u8{},
        },
    };

    const config = ConcurrentConfig{
        .max_concurrent = 4,
        .cwd = ".",
        .allocator = allocator,
    };

    const results = try executeConcurrent(&tasks, config);
    defer {
        for (results) |*result| {
            var r = result.*;
            r.deinit(allocator);
        }
        allocator.free(results);
    }

    try std.testing.expectEqual(@as(usize, 1), results.len);
    try std.testing.expect(results[0].success);
    try std.testing.expectEqualStrings("echo-test", results[0].name);
}

test "executeConcurrent with multiple scripts" {
    const allocator = std.testing.allocator;

    var tasks = [_]ScriptTask{
        .{
            .name = "task1",
            .command = "echo 'Task 1'",
            .args = &[_][]const u8{},
        },
        .{
            .name = "task2",
            .command = "echo 'Task 2'",
            .args = &[_][]const u8{},
        },
        .{
            .name = "task3",
            .command = "echo 'Task 3'",
            .args = &[_][]const u8{},
        },
    };

    const config = ConcurrentConfig{
        .max_concurrent = 2,
        .cwd = ".",
        .allocator = allocator,
    };

    const results = try executeConcurrent(&tasks, config);
    defer {
        for (results) |*result| {
            var r = result.*;
            r.deinit(allocator);
        }
        allocator.free(results);
    }

    try std.testing.expectEqual(@as(usize, 3), results.len);
    for (results) |result| {
        try std.testing.expect(result.success);
    }
}
