//! Regression Tests for Catalogs
//!
//! These tests capture and prevent regressions from previously fixed bugs
//! and ensure backwards compatibility.

const std = @import("std");
const testing = std.testing;
const lib = @import("lib");

// ============================================================================
// Regression Test Registry
// ============================================================================

/// Regression test metadata
const RegressionTest = struct {
    id: []const u8,
    description: []const u8,
    date_fixed: []const u8,
    test_fn: *const fn () anyerror!void,
};

// ============================================================================
// Bug Fix Regressions
// ============================================================================

test "regression: empty catalog name should work for default catalog" {
    // Ensures empty string is valid for default catalog name
    const allocator = testing.allocator;

    var catalog = lib.deps.catalogs.Catalog.init(allocator, try allocator.dupe(u8, ""));
    defer catalog.deinit();

    try catalog.addVersion("test", "^1.0.0");
    try testing.expectEqualStrings("", catalog.name);
}

test "regression: getCatalogName with whitespace-only returns empty string" {
    // Bug: getCatalogName("catalog:  ") should return "" not "  "
    const name = lib.deps.catalogs.CatalogManager.getCatalogName("catalog:  ");
    try testing.expect(name != null);
    try testing.expectEqualStrings("", name.?);
}

test "regression: resolveCatalogReference with whitespace resolves to default" {
    // Bug: "catalog: " (with space) should resolve to default catalog
    const allocator = testing.allocator;

    var manager = lib.deps.CatalogManager.init(allocator);
    defer manager.deinit();

    var catalog = lib.deps.catalogs.Catalog.init(allocator, try allocator.dupe(u8, ""));
    try catalog.addVersion("react", "^18.0.0");
    manager.setDefaultCatalog(catalog);

    // All these should resolve to default catalog
    const refs = [_][]const u8{ "catalog:", "catalog: ", "catalog:  ", "catalog:\t", "catalog:\n" };

    for (refs) |ref| {
        const version = manager.resolveCatalogReference("react", ref);
        try testing.expect(version != null);
        try testing.expectEqualStrings("^18.0.0", version.?);
    }
}

test "regression: setDefaultCatalog properly frees old catalog" {
    // Bug: Memory leak when replacing default catalog
    const allocator = testing.allocator;

    var manager = lib.deps.CatalogManager.init(allocator);
    defer manager.deinit();

    // Set first catalog
    var catalog1 = lib.deps.catalogs.Catalog.init(allocator, try allocator.dupe(u8, ""));
    try catalog1.addVersion("pkg1", "^1.0.0");
    manager.setDefaultCatalog(catalog1);

    // Replace with second - should free first
    var catalog2 = lib.deps.catalogs.Catalog.init(allocator, try allocator.dupe(u8, ""));
    try catalog2.addVersion("pkg2", "^2.0.0");
    manager.setDefaultCatalog(catalog2);

    // First package should no longer be accessible
    const v1 = manager.resolveCatalogReference("pkg1", "catalog:");
    try testing.expect(v1 == null);

    // Second package should be accessible
    const v2 = manager.resolveCatalogReference("pkg2", "catalog:");
    try testing.expect(v2 != null);
}

test "regression: addVersion with duplicate key frees old value" {
    // Bug: Memory leak when updating existing package version
    const allocator = testing.allocator;

    var catalog = lib.deps.catalogs.Catalog.init(allocator, try allocator.dupe(u8, ""));
    defer catalog.deinit();

    // Add first version
    try catalog.addVersion("pkg", "^1.0.0");

    // Update to second version - should free first
    try catalog.addVersion("pkg", "^2.0.0");

    // Should have second version
    const version = catalog.getVersion("pkg");
    try testing.expect(version != null);
    try testing.expectEqualStrings("^2.0.0", version.?);

    // Should only have one entry
    try testing.expectEqual(@as(usize, 1), catalog.versions.count());
}

test "regression: invalid versions are skipped with warning" {
    // Bug: Invalid versions should not crash parsing
    const allocator = testing.allocator;

    const json =
        \\{
        \\  "catalog": {
        \\    "valid": "^1.0.0",
        \\    "invalid": "!!!not-valid!!!"
        \\  }
        \\}
    ;

    const parsed = try std.json.parseFromSlice(std.json.Value, allocator, json, .{});
    defer parsed.deinit();

    var manager = try lib.deps.parseFromPackageJson(allocator, parsed);
    defer manager.deinit();

    // Valid package should exist
    try testing.expect(manager.resolveCatalogReference("valid", "catalog:") != null);

    // Invalid package should be skipped
    try testing.expect(manager.resolveCatalogReference("invalid", "catalog:") == null);
}

test "regression: non-string versions are skipped without crashing" {
    // Bug: Non-string version values should be ignored
    const allocator = testing.allocator;

    const json =
        \\{
        \\  "catalog": {
        \\    "pkg1": 123,
        \\    "pkg2": true,
        \\    "pkg3": null,
        \\    "pkg4": [],
        \\    "pkg5": {},
        \\    "valid": "^1.0.0"
        \\  }
        \\}
    ;

    const parsed = try std.json.parseFromSlice(std.json.Value, allocator, json, .{});
    defer parsed.deinit();

    var manager = try lib.deps.parseFromPackageJson(allocator, parsed);
    defer manager.deinit();

    // Only valid package should exist
    try testing.expectEqual(@as(usize, 1), manager.default_catalog.?.versions.count());
}

test "regression: empty catalogs are not added to named catalogs" {
    // Bug: Catalog with no valid packages should not be added
    const allocator = testing.allocator;

    const json =
        \\{
        \\  "catalogs": {
        \\    "empty": {},
        \\    "all-invalid": {
        \\      "pkg1": 123,
        \\      "pkg2": "!!!invalid!!!"
        \\    }
        \\  }
        \\}
    ;

    const parsed = try std.json.parseFromSlice(std.json.Value, allocator, json, .{});
    defer parsed.deinit();

    var manager = try lib.deps.parseFromPackageJson(allocator, parsed);
    defer manager.deinit();

    // No named catalogs should exist
    try testing.expectEqual(@as(usize, 0), manager.named_catalogs.count());
}

// ============================================================================
// API Compatibility Regressions
// ============================================================================

test "regression: isCatalogReference returns bool not optional" {
    // Ensures API returns bool, not ?bool
    const result = lib.deps.catalogs.CatalogManager.isCatalogReference("catalog:");
    const _: bool = result; // Type check
    try testing.expect(result);
}

test "regression: getCatalogName returns optional string" {
    // Ensures API returns ?[]const u8, not []const u8
    const result = lib.deps.catalogs.CatalogManager.getCatalogName("catalog:test");
    const _: ?[]const u8 = result; // Type check
    try testing.expect(result != null);
}

test "regression: resolveCatalogReference returns optional string" {
    // Ensures API returns ?[]const u8 for missing packages
    const allocator = testing.allocator;

    var manager = lib.deps.CatalogManager.init(allocator);
    defer manager.deinit();

    const result = manager.resolveCatalogReference("missing", "catalog:");
    const _: ?[]const u8 = result; // Type check
    try testing.expect(result == null);
}

test "regression: getVersion takes const pointer" {
    // Ensures getVersion works with const catalogs
    const allocator = testing.allocator;

    var catalog = lib.deps.catalogs.Catalog.init(allocator, try allocator.dupe(u8, ""));
    defer catalog.deinit();

    try catalog.addVersion("test", "^1.0.0");

    const const_catalog: *const lib.deps.catalogs.Catalog = &catalog;
    const version = const_catalog.getVersion("test");
    try testing.expect(version != null);
}

test "regression: hasPackage takes const pointer" {
    // Ensures hasPackage works with const catalogs
    const allocator = testing.allocator;

    var catalog = lib.deps.catalogs.Catalog.init(allocator, try allocator.dupe(u8, ""));
    defer catalog.deinit();

    try catalog.addVersion("test", "^1.0.0");

    const const_catalog: *const lib.deps.catalogs.Catalog = &catalog;
    const has = const_catalog.hasPackage("test");
    try testing.expect(has);
}

// ============================================================================
// Behavior Regressions
// ============================================================================

test "regression: workspaces.catalog takes precedence over top-level" {
    // Ensures precedence order is maintained
    const allocator = testing.allocator;

    const json =
        \\{
        \\  "catalog": {"pkg": "^1.0.0"},
        \\  "workspaces": {"catalog": {"pkg": "^2.0.0"}}
        \\}
    ;

    const parsed = try std.json.parseFromSlice(std.json.Value, allocator, json, .{});
    defer parsed.deinit();

    var manager = try lib.deps.parseFromPackageJson(allocator, parsed);
    defer manager.deinit();

    const version = manager.resolveCatalogReference("pkg", "catalog:");
    try testing.expect(version != null);
    try testing.expectEqualStrings("^2.0.0", version.?);
}

test "regression: named catalogs merge from both locations" {
    // Ensures named catalogs from top-level and workspaces are both accessible
    const allocator = testing.allocator;

    const json =
        \\{
        \\  "catalogs": {"top": {"pkg1": "^1.0.0"}},
        \\  "workspaces": {"catalogs": {"ws": {"pkg2": "^2.0.0"}}}
        \\}
    ;

    const parsed = try std.json.parseFromSlice(std.json.Value, allocator, json, .{});
    defer parsed.deinit();

    var manager = try lib.deps.parseFromPackageJson(allocator, parsed);
    defer manager.deinit();

    try testing.expectEqual(@as(usize, 2), manager.named_catalogs.count());

    try testing.expect(manager.resolveCatalogReference("pkg1", "catalog:top") != null);
    try testing.expect(manager.resolveCatalogReference("pkg2", "catalog:ws") != null);
}

test "regression: non-object workspaces field is ignored" {
    // Ensures workspaces array doesn't crash parsing
    const allocator = testing.allocator;

    const json =
        \\{
        \\  "workspaces": ["packages/*"],
        \\  "catalog": {"pkg": "^1.0.0"}
        \\}
    ;

    const parsed = try std.json.parseFromSlice(std.json.Value, allocator, json, .{});
    defer parsed.deinit();

    var manager = try lib.deps.parseFromPackageJson(allocator, parsed);
    defer manager.deinit();

    // Should still parse top-level catalog
    const version = manager.resolveCatalogReference("pkg", "catalog:");
    try testing.expect(version != null);
}

// ============================================================================
// Version Validation Regressions
// ============================================================================

test "regression: isValidVersion accepts all semver operators" {
    const operators = [_][]const u8{ "^", "~", ">", "<", ">=", "<=", "=" };

    for (operators) |op| {
        const version = try std.fmt.allocPrint(testing.allocator, "{s}1.0.0", .{op});
        defer testing.allocator.free(version);

        try testing.expect(lib.deps.catalogs.isValidVersion(version));
    }
}

test "regression: isValidVersion accepts special keywords" {
    const keywords = [_][]const u8{ "latest", "*", "next" };

    for (keywords) |keyword| {
        try testing.expect(lib.deps.catalogs.isValidVersion(keyword));
    }
}

test "regression: isValidVersion accepts GitHub URLs" {
    const urls = [_][]const u8{
        "github:owner/repo",
        "https://github.com/owner/repo",
        "git+https://github.com/owner/repo.git",
    };

    for (urls) |url| {
        try testing.expect(lib.deps.catalogs.isValidVersion(url));
    }
}

test "regression: isValidVersion accepts workspace protocol" {
    const versions = [_][]const u8{ "workspace:*", "workspace:^", "workspace:~" };

    for (versions) |version| {
        try testing.expect(lib.deps.catalogs.isValidVersion(version));
    }
}

test "regression: isValidVersion rejects empty string" {
    try testing.expect(!lib.deps.catalogs.isValidVersion(""));
}

test "regression: isValidVersion rejects invalid text" {
    const invalid = [_][]const u8{
        "invalid",
        "random-text",
        "!!!",
        "@@@",
        "###",
    };

    for (invalid) |version| {
        try testing.expect(!lib.deps.catalogs.isValidVersion(version));
    }
}

// ============================================================================
// Performance Regressions
// ============================================================================

test "regression: large catalog lookups remain O(1)" {
    // Ensures performance doesn't degrade with catalog size
    const allocator = testing.allocator;

    var catalog = lib.deps.catalogs.Catalog.init(allocator, try allocator.dupe(u8, ""));
    defer catalog.deinit();

    // Add many packages
    const sizes = [_]usize{ 10, 100, 1000, 5000 };

    for (sizes) |size| {
        // Clear and rebuild catalog
        var it = catalog.versions.iterator();
        while (it.next()) |entry| {
            allocator.free(entry.key_ptr.*);
            allocator.free(entry.value_ptr.*);
        }
        catalog.versions.clearRetainingCapacity();

        // Add packages
        for (0..size) |i| {
            const pkg = try std.fmt.allocPrint(allocator, "pkg-{d}", .{i});
            defer allocator.free(pkg);
            try catalog.addVersion(pkg, "^1.0.0");
        }

        // Time lookups
        const start = std.time.nanoTimestamp();
        const num_lookups = 100;

        for (0..num_lookups) |i| {
            const pkg = try std.fmt.allocPrint(allocator, "pkg-{d}", .{i % size});
            defer allocator.free(pkg);
            _ = catalog.getVersion(pkg);
        }

        const end = std.time.nanoTimestamp();
        const duration_ns = end - start;
        const ns_per_lookup = @divFloor(duration_ns, num_lookups);

        // Each lookup should be < 1000ns (1μs) regardless of catalog size
        try testing.expect(ns_per_lookup < 1000);
    }
}

// ============================================================================
// Documentation Examples Regressions
// ============================================================================

test "regression: documentation example - basic usage works" {
    // Ensures the basic example from docs continues to work
    const allocator = testing.allocator;

    const json =
        \\{
        \\  "workspaces": {
        \\    "catalog": {
        \\      "react": "^19.0.0"
        \\    }
        \\  }
        \\}
    ;

    const parsed = try std.json.parseFromSlice(std.json.Value, allocator, json, .{});
    defer parsed.deinit();

    var manager = try lib.deps.parseFromPackageJson(allocator, parsed);
    defer manager.deinit();

    const version = manager.resolveCatalogReference("react", "catalog:");
    try testing.expect(version != null);
    try testing.expectEqualStrings("^19.0.0", version.?);
}

test "regression: documentation example - named catalogs work" {
    // Ensures named catalog example from docs continues to work
    const allocator = testing.allocator;

    const json =
        \\{
        \\  "workspaces": {
        \\    "catalogs": {
        \\      "testing": {
        \\        "jest": "30.0.0"
        \\      }
        \\    }
        \\  }
        \\}
    ;

    const parsed = try std.json.parseFromSlice(std.json.Value, allocator, json, .{});
    defer parsed.deinit();

    var manager = try lib.deps.parseFromPackageJson(allocator, parsed);
    defer manager.deinit();

    const version = manager.resolveCatalogReference("jest", "catalog:testing");
    try testing.expect(version != null);
    try testing.expectEqualStrings("30.0.0", version.?);
}
