//! Binary archives are immutable; permission preparation belongs to their
//! private extraction, never an installed package or a shared cache.
const std = @import("std");
const builtin = @import("builtin");
const io_helper = @import("../io_helper.zig");
const extractor = @import("extractor.zig");

pub const Extraction = struct {
    allocator: std.mem.Allocator,
    root: []const u8,
    payload: []const u8,
    verified: bool = false,
    root_inode: ?std.Io.File.INode = null,

    pub fn init(allocator: std.mem.Allocator, parent: []const u8) !Extraction {
        try io_helper.makePath(parent);
        for (0..8) |_| {
            var random: [16]u8 = undefined;
            io_helper.randomBytes(&random);
            const root = try std.fmt.allocPrint(allocator, "{s}/extract-{x}-{x}", .{
                parent, std.mem.readInt(u64, random[0..8], .little), std.mem.readInt(u64, random[8..16], .little),
            });
            io_helper.cwd().createDir(io_helper.io, root, if (builtin.os.tag == .windows) .default_dir else io_helper.File.Permissions.fromMode(0o700)) catch |err| {
                allocator.free(root);
                if (err == error.PathAlreadyExists) continue;
                return err;
            };
            errdefer {
                io_helper.deleteTree(root) catch {};
                allocator.free(root);
            }
            const private_metadata = try io_helper.cwd().statFile(io_helper.io, root, .{ .follow_symlinks = false });
            const payload = try std.fs.path.join(allocator, &.{ root, "extracted" });
            return .{ .allocator = allocator, .root = root, .payload = payload, .root_inode = private_metadata.inode };
        }
        return error.ExtractionDirectoryCollision;
    }

    pub fn deinit(self: *Extraction) void {
        io_helper.deleteTree(self.root) catch {};
        self.allocator.free(self.payload);
        self.allocator.free(self.root);
    }

    pub fn extractVerified(self: *Extraction, archive: []const u8, format: []const u8, url: ?[]const u8, verbose: bool) !void {
        self.verified = false;
        // A poisoned archive retry starts with a fresh payload in this same
        // exclusively created directory, not another install's temporary path.
        io_helper.deleteTree(self.payload) catch {};
        try io_helper.makePath(self.payload);
        try extractor.extractArchiveWithVerification(self.allocator, archive, self.payload, format, url, verbose);
        if (builtin.os.tag != .windows) try prepareTree(self.allocator, self.payload);
        self.verified = true;
    }

    /// A move is permitted only for a real directory physically contained in
    /// this fresh, exclusively created and successfully verified extraction.
    /// Shared installed/cache prefixes never receive this ownership capability.
    pub fn validateOwnedPackage(self: *const Extraction, source: []const u8) !void {
        if (!self.verified) return error.UnverifiedExtraction;
        const private_metadata = try io_helper.cwd().statFile(io_helper.io, self.root, .{ .follow_symlinks = false });
        if (private_metadata.kind != .directory or self.root_inode == null or private_metadata.inode != self.root_inode.?)
            return error.UnownedPackageSource;
        if (comptime builtin.os.tag != .windows) {
            if (private_metadata.permissions.toMode() & 0o777 != 0o700)
                return error.UnownedPackageSource;
        }
        const payload_metadata = try io_helper.cwd().statFile(io_helper.io, self.payload, .{ .follow_symlinks = false });
        if (payload_metadata.kind != .directory) return error.UnownedPackageSource;
        const metadata = try io_helper.cwd().statFile(io_helper.io, source, .{ .follow_symlinks = false });
        if (metadata.kind != .directory) return error.UnownedPackageSource;
        var root_buffer: [std.fs.max_path_bytes]u8 = undefined;
        var source_buffer: [std.fs.max_path_bytes]u8 = undefined;
        var private_buffer: [std.fs.max_path_bytes]u8 = undefined;
        const private_len = try io_helper.cwd().realPathFile(io_helper.io, self.root, &private_buffer);
        const root_len = try io_helper.cwd().realPathFile(io_helper.io, self.payload, &root_buffer);
        const source_len = try io_helper.cwd().realPathFile(io_helper.io, source, &source_buffer);
        const root = root_buffer[0..root_len];
        if (!physicallyWithin(private_buffer[0..private_len], root) or private_len == root_len)
            return error.UnownedPackageSource;
        const physical_source = source_buffer[0..source_len];
        if (!physicallyWithin(root, physical_source))
            return error.UnownedPackageSource;
    }
};

fn physicallyWithin(root: []const u8, path: []const u8) bool {
    if (std.mem.eql(u8, root, path)) return true;
    if (path.len <= root.len or !std.mem.startsWith(u8, path, root)) return false;
    return path[root.len] == '/' or (builtin.os.tag == .windows and path[root.len] == '\\');
}

fn chmod(path: []const u8, mode: u32) !void {
    var buffer: [std.fs.max_path_bytes:0]u8 = undefined;
    if (path.len >= buffer.len) return error.NameTooLong;
    @memcpy(buffer[0..path.len], path);
    buffer[path.len] = 0;
    if (std.c.chmod(&buffer, @intCast(mode)) != 0) return error.PackagePermissionPreparationFailed;
}

/// Only called after extraction verification, inside an exclusively created
/// 0700 directory. Never follows symbolic links or changes a linked file's
/// permissions: that could change an inode outside the private extraction.
fn prepareTree(allocator: std.mem.Allocator, path: []const u8) !void {
    const metadata = try io_helper.cwd().statFile(io_helper.io, path, .{ .follow_symlinks = false });
    switch (metadata.kind) {
        .directory, .file => {
            const mode = metadata.permissions.toMode() & 0o7777;
            const prepared = (mode & 0o777) | @as(u32, if (metadata.kind == .directory) 0o700 else 0o400);
            if (prepared != mode) {
                if (metadata.kind == .file and metadata.nlink != 1) return error.UnsafeArchiveHardLink;
                try chmod(path, prepared);
            }
            if (metadata.kind == .file) return;
            var directory = try io_helper.openDirAbsoluteForIteration(path);
            defer directory.close();
            var entries = directory.iterate();
            while (try entries.next()) |entry| {
                const child = try std.fs.path.join(allocator, &.{ path, entry.name });
                defer allocator.free(child);
                try prepareTree(allocator, child);
            }
        },
        .sym_link => {}, // Preserve the link itself; never traverse its target.
        else => return error.UnsupportedArchiveEntry,
    }
}

/// A legacy cache may contain execute-only helpers. Such a tree cannot be
/// copied by its unprivileged owner. Reject it without chmod or deletion;
/// the installer can obtain the original verified archive into private staging.
pub fn canMaterializeTree(allocator: std.mem.Allocator, path: []const u8) bool {
    return canMaterializeEntry(allocator, path, false);
}

fn canMaterializeEntry(allocator: std.mem.Allocator, path: []const u8, allow_link: bool) bool {
    const metadata = io_helper.cwd().statFile(io_helper.io, path, .{ .follow_symlinks = false }) catch return false;
    switch (metadata.kind) {
        .file => {
            const file = io_helper.openFileAbsolute(path, .{}) catch return false;
            file.close(io_helper.io);
            return true;
        },
        .directory => {
            var directory = io_helper.openDirAbsoluteForIteration(path) catch return false;
            defer directory.close();
            var entries = directory.iterate();
            while (entries.next() catch return false) |entry| {
                const child = std.fs.path.join(allocator, &.{ path, entry.name }) catch return false;
                defer allocator.free(child);
                if (!canMaterializeEntry(allocator, child, true)) return false;
            }
            return true;
        },
        .sym_link => return allow_link,
        else => return false,
    }
}

test "verified execute-only archive becomes copyable without changing its bytes or ordinary modes" {
    if (builtin.os.tag == .windows) return error.SkipZigTest;
    const allocator = std.testing.allocator;
    var tmp = std.testing.tmpDir(.{});
    defer tmp.cleanup();
    var root_buffer: [std.fs.max_path_bytes]u8 = undefined;
    const root_len = try tmp.dir.realPathFile(io_helper.io, ".", &root_buffer);
    const root = root_buffer[0..root_len];
    try tmp.dir.writeFile(io_helper.io, .{ .sub_path = "original.tar.gz", .data = @embedFile("fixtures/execute-only-package.tar.gz") });
    const archive = try std.fs.path.join(allocator, &.{ root, "original.tar.gz" });
    defer allocator.free(archive);
    const before = try extractor.computeChecksum(allocator, archive);
    defer allocator.free(before);
    try std.testing.expectEqualStrings("c45b533a6ec769477f6b2ccaa1c13e9fdd972fcc898b013131a604b36ca45759", before);
    var extraction = try Extraction.init(allocator, root);
    defer extraction.deinit();
    const private = try io_helper.cwd().statFile(io_helper.io, extraction.root, .{});
    try std.testing.expectEqual(@as(u32, 0o700), private.permissions.toMode() & 0o7777);
    try extraction.extractVerified(archive, "tar.gz", null, false);
    try std.testing.expect(canMaterializeTree(allocator, extraction.payload));
    for ([_]struct { name: []const u8, mode: u32 }{
        .{ .name = "libexec/dbus-daemon-launch-helper", .mode = 0o510 },
        .{ .name = "bin/check", .mode = 0o751 },
        .{ .name = "share/data", .mode = 0o644 },
    }) |expected| {
        const file = try std.fs.path.join(allocator, &.{ extraction.payload, expected.name });
        defer allocator.free(file);
        const metadata = try io_helper.cwd().statFile(io_helper.io, file, .{ .follow_symlinks = false });
        try std.testing.expectEqual(expected.mode, metadata.permissions.toMode() & 0o7777);
    }
    const link = try std.fs.path.join(allocator, &.{ extraction.payload, "bin/helper" });
    defer allocator.free(link);
    const target = try io_helper.readLinkAlloc(allocator, link);
    defer allocator.free(target);
    try std.testing.expectEqualStrings("../libexec/dbus-daemon-launch-helper", target);
    const after = try extractor.computeChecksum(allocator, archive);
    defer allocator.free(after);
    try std.testing.expectEqualStrings(before, after);
}

test "legacy cache refusal and private preparation never change outside link targets" {
    if (builtin.os.tag == .windows) return error.SkipZigTest;
    const allocator = std.testing.allocator;
    var tmp = std.testing.tmpDir(.{});
    defer tmp.cleanup();
    var root_buffer: [std.fs.max_path_bytes]u8 = undefined;
    const root_len = try tmp.dir.realPathFile(io_helper.io, ".", &root_buffer);
    const root = root_buffer[0..root_len];
    try tmp.dir.writeFile(io_helper.io, .{ .sub_path = "outside", .data = "untouched" });
    const outside = try std.fs.path.join(allocator, &.{ root, "outside" });
    defer allocator.free(outside);
    try chmod(outside, 0o110);
    defer chmod(outside, 0o600) catch {};
    // This must run as the actual unprivileged test user, not a root process
    // whose DAC override would conceal the original regression.
    const readable = io_helper.openFileAbsolute(outside, .{});
    if (readable) |file| {
        file.close(io_helper.io);
        return error.NonRootFixtureRequired;
    } else |err| try std.testing.expect(err == error.AccessDenied or err == error.PermissionDenied);
    try std.testing.expect(!canMaterializeTree(allocator, outside));
    var extraction = try Extraction.init(allocator, root);
    defer extraction.deinit();
    try io_helper.makePath(extraction.payload);
    const link = try std.fs.path.join(allocator, &.{ extraction.payload, "outside-link" });
    defer allocator.free(link);
    try io_helper.symLink(outside, link);
    try std.testing.expect(!canMaterializeTree(allocator, link));
    try prepareTree(allocator, extraction.payload);
    const metadata = try io_helper.cwd().statFile(io_helper.io, outside, .{ .follow_symlinks = false });
    try std.testing.expectEqual(@as(u32, 0o110), metadata.permissions.toMode() & 0o7777);
    const target = try io_helper.readLinkAlloc(allocator, link);
    defer allocator.free(target);
    try std.testing.expectEqualStrings(outside, target);
    const hard_link = try std.fs.path.join(allocator, &.{ extraction.payload, "outside-hard-link" });
    defer allocator.free(hard_link);
    const outside_z = try io_helper.dupeZ(allocator, u8, outside);
    defer allocator.free(outside_z);
    const hard_link_z = try io_helper.dupeZ(allocator, u8, hard_link);
    defer allocator.free(hard_link_z);
    if (std.c.link(outside_z, hard_link_z) != 0) return error.HardLinkFixtureFailed;
    try std.testing.expectError(error.UnsafeArchiveHardLink, prepareTree(allocator, extraction.payload));
    const unchanged = try io_helper.cwd().statFile(io_helper.io, outside, .{ .follow_symlinks = false });
    try std.testing.expectEqual(@as(u32, 0o110), unchanged.permissions.toMode() & 0o7777);
}
