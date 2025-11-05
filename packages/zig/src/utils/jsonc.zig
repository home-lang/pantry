const std = @import("std");

/// Strip comments from JSONC (JSON with Comments) content
/// Handles:
/// - Single-line comments: // comment
/// - Multi-line comments: /* comment */
/// - Preserves strings containing comment-like sequences
pub fn stripComments(allocator: std.mem.Allocator, jsonc: []const u8) ![]const u8 {
    var result = try std.ArrayList(u8).initCapacity(allocator, jsonc.len);
    errdefer result.deinit(allocator);

    var i: usize = 0;
    var in_string = false;
    var escape_next = false;

    while (i < jsonc.len) {
        const char = jsonc[i];

        // Handle escape sequences in strings
        if (in_string and escape_next) {
            try result.append(allocator, char);
            escape_next = false;
            i += 1;
            continue;
        }

        // Handle string boundaries
        if (char == '"' and !escape_next) {
            in_string = !in_string;
            try result.append(allocator, char);
            i += 1;
            continue;
        }

        // Handle escape character
        if (in_string and char == '\\') {
            escape_next = true;
            try result.append(allocator, char);
            i += 1;
            continue;
        }

        // If we're in a string, just copy the character
        if (in_string) {
            try result.append(allocator, char);
            i += 1;
            continue;
        }

        // Check for single-line comment
        if (char == '/' and i + 1 < jsonc.len and jsonc[i + 1] == '/') {
            // Skip until end of line
            i += 2;
            while (i < jsonc.len and jsonc[i] != '\n' and jsonc[i] != '\r') {
                i += 1;
            }
            // Keep the newline for formatting
            if (i < jsonc.len) {
                try result.append(allocator, jsonc[i]);
                i += 1;
            }
            continue;
        }

        // Check for multi-line comment
        if (char == '/' and i + 1 < jsonc.len and jsonc[i + 1] == '*') {
            // Skip until */
            i += 2;
            var found_end = false;
            while (i + 1 < jsonc.len) {
                if (jsonc[i] == '*' and jsonc[i + 1] == '/') {
                    i += 2;
                    found_end = true;
                    break;
                }
                i += 1;
            }
            if (!found_end) {
                // Unterminated comment - skip to end
                i = jsonc.len;
            }
            continue;
        }

        // Regular character - copy it
        try result.append(allocator, char);
        i += 1;
    }

    return result.toOwnedSlice(allocator);
}

test "stripComments - single line comment" {
    const allocator = std.testing.allocator;
    const input =
        \\{
        \\  // This is a comment
        \\  "name": "test"
        \\}
    ;
    const result = try stripComments(allocator, input);
    defer allocator.free(result);

    // Should not contain the comment
    try std.testing.expect(std.mem.indexOf(u8, result, "This is a comment") == null);
    // Should contain the name field
    try std.testing.expect(std.mem.indexOf(u8, result, "\"name\"") != null);
}

test "stripComments - multi line comment" {
    const allocator = std.testing.allocator;
    const input =
        \\{
        \\  /* This is a
        \\     multi-line comment */
        \\  "name": "test"
        \\}
    ;
    const result = try stripComments(allocator, input);
    defer allocator.free(result);

    // Should not contain the comment
    try std.testing.expect(std.mem.indexOf(u8, result, "multi-line comment") == null);
    // Should contain the name field
    try std.testing.expect(std.mem.indexOf(u8, result, "\"name\"") != null);
}

test "stripComments - preserve comment-like strings" {
    const allocator = std.testing.allocator;
    const input =
        \\{
        \\  "url": "https://example.com",
        \\  "comment": "This // is not a comment",
        \\  "note": "Neither /* is */ this"
        \\}
    ;
    const result = try stripComments(allocator, input);
    defer allocator.free(result);

    // All strings should be preserved
    try std.testing.expect(std.mem.indexOf(u8, result, "https://example.com") != null);
    try std.testing.expect(std.mem.indexOf(u8, result, "This // is not a comment") != null);
    try std.testing.expect(std.mem.indexOf(u8, result, "Neither /* is */ this") != null);
}

test "stripComments - escaped quotes in strings" {
    const allocator = std.testing.allocator;
    const input =
        \\{
        \\  // Real comment
        \\  "text": "She said \"hello\" // not a comment"
        \\}
    ;
    const result = try stripComments(allocator, input);
    defer allocator.free(result);

    // The string with escaped quotes should be preserved
    try std.testing.expect(std.mem.indexOf(u8, result, "She said \\\"hello\\\" // not a comment") != null);
    // The real comment should be gone
    try std.testing.expect(std.mem.indexOf(u8, result, "Real comment") == null);
}

test "stripComments - trailing comma comment" {
    const allocator = std.testing.allocator;
    const input =
        \\{
        \\  "name": "test", // trailing comma is ok
        \\  "version": "1.0.0"
        \\}
    ;
    const result = try stripComments(allocator, input);
    defer allocator.free(result);

    try std.testing.expect(std.mem.indexOf(u8, result, "trailing comma is ok") == null);
    try std.testing.expect(std.mem.indexOf(u8, result, "\"name\"") != null);
    try std.testing.expect(std.mem.indexOf(u8, result, "\"version\"") != null);
}
