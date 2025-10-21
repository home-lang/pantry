const std = @import("std");

/// Lightweight TypeScript config parser
/// Converts simple .config.ts files to JSON by:
/// 1. Stripping imports and type annotations
/// 2. Extracting the exported config object
/// 3. Converting TypeScript object syntax to JSON
pub const TsConfigParser = struct {
    allocator: std.mem.Allocator,

    pub fn init(allocator: std.mem.Allocator) TsConfigParser {
        return TsConfigParser{
            .allocator = allocator,
        };
    }

    /// Parse a TypeScript config file and return JSON string
    pub fn parse(self: *TsConfigParser, ts_content: []const u8) ![]const u8 {
        // Step 1: Remove comments
        const no_comments = try self.removeComments(ts_content);
        defer self.allocator.free(no_comments);

        // Step 2: Remove imports
        const no_imports = try self.removeImports(no_comments);
        defer self.allocator.free(no_imports);

        // Step 3: Extract exported object
        const obj_literal = try self.extractExportedObject(no_imports);
        defer self.allocator.free(obj_literal);

        // Step 4: Convert to JSON
        return try self.toJson(obj_literal);
    }

    /// Remove single-line and multi-line comments
    fn removeComments(self: *TsConfigParser, content: []const u8) ![]const u8 {
        var result = try std.ArrayList(u8).initCapacity(self.allocator, content.len);
        errdefer result.deinit(self.allocator);

        var i: usize = 0;
        while (i < content.len) {
            // Multi-line comment
            if (i + 1 < content.len and content[i] == '/' and content[i + 1] == '*') {
                i += 2;
                while (i + 1 < content.len) {
                    if (content[i] == '*' and content[i + 1] == '/') {
                        i += 2;
                        break;
                    }
                    i += 1;
                }
                continue;
            }

            // Single-line comment
            if (i + 1 < content.len and content[i] == '/' and content[i + 1] == '/') {
                while (i < content.len and content[i] != '\n') {
                    i += 1;
                }
                continue;
            }

            try result.append(self.allocator, content[i]);
            i += 1;
        }

        return result.toOwnedSlice(self.allocator);
    }

    /// Remove import statements
    fn removeImports(self: *TsConfigParser, content: []const u8) ![]const u8 {
        var result = try std.ArrayList(u8).initCapacity(self.allocator, content.len);
        errdefer result.deinit(self.allocator);

        var lines = std.mem.splitSequence(u8, content, "\n");
        while (lines.next()) |line| {
            const trimmed = std.mem.trim(u8, line, " \t\r");
            if (!std.mem.startsWith(u8, trimmed, "import ")) {
                try result.appendSlice(self.allocator, line);
                try result.append(self.allocator, '\n');
            }
        }

        return result.toOwnedSlice(self.allocator);
    }

    /// Extract the exported config object
    /// Handles both: export const config = {...} and export default {...}
    fn extractExportedObject(self: *TsConfigParser, content: []const u8) ![]const u8 {
        const trimmed = std.mem.trim(u8, content, " \t\r\n");

        // Find "export" keyword
        const export_idx = std.mem.indexOf(u8, trimmed, "export") orelse {
            return error.NoExportFound;
        };

        // Find the opening brace
        const start_brace = std.mem.indexOfPos(u8, trimmed, export_idx, "{") orelse {
            return error.NoObjectLiteralFound;
        };

        // Find the matching closing brace
        const end_brace = try self.findMatchingBrace(trimmed, start_brace);

        // Extract the object literal (including braces)
        return try self.allocator.dupe(u8, trimmed[start_brace .. end_brace + 1]);
    }

    /// Find matching closing brace
    fn findMatchingBrace(self: *TsConfigParser, content: []const u8, start: usize) !usize {
        _ = self;
        var depth: i32 = 0;
        var i = start;
        var in_string = false;
        var string_char: u8 = 0;

        while (i < content.len) {
            const c = content[i];

            // Handle strings
            if (c == '"' or c == '\'' or c == '`') {
                if (!in_string) {
                    in_string = true;
                    string_char = c;
                } else if (c == string_char and (i == 0 or content[i - 1] != '\\')) {
                    in_string = false;
                }
                i += 1;
                continue;
            }

            if (!in_string) {
                if (c == '{') {
                    depth += 1;
                } else if (c == '}') {
                    depth -= 1;
                    if (depth == 0) {
                        return i;
                    }
                }
            }

            i += 1;
        }

        return error.UnmatchedBrace;
    }

    /// Convert TypeScript object literal to JSON
    /// Handles:
    /// - Unquoted keys -> quoted keys
    /// - Single quotes -> double quotes
    /// - Trailing commas
    /// - Type annotations (as any)
    fn toJson(self: *TsConfigParser, obj_literal: []const u8) ![]const u8 {
        var result = try std.ArrayList(u8).initCapacity(self.allocator, obj_literal.len);
        errdefer result.deinit(self.allocator);

        var i: usize = 0;
        var in_string = false;
        var string_char: u8 = 0;

        while (i < obj_literal.len) {
            const c = obj_literal[i];

            // Track string state
            if ((c == '"' or c == '\'' or c == '`') and (i == 0 or obj_literal[i - 1] != '\\')) {
                if (!in_string) {
                    in_string = true;
                    string_char = c;
                    // Always use double quotes in JSON
                    try result.append(self.allocator, '"');
                    i += 1;
                    continue;
                } else if (c == string_char) {
                    in_string = false;
                    try result.append(self.allocator, '"');
                    i += 1;
                    continue;
                }
            }

            if (in_string) {
                try result.append(self.allocator, c);
                i += 1;
                continue;
            }

            // Remove type annotations (as any, as string, etc.)
            if (i + 3 < obj_literal.len and obj_literal[i] == ' ' and
                obj_literal[i + 1] == 'a' and obj_literal[i + 2] == 's' and
                obj_literal[i + 3] == ' ')
            {
                // Skip until comma or closing brace
                i += 4;
                while (i < obj_literal.len and obj_literal[i] != ',' and obj_literal[i] != '}') {
                    i += 1;
                }
                continue;
            }

            // Handle unquoted keys (key: value -> "key": value)
            if (c >= 'a' and c <= 'z' or c >= 'A' and c <= 'Z' or c == '_') {
                // Check if this looks like a key (preceded by { or , or newline)
                var is_key = false;
                var j: usize = if (i > 0) i - 1 else 0;
                while (j > 0) : (j -= 1) {
                    const prev = obj_literal[j];
                    if (prev == '{' or prev == ',' or prev == '\n') {
                        is_key = true;
                        break;
                    }
                    if (prev != ' ' and prev != '\t' and prev != '\r') {
                        break;
                    }
                }

                if (is_key) {
                    // Find the end of the key
                    var key_end = i;
                    while (key_end < obj_literal.len) {
                        const kc = obj_literal[key_end];
                        if (kc == ':' or kc == ' ' or kc == '\t') {
                            break;
                        }
                        key_end += 1;
                    }

                    // Quote the key
                    try result.append(self.allocator, '"');
                    try result.appendSlice(self.allocator, obj_literal[i..key_end]);
                    try result.append(self.allocator, '"');
                    i = key_end;
                    continue;
                }
            }

            // Remove trailing commas before } or ]
            if (c == ',') {
                var next_idx = i + 1;
                while (next_idx < obj_literal.len) {
                    const nc = obj_literal[next_idx];
                    if (nc == '}' or nc == ']') {
                        // Skip this comma
                        i += 1;
                        continue;
                    }
                    if (nc != ' ' and nc != '\t' and nc != '\n' and nc != '\r') {
                        break;
                    }
                    next_idx += 1;
                }
            }

            try result.append(self.allocator, c);
            i += 1;
        }

        return result.toOwnedSlice(self.allocator);
    }
};

test "TsConfigParser removes comments" {
    const allocator = std.testing.allocator;
    var parser = TsConfigParser.init(allocator);

    const input =
        \\// Single line comment
        \\const x = 1; // inline comment
        \\/* Multi
        \\   line
        \\   comment */
        \\const y = 2;
    ;

    const result = try parser.removeComments(input);
    defer allocator.free(result);

    try std.testing.expect(std.mem.indexOf(u8, result, "Single line") == null);
    try std.testing.expect(std.mem.indexOf(u8, result, "Multi") == null);
    try std.testing.expect(std.mem.indexOf(u8, result, "const x = 1;") != null);
}

test "TsConfigParser extracts exported object" {
    const allocator = std.testing.allocator;
    var parser = TsConfigParser.init(allocator);

    const input =
        \\export const config = {
        \\  key: "value",
        \\  nested: { a: 1 }
        \\}
    ;

    const result = try parser.extractExportedObject(input);
    defer allocator.free(result);

    try std.testing.expect(std.mem.startsWith(u8, result, "{"));
    try std.testing.expect(std.mem.endsWith(u8, result, "}"));
    try std.testing.expect(std.mem.indexOf(u8, result, "key") != null);
}

test "TsConfigParser converts to JSON" {
    const allocator = std.testing.allocator;
    var parser = TsConfigParser.init(allocator);

    const input =
        \\{
        \\  key: 'value',
        \\  number: 42,
        \\  bool: true,
        \\}
    ;

    const result = try parser.toJson(input);
    defer allocator.free(result);

    try std.testing.expect(std.mem.indexOf(u8, result, "\"key\"") != null);
    try std.testing.expect(std.mem.indexOf(u8, result, "\"value\"") != null);
    try std.testing.expect(std.mem.indexOf(u8, result, "'") == null);
}

test "TsConfigParser full parse" {
    const allocator = std.testing.allocator;
    var parser = TsConfigParser.init(allocator);

    const input =
        \\import type { Config } from 'somewhere'
        \\
        \\export const config = {
        \\  name: 'test',
        \\  port: 3000,
        \\  enabled: true,
        \\  nested: {
        \\    key: "value"
        \\  }
        \\}
    ;

    const result = try parser.parse(input);
    defer allocator.free(result);

    // Should be valid JSON-like structure
    try std.testing.expect(std.mem.startsWith(u8, result, "{"));
    try std.testing.expect(std.mem.indexOf(u8, result, "import") == null);
    try std.testing.expect(std.mem.indexOf(u8, result, "\"name\"") != null);
}
