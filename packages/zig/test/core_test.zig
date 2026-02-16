const std = @import("std");
const lib = @import("lib");
const Platform = lib.Platform;
const Architecture = lib.Architecture;
const Paths = lib.Paths;
const string = lib.string;
const pantryError = lib.pantryError;
const ErrorContext = lib.ErrorContext;

// Platform tests
test "Platform detection is compile-time" {
    const platform = Platform.current();
    const name = platform.name();

    try std.testing.expect(name.len > 0);
    try std.testing.expect(std.mem.eql(u8, name, "darwin") or
        std.mem.eql(u8, name, "linux") or
        std.mem.eql(u8, name, "windows"));
}

test "Architecture detection is compile-time" {
    const arch = Architecture.current();
    const name = arch.name();

    try std.testing.expect(name.len > 0);
    try std.testing.expect(std.mem.eql(u8, name, "aarch64") or
        std.mem.eql(u8, name, "x86_64"));
}

test "Path resolution returns valid paths" {
    const allocator = std.testing.allocator;

    // Test home path
    const home = try Paths.home(allocator);
    defer allocator.free(home);
    try std.testing.expect(home.len > 0);

    // Test cache path
    const cache = try Paths.cache(allocator);
    defer allocator.free(cache);
    try std.testing.expect(cache.len > 0);
    try std.testing.expect(std.mem.indexOf(u8, cache, "pantry") != null);

    // Test data path
    const data = try Paths.data(allocator);
    defer allocator.free(data);
    try std.testing.expect(data.len > 0);
    try std.testing.expect(std.mem.indexOf(u8, data, "pantry") != null);

    // Test config path
    const config = try Paths.config(allocator);
    defer allocator.free(config);
    try std.testing.expect(config.len > 0);
    try std.testing.expect(std.mem.indexOf(u8, config, "pantry") != null);
}

test "Library path variables are platform-specific" {
    const lib_var = Paths.libraryPathVar();

    switch (Platform.current()) {
        .darwin => try std.testing.expectEqualStrings("DYLD_LIBRARY_PATH", lib_var),
        .linux, .freebsd => try std.testing.expectEqualStrings("LD_LIBRARY_PATH", lib_var),
        .windows => try std.testing.expectEqualStrings("PATH", lib_var),
    }
}

test "Path separator is platform-specific" {
    const sep = Paths.pathSeparator();

    switch (Platform.current()) {
        .darwin, .linux, .freebsd => try std.testing.expect(sep == ':'),
        .windows => try std.testing.expect(sep == ';'),
    }
}

// String hashing tests
test "md5Hash produces consistent results" {
    const input = "package.json";
    const hash1 = string.md5Hash(input);
    const hash2 = string.md5Hash(input);

    try std.testing.expectEqualSlices(u8, &hash1, &hash2);
}

test "md5Hash produces different hashes for different inputs" {
    const hash1 = string.md5Hash("package.json");
    const hash2 = string.md5Hash("deps.yaml");

    try std.testing.expect(!std.mem.eql(u8, &hash1, &hash2));
}

test "hashToHex produces valid hex string" {
    const allocator = std.testing.allocator;
    const hash = string.md5Hash("test");
    const hex = try string.hashToHex(hash, allocator);
    defer allocator.free(hex);

    try std.testing.expect(hex.len == 32);

    // Verify all characters are valid hex
    for (hex) |c| {
        try std.testing.expect((c >= '0' and c <= '9') or
            (c >= 'a' and c <= 'f'));
    }
}

test "hashEnvironment is deterministic" {
    const allocator = std.testing.allocator;

    const vars1 = [_][]const u8{ "VAR1=value1", "VAR2=value2", "VAR3=value3" };
    const hash1 = try string.hashEnvironment(&vars1, allocator);

    // Same variables in different order should produce same hash
    const vars2 = [_][]const u8{ "VAR3=value3", "VAR1=value1", "VAR2=value2" };
    const hash2 = try string.hashEnvironment(&vars2, allocator);

    try std.testing.expectEqualSlices(u8, &hash1, &hash2);
}

test "StringInterner deduplicates strings" {
    const allocator = std.testing.allocator;
    var interner = string.StringInterner.init(allocator);
    defer interner.deinit();

    const str1 = try interner.intern("hello");
    const str2 = try interner.intern("hello");
    const str3 = try interner.intern("world");

    // Same strings should return same pointer
    try std.testing.expect(str1.ptr == str2.ptr);
    try std.testing.expect(str1.ptr != str3.ptr);

    // Content should be preserved
    try std.testing.expectEqualStrings("hello", str1);
    try std.testing.expectEqualStrings("world", str3);
}

test "SIMD findMatch works correctly" {
    const haystack = [_][]const u8{
        "node",
        "bun",
        "deno",
        "python",
    };

    try std.testing.expect(string.SIMD.findMatch("bun", &haystack) == 1);
    try std.testing.expect(string.SIMD.findMatch("python", &haystack) == 3);
    try std.testing.expect(string.SIMD.findMatch("ruby", &haystack) == null);
}

test "SIMD bulkCompare is accurate" {
    try std.testing.expect(string.SIMD.bulkCompare("test", "test"));
    try std.testing.expect(!string.SIMD.bulkCompare("test", "Test"));
    try std.testing.expect(!string.SIMD.bulkCompare("test", "testing"));
}

// Error handling tests
test "formatError returns meaningful messages" {
    const allocator = std.testing.allocator;
    const errors_mod = @import("lib").errors;

    const errors = [_]pantryError{
        error.PackageNotFound,
        error.CacheCorrupted,
        error.DependencyConflict,
        error.NetworkUnavailable,
    };

    for (errors) |err| {
        const msg = try errors_mod.formatError(err, allocator);
        defer allocator.free(msg);
        try std.testing.expect(msg.len > 0);
    }
}

test "ErrorContext produces formatted output" {
    const allocator = std.testing.allocator;

    const ctx = ErrorContext{
        .error_type = error.PackageNotFound,
        .message = "Package 'node@22' not found",
        .file_path = "/tmp/deps.yaml",
        .line = 10,
        .context = "While resolving dependencies",
    };

    const formatted = try ctx.format(allocator);
    defer allocator.free(formatted);

    try std.testing.expect(formatted.len > 0);
    try std.testing.expect(std.mem.indexOf(u8, formatted, "Error:") != null);
    try std.testing.expect(std.mem.indexOf(u8, formatted, "node@22") != null);
}

// Integration tests
test "Full workflow: hash path and format error" {
    const allocator = std.testing.allocator;

    // Hash a dependency file path
    const path = "/Users/test/project/package.json";
    const hash = string.hashDependencyFile(path);

    // Convert to hex
    const hex = try string.hashToHex(hash, allocator);
    defer allocator.free(hex);

    try std.testing.expect(hex.len == 32);

    // Simulate an error
    const ctx = ErrorContext{
        .error_type = error.DependencyFileInvalid,
        .message = "Could not parse dependency file",
        .file_path = path,
        .context = hex,
    };

    const formatted = try ctx.format(allocator);
    defer allocator.free(formatted);

    try std.testing.expect(std.mem.indexOf(u8, formatted, path) != null);
}
