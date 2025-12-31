//! Filter Configuration
//!
//! Loads and manages filter configurations from pantry.json
//! Allows saving common filter patterns with named aliases

const std = @import("std");

/// Named filter configuration
pub const FilterConfig = struct {
    name: []const u8,
    patterns: [][]const u8,
    description: ?[]const u8,
    extends: ?[]const u8 = null, // Name of filter to extend

    pub fn deinit(self: *FilterConfig, allocator: std.mem.Allocator) void {
        allocator.free(self.name);
        for (self.patterns) |pattern| {
            allocator.free(pattern);
        }
        allocator.free(self.patterns);
        if (self.description) |desc| {
            allocator.free(desc);
        }
        if (self.extends) |ext| {
            allocator.free(ext);
        }
    }
};

/// Collection of filter configurations
pub const FilterConfigs = struct {
    configs: std.StringHashMap(FilterConfig),
    allocator: std.mem.Allocator,

    pub fn init(allocator: std.mem.Allocator) FilterConfigs {
        return .{
            .configs = std.StringHashMap(FilterConfig).init(allocator),
            .allocator = allocator,
        };
    }

    pub fn deinit(self: *FilterConfigs) void {
        var iter = self.configs.valueIterator();
        while (iter.next()) |config| {
            var mut_config = @constCast(config);
            mut_config.deinit(self.allocator);
        }

        var key_iter = self.configs.keyIterator();
        while (key_iter.next()) |key| {
            self.allocator.free(key.*);
        }

        self.configs.deinit();
    }

    pub fn add(self: *FilterConfigs, config: FilterConfig) !void {
        const key = try self.allocator.dupe(u8, config.name);
        errdefer self.allocator.free(key);
        try self.configs.put(key, config);
    }

    pub fn get(self: *FilterConfigs, name: []const u8) ?*const FilterConfig {
        return self.configs.getPtr(name);
    }

    /// Resolve a filter with its full inheritance chain
    /// Returns all patterns from the filter and its extended filters
    pub fn resolveWithInheritance(
        self: *FilterConfigs,
        name: []const u8,
    ) ![][]const u8 {
        var all_patterns = std.ArrayList([]const u8){};
        errdefer all_patterns.deinit(self.allocator);

        var visited = std.StringHashMap(void).init(self.allocator);
        defer visited.deinit();

        try self.collectPatternsRecursive(name, &all_patterns, &visited);

        return try all_patterns.toOwnedSlice(self.allocator);
    }

    fn collectPatternsRecursive(
        self: *FilterConfigs,
        name: []const u8,
        patterns: *std.ArrayList([]const u8),
        visited: *std.StringHashMap(void),
    ) !void {
        // Check for circular references
        if (visited.contains(name)) {
            return error.CircularInheritance;
        }

        const config = self.configs.get(name) orelse return error.FilterNotFound;
        try visited.put(try self.allocator.dupe(u8, name), {});

        // First, resolve parent if it exists
        if (config.extends) |parent_name| {
            try self.collectPatternsRecursive(parent_name, patterns, visited);
        }

        // Then add our own patterns
        for (config.patterns) |pattern| {
            try patterns.append(self.allocator, try self.allocator.dupe(u8, pattern));
        }
    }
};

/// Load filter configurations from pantry.json
pub fn loadFromConfig(
    allocator: std.mem.Allocator,
    config_path: []const u8,
) !FilterConfigs {
    var configs = FilterConfigs.init(allocator);
    errdefer configs.deinit();

    // Read config file
    const content = std.Io.Dir.cwd().readFileAlloc(config_path, allocator, std.Io.Limit.limited(10 * 1024 * 1024)) catch |err| {
        if (err == error.FileNotFound) {
            // No config file, return empty configs
            return configs;
        }
        return err;
    };
    defer allocator.free(content);

    // Parse JSON
    const parsed = std.json.parseFromSlice(std.json.Value, allocator, content, .{}) catch {
        // Invalid JSON, return empty configs
        return configs;
    };
    defer parsed.deinit();

    const root = parsed.value;
    if (root != .object) {
        return configs;
    }

    // Look for "filters" field
    const filters_obj = root.object.get("filters") orelse return configs;
    if (filters_obj != .object) {
        return configs;
    }

    // Parse each filter configuration
    var iter = filters_obj.object.iterator();
    while (iter.next()) |entry| {
        const filter_name = entry.key_ptr.*;
        const filter_value = entry.value_ptr.*;

        var config = FilterConfig{
            .name = try allocator.dupe(u8, filter_name),
            .patterns = &[_][]const u8{},
            .description = null,
        };
        errdefer config.deinit(allocator);

        // Parse filter value (can be string, array, or object)
        if (filter_value == .string) {
            // Single pattern
            const patterns = try allocator.alloc([]const u8, 1);
            patterns[0] = try allocator.dupe(u8, filter_value.string);
            config.patterns = patterns;
        } else if (filter_value == .array) {
            // Array of patterns
            const patterns = try allocator.alloc([]const u8, filter_value.array.items.len);
            errdefer allocator.free(patterns);

            for (filter_value.array.items, 0..) |item, i| {
                if (item == .string) {
                    patterns[i] = try allocator.dupe(u8, item.string);
                } else {
                    // Invalid item, skip this filter
                    for (patterns[0..i]) |p| {
                        allocator.free(p);
                    }
                    allocator.free(patterns);
                    config.deinit(allocator);
                    continue;
                }
            }
            config.patterns = patterns;
        } else if (filter_value == .object) {
            // Object with patterns and description
            const patterns_val = filter_value.object.get("patterns") orelse {
                config.deinit(allocator);
                continue;
            };

            if (patterns_val == .array) {
                const patterns = try allocator.alloc([]const u8, patterns_val.array.items.len);
                errdefer allocator.free(patterns);

                for (patterns_val.array.items, 0..) |item, i| {
                    if (item == .string) {
                        patterns[i] = try allocator.dupe(u8, item.string);
                    } else {
                        for (patterns[0..i]) |p| {
                            allocator.free(p);
                        }
                        allocator.free(patterns);
                        config.deinit(allocator);
                        continue;
                    }
                }
                config.patterns = patterns;
            } else {
                config.deinit(allocator);
                continue;
            }

            // Get description if present
            if (filter_value.object.get("description")) |desc_val| {
                if (desc_val == .string) {
                    config.description = try allocator.dupe(u8, desc_val.string);
                }
            }

            // Get extends if present
            if (filter_value.object.get("extends")) |extends_val| {
                if (extends_val == .string) {
                    config.extends = try allocator.dupe(u8, extends_val.string);
                }
            }
        } else {
            config.deinit(allocator);
            continue;
        }

        try configs.add(config);
    }

    return configs;
}

// ============================================================================
// Tests
// ============================================================================

test "loadFromConfig - simple patterns" {
    const allocator = std.testing.allocator;

    // Create temp config file
    const config_content =
        \\{
        \\  "filters": {
        \\    "backend": "packages/backend-*",
        \\    "frontend": ["packages/frontend-*", "packages/ui-*"]
        \\  }
        \\}
    ;

    const temp_path = "/tmp/test-filter-config.json";
    try std.Io.Dir.cwd().writeFile(.{ .sub_path = temp_path, .data = config_content });
    defer std.Io.Dir.cwd().deleteFile(temp_path) catch {};

    var configs = try loadFromConfig(allocator, temp_path);
    defer configs.deinit();

    // Check backend filter
    const backend = configs.get("backend");
    try std.testing.expect(backend != null);
    try std.testing.expect(backend.?.patterns.len == 1);
    try std.testing.expectEqualStrings("packages/backend-*", backend.?.patterns[0]);

    // Check frontend filter
    const frontend = configs.get("frontend");
    try std.testing.expect(frontend != null);
    try std.testing.expect(frontend.?.patterns.len == 2);
}

test "loadFromConfig - with description" {
    const allocator = std.testing.allocator;

    const config_content =
        \\{
        \\  "filters": {
        \\    "api": {
        \\      "patterns": ["packages/api-*", "packages/services-*"],
        \\      "description": "All API and service packages"
        \\    }
        \\  }
        \\}
    ;

    const temp_path = "/tmp/test-filter-config-desc.json";
    try std.Io.Dir.cwd().writeFile(.{ .sub_path = temp_path, .data = config_content });
    defer std.Io.Dir.cwd().deleteFile(temp_path) catch {};

    var configs = try loadFromConfig(allocator, temp_path);
    defer configs.deinit();

    const api = configs.get("api");
    try std.testing.expect(api != null);
    try std.testing.expect(api.?.patterns.len == 2);
    try std.testing.expect(api.?.description != null);
    try std.testing.expectEqualStrings("All API and service packages", api.?.description.?);
}

test "loadFromConfig - missing file" {
    const allocator = std.testing.allocator;

    var configs = try loadFromConfig(allocator, "/nonexistent/path.json");
    defer configs.deinit();

    // Should return empty configs without error
    try std.testing.expect(configs.configs.count() == 0);
}

test "filter inheritance - simple extends" {
    const allocator = std.testing.allocator;

    const config_content =
        \\{
        \\  "filters": {
        \\    "base": ["packages/base-*"],
        \\    "extended": {
        \\      "extends": "base",
        \\      "patterns": ["packages/extended-*"],
        \\      "description": "Extended filter"
        \\    }
        \\  }
        \\}
    ;

    const temp_path = "/tmp/test-filter-inheritance.json";
    try std.Io.Dir.cwd().writeFile(.{ .sub_path = temp_path, .data = config_content });
    defer std.Io.Dir.cwd().deleteFile(temp_path) catch {};

    var configs = try loadFromConfig(allocator, temp_path);
    defer configs.deinit();

    // Check that extends field was loaded
    const extended = configs.get("extended");
    try std.testing.expect(extended != null);
    try std.testing.expect(extended.?.extends != null);
    try std.testing.expectEqualStrings("base", extended.?.extends.?);

    // Resolve inheritance
    const resolved = try configs.resolveWithInheritance("extended");
    defer {
        for (resolved) |pattern| {
            allocator.free(pattern);
        }
        allocator.free(resolved);
    }

    // Should have both base and extended patterns
    try std.testing.expect(resolved.len == 2);
    try std.testing.expectEqualStrings("packages/base-*", resolved[0]);
    try std.testing.expectEqualStrings("packages/extended-*", resolved[1]);
}

test "filter inheritance - multiple levels" {
    const allocator = std.testing.allocator;

    const config_content =
        \\{
        \\  "filters": {
        \\    "level1": ["pattern1"],
        \\    "level2": {
        \\      "extends": "level1",
        \\      "patterns": ["pattern2"]
        \\    },
        \\    "level3": {
        \\      "extends": "level2",
        \\      "patterns": ["pattern3"]
        \\    }
        \\  }
        \\}
    ;

    const temp_path = "/tmp/test-filter-multi-level.json";
    try std.Io.Dir.cwd().writeFile(.{ .sub_path = temp_path, .data = config_content });
    defer std.Io.Dir.cwd().deleteFile(temp_path) catch {};

    var configs = try loadFromConfig(allocator, temp_path);
    defer configs.deinit();

    // Resolve multi-level inheritance
    const resolved = try configs.resolveWithInheritance("level3");
    defer {
        for (resolved) |pattern| {
            allocator.free(pattern);
        }
        allocator.free(resolved);
    }

    // Should have all three patterns in order
    try std.testing.expect(resolved.len == 3);
    try std.testing.expectEqualStrings("pattern1", resolved[0]);
    try std.testing.expectEqualStrings("pattern2", resolved[1]);
    try std.testing.expectEqualStrings("pattern3", resolved[2]);
}

test "filter inheritance - circular detection" {
    const allocator = std.testing.allocator;

    const config_content =
        \\{
        \\  "filters": {
        \\    "a": {
        \\      "extends": "b",
        \\      "patterns": ["patternA"]
        \\    },
        \\    "b": {
        \\      "extends": "a",
        \\      "patterns": ["patternB"]
        \\    }
        \\  }
        \\}
    ;

    const temp_path = "/tmp/test-filter-circular.json";
    try std.Io.Dir.cwd().writeFile(.{ .sub_path = temp_path, .data = config_content });
    defer std.Io.Dir.cwd().deleteFile(temp_path) catch {};

    var configs = try loadFromConfig(allocator, temp_path);
    defer configs.deinit();

    // Should detect circular reference
    const result = configs.resolveWithInheritance("a");
    try std.testing.expectError(error.CircularInheritance, result);
}
