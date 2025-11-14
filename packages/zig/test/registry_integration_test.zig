const std = @import("std");
const testing = std.testing;

const core = @import("../src/registry/core.zig");
const npm = @import("../src/registry/npm.zig");
const custom = @import("../src/registry/custom.zig");

// ============================================================================
// Registry Manager Tests
// ============================================================================

test "RegistryManager - add and retrieve registries" {
    const allocator = testing.allocator;

    var manager = core.RegistryManager.init(allocator);
    defer manager.deinit();

    // Add pkgx registry
    const pkgx_config = try core.RegistryConfig.pkgx(allocator);
    try manager.addRegistry(pkgx_config);

    // Add npm registry
    const npm_config = try core.RegistryConfig.npm(allocator);
    try manager.addRegistry(npm_config);

    // Get by name
    const pkgx_reg = manager.getRegistry("pkgx");
    try testing.expect(pkgx_reg != null);
    try testing.expectEqualStrings("https://dist.pkgx.dev", pkgx_reg.?.url);

    // Get by type
    const npm_reg = manager.getRegistryByType(.npm);
    try testing.expect(npm_reg != null);
    try testing.expectEqual(core.RegistryType.npm, npm_reg.?.type);
}

test "RegistryManager - priority sorting" {
    const allocator = testing.allocator;

    var manager = core.RegistryManager.init(allocator);
    defer manager.deinit();

    // Add in reverse priority order
    var high_priority = core.RegistryConfig{
        .type = .custom,
        .url = try allocator.dupe(u8, "https://high.example.com"),
        .priority = 1,
        .name = try allocator.dupe(u8, "high"),
    };
    try manager.addRegistry(high_priority);

    var low_priority = core.RegistryConfig{
        .type = .custom,
        .url = try allocator.dupe(u8, "https://low.example.com"),
        .priority = 100,
        .name = try allocator.dupe(u8, "low"),
    };
    try manager.addRegistry(low_priority);

    // Default should be highest priority (lowest number)
    const default_reg = manager.getDefaultRegistry();
    try testing.expect(default_reg != null);
    try testing.expectEqualStrings("high", default_reg.?.name.?);
}

test "RegistryManager - load from JSON config" {
    const allocator = testing.allocator;

    const config_json =
        \\{
        \\  "registries": [
        \\    {
        \\      "name": "npm",
        \\      "type": "npm",
        \\      "url": "https://registry.npmjs.org",
        \\      "priority": 10,
        \\      "enabled": true
        \\    },
        \\    {
        \\      "name": "custom",
        \\      "type": "custom",
        \\      "url": "https://my-registry.com",
        \\      "priority": 20,
        \\      "auth": {
        \\        "type": "bearer",
        \\        "token": "secret-token"
        \\      }
        \\    }
        \\  ]
        \\}
    ;

    var parsed = try std.json.parseFromSlice(std.json.Value, allocator, config_json, .{});
    defer parsed.deinit();

    var manager = core.RegistryManager.init(allocator);
    defer manager.deinit();

    try manager.loadFromConfig(parsed.value);

    try testing.expectEqual(@as(usize, 2), manager.registries.items.len);

    const npm_reg = manager.getRegistry("npm");
    try testing.expect(npm_reg != null);
    try testing.expectEqual(core.RegistryType.npm, npm_reg.?.type);

    const custom_reg = manager.getRegistry("custom");
    try testing.expect(custom_reg != null);
    try testing.expectEqual(core.RegistryType.custom, custom_reg.?.type);
}

test "RegistryManager - set default registry" {
    const allocator = testing.allocator;

    var manager = core.RegistryManager.init(allocator);
    defer manager.deinit();

    var config1 = core.RegistryConfig{
        .type = .npm,
        .url = try allocator.dupe(u8, "https://registry.npmjs.org"),
        .priority = 10,
        .name = try allocator.dupe(u8, "npm"),
    };
    try manager.addRegistry(config1);

    var config2 = core.RegistryConfig{
        .type = .custom,
        .url = try allocator.dupe(u8, "https://custom.com"),
        .priority = 20,
        .name = try allocator.dupe(u8, "custom"),
    };
    try manager.addRegistry(config2);

    // Set custom as default
    try manager.setDefaultRegistry("custom");

    const default_reg = manager.getDefaultRegistry();
    try testing.expect(default_reg != null);
    try testing.expectEqualStrings("custom", default_reg.?.name.?);
}

// ============================================================================
// Authentication Tests
// ============================================================================

test "Authentication - bearer token" {
    const allocator = testing.allocator;

    var auth = core.Authentication{ .bearer = try allocator.dupe(u8, "test-token") };
    defer auth.deinit(allocator);

    try testing.expect(auth == .bearer);
}

test "Authentication - basic auth" {
    const allocator = testing.allocator;

    var auth = core.Authentication{
        .basic = .{
            .username = try allocator.dupe(u8, "user"),
            .password = try allocator.dupe(u8, "pass"),
        },
    };
    defer auth.deinit(allocator);

    try testing.expect(auth == .basic);
    try testing.expectEqualStrings("user", auth.basic.username);
    try testing.expectEqualStrings("pass", auth.basic.password);
}

// ============================================================================
// NPM Registry Tests (Mock)
// ============================================================================

test "NPM Registry - initialization" {
    const allocator = testing.allocator;

    const config = try core.RegistryConfig.npm(allocator);
    defer {
        var mut_config = config;
        mut_config.deinit(allocator);
    }

    var npm_registry = try npm.NpmRegistry.init(allocator, config);
    defer npm_registry.deinit();

    try testing.expectEqual(core.RegistryType.npm, npm_registry.config.type);
    try testing.expectEqualStrings("https://registry.npmjs.org", npm_registry.config.url);
}

test "NPM Registry - interface creation" {
    const allocator = testing.allocator;

    const config = try core.RegistryConfig.npm(allocator);
    defer {
        var mut_config = config;
        mut_config.deinit(allocator);
    }

    var npm_registry = try npm.NpmRegistry.init(allocator, config);
    defer npm_registry.deinit();

    const registry_interface = npm_registry.interface();
    try testing.expect(registry_interface.vtable.fetchMetadata != null);
    try testing.expect(registry_interface.vtable.downloadTarball != null);
    try testing.expect(registry_interface.vtable.search != null);
    try testing.expect(registry_interface.vtable.listVersions != null);
}

// ============================================================================
// Custom Registry Tests
// ============================================================================

test "Custom Registry - initialization" {
    const allocator = testing.allocator;

    var config = core.RegistryConfig{
        .type = .custom,
        .url = try allocator.dupe(u8, "https://my-registry.com"),
        .auth = .none,
        .priority = 10,
        .name = try allocator.dupe(u8, "my-registry"),
    };
    defer config.deinit(allocator);

    var custom_registry = try custom.CustomRegistry.init(allocator, config);
    defer custom_registry.deinit();

    try testing.expectEqual(core.RegistryType.custom, custom_registry.config.type);
    try testing.expectEqualStrings("https://my-registry.com", custom_registry.config.url);
}

test "Custom Registry - with bearer auth" {
    const allocator = testing.allocator;

    var config = core.RegistryConfig{
        .type = .custom,
        .url = try allocator.dupe(u8, "https://secure-registry.com"),
        .auth = .{ .bearer = try allocator.dupe(u8, "secret-token") },
        .priority = 10,
        .name = try allocator.dupe(u8, "secure"),
    };
    defer config.deinit(allocator);

    var custom_registry = try custom.CustomRegistry.init(allocator, config);
    defer custom_registry.deinit();

    try testing.expect(custom_registry.config.auth == .bearer);
}

test "Custom Registry - with basic auth" {
    const allocator = testing.allocator;

    var config = core.RegistryConfig{
        .type = .custom,
        .url = try allocator.dupe(u8, "https://secure-registry.com"),
        .auth = .{
            .basic = .{
                .username = try allocator.dupe(u8, "admin"),
                .password = try allocator.dupe(u8, "secret"),
            },
        },
        .priority = 10,
        .name = try allocator.dupe(u8, "basic-secure"),
    };
    defer config.deinit(allocator);

    var custom_registry = try custom.CustomRegistry.init(allocator, config);
    defer custom_registry.deinit();

    try testing.expect(custom_registry.config.auth == .basic);
    try testing.expectEqualStrings("admin", custom_registry.config.auth.basic.username);
}

// ============================================================================
// End-to-End Multi-Registry Workflow
// ============================================================================

test "End-to-End: Multi-registry configuration and selection" {
    const allocator = testing.allocator;

    var manager = core.RegistryManager.init(allocator);
    defer manager.deinit();

    // Add multiple registries
    try manager.addRegistry(try core.RegistryConfig.pkgx(allocator));
    try manager.addRegistry(try core.RegistryConfig.npm(allocator));
    try manager.addRegistry(try core.RegistryConfig.github(allocator));

    // Verify all registered
    try testing.expectEqual(@as(usize, 3), manager.registries.items.len);

    // Get each by type
    try testing.expect(manager.getRegistryByType(.pkgx) != null);
    try testing.expect(manager.getRegistryByType(.npm) != null);
    try testing.expect(manager.getRegistryByType(.github) != null);

    // Default should be highest priority (pkgx = 10)
    const default_reg = manager.getDefaultRegistry();
    try testing.expect(default_reg != null);
    try testing.expectEqual(core.RegistryType.pkgx, default_reg.?.type);

    // Switch default to npm
    try manager.setDefaultRegistry("npm");
    const new_default = manager.getDefaultRegistry();
    try testing.expect(new_default != null);
    try testing.expectEqual(core.RegistryType.npm, new_default.?.type);
}

test "End-to-End: Registry fallback simulation" {
    const allocator = testing.allocator;

    var manager = core.RegistryManager.init(allocator);
    defer manager.deinit();

    // Add registries in priority order
    var primary = core.RegistryConfig{
        .type = .npm,
        .url = try allocator.dupe(u8, "https://primary.com"),
        .priority = 1,
        .name = try allocator.dupe(u8, "primary"),
    };
    try manager.addRegistry(primary);

    var fallback1 = core.RegistryConfig{
        .type = .custom,
        .url = try allocator.dupe(u8, "https://fallback1.com"),
        .priority = 2,
        .name = try allocator.dupe(u8, "fallback1"),
    };
    try manager.addRegistry(fallback1);

    var fallback2 = core.RegistryConfig{
        .type = .custom,
        .url = try allocator.dupe(u8, "https://fallback2.com"),
        .priority = 3,
        .name = try allocator.dupe(u8, "fallback2"),
    };
    try manager.addRegistry(fallback2);

    // Registries should be sorted by priority
    try testing.expectEqualStrings("primary", manager.registries.items[0].name.?);
    try testing.expectEqualStrings("fallback1", manager.registries.items[1].name.?);
    try testing.expectEqualStrings("fallback2", manager.registries.items[2].name.?);

    // Simulate fallback: disable primary
    manager.registries.items[0].enabled = false;

    // Next enabled registry should be fallback1
    for (manager.registries.items) |*reg| {
        if (reg.enabled) {
            try testing.expectEqualStrings("fallback1", reg.name.?);
            break;
        }
    }
}

test "PackageMetadata - complete lifecycle" {
    const allocator = testing.allocator;

    var metadata = core.PackageMetadata{
        .name = try allocator.dupe(u8, "test-package"),
        .version = try allocator.dupe(u8, "1.0.0"),
        .description = try allocator.dupe(u8, "A test package"),
        .repository = try allocator.dupe(u8, "https://github.com/user/repo"),
        .homepage = try allocator.dupe(u8, "https://example.com"),
        .license = try allocator.dupe(u8, "MIT"),
        .tarball_url = try allocator.dupe(u8, "https://registry.com/package.tgz"),
        .checksum = try allocator.dupe(u8, "sha256:abc123"),
        .dependencies = null,
        .dev_dependencies = null,
    };
    defer metadata.deinit(allocator);

    try testing.expectEqualStrings("test-package", metadata.name);
    try testing.expectEqualStrings("1.0.0", metadata.version);
    try testing.expectEqualStrings("A test package", metadata.description.?);
}
