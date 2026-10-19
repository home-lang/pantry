//! A pantry tree must keep working however it is reached and wherever it moves.
//!
//! Version aliases (`zlib.net/v1`), `.bin` symlinks and `.bin` forwarding
//! shims used to embed the absolute path the install was run through. A git
//! worktree whose `pantry` resolved to the main checkout's pantry ran
//! `pantry install` and rewrote ~250 of the main checkout's links to point at
//! `<worktree>/pantry/...`; deleting the worktree then broke git ("cannot
//! execute"), left `.bin/bun` dangling, and broke every dylib loaded through
//! `@rpath/zlib.net/v1/...`. These tests install through one path, take that
//! path away (delete the route, or move the tree), and require every link to
//! still resolve and every executable to still run.

const std = @import("std");
const builtin = @import("builtin");
const testing = std.testing;
const lib = @import("lib");
const io_helper = lib.io_helper;
const symlink = lib.install.symlink;
const helpers = lib.commands.install_commands.helpers;

const Fixture = struct {
    tmp: testing.TmpDir,
    buf: [std.fs.max_path_bytes]u8 = undefined,
    len: usize = 0,
    arena_state: std.heap.ArenaAllocator,

    fn init() !Fixture {
        var f = Fixture{ .tmp = testing.tmpDir(.{}), .arena_state = std.heap.ArenaAllocator.init(testing.allocator) };
        f.len = try f.tmp.dir.realPath(io_helper.io, &f.buf);
        return f;
    }
    fn deinit(self: *Fixture) void {
        self.arena_state.deinit();
        self.tmp.cleanup();
    }
    fn arena(self: *Fixture) std.mem.Allocator {
        return self.arena_state.allocator();
    }
    fn abs(self: *Fixture, sub_path: []const u8) []const u8 {
        return std.fmt.allocPrint(self.arena(), "{s}/{s}", .{ self.buf[0..self.len], sub_path }) catch @panic("oom");
    }
    /// `path` if absolute, else `abs(path)`.
    fn full(self: *Fixture, path: []const u8) []const u8 {
        return if (std.fs.path.isAbsolute(path)) path else self.abs(path);
    }
    fn mkdir(self: *Fixture, sub_path: []const u8) !void {
        try io_helper.makePath(self.abs(sub_path));
    }
    fn write(self: *Fixture, sub_path: []const u8, content: []const u8, executable: bool) !void {
        const path = self.full(sub_path);
        if (std.fs.path.dirname(path)) |dir| try io_helper.makePath(dir);
        const file = try io_helper.createFile(path, .{ .truncate = true });
        try io_helper.writeAllToFile(file, content);
        io_helper.closeFile(file);
        if (executable) chmod755(path);
    }
    /// An executable with no `#!`, classified like a Mach-O/ELF binary. (A copied system binary
    /// would do, but macOS kills a relocated platform binary.) `sh` runs a
    /// file the kernel rejects with ENOEXEC as a script, so it still runs.
    fn nativeBinary(self: *Fixture, sub_path: []const u8) !void {
        try self.write(sub_path, "echo \"$@\"\n", true);
    }
    /// A wrapper script that, like git's, finds its data through `$0`.
    fn wrapperScript(self: *Fixture, pkg_dir: []const u8, name: []const u8, message: []const u8) !void {
        const script = std.fmt.allocPrint(self.arena(), "{s}/bin/{s}", .{ pkg_dir, name }) catch unreachable;
        const data = std.fmt.allocPrint(self.arena(), "{s}/share/{s}.msg", .{ pkg_dir, name }) catch unreachable;
        const body = std.fmt.allocPrint(self.arena(), "#!/bin/sh\ncat \"$(dirname \"$0\")/../share/{s}.msg\"\n", .{name}) catch unreachable;
        try self.write(script, body, true);
        try self.write(data, message, false);
    }
    fn symlinkAt(self: *Fixture, target: []const u8, sub_path: []const u8) !void {
        try io_helper.symLink(target, self.abs(sub_path));
    }
    fn rename(self: *Fixture, from: []const u8, to: []const u8) !void {
        try io_helper.rename(self.abs(from), self.abs(to));
    }
    fn remove(self: *Fixture, sub_path: []const u8) !void {
        try io_helper.deleteFile(self.abs(sub_path));
    }

    /// The raw target stored in a link.
    fn linkTarget(self: *Fixture, sub_path: []const u8) ![]const u8 {
        return io_helper.readLinkAlloc(self.arena(), self.abs(sub_path));
    }

    fn expectLauncher(self: *Fixture, sub_path: []const u8, target: []const u8) !void {
        const content = try io_helper.readFileAlloc(self.arena(), self.abs(sub_path), 4096);
        const quoted = try std.fmt.allocPrint(self.arena(), "\"$d/{s}\"", .{target});
        try testing.expect(std.mem.indexOf(u8, content, quoted) != null);
        try testing.expect(std.mem.indexOf(u8, content, self.abs("")) == null);
    }

    /// The link at `sub_path` resolves, and to the same file as `want`.
    fn expectResolves(self: *Fixture, sub_path: []const u8, want: []const u8) !void {
        var got_buf: [std.fs.max_path_bytes]u8 = undefined;
        var want_buf: [std.fs.max_path_bytes]u8 = undefined;
        const got = realpath(self.abs(sub_path), &got_buf) orelse {
            std.debug.print("{s} does not resolve (-> {s})\n", .{ sub_path, self.linkTarget(sub_path) catch "?" });
            return error.LinkDoesNotResolve;
        };
        const expected = realpath(self.abs(want), &want_buf) orelse return error.ExpectedTargetMissing;
        try testing.expectEqualStrings(expected, got);
    }

    /// Runs `argv` (through `sh -c` so PATH lookups and `$0` behave as in a
    /// shell) and requires it to succeed printing `want`.
    fn expectRuns(self: *Fixture, script: []const u8, want: []const u8) !void {
        const result = try io_helper.childRunWithOptions(self.arena(), &.{ "/bin/sh", "-c", script }, .{ .cwd = self.buf[0..self.len] });
        if (result.term != .exited or result.term.exited != 0) {
            std.debug.print("`{s}` failed: {s}\n", .{ script, result.stderr });
            return error.CommandFailed;
        }
        try testing.expectEqualStrings(want, result.stdout);
    }
};

fn chmod755(path: []const u8) void {
    var z: [std.fs.max_path_bytes:0]u8 = undefined;
    @memcpy(z[0..path.len], path);
    z[path.len] = 0;
    _ = std.c.chmod(&z, 0o755);
}

fn realpath(path: []const u8, out: *[std.fs.max_path_bytes]u8) ?[]const u8 {
    var z: [std.fs.max_path_bytes:0]u8 = undefined;
    @memcpy(z[0..path.len], path);
    z[path.len] = 0;
    const r = std.c.realpath(&z, out) orelse return null;
    return std.mem.sliceTo(r, 0);
}

// ---------------------------------------------------------------------------
// Global layout: {base}/packages/<domain>/v<version>, {base}/bin
// ---------------------------------------------------------------------------

test "global tree: version alias, bin symlink and shim survive the tree moving" {
    if (builtin.os.tag == .windows) return error.SkipZigTest;
    var f = try Fixture.init();
    defer f.deinit();

    const pkg = "base/packages/example.org/v2.4.1";
    try f.nativeBinary(pkg ++ "/bin/hello");
    try f.wrapperScript(f.abs(pkg), "greet", "greet-ok\n");

    const base = f.abs("base");
    try symlink.createVersionSymlink(testing.allocator, "example.org", "2.4.1", "2", base);
    try symlink.createBinarySymlinkFromPath(testing.allocator, "hello", f.abs(pkg ++ "/bin/hello"), base);
    try symlink.createBinarySymlinkFromPath(testing.allocator, "greet", f.abs(pkg ++ "/bin/greet"), base);

    // The alias names its sibling, the bin link climbs out of bin/.
    try testing.expectEqualStrings("v2.4.1", try f.linkTarget("base/packages/example.org/v2"));
    try f.expectLauncher("base/bin/hello", "../packages/example.org/v2.4.1/bin/hello");

    try f.rename("base", "moved");

    try f.expectResolves("moved/packages/example.org/v2", "moved/packages/example.org/v2.4.1");
    try f.expectLauncher("moved/bin/hello", "../packages/example.org/v2.4.1/bin/hello");
    try f.expectRuns("moved/bin/hello relocated", "relocated\n");
    try f.expectRuns("moved/bin/greet", "greet-ok\n");
    try f.expectRuns("moved/packages/example.org/v2/bin/hello via-alias", "via-alias\n");
}

// ---------------------------------------------------------------------------
// Project layout: <project>/pantry/<domain>/v<version>, <project>/pantry/.bin
// ---------------------------------------------------------------------------

// The incident: a worktree whose `pantry` is a symlink to the main
// checkout's pantry installs through that symlink, then is deleted.
test "project tree installed through a worktree's symlinked pantry survives the worktree being deleted" {
    if (builtin.os.tag == .windows) return error.SkipZigTest;
    var f = try Fixture.init();
    defer f.deinit();

    try f.mkdir("main/pantry/.bin");
    try f.nativeBinary("main/pantry/git-scm.org/v2.53.0/bin/git");
    try f.nativeBinary("main/pantry/bun.sh/v1.3.14/bin/bun");
    try f.write("main/pantry/zlib.net/v1.3.2/lib/libz.dylib", "not really a dylib", false);

    // The worktree, sharing the main checkout's pantry.
    try f.mkdir("wt");
    try f.symlinkAt(f.abs("main/pantry"), "wt/pantry");

    // Install-time link writers, run through the worktree's path.
    try helpers.createBinSymlinksFromInstall(testing.allocator, f.abs("wt"), f.abs("wt/pantry/git-scm.org/v2.53.0"), "pantry");
    helpers.ensureBinSymlinks(testing.allocator, f.abs("wt"), "pantry");

    // Every link is written relative to the tree, never via the worktree.
    try f.expectLauncher("main/pantry/.bin/git", "../git-scm.org/v2.53.0/bin/git");
    try f.expectLauncher("main/pantry/.bin/bun", "../bun.sh/v1.3.14/bin/bun");
    try f.expectLauncher("main/pantry/.bin/bunx", "bun");
    try f.expectRuns("main/pantry/.bin/bunx --version", "x --version\n");

    // The worktree goes away.
    try f.remove("wt/pantry");
    try io_helper.deleteTree(f.abs("wt"));

    try f.expectLauncher("main/pantry/.bin/git", "../git-scm.org/v2.53.0/bin/git");
    try f.expectLauncher("main/pantry/.bin/bun", "../bun.sh/v1.3.14/bin/bun");
    try f.expectRuns("main/pantry/.bin/bunx after-removal", "x after-removal\n");
    try f.expectRuns("main/pantry/.bin/git still-works", "still-works\n");
    try f.expectRuns("main/pantry/.bin/bun ok", "ok\n");

    // And the whole checkout can move.
    try f.rename("main", "elsewhere");
    try f.expectRuns("elsewhere/pantry/.bin/git moved", "moved\n");
    try f.expectRuns("PATH=\"$PWD/elsewhere/pantry/.bin:$PATH\" bun on-path", "on-path\n");
}

test "a forwarding shim finds its target however it is invoked" {
    if (builtin.os.tag == .windows) return error.SkipZigTest;
    var f = try Fixture.init();
    defer f.deinit();

    const pkg = "proj/pantry/git-scm.org/v2.53.0";
    try f.wrapperScript(f.abs(pkg), "git", "git-ok\n");
    try f.mkdir("proj/pantry/.bin");

    try testing.expect(symlink.writeForwardingShim(
        testing.allocator,
        f.abs("proj/pantry/.bin/git"),
        f.abs(pkg ++ "/bin/git"),
        f.abs("proj/pantry"),
    ));

    // The shim names no absolute path, only one relative to itself.
    const shim = try io_helper.readFileAlloc(f.arena(), f.abs("proj/pantry/.bin/git"), 4096);
    try testing.expect(std.mem.indexOf(u8, shim, f.abs("")) == null);
    try testing.expect(std.mem.indexOf(u8, shim, "\"$d/../git-scm.org/v2.53.0/bin/git\"") != null);

    try f.rename("proj", "moved");
    try f.mkdir("links");
    try f.symlinkAt(f.abs("moved/pantry/.bin/git"), "links/abs-git");
    try f.symlinkAt("../moved/pantry/.bin/git", "links/rel-git");
    try f.mkdir("links/chain");
    try f.symlinkAt("../rel-git", "links/chain/git");

    try f.expectRuns("moved/pantry/.bin/git", "git-ok\n"); // relative path
    try f.expectRuns("\"$PWD/moved/pantry/.bin/git\"", "git-ok\n"); // absolute path
    try f.expectRuns("cd moved/pantry && .bin/git", "git-ok\n"); // from inside the tree
    try f.expectRuns("PATH=\"$PWD/moved/pantry/.bin:$PATH\" git", "git-ok\n"); // PATH lookup
    try f.expectRuns("PATH=\"moved/pantry/.bin:$PATH\" git", "git-ok\n"); // relative PATH entry
    try f.expectRuns("links/abs-git", "git-ok\n"); // via an absolute symlink
    try f.expectRuns("links/rel-git", "git-ok\n"); // via a relative symlink
    try f.expectRuns("links/chain/git", "git-ok\n"); // via a chain of symlinks
}

test "a link to a target outside the tree stays absolute" {
    if (builtin.os.tag == .windows) return error.SkipZigTest;
    var f = try Fixture.init();
    defer f.deinit();

    try f.nativeBinary("outside/bin/tool");
    try f.mkdir("proj/pantry/.bin");

    const target = try symlink.treeLinkTarget(testing.allocator, f.abs("proj/pantry"), f.abs("outside/bin/tool"), f.abs("proj/pantry/.bin/tool"));
    defer testing.allocator.free(target);
    try testing.expectEqualStrings(f.abs("outside/bin/tool"), target);

    // No tree at all: as given.
    const untreed = try symlink.treeLinkTarget(testing.allocator, null, f.abs("outside/bin/tool"), f.abs("proj/pantry/.bin/tool"));
    defer testing.allocator.free(untreed);
    try testing.expectEqualStrings(f.abs("outside/bin/tool"), untreed);
}

test "a link whose directory is itself a symlink out of the tree stays absolute" {
    if (builtin.os.tag == .windows) return error.SkipZigTest;
    var f = try Fixture.init();
    defer f.deinit();

    // `base/bin` is a symlink into a dotfiles dir: `../packages` from where
    // the link physically lives would miss, so the target must stay absolute.
    try f.nativeBinary("base/packages/example.org/v1.0.0/bin/tool");
    try f.mkdir("dotfiles/bin");
    try f.symlinkAt(f.abs("dotfiles/bin"), "base/bin");

    try symlink.createBinarySymlinkFromPath(testing.allocator, "tool", f.abs("base/packages/example.org/v1.0.0/bin/tool"), f.abs("base"));
    const shim = try io_helper.readFileAlloc(f.arena(), f.abs("dotfiles/bin/tool"), 4096);
    try testing.expect(std.mem.indexOf(u8, shim, f.abs("base/packages/example.org/v1.0.0/bin/tool")) != null);
    try f.expectRuns("base/bin/tool fine", "fine\n");
}

// ---------------------------------------------------------------------------
// Ownership checks read link targets back: they must understand relative ones
// ---------------------------------------------------------------------------

test "first-installed-wins and removal still recognise relative bin links" {
    if (builtin.os.tag == .windows) return error.SkipZigTest;
    var f = try Fixture.init();
    defer f.deinit();

    try f.nativeBinary("base/packages/first.org/v1.0.0/bin/tool");
    try f.nativeBinary("base/packages/second.org/v1.0.0/bin/tool");
    const base = f.abs("base");

    try symlink.createPackageSymlinks(testing.allocator, "first.org", "1.0.0", base);
    try f.expectLauncher("base/bin/tool", "../packages/first.org/v1.0.0/bin/tool");

    // A second provider of `tool` must not take the name.
    try symlink.createPackageSymlinks(testing.allocator, "second.org", "1.0.0", base);
    try f.expectLauncher("base/bin/tool", "../packages/first.org/v1.0.0/bin/tool");

    // Removing the second package leaves the first one's link alone...
    try symlink.removePackageSymlinks(testing.allocator, "second.org", "1.0.0", base);
    try f.expectRuns("base/bin/tool retained", "retained\n");

    // ...and removing the first removes it.
    try symlink.removePackageSymlinks(testing.allocator, "first.org", "1.0.0", base);
    try testing.expectError(error.ReadLinkError, f.linkTarget("base/bin/tool"));
}

test "a dangling bin link left by a vanished install path is replaced" {
    if (builtin.os.tag == .windows) return error.SkipZigTest;
    var f = try Fixture.init();
    defer f.deinit();

    // What the incident left behind: an absolute link into a deleted worktree.
    try f.nativeBinary("main/pantry/bun.sh/v1.3.14/bin/bun");
    try f.mkdir("main/pantry/.bin");
    try f.symlinkAt(f.abs("gone-worktree/pantry/bun.sh/v1.3.14/bin/bun"), "main/pantry/.bin/bun");

    try helpers.createBinSymlinksFromInstall(testing.allocator, f.abs("main"), f.abs("main/pantry/bun.sh/v1.3.14"), "pantry");
    try f.expectLauncher("main/pantry/.bin/bun", "../bun.sh/v1.3.14/bin/bun");
    try f.expectRuns("main/pantry/.bin/bun repaired", "repaired\n");
}

test "declared shell libraries preserve source semantics after relocation" {
    if (builtin.os.tag == .windows) return error.SkipZigTest;
    var f = try Fixture.init();
    defer f.deinit();
    const pkg = "base/packages/example.org/v1.0.0";
    try f.write(pkg ++ "/bin/library.sh", "#!/bin/sh\nfixture_function() { printf 'source-ok\\n'; }\n", true);
    try f.write(pkg ++ "/share/pantry/interfaces.json", "{\"version\":1,\"sourceablePrograms\":[\"library.sh\"]}\n", false);
    try testing.expect(!try symlink.requiresForwardingShim(testing.allocator, f.abs(pkg ++ "/bin/library.sh")));
    try symlink.createBinarySymlinkFromPath(testing.allocator, "library.sh", f.abs(pkg ++ "/bin/library.sh"), f.abs("base"));
    try testing.expectEqualStrings("../packages/example.org/v1.0.0/bin/library.sh", try f.linkTarget("base/bin/library.sh"));
    try f.expectRuns(". ./base/bin/library.sh; fixture_function; printf 'caller-alive\\n'", "source-ok\ncaller-alive\n");
    try f.rename("base", "moved");
    try f.expectRuns("PATH=\"$PWD/moved/bin:$PATH\"; . library.sh; fixture_function; printf 'caller-alive\\n'", "source-ok\ncaller-alive\n");
}

test "invalid source interface metadata preserves the previous binary link" {
    if (builtin.os.tag == .windows) return error.SkipZigTest;
    var f = try Fixture.init();
    defer f.deinit();
    const pkg = "base/packages/example.org/v1.0.0";
    try f.nativeBinary(pkg ++ "/bin/old");
    try symlink.createBinarySymlinkFromPath(testing.allocator, "library.sh", f.abs(pkg ++ "/bin/old"), f.abs("base"));
    const before = try io_helper.readFileAlloc(f.arena(), f.abs("base/bin/library.sh"), 4096);
    try f.write(pkg ++ "/bin/library.sh", "#!/bin/sh\nexit 0\n", true);
    try f.write(pkg ++ "/share/pantry/interfaces.json", "{\"version\":2,\"sourceablePrograms\":[\"library.sh\"]}\n", false);
    try testing.expectError(error.InvalidPackageInterface, symlink.createBinarySymlinkFromPath(testing.allocator, "library.sh", f.abs(pkg ++ "/bin/library.sh"), f.abs("base")));
    try testing.expectEqualStrings(before, try io_helper.readFileAlloc(f.arena(), f.abs("base/bin/library.sh"), 4096));
    try f.expectRuns("base/bin/library.sh retained", "retained\n");
}
