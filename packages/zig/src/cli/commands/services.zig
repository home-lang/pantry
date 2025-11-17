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
    std.debug.print("Available services:\n\n", .{});

    const available_services = [_]struct { name: []const u8, display: []const u8, port: u16 }{
        .{ .name = "postgres", .display = "PostgreSQL", .port = 5432 },
        .{ .name = "mysql", .display = "MySQL", .port = 3306 },
        .{ .name = "redis", .display = "Redis", .port = 6379 },
        .{ .name = "nginx", .display = "Nginx", .port = 8080 },
        .{ .name = "mongodb", .display = "MongoDB", .port = 27017 },
    };

    for (available_services) |svc| {
        std.debug.print("  {s: <12} {s} (default port: {d})\n", .{ svc.name, svc.display, svc.port });
    }

    std.debug.print("\nUsage:\n", .{});
    std.debug.print("  pantry start <service>    Start a service\n", .{});
    std.debug.print("  pantry stop <service>     Stop a service\n", .{});
    std.debug.print("  pantry restart <service>  Restart a service\n", .{});
    std.debug.print("  pantry status [service]   Show service status\n", .{});

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
    // Map service names to their default ports and return config
    if (std.mem.eql(u8, name, "postgres") or std.mem.eql(u8, name, "postgresql")) {
        return try Services.postgresql(allocator, 5432);
    } else if (std.mem.eql(u8, name, "redis")) {
        return try Services.redis(allocator, 6379);
    } else if (std.mem.eql(u8, name, "mysql")) {
        return try Services.mysql(allocator, 3306);
    } else if (std.mem.eql(u8, name, "nginx")) {
        return try Services.nginx(allocator, 8080);
    } else if (std.mem.eql(u8, name, "mongodb")) {
        return try Services.mongodb(allocator, 27017);
    } else {
        return error.UnknownService;
    }
}
