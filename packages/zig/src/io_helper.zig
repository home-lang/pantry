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

const is_windows = builtin.os.tag == .windows;

// Windows kernel32 @extern declarations (only evaluated on Windows targets)
const win32 = struct {
    const HANDLE = std.os.windows.HANDLE;
    const DWORD = std.os.windows.DWORD;
    const BOOL = std.os.windows.BOOL;
    const LARGE_INTEGER = std.os.windows.LARGE_INTEGER;
    const FALSE = std.os.windows.FALSE;
    const FILETIME = extern struct { dwLowDateTime: u32, dwHighDateTime: u32 };

    const ReadFile = if (is_windows) @extern(*const fn (HANDLE, [*]u8, DWORD, *DWORD, ?*anyopaque) callconv(.winapi) BOOL, .{ .name = "ReadFile" }) else {};
    const WriteFile = if (is_windows) @extern(*const fn (HANDLE, [*]const u8, DWORD, *DWORD, ?*anyopaque) callconv(.winapi) BOOL, .{ .name = "WriteFile" }) else {};
    const GetStdHandle = if (is_windows) @extern(*const fn (DWORD) callconv(.winapi) ?HANDLE, .{ .name = "GetStdHandle" }) else {};
    const Sleep = if (is_windows) @extern(*const fn (DWORD) callconv(.winapi) void, .{ .name = "Sleep" }) else {};
    const GetSystemTimeAsFileTime = if (is_windows) @extern(*const fn (*FILETIME) callconv(.winapi) void, .{ .name = "GetSystemTimeAsFileTime" }) else {};
    const SetFilePointerEx = if (is_windows) @extern(*const fn (HANDLE, LARGE_INTEGER, ?*LARGE_INTEGER, DWORD) callconv(.winapi) BOOL, .{ .name = "SetFilePointerEx" }) else {};
    const CreateDirectoryA = if (is_windows) @extern(*const fn ([*:0]const u8, ?*anyopaque) callconv(.winapi) BOOL, .{ .name = "CreateDirectoryA" }) else {};
    const GetCurrentDirectoryA = if (is_windows) @extern(*const fn (DWORD, [*]u8) callconv(.winapi) DWORD, .{ .name = "GetCurrentDirectoryA" }) else {};

    const STD_INPUT_HANDLE: DWORD = @bitCast(@as(i32, -10));
    const FILE_END: DWORD = 2;
};

/// Cross-platform read from a file descriptor/handle
pub fn platformRead(handle: std.posix.fd_t, buf: []u8) !usize {
    if (comptime is_windows) {
        var bytes_read: win32.DWORD = 0;
        const len: win32.DWORD = @intCast(@min(buf.len, std.math.maxInt(win32.DWORD)));
        if (win32.ReadFile(handle, buf.ptr, len, &bytes_read, null) == win32.FALSE) {
            return error.InputOutput;
        }
        return @intCast(bytes_read);
    }
    return std.posix.read(handle, buf);
}

/// Cross-platform write to a file descriptor/handle
fn platformWrite(handle: std.posix.fd_t, buf: []const u8) !usize {
    if (comptime is_windows) {
        var bytes_written: win32.DWORD = 0;
        const len: win32.DWORD = @intCast(@min(buf.len, std.math.maxInt(win32.DWORD)));
        if (win32.WriteFile(handle, buf.ptr, len, &bytes_written, null) == win32.FALSE) {
            return error.InputOutput;
        }
        return @intCast(bytes_written);
    }
    const result = c.write(handle, buf.ptr, buf.len);
    if (result < 0) return error.InputOutput;
    return @intCast(result);
}

/// Global Threaded I/O backend for single-threaded blocking I/O
/// For production code that needs an Io instance
/// NOTE: We override .allocator from .failing to page_allocator because
/// std.process.run -> spawn -> spawnPosix creates an ArenaAllocator backed
/// by this allocator. With .failing, every child process spawn OOMs.
var io_instance: Threaded = blk: {
    var inst: Threaded = .init_single_threaded;
    inst.allocator = std.heap.page_allocator;
    break :blk inst;
};

/// Get the global Io instance for blocking operations
/// This can be used anywhere an Io is needed for synchronous file operations
pub fn getIo() Io {
    // In test mode, use the testing IO to avoid conflicts with test harness
    if (@import("builtin").is_test) {
        return std.testing.io;
    }
    return io_instance.io();
}

/// Convenience constant for backwards compatibility
/// In test mode this returns std.testing.io, otherwise the global io_instance
pub const io: Io = if (@import("builtin").is_test) std.testing.io else io_instance.io();

/// Get the current working directory as an Io.Dir
pub fn cwd() Dir {
    return Dir.cwd();
}

/// Read entire file contents into an allocated buffer.
/// Uses posix.read directly to avoid Dir.readFile truncation issues.
pub fn readFileAlloc(allocator: std.mem.Allocator, path: []const u8, max_size: usize) ![]u8 {
    const file = cwd().openFile(io, path, .{ .mode = .read_only }) catch |err| return err;
    defer file.close(io);

    var total: usize = 0;
    var buffer = try allocator.alloc(u8, @min(max_size, 65536));
    errdefer allocator.free(buffer);

    while (true) {
        if (total == buffer.len) {
            if (buffer.len >= max_size) return error.BufferTooSmall;
            buffer = try allocator.realloc(buffer, @min(buffer.len *| 2, max_size));
        }
        const n = platformRead(file.handle, buffer[total..]) catch |err| {
            return err;
        };
        if (n == 0) break;
        total += n;
    }

    if (total == 0) {
        allocator.free(buffer);
        return try allocator.alloc(u8, 0);
    }
    if (total < buffer.len) {
        return try allocator.realloc(buffer, total);
    }
    return buffer;
}

/// File kind enum for stat results
pub const FileKind = enum {
    file,
    directory,
    sym_link,
    block_device,
    character_device,
    named_pipe,
    unix_domain_socket,
    whiteout,
    door,
    event_port,
    unknown,
};

/// Stat result structure compatible with both platforms
pub const StatResult = struct {
    size: u64,
    mtime: i128, // nanoseconds since epoch
    ctime: i128, // nanoseconds since epoch
    mode: u32 = 0, // Optional - may not be available on all platforms
    kind: FileKind = .file, // File type (file, directory, etc.)
};

/// Stat a file path - get file metadata
/// Uses Io.Dir for cross-platform compatibility
pub fn statFile(path: []const u8) !StatResult {
    // Try to open as file first
    if (cwd().openFile(io, path, .{ .mode = .read_only })) |file| {
        defer file.close(io);
        const stat = file.stat(io) catch return error.FileNotFound;
        return .{
            .size = @intCast(stat.size),
            .mtime = stat.mtime.toNanoseconds(),
            .ctime = stat.ctime.toNanoseconds(),
            .mode = if (@hasField(@TypeOf(stat), "mode")) stat.mode else 0,
            .kind = .file,
        };
    } else |_| {
        // Try to open as directory
        if (cwd().openDir(io, path, .{})) |dir| {
            defer dir.close(io);
            return .{
                .size = 0,
                .mtime = 0,
                .ctime = 0,
                .mode = 0,
                .kind = .directory,
            };
        } else |_| {
            return error.FileNotFound;
        }
    }
}

/// Create a file in the current working directory
pub fn createFile(path: []const u8, flags: File.CreateFlags) !File {
    return try cwd().createFile(io, path, flags);
}

/// Open a file in the current working directory
pub fn openFile(path: []const u8, flags: File.OpenFlags) !File {
    return try cwd().openFile(io, path, flags);
}

/// Make a directory path recursively using libc mkdir
pub fn makePath(path: []const u8) !void {
    if (comptime is_windows) {
        // On Windows, use CreateDirectoryA for cross-platform directory creation
        const sep = if (std.mem.lastIndexOfScalar(u8, path, '/')) |s| s else std.mem.lastIndexOfScalar(u8, path, '\\');
        if (sep) |s| {
            if (s > 0) {
                makePath(path[0..s]) catch {};
            }
        }
        var path_buf: [std.fs.max_path_bytes:0]u8 = undefined;
        if (path.len >= path_buf.len) return error.MakePathFailed;
        @memcpy(path_buf[0..path.len], path);
        path_buf[path.len] = 0;
        const result = win32.CreateDirectoryA(&path_buf, null);
        if (result == win32.FALSE) {
            // Ignore "already exists" errors
            return;
        }
        return;
    }

    // Null-terminate the path for C API
    var path_buf: [std.fs.max_path_bytes:0]u8 = undefined;
    if (path.len >= path_buf.len) return error.NameTooLong;
    @memcpy(path_buf[0..path.len], path);
    path_buf[path.len] = 0;

    const result = c.mkdir(&path_buf, 0o755);
    if (result == 0) return; // Success

    const err = std.posix.errno(result);
    if (err == .SUCCESS) return;
    if (err == .EXIST) return; // Already exists
    if (err == .NOENT) {
        // Parent doesn't exist, create it first
        if (std.mem.lastIndexOfScalar(u8, path, '/')) |sep2| {
            if (sep2 > 0) {
                try makePath(path[0..sep2]);
            }
        }
        // Now create this directory
        const result2 = c.mkdir(&path_buf, 0o755);
        if (result2 == 0) return;
        const err2 = std.posix.errno(result2);
        if (err2 == .SUCCESS or err2 == .EXIST) return;
        return error.MakePathFailed;
    }
    return error.MakePathFailed;
}

/// Check access to a path (relative)
pub fn access(path: []const u8, flags: Dir.AccessOptions) !void {
    _ = flags;
    if (comptime is_windows) {
        const file = cwd().openFile(io, path, .{ .mode = .read_only }) catch return error.FileNotFound;
        file.close(io);
        return;
    }
    const open_flags: std.posix.O = .{ .ACCMODE = .RDONLY, .CLOEXEC = true };
    const fd = std.posix.openat(std.posix.AT.FDCWD, path, open_flags, 0) catch return error.FileNotFound;
    std.posix.close(fd);
}

/// Check access to an absolute path
pub fn accessAbsolute(path: []const u8, flags: Dir.AccessOptions) !void {
    _ = flags;
    if (comptime is_windows) {
        const file = cwd().openFile(io, path, .{ .mode = .read_only }) catch return error.FileNotFound;
        file.close(io);
        return;
    }
    const open_flags: std.posix.O = .{ .ACCMODE = .RDONLY, .CLOEXEC = true };
    const fd = std.posix.openat(std.posix.AT.FDCWD, path, open_flags, 0) catch return error.FileNotFound;
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
        .windows => {
            cwd().deleteFile(io, path) catch return error.FileNotFound;
        },
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
        .windows => {
            cwd().deleteDir(io, path) catch return error.DirNotEmpty;
        },
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
    if (comptime is_windows) {
        const len = win32.GetCurrentDirectoryA(@intCast(out_buffer.len), out_buffer.ptr);
        if (len == 0) return error.Unexpected;
        return out_buffer[0..len];
    }
    // Use C getcwd for cross-version compatibility
    const result = c.getcwd(out_buffer.ptr, out_buffer.len);
    if (result == null) {
        return error.Unexpected;
    }
    const len = std.mem.indexOfScalar(u8, out_buffer, 0) orelse out_buffer.len;
    return out_buffer[0..len];
}

/// Get realpath - resolve path to absolute path
/// Simple implementation using cwd for "." and path joining
pub fn realpath(path: []const u8, out_buffer: []u8) ![]u8 {
    if (std.mem.eql(u8, path, ".")) {
        return getCwdPath(out_buffer);
    }

    // For absolute paths, just copy
    if (path.len > 0 and path[0] == '/') {
        if (path.len > out_buffer.len) return error.NameTooLong;
        @memcpy(out_buffer[0..path.len], path);
        return out_buffer[0..path.len];
    }

    // For relative paths, join with cwd
    const cwd_path = try getCwdPath(out_buffer);
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
        const written = platformWrite(handle, remaining) catch return error.InputOutput;
        if (written == 0) return error.UnexpectedEndOfStream;
        remaining = remaining[written..];
    }
}

/// Append content to a file
pub fn appendToFile(path: []const u8, bytes: []const u8) !void {
    const file = try cwd().openFile(io, path, .{ .mode = .write_only });
    defer file.close(io);
    // Seek to end
    if (comptime is_windows) {
        const distance: win32.LARGE_INTEGER = 0;
        if (win32.SetFilePointerEx(file.handle, distance, null, win32.FILE_END) == win32.FALSE) {
            return error.Unseekable;
        }
    } else {
        const SEEK_END = 2;
        const result = std.posix.system.lseek(file.handle, 0, SEEK_END);
        if (result == -1) return error.Unseekable;
    }
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
pub const FsDir = if (is_windows) WindowsFsDir else PosixFsDir;

const WindowsFsDir = struct {
    dir: Dir, // std.Io.Dir — cross-platform

    pub const Iterator = struct {
        inner: Dir.Iterator,

        pub fn next(self: *Iterator) !?DirEntry {
            const entry = self.inner.next(io) catch return null;
            if (entry) |e| {
                const kind: DirEntry.Kind = switch (e.kind) {
                    .file => .file,
                    .directory => .directory,
                    .sym_link => .sym_link,
                    else => .unknown,
                };
                return DirEntry{ .name = e.name, .kind = kind };
            }
            return null;
        }
    };

    pub fn iterate(self: *WindowsFsDir) Iterator {
        return .{ .inner = self.dir.iterate() };
    }

    pub fn close(self: *WindowsFsDir) void {
        self.dir.close(io);
    }
};

const PosixFsDir = struct {
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
                        .macos, .ios, .tvos, .watchos, .visionos, .freebsd => {
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
                    .macos, .ios, .tvos, .watchos, .visionos, .freebsd => {
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

    pub fn iterate(self: *PosixFsDir) Iterator {
        return .{ .fd = self.fd, .buf = undefined, .index = 0, .end = 0, .seek = 0 };
    }

    pub fn close(self: *PosixFsDir) void {
        std.posix.close(self.fd);
    }
};

/// Open a directory for iteration
pub fn openDirForIteration(path: []const u8) !FsDir {
    if (comptime is_windows) {
        const dir = cwd().openDir(io, path, .{}) catch return error.FileNotFound;
        return .{ .dir = dir };
    }
    const flags: std.posix.O = .{ .DIRECTORY = true, .CLOEXEC = true };
    const fd = try std.posix.openat(std.posix.AT.FDCWD, path, flags, 0);
    return .{ .fd = fd };
}

/// Open a directory for iteration with absolute path
pub fn openDirAbsoluteForIteration(path: []const u8) !FsDir {
    return openDirForIteration(path);
}

/// Check if a type has a field with the given name
fn hasField(comptime T: type, comptime name: []const u8) bool {
    const info = @typeInfo(T);
    if (info != .@"struct") return false;
    for (info.@"struct".fields) |field| {
        if (std.mem.eql(u8, field.name, name)) return true;
    }
    return false;
}

/// Open a file with absolute path
/// Opens from root directory for absolute paths
pub fn openFileAbsolute(path: []const u8, flags: File.OpenFlags) !File {
    if (comptime is_windows) {
        return cwd().openFile(io, path, flags) catch return error.FileNotFound;
    }
    const posix_flags: std.posix.O = .{ .ACCMODE = .RDONLY };
    const fd = try std.posix.openat(std.posix.AT.FDCWD, path, posix_flags, 0);
    // Newer Zig versions require flags field on File
    if (comptime hasField(File, "flags")) {
        var result: File = std.mem.zeroes(File);
        result.handle = fd;
        return result;
    } else {
        return .{ .handle = fd };
    }
}

/// Open a directory with absolute path
pub fn openDirAbsolute(path: []const u8, options: Dir.OpenOptions) !Dir {
    if (comptime is_windows) {
        return cwd().openDir(io, path, options) catch return error.FileNotFound;
    }
    const posix_flags: std.posix.O = .{ .DIRECTORY = true, .CLOEXEC = true };
    const fd = try std.posix.openat(std.posix.AT.FDCWD, path, posix_flags, 0);
    // Newer Zig versions require flags field on Dir
    if (comptime hasField(Dir, "flags")) {
        var result: Dir = std.mem.zeroes(Dir);
        result.handle = fd;
        return result;
    } else {
        return .{ .handle = fd };
    }
}

/// Read from stdin
pub fn readStdin(buffer: []u8) !usize {
    if (comptime is_windows) {
        const handle = win32.GetStdHandle(win32.STD_INPUT_HANDLE) orelse return error.InputOutput;
        var bytes_read: win32.DWORD = 0;
        const len: win32.DWORD = @intCast(@min(buffer.len, std.math.maxInt(win32.DWORD)));
        if (win32.ReadFile(handle, buffer.ptr, len, &bytes_read, null) == win32.FALSE) {
            return error.InputOutput;
        }
        return @intCast(bytes_read);
    }
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

/// Copy a file using the fastest platform-specific method:
/// - macOS APFS: clonefile() for instant copy-on-write clones (zero I/O, zero extra disk space)
/// - Linux: copy_file_range() for zero-copy kernel-space transfer
/// - Fallback: buffered read/write with 64KB chunks
pub fn copyFile(src_path: []const u8, dest_path: []const u8) !void {
    // Null-terminate paths for C APIs
    var src_buf: [std.fs.max_path_bytes:0]u8 = undefined;
    var dest_buf: [std.fs.max_path_bytes:0]u8 = undefined;
    if (src_path.len >= src_buf.len or dest_path.len >= dest_buf.len) return error.NameTooLong;
    @memcpy(src_buf[0..src_path.len], src_path);
    src_buf[src_path.len] = 0;
    @memcpy(dest_buf[0..dest_path.len], dest_path);
    dest_buf[dest_path.len] = 0;

    switch (builtin.os.tag) {
        .macos, .ios, .tvos, .watchos, .visionos => {
            // Try APFS clonefile() first — instant, zero-copy, no extra disk space
            const clonefile_fn = @extern(*const fn ([*:0]const u8, [*:0]const u8, u32) callconv(.c) c_int, .{ .name = "clonefile" });
            const rc = clonefile_fn(&src_buf, &dest_buf, 0);
            if (rc == 0) return; // Success — instant clone
            // clonefile fails on non-APFS, cross-device, or if dest exists — fall through
        },
        .linux => {
            // On Linux, use the buffered fallback which is reliable across all kernels.
            // copy_file_range requires fstat to get file size, but std.posix.fstat
            // was removed in Zig 0.16 and c.fstat is not available on Linux.
            // The fallback is still fast (64KB chunks with kernel readahead).
            return copyFileFallback(src_path, dest_path);
        },
        else => {},
    }

    // Fallback for non-macOS, non-Linux, or when platform-specific calls fail
    return copyFileFallback(src_path, dest_path);
}

/// Fallback copy using buffered read/write (64KB chunks for better throughput)
fn copyFileFallback(src_path: []const u8, dest_path: []const u8) !void {
    const src_file = try cwd().openFile(io, src_path, .{ .mode = .read_only });
    defer src_file.close(io);

    const dest_file = try cwd().createFile(io, dest_path, .{});
    defer dest_file.close(io);

    var buf: [65536]u8 = undefined; // 64KB — matches typical OS readahead
    while (true) {
        const bytes_read = platformRead(src_file.handle, &buf) catch |err| {
            return err;
        };
        if (bytes_read == 0) break;
        try writeAllToFile(dest_file, buf[0..bytes_read]);
    }
}

/// Copy a directory tree using platform-optimized methods.
/// On macOS APFS, uses clonefile() for instant zero-copy clone of entire directory.
/// On other platforms, recursively copies files.
pub fn copyTree(src_path: []const u8, dest_path: []const u8) !void {
    // On macOS, try clonefile() for the whole directory (works on APFS)
    if (builtin.os.tag == .macos) {
        var src_buf: [std.fs.max_path_bytes:0]u8 = undefined;
        var dest_buf_z: [std.fs.max_path_bytes:0]u8 = undefined;
        if (src_path.len < src_buf.len and dest_path.len < dest_buf_z.len) {
            @memcpy(src_buf[0..src_path.len], src_path);
            src_buf[src_path.len] = 0;
            @memcpy(dest_buf_z[0..dest_path.len], dest_path);
            dest_buf_z[dest_path.len] = 0;

            const clonefile_fn = @extern(*const fn ([*:0]const u8, [*:0]const u8, u32) callconv(.c) c_int, .{ .name = "clonefile" });
            const rc = clonefile_fn(&src_buf, &dest_buf_z, 0);
            if (rc == 0) return; // Success — entire directory cloned instantly
        }
    }

    // Fallback: recursive copy
    try makePath(dest_path);
    var dir = openDirForIteration(src_path) catch return;
    defer dir.close();

    var iter = dir.iterate();
    while (iter.next() catch null) |entry| {
        var child_src: [std.fs.max_path_bytes]u8 = undefined;
        var child_dst: [std.fs.max_path_bytes]u8 = undefined;
        const cs = std.fmt.bufPrint(&child_src, "{s}/{s}", .{ src_path, entry.name }) catch continue;
        const cd = std.fmt.bufPrint(&child_dst, "{s}/{s}", .{ dest_path, entry.name }) catch continue;

        if (entry.kind == .directory) {
            copyTree(cs, cd) catch {};
        } else {
            copyFile(cs, cd) catch {};
        }
    }
}

/// Create a symbolic link using platform-specific syscalls
pub fn symLink(target: []const u8, link_path: []const u8) !void {
    if (comptime is_windows) {
        // Symlinks require elevated privileges on Windows; copy file instead
        // Check if destination already exists
        cwd().access(io, link_path, .{}) catch |err| {
            if (err != error.FileNotFound) return error.SymLinkError;
            // File doesn't exist, proceed with copy
            copyFile(target, link_path) catch return error.SymLinkError;
            return;
        };
        // File exists
        return error.PathAlreadyExists;
    }

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

/// Read a symbolic link target
pub fn readLink(path: []const u8, buf: []u8) ![]const u8 {
    if (comptime is_windows) {
        // Windows doesn't support readlink; return the path itself
        if (path.len > buf.len) return error.ReadLinkError;
        @memcpy(buf[0..path.len], path);
        return buf[0..path.len];
    }
    var path_buf: [std.fs.max_path_bytes:0]u8 = undefined;
    if (path.len >= path_buf.len) return error.NameTooLong;
    @memcpy(path_buf[0..path.len], path);
    path_buf[path.len] = 0;
    const result = c.readlink(&path_buf, buf.ptr, buf.len);
    if (result < 0) return error.ReadLinkError;
    return buf[0..@intCast(result)];
}

/// Read a symbolic link target with allocation
pub fn readLinkAlloc(allocator: std.mem.Allocator, path: []const u8) ![]const u8 {
    var buf: [std.fs.max_path_bytes]u8 = undefined;
    const target = try readLink(path, &buf);
    return try allocator.dupe(u8, target);
}

/// Re-export SpawnOptions for callers
pub const SpawnOptions = std.process.SpawnOptions;

/// Convert optional path string to Cwd type (handles API differences)
pub fn toCwd(path: ?[]const u8) std.process.Child.Cwd {
    return if (path) |p| .{ .path = p } else .inherit;
}

/// Spawn a child process and wait for it to complete
pub fn spawnAndWait(options: SpawnOptions) !std.process.Child.Term {
    if (comptime @hasDecl(std.process, "spawn")) {
        var child = try std.process.spawn(getIo(), options);
        return try child.wait(getIo());
    } else {
        // Fallback: use childRun which handles cross-version compat
        const result = try childRun(std.heap.page_allocator, options.argv);
        defer std.heap.page_allocator.free(result.stdout);
        defer std.heap.page_allocator.free(result.stderr);
        return result.term;
    }
}

/// Result type for timeout-aware wait/spawn operations
pub const WaitWithTimeoutResult = union(enum) {
    success: std.process.Child.Term,
    timeout,
};

const WaitThreadState = struct {
    child: *std.process.Child,
    done: std.atomic.Value(bool) = std.atomic.Value(bool).init(false),
    term: ?std.process.Child.Term = null,
    err: ?anyerror = null,
};

fn waitThreadMain(state: *WaitThreadState) void {
    state.term = wait(state.child) catch |err| {
        state.err = err;
        state.done.store(true, .release);
        return;
    };

    state.done.store(true, .release);
}

/// Wait for a spawned child process with a timeout
pub fn waitWithTimeout(child: *std.process.Child, timeout_ms: u64) !WaitWithTimeoutResult {
    if (timeout_ms == 0) {
        return .{ .success = try wait(child) };
    }

    var state = WaitThreadState{ .child = child };
    const waiter = try std.Thread.spawn(.{}, waitThreadMain, .{&state});
    defer waiter.join();

    const start_ms = getMilliTimestamp();

    while (!state.done.load(.acquire)) {
        const elapsed_raw = getMilliTimestamp() - start_ms;
        const elapsed_ms: u64 = if (elapsed_raw <= 0) 0 else @intCast(elapsed_raw);

        if (elapsed_ms >= timeout_ms) {
            // Best-effort termination. Waiter thread will reap process exit.
            kill(child);

            while (!state.done.load(.acquire)) {
                nanosleep(0, 10 * std.time.ns_per_ms);
            }

            return .timeout;
        }

        nanosleep(0, 10 * std.time.ns_per_ms);
    }

    if (state.err) |err| return err;
    return .{ .success = state.term.? };
}

/// Spawn a child process and wait with timeout
pub fn spawnAndWaitWithTimeout(options: SpawnOptions, timeout_ms: u64) !WaitWithTimeoutResult {
    var child = try spawn(options);
    return try waitWithTimeout(&child, timeout_ms);
}

/// Spawn a child process (without waiting)
pub fn spawn(options: SpawnOptions) !std.process.Child {
    return try std.process.spawn(getIo(), options);
}

/// Wait for a spawned child process
pub fn wait(child: *std.process.Child) !std.process.Child.Term {
    if (comptime @hasDecl(std.process.Child, "wait")) {
        return try child.wait(getIo());
    } else {
        return try child.wait();
    }
}

/// Kill a spawned child process
pub fn kill(child: *std.process.Child) void {
    if (comptime @hasDecl(@TypeOf(child.*), "kill")) {
        child.kill(getIo());
        return;
    }

    // Fallback for targets/APIs without Child.kill
    if (builtin.os.tag != .windows and @hasField(@TypeOf(child.*), "id")) {
        std.posix.kill(child.id, std.posix.SIG.TERM) catch {};
    }
}

/// Result type for childRun
pub const ChildRunResult = struct {
    term: std.process.Child.Term,
    stdout: []u8,
    stderr: []u8,
    timed_out: bool = false,
};

/// Options for childRunWithOptions
pub const ChildRunOptions = struct {
    cwd: ?[]const u8 = null,
    env_map: ?*anyopaque = null, // Cross-version compatible (Environ.Map or null)
    timeout_ms: u64 = 0, // 0 = no timeout
};

/// Run a child process and collect output
/// Handles cross-platform differences in the Child.run signature
pub fn childRun(allocator: std.mem.Allocator, argv: []const []const u8) !ChildRunResult {
    return childRunWithOptions(allocator, argv, .{});
}

/// Run a child process with additional options (cwd, env_map, timeout)
pub fn childRunWithOptions(allocator: std.mem.Allocator, argv: []const []const u8, options: ChildRunOptions) !ChildRunResult {
    _ = options.env_map; // env_map support disabled for cross-version compat

    // When timeout is requested, use spawn + waitWithTimeout with inherited stdio
    // (output streams directly to terminal in real-time)
    if (options.timeout_ms > 0) {
        return childRunWithTimeout(allocator, argv, options);
    }

    // No timeout: use the blocking std.process.run which collects stdout/stderr
    // Try new API first (0.16.0-dev.2368+)
    if (comptime @hasDecl(std.process, "run")) {
        const RunOptions = std.process.RunOptions;
        const CwdField = @TypeOf(@as(RunOptions, undefined).cwd);

        // Handle both old (?[]const u8) and new (union Cwd) API
        const cwd_value: CwdField = if (@typeInfo(CwdField) == .optional)
            options.cwd // Old API: ?[]const u8
        else if (options.cwd) |p|
            .{ .path = p } // New API: union with path variant
        else
            .inherit; // New API: inherit from parent

        const result = try std.process.run(allocator, getIo(), .{
            .argv = argv,
            .cwd = cwd_value,
        });
        return .{
            .term = result.term,
            .stdout = result.stdout,
            .stderr = result.stderr,
        };
    } else {
        // Fallback: use Child.run with io parameter
        // cwd expects a string path, not a Dir
        const result = try std.process.Child.run(allocator, getIo(), .{
            .argv = argv,
            .cwd = options.cwd,
        });
        return .{
            .term = result.term,
            .stdout = result.stdout,
            .stderr = result.stderr,
        };
    }
}

/// Internal: run a child process with timeout enforcement.
/// Spawns with inherited stdio (output streams in real-time) and uses
/// waitWithTimeout to enforce the deadline. On timeout, sends SIGTERM,
/// waits briefly, then SIGKILL if needed.
fn childRunWithTimeout(allocator: std.mem.Allocator, argv: []const []const u8, options: ChildRunOptions) !ChildRunResult {
    const cwd_value: std.process.Child.Cwd = if (options.cwd) |p| .{ .path = p } else .inherit;

    var child = try std.process.spawn(getIo(), .{
        .argv = argv,
        .cwd = cwd_value,
    });

    const wait_result = try waitWithTimeout(&child, options.timeout_ms);

    switch (wait_result) {
        .success => |term| {
            return .{
                .term = term,
                .stdout = try allocator.alloc(u8, 0),
                .stderr = try allocator.alloc(u8, 0),
                .timed_out = false,
            };
        },
        .timeout => {
            return .{
                .term = if (comptime is_windows) .{ .exited = 1 } else .{ .signal = std.posix.SIG.TERM },
                .stdout = try allocator.alloc(u8, 0),
                .stderr = try allocator.dupe(u8, "Process timed out"),
                .timed_out = true,
            };
        },
    }
}

/// Get an environment variable (non-allocating, POSIX only)
/// Replacement for std.posix.getenv which was removed
pub fn getenv(key: []const u8) ?[:0]const u8 {
    // Use C getenv with null-terminated key
    var key_buf: [4096:0]u8 = undefined;
    if (key.len >= key_buf.len) return null;
    @memcpy(key_buf[0..key.len], key);
    key_buf[key.len] = 0;
    const value = c.getenv(&key_buf) orelse return null;
    return std.mem.sliceTo(value, 0);
}

/// Get an environment variable with allocation (owned copy)
/// Replacement for std.process.getEnvVarOwned which was removed
pub fn getEnvVarOwned(allocator: std.mem.Allocator, key: []const u8) ![]u8 {
    const value = getenv(key) orelse return error.EnvironmentVariableNotFound;
    return try allocator.dupe(u8, value);
}

/// Get the current working directory (allocated)
/// Replacement for std.process.getCwdAlloc which was removed
pub fn getCwdAlloc(allocator: std.mem.Allocator) ![]u8 {
    var buf: [std.fs.max_path_bytes]u8 = undefined;
    const path = try getCwdPath(&buf);
    return try allocator.dupe(u8, path);
}

/// Get process arguments (allocated slice)
/// Replacement for std.process.argsAlloc which was removed
/// On macOS/Linux with libc, uses _NSGetArgv / __libc_argv
pub fn argsAlloc(allocator: std.mem.Allocator) ![]const [:0]const u8 {
    const native_os = builtin.os.tag;
    if (native_os == .macos or native_os == .ios or native_os == .watchos or native_os == .tvos) {
        const _NSGetArgc = @extern(*const fn () callconv(.c) *c_int, .{ .name = "_NSGetArgc" });
        const _NSGetArgv = @extern(*const fn () callconv(.c) *[*:null]?[*:0]u8, .{ .name = "_NSGetArgv" });
        const argc_ptr = _NSGetArgc();
        const argv_ptr = _NSGetArgv();
        if (argc_ptr.* <= 0) return error.InvalidArgv;
        const argc: usize = @intCast(argc_ptr.*);
        const argv_raw = argv_ptr.*;
        const args = try allocator.alloc([:0]const u8, argc);
        for (0..argc) |i| {
            if (argv_raw[i]) |ptr| {
                args[i] = std.mem.sliceTo(ptr, 0);
            } else {
                allocator.free(args);
                return error.InvalidArgv;
            }
        }
        return args;
    } else if (native_os == .linux or native_os == .freebsd) {
        // On Linux, read /proc/self/cmdline
        const file = openFileAbsolute("/proc/self/cmdline", .{}) catch return error.InvalidArgv;
        defer _ = c.close(file.handle);

        var buf: [65536]u8 = undefined; // 64KB — sufficient for all practical command lines
        var total: usize = 0;
        while (total < buf.len) {
            const n = c.read(file.handle, buf[total..].ptr, buf.len - total);
            if (n <= 0) break;
            total += @intCast(n);
        }
        const content = try allocator.dupe(u8, buf[0..total]);
        defer allocator.free(content);

        // Count null-terminated strings
        var count: usize = 0;
        var i: usize = 0;
        while (i < content.len) {
            while (i < content.len and content[i] != 0) : (i += 1) {}
            if (i > 0 and (i == content.len or content[i] == 0)) count += 1;
            i += 1;
        }

        const args = try allocator.alloc([:0]const u8, count);
        var idx: usize = 0;
        i = 0;
        while (i < content.len and idx < count) {
            const start = i;
            while (i < content.len and content[i] != 0) : (i += 1) {}
            const duped = try allocator.dupeZ(u8, content[start..i]);
            args[idx] = duped;
            idx += 1;
            i += 1;
        }
        return args;
    } else if (native_os == .windows) {
        // Windows: use kernel32 GetCommandLineW (placeholder — returns empty for now)
        return try allocator.alloc([:0]const u8, 0);
    } else {
        @compileError("argsAlloc not supported on this platform");
    }
}

/// Fill buffer with random bytes
/// Replacement for std.crypto.random.bytes which was removed
pub fn randomBytes(buf: []u8) void {
    // Use /dev/urandom on POSIX systems for cross-version compatibility
    if (comptime @hasDecl(std.Random, "IoSource")) {
        var source: std.Random.IoSource = .{ .io = getIo() };
        source.interface().bytes(buf);
    } else if (comptime is_windows) {
        // Windows: use timestamp-based fill as fallback
        for (buf, 0..) |*b, i| {
            b.* = @truncate(i *% 31337 +% 12345);
        }
    } else {
        // Fallback: read from /dev/urandom using posix
        const fd = std.posix.openat(std.posix.AT.FDCWD, "/dev/urandom", .{ .ACCMODE = .RDONLY }, 0) catch {
            // Last resort: use a simple counter-based fill
            for (buf, 0..) |*b, i| {
                b.* = @truncate(i *% 31337 +% 12345);
            }
            return;
        };
        defer std.posix.close(fd);
        _ = std.posix.read(fd, buf) catch {
            for (buf, 0..) |*b, i| {
                b.* = @truncate(i *% 31337 +% 12345);
            }
        };
    }
}

/// Get the system temporary directory, respecting TMPDIR/TMP/TEMP env vars
/// Falls back to /tmp on POSIX systems
pub fn getTempDir() []const u8 {
    return getenv("TMPDIR") orelse getenv("TMP") orelse getenv("TEMP") orelse "/tmp";
}

/// Sleep for the given number of nanoseconds
/// Replacement for std.posix.nanosleep which was removed
pub fn nanosleep(secs: u64, nsecs: u64) void {
    if (comptime is_windows) {
        const ms: win32.DWORD = @intCast(secs * 1000 + nsecs / 1_000_000);
        win32.Sleep(ms);
        return;
    }
    var ts: c.timespec = .{ .sec = @intCast(secs), .nsec = @intCast(nsecs) };
    _ = c.nanosleep(&ts, &ts);
}

/// Get current wall-clock time in milliseconds (replacement for std.time.milliTimestamp)
pub fn getMilliTimestamp() i64 {
    if (comptime is_windows) {
        var ft: win32.FILETIME = undefined;
        win32.GetSystemTimeAsFileTime(&ft);
        const ticks: u64 = @as(u64, ft.dwHighDateTime) << 32 | ft.dwLowDateTime;
        // FILETIME is 100ns intervals since 1601-01-01; convert to ms since Unix epoch
        const unix_ticks: i64 = @as(i64, @bitCast(ticks)) - 116444736000000000;
        return @divFloor(unix_ticks, 10000);
    }
    var ts: c.timespec = .{ .sec = 0, .nsec = 0 };
    _ = c.clock_gettime(c.CLOCK.REALTIME, &ts);
    return @as(i64, ts.sec) * 1000 + @as(i64, @intCast(@divFloor(ts.nsec, 1_000_000)));
}

/// Get current wall-clock timespec (replacement for std.posix.clock_gettime(.REALTIME))
pub fn clockGettime() c.timespec {
    if (comptime is_windows) {
        var ft: win32.FILETIME = undefined;
        win32.GetSystemTimeAsFileTime(&ft);
        const ticks: u64 = @as(u64, ft.dwHighDateTime) << 32 | ft.dwLowDateTime;
        const unix_ticks: i64 = @as(i64, @bitCast(ticks)) - 116444736000000000;
        return .{ .sec = @intCast(@divFloor(unix_ticks, 10000000)), .nsec = @intCast(@mod(unix_ticks, 10000000) * 100) };
    }
    var ts: c.timespec = .{ .sec = 0, .nsec = 0 };
    _ = c.clock_gettime(c.CLOCK.REALTIME, &ts);
    return ts;
}

/// Get current monotonic timespec (for benchmarking/timing)
pub fn clockGettimeMonotonic() c.timespec {
    if (comptime is_windows) {
        var ft: win32.FILETIME = undefined;
        win32.GetSystemTimeAsFileTime(&ft);
        const ticks: u64 = @as(u64, ft.dwHighDateTime) << 32 | ft.dwLowDateTime;
        const unix_ticks: i64 = @as(i64, @bitCast(ticks)) - 116444736000000000;
        return .{ .sec = @intCast(@divFloor(unix_ticks, 10000000)), .nsec = @intCast(@mod(unix_ticks, 10000000) * 100) };
    }
    var ts: c.timespec = .{ .sec = 0, .nsec = 0 };
    _ = c.clock_gettime(c.CLOCK.MONOTONIC, &ts);
    return ts;
}

/// Mutex wrapper — using std.atomic.Mutex (Zig 0.16+)
/// std.atomic.Mutex only provides tryLock()/unlock(), so lock() spins.
pub const Mutex = struct {
    inner: std.atomic.Mutex = .unlocked,

    pub fn lock(self: *Mutex) void {
        while (!self.inner.tryLock()) {
            std.atomic.spinLoopHint();
        }
    }

    pub fn unlock(self: *Mutex) void {
        self.inner.unlock();
    }
};

/// Simple environment map type for cross-version compatibility
pub const EnvMap = std.StringHashMap([]const u8);

/// Get the process environment as a simple string hash map
/// Cross-version compatible replacement for std.process.getEnvMap
pub fn getEnvMap(allocator: std.mem.Allocator) !EnvMap {
    var map = EnvMap.init(allocator);
    errdefer map.deinit();

    if (comptime is_windows) {
        // Windows: return empty map (c.environ not available in cross-compilation)
        return map;
    }

    // Iterate over C's environ
    const raw_environ = c.environ;
    var i: usize = 0;
    while (raw_environ[i]) |entry| : (i += 1) {
        const entry_slice = std.mem.sliceTo(entry, 0);
        if (std.mem.indexOfScalar(u8, entry_slice, '=')) |eq_pos| {
            const key = entry_slice[0..eq_pos];
            const value = entry_slice[eq_pos + 1 ..];
            try map.put(key, value);
        }
    }
    return map;
}

// ── Native HTTP Client (replaces curl subprocess) ──────────────────────────

pub const HttpError = error{
    HttpRequestFailed,
    InvalidUrl,
    NetworkError,
    FileWriteFailed,
};

/// Fetch a URL's response body into allocated memory (replaces `curl -sL <url>`).
/// Handles HTTPS (native TLS), redirects (up to 10), and content decompression.
/// Caller owns the returned slice and must free it with `allocator`.
pub fn httpGet(allocator: std.mem.Allocator, url: []const u8) ![]u8 {
    var client: std.http.Client = .{
        .allocator = allocator,
        .io = io,
    };
    defer client.deinit();

    var alloc_writer = std.Io.Writer.Allocating.init(allocator);
    errdefer alloc_writer.deinit();

    var redirect_buf: [8192]u8 = undefined;

    const result = client.fetch(.{
        .location = .{ .url = url },
        .response_writer = &alloc_writer.writer,
        .redirect_buffer = &redirect_buf,
        .redirect_behavior = @enumFromInt(10),
    }) catch {
        return error.HttpRequestFailed;
    };

    if (result.status != .ok) {
        return error.HttpRequestFailed;
    }

    // Extract the response data — dupe the written portion, then free the internal buffer.
    // On success, errdefer won't run, so we must deinit explicitly.
    const data = alloc_writer.writer.buffer[0..alloc_writer.writer.end];
    const owned = try allocator.dupe(u8, data); // errdefer handles cleanup on OOM
    alloc_writer.deinit();
    return owned;
}

/// Download a URL to a file on disk (replaces `curl -sfL -o <path> <url>`).
/// Handles HTTPS (native TLS), redirects (up to 10), and content decompression.
pub fn httpDownloadFile(allocator: std.mem.Allocator, url: []const u8, dest_path: []const u8) !void {
    var client: std.http.Client = .{
        .allocator = allocator,
        .io = io,
    };
    defer client.deinit();

    const file = cwd().createFile(io, dest_path, .{}) catch return error.FileWriteFailed;
    defer file.close(io);

    var write_buf: [65536]u8 = undefined;
    var file_writer = file.writerStreaming(io, &write_buf);

    var redirect_buf: [8192]u8 = undefined;

    const result = client.fetch(.{
        .location = .{ .url = url },
        .response_writer = &file_writer.interface,
        .redirect_buffer = &redirect_buf,
        .redirect_behavior = @enumFromInt(10),
    }) catch return error.HttpRequestFailed;

    // Flush any remaining buffered data to disk
    file_writer.flush() catch return error.FileWriteFailed;

    if (result.status != .ok) {
        return error.HttpRequestFailed;
    }
}

/// Start an HTTP GET request and return the response + client for streaming.
/// This lower-level API is for callers that need Content-Length or progress tracking.
/// Heap-allocated to prevent pointer invalidation (Response holds *Request internally).
/// Caller must call deinit() on the returned HttpStream when done.
pub const HttpStream = struct {
    client: std.http.Client,
    req: std.http.Client.Request,
    response: std.http.Client.Response,
    redirect_buf: [8192]u8,

    /// Content-Length from the response headers, if provided by the server.
    pub fn contentLength(self: *const HttpStream) ?u64 {
        return self.response.head.content_length;
    }

    /// Get a body reader for streaming the response body.
    /// `transfer_buffer` is used internally for buffering reads.
    pub fn reader(self: *HttpStream, transfer_buffer: []u8) *std.Io.Reader {
        return self.response.reader(transfer_buffer);
    }

    pub fn deinit(self: *HttpStream) void {
        const alloc = self.client.allocator;
        self.req.deinit();
        self.client.deinit();
        alloc.destroy(self);
    }
};

/// Open a streaming HTTP GET connection (for progress-tracked downloads).
/// Returns a heap-allocated HttpStream with the response ready for body reading.
pub fn httpStreamGet(allocator: std.mem.Allocator, url: []const u8) !*HttpStream {
    const stream = try allocator.create(HttpStream);
    stream.* = .{
        .client = .{ .allocator = allocator, .io = io },
        .req = undefined,
        .response = undefined,
        .redirect_buf = undefined,
    };
    errdefer {
        stream.client.deinit();
        allocator.destroy(stream);
    }

    const uri = std.Uri.parse(url) catch return error.InvalidUrl;

    stream.req = stream.client.request(.GET, uri, .{
        .redirect_behavior = @enumFromInt(10),
        .headers = .{
            // Don't request compression for file downloads — we want raw bytes
            .accept_encoding = .{ .override = "identity" },
        },
    }) catch return error.NetworkError;
    errdefer stream.req.deinit();

    stream.req.sendBodiless() catch return error.NetworkError;

    stream.response = stream.req.receiveHead(&stream.redirect_buf) catch return error.HttpRequestFailed;

    if (stream.response.head.status != .ok) {
        return error.HttpRequestFailed;
    }

    return stream;
}
