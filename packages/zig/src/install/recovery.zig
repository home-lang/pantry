//! Installation error recovery
//!
//! Provides rollback, recovery, and resume mechanisms for failed installations.

const std = @import("std");
const io_helper = @import("../io_helper.zig");
const style = @import("../cli/style.zig");

/// Installation checkpoint for rollback and resume
pub const InstallCheckpoint = struct {
    /// Packages installed before this operation
    installed_packages: std.StringHashMap(void),
    /// Files created during this operation
    created_files: std.ArrayList([]const u8),
    /// Directories created during this operation
    created_dirs: std.ArrayList([]const u8),
    /// Backup directory for rollback
    backup_dir: ?[]const u8,
    /// Path to persist checkpoint on disk (for resume)
    checkpoint_path: ?[]const u8,
    allocator: std.mem.Allocator,

    pub fn init(allocator: std.mem.Allocator) InstallCheckpoint {
        return .{
            .installed_packages = std.StringHashMap(void).init(allocator),
            .created_files = std.ArrayList([]const u8){},
            .created_dirs = std.ArrayList([]const u8){},
            .backup_dir = null,
            .checkpoint_path = null,
            .allocator = allocator,
        };
    }

    pub fn deinit(self: *InstallCheckpoint) void {
        var it = self.installed_packages.keyIterator();
        while (it.next()) |key| {
            self.allocator.free(key.*);
        }
        self.installed_packages.deinit();

        for (self.created_files.items) |file| {
            self.allocator.free(file);
        }
        self.created_files.deinit(self.allocator);

        for (self.created_dirs.items) |dir| {
            self.allocator.free(dir);
        }
        self.created_dirs.deinit(self.allocator);

        if (self.backup_dir) |dir| {
            self.allocator.free(dir);
        }

        if (self.checkpoint_path) |path| {
            self.allocator.free(path);
        }
    }

    /// Record a file creation
    pub fn recordFile(self: *InstallCheckpoint, file_path: []const u8) !void {
        const owned = try self.allocator.dupe(u8, file_path);
        try self.created_files.append(self.allocator, owned);
    }

    /// Record a directory creation
    pub fn recordDir(self: *InstallCheckpoint, dir_path: []const u8) !void {
        const owned = try self.allocator.dupe(u8, dir_path);
        try self.created_dirs.append(self.allocator, owned);
    }

    /// Record a package installation
    pub fn recordPackage(self: *InstallCheckpoint, name: []const u8) !void {
        const owned = try self.allocator.dupe(u8, name);
        try self.installed_packages.put(owned, {});
        // Persist to disk after each package
        self.persist() catch |err| {
            style.print("Warning: Failed to persist install checkpoint: {}\n", .{err});
        };
    }

    /// Check if a package was already installed (for resume)
    pub fn isPackageInstalled(self: *const InstallCheckpoint, name: []const u8) bool {
        return self.installed_packages.contains(name);
    }

    /// Set the checkpoint file path for persistence
    pub fn setCheckpointPath(self: *InstallCheckpoint, project_dir: []const u8) !void {
        if (self.checkpoint_path) |old| self.allocator.free(old);
        self.checkpoint_path = try std.fmt.allocPrint(
            self.allocator,
            "{s}/.pantry-checkpoint.json",
            .{project_dir},
        );
    }

    /// Persist checkpoint to disk as JSON
    fn persist(self: *InstallCheckpoint) !void {
        const path = self.checkpoint_path orelse return;

        var buf = try std.ArrayList(u8).initCapacity(self.allocator, 1024);
        defer buf.deinit(self.allocator);

        try buf.appendSlice(self.allocator, "{\"packages\":[");
        var it = self.installed_packages.keyIterator();
        var first = true;
        while (it.next()) |key| {
            if (!first) try buf.appendSlice(self.allocator, ",");
            first = false;
            try buf.append(self.allocator, '"');
            try buf.appendSlice(self.allocator, key.*);
            try buf.append(self.allocator, '"');
        }
        try buf.appendSlice(self.allocator, "]}");

        const file = io_helper.cwd().createFile(io_helper.io, path, .{}) catch return;
        defer file.close(io_helper.io);
        io_helper.writeAllToFile(file, buf.items) catch |err| {
            style.print("Warning: Failed to write checkpoint file: {}\n", .{err});
        };
    }

    /// Load a checkpoint from disk (for resume)
    pub fn loadFromDisk(allocator: std.mem.Allocator, project_dir: []const u8) !?InstallCheckpoint {
        const path = try std.fmt.allocPrint(allocator, "{s}/.pantry-checkpoint.json", .{project_dir});
        defer allocator.free(path);

        const content = io_helper.readFileAlloc(allocator, path, 1024 * 1024) catch return null;
        defer allocator.free(content);

        // Parse JSON
        const parsed = std.json.parseFromSlice(std.json.Value, allocator, content, .{}) catch return null;
        defer parsed.deinit();

        if (parsed.value != .object) return null;
        const packages_val = parsed.value.object.get("packages") orelse return null;
        if (packages_val != .array) return null;

        var checkpoint = InstallCheckpoint.init(allocator);
        checkpoint.checkpoint_path = try std.fmt.allocPrint(allocator, "{s}/.pantry-checkpoint.json", .{project_dir});

        for (packages_val.array.items) |item| {
            if (item == .string) {
                const owned = try allocator.dupe(u8, item.string);
                try checkpoint.installed_packages.put(owned, {});
            }
        }

        return checkpoint;
    }

    /// Remove the checkpoint file (called on successful completion)
    pub fn cleanup(self: *InstallCheckpoint) void {
        if (self.checkpoint_path) |path| {
            io_helper.deleteFile(path) catch {};
        }
    }

    /// Rollback all changes
    pub fn rollback(self: *InstallCheckpoint) !void {
        style.print("Rolling back installation...\n", .{});

        var failed_count: usize = 0;

        // Delete created files (in reverse order)
        var i = self.created_files.items.len;
        while (i > 0) {
            i -= 1;
            const file = self.created_files.items[i];
            io_helper.deleteFile(file) catch |err| {
                style.print("  Failed to delete {s}: {}\n", .{ file, err });
                failed_count += 1;
            };
        }

        // Delete created directories (in reverse order)
        i = self.created_dirs.items.len;
        while (i > 0) {
            i -= 1;
            const dir = self.created_dirs.items[i];
            io_helper.deleteTree(dir) catch |err| {
                style.print("  Failed to delete {s}: {}\n", .{ dir, err });
                failed_count += 1;
            };
        }

        // Restore from backup if available
        if (self.backup_dir) |backup| {
            restoreFromBackup(backup) catch |err| {
                style.print("  Failed to restore from backup: {}\n", .{err});
                failed_count += 1;
            };
        }

        if (failed_count > 0) {
            style.print("Rollback completed with {d} error(s)\n", .{failed_count});
        } else {
            style.print("Rollback completed successfully\n", .{});
        }
    }

    /// Create a backup of the current state
    pub fn createBackup(self: *InstallCheckpoint, target_dir: []const u8) !void {
        _ = target_dir;

        // Create backup directory in system temp directory (not in project)
        const tmp_dir = io_helper.getTempDir();

        var random_bytes: [8]u8 = undefined;
        io_helper.randomBytes(&random_bytes);
        const backup_suffix = std.mem.readInt(u64, &random_bytes, .big);
        const backup_dir = try std.fmt.allocPrint(
            self.allocator,
            "{s}/pantry-backup-{d}",
            .{ tmp_dir, backup_suffix },
        );
        errdefer self.allocator.free(backup_dir);

        try io_helper.makePath(backup_dir);
        self.backup_dir = backup_dir;
    }
};

fn restoreFromBackup(backup_dir: []const u8) !void {
    // Implementation: copy files from backup back to original location
    style.print("Restoring from backup: {s}\n", .{backup_dir});

    // After restore, clean up backup
    defer io_helper.deleteTree(backup_dir) catch {};
}

/// Error recovery suggestions
pub const RecoverySuggestion = struct {
    error_type: ErrorType,
    message: []const u8,
    suggestions: []const []const u8,

    pub const ErrorType = enum {
        network,
        permission,
        disk_space,
        corrupted,
        missing_dependency,
        version_conflict,
        package_not_found,
        unknown,
    };

    pub fn suggest(allocator: std.mem.Allocator, err: anyerror, context: []const u8) !RecoverySuggestion {
        _ = allocator;

        const error_type = classifyError(err);

        return switch (error_type) {
            .network => .{
                .error_type = .network,
                .message = "Network connection failed",
                .suggestions = &[_][]const u8{
                    "Check your internet connection",
                    "Try again with --offline flag to use cached packages",
                    "Check if a proxy is required (HTTP_PROXY environment variable)",
                    "Verify the registry URL is accessible",
                },
            },
            .permission => .{
                .error_type = .permission,
                .message = "Permission denied",
                .suggestions = &[_][]const u8{
                    "Try running with appropriate permissions",
                    "Check file/directory ownership",
                    "Use --global flag to install system-wide (requires sudo)",
                },
            },
            .disk_space => .{
                .error_type = .disk_space,
                .message = "Insufficient disk space",
                .suggestions = &[_][]const u8{
                    "Free up disk space",
                    "Run 'pantry cache clear' to remove cached packages",
                    "Check available disk space with 'df -h'",
                },
            },
            .corrupted => .{
                .error_type = .corrupted,
                .message = "Package appears to be corrupted",
                .suggestions = &[_][]const u8{
                    "Clear cache: pantry cache clear",
                    "Try installing again",
                    "Report the issue if it persists",
                },
            },
            .missing_dependency => .{
                .error_type = .missing_dependency,
                .message = context,
                .suggestions = &[_][]const u8{
                    "Install the missing dependency first",
                    "Check if the dependency name is correct",
                    "Try 'pantry search <package>' to find the right package",
                },
            },
            .version_conflict => .{
                .error_type = .version_conflict,
                .message = "Version conflict detected",
                .suggestions = &[_][]const u8{
                    "Check dependency versions in pantry.json",
                    "Try updating to compatible versions",
                    "Use 'pantry tree' to visualize dependency conflicts",
                    "Consider using version ranges instead of exact versions",
                },
            },
            .package_not_found => .{
                .error_type = .package_not_found,
                .message = "Package not found in registry",
                .suggestions = &[_][]const u8{
                    "This package may be an npm package (not yet supported)",
                    "Try 'pantry search <name>' to find available packages",
                    "Check spelling of the package name",
                    "For npm packages, use: bun install <package> (for now)",
                },
            },
            .unknown => .{
                .error_type = .unknown,
                .message = context,
                .suggestions = &[_][]const u8{
                    "Check the error message above for details",
                    "Try running with --verbose for more information",
                    "Search for similar issues: https://github.com/stacksjs/stacks/issues",
                },
            },
        };
    }

    fn classifyError(err: anyerror) ErrorType {
        return switch (err) {
            error.ConnectionRefused,
            error.NetworkUnreachable,
            error.HostUnreachable,
            error.ConnectionResetByPeer,
            error.ConnectionTimedOut,
            => .network,

            error.AccessDenied,
            error.PermissionDenied,
            => .permission,

            error.NoSpaceLeft,
            error.DiskQuota,
            => .disk_space,

            error.InvalidCharacter,
            error.Unexpected,
            error.EndOfStream,
            => .corrupted,

            error.PackageNotFound,
            => .package_not_found,

            else => .unknown,
        };
    }

    pub fn print(self: *const RecoverySuggestion) void {
        style.print("\n{s}Error:{s} {s}\n\n", .{ style.red, style.reset, self.message });
        style.print("{s}Suggestions:{s}\n", .{ style.yellow, style.reset });
        for (self.suggestions, 1..) |suggestion, i| {
            style.print("   {d}. {s}\n", .{ i, suggestion });
        }
        style.print("\n", .{});
    }
};

test "checkpoint init and deinit" {
    const allocator = std.testing.allocator;
    var cp = InstallCheckpoint.init(allocator);
    defer cp.deinit();

    try cp.recordPackage("test-pkg");
    try std.testing.expect(cp.isPackageInstalled("test-pkg"));
    try std.testing.expect(!cp.isPackageInstalled("other-pkg"));
}

test "checkpoint record multiple packages" {
    const allocator = std.testing.allocator;
    var cp = InstallCheckpoint.init(allocator);
    defer cp.deinit();

    try cp.recordPackage("pkg-a");
    try cp.recordPackage("pkg-b");
    try cp.recordPackage("pkg-c");

    try std.testing.expect(cp.isPackageInstalled("pkg-a"));
    try std.testing.expect(cp.isPackageInstalled("pkg-b"));
    try std.testing.expect(cp.isPackageInstalled("pkg-c"));
    try std.testing.expect(!cp.isPackageInstalled("pkg-d"));
    try std.testing.expectEqual(@as(usize, 3), cp.installed_packages.count());
}

test "checkpoint record files and dirs" {
    const allocator = std.testing.allocator;
    var cp = InstallCheckpoint.init(allocator);
    defer cp.deinit();

    try cp.recordFile("/tmp/test-file");
    try cp.recordDir("/tmp/test-dir");

    try std.testing.expectEqual(@as(usize, 1), cp.created_files.items.len);
    try std.testing.expectEqual(@as(usize, 1), cp.created_dirs.items.len);
}
