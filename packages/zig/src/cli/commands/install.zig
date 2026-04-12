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
    const io_helper = @import("../../io_helper.zig");
    const detector = @import("../../deps/detector.zig");
    const workspace = @import("install/workspace.zig");

    // Discover workspace root and config file from CWD
    const cwd = try io_helper.getCwdAlloc(allocator);
    defer allocator.free(cwd);

    const workspace_root = try detector.resolveProjectRoot(allocator, cwd);
    defer allocator.free(workspace_root);

    // Look for workspace config file (pantry.jsonc, pantry.json, package.json)
    const config_names = [_][]const u8{ "pantry.jsonc", "pantry.json", "package.json" };
    var workspace_file: ?[]const u8 = null;
    defer if (workspace_file) |f| allocator.free(f);

    for (config_names) |name| {
        const candidate = std.fmt.allocPrint(allocator, "{s}/{s}", .{ workspace_root, name }) catch continue;
        io_helper.accessAbsolute(candidate, .{}) catch {
            allocator.free(candidate);
            continue;
        };
        workspace_file = candidate;
        break;
    }

    if (workspace_file == null) {
        return .{
            .exit_code = 1,
            .message = try allocator.dupe(u8, "No workspace config file found (pantry.jsonc, pantry.json, or package.json)"),
        };
    }

    const result = try workspace.installWorkspaceCommand(allocator, workspace_root, workspace_file.?);
    return .{
        .exit_code = result.exit_code,
        .message = result.message,
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
