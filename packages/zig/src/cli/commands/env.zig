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
    return envListCommandWithFormat(allocator, "table", false);
}

pub fn envListCommandWithFormat(allocator: std.mem.Allocator, format: []const u8, verbose: bool) !CommandResult {
    const env_commands = @import("../../env/commands.zig");
    var commands = env_commands.EnvCommands.init(allocator);
    defer commands.deinit();

    commands.list(format, verbose) catch |err| {
        const msg = try std.fmt.allocPrint(allocator, "Error listing environments: {}", .{err});
        return .{ .exit_code = 1, .message = msg };
    };

    return .{ .exit_code = 0 };
}

pub fn envRemoveCommand(allocator: std.mem.Allocator, hash_str: []const u8) !CommandResult {
    return envRemoveCommandWithForce(allocator, hash_str, false);
}

pub fn envRemoveCommandWithForce(allocator: std.mem.Allocator, hash_str: []const u8, force: bool) !CommandResult {
    const env_commands = @import("../../env/commands.zig");
    var commands = env_commands.EnvCommands.init(allocator);
    defer commands.deinit();

    commands.remove(hash_str, force) catch |err| {
        if (err == error.EnvironmentNotFound) {
            return CommandResult.err(allocator, "Error: Environment not found");
        }
        const msg = try std.fmt.allocPrint(allocator, "Error removing environment: {}", .{err});
        return .{ .exit_code = 1, .message = msg };
    };

    return .{ .exit_code = 0 };
}

pub fn envInspectCommand(allocator: std.mem.Allocator, hash_str: []const u8) !CommandResult {
    return envInspectCommandWithVerbose(allocator, hash_str, false);
}

pub fn envInspectCommandWithVerbose(allocator: std.mem.Allocator, hash_str: []const u8, verbose: bool) !CommandResult {
    const env_commands = @import("../../env/commands.zig");
    var commands = env_commands.EnvCommands.init(allocator);
    defer commands.deinit();

    commands.inspect(hash_str, verbose, false) catch |err| {
        if (err == error.EnvironmentNotFound) {
            return CommandResult.err(allocator, "Error: Environment not found");
        }
        const msg = try std.fmt.allocPrint(allocator, "Error inspecting environment: {}", .{err});
        return .{ .exit_code = 1, .message = msg };
    };

    return .{ .exit_code = 0 };
}

pub fn envCleanCommand(allocator: std.mem.Allocator, args: []const []const u8) !CommandResult {
    var dry_run = false;
    var force = false;
    var max_age_days: u32 = 30;
    for (args) |arg| {
        if (std.mem.eql(u8, arg, "--dry-run")) {
            dry_run = true;
        } else if (std.mem.eql(u8, arg, "--force") or std.mem.eql(u8, arg, "-f")) {
            force = true;
        } else if (std.mem.startsWith(u8, arg, "--max-age-days=")) {
            max_age_days = std.fmt.parseInt(u32, arg["--max-age-days=".len..], 10) catch 30;
        }
    }
    return envCleanCommandWithOptions(allocator, dry_run, force, max_age_days);
}

pub fn envCleanCommandWithOptions(allocator: std.mem.Allocator, dry_run: bool, force: bool, max_age_days: u32) !CommandResult {
    const env_commands = @import("../../env/commands.zig");
    var commands = env_commands.EnvCommands.init(allocator);
    defer commands.deinit();

    // Clean environments older than the specified number of days
    commands.clean(max_age_days, dry_run, force) catch |err| {
        const msg = try std.fmt.allocPrint(allocator, "Error cleaning environments: {}", .{err});
        return .{ .exit_code = 1, .message = msg };
    };

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
