# API Reference

Complete API documentation for pantry's public interfaces.

## Table of Contents

- [Core API](#core-api)
- [Cache API](#cache-api)
- [Package API](#package-api)
- [Environment API](#environment-api)
- [Shell API](#shell-api)
- [Installation API](#installation-api)
- [Service API](#service-api)
- [CLI API](#cli-api)

---

## Core API

### Platform Detection

```zig
const pantry = @import("pantry");

// Get current platform
const platform = pantry.core.Platform.current();
// Returns: .darwin, .linux, or .windows

// Platform-specific paths
const home_dir = try pantry.core.Platform.homeDir(allocator);
const cache_dir = try pantry.core.Platform.cacheDir(allocator);
```

### String Utilities

```zig
const pantry = @import("pantry");

// Fast hashing (FNV-1a for strings < 32 bytes)
const hash = pantry.string.fnv1aHash("my-string");

// MD5 hashing for larger strings
const md5 = pantry.string.md5Hash("larger-string-content");

// String interning (for pointer equality)
var pool = try pantry.string.StringPool.init(allocator);
defer pool.deinit();

const str1 = try pool.intern("hello");
const str2 = try pool.intern("hello");
// str1 == str2 (pointer equality!)
```

### Error Handling

```zig
const pantry = @import("pantry");

// All pantry errors
const PantryError = pantry.core.PantryError;

// Common error types
PantryError.NetworkError
PantryError.CacheError
PantryError.InstallError
PantryError.PackageNotFound
PantryError.VersionConflict
```

---

## Cache API

### Environment Cache

```zig
const pantry = @import("pantry");

// Initialize cache
var cache = try pantry.cache.EnvCache.init(allocator);
defer cache.deinit();

// Store entry
try cache.put("project-hash", pantry.cache.EnvCacheEntry{
    .path = "/path/to/env",
    .created_at = std.time.timestamp(),
    .last_validated = std.time.timestamp(),
    .dep_mtime = 1234567890,
});

// Retrieve entry
if (try cache.get("project-hash")) |entry| {
    std.debug.print("Environment: {s}\n", .{entry.path});
}

// Remove expired entries
try cache.cleanup();
```

### Package Cache

```zig
const pantry = @import("pantry");

// Initialize package cache
var pkg_cache = try pantry.cache.PackageCache.init(allocator);
defer pkg_cache.deinit();

// Store package
try pkg_cache.put("react@18.2.0", pantry.cache.PackageCacheEntry{
    .tarball_path = "/cache/react-18.2.0.tgz",
    .sha256 = "abcdef123456...",
    .cached_at = std.time.timestamp(),
});

// Retrieve package
if (try pkg_cache.get("react@18.2.0")) |entry| {
    std.debug.print("Cached at: {s}\n", .{entry.tarball_path});
}
```

---

## Package API

### Package Types

```zig
const pantry = @import("pantry");

// Package specification
const spec = pantry.packages.PackageSpec{
    .name = "react",
    .version = "18.2.0",
    .source = .npm,
};

// Package metadata
const metadata = pantry.packages.PackageMetadata{
    .name = "my-package",
    .version = "1.0.0",
    .description = "A great package",
    .author = "Author Name",
    .license = "MIT",
    .repository = "https://github.com/user/repo",
    .dependencies = deps_map,
};
```

### Package Publishing

```zig
const pantry = @import("pantry");

// Extract metadata from config
var metadata = try pantry.packages.extractMetadata(
    allocator,
    "pantry.json",
);
defer metadata.deinit(allocator);

// Validate package
try pantry.packages.validatePackageName(metadata.name);
try pantry.packages.validateVersion(metadata.version);

// Find package config
const config_path = try pantry.packages.findPackageConfig(allocator, ".");
defer allocator.free(config_path);
```

---

## Environment API

### Environment Manager

```zig
const pantry = @import("pantry");

// Initialize manager
var manager = try pantry.env.EnvironmentManager.init(allocator);
defer manager.deinit();

// Create environment
const env_name = try manager.create(
    "/path/to/project",
    "pantry.json",
);
defer allocator.free(env_name);

// Load environment
const env_path = try manager.load(env_name);
defer allocator.free(env_path);

// List environments
const envs = try manager.list();
defer {
    for (envs) |env| allocator.free(env);
    allocator.free(envs);
}

// Remove environment
try manager.remove(env_name);

// Clean unused environments
const removed = try manager.clean();
std.debug.print("Removed {d} environments\n", .{removed});
```

---

## Shell API

### Shell Integration

```zig
const pantry = @import("pantry");

// Detect current shell
const shell_type = pantry.shell.detectShell();
// Returns: .zsh, .bash, .fish, or .unknown

// Generate hook for shell
const hook = try pantry.shell.generateHook(allocator, shell_type);
defer allocator.free(hook);

// Install shell integration
try pantry.shell.integrate(allocator, shell_type, "/Users/user");
```

### Shell Activation

```zig
const pantry = @import("pantry");

// Initialize shell commands
var shell_cmds = try pantry.shell.ShellCommands.init(allocator, &env_cache);
defer shell_cmds.deinit();

// Activate environment for current directory
const activation_script = try shell_cmds.activate("/path/to/project");
defer allocator.free(activation_script);

// Output contains shell code to modify PATH
std.debug.print("{s}\n", .{activation_script});
```

---

## Installation API

### Package Installation

```zig
const pantry = @import("pantry");

// Install packages from current directory
const result = try pantry.install.installCommand(allocator, &[_][]const u8{});
defer result.deinit(allocator);

if (result.exit_code != 0) {
    std.debug.print("Install failed: {s}\n", .{result.message});
}

// Install with options
const options = pantry.install.InstallOptions{
    .production = true,  // Skip devDependencies
    .verbose = true,     // Verbose output
};

const result = try pantry.install.installCommandWithOptions(
    allocator,
    &[_][]const u8{},
    options,
);
```

### Package Installer

```zig
const pantry = @import("pantry");

// Initialize installer
var installer = try pantry.install.Installer.init(allocator);
defer installer.deinit();

// Install single package
try installer.install(pantry.packages.PackageSpec{
    .name = "react",
    .version = "18.2.0",
    .source = .npm,
});

// Install from cache
const cached = try installer.installFromCache("react@18.2.0");

// List installed packages
const packages = try installer.list();
defer {
    for (packages) |pkg| allocator.free(pkg);
    allocator.free(packages);
}

// Uninstall package
try installer.uninstall("react");
```

---

## Service API

### Service Management

```zig
const pantry = @import("pantry");

// Get service definition
const nginx_def = pantry.services.Services.getDefinition("nginx");
if (nginx_def) |def| {
    std.debug.print("Port: {d}\n", .{def.port.?});
}

// Start service
try pantry.services.start(allocator, "nginx");

// Stop service
try pantry.services.stop(allocator, "nginx");

// Restart service
try pantry.services.restart(allocator, "nginx");

// Get status
const status = try pantry.services.status(allocator, "nginx");
defer allocator.free(status);

// Enable service (auto-start on boot)
try pantry.services.enable(allocator, "nginx");

// Disable service
try pantry.services.disable(allocator, "nginx");
```

### Custom Service Definitions

```zig
const pantry = @import("pantry");

const my_service = pantry.services.ServiceDefinition{
    .name = "my-app",
    .display_name = "My Application",
    .port = 3000,
    .command = "/usr/local/bin/my-app",
    .args = &[_][]const u8{"--port", "3000"},
    .working_directory = "/var/lib/my-app",
    .environment = &[_]pantry.services.EnvVar{
        .{ .key = "NODE_ENV", .value = "production" },
        .{ .key = "PORT", .value = "3000" },
    },
    .log_path = "/var/log/my-app.log",
    .error_log_path = "/var/log/my-app.error.log",
};

// Register custom service
try pantry.services.register(my_service);
```

---

## CLI API

### Command Execution

```zig
const pantry = @import("pantry");

// Install command
const install_result = try pantry.commands.installCommand(
    allocator,
    &[_][]const u8{"react", "vue"},
);

// Add package
const add_result = try pantry.commands.addCommand(
    allocator,
    &[_][]const u8{"lodash"},
);

// Remove package
const remove_result = try pantry.commands.removeCommand(
    allocator,
    &[_][]const u8{"lodash"},
);

// Update packages
const update_result = try pantry.commands.updateCommand(
    allocator,
    &[_][]const u8{},  // Empty = update all
);

// List packages
const list_result = try pantry.commands.listCommand(allocator);
```

### Cache Commands

```zig
const pantry = @import("pantry");

// Cache stats
const stats = try pantry.commands.cacheStatsCommand(allocator);
defer stats.deinit(allocator);

std.debug.print("{s}\n", .{stats.message});

// Clear cache
const clear = try pantry.commands.cacheClearCommand(allocator);
defer clear.deinit(allocator);
```

### Environment Commands

```zig
const pantry = @import("pantry");

// List environments
const list_envs = try pantry.commands.envListCommand(allocator);
defer list_envs.deinit(allocator);

// Remove environment
const remove_env = try pantry.commands.envRemoveCommand(
    allocator,
    "env-hash-123",
);

// Clean environments
const clean_envs = try pantry.commands.envCleanCommand(allocator);
```

---

## Type Reference

### InstallOptions

```zig
pub const InstallOptions = struct {
    production: bool = false,      // Skip devDependencies
    dev_only: bool = false,         // Install devDependencies only
    include_peer: bool = false,     // Include peerDependencies
    ignore_scripts: bool = false,   // Don't run lifecycle scripts
    verbose: bool = false,          // Verbose output
    filter: ?[]const u8 = null,     // Filter pattern for workspace packages
};
```

### PackageSpec

```zig
pub const PackageSpec = struct {
    name: []const u8,
    version: []const u8,
    source: PackageSource,
};

pub const PackageSource = enum {
    npm,
    git,
    local,
    tarball,
};
```

### CommandResult

```zig
pub const CommandResult = struct {
    exit_code: u8,
    message: ?[]const u8 = null,

    pub fn deinit(self: *CommandResult, allocator: std.mem.Allocator) void;
};
```

### ServiceDefinition

```zig
pub const ServiceDefinition = struct {
    name: []const u8,
    display_name: []const u8,
    port: ?u16 = null,
    command: []const u8,
    args: []const []const u8,
    working_directory: ?[]const u8 = null,
    environment: []const EnvVar = &[_]EnvVar{},
    log_path: ?[]const u8 = null,
    error_log_path: ?[]const u8 = null,
};

pub const EnvVar = struct {
    key: []const u8,
    value: []const u8,
};
```

---

## Error Handling

All pantry functions return Zig errors. Common error handling pattern:

```zig
const result = pantry.install.installCommand(allocator, args) catch |err| {
    switch (err) {
        error.PackageNotFound => std.debug.print("Package not found\n", .{}),
        error.NetworkError => std.debug.print("Network error\n", .{}),
        error.VersionConflict => std.debug.print("Version conflict\n", .{}),
        else => return err,
    }
};
```

---

## Memory Management

Pantry follows Zig's allocator pattern. All functions that allocate memory require an allocator parameter and return memory that must be freed by the caller.

```zig
// Pattern for single allocation
const result = try someFunction(allocator);
defer allocator.free(result);

// Pattern for struct with deinit
var instance = try SomeStruct.init(allocator);
defer instance.deinit();

// Pattern for slices of allocated items
const items = try getItems(allocator);
defer {
    for (items) |item| allocator.free(item);
    allocator.free(items);
}
```

---

## Thread Safety

### Thread-Safe Components
- `EnvCache` - Uses RwLock for concurrent access
- `PackageCache` - Lock-free reads, RCU writes
- `Installer` - Safe for concurrent installs of different packages

### Non-Thread-Safe Components
- `EnvironmentManager` - Use mutex if shared across threads
- `ShellCommands` - Create per-thread instance

```zig
// Safe concurrent cache access
var cache = try pantry.cache.EnvCache.init(allocator);
defer cache.deinit();

// Multiple threads can read concurrently
const entry = try cache.get("key");  // Thread-safe read

// Writes are synchronized internally
try cache.put("key", value);  // Thread-safe write
```

---

## Performance Tips

1. **Reuse allocators** - Use arena allocators for batch operations
2. **Cache results** - EnvCache has <50μs lookups
3. **Batch installations** - Install multiple packages in one call
4. **Use comptime** - Leverage compile-time string interning
5. **Profile first** - Use `zig build bench` for bottlenecks

```zig
// Good: Arena allocator for batch operations
var arena = std.heap.ArenaAllocator.init(std.heap.page_allocator);
defer arena.deinit();
const allocator = arena.allocator();

// Install many packages without individual frees
for (packages) |pkg| {
    try installer.install(pkg);
}
// All freed at once with arena.deinit()
```
