const std = @import("std");
const lib = @import("../lib.zig");
const io_helper = @import("../io_helper.zig");

pub const EnvironmentInfo = struct {
    hash: []const u8,
    project_name: []const u8,
    path: []const u8,
    size_bytes: u64,
    packages: usize,
    binaries: usize,
    created: i64,
    modified: i64,

    pub fn deinit(self: *EnvironmentInfo, allocator: std.mem.Allocator) void {
        allocator.free(self.hash);
        allocator.free(self.project_name);
        allocator.free(self.path);
    }
};

pub const EnvScanner = struct {
    allocator: std.mem.Allocator,

    pub fn init(allocator: std.mem.Allocator) EnvScanner {
        return .{ .allocator = allocator };
    }

    pub fn deinit(self: *EnvScanner) void {
        _ = self;
    }

    /// Scan all environments
    pub fn scanAll(self: *EnvScanner) ![]EnvironmentInfo {
        const data_dir = try lib.Paths.data(self.allocator);
        defer self.allocator.free(data_dir);

        const envs_dir = try std.fs.path.join(self.allocator, &[_][]const u8{
            data_dir,
            "envs",
        });
        defer self.allocator.free(envs_dir);

        var dir = std.fs.cwd().openDir(envs_dir, .{ .iterate = true }) catch {
            return try self.allocator.alloc(EnvironmentInfo, 0);
        };
        defer dir.close();

        var envs = std.ArrayList(EnvironmentInfo){};
        errdefer {
            for (envs.items) |*env| {
                env.deinit(self.allocator);
            }
            envs.deinit(self.allocator);
        }

        var iter = dir.iterate();
        while (try iter.next()) |entry| {
            if (entry.kind != .directory) continue;
            if (std.mem.indexOf(u8, entry.name, "_") == null) continue;

            const env_info = try self.scanEnvironment(envs_dir, entry.name);
            try envs.append(self.allocator, env_info);
        }

        return try envs.toOwnedSlice(self.allocator);
    }

    fn scanEnvironment(self: *EnvScanner, envs_dir: []const u8, hash: []const u8) !EnvironmentInfo {
        const env_path = try std.fs.path.join(self.allocator, &[_][]const u8{
            envs_dir,
            hash,
        });
        errdefer self.allocator.free(env_path);

        const stat = try std.fs.cwd().statFile(env_path);

        // Parse project name from hash (format: project_hash-dhash)
        var parts = std.mem.splitScalar(u8, hash, '_');
        const project_name = parts.next() orelse hash;

        const size_bytes = try self.calculateSize(env_path);
        const packages = try self.countItems(env_path, "pkgs");
        const binaries = try self.countItems(env_path, "bin");

        return EnvironmentInfo{
            .hash = try self.allocator.dupe(u8, hash),
            .project_name = try self.allocator.dupe(u8, project_name),
            .path = env_path,
            .size_bytes = size_bytes,
            .packages = packages,
            .binaries = binaries,
            .created = @intCast(@divFloor(stat.ctime.toNanoseconds(), std.time.ns_per_s)),
            .modified = @intCast(@divFloor(stat.mtime.toNanoseconds(), std.time.ns_per_s)),
        };
    }

    fn calculateSize(self: *EnvScanner, dir_path: []const u8) !u64 {
        var total: u64 = 0;

        var dir = std.fs.cwd().openDir(dir_path, .{ .iterate = true }) catch return 0;
        defer dir.close();

        var walker = try dir.walk(self.allocator);
        defer walker.deinit();

        while (try walker.next()) |entry| {
            if (entry.kind == .file) {
                const stat = try entry.dir.statFile(entry.basename);
                total += @intCast(stat.size);
            }
        }

        return total;
    }

    fn countItems(self: *EnvScanner, env_path: []const u8, subdir: []const u8) !usize {
        const dir_path = try std.fs.path.join(self.allocator, &[_][]const u8{
            env_path,
            subdir,
        });
        defer self.allocator.free(dir_path);

        var dir = std.fs.cwd().openDir(dir_path, .{ .iterate = true }) catch return 0;
        defer dir.close();

        var count: usize = 0;
        var iter = dir.iterate();
        while (try iter.next()) |_| {
            count += 1;
        }

        return count;
    }

    /// Sort environments by modification time (newest first)
    pub fn sortByModified(envs: []EnvironmentInfo) void {
        std.mem.sort(EnvironmentInfo, envs, {}, struct {
            fn lessThan(_: void, a: EnvironmentInfo, b: EnvironmentInfo) bool {
                return a.modified > b.modified;
            }
        }.lessThan);
    }

    /// Sort environments by size (largest first)
    pub fn sortBySize(envs: []EnvironmentInfo) void {
        std.mem.sort(EnvironmentInfo, envs, {}, struct {
            fn lessThan(_: void, a: EnvironmentInfo, b: EnvironmentInfo) bool {
                return a.size_bytes > b.size_bytes;
            }
        }.lessThan);
    }

    /// Sort environments by name (alphabetical)
    pub fn sortByName(envs: []EnvironmentInfo) void {
        std.mem.sort(EnvironmentInfo, envs, {}, struct {
            fn lessThan(_: void, a: EnvironmentInfo, b: EnvironmentInfo) bool {
                return std.mem.lessThan(u8, a.project_name, b.project_name);
            }
        }.lessThan);
    }
};

test "EnvScanner init and deinit" {
    const allocator = std.testing.allocator;

    var scanner = EnvScanner.init(allocator);
    defer scanner.deinit();
}

test "EnvScanner scanAll empty" {
    const allocator = std.testing.allocator;

    var scanner = EnvScanner.init(allocator);
    defer scanner.deinit();

    const envs = try scanner.scanAll();
    defer allocator.free(envs);

    // Should return empty array if no envs directory
    try std.testing.expect(envs.len == 0);
}

test "EnvScanner sort functions" {
    const allocator = std.testing.allocator;

    var envs = [_]EnvironmentInfo{
        .{
            .hash = "hash1",
            .project_name = "zebra",
            .path = "/path1",
            .size_bytes = 100,
            .packages = 1,
            .binaries = 1,
            .created = 1000,
            .modified = 1000,
        },
        .{
            .hash = "hash2",
            .project_name = "apple",
            .path = "/path2",
            .size_bytes = 200,
            .packages = 2,
            .binaries = 2,
            .created = 2000,
            .modified = 2000,
        },
    };

    // Sort by name
    EnvScanner.sortByName(&envs);
    try std.testing.expectEqualStrings("apple", envs[0].project_name);

    // Sort by size
    EnvScanner.sortBySize(&envs);
    try std.testing.expect(envs[0].size_bytes == 200);

    // Sort by modified
    EnvScanner.sortByModified(&envs);
    try std.testing.expect(envs[0].modified == 2000);

    _ = allocator;
}
