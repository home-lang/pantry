//! Install Commands Module
//!
//! Public API for all install-related commands.
//! This module coordinates between the different install subsystems:
//! - Core: Main install logic for project dependencies
//! - Global: System-wide and user-local installations
//! - Workspace: Monorepo/workspace installations
//! - Helpers: Utility functions
//! - Types: Shared type definitions

const std = @import("std");

pub const types = @import("types.zig");
pub const helpers = @import("helpers.zig");
pub const global = @import("global.zig");
pub const workspace = @import("workspace.zig");
pub const core = @import("core.zig");

// Re-export commonly used types
pub const CommandResult = types.CommandResult;
pub const InstallOptions = types.InstallOptions;
pub const InstallTask = types.InstallTask;
pub const InstallTaskResult = types.InstallTaskResult;

// Re-export main install commands (from core.zig)
pub const installCommand = core.installCommand;
pub const installCommandWithOptions = core.installCommandWithOptions;

// Re-export global commands (now from modular global.zig)
pub const installGlobalDepsCommand = global.installGlobalDepsCommand;
pub const installGlobalDepsCommandUserLocal = global.installGlobalDepsCommandUserLocal;
pub const installPackagesGloballyCommand = global.installPackagesGloballyCommand;

// Re-export workspace command (now from modular workspace.zig)
pub const installWorkspaceCommand = workspace.installWorkspaceCommand;
