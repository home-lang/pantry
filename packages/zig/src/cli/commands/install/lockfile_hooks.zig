//! Lockfile and Lifecycle Hooks Integration
//!
//! This module integrates lockfile generation/validation and lifecycle hooks
//! into the install command flow.

const std = @import("std");
const lib = @import("../../../lib.zig");
const lockfile_mod = @import("../../../deps/resolution/lockfile.zig");
const lifecycle = @import("../../../lifecycle.zig");

const LockFile = lockfile_mod.LockFile;

/// Load existing lockfile or create new one
pub fn loadOrCreateLockfile(allocator: std.mem.Allocator, cwd: []const u8) !LockFile {
    const lockfile_path = try std.fs.path.join(
        allocator,
        &[_][]const u8{ cwd, lockfile_mod.LOCK_FILE_NAME },
    );
    defer allocator.free(lockfile_path);

    // Try to load existing lockfile
    return LockFile.read(allocator, lockfile_path) catch |err| {
        // If file doesn't exist, create a new lockfile
        if (err == error.FileNotFound) {
            return LockFile.init(allocator);
        }
        return err;
    };
}

/// Save lockfile to disk
pub fn saveLockfile(lock_file: *LockFile, cwd: []const u8) !void {
    const lockfile_path = try std.fs.path.join(
        lock_file.allocator,
        &[_][]const u8{ cwd, lockfile_mod.LOCK_FILE_NAME },
    );
    defer lock_file.allocator.free(lockfile_path);

    try lock_file.write(lockfile_path);
}

/// Add installed package to lockfile
pub fn addPackageToLockfile(
    lock_file: *LockFile,
    name: []const u8,
    version: []const u8,
    resolved: []const u8,
    integrity: ?[]const u8,
) !void {
    try lock_file.addPackage(name, version, resolved, integrity);
}

/// Execute pre-install hook (project-level)
pub fn executePreInstallHook(
    allocator: std.mem.Allocator,
    cwd: []const u8,
    verbose: bool,
) !?lifecycle.ScriptResult {
    // Check if pantry.json or package.json has preinstall script
    const pantry_json_path = try std.fs.path.join(
        allocator,
        &[_][]const u8{ cwd, "pantry.json" },
    );
    defer allocator.free(pantry_json_path);

    // Try pantry.json first, then fall back to package.json
    const config_content = std.fs.cwd().readFileAlloc(
        pantry_json_path,
        allocator,
        std.Io.Limit.limited(1024 * 1024),
    ) catch |err| blk: {
        if (err == error.FileNotFound) {
            const package_json_path = try std.fs.path.join(
                allocator,
                &[_][]const u8{ cwd, "package.json" },
            );
            defer allocator.free(package_json_path);

            break :blk std.fs.cwd().readFileAlloc(
                package_json_path,
                allocator,
                std.Io.Limit.limited(1024 * 1024),
            ) catch return null;
        }
        return null;
    };
    defer allocator.free(config_content);

    const parsed = try std.json.parseFromSlice(std.json.Value, allocator, config_content, .{});
    defer parsed.deinit();

    var scripts = try lifecycle.extractScripts(allocator, parsed);
    defer {
        var it = scripts.iterator();
        while (it.next()) |entry| {
            allocator.free(entry.key_ptr.*);
            allocator.free(entry.value_ptr.*);
        }
        scripts.deinit();
    }

    const preinstall_cmd = scripts.get("preinstall") orelse return null;

    if (verbose) {
        std.debug.print("Running preinstall hook...\n", .{});
    }

    return try lifecycle.executeScript(allocator, "preinstall", preinstall_cmd, .{
        .cwd = cwd,
        .verbose = verbose,
        .timeout_ms = 60000,
    });
}

/// Execute post-install hook (project-level)
pub fn executePostInstallHook(
    allocator: std.mem.Allocator,
    cwd: []const u8,
    verbose: bool,
) !?lifecycle.ScriptResult {
    // Check if pantry.json or package.json has postinstall script
    const pantry_json_path = try std.fs.path.join(
        allocator,
        &[_][]const u8{ cwd, "pantry.json" },
    );
    defer allocator.free(pantry_json_path);

    // Try pantry.json first, then fall back to package.json
    const config_content = std.fs.cwd().readFileAlloc(
        pantry_json_path,
        allocator,
        std.Io.Limit.limited(1024 * 1024),
    ) catch |err| blk: {
        if (err == error.FileNotFound) {
            const package_json_path = try std.fs.path.join(
                allocator,
                &[_][]const u8{ cwd, "package.json" },
            );
            defer allocator.free(package_json_path);

            break :blk std.fs.cwd().readFileAlloc(
                package_json_path,
                allocator,
                std.Io.Limit.limited(1024 * 1024),
            ) catch return null;
        }
        return null;
    };
    defer allocator.free(config_content);

    const parsed = try std.json.parseFromSlice(std.json.Value, allocator, config_content, .{});
    defer parsed.deinit();

    var scripts = try lifecycle.extractScripts(allocator, parsed);
    defer {
        var it = scripts.iterator();
        while (it.next()) |entry| {
            allocator.free(entry.key_ptr.*);
            allocator.free(entry.value_ptr.*);
        }
        scripts.deinit();
    }

    const postinstall_cmd = scripts.get("postinstall") orelse return null;

    if (verbose) {
        std.debug.print("Running postinstall hook...\n", .{});
    }

    return try lifecycle.executeScript(allocator, "postinstall", postinstall_cmd, .{
        .cwd = cwd,
        .verbose = verbose,
        .timeout_ms = 60000,
    });
}

/// Check if package in lockfile matches expected version
pub fn validatePackageInLockfile(
    lock_file: *LockFile,
    name: []const u8,
    version: []const u8,
) bool {
    const pkg = lock_file.getPackage(name, version) orelse return false;
    return std.mem.eql(u8, pkg.version, version);
}
