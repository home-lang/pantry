const std = @import("std");
const core = @import("../core/platform.zig");
const string = @import("../core/string.zig");
const errors = @import("../core/error.zig");

const LaunchpadError = errors.LaunchpadError;
const Paths = core.Paths;

/// Package cache entry metadata
pub const PackageMetadata = struct {
    /// Package name
    name: []const u8,
    /// Package version
    version: []const u8,
    /// Download URL
    url: []const u8,
    /// SHA256 checksum
    checksum: [32]u8,
    /// Download timestamp
    downloaded_at: i64,
    /// File size in bytes
    size: usize,
    /// Cached file path
    cache_path: []const u8,

    pub fn deinit(self: *PackageMetadata, allocator: std.mem.Allocator) void {
        allocator.free(self.name);
        allocator.free(self.version);
        allocator.free(self.url);
        allocator.free(self.cache_path);
    }
};

/// Package download cache
pub const PackageCache = struct {
    /// Cache directory path
    cache_dir: []const u8,
    /// Metadata storage (package@version -> metadata)
    metadata: std.StringHashMap(PackageMetadata),
    /// Allocator
    allocator: std.mem.Allocator,
    /// Lock for thread safety
    lock: std.Thread.RwLock,

    pub fn init(allocator: std.mem.Allocator) !PackageCache {
        const cache_dir = try Paths.cache(allocator);
        errdefer allocator.free(cache_dir);

        // Ensure cache directory exists
        try std.fs.cwd().makePath(cache_dir);

        return .{
            .cache_dir = cache_dir,
            .metadata = std.StringHashMap(PackageMetadata).init(allocator),
            .allocator = allocator,
            .lock = .{},
        };
    }

    pub fn deinit(self: *PackageCache) void {
        self.lock.lock();
        defer self.lock.unlock();

        var it = self.metadata.iterator();
        while (it.next()) |entry| {
            self.allocator.free(entry.key_ptr.*);
            var meta = entry.value_ptr;
            meta.deinit(self.allocator);
        }
        self.metadata.deinit();
        self.allocator.free(self.cache_dir);
    }

    /// Get cache key for package
    fn getCacheKey(allocator: std.mem.Allocator, name: []const u8, version: []const u8) ![]const u8 {
        return std.fmt.allocPrint(allocator, "{s}@{s}", .{ name, version });
    }

    /// Get cache file path for package
    fn getCachePath(self: *PackageCache, name: []const u8, version: []const u8) ![]const u8 {
        const pkg_hash = blk: {
            const key = try getCacheKey(self.allocator, name, version);
            defer self.allocator.free(key);
            break :blk string.md5Hash(key);
        };

        const hex = try string.hashToHex(pkg_hash, self.allocator);
        defer self.allocator.free(hex);

        return std.fmt.allocPrint(
            self.allocator,
            "{s}/packages/{s}",
            .{ self.cache_dir, hex },
        );
    }

    /// Check if package is cached
    pub fn has(self: *PackageCache, name: []const u8, version: []const u8) !bool {
        const key = try getCacheKey(self.allocator, name, version);
        defer self.allocator.free(key);

        self.lock.lockShared();
        defer self.lock.unlockShared();

        if (self.metadata.get(key)) |meta| {
            // Verify file exists
            std.fs.cwd().access(meta.cache_path, .{}) catch {
                return false;
            };
            return true;
        }

        return false;
    }

    /// Get cached package metadata
    pub fn get(self: *PackageCache, name: []const u8, version: []const u8) !?PackageMetadata {
        const key = try getCacheKey(self.allocator, name, version);
        defer self.allocator.free(key);

        self.lock.lockShared();
        defer self.lock.unlockShared();

        if (self.metadata.get(key)) |meta| {
            // Verify file exists
            std.fs.cwd().access(meta.cache_path, .{}) catch {
                return null;
            };
            return meta;
        }

        return null;
    }

    /// Store package in cache
    pub fn put(
        self: *PackageCache,
        name: []const u8,
        version: []const u8,
        url: []const u8,
        checksum: [32]u8,
        data: []const u8,
    ) !void {
        const cache_path = try self.getCachePath(name, version);
        errdefer self.allocator.free(cache_path);

        // Ensure packages subdirectory exists
        const packages_dir = try std.fmt.allocPrint(
            self.allocator,
            "{s}/packages",
            .{self.cache_dir},
        );
        defer self.allocator.free(packages_dir);
        try std.fs.cwd().makePath(packages_dir);

        // Write package data to cache
        const file = try std.fs.cwd().createFile(cache_path, .{});
        defer file.close();
        try file.writeAll(data);

        // Create metadata
        const key = try getCacheKey(self.allocator, name, version);
        errdefer self.allocator.free(key);

        const metadata = PackageMetadata{
            .name = try self.allocator.dupe(u8, name),
            .version = try self.allocator.dupe(u8, version),
            .url = try self.allocator.dupe(u8, url),
            .checksum = checksum,
            .downloaded_at = std.time.timestamp(),
            .size = data.len,
            .cache_path = cache_path,
        };

        self.lock.lock();
        defer self.lock.unlock();

        // Remove old entry if exists
        if (self.metadata.fetchRemove(key)) |old_kv| {
            self.allocator.free(old_kv.key);
            var old_meta = old_kv.value;
            old_meta.deinit(self.allocator);
        }

        try self.metadata.put(key, metadata);
    }

    /// Remove package from cache
    pub fn remove(self: *PackageCache, name: []const u8, version: []const u8) !void {
        const key = try getCacheKey(self.allocator, name, version);
        defer self.allocator.free(key);

        self.lock.lock();
        defer self.lock.unlock();

        if (self.metadata.fetchRemove(key)) |kv| {
            // Delete cached file
            std.fs.cwd().deleteFile(kv.value.cache_path) catch {};

            self.allocator.free(kv.key);
            var meta = kv.value;
            meta.deinit(self.allocator);
        }
    }

    /// Clear all cached packages
    pub fn clear(self: *PackageCache) !void {
        self.lock.lock();
        defer self.lock.unlock();

        var it = self.metadata.iterator();
        while (it.next()) |entry| {
            // Delete cached file
            std.fs.cwd().deleteFile(entry.value_ptr.cache_path) catch {};

            self.allocator.free(entry.key_ptr.*);
            var meta = entry.value_ptr;
            meta.deinit(self.allocator);
        }

        self.metadata.clearRetainingCapacity();
    }

    /// Get cache statistics
    pub fn stats(self: *PackageCache) CacheStats {
        self.lock.lockShared();
        defer self.lock.unlockShared();

        var total_size: usize = 0;
        var it = self.metadata.valueIterator();
        while (it.next()) |meta| {
            total_size += meta.size;
        }

        return .{
            .total_packages = self.metadata.count(),
            .total_size = total_size,
        };
    }
};

pub const CacheStats = struct {
    total_packages: usize,
    total_size: usize,
};

test "PackageCache basic operations" {
    const allocator = std.testing.allocator;
    var cache = try PackageCache.init(allocator);
    defer cache.deinit();

    const name = "node";
    const version = "20.0.0";
    const url = "https://example.com/node-20.0.0.tar.gz";
    const checksum = [_]u8{0} ** 32;
    const data = "test package data";

    // Put package
    try cache.put(name, version, url, checksum, data);

    // Check if cached
    try std.testing.expect(try cache.has(name, version));

    // Get metadata
    const meta = try cache.get(name, version);
    try std.testing.expect(meta != null);
    try std.testing.expectEqualStrings(name, meta.?.name);
    try std.testing.expectEqualStrings(version, meta.?.version);

    // Stats
    const cache_stats = cache.stats();
    try std.testing.expect(cache_stats.total_packages == 1);
    try std.testing.expect(cache_stats.total_size == data.len);

    // Remove
    try cache.remove(name, version);
    try std.testing.expect(!try cache.has(name, version));
}

test "PackageCache clear" {
    const allocator = std.testing.allocator;
    var cache = try PackageCache.init(allocator);
    defer cache.deinit();

    // Add multiple packages
    var i: usize = 0;
    while (i < 5) : (i += 1) {
        var buf: [64]u8 = undefined;
        const name = try std.fmt.bufPrint(&buf, "pkg_{d}", .{i});
        const checksum = [_]u8{0} ** 32;
        try cache.put(name, "1.0.0", "http://test", checksum, "data");
    }

    const stats_before = cache.stats();
    try std.testing.expect(stats_before.total_packages == 5);

    // Clear cache
    try cache.clear();

    const stats_after = cache.stats();
    try std.testing.expect(stats_after.total_packages == 0);
    try std.testing.expect(stats_after.total_size == 0);
}
