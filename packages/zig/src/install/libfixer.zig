const std = @import("std");
const io_helper = @import("../io_helper.zig");

/// Fix macOS library paths using install_name_tool
/// This discovers @rpath dependencies using otool and fixes them to use absolute paths
pub fn fixMacOSLibraryPaths(
    allocator: std.mem.Allocator,
    binary_path: []const u8,
    lib_dir: []const u8,
) !void {
    const builtin = @import("builtin");

    // Only run on macOS
    if (builtin.os.tag != .macos) {
        return;
    }

    // Use otool to get current library dependencies
    const otool_result = std.process.Child.run(.{
        .allocator = allocator,
        .argv = &[_][]const u8{
            "otool",
            "-L",
            binary_path,
        },
    }) catch {
        // Not a Mach-O binary or otool failed - just return
        return;
    };
    defer allocator.free(otool_result.stdout);
    defer allocator.free(otool_result.stderr);

    if (otool_result.term.Exited != 0) {
        // Not a Mach-O binary or otool failed
        return;
    }

    // Parse otool output to find @rpath dependencies
    var rpath_deps = try std.ArrayList([]const u8).initCapacity(allocator, 8);
    defer {
        for (rpath_deps.items) |dep| {
            allocator.free(dep);
        }
        rpath_deps.deinit(allocator);
    }

    var lines = std.mem.tokenizeScalar(u8, otool_result.stdout, '\n');
    while (lines.next()) |line| {
        const trimmed = std.mem.trim(u8, line, " \t\r");

        // Look for lines containing "@rpath/" and ".dylib"
        if (std.mem.indexOf(u8, trimmed, "@rpath/") != null and std.mem.indexOf(u8, trimmed, ".dylib") != null) {
            // Extract the library name: @rpath/libfoo.dylib
            if (std.mem.indexOf(u8, trimmed, "@rpath/")) |rpath_start| {
                const after_rpath = trimmed[rpath_start + 7 ..]; // Skip "@rpath/"
                if (std.mem.indexOf(u8, after_rpath, " ")) |space_pos| {
                    const lib_name = after_rpath[0..space_pos];
                    // Store the library name (without @rpath/ prefix)
                    try rpath_deps.append(allocator, try allocator.dupe(u8, lib_name));
                } else if (std.mem.indexOf(u8, after_rpath, ".dylib")) |dylib_pos| {
                    const lib_name = after_rpath[0 .. dylib_pos + 6]; // Include ".dylib"
                    try rpath_deps.append(allocator, try allocator.dupe(u8, lib_name));
                }
            }
        }
    }

    // Fix each @rpath dependency
    for (rpath_deps.items) |dep_library| {
        // Build absolute path: lib_dir/libfoo.dylib
        const absolute_lib_path = try std.fmt.allocPrint(
            allocator,
            "{s}/{s}",
            .{ lib_dir, dep_library },
        );
        defer allocator.free(absolute_lib_path);

        // Check if the library exists in our lib directory
        io_helper.accessAbsolute(absolute_lib_path, .{}) catch {
            // Library doesn't exist in our package - skip it
            continue;
        };

        // Build @rpath reference: @rpath/libfoo.dylib
        const rpath_ref = try std.fmt.allocPrint(
            allocator,
            "@rpath/{s}",
            .{dep_library},
        );
        defer allocator.free(rpath_ref);

        // Fix the library path using install_name_tool
        const fix_result = std.process.Child.run(.{
            .allocator = allocator,
            .argv = &[_][]const u8{
                "install_name_tool",
                "-change",
                rpath_ref,
                absolute_lib_path,
                binary_path,
            },
        }) catch {
            // install_name_tool failed - just continue
            continue;
        };
        defer allocator.free(fix_result.stdout);
        defer allocator.free(fix_result.stderr);

        // Ignore errors - some libraries might not be patchable
        _ = fix_result.term.Exited;
    }
}

/// Add rpath entries to a binary for finding dependencies
fn addRpathEntries(
    allocator: std.mem.Allocator,
    binary_path: []const u8,
    package_dir: []const u8,
) !void {
    const builtin = @import("builtin");
    if (builtin.os.tag != .macos) return;

    // Get home directory for global package location
    const home = std.process.getEnvVarOwned(allocator, "HOME") catch return;
    defer allocator.free(home);

    // Add rpath entries for:
    // 1. The package's own lib directory
    // 2. The global pantry directory (for finding openssl.org, nodejs.org, etc.)
    const rpath_entries = [_][]const u8{
        // Package's own lib dir
        try std.fmt.allocPrint(allocator, "{s}/lib", .{package_dir}),
        // Global pantry dir (for dependencies like OpenSSL)
        // This allows @rpath/openssl.org/v1/lib/libcrypto.dylib to resolve
        try std.fmt.allocPrint(allocator, "{s}/.pantry/global", .{home}),
    };

    defer {
        for (rpath_entries) |entry| allocator.free(entry);
    }

    // Add each rpath entry
    var needs_codesign = false;
    for (rpath_entries) |rpath| {
        const result = std.process.Child.run(.{
            .allocator = allocator,
            .argv = &[_][]const u8{
                "install_name_tool",
                "-add_rpath",
                rpath,
                binary_path,
            },
        }) catch continue; // Ignore if already exists

        allocator.free(result.stdout);
        allocator.free(result.stderr);

        // If install_name_tool succeeded, we modified the binary
        if (result.term == .Exited and result.term.Exited == 0) {
            needs_codesign = true;
        }
    }

    // Re-sign the binary if we modified it
    if (needs_codesign) {
        const codesign_result = std.process.Child.run(.{
            .allocator = allocator,
            .argv = &[_][]const u8{
                "codesign",
                "-s",
                "-",
                "-f",
                binary_path,
            },
        }) catch return; // Ignore codesign failures

        allocator.free(codesign_result.stdout);
        allocator.free(codesign_result.stderr);
    }
}

/// Fix library paths for all executables and dylibs in a package directory
/// This includes both binaries in bin/ and libraries in lib/
pub fn fixDirectoryLibraryPaths(
    allocator: std.mem.Allocator,
    package_dir: []const u8,
) !void {
    const builtin = @import("builtin");
    if (builtin.os.tag != .macos) return;

    // Build paths to bin and lib directories
    const bin_dir = try std.fmt.allocPrint(allocator, "{s}/bin", .{package_dir});
    defer allocator.free(bin_dir);

    const lib_dir = try std.fmt.allocPrint(allocator, "{s}/lib", .{package_dir});
    defer allocator.free(lib_dir);

    // Check if lib directory exists (we need it for absolute paths)
    io_helper.accessAbsolute(lib_dir, .{}) catch {
        // No lib directory - nothing to fix
        return;
    };

    // Fix binaries in bin/ directory
    {
        // Use std.fs.Dir for iteration (Io.Dir doesn't have iterate() in Zig 0.16)
        var dir = io_helper.openDirAbsoluteForIteration(bin_dir) catch {
            // No bin directory or can't open it - that's ok
            return;
        };
        defer dir.close();

        var it = dir.iterate();
        while (it.next() catch null) |entry| {
            if (entry.kind != .file) continue;

            const binary_path = try std.fs.path.join(allocator, &[_][]const u8{ bin_dir, entry.name });
            defer allocator.free(binary_path);

            // Add rpath entries for finding dependencies
            addRpathEntries(allocator, binary_path, package_dir) catch {};

            // Try to fix library paths (will fail silently if not a Mach-O binary)
            fixMacOSLibraryPaths(allocator, binary_path, lib_dir) catch {};
        }
    }

    // Also fix dylibs in lib/ directory (they can depend on each other)
    {
        // Use std.fs.Dir for iteration (Io.Dir doesn't have iterate() in Zig 0.16)
        var dir = io_helper.openDirAbsoluteForIteration(lib_dir) catch {
            // Can't open lib directory - that's ok
            return;
        };
        defer dir.close();

        var it = dir.iterate();
        while (it.next() catch null) |entry| {
            if (entry.kind != .file) continue;
            if (!std.mem.endsWith(u8, entry.name, ".dylib")) continue;

            const dylib_path = try std.fs.path.join(allocator, &[_][]const u8{ lib_dir, entry.name });
            defer allocator.free(dylib_path);

            // Add rpath entries for dylibs too
            addRpathEntries(allocator, dylib_path, package_dir) catch {};

            // Fix library paths for this dylib
            fixMacOSLibraryPaths(allocator, dylib_path, lib_dir) catch {};
        }
    }
}
