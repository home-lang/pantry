const std = @import("std");
const lib = @import("../lib.zig");

pub const DownloadError = error{
    HttpRequestFailed,
    InvalidUrl,
    FileWriteFailed,
    NetworkError,
    MaxRetriesExceeded,
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

    // Calculate the appropriate unit
    const bytes_f = @as(f64, @floatFromInt(bytes));
    const i = @as(usize, @intFromFloat(@floor(@log(bytes_f) / @log(k))));
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
    // ANSI codes: dim + italic
    const dim_italic = "\x1b[2;3m";
    const reset = "\x1b[0m";

    // First, get the file size from HTTP headers
    const size_result = try std.process.Child.run(.{
        .allocator = allocator,
        .argv = &[_][]const u8{ "curl", "-sI", url },
    });
    defer allocator.free(size_result.stdout);
    defer allocator.free(size_result.stderr);

    var total_bytes: ?u64 = null;
    if (size_result.term.Exited == 0) {
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
    var child = std.process.Child.init(&[_][]const u8{
        "curl",
        "-fL",
        "--silent",
        "-o",
        dest_path,
        url,
    }, allocator);

    child.stdout_behavior = .Ignore;
    child.stderr_behavior = .Ignore;

    try child.spawn();

    // Monitor download progress
    const start_time = std.time.milliTimestamp();
    var last_size: u64 = 0;
    var last_update = start_time;
    var shown_progress = false;

    while (true) {
        std.Thread.sleep(100 * std.time.ns_per_ms);

        const stat = std.fs.cwd().statFile(dest_path) catch {
            continue;
        };

        const current_size: u64 = @intCast(stat.size);
        const now = std.time.milliTimestamp();

        // Update progress every 100ms if size changed
        if (current_size != last_size and (now - last_update) >= 100) {
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

            last_size = current_size;
            last_update = now;
        }

        // Check if download complete (file size stable for 2 seconds)
        if (current_size > 0 and current_size == last_size and (now - last_update) > 2000) {
            break;
        }
    }

    // Wait for curl to finish
    const term = try child.wait();

    // Show final download summary on a clean line
    if (shown_progress) {
        const final_stat = std.fs.cwd().statFile(dest_path) catch |err| {
            std.debug.print("\n", .{});
            if (term.Exited != 0) return error.HttpRequestFailed;
            return err;
        };
        const final_size: u64 = @intCast(final_stat.size);

        var final_buf: [64]u8 = undefined;
        const final_str = try formatBytes(final_size, &final_buf);

        const total_time = std.time.milliTimestamp() - start_time;
        const avg_speed = if (total_time > 0) @as(f64, @floatFromInt(final_size)) / (@as(f64, @floatFromInt(total_time)) / 1000.0) else 0.0;

        var speed_buf: [64]u8 = undefined;
        const speed_str = try formatSpeed(@intFromFloat(avg_speed), &speed_buf);

        // Clear line completely and show final summary (no newline - let caller add it)
        std.debug.print("\r{s}  ✓ {s} ({s} avg){s}\x1b[K", .{ dim_italic, final_str, speed_str, reset });
    }

    if (term.Exited != 0) {
        if (shown_progress) std.debug.print("\n", .{});
        return error.HttpRequestFailed;
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

    return std.fmt.allocPrint(
        allocator,
        "https://dist.pkgx.dev/{s}/{s}/{s}/v{s}.{s}",
        .{ domain, platform_str, arch_str, version, format },
    );
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
