//! Centralized CLI Output Styling
//!
//! Provides consistent colors, symbols, and formatting helpers for all CLI output.
//! All user-facing output should go through this module to ensure:
//! - Output goes to stdout (not stderr via std.debug.print)
//! - Consistent color and symbol usage across all commands
//! - Bun-like clean, minimal aesthetic

const std = @import("std");
const builtin = @import("builtin");
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
pub const bold_cyan = "\x1b[1;36m";
pub const green_bold = "\x1b[32;1m";
pub const reset = "\x1b[0m";

// ── Symbols (Bun-style: + for added, - for removed) ────────────────────────

pub const plus = "+";
pub const minus = "-";
pub const warn = "!";
pub const arrow = ">";
pub const check = "done";
pub const info = "i";
pub const link_sym = "~";

// ── Environment Detection ───────────────────────────────────────────────────

/// Detect if running in CI (no interactive terminal). Cached after first check.
var ci_detected: enum { unknown, yes, no } = .unknown;
pub fn isCI() bool {
    if (ci_detected != .unknown) return ci_detected == .yes;
    // Check common CI environment variables
    const ci_vars = [_][]const u8{ "CI", "GITHUB_ACTIONS", "NO_COLOR", "BUILDKITE", "CIRCLECI", "GITLAB_CI" };
    for (ci_vars) |v| {
        if (io_helper.getEnvVarOwned(std.heap.page_allocator, v) catch null) |val| {
            std.heap.page_allocator.free(val);
            ci_detected = .yes;
            return true;
        }
    }
    ci_detected = .no;
    return false;
}

// ── Quiet Mode ────────────────────────────────────────────────────────────

/// Global quiet flag. When set, `print()` — and every helper built on it
/// (progress, per-package lines, summaries, headers) — is suppressed. Errors
/// and failures bypass it via `printForced` so breakage is never hidden.
/// Set by the install command from `--quiet` / `InstallOptions.quiet`.
/// Process-lifetime: the CLI runs one command then exits, so there is no reset.
var quiet_mode: bool = false;

pub fn setQuiet(value: bool) void {
    quiet_mode = value;
}

pub fn isQuiet() bool {
    return quiet_mode;
}

/// When true, `emit` writes to stderr instead of stdout. Commands whose stdout
/// is consumed by `eval "$(...)"` (notably `env`) enable this so all
/// human-facing output — progress, install/download lines, errors — goes to
/// stderr and never corrupts the shell code emitted on stdout.
var diagnostics_to_stderr: bool = false;

pub fn setDiagnosticsToStderr(value: bool) void {
    diagnostics_to_stderr = value;
}

/// Whether diagnostics are currently routed to stderr. Lets spawn sites
/// (e.g. the JS package-manager delegate) redirect CHILD stdout too — the
/// flag alone only covers our own `print` calls, not an inherited fd.
pub fn isDiagnosticsToStderr() bool {
    return diagnostics_to_stderr;
}

// ── Color Detection ──────────────────────────────────────────────────────

/// Whether ANSI escape sequences (color, cursor moves) should be emitted.
/// Disabled when `NO_COLOR` is set (https://no-color.org) or when stdout is not
/// a terminal (piped/redirected), unless `FORCE_COLOR` overrides. When off,
/// `emit` strips escape sequences so redirected output / `pantry … > file` is
/// plain text. Cached after the first check.
var color_state: enum { unknown, on, off } = .unknown;

pub fn colorsEnabled() bool {
    if (color_state != .unknown) return color_state == .on;
    const a = std.heap.page_allocator;
    // NO_COLOR (any value) wins.
    if (io_helper.getEnvVarOwned(a, "NO_COLOR")) |v| {
        a.free(v);
        color_state = .off;
        return false;
    } else |_| {}
    // FORCE_COLOR keeps color even when piped (useful for CI logs that render it).
    if (io_helper.getEnvVarOwned(a, "FORCE_COLOR")) |v| {
        a.free(v);
        color_state = .on;
        return true;
    } else |_| {}
    // Otherwise: colorize only on a real terminal.
    const tty = io_helper.File.stdout().isTty(io_helper.io) catch false;
    color_state = if (tty) .on else .off;
    return tty;
}

/// Strip ANSI CSI escape sequences (ESC '[' … final-byte) in place. The output
/// is never longer than the input, so we filter within the same buffer.
fn stripAnsi(s: []u8) []u8 {
    var w: usize = 0;
    var i: usize = 0;
    while (i < s.len) {
        if (s[i] == 0x1b and i + 1 < s.len and s[i + 1] == '[') {
            i += 2;
            // CSI parameter/intermediate bytes: 0x20–0x3F
            while (i < s.len and s[i] >= 0x20 and s[i] <= 0x3f) : (i += 1) {}
            // Final byte: 0x40–0x7E (consume it too)
            if (i < s.len and s[i] >= 0x40 and s[i] <= 0x7e) i += 1;
        } else {
            s[w] = s[i];
            w += 1;
            i += 1;
        }
    }
    return s[0..w];
}

// ── Core Output ─────────────────────────────────────────────────────────────

/// Write a formatted message straight to stdout, ignoring quiet mode. Backs
/// both `print` (gated) and `printForced` (always). Strips ANSI when color is
/// disabled. Thread-safe via write().
fn emit(comptime fmt: []const u8, args: anytype) void {
    if (builtin.is_test) {
        return;
    }
    var buf: [65536]u8 = undefined;
    const msg = std.fmt.bufPrint(&buf, fmt, args) catch {
        // Fallback for messages that exceed buffer
        std.debug.print(fmt, args);
        return;
    };
    // On the interactive TTY path colorsEnabled() is true (cached) and `msg`
    // is written as-is — no scan. Stripping only runs when output is redirected.
    const out = if (colorsEnabled()) msg else stripAnsi(msg);
    const target = if (diagnostics_to_stderr) io_helper.File.stderr() else io_helper.File.stdout();
    io_helper.writeAllToFile(target, out) catch {
        // Last resort: try stderr
        std.debug.print(fmt, args);
    };
}

/// Print to stdout (user-facing output). Suppressed under quiet mode.
pub fn print(comptime fmt: []const u8, args: anytype) void {
    if (quiet_mode) return;
    emit(fmt, args);
}

/// Print to stdout even under quiet mode — for output that must always surface
/// (errors, failures). Use sparingly; most output should go through `print`.
pub fn printForced(comptime fmt: []const u8, args: anytype) void {
    emit(fmt, args);
}

/// Clear the current line (carriage return + erase to end). No-op in CI.
pub fn clearLine() void {
    if (isCI()) return;
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
        green, plus,    reset,
        bold,  name,    reset,
        dim,   version, reset,
    });
}

/// Print a successfully linked package: + bold(name)@dim(version) dim((linked))
pub fn printLinked(name: []const u8, version: []const u8) void {
    print("{s}{s}{s} {s}{s}{s}{s}@{s} {s}(linked){s}\n", .{
        green, plus,    reset,
        bold,  name,    reset,
        dim,   version, dim,
        reset,
    });
}

/// Print an auto-linked package: + bold(name) dim((auto-linked from path))
pub fn printAutoLinked(name: []const u8, path: []const u8) void {
    print("{s}{s}{s} {s}{s}{s} {s}(auto-linked from {s}){s}\n", .{
        green, plus, reset,
        bold,  name, reset,
        dim,   path, reset,
    });
}

/// Print a failed package: - bold(name)@dim(version) dim((reason))
/// Forced: failures must surface even under quiet mode.
pub fn printFailed(name: []const u8, version: []const u8, reason: ?[]const u8) void {
    printForced("{s}{s}{s} {s}{s}{s}{s}@{s}", .{
        red,  minus,   reset,
        bold, name,    reset,
        dim,  version,
    });
    if (reason) |msg| {
        printForced(" {s}({s}){s}\n", .{ dim, msg, reset });
    } else {
        printForced("\n", .{});
    }
}

/// Print a warning for a package: ! bold(name)@dim(version) dim((reason))
pub fn printWarning(name: []const u8, version: []const u8, reason: []const u8) void {
    print("{s}{s}{s} {s}{s}{s}{s}@{s} {s}({s}){s}\n", .{
        yellow, warn,    reset,
        bold,   name,    reset,
        dim,    version, dim,
        reason, reset,
    });
}

// ── Headers & Summaries ─────────────────────────────────────────────────────

/// Print the command header: "pantry install v0.x.x (hash)"
pub fn printHeader(command: []const u8, version: []const u8, hash: []const u8) void {
    print("\n{s}pantry {s}{s} {s}v{s} ({s}){s}\n\n", .{
        bold,  command, reset,
        dim,   version, hash,
        reset,
    });
}

/// Print the "all up to date" summary (bun-style)
pub fn printUpToDate(pkg_count: usize, workspace_count: usize, elapsed_ms: f64) void {
    const pkg_label = if (pkg_count == 1) "package" else "packages";
    if (workspace_count > 0) {
        const ws_label = if (workspace_count == 1) "workspace member" else "workspace members";
        print("\n{s}{d}{s} {s} + {s}{d}{s} {s} up to date {s}(no changes) [{s}{d:.0}{s}ms]{s}\n", .{
            green_bold, pkg_count,       reset,      pkg_label,
            green_bold, workspace_count, reset,      ws_label,
            dim,        bold,            elapsed_ms, dim,
            reset,
        });
    } else {
        print("\n{s}{d}{s} {s} up to date {s}(no changes) [{s}{d:.0}{s}ms]{s}\n", .{
            green_bold, pkg_count, reset,      pkg_label,
            dim,        bold,      elapsed_ms, dim,
            reset,
        });
    }
}

/// Print the install summary line: "N packages installed [Xms]"
pub fn printSummary(success_count: usize, total_count: usize, elapsed_ms: f64) void {
    const label = if (success_count == 1) "package" else "packages";
    if (success_count == total_count) {
        print("{s}{d}{s} {s} installed {s}[{s}{d:.0}ms{s}]{s}\n", .{
            green, success_count, reset,      label,
            dim,   bold,          elapsed_ms, reset,
            reset,
        });
    } else {
        print("{s}{d}{s}/{s}{d}{s} {s} installed {s}[{s}{d:.0}ms{s}]{s}\n", .{
            green,      success_count, reset,
            green,      total_count,   reset,
            label,      dim,           bold,
            elapsed_ms, reset,         reset,
        });
    }
}

/// Print checked summary (no changes)
pub fn printCheckedSummary(success_count: usize, total_count: usize, elapsed_ms: f64) void {
    _ = success_count;
    const label = if (total_count == 1) "package" else "packages";
    print("{s}{d}{s} {s} up to date {s}[{s}{d:.0}ms{s}]{s}\n", .{
        green, total_count, reset,      label,
        dim,   bold,        elapsed_ms, reset,
        reset,
    });
}

/// Print failure count. Forced: must surface even under quiet mode.
pub fn printFailureCount(count: usize) void {
    printForced("\n{s}{d} package(s) failed to install{s}\n", .{ red, count, reset });
}

// ── Progress ────────────────────────────────────────────────────────────────

/// Spinner frames (simple rotating chars)
const spinner_frames = [_][]const u8{ "⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏" };

/// Print a single-line spinner with package name and progress counter.
/// Overwrites the current line each call. Suppressed in CI (causes log noise).
pub fn printProgress(current: usize, total: usize, pkg_name: []const u8, frame: usize) void {
    if (isCI()) return;
    const spinner = spinner_frames[frame % spinner_frames.len];
    print("\r\x1b[K{s}{s}{s} {s}{s}{s} {s}[{d}/{d}]{s}", .{
        cyan,  spinner,  reset,
        bold,  pkg_name, reset,
        dim,   current,  total,
        reset,
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

/// Print installing message. If `resuming_count > 0`, annotates the line to
/// indicate this is a continuation of a prior interrupted install.
pub fn printInstalling(count: usize) void {
    printInstallingEx(count, 0);
}

pub fn printInstallingEx(count: usize, resuming_count: usize) void {
    const label = if (count == 1) "package" else "packages";
    if (resuming_count > 0) {
        print("{s}{s}{s} Installing {d} {s} {s}(resuming, {d} previously completed){s}...\n", .{
            green, arrow,          reset, count, label,
            dim,   resuming_count, reset,
        });
    } else {
        print("{s}{s}{s} Installing {d} {s}...\n", .{ green, arrow, reset, count, label });
    }
}

/// Map common Zig error names to user-friendly messages. Falls back to a
/// lowercased version of the error name for unknown errors.
pub fn friendlyErrorName(err: anyerror) []const u8 {
    return switch (err) {
        error.DownloadFailed => "download failed",
        error.HttpRequestFailed => "network error",
        error.NetworkError => "network error",
        error.InvalidUrl => "invalid URL",
        error.PackageNotFound => "not found in registry",
        error.PaymentRequired => "paywalled (HTTP 402)",
        error.OutOfMemory => "out of memory",
        error.FileNotFound => "file not found",
        error.AccessDenied => "access denied",
        error.ConnectionRefused => "connection refused",
        error.ConnectionTimedOut => "connection timed out",
        error.TlsInitializationFailed => "TLS error",
        else => @errorName(err),
    };
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

/// Print a generic error line. Forced: errors must surface even under quiet mode.
pub fn printError(comptime fmt: []const u8, args: anytype) void {
    printForced("{s}error{s}: ", .{ red, reset });
    printForced(fmt, args);
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

/// Print workspace complete summary with elapsed time
pub fn printWorkspaceComplete(success: usize, failed: usize, elapsed_ms: u64) void {
    printWorkspaceCompleteEx(success, 0, failed, elapsed_ms);
}

/// Print workspace complete summary with cached breakdown
pub fn printWorkspaceCompleteEx(success: usize, cached: usize, failed: usize, elapsed_ms: u64) void {
    print("\n{s}{s}{s} Workspace setup complete! Installed {d} package(s)", .{
        green, check, reset, success,
    });
    if (cached > 0) {
        print(" {s}({d} cached){s}", .{ dim, cached, reset });
    }
    if (failed > 0) {
        print(", {s}{d} failed{s}", .{ red, failed, reset });
    }
    print(" {s}({d}ms){s}\n", .{ dim, elapsed_ms, reset });
}

// ── Global ──────────────────────────────────────────────────────────────────

/// Print global install result (success)
pub fn printGlobalInstalled(name: []const u8, version: []const u8, from_cache: bool, time_ms: u64) void {
    print("  {s}{s}{s} {s}{s}{s}{s}@{s}", .{
        green, plus,    reset,
        bold,  name,    reset,
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
