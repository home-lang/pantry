//! Install command wrapper
//!
//! This module wraps the install implementation from commands_old.zig.
//! The install logic is complex (2500+ lines with workspace support, concurrent
//! installation, lockfile generation, etc.) and kept in commands_old.zig to avoid
//! bugs during refactoring. All other commands have been successfully extracted
//! into modular files.
//!
//! Future TODO: Extract install logic when time permits for thorough testing.

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

pub fn installWorkspaceCommand(allocator: std.mem.Allocator) !common.CommandResult {
    const result = try old_commands.installWorkspaceCommand(allocator);
    return .{
        .exit_code = result.exit_code,
        .message = result.message,
    };
}

pub fn installGlobalDepsCommand(allocator: std.mem.Allocator) !common.CommandResult {
    const result = try old_commands.installGlobalDepsCommand(allocator);
    return .{
        .exit_code = result.exit_code,
        .message = result.message,
    };
}

pub fn installGlobalDepsCommandUserLocal(allocator: std.mem.Allocator) !common.CommandResult {
    const result = try old_commands.installGlobalDepsCommandUserLocal(allocator);
    return .{
        .exit_code = result.exit_code,
        .message = result.message,
    };
}

pub fn installPackagesGloballyCommand(allocator: std.mem.Allocator, args: []const []const u8) !common.CommandResult {
    const result = try old_commands.installPackagesGloballyCommand(allocator, args);
    return .{
        .exit_code = result.exit_code,
        .message = result.message,
    };
}
