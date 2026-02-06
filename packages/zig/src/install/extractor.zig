const std = @import("std");
const io_helper = @import("../io_helper.zig");
const style = @import("../cli/style.zig");

pub const ExtractError = error{
    ExtractionFailed,
    UnsupportedFormat,
    InvalidArchive,
    ChecksumMismatch,
    CorruptArchive,
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

    if (result.term.exited != 0) {
        style.print("Extraction failed: {s}\n", .{result.stderr});
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

/// Verify archive integrity before extraction
/// Returns true if archive is valid, false otherwise
pub fn verifyArchiveIntegrity(
    allocator: std.mem.Allocator,
    archive_path: []const u8,
    format: []const u8,
) !bool {
    // Try to list archive contents to verify it's not corrupt
    const result = if (std.mem.eql(u8, format, "tar.xz"))
        try io_helper.childRun(allocator, &[_][]const u8{
            "tar",
            "-tJf",
            archive_path,
        })
    else if (std.mem.eql(u8, format, "tar.gz"))
        try io_helper.childRun(allocator, &[_][]const u8{
            "tar",
            "-tzf",
            archive_path,
        })
    else
        return error.UnsupportedFormat;

    defer allocator.free(result.stdout);
    defer allocator.free(result.stderr);

    if (result.term.exited != 0) {
        return false;
    }

    // Also verify archive has at least some contents
    return result.stdout.len > 0;
}

/// Compute SHA256 checksum of a file
pub fn computeChecksum(allocator: std.mem.Allocator, file_path: []const u8) ![]const u8 {
    // Use shasum command (available on macOS and Linux)
    const result = try io_helper.childRun(allocator, &[_][]const u8{
        "shasum",
        "-a",
        "256",
        file_path,
    });
    defer allocator.free(result.stderr);

    if (result.term.exited != 0) {
        allocator.free(result.stdout);
        return error.ExtractionFailed;
    }

    // Output format is: "checksum  filename\n"
    // Extract just the checksum (first 64 chars)
    if (result.stdout.len < 64) {
        allocator.free(result.stdout);
        return error.ExtractionFailed;
    }

    const checksum = try allocator.dupe(u8, result.stdout[0..64]);
    allocator.free(result.stdout);
    return checksum;
}

/// Try to fetch and verify checksum from a sidecar .sha256 file
/// Returns true if verified successfully, false if no checksum file found
pub fn tryVerifyWithSidecarChecksum(
    allocator: std.mem.Allocator,
    archive_path: []const u8,
    archive_url: []const u8,
) !bool {
    // Build checksum URL by appending .sha256 to the archive URL
    const checksum_url = try std.fmt.allocPrint(allocator, "{s}.sha256", .{archive_url});
    defer allocator.free(checksum_url);

    // Try to download checksum file to temp location
    const checksum_file = try std.fmt.allocPrint(allocator, "{s}.sha256", .{archive_path});
    defer allocator.free(checksum_file);

    // Use curl to fetch checksum (silent, fail quietly if not found)
    const result = try io_helper.childRun(allocator, &[_][]const u8{
        "curl",
        "-sfL",
        "-o",
        checksum_file,
        checksum_url,
    });
    defer allocator.free(result.stdout);
    defer allocator.free(result.stderr);

    if (result.term.exited != 0) {
        // No checksum file available
        return false;
    }

    // Read expected checksum from file (checksum files are small, 256 bytes is plenty)
    const checksum_content = io_helper.readFileAlloc(allocator, checksum_file, 256) catch {
        return false;
    };
    defer allocator.free(checksum_content);

    // Parse checksum (format: "checksum  filename" or just "checksum")
    const expected_checksum = blk: {
        const trimmed = std.mem.trim(u8, checksum_content, " \n\r\t");
        if (std.mem.indexOf(u8, trimmed, " ")) |space_pos| {
            break :blk trimmed[0..space_pos];
        }
        break :blk trimmed;
    };

    if (expected_checksum.len != 64) {
        // Invalid checksum format
        return false;
    }

    // Compute actual checksum
    const actual_checksum = try computeChecksum(allocator, archive_path);
    defer allocator.free(actual_checksum);

    // Compare
    if (!std.mem.eql(u8, actual_checksum, expected_checksum)) {
        style.print("  ✗ Checksum mismatch!\n", .{});
        style.print("    Expected: {s}\n", .{expected_checksum});
        style.print("    Got:      {s}\n", .{actual_checksum});
        return error.ChecksumMismatch;
    }

    return true;
}

/// Extract archive with optional verification
/// If archive_url is provided, attempts to verify checksum from sidecar file
/// Always validates archive integrity before extraction
pub fn extractArchiveWithVerification(
    allocator: std.mem.Allocator,
    archive_path: []const u8,
    dest_dir: []const u8,
    format: []const u8,
    archive_url: ?[]const u8,
    verbose: bool,
) !void {
    // Step 1: Verify archive integrity first
    const is_valid = try verifyArchiveIntegrity(allocator, archive_path, format);
    if (!is_valid) {
        if (verbose) {
            style.print("  ✗ Archive appears to be corrupt\n", .{});
        }
        return error.CorruptArchive;
    }

    // Step 2: Try to verify checksum if URL is provided
    if (archive_url) |url| {
        const verified = tryVerifyWithSidecarChecksum(allocator, archive_path, url) catch |err| blk: {
            if (err == error.ChecksumMismatch) {
                return err;
            }
            // Other errors (like no checksum file) - continue with extraction
            break :blk false;
        };

        if (verified and verbose) {
            style.print("  ✓ Checksum verified\n", .{});
        }
    }

    // Step 3: Extract the archive
    try extractArchiveQuiet(allocator, archive_path, dest_dir, format, !verbose);
}
