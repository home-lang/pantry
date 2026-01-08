const std = @import("std");
const io_helper = @import("../io_helper.zig");

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
    return extractArchiveQuiet(allocator, archive_path, dest_dir, format, false);
}

/// Extract a tar archive with optional quiet mode
pub fn extractArchiveQuiet(
    allocator: std.mem.Allocator,
    archive_path: []const u8,
    dest_dir: []const u8,
    format: []const u8,
    _: bool, // quiet parameter unused now
) !void {
    // Ensure destination directory exists
    try io_helper.makePath(dest_dir);

    // Determine extraction command based on format
    const result = if (std.mem.eql(u8, format, "tar.xz"))
        try io_helper.childRun(allocator, &[_][]const u8{
            "tar",
            "-xJf",
            archive_path,
            "-C",
            dest_dir,
            "--no-same-owner",
            "--no-same-permissions",
        })
    else if (std.mem.eql(u8, format, "tar.gz"))
        try io_helper.childRun(allocator, &[_][]const u8{
            "tar",
            "-xzf",
            archive_path,
            "-C",
            dest_dir,
            "--no-same-owner",
            "--no-same-permissions",
        })
    else
        return error.UnsupportedFormat;
    defer allocator.free(result.stdout);
    defer allocator.free(result.stderr);

    if (result.term.Exited != 0) {
        std.debug.print("Extraction failed: {s}\n", .{result.stderr});
        return error.ExtractionFailed;
    }
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
