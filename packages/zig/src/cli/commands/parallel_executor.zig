//! Parallel Script Executor
//!
//! Executes scripts across multiple workspace members in parallel,
//! respecting dependency order by processing in groups.

const std = @import("std");
const lib = @import("../../lib.zig");
const io_helper = lib.io_helper;

/// Result of a single script execution
pub const ScriptResult = struct {
    member_name: []const u8,
    success: bool,
    exit_code: u8,
    stdout: []const u8,
    stderr: []const u8,
    duration_ms: u64,
    allocator: std.mem.Allocator,

    pub fn deinit(self: *ScriptResult) void {
        self.allocator.free(self.member_name);
        self.allocator.free(self.stdout);
        self.allocator.free(self.stderr);
    }
};

/// Context for parallel script execution
const ExecutionContext = struct {
    allocator: std.mem.Allocator,
    member: lib.packages.types.WorkspaceMember,
    script_name: []const u8,
    script_args: []const []const u8,
    verbose: bool,
};

/// Execute a script in a workspace member
fn executeScript(ctx: ExecutionContext) !ScriptResult {
    const start_time = @as(i64, @intCast((std.posix.clock_gettime(.REALTIME) catch std.posix.timespec{ .sec = 0, .nsec = 0 }).sec * 1000));

    // Load scripts for this member
    const scripts_map = lib.config.findProjectScripts(ctx.allocator, ctx.member.abs_path) catch {
        return ScriptResult{
            .member_name = try ctx.allocator.dupe(u8, ctx.member.name),
            .success = false,
            .exit_code = 1,
            .stdout = try ctx.allocator.dupe(u8, ""),
            .stderr = try ctx.allocator.dupe(u8, "No scripts defined"),
            .duration_ms = 0,
            .allocator = ctx.allocator,
        };
    };

    if (scripts_map == null) {
        return ScriptResult{
            .member_name = try ctx.allocator.dupe(u8, ctx.member.name),
            .success = false,
            .exit_code = 1,
            .stdout = try ctx.allocator.dupe(u8, ""),
            .stderr = try ctx.allocator.dupe(u8, "No scripts defined"),
            .duration_ms = 0,
            .allocator = ctx.allocator,
        };
    }

    var scripts = scripts_map.?;
    defer {
        var it = scripts.iterator();
        while (it.next()) |entry| {
            ctx.allocator.free(entry.key_ptr.*);
            ctx.allocator.free(entry.value_ptr.*);
        }
        scripts.deinit();
    }

    // Check if the script exists
    const script_command = scripts.get(ctx.script_name) orelse {
        return ScriptResult{
            .member_name = try ctx.allocator.dupe(u8, ctx.member.name),
            .success = false,
            .exit_code = 1,
            .stdout = try ctx.allocator.dupe(u8, ""),
            .stderr = try ctx.allocator.dupe(u8, "Script not found"),
            .duration_ms = 0,
            .allocator = ctx.allocator,
        };
    };

    // Build command with args
    var command_list = std.ArrayList(u8){};
    defer command_list.deinit(ctx.allocator);

    try command_list.appendSlice(ctx.allocator, script_command);
    for (ctx.script_args) |arg| {
        try command_list.append(ctx.allocator, ' ');
        try command_list.appendSlice(ctx.allocator, arg);
    }

    const full_command = command_list.items;

    // Execute in member directory
    const result = io_helper.childRunWithOptions(ctx.allocator, &[_][]const u8{ "sh", "-c", full_command }, .{
        .cwd = ctx.member.abs_path,
    }) catch |err| {
        const err_msg = try std.fmt.allocPrint(ctx.allocator, "Execution failed: {}", .{err});
        return ScriptResult{
            .member_name = try ctx.allocator.dupe(u8, ctx.member.name),
            .success = false,
            .exit_code = 1,
            .stdout = try ctx.allocator.dupe(u8, ""),
            .stderr = err_msg,
            .duration_ms = @intCast(@as(i64, @intCast((std.posix.clock_gettime(.REALTIME) catch std.posix.timespec{ .sec = 0, .nsec = 0 }).sec * 1000)) - start_time),
            .allocator = ctx.allocator,
        };
    };

    const duration = @as(u64, @intCast(@as(i64, @intCast((std.posix.clock_gettime(.REALTIME) catch std.posix.timespec{ .sec = 0, .nsec = 0 }).sec * 1000)) - start_time));
    const success = io_helper.termExitedSuccessfully(result.term);

    return ScriptResult{
        .member_name = try ctx.allocator.dupe(u8, ctx.member.name),
        .success = success,
        .exit_code = io_helper.termGetExitCode(result.term) orelse 1,
        .stdout = result.stdout,
        .stderr = result.stderr,
        .duration_ms = duration,
        .allocator = ctx.allocator,
    };
}

/// Task for thread pool
const Task = struct {
    ctx: ExecutionContext,
    result: *?ScriptResult,
    mutex: *std.Thread.Mutex,
    error_occurred: *bool,
};

/// Worker function for thread pool
fn worker(task: Task) void {
    const result = executeScript(task.ctx) catch {
        task.mutex.lock();
        defer task.mutex.unlock();
        task.error_occurred.* = true;
        return;
    };

    task.mutex.lock();
    defer task.mutex.unlock();
    task.result.* = result;
}

/// Execute scripts in parallel across a group of members
pub fn executeParallelGroup(
    allocator: std.mem.Allocator,
    members: []const lib.packages.types.WorkspaceMember,
    script_name: []const u8,
    script_args: []const []const u8,
    verbose: bool,
) ![]ScriptResult {
    if (members.len == 0) {
        return try allocator.alloc(ScriptResult, 0);
    }

    // If only one member, execute directly
    if (members.len == 1) {
        var results = try allocator.alloc(ScriptResult, 1);
        results[0] = try executeScript(.{
            .allocator = allocator,
            .member = members[0],
            .script_name = script_name,
            .script_args = script_args,
            .verbose = verbose,
        });
        return results;
    }

    // Parallel execution for multiple members
    var results = try allocator.alloc(?ScriptResult, members.len);
    defer allocator.free(results);

    for (results) |*result| {
        result.* = null;
    }

    var threads = try allocator.alloc(std.Thread, members.len);
    defer allocator.free(threads);

    var mutex = std.Thread.Mutex{};
    var error_occurred = false;

    // Spawn threads
    for (members, 0..) |member, i| {
        const task = Task{
            .ctx = .{
                .allocator = allocator,
                .member = member,
                .script_name = script_name,
                .script_args = script_args,
                .verbose = verbose,
            },
            .result = &results[i],
            .mutex = &mutex,
            .error_occurred = &error_occurred,
        };

        threads[i] = try std.Thread.spawn(.{}, worker, .{task});
    }

    // Wait for all threads
    for (threads) |thread| {
        thread.join();
    }

    if (error_occurred) {
        // Clean up any results that were created
        for (results) |*opt_result| {
            if (opt_result.*) |*result| {
                result.deinit();
            }
        }
        return error.ExecutionFailed;
    }

    // Collect results
    var final_results = try allocator.alloc(ScriptResult, members.len);
    for (results, 0..) |opt_result, i| {
        if (opt_result) |result| {
            final_results[i] = result;
        } else {
            return error.MissingResult;
        }
    }

    return final_results;
}

// ============================================================================
// Tests
// ============================================================================

test "executeScript - basic execution" {
    const allocator = std.testing.allocator;

    const member = lib.packages.types.WorkspaceMember{
        .name = "test",
        .path = "./test",
        .abs_path = "/tmp",
        .config_path = null,
        .deps_file_path = null,
    };

    // This will fail since /tmp doesn't have scripts, but tests the structure
    const ctx = ExecutionContext{
        .allocator = allocator,
        .member = member,
        .script_name = "test",
        .script_args = &[_][]const u8{},
        .verbose = false,
    };

    var result = try executeScript(ctx);
    defer result.deinit();

    try std.testing.expect(!result.success); // No scripts in /tmp
    try std.testing.expectEqualStrings("test", result.member_name);
}

test "executeParallelGroup - empty group" {
    const allocator = std.testing.allocator;

    const members = [_]lib.packages.types.WorkspaceMember{};
    const results = try executeParallelGroup(
        allocator,
        &members,
        "test",
        &[_][]const u8{},
        false,
    );
    defer allocator.free(results);

    try std.testing.expect(results.len == 0);
}
