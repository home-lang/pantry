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

/// Look up a binary via the system `which` command.
fn findBinaryInPath(allocator: std.mem.Allocator, name: []const u8) ?[]const u8 {
    const result = io_helper.childRun(allocator, &.{ "which", name }) catch return null;
    defer allocator.free(result.stdout);
    defer allocator.free(result.stderr);

    if (result.term == .exited and result.term.exited == 0 and result.stdout.len > 0) {
        // Trim trailing whitespace
        var end = result.stdout.len;
        while (end > 0 and (result.stdout[end - 1] == '\n' or result.stdout[end - 1] == '\r' or result.stdout[end - 1] == ' ')) {
            end -= 1;
        }
        return allocator.dupe(u8, result.stdout[0..end]) catch return null;
    }
    return null;
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
