//! Catalogs Integration Tests
//!
//! These tests verify that catalogs work correctly in workspaces.

const std = @import("std");
const testing = std.testing;
const lib = @import("lib");

test "catalogs module exports correctly" {
    // Verify that catalogs module is exported
    _ = lib.deps.catalogs;
    _ = lib.deps.CatalogManager;
    _ = lib.deps.parseCatalogs;
}

test "parse package.json with workspaces.catalog" {
    const allocator = testing.allocator;

    const json_content =
        \\{
        \\  "name": "monorepo",
        \\  "workspaces": {
        \\    "packages": ["packages/*"],
        \\    "catalog": {
        \\      "react": "^19.0.0",
        \\      "react-dom": "^19.0.0"
        \\    }
        \\  }
        \\}
    ;

    const parsed = try std.json.parseFromSlice(std.json.Value, allocator, json_content, .{});
    defer parsed.deinit();

    var manager = try lib.deps.parseCatalogs(allocator, parsed);
    defer manager.deinit();

    // Check default catalog exists
    try testing.expect(manager.default_catalog != null);

    // Resolve versions
    const react_version = manager.resolveCatalogReference("react", "catalog:");
    try testing.expect(react_version != null);
    try testing.expectEqualStrings("^19.0.0", react_version.?);

    const react_dom_version = manager.resolveCatalogReference("react-dom", "catalog:");
    try testing.expect(react_dom_version != null);
    try testing.expectEqualStrings("^19.0.0", react_dom_version.?);
}

test "parse package.json with workspaces.catalogs" {
    const allocator = testing.allocator;

    const json_content =
        \\{
        \\  "name": "monorepo",
        \\  "workspaces": {
        \\    "catalogs": {
        \\      "testing": {
        \\        "jest": "30.0.0",
        \\        "vitest": "^1.0.0"
        \\      },
        \\      "build": {
        \\        "webpack": "5.88.2",
        \\        "vite": "^5.0.0"
        \\      }
        \\    }
        \\  }
        \\}
    ;

    const parsed = try std.json.parseFromSlice(std.json.Value, allocator, json_content, .{});
    defer parsed.deinit();

    var manager = try lib.deps.parseCatalogs(allocator, parsed);
    defer manager.deinit();

    // Resolve from testing catalog
    const jest_version = manager.resolveCatalogReference("jest", "catalog:testing");
    try testing.expect(jest_version != null);
    try testing.expectEqualStrings("30.0.0", jest_version.?);

    const vitest_version = manager.resolveCatalogReference("vitest", "catalog:testing");
    try testing.expect(vitest_version != null);
    try testing.expectEqualStrings("^1.0.0", vitest_version.?);

    // Resolve from build catalog
    const webpack_version = manager.resolveCatalogReference("webpack", "catalog:build");
    try testing.expect(webpack_version != null);
    try testing.expectEqualStrings("5.88.2", webpack_version.?);

    const vite_version = manager.resolveCatalogReference("vite", "catalog:build");
    try testing.expect(vite_version != null);
    try testing.expectEqualStrings("^5.0.0", vite_version.?);
}

test "parse with both catalog and catalogs" {
    const allocator = testing.allocator;

    const json_content =
        \\{
        \\  "name": "monorepo",
        \\  "workspaces": {
        \\    "catalog": {
        \\      "react": "^19.0.0"
        \\    },
        \\    "catalogs": {
        \\      "testing": {
        \\        "jest": "30.0.0"
        \\      }
        \\    }
        \\  }
        \\}
    ;

    const parsed = try std.json.parseFromSlice(std.json.Value, allocator, json_content, .{});
    defer parsed.deinit();

    var manager = try lib.deps.parseCatalogs(allocator, parsed);
    defer manager.deinit();

    // Both should work
    const react_version = manager.resolveCatalogReference("react", "catalog:");
    try testing.expect(react_version != null);
    try testing.expectEqualStrings("^19.0.0", react_version.?);

    const jest_version = manager.resolveCatalogReference("jest", "catalog:testing");
    try testing.expect(jest_version != null);
    try testing.expectEqualStrings("30.0.0", jest_version.?);
}

test "top-level catalog fallback" {
    const allocator = testing.allocator;

    const json_content =
        \\{
        \\  "name": "monorepo",
        \\  "catalog": {
        \\    "react": "^18.0.0"
        \\  },
        \\  "catalogs": {
        \\    "testing": {
        \\      "jest": "^29.0.0"
        \\    }
        \\  }
        \\}
    ;

    const parsed = try std.json.parseFromSlice(std.json.Value, allocator, json_content, .{});
    defer parsed.deinit();

    var manager = try lib.deps.parseCatalogs(allocator, parsed);
    defer manager.deinit();

    // Top-level catalog should work
    const react_version = manager.resolveCatalogReference("react", "catalog:");
    try testing.expect(react_version != null);
    try std.testing.expectEqualStrings("^18.0.0", react_version.?);

    // Top-level catalogs should work
    const jest_version = manager.resolveCatalogReference("jest", "catalog:testing");
    try testing.expect(jest_version != null);
    try testing.expectEqualStrings("^29.0.0", jest_version.?);
}

test "isCatalogReference" {
    try testing.expect(lib.deps.catalogs.CatalogManager.isCatalogReference("catalog:"));
    try testing.expect(lib.deps.catalogs.CatalogManager.isCatalogReference("catalog:testing"));
    try testing.expect(lib.deps.catalogs.CatalogManager.isCatalogReference("catalog:  "));
    try testing.expect(lib.deps.catalogs.CatalogManager.isCatalogReference("catalog:build"));

    try testing.expect(!lib.deps.catalogs.CatalogManager.isCatalogReference("^1.0.0"));
    try testing.expect(!lib.deps.catalogs.CatalogManager.isCatalogReference("latest"));
    try testing.expect(!lib.deps.catalogs.CatalogManager.isCatalogReference("workspace:*"));
    try testing.expect(!lib.deps.catalogs.CatalogManager.isCatalogReference("github:owner/repo"));
}

test "getCatalogName" {
    // Default catalog
    const name1 = lib.deps.catalogs.CatalogManager.getCatalogName("catalog:");
    try testing.expect(name1 != null);
    try testing.expectEqualStrings("", name1.?);

    // Named catalog
    const name2 = lib.deps.catalogs.CatalogManager.getCatalogName("catalog:testing");
    try testing.expect(name2 != null);
    try testing.expectEqualStrings("testing", name2.?);

    // Whitespace (treated as default)
    const name3 = lib.deps.catalogs.CatalogManager.getCatalogName("catalog:  ");
    try testing.expect(name3 != null);
    try testing.expectEqualStrings("", name3.?);

    // Not a catalog reference
    const name4 = lib.deps.catalogs.CatalogManager.getCatalogName("^1.0.0");
    try testing.expect(name4 == null);
}

test "resolveCatalogReference with default catalog" {
    const allocator = testing.allocator;

    var manager = lib.deps.CatalogManager.init(allocator);
    defer manager.deinit();

    var default_catalog = lib.deps.catalogs.Catalog.init(allocator, try allocator.dupe(u8, ""));
    try default_catalog.addVersion("react", "^19.0.0");
    try default_catalog.addVersion("react-dom", "^19.0.0");
    manager.setDefaultCatalog(default_catalog);

    // Test resolution
    const react_v1 = manager.resolveCatalogReference("react", "catalog:");
    try testing.expect(react_v1 != null);
    try testing.expectEqualStrings("^19.0.0", react_v1.?);

    // Whitespace should work
    const react_v2 = manager.resolveCatalogReference("react", "catalog:  ");
    try testing.expect(react_v2 != null);
    try testing.expectEqualStrings("^19.0.0", react_v2.?);

    // Unknown package
    const unknown = manager.resolveCatalogReference("unknown", "catalog:");
    try testing.expect(unknown == null);
}

test "resolveCatalogReference with named catalog" {
    const allocator = testing.allocator;

    var manager = lib.deps.CatalogManager.init(allocator);
    defer manager.deinit();

    var testing_catalog = lib.deps.catalogs.Catalog.init(allocator, try allocator.dupe(u8, "testing"));
    try testing_catalog.addVersion("jest", "30.0.0");
    try testing_catalog.addVersion("vitest", "^1.0.0");
    try manager.addNamedCatalog("testing", testing_catalog);

    // Test resolution
    const jest_version = manager.resolveCatalogReference("jest", "catalog:testing");
    try testing.expect(jest_version != null);
    try testing.expectEqualStrings("30.0.0", jest_version.?);

    // Unknown catalog
    const unknown_catalog = manager.resolveCatalogReference("jest", "catalog:unknown");
    try testing.expect(unknown_catalog == null);

    // Unknown package in existing catalog
    const unknown_package = manager.resolveCatalogReference("unknown", "catalog:testing");
    try testing.expect(unknown_package == null);
}

test "real-world React monorepo scenario" {
    const allocator = testing.allocator;

    const json_content =
        \\{
        \\  "name": "react-monorepo",
        \\  "workspaces": {
        \\    "packages": ["packages/*"],
        \\    "catalog": {
        \\      "react": "^19.0.0",
        \\      "react-dom": "^19.0.0",
        \\      "react-router-dom": "^6.15.0"
        \\    },
        \\    "catalogs": {
        \\      "build": {
        \\        "webpack": "5.88.2",
        \\        "babel": "7.22.10",
        \\        "typescript": "~5.2.0"
        \\      },
        \\      "testing": {
        \\        "jest": "29.6.2",
        \\        "react-testing-library": "14.0.0"
        \\      }
        \\    }
        \\  }
        \\}
    ;

    const parsed = try std.json.parseFromSlice(std.json.Value, allocator, json_content, .{});
    defer parsed.deinit();

    var manager = try lib.deps.parseCatalogs(allocator, parsed);
    defer manager.deinit();

    // Test core dependencies
    try testing.expectEqualStrings("^19.0.0", manager.resolveCatalogReference("react", "catalog:").?);
    try testing.expectEqualStrings("^19.0.0", manager.resolveCatalogReference("react-dom", "catalog:").?);
    try testing.expectEqualStrings("^6.15.0", manager.resolveCatalogReference("react-router-dom", "catalog:").?);

    // Test build tools
    try testing.expectEqualStrings("5.88.2", manager.resolveCatalogReference("webpack", "catalog:build").?);
    try testing.expectEqualStrings("7.22.10", manager.resolveCatalogReference("babel", "catalog:build").?);
    try testing.expectEqualStrings("~5.2.0", manager.resolveCatalogReference("typescript", "catalog:build").?);

    // Test testing tools
    try testing.expectEqualStrings("29.6.2", manager.resolveCatalogReference("jest", "catalog:testing").?);
    try testing.expectEqualStrings("14.0.0", manager.resolveCatalogReference("react-testing-library", "catalog:testing").?);
}

test "workspace protocol in catalog" {
    const allocator = testing.allocator;

    const json_content =
        \\{
        \\  "catalog": {
        \\    "ui-lib": "workspace:*",
        \\    "utils-lib": "workspace:^1.0.0"
        \\  }
        \\}
    ;

    const parsed = try std.json.parseFromSlice(std.json.Value, allocator, json_content, .{});
    defer parsed.deinit();

    var manager = try lib.deps.parseCatalogs(allocator, parsed);
    defer manager.deinit();

    // Workspace protocol should be preserved
    const ui_version = manager.resolveCatalogReference("ui-lib", "catalog:");
    try testing.expect(ui_version != null);
    try testing.expectEqualStrings("workspace:*", ui_version.?);

    const utils_version = manager.resolveCatalogReference("utils-lib", "catalog:");
    try testing.expect(utils_version != null);
    try testing.expectEqualStrings("workspace:^1.0.0", utils_version.?);
}

test "GitHub references in catalog" {
    const allocator = testing.allocator;

    const json_content =
        \\{
        \\  "catalog": {
        \\    "my-package": "github:owner/repo#v2.0.0",
        \\    "another-package": "https://github.com/owner/repo#main"
        \\  }
        \\}
    ;

    const parsed = try std.json.parseFromSlice(std.json.Value, allocator, json_content, .{});
    defer parsed.deinit();

    var manager = try lib.deps.parseCatalogs(allocator, parsed);
    defer manager.deinit();

    // GitHub references should be preserved
    const my_pkg_version = manager.resolveCatalogReference("my-package", "catalog:");
    try testing.expect(my_pkg_version != null);
    try testing.expectEqualStrings("github:owner/repo#v2.0.0", my_pkg_version.?);

    const another_pkg_version = manager.resolveCatalogReference("another-package", "catalog:");
    try testing.expect(another_pkg_version != null);
    try testing.expectEqualStrings("https://github.com/owner/repo#main", another_pkg_version.?);
}

test "version range types in catalog" {
    const allocator = testing.allocator;

    const json_content =
        \\{
        \\  "catalog": {
        \\    "exact": "1.2.3",
        \\    "caret": "^1.2.3",
        \\    "tilde": "~1.2.3",
        \\    "gte": ">=1.2.3",
        \\    "latest": "latest",
        \\    "wildcard": "*"
        \\  }
        \\}
    ;

    const parsed = try std.json.parseFromSlice(std.json.Value, allocator, json_content, .{});
    defer parsed.deinit();

    var manager = try lib.deps.parseCatalogs(allocator, parsed);
    defer manager.deinit();

    // All version range types should be supported
    try testing.expectEqualStrings("1.2.3", manager.resolveCatalogReference("exact", "catalog:").?);
    try testing.expectEqualStrings("^1.2.3", manager.resolveCatalogReference("caret", "catalog:").?);
    try testing.expectEqualStrings("~1.2.3", manager.resolveCatalogReference("tilde", "catalog:").?);
    try testing.expectEqualStrings(">=1.2.3", manager.resolveCatalogReference("gte", "catalog:").?);
    try testing.expectEqualStrings("latest", manager.resolveCatalogReference("latest", "catalog:").?);
    try testing.expectEqualStrings("*", manager.resolveCatalogReference("wildcard", "catalog:").?);
}

test "empty catalog" {
    const allocator = testing.allocator;

    const json_content =
        \\{
        \\  "name": "monorepo",
        \\  "workspaces": {
        \\    "packages": ["packages/*"]
        \\  }
        \\}
    ;

    const parsed = try std.json.parseFromSlice(std.json.Value, allocator, json_content, .{});
    defer parsed.deinit();

    var manager = try lib.deps.parseCatalogs(allocator, parsed);
    defer manager.deinit();

    // No catalogs should be loaded
    try testing.expect(manager.default_catalog == null);
    try testing.expectEqual(@as(usize, 0), manager.named_catalogs.count());
}

test "multiple named catalogs" {
    const allocator = testing.allocator;

    const json_content =
        \\{
        \\  "catalogs": {
        \\    "frontend": {
        \\      "react": "^19.0.0",
        \\      "vue": "^3.0.0"
        \\    },
        \\    "backend": {
        \\      "express": "^4.18.0",
        \\      "fastify": "^4.0.0"
        \\    },
        \\    "testing": {
        \\      "jest": "^29.0.0",
        \\      "vitest": "^1.0.0"
        \\    },
        \\    "tooling": {
        \\      "typescript": "^5.0.0",
        \\      "eslint": "^8.0.0"
        \\    }
        \\  }
        \\}
    ;

    const parsed = try std.json.parseFromSlice(std.json.Value, allocator, json_content, .{});
    defer parsed.deinit();

    var manager = try lib.deps.parseCatalogs(allocator, parsed);
    defer manager.deinit();

    // All catalogs should be accessible
    try testing.expectEqualStrings("^19.0.0", manager.resolveCatalogReference("react", "catalog:frontend").?);
    try testing.expectEqualStrings("^4.18.0", manager.resolveCatalogReference("express", "catalog:backend").?);
    try testing.expectEqualStrings("^29.0.0", manager.resolveCatalogReference("jest", "catalog:testing").?);
    try testing.expectEqualStrings("^5.0.0", manager.resolveCatalogReference("typescript", "catalog:tooling").?);
}
