const std = @import("std");
const core = @import("../core/platform.zig");
const optimized = @import("optimized.zig");

const Platform = core.Platform;
const OptimizedCache = optimized.OptimizedCache;
const CacheConfig = optimized.CacheConfig;

/// Shared cache location type
pub const SharedCacheLocation = enum {
    /// System-wide cache (/var/cache/pantry or C:\ProgramData\pantry)
    system,
    /// User-wide cache (default ~/.cache/pantry)
    user,
    /// Custom location
    custom,
};

/// Shared cache configuration
pub const SharedCacheConfig = struct {
    /// Cache location type
    location: SharedCacheLocation = .user,
    /// Custom path (for .custom location)
    custom_path: ?[]const u8 = null,
    /// Enable locking for multi-process access
    enable_locking: bool = true,
    /// Lock timeout in milliseconds
    lock_timeout_ms: u64 = 5000,
    /// Base cache config
    base_config: CacheConfig = .{},
};

/// Shared cache with cross-project support
pub const SharedCache = struct {
    /// Optimized cache instance
    cache: OptimizedCache,
    /// Lock file for inter-process synchronization
    lock_file: ?std.fs.File = null,
    /// Config
    config: SharedCacheConfig,
    /// Allocator
    allocator: std.mem.Allocator,

    pub fn init(allocator: std.mem.Allocator, config: SharedCacheConfig) !SharedCache {
        // Determine cache directory
        const cache_dir = try getCacheDirectory(allocator, config);
        errdefer allocator.free(cache_dir);

        // Ensure directory exists with appropriate permissions
        try std.Io.Dir.cwd().makePath(cache_dir);

        // Update base config with shared directory
        var base_config = config.base_config;
        base_config.shared_cache_dir = cache_dir;

        // Initialize optimized cache
        var opt_cache = try OptimizedCache.init(allocator, base_config);
        errdefer opt_cache.deinit();

        // Create/open lock file if locking enabled
        var lock_file: ?std.fs.File = null;
        if (config.enable_locking) {
            const lock_path = try std.fmt.allocPrint(
                allocator,
                "{s}/.lock",
                .{cache_dir},
            );
            defer allocator.free(lock_path);

            lock_file = try std.Io.Dir.cwd().createFile(lock_path, .{
                .read = true,
                .truncate = false,
            });
        }

        return .{
            .cache = opt_cache,
            .lock_file = lock_file,
            .config = config,
            .allocator = allocator,
        };
    }

    pub fn deinit(self: *SharedCache) void {
        if (self.lock_file) |file| {
            file.close();
        }
        self.cache.deinit();
        if (self.config.base_config.shared_cache_dir) |dir| {
            self.allocator.free(dir);
        }
    }

    /// Acquire exclusive lock (for writing)
    pub fn lock(self: *SharedCache) !void {
        if (self.lock_file) |file| {
            try file.lock(.exclusive);
        }
    }

    /// Acquire shared lock (for reading)
    pub fn lockShared(self: *SharedCache) !void {
        if (self.lock_file) |file| {
            try file.lock(.shared);
        }
    }

    /// Release lock
    pub fn unlock(self: *SharedCache) void {
        if (self.lock_file) |file| {
            file.unlock();
        }
    }

    /// Check if package is cached (thread-safe)
    pub fn has(self: *SharedCache, name: []const u8, version: []const u8) !bool {
        try self.lockShared();
        defer self.unlock();
        return try self.cache.has(name, version);
    }

    /// Get cached package (thread-safe)
    pub fn get(self: *SharedCache, name: []const u8, version: []const u8) !?optimized.PackageMetadata {
        try self.lockShared();
        defer self.unlock();
        return try self.cache.get(name, version);
    }

    /// Store package (thread-safe)
    pub fn put(
        self: *SharedCache,
        name: []const u8,
        version: []const u8,
        url: []const u8,
        checksum: [32]u8,
        data: []const u8,
    ) !void {
        try self.lock();
        defer self.unlock();
        return try self.cache.put(name, version, url, checksum, data);
    }

    /// Read package data (thread-safe)
    pub fn read(
        self: *SharedCache,
        name: []const u8,
        version: []const u8,
    ) !?[]const u8 {
        try self.lockShared();
        defer self.unlock();
        return try self.cache.read(name, version);
    }

    /// Get statistics (thread-safe)
    pub fn getStatistics(self: *SharedCache) !optimized.CacheStatistics {
        try self.lockShared();
        defer self.unlock();
        return try self.cache.getStatistics();
    }

    /// Clean cache (thread-safe)
    pub fn clean(self: *SharedCache) !void {
        try self.lock();
        defer self.unlock();
        return try self.cache.clean();
    }

    /// Prune expired packages (thread-safe)
    pub fn prune(self: *SharedCache) !void {
        try self.lock();
        defer self.unlock();
        return try self.cache.prune();
    }

    /// Get cache directory path
    fn getCacheDirectory(allocator: std.mem.Allocator, config: SharedCacheConfig) ![]const u8 {
        return switch (config.location) {
            .user => blk: {
                const home = try std.process.getEnvVarOwned(allocator, "HOME");
                defer allocator.free(home);

                const platform = Platform.current();
                const cache_subdir = switch (platform.os) {
                    .macos => "Library/Caches/pantry",
                    .linux, .freebsd => ".cache/pantry",
                    .windows => "AppData/Local/pantry/cache",
                    else => ".cache/pantry",
                };

                break :blk try std.fmt.allocPrint(
                    allocator,
                    "{s}/{s}",
                    .{ home, cache_subdir },
                );
            },
            .system => blk: {
                const platform = Platform.current();
                const cache_dir = switch (platform.os) {
                    .macos => "/var/cache/pantry",
                    .linux, .freebsd => "/var/cache/pantry",
                    .windows => "C:\\ProgramData\\pantry\\cache",
                    else => "/var/cache/pantry",
                };

                break :blk try allocator.dupe(u8, cache_dir);
            },
            .custom => blk: {
                if (config.custom_path) |path| {
                    break :blk try allocator.dupe(u8, path);
                }
                return error.CustomPathRequired;
            },
        };
    }
};

/// Global shared cache instance
pub const GlobalCache = struct {
    var instance: ?SharedCache = null;
    var mutex: std.Thread.Mutex = .{};

    /// Get or initialize global cache
    pub fn get(allocator: std.mem.Allocator) !*SharedCache {
        mutex.lock();
        defer mutex.unlock();

        if (instance == null) {
            instance = try SharedCache.init(allocator, .{});
        }

        return &instance.?;
    }

    /// Deinitialize global cache
    pub fn deinit() void {
        mutex.lock();
        defer mutex.unlock();

        if (instance) |*cache| {
            cache.deinit();
            instance = null;
        }
    }
};
