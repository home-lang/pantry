//! Minimal TOML Parser
//!
//! Handles the subset of TOML needed for pantry.toml:
//! - Sections: [section], [section.subsection]
//! - String values: key = "value"
//! - Boolean values: key = true/false
//! - Integer values: key = 123
//! - Comments: # ...

const std = @import("std");

/// A parsed TOML value
pub const TomlValue = union(enum) {
    string: []const u8,
    boolean: bool,
    integer: i64,
};

/// Result of parsing a TOML file.
/// Keys are stored as "section.key" (e.g. "install.linker").
/// Top-level keys have no section prefix.
pub const TomlTable = struct {
    entries: std.StringHashMap(TomlValue),
    allocator: std.mem.Allocator,

    pub fn init(allocator: std.mem.Allocator) TomlTable {
        return .{
            .entries = std.StringHashMap(TomlValue).init(allocator),
            .allocator = allocator,
        };
    }

    pub fn deinit(self: *TomlTable) void {
        var iter = self.entries.iterator();
        while (iter.next()) |entry| {
            self.allocator.free(entry.key_ptr.*);
            switch (entry.value_ptr.*) {
                .string => |s| self.allocator.free(s),
                else => {},
            }
        }
        self.entries.deinit();
    }

    pub fn getString(self: *const TomlTable, key: []const u8) ?[]const u8 {
        if (self.entries.get(key)) |val| {
            return switch (val) {
                .string => |s| s,
                else => null,
            };
        }
        return null;
    }

    pub fn getBool(self: *const TomlTable, key: []const u8) ?bool {
        if (self.entries.get(key)) |val| {
            return switch (val) {
                .boolean => |b| b,
                else => null,
            };
        }
        return null;
    }

    pub fn getInt(self: *const TomlTable, key: []const u8) ?i64 {
        if (self.entries.get(key)) |val| {
            return switch (val) {
                .integer => |i| i,
                else => null,
            };
        }
        return null;
    }
};

/// Parse a TOML string into a TomlTable.
pub fn parse(allocator: std.mem.Allocator, input: []const u8) !TomlTable {
    var table = TomlTable.init(allocator);
    errdefer table.deinit();

    var current_section: ?[]const u8 = null;
    defer if (current_section) |s| allocator.free(s);

    var line_iter = std.mem.splitScalar(u8, input, '\n');
    while (line_iter.next()) |raw_line| {
        // Strip \r for CRLF line endings
        const line = std.mem.trimEnd(u8, raw_line, "\r");
        const trimmed = std.mem.trim(u8, line, " \t");

        // Skip empty lines and comments
        if (trimmed.len == 0 or trimmed[0] == '#') continue;

        // Section header: [section] or [section.subsection]
        if (trimmed[0] == '[') {
            if (std.mem.indexOfScalar(u8, trimmed, ']')) |end| {
                const section_name = std.mem.trim(u8, trimmed[1..end], " \t");
                if (current_section) |s| allocator.free(s);
                current_section = try allocator.dupe(u8, section_name);
            }
            continue;
        }

        // Key = value
        if (std.mem.indexOfScalar(u8, trimmed, '=')) |eq_pos| {
            const raw_key = std.mem.trim(u8, trimmed[0..eq_pos], " \t");
            if (raw_key.len == 0) continue;

            const raw_value = std.mem.trim(u8, trimmed[eq_pos + 1 ..], " \t");

            // Strip inline comments (but not inside strings)
            const value_str = stripInlineComment(raw_value);

            // Build full key: "section.key" or just "key"
            const full_key = if (current_section) |section|
                try std.fmt.allocPrint(allocator, "{s}.{s}", .{ section, raw_key })
            else
                try allocator.dupe(u8, raw_key);
            errdefer allocator.free(full_key);

            // Parse value
            const value = try parseValue(allocator, value_str);

            try table.entries.put(full_key, value);
        }
    }

    return table;
}

/// Strip an inline comment from a value string.
/// Handles quoted strings — does not strip '#' inside quotes.
fn stripInlineComment(value: []const u8) []const u8 {
    if (value.len == 0) return value;

    // If the value starts with a quote, find the closing quote first
    if (value[0] == '"') {
        if (value.len > 1) {
            if (std.mem.indexOfScalarPos(u8, value, 1, '"')) |close_quote| {
                return std.mem.trim(u8, value[0 .. close_quote + 1], " \t");
            }
        }
        return value;
    }

    // Otherwise, strip at the first '#'
    if (std.mem.indexOfScalar(u8, value, '#')) |hash_pos| {
        return std.mem.trimEnd(u8, value[0..hash_pos], " \t");
    }

    return value;
}

/// Parse a single TOML value.
fn parseValue(allocator: std.mem.Allocator, value: []const u8) !TomlValue {
    if (value.len == 0) return .{ .string = try allocator.dupe(u8, "") };

    // Boolean
    if (std.mem.eql(u8, value, "true")) return .{ .boolean = true };
    if (std.mem.eql(u8, value, "false")) return .{ .boolean = false };

    // Quoted string
    if (value.len >= 2 and value[0] == '"' and value[value.len - 1] == '"') {
        return .{ .string = try allocator.dupe(u8, value[1 .. value.len - 1]) };
    }

    // Integer
    if (std.fmt.parseInt(i64, value, 10)) |int_val| {
        return .{ .integer = int_val };
    } else |_| {}

    // Bare string (unquoted)
    return .{ .string = try allocator.dupe(u8, value) };
}

// ============================================================================
// Tests
// ============================================================================

test "parse empty input" {
    const allocator = std.testing.allocator;
    var table = try parse(allocator, "");
    defer table.deinit();
    try std.testing.expectEqual(@as(usize, 0), table.entries.count());
}

test "parse comments only" {
    const allocator = std.testing.allocator;
    var table = try parse(allocator,
        \\# This is a comment
        \\# Another comment
    );
    defer table.deinit();
    try std.testing.expectEqual(@as(usize, 0), table.entries.count());
}

test "parse top-level key-value pairs" {
    const allocator = std.testing.allocator;
    var table = try parse(allocator,
        \\name = "pantry"
        \\version = 1
        \\debug = false
    );
    defer table.deinit();

    try std.testing.expectEqualStrings("pantry", table.getString("name").?);
    try std.testing.expectEqual(@as(i64, 1), table.getInt("version").?);
    try std.testing.expectEqual(false, table.getBool("debug").?);
}

test "parse sections" {
    const allocator = std.testing.allocator;
    var table = try parse(allocator,
        \\[install]
        \\linker = "isolated"
        \\peer = false
        \\dev = true
        \\registry = "https://registry.npmjs.org/"
    );
    defer table.deinit();

    try std.testing.expectEqualStrings("isolated", table.getString("install.linker").?);
    try std.testing.expectEqual(false, table.getBool("install.peer").?);
    try std.testing.expectEqual(true, table.getBool("install.dev").?);
    try std.testing.expectEqualStrings("https://registry.npmjs.org/", table.getString("install.registry").?);
}

test "parse nested sections" {
    const allocator = std.testing.allocator;
    var table = try parse(allocator,
        \\[install.scopes]
        \\myorg = "https://registry.myorg.com/"
    );
    defer table.deinit();

    try std.testing.expectEqualStrings("https://registry.myorg.com/", table.getString("install.scopes.myorg").?);
}

test "parse with inline comments" {
    const allocator = std.testing.allocator;
    var table = try parse(allocator,
        \\linker = "hoisted" # Use hoisted linker
        \\peer = true # Auto-install peers
    );
    defer table.deinit();

    try std.testing.expectEqualStrings("hoisted", table.getString("linker").?);
    try std.testing.expectEqual(true, table.getBool("peer").?);
}

test "parse full pantry.toml example" {
    const allocator = std.testing.allocator;
    var table = try parse(allocator,
        \\# pantry.toml
        \\
        \\[install]
        \\linker = "hoisted"
        \\peer = true
        \\dev = true
        \\optional = true
        \\production = false
        \\registry = "https://registry.npmjs.org/"
        \\frozenLockfile = false
    );
    defer table.deinit();

    try std.testing.expectEqualStrings("hoisted", table.getString("install.linker").?);
    try std.testing.expectEqual(true, table.getBool("install.peer").?);
    try std.testing.expectEqual(true, table.getBool("install.dev").?);
    try std.testing.expectEqual(true, table.getBool("install.optional").?);
    try std.testing.expectEqual(false, table.getBool("install.production").?);
    try std.testing.expectEqualStrings("https://registry.npmjs.org/", table.getString("install.registry").?);
    try std.testing.expectEqual(false, table.getBool("install.frozenLockfile").?);
}
