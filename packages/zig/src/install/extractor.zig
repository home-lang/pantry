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

/// Verbose diagnostics gate — mirrors `PANTRY_VERBOSE=1`/`PANTRY_DEBUG=1`.
/// Kept inline (not @import of lib) to avoid a dependency cycle through lib.zig.
fn verboseExtract() bool {
    return @import("../cli/diagnostics.zig").enabled(false);
}

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

    // For .zip archives, use platform-specific unzip
    if (std.mem.eql(u8, format, "zip")) {
        return extractZipArchive(allocator, archive_path, dest_dir);
    }

    // Use system tar as primary extraction method — it handles all entry types
    // (symlinks, hard links, large archives) reliably. Zig's native tar takes
    // over when system tar is unavailable or fails.
    var system_tar_stderr: ?[]u8 = null;
    defer if (system_tar_stderr) |s| allocator.free(s);
    const system_tar_ok = blk: {
        extractWithSystemTar(allocator, archive_path, dest_dir, &system_tar_stderr) catch break :blk false;
        break :blk true;
    };

    if (system_tar_ok) return;

    // A tar that ran and failed says why (a full disk, a damaged archive), and
    // that reason is the one to act on, so it is printed whether or not the
    // native extractor then manages: falling back used to bury it under the
    // fallback's own error.
    if (system_tar_stderr) |s| {
        if (std.mem.startsWith(u8, s, "spawn failed")) {
            if (verboseExtract()) style.print("  [pantry:extract] system tar unavailable ({s}), using native extractor\n", .{s});
        } else {
            style.printForced("  [pantry:extract] tar failed on {s}: {s}\n", .{ archive_path, std.mem.trim(u8, s, " \t\r\n") });
        }
    }

    return extractNative(allocator, archive_path, dest_dir, format);
}

/// Zig's own tar, streaming the archive from disk: an archive of any size
/// extracts (LLVM's is 1.7 GB), and the real failure, NoSpaceLeft included,
/// reaches the caller.
fn extractNative(allocator: std.mem.Allocator, archive_path: []const u8, dest_dir: []const u8, format: []const u8) !void {
    const file = try io_helper.cwd().openFile(io_helper.io, archive_path, .{ .mode = .read_only });
    defer file.close(io_helper.io);
    var file_buf: [65536]u8 = undefined;
    var file_reader = file.readerStreaming(io_helper.io, &file_buf);

    var dest = try io_helper.cwd().openDir(io_helper.io, dest_dir, .{});
    defer dest.close(io_helper.io);

    if (std.mem.eql(u8, format, "tar.gz")) {
        var window_buf: [65536]u8 = undefined;
        var decompressor: std.compress.flate.Decompress = .init(&file_reader.interface, .gzip, &window_buf);
        try std.tar.pipeToFileSystem(io_helper.io, dest, &decompressor.reader, .{});
    } else if (std.mem.eql(u8, format, "tar.xz")) {
        const xz_buf = try allocator.alloc(u8, 1 << 16);
        var decompressor = std.compress.xz.Decompress.init(&file_reader.interface, allocator, xz_buf) catch {
            allocator.free(xz_buf);
            return error.ExtractionFailed;
        };
        defer decompressor.deinit();
        try std.tar.pipeToFileSystem(io_helper.io, dest, &decompressor.reader, .{});
    } else {
        return error.UnsupportedFormat;
    }
}

/// Fall back to system tar command for extraction.
/// On non-zero exit the captured stderr is returned via `stderr_out` so the caller
/// can include it in diagnostics (ownership transferred to caller — must free).
/// Extract a gzipped tarball from memory, stripping `strip_components` leading
/// path components — the layout npm and pantry binary tarballs both use.
///
/// Zig's `std.tar` is the primary path because it needs no subprocess, but it
/// does not manage every archive: a 183MB pantry package (573MB unpacked)
/// failed there while `/usr/bin/tar` handled it without complaint. So this
/// falls back to system tar exactly as `extractArchiveQuiet` does, and for the
/// same stated reason — system tar "handles all entry types (symlinks, hard
/// links, large archives) reliably".
///
/// On failure the caller gets the real error rather than a bare
/// `ExtractionFailed`: the previous `catch {}` discarded it, so an install that
/// died here reported only "Failed to extract <pkg> — skipping" with nothing
/// to act on.
pub fn extractGzipFromMemory(
    allocator: std.mem.Allocator,
    bytes: []const u8,
    dest_dir: []const u8,
    strip_components: u32,
) !void {
    var dest = try io_helper.cwd().openDir(io_helper.io, dest_dir, .{});
    defer dest.close(io_helper.io);

    var input_reader: std.Io.Reader = .fixed(bytes);
    var window_buf: [65536]u8 = undefined;
    var decompressor: std.compress.flate.Decompress = .init(&input_reader, .gzip, &window_buf);
    // Diagnostics tolerate duplicate tar entries (some npm packages list the
    // same file twice, e.g. ts-mocker's dist/bin/cli.js).
    var tar_diagnostics: std.tar.Diagnostics = .{ .allocator = allocator };
    defer tar_diagnostics.deinit();

    const native_err = blk: {
        std.tar.pipeToFileSystem(io_helper.io, dest, &decompressor.reader, .{
            .strip_components = strip_components,
            .diagnostics = &tar_diagnostics,
        }) catch |err| break :blk err;
        return;
    };

    if (verboseExtract()) {
        style.print(
            "  [pantry:extract] native tar failed ({s}) on {d} bytes, falling back to system tar\n",
            .{ @errorName(native_err), bytes.len },
        );
    }

    // Spill to a temp file so system tar has something to read, then let it do
    // the work it is better at.
    const tmp_path = try std.fmt.allocPrint(allocator, "{s}/.pantry-extract.tar.gz", .{dest_dir});
    defer allocator.free(tmp_path);
    {
        const tmp_file = io_helper.cwd().createFile(io_helper.io, tmp_path, .{}) catch return native_err;
        defer tmp_file.close(io_helper.io);
        io_helper.writeAllToFile(tmp_file, bytes) catch return native_err;
    }
    defer io_helper.deleteFile(tmp_path) catch {};

    const strip_arg = try std.fmt.allocPrint(allocator, "--strip-components={d}", .{strip_components});
    defer allocator.free(strip_arg);
    const result = io_helper.childRun(allocator, &[_][]const u8{
        "/usr/bin/tar", "xzf", tmp_path, "-C", dest_dir, strip_arg,
    }) catch return native_err;
    defer allocator.free(result.stdout);
    defer allocator.free(result.stderr);

    const ok = result.term == .exited and result.term.exited == 0;
    if (!ok) {
        if (verboseExtract()) {
            style.print("  [pantry:extract] system tar stderr:\n{s}\n", .{result.stderr});
        }
        return native_err;
    }
}

fn extractWithSystemTar(
    allocator: std.mem.Allocator,
    archive_path: []const u8,
    dest_dir: []const u8,
    stderr_out: *?[]u8,
) !void {
    const result = io_helper.childRun(allocator, &[_][]const u8{
        "/usr/bin/tar", "xf", archive_path, "-C", dest_dir,
    }) catch |err| {
        // tar binary not present — no stderr to surface, treat as unavailable
        stderr_out.* = std.fmt.allocPrint(allocator, "spawn failed: {s}", .{@errorName(err)}) catch null;
        return error.ExtractionFailed;
    };
    defer allocator.free(result.stdout);

    if (result.term != .exited or result.term.exited != 0) {
        // Transfer stderr ownership to caller for diagnostics
        stderr_out.* = result.stderr;
        return error.ExtractionFailed;
    }
    allocator.free(result.stderr);
}

/// Check if a file is a valid archive
pub fn isValidArchive(path: []const u8) bool {
    return std.mem.endsWith(u8, path, ".tar.gz") or
        std.mem.endsWith(u8, path, ".tar.xz") or
        std.mem.endsWith(u8, path, ".tgz");
}

test "the native extractor streams a gzipped tar from disk" {
    if (@import("builtin").os.tag == .windows) return error.SkipZigTest;
    const allocator = std.testing.allocator;
    var temp = std.testing.tmpDir(.{});
    defer temp.cleanup();
    try temp.dir.createDirPath(io_helper.io, "src/pkg/bin");
    try temp.dir.writeFile(io_helper.io, .{ .sub_path = "src/pkg/bin/tool", .data = "#!/bin/sh\necho ok\n" });
    try temp.dir.createDirPath(io_helper.io, "out");
    var root_buf: [std.fs.max_path_bytes]u8 = undefined;
    const root_len = try temp.dir.realPathFile(io_helper.io, ".", &root_buf);
    const root = root_buf[0..root_len];
    const archive = try std.fmt.allocPrint(allocator, "{s}/pkg.tar.gz", .{root});
    defer allocator.free(archive);
    const src = try std.fmt.allocPrint(allocator, "{s}/src", .{root});
    defer allocator.free(src);
    const out = try std.fmt.allocPrint(allocator, "{s}/out", .{root});
    defer allocator.free(out);
    const made = try io_helper.childRun(allocator, &[_][]const u8{ "/usr/bin/tar", "czf", archive, "-C", src, "pkg" });
    allocator.free(made.stdout);
    allocator.free(made.stderr);

    try extractNative(allocator, archive, out, "tar.gz");

    const data = try temp.dir.readFileAlloc(io_helper.io, "out/pkg/bin/tool", allocator, .limited(1024));
    defer allocator.free(data);
    try std.testing.expectEqualStrings("#!/bin/sh\necho ok\n", data);
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
        const n = io_helper.platformRead(file.handle, &buf) catch |err| {
            return err;
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

/// Extract a .zip archive using platform-appropriate tools.
/// Windows: PowerShell Expand-Archive. macOS/Linux: unzip command.
fn extractZipArchive(allocator: std.mem.Allocator, archive_path: []const u8, dest_dir: []const u8) !void {
    const builtin = @import("builtin");
    if (comptime builtin.os.tag == .windows) {
        // PowerShell: use separate arguments to avoid command injection
        _ = try io_helper.childRun(allocator, &[_][]const u8{
            "powershell",       "-NoProfile", "-Command",
            "Expand-Archive",   "-Path",      archive_path,
            "-DestinationPath", dest_dir,     "-Force",
        });
    } else {
        // Unix: unzip -o -q <zip> -d <dir>
        _ = try io_helper.childRun(allocator, &[_][]const u8{ "unzip", "-o", "-q", archive_path, "-d", dest_dir });
    }
}
