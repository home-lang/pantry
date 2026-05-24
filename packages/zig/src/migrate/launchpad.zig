//! One-time migration from the legacy Launchpad install layout to Pantry.
//!
//! Launchpad was renamed to Pantry; old installs may still have:
//!   ~/.local/share/launchpad/   (data + envs)
//!   ~/.cache/launchpad/         (package cache)
//!   ~/.config/launchpad/        (config)
//!   ~/.pantry/cache/shell-env.cache entries pointing at launchpad env dirs

const std = @import("std");
const io_helper = @import("../io_helper.zig");
const Paths = @import("../core/platform.zig").Paths;

const legacy_data_suffix = "/.local/share/launchpad";
const legacy_cache_suffix = "/.cache/launchpad";
const legacy_config_suffix = "/.config/launchpad";

/// Best-effort migration; never fails the calling command.
pub fn maybeMigrate(allocator: std.mem.Allocator) void {
    migrateDataTree(allocator) catch {};
    migrateCacheTree(allocator) catch {};
    migrateConfigTree(allocator) catch {};
    rewriteShellEnvCache(allocator) catch {};
}

/// True when `~/.local/share/launchpad` still exists.
pub fn hasLegacyDataDir(allocator: std.mem.Allocator) bool {
    const legacy = legacyDataPath(allocator) catch return false;
    defer allocator.free(legacy);
    io_helper.accessAbsolute(legacy, .{}) catch return false;
    return true;
}

/// True when `~/.local/bin/launchpad` is the pre-rename binary (not a pantry alias).
pub fn hasLegacyBinaryOnPath(allocator: std.mem.Allocator) bool {
    const home = Paths.home(allocator) catch return false;
    defer allocator.free(home);

    var launchpad_buf: [std.fs.max_path_bytes]u8 = undefined;
    const launchpad_path = std.fmt.bufPrint(&launchpad_buf, "{s}/.local/bin/launchpad", .{home}) catch return false;

    const lp_stat = io_helper.statFile(launchpad_path) catch return false;
    // Legacy launchpad binaries were ~2–3 MB; current pantry is much larger.
    if (lp_stat.size > 4 * 1024 * 1024) return false;

    var pantry_buf: [std.fs.max_path_bytes]u8 = undefined;
    const pantry_path = std.fmt.bufPrint(&pantry_buf, "{s}/.local/bin/pantry", .{home}) catch return true;
    const pn_stat = io_helper.statFile(pantry_path) catch return true;

    // Same inode = symlink/hardlink alias to pantry — fine.
    if (pathsEqual(launchpad_path, pantry_path)) return false;

    return lp_stat.size < pn_stat.size / 2;
}

pub fn legacyDataPath(allocator: std.mem.Allocator) ![]const u8 {
    const home = try Paths.home(allocator);
    defer allocator.free(home);
    return std.fmt.allocPrint(allocator, "{s}{s}", .{ home, legacy_data_suffix });
}

fn legacyCachePath(allocator: std.mem.Allocator) ![]const u8 {
    const home = try Paths.home(allocator);
    defer allocator.free(home);
    return std.fmt.allocPrint(allocator, "{s}{s}", .{ home, legacy_cache_suffix });
}

fn legacyConfigPath(allocator: std.mem.Allocator) ![]const u8 {
    const home = try Paths.home(allocator);
    defer allocator.free(home);
    return std.fmt.allocPrint(allocator, "{s}{s}", .{ home, legacy_config_suffix });
}

fn migrateDataTree(allocator: std.mem.Allocator) !void {
    const legacy = try legacyDataPath(allocator);
    defer allocator.free(legacy);

    io_helper.accessAbsolute(legacy, .{}) catch return;

    const pantry_data = try Paths.data(allocator);
    defer allocator.free(pantry_data);

    if (!pathsEqual(legacy, pantry_data)) {
        io_helper.accessAbsolute(pantry_data, .{}) catch {
            // Pantry data dir missing — rename entire tree.
            try io_helper.rename(legacy, pantry_data);
            return;
        };

        // Both exist: merge envs/ and global/ subdirs without clobbering.
        try mergeSubdir(legacy, pantry_data, "envs");
        try mergeSubdir(legacy, pantry_data, "global");
        try mergeSubdir(legacy, pantry_data, "packages");
        try removeTreeIfEmpty(legacy);
    }
}

fn migrateCacheTree(allocator: std.mem.Allocator) !void {
    const legacy = try legacyCachePath(allocator);
    defer allocator.free(legacy);

    io_helper.accessAbsolute(legacy, .{}) catch return;

    const pantry_cache = try Paths.cache(allocator);
    defer allocator.free(pantry_cache);

    if (!pathsEqual(legacy, pantry_cache)) {
        io_helper.accessAbsolute(pantry_cache, .{}) catch {
            try io_helper.rename(legacy, pantry_cache);
            return;
        };
        try removeTreeIfEmpty(legacy);
    }
}

fn migrateConfigTree(allocator: std.mem.Allocator) !void {
    const legacy = try legacyConfigPath(allocator);
    defer allocator.free(legacy);

    io_helper.accessAbsolute(legacy, .{}) catch return;

    const pantry_config = try Paths.config(allocator);
    defer allocator.free(pantry_config);

    if (!pathsEqual(legacy, pantry_config)) {
        io_helper.accessAbsolute(pantry_config, .{}) catch {
            try io_helper.rename(legacy, pantry_config);
            return;
        };
        try removeTreeIfEmpty(legacy);
    }
}

fn mergeSubdir(legacy_root: []const u8, pantry_root: []const u8, sub: []const u8) !void {
    if (sub.len == 0) return;

    const legacy_sub = try std.fs.path.join(std.heap.page_allocator, &[_][]const u8{ legacy_root, sub });
    defer std.heap.page_allocator.free(legacy_sub);

    io_helper.accessAbsolute(legacy_sub, .{}) catch return;

    const pantry_sub = try std.fs.path.join(std.heap.page_allocator, &[_][]const u8{ pantry_root, sub });
    defer std.heap.page_allocator.free(pantry_sub);

    try io_helper.makePath(pantry_sub);

    var dir = io_helper.openDirAbsoluteForIteration(legacy_sub) catch return;
    defer dir.close();

    var iter = dir.iterate();
    while (iter.next() catch null) |entry| {
        const src = try std.fs.path.join(std.heap.page_allocator, &[_][]const u8{ legacy_sub, entry.name });
        defer std.heap.page_allocator.free(src);
        const dst = try std.fs.path.join(std.heap.page_allocator, &[_][]const u8{ pantry_sub, entry.name });
        defer std.heap.page_allocator.free(dst);

        io_helper.accessAbsolute(dst, .{}) catch {
            try io_helper.rename(src, dst);
            continue;
        };
        // Destination exists — leave legacy copy for manual cleanup.
    }
}

fn removeTreeIfEmpty(path: []const u8) !void {
    var dir = io_helper.openDirAbsoluteForIteration(path) catch return;
    defer dir.close();
    var iter = dir.iterate();
    if (iter.next() catch null) |_| return;
    io_helper.deleteTree(path) catch {};
}

/// Rewrite launchpad paths in ~/.pantry/cache/shell-env.cache.
fn rewriteShellEnvCache(allocator: std.mem.Allocator) !void {
    const home = try Paths.home(allocator);
    defer allocator.free(home);

    const cache_path = try std.fmt.allocPrint(allocator, "{s}/.pantry/cache/shell-env.cache", .{home});
    defer allocator.free(cache_path);

    const contents = io_helper.readFileAlloc(allocator, cache_path, 10 * 1024 * 1024) catch return;
    defer allocator.free(contents);

    if (std.mem.indexOf(u8, contents, "launchpad") == null) return;

    var out = std.ArrayList(u8).initCapacity(allocator, contents.len) catch return;
    defer out.deinit(allocator);

    var lines = std.mem.splitScalar(u8, contents, '\n');
    while (lines.next()) |line| {
        if (line.len == 0) continue;
        if (std.mem.indexOf(u8, line, "/launchpad/") != null) {
            var replaced = try std.mem.replaceOwned(u8, allocator, "/.local/share/launchpad/", "/.local/share/pantry/", line);
            defer allocator.free(replaced);
            replaced = try std.mem.replaceOwned(u8, allocator, "/launchpad/", "/pantry/", replaced);
            defer allocator.free(replaced);
            try out.appendSlice(allocator, replaced);
        } else {
            try out.appendSlice(allocator, line);
        }
        try out.append(allocator, '\n');
    }

    const file = io_helper.createFile(cache_path, .{ .truncate = true }) catch return;
    defer file.close(io_helper.io);
    io_helper.writeAllToFile(file, out.items) catch {};
}

fn pathsEqual(a: []const u8, b: []const u8) bool {
    var a_buf: [std.fs.max_path_bytes]u8 = undefined;
    var b_buf: [std.fs.max_path_bytes]u8 = undefined;
    const a_real = io_helper.realpath(a, &a_buf) catch a;
    const b_real = io_helper.realpath(b, &b_buf) catch b;
    return std.mem.eql(u8, a_real, b_real);
}

test "pathsEqual handles identical strings" {
    try std.testing.expect(pathsEqual("/tmp", "/tmp"));
}
