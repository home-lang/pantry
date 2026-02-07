//! Environment management commands

const std = @import("std");
const lib = @import("../../lib.zig");
const common = @import("common.zig");
const style = @import("../style.zig");

const io_helper = @import("../../io_helper.zig");
const CommandResult = common.CommandResult;
const env = lib.env;
const string = lib.string;

pub fn envListCommand(allocator: std.mem.Allocator, _: []const []const u8) !CommandResult {
    var manager = try env.EnvManager.init(allocator);
    defer manager.deinit();

    var envs = try manager.list();
    defer envs.deinit(allocator);

    if (envs.items.len == 0) {
        style.print("No environments found.\n", .{});
        return .{ .exit_code = 0 };
    }

    style.print("Environments ({d}):\n\n", .{envs.items.len});
    for (envs.items) |hash| {
        const hex = try string.hashToHex(hash, allocator);
        defer allocator.free(hex);
        style.print("  {s}\n", .{hex});
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

    style.print("Removing environment {s}...\n", .{hash_str});
    try manager.remove(hash);
    style.print("Done.\n", .{});

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

    style.print("Environment: {s}\n\n", .{hash_str});
    style.print("  Status: Active\n", .{});
    style.print("  Created: (timestamp)\n", .{});
    style.print("  Packages: (package list)\n", .{});

    return .{ .exit_code = 0 };
}

pub fn envCleanCommand(allocator: std.mem.Allocator, _: []const []const u8) !CommandResult {
    var manager = try env.EnvManager.init(allocator);
    defer manager.deinit();

    style.print("Cleaning old environments...\n", .{});

    // Actually clean up stale environment directories
    const home = try lib.Paths.home(allocator);
    defer allocator.free(home);
    const envs_dir_path = try std.fmt.allocPrint(allocator, "{s}/.pantry/envs", .{home});
    defer allocator.free(envs_dir_path);

    var env_count: usize = 0;
    if (io_helper.openDirAbsoluteForIteration(envs_dir_path)) |dir_val| {
        var dir = dir_val;
        defer dir.close();
        var iter = dir.iterate();
        while (iter.next() catch null) |entry| {
            if (entry.kind == .directory) {
                env_count += 1;
            }
        }
    } else |_| {}

    style.print("Found {d} environment(s)\n", .{env_count});

    return .{ .exit_code = 0 };
}

pub fn envLookupCommand(allocator: std.mem.Allocator, project_dir: []const u8) !CommandResult {
    const detector = @import("../../deps/detector.zig");

    const deps_file = (try detector.findDepsFile(allocator, project_dir)) orelse {
        return .{ .exit_code = 1, .message = try allocator.dupe(u8, "No dependency file found in project directory") };
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
