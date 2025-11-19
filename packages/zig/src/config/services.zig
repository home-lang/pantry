const std = @import("std");
const zig_config = @import("zig-config");

/// Service configuration from pantry.json
pub const ServiceConfig = struct {
    name: []const u8,
    auto_start: bool = false,
    port: ?u16 = null,
    env: ?std.StringHashMap([]const u8) = null,
    health_check: ?[]const u8 = null,

    pub fn deinit(self: *ServiceConfig, allocator: std.mem.Allocator) void {
        allocator.free(self.name);
        if (self.health_check) |hc| allocator.free(hc);
        if (self.env) |*env_map| {
            var it = env_map.iterator();
            while (it.next()) |entry| {
                allocator.free(entry.key_ptr.*);
                allocator.free(entry.value_ptr.*);
            }
            env_map.deinit();
        }
    }
};

/// Extract services configuration from a config object
/// Returns a list of ServiceConfig
/// Caller owns the returned list and all ServiceConfig items
pub fn extractServices(allocator: std.mem.Allocator, config: anytype) !?[]ServiceConfig {
    // Check if config is an object
    if (config.config != .object) {
        return null;
    }

    // Try to get services object from config
    const services_value = config.config.object.get("services") orelse {
        return null;
    };

    // Services should be an object
    const services_obj = switch (services_value) {
        .object => |obj| obj,
        else => return null,
    };

    var services_list = try std.ArrayList(ServiceConfig).initCapacity(allocator, 4);
    errdefer {
        for (services_list.items) |*svc| {
            var s = svc.*;
            s.deinit(allocator);
        }
        services_list.deinit(allocator);
    }

    // Iterate over all service entries
    var it = services_obj.iterator();
    while (it.next()) |entry| {
        const service_name = entry.key_ptr.*;
        const service_value = entry.value_ptr.*;

        // Service value can be:
        // 1. Boolean: true/false for auto-start
        // 2. Object: detailed configuration
        var service_config = ServiceConfig{
            .name = try allocator.dupe(u8, service_name),
        };
        errdefer allocator.free(service_config.name);

        switch (service_value) {
            .bool => |auto_start| {
                service_config.auto_start = auto_start;
            },
            .object => |obj| {
                // Parse detailed configuration
                if (obj.get("autoStart")) |auto_start_val| {
                    service_config.auto_start = switch (auto_start_val) {
                        .bool => |b| b,
                        else => false,
                    };
                }

                if (obj.get("port")) |port_val| {
                    service_config.port = switch (port_val) {
                        .integer => |i| @intCast(@mod(i, 65536)),
                        else => null,
                    };
                }

                if (obj.get("healthCheck")) |hc_val| {
                    service_config.health_check = switch (hc_val) {
                        .string => |s| try allocator.dupe(u8, s),
                        else => null,
                    };
                }

                if (obj.get("env")) |env_val| {
                    if (env_val == .object) {
                        var env_map = std.StringHashMap([]const u8).init(allocator);
                        var env_it = env_val.object.iterator();
                        while (env_it.next()) |env_entry| {
                            const key = try allocator.dupe(u8, env_entry.key_ptr.*);
                            const value = switch (env_entry.value_ptr.*) {
                                .string => |s| try allocator.dupe(u8, s),
                                .integer => |i| try std.fmt.allocPrint(allocator, "{d}", .{i}),
                                .bool => |b| try allocator.dupe(u8, if (b) "true" else "false"),
                                else => try allocator.dupe(u8, ""),
                            };
                            try env_map.put(key, value);
                        }
                        service_config.env = env_map;
                    }
                }
            },
            else => {
                // Invalid type, skip this service
                allocator.free(service_config.name);
                continue;
            },
        }

        try services_list.append(allocator, service_config);
    }

    if (services_list.items.len == 0) {
        services_list.deinit(allocator);
        return null;
    }

    return try services_list.toOwnedSlice(allocator);
}

/// Find and load services configuration from a project directory
/// Searches for pantry.json or pantry.jsonc
pub fn findProjectServices(allocator: std.mem.Allocator, project_dir: []const u8) !?[]ServiceConfig {
    const loader = @import("loader.zig");

    // Try to load pantry config from the project directory
    var config = loader.loadpantryConfig(allocator, .{
        .name = "pantry",
        .cwd = project_dir,
    }) catch return null;
    defer config.deinit();

    return try extractServices(allocator, config);
}

test "extract services from config" {
    const allocator = std.testing.allocator;

    // Create a temporary directory with a config file
    var tmp_dir = std.testing.tmpDir(.{});
    defer tmp_dir.cleanup();

    // Create pantry.json with services
    const pantry_json =
        \\{
        \\  "name": "test-project",
        \\  "services": {
        \\    "postgres": true,
        \\    "redis": {
        \\      "autoStart": true,
        \\      "port": 6379,
        \\      "healthCheck": "redis-cli ping"
        \\    },
        \\    "nginx": {
        \\      "autoStart": false,
        \\      "port": 8080,
        \\      "env": {
        \\        "NGINX_PORT": "8080",
        \\        "NGINX_HOST": "localhost"
        \\      }
        \\    }
        \\  }
        \\}
    ;

    const file = try tmp_dir.dir.createFile("pantry.json", .{});
    defer file.close();
    try file.writeAll(pantry_json);

    // Get the absolute path
    const tmp_path = try tmp_dir.dir.realpathAlloc(allocator, ".");
    defer allocator.free(tmp_path);

    // Load services
    const services = try findProjectServices(allocator, tmp_path);
    try std.testing.expect(services != null);

    defer {
        if (services) |svc_list| {
            for (svc_list) |*svc| {
                var s = svc.*;
                s.deinit(allocator);
            }
            allocator.free(svc_list);
        }
    }

    // Verify we got 3 services
    try std.testing.expectEqual(@as(usize, 3), services.?.len);

    // Find postgres service
    var found_postgres = false;
    var found_redis = false;
    var found_nginx = false;

    for (services.?) |svc| {
        if (std.mem.eql(u8, svc.name, "postgres")) {
            found_postgres = true;
            try std.testing.expect(svc.auto_start == true);
        } else if (std.mem.eql(u8, svc.name, "redis")) {
            found_redis = true;
            try std.testing.expect(svc.auto_start == true);
            try std.testing.expect(svc.port != null);
            try std.testing.expectEqual(@as(u16, 6379), svc.port.?);
            try std.testing.expect(svc.health_check != null);
        } else if (std.mem.eql(u8, svc.name, "nginx")) {
            found_nginx = true;
            try std.testing.expect(svc.auto_start == false);
            try std.testing.expect(svc.port != null);
            try std.testing.expectEqual(@as(u16, 8080), svc.port.?);
            try std.testing.expect(svc.env != null);
            try std.testing.expectEqual(@as(usize, 2), svc.env.?.count());
        }
    }

    try std.testing.expect(found_postgres);
    try std.testing.expect(found_redis);
    try std.testing.expect(found_nginx);
}
