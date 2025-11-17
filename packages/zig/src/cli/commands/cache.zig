//! Cache management commands: stats, clear, clean

const std = @import("std");
const lib = @import("../../lib.zig");
const common = @import("common.zig");

const CommandResult = common.CommandResult;
const cache = lib.cache;

// ============================================================================
// Cache Stats Command
// ============================================================================

/// Show cache statistics
pub fn cacheStatsCommand(allocator: std.mem.Allocator, _: []const []const u8) !CommandResult {
    var pkg_cache = try cache.PackageCache.init(allocator);
    defer pkg_cache.deinit();

    const stats = pkg_cache.stats();

    std.debug.print("Cache Statistics:\n\n", .{});
    std.debug.print("  Total packages: {d}\n", .{stats.total_packages});
    std.debug.print("  Total size: {d} bytes ({d:.2} MB)\n", .{
        stats.total_size,
        @as(f64, @floatFromInt(stats.total_size)) / 1024.0 / 1024.0,
    });

    return .{ .exit_code = 0 };
}

// ============================================================================
// Cache Clear Command
// ============================================================================

/// Clear all cache
pub fn cacheClearCommand(allocator: std.mem.Allocator, _: []const []const u8) !CommandResult {
    var pkg_cache = try cache.PackageCache.init(allocator);
    defer pkg_cache.deinit();

    const stats_before = pkg_cache.stats();

    std.debug.print("Clearing cache...\n", .{});
    try pkg_cache.clear();

    std.debug.print("Removed {d} package(s)\n", .{stats_before.total_packages});
    std.debug.print("Freed {d:.2} MB\n", .{
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
    std.debug.print("Cleaning cache (removing unused entries)...\n", .{});
    std.debug.print("Current cache: {d} package(s), {d:.2} MB\n\n", .{
        stats_before.total_packages,
        @as(f64, @floatFromInt(stats_before.total_size)) / 1024.0 / 1024.0,
    });

    // Smart cleanup:
    // - Remove packages not accessed in last 30 days
    // - Keep the 50 most recently accessed packages regardless of age
    const cleanup_stats = try pkg_cache.cleanUnused(30, 50);

    if (cleanup_stats.packages_removed > 0) {
        std.debug.print("Removed {d} package(s)\n", .{cleanup_stats.packages_removed});
        std.debug.print("Freed {d:.2} MB\n", .{
            @as(f64, @floatFromInt(cleanup_stats.bytes_freed)) / 1024.0 / 1024.0,
        });

        const stats_after = pkg_cache.stats();
        std.debug.print("\nCache after cleanup: {d} package(s), {d:.2} MB\n", .{
            stats_after.total_packages,
            @as(f64, @floatFromInt(stats_after.total_size)) / 1024.0 / 1024.0,
        });
    } else {
        std.debug.print("No packages to remove (all packages are recent or frequently used)\n", .{});
    }

    return .{ .exit_code = 0 };
}
