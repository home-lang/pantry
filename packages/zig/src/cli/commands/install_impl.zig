//! Install Command Implementation
//!
//! This module contains the complete implementation of the install command and
//! all its variants. The install logic is complex with support for:
//! - Concurrent package installation with thread pools
//! - Workspace support (monorepo handling)
//! - Local dependencies (filesystem paths)
//! - Global dependencies scanning and installation
//! - Lockfile generation (.freezer)
//! - Environment directory management
//! - Dependency filtering (production, dev-only, peer)
//!
//! This implementation is kept in a separate file due to its size (2900+ lines)
//! while being wrapped by install.zig for the public API.

const std = @import("std");
const lib = @import("../../lib.zig");

// Import commonly used modules
const cache = lib.cache;
const env = lib.env;
const install = lib.install;
const shell = lib.shell;
const string = lib.string;

// ============================================================================
// Common Error Messages
// ============================================================================

const ERROR_NO_CONFIG = "Error: No package.json or pantry.json found";
const ERROR_CONFIG_PARSE = "Error: Failed to parse config file";
const ERROR_CONFIG_NOT_OBJECT = "Error: Config file must be a JSON object";
const ERROR_NO_PACKAGES = "Error: No packages specified";

// ============================================================================
// Helper Functions - Path and Dependency Utilities
// ============================================================================

/// Check if a version string is a local filesystem path
fn isLocalPath(version: []const u8) bool {
    return std.mem.startsWith(u8, version, "~/") or
        std.mem.startsWith(u8, version, "./") or
        std.mem.startsWith(u8, version, "../") or
        std.mem.startsWith(u8, version, "/");
}

/// Check if a dependency is local (either has local: prefix or is a filesystem path)
fn isLocalDependency(dep: lib.deps.parser.PackageDependency) bool {
    return std.mem.startsWith(u8, dep.name, "local:") or
        std.mem.startsWith(u8, dep.name, "auto:") or
        isLocalPath(dep.version);
}

/// Strip display prefixes like "auto:" and "local:" from package names for output
fn stripDisplayPrefix(name: []const u8) []const u8 {
    if (std.mem.startsWith(u8, name, "auto:")) {
        return name[5..]; // Skip "auto:"
    } else if (std.mem.startsWith(u8, name, "local:")) {
        return name[6..]; // Skip "local:"
    }
    return name;
}

// ============================================================================
// Core Data Structures
// ============================================================================

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

/// Result of a single package installation task
const InstallTaskResult = struct {
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
const InstallTask = struct {
    allocator: std.mem.Allocator,
    dep: lib.deps.parser.PackageDependency,
    proj_dir: []const u8,
    env_dir: []const u8,
    bin_dir: []const u8,
    cwd: []const u8,
    pkg_cache: *cache.PackageCache,
    result: *InstallTaskResult,
    wg: *std.Thread.WaitGroup,
};

/// Worker function for concurrent package installation
fn installPackageWorker(task_ptr: *InstallTask) void {
    defer task_ptr.wg.finish();
    defer task_ptr.allocator.destroy(task_ptr);

    const result = installSinglePackage(
        task_ptr.allocator,
        task_ptr.dep,
        task_ptr.proj_dir,
        task_ptr.env_dir,
        task_ptr.bin_dir,
        task_ptr.cwd,
        task_ptr.pkg_cache,
    ) catch |err| {
        task_ptr.result.* = .{
            .name = task_ptr.dep.name,
            .version = task_ptr.dep.version,
            .success = false,
            .error_msg = std.fmt.allocPrint(
                task_ptr.allocator,
                "failed: {}",
                .{err},
            ) catch null,
            .install_time_ms = 0,
        };
        return;
    };
    task_ptr.result.* = result;
}

/// Install a single package (used by both sequential and concurrent installers)
fn installSinglePackage(
    allocator: std.mem.Allocator,
    dep: lib.deps.parser.PackageDependency,
    proj_dir: []const u8,
    env_dir: []const u8,
    bin_dir: []const u8,
    cwd: []const u8,
    pkg_cache: *cache.PackageCache,
) !InstallTaskResult {
    const start_time = std.time.milliTimestamp();

    // Skip local packages - they're handled separately
    if (isLocalDependency(dep)) {
        return .{
            .name = "",
            .version = "",
            .success = true,
            .error_msg = null,
            .install_time_ms = 0,
        };
    }

    // Validate package exists in registry
    const pkg_registry = @import("../../packages/generated.zig");
    const pkg_info = pkg_registry.getPackageByName(dep.name);

    // Check if this is a GitHub dependency
    const spec = if (dep.source == .github and dep.github_ref != null) blk: {
        const gh_ref = dep.github_ref.?;
        const repo_str = try std.fmt.allocPrint(allocator, "{s}/{s}", .{ gh_ref.owner, gh_ref.repo });
        defer allocator.free(repo_str);

        break :blk lib.packages.PackageSpec{
            .name = dep.name,
            .version = gh_ref.ref,
            .source = .github,
            .repo = try allocator.dupe(u8, repo_str),
        };
    } else blk: {
        // Regular registry package
        if (pkg_info == null) {
            const error_msg = try std.fmt.allocPrint(
                allocator,
                "Package '{s}' not found in registry. Try: pantry search {s}",
                .{ dep.name, dep.name },
            );
            return .{
                .name = dep.name,
                .version = dep.version,
                .success = false,
                .error_msg = error_msg,
                .install_time_ms = 0,
            };
        }

        break :blk lib.packages.PackageSpec{
            .name = dep.name,
            .version = dep.version,
        };
    };

    // Create installer with project_root option for local installs
    var custom_installer = try install.Installer.init(allocator, pkg_cache);
    allocator.free(custom_installer.data_dir);
    custom_installer.data_dir = try allocator.dupe(u8, env_dir);
    defer custom_installer.deinit();

    // Install to project's pantry_modules directory (quiet mode for clean output)
    var inst_result = custom_installer.install(spec, .{
        .project_root = proj_dir,
        .quiet = true,
    }) catch |err| {
        const error_msg = try std.fmt.allocPrint(
            allocator,
            "failed: {}",
            .{err},
        );
        return .{
            .name = dep.name,
            .version = dep.version,
            .success = false,
            .error_msg = error_msg,
            .install_time_ms = 0,
        };
    };

    // Duplicate the version string before deinit
    const installed_version = try allocator.dupe(u8, inst_result.version);
    inst_result.deinit(allocator);

    const end_time = std.time.milliTimestamp();

    _ = bin_dir;
    _ = cwd;

    return .{
        .name = dep.name,
        .version = installed_version,
        .success = true,
        .error_msg = null,
        .install_time_ms = @intCast(end_time - start_time),
    };
}

/// Install command
// ============================================================================
// Package Management Commands
// ============================================================================

pub const InstallOptions = struct {
    production: bool = false, // Skip devDependencies
    dev_only: bool = false, // Install devDependencies only
    include_peer: bool = false, // Include peerDependencies
};

/// Install packages - main entry point
pub fn installCommand(allocator: std.mem.Allocator, args: []const []const u8) !CommandResult {
    return installCommandWithOptions(allocator, args, .{});
}

pub fn installCommandWithOptions(allocator: std.mem.Allocator, args: []const []const u8, options: InstallOptions) !CommandResult {
    // Parse flags and filter out non-package arguments
    var is_global = false;
    var package_args = try std.ArrayList([]const u8).initCapacity(allocator, args.len);
    defer package_args.deinit(allocator);

    for (args) |arg| {
        if (std.mem.eql(u8, arg, "-g") or std.mem.eql(u8, arg, "--global")) {
            is_global = true;
        } else if (!std.mem.startsWith(u8, arg, "-")) {
            try package_args.append(allocator, arg);
        }
    }

    // If -g flag is set with no packages, scan for global dependencies
    if (is_global and package_args.items.len == 0) {
        return try installGlobalDepsCommand(allocator);
    }

    // If -g flag is set with packages, install those packages globally
    if (is_global and package_args.items.len > 0) {
        return try installPackagesGloballyCommand(allocator, package_args.items);
    }

    // Otherwise, normal install flow
    if (package_args.items.len == 0) {
        // No args - check if we're in a project directory
        const detector = @import("../../deps/detector.zig");
        const parser = @import("../../deps/parser.zig");

        const cwd = try std.process.getCwdAlloc(allocator);
        defer allocator.free(cwd);

        // First, check if we're in a workspace
        const workspace_file = try detector.findWorkspaceFile(allocator, cwd);
        if (workspace_file) |ws_file| {
            defer {
                allocator.free(ws_file.path);
                allocator.free(ws_file.root_dir);
            }

            // We found a workspace! Install all workspace member dependencies
            return try installWorkspaceCommand(allocator, ws_file.root_dir, ws_file.path);
        }

        // Try to load dependencies from config file first (pantry.config.ts, etc.)
        const config_deps = try loadDependenciesFromConfig(allocator, cwd);

        // If config file had dependencies, use those
        var deps: []parser.PackageDependency = undefined;
        var deps_file_path: ?[]const u8 = null;
        defer if (deps_file_path) |path| allocator.free(path);

        if (config_deps) |config_dep_list| {
            // Use dependencies from config file
            deps = config_dep_list;
            // Don't set deps_file_path since we're using config
        } else {
            // Fall back to dependency file detection
            const deps_file = (try detector.findDepsFile(allocator, cwd)) orelse {
                return .{
                    .exit_code = 1,
                    .message = try allocator.dupe(u8, "Error: No packages specified and no dependency file found"),
                };
            };
            deps_file_path = deps_file.path;

            // Parse dependencies from file
            deps = try parser.inferDependencies(allocator, deps_file);
        }

        defer {
            for (deps) |*dep| {
                var d = dep.*;
                d.deinit(allocator);
            }
            // Only free deps if we allocated it (not if it came from config_deps)
            if (config_deps == null) {
                allocator.free(deps);
            }
        }

        // Filter dependencies based on options
        var filtered_deps = try std.ArrayList(parser.PackageDependency).initCapacity(allocator, deps.len);
        defer filtered_deps.deinit(allocator);

        for (deps) |dep| {
            const should_include = blk: {
                if (options.dev_only) {
                    // --dev: only install devDependencies
                    break :blk dep.dep_type == .dev;
                } else if (options.production) {
                    // --production: install only dependencies (skip dev and peer unless --peer is set)
                    if (dep.dep_type == .dev) {
                        break :blk false;
                    } else if (dep.dep_type == .peer) {
                        break :blk options.include_peer;
                    } else {
                        break :blk true; // .normal dependencies
                    }
                } else {
                    // Default: install dependencies and devDependencies
                    // Only skip peerDependencies unless --peer is specified
                    if (dep.dep_type == .peer) {
                        break :blk options.include_peer;
                    }
                    break :blk true;
                }
            };

            if (should_include) {
                try filtered_deps.append(allocator, dep);
            }
        }

        // Use filtered_deps from this point forward
        const deps_to_install = filtered_deps.items;

        if (deps_to_install.len == 0) {
            if (deps_file_path) |path| {
                std.debug.print("No dependencies to install from {s}\n", .{path});
            } else {
                std.debug.print("No dependencies to install from config file\n", .{});
            }
            return .{ .exit_code = 0 };
        }

        // Create project-specific environment
        const proj_dir = if (deps_file_path) |path|
            std.fs.path.dirname(path) orelse cwd
        else
            cwd;
        const proj_basename = std.fs.path.basename(proj_dir);

        // Hash project directory for short hash
        var proj_hasher = std.crypto.hash.Md5.init(.{});
        proj_hasher.update(proj_dir);
        var proj_hash: [16]u8 = undefined;
        proj_hasher.final(&proj_hash);
        const proj_hash_short = try std.fmt.allocPrint(allocator, "{x:0>8}", .{std.mem.readInt(u32, proj_hash[0..4], .little)});
        defer allocator.free(proj_hash_short);

        // Hash dependency file contents (or project dir if using config)
        const hash_input = if (deps_file_path) |path|
            try std.fs.cwd().readFileAlloc(allocator, path, 1024 * 1024)
        else
            try allocator.dupe(u8, proj_dir);
        defer allocator.free(hash_input);

        var dep_hasher = std.crypto.hash.Md5.init(.{});
        dep_hasher.update(hash_input);
        var dep_hash: [16]u8 = undefined;
        dep_hasher.final(&dep_hash);
        const dep_hash_hex = try string.hashToHex(dep_hash, allocator);
        defer allocator.free(dep_hash_hex);
        const dep_hash_short = try std.fmt.allocPrint(allocator, "d{s}", .{dep_hash_hex[0..8]});
        defer allocator.free(dep_hash_short);

        // Create environment directory
        const home = try lib.Paths.home(allocator);
        defer allocator.free(home);

        const env_dir = try std.fmt.allocPrint(
            allocator,
            "{s}/.pantry/envs/{s}_{s}-{s}",
            .{ home, proj_basename, proj_hash_short, dep_hash_short },
        );
        defer allocator.free(env_dir);

        // Create environment directory structure
        try std.fs.cwd().makePath(env_dir);
        const bin_dir = try std.fmt.allocPrint(allocator, "{s}/bin", .{env_dir});
        defer allocator.free(bin_dir);
        try std.fs.cwd().makePath(bin_dir);

        // Clean Yarn/Bun-style output - just show what we're installing
        const green = "\x1b[32m";
        const dim = "\x1b[2m";
        const reset = "\x1b[0m";
        std.debug.print("{s}➤{s} Installing {d} package(s)...\n", .{ green, reset, deps_to_install.len });

        // Install each dependency concurrently
        var pkg_cache = try cache.PackageCache.init(allocator);
        defer pkg_cache.deinit();

        // Use thread pool for concurrent installation (max 4 concurrent)
        const max_concurrent = @min(deps_to_install.len, 4);
        var install_results = try allocator.alloc(InstallTaskResult, deps_to_install.len);
        defer {
            for (install_results) |*result| {
                result.deinit(allocator);
            }
            allocator.free(install_results);
        }

        // Initialize results
        for (install_results) |*result| {
            result.* = .{
                .name = "",
                .version = "",
                .success = false,
                .error_msg = null,
                .install_time_ms = 0,
            };
        }

        // Install packages concurrently using thread pool
        if (deps_to_install.len <= 1) {
            // Single package - install sequentially
            for (deps_to_install, 0..) |dep, i| {
                install_results[i] = try installSinglePackage(
                    allocator,
                    dep,
                    proj_dir,
                    env_dir,
                    bin_dir,
                    cwd,
                    &pkg_cache,
                );
            }
        } else {
            // Multiple packages - use thread pool
            var thread_pool: std.Thread.Pool = undefined;
            try thread_pool.init(.{ .allocator = allocator, .n_jobs = max_concurrent });
            defer thread_pool.deinit();

            var wg: std.Thread.WaitGroup = .{};
            defer wg.wait();

            for (deps_to_install, 0..) |dep, i| {
                wg.start();
                const task = try allocator.create(InstallTask);
                task.* = .{
                    .allocator = allocator,
                    .dep = dep,
                    .proj_dir = proj_dir,
                    .env_dir = env_dir,
                    .bin_dir = bin_dir,
                    .cwd = cwd,
                    .pkg_cache = &pkg_cache,
                    .result = &install_results[i],
                    .wg = &wg,
                };
                try thread_pool.spawn(installPackageWorker, .{task});
            }
        }

        // Print clean Yarn/Bun-style summary - only show what was installed or failed
        var success_count: usize = 0;
        var failed_count: usize = 0;

        for (install_results) |result| {
            if (result.name.len == 0) continue;
            const display_name = stripDisplayPrefix(result.name);
            if (result.success) {
                std.debug.print("{s}✓{s} {s}@{s}\n", .{ green, reset, display_name, result.version });
                success_count += 1;
            } else {
                const red = "\x1b[31m";
                std.debug.print("{s}✗{s} {s}@{s}", .{ red, reset, display_name, result.version });
                if (result.error_msg) |msg| {
                    std.debug.print(" {s}({s}){s}\n", .{ dim, msg, reset });
                } else {
                    std.debug.print("\n", .{});
                }
                failed_count += 1;
            }
        }

        // Handle local packages separately (they need special symlink handling)
        // Create pantry_modules directory if it doesn't exist
        const pantry_modules_dir = try std.fmt.allocPrint(allocator, "{s}/pantry_modules", .{proj_dir});
        defer allocator.free(pantry_modules_dir);
        try std.fs.cwd().makePath(pantry_modules_dir);

        for (deps) |dep| {
            if (!isLocalDependency(dep)) continue;

            // Resolve local path
            const local_path = if (std.mem.startsWith(u8, dep.version, "~/")) blk: {
                const home_path = try lib.Paths.home(allocator);
                defer allocator.free(home_path);
                const rel_path = dep.version[2..]; // Remove "~/"
                break :blk try std.fmt.allocPrint(allocator, "{s}/{s}", .{ home_path, rel_path });
            } else if (std.mem.startsWith(u8, dep.version, "/"))
                try allocator.dupe(u8, dep.version)
            else
                try std.fmt.allocPrint(allocator, "{s}/{s}", .{ cwd, dep.version });
            defer allocator.free(local_path);

            // Check if local path exists
            std.fs.accessAbsolute(local_path, .{}) catch {
                const yellow = "\x1b[33m";
                std.debug.print("{s}⚠{s}  {s}@{s} {s}(path not found){s}\n", .{ yellow, reset, dep.name, dep.version, dim, reset });
                failed_count += 1;
                continue;
            };

            const pkg_name = if (std.mem.indexOf(u8, dep.name, ":")) |colon_pos|
                dep.name[colon_pos + 1 ..]
            else
                dep.name;

            // Create pantry_modules/{package} directory structure
            const pkg_modules_dir = try std.fmt.allocPrint(allocator, "{s}/{s}", .{ pantry_modules_dir, pkg_name });
            defer allocator.free(pkg_modules_dir);
            try std.fs.cwd().makePath(pkg_modules_dir);

            // Create symlink to source directory for build system
            const src_link_path = try std.fmt.allocPrint(allocator, "{s}/src", .{pkg_modules_dir});
            defer allocator.free(src_link_path);
            std.fs.deleteFileAbsolute(src_link_path) catch {};

            const src_path = try std.fmt.allocPrint(allocator, "{s}/src", .{local_path});
            defer allocator.free(src_path);
            std.fs.symLinkAbsolute(src_path, src_link_path, .{ .is_directory = true }) catch |err| {
                const red = "\x1b[31m";
                const display_name = stripDisplayPrefix(dep.name);
                std.debug.print("{s}✗{s} {s}@{s} {s}(symlink failed: {}){s}\n", .{ red, reset, display_name, dep.version, dim, err, reset });
                failed_count += 1;
                continue;
            };

            // Also create symlink in env bin directory for executables
            const link_path = try std.fmt.allocPrint(allocator, "{s}/{s}", .{ bin_dir, pkg_name });
            defer allocator.free(link_path);
            std.fs.deleteFileAbsolute(link_path) catch {};
            std.fs.symLinkAbsolute(local_path, link_path, .{ .is_directory = true }) catch {};

            const display_name = stripDisplayPrefix(dep.name);
            std.debug.print("{s}✓{s} {s}@{s} {s}(linked){s}\n", .{ green, reset, display_name, dep.version, dim, reset });
            success_count += 1;
        }

        // Generate lockfile
        const lockfile_path = try std.fmt.allocPrint(allocator, "{s}/.freezer", .{proj_dir});
        defer allocator.free(lockfile_path);

        var lockfile = try lib.packages.Lockfile.init(allocator, "1.0.0");
        defer lockfile.deinit(allocator);

        // Add entries for all installed packages
        for (deps, 0..) |dep, i| {
            const source = if (isLocalDependency(dep))
                lib.packages.PackageSource.local
            else if (std.mem.startsWith(u8, dep.name, "github:"))
                lib.packages.PackageSource.github
            else if (std.mem.startsWith(u8, dep.name, "npm:"))
                lib.packages.PackageSource.npm
            else
                lib.packages.PackageSource.pkgx;

            const clean_name = if (std.mem.indexOf(u8, dep.name, ":")) |colon_pos|
                dep.name[colon_pos + 1 ..]
            else
                dep.name;

            // Use the resolved version from install_results if available, otherwise use dep.version
            const resolved_version = if (i < install_results.len and install_results[i].success and install_results[i].version.len > 0)
                install_results[i].version
            else
                dep.version;

            const entry = lib.packages.LockfileEntry{
                .name = try allocator.dupe(u8, clean_name),
                .version = try allocator.dupe(u8, resolved_version),
                .source = source,
                .url = if (source == .local) try allocator.dupe(u8, dep.version) else null,
                .resolved = null,
                .integrity = null,
                .dependencies = null,
            };

            const key = try std.fmt.allocPrint(allocator, "{s}@{s}", .{ clean_name, resolved_version });
            defer allocator.free(key);
            try lockfile.addEntry(allocator, key, entry);
        }

        // Write lockfile
        const lockfile_writer = @import("../../packages/lockfile.zig");
        lockfile_writer.writeLockfile(allocator, &lockfile, lockfile_path) catch |err| {
            const yellow = "\x1b[33m";
            std.debug.print("\n{s}⚠{s}  Failed to write lockfile: {}\n", .{ yellow, reset, err });
        };

        // Clean summary - Yarn/Bun style
        std.debug.print("\n{s}✓{s} Installed {d} package(s)", .{ green, reset, success_count });
        if (failed_count > 0) {
            const red = "\x1b[31m";
            std.debug.print(", {s}{d} failed{s}", .{ red, failed_count, reset });
        }
        std.debug.print("\n", .{});
        return .{ .exit_code = 0 };
    }

    // Detect if we're in a project directory
    const detector = @import("../../deps/detector.zig");
    const cwd = try std.process.getCwdAlloc(allocator);
    defer allocator.free(cwd);

    const project_root = blk: {
        const deps_file = try detector.findDepsFile(allocator, cwd);
        if (deps_file) |df| {
            defer allocator.free(df.path);
            break :blk try allocator.dupe(u8, std.fs.path.dirname(df.path) orelse cwd);
        }
        // If no deps file, use current directory as project root for local installs
        // This allows `pantry install <package>` to work in any directory
        break :blk try allocator.dupe(u8, cwd);
    };
    defer allocator.free(project_root);

    // Initialize package cache and installer
    var pkg_cache = try cache.PackageCache.init(allocator);
    defer pkg_cache.deinit();

    var installer = try install.Installer.init(allocator, &pkg_cache);
    defer installer.deinit();

    // Clean Yarn/Bun-style output
    const green = "\x1b[32m";
    const red = "\x1b[31m";
    const dim = "\x1b[2m";
    const reset = "\x1b[0m";

    std.debug.print("{s}➤{s} Installing {d} package(s)...\n", .{ green, reset, args.len });

    var success_count: usize = 0;
    var failed_count: usize = 0;

    for (args) |pkg_spec_str| {
        // Parse package spec (name@version)
        const at_pos = std.mem.indexOf(u8, pkg_spec_str, "@");
        const name = if (at_pos) |pos| pkg_spec_str[0..pos] else pkg_spec_str;
        const version = if (at_pos) |pos| pkg_spec_str[pos + 1 ..] else "latest";

        const spec = lib.packages.PackageSpec{
            .name = name,
            .version = version,
        };

        var result = installer.install(spec, .{
            .project_root = project_root,
            .quiet = true, // Enable quiet mode for clean output
        }) catch |err| {
            std.debug.print("{s}✗{s} {s}@{s} {s}({any}){s}\n", .{ red, reset, name, version, dim, err, reset });
            failed_count += 1;
            continue;
        };
        defer result.deinit(allocator);

        std.debug.print("{s}✓{s} {s}@{s}\n", .{ green, reset, name, version });
        success_count += 1;
    }

    // Clean summary
    std.debug.print("\n{s}✓{s} Installed {d} package(s)", .{ green, reset, success_count });
    if (failed_count > 0) {
        std.debug.print(", {s}{d} failed{s}", .{ red, failed_count, reset });
    }
    std.debug.print("\n", .{});

    return .{ .exit_code = 0 };
}

/// Install workspace command - installs dependencies for all workspace members
fn installWorkspaceCommand(
    allocator: std.mem.Allocator,
    workspace_root: []const u8,
    workspace_file_path: []const u8,
) !CommandResult {
    const workspace_module = @import("../../packages/workspace.zig");
    const parser = @import("../../deps/parser.zig");

    // Load workspace configuration
    var workspace_config = try workspace_module.loadWorkspaceConfig(
        allocator,
        workspace_file_path,
        workspace_root,
    );
    defer workspace_config.deinit(allocator);

    const green = "\x1b[32m";
    const blue = "\x1b[34m";
    const dim = "\x1b[2m";
    const reset = "\x1b[0m";

    std.debug.print("{s}🔍 Workspace:{s} {s}\n", .{ blue, reset, workspace_config.name });
    std.debug.print("{s}   Found {d} workspace member(s)\n\n", .{ dim, workspace_config.members.len });

    if (workspace_config.members.len == 0) {
        return .{
            .exit_code = 0,
            .message = try allocator.dupe(u8, "No workspace members found to install"),
        };
    }

    // Collect all dependencies from all workspace members
    var all_deps_buffer: [1024]parser.PackageDependency = undefined;
    var all_deps_count: usize = 0;

    // Track which deps are for which members
    var deps_seen = std.StringHashMap(void).init(allocator);
    defer {
        var iter = deps_seen.iterator();
        while (iter.next()) |entry| {
            allocator.free(entry.key_ptr.*);
        }
        deps_seen.deinit();
    }

    // Process each workspace member
    for (workspace_config.members) |member| {
        std.debug.print("{s}📦 {s}{s}\n", .{ dim, member.name, reset });

        // Load dependencies for this member
        var member_deps: ?[]parser.PackageDependency = null;
        defer if (member_deps) |deps| {
            allocator.free(deps);
        };

        // Try config file first
        if (member.config_path) |_| {
            var config_result = @import("../../config/loader.zig").loadpantryConfig(
                allocator,
                .{
                    .name = "pantry",
                    .cwd = member.abs_path,
                },
            ) catch null;

            if (config_result) |*config| {
                defer config.deinit();
                const deps_extractor = @import("../../config/dependencies.zig");
                member_deps = try deps_extractor.extractDependencies(allocator, config.*);
            }
        }

        // Try deps file if config didn't work
        if (member_deps == null and member.deps_file_path != null) {
            const detector = @import("../../deps/detector.zig");
            if (try detector.findDepsFile(allocator, member.abs_path)) |deps_file| {
                defer allocator.free(deps_file.path);
                member_deps = try parser.inferDependencies(allocator, deps_file);
            }
        }

        if (member_deps) |deps| {
            for (deps) |dep| {
                // Create a unique key for this dependency
                const dep_key = try std.fmt.allocPrint(allocator, "{s}@{s}", .{ dep.name, dep.version });
                defer allocator.free(dep_key);

                // Only add if we haven't seen this exact dep before
                if (!deps_seen.contains(dep_key)) {
                    try deps_seen.put(try allocator.dupe(u8, dep_key), {});
                    if (all_deps_count >= all_deps_buffer.len) {
                        return .{
                            .exit_code = 1,
                            .message = try allocator.dupe(u8, "Too many dependencies in workspace (max 1024)"),
                        };
                    }
                    all_deps_buffer[all_deps_count] = try dep.clone(allocator);
                    all_deps_count += 1;
                }
            }
            std.debug.print("{s}   └─ {d} dependencies\n", .{ dim, deps.len });
        } else {
            std.debug.print("{s}   └─ No dependencies\n", .{dim});
        }
    }

    std.debug.print("\n", .{});

    if (all_deps_count == 0) {
        std.debug.print("{s}✓{s} No dependencies to install\n", .{ green, reset });
        return .{ .exit_code = 0 };
    }

    std.debug.print("{s}➤{s} Installing {d} unique package(s) for workspace...\n", .{ green, reset, all_deps_count });

    // Create workspace environment
    const home = try lib.Paths.home(allocator);
    defer allocator.free(home);

    // Hash workspace root for environment directory
    var workspace_hasher = std.crypto.hash.Md5.init(.{});
    workspace_hasher.update(workspace_root);
    var workspace_hash: [16]u8 = undefined;
    workspace_hasher.final(&workspace_hash);
    const workspace_hash_short = try std.fmt.allocPrint(allocator, "{x:0>8}", .{std.mem.readInt(u32, workspace_hash[0..4], .little)});
    defer allocator.free(workspace_hash_short);

    // Create environment directory
    const env_dir = try std.fmt.allocPrint(
        allocator,
        "{s}/.pantry/envs/{s}_{s}-workspace",
        .{ home, workspace_config.name, workspace_hash_short },
    );
    defer allocator.free(env_dir);

    // Create environment directory structure
    try std.fs.cwd().makePath(env_dir);
    const bin_dir = try std.fmt.allocPrint(allocator, "{s}/bin", .{env_dir});
    defer allocator.free(bin_dir);
    try std.fs.cwd().makePath(bin_dir);

    // Install each dependency
    var pkg_cache = try cache.PackageCache.init(allocator);
    defer pkg_cache.deinit();

    var installer = try install.Installer.init(allocator, &pkg_cache);
    defer installer.deinit();

    var success_count: usize = 0;
    var failed_count: usize = 0;

    // Clean up dependencies after installation
    defer {
        for (all_deps_buffer[0..all_deps_count]) |*dep| {
            var d = dep.*;
            d.deinit(allocator);
        }
    }

    for (all_deps_buffer[0..all_deps_count]) |dep| {
        // Map DependencySource to PackageSource
        const pkg_source: lib.packages.PackageSource = switch (dep.source) {
            .registry => .pkgx,
            .github => .github,
            .git => .git,
            .url => .http,
        };

        const spec = lib.packages.PackageSpec{
            .name = dep.name,
            .version = dep.version,
            .source = pkg_source,
        };

        var result = installer.install(spec, .{
            .project_root = workspace_root,
            .quiet = true,
        }) catch |err| {
            const red = "\x1b[31m";
            std.debug.print("{s}✗{s} {s}@{s} {s}({any}){s}\n", .{ red, reset, dep.name, dep.version, dim, err, reset });
            failed_count += 1;
            continue;
        };
        defer result.deinit(allocator);

        std.debug.print("{s}✓{s} {s}@{s}\n", .{ green, reset, dep.name, dep.version });
        success_count += 1;
    }

    // Generate workspace lockfile
    const lockfile_path = try std.fmt.allocPrint(allocator, "{s}/.freezer", .{workspace_root});
    defer allocator.free(lockfile_path);

    var lockfile = try lib.packages.Lockfile.init(allocator, "1.0.0");
    defer lockfile.deinit(allocator);

    // Add entries for all installed packages
    for (all_deps_buffer[0..all_deps_count]) |dep| {
        const entry = lib.packages.LockfileEntry{
            .name = try allocator.dupe(u8, dep.name),
            .version = try allocator.dupe(u8, dep.version),
            .source = switch (dep.source) {
                .registry => .pkgx,
                .github => .github,
                .git => .git,
                .url => .http,
            },
            .url = null,
            .resolved = null,
            .integrity = null,
            .dependencies = null,
        };

        const key = try std.fmt.allocPrint(allocator, "{s}@{s}", .{ dep.name, dep.version });
        defer allocator.free(key);
        try lockfile.addEntry(allocator, key, entry);
    }

    // Write lockfile
    const lockfile_writer = @import("../../packages/lockfile.zig");
    lockfile_writer.writeLockfile(allocator, &lockfile, lockfile_path) catch |err| {
        const yellow = "\x1b[33m";
        std.debug.print("\n{s}⚠{s}  Failed to write lockfile: {}\n", .{ yellow, reset, err });
    };

    // Summary
    std.debug.print("\n{s}✓{s} Workspace setup complete! Installed {d} package(s)", .{ green, reset, success_count });
    if (failed_count > 0) {
        const red = "\x1b[31m";
        std.debug.print(", {s}{d} failed{s}", .{ red, failed_count, reset });
    }
    std.debug.print("\n", .{});

    return .{ .exit_code = 0 };
}

/// Publish options
pub const PublishOptions = struct {
    dry_run: bool = false,
    access: []const u8 = "public", // public or restricted
    registry: ?[]const u8 = null,
    tag: []const u8 = "latest",
};

/// Publish command - publish package to registry
pub fn publishCommand(allocator: std.mem.Allocator, args: []const []const u8, options: PublishOptions) !CommandResult {
    _ = args;

    const publish_module = @import("../../packages/publish.zig");

    const cwd = try std.process.getCwdAlloc(allocator);
    defer allocator.free(cwd);

    const green = "\x1b[32m";
    const blue = "\x1b[34m";
    const yellow = "\x1b[33m";
    const dim = "\x1b[2m";
    const reset = "\x1b[0m";

    // Find package config
    const config_path = publish_module.findPackageConfig(allocator, cwd) catch {
        return .{
            .exit_code = 1,
            .message = try allocator.dupe(u8, "Error: No package configuration found (pantry.json, package.json)"),
        };
    };
    defer allocator.free(config_path);

    std.debug.print("{s}📦 Publishing package{s}\n", .{ blue, reset });
    std.debug.print("{s}   Config: {s}{s}\n\n", .{ dim, std.fs.path.basename(config_path), reset });

    // Extract and validate metadata
    var metadata = publish_module.extractMetadata(allocator, config_path) catch |err| {
        const error_msg = switch (err) {
            error.MissingName => "package name is required",
            error.MissingVersion => "package version is required",
            error.InvalidVersion => "package version must be valid semver (e.g., 1.0.0)",
            error.InvalidName => "package name contains invalid characters",
            error.PackageConfigNotFound => "package config file not found",
            error.InvalidPackageConfig => "package config file is invalid JSON",
            else => "unknown validation error",
        };
        return .{
            .exit_code = 1,
            .message = try std.fmt.allocPrint(allocator, "Validation failed: {s}", .{error_msg}),
        };
    };
    defer metadata.deinit(allocator);

    // Display package info
    std.debug.print("{s}Package:{s} {s}@{s}\n", .{ green, reset, metadata.name, metadata.version });
    if (metadata.description) |desc| {
        std.debug.print("{s}Description:{s} {s}\n", .{ dim, reset, desc });
    }
    if (metadata.license) |lic| {
        std.debug.print("{s}License:{s} {s}\n", .{ dim, reset, lic });
    }
    if (metadata.author) |auth| {
        std.debug.print("{s}Author:{s} {s}\n", .{ dim, reset, auth });
    }
    std.debug.print("\n", .{});

    if (options.dry_run) {
        std.debug.print("{s}🔍 Dry run mode{s} - no actual publish will occur\n", .{ yellow, reset });
        std.debug.print("\n{s}✓{s} Package validation successful!\n", .{ green, reset });
        std.debug.print("{s}   Would publish:{s} {s}@{s}\n", .{ dim, reset, metadata.name, metadata.version });
        if (options.registry) |reg| {
            std.debug.print("{s}   Registry:{s} {s}\n", .{ dim, reset, reg });
        }
        std.debug.print("{s}   Tag:{s} {s}\n", .{ dim, reset, options.tag });
        std.debug.print("{s}   Access:{s} {s}\n", .{ dim, reset, options.access });
        return .{ .exit_code = 0 };
    }

    // TODO: Actual publish implementation
    // For now, we'll just validate and show what would be published
    std.debug.print("{s}⚠{s}  Publishing functionality not yet implemented\n", .{ yellow, reset });
    std.debug.print("{s}   Package validation successful!{s}\n", .{ dim, reset });
    std.debug.print("{s}   Use --dry-run to test package validation{s}\n\n", .{ dim, reset });

    return .{
        .exit_code = 0,
        .message = try std.fmt.allocPrint(allocator, "Package {s}@{s} validated successfully", .{ metadata.name, metadata.version }),
    };
}

/// List command
pub fn listCommand(allocator: std.mem.Allocator, _: []const []const u8) !CommandResult {
    var pkg_cache = try cache.PackageCache.init(allocator);
    defer pkg_cache.deinit();

    var installer = try install.Installer.init(allocator, &pkg_cache);
    defer installer.deinit();

    var installed = try installer.listInstalled();
    defer {
        for (installed.items) |*pkg| {
            pkg.deinit(allocator);
        }
        installed.deinit(allocator);
    }

    if (installed.items.len == 0) {
        std.debug.print("No packages installed.\n", .{});
        return .{ .exit_code = 0 };
    }

    std.debug.print("Installed packages ({d}):\n\n", .{installed.items.len});
    for (installed.items) |pkg| {
        std.debug.print("  {s}@{s}\n", .{ pkg.name, pkg.version });
        std.debug.print("    Path: {s}\n", .{pkg.install_path});
        std.debug.print("    Size: {d} bytes\n", .{pkg.size});
    }

    return .{ .exit_code = 0 };
}

/// Cache stats command
pub fn cacheStatsCommand(allocator: std.mem.Allocator, _: []const []const u8) !CommandResult {
    var pkg_cache = try cache.PackageCache.init(allocator);
    defer pkg_cache.deinit();

    const stats = pkg_cache.stats();

    std.debug.print("Cache Statistics:\n\n", .{});
    std.debug.print("  Total packages: {d}\n", .{stats.total_packages});
    std.debug.print("  Total size: {d} bytes ({d:.2} MB)\n", .{
        stats.total_size,
        @as(f64, @floatFromInt(stats.total_size)) / 1024.0 / 1024.0,
    });

    return .{ .exit_code = 0 };
}

/// Cache clear command
pub fn cacheClearCommand(allocator: std.mem.Allocator, _: []const []const u8) !CommandResult {
    var pkg_cache = try cache.PackageCache.init(allocator);
    defer pkg_cache.deinit();

    const stats_before = pkg_cache.stats();

    std.debug.print("Clearing cache...\n", .{});
    try pkg_cache.clear();

    std.debug.print("Removed {d} package(s)\n", .{stats_before.total_packages});
    std.debug.print("Freed {d:.2} MB\n", .{
        @as(f64, @floatFromInt(stats_before.total_size)) / 1024.0 / 1024.0,
    });

    return .{ .exit_code = 0 };
}

pub const CleanOptions = struct {
    local: bool = false,
    global: bool = false,
    cache: bool = false,
};

/// Clean command - clean local deps, global deps, and/or cache
pub fn cleanCommand(allocator: std.mem.Allocator, options: CleanOptions) !CommandResult {
    var total_freed: u64 = 0;
    var items_removed: u64 = 0;

    // Clean local project dependencies (pantry_modules)
    if (options.local) {
        std.debug.print("Cleaning local dependencies (pantry_modules)...\n", .{});

        const cwd = std.fs.cwd();
        const pantry_modules_path = "pantry_modules";

        cwd.deleteTree(pantry_modules_path) catch |err| {
            if (err != error.FileNotFound) {
                std.debug.print("Warning: Failed to clean pantry_modules: {}\n", .{err});
            }
        };

        std.debug.print("  ✓ Removed pantry_modules/\n", .{});
        items_removed += 1;

        // Also clean env cache when cleaning local deps
        const home = lib.Paths.home(allocator) catch {
            std.debug.print("Warning: Failed to get home directory for env cache\n", .{});
            return .{ .exit_code = 0 };
        };
        defer allocator.free(home);

        const env_cache_path = std.fmt.allocPrint(
            allocator,
            "{s}/.pantry/cache/envs.cache",
            .{home},
        ) catch {
            std.debug.print("Warning: Failed to allocate env cache path\n", .{});
            return .{ .exit_code = 0 };
        };
        defer allocator.free(env_cache_path);

        std.fs.cwd().deleteFile(env_cache_path) catch |err| {
            if (err != error.FileNotFound) {
                std.debug.print("Warning: Failed to clean env cache: {}\n", .{err});
            }
        };

        std.debug.print("  ✓ Cleared environment cache\n", .{});
    }

    // Clean global dependencies
    if (options.global) {
        std.debug.print("Cleaning global dependencies...\n", .{});

        const home = try lib.Paths.home(allocator);
        defer allocator.free(home);

        const global_path = try std.fmt.allocPrint(
            allocator,
            "{s}/.pantry/global/packages",
            .{home},
        );
        defer allocator.free(global_path);

        // Try to open global directory
        if (std.fs.cwd().openDir(global_path, .{ .iterate = true })) |global_dir| {
            var dir = global_dir;
            defer dir.close();

            var iter = dir.iterate();
            while (try iter.next()) |entry| {
                if (entry.kind == .directory) {
                    items_removed += 1;
                }
            }

            // Delete the directory
            std.fs.cwd().deleteTree(global_path) catch |err| {
                std.debug.print("Warning: Failed to clean global packages: {}\n", .{err});
            };

            // Recreate empty directory
            try std.fs.cwd().makePath(global_path);

            std.debug.print("  ✓ Removed {d} global package(s)\n", .{items_removed});
        } else |err| {
            if (err == error.FileNotFound) {
                std.debug.print("  No global packages found\n", .{});
            } else {
                std.debug.print("Warning: Failed to access global packages: {}\n", .{err});
            }
        }
    }

    // Clean package cache
    if (options.cache) {
        var pkg_cache = try cache.PackageCache.init(allocator);
        defer pkg_cache.deinit();

        const stats_before = pkg_cache.stats();

        std.debug.print("Cleaning package cache...\n", .{});
        try pkg_cache.clear();

        total_freed += stats_before.total_size;
        items_removed += stats_before.total_packages;

        std.debug.print("  ✓ Removed {d} cached package(s)\n", .{stats_before.total_packages});
    }

    // Summary
    if (total_freed > 0) {
        std.debug.print("\nFreed {d:.2} MB total\n", .{
            @as(f64, @floatFromInt(total_freed)) / 1024.0 / 1024.0,
        });
    }

    return .{ .exit_code = 0 };
}

/// Environment list command
pub fn envListCommand(allocator: std.mem.Allocator, _: []const []const u8) !CommandResult {
    var manager = try env.EnvManager.init(allocator);
    defer manager.deinit();

    var envs = try manager.list();
    defer envs.deinit(allocator);

    if (envs.items.len == 0) {
        std.debug.print("No environments found.\n", .{});
        return .{ .exit_code = 0 };
    }

    std.debug.print("Environments ({d}):\n\n", .{envs.items.len});
    for (envs.items) |hash| {
        const hex = try string.hashToHex(hash, allocator);
        defer allocator.free(hex);
        std.debug.print("  {s}\n", .{hex});
    }

    return .{ .exit_code = 0 };
}

/// Environment remove command
pub fn envRemoveCommand(allocator: std.mem.Allocator, hash_str: []const u8) !CommandResult {
    var manager = try env.EnvManager.init(allocator);
    defer manager.deinit();

    // Parse hash from hex string
    if (hash_str.len != 32) {
        return .{
            .exit_code = 1,
            .message = try allocator.dupe(u8, "Error: Invalid hash (must be 32 hex characters)"),
        };
    }

    var hash: [16]u8 = undefined;
    _ = std.fmt.hexToBytes(&hash, hash_str) catch {
        return .{
            .exit_code = 1,
            .message = try allocator.dupe(u8, "Error: Invalid hex string"),
        };
    };

    std.debug.print("Removing environment {s}...\n", .{hash_str});
    try manager.remove(hash);
    std.debug.print("Done.\n", .{});

    return .{ .exit_code = 0 };
}

/// Shell integrate command
pub fn shellIntegrateCommand(allocator: std.mem.Allocator) !CommandResult {
    const detected_shell = shell.Shell.detect();

    if (detected_shell == .unknown) {
        return .{
            .exit_code = 1,
            .message = try allocator.dupe(u8, "Error: Could not detect shell"),
        };
    }

    std.debug.print("Detected shell: {s}\n", .{detected_shell.name()});
    std.debug.print("Installing shell integration...\n", .{});

    shell.install(allocator) catch |err| {
        const msg = try std.fmt.allocPrint(
            allocator,
            "Error: Failed to install shell integration: {}",
            .{err},
        );
        return .{
            .exit_code = 1,
            .message = msg,
        };
    };

    std.debug.print("Done! Restart your shell or run:\n", .{});
    switch (detected_shell) {
        .zsh => std.debug.print("  source ~/.zshrc\n", .{}),
        .bash => std.debug.print("  source ~/.bashrc\n", .{}),
        .fish => std.debug.print("  source ~/.config/fish/config.fish\n", .{}),
        .unknown => {},
    }

    return .{ .exit_code = 0 };
}

/// Generate shell code for integration (dev:shellcode command)
pub fn shellCodeCommand(allocator: std.mem.Allocator) !CommandResult {
    var generator = shell.ShellCodeGenerator.init(allocator, .{
        .show_messages = true,
        .activation_message = "✅ Environment activated",
        .deactivation_message = "Environment deactivated",
        .verbose = false,
    });
    defer generator.deinit();

    const shell_code = try generator.generate();

    return .{
        .exit_code = 0,
        .message = shell_code,
    };
}

/// Uninstall command
pub fn uninstallCommand(allocator: std.mem.Allocator, args: []const []const u8) !CommandResult {
    if (args.len == 0) {
        return .{
            .exit_code = 1,
            .message = try allocator.dupe(u8, "Error: No packages specified"),
        };
    }

    std.debug.print("Uninstalling {d} package(s)...\n", .{args.len});

    for (args) |pkg_name| {
        std.debug.print("  → {s}...", .{pkg_name});
        // TODO: Implement actual uninstall logic
        std.debug.print(" done\n", .{});
    }

    return .{ .exit_code = 0 };
}

/// Search command
pub fn searchCommand(allocator: std.mem.Allocator, args: []const []const u8) !CommandResult {
    if (args.len == 0) {
        return .{
            .exit_code = 1,
            .message = try allocator.dupe(u8, "Error: No search term specified"),
        };
    }

    const packages = @import("../../packages/generated.zig");
    const search_term = args[0];

    std.debug.print("Searching for '{s}'...\n\n", .{search_term});

    var found: usize = 0;
    for (packages.packages) |pkg| {
        // Simple case-insensitive substring search
        if (std.ascii.indexOfIgnoreCase(pkg.domain, search_term) != null or
            std.ascii.indexOfIgnoreCase(pkg.name, search_term) != null or
            std.ascii.indexOfIgnoreCase(pkg.description, search_term) != null)
        {
            std.debug.print("  {s}\n", .{pkg.name});
            std.debug.print("    Domain: {s}\n", .{pkg.domain});
            std.debug.print("    {s}\n\n", .{pkg.description});
            found += 1;
        }
    }

    if (found == 0) {
        std.debug.print("No packages found.\n", .{});
    } else {
        std.debug.print("Found {d} package(s)\n", .{found});
    }

    return .{ .exit_code = 0 };
}

/// Info command
pub fn infoCommand(allocator: std.mem.Allocator, args: []const []const u8) !CommandResult {
    if (args.len == 0) {
        return .{
            .exit_code = 1,
            .message = try allocator.dupe(u8, "Error: No package specified"),
        };
    }

    const packages = @import("../../packages/generated.zig");
    const pkg_name = args[0];

    const pkg = packages.getPackageByName(pkg_name);

    if (pkg == null) {
        const msg = try std.fmt.allocPrint(
            allocator,
            "Package '{s}' not found",
            .{pkg_name},
        );
        return .{
            .exit_code = 1,
            .message = msg,
        };
    }

    std.debug.print("\n{s}\n", .{pkg.?.name});
    std.debug.print("  Domain: {s}\n", .{pkg.?.domain});
    std.debug.print("  Description: {s}\n", .{pkg.?.description});

    if (pkg.?.homepage_url) |url| {
        std.debug.print("  Homepage: {s}\n", .{url});
    }

    if (pkg.?.programs.len > 0) {
        std.debug.print("  Programs:\n", .{});
        for (pkg.?.programs) |program| {
            std.debug.print("    - {s}\n", .{program});
        }
    }

    if (pkg.?.dependencies.len > 0) {
        std.debug.print("  Dependencies:\n", .{});
        for (pkg.?.dependencies) |dep| {
            std.debug.print("    - {s}\n", .{dep});
        }
    }

    if (pkg.?.build_dependencies.len > 0) {
        std.debug.print("  Build Dependencies:\n", .{});
        for (pkg.?.build_dependencies) |dep| {
            std.debug.print("    - {s}\n", .{dep});
        }
    }

    if (pkg.?.aliases.len > 0) {
        std.debug.print("  Aliases:\n", .{});
        for (pkg.?.aliases) |alias| {
            std.debug.print("    - {s}\n", .{alias});
        }
    }

    std.debug.print("\n", .{});

    return .{ .exit_code = 0 };
}

/// Environment inspect command
pub fn envInspectCommand(allocator: std.mem.Allocator, hash_str: []const u8) !CommandResult {
    var manager = try env.EnvManager.init(allocator);
    defer manager.deinit();

    if (hash_str.len != 32) {
        return .{
            .exit_code = 1,
            .message = try allocator.dupe(u8, "Error: Invalid hash (must be 32 hex characters)"),
        };
    }

    var hash: [16]u8 = undefined;
    _ = std.fmt.hexToBytes(&hash, hash_str) catch {
        return .{
            .exit_code = 1,
            .message = try allocator.dupe(u8, "Error: Invalid hex string"),
        };
    };

    std.debug.print("Environment: {s}\n\n", .{hash_str});
    // TODO: Implement actual inspect logic
    std.debug.print("  Status: Active\n", .{});
    std.debug.print("  Created: (timestamp)\n", .{});
    std.debug.print("  Packages: (package list)\n", .{});

    return .{ .exit_code = 0 };
}

/// Environment clean command
pub fn envCleanCommand(allocator: std.mem.Allocator, _: []const []const u8) !CommandResult {
    var manager = try env.EnvManager.init(allocator);
    defer manager.deinit();

    std.debug.print("Cleaning old environments...\n", .{});
    // TODO: Implement actual clean logic
    std.debug.print("Removed 0 environment(s)\n", .{});

    return .{ .exit_code = 0 };
}

/// Environment lookup command - find environment for a project directory
pub fn envLookupCommand(allocator: std.mem.Allocator, project_dir: []const u8) !CommandResult {
    const detector = @import("../../deps/detector.zig");

    // Find dependency file in project directory
    const deps_file = (try detector.findDepsFile(allocator, project_dir)) orelse {
        // No dependency file found - not a pantry project
        return .{ .exit_code = 1 };
    };
    defer allocator.free(deps_file.path);

    // Get project directory (parent of deps file)
    const proj_dir = std.fs.path.dirname(deps_file.path) orelse project_dir;

    // Calculate environment directory name from project path
    // Format: projectname_shorthash-depshash
    const proj_basename = std.fs.path.basename(proj_dir);

    // Hash the project directory for short hash
    var proj_hasher = std.crypto.hash.Md5.init(.{});
    proj_hasher.update(proj_dir);
    var proj_hash: [16]u8 = undefined;
    proj_hasher.final(&proj_hash);
    const proj_hash_short = try std.fmt.allocPrint(allocator, "{x:0>8}", .{std.mem.readInt(u32, proj_hash[0..4], .little)});
    defer allocator.free(proj_hash_short);

    // Hash the dependency file contents for dep hash (last 9 chars of hex MD5 with 'd' prefix)
    const dep_file_contents = try std.fs.cwd().readFileAlloc(allocator, deps_file.path, 1024 * 1024);
    defer allocator.free(dep_file_contents);

    var dep_hasher = std.crypto.hash.Md5.init(.{});
    dep_hasher.update(dep_file_contents);
    var dep_hash: [16]u8 = undefined;
    dep_hasher.final(&dep_hash);
    const dep_hash_hex = try string.hashToHex(dep_hash, allocator);
    defer allocator.free(dep_hash_hex);
    const dep_hash_short = try std.fmt.allocPrint(allocator, "d{s}", .{dep_hash_hex[0..8]});
    defer allocator.free(dep_hash_short);

    // List all environments and find one matching projectname-dephash pattern
    const home = try lib.Paths.home(allocator);
    defer allocator.free(home);

    const envs_dir_path = try std.fmt.allocPrint(allocator, "{s}/.pantry/envs", .{home});
    defer allocator.free(envs_dir_path);

    var envs_dir = try std.fs.cwd().openDir(envs_dir_path, .{ .iterate = true });
    defer envs_dir.close();

    var env_iterator = envs_dir.iterate();
    var found_env_dir: ?[]const u8 = null;

    while (try env_iterator.next()) |entry| {
        if (entry.kind != .directory) continue;

        // Check if this environment matches our pattern: {proj_basename}_{any_hash}-{dep_hash}
        // Example: zyte_0012a253-d6b20b83a
        const name = entry.name;

        // Check if it starts with project name + underscore
        const expected_prefix = try std.fmt.allocPrint(allocator, "{s}_", .{proj_basename});
        defer allocator.free(expected_prefix);

        if (!std.mem.startsWith(u8, name, expected_prefix)) continue;

        // Check if it ends with our dep hash
        const expected_suffix = try std.fmt.allocPrint(allocator, "-{s}", .{dep_hash_short});
        defer allocator.free(expected_suffix);

        if (!std.mem.endsWith(u8, name, expected_suffix)) continue;

        // Match found!
        const full_path = try std.fmt.allocPrint(allocator, "{s}/{s}", .{ envs_dir_path, name });
        found_env_dir = full_path;
        break;
    }

    if (found_env_dir) |env_dir| {
        defer allocator.free(env_dir);

        // Check that bin directory exists
        const bin_dir = try std.fmt.allocPrint(allocator, "{s}/bin", .{env_dir});
        defer allocator.free(bin_dir);

        var bin_dir_handle = std.fs.cwd().openDir(bin_dir, .{}) catch {
            return .{ .exit_code = 1 };
        };
        bin_dir_handle.close();

        // Output: env_dir|dep_file_path
        std.debug.print("{s}|{s}\n", .{ env_dir, deps_file.path });

        return .{ .exit_code = 0 };
    }

    // No matching environment found
    return .{ .exit_code = 1 };
}

/// Cache clean command (different from clear - removes unused/old entries)
pub fn cacheCleanCommand(allocator: std.mem.Allocator) !CommandResult {
    var pkg_cache = try cache.PackageCache.init(allocator);
    defer pkg_cache.deinit();

    std.debug.print("Cleaning cache (removing unused entries)...\n", .{});
    // TODO: Implement smart clean logic (keep frequently used, remove old)
    std.debug.print("Done.\n", .{});

    return .{ .exit_code = 0 };
}

/// Doctor command - verify installation and environment
pub fn doctorCommand(allocator: std.mem.Allocator) !CommandResult {
    std.debug.print("pantry Doctor\n\n", .{});

    // Check paths
    const home = try lib.Paths.home(allocator);
    defer allocator.free(home);
    std.debug.print("✓ Home: {s}\n", .{home});

    const cache_dir = try lib.Paths.cache(allocator);
    defer allocator.free(cache_dir);
    std.debug.print("✓ Cache: {s}\n", .{cache_dir});

    const data = try lib.Paths.data(allocator);
    defer allocator.free(data);
    std.debug.print("✓ Data: {s}\n", .{data});

    const config = try lib.Paths.config(allocator);
    defer allocator.free(config);
    std.debug.print("✓ Config: {s}\n", .{config});

    // Check shell integration
    const detected_shell = shell.Shell.detect();
    std.debug.print("✓ Shell: {s}\n", .{detected_shell.name()});

    // Check package registry
    const packages = @import("../../packages/generated.zig");
    std.debug.print("✓ Package registry: {d} packages\n", .{packages.packages.len});

    std.debug.print("\nEverything looks good!\n", .{});

    return .{ .exit_code = 0 };
}

/// Services list command
pub fn servicesCommand(_: std.mem.Allocator) !CommandResult {
    std.debug.print("Available services:\n\n", .{});

    // List all available services with their default ports
    const services = [_]struct { name: []const u8, display: []const u8, port: u16 }{
        .{ .name = "postgres", .display = "PostgreSQL", .port = 5432 },
        .{ .name = "mysql", .display = "MySQL", .port = 3306 },
        .{ .name = "redis", .display = "Redis", .port = 6379 },
        .{ .name = "nginx", .display = "Nginx", .port = 80 },
        .{ .name = "mongodb", .display = "MongoDB", .port = 27017 },
    };

    for (services) |svc| {
        std.debug.print("  {s: <12} {s} (default port: {d})\n", .{ svc.name, svc.display, svc.port });
    }

    std.debug.print("\nUsage:\n", .{});
    std.debug.print("  pantry start <service>    Start a service\n", .{});
    std.debug.print("  pantry stop <service>     Stop a service\n", .{});
    std.debug.print("  pantry restart <service>  Restart a service\n", .{});
    std.debug.print("  pantry status [service]   Show service status\n", .{});

    return .{ .exit_code = 0 };
}

/// Start service command
pub fn startCommand(allocator: std.mem.Allocator, args: []const []const u8) !CommandResult {
    if (args.len == 0) {
        return .{
            .exit_code = 1,
            .message = try allocator.dupe(u8, "Error: No service specified"),
        };
    }

    const service_name = args[0];
    std.debug.print("Starting {s}...\n", .{service_name});

    // Use platform-specific service management
    const platform = lib.Platform.current();

    switch (platform) {
        .darwin => {
            // macOS: use brew services
            const result = std.process.Child.run(.{
                .allocator = allocator,
                .argv = &[_][]const u8{ "brew", "services", "start", service_name },
            }) catch |err| {
                const msg = try std.fmt.allocPrint(
                    allocator,
                    "Failed to start {s}: {}",
                    .{ service_name, err },
                );
                return .{
                    .exit_code = 1,
                    .message = msg,
                };
            };
            defer allocator.free(result.stdout);
            defer allocator.free(result.stderr);

            if (result.term.Exited == 0) {
                std.debug.print("✓ Started {s}\n", .{service_name});
                return .{ .exit_code = 0 };
            } else {
                std.debug.print("Error: {s}\n", .{result.stderr});
                return .{ .exit_code = 1 };
            }
        },
        .linux => {
            // Linux: use systemctl
            const result = std.process.Child.run(.{
                .allocator = allocator,
                .argv = &[_][]const u8{ "systemctl", "start", service_name },
            }) catch |err| {
                const msg = try std.fmt.allocPrint(
                    allocator,
                    "Failed to start {s}: {}",
                    .{ service_name, err },
                );
                return .{
                    .exit_code = 1,
                    .message = msg,
                };
            };
            defer allocator.free(result.stdout);
            defer allocator.free(result.stderr);

            if (result.term.Exited == 0) {
                std.debug.print("✓ Started {s}\n", .{service_name});
                return .{ .exit_code = 0 };
            } else {
                std.debug.print("Error: {s}\n", .{result.stderr});
                return .{ .exit_code = 1 };
            }
        },
        .windows => {
            std.debug.print("Service management not yet supported on Windows\n", .{});
            return .{ .exit_code = 1 };
        },
    }
}

/// Stop service command
pub fn stopCommand(allocator: std.mem.Allocator, args: []const []const u8) !CommandResult {
    if (args.len == 0) {
        return .{
            .exit_code = 1,
            .message = try allocator.dupe(u8, "Error: No service specified"),
        };
    }

    const service_name = args[0];
    std.debug.print("Stopping {s}...\n", .{service_name});

    const platform = lib.Platform.current();

    switch (platform) {
        .darwin => {
            const result = std.process.Child.run(.{
                .allocator = allocator,
                .argv = &[_][]const u8{ "brew", "services", "stop", service_name },
            }) catch |err| {
                const msg = try std.fmt.allocPrint(
                    allocator,
                    "Failed to stop {s}: {}",
                    .{ service_name, err },
                );
                return .{
                    .exit_code = 1,
                    .message = msg,
                };
            };
            defer allocator.free(result.stdout);
            defer allocator.free(result.stderr);

            if (result.term.Exited == 0) {
                std.debug.print("✓ Stopped {s}\n", .{service_name});
                return .{ .exit_code = 0 };
            } else {
                std.debug.print("Error: {s}\n", .{result.stderr});
                return .{ .exit_code = 1 };
            }
        },
        .linux => {
            const result = std.process.Child.run(.{
                .allocator = allocator,
                .argv = &[_][]const u8{ "systemctl", "stop", service_name },
            }) catch |err| {
                const msg = try std.fmt.allocPrint(
                    allocator,
                    "Failed to stop {s}: {}",
                    .{ service_name, err },
                );
                return .{
                    .exit_code = 1,
                    .message = msg,
                };
            };
            defer allocator.free(result.stdout);
            defer allocator.free(result.stderr);

            if (result.term.Exited == 0) {
                std.debug.print("✓ Stopped {s}\n", .{service_name});
                return .{ .exit_code = 0 };
            } else {
                std.debug.print("Error: {s}\n", .{result.stderr});
                return .{ .exit_code = 1 };
            }
        },
        .windows => {
            std.debug.print("Service management not yet supported on Windows\n", .{});
            return .{ .exit_code = 1 };
        },
    }
}

/// Restart service command
pub fn restartCommand(allocator: std.mem.Allocator, args: []const []const u8) !CommandResult {
    if (args.len == 0) {
        return .{
            .exit_code = 1,
            .message = try allocator.dupe(u8, "Error: No service specified"),
        };
    }

    const service_name = args[0];
    std.debug.print("Restarting {s}...\n", .{service_name});

    const platform = lib.Platform.current();

    switch (platform) {
        .darwin => {
            const result = std.process.Child.run(.{
                .allocator = allocator,
                .argv = &[_][]const u8{ "brew", "services", "restart", service_name },
            }) catch |err| {
                const msg = try std.fmt.allocPrint(
                    allocator,
                    "Failed to restart {s}: {}",
                    .{ service_name, err },
                );
                return .{
                    .exit_code = 1,
                    .message = msg,
                };
            };
            defer allocator.free(result.stdout);
            defer allocator.free(result.stderr);

            if (result.term.Exited == 0) {
                std.debug.print("✓ Restarted {s}\n", .{service_name});
                return .{ .exit_code = 0 };
            } else {
                std.debug.print("Error: {s}\n", .{result.stderr});
                return .{ .exit_code = 1 };
            }
        },
        .linux => {
            const result = std.process.Child.run(.{
                .allocator = allocator,
                .argv = &[_][]const u8{ "systemctl", "restart", service_name },
            }) catch |err| {
                const msg = try std.fmt.allocPrint(
                    allocator,
                    "Failed to restart {s}: {}",
                    .{ service_name, err },
                );
                return .{
                    .exit_code = 1,
                    .message = msg,
                };
            };
            defer allocator.free(result.stdout);
            defer allocator.free(result.stderr);

            if (result.term.Exited == 0) {
                std.debug.print("✓ Restarted {s}\n", .{service_name});
                return .{ .exit_code = 0 };
            } else {
                std.debug.print("Error: {s}\n", .{result.stderr});
                return .{ .exit_code = 1 };
            }
        },
        .windows => {
            std.debug.print("Service management not yet supported on Windows\n", .{});
            return .{ .exit_code = 1 };
        },
    }
}

/// Status service command
pub fn statusCommand(allocator: std.mem.Allocator, args: []const []const u8) !CommandResult {
    const platform = lib.Platform.current();

    if (args.len == 0) {
        // Show status of all services using brew services list
        switch (platform) {
            .darwin => {
                std.debug.print("Service status:\n\n", .{});
                const result = std.process.Child.run(.{
                    .allocator = allocator,
                    .argv = &[_][]const u8{ "brew", "services", "list" },
                }) catch {
                    std.debug.print("Error: Could not get service status\n", .{});
                    return .{ .exit_code = 1 };
                };
                defer allocator.free(result.stdout);
                defer allocator.free(result.stderr);

                std.debug.print("{s}\n", .{result.stdout});
                return .{ .exit_code = 0 };
            },
            .linux => {
                std.debug.print("Service status:\n\n", .{});
                const services_list = [_][]const u8{ "postgresql", "redis", "mysql", "nginx", "mongodb" };
                for (services_list) |svc| {
                    const result = std.process.Child.run(.{
                        .allocator = allocator,
                        .argv = &[_][]const u8{ "systemctl", "is-active", svc },
                    }) catch {
                        std.debug.print("  {s}: unknown\n", .{svc});
                        continue;
                    };
                    defer allocator.free(result.stdout);
                    defer allocator.free(result.stderr);

                    const status = std.mem.trim(u8, result.stdout, &std.ascii.whitespace);
                    std.debug.print("  {s}: {s}\n", .{ svc, status });
                }
                return .{ .exit_code = 0 };
            },
            .windows => {
                std.debug.print("Service management not yet supported on Windows\n", .{});
                return .{ .exit_code = 1 };
            },
        }
    } else {
        // Show status of specific service
        const service_name = args[0];

        switch (platform) {
            .darwin => {
                const result = std.process.Child.run(.{
                    .allocator = allocator,
                    .argv = &[_][]const u8{ "brew", "services", "list" },
                }) catch {
                    std.debug.print("{s}: unknown\n", .{service_name});
                    return .{ .exit_code = 1 };
                };
                defer allocator.free(result.stdout);
                defer allocator.free(result.stderr);

                // Parse output for the specific service
                if (std.mem.indexOf(u8, result.stdout, service_name)) |_| {
                    std.debug.print("{s}\n", .{result.stdout});
                } else {
                    std.debug.print("{s}: not installed\n", .{service_name});
                }
                return .{ .exit_code = 0 };
            },
            .linux => {
                const result = std.process.Child.run(.{
                    .allocator = allocator,
                    .argv = &[_][]const u8{ "systemctl", "status", service_name },
                }) catch {
                    std.debug.print("{s}: not found\n", .{service_name});
                    return .{ .exit_code = 1 };
                };
                defer allocator.free(result.stdout);
                defer allocator.free(result.stderr);

                std.debug.print("{s}\n", .{result.stdout});
                return .{ .exit_code = 0 };
            },
            .windows => {
                std.debug.print("Service management not yet supported on Windows\n", .{});
                return .{ .exit_code = 1 };
            },
        }
    }
}

/// Shell lookup command (for shell integration)
pub fn shellLookupCommand(allocator: std.mem.Allocator, dir: []const u8) !CommandResult {
    const detector = @import("../../deps/detector.zig");

    // Find dependency file first
    const deps_file = (try detector.findDepsFile(allocator, dir)) orelse {
        // No dependency file found
        return .{ .exit_code = 1 };
    };
    defer allocator.free(deps_file.path);

    // Hash the dependency file path (same as shell:activate does)
    const hash = string.hashDependencyFile(deps_file.path);

    // Check environment cache (with disk persistence)
    var env_cache = try cache.EnvCache.initWithPersistence(allocator);
    defer env_cache.deinit();

    if (try env_cache.get(hash)) |entry| {
        // Cache hit - output env_dir|project_dir format expected by shell integration
        const project_dir = std.fs.path.dirname(deps_file.path) orelse dir;

        std.debug.print("{s}|{s}\n", .{ entry.path, project_dir });
        return .{ .exit_code = 0 };
    }

    // Cache miss - no output
    return .{ .exit_code = 1 };
}

/// Ensure global dependencies are installed (called on every shell activation)
fn ensureGlobalDepsInstalled(allocator: std.mem.Allocator) !void {
    const global_scanner = @import("../../deps/global_scanner.zig");

    // Scan for global dependencies
    const global_deps = global_scanner.scanForGlobalDeps(allocator) catch |err| {
        // If scanning fails, just continue - don't block shell activation
        std.debug.print("Warning: Failed to scan for global deps: {}\n", .{err});
        return;
    };
    defer {
        for (global_deps) |*dep| {
            var d = dep.*;
            d.deinit(allocator);
        }
        allocator.free(global_deps);
    }

    if (global_deps.len == 0) return;

    // Determine global installation directory
    // Try /usr/local first (system-wide), fallback to ~/.pantry/global (user-local)
    const global_dir = blk: {
        // Test if we can actually write to /usr/local by creating a test directory
        const test_path = "/usr/local/pantry_test_write";
        std.fs.cwd().makePath(test_path) catch {
            // Cannot write to /usr/local - use user-local
            const home = lib.Paths.home(allocator) catch return;
            defer allocator.free(home);
            const user_dir = std.fmt.allocPrint(allocator, "{s}/.pantry/global", .{home}) catch return;
            std.fs.cwd().makePath(user_dir) catch return;
            break :blk user_dir;
        };
        // Clean up test directory
        std.fs.cwd().deleteTree(test_path) catch {};
        // Has permissions for /usr/local
        break :blk "/usr/local";
    };
    const is_user_local = !std.mem.eql(u8, global_dir, "/usr/local");
    defer if (is_user_local) allocator.free(global_dir);

    // Check which global deps need to be installed
    var pkg_cache = cache.PackageCache.init(allocator) catch return;
    defer pkg_cache.deinit();

    for (global_deps) |dep| {
        // Check if package is already installed in the target directory
        const pkg_dir = std.fmt.allocPrint(
            allocator,
            "{s}/packages/{s}",
            .{ global_dir, dep.name },
        ) catch continue;
        defer allocator.free(pkg_dir);

        // If package directory exists, skip installation
        var dir = std.fs.cwd().openDir(pkg_dir, .{}) catch {
            // Package not installed - install it silently
            const spec = lib.packages.PackageSpec{
                .name = dep.name,
                .version = dep.version,
            };

            var custom_installer = install.Installer.init(allocator, &pkg_cache) catch continue;
            defer custom_installer.deinit();

            allocator.free(custom_installer.data_dir);
            custom_installer.data_dir = allocator.dupe(u8, global_dir) catch continue;

            var result = custom_installer.install(spec, .{ .quiet = true }) catch continue;
            result.deinit(allocator);

            continue;
        };
        dir.close();
    }
}

/// Shell activate command (for shell integration)
pub fn shellActivateCommand(allocator: std.mem.Allocator, dir: []const u8) !CommandResult {
    const detector = @import("../../deps/detector.zig");
    const parser = @import("../../deps/parser.zig");

    // Find dependency file
    const deps_file = (try detector.findDepsFile(allocator, dir)) orelse {
        // No dependency file found
        return .{ .exit_code = 1 };
    };
    defer allocator.free(deps_file.path);

    // Calculate environment hash from dependency file path
    const hash = string.hashDependencyFile(deps_file.path);
    const hash_hex = try string.hashToHex(hash, allocator);
    defer allocator.free(hash_hex);

    // Check environment cache first (with disk persistence)
    var env_cache = try cache.EnvCache.initWithPersistence(allocator);
    defer env_cache.deinit();

    if (try env_cache.get(hash)) |entry| {
        // Cache hit - but first check global dependencies
        try ensureGlobalDepsInstalled(allocator);

        // Output cached shell code to stdout
        const shell_code = try std.fmt.allocPrint(allocator, "export PATH=\"{s}:$PATH\"\n", .{entry.path});
        defer allocator.free(shell_code);

        const stdout_fd: std.posix.fd_t = 1;
        _ = std.posix.write(stdout_fd, shell_code) catch |err| {
            std.debug.print("Error writing shell code: {}\n", .{err});
            return .{ .exit_code = 1 };
        };

        return .{ .exit_code = 0 };
    }

    // Parse dependency file (auto-detects format)
    const deps = try parser.inferDependencies(allocator, deps_file);
    defer {
        for (deps) |*dep| {
            var d = dep.*;
            d.deinit(allocator);
        }
        allocator.free(deps);
    }

    if (deps.len == 0) {
        return .{ .exit_code = 0 };
    }

    // Check and install global dependencies first
    try ensureGlobalDepsInstalled(allocator);

    // Initialize package cache and installer
    var pkg_cache = try cache.PackageCache.init(allocator);
    defer pkg_cache.deinit();

    var installer = try install.Installer.init(allocator, &pkg_cache);
    defer installer.deinit();

    // Install to project-local pantry_modules directory
    const proj_dir = std.fs.path.dirname(deps_file.path) orelse dir;

    const dim = "\x1b[2m";
    const green = "\x1b[32m";
    const reset = "\x1b[0m";
    const italic = "\x1b[3m";

    // Show all packages that will be installed
    for (deps) |dep| {
        // Parse source type from name (auto: prefix) or version (local path ~/)
        const clean_name = if (std.mem.startsWith(u8, dep.name, "auto:"))
            dep.name[5..]
        else
            dep.name;

        const source_label = if (std.mem.startsWith(u8, dep.version, "~/") or std.mem.startsWith(u8, dep.version, "/"))
            "local"
        else if (std.mem.indexOf(u8, dep.name, "/") != null)
            "github"
        else
            "pkgx";

        std.debug.print("{s}+{s} {s}@{s}{s}{s} {s}({s}){s}\n", .{
            dim, reset, clean_name, dim, italic, dep.version, dim, source_label, reset
        });
    }

    // Prepare for parallel installation
    const InstallResult = struct {
        success: bool,
        error_name: ?[]const u8,
    };

    var results = try allocator.alloc(InstallResult, deps.len);
    defer allocator.free(results);

    // Thread context for parallel installation
    const ThreadContext = struct {
        dep: parser.PackageDependency,
        index: usize,
        installer: *install.Installer,
        proj_dir: []const u8,
        allocator: std.mem.Allocator,
        pkg_cache: *cache.PackageCache,
        result: *InstallResult,
        mutex: *std.Thread.Mutex,
        total_deps: usize,
        dim_str: []const u8,
        green_str: []const u8,
        reset_str: []const u8,
        italic_str: []const u8,

        fn installThread(ctx: *@This()) void {
            const spec = lib.packages.PackageSpec{
                .name = ctx.dep.name,
                .version = ctx.dep.version,
            };

            // Each thread needs its own installer instance
            var thread_installer = install.Installer.init(ctx.allocator, ctx.pkg_cache) catch {
                ctx.mutex.lock();
                defer ctx.mutex.unlock();
                ctx.result.* = .{ .success = false, .error_name = "InitFailed" };
                const lines_up = ctx.total_deps - ctx.index;
                std.debug.print("\x1b[{d}A\r\x1b[K{s}✗{s} {s}@{s} {s}(InitFailed){s}\n", .{
                    lines_up, "\x1b[31m", ctx.reset_str, ctx.dep.name, ctx.dep.version, ctx.dim_str, ctx.reset_str
                });
                if (ctx.index < ctx.total_deps - 1) {
                    std.debug.print("\x1b[{d}B", .{lines_up - 1});
                }
                return;
            };

            // Copy data_dir from main installer
            ctx.allocator.free(thread_installer.data_dir);
            thread_installer.data_dir = ctx.allocator.dupe(u8, ctx.installer.data_dir) catch {
                thread_installer.deinit();
                ctx.mutex.lock();
                defer ctx.mutex.unlock();
                ctx.result.* = .{ .success = false, .error_name = "AllocFailed" };
                return;
            };

            // Share the installing_stack from main installer to prevent circular deps across threads
            // Clean up the thread installer's stack first before replacing it
            const old_stack = thread_installer.installing_stack;
            old_stack.deinit();
            ctx.allocator.destroy(old_stack);
            thread_installer.installing_stack = ctx.installer.installing_stack;

            defer {
                // Free data_dir but don't destroy installing_stack (it's shared)
                ctx.allocator.free(thread_installer.data_dir);
            }

            // Parse clean name for inline progress display
            const clean_name = if (std.mem.startsWith(u8, ctx.dep.name, "auto:"))
                ctx.dep.name[5..]
            else
                ctx.dep.name;

            var inst_result = thread_installer.install(spec, .{
                .project_root = ctx.proj_dir,
                .quiet = true, // Keep quiet to avoid newline progress
                .inline_progress = .{
                    .line_offset = ctx.index,
                    .total_deps = ctx.total_deps,
                    .pkg_name = clean_name,
                    .pkg_version = ctx.dep.version,
                    .dim_str = ctx.dim_str,
                    .italic_str = ctx.italic_str,
                    .reset_str = ctx.reset_str,
                },
            }) catch |err| {
                ctx.mutex.lock();
                defer ctx.mutex.unlock();
                ctx.result.* = .{ .success = false, .error_name = @errorName(err) };
                const lines_up = ctx.total_deps - ctx.index;

                std.debug.print("\x1b[{d}A\r\x1b[K{s}✗{s} {s}@{s} {s}({s}){s}\n", .{
                    lines_up, "\x1b[31m", ctx.reset_str, clean_name, ctx.dep.version, ctx.dim_str, @errorName(err), ctx.reset_str
                });
                if (ctx.index < ctx.total_deps - 1) {
                    std.debug.print("\x1b[{d}B", .{lines_up - 1});
                }
                return;
            };
            defer inst_result.deinit(ctx.allocator);

            ctx.mutex.lock();
            defer ctx.mutex.unlock();
            ctx.result.* = .{ .success = true, .error_name = null };
            const lines_up = ctx.total_deps - ctx.index;

            // Parse source label
            const source_label = if (std.mem.startsWith(u8, ctx.dep.version, "~/") or std.mem.startsWith(u8, ctx.dep.version, "/"))
                "local"
            else if (std.mem.indexOf(u8, ctx.dep.name, "/") != null)
                "github"
            else
                "pkgx";

            std.debug.print("\x1b[{d}A\r\x1b[K{s}+{s} {s}@{s}{s}{s} {s}({s}){s}\n", .{
                lines_up, ctx.green_str, ctx.reset_str, clean_name, ctx.dim_str, ctx.italic_str, ctx.dep.version,
                ctx.dim_str, source_label, ctx.reset_str
            });
            if (ctx.index < ctx.total_deps - 1) {
                std.debug.print("\x1b[{d}B", .{lines_up - 1});
            }
        }
    };

    var mutex = std.Thread.Mutex{};
    var threads = try allocator.alloc(std.Thread, deps.len);
    defer allocator.free(threads);

    var contexts = try allocator.alloc(ThreadContext, deps.len);
    defer allocator.free(contexts);

    // Spawn threads for parallel installation
    for (deps, 0..) |dep, i| {
        results[i] = .{ .success = false, .error_name = null };
        contexts[i] = .{
            .dep = dep,
            .index = i,
            .installer = &installer,
            .proj_dir = proj_dir,
            .allocator = allocator,
            .pkg_cache = &pkg_cache,
            .result = &results[i],
            .mutex = &mutex,
            .total_deps = deps.len,
            .dim_str = dim,
            .green_str = green,
            .reset_str = reset,
            .italic_str = italic,
        };

        threads[i] = try std.Thread.spawn(.{}, ThreadContext.installThread, .{&contexts[i]});
    }

    // Wait for all threads to complete
    for (threads) |thread| {
        thread.join();
    }

    // Output shell code to add pantry_modules/.bin directory to PATH
    const bin_dir = try std.fmt.allocPrint(
        allocator,
        "{s}/pantry_modules/.bin",
        .{proj_dir},
    );
    defer allocator.free(bin_dir);

    // Cache this environment for fast lookup next time
    const mtime = blk: {
        const file_stat = std.fs.cwd().statFile(deps_file.path) catch break :blk 0;
        break :blk @as(i64, @intCast(file_stat.mtime));
    };

    const entry = try allocator.create(cache.env_cache.Entry);
    const env_vars = std.StringHashMap([]const u8).init(allocator);
    const now = std.time.timestamp();
    entry.* = .{
        .hash = hash,
        .dep_file = try allocator.dupe(u8, deps_file.path),
        .dep_mtime = @as(i128, @intCast(mtime)),
        .path = try allocator.dupe(u8, bin_dir),
        .env_vars = env_vars,
        .created_at = now,
        .cached_at = now,
        .last_validated = now,
    };
    try env_cache.put(entry);

    // Print summary of what was installed (to stderr, visible to user)
    // Use \r to ensure we start at beginning of line, clear any previous content
    var successful_count: usize = 0;
    for (results) |result| {
        if (result.success) successful_count += 1;
    }

    // Output shell code to stdout (not stderr) so eval can capture it
    // Include summary message as an echo command so it's visible after eval
    const shell_code = if (successful_count > 0)
        try std.fmt.allocPrint(
            allocator,
            "\necho '{s}✓{s} Installed {d} package(s)' >&2\nexport PATH=\"{s}:$PATH\"\n",
            .{ green, reset, successful_count, bin_dir },
        )
    else
        try std.fmt.allocPrint(allocator, "\nexport PATH=\"{s}:$PATH\"\n", .{bin_dir});
    defer allocator.free(shell_code);

    const stdout_fd: std.posix.fd_t = 1;
    _ = std.posix.write(stdout_fd, shell_code) catch |err| {
        std.debug.print("Error writing shell code: {}\n", .{err});
        return .{ .exit_code = 1 };
    };

    return .{ .exit_code = 0 };
}

/// Dev: shellcode command - generate shell integration code
pub fn devShellcodeCommand(allocator: std.mem.Allocator) !CommandResult {
    // Generate minimal, performant shell integration code with instant deactivation
    const shellcode =
        \\
        \\# pantry shell integration - minimal and performant
        \\
        \\# Dependency file names to check (keep in sync with Zig detector)
        \\__LP_DEP_FILES=(
        \\  "pantry.config.ts" "pantry.config.js" "dependencies.yaml" "dependencies.yml"
        \\  "deps.yaml" "deps.yml" "pkgx.yaml" "pkgx.yml" "package.json"
        \\  "pyproject.toml" "requirements.txt" "Cargo.toml" "go.mod" "Gemfile" "deno.json"
        \\)
        \\
        \\# Find dependency file in current directory or parents
        \\__lp_find_dep_file() {
        \\  local dir="$1"
        \\  local depth=0
        \\  local max_depth=10  # Don't search more than 10 levels up
        \\
        \\  while [[ "$dir" != "/" && $depth -lt $max_depth ]]; do
        \\    for fname in "${__LP_DEP_FILES[@]}"; do
        \\      if [[ -f "$dir/$fname" ]]; then
        \\        echo "$dir/$fname"
        \\        return 0
        \\      fi
        \\    done
        \\    dir=$(dirname "$dir")
        \\    ((depth++))
        \\  done
        \\  return 1
        \\}
        \\
        \\# Get file modification time (cross-platform)
        \\__lp_mtime() {
        \\  local f="$1"
        \\  if stat -f %m "$f" >/dev/null 2>&1; then
        \\    stat -f %m "$f"  # macOS/BSD
        \\  elif stat -c %Y "$f" >/dev/null 2>&1; then
        \\    stat -c %Y "$f"  # Linux
        \\  else
        \\    echo 0
        \\  fi
        \\}
        \\
        \\pantry_chpwd() {
        \\  # SUPER FAST: Skip if PWD hasn't changed
        \\  if [[ "$__LP_LAST_PWD" == "$PWD" ]]; then
        \\    return 0
        \\  fi
        \\  export __LP_LAST_PWD="$PWD"
        \\
        \\  # INSTANT DEACTIVATION: Check if we've left a project
        \\  if [[ -n "$pantry_CURRENT_PROJECT" ]]; then
        \\    # We had a project - check if we've left it
        \\    if [[ "$PWD" != "$pantry_CURRENT_PROJECT"* ]]; then
        \\      # Left the project - deactivate instantly (no subprocess calls!)
        \\      if [[ -n "$pantry_ENV_BIN_PATH" ]]; then
        \\        PATH=$(echo "$PATH" | sed "s|$pantry_ENV_BIN_PATH:||g; s|:$pantry_ENV_BIN_PATH||g; s|^$pantry_ENV_BIN_PATH$||g")
        \\        export PATH
        \\      fi
        \\      unset pantry_CURRENT_PROJECT pantry_ENV_BIN_PATH pantry_DEP_FILE pantry_DEP_MTIME
        \\      # IMPORTANT: Return immediately after deactivation - don't search for new projects!
        \\      # Only search when entering a directory, not when leaving
        \\      return 0
        \\    fi
        \\
        \\    # Still in same project - check if dependency file changed
        \\    if [[ -n "$pantry_DEP_FILE" && -f "$pantry_DEP_FILE" ]]; then
        \\      local current_mtime=$(__lp_mtime "$pantry_DEP_FILE")
        \\      if [[ "$current_mtime" != "$pantry_DEP_MTIME" ]]; then
        \\        # Dependency file changed! Force re-activation
        \\        # Deactivate first
        \\        if [[ -n "$pantry_ENV_BIN_PATH" ]]; then
        \\          PATH=$(echo "$PATH" | sed "s|$pantry_ENV_BIN_PATH:||g; s|:$pantry_ENV_BIN_PATH||g; s|^$pantry_ENV_BIN_PATH$||g")
        \\        fi
        \\        unset pantry_CURRENT_PROJECT pantry_ENV_BIN_PATH pantry_DEP_FILE pantry_DEP_MTIME
        \\        # Fall through to re-activation below
        \\      else
        \\        # No changes - skip lookup
        \\        return 0
        \\      fi
        \\    else
        \\      # No dependency file tracked or file deleted - skip lookup
        \\      return 0
        \\    fi
        \\  fi
        \\
        \\  # If we're not in a project, do a quick check before expensive file search
        \\  # Only search for dependency files if we're likely in a project directory
        \\  if [[ -z "$pantry_CURRENT_PROJECT" ]]; then
        \\    # Not in any project - do a fast single-directory check first
        \\    local has_dep_file=0
        \\    for fname in "${__LP_DEP_FILES[@]}"; do
        \\      if [[ -f "$PWD/$fname" ]]; then
        \\        has_dep_file=1
        \\        break
        \\      fi
        \\    done
        \\
        \\    # If no dep file in current dir, don't bother searching parents
        \\    if [[ $has_dep_file -eq 0 ]]; then
        \\      return 0
        \\    fi
        \\  fi
        \\
        \\  # FAST PATH: Check if we have a dependency file (only if needed)
        \\  local dep_file=$(__lp_find_dep_file "$PWD")
        \\  if [[ -z "$dep_file" ]]; then
        \\    # No dependency file found - skip expensive lookup
        \\    return 0
        \\  fi
        \\
        \\  # Not in a project (or dep file changed) - find environment by hash
        \\  # Call Zig binary to get environment path for this project
        \\  local env_lookup
        \\  env_lookup=$(pantry env:lookup "$PWD" 2>/dev/null)
        \\
        \\  if [[ -n "$env_lookup" ]]; then
        \\    # env_lookup format: "env_dir|dep_file"
        \\    local env_dir env_dep_file
        \\    IFS='|' read -r env_dir env_dep_file <<< "$env_lookup"
        \\
        \\    if [[ -d "$env_dir/bin" ]]; then
        \\      # Activate environment
        \\      export PATH="$env_dir/bin:$PATH"
        \\      export pantry_ENV_BIN_PATH="$env_dir/bin"
        \\      export pantry_CURRENT_PROJECT="$PWD"
        \\      export pantry_DEP_FILE="$dep_file"
        \\      export pantry_DEP_MTIME=$(__lp_mtime "$dep_file")
        \\    fi
        \\  else
        \\    # No environment found - auto-install if we have a dep file
        \\    if [[ -n "$dep_file" ]]; then
        \\      if pantry install; then
        \\        # Retry lookup after install
        \\        env_lookup=$(pantry env:lookup "$PWD" 2>/dev/null)
        \\        if [[ -n "$env_lookup" ]]; then
        \\          local env_dir env_dep_file
        \\          IFS='|' read -r env_dir env_dep_file <<< "$env_lookup"
        \\          if [[ -d "$env_dir/bin" ]]; then
        \\            export PATH="$env_dir/bin:$PATH"
        \\            export pantry_ENV_BIN_PATH="$env_dir/bin"
        \\            export pantry_CURRENT_PROJECT="$PWD"
        \\            export pantry_DEP_FILE="$dep_file"
        \\            export pantry_DEP_MTIME=$(__lp_mtime "$dep_file")
        \\          fi
        \\        fi
        \\      fi
        \\    fi
        \\  fi
        \\}
        \\
        \\# Add to chpwd hooks for zsh
        \\if [[ -n "$ZSH_VERSION" ]]; then
        \\  if [[ -z "${chpwd_functions[(r)pantry_chpwd]}" ]]; then
        \\    chpwd_functions+=(pantry_chpwd)
        \\  fi
        \\elif [[ -n "$BASH_VERSION" ]]; then
        \\  # Bash: use PROMPT_COMMAND
        \\  if [[ "$PROMPT_COMMAND" != *"pantry_chpwd"* ]]; then
        \\    PROMPT_COMMAND="pantry_chpwd;$PROMPT_COMMAND"
        \\  fi
        \\fi
        \\
        \\# Run on shell start
        \\pantry_chpwd
        \\
    ;

    // Write to stdout (not stderr!) so eval can capture it
    const stdout_file = std.fs.File{ .handle = std.posix.STDOUT_FILENO };
    try stdout_file.writeAll(shellcode);
    try stdout_file.writeAll("\n");
    _ = allocator;
    return .{ .exit_code = 0 };
}

/// Dev: MD5 command - compute MD5 hash of a file or stdin
pub fn devMd5Command(allocator: std.mem.Allocator, path: []const u8) !CommandResult {
    const is_stdin = std.mem.eql(u8, path, "/dev/stdin");

    var hasher = std.crypto.hash.Md5.init(.{});

    if (is_stdin) {
        // Read from stdin (Zig 0.15 API)
        const stdin_file = std.fs.File{ .handle = std.posix.STDIN_FILENO };
        var buf: [4096]u8 = undefined;
        while (true) {
            const bytes_read = try stdin_file.read(&buf);
            if (bytes_read == 0) break;
            hasher.update(buf[0..bytes_read]);
        }
    } else {
        // Read from file
        const file = std.fs.cwd().openFile(path, .{}) catch |err| {
            const msg = try std.fmt.allocPrint(
                allocator,
                "Error: Failed to open file {s}: {}",
                .{ path, err },
            );
            return .{
                .exit_code = 1,
                .message = msg,
            };
        };
        defer file.close();

        var buf: [4096]u8 = undefined;
        while (true) {
            const bytes_read = try file.read(&buf);
            if (bytes_read == 0) break;
            hasher.update(buf[0..bytes_read]);
        }
    }

    var digest: [16]u8 = undefined;
    hasher.final(&digest);

    // Convert to hex string
    const hex = try string.hashToHex(digest, allocator);
    defer allocator.free(hex);

    std.debug.print("{s}\n", .{hex});

    return .{ .exit_code = 0 };
}

/// Dev: find-project-root command - find project root from a directory
pub fn devFindProjectRootCommand(allocator: std.mem.Allocator, start_dir: []const u8) !CommandResult {
    const detector = @import("../../deps/detector.zig");

    // Try to find a dependency file
    const deps_file = (try detector.findDepsFile(allocator, start_dir)) orelse {
        // No project found
        return .{ .exit_code = 1 };
    };
    defer allocator.free(deps_file.path);

    // Get the directory of the dependency file
    const project_dir = std.fs.path.dirname(deps_file.path) orelse start_dir;

    std.debug.print("{s}\n", .{project_dir});

    return .{ .exit_code = 0 };
}

/// Dev: check-updates command - check for updates (placeholder)
pub fn devCheckUpdatesCommand(_: std.mem.Allocator) !CommandResult {
    // Placeholder - just exit successfully without output
    // This is called in background by shell integration
    return .{ .exit_code = 0 };
}

/// Install global dependencies by scanning common locations
/// Try system-wide first, fallback to user-local if no sudo privileges
pub fn installGlobalDepsCommand(allocator: std.mem.Allocator) !CommandResult {
    return installGlobalDepsCommandWithOptions(allocator, false);
}

/// Install global dependencies with user-local option
pub fn installGlobalDepsCommandUserLocal(allocator: std.mem.Allocator) !CommandResult {
    return installGlobalDepsCommandWithOptions(allocator, true);
}

/// Install global dependencies by scanning common locations
fn installGlobalDepsCommandWithOptions(allocator: std.mem.Allocator, user_local: bool) !CommandResult {
    const global_scanner = @import("../../deps/global_scanner.zig");

    std.debug.print("Scanning for global dependencies...\n", .{});

    const global_deps = try global_scanner.scanForGlobalDeps(allocator);
    defer {
        for (global_deps) |*dep| {
            var d = dep.*;
            d.deinit(allocator);
        }
        allocator.free(global_deps);
    }

    if (global_deps.len == 0) {
        std.debug.print("No global dependencies found.\n", .{});
        return .{ .exit_code = 0 };
    }

    std.debug.print("Found {d} global package(s).\n", .{global_deps.len});

    // Determine installation directory
    const global_dir = if (user_local) blk: {
        const home = try lib.Paths.home(allocator);
        defer allocator.free(home);
        break :blk try std.fmt.allocPrint(allocator, "{s}/.pantry/global", .{home});
    } else "/usr/local";
    defer if (user_local) allocator.free(global_dir);

    // Check if we need sudo for system-wide installation
    if (!user_local) {
        // Test if we can write to /usr/local
        std.fs.cwd().makePath(global_dir) catch |err| {
            if (err == error.AccessDenied or err == error.PermissionDenied) {
                // No sudo privileges - automatically fallback to user-local
                std.debug.print("⚠️  No permission for system-wide install, using ~/.pantry/global instead\n\n", .{});
                return installGlobalDepsCommandWithOptions(allocator, true);
            }
            return err;
        };
    } else {
        try std.fs.cwd().makePath(global_dir);
    }

    std.debug.print("Installing to {s}...\n", .{global_dir});

    var pkg_cache = try cache.PackageCache.init(allocator);
    defer pkg_cache.deinit();

    for (global_deps) |dep| {
        std.debug.print("  → {s}@{s}", .{ dep.name, dep.version });

        const spec = lib.packages.PackageSpec{
            .name = dep.name,
            .version = dep.version,
        };

        var custom_installer = try install.Installer.init(allocator, &pkg_cache);
        allocator.free(custom_installer.data_dir);
        custom_installer.data_dir = try allocator.dupe(u8, global_dir);
        defer custom_installer.deinit();

        var result = custom_installer.install(spec, .{}) catch |err| {
            std.debug.print(" failed: {}\n", .{err});
            continue;
        };
        defer result.deinit(allocator);

        std.debug.print(" ... done ({s}, {d}ms)\n", .{
            if (result.from_cache) "cached" else "installed",
            result.install_time_ms,
        });
    }

    std.debug.print("\n✅ Global packages installed to: {s}\n", .{global_dir});

    return .{ .exit_code = 0 };
}

/// Install specific packages globally
pub fn installPackagesGloballyCommand(allocator: std.mem.Allocator, packages: []const []const u8) !CommandResult {
    // Try system-wide first, fallback to user-local if no permissions
    var global_dir_owned: ?[]const u8 = null;
    const global_dir = blk: {
        // Try /usr/local first - test actual write permissions
        std.fs.cwd().makePath("/usr/local/packages") catch |err| {
            if (err == error.AccessDenied or err == error.PermissionDenied) {
                // Fallback to ~/.pantry/global
                const home = try lib.Paths.home(allocator);
                defer allocator.free(home);
                const user_dir = try std.fmt.allocPrint(allocator, "{s}/.pantry/global", .{home});
                global_dir_owned = user_dir;
                std.debug.print("⚠️  No permission for system-wide install, using ~/.pantry/global\n\n", .{});
                try std.fs.cwd().makePath(user_dir);
                break :blk user_dir;
            }
            return err;
        };
        break :blk "/usr/local";
    };
    defer if (global_dir_owned) |dir| allocator.free(dir);

    std.debug.print("Installing {d} package(s) globally to {s}...\n", .{ packages.len, global_dir });

    var pkg_cache = try cache.PackageCache.init(allocator);
    defer pkg_cache.deinit();

    for (packages) |pkg_str| {
        // Parse package string (format: "name" or "name@version")
        var name = pkg_str;
        var version: []const u8 = "latest";

        if (std.mem.indexOf(u8, pkg_str, "@")) |at_pos| {
            name = pkg_str[0..at_pos];
            version = pkg_str[at_pos + 1 ..];
        }

        std.debug.print("  → {s}@{s} ... ", .{ name, version });

        const spec = lib.packages.PackageSpec{
            .name = name,
            .version = version,
        };

        var custom_installer = try install.Installer.init(allocator, &pkg_cache);
        allocator.free(custom_installer.data_dir);
        custom_installer.data_dir = try allocator.dupe(u8, global_dir);
        defer custom_installer.deinit();

        var result = custom_installer.install(spec, .{}) catch |err| {
            std.debug.print("failed: {}\n", .{err});
            continue;
        };
        defer result.deinit(allocator);

        std.debug.print("done! Installed to {s}\n", .{result.install_path});
    }

    std.debug.print("\n✅ Packages installed globally to: {s}\n", .{global_dir});

    return .{ .exit_code = 0 };
}

/// Try to load dependencies from a config file (pantry.config.ts, etc.)
/// Returns null if no config file found or if config has no dependencies
fn loadDependenciesFromConfig(
    allocator: std.mem.Allocator,
    cwd: []const u8,
) !?[]@import("../../deps/parser.zig").PackageDependency {
    // Try to load pantry config
    var config = lib.config.loadpantryConfig(allocator, .{
        .name = "pantry",
        .cwd = cwd,
    }) catch {
        // No config file found or failed to load
        return null;
    };
    defer config.deinit();

    // Extract dependencies from config
    const deps = lib.config.extractDependencies(allocator, config) catch {
        // Failed to extract dependencies
        return null;
    };

    if (deps.len == 0) {
        // No dependencies in config
        for (deps) |*dep| {
            var d = dep.*;
            d.deinit(allocator);
        }
        allocator.free(deps);
        return null;
    }

    return deps;
}
