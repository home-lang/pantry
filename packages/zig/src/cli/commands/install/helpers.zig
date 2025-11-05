//! Install Command Helper Functions
//!
//! Utility functions used across install command implementations.

const std = @import("std");
const lib = @import("../../../lib.zig");
const types = @import("types.zig");
const cache = lib.cache;
const install = lib.install;

/// Check if a version string is a local filesystem path
pub fn isLocalPath(version: []const u8) bool {
    return std.mem.startsWith(u8, version, "~/") or
        std.mem.startsWith(u8, version, "./") or
        std.mem.startsWith(u8, version, "../") or
        std.mem.startsWith(u8, version, "/");
}

/// Check if a dependency is local (either has local: prefix or is a filesystem path)
pub fn isLocalDependency(dep: lib.deps.parser.PackageDependency) bool {
    return std.mem.startsWith(u8, dep.name, "local:") or
        std.mem.startsWith(u8, dep.name, "auto:") or
        isLocalPath(dep.version);
}

/// Strip display prefixes like "auto:" and "local:" from package names for output
pub fn stripDisplayPrefix(name: []const u8) []const u8 {
    if (std.mem.startsWith(u8, name, "auto:")) {
        return name[5..]; // Skip "auto:"
    } else if (std.mem.startsWith(u8, name, "local:")) {
        return name[6..]; // Skip "local:"
    }
    return name;
}

/// Worker function for concurrent package installation
pub fn installPackageWorker(task_ptr: *types.InstallTask) void {
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
        task_ptr.options,
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
pub fn installSinglePackage(
    allocator: std.mem.Allocator,
    dep: lib.deps.parser.PackageDependency,
    proj_dir: []const u8,
    env_dir: []const u8,
    bin_dir: []const u8,
    cwd: []const u8,
    pkg_cache: *cache.PackageCache,
    options: types.InstallOptions,
) !types.InstallTaskResult {
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
    const pkg_registry = @import("../../../packages/generated.zig");
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

    // Run postinstall lifecycle script if enabled
    const package_path = try std.fs.path.join(allocator, &[_][]const u8{ proj_dir, "pantry_modules", dep.name });
    defer allocator.free(package_path);

    if (!options.ignore_scripts) {
        const lifecycle_options = lib.lifecycle.ScriptOptions{
            .cwd = package_path,
            .ignore_scripts = options.ignore_scripts,
            .verbose = options.verbose,
        };

        // Run postinstall script
        if (try lib.lifecycle.runLifecycleScript(
            allocator,
            dep.name,
            .postinstall,
            package_path,
            lifecycle_options,
        )) |script_result| {
            var result = script_result;
            defer result.deinit(allocator);

            if (!result.success) {
                const error_msg = try std.fmt.allocPrint(
                    allocator,
                    "postinstall script failed (exit code {d})",
                    .{result.exit_code},
                );
                allocator.free(installed_version);
                return .{
                    .name = dep.name,
                    .version = "",
                    .success = false,
                    .error_msg = error_msg,
                    .install_time_ms = 0,
                };
            }
        }
    }

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

/// Try to load dependencies from a config file (pantry.config.ts, etc.)
/// Returns null if no config file found or if config has no dependencies
pub fn loadDependenciesFromConfig(
    allocator: std.mem.Allocator,
    cwd: []const u8,
) !?[]lib.deps.parser.PackageDependency {
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
