//! CLI Commands Module - Modular Organization
//!
//! This module organizes commands into logical groups:
//! - common: Shared types and utilities
//! - package: remove, update, outdated commands
//! - px: Package executor (npx/bunx equivalent)
//! - scripts: Script execution from package.json
//! - cache: Cache management
//! - env: Environment management
//! - shell: Shell integration
//! - utils: Utility commands (clean, doctor, info, search, uninstall, list, publish)
//! - services: Service management (start, stop, restart, status)
//! - install: Installation commands
//! - dev: Developer/debugging commands
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
pub const env_commands = @import("commands/env.zig");
pub const shell_commands = @import("commands/shell.zig");
pub const utils_commands = @import("commands/utils.zig");
pub const services_commands = @import("commands/services.zig");
pub const install_commands = @import("commands/install.zig");
pub const dev_commands = @import("commands/dev.zig");

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
// Re-export Script Commands
// ============================================================================

pub const runScriptCommand = scripts_commands.runScriptCommand;
pub const listScriptsCommand = scripts_commands.listScriptsCommand;

// ============================================================================
// Re-export Cache Commands
// ============================================================================

pub const cacheStatsCommand = cache_commands.cacheStatsCommand;
pub const cacheClearCommand = cache_commands.cacheClearCommand;
pub const cacheCleanCommand = cache_commands.cacheCleanCommand;

// ============================================================================
// Re-export Environment Commands
// ============================================================================

pub const envListCommand = env_commands.envListCommand;
pub const envRemoveCommand = env_commands.envRemoveCommand;
pub const envInspectCommand = env_commands.envInspectCommand;
pub const envCleanCommand = env_commands.envCleanCommand;
pub const envLookupCommand = env_commands.envLookupCommand;

// ============================================================================
// Re-export Shell Commands
// ============================================================================

pub const shellIntegrateCommand = shell_commands.shellIntegrateCommand;
pub const shellCodeCommand = shell_commands.shellCodeCommand;
pub const shellLookupCommand = shell_commands.shellLookupCommand;
pub const shellActivateCommand = shell_commands.shellActivateCommand;

// ============================================================================
// Re-export Utility Commands
// ============================================================================

pub const CleanOptions = utils_commands.CleanOptions;
pub const cleanCommand = utils_commands.cleanCommand;

pub const doctorCommand = utils_commands.doctorCommand;
pub const uninstallCommand = utils_commands.uninstallCommand;
pub const searchCommand = utils_commands.searchCommand;
pub const infoCommand = utils_commands.infoCommand;
pub const listCommand = utils_commands.listCommand;

pub const PublishOptions = utils_commands.PublishOptions;
pub const publishCommand = utils_commands.publishCommand;

// ============================================================================
// Re-export Service Commands
// ============================================================================

pub const servicesCommand = services_commands.servicesCommand;
pub const servicesListCommand = services_commands.servicesCommand; // Alias
pub const serviceStartCommand = services_commands.startCommand; // With prefix
pub const serviceStopCommand = services_commands.stopCommand; // With prefix
pub const serviceRestartCommand = services_commands.restartCommand; // With prefix
pub const serviceStatusCommand = services_commands.statusCommand; // With prefix
pub const startCommand = services_commands.startCommand;
pub const stopCommand = services_commands.stopCommand;
pub const restartCommand = services_commands.restartCommand;
pub const statusCommand = services_commands.statusCommand;

// ============================================================================
// Re-export Install Commands
// ============================================================================

pub const InstallOptions = install_commands.InstallOptions;
pub const installCommand = install_commands.installCommand;
pub const installCommandWithOptions = install_commands.installCommandWithOptions;
pub const installWorkspaceCommand = install_commands.installWorkspaceCommand;
pub const installGlobalDepsCommand = install_commands.installGlobalDepsCommand;
pub const installGlobalDepsCommandUserLocal = install_commands.installGlobalDepsCommandUserLocal;
pub const installPackagesGloballyCommand = install_commands.installPackagesGloballyCommand;

// ============================================================================
// Re-export Dev Commands
// ============================================================================

pub const devShellcodeCommand = dev_commands.devShellcodeCommand;
pub const devMd5Command = dev_commands.devMd5Command;
pub const devFindProjectRootCommand = dev_commands.devFindProjectRootCommand;
pub const devCheckUpdatesCommand = dev_commands.devCheckUpdatesCommand;
