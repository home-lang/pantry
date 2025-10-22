const std = @import("std");
const types = @import("../types.zig");
const errors = @import("../errors.zig");

/// File loader service for discovering and loading configuration files
pub const FileLoader = struct {
    allocator: std.mem.Allocator,

    const EXTENSIONS = [_][]const u8{ ".json", ".zig" };
    const PROJECT_PATHS = [_][]const u8{ "", "config", ".config" };

    pub fn init(allocator: std.mem.Allocator) FileLoader {
        return FileLoader{
            .allocator = allocator,
        };
    }

    /// Find config file in multiple locations with extension priority
    pub fn findConfigFile(
        self: *FileLoader,
        name: []const u8,
        cwd: []const u8,
    ) !?[]const u8 {
        // Search in project directories
        for (PROJECT_PATHS) |dir| {
            for (EXTENSIONS) |ext| {
                const path = if (dir.len == 0)
                    try std.fmt.allocPrint(self.allocator, "{s}/{s}{s}", .{ cwd, name, ext })
                else
                    try std.fmt.allocPrint(self.allocator, "{s}/{s}/{s}{s}", .{ cwd, dir, name, ext });
                defer self.allocator.free(path);

                std.fs.accessAbsolute(path, .{}) catch continue;
                return try self.allocator.dupe(u8, path);
            }
        }

        // Search in home directory
        const home = std.posix.getenv("HOME") orelse return null;
        for (EXTENSIONS) |ext| {
            const path = try std.fmt.allocPrint(
                self.allocator,
                "{s}/.config/{s}{s}",
                .{ home, name, ext },
            );
            defer self.allocator.free(path);

            std.fs.accessAbsolute(path, .{}) catch continue;
            return try self.allocator.dupe(u8, path);
        }

        return null;
    }

    /// Load and parse config file
    pub fn loadConfigFile(
        self: *FileLoader,
        path: []const u8,
    ) !std.json.Value {
        const file = std.fs.openFileAbsolute(path, .{}) catch |err| {
            return switch (err) {
                error.FileNotFound => errors.ZonfigError.ConfigFileNotFound,
                error.AccessDenied => errors.ZonfigError.ConfigFilePermissionDenied,
                else => err,
            };
        };
        defer file.close();

        const content = file.readToEndAlloc(self.allocator, 10 * 1024 * 1024) catch |err| {
            return switch (err) {
                error.AccessDenied => errors.ZonfigError.ConfigFilePermissionDenied,
                else => errors.ZonfigError.ConfigFileInvalid,
            };
        };
        defer self.allocator.free(content);

        // Parse JSON
        const parsed = std.json.parseFromSlice(
            std.json.Value,
            self.allocator,
            content,
            .{},
        ) catch {
            return errors.ZonfigError.ConfigFileSyntaxError;
        };

        return parsed.value;
    }

    /// Get file modification time for cache invalidation
    pub fn getModTime(self: *FileLoader, path: []const u8) !i64 {
        _ = self;
        const file = try std.fs.openFileAbsolute(path, .{});
        defer file.close();

        const stat = try file.stat();
        return @as(i64, @intCast(stat.mtime));
    }
};

test "FileLoader.findConfigFile finds in project root" {
    const allocator = std.testing.allocator;

    var tmp = std.testing.tmpDir(.{});
    defer tmp.cleanup();

    const file = try tmp.dir.createFile("test.json", .{});
    defer file.close();
    try file.writeAll("{}");

    const cwd = try tmp.dir.realpathAlloc(allocator, ".");
    defer allocator.free(cwd);

    var loader = FileLoader.init(allocator);
    const found = try loader.findConfigFile("test", cwd);
    defer if (found) |path| allocator.free(path);

    try std.testing.expect(found != null);
    try std.testing.expect(std.mem.endsWith(u8, found.?, "test.json"));
}

test "FileLoader.findConfigFile returns null when not found" {
    const allocator = std.testing.allocator;

    var tmp = std.testing.tmpDir(.{});
    defer tmp.cleanup();

    const cwd = try tmp.dir.realpathAlloc(allocator, ".");
    defer allocator.free(cwd);

    var loader = FileLoader.init(allocator);
    const found = try loader.findConfigFile("nonexistent", cwd);

    try std.testing.expect(found == null);
}

test "FileLoader.loadConfigFile parses JSON" {
    const allocator = std.testing.allocator;

    var tmp = std.testing.tmpDir(.{});
    defer tmp.cleanup();

    const file = try tmp.dir.createFile("test.json", .{});
    defer file.close();
    try file.writeAll("{\"key\": \"value\"}");

    const path = try tmp.dir.realpathAlloc(allocator, "test.json");
    defer allocator.free(path);

    var loader = FileLoader.init(allocator);
    var config = try loader.loadConfigFile(path);
    defer config.object.deinit();

    try std.testing.expect(config == .object);
    try std.testing.expect(config.object.get("key") != null);
}
