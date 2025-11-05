//! Service management commands

const std = @import("std");
const lib = @import("../../lib.zig");
const common = @import("common.zig");

const CommandResult = common.CommandResult;

pub fn servicesCommand(_: std.mem.Allocator) !CommandResult {
    std.debug.print("Available services:\n\n", .{});

    const services = [_]struct { name: []const u8, display: []const u8, port: u16 }{
        .{ .name = "postgres", .display = "PostgreSQL", .port = 5432 },
        .{ .name = "mysql", .display = "MySQL", .port = 3306 },
        .{ .name = "redis", .display = "Redis", .port = 6379 },
        .{ .name = "nginx", .display = "Nginx", .port = 80 },
        .{ .name = "mongodb", .display = "MongoDB", .port = 27017 },
    };

    for (services) |svc| {
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
        return CommandResult.err(allocator, "Error: No service specified");
    }

    const service_name = args[0];
    std.debug.print("Starting {s}...\n", .{service_name});

    const platform = lib.Platform.current();

    switch (platform) {
        .darwin => {
            const result = std.process.Child.run(.{
                .allocator = allocator,
                .argv = &[_][]const u8{ "brew", "services", "start", service_name },
            }) catch |err| {
                const msg = try std.fmt.allocPrint(
                    allocator,
                    "Failed to start {s}: {}",
                    .{ service_name, err },
                );
                return .{
                    .exit_code = 1,
                    .message = msg,
                };
            };
            defer allocator.free(result.stdout);
            defer allocator.free(result.stderr);

            if (result.term.Exited == 0) {
                std.debug.print("✓ Started {s}\n", .{service_name});
                return .{ .exit_code = 0 };
            } else {
                std.debug.print("Error: {s}\n", .{result.stderr});
                return .{ .exit_code = 1 };
            }
        },
        .linux => {
            const result = std.process.Child.run(.{
                .allocator = allocator,
                .argv = &[_][]const u8{ "systemctl", "start", service_name },
            }) catch |err| {
                const msg = try std.fmt.allocPrint(
                    allocator,
                    "Failed to start {s}: {}",
                    .{ service_name, err },
                );
                return .{
                    .exit_code = 1,
                    .message = msg,
                };
            };
            defer allocator.free(result.stdout);
            defer allocator.free(result.stderr);

            if (result.term.Exited == 0) {
                std.debug.print("✓ Started {s}\n", .{service_name});
                return .{ .exit_code = 0 };
            } else {
                std.debug.print("Error: {s}\n", .{result.stderr});
                return .{ .exit_code = 1 };
            }
        },
        else => {
            return .{
                .exit_code = 1,
                .message = try allocator.dupe(u8, "Error: Service management not supported on this platform"),
            };
        },
    }
}

pub fn stopCommand(allocator: std.mem.Allocator, args: []const []const u8) !CommandResult {
    if (args.len == 0) {
        return CommandResult.err(allocator, "Error: No service specified");
    }

    const service_name = args[0];
    std.debug.print("Stopping {s}...\n", .{service_name});

    const platform = lib.Platform.current();

    switch (platform) {
        .darwin => {
            const result = std.process.Child.run(.{
                .allocator = allocator,
                .argv = &[_][]const u8{ "brew", "services", "stop", service_name },
            }) catch |err| {
                const msg = try std.fmt.allocPrint(allocator, "Failed to stop {s}: {}", .{ service_name, err });
                return .{ .exit_code = 1, .message = msg };
            };
            defer allocator.free(result.stdout);
            defer allocator.free(result.stderr);

            if (result.term.Exited == 0) {
                std.debug.print("✓ Stopped {s}\n", .{service_name});
                return .{ .exit_code = 0 };
            } else {
                return .{ .exit_code = 1 };
            }
        },
        .linux => {
            const result = std.process.Child.run(.{
                .allocator = allocator,
                .argv = &[_][]const u8{ "systemctl", "stop", service_name },
            }) catch |err| {
                const msg = try std.fmt.allocPrint(allocator, "Failed to stop {s}: {}", .{ service_name, err });
                return .{ .exit_code = 1, .message = msg };
            };
            defer allocator.free(result.stdout);
            defer allocator.free(result.stderr);

            if (result.term.Exited == 0) {
                std.debug.print("✓ Stopped {s}\n", .{service_name});
                return .{ .exit_code = 0 };
            } else {
                return .{ .exit_code = 1 };
            }
        },
        else => {
            return CommandResult.err(allocator, "Error: Service management not supported on this platform");
        },
    }
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
    _ = allocator;
    if (args.len == 0) {
        std.debug.print("Service Status:\n\n", .{});
        std.debug.print("Use: pantry status <service>\n", .{});
        return .{ .exit_code = 0 };
    }

    const service_name = args[0];
    std.debug.print("Status of {s}:\n", .{service_name});
    std.debug.print("  Running: (check implementation)\n", .{});

    return .{ .exit_code = 0 };
}
