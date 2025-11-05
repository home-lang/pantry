//! Install command - temporarily wraps old implementation
//! TODO: Refactor install logic into this file

const std = @import("std");
const common = @import("common.zig");
const old_commands = @import("../commands_old.zig");

pub const InstallOptions = old_commands.InstallOptions;

// Wrap old command functions to return the right type
pub fn installCommand(allocator: std.mem.Allocator, args: []const []const u8) !common.CommandResult {
    const result = try old_commands.installCommand(allocator, args);
    return .{
        .exit_code = result.exit_code,
        .message = result.message,
    };
}

pub fn installCommandWithOptions(allocator: std.mem.Allocator, args: []const []const u8, options: InstallOptions) !common.CommandResult {
    const result = try old_commands.installCommandWithOptions(allocator, args, options);
    return .{
        .exit_code = result.exit_code,
        .message = result.message,
    };
}
