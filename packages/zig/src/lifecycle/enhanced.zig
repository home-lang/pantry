const std = @import("std");
const io_helper = @import("../io_helper.zig");
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

    const start_time = @as(i64, @intCast((std.posix.clock_gettime(.REALTIME) catch std.posix.timespec{ .sec = 0, .nsec = 0 }).sec * 1000));

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

    const duration_ms = @as(u64, @intCast(@as(i64, @intCast((std.posix.clock_gettime(.REALTIME) catch std.posix.timespec{ .sec = 0, .nsec = 0 }).sec * 1000)) - start_time));

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

    const start = @as(i64, @intCast((std.posix.clock_gettime(.REALTIME) catch std.posix.timespec{ .sec = 0, .nsec = 0 }).sec * 1000));

    // Poll for completion
    while (true) {
        const elapsed = @as(u64, @intCast(@as(i64, @intCast((std.posix.clock_gettime(.REALTIME) catch std.posix.timespec{ .sec = 0, .nsec = 0 }).sec * 1000)) - start));
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

    const start_time = @as(i64, @intCast((std.posix.clock_gettime(.REALTIME) catch std.posix.timespec{ .sec = 0, .nsec = 0 }).sec * 1000));

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

    const end_time = @as(i64, @intCast((std.posix.clock_gettime(.REALTIME) catch std.posix.timespec{ .sec = 0, .nsec = 0 }).sec * 1000));
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
    if (options.base.ignore_scripts) {
        return ScriptResult{
            .success = true,
            .exit_code = 0,
            .stdout = null,
            .stderr = null,
        };
    }

    const start_time = @as(i64, @intCast((std.posix.clock_gettime(.REALTIME) catch std.posix.timespec{ .sec = 0, .nsec = 0 }).sec * 1000));
    const builtin = @import("builtin");

    // Build sandboxed command based on OS
    var cmd_args = std.ArrayList([]const u8).init(allocator);
    defer cmd_args.deinit();

    switch (builtin.os.tag) {
        .linux => {
            // Use bwrap (bubblewrap) for Linux sandboxing if available
            // This is a lightweight sandboxing tool similar to what Flatpak uses
            try cmd_args.append("bwrap");

            // Basic filesystem isolation
            try cmd_args.append("--unshare-all");
            try cmd_args.append("--share-net"); // Share network by default, can be restricted
            try cmd_args.append("--die-with-parent");

            // Mount essential directories read-only
            try cmd_args.append("--ro-bind");
            try cmd_args.append("/usr");
            try cmd_args.append("/usr");

            try cmd_args.append("--ro-bind");
            try cmd_args.append("/lib");
            try cmd_args.append("/lib");

            try cmd_args.append("--ro-bind");
            try cmd_args.append("/lib64");
            try cmd_args.append("/lib64");

            try cmd_args.append("--ro-bind");
            try cmd_args.append("/bin");
            try cmd_args.append("/bin");

            // Provide basic system files
            try cmd_args.append("--ro-bind");
            try cmd_args.append("/etc/resolv.conf");
            try cmd_args.append("/etc/resolv.conf");

            try cmd_args.append("--proc");
            try cmd_args.append("/proc");

            try cmd_args.append("--dev");
            try cmd_args.append("/dev");

            try cmd_args.append("--tmpfs");
            try cmd_args.append("/tmp");

            // Add read paths
            for (sandbox_config.read_paths) |path| {
                try cmd_args.append("--ro-bind");
                try cmd_args.append(path);
                try cmd_args.append(path);
            }

            // Add write paths
            for (sandbox_config.write_paths) |path| {
                try cmd_args.append("--bind");
                try cmd_args.append(path);
                try cmd_args.append(path);
            }

            // Restrict network if configured
            if (!sandbox_config.allow_network) {
                // Remove --share-net and use --unshare-net instead
                // This requires rebuilding the command - for now, log warning
                std.debug.print("Warning: Network restriction not fully implemented\n", .{});
            }

            // Execute the actual command
            try cmd_args.append("sh");
            try cmd_args.append("-c");
            try cmd_args.append(script_cmd);
        },
        .macos => {
            // macOS: Use sandbox-exec with a profile
            // Create a temporary sandbox profile
            const profile = try std.fmt.allocPrint(allocator,
                \\(version 1)
                \\(deny default)
                \\(allow process*)
                \\(allow sysctl-read)
                \\(allow mach-lookup)
                \\(allow ipc-posix-shm)
                \\
            , .{});
            defer allocator.free(profile);

            // For read paths
            var profile_with_paths = std.ArrayList(u8).init(allocator);
            defer profile_with_paths.deinit();

            try profile_with_paths.appendSlice(profile);

            for (sandbox_config.read_paths) |path| {
                const rule = try std.fmt.allocPrint(allocator, "(allow file-read* (subpath \"{s}\"))\n", .{path});
                defer allocator.free(rule);
                try profile_with_paths.appendSlice(rule);
            }

            for (sandbox_config.write_paths) |path| {
                const rule = try std.fmt.allocPrint(allocator, "(allow file-write* (subpath \"{s}\"))\n", .{path});
                defer allocator.free(rule);
                try profile_with_paths.appendSlice(rule);
            }

            if (sandbox_config.allow_network) {
                try profile_with_paths.appendSlice("(allow network*)\n");
            }

            // Write profile to temp file
            const profile_path = try std.fmt.allocPrint(allocator, "/tmp/pantry-sandbox-{d}.sb", .{@as(i64, @intCast((std.posix.clock_gettime(.REALTIME) catch std.posix.timespec{ .sec = 0, .nsec = 0 }).sec * 1000))});
            defer allocator.free(profile_path);

            const profile_file = try io_helper.cwd().createFile(io_helper.io, profile_path, .{});
            defer {
                profile_file.close(io_helper.io);
                io_helper.deleteFile(profile_path) catch {};
            }
            try io_helper.writeAllToFile(profile_file, profile_with_paths.items);

            try cmd_args.append("sandbox-exec");
            try cmd_args.append("-f");
            try cmd_args.append(profile_path);
            try cmd_args.append("sh");
            try cmd_args.append("-c");
            try cmd_args.append(script_cmd);
        },
        .windows => {
            // Windows: AppContainer would require Win32 API calls
            // For now, fall back to regular execution with a warning
            std.debug.print("Warning: Sandboxing not fully supported on Windows\n", .{});
            return try executeScriptWithRetry(allocator, script_name, script_cmd, options);
        },
        else => {
            // Unsupported OS - execute without sandboxing but warn
            std.debug.print("Warning: Sandboxing not supported on this platform\n", .{});
            return try executeScriptWithRetry(allocator, script_name, script_cmd, options);
        },
    }

    // Create child process with sandboxed command
    var child = std.process.Child.init(cmd_args.items, allocator);
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

    const duration_ms = @as(u64, @intCast(@as(i64, @intCast((std.posix.clock_gettime(.REALTIME) catch std.posix.timespec{ .sec = 0, .nsec = 0 }).sec * 1000)) - start_time));

    // Check if timed out
    if (timeout_result == .timeout) {
        _ = child.kill() catch {};

        const error_msg = try std.fmt.allocPrint(
            allocator,
            "Sandboxed script timed out after {d}ms",
            .{duration_ms},
        );

        return ScriptResult{
            .success = false,
            .exit_code = 124,
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
        std.debug.print("  Sandboxed execution duration: {d}ms\n", .{duration_ms});
        std.debug.print("  Exit code: {d}\n", .{exit_code});
    }

    return ScriptResult{
        .success = success,
        .exit_code = exit_code,
        .stdout = stdout,
        .stderr = stderr,
    };
}
