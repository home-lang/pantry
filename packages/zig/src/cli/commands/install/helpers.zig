//! Install Command Helper Functions
//!
//! Utility functions used across install command implementations.

const std = @import("std");
const lib = @import("../../../lib.zig");
const io_helper = @import("../../../io_helper.zig");
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
/// TODO: Re-enable when std.Io.Group API stabilizes
pub fn installPackageWorker(task_ptr: *types.InstallTask) void {
    // defer task_ptr.wg.finish(); // Removed - std.Thread.WaitGroup deprecated
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
    const start_time = @as(i64, @intCast((std.posix.clock_gettime(.REALTIME) catch std.posix.timespec{ .sec = 0, .nsec = 0 }).sec * 1000));

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

    // Check if this is a zig dev version (should use ziglang.org instead of pkgx)
    const is_zig_package = std.mem.eql(u8, dep.name, "zig") or
        std.mem.eql(u8, dep.name, "ziglang") or
        std.mem.eql(u8, dep.name, "ziglang.org");
    const is_zig_dev = lib.install.downloader.isZigDevVersion(dep.version);

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
    } else if (is_zig_package and is_zig_dev) blk: {
        // Zig dev version - use ziglang.org source
        break :blk lib.packages.PackageSpec{
            .name = "zig",
            .version = dep.version,
            .source = .ziglang,
        };
    } else blk: {
        // Regular registry package
        if (pkg_info == null) {
            return .{
                .name = dep.name,
                .version = dep.version,
                .success = false,
                .error_msg = try std.fmt.allocPrint(
                    allocator,
                    "not found in registry (npm packages not yet supported). Try: pantry search {s}",
                    .{dep.name},
                ),
                .install_time_ms = 0,
            };
        }

        break :blk lib.packages.PackageSpec{
            .name = dep.name,
            .version = dep.version,
        };
    };

    // Check offline mode first
    const offline_mod = @import("../../../install/offline.zig");
    const recovery_mod = @import("../../../install/recovery.zig");

    const is_offline = offline_mod.isOfflineMode();

    // Try installing from cache if offline
    if (is_offline) {
        const dest_dir = try std.fs.path.join(allocator, &[_][]const u8{ proj_dir, "pantry", dep.name });
        defer allocator.free(dest_dir);

        const cache_success = offline_mod.installFromCache(
            allocator,
            dep.name,
            dep.version,
            dest_dir,
        ) catch false;

        if (cache_success) {
            const end_time = @as(i64, @intCast((std.posix.clock_gettime(.REALTIME) catch std.posix.timespec{ .sec = 0, .nsec = 0 }).sec * 1000));
            return .{
                .name = dep.name,
                .version = try allocator.dupe(u8, dep.version),
                .success = true,
                .error_msg = null,
                .install_time_ms = @intCast(end_time - start_time),
            };
        } else if (is_offline) {
            // Offline mode, but package not in cache
            const error_msg = try std.fmt.allocPrint(
                allocator,
                "Package not in cache (offline mode)",
                .{},
            );
            return .{
                .name = dep.name,
                .version = dep.version,
                .success = false,
                .error_msg = error_msg,
                .install_time_ms = 0,
            };
        }
    }

    // Create installer with project_root option for local installs
    var custom_installer = try install.Installer.init(allocator, pkg_cache);
    allocator.free(custom_installer.data_dir);
    custom_installer.data_dir = try allocator.dupe(u8, env_dir);
    defer custom_installer.deinit();

    // Install to project's pantry directory (quiet mode for clean output)
    var inst_result = custom_installer.install(spec, .{
        .project_root = proj_dir,
        .quiet = true,
    }) catch |err| {
        // Provide recovery suggestions on error
        const suggestion = try recovery_mod.RecoverySuggestion.suggest(
            allocator,
            err,
            try std.fmt.allocPrint(allocator, "Failed to install {s}@{s}", .{ dep.name, dep.version }),
        );
        defer if (suggestion.message.len > 0) allocator.free(suggestion.message);

        // Always print suggestions for package not found (even in quiet mode)
        const is_package_not_found = switch (err) {
            error.PackageNotFound => true,
            else => false,
        };

        if (!options.quiet or is_package_not_found) {
            suggestion.print();
        }

        // Provide human-readable error messages
        const error_msg = if (is_package_not_found)
            try std.fmt.allocPrint(allocator, "not found in registry (npm packages not yet supported)", .{})
        else
            try std.fmt.allocPrint(allocator, "failed: {}", .{err});

        return .{
            .name = dep.name,
            .version = dep.version,
            .success = false,
            .error_msg = error_msg,
            .install_time_ms = 0,
        };
    };

    // Duplicate the version and install path strings before deinit
    const installed_version = try allocator.dupe(u8, inst_result.version);
    const actual_install_path = try allocator.dupe(u8, inst_result.install_path);
    defer allocator.free(actual_install_path);
    inst_result.deinit(allocator);

    // Run postinstall lifecycle script if enabled
    const package_path = try std.fs.path.join(allocator, &[_][]const u8{ proj_dir, "pantry", dep.name });
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

    const end_time = @as(i64, @intCast((std.posix.clock_gettime(.REALTIME) catch std.posix.timespec{ .sec = 0, .nsec = 0 }).sec * 1000));

    _ = bin_dir;
    _ = cwd;

    // Create symlinks in pantry/.bin for package executables
    // Use actual_install_path which has the real location (e.g., pantry/github.com/org/pkg/v1.0.0)
    createBinSymlinks(allocator, proj_dir, actual_install_path, options.verbose) catch |err| {
        if (options.verbose) {
            std.debug.print("    ⚠️  Could not create bin symlinks for {s}: {}\n", .{ dep.name, err });
        }
    };

    return .{
        .name = dep.name,
        .version = installed_version,
        .success = true,
        .error_msg = null,
        .install_time_ms = @intCast(end_time - start_time),
    };
}

/// Create symlinks in pantry/.bin for executables in the installed package
/// Called from core.zig after direct package install
pub fn createBinSymlinksFromInstall(allocator: std.mem.Allocator, proj_dir: []const u8, package_path: []const u8) !void {
    return createBinSymlinks(allocator, proj_dir, package_path, false);
}

fn createBinSymlinks(allocator: std.mem.Allocator, proj_dir: []const u8, package_path: []const u8, verbose: bool) !void {
    // Create pantry/.bin directory
    const bin_link_dir = try std.fs.path.join(allocator, &[_][]const u8{ proj_dir, "pantry", ".bin" });
    defer allocator.free(bin_link_dir);
    try io_helper.makePath(bin_link_dir);

    // Find bin directory in package - could be at different locations
    // Try: {package_path}/bin, or search for bin subdirectory
    const possible_bin_paths = [_][]const u8{
        "bin",
    };

    for (possible_bin_paths) |bin_subpath| {
        const pkg_bin_dir = try std.fs.path.join(allocator, &[_][]const u8{ package_path, bin_subpath });
        defer allocator.free(pkg_bin_dir);

        // Try to iterate the bin directory
        if (io_helper.openDirAbsoluteForIteration(pkg_bin_dir)) |dir_val| {
            var dir = dir_val;
            defer dir.close();
            var iter = dir.iterate();

            while (iter.next() catch null) |entry| {
                if (entry.kind == .file or entry.kind == .sym_link) {
                    const bin_src = try std.fs.path.join(allocator, &[_][]const u8{ pkg_bin_dir, entry.name });
                    defer allocator.free(bin_src);
                    const bin_dst = try std.fs.path.join(allocator, &[_][]const u8{ bin_link_dir, entry.name });
                    defer allocator.free(bin_dst);

                    // Remove existing symlink if present
                    io_helper.deleteFile(bin_dst) catch {};
                    // Create new symlink
                    io_helper.symLink(bin_src, bin_dst) catch |err| {
                        if (verbose) {
                            std.debug.print("    ⚠️  Failed to create symlink {s} -> {s}: {}\n", .{ bin_dst, bin_src, err });
                        }
                    };
                }
            }
            return; // Found and processed bin directory
        } else |_| {
            continue; // Try next possible location
        }
    }

    // Also search for versioned bin directories (e.g., github.com/org/pkg/v1.2.3/bin)
    // Walk the package directory tree to find bin folders
    try findAndLinkBinDirs(allocator, package_path, bin_link_dir, verbose);
}

/// Make a file executable (chmod +x)
fn makeExecutable(path: []const u8) void {
    // Use child process to chmod
    var child = std.process.Child.init(&.{ "chmod", "+x", path }, std.heap.page_allocator);
    io_helper.spawn(&child) catch return;
    _ = io_helper.wait(&child) catch {};
}

/// Recursively search for bin directories and create symlinks
fn findAndLinkBinDirs(allocator: std.mem.Allocator, search_path: []const u8, bin_link_dir: []const u8, verbose: bool) !void {
    var dir = io_helper.openDirAbsoluteForIteration(search_path) catch return;
    defer dir.close();

    var iter = dir.iterate();
    while (iter.next() catch null) |entry| {
        if (entry.kind == .directory) {
            const subpath = try std.fs.path.join(allocator, &[_][]const u8{ search_path, entry.name });
            defer allocator.free(subpath);

            if (std.mem.eql(u8, entry.name, "bin")) {
                // Found a bin directory - symlink its contents
                var bin_dir = io_helper.openDirAbsoluteForIteration(subpath) catch continue;
                defer bin_dir.close();

                var bin_iter = bin_dir.iterate();
                while (bin_iter.next() catch null) |bin_entry| {
                    if (bin_entry.kind == .file or bin_entry.kind == .sym_link) {
                        const bin_src = try std.fs.path.join(allocator, &[_][]const u8{ subpath, bin_entry.name });
                        defer allocator.free(bin_src);
                        const bin_dst = try std.fs.path.join(allocator, &[_][]const u8{ bin_link_dir, bin_entry.name });
                        defer allocator.free(bin_dst);

                        // Make source executable
                        makeExecutable(bin_src);

                        io_helper.deleteFile(bin_dst) catch {};
                        io_helper.symLink(bin_src, bin_dst) catch |err| {
                            if (verbose) {
                                std.debug.print("    ⚠️  Failed to create symlink {s} -> {s}: {}\n", .{ bin_dst, bin_src, err });
                            }
                        };
                    }
                }
            } else {
                // Recurse into subdirectory
                try findAndLinkBinDirs(allocator, subpath, bin_link_dir, verbose);
            }
        }
    }
}

/// Update package.json with a new dependency
/// Creates package.json if it doesn't exist
pub fn addDependencyToPackageJson(
    allocator: std.mem.Allocator,
    project_root: []const u8,
    pkg_name: []const u8,
    pkg_version: []const u8,
    is_dev: bool,
) !void {
    const package_json_path = try std.fs.path.join(allocator, &[_][]const u8{ project_root, "package.json" });
    defer allocator.free(package_json_path);

    // Data structures to hold the package.json content
    var name: []const u8 = "my-project";
    var version: []const u8 = "1.0.0";
    var deps = std.StringHashMap([]const u8).init(allocator);
    defer deps.deinit();
    var dev_deps = std.StringHashMap([]const u8).init(allocator);
    defer dev_deps.deinit();
    var has_existing_file = false;

    // Try to read existing package.json
    if (io_helper.readFileAlloc(allocator, package_json_path, 1024 * 1024)) |content| {
        defer allocator.free(content);
        has_existing_file = true;

        if (std.json.parseFromSlice(std.json.Value, allocator, content, .{})) |parsed| {
            defer parsed.deinit();

            if (parsed.value == .object) {
                // Extract name
                if (parsed.value.object.get("name")) |v| {
                    if (v == .string) name = try allocator.dupe(u8, v.string);
                }
                // Extract version
                if (parsed.value.object.get("version")) |v| {
                    if (v == .string) version = try allocator.dupe(u8, v.string);
                }
                // Extract dependencies
                if (parsed.value.object.get("dependencies")) |deps_val| {
                    if (deps_val == .object) {
                        var iter = deps_val.object.iterator();
                        while (iter.next()) |entry| {
                            if (entry.value_ptr.* == .string) {
                                try deps.put(
                                    try allocator.dupe(u8, entry.key_ptr.*),
                                    try allocator.dupe(u8, entry.value_ptr.string),
                                );
                            }
                        }
                    }
                }
                // Extract devDependencies
                if (parsed.value.object.get("devDependencies")) |deps_val| {
                    if (deps_val == .object) {
                        var iter = deps_val.object.iterator();
                        while (iter.next()) |entry| {
                            if (entry.value_ptr.* == .string) {
                                try dev_deps.put(
                                    try allocator.dupe(u8, entry.key_ptr.*),
                                    try allocator.dupe(u8, entry.value_ptr.string),
                                );
                            }
                        }
                    }
                }
            }
        } else |_| {
            // Invalid JSON, start fresh
        }
    } else |_| {
        // No package.json exists
    }

    // Format version with caret for semver compatibility
    const version_with_caret = try std.fmt.allocPrint(allocator, "^{s}", .{pkg_version});

    // Add new dependency to appropriate section
    if (is_dev) {
        // Free old value if exists
        if (dev_deps.get(pkg_name)) |old_val| {
            allocator.free(old_val);
        }
        try dev_deps.put(try allocator.dupe(u8, pkg_name), version_with_caret);
    } else {
        // Free old value if exists
        if (deps.get(pkg_name)) |old_val| {
            allocator.free(old_val);
        }
        try deps.put(try allocator.dupe(u8, pkg_name), version_with_caret);
    }

    // Build JSON output manually
    var buf = try std.ArrayList(u8).initCapacity(allocator, 1024);
    defer buf.deinit(allocator);

    try buf.appendSlice(allocator, "{\n");
    {
        const line = try std.fmt.allocPrint(allocator, "  \"name\": \"{s}\",\n", .{name});
        defer allocator.free(line);
        try buf.appendSlice(allocator, line);
    }
    {
        const line = try std.fmt.allocPrint(allocator, "  \"version\": \"{s}\"", .{version});
        defer allocator.free(line);
        try buf.appendSlice(allocator, line);
    }

    // Write dependencies if any
    if (deps.count() > 0) {
        try buf.appendSlice(allocator, ",\n  \"dependencies\": {\n");
        var iter = deps.iterator();
        var first = true;
        while (iter.next()) |entry| {
            if (!first) {
                try buf.appendSlice(allocator, ",\n");
            }
            first = false;
            const line = try std.fmt.allocPrint(allocator, "    \"{s}\": \"{s}\"", .{ entry.key_ptr.*, entry.value_ptr.* });
            defer allocator.free(line);
            try buf.appendSlice(allocator, line);
        }
        try buf.appendSlice(allocator, "\n  }");
    }

    // Write devDependencies if any
    if (dev_deps.count() > 0) {
        try buf.appendSlice(allocator, ",\n  \"devDependencies\": {\n");
        var iter = dev_deps.iterator();
        var first = true;
        while (iter.next()) |entry| {
            if (!first) {
                try buf.appendSlice(allocator, ",\n");
            }
            first = false;
            const line = try std.fmt.allocPrint(allocator, "    \"{s}\": \"{s}\"", .{ entry.key_ptr.*, entry.value_ptr.* });
            defer allocator.free(line);
            try buf.appendSlice(allocator, line);
        }
        try buf.appendSlice(allocator, "\n  }");
    }

    try buf.appendSlice(allocator, "\n}\n");

    // Write to file
    const file = try io_helper.cwd().createFile(io_helper.io, package_json_path, .{});
    defer file.close(io_helper.io);
    try io_helper.writeAllToFile(file, buf.items);

    // Clean up allocated strings
    if (has_existing_file) {
        if (!std.mem.eql(u8, name, "my-project")) allocator.free(name);
        if (!std.mem.eql(u8, version, "1.0.0")) allocator.free(version);
    }

    // Clean up deps maps
    var deps_iter = deps.iterator();
    while (deps_iter.next()) |entry| {
        allocator.free(entry.key_ptr.*);
        allocator.free(entry.value_ptr.*);
    }
    var dev_deps_iter = dev_deps.iterator();
    while (dev_deps_iter.next()) |entry| {
        allocator.free(entry.key_ptr.*);
        allocator.free(entry.value_ptr.*);
    }
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
