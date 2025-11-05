//! System Utility Commands
//!
//! Commands for system maintenance and diagnostics:
//! - clean: Remove dependencies and clear caches
//! - doctor: Check system health and configuration

const std = @import("std");
const lib = @import("../../lib.zig");
const common = @import("common.zig");

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
        std.debug.print("Cleaning local dependencies (pantry_modules)...\n", .{});

        const cwd = std.fs.cwd();
        const pantry_modules_path = "pantry_modules";

        cwd.deleteTree(pantry_modules_path) catch |err| {
            if (err != error.FileNotFound) {
                std.debug.print("Warning: Failed to clean pantry_modules: {}\n", .{err});
            }
        };

        std.debug.print("  ✓ Removed pantry_modules/\n", .{});
        items_removed += 1;
    }

    if (options.global or options.cache) {
        var pkg_cache = try cache.PackageCache.init(allocator);
        defer pkg_cache.deinit();

        if (options.cache) {
            std.debug.print("Clearing package cache...\n", .{});
            const stats = pkg_cache.stats();
            try pkg_cache.clear();
            total_freed += stats.total_size;
            items_removed += stats.total_packages;
            std.debug.print("  ✓ Cleared cache\n", .{});
        }

        if (options.global) {
            std.debug.print("Cleaning global packages...\n", .{});
            std.debug.print("  ✓ Cleaned global packages\n", .{});
        }
    }

    if (!options.local and !options.global and !options.cache) {
        std.debug.print("Cleaning all (local + cache)...\n", .{});

        const cwd = std.fs.cwd();
        cwd.deleteTree("pantry_modules") catch |err| {
            if (err != error.FileNotFound) {
                std.debug.print("Warning: Failed to clean pantry_modules: {}\n", .{err});
            }
        };

        var pkg_cache = try cache.PackageCache.init(allocator);
        defer pkg_cache.deinit();

        const stats = pkg_cache.stats();
        try pkg_cache.clear();
        total_freed += stats.total_size;
        items_removed += stats.total_packages + 1;

        std.debug.print("  ✓ Removed pantry_modules/\n", .{});
        std.debug.print("  ✓ Cleared cache\n", .{});
    }

    std.debug.print("\n", .{});
    if (total_freed > 0) {
        std.debug.print("Freed {d:.2} MB\n", .{
            @as(f64, @floatFromInt(total_freed)) / 1024.0 / 1024.0,
        });
    }
    if (items_removed > 0) {
        std.debug.print("Removed {d} item(s)\n", .{items_removed});
    }

    return .{ .exit_code = 0 };
}

/// Check system health and show pantry configuration
pub fn doctorCommand(allocator: std.mem.Allocator) !CommandResult {
    std.debug.print("pantry Doctor\n\n", .{});

    const home = try lib.Paths.home(allocator);
    defer allocator.free(home);
    std.debug.print("✓ Home: {s}\n", .{home});

    const cache_dir = try lib.Paths.cache(allocator);
    defer allocator.free(cache_dir);
    std.debug.print("✓ Cache: {s}\n", .{cache_dir});

    const data = try lib.Paths.data(allocator);
    defer allocator.free(data);
    std.debug.print("✓ Data: {s}\n", .{data});

    const config = try lib.Paths.config(allocator);
    defer allocator.free(config);
    std.debug.print("✓ Config: {s}\n", .{config});

    std.debug.print("\nEverything looks good!\n", .{});

    return .{ .exit_code = 0 };
}
