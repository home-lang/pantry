const std = @import("std");
const lifecycle = @import("../lifecycle.zig");

const LifecycleScript = lifecycle.LifecycleScript;
const ScriptResult = lifecycle.ScriptResult;
const ScriptOptions = lifecycle.ScriptOptions;

/// Enhanced script execution options
pub const EnhancedScriptOptions = struct {
    /// Base options
    base: ScriptOptions,
    /// Maximum execution time in milliseconds (0 = no timeout)
    timeout_ms: u64 = 120000,
    /// Number of retry attempts on failure
    retry_attempts: u8 = 0,
    /// Delay between retries in milliseconds
    retry_delay_ms: u64 = 1000,
    /// Continue on error (don't fail entire operation)
    continue_on_error: bool = false,
    /// Sandbox mode (restrict file system access)
    sandbox: bool = false,
    /// Environment variables to inject
    env_vars: ?std.StringHashMap([]const u8) = null,
    /// Capture output
    capture_output: bool = true,
};

/// Script execution statistics
pub const ExecutionStats = struct {
    total_scripts: usize = 0,
    successful: usize = 0,
    failed: usize = 0,
    skipped: usize = 0,
    total_duration_ms: u64 = 0,
    errors: std.ArrayList(ScriptError),

    pub fn init(allocator: std.mem.Allocator) ExecutionStats {
        return .{
            .errors = std.ArrayList(ScriptError).init(allocator),
        };
    }

    pub fn deinit(self: *ExecutionStats) void {
        for (self.errors.items) |*err| {
            err.deinit(self.errors.allocator);
        }
        self.errors.deinit();
    }
};

/// Script error information
pub const ScriptError = struct {
    package_name: []const u8,
    script_name: []const u8,
    error_message: []const u8,
    exit_code: u8,

    pub fn deinit(self: *ScriptError, allocator: std.mem.Allocator) void {
        allocator.free(self.package_name);
        allocator.free(self.script_name);
        allocator.free(self.error_message);
    }
};

/// Execute script with timeout
pub fn executeScriptWithTimeout(
    allocator: std.mem.Allocator,
    _: []const u8,
    script_cmd: []const u8,
    options: EnhancedScriptOptions,
) !ScriptResult {
    if (options.base.ignore_scripts) {
        return ScriptResult{
            .success = true,
            .exit_code = 0,
            .stdout = null,
            .stderr = null,
        };
    }

    const start_time = std.time.milliTimestamp();

    // Create child process
    var child = std.process.Child.init(
        &[_][]const u8{
            if (@import("builtin").os.tag == .windows) "cmd" else "sh",
            if (@import("builtin").os.tag == .windows) "/C" else "-c",
            script_cmd,
        },
        allocator,
    );

    child.cwd = options.base.cwd;

    // Set up environment variables
    if (options.env_vars) |env_vars| {
        child.env_map = &env_vars;
    }

    // Capture output if requested
    if (options.capture_output) {
        child.stdout_behavior = .Pipe;
        child.stderr_behavior = .Pipe;
    } else {
        child.stdout_behavior = .Inherit;
        child.stderr_behavior = .Inherit;
    }

    // Spawn the process
    try child.spawn();

    // Wait with timeout
    const timeout_result = if (options.timeout_ms > 0)
        try waitWithTimeout(&child, options.timeout_ms)
    else
        try child.wait();

    const duration_ms = @as(u64, @intCast(std.time.milliTimestamp() - start_time));

    // Check if timed out
    if (timeout_result == .timeout) {
        // Kill the process
        _ = child.kill() catch {};

        const error_msg = try std.fmt.allocPrint(
            allocator,
            "Script timed out after {d}ms",
            .{duration_ms},
        );

        return ScriptResult{
            .success = false,
            .exit_code = 124, // Standard timeout exit code
            .stdout = null,
            .stderr = error_msg,
        };
    }

    // Get output if captured
    var stdout: ?[]const u8 = null;
    var stderr: ?[]const u8 = null;

    if (options.capture_output) {
        if (child.stdout) |stdout_pipe| {
            const output = try stdout_pipe.readToEndAlloc(allocator, 10 * 1024 * 1024);
            stdout = output;
        }

        if (child.stderr) |stderr_pipe| {
            const output = try stderr_pipe.readToEndAlloc(allocator, 10 * 1024 * 1024);
            stderr = output;
        }
    }

    const success = switch (timeout_result) {
        .success => |term| switch (term) {
            .Exited => |code| code == 0,
            else => false,
        },
        .timeout => false,
    };

    const exit_code: u8 = switch (timeout_result) {
        .success => |term| switch (term) {
            .Exited => |code| @intCast(code),
            else => 1,
        },
        .timeout => 124,
    };

    if (options.base.verbose) {
        std.debug.print("  Duration: {d}ms\n", .{duration_ms});
        std.debug.print("  Exit code: {d}\n", .{exit_code});
    }

    return ScriptResult{
        .success = success,
        .exit_code = exit_code,
        .stdout = stdout,
        .stderr = stderr,
    };
}

/// Wait result with timeout handling
const WaitResult = union(enum) {
    success: std.process.Child.Term,
    timeout,
};

/// Wait for child process with timeout
fn waitWithTimeout(child: *std.process.Child, timeout_ms: u64) !WaitResult {
    // Simplified timeout implementation
    // Real implementation would use threading or polling

    const start = std.time.milliTimestamp();

    // Poll for completion
    while (true) {
        const elapsed = @as(u64, @intCast(std.time.milliTimestamp() - start));
        if (elapsed > timeout_ms) {
            return .timeout;
        }

        // Check if process is still running (non-blocking)
        const term = child.wait() catch |err| {
            if (err == error.WouldBlock) {
                // Still running, sleep briefly
                std.time.sleep(100 * std.time.ns_per_ms);
                continue;
            }
            return err;
        };

        return .{ .success = term };
    }
}

/// Execute script with retries
pub fn executeScriptWithRetry(
    allocator: std.mem.Allocator,
    script_name: []const u8,
    script_cmd: []const u8,
    options: EnhancedScriptOptions,
) !ScriptResult {
    var attempts: u8 = 0;
    var last_result: ?ScriptResult = null;

    while (attempts <= options.retry_attempts) : (attempts += 1) {
        if (attempts > 0) {
            if (options.base.verbose) {
                std.debug.print("  Retry attempt {d}/{d}\n", .{ attempts, options.retry_attempts });
            }
            std.time.sleep(options.retry_delay_ms * std.time.ns_per_ms);
        }

        const result = try executeScriptWithTimeout(
            allocator,
            script_name,
            script_cmd,
            options,
        );

        if (result.success) {
            // Clean up previous result if any
            if (last_result) |*lr| {
                lr.deinit(allocator);
            }
            return result;
        }

        // Clean up previous result and store new one
        if (last_result) |*lr| {
            lr.deinit(allocator);
        }
        last_result = result;
    }

    // All retries exhausted, return last result
    return last_result.?;
}

/// Parallel script execution result
pub const ParallelExecutionResult = struct {
    results: []ScriptResult,
    stats: ExecutionStats,

    pub fn deinit(self: *ParallelExecutionResult, allocator: std.mem.Allocator) void {
        for (self.results) |*result| {
            result.deinit(allocator);
        }
        allocator.free(self.results);
        self.stats.deinit();
    }
};

/// Execute multiple scripts in parallel
pub fn executeScriptsParallel(
    allocator: std.mem.Allocator,
    scripts: []const struct {
        package_name: []const u8,
        script_name: []const u8,
        script_cmd: []const u8,
        package_path: []const u8,
    },
    options: EnhancedScriptOptions,
) !ParallelExecutionResult {
    var results = try allocator.alloc(ScriptResult, scripts.len);
    errdefer allocator.free(results);

    var stats = ExecutionStats.init(allocator);
    errdefer stats.deinit();

    const start_time = std.time.milliTimestamp();

    // For now, execute sequentially
    // Real parallel implementation would use thread pool
    for (scripts, 0..) |script, i| {
        if (options.base.verbose) {
            std.debug.print("Running {s} for {s}...\n", .{ script.script_name, script.package_name });
        }

        var script_options = options;
        script_options.base.cwd = script.package_path;

        const result = executeScriptWithRetry(
            allocator,
            script.script_name,
            script.script_cmd,
            script_options,
        ) catch |err| {
            results[i] = ScriptResult{
                .success = false,
                .exit_code = 1,
                .stdout = null,
                .stderr = try std.fmt.allocPrint(allocator, "Error: {}", .{err}),
            };

            stats.failed += 1;
            stats.total_scripts += 1;

            try stats.errors.append(.{
                .package_name = try allocator.dupe(u8, script.package_name),
                .script_name = try allocator.dupe(u8, script.script_name),
                .error_message = try std.fmt.allocPrint(allocator, "Error: {}", .{err}),
                .exit_code = 1,
            });

            if (!options.continue_on_error) {
                return error.ScriptExecutionFailed;
            }

            continue;
        };

        results[i] = result;
        stats.total_scripts += 1;

        if (result.success) {
            stats.successful += 1;
        } else {
            stats.failed += 1;

            const error_msg = if (result.stderr) |stderr|
                try allocator.dupe(u8, stderr)
            else
                try allocator.dupe(u8, "Script failed");

            try stats.errors.append(.{
                .package_name = try allocator.dupe(u8, script.package_name),
                .script_name = try allocator.dupe(u8, script.script_name),
                .error_message = error_msg,
                .exit_code = result.exit_code,
            });

            if (!options.continue_on_error) {
                return error.ScriptExecutionFailed;
            }
        }
    }

    const end_time = std.time.milliTimestamp();
    stats.total_duration_ms = @intCast(end_time - start_time);

    return .{
        .results = results,
        .stats = stats,
    };
}

/// Sandbox configuration
pub const SandboxConfig = struct {
    /// Allow network access
    allow_network: bool = false,
    /// Allow read access to these directories
    read_paths: []const []const u8 = &.{},
    /// Allow write access to these directories
    write_paths: []const []const u8 = &.{},
    /// Maximum memory usage in bytes
    max_memory: ?usize = null,
};

/// Execute script in sandbox
pub fn executeScriptSandboxed(
    allocator: std.mem.Allocator,
    script_name: []const u8,
    script_cmd: []const u8,
    options: EnhancedScriptOptions,
    sandbox_config: SandboxConfig,
) !ScriptResult {
    _ = sandbox_config; // TODO: Implement sandboxing

    // For now, just execute normally
    // Real implementation would use:
    // - chroot/jail on Unix
    // - AppContainer on Windows
    // - cgroups for resource limits
    // - seccomp for syscall filtering

    return try executeScriptWithRetry(allocator, script_name, script_cmd, options);
}
