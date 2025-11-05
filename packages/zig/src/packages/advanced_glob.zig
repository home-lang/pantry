//! Advanced Glob Pattern Matching
//!
//! Supports advanced glob patterns including:
//! - ** (recursive directory matching)
//! - {a,b,c} (brace expansion/alternation)
//! - Extended wildcards

const std = @import("std");

/// Match result for glob patterns
pub const MatchResult = enum {
    match,
    no_match,
    error_invalid_pattern,
};

/// Advanced glob matcher with ** and {} support
pub fn matchGlob(pattern: []const u8, text: []const u8) bool {
    return matchGlobInternal(pattern, text, 0, 0) == .match;
}

fn matchGlobInternal(pattern: []const u8, text: []const u8, p_idx: usize, t_idx: usize) MatchResult {
    // Base cases
    if (p_idx >= pattern.len and t_idx >= text.len) {
        return .match;
    }

    if (p_idx >= pattern.len) {
        return .no_match;
    }

    // Handle ** (matches any path including directories)
    if (p_idx + 1 < pattern.len and pattern[p_idx] == '*' and pattern[p_idx + 1] == '*') {
        // Skip the **
        var new_p_idx = p_idx + 2;

        // Skip following slashes
        while (new_p_idx < pattern.len and pattern[new_p_idx] == '/') {
            new_p_idx += 1;
        }

        // ** at end matches everything
        if (new_p_idx >= pattern.len) {
            return .match;
        }

        // Try matching at current position and all following positions
        var test_t_idx = t_idx;
        while (test_t_idx <= text.len) {
            if (matchGlobInternal(pattern, text, new_p_idx, test_t_idx) == .match) {
                return .match;
            }
            test_t_idx += 1;
        }
        return .no_match;
    }

    // Handle brace expansion {a,b,c}
    if (pattern[p_idx] == '{') {
        const close_brace = findClosingBrace(pattern, p_idx) orelse return .error_invalid_pattern;

        // Extract alternatives
        const alternatives_str = pattern[p_idx + 1 .. close_brace];
        var alternatives = std.mem.splitScalar(u8, alternatives_str, ',');

        // Try each alternative
        while (alternatives.next()) |alt| {
            // Build pattern with this alternative
            var test_pattern_buf: [1024]u8 = undefined;
            var test_pattern_len: usize = 0;

            // Copy prefix
            @memcpy(test_pattern_buf[0..p_idx], pattern[0..p_idx]);
            test_pattern_len = p_idx;

            // Copy alternative
            const alt_trimmed = std.mem.trim(u8, alt, " ");
            @memcpy(test_pattern_buf[test_pattern_len .. test_pattern_len + alt_trimmed.len], alt_trimmed);
            test_pattern_len += alt_trimmed.len;

            // Copy suffix
            const suffix = pattern[close_brace + 1 ..];
            @memcpy(test_pattern_buf[test_pattern_len .. test_pattern_len + suffix.len], suffix);
            test_pattern_len += suffix.len;

            const test_pattern = test_pattern_buf[0..test_pattern_len];

            if (matchGlobInternal(test_pattern, text, 0, t_idx) == .match) {
                return .match;
            }
        }
        return .no_match;
    }

    // Handle single * (matches any sequence except /)
    if (pattern[p_idx] == '*') {
        // Try matching zero or more characters (but not /)
        var test_t_idx = t_idx;
        while (test_t_idx <= text.len) {
            if (matchGlobInternal(pattern, text, p_idx + 1, test_t_idx) == .match) {
                return .match;
            }
            // Don't cross directory boundaries with single *
            if (test_t_idx < text.len and text[test_t_idx] == '/') {
                break;
            }
            test_t_idx += 1;
        }
        return .no_match;
    }

    // Handle ?
    if (pattern[p_idx] == '?') {
        if (t_idx >= text.len) {
            return .no_match;
        }
        // ? doesn't match /
        if (text[t_idx] == '/') {
            return .no_match;
        }
        return matchGlobInternal(pattern, text, p_idx + 1, t_idx + 1);
    }

    // Regular character match
    if (t_idx >= text.len) {
        return .no_match;
    }

    if (pattern[p_idx] == text[t_idx]) {
        return matchGlobInternal(pattern, text, p_idx + 1, t_idx + 1);
    }

    return .no_match;
}

/// Find the closing brace for a { at position idx
fn findClosingBrace(pattern: []const u8, open_idx: usize) ?usize {
    var depth: usize = 0;
    var idx = open_idx;

    while (idx < pattern.len) {
        if (pattern[idx] == '{') {
            depth += 1;
        } else if (pattern[idx] == '}') {
            depth -= 1;
            if (depth == 0) {
                return idx;
            }
        }
        idx += 1;
    }

    return null;
}

/// Expand a glob pattern with braces into multiple patterns
pub fn expandBraces(allocator: std.mem.Allocator, pattern: []const u8) ![][]const u8 {
    // Find first brace
    const open_brace = std.mem.indexOf(u8, pattern, "{") orelse {
        // No braces, return as-is
        const result = try allocator.alloc([]const u8, 1);
        result[0] = try allocator.dupe(u8, pattern);
        return result;
    };

    const close_brace = findClosingBrace(pattern, open_brace) orelse {
        // Invalid pattern, return as-is
        const result = try allocator.alloc([]const u8, 1);
        result[0] = try allocator.dupe(u8, pattern);
        return result;
    };

    const prefix = pattern[0..open_brace];
    const alternatives_str = pattern[open_brace + 1 .. close_brace];
    const suffix = pattern[close_brace + 1 ..];

    // Split alternatives
    var results = std.ArrayList([]const u8).init(allocator);
    errdefer {
        for (results.items) |item| {
            allocator.free(item);
        }
        results.deinit(allocator);
    }

    var alternatives = std.mem.splitScalar(u8, alternatives_str, ',');
    while (alternatives.next()) |alt| {
        const trimmed = std.mem.trim(u8, alt, " ");

        // Build pattern with this alternative
        const expanded = try std.fmt.allocPrint(allocator, "{s}{s}{s}", .{ prefix, trimmed, suffix });
        errdefer allocator.free(expanded);

        // Recursively expand if there are more braces
        if (std.mem.indexOf(u8, expanded, "{") != null) {
            const sub_expanded = try expandBraces(allocator, expanded);
            defer {
                for (sub_expanded) |item| {
                    allocator.free(item);
                }
                allocator.free(sub_expanded);
            }
            allocator.free(expanded);

            for (sub_expanded) |item| {
                try results.append(allocator, try allocator.dupe(u8, item));
            }
        } else {
            try results.append(allocator, expanded);
        }
    }

    return try results.toOwnedSlice(allocator);
}

// ============================================================================
// Tests
// ============================================================================

test "matchGlob - ** recursive" {
    try std.testing.expect(matchGlob("**/test.ts", "src/foo/bar/test.ts"));
    try std.testing.expect(matchGlob("**/test.ts", "test.ts"));
    try std.testing.expect(matchGlob("src/**/*.ts", "src/foo/bar/baz.ts"));
    try std.testing.expect(matchGlob("packages/**/src/*.ts", "packages/foo/bar/src/index.ts"));
    try std.testing.expect(!matchGlob("**/test.ts", "src/test.js"));
}

test "matchGlob - braces" {
    try std.testing.expect(matchGlob("src/{a,b,c}.ts", "src/a.ts"));
    try std.testing.expect(matchGlob("src/{a,b,c}.ts", "src/b.ts"));
    try std.testing.expect(matchGlob("src/{a,b,c}.ts", "src/c.ts"));
    try std.testing.expect(!matchGlob("src/{a,b,c}.ts", "src/d.ts"));
}

test "matchGlob - braces with wildcards" {
    try std.testing.expect(matchGlob("*.{js,ts}", "file.js"));
    try std.testing.expect(matchGlob("*.{js,ts}", "file.ts"));
    try std.testing.expect(!matchGlob("*.{js,ts}", "file.css"));
}

test "matchGlob - complex patterns" {
    try std.testing.expect(matchGlob("packages/**/*.{ts,tsx}", "packages/foo/src/component.tsx"));
    try std.testing.expect(matchGlob("src/**/test.{js,ts}", "src/deep/nested/test.ts"));
    try std.testing.expect(!matchGlob("src/**/test.{js,ts}", "src/test.css"));
}

test "matchGlob - single * doesn't cross directories" {
    try std.testing.expect(matchGlob("src/*.ts", "src/file.ts"));
    try std.testing.expect(!matchGlob("src/*.ts", "src/foo/file.ts"));
}

test "expandBraces - simple" {
    const allocator = std.testing.allocator;

    const patterns = try expandBraces(allocator, "file.{js,ts}");
    defer {
        for (patterns) |p| {
            allocator.free(p);
        }
        allocator.free(patterns);
    }

    try std.testing.expect(patterns.len == 2);
    try std.testing.expectEqualStrings("file.js", patterns[0]);
    try std.testing.expectEqualStrings("file.ts", patterns[1]);
}

test "expandBraces - nested" {
    const allocator = std.testing.allocator;

    const patterns = try expandBraces(allocator, "{a,b}/{x,y}");
    defer {
        for (patterns) |p| {
            allocator.free(p);
        }
        allocator.free(patterns);
    }

    try std.testing.expect(patterns.len == 4);
}

test "expandBraces - no braces" {
    const allocator = std.testing.allocator;

    const patterns = try expandBraces(allocator, "simple.ts");
    defer {
        for (patterns) |p| {
            allocator.free(p);
        }
        allocator.free(patterns);
    }

    try std.testing.expect(patterns.len == 1);
    try std.testing.expectEqualStrings("simple.ts", patterns[0]);
}
