const std = @import("std");
const io_helper = @import("../../io_helper.zig");
const style = @import("../style.zig");
const common = @import("common.zig");
const CommandResult = common.CommandResult;

pub const PublishBinaryOptions = struct {
    domain: []const u8,
    version: []const u8,
    binary_path: []const u8,
    platform: ?[]const u8 = null,
    dry_run: bool = false,
};

/// Publish a native binary to the pantry S3 binary registry.
///
/// Usage from CI:
///   pantry publish:binary --domain craft-native.org --version 0.0.4 --binary ./release/craft-darwin-arm64
///
/// This uploads to: s3://pantry-registry/binaries/{domain}/{version}/{platform}/{domain-slug}-{version}.tar.gz
/// and updates:     s3://pantry-registry/binaries/{domain}/metadata.json
pub fn publishBinaryCommand(allocator: std.mem.Allocator, args: []const []const u8, options: PublishBinaryOptions) !CommandResult {
    _ = args;

    const bucket = io_helper.getenv("PANTRY_S3_BUCKET") orelse "pantry-registry";

    // Detect platform if not specified
    const platform = options.platform orelse comptime blk: {
        const os_str = switch (@import("builtin").os.tag) {
            .macos => "darwin",
            .linux => "linux",
            .windows => "windows",
            else => "linux",
        };
        const arch_str = switch (@import("builtin").cpu.arch) {
            .aarch64 => "arm64",
            .x86_64 => "x86-64",
            else => "x86-64",
        };
        break :blk os_str ++ "-" ++ arch_str;
    };

    // Sanitize domain for use in filenames (replace / with -)
    var domain_slug_buf: [256]u8 = undefined;
    var slug_len: usize = 0;
    for (options.domain) |c| {
        if (slug_len >= domain_slug_buf.len) break;
        domain_slug_buf[slug_len] = if (c == '/' or c == '@') '-' else c;
        slug_len += 1;
    }
    const domain_slug = domain_slug_buf[0..slug_len];

    style.print("Publishing native binary to pantry registry\n", .{});
    style.print("  Domain:   {s}\n", .{options.domain});
    style.print("  Version:  {s}\n", .{options.version});
    style.print("  Platform: {s}\n", .{platform});
    style.print("  Binary:   {s}\n", .{options.binary_path});
    style.print("  Bucket:   {s}\n\n", .{bucket});

    if (options.dry_run) {
        style.print("[dry-run] Would upload to: binaries/{s}/{s}/{s}/{s}-{s}.tar.gz\n", .{
            options.domain, options.version, platform, domain_slug, options.version,
        });
        return .{ .exit_code = 0 };
    }

    // Verify binary exists
    io_helper.accessAbsolute(options.binary_path, .{}) catch {
        const msg = try std.fmt.allocPrint(allocator, "Error: Binary not found: {s}", .{options.binary_path});
        return CommandResult.err(allocator, msg);
    };

    const tmp_dir = io_helper.getTempDir();

    // Create tarball from binary
    const tarball_name = try std.fmt.allocPrint(allocator, "{s}-{s}.tar.gz", .{ domain_slug, options.version });
    defer allocator.free(tarball_name);

    const tarball_path = try std.fs.path.join(allocator, &[_][]const u8{ tmp_dir, tarball_name });
    defer allocator.free(tarball_path);
    defer io_helper.deleteFile(tarball_path) catch {};

    style.print("  Creating tarball...\n", .{});
    const tar_result = try io_helper.childRun(allocator, &[_][]const u8{
        "tar", "-czf", tarball_path, "-C", std.fs.path.dirname(options.binary_path) orelse ".", std.fs.path.basename(options.binary_path),
    });
    defer allocator.free(tar_result.stdout);
    defer allocator.free(tar_result.stderr);

    if (tar_result.term != .exited or tar_result.term.exited != 0) {
        const msg = try std.fmt.allocPrint(allocator, "Error: Failed to create tarball: {s}", .{tar_result.stderr});
        return CommandResult.err(allocator, msg);
    }

    // Upload tarball to S3
    const s3_key = try std.fmt.allocPrint(allocator, "binaries/{s}/{s}/{s}/{s}-{s}.tar.gz", .{
        options.domain, options.version, platform, domain_slug, options.version,
    });
    defer allocator.free(s3_key);

    const s3_uri = try std.fmt.allocPrint(allocator, "s3://{s}/{s}", .{ bucket, s3_key });
    defer allocator.free(s3_uri);

    style.print("  Uploading to {s}...\n", .{s3_uri});
    const upload_result = try io_helper.childRun(allocator, &[_][]const u8{
        "aws", "s3", "cp", tarball_path, s3_uri, "--content-type", "application/gzip",
    });
    defer allocator.free(upload_result.stdout);
    defer allocator.free(upload_result.stderr);

    if (upload_result.term != .exited or upload_result.term.exited != 0) {
        const msg = try std.fmt.allocPrint(allocator, "Error: S3 upload failed: {s}", .{upload_result.stderr});
        return CommandResult.err(allocator, msg);
    }

    // Update metadata.json
    // Fetch existing metadata or create new
    const metadata_s3_key = try std.fmt.allocPrint(allocator, "binaries/{s}/metadata.json", .{options.domain});
    defer allocator.free(metadata_s3_key);

    const metadata_s3_uri = try std.fmt.allocPrint(allocator, "s3://{s}/{s}", .{ bucket, metadata_s3_key });
    defer allocator.free(metadata_s3_uri);

    const metadata_path = try std.fs.path.join(allocator, &[_][]const u8{ tmp_dir, "pantry-metadata.json" });
    defer allocator.free(metadata_path);
    defer io_helper.deleteFile(metadata_path) catch {};

    const metadata_updated_path = try std.fs.path.join(allocator, &[_][]const u8{ tmp_dir, "pantry-metadata-updated.json" });
    defer allocator.free(metadata_updated_path);
    defer io_helper.deleteFile(metadata_updated_path) catch {};

    // Try to fetch existing metadata
    style.print("  Fetching existing metadata...\n", .{});
    const fetch_result = io_helper.childRun(allocator, &[_][]const u8{
        "aws", "s3", "cp", metadata_s3_uri, metadata_path,
    }) catch null;
    if (fetch_result) |fr| {
        allocator.free(fr.stdout);
        allocator.free(fr.stderr);
    }

    // Use jq to update metadata (add/update this version+platform entry)
    // If no existing metadata, start from scratch
    const jq_input = if (fetch_result != null and fetch_result.?.term == .exited and fetch_result.?.term.exited == 0)
        metadata_path
    else
        "/dev/null";

    // Build jq expression to upsert version/platform
    const jq_expr = try std.fmt.allocPrint(
        allocator,
        "(if . == null then {{\"versions\": {{}}}} else . end) | .versions[\"{s}\"].platforms[\"{s}\"].tarball = \"{s}\"",
        .{ options.version, platform, s3_key },
    );
    defer allocator.free(jq_expr);

    style.print("  Updating metadata...\n", .{});
    const jq_result = try io_helper.childRun(allocator, &[_][]const u8{
        "jq", jq_expr, jq_input,
    });
    defer allocator.free(jq_result.stderr);

    if (jq_result.term != .exited or jq_result.term.exited != 0) {
        allocator.free(jq_result.stdout);
        const msg = try std.fmt.allocPrint(allocator, "Error: Failed to update metadata: {s}", .{jq_result.stderr});
        return CommandResult.err(allocator, msg);
    }

    // Write updated metadata and upload
    const meta_file = try io_helper.cwd().createFile(io_helper.io, metadata_updated_path, .{});
    try io_helper.writeAllToFile(meta_file, jq_result.stdout);
    meta_file.close(io_helper.io);
    allocator.free(jq_result.stdout);

    const meta_upload_result = try io_helper.childRun(allocator, &[_][]const u8{
        "aws", "s3", "cp", metadata_updated_path, metadata_s3_uri, "--content-type", "application/json",
    });
    defer allocator.free(meta_upload_result.stdout);
    defer allocator.free(meta_upload_result.stderr);

    if (meta_upload_result.term != .exited or meta_upload_result.term.exited != 0) {
        const msg = try std.fmt.allocPrint(allocator, "Error: Failed to upload metadata: {s}", .{meta_upload_result.stderr});
        return CommandResult.err(allocator, msg);
    }

    style.print("\n✓ Published {s}@{s} ({s}) to pantry registry\n", .{
        options.domain, options.version, platform,
    });

    return .{ .exit_code = 0 };
}
