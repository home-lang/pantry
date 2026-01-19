//! Core Install Logic
//!
//! Main installation command implementation for project dependencies.

const std = @import("std");
const io_helper = @import("../../../io_helper.zig");
const lib = @import("../../../lib.zig");
const types = @import("types.zig");
const helpers = @import("helpers.zig");
const workspace = @import("workspace.zig");
const global = @import("global.zig");
const version_options = @import("version");
const lockfile_hooks = @import("lockfile_hooks.zig");
const offline = @import("../../../install/offline.zig");
const recovery = @import("../../../install/recovery.zig");

const cache = lib.cache;
const string = lib.string;
const install = lib.install;

/// Install packages - main entry point
pub fn installCommand(allocator: std.mem.Allocator, args: []const []const u8) !types.CommandResult {
    return installCommandWithOptions(allocator, args, .{});
}

/// Install packages with options
pub fn installCommandWithOptions(allocator: std.mem.Allocator, args: []const []const u8, options: types.InstallOptions) !types.CommandResult {
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
        return try global.installGlobalDepsCommand(allocator);
    }

    // If -g flag is set with packages, install those packages globally
    if (is_global and package_args.items.len > 0) {
        return try global.installPackagesGloballyCommand(allocator, package_args.items);
    }

    // Otherwise, normal install flow
    if (package_args.items.len == 0) {
        // No args - check if we're in a project directory
        const detector = @import("../../../deps/detector.zig");
        const parser = @import("../../../deps/parser.zig");

        const cwd = try std.process.getCwdAlloc(allocator);
        defer allocator.free(cwd);

        // Start timing for install operation
        const start_time = @as(i64, @intCast((std.posix.clock_gettime(.REALTIME) catch std.posix.timespec{ .sec = 0, .nsec = 0 }).sec * 1000));

        // First, check if we're in a workspace
        const workspace_file = try detector.findWorkspaceFile(allocator, cwd);
        if (workspace_file) |ws_file| {
            defer {
                allocator.free(ws_file.path);
                allocator.free(ws_file.root_dir);
            }

            // We found a workspace! Install all workspace member dependencies
            return try workspace.installWorkspaceCommandWithOptions(allocator, ws_file.root_dir, ws_file.path, options);
        }

        // Try to load dependencies from config file first (pantry.config.ts, etc.)
        const config_deps = try helpers.loadDependenciesFromConfig(allocator, cwd);

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

        // Load overrides/resolutions from package.json if it exists
        var override_map = lib.deps.overrides.OverrideMap.init(allocator);
        defer override_map.deinit();

        const package_json_path = try std.fs.path.join(allocator, &[_][]const u8{ cwd, "package.json" });
        defer allocator.free(package_json_path);

        if (io_helper.readFileAlloc(allocator, package_json_path, 1024 * 1024)) |package_json_content| {
            defer allocator.free(package_json_content);

            if (std.json.parseFromSlice(std.json.Value, allocator, package_json_content, .{})) |parsed| {
                defer parsed.deinit();
                override_map = try lib.deps.overrides.parseFromPackageJson(allocator, parsed);

                if (override_map.count() > 0) {
                    std.debug.print("Found {d} package override(s)\n", .{override_map.count()});
                }
            } else |_| {
                // Failed to parse package.json, continue without overrides
            }
        } else |_| {
            // No package.json or failed to read, continue without overrides
        }

        // Apply overrides to dependencies
        for (filtered_deps.items) |*dep| {
            if (lib.deps.overrides.shouldOverride(&override_map, dep.name)) |override_version| {
                // Free the old version and replace with override
                allocator.free(dep.version);
                dep.version = try allocator.dupe(u8, override_version);
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
            try io_helper.readFileAlloc(allocator, path, 1024 * 1024)
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
        try io_helper.makePath(env_dir);
        const bin_dir = try std.fmt.allocPrint(allocator, "{s}/bin", .{env_dir});
        defer allocator.free(bin_dir);
        try io_helper.makePath(bin_dir);

        // Check if we're in offline mode
        const is_offline = offline.isOfflineMode();
        if (is_offline) {
            std.debug.print("🔌 Offline mode enabled - using cache only\n", .{});
        }

        // Create recovery checkpoint for rollback on failure
        var checkpoint = recovery.InstallCheckpoint.init(allocator);
        defer checkpoint.deinit();

        // Create backup of current state
        checkpoint.createBackup(proj_dir) catch |err| {
            if (options.verbose) {
                std.debug.print("⚠️  Could not create backup: {}\n", .{err});
            }
        };

        // Load or create lockfile
        var lock_file = try lockfile_hooks.loadOrCreateLockfile(allocator, cwd);
        defer lock_file.deinit();

        // Execute pre-install hook
        if (try lockfile_hooks.executePreInstallHook(allocator, cwd, options.verbose)) |*pre_result| {
            defer {
                var r = pre_result.*;
                r.deinit(allocator);
            }
            if (!pre_result.success) {
                // Rollback on pre-install hook failure
                checkpoint.rollback() catch |err| {
                    std.debug.print("⚠️  Rollback failed: {}\n", .{err});
                };
                return .{
                    .exit_code = 1,
                    .message = try allocator.dupe(u8, "Pre-install hook failed"),
                };
            }
        }

        // Clean Yarn/Bun-style output - just show what we're installing
        const green = "\x1b[32m";
        const dim = "\x1b[2m";
        const reset = "\x1b[0m";
        std.debug.print("{s}➤{s} Installing {d} package(s)...\n", .{ green, reset, deps_to_install.len });

        // Install each dependency concurrently
        var pkg_cache = try cache.PackageCache.init(allocator);
        defer pkg_cache.deinit();

        // Install results storage
        var install_results = try allocator.alloc(types.InstallTaskResult, deps_to_install.len);
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

        // Install packages sequentially
        // TODO: Re-add parallel installation using std.Io.Group when API stabilizes
        for (deps_to_install, 0..) |dep, i| {
            install_results[i] = try helpers.installSinglePackage(
                allocator,
                dep,
                proj_dir,
                env_dir,
                bin_dir,
                cwd,
                &pkg_cache,
                options,
            );
        }

        // Print clean Yarn/Bun-style summary - only show what was installed or failed
        var success_count: usize = 0;
        var failed_count: usize = 0;

        for (install_results) |result| {
            if (result.name.len == 0) continue;
            const display_name = helpers.stripDisplayPrefix(result.name);
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
        // Create pantry directory if it doesn't exist
        const pantry_dir = try std.fmt.allocPrint(allocator, "{s}/pantry", .{proj_dir});
        defer allocator.free(pantry_dir);
        try io_helper.makePath(pantry_dir);

        for (deps) |dep| {
            if (!helpers.isLocalDependency(dep)) continue;

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
            io_helper.accessAbsolute(local_path, .{}) catch {
                const yellow = "\x1b[33m";
                std.debug.print("{s}⚠{s}  {s}@{s} {s}(path not found){s}\n", .{ yellow, reset, dep.name, dep.version, dim, reset });
                failed_count += 1;
                continue;
            };

            const pkg_name = if (std.mem.indexOf(u8, dep.name, ":")) |colon_pos|
                dep.name[colon_pos + 1 ..]
            else
                dep.name;

            // Create pantry/{package} directory structure
            const pkg_modules_dir = try std.fmt.allocPrint(allocator, "{s}/{s}", .{ pantry_dir, pkg_name });
            defer allocator.free(pkg_modules_dir);
            try io_helper.makePath(pkg_modules_dir);

            // Create symlink to source directory for build system
            const src_link_path = try std.fmt.allocPrint(allocator, "{s}/src", .{pkg_modules_dir});
            defer allocator.free(src_link_path);
            io_helper.deleteFile(src_link_path) catch {};

            const src_path = try std.fmt.allocPrint(allocator, "{s}/src", .{local_path});
            defer allocator.free(src_path);
            io_helper.symLink(src_path, src_link_path) catch |err| {
                const red = "\x1b[31m";
                const display_name = helpers.stripDisplayPrefix(dep.name);
                std.debug.print("{s}✗{s} {s}@{s} {s}(symlink failed: {}){s}\n", .{ red, reset, display_name, dep.version, dim, err, reset });
                failed_count += 1;
                continue;
            };

            // Also create symlink in env bin directory for executables
            const link_path = try std.fmt.allocPrint(allocator, "{s}/{s}", .{ bin_dir, pkg_name });
            defer allocator.free(link_path);
            io_helper.deleteFile(link_path) catch {};
            io_helper.symLink(local_path, link_path) catch |err| {
                if (options.verbose) {
                    std.debug.print("    ⚠️  Failed to create bin symlink {s}: {}\n", .{ link_path, err });
                }
            };

            // Create pantry/.bin directory and symlink binaries from zig-out/bin
            const local_bin_dir = try std.fmt.allocPrint(allocator, "{s}/pantry/.bin", .{proj_dir});
            defer allocator.free(local_bin_dir);
            try io_helper.makePath(local_bin_dir);

            // Check for binaries in the linked package's zig-out/bin directory
            const zig_out_bin = try std.fmt.allocPrint(allocator, "{s}/zig-out/bin", .{local_path});
            defer allocator.free(zig_out_bin);

            // Use std.fs.Dir for iteration (Io.Dir doesn't have iterate() in Zig 0.16)
            if (io_helper.openDirAbsoluteForIteration(zig_out_bin)) |dir_val| {
                var dir = dir_val;
                defer dir.close();
                var iter = dir.iterate();
                while (iter.next() catch null) |entry| {
                    if (entry.kind == .file or entry.kind == .sym_link) {
                        // Create symlink in pantry/.bin
                        const bin_src = try std.fmt.allocPrint(allocator, "{s}/{s}", .{ zig_out_bin, entry.name });
                        defer allocator.free(bin_src);
                        const bin_dst = try std.fmt.allocPrint(allocator, "{s}/{s}", .{ local_bin_dir, entry.name });
                        defer allocator.free(bin_dst);

                        io_helper.deleteFile(bin_dst) catch {};
                        io_helper.symLink(bin_src, bin_dst) catch |err| {
                            if (options.verbose) {
                                std.debug.print("    ⚠️  Failed to create local bin symlink {s}: {}\n", .{ bin_dst, err });
                            }
                        };
                    }
                }
            } else |_| {
                // No zig-out/bin directory, that's fine
            }

            const display_name = helpers.stripDisplayPrefix(dep.name);
            std.debug.print("{s}✓{s} {s}@{s} {s}(linked){s}\n", .{ green, reset, display_name, dep.version, dim, reset });
            success_count += 1;
        }

        // Generate lockfile
        const lockfile_path = try std.fmt.allocPrint(allocator, "{s}/pantry.lock", .{proj_dir});
        defer allocator.free(lockfile_path);

        var lockfile = try lib.packages.Lockfile.init(allocator, "1.0.0");
        defer lockfile.deinit(allocator);

        // Add entries for all installed packages
        for (deps, 0..) |dep, i| {
            const source = if (helpers.isLocalDependency(dep))
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
        const lockfile_writer = @import("../../../packages/lockfile.zig");
        lockfile_writer.writeLockfile(allocator, &lockfile, lockfile_path) catch |err| {
            const yellow = "\x1b[33m";
            std.debug.print("\n{s}⚠{s}  Failed to write lockfile: {}\n", .{ yellow, reset, err });
        };

        // Add successful packages to pantry.lock and record in checkpoint
        for (install_results) |result| {
            if (result.success and result.name.len > 0) {
                const clean_name = helpers.stripDisplayPrefix(result.name);
                const resolved_url = try std.fmt.allocPrint(allocator, "registry:{s}@{s}", .{ clean_name, result.version });
                defer allocator.free(resolved_url);
                try lockfile_hooks.addPackageToLockfile(&lock_file, clean_name, result.version, resolved_url, null);

                // Record successful package installation in checkpoint
                checkpoint.recordPackage(clean_name) catch |err| {
                    if (options.verbose) {
                        std.debug.print("⚠️  Could not record package in checkpoint: {}\n", .{err});
                    }
                };

                // Record installed files/directories
                const pkg_dir = try std.fmt.allocPrint(allocator, "{s}/pantry/{s}", .{ proj_dir, clean_name });
                defer allocator.free(pkg_dir);
                checkpoint.recordDir(pkg_dir) catch |err| {
                    if (options.verbose) {
                        std.debug.print("⚠️  Could not record directory in checkpoint: {}\n", .{err});
                    }
                };
            }
        }

        // Save pantry.lock
        try lockfile_hooks.saveLockfile(&lock_file, cwd);

        // Get Pantry version and hash for display
        const pantry_version = version_options.version;
        const pantry_hash = version_options.commit_hash;

        // Clean summary - Bun style with formatting
        const bold = "\x1b[1m";

        // First line: "pantry install v0.1.0 (abc1234)"
        std.debug.print("\n{s}pantry install{s} {s}v{s} ({s}){s}\n\n", .{ bold, reset, dim, pantry_version, pantry_hash, reset });

        // Second line: "Checked X installs across Y packages (no changes) [Zms]"
        const total_deps = deps.len;
        const end_time = @as(i64, @intCast((std.posix.clock_gettime(.REALTIME) catch std.posix.timespec{ .sec = 0, .nsec = 0 }).sec * 1000));
        const elapsed_ms = @as(f64, @floatFromInt(end_time - start_time));

        std.debug.print("Checked {s}{d}{s} installs across {s}{d}{s} packages {s}(no changes){s} [{s}{d:.2}ms{s}]\n", .{
            green,      success_count, reset,
            green,      total_deps,    reset,
            dim,        reset,         bold,
            elapsed_ms, reset,
        });

        if (failed_count > 0) {
            const red = "\x1b[31m";
            std.debug.print("\n{s}{d} packages failed to install{s}\n", .{ red, failed_count, reset });

            // Optional: Rollback on any failure (can be configured)
            // For now, we keep partial installs but show warning
            if (options.verbose) {
                std.debug.print("⚠️  Some packages failed. Use 'pantry clean' to reset, or fix errors and retry.\n", .{});
            }
        }

        // Execute post-install hook
        if (try lockfile_hooks.executePostInstallHook(allocator, cwd, options.verbose)) |*post_result| {
            defer {
                var r = post_result.*;
                r.deinit(allocator);
            }
            if (!post_result.success) {
                const yellow = "\x1b[33m";
                std.debug.print("\n{s}⚠{s}  Post-install hook failed\n", .{ yellow, reset });
                // Don't fail the install, just warn
            }
        }

        return .{ .exit_code = 0 };
    }

    // Detect if we're in a project directory
    const detector = @import("../../../deps/detector.zig");
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
    const bold = "\x1b[1m";
    const reset = "\x1b[0m";

    // Start timing
    const start_time = @as(i64, @intCast((std.posix.clock_gettime(.REALTIME) catch std.posix.timespec{ .sec = 0, .nsec = 0 }).sec * 1000));

    // Print header with Pantry version info
    const pantry_version = version_options.version;
    const pantry_hash = version_options.commit_hash;
    std.debug.print("\n{s}pantry install{s} {s}v{s} ({s}){s}\n\n", .{ bold, reset, dim, pantry_version, pantry_hash, reset });

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
            // Provide friendly error messages
            const error_msg = switch (err) {
                error.PackageNotFound => "not found in registry (npm packages not yet supported)",
                else => @errorName(err),
            };
            std.debug.print("{s}✗{s} {s}@{s} {s}({s}){s}\n", .{ red, reset, name, version, dim, error_msg, reset });

            // Show helpful suggestions for PackageNotFound
            if (err == error.PackageNotFound) {
                std.debug.print("\n{s}💡 Suggestions:{s}\n", .{ "\x1b[33m", reset });
                std.debug.print("   1. This package may be an npm package (not yet supported)\n", .{});
                std.debug.print("   2. Try 'pantry search {s}' to find available packages\n", .{name});
                std.debug.print("   3. For npm packages, use: bun install {s} (for now)\n\n", .{name});
            }

            failed_count += 1;
            continue;
        };

        // Create symlinks in pantry/.bin for package executables
        helpers.createBinSymlinksFromInstall(allocator, project_root, result.install_path) catch {};

        defer result.deinit(allocator);

        std.debug.print("{s}✓{s} {s}@{s}\n", .{ green, reset, name, version });
        success_count += 1;
    }

    // Clean summary with timing
    const end_time = @as(i64, @intCast((std.posix.clock_gettime(.REALTIME) catch std.posix.timespec{ .sec = 0, .nsec = 0 }).sec * 1000));
    const elapsed_ms = @as(f64, @floatFromInt(end_time - start_time));

    std.debug.print("\nChecked {s}{d}{s} installs across {s}{d}{s} packages {s}{d:.2}ms{s}\n", .{
        green, success_count, reset,
        green, args.len,      reset,
        bold,  elapsed_ms,    reset,
    });

    if (failed_count > 0) {
        std.debug.print("\n{s}{d} packages failed to install{s}\n", .{ red, failed_count, reset });
    }

    return .{ .exit_code = 0 };
}
