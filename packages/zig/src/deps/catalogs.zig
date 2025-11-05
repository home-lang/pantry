//! Dependency Catalogs Module
//!
//! This module implements bun's "catalogs" feature, which allows sharing common
//! dependency versions across multiple packages in a monorepo.
//!
//! Features:
//! - Single default catalog via "catalog" field
//! - Multiple named catalogs via "catalogs" field
//! - catalog: protocol for referencing versions
//! - catalog:<name> protocol for named catalogs
//! - Supports both top-level and workspaces.catalog locations
//!
//! Usage in root package.json:
//! {
//!   "workspaces": {
//!     "catalog": {
//!       "react": "^19.0.0"
//!     },
//!     "catalogs": {
//!       "testing": {
//!         "jest": "30.0.0"
//!       }
//!     }
//!   }
//! }
//!
//! Usage in workspace package:
//! {
//!   "dependencies": {
//!     "react": "catalog:",
//!     "jest": "catalog:testing"
//!   }
//! }

const std = @import("std");

// ============================================================================
// Types
// ============================================================================

/// A single catalog containing package versions
pub const Catalog = struct {
    name: []const u8, // Empty string for default catalog
    versions: std.StringHashMap([]const u8),
    allocator: std.mem.Allocator,

    pub fn init(allocator: std.mem.Allocator, name: []const u8) Catalog {
        return .{
            .name = name,
            .versions = std.StringHashMap([]const u8).init(allocator),
            .allocator = allocator,
        };
    }

    pub fn deinit(self: *Catalog) void {
        self.allocator.free(self.name);
        var it = self.versions.iterator();
        while (it.next()) |entry| {
            self.allocator.free(entry.key_ptr.*);
            self.allocator.free(entry.value_ptr.*);
        }
        self.versions.deinit();
    }

    pub fn addVersion(self: *Catalog, package_name: []const u8, version: []const u8) !void {
        const name = try self.allocator.dupe(u8, package_name);
        errdefer self.allocator.free(name);

        const ver = try self.allocator.dupe(u8, version);
        errdefer self.allocator.free(ver);

        try self.versions.put(name, ver);
    }

    pub fn getVersion(self: *const Catalog, package_name: []const u8) ?[]const u8 {
        return self.versions.get(package_name);
    }

    pub fn hasPackage(self: *const Catalog, package_name: []const u8) bool {
        return self.versions.contains(package_name);
    }
};

/// Collection of catalogs
pub const CatalogManager = struct {
    default_catalog: ?Catalog, // The unnamed "catalog" field
    named_catalogs: std.StringHashMap(Catalog), // Named catalogs from "catalogs" field
    allocator: std.mem.Allocator,

    pub fn init(allocator: std.mem.Allocator) CatalogManager {
        return .{
            .default_catalog = null,
            .named_catalogs = std.StringHashMap(Catalog).init(allocator),
            .allocator = allocator,
        };
    }

    pub fn deinit(self: *CatalogManager) void {
        if (self.default_catalog) |*catalog| {
            catalog.deinit();
        }

        var it = self.named_catalogs.iterator();
        while (it.next()) |entry| {
            self.allocator.free(entry.key_ptr.*);
            var catalog = entry.value_ptr.*;
            catalog.deinit();
        }
        self.named_catalogs.deinit();
    }

    /// Add a default catalog
    pub fn setDefaultCatalog(self: *CatalogManager, catalog: Catalog) void {
        if (self.default_catalog) |*old| {
            old.deinit();
        }
        self.default_catalog = catalog;
    }

    /// Add a named catalog
    pub fn addNamedCatalog(self: *CatalogManager, name: []const u8, catalog: Catalog) !void {
        const catalog_name = try self.allocator.dupe(u8, name);
        errdefer self.allocator.free(catalog_name);

        try self.named_catalogs.put(catalog_name, catalog);
    }

    /// Resolve a catalog reference (e.g., "catalog:" or "catalog:testing")
    pub fn resolveCatalogReference(
        self: *CatalogManager,
        package_name: []const u8,
        catalog_ref: []const u8,
    ) ?[]const u8 {
        // Parse catalog reference: "catalog:" or "catalog:name"
        if (!std.mem.startsWith(u8, catalog_ref, "catalog:")) {
            return null; // Not a catalog reference
        }

        const after_colon = catalog_ref[8..]; // Skip "catalog:"

        // Empty or whitespace after colon = default catalog
        const trimmed = std.mem.trim(u8, after_colon, " \t\r\n");

        if (trimmed.len == 0) {
            // Use default catalog
            if (self.default_catalog) |*catalog| {
                return catalog.getVersion(package_name);
            }
            return null;
        }

        // Use named catalog
        if (self.named_catalogs.get(trimmed)) |*catalog| {
            return catalog.getVersion(package_name);
        }

        return null;
    }

    /// Check if a version string is a catalog reference
    pub fn isCatalogReference(version: []const u8) bool {
        return std.mem.startsWith(u8, version, "catalog:");
    }

    /// Get the catalog name from a reference (empty string for default)
    pub fn getCatalogName(catalog_ref: []const u8) ?[]const u8 {
        if (!std.mem.startsWith(u8, catalog_ref, "catalog:")) {
            return null;
        }

        const after_colon = catalog_ref[8..];
        const trimmed = std.mem.trim(u8, after_colon, " \t\r\n");
        return trimmed;
    }
};

// ============================================================================
// Parsing Functions
// ============================================================================

/// Parse catalogs from package.json
/// Looks for catalogs in both top-level and workspaces locations
pub fn parseFromPackageJson(
    allocator: std.mem.Allocator,
    parsed_json: std.json.Parsed(std.json.Value),
) !CatalogManager {
    var manager = CatalogManager.init(allocator);
    errdefer manager.deinit();

    const root = parsed_json.value.object;

    // Try workspaces.catalog and workspaces.catalogs first
    if (root.get("workspaces")) |workspaces_value| {
        if (workspaces_value == .object) {
            const workspaces = workspaces_value.object;

            // Parse workspaces.catalog (default catalog)
            if (workspaces.get("catalog")) |catalog_obj| {
                if (catalog_obj == .object) {
                    var default_catalog = Catalog.init(allocator, try allocator.dupe(u8, ""));
                    errdefer default_catalog.deinit();

                    try parseCatalogObject(allocator, &default_catalog, catalog_obj.object);
                    manager.setDefaultCatalog(default_catalog);
                }
            }

            // Parse workspaces.catalogs (named catalogs)
            if (workspaces.get("catalogs")) |catalogs_obj| {
                if (catalogs_obj == .object) {
                    try parseNamedCatalogs(allocator, &manager, catalogs_obj.object);
                }
            }
        }
    }

    // Try top-level catalog (if workspaces.catalog not found)
    if (manager.default_catalog == null) {
        if (root.get("catalog")) |catalog_obj| {
            if (catalog_obj == .object) {
                var default_catalog = Catalog.init(allocator, try allocator.dupe(u8, ""));
                errdefer default_catalog.deinit();

                try parseCatalogObject(allocator, &default_catalog, catalog_obj.object);
                manager.setDefaultCatalog(default_catalog);
            }
        }
    }

    // Try top-level catalogs (merge with workspaces.catalogs)
    if (root.get("catalogs")) |catalogs_obj| {
        if (catalogs_obj == .object) {
            try parseNamedCatalogs(allocator, &manager, catalogs_obj.object);
        }
    }

    return manager;
}

/// Parse a single catalog object (package_name: version pairs)
fn parseCatalogObject(
    allocator: std.mem.Allocator,
    catalog: *Catalog,
    obj: std.json.ObjectMap,
) !void {
    _ = allocator;
    var it = obj.iterator();
    while (it.next()) |entry| {
        const package_name = entry.key_ptr.*;
        const version_value = entry.value_ptr.*;

        // Only support string versions
        if (version_value != .string) {
            continue;
        }

        const version = version_value.string;

        // Validate version
        if (!isValidVersion(version)) {
            std.debug.print("Warning: Invalid version '{s}' for package '{s}' in catalog, skipping\n", .{ version, package_name });
            continue;
        }

        try catalog.addVersion(package_name, version);
    }
}

/// Parse named catalogs object
fn parseNamedCatalogs(
    allocator: std.mem.Allocator,
    manager: *CatalogManager,
    catalogs_obj: std.json.ObjectMap,
) !void {
    var it = catalogs_obj.iterator();
    while (it.next()) |entry| {
        const catalog_name = entry.key_ptr.*;
        const catalog_value = entry.value_ptr.*;

        // Skip non-object values
        if (catalog_value != .object) {
            continue;
        }

        // Create catalog
        var catalog = Catalog.init(allocator, try allocator.dupe(u8, catalog_name));
        errdefer catalog.deinit();

        try parseCatalogObject(allocator, &catalog, catalog_value.object);

        // Only add if it has at least one package
        if (catalog.versions.count() > 0) {
            try manager.addNamedCatalog(catalog_name, catalog);
        } else {
            catalog.deinit();
        }
    }
}

/// Validate a version string
fn isValidVersion(version: []const u8) bool {
    if (version.len == 0) return false;

    // Allow common version patterns
    if (std.mem.eql(u8, version, "latest") or
        std.mem.eql(u8, version, "*") or
        std.mem.eql(u8, version, "next"))
    {
        return true;
    }

    // Check for version range operators or numbers
    if (version[0] == '^' or version[0] == '~' or
        version[0] == '>' or version[0] == '<' or
        version[0] == '=' or
        (version[0] >= '0' and version[0] <= '9'))
    {
        return true;
    }

    // GitHub references
    if (std.mem.startsWith(u8, version, "github:") or
        std.mem.startsWith(u8, version, "https://github.com/") or
        std.mem.startsWith(u8, version, "git+"))
    {
        return true;
    }

    // workspace: protocol
    if (std.mem.startsWith(u8, version, "workspace:")) {
        return true;
    }

    return false;
}

// ============================================================================
// Tests
// ============================================================================

test "Catalog basic operations" {
    const allocator = std.testing.allocator;

    var catalog = Catalog.init(allocator, try allocator.dupe(u8, "testing"));
    defer catalog.deinit();

    // Add versions
    try catalog.addVersion("jest", "30.0.0");
    try catalog.addVersion("vitest", "^1.0.0");

    // Check versions
    try std.testing.expect(catalog.hasPackage("jest"));
    try std.testing.expect(catalog.hasPackage("vitest"));
    try std.testing.expect(!catalog.hasPackage("unknown"));

    // Get versions
    const jest_version = catalog.getVersion("jest");
    try std.testing.expect(jest_version != null);
    try std.testing.expectEqualStrings("30.0.0", jest_version.?);

    const vitest_version = catalog.getVersion("vitest");
    try std.testing.expect(vitest_version != null);
    try std.testing.expectEqualStrings("^1.0.0", vitest_version.?);
}

test "CatalogManager with default catalog" {
    const allocator = std.testing.allocator;

    var manager = CatalogManager.init(allocator);
    defer manager.deinit();

    // Create and set default catalog
    var default_catalog = Catalog.init(allocator, try allocator.dupe(u8, ""));
    try default_catalog.addVersion("react", "^19.0.0");
    try default_catalog.addVersion("react-dom", "^19.0.0");

    manager.setDefaultCatalog(default_catalog);

    // Resolve from default catalog
    const react_version = manager.resolveCatalogReference("react", "catalog:");
    try std.testing.expect(react_version != null);
    try std.testing.expectEqualStrings("^19.0.0", react_version.?);

    // Whitespace should also work
    const react_version2 = manager.resolveCatalogReference("react", "catalog:  ");
    try std.testing.expect(react_version2 != null);
    try std.testing.expectEqualStrings("^19.0.0", react_version2.?);
}

test "CatalogManager with named catalogs" {
    const allocator = std.testing.allocator;

    var manager = CatalogManager.init(allocator);
    defer manager.deinit();

    // Create testing catalog
    var testing_catalog = Catalog.init(allocator, try allocator.dupe(u8, "testing"));
    try testing_catalog.addVersion("jest", "30.0.0");
    try manager.addNamedCatalog("testing", testing_catalog);

    // Create build catalog
    var build_catalog = Catalog.init(allocator, try allocator.dupe(u8, "build"));
    try build_catalog.addVersion("webpack", "5.88.2");
    try manager.addNamedCatalog("build", build_catalog);

    // Resolve from named catalogs
    const jest_version = manager.resolveCatalogReference("jest", "catalog:testing");
    try std.testing.expect(jest_version != null);
    try std.testing.expectEqualStrings("30.0.0", jest_version.?);

    const webpack_version = manager.resolveCatalogReference("webpack", "catalog:build");
    try std.testing.expect(webpack_version != null);
    try std.testing.expectEqualStrings("5.88.2", webpack_version.?);
}

test "isCatalogReference" {
    try std.testing.expect(CatalogManager.isCatalogReference("catalog:"));
    try std.testing.expect(CatalogManager.isCatalogReference("catalog:testing"));
    try std.testing.expect(CatalogManager.isCatalogReference("catalog:  "));

    try std.testing.expect(!CatalogManager.isCatalogReference("^1.0.0"));
    try std.testing.expect(!CatalogManager.isCatalogReference("latest"));
    try std.testing.expect(!CatalogManager.isCatalogReference("workspace:*"));
}

test "getCatalogName" {
    const name1 = CatalogManager.getCatalogName("catalog:");
    try std.testing.expect(name1 != null);
    try std.testing.expectEqualStrings("", name1.?);

    const name2 = CatalogManager.getCatalogName("catalog:testing");
    try std.testing.expect(name2 != null);
    try std.testing.expectEqualStrings("testing", name2.?);

    const name3 = CatalogManager.getCatalogName("catalog:  ");
    try std.testing.expect(name3 != null);
    try std.testing.expectEqualStrings("", name3.?);

    const name4 = CatalogManager.getCatalogName("^1.0.0");
    try std.testing.expect(name4 == null);
}

test "parseFromPackageJson with workspaces.catalog" {
    const allocator = std.testing.allocator;

    const json_content =
        \\{
        \\  "name": "monorepo",
        \\  "workspaces": {
        \\    "catalog": {
        \\      "react": "^19.0.0",
        \\      "react-dom": "^19.0.0"
        \\    }
        \\  }
        \\}
    ;

    const parsed = try std.json.parseFromSlice(std.json.Value, allocator, json_content, .{});
    defer parsed.deinit();

    var manager = try parseFromPackageJson(allocator, parsed);
    defer manager.deinit();

    // Check default catalog exists
    try std.testing.expect(manager.default_catalog != null);

    // Resolve versions
    const react_version = manager.resolveCatalogReference("react", "catalog:");
    try std.testing.expect(react_version != null);
    try std.testing.expectEqualStrings("^19.0.0", react_version.?);
}

test "parseFromPackageJson with workspaces.catalogs" {
    const allocator = std.testing.allocator;

    const json_content =
        \\{
        \\  "name": "monorepo",
        \\  "workspaces": {
        \\    "catalogs": {
        \\      "testing": {
        \\        "jest": "30.0.0"
        \\      },
        \\      "build": {
        \\        "webpack": "5.88.2"
        \\      }
        \\    }
        \\  }
        \\}
    ;

    const parsed = try std.json.parseFromSlice(std.json.Value, allocator, json_content, .{});
    defer parsed.deinit();

    var manager = try parseFromPackageJson(allocator, parsed);
    defer manager.deinit();

    // Resolve from named catalogs
    const jest_version = manager.resolveCatalogReference("jest", "catalog:testing");
    try std.testing.expect(jest_version != null);
    try std.testing.expectEqualStrings("30.0.0", jest_version.?);

    const webpack_version = manager.resolveCatalogReference("webpack", "catalog:build");
    try std.testing.expect(webpack_version != null);
    try std.testing.expectEqualStrings("5.88.2", webpack_version.?);
}

test "parseFromPackageJson with top-level catalog" {
    const allocator = std.testing.allocator;

    const json_content =
        \\{
        \\  "name": "monorepo",
        \\  "catalog": {
        \\    "react": "^19.0.0"
        \\  }
        \\}
    ;

    const parsed = try std.json.parseFromSlice(std.json.Value, allocator, json_content, .{});
    defer parsed.deinit();

    var manager = try parseFromPackageJson(allocator, parsed);
    defer manager.deinit();

    // Check default catalog exists
    try std.testing.expect(manager.default_catalog != null);

    const react_version = manager.resolveCatalogReference("react", "catalog:");
    try std.testing.expect(react_version != null);
    try std.testing.expectEqualStrings("^19.0.0", react_version.?);
}

test "isValidVersion" {
    // Valid versions
    try std.testing.expect(isValidVersion("1.2.3"));
    try std.testing.expect(isValidVersion("^1.2.3"));
    try std.testing.expect(isValidVersion("~1.2.3"));
    try std.testing.expect(isValidVersion(">=1.0.0"));
    try std.testing.expect(isValidVersion("latest"));
    try std.testing.expect(isValidVersion("*"));
    try std.testing.expect(isValidVersion("github:owner/repo"));
    try std.testing.expect(isValidVersion("workspace:*"));

    // Invalid versions
    try std.testing.expect(!isValidVersion(""));
    try std.testing.expect(!isValidVersion("invalid"));
}
