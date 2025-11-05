//! Lockfile Integration Tests for Catalogs
//!
//! These tests verify that catalog references are properly recorded in the lockfile
//! and that resolved versions are persisted correctly.

const std = @import("std");
const testing = std.testing;
const lib = @import("lib");

// ============================================================================
// Lockfile Recording Tests
// ============================================================================

test "catalog reference resolution is recorded in lockfile" {
    const allocator = testing.allocator;

    // Create a catalog manager with a default catalog
    var manager = lib.deps.CatalogManager.init(allocator);
    defer manager.deinit();

    var catalog = lib.deps.catalogs.Catalog.init(allocator, try allocator.dupe(u8, ""));
    try catalog.addVersion("react", "^18.2.0");
    try catalog.addVersion("typescript", "^5.0.0");
    manager.setDefaultCatalog(catalog);

    // Create a lockfile
    var lockfile = lib.packages.types.Lockfile{
        .version = "1.0.0",
        .lockfile_version = 1,
        .generated_at = std.time.timestamp(),
        .packages = std.StringHashMap(lib.packages.types.LockfilePackage).init(allocator),
    };
    defer lockfile.deinit(allocator);

    // Simulate resolving catalog references during install
    const catalog_deps = [_]struct { name: []const u8, ref: []const u8 }{
        .{ .name = "react", .ref = "catalog:" },
        .{ .name = "typescript", .ref = "catalog:" },
    };

    for (catalog_deps) |dep| {
        if (manager.resolveCatalogReference(dep.name, dep.ref)) |resolved_version| {
            // Record the resolved version in lockfile
            const lockfile_pkg = lib.packages.types.LockfilePackage{
                .name = try allocator.dupe(u8, dep.name),
                .version = try allocator.dupe(u8, resolved_version),
                .source = .npm,
                .url = null,
                .resolved = null,
                .integrity = null,
                .dependencies = null,
            };

            const key = try std.fmt.allocPrint(allocator, "{s}@{s}", .{ dep.name, resolved_version });
            try lockfile.packages.put(key, lockfile_pkg);
        }
    }

    // Verify lockfile contains resolved versions
    try testing.expectEqual(@as(usize, 2), lockfile.packages.count());

    const react_key = try std.fmt.allocPrint(allocator, "react@^18.2.0", .{});
    defer allocator.free(react_key);
    const react_pkg = lockfile.packages.get(react_key);
    try testing.expect(react_pkg != null);
    try testing.expectEqualStrings("react", react_pkg.?.name);
    try testing.expectEqualStrings("^18.2.0", react_pkg.?.version);

    const ts_key = try std.fmt.allocPrint(allocator, "typescript@^5.0.0", .{});
    defer allocator.free(ts_key);
    const ts_pkg = lockfile.packages.get(ts_key);
    try testing.expect(ts_pkg != null);
    try testing.expectEqualStrings("typescript", ts_pkg.?.name);
    try testing.expectEqualStrings("^5.0.0", ts_pkg.?.version);
}

test "named catalog references recorded in lockfile" {
    const allocator = testing.allocator;

    var manager = lib.deps.CatalogManager.init(allocator);
    defer manager.deinit();

    // Create named catalogs
    var testing_catalog = lib.deps.catalogs.Catalog.init(allocator, try allocator.dupe(u8, "testing"));
    try testing_catalog.addVersion("vitest", "^1.0.0");
    try manager.addNamedCatalog("testing", testing_catalog);

    var build_catalog = lib.deps.catalogs.Catalog.init(allocator, try allocator.dupe(u8, "build"));
    try build_catalog.addVersion("esbuild", "^0.19.0");
    try manager.addNamedCatalog("build", build_catalog);

    var lockfile = lib.packages.types.Lockfile{
        .version = "1.0.0",
        .lockfile_version = 1,
        .generated_at = std.time.timestamp(),
        .packages = std.StringHashMap(lib.packages.types.LockfilePackage).init(allocator),
    };
    defer lockfile.deinit(allocator);

    // Resolve and record named catalog references
    const catalog_refs = [_]struct { name: []const u8, ref: []const u8 }{
        .{ .name = "vitest", .ref = "catalog:testing" },
        .{ .name = "esbuild", .ref = "catalog:build" },
    };

    for (catalog_refs) |dep| {
        if (manager.resolveCatalogReference(dep.name, dep.ref)) |resolved_version| {
            const lockfile_pkg = lib.packages.types.LockfilePackage{
                .name = try allocator.dupe(u8, dep.name),
                .version = try allocator.dupe(u8, resolved_version),
                .source = .npm,
                .url = null,
                .resolved = null,
                .integrity = null,
                .dependencies = null,
            };

            const key = try std.fmt.allocPrint(allocator, "{s}@{s}", .{ dep.name, resolved_version });
            try lockfile.packages.put(key, lockfile_pkg);
        }
    }

    try testing.expectEqual(@as(usize, 2), lockfile.packages.count());

    // Verify correct versions were recorded
    const vitest_key = try std.fmt.allocPrint(allocator, "vitest@^1.0.0", .{});
    defer allocator.free(vitest_key);
    try testing.expect(lockfile.packages.contains(vitest_key));

    const esbuild_key = try std.fmt.allocPrint(allocator, "esbuild@^0.19.0", .{});
    defer allocator.free(esbuild_key);
    try testing.expect(lockfile.packages.contains(esbuild_key));
}

// ============================================================================
// Lockfile Roundtrip Tests
// ============================================================================

test "lockfile roundtrip with catalog resolutions" {
    const allocator = testing.allocator;

    // Setup catalog
    var manager = lib.deps.CatalogManager.init(allocator);
    defer manager.deinit();

    var catalog = lib.deps.catalogs.Catalog.init(allocator, try allocator.dupe(u8, ""));
    try catalog.addVersion("lodash", "^4.17.21");
    try catalog.addVersion("axios", "^1.6.0");
    manager.setDefaultCatalog(catalog);

    // Create initial lockfile
    var lockfile1 = lib.packages.types.Lockfile{
        .version = "1.0.0",
        .lockfile_version = 1,
        .generated_at = std.time.timestamp(),
        .packages = std.StringHashMap(lib.packages.types.LockfilePackage).init(allocator),
    };
    defer lockfile1.deinit(allocator);

    // Add catalog-resolved packages
    const deps = [_][]const u8{ "lodash", "axios" };
    for (deps) |dep_name| {
        if (manager.resolveCatalogReference(dep_name, "catalog:")) |version| {
            const lockfile_pkg = lib.packages.types.LockfilePackage{
                .name = try allocator.dupe(u8, dep_name),
                .version = try allocator.dupe(u8, version),
                .source = .npm,
                .url = null,
                .resolved = null,
                .integrity = null,
                .dependencies = null,
            };

            const key = try std.fmt.allocPrint(allocator, "{s}@{s}", .{ dep_name, version });
            try lockfile1.packages.put(key, lockfile_pkg);
        }
    }

    // Write to temp file
    const tmp_path = try std.fmt.allocPrint(allocator, "/tmp/pantry_test_lockfile_{d}.json", .{std.time.timestamp()});
    defer allocator.free(tmp_path);
    defer std.fs.deleteFileAbsolute(tmp_path) catch {};

    try lib.packages.lockfile.writeLockfile(allocator, &lockfile1, tmp_path);

    // Read back
    const lockfile2_result = try lib.packages.lockfile.readLockfile(allocator, tmp_path);
    var lockfile2 = lockfile2_result;
    defer lockfile2.deinit(allocator);

    // Compare (should be equal except generatedAt)
    try testing.expect(lib.packages.lockfile.lockfilesEqual(&lockfile1, &lockfile2));

    // Verify packages are preserved
    try testing.expectEqual(@as(usize, 2), lockfile2.packages.count());

    for (deps) |dep_name| {
        const version = manager.resolveCatalogReference(dep_name, "catalog:").?;
        const key = try std.fmt.allocPrint(allocator, "{s}@{s}", .{ dep_name, version });
        defer allocator.free(key);

        const pkg = lockfile2.packages.get(key);
        try testing.expect(pkg != null);
        try testing.expectEqualStrings(dep_name, pkg.?.name);
        try testing.expectEqualStrings(version, pkg.?.version);
    }
}

// ============================================================================
// Catalog Changes and Lockfile Updates
// ============================================================================

test "lockfile updates when catalog versions change" {
    const allocator = testing.allocator;

    const tmp_path = try std.fmt.allocPrint(allocator, "/tmp/pantry_test_lockfile_update_{d}.json", .{std.time.timestamp()});
    defer allocator.free(tmp_path);
    defer std.fs.deleteFileAbsolute(tmp_path) catch {};

    // Initial catalog state
    {
        var manager = lib.deps.CatalogManager.init(allocator);
        defer manager.deinit();

        var catalog = lib.deps.catalogs.Catalog.init(allocator, try allocator.dupe(u8, ""));
        try catalog.addVersion("package-a", "^1.0.0");
        manager.setDefaultCatalog(catalog);

        var lockfile = lib.packages.types.Lockfile{
            .version = "1.0.0",
            .lockfile_version = 1,
            .generated_at = std.time.timestamp(),
            .packages = std.StringHashMap(lib.packages.types.LockfilePackage).init(allocator),
        };
        defer lockfile.deinit(allocator);

        if (manager.resolveCatalogReference("package-a", "catalog:")) |version| {
            const pkg = lib.packages.types.LockfilePackage{
                .name = try allocator.dupe(u8, "package-a"),
                .version = try allocator.dupe(u8, version),
                .source = .npm,
                .url = null,
                .resolved = null,
                .integrity = null,
                .dependencies = null,
            };
            const key = try std.fmt.allocPrint(allocator, "package-a@{s}", .{version});
            try lockfile.packages.put(key, pkg);
        }

        try lib.packages.lockfile.writeLockfile(allocator, &lockfile, tmp_path);
    }

    // Updated catalog state (version changed)
    {
        var manager = lib.deps.CatalogManager.init(allocator);
        defer manager.deinit();

        var catalog = lib.deps.catalogs.Catalog.init(allocator, try allocator.dupe(u8, ""));
        try catalog.addVersion("package-a", "^2.0.0"); // Version changed!
        manager.setDefaultCatalog(catalog);

        var lockfile = lib.packages.types.Lockfile{
            .version = "1.0.0",
            .lockfile_version = 1,
            .generated_at = std.time.timestamp(),
            .packages = std.StringHashMap(lib.packages.types.LockfilePackage).init(allocator),
        };
        defer lockfile.deinit(allocator);

        if (manager.resolveCatalogReference("package-a", "catalog:")) |version| {
            const pkg = lib.packages.types.LockfilePackage{
                .name = try allocator.dupe(u8, "package-a"),
                .version = try allocator.dupe(u8, version),
                .source = .npm,
                .url = null,
                .resolved = null,
                .integrity = null,
                .dependencies = null,
            };
            const key = try std.fmt.allocPrint(allocator, "package-a@{s}", .{version});
            try lockfile.packages.put(key, pkg);
        }

        // Writing should detect the change
        try lib.packages.lockfile.writeLockfile(allocator, &lockfile, tmp_path);
    }

    // Read final lockfile and verify it has the new version
    const final_lockfile_result = try lib.packages.lockfile.readLockfile(allocator, tmp_path);
    var final_lockfile = final_lockfile_result;
    defer final_lockfile.deinit(allocator);

    const key = try std.fmt.allocPrint(allocator, "package-a@^2.0.0", .{});
    defer allocator.free(key);

    const pkg = final_lockfile.packages.get(key);
    try testing.expect(pkg != null);
    try testing.expectEqualStrings("^2.0.0", pkg.?.version);
}

// ============================================================================
// Multiple Workspace Packages with Catalogs
// ============================================================================

test "lockfile with multiple workspace packages using catalogs" {
    const allocator = testing.allocator;

    var manager = lib.deps.CatalogManager.init(allocator);
    defer manager.deinit();

    // Setup catalog
    var catalog = lib.deps.catalogs.Catalog.init(allocator, try allocator.dupe(u8, ""));
    try catalog.addVersion("react", "^18.2.0");
    try catalog.addVersion("react-dom", "^18.2.0");
    try catalog.addVersion("typescript", "^5.0.0");
    try catalog.addVersion("vite", "^5.0.0");
    manager.setDefaultCatalog(catalog);

    var lockfile = lib.packages.types.Lockfile{
        .version = "1.0.0",
        .lockfile_version = 1,
        .generated_at = std.time.timestamp(),
        .packages = std.StringHashMap(lib.packages.types.LockfilePackage).init(allocator),
    };
    defer lockfile.deinit(allocator);

    // Simulate multiple workspace packages using the same catalog references
    const workspace_deps = [_]struct {
        workspace: []const u8,
        deps: []const []const u8,
    }{
        .{ .workspace = "frontend", .deps = &[_][]const u8{ "react", "react-dom", "typescript" } },
        .{ .workspace = "backend", .deps = &[_][]const u8{"typescript"} },
        .{ .workspace = "build", .deps = &[_][]const u8{ "vite", "typescript" } },
    };

    var recorded_packages = std.StringHashMap(void).init(allocator);
    defer recorded_packages.deinit();

    for (workspace_deps) |ws| {
        for (ws.deps) |dep_name| {
            if (manager.resolveCatalogReference(dep_name, "catalog:")) |version| {
                const key = try std.fmt.allocPrint(allocator, "{s}@{s}", .{ dep_name, version });

                // Only record each package once (deduplicated)
                if (!recorded_packages.contains(key)) {
                    const pkg = lib.packages.types.LockfilePackage{
                        .name = try allocator.dupe(u8, dep_name),
                        .version = try allocator.dupe(u8, version),
                        .source = .npm,
                        .url = null,
                        .resolved = null,
                        .integrity = null,
                        .dependencies = null,
                    };
                    try lockfile.packages.put(key, pkg);
                    try recorded_packages.put(key, {});
                } else {
                    allocator.free(key);
                }
            }
        }
    }

    // Verify lockfile contains unique packages (deduplicated)
    try testing.expectEqual(@as(usize, 4), lockfile.packages.count());

    // All workspace packages should share the same versions from catalog
    const expected_packages = [_][]const u8{ "react", "react-dom", "typescript", "vite" };
    for (expected_packages) |pkg_name| {
        const version = manager.resolveCatalogReference(pkg_name, "catalog:").?;
        const key = try std.fmt.allocPrint(allocator, "{s}@{s}", .{ pkg_name, version });
        defer allocator.free(key);

        try testing.expect(lockfile.packages.contains(key));
    }
}

// ============================================================================
// Error Handling in Lockfile Operations
// ============================================================================

test "lockfile handles missing catalog references gracefully" {
    const allocator = testing.allocator;

    var manager = lib.deps.CatalogManager.init(allocator);
    defer manager.deinit();

    var catalog = lib.deps.catalogs.Catalog.init(allocator, try allocator.dupe(u8, ""));
    try catalog.addVersion("exists", "^1.0.0");
    manager.setDefaultCatalog(catalog);

    var lockfile = lib.packages.types.Lockfile{
        .version = "1.0.0",
        .lockfile_version = 1,
        .generated_at = std.time.timestamp(),
        .packages = std.StringHashMap(lib.packages.types.LockfilePackage).init(allocator),
    };
    defer lockfile.deinit(allocator);

    // Try to resolve packages (one exists, one doesn't)
    const deps = [_][]const u8{ "exists", "doesnt-exist" };
    for (deps) |dep_name| {
        if (manager.resolveCatalogReference(dep_name, "catalog:")) |version| {
            const pkg = lib.packages.types.LockfilePackage{
                .name = try allocator.dupe(u8, dep_name),
                .version = try allocator.dupe(u8, version),
                .source = .npm,
                .url = null,
                .resolved = null,
                .integrity = null,
                .dependencies = null,
            };
            const key = try std.fmt.allocPrint(allocator, "{s}@{s}", .{ dep_name, version });
            try lockfile.packages.put(key, pkg);
        }
        // Missing references are simply not added to lockfile
    }

    // Only the existing package should be in lockfile
    try testing.expectEqual(@as(usize, 1), lockfile.packages.count());

    const key = try std.fmt.allocPrint(allocator, "exists@^1.0.0", .{});
    defer allocator.free(key);
    try testing.expect(lockfile.packages.contains(key));
}

test "lockfile preserves non-catalog dependencies" {
    const allocator = testing.allocator;

    var manager = lib.deps.CatalogManager.init(allocator);
    defer manager.deinit();

    var catalog = lib.deps.catalogs.Catalog.init(allocator, try allocator.dupe(u8, ""));
    try catalog.addVersion("from-catalog", "^1.0.0");
    manager.setDefaultCatalog(catalog);

    var lockfile = lib.packages.types.Lockfile{
        .version = "1.0.0",
        .lockfile_version = 1,
        .generated_at = std.time.timestamp(),
        .packages = std.StringHashMap(lib.packages.types.LockfilePackage).init(allocator),
    };
    defer lockfile.deinit(allocator);

    // Add a non-catalog dependency (direct version)
    {
        const pkg = lib.packages.types.LockfilePackage{
            .name = try allocator.dupe(u8, "direct-version"),
            .version = try allocator.dupe(u8, "^2.0.0"),
            .source = .npm,
            .url = null,
            .resolved = null,
            .integrity = null,
            .dependencies = null,
        };
        const key = try std.fmt.allocPrint(allocator, "direct-version@^2.0.0", .{});
        try lockfile.packages.put(key, pkg);
    }

    // Add a catalog dependency
    if (manager.resolveCatalogReference("from-catalog", "catalog:")) |version| {
        const pkg = lib.packages.types.LockfilePackage{
            .name = try allocator.dupe(u8, "from-catalog"),
            .version = try allocator.dupe(u8, version),
            .source = .npm,
            .url = null,
            .resolved = null,
            .integrity = null,
            .dependencies = null,
        };
        const key = try std.fmt.allocPrint(allocator, "from-catalog@{s}", .{version});
        try lockfile.packages.put(key, pkg);
    }

    // Both should coexist in lockfile
    try testing.expectEqual(@as(usize, 2), lockfile.packages.count());

    const direct_key = try std.fmt.allocPrint(allocator, "direct-version@^2.0.0", .{});
    defer allocator.free(direct_key);
    try testing.expect(lockfile.packages.contains(direct_key));

    const catalog_key = try std.fmt.allocPrint(allocator, "from-catalog@^1.0.0", .{});
    defer allocator.free(catalog_key);
    try testing.expect(lockfile.packages.contains(catalog_key));
}
