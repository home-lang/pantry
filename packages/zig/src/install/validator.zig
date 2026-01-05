const std = @import("std");
const io_helper = @import("../io_helper.zig");

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
    var errors = std.ArrayList([]const u8).init(allocator);
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
    defer dir.close();

    // Check if expected files exist
    for (expected_files) |file| {
        dir.access(file, .{}) catch {
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
    var errors = std.ArrayList([]const u8).init(allocator);
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

    // Check if file is executable (Unix systems)
    if (@import("builtin").os.tag != .windows) {
        const file = try io_helper.cwd().openFile(io_helper.io, binary_path, .{});
        defer file.close();

        const stat = try file.stat();
        const is_executable = (stat.mode & 0o111) != 0;

        if (!is_executable) {
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

/// Validate directory structure
pub fn validateDirectoryStructure(
    allocator: std.mem.Allocator,
    install_path: []const u8,
    required_dirs: []const []const u8,
) !ValidationResult {
    var errors = std.ArrayList([]const u8).init(allocator);
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
    defer base_dir.close();

    // Check required directories
    for (required_dirs) |dir_name| {
        var sub_dir = base_dir.openDir(dir_name, .{}) catch {
            try errors.append(allocator, try std.fmt.allocPrint(
                allocator,
                "Required directory not found: {s}",
                .{dir_name},
            ));
            continue;
        };
        sub_dir.close();
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
    const tmp_dir = try std.testing.tmpDir(.{});
    defer tmp_dir.cleanup();

    // Create a test file
    const file = try tmp_dir.dir.createFile("test.txt", .{});
    file.close();

    // Get path
    var path_buf: [std.fs.max_path_bytes]u8 = undefined;
    const tmp_path = try tmp_dir.dir.realpath(".", &path_buf);

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
    const tmp_dir = try std.testing.tmpDir(.{});
    defer tmp_dir.cleanup();

    // Get path
    var path_buf: [std.fs.max_path_bytes]u8 = undefined;
    const tmp_path = try tmp_dir.dir.realpath(".", &path_buf);

    // Validate with non-existent file
    const expected_files = [_][]const u8{"nonexistent.txt"};
    var result = try validateInstallation(allocator, tmp_path, &expected_files);
    defer result.deinit();

    try std.testing.expect(!result.valid);
    try std.testing.expect(result.errors.len == 1);
}

test "validateDirectoryStructure" {
    const allocator = std.testing.allocator;

    // Create temporary directory with subdirs
    const tmp_dir = try std.testing.tmpDir(.{});
    defer tmp_dir.cleanup();

    try tmp_dir.dir.makeDir("bin");
    try tmp_dir.dir.makeDir("lib");

    // Get path
    var path_buf: [std.fs.max_path_bytes]u8 = undefined;
    const tmp_path = try tmp_dir.dir.realpath(".", &path_buf);

    // Validate structure
    const required_dirs = [_][]const u8{ "bin", "lib" };
    var result = try validateDirectoryStructure(allocator, tmp_path, &required_dirs);
    defer result.deinit();

    try std.testing.expect(result.valid);
    try std.testing.expect(result.errors.len == 0);
}
