//! Cache management commands: stats, clear, clean

const std = @import("std");
const builtin = @import("builtin");
const lib = @import("../../lib.zig");
const io_helper = @import("../../io_helper.zig");
const common = @import("common.zig");
const style = @import("../style.zig");

const CommandResult = common.CommandResult;
const cache = lib.cache;

// ============================================================================
// Cache Stats Command
// ============================================================================

/// Show cache statistics.
/// Accepts a format argument: "table" (default), "json", or "minimal".
pub fn cacheStatsCommand(allocator: std.mem.Allocator, args: []const []const u8) !CommandResult {
    var pkg_cache = try cache.PackageCache.init(allocator);
    defer pkg_cache.deinit();

    const stats = pkg_cache.stats();

    // Determine output format from args (first non-flag argument is treated as format)
    var format: []const u8 = "table";
    for (args) |arg| {
        if (std.mem.eql(u8, arg, "json") or
            std.mem.eql(u8, arg, "minimal") or
            std.mem.eql(u8, arg, "table"))
        {
            format = arg;
        }
    }

    if (std.mem.eql(u8, format, "json")) {
        const json_msg = try std.fmt.allocPrint(
            allocator,
            "{{\"total_packages\":{d},\"total_size\":{d},\"total_size_mb\":{d:.2}}}",
            .{
                stats.total_packages,
                stats.total_size,
                @as(f64, @floatFromInt(stats.total_size)) / 1024.0 / 1024.0,
            },
        );
        return .{ .exit_code = 0, .message = json_msg };
    } else if (std.mem.eql(u8, format, "minimal")) {
        const msg = try std.fmt.allocPrint(
            allocator,
            "{d} packages, {d:.2} MB",
            .{
                stats.total_packages,
                @as(f64, @floatFromInt(stats.total_size)) / 1024.0 / 1024.0,
            },
        );
        return .{ .exit_code = 0, .message = msg };
    }

    // Default: table format
    style.print("Cache Statistics:\n\n", .{});
    style.print("  Total packages: {d}\n", .{stats.total_packages});
    style.print("  Total size: {d} bytes ({d:.2} MB)\n", .{
        stats.total_size,
        @as(f64, @floatFromInt(stats.total_size)) / 1024.0 / 1024.0,
    });

    return .{ .exit_code = 0 };
}

// ============================================================================
// Cache Clear Command
// ============================================================================

/// Clear all cache.
/// When `force` is false (default), prompts for confirmation unless stdin is not a tty.
pub fn cacheClearCommand(allocator: std.mem.Allocator, args: []const []const u8) !CommandResult {
    var pkg_cache = try cache.PackageCache.init(allocator);
    defer pkg_cache.deinit();

    const stats_before = pkg_cache.stats();

    // Check for --force flag
    var force = false;
    for (args) |arg| {
        if (std.mem.eql(u8, arg, "--force") or std.mem.eql(u8, arg, "-f")) {
            force = true;
        }
    }

    if (!force and stats_before.total_packages > 0) {
        style.print("This will remove {d} cached package(s) ({d:.2} MB). Continue? [y/N] ", .{
            stats_before.total_packages,
            @as(f64, @floatFromInt(stats_before.total_size)) / 1024.0 / 1024.0,
        });

        // Read a single line from stdin for confirmation
        var buf: [16]u8 = undefined;
        var pos: usize = 0;
        while (pos < buf.len) {
            const n = io_helper.readStdin(buf[pos..][0..1]) catch break;
            if (n == 0) break;
            if (buf[pos] == '\n') break;
            pos += 1;
        }
        const answer = std.mem.trim(u8, buf[0..pos], " \t\r");

        if (!std.mem.eql(u8, answer, "y") and !std.mem.eql(u8, answer, "Y") and
            !std.mem.eql(u8, answer, "yes"))
        {
            return CommandResult.success(allocator, "Aborted");
        }
    }

    style.print("Clearing cache...\n", .{});
    try pkg_cache.clear();

    style.print("Removed {d} package(s)\n", .{stats_before.total_packages});
    style.print("Freed {d:.2} MB\n", .{
        @as(f64, @floatFromInt(stats_before.total_size)) / 1024.0 / 1024.0,
    });

    return .{ .exit_code = 0 };
}

// ============================================================================
// Cache Clean Command
// ============================================================================

/// Clean cache (remove unused entries)
pub fn cacheCleanCommand(allocator: std.mem.Allocator) !CommandResult {
    var pkg_cache = try cache.PackageCache.init(allocator);
    defer pkg_cache.deinit();

    const stats_before = pkg_cache.stats();
    style.print("Cleaning cache (removing unused entries)...\n", .{});
    style.print("Current cache: {d} package(s), {d:.2} MB\n\n", .{
        stats_before.total_packages,
        @as(f64, @floatFromInt(stats_before.total_size)) / 1024.0 / 1024.0,
    });

    // Smart cleanup:
    // - Remove packages not accessed in last 30 days
    // - Keep the 50 most recently accessed packages regardless of age
    const cleanup_stats = try pkg_cache.cleanUnused(30, 50);

    if (cleanup_stats.packages_removed > 0) {
        style.print("Removed {d} package(s)\n", .{cleanup_stats.packages_removed});
        style.print("Freed {d:.2} MB\n", .{
            @as(f64, @floatFromInt(cleanup_stats.bytes_freed)) / 1024.0 / 1024.0,
        });

        const stats_after = pkg_cache.stats();
        style.print("\nCache after cleanup: {d} package(s), {d:.2} MB\n", .{
            stats_after.total_packages,
            @as(f64, @floatFromInt(stats_after.total_size)) / 1024.0 / 1024.0,
        });
    } else {
        style.print("No packages to remove (all packages are recent or frequently used)\n", .{});
    }

    return .{ .exit_code = 0 };
}
