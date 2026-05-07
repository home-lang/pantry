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
    if (pattern.len > 0 and pattern[0] == '^') {
        return matchInternal(pattern, text, 0, 0, true, 0);
    }

    var start: usize = 0;
    while (start <= text.len) : (start += 1) {
        if (matchInternal(pattern, text, 0, start, false, 0)) return true;
    }
    return false;
}

/// Maximum recursion depth to prevent stack overflow on pathological patterns
const max_recursion_depth: usize = 500;

fn matchInternal(
    pattern: []const u8,
    text: []const u8,
    p_idx: usize,
    t_idx: usize,
    anchored: bool,
    depth: usize,
) bool {
    _ = anchored;
    // Guard against excessive recursion (pathological patterns)
    if (depth > max_recursion_depth) return false;

    // Base case: pattern exhausted
    if (p_idx >= pattern.len) {
        return true;
    }

    // Check for start anchor
    if (p_idx == 0 and pattern[p_idx] == '^') {
        return matchInternal(pattern, text, p_idx + 1, t_idx, true, depth + 1);
    }

    // Check for end anchor
    if (pattern[p_idx] == '$') {
        return t_idx >= text.len;
    }

    const atom = parseAtom(pattern, p_idx) orelse return false;
    const quantifier = if (atom.end < pattern.len and
        (pattern[atom.end] == '*' or pattern[atom.end] == '+' or pattern[atom.end] == '?'))
        pattern[atom.end]
    else
        null;

    if (quantifier) |q| {
        const next_pattern = atom.end + 1;
        return switch (q) {
            '*' => matchAtomRepeat(pattern, text, next_pattern, t_idx, atom, 0, depth + 1),
            '+' => matchAtomRepeat(pattern, text, next_pattern, t_idx, atom, 1, depth + 1),
            '?' => matchInternal(pattern, text, next_pattern, t_idx, false, depth + 1) or
                (t_idx < text.len and matchAtom(atom, text[t_idx]) and
                    matchInternal(pattern, text, next_pattern, t_idx + 1, false, depth + 1)),
            else => false,
        };
    }

    if (t_idx < text.len and matchAtom(atom, text[t_idx])) {
        return matchInternal(pattern, text, atom.end, t_idx + 1, false, depth + 1);
    }

    return false;
}

const Atom = struct {
    kind: enum { literal, any, digit, word, whitespace, class },
    literal: u8 = 0,
    class: []const u8 = "",
    end: usize,
};

fn parseAtom(pattern: []const u8, p_idx: usize) ?Atom {
    if (pattern[p_idx] == '.') return .{ .kind = .any, .end = p_idx + 1 };
    if (pattern[p_idx] == '[') {
        const close = std.mem.indexOfScalarPos(u8, pattern, p_idx, ']') orelse return null;
        return .{ .kind = .class, .class = pattern[p_idx + 1 .. close], .end = close + 1 };
    }
    if (pattern[p_idx] == '\\' and p_idx + 1 < pattern.len) {
        return switch (pattern[p_idx + 1]) {
            'd' => .{ .kind = .digit, .end = p_idx + 2 },
            'w' => .{ .kind = .word, .end = p_idx + 2 },
            's' => .{ .kind = .whitespace, .end = p_idx + 2 },
            else => .{ .kind = .literal, .literal = pattern[p_idx + 1], .end = p_idx + 2 },
        };
    }
    return .{ .kind = .literal, .literal = pattern[p_idx], .end = p_idx + 1 };
}

fn matchAtom(atom: Atom, text_char: u8) bool {
    return switch (atom.kind) {
        .literal => atom.literal == text_char,
        .any => true,
        .digit => std.ascii.isDigit(text_char),
        .word => std.ascii.isAlphanumeric(text_char) or text_char == '_',
        .whitespace => std.ascii.isWhitespace(text_char),
        .class => matchCharClass(atom.class, text_char),
    };
}

fn matchAtomRepeat(
    pattern: []const u8,
    text: []const u8,
    next_pattern: usize,
    t_idx: usize,
    atom: Atom,
    min_count: usize,
    depth: usize,
) bool {
    var i = t_idx;
    var count: usize = 0;

    while (i < text.len and matchAtom(atom, text[i])) : (i += 1) {
        count += 1;
        if (count >= min_count and matchInternal(pattern, text, next_pattern, i + 1, false, depth + 1)) {
            return true;
        }
    }

    return min_count == 0 and matchInternal(pattern, text, next_pattern, t_idx, false, depth + 1);
}

fn matchStar(
    pattern: []const u8,
    text: []const u8,
    p_idx: usize,
    t_idx: usize,
    char_pattern: u8,
    anchored: bool,
    depth: usize,
) bool {
    // Try matching zero occurrences
    if (matchInternal(pattern, text, p_idx + 2, t_idx, anchored, depth + 1)) {
        return true;
    }

    // Try matching one or more occurrences
    var i = t_idx;
    while (i < text.len and matchChar(char_pattern, text[i])) : (i += 1) {
        if (matchInternal(pattern, text, p_idx + 2, i + 1, anchored, depth + 1)) {
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
    depth: usize,
) bool {
    // Must match at least once
    if (t_idx >= text.len or !matchChar(char_pattern, text[t_idx])) {
        return false;
    }

    // Try matching one or more occurrences
    var i = t_idx;
    while (i < text.len and matchChar(char_pattern, text[i])) : (i += 1) {
        if (matchInternal(pattern, text, p_idx + 2, i + 1, anchored, depth + 1)) {
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
    depth: usize,
) bool {
    // Try matching zero occurrences
    if (matchInternal(pattern, text, p_idx + 2, t_idx, anchored, depth + 1)) {
        return true;
    }

    // Try matching one occurrence
    if (t_idx < text.len and matchChar(char_pattern, text[t_idx])) {
        return matchInternal(pattern, text, p_idx + 2, t_idx + 1, anchored, depth + 1);
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
    try std.testing.expect(matchRegex("a?b", "aab"));
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
