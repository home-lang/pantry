//! Dependency Conflict Resolution
//!
//! This module handles conflicts when multiple packages require different versions
//! of the same dependency. Strategies include:
//! - Highest compatible version
//! - SemVer range resolution
//! - Manual conflict markers

const std = @import("std");

/// Conflict resolution strategy
pub const ResolutionStrategy = enum {
    /// Use the highest compatible version
    highest_compatible,
    /// Use the lowest compatible version (most conservative)
    lowest_compatible,
    /// Fail on any conflict
    strict,
    /// Use first encountered version
    first_wins,
    /// Use last encountered version
    last_wins,
};

/// Dependency conflict
pub const Conflict = struct {
    package_name: []const u8,
    required_by: std.ArrayList(Requester),
    allocator: std.mem.Allocator,

    pub const Requester = struct {
        package: []const u8,
        version_range: []const u8,

        pub fn deinit(self: *Requester, allocator: std.mem.Allocator) void {
            allocator.free(self.package);
            allocator.free(self.version_range);
        }
    };

    pub fn init(allocator: std.mem.Allocator, package_name: []const u8) !Conflict {
        return .{
            .package_name = try allocator.dupe(u8, package_name),
            .required_by = .{},
            .allocator = allocator,
        };
    }

    pub fn deinit(self: *Conflict) void {
        self.allocator.free(self.package_name);
        for (self.required_by.items) |*req| {
            req.deinit(self.allocator);
        }
        self.required_by.deinit(self.allocator);
    }

    pub fn addRequester(self: *Conflict, package: []const u8, version_range: []const u8) !void {
        try self.required_by.append(self.allocator, .{
            .package = try self.allocator.dupe(u8, package),
            .version_range = try self.allocator.dupe(u8, version_range),
        });
    }
};

/// Conflict resolver
pub const ConflictResolver = struct {
    allocator: std.mem.Allocator,
    strategy: ResolutionStrategy,
    conflicts: std.StringHashMap(Conflict),

    pub fn init(allocator: std.mem.Allocator, strategy: ResolutionStrategy) ConflictResolver {
        return .{
            .allocator = allocator,
            .strategy = strategy,
            .conflicts = std.StringHashMap(Conflict).init(allocator),
        };
    }

    pub fn deinit(self: *ConflictResolver) void {
        var it = self.conflicts.valueIterator();
        while (it.next()) |conflict| {
            var c = conflict.*;
            c.deinit();
        }
        self.conflicts.deinit();
    }

    /// Record a dependency requirement
    pub fn recordRequirement(
        self: *ConflictResolver,
        package_name: []const u8,
        required_by: []const u8,
        version_range: []const u8,
    ) !void {
        const entry = try self.conflicts.getOrPut(package_name);
        if (!entry.found_existing) {
            entry.value_ptr.* = try Conflict.init(self.allocator, package_name);
        }

        try entry.value_ptr.addRequester(required_by, version_range);
    }

    /// Resolve conflicts and return a map of package -> resolved version
    pub fn resolveAll(self: *ConflictResolver) !std.StringHashMap([]const u8) {
        var resolutions = std.StringHashMap([]const u8).init(self.allocator);
        errdefer resolutions.deinit();

        var it = self.conflicts.iterator();
        while (it.next()) |entry| {
            const package_name = entry.key_ptr.*;
            const conflict = entry.value_ptr.*;

            // If there's only one requester, no conflict
            if (conflict.required_by.items.len <= 1) {
                if (conflict.required_by.items.len == 1) {
                    const resolved = try self.allocator.dupe(u8, conflict.required_by.items[0].version_range);
                    try resolutions.put(try self.allocator.dupe(u8, package_name), resolved);
                }
                continue;
            }

            // Multiple requirements - resolve based on strategy
            const resolved = try self.resolveConflict(conflict);
            if (resolved) |version| {
                try resolutions.put(try self.allocator.dupe(u8, package_name), version);
            } else {
                // Failed to resolve
                if (self.strategy == .strict) {
                    return error.UnresolvedConflict;
                }
            }
        }

        return resolutions;
    }

    /// Resolve a single conflict
    fn resolveConflict(self: *ConflictResolver, conflict: Conflict) !?[]const u8 {
        switch (self.strategy) {
            .first_wins => {
                return try self.allocator.dupe(u8, conflict.required_by.items[0].version_range);
            },
            .last_wins => {
                const last_idx = conflict.required_by.items.len - 1;
                return try self.allocator.dupe(u8, conflict.required_by.items[last_idx].version_range);
            },
            .highest_compatible => {
                // Find the highest version that satisfies all ranges
                return try self.findHighestCompatible(conflict);
            },
            .lowest_compatible => {
                // Find the lowest version that satisfies all ranges
                return try self.findLowestCompatible(conflict);
            },
            .strict => {
                // Check if all ranges are exactly the same
                const first_range = conflict.required_by.items[0].version_range;
                for (conflict.required_by.items[1..]) |req| {
                    if (!std.mem.eql(u8, first_range, req.version_range)) {
                        return null; // Conflict detected
                    }
                }
                return try self.allocator.dupe(u8, first_range);
            },
        }
    }

    /// Find highest version compatible with all ranges
    fn findHighestCompatible(self: *ConflictResolver, conflict: Conflict) !?[]const u8 {
        // This is a simplified implementation
        // Real implementation would:
        // 1. Parse each version range
        // 2. Fetch available versions from registry
        // 3. Find highest version satisfying all ranges
        // 4. Use semver comparison

        // For now, use the most specific (longest) version range
        var longest: []const u8 = conflict.required_by.items[0].version_range;
        for (conflict.required_by.items[1..]) |req| {
            if (req.version_range.len > longest.len) {
                longest = req.version_range;
            }
        }

        return try self.allocator.dupe(u8, longest);
    }

    /// Find lowest version compatible with all ranges
    fn findLowestCompatible(self: *ConflictResolver, conflict: Conflict) !?[]const u8 {
        // This is a simplified implementation
        // Real implementation would find the lowest version that satisfies all ranges

        // For now, use the shortest (least specific) version range
        var shortest: []const u8 = conflict.required_by.items[0].version_range;
        for (conflict.required_by.items[1..]) |req| {
            if (req.version_range.len < shortest.len) {
                shortest = req.version_range;
            }
        }

        return try self.allocator.dupe(u8, shortest);
    }

    /// Get conflict report
    pub fn getConflictReport(self: *ConflictResolver, allocator: std.mem.Allocator) ![]const u8 {
        var output = try std.ArrayList(u8).initCapacity(allocator, 256);
        defer output.deinit(allocator);

        var it = self.conflicts.iterator();
        while (it.next()) |entry| {
            const conflict = entry.value_ptr.*;

            // Only report actual conflicts (multiple requesters with different versions)
            if (conflict.required_by.items.len <= 1) continue;

            // Check if versions are actually different
            const first_version = conflict.required_by.items[0].version_range;
            var has_conflict = false;
            for (conflict.required_by.items[1..]) |req| {
                if (!std.mem.eql(u8, first_version, req.version_range)) {
                    has_conflict = true;
                    break;
                }
            }

            if (!has_conflict) continue;

            try output.print(allocator, "\nConflict for '{s}':\n", .{conflict.package_name});
            for (conflict.required_by.items) |req| {
                try output.print(allocator, "  - {s} requires {s}\n", .{ req.package, req.version_range });
            }
        }

        return try output.toOwnedSlice(allocator);
    }
};

/// Version compatibility checker
pub const VersionChecker = struct {
    /// Check if a version satisfies a range
    pub fn satisfies(version: []const u8, range: []const u8) bool {
        // Simplified implementation
        // Real implementation would use full semver parsing and range matching

        // Exact match
        if (std.mem.eql(u8, version, range)) return true;

        // Handle caret ranges (^1.2.3)
        if (std.mem.startsWith(u8, range, "^")) {
            const range_version = range[1..];
            return satisfiesCaret(version, range_version);
        }

        // Handle tilde ranges (~1.2.3)
        if (std.mem.startsWith(u8, range, "~")) {
            const range_version = range[1..];
            return satisfiesTilde(version, range_version);
        }

        // Handle >= ranges
        if (std.mem.startsWith(u8, range, ">=")) {
            const range_version = range[2..];
            return compareVersions(version, range_version) >= 0;
        }

        // Handle > ranges
        if (std.mem.startsWith(u8, range, ">")) {
            const range_version = range[1..];
            return compareVersions(version, range_version) > 0;
        }

        // Default: exact match required
        return false;
    }

    /// Check caret range compatibility (^1.2.3 allows 1.x.x)
    fn satisfiesCaret(version: []const u8, range_version: []const u8) bool {
        // Extract major version
        const v_major = getMajorVersion(version) orelse return false;
        const r_major = getMajorVersion(range_version) orelse return false;

        // Major versions must match
        if (v_major != r_major) return false;

        // Version must be >= range version
        return compareVersions(version, range_version) >= 0;
    }

    /// Check tilde range compatibility (~1.2.3 allows 1.2.x)
    fn satisfiesTilde(version: []const u8, range_version: []const u8) bool {
        // Extract major.minor
        const v_major_minor = getMajorMinor(version) orelse return false;
        const r_major_minor = getMajorMinor(range_version) orelse return false;

        // Major.minor must match
        if (!std.mem.eql(u8, v_major_minor.major, r_major_minor.major) or
            !std.mem.eql(u8, v_major_minor.minor, r_major_minor.minor))
        {
            return false;
        }

        // Version must be >= range version
        return compareVersions(version, range_version) >= 0;
    }

    /// Compare two versions (-1: v1 < v2, 0: equal, 1: v1 > v2)
    fn compareVersions(v1: []const u8, v2: []const u8) i8 {
        // Simplified lexicographic comparison
        // Real implementation would parse and compare major.minor.patch numerically
        if (std.mem.eql(u8, v1, v2)) return 0;
        if (std.mem.lessThan(u8, v1, v2)) return -1;
        return 1;
    }

    /// Extract major version number as integer
    fn getMajorVersion(version: []const u8) ?u32 {
        const dot_idx = std.mem.indexOf(u8, version, ".") orelse return null;
        const major_str = version[0..dot_idx];
        return std.fmt.parseInt(u32, major_str, 10) catch null;
    }

    /// Extract major.minor version
    fn getMajorMinor(version: []const u8) ?struct { major: []const u8, minor: []const u8 } {
        const first_dot = std.mem.indexOf(u8, version, ".") orelse return null;
        const major = version[0..first_dot];

        const remaining = version[first_dot + 1 ..];
        const second_dot = std.mem.indexOf(u8, remaining, ".") orelse return null;
        const minor = remaining[0..second_dot];

        return .{ .major = major, .minor = minor };
    }
};
