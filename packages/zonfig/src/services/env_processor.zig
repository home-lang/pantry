const std = @import("std");
const errors = @import("../errors.zig");

/// Environment variable processor with type-aware parsing
pub const EnvProcessor = struct {
    allocator: std.mem.Allocator,

    pub fn init(allocator: std.mem.Allocator) EnvProcessor {
        return EnvProcessor{
            .allocator = allocator,
        };
    }

    /// Apply environment variables to config
    pub fn applyEnvVars(
        self: *EnvProcessor,
        config: std.json.Value,
        prefix: []const u8,
    ) !std.json.Value {
        if (config != .object) {
            return config;
        }

        var result = std.json.ObjectMap.init(self.allocator);

        var iter = config.object.iterator();
        while (iter.next()) |entry| {
            const key = entry.key_ptr.*;
            const value = entry.value_ptr.*;

            // Generate env var name
            const env_name = try self.generateEnvName(prefix, &[_][]const u8{key});
            defer self.allocator.free(env_name);

            // Check if env var exists
            if (std.posix.getenv(env_name)) |env_value| {
                // Parse env var value with type awareness
                const parsed_value = try self.parseEnvValue(env_value);
                try result.put(try self.allocator.dupe(u8, key), parsed_value);
            } else if (value == .object) {
                // Recursively process nested objects
                const nested = try self.applyEnvVars(value, env_name);
                try result.put(try self.allocator.dupe(u8, key), nested);
            } else {
                // Keep original value
                try result.put(try self.allocator.dupe(u8, key), try self.cloneValue(value));
            }
        }

        return .{ .object = result };
    }

    /// Parse environment variable with type awareness
    pub fn parseEnvValue(self: *EnvProcessor, value: []const u8) !std.json.Value {
        // Boolean
        if (self.isBoolString(value)) {
            return .{ .bool = self.parseBool(value) };
        }

        // Number (integer)
        if (std.fmt.parseInt(i64, value, 10)) |num| {
            return .{ .integer = num };
        } else |_| {}

        // Number (float)
        if (std.fmt.parseFloat(f64, value)) |num| {
            return .{ .float = num };
        } else |_| {}

        // JSON array/object
        if (value.len > 0 and (value[0] == '[' or value[0] == '{')) {
            const parsed = std.json.parseFromSlice(
                std.json.Value,
                self.allocator,
                value,
                .{},
            ) catch {
                // If JSON parse fails, treat as string
                return .{ .string = try self.allocator.dupe(u8, value) };
            };
            return parsed.value;
        }

        // Comma-separated array
        if (std.mem.indexOf(u8, value, ",")) |_| {
            var count: usize = 1;
            for (value) |c| {
                if (c == ',') count += 1;
            }

            const items = try self.allocator.alloc(std.json.Value, count);
            var idx: usize = 0;
            var iter = std.mem.splitSequence(u8, value, ",");
            while (iter.next()) |item| {
                const trimmed = std.mem.trim(u8, item, " \t");
                items[idx] = .{ .string = try self.allocator.dupe(u8, trimmed) };
                idx += 1;
            }
            return .{ .array = std.json.Array.fromOwnedSlice(self.allocator, items) };
        }

        // Default: string
        return .{ .string = try self.allocator.dupe(u8, value) };
    }

    /// Generate env var name from config path
    pub fn generateEnvName(
        self: *EnvProcessor,
        prefix: []const u8,
        path: []const []const u8,
    ) ![]const u8 {
        // Calculate total length needed
        var len: usize = prefix.len;
        for (path) |component| {
            len += 1 + component.len; // underscore + component
        }

        const result = try self.allocator.alloc(u8, len);
        var idx: usize = 0;

        // Add prefix in uppercase
        for (prefix) |c| {
            result[idx] = std.ascii.toUpper(c);
            idx += 1;
        }

        // Add path components in uppercase with underscores
        for (path) |component| {
            result[idx] = '_';
            idx += 1;
            for (component) |c| {
                if (c == '-') {
                    result[idx] = '_';
                } else {
                    result[idx] = std.ascii.toUpper(c);
                }
                idx += 1;
            }
        }

        return result;
    }

    fn isBoolString(self: *EnvProcessor, s: []const u8) bool {
        const lower = std.ascii.allocLowerString(self.allocator, s) catch return false;
        defer self.allocator.free(lower);

        return std.mem.eql(u8, lower, "true") or
            std.mem.eql(u8, lower, "false") or
            std.mem.eql(u8, s, "1") or
            std.mem.eql(u8, s, "0") or
            std.mem.eql(u8, lower, "yes") or
            std.mem.eql(u8, lower, "no");
    }

    fn parseBool(self: *EnvProcessor, s: []const u8) bool {
        const lower = std.ascii.allocLowerString(self.allocator, s) catch return false;
        defer self.allocator.free(lower);

        return std.mem.eql(u8, lower, "true") or
            std.mem.eql(u8, s, "1") or
            std.mem.eql(u8, lower, "yes");
    }

    fn cloneValue(self: *EnvProcessor, value: std.json.Value) !std.json.Value {
        return switch (value) {
            .null, .bool, .integer, .float, .number_string => value,
            .string => |s| .{ .string = try self.allocator.dupe(u8, s) },
            .array => |arr| {
                const items = try self.allocator.alloc(std.json.Value, arr.items.len);
                for (arr.items, 0..) |item, i| {
                    items[i] = try self.cloneValue(item);
                }
                return .{ .array = std.json.Array.fromOwnedSlice(self.allocator, items) };
            },
            .object => |obj| {
                var new_obj = std.json.ObjectMap.init(self.allocator);
                var iter = obj.iterator();
                while (iter.next()) |entry| {
                    try new_obj.put(
                        try self.allocator.dupe(u8, entry.key_ptr.*),
                        try self.cloneValue(entry.value_ptr.*),
                    );
                }
                return .{ .object = new_obj };
            },
        };
    }
};

test "EnvProcessor.parseEnvValue parses boolean" {
    const allocator = std.testing.allocator;
    var processor = EnvProcessor.init(allocator);

    const value1 = try processor.parseEnvValue("true");
    try std.testing.expectEqual(true, value1.bool);

    const value2 = try processor.parseEnvValue("false");
    try std.testing.expectEqual(false, value2.bool);

    const value3 = try processor.parseEnvValue("1");
    try std.testing.expectEqual(true, value3.bool);
}

test "EnvProcessor.parseEnvValue parses integer" {
    const allocator = std.testing.allocator;
    var processor = EnvProcessor.init(allocator);

    const value = try processor.parseEnvValue("42");
    try std.testing.expectEqual(@as(i64, 42), value.integer);
}

test "EnvProcessor.parseEnvValue parses string" {
    const allocator = std.testing.allocator;
    var processor = EnvProcessor.init(allocator);

    const value = try processor.parseEnvValue("hello");
    defer allocator.free(value.string);

    try std.testing.expectEqualStrings("hello", value.string);
}

test "EnvProcessor.generateEnvName creates correct name" {
    const allocator = std.testing.allocator;
    var processor = EnvProcessor.init(allocator);

    const name = try processor.generateEnvName("myapp", &[_][]const u8{ "database", "host" });
    defer allocator.free(name);

    try std.testing.expectEqualStrings("MYAPP_DATABASE_HOST", name);
}
