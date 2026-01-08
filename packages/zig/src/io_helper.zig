//! I/O Helper for Zig 0.16.0-dev async I/O compatibility
//!
//! This module provides a simple interface for creating Io instances
//! that work with the new async I/O system in Zig 0.16-dev.
//!
//! Usage:
//! - For production code: use `io_helper.io` and helper functions
//! - For test code: use `std.testing.io` directly

const std = @import("std");
const builtin = @import("builtin");
const c = std.c;
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

/// Stat result structure compatible with both platforms
pub const StatResult = struct {
    size: u64,
    mtime: i128, // nanoseconds since epoch
    ctime: i128, // nanoseconds since epoch
    mode: u32 = 0, // Optional - may not be available on all platforms
};

/// Stat a file path - get file metadata
/// Uses Io.Dir for cross-platform compatibility
pub fn statFile(path: []const u8) !StatResult {
    // Open file first, then stat via Io.Dir
    const file = cwd().openFile(io, path, .{ .mode = .read_only }) catch return error.FileNotFound;
    defer file.close(io);

    const stat = file.stat(io) catch return error.FileNotFound;
    return .{
        .size = @intCast(stat.size),
        .mtime = stat.mtime.toNanoseconds(),
        .ctime = stat.ctime.toNanoseconds(),
        .mode = if (@hasField(@TypeOf(stat), "mode")) stat.mode else 0,
    };
}

/// Create a file in the current working directory
pub fn createFile(path: []const u8, flags: File.CreateFlags) !File {
    return try cwd().createFile(io, path, flags);
}

/// Open a file in the current working directory
pub fn openFile(path: []const u8, flags: File.OpenFlags) !File {
    return try cwd().openFile(io, path, flags);
}

/// Make a directory path recursively using posix mkdir
pub fn makePath(path: []const u8) !void {
    // Try to create the directory directly first
    std.posix.mkdir(path, 0o755) catch |err| switch (err) {
        error.FileNotFound => {
            // Parent doesn't exist, create it first
            if (std.mem.lastIndexOfScalar(u8, path, '/')) |sep| {
                if (sep > 0) {
                    try makePath(path[0..sep]);
                }
            }
            // Now create this directory
            try std.posix.mkdir(path, 0o755);
        },
        error.PathAlreadyExists => {
            // Directory already exists, that's fine
        },
        else => return err,
    };
}

/// Check access to a path (relative)
pub fn access(path: []const u8, flags: Dir.AccessOptions) !void {
    _ = flags;
    // Try to open the file to check existence
    const open_flags: std.posix.O = .{ .ACCMODE = .RDONLY, .CLOEXEC = true };
    const fd = std.posix.open(path, open_flags, 0) catch return error.FileNotFound;
    std.posix.close(fd);
}

/// Check access to an absolute path
pub fn accessAbsolute(path: []const u8, flags: Dir.AccessOptions) !void {
    _ = flags;
    // Try to open the file to check existence
    const open_flags: std.posix.O = .{ .ACCMODE = .RDONLY, .CLOEXEC = true };
    const fd = std.posix.open(path, open_flags, 0) catch return error.FileNotFound;
    std.posix.close(fd);
}

/// Open a directory in the current working directory
pub fn openDir(path: []const u8, options: Dir.OpenOptions) !Dir {
    return try cwd().openDir(io, path, options);
}

/// Delete a file using platform-specific syscalls
pub fn deleteFile(path: []const u8) !void {
    var path_buf: [std.fs.max_path_bytes:0]u8 = undefined;
    if (path.len >= path_buf.len) return error.NameTooLong;
    @memcpy(path_buf[0..path.len], path);
    path_buf[path.len] = 0;

    switch (builtin.os.tag) {
        .linux => {
            const rc = std.os.linux.unlinkat(std.os.linux.AT.FDCWD, &path_buf, 0);
            if (rc != 0) return error.FileNotFound;
        },
        else => {
            // macOS and others - use libc
            const result = c.unlink(&path_buf);
            if (result != 0) return error.FileNotFound;
        },
    }
}

/// Delete a directory using platform-specific syscalls
fn deleteDir(path: []const u8) !void {
    var path_buf: [std.fs.max_path_bytes:0]u8 = undefined;
    if (path.len >= path_buf.len) return error.NameTooLong;
    @memcpy(path_buf[0..path.len], path);
    path_buf[path.len] = 0;

    switch (builtin.os.tag) {
        .linux => {
            const AT_REMOVEDIR = 0x200;
            const rc = std.os.linux.unlinkat(std.os.linux.AT.FDCWD, &path_buf, AT_REMOVEDIR);
            if (rc != 0) return error.DirNotEmpty;
        },
        else => {
            // macOS and others - use libc
            const result = c.rmdir(&path_buf);
            if (result != 0) return error.DirNotEmpty;
        },
    }
}

/// Delete a directory tree recursively
pub fn deleteTree(path: []const u8) !void {
    // Try to delete as file first
    deleteFile(path) catch {
        // If that fails, try as directory
        var dir = openDirForIteration(path) catch return;

        var iter = dir.iterate();
        while (iter.next() catch null) |entry| {
            var child_path_buf: [std.fs.max_path_bytes]u8 = undefined;
            const child_path = std.fmt.bufPrint(&child_path_buf, "{s}/{s}", .{ path, entry.name }) catch continue;
            deleteTree(child_path) catch {};
        }
        dir.close();

        // Now remove the empty directory
        deleteDir(path) catch {};
    };
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

/// Directory entry for iteration
pub const DirEntry = struct {
    name: []const u8,
    kind: Kind,

    pub const Kind = enum { file, directory, sym_link, unknown };
};

/// Directory handle wrapper - uses platform-specific directory iteration
pub const FsDir = struct {
    fd: std.posix.fd_t,

    // Platform-specific dirent type alias
    const linux = std.os.linux;

    pub const Iterator = struct {
        fd: std.posix.fd_t,
        buf: [8192]u8 align(8), // Aligned for both platforms
        index: usize,
        end: usize,
        seek: i64, // For macOS getdirentries

        pub fn next(self: *Iterator) !?DirEntry {
            while (true) {
                if (self.index >= self.end) {
                    // Need to read more entries - platform specific
                    switch (builtin.os.tag) {
                        .macos, .ios, .tvos, .watchos, .visionos => {
                            const rc = c.getdirentries(self.fd, &self.buf, self.buf.len, &self.seek);
                            if (rc == 0) return null;
                            if (rc < 0) return error.ReadDirError;
                            self.index = 0;
                            self.end = @intCast(rc);
                        },
                        .linux => {
                            const rc = linux.getdents64(self.fd, &self.buf, self.buf.len);
                            // Check for error - syscall returns negative error code as large usize
                            const signed_rc = @as(isize, @bitCast(rc));
                            if (signed_rc < 0) return error.ReadDirError;
                            if (rc == 0) return null;
                            self.index = 0;
                            self.end = rc;
                        },
                        else => return error.UnsupportedPlatform,
                    }
                }

                // Platform-specific entry parsing
                switch (builtin.os.tag) {
                    .macos, .ios, .tvos, .watchos, .visionos => {
                        const entry: *align(1) c.dirent = @ptrCast(&self.buf[self.index]);
                        self.index += entry.reclen;

                        // macOS dirent has namlen field
                        const name = @as([*]u8, @ptrCast(&entry.name))[0..entry.namlen];

                        // Skip . and ..
                        if (std.mem.eql(u8, name, ".") or std.mem.eql(u8, name, "..")) {
                            continue;
                        }

                        const kind: DirEntry.Kind = switch (entry.type) {
                            c.DT.REG => .file,
                            c.DT.DIR => .directory,
                            c.DT.LNK => .sym_link,
                            else => .unknown,
                        };

                        return DirEntry{
                            .name = name,
                            .kind = kind,
                        };
                    },
                    .linux => {
                        const entry: *align(1) linux.dirent64 = @ptrCast(&self.buf[self.index]);
                        self.index += entry.reclen;

                        // Linux uses null-terminated name at &entry.name
                        const name_ptr: [*:0]const u8 = @ptrCast(&entry.name);
                        const name = std.mem.sliceTo(name_ptr, 0);

                        // Skip . and ..
                        if (std.mem.eql(u8, name, ".") or std.mem.eql(u8, name, "..")) {
                            continue;
                        }

                        const kind: DirEntry.Kind = switch (entry.type) {
                            linux.DT.REG => .file,
                            linux.DT.DIR => .directory,
                            linux.DT.LNK => .sym_link,
                            else => .unknown,
                        };

                        return DirEntry{
                            .name = name,
                            .kind = kind,
                        };
                    },
                    else => return error.UnsupportedPlatform,
                }
            }
        }
    };

    pub fn iterate(self: *FsDir) Iterator {
        return .{ .fd = self.fd, .buf = undefined, .index = 0, .end = 0, .seek = 0 };
    }

    pub fn close(self: *FsDir) void {
        std.posix.close(self.fd);
    }
};

/// Open a directory for iteration
pub fn openDirForIteration(path: []const u8) !FsDir {
    const flags: std.posix.O = .{ .DIRECTORY = true, .CLOEXEC = true };
    const fd = try std.posix.open(path, flags, 0);
    return .{ .fd = fd };
}

/// Open a directory for iteration with absolute path
pub fn openDirAbsoluteForIteration(path: []const u8) !FsDir {
    return openDirForIteration(path);
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

/// Rename a file or directory using platform-specific syscalls
pub fn rename(old_path: []const u8, new_path: []const u8) !void {
    var old_buf: [std.fs.max_path_bytes:0]u8 = undefined;
    var new_buf: [std.fs.max_path_bytes:0]u8 = undefined;

    if (old_path.len >= old_buf.len or new_path.len >= new_buf.len) return error.NameTooLong;

    @memcpy(old_buf[0..old_path.len], old_path);
    old_buf[old_path.len] = 0;
    @memcpy(new_buf[0..new_path.len], new_path);
    new_buf[new_path.len] = 0;

    switch (builtin.os.tag) {
        .linux => {
            const rc = std.os.linux.renameat(std.os.linux.AT.FDCWD, &old_buf, std.os.linux.AT.FDCWD, &new_buf);
            if (rc != 0) return error.RenameError;
        },
        else => {
            const result = c.rename(&old_buf, &new_buf);
            if (result != 0) return error.RenameError;
        },
    }
}

/// Copy a file by reading and writing
pub fn copyFile(src_path: []const u8, dest_path: []const u8) !void {
    const src_file = try cwd().openFile(io, src_path, .{ .mode = .read_only });
    defer src_file.close(io);

    const dest_file = try cwd().createFile(io, dest_path, .{});
    defer dest_file.close(io);

    var buf: [8192]u8 = undefined;
    while (true) {
        const bytes_read = std.posix.read(src_file.handle, &buf) catch |err| switch (err) {
            error.WouldBlock => continue,
            else => return err,
        };
        if (bytes_read == 0) break;
        try writeAllToFile(dest_file, buf[0..bytes_read]);
    }
}

/// Create a symbolic link using platform-specific syscalls
pub fn symLink(target: []const u8, link_path: []const u8) !void {
    var target_buf: [std.fs.max_path_bytes:0]u8 = undefined;
    var link_buf: [std.fs.max_path_bytes:0]u8 = undefined;

    if (target.len >= target_buf.len or link_path.len >= link_buf.len) return error.NameTooLong;

    @memcpy(target_buf[0..target.len], target);
    target_buf[target.len] = 0;
    @memcpy(link_buf[0..link_path.len], link_path);
    link_buf[link_path.len] = 0;

    switch (builtin.os.tag) {
        .linux => {
            const rc = std.os.linux.symlinkat(&target_buf, std.os.linux.AT.FDCWD, &link_buf);
            if (rc != 0) {
                // Check for EEXIST (17 on Linux)
                const errno_val: u16 = @truncate(rc);
                if (errno_val == 17) return error.PathAlreadyExists;
                return error.SymLinkError;
            }
        },
        else => {
            const result = c.symlink(&target_buf, &link_buf);
            if (result != 0) {
                const err = std.posix.errno(result);
                if (err == .EXIST) return error.PathAlreadyExists;
                return error.SymLinkError;
            }
        },
    }
}

/// Spawn a child process and wait for it to complete
/// Handles cross-platform differences in the spawnAndWait signature
pub fn spawnAndWait(child: *std.process.Child) !std.process.Child.Term {
    // Check at compile time which signature is available
    const ChildType = std.process.Child;
    const fn_info = @typeInfo(@TypeOf(ChildType.spawnAndWait)).@"fn";

    if (fn_info.params.len == 2) {
        // Version with io parameter: spawnAndWait(self, io)
        return child.spawnAndWait(io);
    } else {
        // Version without io parameter: spawnAndWait(self)
        return child.spawnAndWait();
    }
}

/// Result type for childRun
pub const ChildRunResult = struct {
    term: std.process.Child.Term,
    stdout: []u8,
    stderr: []u8,
};

/// Run a child process and collect output
/// Handles cross-platform differences in the Child.run signature
pub fn childRun(allocator: std.mem.Allocator, argv: []const []const u8) !ChildRunResult {
    const ChildType = std.process.Child;
    const fn_info = @typeInfo(@TypeOf(ChildType.run)).@"fn";

    if (fn_info.params.len == 3) {
        // New API: run(allocator, io, args)
        const result = try ChildType.run(allocator, io, .{ .argv = argv });
        return .{
            .term = result.term,
            .stdout = result.stdout,
            .stderr = result.stderr,
        };
    } else {
        // Old API: run(.{ .allocator = ..., .argv = ... })
        const result = try ChildType.run(.{
            .allocator = allocator,
            .argv = argv,
        });
        return .{
            .term = result.term,
            .stdout = result.stdout,
            .stderr = result.stderr,
        };
    }
}
