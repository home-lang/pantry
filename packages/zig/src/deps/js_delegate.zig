const std = @import("std");
const io_helper = @import("../io_helper.zig");
const style = @import("../cli/style.zig");

/// Delegate JS dependency installation to bun/pnpm/yarn/npm when a package.json
/// with JS deps is present alongside pantry's own system-dep file.
///
/// Mirrors `composer_delegate.installPhpDeps` for the JS ecosystem. Pantry
/// installs the runtime (node/bun) via its own pipeline and then hands off to
/// the appropriate JS package manager — it does not try to be a node_modules
/// resolver itself.
///
/// Returns true when delegation actually ran a successful install; false when
/// there was nothing to do (no package.json, no JS deps) or the install failed.
pub fn installJsDeps(allocator: std.mem.Allocator, project_dir: []const u8, verbose: bool) !bool {
    const package_json_path = try std.fs.path.join(allocator, &.{ project_dir, "package.json" });
    defer allocator.free(package_json_path);

    const content = io_helper.readFileAlloc(allocator, package_json_path, 4 * 1024 * 1024) catch return false;
    defer allocator.free(content);

    const parsed = std.json.parseFromSlice(std.json.Value, allocator, content, .{}) catch return false;
    defer parsed.deinit();

    if (parsed.value != .object) return false;

    if (!hasJsDeps(parsed.value.object)) return false;

    // Fast no-op: if node_modules/ exists and is newer than package.json and
    // any lockfile, JS deps are already in sync and we can skip without ever
    // spawning the PM. Matches composer_delegate's "vendor + lock" check.
    if (try isUpToDate(allocator, project_dir, package_json_path)) {
        if (verbose) style.print("{s}  JS deps up to date{s}\n", .{ style.dim, style.reset });
        return false;
    }

    const pm = pickPackageManager(project_dir, parsed.value.object);

    const bin_owned = try resolveBin(allocator, project_dir, pm);
    const bin = bin_owned orelse {
        if (verbose) {
            style.printWarn("Skipping JS deps: '{s}' not found on PATH (run `pantry install` first or install {s})\n", .{ pm, pm });
        }
        return false;
    };
    defer allocator.free(bin);

    // Build a sh -c command that prepends <project>/pantry/.bin to PATH so the
    // JS PM can find node and its own helper bins even when the user invoked
    // `pantry install` from a shell where PATH doesn't include pantry/.bin yet.
    // Mirrors the lifecycle.zig PATH-wrapping pattern.
    const wrapped_cmd = try buildWrappedCommand(allocator, project_dir, bin);
    defer allocator.free(wrapped_cmd);

    style.print("{s}  Installing JS deps via {s}{s}\n", .{ style.dim, pm, style.reset });

    const term = io_helper.spawnAndWait(.{
        .argv = &[_][]const u8{ "sh", "-c", wrapped_cmd },
        .cwd = io_helper.toCwd(project_dir),
    }) catch |err| {
        if (verbose) style.printWarn("{s} install failed to spawn: {}\n", .{ pm, err });
        return false;
    };

    const success = switch (term) {
        .exited => |code| blk: {
            if (code != 0) {
                style.printWarn("{s} install exited with code {d}\n", .{ pm, code });
                break :blk false;
            }
            break :blk true;
        },
        else => blk: {
            style.printWarn("{s} install terminated abnormally\n", .{pm});
            break :blk false;
        },
    };

    if (success) writeMarker(allocator, project_dir);
    return success;
}

/// Marker file we write after a successful delegate run. We use it (not the
/// JS PM's own lockfile) for the staleness check because some PMs don't
/// touch the lockfile on a no-op install — that would cause every subsequent
/// `pantry install` after a `touch package.json` to needlessly re-spawn bun.
const marker_relpath = "node_modules/.pantry-js-installed";

/// JS deps considered up-to-date when our marker file exists and its mtime
/// is >= package.json mtime. We can't stat node_modules itself for mtime
/// (io_helper.statFile returns 0 for directories), and we can't trust the
/// JS PM's lockfile because no-op installs don't always touch it.
fn isUpToDate(allocator: std.mem.Allocator, project_dir: []const u8, package_json_path: []const u8) !bool {
    const marker = try std.fs.path.join(allocator, &.{ project_dir, marker_relpath });
    defer allocator.free(marker);

    const marker_stat = io_helper.statFile(marker) catch return false;
    const pkg_stat = io_helper.statFile(package_json_path) catch return false;
    return marker_stat.mtime >= pkg_stat.mtime;
}

fn writeMarker(allocator: std.mem.Allocator, project_dir: []const u8) void {
    const marker = std.fs.path.join(allocator, &.{ project_dir, marker_relpath }) catch return;
    defer allocator.free(marker);
    const file = io_helper.createFile(marker, .{}) catch return;
    defer file.close(io_helper.io);
}

fn hasJsDeps(obj: std.json.ObjectMap) bool {
    const sections = [_][]const u8{ "dependencies", "devDependencies", "optionalDependencies" };
    for (sections) |section| {
        if (obj.get(section)) |val| {
            if (val == .object and val.object.count() > 0) return true;
        }
    }
    return false;
}

/// Pick a JS package manager. Priority:
///   1. Lockfile heuristic (most reliable)
///   2. `packageManager` field in package.json
///   3. Default to bun
fn pickPackageManager(project_dir: []const u8, obj: std.json.ObjectMap) []const u8 {
    const lockfile_map = [_]struct { lock: []const u8, pm: []const u8 }{
        .{ .lock = "bun.lock", .pm = "bun" },
        .{ .lock = "bun.lockb", .pm = "bun" },
        .{ .lock = "pnpm-lock.yaml", .pm = "pnpm" },
        .{ .lock = "yarn.lock", .pm = "yarn" },
        .{ .lock = "package-lock.json", .pm = "npm" },
    };
    for (lockfile_map) |entry| {
        var path_buf: [std.fs.max_path_bytes]u8 = undefined;
        const full = std.fmt.bufPrint(&path_buf, "{s}/{s}", .{ project_dir, entry.lock }) catch continue;
        io_helper.accessAbsolute(full, .{}) catch continue;
        return entry.pm;
    }

    if (obj.get("packageManager")) |val| {
        if (val == .string) {
            const s = val.string;
            const at_pos = std.mem.indexOfScalar(u8, s, '@') orelse s.len;
            const name = s[0..at_pos];
            const known = [_][]const u8{ "bun", "pnpm", "yarn", "npm" };
            for (known) |k| {
                if (std.mem.eql(u8, name, k)) return k;
            }
        }
    }

    return "bun";
}

/// Resolve the absolute path to a JS package manager binary. Prefers the
/// project's own `pantry/.bin/<name>` (installed by `pantry install`) so we
/// pick up the user-declared version, then falls back to PATH.
fn resolveBin(allocator: std.mem.Allocator, project_dir: []const u8, name: []const u8) !?[]const u8 {
    const local = try std.fs.path.join(allocator, &.{ project_dir, "pantry", ".bin", name });
    if (io_helper.accessAbsolute(local, .{})) |_| {
        return local;
    } else |_| {
        allocator.free(local);
    }

    return io_helper.findExecutable(allocator, name) catch null;
}

/// Build `export PATH='<pantry/.bin>:<old PATH>' && <bin> install` so the child
/// process — and any lifecycle scripts it spawns — can find node/bun without
/// requiring the user to have manually activated pantry's env.
fn buildWrappedCommand(allocator: std.mem.Allocator, project_dir: []const u8, bin: []const u8) ![]u8 {
    const current_path = io_helper.getenv("PATH") orelse "/usr/local/bin:/usr/bin:/bin";

    const path_val = try std.fmt.allocPrint(allocator, "{s}/pantry/.bin:{s}", .{ project_dir, current_path });
    defer allocator.free(path_val);

    var escaped_path = std.ArrayList(u8).empty;
    defer escaped_path.deinit(allocator);
    for (path_val) |ch| {
        if (ch == '\'') {
            try escaped_path.appendSlice(allocator, "'\\''");
        } else {
            try escaped_path.append(allocator, ch);
        }
    }

    return try std.fmt.allocPrint(allocator, "export PATH='{s}' && '{s}' install", .{ escaped_path.items, bin });
}
