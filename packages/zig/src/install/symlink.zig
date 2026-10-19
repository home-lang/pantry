const std = @import("std");
const io_helper = @import("../io_helper.zig");
const lib = @import("../lib.zig");
const builtin = @import("builtin");
const style = @import("../cli/style.zig");

pub const SymlinkError = error{
    SymlinkCreationFailed,
    TargetNotFound,
    BinDirCreationFailed,
    InvalidPath,
};

/// Cross-platform symlink creation
pub fn createSymlinkCrossPlatform(target_path: []const u8, link_path: []const u8) !void {
    if (builtin.os.tag == .windows) {
        try io_helper.symLink(target_path, link_path);
    } else {
        // On Unix systems, create actual symlink using io_helper
        io_helper.symLink(target_path, link_path) catch |err| switch (err) {
            error.PathAlreadyExists => {
                // Delete existing and retry (race-safe: if delete fails, another thread won)
                io_helper.deleteFile(link_path) catch {};
                io_helper.symLink(target_path, link_path) catch {
                    // Another thread created it — that's fine
                };
            },
            else => return err,
        };
    }
}

/// What to store in a link at `link_path` so that it reaches `target_path`.
///
/// When both live inside one pantry tree (`tree_root`, e.g. `<project>/pantry`
/// or a global install base), the answer is the target's path relative to the
/// link's directory: `v1 -> v1.3.2`, `.bin/git -> ../git-scm.org/v2.53.0/bin/git`.
/// An absolute target bakes in whichever path the tree was reached through,
/// so a tree installed via a symlink or a git worktree that shares it, or
/// later moved, is left full of links into a path that may no longer exist.
/// That is how a `pantry install` in a worktree sharing the main checkout's
/// pantry repointed some 250 of its links at the worktree, and deleting the
/// worktree broke git, bun and every dylib reached through a `v<major>` link.
///
/// The relative form is only returned once the filesystem confirms it
/// reaches the same file as `target_path`; otherwise, with no `tree_root`, a
/// target outside it, or on Windows (where links are copies), `target_path`
/// is returned as given. Caller owns the returned slice.
pub fn treeLinkTarget(
    allocator: std.mem.Allocator,
    tree_root: ?[]const u8,
    target_path: []const u8,
    link_path: []const u8,
) ![]u8 {
    if (builtin.os.tag != .windows) {
        if (tree_root) |root| {
            var arena_state = std.heap.ArenaAllocator.init(allocator);
            defer arena_state.deinit();
            if (relativeWithinTree(arena_state.allocator(), root, target_path, link_path)) |rel| {
                return allocator.dupe(u8, rel);
            }
        }
    }
    return allocator.dupe(u8, target_path);
}

/// Create a symlink at `link_path` to `target_path`, written relative when
/// both are inside `tree_root` (see `treeLinkTarget`).
pub fn symLinkInTree(
    allocator: std.mem.Allocator,
    tree_root: ?[]const u8,
    target_path: []const u8,
    link_path: []const u8,
) !void {
    const target = try treeLinkTarget(allocator, tree_root, target_path, link_path);
    defer allocator.free(target);
    try io_helper.symLink(target, link_path);
}

/// `target_path` relative to `link_path`'s directory, or null when either
/// lies outside `tree_root` or the relative path does not reach the target.
fn relativeWithinTree(
    arena: std.mem.Allocator,
    tree_root: []const u8,
    target_path: []const u8,
    link_path: []const u8,
) ?[]const u8 {
    const root = absolutePath(arena, tree_root) orelse return null;
    const target = absolutePath(arena, target_path) orelse return null;
    const link = absolutePath(arena, link_path) orelse return null;
    if (!pathWithin(target, root) or !pathWithin(link, root)) return null;

    const link_dir = std.fs.path.dirname(link) orelse return null;
    const rel = std.fs.path.relativePosix(arena, "/", link_dir, target) catch return null;
    if (rel.len == 0) return null;

    // The relative path is computed from the names; the kernel resolves it from
    // the directory the link physically sits in. Confirm the two agree (they
    // would not if the link's own directory were a symlink elsewhere).
    var dir_buf: [std.fs.max_path_bytes]u8 = undefined;
    var reached_buf: [std.fs.max_path_bytes]u8 = undefined;
    var target_buf: [std.fs.max_path_bytes]u8 = undefined;
    const real_dir = physicalPath(link_dir, &dir_buf) orelse return null;
    const reached = std.fs.path.resolvePosix(arena, &.{ real_dir, rel }) catch return null;
    const real_reached = physicalPath(reached, &reached_buf) orelse return null;
    const real_target = physicalPath(target, &target_buf) orelse return null;
    if (!std.mem.eql(u8, real_reached, real_target)) return null;
    return rel;
}

/// `path` with every symlink followed (realpath(3)), or null when it does not
/// resolve. The result is written into `out`.
fn physicalPath(path: []const u8, out: *[std.fs.max_path_bytes]u8) ?[]const u8 {
    if (builtin.os.tag == .windows) return null;
    var path_z: [std.fs.max_path_bytes:0]u8 = undefined;
    if (path.len >= path_z.len) return null;
    @memcpy(path_z[0..path.len], path);
    path_z[path.len] = 0;
    const resolved = std.c.realpath(&path_z, out) orelse return null;
    return std.mem.sliceTo(resolved, 0);
}

/// `path` made absolute against the working directory and normalized.
fn absolutePath(arena: std.mem.Allocator, path: []const u8) ?[]const u8 {
    if (std.fs.path.isAbsolute(path)) return std.fs.path.resolvePosix(arena, &.{path}) catch null;
    const cwd_path = io_helper.getCwdAlloc(arena) catch return null;
    return std.fs.path.resolvePosix(arena, &.{ cwd_path, path }) catch null;
}

/// True when normalized absolute `path` is `root` or lies beneath it.
fn pathWithin(path: []const u8, root: []const u8) bool {
    if (!std.mem.startsWith(u8, path, root)) return false;
    if (path.len == root.len) return true;
    if (root.len > 0 and root[root.len - 1] == '/') return true;
    return path[root.len] == '/';
}

/// The path an existing link at `link_path` points to, with a relative
/// target resolved against the link's directory (lexically, the way the
/// target was written). Null when `link_path` is not a symlink.
/// Caller owns the returned slice.
pub fn resolvedLinkTarget(allocator: std.mem.Allocator, link_path: []const u8) ?[]u8 {
    const raw = io_helper.readLinkAlloc(allocator, link_path) catch return null;
    defer allocator.free(raw);
    if (std.fs.path.isAbsolute(raw)) return allocator.dupe(u8, raw) catch null;
    const dir = std.fs.path.dirname(link_path) orelse ".";
    return std.fs.path.resolve(allocator, &.{ dir, raw }) catch null;
}

/// Recover the target of Pantry's exact generated launcher format or a link.
/// Recognizing launchers keeps provider ownership identical after activation.
pub fn resolvedActivationTarget(allocator: std.mem.Allocator, path: []const u8) ?[]u8 {
    if (resolvedLinkTarget(allocator, path)) |target| return target;
    const content = io_helper.readFileAlloc(allocator, path, 64 * 1024) catch return null;
    defer allocator.free(content);
    const suffix = "\" \"$@\"\n";
    if (!std.mem.endsWith(u8, content, suffix)) return null;
    const relative_prefix = "#!/bin/sh\n" ++ shim_locate_self ++ "exec \"$d/";
    const absolute_prefix = "#!/bin/sh\nexec \"";
    if (std.mem.startsWith(u8, content, relative_prefix)) {
        const target = content[relative_prefix.len .. content.len - suffix.len];
        const directory = std.fs.path.dirname(path) orelse ".";
        return std.fs.path.resolve(allocator, &.{ directory, target }) catch null;
    }
    if (std.mem.startsWith(u8, content, absolute_prefix)) {
        const target = content[absolute_prefix.len .. content.len - suffix.len];
        if (std.fs.path.isAbsolute(target)) return allocator.dupe(u8, target) catch null;
    }
    return null;
}

/// True when `a` and `b` name the same location: the same normalized path,
/// or the same physical path once symlinks are followed (one may have been
/// written through a symlinked parent the other was not).
pub fn samePath(a: []const u8, b: []const u8) bool {
    if (std.mem.eql(u8, a, b)) return true;
    var buf_a: [std.fs.max_path_bytes]u8 = undefined;
    var buf_b: [std.fs.max_path_bytes]u8 = undefined;
    const real_a = physicalPath(a, &buf_a) orelse return false;
    const real_b = physicalPath(b, &buf_b) orelse return false;
    return std.mem.eql(u8, real_a, real_b);
}

/// Create symlink for a package binary (with explicit binary path)
/// If a symlink already exists from a different package, it is preserved (first-installed wins).
pub fn createBinarySymlinkFromPath(
    allocator: std.mem.Allocator,
    bin_name: []const u8,
    bin_path: []const u8,
    install_base: []const u8,
) !void {
    const symlink_dir = try std.fmt.allocPrint(
        allocator,
        "{s}/bin",
        .{install_base},
    );
    defer allocator.free(symlink_dir);

    const symlink_path = try std.fmt.allocPrint(
        allocator,
        "{s}/{s}",
        .{ symlink_dir, bin_name },
    );
    defer allocator.free(symlink_path);

    // Verify target exists
    io_helper.cwd().access(io_helper.io, bin_path, .{}) catch {
        if (!style.isCI()) style.print("  ✗ Binary not found: {s}\n", .{bin_path});
        return error.TargetNotFound;
    };

    // Create bin directory if it doesn't exist
    io_helper.makePath(symlink_dir) catch {
        return error.BinDirCreationFailed;
    };

    // Reject invalid package interfaces even when an existing owner keeps the
    // link. Validation must precede every successful return and link mutation.
    const use_shim = try requiresForwardingShim(allocator, bin_path);

    // Check if symlink already exists from a different package — don't overwrite.
    // Always log a structured message (even in CI) so `pantry doctor` and CI logs
    // can surface symlink collisions.
    if (symlinkOwnedByExistingPackage(allocator, symlink_path)) |existing_owner| {
        defer allocator.free(existing_owner);
        const existing_target = resolvedActivationTarget(allocator, symlink_path);
        defer if (existing_target) |target| allocator.free(target);
        // Re-activating this exact program must upgrade a legacy link to its
        // current invocation contract. Preserve another installed provider.
        if (existing_target == null or !samePath(existing_target.?, bin_path)) {
            if (style.isCI()) {
                // Machine-parseable line for CI log scraping
                style.print(
                    "pantry:symlink:skip bin={s} link={s} owner={s}\n",
                    .{ bin_name, symlink_path, existing_owner },
                );
            } else {
                style.print(
                    "  ~ Skipped {s} (already provided by {s})\n",
                    .{ bin_name, existing_owner },
                );
            }
            return;
        }
    }

    // Both scripts and native programs can locate resources through argv[0].
    // Exec the package path so activation preserves that resource root.
    if (use_shim) {
        if (writeForwardingShim(allocator, symlink_path, bin_path, install_base)) {
            if (!style.isCI()) style.print("  ✓ Created shim: {s} -> {s}\n", .{ bin_name, bin_path });
            return;
        }
        return error.ProgramActivationFailed;
    }

    // Create symlink (cross-platform); relative when it stays in the tree.
    io_helper.deleteFile(symlink_path) catch {};
    const link_target = try treeLinkTarget(allocator, install_base, bin_path, symlink_path);
    defer allocator.free(link_target);
    createSymlinkCrossPlatform(link_target, symlink_path) catch |err| {
        if (!style.isCI()) style.print("  ✗ Failed to create symlink: {}\n", .{err});
        return error.SymlinkCreationFailed;
    };

    if (!style.isCI()) style.print("  ✓ Created symlink: {s} -> {s}\n", .{ bin_name, bin_path });
}

/// True if the file at `path` begins with a `#!` shebang (i.e. it's a script
/// wrapper, not a Mach-O/ELF binary). Reads only the first two bytes.
pub fn isShebangScript(path: []const u8) bool {
    if (builtin.os.tag == .windows) return false;
    const fd = std.posix.openat(std.posix.AT.FDCWD, path, .{ .ACCMODE = .RDONLY }, 0) catch return false;
    defer _ = std.c.close(fd);

    var magic: [2]u8 = undefined;
    const n = std.posix.read(fd, &magic) catch return false;
    if (n != 2) return false;
    return magic[0] == '#' and magic[1] == '!';
}

/// POSIX executables keep their package argv[0], including native binaries
/// with sibling resources. Declared sourceable libraries remain links.
pub fn requiresForwardingShim(allocator: std.mem.Allocator, path: []const u8) !bool {
    if (builtin.os.tag == .windows) return false;
    const bin_dir = std.fs.path.dirname(path) orelse return true;
    const prefix = std.fs.path.dirname(bin_dir) orelse return true;
    const manifest = try std.fs.path.join(allocator, &.{ prefix, "share", "pantry", "interfaces.json" });
    defer allocator.free(manifest);
    const content = io_helper.readFileAlloc(allocator, manifest, 64 * 1024) catch |err| {
        if (err == error.FileNotFound) return true;
        return err;
    };
    defer allocator.free(content);
    const Interfaces = struct { version: u32, sourceablePrograms: []const []const u8 };
    const parsed = std.json.parseFromSlice(Interfaces, allocator, content, .{ .ignore_unknown_fields = true }) catch return error.InvalidPackageInterface;
    defer parsed.deinit();
    if (parsed.value.version != 1) return error.InvalidPackageInterface;
    var sourceable = false;
    for (parsed.value.sourceablePrograms) |name| {
        if (name.len == 0) return error.InvalidPackageInterface;
        for (name) |character| {
            if (!std.ascii.isAlphanumeric(character) and std.mem.indexOfScalar(u8, "_.+-", character) == null)
                return error.InvalidPackageInterface;
        }
        if (std.mem.eql(u8, name, std.fs.path.basename(path))) sourceable = true;
    }
    return !sourceable;
}

/// Activate one program without substituting a resource-breaking symlink
/// when its forwarding launcher cannot be written.
pub fn createProgramActivation(allocator: std.mem.Allocator, link: []const u8, source: []const u8, tree_root: ?[]const u8) !void {
    const use_shim = try requiresForwardingShim(allocator, source);
    if (use_shim) {
        if (!writeForwardingShim(allocator, link, source, tree_root)) return error.ProgramActivationFailed;
    } else {
        io_helper.deleteFile(link) catch {};
        try symLinkInTree(allocator, tree_root, source, link);
    }
}

/// Shell that sets `d` to the directory a shim really lives in: `$0`, after
/// following any symlinks to the shim file itself. `$0` is the path the shim
/// was invoked by (the full path, for a PATH lookup), so a target relative to
/// `$d` is found wherever the tree is and however it was reached. Parameter
/// expansion keeps the common case (no symlink) free of subprocesses.
const shim_locate_self =
    \\s=$0
    \\while [ -h "$s" ]; do
    \\  l=$(readlink "$s")
    \\  case $l in
    \\    /*) s=$l ;;
    \\    *) case $s in */*) s=${s%/*}/$l ;; *) s=$l ;; esac ;;
    \\  esac
    \\done
    \\case $s in */*) d=${s%/*} ;; *) d=. ;; esac
    \\
;

/// The shim body that execs `target` (with `prefix`, e.g. `bun `, before it).
/// A relative `target` (from `treeLinkTarget`) is resolved against the shim's
/// own directory; an absolute one is exec'd as is. Caller owns the result.
fn shimScript(allocator: std.mem.Allocator, prefix: []const u8, target: []const u8) ![]u8 {
    return shimScriptWithArguments(allocator, prefix, target, &.{});
}

fn shimScriptWithArguments(allocator: std.mem.Allocator, prefix: []const u8, target: []const u8, arguments: []const []const u8) ![]u8 {
    var suffix = try std.ArrayList(u8).initCapacity(allocator, 64);
    defer suffix.deinit(allocator);
    for (arguments) |argument| {
        try suffix.appendSlice(allocator, " '");
        for (argument) |character| {
            if (character == 39) {
                try suffix.appendSlice(allocator, "'\"'\"'");
            } else try suffix.append(allocator, character);
        }
        try suffix.append(allocator, 39);
    }
    try suffix.appendSlice(allocator, " \"$@\"\n");
    // Concatenated rather than formatted: the prelude's `${s%/*}` would read
    // as a format placeholder.
    if (std.fs.path.isAbsolute(target)) {
        return std.mem.concat(allocator, u8, &.{ "#!/bin/sh\nexec ", prefix, "\"", target, "\"", suffix.items });
    }
    return std.mem.concat(allocator, u8, &.{ "#!/bin/sh\n", shim_locate_self, "exec ", prefix, "\"$d/", target, "\"", suffix.items });
}

/// Write a tiny `#!/bin/sh` shim at `shim_path` that `exec`s `target_path "$@"`.
/// Keeps the executable's resource root through argv[0]. Inside `tree_root`
/// the target is written relative to the shim (see `treeLinkTarget`).
/// Returns true on success.
pub fn writeForwardingShim(
    allocator: std.mem.Allocator,
    shim_path: []const u8,
    target_path: []const u8,
    tree_root: ?[]const u8,
) bool {
    return writeShim(allocator, shim_path, "", target_path, tree_root);
}

/// `writeForwardingShim` with `prefix` (e.g. `bun `) before the target.
pub fn writeShim(
    allocator: std.mem.Allocator,
    shim_path: []const u8,
    prefix: []const u8,
    target_path: []const u8,
    tree_root: ?[]const u8,
) bool {
    return writeShimWithArguments(allocator, shim_path, prefix, target_path, tree_root, &.{});
}

/// Activate a command alias through the same relocatable executable contract.
pub fn writeShimWithArguments(
    allocator: std.mem.Allocator,
    shim_path: []const u8,
    prefix: []const u8,
    target_path: []const u8,
    tree_root: ?[]const u8,
    arguments: []const []const u8,
) bool {
    const target = treeLinkTarget(allocator, tree_root, target_path, shim_path) catch return false;
    defer allocator.free(target);
    const content = shimScriptWithArguments(allocator, prefix, target, arguments) catch return false;
    defer allocator.free(content);

    var random: [8]u8 = undefined;
    io_helper.randomBytes(&random);
    const temporary = std.fmt.allocPrint(allocator, "{s}.pantry-{x}.tmp", .{ shim_path, std.mem.readInt(u64, &random, .little) }) catch return false;
    defer allocator.free(temporary);
    defer io_helper.deleteFile(temporary) catch {};
    // Rename replaces an old activation link itself, never its package target.
    const file = io_helper.createFileAbsolute(temporary, .{ .exclusive = true }) catch return false;
    io_helper.writeAllToFile(file, content) catch {
        io_helper.closeFile(file);
        return false;
    };
    if (builtin.os.tag != .windows) file.setPermissions(io_helper.io, io_helper.File.Permissions.fromMode(0o755)) catch {
        io_helper.closeFile(file);
        return false;
    };
    io_helper.closeFile(file);
    if (builtin.os.tag == .windows) io_helper.deleteFile(shim_path) catch {};
    io_helper.rename(temporary, shim_path) catch return false;
    return true;
}

/// Check if an existing symlink points to a different package than the one we're installing.
/// Returns true if a valid symlink exists AND its target is from a different package directory.
fn symlinkOwnedByDifferentPackage(
    allocator: std.mem.Allocator,
    symlink_path: []const u8,
    new_target: []const u8,
) bool {
    // Read the existing symlink target (a relative one is resolved against
    // the link's directory, so pantry-written relative links compare too)
    const existing_target = resolvedActivationTarget(allocator, symlink_path) orelse return false;
    defer allocator.free(existing_target);
    const new_resolved = std.fs.path.resolve(allocator, &.{new_target}) catch return false;
    defer allocator.free(new_resolved);

    // Extract the package directory from paths (everything up to /bin/ or /sbin/)
    const existing_pkg = extractPackageDir(existing_target) orelse return false;
    const new_pkg = extractPackageDir(new_resolved) orelse return false;

    // If they're from different package directories, the existing one takes precedence
    return !samePath(existing_pkg, new_pkg);
}

/// Return the owning package name (last path component of its version dir) of an
/// existing symlink, or null if the link doesn't exist / doesn't live inside a
/// recognisable package directory. Caller owns the returned slice.
fn symlinkOwnedByExistingPackage(
    allocator: std.mem.Allocator,
    symlink_path: []const u8,
) ?[]u8 {
    const existing_target = resolvedActivationTarget(allocator, symlink_path) orelse return null;
    defer allocator.free(existing_target);

    // A link that no longer resolves (its tree moved, or it was written
    // through a path that is gone) belongs to nobody: let it be replaced.
    io_helper.cwd().access(io_helper.io, existing_target, .{}) catch return null;

    const pkg_dir = extractPackageDir(existing_target) orelse return null;
    // pkg_dir looks like ".../packages/redis.io/v8.6.1" — take the parent segment as owner
    const slash = std.mem.lastIndexOfScalar(u8, pkg_dir, '/') orelse return null;
    const parent = pkg_dir[0..slash];
    const owner_start = (std.mem.lastIndexOfScalar(u8, parent, '/') orelse 0);
    const owner_begin = if (owner_start > 0) owner_start + 1 else 0;
    return allocator.dupe(u8, parent[owner_begin..]) catch null;
}

test "extractPackageDir handles bin and sbin" {
    try std.testing.expectEqualStrings(
        "/root/packages/redis.io/v8.6.1",
        extractPackageDir("/root/packages/redis.io/v8.6.1/bin/redis-server") orelse unreachable,
    );
    try std.testing.expectEqualStrings(
        "/root/packages/valkey.io/v9.0.3",
        extractPackageDir("/root/packages/valkey.io/v9.0.3/sbin/valkey-server") orelse unreachable,
    );
    try std.testing.expect(extractPackageDir("/bogus/path") == null);
}

/// Extract the package directory portion from a binary path.
/// e.g. ".../packages/redis.io/v8.6.1/bin/redis-server" → ".../packages/redis.io/v8.6.1"
/// e.g. ".../packages/valkey.io/v9.0.3/sbin/valkey-server" → ".../packages/valkey.io/v9.0.3"
fn extractPackageDir(path: []const u8) ?[]const u8 {
    // Look for /bin/ or /sbin/ suffix and return everything before it
    if (std.mem.lastIndexOf(u8, path, "/bin/")) |idx| {
        return path[0..idx];
    }
    if (std.mem.lastIndexOf(u8, path, "/sbin/")) |idx| {
        return path[0..idx];
    }
    return null;
}

/// Create symlink for a package binary (legacy - builds path from package info)
pub fn createBinarySymlink(
    allocator: std.mem.Allocator,
    package_name: []const u8,
    version: []const u8,
    bin_name: []const u8,
    install_base: []const u8,
) !void {
    // Build paths - packages are in {install_base}/packages/
    const package_bin_path = try std.fmt.allocPrint(
        allocator,
        "{s}/packages/{s}/v{s}/bin/{s}",
        .{ install_base, package_name, version, bin_name },
    );
    defer allocator.free(package_bin_path);

    return createBinarySymlinkFromPath(allocator, bin_name, package_bin_path, install_base);
}

/// Create version symlink (e.g., nodejs.org/v22 -> nodejs.org/v22.0.0)
pub fn createVersionSymlink(
    allocator: std.mem.Allocator,
    package_name: []const u8,
    full_version: []const u8,
    major_version: []const u8,
    install_base: []const u8,
) !void {
    const target_path = try std.fmt.allocPrint(
        allocator,
        "{s}/packages/{s}/v{s}",
        .{ install_base, package_name, full_version },
    );
    defer allocator.free(target_path);

    const symlink_path = try std.fmt.allocPrint(
        allocator,
        "{s}/packages/{s}/v{s}",
        .{ install_base, package_name, major_version },
    );
    defer allocator.free(symlink_path);

    // Verify target exists
    io_helper.cwd().access(io_helper.io, target_path, .{}) catch {
        return error.TargetNotFound;
    };

    // Remove existing symlink if present
    io_helper.deleteFile(symlink_path) catch {};

    // Create symlink (cross-platform). The alias and its target are siblings,
    // so the link is just `v{full}`, wherever the tree lives.
    const package_root = std.fs.path.dirname(symlink_path) orelse return error.InvalidPath;
    const link_target = try treeLinkTarget(allocator, package_root, target_path, symlink_path);
    defer allocator.free(link_target);
    createSymlinkCrossPlatform(link_target, symlink_path) catch {
        return error.SymlinkCreationFailed;
    };

    if (!style.isCI()) style.print("  ✓ Version symlink: v{s} -> v{s}\n", .{ major_version, full_version });
}

/// Result of discovering binaries - contains bin name and its full path
pub const BinaryInfo = struct {
    name: []const u8,
    path: []const u8,

    pub fn deinit(self: *BinaryInfo, allocator: std.mem.Allocator) void {
        allocator.free(self.name);
        allocator.free(self.path);
    }
};

/// Discover npm package binaries in lib/node_modules structure
fn discoverNpmBinaries(
    allocator: std.mem.Allocator,
    package_dir: []const u8,
) ![]BinaryInfo {
    // Check for npm package structure: {package_dir}/lib/node_modules/{package_name}/
    const node_modules_path = try std.fmt.allocPrint(allocator, "{s}/lib/node_modules", .{package_dir});
    defer allocator.free(node_modules_path);

    // Use std.fs.Dir for iteration (Io.Dir doesn't have iterate() in Zig 0.16)
    var node_modules_dir = io_helper.openDirForIteration(node_modules_path) catch {
        return try allocator.alloc(BinaryInfo, 0);
    };
    defer node_modules_dir.close();

    var binaries = try std.ArrayList(BinaryInfo).initCapacity(allocator, 8);
    errdefer {
        for (binaries.items) |*bin| {
            bin.deinit(allocator);
        }
        binaries.deinit(allocator);
    }

    // Iterate through packages in node_modules
    var it = node_modules_dir.iterate();
    while (it.next() catch null) |entry| {
        if (entry.kind != .directory) continue;

        // Check for bin directory in this npm package
        const npm_bin_path = try std.fmt.allocPrint(
            allocator,
            "{s}/{s}/bin",
            .{ node_modules_path, entry.name },
        );
        defer allocator.free(npm_bin_path);

        var npm_bin_dir = io_helper.openDirForIteration(npm_bin_path) catch continue;
        defer npm_bin_dir.close();

        // Iterate binaries in npm package's bin directory
        var bin_it = npm_bin_dir.iterate();
        while (bin_it.next() catch null) |bin_entry| {
            if (bin_entry.kind == .file or bin_entry.kind == .sym_link) {
                const full_path = try std.fmt.allocPrint(
                    allocator,
                    "{s}/{s}",
                    .{ npm_bin_path, bin_entry.name },
                );
                errdefer allocator.free(full_path);

                // Check if executable using io_helper
                const stat = io_helper.statFile(full_path) catch {
                    allocator.free(full_path);
                    continue;
                };
                const is_executable = (stat.mode & 0o111) != 0;

                if (is_executable) {
                    try binaries.append(allocator, .{
                        .name = try allocator.dupe(u8, bin_entry.name),
                        .path = full_path,
                    });
                }
            }
        }
    }

    return try binaries.toOwnedSlice(allocator);
}

/// Discover binaries in a package directory
/// 1. Checks for npm package structure (lib/node_modules/*/bin/*)
/// 2. Scans standard bin/ and sbin/ directories
/// 3. Falls back to scanning the package root for native executables
///    (handles packages like zig that ship the binary at root level)
pub fn discoverBinaries(
    allocator: std.mem.Allocator,
    package_dir: []const u8,
) ![]BinaryInfo {
    // First, try to find npm binaries (these take precedence)
    const npm_bins = try discoverNpmBinaries(allocator, package_dir);
    if (npm_bins.len > 0) {
        return npm_bins;
    }
    defer allocator.free(npm_bins);

    var binaries = try std.ArrayList(BinaryInfo).initCapacity(allocator, 8);
    errdefer {
        for (binaries.items) |*bin| {
            bin.deinit(allocator);
        }
        binaries.deinit(allocator);
    }

    // Scan both bin/ and sbin/ directories (e.g. RabbitMQ uses sbin/)
    const bin_dirs = [_][]const u8{ "bin", "sbin" };
    for (bin_dirs) |subdir| {
        const scan_dir = try std.fmt.allocPrint(allocator, "{s}/{s}", .{ package_dir, subdir });
        defer allocator.free(scan_dir);

        var dir = io_helper.openDirForIteration(scan_dir) catch continue;
        defer dir.close();

        var it = dir.iterate();
        while (it.next() catch null) |entry| {
            if (entry.kind == .file or entry.kind == .sym_link) {
                const full_path = try std.fmt.allocPrint(allocator, "{s}/{s}", .{ scan_dir, entry.name });
                errdefer allocator.free(full_path);

                // Check if executable - try io_helper stat first, fall back to
                // treating all files in bin/ as executables (mode may be 0 on
                // some platforms where the Io layer doesn't expose permissions)
                const stat = io_helper.statFile(full_path) catch {
                    allocator.free(full_path);
                    continue;
                };
                const is_executable = if (stat.mode != 0)
                    (stat.mode & 0o111) != 0
                else
                    true; // In bin/sbin directory, assume executable if mode unavailable

                if (is_executable) {
                    try binaries.append(allocator, .{
                        .name = try allocator.dupe(u8, entry.name),
                        .path = full_path,
                    });
                }
            }
        }
    }

    // Fallback: if no binaries found in bin/sbin, scan the package root for native executables.
    // This handles packages (e.g. zig) that ship the binary at the top level instead of bin/.
    // Only pick up files that are executable and look like native binaries (no extension),
    // to avoid false positives from scripts or data files.
    if (binaries.items.len == 0) {
        var root_dir = io_helper.openDirForIteration(package_dir) catch
            return try binaries.toOwnedSlice(allocator);
        defer root_dir.close();

        var root_it = root_dir.iterate();
        while (root_it.next() catch null) |entry| {
            if (entry.kind != .file and entry.kind != .sym_link) continue;
            // Skip dotfiles and files with common non-binary extensions
            if (entry.name.len == 0 or entry.name[0] == '.') continue;
            if (std.mem.endsWith(u8, entry.name, ".json") or
                std.mem.endsWith(u8, entry.name, ".txt") or
                std.mem.endsWith(u8, entry.name, ".md") or
                std.mem.endsWith(u8, entry.name, ".yml") or
                std.mem.endsWith(u8, entry.name, ".yaml") or
                std.mem.endsWith(u8, entry.name, ".toml") or
                std.mem.endsWith(u8, entry.name, ".cfg") or
                std.mem.endsWith(u8, entry.name, ".conf") or
                std.mem.endsWith(u8, entry.name, ".ini") or
                std.mem.endsWith(u8, entry.name, ".log") or
                std.mem.endsWith(u8, entry.name, ".lock"))
            {
                continue;
            }

            const full_path = try std.fmt.allocPrint(allocator, "{s}/{s}", .{ package_dir, entry.name });
            errdefer allocator.free(full_path);

            const stat = io_helper.statFile(full_path) catch {
                allocator.free(full_path);
                continue;
            };
            // Only pick up files that are actually executable (strict check — no mode=0 fallback)
            if (stat.mode != 0 and (stat.mode & 0o111) != 0) {
                try binaries.append(allocator, .{
                    .name = try allocator.dupe(u8, entry.name),
                    .path = full_path,
                });
            } else {
                allocator.free(full_path);
            }
        }
    }

    return try binaries.toOwnedSlice(allocator);
}

/// Create all symlinks for a package
pub fn createPackageSymlinks(
    allocator: std.mem.Allocator,
    package_name: []const u8,
    version: []const u8,
    install_base: []const u8,
) !void {
    const package_dir = try std.fmt.allocPrint(
        allocator,
        "{s}/packages/{s}/v{s}",
        .{ install_base, package_name, version },
    );
    defer allocator.free(package_dir);

    // Discover binaries
    const binaries = try discoverBinaries(allocator, package_dir);
    defer {
        for (binaries) |*bin| {
            var b = bin.*;
            b.deinit(allocator);
        }
        allocator.free(binaries);
    }

    if (binaries.len == 0) {
        if (!style.isCI()) style.print("  ! No binaries found in {s}\n", .{package_dir});
        // Even without binaries, still create version symlink for libraries
    } else {
        // Create symlinks for each binary using the discovered paths
        for (binaries) |bin_info| {
            try createBinarySymlinkFromPath(allocator, bin_info.name, bin_info.path, install_base);
        }
    }

    // Always create version symlink (needed for library dependencies like zlib)
    var parts = std.mem.splitScalar(u8, version, '.');
    if (parts.next()) |major| {
        createVersionSymlink(allocator, package_name, version, major, install_base) catch |err| {
            if (!style.isCI()) style.print("  ! Failed to create version symlink: {}\n", .{err});
        };
    }
}

/// Remove symlinks for a package
pub fn removePackageSymlinks(
    allocator: std.mem.Allocator,
    package_name: []const u8,
    version: []const u8,
    install_base: []const u8,
) !void {
    const package_dir = try std.fmt.allocPrint(
        allocator,
        "{s}/packages/{s}/v{s}",
        .{ install_base, package_name, version },
    );
    defer allocator.free(package_dir);

    const binaries = try discoverBinaries(allocator, package_dir);
    defer {
        for (binaries) |*bin| {
            var b = bin.*;
            b.deinit(allocator);
        }
        allocator.free(binaries);
    }

    const bin_dir = try std.fmt.allocPrint(allocator, "{s}/bin", .{install_base});
    defer allocator.free(bin_dir);

    for (binaries) |bin_info| {
        const symlink_path = try std.fmt.allocPrint(
            allocator,
            "{s}/{s}",
            .{ bin_dir, bin_info.name },
        );
        defer allocator.free(symlink_path);

        // Only remove symlinks that actually point to this package
        // (another package may have claimed this binary name)
        if (symlinkOwnedByDifferentPackage(allocator, symlink_path, bin_info.path)) {
            continue; // Symlink belongs to a different package — leave it
        }

        io_helper.deleteFile(symlink_path) catch |err| {
            if (!style.isCI()) style.print("  ! Failed to remove symlink {s}: {}\n", .{ bin_info.name, err });
        };
    }

    // Remove version symlink
    var parts = std.mem.splitScalar(u8, version, '.');
    if (parts.next()) |major| {
        const version_symlink = try std.fmt.allocPrint(
            allocator,
            "{s}/packages/{s}/v{s}",
            .{ install_base, package_name, major },
        );
        defer allocator.free(version_symlink);

        io_helper.deleteFile(version_symlink) catch {};
    }
}

/// Shim type based on the target file extension
pub const ShimType = enum {
    /// Native executable (forwarding launcher on POSIX, copy on Windows)
    native,
    /// Node.js script (.js, .mjs, .cjs files)
    node,
    /// Shell script (custom shell scripts)
    shell,
};

/// Detect shim type from file path
pub fn detectShimType(file_path: []const u8) ShimType {
    if (std.mem.endsWith(u8, file_path, ".js") or
        std.mem.endsWith(u8, file_path, ".mjs") or
        std.mem.endsWith(u8, file_path, ".cjs") or
        std.mem.endsWith(u8, file_path, ".ts"))
    {
        return .node;
    }
    if (std.mem.endsWith(u8, file_path, ".sh")) {
        return .shell;
    }
    return .native;
}

/// Create a cross-platform shim for a binary
/// For JS/TS files: creates shell/cmd scripts that invoke bun
/// Native programs retain their package resource root through activation.
/// A target inside `tree_root` (normally the pantry dir holding `shim_dir`)
/// is referenced relative to the shim, so the tree stays relocatable.
pub fn createShim(
    allocator: std.mem.Allocator,
    bin_name: []const u8,
    target_path: []const u8,
    shim_dir: []const u8,
    tree_root: ?[]const u8,
) !void {
    const shim_type = detectShimType(target_path);

    // Create shim directory if it doesn't exist
    io_helper.makePath(shim_dir) catch {
        return error.BinDirCreationFailed;
    };

    // Verify target exists
    io_helper.cwd().access(io_helper.io, target_path, .{}) catch return error.TargetNotFound;

    switch (shim_type) {
        .native => {
            // Preserve the native program's package resource root.
            const shim_path = try std.fmt.allocPrint(allocator, "{s}/{s}", .{ shim_dir, bin_name });
            defer allocator.free(shim_path);

            try createProgramActivation(allocator, shim_path, target_path, tree_root);
        },
        .node, .shell => {
            // For JS/shell files, create wrapper scripts
            try createScriptShim(allocator, bin_name, target_path, shim_dir, shim_type, tree_root);
        },
    }
}

/// Create wrapper scripts for JS/shell files
fn createScriptShim(
    allocator: std.mem.Allocator,
    bin_name: []const u8,
    target_path: []const u8,
    shim_dir: []const u8,
    shim_type: ShimType,
    tree_root: ?[]const u8,
) !void {
    // Create Unix shell script
    const unix_shim_path = try std.fmt.allocPrint(allocator, "{s}/{s}", .{ shim_dir, bin_name });
    defer allocator.free(unix_shim_path);

    // Remove existing shim
    io_helper.deleteFile(unix_shim_path) catch {};

    // Generate Unix shim content
    const shim_target = try treeLinkTarget(allocator, tree_root, target_path, unix_shim_path);
    defer allocator.free(shim_target);
    const unix_content = switch (shim_type) {
        .node => try shimScript(allocator, "bun ", shim_target),
        .shell => try shimScript(allocator, "", shim_target),
        .native => unreachable,
    };
    defer allocator.free(unix_content);

    // Write Unix shim with executable permissions
    const file = io_helper.cwd().createFile(io_helper.io, unix_shim_path, .{}) catch {
        return error.SymlinkCreationFailed;
    };
    io_helper.writeAllToFile(file, unix_content) catch {
        file.close(io_helper.io);
        return error.SymlinkCreationFailed;
    };
    file.close(io_helper.io);

    // Make executable on Unix using native syscall
    if (builtin.os.tag != .windows) {
        var chmod_buf: [std.fs.max_path_bytes:0]u8 = undefined;
        if (unix_shim_path.len < std.fs.max_path_bytes) {
            @memcpy(chmod_buf[0..unix_shim_path.len], unix_shim_path);
            chmod_buf[unix_shim_path.len] = 0;
            const result = std.c.chmod(&chmod_buf, 0o755);
            if (result != 0 and !style.isCI()) {
                style.print("Warning: Failed to make {s} executable\n", .{unix_shim_path});
            }
        }
    }

    // Create Windows .cmd shim
    if (builtin.os.tag == .windows) {
        const cmd_shim_path = try std.fmt.allocPrint(allocator, "{s}/{s}.cmd", .{ shim_dir, bin_name });
        defer allocator.free(cmd_shim_path);

        const cmd_content = switch (shim_type) {
            .node => try std.fmt.allocPrint(allocator,
                \\@ECHO off
                \\SETLOCAL
                \\SET "BUN_EXE=bun"
                \\"%BUN_EXE%" "{s}" %*
                \\
            , .{target_path}),
            .shell => try std.fmt.allocPrint(allocator,
                \\@ECHO off
                \\"{s}" %*
                \\
            , .{target_path}),
            .native => unreachable,
        };
        defer allocator.free(cmd_content);

        const cmd_file = io_helper.cwd().createFile(io_helper.io, cmd_shim_path, .{}) catch {
            return error.SymlinkCreationFailed;
        };
        io_helper.writeAllToFile(cmd_file, cmd_content) catch {
            cmd_file.close(io_helper.io);
            return error.SymlinkCreationFailed;
        };
        cmd_file.close(io_helper.io);
    }
}

fn normalizeBinName(name: []const u8) []const u8 {
    if (std.mem.lastIndexOfScalar(u8, name, '/')) |idx| {
        if (idx + 1 < name.len) return name[idx + 1 ..];
        return "";
    }
    return name;
}

test "normalizeBinName strips npm scope from executable names" {
    try std.testing.expectEqualStrings("tool", normalizeBinName("@scope/tool"));
    try std.testing.expectEqualStrings("tool", normalizeBinName("tool"));
    try std.testing.expectEqualStrings("", normalizeBinName("@scope/"));
}

/// Create shims from a bin config (parsed from package.json)
/// bin_config is a JSON object mapping bin names to paths
pub fn createShimsFromBinConfig(
    allocator: std.mem.Allocator,
    package_dir: []const u8,
    bin_config: std.json.Value,
    shim_dir: []const u8,
    tree_root: ?[]const u8,
) !void {
    if (bin_config != .object) return;

    var iter = bin_config.object.iterator();
    while (iter.next()) |entry| {
        const bin_name = normalizeBinName(entry.key_ptr.*);
        if (bin_name.len == 0) continue;
        if (entry.value_ptr.* != .string) continue;
        const bin_rel_path = entry.value_ptr.string;

        // Build absolute path to the binary
        const bin_path = try std.fmt.allocPrint(allocator, "{s}/{s}", .{ package_dir, bin_rel_path });
        defer allocator.free(bin_path);

        // Create shim
        createShim(allocator, bin_name, bin_path, shim_dir, tree_root) catch {};
    }
}

/// Create shims from a single bin string (package name is used as bin name)
pub fn createShimFromBinString(
    allocator: std.mem.Allocator,
    package_name: []const u8,
    package_dir: []const u8,
    bin_path: []const u8,
    shim_dir: []const u8,
    tree_root: ?[]const u8,
) !void {
    // Get just the package name without scope
    const bin_name = normalizeBinName(package_name);
    if (bin_name.len == 0) return;

    // Build absolute path
    const full_path = try std.fmt.allocPrint(allocator, "{s}/{s}", .{ package_dir, bin_path });
    defer allocator.free(full_path);

    try createShim(allocator, bin_name, full_path, shim_dir, tree_root);
}

test "discoverBinaries" {
    const allocator = std.testing.allocator;

    // Create test directory structure
    const test_dir = "test_pkg_bin";
    io_helper.makePath(test_dir) catch {};
    defer io_helper.deleteTree(test_dir) catch {};

    const bin_dir = try std.fmt.allocPrint(allocator, "{s}/bin", .{test_dir});
    defer allocator.free(bin_dir);

    io_helper.makePath(bin_dir) catch {};

    // Create test binary file
    {
        const test_bin = try std.fmt.allocPrint(allocator, "{s}/testbin", .{bin_dir});
        defer allocator.free(test_bin);

        const file = try io_helper.cwd().createFile(io_helper.io, test_bin, .{ .permissions = .executable_file });
        file.close(io_helper.io);
    }

    // Discover binaries
    const binaries = try discoverBinaries(allocator, test_dir);
    defer {
        for (binaries) |*bin| {
            var b = bin.*;
            b.deinit(allocator);
        }
        allocator.free(binaries);
    }

    try std.testing.expect(binaries.len == 1);
    try std.testing.expectEqualStrings("testbin", binaries[0].name);
}

test "createShimsFromBinConfig normalizes scoped bin object keys" {
    const allocator = std.testing.allocator;
    const test_dir = "test_scoped_npm_shim";

    io_helper.deleteTree(test_dir) catch {};
    defer io_helper.deleteTree(test_dir) catch {};

    try io_helper.makePath(test_dir ++ "/pkg/bin");
    try io_helper.makePath(test_dir ++ "/.bin");

    const target_path = test_dir ++ "/pkg/bin/cli.js";
    const file = try io_helper.cwd().createFile(io_helper.io, target_path, .{});
    try io_helper.writeAllToFile(file, "#!/usr/bin/env bun\nconsole.log('ok')\n");
    file.close(io_helper.io);

    const parsed = try std.json.parseFromSlice(
        std.json.Value,
        allocator,
        \\{"@scope/tool":"bin/cli.js"}
    ,
        .{},
    );
    defer parsed.deinit();

    try createShimsFromBinConfig(
        allocator,
        test_dir ++ "/pkg",
        parsed.value,
        test_dir ++ "/.bin",
        test_dir,
    );

    try io_helper.cwd().access(io_helper.io, test_dir ++ "/.bin/tool", .{});
}

test "native activation preserves argv0 resources, upgrades its own legacy link and survives relocation" {
    if (builtin.os.tag == .windows) return error.SkipZigTest;
    const allocator = std.testing.allocator;
    var tmp = std.testing.tmpDir(.{});
    defer tmp.cleanup();
    var root_buf: [std.fs.max_path_bytes]u8 = undefined;
    const root_len = try tmp.dir.realPathFile(io_helper.io, ".", &root_buf);
    const root = root_buf[0..root_len];
    try tmp.dir.createDirPath(io_helper.io, "tree with spaces/packages/resource.invalid/v1.0.0/bin");
    try tmp.dir.createDirPath(io_helper.io, "tree with spaces/packages/resource.invalid/v1.0.0/share");
    try tmp.dir.createDirPath(io_helper.io, "tree with spaces/bin");
    try tmp.dir.writeFile(io_helper.io, .{ .sub_path = "tree with spaces/packages/resource.invalid/v1.0.0/share/preset", .data = "native-resource-ok\n" });
    try tmp.dir.writeFile(io_helper.io, .{ .sub_path = "probe.c", .data =
        \\#include <stdio.h>
        \\#include <string.h>
        \\int main(int argc, char **argv) {
        \\  char path[4096];
        \\  if (strlen(argv[0]) + 20 >= sizeof(path)) return 3;
        \\  strcpy(path, argv[0]);
        \\  char *slash = strrchr(path, '/');
        \\  if (!slash) return 3;
        \\  strcpy(slash, "/../share/preset");
        \\  FILE *file = fopen(path, "r");
        \\  if (!file) return 2;
        \\  char value[128];
        \\  if (!fgets(value, sizeof(value), file)) return 4;
        \\  fclose(file);
        \\  fputs(value, stdout);
        \\  if (argc > 1) puts(argv[1]);
        \\  return 0;
        \\}
        \\
    });
    const tree = try std.fs.path.join(allocator, &.{ root, "tree with spaces" });
    defer allocator.free(tree);
    const source = try std.fs.path.join(allocator, &.{ root, "probe.c" });
    defer allocator.free(source);
    const binary = try std.fs.path.join(allocator, &.{ tree, "packages/resource.invalid/v1.0.0/bin/probe" });
    defer allocator.free(binary);
    const compile = try io_helper.childRun(allocator, &.{ "clang", source, "-o", binary });
    defer allocator.free(compile.stdout);
    defer allocator.free(compile.stderr);
    try std.testing.expect(compile.term == .exited and compile.term.exited == 0);
    const before = try @import("extractor.zig").computeChecksum(allocator, binary);
    defer allocator.free(before);
    const activated = try std.fs.path.join(allocator, &.{ tree, "bin/probe" });
    defer allocator.free(activated);
    try io_helper.symLink("../packages/resource.invalid/v1.0.0/bin/probe", activated);
    const legacy = try io_helper.childRun(allocator, &.{activated});
    defer allocator.free(legacy.stdout);
    defer allocator.free(legacy.stderr);
    try std.testing.expect(legacy.term == .exited and legacy.term.exited == 2);
    try createBinarySymlink(allocator, "resource.invalid", "1.0.0", "probe", tree);
    const result = try io_helper.childRun(allocator, &.{ activated, "argument with spaces" });
    defer allocator.free(result.stdout);
    defer allocator.free(result.stderr);
    try std.testing.expect(result.term == .exited and result.term.exited == 0);
    try std.testing.expectEqualStrings("native-resource-ok\nargument with spaces\n", result.stdout);
    const after = try @import("extractor.zig").computeChecksum(allocator, binary);
    defer allocator.free(after);
    try std.testing.expectEqualStrings(before, after);
    const relocated = try std.fs.path.join(allocator, &.{ root, "relocated tree" });
    defer allocator.free(relocated);
    try io_helper.rename(tree, relocated);
    const moved = try std.fs.path.join(allocator, &.{ relocated, "bin/probe" });
    defer allocator.free(moved);
    const again = try io_helper.childRun(allocator, &.{moved});
    defer allocator.free(again.stdout);
    defer allocator.free(again.stderr);
    try std.testing.expect(again.term == .exited and again.term.exited == 0);
    try std.testing.expectEqualStrings("native-resource-ok\n", again.stdout);
}

test "native launchers preserve the first provider during collision and removal" {
    if (builtin.os.tag == .windows) return error.SkipZigTest;
    const allocator = std.testing.allocator;
    var tmp = std.testing.tmpDir(.{});
    defer tmp.cleanup();
    try tmp.dir.createDirPath(io_helper.io, "packages/first.invalid/v1.0.0/bin");
    try tmp.dir.createDirPath(io_helper.io, "packages/second.invalid/v1.0.0/bin");
    // Non-shebang payloads exercise the native activation classification.
    for ([_][]const u8{ "first.invalid", "second.invalid" }) |provider| {
        const relative = try std.fmt.allocPrint(allocator, "packages/{s}/v1.0.0/bin/probe", .{provider});
        defer allocator.free(relative);
        const file = try tmp.dir.createFile(io_helper.io, relative, .{ .permissions = .executable_file });
        defer file.close(io_helper.io);
        try io_helper.writeAllToFile(file, provider);
    }
    var root_buf: [std.fs.max_path_bytes]u8 = undefined;
    const root_len = try tmp.dir.realPathFile(io_helper.io, ".", &root_buf);
    const root = root_buf[0..root_len];
    const activation = try std.fs.path.join(allocator, &.{ root, "bin/probe" });
    defer allocator.free(activation);
    const second = try std.fs.path.join(allocator, &.{ root, "packages/second.invalid/v1.0.0/bin/probe" });
    defer allocator.free(second);
    try createBinarySymlink(allocator, "first.invalid", "1.0.0", "probe", root);
    const original = try io_helper.readFileAlloc(allocator, activation, 64 * 1024);
    defer allocator.free(original);
    try createBinarySymlink(allocator, "second.invalid", "1.0.0", "probe", root);
    const collided = try io_helper.readFileAlloc(allocator, activation, 64 * 1024);
    defer allocator.free(collided);
    try std.testing.expectEqualStrings(original, collided);
    try std.testing.expect(symlinkOwnedByDifferentPackage(allocator, activation, second));
    try removePackageSymlinks(allocator, "second.invalid", "1.0.0", root);
    const remaining = try io_helper.readFileAlloc(allocator, activation, 64 * 1024);
    defer allocator.free(remaining);
    try std.testing.expectEqualStrings(original, remaining);
    // Re-activating the same launcher is supported, and removing its owner
    // removes the activation rather than retaining an orphan command.
    try createBinarySymlink(allocator, "first.invalid", "1.0.0", "probe", root);
    try removePackageSymlinks(allocator, "first.invalid", "1.0.0", root);
    try std.testing.expectError(error.FileNotFound, io_helper.cwd().access(io_helper.io, activation, .{}));
}

test "forwarding launcher replacement never truncates its cached package target" {
    if (builtin.os.tag == .windows) return error.SkipZigTest;
    const allocator = std.testing.allocator;
    var tmp = std.testing.tmpDir(.{});
    defer tmp.cleanup();
    try tmp.dir.writeFile(io_helper.io, .{ .sub_path = "cached-program", .data = "original-cached-program" });
    var root_buf: [std.fs.max_path_bytes]u8 = undefined;
    const root_len = try tmp.dir.realPathFile(io_helper.io, ".", &root_buf);
    const root = root_buf[0..root_len];
    const target = try std.fs.path.join(allocator, &.{ root, "cached-program" });
    defer allocator.free(target);
    const activation = try std.fs.path.join(allocator, &.{ root, "activation" });
    defer allocator.free(activation);
    try io_helper.symLink("cached-program", activation);
    try std.testing.expect(writeForwardingShim(allocator, activation, target, root));
    const preserved = try io_helper.readFileAlloc(allocator, target, 1024);
    defer allocator.free(preserved);
    try std.testing.expectEqualStrings("original-cached-program", preserved);
}

test "declared sourceable libraries without a shebang remain links" {
    if (builtin.os.tag == .windows) return error.SkipZigTest;
    const allocator = std.testing.allocator;
    var tmp = std.testing.tmpDir(.{});
    defer tmp.cleanup();
    try tmp.dir.createDirPath(io_helper.io, "package/bin");
    try tmp.dir.createDirPath(io_helper.io, "package/share/pantry");
    try tmp.dir.writeFile(io_helper.io, .{ .sub_path = "package/bin/library.sh", .data = "PANTRY_LIBRARY_VALUE=loaded\n" });
    try tmp.dir.writeFile(io_helper.io, .{ .sub_path = "package/share/pantry/interfaces.json", .data = "{\"version\":1,\"sourceablePrograms\":[\"library.sh\"]}" });
    var root_buf: [std.fs.max_path_bytes]u8 = undefined;
    const root_len = try tmp.dir.realPathFile(io_helper.io, ".", &root_buf);
    const source = try std.fs.path.join(allocator, &.{ root_buf[0..root_len], "package/bin/library.sh" });
    defer allocator.free(source);
    try std.testing.expect(!try requiresForwardingShim(allocator, source));
}

test "createBinarySymlink" {
    const allocator = std.testing.allocator;

    // Create test structure
    const install_base = "/tmp/pantry_test_install";
    io_helper.deleteTree(install_base) catch {};
    io_helper.makePath(install_base) catch {};
    defer io_helper.deleteTree(install_base) catch {};

    // Create package directory
    const pkg_dir = try std.fmt.allocPrint(allocator, "{s}/packages/testpkg/v1.0.0/bin", .{install_base});
    defer allocator.free(pkg_dir);

    io_helper.makePath(pkg_dir) catch {};

    // Create binary
    const bin_path = try std.fmt.allocPrint(allocator, "{s}/testbin", .{pkg_dir});
    defer allocator.free(bin_path);

    {
        const file = try std.Io.Dir.createFileAbsolute(io_helper.io, bin_path, .{ .permissions = .executable_file });
        file.close(io_helper.io);
    }

    // Create symlink
    try createBinarySymlink(allocator, "testpkg", "1.0.0", "testbin", install_base);

    // Verify symlink exists
    const symlink_path = try std.fmt.allocPrint(allocator, "{s}/bin/testbin", .{install_base});
    defer allocator.free(symlink_path);

    const stat = try io_helper.statFile(symlink_path);
    _ = stat;
}
