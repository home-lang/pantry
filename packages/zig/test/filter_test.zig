//! Comprehensive tests for the filter functionality

const std = @import("std");
const testing = std.testing;
const filter_module = @import("../src/packages/filter.zig");
const types = @import("../src/packages/types.zig");

// ============================================================================
// Glob Pattern Matching Tests
// ============================================================================

test "glob: exact match" {
    const pattern = "hello";
    const text = "hello";
    try testing.expect(filter_module.matchGlob(pattern, text));
}

test "glob: no match" {
    const pattern = "hello";
    const text = "world";
    try testing.expect(!filter_module.matchGlob(pattern, text));
}

test "glob: wildcard * at end" {
    try testing.expect(filter_module.matchGlob("pkg-*", "pkg-a"));
    try testing.expect(filter_module.matchGlob("pkg-*", "pkg-b"));
    try testing.expect(filter_module.matchGlob("pkg-*", "pkg-anything"));
    try testing.expect(!filter_module.matchGlob("pkg-*", "other-pkg"));
}

test "glob: wildcard * at beginning" {
    try testing.expect(filter_module.matchGlob("*-test", "unit-test"));
    try testing.expect(filter_module.matchGlob("*-test", "integration-test"));
    try testing.expect(!filter_module.matchGlob("*-test", "test-unit"));
}

test "glob: wildcard * in middle" {
    try testing.expect(filter_module.matchGlob("@org/*", "@org/package-a"));
    try testing.expect(filter_module.matchGlob("@org/*", "@org/package-b"));
    try testing.expect(!filter_module.matchGlob("@org/*", "@other/package"));
}

test "glob: multiple wildcards" {
    try testing.expect(filter_module.matchGlob("*test*", "unit-test-helper"));
    try testing.expect(filter_module.matchGlob("*test*", "test"));
    try testing.expect(filter_module.matchGlob("*test*", "my-test"));
}

test "glob: match all with *" {
    try testing.expect(filter_module.matchGlob("*", "anything"));
    try testing.expect(filter_module.matchGlob("*", ""));
    try testing.expect(filter_module.matchGlob("*", "a"));
}

test "glob: question mark single char" {
    try testing.expect(filter_module.matchGlob("pkg-?", "pkg-a"));
    try testing.expect(filter_module.matchGlob("pkg-?", "pkg-1"));
    try testing.expect(!filter_module.matchGlob("pkg-?", "pkg-ab"));
    try testing.expect(!filter_module.matchGlob("pkg-?", "pkg-"));
}

test "glob: complex patterns" {
    try testing.expect(filter_module.matchGlob("packages/*/src", "packages/foo/src"));
    try testing.expect(filter_module.matchGlob("packages/*/src", "packages/bar/src"));
    try testing.expect(!filter_module.matchGlob("packages/*/src", "packages/foo/test"));
}

test "glob: path-like patterns" {
    try testing.expect(filter_module.matchGlob("./packages/*", "./packages/foo"));
    try testing.expect(filter_module.matchGlob("./packages/*", "./packages/bar"));
    try testing.expect(!filter_module.matchGlob("./packages/*", "./apps/foo"));
}

// ============================================================================
// FilterPattern Tests
// ============================================================================

test "FilterPattern: name pattern creation" {
    const allocator = testing.allocator;
    var pattern = try filter_module.FilterPattern.init(allocator, "pkg-*");
    defer pattern.deinit(allocator);

    try testing.expect(pattern.filter_type == .name);
    try testing.expect(!pattern.is_negation);
    try testing.expectEqualStrings("pkg-*", pattern.pattern);
}

test "FilterPattern: path pattern creation" {
    const allocator = testing.allocator;
    var pattern = try filter_module.FilterPattern.init(allocator, "./packages/*");
    defer pattern.deinit(allocator);

    try testing.expect(pattern.filter_type == .path);
    try testing.expect(!pattern.is_negation);
    try testing.expectEqualStrings("./packages/*", pattern.pattern);
}

test "FilterPattern: root pattern creation" {
    const allocator = testing.allocator;
    var pattern = try filter_module.FilterPattern.init(allocator, "./");
    defer pattern.deinit(allocator);

    try testing.expect(pattern.filter_type == .root);
    try testing.expect(!pattern.is_negation);
}

test "FilterPattern: negation pattern" {
    const allocator = testing.allocator;
    var pattern = try filter_module.FilterPattern.init(allocator, "!pkg-c");
    defer pattern.deinit(allocator);

    try testing.expect(pattern.filter_type == .name);
    try testing.expect(pattern.is_negation);
    try testing.expectEqualStrings("pkg-c", pattern.pattern);
}

test "FilterPattern: negation with path" {
    const allocator = testing.allocator;
    var pattern = try filter_module.FilterPattern.init(allocator, "!./packages/excluded");
    defer pattern.deinit(allocator);

    try testing.expect(pattern.filter_type == .path);
    try testing.expect(pattern.is_negation);
    try testing.expectEqualStrings("./packages/excluded", pattern.pattern);
}

test "FilterPattern: matchesName" {
    const allocator = testing.allocator;
    var pattern = try filter_module.FilterPattern.init(allocator, "pkg-*");
    defer pattern.deinit(allocator);

    try testing.expect(pattern.matchesName("pkg-a"));
    try testing.expect(pattern.matchesName("pkg-b"));
    try testing.expect(pattern.matchesName("pkg-foo"));
    try testing.expect(!pattern.matchesName("other"));
}

test "FilterPattern: matchesPath" {
    const allocator = testing.allocator;
    var pattern = try filter_module.FilterPattern.init(allocator, "./packages/*");
    defer pattern.deinit(allocator);

    try testing.expect(pattern.matchesPath("./packages/foo"));
    try testing.expect(pattern.matchesPath("./packages/bar"));
    try testing.expect(pattern.matchesPath("packages/foo")); // Should work without ./
    try testing.expect(!pattern.matchesPath("./apps/foo"));
}

// ============================================================================
// Filter Tests
// ============================================================================

test "Filter: init empty" {
    const allocator = testing.allocator;
    var filter = filter_module.Filter.init(allocator);
    defer filter.deinit();

    try testing.expect(filter.patterns.len == 0);
}

test "Filter: init with patterns" {
    const allocator = testing.allocator;
    const patterns = [_][]const u8{ "pkg-a", "pkg-b" };
    var filter = try filter_module.Filter.initWithPatterns(allocator, &patterns);
    defer filter.deinit();

    try testing.expect(filter.patterns.len == 2);
}

test "Filter: addPattern" {
    const allocator = testing.allocator;
    var filter = filter_module.Filter.init(allocator);
    defer filter.deinit();

    try filter.addPattern("pkg-*");
    try testing.expect(filter.patterns.len == 1);

    try filter.addPattern("!pkg-c");
    try testing.expect(filter.patterns.len == 2);
}

test "Filter: empty filter matches everything" {
    const allocator = testing.allocator;
    var filter = filter_module.Filter.init(allocator);
    defer filter.deinit();

    try testing.expect(filter.matchesPackageName("anything"));
    try testing.expect(filter.matchesPackageName("pkg-a"));
    try testing.expect(filter.matchesRoot());
}

test "Filter: single name pattern" {
    const allocator = testing.allocator;
    const patterns = [_][]const u8{"pkg-*"};
    var filter = try filter_module.Filter.initWithPatterns(allocator, &patterns);
    defer filter.deinit();

    try testing.expect(filter.matchesPackageName("pkg-a"));
    try testing.expect(filter.matchesPackageName("pkg-b"));
    try testing.expect(!filter.matchesPackageName("other"));
}

test "Filter: name pattern with negation" {
    const allocator = testing.allocator;
    const patterns = [_][]const u8{ "pkg-*", "!pkg-c" };
    var filter = try filter_module.Filter.initWithPatterns(allocator, &patterns);
    defer filter.deinit();

    try testing.expect(filter.matchesPackageName("pkg-a"));
    try testing.expect(filter.matchesPackageName("pkg-b"));
    try testing.expect(!filter.matchesPackageName("pkg-c")); // Excluded
    try testing.expect(!filter.matchesPackageName("other"));
}

test "Filter: multiple inclusion patterns" {
    const allocator = testing.allocator;
    const patterns = [_][]const u8{ "pkg-a", "pkg-b", "other-*" };
    var filter = try filter_module.Filter.initWithPatterns(allocator, &patterns);
    defer filter.deinit();

    try testing.expect(filter.matchesPackageName("pkg-a"));
    try testing.expect(filter.matchesPackageName("pkg-b"));
    try testing.expect(filter.matchesPackageName("other-foo"));
    try testing.expect(!filter.matchesPackageName("pkg-c"));
}

test "Filter: complex negation" {
    const allocator = testing.allocator;
    const patterns = [_][]const u8{ "*", "!*-test", "!dev-*" };
    var filter = try filter_module.Filter.initWithPatterns(allocator, &patterns);
    defer filter.deinit();

    try testing.expect(filter.matchesPackageName("pkg-a"));
    try testing.expect(filter.matchesPackageName("pkg-b"));
    try testing.expect(!filter.matchesPackageName("unit-test"));
    try testing.expect(!filter.matchesPackageName("integration-test"));
    try testing.expect(!filter.matchesPackageName("dev-server"));
}

test "Filter: root matching" {
    const allocator = testing.allocator;
    const patterns = [_][]const u8{"./"};
    var filter = try filter_module.Filter.initWithPatterns(allocator, &patterns);
    defer filter.deinit();

    try testing.expect(filter.matchesRoot());
    try testing.expect(!filter.matchesPackageName("pkg-a"));
}

test "Filter: exclude root" {
    const allocator = testing.allocator;
    const patterns = [_][]const u8{ "*", "!./" };
    var filter = try filter_module.Filter.initWithPatterns(allocator, &patterns);
    defer filter.deinit();

    try testing.expect(!filter.matchesRoot());
    try testing.expect(filter.matchesPackageName("pkg-a"));
}

test "Filter: matchesMember with name pattern" {
    const allocator = testing.allocator;
    const patterns = [_][]const u8{"pkg-*"};
    var filter = try filter_module.Filter.initWithPatterns(allocator, &patterns);
    defer filter.deinit();

    const member_a = types.WorkspaceMember{
        .name = "pkg-a",
        .path = "./packages/pkg-a",
        .abs_path = "/workspace/packages/pkg-a",
        .config_path = null,
        .deps_file_path = null,
    };

    const member_other = types.WorkspaceMember{
        .name = "other",
        .path = "./packages/other",
        .abs_path = "/workspace/packages/other",
        .config_path = null,
        .deps_file_path = null,
    };

    try testing.expect(filter.matchesMember(member_a));
    try testing.expect(!filter.matchesMember(member_other));
}

test "Filter: matchesMember with path pattern" {
    const allocator = testing.allocator;
    const patterns = [_][]const u8{"./packages/*"};
    var filter = try filter_module.Filter.initWithPatterns(allocator, &patterns);
    defer filter.deinit();

    const member_pkg = types.WorkspaceMember{
        .name = "foo",
        .path = "./packages/foo",
        .abs_path = "/workspace/packages/foo",
        .config_path = null,
        .deps_file_path = null,
    };

    const member_app = types.WorkspaceMember{
        .name = "bar",
        .path = "./apps/bar",
        .abs_path = "/workspace/apps/bar",
        .config_path = null,
        .deps_file_path = null,
    };

    try testing.expect(filter.matchesMember(member_pkg));
    try testing.expect(!filter.matchesMember(member_app));
}

test "Filter: matchesMember with negation" {
    const allocator = testing.allocator;
    const patterns = [_][]const u8{ "./packages/*", "!./packages/excluded" };
    var filter = try filter_module.Filter.initWithPatterns(allocator, &patterns);
    defer filter.deinit();

    const member_foo = types.WorkspaceMember{
        .name = "foo",
        .path = "./packages/foo",
        .abs_path = "/workspace/packages/foo",
        .config_path = null,
        .deps_file_path = null,
    };

    const member_excluded = types.WorkspaceMember{
        .name = "excluded",
        .path = "./packages/excluded",
        .abs_path = "/workspace/packages/excluded",
        .config_path = null,
        .deps_file_path = null,
    };

    try testing.expect(filter.matchesMember(member_foo));
    try testing.expect(!filter.matchesMember(member_excluded));
}

// ============================================================================
// Edge Cases and Error Handling
// ============================================================================

test "Filter: empty pattern string" {
    const allocator = testing.allocator;
    const patterns = [_][]const u8{""};
    var filter = try filter_module.Filter.initWithPatterns(allocator, &patterns);
    defer filter.deinit();

    // Empty pattern should not match anything
    try testing.expect(!filter.matchesPackageName("pkg-a"));
}

test "Filter: pattern order matters for negation" {
    const allocator = testing.allocator;

    // Exclude first, then include - should still exclude
    const patterns1 = [_][]const u8{ "!pkg-c", "pkg-*" };
    var filter1 = try filter_module.Filter.initWithPatterns(allocator, &patterns1);
    defer filter1.deinit();

    // Include first, then exclude - should exclude
    const patterns2 = [_][]const u8{ "pkg-*", "!pkg-c" };
    var filter2 = try filter_module.Filter.initWithPatterns(allocator, &patterns2);
    defer filter2.deinit();

    // Both should exclude pkg-c (negation wins)
    try testing.expect(!filter1.matchesPackageName("pkg-c"));
    try testing.expect(!filter2.matchesPackageName("pkg-c"));
}

test "Filter: scoped package names" {
    const allocator = testing.allocator;
    const patterns = [_][]const u8{"@myorg/*"};
    var filter = try filter_module.Filter.initWithPatterns(allocator, &patterns);
    defer filter.deinit();

    try testing.expect(filter.matchesPackageName("@myorg/package-a"));
    try testing.expect(filter.matchesPackageName("@myorg/package-b"));
    try testing.expect(!filter.matchesPackageName("@other/package-a"));
    try testing.expect(!filter.matchesPackageName("package-a"));
}

test "Filter: nested path patterns" {
    const allocator = testing.allocator;
    const patterns = [_][]const u8{"./src/packages/*/lib/*"};
    var filter = try filter_module.Filter.initWithPatterns(allocator, &patterns);
    defer filter.deinit();

    const member_match = types.WorkspaceMember{
        .name = "foo",
        .path = "./src/packages/foo/lib/bar",
        .abs_path = "/workspace/src/packages/foo/lib/bar",
        .config_path = null,
        .deps_file_path = null,
    };

    const member_no_match = types.WorkspaceMember{
        .name = "baz",
        .path = "./src/packages/foo/src/baz",
        .abs_path = "/workspace/src/packages/foo/src/baz",
        .config_path = null,
        .deps_file_path = null,
    };

    try testing.expect(filter.matchesMember(member_match));
    try testing.expect(!filter.matchesMember(member_no_match));
}

test "Filter: case sensitive matching" {
    const allocator = testing.allocator;
    const patterns = [_][]const u8{"Pkg-*"};
    var filter = try filter_module.Filter.initWithPatterns(allocator, &patterns);
    defer filter.deinit();

    try testing.expect(filter.matchesPackageName("Pkg-A"));
    try testing.expect(!filter.matchesPackageName("pkg-a")); // Case sensitive
}

test "glob: trailing slash handling" {
    try testing.expect(filter_module.matchGlob("packages/", "packages/"));
    try testing.expect(!filter_module.matchGlob("packages/", "packages"));
}

test "Filter: multiple wildcards in single pattern" {
    const allocator = testing.allocator;
    const patterns = [_][]const u8{"@*/*-*"};
    var filter = try filter_module.Filter.initWithPatterns(allocator, &patterns);
    defer filter.deinit();

    try testing.expect(filter.matchesPackageName("@myorg/package-utils"));
    try testing.expect(filter.matchesPackageName("@other/foo-bar"));
    try testing.expect(!filter.matchesPackageName("@myorg/package"));
}
