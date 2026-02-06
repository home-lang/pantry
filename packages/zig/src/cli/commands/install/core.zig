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

        const cwd = try io_helper.getCwdAlloc(allocator);
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
                // Allocate new version first to prevent double-free if alloc fails
                const new_version = try allocator.dupe(u8, override_version);
                allocator.free(dep.version);
                dep.version = new_version;
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

        // Try to resume from a previous interrupted install, or create a fresh checkpoint
        var checkpoint = recovery.InstallCheckpoint.loadFromDisk(allocator, proj_dir) catch null orelse recovery.InstallCheckpoint.init(allocator);
        defer checkpoint.deinit();

        const resuming = checkpoint.installed_packages.count() > 0;
        if (resuming) {
            std.debug.print("{s}  ↳ Resuming from previous interrupted install ({d} packages already done){s}\n", .{
                "\x1b[2m", checkpoint.installed_packages.count(), "\x1b[0m",
            });
        }

        // Set checkpoint path for persistence (enables resume on interrupt)
        checkpoint.setCheckpointPath(proj_dir) catch |err| {
            if (options.verbose) {
                std.debug.print("Warning: Could not set checkpoint path: {}\n", .{err});
            }
        };

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

        // Read existing lockfile for incremental install skipping
        const lockfile_reader = @import("../../../packages/lockfile.zig");
        const lockfile_path_for_read = try std.fmt.allocPrint(allocator, "{s}/pantry.lock", .{proj_dir});
        defer allocator.free(lockfile_path_for_read);
        var existing_lockfile: ?lib.packages.Lockfile = lockfile_reader.readLockfile(allocator, lockfile_path_for_read) catch null;
        defer if (existing_lockfile) |*lf| lf.deinit(allocator);

        // Clean Yarn/Bun-style output - just show what we're installing
        const green = "\x1b[32m";
        const dim = "\x1b[2m";
        const reset = "\x1b[0m";
        std.debug.print("{s}➤{s} Installing {d} package(s)...\n", .{ green, reset, deps_to_install.len });

        // Install each dependency concurrently using a shared installer for deduplication
        var pkg_cache = try cache.PackageCache.init(allocator);
        defer pkg_cache.deinit();

        var shared_installer = try install.Installer.init(allocator, &pkg_cache);
        allocator.free(shared_installer.data_dir);
        shared_installer.data_dir = try allocator.dupe(u8, env_dir);
        defer shared_installer.deinit();

        // Check lockfile for packages that can be skipped (already installed, matching version)
        var skipped_count: usize = 0;
        if (existing_lockfile) |*lf| {
            for (deps_to_install, 0..) |dep, i| {
                _ = i;
                if (helpers.canSkipFromLockfile(&lf.packages, dep.name, dep.version, proj_dir, allocator)) {
                    skipped_count += 1;
                }
            }
        }

        if (skipped_count == deps_to_install.len) {
            // All packages already installed and match lockfile - nothing to do
            const end_time = @as(i64, @intCast((std.posix.clock_gettime(.REALTIME) catch std.posix.timespec{ .sec = 0, .nsec = 0 }).sec * 1000));
            const elapsed_ms = @as(f64, @floatFromInt(end_time - start_time));
            const bold = "\x1b[1m";
            const pantry_version = version_options.version;
            const pantry_hash = version_options.commit_hash;
            std.debug.print("\n{s}pantry install{s} {s}v{s} ({s}){s}\n\n", .{ bold, reset, dim, pantry_version, pantry_hash, reset });
            std.debug.print("{s}✓{s} All {d} packages already up to date [{s}{d:.2}ms{s}]\n", .{
                green, reset, deps_to_install.len, bold, elapsed_ms, reset,
            });
            return .{ .exit_code = 0 };
        }

        if (skipped_count > 0) {
            std.debug.print("{s}  ↳ {d} package(s) already up to date, installing {d} remaining...{s}\n", .{
                dim, skipped_count, deps_to_install.len - skipped_count, reset,
            });
        }

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

        // Install remote packages in parallel using threads
        // (link: and local deps are skipped by installSinglePackage and handled below)
        const cpu_count = std.Thread.getCpuCount() catch 4;
        const max_threads = @min(cpu_count, 32);
        const thread_count = @min(deps_to_install.len, max_threads);
        var threads = try allocator.alloc(?std.Thread, max_threads);
        defer allocator.free(threads);
        for (threads) |*t| t.* = null;
        var next_dep = std.atomic.Value(usize).init(0);

        const ThreadContext = struct {
            deps: []const lib.deps.parser.PackageDependency,
            results: []types.InstallTaskResult,
            next: *std.atomic.Value(usize),
            alloc: std.mem.Allocator,
            proj: []const u8,
            env: []const u8,
            bin: []const u8,
            cwd_path: []const u8,
            shared_installer: *install.Installer,
            opts: types.InstallOptions,
            lockfile_packages: ?*const std.StringHashMap(lib.packages.LockfileEntry),
            resume_packages: ?*const std.StringHashMap(void),

            fn worker(ctx: *@This()) void {
                while (true) {
                    const i = ctx.next.fetchAdd(1, .monotonic);
                    if (i >= ctx.deps.len) break;

                    const clean_name = helpers.stripDisplayPrefix(ctx.deps[i].name);

                    // Skip packages that match lockfile and exist at destination
                    if (ctx.lockfile_packages) |lf_pkgs| {
                        if (helpers.canSkipFromLockfile(lf_pkgs, ctx.deps[i].name, ctx.deps[i].version, ctx.proj, ctx.alloc)) {
                            ctx.results[i] = .{
                                .name = clean_name,
                                .version = ctx.deps[i].version,
                                .success = true,
                                .error_msg = null,
                                .install_time_ms = 0,
                            };
                            continue;
                        }
                    }

                    // Skip packages already installed in a previous interrupted run (resume)
                    if (ctx.resume_packages) |resume_pkgs| {
                        if (resume_pkgs.contains(clean_name)) {
                            ctx.results[i] = .{
                                .name = clean_name,
                                .version = ctx.deps[i].version,
                                .success = true,
                                .error_msg = null,
                                .install_time_ms = 0,
                            };
                            continue;
                        }
                    }

                    ctx.results[i] = helpers.installSinglePackage(
                        ctx.alloc,
                        ctx.deps[i],
                        ctx.proj,
                        ctx.env,
                        ctx.bin,
                        ctx.cwd_path,
                        ctx.shared_installer,
                        ctx.opts,
                    ) catch .{
                        .name = ctx.deps[i].name,
                        .version = ctx.deps[i].version,
                        .success = false,
                        .error_msg = null,
                        .install_time_ms = 0,
                    };
                }
            }
        };

        var ctx = ThreadContext{
            .deps = deps_to_install,
            .results = install_results,
            .next = &next_dep,
            .alloc = allocator,
            .proj = proj_dir,
            .env = env_dir,
            .bin = bin_dir,
            .cwd_path = cwd,
            .shared_installer = &shared_installer,
            .opts = options,
            .lockfile_packages = if (existing_lockfile) |*lf| &lf.packages else null,
            .resume_packages = if (resuming) &checkpoint.installed_packages else null,
        };

        // Spawn worker threads (one fewer since main thread also works)
        for (0..thread_count) |t| {
            threads[t] = std.Thread.spawn(.{}, ThreadContext.worker, .{&ctx}) catch null;
        }

        // Main thread also participates
        ctx.worker();

        // Join all threads
        for (threads) |*t| {
            if (t.*) |thread| {
                thread.join();
                t.* = null;
            }
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

            // Resolve local path (handles link:, ~/, absolute, and relative paths)
            const local_path = if (helpers.isLinkDependency(dep.version)) blk: {
                const resolved = try helpers.resolveLinkVersion(allocator, dep.version);
                break :blk resolved orelse {
                    const red = "\x1b[31m";
                    std.debug.print("{s}✗{s} {s}@{s} {s}(not linked - run 'pantry link' in the package directory){s}\n", .{ red, reset, dep.name, dep.version, dim, reset });
                    failed_count += 1;
                    continue;
                };
            } else if (std.mem.startsWith(u8, dep.version, "~/")) blk: {
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

            // Validate the resolved package name for path safety
            if (std.mem.indexOf(u8, pkg_name, "..") != null or
                std.mem.indexOfScalar(u8, pkg_name, '\\') != null)
            {
                const red = "\x1b[31m";
                std.debug.print("{s}x{s} {s} {s}(invalid package name){s}\n", .{ red, reset, dep.name, dim, reset });
                failed_count += 1;
                continue;
            }

            // Create symlink to source directory for build system
            const src_link_path = try std.fmt.allocPrint(allocator, "{s}/src", .{pkg_modules_dir});
            defer allocator.free(src_link_path);

            const src_path = try std.fmt.allocPrint(allocator, "{s}/src", .{local_path});
            defer allocator.free(src_path);

            // Atomic symlink: try create first, replace if exists
            io_helper.symLink(src_path, src_link_path) catch |err| switch (err) {
                error.PathAlreadyExists => {
                    io_helper.deleteFile(src_link_path) catch {};
                    io_helper.symLink(src_path, src_link_path) catch |err2| {
                        const red2 = "\x1b[31m";
                        const display_name2 = helpers.stripDisplayPrefix(dep.name);
                        std.debug.print("{s}x{s} {s}@{s} {s}(symlink failed: {}){s}\n", .{ red2, reset, display_name2, dep.version, dim, err2, reset });
                        failed_count += 1;
                        continue;
                    };
                },
                else => {
                    const red3 = "\x1b[31m";
                    const display_name3 = helpers.stripDisplayPrefix(dep.name);
                    std.debug.print("{s}x{s} {s}@{s} {s}(symlink failed: {}){s}\n", .{ red3, reset, display_name3, dep.version, dim, err, reset });
                    failed_count += 1;
                    continue;
                },
            };

            // Also create symlink in env bin directory for executables
            const link_path = try std.fmt.allocPrint(allocator, "{s}/{s}", .{ bin_dir, pkg_name });
            defer allocator.free(link_path);

            // Atomic symlink: try create first, replace if exists
            io_helper.symLink(local_path, link_path) catch |symlink_err| switch (symlink_err) {
                error.PathAlreadyExists => {
                    io_helper.deleteFile(link_path) catch {};
                    io_helper.symLink(local_path, link_path) catch |err2| {
                        if (options.verbose) {
                            std.debug.print("    Warning: Failed to create bin symlink {s}: {}\n", .{ link_path, err2 });
                        }
                    };
                },
                else => {
                    if (options.verbose) {
                        std.debug.print("    Warning: Failed to create bin symlink {s}: {}\n", .{ link_path, symlink_err });
                    }
                },
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
                        // Validate entry name
                        if (std.mem.indexOfScalar(u8, entry.name, '/') != null or
                            std.mem.eql(u8, entry.name, ".."))
                        {
                            continue;
                        }

                        // Create symlink in pantry/.bin
                        const bin_src = try std.fmt.allocPrint(allocator, "{s}/{s}", .{ zig_out_bin, entry.name });
                        defer allocator.free(bin_src);
                        const bin_dst = try std.fmt.allocPrint(allocator, "{s}/{s}", .{ local_bin_dir, entry.name });
                        defer allocator.free(bin_dst);

                        // Atomic symlink: try create first, replace if exists
                        io_helper.symLink(bin_src, bin_dst) catch |sym_err| switch (sym_err) {
                            error.PathAlreadyExists => {
                                io_helper.deleteFile(bin_dst) catch {};
                                io_helper.symLink(bin_src, bin_dst) catch {};
                            },
                            else => {
                                if (options.verbose) {
                                    std.debug.print("    Warning: Failed to create local bin symlink {s}: {}\n", .{ bin_dst, sym_err });
                                }
                            },
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

        // Clean up checkpoint file on successful completion (no resume needed)
        if (failed_count == 0) {
            checkpoint.cleanup();
        }

        return .{ .exit_code = 0 };
    }

    // Detect if we're in a project directory
    const detector = @import("../../../deps/detector.zig");
    const cwd = try io_helper.getCwdAlloc(allocator);
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

    // Track successful installs for lockfile
    const InstalledPkg = struct { name: []const u8, version: []const u8, source: lib.packages.PackageSource };
    var installed_packages = std.ArrayList(InstalledPkg){};
    defer {
        for (installed_packages.items) |pkg| {
            allocator.free(pkg.name);
            allocator.free(pkg.version);
        }
        installed_packages.deinit(allocator);
    }

    for (args) |pkg_spec_str| {
        // Parse package spec (name@version)
        const at_pos = std.mem.indexOf(u8, pkg_spec_str, "@");
        const name = if (at_pos) |pos| pkg_spec_str[0..pos] else pkg_spec_str;
        const version = if (at_pos) |pos| pkg_spec_str[pos + 1 ..] else "latest";

        // Check if package exists in pantry registry first
        const pkg_registry = @import("../../../packages/generated.zig");
        const pkg_info = pkg_registry.getPackageByName(name);

        // Determine the package spec - use npm fallback if not in pantry registry
        const spec = if (pkg_info != null) lib.packages.PackageSpec{
            .name = name,
            .version = version,
        } else npm_fallback: {
            // Try Pantry S3/DynamoDB registry first
            if (helpers.lookupPantryRegistry(allocator, name) catch |err| lkup: {
                std.debug.print("\x1b[2m  ? {s}: pantry registry lookup failed: {}\x1b[0m\n", .{ name, err });
                break :lkup null;
            }) |info| {
                var pantry_info = info;
                defer pantry_info.deinit(allocator);

                break :npm_fallback lib.packages.PackageSpec{
                    .name = name,
                    .version = try allocator.dupe(u8, pantry_info.version),
                    .source = .npm,
                    .url = try allocator.dupe(u8, pantry_info.tarball_url),
                };
            }

            // Fall back to npm registry - use temp file to handle large responses
            const tmp_dir = io_helper.getTempDir();

            // Use random suffix to prevent TOCTOU race conditions
            var random_bytes: [8]u8 = undefined;
            io_helper.randomBytes(&random_bytes);
            const random_suffix = std.mem.readInt(u64, &random_bytes, .big);
            const tmp_file = std.fmt.allocPrint(allocator, "{s}/pantry-npm-{d}.json", .{ tmp_dir, random_suffix }) catch {
                break :npm_fallback lib.packages.PackageSpec{ .name = name, .version = version };
            };
            defer allocator.free(tmp_file);
            defer io_helper.deleteFile(tmp_file) catch {};

            const npm_url = std.fmt.allocPrint(allocator, "https://registry.npmjs.org/{s}", .{name}) catch {
                break :npm_fallback lib.packages.PackageSpec{ .name = name, .version = version };
            };
            defer allocator.free(npm_url);

            // Download to temp file
            const curl_result = io_helper.childRun(allocator, &[_][]const u8{ "curl", "-sL", "-o", tmp_file, npm_url }) catch {
                break :npm_fallback lib.packages.PackageSpec{ .name = name, .version = version };
            };
            defer allocator.free(curl_result.stdout);
            defer allocator.free(curl_result.stderr);

            if (curl_result.term.exited != 0) {
                break :npm_fallback lib.packages.PackageSpec{ .name = name, .version = version };
            }

            // Read and parse the temp file
            const npm_response = io_helper.readFileAlloc(allocator, tmp_file, 10 * 1024 * 1024) catch {
                break :npm_fallback lib.packages.PackageSpec{ .name = name, .version = version };
            };
            defer allocator.free(npm_response);

            if (npm_response.len == 0) {
                break :npm_fallback lib.packages.PackageSpec{ .name = name, .version = version };
            }

            // Parse npm response
            const parsed = std.json.parseFromSlice(std.json.Value, allocator, npm_response, .{}) catch {
                break :npm_fallback lib.packages.PackageSpec{ .name = name, .version = version };
            };
            defer parsed.deinit();

            if (parsed.value != .object) {
                break :npm_fallback lib.packages.PackageSpec{ .name = name, .version = version };
            }

            // Get target version
            const target_version = if (std.mem.eql(u8, version, "latest")) version_blk: {
                const dist_tags = parsed.value.object.get("dist-tags") orelse break :version_blk null;
                if (dist_tags != .object) break :version_blk null;
                const latest = dist_tags.object.get("latest") orelse break :version_blk null;
                if (latest != .string) break :version_blk null;
                break :version_blk latest.string;
            } else version;

            if (target_version == null) {
                break :npm_fallback lib.packages.PackageSpec{ .name = name, .version = version };
            }

            // Get tarball URL
            const versions_obj = parsed.value.object.get("versions") orelse {
                break :npm_fallback lib.packages.PackageSpec{ .name = name, .version = version };
            };
            if (versions_obj != .object) {
                break :npm_fallback lib.packages.PackageSpec{ .name = name, .version = version };
            }

            const version_data = versions_obj.object.get(target_version.?) orelse {
                break :npm_fallback lib.packages.PackageSpec{ .name = name, .version = version };
            };
            if (version_data != .object) {
                break :npm_fallback lib.packages.PackageSpec{ .name = name, .version = version };
            }

            var tarball_url: ?[]const u8 = null;
            if (version_data.object.get("dist")) |dist| {
                if (dist == .object) {
                    if (dist.object.get("tarball")) |tarball| {
                        if (tarball == .string) {
                            // Validate URL scheme to prevent SSRF via file:// or other protocols
                            if (std.mem.startsWith(u8, tarball.string, "https://") or
                                std.mem.startsWith(u8, tarball.string, "http://"))
                            {
                                tarball_url = allocator.dupe(u8, tarball.string) catch null;
                            }
                        }
                    }
                }
            }

            break :npm_fallback lib.packages.PackageSpec{
                .name = name,
                .version = allocator.dupe(u8, target_version.?) catch version,
                .source = .npm,
                .url = tarball_url,
            };
        };

        // Show what we're installing
        std.debug.print("  {s}↓{s} {s}@{s}...", .{ dim, reset, name, spec.version });

        var result = installer.install(spec, .{
            .project_root = project_root,
            .quiet = false, // Show download progress
        }) catch |err| {
            std.debug.print("\r\x1b[K", .{}); // Clear the line
            // Provide friendly error messages
            const error_msg = switch (err) {
                error.PackageNotFound => "not found in pantry or npm registry",
                error.NoTarballUrl => "npm package found but no tarball URL available",
                else => @errorName(err),
            };
            std.debug.print("{s}✗{s} {s}@{s} {s}({s}){s}\n", .{ red, reset, name, spec.version, dim, error_msg, reset });

            failed_count += 1;
            continue;
        };

        // Create symlinks in pantry/.bin for package executables
        helpers.createBinSymlinksFromInstall(allocator, project_root, result.install_path) catch |err| {
            std.debug.print("Warning: Failed to create bin symlinks for {s}: {}\n", .{ name, err });
        };

        defer result.deinit(allocator);

        std.debug.print("\r\x1b[K{s}✓{s} {s}@{s}\n", .{ green, reset, name, result.version });
        success_count += 1;

        // Track for lockfile
        installed_packages.append(allocator, .{
            .name = allocator.dupe(u8, name) catch continue,
            .version = allocator.dupe(u8, result.version) catch continue,
            .source = spec.source,
        }) catch |err| {
            std.debug.print("Warning: Failed to track installed package {s}: {}\n", .{ name, err });
        };

        // Update package.json with the new dependency
        helpers.addDependencyToPackageJson(allocator, project_root, name, result.version, options.dev_only) catch |err| {
            std.debug.print("{s}⚠{s}  Failed to update package.json: {}\n", .{ "\x1b[33m", reset, err });
        };
    }

    // Generate/update lockfile for installed packages
    if (installed_packages.items.len > 0) {
        const lockfile_path = try std.fmt.allocPrint(allocator, "{s}/pantry.lock", .{project_root});
        defer allocator.free(lockfile_path);

        const lockfile_writer = @import("../../../packages/lockfile.zig");

        // Try to read existing lockfile first, or create a new one
        var lockfile = lockfile_writer.readLockfile(allocator, lockfile_path) catch |err| blk: {
            // If file doesn't exist or is invalid, create a new lockfile
            if (err == error.FileNotFound or err == error.InvalidLockfile) {
                break :blk lib.packages.Lockfile.init(allocator, "1.0.0") catch |init_err| {
                    std.debug.print("{s}⚠{s}  Failed to create lockfile: {}\n", .{ "\x1b[33m", reset, init_err });
                    return .{ .exit_code = 0 };
                };
            }
            std.debug.print("{s}⚠{s}  Failed to read lockfile: {}\n", .{ "\x1b[33m", reset, err });
            return .{ .exit_code = 0 };
        };
        defer lockfile.deinit(allocator);

        // Add new packages to the lockfile (replace existing versions of same package)
        for (installed_packages.items) |pkg| {
            // First, remove any existing entries for this package (different versions)
            var keys_to_remove = std.ArrayList([]const u8){};
            defer keys_to_remove.deinit(allocator);

            var iter = lockfile.packages.iterator();
            while (iter.next()) |existing| {
                const existing_key = existing.key_ptr.*;
                // Check if this is the same package (starts with "name@")
                if (std.mem.startsWith(u8, existing_key, pkg.name)) {
                    if (existing_key.len > pkg.name.len and existing_key[pkg.name.len] == '@') {
                        keys_to_remove.append(allocator, existing_key) catch continue;
                    }
                }
            }

            // Remove old versions
            for (keys_to_remove.items) |old_key| {
                if (lockfile.packages.fetchRemove(old_key)) |kv| {
                    var old_entry = kv.value;
                    old_entry.deinit(allocator);
                    allocator.free(kv.key);
                }
            }

            // Add the new version
            const entry = lib.packages.LockfileEntry{
                .name = allocator.dupe(u8, pkg.name) catch continue,
                .version = allocator.dupe(u8, pkg.version) catch continue,
                .source = pkg.source,
                .url = null,
                .resolved = null,
                .integrity = null,
                .dependencies = null,
            };

            const key = std.fmt.allocPrint(allocator, "{s}@{s}", .{ pkg.name, pkg.version }) catch continue;
            defer allocator.free(key);
            lockfile.addEntry(allocator, key, entry) catch |err| {
                std.debug.print("Warning: Failed to add lockfile entry for {s}: {}\n", .{ pkg.name, err });
            };
        }

        // Write merged lockfile
        lockfile_writer.writeLockfile(allocator, &lockfile, lockfile_path) catch |err| {
            std.debug.print("{s}⚠{s}  Failed to write lockfile: {}\n", .{ "\x1b[33m", reset, err });
        };
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
