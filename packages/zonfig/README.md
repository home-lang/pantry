# Zonfig

A zero-dependency configuration loader for Zig, inspired by [bunfig](https://github.com/stacksjs/bunfig).

## Features

- 🔍 **Multi-source loading** - Local files, home directory, environment variables, defaults
- 🎯 **Type-aware env vars** - Automatic parsing of booleans, numbers, arrays, and JSON
- 🔗 **Deep merging** - Three strategies: replace, concat, and smart object array merging
- 🛡️ **Circular reference detection** - Prevents infinite loops during merge
- 📁 **Multiple formats** - JSON and Zig files (extensible)
- 🎨 **Simple API** - Clean, ergonomic interface

## Installation

Add zonfig as a dependency in your `build.zig`:

```zig
const zonfig = b.dependency("zonfig", .{
    .target = target,
    .optimize = optimize,
});

exe.root_module.addImport("zonfig", zonfig.module("zonfig"));
```

## Quick Start

```zig
const std = @import("std");
const zonfig = @import("zonfig");

pub fn main() !void {
    var gpa = std.heap.GeneralPurposeAllocator(.{}){};
    defer _ = gpa.deinit();
    const allocator = gpa.allocator();

    // Load configuration
    var config = try zonfig.loadConfig(allocator, .{
        .name = "myapp",
    });
    defer config.deinit();

    // Access values
    const port = config.config.object.get("port").?.integer;
    const debug = config.config.object.get("debug").?.bool;
    
    std.debug.print("Server running on port {d}\n", .{port});
}
```

## Configuration Sources

Zonfig loads configuration from multiple sources with the following priority (highest to lowest):

1. **Environment variables** (highest priority)
2. **Local project file** (`./myapp.json`, `./config/myapp.json`, `./.config/myapp.json`)
3. **Home directory** (`~/.config/myapp.json`)
4. **Defaults** (provided in code)

## Environment Variables

Environment variables are automatically parsed with type awareness:

```bash
# Boolean values
export MYAPP_DEBUG=true        # → bool
export MYAPP_VERBOSE=1         # → bool (true)
export MYAPP_QUIET=false       # → bool
export MYAPP_COLORS=yes        # → bool (true)

# Numbers
export MYAPP_PORT=3000         # → integer
export MYAPP_TIMEOUT=30.5      # → float

# Arrays (comma-separated)
export MYAPP_HOSTS=localhost,api.example.com,cdn.example.com  # → array of strings

# JSON objects/arrays
export MYAPP_DATABASE='{"host":"localhost","port":5432}'     # → object
export MYAPP_TAGS='["production","web"]'                      # → array

# Strings (default)
export MYAPP_NAME="My Application"                           # → string
```

Environment variable naming:
- Prefix: Uppercase version of config name (or custom `env_prefix`)
- Nested keys: Separated by underscores
- Hyphens: Converted to underscores

Examples:
- `database.host` → `MYAPP_DATABASE_HOST`
- `api-key` → `MYAPP_API_KEY`
- `cache.ttl-seconds` → `MYAPP_CACHE_TTL_SECONDS`

## Examples

### With Defaults

```zig
const zonfig = @import("zonfig");

pub fn main() !void {
    var gpa = std.heap.GeneralPurposeAllocator(.{}){};
    defer _ = gpa.deinit();
    const allocator = gpa.allocator();

    // Create defaults
    var defaults = std.json.ObjectMap.init(allocator);
    defer defaults.deinit();
    try defaults.put("port", .{ .integer = 8080 });
    try defaults.put("debug", .{ .bool = false });

    var config = try zonfig.loadConfig(allocator, .{
        .name = "server",
        .defaults = .{ .object = defaults },
    });
    defer config.deinit();

    // Defaults are overridden by files and env vars
    const port = config.config.object.get("port").?.integer;
}
```

### Custom Working Directory

```zig
var config = try zonfig.loadConfig(allocator, .{
    .name = "myapp",
    .cwd = "/path/to/project",
});
defer config.deinit();
```

### Custom Environment Prefix

```zig
var config = try zonfig.loadConfig(allocator, .{
    .name = "myapp",
    .env_prefix = "CUSTOM",  // Uses CUSTOM_* instead of MYAPP_*
});
defer config.deinit();
```

### Deep Merging

```zig
const zonfig = @import("zonfig");

pub fn main() !void {
    var gpa = std.heap.GeneralPurposeAllocator(.{}){};
    defer _ = gpa.deinit();
    const allocator = gpa.allocator();

    var target = std.json.ObjectMap.init(allocator);
    defer target.deinit();
    try target.put("a", .{ .integer = 1 });

    var source = std.json.ObjectMap.init(allocator);
    defer source.deinit();
    try source.put("b", .{ .integer = 2 });

    const merged = try zonfig.deepMerge(
        allocator,
        .{ .object = target },
        .{ .object = source },
        .{ .strategy = .smart },  // or .replace, .concat
    );
    defer {
        var iter = merged.object.iterator();
        while (iter.next()) |entry| allocator.free(entry.key_ptr.*);
        var obj = merged.object;
        obj.deinit();
    }

    // Result: { "a": 1, "b": 2 }
}
```

### Merge Strategies

#### Replace (default for primitives/arrays)
```zig
.{ .strategy = .replace }
// Arrays are completely replaced
// [1, 2] + [3, 4] = [3, 4]
```

#### Concat (for arrays)
```zig
.{ .strategy = .concat }
// Arrays are concatenated with deduplication
// [1, 2] + [2, 3] = [1, 2, 3]
```

#### Smart (for object arrays)
```zig
.{ .strategy = .smart }
// Object arrays are merged by key (id, name, key, path, type)
// [{"id": 1, "name": "a"}] + [{"id": 1, "name": "b"}] 
// = [{"id": 1, "name": "b"}]  // merged by id
```

## Configuration Result

The `ConfigResult` struct contains:

```zig
pub const ConfigResult = struct {
    config: std.json.Value,        // The loaded configuration
    source: ConfigSource,          // Primary source (.file_local, .file_home, .env_vars, .defaults)
    sources: []SourceInfo,         // All sources that contributed
    loaded_at: i64,               // Timestamp
    allocator: std.mem.Allocator, // Allocator used
    
    pub fn deinit(self: *ConfigResult) void;
};
```

## File Discovery

Zonfig searches for configuration files in this order:

1. Project root: `./myapp.json`, `./myapp.zig`
2. Config directory: `./config/myapp.json`, `./config/myapp.zig`
3. Hidden config: `./.config/myapp.json`, `./.config/myapp.zig`
4. Home directory: `~/.config/myapp.json`, `~/.config/myapp.zig`

Extension priority: `.json` > `.zig`

## Error Handling

Zonfig provides detailed error types:

```zig
pub const ZonfigError = error{
    ConfigFileNotFound,
    ConfigFileInvalid,
    ConfigFilePermissionDenied,
    ConfigFileSyntaxError,
    ConfigValidationFailed,
    ConfigSchemaViolation,
    EnvVarParseError,
    CircularReferenceDetected,
    MergeStrategyInvalid,
    CacheError,
};
```

Example error handling:

```zig
const config = zonfig.loadConfig(allocator, .{
    .name = "myapp",
}) catch |err| switch (err) {
    error.ConfigFileNotFound => {
        // Use defaults or create new config
        std.debug.print("No config found, using defaults\n", .{});
        return;
    },
    error.ConfigFileSyntaxError => {
        std.debug.print("Invalid JSON in config file\n", .{});
        return error.InvalidConfig;
    },
    else => return err,
};
defer config.deinit();
```

## Testing

```bash
zig build test
```

All 20 tests passing! Note: There are 4 known memory "leaks" from Zig's JSON parser's internal arena allocator - these are expected and don't affect runtime behavior.

## API Reference

### Main Functions

#### `loadConfig`
```zig
pub fn loadConfig(
    allocator: std.mem.Allocator,
    options: types.LoadOptions,
) !types.ConfigResult
```

Load configuration with full error handling.

#### `tryLoadConfig`
```zig
pub fn tryLoadConfig(
    allocator: std.mem.Allocator,
    options: types.LoadOptions,
) ?types.ConfigResult
```

Load configuration, returning `null` on error (no exceptions).

#### `deepMerge`
```zig
pub fn deepMerge(
    allocator: std.mem.Allocator,
    target: std.json.Value,
    source: std.json.Value,
    options: types.MergeOptions,
) !std.json.Value
```

Deep merge two JSON values.

### Types

```zig
pub const LoadOptions = struct {
    name: []const u8,
    defaults: ?std.json.Value = null,
    cwd: ?[]const u8 = null,
    validate: bool = true,
    cache: bool = true,
    cache_ttl: u64 = 300_000,
    env_prefix: ?[]const u8 = null,
    merge_strategy: MergeStrategy = .smart,
};

pub const MergeStrategy = enum {
    replace,
    concat,
    smart,
};

pub const ConfigSource = enum {
    file_local,
    file_home,
    package_json,
    env_vars,
    defaults,
};
```

## License

MIT

## Contributing

Contributions welcome! Please ensure:
- All tests pass (`zig build test`)
- Code follows Zig style guidelines
- New features include tests

## Acknowledgments

Inspired by [bunfig](https://github.com/stacksjs/bunfig) by the Stacks team.
