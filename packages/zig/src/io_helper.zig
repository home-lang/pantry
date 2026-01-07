//! I/O Helper for Zig 0.16.0-dev.1859 async I/O compatibility
//!
//! This module provides a simple interface for creating Io instances
//! that work with the new async I/O system in Zig 0.16-dev.
//!
//! Usage:
//! - For production code: use `io_helper.io` and helper functions
//! - For test code: use `std.testing.io` directly

const std = @import("std");
pub const Io = std.Io;
pub const Threaded = std.Io.Threaded;
pub const Dir = std.Io.Dir;
pub const File = std.Io.File;

/// Global Threaded I/O backend for single-threaded blocking I/O
/// For production code that needs an Io instance
var io_instance: Threaded = .init_single_threaded;

/// Get the global Io instance for blocking operations
/// This can be used anywhere an Io is needed for synchronous file operations
pub fn getIo() Io {
    return io_instance.io();
}

/// Convenience constant for the global Io
/// Usage: io_helper.io
pub const io: Io = getIo();

/// Get the current working directory as an Io.Dir
pub fn cwd() Dir {
    return Dir.cwd();
}

/// Read entire file contents using Io.Dir.readFile
pub fn readFileAlloc(allocator: std.mem.Allocator, path: []const u8, max_size: usize) ![]u8 {
    var buffer = try allocator.alloc(u8, max_size);
    errdefer allocator.free(buffer);

    const result = try cwd().readFile(io, path, buffer);
    // Resize to actual content size
    if (result.len < buffer.len) {
        buffer = try allocator.realloc(buffer, result.len);
    }
    return buffer;
}

/// Stat a file path - get file metadata
pub fn statFile(path: []const u8) !Dir.Stat {
    return try cwd().statFile(io, path, .{});
}

/// Create a file in the current working directory
pub fn createFile(path: []const u8, flags: File.CreateFlags) !File {
    return try cwd().createFile(io, path, flags);
}

/// Open a file in the current working directory
pub fn openFile(path: []const u8, flags: File.OpenFlags) !File {
    return try cwd().openFile(io, path, flags);
}

/// Make a directory path in the current working directory (recursive)
/// This is the equivalent of the old makePath - uses createDirPath
pub fn makePath(path: []const u8) !void {
    return try cwd().createDirPath(io, path);
}

/// Check access to a path (relative)
pub fn access(path: []const u8, flags: Dir.AccessOptions) !void {
    return try cwd().access(io, path, flags);
}

/// Check access to an absolute path
pub fn accessAbsolute(path: []const u8, flags: Dir.AccessOptions) !void {
    return try Dir.accessAbsolute(io, path, flags);
}

/// Open a directory in the current working directory
pub fn openDir(path: []const u8, options: Dir.OpenOptions) !Dir {
    return try cwd().openDir(io, path, options);
}

/// Delete a file
pub fn deleteFile(path: []const u8) !void {
    return try cwd().deleteFile(io, path);
}

/// Delete a directory tree
pub fn deleteTree(path: []const u8) !void {
    return try cwd().deleteTree(io, path);
}

/// Get the current working directory as a path string
pub fn getCwdPath(out_buffer: []u8) ![]u8 {
    return std.posix.getcwd(out_buffer);
}

/// Get realpath - resolve path to absolute path
/// Since std.posix.realpath doesn't exist in this Zig version,
/// we implement a simple version using getcwd for "." and path joining
pub fn realpath(path: []const u8, out_buffer: []u8) ![]u8 {
    if (std.mem.eql(u8, path, ".")) {
        return std.posix.getcwd(out_buffer);
    }

    // For absolute paths, just copy
    if (path.len > 0 and path[0] == '/') {
        if (path.len > out_buffer.len) return error.NameTooLong;
        @memcpy(out_buffer[0..path.len], path);
        return out_buffer[0..path.len];
    }

    // For relative paths, join with cwd
    const cwd_path = try std.posix.getcwd(out_buffer);
    const cwd_len = cwd_path.len;

    // Check if we have enough space
    const total_len = cwd_len + 1 + path.len;
    if (total_len > out_buffer.len) return error.NameTooLong;

    // Append separator and path
    out_buffer[cwd_len] = '/';
    @memcpy(out_buffer[cwd_len + 1 ..][0..path.len], path);

    return out_buffer[0..total_len];
}

/// Get realpath with allocation
pub fn realpathAlloc(allocator: std.mem.Allocator, path: []const u8) ![]u8 {
    var buf: [Dir.max_path_bytes]u8 = undefined;
    const result = try realpath(path, &buf);
    return try allocator.dupe(u8, result);
}

/// Write all bytes to a file
pub fn writeAllToFile(file: File, bytes: []const u8) !void {
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

/// Append content to a file
pub fn appendToFile(path: []const u8, bytes: []const u8) !void {
    const file = try cwd().openFile(io, path, .{ .mode = .write_only });
    defer file.close(io);
    // Seek to end using C lseek
    const SEEK_END = 2;
    const result = std.posix.system.lseek(file.handle, 0, SEEK_END);
    if (result == -1) return error.Unseekable;
    try writeAllToFile(file, bytes);
}

/// Close a file
pub fn closeFile(file: File) void {
    file.close(io);
}

/// Close a directory
pub fn closeDir(dir: Dir) void {
    dir.close(io);
}

/// Create an iterator for a directory
/// Note: iterate() doesn't need io parameter
pub fn iterateDir(path: []const u8) !Dir.Iterator {
    const dir = try cwd().openDir(io, path, .{ .iterate = true });
    return dir.iterate();
}

/// Open a file with absolute path
pub fn openFileAbsolute(path: []const u8, flags: File.OpenFlags) !File {
    return try Dir.openFileAbsolute(io, path, flags);
}

/// Open a directory with absolute path
pub fn openDirAbsolute(path: []const u8, options: Dir.OpenOptions) !Dir {
    return try Dir.openDirAbsolute(io, path, options);
}

/// Read from stdin
pub fn readStdin(buffer: []u8) !usize {
    return std.posix.read(std.posix.STDIN_FILENO, buffer);
}

/// Rename a file or directory
pub fn rename(old_path: []const u8, new_path: []const u8) !void {
    return try cwd().rename(old_path, cwd(), new_path, io);
}

/// Copy a file
pub fn copyFile(src_path: []const u8, dest_path: []const u8) !void {
    return try cwd().copyFile(io, src_path, cwd(), dest_path, .{});
}

/// Create a symbolic link
pub fn symLink(target: []const u8, link_path: []const u8) !void {
    return try cwd().symLink(io, target, link_path, .{});
}
