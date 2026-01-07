const std = @import("std");
const io_helper = @import("../io_helper.zig");
const lib = @import("../lib.zig");

pub const WrapperError = error{
    WrapperCreationFailed,
    BinaryNotFound,
    PermissionDenied,
};

/// Generate shell wrapper script for a binary
pub fn generateShellWrapper(
    allocator: std.mem.Allocator,
    binary_path: []const u8,
    env_vars: ?std.StringHashMap([]const u8),
) ![]const u8 {
    var buffer = std.ArrayList(u8).init(allocator);
    errdefer buffer.deinit();

    try buffer.appendSlice("#!/bin/sh\n");
    try buffer.appendSlice("# Auto-generated wrapper by Pantry\n\n");

    // Add environment variables if provided
    if (env_vars) |vars| {
        var it = vars.iterator();
        while (it.next()) |entry| {
            try buffer.writer().print("export {s}=\"{s}\"\n", .{ entry.key_ptr.*, entry.value_ptr.* });
        }
        if (vars.count() > 0) {
            try buffer.appendSlice("\n");
        }
    }

    // Execute the actual binary with all arguments
    try buffer.writer().print("exec \"{s}\" \"$@\"\n", .{binary_path});

    return try buffer.toOwnedSlice();
}

/// Create wrapper script for a binary
pub fn createBinaryWrapper(
    allocator: std.mem.Allocator,
    binary_name: []const u8,
    binary_path: []const u8,
    wrapper_dir: []const u8,
    env_vars: ?std.StringHashMap([]const u8),
) !void {
    // Verify binary exists
    io_helper.cwd().access(io_helper.io, binary_path, .{}) catch {
        std.debug.print("  ✗ Binary not found: {s}\n", .{binary_path});
        return error.BinaryNotFound;
    };

    // Generate wrapper content
    const wrapper_content = try generateShellWrapper(allocator, binary_path, env_vars);
    defer allocator.free(wrapper_content);

    // Create wrapper directory
    io_helper.makePath(wrapper_dir) catch {
        return error.WrapperCreationFailed;
    };

    // Write wrapper file
    const wrapper_path = try std.fmt.allocPrint(
        allocator,
        "{s}/{s}",
        .{ wrapper_dir, binary_name },
    );
    defer allocator.free(wrapper_path);

    const file = io_helper.cwd().createFile(io_helper.io, wrapper_path, .{ .mode = 0o755 }) catch {
        return error.WrapperCreationFailed;
    };
    defer file.close(io_helper.io);

    io_helper.writeAllToFile(file, wrapper_content) catch {
        return error.WrapperCreationFailed;
    };

    std.debug.print("  ✓ Created wrapper: {s}\n", .{wrapper_path});
}

/// Create wrappers for all binaries in a package
pub fn createPackageWrappers(
    allocator: std.mem.Allocator,
    package_name: []const u8,
    version: []const u8,
    install_base: []const u8,
    env_vars: ?std.StringHashMap([]const u8),
) !void {
    const package_bin_dir = try std.fmt.allocPrint(
        allocator,
        "{s}/{s}/v{s}/bin",
        .{ install_base, package_name, version },
    );
    defer allocator.free(package_bin_dir);

    // Open bin directory
    var dir = io_helper.cwd().openDir(io_helper.io, package_bin_dir, .{ .iterate = true }) catch {
        std.debug.print("  ! No bin directory found: {s}\n", .{package_bin_dir});
        return;
    };
    defer dir.close(io_helper.io);

    const wrapper_dir = try std.fmt.allocPrint(
        allocator,
        "{s}/wrappers/{s}",
        .{ install_base, package_name },
    );
    defer allocator.free(wrapper_dir);

    var it = dir.iterate();
    var created_count: usize = 0;

    while (try it.next(io_helper.io)) |entry| {
        if (entry.kind == .file or entry.kind == .sym_link) {
            const binary_path = try std.fmt.allocPrint(
                allocator,
                "{s}/{s}",
                .{ package_bin_dir, entry.name },
            );
            defer allocator.free(binary_path);

            // Check if executable
            const stat = io_helper.cwd().statPath(io_helper.io, binary_path) catch continue;
            const is_executable = (stat.mode & 0o111) != 0;

            if (is_executable) {
                createBinaryWrapper(
                    allocator,
                    entry.name,
                    binary_path,
                    wrapper_dir,
                    env_vars,
                ) catch |err| {
                    std.debug.print("  ! Failed to create wrapper for {s}: {}\n", .{ entry.name, err });
                    continue;
                };
                created_count += 1;
            }
        }
    }

    if (created_count > 0) {
        std.debug.print("  ✓ Created {d} wrapper(s)\n", .{created_count});
    }
}

/// Generate environment-specific wrapper
pub fn generateEnvWrapper(
    allocator: std.mem.Allocator,
    _: []const u8, // binary_name (unused)
    binary_path: []const u8,
    lib_path: ?[]const u8,
    additional_env: ?std.StringHashMap([]const u8),
) ![]const u8 {
    var buffer = std.ArrayList(u8).init(allocator);
    errdefer buffer.deinit();

    try buffer.appendSlice("#!/bin/sh\n");
    try buffer.appendSlice("# Auto-generated environment wrapper\n\n");

    // Set library path if provided
    if (lib_path) |path| {
        const platform = lib.Platform.current();
        const var_name = switch (platform) {
            .darwin => "DYLD_LIBRARY_PATH",
            .linux => "LD_LIBRARY_PATH",
            .windows => "PATH",
        };
        try buffer.writer().print("export {s}=\"{s}:${s}\"\n", .{ var_name, path, var_name });
    }

    // Add additional environment variables
    if (additional_env) |env| {
        var it = env.iterator();
        while (it.next()) |entry| {
            try buffer.writer().print("export {s}=\"{s}\"\n", .{ entry.key_ptr.*, entry.value_ptr.* });
        }
    }

    if (lib_path != null or (additional_env != null and additional_env.?.count() > 0)) {
        try buffer.appendSlice("\n");
    }

    // Execute binary
    try buffer.writer().print("exec \"{s}\" \"$@\"\n", .{binary_path});

    return try buffer.toOwnedSlice();
}

/// Fix macOS library paths using install_name_tool
pub fn fixMacOSLibraryPaths(
    allocator: std.mem.Allocator,
    binary_path: []const u8,
    lib_dir: []const u8,
) !void {
    const platform = lib.Platform.current();
    if (platform != .darwin) {
        return; // Only for macOS
    }

    // Use otool to find dependencies
    const result = try std.process.Child.run(.{
        .allocator = allocator,
        .argv = &[_][]const u8{ "otool", "-L", binary_path },
    });
    defer allocator.free(result.stdout);
    defer allocator.free(result.stderr);

    if (result.term.Exited != 0) {
        return; // Not a Mach-O binary
    }

    var lines = std.mem.split(u8, result.stdout, "\n");
    _ = lines.next(); // Skip first line (binary path)

    while (lines.next()) |line| {
        const trimmed = std.mem.trim(u8, line, " \t\r");
        if (trimmed.len == 0) continue;

        // Parse library path (format: "/path/to/lib (compatibility version ...)")
        var parts = std.mem.split(u8, trimmed, " ");
        const lib_path = parts.next() orelse continue;

        // Check if it's a local library (not system library)
        if (std.mem.startsWith(u8, lib_path, "/usr/lib") or
            std.mem.startsWith(u8, lib_path, "/System"))
        {
            continue;
        }

        // Extract library name
        const lib_name = std.fs.path.basename(lib_path);

        // Build new path
        const new_path = try std.fmt.allocPrint(
            allocator,
            "@rpath/{s}",
            .{lib_name},
        );
        defer allocator.free(new_path);

        // Run install_name_tool
        const change_result = try std.process.Child.run(.{
            .allocator = allocator,
            .argv = &[_][]const u8{
                "install_name_tool",
                "-change",
                lib_path,
                new_path,
                binary_path,
            },
        });
        defer allocator.free(change_result.stdout);
        defer allocator.free(change_result.stderr);

        if (change_result.term.Exited == 0) {
            std.debug.print("  ✓ Fixed library path: {s} -> {s}\n", .{ lib_name, new_path });
        }
    }

    // Add rpath
    const add_rpath = try std.process.Child.run(.{
        .allocator = allocator,
        .argv = &[_][]const u8{
            "install_name_tool",
            "-add_rpath",
            lib_dir,
            binary_path,
        },
    });
    defer allocator.free(add_rpath.stdout);
    defer allocator.free(add_rpath.stderr);

    if (add_rpath.term.Exited == 0) {
        std.debug.print("  ✓ Added rpath: {s}\n", .{lib_dir});
    }
}

test "generateShellWrapper" {
    const allocator = std.testing.allocator;

    const wrapper = try generateShellWrapper(allocator, "/usr/bin/node", null);
    defer allocator.free(wrapper);

    try std.testing.expect(std.mem.indexOf(u8, wrapper, "#!/bin/sh") != null);
    try std.testing.expect(std.mem.indexOf(u8, wrapper, "exec \"/usr/bin/node\"") != null);
}

test "generateShellWrapper with env vars" {
    const allocator = std.testing.allocator;

    var env_vars = std.StringHashMap([]const u8).init(allocator);
    defer env_vars.deinit();

    try env_vars.put("NODE_ENV", "production");
    try env_vars.put("PORT", "3000");

    const wrapper = try generateShellWrapper(allocator, "/usr/bin/node", env_vars);
    defer allocator.free(wrapper);

    try std.testing.expect(std.mem.indexOf(u8, wrapper, "export NODE_ENV=\"production\"") != null);
    try std.testing.expect(std.mem.indexOf(u8, wrapper, "export PORT=\"3000\"") != null);
}

test "createBinaryWrapper" {
    const allocator = std.testing.allocator;

    // Create test binary
    const test_bin_dir = "test_wrapper_bin";
    io_helper.cwd().makeDir(io_helper.io, test_bin_dir) catch {};
    defer io_helper.deleteTree(test_bin_dir) catch {};

    const test_bin = try std.fmt.allocPrint(allocator, "{s}/testbin", .{test_bin_dir});
    defer allocator.free(test_bin);

    {
        const file = try io_helper.cwd().createFile(io_helper.io, test_bin, .{ .mode = 0o755 });
        defer file.close(io_helper.io);
        try io_helper.writeAllToFile(file, "#!/bin/sh\necho test\n");
    }

    // Create wrapper
    const wrapper_dir = "test_wrappers";
    defer io_helper.deleteTree(wrapper_dir) catch {};

    try createBinaryWrapper(allocator, "testbin", test_bin, wrapper_dir, null);

    // Verify wrapper exists and is executable
    const wrapper_path = try std.fmt.allocPrint(allocator, "{s}/testbin", .{wrapper_dir});
    defer allocator.free(wrapper_path);

    const stat = try io_helper.cwd().statPath(io_helper.io, wrapper_path);
    try std.testing.expect((stat.mode & 0o111) != 0);
}
