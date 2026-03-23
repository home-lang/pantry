const std = @import("std");
const testing = std.testing;
const lib = @import("lib");

// ============================================================================
// Test Helpers
// ============================================================================

fn createTempDir(allocator: std.mem.Allocator) ![]const u8 {
    const ts = lib.io_helper.clockGettime();
    const timestamp = @as(u64, @intCast(ts.sec)) * 1_000_000 + @as(u64, @intCast(@divFloor(ts.nsec, 1000)));
    const dir_name = try std.fmt.allocPrint(allocator, "/tmp/pantry-autolink-test-{d}", .{timestamp});
    try lib.io_helper.makePath(dir_name);
    return dir_name;
}

fn cleanupTempDir(allocator: std.mem.Allocator, path: []const u8) void {
    lib.io_helper.deleteTree(path) catch {};
    allocator.free(path);
}

fn writeFile(path: []const u8, content: []const u8) !void {
    const file = try lib.io_helper.createFile(path, .{});
    defer file.close(lib.io_helper.io);
    try lib.io_helper.writeAllToFile(file, content);
}

/// Create a fake project directory with a package.json containing the given name.
fn createProject(allocator: std.mem.Allocator, parent_dir: []const u8, dir_name: []const u8, pkg_name: []const u8) ![]const u8 {
    const proj_dir = try std.fmt.allocPrint(allocator, "{s}/{s}", .{ parent_dir, dir_name });
    try lib.io_helper.makePath(proj_dir);
    const pkg_json = try std.fmt.allocPrint(allocator, "{s}/package.json", .{proj_dir});
    defer allocator.free(pkg_json);
    const content = try std.fmt.allocPrint(allocator, "{{\"name\": \"{s}\", \"version\": \"1.0.0\"}}", .{pkg_name});
    defer allocator.free(content);
    try writeFile(pkg_json, content);
    return proj_dir;
}

/// Remove the global link for a package name (cleanup helper).
fn removeGlobalLink(allocator: std.mem.Allocator, pkg_name: []const u8) void {
    const home = lib.Paths.home(allocator) catch return;
    defer allocator.free(home);
    const link_path = std.fmt.allocPrint(allocator, "{s}/.pantry/links/{s}", .{ home, pkg_name }) catch return;
    defer allocator.free(link_path);
    lib.io_helper.deleteFile(link_path) catch {};
}

// ============================================================================
// unscopedName Tests (pure function)
// ============================================================================

// Access the link_commands module through the re-export chain
const link_commands = lib.commands.link_commands;

test "unscopedName - unscoped package" {
    // Non-scoped packages return as-is
    const result = link_commands.unscopedName("bun-router");
    try testing.expectEqualStrings("bun-router", result);
}

test "unscopedName - scoped package" {
    const result = link_commands.unscopedName("@stacksjs/bun-router");
    try testing.expectEqualStrings("bun-router", result);
}

test "unscopedName - scoped with nested slashes" {
    // Only first slash counts for scope
    const result = link_commands.unscopedName("@scope/sub/path");
    try testing.expectEqualStrings("sub/path", result);
}

test "unscopedName - empty string" {
    const result = link_commands.unscopedName("");
    try testing.expectEqualStrings("", result);
}

test "unscopedName - @ without slash" {
    // Malformed scope — no slash, returns as-is
    const result = link_commands.unscopedName("@noslash");
    try testing.expectEqualStrings("@noslash", result);
}

test "unscopedName - just @/" {
    const result = link_commands.unscopedName("@/");
    try testing.expectEqualStrings("", result);
}

// ============================================================================
// isSkippableDir Tests (pure function)
// ============================================================================

test "isSkippableDir - skips hidden directories" {
    try testing.expect(link_commands.isSkippableDir(".git"));
    try testing.expect(link_commands.isSkippableDir(".config"));
    try testing.expect(link_commands.isSkippableDir(".hidden"));
}

test "isSkippableDir - skips known non-project dirs" {
    try testing.expect(link_commands.isSkippableDir("node_modules"));
    try testing.expect(link_commands.isSkippableDir("pantry"));
    try testing.expect(link_commands.isSkippableDir("dist"));
    try testing.expect(link_commands.isSkippableDir("build"));
    try testing.expect(link_commands.isSkippableDir("target"));
    try testing.expect(link_commands.isSkippableDir("zig-out"));
    try testing.expect(link_commands.isSkippableDir("zig-cache"));
    try testing.expect(link_commands.isSkippableDir("__pycache__"));
    try testing.expect(link_commands.isSkippableDir("vendor"));
    try testing.expect(link_commands.isSkippableDir("coverage"));
}

test "isSkippableDir - does not skip normal directories" {
    try testing.expect(!link_commands.isSkippableDir("src"));
    try testing.expect(!link_commands.isSkippableDir("packages"));
    try testing.expect(!link_commands.isSkippableDir("my-project"));
    try testing.expect(!link_commands.isSkippableDir("bun-router"));
    try testing.expect(!link_commands.isSkippableDir("Code"));
}

test "isSkippableDir - empty string" {
    try testing.expect(link_commands.isSkippableDir(""));
}

// ============================================================================
// readPackageName Tests (filesystem)
// ============================================================================

test "readPackageName - reads name from package.json" {
    const allocator = testing.allocator;
    const tmp = try createTempDir(allocator);
    defer cleanupTempDir(allocator, tmp);

    const path = try std.fmt.allocPrint(allocator, "{s}/package.json", .{tmp});
    defer allocator.free(path);
    try writeFile(path, "{\"name\": \"my-package\", \"version\": \"1.0.0\"}");

    const name = try link_commands.readPackageName(allocator, tmp);
    try testing.expect(name != null);
    try testing.expectEqualStrings("my-package", name.?);
    allocator.free(name.?);
}

test "readPackageName - reads name from pantry.json" {
    const allocator = testing.allocator;
    const tmp = try createTempDir(allocator);
    defer cleanupTempDir(allocator, tmp);

    const path = try std.fmt.allocPrint(allocator, "{s}/pantry.json", .{tmp});
    defer allocator.free(path);
    try writeFile(path, "{\"name\": \"pantry-pkg\"}");

    const name = try link_commands.readPackageName(allocator, tmp);
    try testing.expect(name != null);
    try testing.expectEqualStrings("pantry-pkg", name.?);
    allocator.free(name.?);
}

test "readPackageName - prefers package.json over pantry.json" {
    const allocator = testing.allocator;
    const tmp = try createTempDir(allocator);
    defer cleanupTempDir(allocator, tmp);

    const pkg_path = try std.fmt.allocPrint(allocator, "{s}/package.json", .{tmp});
    defer allocator.free(pkg_path);
    try writeFile(pkg_path, "{\"name\": \"from-package\"}");

    const pantry_path = try std.fmt.allocPrint(allocator, "{s}/pantry.json", .{tmp});
    defer allocator.free(pantry_path);
    try writeFile(pantry_path, "{\"name\": \"from-pantry\"}");

    const name = try link_commands.readPackageName(allocator, tmp);
    try testing.expect(name != null);
    try testing.expectEqualStrings("from-package", name.?);
    allocator.free(name.?);
}

test "readPackageName - returns null for empty directory" {
    const allocator = testing.allocator;
    const tmp = try createTempDir(allocator);
    defer cleanupTempDir(allocator, tmp);

    const name = try link_commands.readPackageName(allocator, tmp);
    try testing.expect(name == null);
}

test "readPackageName - returns null for nonexistent directory" {
    const allocator = testing.allocator;
    const name = try link_commands.readPackageName(allocator, "/tmp/pantry-nonexistent-dir-99999");
    try testing.expect(name == null);
}

test "readPackageName - returns null for invalid JSON" {
    const allocator = testing.allocator;
    const tmp = try createTempDir(allocator);
    defer cleanupTempDir(allocator, tmp);

    const path = try std.fmt.allocPrint(allocator, "{s}/package.json", .{tmp});
    defer allocator.free(path);
    try writeFile(path, "this is not json");

    const name = try link_commands.readPackageName(allocator, tmp);
    try testing.expect(name == null);
}

test "readPackageName - returns null for JSON without name field" {
    const allocator = testing.allocator;
    const tmp = try createTempDir(allocator);
    defer cleanupTempDir(allocator, tmp);

    const path = try std.fmt.allocPrint(allocator, "{s}/package.json", .{tmp});
    defer allocator.free(path);
    try writeFile(path, "{\"version\": \"1.0.0\"}");

    const name = try link_commands.readPackageName(allocator, tmp);
    try testing.expect(name == null);
}

test "readPackageName - returns null when name is not a string" {
    const allocator = testing.allocator;
    const tmp = try createTempDir(allocator);
    defer cleanupTempDir(allocator, tmp);

    const path = try std.fmt.allocPrint(allocator, "{s}/package.json", .{tmp});
    defer allocator.free(path);
    try writeFile(path, "{\"name\": 42}");

    const name = try link_commands.readPackageName(allocator, tmp);
    try testing.expect(name == null);
}

test "readPackageName - handles scoped package name" {
    const allocator = testing.allocator;
    const tmp = try createTempDir(allocator);
    defer cleanupTempDir(allocator, tmp);

    const path = try std.fmt.allocPrint(allocator, "{s}/package.json", .{tmp});
    defer allocator.free(path);
    try writeFile(path, "{\"name\": \"@stacksjs/bun-router\"}");

    const name = try link_commands.readPackageName(allocator, tmp);
    try testing.expect(name != null);
    try testing.expectEqualStrings("@stacksjs/bun-router", name.?);
    allocator.free(name.?);
}

test "readPackageName - handles JSON array at root" {
    const allocator = testing.allocator;
    const tmp = try createTempDir(allocator);
    defer cleanupTempDir(allocator, tmp);

    const path = try std.fmt.allocPrint(allocator, "{s}/package.json", .{tmp});
    defer allocator.free(path);
    try writeFile(path, "[1, 2, 3]");

    const name = try link_commands.readPackageName(allocator, tmp);
    try testing.expect(name == null);
}

// ============================================================================
// autoDiscoverAndLinkBatch Tests (filesystem + integration)
// ============================================================================

test "batch discovery - finds single package by directory name" {
    const allocator = testing.allocator;
    const tmp = try createTempDir(allocator);
    defer cleanupTempDir(allocator, tmp);

    // Create: tmp/my-lib/package.json with name "my-lib"
    const proj = try createProject(allocator, tmp, "my-lib", "my-lib");
    defer allocator.free(proj);

    defer removeGlobalLink(allocator, "my-lib");

    const names = [_][]const u8{"my-lib"};
    var results = try link_commands.autoDiscoverAndLinkBatch(allocator, &names, tmp);
    defer results.deinit();

    try testing.expect(results.get("my-lib") != null);
    try testing.expectEqualStrings(proj, results.get("my-lib").?);
}

test "batch discovery - finds multiple packages in one scan" {
    const allocator = testing.allocator;
    const tmp = try createTempDir(allocator);
    defer cleanupTempDir(allocator, tmp);

    const proj_a = try createProject(allocator, tmp, "pkg-a", "pkg-a");
    defer allocator.free(proj_a);
    const proj_b = try createProject(allocator, tmp, "pkg-b", "pkg-b");
    defer allocator.free(proj_b);

    defer removeGlobalLink(allocator, "pkg-a");
    defer removeGlobalLink(allocator, "pkg-b");

    const names = [_][]const u8{ "pkg-a", "pkg-b" };
    var results = try link_commands.autoDiscoverAndLinkBatch(allocator, &names, tmp);
    defer results.deinit();

    try testing.expect(results.get("pkg-a") != null);
    try testing.expect(results.get("pkg-b") != null);
    try testing.expectEqual(@as(usize, 2), results.map.count());
}

test "batch discovery - finds scoped package by unscoped dir name" {
    const allocator = testing.allocator;
    const tmp = try createTempDir(allocator);
    defer cleanupTempDir(allocator, tmp);

    // Dir is named "bun-router" but package.json says "@stacksjs/bun-router"
    const proj = try createProject(allocator, tmp, "bun-router", "@stacksjs/bun-router");
    defer allocator.free(proj);

    defer removeGlobalLink(allocator, "@stacksjs/bun-router");

    const names = [_][]const u8{"@stacksjs/bun-router"};
    var results = try link_commands.autoDiscoverAndLinkBatch(allocator, &names, tmp);
    defer results.deinit();

    try testing.expect(results.get("@stacksjs/bun-router") != null);
}

test "batch discovery - finds package in nested directory" {
    const allocator = testing.allocator;
    const tmp = try createTempDir(allocator);
    defer cleanupTempDir(allocator, tmp);

    // Create: tmp/apps/frontend/my-app/package.json
    const apps_dir = try std.fmt.allocPrint(allocator, "{s}/apps/frontend", .{tmp});
    defer allocator.free(apps_dir);
    try lib.io_helper.makePath(apps_dir);

    const proj = try createProject(allocator, apps_dir, "my-app", "my-app");
    defer allocator.free(proj);

    defer removeGlobalLink(allocator, "my-app");

    const names = [_][]const u8{"my-app"};
    var results = try link_commands.autoDiscoverAndLinkBatch(allocator, &names, tmp);
    defer results.deinit();

    try testing.expect(results.get("my-app") != null);
}

test "batch discovery - returns empty for no matches" {
    const allocator = testing.allocator;
    const tmp = try createTempDir(allocator);
    defer cleanupTempDir(allocator, tmp);

    // Create a project with a different name
    const proj = try createProject(allocator, tmp, "other-pkg", "other-pkg");
    defer allocator.free(proj);

    const names = [_][]const u8{"nonexistent-pkg"};
    var results = try link_commands.autoDiscoverAndLinkBatch(allocator, &names, tmp);
    defer results.deinit();

    try testing.expect(results.get("nonexistent-pkg") == null);
    try testing.expectEqual(@as(usize, 0), results.map.count());
}

test "batch discovery - empty package list" {
    const allocator = testing.allocator;
    const names = [_][]const u8{};
    var results = try link_commands.autoDiscoverAndLinkBatch(allocator, &names, "/tmp");
    defer results.deinit();

    try testing.expectEqual(@as(usize, 0), results.map.count());
}

test "batch discovery - skips node_modules directories" {
    const allocator = testing.allocator;
    const tmp = try createTempDir(allocator);
    defer cleanupTempDir(allocator, tmp);

    // Put a matching project inside node_modules — should NOT be found
    const nm_dir = try std.fmt.allocPrint(allocator, "{s}/node_modules", .{tmp});
    defer allocator.free(nm_dir);
    try lib.io_helper.makePath(nm_dir);

    const proj = try createProject(allocator, nm_dir, "hidden-pkg", "hidden-pkg");
    defer allocator.free(proj);

    const names = [_][]const u8{"hidden-pkg"};
    var results = try link_commands.autoDiscoverAndLinkBatch(allocator, &names, tmp);
    defer results.deinit();

    try testing.expect(results.get("hidden-pkg") == null);
}

test "batch discovery - skips hidden directories" {
    const allocator = testing.allocator;
    const tmp = try createTempDir(allocator);
    defer cleanupTempDir(allocator, tmp);

    const hidden_dir = try std.fmt.allocPrint(allocator, "{s}/.hidden", .{tmp});
    defer allocator.free(hidden_dir);
    try lib.io_helper.makePath(hidden_dir);

    const proj = try createProject(allocator, hidden_dir, "secret-pkg", "secret-pkg");
    defer allocator.free(proj);

    const names = [_][]const u8{"secret-pkg"};
    var results = try link_commands.autoDiscoverAndLinkBatch(allocator, &names, tmp);
    defer results.deinit();

    try testing.expect(results.get("secret-pkg") == null);
}

test "batch discovery - skips dist, build, target directories" {
    const allocator = testing.allocator;
    const tmp = try createTempDir(allocator);
    defer cleanupTempDir(allocator, tmp);

    const skip_dirs = [_][]const u8{ "dist", "build", "target", "zig-out", "zig-cache" };
    for (skip_dirs) |skip| {
        const skip_dir = try std.fmt.allocPrint(allocator, "{s}/{s}", .{ tmp, skip });
        defer allocator.free(skip_dir);
        try lib.io_helper.makePath(skip_dir);

        const proj = try createProject(allocator, skip_dir, "skip-test", "skip-test");
        defer allocator.free(proj);
    }

    const names = [_][]const u8{"skip-test"};
    var results = try link_commands.autoDiscoverAndLinkBatch(allocator, &names, tmp);
    defer results.deinit();

    try testing.expect(results.get("skip-test") == null);
}

test "batch discovery - registers global link on success" {
    const allocator = testing.allocator;
    const tmp = try createTempDir(allocator);
    defer cleanupTempDir(allocator, tmp);

    const proj = try createProject(allocator, tmp, "auto-linked-pkg", "auto-linked-pkg");
    defer allocator.free(proj);

    defer removeGlobalLink(allocator, "auto-linked-pkg");

    const names = [_][]const u8{"auto-linked-pkg"};
    var results = try link_commands.autoDiscoverAndLinkBatch(allocator, &names, tmp);
    defer results.deinit();

    // Verify the global link was created
    const resolved = try link_commands.resolveLinkPath(allocator, "auto-linked-pkg");
    try testing.expect(resolved != null);
    try testing.expectEqualStrings(proj, resolved.?);
    allocator.free(resolved.?);
}

test "batch discovery - registers global link for scoped packages" {
    const allocator = testing.allocator;
    const tmp = try createTempDir(allocator);
    defer cleanupTempDir(allocator, tmp);

    const proj = try createProject(allocator, tmp, "my-router", "@myorg/my-router");
    defer allocator.free(proj);

    defer removeGlobalLink(allocator, "@myorg/my-router");

    const names = [_][]const u8{"@myorg/my-router"};
    var results = try link_commands.autoDiscoverAndLinkBatch(allocator, &names, tmp);
    defer results.deinit();

    // Verify scoped global link was created at ~/.pantry/links/@myorg/my-router
    const resolved = try link_commands.resolveLinkPath(allocator, "@myorg/my-router");
    try testing.expect(resolved != null);
    allocator.free(resolved.?);
}

test "batch discovery - dir name mismatch but package.json matches (phase 2)" {
    const allocator = testing.allocator;
    const tmp = try createTempDir(allocator);
    defer cleanupTempDir(allocator, tmp);

    // Directory named "frontend" but package.json says "my-ui-lib"
    const proj = try createProject(allocator, tmp, "frontend", "my-ui-lib");
    defer allocator.free(proj);

    defer removeGlobalLink(allocator, "my-ui-lib");

    const names = [_][]const u8{"my-ui-lib"};
    var results = try link_commands.autoDiscoverAndLinkBatch(allocator, &names, tmp);
    defer results.deinit();

    // Phase 2 full scan should find it
    try testing.expect(results.get("my-ui-lib") != null);
}

test "batch discovery - multiple search paths (comma-separated)" {
    const allocator = testing.allocator;
    const tmp1 = try createTempDir(allocator);
    defer cleanupTempDir(allocator, tmp1);
    const tmp2 = try createTempDir(allocator);
    defer cleanupTempDir(allocator, tmp2);

    const proj_a = try createProject(allocator, tmp1, "lib-a", "lib-a");
    defer allocator.free(proj_a);
    const proj_b = try createProject(allocator, tmp2, "lib-b", "lib-b");
    defer allocator.free(proj_b);

    defer removeGlobalLink(allocator, "lib-a");
    defer removeGlobalLink(allocator, "lib-b");

    const search_paths = try std.fmt.allocPrint(allocator, "{s}, {s}", .{ tmp1, tmp2 });
    defer allocator.free(search_paths);

    const names = [_][]const u8{ "lib-a", "lib-b" };
    var results = try link_commands.autoDiscoverAndLinkBatch(allocator, &names, search_paths);
    defer results.deinit();

    try testing.expect(results.get("lib-a") != null);
    try testing.expect(results.get("lib-b") != null);
}

test "batch discovery - does not search beyond max depth" {
    const allocator = testing.allocator;
    const tmp = try createTempDir(allocator);
    defer cleanupTempDir(allocator, tmp);

    // Create a project 5 levels deep (beyond max depth of 3)
    const deep_dir = try std.fmt.allocPrint(allocator, "{s}/a/b/c/d/e", .{tmp});
    defer allocator.free(deep_dir);
    try lib.io_helper.makePath(deep_dir);

    const proj = try createProject(allocator, deep_dir, "deep-pkg", "deep-pkg");
    defer allocator.free(proj);

    const names = [_][]const u8{"deep-pkg"};
    var results = try link_commands.autoDiscoverAndLinkBatch(allocator, &names, tmp);
    defer results.deinit();

    // Should NOT be found — too deep
    try testing.expect(results.get("deep-pkg") == null);
}

test "batch discovery - finds package exactly at max depth" {
    const allocator = testing.allocator;
    const tmp = try createTempDir(allocator);
    defer cleanupTempDir(allocator, tmp);

    // Create a project 3 levels deep (at max depth)
    const dir_l1 = try std.fmt.allocPrint(allocator, "{s}/level1", .{tmp});
    defer allocator.free(dir_l1);
    try lib.io_helper.makePath(dir_l1);

    const dir_l2 = try std.fmt.allocPrint(allocator, "{s}/level2", .{dir_l1});
    defer allocator.free(dir_l2);
    try lib.io_helper.makePath(dir_l2);

    const proj = try createProject(allocator, dir_l2, "depth-pkg", "depth-pkg");
    defer allocator.free(proj);

    defer removeGlobalLink(allocator, "depth-pkg");

    const names = [_][]const u8{"depth-pkg"};
    var results = try link_commands.autoDiscoverAndLinkBatch(allocator, &names, tmp);
    defer results.deinit();

    // depth 0 = tmp, depth 1 = level1, depth 2 = level2, depth 3 = depth-pkg — at limit
    try testing.expect(results.get("depth-pkg") != null);
}

test "batch discovery - nonexistent search path" {
    const allocator = testing.allocator;

    const names = [_][]const u8{"any-pkg"};
    var results = try link_commands.autoDiscoverAndLinkBatch(allocator, &names, "/tmp/pantry-nonexistent-9999999");
    defer results.deinit();

    try testing.expectEqual(@as(usize, 0), results.map.count());
}

test "batch discovery - handles partial matches (some found, some not)" {
    const allocator = testing.allocator;
    const tmp = try createTempDir(allocator);
    defer cleanupTempDir(allocator, tmp);

    const proj = try createProject(allocator, tmp, "found-pkg", "found-pkg");
    defer allocator.free(proj);

    defer removeGlobalLink(allocator, "found-pkg");

    const names = [_][]const u8{ "found-pkg", "missing-pkg" };
    var results = try link_commands.autoDiscoverAndLinkBatch(allocator, &names, tmp);
    defer results.deinit();

    try testing.expect(results.get("found-pkg") != null);
    try testing.expect(results.get("missing-pkg") == null);
    try testing.expectEqual(@as(usize, 1), results.map.count());
}

test "batch discovery - first match wins for duplicate dir names" {
    const allocator = testing.allocator;
    const tmp = try createTempDir(allocator);
    defer cleanupTempDir(allocator, tmp);

    // Create two dirs, both containing "my-pkg" but in different locations
    const dir_a = try std.fmt.allocPrint(allocator, "{s}/area-a", .{tmp});
    defer allocator.free(dir_a);
    try lib.io_helper.makePath(dir_a);

    const proj_a = try createProject(allocator, dir_a, "my-pkg", "my-pkg");
    defer allocator.free(proj_a);

    const dir_b = try std.fmt.allocPrint(allocator, "{s}/area-b", .{tmp});
    defer allocator.free(dir_b);
    try lib.io_helper.makePath(dir_b);

    const proj_b = try createProject(allocator, dir_b, "my-pkg", "my-pkg");
    defer allocator.free(proj_b);

    defer removeGlobalLink(allocator, "my-pkg");

    const names = [_][]const u8{"my-pkg"};
    var results = try link_commands.autoDiscoverAndLinkBatch(allocator, &names, tmp);
    defer results.deinit();

    // Should find exactly one
    try testing.expect(results.get("my-pkg") != null);
    try testing.expectEqual(@as(usize, 1), results.map.count());
}

test "batch discovery - empty search path string" {
    const allocator = testing.allocator;
    const names = [_][]const u8{"any-pkg"};
    var results = try link_commands.autoDiscoverAndLinkBatch(allocator, &names, "");
    defer results.deinit();
    try testing.expectEqual(@as(usize, 0), results.map.count());
}

test "batch discovery - search path with trailing comma" {
    const allocator = testing.allocator;
    const tmp = try createTempDir(allocator);
    defer cleanupTempDir(allocator, tmp);

    const proj = try createProject(allocator, tmp, "trailing-pkg", "trailing-pkg");
    defer allocator.free(proj);

    defer removeGlobalLink(allocator, "trailing-pkg");

    const search = try std.fmt.allocPrint(allocator, "{s},", .{tmp});
    defer allocator.free(search);

    const names = [_][]const u8{"trailing-pkg"};
    var results = try link_commands.autoDiscoverAndLinkBatch(allocator, &names, search);
    defer results.deinit();

    try testing.expect(results.get("trailing-pkg") != null);
}

test "batch discovery - search path with extra spaces" {
    const allocator = testing.allocator;
    const tmp = try createTempDir(allocator);
    defer cleanupTempDir(allocator, tmp);

    const proj = try createProject(allocator, tmp, "space-pkg", "space-pkg");
    defer allocator.free(proj);

    defer removeGlobalLink(allocator, "space-pkg");

    const search = try std.fmt.allocPrint(allocator, "  {s}  ", .{tmp});
    defer allocator.free(search);

    const names = [_][]const u8{"space-pkg"};
    var results = try link_commands.autoDiscoverAndLinkBatch(allocator, &names, search);
    defer results.deinit();

    try testing.expect(results.get("space-pkg") != null);
}

// ============================================================================
// AutoLinkResults Tests
// ============================================================================

test "AutoLinkResults - get returns null for missing key" {
    const allocator = testing.allocator;
    var results = link_commands.AutoLinkResults{
        .map = std.StringHashMap([]const u8).init(allocator),
        .allocator = allocator,
    };
    defer results.deinit();

    try testing.expect(results.get("nonexistent") == null);
}

test "AutoLinkResults - deinit frees all entries" {
    const allocator = testing.allocator;
    var results = link_commands.AutoLinkResults{
        .map = std.StringHashMap([]const u8).init(allocator),
        .allocator = allocator,
    };

    const key = try allocator.dupe(u8, "test-key");
    const val = try allocator.dupe(u8, "/some/path");
    try results.map.put(key, val);

    // deinit should free both key and value without leaks
    results.deinit();
    // If the test allocator doesn't report leaks, this passes
}

// ============================================================================
// resolveLinkPath Tests (existing function, integration)
// ============================================================================

test "resolveLinkPath - returns null for nonexistent link" {
    const allocator = testing.allocator;
    const result = try link_commands.resolveLinkPath(allocator, "definitely-not-linked-pkg-12345");
    try testing.expect(result == null);
}

// ============================================================================
// Config Tests (pantry_config.zig)
// ============================================================================

test "config - auto_link defaults to true" {
    const config = lib.config.PantryConfig{};
    try testing.expectEqual(true, config.install.auto_link);
}

test "config - link_search_paths defaults to null" {
    const config = lib.config.PantryConfig{};
    try testing.expect(config.install.link_search_paths == null);
}

test "config - parse autoLink = false" {
    const allocator = testing.allocator;
    const config = try lib.config.pantry_config.parseTomlContent(allocator,
        \\[install]
        \\autoLink = false
    );
    try testing.expectEqual(false, config.install.auto_link);
}

test "config - parse autoLink = true" {
    const allocator = testing.allocator;
    const config = try lib.config.pantry_config.parseTomlContent(allocator,
        \\[install]
        \\autoLink = true
    );
    try testing.expectEqual(true, config.install.auto_link);
}

test "config - parse linkSearchPaths" {
    const allocator = testing.allocator;
    const config = try lib.config.pantry_config.parseTomlContent(allocator,
        \\[install]
        \\linkSearchPaths = "~/Code, ~/Projects, /custom/path"
    );
    try testing.expect(config.install.link_search_paths != null);
    try testing.expectEqualStrings("~/Code, ~/Projects, /custom/path", config.install.link_search_paths.?);
    allocator.free(config.install.link_search_paths.?);
}

test "config - autoLink not set retains default" {
    const allocator = testing.allocator;
    const config = try lib.config.pantry_config.parseTomlContent(allocator,
        \\[install]
        \\linker = "hoisted"
    );
    try testing.expectEqual(true, config.install.auto_link);
    try testing.expect(config.install.link_search_paths == null);
}

// ============================================================================
// InstallOptions Tests
// ============================================================================

test "InstallOptions - auto_link defaults to true" {
    const opts = lib.commands.InstallOptions{};
    try testing.expectEqual(true, opts.auto_link);
}

test "InstallOptions - link_search_paths defaults to null" {
    const opts = lib.commands.InstallOptions{};
    try testing.expect(opts.link_search_paths == null);
}

// ============================================================================
// Install Helpers Tests (isLinkDependency, isLocalDependency)
// ============================================================================

const helpers = lib.commands.install_commands.helpers;

test "isLinkDependency - identifies link: prefix" {
    try testing.expect(helpers.isLinkDependency("link:my-package"));
    try testing.expect(helpers.isLinkDependency("link:@scope/pkg"));
    try testing.expect(helpers.isLinkDependency("link:"));
}

test "isLinkDependency - rejects non-link versions" {
    try testing.expect(!helpers.isLinkDependency("^1.0.0"));
    try testing.expect(!helpers.isLinkDependency("~2.0.0"));
    try testing.expect(!helpers.isLinkDependency("1.0.0"));
    try testing.expect(!helpers.isLinkDependency("file:../path"));
    try testing.expect(!helpers.isLinkDependency(""));
    try testing.expect(!helpers.isLinkDependency("linked:foo")); // not "link:"
}

test "isLocalPath - identifies filesystem paths" {
    try testing.expect(helpers.isLocalPath("~/projects/my-lib"));
    try testing.expect(helpers.isLocalPath("./local-dep"));
    try testing.expect(helpers.isLocalPath("../sibling-dep"));
    try testing.expect(helpers.isLocalPath("/absolute/path"));
}

test "isLocalPath - rejects non-paths" {
    try testing.expect(!helpers.isLocalPath("^1.0.0"));
    try testing.expect(!helpers.isLocalPath("link:foo"));
    try testing.expect(!helpers.isLocalPath("foo"));
    try testing.expect(!helpers.isLocalPath(""));
}

// ============================================================================
// Edge Case: symlink loop protection
// ============================================================================

test "batch discovery - handles directory that cannot be opened" {
    const allocator = testing.allocator;

    // /proc or similar unreadable dir — should not crash
    const names = [_][]const u8{"any-pkg"};
    var results = try link_commands.autoDiscoverAndLinkBatch(allocator, &names, "/proc/1");
    defer results.deinit();
    try testing.expectEqual(@as(usize, 0), results.map.count());
}

// ============================================================================
// Integration: end-to-end auto-link + resolveLinkVersion flow
// ============================================================================

test "end-to-end: auto-discover then resolve via link version" {
    const allocator = testing.allocator;
    const tmp = try createTempDir(allocator);
    defer cleanupTempDir(allocator, tmp);

    const proj = try createProject(allocator, tmp, "e2e-pkg", "e2e-pkg");
    defer allocator.free(proj);

    defer removeGlobalLink(allocator, "e2e-pkg");

    // Step 1: Auto-discover and register global link
    const names = [_][]const u8{"e2e-pkg"};
    var results = try link_commands.autoDiscoverAndLinkBatch(allocator, &names, tmp);
    defer results.deinit();
    try testing.expect(results.get("e2e-pkg") != null);

    // Step 2: Now resolveLinkVersion should find it via the global link
    const resolved = try helpers.resolveLinkVersion(allocator, "link:e2e-pkg");
    try testing.expect(resolved != null);
    try testing.expectEqualStrings(proj, resolved.?);
    allocator.free(resolved.?);
}

test "end-to-end: auto-discover scoped package then resolve" {
    const allocator = testing.allocator;
    const tmp = try createTempDir(allocator);
    defer cleanupTempDir(allocator, tmp);

    const proj = try createProject(allocator, tmp, "my-router", "@myorg/my-router");
    defer allocator.free(proj);

    defer removeGlobalLink(allocator, "@myorg/my-router");

    // Auto-discover
    const names = [_][]const u8{"@myorg/my-router"};
    var results = try link_commands.autoDiscoverAndLinkBatch(allocator, &names, tmp);
    defer results.deinit();
    try testing.expect(results.get("@myorg/my-router") != null);

    // Resolve
    const resolved = try helpers.resolveLinkVersion(allocator, "link:@myorg/my-router");
    try testing.expect(resolved != null);
    allocator.free(resolved.?);
}

test "end-to-end: already linked packages skip auto-discovery" {
    const allocator = testing.allocator;
    const tmp = try createTempDir(allocator);
    defer cleanupTempDir(allocator, tmp);

    const proj = try createProject(allocator, tmp, "pre-linked", "pre-linked");
    defer allocator.free(proj);

    // Pre-register a global link manually
    const home = try lib.Paths.home(allocator);
    defer allocator.free(home);
    const links_dir = try std.fmt.allocPrint(allocator, "{s}/.pantry/links", .{home});
    defer allocator.free(links_dir);
    try lib.io_helper.makePath(links_dir);
    const link_path = try std.fmt.allocPrint(allocator, "{s}/pre-linked", .{links_dir});
    defer allocator.free(link_path);
    lib.io_helper.deleteFile(link_path) catch {};
    try lib.io_helper.symLink(proj, link_path);
    defer removeGlobalLink(allocator, "pre-linked");

    // resolveLinkPath should already find it — no auto-discovery needed
    const resolved = try link_commands.resolveLinkPath(allocator, "pre-linked");
    try testing.expect(resolved != null);
    allocator.free(resolved.?);
}
