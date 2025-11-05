//! Simple Regex Implementation
//!
//! Provides basic regular expression matching for filter patterns.
//! Supports a subset of regex features commonly used in package filtering.
//!
//! Supported features:
//! - `.` matches any character
//! - `*` matches zero or more of the preceding character
//! - `+` matches one or more of the preceding character
//! - `?` makes the preceding character optional
//! - `[abc]` matches any character in the set
//! - `[a-z]` matches any character in the range
//! - `[^abc]` matches any character NOT in the set
//! - `^` matches start of string
//! - `$` matches end of string
//! - `\d` matches any digit
//! - `\w` matches any word character (alphanumeric + _)
//! - `\s` matches any whitespace
//!
//! Note: This is a simplified implementation. For full regex support,
//! consider integrating a proper regex library.

const std = @import("std");

/// Match a string against a regex pattern
pub fn matchRegex(pattern: []const u8, text: []const u8) bool {
    return matchInternal(pattern, text, 0, 0, false);
}

fn matchInternal(
    pattern: []const u8,
    text: []const u8,
    p_idx: usize,
    t_idx: usize,
    anchored: bool,
) bool {
    // Base case: pattern exhausted
    if (p_idx >= pattern.len) {
        return t_idx >= text.len or !anchored;
    }

    // Check for start anchor
    if (p_idx == 0 and pattern[p_idx] == '^') {
        return matchInternal(pattern, text, p_idx + 1, t_idx, true);
    }

    // Check for end anchor
    if (pattern[p_idx] == '$') {
        return t_idx >= text.len;
    }

    // Lookahead for quantifiers
    const has_quantifier = p_idx + 1 < pattern.len and
        (pattern[p_idx + 1] == '*' or pattern[p_idx + 1] == '+' or pattern[p_idx + 1] == '?');

    if (has_quantifier) {
        const quantifier = pattern[p_idx + 1];
        const char_pattern = pattern[p_idx];

        return switch (quantifier) {
            '*' => matchStar(pattern, text, p_idx, t_idx, char_pattern, anchored),
            '+' => matchPlus(pattern, text, p_idx, t_idx, char_pattern, anchored),
            '?' => matchOptional(pattern, text, p_idx, t_idx, char_pattern, anchored),
            else => false,
        };
    }

    // Handle character classes
    if (pattern[p_idx] == '[') {
        const close_bracket = std.mem.indexOfScalarPos(u8, pattern, p_idx, ']') orelse return false;
        const char_class = pattern[p_idx + 1 .. close_bracket];

        if (t_idx >= text.len) return false;

        if (matchCharClass(char_class, text[t_idx])) {
            return matchInternal(pattern, text, close_bracket + 1, t_idx + 1, anchored);
        }
        return false;
    }

    // Handle escape sequences
    if (pattern[p_idx] == '\\' and p_idx + 1 < pattern.len) {
        if (t_idx >= text.len) return false;

        const matches = switch (pattern[p_idx + 1]) {
            'd' => std.ascii.isDigit(text[t_idx]),
            'w' => std.ascii.isAlphanumeric(text[t_idx]) or text[t_idx] == '_',
            's' => std.ascii.isWhitespace(text[t_idx]),
            else => text[t_idx] == pattern[p_idx + 1], // Literal escape
        };

        if (matches) {
            return matchInternal(pattern, text, p_idx + 2, t_idx + 1, anchored);
        }
        return false;
    }

    // Handle single character match
    if (t_idx < text.len and matchChar(pattern[p_idx], text[t_idx])) {
        return matchInternal(pattern, text, p_idx + 1, t_idx + 1, anchored);
    }

    // If not anchored, try matching from next position in text
    if (!anchored and t_idx + 1 <= text.len) {
        return matchInternal(pattern, text, 0, t_idx + 1, false);
    }

    return false;
}

fn matchStar(
    pattern: []const u8,
    text: []const u8,
    p_idx: usize,
    t_idx: usize,
    char_pattern: u8,
    anchored: bool,
) bool {
    // Try matching zero occurrences
    if (matchInternal(pattern, text, p_idx + 2, t_idx, anchored)) {
        return true;
    }

    // Try matching one or more occurrences
    var i = t_idx;
    while (i < text.len and matchChar(char_pattern, text[i])) : (i += 1) {
        if (matchInternal(pattern, text, p_idx + 2, i + 1, anchored)) {
            return true;
        }
    }

    return false;
}

fn matchPlus(
    pattern: []const u8,
    text: []const u8,
    p_idx: usize,
    t_idx: usize,
    char_pattern: u8,
    anchored: bool,
) bool {
    // Must match at least once
    if (t_idx >= text.len or !matchChar(char_pattern, text[t_idx])) {
        return false;
    }

    // Try matching one or more occurrences
    var i = t_idx;
    while (i < text.len and matchChar(char_pattern, text[i])) : (i += 1) {
        if (matchInternal(pattern, text, p_idx + 2, i + 1, anchored)) {
            return true;
        }
    }

    return false;
}

fn matchOptional(
    pattern: []const u8,
    text: []const u8,
    p_idx: usize,
    t_idx: usize,
    char_pattern: u8,
    anchored: bool,
) bool {
    // Try matching zero occurrences
    if (matchInternal(pattern, text, p_idx + 2, t_idx, anchored)) {
        return true;
    }

    // Try matching one occurrence
    if (t_idx < text.len and matchChar(char_pattern, text[t_idx])) {
        return matchInternal(pattern, text, p_idx + 2, t_idx + 1, anchored);
    }

    return false;
}

fn matchChar(pattern_char: u8, text_char: u8) bool {
    if (pattern_char == '.') return true;
    return pattern_char == text_char;
}

fn matchCharClass(char_class: []const u8, text_char: u8) bool {
    if (char_class.len == 0) return false;

    // Check for negation
    const negated = char_class[0] == '^';
    const class_content = if (negated) char_class[1..] else char_class;

    var matches = false;

    var i: usize = 0;
    while (i < class_content.len) {
        // Check for range (e.g., a-z)
        if (i + 2 < class_content.len and class_content[i + 1] == '-') {
            const start = class_content[i];
            const end = class_content[i + 2];
            if (text_char >= start and text_char <= end) {
                matches = true;
                break;
            }
            i += 3;
        } else {
            if (text_char == class_content[i]) {
                matches = true;
                break;
            }
            i += 1;
        }
    }

    return if (negated) !matches else matches;
}

// ============================================================================
// Tests
// ============================================================================

test "regex - literal match" {
    try std.testing.expect(matchRegex("hello", "hello"));
    try std.testing.expect(!matchRegex("hello", "world"));
    try std.testing.expect(matchRegex("pkg", "my-pkg"));
}

test "regex - dot wildcard" {
    try std.testing.expect(matchRegex("h.llo", "hello"));
    try std.testing.expect(matchRegex("h.llo", "hallo"));
    try std.testing.expect(!matchRegex("h.llo", "hllo"));
}

test "regex - star quantifier" {
    try std.testing.expect(matchRegex("a*b", "b"));
    try std.testing.expect(matchRegex("a*b", "ab"));
    try std.testing.expect(matchRegex("a*b", "aaab"));
    try std.testing.expect(!matchRegex("a*b", "ac"));
}

test "regex - plus quantifier" {
    try std.testing.expect(matchRegex("a+b", "ab"));
    try std.testing.expect(matchRegex("a+b", "aaab"));
    try std.testing.expect(!matchRegex("a+b", "b"));
}

test "regex - optional quantifier" {
    try std.testing.expect(matchRegex("a?b", "b"));
    try std.testing.expect(matchRegex("a?b", "ab"));
    try std.testing.expect(!matchRegex("a?b", "aab"));
}

test "regex - character class" {
    try std.testing.expect(matchRegex("[abc]", "a"));
    try std.testing.expect(matchRegex("[abc]", "b"));
    try std.testing.expect(!matchRegex("[abc]", "d"));
    try std.testing.expect(matchRegex("[a-z]", "m"));
    try std.testing.expect(!matchRegex("[a-z]", "5"));
}

test "regex - negated character class" {
    try std.testing.expect(matchRegex("[^abc]", "d"));
    try std.testing.expect(!matchRegex("[^abc]", "a"));
}

test "regex - escape sequences" {
    try std.testing.expect(matchRegex("\\d", "5"));
    try std.testing.expect(!matchRegex("\\d", "a"));
    try std.testing.expect(matchRegex("\\w", "a"));
    try std.testing.expect(matchRegex("\\w", "_"));
    try std.testing.expect(!matchRegex("\\w", " "));
}

test "regex - anchors" {
    try std.testing.expect(matchRegex("^hello", "hello world"));
    try std.testing.expect(!matchRegex("^hello", "say hello"));
    try std.testing.expect(matchRegex("world$", "hello world"));
    try std.testing.expect(!matchRegex("world$", "world hello"));
}

test "regex - package names" {
    try std.testing.expect(matchRegex("pkg-\\d+", "pkg-123"));
    try std.testing.expect(matchRegex("pkg-\\d+", "my-pkg-456"));
    try std.testing.expect(!matchRegex("pkg-\\d+", "pkg-abc"));

    try std.testing.expect(matchRegex("^@[a-z]+/[a-z-]+$", "@myorg/my-package"));
    try std.testing.expect(!matchRegex("^@[a-z]+/[a-z-]+$", "@MyOrg/my-package"));
}
