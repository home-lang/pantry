//! Global Package Installation
//!
//! Handles installation of packages globally (system-wide or user-local).
//! Uses shared installer + thread pool for parallel installs.

const std = @import("std");
const io_helper = @import("../../../io_helper.zig");
const lib = @import("../../../lib.zig");
const types = @import("types.zig");
const style = @import("../../style.zig");

const cache = lib.cache;
const install = lib.install;

/// Result of a single global package install (used by thread workers)
const GlobalInstallResult = struct {
    name: []const u8,
    version: []const u8,
    from_cache: bool,
    success: bool,
    install_time_ms: u64,
    error_msg: ?[]const u8,

    fn deinit(self: *GlobalInstallResult, allocator: std.mem.Allocator) void {
        if (self.error_msg) |msg| allocator.free(msg);
    }
};

/// Thread context for parallel global installs
const GlobalThreadContext = struct {
    specs: []const lib.packages.PackageSpec,
    results: []GlobalInstallResult,
    next: *std.atomic.Value(usize),
    alloc: std.mem.Allocator,
    shared_installer: *install.Installer,

    fn worker(ctx: *GlobalThreadContext) void {
        while (true) {
            const i = ctx.next.fetchAdd(1, .monotonic);
            if (i >= ctx.specs.len) break;

            var result = ctx.shared_installer.install(ctx.specs[i], .{}) catch |err| {
                ctx.results[i] = .{
                    .name = ctx.specs[i].name,
                    .version = ctx.specs[i].version,
                    .from_cache = false,
                    .success = false,
                    .install_time_ms = 0,
                    .error_msg = std.fmt.allocPrint(ctx.alloc, "{}", .{err}) catch null,
                };
                return;
            };

            ctx.results[i] = .{
                .name = ctx.specs[i].name,
                .version = ctx.alloc.dupe(u8, result.version) catch ctx.specs[i].version,
                .from_cache = result.from_cache,
                .success = true,
                .install_time_ms = result.install_time_ms,
                .error_msg = null,
            };
            result.deinit(ctx.alloc);
        }
    }
};

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

    style.print("Scanning for global dependencies...\n", .{});

    const global_deps = try global_scanner.scanForGlobalDeps(allocator);
    defer {
        for (global_deps) |*dep| {
            var d = dep.*;
            d.deinit(allocator);
        }
        allocator.free(global_deps);
    }

    if (global_deps.len == 0) {
        style.print("No global dependencies found.\n", .{});
        return .{ .exit_code = 0 };
    }

    style.print("Found {d} global package(s).\n", .{global_deps.len});

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
                style.printWarn("No permission for system-wide install, using ~/.pantry/global instead\n\n", .{});
                return installGlobalDepsCommandWithOptions(allocator, true);
            }
            return err;
        };
    } else {
        try io_helper.makePath(global_dir);
    }

    style.print("Installing to {s}...\n", .{global_dir});

    // Create shared installer + package cache for all packages
    var pkg_cache = try cache.PackageCache.init(allocator);
    defer pkg_cache.deinit();

    var shared_installer = try install.Installer.init(allocator, &pkg_cache);
    allocator.free(shared_installer.data_dir);
    shared_installer.data_dir = try allocator.dupe(u8, global_dir);
    defer shared_installer.deinit();

    // Build specs array
    var specs = try allocator.alloc(lib.packages.PackageSpec, global_deps.len);
    defer allocator.free(specs);
    for (global_deps, 0..) |dep, i| {
        specs[i] = .{ .name = dep.name, .version = dep.version };
    }

    // Allocate results
    const results = try allocator.alloc(GlobalInstallResult, global_deps.len);
    defer {
        for (results) |*r| r.deinit(allocator);
        allocator.free(results);
    }
    for (results) |*r| {
        r.* = .{ .name = "", .version = "", .from_cache = false, .success = false, .install_time_ms = 0, .error_msg = null };
    }

    // Parallel install using thread pool
    const cpu_count = std.Thread.getCpuCount() catch 4;
    const max_threads = @min(cpu_count, 32);
    const thread_count = @min(global_deps.len, max_threads);
    var threads = try allocator.alloc(?std.Thread, max_threads);
    defer allocator.free(threads);
    for (threads) |*t| t.* = null;
    var next_idx = std.atomic.Value(usize).init(0);

    var ctx = GlobalThreadContext{
        .specs = specs,
        .results = results,
        .next = &next_idx,
        .alloc = allocator,
        .shared_installer = &shared_installer,
    };

    for (0..thread_count) |t| {
        threads[t] = std.Thread.spawn(.{}, GlobalThreadContext.worker, .{&ctx}) catch null;
    }
    ctx.worker();

    for (threads) |*t| {
        if (t.*) |thread| {
            thread.join();
            t.* = null;
        }
    }

    // Print results
    for (results) |result| {
        if (result.success) {
            style.printGlobalInstalled(result.name, result.version, result.from_cache, result.install_time_ms);
        } else {
            style.printFailed(result.name, result.version, result.error_msg);
        }
    }

    style.printGlobalComplete(global_dir);

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
                style.printWarn("No permission for system-wide install, using ~/.pantry/global\n\n", .{});
                try io_helper.makePath(user_dir);
                break :blk user_dir;
            }
            return err;
        };
        break :blk "/usr/local";
    };
    defer if (global_dir_owned) |dir| allocator.free(dir);

    style.print("Installing {d} package(s) globally to {s}...\n", .{ packages.len, global_dir });

    // Create shared installer
    var pkg_cache = try cache.PackageCache.init(allocator);
    defer pkg_cache.deinit();

    var shared_installer = try install.Installer.init(allocator, &pkg_cache);
    allocator.free(shared_installer.data_dir);
    shared_installer.data_dir = try allocator.dupe(u8, global_dir);
    defer shared_installer.deinit();

    // Build specs array from package strings
    var specs = try allocator.alloc(lib.packages.PackageSpec, packages.len);
    defer allocator.free(specs);
    for (packages, 0..) |pkg_str, i| {
        var name = pkg_str;
        var version: []const u8 = "latest";
        if (std.mem.indexOf(u8, pkg_str, "@")) |at_pos| {
            name = pkg_str[0..at_pos];
            version = pkg_str[at_pos + 1 ..];
        }
        specs[i] = .{ .name = name, .version = version };
    }

    // Allocate results
    const results = try allocator.alloc(GlobalInstallResult, packages.len);
    defer {
        for (results) |*r| r.deinit(allocator);
        allocator.free(results);
    }
    for (results) |*r| {
        r.* = .{ .name = "", .version = "", .from_cache = false, .success = false, .install_time_ms = 0, .error_msg = null };
    }

    // Parallel install
    const cpu_count = std.Thread.getCpuCount() catch 4;
    const max_threads = @min(cpu_count, 32);
    const thread_count = @min(packages.len, max_threads);
    var threads = try allocator.alloc(?std.Thread, max_threads);
    defer allocator.free(threads);
    for (threads) |*t| t.* = null;
    var next_idx = std.atomic.Value(usize).init(0);

    var ctx = GlobalThreadContext{
        .specs = specs,
        .results = results,
        .next = &next_idx,
        .alloc = allocator,
        .shared_installer = &shared_installer,
    };

    for (0..thread_count) |t| {
        threads[t] = std.Thread.spawn(.{}, GlobalThreadContext.worker, .{&ctx}) catch null;
    }
    ctx.worker();

    for (threads) |*t| {
        if (t.*) |thread| {
            thread.join();
            t.* = null;
        }
    }

    // Print results
    for (results) |result| {
        if (result.success) {
            style.printInstalled(result.name, result.version);
        } else {
            style.printFailed(result.name, result.version, result.error_msg);
        }
    }

    style.printGlobalComplete(global_dir);

    return .{ .exit_code = 0 };
}
