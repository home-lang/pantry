//! Dependency Overrides and Resolutions Module
//!
//! This module implements npm's "overrides" and Yarn's "resolutions" features,
//! allowing control over metadependency versions (dependencies of dependencies).
//!
//! Overrides/resolutions are used to:
//! - Fix security vulnerabilities in transitive dependencies
//! - Ensure consistent versions across the dependency tree
//! - Work around bugs in specific package versions
//!
//! Features:
//! - Support for both npm "overrides" and Yarn "resolutions" fields
//! - Top-level overrides for package versions
//! - Version range specifications (^, ~, exact versions, etc.)
//! - Validation of override specifications
//!
//! Limitations:
//! - Only top-level overrides are supported (not nested overrides)
//! - Overrides apply globally to all instances of a package
//!
//! Example package.json:
//! {
//!   "dependencies": {
//!     "foo": "^2.0.0"
//!   },
//!   "overrides": {
//!     "bar": "~4.4.0"
//!   }
//! }

const std = @import("std");

// ============================================================================
// Types
// ============================================================================

/// Represents a single override/resolution entry
pub const Override = struct {
    package_name: []const u8,
    version_range: []const u8,

    pub fn deinit(self: *Override, allocator: std.mem.Allocator) void {
        allocator.free(self.package_name);
        allocator.free(self.version_range);
    }

    pub fn clone(self: Override, allocator: std.mem.Allocator) !Override {
        return Override{
            .package_name = try allocator.dupe(u8, self.package_name),
            .version_range = try allocator.dupe(u8, self.version_range),
        };
    }
};

/// Collection of overrides/resolutions
pub const OverrideMap = struct {
    overrides: std.StringHashMap([]const u8),
    allocator: std.mem.Allocator,

    pub fn init(allocator: std.mem.Allocator) OverrideMap {
        return .{
            .overrides = std.StringHashMap([]const u8).init(allocator),
            .allocator = allocator,
        };
    }

    pub fn deinit(self: *OverrideMap) void {
        var it = self.overrides.iterator();
        while (it.next()) |entry| {
            self.allocator.free(entry.key_ptr.*);
            self.allocator.free(entry.value_ptr.*);
        }
        self.overrides.deinit();
    }

    /// Add an override for a package
    pub fn addOverride(self: *OverrideMap, package_name: []const u8, version_range: []const u8) !void {
        const name = try self.allocator.dupe(u8, package_name);
        errdefer self.allocator.free(name);

        const version = try self.allocator.dupe(u8, version_range);
        errdefer self.allocator.free(version);

        try self.overrides.put(name, version);
    }

    /// Get the override version for a package, if any
    pub fn getOverride(self: *OverrideMap, package_name: []const u8) ?[]const u8 {
        return self.overrides.get(package_name);
    }

    /// Check if a package has an override
    pub fn hasOverride(self: *OverrideMap, package_name: []const u8) bool {
        return self.overrides.contains(package_name);
    }

    /// Get number of overrides
    pub fn count(self: *OverrideMap) usize {
        return self.overrides.count();
    }
};

// ============================================================================
// Parsing Functions
// ============================================================================

/// Parse overrides from package.json
/// Looks for both "overrides" (npm) and "resolutions" (Yarn) fields
pub fn parseFromPackageJson(
    allocator: std.mem.Allocator,
    parsed_json: std.json.Parsed(std.json.Value),
) !OverrideMap {
    var override_map = OverrideMap.init(allocator);
    errdefer override_map.deinit();

    const root = parsed_json.value.object;

    // Try "overrides" first (npm style)
    if (root.get("overrides")) |overrides_obj| {
        if (overrides_obj == .object) {
            try parseOverridesObject(undefined, &override_map, overrides_obj.object);
        }
    }

    // Try "resolutions" (Yarn style) - these will merge with overrides
    if (root.get("resolutions")) |resolutions_obj| {
        if (resolutions_obj == .object) {
            try parseOverridesObject(undefined, &override_map, resolutions_obj.object);
        }
    }

    return override_map;
}

/// Parse an overrides/resolutions object from JSON
fn parseOverridesObject(
    _: std.mem.Allocator,
    override_map: *OverrideMap,
    obj: std.json.ObjectMap,
) !void {
    var it = obj.iterator();
    while (it.next()) |entry| {
        const package_name = entry.key_ptr.*;
        const version_value = entry.value_ptr.*;

        // Only support string version specifications
        if (version_value != .string) {
            // Skip non-string values (could be nested overrides which we don't support)
            continue;
        }

        const version_range = version_value.string;

        // Validate version range
        if (!isValidVersionRange(version_range)) {
            std.debug.print("Warning: Invalid version range '{s}' for package '{s}', skipping\n", .{ version_range, package_name });
            continue;
        }

        try override_map.addOverride(package_name, version_range);
    }
}

/// Validate a version range specification
pub fn isValidVersionRange(version: []const u8) bool {
    if (version.len == 0) return false;

    // Allow common version range patterns:
    // - Exact version: 1.2.3
    // - Caret range: ^1.2.3
    // - Tilde range: ~1.2.3
    // - Greater than: >1.2.3, >=1.2.3
    // - Less than: <1.2.3, <=1.2.3
    // - Latest: latest, *
    // - GitHub references: github:owner/repo#ref

    // Check for special keywords
    if (std.mem.eql(u8, version, "latest") or
        std.mem.eql(u8, version, "*") or
        std.mem.eql(u8, version, "next"))
    {
        return true;
    }

    // Check for GitHub references
    if (std.mem.startsWith(u8, version, "github:") or
        std.mem.startsWith(u8, version, "https://github.com/") or
        std.mem.startsWith(u8, version, "git+"))
    {
        return true;
    }

    // Check for version range operators
    if (version[0] == '^' or version[0] == '~' or
        version[0] == '>' or version[0] == '<' or
        version[0] == '=')
    {
        return true;
    }

    // Check for numeric version (should start with a digit)
    if (version[0] >= '0' and version[0] <= '9') {
        return true;
    }

    return false;
}

// ============================================================================
// Application Functions
// ============================================================================

/// Apply overrides to a dependency version
/// Returns the override version if one exists, otherwise returns the original version
pub fn applyOverride(
    override_map: *OverrideMap,
    package_name: []const u8,
    original_version: []const u8,
) []const u8 {
    if (override_map.getOverride(package_name)) |override_version| {
        return override_version;
    }
    return original_version;
}

/// Check if a version should be overridden and return the new version
pub fn shouldOverride(
    override_map: *OverrideMap,
    package_name: []const u8,
) ?[]const u8 {
    return override_map.getOverride(package_name);
}

// ============================================================================
// Tests
// ============================================================================

test "OverrideMap basic operations" {
    const allocator = std.testing.allocator;

    var override_map = OverrideMap.init(allocator);
    defer override_map.deinit();

    // Test adding overrides
    try override_map.addOverride("foo", "^1.0.0");
    try override_map.addOverride("bar", "~2.3.4");

    // Test checking for overrides
    try std.testing.expect(override_map.hasOverride("foo"));
    try std.testing.expect(override_map.hasOverride("bar"));
    try std.testing.expect(!override_map.hasOverride("baz"));

    // Test getting overrides
    const foo_override = override_map.getOverride("foo");
    try std.testing.expect(foo_override != null);
    try std.testing.expectEqualStrings("^1.0.0", foo_override.?);

    const bar_override = override_map.getOverride("bar");
    try std.testing.expect(bar_override != null);
    try std.testing.expectEqualStrings("~2.3.4", bar_override.?);

    const baz_override = override_map.getOverride("baz");
    try std.testing.expect(baz_override == null);

    // Test count
    try std.testing.expectEqual(@as(usize, 2), override_map.count());
}

test "parseFromPackageJson with overrides" {
    const allocator = std.testing.allocator;

    const json_content =
        \\{
        \\  "name": "test-app",
        \\  "dependencies": {
        \\    "foo": "^2.0.0"
        \\  },
        \\  "overrides": {
        \\    "bar": "~4.4.0",
        \\    "baz": "^1.2.3"
        \\  }
        \\}
    ;

    const parsed = try std.json.parseFromSlice(std.json.Value, allocator, json_content, .{});
    defer parsed.deinit();

    var override_map = try parseFromPackageJson(allocator, parsed);
    defer override_map.deinit();

    // Check that overrides were parsed
    try std.testing.expectEqual(@as(usize, 2), override_map.count());
    try std.testing.expect(override_map.hasOverride("bar"));
    try std.testing.expect(override_map.hasOverride("baz"));

    const bar_override = override_map.getOverride("bar");
    try std.testing.expectEqualStrings("~4.4.0", bar_override.?);

    const baz_override = override_map.getOverride("baz");
    try std.testing.expectEqualStrings("^1.2.3", baz_override.?);
}

test "parseFromPackageJson with resolutions" {
    const allocator = std.testing.allocator;

    const json_content =
        \\{
        \\  "name": "test-app",
        \\  "dependencies": {
        \\    "foo": "^2.0.0"
        \\  },
        \\  "resolutions": {
        \\    "bar": "~4.4.0"
        \\  }
        \\}
    ;

    const parsed = try std.json.parseFromSlice(std.json.Value, allocator, json_content, .{});
    defer parsed.deinit();

    var override_map = try parseFromPackageJson(allocator, parsed);
    defer override_map.deinit();

    // Check that resolutions were parsed
    try std.testing.expectEqual(@as(usize, 1), override_map.count());
    try std.testing.expect(override_map.hasOverride("bar"));

    const bar_override = override_map.getOverride("bar");
    try std.testing.expectEqualStrings("~4.4.0", bar_override.?);
}

test "parseFromPackageJson with both overrides and resolutions" {
    const allocator = std.testing.allocator;

    const json_content =
        \\{
        \\  "name": "test-app",
        \\  "overrides": {
        \\    "foo": "^1.0.0"
        \\  },
        \\  "resolutions": {
        \\    "bar": "~2.0.0"
        \\  }
        \\}
    ;

    const parsed = try std.json.parseFromSlice(std.json.Value, allocator, json_content, .{});
    defer parsed.deinit();

    var override_map = try parseFromPackageJson(allocator, parsed);
    defer override_map.deinit();

    // Both should be merged
    try std.testing.expectEqual(@as(usize, 2), override_map.count());
    try std.testing.expect(override_map.hasOverride("foo"));
    try std.testing.expect(override_map.hasOverride("bar"));
}

test "isValidVersionRange" {
    // Valid ranges
    try std.testing.expect(isValidVersionRange("1.2.3"));
    try std.testing.expect(isValidVersionRange("^1.2.3"));
    try std.testing.expect(isValidVersionRange("~1.2.3"));
    try std.testing.expect(isValidVersionRange(">1.2.3"));
    try std.testing.expect(isValidVersionRange(">=1.2.3"));
    try std.testing.expect(isValidVersionRange("<2.0.0"));
    try std.testing.expect(isValidVersionRange("latest"));
    try std.testing.expect(isValidVersionRange("*"));
    try std.testing.expect(isValidVersionRange("github:owner/repo#ref"));

    // Invalid ranges
    try std.testing.expect(!isValidVersionRange(""));
    try std.testing.expect(!isValidVersionRange("invalid"));
}

test "applyOverride" {
    const allocator = std.testing.allocator;

    var override_map = OverrideMap.init(allocator);
    defer override_map.deinit();

    try override_map.addOverride("foo", "^2.0.0");

    // Should return override version for foo
    const foo_result = applyOverride(&override_map, "foo", "^1.0.0");
    try std.testing.expectEqualStrings("^2.0.0", foo_result);

    // Should return original version for bar (no override)
    const bar_result = applyOverride(&override_map, "bar", "^1.0.0");
    try std.testing.expectEqualStrings("^1.0.0", bar_result);
}

test "shouldOverride" {
    const allocator = std.testing.allocator;

    var override_map = OverrideMap.init(allocator);
    defer override_map.deinit();

    try override_map.addOverride("foo", "^2.0.0");

    // Should return override for foo
    const foo_override = shouldOverride(&override_map, "foo");
    try std.testing.expect(foo_override != null);
    try std.testing.expectEqualStrings("^2.0.0", foo_override.?);

    // Should return null for bar (no override)
    const bar_override = shouldOverride(&override_map, "bar");
    try std.testing.expect(bar_override == null);
}
