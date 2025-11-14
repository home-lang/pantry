const std = @import("std");
const testing = std.testing;
const pantry = @import("pantry");

// ============================================================================
// Optimized Cache Tests
// ============================================================================

test "OptimizedCache - basic operations" {
    const allocator = testing.allocator;

    var cache = try pantry.cache.OptimizedCache.init(allocator, .{});
    defer cache.deinit();

    const name = "test-pkg";
    const version = "1.0.0";
    const url = "https://example.com/pkg.tgz";
    const checksum = [_]u8{0} ** 32;
    const data = "test package data";

    // Put package
    try cache.put(name, version, url, checksum, data);

    // Check if cached
    try testing.expect(try cache.has(name, version));

    // Get metadata
    const meta = try cache.get(name, version);
    try testing.expect(meta != null);
    try testing.expectEqualStrings(name, meta.?.name);

    // Get statistics
    const stats = try cache.getStatistics();
    try testing.expect(stats.total_packages == 1);
    try testing.expect(stats.total_size > 0);
    try testing.expect(stats.hits > 0);
}

test "OptimizedCache - compression" {
    const allocator = testing.allocator;

    var cache = try pantry.cache.OptimizedCache.init(allocator, .{
        .compression = .gzip,
    });
    defer cache.deinit();

    const name = "compressed-pkg";
    const version = "2.0.0";
    const url = "https://example.com/compressed.tgz";
    const checksum = [_]u8{0} ** 32;

    // Create large data to compress
    var large_data = try allocator.alloc(u8, 10000);
    defer allocator.free(large_data);
    @memset(large_data, 'A');

    // Put package with compression
    try cache.put(name, version, url, checksum, large_data);

    // Verify it's cached
    try testing.expect(try cache.has(name, version));

    // Read and decompress
    const read_data = try cache.read(name, version);
    try testing.expect(read_data != null);
    defer allocator.free(read_data.?);

    try testing.expectEqualSlices(u8, large_data, read_data.?);
}

test "OptimizedCache - statistics" {
    const allocator = testing.allocator;

    var cache = try pantry.cache.OptimizedCache.init(allocator, .{
        .collect_stats = true,
    });
    defer cache.deinit();

    // Add multiple packages
    var i: usize = 0;
    while (i < 5) : (i += 1) {
        var name_buf: [64]u8 = undefined;
        const name = try std.fmt.bufPrint(&name_buf, "pkg_{d}", .{i});
        const checksum = [_]u8{0} ** 32;
        try cache.put(name, "1.0.0", "http://test", checksum, "data");
    }

    // Get statistics
    const stats = try cache.getStatistics();
    try testing.expect(stats.total_packages == 5);
    try testing.expect(stats.hits + stats.misses > 0);
    try testing.expect(stats.avg_package_size > 0);
}

test "OptimizedCache - TTL expiration" {
    const allocator = testing.allocator;

    var cache = try pantry.cache.OptimizedCache.init(allocator, .{
        .max_age_seconds = 1, // 1 second
    });
    defer cache.deinit();

    const name = "expiring-pkg";
    const version = "1.0.0";
    const url = "https://example.com/pkg.tgz";
    const checksum = [_]u8{0} ** 32;
    const data = "test data";

    // Put package
    try cache.put(name, version, url, checksum, data);

    // Should be cached immediately
    try testing.expect(try cache.has(name, version));

    // Wait for expiration
    std.time.sleep(1_500_000_000); // 1.5 seconds

    // Should be expired now
    const result = try cache.get(name, version);
    try testing.expect(result == null);
}

test "OptimizedCache - clean" {
    const allocator = testing.allocator;

    var cache = try pantry.cache.OptimizedCache.init(allocator, .{});
    defer cache.deinit();

    // Add packages
    var i: usize = 0;
    while (i < 3) : (i += 1) {
        var name_buf: [64]u8 = undefined;
        const name = try std.fmt.bufPrint(&name_buf, "pkg_{d}", .{i});
        const checksum = [_]u8{0} ** 32;
        try cache.put(name, "1.0.0", "http://test", checksum, "data");
    }

    var stats = try cache.getStatistics();
    try testing.expect(stats.total_packages == 3);

    // Clean cache
    try cache.clean();

    stats = try cache.getStatistics();
    try testing.expect(stats.total_packages == 0);
}

// ============================================================================
// Shared Cache Tests
// ============================================================================

test "SharedCache - basic operations" {
    const allocator = testing.allocator;

    var cache = try pantry.cache.SharedCache.init(allocator, .{
        .location = .user,
        .enable_locking = false, // Disable for testing
    });
    defer cache.deinit();

    const name = "shared-pkg";
    const version = "1.0.0";
    const url = "https://example.com/pkg.tgz";
    const checksum = [_]u8{0} ** 32;
    const data = "shared package data";

    // Put package
    try cache.put(name, version, url, checksum, data);

    // Check if cached
    try testing.expect(try cache.has(name, version));

    // Get metadata
    const meta = try cache.get(name, version);
    try testing.expect(meta != null);
}

test "SharedCache - thread safety" {
    const allocator = testing.allocator;

    var cache = try pantry.cache.SharedCache.init(allocator, .{
        .location = .user,
        .enable_locking = true,
    });
    defer cache.deinit();

    // Test locking
    try cache.lock();
    defer cache.unlock();

    // Can still perform operations while locked
    const checksum = [_]u8{0} ** 32;
    try cache.cache.put("locked-pkg", "1.0.0", "http://test", checksum, "data");
}

// ============================================================================
// Workspace Configuration Tests
// ============================================================================

test "WorkspaceConfig - from JSON" {
    const allocator = testing.allocator;

    const config_json =
        \\{
        \\  "workspace": {
        \\    "packages": [
        \\      "packages/*",
        \\      "apps/*"
        \\    ],
        \\    "sharedDeps": true,
        \\    "hoist": true,
        \\    "name": "test-workspace",
        \\    "version": "1.0.0"
        \\  }
        \\}
    ;

    const parsed = try std.json.parseFromSlice(std.json.Value, allocator, config_json, .{});
    defer parsed.deinit();

    var config = try pantry.workspace.WorkspaceConfig.fromJson(allocator, parsed.value, "/test/root");
    defer config.deinit(allocator);

    try testing.expectEqualStrings("/test/root", config.root);
    try testing.expect(config.packages.len == 2);
    try testing.expectEqualStrings("packages/*", config.packages[0]);
    try testing.expectEqualStrings("apps/*", config.packages[1]);
    try testing.expect(config.shared_deps == true);
    try testing.expect(config.hoist == true);
    try testing.expectEqualStrings("test-workspace", config.name.?);
    try testing.expectEqualStrings("1.0.0", config.version.?);
}

// ============================================================================
// Workspace Package Tests
// ============================================================================

test "WorkspacePackage - deinit" {
    const allocator = testing.allocator;

    var pkg = pantry.workspace.WorkspacePackage{
        .name = try allocator.dupe(u8, "test-pkg"),
        .version = try allocator.dupe(u8, "1.0.0"),
        .path = try allocator.dupe(u8, "packages/test"),
        .dependencies = std.StringHashMap([]const u8).init(allocator),
        .dev_dependencies = std.StringHashMap([]const u8).init(allocator),
        .bin = std.StringHashMap([]const u8).init(allocator),
    };
    defer pkg.deinit(allocator);

    try testing.expectEqualStrings("test-pkg", pkg.name);
}

// ============================================================================
// Dependency Graph Tests
// ============================================================================

test "DependencyGraph - basic operations" {
    const allocator = testing.allocator;

    var graph = pantry.workspace.DependencyGraph.init(allocator);
    defer graph.deinit();

    // Create test packages
    var pkg1 = pantry.workspace.WorkspacePackage{
        .name = try allocator.dupe(u8, "pkg1"),
        .version = try allocator.dupe(u8, "1.0.0"),
        .path = try allocator.dupe(u8, "packages/pkg1"),
        .dependencies = std.StringHashMap([]const u8).init(allocator),
        .dev_dependencies = std.StringHashMap([]const u8).init(allocator),
        .bin = std.StringHashMap([]const u8).init(allocator),
    };
    defer pkg1.deinit(allocator);

    var pkg2 = pantry.workspace.WorkspacePackage{
        .name = try allocator.dupe(u8, "pkg2"),
        .version = try allocator.dupe(u8, "1.0.0"),
        .path = try allocator.dupe(u8, "packages/pkg2"),
        .dependencies = std.StringHashMap([]const u8).init(allocator),
        .dev_dependencies = std.StringHashMap([]const u8).init(allocator),
        .bin = std.StringHashMap([]const u8).init(allocator),
    };
    defer pkg2.deinit(allocator);

    // pkg2 depends on pkg1
    try pkg2.dependencies.put(try allocator.dupe(u8, "pkg1"), try allocator.dupe(u8, "1.0.0"));

    // Add to graph
    try graph.addPackage(&pkg1);
    try graph.addPackage(&pkg2);

    // Get topological sort
    const build_order = try graph.topologicalSort();
    defer {
        for (build_order) |name| {
            allocator.free(name);
        }
        allocator.free(build_order);
    }

    try testing.expect(build_order.len == 2);
    // pkg1 should come before pkg2
    try testing.expectEqualStrings("pkg1", build_order[0]);
    try testing.expectEqualStrings("pkg2", build_order[1]);
}

test "DependencyGraph - circular dependency detection" {
    const allocator = testing.allocator;

    var graph = pantry.workspace.DependencyGraph.init(allocator);
    defer graph.deinit();

    // Create test packages with circular dependency
    var pkg1 = pantry.workspace.WorkspacePackage{
        .name = try allocator.dupe(u8, "pkg1"),
        .version = try allocator.dupe(u8, "1.0.0"),
        .path = try allocator.dupe(u8, "packages/pkg1"),
        .dependencies = std.StringHashMap([]const u8).init(allocator),
        .dev_dependencies = std.StringHashMap([]const u8).init(allocator),
        .bin = std.StringHashMap([]const u8).init(allocator),
    };
    defer pkg1.deinit(allocator);

    var pkg2 = pantry.workspace.WorkspacePackage{
        .name = try allocator.dupe(u8, "pkg2"),
        .version = try allocator.dupe(u8, "1.0.0"),
        .path = try allocator.dupe(u8, "packages/pkg2"),
        .dependencies = std.StringHashMap([]const u8).init(allocator),
        .dev_dependencies = std.StringHashMap([]const u8).init(allocator),
        .bin = std.StringHashMap([]const u8).init(allocator),
    };
    defer pkg2.deinit(allocator);

    // Create circular dependency: pkg1 -> pkg2 -> pkg1
    try pkg1.dependencies.put(try allocator.dupe(u8, "pkg2"), try allocator.dupe(u8, "1.0.0"));
    try pkg2.dependencies.put(try allocator.dupe(u8, "pkg1"), try allocator.dupe(u8, "1.0.0"));

    // Add to graph
    try graph.addPackage(&pkg1);
    try graph.addPackage(&pkg2);

    // Should detect circular dependency
    try testing.expect(graph.hasCircularDependencies());
}

// ============================================================================
// Workspace Commands Tests
// ============================================================================

test "Workspace commands - CommandResult" {
    const allocator = testing.allocator;

    var result = pantry.workspace.CommandResult{
        .success = true,
        .message = try allocator.dupe(u8, "Test message"),
        .packages_affected = 5,
    };
    defer result.deinit(allocator);

    try testing.expect(result.success);
    try testing.expectEqualStrings("Test message", result.message);
    try testing.expect(result.packages_affected == 5);
}

// ============================================================================
// Integration Tests
// ============================================================================

test "Integration - cache with workspace" {
    const allocator = testing.allocator;

    // Initialize optimized cache
    var cache = try pantry.cache.OptimizedCache.init(allocator, .{
        .compression = .gzip,
        .collect_stats = true,
    });
    defer cache.deinit();

    // Simulate caching workspace packages
    const packages = [_]struct { name: []const u8, version: []const u8 }{
        .{ .name = "workspace-pkg1", .version = "1.0.0" },
        .{ .name = "workspace-pkg2", .version = "2.0.0" },
        .{ .name = "workspace-pkg3", .version = "1.5.0" },
    };

    for (packages) |pkg| {
        const checksum = [_]u8{0} ** 32;
        const data = try std.fmt.allocPrint(allocator, "data for {s}", .{pkg.name});
        defer allocator.free(data);

        try cache.put(pkg.name, pkg.version, "http://test", checksum, data);
    }

    // Verify all packages are cached
    for (packages) |pkg| {
        try testing.expect(try cache.has(pkg.name, pkg.version));
    }

    // Check statistics
    const stats = try cache.getStatistics();
    try testing.expect(stats.total_packages == packages.len);
}

test "Integration - workspace dependency resolution" {
    const allocator = testing.allocator;

    var graph = pantry.workspace.DependencyGraph.init(allocator);
    defer graph.deinit();

    // Create complex dependency graph:
    // pkg1 -> pkg2, pkg3
    // pkg2 -> pkg3
    // pkg3 (no deps)
    // pkg4 -> pkg1

    var pkg1 = pantry.workspace.WorkspacePackage{
        .name = try allocator.dupe(u8, "pkg1"),
        .version = try allocator.dupe(u8, "1.0.0"),
        .path = try allocator.dupe(u8, "p1"),
        .dependencies = std.StringHashMap([]const u8).init(allocator),
        .dev_dependencies = std.StringHashMap([]const u8).init(allocator),
        .bin = std.StringHashMap([]const u8).init(allocator),
    };
    defer pkg1.deinit(allocator);

    var pkg2 = pantry.workspace.WorkspacePackage{
        .name = try allocator.dupe(u8, "pkg2"),
        .version = try allocator.dupe(u8, "1.0.0"),
        .path = try allocator.dupe(u8, "p2"),
        .dependencies = std.StringHashMap([]const u8).init(allocator),
        .dev_dependencies = std.StringHashMap([]const u8).init(allocator),
        .bin = std.StringHashMap([]const u8).init(allocator),
    };
    defer pkg2.deinit(allocator);

    var pkg3 = pantry.workspace.WorkspacePackage{
        .name = try allocator.dupe(u8, "pkg3"),
        .version = try allocator.dupe(u8, "1.0.0"),
        .path = try allocator.dupe(u8, "p3"),
        .dependencies = std.StringHashMap([]const u8).init(allocator),
        .dev_dependencies = std.StringHashMap([]const u8).init(allocator),
        .bin = std.StringHashMap([]const u8).init(allocator),
    };
    defer pkg3.deinit(allocator);

    var pkg4 = pantry.workspace.WorkspacePackage{
        .name = try allocator.dupe(u8, "pkg4"),
        .version = try allocator.dupe(u8, "1.0.0"),
        .path = try allocator.dupe(u8, "p4"),
        .dependencies = std.StringHashMap([]const u8).init(allocator),
        .dev_dependencies = std.StringHashMap([]const u8).init(allocator),
        .bin = std.StringHashMap([]const u8).init(allocator),
    };
    defer pkg4.deinit(allocator);

    // Setup dependencies
    try pkg1.dependencies.put(try allocator.dupe(u8, "pkg2"), try allocator.dupe(u8, "1.0.0"));
    try pkg1.dependencies.put(try allocator.dupe(u8, "pkg3"), try allocator.dupe(u8, "1.0.0"));
    try pkg2.dependencies.put(try allocator.dupe(u8, "pkg3"), try allocator.dupe(u8, "1.0.0"));
    try pkg4.dependencies.put(try allocator.dupe(u8, "pkg1"), try allocator.dupe(u8, "1.0.0"));

    // Add to graph
    try graph.addPackage(&pkg1);
    try graph.addPackage(&pkg2);
    try graph.addPackage(&pkg3);
    try graph.addPackage(&pkg4);

    // Get build order
    const build_order = try graph.topologicalSort();
    defer {
        for (build_order) |name| {
            allocator.free(name);
        }
        allocator.free(build_order);
    }

    try testing.expect(build_order.len == 4);

    // pkg3 should come first (no dependencies)
    try testing.expectEqualStrings("pkg3", build_order[0]);
    // pkg2 depends on pkg3, so comes after
    try testing.expectEqualStrings("pkg2", build_order[1]);
    // pkg1 depends on pkg2 and pkg3
    try testing.expectEqualStrings("pkg1", build_order[2]);
    // pkg4 depends on pkg1
    try testing.expectEqualStrings("pkg4", build_order[3]);
}
