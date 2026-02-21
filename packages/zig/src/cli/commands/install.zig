//! Install Command Public API
//!
//! This module provides the public API for install commands, wrapping the
//! modular install subsystem located in the install/ directory.
//!
//! The install subsystem is organized into:
//! - install/mod.zig: Main module coordinator
//! - install/types.zig: Shared type definitions
//! - install/helpers.zig: Utility functions
//! - install/global.zig: Global package installation
//! - install/workspace.zig: Workspace/monorepo installation
//! - install_impl.zig: Core install logic (to be further refactored)

const std = @import("std");
const common = @import("common.zig");
const install = @import("install/mod.zig");

pub const InstallOptions = install.InstallOptions;
pub const helpers = install.helpers;

// Wrap install module functions to return common.CommandResult type
pub fn installCommand(allocator: std.mem.Allocator, args: []const []const u8) !common.CommandResult {
    const result = try install.installCommand(allocator, args);
    return .{
        .exit_code = result.exit_code,
        .message = result.message,
    };
}

pub fn installCommandWithOptions(allocator: std.mem.Allocator, args: []const []const u8, options: InstallOptions) !common.CommandResult {
    const result = try install.installCommandWithOptions(allocator, args, options);
    return .{
        .exit_code = result.exit_code,
        .message = result.message,
    };
}

pub fn installWorkspaceCommand(allocator: std.mem.Allocator) !common.CommandResult {
    // Workspace command needs workspace_root and workspace_file_path
    // This is a temporary wrapper - ideally main.zig would call workspace directly
    _ = allocator;
    return .{
        .exit_code = 1,
        .message = null,
    };
}

pub fn installGlobalDepsCommand(allocator: std.mem.Allocator) !common.CommandResult {
    const result = try install.installGlobalDepsCommand(allocator);
    return .{
        .exit_code = result.exit_code,
        .message = result.message,
    };
}

pub fn installGlobalDepsCommandUserLocal(allocator: std.mem.Allocator) !common.CommandResult {
    const result = try install.installGlobalDepsCommandUserLocal(allocator);
    return .{
        .exit_code = result.exit_code,
        .message = result.message,
    };
}

pub fn installPackagesGloballyCommand(allocator: std.mem.Allocator, args: []const []const u8) !common.CommandResult {
    const result = try install.installPackagesGloballyCommand(allocator, args);
    return .{
        .exit_code = result.exit_code,
        .message = result.message,
    };
}
