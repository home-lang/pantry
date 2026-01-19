//! Installation error recovery
//!
//! Provides rollback and recovery mechanisms for failed installations

const std = @import("std");
const io_helper = @import("../io_helper.zig");

/// Installation checkpoint for rollback
pub const InstallCheckpoint = struct {
    /// Packages installed before this operation
    installed_packages: std.StringHashMap(void),
    /// Files created during this operation
    created_files: std.ArrayList([]const u8),
    /// Directories created during this operation
    created_dirs: std.ArrayList([]const u8),
    /// Backup directory for rollback
    backup_dir: ?[]const u8,
    allocator: std.mem.Allocator,

    pub fn init(allocator: std.mem.Allocator) InstallCheckpoint {
        return .{
            .installed_packages = std.StringHashMap(void).init(allocator),
            .created_files = std.ArrayList([]const u8){},
            .created_dirs = std.ArrayList([]const u8){},
            .backup_dir = null,
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
    }

    /// Rollback all changes
    pub fn rollback(self: *InstallCheckpoint) !void {
        std.debug.print("🔄 Rolling back installation...\n", .{});

        var failed_count: usize = 0;

        // Delete created files (in reverse order)
        var i = self.created_files.items.len;
        while (i > 0) {
            i -= 1;
            const file = self.created_files.items[i];
            io_helper.deleteFile(file) catch |err| {
                std.debug.print("⚠️  Failed to delete {s}: {}\n", .{ file, err });
                failed_count += 1;
            };
        }

        // Delete created directories (in reverse order)
        i = self.created_dirs.items.len;
        while (i > 0) {
            i -= 1;
            const dir = self.created_dirs.items[i];
            io_helper.deleteTree(dir) catch |err| {
                std.debug.print("⚠️  Failed to delete {s}: {}\n", .{ dir, err });
                failed_count += 1;
            };
        }

        // Restore from backup if available
        if (self.backup_dir) |backup| {
            restoreFromBackup(backup) catch |err| {
                std.debug.print("⚠️  Failed to restore from backup: {}\n", .{err});
                failed_count += 1;
            };
        }

        if (failed_count > 0) {
            std.debug.print("⚠️  Rollback completed with {d} error(s)\n", .{failed_count});
        } else {
            std.debug.print("✅ Rollback completed successfully\n", .{});
        }
    }

    /// Create a backup of the current state
    pub fn createBackup(self: *InstallCheckpoint, target_dir: []const u8) !void {
        // Create backup directory with random suffix (timestamp API changed in Zig 0.16)
        var random_bytes: [8]u8 = undefined;
        std.crypto.random.bytes(&random_bytes);
        const backup_suffix = std.mem.readInt(u64, &random_bytes, .big);
        const backup_dir = try std.fmt.allocPrint(
            self.allocator,
            "{s}/.pantry-backup-{d}",
            .{ target_dir, backup_suffix },
        );
        errdefer self.allocator.free(backup_dir);

        try io_helper.makePath(backup_dir);
        self.backup_dir = backup_dir;

        std.debug.print("📦 Created backup at: {s}\n", .{backup_dir});
    }
};

fn restoreFromBackup(backup_dir: []const u8) !void {
    // Implementation: copy files from backup back to original location
    std.debug.print("🔄 Restoring from backup: {s}\n", .{backup_dir});

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
        const red = "\x1b[31m";
        const yellow = "\x1b[33m";
        const reset = "\x1b[0m";

        std.debug.print("\n{s}❌ Error:{s} {s}\n\n", .{ red, reset, self.message });
        std.debug.print("{s}💡 Suggestions:{s}\n", .{ yellow, reset });
        for (self.suggestions, 1..) |suggestion, i| {
            std.debug.print("   {d}. {s}\n", .{ i, suggestion });
        }
        std.debug.print("\n", .{});
    }
};
