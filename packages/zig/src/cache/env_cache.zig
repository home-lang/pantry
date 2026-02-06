const std = @import("std");
const builtin = @import("builtin");
const core = @import("../core/platform.zig");
const string = @import("../core/string.zig");
const errors = @import("../core/error.zig");
const io_helper = @import("../io_helper.zig");

const pantryError = errors.pantryError;

/// Cache entry for environment
pub const Entry = struct {
    /// Environment hash
    hash: [16]u8,
    /// Dependency file path
    dep_file: []const u8,
    /// Dependency file modification time
    dep_mtime: i128,
    /// Cached PATH value
    path: []const u8,
    /// Environment variables
    env_vars: std.StringHashMap([]const u8),
    /// Timestamp when entry was created
    created_at: i64,
    /// Timestamp when entry was cached (might differ from created_at after updates)
    cached_at: i64,
    /// Timestamp when entry was last validated
    last_validated: i64,
    /// TTL in seconds (default 2 hours)
    ttl: i64 = 7200,

    /// Check if cache entry is still valid
    pub fn isValid(self: *Entry, _: std.mem.Allocator) !bool {
        const now = @as(i64, @intCast((std.posix.clock_gettime(.REALTIME) catch std.posix.timespec{ .sec = 0, .nsec = 0 }).sec));

        // Check TTL expiration
        if (now - self.created_at > self.ttl) {
            return false;
        }

        // Check if dependency file has been modified
        if (self.dep_file.len > 0) {
            const stat = io_helper.statFile(self.dep_file) catch {
                return false; // File no longer exists
            };

            // Compare in seconds (dep_mtime is stored in seconds)
            const current_mtime = @divFloor(stat.mtime, std.time.ns_per_s);
            if (current_mtime != self.dep_mtime) {
                return false; // File has been modified
            }
        }

        // Update last_validated timestamp
        self.last_validated = now;

        return true;
    }

    pub fn deinit(self: *Entry, allocator: std.mem.Allocator) void {
        allocator.free(self.dep_file);
        allocator.free(self.path);

        var it = self.env_vars.iterator();
        while (it.next()) |entry| {
            allocator.free(entry.key_ptr.*);
            allocator.free(entry.value_ptr.*);
        }
        self.env_vars.deinit();
    }
};

/// Environment cache with TTL and ring buffer fast cache
pub const EnvCache = struct {
    /// Main cache storage (hash -> entry)
    cache: std.AutoHashMap([16]u8, *Entry),
    /// Ring buffer for L1 cache optimization (8 entries)
    fast_cache: [8]?*Entry align(64) = [_]?*Entry{null} ** 8,
    fast_cache_idx: std.atomic.Value(u8),
    /// Allocator
    allocator: std.mem.Allocator,
    /// RWLock for thread-safe access
    lock: std.Thread.RwLock,
    /// Cache file path
    cache_file_path: ?[]const u8 = null,

    pub fn init(allocator: std.mem.Allocator) EnvCache {
        return .{
            .cache = std.AutoHashMap([16]u8, *Entry).init(allocator),
            .fast_cache_idx = std.atomic.Value(u8).init(0),
            .allocator = allocator,
            .lock = .{},
        };
    }

    /// Initialize and load from disk
    pub fn initWithPersistence(allocator: std.mem.Allocator) !EnvCache {
        var env_cache = EnvCache.init(allocator);

        // Get cache file path
        const home = core.Paths.home(allocator) catch return env_cache;
        defer allocator.free(home);

        const cache_dir = try std.fmt.allocPrint(allocator, "{s}/.pantry/cache", .{home});
        defer allocator.free(cache_dir);

        // Ensure cache directory exists
        io_helper.makePath(cache_dir) catch {};

        const cache_file = try std.fmt.allocPrint(allocator, "{s}/envs.cache", .{cache_dir});
        env_cache.cache_file_path = cache_file;

        // Load from disk
        env_cache.load() catch {
            // Ignore load errors (file might not exist yet)
        };

        return env_cache;
    }

    pub fn deinit(self: *EnvCache) void {
        // Save to disk before deinit
        self.save() catch |err| {
            std.debug.print("Warning: Failed to persist environment cache: {}\n", .{err});
        };

        self.lock.lock();
        defer self.lock.unlock();

        var it = self.cache.valueIterator();
        while (it.next()) |entry_ptr| {
            entry_ptr.*.deinit(self.allocator);
            self.allocator.destroy(entry_ptr.*);
        }
        self.cache.deinit();

        if (self.cache_file_path) |path| {
            self.allocator.free(path);
        }
    }

    /// Fast lookup in ring buffer (lock-free read)
    fn fastLookup(self: *EnvCache, hash: [16]u8) ?*Entry {
        for (self.fast_cache) |maybe_entry| {
            if (maybe_entry) |entry| {
                if (std.mem.eql(u8, &entry.hash, &hash)) {
                    return entry;
                }
            }
        }
        return null;
    }

    /// Add entry to fast cache (ring buffer)
    fn addToFastCache(self: *EnvCache, entry: *Entry) void {
        const idx = self.fast_cache_idx.fetchAdd(1, .monotonic) % 8;
        self.fast_cache[idx] = entry;
    }

    /// Get cache entry by hash
    pub fn get(self: *EnvCache, hash: [16]u8) !?*Entry {
        // Try fast cache first (lock-free)
        if (self.fastLookup(hash)) |entry| {
            if (try entry.isValid(self.allocator)) {
                return entry;
            }
        }

        // Fall back to main cache
        self.lock.lockShared();
        defer self.lock.unlockShared();

        if (self.cache.get(hash)) |entry| {
            if (try entry.isValid(self.allocator)) {
                // Add to fast cache for next time
                self.addToFastCache(entry);
                return entry;
            } else {
                // Entry expired, will be cleaned up later
                return null;
            }
        }

        return null;
    }

    /// Put cache entry
    pub fn put(self: *EnvCache, entry: *Entry) !void {
        self.lock.lock();
        defer self.lock.unlock();

        // Remove old entry if exists
        if (self.cache.get(entry.hash)) |old_entry| {
            old_entry.deinit(self.allocator);
            self.allocator.destroy(old_entry);
        }

        try self.cache.put(entry.hash, entry);
        self.addToFastCache(entry);
    }

    /// Remove cache entry by hash
    pub fn remove(self: *EnvCache, hash: [16]u8) void {
        self.lock.lock();
        defer self.lock.unlock();

        if (self.cache.fetchRemove(hash)) |kv| {
            kv.value.deinit(self.allocator);
            self.allocator.destroy(kv.value);
        }

        // Clear from fast cache
        for (&self.fast_cache) |*maybe_entry| {
            if (maybe_entry.*) |entry| {
                if (std.mem.eql(u8, &entry.hash, &hash)) {
                    maybe_entry.* = null;
                }
            }
        }
    }

    /// Clean up expired entries
    pub fn cleanup(self: *EnvCache) !void {
        self.lock.lock();
        defer self.lock.unlock();

        var to_remove = std.ArrayList([16]u8).init(self.allocator);
        defer to_remove.deinit();

        var it = self.cache.iterator();
        while (it.next()) |kv| {
            if (!try kv.value_ptr.*.isValid(self.allocator)) {
                try to_remove.append(kv.key_ptr.*);
            }
        }

        for (to_remove.items) |hash| {
            if (self.cache.fetchRemove(hash)) |kv| {
                kv.value.deinit(self.allocator);
                self.allocator.destroy(kv.value);
            }
        }

        // Clear invalid entries from fast cache
        for (&self.fast_cache) |*maybe_entry| {
            if (maybe_entry.*) |entry| {
                if (!try entry.isValid(self.allocator)) {
                    maybe_entry.* = null;
                }
            }
        }
    }

    /// Save cache to disk
    pub fn save(self: *EnvCache) !void {
        const cache_file = self.cache_file_path orelse return;

        self.lock.lockShared();
        defer self.lock.unlockShared();

        // Create temp file for atomic write
        const temp_file = try std.fmt.allocPrint(self.allocator, "{s}.tmp", .{cache_file});
        defer self.allocator.free(temp_file);

        // Build content in memory first
        var content = std.ArrayList(u8){};
        defer content.deinit(self.allocator);

        // Write magic header and version
        try content.appendSlice(self.allocator, "PANTRY_ENV_CACHE_V1\n");

        // Write number of entries
        const count = self.cache.count();
        var count_buf: [32]u8 = undefined;
        const count_str = try std.fmt.bufPrint(&count_buf, "{d}\n", .{count});
        try content.appendSlice(self.allocator, count_str);

        // Write each entry
        var it = self.cache.iterator();
        while (it.next()) |kv| {
            const entry = kv.value_ptr.*;

            // Write hash (hex encoded)
            const hash_hex = try std.fmt.allocPrint(self.allocator, "{x}\n", .{entry.hash});
            defer self.allocator.free(hash_hex);
            try content.appendSlice(self.allocator, hash_hex);

            // Write dep_file
            try content.appendSlice(self.allocator, entry.dep_file);
            try content.appendSlice(self.allocator, "\n");

            // Write dep_mtime
            var mtime_buf: [32]u8 = undefined;
            const mtime_str = try std.fmt.bufPrint(&mtime_buf, "{d}\n", .{entry.dep_mtime});
            try content.appendSlice(self.allocator, mtime_str);

            // Write path
            try content.appendSlice(self.allocator, entry.path);
            try content.appendSlice(self.allocator, "\n");

            // Write timestamps
            var ts_buf: [128]u8 = undefined;
            const ts_str = try std.fmt.bufPrint(&ts_buf, "{d} {d} {d} {d}\n", .{ entry.created_at, entry.cached_at, entry.last_validated, entry.ttl });
            try content.appendSlice(self.allocator, ts_str);

            // Write env var count
            var env_count_buf: [32]u8 = undefined;
            const env_count_str = try std.fmt.bufPrint(&env_count_buf, "{d}\n", .{entry.env_vars.count()});
            try content.appendSlice(self.allocator, env_count_str);

            // Write env vars
            var env_it = entry.env_vars.iterator();
            while (env_it.next()) |env_kv| {
                try content.appendSlice(self.allocator, env_kv.key_ptr.*);
                try content.appendSlice(self.allocator, "=");
                try content.appendSlice(self.allocator, env_kv.value_ptr.*);
                try content.appendSlice(self.allocator, "\n");
            }
        }

        // Write to temp file
        const file = try io_helper.cwd().createFile(io_helper.io, temp_file, .{});
        defer file.close(io_helper.io);
        try io_helper.writeAllToFile(file, content.items);

        // Atomic rename using io_helper
        try io_helper.rename(temp_file, cache_file);
    }

    /// Load cache from disk
    pub fn load(self: *EnvCache) !void {
        const cache_file = self.cache_file_path orelse return error.NoCacheFile;

        const content = try io_helper.readFileAlloc(self.allocator, cache_file, 10 * 1024 * 1024); // 10MB max
        defer self.allocator.free(content);

        var lines = std.mem.splitScalar(u8, content, '\n');

        // Read header
        const header = lines.next() orelse return error.InvalidCache;
        if (!std.mem.eql(u8, header, "PANTRY_ENV_CACHE_V1")) {
            return error.InvalidCacheVersion;
        }

        // Read count
        const count_str = lines.next() orelse return error.InvalidCache;
        const count = try std.fmt.parseInt(usize, count_str, 10);

        // Read each entry
        var i: usize = 0;
        while (i < count) : (i += 1) {
            const hash_str = lines.next() orelse return error.InvalidCache;
            var hash: [16]u8 = undefined;
            _ = try std.fmt.hexToBytes(&hash, hash_str);

            const dep_file = lines.next() orelse return error.InvalidCache;
            const mtime_str = lines.next() orelse return error.InvalidCache;
            const dep_mtime = try std.fmt.parseInt(i128, mtime_str, 10);
            const path = lines.next() orelse return error.InvalidCache;

            const ts_str = lines.next() orelse return error.InvalidCache;
            var ts_parts = std.mem.splitScalar(u8, ts_str, ' ');
            const created_at = try std.fmt.parseInt(i64, ts_parts.next() orelse return error.InvalidCache, 10);
            const cached_at = try std.fmt.parseInt(i64, ts_parts.next() orelse return error.InvalidCache, 10);
            const last_validated = try std.fmt.parseInt(i64, ts_parts.next() orelse return error.InvalidCache, 10);
            const ttl = try std.fmt.parseInt(i64, ts_parts.next() orelse return error.InvalidCache, 10);

            const env_count_str = lines.next() orelse return error.InvalidCache;
            const env_count = try std.fmt.parseInt(usize, env_count_str, 10);

            var env_vars = std.StringHashMap([]const u8).init(self.allocator);
            var j: usize = 0;
            while (j < env_count) : (j += 1) {
                const env_line = lines.next() orelse return error.InvalidCache;
                const eq_pos = std.mem.indexOf(u8, env_line, "=") orelse return error.InvalidCache;
                const key = try self.allocator.dupe(u8, env_line[0..eq_pos]);
                const value = try self.allocator.dupe(u8, env_line[eq_pos + 1 ..]);
                try env_vars.put(key, value);
            }

            const entry = try self.allocator.create(Entry);
            entry.* = .{
                .hash = hash,
                .dep_file = try self.allocator.dupe(u8, dep_file),
                .dep_mtime = dep_mtime,
                .path = try self.allocator.dupe(u8, path),
                .env_vars = env_vars,
                .created_at = created_at,
                .cached_at = cached_at,
                .last_validated = last_validated,
                .ttl = ttl,
            };

            // Validate entry before adding to cache
            if (try entry.isValid(self.allocator)) {
                try self.put(entry);
            } else {
                // Entry expired, clean it up
                entry.deinit(self.allocator);
                self.allocator.destroy(entry);
            }
        }
    }

    /// Get cache statistics
    pub fn stats(self: *EnvCache) CacheStats {
        self.lock.lockShared();
        defer self.lock.unlockShared();

        var fast_count: usize = 0;
        for (self.fast_cache) |maybe_entry| {
            if (maybe_entry != null) fast_count += 1;
        }

        return .{
            .total_entries = self.cache.count(),
            .fast_cache_entries = fast_count,
        };
    }
};

pub const CacheStats = struct {
    total_entries: usize,
    fast_cache_entries: usize,
};

/// Create environment cache entry
pub fn createEntry(
    allocator: std.mem.Allocator,
    dep_file: []const u8,
    path: []const u8,
    env_vars: std.StringHashMap([]const u8),
) !*Entry {
    const entry = try allocator.create(Entry);
    errdefer allocator.destroy(entry);

    // Get dependency file mtime
    const stat = try io_helper.statFile(dep_file);

    // Compute hash
    const hash = string.hashDependencyFile(dep_file);

    entry.* = .{
        .hash = hash,
        .dep_file = try allocator.dupe(u8, dep_file),
        .dep_mtime = @divFloor(stat.mtime, std.time.ns_per_s), // Store in seconds to match isValid comparison
        .path = try allocator.dupe(u8, path),
        .env_vars = env_vars,
        .created_at = @as(i64, @intCast((std.posix.clock_gettime(.REALTIME) catch std.posix.timespec{ .sec = 0, .nsec = 0 }).sec)),
    };

    return entry;
}

test "EnvCache basic operations" {
    const allocator = std.testing.allocator;
    var cache = EnvCache.init(allocator);
    defer cache.deinit();

    // Create a temporary test file
    const tmp_file = "/tmp/pantry_test_deps.yaml";
    {
        const file = try io_helper.createFile(tmp_file, .{});
        defer io_helper.closeFile(file);
        try io_helper.writeAllToFile(file, "test: content");
    }
    defer io_helper.deleteFile(tmp_file) catch {};

    // Get file stat
    const stat = try io_helper.statFile(tmp_file);

    // Create a test entry
    var env_vars = std.StringHashMap([]const u8).init(allocator);
    try env_vars.put(try allocator.dupe(u8, "NODE_VERSION"), try allocator.dupe(u8, "20.0.0"));

    const hash = string.md5Hash("test");
    const entry = try allocator.create(Entry);
    const now = @as(i64, @intCast((std.posix.clock_gettime(.REALTIME) catch std.posix.timespec{ .sec = 0, .nsec = 0 }).sec));
    entry.* = .{
        .hash = hash,
        .dep_file = try allocator.dupe(u8, tmp_file),
        .dep_mtime = @divFloor(stat.mtime, std.time.ns_per_s), // Store in seconds to match isValid comparison
        .path = try allocator.dupe(u8, "/usr/bin"),
        .env_vars = env_vars,
        .created_at = now,
        .cached_at = now,
        .last_validated = now,
    };

    // Put entry
    try cache.put(entry);

    // Get entry
    const retrieved = try cache.get(hash);
    try std.testing.expect(retrieved != null);
    try std.testing.expectEqualStrings("/usr/bin", retrieved.?.path);

    // Stats
    const cache_stats = cache.stats();
    try std.testing.expect(cache_stats.total_entries == 1);
}

test "EnvCache fast cache" {
    const allocator = std.testing.allocator;
    var cache = EnvCache.init(allocator);
    defer cache.deinit();

    // Create a temporary test file
    const tmp_file = "/tmp/pantry_test_deps2.yaml";
    {
        const file = try io_helper.createFile(tmp_file, .{});
        defer io_helper.closeFile(file);
        try io_helper.writeAllToFile(file, "test: content");
    }
    defer io_helper.deleteFile(tmp_file) catch {};

    const stat = try io_helper.statFile(tmp_file);

    // Create multiple entries
    var i: usize = 0;
    while (i < 10) : (i += 1) {
        var env_vars = std.StringHashMap([]const u8).init(allocator);
        try env_vars.put(try allocator.dupe(u8, "TEST"), try allocator.dupe(u8, "value"));

        var buf: [64]u8 = undefined;
        const key = try std.fmt.bufPrint(&buf, "test_{d}", .{i});
        const hash = string.md5Hash(key);

        const entry = try allocator.create(Entry);
        const now = @as(i64, @intCast((std.posix.clock_gettime(.REALTIME) catch std.posix.timespec{ .sec = 0, .nsec = 0 }).sec));
        entry.* = .{
            .hash = hash,
            .dep_file = try allocator.dupe(u8, tmp_file),
            .dep_mtime = @divFloor(stat.mtime, std.time.ns_per_s), // Store in seconds to match isValid comparison
            .path = try allocator.dupe(u8, "/usr/bin"),
            .env_vars = env_vars,
            .created_at = now,
            .cached_at = now,
            .last_validated = now,
        };

        try cache.put(entry);
    }

    const cache_stats = cache.stats();
    try std.testing.expect(cache_stats.total_entries == 10);
    try std.testing.expect(cache_stats.fast_cache_entries <= 8);
}
