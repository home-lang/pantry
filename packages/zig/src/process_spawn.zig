//! Owned POSIX launch handshake: a failed exec keeps its PID until it is reaped.
const std = @import("std");
const builtin = @import("builtin");
const c = std.c;

pub const supported = builtin.os.tag == .linux or builtin.os.tag == .freebsd;

pub const Options = struct {
    cwd: ?[]const u8 = null,
    ignore_stdin: bool = false,
    stdout: ?std.Io.File = null,
    stderr: ?std.Io.File = null,
};

fn reap(pid: std.process.Child.Id) void {
    var status: c_int = undefined;
    while (true) switch (std.posix.errno(std.posix.system.waitpid(pid, &status, 0))) {
        .INTR => continue,
        else => return,
    };
}

fn reportFailure(fd: std.posix.fd_t, failure: std.posix.E) noreturn {
    var code: c_int = @backingInt(failure);
    const bytes = std.mem.asBytes(&code);
    var offset: usize = 0;
    while (offset < bytes.len) {
        const written = c.write(fd, bytes.ptr + offset, bytes.len - offset);
        if (written < 0) {
            if (std.posix.errno(written) == .INTR) continue;
            break;
        }
        if (written == 0) break;
        offset += @intCast(written);
    }
    c._exit(127);
}

fn duplicate(fd: std.posix.fd_t, target: std.posix.fd_t, error_fd: std.posix.fd_t) void {
    if (fd == target) {
        // dup2(fd, fd) does not clear CLOEXEC.
        if (c.fcntl(target, std.posix.F.SETFD, @as(c_int, 0)) == -1)
            reportFailure(error_fd, std.posix.errno(@as(c_int, -1)));
    } else if (c.dup2(fd, target) == -1) {
        reportFailure(error_fd, std.posix.errno(@as(c_int, -1)));
    }
}

fn launchError(code: c_int) anyerror {
    return switch (@as(std.posix.E, @fromBackingInt(@intCast(code)))) {
        .NOENT => error.FileNotFound,
        .NOTDIR => error.NotDir,
        .ACCES => error.AccessDenied,
        .PERM => error.PermissionDenied,
        .NOEXEC, .INVAL => error.InvalidExe,
        .NAMETOOLONG => error.NameTooLong,
        .LOOP, .IO => error.FileSystem,
        .ISDIR => error.IsDir,
        .TXTBSY => error.FileBusy,
        .AGAIN, .NOMEM, .@"2BIG" => error.SystemResources,
        .MFILE => error.ProcessFdQuotaExceeded,
        .NFILE => error.SystemFdQuotaExceeded,
        else => error.Unexpected,
    };
}

pub fn spawn(allocator: std.mem.Allocator, io: std.Io, argv: []const []const u8, options: Options) !std.process.Child {
    if (comptime !supported) return error.OperationUnsupported;
    if (argv.len == 0) return error.InvalidArgument;

    // Allocate everything before fork. The child uses only async-signal-safe
    // operations, so concurrent allocator or I/O locks cannot deadlock it.
    var arena_state = std.heap.ArenaAllocator.init(allocator);
    defer arena_state.deinit();
    const arena = arena_state.allocator();
    const arguments = try arena.allocSentinel(?[*:0]const u8, argv.len, null);
    for (argv, 0..) |argument, i|
        arguments[i] = (try arena.dupeSentinel(u8, argument, 0)).ptr;
    const environ = std.mem.span(c.environ);
    const environment = try arena.allocSentinel(?[*:0]const u8, environ.len, null);
    for (environ, 0..) |entry, i|
        environment[i] = (try arena.dupeSentinel(u8, std.mem.span(entry.?), 0)).ptr;
    const directory = if (options.cwd) |value| try arena.dupeSentinel(u8, value, 0) else null;

    const search_path = std.mem.indexOfScalar(u8, argv[0], '/') == null;
    const path_value = if (c.getenv("PATH")) |value| std.mem.span(value) else "/usr/local/bin:/bin:/usr/bin";
    const paths = try arena.alloc([:0]const u8, if (search_path) std.mem.count(u8, path_value, ":") + 1 else 1);
    if (search_path) {
        var segments = std.mem.splitScalar(u8, path_value, ':');
        var i: usize = 0;
        while (segments.next()) |segment| : (i += 1) {
            const value = if (segment.len == 0) argv[0] else try std.fmt.allocPrint(arena, "{s}/{s}", .{ segment, argv[0] });
            paths[i] = try arena.dupeSentinel(u8, value, 0);
        }
    } else paths[0] = try arena.dupeSentinel(u8, argv[0], 0);

    const input = if (options.ignore_stdin) try std.Io.Dir.cwd().openFile(io, "/dev/null", .{ .mode = .read_only }) else null;
    defer if (input) |file| file.close(io);
    const errors = try std.Io.Threaded.pipe2(.{ .CLOEXEC = true });
    defer _ = c.close(errors[0]);
    var error_writer: ?std.posix.fd_t = errors[1];
    defer if (error_writer) |fd| {
        _ = c.close(fd);
    };

    const pid = c.fork();
    if (pid < 0) return error.SystemResources;
    if (pid == 0) {
        if (directory) |value| {
            if (c.chdir(value.ptr) == -1) reportFailure(errors[1], std.posix.errno(@as(c_int, -1)));
        }
        if (options.stdout) |file| duplicate(file.handle, 1, errors[1]);
        if (options.stderr) |file| duplicate(file.handle, 2, errors[1]);
        if (input) |file| duplicate(file.handle, 0, errors[1]);
        var access_denied = false;
        for (paths) |candidate| {
            _ = c.execve(candidate.ptr, arguments.ptr, environment.ptr);
            const failure = std.posix.errno(@as(c_int, -1));
            if (!search_path) reportFailure(errors[1], failure);
            switch (failure) {
                .ACCES => access_denied = true,
                .NOENT, .NOTDIR => {},
                else => reportFailure(errors[1], failure),
            }
        }
        reportFailure(errors[1], if (access_denied) .ACCES else .NOENT);
    }

    _ = c.close(errors[1]);
    error_writer = null;
    var owned_pid: ?std.process.Child.Id = pid;
    errdefer if (owned_pid) |id| {
        std.posix.kill(id, .KILL) catch {};
        reap(id);
    };
    var code: c_int = undefined;
    const bytes = std.mem.asBytes(&code);
    var offset: usize = 0;
    while (offset < bytes.len) {
        const received = try std.posix.read(errors[0], bytes[offset..]);
        if (received == 0) {
            if (offset != 0) return error.InputOutput;
            // EOF without an error means exec closed the CLOEXEC writer. Only
            // now does ownership transfer to Child.wait/kill.
            return .{ .id = pid, .thread_handle = {}, .stdin = null, .stdout = null, .stderr = null, .request_resource_usage_statistics = false };
        }
        offset += received;
    }
    reap(pid);
    owned_pid = null;
    return launchError(code);
}
