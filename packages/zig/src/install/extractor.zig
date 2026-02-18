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

/// Extract a tar archive with optional quiet mode (native Zig, no subprocess)
pub fn extractArchiveQuiet(
    allocator: std.mem.Allocator,
    archive_path: []const u8,
    dest_dir: []const u8,
    format: []const u8,
    _: bool, // quiet parameter unused now
) !void {
    // Ensure destination directory exists
    try io_helper.makePath(dest_dir);

    // Read archive into memory
    const data = try io_helper.readFileAlloc(allocator, archive_path, 500 * 1024 * 1024);
    defer allocator.free(data);

    // Open destination directory
    var dest = try io_helper.cwd().openDir(io_helper.io, dest_dir, .{});
    defer dest.close(io_helper.io);

    if (std.mem.eql(u8, format, "tar.gz")) {
        var input_reader: std.Io.Reader = .fixed(data);
        var window_buf: [65536]u8 = undefined;
        var decompressor: std.compress.flate.Decompress = .init(&input_reader, .gzip, &window_buf);
        std.tar.pipeToFileSystem(io_helper.io, dest, &decompressor.reader, .{}) catch {
            return error.ExtractionFailed;
        };
    } else if (std.mem.eql(u8, format, "tar.xz")) {
        var input_reader: std.Io.Reader = .fixed(data);
        const xz_buf = try allocator.alloc(u8, 1 << 16);
        var decompressor = std.compress.xz.Decompress.init(&input_reader, allocator, xz_buf) catch {
            return error.ExtractionFailed;
        };
        defer decompressor.deinit();
        std.tar.pipeToFileSystem(io_helper.io, dest, &decompressor.reader, .{}) catch {
            return error.ExtractionFailed;
        };
    } else {
        return error.UnsupportedFormat;
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

/// Verify archive integrity before extraction (native, no subprocess)
/// Checks magic bytes to verify the archive format is valid.
pub fn verifyArchiveIntegrity(
    _: std.mem.Allocator,
    archive_path: []const u8,
    format: []const u8,
) !bool {
    const file = io_helper.cwd().openFile(io_helper.io, archive_path, .{ .mode = .read_only }) catch return false;
    defer file.close(io_helper.io);

    var header: [6]u8 = undefined;
    const n = io_helper.platformRead(file.handle, &header) catch return false;
    if (n < 2) return false;

    if (std.mem.eql(u8, format, "tar.gz")) {
        // Gzip magic bytes: 0x1f 0x8b
        return header[0] == 0x1f and header[1] == 0x8b;
    } else if (std.mem.eql(u8, format, "tar.xz")) {
        // XZ magic bytes: 0xFD 0x37 0x7A 0x58 0x5A 0x00
        if (n < 6) return false;
        return std.mem.eql(u8, header[0..6], &[_]u8{ 0xFD, 0x37, 0x7A, 0x58, 0x5A, 0x00 });
    }

    return false;
}

/// Compute SHA256 checksum of a file using native Zig crypto (no subprocess)
pub fn computeChecksum(allocator: std.mem.Allocator, file_path: []const u8) ![]const u8 {
    const Sha256 = std.crypto.hash.sha2.Sha256;

    const file = try io_helper.cwd().openFile(io_helper.io, file_path, .{ .mode = .read_only });
    defer file.close(io_helper.io);

    var hasher = Sha256.init(.{});
    var buf: [65536]u8 = undefined; // 64KB read buffer
    while (true) {
        const n = io_helper.platformRead(file.handle, &buf) catch |err| switch (err) {
            error.WouldBlock => continue,
            else => return err,
        };
        if (n == 0) break;
        hasher.update(buf[0..n]);
    }

    var hash: [32]u8 = undefined;
    hasher.final(&hash);

    // Convert to hex string
    const hex_buf = std.fmt.bytesToHex(hash, .lower);
    return try allocator.dupe(u8, &hex_buf);
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

    // Download checksum file using native HTTP (no curl subprocess)
    io_helper.httpDownloadFile(allocator, checksum_url, checksum_file) catch {
        // No checksum file available (404 or network error)
        return false;
    };

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
