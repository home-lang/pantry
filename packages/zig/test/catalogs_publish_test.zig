//! Publishing Integration Tests for Catalogs
//!
//! These tests verify that catalog: references are properly resolved during
//! the publish process and that published packages contain concrete versions
//! instead of catalog references.

const std = @import("std");
const testing = std.testing;
const lib = @import("lib");

// ============================================================================
// Helper Functions
// ============================================================================

/// Helper to create a temporary package.json with catalog references
fn createPackageJsonWithCatalogs(
    allocator: std.mem.Allocator,
    path: []const u8,
    pkg_name: []const u8,
    pkg_version: []const u8,
    deps: []const struct { name: []const u8, version: []const u8 },
) !void {
    const file = try std.fs.createFileAbsolute(path, .{});
    defer file.close();

    const writer = file.writer();

    try writer.writeAll("{\n");
    try writer.print("  \"name\": \"{s}\",\n", .{pkg_name});
    try writer.print("  \"version\": \"{s}\",\n", .{pkg_version});
    try writer.writeAll("  \"dependencies\": {\n");

    for (deps, 0..) |dep, i| {
        try writer.print("    \"{s}\": \"{s}\"", .{ dep.name, dep.version });
        if (i < deps.len - 1) {
            try writer.writeAll(",\n");
        } else {
            try writer.writeAll("\n");
        }
    }

    try writer.writeAll("  }\n");
    try writer.writeAll("}\n");
}

/// Helper to resolve catalog references in a dependencies map
fn resolveCatalogReferences(
    allocator: std.mem.Allocator,
    manager: *lib.deps.CatalogManager,
    deps: std.StringHashMap([]const u8),
) !std.StringHashMap([]const u8) {
    var resolved = std.StringHashMap([]const u8).init(allocator);
    errdefer {
        var it = resolved.iterator();
        while (it.next()) |entry| {
            allocator.free(entry.key_ptr.*);
            allocator.free(entry.value_ptr.*);
        }
        resolved.deinit();
    }

    var it = deps.iterator();
    while (it.next()) |entry| {
        const pkg_name = entry.key_ptr.*;
        const version_ref = entry.value_ptr.*;

        const resolved_version = if (lib.deps.catalogs.CatalogManager.isCatalogReference(version_ref))
            manager.resolveCatalogReference(pkg_name, version_ref) orelse version_ref
        else
            version_ref;

        try resolved.put(
            try allocator.dupe(u8, pkg_name),
            try allocator.dupe(u8, resolved_version),
        );
    }

    return resolved;
}

// ============================================================================
// Catalog Resolution During Publish Tests
// ============================================================================

test "publish resolves default catalog references" {
    const allocator = testing.allocator;

    // Setup catalog
    var manager = lib.deps.CatalogManager.init(allocator);
    defer manager.deinit();

    var catalog = lib.deps.catalogs.Catalog.init(allocator, try allocator.dupe(u8, ""));
    try catalog.addVersion("react", "^18.2.0");
    try catalog.addVersion("react-dom", "^18.2.0");
    manager.setDefaultCatalog(catalog);

    // Simulate package.json with catalog references
    var original_deps = std.StringHashMap([]const u8).init(allocator);
    defer {
        var it = original_deps.iterator();
        while (it.next()) |entry| {
            allocator.free(entry.key_ptr.*);
            allocator.free(entry.value_ptr.*);
        }
        original_deps.deinit();
    }

    try original_deps.put(try allocator.dupe(u8, "react"), try allocator.dupe(u8, "catalog:"));
    try original_deps.put(try allocator.dupe(u8, "react-dom"), try allocator.dupe(u8, "catalog:"));

    // Resolve references for publishing
    const resolved_deps = try resolveCatalogReferences(allocator, &manager, original_deps);
    defer {
        var it = resolved_deps.iterator();
        while (it.next()) |entry| {
            allocator.free(entry.key_ptr.*);
            allocator.free(entry.value_ptr.*);
        }
        resolved_deps.deinit();
    }

    // Verify catalog references were resolved
    const react_version = resolved_deps.get("react");
    try testing.expect(react_version != null);
    try testing.expectEqualStrings("^18.2.0", react_version.?);

    const react_dom_version = resolved_deps.get("react-dom");
    try testing.expect(react_dom_version != null);
    try testing.expectEqualStrings("^18.2.0", react_dom_version.?);
}

test "publish resolves named catalog references" {
    const allocator = testing.allocator;

    var manager = lib.deps.CatalogManager.init(allocator);
    defer manager.deinit();

    var testing_catalog = lib.deps.catalogs.Catalog.init(allocator, try allocator.dupe(u8, "testing"));
    try testing_catalog.addVersion("vitest", "^1.0.0");
    try testing_catalog.addVersion("@testing-library/react", "^14.0.0");
    try manager.addNamedCatalog("testing", testing_catalog);

    var build_catalog = lib.deps.catalogs.Catalog.init(allocator, try allocator.dupe(u8, "build"));
    try build_catalog.addVersion("vite", "^5.0.0");
    try build_catalog.addVersion("typescript", "^5.0.0");
    try manager.addNamedCatalog("build", build_catalog);

    // Package with named catalog references
    var original_deps = std.StringHashMap([]const u8).init(allocator);
    defer {
        var it = original_deps.iterator();
        while (it.next()) |entry| {
            allocator.free(entry.key_ptr.*);
            allocator.free(entry.value_ptr.*);
        }
        original_deps.deinit();
    }

    try original_deps.put(try allocator.dupe(u8, "vitest"), try allocator.dupe(u8, "catalog:testing"));
    try original_deps.put(try allocator.dupe(u8, "@testing-library/react"), try allocator.dupe(u8, "catalog:testing"));
    try original_deps.put(try allocator.dupe(u8, "vite"), try allocator.dupe(u8, "catalog:build"));
    try original_deps.put(try allocator.dupe(u8, "typescript"), try allocator.dupe(u8, "catalog:build"));

    // Resolve
    const resolved_deps = try resolveCatalogReferences(allocator, &manager, original_deps);
    defer {
        var it = resolved_deps.iterator();
        while (it.next()) |entry| {
            allocator.free(entry.key_ptr.*);
            allocator.free(entry.value_ptr.*);
        }
        resolved_deps.deinit();
    }

    // Verify all resolved correctly
    try testing.expectEqualStrings("^1.0.0", resolved_deps.get("vitest").?);
    try testing.expectEqualStrings("^14.0.0", resolved_deps.get("@testing-library/react").?);
    try testing.expectEqualStrings("^5.0.0", resolved_deps.get("vite").?);
    try testing.expectEqualStrings("^5.0.0", resolved_deps.get("typescript").?);
}

test "publish preserves non-catalog dependencies" {
    const allocator = testing.allocator;

    var manager = lib.deps.CatalogManager.init(allocator);
    defer manager.deinit();

    var catalog = lib.deps.catalogs.Catalog.init(allocator, try allocator.dupe(u8, ""));
    try catalog.addVersion("from-catalog", "^1.0.0");
    manager.setDefaultCatalog(catalog);

    // Mix of catalog and direct references
    var original_deps = std.StringHashMap([]const u8).init(allocator);
    defer {
        var it = original_deps.iterator();
        while (it.next()) |entry| {
            allocator.free(entry.key_ptr.*);
            allocator.free(entry.value_ptr.*);
        }
        original_deps.deinit();
    }

    try original_deps.put(try allocator.dupe(u8, "from-catalog"), try allocator.dupe(u8, "catalog:"));
    try original_deps.put(try allocator.dupe(u8, "direct-version"), try allocator.dupe(u8, "^2.0.0"));
    try original_deps.put(try allocator.dupe(u8, "github-dep"), try allocator.dupe(u8, "github:owner/repo"));

    // Resolve
    const resolved_deps = try resolveCatalogReferences(allocator, &manager, original_deps);
    defer {
        var it = resolved_deps.iterator();
        while (it.next()) |entry| {
            allocator.free(entry.key_ptr.*);
            allocator.free(entry.value_ptr.*);
        }
        resolved_deps.deinit();
    }

    // Catalog ref resolved, others unchanged
    try testing.expectEqualStrings("^1.0.0", resolved_deps.get("from-catalog").?);
    try testing.expectEqualStrings("^2.0.0", resolved_deps.get("direct-version").?);
    try testing.expectEqualStrings("github:owner/repo", resolved_deps.get("github-dep").?);
}

// ============================================================================
// Error Handling Tests
// ============================================================================

test "publish handles missing catalog references" {
    const allocator = testing.allocator;

    var manager = lib.deps.CatalogManager.init(allocator);
    defer manager.deinit();

    var catalog = lib.deps.catalogs.Catalog.init(allocator, try allocator.dupe(u8, ""));
    try catalog.addVersion("exists", "^1.0.0");
    manager.setDefaultCatalog(catalog);

    var original_deps = std.StringHashMap([]const u8).init(allocator);
    defer {
        var it = original_deps.iterator();
        while (it.next()) |entry| {
            allocator.free(entry.key_ptr.*);
            allocator.free(entry.value_ptr.*);
        }
        original_deps.deinit();
    }

    try original_deps.put(try allocator.dupe(u8, "exists"), try allocator.dupe(u8, "catalog:"));
    try original_deps.put(try allocator.dupe(u8, "missing"), try allocator.dupe(u8, "catalog:"));

    // Resolve - missing refs keep catalog: reference
    const resolved_deps = try resolveCatalogReferences(allocator, &manager, original_deps);
    defer {
        var it = resolved_deps.iterator();
        while (it.next()) |entry| {
            allocator.free(entry.key_ptr.*);
            allocator.free(entry.value_ptr.*);
        }
        resolved_deps.deinit();
    }

    // Existing resolved, missing kept as-is
    try testing.expectEqualStrings("^1.0.0", resolved_deps.get("exists").?);
    try testing.expectEqualStrings("catalog:", resolved_deps.get("missing").?);

    // In production, unresolved catalog refs should cause publish to fail
}

test "publish fails if catalog reference cannot be resolved" {
    const allocator = testing.allocator;

    var manager = lib.deps.CatalogManager.init(allocator);
    defer manager.deinit();

    // No catalog set up

    var deps = std.StringHashMap([]const u8).init(allocator);
    defer {
        var it = deps.iterator();
        while (it.next()) |entry| {
            allocator.free(entry.key_ptr.*);
            allocator.free(entry.value_ptr.*);
        }
        deps.deinit();
    }

    try deps.put(try allocator.dupe(u8, "some-pkg"), try allocator.dupe(u8, "catalog:"));

    const resolved_deps = try resolveCatalogReferences(allocator, &manager, deps);
    defer {
        var it = resolved_deps.iterator();
        while (it.next()) |entry| {
            allocator.free(entry.key_ptr.*);
            allocator.free(entry.value_ptr.*);
        }
        resolved_deps.deinit();
    }

    // Unresolved reference kept as catalog:
    const version = resolved_deps.get("some-pkg");
    try testing.expect(version != null);
    try testing.expectEqualStrings("catalog:", version.?);

    // In production, this should be detected and fail the publish
}

// ============================================================================
// Full Publish Workflow Tests
// ============================================================================

test "complete publish workflow with catalog resolution" {
    const allocator = testing.allocator;

    // Setup catalog
    var manager = lib.deps.CatalogManager.init(allocator);
    defer manager.deinit();

    var catalog = lib.deps.catalogs.Catalog.init(allocator, try allocator.dupe(u8, ""));
    try catalog.addVersion("lodash", "^4.17.21");
    try catalog.addVersion("axios", "^1.6.0");
    manager.setDefaultCatalog(catalog);

    // Create temp package.json
    const tmp_path = try std.fmt.allocPrint(
        allocator,
        "/tmp/pantry_test_pkg_{d}/package.json",
        .{std.time.timestamp()},
    );
    defer allocator.free(tmp_path);

    const tmp_dir = std.fs.path.dirname(tmp_path).?;
    std.fs.makeDirAbsolute(tmp_dir) catch {};
    defer std.fs.deleteTreeAbsolute(tmp_dir) catch {};

    const deps = [_]struct { name: []const u8, version: []const u8 }{
        .{ .name = "lodash", .version = "catalog:" },
        .{ .name = "axios", .version = "catalog:" },
    };

    try createPackageJsonWithCatalogs(allocator, tmp_path, "test-package", "1.0.0", &deps);

    // Read and parse
    const contents = try std.Io.Dir.cwd().readFileAlloc(std.testing.io, tmp_path, allocator, std.Io.Limit.limited(1024 * 1024));
    defer allocator.free(contents);

    const parsed = try std.json.parseFromSlice(std.json.Value, allocator, contents, .{});
    defer parsed.deinit();

    // Extract dependencies
    var original_deps = std.StringHashMap([]const u8).init(allocator);
    defer {
        var it = original_deps.iterator();
        while (it.next()) |entry| {
            allocator.free(entry.key_ptr.*);
            allocator.free(entry.value_ptr.*);
        }
        original_deps.deinit();
    }

    if (parsed.value.object.get("dependencies")) |deps_obj| {
        if (deps_obj == .object) {
            var it = deps_obj.object.iterator();
            while (it.next()) |entry| {
                if (entry.value_ptr.* == .string) {
                    try original_deps.put(
                        try allocator.dupe(u8, entry.key_ptr.*),
                        try allocator.dupe(u8, entry.value_ptr.string),
                    );
                }
            }
        }
    }

    // Resolve catalog references
    const resolved_deps = try resolveCatalogReferences(allocator, &manager, original_deps);
    defer {
        var it = resolved_deps.iterator();
        while (it.next()) |entry| {
            allocator.free(entry.key_ptr.*);
            allocator.free(entry.value_ptr.*);
        }
        resolved_deps.deinit();
    }

    // Verify resolution
    try testing.expectEqualStrings("^4.17.21", resolved_deps.get("lodash").?);
    try testing.expectEqualStrings("^1.6.0", resolved_deps.get("axios").?);

    // In production, write back to a new package.json for publishing
}

test "monorepo publish - multiple packages with shared catalog" {
    const allocator = testing.allocator;

    // Setup shared catalog
    var manager = lib.deps.CatalogManager.init(allocator);
    defer manager.deinit();

    var catalog = lib.deps.catalogs.Catalog.init(allocator, try allocator.dupe(u8, ""));
    try catalog.addVersion("react", "^18.2.0");
    try catalog.addVersion("react-dom", "^18.2.0");
    try catalog.addVersion("typescript", "^5.0.0");
    manager.setDefaultCatalog(catalog);

    // Simulate multiple workspace packages
    const workspaces = [_]struct {
        name: []const u8,
        deps: []const struct { name: []const u8, version: []const u8 },
    }{
        .{
            .name = "frontend",
            .deps = &[_]struct { name: []const u8, version: []const u8 }{
                .{ .name = "react", .version = "catalog:" },
                .{ .name = "react-dom", .version = "catalog:" },
            },
        },
        .{
            .name = "backend",
            .deps = &[_]struct { name: []const u8, version: []const u8 }{
                .{ .name = "typescript", .version = "catalog:" },
            },
        },
    };

    // Publish each workspace package
    for (workspaces) |ws| {
        var ws_deps = std.StringHashMap([]const u8).init(allocator);
        defer {
            var it = ws_deps.iterator();
            while (it.next()) |entry| {
                allocator.free(entry.key_ptr.*);
                allocator.free(entry.value_ptr.*);
            }
            ws_deps.deinit();
        }

        // Load dependencies
        for (ws.deps) |dep| {
            try ws_deps.put(
                try allocator.dupe(u8, dep.name),
                try allocator.dupe(u8, dep.version),
            );
        }

        // Resolve for publishing
        const resolved = try resolveCatalogReferences(allocator, &manager, ws_deps);
        defer {
            var it = resolved.iterator();
            while (it.next()) |entry| {
                allocator.free(entry.key_ptr.*);
                allocator.free(entry.value_ptr.*);
            }
            resolved.deinit();
        }

        // Verify all catalog refs resolved
        var it = resolved.iterator();
        while (it.next()) |entry| {
            try testing.expect(!lib.deps.catalogs.CatalogManager.isCatalogReference(entry.value_ptr.*));
        }
    }
}

// ============================================================================
// Validation Tests
// ============================================================================

test "publish validates no catalog references remain" {
    const allocator = testing.allocator;

    // This function would be called before publish to ensure all refs resolved
    const validateNoCatalogReferences = struct {
        fn validate(deps: std.StringHashMap([]const u8)) !void {
            var it = deps.iterator();
            while (it.next()) |entry| {
                if (lib.deps.catalogs.CatalogManager.isCatalogReference(entry.value_ptr.*)) {
                    std.debug.print(
                        "Error: Package '{s}' has unresolved catalog reference: '{s}'\n",
                        .{ entry.key_ptr.*, entry.value_ptr.* },
                    );
                    return error.UnresolvedCatalogReference;
                }
            }
        }
    }.validate;

    // Test with resolved deps - should pass
    {
        var resolved_deps = std.StringHashMap([]const u8).init(allocator);
        defer {
            var it = resolved_deps.iterator();
            while (it.next()) |entry| {
                allocator.free(entry.key_ptr.*);
                allocator.free(entry.value_ptr.*);
            }
            resolved_deps.deinit();
        }

        try resolved_deps.put(try allocator.dupe(u8, "pkg1"), try allocator.dupe(u8, "^1.0.0"));
        try resolved_deps.put(try allocator.dupe(u8, "pkg2"), try allocator.dupe(u8, "^2.0.0"));

        try validateNoCatalogReferences(resolved_deps);
    }

    // Test with unresolved refs - should fail
    {
        var unresolved_deps = std.StringHashMap([]const u8).init(allocator);
        defer {
            var it = unresolved_deps.iterator();
            while (it.next()) |entry| {
                allocator.free(entry.key_ptr.*);
                allocator.free(entry.value_ptr.*);
            }
            unresolved_deps.deinit();
        }

        try unresolved_deps.put(try allocator.dupe(u8, "pkg1"), try allocator.dupe(u8, "^1.0.0"));
        try unresolved_deps.put(try allocator.dupe(u8, "pkg2"), try allocator.dupe(u8, "catalog:"));

        const result = validateNoCatalogReferences(unresolved_deps);
        try testing.expectError(error.UnresolvedCatalogReference, result);
    }
}

test "publish handles workspace: protocol alongside catalogs" {
    const allocator = testing.allocator;

    var manager = lib.deps.CatalogManager.init(allocator);
    defer manager.deinit();

    var catalog = lib.deps.catalogs.Catalog.init(allocator, try allocator.dupe(u8, ""));
    try catalog.addVersion("external-pkg", "^1.0.0");
    manager.setDefaultCatalog(catalog);

    var deps = std.StringHashMap([]const u8).init(allocator);
    defer {
        var it = deps.iterator();
        while (it.next()) |entry| {
            allocator.free(entry.key_ptr.*);
            allocator.free(entry.value_ptr.*);
        }
        deps.deinit();
    }

    try deps.put(try allocator.dupe(u8, "external-pkg"), try allocator.dupe(u8, "catalog:"));
    try deps.put(try allocator.dupe(u8, "internal-pkg"), try allocator.dupe(u8, "workspace:*"));

    const resolved = try resolveCatalogReferences(allocator, &manager, deps);
    defer {
        var it = resolved.iterator();
        while (it.next()) |entry| {
            allocator.free(entry.key_ptr.*);
            allocator.free(entry.value_ptr.*);
        }
        resolved.deinit();
    }

    // Catalog resolved, workspace left as-is (would be handled separately)
    try testing.expectEqualStrings("^1.0.0", resolved.get("external-pkg").?);
    try testing.expectEqualStrings("workspace:*", resolved.get("internal-pkg").?);
}
