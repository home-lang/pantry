//! Transactional publication of verified native packages. Only a fresh
//! Extraction capability authorizes consuming a source directory.
const std = @import("std");
const builtin = @import("builtin");
const io_helper = @import("../io_helper.zig");
const staging = @import("verified_staging.zig");
const style = @import("../cli/style.zig");

pub const Source = union(enum) {
    shared: []const u8,
    exclusive: struct { extraction: *const staging.Extraction, path: []const u8 },

    pub fn path(self: Source) []const u8 {
        return switch (self) {
            .shared => |value| value,
            .exclusive => |value| value.path,
        };
    }
};

pub const Outcome = enum { moved, copied, cross_device_copy };

/// Operations are specialized at compile time. Tests inject filesystem
/// failures into the real transaction without exposing runtime bypass flags.
pub fn publish(allocator: std.mem.Allocator, source: Source, destination: []const u8, validation: anytype, operations: anytype) !Outcome {
    switch (source) {
        .exclusive => |owned| try owned.extraction.validateOwnedPackage(owned.path),
        .shared => {},
    }
    if (!validation.check(source.path())) return error.InvalidPackageSource;

    // Candidate and backup share the destination's filesystem. Each invocation
    // owns its private 0700 root; no other install's ".partial" is deleted.
    const transaction = try staging.Extraction.init(allocator, std.fs.path.dirname(destination) orelse ".");
    defer allocator.free(transaction.root);
    defer allocator.free(transaction.payload);
    const candidate = transaction.payload;
    var retain_for_recovery = false;
    var cleaned = false;
    defer {
        if (!retain_for_recovery and !cleaned) {
            removeOwnedTree(allocator, transaction.root) catch |err|
                style.printForced("  [pantry:materialize] staging cleanup failed ({s}): {s}\n", .{ @errorName(err), transaction.root });
        }
    }
    const previous = try std.fs.path.join(allocator, &.{ transaction.root, "previous" });
    defer allocator.free(previous);

    var outcome: Outcome = .copied;
    switch (source) {
        .shared => try operations.copy(source.path(), candidate),
        .exclusive => {
            operations.rename(source.path(), candidate) catch |err| {
                // Never turn permissions, ENOSPC, cancellation, or an unknown
                // rename failure into a second full expanded tree.
                if (err != error.CrossDevice) return err;
                try operations.copy(source.path(), candidate);
                outcome = .cross_device_copy;
            };
            if (outcome != .cross_device_copy) outcome = .moved;
        },
    }
    if (!validation.check(candidate)) return error.InvalidPackageMaterialization;

    const had_previous = if (io_helper.cwd().statFile(io_helper.io, destination, .{ .follow_symlinks = false })) |_|
        true
    else |err| switch (err) {
        error.FileNotFound => false,
        else => return err,
    };
    if (had_previous) try operations.rename(destination, previous);

    operations.rename(candidate, destination) catch |err| {
        if (had_previous) {
            operations.rename(previous, destination) catch |rollback_error| {
                // The old installation must survive even if the filesystem
                // refuses rollback. Do not let deferred cleanup destroy it.
                retain_for_recovery = true;
                style.printForced("  [pantry:materialize] commit {s}; rollback {s}; previous package retained at {s}\n", .{
                    @errorName(err), @errorName(rollback_error), previous,
                });
                return error.PackageRollbackFailed;
            };
        }
        return err;
    };
    try removeOwnedTree(allocator, transaction.root);
    cleaned = true;
    return outcome;
}

fn chmodDirectory(path: []const u8, mode: u32) !void {
    if (comptime builtin.os.tag == .windows) return;
    var buffer: [std.fs.max_path_bytes:0]u8 = undefined;
    if (path.len >= buffer.len) return error.NameTooLong;
    @memcpy(buffer[0..path.len], path);
    buffer[path.len] = 0;
    if (std.c.chmod(&buffer, @intCast(mode)) != 0) return error.PackagePermissionPreparationFailed;
}

/// Copying preserves ordinary directory modes as well as file modes. Apply
/// them after copying children so read-only directories can be materialized.
pub fn preserveDirectoryPermissions(source: []const u8, destination: []const u8) !void {
    if (comptime builtin.os.tag == .windows) return;
    const metadata = try io_helper.cwd().statFile(io_helper.io, source, .{ .follow_symlinks = false });
    try chmodDirectory(destination, metadata.permissions.toMode() & 0o777);
}

/// Cleanup is confined to the transaction's owned tree. Only directory modes
/// are prepared, without traversing links or changing linked file inodes.
fn prepareOwnedDirectories(buffer: []u8, length: usize) !void {
    const path = buffer[0..length];
    const metadata = io_helper.cwd().statFile(io_helper.io, path, .{ .follow_symlinks = false }) catch |err| {
        if (err == error.FileNotFound) return;
        return err;
    };
    if (metadata.kind != .directory) return;
    try chmodDirectory(path, (metadata.permissions.toMode() & 0o777) | 0o700);
    var directory = try io_helper.openDirAbsoluteForIteration(path);
    defer directory.close();
    var iterator = directory.iterate();
    while (try iterator.next()) |entry| {
        if (length + 1 + entry.name.len >= buffer.len) return error.NameTooLong;
        buffer[length] = '/';
        @memcpy(buffer[length + 1 ..][0..entry.name.len], entry.name);
        try prepareOwnedDirectories(buffer, length + 1 + entry.name.len);
    }
}

pub fn removeOwnedTree(allocator: std.mem.Allocator, path: []const u8) !void {
    // Cleanup must work when candidate-path allocation itself failed. Never
    // depend on another allocation from the exhausted caller allocator.
    _ = allocator;
    var buffer: [std.fs.max_path_bytes]u8 = undefined;
    if (path.len >= buffer.len) return error.NameTooLong;
    @memcpy(buffer[0..path.len], path);
    try prepareOwnedDirectories(&buffer, path.len);
    try io_helper.cwd().deleteTree(io_helper.io, path);
}
