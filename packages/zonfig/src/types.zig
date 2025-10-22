const std = @import("std");

/// Configuration source type
pub const ConfigSource = enum {
    file_local,
    file_home,
    typescript,
    package_json,
    env_vars,
    defaults,
};

/// Array merge strategy for deep merge
pub const MergeStrategy = enum {
    replace, // Replace arrays entirely (default)
    concat, // Concatenate arrays with deduplication
    smart, // Merge object arrays by key (id, name, key, path, type)
};

/// Configuration loading options
pub const LoadOptions = struct {
    /// Configuration name (used for file discovery)
    name: []const u8,

    /// Default configuration values
    defaults: ?std.json.Value = null,

    /// Current working directory (defaults to process cwd)
    cwd: ?[]const u8 = null,

    /// Enable validation
    validate: bool = true,

    /// Enable caching
    cache: bool = true,

    /// Cache TTL in milliseconds (default 5 minutes)
    cache_ttl: u64 = 300_000,

    /// Environment variable prefix (defaults to uppercase name)
    env_prefix: ?[]const u8 = null,

    /// Array merge strategy
    merge_strategy: MergeStrategy = .smart,
};

/// Information about a configuration source
pub const SourceInfo = struct {
    source: ConfigSource,
    path: ?[]const u8,
    priority: u8,

    pub fn deinit(self: *SourceInfo, allocator: std.mem.Allocator) void {
        if (self.path) |p| {
            allocator.free(p);
        }
    }
};

/// Configuration loading result
pub const ConfigResult = struct {
    /// The loaded configuration
    config: std.json.Value,

    /// Primary source of the configuration
    source: ConfigSource,

    /// All sources that contributed to the configuration
    sources: []SourceInfo,

    /// Timestamp when configuration was loaded
    loaded_at: i64,

    /// Allocator used for this result
    allocator: std.mem.Allocator,

    /// Parsed JSON data (if loaded from JSON file)
    parsed_json: ?std.json.Parsed(std.json.Value) = null,

    pub fn deinit(self: *ConfigResult) void {
        // If we have parsed JSON data, free it first
        if (self.parsed_json) |*parsed| {
            parsed.deinit();
        } else {
            // Otherwise, recursively free config value manually
            freeJsonValue(self.allocator, self.config);
        }

        // Free sources
        for (self.sources) |*source| {
            source.deinit(self.allocator);
        }
        self.allocator.free(self.sources);
    }

    fn freeJsonValue(allocator: std.mem.Allocator, value: std.json.Value) void {
        switch (value) {
            .string => |s| allocator.free(s),
            .array => |arr| {
                // Recursively free all array items
                for (arr.items) |item| {
                    freeJsonValue(allocator, item);
                }
                allocator.free(arr.items);
            },
            .object => |obj| {
                // Recursively free all object entries
                var iter = obj.iterator();
                while (iter.next()) |entry| {
                    allocator.free(entry.key_ptr.*);
                    freeJsonValue(allocator, entry.value_ptr.*);
                }
                // Free the ObjectMap itself
                var mutable_obj = obj;
                mutable_obj.deinit();
            },
            else => {
                // Primitives (null, bool, integer, float, number_string) don't need freeing
            },
        }
    }
};

/// Merge options for deep merge
pub const MergeOptions = struct {
    strategy: MergeStrategy = .smart,
    allow_undefined: bool = false,
};

test "ConfigSource enum values" {
    try std.testing.expect(@intFromEnum(ConfigSource.file_local) == 0);
    try std.testing.expect(@intFromEnum(ConfigSource.defaults) == 4);
}

test "MergeStrategy enum values" {
    try std.testing.expect(@intFromEnum(MergeStrategy.replace) == 0);
    try std.testing.expect(@intFromEnum(MergeStrategy.smart) == 2);
}

test "LoadOptions default values" {
    const options = LoadOptions{
        .name = "test",
    };

    try std.testing.expectEqual(true, options.validate);
    try std.testing.expectEqual(true, options.cache);
    try std.testing.expectEqual(@as(u64, 300_000), options.cache_ttl);
    try std.testing.expectEqual(MergeStrategy.smart, options.merge_strategy);
}

test "SourceInfo deinit frees path" {
    const allocator = std.testing.allocator;

    var source = SourceInfo{
        .source = .file_local,
        .path = try allocator.dupe(u8, "/path/to/config.json"),
        .priority = 1,
    };
    defer source.deinit(allocator);

    try std.testing.expect(source.path != null);
}
