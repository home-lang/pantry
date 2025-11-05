//! CLI Commands Module - Modular Organization
//!
//! This module organizes commands into logical groups:
//! - common: Shared types and utilities
//! - package: remove, update, outdated commands
//! - px: Package executor (npx/bunx equivalent)
//! - install: Installation logic (from old structure)
//!
//! Each command group is in its own file for better maintainability.

const std = @import("std");

// ============================================================================
// Re-export Common Types
// ============================================================================

pub const common = @import("commands/common.zig");
pub const CommandResult = common.CommandResult;

// ============================================================================
// Command Modules
// ============================================================================

pub const package_commands = @import("commands/package.zig");
pub const px_commands = @import("commands/px.zig");
pub const scripts_commands = @import("commands/scripts.zig");
pub const cache_commands = @import("commands/cache.zig");

// Temporarily import from old commands file until fully refactored
const old_commands = @import("commands_old.zig");

// ============================================================================
// Re-export Package Commands
// ============================================================================

pub const RemoveOptions = package_commands.RemoveOptions;
pub const removeCommand = package_commands.removeCommand;

pub const UpdateOptions = package_commands.UpdateOptions;
pub const updateCommand = package_commands.updateCommand;

pub const OutdatedOptions = package_commands.OutdatedOptions;
pub const outdatedCommand = package_commands.outdatedCommand;

// ============================================================================
// Re-export Px Command
// ============================================================================

pub const PxOptions = px_commands.PxOptions;
pub const pxCommand = px_commands.pxCommand;

// ============================================================================
// Re-export Old Commands (to be refactored)
// ============================================================================

// Install commands
pub const InstallOptions = old_commands.InstallOptions;
pub const installCommand = old_commands.installCommand;
pub const installCommandWithOptions = old_commands.installCommandWithOptions;
pub const installWorkspaceCommand = old_commands.installWorkspaceCommand;
pub const installGlobalDepsCommand = old_commands.installGlobalDepsCommand;
pub const installGlobalDepsCommandUserLocal = old_commands.installGlobalDepsCommandUserLocal;

// Publish
pub const PublishOptions = old_commands.PublishOptions;
pub const publishCommand = old_commands.publishCommand;

// List
pub const listCommand = old_commands.listCommand;

// Cache commands
pub const cacheStatsCommand = cache_commands.cacheStatsCommand;
pub const cacheClearCommand = cache_commands.cacheClearCommand;
pub const cacheCleanCommand = cache_commands.cacheCleanCommand;

// Clean
pub const CleanOptions = old_commands.CleanOptions;
pub const cleanCommand = old_commands.cleanCommand;

// Environment commands
pub const envListCommand = old_commands.envListCommand;
pub const envRemoveCommand = old_commands.envRemoveCommand;
pub const envInspectCommand = old_commands.envInspectCommand;
pub const envCleanCommand = old_commands.envCleanCommand;
pub const envLookupCommand = old_commands.envLookupCommand;

// Shell commands
pub const shellIntegrateCommand = old_commands.shellIntegrateCommand;
pub const shellCodeCommand = old_commands.shellCodeCommand;
pub const shellLookupCommand = old_commands.shellLookupCommand;
pub const shellActivateCommand = old_commands.shellActivateCommand;

// Uninstall
pub const uninstallCommand = old_commands.uninstallCommand;

// Search
pub const searchCommand = old_commands.searchCommand;

// Info
pub const infoCommand = old_commands.infoCommand;

// Doctor
pub const doctorCommand = old_commands.doctorCommand;

// Services
pub const servicesCommand = old_commands.servicesCommand;
pub const servicesListCommand = old_commands.servicesCommand;  // Alias
pub const serviceStartCommand = old_commands.startCommand;  // With prefix
pub const serviceStopCommand = old_commands.stopCommand;  // With prefix
pub const serviceRestartCommand = old_commands.restartCommand;  // With prefix
pub const serviceStatusCommand = old_commands.statusCommand;  // With prefix
pub const startCommand = old_commands.startCommand;
pub const stopCommand = old_commands.stopCommand;
pub const restartCommand = old_commands.restartCommand;
pub const statusCommand = old_commands.statusCommand;

// Install packages globally (was missing)
pub const installPackagesGloballyCommand = old_commands.installPackagesGloballyCommand;

// Dev commands
pub const devShellcodeCommand = old_commands.devShellcodeCommand;
pub const devMd5Command = old_commands.devMd5Command;
pub const devFindProjectRootCommand = old_commands.devFindProjectRootCommand;
pub const devCheckUpdatesCommand = old_commands.devCheckUpdatesCommand;

// Scripts
pub const runScriptCommand = scripts_commands.runScriptCommand;
pub const listScriptsCommand = scripts_commands.listScriptsCommand;
