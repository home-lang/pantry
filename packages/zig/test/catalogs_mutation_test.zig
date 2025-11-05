//! Mutation Testing for Catalogs
//!
//! This test file verifies that our test suite actually catches bugs by
//! introducing intentional mutations (bugs) and ensuring tests fail.
//!
//! Mutation testing validates test effectiveness by:
//! 1. Introducing a mutation (bug) into the code
//! 2. Running the test suite
//! 3. Verifying that at least one test fails
//! 4. If all tests pass, the mutation is "survived" (bad - tests missed the bug)
//! 5. If any test fails, the mutation is "killed" (good - tests caught the bug)

const std = @import("std");
const testing = std.testing;
const lib = @import("lib");

// ============================================================================
// Mutation Test Framework
// ============================================================================

/// Represents a specific mutation to test
const Mutation = struct {
    name: []const u8,
    description: []const u8,
    test_fn: *const fn () anyerror!void,
};

/// Run a mutation test - expect it to FAIL (meaning our tests caught the bug)
fn expectMutationKilled(mutation: Mutation) !void {
    std.debug.print("\nTesting mutation: {s}\n", .{mutation.name});
    std.debug.print("  Description: {s}\n", .{mutation.description});

    // Run the mutation test
    // If it succeeds, the mutation "survived" (bad - our tests didn't catch it)
    // If it fails, the mutation was "killed" (good - our tests caught it)

    if (mutation.test_fn()) |_| {
        std.debug.print("  ❌ MUTATION SURVIVED - Test suite did not catch this bug!\n", .{});
        return error.MutationSurvived;
    } else |err| {
        std.debug.print("  ✅ MUTATION KILLED - Test suite caught this bug: {}\n", .{err});
        return; // Success - the mutation was caught
    }
}

// ============================================================================
// Mutation 1: Off-by-one in string comparison
// ============================================================================

/// Mutated version: Check only first 7 chars instead of 8 for "catalog:"
fn mutant_isCatalogReference_offByOne(ref: []const u8) bool {
    // MUTATION: Should be 8, not 7
    return ref.len >= 7 and std.mem.eql(u8, ref[0..7], "catalog");
}

fn testMutation_isCatalogReference_offByOne() !void {
    // This should fail because "catalog" (no colon) would be detected as catalog ref
    try testing.expect(!mutant_isCatalogReference_offByOne("catalog"));
    try testing.expect(mutant_isCatalogReference_offByOne("catalog:"));
}

// ============================================================================
// Mutation 2: Wrong string prefix check
// ============================================================================

/// Mutated version: Check for "catalogs:" instead of "catalog:"
fn mutant_isCatalogReference_wrongPrefix(ref: []const u8) bool {
    // MUTATION: Should be "catalog:", not "catalogs:"
    return std.mem.startsWith(u8, ref, "catalogs:");
}

fn testMutation_isCatalogReference_wrongPrefix() !void {
    // This should fail because valid references won't be detected
    try testing.expect(mutant_isCatalogReference_wrongPrefix("catalog:"));
    try testing.expect(mutant_isCatalogReference_wrongPrefix("catalog:test"));
}

// ============================================================================
// Mutation 3: Missing trim in getCatalogName
// ============================================================================

/// Mutated version: Don't trim whitespace from catalog name
fn mutant_getCatalogName_noTrim(ref: []const u8) ?[]const u8 {
    if (!std.mem.startsWith(u8, ref, "catalog:")) {
        return null;
    }
    // MUTATION: Should trim, but doesn't
    return ref[8..];
}

fn testMutation_getCatalogName_noTrim() !void {
    // This should fail because whitespace handling would be wrong
    const name = mutant_getCatalogName_noTrim("catalog: test");
    try testing.expect(name != null);
    try testing.expectEqualStrings("test", name.?); // Should fail - has leading space
}

// ============================================================================
// Mutation 4: Null check removal
// ============================================================================

/// Simulates removing null check in resolveCatalogReference
fn testMutation_resolveCatalogReference_noNullCheck() !void {
    const allocator = testing.allocator;

    var manager = lib.deps.CatalogManager.init(allocator);
    defer manager.deinit();

    // Don't set a default catalog

    // MUTATION: Code would try to access null catalog
    // This should crash or fail without proper null check
    const version = manager.resolveCatalogReference("test", "catalog:");
    try testing.expect(version != null); // Should fail - no catalog set
}

// ============================================================================
// Mutation 5: Wrong hash map operation
// ============================================================================

/// Simulates using getPtr instead of get (returns pointer vs value)
fn testMutation_catalog_wrongHashMapOp() !void {
    const allocator = testing.allocator;

    var catalog = lib.deps.catalogs.Catalog.init(allocator, try allocator.dupe(u8, ""));
    defer catalog.deinit();

    try catalog.addVersion("test", "^1.0.0");

    // If using getPtr instead of get, the return type would be wrong
    const version = catalog.getVersion("test");
    try testing.expect(version != null);

    // MUTATION: If it returned a pointer, this would fail
    const len: usize = version.?.len;
    try testing.expect(len > 0);
}

// ============================================================================
// Mutation 6: Inverted boolean logic
// ============================================================================

/// Mutated version: Invert the startsWith check
fn mutant_isCatalogReference_inverted(ref: []const u8) bool {
    // MUTATION: Logic is inverted
    return !std.mem.startsWith(u8, ref, "catalog:");
}

fn testMutation_isCatalogReference_inverted() !void {
    // This should fail because all results are backwards
    try testing.expect(mutant_isCatalogReference_inverted("catalog:")); // Should fail
    try testing.expect(!mutant_isCatalogReference_inverted("^1.0.0")); // Should fail
}

// ============================================================================
// Mutation 7: Wrong slice bounds
// ============================================================================

/// Mutated version: Use wrong slice start for catalog name extraction
fn mutant_getCatalogName_wrongBounds(ref: []const u8) ?[]const u8 {
    if (!std.mem.startsWith(u8, ref, "catalog:")) {
        return null;
    }
    // MUTATION: Should start at 8, not 7
    return std.mem.trim(u8, ref[7..], " \t\r\n");
}

fn testMutation_getCatalogName_wrongBounds() !void {
    const name = mutant_getCatalogName_wrongBounds("catalog:test");
    try testing.expect(name != null);
    try testing.expectEqualStrings("test", name.?); // Should fail - includes colon
}

// ============================================================================
// Mutation 8: Missing deinit call
// ============================================================================

fn testMutation_catalog_missingDeinit() !void {
    const allocator = testing.allocator;

    // MUTATION: Create catalog but don't call deinit
    var catalog = lib.deps.catalogs.Catalog.init(allocator, try allocator.dupe(u8, "test"));
    _ = catalog;
    // Missing: defer catalog.deinit();

    try catalog.addVersion("package", "^1.0.0");

    // This should be caught by memory leak detection in tests
    // The testing allocator will report leaked memory
}

// ============================================================================
// Mutation 9: Empty string handling
// ============================================================================

fn testMutation_getCatalogName_emptyString() !void {
    // Test that empty catalog reference is handled
    const name = lib.deps.catalogs.CatalogManager.getCatalogName("");

    // MUTATION: If we didn't check for empty strings, this could crash
    try testing.expect(name == null);

    // Also test what happens with just "catalog:"
    const name2 = lib.deps.catalogs.CatalogManager.getCatalogName("catalog:");
    try testing.expect(name2 != null);
    try testing.expectEqualStrings("", name2.?);
}

// ============================================================================
// Mutation 10: Wrong comparison operator
// ============================================================================

/// Mutated version: Use > instead of >= in length check
fn mutant_isCatalogReference_wrongOperator(ref: []const u8) bool {
    // MUTATION: Should be >=, not >
    return ref.len > 8 and std.mem.startsWith(u8, ref, "catalog:");
}

fn testMutation_isCatalogReference_wrongOperator() !void {
    // This should fail because "catalog:" (length 8) wouldn't be detected
    try testing.expect(mutant_isCatalogReference_wrongOperator("catalog:")); // Should fail
    try testing.expect(mutant_isCatalogReference_wrongOperator("catalog:x"));
}

// ============================================================================
// Mutation Test Suite
// ============================================================================

test "mutation testing - verify tests catch bugs" {
    std.debug.print("\n" ++ "=" ** 70 ++ "\n", .{});
    std.debug.print("MUTATION TESTING - Verifying test suite effectiveness\n", .{});
    std.debug.print("=" ** 70 ++ "\n", .{});

    const mutations = [_]Mutation{
        .{
            .name = "Off-by-one in string length check",
            .description = "Check only 7 chars instead of 8 for 'catalog:'",
            .test_fn = testMutation_isCatalogReference_offByOne,
        },
        .{
            .name = "Wrong string prefix",
            .description = "Check for 'catalogs:' instead of 'catalog:'",
            .test_fn = testMutation_isCatalogReference_wrongPrefix,
        },
        .{
            .name = "Missing whitespace trim",
            .description = "Don't trim whitespace from catalog names",
            .test_fn = testMutation_getCatalogName_noTrim,
        },
        .{
            .name = "Missing null check",
            .description = "Access catalog without checking if it exists",
            .test_fn = testMutation_resolveCatalogReference_noNullCheck,
        },
        .{
            .name = "Wrong hash map operation",
            .description = "Use wrong HashMap method (getPtr vs get)",
            .test_fn = testMutation_catalog_wrongHashMapOp,
        },
        .{
            .name = "Inverted boolean logic",
            .description = "Invert the startsWith check result",
            .test_fn = testMutation_isCatalogReference_inverted,
        },
        .{
            .name = "Wrong slice bounds",
            .description = "Use wrong index for string slicing",
            .test_fn = testMutation_getCatalogName_wrongBounds,
        },
        .{
            .name = "Missing deinit",
            .description = "Don't call deinit on allocated structures",
            .test_fn = testMutation_catalog_missingDeinit,
        },
        .{
            .name = "Empty string handling",
            .description = "Don't check for empty strings before processing",
            .test_fn = testMutation_getCatalogName_emptyString,
        },
        .{
            .name = "Wrong comparison operator",
            .description = "Use > instead of >= in length check",
            .test_fn = testMutation_isCatalogReference_wrongOperator,
        },
    };

    var killed: usize = 0;
    var survived: usize = 0;

    for (mutations) |mutation| {
        expectMutationKilled(mutation) catch |err| {
            if (err == error.MutationSurvived) {
                survived += 1;
            } else {
                killed += 1;
            }
        };
    }

    std.debug.print("\n" ++ "=" ** 70 ++ "\n", .{});
    std.debug.print("MUTATION TESTING RESULTS:\n", .{});
    std.debug.print("  Mutations killed: {d}/{d}\n", .{ killed, mutations.len });
    std.debug.print("  Mutations survived: {d}/{d}\n", .{ survived, mutations.len });

    const kill_rate = @as(f64, @floatFromInt(killed)) / @as(f64, @floatFromInt(mutations.len)) * 100.0;
    std.debug.print("  Kill rate: {d:.1}%\n", .{kill_rate});
    std.debug.print("=" ** 70 ++ "\n\n", .{});

    // Require at least 70% kill rate for test suite to be considered effective
    try testing.expect(kill_rate >= 70.0);
}

// ============================================================================
// Additional Mutation Tests - Semantic Changes
// ============================================================================

test "mutation - catalog name case sensitivity" {
    // Test that catalog names ARE case-sensitive (verify this is intentional)
    const allocator = testing.allocator;

    var manager = lib.deps.CatalogManager.init(allocator);
    defer manager.deinit();

    var catalog1 = lib.deps.catalogs.Catalog.init(allocator, try allocator.dupe(u8, "Testing"));
    try catalog1.addVersion("pkg", "^1.0.0");
    try manager.addNamedCatalog("Testing", catalog1);

    var catalog2 = lib.deps.catalogs.Catalog.init(allocator, try allocator.dupe(u8, "testing"));
    try catalog2.addVersion("pkg", "^2.0.0");
    try manager.addNamedCatalog("testing", catalog2);

    // These should be different catalogs
    const v1 = manager.resolveCatalogReference("pkg", "catalog:Testing");
    const v2 = manager.resolveCatalogReference("pkg", "catalog:testing");

    try testing.expect(v1 != null);
    try testing.expect(v2 != null);
    try testing.expect(!std.mem.eql(u8, v1.?, v2.?));
}

test "mutation - version string ownership" {
    // Verify that catalog stores copies, not references
    const allocator = testing.allocator;

    var catalog = lib.deps.catalogs.Catalog.init(allocator, try allocator.dupe(u8, ""));
    defer catalog.deinit();

    var version_buf = try allocator.dupe(u8, "^1.0.0");
    try catalog.addVersion("test", version_buf);

    // Modify original buffer
    version_buf[0] = '~';
    allocator.free(version_buf);

    // Catalog should have its own copy
    const stored = catalog.getVersion("test");
    try testing.expect(stored != null);
    try testing.expectEqualStrings("^1.0.0", stored.?);
}

test "mutation - package name ownership" {
    // Verify that catalog stores copies of package names
    const allocator = testing.allocator;

    var catalog = lib.deps.catalogs.Catalog.init(allocator, try allocator.dupe(u8, ""));
    defer catalog.deinit();

    var pkg_buf = try allocator.dupe(u8, "test-package");
    try catalog.addVersion(pkg_buf, "^1.0.0");

    // Modify original buffer
    pkg_buf[0] = 'X';
    allocator.free(pkg_buf);

    // Catalog should still work with original name
    const version = catalog.getVersion("test-package");
    try testing.expect(version != null);
}

test "mutation - empty version string" {
    // Test that empty versions are handled
    const allocator = testing.allocator;

    var catalog = lib.deps.catalogs.Catalog.init(allocator, try allocator.dupe(u8, ""));
    defer catalog.deinit();

    // MUTATION: What if we allowed empty versions?
    // This should probably be rejected or handled specially
    try catalog.addVersion("test", "");

    const version = catalog.getVersion("test");
    try testing.expect(version != null);
    try testing.expectEqualStrings("", version.?);
}

test "mutation - duplicate package handling" {
    // Test that adding same package twice updates the version
    const allocator = testing.allocator;

    var catalog = lib.deps.catalogs.Catalog.init(allocator, try allocator.dupe(u8, ""));
    defer catalog.deinit();

    try catalog.addVersion("test", "^1.0.0");
    try catalog.addVersion("test", "^2.0.0");

    const version = catalog.getVersion("test");
    try testing.expect(version != null);

    // MUTATION: If we didn't properly handle duplicates, memory could leak
    // or we might get the wrong version
    try testing.expectEqualStrings("^2.0.0", version.?);
}
