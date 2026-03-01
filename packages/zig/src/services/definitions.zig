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
    /// Health check command (optional, used to verify service is ready)
    health_check: ?[]const u8 = null,
    /// Project identifier for per-project isolation (first 8 hex chars of FNV-1a hash of project path)
    project_id: ?[]const u8 = null,

    pub fn deinit(self: *ServiceConfig, allocator: std.mem.Allocator) void {
        allocator.free(self.name);
        allocator.free(self.display_name);
        allocator.free(self.description);
        allocator.free(self.start_command);
        if (self.working_directory) |wd| allocator.free(wd);
        if (self.health_check) |hc| allocator.free(hc);
        if (self.project_id) |pid| allocator.free(pid);

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

/// Resolve JAVA_HOME by finding the java binary through pantry install locations
/// and walking up to the JDK root. Returns null if not found.
fn resolveJavaHome(allocator: std.mem.Allocator, project_root: ?[]const u8, home: ?[]const u8) !?[]const u8 {
    const io_helper = @import("../io_helper.zig");

    // Check project-local openjdk.org installation
    if (project_root) |pr| {
        const openjdk_dir = try std.fmt.allocPrint(allocator, "{s}/pantry/openjdk.org", .{pr});
        defer allocator.free(openjdk_dir);
        if (io_helper.accessAbsolute(openjdk_dir, .{})) |_| {
            // Find version subdirectory (e.g. v21.0.8.7)
            var dir = io_helper.openDirAbsoluteForIteration(openjdk_dir) catch return null;
            defer dir.close();
            var iter = dir.iterate();
            while (try iter.next()) |entry| {
                if (entry.kind == .directory and entry.name.len > 0 and entry.name[0] == 'v') {
                    const java_home = try std.fmt.allocPrint(allocator, "{s}/{s}", .{ openjdk_dir, entry.name });
                    return java_home;
                }
            }
        } else |_| {}
    }

    // Check global pantry
    if (home) |h| {
        const global_openjdk = try std.fmt.allocPrint(allocator, "{s}/.pantry/global/packages/openjdk.org", .{h});
        defer allocator.free(global_openjdk);
        if (io_helper.accessAbsolute(global_openjdk, .{})) |_| {
            var dir = io_helper.openDirAbsoluteForIteration(global_openjdk) catch return null;
            defer dir.close();
            var iter = dir.iterate();
            while (try iter.next()) |entry| {
                if (entry.kind == .directory and entry.name.len > 0 and entry.name[0] == 'v') {
                    const java_home = try std.fmt.allocPrint(allocator, "{s}/{s}", .{ global_openjdk, entry.name });
                    return java_home;
                }
            }
        } else |_| {}
    }

    return null;
}

/// Resolve the pantry .bin directory PATH for service environments
/// This ensures services can find dependency binaries (java, erlang, etc.)
fn resolveServicePath(allocator: std.mem.Allocator, project_root: ?[]const u8, home: ?[]const u8) ![]const u8 {
    const system_path = "/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin";

    if (project_root != null and home != null) {
        return try std.fmt.allocPrint(allocator, "{s}/pantry/.bin:{s}/.pantry/global/bin:{s}", .{ project_root.?, home.?, system_path });
    } else if (project_root) |pr| {
        return try std.fmt.allocPrint(allocator, "{s}/pantry/.bin:{s}", .{ pr, system_path });
    } else if (home) |h| {
        return try std.fmt.allocPrint(allocator, "{s}/.pantry/global/bin:{s}", .{ h, system_path });
    } else {
        return try allocator.dupe(u8, system_path);
    }
}

/// Resolve a package's installation root directory (e.g. pantry/kafka.apache.org/v4.2.0)
/// Searches project-local pantry/ then global ~/.pantry/global/packages/
fn resolvePackageHome(allocator: std.mem.Allocator, package_domain: []const u8, project_root: ?[]const u8, home: ?[]const u8) !?[]const u8 {
    const io_helper = @import("../io_helper.zig");

    // Check project-local installation
    if (project_root) |pr| {
        const pkg_dir = try std.fmt.allocPrint(allocator, "{s}/pantry/{s}", .{ pr, package_domain });
        defer allocator.free(pkg_dir);
        if (io_helper.accessAbsolute(pkg_dir, .{})) |_| {
            var dir = io_helper.openDirAbsoluteForIteration(pkg_dir) catch return null;
            defer dir.close();
            var iter = dir.iterate();
            while (try iter.next()) |entry| {
                if (entry.kind == .directory and entry.name.len > 0 and entry.name[0] == 'v') {
                    return try std.fmt.allocPrint(allocator, "{s}/{s}", .{ pkg_dir, entry.name });
                }
            }
        } else |_| {}
    }

    // Check global pantry
    if (home) |h| {
        const global_pkg = try std.fmt.allocPrint(allocator, "{s}/.pantry/global/packages/{s}", .{ h, package_domain });
        defer allocator.free(global_pkg);
        if (io_helper.accessAbsolute(global_pkg, .{})) |_| {
            var dir = io_helper.openDirAbsoluteForIteration(global_pkg) catch return null;
            defer dir.close();
            var iter = dir.iterate();
            while (try iter.next()) |entry| {
                if (entry.kind == .directory and entry.name.len > 0 and entry.name[0] == 'v') {
                    return try std.fmt.allocPrint(allocator, "{s}/{s}", .{ global_pkg, entry.name });
                }
            }
        } else |_| {}
    }

    return null;
}

/// Resolve a service binary path by searching pantry install locations
/// Tries: project-local pantry/.bin, global ~/.pantry/global/bin, then falls back to bare name
fn resolveServiceBinary(allocator: std.mem.Allocator, binary_name: []const u8, project_root: ?[]const u8, home: ?[]const u8) ![]const u8 {
    const io_helper = @import("../io_helper.zig");

    // 1. Project-local pantry/.bin
    if (project_root) |pr| {
        const local_bin = try std.fmt.allocPrint(allocator, "{s}/pantry/.bin/{s}", .{ pr, binary_name });
        io_helper.accessAbsolute(local_bin, .{}) catch {
            allocator.free(local_bin);
            // fall through
            return resolveServiceBinaryGlobal(allocator, binary_name, home);
        };
        return local_bin;
    }

    return resolveServiceBinaryGlobal(allocator, binary_name, home);
}

fn resolveServiceBinaryGlobal(allocator: std.mem.Allocator, binary_name: []const u8, home: ?[]const u8) ![]const u8 {
    const io_helper = @import("../io_helper.zig");

    // 2. Global ~/.pantry/global/bin
    if (home) |h| {
        const global_bin = try std.fmt.allocPrint(allocator, "{s}/.pantry/global/bin/{s}", .{ h, binary_name });
        io_helper.accessAbsolute(global_bin, .{}) catch {
            allocator.free(global_bin);
            return allocator.dupe(u8, binary_name);
        };
        return global_bin;
    }

    // 3. Fallback: bare binary name (rely on PATH)
    return allocator.dupe(u8, binary_name);
}

/// Pre-defined service configurations
pub const Services = struct {
    /// PostgreSQL service
    pub fn postgresql(allocator: std.mem.Allocator, port: u16) !ServiceConfig {
        return postgresqlWithContext(allocator, port, null);
    }

    /// PostgreSQL service with project context for resolving binary/data paths
    pub fn postgresqlWithContext(allocator: std.mem.Allocator, port: u16, project_root: ?[]const u8) !ServiceConfig {
        const io_helper = @import("../io_helper.zig");

        // Resolve PGDATA: use ~/.local/share/pantry/data/postgres
        const home = io_helper.getEnvVarOwned(allocator, "HOME") catch null;
        defer if (home) |h| allocator.free(h);

        const pgdata = if (home) |h|
            try std.fmt.allocPrint(allocator, "{s}/.local/share/pantry/data/postgres", .{h})
        else
            try allocator.dupe(u8, "/usr/local/var/postgres");
        defer allocator.free(pgdata);

        var env_vars = std.StringHashMap([]const u8).init(allocator);
        try env_vars.put("PGPORT", try std.fmt.allocPrint(allocator, "{d}", .{port}));
        try env_vars.put("PGDATA", try allocator.dupe(u8, pgdata));

        // Resolve postgres binary path
        const postgres_bin = try resolveServiceBinary(allocator, "postgres", project_root, home);

        const start_cmd = try std.fmt.allocPrint(allocator, "{s} -D {s} -p {d}", .{ postgres_bin, pgdata, port });
        allocator.free(postgres_bin);

        return ServiceConfig{
            .name = try allocator.dupe(u8, "postgres"),
            .display_name = try allocator.dupe(u8, "PostgreSQL"),
            .description = try allocator.dupe(u8, "PostgreSQL database server"),
            .start_command = start_cmd,
            .env_vars = env_vars,
            .port = port,
            .auto_start = false,
            .keep_alive = true,
            .health_check = try std.fmt.allocPrint(allocator, "pg_isready -q -p {d}", .{port}),
        };
    }

    /// Redis service
    pub fn redis(allocator: std.mem.Allocator, port: u16) !ServiceConfig {
        return redisWithContext(allocator, port, null);
    }

    /// Redis service with project context
    pub fn redisWithContext(allocator: std.mem.Allocator, port: u16, project_root: ?[]const u8) !ServiceConfig {
        const io_helper = @import("../io_helper.zig");
        const env_vars = std.StringHashMap([]const u8).init(allocator);

        const home = io_helper.getEnvVarOwned(allocator, "HOME") catch null;
        defer if (home) |h| allocator.free(h);

        const redis_bin = try resolveServiceBinary(allocator, "redis-server", project_root, home);
        const start_cmd = try std.fmt.allocPrint(allocator, "{s} --port {d}", .{ redis_bin, port });
        allocator.free(redis_bin);

        return ServiceConfig{
            .name = try allocator.dupe(u8, "redis"),
            .display_name = try allocator.dupe(u8, "Redis"),
            .description = try allocator.dupe(u8, "Redis in-memory data store"),
            .start_command = start_cmd,
            .env_vars = env_vars,
            .port = port,
            .auto_start = false,
            .keep_alive = true,
            .health_check = try std.fmt.allocPrint(allocator, "redis-cli -p {d} ping", .{port}),
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
            .health_check = try std.fmt.allocPrint(allocator, "mysqladmin ping --port={d}", .{port}),
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
            .health_check = try std.fmt.allocPrint(allocator, "curl -sf http://127.0.0.1:{d}/", .{port}),
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
            .health_check = try std.fmt.allocPrint(allocator, "mongosh --port {d} --eval 'db.runCommand({{ping:1}})' --quiet", .{port}),
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
            .health_check = try std.fmt.allocPrint(allocator, "curl -sf http://127.0.0.1:{d}/health", .{port}),
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
            .health_check = try std.fmt.allocPrint(allocator, "curl -sf http://127.0.0.1:{d}/ping", .{port}),
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

    /// Meilisearch service
    pub fn meilisearch(allocator: std.mem.Allocator, port: u16) !ServiceConfig {
        return meilisearchWithContext(allocator, port, null);
    }

    /// Meilisearch service with project context
    pub fn meilisearchWithContext(allocator: std.mem.Allocator, port: u16, project_root: ?[]const u8) !ServiceConfig {
        const io_helper = @import("../io_helper.zig");
        const env_vars = std.StringHashMap([]const u8).init(allocator);

        const home = io_helper.getEnvVarOwned(allocator, "HOME") catch null;
        defer if (home) |h| allocator.free(h);

        // Meilisearch data directory
        const data_dir = if (home) |h|
            try std.fmt.allocPrint(allocator, "{s}/.local/share/pantry/data/meilisearch", .{h})
        else
            try allocator.dupe(u8, "/tmp/meilisearch-data");
        defer allocator.free(data_dir);

        // Ensure data directory exists
        io_helper.makePath(data_dir) catch {};

        const meili_bin = try resolveServiceBinary(allocator, "meilisearch", project_root, home);
        const start_cmd = try std.fmt.allocPrint(allocator, "{s} --http-addr 127.0.0.1:{d} --db-path {s} --no-analytics", .{ meili_bin, port, data_dir });
        allocator.free(meili_bin);

        // Set working directory to data dir so launchd doesn't use / (read-only on macOS)
        const working_dir = if (home) |h|
            try std.fmt.allocPrint(allocator, "{s}/.local/share/pantry/data/meilisearch", .{h})
        else
            try allocator.dupe(u8, "/tmp/meilisearch-data");

        return ServiceConfig{
            .name = try allocator.dupe(u8, "meilisearch"),
            .display_name = try allocator.dupe(u8, "Meilisearch"),
            .description = try allocator.dupe(u8, "Search engine"),
            .start_command = start_cmd,
            .env_vars = env_vars,
            .port = port,
            .auto_start = false,
            .keep_alive = true,
            .working_directory = working_dir,
            .health_check = try std.fmt.allocPrint(allocator, "curl -sf http://127.0.0.1:{d}/health", .{port}),
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
            .health_check = try std.fmt.allocPrint(allocator, "curl -sf http://127.0.0.1:{d}/_cluster/health", .{port}),
        };
    }

    // ========================================================================
    // Message Queue & Streaming Services
    // ========================================================================

    /// Apache Kafka service
    pub fn kafka(allocator: std.mem.Allocator, port: u16) !ServiceConfig {
        return kafkaWithContext(allocator, port, null);
    }

    /// Apache Kafka service with project context for resolving binary/Java paths
    pub fn kafkaWithContext(allocator: std.mem.Allocator, port: u16, project_root: ?[]const u8) !ServiceConfig {
        const io_helper = @import("../io_helper.zig");
        const home = io_helper.getEnvVarOwned(allocator, "HOME") catch null;
        defer if (home) |h| allocator.free(h);

        var env_vars = std.StringHashMap([]const u8).init(allocator);
        try env_vars.put("KAFKA_HEAP_OPTS", try allocator.dupe(u8, "-Xmx1G -Xms1G"));

        // Resolve JAVA_HOME from pantry-installed openjdk
        const java_home = try resolveJavaHome(allocator, project_root, home);
        if (java_home) |jh| {
            try env_vars.put("JAVA_HOME", jh);
        }

        // Resolve PATH to include pantry .bin (for java binary)
        const svc_path = try resolveServicePath(allocator, project_root, home);
        try env_vars.put("PATH", svc_path);

        // Resolve Kafka installation directory for config and binary paths
        const kafka_home = try resolvePackageHome(allocator, "kafka.apache.org", project_root, home);
        const kafka_bin = try resolveServiceBinary(allocator, "kafka-server-start.sh", project_root, home);

        // KRaft mode (Kafka 4.x): write a startup script that auto-formats storage if needed
        const controller_port = port + 1; // e.g. 9093 when port is 9092
        const start_cmd = if (kafka_home) |kh| blk: {
            // Write startup script to pantry logs dir
            const script_dir = if (home) |h|
                try std.fmt.allocPrint(allocator, "{s}/.local/share/pantry/scripts", .{h})
            else
                try allocator.dupe(u8, "/tmp");
            defer allocator.free(script_dir);
            io_helper.makePath(script_dir) catch {};

            const script_path = try std.fmt.allocPrint(allocator, "{s}/kafka-start.sh", .{script_dir});
            const script_content = try std.fmt.allocPrint(allocator, "#!/bin/bash\nset -e\nif [ ! -f /tmp/kraft-combined-logs/meta.properties ]; then\n  KAFKA_CLUSTER_ID=$({s}/bin/kafka-storage.sh random-uuid)\n  {s}/bin/kafka-storage.sh format --standalone --config {s}/config/server.properties --cluster-id \"$KAFKA_CLUSTER_ID\" 2>/dev/null || true\nfi\nexec {s} {s}/config/server.properties --override listeners=PLAINTEXT://localhost:{d},CONTROLLER://localhost:{d} --override advertised.listeners=PLAINTEXT://localhost:{d}\n", .{ kh, kh, kh, kafka_bin, kh, port, controller_port, port });
            defer allocator.free(script_content);

            // Write the script file
            const script_file = io_helper.createFile(script_path, .{}) catch {
                // Fall back to direct command without auto-format
                allocator.free(script_path);
                break :blk try std.fmt.allocPrint(allocator, "{s} {s}/config/server.properties --override listeners=PLAINTEXT://localhost:{d},CONTROLLER://localhost:{d} --override advertised.listeners=PLAINTEXT://localhost:{d}", .{ kafka_bin, kh, port, controller_port, port });
            };
            io_helper.writeAllToFile(script_file, script_content) catch {};
            io_helper.closeFile(script_file);

            break :blk try std.fmt.allocPrint(allocator, "/bin/bash {s}", .{script_path});
        } else
            try std.fmt.allocPrint(allocator, "{s} config/server.properties --override listeners=PLAINTEXT://localhost:{d},CONTROLLER://localhost:{d} --override advertised.listeners=PLAINTEXT://localhost:{d}", .{ kafka_bin, port, controller_port, port });
        allocator.free(kafka_bin);

        return ServiceConfig{
            .name = try allocator.dupe(u8, "kafka"),
            .display_name = try allocator.dupe(u8, "Apache Kafka"),
            .description = try allocator.dupe(u8, "Distributed event streaming platform"),
            .start_command = start_cmd,
            .env_vars = env_vars,
            .port = port,
            .auto_start = false,
            .keep_alive = true,
        };
    }

    /// RabbitMQ service
    pub fn rabbitmq(allocator: std.mem.Allocator, port: u16) !ServiceConfig {
        return rabbitmqWithContext(allocator, port, null);
    }

    /// RabbitMQ service with project context for resolving binary/Erlang paths
    pub fn rabbitmqWithContext(allocator: std.mem.Allocator, port: u16, project_root: ?[]const u8) !ServiceConfig {
        const io_helper = @import("../io_helper.zig");
        const home = io_helper.getEnvVarOwned(allocator, "HOME") catch null;
        defer if (home) |h| allocator.free(h);

        var env_vars = std.StringHashMap([]const u8).init(allocator);
        try env_vars.put("RABBITMQ_NODE_PORT", try std.fmt.allocPrint(allocator, "{d}", .{port}));
        try env_vars.put("RABBITMQ_NODENAME", try allocator.dupe(u8, "rabbit@localhost"));

        // Resolve PATH to include pantry .bin (for erlang/escript binaries)
        const svc_path = try resolveServicePath(allocator, project_root, home);
        try env_vars.put("PATH", svc_path);

        // Resolve RabbitMQ installation directory
        const rabbitmq_home = try resolvePackageHome(allocator, "rabbitmq.com", project_root, home);
        if (rabbitmq_home) |rh| {
            try env_vars.put("RABBITMQ_HOME", rh);
        }

        const rabbitmq_bin = try resolveServiceBinary(allocator, "rabbitmq-server", project_root, home);

        return ServiceConfig{
            .name = try allocator.dupe(u8, "rabbitmq"),
            .display_name = try allocator.dupe(u8, "RabbitMQ"),
            .description = try allocator.dupe(u8, "Message broker"),
            .start_command = rabbitmq_bin,
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
            .health_check = try std.fmt.allocPrint(allocator, "curl -sf http://127.0.0.1:{d}/-/healthy", .{port}),
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
            .health_check = try std.fmt.allocPrint(allocator, "curl -sf http://127.0.0.1:{d}/api/health", .{port}),
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
            .health_check = try std.fmt.allocPrint(allocator, "curl -sf http://127.0.0.1:{d}/", .{port}),
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
            .health_check = try std.fmt.allocPrint(allocator, "curl -sf http://127.0.0.1:{d}/v1/sys/health", .{port}),
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
            .health_check = try std.fmt.allocPrint(allocator, "curl -sf http://127.0.0.1:{d}/v1/status/leader", .{port}),
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
            .health_check = try std.fmt.allocPrint(allocator, "curl -sf http://127.0.0.1:{d}/minio/health/live", .{port}),
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
            .health_check = try std.fmt.allocPrint(allocator, "curl -sf http://127.0.0.1:{d}/", .{port}),
        };
    }

    // ========================================================================
    // Additional Database Services (Tier 2)
    // ========================================================================

    /// MariaDB service (MySQL-compatible fork)
    pub fn mariadb(allocator: std.mem.Allocator, port: u16) !ServiceConfig {
        var env_vars = std.StringHashMap([]const u8).init(allocator);
        try env_vars.put("MYSQL_TCP_PORT", try std.fmt.allocPrint(allocator, "{d}", .{port}));
        return ServiceConfig{
            .name = try allocator.dupe(u8, "mariadb"),
            .display_name = try allocator.dupe(u8, "MariaDB"),
            .description = try allocator.dupe(u8, "MySQL-compatible relational database"),
            .start_command = try std.fmt.allocPrint(allocator, "mariadbd --port={d}", .{port}),
            .env_vars = env_vars,
            .port = port,
            .health_check = try std.fmt.allocPrint(allocator, "mysqladmin ping --port={d}", .{port}),
        };
    }

    /// Valkey service (Redis-compatible fork)
    pub fn valkey(allocator: std.mem.Allocator, port: u16) !ServiceConfig {
        const env_vars = std.StringHashMap([]const u8).init(allocator);
        return ServiceConfig{
            .name = try allocator.dupe(u8, "valkey"),
            .display_name = try allocator.dupe(u8, "Valkey"),
            .description = try allocator.dupe(u8, "Redis-compatible in-memory data store"),
            .start_command = try std.fmt.allocPrint(allocator, "valkey-server --port {d}", .{port}),
            .env_vars = env_vars,
            .port = port,
        };
    }

    /// OpenSearch service (Elasticsearch fork)
    pub fn opensearch(allocator: std.mem.Allocator, port: u16) !ServiceConfig {
        return opensearchWithContext(allocator, port, null);
    }

    /// OpenSearch service with project context for resolving binary/Java paths
    pub fn opensearchWithContext(allocator: std.mem.Allocator, port: u16, project_root: ?[]const u8) !ServiceConfig {
        const io_helper = @import("../io_helper.zig");
        const home = io_helper.getEnvVarOwned(allocator, "HOME") catch null;
        defer if (home) |h| allocator.free(h);

        var env_vars = std.StringHashMap([]const u8).init(allocator);
        try env_vars.put("OPENSEARCH_JAVA_OPTS", try allocator.dupe(u8, "-Xms512m -Xmx512m"));

        // Resolve JAVA_HOME from pantry-installed openjdk
        const java_home = try resolveJavaHome(allocator, project_root, home);
        if (java_home) |jh| {
            try env_vars.put("OPENSEARCH_JAVA_HOME", jh);
        }

        // Resolve PATH to include pantry .bin (for java binary)
        const svc_path = try resolveServicePath(allocator, project_root, home);
        try env_vars.put("PATH", svc_path);

        // Resolve OpenSearch installation directory
        const opensearch_home = try resolvePackageHome(allocator, "opensearch.org", project_root, home);
        if (opensearch_home) |oh| {
            try env_vars.put("OPENSEARCH_HOME", oh);
        }

        const opensearch_bin = try resolveServiceBinary(allocator, "opensearch", project_root, home);
        const start_cmd = try std.fmt.allocPrint(allocator, "{s} -Ehttp.port={d}", .{ opensearch_bin, port });
        allocator.free(opensearch_bin);

        return ServiceConfig{
            .name = try allocator.dupe(u8, "opensearch"),
            .display_name = try allocator.dupe(u8, "OpenSearch"),
            .description = try allocator.dupe(u8, "Search and analytics suite"),
            .start_command = start_cmd,
            .env_vars = env_vars,
            .port = port,
            .health_check = try std.fmt.allocPrint(allocator, "curl -sf http://127.0.0.1:{d}/_cluster/health", .{port}),
        };
    }

    /// CouchDB service
    pub fn couchdb(allocator: std.mem.Allocator, port: u16) !ServiceConfig {
        const env_vars = std.StringHashMap([]const u8).init(allocator);
        return ServiceConfig{
            .name = try allocator.dupe(u8, "couchdb"),
            .display_name = try allocator.dupe(u8, "CouchDB"),
            .description = try allocator.dupe(u8, "Document-oriented NoSQL database"),
            .start_command = try std.fmt.allocPrint(allocator, "couchdb -b -o /dev/null -p {d}", .{port}),
            .env_vars = env_vars,
            .port = port,
        };
    }

    /// Apache Cassandra service
    pub fn cassandra(allocator: std.mem.Allocator, port: u16) !ServiceConfig {
        var env_vars = std.StringHashMap([]const u8).init(allocator);
        try env_vars.put("MAX_HEAP_SIZE", try allocator.dupe(u8, "1G"));
        try env_vars.put("HEAP_NEWSIZE", try allocator.dupe(u8, "256M"));
        return ServiceConfig{
            .name = try allocator.dupe(u8, "cassandra"),
            .display_name = try allocator.dupe(u8, "Cassandra"),
            .description = try allocator.dupe(u8, "Wide-column distributed database"),
            .start_command = try std.fmt.allocPrint(allocator, "cassandra -f -p {d}", .{port}),
            .env_vars = env_vars,
            .port = port,
        };
    }

    /// SurrealDB service
    pub fn surrealdb(allocator: std.mem.Allocator, port: u16) !ServiceConfig {
        const env_vars = std.StringHashMap([]const u8).init(allocator);
        return ServiceConfig{
            .name = try allocator.dupe(u8, "surrealdb"),
            .display_name = try allocator.dupe(u8, "SurrealDB"),
            .description = try allocator.dupe(u8, "Multi-model cloud database"),
            .start_command = try std.fmt.allocPrint(allocator, "surreal start --bind 0.0.0.0:{d} memory", .{port}),
            .env_vars = env_vars,
            .port = port,
            .health_check = try std.fmt.allocPrint(allocator, "curl -sf http://127.0.0.1:{d}/health", .{port}),
        };
    }

    /// DragonflyDB service (Redis-compatible)
    pub fn dragonflydb(allocator: std.mem.Allocator, port: u16) !ServiceConfig {
        const env_vars = std.StringHashMap([]const u8).init(allocator);
        return ServiceConfig{
            .name = try allocator.dupe(u8, "dragonflydb"),
            .display_name = try allocator.dupe(u8, "DragonflyDB"),
            .description = try allocator.dupe(u8, "Redis-compatible in-memory store"),
            .start_command = try std.fmt.allocPrint(allocator, "dragonfly --port {d}", .{port}),
            .env_vars = env_vars,
            .port = port,
        };
    }

    /// Typesense service
    pub fn typesense(allocator: std.mem.Allocator, port: u16) !ServiceConfig {
        const env_vars = std.StringHashMap([]const u8).init(allocator);
        return ServiceConfig{
            .name = try allocator.dupe(u8, "typesense"),
            .display_name = try allocator.dupe(u8, "Typesense"),
            .description = try allocator.dupe(u8, "Typo-tolerant search engine"),
            .start_command = try std.fmt.allocPrint(allocator, "typesense-server --data-dir /usr/local/var/typesense --api-port {d}", .{port}),
            .env_vars = env_vars,
            .port = port,
            .health_check = try std.fmt.allocPrint(allocator, "curl -sf http://127.0.0.1:{d}/health", .{port}),
        };
    }

    /// FerretDB service (MongoDB-compatible on PostgreSQL)
    pub fn ferretdb(allocator: std.mem.Allocator, port: u16) !ServiceConfig {
        const env_vars = std.StringHashMap([]const u8).init(allocator);
        return ServiceConfig{
            .name = try allocator.dupe(u8, "ferretdb"),
            .display_name = try allocator.dupe(u8, "FerretDB"),
            .description = try allocator.dupe(u8, "MongoDB-compatible database on PostgreSQL"),
            .start_command = try std.fmt.allocPrint(allocator, "ferretdb --listen-addr=:{d}", .{port}),
            .env_vars = env_vars,
            .port = port,
        };
    }

    /// TiDB service
    pub fn tidb(allocator: std.mem.Allocator, port: u16) !ServiceConfig {
        const env_vars = std.StringHashMap([]const u8).init(allocator);
        return ServiceConfig{
            .name = try allocator.dupe(u8, "tidb"),
            .display_name = try allocator.dupe(u8, "TiDB"),
            .description = try allocator.dupe(u8, "MySQL-compatible distributed database"),
            .start_command = try std.fmt.allocPrint(allocator, "tidb-server -P {d}", .{port}),
            .env_vars = env_vars,
            .port = port,
        };
    }

    /// ScyllaDB service (Cassandra-compatible)
    pub fn scylladb(allocator: std.mem.Allocator, port: u16) !ServiceConfig {
        const env_vars = std.StringHashMap([]const u8).init(allocator);
        return ServiceConfig{
            .name = try allocator.dupe(u8, "scylladb"),
            .display_name = try allocator.dupe(u8, "ScyllaDB"),
            .description = try allocator.dupe(u8, "Cassandra-compatible NoSQL database"),
            .start_command = try std.fmt.allocPrint(allocator, "scylla --native-transport-port {d}", .{port}),
            .env_vars = env_vars,
            .port = port,
        };
    }

    /// KeyDB service (Redis-compatible)
    pub fn keydb(allocator: std.mem.Allocator, port: u16) !ServiceConfig {
        const env_vars = std.StringHashMap([]const u8).init(allocator);
        return ServiceConfig{
            .name = try allocator.dupe(u8, "keydb"),
            .display_name = try allocator.dupe(u8, "KeyDB"),
            .description = try allocator.dupe(u8, "Multi-threaded Redis-compatible store"),
            .start_command = try std.fmt.allocPrint(allocator, "keydb-server --port {d}", .{port}),
            .env_vars = env_vars,
            .port = port,
        };
    }

    // ========================================================================
    // Message Queue & Streaming Services (Tier 2)
    // ========================================================================

    /// Mosquitto MQTT broker
    pub fn mosquitto(allocator: std.mem.Allocator, port: u16) !ServiceConfig {
        const env_vars = std.StringHashMap([]const u8).init(allocator);
        return ServiceConfig{
            .name = try allocator.dupe(u8, "mosquitto"),
            .display_name = try allocator.dupe(u8, "Mosquitto"),
            .description = try allocator.dupe(u8, "MQTT message broker"),
            .start_command = try std.fmt.allocPrint(allocator, "mosquitto -p {d}", .{port}),
            .env_vars = env_vars,
            .port = port,
        };
    }

    /// Redpanda service (Kafka-compatible)
    pub fn redpanda(allocator: std.mem.Allocator, port: u16) !ServiceConfig {
        const env_vars = std.StringHashMap([]const u8).init(allocator);
        return ServiceConfig{
            .name = try allocator.dupe(u8, "redpanda"),
            .display_name = try allocator.dupe(u8, "Redpanda"),
            .description = try allocator.dupe(u8, "Kafka-compatible streaming platform"),
            .start_command = try std.fmt.allocPrint(allocator, "redpanda start --kafka-addr 0.0.0.0:{d} --overprovisioned --smp 1 --memory 1G", .{port}),
            .env_vars = env_vars,
            .port = port,
        };
    }

    // ========================================================================
    // Monitoring & Observability (Tier 2)
    // ========================================================================

    /// Grafana Loki service
    pub fn loki(allocator: std.mem.Allocator, port: u16) !ServiceConfig {
        const env_vars = std.StringHashMap([]const u8).init(allocator);
        return ServiceConfig{
            .name = try allocator.dupe(u8, "loki"),
            .display_name = try allocator.dupe(u8, "Loki"),
            .description = try allocator.dupe(u8, "Log aggregation system"),
            .start_command = try std.fmt.allocPrint(allocator, "loki --server.http-listen-port={d}", .{port}),
            .env_vars = env_vars,
            .port = port,
            .health_check = try std.fmt.allocPrint(allocator, "curl -sf http://127.0.0.1:{d}/ready", .{port}),
        };
    }

    /// Alertmanager service
    pub fn alertmanager(allocator: std.mem.Allocator, port: u16) !ServiceConfig {
        const env_vars = std.StringHashMap([]const u8).init(allocator);
        return ServiceConfig{
            .name = try allocator.dupe(u8, "alertmanager"),
            .display_name = try allocator.dupe(u8, "Alertmanager"),
            .description = try allocator.dupe(u8, "Alert handling for Prometheus"),
            .start_command = try std.fmt.allocPrint(allocator, "alertmanager --web.listen-address=:{d}", .{port}),
            .env_vars = env_vars,
            .port = port,
            .health_check = try std.fmt.allocPrint(allocator, "curl -sf http://127.0.0.1:{d}/-/healthy", .{port}),
        };
    }

    /// VictoriaMetrics service
    pub fn victoriametrics(allocator: std.mem.Allocator, port: u16) !ServiceConfig {
        const env_vars = std.StringHashMap([]const u8).init(allocator);
        return ServiceConfig{
            .name = try allocator.dupe(u8, "victoriametrics"),
            .display_name = try allocator.dupe(u8, "VictoriaMetrics"),
            .description = try allocator.dupe(u8, "Time series database and monitoring"),
            .start_command = try std.fmt.allocPrint(allocator, "victoria-metrics -httpListenAddr=:{d}", .{port}),
            .env_vars = env_vars,
            .port = port,
            .health_check = try std.fmt.allocPrint(allocator, "curl -sf http://127.0.0.1:{d}/health", .{port}),
        };
    }

    // ========================================================================
    // Proxy & Load Balancer Services
    // ========================================================================

    /// Traefik service
    pub fn traefik(allocator: std.mem.Allocator, port: u16) !ServiceConfig {
        const env_vars = std.StringHashMap([]const u8).init(allocator);
        return ServiceConfig{
            .name = try allocator.dupe(u8, "traefik"),
            .display_name = try allocator.dupe(u8, "Traefik"),
            .description = try allocator.dupe(u8, "Cloud-native reverse proxy"),
            .start_command = try std.fmt.allocPrint(allocator, "traefik --api.dashboard=true --entrypoints.web.address=:{d}", .{port}),
            .env_vars = env_vars,
            .port = port,
            .health_check = try std.fmt.allocPrint(allocator, "curl -sf http://127.0.0.1:{d}/", .{port}),
        };
    }

    /// HAProxy service
    pub fn haproxy(allocator: std.mem.Allocator, port: u16) !ServiceConfig {
        const env_vars = std.StringHashMap([]const u8).init(allocator);
        return ServiceConfig{
            .name = try allocator.dupe(u8, "haproxy"),
            .display_name = try allocator.dupe(u8, "HAProxy"),
            .description = try allocator.dupe(u8, "TCP/HTTP load balancer"),
            .start_command = try std.fmt.allocPrint(allocator, "haproxy -f /usr/local/etc/haproxy/haproxy.cfg -p {d}", .{port}),
            .env_vars = env_vars,
            .port = port,
        };
    }

    /// Varnish service
    pub fn varnish(allocator: std.mem.Allocator, port: u16) !ServiceConfig {
        const env_vars = std.StringHashMap([]const u8).init(allocator);
        return ServiceConfig{
            .name = try allocator.dupe(u8, "varnish"),
            .display_name = try allocator.dupe(u8, "Varnish"),
            .description = try allocator.dupe(u8, "HTTP accelerator and cache"),
            .start_command = try std.fmt.allocPrint(allocator, "varnishd -F -a :{d}", .{port}),
            .env_vars = env_vars,
            .port = port,
        };
    }

    /// Envoy proxy service
    pub fn envoy(allocator: std.mem.Allocator, port: u16) !ServiceConfig {
        const env_vars = std.StringHashMap([]const u8).init(allocator);
        return ServiceConfig{
            .name = try allocator.dupe(u8, "envoy"),
            .display_name = try allocator.dupe(u8, "Envoy"),
            .description = try allocator.dupe(u8, "Cloud-native edge/service proxy"),
            .start_command = try std.fmt.allocPrint(allocator, "envoy -c /usr/local/etc/envoy/envoy.yaml --base-id 0 -l info --admin-address-path :{d}", .{port}),
            .env_vars = env_vars,
            .port = port,
        };
    }

    // ========================================================================
    // Infrastructure (Tier 2)
    // ========================================================================

    /// HashiCorp Nomad service
    pub fn nomad(allocator: std.mem.Allocator, port: u16) !ServiceConfig {
        const env_vars = std.StringHashMap([]const u8).init(allocator);
        return ServiceConfig{
            .name = try allocator.dupe(u8, "nomad"),
            .display_name = try allocator.dupe(u8, "HashiCorp Nomad"),
            .description = try allocator.dupe(u8, "Workload orchestrator"),
            .start_command = try std.fmt.allocPrint(allocator, "nomad agent -dev -http-port={d}", .{port}),
            .env_vars = env_vars,
            .port = port,
            .health_check = try std.fmt.allocPrint(allocator, "curl -sf http://127.0.0.1:{d}/v1/status/leader", .{port}),
        };
    }

    // ========================================================================
    // Development & CI/CD (Tier 2)
    // ========================================================================

    /// Gitea service
    pub fn gitea(allocator: std.mem.Allocator, port: u16) !ServiceConfig {
        const env_vars = std.StringHashMap([]const u8).init(allocator);
        return ServiceConfig{
            .name = try allocator.dupe(u8, "gitea"),
            .display_name = try allocator.dupe(u8, "Gitea"),
            .description = try allocator.dupe(u8, "Self-hosted Git service"),
            .start_command = try std.fmt.allocPrint(allocator, "gitea web --port {d}", .{port}),
            .env_vars = env_vars,
            .port = port,
            .health_check = try std.fmt.allocPrint(allocator, "curl -sf http://127.0.0.1:{d}/", .{port}),
        };
    }

    /// Mailpit service (email testing)
    pub fn mailpit(allocator: std.mem.Allocator, port: u16) !ServiceConfig {
        const env_vars = std.StringHashMap([]const u8).init(allocator);
        return ServiceConfig{
            .name = try allocator.dupe(u8, "mailpit"),
            .display_name = try allocator.dupe(u8, "Mailpit"),
            .description = try allocator.dupe(u8, "Email and SMTP testing tool"),
            .start_command = try std.fmt.allocPrint(allocator, "mailpit --listen 0.0.0.0:{d}", .{port}),
            .env_vars = env_vars,
            .port = port,
            .health_check = try std.fmt.allocPrint(allocator, "curl -sf http://127.0.0.1:{d}/", .{port}),
        };
    }

    /// Ollama service (AI model server)
    pub fn ollama(allocator: std.mem.Allocator, port: u16) !ServiceConfig {
        var env_vars = std.StringHashMap([]const u8).init(allocator);
        try env_vars.put("OLLAMA_HOST", try std.fmt.allocPrint(allocator, "0.0.0.0:{d}", .{port}));
        return ServiceConfig{
            .name = try allocator.dupe(u8, "ollama"),
            .display_name = try allocator.dupe(u8, "Ollama"),
            .description = try allocator.dupe(u8, "Local AI model server"),
            .start_command = try allocator.dupe(u8, "ollama serve"),
            .env_vars = env_vars,
            .port = port,
            .health_check = try std.fmt.allocPrint(allocator, "curl -sf http://127.0.0.1:{d}/", .{port}),
        };
    }

    // ========================================================================
    // DNS & Network Services
    // ========================================================================

    /// dnsmasq service
    pub fn dnsmasq(allocator: std.mem.Allocator, port: u16) !ServiceConfig {
        const env_vars = std.StringHashMap([]const u8).init(allocator);
        return ServiceConfig{
            .name = try allocator.dupe(u8, "dnsmasq"),
            .display_name = try allocator.dupe(u8, "dnsmasq"),
            .description = try allocator.dupe(u8, "Lightweight DNS/DHCP server"),
            .start_command = try std.fmt.allocPrint(allocator, "dnsmasq --keep-in-foreground --port={d}", .{port}),
            .env_vars = env_vars,
            .port = port,
        };
    }

    /// CoreDNS service
    pub fn coredns(allocator: std.mem.Allocator, port: u16) !ServiceConfig {
        const env_vars = std.StringHashMap([]const u8).init(allocator);
        return ServiceConfig{
            .name = try allocator.dupe(u8, "coredns"),
            .display_name = try allocator.dupe(u8, "CoreDNS"),
            .description = try allocator.dupe(u8, "Cloud-native DNS server"),
            .start_command = try std.fmt.allocPrint(allocator, "coredns -dns.port={d}", .{port}),
            .env_vars = env_vars,
            .port = port,
        };
    }

    /// Unbound DNS resolver
    pub fn unbound(allocator: std.mem.Allocator, port: u16) !ServiceConfig {
        const env_vars = std.StringHashMap([]const u8).init(allocator);
        return ServiceConfig{
            .name = try allocator.dupe(u8, "unbound"),
            .display_name = try allocator.dupe(u8, "Unbound"),
            .description = try allocator.dupe(u8, "Validating DNS resolver"),
            .start_command = try std.fmt.allocPrint(allocator, "unbound -d -p {d}", .{port}),
            .env_vars = env_vars,
            .port = port,
        };
    }

    // ========================================================================
    // Web Servers (Tier 2)
    // ========================================================================

    /// Apache HTTP Server
    pub fn httpd(allocator: std.mem.Allocator, port: u16) !ServiceConfig {
        const env_vars = std.StringHashMap([]const u8).init(allocator);
        return ServiceConfig{
            .name = try allocator.dupe(u8, "httpd"),
            .display_name = try allocator.dupe(u8, "Apache HTTP Server"),
            .description = try allocator.dupe(u8, "Apache web server"),
            .start_command = try std.fmt.allocPrint(allocator, "httpd -DFOREGROUND -f /usr/local/etc/httpd/httpd.conf -c 'Listen {d}'", .{port}),
            .env_vars = env_vars,
            .port = port,
            .health_check = try std.fmt.allocPrint(allocator, "curl -sf http://127.0.0.1:{d}/", .{port}),
        };
    }

    // ========================================================================
    // Sync & Storage Services
    // ========================================================================

    /// Syncthing service
    pub fn syncthing(allocator: std.mem.Allocator, port: u16) !ServiceConfig {
        const env_vars = std.StringHashMap([]const u8).init(allocator);
        return ServiceConfig{
            .name = try allocator.dupe(u8, "syncthing"),
            .display_name = try allocator.dupe(u8, "Syncthing"),
            .description = try allocator.dupe(u8, "Continuous file synchronization"),
            .start_command = try std.fmt.allocPrint(allocator, "syncthing serve --gui-address=0.0.0.0:{d} --no-browser", .{port}),
            .env_vars = env_vars,
            .port = port,
            .health_check = try std.fmt.allocPrint(allocator, "curl -sf http://127.0.0.1:{d}/", .{port}),
        };
    }

    // ========================================================================
    // Network & Security Services
    // ========================================================================

    /// Tor service
    pub fn tor(allocator: std.mem.Allocator, port: u16) !ServiceConfig {
        const env_vars = std.StringHashMap([]const u8).init(allocator);
        return ServiceConfig{
            .name = try allocator.dupe(u8, "tor"),
            .display_name = try allocator.dupe(u8, "Tor"),
            .description = try allocator.dupe(u8, "Anonymity network proxy"),
            .start_command = try std.fmt.allocPrint(allocator, "tor --SocksPort {d}", .{port}),
            .env_vars = env_vars,
            .port = port,
        };
    }

    // ========================================================================
    // Search Services
    // ========================================================================

    /// Apache Zookeeper service
    pub fn zookeeper(allocator: std.mem.Allocator, port: u16) !ServiceConfig {
        const env_vars = std.StringHashMap([]const u8).init(allocator);
        return ServiceConfig{
            .name = try allocator.dupe(u8, "zookeeper"),
            .display_name = try allocator.dupe(u8, "Apache Zookeeper"),
            .description = try allocator.dupe(u8, "Distributed coordination service"),
            .start_command = try std.fmt.allocPrint(allocator, "zkServer.sh start-foreground", .{}),
            .env_vars = env_vars,
            .port = port,
            .health_check = try std.fmt.allocPrint(allocator, "echo ruok | nc 127.0.0.1 {d}", .{port}),
        };
    }

    /// Apache Solr service
    pub fn solr(allocator: std.mem.Allocator, port: u16) !ServiceConfig {
        const env_vars = std.StringHashMap([]const u8).init(allocator);
        return ServiceConfig{
            .name = try allocator.dupe(u8, "solr"),
            .display_name = try allocator.dupe(u8, "Apache Solr"),
            .description = try allocator.dupe(u8, "Enterprise search platform"),
            .start_command = try std.fmt.allocPrint(allocator, "solr start -f -p {d}", .{port}),
            .env_vars = env_vars,
            .port = port,
            .health_check = try std.fmt.allocPrint(allocator, "curl -sf http://127.0.0.1:{d}/solr/admin/info/system", .{port}),
        };
    }

    // ========================================================================
    // Application Servers
    // ========================================================================

    /// PHP-FPM service
    pub fn phpfpm(allocator: std.mem.Allocator, port: u16) !ServiceConfig {
        const env_vars = std.StringHashMap([]const u8).init(allocator);
        return ServiceConfig{
            .name = try allocator.dupe(u8, "php-fpm"),
            .display_name = try allocator.dupe(u8, "PHP-FPM"),
            .description = try allocator.dupe(u8, "PHP FastCGI process manager"),
            .start_command = try std.fmt.allocPrint(allocator, "php-fpm --nodaemonize --fpm-config /usr/local/etc/php-fpm.conf", .{}),
            .env_vars = env_vars,
            .port = port,
            .health_check = try std.fmt.allocPrint(allocator, "curl -sf http://127.0.0.1:{d}/ping", .{port}),
        };
    }

    /// PocketBase service
    pub fn pocketbase(allocator: std.mem.Allocator, port: u16) !ServiceConfig {
        const env_vars = std.StringHashMap([]const u8).init(allocator);
        return ServiceConfig{
            .name = try allocator.dupe(u8, "pocketbase"),
            .display_name = try allocator.dupe(u8, "PocketBase"),
            .description = try allocator.dupe(u8, "Backend as a service"),
            .start_command = try std.fmt.allocPrint(allocator, "pocketbase serve --http=127.0.0.1:{d}", .{port}),
            .env_vars = env_vars,
            .port = port,
            .health_check = try std.fmt.allocPrint(allocator, "curl -sf http://127.0.0.1:{d}/api/health", .{port}),
        };
    }

    // ========================================================================
    // Tunnels & Secrets
    // ========================================================================

    /// Cloudflared tunnel service
    pub fn cloudflared(allocator: std.mem.Allocator) !ServiceConfig {
        const env_vars = std.StringHashMap([]const u8).init(allocator);
        return ServiceConfig{
            .name = try allocator.dupe(u8, "cloudflared"),
            .display_name = try allocator.dupe(u8, "Cloudflared"),
            .description = try allocator.dupe(u8, "Cloudflare Tunnel client"),
            .start_command = try allocator.dupe(u8, "cloudflared tunnel run"),
            .env_vars = env_vars,
            .port = null,
        };
    }

    /// Doppler secrets manager
    pub fn doppler(allocator: std.mem.Allocator) !ServiceConfig {
        const env_vars = std.StringHashMap([]const u8).init(allocator);
        return ServiceConfig{
            .name = try allocator.dupe(u8, "doppler"),
            .display_name = try allocator.dupe(u8, "Doppler"),
            .description = try allocator.dupe(u8, "Secrets management platform"),
            .start_command = try allocator.dupe(u8, "doppler run"),
            .env_vars = env_vars,
            .port = null,
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
        if (std.mem.eql(u8, service_name, "meilisearch")) return 7700;

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

        // Additional Databases
        if (std.mem.eql(u8, service_name, "mariadb")) return 3306;
        if (std.mem.eql(u8, service_name, "valkey")) return 6379;
        if (std.mem.eql(u8, service_name, "opensearch")) return 9200;
        if (std.mem.eql(u8, service_name, "couchdb")) return 5984;
        if (std.mem.eql(u8, service_name, "cassandra")) return 9042;
        if (std.mem.eql(u8, service_name, "surrealdb")) return 8000;
        if (std.mem.eql(u8, service_name, "dragonflydb")) return 6379;
        if (std.mem.eql(u8, service_name, "typesense")) return 8108;
        if (std.mem.eql(u8, service_name, "ferretdb")) return 27018;
        if (std.mem.eql(u8, service_name, "tidb")) return 4000;
        if (std.mem.eql(u8, service_name, "scylladb")) return 9042;
        if (std.mem.eql(u8, service_name, "keydb")) return 6379;

        // Additional Message Queues
        if (std.mem.eql(u8, service_name, "mosquitto")) return 1883;
        if (std.mem.eql(u8, service_name, "redpanda")) return 9092;

        // Additional Monitoring
        if (std.mem.eql(u8, service_name, "loki")) return 3100;
        if (std.mem.eql(u8, service_name, "alertmanager")) return 9093;
        if (std.mem.eql(u8, service_name, "victoriametrics")) return 8428;

        // Proxy & Load Balancers
        if (std.mem.eql(u8, service_name, "traefik")) return 8082;
        if (std.mem.eql(u8, service_name, "haproxy")) return 8081;
        if (std.mem.eql(u8, service_name, "varnish")) return 6081;
        if (std.mem.eql(u8, service_name, "envoy")) return 10000;

        // Additional Infrastructure
        if (std.mem.eql(u8, service_name, "nomad")) return 4646;

        // Additional Dev/CI
        if (std.mem.eql(u8, service_name, "gitea")) return 3001;
        if (std.mem.eql(u8, service_name, "mailpit")) return 8025;
        if (std.mem.eql(u8, service_name, "ollama")) return 11434;

        // DNS & Network
        if (std.mem.eql(u8, service_name, "dnsmasq")) return 5353;
        if (std.mem.eql(u8, service_name, "coredns")) return 1053;
        if (std.mem.eql(u8, service_name, "unbound")) return 5335;

        // Web Servers
        if (std.mem.eql(u8, service_name, "nginx")) return 8080;
        if (std.mem.eql(u8, service_name, "caddy")) return 2015;
        if (std.mem.eql(u8, service_name, "httpd")) return 8084;

        // Sync & Storage
        if (std.mem.eql(u8, service_name, "syncthing")) return 8384;

        // Network & Security
        if (std.mem.eql(u8, service_name, "tor")) return 9050;

        // Search
        if (std.mem.eql(u8, service_name, "zookeeper")) return 2181;
        if (std.mem.eql(u8, service_name, "solr")) return 8983;

        // Application Servers
        if (std.mem.eql(u8, service_name, "php-fpm")) return 9074;
        if (std.mem.eql(u8, service_name, "pocketbase")) return 8095;

        // Tunnels & Secrets (no listening port)
        // cloudflared and doppler return null

        return null;
    }
};

test "Service definitions" {
    const allocator = std.testing.allocator;

    // Test PostgreSQL
    var pg = try Services.postgresql(allocator, 5432);
    defer pg.deinit(allocator);
    try std.testing.expectEqualStrings("postgres", pg.name);
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
