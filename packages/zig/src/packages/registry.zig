const std = @import("std");
const generated = @import("generated.zig");
const aliases = @import("aliases.zig");
const types = @import("types.zig");

/// Package registry with fast lookups
pub const PackageRegistry = struct {
    allocator: std.mem.Allocator,

    pub fn init(allocator: std.mem.Allocator) PackageRegistry {
        return .{ .allocator = allocator };
    }

    pub fn deinit(self: *PackageRegistry) void {
        _ = self;
    }

    /// Get package by name (comptime lookup, zero overhead)
    pub fn getPackage(self: *PackageRegistry, name: []const u8) ?generated.PackageInfo {
        _ = self;
        return generated.getPackageByName(name);
    }

    /// Resolve alias to domain
    pub fn resolveAlias(self: *PackageRegistry, alias: []const u8) ?[]const u8 {
        _ = self;
        return aliases.resolveAlias(alias);
    }

    /// Get all versions for a package (stub - versions not in current generated.zig)
    pub fn getVersions(self: *PackageRegistry, name: []const u8) ?[]const []const u8 {
        const pkg = self.getPackage(name) orelse return null;
        // Currently we don't store versions array, only latest version
        // This would need to be added to the generated code
        _ = pkg;
        return null;
    }

    /// Resolve version constraint
    pub fn resolveVersion(
        self: *PackageRegistry,
        name: []const u8,
        constraint: ?[]const u8,
    ) ![]const u8 {
        const pkg = self.getPackage(name) orelse return error.PackageNotFound;

        // If no constraint or "latest", return the default version
        if (constraint == null or std.mem.eql(u8, constraint.?, "latest")) {
            return pkg.domain; // Simplified: return domain as version identifier
        }

        // For now, return domain. Full version matching would require
        // version data in generated.zig
        return pkg.domain;
    }

    /// Match version constraint (^1.2.0, ~1.2.0, >=1.2.0, etc.)
    pub fn matchVersionConstraint(
        self: *PackageRegistry,
        name: []const u8,
        constraint: []const u8,
    ) ![]const u8 {
        _ = self;
        _ = name;

        // Parse constraint
        if (constraint.len == 0) {
            return error.InvalidConstraint;
        }

        // Handle different constraint types
        const prefix = constraint[0];
        switch (prefix) {
            '^' => {
                // Caret: ^1.2.3 means >=1.2.3 <2.0.0
                return constraint[1..]; // Simplified: return without prefix
            },
            '~' => {
                // Tilde: ~1.2.3 means >=1.2.3 <1.3.0
                return constraint[1..];
            },
            '>' => {
                // Greater than: >=1.2.3 or >1.2.3
                if (constraint.len > 1 and constraint[1] == '=') {
                    return constraint[2..];
                }
                return constraint[1..];
            },
            '<' => {
                // Less than: <=1.2.3 or <1.2.3
                if (constraint.len > 1 and constraint[1] == '=') {
                    return constraint[2..];
                }
                return constraint[1..];
            },
            '=' => {
                // Exact: =1.2.3
                return constraint[1..];
            },
            else => {
                // No prefix, treat as exact version
                return constraint;
            },
        }
    }
};

/// Compare two semantic versions
pub fn compareVersions(a: []const u8, b: []const u8) !std.math.Order {
    var a_parts = std.mem.split(u8, a, ".");
    var b_parts = std.mem.split(u8, b, ".");

    // Compare major, minor, patch
    var i: usize = 0;
    while (i < 3) : (i += 1) {
        const a_part = a_parts.next() orelse "0";
        const b_part = b_parts.next() orelse "0";

        const a_num = try std.fmt.parseInt(u32, a_part, 10);
        const b_num = try std.fmt.parseInt(u32, b_part, 10);

        if (a_num < b_num) return .lt;
        if (a_num > b_num) return .gt;
    }

    return .eq;
}

/// Check if version satisfies constraint
pub fn satisfiesConstraint(version: []const u8, constraint: []const u8) !bool {
    if (constraint.len == 0) return true;

    const prefix = constraint[0];
    switch (prefix) {
        '^' => {
            // Caret: ^1.2.3 means >=1.2.3 <2.0.0
            const min_version = constraint[1..];
            const cmp = try compareVersions(version, min_version);
            if (cmp == .lt) return false;

            // Check upper bound (major version)
            var parts = std.mem.split(u8, min_version, ".");
            const major = parts.next() orelse return false;
            const upper = try std.fmt.parseInt(u32, major, 10) + 1;

            var ver_parts = std.mem.split(u8, version, ".");
            const ver_major = ver_parts.next() orelse return false;
            const ver_major_num = try std.fmt.parseInt(u32, ver_major, 10);

            return ver_major_num < upper;
        },
        '~' => {
            // Tilde: ~1.2.3 means >=1.2.3 <1.3.0
            const min_version = constraint[1..];
            const cmp = try compareVersions(version, min_version);
            if (cmp == .lt) return false;

            // Check upper bound (minor version)
            var parts = std.mem.split(u8, min_version, ".");
            const major = parts.next() orelse return false;
            const minor = parts.next() orelse return false;
            const minor_num = try std.fmt.parseInt(u32, minor, 10) + 1;

            var ver_parts = std.mem.split(u8, version, ".");
            _ = ver_parts.next(); // skip major
            const ver_minor = ver_parts.next() orelse return false;
            const ver_minor_num = try std.fmt.parseInt(u32, ver_minor, 10);

            const ver_major = version[0 .. std.mem.indexOf(u8, version, ".") orelse return false];
            const major_match = std.mem.eql(u8, major, ver_major);

            return major_match and ver_minor_num < minor_num;
        },
        '>' => {
            if (constraint.len > 1 and constraint[1] == '=') {
                // >=
                const min_version = constraint[2..];
                const cmp = try compareVersions(version, min_version);
                return cmp != .lt;
            } else {
                // >
                const min_version = constraint[1..];
                const cmp = try compareVersions(version, min_version);
                return cmp == .gt;
            }
        },
        '<' => {
            if (constraint.len > 1 and constraint[1] == '=') {
                // <=
                const max_version = constraint[2..];
                const cmp = try compareVersions(version, max_version);
                return cmp != .gt;
            } else {
                // <
                const max_version = constraint[1..];
                const cmp = try compareVersions(version, max_version);
                return cmp == .lt;
            }
        },
        '=' => {
            // Exact match
            const exact = constraint[1..];
            return std.mem.eql(u8, version, exact);
        },
        else => {
            // No prefix, exact match
            return std.mem.eql(u8, version, constraint);
        },
    }
}

test "PackageRegistry basic" {
    const allocator = std.testing.allocator;

    var registry = PackageRegistry.init(allocator);
    defer registry.deinit();

    // Test package lookup
    const pkg = registry.getPackage("node");
    try std.testing.expect(pkg != null);
    if (pkg) |p| {
        try std.testing.expectEqualStrings("nodejs.org", p.domain);
    }
}

test "resolveAlias" {
    const allocator = std.testing.allocator;

    var registry = PackageRegistry.init(allocator);
    defer registry.deinit();

    // Test alias resolution
    const domain = registry.resolveAlias("node");
    try std.testing.expect(domain != null);
}

test "compareVersions" {
    try std.testing.expect(try compareVersions("1.0.0", "1.0.0") == .eq);
    try std.testing.expect(try compareVersions("1.0.0", "1.0.1") == .lt);
    try std.testing.expect(try compareVersions("1.0.1", "1.0.0") == .gt);
    try std.testing.expect(try compareVersions("2.0.0", "1.9.9") == .gt);
}

test "satisfiesConstraint caret" {
    try std.testing.expect(try satisfiesConstraint("1.2.3", "^1.2.0"));
    try std.testing.expect(try satisfiesConstraint("1.9.9", "^1.2.0"));
    try std.testing.expect(!try satisfiesConstraint("2.0.0", "^1.2.0"));
    try std.testing.expect(!try satisfiesConstraint("1.1.0", "^1.2.0"));
}

test "satisfiesConstraint tilde" {
    try std.testing.expect(try satisfiesConstraint("1.2.3", "~1.2.0"));
    try std.testing.expect(try satisfiesConstraint("1.2.9", "~1.2.0"));
    try std.testing.expect(!try satisfiesConstraint("1.3.0", "~1.2.0"));
    try std.testing.expect(!try satisfiesConstraint("1.1.0", "~1.2.0"));
}

test "satisfiesConstraint comparison" {
    try std.testing.expect(try satisfiesConstraint("1.2.3", ">=1.2.0"));
    try std.testing.expect(try satisfiesConstraint("1.2.0", ">=1.2.0"));
    try std.testing.expect(!try satisfiesConstraint("1.1.9", ">=1.2.0"));

    try std.testing.expect(try satisfiesConstraint("1.1.9", "<=1.2.0"));
    try std.testing.expect(!try satisfiesConstraint("1.2.1", "<=1.2.0"));
}
