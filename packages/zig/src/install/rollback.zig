const std = @import("std");

pub const RollbackError = error{
    RollbackFailed,
    NoBackupFound,
    RestoreFailed,
};

pub const RollbackAction = union(enum) {
    file_created: []const u8,
    file_modified: struct {
        path: []const u8,
        backup_path: []const u8,
    },
    file_deleted: []const u8,
    dir_created: []const u8,
    symlink_created: []const u8,

    pub fn deinit(self: *RollbackAction, allocator: std.mem.Allocator) void {
        switch (self.*) {
            .file_created => |path| allocator.free(path),
            .file_modified => |info| {
                allocator.free(info.path);
                allocator.free(info.backup_path);
            },
            .file_deleted => |path| allocator.free(path),
            .dir_created => |path| allocator.free(path),
            .symlink_created => |path| allocator.free(path),
        }
    }
};

pub const RollbackManager = struct {
    allocator: std.mem.Allocator,
    actions: std.ArrayList(RollbackAction),
    enabled: bool,

    pub fn init(allocator: std.mem.Allocator) RollbackManager {
        return .{
            .allocator = allocator,
            .actions = std.ArrayList(RollbackAction).init(allocator),
            .enabled = true,
        };
    }

    pub fn deinit(self: *RollbackManager) void {
        for (self.actions.items) |*action| {
            action.deinit(self.allocator);
        }
        self.actions.deinit();
    }

    pub fn disable(self: *RollbackManager) void {
        self.enabled = false;
    }

    pub fn enable(self: *RollbackManager) void {
        self.enabled = true;
    }

    /// Record file creation
    pub fn recordFileCreated(self: *RollbackManager, path: []const u8) !void {
        if (!self.enabled) return;

        const path_copy = try self.allocator.dupe(u8, path);
        errdefer self.allocator.free(path_copy);

        try self.actions.append(.{ .file_created = path_copy });
    }

    /// Record file modification (creates backup)
    pub fn recordFileModified(self: *RollbackManager, path: []const u8) !void {
        if (!self.enabled) return;

        // Create backup
        const backup_path = try std.fmt.allocPrint(
            self.allocator,
            "{s}.rollback-backup",
            .{path},
        );
        errdefer self.allocator.free(backup_path);

        std.fs.cwd().copyFile(path, std.fs.cwd(), backup_path, .{}) catch |err| {
            self.allocator.free(backup_path);
            return err;
        };

        const path_copy = try self.allocator.dupe(u8, path);
        errdefer {
            self.allocator.free(path_copy);
            std.fs.cwd().deleteFile(backup_path) catch {};
        }

        try self.actions.append(.{
            .file_modified = .{
                .path = path_copy,
                .backup_path = backup_path,
            },
        });
    }

    /// Record directory creation
    pub fn recordDirCreated(self: *RollbackManager, path: []const u8) !void {
        if (!self.enabled) return;

        const path_copy = try self.allocator.dupe(u8, path);
        errdefer self.allocator.free(path_copy);

        try self.actions.append(.{ .dir_created = path_copy });
    }

    /// Record symlink creation
    pub fn recordSymlinkCreated(self: *RollbackManager, path: []const u8) !void {
        if (!self.enabled) return;

        const path_copy = try self.allocator.dupe(u8, path);
        errdefer self.allocator.free(path_copy);

        try self.actions.append(.{ .symlink_created = path_copy });
    }

    /// Perform rollback (reverse all actions)
    pub fn rollback(self: *RollbackManager) !void {
        std.debug.print("\n  Rolling back installation...\n", .{});

        var i = self.actions.items.len;
        while (i > 0) {
            i -= 1;
            const action = self.actions.items[i];

            switch (action) {
                .file_created => |path| {
                    std.debug.print("  Removing created file: {s}\n", .{path});
                    std.fs.cwd().deleteFile(path) catch |err| {
                        std.debug.print("  ! Failed to remove {s}: {}\n", .{ path, err });
                    };
                },
                .file_modified => |info| {
                    std.debug.print("  Restoring modified file: {s}\n", .{info.path});
                    std.fs.cwd().copyFile(
                        info.backup_path,
                        std.fs.cwd(),
                        info.path,
                        .{},
                    ) catch |err| {
                        std.debug.print("  ! Failed to restore {s}: {}\n", .{ info.path, err });
                    };
                    std.fs.cwd().deleteFile(info.backup_path) catch {};
                },
                .file_deleted => |path| {
                    std.debug.print("  ! Cannot restore deleted file: {s}\n", .{path});
                },
                .dir_created => |path| {
                    std.debug.print("  Removing created directory: {s}\n", .{path});
                    std.fs.cwd().deleteTree(path) catch |err| {
                        std.debug.print("  ! Failed to remove directory {s}: {}\n", .{ path, err });
                    };
                },
                .symlink_created => |path| {
                    std.debug.print("  Removing created symlink: {s}\n", .{path});
                    std.fs.cwd().deleteFile(path) catch |err| {
                        std.debug.print("  ! Failed to remove symlink {s}: {}\n", .{ path, err });
                    };
                },
            }
        }

        std.debug.print("  ✓ Rollback complete\n", .{});
    }

    /// Commit changes (clear rollback actions)
    pub fn commit(self: *RollbackManager) void {
        // Clean up backup files
        for (self.actions.items) |action| {
            switch (action) {
                .file_modified => |info| {
                    std.fs.cwd().deleteFile(info.backup_path) catch {};
                },
                else => {},
            }
        }

        // Clear actions
        for (self.actions.items) |*action| {
            action.deinit(self.allocator);
        }
        self.actions.clearRetainingCapacity();
    }

    /// Get number of recorded actions
    pub fn actionCount(self: *RollbackManager) usize {
        return self.actions.items.len;
    }
};

test "RollbackManager basic" {
    const allocator = std.testing.allocator;

    var manager = RollbackManager.init(allocator);
    defer manager.deinit();

    try manager.recordFileCreated("/tmp/test.txt");
    try manager.recordDirCreated("/tmp/testdir");

    try std.testing.expect(manager.actionCount() == 2);
}

test "RollbackManager commit" {
    const allocator = std.testing.allocator;

    var manager = RollbackManager.init(allocator);
    defer manager.deinit();

    try manager.recordFileCreated("/tmp/test.txt");
    try std.testing.expect(manager.actionCount() == 1);

    manager.commit();
    try std.testing.expect(manager.actionCount() == 0);
}

test "RollbackManager disable/enable" {
    const allocator = std.testing.allocator;

    var manager = RollbackManager.init(allocator);
    defer manager.deinit();

    manager.disable();
    try manager.recordFileCreated("/tmp/test.txt");
    try std.testing.expect(manager.actionCount() == 0);

    manager.enable();
    try manager.recordFileCreated("/tmp/test2.txt");
    try std.testing.expect(manager.actionCount() == 1);
}

test "RollbackManager file creation and rollback" {
    const allocator = std.testing.allocator;

    var manager = RollbackManager.init(allocator);
    defer manager.deinit();

    // Create test file
    const test_file = "test_rollback.txt";
    {
        const file = try std.fs.cwd().createFile(test_file, .{});
        file.close();
    }

    try manager.recordFileCreated(test_file);

    // Rollback should delete the file
    try manager.rollback();

    // Verify file is gone
    const result = std.fs.cwd().access(test_file, .{});
    try std.testing.expectError(error.FileNotFound, result);
}

test "RollbackManager directory creation and rollback" {
    const allocator = std.testing.allocator;

    var manager = RollbackManager.init(allocator);
    defer manager.deinit();

    const test_dir = "test_rollback_dir";
    try std.fs.cwd().makeDir(test_dir);

    try manager.recordDirCreated(test_dir);

    // Rollback should delete the directory
    try manager.rollback();

    // Verify directory is gone
    const result = std.fs.cwd().access(test_dir, .{});
    try std.testing.expectError(error.FileNotFound, result);
}
