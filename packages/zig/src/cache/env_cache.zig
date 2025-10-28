const std = @import("std");
const builtin = @import("builtin");
const core = @import("../core/platform.zig");
const string = @import("../core/string.zig");
const errors = @import("../core/error.zig");

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
    /// TTL in seconds (default 30 minutes)
    ttl: i64 = 1800,

    /// Check if cache entry is still valid
    pub fn isValid(self: *Entry, _: std.mem.Allocator) !bool {
        const now = std.time.timestamp();

        // Check TTL expiration
        if (now - self.created_at > self.ttl) {
            return false;
        }

        // Check if dependency file has been modified
        const stat = std.fs.cwd().statFile(self.dep_file) catch {
            return false; // File no longer exists
        };

        const current_mtime = stat.mtime;
        if (current_mtime != self.dep_mtime) {
            return false; // File has been modified
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

    pub fn init(allocator: std.mem.Allocator) EnvCache {
        return .{
            .cache = std.AutoHashMap([16]u8, *Entry).init(allocator),
            .fast_cache_idx = std.atomic.Value(u8).init(0),
            .allocator = allocator,
            .lock = .{},
        };
    }

    pub fn deinit(self: *EnvCache) void {
        self.lock.lock();
        defer self.lock.unlock();

        var it = self.cache.valueIterator();
        while (it.next()) |entry_ptr| {
            entry_ptr.*.deinit(self.allocator);
            self.allocator.destroy(entry_ptr.*);
        }
        self.cache.deinit();
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
    const stat = try std.fs.cwd().statFile(dep_file);

    // Compute hash
    const hash = string.hashDependencyFile(dep_file);

    entry.* = .{
        .hash = hash,
        .dep_file = try allocator.dupe(u8, dep_file),
        .dep_mtime = stat.mtime,
        .path = try allocator.dupe(u8, path),
        .env_vars = env_vars,
        .created_at = std.time.timestamp(),
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
        const file = try std.fs.cwd().createFile(tmp_file, .{});
        defer file.close();
        try file.writeAll("test: content");
    }
    defer std.fs.cwd().deleteFile(tmp_file) catch {};

    // Get file stat
    const stat = try std.fs.cwd().statFile(tmp_file);

    // Create a test entry
    var env_vars = std.StringHashMap([]const u8).init(allocator);
    try env_vars.put(try allocator.dupe(u8, "NODE_VERSION"), try allocator.dupe(u8, "20.0.0"));

    const hash = string.md5Hash("test");
    const entry = try allocator.create(Entry);
    const now = std.time.timestamp();
    entry.* = .{
        .hash = hash,
        .dep_file = try allocator.dupe(u8, tmp_file),
        .dep_mtime = stat.mtime,
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
        const file = try std.fs.cwd().createFile(tmp_file, .{});
        defer file.close();
        try file.writeAll("test: content");
    }
    defer std.fs.cwd().deleteFile(tmp_file) catch {};

    const stat = try std.fs.cwd().statFile(tmp_file);

    // Create multiple entries
    var i: usize = 0;
    while (i < 10) : (i += 1) {
        var env_vars = std.StringHashMap([]const u8).init(allocator);
        try env_vars.put(try allocator.dupe(u8, "TEST"), try allocator.dupe(u8, "value"));

        var buf: [64]u8 = undefined;
        const key = try std.fmt.bufPrint(&buf, "test_{d}", .{i});
        const hash = string.md5Hash(key);

        const entry = try allocator.create(Entry);
        const now = std.time.timestamp();
        entry.* = .{
            .hash = hash,
            .dep_file = try allocator.dupe(u8, tmp_file),
            .dep_mtime = stat.mtime,
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
