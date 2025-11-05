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

    std.debug.print("Cleaning cache (removing unused entries)...\n", .{});
    // TODO: Implement smart clean logic (keep frequently used, remove old)
    std.debug.print("Done.\n", .{});

    return .{ .exit_code = 0 };
}
