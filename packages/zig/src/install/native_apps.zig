//! Native desktop-app installation from pantry's OWN registry — no Homebrew.
//!
//! Desktop apps are pantry packages keyed by domain (ghostty.org, raycast.com,
//! 1password.com, ...). `downloader.lookupS3Registry(domain, "latest")` resolves
//! the per-platform artifact published to pantry's registry
//! (`binaries/<domain>/<version>/<platform>/<domain>-<version>.tar.gz`); we
//! download it with pantry's downloader, extract it with pantry's extractor,
//! and move the `.app` bundle(s) it contains into /Applications. Font packages
//! (when published the same way) drop their files into ~/Library/Fonts.
//!
//! Everything here uses pantry's registry + macOS's own `ditto`/`xattr`; there
//! is no dependency on Homebrew. macOS-only; App Store apps install natively via
//! CommerceKit (see install/mas.zig), not `mas`.

const std = @import("std");
const builtin = @import("builtin");
const io_helper = @import("../io_helper.zig");
const downloader = @import("downloader.zig");
const extractor = @import("extractor.zig");
const style = @import("../cli/style.zig");

pub const Outcome = enum { installed, failed, unsupported };

const DITTO = "/usr/bin/ditto";
const XATTR = "/usr/bin/xattr";
const RM = "/bin/rm";
const MKDIR = "/bin/mkdir";

/// Destination for installed apps. Overridable for tests/CI via env.
fn applicationsDir(allocator: std.mem.Allocator) []const u8 {
    if (io_helper.getEnvVarOwned(allocator, "PANTRY_APPS_DIR")) |v| {
        return v;
    } else |_| {}
    return allocator.dupe(u8, "/Applications") catch "/Applications";
}

fn exists(path: []const u8) bool {
    io_helper.accessAbsolute(path, .{}) catch return false;
    return true;
}

/// Run a command silently; true on exit 0.
fn run(allocator: std.mem.Allocator, argv: []const []const u8) bool {
    const res = io_helper.childRun(allocator, argv) catch return false;
    defer allocator.free(res.stdout);
    defer allocator.free(res.stderr);
    return switch (res.term) {
        .exited => |code| code == 0,
        else => false,
    };
}

fn endsWithIgnoreCase(s: []const u8, suffix: []const u8) bool {
    if (s.len < suffix.len) return false;
    return std.ascii.eqlIgnoreCase(s[s.len - suffix.len ..], suffix);
}

/// Replace any existing copy of `src_app` (a `.app` bundle) in the apps dir and
/// clear quarantine so it launches without a Gatekeeper prompt.
fn placeApp(allocator: std.mem.Allocator, apps_dir: []const u8, src_app: []const u8) bool {
    const name = std.fs.path.basename(src_app);
    const dst = std.fmt.allocPrint(allocator, "{s}/{s}", .{ apps_dir, name }) catch return false;
    defer allocator.free(dst);

    _ = run(allocator, &[_][]const u8{ MKDIR, "-p", apps_dir });
    _ = run(allocator, &[_][]const u8{ RM, "-rf", dst });
    if (!run(allocator, &[_][]const u8{ DITTO, src_app, dst })) return false;
    _ = run(allocator, &[_][]const u8{ XATTR, "-dr", "com.apple.quarantine", dst });
    return exists(dst);
}

/// Find `.app` bundles under `dir` (without descending into a bundle) up to a
/// shallow depth, installing each into `apps_dir`. Returns count installed.
fn installAppsFromTree(allocator: std.mem.Allocator, dir: []const u8, apps_dir: []const u8, depth: u8) usize {
    var d = io_helper.openDirForIteration(dir) catch return 0;
    defer d.close();
    var it = d.iterate();
    var count: usize = 0;
    while (it.next() catch null) |entry| {
        if (entry.kind != .directory) continue;
        const child = std.fmt.allocPrint(allocator, "{s}/{s}", .{ dir, entry.name }) catch continue;
        defer allocator.free(child);
        if (endsWithIgnoreCase(entry.name, ".app")) {
            if (placeApp(allocator, apps_dir, child)) count += 1;
        } else if (depth > 0) {
            count += installAppsFromTree(allocator, child, apps_dir, depth - 1);
        }
    }
    return count;
}

fn isFontFile(name: []const u8) bool {
    return endsWithIgnoreCase(name, ".ttf") or
        endsWithIgnoreCase(name, ".otf") or
        endsWithIgnoreCase(name, ".ttc");
}

/// Recursively copy font files under `dir` into `fonts_dir`. Returns count.
fn copyFontsRec(allocator: std.mem.Allocator, dir: []const u8, fonts_dir: []const u8, depth: u8) usize {
    var d = io_helper.openDirForIteration(dir) catch return 0;
    defer d.close();
    var it = d.iterate();
    var count: usize = 0;
    while (it.next() catch null) |entry| {
        const child = std.fmt.allocPrint(allocator, "{s}/{s}", .{ dir, entry.name }) catch continue;
        defer allocator.free(child);
        if (entry.kind == .directory) {
            if (depth > 0) count += copyFontsRec(allocator, child, fonts_dir, depth - 1);
        } else if (entry.kind == .file and isFontFile(entry.name)) {
            const dst = std.fmt.allocPrint(allocator, "{s}/{s}", .{ fonts_dir, entry.name }) catch continue;
            defer allocator.free(dst);
            if (run(allocator, &[_][]const u8{ DITTO, child, dst })) count += 1;
        }
    }
    return count;
}

/// Copy any font files under `tree` into ~/Library/Fonts. Returns count copied.
fn installFontsFromTree(allocator: std.mem.Allocator, tree: []const u8) usize {
    const home = io_helper.getEnvVarOwned(allocator, "HOME") catch return 0;
    defer allocator.free(home);
    const fonts_dir = std.fmt.allocPrint(allocator, "{s}/Library/Fonts", .{home}) catch return 0;
    defer allocator.free(fonts_dir);
    _ = run(allocator, &[_][]const u8{ MKDIR, "-p", fonts_dir });
    return copyFontsRec(allocator, tree, fonts_dir, 4);
}

/// Install a desktop app (or font) package by its pantry domain. Returns
/// `.failed` when the domain isn't published for this platform (the caller logs
/// it); never touches Homebrew.
pub fn install(allocator: std.mem.Allocator, domain: []const u8, quiet: bool) Outcome {
    if (builtin.os.tag != .macos) return .unsupported;

    // Resolve via pantry's own binary registry (binaries/<domain>/metadata.json).
    const resolved = (downloader.lookupS3Registry(allocator, domain, "latest") catch |err| {
        style.print("  Registry lookup failed for {s}: {s}\n", .{ domain, @errorName(err) });
        return .failed;
    }) orelse return .failed;
    defer allocator.free(resolved.tarball_url);
    defer allocator.free(resolved.version);

    // Stage under a unique temp dir we clean up afterward.
    const tmp_base = io_helper.getEnvVarOwned(allocator, "TMPDIR") catch (allocator.dupe(u8, "/tmp") catch return .failed);
    defer allocator.free(tmp_base);
    var slug_buf: [256]u8 = undefined;
    var slen: usize = 0;
    for (domain) |c| {
        if (slen >= slug_buf.len) break;
        slug_buf[slen] = if (c == '/' or c == '@' or c == ' ') '-' else c;
        slen += 1;
    }
    const work = std.fmt.allocPrint(allocator, "{s}/pantry-app-{s}", .{ std.mem.trimEnd(u8, tmp_base, "/"), slug_buf[0..slen] }) catch return .failed;
    defer allocator.free(work);
    _ = run(allocator, &[_][]const u8{ RM, "-rf", work });
    _ = run(allocator, &[_][]const u8{ MKDIR, "-p", work });
    defer {
        _ = run(allocator, &[_][]const u8{ RM, "-rf", work });
    }

    const archive = std.fmt.allocPrint(allocator, "{s}/pkg.tar.gz", .{work}) catch return .failed;
    defer allocator.free(archive);
    downloader.downloadFileQuiet(allocator, resolved.tarball_url, archive, quiet) catch return .failed;

    const extract = std.fmt.allocPrint(allocator, "{s}/x", .{work}) catch return .failed;
    defer allocator.free(extract);
    extractor.extractArchiveQuiet(allocator, archive, extract, "tar.gz", quiet) catch return .failed;

    const apps_dir = applicationsDir(allocator);
    defer allocator.free(apps_dir);

    if (installAppsFromTree(allocator, extract, apps_dir, 3) > 0) return .installed;
    if (installFontsFromTree(allocator, extract) > 0) return .installed;

    if (!quiet)
        style.printForced("    (no .app or fonts found in {s} artifact)\n", .{domain});
    return .failed;
}

// ── Tests ────────────────────────────────────────────────────────────────────

test "endsWithIgnoreCase" {
    try std.testing.expect(endsWithIgnoreCase("Ghostty.APP", ".app"));
    try std.testing.expect(endsWithIgnoreCase("Inter.ttf", ".ttf"));
    try std.testing.expect(!endsWithIgnoreCase("foo", ".app"));
}

test "installAppsFromTree finds and installs nested .app into a dest dir" {
    const a = std.testing.allocator;
    const tmp = "/tmp/pantry-native-apps-test";
    const dest = "/tmp/pantry-native-apps-dest";
    _ = run(a, &[_][]const u8{ RM, "-rf", tmp, dest });
    defer _ = run(a, &[_][]const u8{ RM, "-rf", tmp, dest });
    // Build a fake artifact tree: tmp/payload/Demo.app/Contents/MacOS/demo
    _ = run(a, &[_][]const u8{ MKDIR, "-p", tmp ++ "/payload/Demo.app/Contents/MacOS" });
    {
        const f = io_helper.createFileAbsolute(tmp ++ "/payload/Demo.app/Contents/MacOS/demo", .{ .truncate = true }) catch unreachable;
        io_helper.closeFile(f);
    }
    _ = run(a, &[_][]const u8{ MKDIR, "-p", dest });

    const installed = installAppsFromTree(a, tmp, dest, 3);
    try std.testing.expectEqual(@as(usize, 1), installed);
    try std.testing.expect(exists(dest ++ "/Demo.app"));
}
