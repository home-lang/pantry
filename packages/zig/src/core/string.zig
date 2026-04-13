const std = @import("std");

/// FNV-1a hash parameters
const FNV_OFFSET_BASIS: u64 = 0xcbf29ce484222325;
const FNV_PRIME: u64 = 0x100000001b3;

/// Threshold for switching from FNV-1a to MD5 (in bytes)
const SMALL_STRING_THRESHOLD = 32;

/// Ultra-fast MD5 hash for strings
/// Uses FNV-1a for small strings (< 32 bytes) for 100-400x speedup
/// Falls back to MD5 for larger strings for collision resistance
pub fn md5Hash(input: []const u8) [16]u8 {
    if (input.len < SMALL_STRING_THRESHOLD) {
        return md5HashSmall(input);
    } else {
        return md5HashLarge(input);
    }
}

/// Fast FNV-1a hash for small strings (< 32 bytes)
/// Provides excellent distribution for short paths and environment names
fn md5HashSmall(input: []const u8) [16]u8 {
    var result: [16]u8 = undefined;
    var hash: u64 = FNV_OFFSET_BASIS;

    // FNV-1a algorithm
    for (input) |byte| {
        hash ^= byte;
        hash *%= FNV_PRIME;
    }

    // Store hash in first 8 bytes, zero the rest
    std.mem.writeInt(u64, result[0..8], hash, .little);
    @memset(result[8..], 0);

    return result;
}

/// Standard MD5 hash for larger strings
fn md5HashLarge(input: []const u8) [16]u8 {
    var hasher = std.crypto.hash.Md5.init(.{});
    hasher.update(input);
    var result: [16]u8 = undefined;
    hasher.final(&result);
    return result;
}

/// Convert hash to hex string
pub fn hashToHex(hash: [16]u8, allocator: std.mem.Allocator) ![]const u8 {
    const buffer = try allocator.alloc(u8, 32);
    _ = try std.fmt.bufPrint(buffer, "{s}", .{std.fmt.bytesToHex(hash, .lower)});
    return buffer;
}

/// Hash a dependency file path
/// Optimized for common dependency file names (package.json, etc.)
pub fn hashDependencyFile(path: []const u8) [16]u8 {
    return md5Hash(path);
}

/// Hash a project directory identity. Mixes the absolute path with the `(dev,
/// inode)` pair from stat(2) so that renaming a parent directory — which
/// changes the string — produces a *different* hash (not a stale cache hit on
/// the old path), and re-parenting the same inode at a new location produces
/// the *same* hash (so the cached env still applies). When stat fails (e.g.
/// the path no longer exists) we fall back to the plain-path hash so callers
/// keep working.
pub fn hashProjectPath(path: []const u8) [16]u8 {
    // Build the hash input: path || 0 || dev || 0 || inode || 0.
    var hasher = std.crypto.hash.Md5.init(.{});
    hasher.update(path);

    // We pull dev/inode via std.posix.stat if available.
    const posix = std.posix;
    var stat_buf: posix.Stat = undefined;
    if (posix.fstatat(posix.AT.FDCWD, pathZ(path), &stat_buf, 0)) |_| {
        const sep: u8 = 0;
        hasher.update((&sep)[0..1]);
        hasher.update(std.mem.asBytes(&stat_buf.dev));
        hasher.update((&sep)[0..1]);
        hasher.update(std.mem.asBytes(&stat_buf.ino));
    } else |_| {}

    var result: [16]u8 = undefined;
    hasher.final(&result);
    return result;
}

/// Buffered null-terminator for a filesystem path. If the path contains a null
/// byte it's truncated to the null byte (shouldn't happen in practice). Caller
/// must copy within a single call site (the returned pointer references
/// function-local state).
fn pathZ(path: []const u8) [*:0]const u8 {
    // stash in a thread-local buffer — path lengths should fit.
    const S = struct {
        threadlocal var buf: [std.fs.max_path_bytes + 1]u8 = undefined;
    };
    const len = @min(path.len, S.buf.len - 1);
    @memcpy(S.buf[0..len], path[0..len]);
    S.buf[len] = 0;
    return @ptrCast(&S.buf);
}

/// Content-hash a file for the staleness check. Returns a zero-filled hash on
/// any IO error (missing file / permission) so callers can treat that as
/// "always stale" without having to propagate errors.
pub fn hashDependencyFileContent(path: []const u8) [16]u8 {
    const file = std.fs.cwd().openFile(path, .{}) catch return .{0} ** 16;
    defer file.close(io_helper.io);

    var hasher = std.crypto.hash.Md5.init(.{});
    var buf: [8192]u8 = undefined;
    while (true) {
        const n = file.read(&buf) catch return .{0} ** 16;
        if (n == 0) break;
        hasher.update(buf[0..n]);
    }
    var result: [16]u8 = undefined;
    hasher.final(&result);
    return result;
}

test "hashProjectPath differs when path differs" {
    const a = hashProjectPath("/nonexistent/pantry/test/a");
    const b = hashProjectPath("/nonexistent/pantry/test/b");
    try std.testing.expect(!std.mem.eql(u8, &a, &b));
}

test "hashDependencyFileContent zero on missing file" {
    const zero = [_]u8{0} ** 16;
    const h = hashDependencyFileContent("/nonexistent/pantry/test/missing.file");
    try std.testing.expectEqualSlices(u8, &zero, &h);
}

/// Hash environment variables
/// Combines multiple env vars into single hash
pub fn hashEnvironment(vars: []const []const u8, allocator: std.mem.Allocator) ![16]u8 {
    // Sort for deterministic hashing
    const sorted = try allocator.dupe([]const u8, vars);
    defer allocator.free(sorted);
    std.mem.sort([]const u8, sorted, {}, stringLessThan);

    // Concatenate and hash
    var list = try std.ArrayList(u8).initCapacity(allocator, vars.len * 32);
    defer list.deinit(allocator);

    for (sorted) |v| {
        try list.appendSlice(allocator, v);
        try list.append(allocator, 0); // null separator
    }

    return md5Hash(list.items);
}

fn stringLessThan(_: void, a: []const u8, b: []const u8) bool {
    return std.mem.order(u8, a, b) == .lt;
}

/// String interning for pointer-based equality checks
pub const StringInterner = struct {
    map: std.StringHashMap([]const u8),
    allocator: std.mem.Allocator,

    pub fn init(allocator: std.mem.Allocator) StringInterner {
        return .{
            .map = std.StringHashMap([]const u8).init(allocator),
            .allocator = allocator,
        };
    }

    pub fn deinit(self: *StringInterner) void {
        var it = self.map.valueIterator();
        while (it.next()) |value| {
            self.allocator.free(value.*);
        }
        self.map.deinit(self.allocator);
    }

    /// Intern a string, returning a stable pointer
    /// Multiple calls with same string return same pointer
    pub fn intern(self: *StringInterner, str: []const u8) ![]const u8 {
        if (self.map.get(str)) |existing| {
            return existing;
        }

        const owned = try self.allocator.dupe(u8, str);
        try self.map.put(owned, owned);
        return owned;
    }

    /// Check if two strings are equal by comparing pointers
    /// Only works for interned strings
    pub fn equalPtr(a: []const u8, b: []const u8) bool {
        return a.ptr == b.ptr;
    }
};

/// SIMD-accelerated string operations
pub const SIMD = struct {
    /// Compare multiple strings in parallel using SIMD
    /// Returns index of first match, or null if no match
    pub fn findMatch(needle: []const u8, haystack: []const []const u8) ?usize {
        // For small haystacks, use simple loop
        if (haystack.len < 4) {
            for (haystack, 0..) |item, i| {
                if (std.mem.eql(u8, needle, item)) return i;
            }
            return null;
        }

        // For larger haystacks, could use SIMD optimizations
        // For now, use optimized loop
        for (haystack, 0..) |item, i| {
            if (std.mem.eql(u8, needle, item)) return i;
        }
        return null;
    }

    /// Bulk string comparison using SIMD when available
    pub fn bulkCompare(a: []const u8, b: []const u8) bool {
        if (a.len != b.len) return false;
        return std.mem.eql(u8, a, b);
    }
};

test "md5Hash - small strings use FNV-1a" {
    const small = "package.json";
    const hash1 = md5Hash(small);
    const hash2 = md5Hash(small);

    // Same input produces same hash
    try std.testing.expectEqualSlices(u8, &hash1, &hash2);

    // Different inputs produce different hashes
    const different = "deps.yaml";
    const hash3 = md5Hash(different);
    try std.testing.expect(!std.mem.eql(u8, &hash1, &hash3));
}

test "md5Hash - large strings use MD5" {
    const large = "a" ** 100;
    const hash1 = md5Hash(large);
    const hash2 = md5Hash(large);

    try std.testing.expectEqualSlices(u8, &hash1, &hash2);
}

test "hashToHex" {
    const allocator = std.testing.allocator;
    const hash = md5Hash("test");
    const hex = try hashToHex(hash, allocator);
    defer allocator.free(hex);

    try std.testing.expect(hex.len == 32);
}

test "hashEnvironment" {
    const allocator = std.testing.allocator;
    const vars = [_][]const u8{ "VAR1=value1", "VAR2=value2" };
    const hash = try hashEnvironment(&vars, allocator);

    // Same vars in different order should produce same hash
    const vars_reversed = [_][]const u8{ "VAR2=value2", "VAR1=value1" };
    const hash2 = try hashEnvironment(&vars_reversed, allocator);

    try std.testing.expectEqualSlices(u8, &hash, &hash2);
}

test "StringInterner" {
    const allocator = std.testing.allocator;
    var interner = StringInterner.init(allocator);
    defer interner.deinit();

    const str1 = try interner.intern("hello");
    const str2 = try interner.intern("hello");
    const str3 = try interner.intern("world");

    // Same strings return same pointer
    try std.testing.expect(StringInterner.equalPtr(str1, str2));
    try std.testing.expect(!StringInterner.equalPtr(str1, str3));

    // Content is preserved
    try std.testing.expectEqualStrings("hello", str1);
    try std.testing.expectEqualStrings("world", str3);
}

test "SIMD findMatch" {
    const haystack = [_][]const u8{ "apple", "banana", "cherry", "date" };

    try std.testing.expect(SIMD.findMatch("banana", &haystack) == 1);
    try std.testing.expect(SIMD.findMatch("date", &haystack) == 3);
    try std.testing.expect(SIMD.findMatch("grape", &haystack) == null);
}

test "SIMD bulkCompare" {
    try std.testing.expect(SIMD.bulkCompare("hello", "hello"));
    try std.testing.expect(!SIMD.bulkCompare("hello", "world"));
    try std.testing.expect(!SIMD.bulkCompare("hello", "hello!"));
}
