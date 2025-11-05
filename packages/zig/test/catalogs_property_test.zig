//! Property-Based Testing for Catalogs
//!
//! These tests verify invariants that should hold for all inputs using
//! property-based testing techniques.

const std = @import("std");
const testing = std.testing;
const lib = @import("lib");

// ============================================================================
// Property Test Helpers
// ============================================================================

fn generateRandomPackageName(allocator: std.mem.Allocator, random: std.rand.Random, max_len: usize) ![]u8 {
    const len = random.intRangeAtMost(usize, 1, max_len);
    var name = try allocator.alloc(u8, len);

    for (0..len) |i| {
        // Generate valid package name characters
        const char_type = random.intRangeAtMost(u8, 0, 3);
        name[i] = switch (char_type) {
            0 => random.intRangeAtMost(u8, 'a', 'z'),
            1 => random.intRangeAtMost(u8, 'A', 'Z'),
            2 => random.intRangeAtMost(u8, '0', '9'),
            3 => '-',
            else => unreachable,
        };
    }

    return name;
}

fn generateRandomVersion(allocator: std.mem.Allocator, random: std.rand.Random) ![]u8 {
    const templates = [_][]const u8{
        "^{d}.{d}.{d}",
        "~{d}.{d}.{d}",
        "{d}.{d}.{d}",
        ">={d}.{d}.{d}",
        "latest",
        "*",
    };

    const template = templates[random.intRangeAtMost(usize, 0, templates.len - 1)];

    if (std.mem.eql(u8, template, "latest") or std.mem.eql(u8, template, "*")) {
        return try allocator.dupe(u8, template);
    }

    const major = random.intRangeAtMost(u32, 0, 20);
    const minor = random.intRangeAtMost(u32, 0, 20);
    const patch = random.intRangeAtMost(u32, 0, 20);

    return try std.fmt.allocPrint(allocator, template, .{ major, minor, patch });
}

// ============================================================================
// Property 1: Catalog Operations Are Idempotent
// ============================================================================

test "property: adding same package twice is idempotent" {
    const allocator = testing.allocator;
    var prng = std.rand.DefaultPrng.init(42);
    const random = prng.random();

    for (0..100) |_| {
        var catalog = lib.deps.catalogs.Catalog.init(allocator, try allocator.dupe(u8, ""));
        defer catalog.deinit();

        const pkg_name = try generateRandomPackageName(allocator, random, 20);
        defer allocator.free(pkg_name);

        const version1 = try generateRandomVersion(allocator, random);
        defer allocator.free(version1);

        const version2 = try generateRandomVersion(allocator, random);
        defer allocator.free(version2);

        // Add first version
        try catalog.addVersion(pkg_name, version1);
        const count1 = catalog.versions.count();

        // Add same package with different version
        try catalog.addVersion(pkg_name, version2);
        const count2 = catalog.versions.count();

        // Count should remain the same (replacement, not addition)
        try testing.expectEqual(count1, count2);

        // Should have the second version
        const stored = catalog.getVersion(pkg_name);
        try testing.expect(stored != null);
        try testing.expectEqualStrings(version2, stored.?);
    }
}

// ============================================================================
// Property 2: Catalog Resolution Is Deterministic
// ============================================================================

test "property: catalog resolution is deterministic" {
    const allocator = testing.allocator;
    var prng = std.rand.DefaultPrng.init(123);
    const random = prng.random();

    for (0..100) |_| {
        var manager = lib.deps.CatalogManager.init(allocator);
        defer manager.deinit();

        var catalog = lib.deps.catalogs.Catalog.init(allocator, try allocator.dupe(u8, ""));

        const pkg_name = try generateRandomPackageName(allocator, random, 20);
        defer allocator.free(pkg_name);

        const version = try generateRandomVersion(allocator, random);
        defer allocator.free(version);

        try catalog.addVersion(pkg_name, version);
        manager.setDefaultCatalog(catalog);

        // Resolve multiple times - should always return same result
        const result1 = manager.resolveCatalogReference(pkg_name, "catalog:");
        const result2 = manager.resolveCatalogReference(pkg_name, "catalog:");
        const result3 = manager.resolveCatalogReference(pkg_name, "catalog:");

        // All should be non-null and equal
        try testing.expect(result1 != null);
        try testing.expect(result2 != null);
        try testing.expect(result3 != null);

        try testing.expectEqualStrings(result1.?, result2.?);
        try testing.expectEqualStrings(result2.?, result3.?);
    }
}

// ============================================================================
// Property 3: Package Presence Is Consistent
// ============================================================================

test "property: hasPackage and getVersion are consistent" {
    const allocator = testing.allocator;
    var prng = std.rand.DefaultPrng.init(456);
    const random = prng.random();

    for (0..100) |_| {
        var catalog = lib.deps.catalogs.Catalog.init(allocator, try allocator.dupe(u8, ""));
        defer catalog.deinit();

        const pkg_name = try generateRandomPackageName(allocator, random, 20);
        defer allocator.free(pkg_name);

        const version = try generateRandomVersion(allocator, random);
        defer allocator.free(version);

        // Before adding: hasPackage should be false, getVersion should be null
        try testing.expect(!catalog.hasPackage(pkg_name));
        try testing.expect(catalog.getVersion(pkg_name) == null);

        // Add package
        try catalog.addVersion(pkg_name, version);

        // After adding: hasPackage should be true, getVersion should return value
        try testing.expect(catalog.hasPackage(pkg_name));
        try testing.expect(catalog.getVersion(pkg_name) != null);

        // The invariant: hasPackage(x) == (getVersion(x) != null)
        const has_package = catalog.hasPackage(pkg_name);
        const get_version = catalog.getVersion(pkg_name);
        try testing.expectEqual(has_package, get_version != null);
    }
}

// ============================================================================
// Property 4: Catalog Reference Detection Is Consistent
// ============================================================================

test "property: isCatalogReference and getCatalogName are consistent" {
    const allocator = testing.allocator;

    const test_strings = [_][]const u8{
        "catalog:",
        "catalog:test",
        "catalog:  ",
        "catalog:build-tools",
        "^1.0.0",
        "~2.0.0",
        "latest",
        "*",
        "workspace:*",
        "github:owner/repo",
        "",
        "random-text",
    };

    for (test_strings) |str| {
        const is_catalog = lib.deps.catalogs.CatalogManager.isCatalogReference(str);
        const catalog_name = lib.deps.catalogs.CatalogManager.getCatalogName(str);

        // Invariant: isCatalogReference(x) == (getCatalogName(x) != null)
        try testing.expectEqual(is_catalog, catalog_name != null);
    }

    // Generate random strings and verify invariant
    var prng = std.rand.DefaultPrng.init(789);
    const random = prng.random();

    for (0..100) |_| {
        const len = random.intRangeAtMost(usize, 0, 50);
        var test_str = try allocator.alloc(u8, len);
        defer allocator.free(test_str);

        for (0..len) |i| {
            test_str[i] = random.int(u8);
        }

        const is_catalog = lib.deps.catalogs.CatalogManager.isCatalogReference(test_str);
        const catalog_name = lib.deps.catalogs.CatalogManager.getCatalogName(test_str);

        try testing.expectEqual(is_catalog, catalog_name != null);
    }
}

// ============================================================================
// Property 5: Named Catalogs Are Independent
// ============================================================================

test "property: named catalogs are independent" {
    const allocator = testing.allocator;
    var prng = std.rand.DefaultPrng.init(1011);
    const random = prng.random();

    for (0..50) |_| {
        var manager = lib.deps.CatalogManager.init(allocator);
        defer manager.deinit();

        // Create multiple named catalogs with same package names but different versions
        const num_catalogs = random.intRangeAtMost(usize, 2, 5);
        const pkg_name = try generateRandomPackageName(allocator, random, 20);
        defer allocator.free(pkg_name);

        var expected_versions = std.ArrayList([]const u8).init(allocator);
        defer {
            for (expected_versions.items) |v| {
                allocator.free(v);
            }
            expected_versions.deinit();
        }

        for (0..num_catalogs) |i| {
            const catalog_name = try std.fmt.allocPrint(allocator, "catalog-{d}", .{i});
            defer allocator.free(catalog_name);

            var catalog = lib.deps.catalogs.Catalog.init(allocator, try allocator.dupe(u8, catalog_name));

            const version = try generateRandomVersion(allocator, random);
            try expected_versions.append(try allocator.dupe(u8, version));
            defer allocator.free(version);

            try catalog.addVersion(pkg_name, version);
            try manager.addNamedCatalog(catalog_name, catalog);
        }

        // Verify each catalog has its independent version
        for (0..num_catalogs) |i| {
            const catalog_ref = try std.fmt.allocPrint(allocator, "catalog:catalog-{d}", .{i});
            defer allocator.free(catalog_ref);

            const resolved = manager.resolveCatalogReference(pkg_name, catalog_ref);
            try testing.expect(resolved != null);
            try testing.expectEqualStrings(expected_versions.items[i], resolved.?);
        }
    }
}

// ============================================================================
// Property 6: Version Validation Is Monotonic
// ============================================================================

test "property: version validation is monotonic" {
    // If a string is invalid, appending characters shouldn't make it valid
    // (unless we're building toward a valid prefix)

    const invalid_bases = [_][]const u8{
        "!!!",
        "@@@",
        "###",
        "???",
    };

    for (invalid_bases) |base| {
        // Base should be invalid
        try testing.expect(!lib.deps.catalogs.isValidVersion(base));

        // Adding more invalid characters should keep it invalid
        const allocator = testing.allocator;
        const extended = try std.fmt.allocPrint(allocator, "{s}!!!", .{base});
        defer allocator.free(extended);

        try testing.expect(!lib.deps.catalogs.isValidVersion(extended));
    }
}

// ============================================================================
// Property 7: Catalog Manager Cleanup Is Complete
// ============================================================================

test "property: catalog manager cleanup is complete" {
    const allocator = testing.allocator;
    var prng = std.rand.DefaultPrng.init(1213);
    const random = prng.random();

    // Create many managers with varying content and ensure no memory leaks
    for (0..100) |_| {
        var manager = lib.deps.CatalogManager.init(allocator);

        // Maybe add default catalog
        if (random.boolean()) {
            var catalog = lib.deps.catalogs.Catalog.init(allocator, try allocator.dupe(u8, ""));

            const num_packages = random.intRangeAtMost(usize, 0, 10);
            for (0..num_packages) |_| {
                const pkg = try generateRandomPackageName(allocator, random, 20);
                defer allocator.free(pkg);

                const ver = try generateRandomVersion(allocator, random);
                defer allocator.free(ver);

                catalog.addVersion(pkg, ver) catch continue;
            }

            manager.setDefaultCatalog(catalog);
        }

        // Add named catalogs
        const num_named = random.intRangeAtMost(usize, 0, 5);
        for (0..num_named) |i| {
            const name = try std.fmt.allocPrint(allocator, "catalog-{d}", .{i});
            defer allocator.free(name);

            var catalog = lib.deps.catalogs.Catalog.init(allocator, try allocator.dupe(u8, name));

            const num_packages = random.intRangeAtMost(usize, 1, 5);
            for (0..num_packages) |_| {
                const pkg = try generateRandomPackageName(allocator, random, 20);
                defer allocator.free(pkg);

                const ver = try generateRandomVersion(allocator, random);
                defer allocator.free(ver);

                catalog.addVersion(pkg, ver) catch continue;
            }

            manager.addNamedCatalog(name, catalog) catch {
                catalog.deinit();
                continue;
            };
        }

        // Cleanup should free everything
        manager.deinit();
    }

    // Memory leak check handled by testing.allocator
}

// ============================================================================
// Property 8: Whitespace Trimming Is Consistent
// ============================================================================

test "property: whitespace trimming produces canonical names" {
    const allocator = testing.allocator;

    var manager = lib.deps.CatalogManager.init(allocator);
    defer manager.deinit();

    var catalog = lib.deps.catalogs.Catalog.init(allocator, try allocator.dupe(u8, "test"));
    try catalog.addVersion("pkg", "^1.0.0");
    try manager.addNamedCatalog("test", catalog);

    // All these variants should resolve to the same catalog
    const variants = [_][]const u8{
        "catalog:test",
        "catalog: test",
        "catalog:  test",
        "catalog:test ",
        "catalog: test ",
        "catalog:\ttest",
        "catalog:test\t",
    };

    for (variants) |variant| {
        const resolved = manager.resolveCatalogReference("pkg", variant);
        try testing.expect(resolved != null);
        try testing.expectEqualStrings("^1.0.0", resolved.?);
    }
}

// ============================================================================
// Property 9: Empty Package Names Are Handled
// ============================================================================

test "property: empty package names don't crash" {
    const allocator = testing.allocator;

    var catalog = lib.deps.catalogs.Catalog.init(allocator, try allocator.dupe(u8, ""));
    defer catalog.deinit();

    // Should be able to add empty package name (though not recommended)
    try catalog.addVersion("", "^1.0.0");

    // Should be able to retrieve it
    const version = catalog.getVersion("");
    try testing.expect(version != null);
    try testing.expectEqualStrings("^1.0.0", version.?);

    // hasPackage should also work
    try testing.expect(catalog.hasPackage(""));
}

// ============================================================================
// Property 10: Large Catalogs Perform Well
// ============================================================================

test "property: large catalogs maintain O(1) lookup" {
    const allocator = testing.allocator;
    var prng = std.rand.DefaultPrng.init(1415);
    const random = prng.random();

    var catalog = lib.deps.catalogs.Catalog.init(allocator, try allocator.dupe(u8, ""));
    defer catalog.deinit();

    // Add many packages
    const num_packages = 10000;
    var package_names = std.ArrayList([]const u8).init(allocator);
    defer {
        for (package_names.items) |name| {
            allocator.free(name);
        }
        package_names.deinit();
    }

    for (0..num_packages) |i| {
        const pkg_name = try std.fmt.allocPrint(allocator, "package-{d}", .{i});
        try package_names.append(try allocator.dupe(u8, pkg_name));
        defer allocator.free(pkg_name);

        const version = try std.fmt.allocPrint(allocator, "^{d}.0.0", .{i % 100});
        defer allocator.free(version);

        try catalog.addVersion(pkg_name, version);
    }

    // Lookup should still be fast
    const start = std.time.nanoTimestamp();

    const num_lookups = 1000;
    for (0..num_lookups) |_| {
        const idx = random.intRangeAtMost(usize, 0, num_packages - 1);
        const version = catalog.getVersion(package_names.items[idx]);
        try testing.expect(version != null);
    }

    const end = std.time.nanoTimestamp();
    const duration_ms = @divFloor(end - start, 1_000_000);

    // 1000 lookups from 10000 packages should complete in < 100ms (usually < 10ms)
    try testing.expect(duration_ms < 100);
}
