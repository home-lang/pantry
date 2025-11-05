const std = @import("std");

/// Default minimum release age: 3 days (259200 seconds)
pub const DEFAULT_MINIMUM_AGE_SECONDS: u64 = 259200;

/// Configuration for release age checking
pub const ReleaseAgeConfig = struct {
    /// Minimum age in seconds (default: 259200 = 3 days)
    minimum_age_seconds: u64 = DEFAULT_MINIMUM_AGE_SECONDS,
    /// Packages to exclude from age check
    excludes: []const []const u8 = &[_][]const u8{},

    pub fn deinit(self: *ReleaseAgeConfig, allocator: std.mem.Allocator) void {
        for (self.excludes) |exclude| {
            allocator.free(exclude);
        }
        if (self.excludes.len > 0) {
            allocator.free(self.excludes);
        }
    }
};

/// Check if a package name is excluded from age check
pub fn isExcluded(config: ReleaseAgeConfig, package_name: []const u8) bool {
    for (config.excludes) |exclude| {
        if (std.mem.eql(u8, package_name, exclude)) {
            return true;
        }
    }
    return false;
}

/// Check if a release is old enough based on publish timestamp
/// timestamp: Unix timestamp when the package version was published
/// current_time: Current Unix timestamp
/// Returns true if the release is old enough or if the package is excluded
pub fn isReleaseOldEnough(
    config: ReleaseAgeConfig,
    package_name: []const u8,
    publish_timestamp: u64,
    current_time: u64,
) bool {
    // Check if package is excluded
    if (isExcluded(config, package_name)) {
        return true; // Excluded packages always pass
    }

    // Check if release is old enough
    if (current_time < publish_timestamp) {
        // Future timestamp - invalid, reject
        return false;
    }

    const age_seconds = current_time - publish_timestamp;
    return age_seconds >= config.minimum_age_seconds;
}

/// Format age duration as human-readable string
pub fn formatAge(allocator: std.mem.Allocator, age_seconds: u64) ![]const u8 {
    if (age_seconds < 60) {
        return std.fmt.allocPrint(allocator, "{d} seconds", .{age_seconds});
    } else if (age_seconds < 3600) {
        const minutes = age_seconds / 60;
        return std.fmt.allocPrint(allocator, "{d} minutes", .{minutes});
    } else if (age_seconds < 86400) {
        const hours = age_seconds / 3600;
        return std.fmt.allocPrint(allocator, "{d} hours", .{hours});
    } else {
        const days = age_seconds / 86400;
        return std.fmt.allocPrint(allocator, "{d} days", .{days});
    }
}

test "isExcluded with empty excludes" {
    const config = ReleaseAgeConfig{
        .excludes = &[_][]const u8{},
    };

    try std.testing.expect(!isExcluded(config, "some-package"));
}

test "isExcluded with excludes list" {
    const config = ReleaseAgeConfig{
        .excludes = &[_][]const u8{ "@types/node", "typescript" },
    };

    try std.testing.expect(isExcluded(config, "@types/node"));
    try std.testing.expect(isExcluded(config, "typescript"));
    try std.testing.expect(!isExcluded(config, "other-package"));
}

test "isReleaseOldEnough with default config" {
    const config = ReleaseAgeConfig{};

    // Current time
    const now: u64 = 1000000;

    // Package published 4 days ago (> 3 day minimum)
    const old_enough = now - (4 * 86400);
    try std.testing.expect(isReleaseOldEnough(config, "old-package", old_enough, now));

    // Package published 2 days ago (< 3 day minimum)
    const too_new = now - (2 * 86400);
    try std.testing.expect(!isReleaseOldEnough(config, "new-package", too_new, now));
}

test "isReleaseOldEnough with excluded package" {
    const config = ReleaseAgeConfig{
        .excludes = &[_][]const u8{"@types/node"},
    };

    const now: u64 = 1000000;

    // Excluded package published 1 second ago should still pass
    const just_published = now - 1;
    try std.testing.expect(isReleaseOldEnough(config, "@types/node", just_published, now));

    // Non-excluded package published 1 second ago should fail
    try std.testing.expect(!isReleaseOldEnough(config, "other-package", just_published, now));
}

test "isReleaseOldEnough with custom minimum age" {
    const config = ReleaseAgeConfig{
        .minimum_age_seconds = 3600, // 1 hour
    };

    const now: u64 = 1000000;

    // Package published 2 hours ago
    const old_enough = now - (2 * 3600);
    try std.testing.expect(isReleaseOldEnough(config, "package", old_enough, now));

    // Package published 30 minutes ago
    const too_new = now - 1800;
    try std.testing.expect(!isReleaseOldEnough(config, "package", too_new, now));
}

test "formatAge returns correct strings" {
    const allocator = std.testing.allocator;

    // 30 seconds
    const age1 = try formatAge(allocator, 30);
    defer allocator.free(age1);
    try std.testing.expectEqualStrings("30 seconds", age1);

    // 90 seconds = 1 minute
    const age2 = try formatAge(allocator, 90);
    defer allocator.free(age2);
    try std.testing.expectEqualStrings("1 minutes", age2);

    // 7200 seconds = 2 hours
    const age3 = try formatAge(allocator, 7200);
    defer allocator.free(age3);
    try std.testing.expectEqualStrings("2 hours", age3);

    // 259200 seconds = 3 days
    const age4 = try formatAge(allocator, 259200);
    defer allocator.free(age4);
    try std.testing.expectEqualStrings("3 days", age4);
}
