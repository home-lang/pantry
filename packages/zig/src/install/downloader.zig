const std = @import("std");
const lib = @import("../lib.zig");

pub const DownloadError = error{
    HttpRequestFailed,
    InvalidUrl,
    FileWriteFailed,
    NetworkError,
};

/// Format bytes to human-readable string
fn formatBytes(bytes: u64, buf: []u8) ![]const u8 {
    if (bytes < 1024) {
        return std.fmt.bufPrint(buf, "{d}B", .{bytes});
    } else if (bytes < 1024 * 1024) {
        const kb = @as(f64, @floatFromInt(bytes)) / 1024.0;
        return std.fmt.bufPrint(buf, "{d:.1}KB", .{kb});
    } else if (bytes < 1024 * 1024 * 1024) {
        const mb = @as(f64, @floatFromInt(bytes)) / (1024.0 * 1024.0);
        return std.fmt.bufPrint(buf, "{d:.1}MB", .{mb});
    } else {
        const gb = @as(f64, @floatFromInt(bytes)) / (1024.0 * 1024.0 * 1024.0);
        return std.fmt.bufPrint(buf, "{d:.2}GB", .{gb});
    }
}

/// Download a file from a URL to a destination path with progress
pub fn downloadFile(allocator: std.mem.Allocator, url: []const u8, dest_path: []const u8) !void {
    // Start curl download silently
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

    // Monitor download progress by checking file size
    const start_time = std.time.milliTimestamp();
    var last_size: u64 = 0;
    var last_update = start_time;
    var shown_progress = false;

    while (true) {
        // Small sleep to avoid busy waiting
        std.Thread.sleep(100 * std.time.ns_per_ms);

        // Get current file size
        const stat = std.fs.cwd().statFile(dest_path) catch {
            continue;
        };

        const current_size: u64 = @intCast(stat.size);
        const now = std.time.milliTimestamp();

        // Update progress every 100ms if size changed
        if (current_size != last_size and (now - last_update) >= 100) {
            var buf: [64]u8 = undefined;
            const size_str = try formatBytes(current_size, &buf);

            // Calculate speed (bytes per second)
            const elapsed_sec = @as(f64, @floatFromInt(now - start_time)) / 1000.0;
            if (elapsed_sec > 0.1) {
                const speed = @as(f64, @floatFromInt(current_size)) / elapsed_sec;
                var speed_buf: [64]u8 = undefined;
                const speed_str = try formatBytes(@intFromFloat(speed), &speed_buf);

                if (shown_progress) {
                    std.debug.print("\r  {s} ({s}/s)", .{ size_str, speed_str });
                } else {
                    std.debug.print("\n  {s} ({s}/s)", .{ size_str, speed_str });
                    shown_progress = true;
                }
            } else {
                if (shown_progress) {
                    std.debug.print("\r  {s}", .{size_str});
                } else {
                    std.debug.print("\n  {s}", .{size_str});
                    shown_progress = true;
                }
            }

            last_size = current_size;
            last_update = now;
        }

        // Check if file size hasn't changed in a while (download might be complete)
        // This is a heuristic since we can't poll process state easily in Zig 0.15
        if (current_size > 0 and current_size == last_size and (now - last_update) > 2000) {
            // File size stable for 2 seconds, assume download complete
            break;
        }
    }

    // Wait for curl to finish
    const term = try child.wait();

    // Print final size (overwrite progress line)
    const final_stat = std.fs.cwd().statFile(dest_path) catch |err| {
        if (shown_progress) std.debug.print("\n", .{});
        return err;
    };
    const final_size: u64 = @intCast(final_stat.size);

    if (shown_progress) {
        var buf: [64]u8 = undefined;
        const size_str = try formatBytes(final_size, &buf);
        std.debug.print("\r  {s}     ", .{size_str});
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
