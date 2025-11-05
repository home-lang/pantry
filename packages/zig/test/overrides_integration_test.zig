//! Overrides and Resolutions Integration Tests
//!
//! These tests verify that overrides and resolutions work correctly
//! in the context of the full install pipeline.

const std = @import("std");
const testing = std.testing;
const lib = @import("lib");

test "overrides module exports correctly" {

    // Verify that overrides module is exported
    _ = lib.deps.overrides;
    _ = lib.deps.OverrideMap;
    _ = lib.deps.parseOverrides;
}

test "parse package.json with npm overrides" {
    const allocator = testing.allocator;

    const package_json =
        \\{
        \\  "name": "test-app",
        \\  "version": "1.0.0",
        \\  "dependencies": {
        \\    "foo": "^2.0.0",
        \\    "bar": "^1.0.0"
        \\  },
        \\  "overrides": {
        \\    "baz": "~4.4.0",
        \\    "qux": "^1.2.3"
        \\  }
        \\}
    ;

    const parsed = try std.json.parseFromSlice(std.json.Value, allocator, package_json, .{});
    defer parsed.deinit();

    var override_map = try lib.deps.parseOverrides(allocator, parsed);
    defer override_map.deinit();

    // Verify overrides were parsed
    try testing.expectEqual(@as(usize, 2), override_map.count());
    try testing.expect(override_map.hasOverride("baz"));
    try testing.expect(override_map.hasOverride("qux"));

    // Verify values
    const baz_override = override_map.getOverride("baz");
    try testing.expect(baz_override != null);
    try testing.expectEqualStrings("~4.4.0", baz_override.?);

    const qux_override = override_map.getOverride("qux");
    try testing.expect(qux_override != null);
    try testing.expectEqualStrings("^1.2.3", qux_override.?);
}

test "parse package.json with yarn resolutions" {
    const allocator = testing.allocator;
    

    const package_json =
        \\{
        \\  "name": "test-app",
        \\  "version": "1.0.0",
        \\  "dependencies": {
        \\    "foo": "^2.0.0"
        \\  },
        \\  "resolutions": {
        \\    "bar": "~4.4.0"
        \\  }
        \\}
    ;

    const parsed = try std.json.parseFromSlice(std.json.Value, allocator, package_json, .{});
    defer parsed.deinit();

    var override_map = try lib.deps.parseOverrides(allocator, parsed);
    defer override_map.deinit();

    // Verify resolutions were parsed
    try testing.expectEqual(@as(usize, 1), override_map.count());
    try testing.expect(override_map.hasOverride("bar"));

    const bar_override = override_map.getOverride("bar");
    try testing.expect(bar_override != null);
    try testing.expectEqualStrings("~4.4.0", bar_override.?);
}

test "parse package.json with both overrides and resolutions" {
    const allocator = testing.allocator;
    

    const package_json =
        \\{
        \\  "name": "test-app",
        \\  "overrides": {
        \\    "foo": "^1.0.0",
        \\    "bar": "~2.0.0"
        \\  },
        \\  "resolutions": {
        \\    "baz": "^3.0.0"
        \\  }
        \\}
    ;

    const parsed = try std.json.parseFromSlice(std.json.Value, allocator, package_json, .{});
    defer parsed.deinit();

    var override_map = try lib.deps.parseOverrides(allocator, parsed);
    defer override_map.deinit();

    // Both should be merged
    try testing.expectEqual(@as(usize, 3), override_map.count());
    try testing.expect(override_map.hasOverride("foo"));
    try testing.expect(override_map.hasOverride("bar"));
    try testing.expect(override_map.hasOverride("baz"));
}

test "version range validation" {
    

    // Valid version ranges
    try testing.expect(lib.deps.overrides.isValidVersionRange("1.2.3"));
    try testing.expect(lib.deps.overrides.isValidVersionRange("^1.2.3"));
    try testing.expect(lib.deps.overrides.isValidVersionRange("~1.2.3"));
    try testing.expect(lib.deps.overrides.isValidVersionRange(">1.2.3"));
    try testing.expect(lib.deps.overrides.isValidVersionRange(">=1.2.3"));
    try testing.expect(lib.deps.overrides.isValidVersionRange("<2.0.0"));
    try testing.expect(lib.deps.overrides.isValidVersionRange("<=1.9.9"));
    try testing.expect(lib.deps.overrides.isValidVersionRange("latest"));
    try testing.expect(lib.deps.overrides.isValidVersionRange("*"));
    try testing.expect(lib.deps.overrides.isValidVersionRange("next"));

    // GitHub references
    try testing.expect(lib.deps.overrides.isValidVersionRange("github:owner/repo#ref"));
    try testing.expect(lib.deps.overrides.isValidVersionRange("https://github.com/owner/repo#ref"));
    try testing.expect(lib.deps.overrides.isValidVersionRange("git+https://github.com/owner/repo.git"));

    // Invalid version ranges
    try testing.expect(!lib.deps.overrides.isValidVersionRange(""));
    try testing.expect(!lib.deps.overrides.isValidVersionRange("invalid"));
    try testing.expect(!lib.deps.overrides.isValidVersionRange("not-a-version"));
}

test "apply override to dependency" {
    const allocator = testing.allocator;
    

    var override_map = lib.deps.OverrideMap.init(allocator);
    defer override_map.deinit();

    try override_map.addOverride("foo", "^2.0.0");
    try override_map.addOverride("bar", "~3.0.0");

    // Test applying overrides
    const foo_result = lib.deps.overrides.applyOverride(&override_map, "foo", "^1.0.0");
    try testing.expectEqualStrings("^2.0.0", foo_result);

    const bar_result = lib.deps.overrides.applyOverride(&override_map, "bar", "^2.5.0");
    try testing.expectEqualStrings("~3.0.0", bar_result);

    // Package without override should return original version
    const baz_result = lib.deps.overrides.applyOverride(&override_map, "baz", "^1.0.0");
    try testing.expectEqualStrings("^1.0.0", baz_result);
}

test "override with security vulnerability scenario" {
    const allocator = testing.allocator;
    

    // Simulate security vulnerability scenario:
    // - foo@2.0.0 depends on bar@4.5.6
    // - bar@4.5.6 has security vulnerability
    // - Override bar to 4.4.0 (secure version)

    const package_json =
        \\{
        \\  "name": "secure-app",
        \\  "dependencies": {
        \\    "foo": "^2.0.0"
        \\  },
        \\  "overrides": {
        \\    "bar": "4.4.0"
        \\  }
        \\}
    ;

    const parsed = try std.json.parseFromSlice(std.json.Value, allocator, package_json, .{});
    defer parsed.deinit();

    var override_map = try lib.deps.parseOverrides(allocator, parsed);
    defer override_map.deinit();

    // Verify override exists for bar
    try testing.expect(override_map.hasOverride("bar"));

    // Apply override - bar@4.5.6 should become bar@4.4.0
    const result = lib.deps.overrides.applyOverride(&override_map, "bar", "^4.5.0");
    try testing.expectEqualStrings("4.4.0", result);
}

test "override with version consistency scenario" {
    const allocator = testing.allocator;
    

    // Simulate version consistency scenario:
    // - Multiple packages depend on different versions of lodash
    // - Override lodash to ensure all use the same version

    const package_json =
        \\{
        \\  "name": "consistent-app",
        \\  "dependencies": {
        \\    "package-a": "^1.0.0",
        \\    "package-b": "^2.0.0"
        \\  },
        \\  "overrides": {
        \\    "lodash": "^4.17.21"
        \\  }
        \\}
    ;

    const parsed = try std.json.parseFromSlice(std.json.Value, allocator, package_json, .{});
    defer parsed.deinit();

    var override_map = try lib.deps.parseOverrides(allocator, parsed);
    defer override_map.deinit();

    // Verify override exists
    try testing.expect(override_map.hasOverride("lodash"));

    // All lodash versions should be overridden to ^4.17.21
    const v1 = lib.deps.overrides.applyOverride(&override_map, "lodash", "^3.10.0");
    const v2 = lib.deps.overrides.applyOverride(&override_map, "lodash", "~4.16.0");
    const v3 = lib.deps.overrides.applyOverride(&override_map, "lodash", "^4.17.15");

    try testing.expectEqualStrings("^4.17.21", v1);
    try testing.expectEqualStrings("^4.17.21", v2);
    try testing.expectEqualStrings("^4.17.21", v3);
}

test "override with GitHub reference" {
    const allocator = testing.allocator;
    

    const package_json =
        \\{
        \\  "name": "github-override-app",
        \\  "overrides": {
        \\    "my-package": "github:owner/repo#v2.0.0-beta"
        \\  }
        \\}
    ;

    const parsed = try std.json.parseFromSlice(std.json.Value, allocator, package_json, .{});
    defer parsed.deinit();

    var override_map = try lib.deps.parseOverrides(allocator, parsed);
    defer override_map.deinit();

    // Verify GitHub override is parsed
    try testing.expect(override_map.hasOverride("my-package"));

    const override = override_map.getOverride("my-package");
    try testing.expect(override != null);
    try testing.expectEqualStrings("github:owner/repo#v2.0.0-beta", override.?);
}

test "skip invalid overrides" {
    const allocator = testing.allocator;
    

    const package_json =
        \\{
        \\  "name": "test-app",
        \\  "overrides": {
        \\    "valid-package": "^1.0.0",
        \\    "invalid-package": "not-a-version",
        \\    "another-valid": "~2.0.0"
        \\  }
        \\}
    ;

    const parsed = try std.json.parseFromSlice(std.json.Value, allocator, package_json, .{});
    defer parsed.deinit();

    var override_map = try lib.deps.parseOverrides(allocator, parsed);
    defer override_map.deinit();

    // Valid overrides should be parsed
    try testing.expect(override_map.hasOverride("valid-package"));
    try testing.expect(override_map.hasOverride("another-valid"));

    // Invalid override should be skipped
    try testing.expect(!override_map.hasOverride("invalid-package"));
}

test "empty overrides" {
    const allocator = testing.allocator;
    

    const package_json =
        \\{
        \\  "name": "test-app",
        \\  "dependencies": {
        \\    "foo": "^1.0.0"
        \\  }
        \\}
    ;

    const parsed = try std.json.parseFromSlice(std.json.Value, allocator, package_json, .{});
    defer parsed.deinit();

    var override_map = try lib.deps.parseOverrides(allocator, parsed);
    defer override_map.deinit();

    // Should have no overrides
    try testing.expectEqual(@as(usize, 0), override_map.count());
}
