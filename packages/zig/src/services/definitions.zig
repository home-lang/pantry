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

    /// Get default port for a service
    pub fn getDefaultPort(service_name: []const u8) ?u16 {
        if (std.mem.eql(u8, service_name, "postgresql")) return 5432;
        if (std.mem.eql(u8, service_name, "redis")) return 6379;
        if (std.mem.eql(u8, service_name, "mysql")) return 3306;
        if (std.mem.eql(u8, service_name, "nginx")) return 80;
        if (std.mem.eql(u8, service_name, "mongodb")) return 27017;
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
