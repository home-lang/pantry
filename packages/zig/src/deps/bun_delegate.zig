//! Bun (npm) dependency delegation.
//!
//! After pantry's system + workspace install steps complete, run `bun install`
//! if the project has npm dependencies in `package.json`. This makes
//! `pantry install` a complete replacement for `bun install` in CI workflows
//! (issue #200).
//!
//! Detection rule: presence of any non-pantry-domain key in `dependencies`,
//! `devDependencies`, `peerDependencies`, or `optionalDependencies`. Pantry
//! system deps (e.g. `bun.sh`, `ziglang.org`) are filtered out via the
//! domain-name heuristic — keys that contain `.` and don't start with `@` are
//! assumed to be system deps and don't trigger bun.

const std = @import("std");
const io_helper = @import("../io_helper.zig");
const style = @import("../cli/style.zig");

pub const BunOptions = struct {
    production: bool = false,
    frozen_lockfile: bool = false,
    ignore_scripts: bool = false,
    verbose: bool = false,
};

/// Run `bun install` if the project has npm dependencies.
///
/// Returns true if bun was invoked successfully, false if there was nothing
/// to do (no npm deps), bun couldn't be located, or the invocation failed.
/// Failures are reported via stderr but never abort the surrounding install.
pub fn installNpmDeps(
    allocator: std.mem.Allocator,
    project_dir: []const u8,
    opts: BunOptions,
) !bool {
    if (!try hasNpmDependencies(allocator, project_dir)) return false;

    const bun_path = try resolveBun(allocator, project_dir);
    defer if (bun_path) |p| allocator.free(p);
    if (bun_path == null) {
        style.printWarn("bun not found in PATH or pantry/.bin — skipping npm install\n", .{});
        return false;
    }
    const bun_exe = bun_path.?;

    // Prepare PATH that includes pantry/.bin so postinstall scripts spawned
    // by bun install (which run under /bin/bash) can find tools like `bunx`
    // that pantry symlinked into pantry/.bin/. We invoke bun via
    // /usr/bin/env PATH=... so the override is guaranteed to take effect on
    // the child even though Zig snapshots the parent's environ at startup.
    const local_bin = try std.fs.path.join(allocator, &.{ project_dir, "pantry", ".bin" });
    defer allocator.free(local_bin);
    const old_path = io_helper.getenv("PATH") orelse "";
    const path_assign = try std.fmt.allocPrint(allocator, "PATH={s}:{s}", .{ local_bin, old_path });
    defer allocator.free(path_assign);

    var argv = std.ArrayList([]const u8).empty;
    defer argv.deinit(allocator);
    try argv.append(allocator, "/usr/bin/env");
    try argv.append(allocator, path_assign);
    try argv.append(allocator, bun_exe);
    try argv.append(allocator, "install");
    if (opts.production) try argv.append(allocator, "--production");
    if (opts.frozen_lockfile) try argv.append(allocator, "--frozen-lockfile");
    if (opts.ignore_scripts) try argv.append(allocator, "--ignore-scripts");

    style.print("{s}  Installing npm dependencies (bun install)...{s}\n", .{ style.dim, style.reset });

    var child = io_helper.spawn(.{
        .argv = argv.items,
        .cwd = io_helper.toCwd(project_dir),
        .stdout = .inherit,
        .stderr = .inherit,
    }) catch |err| {
        style.printWarn("bun spawn failed: {s}\n", .{@errorName(err)});
        return false;
    };

    const term = io_helper.wait(&child) catch |err| {
        style.printWarn("bun wait failed: {s}\n", .{@errorName(err)});
        return false;
    };

    return switch (term) {
        .exited => |code| code == 0,
        else => false,
    };
}

/// True if `package.json` declares any npm dependency (a dep whose key is
/// not a pantry-style domain name).
fn hasNpmDependencies(allocator: std.mem.Allocator, project_dir: []const u8) !bool {
    const path = try std.fs.path.join(allocator, &.{ project_dir, "package.json" });
    defer allocator.free(path);

    const content = io_helper.readFileAlloc(allocator, path, 4 * 1024 * 1024) catch return false;
    defer allocator.free(content);

    const parsed = std.json.parseFromSlice(std.json.Value, allocator, content, .{}) catch return false;
    defer parsed.deinit();

    if (parsed.value != .object) return false;

    const fields = [_][]const u8{
        "dependencies",
        "devDependencies",
        "peerDependencies",
        "optionalDependencies",
    };
    for (fields) |field| {
        const val = parsed.value.object.get(field) orelse continue;
        if (val != .object) continue;
        var it = val.object.iterator();
        while (it.next()) |entry| {
            if (!isPantryDomain(entry.key_ptr.*)) return true;
        }
    }
    return false;
}

/// Heuristic for distinguishing pantry system deps from npm packages.
/// Pantry uses domain names (`bun.sh`, `ziglang.org`) until aliases land in a
/// released binary; npm uses scoped (`@scope/name`) or bare (`name`) keys.
fn isPantryDomain(name: []const u8) bool {
    if (name.len == 0) return false;
    if (name[0] == '@') return false; // npm scoped package
    return std.mem.indexOfScalar(u8, name, '.') != null;
}

/// Find a bun executable: prefer the project-local one at
/// `<project>/pantry/.bin/bun`, then fall back to PATH lookup.
fn resolveBun(allocator: std.mem.Allocator, project_dir: []const u8) !?[]const u8 {
    const local = try std.fs.path.join(allocator, &.{ project_dir, "pantry", ".bin", "bun" });
    if (io_helper.accessAbsolute(local, .{})) |_| {
        return local;
    } else |_| {
        allocator.free(local);
    }

    const path_env = io_helper.getenv("PATH") orelse return null;
    var it = std.mem.splitScalar(u8, path_env, ':');
    while (it.next()) |dir| {
        if (dir.len == 0) continue;
        const candidate = try std.fs.path.join(allocator, &.{ dir, "bun" });
        if (io_helper.accessAbsolute(candidate, .{})) |_| {
            return candidate;
        } else |_| {
            allocator.free(candidate);
        }
    }
    return null;
}
