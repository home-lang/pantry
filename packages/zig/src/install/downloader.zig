const std = @import("std");
const io_helper = @import("../io_helper.zig");
const lib = @import("../lib.zig");

pub const DownloadError = error{
    HttpRequestFailed,
    InvalidUrl,
    FileWriteFailed,
    NetworkError,
    MaxRetriesExceeded,
    ChecksumMismatch,
};

pub const DownloadOptions = struct {
    max_retries: u32 = 3,
    initial_retry_delay_ms: u64 = 1000,
};

/// Format bytes to human readable format (e.g., "12.3 MB")
fn formatBytes(bytes: u64, buf: []u8) ![]const u8 {
    if (bytes == 0) {
        return std.fmt.bufPrint(buf, "0 B", .{});
    }

    const k: f64 = 1024.0;
    const sizes = [_][]const u8{ "B", "KB", "MB", "GB", "TB" };

    // Calculate the appropriate unit (with safety for edge cases)
    const bytes_f = @as(f64, @floatFromInt(bytes));
    const log_val = @log(bytes_f) / @log(k);
    const clamped = @max(0.0, @min(log_val, @as(f64, @floatFromInt(sizes.len - 1))));
    const i = @as(usize, @intFromFloat(@floor(clamped)));
    const size_idx = @min(i, sizes.len - 1);

    const value = bytes_f / std.math.pow(f64, k, @as(f64, @floatFromInt(size_idx)));

    return std.fmt.bufPrint(buf, "{d:.1} {s}", .{ value, sizes[size_idx] });
}

/// Format speed (bytes per second)
fn formatSpeed(bytes_per_sec: u64, buf: []u8) ![]const u8 {
    var size_buf: [64]u8 = undefined;
    const size_str = try formatBytes(bytes_per_sec, &size_buf);
    return std.fmt.bufPrint(buf, "{s}/s", .{size_str});
}

/// Download a file from a URL to a destination path with progress
pub fn downloadFile(allocator: std.mem.Allocator, url: []const u8, dest_path: []const u8) !void {
    return downloadFileWithOptions(allocator, url, dest_path, false, null);
}

/// Download a file from a URL to a destination path with optional quiet mode
pub fn downloadFileQuiet(allocator: std.mem.Allocator, url: []const u8, dest_path: []const u8, quiet: bool) !void {
    return downloadFileWithOptions(allocator, url, dest_path, quiet, null);
}

/// Download progress callback options for inline progress display
pub const InlineProgressOptions = struct {
    line_offset: usize, // How many lines up from current position
    total_deps: usize, // Total number of dependencies
    pkg_name: []const u8, // Package name to display
    pkg_version: []const u8, // Package version to display
    dim_str: []const u8,
    italic_str: []const u8,
    reset_str: []const u8,
};

/// Download with inline progress (updates a specific line instead of new lines)
pub fn downloadFileInline(allocator: std.mem.Allocator, url: []const u8, dest_path: []const u8, progress_opts: InlineProgressOptions) !void {
    return downloadFileWithOptions(allocator, url, dest_path, false, progress_opts);
}

fn downloadFileWithOptions(allocator: std.mem.Allocator, url: []const u8, dest_path: []const u8, quiet: bool, inline_progress: ?InlineProgressOptions) !void {
    // ANSI codes: dim + italic
    const dim_italic = "\x1b[2;3m";
    const reset = "\x1b[0m";

    // Validate URL format
    if (!std.mem.startsWith(u8, url, "http://") and !std.mem.startsWith(u8, url, "https://")) {
        std.debug.print("❌ Invalid URL: {s}\n", .{url});
        return error.InvalidUrl;
    }

    // First, get the file size from HTTP headers
    const size_result = try io_helper.childRun(allocator, &[_][]const u8{ "curl", "-sI", url });
    defer allocator.free(size_result.stdout);
    defer allocator.free(size_result.stderr);

    var total_bytes: ?u64 = null;
    if (size_result.term.exited == 0) {
        var lines = std.mem.splitSequence(u8, size_result.stdout, "\n");
        while (lines.next()) |line| {
            if (std.mem.startsWith(u8, line, "Content-Length:") or
                std.mem.startsWith(u8, line, "content-length:"))
            {
                const trimmed = std.mem.trim(u8, line[15..], " \r\n\t");
                total_bytes = std.fmt.parseInt(u64, trimmed, 10) catch null;
                break;
            }
        }
    }

    // Start curl download
    var child = try io_helper.spawn(.{
        .argv = &[_][]const u8{
            "curl",
            "-fL",
            "--silent",
            "-o",
            dest_path,
            url,
        },
        .stdout = .ignore,
        .stderr = .ignore,
    });

    // Monitor download progress
    const start_time = @as(i64, @intCast((std.posix.clock_gettime(.REALTIME) catch std.posix.timespec{ .sec = 0, .nsec = 0 }).sec * 1000));
    var last_size: u64 = 0;
    var last_update = start_time;
    var last_progress_time = start_time; // Track when we last saw progress
    var shown_progress = false;
    const stall_timeout_ms: i64 = 60000; // 60 second stall timeout (no progress)

    while (true) {
        io_helper.nanosleep(0, 100 * std.time.ns_per_ms);

        const now = @as(i64, @intCast((std.posix.clock_gettime(.REALTIME) catch std.posix.timespec{ .sec = 0, .nsec = 0 }).sec * 1000));

        const stat = io_helper.statFile(dest_path) catch {
            // File doesn't exist yet - check for stall timeout
            if (now - last_progress_time > stall_timeout_ms) {
                io_helper.kill(&child);
                return error.NetworkError;
            }
            continue;
        };

        const current_size: u64 = @intCast(stat.size);

        // Update progress timestamp if size changed
        if (current_size != last_size) {
            last_progress_time = now;
        }

        // Check for stall timeout (no progress for too long)
        if (now - last_progress_time > stall_timeout_ms) {
            io_helper.kill(&child);
            return error.NetworkError;
        }

        // Update progress every 100ms if size changed (skip if quiet mode)
        if (!quiet and current_size != last_size and (now - last_update) >= 100) {
            if (inline_progress) |opts| {
                // Inline progress: update the package line itself
                const lines_up = opts.total_deps - opts.line_offset;
                var current_buf: [64]u8 = undefined;
                const current_str = try formatBytes(current_size, &current_buf);

                if (total_bytes) |total| {
                    var total_buf: [64]u8 = undefined;
                    const total_str = try formatBytes(total, &total_buf);

                    // Update package line with download progress in source label position
                    std.debug.print("\x1b[{d}A\r\x1b[K{s}+{s} {s}@{s}{s}{s} {s}({s} / {s}){s}\n", .{
                        lines_up,
                        opts.dim_str,
                        reset,
                        opts.pkg_name,
                        opts.dim_str,
                        opts.italic_str,
                        opts.pkg_version,
                        opts.dim_str,
                        current_str,
                        total_str,
                        reset,
                    });
                } else {
                    // No total size known, just show current
                    std.debug.print("\x1b[{d}A\r\x1b[K{s}+{s} {s}@{s}{s}{s} {s}({s}){s}\n", .{
                        lines_up,
                        opts.dim_str,
                        reset,
                        opts.pkg_name,
                        opts.dim_str,
                        opts.italic_str,
                        opts.pkg_version,
                        opts.dim_str,
                        current_str,
                        reset,
                    });
                }

                // Move cursor back down
                if (opts.line_offset < opts.total_deps - 1) {
                    std.debug.print("\x1b[{d}B", .{lines_up - 1});
                }
            } else {
                // Standard newline progress
                var current_buf: [64]u8 = undefined;
                const current_str = try formatBytes(current_size, &current_buf);

                const elapsed_sec = @as(f64, @floatFromInt(now - start_time)) / 1000.0;

                if (elapsed_sec > 0.1) {
                    const speed = @as(f64, @floatFromInt(current_size)) / elapsed_sec;
                    var speed_buf: [64]u8 = undefined;
                    const speed_str = try formatSpeed(@intFromFloat(speed), &speed_buf);

                    if (total_bytes) |total| {
                        var total_buf: [64]u8 = undefined;
                        const total_str = try formatBytes(total, &total_buf);

                        if (shown_progress) {
                            std.debug.print("\r{s}  {s} / {s} ({s}){s}", .{ dim_italic, current_str, total_str, speed_str, reset });
                        } else {
                            std.debug.print("\n{s}  {s} / {s} ({s}){s}", .{ dim_italic, current_str, total_str, speed_str, reset });
                            shown_progress = true;
                        }
                    } else {
                        if (shown_progress) {
                            std.debug.print("\r{s}  {s} ({s}){s}", .{ dim_italic, current_str, speed_str, reset });
                        } else {
                            std.debug.print("\n{s}  {s} ({s}){s}", .{ dim_italic, current_str, speed_str, reset });
                            shown_progress = true;
                        }
                    }
                } else {
                    if (total_bytes) |total| {
                        var total_buf: [64]u8 = undefined;
                        const total_str = try formatBytes(total, &total_buf);

                        if (shown_progress) {
                            std.debug.print("\r{s}  {s} / {s}{s}", .{ dim_italic, current_str, total_str, reset });
                        } else {
                            std.debug.print("\n{s}  {s} / {s}{s}", .{ dim_italic, current_str, total_str, reset });
                            shown_progress = true;
                        }
                    } else {
                        if (shown_progress) {
                            std.debug.print("\r{s}  {s}{s}", .{ dim_italic, current_str, reset });
                        } else {
                            std.debug.print("\n{s}  {s}{s}", .{ dim_italic, current_str, reset });
                            shown_progress = true;
                        }
                    }
                }
            }

            last_size = current_size;
            last_update = now;
        }

        // Update last_size even in quiet mode for download completion check
        if (quiet and current_size != last_size) {
            last_size = current_size;
            last_update = now;
        }

        // Check if download complete (file size stable for 1 second, or any size after 5 seconds)
        const time_since_last_change = now - last_update;
        if (current_size > 0 and current_size == last_size and time_since_last_change > 1000) {
            break;
        }

        // Fallback: if we have any data after 5 seconds and size hasn't changed in 1 second, assume done
        if (current_size > 0 and (now - start_time) > 5000 and time_since_last_change > 1000) {
            break;
        }
    }

    // Wait for curl to finish
    const term = try io_helper.wait(&child);

    // Show final download summary on a clean line (skip if quiet mode)
    if (!quiet and shown_progress) {
        _ = io_helper.statFile(dest_path) catch |err| {
            std.debug.print("\n", .{});
            if (term.exited != 0) return error.HttpRequestFailed;
            return err;
        };
        // Clear line completely (let caller print final status)
        std.debug.print("\r\x1b[K", .{});
    }

    if (term.exited != 0) {
        if (shown_progress) std.debug.print("\n", .{});
        return error.HttpRequestFailed;
    }
}

/// Check if a version string looks like a Zig dev version
pub fn isZigDevVersion(version: []const u8) bool {
    // Dev versions look like: 0.16.0-dev.1484+d0ba6642b or 0.14.0-dev.2851+b074a1eb8
    return std.mem.indexOf(u8, version, "-dev.") != null;
}

/// Build download URL for ziglang.org
/// For dev versions: https://ziglang.org/builds/zig-{platform}-{arch}-{version}.tar.xz
/// For stable versions: https://ziglang.org/download/{version}/zig-{platform}-{arch}-{version}.tar.xz
pub fn buildZiglangUrl(
    allocator: std.mem.Allocator,
    version: []const u8,
) ![]const u8 {
    const platform = lib.Platform.current();
    const platform_str = switch (platform) {
        .darwin => "macos",
        .linux => "linux",
        .windows => "windows",
    };

    const arch = lib.Architecture.current();
    const arch_str = switch (arch) {
        .x86_64 => "x86_64",
        .aarch64 => "aarch64",
    };

    // Dev versions use /builds/ endpoint, stable use /download/{version}/
    // Note: ziglang.org uses format zig-{arch}-{platform}-{version}.tar.xz
    if (isZigDevVersion(version)) {
        return std.fmt.allocPrint(
            allocator,
            "https://ziglang.org/builds/zig-{s}-{s}-{s}.tar.xz",
            .{ arch_str, platform_str, version },
        );
    } else {
        return std.fmt.allocPrint(
            allocator,
            "https://ziglang.org/download/{s}/zig-{s}-{s}-{s}.tar.xz",
            .{ version, arch_str, platform_str, version },
        );
    }
}

/// Build package download URL
pub fn buildPackageUrl(
    allocator: std.mem.Allocator,
    domain: []const u8,
    version: []const u8,
    format: []const u8,
) ![]const u8 {
    const platform = lib.Platform.current();
    const platform_str = switch (platform) {
        .darwin => "darwin",
        .linux => "linux",
        .windows => "windows",
    };

    const arch = lib.Architecture.current();
    const arch_str = switch (arch) {
        .x86_64 => "x86-64",
        .aarch64 => "aarch64",
    };

    // pkgx uses format: https://dist.pkgx.dev/{domain}/{platform}/{arch}/v{version}.tar.xz
    // Strip semver prefixes (^, ~, >=, etc.) and 'v' prefix
    var clean_version = version;

    // Strip semver constraint prefixes
    if (std.mem.startsWith(u8, clean_version, "^") or
        std.mem.startsWith(u8, clean_version, "~") or
        std.mem.startsWith(u8, clean_version, "="))
    {
        clean_version = clean_version[1..];
    } else if (std.mem.startsWith(u8, clean_version, ">=") or
        std.mem.startsWith(u8, clean_version, "<="))
    {
        clean_version = clean_version[2..];
    } else if (std.mem.startsWith(u8, clean_version, ">") or
        std.mem.startsWith(u8, clean_version, "<"))
    {
        clean_version = clean_version[1..];
    }

    // Strip 'v' prefix if present
    if (std.mem.startsWith(u8, clean_version, "v")) {
        clean_version = clean_version[1..];
    }

    // If version is just a major version like "22", try with .0.0
    const needs_full_version = std.mem.indexOf(u8, clean_version, ".") == null;
    const full_version = if (needs_full_version)
        try std.fmt.allocPrint(allocator, "{s}.0.0", .{clean_version})
    else
        clean_version;
    defer if (needs_full_version) allocator.free(full_version);

    return std.fmt.allocPrint(
        allocator,
        "https://dist.pkgx.dev/{s}/{s}/{s}/v{s}.{s}",
        .{ domain, platform_str, arch_str, full_version, format },
    );
}

/// Verify file checksum (SHA256)
pub fn verifyChecksum(
    allocator: std.mem.Allocator,
    file_path: []const u8,
    expected_checksum: []const u8,
) !bool {
    // Read file contents
    const file = try io_helper.cwd().openFile(io_helper.io, file_path, .{});
    defer file.close();

    const file_size = (try file.stat()).size;
    const contents = try file.readToEndAlloc(allocator, file_size);
    defer allocator.free(contents);

    // Compute SHA256 hash
    var hash: [32]u8 = undefined;
    std.crypto.hash.sha2.Sha256.hash(contents, &hash, .{});

    // Convert to hex string
    var hex_buf: [64]u8 = undefined;
    const hex = try std.fmt.bufPrint(&hex_buf, "{s}", .{std.fmt.fmtSliceHexLower(&hash)});

    // Compare with expected
    if (!std.mem.eql(u8, hex, expected_checksum)) {
        std.debug.print("  ✗ Checksum mismatch:\n", .{});
        std.debug.print("    Expected: {s}\n", .{expected_checksum});
        std.debug.print("    Got:      {s}\n", .{hex});
        return error.ChecksumMismatch;
    }

    return true;
}

/// Download file and verify checksum
pub fn downloadFileWithChecksum(
    allocator: std.mem.Allocator,
    url: []const u8,
    dest_path: []const u8,
    expected_checksum: ?[]const u8,
) !void {
    // Download file
    try downloadFile(allocator, url, dest_path);

    // Verify checksum if provided
    if (expected_checksum) |checksum| {
        std.debug.print("\n  Verifying checksum...", .{});
        _ = try verifyChecksum(allocator, dest_path, checksum);
        std.debug.print(" ✓\n", .{});
    }
}

/// Download a file with retry logic and exponential backoff
pub fn downloadFileWithRetry(allocator: std.mem.Allocator, url: []const u8, dest_path: []const u8, options: DownloadOptions) !void {
    var attempt: u32 = 0;
    var delay_ms = options.initial_retry_delay_ms;

    while (attempt < options.max_retries) {
        attempt += 1;

        if (attempt > 1) {
            std.debug.print("  Retry {d}/{d} after {d}ms...\n", .{ attempt - 1, options.max_retries - 1, delay_ms });
            std.Thread.sleep(delay_ms * std.time.ns_per_ms);
        }

        downloadFile(allocator, url, dest_path) catch |err| {
            if (attempt >= options.max_retries) {
                std.debug.print("\n  ✗ Download failed after {d} attempts: {}\n", .{ options.max_retries, err });
                return error.MaxRetriesExceeded;
            }

            std.debug.print("\n  ⚠ Download failed (attempt {d}): {}\n", .{ attempt, err });

            // Exponential backoff: double the delay each time
            delay_ms *= 2;
            continue;
        };

        // Success
        return;
    }

    return error.MaxRetriesExceeded;
}

test "buildPackageUrl" {
    const allocator = std.testing.allocator;

    const url = try buildPackageUrl(allocator, "bun.sh", "1.0.0", "tar.gz");
    defer allocator.free(url);

    const platform = lib.Platform.current();
    const arch = lib.Architecture.current();

    if (platform == .darwin and arch == .aarch64) {
        try std.testing.expectEqualStrings(
            "https://dist.pkgx.dev/bun.sh/darwin/aarch64/v1.0.0.tar.gz",
            url,
        );
    }
}

test "verifyChecksum" {
    const allocator = std.testing.allocator;

    // Create a test file
    const test_file = "test_checksum.txt";
    const test_content = "Hello, World!";

    {
        const file = try io_helper.cwd().createFile(io_helper.io, test_file, .{});
        defer file.close(io_helper.io);
        try io_helper.writeAllToFile(file, test_content);
    }
    defer io_helper.deleteFile(test_file) catch {};

    // Expected SHA256 of "Hello, World!"
    const expected = "dffd6021bb2bd5b0af676290809ec3a53191dd81c7f70a4b28688a362182986f";

    // Should pass with correct checksum
    const valid = try verifyChecksum(allocator, test_file, expected);
    try std.testing.expect(valid);

    // Should fail with incorrect checksum
    const wrong_checksum = "0000000000000000000000000000000000000000000000000000000000000000";
    const result = verifyChecksum(allocator, test_file, wrong_checksum);
    try std.testing.expectError(error.ChecksumMismatch, result);
}
