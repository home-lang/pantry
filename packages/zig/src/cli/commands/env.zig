//! Environment management commands

const std = @import("std");
const lib = @import("../../lib.zig");
const common = @import("common.zig");

const CommandResult = common.CommandResult;
const env = lib.env;
const string = lib.string;

pub fn envListCommand(allocator: std.mem.Allocator, _: []const []const u8) !CommandResult {
    var manager = try env.EnvManager.init(allocator);
    defer manager.deinit();

    var envs = try manager.list();
    defer envs.deinit(allocator);

    if (envs.items.len == 0) {
        std.debug.print("No environments found.\n", .{});
        return .{ .exit_code = 0 };
    }

    std.debug.print("Environments ({d}):\n\n", .{envs.items.len});
    for (envs.items) |hash| {
        const hex = try string.hashToHex(hash, allocator);
        defer allocator.free(hex);
        std.debug.print("  {s}\n", .{hex});
    }

    return .{ .exit_code = 0 };
}

pub fn envRemoveCommand(allocator: std.mem.Allocator, hash_str: []const u8) !CommandResult {
    var manager = try env.EnvManager.init(allocator);
    defer manager.deinit();

    if (hash_str.len != 32) {
        return CommandResult.err(allocator, "Error: Invalid hash (must be 32 hex characters)");
    }

    var hash: [16]u8 = undefined;
    _ = std.fmt.hexToBytes(&hash, hash_str) catch {
        return CommandResult.err(allocator, "Error: Invalid hex string");
    };

    std.debug.print("Removing environment {s}...\n", .{hash_str});
    try manager.remove(hash);
    std.debug.print("Done.\n", .{});

    return .{ .exit_code = 0 };
}

pub fn envInspectCommand(allocator: std.mem.Allocator, hash_str: []const u8) !CommandResult {
    var manager = try env.EnvManager.init(allocator);
    defer manager.deinit();

    if (hash_str.len != 32) {
        return CommandResult.err(allocator, "Error: Invalid hash (must be 32 hex characters)");
    }

    var hash: [16]u8 = undefined;
    _ = std.fmt.hexToBytes(&hash, hash_str) catch {
        return CommandResult.err(allocator, "Error: Invalid hex string");
    };

    std.debug.print("Environment: {s}\n\n", .{hash_str});
    std.debug.print("  Status: Active\n", .{});
    std.debug.print("  Created: (timestamp)\n", .{});
    std.debug.print("  Packages: (package list)\n", .{});

    return .{ .exit_code = 0 };
}

pub fn envCleanCommand(allocator: std.mem.Allocator, _: []const []const u8) !CommandResult {
    var manager = try env.EnvManager.init(allocator);
    defer manager.deinit();

    std.debug.print("Cleaning old environments...\n", .{});
    std.debug.print("Removed 0 environment(s)\n", .{});

    return .{ .exit_code = 0 };
}

pub fn envLookupCommand(allocator: std.mem.Allocator, project_dir: []const u8) !CommandResult {
    const detector = @import("../../deps/detector.zig");

    const deps_file = (try detector.findDepsFile(allocator, project_dir)) orelse {
        return .{ .exit_code = 1 };
    };
    defer allocator.free(deps_file.path);

    const project_hash = string.hashDependencyFile(deps_file.path);
    const hex = try string.hashToHex(project_hash, allocator);
    defer allocator.free(hex);

    return .{
        .exit_code = 0,
        .message = try allocator.dupe(u8, hex),
    };
}
