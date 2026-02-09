const std = @import("std");
const io_helper = @import("../io_helper.zig");
const lib = @import("../lib.zig");
const style = @import("../cli/style.zig");

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
};

/// Download with inline progress (updates a specific line instead of new lines)
pub fn downloadFileInline(allocator: std.mem.Allocator, url: []const u8, dest_path: []const u8, progress_opts: InlineProgressOptions) !void {
    return downloadFileWithOptions(allocator, url, dest_path, false, progress_opts);
}

fn downloadFileWithOptions(allocator: std.mem.Allocator, url: []const u8, dest_path: []const u8, quiet: bool, inline_progress: ?InlineProgressOptions) !void {
    // Validate URL format
    if (!std.mem.startsWith(u8, url, "http://") and !std.mem.startsWith(u8, url, "https://")) {
        style.printInvalidUrl(url);
        return error.InvalidUrl;
    }

    // Native HTTP download — no curl subprocess, no fork/exec overhead.
    // Uses std.http.Client with native TLS, redirect following, and connection pooling.
    var stream = io_helper.httpStreamGet(allocator, url) catch return error.NetworkError;
    defer stream.deinit();

    const total_bytes = stream.contentLength();

    // Create output file
    const file = io_helper.cwd().createFile(io_helper.io, dest_path, .{}) catch return error.FileWriteFailed;
    defer file.close(io_helper.io);

    var file_buf: [65536]u8 = undefined;
    var file_writer = file.writerStreaming(io_helper.io, &file_buf);

    // Stream response body to file with progress tracking
    var transfer_buf: [16384]u8 = undefined; // 16KB transfer buffer for chunked progress
    const body_reader = stream.reader(&transfer_buf);

    const start_ts = std.posix.clock_gettime(.REALTIME) catch std.posix.timespec{ .sec = 0, .nsec = 0 };
    const start_ms = @as(i64, @intCast(start_ts.sec)) * 1000 + @divFloor(@as(i64, @intCast(start_ts.nsec)), 1_000_000);
    var bytes_downloaded: u64 = 0;
    var last_update_ms: i64 = start_ms;
    var shown_progress = false;

    while (true) {
        const n = body_reader.stream(&file_writer.interface, .unlimited) catch |err| switch (err) {
            error.EndOfStream => break,
            else => return error.HttpRequestFailed,
        };
        bytes_downloaded += n;

        // Update progress display (skip if quiet mode)
        if (!quiet) {
            const now_ts = std.posix.clock_gettime(.REALTIME) catch std.posix.timespec{ .sec = 0, .nsec = 0 };
            const now_ms = @as(i64, @intCast(now_ts.sec)) * 1000 + @divFloor(@as(i64, @intCast(now_ts.nsec)), 1_000_000);

            if (now_ms - last_update_ms >= 100) {
                if (inline_progress) |opts| {
                    // Inline progress: update the package line
                    const lines_up = opts.total_deps - opts.line_offset;
                    var current_buf: [32]u8 = undefined;
                    const current_str = formatBytes(bytes_downloaded, &current_buf) catch "?";

                    style.moveUp(lines_up);
                    style.clearLine();
                    if (total_bytes) |total| {
                        var total_buf: [32]u8 = undefined;
                        const total_str = formatBytes(total, &total_buf) catch "?";
                        style.print("{s}+{s} {s}@{s}{s}{s} {s}({s}/{s}){s}\n", .{
                            style.dim,     style.reset,
                            opts.pkg_name, style.dim,
                            style.italic,  opts.pkg_version,
                            style.dim,     current_str,
                            total_str,     style.reset,
                        });
                    } else {
                        style.print("{s}+{s} {s}@{s}{s}{s} {s}({s}){s}\n", .{
                            style.dim,     style.reset,
                            opts.pkg_name, style.dim,
                            style.italic,  opts.pkg_version,
                            style.dim,     current_str,
                            style.reset,
                        });
                    }
                    if (opts.line_offset < opts.total_deps - 1) {
                        style.moveDown(lines_up - 1);
                    }
                } else {
                    // Standard progress line
                    var current_buf: [32]u8 = undefined;
                    const current_str = formatBytes(bytes_downloaded, &current_buf) catch "?";
                    const elapsed_sec = @as(f64, @floatFromInt(now_ms - start_ms)) / 1000.0;

                    if (elapsed_sec > 0.1) {
                        const speed = @as(f64, @floatFromInt(bytes_downloaded)) / elapsed_sec;
                        var speed_buf: [32]u8 = undefined;
                        const speed_str = formatSpeed(@intFromFloat(speed), &speed_buf) catch null;

                        const total_str: ?[]const u8 = if (total_bytes) |total| blk: {
                            var tbuf: [32]u8 = undefined;
                            break :blk formatBytes(total, &tbuf) catch null;
                        } else null;

                        style.printDownloadProgress(current_str, total_str, speed_str, !shown_progress);
                        if (!shown_progress) shown_progress = true;
                    } else {
                        style.printDownloadProgress(current_str, null, null, !shown_progress);
                        if (!shown_progress) shown_progress = true;
                    }
                }
                last_update_ms = now_ms;
            }
        }
    }

    // Flush remaining buffered data to disk
    file_writer.flush() catch return error.FileWriteFailed;

    // Clear progress line (let caller print final status)
    if (!quiet and shown_progress) {
        style.clearLine();
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
        style.printChecksumMismatch(expected_checksum, hex);
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
        style.printChecksum(true);
        _ = try verifyChecksum(allocator, dest_path, checksum);
        style.printChecksum(false);
    }
}

/// Download a file with retry logic and exponential backoff
pub fn downloadFileWithRetry(allocator: std.mem.Allocator, url: []const u8, dest_path: []const u8, options: DownloadOptions) !void {
    var attempt: u32 = 0;
    var delay_ms = options.initial_retry_delay_ms;

    while (attempt < options.max_retries) {
        attempt += 1;

        if (attempt > 1) {
            style.printRetry(attempt - 1, options.max_retries - 1, delay_ms);
            std.Thread.sleep(delay_ms * std.time.ns_per_ms);
        }

        downloadFile(allocator, url, dest_path) catch |err| {
            if (attempt >= options.max_retries) {
                style.printDownloadFailed(options.max_retries, err);
                return error.MaxRetriesExceeded;
            }

            style.printDownloadAttemptFailed(attempt, err);

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
