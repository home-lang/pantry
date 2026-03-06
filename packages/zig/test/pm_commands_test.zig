const std = @import("std");
const testing = std.testing;
const lib = @import("lib");

// ============================================================================
// Version Comparison Unit Tests (pure functions, no I/O)
// ============================================================================

test "compareVersions - equal versions" {
    const outdated = lib.commands.outdated_cmd;
    try testing.expectEqual(std.math.Order.eq, outdated.compareVersions("1.0.0", "1.0.0"));
    try testing.expectEqual(std.math.Order.eq, outdated.compareVersions("0.0.0", "0.0.0"));
    try testing.expectEqual(std.math.Order.eq, outdated.compareVersions("10.20.30", "10.20.30"));
}

test "compareVersions - major version differences" {
    const outdated = lib.commands.outdated_cmd;
    try testing.expectEqual(std.math.Order.lt, outdated.compareVersions("1.0.0", "2.0.0"));
    try testing.expectEqual(std.math.Order.gt, outdated.compareVersions("2.0.0", "1.0.0"));
    try testing.expectEqual(std.math.Order.gt, outdated.compareVersions("10.0.0", "9.0.0"));
    try testing.expectEqual(std.math.Order.gt, outdated.compareVersions("100.0.0", "99.99.99"));
}

test "compareVersions - minor version differences" {
    const outdated = lib.commands.outdated_cmd;
    try testing.expectEqual(std.math.Order.lt, outdated.compareVersions("1.0.0", "1.1.0"));
    try testing.expectEqual(std.math.Order.gt, outdated.compareVersions("1.1.0", "1.0.0"));
    try testing.expectEqual(std.math.Order.lt, outdated.compareVersions("1.0.0", "1.99.0"));
}

test "compareVersions - patch version differences" {
    const outdated = lib.commands.outdated_cmd;
    try testing.expectEqual(std.math.Order.lt, outdated.compareVersions("1.0.0", "1.0.1"));
    try testing.expectEqual(std.math.Order.gt, outdated.compareVersions("1.0.1", "1.0.0"));
    try testing.expectEqual(std.math.Order.lt, outdated.compareVersions("0.0.1", "0.0.2"));
}

test "compareVersions - prerelease suffix stripped" {
    const outdated = lib.commands.outdated_cmd;
    try testing.expectEqual(std.math.Order.eq, outdated.compareVersions("1.0.0-alpha", "1.0.0"));
    try testing.expectEqual(std.math.Order.eq, outdated.compareVersions("1.0.0-beta.1", "1.0.0"));
    try testing.expectEqual(std.math.Order.lt, outdated.compareVersions("1.0.0-beta", "2.0.0"));
}

test "compareVersions - single and two component versions" {
    const outdated = lib.commands.outdated_cmd;
    try testing.expectEqual(std.math.Order.eq, outdated.compareVersions("1", "1"));
    try testing.expectEqual(std.math.Order.lt, outdated.compareVersions("1", "2"));
    try testing.expectEqual(std.math.Order.eq, outdated.compareVersions("1.0", "1.0"));
    try testing.expectEqual(std.math.Order.lt, outdated.compareVersions("1.0", "1.1"));
    try testing.expectEqual(std.math.Order.gt, outdated.compareVersions("2.0", "1.9"));
}

// ============================================================================
// satisfiesConstraint Unit Tests (pure functions, no I/O)
// ============================================================================

test "satisfiesConstraint - exact version match" {
    const outdated = lib.commands.outdated_cmd;
    try testing.expect(outdated.satisfiesConstraint("1.2.3", "1.2.3"));
    try testing.expect(!outdated.satisfiesConstraint("1.2.4", "1.2.3"));
    try testing.expect(!outdated.satisfiesConstraint("1.2.2", "1.2.3"));
    try testing.expect(!outdated.satisfiesConstraint("2.2.3", "1.2.3"));
}

test "satisfiesConstraint - caret range" {
    const outdated = lib.commands.outdated_cmd;
    // ^1.2.3 means >=1.2.3 and <2.0.0
    try testing.expect(outdated.satisfiesConstraint("1.2.3", "^1.2.3"));
    try testing.expect(outdated.satisfiesConstraint("1.2.5", "^1.2.3"));
    try testing.expect(outdated.satisfiesConstraint("1.9.0", "^1.2.3"));
    try testing.expect(!outdated.satisfiesConstraint("2.0.0", "^1.2.3"));
    try testing.expect(!outdated.satisfiesConstraint("1.2.2", "^1.2.3"));

    // ^0.x range
    try testing.expect(outdated.satisfiesConstraint("1.0.0", "^1.0.0"));
    try testing.expect(outdated.satisfiesConstraint("1.9.9", "^1.0.0"));
    try testing.expect(!outdated.satisfiesConstraint("2.0.0", "^1.0.0"));
}

test "satisfiesConstraint - tilde range" {
    const outdated = lib.commands.outdated_cmd;
    // ~1.2.0 means >=1.2.0 and <1.3.0
    try testing.expect(outdated.satisfiesConstraint("1.2.0", "~1.2.0"));
    try testing.expect(outdated.satisfiesConstraint("1.2.3", "~1.2.0"));
    try testing.expect(outdated.satisfiesConstraint("1.2.9", "~1.2.0"));
    try testing.expect(!outdated.satisfiesConstraint("1.3.0", "~1.2.0"));
    try testing.expect(!outdated.satisfiesConstraint("1.1.9", "~1.2.0"));
}

test "satisfiesConstraint - greater than or equal" {
    const outdated = lib.commands.outdated_cmd;
    try testing.expect(outdated.satisfiesConstraint("1.0.0", ">=1.0.0"));
    try testing.expect(outdated.satisfiesConstraint("2.0.0", ">=1.0.0"));
    try testing.expect(outdated.satisfiesConstraint("999.0.0", ">=1.0.0"));
    try testing.expect(!outdated.satisfiesConstraint("0.9.0", ">=1.0.0"));
    try testing.expect(!outdated.satisfiesConstraint("0.0.1", ">=1.0.0"));
}

test "satisfiesConstraint - wildcard and latest" {
    const outdated = lib.commands.outdated_cmd;
    try testing.expect(outdated.satisfiesConstraint("0.0.1", "*"));
    try testing.expect(outdated.satisfiesConstraint("99.99.99", "*"));
    try testing.expect(outdated.satisfiesConstraint("1.0.0", "latest"));
    try testing.expect(outdated.satisfiesConstraint("999.0.0", "latest"));
}

test "satisfiesConstraint - OR groups (||)" {
    const outdated = lib.commands.outdated_cmd;
    try testing.expect(outdated.satisfiesConstraint("1.0.0", "^1.0.0 || ^2.0.0"));
    try testing.expect(outdated.satisfiesConstraint("1.5.0", "^1.0.0 || ^2.0.0"));
    try testing.expect(outdated.satisfiesConstraint("2.0.0", "^1.0.0 || ^2.0.0"));
    try testing.expect(outdated.satisfiesConstraint("2.5.0", "^1.0.0 || ^2.0.0"));
    try testing.expect(!outdated.satisfiesConstraint("3.0.0", "^1.0.0 || ^2.0.0"));
    try testing.expect(!outdated.satisfiesConstraint("0.5.0", "^1.0.0 || ^2.0.0"));
}

test "satisfiesConstraint - empty constraint returns false" {
    const outdated = lib.commands.outdated_cmd;
    // Empty constraint has no valid OR segments, so nothing matches
    try testing.expect(!outdated.satisfiesConstraint("1.0.0", ""));
}

// ============================================================================
// SemverConstraint Unit Tests (via npm module)
// ============================================================================

test "SemverConstraint.parse - caret constraint" {
    const npm = lib.registry.npm;
    const sc = try npm.SemverConstraint.parse("^1.2.3");
    try testing.expectEqual(npm.SemverConstraint.ConstraintType.caret, sc.type);
    try testing.expectEqual(@as(u32, 1), sc.major);
    try testing.expectEqual(@as(u32, 2), sc.minor);
    try testing.expectEqual(@as(u32, 3), sc.patch);
}

test "SemverConstraint.parse - tilde constraint" {
    const npm = lib.registry.npm;
    const sc = try npm.SemverConstraint.parse("~2.0.0");
    try testing.expectEqual(npm.SemverConstraint.ConstraintType.tilde, sc.type);
    try testing.expectEqual(@as(u32, 2), sc.major);
    try testing.expectEqual(@as(u32, 0), sc.minor);
    try testing.expectEqual(@as(u32, 0), sc.patch);
}

test "SemverConstraint.parse - gte constraint" {
    const npm = lib.registry.npm;
    const sc = try npm.SemverConstraint.parse(">=3.1.0");
    try testing.expectEqual(npm.SemverConstraint.ConstraintType.gte, sc.type);
    try testing.expectEqual(@as(u32, 3), sc.major);
    try testing.expectEqual(@as(u32, 1), sc.minor);
    try testing.expectEqual(@as(u32, 0), sc.patch);
}

test "SemverConstraint.parse - wildcard" {
    const npm = lib.registry.npm;
    const sc = try npm.SemverConstraint.parse("*");
    try testing.expectEqual(npm.SemverConstraint.ConstraintType.any, sc.type);
}

test "SemverConstraint.parse - latest" {
    const npm = lib.registry.npm;
    const sc = try npm.SemverConstraint.parse("latest");
    try testing.expectEqual(npm.SemverConstraint.ConstraintType.any, sc.type);
}

test "SemverConstraint.parse - exact version" {
    const npm = lib.registry.npm;
    const sc = try npm.SemverConstraint.parse("1.0.0");
    try testing.expectEqual(npm.SemverConstraint.ConstraintType.exact, sc.type);
    try testing.expectEqual(@as(u32, 1), sc.major);
    try testing.expectEqual(@as(u32, 0), sc.minor);
    try testing.expectEqual(@as(u32, 0), sc.patch);
}

test "SemverConstraint.parse - gt constraint" {
    const npm = lib.registry.npm;
    const sc = try npm.SemverConstraint.parse(">1.0.0");
    try testing.expectEqual(npm.SemverConstraint.ConstraintType.gt, sc.type);
}

test "SemverConstraint.parse - lt constraint" {
    const npm = lib.registry.npm;
    const sc = try npm.SemverConstraint.parse("<2.0.0");
    try testing.expectEqual(npm.SemverConstraint.ConstraintType.lt, sc.type);
    try testing.expectEqual(@as(u32, 2), sc.major);
}

test "SemverConstraint.parse - lte constraint" {
    const npm = lib.registry.npm;
    const sc = try npm.SemverConstraint.parse("<=5.0.0");
    try testing.expectEqual(npm.SemverConstraint.ConstraintType.lte, sc.type);
    try testing.expectEqual(@as(u32, 5), sc.major);
}

test "SemverConstraint.satisfies - caret range boundaries" {
    const npm = lib.registry.npm;
    const sc = try npm.SemverConstraint.parse("^1.2.3");
    try testing.expect(sc.satisfies("1.2.3")); // exact match
    try testing.expect(sc.satisfies("1.2.4")); // patch bump
    try testing.expect(sc.satisfies("1.3.0")); // minor bump
    try testing.expect(sc.satisfies("1.99.99")); // max minor
    try testing.expect(!sc.satisfies("2.0.0")); // major bump
    try testing.expect(!sc.satisfies("1.2.2")); // below min
    try testing.expect(!sc.satisfies("0.9.0")); // different major
}

test "SemverConstraint.satisfies - tilde range boundaries" {
    const npm = lib.registry.npm;
    const sc = try npm.SemverConstraint.parse("~1.2.0");
    try testing.expect(sc.satisfies("1.2.0")); // exact
    try testing.expect(sc.satisfies("1.2.5")); // patch bump
    try testing.expect(sc.satisfies("1.2.99")); // max patch
    try testing.expect(!sc.satisfies("1.3.0")); // minor bump
    try testing.expect(!sc.satisfies("1.1.0")); // below minor
}

test "SemverConstraint.satisfies - comparison operators" {
    const npm = lib.registry.npm;
    {
        const sc = try npm.SemverConstraint.parse(">=2.0.0");
        try testing.expect(sc.satisfies("2.0.0"));
        try testing.expect(sc.satisfies("3.0.0"));
        try testing.expect(!sc.satisfies("1.9.9"));
    }
    {
        const sc = try npm.SemverConstraint.parse(">2.0.0");
        try testing.expect(!sc.satisfies("2.0.0"));
        try testing.expect(sc.satisfies("2.0.1"));
    }
    {
        const sc = try npm.SemverConstraint.parse("<2.0.0");
        try testing.expect(sc.satisfies("1.9.9"));
        try testing.expect(!sc.satisfies("2.0.0"));
    }
    {
        const sc = try npm.SemverConstraint.parse("<=2.0.0");
        try testing.expect(sc.satisfies("2.0.0"));
        try testing.expect(sc.satisfies("1.0.0"));
        try testing.expect(!sc.satisfies("2.0.1"));
    }
}

test "SemverConstraint.parseVersion - with v prefix" {
    const npm = lib.registry.npm;
    const v = try npm.SemverConstraint.parseVersion("v1.2.3");
    try testing.expectEqual(@as(u32, 1), v.major);
    try testing.expectEqual(@as(u32, 2), v.minor);
    try testing.expectEqual(@as(u32, 3), v.patch);
}

test "SemverConstraint.parseVersion - with prerelease" {
    const npm = lib.registry.npm;
    const v = try npm.SemverConstraint.parseVersion("1.2.3-beta.1");
    try testing.expectEqual(@as(u32, 1), v.major);
    try testing.expectEqual(@as(u32, 2), v.minor);
    try testing.expectEqual(@as(u32, 3), v.patch);
}

test "SemverConstraint.parseVersion - partial versions" {
    const npm = lib.registry.npm;
    {
        const v = try npm.SemverConstraint.parseVersion("1");
        try testing.expectEqual(@as(u32, 1), v.major);
        try testing.expectEqual(@as(u32, 0), v.minor);
        try testing.expectEqual(@as(u32, 0), v.patch);
    }
    {
        const v = try npm.SemverConstraint.parseVersion("1.2");
        try testing.expectEqual(@as(u32, 1), v.major);
        try testing.expectEqual(@as(u32, 2), v.minor);
        try testing.expectEqual(@as(u32, 0), v.patch);
    }
}

// ============================================================================
// Patch Command Tests (validation, no stdout)
// Note: Commands that call style.print cannot be tested in the Zig test runner
// because the test runner uses --listen=- (IPC over stdout). Tests that write
// to stdout corrupt the IPC protocol.
// ============================================================================

test "Patch - no args returns usage error" {
    const allocator = testing.allocator;
    var result = try lib.commands.patchCommand(allocator, &[_][]const u8{}, false);
    defer result.deinit(allocator);
    try testing.expectEqual(@as(u8, 1), result.exit_code);
    try testing.expect(result.message != null);
}

test "Patch - commit no args returns usage error" {
    const allocator = testing.allocator;
    var result = try lib.commands.patchCommand(allocator, &[_][]const u8{}, true);
    defer result.deinit(allocator);
    try testing.expectEqual(@as(u8, 1), result.exit_code);
    try testing.expect(result.message != null);
}
