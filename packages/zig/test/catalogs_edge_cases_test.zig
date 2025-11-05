//! Catalogs Edge Cases and Stress Tests
//!
//! These tests are designed to uncover potential issues with:
//! - Memory management
//! - Edge cases in parsing
//! - Malformed input handling
//! - Large-scale scenarios
//! - Interaction with other features

const std = @import("std");
const testing = std.testing;
const lib = @import("lib");

// ============================================================================
// Edge Case Tests - Unusual but valid inputs
// ============================================================================

test "catalog with empty string package names" {
    const allocator = testing.allocator;

    const json_content =
        \\{
        \\  "catalog": {
        \\    "": "1.0.0",
        \\    "valid-package": "2.0.0"
        \\  }
        \\}
    ;

    const parsed = try std.json.parseFromSlice(std.json.Value, allocator, json_content, .{});
    defer parsed.deinit();

    var manager = try lib.deps.parseCatalogs(allocator, parsed);
    defer manager.deinit();

    // Empty package name should still be stored
    const empty_version = manager.resolveCatalogReference("", "catalog:");
    try testing.expect(empty_version != null);
    try testing.expectEqualStrings("1.0.0", empty_version.?);

    // Valid package should work
    const valid_version = manager.resolveCatalogReference("valid-package", "catalog:");
    try testing.expect(valid_version != null);
    try testing.expectEqualStrings("2.0.0", valid_version.?);
}

test "catalog with unicode package names" {
    const allocator = testing.allocator;

    const json_content =
        \\{
        \\  "catalog": {
        \\    "react-测试": "^1.0.0",
        \\    "パッケージ": "^2.0.0",
        \\    "пакет": "^3.0.0"
        \\  }
        \\}
    ;

    const parsed = try std.json.parseFromSlice(std.json.Value, allocator, json_content, .{});
    defer parsed.deinit();

    var manager = try lib.deps.parseCatalogs(allocator, parsed);
    defer manager.deinit();

    // Unicode package names should work
    try testing.expectEqualStrings("^1.0.0", manager.resolveCatalogReference("react-测试", "catalog:").?);
    try testing.expectEqualStrings("^2.0.0", manager.resolveCatalogReference("パッケージ", "catalog:").?);
    try testing.expectEqualStrings("^3.0.0", manager.resolveCatalogReference("пакет", "catalog:").?);
}

test "catalog with special characters in names" {
    const allocator = testing.allocator;

    const json_content =
        \\{
        \\  "catalog": {
        \\    "@scope/package": "^1.0.0",
        \\    "package.name": "^2.0.0",
        \\    "package-name_v2": "^3.0.0",
        \\    "123-numbers": "^4.0.0"
        \\  }
        \\}
    ;

    const parsed = try std.json.parseFromSlice(std.json.Value, allocator, json_content, .{});
    defer parsed.deinit();

    var manager = try lib.deps.parseCatalogs(allocator, parsed);
    defer manager.deinit();

    try testing.expectEqualStrings("^1.0.0", manager.resolveCatalogReference("@scope/package", "catalog:").?);
    try testing.expectEqualStrings("^2.0.0", manager.resolveCatalogReference("package.name", "catalog:").?);
    try testing.expectEqualStrings("^3.0.0", manager.resolveCatalogReference("package-name_v2", "catalog:").?);
    try testing.expectEqualStrings("^4.0.0", manager.resolveCatalogReference("123-numbers", "catalog:").?);
}

test "catalog with very long package names" {
    const allocator = testing.allocator;

    // Create a very long package name (256+ characters)
    var long_name_buf: [300]u8 = undefined;
    for (0..299) |i| {
        long_name_buf[i] = 'a' + @as(u8, @intCast(i % 26));
    }
    long_name_buf[299] = 0;
    const long_name = long_name_buf[0..299];

    const json_str = try std.fmt.allocPrint(allocator,
        \\{{
        \\  "catalog": {{
        \\    "{s}": "^1.0.0"
        \\  }}
        \\}}
    , .{long_name});
    defer allocator.free(json_str);

    const parsed = try std.json.parseFromSlice(std.json.Value, allocator, json_str, .{});
    defer parsed.deinit();

    var manager = try lib.deps.parseCatalogs(allocator, parsed);
    defer manager.deinit();

    const version = manager.resolveCatalogReference(long_name, "catalog:");
    try testing.expect(version != null);
    try testing.expectEqualStrings("^1.0.0", version.?);
}

test "catalog with very long version strings" {
    const allocator = testing.allocator;

    // Create a very long version string
    var long_version_buf: [500]u8 = undefined;
    @memset(&long_version_buf, 'x');
    long_version_buf[0] = '^';
    const long_version = long_version_buf[0..499];

    const json_str = try std.fmt.allocPrint(allocator,
        \\{{
        \\  "catalog": {{
        \\    "test": "{s}"
        \\  }}
        \\}}
    , .{long_version});
    defer allocator.free(json_str);

    const parsed = try std.json.parseFromSlice(std.json.Value, allocator, json_str, .{});
    defer parsed.deinit();

    var manager = try lib.deps.parseCatalogs(allocator, parsed);
    defer manager.deinit();

    // Should be stored even if it's extremely long
    const version = manager.resolveCatalogReference("test", "catalog:");
    try testing.expect(version != null);
    try testing.expect(version.?.len == 499);
}

test "catalog name with special whitespace" {
    const allocator = testing.allocator;

    var manager = lib.deps.CatalogManager.init(allocator);
    defer manager.deinit();

    var catalog = lib.deps.catalogs.Catalog.init(allocator, try allocator.dupe(u8, ""));
    try catalog.addVersion("test", "^1.0.0");
    manager.setDefaultCatalog(catalog);

    // Various whitespace types should all resolve to default catalog
    try testing.expect(manager.resolveCatalogReference("test", "catalog:") != null);
    try testing.expect(manager.resolveCatalogReference("test", "catalog: ") != null);
    try testing.expect(manager.resolveCatalogReference("test", "catalog:  ") != null);
    try testing.expect(manager.resolveCatalogReference("test", "catalog:\t") != null);
    try testing.expect(manager.resolveCatalogReference("test", "catalog:\n") != null);
    try testing.expect(manager.resolveCatalogReference("test", "catalog:\r\n") != null);
}

test "catalog reference with mixed case" {
    const allocator = testing.allocator;

    var manager = lib.deps.CatalogManager.init(allocator);
    defer manager.deinit();

    var testing_catalog = lib.deps.catalogs.Catalog.init(allocator, try allocator.dupe(u8, "Testing"));
    try testing_catalog.addVersion("jest", "^29.0.0");
    try manager.addNamedCatalog("Testing", testing_catalog);

    // Catalog names are case-sensitive
    try testing.expect(manager.resolveCatalogReference("jest", "catalog:Testing") != null);
    try testing.expect(manager.resolveCatalogReference("jest", "catalog:testing") == null);
    try testing.expect(manager.resolveCatalogReference("jest", "catalog:TESTING") == null);
}

// ============================================================================
// Malformed Input Tests
// ============================================================================

test "catalog with non-string versions" {
    const allocator = testing.allocator;

    const json_content =
        \\{
        \\  "catalog": {
        \\    "number-version": 123,
        \\    "boolean-version": true,
        \\    "null-version": null,
        \\    "object-version": {"version": "1.0.0"},
        \\    "array-version": ["1.0.0"],
        \\    "valid-version": "^1.0.0"
        \\  }
        \\}
    ;

    const parsed = try std.json.parseFromSlice(std.json.Value, allocator, json_content, .{});
    defer parsed.deinit();

    var manager = try lib.deps.parseCatalogs(allocator, parsed);
    defer manager.deinit();

    // Non-string versions should be skipped
    try testing.expect(manager.resolveCatalogReference("number-version", "catalog:") == null);
    try testing.expect(manager.resolveCatalogReference("boolean-version", "catalog:") == null);
    try testing.expect(manager.resolveCatalogReference("null-version", "catalog:") == null);
    try testing.expect(manager.resolveCatalogReference("object-version", "catalog:") == null);
    try testing.expect(manager.resolveCatalogReference("array-version", "catalog:") == null);

    // Valid version should still work
    try testing.expectEqualStrings("^1.0.0", manager.resolveCatalogReference("valid-version", "catalog:").?);
}

test "catalog with empty object" {
    const allocator = testing.allocator;

    const json_content =
        \\{
        \\  "catalog": {}
        \\}
    ;

    const parsed = try std.json.parseFromSlice(std.json.Value, allocator, json_content, .{});
    defer parsed.deinit();

    var manager = try lib.deps.parseCatalogs(allocator, parsed);
    defer manager.deinit();

    // Should create empty catalog without crashing
    try testing.expect(manager.default_catalog != null);
}

test "catalogs with empty named catalog" {
    const allocator = testing.allocator;

    const json_content =
        \\{
        \\  "catalogs": {
        \\    "empty": {},
        \\    "valid": {
        \\      "jest": "^29.0.0"
        \\    }
        \\  }
        \\}
    ;

    const parsed = try std.json.parseFromSlice(std.json.Value, allocator, json_content, .{});
    defer parsed.deinit();

    var manager = try lib.deps.parseCatalogs(allocator, parsed);
    defer manager.deinit();

    // Empty catalog should be skipped, valid one should work
    try testing.expect(manager.named_catalogs.get("empty") == null);
    try testing.expect(manager.named_catalogs.get("valid") != null);
}

test "duplicate package names in same catalog" {
    const allocator = testing.allocator;

    // JSON should handle this by taking the last value
    const json_content =
        \\{
        \\  "catalog": {
        \\    "react": "^18.0.0",
        \\    "react": "^19.0.0"
        \\  }
        \\}
    ;

    const parsed = try std.json.parseFromSlice(std.json.Value, allocator, json_content, .{});
    defer parsed.deinit();

    var manager = try lib.deps.parseCatalogs(allocator, parsed);
    defer manager.deinit();

    // Should use the last value (JSON standard behavior)
    const version = manager.resolveCatalogReference("react", "catalog:");
    try testing.expect(version != null);
    // Note: JSON parsers typically use last value for duplicate keys
}

test "catalog with invalid version formats" {
    const allocator = testing.allocator;

    const json_content =
        \\{
        \\  "catalog": {
        \\    "invalid1": "not-a-version",
        \\    "invalid2": "!!!invalid",
        \\    "invalid3": "",
        \\    "valid": "^1.0.0"
        \\  }
        \\}
    ;

    const parsed = try std.json.parseFromSlice(std.json.Value, allocator, json_content, .{});
    defer parsed.deinit();

    var manager = try lib.deps.parseCatalogs(allocator, parsed);
    defer manager.deinit();

    // Invalid versions should be skipped with warnings
    try testing.expect(manager.resolveCatalogReference("invalid1", "catalog:") == null);
    try testing.expect(manager.resolveCatalogReference("invalid2", "catalog:") == null);
    try testing.expect(manager.resolveCatalogReference("invalid3", "catalog:") == null);

    // Valid version should work
    try testing.expectEqualStrings("^1.0.0", manager.resolveCatalogReference("valid", "catalog:").?);
}

// ============================================================================
// Large Scale Tests
// ============================================================================

test "catalog with many packages (stress test)" {
    const allocator = testing.allocator;

    var manager = lib.deps.CatalogManager.init(allocator);
    defer manager.deinit();

    var catalog = lib.deps.catalogs.Catalog.init(allocator, try allocator.dupe(u8, ""));

    // Add 1000 packages
    const num_packages = 1000;
    for (0..num_packages) |i| {
        const pkg_name = try std.fmt.allocPrint(allocator, "package-{d}", .{i});
        defer allocator.free(pkg_name);

        const version = try std.fmt.allocPrint(allocator, "^{d}.0.0", .{i % 100});
        defer allocator.free(version);

        try catalog.addVersion(pkg_name, version);
    }

    manager.setDefaultCatalog(catalog);

    // Verify random packages can be resolved
    const test_indices = [_]usize{ 0, 100, 500, 999 };
    for (test_indices) |i| {
        const pkg_name = try std.fmt.allocPrint(allocator, "package-{d}", .{i});
        defer allocator.free(pkg_name);

        const version = manager.resolveCatalogReference(pkg_name, "catalog:");
        try testing.expect(version != null);

        const expected = try std.fmt.allocPrint(allocator, "^{d}.0.0", .{i % 100});
        defer allocator.free(expected);

        try testing.expectEqualStrings(expected, version.?);
    }
}

test "many named catalogs (stress test)" {
    const allocator = testing.allocator;

    var manager = lib.deps.CatalogManager.init(allocator);
    defer manager.deinit();

    // Create 50 named catalogs
    const num_catalogs = 50;
    for (0..num_catalogs) |i| {
        const catalog_name = try std.fmt.allocPrint(allocator, "catalog-{d}", .{i});
        defer allocator.free(catalog_name);

        var catalog = lib.deps.catalogs.Catalog.init(allocator, try allocator.dupe(u8, catalog_name));

        // Add 20 packages to each catalog
        for (0..20) |j| {
            const pkg_name = try std.fmt.allocPrint(allocator, "pkg-{d}", .{j});
            defer allocator.free(pkg_name);

            const version = try std.fmt.allocPrint(allocator, "^{d}.0.0", .{j});
            defer allocator.free(version);

            try catalog.addVersion(pkg_name, version);
        }

        try manager.addNamedCatalog(catalog_name, catalog);
    }

    // Verify we can resolve from all catalogs
    for (0..num_catalogs) |i| {
        const catalog_name = try std.fmt.allocPrint(allocator, "catalog-{d}", .{i});
        defer allocator.free(catalog_name);

        const ref = try std.fmt.allocPrint(allocator, "catalog:{s}", .{catalog_name});
        defer allocator.free(ref);

        const version = manager.resolveCatalogReference("pkg-10", ref);
        try testing.expect(version != null);
        try testing.expectEqualStrings("^10.0.0", version.?);
    }
}

test "deeply nested JSON structure" {
    const allocator = testing.allocator;

    const json_content =
        \\{
        \\  "name": "test",
        \\  "nested": {
        \\    "more": {
        \\      "nesting": {
        \\        "workspaces": {
        \\          "catalog": {
        \\            "should-not-be-found": "1.0.0"
        \\          }
        \\        }
        \\      }
        \\    }
        \\  },
        \\  "workspaces": {
        \\    "catalog": {
        \\      "react": "^19.0.0"
        \\    }
        \\  }
        \\}
    ;

    const parsed = try std.json.parseFromSlice(std.json.Value, allocator, json_content, .{});
    defer parsed.deinit();

    var manager = try lib.deps.parseCatalogs(allocator, parsed);
    defer manager.deinit();

    // Should only find the top-level workspaces.catalog
    try testing.expectEqualStrings("^19.0.0", manager.resolveCatalogReference("react", "catalog:").?);
    try testing.expect(manager.resolveCatalogReference("should-not-be-found", "catalog:") == null);
}

// ============================================================================
// Interaction Tests
// ============================================================================

test "catalog and override both defined" {
    const allocator = testing.allocator;

    const json_content =
        \\{
        \\  "catalog": {
        \\    "react": "^19.0.0"
        \\  },
        \\  "overrides": {
        \\    "react": "^18.0.0"
        \\  }
        \\}
    ;

    const parsed = try std.json.parseFromSlice(std.json.Value, allocator, json_content, .{});
    defer parsed.deinit();

    // Parse both
    var catalog_manager = try lib.deps.parseCatalogs(allocator, parsed);
    defer catalog_manager.deinit();

    var override_map = try lib.deps.parseOverrides(allocator, parsed);
    defer override_map.deinit();

    // Both should work independently
    try testing.expectEqualStrings("^19.0.0", catalog_manager.resolveCatalogReference("react", "catalog:").?);
    try testing.expectEqualStrings("^18.0.0", override_map.getOverride("react").?);
}

test "catalog reference lookup performance" {
    const allocator = testing.allocator;

    var manager = lib.deps.CatalogManager.init(allocator);
    defer manager.deinit();

    var catalog = lib.deps.catalogs.Catalog.init(allocator, try allocator.dupe(u8, ""));

    // Add many packages
    for (0..500) |i| {
        const pkg_name = try std.fmt.allocPrint(allocator, "package-{d}", .{i});
        defer allocator.free(pkg_name);
        try catalog.addVersion(pkg_name, "^1.0.0");
    }

    manager.setDefaultCatalog(catalog);

    // Measure lookup time (should be fast - O(1) hash lookups)
    const start = std.time.microTimestamp();

    for (0..1000) |i| {
        const pkg_name = try std.fmt.allocPrint(allocator, "package-{d}", .{i % 500});
        defer allocator.free(pkg_name);
        _ = manager.resolveCatalogReference(pkg_name, "catalog:");
    }

    const end = std.time.microTimestamp();
    const duration_us = end - start;

    // 1000 lookups should complete in under 10ms (10000 microseconds)
    std.debug.print("\nPerformance: 1000 catalog lookups took {d}μs\n", .{duration_us});
    try testing.expect(duration_us < 10000);
}

// ============================================================================
// Memory Safety Tests
// ============================================================================

test "catalog deinit properly frees memory" {
    const allocator = testing.allocator;

    // Create and destroy many times to check for leaks
    for (0..10) |_| {
        var manager = lib.deps.CatalogManager.init(allocator);

        var catalog = lib.deps.catalogs.Catalog.init(allocator, try allocator.dupe(u8, ""));
        try catalog.addVersion("test", "^1.0.0");
        manager.setDefaultCatalog(catalog);

        var named_catalog = lib.deps.catalogs.Catalog.init(allocator, try allocator.dupe(u8, "testing"));
        try named_catalog.addVersion("jest", "^29.0.0");
        try manager.addNamedCatalog("testing", named_catalog);

        manager.deinit();
    }
}

test "replacing default catalog frees old one" {
    const allocator = testing.allocator;

    var manager = lib.deps.CatalogManager.init(allocator);
    defer manager.deinit();

    // Set first catalog
    var catalog1 = lib.deps.catalogs.Catalog.init(allocator, try allocator.dupe(u8, ""));
    try catalog1.addVersion("test", "^1.0.0");
    manager.setDefaultCatalog(catalog1);

    // Replace with second catalog - should free first
    var catalog2 = lib.deps.catalogs.Catalog.init(allocator, try allocator.dupe(u8, ""));
    try catalog2.addVersion("test", "^2.0.0");
    manager.setDefaultCatalog(catalog2);

    // Should use second catalog
    try testing.expectEqualStrings("^2.0.0", manager.resolveCatalogReference("test", "catalog:").?);
}

// ============================================================================
// Protocol Edge Cases
// ============================================================================

test "catalog protocol with no colon" {
    const allocator = testing.allocator;

    // "catalog" without colon is NOT a catalog reference
    try testing.expect(!lib.deps.catalogs.CatalogManager.isCatalogReference("catalog"));
    try testing.expect(!lib.deps.catalogs.CatalogManager.isCatalogReference("catalogtest"));
    try testing.expect(!lib.deps.catalogs.CatalogManager.isCatalogReference("testcatalog:"));
}

test "catalog protocol with multiple colons" {
    const allocator = testing.allocator;

    var manager = lib.deps.CatalogManager.init(allocator);
    defer manager.deinit();

    var catalog = lib.deps.catalogs.Catalog.init(allocator, try allocator.dupe(u8, "name:with:colons"));
    try catalog.addVersion("test", "^1.0.0");
    try manager.addNamedCatalog("name:with:colons", catalog);

    // Should handle catalog names with colons
    const version = manager.resolveCatalogReference("test", "catalog:name:with:colons");
    try testing.expect(version != null);
    try testing.expectEqualStrings("^1.0.0", version.?);
}

test "catalog reference case sensitivity" {
    const allocator = testing.allocator;

    // Protocol itself should be case-sensitive (lowercase only)
    try testing.expect(lib.deps.catalogs.CatalogManager.isCatalogReference("catalog:"));
    try testing.expect(!lib.deps.catalogs.CatalogManager.isCatalogReference("Catalog:"));
    try testing.expect(!lib.deps.catalogs.CatalogManager.isCatalogReference("CATALOG:"));
    try testing.expect(!lib.deps.catalogs.CatalogManager.isCatalogReference("CaTaLoG:"));
}

// ============================================================================
// Boundary Value Tests
// ============================================================================

test "catalog with zero packages" {
    const allocator = testing.allocator;

    var catalog = lib.deps.catalogs.Catalog.init(allocator, try allocator.dupe(u8, "empty"));
    defer catalog.deinit();

    // Should handle empty catalog gracefully
    try testing.expect(!catalog.hasPackage("anything"));
    try testing.expect(catalog.getVersion("anything") == null);
}

test "catalog name with maximum practical length" {
    const allocator = testing.allocator;

    // Create a 1000-character catalog name
    var long_name_buf: [1000]u8 = undefined;
    @memset(&long_name_buf, 'x');
    const long_name = long_name_buf[0..];

    var manager = lib.deps.CatalogManager.init(allocator);
    defer manager.deinit();

    var catalog = lib.deps.catalogs.Catalog.init(allocator, try allocator.dupe(u8, long_name));
    try catalog.addVersion("test", "^1.0.0");
    try manager.addNamedCatalog(long_name, catalog);

    const ref = try std.fmt.allocPrint(allocator, "catalog:{s}", .{long_name});
    defer allocator.free(ref);

    const version = manager.resolveCatalogReference("test", ref);
    try testing.expect(version != null);
    try testing.expectEqualStrings("^1.0.0", version.?);
}

test "resolving non-existent package in valid catalog" {
    const allocator = testing.allocator;

    var manager = lib.deps.CatalogManager.init(allocator);
    defer manager.deinit();

    var catalog = lib.deps.catalogs.Catalog.init(allocator, try allocator.dupe(u8, ""));
    try catalog.addVersion("exists", "^1.0.0");
    manager.setDefaultCatalog(catalog);

    // Should return null for non-existent packages
    try testing.expect(manager.resolveCatalogReference("does-not-exist", "catalog:") == null);
    try testing.expect(manager.resolveCatalogReference("", "catalog:") == null);
    try testing.expect(manager.resolveCatalogReference("exists", "catalog:") != null);
}

test "catalog with all version range formats" {
    const allocator = testing.allocator;

    const json_content =
        \\{
        \\  "catalog": {
        \\    "exact": "1.2.3",
        \\    "caret": "^1.2.3",
        \\    "tilde": "~1.2.3",
        \\    "gt": ">1.2.3",
        \\    "gte": ">=1.2.3",
        \\    "lt": "<2.0.0",
        \\    "lte": "<=1.9.9",
        \\    "latest": "latest",
        \\    "next": "next",
        \\    "wildcard": "*",
        \\    "github-short": "github:owner/repo",
        \\    "github-full": "https://github.com/owner/repo#main",
        \\    "git": "git+https://github.com/owner/repo.git",
        \\    "workspace": "workspace:*",
        \\    "workspace-ver": "workspace:^1.0.0"
        \\  }
        \\}
    ;

    const parsed = try std.json.parseFromSlice(std.json.Value, allocator, json_content, .{});
    defer parsed.deinit();

    var manager = try lib.deps.parseCatalogs(allocator, parsed);
    defer manager.deinit();

    // All should be parseable and retrievable
    try testing.expect(manager.resolveCatalogReference("exact", "catalog:") != null);
    try testing.expect(manager.resolveCatalogReference("caret", "catalog:") != null);
    try testing.expect(manager.resolveCatalogReference("tilde", "catalog:") != null);
    try testing.expect(manager.resolveCatalogReference("gt", "catalog:") != null);
    try testing.expect(manager.resolveCatalogReference("gte", "catalog:") != null);
    try testing.expect(manager.resolveCatalogReference("lt", "catalog:") != null);
    try testing.expect(manager.resolveCatalogReference("lte", "catalog:") != null);
    try testing.expect(manager.resolveCatalogReference("latest", "catalog:") != null);
    try testing.expect(manager.resolveCatalogReference("next", "catalog:") != null);
    try testing.expect(manager.resolveCatalogReference("wildcard", "catalog:") != null);
    try testing.expect(manager.resolveCatalogReference("github-short", "catalog:") != null);
    try testing.expect(manager.resolveCatalogReference("github-full", "catalog:") != null);
    try testing.expect(manager.resolveCatalogReference("git", "catalog:") != null);
    try testing.expect(manager.resolveCatalogReference("workspace", "catalog:") != null);
    try testing.expect(manager.resolveCatalogReference("workspace-ver", "catalog:") != null);
}
