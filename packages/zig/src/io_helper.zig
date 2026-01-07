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
    return try cwd().statPath(io, path, .{});
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
/// Uses std.fs.cwd() since Io.Dir.makePath may not exist
pub fn makePath(path: []const u8) !void {
    return try std.fs.cwd().makePath(path);
}

/// Check access to a path (relative)
pub fn access(path: []const u8, flags: Dir.AccessOptions) !void {
    return try cwd().access(io, path, flags);
}

/// Check access to an absolute path
/// Uses std.fs.accessAbsolute since Io.Dir doesn't have accessAbsolute
pub fn accessAbsolute(path: []const u8, flags: Dir.AccessOptions) !void {
    _ = flags; // Use default access check (existence)
    return try std.fs.accessAbsolute(path, .{});
}

/// Open a directory in the current working directory
pub fn openDir(path: []const u8, options: Dir.OpenOptions) !Dir {
    return try cwd().openDir(io, path, options);
}

/// Delete a file
/// Uses std.fs.cwd().deleteFile since Io.Dir doesn't have deleteFile
pub fn deleteFile(path: []const u8) !void {
    return try std.fs.cwd().deleteFile(path);
}

/// Delete a directory tree
/// Uses std.fs.cwd().deleteTree since Io.Dir doesn't have deleteTree
pub fn deleteTree(path: []const u8) !void {
    return try std.fs.cwd().deleteTree(path);
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
    var buf: [std.fs.max_path_bytes]u8 = undefined;
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

/// Legacy std.fs.Dir for directory iteration (Io.Dir doesn't have iterate() in Zig 0.16)
pub const FsDir = std.fs.Dir;

/// Open a directory for iteration using std.fs.Dir (which still has iterate())
/// Returns an std.fs.Dir which has the iterate() method
pub fn openDirForIteration(path: []const u8) !FsDir {
    return std.fs.cwd().openDir(path, .{ .iterate = true });
}

/// Open a directory for iteration using std.fs.Dir with absolute path
pub fn openDirAbsoluteForIteration(path: []const u8) !FsDir {
    return std.fs.openDirAbsolute(path, .{ .iterate = true });
}

/// Open a file with absolute path
/// Opens from root directory for absolute paths
pub fn openFileAbsolute(path: []const u8, flags: File.OpenFlags) !File {
    // For absolute paths, we can use openat with AT.FDCWD
    // But since we're using Io.Dir, we need to open the root and navigate
    // Simpler: use posix open directly
    const posix_flags: std.posix.O = blk: {
        var f: std.posix.O = .{};
        if (flags.mode == .read_only) {
            f.ACCMODE = .RDONLY;
        } else if (flags.mode == .read_write) {
            f.ACCMODE = .RDWR;
        } else if (flags.mode == .write_only) {
            f.ACCMODE = .WRONLY;
        }
        break :blk f;
    };
    const fd = try std.posix.open(path, posix_flags, 0);
    return File{ .handle = fd };
}

/// Open a directory with absolute path
/// Since Io.Dir doesn't have openDirAbsolute, we use posix API
pub fn openDirAbsolute(path: []const u8, options: Dir.OpenOptions) !Dir {
    _ = options;
    // Use posix open with directory flag
    const flags: std.posix.O = .{ .DIRECTORY = true, .CLOEXEC = true };
    const fd = try std.posix.open(path, flags, 0);
    return Dir{ .handle = fd };
}

/// Read from stdin
pub fn readStdin(buffer: []u8) !usize {
    return std.posix.read(std.posix.STDIN_FILENO, buffer);
}

/// Rename a file or directory using std.fs (Io.Dir.rename doesn't work well in Zig 0.16)
pub fn rename(old_path: []const u8, new_path: []const u8) !void {
    return try std.fs.cwd().rename(old_path, new_path);
}

/// Copy a file using std.fs.Dir (Io.Dir doesn't have copyFile in Zig 0.16)
pub fn copyFile(src_path: []const u8, dest_path: []const u8) !void {
    return try std.fs.cwd().copyFile(src_path, std.fs.cwd(), dest_path, .{});
}

/// Create a symbolic link using std.posix (Io.Dir doesn't have symLink in Zig 0.16)
pub fn symLink(target: []const u8, link_path: []const u8) !void {
    return try std.posix.symlink(target, link_path);
}
