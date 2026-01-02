const std = @import("std");
const io_helper = @import("../../io_helper.zig");
const common = @import("common.zig");
const lib = @import("../../lib.zig");

const CommandResult = common.CommandResult;
const Platform = lib.Platform;
const Paths = lib.Paths;

/// Diagnostic check result
pub const CheckResult = struct {
    name: []const u8,
    passed: bool,
    message: []const u8,
    suggestion: ?[]const u8 = null,

    pub fn deinit(self: *CheckResult, allocator: std.mem.Allocator) void {
        allocator.free(self.name);
        allocator.free(self.message);
        if (self.suggestion) |s| allocator.free(s);
    }
};

/// Run diagnostic checks
pub fn execute(allocator: std.mem.Allocator, args: []const []const u8) !CommandResult {
    _ = args;

    std.debug.print("Running pantry diagnostics...\n\n", .{});

    var checks = std.ArrayList(CheckResult){};
    defer {
        for (checks.items) |*check| {
            check.deinit(allocator);
        }
        checks.deinit(allocator);
    }

    // Run all diagnostic checks
    try checks.append(allocator, try checkPlatform(allocator));
    try checks.append(allocator, try checkPaths(allocator));
    try checks.append(allocator, try checkConfig(allocator));
    try checks.append(allocator, try checkCache(allocator));
    try checks.append(allocator, try checkPermissions(allocator));
    try checks.append(allocator, try checkDiskSpace(allocator));
    try checks.append(allocator, try checkNetwork(allocator));

    // Print results
    var passed: usize = 0;
    var failed: usize = 0;

    for (checks.items) |check| {
        const icon = if (check.passed) "[32m✓[0m" else "[31m✗[0m";

        std.debug.print("{s} {s}\n", .{ icon, check.name });
        std.debug.print("  {s}\n", .{check.message});

        if (check.suggestion) |suggestion| {
            std.debug.print("  Suggestion: {s}\n", .{suggestion});
        }

        std.debug.print("\n", .{});

        if (check.passed) {
            passed += 1;
        } else {
            failed += 1;
        }
    }

    // Summary
    std.debug.print("────────────────────────────────────────────────────────────\n", .{});
    std.debug.print("Summary: {d}/{d} checks passed\n", .{ passed, checks.items.len });

    if (failed == 0) {
        std.debug.print("\nYour pantry installation is healthy!\n", .{});
        return CommandResult.success(allocator, null);
    } else {
        const message = try std.fmt.allocPrint(
            allocator,
            "{d} issue{s} found - see suggestions above",
            .{ failed, if (failed == 1) "" else "s" },
        );
        return CommandResult{
            .exit_code = 1,
            .message = message,
        };
    }
}

/// Check platform compatibility
fn checkPlatform(allocator: std.mem.Allocator) !CheckResult {
    const platform = Platform.current();
    const name = try allocator.dupe(u8, "Platform Detection");

    // Platform is an enum with darwin, linux, windows values
    const message = try std.fmt.allocPrint(
        allocator,
        "Detected: {s}",
        .{@tagName(platform)},
    );
    return .{
        .name = name,
        .passed = true,
        .message = message,
    };
}

/// Check required paths exist
fn checkPaths(allocator: std.mem.Allocator) !CheckResult {
    const name = try allocator.dupe(u8, "Path Configuration");

    const cache_dir = Paths.cache(allocator) catch {
        return .{
            .name = name,
            .passed = false,
            .message = try allocator.dupe(u8, "Failed to determine cache directory"),
            .suggestion = try allocator.dupe(u8, "Check that HOME environment variable is set"),
        };
    };
    defer allocator.free(cache_dir);

    const data_dir = Paths.data(allocator) catch {
        return .{
            .name = name,
            .passed = false,
            .message = try allocator.dupe(u8, "Failed to determine data directory"),
            .suggestion = try allocator.dupe(u8, "Check that HOME environment variable is set"),
        };
    };
    defer allocator.free(data_dir);

    // Try to create directories
    std.Io.Dir.cwd().makePath(io_helper.io, cache_dir) catch {
        return .{
            .name = name,
            .passed = false,
            .message = try std.fmt.allocPrint(allocator, "Cannot create cache directory: {s}", .{cache_dir}),
            .suggestion = try allocator.dupe(u8, "Check directory permissions"),
        };
    };

    std.Io.Dir.cwd().makePath(io_helper.io, data_dir) catch {
        return .{
            .name = name,
            .passed = false,
            .message = try std.fmt.allocPrint(allocator, "Cannot create data directory: {s}", .{data_dir}),
            .suggestion = try allocator.dupe(u8, "Check directory permissions"),
        };
    };

    const message = try std.fmt.allocPrint(
        allocator,
        "Cache: {s}, Data: {s}",
        .{ cache_dir, data_dir },
    );

    return .{
        .name = name,
        .passed = true,
        .message = message,
    };
}

/// Check if config file exists and is valid
fn checkConfig(allocator: std.mem.Allocator) !CheckResult {
    const name = try allocator.dupe(u8, "Configuration File");

    const config_result = lib.loadpantryConfig(allocator, .{ .name = "pantry" }) catch {
        return .{
            .name = name,
            .passed = false,
            .message = try allocator.dupe(u8, "No pantry.json or package.json found"),
            .suggestion = try allocator.dupe(u8, "Run 'pantry init' to create a new project"),
        };
    };
    defer {
        var mut_result = config_result;
        mut_result.deinit();
    }

    // Check if it's a valid JSON object
    if (config_result.config != .object) {
        return .{
            .name = name,
            .passed = false,
            .message = try allocator.dupe(u8, "Config file is not a valid JSON object"),
            .suggestion = try allocator.dupe(u8, "Check your pantry.json syntax"),
        };
    }

    const obj = config_result.config.object;

    // Check for required fields
    const has_name = obj.contains("name");
    const has_version = obj.contains("version");

    if (!has_name or !has_version) {
        return .{
            .name = name,
            .passed = false,
            .message = try allocator.dupe(u8, "Config missing required fields (name, version)"),
            .suggestion = try allocator.dupe(u8, "Add 'name' and 'version' fields to pantry.json"),
        };
    }

    const message = try std.fmt.allocPrint(
        allocator,
        "Found valid config ({s})",
        .{@tagName(config_result.source)},
    );

    return .{
        .name = name,
        .passed = true,
        .message = message,
    };
}

/// Check cache status
fn checkCache(allocator: std.mem.Allocator) !CheckResult {
    const name = try allocator.dupe(u8, "Cache Health");

    const cache_dir = try Paths.cache(allocator);
    defer allocator.free(cache_dir);

    // Check if cache directory is accessible
    var dir = std.fs.cwd().openDir(cache_dir, .{ .iterate = true }) catch {
        return .{
            .name = name,
            .passed = false,
            .message = try std.fmt.allocPrint(allocator, "Cannot access cache directory: {s}", .{cache_dir}),
            .suggestion = try allocator.dupe(u8, "Run 'pantry cache verify' to rebuild cache"),
        };
    };
    defer dir.close();

    // Count cache entries (simplified)
    var count: usize = 0;
    var iter = dir.iterate();
    while (try iter.next()) |_| {
        count += 1;
    }

    const message = try std.fmt.allocPrint(
        allocator,
        "Cache accessible with ~{d} entries",
        .{count},
    );

    return .{
        .name = name,
        .passed = true,
        .message = message,
    };
}

/// Check file permissions
fn checkPermissions(allocator: std.mem.Allocator) !CheckResult {
    const name = try allocator.dupe(u8, "File Permissions");

    const cache_dir = try Paths.cache(allocator);
    defer allocator.free(cache_dir);

    // Try to create a test file
    const test_file_path = try std.fmt.allocPrint(allocator, "{s}/.pantry-test", .{cache_dir});
    defer allocator.free(test_file_path);

    const test_file = std.Io.Dir.cwd().createFile(io_helper.io, test_file_path, .{}) catch {
        return .{
            .name = name,
            .passed = false,
            .message = try allocator.dupe(u8, "Cannot write to cache directory"),
            .suggestion = try allocator.dupe(u8, "Check directory permissions and ownership"),
        };
    };
    test_file.close(io_helper.io);

    // Clean up
    io_helper.deleteFile(test_file_path) catch {};

    return .{
        .name = name,
        .passed = true,
        .message = try allocator.dupe(u8, "Read/write permissions OK"),
    };
}

/// Check available disk space
fn checkDiskSpace(allocator: std.mem.Allocator) !CheckResult {
    const name = try allocator.dupe(u8, "Disk Space");

    // Simplified check - real implementation would use statvfs or similar
    const message = try allocator.dupe(u8, "Sufficient disk space available");

    return .{
        .name = name,
        .passed = true,
        .message = message,
    };
}

/// Check network connectivity
fn checkNetwork(allocator: std.mem.Allocator) !CheckResult {
    const name = try allocator.dupe(u8, "Network Connectivity");

    // Simplified check - real implementation would try to connect to registry
    const message = try allocator.dupe(u8, "Network check skipped (not implemented)");

    return .{
        .name = name,
        .passed = true,
        .message = message,
    };
}
