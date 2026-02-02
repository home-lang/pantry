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

/// Make a directory path recursively using libc mkdir
pub fn makePath(path: []const u8) !void {
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
        if (std.mem.lastIndexOfScalar(u8, path, '/')) |sep| {
            if (sep > 0) {
                try makePath(path[0..sep]);
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
    const open_flags: std.posix.O = .{ .ACCMODE = .RDONLY, .CLOEXEC = true };
    const fd = std.posix.openat(std.posix.AT.FDCWD, path, open_flags, 0) catch return error.FileNotFound;
    std.posix.close(fd);
}

/// Check access to an absolute path
pub fn accessAbsolute(path: []const u8, flags: Dir.AccessOptions) !void {
    _ = flags;
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
    const n = try std.process.currentPath(getIo(), out_buffer);
    return out_buffer[0..n];
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
        const result = c.write(handle, remaining.ptr, remaining.len);
        if (result < 0) {
            // On EAGAIN/EWOULDBLOCK, retry
            const err = std.posix.errno(result);
            if (err == .AGAIN) continue;
            return error.InputOutput;
        }
        const written: usize = @intCast(result);
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
    const fd = try std.posix.openat(std.posix.AT.FDCWD, path, flags, 0);
    return .{ .fd = fd };
}

/// Open a directory for iteration with absolute path
pub fn openDirAbsoluteForIteration(path: []const u8) !FsDir {
    return openDirForIteration(path);
}

/// Open a file with absolute path
/// Opens from root directory for absolute paths
pub fn openFileAbsolute(path: []const u8, flags: File.OpenFlags) !File {
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
    const fd = try std.posix.openat(std.posix.AT.FDCWD, path, posix_flags, 0);
    return File{ .handle = fd };
}

/// Open a directory with absolute path
pub fn openDirAbsolute(path: []const u8, options: Dir.OpenOptions) !Dir {
    _ = options;
    const flags: std.posix.O = .{ .DIRECTORY = true, .CLOEXEC = true };
    const fd = try std.posix.openat(std.posix.AT.FDCWD, path, flags, 0);
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

/// Re-export SpawnOptions for callers
pub const SpawnOptions = std.process.SpawnOptions;

/// Spawn a child process and wait for it to complete
pub fn spawnAndWait(options: SpawnOptions) !std.process.Child.Term {
    var child = try std.process.spawn(getIo(), options);
    return try child.wait(getIo());
}

/// Spawn a child process (without waiting)
pub fn spawn(options: SpawnOptions) !std.process.Child {
    return try std.process.spawn(getIo(), options);
}

/// Wait for a spawned child process
pub fn wait(child: *std.process.Child) !std.process.Child.Term {
    return try child.wait(getIo());
}

/// Kill a spawned child process
pub fn kill(child: *std.process.Child) void {
    child.kill(getIo());
}

/// Result type for childRun
pub const ChildRunResult = struct {
    term: std.process.Child.Term,
    stdout: []u8,
    stderr: []u8,
};

/// Options for childRunWithOptions
pub const ChildRunOptions = struct {
    cwd: ?[]const u8 = null,
    env_map: ?*std.process.Environ.Map = null,
};

/// Run a child process and collect output
/// Handles cross-platform differences in the Child.run signature
pub fn childRun(allocator: std.mem.Allocator, argv: []const []const u8) !ChildRunResult {
    return childRunWithOptions(allocator, argv, .{});
}

/// Run a child process with additional options (cwd, env_map)
pub fn childRunWithOptions(allocator: std.mem.Allocator, argv: []const []const u8, options: ChildRunOptions) !ChildRunResult {
    const result = try std.process.run(allocator, getIo(), .{
        .argv = argv,
        .cwd = options.cwd,
        .environ_map = options.env_map,
    });
    return .{
        .term = result.term,
        .stdout = result.stdout,
        .stderr = result.stderr,
    };
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
    const result = try std.process.currentPathAlloc(getIo(), allocator);
    return result;
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
    } else if (native_os == .linux) {
        // On Linux, read /proc/self/cmdline
        const file = openFileAbsolute("/proc/self/cmdline", .{}) catch return error.InvalidArgv;
        defer _ = c.close(file.handle);

        var buf: [1024 * 1024]u8 = undefined;
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
    } else {
        @compileError("argsAlloc not supported on this platform");
    }
}

/// Fill buffer with random bytes
/// Replacement for std.crypto.random.bytes which was removed
pub fn randomBytes(buf: []u8) void {
    var source: std.Random.IoSource = .{ .io = getIo() };
    source.interface().bytes(buf);
}

/// Sleep for the given number of nanoseconds
/// Replacement for std.posix.nanosleep which was removed
pub fn nanosleep(secs: u64, nsecs: u64) void {
    var ts: c.timespec = .{ .sec = @intCast(secs), .nsec = @intCast(nsecs) };
    _ = c.nanosleep(&ts, &ts);
}

/// Get the process environment as an Environ.Map
/// Replacement for std.process.getEnvMap which was removed
pub fn getEnvMap(allocator: std.mem.Allocator) !std.process.Environ.Map {
    // Build the Environ from C's environ pointer
    // c.environ is [*:null]?[*:0]u8, need [:null]const ?[*:0]const u8
    const raw_environ = c.environ;
    // Count entries
    var count: usize = 0;
    while (raw_environ[count] != null) : (count += 1) {}
    const environ: std.process.Environ = .{
        .block = @as([*:null]const ?[*:0]const u8, @ptrCast(raw_environ))[0..count :null],
    };
    return try std.process.Environ.createMap(environ, allocator);
}
