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
const owned_spawn = @import("process_spawn.zig");
pub const Io = std.Io;
pub const Threaded = std.Io.Threaded;
pub const Dir = std.Io.Dir;
pub const File = std.Io.File;
pub const CreateFileFlags = if (@hasDecl(File, "CreateFlags")) File.CreateFlags else Dir.CreateFileOptions;
pub const OpenFileFlags = if (@hasDecl(File, "OpenFlags")) File.OpenFlags else Dir.OpenFileOptions;

const is_windows = builtin.os.tag == .windows;

/// Copy a slice into allocator-owned sentinel-terminated memory.
///
/// Zig 0.17 development builds removed `Allocator.dupeZ` as a method while
/// keeping `allocSentinel`, so keep the compatibility point local.
pub fn dupeZ(allocator: std.mem.Allocator, comptime T: type, slice: []const T) ![:0]T {
    const buffer = try allocator.allocSentinel(T, slice.len, 0);
    @memcpy(buffer[0..slice.len], slice);
    return buffer;
}

/// Cross-platform timespec (c.timespec fields are void on Windows)
pub const Timespec = struct {
    sec: i64,
    nsec: i64,
};

// Windows kernel32 @extern declarations (only evaluated on Windows targets)
const win32 = struct {
    const HANDLE = std.os.windows.HANDLE;
    const DWORD = std.os.windows.DWORD;
    const BOOL = std.os.windows.BOOL;
    const LARGE_INTEGER = std.os.windows.LARGE_INTEGER;
    const FALSE: BOOL = if (@typeInfo(BOOL) == .@"enum") @fromBackingInt(@intCast(0)) else 0;
    const FILETIME = extern struct { dwLowDateTime: u32, dwHighDateTime: u32 };

    const ReadFile = if (is_windows) @extern(*const fn (HANDLE, [*]u8, DWORD, *DWORD, ?*anyopaque) callconv(.winapi) BOOL, .{ .name = "ReadFile" }) else {};
    const WriteFile = if (is_windows) @extern(*const fn (HANDLE, [*]const u8, DWORD, *DWORD, ?*anyopaque) callconv(.winapi) BOOL, .{ .name = "WriteFile" }) else {};
    const GetStdHandle = if (is_windows) @extern(*const fn (DWORD) callconv(.winapi) ?HANDLE, .{ .name = "GetStdHandle" }) else {};
    const Sleep = if (is_windows) @extern(*const fn (DWORD) callconv(.winapi) void, .{ .name = "Sleep" }) else {};
    const GetSystemTimeAsFileTime = if (is_windows) @extern(*const fn (*FILETIME) callconv(.winapi) void, .{ .name = "GetSystemTimeAsFileTime" }) else {};
    const SetFilePointerEx = if (is_windows) @extern(*const fn (HANDLE, LARGE_INTEGER, ?*LARGE_INTEGER, DWORD) callconv(.winapi) BOOL, .{ .name = "SetFilePointerEx" }) else {};
    const CreateDirectoryA = if (is_windows) @extern(*const fn ([*:0]const u8, ?*anyopaque) callconv(.winapi) BOOL, .{ .name = "CreateDirectoryA" }) else {};
    const GetCurrentDirectoryA = if (is_windows) @extern(*const fn (DWORD, [*]u8) callconv(.winapi) DWORD, .{ .name = "GetCurrentDirectoryA" }) else {};
    const SetEndOfFile = if (is_windows) @extern(*const fn (HANDLE) callconv(.winapi) BOOL, .{ .name = "SetEndOfFile" }) else {};

    const STD_INPUT_HANDLE: DWORD = @bitCast(@as(i32, -10));
    const FILE_BEGIN: DWORD = 0;
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

/// Global Threaded I/O backend for production I/O.
///
/// The static value only provides a stable address for `io`. `initializeIo`
/// replaces it with the real concurrent backend before command dispatch.
var io_instance: Threaded = blk: {
    var inst: Threaded = .init_single_threaded;
    inst.allocator = std.heap.page_allocator;
    break :blk inst;
};
var io_initialized = false;

/// One-time flag: have we pointed the global Io's child-process environment at
/// the real OS environment yet?
var environ_initialized = false;

/// Populate the global Io instance's `process_environ` from the real OS
/// environment (libc `environ`) on POSIX.
///
/// `Threaded.init_single_threaded` ships an EMPTY `process_environ` on non-Windows
/// targets, and `std.process.run`/`spawn` pass that environ to children whenever
/// `environ_map == null`. The practical effect: every child process pantry spawns
/// (git, bump, changelog, …) ran with an EMPTY environment — no `HOME`, so git
/// could not read `~/.gitconfig` (commits failed with "Author identity unknown")
/// or `~/.config/git/ignore`. Capturing the libc `environ` here makes spawned
/// children inherit pantry's full environment, exactly as a shell-launched child
/// would. (Windows already uses the global block via `init_single_threaded`.)
fn ensureEnvironInitialized() void {
    if (is_windows or environ_initialized) return;
    environ_initialized = true;
    // libc `environ` is a null-terminated array of "KEY=VALUE" C strings. Span it
    // into the [:null] slice shape PosixBlock expects; the memory is owned by libc
    // and lives for the whole process, so no allocation/free is needed.
    // Populate the raw OS block; leave `io_instance.environ_initialized = false`
    // so std's lazy `scanEnviron` still memoizes PATH/HOME from this block.
    io_instance.environ.process_environ = .{ .block = .{ .slice = std.mem.span(c.environ) } };
}

/// Initialize Pantry's cancelable, concurrent I/O backend.
///
/// `Threaded.init_single_threaded` rejects concurrent tasks and ignores
/// cancellation. Pantry resolves npm metadata on worker threads and relies on
/// cancellation for network deadlines, so production commands must initialize
/// the full backend before using any I/O helper.
pub fn initializeIo() void {
    if (@import("builtin").is_test or io_initialized) return;
    io_instance = Threaded.init(std.heap.page_allocator, .{});
    io_initialized = true;
    ensureEnvironInitialized();
}

pub fn deinitializeIo() void {
    if (@import("builtin").is_test or !io_initialized) return;
    io_instance.deinit();
    io_initialized = false;
}

/// Get the global Io instance for blocking operations
/// This can be used anywhere an Io is needed for synchronous file operations
pub fn getIo() Io {
    // In test mode, use the testing IO to avoid conflicts with test harness
    if (@import("builtin").is_test) {
        return std.testing.io;
    }
    if (!io_initialized) initializeIo();
    ensureEnvironInitialized();
    return io_instance.io();
}

/// Convenience constant for backwards compatibility
/// In test mode this returns std.testing.io, otherwise the global io_instance
pub const io: Io = if (@import("builtin").is_test) std.testing.io else io_instance.io();

/// Sleep for the given milliseconds. Wraps the new std.Io sleep API
/// (std.Thread.sleep / std.time.sleep were removed in Zig 0.16+).
pub fn sleepMs(ms: u64) void {
    const ns: i96 = @intCast(@as(u128, ms) * @as(u128, std.time.ns_per_ms));
    const duration: Io.Duration = .{ .nanoseconds = ns };
    getIo().sleep(duration, .awake) catch {};
}

/// Get the current working directory as an Io.Dir
pub fn cwd() Dir {
    return Dir.cwd();
}

/// Read entire file contents into an allocated buffer.
/// Uses posix.read directly to avoid Dir.readFile truncation issues.
pub fn readFileAlloc(allocator: std.mem.Allocator, path: []const u8, max_size: usize) ![]u8 {
    const file = cwd().openFile(io, path, .{ .mode = .read_only }) catch |err| return err;
    defer file.close(io);
    return readFileAllocFromFile(allocator, file, max_size);
}

/// Read entire absolute-path file contents into an allocated buffer.
pub fn readFileAllocAbsolute(allocator: std.mem.Allocator, path: []const u8, max_size: usize) ![]u8 {
    if (comptime is_windows) {
        const file = Dir.openFileAbsolute(io, path, .{ .mode = .read_only }) catch |err| return err;
        defer file.close(io);
        return readFileAllocFromFile(allocator, file, max_size);
    }

    const fd = try std.posix.openat(std.posix.AT.FDCWD, path, .{ .ACCMODE = .RDONLY }, 0);
    defer _ = std.c.close(fd);
    return readFileAllocFromFd(allocator, fd, max_size);
}

fn readFileAllocFromFile(allocator: std.mem.Allocator, file: File, max_size: usize) ![]u8 {
    return readFileAllocFromFd(allocator, file.handle, max_size);
}

fn readFileAllocFromFd(allocator: std.mem.Allocator, fd: std.posix.fd_t, max_size: usize) ![]u8 {
    var total: usize = 0;
    var buffer = try allocator.alloc(u8, @min(max_size, 65536));
    errdefer allocator.free(buffer);

    while (true) {
        if (total == buffer.len) {
            if (buffer.len > max_size) return error.BufferTooSmall;
            buffer = try allocator.realloc(buffer, @min(buffer.len *| 2, max_size + 1));
        }
        const n = platformRead(fd, buffer[total..]) catch |err| {
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
pub fn createFile(path: []const u8, flags: CreateFileFlags) !File {
    return try cwd().createFile(io, path, flags);
}

/// Open a file in the current working directory
pub fn openFile(path: []const u8, flags: OpenFileFlags) !File {
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
    _ = std.c.close(fd);
}

/// Check access to an absolute path
pub fn accessAbsolute(path: []const u8, flags: Dir.AccessOptions) !void {
    _ = flags;
    const file = cwd().openFile(io, path, .{ .mode = .read_only }) catch return error.FileNotFound;
    file.close(io);
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
    // `>>` semantics: create the file when it doesn't exist yet (e.g.
    // `pantry shell:integrate` on a machine with no ~/.zshrc).
    const file = cwd().openFile(io, path, .{ .mode = .write_only }) catch |err| switch (err) {
        error.FileNotFound => try cwd().createFile(io, path, .{}),
        else => return err,
    };
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

/// Seek an open file to an absolute offset from the start.
pub fn seekFromStart(file: File, offset: u64) !void {
    if (comptime is_windows) {
        const distance: win32.LARGE_INTEGER = @intCast(offset);
        if (win32.SetFilePointerEx(file.handle, distance, null, win32.FILE_BEGIN) == win32.FALSE) {
            return error.Unseekable;
        }
    } else {
        const SEEK_SET = 0;
        const result = std.posix.system.lseek(file.handle, @intCast(offset), SEEK_SET);
        if (result == -1) return error.Unseekable;
    }
}

/// Truncate a file to `len` bytes **in place**, keeping its inode.
///
/// In place is the whole point: launchd (`StandardOutPath`) and systemd
/// (`StandardOutput=append:`) open the log once at spawn and hold that
/// descriptor for the life of the process. Renaming or deleting the path
/// leaves the running service writing into the file it can no longer be read
/// from, and the disk never comes back. Truncating the inode the writer
/// already holds is the only shrink a running service notices — its next
/// append (both open O_APPEND) lands at the new end.
pub fn truncateFile(path: []const u8, len: u64) !void {
    const file = try openFile(path, .{ .mode = .write_only });
    defer closeFile(file);
    if (comptime is_windows) {
        try seekFromStart(file, len);
        if (win32.SetEndOfFile(file.handle) == win32.FALSE) return error.InputOutput;
    } else {
        if (c.ftruncate(file.handle, @intCast(len)) != 0) return error.InputOutput;
    }
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
        _ = std.c.close(self.fd);
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
    return @hasField(T, name);
}

/// Open a file with absolute path
/// Opens from root directory for absolute paths
pub fn openFileAbsolute(path: []const u8, flags: OpenFileFlags) !File {
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

/// Create a file with an absolute path.
///
/// Mirrors `openFileAbsolute` for write/create. `Dir.cwd().createFile(abs)`
/// is unreliable across Zig versions; using `openat(AT.FDCWD, abs, …)`
/// directly works on every POSIX target.
pub fn createFileAbsolute(path: []const u8, flags: CreateFileFlags) !File {
    if (comptime is_windows) {
        return cwd().createFile(io, path, flags) catch return error.FileNotFound;
    }
    var posix_flags: std.posix.O = .{
        .ACCMODE = if (flags.read) .RDWR else .WRONLY,
        .CREAT = true,
        .TRUNC = flags.truncate,
    };
    if (flags.exclusive) posix_flags.EXCL = true;
    // 0o666 matches std.fs's default; the umask further restricts at runtime.
    const fd = try std.posix.openat(std.posix.AT.FDCWD, path, posix_flags, 0o666);
    if (comptime hasField(File, "flags")) {
        var result: File = std.mem.zeroes(File);
        result.handle = fd;
        return result;
    } else {
        return .{ .handle = fd };
    }
}

/// Search PATH for `name`. Returns an allocator-owned absolute path, or
/// `null` if the name isn't an executable on the PATH. The returned slice
/// is owned by the caller and must be freed.
///
/// Bypasses `std.process.run`'s built-in PATH search (which has had subtle
/// breakages across Zig dev versions and produces a generic FileNotFound
/// when the binary can't be located, indistinguishable from other I/O
/// errors). Resolving up-front lets callers emit a precise error message
/// and lets us pass an absolute path to spawn so the runtime never has to
/// search itself.
pub fn findExecutable(allocator: std.mem.Allocator, name: []const u8) !?[]const u8 {
    // Already absolute? Just verify it's executable.
    if (name.len > 0 and name[0] == '/') {
        if (isExecutable(name)) return try allocator.dupe(u8, name);
        return null;
    }

    const path_env = getenv("PATH") orelse return null;
    var it = std.mem.splitScalar(u8, path_env, ':');
    while (it.next()) |dir| {
        if (dir.len == 0) continue;
        const candidate = try std.fs.path.join(allocator, &[_][]const u8{ dir, name });
        if (isExecutable(candidate)) return candidate;
        allocator.free(candidate);
    }
    return null;
}

/// Check if `path` exists and is regular-or-symlink with at least one
/// execute bit set. Uses libc `access(path, X_OK)` for portability.
pub fn isExecutable(path: []const u8) bool {
    if (comptime is_windows) return true; // On Windows, lookup is by extension; defer to spawn.
    var path_buf: [std.fs.max_path_bytes:0]u8 = undefined;
    if (path.len >= path_buf.len) return false;
    @memcpy(path_buf[0..path.len], path);
    path_buf[path.len] = 0;
    // libc `access(path, X_OK)` returns 0 on success.
    const X_OK: c_uint = 1;
    return c.access(@ptrCast(&path_buf), X_OK) == 0;
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
    // Native helpers also live under lib/, not only bin/ or libexec/.
    // Preserve ordinary source permissions instead of guessing from its path.
    const source_permissions = (try src_file.stat(io)).permissions;
    const permissions = if (comptime is_windows) source_permissions else File.Permissions.fromMode(source_permissions.toMode() & 0o777);
    try dest_file.setPermissions(io, permissions);
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

    var copy_failed: usize = 0;
    var iter = dir.iterate();
    while (iter.next() catch null) |entry| {
        var child_src: [std.fs.max_path_bytes]u8 = undefined;
        var child_dst: [std.fs.max_path_bytes]u8 = undefined;
        const cs = std.fmt.bufPrint(&child_src, "{s}/{s}", .{ src_path, entry.name }) catch continue;
        const cd = std.fmt.bufPrint(&child_dst, "{s}/{s}", .{ dest_path, entry.name }) catch continue;

        if (entry.kind == .directory) {
            copyTree(cs, cd) catch {
                copy_failed += 1;
            };
        } else {
            copyFile(cs, cd) catch {
                copy_failed += 1;
            };
        }
    }
    if (copy_failed > 0) return error.PartialCopy;
}

/// Create a symbolic link using platform-specific syscalls
pub fn symLink(target: []const u8, link_path: []const u8) !void {
    if (comptime is_windows) {
        // Preserve the target's executable/resource identity. Copying a native
        // program into .bin breaks compilers and adjacent DLL/data lookup.
        const parent = std.fs.path.dirname(link_path) orelse ".";
        const resolved_target = if (std.fs.path.isAbsolute(target)) null else try std.fs.path.join(std.heap.page_allocator, &.{ parent, target });
        defer if (resolved_target) |path| std.heap.page_allocator.free(path);
        const target_stat = cwd().statFile(io, resolved_target orelse target, .{}) catch null;
        try cwd().symLink(io, target, link_path, .{
            .is_directory = if (target_stat) |stat| stat.kind == .directory else false,
        });
        return;
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
                // rc is negative errno as usize on error
                const signed: isize = @bitCast(rc);
                const errno_val: u16 = @intCast(@as(usize, @intCast(-signed)));
                if (errno_val == 17) return error.PathAlreadyExists; // EEXIST
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

test "symLink creates a relative executable alias at an absolute path" {
    if (comptime is_windows) return;

    const allocator = std.testing.allocator;
    var tmp_dir = std.testing.tmpDir(.{});
    defer tmp_dir.cleanup();

    try tmp_dir.dir.writeFile(io, .{ .sub_path = "pantry", .data = "binary" });

    const working_directory = try getCwdAlloc(allocator);
    defer allocator.free(working_directory);
    const alias_path = try std.fs.path.join(allocator, &.{ working_directory, ".zig-cache", "tmp", tmp_dir.sub_path[0..], "panx" });
    defer allocator.free(alias_path);

    try symLink("pantry", alias_path);

    var target_buf: [std.fs.max_path_bytes]u8 = undefined;
    const target = try readLink(alias_path, &target_buf);
    try std.testing.expectEqualStrings("pantry", target);
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

/// Kill a spawned child process (safe to call even if already exited)
pub fn kill(child: *std.process.Child) void {
    // Use posix kill directly to avoid panic on ECHILD when process already exited.
    // std.process.Child.kill() treats ECHILD as a "programmer bug" and panics,
    // but it's a normal condition when the child exits before we kill it.
    if (builtin.os.tag != .windows) {
        if (@hasField(@TypeOf(child.*), "id")) {
            const pid = if (@typeInfo(@TypeOf(child.id)) == .optional) (child.id orelse return) else child.id;
            std.posix.kill(pid, std.posix.SIG.TERM) catch {};
        }
    } else if (comptime @hasDecl(@TypeOf(child.*), "kill")) {
        child.kill(getIo());
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

fn countOpenCaptureDescriptors() usize {
    var count: usize = 0;
    for (0..4096) |fd| {
        if (c.fcntl(@intCast(fd), std.posix.F.GETFD, @as(c_int, 0)) != -1) count += 1;
    }
    return count;
}

fn countTestThreadChildren() !usize {
    var path_buffer: [128]u8 = undefined;
    const children_path = try std.fmt.bufPrint(&path_buffer, "/proc/self/task/{d}/children", .{std.Thread.getCurrentId()});
    const children = try readFileAlloc(std.testing.allocator, children_path, 64 * 1024);
    defer std.testing.allocator.free(children);
    var entries = std.mem.tokenizeAny(u8, children, " \n\t");
    var count: usize = 0;
    while (entries.next()) |_| count += 1;
    return count;
}

test "failed captured launches reap only their own children" {
    if (comptime builtin.os.tag != .linux) return error.SkipZigTest;

    // A failing baseline must not leave zombies on the host running this test.
    // This test process owns every child below; production never reaps arbitrary PIDs.
    defer {
        var status: c_int = undefined;
        while (true) {
            const result = std.posix.system.waitpid(-1, &status, 1);
            switch (std.posix.errno(result)) {
                .SUCCESS => if (result == 0) break,
                .INTR => continue,
                else => break,
            }
        }
    }
    var sentinel = try std.process.spawn(getIo(), .{ .argv = &.{ "/bin/sh", "-c", "exit 23" } });
    defer sentinel.kill(getIo());
    const before = try countTestThreadChildren();
    for (0..3) |_| {
        try std.testing.expectError(error.FileNotFound, childRun(std.testing.allocator, &.{"/pantry-test-missing-program"}));
        try std.testing.expectError(error.FileNotFound, childRun(std.testing.allocator, &.{"pantry-test-missing-program"}));
        try std.testing.expectError(error.FileNotFound, childRunWithOptions(std.testing.allocator, &.{"/bin/sh"}, .{ .cwd = "/pantry-test-missing-directory" }));
        try std.testing.expectError(error.FileNotFound, childRunWithOptions(std.testing.allocator, &.{"/pantry-test-missing-program"}, .{ .timeout_ms = 100 }));
        try std.testing.expectError(error.FileNotFound, childRunWithOptions(std.testing.allocator, &.{"/bin/sh"}, .{ .cwd = "/pantry-test-missing-directory", .timeout_ms = 100 }));
    }
    try std.testing.expectEqual(before, try countTestThreadChildren());
    const term = try sentinel.wait(getIo());
    try std.testing.expect(term == .exited);
    try std.testing.expectEqual(@as(u8, 23), term.exited);
}

test "failed captured launches release their pipes" {
    if (comptime is_windows) return error.SkipZigTest;
    const warm = try childRun(std.testing.allocator, &.{ "/bin/sh", "-c", "true" });
    std.testing.allocator.free(warm.stdout);
    std.testing.allocator.free(warm.stderr);
    const before = countOpenCaptureDescriptors();
    for (0..64) |_| {
        try std.testing.expectError(error.FileNotFound, childRun(std.testing.allocator, &.{"/pantry-test-missing-program"}));
        try std.testing.expectError(error.FileNotFound, childRun(std.testing.allocator, &.{"pantry-test-missing-program"}));
        try std.testing.expectError(error.FileNotFound, childRunWithOptions(std.testing.allocator, &.{"/bin/sh"}, .{ .cwd = "/pantry-test-missing-directory" }));
    }
    try std.testing.expectEqual(before, countOpenCaptureDescriptors());
}

test "captured launches drain both streams and preserve exit status" {
    if (comptime is_windows) return error.SkipZigTest;
    const result = try childRun(std.testing.allocator, &.{ "/bin/sh", "-c", "i=0; while [ \"$i\" -lt 16384 ]; do printf stdout; printf stderr >&2; i=$((i+1)); done; exit 7" });
    defer std.testing.allocator.free(result.stdout);
    defer std.testing.allocator.free(result.stderr);
    try std.testing.expect(result.term == .exited);
    try std.testing.expectEqual(@as(u8, 7), result.term.exited);
    try std.testing.expectEqual(@as(usize, 6 * 16384), result.stdout.len);
    try std.testing.expectEqual(@as(usize, 6 * 16384), result.stderr.len);
    try std.testing.expect(std.mem.startsWith(u8, result.stdout, "stdoutstdout"));
    try std.testing.expect(std.mem.startsWith(u8, result.stderr, "stderrstderr"));
}

test "captured launches preserve argument boundaries cwd environment and stdin EOF" {
    if (comptime is_windows) return error.SkipZigTest;
    const allocator = std.testing.allocator;
    const directory = try getCwdAlloc(allocator);
    defer allocator.free(directory);
    const result = try childRunWithOptions(allocator, &.{ "sh", "-c", "printf '%s\\n' \"$1\"; pwd -P; test -n \"$PATH\" || exit 3; if read -r value; then exit 4; fi", "pantry-child-test", "one argument; $(not-a-command)" }, .{ .cwd = directory });
    defer allocator.free(result.stdout);
    defer allocator.free(result.stderr);
    const expected = try std.fmt.allocPrint(allocator, "one argument; $(not-a-command)\n{s}\n", .{directory});
    defer allocator.free(expected);
    try std.testing.expect(result.term == .exited);
    try std.testing.expectEqual(@as(u8, 0), result.term.exited);
    try std.testing.expectEqualStrings(expected, result.stdout);
    try std.testing.expectEqualStrings("", result.stderr);
}

test "timeout launches retain exit status and reap terminated children" {
    if (comptime builtin.os.tag != .linux) return error.SkipZigTest;
    const before = try countTestThreadChildren();
    const success = try childRunWithOptions(std.testing.allocator, &.{ "/bin/sh", "-c", "exit 31" }, .{ .timeout_ms = 1000 });
    defer std.testing.allocator.free(success.stdout);
    defer std.testing.allocator.free(success.stderr);
    try std.testing.expect(!success.timed_out);
    try std.testing.expect(success.term == .exited);
    try std.testing.expectEqual(@as(u8, 31), success.term.exited);
    const timeout = try childRunWithOptions(std.testing.allocator, &.{ "/bin/sh", "-c", "exec sleep 2" }, .{ .timeout_ms = 30 });
    defer std.testing.allocator.free(timeout.stdout);
    defer std.testing.allocator.free(timeout.stderr);
    try std.testing.expect(timeout.timed_out);
    try std.testing.expectEqual(before, try countTestThreadChildren());
}

const CapturePipe = struct {
    reader: File,
    writer: ?File,

    fn init() !CapturePipe {
        const descriptors = try Threaded.pipe2(.{ .CLOEXEC = true });
        return .{
            .reader = .{ .handle = descriptors[0], .flags = .{ .nonblocking = false } },
            .writer = .{ .handle = descriptors[1], .flags = .{ .nonblocking = false } },
        };
    }

    fn closeWriter(self: *CapturePipe) void {
        if (self.writer) |file| file.close(io);
        self.writer = null;
    }

    fn deinit(self: *CapturePipe) void {
        self.closeWriter();
        self.reader.close(io);
    }
};

fn runCapturedProcess(allocator: std.mem.Allocator, argv: []const []const u8, cwd_path: ?[]const u8) !ChildRunResult {
    // Pantry owns capture descriptors from creation through cleanup, including
    // a launch rejected before a Child is returned (missing program or cwd).
    // Passing open files also keeps descriptor ownership independent of the
    // process backend's success-only Child cleanup.
    var stdout = try CapturePipe.init();
    defer stdout.deinit();
    var stderr = try CapturePipe.init();
    defer stderr.deinit();
    var child = if (comptime owned_spawn.supported) try owned_spawn.spawn(allocator, getIo(), argv, .{
        .cwd = cwd_path,
        .ignore_stdin = true,
        .stdout = stdout.writer.?,
        .stderr = stderr.writer.?,
    }) else try std.process.spawn(getIo(), .{
        .argv = argv,
        .cwd = toCwd(cwd_path),
        .stdin = .ignore,
        .stdout = .{ .file = stdout.writer.? },
        .stderr = .{ .file = stderr.writer.? },
    });
    defer child.kill(getIo());
    stdout.closeWriter();
    stderr.closeWriter();

    var buffer: Io.File.MultiReader.Buffer(2) = undefined;
    var reader: Io.File.MultiReader = undefined;
    reader.init(allocator, getIo(), buffer.toStreams(), &.{ stdout.reader, stderr.reader });
    defer reader.deinit();
    while (reader.fill(64, .none)) |_| {} else |err| switch (err) {
        error.EndOfStream => {},
        else => return err,
    }
    try reader.checkAnyError();
    const term = try child.wait(getIo());
    const out = try reader.toOwnedSlice(0);
    errdefer allocator.free(out);
    const err = try reader.toOwnedSlice(1);
    return .{ .term = term, .stdout = out, .stderr = err };
}

/// Run a child process with additional options (cwd, env_map, timeout)
pub fn childRunWithOptions(allocator: std.mem.Allocator, argv: []const []const u8, options: ChildRunOptions) !ChildRunResult {
    _ = options.env_map; // env_map support disabled for cross-version compat

    // When timeout is requested, use spawn + waitWithTimeout with inherited stdio
    // (output streams directly to terminal in real-time)
    if (options.timeout_ms > 0) {
        return childRunWithTimeout(allocator, argv, options);
    }

    if (comptime !is_windows) return runCapturedProcess(allocator, argv, options.cwd);

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

    var child = if (comptime owned_spawn.supported) try owned_spawn.spawn(allocator, getIo(), argv, .{ .cwd = options.cwd }) else try std.process.spawn(getIo(), .{
        .argv = argv,
        .cwd = cwd_value,
    });
    defer child.kill(getIo());

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
            const duped = try dupeZ(allocator, u8, content[start..i]);
            args[idx] = duped;
            idx += 1;
            i += 1;
        }
        return args;
    } else if (native_os == .windows) {
        const GetCommandLineW = @extern(*const fn () callconv(.winapi) [*:0]const u16, .{ .name = "GetCommandLineW" });
        return windowsArgsAlloc(allocator, std.mem.span(GetCommandLineW()));
    } else {
        @compileError("argsAlloc not supported on this platform");
    }
}

/// Parse the real Windows command line with the standard runtime rules.
pub fn windowsArgsAlloc(allocator: std.mem.Allocator, command_line: []const u16) ![]const [:0]const u8 {
    var iterator = try std.process.Args.Iterator.Windows.init(allocator, command_line);
    defer iterator.deinit();
    var args: std.ArrayList([:0]const u8) = .empty;
    errdefer {
        for (args.items) |arg| allocator.free(arg);
        args.deinit(allocator);
    }
    while (iterator.next()) |arg| {
        const owned = try dupeZ(allocator, u8, arg);
        errdefer allocator.free(owned);
        try args.append(allocator, owned);
    }
    return args.toOwnedSlice(allocator);
}

/// Free the result of argsAlloc. Mirrors its per-platform allocation: on
/// macOS/iOS the arg strings are borrowed from the OS argv (free only the
/// array); on Linux/FreeBSD each string was dup'd (free strings + array).
pub fn argsFree(allocator: std.mem.Allocator, args: []const [:0]const u8) void {
    if (builtin.os.tag == .linux or builtin.os.tag == .freebsd or builtin.os.tag == .windows) {
        for (args) |a| allocator.free(a);
    }
    allocator.free(args);
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
        defer _ = std.c.close(fd);
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
pub fn clockGettime() Timespec {
    if (comptime is_windows) {
        var ft: win32.FILETIME = undefined;
        win32.GetSystemTimeAsFileTime(&ft);
        const ticks: u64 = @as(u64, ft.dwHighDateTime) << 32 | ft.dwLowDateTime;
        const unix_ticks: i64 = @as(i64, @bitCast(ticks)) - 116444736000000000;
        return .{ .sec = @divFloor(unix_ticks, 10000000), .nsec = @mod(unix_ticks, 10000000) * 100 };
    }
    var ts: c.timespec = .{ .sec = 0, .nsec = 0 };
    _ = c.clock_gettime(c.CLOCK.REALTIME, &ts);
    return .{ .sec = ts.sec, .nsec = ts.nsec };
}

/// Get current monotonic timespec (for benchmarking/timing)
pub fn clockGettimeMonotonic() Timespec {
    if (comptime is_windows) {
        var ft: win32.FILETIME = undefined;
        win32.GetSystemTimeAsFileTime(&ft);
        const ticks: u64 = @as(u64, ft.dwHighDateTime) << 32 | ft.dwLowDateTime;
        const unix_ticks: i64 = @as(i64, @bitCast(ticks)) - 116444736000000000;
        return .{ .sec = @divFloor(unix_ticks, 10000000), .nsec = @mod(unix_ticks, 10000000) * 100 };
    }
    var ts: c.timespec = .{ .sec = 0, .nsec = 0 };
    _ = c.clock_gettime(c.CLOCK.MONOTONIC, &ts);
    return .{ .sec = ts.sec, .nsec = ts.nsec };
}

/// Mutex wrapper — spin lock using atomics (works across all Zig 0.16 dev builds)
pub const Mutex = struct {
    locked: std.atomic.Value(u32) = std.atomic.Value(u32).init(0),

    pub fn lock(self: *Mutex) void {
        while (self.locked.cmpxchgWeak(0, 1, .acquire, .monotonic) != null) {
            std.atomic.spinLoopHint();
        }
    }

    pub fn unlock(self: *Mutex) void {
        self.locked.store(0, .release);
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
    PaymentRequired,
    InvalidUrl,
    NetworkError,
    FileWriteFailed,
};

/// How an outgoing request should be adjusted for the registry it is aimed at:
/// sent somewhere else (a self-hosted registry) and/or authenticated (a private
/// one). Both fields, when present, are owned by the allocator handed to the
/// provider and freed by the caller.
///
/// The provider itself lives in `registry/endpoint.zig`; this module only holds
/// the shape and the hook, so the low-level HTTP code carries no knowledge of
/// credentials or configuration.
pub const RequestDecoration = struct {
    url: ?[]const u8 = null,
    authorization: ?[]const u8 = null,

    pub fn deinit(self: RequestDecoration, allocator: std.mem.Allocator) void {
        if (self.url) |v| allocator.free(v);
        if (self.authorization) |v| allocator.free(v);
    }

    pub fn effectiveUrl(self: RequestDecoration, original: []const u8) []const u8 {
        return self.url orelse original;
    }

    pub fn headers(self: RequestDecoration, buf: *[1]std.http.Header) []const std.http.Header {
        if (self.authorization) |value| {
            buf[0] = .{ .name = "Authorization", .value = value };
            return buf[0..1];
        }
        return &.{};
    }

    pub fn isEmpty(self: RequestDecoration) bool {
        return self.url == null and self.authorization == null;
    }
};

/// Installed once at startup by `registry.endpoint.install()`. Unset (the case
/// in tests and in any embedding that doesn't want it) means every request goes
/// out exactly as written.
pub var decorate_request: ?*const fn (std.mem.Allocator, []const u8) RequestDecoration = null;

/// Ask the installed provider how to send this request.
pub fn decorateRequest(allocator: std.mem.Allocator, url: []const u8) RequestDecoration {
    const provider = decorate_request orelse return .{};
    return provider(allocator, url);
}

/// Merge an `Authorization` decoration into a caller's own header list.
/// `buf` must have room for `extra.len + 1` headers.
fn mergedHeaders(
    buf: []std.http.Header,
    extra: []const std.http.Header,
    decoration: RequestDecoration,
) []const std.http.Header {
    const auth = decoration.authorization orelse return extra;
    // A caller that set its own Authorization means it: sending both produces
    // one joined header value ("Bearer a, Bearer b") that no server accepts.
    for (extra) |header| {
        if (std.ascii.eqlIgnoreCase(header.name, "Authorization")) return extra;
    }
    if (buf.len < extra.len + 1) return extra;
    @memcpy(buf[0..extra.len], extra);
    buf[extra.len] = .{ .name = "Authorization", .value = auth };
    return buf[0 .. extra.len + 1];
}

/// Fetch a URL's response body into allocated memory (replaces `curl -sL <url>`).
/// Handles HTTPS (native TLS), redirects (up to 10), and content decompression.
/// Caller owns the returned slice and must free it with `allocator`.
pub fn httpGet(allocator: std.mem.Allocator, url: []const u8) ![]u8 {
    var client: std.http.Client = .{
        .allocator = allocator,
        .io = io,
    };
    defer client.deinit();

    const decoration = decorateRequest(allocator, url);
    defer decoration.deinit(allocator);
    var header_buf: [1]std.http.Header = undefined;

    var alloc_writer = std.Io.Writer.Allocating.init(allocator);
    errdefer alloc_writer.deinit();

    var redirect_buf: [8192]u8 = undefined;

    const result = client.fetch(.{
        .location = .{ .url = decoration.effectiveUrl(url) },
        .response_writer = &alloc_writer.writer,
        .redirect_buffer = &redirect_buf,
        .redirect_behavior = @fromBackingInt(@intCast(10)),
        .extra_headers = decoration.headers(&header_buf),
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

/// Download a URL to a file on disk via curl subprocess. Returns on success;
/// errors if curl is not found or exits non-zero. `-fsSL` fails on HTTP errors,
/// stays silent, and follows redirects.
fn curlDownloadFile(allocator: std.mem.Allocator, url: []const u8, dest_path: []const u8, auth_header: ?[]const u8) !void {
    const curl_paths = [_][]const u8{ "/usr/bin/curl", "curl" };
    var tried = false;
    for (curl_paths) |curl| {
        // curl drops Authorization when a redirect crosses hosts, so a private
        // registry can still hand out presigned object-storage URLs without the
        // token following the download off-site.
        var args_buf: [13][]const u8 = undefined;
        var argc: usize = 0;
        for ([_][]const u8{ curl, "-fsSL", "--connect-timeout", "30", "--retry", "3", "--max-time", "300" }) |a| {
            args_buf[argc] = a;
            argc += 1;
        }
        if (auth_header) |header| {
            args_buf[argc] = "-H";
            argc += 1;
            args_buf[argc] = header;
            argc += 1;
        }
        args_buf[argc] = "-o";
        argc += 1;
        args_buf[argc] = dest_path;
        argc += 1;
        args_buf[argc] = url;
        argc += 1;
        const args = args_buf[0..argc];
        const result = childRun(allocator, args) catch continue;
        defer allocator.free(result.stdout);
        defer allocator.free(result.stderr);
        tried = true;
        switch (result.term) {
            .exited => |code| if (code == 0) return,
            else => {},
        }
    }
    return if (tried) error.HttpRequestFailed else error.CurlNotFound;
}

/// Download a URL to a file on disk (replaces `curl -sfL -o <path> <url>`).
/// Handles HTTPS (native TLS), redirects (up to 10), and content decompression.
///
/// Tries curl first: the native Zig HTTP client mishandles some real-world
/// download chains — notably S3 presigned-URL redirects served over HTTP/2
/// (e.g. the Hetzner object storage backing the pantry registry), where it
/// writes corrupt bytes that then fail checksum verification. curl handles
/// these correctly and is already relied on for metadata fetches, so prefer it
/// and fall back to the Zig client only when curl is unavailable.
pub fn httpDownloadFile(allocator: std.mem.Allocator, url: []const u8, dest_path: []const u8) !void {
    const decoration = decorateRequest(allocator, url);
    defer decoration.deinit(allocator);
    const effective_url = decoration.effectiveUrl(url);

    const curl_header: ?[]const u8 = if (decoration.authorization) |value|
        std.fmt.allocPrint(allocator, "Authorization: {s}", .{value}) catch null
    else
        null;
    defer if (curl_header) |h| allocator.free(h);

    if (curlDownloadFile(allocator, effective_url, dest_path, curl_header)) {
        return;
    } else |_| {
        // curl missing or failed — fall through to the native client below.
    }

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
    var header_buf: [1]std.http.Header = undefined;

    const result = client.fetch(.{
        .location = .{ .url = effective_url },
        .response_writer = &file_writer.interface,
        .redirect_buffer = &redirect_buf,
        .redirect_behavior = @fromBackingInt(@intCast(10)),
        .extra_headers = decoration.headers(&header_buf),
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
    request_url: []u8,
    authorization: ?[]u8 = null,
    auth_headers: [1]std.http.Header = undefined,

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
        alloc.free(self.request_url);
        if (self.authorization) |authorization| alloc.free(authorization);
        alloc.destroy(self);
    }
};

/// Open a streaming HTTP GET connection (for progress-tracked downloads).
/// Returns a heap-allocated HttpStream with the response ready for body reading.
pub fn httpStreamGet(allocator: std.mem.Allocator, url: []const u8) !*HttpStream {
    const stream = try allocator.create(HttpStream);
    errdefer allocator.destroy(stream);
    const initial = decorateRequest(allocator, url);
    defer initial.deinit(allocator);
    stream.* = .{
        .client = .{ .allocator = allocator, .io = io },
        .req = undefined,
        .response = undefined,
        .redirect_buf = undefined,
        .request_url = try allocator.dupe(u8, initial.effectiveUrl(url)),
    };
    errdefer {
        stream.client.deinit();
        allocator.free(stream.request_url);
        if (stream.authorization) |authorization| allocator.free(authorization);
    }
    for (0..11) |_| {
        const decoration = decorateRequest(allocator, stream.request_url);
        defer decoration.deinit(allocator);
        if (decoration.authorization) |authorization| stream.authorization = try allocator.dupe(u8, authorization);
        const uri = try std.Uri.parse(stream.request_url);
        if (uri.user != null or uri.password != null) return error.InvalidUrl;
        if (stream.authorization) |authorization| stream.auth_headers[0] = .{ .name = "Authorization", .value = authorization };
        stream.req = try stream.client.request(.GET, uri, .{
            .redirect_behavior = .unhandled,
            .keep_alive = false,
            .headers = .{ .accept_encoding = .{ .override = "identity" } },
            .extra_headers = if (stream.authorization != null) &stream.auth_headers else &.{},
        });
        errdefer stream.req.deinit();
        stream.req.sendBodiless() catch |err| return requestTransportError(&stream.req, err);
        stream.response = stream.req.receiveHead(&stream.redirect_buf) catch |err| return requestTransportError(&stream.req, err);
        if (stream.response.head.status.class() == .redirect) {
            const location = stream.response.head.location orelse return error.InvalidUrl;
            var resolution_buffer: [16384]u8 = undefined;
            if (location.len > resolution_buffer.len) return error.InvalidUrl;
            @memcpy(resolution_buffer[0..location.len], location);
            var available: []u8 = &resolution_buffer;
            const next_uri = try uri.resolveInPlace(location.len, &available);
            const next_url = try std.fmt.allocPrint(allocator, "{f}", .{next_uri});
            stream.req.deinit();
            allocator.free(stream.request_url);
            stream.request_url = next_url;
            if (stream.authorization) |authorization| allocator.free(authorization);
            stream.authorization = null;
            continue;
        }
        const status = @backingInt(stream.response.head.status);
        if (status != 200) {
            const style = @import("cli/style.zig");
            style.print("  Download HTTP {d}\n", .{status});
            return switch (status) {
                401, 403 => error.RegistryAuthenticationRequired,
                404 => error.RegistryArtifactNotFound,
                402 => error.PaymentRequired,
                else => error.RegistryUnavailable,
            };
        }
        return stream;
    }
    return error.TooManyHttpRedirects;
}

/// Like `httpGet`, but reuses an existing `std.http.Client` for connection pooling.
/// The caller retains ownership of `client` — do NOT deinit it here.
pub fn httpGetWithClient(client: *std.http.Client, allocator: std.mem.Allocator, url: []const u8) ![]u8 {
    const decoration = decorateRequest(allocator, url);
    defer decoration.deinit(allocator);
    var header_buf: [1]std.http.Header = undefined;

    var alloc_writer = std.Io.Writer.Allocating.init(allocator);
    errdefer alloc_writer.deinit();

    var redirect_buf: [8192]u8 = undefined;

    const result = client.fetch(.{
        .location = .{ .url = decoration.effectiveUrl(url) },
        .response_writer = &alloc_writer.writer,
        .redirect_buffer = &redirect_buf,
        .redirect_behavior = @fromBackingInt(@intCast(10)),
        .extra_headers = decoration.headers(&header_buf),
    }) catch {
        return error.HttpRequestFailed;
    };

    if (result.status != .ok) {
        return error.HttpRequestFailed;
    }

    const data = alloc_writer.writer.buffer[0..alloc_writer.writer.end];
    const owned = try allocator.dupe(u8, data);
    alloc_writer.deinit();
    return owned;
}

/// HTTP GET with extra headers using a shared client for connection pooling.
/// Used for npm abbreviated metadata (application/vnd.npm.install-v1+json).
pub fn httpGetWithClientAndHeaders(client: *std.http.Client, allocator: std.mem.Allocator, url: []const u8, extra_headers: []const std.http.Header) ![]u8 {
    const decoration = decorateRequest(allocator, url);
    defer decoration.deinit(allocator);
    // Caller headers plus at most one Authorization header. Callers pass a
    // couple of Accept-style headers; anything longer keeps its own list and
    // simply goes out unauthenticated rather than silently dropping headers.
    var header_buf: [8]std.http.Header = undefined;

    var alloc_writer = std.Io.Writer.Allocating.init(allocator);
    errdefer alloc_writer.deinit();

    var redirect_buf: [8192]u8 = undefined;

    const result = client.fetch(.{
        .location = .{ .url = decoration.effectiveUrl(url) },
        .response_writer = &alloc_writer.writer,
        .redirect_buffer = &redirect_buf,
        .redirect_behavior = @fromBackingInt(@intCast(10)),
        .extra_headers = mergedHeaders(&header_buf, extra_headers, decoration),
    }) catch {
        return error.HttpRequestFailed;
    };

    if (result.status != .ok) {
        return error.HttpRequestFailed;
    }

    const data = alloc_writer.writer.buffer[0..alloc_writer.writer.end];
    const owned = try allocator.dupe(u8, data);
    alloc_writer.deinit();
    return owned;
}

const HttpGetResult = anyerror![]u8;

fn httpGetTask(client: *std.http.Client, allocator: std.mem.Allocator, url: []const u8, extra_headers: []const std.http.Header) HttpGetResult {
    if (extra_headers.len > 0) {
        return httpGetWithClientAndHeaders(client, allocator, url, extra_headers);
    }
    return httpGetWithClient(client, allocator, url);
}

/// HTTP GET with a bounded end-to-end timeout and optional request headers.
pub fn httpGetWithClientTimeout(
    client: *std.http.Client,
    allocator: std.mem.Allocator,
    url: []const u8,
    extra_headers: []const std.http.Header,
    timeout_ms: u64,
) ![]u8 {
    if (timeout_ms == 0) return httpGetTask(client, allocator, url, extra_headers);

    const Selection = union(enum) {
        response: HttpGetResult,
        timeout: void,
    };
    var result_buffer: [2]Selection = undefined;
    var select = std.Io.Select(Selection).init(getIo(), &result_buffer);

    try select.concurrent(.response, httpGetTask, .{ client, allocator, url, extra_headers });
    select.concurrent(.timeout, httpTimeoutTask, .{timeout_ms}) catch |err| {
        while (select.cancel()) |result| {
            if (result == .response) {
                if (result.response) |response| allocator.free(response) else |_| {}
            }
        }
        return err;
    };

    const first = try select.await();
    switch (first) {
        .response => |response| {
            while (select.cancel()) |_| {}
            return response;
        },
        .timeout => {
            while (select.cancel()) |result| {
                if (result == .response) {
                    if (result.response) |response| allocator.free(response) else |_| {}
                }
            }
            return error.Timeout;
        },
    }
}

/// HTTP GET with an isolated client and a bounded end-to-end timeout.
/// Use this for requests that execute concurrently on multiple OS threads so
/// cancellation cannot contend on a shared connection pool.
pub fn httpGetTimeout(
    allocator: std.mem.Allocator,
    url: []const u8,
    extra_headers: []const std.http.Header,
    timeout_ms: u64,
) ![]u8 {
    var client: std.http.Client = .{
        .allocator = allocator,
        .io = io,
    };
    defer client.deinit();
    return httpGetWithClientTimeout(&client, allocator, url, extra_headers, timeout_ms);
}

/// A response whose status matters as much as its body.
pub const HttpResponse = struct {
    status: u16,
    body: []u8,

    pub fn ok(self: HttpResponse) bool {
        return self.status >= 200 and self.status < 300;
    }

    pub fn deinit(self: HttpResponse, allocator: std.mem.Allocator) void {
        allocator.free(self.body);
    }
};

/// HTTP request that reports the status instead of collapsing every non-200
/// into `error.HttpRequestFailed`. API callers need to tell "401, your token is
/// wrong" from "404, no such package" from "the host is unreachable" — the
/// other helpers here deliberately hide that, because their callers only ever
/// wanted the bytes.
pub fn httpRequest(
    allocator: std.mem.Allocator,
    method: std.http.Method,
    url: []const u8,
    body: ?[]const u8,
    extra_headers: []const std.http.Header,
) !HttpResponse {
    if (method == .GET and body == null) return httpGetResponseTimeout(allocator, url, extra_headers, 30_000);

    var client: std.http.Client = .{ .allocator = allocator, .io = io };
    defer client.deinit();

    const decoration = decorateRequest(allocator, url);
    defer decoration.deinit(allocator);
    var header_buf: [8]std.http.Header = undefined;

    var alloc_writer = std.Io.Writer.Allocating.init(allocator);
    errdefer alloc_writer.deinit();

    var redirect_buf: [8192]u8 = undefined;

    const result = client.fetch(.{
        .location = .{ .url = decoration.effectiveUrl(url) },
        .method = method,
        .payload = body,
        .response_writer = &alloc_writer.writer,
        .redirect_buffer = &redirect_buf,
        .redirect_behavior = .unhandled,
        .headers = .{
            .content_type = if (body != null) .{ .override = "application/json" } else .default,
        },
        .extra_headers = mergedHeaders(&header_buf, extra_headers, decoration),
    }) catch {
        return error.HttpRequestFailed;
    };

    const data = alloc_writer.writer.buffer[0..alloc_writer.writer.end];
    const owned = try allocator.dupe(u8, data);
    alloc_writer.deinit();
    return .{ .status = @backingInt(result.status), .body = owned };
}

// Preserve cancellation before Io.Reader erases it as ReadFailed. Threaded
// acknowledges cancellation once, so swallowing it can strand Select.cancel.
fn requestTransportError(req: *std.http.Client.Request, fallback: anyerror) anyerror {
    if (req.connection) |connection| {
        if (fallback == error.ReadFailed) {
            if (connection.stream_reader.err) |err| return err;
            if (req.reader.body_err) |err| return err;
        }
        if (fallback == error.WriteFailed) {
            if (connection.stream_writer.err) |err| return err;
        }
    }
    return fallback;
}

fn sameHttpOrigin(a: std.Uri, b: std.Uri) bool {
    if (!std.ascii.eqlIgnoreCase(a.scheme, b.scheme)) return false;
    var a_buffer: [512]u8 = undefined;
    var b_buffer: [512]u8 = undefined;
    const a_host = (a.host orelse return false).toRaw(&a_buffer) catch return false;
    const b_host = (b.host orelse return false).toRaw(&b_buffer) catch return false;
    const default_port: u16 = if (std.ascii.eqlIgnoreCase(a.scheme, "https")) 443 else 80;
    return std.ascii.eqlIgnoreCase(a_host, b_host) and (a.port orelse default_port) == (b.port orelse default_port);
}

fn httpGetResponseTask(allocator: std.mem.Allocator, url: []const u8, extra_headers: []const std.http.Header, status_only_errors: bool) anyerror!HttpResponse {
    var client: std.http.Client = .{ .allocator = allocator, .io = io };
    defer client.deinit();
    var current_url = try allocator.dupe(u8, url);
    defer allocator.free(current_url);
    const initial_decoration = decorateRequest(allocator, url);
    defer initial_decoration.deinit(allocator);
    const initial_uri = try std.Uri.parse(initial_decoration.effectiveUrl(url));
    for (0..11) |_| {
        var next_url: ?[]u8 = null;
        {
            const decoration = decorateRequest(allocator, current_url);
            defer decoration.deinit(allocator);
            const uri = try std.Uri.parse(decoration.effectiveUrl(current_url));
            if (uri.user != null or uri.password != null) return error.InvalidUrl;
            if (!std.ascii.eqlIgnoreCase(uri.scheme, "http") and !std.ascii.eqlIgnoreCase(uri.scheme, "https")) return error.InvalidUrl;
            var headers = std.ArrayList(std.http.Header).empty;
            defer headers.deinit(allocator);
            for (extra_headers) |header| {
                const sensitive = std.ascii.eqlIgnoreCase(header.name, "Authorization") or std.ascii.eqlIgnoreCase(header.name, "Cookie") or std.ascii.eqlIgnoreCase(header.name, "Proxy-Authorization");
                if (!sensitive or sameHttpOrigin(initial_uri, uri)) try headers.append(allocator, header);
            }
            var has_authorization = false;
            for (headers.items) |header| {
                if (std.ascii.eqlIgnoreCase(header.name, "Authorization")) has_authorization = true;
            }
            if (!has_authorization) {
                if (decoration.authorization) |authorization| try headers.append(allocator, .{ .name = "Authorization", .value = authorization });
            }
            var req = try client.request(.GET, uri, .{
                .extra_headers = headers.items,
                .keep_alive = false,
                .redirect_behavior = .unhandled,
                .headers = .{ .accept_encoding = .{ .override = "identity" } },
            });
            defer req.deinit();
            req.sendBodiless() catch |err| return requestTransportError(&req, err);
            var redirect_buffer: [8192]u8 = undefined;
            var response = req.receiveHead(&redirect_buffer) catch |err| return requestTransportError(&req, err);
            if (response.head.status.class() == .redirect) {
                const location = response.head.location orelse return error.InvalidUrl;
                var resolution_buffer: [16384]u8 = undefined;
                if (location.len > resolution_buffer.len) return error.InvalidUrl;
                @memcpy(resolution_buffer[0..location.len], location);
                var available: []u8 = &resolution_buffer;
                const next_uri = try uri.resolveInPlace(location.len, &available);
                next_url = try std.fmt.allocPrint(allocator, "{f}", .{next_uri});
            } else {
                const status = @backingInt(response.head.status);
                // An error's status is decisive; never wait for an untrusted
                // error body before reporting authentication or availability.
                if (status_only_errors and (status < 200 or status >= 300)) return .{ .status = status, .body = try allocator.alloc(u8, 0) };
                const body = response.reader(&.{}).allocRemaining(allocator, std.Io.Limit.limited(32 * 1024 * 1024)) catch |err| return requestTransportError(&req, err);
                return .{ .status = status, .body = body };
            }
        }
        allocator.free(current_url);
        current_url = next_url orelse unreachable;
    }
    return error.TooManyHttpRedirects;
}

/// Status-preserving GET with one deadline for headers, redirects and body.
/// Every redirect recomputes registry credentials for its exact origin.
pub fn httpGetResponseTimeout(allocator: std.mem.Allocator, url: []const u8, extra_headers: []const std.http.Header, timeout_ms: u64) !HttpResponse {
    return httpGetResponseWithPolicy(allocator, url, extra_headers, timeout_ms, false);
}

/// Metadata lookup needs the failure status immediately, even if an error body stalls.
pub fn httpGetStatusTimeout(allocator: std.mem.Allocator, url: []const u8, timeout_ms: u64) !HttpResponse {
    return httpGetResponseWithPolicy(allocator, url, &.{}, timeout_ms, true);
}

fn httpGetResponseWithPolicy(allocator: std.mem.Allocator, url: []const u8, extra_headers: []const std.http.Header, timeout_ms: u64, status_only_errors: bool) !HttpResponse {
    const Selection = union(enum) { response: anyerror!HttpResponse, timeout: void };
    var buffer: [2]Selection = undefined;
    var select = std.Io.Select(Selection).init(getIo(), &buffer);
    try select.concurrent(.response, httpGetResponseTask, .{ allocator, url, extra_headers, status_only_errors });
    select.concurrent(.timeout, httpTimeoutTask, .{timeout_ms}) catch |err| {
        while (select.cancel()) |result| {
            if (result == .response) {
                if (result.response) |response| response.deinit(allocator) else |_| {}
            }
        }
        return err;
    };
    const first = try select.await();
    switch (first) {
        .response => |response| {
            while (select.cancel()) |_| {}
            return response;
        },
        .timeout => {
            while (select.cancel()) |result| {
                if (result == .response) {
                    if (result.response) |response| response.deinit(allocator) else |_| {}
                }
            }
            return error.Timeout;
        },
    }
}


/// HTTP POST with JSON body. Returns response body as owned slice.
pub fn httpPostJson(allocator: std.mem.Allocator, url: []const u8, json_body: []const u8) ![]u8 {
    var client: std.http.Client = .{
        .allocator = allocator,
        .io = io,
    };
    defer client.deinit();
    return httpPostJsonWithClient(&client, allocator, url, json_body);
}

/// HTTP POST with JSON body using a shared client for connection pooling.
pub fn httpPostJsonWithClient(client: *std.http.Client, allocator: std.mem.Allocator, url: []const u8, json_body: []const u8) ![]u8 {
    const decoration = decorateRequest(allocator, url);
    defer decoration.deinit(allocator);
    var header_buf: [1]std.http.Header = undefined;

    var alloc_writer = std.Io.Writer.Allocating.init(allocator);
    errdefer alloc_writer.deinit();

    var redirect_buf: [8192]u8 = undefined;

    const result = client.fetch(.{
        .location = .{ .url = decoration.effectiveUrl(url) },
        .method = .POST,
        .payload = json_body,
        .response_writer = &alloc_writer.writer,
        .redirect_buffer = &redirect_buf,
        .redirect_behavior = @fromBackingInt(@intCast(10)),
        .headers = .{
            .content_type = .{ .override = "application/json" },
        },
        .extra_headers = decoration.headers(&header_buf),
    }) catch {
        return error.HttpRequestFailed;
    };

    if (result.status != .ok) {
        return error.HttpRequestFailed;
    }

    const data = alloc_writer.writer.buffer[0..alloc_writer.writer.end];
    const owned = try allocator.dupe(u8, data);
    alloc_writer.deinit();
    return owned;
}

const HttpPostResult = anyerror![]u8;

fn httpPostJsonTask(client: *std.http.Client, allocator: std.mem.Allocator, url: []const u8, json_body: []const u8) HttpPostResult {
    return httpPostJsonWithClient(client, allocator, url, json_body);
}

fn httpTimeoutTask(timeout_ms: u64) void {
    const ns: i96 = @intCast(@as(u128, timeout_ms) * @as(u128, std.time.ns_per_ms));
    getIo().sleep(.{ .nanoseconds = ns }, .awake) catch {};
}

/// HTTP POST with a bounded end-to-end timeout.
///
/// The request runs as a cancelable I/O task. If the deadline wins, cancellation
/// closes the pending socket operation before returning, so the shared HTTP
/// client and caller-owned request data remain safe to reuse.
pub fn httpPostJsonWithClientTimeout(
    client: *std.http.Client,
    allocator: std.mem.Allocator,
    url: []const u8,
    json_body: []const u8,
    timeout_ms: u64,
) ![]u8 {
    if (timeout_ms == 0) return httpPostJsonWithClient(client, allocator, url, json_body);

    const Selection = union(enum) {
        response: HttpPostResult,
        timeout: void,
    };
    var result_buffer: [2]Selection = undefined;
    var select = std.Io.Select(Selection).init(getIo(), &result_buffer);

    try select.concurrent(.response, httpPostJsonTask, .{ client, allocator, url, json_body });
    select.concurrent(.timeout, httpTimeoutTask, .{timeout_ms}) catch |err| {
        while (select.cancel()) |result| {
            if (result == .response) {
                if (result.response) |response| allocator.free(response) else |_| {}
            }
        }
        return err;
    };

    const first = try select.await();
    switch (first) {
        .response => |response| {
            while (select.cancel()) |_| {}
            return response;
        },
        .timeout => {
            while (select.cancel()) |result| {
                if (result == .response) {
                    if (result.response) |response| allocator.free(response) else |_| {}
                }
            }
            return error.Timeout;
        },
    }
}

/// HTTP POST with an isolated client and a bounded end-to-end timeout.
pub fn httpPostJsonTimeout(allocator: std.mem.Allocator, url: []const u8, json_body: []const u8, timeout_ms: u64) ![]u8 {
    var client: std.http.Client = .{
        .allocator = allocator,
        .io = io,
    };
    defer client.deinit();
    return httpPostJsonWithClientTimeout(&client, allocator, url, json_body, timeout_ms);
}

test "Windows arguments preserve native quoting and Unicode" {
    const command = std.unicode.utf8ToUtf16LeStringLiteral("\"C:\\Program Files\\pantry.exe\" install \"two words\" λ");
    const args = try windowsArgsAlloc(std.testing.allocator, command);
    defer {
        for (args) |arg| std.testing.allocator.free(arg);
        std.testing.allocator.free(args);
    }
    try std.testing.expectEqual(@as(usize, 4), args.len);
    try std.testing.expectEqualStrings("C:\\Program Files\\pantry.exe", args[0]);
    try std.testing.expectEqualStrings("install", args[1]);
    try std.testing.expectEqualStrings("two words", args[2]);
    try std.testing.expectEqualStrings("λ", args[3]);
}

test "buffered copies preserve executable and private data permissions" {
    if (comptime is_windows) return error.SkipZigTest;
    var tmp = std.testing.tmpDir(.{});
    defer tmp.cleanup();
    try tmp.dir.writeFile(io, .{ .sub_path = "program", .data = "#!/bin/sh\nexit 0\n" });
    try tmp.dir.writeFile(io, .{ .sub_path = "data", .data = "fixture" });
    var root_buf: [std.fs.max_path_bytes]u8 = undefined;
    const root_len = try tmp.dir.realPathFile(io, ".", &root_buf);
    const allocator = std.testing.allocator;
    for ([_]struct { name: []const u8, mode: std.posix.mode_t }{
        .{ .name = "program", .mode = 0o751 },
        .{ .name = "data", .mode = 0o600 },
    }) |entry| {
        const source = try std.fs.path.join(allocator, &.{ root_buf[0..root_len], entry.name });
        defer allocator.free(source);
        const dest = try std.fmt.allocPrint(allocator, "{s}.copy", .{source});
        defer allocator.free(dest);
        const file = try openFileAbsolute(source, .{});
        try file.setPermissions(io, File.Permissions.fromMode(entry.mode));
        file.close(io);
        try copyFileFallback(source, dest);
        const copied = try openFileAbsolute(dest, .{});
        defer copied.close(io);
        try std.testing.expectEqual(entry.mode, (try copied.stat(io)).permissions.toMode() & 0o777);
        try std.testing.expectEqual(entry.mode & 0o111 != 0, isExecutable(dest));
    }
}
