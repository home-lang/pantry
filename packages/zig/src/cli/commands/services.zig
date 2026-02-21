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
    style.print("Available Services ({d} total):\n\n", .{62});

    // Databases (22)
    style.print("[Databases]\n", .{});
    style.print("  {s: <16} PostgreSQL                   (port 5432)\n", .{"postgres"});
    style.print("  {s: <16} Redis                        (port 6379)\n", .{"redis"});
    style.print("  {s: <16} MySQL                        (port 3306)\n", .{"mysql"});
    style.print("  {s: <16} MariaDB                      (port 3306)\n", .{"mariadb"});
    style.print("  {s: <16} MongoDB                      (port 27017)\n", .{"mongodb"});
    style.print("  {s: <16} Meilisearch                  (port 7700)\n", .{"meilisearch"});
    style.print("  {s: <16} Elasticsearch                (port 9200)\n", .{"elasticsearch"});
    style.print("  {s: <16} OpenSearch                   (port 9200)\n", .{"opensearch"});
    style.print("  {s: <16} InfluxDB                     (port 8086)\n", .{"influxdb"});
    style.print("  {s: <16} CockroachDB                  (port 26257)\n", .{"cockroachdb"});
    style.print("  {s: <16} Neo4j                        (port 7474)\n", .{"neo4j"});
    style.print("  {s: <16} ClickHouse                   (port 8123)\n", .{"clickhouse"});
    style.print("  {s: <16} Memcached                    (port 11211)\n", .{"memcached"});
    style.print("  {s: <16} CouchDB                      (port 5984)\n", .{"couchdb"});
    style.print("  {s: <16} Cassandra                    (port 9042)\n", .{"cassandra"});
    style.print("  {s: <16} SurrealDB                    (port 8000)\n", .{"surrealdb"});
    style.print("  {s: <16} Typesense                    (port 8108)\n", .{"typesense"});
    style.print("  {s: <16} TiDB                         (port 4000)\n", .{"tidb"});
    style.print("  {s: <16} Valkey                       (port 6379)\n", .{"valkey"});
    style.print("  {s: <16} DragonflyDB                  (port 6379)\n", .{"dragonflydb"});
    style.print("  {s: <16} KeyDB                        (port 6379)\n", .{"keydb"});
    style.print("  {s: <16} ScyllaDB                     (port 9042)\n", .{"scylladb"});
    style.print("  {s: <16} FerretDB                     (port 27018)\n", .{"ferretdb"});

    // Message Queues (6)
    style.print("\n[Message Queues & Streaming]\n", .{});
    style.print("  {s: <16} Apache Kafka                 (port 9092)\n", .{"kafka"});
    style.print("  {s: <16} RabbitMQ                     (port 5672)\n", .{"rabbitmq"});
    style.print("  {s: <16} Apache Pulsar                (port 6650)\n", .{"pulsar"});
    style.print("  {s: <16} NATS                         (port 4222)\n", .{"nats"});
    style.print("  {s: <16} Mosquitto MQTT               (port 1883)\n", .{"mosquitto"});
    style.print("  {s: <16} Redpanda                     (port 9092)\n", .{"redpanda"});

    // Monitoring (6)
    style.print("\n[Monitoring & Observability]\n", .{});
    style.print("  {s: <16} Prometheus                   (port 9090)\n", .{"prometheus"});
    style.print("  {s: <16} Grafana                      (port 3000)\n", .{"grafana"});
    style.print("  {s: <16} Jaeger                       (port 16686)\n", .{"jaeger"});
    style.print("  {s: <16} Loki                         (port 3100)\n", .{"loki"});
    style.print("  {s: <16} Alertmanager                 (port 9093)\n", .{"alertmanager"});
    style.print("  {s: <16} VictoriaMetrics              (port 8428)\n", .{"victoriametrics"});

    // Proxy & Load Balancers (4)
    style.print("\n[Proxy & Load Balancers]\n", .{});
    style.print("  {s: <16} Traefik                      (port 8082)\n", .{"traefik"});
    style.print("  {s: <16} HAProxy                      (port 8081)\n", .{"haproxy"});
    style.print("  {s: <16} Varnish                      (port 6081)\n", .{"varnish"});
    style.print("  {s: <16} Envoy                        (port 10000)\n", .{"envoy"});

    // Infrastructure (7)
    style.print("\n[Infrastructure & Tools]\n", .{});
    style.print("  {s: <16} HashiCorp Vault              (port 8200)\n", .{"vault"});
    style.print("  {s: <16} HashiCorp Consul             (port 8500)\n", .{"consul"});
    style.print("  {s: <16} HashiCorp Nomad              (port 4646)\n", .{"nomad"});
    style.print("  {s: <16} etcd                         (port 2379)\n", .{"etcd"});
    style.print("  {s: <16} MinIO                        (port 9000)\n", .{"minio"});
    style.print("  {s: <16} SonarQube                    (port 9001)\n", .{"sonarqube"});
    style.print("  {s: <16} Temporal                     (port 7233)\n", .{"temporal"});

    // Dev/CI (6)
    style.print("\n[Development & CI/CD]\n", .{});
    style.print("  {s: <16} Jenkins                      (port 8090)\n", .{"jenkins"});
    style.print("  {s: <16} LocalStack                   (port 4566)\n", .{"localstack"});
    style.print("  {s: <16} Verdaccio                    (port 4873)\n", .{"verdaccio"});
    style.print("  {s: <16} Gitea                        (port 3001)\n", .{"gitea"});
    style.print("  {s: <16} Mailpit                      (port 8025)\n", .{"mailpit"});
    style.print("  {s: <16} Ollama                       (port 11434)\n", .{"ollama"});

    // API/Backend (2)
    style.print("\n[API & Backend]\n", .{});
    style.print("  {s: <16} Hasura GraphQL               (port 8085)\n", .{"hasura"});
    style.print("  {s: <16} Keycloak                     (port 8088)\n", .{"keycloak"});

    // Web Servers (3)
    style.print("\n[Web Servers]\n", .{});
    style.print("  {s: <16} Nginx                        (port 8080)\n", .{"nginx"});
    style.print("  {s: <16} Caddy                        (port 2015)\n", .{"caddy"});
    style.print("  {s: <16} Apache httpd                 (port 8084)\n", .{"httpd"});

    // DNS & Network (3)
    style.print("\n[DNS & Network]\n", .{});
    style.print("  {s: <16} dnsmasq                      (port 5353)\n", .{"dnsmasq"});
    style.print("  {s: <16} CoreDNS                      (port 1053)\n", .{"coredns"});
    style.print("  {s: <16} Unbound                      (port 5335)\n", .{"unbound"});

    // Sync & Storage (1)
    style.print("\n[Sync & Storage]\n", .{});
    style.print("  {s: <16} Syncthing                    (port 8384)\n", .{"syncthing"});

    // Network & Security (1)
    style.print("\n[Network & Security]\n", .{});
    style.print("  {s: <16} Tor                          (port 9050)\n", .{"tor"});

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
    } else if (std.mem.eql(u8, name, "mariadb")) {
        return try Services.mariadb(allocator, port);
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
    } else if (std.mem.eql(u8, name, "opensearch")) {
        return try Services.opensearch(allocator, port);
    } else if (std.mem.eql(u8, name, "couchdb")) {
        return try Services.couchdb(allocator, port);
    } else if (std.mem.eql(u8, name, "cassandra")) {
        return try Services.cassandra(allocator, port);
    } else if (std.mem.eql(u8, name, "surrealdb")) {
        return try Services.surrealdb(allocator, port);
    } else if (std.mem.eql(u8, name, "dragonflydb")) {
        return try Services.dragonflydb(allocator, port);
    } else if (std.mem.eql(u8, name, "typesense")) {
        return try Services.typesense(allocator, port);
    } else if (std.mem.eql(u8, name, "ferretdb")) {
        return try Services.ferretdb(allocator, port);
    } else if (std.mem.eql(u8, name, "tidb")) {
        return try Services.tidb(allocator, port);
    } else if (std.mem.eql(u8, name, "scylladb")) {
        return try Services.scylladb(allocator, port);
    } else if (std.mem.eql(u8, name, "keydb")) {
        return try Services.keydb(allocator, port);
    } else if (std.mem.eql(u8, name, "valkey")) {
        return try Services.valkey(allocator, port);
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
    } else if (std.mem.eql(u8, name, "mosquitto")) {
        return try Services.mosquitto(allocator, port);
    } else if (std.mem.eql(u8, name, "redpanda")) {
        return try Services.redpanda(allocator, port);
    }
    // Monitoring
    else if (std.mem.eql(u8, name, "prometheus")) {
        return try Services.prometheus(allocator, port);
    } else if (std.mem.eql(u8, name, "grafana")) {
        return try Services.grafana(allocator, port);
    } else if (std.mem.eql(u8, name, "jaeger")) {
        return try Services.jaeger(allocator, port);
    } else if (std.mem.eql(u8, name, "loki")) {
        return try Services.loki(allocator, port);
    } else if (std.mem.eql(u8, name, "alertmanager")) {
        return try Services.alertmanager(allocator, port);
    } else if (std.mem.eql(u8, name, "victoriametrics")) {
        return try Services.victoriametrics(allocator, port);
    }
    // Proxy & Load Balancers
    else if (std.mem.eql(u8, name, "traefik")) {
        return try Services.traefik(allocator, port);
    } else if (std.mem.eql(u8, name, "haproxy")) {
        return try Services.haproxy(allocator, port);
    } else if (std.mem.eql(u8, name, "varnish")) {
        return try Services.varnish(allocator, port);
    } else if (std.mem.eql(u8, name, "envoy")) {
        return try Services.envoy(allocator, port);
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
    } else if (std.mem.eql(u8, name, "nomad")) {
        return try Services.nomad(allocator, port);
    }
    // Dev/CI
    else if (std.mem.eql(u8, name, "jenkins")) {
        return try Services.jenkins(allocator, port);
    } else if (std.mem.eql(u8, name, "localstack")) {
        return try Services.localstack(allocator, port);
    } else if (std.mem.eql(u8, name, "verdaccio")) {
        return try Services.verdaccio(allocator, port);
    } else if (std.mem.eql(u8, name, "gitea")) {
        return try Services.gitea(allocator, port);
    } else if (std.mem.eql(u8, name, "mailpit")) {
        return try Services.mailpit(allocator, port);
    } else if (std.mem.eql(u8, name, "ollama")) {
        return try Services.ollama(allocator, port);
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
    } else if (std.mem.eql(u8, name, "httpd")) {
        return try Services.httpd(allocator, port);
    }
    // DNS & Network
    else if (std.mem.eql(u8, name, "dnsmasq")) {
        return try Services.dnsmasq(allocator, port);
    } else if (std.mem.eql(u8, name, "coredns")) {
        return try Services.coredns(allocator, port);
    } else if (std.mem.eql(u8, name, "unbound")) {
        return try Services.unbound(allocator, port);
    }
    // Sync & Storage
    else if (std.mem.eql(u8, name, "syncthing")) {
        return try Services.syncthing(allocator, port);
    }
    // Network & Security
    else if (std.mem.eql(u8, name, "tor")) {
        return try Services.tor(allocator, port);
    } else {
        return error.UnknownService;
    }
}
