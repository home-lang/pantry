const std = @import("std");
const core = @import("../core/platform.zig");
const package_cache = @import("package_cache.zig");
const io_helper = @import("../io_helper.zig");

const Paths = core.Paths;
const PackageCache = package_cache.PackageCache;
const PackageMetadata = package_cache.PackageMetadata;

/// Cache compression format
pub const CompressionFormat = enum {
    none,
    gzip,
    zstd,

    pub fn extension(self: CompressionFormat) []const u8 {
        return switch (self) {
            .none => "",
            .gzip => ".gz",
            .zstd => ".zst",
        };
    }
};

/// Cache configuration
pub const CacheConfig = struct {
    /// Maximum cache size in bytes (0 = unlimited)
    max_size_bytes: usize = 5 * 1024 * 1024 * 1024, // 5GB
    /// Enable compression
    compression: CompressionFormat = .none,
    /// Shared cache directory (null = user cache)
    shared_cache_dir: ?[]const u8 = null,
    /// Cache invalidation strategy
    invalidation_strategy: InvalidationStrategy = .lru,
    /// Maximum age in seconds (0 = no expiry)
    max_age_seconds: i64 = 0,
    /// Enable cache statistics
    collect_stats: bool = true,
};

/// Cache invalidation strategy
pub const InvalidationStrategy = enum {
    /// Least Recently Used
    lru,
    /// Least Frequently Used
    lfu,
    /// First In First Out
    fifo,
    /// Time-based expiration
    ttl,
};

/// Extended cache statistics
pub const CacheStatistics = struct {
    /// Total number of packages
    total_packages: usize,
    /// Total size in bytes (compressed if applicable)
    total_size: usize,
    /// Total size uncompressed
    uncompressed_size: usize,
    /// Number of cache hits
    hits: usize,
    /// Number of cache misses
    misses: usize,
    /// Hit rate (0.0 to 1.0)
    hit_rate: f64,
    /// Average package size
    avg_package_size: usize,
    /// Number of evictions
    evictions: usize,
    /// Cache directory path
    cache_dir: []const u8,
    /// Oldest package timestamp
    oldest_package: i64,
    /// Newest package timestamp
    newest_package: i64,
    /// Compression ratio (if enabled)
    compression_ratio: ?f64,

    pub fn format(
        self: CacheStatistics,
        comptime _: []const u8,
        _: std.fmt.FormatOptions,
        writer: anytype,
    ) !void {
        try writer.print(
            \\Cache Statistics:
            \\  Packages: {}
            \\  Total Size: {} bytes ({s})
            \\  Hits: {} | Misses: {} | Hit Rate: {d:.2}%
            \\  Average Package Size: {} bytes
            \\  Evictions: {}
            \\  Cache Directory: {s}
            \\
        , .{
            self.total_packages,
            self.total_size,
            formatBytes(self.total_size),
            self.hits,
            self.misses,
            self.hit_rate * 100,
            self.avg_package_size,
            self.evictions,
            self.cache_dir,
        });

        if (self.compression_ratio) |ratio| {
            try writer.print("  Compression Ratio: {d:.2}x\n", .{ratio});
        }
    }

    fn formatBytes(bytes: usize) []const u8 {
        if (bytes >= 1024 * 1024 * 1024) {
            return "GB";
        } else if (bytes >= 1024 * 1024) {
            return "MB";
        } else if (bytes >= 1024) {
            return "KB";
        } else {
            return "bytes";
        }
    }
};

/// Optimized package cache with compression and advanced features
pub const OptimizedCache = struct {
    /// Base package cache
    base: PackageCache,
    /// Configuration
    config: CacheConfig,
    /// Statistics
    stats: struct {
        hits: std.atomic.Value(usize),
        misses: std.atomic.Value(usize),
        evictions: std.atomic.Value(usize),
    },
    /// Allocator
    allocator: std.mem.Allocator,

    pub fn init(allocator: std.mem.Allocator, config: CacheConfig) !OptimizedCache {
        const base = if (config.shared_cache_dir) |_|
            try PackageCache.initWithMaxSize(allocator, config.max_size_bytes)
        else
            try PackageCache.initWithMaxSize(allocator, config.max_size_bytes);

        return .{
            .base = base,
            .config = config,
            .stats = .{
                .hits = std.atomic.Value(usize).init(0),
                .misses = std.atomic.Value(usize).init(0),
                .evictions = std.atomic.Value(usize).init(0),
            },
            .allocator = allocator,
        };
    }

    pub fn deinit(self: *OptimizedCache) void {
        self.base.deinit();
    }

    /// Check if package is cached
    pub fn has(self: *OptimizedCache, name: []const u8, version: []const u8) !bool {
        const result = try self.base.has(name, version);

        if (self.config.collect_stats) {
            if (result) {
                _ = self.stats.hits.fetchAdd(1, .monotonic);
            } else {
                _ = self.stats.misses.fetchAdd(1, .monotonic);
            }
        }

        return result;
    }

    /// Get cached package metadata
    pub fn get(self: *OptimizedCache, name: []const u8, version: []const u8) !?PackageMetadata {
        const result = try self.base.get(name, version);

        if (self.config.collect_stats) {
            if (result != null) {
                _ = self.stats.hits.fetchAdd(1, .monotonic);
            } else {
                _ = self.stats.misses.fetchAdd(1, .monotonic);
            }
        }

        // Check TTL expiration
        if (result) |meta| {
            if (self.config.max_age_seconds > 0) {
                const now = @as(i64, @intCast((std.posix.clock_gettime(.REALTIME) catch std.posix.timespec{ .sec = 0, .nsec = 0 }).sec));
                const age = now - meta.downloaded_at;
                if (age > self.config.max_age_seconds) {
                    // Expired, remove from cache
                    try self.base.remove(name, version);
                    return null;
                }
            }
        }

        return result;
    }

    /// Store package in cache with optional compression
    pub fn put(
        self: *OptimizedCache,
        name: []const u8,
        version: []const u8,
        url: []const u8,
        checksum: [32]u8,
        data: []const u8,
    ) !void {
        // Compress data if enabled
        const final_data = switch (self.config.compression) {
            .none => data,
            .gzip => blk: {
                var compressed = std.ArrayList(u8).init(self.allocator);
                defer compressed.deinit();

                var compressor = try std.compress.gzip.compressor(
                    compressed.writer(),
                    .{ .level = .default },
                );
                try compressor.write(data);
                try compressor.finish();

                break :blk try compressed.toOwnedSlice();
            },
            .zstd => blk: {
                var compressed = std.ArrayList(u8).init(self.allocator);
                defer compressed.deinit();

                var compressor = try std.compress.zstd.compressor(
                    compressed.writer(),
                    .{},
                );
                try compressor.write(data);
                try compressor.finish();

                break :blk try compressed.toOwnedSlice();
            },
        };
        defer {
            if (self.config.compression != .none) {
                self.allocator.free(final_data);
            }
        }

        // Store in base cache
        try self.base.put(name, version, url, checksum, final_data);

        // Run eviction if needed
        if (self.config.max_size_bytes > 0) {
            try self.evict();
        }
    }

    /// Read cached package data (with decompression)
    pub fn read(
        self: *OptimizedCache,
        name: []const u8,
        version: []const u8,
    ) !?[]const u8 {
        const meta = try self.get(name, version) orelse return null;

        // Read file
        const file = try std.Io.Dir.cwd().openFile(io_helper.io, meta.cache_path, .{});
        defer file.close();

        const data = try file.readToEndAlloc(self.allocator, 100 * 1024 * 1024);
        errdefer self.allocator.free(data);

        // Decompress if needed
        return switch (self.config.compression) {
            .none => data,
            .gzip => blk: {
                var decompressed = std.ArrayList(u8).init(self.allocator);
                defer decompressed.deinit();

                var stream = std.io.fixedBufferStream(data);
                var decompressor = try std.compress.gzip.decompressor(stream.reader());

                var buffer: [4096]u8 = undefined;
                while (true) {
                    const bytes_read = try decompressor.read(&buffer);
                    if (bytes_read == 0) break;
                    try decompressed.appendSlice(buffer[0..bytes_read]);
                }

                self.allocator.free(data);
                break :blk try decompressed.toOwnedSlice();
            },
            .zstd => blk: {
                var decompressed = std.ArrayList(u8).init(self.allocator);
                defer decompressed.deinit();

                var stream = std.io.fixedBufferStream(data);
                var decompressor = try std.compress.zstd.decompressor(stream.reader());

                var buffer: [4096]u8 = undefined;
                while (true) {
                    const bytes_read = try decompressor.read(&buffer);
                    if (bytes_read == 0) break;
                    try decompressed.appendSlice(buffer[0..bytes_read]);
                }

                self.allocator.free(data);
                break :blk try decompressed.toOwnedSlice();
            },
        };
    }

    /// Evict packages based on configured strategy
    fn evict(self: *OptimizedCache) !void {
        switch (self.config.invalidation_strategy) {
            .lru => try self.base.evictLRU(),
            .lfu => try self.evictLFU(),
            .fifo => try self.evictFIFO(),
            .ttl => try self.evictExpired(),
        }
    }

    /// Evict least frequently used packages
    fn evictLFU(self: *OptimizedCache) !void {
        // LFU requires tracking access frequency
        // For now, fallback to LRU
        try self.base.evictLRU();
    }

    /// Evict oldest packages
    fn evictFIFO(self: *OptimizedCache) !void {
        if (self.config.max_size_bytes == 0) return;

        self.base.lock.lock();
        defer self.base.lock.unlock();

        var current_size: usize = 0;
        var it = self.base.metadata.valueIterator();
        while (it.next()) |meta| {
            current_size += meta.size;
        }

        if (current_size <= self.config.max_size_bytes) {
            return;
        }

        // Build list sorted by downloaded_at (oldest first)
        var packages = try std.ArrayList(struct {
            key: []const u8,
            downloaded_at: i64,
            size: usize,
        }).initCapacity(self.allocator, self.base.metadata.count());
        defer packages.deinit();

        var entry_it = self.base.metadata.iterator();
        while (entry_it.next()) |entry| {
            try packages.append(.{
                .key = entry.key_ptr.*,
                .downloaded_at = entry.value_ptr.downloaded_at,
                .size = entry.value_ptr.size,
            });
        }

        std.mem.sort(@TypeOf(packages.items[0]), packages.items, {}, struct {
            fn lessThan(_: void, a: @TypeOf(packages.items[0]), b: @TypeOf(packages.items[0])) bool {
                return a.downloaded_at < b.downloaded_at;
            }
        }.lessThan);

        // Evict oldest
        for (packages.items) |pkg| {
            if (current_size <= self.config.max_size_bytes) break;

            if (self.base.metadata.fetchRemove(pkg.key)) |kv| {
                io_helper.deleteFile(kv.value.cache_path) catch {};
                current_size -= pkg.size;

                self.allocator.free(kv.key);
                var meta = kv.value;
                meta.deinit(self.allocator);

                if (self.config.collect_stats) {
                    _ = self.stats.evictions.fetchAdd(1, .monotonic);
                }
            }
        }
    }

    /// Evict expired packages
    fn evictExpired(self: *OptimizedCache) !void {
        if (self.config.max_age_seconds == 0) return;

        self.base.lock.lock();
        defer self.base.lock.unlock();

        const now = @as(i64, @intCast((std.posix.clock_gettime(.REALTIME) catch std.posix.timespec{ .sec = 0, .nsec = 0 }).sec));
        var to_remove = std.ArrayList([]const u8).init(self.allocator);
        defer to_remove.deinit();

        var it = self.base.metadata.iterator();
        while (it.next()) |entry| {
            const age = now - entry.value_ptr.downloaded_at;
            if (age > self.config.max_age_seconds) {
                try to_remove.append(entry.key_ptr.*);
            }
        }

        for (to_remove.items) |key| {
            if (self.base.metadata.fetchRemove(key)) |kv| {
                io_helper.deleteFile(kv.value.cache_path) catch {};

                self.allocator.free(kv.key);
                var meta = kv.value;
                meta.deinit(self.allocator);

                if (self.config.collect_stats) {
                    _ = self.stats.evictions.fetchAdd(1, .monotonic);
                }
            }
        }
    }

    /// Get detailed cache statistics
    pub fn getStatistics(self: *OptimizedCache) !CacheStatistics {
        self.base.lock.lockShared();
        defer self.base.lock.unlockShared();

        var total_size: usize = 0;
        var uncompressed_size: usize = 0;
        var oldest: i64 = std.math.maxInt(i64);
        var newest: i64 = 0;

        var it = self.base.metadata.valueIterator();
        while (it.next()) |meta| {
            total_size += meta.size;
            uncompressed_size += meta.uncompressed_size;

            if (meta.downloaded_at < oldest) oldest = meta.downloaded_at;
            if (meta.downloaded_at > newest) newest = meta.downloaded_at;
        }

        const total_packages = self.base.metadata.count();
        const hits = self.stats.hits.load(.monotonic);
        const misses = self.stats.misses.load(.monotonic);
        const total_requests = hits + misses;
        const hit_rate = if (total_requests > 0)
            @as(f64, @floatFromInt(hits)) / @as(f64, @floatFromInt(total_requests))
        else
            0.0;

        const avg_package_size = if (total_packages > 0)
            total_size / total_packages
        else
            0;

        const compression_ratio = if (self.config.compression != .none and uncompressed_size > 0)
            @as(f64, @floatFromInt(uncompressed_size)) / @as(f64, @floatFromInt(total_size))
        else
            null;

        return .{
            .total_packages = total_packages,
            .total_size = total_size,
            .uncompressed_size = uncompressed_size,
            .hits = hits,
            .misses = misses,
            .hit_rate = hit_rate,
            .avg_package_size = avg_package_size,
            .evictions = self.stats.evictions.load(.monotonic),
            .cache_dir = self.base.cache_dir,
            .oldest_package = if (total_packages > 0) oldest else 0,
            .newest_package = if (total_packages > 0) newest else 0,
            .compression_ratio = compression_ratio,
        };
    }

    /// Clean cache (remove all packages)
    pub fn clean(self: *OptimizedCache) !void {
        try self.base.clear();
    }

    /// Prune cache (remove only expired/invalid packages)
    pub fn prune(self: *OptimizedCache) !void {
        try self.evictExpired();
    }
};
