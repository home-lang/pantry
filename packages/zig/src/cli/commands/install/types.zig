//! Install Command Types
//!
//! Shared type definitions for the install command subsystem.

const std = @import("std");
const lib = @import("../../../lib.zig");
const cache = lib.cache;

/// Command execution result
pub const CommandResult = struct {
    exit_code: u8,
    message: ?[]const u8 = null,

    pub fn deinit(self: *CommandResult, allocator: std.mem.Allocator) void {
        if (self.message) |msg| {
            allocator.free(msg);
        }
    }
};

/// Linker strategy (re-export from config)
pub const LinkerMode = lib.config.LinkerMode;

/// Install command options
pub const InstallOptions = struct {
    production: bool = false, // Skip devDependencies
    dev_only: bool = false, // Install devDependencies only
    include_peer: bool = false, // Include peerDependencies (opt-in via pantry.toml or --peer flag)
    ignore_scripts: bool = false, // Don't run lifecycle scripts
    verbose: bool = false, // Verbose output
    quiet: bool = false, // Quiet output (suppress non-essential messages)
    force: bool = false, // Force re-download, ignore cache and lockfile
    filter: ?[]const u8 = null, // Filter pattern for workspace packages
    linker: LinkerMode = .isolated, // Linker strategy (default: isolated, opt-in: hoisted)
};

/// Result of a single package installation task
pub const InstallTaskResult = struct {
    name: []const u8,
    version: []const u8,
    success: bool,
    error_msg: ?[]const u8,
    install_time_ms: u64,

    pub fn deinit(self: *InstallTaskResult, allocator: std.mem.Allocator) void {
        if (self.error_msg) |msg| {
            allocator.free(msg);
        }
    }
};

/// Task context for concurrent installation
/// TODO: Re-enable when std.Io.Group API stabilizes
pub const InstallTask = struct {
    allocator: std.mem.Allocator,
    dep: lib.deps.parser.PackageDependency,
    proj_dir: []const u8,
    env_dir: []const u8,
    bin_dir: []const u8,
    cwd: []const u8,
    pkg_cache: *cache.PackageCache,
    result: *InstallTaskResult,
    // wg field removed - std.Thread.WaitGroup deprecated in Zig 0.16
    options: InstallOptions,
};
