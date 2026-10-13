const std = @import("std");
const io_helper = @import("../io_helper.zig");
const Paths = @import("../core/platform.zig").Paths;
const style = @import("../cli/style.zig");
const symlink = @import("symlink.zig");

/// Fix macOS library paths using install_name_tool
/// This discovers @rpath dependencies using otool and fixes them to use absolute paths
pub fn fixMacOSLibraryPaths(
    allocator: std.mem.Allocator,
    binary_path: []const u8,
    lib_dir: []const u8,
) !void {
    return fixMacOSLibraryPathsInTree(allocator, binary_path, lib_dir, null);
}

/// `fixMacOSLibraryPaths`, writing a reference to a library inside
/// `tree_root` as `@loader_path/<relative path>` rather than the absolute path
/// the tree was installed through. An absolute reference breaks the moment
/// that path does: a project installed through a git worktree's symlinked
/// `pantry` left curl loading libcurl from the worktree, so deleting the
/// worktree broke curl in the main checkout.
pub fn fixMacOSLibraryPathsInTree(
    allocator: std.mem.Allocator,
    binary_path: []const u8,
    lib_dir: []const u8,
    tree_root: ?[]const u8,
) !void {
    const builtin = @import("builtin");

    // Only run on macOS
    if (builtin.os.tag != .macos) {
        return;
    }

    // Use otool to get current library dependencies
    const otool_result = io_helper.childRun(allocator, &[_][]const u8{
        "otool",
        "-L",
        binary_path,
    }) catch {
        // Not a Mach-O binary or otool failed - just return
        return;
    };
    defer allocator.free(otool_result.stdout);
    defer allocator.free(otool_result.stderr);

    if (otool_result.term.exited != 0) {
        // Not a Mach-O binary or otool failed
        return;
    }

    // Collect dependencies that need fixing: both @rpath/ and hardcoded absolute paths
    const DepToFix = struct {
        original_ref: []const u8, // The original path as shown in otool output
        lib_name: []const u8, // Just the library filename
    };

    var deps_to_fix = try std.ArrayList(DepToFix).initCapacity(allocator, 8);
    defer {
        for (deps_to_fix.items) |dep| {
            allocator.free(dep.original_ref);
            allocator.free(dep.lib_name);
        }
        deps_to_fix.deinit(allocator);
    }

    // Standard system library directories that should NOT be rewritten
    const system_prefixes = [_][]const u8{
        "/usr/lib/",
        "/System/Library/",
        "/Library/Apple/",
    };

    var lines = std.mem.tokenizeScalar(u8, otool_result.stdout, '\n');
    while (lines.next()) |line| {
        const trimmed = std.mem.trim(u8, line, " \t\r");
        if (!std.mem.endsWith(u8, trimmed, ")")) continue; // otool lines end with "(compatibility ...)"
        if (std.mem.indexOf(u8, trimmed, ".dylib") == null) continue;

        // Extract the path (everything before the first " (")
        const path_end = std.mem.indexOf(u8, trimmed, " (") orelse continue;
        const dep_path = std.mem.trim(u8, trimmed[0..path_end], " \t");
        if (dep_path.len == 0) continue;

        // Extract just the library filename
        const lib_name = if (std.mem.lastIndexOfScalar(u8, dep_path, '/')) |last_slash|
            dep_path[last_slash + 1 ..]
        else
            dep_path;

        // Case 1: @rpath/ references
        if (std.mem.startsWith(u8, dep_path, "@rpath/")) {
            try deps_to_fix.append(allocator, .{
                .original_ref = try allocator.dupe(u8, dep_path),
                .lib_name = try allocator.dupe(u8, lib_name),
            });
            continue;
        }

        // Case 2: Hardcoded absolute paths to non-system locations
        if (dep_path[0] == '/') {
            var is_system = false;
            for (system_prefixes) |prefix| {
                if (std.mem.startsWith(u8, dep_path, prefix)) {
                    is_system = true;
                    break;
                }
            }
            if (!is_system) {
                try deps_to_fix.append(allocator, .{
                    .original_ref = try allocator.dupe(u8, dep_path),
                    .lib_name = try allocator.dupe(u8, lib_name),
                });
            }
        }
    }

    // Fix each dependency
    for (deps_to_fix.items) |dep| {
        // Build absolute path using stack buffer: lib_dir/libfoo.dylib
        var abs_buf: [std.fs.max_path_bytes]u8 = undefined;
        const absolute_lib_path = std.fmt.bufPrint(&abs_buf, "{s}/{s}", .{ lib_dir, dep.lib_name }) catch continue;

        // Resolve the rewrite target. Prefer a copy in our own lib dir; if it's
        // not there (e.g. a binary built on a Homebrew box that hardcodes
        // /opt/homebrew/opt/openssl@3/lib/libssl.3.dylib, which lives in a
        // SEPARATE pantry package), search the other installed packages for a
        // dylib of the same name. Without this, eza's bundled libssh2 keeps the
        // Homebrew path and dyld can't load it.
        var xpkg_buf: [std.fs.max_path_bytes]u8 = undefined;
        const target = blk: {
            if (io_helper.accessAbsolute(absolute_lib_path, .{})) |_| {
                break :blk @as([]const u8, absolute_lib_path);
            } else |_| {}
            // pkgx-layout artifacts name their dependencies by registry path,
            // `@rpath/sourceware.org/bzip2/v1.0.8/lib/libbz2.1.0.8.dylib`, which
            // resolves against the root the packages are installed under. A
            // project install (`<proj>/pantry/<domain>/v<ver>`) has no
            // `/packages/` segment for the search below to anchor on, so
            // xorriso's darwin build installed and then could not load libbz2.
            if (std.mem.startsWith(u8, dep.original_ref, "@rpath/")) {
                const rel = dep.original_ref["@rpath/".len..];
                if (findRpathRefInAncestors(lib_dir, rel, &xpkg_buf)) |p| break :blk p;
                // The reference pins the exact version the artifact was built
                // against, and the dependency's constraint is usually a range:
                // php.net 8.5.8 links `sourceware.org/libffi/v3.6.0/lib/
                // libffi.8.dylib`, declares `libffi>=3.4.7`, and gets 3.8.0, so
                // php could not start. The same soname under the same major is
                // the same ABI, and `v<major>` is the link pantry keeps to the
                // installed release of that major.
                var major_buf: [std.fs.max_path_bytes]u8 = undefined;
                if (majorVersionRef(rel, &major_buf)) |major_rel| {
                    if (findRpathRefInAncestors(lib_dir, major_rel, &xpkg_buf)) |p| break :blk p;
                }
            }
            if (findDylibInPackages(allocator, lib_dir, dep.lib_name, &xpkg_buf)) |p| break :blk p;
            // Nowhere to point it — leave the reference as-is.
            continue;
        };

        // An `@rpath/` reference stays one when the target is another installed
        // package: `@rpath/<domain>/v<major>/lib/<name>`, through the major link
        // pantry keeps, resolved by the artifact's own `@loader_path/../../..`
        // rpath. The `@loader_path/../../../harfbuzz.org/v14.6.0/...` it used
        // to become is longer than the reference it replaces, and a dylib
        // linked without header padding has no room for it: install_name_tool
        // refused, the error was ignored, and ffmpeg's libavfilter kept looking
        // for `harfbuzz.org/v8`, which the registry no longer has.
        var rpath_buf: [std.fs.max_path_bytes]u8 = undefined;
        var ref_buf: [std.fs.max_path_bytes]u8 = undefined;
        // A package's own libraries move with its binaries. A registry rpath
        // assumes a shared root that a mirrored artifact may not name: Java's
        // rpath reaches global/, while Pantry installs into global/packages/.
        // Keep those references local before considering cross-package rpaths.
        const own_root = std.fs.path.dirname(lib_dir) orelse lib_dir;
        const own_ref = loaderRelativeRef(allocator, own_root, target, binary_path, &ref_buf);
        const rpath_ref: ?[]const u8 = if (own_ref == null and std.mem.startsWith(u8, dep.original_ref, "@rpath/")) packagesRpathRef(target, &rpath_buf) else null;
        const new_ref = own_ref orelse rpath_ref orelse (loaderRelativeRef(allocator, tree_root, target, binary_path, &ref_buf) orelse target);
        if (std.mem.eql(u8, new_ref, dep.original_ref)) continue;

        // Fix the library path using install_name_tool
        const fix_result = io_helper.childRun(allocator, &[_][]const u8{
            "install_name_tool",
            "-change",
            dep.original_ref,
            new_ref,
            binary_path,
        }) catch {
            continue;
        };
        defer allocator.free(fix_result.stdout);
        defer allocator.free(fix_result.stderr);
    }
}

/// `@rpath/<domain>/v<major>/<rest>` for a library under a `/packages/` root,
/// through the `v<major>` link when it exists there, else the exact version;
/// null when `target` is not under a packages root.
pub fn packagesRpathRef(target: []const u8, out: []u8) ?[]const u8 {
    const marker = "/packages/";
    // The last one: the tree itself can sit under a path with `/packages/` in it.
    const idx = std.mem.lastIndexOf(u8, target, marker) orelse return null;
    const root = target[0 .. idx + marker.len - 1];
    const rel = target[idx + marker.len ..];
    var major_buf: [std.fs.max_path_bytes]u8 = undefined;
    var probe_buf: [std.fs.max_path_bytes]u8 = undefined;
    if (majorVersionRef(rel, &major_buf)) |major_rel| {
        const probe = std.fmt.bufPrint(&probe_buf, "{s}/{s}", .{ root, major_rel }) catch return null;
        if (io_helper.accessAbsolute(probe, .{})) |_| {
            return std.fmt.bufPrint(out, "@rpath/{s}", .{major_rel}) catch null;
        } else |_| {}
    }
    return std.fmt.bufPrint(out, "@rpath/{s}", .{rel}) catch null;
}

/// `@loader_path/<path of lib from binary's dir>` when `binary_path` and
/// `lib_path` are both inside `tree_root` (see `symlink.treeLinkTarget`),
/// written into `out`; null to keep the absolute path.
fn loaderRelativeRef(
    allocator: std.mem.Allocator,
    tree_root: ?[]const u8,
    lib_path: []const u8,
    binary_path: []const u8,
    out: []u8,
) ?[]const u8 {
    const rel = symlink.treeLinkTarget(allocator, tree_root, lib_path, binary_path) catch return null;
    defer allocator.free(rel);
    if (std.fs.path.isAbsolute(rel)) return null;
    return std.fmt.bufPrint(out, "@loader_path/{s}", .{rel}) catch null;
}

/// The directory `binary_path` sits in, as seen from itself: `@loader_path`
/// (macOS) or `$ORIGIN` (ELF) joined with `dir`'s path relative to it. A
/// package's own lib dir moves with the package, so this is always relative.
fn originRelativeDir(
    allocator: std.mem.Allocator,
    origin: []const u8,
    binary_path: []const u8,
    dir: []const u8,
) ?[]u8 {
    const from = std.fs.path.dirname(binary_path) orelse return null;
    const rel = std.fs.path.relative(allocator, "/", null, from, dir) catch return null;
    defer allocator.free(rel);
    if (rel.len == 0) return allocator.dupe(u8, origin) catch null;
    return std.fmt.allocPrint(allocator, "{s}/{s}", .{ origin, rel }) catch null;
}

test "originRelativeDir points a binary at its package's lib dir from where it sits" {
    const a = std.testing.allocator;
    const from_bin = originRelativeDir(a, "@loader_path", "/p/pantry/curl.se/v8.22.0/bin/curl", "/p/pantry/curl.se/v8.22.0/lib").?;
    defer a.free(from_bin);
    try std.testing.expectEqualStrings("@loader_path/../lib", from_bin);
    const from_lib = originRelativeDir(a, "$ORIGIN", "/p/pantry/curl.se/v8.22.0/lib/libcurl.so.4", "/p/pantry/curl.se/v8.22.0/lib").?;
    defer a.free(from_lib);
    try std.testing.expectEqualStrings("$ORIGIN", from_lib);
}

/// Resolve an `@rpath`-relative registry path (`<domain>/v<ver>/lib/<name>`)
/// against the ancestors of a package's lib dir, nearest first, returning the
/// first that exists. The packages root is a few levels up — how many depends
/// on how many slashes the package's own domain has — so each is tried.
pub fn findRpathRefInAncestors(lib_dir: []const u8, rel: []const u8, out: []u8) ?[]const u8 {
    if (rel.len == 0 or rel[0] == '/' or std.mem.indexOf(u8, rel, "..") != null) return null;
    var dir = lib_dir;
    var depth: usize = 0;
    while (depth < 8) : (depth += 1) {
        dir = std.fs.path.dirname(dir) orelse return null;
        if (dir.len <= 1) return null;
        const candidate = std.fmt.bufPrint(out, "{s}/{s}", .{ dir, rel }) catch return null;
        if (io_helper.accessAbsolute(candidate, .{})) |_| return candidate else |_| {}
    }
    return null;
}

/// `<domain>/v<major>.<minor>.../<rest>` as `<domain>/v<major>/<rest>`, or null
/// when the path has no dotted version segment. The domain can have slashes
/// of its own (`sourceware.org/libffi`), so the first segment shaped like
/// `v<digit>...` with a dot in it is the version.
pub fn majorVersionRef(rel: []const u8, out: []u8) ?[]const u8 {
    var start: usize = 0;
    while (start < rel.len) {
        const end = std.mem.indexOfScalarPos(u8, rel, start, '/') orelse return null;
        const segment = rel[start..end];
        if (segment.len >= 3 and segment[0] == 'v' and std.ascii.isDigit(segment[1])) {
            const dot = std.mem.indexOfScalar(u8, segment, '.') orelse return null;
            const major = segment[1..dot];
            for (major) |c| if (!std.ascii.isDigit(c)) return null;
            return std.fmt.bufPrint(out, "{s}v{s}{s}", .{ rel[0..start], major, rel[end..] }) catch null;
        }
        start = end + 1;
    }
    return null;
}

/// Given a package's lib dir (`<...>/packages/<domain>/v<ver>/lib`), locate a
/// dylib named `basename` provided by ANY other installed package, returning its
/// absolute path written into `out`. Used to repoint hardcoded Homebrew/abs
/// references (e.g. libssl.3.dylib) at the matching pantry package. Searches
/// `<packages-root>/**/lib/<basename>` to a bounded depth.
fn findDylibInPackages(allocator: std.mem.Allocator, lib_dir: []const u8, basename: []const u8, out: []u8) ?[]const u8 {
    const marker = "/packages/";
    // The last one: a pantry tree under `~/Code/x/packages/...` has two.
    const idx = std.mem.lastIndexOf(u8, lib_dir, marker) orelse return null;
    const packages_root = lib_dir[0 .. idx + marker.len - 1]; // includes "/packages"
    return searchLibDirs(allocator, packages_root, basename, out, 0);
}

fn searchLibDirs(allocator: std.mem.Allocator, dir_path: []const u8, basename: []const u8, out: []u8, depth: usize) ?[]const u8 {
    if (depth > 4) return null;
    var dir = io_helper.openDirAbsoluteForIteration(dir_path) catch return null;
    defer dir.close();
    var it = dir.iterate();
    while (it.next() catch null) |entry| {
        if (entry.name.len > 0 and entry.name[0] == '.') continue;
        const child = std.fmt.allocPrint(allocator, "{s}/{s}", .{ dir_path, entry.name }) catch continue;
        defer allocator.free(child);
        if (entry.kind == .directory) {
            // When we reach a `lib` dir, check for the basename directly.
            if (std.mem.eql(u8, entry.name, "lib")) {
                const candidate = std.fmt.allocPrint(allocator, "{s}/{s}", .{ child, basename }) catch continue;
                defer allocator.free(candidate);
                if (io_helper.accessAbsolute(candidate, .{})) |_| {
                    if (candidate.len <= out.len) {
                        @memcpy(out[0..candidate.len], candidate);
                        return out[0..candidate.len];
                    }
                } else |_| {}
            }
            if (searchLibDirs(allocator, child, basename, out, depth + 1)) |p| return p;
        }
    }
    return null;
}

/// Add rpath entries to a binary for finding dependencies
fn addRpathEntries(
    allocator: std.mem.Allocator,
    binary_path: []const u8,
    package_dir: []const u8,
) !void {
    const builtin = @import("builtin");
    if (builtin.os.tag != .macos) return;

    // Resolve the canonical user-level global dir so dynamic libs in
    // `<global>/packages/<dep>/v<ver>/lib` (openssl.org, nodejs.org, etc.)
    // remain reachable from a freshly installed binary's rpath.
    const global = Paths.globalDir(allocator) catch return;
    defer allocator.free(global);

    // Add rpath entries for:
    // 1. The package's own lib directory
    // 2. The global pantry directory (for finding openssl.org, nodejs.org, etc.)
    // The package's own lib dir is named relative to the binary
    // (`@loader_path/../lib`), so it survives the package moving.
    var rp_buf1: [std.fs.max_path_bytes]u8 = undefined;
    const pkg_lib = std.fmt.bufPrint(&rp_buf1, "{s}/lib", .{package_dir}) catch return;
    const rp1 = originRelativeDir(allocator, "@loader_path", binary_path, pkg_lib) orelse return;
    defer allocator.free(rp1);
    var rp_buf2: [std.fs.max_path_bytes]u8 = undefined;
    const rp2 = std.fmt.bufPrint(&rp_buf2, "{s}", .{global}) catch return;
    const rpath_entries = [_][]const u8{ rp1, rp2 };

    // Add each rpath entry (codesigning is done later by codesignDirectory)
    for (rpath_entries) |rpath| {
        const result = io_helper.childRun(allocator, &[_][]const u8{
            "install_name_tool",
            "-add_rpath",
            rpath,
            binary_path,
        }) catch continue; // Ignore if already exists

        allocator.free(result.stdout);
        allocator.free(result.stderr);
    }
}

/// Fix a dylib's install name (-id) if it has a hardcoded build path
fn fixDylibInstallName(
    allocator: std.mem.Allocator,
    dylib_path: []const u8,
    lib_dir: []const u8,
    entry_name: []const u8,
) void {
    const builtin = @import("builtin");
    if (builtin.os.tag != .macos) return;

    // Use otool -D to get the install name
    const otool_result = io_helper.childRun(allocator, &[_][]const u8{
        "otool", "-D", dylib_path,
    }) catch return;
    defer allocator.free(otool_result.stdout);
    defer allocator.free(otool_result.stderr);

    if (otool_result.term.exited != 0) return;

    // otool -D output: first line is the file path, second line is the install name
    var lines_iter = std.mem.tokenizeScalar(u8, otool_result.stdout, '\n');
    _ = lines_iter.next(); // Skip first line (file path)
    const install_name = std.mem.trim(u8, lines_iter.next() orelse return, " \t\r");

    // Check if install name points to a non-standard location
    const system_prefixes = [_][]const u8{
        "/usr/lib/",
        "/System/Library/",
        "/Library/Apple/",
    };

    if (install_name.len == 0 or install_name[0] != '/') return;

    for (system_prefixes) |prefix| {
        if (std.mem.startsWith(u8, install_name, prefix)) return;
    }

    // Build the correct absolute path for this dylib
    var new_id_buf: [std.fs.max_path_bytes]u8 = undefined;
    const new_id = std.fmt.bufPrint(&new_id_buf, "{s}/{s}", .{ lib_dir, entry_name }) catch return;

    // Skip if already correct
    if (std.mem.eql(u8, install_name, new_id)) return;

    // Fix the install name
    const result = io_helper.childRun(allocator, &[_][]const u8{
        "install_name_tool", "-id", new_id, dylib_path,
    }) catch return;
    allocator.free(result.stdout);
    allocator.free(result.stderr);
}

/// Fix ELF RPATH/RUNPATH entries on Linux using `patchelf`.
/// Adds `$ORIGIN/../lib` (so binaries find sibling `lib/`) plus the package's
/// lib dir as a fallback. Silently skipped if `patchelf` isn't on PATH — we
/// treat it as best-effort because most prebuilt tarballs already have sane
/// RPATH. For packages that hardcode a build-time absolute path, this is the
/// Linux equivalent of the macOS `install_name_tool` dance above.
pub fn fixLinuxRpaths(
    allocator: std.mem.Allocator,
    binary_path: []const u8,
    lib_dir: []const u8,
) !void {
    const builtin = @import("builtin");
    if (builtin.os.tag != .linux) return;

    // Skip anything that isn't ELF — cheap magic byte check to avoid spawning
    // patchelf on scripts, symlinks to /dev/null, etc.
    {
        const f = io_helper.cwd().openFile(io_helper.io, binary_path, .{ .mode = .read_only }) catch return;
        defer f.close(io_helper.io);
        var magic: [4]u8 = undefined;
        const n = io_helper.platformRead(f.handle, &magic) catch return;
        if (n < 4) return;
        if (magic[0] != 0x7f or magic[1] != 'E' or magic[2] != 'L' or magic[3] != 'F') return;
    }

    // Build the rpath list: "$ORIGIN/../lib" plus the package's lib dir as
    // seen from this binary (`$ORIGIN` for a library inside it). Both are
    // relative to the binary, so the package keeps working when moved.
    const own_lib = originRelativeDir(allocator, "$ORIGIN", binary_path, lib_dir) orelse return;
    defer allocator.free(own_lib);
    const rpath = if (std.mem.eql(u8, own_lib, "$ORIGIN/../lib"))
        try allocator.dupe(u8, own_lib)
    else
        try std.fmt.allocPrint(allocator, "$ORIGIN/../lib:{s}", .{own_lib});
    defer allocator.free(rpath);

    // Try `patchelf --force-rpath --set-rpath <rpath> <binary>`. We use
    // `--force-rpath` so we don't depend on the kernel honouring DT_RUNPATH.
    const result = io_helper.childRun(allocator, &[_][]const u8{
        "patchelf", "--force-rpath", "--set-rpath", rpath, binary_path,
    }) catch {
        return;
    };
    defer allocator.free(result.stdout);
    defer allocator.free(result.stderr);
    if (result.term != .exited or result.term.exited != 0) {
        // patchelf failed (not ELF, or not dynamically linked) — nothing more we can do.
        return;
    }
}

/// Fix library paths for all executables and dylibs in a package directory
/// This includes both binaries in bin/ and libraries in lib/
pub fn fixDirectoryLibraryPaths(
    allocator: std.mem.Allocator,
    package_dir: []const u8,
) !void {
    return fixDirectoryLibraryPathsInTree(allocator, package_dir, null);
}

/// `fixDirectoryLibraryPaths` for a package installed in the pantry tree at
/// `tree_root` (`<project>/pantry`): references to libraries elsewhere in
/// that tree are written relative to the referencing binary.
pub fn fixDirectoryLibraryPathsInTree(
    allocator: std.mem.Allocator,
    package_dir: []const u8,
    tree_root: ?[]const u8,
) !void {
    const builtin = @import("builtin");
    // Linux-only path: walk bin/ and lib/ and patch ELF rpaths
    if (builtin.os.tag == .linux) {
        var bin_buf: [std.fs.max_path_bytes]u8 = undefined;
        const bin_dir = std.fmt.bufPrint(&bin_buf, "{s}/bin", .{package_dir}) catch return;
        var lib_buf: [std.fs.max_path_bytes]u8 = undefined;
        const lib_dir = std.fmt.bufPrint(&lib_buf, "{s}/lib", .{package_dir}) catch return;

        io_helper.accessAbsolute(lib_dir, .{}) catch return;

        // bin/
        if (io_helper.openDirAbsoluteForIteration(bin_dir)) |*dir_ptr| {
            var dir = dir_ptr.*;
            defer dir.close();
            var it = dir.iterate();
            while (it.next() catch null) |entry| {
                if (entry.kind != .file) continue;
                var bp: [std.fs.max_path_bytes]u8 = undefined;
                const p = std.fmt.bufPrint(&bp, "{s}/{s}", .{ bin_dir, entry.name }) catch continue;
                fixLinuxRpaths(allocator, p, lib_dir) catch {};
            }
        } else |_| {}

        // lib/
        if (io_helper.openDirAbsoluteForIteration(lib_dir)) |*dir_ptr| {
            var dir = dir_ptr.*;
            defer dir.close();
            var it = dir.iterate();
            while (it.next() catch null) |entry| {
                if (entry.kind != .file) continue;
                if (std.mem.indexOf(u8, entry.name, ".so") == null) continue;
                var lp: [std.fs.max_path_bytes]u8 = undefined;
                const p = std.fmt.bufPrint(&lp, "{s}/{s}", .{ lib_dir, entry.name }) catch continue;
                fixLinuxRpaths(allocator, p, lib_dir) catch {};
            }
        } else |_| {}

        return;
    }
    if (builtin.os.tag != .macos) return;

    // Build paths to bin and lib directories using stack buffers
    var bin_buf: [std.fs.max_path_bytes]u8 = undefined;
    const bin_dir = std.fmt.bufPrint(&bin_buf, "{s}/bin", .{package_dir}) catch return;

    var lib_buf: [std.fs.max_path_bytes]u8 = undefined;
    const lib_dir = std.fmt.bufPrint(&lib_buf, "{s}/lib", .{package_dir}) catch return;

    // Check if lib directory exists (we need it for absolute paths)
    io_helper.accessAbsolute(lib_dir, .{}) catch {
        // No lib directory - nothing to fix
        return;
    };

    // First fix dylib install names, then fix references in binaries/dylibs
    {
        var dir = io_helper.openDirAbsoluteForIteration(lib_dir) catch return;
        defer dir.close();

        var it = dir.iterate();
        while (it.next() catch null) |entry| {
            if (entry.kind != .file) continue;
            if (!std.mem.endsWith(u8, entry.name, ".dylib")) continue;

            var dl_buf: [std.fs.max_path_bytes]u8 = undefined;
            const dylib_path = std.fmt.bufPrint(&dl_buf, "{s}/{s}", .{ lib_dir, entry.name }) catch continue;

            // Fix the dylib's own install name first
            fixDylibInstallName(allocator, dylib_path, lib_dir, entry.name);

            // Add rpath entries for dylibs
            addRpathEntries(allocator, dylib_path, package_dir) catch {};

            // Fix library paths for this dylib (inter-dylib deps)
            fixMacOSLibraryPathsInTree(allocator, dylib_path, lib_dir, tree_root orelse package_dir) catch {};
        }
    }

    // Fix binaries in bin/ directory. A missing bin/ (library-only packages like
    // zlib.net, openssl.org, libexpat) must NOT abort: the rpath rewrites above
    // already invalidated the dylib signatures, so we have to fall through to the
    // re-sign step below. Using `catch return` here meant those dylibs were left
    // with broken ad-hoc signatures, and on Apple Silicon dyld then SIGKILLs any
    // binary that loads them (git, codex, …).
    //
    // sbin/ holds daemons (php-fpm, mysqld in some layouts) whose references
    // need the same rewrite: php.net's sbin/php-fpm kept its dangling
    // `@rpath/sourceware.org/libffi/v3.6.0/...` after bin/php was fixed, and
    // dyld refused to start it.
    var sbin_buf: [std.fs.max_path_bytes]u8 = undefined;
    const sbin_dir = std.fmt.bufPrint(&sbin_buf, "{s}/sbin", .{package_dir}) catch return;
    for ([_][]const u8{ bin_dir, sbin_dir }) |exec_dir| {
        if (io_helper.openDirAbsoluteForIteration(exec_dir)) |*dir_ptr| {
            var dir = dir_ptr.*;
            defer dir.close();

            var it = dir.iterate();
            while (it.next() catch null) |entry| {
                if (entry.kind != .file) continue;

                var bp_buf: [std.fs.max_path_bytes]u8 = undefined;
                const binary_path = std.fmt.bufPrint(&bp_buf, "{s}/{s}", .{ exec_dir, entry.name }) catch continue;

                // Add rpath entries for finding dependencies
                addRpathEntries(allocator, binary_path, package_dir) catch {};

                // Fix library paths (both @rpath/ and hardcoded absolute paths)
                fixMacOSLibraryPathsInTree(allocator, binary_path, lib_dir, tree_root orelse package_dir) catch {};
            }
        } else |_| {}
    }

    // Re-sign all modified binaries and dylibs. This MUST run even when bin/ is
    // absent — see the note above.
    codesignDirectory(allocator, bin_dir);
    codesignDirectory(allocator, sbin_dir);
    codesignDirectory(allocator, lib_dir);
}

/// Re-sign all Mach-O files in a directory after modifications
fn codesignDirectory(allocator: std.mem.Allocator, dir_path: []const u8) void {
    var dir = io_helper.openDirAbsoluteForIteration(dir_path) catch return;
    defer dir.close();

    var it = dir.iterate();
    while (it.next() catch null) |entry| {
        if (entry.kind != .file) continue;

        var path_buf: [std.fs.max_path_bytes]u8 = undefined;
        const file_path = std.fmt.bufPrint(&path_buf, "{s}/{s}", .{ dir_path, entry.name }) catch continue;

        const result = io_helper.childRun(allocator, &[_][]const u8{
            "codesign", "-s", "-", "-f", file_path,
        }) catch continue;
        allocator.free(result.stdout);
        allocator.free(result.stderr);
    }
}

test "an @rpath registry reference resolves against a project install's root" {
    const testing = std.testing;
    var tmp = testing.tmpDir(.{});
    defer tmp.cleanup();
    var root_buf: [std.fs.max_path_bytes]u8 = undefined;
    const root = root_buf[0..try tmp.dir.realPath(io_helper.io, &root_buf)];

    // <proj>/pantry/<domain>/v<ver>/lib, as `pantry install` lays it out.
    var buf: [std.fs.max_path_bytes]u8 = undefined;
    const bz_lib = try std.fmt.bufPrint(&buf, "{s}/pantry/sourceware.org/bzip2/v1.0.8/lib", .{root});
    try io_helper.makePath(bz_lib);
    var file_buf: [std.fs.max_path_bytes]u8 = undefined;
    const bz = try std.fmt.bufPrint(&file_buf, "{s}/libbz2.1.0.8.dylib", .{bz_lib});
    io_helper.closeFile(try io_helper.createFileAbsolute(bz, .{}));

    var lib_buf: [std.fs.max_path_bytes]u8 = undefined;
    const xorriso_lib = try std.fmt.bufPrint(&lib_buf, "{s}/pantry/gnu.org/xorriso/v1.5.4/lib", .{root});
    try io_helper.makePath(xorriso_lib);

    var out: [std.fs.max_path_bytes]u8 = undefined;
    const found = findRpathRefInAncestors(xorriso_lib, "sourceware.org/bzip2/v1.0.8/lib/libbz2.1.0.8.dylib", &out) orelse
        return error.TestExpectedResolution;
    try testing.expectEqualStrings(bz, found);

    try testing.expect(findRpathRefInAncestors(xorriso_lib, "example.com/missing/v1/lib/libx.dylib", &out) == null);
    try testing.expect(findRpathRefInAncestors(xorriso_lib, "../../etc/passwd", &out) == null);
}

test "majorVersionRef keeps the domain and file, and drops all but the major" {
    var out: [256]u8 = undefined;
    try std.testing.expectEqualStrings(
        "sourceware.org/libffi/v3/lib/libffi.8.dylib",
        majorVersionRef("sourceware.org/libffi/v3.6.0/lib/libffi.8.dylib", &out).?,
    );
    try std.testing.expectEqualStrings("zlib.net/v1/lib/libz.1.dylib", majorVersionRef("zlib.net/v1.3.2/lib/libz.1.dylib", &out).?);
    // Already a major link, or no version at all: nothing to fall back to.
    try std.testing.expect(majorVersionRef("zlib.net/v1/lib/libz.1.dylib", &out) == null);
    try std.testing.expect(majorVersionRef("libz.1.dylib", &out) == null);
}

test "an @rpath reference to a version not installed resolves through its major link" {
    const testing = std.testing;
    var tmp = testing.tmpDir(.{});
    defer tmp.cleanup();
    var root_buf: [std.fs.max_path_bytes]u8 = undefined;
    const root = root_buf[0..try tmp.dir.realPath(io_helper.io, &root_buf)];

    // libffi 3.8.0 is installed, with the v3 link pantry keeps beside it.
    var buf: [std.fs.max_path_bytes]u8 = undefined;
    const ffi_lib = try std.fmt.bufPrint(&buf, "{s}/pantry/sourceware.org/libffi/v3.8.0/lib", .{root});
    try io_helper.makePath(ffi_lib);
    var file_buf: [std.fs.max_path_bytes]u8 = undefined;
    io_helper.closeFile(try io_helper.createFileAbsolute(try std.fmt.bufPrint(&file_buf, "{s}/libffi.8.dylib", .{ffi_lib}), .{}));
    var link_buf: [std.fs.max_path_bytes]u8 = undefined;
    const link = try std.fmt.bufPrint(&link_buf, "{s}/pantry/sourceware.org/libffi/v3", .{root});
    try io_helper.symLink("v3.8.0", link);

    var lib_buf: [std.fs.max_path_bytes]u8 = undefined;
    const php_lib = try std.fmt.bufPrint(&lib_buf, "{s}/pantry/php.net/v8.5.8/lib", .{root});
    try io_helper.makePath(php_lib);

    // php was built against 3.6.0, which is not here.
    const rel = "sourceware.org/libffi/v3.6.0/lib/libffi.8.dylib";
    var out: [std.fs.max_path_bytes]u8 = undefined;
    try testing.expect(findRpathRefInAncestors(php_lib, rel, &out) == null);

    var major_buf: [std.fs.max_path_bytes]u8 = undefined;
    const found = findRpathRefInAncestors(php_lib, majorVersionRef(rel, &major_buf).?, &out) orelse
        return error.TestExpectedResolution;
    var want_buf: [std.fs.max_path_bytes]u8 = undefined;
    try testing.expectEqualStrings(try std.fmt.bufPrint(&want_buf, "{s}/pantry/sourceware.org/libffi/v3/lib/libffi.8.dylib", .{root}), found);
}

test "a library found in another package is referenced through @rpath and its major link" {
    const testing = std.testing;
    var tmp = testing.tmpDir(.{});
    defer tmp.cleanup();
    var root_buf: [std.fs.max_path_bytes]u8 = undefined;
    const root = root_buf[0..try tmp.dir.realPath(io_helper.io, &root_buf)];

    // harfbuzz 14.6.0 is installed with its v14 link; ffmpeg was built against v8.
    var buf: [std.fs.max_path_bytes]u8 = undefined;
    const hb_lib = try std.fmt.bufPrint(&buf, "{s}/packages/harfbuzz.org/v14.6.0/lib", .{root});
    try io_helper.makePath(hb_lib);
    var file_buf: [std.fs.max_path_bytes]u8 = undefined;
    const dylib = try std.fmt.bufPrint(&file_buf, "{s}/libharfbuzz.dylib", .{hb_lib});
    io_helper.closeFile(try io_helper.createFileAbsolute(dylib, .{}));
    var link_buf: [std.fs.max_path_bytes]u8 = undefined;
    try io_helper.symLink("v14.6.0", try std.fmt.bufPrint(&link_buf, "{s}/packages/harfbuzz.org/v14", .{root}));

    var out: [std.fs.max_path_bytes]u8 = undefined;
    try testing.expectEqualStrings("@rpath/harfbuzz.org/v14/lib/libharfbuzz.dylib", packagesRpathRef(dylib, &out).?);
    // No shorter than what it replaces would need, and nothing outside a packages root.
    try testing.expect(packagesRpathRef("/opt/homebrew/lib/libharfbuzz.dylib", &out) == null);
}

test "a global package loads its own dylib even when its registry rpath reaches the wrong root" {
    if (@import("builtin").os.tag != .macos) return error.SkipZigTest;
    var tmp = std.testing.tmpDir(.{});
    defer tmp.cleanup();
    var arena = std.heap.ArenaAllocator.init(std.testing.allocator);
    defer arena.deinit();
    const a = arena.allocator();
    var root_buf: [std.fs.max_path_bytes]u8 = undefined;
    const root = root_buf[0..try tmp.dir.realPath(io_helper.io, &root_buf)];
    const pkg = try std.fmt.allocPrint(a, "{s}/global/packages/example.org/v1.2.3", .{root});
    const lib_dir = try std.fmt.allocPrint(a, "{s}/lib", .{pkg});
    const bin_dir = try std.fmt.allocPrint(a, "{s}/bin", .{pkg});
    try io_helper.makePath(lib_dir);
    try io_helper.makePath(bin_dir);
    const source = try std.fmt.allocPrint(a, "{s}/probe.c", .{root});
    const main_source = try std.fmt.allocPrint(a, "{s}/main.c", .{root});
    const Writer = struct {
        fn write(path: []const u8, text: []const u8) !void {
            const file = try io_helper.createFileAbsolute(path, .{ .truncate = true });
            defer io_helper.closeFile(file);
            try io_helper.writeAllToFile(file, text);
        }
    };
    try Writer.write(source, "int answer(void) { return 42; }\n");
    try Writer.write(main_source, "#include <stdio.h>\nextern int answer(void);\nint main(void) { printf(\"%d\\n\", answer()); return 0; }\n");
    const dylib = try std.fmt.allocPrint(a, "{s}/libprobe.dylib", .{lib_dir});
    const binary = try std.fmt.allocPrint(a, "{s}/probe", .{bin_dir});
    const cc_lib = try io_helper.childRun(a, &.{ "/usr/bin/clang", "-dynamiclib", source, "-Wl,-install_name,@rpath/example.org/v1.2.3/lib/libprobe.dylib", "-o", dylib });
    try std.testing.expect(cc_lib.term == .exited and cc_lib.term.exited == 0);
    const cc_bin = try io_helper.childRun(a, &.{ "/usr/bin/clang", main_source, dylib, "-Wl,-rpath,@loader_path/../../../..", "-o", binary });
    try std.testing.expect(cc_bin.term == .exited and cc_bin.term.exited == 0);
    try fixDirectoryLibraryPaths(a, pkg);
    // Move it too: an absolute rewrite would start here but break after this.
    const moved = try std.fmt.allocPrint(a, "{s}/moved", .{root});
    try io_helper.rename(pkg, moved);
    const moved_binary = try std.fmt.allocPrint(a, "{s}/bin/probe", .{moved});
    const run = try io_helper.childRun(a, &.{moved_binary});
    try std.testing.expect(run.term == .exited and run.term.exited == 0);
    try std.testing.expectEqualStrings("42\n", run.stdout);
}
