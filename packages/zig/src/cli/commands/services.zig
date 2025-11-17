//! Service management commands

const std = @import("std");
const lib = @import("../../lib.zig");
const common = @import("common.zig");
const services = lib.services;

const CommandResult = common.CommandResult;
const ServiceManager = services.ServiceManager;
const ServiceConfig = services.ServiceConfig;
const Services = services.Services;

pub fn servicesCommand(_: std.mem.Allocator) !CommandResult {
    std.debug.print("Available Services ({d} total):\n\n", .{31});

    // Databases (11)
    std.debug.print("[Databases]\n", .{});
    std.debug.print("  {s: <14} PostgreSQL                   (port 5432)\n", .{"postgres"});
    std.debug.print("  {s: <14} Redis                        (port 6379)\n", .{"redis"});
    std.debug.print("  {s: <14} MySQL                        (port 3306)\n", .{"mysql"});
    std.debug.print("  {s: <14} MongoDB                      (port 27017)\n", .{"mongodb"});
    std.debug.print("  {s: <14} InfluxDB                     (port 8086)\n", .{"influxdb"});
    std.debug.print("  {s: <14} CockroachDB                  (port 26257)\n", .{"cockroachdb"});
    std.debug.print("  {s: <14} Neo4j                        (port 7474)\n", .{"neo4j"});
    std.debug.print("  {s: <14} ClickHouse                   (port 8123)\n", .{"clickhouse"});
    std.debug.print("  {s: <14} Memcached                    (port 11211)\n", .{"memcached"});
    std.debug.print("  {s: <14} Elasticsearch                (port 9200)\n", .{"elasticsearch"});

    // Message Queues (4)
    std.debug.print("\n[Message Queues & Streaming]\n", .{});
    std.debug.print("  {s: <14} Apache Kafka                 (port 9092)\n", .{"kafka"});
    std.debug.print("  {s: <14} RabbitMQ                     (port 5672)\n", .{"rabbitmq"});
    std.debug.print("  {s: <14} Apache Pulsar                (port 6650)\n", .{"pulsar"});
    std.debug.print("  {s: <14} NATS                         (port 4222)\n", .{"nats"});

    // Monitoring (3)
    std.debug.print("\n[Monitoring & Observability]\n", .{});
    std.debug.print("  {s: <14} Prometheus                   (port 9090)\n", .{"prometheus"});
    std.debug.print("  {s: <14} Grafana                      (port 3000)\n", .{"grafana"});
    std.debug.print("  {s: <14} Jaeger                       (port 16686)\n", .{"jaeger"});

    // Infrastructure (6)
    std.debug.print("\n[Infrastructure & Tools]\n", .{});
    std.debug.print("  {s: <14} HashiCorp Vault              (port 8200)\n", .{"vault"});
    std.debug.print("  {s: <14} HashiCorp Consul             (port 8500)\n", .{"consul"});
    std.debug.print("  {s: <14} etcd                         (port 2379)\n", .{"etcd"});
    std.debug.print("  {s: <14} MinIO                        (port 9000)\n", .{"minio"});
    std.debug.print("  {s: <14} SonarQube                    (port 9001)\n", .{"sonarqube"});
    std.debug.print("  {s: <14} Temporal                     (port 7233)\n", .{"temporal"});

    // Dev/CI (3)
    std.debug.print("\n[Development & CI/CD]\n", .{});
    std.debug.print("  {s: <14} Jenkins                      (port 8090)\n", .{"jenkins"});
    std.debug.print("  {s: <14} LocalStack                   (port 4566)\n", .{"localstack"});
    std.debug.print("  {s: <14} Verdaccio                    (port 4873)\n", .{"verdaccio"});

    // API/Backend (2)
    std.debug.print("\n[API & Backend]\n", .{});
    std.debug.print("  {s: <14} Hasura GraphQL               (port 8085)\n", .{"hasura"});
    std.debug.print("  {s: <14} Keycloak                     (port 8088)\n", .{"keycloak"});

    // Web Servers (2)
    std.debug.print("\n[Web Servers]\n", .{});
    std.debug.print("  {s: <14} Nginx                        (port 8080)\n", .{"nginx"});
    std.debug.print("  {s: <14} Caddy                        (port 2015)\n", .{"caddy"});

    std.debug.print("\n[Usage]\n", .{});
    std.debug.print("  pantry service start <service>      Start a service\n", .{});
    std.debug.print("  pantry service stop <service>       Stop a service\n", .{});
    std.debug.print("  pantry service restart <service>    Restart a service\n", .{});
    std.debug.print("  pantry service status <service>     Show service status\n", .{});
    std.debug.print("  pantry service enable <service>     Enable auto-start\n", .{});
    std.debug.print("  pantry service disable <service>    Disable auto-start\n", .{});

    return .{ .exit_code = 0 };
}

pub fn startCommand(allocator: std.mem.Allocator, args: []const []const u8) !CommandResult {
    if (args.len == 0) {
        return CommandResult.err(allocator, "Error: No service specified\nUsage: pantry service start <service>");
    }

    const service_name = args[0];

    // Initialize service manager
    var manager = ServiceManager.init(allocator);
    defer manager.deinit();

    // Register the service based on its name
    const service_config = try getServiceConfig(allocator, service_name);
    try manager.register(service_config);

    std.debug.print("Starting {s}...\n", .{service_name});

    manager.start(service_name) catch |err| {
        const msg = try std.fmt.allocPrint(
            allocator,
            "Failed to start {s}: {}\nMake sure the service binary is installed.",
            .{ service_name, err },
        );
        return .{ .exit_code = 1, .message = msg };
    };

    std.debug.print("✓ Started {s}\n", .{service_name});
    return .{ .exit_code = 0 };
}

pub fn stopCommand(allocator: std.mem.Allocator, args: []const []const u8) !CommandResult {
    if (args.len == 0) {
        return CommandResult.err(allocator, "Error: No service specified\nUsage: pantry service stop <service>");
    }

    const service_name = args[0];

    var manager = ServiceManager.init(allocator);
    defer manager.deinit();

    const service_config = try getServiceConfig(allocator, service_name);
    try manager.register(service_config);

    std.debug.print("Stopping {s}...\n", .{service_name});

    manager.stop(service_name) catch |err| {
        const msg = try std.fmt.allocPrint(allocator, "Failed to stop {s}: {}", .{ service_name, err });
        return .{ .exit_code = 1, .message = msg };
    };

    std.debug.print("✓ Stopped {s}\n", .{service_name});
    return .{ .exit_code = 0 };
}

pub fn restartCommand(allocator: std.mem.Allocator, args: []const []const u8) !CommandResult {
    if (args.len == 0) {
        return CommandResult.err(allocator, "Error: No service specified");
    }

    const service_name = args[0];
    std.debug.print("Restarting {s}...\n", .{service_name});
    _ = try stopCommand(allocator, args);
    return try startCommand(allocator, args);
}

pub fn statusCommand(allocator: std.mem.Allocator, args: []const []const u8) !CommandResult {
    if (args.len == 0) {
        std.debug.print("Service Status:\n\n", .{});
        std.debug.print("Use: pantry service status <service>\n", .{});
        return .{ .exit_code = 0 };
    }

    const service_name = args[0];

    // Initialize service manager
    var manager = ServiceManager.init(allocator);
    defer manager.deinit();

    // Register the service
    const service_config = try getServiceConfig(allocator, service_name);
    try manager.register(service_config);

    const status = manager.status(service_name) catch |err| {
        const msg = try std.fmt.allocPrint(allocator, "Failed to get status for {s}: {}", .{ service_name, err });
        return .{ .exit_code = 1, .message = msg };
    };

    std.debug.print("Service: {s}\n", .{service_name});
    std.debug.print("Status:  {s}\n", .{status.toString()});

    return .{ .exit_code = 0 };
}

pub fn enableCommand(allocator: std.mem.Allocator, args: []const []const u8) !CommandResult {
    if (args.len == 0) {
        return CommandResult.err(allocator, "Error: No service specified\nUsage: pantry service enable <service>");
    }

    const service_name = args[0];

    var manager = ServiceManager.init(allocator);
    defer manager.deinit();

    const service_config = try getServiceConfig(allocator, service_name);
    try manager.register(service_config);

    std.debug.print("Enabling {s} (auto-start on boot)...\n", .{service_name});

    manager.controller.enable(service_name) catch |err| {
        const msg = try std.fmt.allocPrint(allocator, "Failed to enable {s}: {}", .{ service_name, err });
        return .{ .exit_code = 1, .message = msg };
    };

    std.debug.print("✓ Enabled {s}\n", .{service_name});
    return .{ .exit_code = 0 };
}

pub fn disableCommand(allocator: std.mem.Allocator, args: []const []const u8) !CommandResult {
    if (args.len == 0) {
        return CommandResult.err(allocator, "Error: No service specified\nUsage: pantry service disable <service>");
    }

    const service_name = args[0];

    var manager = ServiceManager.init(allocator);
    defer manager.deinit();

    const service_config = try getServiceConfig(allocator, service_name);
    try manager.register(service_config);

    std.debug.print("Disabling {s} (won't auto-start on boot)...\n", .{service_name});

    manager.controller.disable(service_name) catch |err| {
        const msg = try std.fmt.allocPrint(allocator, "Failed to disable {s}: {}", .{ service_name, err });
        return .{ .exit_code = 1, .message = msg };
    };

    std.debug.print("✓ Disabled {s}\n", .{service_name});
    return .{ .exit_code = 0 };
}

/// Get service configuration by name
fn getServiceConfig(allocator: std.mem.Allocator, name: []const u8) !ServiceConfig {
    // Get default port for the service
    const port = Services.getDefaultPort(name) orelse {
        const msg = try std.fmt.allocPrint(allocator, "Unknown service: {s}", .{name});
        defer allocator.free(msg);
        return error.UnknownService;
    };

    // Map service names to their configuration functions
    // Databases
    if (std.mem.eql(u8, name, "postgres") or std.mem.eql(u8, name, "postgresql")) {
        return try Services.postgresql(allocator, port);
    } else if (std.mem.eql(u8, name, "redis")) {
        return try Services.redis(allocator, port);
    } else if (std.mem.eql(u8, name, "mysql")) {
        return try Services.mysql(allocator, port);
    } else if (std.mem.eql(u8, name, "mongodb")) {
        return try Services.mongodb(allocator, port);
    } else if (std.mem.eql(u8, name, "influxdb")) {
        return try Services.influxdb(allocator, port);
    } else if (std.mem.eql(u8, name, "cockroachdb")) {
        return try Services.cockroachdb(allocator, port);
    } else if (std.mem.eql(u8, name, "neo4j")) {
        return try Services.neo4j(allocator, port);
    } else if (std.mem.eql(u8, name, "clickhouse")) {
        return try Services.clickhouse(allocator, port);
    } else if (std.mem.eql(u8, name, "memcached")) {
        return try Services.memcached(allocator, port);
    } else if (std.mem.eql(u8, name, "elasticsearch")) {
        return try Services.elasticsearch(allocator, port);
    }
    // Message Queues
    else if (std.mem.eql(u8, name, "kafka")) {
        return try Services.kafka(allocator, port);
    } else if (std.mem.eql(u8, name, "rabbitmq")) {
        return try Services.rabbitmq(allocator, port);
    } else if (std.mem.eql(u8, name, "pulsar")) {
        return try Services.pulsar(allocator, port);
    } else if (std.mem.eql(u8, name, "nats")) {
        return try Services.nats(allocator, port);
    }
    // Monitoring
    else if (std.mem.eql(u8, name, "prometheus")) {
        return try Services.prometheus(allocator, port);
    } else if (std.mem.eql(u8, name, "grafana")) {
        return try Services.grafana(allocator, port);
    } else if (std.mem.eql(u8, name, "jaeger")) {
        return try Services.jaeger(allocator, port);
    }
    // Infrastructure
    else if (std.mem.eql(u8, name, "vault")) {
        return try Services.vault(allocator, port);
    } else if (std.mem.eql(u8, name, "consul")) {
        return try Services.consul(allocator, port);
    } else if (std.mem.eql(u8, name, "etcd")) {
        return try Services.etcd(allocator, port);
    } else if (std.mem.eql(u8, name, "minio")) {
        return try Services.minio(allocator, port);
    } else if (std.mem.eql(u8, name, "sonarqube")) {
        return try Services.sonarqube(allocator, port);
    } else if (std.mem.eql(u8, name, "temporal")) {
        return try Services.temporal(allocator, port);
    }
    // Dev/CI
    else if (std.mem.eql(u8, name, "jenkins")) {
        return try Services.jenkins(allocator, port);
    } else if (std.mem.eql(u8, name, "localstack")) {
        return try Services.localstack(allocator, port);
    } else if (std.mem.eql(u8, name, "verdaccio")) {
        return try Services.verdaccio(allocator, port);
    }
    // API/Backend
    else if (std.mem.eql(u8, name, "hasura")) {
        return try Services.hasura(allocator, port);
    } else if (std.mem.eql(u8, name, "keycloak")) {
        return try Services.keycloak(allocator, port);
    }
    // Web Servers
    else if (std.mem.eql(u8, name, "nginx")) {
        return try Services.nginx(allocator, port);
    } else if (std.mem.eql(u8, name, "caddy")) {
        return try Services.caddy(allocator, port);
    } else {
        return error.UnknownService;
    }
}
