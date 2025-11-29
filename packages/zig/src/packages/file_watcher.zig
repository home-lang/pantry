//! File Watcher Module
//!
//! Monitors file system changes in workspace packages and triggers callbacks
//! when changes are detected. Uses polling-based approach for cross-platform
//! compatibility.

const std = @import("std");
const types = @import("types.zig");

/// Options for file watching
pub const WatchOptions = struct {
    /// Poll interval in milliseconds
    poll_interval_ms: u64 = 500,
    /// Debounce time in milliseconds (wait this long after last change)
    debounce_ms: u64 = 100,
    /// Ignore patterns (e.g., "node_modules", ".git")
    ignore_patterns: []const []const u8 = &[_][]const u8{
        "node_modules",
        ".git",
        "pantry_modules",
        ".zig-cache",
        "zig-out",
        ".DS_Store",
    },
};

/// File change event
pub const FileChangeEvent = struct {
    /// Path to the changed file
    file_path: []const u8,
    /// Package that contains this file
    member: types.WorkspaceMember,
    /// Type of change
    change_type: ChangeType,
    /// Timestamp of change
    timestamp: i64,

    pub const ChangeType = enum {
        created,
        modified,
        deleted,
    };
};

/// File watcher state
pub const FileWatcher = struct {
    allocator: std.mem.Allocator,
    members: []const types.WorkspaceMember,
    options: WatchOptions,
    file_timestamps: std.StringHashMap(i64),
    should_stop: std.atomic.Value(bool),
    last_change_time: std.atomic.Value(i64),

    pub fn init(
        allocator: std.mem.Allocator,
        members: []const types.WorkspaceMember,
        options: WatchOptions,
    ) !FileWatcher {
        return FileWatcher{
            .allocator = allocator,
            .members = members,
            .options = options,
            .file_timestamps = std.StringHashMap(i64).init(allocator),
            .should_stop = std.atomic.Value(bool).init(false),
            .last_change_time = std.atomic.Value(i64).init(0),
        };
    }

    pub fn deinit(self: *FileWatcher) void {
        var iter = self.file_timestamps.keyIterator();
        while (iter.next()) |key| {
            self.allocator.free(key.*);
        }
        self.file_timestamps.deinit();
    }

    /// Start watching for changes
    /// Callback is called when changes are detected after debounce period
    pub fn watch(
        self: *FileWatcher,
        callback: *const fn (allocator: std.mem.Allocator, events: []FileChangeEvent) anyerror!void,
    ) !void {
        // Initial scan to populate timestamps
        try self.scanAllFiles();

        std.debug.print("👀 Watching for changes in {d} package(s)...\n", .{self.members.len});
        std.debug.print("   Press Ctrl+C to stop\n\n", .{});

        while (!self.should_stop.load(.acquire)) {
            // Poll for changes
            const changes = try self.detectChanges();
            defer {
                for (changes) |change| {
                    self.allocator.free(change.file_path);
                }
                self.allocator.free(changes);
            }

            if (changes.len > 0) {
                // Update last change time
                const now = @as(i64, @intCast((std.posix.clock_gettime(.REALTIME) catch std.posix.timespec{ .sec = 0, .nsec = 0 }).sec * 1000));
                self.last_change_time.store(now, .release);

                // Wait for debounce period
                std.Thread.sleep(self.options.debounce_ms * std.time.ns_per_ms);

                // Check if more changes occurred during debounce
                const last_change = self.last_change_time.load(.acquire);
                const time_since_last = @as(i64, @intCast((std.posix.clock_gettime(.REALTIME) catch std.posix.timespec{ .sec = 0, .nsec = 0 }).sec * 1000)) - last_change;

                if (time_since_last >= self.options.debounce_ms) {
                    // No more changes, trigger callback
                    try callback(self.allocator, changes);
                }
            }

            // Sleep for poll interval
            std.Thread.sleep(self.options.poll_interval_ms * std.time.ns_per_ms);
        }
    }

    /// Stop watching
    pub fn stop(self: *FileWatcher) void {
        self.should_stop.store(true, .release);
    }

    /// Scan all files in watched packages
    pub fn scanAllFiles(self: *FileWatcher) !void {
        for (self.members) |member| {
            try self.scanDirectory(member.abs_path, member);
        }
    }

    /// Recursively scan a directory
    fn scanDirectory(self: *FileWatcher, dir_path: []const u8, member: types.WorkspaceMember) !void {
        var dir = std.fs.openDirAbsolute(dir_path, .{ .iterate = true }) catch |err| {
            // Skip directories we can't open
            if (err == error.AccessDenied or err == error.FileNotFound) {
                return;
            }
            return err;
        };
        defer dir.close();

        var iter = dir.iterate();
        while (try iter.next()) |entry| {
            // Check ignore patterns
            if (self.shouldIgnore(entry.name)) {
                continue;
            }

            const full_path = try std.fs.path.join(self.allocator, &[_][]const u8{ dir_path, entry.name });
            defer self.allocator.free(full_path);

            if (entry.kind == .directory) {
                try self.scanDirectory(full_path, member);
            } else if (entry.kind == .file) {
                // Get file modification time
                const stat = std.fs.cwd().statFile(full_path) catch continue;
                const mtime: i64 = @intCast(@divFloor(stat.mtime.toNanoseconds(), std.time.ns_per_ms));

                // Store timestamp
                const path_copy = try self.allocator.dupe(u8, full_path);
                try self.file_timestamps.put(path_copy, mtime);
            }
        }
    }

    /// Detect changes since last scan
    pub fn detectChanges(self: *FileWatcher) ![]FileChangeEvent {
        var changes = std.ArrayList(FileChangeEvent){};
        errdefer {
            for (changes.items) |change| {
                self.allocator.free(change.file_path);
            }
            changes.deinit(self.allocator);
        }

        var new_timestamps = std.StringHashMap(i64).init(self.allocator);
        defer {
            var iter = new_timestamps.keyIterator();
            while (iter.next()) |key| {
                self.allocator.free(key.*);
            }
            new_timestamps.deinit();
        }

        // Scan all files again
        for (self.members) |member| {
            try self.scanDirectoryForChanges(member.abs_path, member, &changes, &new_timestamps);
        }

        // Check for deleted files
        var old_iter = self.file_timestamps.iterator();
        while (old_iter.next()) |entry| {
            if (!new_timestamps.contains(entry.key_ptr.*)) {
                // File was deleted
                const member = self.findMemberForPath(entry.key_ptr.*) orelse continue;
                try changes.append(self.allocator, .{
                    .file_path = try self.allocator.dupe(u8, entry.key_ptr.*),
                    .member = member,
                    .change_type = .deleted,
                    .timestamp = @as(i64, @intCast((std.posix.clock_gettime(.REALTIME) catch std.posix.timespec{ .sec = 0, .nsec = 0 }).sec * 1000)),
                });
            }
        }

        // Update timestamps
        var old_key_iter = self.file_timestamps.keyIterator();
        while (old_key_iter.next()) |key| {
            self.allocator.free(key.*);
        }
        self.file_timestamps.deinit();
        self.file_timestamps = new_timestamps;
        new_timestamps = std.StringHashMap(i64).init(self.allocator);

        return try changes.toOwnedSlice(self.allocator);
    }

    /// Scan directory and detect changes
    fn scanDirectoryForChanges(
        self: *FileWatcher,
        dir_path: []const u8,
        member: types.WorkspaceMember,
        changes: *std.ArrayList(FileChangeEvent),
        new_timestamps: *std.StringHashMap(i64),
    ) !void {
        var dir = std.fs.openDirAbsolute(dir_path, .{ .iterate = true }) catch |err| {
            if (err == error.AccessDenied or err == error.FileNotFound) {
                return;
            }
            return err;
        };
        defer dir.close();

        var iter = dir.iterate();
        while (try iter.next()) |entry| {
            if (self.shouldIgnore(entry.name)) {
                continue;
            }

            const full_path = try std.fs.path.join(self.allocator, &[_][]const u8{ dir_path, entry.name });
            defer self.allocator.free(full_path);

            if (entry.kind == .directory) {
                try self.scanDirectoryForChanges(full_path, member, changes, new_timestamps);
            } else if (entry.kind == .file) {
                const stat = std.fs.cwd().statFile(full_path) catch continue;
                const mtime: i64 = @intCast(@divFloor(stat.mtime.toNanoseconds(), std.time.ns_per_ms));

                // Store new timestamp
                const path_copy = try self.allocator.dupe(u8, full_path);
                try new_timestamps.put(path_copy, mtime);

                // Check if file changed
                if (self.file_timestamps.get(full_path)) |old_mtime| {
                    if (mtime > old_mtime) {
                        // File was modified
                        try changes.append(self.allocator, .{
                            .file_path = try self.allocator.dupe(u8, full_path),
                            .member = member,
                            .change_type = .modified,
                            .timestamp = @as(i64, @intCast((std.posix.clock_gettime(.REALTIME) catch std.posix.timespec{ .sec = 0, .nsec = 0 }).sec * 1000)),
                        });
                    }
                } else {
                    // File is new
                    try changes.append(self.allocator, .{
                        .file_path = try self.allocator.dupe(u8, full_path),
                        .member = member,
                        .change_type = .created,
                        .timestamp = @as(i64, @intCast((std.posix.clock_gettime(.REALTIME) catch std.posix.timespec{ .sec = 0, .nsec = 0 }).sec * 1000)),
                    });
                }
            }
        }
    }

    /// Check if a file should be ignored
    fn shouldIgnore(self: *FileWatcher, name: []const u8) bool {
        for (self.options.ignore_patterns) |pattern| {
            if (std.mem.eql(u8, name, pattern)) {
                return true;
            }
            // Simple prefix/suffix matching
            if (std.mem.startsWith(u8, name, pattern) or std.mem.endsWith(u8, name, pattern)) {
                return true;
            }
        }
        return false;
    }

    /// Find which member contains a file path
    fn findMemberForPath(self: *FileWatcher, file_path: []const u8) ?types.WorkspaceMember {
        for (self.members) |member| {
            if (std.mem.startsWith(u8, file_path, member.abs_path)) {
                return member;
            }
        }
        return null;
    }
};

// ============================================================================
// Tests
// ============================================================================

test "FileWatcher - init and deinit" {
    const allocator = std.testing.allocator;

    const members = [_]types.WorkspaceMember{
        .{
            .name = "test-pkg",
            .path = "./packages/test",
            .abs_path = "/tmp/packages/test",
            .config_path = null,
            .deps_file_path = null,
        },
    };

    var watcher = try FileWatcher.init(allocator, &members, .{});
    defer watcher.deinit();

    try std.testing.expect(watcher.members.len == 1);
}

test "FileWatcher - shouldIgnore" {
    const allocator = std.testing.allocator;

    const members = [_]types.WorkspaceMember{
        .{
            .name = "test-pkg",
            .path = "./packages/test",
            .abs_path = "/tmp/packages/test",
            .config_path = null,
            .deps_file_path = null,
        },
    };

    var watcher = try FileWatcher.init(allocator, &members, .{});
    defer watcher.deinit();

    try std.testing.expect(watcher.shouldIgnore("node_modules"));
    try std.testing.expect(watcher.shouldIgnore(".git"));
    try std.testing.expect(watcher.shouldIgnore("pantry_modules"));
    try std.testing.expect(!watcher.shouldIgnore("src"));
    try std.testing.expect(!watcher.shouldIgnore("index.ts"));
}
