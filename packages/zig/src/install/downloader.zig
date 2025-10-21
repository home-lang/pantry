const std = @import("std");
const lib = @import("../lib.zig");

pub const DownloadError = error{
    HttpRequestFailed,
    InvalidUrl,
    FileWriteFailed,
    NetworkError,
};

/// Download a file from a URL to a destination path
pub fn downloadFile(allocator: std.mem.Allocator, url: []const u8, dest_path: []const u8) !void {
    // Use curl for downloading (simpler and more reliable for now)
    const result = try std.process.Child.run(.{
        .allocator = allocator,
        .argv = &[_][]const u8{
            "curl",
            "-fsSL",
            "-o",
            dest_path,
            url,
        },
    });
    defer allocator.free(result.stdout);
    defer allocator.free(result.stderr);

    if (result.term.Exited != 0) {
        std.debug.print("Download failed: {s}\n", .{result.stderr});
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
