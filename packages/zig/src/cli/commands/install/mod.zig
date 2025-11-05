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

// Re-export commonly used types
pub const CommandResult = types.CommandResult;
pub const InstallTask = types.InstallTask;
pub const InstallTaskResult = types.InstallTaskResult;

// For now, import the monolithic implementation
// TODO: Extract core.zig logic from install_impl.zig
const install_impl = @import("../install_impl.zig");

// Re-export InstallOptions from install_impl (use install_impl version for now)
pub const InstallOptions = install_impl.InstallOptions;

// Re-export main install commands (currently from install_impl)
pub const installCommand = install_impl.installCommand;
pub const installCommandWithOptions = install_impl.installCommandWithOptions;

// Re-export global commands (now from modular global.zig)
pub const installGlobalDepsCommand = global.installGlobalDepsCommand;
pub const installGlobalDepsCommandUserLocal = global.installGlobalDepsCommandUserLocal;
pub const installPackagesGloballyCommand = global.installPackagesGloballyCommand;

// Re-export workspace command (now from modular workspace.zig)
pub const installWorkspaceCommand = workspace.installWorkspaceCommand;
