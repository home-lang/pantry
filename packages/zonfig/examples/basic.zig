const std = @import("std");
const zonfig = @import("zonfig");

pub fn main() !void {
    var gpa = std.heap.GeneralPurposeAllocator(.{}){};
    defer _ = gpa.deinit();
    const allocator = gpa.allocator();

    // Create some defaults
    var defaults = std.json.ObjectMap.init(allocator);
    defer defaults.deinit();
    
    try defaults.put("app_name", .{ .string = try allocator.dupe(u8, "My Application") });
    try defaults.put("port", .{ .integer = 8080 });
    try defaults.put("debug", .{ .bool = false });
    try defaults.put("max_connections", .{ .integer = 100 });

    // Load configuration
    var config = try zonfig.loadConfig(allocator, .{
        .name = "example",
        .defaults = .{ .object = defaults },
        .env_prefix = "EXAMPLE",
    });
    defer config.deinit();

    // Display configuration source
    std.debug.print("Configuration loaded from: {s}\n", .{@tagName(config.source)});
    std.debug.print("Sources used ({d}):\n", .{config.sources.len});
    for (config.sources) |source| {
        std.debug.print("  - {s} (priority: {d})\n", .{ @tagName(source.source), source.priority });
    }
    std.debug.print("\n", .{});

    // Display configuration values
    std.debug.print("Configuration values:\n", .{});
    
    if (config.config.object.get("app_name")) |value| {
        std.debug.print("  app_name: {s}\n", .{value.string});
    }
    
    if (config.config.object.get("port")) |value| {
        std.debug.print("  port: {d}\n", .{value.integer});
    }
    
    if (config.config.object.get("debug")) |value| {
        std.debug.print("  debug: {}\n", .{value.bool});
    }
    
    if (config.config.object.get("max_connections")) |value| {
        std.debug.print("  max_connections: {d}\n", .{value.integer});
    }

    std.debug.print("\nTry setting environment variables:\n", .{});
    std.debug.print("  export EXAMPLE_PORT=3000\n", .{});
    std.debug.print("  export EXAMPLE_DEBUG=true\n", .{});
    std.debug.print("  export EXAMPLE_MAX_CONNECTIONS=200\n", .{});
}
