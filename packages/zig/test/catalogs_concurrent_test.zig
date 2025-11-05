//! Concurrent Catalog Access Tests
//!
//! These tests verify thread safety and concurrent access patterns.

const std = @import("std");
const testing = std.testing;
const lib = @import("lib");

// ============================================================================
// Concurrent Resolution Tests
// ============================================================================

test "concurrent catalog resolution - multiple threads reading" {
    const allocator = testing.allocator;

    var manager = lib.deps.CatalogManager.init(allocator);
    defer manager.deinit();

    // Setup catalog with many packages
    var catalog = lib.deps.catalogs.Catalog.init(allocator, try allocator.dupe(u8, ""));
    for (0..100) |i| {
        const pkg_name = try std.fmt.allocPrint(allocator, "package-{d}", .{i});
        defer allocator.free(pkg_name);
        const version = try std.fmt.allocPrint(allocator, "^{d}.0.0", .{i});
        defer allocator.free(version);
        try catalog.addVersion(pkg_name, version);
    }
    manager.setDefaultCatalog(catalog);

    // Create thread pool
    const num_threads = 8;
    var threads: [num_threads]std.Thread = undefined;
    var results: [num_threads]bool = [_]bool{false} ** num_threads;

    // Launch threads that all read from catalog concurrently
    for (0..num_threads) |i| {
        threads[i] = try std.Thread.spawn(.{}, readCatalogWorker, .{ &manager, &results[i], i });
    }

    // Wait for all threads
    for (threads) |thread| {
        thread.join();
    }

    // Verify all threads succeeded
    for (results, 0..) |result, i| {
        try testing.expect(result);
        if (!result) {
            std.debug.print("Thread {d} failed\n", .{i});
        }
    }
}

fn readCatalogWorker(manager: *lib.deps.CatalogManager, result: *bool, thread_id: usize) void {
    var success = true;

    // Each thread reads different packages
    const start_idx = thread_id * 10;
    const end_idx = start_idx + 10;

    for (start_idx..end_idx) |i| {
        const pkg_name_buf = std.fmt.allocPrint(
            std.heap.page_allocator,
            "package-{d}",
            .{i},
        ) catch {
            success = false;
            break;
        };
        defer std.heap.page_allocator.free(pkg_name_buf);

        const version = manager.resolveCatalogReference(pkg_name_buf, "catalog:");
        if (version == null) {
            success = false;
            break;
        }

        const expected = std.fmt.allocPrint(
            std.heap.page_allocator,
            "^{d}.0.0",
            .{i},
        ) catch {
            success = false;
            break;
        };
        defer std.heap.page_allocator.free(expected);

        if (!std.mem.eql(u8, version.?, expected)) {
            success = false;
            break;
        }
    }

    result.* = success;
}

test "concurrent catalog resolution - stress test" {
    const allocator = testing.allocator;

    var manager = lib.deps.CatalogManager.init(allocator);
    defer manager.deinit();

    // Setup large catalog
    var catalog = lib.deps.catalogs.Catalog.init(allocator, try allocator.dupe(u8, ""));
    for (0..500) |i| {
        const pkg_name = try std.fmt.allocPrint(allocator, "package-{d}", .{i});
        defer allocator.free(pkg_name);
        try catalog.addVersion(pkg_name, "^1.0.0");
    }
    manager.setDefaultCatalog(catalog);

    // Many threads doing many lookups
    const num_threads = 16;
    const lookups_per_thread = 1000;
    var threads: [num_threads]std.Thread = undefined;
    var success_counts: [num_threads]usize = [_]usize{0} ** num_threads;

    for (0..num_threads) |i| {
        threads[i] = try std.Thread.spawn(.{}, stressTestWorker, .{ &manager, &success_counts[i], lookups_per_thread });
    }

    for (threads) |thread| {
        thread.join();
    }

    // Verify all lookups succeeded
    var total_successes: usize = 0;
    for (success_counts) |count| {
        total_successes += count;
    }

    try testing.expectEqual(num_threads * lookups_per_thread, total_successes);
}

fn stressTestWorker(manager: *lib.deps.CatalogManager, success_count: *usize, num_lookups: usize) void {
    var successes: usize = 0;

    for (0..num_lookups) |i| {
        const pkg_idx = i % 500; // Cycle through packages
        const pkg_name = std.fmt.allocPrint(
            std.heap.page_allocator,
            "package-{d}",
            .{pkg_idx},
        ) catch continue;
        defer std.heap.page_allocator.free(pkg_name);

        const version = manager.resolveCatalogReference(pkg_name, "catalog:");
        if (version != null and std.mem.eql(u8, version.?, "^1.0.0")) {
            successes += 1;
        }
    }

    success_count.* = successes;
}

test "concurrent named catalog access" {
    const allocator = testing.allocator;

    var manager = lib.deps.CatalogManager.init(allocator);
    defer manager.deinit();

    // Create multiple named catalogs
    for (0..10) |i| {
        const catalog_name = try std.fmt.allocPrint(allocator, "catalog-{d}", .{i});
        defer allocator.free(catalog_name);

        var catalog = lib.deps.catalogs.Catalog.init(allocator, try allocator.dupe(u8, catalog_name));
        try catalog.addVersion("test-package", "^1.0.0");
        try manager.addNamedCatalog(catalog_name, catalog);
    }

    // Threads accessing different catalogs concurrently
    const num_threads = 10;
    var threads: [num_threads]std.Thread = undefined;
    var results: [num_threads]bool = [_]bool{false} ** num_threads;

    for (0..num_threads) |i| {
        threads[i] = try std.Thread.spawn(.{}, namedCatalogWorker, .{ &manager, &results[i], i });
    }

    for (threads) |thread| {
        thread.join();
    }

    // All should succeed
    for (results) |result| {
        try testing.expect(result);
    }
}

fn namedCatalogWorker(manager: *lib.deps.CatalogManager, result: *bool, catalog_idx: usize) void {
    const catalog_name = std.fmt.allocPrint(
        std.heap.page_allocator,
        "catalog:{d}",
        .{catalog_idx},
    ) catch {
        result.* = false;
        return;
    };
    defer std.heap.page_allocator.free(catalog_name);

    const ref = std.fmt.allocPrint(
        std.heap.page_allocator,
        "catalog:catalog-{d}",
        .{catalog_idx},
    ) catch {
        result.* = false;
        return;
    };
    defer std.heap.page_allocator.free(ref);

    const version = manager.resolveCatalogReference("test-package", ref);
    result.* = version != null and std.mem.eql(u8, version.?, "^1.0.0");
}

// ============================================================================
// Race Condition Tests
// ============================================================================

test "no data races on concurrent reads" {
    const allocator = testing.allocator;

    var manager = lib.deps.CatalogManager.init(allocator);
    defer manager.deinit();

    var catalog = lib.deps.catalogs.Catalog.init(allocator, try allocator.dupe(u8, ""));
    try catalog.addVersion("shared-package", "^1.0.0");
    manager.setDefaultCatalog(catalog);

    // Many threads reading the same package
    const num_threads = 20;
    var threads: [num_threads]std.Thread = undefined;
    var results: [num_threads]bool = [_]bool{false} ** num_threads;

    for (0..num_threads) |i| {
        threads[i] = try std.Thread.spawn(.{}, samePackageWorker, .{ &manager, &results[i] });
    }

    for (threads) |thread| {
        thread.join();
    }

    // All threads should see consistent data
    for (results) |result| {
        try testing.expect(result);
    }
}

fn samePackageWorker(manager: *lib.deps.CatalogManager, result: *bool) void {
    var all_consistent = true;

    // Read the same package many times
    for (0..1000) |_| {
        const version = manager.resolveCatalogReference("shared-package", "catalog:");
        if (version == null or !std.mem.eql(u8, version.?, "^1.0.0")) {
            all_consistent = false;
            break;
        }
    }

    result.* = all_consistent;
}

test "catalog manager is read-only safe" {
    const allocator = testing.allocator;

    var manager = lib.deps.CatalogManager.init(allocator);
    defer manager.deinit();

    // Setup catalog
    var catalog = lib.deps.catalogs.Catalog.init(allocator, try allocator.dupe(u8, ""));
    for (0..50) |i| {
        const pkg_name = try std.fmt.allocPrint(allocator, "pkg-{d}", .{i});
        defer allocator.free(pkg_name);
        try catalog.addVersion(pkg_name, "^1.0.0");
    }
    manager.setDefaultCatalog(catalog);

    // Concurrent readers should never corrupt the catalog
    const num_threads = 10;
    var threads: [num_threads]std.Thread = undefined;

    for (0..num_threads) |i| {
        threads[i] = try std.Thread.spawn(.{}, validateCatalogWorker, .{&manager});
    }

    for (threads) |thread| {
        thread.join();
    }

    // After concurrent access, catalog should still be valid
    // Verify a few packages
    try testing.expect(manager.resolveCatalogReference("pkg-0", "catalog:") != null);
    try testing.expect(manager.resolveCatalogReference("pkg-25", "catalog:") != null);
    try testing.expect(manager.resolveCatalogReference("pkg-49", "catalog:") != null);
}

fn validateCatalogWorker(manager: *lib.deps.CatalogManager) void {
    // Each thread validates random packages
    var prng = std.rand.DefaultPrng.init(0);
    const random = prng.random();

    for (0..100) |_| {
        const pkg_idx = random.intRangeAtMost(usize, 0, 49);
        const pkg_name = std.fmt.allocPrint(
            std.heap.page_allocator,
            "pkg-{d}",
            .{pkg_idx},
        ) catch continue;
        defer std.heap.page_allocator.free(pkg_name);

        _ = manager.resolveCatalogReference(pkg_name, "catalog:");
    }
}

// ============================================================================
// Performance Under Concurrency
// ============================================================================

test "concurrent access maintains performance" {
    const allocator = testing.allocator;

    var manager = lib.deps.CatalogManager.init(allocator);
    defer manager.deinit();

    // Large catalog
    var catalog = lib.deps.catalogs.Catalog.init(allocator, try allocator.dupe(u8, ""));
    for (0..1000) |i| {
        const pkg_name = try std.fmt.allocPrint(allocator, "package-{d}", .{i});
        defer allocator.free(pkg_name);
        try catalog.addVersion(pkg_name, "^1.0.0");
    }
    manager.setDefaultCatalog(catalog);

    const num_threads = 8;
    const lookups_per_thread = 10000;

    const start = std.time.milliTimestamp();

    var threads: [num_threads]std.Thread = undefined;
    var success_counts: [num_threads]usize = [_]usize{0} ** num_threads;

    for (0..num_threads) |i| {
        threads[i] = try std.Thread.spawn(.{}, performanceWorker, .{ &manager, &success_counts[i], lookups_per_thread });
    }

    for (threads) |thread| {
        thread.join();
    }

    const end = std.time.milliTimestamp();
    const duration_ms = end - start;

    const total_lookups = num_threads * lookups_per_thread;
    const lookups_per_ms = @as(f64, @floatFromInt(total_lookups)) / @as(f64, @floatFromInt(duration_ms));

    std.debug.print("\nConcurrent Performance: {d} lookups in {d}ms ({d:.0} lookups/ms)\n", .{ total_lookups, duration_ms, lookups_per_ms });

    // Should be very fast - at least 1000 lookups per ms across all threads
    try testing.expect(lookups_per_ms > 1000.0);
}

fn performanceWorker(manager: *lib.deps.CatalogManager, success_count: *usize, num_lookups: usize) void {
    var successes: usize = 0;

    for (0..num_lookups) |i| {
        const pkg_idx = i % 1000;
        const pkg_name = std.fmt.allocPrint(
            std.heap.page_allocator,
            "package-{d}",
            .{pkg_idx},
        ) catch continue;
        defer std.heap.page_allocator.free(pkg_name);

        const version = manager.resolveCatalogReference(pkg_name, "catalog:");
        if (version != null) {
            successes += 1;
        }
    }

    success_count.* = successes;
}

// ============================================================================
// Thread Safety Verification
// ============================================================================

test "isCatalogReference is thread-safe" {
    // This function should be safe to call from multiple threads
    const num_threads = 10;
    var threads: [num_threads]std.Thread = undefined;
    var results: [num_threads]bool = [_]bool{false} ** num_threads;

    for (0..num_threads) |i| {
        threads[i] = try std.Thread.spawn(.{}, isCatalogRefWorker, .{&results[i]});
    }

    for (threads) |thread| {
        thread.join();
    }

    for (results) |result| {
        try testing.expect(result);
    }
}

fn isCatalogRefWorker(result: *bool) void {
    var all_correct = true;

    for (0..1000) |_| {
        if (!lib.deps.catalogs.CatalogManager.isCatalogReference("catalog:")) {
            all_correct = false;
            break;
        }
        if (!lib.deps.catalogs.CatalogManager.isCatalogReference("catalog:testing")) {
            all_correct = false;
            break;
        }
        if (lib.deps.catalogs.CatalogManager.isCatalogReference("^1.0.0")) {
            all_correct = false;
            break;
        }
    }

    result.* = all_correct;
}

test "getCatalogName is thread-safe" {
    const num_threads = 10;
    var threads: [num_threads]std.Thread = undefined;
    var results: [num_threads]bool = [_]bool{false} ** num_threads;

    for (0..num_threads) |i| {
        threads[i] = try std.Thread.spawn(.{}, getCatalogNameWorker, .{&results[i]});
    }

    for (threads) |thread| {
        thread.join();
    }

    for (results) |result| {
        try testing.expect(result);
    }
}

fn getCatalogNameWorker(result: *bool) void {
    var all_correct = true;

    for (0..1000) |_| {
        const name1 = lib.deps.catalogs.CatalogManager.getCatalogName("catalog:");
        if (name1 == null or name1.?.len != 0) {
            all_correct = false;
            break;
        }

        const name2 = lib.deps.catalogs.CatalogManager.getCatalogName("catalog:testing");
        if (name2 == null or !std.mem.eql(u8, name2.?, "testing")) {
            all_correct = false;
            break;
        }
    }

    result.* = all_correct;
}
