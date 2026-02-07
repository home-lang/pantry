const std = @import("std");
const io_helper = @import("../io_helper.zig");
const lib = @import("../lib.zig");
const style = @import("../cli/style.zig");

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
        style.print("  ✗ Binary not found: {s}\n", .{binary_path});
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

    style.print("  ✓ Created wrapper: {s}\n", .{wrapper_path});
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
        style.print("  ! No bin directory found: {s}\n", .{package_bin_dir});
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
                    style.print("  ! Failed to create wrapper for {s}: {}\n", .{ entry.name, err });
                    continue;
                };
                created_count += 1;
            }
        }
    }

    if (created_count > 0) {
        style.print("  ✓ Created {d} wrapper(s)\n", .{created_count});
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

/// Fix macOS library paths using install_name_tool.
/// Delegates to the canonical implementation in libfixer.zig.
pub const fixMacOSLibraryPaths = @import("libfixer.zig").fixMacOSLibraryPaths;

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
