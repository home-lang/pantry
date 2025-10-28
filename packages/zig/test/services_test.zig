const std = @import("std");
const services = @import("pantry").services;
const definitions = services.definitions;
const platform = services.platform;
const manager = services.manager;

// ============================================================================
// Platform Detection Tests
// ============================================================================

test "Platform detection" {
    const plat = platform.Platform.detect();

    // Should detect a known platform
    try std.testing.expect(plat != .unknown);

    // Check service manager name
    const mgr_name = plat.serviceManager();
    try std.testing.expect(mgr_name.len > 0);
}

test "Platform service directory" {
    const allocator = std.testing.allocator;
    const plat = platform.Platform.detect();

    // Skip on unsupported platforms
    if (plat == .unknown or plat == .windows) {
        return error.SkipZigTest;
    }

    const dir = try plat.serviceDirectory(allocator);
    defer allocator.free(dir);

    try std.testing.expect(dir.len > 0);

    switch (plat) {
        .macos => try std.testing.expectEqualStrings("/Library/LaunchDaemons", dir),
        .linux => try std.testing.expectEqualStrings("/etc/systemd/system", dir),
        else => {},
    }
}

test "Platform user service directory" {
    const allocator = std.testing.allocator;
    const plat = platform.Platform.detect();

    // Skip on unsupported platforms
    if (plat == .unknown or plat == .windows) {
        return error.SkipZigTest;
    }

    // Only test if HOME is set
    const home = std.posix.getenv("HOME") orelse return error.SkipZigTest;

    const dir = try plat.userServiceDirectory(allocator);
    defer allocator.free(dir);

    try std.testing.expect(dir.len > 0);
    try std.testing.expect(std.mem.startsWith(u8, dir, home));
}

// ============================================================================
// Service Configuration Tests
// ============================================================================

test "ServiceConfig creation - PostgreSQL" {
    const allocator = std.testing.allocator;

    var pg = try definitions.Services.postgresql(allocator, 5432);
    defer pg.deinit(allocator);

    try std.testing.expectEqualStrings("postgresql", pg.name);
    try std.testing.expectEqualStrings("PostgreSQL", pg.display_name);
    try std.testing.expect(pg.port.? == 5432);
    try std.testing.expect(pg.keep_alive == true);
}

test "ServiceConfig creation - Redis" {
    const allocator = std.testing.allocator;

    var redis = try definitions.Services.redis(allocator, 6379);
    defer redis.deinit(allocator);

    try std.testing.expectEqualStrings("redis", redis.name);
    try std.testing.expectEqualStrings("Redis", redis.display_name);
    try std.testing.expect(redis.port.? == 6379);
    try std.testing.expect(redis.keep_alive == true);
}

test "ServiceConfig creation - MySQL" {
    const allocator = std.testing.allocator;

    var mysql = try definitions.Services.mysql(allocator, 3306);
    defer mysql.deinit(allocator);

    try std.testing.expectEqualStrings("mysql", mysql.name);
    try std.testing.expectEqualStrings("MySQL", mysql.display_name);
    try std.testing.expect(mysql.port.? == 3306);
    try std.testing.expect(mysql.keep_alive == true);
}

test "ServiceConfig creation - Nginx" {
    const allocator = std.testing.allocator;

    var nginx = try definitions.Services.nginx(allocator, 80);
    defer nginx.deinit(allocator);

    try std.testing.expectEqualStrings("nginx", nginx.name);
    try std.testing.expectEqualStrings("Nginx", nginx.display_name);
    try std.testing.expect(nginx.port.? == 80);
    try std.testing.expect(nginx.keep_alive == true);
}

test "ServiceConfig creation - MongoDB" {
    const allocator = std.testing.allocator;

    var mongo = try definitions.Services.mongodb(allocator, 27017);
    defer mongo.deinit(allocator);

    try std.testing.expectEqualStrings("mongodb", mongo.name);
    try std.testing.expectEqualStrings("MongoDB", mongo.display_name);
    try std.testing.expect(mongo.port.? == 27017);
    try std.testing.expect(mongo.keep_alive == true);
}

test "Default ports" {
    try std.testing.expect(definitions.Services.getDefaultPort("postgresql").? == 5432);
    try std.testing.expect(definitions.Services.getDefaultPort("redis").? == 6379);
    try std.testing.expect(definitions.Services.getDefaultPort("mysql").? == 3306);
    try std.testing.expect(definitions.Services.getDefaultPort("nginx").? == 80);
    try std.testing.expect(definitions.Services.getDefaultPort("mongodb").? == 27017);
    try std.testing.expect(definitions.Services.getDefaultPort("unknown") == null);
}

// ============================================================================
// Service Controller Tests
// ============================================================================

test "ServiceController init" {
    const allocator = std.testing.allocator;

    const controller = platform.ServiceController.init(allocator);
    try std.testing.expect(controller.platform != .unknown);
}

// Note: Internal function tests removed as they test private functions
// The public API is tested through integration tests instead

// ============================================================================
// Service Manager Tests
// ============================================================================

test "ServiceManager init and deinit" {
    const allocator = std.testing.allocator;

    var mgr = manager.ServiceManager.init(allocator);
    defer mgr.deinit();

    try std.testing.expect(mgr.services.count() == 0);
}

test "ServiceManager register and unregister" {
    const allocator = std.testing.allocator;

    var mgr = manager.ServiceManager.init(allocator);
    defer mgr.deinit();

    // Register a service
    const redis = try definitions.Services.redis(allocator, 6379);
    try mgr.register(redis);

    try std.testing.expect(mgr.services.count() == 1);

    // Get service
    const service = mgr.getService("redis");
    try std.testing.expect(service != null);
    try std.testing.expectEqualStrings("redis", service.?.name);

    // Unregister service
    try mgr.unregister("redis");
    try std.testing.expect(mgr.services.count() == 0);
}

test "ServiceManager register multiple services" {
    const allocator = std.testing.allocator;

    var mgr = manager.ServiceManager.init(allocator);
    defer mgr.deinit();

    // Register multiple services
    const redis = try definitions.Services.redis(allocator, 6379);
    try mgr.register(redis);

    const pg = try definitions.Services.postgresql(allocator, 5432);
    try mgr.register(pg);

    const mysql = try definitions.Services.mysql(allocator, 3306);
    try mgr.register(mysql);

    try std.testing.expect(mgr.services.count() == 3);

    // Verify all services are registered
    try std.testing.expect(mgr.getService("redis") != null);
    try std.testing.expect(mgr.getService("postgresql") != null);
    try std.testing.expect(mgr.getService("mysql") != null);
}

test "ServiceManager list services" {
    const allocator = std.testing.allocator;

    var mgr = manager.ServiceManager.init(allocator);
    defer mgr.deinit();

    // Register multiple services
    const redis = try definitions.Services.redis(allocator, 6379);
    try mgr.register(redis);

    const pg = try definitions.Services.postgresql(allocator, 5432);
    try mgr.register(pg);

    // List services
    const service_list = try mgr.listServices();
    defer allocator.free(service_list);

    try std.testing.expect(service_list.len == 2);
}

test "ServiceManager unregister non-existent service" {
    const allocator = std.testing.allocator;

    var mgr = manager.ServiceManager.init(allocator);
    defer mgr.deinit();

    // Try to unregister a service that doesn't exist
    const result = mgr.unregister("nonexistent");
    try std.testing.expectError(error.ServiceNotFound, result);
}

test "ServiceManager get non-existent service" {
    const allocator = std.testing.allocator;

    var mgr = manager.ServiceManager.init(allocator);
    defer mgr.deinit();

    // Try to get a service that doesn't exist
    const service = mgr.getService("nonexistent");
    try std.testing.expect(service == null);
}

// ============================================================================
// Service Status Tests
// ============================================================================

test "ServiceStatus enum values" {
    const running: definitions.ServiceStatus = .running;
    const stopped: definitions.ServiceStatus = .stopped;
    const failed: definitions.ServiceStatus = .failed;
    const unknown: definitions.ServiceStatus = .unknown;

    try std.testing.expect(running == .running);
    try std.testing.expect(stopped == .stopped);
    try std.testing.expect(failed == .failed);
    try std.testing.expect(unknown == .unknown);
}

// ============================================================================
// Integration Tests (require actual service operations)
// ============================================================================

// Note: These tests are commented out because they require root permissions
// and actual service installations. Uncomment to test manually.

// test "ServiceManager start and stop service" {
//     const allocator = std.testing.allocator;
//
//     var mgr = manager.ServiceManager.init(allocator);
//     defer mgr.deinit();
//
//     var redis = try definitions.Services.redis(allocator, 6379);
//     try mgr.register(redis);
//
//     // Start service (requires root)
//     try mgr.start("redis");
//
//     // Check if running
//     const is_running = try mgr.isRunning("redis");
//     try std.testing.expect(is_running);
//
//     // Stop service
//     try mgr.stop("redis");
//
//     // Check if stopped
//     const still_running = try mgr.isRunning("redis");
//     try std.testing.expect(!still_running);
// }

// test "ServiceManager restart service" {
//     const allocator = std.testing.allocator;
//
//     var mgr = manager.ServiceManager.init(allocator);
//     defer mgr.deinit();
//
//     var redis = try definitions.Services.redis(allocator, 6379);
//     try mgr.register(redis);
//
//     // Start and restart (requires root)
//     try mgr.start("redis");
//     try mgr.restart("redis");
//
//     // Should still be running
//     const is_running = try mgr.isRunning("redis");
//     try std.testing.expect(is_running);
//
//     try mgr.stop("redis");
// }
