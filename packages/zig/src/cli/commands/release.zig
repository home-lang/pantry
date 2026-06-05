//! Release Command — bump version, generate changelog, commit, tag, push.
//!
//! Wraps the `bump` CLI (from zig-bump) and `changelog` CLI (from zig-changelog)
//! into a single `pantry release <type>` command.
//!
//! Flow:
//!   1. Generate changelog via `changelog` (if available)
//!   2. Bump version via `bump <type>` (commits, tags, pushes)
//!   → GitHub Action triggers → creates release → publishes to registry

const std = @import("std");
const io_helper = @import("../../io_helper.zig");
const style = @import("../style.zig");

pub const CommandResult = @import("common.zig").CommandResult;

pub const ReleaseOptions = struct {
    /// Release type: patch, minor, major, premajor, preminor, prepatch, prerelease, or exact version
    release_type: []const u8 = "patch",
    /// Prerelease identifier (alpha, beta, rc)
    preid: ?[]const u8 = null,
    /// Skip confirmation prompts
    yes: bool = false,
    /// Dry run — show what would happen without applying
    dry_run: bool = false,
    /// Skip changelog generation
    no_changelog: bool = false,
    /// Skip git push
    no_push: bool = false,
    /// Custom tag name pattern (default: v{version})
    tag_name: ?[]const u8 = null,
};

/// Find a binary in PATH or pantry's bin directories.
/// Caller owns the returned slice and must free it with `allocator`.
fn findBinary(allocator: std.mem.Allocator, name: []const u8) ?[]const u8 {
    // Check pantry bin dirs first
    const home = io_helper.getenv("HOME") orelse return null;
    const pantry_bin_paths = [_][]const u8{
        "pantry/.bin",
        ".pantry/bin",
    };

    for (pantry_bin_paths) |rel| {
        const full = std.fmt.allocPrint(allocator, "{s}/{s}/{s}", .{ home, rel, name }) catch continue;
        io_helper.accessAbsolute(full, .{}) catch {
            allocator.free(full);
            continue;
        };
        return full;
    }

    // Check CWD pantry/.bin
    const cwd_bin = std.fmt.allocPrint(allocator, "pantry/.bin/{s}", .{name}) catch return null;
    io_helper.accessAbsolute(cwd_bin, .{}) catch {
        allocator.free(cwd_bin);
        // Fall back to PATH lookup via `which`
        return findBinaryInPath(allocator, name);
    };
    return cwd_bin;
}

/// Look up a binary on PATH. Delegates to io_helper.findExecutable, which walks
/// $PATH using libc access(X_OK) — robust across shells (the previous `which`
/// subprocess approach failed because `which` is a shell builtin in some
/// environments, so `bump` couldn't be located even when it was on PATH).
fn findBinaryInPath(allocator: std.mem.Allocator, name: []const u8) ?[]const u8 {
    return (io_helper.findExecutable(allocator, name) catch return null) orelse null;
}

/// Run a git command, returning trimmed stdout (caller owns). Returns null on failure.
fn gitCapture(allocator: std.mem.Allocator, args: []const []const u8) ?[]const u8 {
    const result = io_helper.childRun(allocator, args) catch return null;
    defer allocator.free(result.stderr);
    if (!(result.term == .exited and result.term.exited == 0)) {
        allocator.free(result.stdout);
        return null;
    }
    var end = result.stdout.len;
    while (end > 0 and (result.stdout[end - 1] == '\n' or result.stdout[end - 1] == '\r' or result.stdout[end - 1] == ' ')) {
        end -= 1;
    }
    const out = allocator.dupe(u8, result.stdout[0..end]) catch {
        allocator.free(result.stdout);
        return null;
    };
    allocator.free(result.stdout);
    return out;
}

const SemVer = struct {
    major: u64 = 0,
    minor: u64 = 0,
    patch: u64 = 0,

    /// Parse a semver core (major.minor.patch), ignoring any leading 'v' and
    /// any prerelease/build suffix after the patch number. Returns null if it
    /// doesn't look like a version at all.
    fn parse(s: []const u8) ?SemVer {
        var str = s;
        if (str.len > 0 and (str[0] == 'v' or str[0] == 'V')) str = str[1..];
        var parts: [3]u64 = .{ 0, 0, 0 };
        var idx: usize = 0;
        var num_start: usize = 0;
        var i: usize = 0;
        var saw_digit = false;
        while (i <= str.len) : (i += 1) {
            const at_end = i == str.len;
            const c = if (at_end) '.' else str[i];
            if (c == '.' or c == '-' or c == '+') {
                if (idx < 3) {
                    const seg = str[num_start..i];
                    if (seg.len == 0) return null;
                    parts[idx] = std.fmt.parseInt(u64, seg, 10) catch return null;
                    idx += 1;
                }
                if (c == '-' or c == '+') break;
                num_start = i + 1;
            } else if (c >= '0' and c <= '9') {
                saw_digit = true;
            } else {
                return null;
            }
        }
        if (!saw_digit) return null;
        return .{ .major = parts[0], .minor = parts[1], .patch = parts[2] };
    }

    /// Returns true if `self` is strictly greater than `other`.
    fn greaterThan(self: SemVer, other: SemVer) bool {
        if (self.major != other.major) return self.major > other.major;
        if (self.minor != other.minor) return self.minor > other.minor;
        return self.patch > other.patch;
    }
};

/// Read the `.version = "x.y.z"` value from build.zig.zon in CWD.
/// Caller owns the returned slice.
fn readZonVersion(allocator: std.mem.Allocator) ?[]const u8 {
    const content = io_helper.readFileAlloc(allocator, "build.zig.zon", 1 << 20) catch return null;
    defer allocator.free(content);
    const key = ".version";
    const key_pos = std.mem.indexOf(u8, content, key) orelse return null;
    var i = key_pos + key.len;
    // skip to opening quote
    while (i < content.len and content[i] != '"') : (i += 1) {
        if (content[i] == '\n') return null;
    }
    if (i >= content.len) return null;
    i += 1; // past opening quote
    const start = i;
    while (i < content.len and content[i] != '"') : (i += 1) {}
    if (i >= content.len) return null;
    return allocator.dupe(u8, content[start..i]) catch return null;
}

/// Rewrite the `.version = "..."` value in build.zig.zon in CWD to `new_version`.
/// Returns true on success. Used to sync the zon up to the latest tag before a
/// bump (zig-bump only accepts patch/minor/major, not an explicit version, so we
/// must do the sync ourselves).
fn writeZonVersion(allocator: std.mem.Allocator, new_version: []const u8) bool {
    const content = io_helper.readFileAlloc(allocator, "build.zig.zon", 1 << 20) catch return false;
    defer allocator.free(content);
    const key = ".version";
    const key_pos = std.mem.indexOf(u8, content, key) orelse return false;
    var i = key_pos + key.len;
    while (i < content.len and content[i] != '"') : (i += 1) {
        if (content[i] == '\n') return false;
    }
    if (i >= content.len) return false;
    const val_start = i + 1; // first char inside quotes
    var j = val_start;
    while (j < content.len and content[j] != '"') : (j += 1) {}
    if (j >= content.len) return false;

    const out = std.fmt.allocPrint(allocator, "{s}{s}{s}", .{
        content[0..val_start], new_version, content[j..],
    }) catch return false;
    defer allocator.free(out);

    const file = io_helper.createFile("build.zig.zon", .{}) catch return false;
    defer io_helper.closeFile(file);
    io_helper.writeAllToFile(file, out) catch return false;
    return true;
}

/// Find the highest git tag that parses as a semver (vX.Y.Z). Returns the
/// parsed SemVer, or null if there are no version tags.
fn latestTagVersion(allocator: std.mem.Allocator) ?SemVer {
    const out = gitCapture(allocator, &.{ "git", "tag", "--list", "v*" }) orelse return null;
    defer allocator.free(out);
    var best: ?SemVer = null;
    var it = std.mem.splitScalar(u8, out, '\n');
    while (it.next()) |line| {
        const trimmed = std.mem.trim(u8, line, " \t\r");
        if (trimmed.len == 0) continue;
        const v = SemVer.parse(trimmed) orelse continue;
        if (best == null or v.greaterThan(best.?)) best = v;
    }
    return best;
}

/// Reconcile build.zig.zon version with the latest git tag. zig-bump increments
/// from the zon version and ignores git tags entirely, so if the zon version has
/// drifted *behind* the latest published tag, a `patch` bump would produce a
/// version that's already tagged (a clash) or non-monotonic. To keep releases
/// monotonic across every repo, we sync the zon up to the latest tag's version
/// before bumping, so the increment always lands above the highest existing tag.
fn reconcileVersionDrift(allocator: std.mem.Allocator) void {
    const zon_str = readZonVersion(allocator) orelse return;
    defer allocator.free(zon_str);
    const zon_ver = SemVer.parse(zon_str) orelse return;
    const tag_ver = latestTagVersion(allocator) orelse return;

    if (!tag_ver.greaterThan(zon_ver)) return; // zon is at or ahead of tags — nothing to do

    const synced = std.fmt.allocPrint(allocator, "{d}.{d}.{d}", .{ tag_ver.major, tag_ver.minor, tag_ver.patch }) catch return;
    defer allocator.free(synced);

    style.print(
        "{s}>{s} build.zig.zon version ({s}{s}{s}) is behind latest tag ({s}v{s}{s}); syncing zon to {s}v{s}{s} before bump\n",
        .{
            style.dim,    style.reset, style.yellow,     zon_str, style.reset,
            style.yellow, synced,      style.reset,      style.green_bold,
            synced,       style.reset,
        },
    );

    // zig-bump only accepts patch/minor/major (not an explicit version), and it
    // ignores git tags — so we rewrite the zon ourselves to the latest tag. The
    // subsequent `bump <type>` then increments from there, landing above every
    // existing tag. (Not committed here; the bump commit picks it up.)
    if (!writeZonVersion(allocator, synced)) {
        style.print("  {s}(could not rewrite build.zig.zon — proceeding with bump from {s}){s}\n", .{ style.yellow, zon_str, style.reset });
    }
}

/// Verify the working tree is clean so `bump` only commits the version/changelog
/// changes it makes — not unrelated staged or modified files. Returns true if clean.
fn workingTreeClean(allocator: std.mem.Allocator) bool {
    const out = gitCapture(allocator, &.{ "git", "status", "--porcelain" }) orelse return true;
    defer allocator.free(out);
    // Allow CHANGELOG.md to be dirty — release regenerates it anyway.
    var it = std.mem.splitScalar(u8, out, '\n');
    while (it.next()) |line| {
        const trimmed = std.mem.trim(u8, line, " \t\r");
        if (trimmed.len == 0) continue;
        if (std.mem.endsWith(u8, trimmed, "CHANGELOG.md")) continue;
        return false;
    }
    return true;
}

pub fn releaseCommand(allocator: std.mem.Allocator, options: ReleaseOptions) !CommandResult {
    // Find the bump binary
    const bump_path = findBinary(allocator, "bump") orelse {
        style.print("{s}error:{s} `bump` binary not found.\n", .{ style.red, style.reset });
        style.print("\nInstall it with:\n", .{});
        style.print("  {s}pantry install zig-bump{s}\n\n", .{ style.green_bold, style.reset });
        return .{ .exit_code = 1, .message = null };
    };
    defer allocator.free(bump_path);

    // Guard: refuse to release from a dirty tree (would sweep unrelated changes
    // into the `chore: release` commit). Skipped for dry-run.
    if (!options.dry_run and !workingTreeClean(allocator)) {
        style.print("{s}error:{s} working tree is not clean.\n", .{ style.red, style.reset });
        style.print("  Commit or stash your changes before releasing.\n", .{});
        return .{ .exit_code = 1, .message = null };
    }

    // Reconcile version drift (zon behind latest git tag) so the bump is always
    // monotonic and never clashes with an existing tag. Skipped for dry-run.
    if (!options.dry_run) {
        reconcileVersionDrift(allocator);
    }

    // Step 1: Generate changelog (if changelog binary is available and not skipped)
    if (!options.no_changelog) {
        generateChangelog(allocator);
    }

    // Step 2: Build bump command args (fixed buffer, max 16 args)
    var argv_buf: [16][]const u8 = undefined;
    var argc: usize = 0;

    argv_buf[argc] = bump_path;
    argc += 1;
    argv_buf[argc] = options.release_type;
    argc += 1;
    argv_buf[argc] = "--changelog";
    argc += 1;

    if (options.yes or style.isCI()) {
        argv_buf[argc] = if (style.isCI()) "--ci" else "--yes";
        argc += 1;
    }
    if (options.dry_run) {
        argv_buf[argc] = "--dry-run";
        argc += 1;
    }
    if (options.no_push) {
        argv_buf[argc] = "--no-push";
        argc += 1;
    }
    if (options.preid) |preid| {
        argv_buf[argc] = "--preid";
        argc += 1;
        argv_buf[argc] = preid;
        argc += 1;
    }
    if (options.tag_name) |tag| {
        argv_buf[argc] = "--tag-name";
        argc += 1;
        argv_buf[argc] = tag;
        argc += 1;
    }

    style.print("{s}>{s} bumping version ({s}{s}{s})...\n", .{
        style.dim,        style.reset,
        style.green_bold, options.release_type,
        style.reset,
    });

    // Run bump
    const result = io_helper.childRun(allocator, argv_buf[0..argc]) catch {
        return CommandResult.err(allocator, "Failed to run bump command");
    };
    defer allocator.free(result.stdout);
    defer allocator.free(result.stderr);

    // Print bump output
    if (result.stdout.len > 0) {
        style.print("{s}", .{result.stdout});
    }
    if (result.stderr.len > 0 and !(result.term == .exited and result.term.exited == 0)) {
        style.print("{s}", .{result.stderr});
    }

    if (result.term == .exited and result.term.exited == 0) {
        if (!options.dry_run) {
            style.print("\n{s}{s}{s} release complete\n", .{ style.green, style.check, style.reset });
            if (!options.no_push) {
                style.print("  {s}GitHub Action will create the release and publish to the registry{s}\n", .{ style.dim, style.reset });
            }
        }
        return .{ .exit_code = 0, .message = null };
    }

    return .{ .exit_code = 1, .message = try allocator.dupe(u8, "Release failed") };
}

fn generateChangelog(allocator: std.mem.Allocator) void {
    const changelog_path = findBinary(allocator, "changelog") orelse return;
    defer allocator.free(changelog_path);

    style.print("{s}>{s} generating changelog...\n", .{ style.dim, style.reset });

    const cl_result = io_helper.childRun(allocator, &.{ changelog_path, "-o", "CHANGELOG.md" }) catch {
        style.print("  {s}(changelog generation skipped — command failed){s}\n", .{ style.dim, style.reset });
        return;
    };
    defer allocator.free(cl_result.stdout);
    defer allocator.free(cl_result.stderr);

    if (cl_result.term == .exited and cl_result.term.exited == 0) {
        style.print("  {s}CHANGELOG.md updated{s}\n", .{ style.green, style.reset });
    } else {
        style.print("  {s}(changelog generation skipped){s}\n", .{ style.dim, style.reset });
    }
}
