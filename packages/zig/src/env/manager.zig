const std = @import("std");
const core = @import("../core/platform.zig");
const string = @import("../core/string.zig");
const errors = @import("../core/error.zig");
const io_helper = @import("../io_helper.zig");

const pantryError = errors.pantryError;
const Paths = core.Paths;

/// Environment configuration
pub const Environment = struct {
    /// Environment hash (identifier)
    hash: [16]u8,
    /// Dependency file path
    dep_file: []const u8,
    /// PATH value
    path: []const u8,
    /// Environment variables
    env_vars: std.StringHashMap([]const u8),
    /// Installed packages
    packages: std.ArrayList([]const u8),
    /// Allocator for internal use
    _allocator: std.mem.Allocator,

    pub fn init(allocator: std.mem.Allocator) Environment {
        return .{
            .hash = [_]u8{0} ** 16,
            .dep_file = "",
            .path = "",
            .env_vars = std.StringHashMap([]const u8).init(allocator),
            .packages = std.ArrayList([]const u8).init(),
            ._allocator = allocator,
        };
    }

    pub fn deinit(self: *Environment, allocator: std.mem.Allocator) void {
        if (self.dep_file.len > 0) allocator.free(self.dep_file);
        if (self.path.len > 0) allocator.free(self.path);

        var it = self.env_vars.iterator();
        while (it.next()) |entry| {
            allocator.free(entry.key_ptr.*);
            allocator.free(entry.value_ptr.*);
        }
        self.env_vars.deinit();

        for (self.packages.items) |pkg| {
            allocator.free(pkg);
        }
        self.packages.deinit(self._allocator);
    }
};

/// Environment manager
pub const EnvManager = struct {
    /// Data directory
    data_dir: []const u8,
    /// Allocator
    allocator: std.mem.Allocator,

    pub fn init(allocator: std.mem.Allocator) !EnvManager {
        const data_dir = try Paths.data(allocator);
        errdefer allocator.free(data_dir);

        // Ensure data directory exists
        try io_helper.makePath(data_dir);

        return .{
            .data_dir = data_dir,
            .allocator = allocator,
        };
    }

    pub fn deinit(self: *EnvManager) void {
        self.allocator.free(self.data_dir);
    }

    /// Get environment directory path
    pub fn getEnvDir(self: *EnvManager, hash: [16]u8) ![]const u8 {
        const hex = try string.hashToHex(hash, self.allocator);
        defer self.allocator.free(hex);

        return std.fmt.allocPrint(
            self.allocator,
            "{s}/envs/{s}",
            .{ self.data_dir, hex },
        );
    }

    /// Create new environment
    pub fn create(self: *EnvManager, dep_file: []const u8) !Environment {
        var env = Environment.init(self.allocator);
        errdefer env.deinit(self.allocator);

        env.dep_file = try self.allocator.dupe(u8, dep_file);
        env.hash = string.hashDependencyFile(dep_file);

        // Create environment directory
        const env_dir = try self.getEnvDir(env.hash);
        defer self.allocator.free(env_dir);
        try io_helper.cwd().makePath(io_helper.io, env_dir);

        return env;
    }

    /// Load environment from hash
    pub fn load(self: *EnvManager, hash: [16]u8) !?Environment {
        const env_dir = try self.getEnvDir(hash);
        defer self.allocator.free(env_dir);

        // Check if environment exists
        io_helper.cwd().access(io_helper.io, env_dir, .{}) catch {
            return null;
        };

        var env = Environment.init(self.allocator);
        env.hash = hash;

        return env;
    }

    /// Remove environment
    pub fn remove(self: *EnvManager, hash: [16]u8) !void {
        const env_dir = try self.getEnvDir(hash);
        defer self.allocator.free(env_dir);

        // Remove environment directory
        io_helper.deleteTree(env_dir) catch {};
        // Ignore errors - environment may not exist
    }

    /// List all environments
    pub fn list(self: *EnvManager) !std.ArrayList([16]u8) {
        var envs = try std.ArrayList([16]u8).initCapacity(self.allocator, 16);
        errdefer envs.deinit(self.allocator);

        const envs_dir = try std.fmt.allocPrint(
            self.allocator,
            "{s}/envs",
            .{self.data_dir},
        );
        defer self.allocator.free(envs_dir);

        // Use std.fs.Dir for iteration (Io.Dir doesn't have iterate() in Zig 0.16)
        var dir = io_helper.openDirForIteration(envs_dir) catch |err| switch (err) {
            error.FileNotFound => return envs,
            else => return err,
        };
        defer dir.close();

        var it = dir.iterate();
        while (it.next() catch null) |entry| {
            if (entry.kind != .directory) continue;
            if (entry.name.len != 32) continue; // MD5 hex = 32 chars

            // Parse hex string back to hash
            var hash: [16]u8 = undefined;
            _ = try std.fmt.hexToBytes(&hash, entry.name);
            try envs.append(self.allocator, hash);
        }

        return envs;
    }
};

test "EnvManager basic operations" {
    const allocator = std.testing.allocator;
    var manager = try EnvManager.init(allocator);
    defer manager.deinit();

    // Create temporary test file
    const tmp_file = "/tmp/pantry_env_test.yaml";
    {
        const file = try std.Io.Dir.cwd().createFile(std.testing.io, tmp_file, .{});
        defer file.close(std.testing.io);
        var buffer: [4096]u8 = undefined;
        var writer = file.writer(std.testing.io, &buffer);
        try writer.writeAll("node: 20.0.0");
        try writer.flush();
    }
    defer std.Io.Dir.cwd().deleteFile(std.testing.io, tmp_file) catch {};

    // Create environment
    var env = try manager.create(tmp_file);
    defer env.deinit(allocator);

    try std.testing.expect(env.hash.len == 16);
    try std.testing.expectEqualStrings(tmp_file, env.dep_file);

    // Clean up
    try manager.remove(env.hash);
}
