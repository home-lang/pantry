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

// ============================================================================
// Built-in Service Groups
// ============================================================================

const BuiltinGroup = struct {
    name: []const u8,
    members: []const []const u8,
};

const builtin_groups = [_]BuiltinGroup{
    .{ .name = "db", .members = &.{ "postgres", "redis", "mysql", "mariadb", "mongodb" } },
    .{ .name = "monitoring", .members = &.{ "prometheus", "grafana", "jaeger", "loki" } },
    .{ .name = "queue", .members = &.{ "kafka", "rabbitmq", "nats" } },
    .{ .name = "web", .members = &.{ "nginx", "caddy", "httpd" } },
};

fn resolveBuiltinGroup(name: []const u8) ?[]const []const u8 {
    for (builtin_groups) |group| {
        if (std.mem.eql(u8, name, group.name)) return group.members;
    }
    return null;
}

/// Resolve a user-defined group from deps.yaml
fn resolveUserGroup(allocator: std.mem.Allocator, name: []const u8) ?[]const []const u8 {
    const io_helper = @import("../../io_helper.zig");
    const cwd = io_helper.getCwdAlloc(allocator) catch return null;
    defer allocator.free(cwd);

    const yaml_files = [_][]const u8{ "deps.yaml", "deps.yml", "dependencies.yaml" };
    for (yaml_files) |yaml_name| {
        const candidate = std.fs.path.join(allocator, &[_][]const u8{ cwd, yaml_name }) catch continue;
        defer allocator.free(candidate);

        const content = io_helper.readFileAlloc(allocator, candidate, 1 * 1024 * 1024) catch continue;
        defer allocator.free(content);

        return parseUserGroup(allocator, content, name);
    }
    return null;
}

fn parseUserGroup(allocator: std.mem.Allocator, content: []const u8, group_name: []const u8) ?[]const []const u8 {
    var in_services = false;
    var in_groups = false;
    var in_target_group = false;
    var members: std.ArrayList([]const u8) = .{};

    var line_iter = std.mem.splitScalar(u8, content, '\n');
    while (line_iter.next()) |line| {
        const trimmed = std.mem.trim(u8, line, " \t\r");
        if (trimmed.len == 0 or trimmed[0] == '#') continue;

        // Detect top-level sections
        if (trimmed.len > 0 and trimmed[0] != ' ' and trimmed[0] != '-' and !std.mem.startsWith(u8, line, " ") and !std.mem.startsWith(u8, line, "\t")) {
            if (std.mem.eql(u8, trimmed, "services:")) {
                in_services = true;
                in_groups = false;
                in_target_group = false;
            } else {
                in_services = false;
                in_groups = false;
                in_target_group = false;
            }
            continue;
        }

        if (!in_services) continue;

        if (std.mem.eql(u8, trimmed, "groups:")) {
            in_groups = true;
            in_target_group = false;
            continue;
        }

        if (in_groups and !in_target_group) {
            // Check for "groupname:" pattern
            if (std.mem.endsWith(u8, trimmed, ":")) {
                const gname = trimmed[0 .. trimmed.len - 1];
                if (std.mem.eql(u8, gname, group_name)) {
                    in_target_group = true;
                }
            }
            continue;
        }

        if (in_target_group) {
            if (std.mem.startsWith(u8, trimmed, "- ")) {
                const svc_name = std.mem.trim(u8, trimmed[2..], " \t\r");
                if (svc_name.len > 0) {
                    const duped = allocator.dupe(u8, svc_name) catch continue;
                    members.append(allocator, duped) catch {
                        allocator.free(duped);
                        continue;
                    };
                }
            } else {
                // No longer in the list
                break;
            }
        }
    }

    if (members.items.len == 0) {
        members.deinit(allocator);
        return null;
    }

    return members.toOwnedSlice(allocator) catch {
        for (members.items) |m| allocator.free(m);
        members.deinit(allocator);
        return null;
    };
}

// ============================================================================
// Service Listing
// ============================================================================

pub fn servicesCommand(_: std.mem.Allocator) !CommandResult {
    style.print("Available Services ({d} total):\n\n", .{68});

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

    // Search (2)
    style.print("\n[Search]\n", .{});
    style.print("  {s: <16} Apache Zookeeper             (port 2181)\n", .{"zookeeper"});
    style.print("  {s: <16} Apache Solr                  (port 8983)\n", .{"solr"});

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

    // Application Servers (2)
    style.print("\n[Application Servers]\n", .{});
    style.print("  {s: <16} PHP-FPM                      (port 9074)\n", .{"php-fpm"});
    style.print("  {s: <16} PocketBase                   (port 8095)\n", .{"pocketbase"});

    // DNS & Network (3)
    style.print("\n[DNS & Network]\n", .{});
    style.print("  {s: <16} dnsmasq                      (port 5353)\n", .{"dnsmasq"});
    style.print("  {s: <16} CoreDNS                      (port 1053)\n", .{"coredns"});
    style.print("  {s: <16} Unbound                      (port 5335)\n", .{"unbound"});

    // Tunnels & Secrets (2)
    style.print("\n[Tunnels & Secrets]\n", .{});
    style.print("  {s: <16} Cloudflared                  (no port)\n", .{"cloudflared"});
    style.print("  {s: <16} Doppler                      (no port)\n", .{"doppler"});

    // Sync & Storage (1)
    style.print("\n[Sync & Storage]\n", .{});
    style.print("  {s: <16} Syncthing                    (port 8384)\n", .{"syncthing"});

    // Network & Security (1)
    style.print("\n[Network & Security]\n", .{});
    style.print("  {s: <16} Tor                          (port 9050)\n", .{"tor"});

    // Groups
    style.print("\n[Service Groups]\n", .{});
    style.print("  {s: <16} postgres, redis, mysql, mariadb, mongodb\n", .{"db"});
    style.print("  {s: <16} prometheus, grafana, jaeger, loki\n", .{"monitoring"});
    style.print("  {s: <16} kafka, rabbitmq, nats\n", .{"queue"});
    style.print("  {s: <16} nginx, caddy, httpd\n", .{"web"});
    style.print("  Custom groups can be defined in deps.yaml under services.groups\n", .{});

    style.print("\n[Usage]\n", .{});
    style.print("  pantry service start <service>      Start a service (or group)\n", .{});
    style.print("  pantry service stop <service>       Stop a service (or group)\n", .{});
    style.print("  pantry service restart <service>    Restart a service (or group)\n", .{});
    style.print("  pantry service status <service>     Show service status\n", .{});
    style.print("  pantry service logs <service>       View service logs\n", .{});
    style.print("  pantry service enable <service>     Enable auto-start\n", .{});
    style.print("  pantry service disable <service>    Disable auto-start\n", .{});

    return .{ .exit_code = 0 };
}

// ============================================================================
// Start / Stop / Restart Commands (with group support)
// ============================================================================

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

    // Check if this is a group name
    if (resolveBuiltinGroup(service_name)) |members| {
        return startGroup(allocator, members, project_root);
    }
    if (resolveUserGroup(allocator, service_name)) |members| {
        defer {
            for (members) |m| allocator.free(m);
            allocator.free(members);
        }
        return startGroup(allocator, members, project_root);
    }

    return startSingleService(allocator, service_name, project_root);
}

/// Start a single service (no group resolution — avoids recursive error set)
fn startSingleService(allocator: std.mem.Allocator, service_name: []const u8, project_root: ?[]const u8) !CommandResult {
    // For PostgreSQL, ensure data directory is initialized and version-compatible
    if (std.mem.eql(u8, service_name, "postgres") or std.mem.eql(u8, service_name, "postgresql")) {
        ensurePostgresDataDir(allocator, project_root);
    }

    // Initialize service manager
    var manager = ServiceManager.init(allocator);
    defer manager.deinit();

    // Register the service based on its name (with project context for path resolution)
    const service_config = getServiceConfig(allocator, service_name, project_root) catch {
        const msg = try std.fmt.allocPrint(allocator, "Unknown service: {s}", .{service_name});
        return .{ .exit_code = 1, .message = msg };
    };
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

fn startGroup(allocator: std.mem.Allocator, members: []const []const u8, project_root: ?[]const u8) !CommandResult {
    var failed: u32 = 0;
    for (members) |member| {
        const result = try startSingleService(allocator, member, project_root);
        if (result.exit_code != 0) failed += 1;
        if (result.message) |msg| allocator.free(msg);
    }
    if (failed > 0) {
        const msg = try std.fmt.allocPrint(allocator, "{d} service(s) failed to start", .{failed});
        return .{ .exit_code = 1, .message = msg };
    }
    return .{ .exit_code = 0 };
}

pub fn stopCommand(allocator: std.mem.Allocator, args: []const []const u8) !CommandResult {
    if (args.len == 0) {
        return CommandResult.err(allocator, "Error: No service specified\nUsage: pantry service stop <service>");
    }

    const service_name = args[0];

    // Check if this is a group name
    if (resolveBuiltinGroup(service_name)) |members| {
        return stopGroup(allocator, members);
    }
    if (resolveUserGroup(allocator, service_name)) |members| {
        defer {
            for (members) |m| allocator.free(m);
            allocator.free(members);
        }
        return stopGroup(allocator, members);
    }

    return stopSingleService(allocator, service_name);
}

/// Stop a single service (no group resolution — avoids recursive error set)
fn stopSingleService(allocator: std.mem.Allocator, service_name: []const u8) !CommandResult {
    var manager = ServiceManager.init(allocator);
    defer manager.deinit();

    const service_config = getServiceConfig(allocator, service_name, null) catch {
        const msg = try std.fmt.allocPrint(allocator, "Unknown service: {s}", .{service_name});
        return .{ .exit_code = 1, .message = msg };
    };
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

fn stopGroup(allocator: std.mem.Allocator, members: []const []const u8) !CommandResult {
    var failed: u32 = 0;
    for (members) |member| {
        const result = try stopSingleService(allocator, member);
        if (result.exit_code != 0) failed += 1;
        if (result.message) |msg| allocator.free(msg);
    }
    if (failed > 0) {
        const msg = try std.fmt.allocPrint(allocator, "{d} service(s) failed to stop", .{failed});
        return .{ .exit_code = 1, .message = msg };
    }
    return .{ .exit_code = 0 };
}

pub fn restartCommand(allocator: std.mem.Allocator, args: []const []const u8) !CommandResult {
    if (args.len == 0) {
        return CommandResult.err(allocator, "Error: No service specified");
    }

    const service_name = args[0];

    // Check if this is a group name
    if (resolveBuiltinGroup(service_name)) |members| {
        _ = try stopGroup(allocator, members);
        return startGroup(allocator, members, null);
    }
    if (resolveUserGroup(allocator, service_name)) |members| {
        defer {
            for (members) |m| allocator.free(m);
            allocator.free(members);
        }
        _ = try stopGroup(allocator, members);
        return startGroup(allocator, members, null);
    }

    style.print("Restarting {s}...\n", .{service_name});
    _ = try stopSingleService(allocator, service_name);
    return try startSingleService(allocator, service_name, null);
}

// ============================================================================
// Status / Enable / Disable Commands
// ============================================================================

pub fn statusCommand(allocator: std.mem.Allocator, args: []const []const u8) !CommandResult {
    if (args.len == 0) {
        style.print("Service Status:\n\n", .{});
        style.print("Use: pantry service status <service>\n", .{});
        return .{ .exit_code = 0 };
    }

    const service_name = args[0];

    var manager = ServiceManager.init(allocator);
    defer manager.deinit();

    const service_config = getServiceConfig(allocator, service_name, null) catch {
        const msg = try std.fmt.allocPrint(allocator, "Unknown service: {s}", .{service_name});
        return .{ .exit_code = 1, .message = msg };
    };
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

    const service_config = getServiceConfig(allocator, service_name, null) catch {
        const msg = try std.fmt.allocPrint(allocator, "Unknown service: {s}", .{service_name});
        return .{ .exit_code = 1, .message = msg };
    };
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

    const service_config = getServiceConfig(allocator, service_name, null) catch {
        const msg = try std.fmt.allocPrint(allocator, "Unknown service: {s}", .{service_name});
        return .{ .exit_code = 1, .message = msg };
    };
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

// ============================================================================
// Logs Command
// ============================================================================

pub fn logsCommand(allocator: std.mem.Allocator, args: []const []const u8, follow: bool) !CommandResult {
    if (args.len == 0) {
        return CommandResult.err(allocator, "Error: No service specified\nUsage: pantry service logs <service> [--follow]");
    }

    const service_name = args[0];
    const io_helper = @import("../../io_helper.zig");
    const platform_mod = services.platform;
    const plat = platform_mod.Platform.detect();

    switch (plat) {
        .linux => {
            // Use journalctl for systemd-based services
            const unit_name = try std.fmt.allocPrint(allocator, "pantry-{s}.service", .{service_name});
            defer allocator.free(unit_name);

            if (follow) {
                const result = io_helper.childRun(allocator, &[_][]const u8{
                    "journalctl", "--user", "-u", unit_name, "-f",
                }) catch |err| {
                    const msg = try std.fmt.allocPrint(allocator, "Failed to follow logs for {s}: {s}", .{ service_name, @errorName(err) });
                    return .{ .exit_code = 1, .message = msg };
                };
                defer allocator.free(result.stdout);
                defer allocator.free(result.stderr);
            } else {
                const result = io_helper.childRun(allocator, &[_][]const u8{
                    "journalctl", "--user", "-u", unit_name, "--no-pager", "-n", "100",
                }) catch |err| {
                    const msg = try std.fmt.allocPrint(allocator, "Failed to read logs for {s}: {s}", .{ service_name, @errorName(err) });
                    return .{ .exit_code = 1, .message = msg };
                };
                defer allocator.free(result.stdout);
                defer allocator.free(result.stderr);

                if (result.stdout.len > 0) {
                    style.print("{s}", .{result.stdout});
                }
                if (result.stderr.len > 0) {
                    style.print("{s}", .{result.stderr});
                }
            }
        },
        .macos, .freebsd => {
            // Read from log files
            const home = io_helper.getEnvVarOwned(allocator, "HOME") catch {
                return CommandResult.err(allocator, "Error: Could not determine HOME directory");
            };
            defer allocator.free(home);

            const log_path = try std.fmt.allocPrint(allocator, "{s}/.local/share/pantry/logs/{s}.log", .{ home, service_name });
            defer allocator.free(log_path);

            const err_path = try std.fmt.allocPrint(allocator, "{s}/.local/share/pantry/logs/{s}.err", .{ home, service_name });
            defer allocator.free(err_path);

            if (follow) {
                // Use tail -f on both log files
                const result = io_helper.childRun(allocator, &[_][]const u8{
                    "tail", "-f", log_path, err_path,
                }) catch |err| {
                    const msg = try std.fmt.allocPrint(allocator, "Failed to follow logs for {s}: {s}", .{ service_name, @errorName(err) });
                    return .{ .exit_code = 1, .message = msg };
                };
                defer allocator.free(result.stdout);
                defer allocator.free(result.stderr);
            } else {
                // Print last 100 lines from stdout log
                const stdout_content = io_helper.readFileAlloc(allocator, log_path, 10 * 1024 * 1024) catch null;
                if (stdout_content) |content| {
                    defer allocator.free(content);
                    printLastNLines(content, 100);
                }

                // Print last 100 lines from stderr log
                const stderr_content = io_helper.readFileAlloc(allocator, err_path, 10 * 1024 * 1024) catch null;
                if (stderr_content) |content| {
                    defer allocator.free(content);
                    if (content.len > 0) {
                        style.print("\n--- stderr ---\n", .{});
                        printLastNLines(content, 100);
                    }
                }

                if (stdout_content == null and stderr_content == null) {
                    style.print("No log files found for {s}\n", .{service_name});
                    style.print("Log path: {s}\n", .{log_path});
                }
            }
        },
        else => {
            return CommandResult.err(allocator, "Error: Log viewing not supported on this platform");
        },
    }

    return .{ .exit_code = 0 };
}

fn printLastNLines(content: []const u8, n: usize) void {
    // Find the last N newlines
    var count: usize = 0;
    var pos: usize = content.len;
    while (pos > 0) {
        pos -= 1;
        if (content[pos] == '\n') {
            count += 1;
            if (count >= n + 1) {
                pos += 1;
                break;
            }
        }
    }
    if (pos < content.len) {
        style.print("{s}", .{content[pos..]});
    }
}

// ============================================================================
// Service Config Resolution
// ============================================================================

/// Get service configuration by name, optionally with project context for path resolution
pub fn getServiceConfig(allocator: std.mem.Allocator, name: []const u8, project_root: ?[]const u8) !ServiceConfig {
    // Handle port-less services first
    if (std.mem.eql(u8, name, "cloudflared")) {
        return try Services.cloudflared(allocator);
    } else if (std.mem.eql(u8, name, "doppler")) {
        return try Services.doppler(allocator);
    }

    // Get default port for the service
    const port = Services.getDefaultPort(name) orelse {
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
        return try Services.opensearchWithContext(allocator, port, project_root);
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
    // Search
    else if (std.mem.eql(u8, name, "zookeeper")) {
        return try Services.zookeeper(allocator, port);
    } else if (std.mem.eql(u8, name, "solr")) {
        return try Services.solr(allocator, port);
    }
    // Message Queues
    else if (std.mem.eql(u8, name, "kafka")) {
        return try Services.kafkaWithContext(allocator, port, project_root);
    } else if (std.mem.eql(u8, name, "rabbitmq")) {
        return try Services.rabbitmqWithContext(allocator, port, project_root);
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
    // Application Servers
    else if (std.mem.eql(u8, name, "php-fpm")) {
        return try Services.phpfpm(allocator, port);
    } else if (std.mem.eql(u8, name, "pocketbase")) {
        return try Services.pocketbase(allocator, port);
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

/// Get service configuration with a custom port override
pub fn getServiceConfigWithPort(allocator: std.mem.Allocator, name: []const u8, port: u16, project_root: ?[]const u8) !ServiceConfig {
    // Handle port-less services (ignore port override)
    if (std.mem.eql(u8, name, "cloudflared")) {
        return try Services.cloudflared(allocator);
    } else if (std.mem.eql(u8, name, "doppler")) {
        return try Services.doppler(allocator);
    }

    // Map service names to their configuration functions with custom port
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
    } else if (std.mem.eql(u8, name, "meilisearch")) {
        return try Services.meilisearchWithContext(allocator, port, project_root);
    } else if (std.mem.eql(u8, name, "elasticsearch")) {
        return try Services.elasticsearch(allocator, port);
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
    } else if (std.mem.eql(u8, name, "opensearch")) {
        return try Services.opensearchWithContext(allocator, port, project_root);
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
    } else if (std.mem.eql(u8, name, "kafka")) {
        return try Services.kafkaWithContext(allocator, port, project_root);
    } else if (std.mem.eql(u8, name, "rabbitmq")) {
        return try Services.rabbitmqWithContext(allocator, port, project_root);
    } else if (std.mem.eql(u8, name, "pulsar")) {
        return try Services.pulsar(allocator, port);
    } else if (std.mem.eql(u8, name, "nats")) {
        return try Services.nats(allocator, port);
    } else if (std.mem.eql(u8, name, "mosquitto")) {
        return try Services.mosquitto(allocator, port);
    } else if (std.mem.eql(u8, name, "redpanda")) {
        return try Services.redpanda(allocator, port);
    } else if (std.mem.eql(u8, name, "prometheus")) {
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
    } else if (std.mem.eql(u8, name, "traefik")) {
        return try Services.traefik(allocator, port);
    } else if (std.mem.eql(u8, name, "haproxy")) {
        return try Services.haproxy(allocator, port);
    } else if (std.mem.eql(u8, name, "varnish")) {
        return try Services.varnish(allocator, port);
    } else if (std.mem.eql(u8, name, "envoy")) {
        return try Services.envoy(allocator, port);
    } else if (std.mem.eql(u8, name, "vault")) {
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
    } else if (std.mem.eql(u8, name, "jenkins")) {
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
    } else if (std.mem.eql(u8, name, "hasura")) {
        return try Services.hasura(allocator, port);
    } else if (std.mem.eql(u8, name, "keycloak")) {
        return try Services.keycloak(allocator, port);
    } else if (std.mem.eql(u8, name, "nginx")) {
        return try Services.nginx(allocator, port);
    } else if (std.mem.eql(u8, name, "caddy")) {
        return try Services.caddy(allocator, port);
    } else if (std.mem.eql(u8, name, "httpd")) {
        return try Services.httpd(allocator, port);
    } else if (std.mem.eql(u8, name, "php-fpm")) {
        return try Services.phpfpm(allocator, port);
    } else if (std.mem.eql(u8, name, "pocketbase")) {
        return try Services.pocketbase(allocator, port);
    } else if (std.mem.eql(u8, name, "dnsmasq")) {
        return try Services.dnsmasq(allocator, port);
    } else if (std.mem.eql(u8, name, "coredns")) {
        return try Services.coredns(allocator, port);
    } else if (std.mem.eql(u8, name, "unbound")) {
        return try Services.unbound(allocator, port);
    } else if (std.mem.eql(u8, name, "syncthing")) {
        return try Services.syncthing(allocator, port);
    } else if (std.mem.eql(u8, name, "tor")) {
        return try Services.tor(allocator, port);
    } else if (std.mem.eql(u8, name, "zookeeper")) {
        return try Services.zookeeper(allocator, port);
    } else if (std.mem.eql(u8, name, "solr")) {
        return try Services.solr(allocator, port);
    } else {
        return error.UnknownService;
    }
}

// ============================================================================
// Inspect Command
// ============================================================================

pub fn inspectCommand(allocator: std.mem.Allocator, args: []const []const u8) !CommandResult {
    if (args.len == 0) {
        return CommandResult.err(allocator, "Error: No service specified\nUsage: pantry inspect <service>");
    }

    const service_name = args[0];
    const io_helper = @import("../../io_helper.zig");
    const platform_mod = services.platform;
    const plat = platform_mod.Platform.detect();

    // Detect project context (check for deps.yaml in cwd)
    const cwd = io_helper.getCwdAlloc(allocator) catch null;
    defer if (cwd) |c| allocator.free(c);

    var project_hash: ?[]const u8 = null;
    defer if (project_hash) |ph| allocator.free(ph);

    if (cwd) |c| {
        const yaml_files = [_][]const u8{ "deps.yaml", "deps.yml", "dependencies.yaml" };
        for (yaml_files) |yaml_name| {
            const candidate = std.fs.path.join(allocator, &[_][]const u8{ c, yaml_name }) catch continue;
            defer allocator.free(candidate);
            io_helper.accessAbsolute(candidate, .{}) catch continue;
            project_hash = computeProjectHash(allocator, c) catch null;
            break;
        }
    }

    // Get service configuration
    var config = getServiceConfig(allocator, service_name, cwd) catch {
        const msg = try std.fmt.allocPrint(allocator, "Unknown service: {s}", .{service_name});
        return .{ .exit_code = 1, .message = msg };
    };
    defer config.deinit(allocator);

    const home = io_helper.getEnvVarOwned(allocator, "HOME") catch null;
    defer if (home) |h| allocator.free(h);

    // Config path (project-scoped if in a project)
    const config_path = switch (plat) {
        .macos => if (home) |h| blk: {
            break :blk if (project_hash) |ph|
                try std.fmt.allocPrint(allocator, "{s}/Library/LaunchAgents/com.pantry.{s}.{s}.plist", .{ h, ph, config.name })
            else
                try std.fmt.allocPrint(allocator, "{s}/Library/LaunchAgents/com.pantry.{s}.plist", .{ h, config.name });
        } else try allocator.dupe(u8, "(unknown)"),
        .linux => if (home) |h| blk: {
            break :blk if (project_hash) |ph|
                try std.fmt.allocPrint(allocator, "{s}/.config/systemd/user/pantry-{s}-{s}.service", .{ h, ph, config.name })
            else
                try std.fmt.allocPrint(allocator, "{s}/.config/systemd/user/pantry-{s}.service", .{ h, config.name });
        } else try allocator.dupe(u8, "(unknown)"),
        else => try allocator.dupe(u8, "(unsupported platform)"),
    };
    defer allocator.free(config_path);

    // Data dir (project-scoped if in a project)
    const data_dir = if (home) |h| blk: {
        break :blk if (project_hash) |ph|
            try std.fmt.allocPrint(allocator, "{s}/.local/share/pantry/data/{s}/{s}/", .{ h, ph, config.name })
        else
            try std.fmt.allocPrint(allocator, "{s}/.local/share/pantry/data/{s}/", .{ h, config.name });
    } else try allocator.dupe(u8, "(unknown)");
    defer allocator.free(data_dir);

    // Log paths (project-scoped if in a project)
    const log_path = if (home) |h| blk: {
        break :blk if (project_hash) |ph|
            try std.fmt.allocPrint(allocator, "{s}/.local/share/pantry/logs/{s}/{s}.log", .{ h, ph, config.name })
        else
            try std.fmt.allocPrint(allocator, "{s}/.local/share/pantry/logs/{s}.log", .{ h, config.name });
    } else try allocator.dupe(u8, "(unknown)");
    defer allocator.free(log_path);

    const err_path = if (home) |h| blk: {
        break :blk if (project_hash) |ph|
            try std.fmt.allocPrint(allocator, "{s}/.local/share/pantry/logs/{s}/{s}.err", .{ h, ph, config.name })
        else
            try std.fmt.allocPrint(allocator, "{s}/.local/share/pantry/logs/{s}.err", .{ h, config.name });
    } else try allocator.dupe(u8, "(unknown)");
    defer allocator.free(err_path);

    // Port
    const port_str = if (config.port) |p|
        try std.fmt.allocPrint(allocator, "{d}", .{p})
    else
        try allocator.dupe(u8, "(none)");
    defer allocator.free(port_str);

    // Health check
    const health_str = config.health_check orelse "(none)";

    // Status
    var manager = ServiceManager.init(allocator);
    defer manager.deinit();

    const svc_config = getServiceConfig(allocator, service_name, null) catch {
        const msg = try std.fmt.allocPrint(allocator, "Unknown service: {s}", .{service_name});
        return .{ .exit_code = 1, .message = msg };
    };
    const canonical_name = try allocator.dupe(u8, svc_config.name);
    defer allocator.free(canonical_name);
    try manager.register(svc_config);

    const status = manager.status(canonical_name) catch services.definitions.ServiceStatus.unknown;
    const status_str = status.toString();

    // PID
    var pid_str: []const u8 = try allocator.dupe(u8, "(not running)");
    defer allocator.free(pid_str);

    if (status == .running) {
        switch (plat) {
            .macos => {
                const label = if (project_hash) |ph|
                    try std.fmt.allocPrint(allocator, "com.pantry.{s}.{s}", .{ ph, config.name })
                else
                    try std.fmt.allocPrint(allocator, "com.pantry.{s}", .{config.name});
                defer allocator.free(label);

                const result = io_helper.childRun(allocator, &[_][]const u8{
                    "launchctl", "list", label,
                }) catch null;

                if (result) |r| {
                    defer allocator.free(r.stdout);
                    defer allocator.free(r.stderr);
                    if (r.stdout.len > 0) {
                        // Parse PID from launchctl list output (first line usually has PID)
                        var line_iter = std.mem.splitScalar(u8, r.stdout, '\n');
                        while (line_iter.next()) |line| {
                            const trimmed = std.mem.trim(u8, line, " \t\r");
                            if (std.mem.startsWith(u8, trimmed, "\"PID\"")) {
                                if (std.mem.indexOf(u8, trimmed, "=")) |eq_pos| {
                                    const pid_val = std.mem.trim(u8, trimmed[eq_pos + 1 ..], " \t\r;");
                                    allocator.free(pid_str);
                                    pid_str = try allocator.dupe(u8, pid_val);
                                }
                            }
                        }
                    }
                }
            },
            .linux => {
                const unit = if (project_hash) |ph|
                    try std.fmt.allocPrint(allocator, "pantry-{s}-{s}.service", .{ ph, config.name })
                else
                    try std.fmt.allocPrint(allocator, "pantry-{s}.service", .{config.name});
                defer allocator.free(unit);

                const result = io_helper.childRun(allocator, &[_][]const u8{
                    "systemctl", "--user", "show", unit, "-p", "MainPID", "--value",
                }) catch null;

                if (result) |r| {
                    defer allocator.free(r.stdout);
                    defer allocator.free(r.stderr);
                    const trimmed_pid = std.mem.trim(u8, r.stdout, " \t\r\n");
                    if (trimmed_pid.len > 0 and !std.mem.eql(u8, trimmed_pid, "0")) {
                        allocator.free(pid_str);
                        pid_str = try allocator.dupe(u8, trimmed_pid);
                    }
                }
            },
            else => {},
        }
    }

    // Print formatted output
    style.print("\nService: {s}\n", .{config.display_name});
    style.print("  Name:         {s}\n", .{config.name});
    style.print("  Status:       {s}\n", .{status_str});
    style.print("  PID:          {s}\n", .{pid_str});
    style.print("  Port:         {s}\n", .{port_str});
    if (project_hash) |ph| {
        style.print("  Project:      {s}\n", .{ph});
    }
    style.print("  Config:       {s}\n", .{config_path});
    style.print("  Data Dir:     {s}\n", .{data_dir});
    style.print("  Log (stdout): {s}\n", .{log_path});
    style.print("  Log (stderr): {s}\n", .{err_path});
    style.print("  Health Check: {s}\n", .{health_str});
    style.print("  Command:      {s}\n", .{config.start_command});
    style.print("\n", .{});

    return .{ .exit_code = 0 };
}

// ============================================================================
// Exec Command
// ============================================================================

pub fn execCommand(allocator: std.mem.Allocator, args: []const []const u8) !CommandResult {
    if (args.len < 2) {
        return CommandResult.err(allocator, "Error: Usage: pantry exec <service> <command> [args...]");
    }

    const service_name = args[0];
    const io_helper = @import("../../io_helper.zig");

    // Get service configuration
    var config = getServiceConfig(allocator, service_name, null) catch {
        const msg = try std.fmt.allocPrint(allocator, "Unknown service: {s}", .{service_name});
        return .{ .exit_code = 1, .message = msg };
    };
    defer config.deinit(allocator);

    const home = io_helper.getEnvVarOwned(allocator, "HOME") catch null;
    defer if (home) |h| allocator.free(h);

    // Build the user command from remaining args
    var user_cmd_parts: std.ArrayList(u8) = .{};
    defer user_cmd_parts.deinit(allocator);

    for (args[1..], 0..) |arg, i| {
        if (i > 0) try user_cmd_parts.append(allocator, ' ');
        try user_cmd_parts.appendSlice(allocator, arg);
    }

    // Build export string for environment variables
    var env_exports: std.ArrayList(u8) = .{};
    defer env_exports.deinit(allocator);

    // PORT
    if (config.port) |p| {
        const port_export = try std.fmt.allocPrint(allocator, "export PORT={d} && ", .{p});
        defer allocator.free(port_export);
        try env_exports.appendSlice(allocator, port_export);
    }

    // SERVICE_NAME
    {
        const name_export = try std.fmt.allocPrint(allocator, "export SERVICE_NAME={s} && ", .{config.name});
        defer allocator.free(name_export);
        try env_exports.appendSlice(allocator, name_export);
    }

    // DATA_DIR
    if (home) |h| {
        const data_dir_export = try std.fmt.allocPrint(allocator, "export DATA_DIR={s}/.local/share/pantry/data/{s} && ", .{ h, config.name });
        defer allocator.free(data_dir_export);
        try env_exports.appendSlice(allocator, data_dir_export);
    }

    // Service env vars
    var it = config.env_vars.iterator();
    while (it.next()) |entry| {
        const env_export = try std.fmt.allocPrint(allocator, "export {s}={s} && ", .{ entry.key_ptr.*, entry.value_ptr.* });
        defer allocator.free(env_export);
        try env_exports.appendSlice(allocator, env_export);
    }

    // Build combined command
    var combined: std.ArrayList(u8) = .{};
    defer combined.deinit(allocator);

    try combined.appendSlice(allocator, env_exports.items);

    // cd to working directory if specified
    if (config.working_directory) |wd| {
        const cd_part = try std.fmt.allocPrint(allocator, "cd {s} && ", .{wd});
        defer allocator.free(cd_part);
        try combined.appendSlice(allocator, cd_part);
    }

    try combined.appendSlice(allocator, user_cmd_parts.items);

    // Execute the command
    const result = io_helper.childRun(allocator, &[_][]const u8{
        "sh", "-c", combined.items,
    }) catch |err| {
        const msg = try std.fmt.allocPrint(allocator, "Failed to execute command: {s}", .{@errorName(err)});
        return .{ .exit_code = 1, .message = msg };
    };
    defer allocator.free(result.stdout);
    defer allocator.free(result.stderr);

    if (result.stdout.len > 0) {
        style.print("{s}", .{result.stdout});
    }
    if (result.stderr.len > 0) {
        style.print("{s}", .{result.stderr});
    }

    const exit_code: u8 = if (result.term == .exited) result.term.exited else 1;
    return .{ .exit_code = exit_code };
}

// ============================================================================
// Snapshot Commands
// ============================================================================

pub fn snapshotCommand(allocator: std.mem.Allocator, args: []const []const u8) !CommandResult {
    if (args.len == 0) {
        return CommandResult.err(allocator, "Error: No service specified\nUsage: pantry snapshot <service>");
    }

    const service_name = args[0];
    const io_helper = @import("../../io_helper.zig");

    // Verify service exists
    var config = getServiceConfig(allocator, service_name, null) catch {
        const msg = try std.fmt.allocPrint(allocator, "Unknown service: {s}", .{service_name});
        return .{ .exit_code = 1, .message = msg };
    };
    defer config.deinit(allocator);

    const home = io_helper.getEnvVarOwned(allocator, "HOME") catch {
        return CommandResult.err(allocator, "Error: Could not determine HOME directory");
    };
    defer allocator.free(home);

    const data_dir = try std.fmt.allocPrint(allocator, "{s}/.local/share/pantry/data/{s}", .{ home, config.name });
    defer allocator.free(data_dir);

    // Check if data directory exists
    io_helper.accessAbsolute(data_dir, .{}) catch {
        const msg = try std.fmt.allocPrint(allocator, "No data directory found for {s}: {s}", .{ service_name, data_dir });
        return .{ .exit_code = 1, .message = msg };
    };

    // Create snapshots directory
    const snapshot_dir = try std.fmt.allocPrint(allocator, "{s}/.local/share/pantry/snapshots/{s}", .{ home, config.name });
    defer allocator.free(snapshot_dir);
    io_helper.makePath(snapshot_dir) catch |err| {
        const msg = try std.fmt.allocPrint(allocator, "Failed to create snapshot directory: {s}", .{@errorName(err)});
        return .{ .exit_code = 1, .message = msg };
    };

    // Generate timestamp for snapshot name
    const timestamp_result = io_helper.childRun(allocator, &[_][]const u8{
        "date", "+%Y%m%d-%H%M%S",
    }) catch {
        return CommandResult.err(allocator, "Failed to generate timestamp");
    };
    defer allocator.free(timestamp_result.stdout);
    defer allocator.free(timestamp_result.stderr);

    const timestamp = std.mem.trim(u8, timestamp_result.stdout, " \t\r\n");

    const snapshot_file = try std.fmt.allocPrint(allocator, "{s}/{s}-{s}.tar.gz", .{ snapshot_dir, config.name, timestamp });
    defer allocator.free(snapshot_file);

    // Check if service is running
    var manager = ServiceManager.init(allocator);
    defer manager.deinit();

    const svc_config = getServiceConfig(allocator, service_name, null) catch {
        return CommandResult.err(allocator, "Failed to get service config");
    };
    const canonical_name = try allocator.dupe(u8, svc_config.name);
    defer allocator.free(canonical_name);
    try manager.register(svc_config);

    const was_running = blk: {
        const s = manager.status(canonical_name) catch break :blk false;
        break :blk s == .running;
    };

    // Stop service if running
    if (was_running) {
        style.print("Stopping {s} for snapshot...\n", .{service_name});
        manager.stop(canonical_name) catch {};
        // Brief pause to let service stop
        io_helper.nanosleep(0, 500 * std.time.ns_per_ms);
    }

    // Create snapshot
    style.print("Creating snapshot...\n", .{});
    const tar_result = io_helper.childRun(allocator, &[_][]const u8{
        "tar", "czf", snapshot_file, "-C", data_dir, ".",
    }) catch |err| {
        // Restart service if it was running
        if (was_running) {
            manager.start(canonical_name) catch {};
        }
        const msg = try std.fmt.allocPrint(allocator, "Failed to create snapshot: {s}", .{@errorName(err)});
        return .{ .exit_code = 1, .message = msg };
    };
    defer allocator.free(tar_result.stdout);
    defer allocator.free(tar_result.stderr);

    // Restart service if it was running
    if (was_running) {
        style.print("Restarting {s}...\n", .{service_name});
        manager.start(canonical_name) catch {};
    }

    const msg = try std.fmt.allocPrint(allocator, "Snapshot created: {s}", .{snapshot_file});
    return .{ .exit_code = 0, .message = msg };
}

pub fn restoreCommand(allocator: std.mem.Allocator, args: []const []const u8) !CommandResult {
    if (args.len == 0) {
        return CommandResult.err(allocator, "Error: No service specified\nUsage: pantry restore <service> [snapshot-name]");
    }

    const service_name = args[0];
    const snapshot_name = if (args.len > 1) args[1] else null;
    const io_helper = @import("../../io_helper.zig");

    // Verify service exists
    var config = getServiceConfig(allocator, service_name, null) catch {
        const msg = try std.fmt.allocPrint(allocator, "Unknown service: {s}", .{service_name});
        return .{ .exit_code = 1, .message = msg };
    };
    defer config.deinit(allocator);

    const home = io_helper.getEnvVarOwned(allocator, "HOME") catch {
        return CommandResult.err(allocator, "Error: Could not determine HOME directory");
    };
    defer allocator.free(home);

    const snapshot_dir = try std.fmt.allocPrint(allocator, "{s}/.local/share/pantry/snapshots/{s}", .{ home, config.name });
    defer allocator.free(snapshot_dir);

    const data_dir = try std.fmt.allocPrint(allocator, "{s}/.local/share/pantry/data/{s}", .{ home, config.name });
    defer allocator.free(data_dir);

    // Find snapshot file
    var snapshot_path: []const u8 = undefined;
    var snapshot_path_owned = false;

    if (snapshot_name) |name| {
        // User specified a snapshot name
        if (std.mem.endsWith(u8, name, ".tar.gz")) {
            snapshot_path = try std.fmt.allocPrint(allocator, "{s}/{s}", .{ snapshot_dir, name });
        } else {
            snapshot_path = try std.fmt.allocPrint(allocator, "{s}/{s}.tar.gz", .{ snapshot_dir, name });
        }
        snapshot_path_owned = true;
    } else {
        // Find latest snapshot (ls sorted by name descending since names encode timestamps)
        const ls_result = io_helper.childRun(allocator, &[_][]const u8{
            "ls", "-1", snapshot_dir,
        }) catch {
            return CommandResult.err(allocator, "No snapshots found. Create one first with: pantry snapshot <service>");
        };
        defer allocator.free(ls_result.stdout);
        defer allocator.free(ls_result.stderr);

        if (ls_result.stdout.len == 0) {
            return CommandResult.err(allocator, "No snapshots found. Create one first with: pantry snapshot <service>");
        }

        // Get the last line (latest by filename sort)
        var last_file: []const u8 = "";
        var line_iter = std.mem.splitScalar(u8, ls_result.stdout, '\n');
        while (line_iter.next()) |line| {
            const trimmed = std.mem.trim(u8, line, " \t\r");
            if (trimmed.len > 0 and std.mem.endsWith(u8, trimmed, ".tar.gz")) {
                last_file = trimmed;
            }
        }

        if (last_file.len == 0) {
            return CommandResult.err(allocator, "No snapshots found. Create one first with: pantry snapshot <service>");
        }

        snapshot_path = try std.fmt.allocPrint(allocator, "{s}/{s}", .{ snapshot_dir, last_file });
        snapshot_path_owned = true;
    }
    defer if (snapshot_path_owned) allocator.free(snapshot_path);

    // Verify snapshot exists
    io_helper.accessAbsolute(snapshot_path, .{}) catch {
        const msg = try std.fmt.allocPrint(allocator, "Snapshot not found: {s}", .{snapshot_path});
        return .{ .exit_code = 1, .message = msg };
    };

    // Stop service
    var manager = ServiceManager.init(allocator);
    defer manager.deinit();

    const svc_config = getServiceConfig(allocator, service_name, null) catch {
        return CommandResult.err(allocator, "Failed to get service config");
    };
    const canonical_name = try allocator.dupe(u8, svc_config.name);
    defer allocator.free(canonical_name);
    try manager.register(svc_config);

    style.print("Stopping {s}...\n", .{service_name});
    manager.stop(canonical_name) catch {};
    io_helper.nanosleep(0, 500 * std.time.ns_per_ms);

    // Clear data directory
    style.print("Clearing data directory...\n", .{});
    _ = io_helper.childRun(allocator, &[_][]const u8{
        "rm", "-rf", data_dir,
    }) catch {};
    io_helper.makePath(data_dir) catch {};

    // Extract snapshot
    style.print("Restoring from snapshot...\n", .{});
    const tar_result = io_helper.childRun(allocator, &[_][]const u8{
        "tar", "xzf", snapshot_path, "-C", data_dir,
    }) catch |err| {
        const msg = try std.fmt.allocPrint(allocator, "Failed to restore snapshot: {s}", .{@errorName(err)});
        return .{ .exit_code = 1, .message = msg };
    };
    defer allocator.free(tar_result.stdout);
    defer allocator.free(tar_result.stderr);

    // Restart service
    style.print("Starting {s}...\n", .{service_name});
    manager.start(canonical_name) catch {};

    const msg = try std.fmt.allocPrint(allocator, "Restored {s} from: {s}", .{ service_name, std.fs.path.basename(snapshot_path) });
    return .{ .exit_code = 0, .message = msg };
}

pub fn snapshotListCommand(allocator: std.mem.Allocator, args: []const []const u8) !CommandResult {
    if (args.len == 0) {
        return CommandResult.err(allocator, "Error: No service specified\nUsage: pantry snapshots <service>");
    }

    const service_name = args[0];
    const io_helper = @import("../../io_helper.zig");

    // Verify service exists
    var config = getServiceConfig(allocator, service_name, null) catch {
        const msg = try std.fmt.allocPrint(allocator, "Unknown service: {s}", .{service_name});
        return .{ .exit_code = 1, .message = msg };
    };
    defer config.deinit(allocator);

    const home = io_helper.getEnvVarOwned(allocator, "HOME") catch {
        return CommandResult.err(allocator, "Error: Could not determine HOME directory");
    };
    defer allocator.free(home);

    const snapshot_dir = try std.fmt.allocPrint(allocator, "{s}/.local/share/pantry/snapshots/{s}", .{ home, config.name });
    defer allocator.free(snapshot_dir);

    // List snapshots with sizes
    const ls_result = io_helper.childRun(allocator, &[_][]const u8{
        "ls", "-lh", snapshot_dir,
    }) catch {
        style.print("No snapshots found for {s}\n", .{service_name});
        return .{ .exit_code = 0 };
    };
    defer allocator.free(ls_result.stdout);
    defer allocator.free(ls_result.stderr);

    if (ls_result.stdout.len == 0) {
        style.print("No snapshots found for {s}\n", .{service_name});
        return .{ .exit_code = 0 };
    }

    style.print("Snapshots for {s}:\n\n", .{service_name});
    style.print("{s}", .{ls_result.stdout});

    return .{ .exit_code = 0 };
}

// ============================================================================
// Project Hash Utility
// ============================================================================

/// Ensure PostgreSQL data directory is initialized and version-compatible.
/// If major version mismatch detected, backs up old data and re-initializes.
fn ensurePostgresDataDir(allocator: std.mem.Allocator, project_root: ?[]const u8) void {
    const io_helper = @import("../../io_helper.zig");

    const home = io_helper.getEnvVarOwned(allocator, "HOME") catch return;
    defer allocator.free(home);

    const pgdata = std.fmt.allocPrint(allocator, "{s}/.local/share/pantry/data/postgres", .{home}) catch return;
    defer allocator.free(pgdata);

    // Check if PGDATA exists
    io_helper.accessAbsolute(pgdata, .{}) catch {
        // PGDATA doesn't exist — create and init
        io_helper.makePath(pgdata) catch return;
        style.print("  📀 Initializing PostgreSQL data directory...\n", .{});
        runInitdb(allocator, pgdata, project_root);
        return;
    };

    // Read PG_VERSION
    const pg_version_path = std.fmt.allocPrint(allocator, "{s}/PG_VERSION", .{pgdata}) catch return;
    defer allocator.free(pg_version_path);

    const pg_version_content = io_helper.readFileAlloc(allocator, pg_version_path, 64) catch {
        // Directory exists but not initialized
        style.print("  📀 Initializing PostgreSQL data directory...\n", .{});
        runInitdb(allocator, pgdata, project_root);
        return;
    };
    defer allocator.free(pg_version_content);

    const data_version = std.mem.trim(u8, pg_version_content, " \t\r\n");
    if (data_version.len == 0) return;

    // Get current postgres binary version
    var pg_bin_path: []const u8 = "postgres";
    var pg_bin_allocated = false;
    defer if (pg_bin_allocated) allocator.free(pg_bin_path);

    if (project_root) |pr| {
        const local = std.fmt.allocPrint(allocator, "{s}/pantry/.bin/postgres", .{pr}) catch return;
        if (blk: {
            io_helper.accessAbsolute(local, .{}) catch break :blk false;
            break :blk true;
        }) {
            pg_bin_path = local;
            pg_bin_allocated = true;
        } else {
            allocator.free(local);
        }
    }

    const version_result = io_helper.childRun(allocator, &[_][]const u8{
        pg_bin_path, "--version",
    }) catch return;
    defer allocator.free(version_result.stdout);
    defer allocator.free(version_result.stderr);

    if (version_result.term != .exited or version_result.term.exited != 0) return;

    // Parse "postgres (PostgreSQL) 18.3" → extract major version "18"
    const binary_major = blk: {
        const output = std.mem.trim(u8, version_result.stdout, " \t\r\n");
        var last_space: usize = 0;
        for (output, 0..) |c, i| {
            if (c == ' ') last_space = i;
        }
        const ver_str = output[last_space + 1 ..];
        for (ver_str, 0..) |c, i| {
            if (c == '.') break :blk ver_str[0..i];
        }
        break :blk ver_str;
    };

    if (!std.mem.eql(u8, data_version, binary_major)) {
        style.print("  ⚠️  PostgreSQL version mismatch: data is v{s}, binary is v{s}\n", .{ data_version, binary_major });
        style.print("  📀 Backing up old data and re-initializing...\n", .{});

        const backup_path = std.fmt.allocPrint(allocator, "{s}.bak.v{s}", .{ pgdata, data_version }) catch return;
        defer allocator.free(backup_path);

        io_helper.deleteTree(backup_path) catch {};

        const rename_cmd = std.fmt.allocPrint(allocator, "mv {s} {s}", .{ pgdata, backup_path }) catch return;
        defer allocator.free(rename_cmd);
        const rename_result = io_helper.childRun(allocator, &[_][]const u8{
            "sh", "-c", rename_cmd,
        }) catch return;
        allocator.free(rename_result.stdout);
        allocator.free(rename_result.stderr);

        if (rename_result.term != .exited or rename_result.term.exited != 0) {
            style.print("  ✗ Failed to backup old data directory\n", .{});
            return;
        }

        io_helper.makePath(pgdata) catch return;
        style.print("  📀 Initializing fresh PostgreSQL v{s} data directory...\n", .{binary_major});
        runInitdb(allocator, pgdata, project_root);
        style.print("  💾 Old v{s} data backed up to {s}\n", .{ data_version, backup_path });
    }
}

fn runInitdb(allocator: std.mem.Allocator, pgdata: []const u8, project_root: ?[]const u8) void {
    const io_helper = @import("../../io_helper.zig");

    var initdb_path: []const u8 = "initdb";
    var initdb_allocated = false;
    defer if (initdb_allocated) allocator.free(initdb_path);

    if (project_root) |pr| {
        const local = std.fmt.allocPrint(allocator, "{s}/pantry/.bin/initdb", .{pr}) catch return;
        if (blk: {
            io_helper.accessAbsolute(local, .{}) catch break :blk false;
            break :blk true;
        }) {
            initdb_path = local;
            initdb_allocated = true;
        } else {
            allocator.free(local);
        }
    }

    const result = io_helper.childRun(allocator, &[_][]const u8{
        initdb_path, "-D", pgdata, "--no-locale", "--encoding=UTF8",
    }) catch |err| {
        style.print("  ⚠️  initdb failed: {s}\n", .{@errorName(err)});
        return;
    };
    defer allocator.free(result.stdout);
    defer allocator.free(result.stderr);

    if (result.term == .exited and result.term.exited == 0) {
        style.print("  ✓ PostgreSQL data directory initialized\n", .{});
    } else {
        style.print("  ⚠️  initdb failed (exit {d})\n", .{if (result.term == .exited) result.term.exited else 0});
    }
}

/// Compute a simple FNV-1a hash of a path and return first 8 hex chars
pub fn computeProjectHash(allocator: std.mem.Allocator, path: []const u8) ![]const u8 {
    var hash: u64 = 0xcbf29ce484222325; // FNV offset basis
    for (path) |byte| {
        hash ^= byte;
        hash *%= 0x100000001b3; // FNV prime
    }

    return try std.fmt.allocPrint(allocator, "{x:0>8}", .{@as(u32, @truncate(hash))});
}
