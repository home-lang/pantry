//! I/O Helper for Zig 0.16-dev async I/O compatibility
//!
//! This module provides a simple interface for creating Io instances
//! that work with the new async I/O system in Zig 0.16-dev.

const std = @import("std");
const Io = std.Io;
const Threaded = std.Io.Threaded;

/// Thread-local Threaded I/O backend
var threaded_io: ?Threaded = null;

/// Get or create a thread-local Io instance
pub fn getIo(allocator: std.mem.Allocator) Io {
    if (threaded_io == null) {
        threaded_io = Threaded.init(allocator);
    }
    return threaded_io.?.io();
}

/// Deinitialize the thread-local Io instance
pub fn deinit() void {
    if (threaded_io) |*t| {
        t.deinit();
        threaded_io = null;
    }
}

/// Read entire file contents using blocking I/O
pub fn readFile(allocator: std.mem.Allocator, path: []const u8, max_size: usize) ![]u8 {
    const file = try std.Io.Dir.cwd().openFile(path, .{});
    defer file.close();

    return try file.reader().readAllAlloc(allocator, max_size);
}

/// Read file from directory
pub fn readFileFromDir(dir: std.fs.Dir, allocator: std.mem.Allocator, path: []const u8, limit: std.Io.Limit) ![]u8 {
    const file = try dir.openFile(path, .{});
    defer file.close();

    const max_size = switch (limit) {
        .unlimited => std.math.maxInt(usize),
        .nothing => 0,
        else => @intFromEnum(limit),
    };

    return try file.reader().readAllAlloc(allocator, max_size);
}
