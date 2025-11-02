const std = @import("std");
const generated = @import("generated.zig");

/// Semver constraint types
pub const ConstraintType = enum {
    exact, // 1.2.3
    caret, // ^1.2.3 - compatible with version
    tilde, // ~1.2.3 - approximately equivalent
    gte, // >=1.2.3
    lte, // <=1.2.3
    gt, // >1.2.3
    lt, // <1.2.3
};

pub const Constraint = struct {
    type: ConstraintType,
    major: u32,
    minor: u32,
    patch: u32,
};

/// Parse a semver version string into major.minor.patch
pub fn parseVersion(version: []const u8) !struct { major: u32, minor: u32, patch: u32 } {
    var clean_version = version;

    // Strip 'v' prefix if present
    if (std.mem.startsWith(u8, clean_version, "v")) {
        clean_version = clean_version[1..];
    }

    // Split by '.' and '-' (for pre-release versions)
    var parts = std.mem.splitAny(u8, clean_version, ".-");

    const major_str = parts.next() orelse return error.InvalidVersion;
    const minor_str = parts.next() orelse "0";
    const patch_str = parts.next() orelse "0";

    const major = std.fmt.parseInt(u32, major_str, 10) catch return error.InvalidVersion;
    const minor = std.fmt.parseInt(u32, minor_str, 10) catch 0;
    const patch = std.fmt.parseInt(u32, patch_str, 10) catch 0;

    return .{ .major = major, .minor = minor, .patch = patch };
}

/// Parse a version constraint string like "^1.2.3" or ">=1.0.0"
pub fn parseConstraint(constraint_str: []const u8) !Constraint {
    var version_str = constraint_str;
    var constraint_type = ConstraintType.exact;

    // Detect constraint type and strip prefix
    if (std.mem.startsWith(u8, version_str, "^")) {
        constraint_type = .caret;
        version_str = version_str[1..];
    } else if (std.mem.startsWith(u8, version_str, "~")) {
        constraint_type = .tilde;
        version_str = version_str[1..];
    } else if (std.mem.startsWith(u8, version_str, ">=")) {
        constraint_type = .gte;
        version_str = version_str[2..];
    } else if (std.mem.startsWith(u8, version_str, "<=")) {
        constraint_type = .lte;
        version_str = version_str[2..];
    } else if (std.mem.startsWith(u8, version_str, ">")) {
        constraint_type = .gt;
        version_str = version_str[1..];
    } else if (std.mem.startsWith(u8, version_str, "<")) {
        constraint_type = .lt;
        version_str = version_str[1..];
    } else if (std.mem.startsWith(u8, version_str, "=")) {
        constraint_type = .exact;
        version_str = version_str[1..];
    }

    const version = try parseVersion(version_str);

    return Constraint{
        .type = constraint_type,
        .major = version.major,
        .minor = version.minor,
        .patch = version.patch,
    };
}

/// Check if a version satisfies a constraint
pub fn satisfiesConstraint(version_str: []const u8, constraint: Constraint) bool {
    const version = parseVersion(version_str) catch return false;

    return switch (constraint.type) {
        .exact => version.major == constraint.major and
            version.minor == constraint.minor and
            version.patch == constraint.patch,

        // ^1.2.3 := >=1.2.3 <2.0.0
        .caret => {
            if (constraint.major == 0) {
                // ^0.x.y is special - only patch updates allowed
                return version.major == 0 and
                    version.minor == constraint.minor and
                    version.patch >= constraint.patch;
            } else {
                // ^1.2.3 allows 1.x.x but not 2.0.0
                return version.major == constraint.major and
                    (version.minor > constraint.minor or
                    (version.minor == constraint.minor and version.patch >= constraint.patch));
            }
        },

        // ~1.2.3 := >=1.2.3 <1.3.0
        .tilde => version.major == constraint.major and
            version.minor == constraint.minor and
            version.patch >= constraint.patch,

        .gte => version.major > constraint.major or
            (version.major == constraint.major and version.minor > constraint.minor) or
            (version.major == constraint.major and version.minor == constraint.minor and version.patch >= constraint.patch),

        .lte => version.major < constraint.major or
            (version.major == constraint.major and version.minor < constraint.minor) or
            (version.major == constraint.major and version.minor == constraint.minor and version.patch <= constraint.patch),

        .gt => version.major > constraint.major or
            (version.major == constraint.major and version.minor > constraint.minor) or
            (version.major == constraint.major and version.minor == constraint.minor and version.patch > constraint.patch),

        .lt => version.major < constraint.major or
            (version.major == constraint.major and version.minor < constraint.minor) or
            (version.major == constraint.major and version.minor == constraint.minor and version.patch < constraint.patch),
    };
}

/// Resolve a version constraint to the latest matching version for a package
/// Returns the resolved version string or null if no match found
pub fn resolveVersion(domain: []const u8, constraint_str: []const u8) ?[]const u8 {
    // Get package by domain
    const pkg = generated.getPackageByDomain(domain) orelse return null;

    // Handle "latest" as a special case - return the newest version
    if (std.mem.eql(u8, constraint_str, "latest")) {
        if (pkg.versions.len > 0) {
            return pkg.versions[0]; // Already sorted newest to oldest
        }
        return null;
    }

    // Parse constraint
    const constraint = parseConstraint(constraint_str) catch return null;

    // Versions are already sorted from newest to oldest
    // Return the first (newest) version that satisfies the constraint
    for (pkg.versions) |version| {
        if (satisfiesConstraint(version, constraint)) {
            return version;
        }
    }

    return null;
}

test "parse version" {
    const v1 = try parseVersion("1.2.3");
    try std.testing.expectEqual(@as(u32, 1), v1.major);
    try std.testing.expectEqual(@as(u32, 2), v1.minor);
    try std.testing.expectEqual(@as(u32, 3), v1.patch);

    const v2 = try parseVersion("v1.2.3");
    try std.testing.expectEqual(@as(u32, 1), v2.major);

    const v3 = try parseVersion("1.2.3-beta");
    try std.testing.expectEqual(@as(u32, 1), v3.major);
    try std.testing.expectEqual(@as(u32, 2), v3.minor);
    try std.testing.expectEqual(@as(u32, 3), v3.patch);
}

test "parse constraint" {
    const c1 = try parseConstraint("^1.2.3");
    try std.testing.expectEqual(ConstraintType.caret, c1.type);
    try std.testing.expectEqual(@as(u32, 1), c1.major);

    const c2 = try parseConstraint("~1.2.0");
    try std.testing.expectEqual(ConstraintType.tilde, c2.type);

    const c3 = try parseConstraint(">=1.0.0");
    try std.testing.expectEqual(ConstraintType.gte, c3.type);
}

test "satisfies constraint - exact" {
    const c = Constraint{ .type = .exact, .major = 1, .minor = 2, .patch = 3 };
    try std.testing.expect(satisfiesConstraint("1.2.3", c));
    try std.testing.expect(!satisfiesConstraint("1.2.4", c));
}

test "satisfies constraint - caret" {
    const c = Constraint{ .type = .caret, .major = 1, .minor = 2, .patch = 16 };

    // Should allow 1.2.16, 1.2.17, ..., 1.3.0, 1.99.99
    try std.testing.expect(satisfiesConstraint("1.2.16", c));
    try std.testing.expect(satisfiesConstraint("1.2.23", c));
    try std.testing.expect(satisfiesConstraint("1.3.0", c));
    try std.testing.expect(satisfiesConstraint("1.99.99", c));

    // Should NOT allow 2.0.0 or 1.2.15
    try std.testing.expect(!satisfiesConstraint("2.0.0", c));
    try std.testing.expect(!satisfiesConstraint("1.2.15", c));
    try std.testing.expect(!satisfiesConstraint("1.1.0", c));
}

test "satisfies constraint - tilde" {
    const c = Constraint{ .type = .tilde, .major = 1, .minor = 2, .patch = 0 };

    // Should allow 1.2.0, 1.2.1, ..., 1.2.99
    try std.testing.expect(satisfiesConstraint("1.2.0", c));
    try std.testing.expect(satisfiesConstraint("1.2.23", c));

    // Should NOT allow 1.3.0
    try std.testing.expect(!satisfiesConstraint("1.3.0", c));
}

test "resolve version - bun ^1.2.16" {
    const resolved = resolveVersion("bun.sh", "^1.2.16");
    if (resolved) |version| {
        // Should resolve to latest 1.x version (1.2.23 or higher)
        const v = try parseVersion(version);
        try std.testing.expectEqual(@as(u32, 1), v.major);
        try std.testing.expect(v.minor >= 2);
        if (v.minor == 2) {
            try std.testing.expect(v.patch >= 16);
        }
    } else {
        try std.testing.expect(false); // Should find a version
    }
}

test "resolve version - exact match" {
    const resolved = resolveVersion("bun.sh", "1.2.20");
    if (resolved) |version| {
        try std.testing.expectEqualStrings("1.2.20", version);
    } else {
        try std.testing.expect(false);
    }
}
