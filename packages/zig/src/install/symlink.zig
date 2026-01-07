const std = @import("std");
const io_helper = @import("../io_helper.zig");
const lib = @import("../lib.zig");
const builtin = @import("builtin");

pub const SymlinkError = error{
    SymlinkCreationFailed,
    TargetNotFound,
    BinDirCreationFailed,
    InvalidPath,
};

/// Cross-platform symlink creation
pub fn createSymlinkCrossPlatform(target_path: []const u8, link_path: []const u8) !void {
    if (builtin.os.tag == .windows) {
        // On Windows, copy the file instead of creating a symlink
        // This avoids privilege requirements
        try io_helper.copyFile(target_path, link_path);
    } else {
        // On Unix systems, create actual symlink using io_helper
        io_helper.symLink(target_path, link_path) catch |err| switch (err) {
            error.PathAlreadyExists => {
                // Delete existing and retry
                try io_helper.deleteFile(link_path);
                try io_helper.symLink(target_path, link_path);
            },
            else => return err,
        };
    }
}

/// Create symlink for a package binary (with explicit binary path)
pub fn createBinarySymlinkFromPath(
    allocator: std.mem.Allocator,
    bin_name: []const u8,
    bin_path: []const u8,
    install_base: []const u8,
) !void {
    const symlink_dir = try std.fmt.allocPrint(
        allocator,
        "{s}/bin",
        .{install_base},
    );
    defer allocator.free(symlink_dir);

    const symlink_path = try std.fmt.allocPrint(
        allocator,
        "{s}/{s}",
        .{ symlink_dir, bin_name },
    );
    defer allocator.free(symlink_path);

    // Verify target exists
    io_helper.cwd().access(io_helper.io, bin_path, .{}) catch {
        std.debug.print("  ✗ Binary not found: {s}\n", .{bin_path});
        return error.TargetNotFound;
    };

    // Create bin directory if it doesn't exist
    io_helper.makePath(symlink_dir) catch {
        return error.BinDirCreationFailed;
    };

    // Remove existing symlink if present
    io_helper.deleteFile(symlink_path) catch {};

    // Create symlink (cross-platform)
    createSymlinkCrossPlatform(bin_path, symlink_path) catch |err| {
        std.debug.print("  ✗ Failed to create symlink: {}\n", .{err});
        return error.SymlinkCreationFailed;
    };

    std.debug.print("  ✓ Created symlink: {s} -> {s}\n", .{ bin_name, bin_path });
}

/// Create symlink for a package binary (legacy - builds path from package info)
pub fn createBinarySymlink(
    allocator: std.mem.Allocator,
    package_name: []const u8,
    version: []const u8,
    bin_name: []const u8,
    install_base: []const u8,
) !void {
    // Build paths - packages are in {install_base}/packages/
    const package_bin_path = try std.fmt.allocPrint(
        allocator,
        "{s}/packages/{s}/v{s}/bin/{s}",
        .{ install_base, package_name, version, bin_name },
    );
    defer allocator.free(package_bin_path);

    return createBinarySymlinkFromPath(allocator, bin_name, package_bin_path, install_base);
}

/// Create version symlink (e.g., nodejs.org/v22 -> nodejs.org/v22.0.0)
pub fn createVersionSymlink(
    allocator: std.mem.Allocator,
    package_name: []const u8,
    full_version: []const u8,
    major_version: []const u8,
    install_base: []const u8,
) !void {
    const target_path = try std.fmt.allocPrint(
        allocator,
        "{s}/packages/{s}/v{s}",
        .{ install_base, package_name, full_version },
    );
    defer allocator.free(target_path);

    const symlink_path = try std.fmt.allocPrint(
        allocator,
        "{s}/packages/{s}/v{s}",
        .{ install_base, package_name, major_version },
    );
    defer allocator.free(symlink_path);

    // Verify target exists
    io_helper.cwd().access(io_helper.io, target_path, .{}) catch {
        return error.TargetNotFound;
    };

    // Remove existing symlink if present
    io_helper.deleteFile(symlink_path) catch {};

    // Create symlink (cross-platform)
    createSymlinkCrossPlatform(target_path, symlink_path) catch {
        return error.SymlinkCreationFailed;
    };

    std.debug.print("  ✓ Version symlink: v{s} -> v{s}\n", .{ major_version, full_version });
}

/// Result of discovering binaries - contains bin name and its full path
pub const BinaryInfo = struct {
    name: []const u8,
    path: []const u8,

    pub fn deinit(self: *BinaryInfo, allocator: std.mem.Allocator) void {
        allocator.free(self.name);
        allocator.free(self.path);
    }
};

/// Discover npm package binaries in lib/node_modules structure
fn discoverNpmBinaries(
    allocator: std.mem.Allocator,
    package_dir: []const u8,
) ![]BinaryInfo {
    // Check for npm package structure: {package_dir}/lib/node_modules/{package_name}/
    const node_modules_path = try std.fmt.allocPrint(allocator, "{s}/lib/node_modules", .{package_dir});
    defer allocator.free(node_modules_path);

    // Use std.fs.Dir for iteration (Io.Dir doesn't have iterate() in Zig 0.16)
    var node_modules_dir = io_helper.openDirForIteration(node_modules_path) catch {
        return try allocator.alloc(BinaryInfo, 0);
    };
    defer node_modules_dir.close();

    var binaries = try std.ArrayList(BinaryInfo).initCapacity(allocator, 8);
    errdefer {
        for (binaries.items) |*bin| {
            bin.deinit(allocator);
        }
        binaries.deinit(allocator);
    }

    // Iterate through packages in node_modules
    var it = node_modules_dir.iterate();
    while (it.next() catch null) |entry| {
        if (entry.kind != .directory) continue;

        // Check for bin directory in this npm package
        const npm_bin_path = try std.fmt.allocPrint(
            allocator,
            "{s}/{s}/bin",
            .{ node_modules_path, entry.name },
        );
        defer allocator.free(npm_bin_path);

        var npm_bin_dir = io_helper.openDirForIteration(npm_bin_path) catch continue;
        defer npm_bin_dir.close();

        // Iterate binaries in npm package's bin directory
        var bin_it = npm_bin_dir.iterate();
        while (bin_it.next() catch null) |bin_entry| {
            if (bin_entry.kind == .file or bin_entry.kind == .sym_link) {
                const full_path = try std.fmt.allocPrint(
                    allocator,
                    "{s}/{s}",
                    .{ npm_bin_path, bin_entry.name },
                );
                errdefer allocator.free(full_path);

                // Check if executable using io_helper
                const stat = io_helper.statFile(full_path) catch {
                    allocator.free(full_path);
                    continue;
                };
                const is_executable = (stat.mode & 0o111) != 0;

                if (is_executable) {
                    try binaries.append(allocator, .{
                        .name = try allocator.dupe(u8, bin_entry.name),
                        .path = full_path,
                    });
                }
            }
        }
    }

    return try binaries.toOwnedSlice(allocator);
}

/// Discover binaries in a package directory
/// First checks for npm package structure (lib/node_modules/*/bin/*)
/// Falls back to standard pkgx bin/ directory
pub fn discoverBinaries(
    allocator: std.mem.Allocator,
    package_dir: []const u8,
) ![]BinaryInfo {
    // First, try to find npm binaries (these take precedence)
    const npm_bins = try discoverNpmBinaries(allocator, package_dir);
    if (npm_bins.len > 0) {
        return npm_bins;
    }
    defer allocator.free(npm_bins);

    // Fall back to standard bin directory
    const bin_dir = try std.fmt.allocPrint(allocator, "{s}/bin", .{package_dir});
    defer allocator.free(bin_dir);

    // Use std.fs.Dir for iteration (Io.Dir doesn't have iterate() in Zig 0.16)
    var dir = io_helper.openDirForIteration(bin_dir) catch {
        // No bin directory
        return try allocator.alloc(BinaryInfo, 0);
    };
    defer dir.close();

    var binaries = try std.ArrayList(BinaryInfo).initCapacity(allocator, 8);
    errdefer {
        for (binaries.items) |*bin| {
            bin.deinit(allocator);
        }
        binaries.deinit(allocator);
    }

    var it = dir.iterate();
    while (it.next() catch null) |entry| {
        if (entry.kind == .file or entry.kind == .sym_link) {
            const full_path = try std.fmt.allocPrint(allocator, "{s}/{s}", .{ bin_dir, entry.name });
            errdefer allocator.free(full_path);

            // Check if executable using io_helper
            const stat = io_helper.statFile(full_path) catch {
                allocator.free(full_path);
                continue;
            };
            const is_executable = (stat.mode & 0o111) != 0;

            if (is_executable) {
                try binaries.append(allocator, .{
                    .name = try allocator.dupe(u8, entry.name),
                    .path = full_path,
                });
            }
        }
    }

    return try binaries.toOwnedSlice(allocator);
}

/// Create all symlinks for a package
pub fn createPackageSymlinks(
    allocator: std.mem.Allocator,
    package_name: []const u8,
    version: []const u8,
    install_base: []const u8,
) !void {
    const package_dir = try std.fmt.allocPrint(
        allocator,
        "{s}/packages/{s}/v{s}",
        .{ install_base, package_name, version },
    );
    defer allocator.free(package_dir);

    // Discover binaries
    const binaries = try discoverBinaries(allocator, package_dir);
    defer {
        for (binaries) |*bin| {
            var b = bin.*;
            b.deinit(allocator);
        }
        allocator.free(binaries);
    }

    if (binaries.len == 0) {
        std.debug.print("  ! No binaries found in {s}\n", .{package_dir});
        // Even without binaries, still create version symlink for libraries
    } else {
        // Create symlinks for each binary using the discovered paths
        for (binaries) |bin_info| {
            createBinarySymlinkFromPath(allocator, bin_info.name, bin_info.path, install_base) catch |err| {
                std.debug.print("  ! Failed to create symlink for {s}: {}\n", .{ bin_info.name, err });
            };
        }
    }

    // Always create version symlink (needed for library dependencies like zlib)
    var parts = std.mem.splitScalar(u8, version, '.');
    if (parts.next()) |major| {
        createVersionSymlink(allocator, package_name, version, major, install_base) catch |err| {
            std.debug.print("  ! Failed to create version symlink: {}\n", .{err});
        };
    }
}

/// Remove symlinks for a package
pub fn removePackageSymlinks(
    allocator: std.mem.Allocator,
    package_name: []const u8,
    version: []const u8,
    install_base: []const u8,
) !void {
    const package_dir = try std.fmt.allocPrint(
        allocator,
        "{s}/packages/{s}/v{s}",
        .{ install_base, package_name, version },
    );
    defer allocator.free(package_dir);

    const binaries = try discoverBinaries(allocator, package_dir);
    defer {
        for (binaries) |*bin| {
            var b = bin.*;
            b.deinit(allocator);
        }
        allocator.free(binaries);
    }

    const bin_dir = try std.fmt.allocPrint(allocator, "{s}/bin", .{install_base});
    defer allocator.free(bin_dir);

    for (binaries) |bin_info| {
        const symlink_path = try std.fmt.allocPrint(
            allocator,
            "{s}/{s}",
            .{ bin_dir, bin_info.name },
        );
        defer allocator.free(symlink_path);

        io_helper.deleteFile(symlink_path) catch |err| {
            std.debug.print("  ! Failed to remove symlink {s}: {}\n", .{ bin_info.name, err });
        };
    }

    // Remove version symlink
    var parts = std.mem.split(u8, version, ".");
    if (parts.next()) |major| {
        const version_symlink = try std.fmt.allocPrint(
            allocator,
            "{s}/packages/{s}/v{s}",
            .{ install_base, package_name, major },
        );
        defer allocator.free(version_symlink);

        io_helper.deleteFile(version_symlink) catch {};
    }
}

test "discoverBinaries" {
    const allocator = std.testing.allocator;

    // Create test directory structure
    const test_dir = "test_pkg_bin";
    io_helper.cwd().makeDir(io_helper.io, test_dir) catch {};
    defer io_helper.deleteTree(test_dir) catch {};

    const bin_dir = try std.fmt.allocPrint(allocator, "{s}/bin", .{test_dir});
    defer allocator.free(bin_dir);

    io_helper.cwd().makeDir(io_helper.io, bin_dir) catch {};

    // Create test binary file
    {
        const test_bin = try std.fmt.allocPrint(allocator, "{s}/testbin", .{bin_dir});
        defer allocator.free(test_bin);

        const file = try io_helper.cwd().createFile(io_helper.io, test_bin, .{ .mode = 0o755 });
        file.close();
    }

    // Discover binaries
    const binaries = try discoverBinaries(allocator, test_dir);
    defer {
        for (binaries) |*bin| {
            var b = bin.*;
            b.deinit(allocator);
        }
        allocator.free(binaries);
    }

    try std.testing.expect(binaries.len == 1);
    try std.testing.expectEqualStrings("testbin", binaries[0].name);
}

test "createBinarySymlink" {
    const allocator = std.testing.allocator;

    // Create test structure
    const install_base = "test_install";
    io_helper.cwd().makeDir(io_helper.io, install_base) catch {};
    defer io_helper.deleteTree(install_base) catch {};

    // Create package directory
    const pkg_dir = try std.fmt.allocPrint(allocator, "{s}/testpkg/v1.0.0/bin", .{install_base});
    defer allocator.free(pkg_dir);

    io_helper.makePath(pkg_dir) catch {};

    // Create binary
    const bin_path = try std.fmt.allocPrint(allocator, "{s}/testbin", .{pkg_dir});
    defer allocator.free(bin_path);

    {
        const file = try io_helper.cwd().createFile(io_helper.io, bin_path, .{ .mode = 0o755 });
        file.close();
    }

    // Create symlink
    try createBinarySymlink(allocator, "testpkg", "1.0.0", "testbin", install_base);

    // Verify symlink exists
    const symlink_path = try std.fmt.allocPrint(allocator, "{s}/bin/testbin", .{install_base});
    defer allocator.free(symlink_path);

    const stat = try io_helper.cwd().statPath(io_helper.io, symlink_path);
    _ = stat;
}
