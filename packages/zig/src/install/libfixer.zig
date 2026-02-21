const std = @import("std");
const io_helper = @import("../io_helper.zig");
const style = @import("../cli/style.zig");

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
    const otool_result = io_helper.childRun(allocator, &[_][]const u8{
        "otool",
        "-L",
        binary_path,
    }) catch {
        // Not a Mach-O binary or otool failed - just return
        return;
    };
    defer allocator.free(otool_result.stdout);
    defer allocator.free(otool_result.stderr);

    if (otool_result.term.exited != 0) {
        // Not a Mach-O binary or otool failed
        return;
    }

    // Collect dependencies that need fixing: both @rpath/ and hardcoded absolute paths
    const DepToFix = struct {
        original_ref: []const u8, // The original path as shown in otool output
        lib_name: []const u8, // Just the library filename
    };

    var deps_to_fix = try std.ArrayList(DepToFix).initCapacity(allocator, 8);
    defer {
        for (deps_to_fix.items) |dep| {
            allocator.free(dep.original_ref);
            allocator.free(dep.lib_name);
        }
        deps_to_fix.deinit(allocator);
    }

    // Standard system library directories that should NOT be rewritten
    const system_prefixes = [_][]const u8{
        "/usr/lib/",
        "/System/Library/",
        "/Library/Apple/",
    };

    var lines = std.mem.tokenizeScalar(u8, otool_result.stdout, '\n');
    while (lines.next()) |line| {
        const trimmed = std.mem.trim(u8, line, " \t\r");
        if (!std.mem.endsWith(u8, trimmed, ")")) continue; // otool lines end with "(compatibility ...)"
        if (std.mem.indexOf(u8, trimmed, ".dylib") == null) continue;

        // Extract the path (everything before the first " (")
        const path_end = std.mem.indexOf(u8, trimmed, " (") orelse continue;
        const dep_path = std.mem.trim(u8, trimmed[0..path_end], " \t");
        if (dep_path.len == 0) continue;

        // Extract just the library filename
        const lib_name = if (std.mem.lastIndexOfScalar(u8, dep_path, '/')) |last_slash|
            dep_path[last_slash + 1 ..]
        else
            dep_path;

        // Case 1: @rpath/ references
        if (std.mem.startsWith(u8, dep_path, "@rpath/")) {
            try deps_to_fix.append(allocator, .{
                .original_ref = try allocator.dupe(u8, dep_path),
                .lib_name = try allocator.dupe(u8, lib_name),
            });
            continue;
        }

        // Case 2: Hardcoded absolute paths to non-system locations
        if (dep_path[0] == '/') {
            var is_system = false;
            for (system_prefixes) |prefix| {
                if (std.mem.startsWith(u8, dep_path, prefix)) {
                    is_system = true;
                    break;
                }
            }
            if (!is_system) {
                try deps_to_fix.append(allocator, .{
                    .original_ref = try allocator.dupe(u8, dep_path),
                    .lib_name = try allocator.dupe(u8, lib_name),
                });
            }
        }
    }

    // Fix each dependency
    for (deps_to_fix.items) |dep| {
        // Build absolute path using stack buffer: lib_dir/libfoo.dylib
        var abs_buf: [std.fs.max_path_bytes]u8 = undefined;
        const absolute_lib_path = std.fmt.bufPrint(&abs_buf, "{s}/{s}", .{ lib_dir, dep.lib_name }) catch continue;

        // Check if the library exists in our lib directory
        io_helper.accessAbsolute(absolute_lib_path, .{}) catch {
            // Library doesn't exist in our package - skip it
            continue;
        };

        // Fix the library path using install_name_tool
        const fix_result = io_helper.childRun(allocator, &[_][]const u8{
            "install_name_tool",
            "-change",
            dep.original_ref,
            absolute_lib_path,
            binary_path,
        }) catch {
            continue;
        };
        defer allocator.free(fix_result.stdout);
        defer allocator.free(fix_result.stderr);
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
    const home = io_helper.getEnvVarOwned(allocator, "HOME") catch return;
    defer allocator.free(home);

    // Add rpath entries for:
    // 1. The package's own lib directory
    // 2. The global pantry directory (for finding openssl.org, nodejs.org, etc.)
    var rp_buf1: [std.fs.max_path_bytes]u8 = undefined;
    var rp_buf2: [std.fs.max_path_bytes]u8 = undefined;
    const rp1 = std.fmt.bufPrint(&rp_buf1, "{s}/lib", .{package_dir}) catch return;
    const rp2 = std.fmt.bufPrint(&rp_buf2, "{s}/.pantry/global", .{home}) catch return;
    const rpath_entries = [_][]const u8{ rp1, rp2 };

    // Add each rpath entry (codesigning is done later by codesignDirectory)
    for (rpath_entries) |rpath| {
        const result = io_helper.childRun(allocator, &[_][]const u8{
            "install_name_tool",
            "-add_rpath",
            rpath,
            binary_path,
        }) catch continue; // Ignore if already exists

        allocator.free(result.stdout);
        allocator.free(result.stderr);
    }
}

/// Fix a dylib's install name (-id) if it has a hardcoded build path
fn fixDylibInstallName(
    allocator: std.mem.Allocator,
    dylib_path: []const u8,
    lib_dir: []const u8,
    entry_name: []const u8,
) void {
    const builtin = @import("builtin");
    if (builtin.os.tag != .macos) return;

    // Use otool -D to get the install name
    const otool_result = io_helper.childRun(allocator, &[_][]const u8{
        "otool", "-D", dylib_path,
    }) catch return;
    defer allocator.free(otool_result.stdout);
    defer allocator.free(otool_result.stderr);

    if (otool_result.term.exited != 0) return;

    // otool -D output: first line is the file path, second line is the install name
    var lines_iter = std.mem.tokenizeScalar(u8, otool_result.stdout, '\n');
    _ = lines_iter.next(); // Skip first line (file path)
    const install_name = std.mem.trim(u8, lines_iter.next() orelse return, " \t\r");

    // Check if install name points to a non-standard location
    const system_prefixes = [_][]const u8{
        "/usr/lib/",
        "/System/Library/",
        "/Library/Apple/",
    };

    if (install_name.len == 0 or install_name[0] != '/') return;

    for (system_prefixes) |prefix| {
        if (std.mem.startsWith(u8, install_name, prefix)) return;
    }

    // Build the correct absolute path for this dylib
    var new_id_buf: [std.fs.max_path_bytes]u8 = undefined;
    const new_id = std.fmt.bufPrint(&new_id_buf, "{s}/{s}", .{ lib_dir, entry_name }) catch return;

    // Skip if already correct
    if (std.mem.eql(u8, install_name, new_id)) return;

    // Fix the install name
    const result = io_helper.childRun(allocator, &[_][]const u8{
        "install_name_tool", "-id", new_id, dylib_path,
    }) catch return;
    allocator.free(result.stdout);
    allocator.free(result.stderr);
}

/// Fix library paths for all executables and dylibs in a package directory
/// This includes both binaries in bin/ and libraries in lib/
pub fn fixDirectoryLibraryPaths(
    allocator: std.mem.Allocator,
    package_dir: []const u8,
) !void {
    const builtin = @import("builtin");
    if (builtin.os.tag != .macos) return;

    // Build paths to bin and lib directories using stack buffers
    var bin_buf: [std.fs.max_path_bytes]u8 = undefined;
    const bin_dir = std.fmt.bufPrint(&bin_buf, "{s}/bin", .{package_dir}) catch return;

    var lib_buf: [std.fs.max_path_bytes]u8 = undefined;
    const lib_dir = std.fmt.bufPrint(&lib_buf, "{s}/lib", .{package_dir}) catch return;

    // Check if lib directory exists (we need it for absolute paths)
    io_helper.accessAbsolute(lib_dir, .{}) catch {
        // No lib directory - nothing to fix
        return;
    };

    // First fix dylib install names, then fix references in binaries/dylibs
    {
        var dir = io_helper.openDirAbsoluteForIteration(lib_dir) catch return;
        defer dir.close();

        var it = dir.iterate();
        while (it.next() catch null) |entry| {
            if (entry.kind != .file) continue;
            if (!std.mem.endsWith(u8, entry.name, ".dylib")) continue;

            var dl_buf: [std.fs.max_path_bytes]u8 = undefined;
            const dylib_path = std.fmt.bufPrint(&dl_buf, "{s}/{s}", .{ lib_dir, entry.name }) catch continue;

            // Fix the dylib's own install name first
            fixDylibInstallName(allocator, dylib_path, lib_dir, entry.name);

            // Add rpath entries for dylibs
            addRpathEntries(allocator, dylib_path, package_dir) catch {};

            // Fix library paths for this dylib (inter-dylib deps)
            fixMacOSLibraryPaths(allocator, dylib_path, lib_dir) catch {};
        }
    }

    // Fix binaries in bin/ directory
    {
        var dir = io_helper.openDirAbsoluteForIteration(bin_dir) catch return;
        defer dir.close();

        var it = dir.iterate();
        while (it.next() catch null) |entry| {
            if (entry.kind != .file) continue;

            var bp_buf: [std.fs.max_path_bytes]u8 = undefined;
            const binary_path = std.fmt.bufPrint(&bp_buf, "{s}/{s}", .{ bin_dir, entry.name }) catch continue;

            // Add rpath entries for finding dependencies
            addRpathEntries(allocator, binary_path, package_dir) catch {};

            // Fix library paths (both @rpath/ and hardcoded absolute paths)
            fixMacOSLibraryPaths(allocator, binary_path, lib_dir) catch {};
        }
    }

    // Re-sign all modified binaries and dylibs
    codesignDirectory(allocator, bin_dir);
    codesignDirectory(allocator, lib_dir);
}

/// Re-sign all Mach-O files in a directory after modifications
fn codesignDirectory(allocator: std.mem.Allocator, dir_path: []const u8) void {
    var dir = io_helper.openDirAbsoluteForIteration(dir_path) catch return;
    defer dir.close();

    var it = dir.iterate();
    while (it.next() catch null) |entry| {
        if (entry.kind != .file) continue;

        var path_buf: [std.fs.max_path_bytes]u8 = undefined;
        const file_path = std.fmt.bufPrint(&path_buf, "{s}/{s}", .{ dir_path, entry.name }) catch continue;

        const result = io_helper.childRun(allocator, &[_][]const u8{
            "codesign", "-s", "-", "-f", file_path,
        }) catch continue;
        allocator.free(result.stdout);
        allocator.free(result.stderr);
    }
}
