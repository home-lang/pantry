# Multi-Registry Support

Pantry supports multiple package registries with flexible configuration, authentication, and automatic fallback. This enables you to fetch packages from npm, custom registries, GitHub packages, and pkgx simultaneously.

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Registry Types](#registry-types)
- [Configuration](#configuration)
- [Authentication](#authentication)
- [Priority and Fallback](#priority-and-fallback)
- [API Reference](#api-reference)
- [Examples](#examples)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Overview

The multi-registry system provides:

- **Multiple Registry Support**: Use npm, custom HTTP registries, GitHub packages, and pkgx
- **Unified Interface**: All registries implement the same interface for consistent usage
- **Flexible Authentication**: Support for bearer tokens, basic auth, OIDC, and custom headers
- **Priority-Based Fallback**: Automatic fallback to alternative registries if primary fails
- **JSON Configuration**: Easy configuration through pantry.json
- **Runtime Management**: Add, remove, enable/disable registries at runtime

## Quick Start

### 1. Configure Registries

Create or update your `pantry.json`:

```json
{
  "registries": [
    {
      "name": "npm",
      "type": "npm",
      "url": "https://registry.npmjs.org",
      "priority": 10,
      "enabled": true
    },
    {
      "name": "my-registry",
      "type": "custom",
      "url": "https://registry.mycompany.com",
      "priority": 20,
      "auth": {
        "type": "bearer",
        "token": "your-token-here"
      }
    }
  ]
}
```

### 2. Use in Code

```zig
const std = @import("std");
const pantry = @import("pantry");

pub fn main() !void {
    const allocator = std.heap.page_allocator;

    // Initialize registry manager
    var manager = pantry.registry.core.RegistryManager.init(allocator);
    defer manager.deinit();

    // Add npm registry
    const npm_config = try pantry.registry.core.RegistryConfig.npm(allocator);
    try manager.addRegistry(npm_config);

    // Get default registry and create interface
    const default_reg = manager.getDefaultRegistry() orelse return error.NoRegistry;
    var npm_registry = try pantry.registry.npm.NpmRegistry.init(allocator, default_reg.*);
    defer npm_registry.deinit();

    const registry_interface = npm_registry.interface();

    // Fetch package metadata
    const metadata = try registry_interface.fetchMetadata(
        allocator,
        "lodash",
        "4.17.21",
    );
    defer {
        var mut_metadata = metadata;
        mut_metadata.deinit(allocator);
    }

    std.debug.print("Package: {s}@{s}\n", .{ metadata.name, metadata.version });
    if (metadata.description) |desc| {
        std.debug.print("Description: {s}\n", .{desc});
    }
}
```

## Registry Types

### 1. pkgx Registry

The default registry for pkgx packages.

**Features**:
- Native pkgx package support
- Fast, CDN-backed distribution
- Platform-specific binaries

**Configuration**:
```zig
const config = try pantry.registry.core.RegistryConfig.pkgx(allocator);
```

**JSON**:
```json
{
  "name": "pkgx",
  "type": "pkgx",
  "url": "https://dist.pkgx.dev",
  "priority": 10
}
```

### 2. npm Registry

Full npm registry support with package fetching, search, and version listing.

**Features**:
- Access to all npm packages
- Version resolution (latest, specific versions)
- Search functionality
- Tarball downloads

**Configuration**:
```zig
const config = try pantry.registry.core.RegistryConfig.npm(allocator);
```

**JSON**:
```json
{
  "name": "npm",
  "type": "npm",
  "url": "https://registry.npmjs.org",
  "priority": 20,
  "auth": {
    "type": "bearer",
    "token": "your-npm-token"
  }
}
```

**API Endpoints Used**:
- `GET /{package}` - Package metadata
- `GET /{package}/{version}` - Specific version
- `GET /-/v1/search?text={query}` - Package search
- `GET /{package}/tarball/{version}` - Tarball download

### 3. GitHub Packages

GitHub package registry support.

**Features**:
- GitHub releases and packages
- Organization package support
- GitHub token authentication

**Configuration**:
```zig
const config = try pantry.registry.core.RegistryConfig.github(allocator);
```

**JSON**:
```json
{
  "name": "github",
  "type": "github",
  "url": "https://api.github.com",
  "priority": 30,
  "auth": {
    "type": "bearer",
    "token": "ghp_your_github_token"
  }
}
```

### 4. Custom HTTP Registry

Support for any custom registry following the pantry REST convention.

**Features**:
- Flexible REST API
- Multiple authentication methods
- Custom headers support

**REST API Convention**:
```
GET  /packages/{name}                    - Get package metadata
GET  /packages/{name}/{version}          - Get specific version
GET  /packages/{name}/{version}/tarball  - Download tarball
GET  /packages/{name}/versions           - List all versions
GET  /search?q={query}                   - Search packages
POST /packages                           - Publish package
```

**Configuration**:
```zig
var config = pantry.registry.core.RegistryConfig{
    .type = .custom,
    .url = try allocator.dupe(u8, "https://registry.example.com"),
    .auth = .{ .bearer = try allocator.dupe(u8, "secret-token") },
    .priority = 40,
    .name = try allocator.dupe(u8, "my-registry"),
};
```

**JSON**:
```json
{
  "name": "my-registry",
  "type": "custom",
  "url": "https://registry.example.com",
  "priority": 40,
  "auth": {
    "type": "bearer",
    "token": "secret-token"
  }
}
```

## Configuration

### JSON Configuration Format

```json
{
  "registries": [
    {
      "name": "string",         // Registry identifier (required)
      "type": "string",         // Registry type: pkgx, npm, github, custom
      "url": "string",          // Base URL (required)
      "priority": 10,           // Lower = higher priority (default: 100)
      "enabled": true,          // Enable/disable (default: true)
      "auth": {                 // Authentication (optional)
        "type": "string",       // Auth type: bearer, basic, oidc, custom
        "token": "string",      // For bearer and oidc
        "username": "string",   // For basic auth
        "password": "string",   // For basic auth
        "name": "string",       // For custom header
        "value": "string"       // For custom header
      }
    }
  ]
}
```

### Loading Configuration

```zig
const std = @import("std");
const pantry = @import("pantry");

pub fn loadRegistries(allocator: std.mem.Allocator) !pantry.registry.core.RegistryManager {
    var manager = pantry.registry.core.RegistryManager.init(allocator);

    // Read configuration file
    const config_file = try std.fs.cwd().openFile("pantry.json", .{});
    defer config_file.close();

    const config_content = try config_file.readToEndAlloc(allocator, 10 * 1024 * 1024);
    defer allocator.free(config_content);

    // Parse JSON
    const parsed = try std.json.parseFromSlice(std.json.Value, allocator, config_content, .{});
    defer parsed.deinit();

    // Load registries
    try manager.loadFromConfig(parsed.value);

    return manager;
}
```

### Setting Default Registry

```zig
// Set by name
try manager.setDefaultRegistry("npm");

// Get default
const default_reg = manager.getDefaultRegistry();
if (default_reg) |reg| {
    std.debug.print("Default: {s}\n", .{reg.name.?});
}
```

## Authentication

### 1. No Authentication

```zig
.auth = .none
```

```json
{
  "auth": null
}
```

### 2. Bearer Token

For npm, GitHub, and custom registries.

```zig
.auth = .{ .bearer = try allocator.dupe(u8, "your-token-here") }
```

```json
{
  "auth": {
    "type": "bearer",
    "token": "your-token-here"
  }
}
```

**HTTP Header**:
```
Authorization: Bearer your-token-here
```

### 3. Basic Authentication

Username and password authentication.

```zig
.auth = .{
    .basic = .{
        .username = try allocator.dupe(u8, "user"),
        .password = try allocator.dupe(u8, "pass"),
    },
}
```

```json
{
  "auth": {
    "type": "basic",
    "username": "user",
    "password": "pass"
  }
}
```

**HTTP Header**:
```
Authorization: Basic dXNlcjpwYXNz
```

### 4. OIDC Token

For CI/CD environments (GitHub Actions, GitLab CI, etc.).

```zig
.auth = .{ .oidc = try allocator.dupe(u8, "oidc-token") }
```

```json
{
  "auth": {
    "type": "oidc",
    "token": "oidc-token"
  }
}
```

### 5. Custom Header

For registries with custom authentication schemes.

```zig
.auth = .{
    .custom = .{
        .name = try allocator.dupe(u8, "X-API-Key"),
        .value = try allocator.dupe(u8, "api-key-value"),
    },
}
```

```json
{
  "auth": {
    "type": "custom",
    "name": "X-API-Key",
    "value": "api-key-value"
  }
}
```

## Priority and Fallback

### Priority System

Registries are sorted by priority (lower number = higher priority). When searching for a package, pantry tries registries in priority order until it finds the package.

**Example**:
```json
{
  "registries": [
    {
      "name": "primary",
      "priority": 1      // Tried first
    },
    {
      "name": "fallback1",
      "priority": 2      // Tried second
    },
    {
      "name": "fallback2",
      "priority": 3      // Tried third
    }
  ]
}
```

### Enabling/Disabling Registries

```zig
// Disable a registry
manager.registries.items[0].enabled = false;

// Get next enabled registry
for (manager.registries.items) |*reg| {
    if (reg.enabled) {
        // Use this registry
        break;
    }
}
```

```json
{
  "registries": [
    {
      "name": "npm",
      "enabled": false    // Temporarily disabled
    }
  ]
}
```

### Fallback Example

```zig
pub fn fetchWithFallback(
    allocator: std.mem.Allocator,
    manager: *pantry.registry.core.RegistryManager,
    package_name: []const u8,
    version: ?[]const u8,
) !pantry.registry.core.PackageMetadata {
    for (manager.registries.items) |*reg_config| {
        if (!reg_config.enabled) continue;

        // Try this registry
        const result = tryFetchFromRegistry(
            allocator,
            reg_config,
            package_name,
            version,
        ) catch |err| {
            std.debug.print("Registry {s} failed: {}\n", .{ reg_config.name.?, err });
            continue; // Try next registry
        };

        return result; // Success!
    }

    return error.PackageNotFoundInAnyRegistry;
}
```

## API Reference

### RegistryManager

Main manager for multiple registries.

#### `init(allocator: std.mem.Allocator) RegistryManager`

Create a new registry manager.

#### `deinit(self: *RegistryManager) void`

Clean up resources.

#### `addRegistry(self: *RegistryManager, config: RegistryConfig) !void`

Add a registry. Automatically sorts by priority.

#### `getRegistry(self: *const RegistryManager, name: []const u8) ?*const RegistryConfig`

Get registry by name.

#### `getRegistryByType(self: *const RegistryManager, type: RegistryType) ?*const RegistryConfig`

Get first enabled registry of specified type.

#### `getDefaultRegistry(self: *const RegistryManager) ?*const RegistryConfig`

Get the default (highest priority) registry.

#### `setDefaultRegistry(self: *RegistryManager, name: []const u8) !void`

Set a specific registry as default.

#### `loadFromConfig(self: *RegistryManager, config: std.json.Value) !void`

Load registries from JSON configuration.

### RegistryInterface

Common interface for all registry types.

#### `fetchMetadata(allocator, package_name, version) !PackageMetadata`

Fetch package metadata.

**Parameters**:
- `allocator`: Memory allocator
- `package_name`: Package name
- `version`: Optional version (null for latest)

**Returns**: `PackageMetadata` with package information

#### `downloadTarball(allocator, package_name, version, dest_path) !void`

Download package tarball.

**Parameters**:
- `allocator`: Memory allocator
- `package_name`: Package name
- `version`: Package version
- `dest_path`: Destination file path

#### `search(allocator, query) ![]PackageMetadata`

Search for packages.

**Parameters**:
- `allocator`: Memory allocator
- `query`: Search query string

**Returns**: Array of matching packages

#### `listVersions(allocator, package_name) ![][]const u8`

List all available versions.

**Parameters**:
- `allocator`: Memory allocator
- `package_name`: Package name

**Returns**: Array of version strings

### PackageMetadata

Package information structure.

```zig
pub const PackageMetadata = struct {
    name: []const u8,
    version: []const u8,
    description: ?[]const u8,
    repository: ?[]const u8,
    homepage: ?[]const u8,
    license: ?[]const u8,
    tarball_url: ?[]const u8,
    checksum: ?[]const u8,
    dependencies: ?std.StringHashMap([]const u8),
    dev_dependencies: ?std.StringHashMap([]const u8),

    pub fn deinit(self: *PackageMetadata, allocator: std.mem.Allocator) void;
};
```

## Examples

### Example 1: Using Multiple Registries

```zig
const std = @import("std");
const pantry = @import("pantry");

pub fn main() !void {
    const allocator = std.heap.page_allocator;

    var manager = pantry.registry.core.RegistryManager.init(allocator);
    defer manager.deinit();

    // Add multiple registries
    try manager.addRegistry(try pantry.registry.core.RegistryConfig.npm(allocator));
    try manager.addRegistry(try pantry.registry.core.RegistryConfig.github(allocator));

    // Add custom registry
    var custom_config = pantry.registry.core.RegistryConfig{
        .type = .custom,
        .url = try allocator.dupe(u8, "https://registry.mycompany.com"),
        .priority = 15,
        .name = try allocator.dupe(u8, "company"),
        .auth = .{ .bearer = try allocator.dupe(u8, "token") },
    };
    try manager.addRegistry(custom_config);

    // Get registry by type
    const npm_reg = manager.getRegistryByType(.npm);
    if (npm_reg) |reg| {
        std.debug.print("NPM registry: {s}\n", .{reg.url});
    }
}
```

### Example 2: Searching Across Registries

```zig
pub fn searchAllRegistries(
    allocator: std.mem.Allocator,
    manager: *pantry.registry.core.RegistryManager,
    query: []const u8,
) !void {
    var all_results = std.ArrayList(pantry.registry.core.PackageMetadata).init(allocator);
    defer {
        for (all_results.items) |*result| {
            result.deinit(allocator);
        }
        all_results.deinit();
    }

    for (manager.registries.items) |*reg_config| {
        if (!reg_config.enabled) continue;

        // Create appropriate registry implementation
        if (reg_config.type == .npm) {
            var npm_registry = try pantry.registry.npm.NpmRegistry.init(
                allocator,
                reg_config.*,
            );
            defer npm_registry.deinit();

            const results = npm_registry.search(allocator, query) catch continue;
            defer allocator.free(results);

            try all_results.appendSlice(results);
        }
    }

    // Display results
    for (all_results.items) |result| {
        std.debug.print("{s}@{s}\n", .{ result.name, result.version });
    }
}
```

### Example 3: Custom Registry with Authentication

```zig
pub fn setupPrivateRegistry(allocator: std.mem.Allocator) !pantry.registry.custom.CustomRegistry {
    var config = pantry.registry.core.RegistryConfig{
        .type = .custom,
        .url = try allocator.dupe(u8, "https://registry.private.com"),
        .priority = 1,
        .name = try allocator.dupe(u8, "private"),
        .auth = .{
            .basic = .{
                .username = try allocator.dupe(u8, "admin"),
                .password = try allocator.dupe(u8, "secret"),
            },
        },
    };

    return try pantry.registry.custom.CustomRegistry.init(allocator, config);
}
```

### Example 4: Implementing Custom Registry Server

Here's a minimal custom registry server that follows the pantry REST convention:

```javascript
// Node.js/Express example
const express = require('express');
const app = express();

// Package metadata
app.get('/packages/:name', (req, res) => {
  res.json({
    name: req.params.name,
    version: '1.0.0',
    description: 'Example package',
    tarballUrl: `https://registry.example.com/packages/${req.params.name}/1.0.0/tarball`,
    checksum: 'sha256:abc123...'
  });
});

// Specific version
app.get('/packages/:name/:version', (req, res) => {
  res.json({
    name: req.params.name,
    version: req.params.version,
    description: 'Example package',
    tarballUrl: `https://registry.example.com/packages/${req.params.name}/${req.params.version}/tarball`,
    checksum: 'sha256:abc123...'
  });
});

// Tarball download
app.get('/packages/:name/:version/tarball', (req, res) => {
  res.sendFile(`/path/to/${req.params.name}-${req.params.version}.tgz`);
});

// List versions
app.get('/packages/:name/versions', (req, res) => {
  res.json({
    versions: ['1.0.0', '1.0.1', '1.1.0']
  });
});

// Search
app.get('/search', (req, res) => {
  res.json({
    results: [
      { name: 'package1', version: '1.0.0', description: 'Package 1' },
      { name: 'package2', version: '2.0.0', description: 'Package 2' }
    ]
  });
});

app.listen(3000);
```

## Best Practices

### 1. Registry Priority

- Set lower priority numbers for more reliable registries
- Use private/company registries as primary (priority 1-10)
- Use public registries as fallback (priority 11+)

### 2. Authentication

- **Never commit tokens** to version control
- Use environment variables for sensitive credentials:
  ```json
  {
    "auth": {
      "type": "bearer",
      "token": "${REGISTRY_TOKEN}"
    }
  }
  ```
- Rotate tokens regularly
- Use OIDC in CI/CD environments

### 3. Error Handling

- Always implement fallback logic
- Log registry failures for debugging
- Use timeout settings appropriately

### 4. Performance

- Cache registry responses when possible
- Use CDN-backed registries for better performance
- Consider geographic proximity when choosing registries

### 5. Security

- Use HTTPS for all registry URLs
- Verify package checksums
- Implement signature verification for critical packages
- Use authentication for private registries

## Troubleshooting

### Package Not Found

**Problem**: Package exists but can't be found.

**Solutions**:
1. Check registry is enabled: `"enabled": true`
2. Verify authentication credentials
3. Check priority order
4. Test registry URL manually: `curl https://registry.url/packages/name`

### Authentication Failures

**Problem**: 401 or 403 errors.

**Solutions**:
1. Verify token is valid and not expired
2. Check token has correct permissions
3. Ensure auth type matches registry requirements
4. Test authentication manually:
   ```bash
   curl -H "Authorization: Bearer TOKEN" https://registry.url/packages/test
   ```

### Registry Timeout

**Problem**: Registry requests timing out.

**Solutions**:
1. Check network connectivity
2. Verify registry URL is correct
3. Use fallback registries
4. Increase timeout settings

### Priority Issues

**Problem**: Wrong registry being used.

**Solutions**:
1. Check priority numbers (lower = higher priority)
2. Verify default registry setting
3. Ensure desired registry is enabled
4. List registries: `manager.registries.items`

### JSON Configuration Errors

**Problem**: Configuration not loading.

**Solutions**:
1. Validate JSON syntax: `jq . pantry.json`
2. Check required fields (name, type, url)
3. Verify auth object structure
4. Check for trailing commas

### Custom Registry Protocol Mismatch

**Problem**: Custom registry not working.

**Solutions**:
1. Verify REST API endpoints match convention
2. Check response JSON format
3. Ensure proper CORS headers if web-based
4. Test endpoints manually with curl

## Integration with Existing Commands

### Install Command

```zig
// In install.zig
pub fn installPackage(
    allocator: std.mem.Allocator,
    package_name: []const u8,
    version: ?[]const u8,
) !void {
    // Load registry manager
    var manager = try loadRegistries(allocator);
    defer manager.deinit();

    // Try each registry until success
    for (manager.registries.items) |*reg_config| {
        if (!reg_config.enabled) continue;

        const metadata = fetchFromRegistry(
            allocator,
            reg_config,
            package_name,
            version,
        ) catch continue;
        defer {
            var mut_metadata = metadata;
            mut_metadata.deinit(allocator);
        }

        // Download and install
        try downloadAndInstall(allocator, metadata);
        return;
    }

    return error.PackageNotFound;
}
```

### Search Command

```zig
// In search.zig
pub fn searchPackages(
    allocator: std.mem.Allocator,
    query: []const u8,
) !void {
    var manager = try loadRegistries(allocator);
    defer manager.deinit();

    // Search all enabled registries
    for (manager.registries.items) |*reg_config| {
        if (!reg_config.enabled) continue;

        std.debug.print("\nSearching {s}...\n", .{reg_config.name.?});

        // Search this registry
        const results = searchRegistry(allocator, reg_config, query) catch continue;
        defer {
            for (results) |*result| {
                result.deinit(allocator);
            }
            allocator.free(results);
        }

        // Display results
        for (results) |result| {
            std.debug.print("  {s}@{s}\n", .{ result.name, result.version });
            if (result.description) |desc| {
                std.debug.print("    {s}\n", .{desc});
            }
        }
    }
}
```

## Future Enhancements

Planned features for future releases:

1. **Registry Mirroring**: Automatically mirror packages between registries
2. **Caching Layer**: Local cache for registry responses
3. **Health Checks**: Automatic registry health monitoring
4. **Load Balancing**: Distribute requests across multiple registry mirrors
5. **Metrics**: Registry usage statistics and performance metrics
6. **Proxy Support**: HTTP/HTTPS proxy configuration
7. **Custom Protocol Adapters**: Support for registries with different protocols
8. **Registry Discovery**: Automatic discovery of available registries

## Contributing

To add support for a new registry type:

1. Create a new file in `src/registry/` (e.g., `pypi.zig`)
2. Implement the `RegistryInterface` vtable
3. Add the registry type to `RegistryType` enum in `core.zig`
4. Export the module in `src/lib.zig`
5. Add tests in `test/registry_integration_test.zig`
6. Update this documentation

## See Also

- [Publishing and Security](./PUBLISHING_SECURITY.md)
- [Configuration Guide](./CONFIGURATION.md)
- [API Reference](./API.md)
