//! Service management commands

const std = @import("std");
const lib = @import("../../lib.zig");
const common = @import("common.zig");
const style = @import("../style.zig");
const services = lib.services;

const CommandResult = common.CommandResult;
const ServiceManager = services.ServiceManager;
const ServiceConfig = services.ServiceConfig;
const Services = services.Services;

pub fn servicesCommand(_: std.mem.Allocator) !CommandResult {
    style.print("Available Services ({d} total):\n\n", .{31});

    // Databases (11)
    style.print("[Databases]\n", .{});
    style.print("  {s: <14} PostgreSQL                   (port 5432)\n", .{"postgres"});
    style.print("  {s: <14} Redis                        (port 6379)\n", .{"redis"});
    style.print("  {s: <14} MySQL                        (port 3306)\n", .{"mysql"});
    style.print("  {s: <14} MongoDB                      (port 27017)\n", .{"mongodb"});
    style.print("  {s: <14} InfluxDB                     (port 8086)\n", .{"influxdb"});
    style.print("  {s: <14} CockroachDB                  (port 26257)\n", .{"cockroachdb"});
    style.print("  {s: <14} Neo4j                        (port 7474)\n", .{"neo4j"});
    style.print("  {s: <14} ClickHouse                   (port 8123)\n", .{"clickhouse"});
    style.print("  {s: <14} Memcached                    (port 11211)\n", .{"memcached"});
    style.print("  {s: <14} Elasticsearch                (port 9200)\n", .{"elasticsearch"});

    // Message Queues (4)
    style.print("\n[Message Queues & Streaming]\n", .{});
    style.print("  {s: <14} Apache Kafka                 (port 9092)\n", .{"kafka"});
    style.print("  {s: <14} RabbitMQ                     (port 5672)\n", .{"rabbitmq"});
    style.print("  {s: <14} Apache Pulsar                (port 6650)\n", .{"pulsar"});
    style.print("  {s: <14} NATS                         (port 4222)\n", .{"nats"});

    // Monitoring (3)
    style.print("\n[Monitoring & Observability]\n", .{});
    style.print("  {s: <14} Prometheus                   (port 9090)\n", .{"prometheus"});
    style.print("  {s: <14} Grafana                      (port 3000)\n", .{"grafana"});
    style.print("  {s: <14} Jaeger                       (port 16686)\n", .{"jaeger"});

    // Infrastructure (6)
    style.print("\n[Infrastructure & Tools]\n", .{});
    style.print("  {s: <14} HashiCorp Vault              (port 8200)\n", .{"vault"});
    style.print("  {s: <14} HashiCorp Consul             (port 8500)\n", .{"consul"});
    style.print("  {s: <14} etcd                         (port 2379)\n", .{"etcd"});
    style.print("  {s: <14} MinIO                        (port 9000)\n", .{"minio"});
    style.print("  {s: <14} SonarQube                    (port 9001)\n", .{"sonarqube"});
    style.print("  {s: <14} Temporal                     (port 7233)\n", .{"temporal"});

    // Dev/CI (3)
    style.print("\n[Development & CI/CD]\n", .{});
    style.print("  {s: <14} Jenkins                      (port 8090)\n", .{"jenkins"});
    style.print("  {s: <14} LocalStack                   (port 4566)\n", .{"localstack"});
    style.print("  {s: <14} Verdaccio                    (port 4873)\n", .{"verdaccio"});

    // API/Backend (2)
    style.print("\n[API & Backend]\n", .{});
    style.print("  {s: <14} Hasura GraphQL               (port 8085)\n", .{"hasura"});
    style.print("  {s: <14} Keycloak                     (port 8088)\n", .{"keycloak"});

    // Web Servers (2)
    style.print("\n[Web Servers]\n", .{});
    style.print("  {s: <14} Nginx                        (port 8080)\n", .{"nginx"});
    style.print("  {s: <14} Caddy                        (port 2015)\n", .{"caddy"});

    style.print("\n[Usage]\n", .{});
    style.print("  pantry service start <service>      Start a service\n", .{});
    style.print("  pantry service stop <service>       Stop a service\n", .{});
    style.print("  pantry service restart <service>    Restart a service\n", .{});
    style.print("  pantry service status <service>     Show service status\n", .{});
    style.print("  pantry service enable <service>     Enable auto-start\n", .{});
    style.print("  pantry service disable <service>    Disable auto-start\n", .{});

    return .{ .exit_code = 0 };
}

pub fn startCommand(allocator: std.mem.Allocator, args: []const []const u8) !CommandResult {
    // Try to detect project root from CWD for binary path resolution
    const io_helper = @import("../../io_helper.zig");
    const detector = @import("../../deps/detector.zig");
    const cwd = io_helper.getCwdAlloc(allocator) catch return startCommandWithContext(allocator, args, null);
    defer allocator.free(cwd);

    const lookup = detector.findDepsAndWorkspaceFile(allocator, cwd) catch return startCommandWithContext(allocator, args, null);
    if (lookup.workspace_file) |ws| {
        defer allocator.free(ws.path);
        defer allocator.free(ws.root_dir);
        if (lookup.deps_file) |df| allocator.free(df.path);
        return startCommandWithContext(allocator, args, ws.root_dir);
    }
    if (lookup.deps_file) |df| {
        const project_root = std.fs.path.dirname(df.path) orelse cwd;
        defer allocator.free(df.path);
        return startCommandWithContext(allocator, args, project_root);
    }
    return startCommandWithContext(allocator, args, null);
}

pub fn startCommandWithContext(allocator: std.mem.Allocator, args: []const []const u8, project_root: ?[]const u8) !CommandResult {
    if (args.len == 0) {
        return CommandResult.err(allocator, "Error: No service specified\nUsage: pantry service start <service>");
    }

    const service_name = args[0];

    // Initialize service manager
    var manager = ServiceManager.init(allocator);
    defer manager.deinit();

    // Register the service based on its name (with project context for path resolution)
    const service_config = try getServiceConfig(allocator, service_name, project_root);
    const canonical_name = try allocator.dupe(u8, service_config.name);
    defer allocator.free(canonical_name);
    try manager.register(service_config);

    style.print("Starting {s}...\n", .{service_name});

    // Use canonical name (registered name) for manager operations
    manager.start(canonical_name) catch |err| {
        const msg = try std.fmt.allocPrint(
            allocator,
            "Failed to start {s}: {}\nMake sure the service binary is installed.",
            .{ service_name, err },
        );
        return .{ .exit_code = 1, .message = msg };
    };

    style.print("✓ Started {s}\n", .{service_name});
    return .{ .exit_code = 0 };
}

pub fn stopCommand(allocator: std.mem.Allocator, args: []const []const u8) !CommandResult {
    if (args.len == 0) {
        return CommandResult.err(allocator, "Error: No service specified\nUsage: pantry service stop <service>");
    }

    const service_name = args[0];

    var manager = ServiceManager.init(allocator);
    defer manager.deinit();

    const service_config = try getServiceConfig(allocator, service_name, null);
    const canonical_name = try allocator.dupe(u8, service_config.name);
    defer allocator.free(canonical_name);
    try manager.register(service_config);

    style.print("Stopping {s}...\n", .{service_name});

    manager.stop(canonical_name) catch |err| {
        const msg = try std.fmt.allocPrint(allocator, "Failed to stop {s}: {}", .{ service_name, err });
        return .{ .exit_code = 1, .message = msg };
    };

    style.print("✓ Stopped {s}\n", .{service_name});
    return .{ .exit_code = 0 };
}

pub fn restartCommand(allocator: std.mem.Allocator, args: []const []const u8) !CommandResult {
    if (args.len == 0) {
        return CommandResult.err(allocator, "Error: No service specified");
    }

    const service_name = args[0];
    style.print("Restarting {s}...\n", .{service_name});
    _ = try stopCommand(allocator, args);
    return try startCommand(allocator, args);
}

pub fn statusCommand(allocator: std.mem.Allocator, args: []const []const u8) !CommandResult {
    if (args.len == 0) {
        style.print("Service Status:\n\n", .{});
        style.print("Use: pantry service status <service>\n", .{});
        return .{ .exit_code = 0 };
    }

    const service_name = args[0];

    var manager = ServiceManager.init(allocator);
    defer manager.deinit();

    const service_config = try getServiceConfig(allocator, service_name, null);
    const canonical_name = try allocator.dupe(u8, service_config.name);
    defer allocator.free(canonical_name);
    try manager.register(service_config);

    const status = manager.status(canonical_name) catch |err| {
        const msg = try std.fmt.allocPrint(allocator, "Failed to get status for {s}: {}", .{ service_name, err });
        return .{ .exit_code = 1, .message = msg };
    };

    style.print("Service: {s}\n", .{service_name});
    style.print("Status:  {s}\n", .{status.toString()});

    return .{ .exit_code = 0 };
}

pub fn enableCommand(allocator: std.mem.Allocator, args: []const []const u8) !CommandResult {
    if (args.len == 0) {
        return CommandResult.err(allocator, "Error: No service specified\nUsage: pantry service enable <service>");
    }

    const service_name = args[0];

    var manager = ServiceManager.init(allocator);
    defer manager.deinit();

    const service_config = try getServiceConfig(allocator, service_name, null);
    const canonical_name = try allocator.dupe(u8, service_config.name);
    defer allocator.free(canonical_name);
    try manager.register(service_config);

    style.print("Enabling {s} (auto-start on boot)...\n", .{service_name});

    manager.controller.enable(canonical_name) catch |err| {
        const msg = try std.fmt.allocPrint(allocator, "Failed to enable {s}: {}", .{ service_name, err });
        return .{ .exit_code = 1, .message = msg };
    };

    style.print("✓ Enabled {s}\n", .{service_name});
    return .{ .exit_code = 0 };
}

pub fn disableCommand(allocator: std.mem.Allocator, args: []const []const u8) !CommandResult {
    if (args.len == 0) {
        return CommandResult.err(allocator, "Error: No service specified\nUsage: pantry service disable <service>");
    }

    const service_name = args[0];

    var manager = ServiceManager.init(allocator);
    defer manager.deinit();

    const service_config = try getServiceConfig(allocator, service_name, null);
    const canonical_name = try allocator.dupe(u8, service_config.name);
    defer allocator.free(canonical_name);
    try manager.register(service_config);

    style.print("Disabling {s} (won't auto-start on boot)...\n", .{service_name});

    manager.controller.disable(canonical_name) catch |err| {
        const msg = try std.fmt.allocPrint(allocator, "Failed to disable {s}: {}", .{ service_name, err });
        return .{ .exit_code = 1, .message = msg };
    };

    style.print("✓ Disabled {s}\n", .{service_name});
    return .{ .exit_code = 0 };
}

/// Get service configuration by name, optionally with project context for path resolution
fn getServiceConfig(allocator: std.mem.Allocator, name: []const u8, project_root: ?[]const u8) !ServiceConfig {
    // Get default port for the service
    const port = Services.getDefaultPort(name) orelse {
        const msg = try std.fmt.allocPrint(allocator, "Unknown service: {s}", .{name});
        defer allocator.free(msg);
        return error.UnknownService;
    };

    // Map service names to their configuration functions
    // Databases
    if (std.mem.eql(u8, name, "postgres") or std.mem.eql(u8, name, "postgresql")) {
        return try Services.postgresqlWithContext(allocator, port, project_root);
    } else if (std.mem.eql(u8, name, "redis")) {
        return try Services.redisWithContext(allocator, port, project_root);
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
    } else if (std.mem.eql(u8, name, "meilisearch")) {
        return try Services.meilisearchWithContext(allocator, port, project_root);
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
