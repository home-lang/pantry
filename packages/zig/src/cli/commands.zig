//! CLI Commands Module - Modular Organization
//!
//! This module organizes commands into logical groups:
//! - common: Shared types and utilities
//! - package: Package management (remove, update, outdated, uninstall, publish)
//! - registry: Package discovery (search, info, list)
//! - px: Package executor (npx/bunx equivalent)
//! - scripts: Script execution from package.json
//! - cache: Cache management
//! - env: Environment management
//! - shell: Shell integration
//! - utils: System utilities (clean, doctor)
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
pub const registry_commands = @import("commands/registry.zig");
pub const px_commands = @import("commands/px.zig");
pub const scripts_commands = @import("commands/scripts.zig");
pub const run_filter = @import("commands/run_filter.zig");
pub const cache_commands = @import("commands/cache.zig");
pub const env_commands = @import("commands/env.zig");
pub const shell_commands = @import("commands/shell.zig");
pub const utils_commands = @import("commands/utils.zig");
pub const services_commands = @import("commands/services.zig");
pub const install_commands = @import("commands/install.zig");
pub const dev_commands = @import("commands/dev.zig");
pub const audit_commands = @import("commands/audit.zig");
pub const outdated_cmd = @import("commands/outdated.zig");
pub const update_cmd = @import("commands/update.zig");
pub const doctor_cmd = @import("commands/doctor.zig");
pub const clean_cmd = @import("commands/clean.zig");
pub const why_cmd = @import("commands/why.zig");
pub const dedupe_cmd = @import("commands/dedupe.zig");
pub const link_commands = @import("commands/link.zig");
pub const bootstrap_commands = @import("commands/bootstrap.zig");
pub const shim_commands = @import("commands/shim.zig");
pub const oidc_cmd = @import("commands/oidc.zig");

// ============================================================================
// Re-export Package Commands
// ============================================================================

pub const RemoveOptions = package_commands.RemoveOptions;
pub const removeCommand = package_commands.removeCommand;

pub const UpdateOptions = package_commands.UpdateOptions;
pub const updateCommand = package_commands.updateCommand;

pub const OutdatedOptions = package_commands.OutdatedOptions;
pub const outdatedCommand = package_commands.outdatedCommand;

pub const uninstallCommand = package_commands.uninstallCommand;

pub const PublishOptions = package_commands.PublishOptions;
pub const publishCommand = package_commands.publishCommand;

pub const TrustedPublisherAddOptions = package_commands.TrustedPublisherAddOptions;
pub const trustedPublisherAddCommand = package_commands.trustedPublisherAddCommand;

pub const TrustedPublisherListOptions = package_commands.TrustedPublisherListOptions;
pub const trustedPublisherListCommand = package_commands.trustedPublisherListCommand;

pub const TrustedPublisherRemoveOptions = package_commands.TrustedPublisherRemoveOptions;
pub const trustedPublisherRemoveCommand = package_commands.trustedPublisherRemoveCommand;

pub const WhyOptions = package_commands.WhyOptions;
pub const whyCommand = package_commands.whyCommand;

// ============================================================================
// Re-export Registry Commands
// ============================================================================

pub const searchCommand = registry_commands.searchCommand;
pub const infoCommand = registry_commands.infoCommand;
pub const listCommand = registry_commands.listCommand;
pub const whoamiCommand = registry_commands.whoamiCommand;

// Registry publish command (uploads to Pantry registry S3)
pub const RegistryPublishOptions = registry_commands.RegistryPublishOptions;
pub const registryPublishCommand = registry_commands.registryPublishCommand;

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
pub const runScriptWithFilter = run_filter.runScriptWithFilter;
pub const RunFilterOptions = run_filter.RunFilterOptions;

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
// Re-export System Utility Commands
// ============================================================================

pub const CleanOptions = utils_commands.CleanOptions;
pub const cleanCommand = utils_commands.cleanCommand;

pub const doctorCommand = utils_commands.doctorCommand;

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

// ============================================================================
// Re-export Audit Commands
// ============================================================================

pub const AuditOptions = audit_commands.AuditOptions;
pub const Severity = audit_commands.Severity;
pub const auditCommand = audit_commands.auditCommand;

// ============================================================================
// Re-export New Utility Commands
// ============================================================================

pub const outdatedNewCommand = outdated_cmd.execute;
pub const updateNewCommand = update_cmd.execute;
pub const doctorNewCommand = doctor_cmd.execute;
pub const cleanNewCommand = clean_cmd.execute;
pub const whyNewCommand = why_cmd.execute;
pub const dedupeCommand = dedupe_cmd.execute;
pub const oidcSetupCommand = oidc_cmd.execute;

// ============================================================================
// Re-export Bootstrap Commands
// ============================================================================

pub const BootstrapOptions = bootstrap_commands.BootstrapOptions;
pub const bootstrapCommand = bootstrap_commands.bootstrapCommand;

// ============================================================================
// Re-export Shim Commands
// ============================================================================

pub const ShimOptions = shim_commands.ShimOptions;
pub const shimCommand = shim_commands.shimCommand;
pub const shimListCommand = shim_commands.shimListCommand;
pub const shimRemoveCommand = shim_commands.shimRemoveCommand;

// ============================================================================
// Re-export Service Enable/Disable Commands
// ============================================================================

pub const serviceEnableCommand = services_commands.enableCommand;
pub const serviceDisableCommand = services_commands.disableCommand;

// ============================================================================
// Re-export Verify Commands
// ============================================================================

pub const verify_commands = @import("commands/verify.zig");
pub const verifyCommand = verify_commands.verifyCommand;
pub const signCommand = verify_commands.signCommand;
pub const generateKeyCommand = verify_commands.generateKeyCommand;

// ============================================================================
// Re-export Init Command
// ============================================================================

pub const init_commands = @import("commands/init.zig");
pub const initCommand = init_commands.initCommand;

// ============================================================================
// Re-export Tree Command
// ============================================================================

pub const tree_commands = @import("commands/tree.zig");
pub const treeCommand = tree_commands.treeCommand;

// ============================================================================
// Re-export Link Commands
// ============================================================================

pub const linkCommand = link_commands.linkCommand;
pub const unlinkCommand = link_commands.unlinkCommand;
pub const resolveLinkPath = link_commands.resolveLinkPath;
