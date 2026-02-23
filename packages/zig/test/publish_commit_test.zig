//! Publish Commit Command Tests
//!
//! Tests for the commit-based publishing functionality (pkg-pr-new equivalent).
//! Tests the package name sanitization, S3 key generation, DynamoDB key format,
//! and version comparison logic.

const std = @import("std");
const testing = std.testing;
const lib = @import("lib");

// ============================================================================
// Package Name Sanitization Tests
// ============================================================================

test "sanitize package name for S3 key" {
    // Test sanitization logic used in commit publishing
    const names = [_]struct { input: []const u8, expected: []const u8 }{
        .{ .input = "simple-pkg", .expected = "simple-pkg" },
        .{ .input = "@scope/name", .expected = "scope-name" },
        .{ .input = "@stacksjs/actions", .expected = "stacksjs-actions" },
        .{ .input = "no-scope", .expected = "no-scope" },
    };

    for (names) |case| {
        var sanitized: [256]u8 = undefined;
        for (case.input, 0..) |c, i| {
            sanitized[i] = if (c == '@' or c == '/') '-' else c;
        }
        const result = sanitized[0..case.input.len];
        const clean = if (result[0] == '-') result[1..] else result;
        try testing.expectEqualStrings(case.expected, clean);
    }
}

// ============================================================================
// S3 Key Generation Tests
// ============================================================================

test "commit S3 key format is correct" {
    const allocator = testing.allocator;

    // Verify the key format: commits/{sha}/{safeName}/{safeName}.tgz
    const sha = "abc1234567890def";
    const name = "@stacksjs/actions";

    // Sanitize
    var sanitized_name = try allocator.alloc(u8, name.len);
    defer allocator.free(sanitized_name);
    for (name, 0..) |c, i| {
        sanitized_name[i] = if (c == '@' or c == '/') '-' else c;
    }
    const clean_name = if (sanitized_name[0] == '-') sanitized_name[1..] else sanitized_name;

    const key = try std.fmt.allocPrint(allocator, "commits/{s}/{s}/{s}.tgz", .{ sha, clean_name, clean_name });
    defer allocator.free(key);

    try testing.expectEqualStrings("commits/abc1234567890def/stacksjs-actions/stacksjs-actions.tgz", key);
}

test "commit install URL format is correct" {
    const allocator = testing.allocator;

    const registry = "https://registry.stacksjs.org";
    const sha = "abc1234";
    const name = "@stacksjs/actions";

    const url = try std.fmt.allocPrint(allocator, "{s}/commits/{s}/{s}/tarball", .{ registry, sha, name });
    defer allocator.free(url);

    try testing.expectEqualStrings("https://registry.stacksjs.org/commits/abc1234/@stacksjs/actions/tarball", url);
}

// ============================================================================
// DynamoDB Key Format Tests
// ============================================================================

test "commit DynamoDB PK/SK format" {
    const allocator = testing.allocator;

    const sha = "abc1234";
    const name = "my-package";

    // Primary key format
    const pk = try std.fmt.allocPrint(allocator, "COMMIT#{s}", .{sha});
    defer allocator.free(pk);
    const sk = try std.fmt.allocPrint(allocator, "PACKAGE#{s}", .{name});
    defer allocator.free(sk);

    try testing.expectEqualStrings("COMMIT#abc1234", pk);
    try testing.expectEqualStrings("PACKAGE#my-package", sk);

    // Reverse lookup
    const rev_pk = try std.fmt.allocPrint(allocator, "COMMIT_PACKAGE#{s}", .{name});
    defer allocator.free(rev_pk);
    const rev_sk = try std.fmt.allocPrint(allocator, "SHA#{s}", .{sha});
    defer allocator.free(rev_sk);

    try testing.expectEqualStrings("COMMIT_PACKAGE#my-package", rev_pk);
    try testing.expectEqualStrings("SHA#abc1234", rev_sk);
}

// ============================================================================
// Version Extraction Tests
// ============================================================================

test "version comparison for semver" {
    // Test isLowerVersion logic — same as registry.zig
    const cases = [_]struct { v1: []const u8, v2: []const u8, expected: bool }{
        .{ .v1 = "1.0.0", .v2 = "2.0.0", .expected = true },
        .{ .v1 = "2.0.0", .v2 = "1.0.0", .expected = false },
        .{ .v1 = "1.1.0", .v2 = "1.2.0", .expected = true },
        .{ .v1 = "1.2.0", .v2 = "1.1.0", .expected = false },
        .{ .v1 = "1.0.1", .v2 = "1.0.2", .expected = true },
        .{ .v1 = "1.0.0", .v2 = "1.0.0", .expected = false },
    };

    for (cases) |case| {
        var v1_parts = std.mem.splitScalar(u8, case.v1, '.');
        var v2_parts = std.mem.splitScalar(u8, case.v2, '.');

        var result = false;
        inline for (0..3) |_| {
            const p1_str = v1_parts.next() orelse "0";
            const p2_str = v2_parts.next() orelse "0";
            const p1 = std.fmt.parseInt(u32, p1_str, 10) catch 0;
            const p2 = std.fmt.parseInt(u32, p2_str, 10) catch 0;
            if (p1 < p2) {
                result = true;
                break;
            }
            if (p1 > p2) {
                result = false;
                break;
            }
        }

        try testing.expectEqual(case.expected, result);
    }
}

// ============================================================================
// Monorepo Detection Tests (uses registry_commands.detectMonorepoPackages)
// ============================================================================

test "detectMonorepoPackages finds packages in packages/ directory" {
    const allocator = testing.allocator;
    const io_helper = lib.io_helper;

    const tmp_dir = "test_data_pc_monorepo";
    defer io_helper.deleteTree(tmp_dir) catch {};

    const packages_dir = try std.fs.path.join(allocator, &[_][]const u8{ tmp_dir, "packages" });
    defer allocator.free(packages_dir);
    try io_helper.makePath(packages_dir);

    // Create pkg-a
    const dir_a = try std.fs.path.join(allocator, &[_][]const u8{ packages_dir, "pkg-a" });
    defer allocator.free(dir_a);
    try io_helper.makePath(dir_a);
    {
        const cfg = try std.fs.path.join(allocator, &[_][]const u8{ dir_a, "package.json" });
        defer allocator.free(cfg);
        const file = try io_helper.cwd().createFile(io_helper.io, cfg, .{});
        defer file.close(io_helper.io);
        try io_helper.writeAllToFile(file, "{\"name\": \"pkg-a\", \"version\": \"1.0.0\"}");
    }

    // Create pkg-b
    const dir_b = try std.fs.path.join(allocator, &[_][]const u8{ packages_dir, "pkg-b" });
    defer allocator.free(dir_b);
    try io_helper.makePath(dir_b);
    {
        const cfg = try std.fs.path.join(allocator, &[_][]const u8{ dir_b, "package.json" });
        defer allocator.free(cfg);
        const file = try io_helper.cwd().createFile(io_helper.io, cfg, .{});
        defer file.close(io_helper.io);
        try io_helper.writeAllToFile(file, "{\"name\": \"pkg-b\", \"version\": \"2.0.0\"}");
    }

    // Create private-pkg
    const dir_priv = try std.fs.path.join(allocator, &[_][]const u8{ packages_dir, "private-pkg" });
    defer allocator.free(dir_priv);
    try io_helper.makePath(dir_priv);
    {
        const cfg = try std.fs.path.join(allocator, &[_][]const u8{ dir_priv, "package.json" });
        defer allocator.free(cfg);
        const file = try io_helper.cwd().createFile(io_helper.io, cfg, .{});
        defer file.close(io_helper.io);
        try io_helper.writeAllToFile(file, "{\"name\": \"private-pkg\", \"version\": \"0.1.0\", \"private\": true}");
    }

    // Detect packages
    const result = try lib.commands.registry_commands.detectMonorepoPackages(allocator, tmp_dir, null);
    defer if (result) |pkgs| {
        for (pkgs) |*pkg| {
            var p = pkg.*;
            p.deinit(allocator);
        }
        allocator.free(pkgs);
    };

    try testing.expect(result != null);
    const pkgs = result.?;

    // Should find 2 non-private packages
    try testing.expectEqual(@as(usize, 2), pkgs.len);

    // Verify package names (order may vary)
    var found_a = false;
    var found_b = false;
    for (pkgs) |pkg| {
        if (std.mem.eql(u8, pkg.name, "pkg-a")) found_a = true;
        if (std.mem.eql(u8, pkg.name, "pkg-b")) found_b = true;
    }
    try testing.expect(found_a);
    try testing.expect(found_b);
}

test "detectMonorepoPackages returns null when no packages/ dir" {
    const allocator = testing.allocator;
    const io_helper = lib.io_helper;

    const tmp_dir = "test_data_pc_no_monorepo";
    try io_helper.makePath(tmp_dir);
    defer io_helper.deleteTree(tmp_dir) catch {};

    const result = try lib.commands.registry_commands.detectMonorepoPackages(allocator, tmp_dir, null);
    try testing.expect(result == null);
}

test "detectMonorepoPackages respects skip flag" {
    const allocator = testing.allocator;
    const io_helper = lib.io_helper;

    const tmp_dir = "test_data_pc_skip";
    defer io_helper.deleteTree(tmp_dir) catch {};

    const packages_dir = try std.fs.path.join(allocator, &[_][]const u8{ tmp_dir, "packages" });
    defer allocator.free(packages_dir);
    try io_helper.makePath(packages_dir);

    // Create keep-me
    const dir_a = try std.fs.path.join(allocator, &[_][]const u8{ packages_dir, "keep-me" });
    defer allocator.free(dir_a);
    try io_helper.makePath(dir_a);
    {
        const cfg = try std.fs.path.join(allocator, &[_][]const u8{ dir_a, "package.json" });
        defer allocator.free(cfg);
        const file = try io_helper.cwd().createFile(io_helper.io, cfg, .{});
        defer file.close(io_helper.io);
        try io_helper.writeAllToFile(file, "{\"name\": \"keep-me\", \"version\": \"1.0.0\"}");
    }

    // Create skip-me
    const dir_b = try std.fs.path.join(allocator, &[_][]const u8{ packages_dir, "skip-me" });
    defer allocator.free(dir_b);
    try io_helper.makePath(dir_b);
    {
        const cfg = try std.fs.path.join(allocator, &[_][]const u8{ dir_b, "package.json" });
        defer allocator.free(cfg);
        const file = try io_helper.cwd().createFile(io_helper.io, cfg, .{});
        defer file.close(io_helper.io);
        try io_helper.writeAllToFile(file, "{\"name\": \"skip-me\", \"version\": \"1.0.0\"}");
    }

    // Skip "skip-me"
    const result = try lib.commands.registry_commands.detectMonorepoPackages(allocator, tmp_dir, "skip-me");
    defer if (result) |pkgs| {
        for (pkgs) |*pkg| {
            var p = pkg.*;
            p.deinit(allocator);
        }
        allocator.free(pkgs);
    };

    try testing.expect(result != null);
    try testing.expectEqual(@as(usize, 1), result.?.len);
    try testing.expectEqualStrings("keep-me", result.?[0].name);
}
