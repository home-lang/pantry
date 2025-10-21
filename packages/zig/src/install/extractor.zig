const std = @import("std");

pub const ExtractError = error{
    ExtractionFailed,
    UnsupportedFormat,
    InvalidArchive,
};

/// Extract a tar archive to a destination directory
pub fn extractArchive(
    allocator: std.mem.Allocator,
    archive_path: []const u8,
    dest_dir: []const u8,
    format: []const u8,
) !void {
    // ANSI codes: dim + italic
    const dim_italic = "\x1b[2;3m";
    const reset = "\x1b[0m";

    // Show extracting message
    std.debug.print("{s}  extracting...{s}", .{ dim_italic, reset });

    // Ensure destination directory exists
    try std.fs.cwd().makePath(dest_dir);

    // Determine extraction command based on format
    const result = if (std.mem.eql(u8, format, "tar.xz"))
        try std.process.Child.run(.{
            .allocator = allocator,
            .argv = &[_][]const u8{
                "tar",
                "-xJf",
                archive_path,
                "-C",
                dest_dir,
            },
        })
    else if (std.mem.eql(u8, format, "tar.gz"))
        try std.process.Child.run(.{
            .allocator = allocator,
            .argv = &[_][]const u8{
                "tar",
                "-xzf",
                archive_path,
                "-C",
                dest_dir,
            },
        })
    else
        return error.UnsupportedFormat;
    defer allocator.free(result.stdout);
    defer allocator.free(result.stderr);

    if (result.term.Exited != 0) {
        // Clear the extracting message
        std.debug.print("\r                    \r", .{});
        std.debug.print("Extraction failed: {s}\n", .{result.stderr});
        return error.ExtractionFailed;
    }

    // Clear the extracting message
    std.debug.print("\r                    \r", .{});
}

/// Check if a file is a valid archive
pub fn isValidArchive(path: []const u8) bool {
    return std.mem.endsWith(u8, path, ".tar.gz") or
        std.mem.endsWith(u8, path, ".tar.xz") or
        std.mem.endsWith(u8, path, ".tgz");
}

test "isValidArchive" {
    try std.testing.expect(isValidArchive("package.tar.gz"));
    try std.testing.expect(isValidArchive("package.tar.xz"));
    try std.testing.expect(isValidArchive("package.tgz"));
    try std.testing.expect(!isValidArchive("package.zip"));
    try std.testing.expect(!isValidArchive("package.txt"));
}
