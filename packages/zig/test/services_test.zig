const std = @import("std");
const pantry = @import("pantry");
const services = pantry.services;
const definitions = services.definitions;
const platform = services.platform;
const manager = services.manager;
const install_helpers = pantry.commands.install_commands.helpers;

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
    const home = blk: {
        var key_buf: [4096:0]u8 = undefined;
        @memcpy(key_buf[0..4], "HOME");
        key_buf[4] = 0;
        const val = std.c.getenv(&key_buf) orelse return error.SkipZigTest;
        break :blk std.mem.sliceTo(val, 0);
    };

    const dir = try plat.userServiceDirectory(allocator);
    defer allocator.free(dir);

    try std.testing.expect(dir.len > 0);
    try std.testing.expect(std.mem.startsWith(u8, dir, home));
}

// ============================================================================
// Service Configuration Tests — The Big Three (postgres, redis, meilisearch)
// ============================================================================

test "ServiceConfig creation - PostgreSQL" {
    const allocator = std.testing.allocator;

    var pg = try definitions.Services.postgresql(allocator, 5432);
    defer pg.deinit(allocator);

    // postgres is the canonical name (not "postgresql") since the WithContext variant was added
    try std.testing.expectEqualStrings("postgres", pg.name);
    try std.testing.expectEqualStrings("PostgreSQL", pg.display_name);
    try std.testing.expectEqualStrings("PostgreSQL database server", pg.description);
    try std.testing.expect(pg.port.? == 5432);
    try std.testing.expect(pg.keep_alive == true);
    try std.testing.expect(pg.auto_start == false);

    // Start command must contain the port and PGDATA path
    try std.testing.expect(std.mem.indexOf(u8, pg.start_command, "5432") != null);
    try std.testing.expect(std.mem.indexOf(u8, pg.start_command, "postgres") != null);

    // Env vars: PGPORT and PGDATA must be set
    try std.testing.expect(pg.env_vars.get("PGPORT") != null);
    try std.testing.expect(pg.env_vars.get("PGDATA") != null);

    // PGDATA should reference the pantry data directory
    const pgdata = pg.env_vars.get("PGDATA").?;
    try std.testing.expect(std.mem.indexOf(u8, pgdata, "pantry/data/postgres") != null);
}

test "ServiceConfig creation - PostgreSQL with custom port" {
    const allocator = std.testing.allocator;

    var pg = try definitions.Services.postgresql(allocator, 9999);
    defer pg.deinit(allocator);

    try std.testing.expect(pg.port.? == 9999);
    try std.testing.expect(std.mem.indexOf(u8, pg.start_command, "9999") != null);

    const pgport = pg.env_vars.get("PGPORT").?;
    try std.testing.expectEqualStrings("9999", pgport);
}

test "ServiceConfig creation - Redis" {
    const allocator = std.testing.allocator;

    var redis = try definitions.Services.redis(allocator, 6379);
    defer redis.deinit(allocator);

    try std.testing.expectEqualStrings("redis", redis.name);
    try std.testing.expectEqualStrings("Redis", redis.display_name);
    try std.testing.expectEqualStrings("Redis in-memory data store", redis.description);
    try std.testing.expect(redis.port.? == 6379);
    try std.testing.expect(redis.keep_alive == true);

    // Start command must contain redis-server and port
    try std.testing.expect(std.mem.indexOf(u8, redis.start_command, "redis-server") != null or
        std.mem.indexOf(u8, redis.start_command, "redis") != null);
    try std.testing.expect(std.mem.indexOf(u8, redis.start_command, "6379") != null);
}

test "ServiceConfig creation - Redis with custom port" {
    const allocator = std.testing.allocator;

    var redis = try definitions.Services.redis(allocator, 7000);
    defer redis.deinit(allocator);

    try std.testing.expect(redis.port.? == 7000);
    try std.testing.expect(std.mem.indexOf(u8, redis.start_command, "7000") != null);
}

test "ServiceConfig creation - Meilisearch" {
    const allocator = std.testing.allocator;

    var meili = try definitions.Services.meilisearch(allocator, 7700);
    defer meili.deinit(allocator);

    try std.testing.expectEqualStrings("meilisearch", meili.name);
    try std.testing.expectEqualStrings("Meilisearch", meili.display_name);
    try std.testing.expectEqualStrings("Search engine", meili.description);
    try std.testing.expect(meili.port.? == 7700);
    try std.testing.expect(meili.keep_alive == true);

    // Start command must contain meilisearch binary and port
    try std.testing.expect(std.mem.indexOf(u8, meili.start_command, "meilisearch") != null);
    try std.testing.expect(std.mem.indexOf(u8, meili.start_command, "7700") != null);

    // Start command must contain --db-path and --no-analytics
    try std.testing.expect(std.mem.indexOf(u8, meili.start_command, "--db-path") != null);
    try std.testing.expect(std.mem.indexOf(u8, meili.start_command, "--no-analytics") != null);
    try std.testing.expect(std.mem.indexOf(u8, meili.start_command, "--http-addr") != null);

    // Working directory must be set (critical for macOS launchd)
    try std.testing.expect(meili.working_directory != null);
    try std.testing.expect(std.mem.indexOf(u8, meili.working_directory.?, "meilisearch") != null);
}

test "ServiceConfig creation - Meilisearch with custom port" {
    const allocator = std.testing.allocator;

    var meili = try definitions.Services.meilisearch(allocator, 7701);
    defer meili.deinit(allocator);

    try std.testing.expect(meili.port.? == 7701);
    try std.testing.expect(std.mem.indexOf(u8, meili.start_command, "7701") != null);
}

test "Meilisearch working_directory is set (required for macOS launchd)" {
    const allocator = std.testing.allocator;

    var meili = try definitions.Services.meilisearch(allocator, 7700);
    defer meili.deinit(allocator);

    // launchd defaults to / as working directory, which is read-only on macOS.
    // Meilisearch needs a writable working directory.
    try std.testing.expect(meili.working_directory != null);
    const wd = meili.working_directory.?;
    try std.testing.expect(wd.len > 0);
    // Should NOT be the root directory
    try std.testing.expect(!std.mem.eql(u8, wd, "/"));
}

// ============================================================================
// Service Configuration Tests — Other services
// ============================================================================

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

// ============================================================================
// Default Port Tests
// ============================================================================

test "Default ports for all services" {
    // The Big Three
    try std.testing.expect(definitions.Services.getDefaultPort("postgres").? == 5432);
    try std.testing.expect(definitions.Services.getDefaultPort("postgresql").? == 5432);
    try std.testing.expect(definitions.Services.getDefaultPort("redis").? == 6379);
    try std.testing.expect(definitions.Services.getDefaultPort("meilisearch").? == 7700);

    // Other databases
    try std.testing.expect(definitions.Services.getDefaultPort("mysql").? == 3306);
    try std.testing.expect(definitions.Services.getDefaultPort("mongodb").? == 27017);
    try std.testing.expect(definitions.Services.getDefaultPort("influxdb").? == 8086);
    try std.testing.expect(definitions.Services.getDefaultPort("cockroachdb").? == 26257);
    try std.testing.expect(definitions.Services.getDefaultPort("neo4j").? == 7474);
    try std.testing.expect(definitions.Services.getDefaultPort("clickhouse").? == 8123);
    try std.testing.expect(definitions.Services.getDefaultPort("memcached").? == 11211);
    try std.testing.expect(definitions.Services.getDefaultPort("elasticsearch").? == 9200);

    // Message Queues
    try std.testing.expect(definitions.Services.getDefaultPort("kafka").? == 9092);
    try std.testing.expect(definitions.Services.getDefaultPort("rabbitmq").? == 5672);
    try std.testing.expect(definitions.Services.getDefaultPort("pulsar").? == 6650);
    try std.testing.expect(definitions.Services.getDefaultPort("nats").? == 4222);

    // Monitoring
    try std.testing.expect(definitions.Services.getDefaultPort("prometheus").? == 9090);
    try std.testing.expect(definitions.Services.getDefaultPort("grafana").? == 3000);
    try std.testing.expect(definitions.Services.getDefaultPort("jaeger").? == 16686);

    // Infrastructure
    try std.testing.expect(definitions.Services.getDefaultPort("vault").? == 8200);
    try std.testing.expect(definitions.Services.getDefaultPort("consul").? == 8500);
    try std.testing.expect(definitions.Services.getDefaultPort("etcd").? == 2379);
    try std.testing.expect(definitions.Services.getDefaultPort("minio").? == 9000);
    try std.testing.expect(definitions.Services.getDefaultPort("sonarqube").? == 9001);
    try std.testing.expect(definitions.Services.getDefaultPort("temporal").? == 7233);

    // Dev/CI
    try std.testing.expect(definitions.Services.getDefaultPort("jenkins").? == 8090);
    try std.testing.expect(definitions.Services.getDefaultPort("localstack").? == 4566);
    try std.testing.expect(definitions.Services.getDefaultPort("verdaccio").? == 4873);

    // API/Backend
    try std.testing.expect(definitions.Services.getDefaultPort("hasura").? == 8085);
    try std.testing.expect(definitions.Services.getDefaultPort("keycloak").? == 8088);

    // Web Servers
    try std.testing.expect(definitions.Services.getDefaultPort("nginx").? == 8080);
    try std.testing.expect(definitions.Services.getDefaultPort("caddy").? == 2015);
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

test "Default port - postgres alias" {
    // Both "postgres" and "postgresql" should return 5432
    try std.testing.expectEqual(
        definitions.Services.getDefaultPort("postgres"),
        definitions.Services.getDefaultPort("postgresql"),
    );
}

// ============================================================================
// Package Alias Resolution Tests
// ============================================================================

test "resolvePackageAlias - meilisearch maps to meilisearch.com" {
    const result = install_helpers.resolvePackageAlias("meilisearch");
    try std.testing.expectEqualStrings("meilisearch.com", result);
}

test "resolvePackageAlias - unknown names pass through unchanged" {
    try std.testing.expectEqualStrings("redis", install_helpers.resolvePackageAlias("redis"));
    try std.testing.expectEqualStrings("postgres", install_helpers.resolvePackageAlias("postgres"));
    try std.testing.expectEqualStrings("bun", install_helpers.resolvePackageAlias("bun"));
    try std.testing.expectEqualStrings("node", install_helpers.resolvePackageAlias("node"));
    try std.testing.expectEqualStrings("php", install_helpers.resolvePackageAlias("php"));
}

test "resolvePackageAlias - already-canonical names pass through" {
    // meilisearch.com should NOT be double-resolved
    try std.testing.expectEqualStrings("meilisearch.com", install_helpers.resolvePackageAlias("meilisearch.com"));
}

test "resolvePackageAlias - empty string passes through" {
    try std.testing.expectEqualStrings("", install_helpers.resolvePackageAlias(""));
}

// ============================================================================
// Service Controller Tests
// ============================================================================

test "ServiceController init" {
    const allocator = std.testing.allocator;

    const controller = platform.ServiceController.init(allocator);
    try std.testing.expect(controller.platform != .unknown);
}

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

test "ServiceManager register the big three: postgres, redis, meilisearch" {
    const allocator = std.testing.allocator;

    var mgr = manager.ServiceManager.init(allocator);
    defer mgr.deinit();

    // Register all three autoStart services
    const pg = try definitions.Services.postgresql(allocator, 5432);
    try mgr.register(pg);

    const redis = try definitions.Services.redis(allocator, 6379);
    try mgr.register(redis);

    const meili = try definitions.Services.meilisearch(allocator, 7700);
    try mgr.register(meili);

    try std.testing.expect(mgr.services.count() == 3);

    // Verify all services retrievable by canonical name
    const pg_svc = mgr.getService("postgres");
    try std.testing.expect(pg_svc != null);
    try std.testing.expectEqualStrings("postgres", pg_svc.?.name);
    try std.testing.expect(pg_svc.?.port.? == 5432);

    const redis_svc = mgr.getService("redis");
    try std.testing.expect(redis_svc != null);
    try std.testing.expectEqualStrings("redis", redis_svc.?.name);
    try std.testing.expect(redis_svc.?.port.? == 6379);

    const meili_svc = mgr.getService("meilisearch");
    try std.testing.expect(meili_svc != null);
    try std.testing.expectEqualStrings("meilisearch", meili_svc.?.name);
    try std.testing.expect(meili_svc.?.port.? == 7700);
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
    try std.testing.expect(mgr.getService("postgres") != null);
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

    try mgr.unregister("postgres");
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

test "ServiceStatus toString" {
    try std.testing.expectEqualStrings("running", definitions.ServiceStatus.running.toString());
    try std.testing.expectEqualStrings("stopped", definitions.ServiceStatus.stopped.toString());
    try std.testing.expectEqualStrings("failed", definitions.ServiceStatus.failed.toString());
    try std.testing.expectEqualStrings("unknown", definitions.ServiceStatus.unknown.toString());
}

// ============================================================================
// Extended Platform Tests
// ============================================================================

test "Platform service file extension" {
    const plat = platform.Platform.detect();

    switch (plat) {
        .macos => try std.testing.expectEqualStrings(".plist", plat.serviceFileExtension()),
        .linux => try std.testing.expectEqualStrings(".service", plat.serviceFileExtension()),
        .freebsd => try std.testing.expectEqualStrings("", plat.serviceFileExtension()),
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
// Service Name Validation Tests
// ============================================================================

test "Service names are valid identifiers" {
    const allocator = std.testing.allocator;

    const service_fns = .{
        .{ "postgres", definitions.Services.postgresql },
        .{ "redis", definitions.Services.redis },
        .{ "meilisearch", definitions.Services.meilisearch },
    };

    inline for (service_fns) |entry| {
        var svc = try entry[1](allocator, 1234);
        defer svc.deinit(allocator);

        // Service names should not contain spaces or special chars
        try std.testing.expect(std.mem.indexOf(u8, svc.name, " ") == null);
        try std.testing.expect(std.mem.indexOf(u8, svc.name, "/") == null);
        try std.testing.expect(std.mem.indexOf(u8, svc.name, "\\") == null);
        try std.testing.expect(svc.name.len > 0);
    }
}

test "Service display names contain proper capitalization" {
    const allocator = std.testing.allocator;

    var redis = try definitions.Services.redis(allocator, 6379);
    defer redis.deinit(allocator);

    // Display name should start with uppercase
    try std.testing.expect(redis.display_name[0] >= 'A' and redis.display_name[0] <= 'Z');

    var meili = try definitions.Services.meilisearch(allocator, 7700);
    defer meili.deinit(allocator);

    try std.testing.expect(meili.display_name[0] >= 'A' and meili.display_name[0] <= 'Z');
}

// ============================================================================
// Memory and Resource Tests
// ============================================================================

test "ServiceConfig memory cleanup - all three services" {
    const allocator = std.testing.allocator;

    // Create and destroy each service to verify no memory leaks
    {
        var pg = try definitions.Services.postgresql(allocator, 5432);
        defer pg.deinit(allocator);
    }

    {
        var redis = try definitions.Services.redis(allocator, 6379);
        defer redis.deinit(allocator);
    }

    {
        var meili = try definitions.Services.meilisearch(allocator, 7700);
        defer meili.deinit(allocator);
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

    // If we get here without leaks (testing allocator checks), memory cleanup works
    try std.testing.expect(true);
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
// Plist Generation Tests (macOS-specific, verifies content not file I/O)
// ============================================================================

test "Plist label format for services" {
    const allocator = std.testing.allocator;

    // Verify that the launchd label follows the com.pantry.{name} convention
    const services_to_check = [_][]const u8{ "postgres", "redis", "meilisearch" };
    for (services_to_check) |name| {
        const label = try std.fmt.allocPrint(allocator, "com.pantry.{s}", .{name});
        defer allocator.free(label);

        try std.testing.expect(std.mem.startsWith(u8, label, "com.pantry."));
        try std.testing.expect(label.len > "com.pantry.".len);
    }
}

test "Plist file path format" {
    const allocator = std.testing.allocator;

    // The plist should be at ~/Library/LaunchAgents/com.pantry.{name}.plist
    const plat = platform.Platform.detect();
    if (plat != .macos) return error.SkipZigTest;

    const service_dir = try plat.userServiceDirectory(allocator);
    defer allocator.free(service_dir);

    const services_to_check = [_][]const u8{ "postgres", "redis", "meilisearch" };
    for (services_to_check) |name| {
        const label = try std.fmt.allocPrint(allocator, "com.pantry.{s}", .{name});
        defer allocator.free(label);

        const plist_path = try std.fmt.allocPrint(allocator, "{s}/{s}.plist", .{ service_dir, label });
        defer allocator.free(plist_path);

        try std.testing.expect(std.mem.endsWith(u8, plist_path, ".plist"));
        try std.testing.expect(std.mem.indexOf(u8, plist_path, "LaunchAgents") != null);
    }
}

// ============================================================================
// Systemd Unit Tests (Linux-specific, verifies format)
// ============================================================================

test "Systemd unit name format" {
    const allocator = std.testing.allocator;

    const services_to_check = [_][]const u8{ "postgres", "redis", "meilisearch" };
    for (services_to_check) |name| {
        const unit_name = try std.fmt.allocPrint(allocator, "pantry-{s}.service", .{name});
        defer allocator.free(unit_name);

        try std.testing.expect(std.mem.startsWith(u8, unit_name, "pantry-"));
        try std.testing.expect(std.mem.endsWith(u8, unit_name, ".service"));
    }
}

// ============================================================================
// WithContext Variant Tests
// ============================================================================

test "PostgreSQL WithContext - null project_root falls back gracefully" {
    const allocator = std.testing.allocator;

    var pg = try definitions.Services.postgresqlWithContext(allocator, 5432, null);
    defer pg.deinit(allocator);

    // Should still produce a valid config even without project context
    try std.testing.expectEqualStrings("postgres", pg.name);
    try std.testing.expect(pg.port.? == 5432);
    try std.testing.expect(pg.start_command.len > 0);
}

test "Redis WithContext - null project_root falls back gracefully" {
    const allocator = std.testing.allocator;

    var redis = try definitions.Services.redisWithContext(allocator, 6379, null);
    defer redis.deinit(allocator);

    try std.testing.expectEqualStrings("redis", redis.name);
    try std.testing.expect(redis.port.? == 6379);
    try std.testing.expect(redis.start_command.len > 0);
}

test "Meilisearch WithContext - null project_root falls back gracefully" {
    const allocator = std.testing.allocator;

    var meili = try definitions.Services.meilisearchWithContext(allocator, 7700, null);
    defer meili.deinit(allocator);

    try std.testing.expectEqualStrings("meilisearch", meili.name);
    try std.testing.expect(meili.port.? == 7700);
    try std.testing.expect(meili.start_command.len > 0);
    try std.testing.expect(meili.working_directory != null);
}

test "WithContext variants with fake project_root" {
    const allocator = std.testing.allocator;

    // Use a non-existent project root - should fall back to global/bare binary
    const fake_root = "/tmp/nonexistent-pantry-test-project";

    var pg = try definitions.Services.postgresqlWithContext(allocator, 5432, fake_root);
    defer pg.deinit(allocator);
    try std.testing.expect(pg.start_command.len > 0);

    var redis = try definitions.Services.redisWithContext(allocator, 6379, fake_root);
    defer redis.deinit(allocator);
    try std.testing.expect(redis.start_command.len > 0);

    var meili = try definitions.Services.meilisearchWithContext(allocator, 7700, fake_root);
    defer meili.deinit(allocator);
    try std.testing.expect(meili.start_command.len > 0);
}

// ============================================================================
// ServiceManager Full Lifecycle Test
// ============================================================================

test "ServiceManager full lifecycle: register, get, list, unregister" {
    const allocator = std.testing.allocator;

    var mgr = manager.ServiceManager.init(allocator);
    defer mgr.deinit();

    // 1. Start empty
    try std.testing.expect(mgr.services.count() == 0);

    // 2. Register all three
    const pg = try definitions.Services.postgresql(allocator, 5432);
    try mgr.register(pg);
    const redis = try definitions.Services.redis(allocator, 6379);
    try mgr.register(redis);
    const meili = try definitions.Services.meilisearch(allocator, 7700);
    try mgr.register(meili);

    try std.testing.expect(mgr.services.count() == 3);

    // 3. Get each and verify
    {
        const svc = mgr.getService("postgres").?;
        try std.testing.expectEqualStrings("PostgreSQL", svc.display_name);
    }
    {
        const svc = mgr.getService("redis").?;
        try std.testing.expectEqualStrings("Redis", svc.display_name);
    }
    {
        const svc = mgr.getService("meilisearch").?;
        try std.testing.expectEqualStrings("Meilisearch", svc.display_name);
    }

    // 4. List services
    {
        const list = try mgr.listServices();
        defer allocator.free(list);
        try std.testing.expect(list.len == 3);
    }

    // 5. Unregister one
    try mgr.unregister("redis");
    try std.testing.expect(mgr.services.count() == 2);
    try std.testing.expect(mgr.getService("redis") == null);

    // 6. Non-existent unregister returns error
    try std.testing.expectError(error.ServiceNotFound, mgr.unregister("redis"));

    // 7. Remaining services still accessible
    try std.testing.expect(mgr.getService("postgres") != null);
    try std.testing.expect(mgr.getService("meilisearch") != null);
}

// ============================================================================
// Integration-style Tests (verify service configs match deps.yaml expectations)
// ============================================================================

test "deps.yaml autoStart service names match getDefaultPort" {
    // The deps.yaml format uses bare names: postgres, redis, meilisearch
    // These must all be recognized by getDefaultPort
    const autostart_services = [_][]const u8{ "postgres", "redis", "meilisearch" };

    for (autostart_services) |name| {
        const port = definitions.Services.getDefaultPort(name);
        try std.testing.expect(port != null);
    }
}

test "deps.yaml autoStart services can all be created as ServiceConfig" {
    const allocator = std.testing.allocator;

    // Simulate what autoStartServicesFromYaml does
    const autostart_names = [_][]const u8{ "postgres", "redis", "meilisearch" };
    const expected_ports = [_]u16{ 5432, 6379, 7700 };

    for (autostart_names, expected_ports) |name, expected_port| {
        const port = definitions.Services.getDefaultPort(name).?;
        try std.testing.expect(port == expected_port);

        // Create the service config (this is what the shell:activate flow does)
        if (std.mem.eql(u8, name, "postgres")) {
            var svc = try definitions.Services.postgresql(allocator, port);
            defer svc.deinit(allocator);
            try std.testing.expect(svc.start_command.len > 0);
        } else if (std.mem.eql(u8, name, "redis")) {
            var svc = try definitions.Services.redis(allocator, port);
            defer svc.deinit(allocator);
            try std.testing.expect(svc.start_command.len > 0);
        } else if (std.mem.eql(u8, name, "meilisearch")) {
            var svc = try definitions.Services.meilisearch(allocator, port);
            defer svc.deinit(allocator);
            try std.testing.expect(svc.start_command.len > 0);
            // Meilisearch must have working_directory set for macOS launchd
            try std.testing.expect(svc.working_directory != null);
        }
    }
}

test "stripDisplayPrefix handles auto: prefix" {
    try std.testing.expectEqualStrings("redis", install_helpers.stripDisplayPrefix("auto:redis"));
    try std.testing.expectEqualStrings("postgres", install_helpers.stripDisplayPrefix("auto:postgres"));
    try std.testing.expectEqualStrings("meilisearch", install_helpers.stripDisplayPrefix("meilisearch"));
    try std.testing.expectEqualStrings("npm:lodash", install_helpers.stripDisplayPrefix("npm:lodash"));
}
