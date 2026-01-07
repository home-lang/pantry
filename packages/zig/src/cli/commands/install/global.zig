//! Global Package Installation
//!
//! Handles installation of packages globally (system-wide or user-local).

const std = @import("std");
const io_helper = @import("../../../io_helper.zig");
const lib = @import("../../../lib.zig");
const types = @import("types.zig");

const cache = lib.cache;
const install = lib.install;

/// Install global dependencies by scanning common locations
/// Try system-wide first, fallback to user-local if no sudo privileges
pub fn installGlobalDepsCommand(allocator: std.mem.Allocator) !types.CommandResult {
    return installGlobalDepsCommandWithOptions(allocator, false);
}

/// Install global dependencies with user-local option
pub fn installGlobalDepsCommandUserLocal(allocator: std.mem.Allocator) !types.CommandResult {
    return installGlobalDepsCommandWithOptions(allocator, true);
}

/// Install global dependencies by scanning common locations
fn installGlobalDepsCommandWithOptions(allocator: std.mem.Allocator, user_local: bool) !types.CommandResult {
    const global_scanner = @import("../../../deps/global_scanner.zig");

    std.debug.print("Scanning for global dependencies...\n", .{});

    const global_deps = try global_scanner.scanForGlobalDeps(allocator);
    defer {
        for (global_deps) |*dep| {
            var d = dep.*;
            d.deinit(allocator);
        }
        allocator.free(global_deps);
    }

    if (global_deps.len == 0) {
        std.debug.print("No global dependencies found.\n", .{});
        return .{ .exit_code = 0 };
    }

    std.debug.print("Found {d} global package(s).\n", .{global_deps.len});

    // Determine installation directory
    const global_dir = if (user_local) blk: {
        const home = try lib.Paths.home(allocator);
        defer allocator.free(home);
        break :blk try std.fmt.allocPrint(allocator, "{s}/.pantry/global", .{home});
    } else "/usr/local";
    defer if (user_local) allocator.free(global_dir);

    // Check if we need sudo for system-wide installation
    if (!user_local) {
        // Test if we can write to /usr/local
        io_helper.makePath(global_dir) catch |err| {
            if (err == error.AccessDenied or err == error.PermissionDenied) {
                // No sudo privileges - automatically fallback to user-local
                std.debug.print("⚠️  No permission for system-wide install, using ~/.pantry/global instead\n\n", .{});
                return installGlobalDepsCommandWithOptions(allocator, true);
            }
            return err;
        };
    } else {
        try io_helper.makePath(global_dir);
    }

    std.debug.print("Installing to {s}...\n", .{global_dir});

    var pkg_cache = try cache.PackageCache.init(allocator);
    defer pkg_cache.deinit();

    for (global_deps) |dep| {
        std.debug.print("  → {s}@{s}", .{ dep.name, dep.version });

        const spec = lib.packages.PackageSpec{
            .name = dep.name,
            .version = dep.version,
        };

        var custom_installer = try install.Installer.init(allocator, &pkg_cache);
        allocator.free(custom_installer.data_dir);
        custom_installer.data_dir = try allocator.dupe(u8, global_dir);
        defer custom_installer.deinit();

        var result = custom_installer.install(spec, .{}) catch |err| {
            std.debug.print(" failed: {}\n", .{err});
            continue;
        };
        defer result.deinit(allocator);

        std.debug.print(" ... done ({s}, {d}ms)\n", .{
            if (result.from_cache) "cached" else "installed",
            result.install_time_ms,
        });
    }

    std.debug.print("\n✅ Global packages installed to: {s}\n", .{global_dir});

    return .{ .exit_code = 0 };
}

/// Install specific packages globally
pub fn installPackagesGloballyCommand(allocator: std.mem.Allocator, packages: []const []const u8) !types.CommandResult {
    // Try system-wide first, fallback to user-local if no permissions
    var global_dir_owned: ?[]const u8 = null;
    const global_dir = blk: {
        // Try /usr/local first - test actual write permissions
        io_helper.makePath("/usr/local/packages") catch |err| {
            if (err == error.AccessDenied or err == error.PermissionDenied) {
                // Fallback to ~/.pantry/global
                const home = try lib.Paths.home(allocator);
                defer allocator.free(home);
                const user_dir = try std.fmt.allocPrint(allocator, "{s}/.pantry/global", .{home});
                global_dir_owned = user_dir;
                std.debug.print("⚠️  No permission for system-wide install, using ~/.pantry/global\n\n", .{});
                try io_helper.makePath(user_dir);
                break :blk user_dir;
            }
            return err;
        };
        break :blk "/usr/local";
    };
    defer if (global_dir_owned) |dir| allocator.free(dir);

    std.debug.print("Installing {d} package(s) globally to {s}...\n", .{ packages.len, global_dir });

    var pkg_cache = try cache.PackageCache.init(allocator);
    defer pkg_cache.deinit();

    for (packages) |pkg_str| {
        // Parse package string (format: "name" or "name@version")
        var name = pkg_str;
        var version: []const u8 = "latest";

        if (std.mem.indexOf(u8, pkg_str, "@")) |at_pos| {
            name = pkg_str[0..at_pos];
            version = pkg_str[at_pos + 1 ..];
        }

        std.debug.print("  → {s}@{s} ... ", .{ name, version });

        const spec = lib.packages.PackageSpec{
            .name = name,
            .version = version,
        };

        var custom_installer = try install.Installer.init(allocator, &pkg_cache);
        allocator.free(custom_installer.data_dir);
        custom_installer.data_dir = try allocator.dupe(u8, global_dir);
        defer custom_installer.deinit();

        var result = custom_installer.install(spec, .{}) catch |err| {
            std.debug.print("failed: {}\n", .{err});
            continue;
        };
        defer result.deinit(allocator);

        std.debug.print("done! Installed to {s}\n", .{result.install_path});
    }

    std.debug.print("\n✅ Packages installed globally to: {s}\n", .{global_dir});

    return .{ .exit_code = 0 };
}
