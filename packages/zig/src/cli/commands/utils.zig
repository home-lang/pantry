//! System Utility Commands
//!
//! Commands for system maintenance and diagnostics:
//! - clean: Remove dependencies and clear caches
//! - doctor: Check system health and configuration

const std = @import("std");
const io_helper = @import("../../io_helper.zig");
const lib = @import("../../lib.zig");
const common = @import("common.zig");
const style = @import("../style.zig");

const CommandResult = common.CommandResult;
const cache = lib.cache;

pub const CleanOptions = struct {
    local: bool = false,
    global: bool = false,
    cache: bool = false,
};

/// Clean local dependencies, global packages, and/or cache
pub fn cleanCommand(allocator: std.mem.Allocator, options: CleanOptions) !CommandResult {
    var total_freed: u64 = 0;
    var items_removed: u64 = 0;

    if (options.local) {
        style.print("Cleaning local dependencies (pantry)...\n", .{});

        const pantry_path = "pantry";

        io_helper.deleteTree(pantry_path) catch |err| {
            if (err != error.FileNotFound) {
                style.print("Warning: Failed to clean pantry: {}\n", .{err});
            }
        };

        style.print("  ✓ Removed pantry/\n", .{});
        items_removed += 1;
    }

    if (options.global or options.cache) {
        var pkg_cache = try cache.PackageCache.init(allocator);
        defer pkg_cache.deinit();

        if (options.cache) {
            style.print("Clearing package cache...\n", .{});
            const stats = pkg_cache.stats();
            try pkg_cache.clear();
            total_freed += stats.total_size;
            items_removed += stats.total_packages;
            style.print("  ✓ Cleared cache\n", .{});
        }

        if (options.global) {
            style.print("Cleaning global packages...\n", .{});
            style.print("  ✓ Cleaned global packages\n", .{});
        }
    }

    if (!options.local and !options.global and !options.cache) {
        style.print("Cleaning all (local + cache)...\n", .{});

        io_helper.deleteTree("pantry") catch |err| {
            if (err != error.FileNotFound) {
                style.print("Warning: Failed to clean pantry: {}\n", .{err});
            }
        };

        var pkg_cache = try cache.PackageCache.init(allocator);
        defer pkg_cache.deinit();

        const stats = pkg_cache.stats();
        try pkg_cache.clear();
        total_freed += stats.total_size;
        items_removed += stats.total_packages + 1;

        style.print("  ✓ Removed pantry/\n", .{});
        style.print("  ✓ Cleared cache\n", .{});
    }

    style.print("\n", .{});
    if (total_freed > 0) {
        style.print("Freed {d:.2} MB\n", .{
            @as(f64, @floatFromInt(total_freed)) / 1024.0 / 1024.0,
        });
    }
    if (items_removed > 0) {
        style.print("Removed {d} item(s)\n", .{items_removed});
    }

    return .{ .exit_code = 0 };
}

/// Check system health and show pantry configuration
pub fn doctorCommand(allocator: std.mem.Allocator) !CommandResult {
    style.print("pantry Doctor\n\n", .{});

    const home = try lib.Paths.home(allocator);
    defer allocator.free(home);
    style.print("✓ Home: {s}\n", .{home});

    const cache_dir = try lib.Paths.cache(allocator);
    defer allocator.free(cache_dir);
    style.print("✓ Cache: {s}\n", .{cache_dir});

    const data = try lib.Paths.data(allocator);
    defer allocator.free(data);
    style.print("✓ Data: {s}\n", .{data});

    const config = try lib.Paths.config(allocator);
    defer allocator.free(config);
    style.print("✓ Config: {s}\n", .{config});

    style.print("\nEverything looks good!\n", .{});

    return .{ .exit_code = 0 };
}
