const std = @import("std");
const testing = std.testing;
const lib = @import("lib");

test "String - hashToHex converts correctly" {
    const allocator = testing.allocator;

    const hash: [16]u8 = .{ 0xde, 0xad, 0xbe, 0xef, 0xca, 0xfe, 0xba, 0xbe, 0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0xde, 0xf0 };
    const result = try lib.string.hashToHex(hash, allocator);
    defer allocator.free(result);

    try testing.expectEqualStrings("deadbeefcafebabe123456789abcdef0", result);
}

test "String - hashToHex handles all zeros" {
    const allocator = testing.allocator;

    const hash: [16]u8 = .{0} ** 16;
    const result = try lib.string.hashToHex(hash, allocator);
    defer allocator.free(result);

    try testing.expectEqualStrings("00000000000000000000000000000000", result);
}

test "String - hashToHex handles all ones" {
    const allocator = testing.allocator;

    const hash: [16]u8 = .{0xff} ** 16;
    const result = try lib.string.hashToHex(hash, allocator);
    defer allocator.free(result);

    try testing.expectEqualStrings("ffffffffffffffffffffffffffffffff", result);
}

test "String - hashToHex MD5 size" {
    const allocator = testing.allocator;

    const hash: [16]u8 = .{ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16 };
    const result = try lib.string.hashToHex(hash, allocator);
    defer allocator.free(result);

    try testing.expect(result.len == 32); // 16 bytes * 2 hex chars per byte
}

test "String - md5Hash produces consistent output" {
    const input = "test string";
    const hash1 = lib.string.md5Hash(input);
    const hash2 = lib.string.md5Hash(input);

    try testing.expectEqualSlices(u8, &hash1, &hash2);
}

test "String - md5Hash different inputs produce different hashes" {
    const input1 = "test1";
    const input2 = "test2";
    const hash1 = lib.string.md5Hash(input1);
    const hash2 = lib.string.md5Hash(input2);

    try testing.expect(!std.mem.eql(u8, &hash1, &hash2));
}

test "String - hashEnvironment handles empty vars" {
    const allocator = testing.allocator;

    const vars: []const []const u8 = &[_][]const u8{};
    const hash = try lib.string.hashEnvironment(vars, allocator);

    try testing.expect(hash.len == 16);
}

test "String - hashEnvironment handles multiple vars" {
    const allocator = testing.allocator;

    const vars = [_][]const u8{ "VAR1=value1", "VAR2=value2" };
    const hash = try lib.string.hashEnvironment(&vars, allocator);

    try testing.expect(hash.len == 16);
}

test "String - StringInterner intern same string returns same pointer" {
    const allocator = testing.allocator;

    var interner = lib.string.StringInterner.init(allocator);
    defer interner.deinit();

    const str1 = try interner.intern("test");
    const str2 = try interner.intern("test");

    // Same string should return same pointer
    try testing.expect(lib.string.StringInterner.equalPtr(str1, str2));
}

test "String - StringInterner different strings have different pointers" {
    const allocator = testing.allocator;

    var interner = lib.string.StringInterner.init(allocator);
    defer interner.deinit();

    const str1 = try interner.intern("test1");
    const str2 = try interner.intern("test2");

    try testing.expect(!lib.string.StringInterner.equalPtr(str1, str2));
}

// Note: bulkCompare is an internal utility function, tested indirectly
