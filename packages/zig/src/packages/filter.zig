//! Package Filter Implementation
//!
//! Provides filtering capabilities for workspace packages using glob patterns.
//! Supports both package name patterns and path-based patterns.

const std = @import("std");
const types = @import("types.zig");

/// Filter type for matching packages
pub const FilterType = enum {
    /// Match by package name (e.g., "pkg-a", "pkg-*", "!pkg-c")
    name,
    /// Match by package path (e.g., "./packages/*", "./packages/foo")
    path,
    /// Match root package (e.g., "./")
    root,
};

/// A single filter pattern
pub const FilterPattern = struct {
    pattern: []const u8,
    filter_type: FilterType,
    is_negation: bool, // true if pattern starts with "!"

    pub fn init(allocator: std.mem.Allocator, pattern_str: []const u8) !FilterPattern {
        // Check for negation
        const is_negation = std.mem.startsWith(u8, pattern_str, "!");
        const clean_pattern = if (is_negation) pattern_str[1..] else pattern_str;

        // Determine filter type
        const filter_type: FilterType = if (std.mem.startsWith(u8, clean_pattern, "./"))
            if (std.mem.eql(u8, clean_pattern, "./")) .root else .path
        else
            .name;

        return FilterPattern{
            .pattern = try allocator.dupe(u8, clean_pattern),
            .filter_type = filter_type,
            .is_negation = is_negation,
        };
    }

    pub fn deinit(self: *FilterPattern, allocator: std.mem.Allocator) void {
        allocator.free(self.pattern);
    }

    /// Check if a package name matches this pattern
    pub fn matchesName(self: FilterPattern, package_name: []const u8) bool {
        return matchGlob(self.pattern, package_name);
    }

    /// Check if a package path matches this pattern
    pub fn matchesPath(self: FilterPattern, package_path: []const u8) bool {
        // For path patterns, we need to handle "./" prefix
        const clean_pattern = if (std.mem.startsWith(u8, self.pattern, "./"))
            self.pattern[2..]
        else
            self.pattern;

        const clean_path = if (std.mem.startsWith(u8, package_path, "./"))
            package_path[2..]
        else
            package_path;

        return matchGlob(clean_pattern, clean_path);
    }
};

/// Filter collection for package filtering
pub const Filter = struct {
    patterns: []FilterPattern,
    allocator: std.mem.Allocator,

    pub fn init(allocator: std.mem.Allocator) Filter {
        return Filter{
            .patterns = &[_]FilterPattern{},
            .allocator = allocator,
        };
    }

    pub fn initWithPatterns(allocator: std.mem.Allocator, pattern_strings: []const []const u8) !Filter {
        var patterns = try allocator.alloc(FilterPattern, pattern_strings.len);
        errdefer allocator.free(patterns);

        for (pattern_strings, 0..) |pattern_str, i| {
            patterns[i] = try FilterPattern.init(allocator, pattern_str);
        }

        return Filter{
            .patterns = patterns,
            .allocator = allocator,
        };
    }

    pub fn deinit(self: *Filter) void {
        for (self.patterns) |*pattern| {
            pattern.deinit(self.allocator);
        }
        if (self.patterns.len > 0) {
            self.allocator.free(self.patterns);
        }
    }

    pub fn addPattern(self: *Filter, pattern_str: []const u8) !void {
        const new_pattern = try FilterPattern.init(self.allocator, pattern_str);
        errdefer new_pattern.deinit(self.allocator);

        const new_patterns = try self.allocator.alloc(FilterPattern, self.patterns.len + 1);
        if (self.patterns.len > 0) {
            @memcpy(new_patterns[0..self.patterns.len], self.patterns);
            self.allocator.free(self.patterns);
        }
        new_patterns[self.patterns.len] = new_pattern;
        self.patterns = new_patterns;
    }

    /// Check if a workspace member matches the filter
    pub fn matchesMember(self: Filter, member: types.WorkspaceMember) bool {
        if (self.patterns.len == 0) {
            // No filters = match everything
            return true;
        }

        var matched = false;
        var explicitly_excluded = false;

        // Process patterns in order
        for (self.patterns) |pattern| {
            const does_match = switch (pattern.filter_type) {
                .name => pattern.matchesName(member.name),
                .path => pattern.matchesPath(member.path),
                .root => false, // Root doesn't match workspace members
            };

            if (does_match) {
                if (pattern.is_negation) {
                    explicitly_excluded = true;
                    matched = false;
                } else {
                    matched = true;
                }
            }
        }

        return matched and !explicitly_excluded;
    }

    /// Check if the root package matches the filter
    pub fn matchesRoot(self: Filter) bool {
        if (self.patterns.len == 0) {
            return true;
        }

        var matched = false;
        var explicitly_excluded = false;

        for (self.patterns) |pattern| {
            if (pattern.filter_type == .root) {
                if (pattern.is_negation) {
                    explicitly_excluded = true;
                    matched = false;
                } else {
                    matched = true;
                }
            }
        }

        return matched and !explicitly_excluded;
    }

    /// Check if a package name matches the filter (for non-workspace contexts)
    pub fn matchesPackageName(self: Filter, package_name: []const u8) bool {
        if (self.patterns.len == 0) {
            return true;
        }

        var matched = false;
        var explicitly_excluded = false;

        for (self.patterns) |pattern| {
            if (pattern.filter_type == .name) {
                const does_match = pattern.matchesName(package_name);
                if (does_match) {
                    if (pattern.is_negation) {
                        explicitly_excluded = true;
                        matched = false;
                    } else {
                        matched = true;
                    }
                }
            }
        }

        return matched and !explicitly_excluded;
    }
};

/// Simple glob pattern matcher
/// Supports: * (matches any sequence), ? (matches single char)
fn matchGlob(pattern: []const u8, text: []const u8) bool {
    var p_idx: usize = 0;
    var t_idx: usize = 0;
    var star_idx: ?usize = null;
    var match_idx: usize = 0;

    while (t_idx < text.len) {
        if (p_idx < pattern.len) {
            const p_char = pattern[p_idx];
            const t_char = text[t_idx];

            if (p_char == '*') {
                star_idx = p_idx;
                match_idx = t_idx;
                p_idx += 1;
                continue;
            } else if (p_char == '?' or p_char == t_char) {
                p_idx += 1;
                t_idx += 1;
                continue;
            }
        }

        // No match, backtrack to last star if we have one
        if (star_idx) |star| {
            p_idx = star + 1;
            match_idx += 1;
            t_idx = match_idx;
            continue;
        }

        return false;
    }

    // Consume any trailing stars in pattern
    while (p_idx < pattern.len and pattern[p_idx] == '*') {
        p_idx += 1;
    }

    return p_idx == pattern.len;
}

// ============================================================================
// Tests
// ============================================================================

test "matchGlob - exact match" {
    try std.testing.expect(matchGlob("hello", "hello"));
    try std.testing.expect(!matchGlob("hello", "world"));
}

test "matchGlob - wildcard *" {
    try std.testing.expect(matchGlob("pkg-*", "pkg-a"));
    try std.testing.expect(matchGlob("pkg-*", "pkg-b"));
    try std.testing.expect(matchGlob("*-suffix", "prefix-suffix"));
    try std.testing.expect(matchGlob("*", "anything"));
    try std.testing.expect(!matchGlob("pkg-*", "other"));
}

test "matchGlob - wildcard ?" {
    try std.testing.expect(matchGlob("pkg-?", "pkg-a"));
    try std.testing.expect(!matchGlob("pkg-?", "pkg-ab"));
}

test "matchGlob - complex patterns" {
    try std.testing.expect(matchGlob("@org/*", "@org/package"));
    try std.testing.expect(matchGlob("**/test", "foo/bar/test"));
    try std.testing.expect(matchGlob("packages/*/src", "packages/foo/src"));
}

test "FilterPattern - name pattern" {
    const allocator = std.testing.allocator;
    var pattern = try FilterPattern.init(allocator, "pkg-*");
    defer pattern.deinit(allocator);

    try std.testing.expect(pattern.filter_type == .name);
    try std.testing.expect(!pattern.is_negation);
    try std.testing.expect(pattern.matchesName("pkg-a"));
    try std.testing.expect(!pattern.matchesName("other"));
}

test "FilterPattern - path pattern" {
    const allocator = std.testing.allocator;
    var pattern = try FilterPattern.init(allocator, "./packages/*");
    defer pattern.deinit(allocator);

    try std.testing.expect(pattern.filter_type == .path);
    try std.testing.expect(!pattern.is_negation);
    try std.testing.expect(pattern.matchesPath("./packages/foo"));
    try std.testing.expect(!pattern.matchesPath("./apps/bar"));
}

test "FilterPattern - negation" {
    const allocator = std.testing.allocator;
    var pattern = try FilterPattern.init(allocator, "!pkg-c");
    defer pattern.deinit(allocator);

    try std.testing.expect(pattern.filter_type == .name);
    try std.testing.expect(pattern.is_negation);
    try std.testing.expect(pattern.matchesName("pkg-c"));
}

test "FilterPattern - root pattern" {
    const allocator = std.testing.allocator;
    var pattern = try FilterPattern.init(allocator, "./");
    defer pattern.deinit(allocator);

    try std.testing.expect(pattern.filter_type == .root);
    try std.testing.expect(!pattern.is_negation);
}

test "Filter - multiple patterns with negation" {
    const allocator = std.testing.allocator;
    const patterns = [_][]const u8{ "pkg-*", "!pkg-c" };
    var filter = try Filter.initWithPatterns(allocator, &patterns);
    defer filter.deinit();

    try std.testing.expect(filter.matchesPackageName("pkg-a"));
    try std.testing.expect(filter.matchesPackageName("pkg-b"));
    try std.testing.expect(!filter.matchesPackageName("pkg-c"));
    try std.testing.expect(!filter.matchesPackageName("other"));
}

test "Filter - path patterns" {
    const allocator = std.testing.allocator;
    const patterns = [_][]const u8{ "./packages/*", "!./packages/excluded" };
    var filter = try Filter.initWithPatterns(allocator, &patterns);
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

    const member_app = types.WorkspaceMember{
        .name = "app",
        .path = "./apps/app",
        .abs_path = "/workspace/apps/app",
        .config_path = null,
        .deps_file_path = null,
    };

    try std.testing.expect(filter.matchesMember(member_foo));
    try std.testing.expect(!filter.matchesMember(member_excluded));
    try std.testing.expect(!filter.matchesMember(member_app));
}

test "Filter - empty filter matches all" {
    const allocator = std.testing.allocator;
    var filter = Filter.init(allocator);
    defer filter.deinit();

    try std.testing.expect(filter.matchesPackageName("anything"));
    try std.testing.expect(filter.matchesRoot());
}
