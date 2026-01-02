//! I/O Helper for Zig 0.16.0-dev.1859 async I/O compatibility
//!
//! This module provides a simple interface for creating Io instances
//! that work with the new async I/O system in Zig 0.16-dev.
//!
//! Usage:
//! - For production code: use `io_helper.io` and helper functions
//! - For test code: use `std.testing.io` directly
//!
//! Note: Some operations like readFileAlloc, deleteFile, deleteTree, iterate
//! are not available on std.Io.Dir, so we use std.fs.Dir (blocking) for these.

const std = @import("std");
pub const Io = std.Io;
pub const Threaded = std.Io.Threaded;
pub const Dir = std.Io.Dir;
pub const File = std.Io.File;

/// Global mutable Threaded I/O backend for single-threaded blocking I/O
/// This mirrors how std.testing does it:
///   pub var io_instance: std.Io.Threaded = undefined;
///   pub const io = io_instance.io();
/// But we use init_single_threaded for simple blocking I/O
var io_instance: Threaded = Threaded.init_single_threaded;

/// Get the global Io instance for blocking operations
/// This can be used anywhere an Io is needed for synchronous file operations
pub fn getIo() Io {
    return io_instance.io();
}

/// Convenience constant for the global Io
/// Usage: io_helper.io
pub const io = getIo();

/// Get the current working directory as an Io.Dir
pub fn cwd() Dir {
    return Dir.cwd();
}

/// Get the current working directory as a blocking std.fs.Dir
pub fn fsCwd() std.fs.Dir {
    return std.fs.cwd();
}

/// Read entire file contents using blocking I/O
/// Uses std.fs API since std.Io.Dir doesn't have readFileAlloc
pub fn readFileAlloc(allocator: std.mem.Allocator, path: []const u8, limit: usize) ![]u8 {
    return try std.fs.cwd().readFileAlloc(path, allocator, Io.Limit.limited(limit));
}

/// Stat a file path
pub fn statFile(path: []const u8) !std.fs.File.Stat {
    return try std.fs.cwd().statFile(path);
}

/// Create a file in the current working directory
pub fn createFile(path: []const u8, flags: File.CreateFlags) !File {
    return try cwd().createFile(io, path, flags);
}

/// Open a file in the current working directory
pub fn openFile(path: []const u8, flags: File.OpenFlags) !File {
    return try cwd().openFile(io, path, flags);
}

/// Make a directory path in the current working directory
pub fn makePath(path: []const u8) !void {
    return try cwd().makePath(io, path);
}

/// Check access to a path
pub fn access(path: []const u8, flags: Dir.AccessOptions) !void {
    return try cwd().access(io, path, flags);
}

/// Open a directory in the current working directory
pub fn openDir(path: []const u8, options: Dir.OpenOptions) !Dir {
    return try cwd().openDir(io, path, options);
}

/// Delete a file using blocking std.fs API
pub fn deleteFile(path: []const u8) !void {
    return try std.fs.cwd().deleteFile(path);
}

/// Delete a directory tree using blocking std.fs API
pub fn deleteTree(path: []const u8) !void {
    return try std.fs.cwd().deleteTree(path);
}

/// Get realpath using posix API (since Io.Dir doesn't have realpath)
pub fn realpath(path: []const u8, out_buffer: []u8) ![]u8 {
    return std.posix.realpath(path, out_buffer);
}

/// Get realpath with allocation
pub fn realpathAlloc(allocator: std.mem.Allocator, path: []const u8) ![]u8 {
    var buf: [std.fs.max_path_bytes]u8 = undefined;
    const result = try std.posix.realpath(path, &buf);
    return try allocator.dupe(u8, result);
}

/// Write all bytes to a file using blocking std.fs API
/// std.Io.File doesn't have a simple writeAll, so we use posix write
pub fn writeAllToFile(file: File, bytes: []const u8) !void {
    // Use the underlying handle with posix write
    const handle = file.handle;
    var remaining = bytes;
    while (remaining.len > 0) {
        const written = std.posix.write(handle, remaining) catch |err| switch (err) {
            error.WouldBlock => continue,
            else => return err,
        };
        if (written == 0) return error.UnexpectedEndOfStream;
        remaining = remaining[written..];
    }
}

/// Append content to a file (since std.Io.File doesn't have seekFromEnd)
pub fn appendToFile(path: []const u8, bytes: []const u8) !void {
    // Use blocking std.fs API which has append mode
    const file = try std.fs.cwd().openFile(path, .{ .mode = .write_only });
    defer file.close();
    try file.seekFromEnd(0);
    try file.writeAll(bytes);
}

/// Close a file
pub fn closeFile(file: File) void {
    file.close(io);
}

/// Close a directory
pub fn closeDir(dir: Dir) void {
    dir.close(io);
}

/// Create an iterator for a directory (using blocking std.fs API)
/// Since std.Io.Dir doesn't have iterate(), we need to use std.fs.Dir
pub fn iterateDir(path: []const u8) !std.fs.Dir.Iterator {
    const dir = try std.fs.cwd().openDir(path, .{ .iterate = true });
    return dir.iterate();
}
