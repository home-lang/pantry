//! Catalog Fuzzing Tests
//!
//! Random input generation to find crashes and edge cases.

const std = @import("std");
const testing = std.testing;
const lib = @import("lib");

// ============================================================================
// Random String Generation
// ============================================================================

fn generateRandomString(allocator: std.mem.Allocator, random: std.rand.Random, max_len: usize) ![]u8 {
    const len = random.intRangeAtMost(usize, 0, max_len);
    var str = try allocator.alloc(u8, len);

    for (0..len) |i| {
        // Generate random byte (including special chars, unicode, etc)
        str[i] = random.int(u8);
    }

    return str;
}

fn generateRandomAsciiString(allocator: std.mem.Allocator, random: std.rand.Random, max_len: usize) ![]u8 {
    const len = random.intRangeAtMost(usize, 0, max_len);
    var str = try allocator.alloc(u8, len);

    for (0..len) |i| {
        // Generate printable ASCII
        str[i] = random.intRangeAtMost(u8, 32, 126);
    }

    return str;
}

fn generateRandomPackageName(allocator: std.mem.Allocator, random: std.rand.Random) ![]u8 {
    const strategies = [_]u8{ 0, 1, 2, 3, 4 };
    const strategy = strategies[random.intRangeAtMost(usize, 0, strategies.len - 1)];

    return switch (strategy) {
        0 => try generateRandomAsciiString(allocator, random, 50), // Normal package name
        1 => try allocator.dupe(u8, ""), // Empty string
        2 => try generateRandomString(allocator, random, 20), // Random bytes (unicode)
        3 => blk: { // With special chars
            const templates = [_][]const u8{ "@scope/package", "package.name", "package-name_v2", "123-numbers" };
            break :blk try allocator.dupe(u8, templates[random.intRangeAtMost(usize, 0, templates.len - 1)]);
        },
        4 => try generateRandomAsciiString(allocator, random, 500), // Very long
        else => unreachable,
    };
}

fn generateRandomVersion(allocator: std.mem.Allocator, random: std.rand.Random) ![]u8 {
    const strategies = [_]u8{ 0, 1, 2, 3, 4, 5 };
    const strategy = strategies[random.intRangeAtMost(usize, 0, strategies.len - 1)];

    return switch (strategy) {
        0 => blk: { // Valid version
            const templates = [_][]const u8{ "1.2.3", "^1.2.3", "~1.2.3", ">=1.0.0", "latest", "*" };
            break :blk try allocator.dupe(u8, templates[random.intRangeAtMost(usize, 0, templates.len - 1)]);
        },
        1 => try allocator.dupe(u8, ""), // Empty
        2 => try generateRandomAsciiString(allocator, random, 30), // Random ASCII
        3 => try generateRandomString(allocator, random, 20), // Random bytes
        4 => try generateRandomAsciiString(allocator, random, 1000), // Very long
        5 => blk: { // Special formats
            const templates = [_][]const u8{ "github:owner/repo", "workspace:*", "catalog:other" };
            break :blk try allocator.dupe(u8, templates[random.intRangeAtMost(usize, 0, templates.len - 1)]);
        },
        else => unreachable,
    };
}

// ============================================================================
// Fuzzing Tests
// ============================================================================

test "fuzz catalog creation and lookup" {
    const allocator = testing.allocator;
    var prng = std.rand.DefaultPrng.init(12345);
    const random = prng.random();

    // Run 100 iterations of random operations
    for (0..100) |iteration| {
        var manager = lib.deps.CatalogManager.init(allocator);
        defer manager.deinit();

        var catalog = lib.deps.catalogs.Catalog.init(allocator, try allocator.dupe(u8, ""));

        // Add random packages
        const num_packages = random.intRangeAtMost(usize, 0, 20);
        var added_packages = std.ArrayList([]const u8).init(allocator);
        defer {
            for (added_packages.items) |pkg| {
                allocator.free(pkg);
            }
            added_packages.deinit();
        }

        for (0..num_packages) |_| {
            const pkg_name = generateRandomPackageName(allocator, random) catch continue;
            const version = generateRandomVersion(allocator, random) catch {
                allocator.free(pkg_name);
                continue;
            };

            // Try to add (might fail for invalid versions)
            catalog.addVersion(pkg_name, version) catch {
                allocator.free(pkg_name);
                allocator.free(version);
                continue;
            };

            // Remember valid packages
            try added_packages.append(try allocator.dupe(u8, pkg_name));
            allocator.free(pkg_name);
            allocator.free(version);
        }

        manager.setDefaultCatalog(catalog);

        // Try to lookup random packages (should not crash)
        for (0..10) |_| {
            const lookup_name = generateRandomPackageName(allocator, random) catch continue;
            defer allocator.free(lookup_name);

            _ = manager.resolveCatalogReference(lookup_name, "catalog:");
        }

        _ = iteration; // Suppress unused warning
    }
}

test "fuzz catalog reference parsing" {
    const allocator = testing.allocator;
    var prng = std.rand.DefaultPrng.init(54321);
    const random = prng.random();

    // Test with many random reference strings
    for (0..500) |_| {
        const ref = generateRandomAsciiString(allocator, random, 100) catch continue;
        defer allocator.free(ref);

        // Should not crash
        _ = lib.deps.catalogs.CatalogManager.isCatalogReference(ref);
        _ = lib.deps.catalogs.CatalogManager.getCatalogName(ref);
    }
}

test "fuzz JSON parsing" {
    const allocator = testing.allocator;
    var prng = std.rand.DefaultPrng.init(99999);
    const random = prng.random();

    // Generate random but somewhat valid JSON structures
    for (0..50) |_| {
        var json_builder = std.ArrayList(u8).init(allocator);
        defer json_builder.deinit();

        const writer = json_builder.writer();

        // Start JSON
        try writer.writeAll("{\"catalog\":{");

        // Add random number of packages
        const num_packages = random.intRangeAtMost(usize, 0, 10);
        for (0..num_packages) |i| {
            if (i > 0) try writer.writeAll(",");

            // Random package name
            try writer.writeAll("\"");
            const pkg_name = generateRandomAsciiString(allocator, random, 30) catch continue;
            defer allocator.free(pkg_name);

            // Escape quotes in package name
            for (pkg_name) |c| {
                if (c == '"' or c == '\\') {
                    try writer.writeByte('\\');
                }
                try writer.writeByte(c);
            }
            try writer.writeAll("\":\"");

            // Random version
            const version = generateRandomAsciiString(allocator, random, 20) catch continue;
            defer allocator.free(version);

            for (version) |c| {
                if (c == '"' or c == '\\') {
                    try writer.writeByte('\\');
                }
                try writer.writeByte(c);
            }
            try writer.writeAll("\"");
        }

        try writer.writeAll("}}");

        const json_str = try json_builder.toOwnedSlice();
        defer allocator.free(json_str);

        // Try to parse - should not crash
        const parsed = std.json.parseFromSlice(std.json.Value, allocator, json_str, .{}) catch continue;
        defer parsed.deinit();

        var manager = lib.deps.parseCatalogs(allocator, parsed) catch continue;
        defer manager.deinit();
    }
}

test "fuzz named catalogs" {
    const allocator = testing.allocator;
    var prng = std.rand.DefaultPrng.init(11111);
    const random = prng.random();

    for (0..50) |_| {
        var manager = lib.deps.CatalogManager.init(allocator);
        defer manager.deinit();

        // Add random named catalogs
        const num_catalogs = random.intRangeAtMost(usize, 0, 10);
        for (0..num_catalogs) |_| {
            const catalog_name = generateRandomAsciiString(allocator, random, 50) catch continue;

            var catalog = lib.deps.catalogs.Catalog.init(allocator, try allocator.dupe(u8, catalog_name));

            // Add some packages
            const num_packages = random.intRangeAtMost(usize, 0, 5);
            for (0..num_packages) |_| {
                const pkg = generateRandomPackageName(allocator, random) catch continue;
                const ver = generateRandomVersion(allocator, random) catch {
                    allocator.free(pkg);
                    continue;
                };

                catalog.addVersion(pkg, ver) catch {
                    allocator.free(pkg);
                    allocator.free(ver);
                    continue;
                };
                allocator.free(pkg);
                allocator.free(ver);
            }

            manager.addNamedCatalog(catalog_name, catalog) catch {
                catalog.deinit();
                allocator.free(catalog_name);
                continue;
            };
            allocator.free(catalog_name);
        }

        // Try random lookups
        for (0..20) |_| {
            const pkg = generateRandomPackageName(allocator, random) catch continue;
            defer allocator.free(pkg);

            const ref = generateRandomAsciiString(allocator, random, 70) catch continue;
            defer allocator.free(ref);

            _ = manager.resolveCatalogReference(pkg, ref);
        }
    }
}

test "fuzz with malicious inputs" {
    const allocator = testing.allocator;

    // Test with known problematic patterns
    const malicious_inputs = [_][]const u8{
        "", // Empty
        "\x00", // Null byte
        "\x00\x00\x00\x00", // Multiple nulls
        "catalog:\x00name", // Null in middle
        "catalog:\n\n\n\n", // Many newlines
        "catalog:\t\t\t\t", // Many tabs
        "catalog:" ++ "a" ** 1000, // Very long catalog name
        "a" ** 10000, // Extremely long string
        "\xFF\xFE\xFD\xFC", // High bytes
        "../../etc/passwd", // Path traversal attempt
        "; rm -rf /", // Command injection attempt
        "<script>alert(1)</script>", // XSS attempt
        "$(whoami)", // Command substitution
        "`whoami`", // Backtick substitution
        "${HOME}", // Variable expansion
        "\u0000", // Unicode null
        "\u200B\u200C\u200D", // Zero-width chars
    };

    var manager = lib.deps.CatalogManager.init(allocator);
    defer manager.deinit();

    var catalog = lib.deps.catalogs.Catalog.init(allocator, try allocator.dupe(u8, ""));
    try catalog.addVersion("test", "^1.0.0");
    manager.setDefaultCatalog(catalog);

    for (malicious_inputs) |input| {
        // Should handle gracefully without crashing
        _ = lib.deps.catalogs.CatalogManager.isCatalogReference(input);
        _ = lib.deps.catalogs.CatalogManager.getCatalogName(input);
        _ = manager.resolveCatalogReference(input, "catalog:");
        _ = manager.resolveCatalogReference("test", input);
    }
}

test "fuzz version validation" {
    const allocator = testing.allocator;
    var prng = std.rand.DefaultPrng.init(77777);
    const random = prng.random();

    // Test many random version strings
    for (0..1000) |_| {
        const version = generateRandomAsciiString(allocator, random, 100) catch continue;
        defer allocator.free(version);

        // Should not crash
        _ = lib.deps.catalogs.isValidVersion(version);
    }

    // Test with random bytes (not just ASCII)
    for (0..1000) |_| {
        const version = generateRandomString(allocator, random, 50) catch continue;
        defer allocator.free(version);

        // Should not crash even with arbitrary bytes
        _ = lib.deps.catalogs.isValidVersion(version);
    }
}

test "fuzz package name patterns" {
    const allocator = testing.allocator;

    // Test various problematic package name patterns
    const test_names = [_][]const u8{
        "@",
        "@@",
        "@/",
        "/@",
        "@scope/",
        "/@scope",
        "/package",
        "package/",
        "//package",
        "package//name",
        ".",
        "..",
        "...",
        "./package",
        "../package",
        "package/./name",
        "package/../name",
        "package\x00name",
        "package\nname",
        "package\rname",
        "package\tname",
        "package name", // Space
        "package  name", // Multiple spaces
        " package", // Leading space
        "package ", // Trailing space
        "\u200Bpackage", // Zero-width space
        "package\u200B",
    };

    var manager = lib.deps.CatalogManager.init(allocator);
    defer manager.deinit();

    var catalog = lib.deps.catalogs.Catalog.init(allocator, try allocator.dupe(u8, ""));

    for (test_names) |name| {
        // Try to add - might fail, but shouldn't crash
        catalog.addVersion(name, "^1.0.0") catch continue;
    }

    manager.setDefaultCatalog(catalog);

    // Try to resolve all of them
    for (test_names) |name| {
        _ = manager.resolveCatalogReference(name, "catalog:");
    }
}

test "fuzz with unicode edge cases" {
    const allocator = testing.allocator;

    const unicode_tests = [_][]const u8{
        "测试", // Chinese
        "テスト", // Japanese
        "тест", // Cyrillic
        "🚀", // Emoji
        "🚀📦", // Multiple emojis
        "package-🚀", // Mixed
        "\u{1F600}", // Emoji via escape
        "\u{200B}", // Zero-width space
        "\u{FEFF}", // BOM
        "café", // Accented chars
        "naïve", // Umlaut
        "Москва", // Russian
        "北京", // Chinese city
        "🏳️‍🌈", // Flag emoji with ZWJ
        "\u{0301}", // Combining accent
        "e\u{0301}", // e + combining acute
    };

    var manager = lib.deps.CatalogManager.init(allocator);
    defer manager.deinit();

    var catalog = lib.deps.catalogs.Catalog.init(allocator, try allocator.dupe(u8, ""));

    for (unicode_tests) |name| {
        catalog.addVersion(name, "^1.0.0") catch continue;
    }

    manager.setDefaultCatalog(catalog);

    // Resolution should work with unicode
    for (unicode_tests) |name| {
        _ = manager.resolveCatalogReference(name, "catalog:");
    }
}

test "fuzz catalog reference edge cases" {
    const test_refs = [_][]const u8{
        "catalog:",
        "catalog: ",
        "catalog:  ",
        "catalog:\t",
        "catalog:\n",
        "catalog:\r\n",
        "catalog::",
        "catalog:::",
        "catalog:name:with:colons",
        "catalog:@scope/package",
        "catalog:123",
        "catalog:-name",
        "catalog:_name",
        "catalog:.name",
        "catalog:name.",
        "catalog:name-",
        "catalog:CamelCase",
        "catalog:kebab-case",
        "catalog:snake_case",
        "catalog:SCREAMING_CASE",
        "Catalog:", // Wrong case
        "CATALOG:",
        "CaTaLoG:",
        "catalog", // Missing colon
        "catalogtest",
        ":catalog",
        "acatalog:",
    };

    for (test_refs) |ref| {
        // Should not crash
        _ = lib.deps.catalogs.CatalogManager.isCatalogReference(ref);
        const name = lib.deps.catalogs.CatalogManager.getCatalogName(ref);
        _ = name;
    }
}
