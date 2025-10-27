const std = @import("std");
const lib = @import("../lib.zig");

pub const SymlinkError = error{
    SymlinkCreationFailed,
    TargetNotFound,
    BinDirCreationFailed,
    InvalidPath,
};

/// Create symlink for a package binary
pub fn createBinarySymlink(
    allocator: std.mem.Allocator,
    package_name: []const u8,
    version: []const u8,
    bin_name: []const u8,
    install_base: []const u8,
) !void {
    // Build paths
    const package_bin_path = try std.fmt.allocPrint(
        allocator,
        "{s}/{s}/v{s}/bin/{s}",
        .{ install_base, package_name, version, bin_name },
    );
    defer allocator.free(package_bin_path);

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
    std.fs.cwd().access(package_bin_path, .{}) catch {
        std.debug.print("  ✗ Binary not found: {s}\n", .{package_bin_path});
        return error.TargetNotFound;
    };

    // Create bin directory if it doesn't exist
    std.fs.cwd().makePath(symlink_dir) catch {
        return error.BinDirCreationFailed;
    };

    // Remove existing symlink if present
    std.fs.cwd().deleteFile(symlink_path) catch {};

    // Create symlink
    std.fs.cwd().symLink(package_bin_path, symlink_path, .{}) catch |err| {
        std.debug.print("  ✗ Failed to create symlink: {}\n", .{err});
        return error.SymlinkCreationFailed;
    };

    std.debug.print("  ✓ Created symlink: {s} -> {s}\n", .{ bin_name, package_bin_path });
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
        "{s}/{s}/v{s}",
        .{ install_base, package_name, full_version },
    );
    defer allocator.free(target_path);

    const symlink_path = try std.fmt.allocPrint(
        allocator,
        "{s}/{s}/v{s}",
        .{ install_base, package_name, major_version },
    );
    defer allocator.free(symlink_path);

    // Verify target exists
    std.fs.cwd().access(target_path, .{}) catch {
        return error.TargetNotFound;
    };

    // Remove existing symlink if present
    std.fs.cwd().deleteFile(symlink_path) catch {};

    // Create symlink
    std.fs.cwd().symLink(target_path, symlink_path, .{}) catch {
        return error.SymlinkCreationFailed;
    };

    std.debug.print("  ✓ Version symlink: v{s} -> v{s}\n", .{ major_version, full_version });
}

/// Discover binaries in a package directory
pub fn discoverBinaries(
    allocator: std.mem.Allocator,
    package_dir: []const u8,
) ![][]const u8 {
    const bin_dir = try std.fmt.allocPrint(allocator, "{s}/bin", .{package_dir});
    defer allocator.free(bin_dir);

    var dir = std.fs.cwd().openDir(bin_dir, .{ .iterate = true }) catch {
        // No bin directory
        return try allocator.alloc([]const u8, 0);
    };
    defer dir.close();

    var binaries = std.ArrayList([]const u8).init(allocator);
    errdefer {
        for (binaries.items) |bin| {
            allocator.free(bin);
        }
        binaries.deinit();
    }

    var it = dir.iterate();
    while (try it.next()) |entry| {
        if (entry.kind == .file or entry.kind == .sym_link) {
            // Check if executable
            const full_path = try std.fmt.allocPrint(allocator, "{s}/{s}", .{ bin_dir, entry.name });
            defer allocator.free(full_path);

            const stat = std.fs.cwd().statFile(full_path) catch continue;
            const is_executable = (stat.mode & 0o111) != 0;

            if (is_executable) {
                try binaries.append(try allocator.dupe(u8, entry.name));
            }
        }
    }

    return try binaries.toOwnedSlice();
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
        "{s}/{s}/v{s}",
        .{ install_base, package_name, version },
    );
    defer allocator.free(package_dir);

    // Discover binaries
    const binaries = try discoverBinaries(allocator, package_dir);
    defer {
        for (binaries) |bin| {
            allocator.free(bin);
        }
        allocator.free(binaries);
    }

    if (binaries.len == 0) {
        std.debug.print("  ! No binaries found in {s}\n", .{package_dir});
        return;
    }

    // Create symlinks for each binary
    for (binaries) |bin_name| {
        try createBinarySymlink(allocator, package_name, version, bin_name, install_base);
    }

    // Extract major version for version symlink
    var parts = std.mem.split(u8, version, ".");
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
        "{s}/{s}/v{s}",
        .{ install_base, package_name, version },
    );
    defer allocator.free(package_dir);

    const binaries = try discoverBinaries(allocator, package_dir);
    defer {
        for (binaries) |bin| {
            allocator.free(bin);
        }
        allocator.free(binaries);
    }

    const bin_dir = try std.fmt.allocPrint(allocator, "{s}/bin", .{install_base});
    defer allocator.free(bin_dir);

    for (binaries) |bin_name| {
        const symlink_path = try std.fmt.allocPrint(
            allocator,
            "{s}/{s}",
            .{ bin_dir, bin_name },
        );
        defer allocator.free(symlink_path);

        std.fs.cwd().deleteFile(symlink_path) catch |err| {
            std.debug.print("  ! Failed to remove symlink {s}: {}\n", .{ bin_name, err });
        };
    }

    // Remove version symlink
    var parts = std.mem.split(u8, version, ".");
    if (parts.next()) |major| {
        const version_symlink = try std.fmt.allocPrint(
            allocator,
            "{s}/{s}/v{s}",
            .{ install_base, package_name, major },
        );
        defer allocator.free(version_symlink);

        std.fs.cwd().deleteFile(version_symlink) catch {};
    }
}

test "discoverBinaries" {
    const allocator = std.testing.allocator;

    // Create test directory structure
    const test_dir = "test_pkg_bin";
    std.fs.cwd().makeDir(test_dir) catch {};
    defer std.fs.cwd().deleteTree(test_dir) catch {};

    const bin_dir = try std.fmt.allocPrint(allocator, "{s}/bin", .{test_dir});
    defer allocator.free(bin_dir);

    std.fs.cwd().makeDir(bin_dir) catch {};

    // Create test binary file
    {
        const test_bin = try std.fmt.allocPrint(allocator, "{s}/testbin", .{bin_dir});
        defer allocator.free(test_bin);

        const file = try std.fs.cwd().createFile(test_bin, .{ .mode = 0o755 });
        file.close();
    }

    // Discover binaries
    const binaries = try discoverBinaries(allocator, test_dir);
    defer {
        for (binaries) |bin| {
            allocator.free(bin);
        }
        allocator.free(binaries);
    }

    try std.testing.expect(binaries.len == 1);
    try std.testing.expectEqualStrings("testbin", binaries[0]);
}

test "createBinarySymlink" {
    const allocator = std.testing.allocator;

    // Create test structure
    const install_base = "test_install";
    std.fs.cwd().makeDir(install_base) catch {};
    defer std.fs.cwd().deleteTree(install_base) catch {};

    // Create package directory
    const pkg_dir = try std.fmt.allocPrint(allocator, "{s}/testpkg/v1.0.0/bin", .{install_base});
    defer allocator.free(pkg_dir);

    std.fs.cwd().makePath(pkg_dir) catch {};

    // Create binary
    const bin_path = try std.fmt.allocPrint(allocator, "{s}/testbin", .{pkg_dir});
    defer allocator.free(bin_path);

    {
        const file = try std.fs.cwd().createFile(bin_path, .{ .mode = 0o755 });
        file.close();
    }

    // Create symlink
    try createBinarySymlink(allocator, "testpkg", "1.0.0", "testbin", install_base);

    // Verify symlink exists
    const symlink_path = try std.fmt.allocPrint(allocator, "{s}/bin/testbin", .{install_base});
    defer allocator.free(symlink_path);

    const stat = try std.fs.cwd().statFile(symlink_path);
    _ = stat;
}
