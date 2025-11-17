const std = @import("std");

/// Service configuration
pub const ServiceConfig = struct {
    /// Service name
    name: []const u8,
    /// Display name
    display_name: []const u8,
    /// Description
    description: []const u8,
    /// Command to start the service
    start_command: []const u8,
    /// Working directory (optional)
    working_directory: ?[]const u8 = null,
    /// Environment variables
    env_vars: std.StringHashMap([]const u8),
    /// Port (if applicable)
    port: ?u16 = null,
    /// Auto-start on boot
    auto_start: bool = false,
    /// Keep alive (restart if crashed)
    keep_alive: bool = true,

    pub fn deinit(self: *ServiceConfig, allocator: std.mem.Allocator) void {
        allocator.free(self.name);
        allocator.free(self.display_name);
        allocator.free(self.description);
        allocator.free(self.start_command);
        if (self.working_directory) |wd| allocator.free(wd);

        var it = self.env_vars.iterator();
        while (it.next()) |entry| {
            // Keys are string literals, don't free them
            // Only free the values which are allocated
            allocator.free(entry.value_ptr.*);
        }
        self.env_vars.deinit();
    }
};

/// Service status
pub const ServiceStatus = enum {
    running,
    stopped,
    failed,
    unknown,

    pub fn toString(self: ServiceStatus) []const u8 {
        return switch (self) {
            .running => "running",
            .stopped => "stopped",
            .failed => "failed",
            .unknown => "unknown",
        };
    }
};

/// Pre-defined service configurations
pub const Services = struct {
    /// PostgreSQL service
    pub fn postgresql(allocator: std.mem.Allocator, port: u16) !ServiceConfig {
        var env_vars = std.StringHashMap([]const u8).init(allocator);
        try env_vars.put("PGPORT", try std.fmt.allocPrint(allocator, "{d}", .{port}));
        try env_vars.put("PGDATA", try allocator.dupe(u8, "/usr/local/var/postgres"));

        return ServiceConfig{
            .name = try allocator.dupe(u8, "postgresql"),
            .display_name = try allocator.dupe(u8, "PostgreSQL"),
            .description = try allocator.dupe(u8, "PostgreSQL database server"),
            .start_command = try allocator.dupe(u8, "postgres -D /usr/local/var/postgres"),
            .env_vars = env_vars,
            .port = port,
            .auto_start = false,
            .keep_alive = true,
        };
    }

    /// Redis service
    pub fn redis(allocator: std.mem.Allocator, port: u16) !ServiceConfig {
        const env_vars = std.StringHashMap([]const u8).init(allocator);

        return ServiceConfig{
            .name = try allocator.dupe(u8, "redis"),
            .display_name = try allocator.dupe(u8, "Redis"),
            .description = try allocator.dupe(u8, "Redis in-memory data store"),
            .start_command = try std.fmt.allocPrint(
                allocator,
                "redis-server --port {d}",
                .{port},
            ),
            .env_vars = env_vars,
            .port = port,
            .auto_start = false,
            .keep_alive = true,
        };
    }

    /// MySQL service
    pub fn mysql(allocator: std.mem.Allocator, port: u16) !ServiceConfig {
        var env_vars = std.StringHashMap([]const u8).init(allocator);
        try env_vars.put("MYSQL_PORT", try std.fmt.allocPrint(allocator, "{d}", .{port}));

        return ServiceConfig{
            .name = try allocator.dupe(u8, "mysql"),
            .display_name = try allocator.dupe(u8, "MySQL"),
            .description = try allocator.dupe(u8, "MySQL database server"),
            .start_command = try std.fmt.allocPrint(
                allocator,
                "mysqld --port={d}",
                .{port},
            ),
            .env_vars = env_vars,
            .port = port,
            .auto_start = false,
            .keep_alive = true,
        };
    }

    /// Nginx service
    pub fn nginx(allocator: std.mem.Allocator, port: u16) !ServiceConfig {
        const env_vars = std.StringHashMap([]const u8).init(allocator);

        return ServiceConfig{
            .name = try allocator.dupe(u8, "nginx"),
            .display_name = try allocator.dupe(u8, "Nginx"),
            .description = try allocator.dupe(u8, "Nginx web server"),
            .start_command = try allocator.dupe(u8, "nginx -g 'daemon off;'"),
            .env_vars = env_vars,
            .port = port,
            .auto_start = false,
            .keep_alive = true,
        };
    }

    /// MongoDB service
    pub fn mongodb(allocator: std.mem.Allocator, port: u16) !ServiceConfig {
        const env_vars = std.StringHashMap([]const u8).init(allocator);

        return ServiceConfig{
            .name = try allocator.dupe(u8, "mongodb"),
            .display_name = try allocator.dupe(u8, "MongoDB"),
            .description = try allocator.dupe(u8, "MongoDB database server"),
            .start_command = try std.fmt.allocPrint(
                allocator,
                "mongod --port {d} --dbpath /usr/local/var/mongodb",
                .{port},
            ),
            .env_vars = env_vars,
            .port = port,
            .auto_start = false,
            .keep_alive = true,
        };
    }

    // ========================================================================
    // Additional Database Services
    // ========================================================================

    /// InfluxDB service
    pub fn influxdb(allocator: std.mem.Allocator, port: u16) !ServiceConfig {
        const env_vars = std.StringHashMap([]const u8).init(allocator);
        return ServiceConfig{
            .name = try allocator.dupe(u8, "influxdb"),
            .display_name = try allocator.dupe(u8, "InfluxDB"),
            .description = try allocator.dupe(u8, "Time series database"),
            .start_command = try std.fmt.allocPrint(allocator, "influxd --http-bind-address=:{d}", .{port}),
            .env_vars = env_vars,
            .port = port,
            .auto_start = false,
            .keep_alive = true,
        };
    }

    /// CockroachDB service
    pub fn cockroachdb(allocator: std.mem.Allocator, port: u16) !ServiceConfig {
        const env_vars = std.StringHashMap([]const u8).init(allocator);
        return ServiceConfig{
            .name = try allocator.dupe(u8, "cockroachdb"),
            .display_name = try allocator.dupe(u8, "CockroachDB"),
            .description = try allocator.dupe(u8, "Distributed SQL database"),
            .start_command = try std.fmt.allocPrint(allocator, "cockroach start-single-node --insecure --listen-addr=localhost:{d}", .{port}),
            .env_vars = env_vars,
            .port = port,
            .auto_start = false,
            .keep_alive = true,
        };
    }

    /// Neo4j service
    pub fn neo4j(allocator: std.mem.Allocator, port: u16) !ServiceConfig {
        const env_vars = std.StringHashMap([]const u8).init(allocator);
        return ServiceConfig{
            .name = try allocator.dupe(u8, "neo4j"),
            .display_name = try allocator.dupe(u8, "Neo4j"),
            .description = try allocator.dupe(u8, "Graph database"),
            .start_command = try std.fmt.allocPrint(allocator, "neo4j console --http-port={d}", .{port}),
            .env_vars = env_vars,
            .port = port,
            .auto_start = false,
            .keep_alive = true,
        };
    }

    /// ClickHouse service
    pub fn clickhouse(allocator: std.mem.Allocator, port: u16) !ServiceConfig {
        const env_vars = std.StringHashMap([]const u8).init(allocator);
        return ServiceConfig{
            .name = try allocator.dupe(u8, "clickhouse"),
            .display_name = try allocator.dupe(u8, "ClickHouse"),
            .description = try allocator.dupe(u8, "Columnar analytics database"),
            .start_command = try std.fmt.allocPrint(allocator, "clickhouse-server --http_port={d}", .{port}),
            .env_vars = env_vars,
            .port = port,
            .auto_start = false,
            .keep_alive = true,
        };
    }

    /// Memcached service
    pub fn memcached(allocator: std.mem.Allocator, port: u16) !ServiceConfig {
        const env_vars = std.StringHashMap([]const u8).init(allocator);
        return ServiceConfig{
            .name = try allocator.dupe(u8, "memcached"),
            .display_name = try allocator.dupe(u8, "Memcached"),
            .description = try allocator.dupe(u8, "Memory caching system"),
            .start_command = try std.fmt.allocPrint(allocator, "memcached -p {d}", .{port}),
            .env_vars = env_vars,
            .port = port,
            .auto_start = false,
            .keep_alive = true,
        };
    }

    /// Elasticsearch service
    pub fn elasticsearch(allocator: std.mem.Allocator, port: u16) !ServiceConfig {
        const env_vars = std.StringHashMap([]const u8).init(allocator);
        return ServiceConfig{
            .name = try allocator.dupe(u8, "elasticsearch"),
            .display_name = try allocator.dupe(u8, "Elasticsearch"),
            .description = try allocator.dupe(u8, "Search and analytics engine"),
            .start_command = try std.fmt.allocPrint(allocator, "elasticsearch -Ehttp.port={d}", .{port}),
            .env_vars = env_vars,
            .port = port,
            .auto_start = false,
            .keep_alive = true,
        };
    }

    // ========================================================================
    // Message Queue & Streaming Services
    // ========================================================================

    /// Apache Kafka service
    pub fn kafka(allocator: std.mem.Allocator, port: u16) !ServiceConfig {
        var env_vars = std.StringHashMap([]const u8).init(allocator);
        try env_vars.put("KAFKA_HEAP_OPTS", try allocator.dupe(u8, "-Xmx1G -Xms1G"));
        return ServiceConfig{
            .name = try allocator.dupe(u8, "kafka"),
            .display_name = try allocator.dupe(u8, "Apache Kafka"),
            .description = try allocator.dupe(u8, "Distributed event streaming platform"),
            .start_command = try std.fmt.allocPrint(allocator, "kafka-server-start.sh config/server.properties --override listeners=PLAINTEXT://localhost:{d}", .{port}),
            .env_vars = env_vars,
            .port = port,
            .auto_start = false,
            .keep_alive = true,
        };
    }

    /// RabbitMQ service
    pub fn rabbitmq(allocator: std.mem.Allocator, port: u16) !ServiceConfig {
        var env_vars = std.StringHashMap([]const u8).init(allocator);
        try env_vars.put("RABBITMQ_NODE_PORT", try std.fmt.allocPrint(allocator, "{d}", .{port}));
        return ServiceConfig{
            .name = try allocator.dupe(u8, "rabbitmq"),
            .display_name = try allocator.dupe(u8, "RabbitMQ"),
            .description = try allocator.dupe(u8, "Message broker"),
            .start_command = try allocator.dupe(u8, "rabbitmq-server"),
            .env_vars = env_vars,
            .port = port,
            .auto_start = false,
            .keep_alive = true,
        };
    }

    /// Apache Pulsar service
    pub fn pulsar(allocator: std.mem.Allocator, port: u16) !ServiceConfig {
        const env_vars = std.StringHashMap([]const u8).init(allocator);
        return ServiceConfig{
            .name = try allocator.dupe(u8, "pulsar"),
            .display_name = try allocator.dupe(u8, "Apache Pulsar"),
            .description = try allocator.dupe(u8, "Cloud-native messaging platform"),
            .start_command = try std.fmt.allocPrint(allocator, "pulsar standalone --advertised-address localhost --webServicePort {d}", .{port}),
            .env_vars = env_vars,
            .port = port,
            .auto_start = false,
            .keep_alive = true,
        };
    }

    /// NATS service
    pub fn nats(allocator: std.mem.Allocator, port: u16) !ServiceConfig {
        const env_vars = std.StringHashMap([]const u8).init(allocator);
        return ServiceConfig{
            .name = try allocator.dupe(u8, "nats"),
            .display_name = try allocator.dupe(u8, "NATS"),
            .description = try allocator.dupe(u8, "High-performance messaging system"),
            .start_command = try std.fmt.allocPrint(allocator, "nats-server --port {d}", .{port}),
            .env_vars = env_vars,
            .port = port,
            .auto_start = false,
            .keep_alive = true,
        };
    }

    // ========================================================================
    // Monitoring & Observability Services
    // ========================================================================

    /// Prometheus service
    pub fn prometheus(allocator: std.mem.Allocator, port: u16) !ServiceConfig {
        const env_vars = std.StringHashMap([]const u8).init(allocator);
        return ServiceConfig{
            .name = try allocator.dupe(u8, "prometheus"),
            .display_name = try allocator.dupe(u8, "Prometheus"),
            .description = try allocator.dupe(u8, "Metrics collection and monitoring"),
            .start_command = try std.fmt.allocPrint(allocator, "prometheus --web.listen-address=:{d}", .{port}),
            .env_vars = env_vars,
            .port = port,
            .auto_start = false,
            .keep_alive = true,
        };
    }

    /// Grafana service
    pub fn grafana(allocator: std.mem.Allocator, port: u16) !ServiceConfig {
        var env_vars = std.StringHashMap([]const u8).init(allocator);
        try env_vars.put("GF_SERVER_HTTP_PORT", try std.fmt.allocPrint(allocator, "{d}", .{port}));
        return ServiceConfig{
            .name = try allocator.dupe(u8, "grafana"),
            .display_name = try allocator.dupe(u8, "Grafana"),
            .description = try allocator.dupe(u8, "Visualization and analytics platform"),
            .start_command = try allocator.dupe(u8, "grafana-server"),
            .env_vars = env_vars,
            .port = port,
            .auto_start = false,
            .keep_alive = true,
        };
    }

    /// Jaeger service
    pub fn jaeger(allocator: std.mem.Allocator, port: u16) !ServiceConfig {
        const env_vars = std.StringHashMap([]const u8).init(allocator);
        return ServiceConfig{
            .name = try allocator.dupe(u8, "jaeger"),
            .display_name = try allocator.dupe(u8, "Jaeger"),
            .description = try allocator.dupe(u8, "Distributed tracing platform"),
            .start_command = try std.fmt.allocPrint(allocator, "jaeger-all-in-one --query.http.port={d}", .{port}),
            .env_vars = env_vars,
            .port = port,
            .auto_start = false,
            .keep_alive = true,
        };
    }

    // ========================================================================
    // Infrastructure & Tools Services
    // ========================================================================

    /// HashiCorp Vault service
    pub fn vault(allocator: std.mem.Allocator, port: u16) !ServiceConfig {
        const env_vars = std.StringHashMap([]const u8).init(allocator);
        return ServiceConfig{
            .name = try allocator.dupe(u8, "vault"),
            .display_name = try allocator.dupe(u8, "HashiCorp Vault"),
            .description = try allocator.dupe(u8, "Secrets management"),
            .start_command = try std.fmt.allocPrint(allocator, "vault server -dev -dev-listen-address=127.0.0.1:{d}", .{port}),
            .env_vars = env_vars,
            .port = port,
            .auto_start = false,
            .keep_alive = true,
        };
    }

    /// HashiCorp Consul service
    pub fn consul(allocator: std.mem.Allocator, port: u16) !ServiceConfig {
        const env_vars = std.StringHashMap([]const u8).init(allocator);
        return ServiceConfig{
            .name = try allocator.dupe(u8, "consul"),
            .display_name = try allocator.dupe(u8, "HashiCorp Consul"),
            .description = try allocator.dupe(u8, "Service mesh and discovery"),
            .start_command = try std.fmt.allocPrint(allocator, "consul agent -dev -http-port={d}", .{port}),
            .env_vars = env_vars,
            .port = port,
            .auto_start = false,
            .keep_alive = true,
        };
    }

    /// etcd service
    pub fn etcd(allocator: std.mem.Allocator, port: u16) !ServiceConfig {
        const env_vars = std.StringHashMap([]const u8).init(allocator);
        return ServiceConfig{
            .name = try allocator.dupe(u8, "etcd"),
            .display_name = try allocator.dupe(u8, "etcd"),
            .description = try allocator.dupe(u8, "Distributed key-value store"),
            .start_command = try std.fmt.allocPrint(allocator, "etcd --listen-client-urls http://localhost:{d}", .{port}),
            .env_vars = env_vars,
            .port = port,
            .auto_start = false,
            .keep_alive = true,
        };
    }

    /// MinIO service
    pub fn minio(allocator: std.mem.Allocator, port: u16) !ServiceConfig {
        const env_vars = std.StringHashMap([]const u8).init(allocator);
        return ServiceConfig{
            .name = try allocator.dupe(u8, "minio"),
            .display_name = try allocator.dupe(u8, "MinIO"),
            .description = try allocator.dupe(u8, "S3-compatible object storage"),
            .start_command = try std.fmt.allocPrint(allocator, "minio server --address :{d} /usr/local/var/minio", .{port}),
            .env_vars = env_vars,
            .port = port,
            .auto_start = false,
            .keep_alive = true,
        };
    }

    /// SonarQube service
    pub fn sonarqube(allocator: std.mem.Allocator, port: u16) !ServiceConfig {
        var env_vars = std.StringHashMap([]const u8).init(allocator);
        try env_vars.put("SONAR_WEB_PORT", try std.fmt.allocPrint(allocator, "{d}", .{port}));
        return ServiceConfig{
            .name = try allocator.dupe(u8, "sonarqube"),
            .display_name = try allocator.dupe(u8, "SonarQube"),
            .description = try allocator.dupe(u8, "Code quality and security analysis"),
            .start_command = try allocator.dupe(u8, "sonar.sh start"),
            .env_vars = env_vars,
            .port = port,
            .auto_start = false,
            .keep_alive = true,
        };
    }

    /// Temporal service
    pub fn temporal(allocator: std.mem.Allocator, port: u16) !ServiceConfig {
        const env_vars = std.StringHashMap([]const u8).init(allocator);
        return ServiceConfig{
            .name = try allocator.dupe(u8, "temporal"),
            .display_name = try allocator.dupe(u8, "Temporal"),
            .description = try allocator.dupe(u8, "Workflow orchestration platform"),
            .start_command = try std.fmt.allocPrint(allocator, "temporal server start-dev --ui-port {d}", .{port}),
            .env_vars = env_vars,
            .port = port,
            .auto_start = false,
            .keep_alive = true,
        };
    }

    // ========================================================================
    // Development & CI/CD Services
    // ========================================================================

    /// Jenkins service
    pub fn jenkins(allocator: std.mem.Allocator, port: u16) !ServiceConfig {
        var env_vars = std.StringHashMap([]const u8).init(allocator);
        try env_vars.put("JENKINS_PORT", try std.fmt.allocPrint(allocator, "{d}", .{port}));
        return ServiceConfig{
            .name = try allocator.dupe(u8, "jenkins"),
            .display_name = try allocator.dupe(u8, "Jenkins"),
            .description = try allocator.dupe(u8, "CI/CD automation server"),
            .start_command = try std.fmt.allocPrint(allocator, "jenkins --httpPort={d}", .{port}),
            .env_vars = env_vars,
            .port = port,
            .auto_start = false,
            .keep_alive = true,
        };
    }

    /// LocalStack service
    pub fn localstack(allocator: std.mem.Allocator, port: u16) !ServiceConfig {
        var env_vars = std.StringHashMap([]const u8).init(allocator);
        try env_vars.put("EDGE_PORT", try std.fmt.allocPrint(allocator, "{d}", .{port}));
        return ServiceConfig{
            .name = try allocator.dupe(u8, "localstack"),
            .display_name = try allocator.dupe(u8, "LocalStack"),
            .description = try allocator.dupe(u8, "Local AWS cloud stack"),
            .start_command = try allocator.dupe(u8, "localstack start"),
            .env_vars = env_vars,
            .port = port,
            .auto_start = false,
            .keep_alive = true,
        };
    }

    /// Verdaccio service
    pub fn verdaccio(allocator: std.mem.Allocator, port: u16) !ServiceConfig {
        const env_vars = std.StringHashMap([]const u8).init(allocator);
        return ServiceConfig{
            .name = try allocator.dupe(u8, "verdaccio"),
            .display_name = try allocator.dupe(u8, "Verdaccio"),
            .description = try allocator.dupe(u8, "Private npm registry"),
            .start_command = try std.fmt.allocPrint(allocator, "verdaccio --listen {d}", .{port}),
            .env_vars = env_vars,
            .port = port,
            .auto_start = false,
            .keep_alive = true,
        };
    }

    // ========================================================================
    // API & Backend Services
    // ========================================================================

    /// Hasura service
    pub fn hasura(allocator: std.mem.Allocator, port: u16) !ServiceConfig {
        var env_vars = std.StringHashMap([]const u8).init(allocator);
        try env_vars.put("HASURA_GRAPHQL_SERVER_PORT", try std.fmt.allocPrint(allocator, "{d}", .{port}));
        try env_vars.put("HASURA_GRAPHQL_ENABLE_CONSOLE", try allocator.dupe(u8, "true"));
        return ServiceConfig{
            .name = try allocator.dupe(u8, "hasura"),
            .display_name = try allocator.dupe(u8, "Hasura"),
            .description = try allocator.dupe(u8, "GraphQL API with real-time subscriptions"),
            .start_command = try allocator.dupe(u8, "graphql-engine serve"),
            .env_vars = env_vars,
            .port = port,
            .auto_start = false,
            .keep_alive = true,
        };
    }

    /// Keycloak service
    pub fn keycloak(allocator: std.mem.Allocator, port: u16) !ServiceConfig {
        const env_vars = std.StringHashMap([]const u8).init(allocator);
        return ServiceConfig{
            .name = try allocator.dupe(u8, "keycloak"),
            .display_name = try allocator.dupe(u8, "Keycloak"),
            .description = try allocator.dupe(u8, "Identity and access management"),
            .start_command = try std.fmt.allocPrint(allocator, "kc.sh start-dev --http-port={d}", .{port}),
            .env_vars = env_vars,
            .port = port,
            .auto_start = false,
            .keep_alive = true,
        };
    }

    // ========================================================================
    // Web Server Services
    // ========================================================================

    /// Caddy service
    pub fn caddy(allocator: std.mem.Allocator, port: u16) !ServiceConfig {
        const env_vars = std.StringHashMap([]const u8).init(allocator);
        return ServiceConfig{
            .name = try allocator.dupe(u8, "caddy"),
            .display_name = try allocator.dupe(u8, "Caddy"),
            .description = try allocator.dupe(u8, "Web server with automatic HTTPS"),
            .start_command = try std.fmt.allocPrint(allocator, "caddy run --config Caddyfile --adapter caddyfile --http-port {d}", .{port}),
            .env_vars = env_vars,
            .port = port,
            .auto_start = false,
            .keep_alive = true,
        };
    }

    // ========================================================================
    // Helper Functions
    // ========================================================================

    /// Get default port for a service
    pub fn getDefaultPort(service_name: []const u8) ?u16 {
        // Databases
        if (std.mem.eql(u8, service_name, "postgresql") or std.mem.eql(u8, service_name, "postgres")) return 5432;
        if (std.mem.eql(u8, service_name, "redis")) return 6379;
        if (std.mem.eql(u8, service_name, "mysql")) return 3306;
        if (std.mem.eql(u8, service_name, "mongodb")) return 27017;
        if (std.mem.eql(u8, service_name, "influxdb")) return 8086;
        if (std.mem.eql(u8, service_name, "cockroachdb")) return 26257;
        if (std.mem.eql(u8, service_name, "neo4j")) return 7474;
        if (std.mem.eql(u8, service_name, "clickhouse")) return 8123;
        if (std.mem.eql(u8, service_name, "memcached")) return 11211;
        if (std.mem.eql(u8, service_name, "elasticsearch")) return 9200;

        // Message Queues
        if (std.mem.eql(u8, service_name, "kafka")) return 9092;
        if (std.mem.eql(u8, service_name, "rabbitmq")) return 5672;
        if (std.mem.eql(u8, service_name, "pulsar")) return 6650;
        if (std.mem.eql(u8, service_name, "nats")) return 4222;

        // Monitoring
        if (std.mem.eql(u8, service_name, "prometheus")) return 9090;
        if (std.mem.eql(u8, service_name, "grafana")) return 3000;
        if (std.mem.eql(u8, service_name, "jaeger")) return 16686;

        // Infrastructure
        if (std.mem.eql(u8, service_name, "vault")) return 8200;
        if (std.mem.eql(u8, service_name, "consul")) return 8500;
        if (std.mem.eql(u8, service_name, "etcd")) return 2379;
        if (std.mem.eql(u8, service_name, "minio")) return 9000;
        if (std.mem.eql(u8, service_name, "sonarqube")) return 9001;
        if (std.mem.eql(u8, service_name, "temporal")) return 7233;

        // Dev/CI
        if (std.mem.eql(u8, service_name, "jenkins")) return 8090;
        if (std.mem.eql(u8, service_name, "localstack")) return 4566;
        if (std.mem.eql(u8, service_name, "verdaccio")) return 4873;

        // API/Backend
        if (std.mem.eql(u8, service_name, "hasura")) return 8085;
        if (std.mem.eql(u8, service_name, "keycloak")) return 8088;

        // Web Servers
        if (std.mem.eql(u8, service_name, "nginx")) return 8080;
        if (std.mem.eql(u8, service_name, "caddy")) return 2015;

        return null;
    }
};

test "Service definitions" {
    const allocator = std.testing.allocator;

    // Test PostgreSQL
    var pg = try Services.postgresql(allocator, 5432);
    defer pg.deinit(allocator);
    try std.testing.expectEqualStrings("postgresql", pg.name);
    try std.testing.expect(pg.port.? == 5432);

    // Test Redis
    var redis = try Services.redis(allocator, 6379);
    defer redis.deinit(allocator);
    try std.testing.expectEqualStrings("redis", redis.name);

    // Test default port
    try std.testing.expect(Services.getDefaultPort("postgresql").? == 5432);
    try std.testing.expect(Services.getDefaultPort("redis").? == 6379);
}

test "Service status" {
    const status = ServiceStatus.running;
    try std.testing.expectEqualStrings("running", status.toString());
}
