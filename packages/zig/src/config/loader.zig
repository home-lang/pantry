const std = @import("std");
const zonfig = @import("zonfig");
const ts_parser = @import("ts_parser.zig");

/// Launchpad-specific configuration loader
/// Extends zonfig to support:
/// - TypeScript config files (.config.ts)
/// - Alias config files (e.g., buddy-bot.config.ts)
/// - Multiple config sources with priority
pub const LaunchpadConfigLoader = struct {
    allocator: std.mem.Allocator,
    zonfig_loader: zonfig.config_loader.ConfigLoader,
    ts_parser: ts_parser.TsConfigParser,

    /// File extensions to search for (in priority order)
    const EXTENSIONS = [_][]const u8{ ".config.ts", ".config.json", ".config.zig", ".json" };

    /// Common config directory names
    const CONFIG_DIRS = [_][]const u8{ "", "config", ".config" };

    pub fn init(allocator: std.mem.Allocator) !LaunchpadConfigLoader {
        return LaunchpadConfigLoader{
            .allocator = allocator,
            .zonfig_loader = try zonfig.config_loader.ConfigLoader.init(allocator),
            .ts_parser = ts_parser.TsConfigParser.init(allocator),
        };
    }

    /// Load configuration with launchpad-specific search paths
    /// Searches for:
    /// 1. {name}.config.ts (TypeScript config)
    /// 2. {alias}.config.ts (e.g., buddy-bot.config.ts if alias is buddy-bot)
    /// 3. launchpad.config.ts (default launchpad config)
    /// 4. Standard zonfig search paths
    pub fn load(
        self: *LaunchpadConfigLoader,
        options: LoadOptions,
    ) !zonfig.ConfigResult {
        // Determine CWD
        const cwd = options.cwd orelse blk: {
            var buf: [std.fs.max_path_bytes]u8 = undefined;
            break :blk try std.fs.cwd().realpath(".", &buf);
        };

        // Try to find TypeScript config first
        if (try self.findTsConfig(options.name, options.alias, cwd)) |ts_config_path| {
            defer self.allocator.free(ts_config_path);

            // Parse TypeScript config file
            const ts_content = try std.fs.cwd().readFileAlloc(self.allocator, ts_config_path, 1024 * 1024);
            defer self.allocator.free(ts_content);

            const json_content = try self.ts_parser.parse(ts_content);
            defer self.allocator.free(json_content);

            // Parse JSON into a Value
            const parsed = try std.json.parseFromSlice(
                std.json.Value,
                self.allocator,
                json_content,
                .{},
            );

            // Merge with defaults if provided
            const final_config = if (options.defaults) |defaults| blk: {
                defer parsed.deinit();
                const merged = try zonfig.deepMerge(
                    self.allocator,
                    defaults,
                    parsed.value,
                    .{ .strategy = options.merge_strategy },
                );
                break :blk merged;
            } else parsed.value;

            // Create ConfigResult
            var sources = try self.allocator.alloc(zonfig.SourceInfo, 1);
            sources[0] = zonfig.SourceInfo{
                .source = .typescript,
                .path = try self.allocator.dupe(u8, ts_config_path),
                .priority = 1,
            };

            return zonfig.ConfigResult{
                .config = final_config,
                .source = .typescript,
                .sources = sources,
                .loaded_at = std.time.milliTimestamp(),
                .allocator = self.allocator,
                .parsed_json = if (options.defaults == null) parsed else null,
            };
        }

        // Fall back to standard zonfig loading
        const zonfig_options = zonfig.LoadOptions{
            .name = options.name,
            .defaults = options.defaults,
            .cwd = cwd,
            .validate = options.validate,
            .cache = options.cache,
            .cache_ttl = options.cache_ttl,
            .env_prefix = options.env_prefix,
            .merge_strategy = options.merge_strategy,
        };

        return try self.zonfig_loader.load(zonfig_options);
    }

    /// Find TypeScript config file
    /// Searches for:
    /// - {name}.config.ts
    /// - {alias}.config.ts (if provided)
    /// - launchpad.config.ts (default)
    fn findTsConfig(
        self: *LaunchpadConfigLoader,
        name: []const u8,
        alias: ?[]const u8,
        cwd: []const u8,
    ) !?[]const u8 {
        // Try all config directories
        for (CONFIG_DIRS) |dir| {
            // Try with name
            if (try self.tryConfigFile(dir, name, ".config.ts", cwd)) |path| {
                return path;
            }

            // Try with alias if provided
            if (alias) |a| {
                if (try self.tryConfigFile(dir, a, ".config.ts", cwd)) |path| {
                    return path;
                }
            }

            // Try default launchpad config
            if (try self.tryConfigFile(dir, "launchpad", ".config.ts", cwd)) |path| {
                return path;
            }
        }

        return null;
    }

    /// Try to find a config file with specific directory, name, and extension
    fn tryConfigFile(
        self: *LaunchpadConfigLoader,
        dir: []const u8,
        name: []const u8,
        ext: []const u8,
        cwd: []const u8,
    ) !?[]const u8 {
        const path = if (dir.len == 0)
            try std.fmt.allocPrint(self.allocator, "{s}/{s}{s}", .{ cwd, name, ext })
        else
            try std.fmt.allocPrint(self.allocator, "{s}/{s}/{s}{s}", .{ cwd, dir, name, ext });

        defer self.allocator.free(path);

        std.fs.accessAbsolute(path, .{}) catch return null;
        return try self.allocator.dupe(u8, path);
    }
};

/// Launchpad-specific load options
pub const LoadOptions = struct {
    /// Configuration name (e.g., "launchpad")
    name: []const u8,

    /// Optional alias (e.g., "buddy-bot")
    alias: ?[]const u8 = null,

    /// Default configuration values
    defaults: ?std.json.Value = null,

    /// Current working directory
    cwd: ?[]const u8 = null,

    /// Enable validation
    validate: bool = true,

    /// Enable caching
    cache: bool = true,

    /// Cache TTL in milliseconds
    cache_ttl: u64 = 300_000,

    /// Environment variable prefix
    env_prefix: ?[]const u8 = null,

    /// Merge strategy
    merge_strategy: zonfig.MergeStrategy = .smart,
};

/// Load launchpad configuration
pub fn loadLaunchpadConfig(
    allocator: std.mem.Allocator,
    options: LoadOptions,
) !zonfig.ConfigResult {
    var loader = try LaunchpadConfigLoader.init(allocator);
    return try loader.load(options);
}

test "LaunchpadConfigLoader.findTsConfig finds config files" {
    const allocator = std.testing.allocator;

    var tmp = std.testing.tmpDir(.{});
    defer tmp.cleanup();

    // Create test config file
    const file = try tmp.dir.createFile("test.config.ts", .{});
    defer file.close();
    try file.writeAll("export default { test: true }");

    const cwd = try tmp.dir.realpathAlloc(allocator, ".");
    defer allocator.free(cwd);

    var loader = try LaunchpadConfigLoader.init(allocator);
    const found = try loader.findTsConfig("test", null, cwd);
    defer if (found) |path| allocator.free(path);

    try std.testing.expect(found != null);
    try std.testing.expect(std.mem.endsWith(u8, found.?, "test.config.ts"));
}

test "LaunchpadConfigLoader.findTsConfig finds alias config" {
    const allocator = std.testing.allocator;

    var tmp = std.testing.tmpDir(.{});
    defer tmp.cleanup();

    // Create alias config file
    const file = try tmp.dir.createFile("buddy-bot.config.ts", .{});
    defer file.close();
    try file.writeAll("export default { buddy: true }");

    const cwd = try tmp.dir.realpathAlloc(allocator, ".");
    defer allocator.free(cwd);

    var loader = try LaunchpadConfigLoader.init(allocator);
    const found = try loader.findTsConfig("launchpad", "buddy-bot", cwd);
    defer if (found) |path| allocator.free(path);

    try std.testing.expect(found != null);
    try std.testing.expect(std.mem.endsWith(u8, found.?, "buddy-bot.config.ts"));
}

test "LaunchpadConfigLoader parses TypeScript config" {
    const allocator = std.testing.allocator;

    var tmp = std.testing.tmpDir(.{});
    defer tmp.cleanup();

    // Create TypeScript config file
    const file = try tmp.dir.createFile("test.config.ts", .{});
    defer file.close();
    const ts_config =
        \\import type { LaunchpadConfig } from 'somewhere'
        \\
        \\export const config = {
        \\  name: 'test-project',
        \\  port: 3000,
        \\  enabled: true,
        \\  dependencies: {
        \\    'bun': '^1.2.19',
        \\    'redis.io': '^8.0.0'
        \\  },
        \\  services: {
        \\    autoStart: true
        \\  }
        \\}
        \\
        \\export default config
    ;
    try file.writeAll(ts_config);

    const cwd = try tmp.dir.realpathAlloc(allocator, ".");
    defer allocator.free(cwd);

    var loader = try LaunchpadConfigLoader.init(allocator);
    var result = try loader.load(.{
        .name = "test",
        .cwd = cwd,
    });
    defer result.deinit();

    // Verify it loaded from TypeScript
    try std.testing.expectEqual(zonfig.ConfigSource.typescript, result.source);

    // Verify config contents
    try std.testing.expect(result.config == .object);
    const name = result.config.object.get("name");
    try std.testing.expect(name != null);
    try std.testing.expect(name.? == .string);
    try std.testing.expectEqualStrings("test-project", name.?.string);
}
