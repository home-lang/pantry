//! Install Command Helper Functions
//!
//! Utility functions used across install command implementations.

const std = @import("std");
const lib = @import("../../../lib.zig");
const io_helper = @import("../../../io_helper.zig");
const types = @import("types.zig");
const cache = lib.cache;
const install = lib.install;

// ============================================================================
// Pantry Registry Lookup (S3/DynamoDB)
// ============================================================================

pub const PantryPackageInfo = struct {
    s3_path: []const u8,
    version: []const u8,
    tarball_url: []const u8,

    pub fn deinit(self: *PantryPackageInfo, allocator: std.mem.Allocator) void {
        allocator.free(self.s3_path);
        allocator.free(self.version);
        allocator.free(self.tarball_url);
    }
};

/// Look up a package in the Pantry DynamoDB registry.
/// Returns package info if found, null if not found or query fails.
pub fn lookupPantryRegistry(allocator: std.mem.Allocator, name: []const u8) !?PantryPackageInfo {
    const table_name = "pantry-packages";

    // Build DynamoDB key JSON
    const key_json = try std.fmt.allocPrint(allocator, "{{\"packageName\": {{\"S\": \"{s}\"}}}}", .{name});
    defer allocator.free(key_json);

    // Query DynamoDB
    const result = io_helper.childRun(allocator, &[_][]const u8{
        "aws",
        "dynamodb",
        "get-item",
        "--table-name",
        table_name,
        "--key",
        key_json,
        "--projection-expression",
        "s3Path, latestVersion, safeName",
    }) catch {
        return null;
    };
    defer allocator.free(result.stdout);
    defer allocator.free(result.stderr);

    if (result.term != .exited or result.term.exited != 0) {
        return null;
    }

    if (result.stdout.len == 0) return null;

    // Parse DynamoDB response
    const parsed = std.json.parseFromSlice(std.json.Value, allocator, result.stdout, .{}) catch {
        return null;
    };
    defer parsed.deinit();

    const root = parsed.value;
    if (root != .object) return null;

    const item = root.object.get("Item") orelse return null;
    if (item != .object) return null;
    if (item.object.count() == 0) return null;

    // Extract s3Path
    const s3_path_obj = item.object.get("s3Path") orelse return null;
    if (s3_path_obj != .object) return null;
    const s3_path = if (s3_path_obj.object.get("S")) |v|
        if (v == .string) v.string else return null
    else
        return null;

    // Extract latestVersion
    const version_obj = item.object.get("latestVersion") orelse return null;
    if (version_obj != .object) return null;
    const version = if (version_obj.object.get("S")) |v|
        if (v == .string) v.string else return null
    else
        return null;

    // Build S3 tarball URL
    const tarball_url = try std.fmt.allocPrint(
        allocator,
        "https://pantry-registry.s3.us-east-1.amazonaws.com/{s}",
        .{s3_path},
    );

    return PantryPackageInfo{
        .s3_path = try allocator.dupe(u8, s3_path),
        .version = try allocator.dupe(u8, version),
        .tarball_url = tarball_url,
    };
}

// ============================================================================
// Install Helpers
// ============================================================================

/// Check if a version string is a local filesystem path
pub fn isLocalPath(version: []const u8) bool {
    return std.mem.startsWith(u8, version, "~/") or
        std.mem.startsWith(u8, version, "./") or
        std.mem.startsWith(u8, version, "../") or
        std.mem.startsWith(u8, version, "/");
}

/// Check if a version string is a link: dependency
pub fn isLinkDependency(version: []const u8) bool {
    return std.mem.startsWith(u8, version, "link:");
}

/// Check if a dependency is local (either has local: prefix, is a filesystem path, or is a link:)
pub fn isLocalDependency(dep: lib.deps.parser.PackageDependency) bool {
    return std.mem.startsWith(u8, dep.name, "local:") or
        std.mem.startsWith(u8, dep.name, "auto:") or
        isLinkDependency(dep.version) or
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

/// Resolve a `link:` version string to its actual filesystem path.
/// Reads the symlink at `~/.pantry/links/{name}` to find the real path.
/// Returns null if the link is not registered.
pub fn resolveLinkVersion(allocator: std.mem.Allocator, version: []const u8) !?[]const u8 {
    if (!isLinkDependency(version)) return null;
    const link_name = version[5..]; // Skip "link:"
    const link_cmds = @import("../link.zig");
    return try link_cmds.resolveLinkPath(allocator, link_name);
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
        // Regular registry package - check pantry built-in, then Pantry S3 registry, then npm
        if (pkg_info == null) {
            // Try Pantry S3/DynamoDB registry first
            if (lookupPantryRegistry(allocator, dep.name) catch null) |info| {
                var pantry_info = info;
                defer pantry_info.deinit(allocator);

                break :blk lib.packages.PackageSpec{
                    .name = dep.name,
                    .version = try allocator.dupe(u8, pantry_info.version),
                    .source = .npm,
                    .url = try allocator.dupe(u8, pantry_info.tarball_url),
                };
            }

            // Fall back to npm registry using curl
            const npm_url = try std.fmt.allocPrint(allocator, "https://registry.npmjs.org/{s}", .{dep.name});
            defer allocator.free(npm_url);

            const curl_result = io_helper.childRun(allocator, &[_][]const u8{
                "curl",
                "-sL",
                npm_url,
            }) catch {
                return .{
                    .name = dep.name,
                    .version = dep.version,
                    .success = false,
                    .error_msg = try std.fmt.allocPrint(allocator, "not found in pantry registry and failed to connect to npm", .{}),
                    .install_time_ms = 0,
                };
            };
            defer allocator.free(curl_result.stdout);
            defer allocator.free(curl_result.stderr);

            if (curl_result.term.exited != 0 or curl_result.stdout.len == 0) {
                return .{
                    .name = dep.name,
                    .version = dep.version,
                    .success = false,
                    .error_msg = try std.fmt.allocPrint(allocator, "not found in pantry or npm registry", .{}),
                    .install_time_ms = 0,
                };
            }

            // Parse npm response to get version and tarball URL
            const parsed = std.json.parseFromSlice(std.json.Value, allocator, curl_result.stdout, .{}) catch {
                return .{
                    .name = dep.name,
                    .version = dep.version,
                    .success = false,
                    .error_msg = try std.fmt.allocPrint(allocator, "failed to parse npm registry response", .{}),
                    .install_time_ms = 0,
                };
            };
            defer parsed.deinit();

            if (parsed.value != .object) {
                return .{
                    .name = dep.name,
                    .version = dep.version,
                    .success = false,
                    .error_msg = try std.fmt.allocPrint(allocator, "invalid npm registry response", .{}),
                    .install_time_ms = 0,
                };
            }

            // Get the version to install
            const target_version = if (std.mem.eql(u8, dep.version, "latest")) version_blk: {
                // Get latest from dist-tags
                const dist_tags = parsed.value.object.get("dist-tags") orelse break :version_blk null;
                if (dist_tags != .object) break :version_blk null;
                const latest = dist_tags.object.get("latest") orelse break :version_blk null;
                if (latest != .string) break :version_blk null;
                break :version_blk latest.string;
            } else dep.version;

            if (target_version == null) {
                return .{
                    .name = dep.name,
                    .version = dep.version,
                    .success = false,
                    .error_msg = try std.fmt.allocPrint(allocator, "could not determine version from npm", .{}),
                    .install_time_ms = 0,
                };
            }

            // Get tarball URL from versions object
            const versions_obj = parsed.value.object.get("versions") orelse {
                return .{
                    .name = dep.name,
                    .version = dep.version,
                    .success = false,
                    .error_msg = try std.fmt.allocPrint(allocator, "no versions found in npm response", .{}),
                    .install_time_ms = 0,
                };
            };

            if (versions_obj != .object) {
                return .{
                    .name = dep.name,
                    .version = dep.version,
                    .success = false,
                    .error_msg = try std.fmt.allocPrint(allocator, "invalid versions in npm response", .{}),
                    .install_time_ms = 0,
                };
            }

            const version_data = versions_obj.object.get(target_version.?) orelse {
                return .{
                    .name = dep.name,
                    .version = dep.version,
                    .success = false,
                    .error_msg = try std.fmt.allocPrint(allocator, "version {s} not found in npm", .{target_version.?}),
                    .install_time_ms = 0,
                };
            };

            if (version_data != .object) {
                return .{
                    .name = dep.name,
                    .version = dep.version,
                    .success = false,
                    .error_msg = try std.fmt.allocPrint(allocator, "invalid version data in npm response", .{}),
                    .install_time_ms = 0,
                };
            }

            // Get tarball URL from dist object
            var tarball_url: ?[]const u8 = null;
            if (version_data.object.get("dist")) |dist| {
                if (dist == .object) {
                    if (dist.object.get("tarball")) |tarball| {
                        if (tarball == .string) {
                            tarball_url = try allocator.dupe(u8, tarball.string);
                        }
                    }
                }
            }

            // Found in npm - create spec with npm source
            break :blk lib.packages.PackageSpec{
                .name = dep.name,
                .version = try allocator.dupe(u8, target_version.?),
                .source = .npm,
                .url = tarball_url,
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
    var child = io_helper.spawn(.{ .argv = &.{ "chmod", "+x", path } }) catch return;
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
/// Creates package.json if it doesn't exist, preserves all existing fields
pub fn addDependencyToPackageJson(
    allocator: std.mem.Allocator,
    project_root: []const u8,
    pkg_name: []const u8,
    pkg_version: []const u8,
    is_dev: bool,
) !void {
    const package_json_path = try std.fs.path.join(allocator, &[_][]const u8{ project_root, "package.json" });
    defer allocator.free(package_json_path);

    // Format version with caret for semver compatibility
    const version_with_caret = try std.fmt.allocPrint(allocator, "^{s}", .{pkg_version});
    defer allocator.free(version_with_caret);

    // Try to read existing package.json
    if (io_helper.readFileAlloc(allocator, package_json_path, 1024 * 1024)) |content| {
        defer allocator.free(content);

        // We'll do a simple text-based approach to preserve formatting and all fields
        // Find the dependencies or devDependencies section and update it
        const dep_key = if (is_dev) "devDependencies" else "dependencies";
        const new_content = try updateJsonDependency(allocator, content, dep_key, pkg_name, version_with_caret);
        defer allocator.free(new_content);

        // Write to file
        const file = try io_helper.cwd().createFile(io_helper.io, package_json_path, .{});
        defer file.close(io_helper.io);
        try io_helper.writeAllToFile(file, new_content);
    } else |_| {
        // No package.json exists, create minimal one
        var buf = try std.ArrayList(u8).initCapacity(allocator, 512);
        defer buf.deinit(allocator);

        try buf.appendSlice(allocator, "{\n");
        try buf.appendSlice(allocator, "  \"name\": \"my-project\",\n");
        try buf.appendSlice(allocator, "  \"version\": \"1.0.0\",\n");

        if (is_dev) {
            try buf.appendSlice(allocator, "  \"devDependencies\": {\n");
        } else {
            try buf.appendSlice(allocator, "  \"dependencies\": {\n");
        }

        const dep_line = try std.fmt.allocPrint(allocator, "    \"{s}\": \"{s}\"\n", .{ pkg_name, version_with_caret });
        defer allocator.free(dep_line);
        try buf.appendSlice(allocator, dep_line);

        try buf.appendSlice(allocator, "  }\n");
        try buf.appendSlice(allocator, "}\n");

        // Write to file
        const file = try io_helper.cwd().createFile(io_helper.io, package_json_path, .{});
        defer file.close(io_helper.io);
        try io_helper.writeAllToFile(file, buf.items);
    }
}

/// Update a JSON string by adding/updating a dependency in the specified section
/// Preserves all other fields and formatting as much as possible
/// Also removes the package from the OTHER section if it exists (move behavior like npm/bun)
fn updateJsonDependency(
    allocator: std.mem.Allocator,
    json_content: []const u8,
    dep_section: []const u8,
    pkg_name: []const u8,
    pkg_version: []const u8,
) ![]const u8 {
    // Determine the "other" section to remove from
    const other_section = if (std.mem.eql(u8, dep_section, "dependencies"))
        "devDependencies"
    else
        "dependencies";
    // Parse the JSON to work with it
    const parsed = std.json.parseFromSlice(std.json.Value, allocator, json_content, .{}) catch {
        // Invalid JSON, return as-is
        return try allocator.dupe(u8, json_content);
    };
    defer parsed.deinit();

    if (parsed.value != .object) {
        return try allocator.dupe(u8, json_content);
    }

    // Collect all keys in their original order by scanning the source
    var key_order = std.ArrayList([]const u8){};
    defer {
        for (key_order.items) |k| allocator.free(k);
        key_order.deinit(allocator);
    }

    // Simple scan to find key order (look for "key": patterns)
    var i: usize = 0;
    while (i < json_content.len) {
        // Skip whitespace
        while (i < json_content.len and (json_content[i] == ' ' or json_content[i] == '\t' or json_content[i] == '\n' or json_content[i] == '\r')) {
            i += 1;
        }
        if (i >= json_content.len) break;

        // Look for "key":
        if (json_content[i] == '"') {
            const key_start = i + 1;
            i += 1;
            while (i < json_content.len and json_content[i] != '"') {
                if (json_content[i] == '\\') i += 1; // Skip escaped char
                i += 1;
            }
            if (i < json_content.len) {
                const key_end = i;
                i += 1;
                // Skip whitespace after key
                while (i < json_content.len and (json_content[i] == ' ' or json_content[i] == '\t')) {
                    i += 1;
                }
                // Check if followed by colon (meaning it's a key, not a value)
                if (i < json_content.len and json_content[i] == ':') {
                    const key = json_content[key_start..key_end];
                    // Only add top-level keys (crude check: not too deep)
                    var depth: usize = 0;
                    for (json_content[0..key_start]) |c| {
                        if (c == '{') depth += 1;
                        if (c == '}') depth -|= 1;
                    }
                    if (depth == 1) {
                        // Check if already in list
                        var found = false;
                        for (key_order.items) |k| {
                            if (std.mem.eql(u8, k, key)) {
                                found = true;
                                break;
                            }
                        }
                        if (!found) {
                            try key_order.append(allocator, try allocator.dupe(u8, key));
                        }
                    }
                }
            }
        } else {
            i += 1;
        }
    }

    // Build the new JSON preserving key order
    var buf = try std.ArrayList(u8).initCapacity(allocator, json_content.len + 256);
    errdefer buf.deinit(allocator);

    try buf.appendSlice(allocator, "{\n");

    var has_dep_section = false;
    for (key_order.items) |key| {
        if (std.mem.eql(u8, key, dep_section)) {
            has_dep_section = true;
        }
    }

    // If dep section doesn't exist, we'll add it at the end
    if (!has_dep_section) {
        try key_order.append(allocator, try allocator.dupe(u8, dep_section));
    }

    var first_key = true;
    for (key_order.items) |key| {
        if (!first_key) {
            try buf.appendSlice(allocator, ",\n");
        }
        first_key = false;

        if (std.mem.eql(u8, key, dep_section)) {
            // Write the dependency section with the new/updated package
            const line = try std.fmt.allocPrint(allocator, "  \"{s}\": {{\n", .{dep_section});
            defer allocator.free(line);
            try buf.appendSlice(allocator, line);

            // Get existing deps from this section
            var dep_first = true;
            var found_pkg = false;

            if (parsed.value.object.get(dep_section)) |deps_val| {
                if (deps_val == .object) {
                    var iter = deps_val.object.iterator();
                    while (iter.next()) |entry| {
                        if (!dep_first) {
                            try buf.appendSlice(allocator, ",\n");
                        }
                        dep_first = false;

                        if (std.mem.eql(u8, entry.key_ptr.*, pkg_name)) {
                            // Update this package's version
                            const dep_line = try std.fmt.allocPrint(allocator, "    \"{s}\": \"{s}\"", .{ pkg_name, pkg_version });
                            defer allocator.free(dep_line);
                            try buf.appendSlice(allocator, dep_line);
                            found_pkg = true;
                        } else {
                            // Keep existing package
                            if (entry.value_ptr.* == .string) {
                                const dep_line = try std.fmt.allocPrint(allocator, "    \"{s}\": \"{s}\"", .{ entry.key_ptr.*, entry.value_ptr.string });
                                defer allocator.free(dep_line);
                                try buf.appendSlice(allocator, dep_line);
                            }
                        }
                    }
                }
            }

            // Add new package if not found
            if (!found_pkg) {
                if (!dep_first) {
                    try buf.appendSlice(allocator, ",\n");
                }
                const dep_line = try std.fmt.allocPrint(allocator, "    \"{s}\": \"{s}\"", .{ pkg_name, pkg_version });
                defer allocator.free(dep_line);
                try buf.appendSlice(allocator, dep_line);
            }

            try buf.appendSlice(allocator, "\n  }");
        } else if (std.mem.eql(u8, key, other_section)) {
            // Write the OTHER dependency section, but SKIP the package we're moving
            if (parsed.value.object.get(other_section)) |deps_val| {
                if (deps_val == .object) {
                    // Count remaining deps after excluding the one we're moving
                    var remaining_count: usize = 0;
                    var count_iter = deps_val.object.iterator();
                    while (count_iter.next()) |entry| {
                        if (!std.mem.eql(u8, entry.key_ptr.*, pkg_name)) {
                            remaining_count += 1;
                        }
                    }

                    // Only write section if there are remaining deps
                    if (remaining_count > 0) {
                        const line = try std.fmt.allocPrint(allocator, "  \"{s}\": {{\n", .{other_section});
                        defer allocator.free(line);
                        try buf.appendSlice(allocator, line);

                        var other_first = true;
                        var iter = deps_val.object.iterator();
                        while (iter.next()) |entry| {
                            // Skip the package we're moving to the other section
                            if (std.mem.eql(u8, entry.key_ptr.*, pkg_name)) {
                                continue;
                            }
                            if (!other_first) {
                                try buf.appendSlice(allocator, ",\n");
                            }
                            other_first = false;
                            if (entry.value_ptr.* == .string) {
                                const dep_line = try std.fmt.allocPrint(allocator, "    \"{s}\": \"{s}\"", .{ entry.key_ptr.*, entry.value_ptr.string });
                                defer allocator.free(dep_line);
                                try buf.appendSlice(allocator, dep_line);
                            }
                        }
                        try buf.appendSlice(allocator, "\n  }");
                    } else {
                        // Section would be empty, skip writing it but adjust first_key
                        // We need to not write the trailing comma for the previous item
                        // This is tricky - for now just write empty section
                        // Actually, let's just skip writing entirely
                        first_key = true; // Reset so next item doesn't have leading comma issue
                        continue;
                    }
                } else {
                    // Not an object, write as-is
                    try writeJsonValue(allocator, &buf, key, deps_val, 1);
                }
            }
        } else {
            // Write other fields as-is
            if (parsed.value.object.get(key)) |val| {
                try writeJsonValue(allocator, &buf, key, val, 1);
            }
        }
    }

    try buf.appendSlice(allocator, "\n}\n");

    return try buf.toOwnedSlice(allocator);
}

/// Error type for JSON writing operations
const JsonWriteError = std.mem.Allocator.Error || error{OutOfMemory};

/// Write a JSON value with proper formatting
fn writeJsonValue(
    allocator: std.mem.Allocator,
    buf: *std.ArrayList(u8),
    key: []const u8,
    value: std.json.Value,
    indent: usize,
) JsonWriteError!void {
    // Write indent
    var indent_i: usize = 0;
    while (indent_i < indent) : (indent_i += 1) {
        try buf.appendSlice(allocator, "  ");
    }

    const key_str = try std.fmt.allocPrint(allocator, "\"{s}\": ", .{key});
    defer allocator.free(key_str);
    try buf.appendSlice(allocator, key_str);

    switch (value) {
        .string => |s| {
            // Escape special characters in string
            try buf.append(allocator, '"');
            for (s) |c| {
                switch (c) {
                    '"' => try buf.appendSlice(allocator, "\\\""),
                    '\\' => try buf.appendSlice(allocator, "\\\\"),
                    '\n' => try buf.appendSlice(allocator, "\\n"),
                    '\r' => try buf.appendSlice(allocator, "\\r"),
                    '\t' => try buf.appendSlice(allocator, "\\t"),
                    else => try buf.append(allocator, c),
                }
            }
            try buf.append(allocator, '"');
        },
        .number_string => |s| {
            // Number stored as string - write as-is (no quotes)
            try buf.appendSlice(allocator, s);
        },
        .integer => |n| {
            const num_str = try std.fmt.allocPrint(allocator, "{d}", .{n});
            defer allocator.free(num_str);
            try buf.appendSlice(allocator, num_str);
        },
        .float => |f| {
            const num_str = try std.fmt.allocPrint(allocator, "{d}", .{f});
            defer allocator.free(num_str);
            try buf.appendSlice(allocator, num_str);
        },
        .bool => |b| {
            try buf.appendSlice(allocator, if (b) "true" else "false");
        },
        .null => {
            try buf.appendSlice(allocator, "null");
        },
        .array => |arr| {
            if (arr.items.len == 0) {
                try buf.appendSlice(allocator, "[]");
            } else {
                try buf.appendSlice(allocator, "[\n");
                var first = true;
                for (arr.items) |item| {
                    if (!first) {
                        try buf.appendSlice(allocator, ",\n");
                    }
                    first = false;
                    // Write indent for array item
                    var arr_indent: usize = 0;
                    while (arr_indent < indent + 1) : (arr_indent += 1) {
                        try buf.appendSlice(allocator, "  ");
                    }
                    try writeJsonValueOnly(allocator, buf, item, indent + 1);
                }
                try buf.append(allocator, '\n');
                var close_indent: usize = 0;
                while (close_indent < indent) : (close_indent += 1) {
                    try buf.appendSlice(allocator, "  ");
                }
                try buf.append(allocator, ']');
            }
        },
        .object => |obj| {
            if (obj.count() == 0) {
                try buf.appendSlice(allocator, "{}");
            } else {
                try buf.appendSlice(allocator, "{\n");
                var first = true;
                var iter = obj.iterator();
                while (iter.next()) |entry| {
                    if (!first) {
                        try buf.appendSlice(allocator, ",\n");
                    }
                    first = false;
                    try writeJsonValue(allocator, buf, entry.key_ptr.*, entry.value_ptr.*, indent + 1);
                }
                try buf.append(allocator, '\n');
                var close_indent: usize = 0;
                while (close_indent < indent) : (close_indent += 1) {
                    try buf.appendSlice(allocator, "  ");
                }
                try buf.append(allocator, '}');
            }
        },
    }
}

/// Write just the value part (no key) for array items
fn writeJsonValueOnly(
    allocator: std.mem.Allocator,
    buf: *std.ArrayList(u8),
    value: std.json.Value,
    indent: usize,
) JsonWriteError!void {
    switch (value) {
        .string => |s| {
            try buf.append(allocator, '"');
            for (s) |c| {
                switch (c) {
                    '"' => try buf.appendSlice(allocator, "\\\""),
                    '\\' => try buf.appendSlice(allocator, "\\\\"),
                    '\n' => try buf.appendSlice(allocator, "\\n"),
                    '\r' => try buf.appendSlice(allocator, "\\r"),
                    '\t' => try buf.appendSlice(allocator, "\\t"),
                    else => try buf.append(allocator, c),
                }
            }
            try buf.append(allocator, '"');
        },
        .number_string => |s| {
            // Number stored as string - write as-is (no quotes)
            try buf.appendSlice(allocator, s);
        },
        .integer => |n| {
            const num_str = try std.fmt.allocPrint(allocator, "{d}", .{n});
            defer allocator.free(num_str);
            try buf.appendSlice(allocator, num_str);
        },
        .float => |f| {
            const num_str = try std.fmt.allocPrint(allocator, "{d}", .{f});
            defer allocator.free(num_str);
            try buf.appendSlice(allocator, num_str);
        },
        .bool => |b| {
            try buf.appendSlice(allocator, if (b) "true" else "false");
        },
        .null => {
            try buf.appendSlice(allocator, "null");
        },
        .array => |arr| {
            if (arr.items.len == 0) {
                try buf.appendSlice(allocator, "[]");
            } else {
                try buf.appendSlice(allocator, "[\n");
                var first = true;
                for (arr.items) |item| {
                    if (!first) {
                        try buf.appendSlice(allocator, ",\n");
                    }
                    first = false;
                    var arr_indent: usize = 0;
                    while (arr_indent < indent + 1) : (arr_indent += 1) {
                        try buf.appendSlice(allocator, "  ");
                    }
                    try writeJsonValueOnly(allocator, buf, item, indent + 1);
                }
                try buf.append(allocator, '\n');
                var close_indent: usize = 0;
                while (close_indent < indent) : (close_indent += 1) {
                    try buf.appendSlice(allocator, "  ");
                }
                try buf.append(allocator, ']');
            }
        },
        .object => |obj| {
            if (obj.count() == 0) {
                try buf.appendSlice(allocator, "{}");
            } else {
                try buf.appendSlice(allocator, "{\n");
                var first = true;
                var iter = obj.iterator();
                while (iter.next()) |entry| {
                    if (!first) {
                        try buf.appendSlice(allocator, ",\n");
                    }
                    first = false;
                    try writeJsonValue(allocator, buf, entry.key_ptr.*, entry.value_ptr.*, indent + 1);
                }
                try buf.append(allocator, '\n');
                var close_indent: usize = 0;
                while (close_indent < indent) : (close_indent += 1) {
                    try buf.appendSlice(allocator, "  ");
                }
                try buf.append(allocator, '}');
            }
        },
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
