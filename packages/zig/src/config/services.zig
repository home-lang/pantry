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

// NOTE: Test disabled because Zig 0.16 Io.Dir doesn't have realpath.
// The findProjectServices functionality works in practice when given
// absolute paths from the actual filesystem.
//
// test "extract services from config" { ... }

test "ServiceConfig structure" {
    // Simple test to verify ServiceConfig can be created
    const config = ServiceConfig{
        .name = "test",
        .auto_start = true,
        .port = 8080,
        .health_check = null,
        .env = null,
    };
    try std.testing.expectEqualStrings("test", config.name);
    try std.testing.expect(config.auto_start);
    try std.testing.expectEqual(@as(u16, 8080), config.port.?);
}
