//! Centralized CLI Output Styling
//!
//! Provides consistent colors, symbols, and formatting helpers for all CLI output.
//! All user-facing output should go through this module to ensure:
//! - Output goes to stdout (not stderr via std.debug.print)
//! - Consistent color and symbol usage across all commands
//! - Bun-like clean, minimal aesthetic

const std = @import("std");
const io_helper = @import("../io_helper.zig");

// ── Colors ──────────────────────────────────────────────────────────────────

pub const green = "\x1b[32m";
pub const red = "\x1b[31m";
pub const yellow = "\x1b[33m";
pub const blue = "\x1b[34m";
pub const cyan = "\x1b[36m";
pub const dim = "\x1b[2m";
pub const bold = "\x1b[1m";
pub const italic = "\x1b[3m";
pub const dim_italic = "\x1b[2;3m";
pub const reset = "\x1b[0m";

// ── Symbols (Bun-style: + for added, - for removed) ────────────────────────

pub const plus = "+";
pub const minus = "-";
pub const warn = "!";
pub const arrow = ">";
pub const check = "done";
pub const info = "i";
pub const link_sym = "~";

// ── Core Output ─────────────────────────────────────────────────────────────

/// Print to stdout (user-facing output). Thread-safe via write() syscall.
pub fn print(comptime fmt: []const u8, args: anytype) void {
    var buf: [8192]u8 = undefined;
    const msg = std.fmt.bufPrint(&buf, fmt, args) catch {
        // Fallback for messages that exceed buffer
        std.debug.print(fmt, args);
        return;
    };
    const stdout = io_helper.File.stdout();
    io_helper.writeAllToFile(stdout, msg) catch {
        // Last resort: try stderr
        std.debug.print(fmt, args);
    };
}

/// Clear the current line (carriage return + erase to end)
pub fn clearLine() void {
    print("\r\x1b[K", .{});
}

/// Move cursor up N lines
pub fn moveUp(n: usize) void {
    if (n > 0) print("\x1b[{d}A", .{n});
}

/// Move cursor down N lines
pub fn moveDown(n: usize) void {
    if (n > 0) print("\x1b[{d}B", .{n});
}

// ── Package Formatting ──────────────────────────────────────────────────────

/// Print a successfully installed package: + bold(name)@dim(version)
pub fn printInstalled(name: []const u8, version: []const u8) void {
    print("{s}{s}{s} {s}{s}{s}{s}@{s}{s}\n", .{
        green, plus,  reset,
        bold,  name,  reset,
        dim,   version, reset,
    });
}

/// Print a successfully linked package: + bold(name)@dim(version) dim((linked))
pub fn printLinked(name: []const u8, version: []const u8) void {
    print("{s}{s}{s} {s}{s}{s}{s}@{s} {s}(linked){s}\n", .{
        green,  plus,    reset,
        bold,   name,    reset,
        dim,    version,
        dim,    reset,
    });
}

/// Print a failed package: - bold(name)@dim(version) dim((reason))
pub fn printFailed(name: []const u8, version: []const u8, reason: ?[]const u8) void {
    print("{s}{s}{s} {s}{s}{s}{s}@{s}", .{
        red,  minus, reset,
        bold, name,  reset,
        dim,  version,
    });
    if (reason) |msg| {
        print(" {s}({s}){s}\n", .{ dim, msg, reset });
    } else {
        print("\n", .{});
    }
}

/// Print a warning for a package: ! bold(name)@dim(version) dim((reason))
pub fn printWarning(name: []const u8, version: []const u8, reason: []const u8) void {
    print("{s}{s}{s} {s}{s}{s}{s}@{s} {s}({s}){s}\n", .{
        yellow, warn,    reset,
        bold,   name,    reset,
        dim,    version,
        dim,    reason,  reset,
    });
}

// ── Headers & Summaries ─────────────────────────────────────────────────────

/// Print the command header: "pantry install v0.x.x (hash)"
pub fn printHeader(command: []const u8, version: []const u8, hash: []const u8) void {
    print("\n{s}pantry {s}{s} {s}v{s} ({s}){s}\n\n", .{
        bold, command, reset,
        dim,  version, hash, reset,
    });
}

/// Print the "all up to date" summary
pub fn printUpToDate(pkg_count: usize, elapsed_ms: f64) void {
    print("{s}Checked {s}{d}{s} installs across {s}{d}{s} packages {s}(no changes){s} {s}[{s}{d:.2}ms{s}]{s}\n", .{
        reset, green, pkg_count, reset,
        green, pkg_count, reset,
        dim,   reset,
        dim,   bold, elapsed_ms, reset, reset,
    });
}

/// Print the install summary line: "N packages installed [Xms]"
pub fn printSummary(success_count: usize, total_count: usize, elapsed_ms: f64) void {
    print("{s}{d}{s} packages installed across {s}{d}{s} packages {s}[{s}{d:.2}ms{s}]{s}\n", .{
        green,  success_count, reset,
        green,  total_count,   reset,
        dim,    bold, elapsed_ms, reset, reset,
    });
}

/// Print checked summary (no changes)
pub fn printCheckedSummary(success_count: usize, total_count: usize, elapsed_ms: f64) void {
    print("Checked {s}{d}{s} installs across {s}{d}{s} packages {s}(no changes){s} {s}[{s}{d:.2}ms{s}]{s}\n", .{
        green, success_count, reset,
        green, total_count,   reset,
        dim,   reset,
        dim,   bold, elapsed_ms, reset, reset,
    });
}

/// Print failure count
pub fn printFailureCount(count: usize) void {
    print("\n{s}{d} package(s) failed to install{s}\n", .{ red, count, reset });
}

// ── Progress ────────────────────────────────────────────────────────────────

/// Spinner frames (simple rotating chars)
const spinner_frames = [_][]const u8{ "⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏" };

/// Print a single-line spinner with package name and progress counter.
/// Overwrites the current line each call.
pub fn printProgress(current: usize, total: usize, pkg_name: []const u8, frame: usize) void {
    const spinner = spinner_frames[frame % spinner_frames.len];
    print("\r\x1b[K{s}{s}{s} {s}{s}{s} {s}[{d}/{d}]{s}", .{
        cyan, spinner, reset,
        bold, pkg_name, reset,
        dim,  current, total, reset,
    });
}

/// Clear the progress line and print a final newline
pub fn clearProgress() void {
    clearLine();
}

// ── Indicators ──────────────────────────────────────────────────────────────

/// Print "Saving lockfile..." indicator
pub fn printLockfileSaving() void {
    print("{s}Saving lockfile...{s}", .{ dim, reset });
}

/// Clear saving indicator and print done
pub fn printLockfileSaved() void {
    clearLine();
}

/// Print installing message
pub fn printInstalling(count: usize) void {
    print("{s}{s}{s} Installing {d} package(s)...\n", .{ green, arrow, reset, count });
}

/// Print resume message
pub fn printResuming(count: usize) void {
    print("{s}  > Resuming from previous interrupted install ({d} packages already done){s}\n", .{
        dim, count, reset,
    });
}

/// Print skip message
pub fn printSkipping(skipped: usize, remaining: usize) void {
    print("{s}  > {d} package(s) already up to date, installing {d} remaining...{s}\n", .{
        dim, skipped, remaining, reset,
    });
}

/// Print offline mode message
pub fn printOffline() void {
    print("{s}Offline mode enabled - using cache only{s}\n", .{ dim, reset });
}

/// Print a generic warning line
pub fn printWarn(comptime fmt: []const u8, args: anytype) void {
    print("{s}{s}{s} ", .{ yellow, warn, reset });
    print(fmt, args);
}

/// Print a generic error line
pub fn printError(comptime fmt: []const u8, args: anytype) void {
    print("{s}error{s}: ", .{ red, reset });
    print(fmt, args);
}

/// Print a generic info line (dim)
pub fn printInfo(comptime fmt: []const u8, args: anytype) void {
    print("{s}", .{dim});
    print(fmt, args);
    print("{s}", .{reset});
}

// ── Workspace ───────────────────────────────────────────────────────────────

/// Print workspace header
pub fn printWorkspaceHeader(name: []const u8) void {
    print("{s}Workspace:{s} {s}\n", .{ blue, reset, name });
}

/// Print workspace member count
pub fn printWorkspaceMembers(count: usize) void {
    print("{s}   Found {d} workspace member(s)\n\n", .{ dim, count });
}

/// Print workspace member name
pub fn printWorkspaceMember(name: []const u8) void {
    print("{s}  {s}{s}\n", .{ dim, name, reset });
}

/// Print workspace member dependency count
pub fn printWorkspaceMemberDeps(count: usize) void {
    print("{s}   > {d} dependencies\n", .{ dim, count });
}

/// Print workspace member with no dependencies
pub fn printWorkspaceMemberNoDeps() void {
    print("{s}   > No dependencies\n", .{dim});
}

/// Print workspace linked count
pub fn printWorkspaceLinked(count: usize) void {
    print("{s}Linked {d} workspace package(s){s}\n", .{ blue, count, reset });
}

/// Print workspace complete summary
pub fn printWorkspaceComplete(success: usize, failed: usize) void {
    print("\n{s}{s}{s} Workspace setup complete! Installed {d} package(s)", .{
        green, check, reset, success,
    });
    if (failed > 0) {
        print(", {s}{d} failed{s}", .{ red, failed, reset });
    }
    print("\n", .{});
}

// ── Global ──────────────────────────────────────────────────────────────────

/// Print global install result (success)
pub fn printGlobalInstalled(name: []const u8, version: []const u8, from_cache: bool, time_ms: u64) void {
    print("  {s}{s}{s} {s}{s}{s}{s}@{s}", .{
        green, plus,  reset,
        bold,  name,  reset,
        dim,   version,
    });
    print(" {s}({s}, {d}ms){s}\n", .{
        dim,
        if (from_cache) "cached" else "installed",
        time_ms,
        reset,
    });
}

/// Print global install complete
pub fn printGlobalComplete(dir: []const u8) void {
    print("\n{s}{s}{s} Packages installed to: {s}\n", .{ green, check, reset, dir });
}

// ── Download Progress ───────────────────────────────────────────────────────

/// Print download progress (standard mode - overwrites same line)
pub fn printDownloadProgress(current_str: []const u8, total_str: ?[]const u8, speed_str: ?[]const u8, first_line: bool) void {
    if (first_line) {
        print("\n", .{});
    }
    print("\r{s}  ", .{dim_italic});
    print("{s}", .{current_str});
    if (total_str) |ts| {
        print(" / {s}", .{ts});
    }
    if (speed_str) |ss| {
        print(" ({s})", .{ss});
    }
    print("{s}", .{reset});
}

/// Print invalid URL error
pub fn printInvalidUrl(url: []const u8) void {
    print("{s}{s}{s} Invalid URL: {s}\n", .{ red, minus, reset, url });
}

/// Print checksum verification
pub fn printChecksum(verifying: bool) void {
    if (verifying) {
        print("\n  Verifying checksum...", .{});
    } else {
        print(" {s}{s}{s}\n", .{ green, check, reset });
    }
}

/// Print checksum mismatch
pub fn printChecksumMismatch(expected: []const u8, got: []const u8) void {
    print("  {s}{s}{s} Checksum mismatch:\n", .{ red, minus, reset });
    print("    Expected: {s}\n", .{expected});
    print("    Got:      {s}\n", .{got});
}

/// Print retry message
pub fn printRetry(attempt: u32, max: u32, delay_ms: u64) void {
    print("  Retry {d}/{d} after {d}ms...\n", .{ attempt, max, delay_ms });
}

/// Print download failure
pub fn printDownloadFailed(attempts: u32, err: anyerror) void {
    print("\n  {s}{s}{s} Download failed after {d} attempts: {}\n", .{ red, minus, reset, attempts, err });
}

/// Print download attempt failure
pub fn printDownloadAttemptFailed(attempt: u32, err: anyerror) void {
    print("\n  {s}{s}{s} Download failed (attempt {d}): {}\n", .{ yellow, warn, reset, attempt, err });
}
