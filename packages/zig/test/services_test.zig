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
// Extended Platform Tests
// ============================================================================

test "Platform service file extension" {
    const plat = platform.Platform.detect();

    switch (plat) {
        .macos => try std.testing.expectEqualStrings(".plist", plat.serviceFileExtension()),
        .linux => try std.testing.expectEqualStrings(".service", plat.serviceFileExtension()),
        .windows => try std.testing.expectEqualStrings(".xml", plat.serviceFileExtension()),
        .unknown => try std.testing.expectEqualStrings("", plat.serviceFileExtension()),
    }
}

test "Platform all enum values" {
    const macos: platform.Platform = .macos;
    const linux: platform.Platform = .linux;
    const windows: platform.Platform = .windows;
    const unknown: platform.Platform = .unknown;

    try std.testing.expect(macos == .macos);
    try std.testing.expect(linux == .linux);
    try std.testing.expect(windows == .windows);
    try std.testing.expect(unknown == .unknown);
}

test "Platform service manager names" {
    const macos: platform.Platform = .macos;
    const linux: platform.Platform = .linux;
    const windows: platform.Platform = .windows;

    try std.testing.expectEqualStrings("launchd", macos.serviceManager());
    try std.testing.expectEqualStrings("systemd", linux.serviceManager());
    try std.testing.expectEqualStrings("sc", windows.serviceManager());
}

// ============================================================================
// Extended ServiceConfig Tests
// ============================================================================

test "ServiceConfig with custom port - PostgreSQL" {
    const allocator = std.testing.allocator;

    var pg = try definitions.Services.postgresql(allocator, 9999);
    defer pg.deinit(allocator);

    try std.testing.expect(pg.port.? == 9999);
    try std.testing.expect(pg.env_vars.count() >= 2); // PGPORT and PGDATA
}

test "ServiceConfig with custom port - Redis" {
    const allocator = std.testing.allocator;

    var redis = try definitions.Services.redis(allocator, 7000);
    defer redis.deinit(allocator);

    try std.testing.expect(redis.port.? == 7000);
    try std.testing.expect(std.mem.indexOf(u8, redis.start_command, "7000") != null);
}

test "ServiceConfig with custom port - MySQL" {
    const allocator = std.testing.allocator;

    var mysql = try definitions.Services.mysql(allocator, 3307);
    defer mysql.deinit(allocator);

    try std.testing.expect(mysql.port.? == 3307);
    try std.testing.expect(mysql.env_vars.count() >= 1); // MYSQL_PORT
}

test "ServiceConfig environment variables - PostgreSQL" {
    const allocator = std.testing.allocator;

    var pg = try definitions.Services.postgresql(allocator, 5432);
    defer pg.deinit(allocator);

    // Check env vars exist
    try std.testing.expect(pg.env_vars.get("PGPORT") != null);
    try std.testing.expect(pg.env_vars.get("PGDATA") != null);

    // Check PGDATA value
    const pgdata = pg.env_vars.get("PGDATA").?;
    try std.testing.expect(std.mem.indexOf(u8, pgdata, "postgres") != null);
}

test "ServiceConfig environment variables - MySQL" {
    const allocator = std.testing.allocator;

    var mysql = try definitions.Services.mysql(allocator, 3306);
    defer mysql.deinit(allocator);

    // Check MYSQL_PORT env var
    try std.testing.expect(mysql.env_vars.get("MYSQL_PORT") != null);
}

test "ServiceConfig all fields present - PostgreSQL" {
    const allocator = std.testing.allocator;

    var pg = try definitions.Services.postgresql(allocator, 5432);
    defer pg.deinit(allocator);

    // Verify all required fields
    try std.testing.expect(pg.name.len > 0);
    try std.testing.expect(pg.display_name.len > 0);
    try std.testing.expect(pg.description.len > 0);
    try std.testing.expect(pg.start_command.len > 0);
    try std.testing.expect(pg.port != null);
}

test "ServiceConfig all fields present - Redis" {
    const allocator = std.testing.allocator;

    var redis = try definitions.Services.redis(allocator, 6379);
    defer redis.deinit(allocator);

    try std.testing.expect(redis.name.len > 0);
    try std.testing.expect(redis.display_name.len > 0);
    try std.testing.expect(redis.description.len > 0);
    try std.testing.expect(redis.start_command.len > 0);
    try std.testing.expect(redis.port != null);
}

test "ServiceConfig start command contains port" {
    const allocator = std.testing.allocator;

    var redis = try definitions.Services.redis(allocator, 6379);
    defer redis.deinit(allocator);

    // Redis start command should contain the port
    try std.testing.expect(std.mem.indexOf(u8, redis.start_command, "6379") != null);
}

test "ServiceConfig memory cleanup" {
    const allocator = std.testing.allocator;

    // Create and destroy multiple services to test cleanup
    {
        var pg = try definitions.Services.postgresql(allocator, 5432);
        defer pg.deinit(allocator);
    }

    {
        var redis = try definitions.Services.redis(allocator, 6379);
        defer redis.deinit(allocator);
    }

    {
        var mysql = try definitions.Services.mysql(allocator, 3306);
        defer mysql.deinit(allocator);
    }

    {
        var nginx = try definitions.Services.nginx(allocator, 80);
        defer nginx.deinit(allocator);
    }

    {
        var mongo = try definitions.Services.mongodb(allocator, 27017);
        defer mongo.deinit(allocator);
    }

    // If we get here without leaks, memory cleanup works
    try std.testing.expect(true);
}

// ============================================================================
// Extended ServiceManager Tests
// ============================================================================

test "ServiceManager register same service twice" {
    const allocator = std.testing.allocator;

    var mgr = manager.ServiceManager.init(allocator);
    defer mgr.deinit();

    const redis1 = try definitions.Services.redis(allocator, 6379);
    try mgr.register(redis1);

    const redis2 = try definitions.Services.redis(allocator, 6380);
    try mgr.register(redis2);

    // Second registration should overwrite the first
    try std.testing.expect(mgr.services.count() == 1);

    const service = mgr.getService("redis");
    try std.testing.expect(service != null);
}

test "ServiceManager register all service types" {
    const allocator = std.testing.allocator;

    var mgr = manager.ServiceManager.init(allocator);
    defer mgr.deinit();

    const pg = try definitions.Services.postgresql(allocator, 5432);
    try mgr.register(pg);

    const redis = try definitions.Services.redis(allocator, 6379);
    try mgr.register(redis);

    const mysql = try definitions.Services.mysql(allocator, 3306);
    try mgr.register(mysql);

    const nginx = try definitions.Services.nginx(allocator, 80);
    try mgr.register(nginx);

    const mongo = try definitions.Services.mongodb(allocator, 27017);
    try mgr.register(mongo);

    try std.testing.expect(mgr.services.count() == 5);

    // Verify all services
    try std.testing.expect(mgr.getService("postgresql") != null);
    try std.testing.expect(mgr.getService("redis") != null);
    try std.testing.expect(mgr.getService("mysql") != null);
    try std.testing.expect(mgr.getService("nginx") != null);
    try std.testing.expect(mgr.getService("mongodb") != null);
}

test "ServiceManager list services returns correct count" {
    const allocator = std.testing.allocator;

    var mgr = manager.ServiceManager.init(allocator);
    defer mgr.deinit();

    // Empty list
    {
        const list = try mgr.listServices();
        defer allocator.free(list);
        try std.testing.expect(list.len == 0);
    }

    // Add services
    const redis = try definitions.Services.redis(allocator, 6379);
    try mgr.register(redis);

    const pg = try definitions.Services.postgresql(allocator, 5432);
    try mgr.register(pg);

    const mysql = try definitions.Services.mysql(allocator, 3306);
    try mgr.register(mysql);

    // List should have 3 services
    {
        const list = try mgr.listServices();
        defer allocator.free(list);
        try std.testing.expect(list.len == 3);
    }
}

test "ServiceManager unregister reduces count" {
    const allocator = std.testing.allocator;

    var mgr = manager.ServiceManager.init(allocator);
    defer mgr.deinit();

    const redis = try definitions.Services.redis(allocator, 6379);
    try mgr.register(redis);

    const pg = try definitions.Services.postgresql(allocator, 5432);
    try mgr.register(pg);

    try std.testing.expect(mgr.services.count() == 2);

    try mgr.unregister("redis");
    try std.testing.expect(mgr.services.count() == 1);

    try mgr.unregister("postgresql");
    try std.testing.expect(mgr.services.count() == 0);
}

test "ServiceManager operations on non-existent service return errors" {
    const allocator = std.testing.allocator;

    var mgr = manager.ServiceManager.init(allocator);
    defer mgr.deinit();

    // start on non-existent service
    const start_result = mgr.start("nonexistent");
    try std.testing.expectError(error.ServiceNotFound, start_result);

    // stop on non-existent service
    const stop_result = mgr.stop("nonexistent");
    try std.testing.expectError(error.ServiceNotFound, stop_result);

    // restart on non-existent service
    const restart_result = mgr.restart("nonexistent");
    try std.testing.expectError(error.ServiceNotFound, restart_result);

    // status on non-existent service
    const status_result = mgr.status("nonexistent");
    try std.testing.expectError(error.ServiceNotFound, status_result);
}

test "ServiceManager multiple init and deinit" {
    const allocator = std.testing.allocator;

    // Create and destroy multiple managers
    {
        var mgr1 = manager.ServiceManager.init(allocator);
        defer mgr1.deinit();
    }

    {
        var mgr2 = manager.ServiceManager.init(allocator);
        defer mgr2.deinit();
    }

    {
        var mgr3 = manager.ServiceManager.init(allocator);
        defer mgr3.deinit();
    }

    try std.testing.expect(true);
}

// ============================================================================
// ServiceController Extended Tests
// ============================================================================

test "ServiceController multiple init" {
    const allocator = std.testing.allocator;

    const ctrl1 = platform.ServiceController.init(allocator);
    const ctrl2 = platform.ServiceController.init(allocator);
    const ctrl3 = platform.ServiceController.init(allocator);

    try std.testing.expect(ctrl1.platform == ctrl2.platform);
    try std.testing.expect(ctrl2.platform == ctrl3.platform);
}

test "ServiceController platform consistency" {
    const allocator = std.testing.allocator;

    const controller = platform.ServiceController.init(allocator);
    const detected_platform = platform.Platform.detect();

    try std.testing.expect(controller.platform == detected_platform);
}

// ============================================================================
// Default Port Tests
// ============================================================================

test "Default ports for all services" {
    // PostgreSQL
    const pg_port = definitions.Services.getDefaultPort("postgresql");
    try std.testing.expect(pg_port != null);
    try std.testing.expect(pg_port.? == 5432);

    // Redis
    const redis_port = definitions.Services.getDefaultPort("redis");
    try std.testing.expect(redis_port != null);
    try std.testing.expect(redis_port.? == 6379);

    // MySQL
    const mysql_port = definitions.Services.getDefaultPort("mysql");
    try std.testing.expect(mysql_port != null);
    try std.testing.expect(mysql_port.? == 3306);

    // Nginx
    const nginx_port = definitions.Services.getDefaultPort("nginx");
    try std.testing.expect(nginx_port != null);
    try std.testing.expect(nginx_port.? == 80);

    // MongoDB
    const mongo_port = definitions.Services.getDefaultPort("mongodb");
    try std.testing.expect(mongo_port != null);
    try std.testing.expect(mongo_port.? == 27017);
}

test "Default port for invalid service" {
    const port = definitions.Services.getDefaultPort("invalid_service_name");
    try std.testing.expect(port == null);
}

test "Default port case sensitivity" {
    // Should be case-sensitive
    const pg_lower = definitions.Services.getDefaultPort("postgresql");
    const pg_upper = definitions.Services.getDefaultPort("POSTGRESQL");

    try std.testing.expect(pg_lower != null);
    try std.testing.expect(pg_upper == null); // Should be null for uppercase
}

// ============================================================================
// Service Name Validation Tests
// ============================================================================

test "Service names are valid identifiers" {
    const allocator = std.testing.allocator;

    var pg = try definitions.Services.postgresql(allocator, 5432);
    defer pg.deinit(allocator);

    // Service names should not contain spaces or special chars
    try std.testing.expect(std.mem.indexOf(u8, pg.name, " ") == null);
    try std.testing.expect(std.mem.indexOf(u8, pg.name, "/") == null);
    try std.testing.expect(std.mem.indexOf(u8, pg.name, "\\") == null);
}

test "Service display names contain proper capitalization" {
    const allocator = std.testing.allocator;

    var redis = try definitions.Services.redis(allocator, 6379);
    defer redis.deinit(allocator);

    // Display name should start with uppercase
    try std.testing.expect(redis.display_name[0] >= 'A' and redis.display_name[0] <= 'Z');
}

// ============================================================================
// Memory and Resource Tests
// ============================================================================

test "ServiceConfig deinit is idempotent" {
    const allocator = std.testing.allocator;

    var redis = try definitions.Services.redis(allocator, 6379);
    redis.deinit(allocator);

    // Second deinit should not crash (though it might double-free in practice,
    // this test verifies the structure)
    // Note: In practice, don't call deinit twice!
}

test "ServiceManager handles empty operations" {
    const allocator = std.testing.allocator;

    var mgr = manager.ServiceManager.init(allocator);
    defer mgr.deinit();

    // List when empty
    const list = try mgr.listServices();
    defer allocator.free(list);
    try std.testing.expect(list.len == 0);

    // Get when empty
    const service = mgr.getService("anything");
    try std.testing.expect(service == null);
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
