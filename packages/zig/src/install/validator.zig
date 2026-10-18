const std = @import("std");
const io_helper = @import("../io_helper.zig");
const package_registry = @import("../packages/generated.zig");

/// Validation result
pub const ValidationResult = struct {
    valid: bool,
    errors: [][]const u8,
    allocator: std.mem.Allocator,

    pub fn deinit(self: *ValidationResult) void {
        for (self.errors) |err| {
            self.allocator.free(err);
        }
        self.allocator.free(self.errors);
    }
};

/// Validate installed package
pub fn validateInstallation(
    allocator: std.mem.Allocator,
    install_path: []const u8,
    expected_files: []const []const u8,
) !ValidationResult {
    var errors: std.ArrayList([]const u8) = .empty;
    errdefer {
        for (errors.items) |err| {
            allocator.free(err);
        }
        errors.deinit(allocator);
    }

    // Check if install directory exists
    var dir = io_helper.cwd().openDir(io_helper.io, install_path, .{}) catch {
        try errors.append(allocator, try std.fmt.allocPrint(
            allocator,
            "Install directory does not exist: {s}",
            .{install_path},
        ));
        return ValidationResult{
            .valid = false,
            .errors = try errors.toOwnedSlice(allocator),
            .allocator = allocator,
        };
    };
    defer dir.close(io_helper.io);

    // Check if expected files exist
    for (expected_files) |file| {
        dir.access(io_helper.io, file, .{}) catch {
            try errors.append(allocator, try std.fmt.allocPrint(
                allocator,
                "Expected file not found: {s}",
                .{file},
            ));
        };
    }

    const valid = errors.items.len == 0;
    return ValidationResult{
        .valid = valid,
        .errors = try errors.toOwnedSlice(allocator),
        .allocator = allocator,
    };
}

/// Validate binary is executable
pub fn validateBinary(
    allocator: std.mem.Allocator,
    binary_path: []const u8,
) !ValidationResult {
    var errors: std.ArrayList([]const u8) = .empty;
    errdefer {
        for (errors.items) |err| {
            allocator.free(err);
        }
        errors.deinit(allocator);
    }

    // Check if file exists
    io_helper.cwd().access(io_helper.io, binary_path, .{}) catch {
        try errors.append(allocator, try std.fmt.allocPrint(
            allocator,
            "Binary not found: {s}",
            .{binary_path},
        ));
        const result = try errors.toOwnedSlice(allocator);
        return ValidationResult{
            .valid = false,
            .errors = result,
            .allocator = allocator,
        };
    };

    const stat = try io_helper.statFile(binary_path);

    if (stat.size == 0) {
        try errors.append(allocator, try std.fmt.allocPrint(
            allocator,
            "Binary is empty: {s}",
            .{binary_path},
        ));
    }

    // Check if file is executable (Unix systems)
    if (@import("builtin").os.tag != .windows) {
        if (!io_helper.isExecutable(binary_path)) {
            try errors.append(allocator, try std.fmt.allocPrint(
                allocator,
                "Binary is not executable: {s}",
                .{binary_path},
            ));
        }
    }

    const valid = errors.items.len == 0;
    return ValidationResult{
        .valid = valid,
        .errors = try errors.toOwnedSlice(allocator),
        .allocator = allocator,
    };
}

/// Return true when every concrete program declared by the package catalog is
/// a non-empty executable. Project roots may contain a version directory, so
/// both `<root>/bin` and `<root>/v*/bin` layouts are supported.
pub fn hasUsableDeclaredPrograms(allocator: std.mem.Allocator, package_name: []const u8, package_root: []const u8) bool {
    const package = package_registry.getPackageByName(package_name) orelse return true;
    if (package.programs.len == 0) return true;

    if (programsAreUsable(allocator, package.programs, package_root)) return true;

    var root = io_helper.openDirAbsoluteForIteration(package_root) catch return false;
    defer root.close();
    var it = root.iterate();
    while (it.next() catch null) |entry| {
        if (entry.kind != .directory or !std.mem.startsWith(u8, entry.name, "v")) continue;
        const version_root = std.fs.path.join(allocator, &.{ package_root, entry.name }) catch continue;
        defer allocator.free(version_root);
        if (programsAreUsable(allocator, package.programs, version_root)) return true;
    }

    return false;
}

test "Git executable contract follows the native compilation target" {
    const package = package_registry.getPackageByName("git-scm.org").?;
    var has_keychain_helper = false;
    var has_git = false;
    for (package.programs) |program| {
        if (std.mem.eql(u8, program, "git-credential-osxkeychain")) has_keychain_helper = true;
        if (std.mem.eql(u8, program, "git")) has_git = true;
    }
    try std.testing.expect(has_git);
    try std.testing.expectEqual(@import("builtin").os.tag == .macos, has_keychain_helper);
}

fn programsAreUsable(allocator: std.mem.Allocator, programs: []const []const u8, package_root: []const u8) bool {
    var checked: usize = 0;
    for (programs) |program| {
        // Catalog templates cannot be resolved without the package's recipe
        // variables. Concrete declarations are still enforced strictly.
        if (std.mem.indexOf(u8, program, "{{") != null) continue;
        checked += 1;

        var usable = false;
        for ([_][]const u8{ "bin", "sbin", "" }) |directory| {
            const candidate = if (directory.len > 0)
                std.fs.path.join(allocator, &.{ package_root, directory, program }) catch continue
            else
                std.fs.path.join(allocator, &.{ package_root, program }) catch continue;
            defer allocator.free(candidate);
            if (isUsableExecutable(candidate)) {
                usable = true;
                break;
            }
        }
        if (!usable) return false;
    }
    return checked > 0 or programs.len > 0;
}

fn isUsableExecutable(path: []const u8) bool {
    const stat = io_helper.statFile(path) catch return false;
    if (stat.kind != .file or stat.size == 0) return false;
    if (!io_helper.isExecutable(path)) return false;
    return true;
}

/// Explain a failed executable contract before an invalid extraction is removed.
/// Keep validation strict and expose the actual path, type, size and permissions.
pub fn reportUnusableDeclaredPrograms(allocator: std.mem.Allocator, package_name: []const u8, package_root: []const u8) void {
    const package = package_registry.getPackageByName(package_name) orelse return;
    for (package.programs) |program| {
        if (std.mem.indexOf(u8, program, "{{") != null) continue;
        if (programsAreUsable(allocator, &.{program}, package_root)) continue;
        for ([_][]const u8{ "bin", "sbin", "" }) |directory| {
            const path = std.fs.path.join(allocator, &.{ package_root, directory, program }) catch continue;
            defer allocator.free(path);
            const stat = io_helper.statFile(path) catch |err| {
                std.debug.print("[pantry:validate] {s}: {s}\n", .{ path, @errorName(err) });
                continue;
            };
            std.debug.print("[pantry:validate] {s}: kind={s} size={d} executable={}\n", .{ path, @tagName(stat.kind), stat.size, io_helper.isExecutable(path) });
        }
    }
}

/// Validate directory structure
pub fn validateDirectoryStructure(
    allocator: std.mem.Allocator,
    install_path: []const u8,
    required_dirs: []const []const u8,
) !ValidationResult {
    var errors: std.ArrayList([]const u8) = .empty;
    errdefer {
        for (errors.items) |err| {
            allocator.free(err);
        }
        errors.deinit(allocator);
    }

    // Check if install directory exists
    var base_dir = io_helper.cwd().openDir(io_helper.io, install_path, .{}) catch {
        try errors.append(allocator, try std.fmt.allocPrint(
            allocator,
            "Install directory does not exist: {s}",
            .{install_path},
        ));
        return ValidationResult{
            .valid = false,
            .errors = try errors.toOwnedSlice(allocator),
            .allocator = allocator,
        };
    };
    defer base_dir.close(io_helper.io);

    // Check required directories
    for (required_dirs) |dir_name| {
        var sub_dir = base_dir.openDir(io_helper.io, dir_name, .{}) catch {
            try errors.append(allocator, try std.fmt.allocPrint(
                allocator,
                "Required directory not found: {s}",
                .{dir_name},
            ));
            continue;
        };
        sub_dir.close(io_helper.io);
    }

    const valid = errors.items.len == 0;
    return ValidationResult{
        .valid = valid,
        .errors = try errors.toOwnedSlice(allocator),
        .allocator = allocator,
    };
}

test "validateInstallation success" {
    const allocator = std.testing.allocator;

    // Create temporary directory
    var tmp_dir = std.testing.tmpDir(.{});
    defer tmp_dir.cleanup();

    // Create a test file
    const file = try tmp_dir.dir.createFile(io_helper.io, "test.txt", .{});
    file.close(io_helper.io);

    // Get path
    var path_buf: [std.fs.max_path_bytes]u8 = undefined;
    const tmp_len = try tmp_dir.dir.realPath(io_helper.io, &path_buf);
    const tmp_path = path_buf[0..tmp_len];

    // Validate
    const expected_files = [_][]const u8{"test.txt"};
    var result = try validateInstallation(allocator, tmp_path, &expected_files);
    defer result.deinit();

    try std.testing.expect(result.valid);
    try std.testing.expect(result.errors.len == 0);
}

test "validateInstallation missing file" {
    const allocator = std.testing.allocator;

    // Create temporary directory
    var tmp_dir = std.testing.tmpDir(.{});
    defer tmp_dir.cleanup();

    // Get path
    var path_buf: [std.fs.max_path_bytes]u8 = undefined;
    const tmp_len = try tmp_dir.dir.realPath(io_helper.io, &path_buf);
    const tmp_path = path_buf[0..tmp_len];

    // Validate with non-existent file
    const expected_files = [_][]const u8{"nonexistent.txt"};
    var result = try validateInstallation(allocator, tmp_path, &expected_files);
    defer result.deinit();

    try std.testing.expect(!result.valid);
    try std.testing.expect(result.errors.len == 1);
}

test "validateBinary rejects a zero-byte executable" {
    const allocator = std.testing.allocator;
    var tmp_dir = std.testing.tmpDir(.{});
    defer tmp_dir.cleanup();

    const file = try tmp_dir.dir.createFile(io_helper.io, "empty", .{ .permissions = .executable_file });
    file.close(io_helper.io);

    var path_buf: [std.fs.max_path_bytes]u8 = undefined;
    const binary_len = try tmp_dir.dir.realPathFile(io_helper.io, "empty", &path_buf);
    const binary_path = path_buf[0..binary_len];
    var result = try validateBinary(allocator, binary_path);
    defer result.deinit();

    try std.testing.expect(!result.valid);
    try std.testing.expectEqual(@as(usize, 1), result.errors.len);
    try std.testing.expect(std.mem.indexOf(u8, result.errors[0], "empty") != null);
}

test "declared program validation repairs only from usable versioned packages" {
    const allocator = std.testing.allocator;
    var tmp_dir = std.testing.tmpDir(.{});
    defer tmp_dir.cleanup();
    try tmp_dir.dir.createDirPath(io_helper.io, "ziglang.org/v0.17.0/bin");

    const empty = try tmp_dir.dir.createFile(io_helper.io, "ziglang.org/v0.17.0/bin/zig", .{ .permissions = .executable_file });
    empty.close(io_helper.io);

    var root_buf: [std.fs.max_path_bytes]u8 = undefined;
    const root_len = try tmp_dir.dir.realPathFile(io_helper.io, "ziglang.org", &root_buf);
    const package_root = root_buf[0..root_len];
    try std.testing.expect(!hasUsableDeclaredPrograms(allocator, "ziglang.org", package_root));

    const usable = try tmp_dir.dir.createFile(io_helper.io, "ziglang.org/v0.17.0/bin/zig", .{ .permissions = .executable_file, .truncate = true });
    try io_helper.writeAllToFile(usable, "#!/bin/sh\nexit 0\n");
    usable.close(io_helper.io);
    try std.testing.expect(hasUsableDeclaredPrograms(allocator, "ziglang.org", package_root));
}

test "declared Android programs follow executable links into libexec" {
    if (@import("builtin").os.tag == .windows) return error.SkipZigTest;
    const allocator = std.testing.allocator;
    var tmp_dir = std.testing.tmpDir(.{});
    defer tmp_dir.cleanup();
    try tmp_dir.dir.createDirPath(io_helper.io, "bin");
    try tmp_dir.dir.createDirPath(io_helper.io, "libexec/cmdline-tools/latest/bin");
    var root_buf: [std.fs.max_path_bytes]u8 = undefined;
    const root_len = try tmp_dir.dir.realPath(io_helper.io, &root_buf);
    const root = root_buf[0..root_len];
    const package = package_registry.getPackageByName("android.com/cmdline-tools").?;
    for (package.programs) |program| {
        const target = try std.fmt.allocPrint(allocator, "libexec/cmdline-tools/latest/bin/{s}", .{program});
        defer allocator.free(target);
        const file = try tmp_dir.dir.createFile(io_helper.io, target, .{ .permissions = .executable_file });
        try io_helper.writeAllToFile(file, "#!/bin/sh\nexit 0\n");
        file.close(io_helper.io);
        const relative = try std.fmt.allocPrint(allocator, "../{s}", .{target});
        defer allocator.free(relative);
        const link = try std.fs.path.join(allocator, &.{ root, "bin", program });
        defer allocator.free(link);
        try io_helper.symLink(relative, link);
    }
    try std.testing.expect(hasUsableDeclaredPrograms(allocator, package.domain, root));
    try tmp_dir.dir.deleteFile(io_helper.io, "libexec/cmdline-tools/latest/bin/sdkmanager");
    try std.testing.expect(!hasUsableDeclaredPrograms(allocator, package.domain, root));
}

test "validateDirectoryStructure" {
    const allocator = std.testing.allocator;

    // Create temporary directory with subdirs
    var tmp_dir = std.testing.tmpDir(.{});
    defer tmp_dir.cleanup();

    try tmp_dir.dir.createDirPath(io_helper.io, "bin");
    try tmp_dir.dir.createDirPath(io_helper.io, "lib");

    // Get path
    var path_buf: [std.fs.max_path_bytes]u8 = undefined;
    const tmp_len = try tmp_dir.dir.realPath(io_helper.io, &path_buf);
    const tmp_path = path_buf[0..tmp_len];

    // Validate structure
    const required_dirs = [_][]const u8{ "bin", "lib" };
    var result = try validateDirectoryStructure(allocator, tmp_path, &required_dirs);
    defer result.deinit();

    try std.testing.expect(result.valid);
    try std.testing.expect(result.errors.len == 0);
}
