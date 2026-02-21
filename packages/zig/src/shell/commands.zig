const std = @import("std");
const io_helper = @import("../io_helper.zig");
const lib = @import("../lib.zig");
const style = @import("../cli/style.zig");

pub const ShellCommands = struct {
    allocator: std.mem.Allocator,
    env_cache: *lib.cache.EnvCache,

    pub fn init(allocator: std.mem.Allocator) !ShellCommands {
        // Use persistent cache to avoid re-installing on every cd
        const env_cache = try allocator.create(lib.cache.EnvCache);
        env_cache.* = try lib.cache.EnvCache.initWithPersistence(allocator);

        return .{
            .allocator = allocator,
            .env_cache = env_cache,
        };
    }

    pub fn deinit(self: *ShellCommands) void {
        self.env_cache.deinit();
        self.allocator.destroy(self.env_cache);
    }

    /// shell:lookup - Fast cache lookup (called by shell on every cd)
    /// Returns: env_dir|project_dir or empty on cache miss
    /// Performance target: < 1ms
    pub fn lookup(self: *ShellCommands, pwd: []const u8) !?[]const u8 {
        const start_time = io_helper.clockGettimeMonotonic();
        defer {
            const end_time = io_helper.clockGettimeMonotonic();
            const elapsed_ns = (end_time.sec - start_time.sec) * std.time.ns_per_s + (end_time.nsec - start_time.nsec);
            const elapsed_us = @divFloor(elapsed_ns, std.time.ns_per_us);
            if (elapsed_us > 1000) {
                style.print("! shell:lookup took {d}μs (> 1ms target)\n", .{elapsed_us});
            }
        }

        // Walk up directory tree checking cache
        var current_dir = try self.allocator.dupe(u8, pwd);
        defer self.allocator.free(current_dir);

        while (true) {
            // Compute hash for this directory
            const hash = lib.string.md5Hash(current_dir);
            const hash_hex = try lib.string.hashToHex(hash, self.allocator);
            defer self.allocator.free(hash_hex);

            // Check cache for this directory
            if (try self.env_cache.get(hash)) |entry| {
                // Validate entry is still valid
                // 1. Check env directory exists
                io_helper.cwd().access(io_helper.io, entry.path, .{}) catch {
                    // Environment deleted, invalidate cache
                    continue;
                };

                // 2. Check dependency file mtime (if tracked)
                if (entry.dep_file.len > 0) {
                    const file = io_helper.cwd().openFile(io_helper.io, entry.dep_file, .{}) catch {
                        // Dependency file deleted
                        continue;
                    };
                    defer file.close();

                    const stat = try file.stat();
                    const mtime = @divFloor(stat.mtime.toNanoseconds(), std.time.ns_per_s);

                    if (mtime != entry.dep_mtime) {
                        // Dependency file changed, invalidate cache
                        return null; // Force re-detection
                    }
                }

                // Cache valid! Return env_dir|project_dir
                return try std.fmt.allocPrint(
                    self.allocator,
                    "{s}|{s}",
                    .{ entry.path, current_dir },
                );
            }

            // Move up directory tree
            const parent = std.fs.path.dirname(current_dir) orelse break;
            if (std.mem.eql(u8, parent, current_dir)) break; // Reached root

            // Duplicate parent before freeing current_dir since parent points into current_dir
            const new_dir = try self.allocator.dupe(u8, parent);
            self.allocator.free(current_dir);
            current_dir = new_dir;
        }

        return null; // Cache miss
    }

    /// shell:activate - Detect project, install dependencies, output shell code
    /// Returns: Shell code to eval (exports, PATH modifications)
    /// Performance target: < 50ms (cache hit), < 300ms (cache miss with install)
    pub fn activate(self: *ShellCommands, pwd: []const u8) ![]const u8 {
        const start_time = io_helper.clockGettimeMonotonic();
        defer {
            const end_time = io_helper.clockGettimeMonotonic();
            const elapsed_ns = (end_time.sec - start_time.sec) * std.time.ns_per_s + (end_time.nsec - start_time.nsec);
            const elapsed_ms = @divFloor(elapsed_ns, std.time.ns_per_ms);
            if (elapsed_ms > 50) {
                style.print("⏱️  shell:activate took {d}ms\n", .{elapsed_ms});
            }
        }

        // 1. Detect project root
        const project_root = try self.detectProjectRoot(pwd) orelse {
            return try self.allocator.dupe(u8, ""); // No project found
        };
        defer self.allocator.free(project_root);

        // 2. Find dependency file
        const dep_file = try self.findDependencyFile(project_root);
        defer if (dep_file) |file| self.allocator.free(file);

        // 3. Fast-path: Check cache first (file modification based)
        // If pantry.json mtime unchanged, use cached environment instantly
        const now = @as(i64, @intCast((io_helper.clockGettime()).sec));

        const project_hash_quick = lib.string.md5Hash(project_root);
        if (try self.env_cache.get(project_hash_quick)) |cached_entry| {
            // Get current dep file mtime
            const current_dep_mtime = if (dep_file) |file| blk: {
                const f = io_helper.cwd().openFile(io_helper.io, file, .{}) catch break :blk 0;
                defer f.close(io_helper.io);
                const stat = f.stat(io_helper.io) catch break :blk 0;
                break :blk @divFloor(stat.mtime.toNanoseconds(), std.time.ns_per_s);
            } else 0;

            // Cache hit if dep file mtime unchanged (primary check)
            if (current_dep_mtime == cached_entry.dep_mtime) {
                // File unchanged - use cache regardless of TTL
                // Just update last_validated timestamp for bookkeeping
                cached_entry.last_validated = now;
                const project_basename = std.fs.path.basename(project_root);
                style.print("✓ Environment cached: {s}\n", .{project_basename});
                style.print("  Dependencies already installed. Use --force to reinstall.\n", .{});
                return try self.generateShellCode(project_root, cached_entry.path);
            }
            // File mtime changed: invalidate cache and do full activation
        }

        // Cache miss or invalidated - proceed with full activation
        // 4. Compute environment hash
        const project_hash = lib.string.md5Hash(project_root);
        const project_hash_hex = try lib.string.hashToHex(project_hash, self.allocator);
        defer self.allocator.free(project_hash_hex);

        const project_basename = std.fs.path.basename(project_root);

        var env_name = try std.fmt.allocPrint(
            self.allocator,
            "{s}_{s}",
            .{ project_basename, project_hash_hex[0..8] },
        );
        defer self.allocator.free(env_name);

        // Add dependency hash if we have a dependency file
        if (dep_file) |file| {
            const dep_hash = lib.string.hashDependencyFile(file);
            const dep_hash_hex = try lib.string.hashToHex(dep_hash, self.allocator);
            defer self.allocator.free(dep_hash_hex);

            const old_env_name = env_name;
            env_name = try std.fmt.allocPrint(
                self.allocator,
                "{s}-d{s}",
                .{ old_env_name, dep_hash_hex[0..8] },
            );
            self.allocator.free(old_env_name);
        }

        // 4. Determine environment directory
        const data_dir = try lib.Paths.data(self.allocator);
        defer self.allocator.free(data_dir);

        const env_dir = try std.fs.path.join(self.allocator, &[_][]const u8{
            data_dir,
            "envs",
            env_name,
        });
        defer self.allocator.free(env_dir);

        // 5. Check if environment exists
        const env_bin = try std.fs.path.join(self.allocator, &[_][]const u8{
            env_dir,
            "bin",
        });
        defer self.allocator.free(env_bin);

        const env_exists = blk: {
            io_helper.cwd().access(io_helper.io, env_bin, .{}) catch break :blk false;
            break :blk true;
        };

        if (!env_exists and dep_file != null) {
            // 6. Install dependencies with progress feedback
            style.print("🔧 Setting up environment for {s}...\n", .{project_basename});

            // Parse dependency file to detect version changes
            const dep_file_content = io_helper.readFileAlloc(self.allocator, dep_file.?, 10 * 1024 * 1024) catch { // 10MB max
                style.print("⚠️  Could not read {s}\n", .{dep_file.?});
                return try self.allocator.dupe(u8, "");
            };
            defer self.allocator.free(dep_file_content);

            style.print("📦 Installing dependencies from {s}\n", .{std.fs.path.basename(dep_file.?)});

            // Create env directory
            io_helper.makePath(env_dir) catch |err| {
                style.print("❌ Failed to create environment: {s}\n", .{@errorName(err)});
                return try self.allocator.dupe(u8, "");
            };

            // Actually install dependencies
            const install_cmd = @import("../cli/commands/install/core.zig");
            const install_types = @import("../cli/commands/install/types.zig");

            // Change to project directory temporarily
            const original_cwd = try io_helper.getCwdAlloc(self.allocator);
            defer self.allocator.free(original_cwd);

            {
                var project_root_z: [std.fs.max_path_bytes:0]u8 = undefined;
                @memcpy(project_root_z[0..project_root.len], project_root);
                project_root_z[project_root.len] = 0;
                if (std.c.chdir(&project_root_z) != 0) {
                    style.print("Failed to change to project directory: {s}\n", .{project_root});
                    return try self.allocator.dupe(u8, "");
                }
            }
            defer {
                var cwd_z: [std.fs.max_path_bytes:0]u8 = undefined;
                @memcpy(cwd_z[0..original_cwd.len], original_cwd);
                cwd_z[original_cwd.len] = 0;
                _ = std.c.chdir(&cwd_z);
            }

            // Run install command (no args = auto-detect from dep file)
            var install_result = install_cmd.installCommandWithOptions(
                self.allocator,
                &[_][]const u8{},
                install_types.InstallOptions{},
            ) catch |err| {
                style.print("❌ Installation failed: {s}\n", .{@errorName(err)});
                return try self.allocator.dupe(u8, "");
            };
            defer install_result.deinit(self.allocator);

            if (install_result.exit_code != 0) {
                if (install_result.message) |msg| {
                    style.print("❌ {s}\n", .{msg});
                }
                return try self.allocator.dupe(u8, "");
            }

            style.print("✅ Environment ready: {s}\n", .{env_name});

            // Install global dependencies (global: true in deps.yaml)
            try self.installGlobalDeps(project_root);

            // Auto-start services if configured
            try self.autoStartServices(project_root);

            // Wait for services to be ready before proceeding
            self.waitForServices(project_root) catch {};

            // Auto-create database if postgres is a dependency and .env has DB_DATABASE
            self.autoCreateDatabase(project_root) catch {};

            // Execute postSetup commands from pantry.config.ts
            self.executePostSetupCommands(project_root) catch {};
        } else if (env_exists and dep_file != null) {
            // Environment exists but dep file may have changed
            // Check if we need to update (only when cache was invalidated)
            const current_dep_mtime = blk: {
                const f = io_helper.cwd().openFile(io_helper.io, dep_file.?, .{}) catch break :blk 0;
                defer f.close(io_helper.io);
                const stat = f.stat(io_helper.io) catch break :blk 0;
                break :blk @divFloor(stat.mtime.toNanoseconds(), std.time.ns_per_s);
            };

            // Check if dep file was modified recently (cache was invalidated)
            if (try self.env_cache.get(project_hash_quick)) |cached| {
                if (current_dep_mtime != cached.dep_mtime) {
                    style.print("🔄 Dependencies changed, updating environment...\n", .{});
                    style.print("📦 Processing updates from {s}\n", .{std.fs.path.basename(dep_file.?)});

                    // Actually re-install dependencies
                    const install_cmd = @import("../cli/commands/install/core.zig");
                    const install_types = @import("../cli/commands/install/types.zig");

                    // Change to project directory temporarily
                    const original_cwd = try io_helper.getCwdAlloc(self.allocator);
                    defer self.allocator.free(original_cwd);

                    {
                        var pr_buf: [std.fs.max_path_bytes:0]u8 = undefined;
                        @memcpy(pr_buf[0..project_root.len], project_root);
                        pr_buf[project_root.len] = 0;
                        if (std.c.chdir(&pr_buf) != 0) {
                            style.print("Failed to change to project directory: {s}\n", .{project_root});
                            return try self.allocator.dupe(u8, "");
                        }
                    }
                    defer {
                        var oc_buf: [std.fs.max_path_bytes:0]u8 = undefined;
                        @memcpy(oc_buf[0..original_cwd.len], original_cwd);
                        oc_buf[original_cwd.len] = 0;
                        _ = std.c.chdir(&oc_buf);
                    }

                    // Run install command (no args = auto-detect from dep file)
                    var install_result = install_cmd.installCommandWithOptions(
                        self.allocator,
                        &[_][]const u8{},
                        install_types.InstallOptions{},
                    ) catch |err| {
                        style.print("❌ Update failed: {s}\n", .{@errorName(err)});
                        return try self.allocator.dupe(u8, "");
                    };
                    defer install_result.deinit(self.allocator);

                    if (install_result.exit_code != 0) {
                        if (install_result.message) |msg| {
                            style.print("❌ {s}\n", .{msg});
                        }
                        return try self.allocator.dupe(u8, "");
                    }

                    style.print("✅ Environment updated\n", .{});

                    // Re-check global dependencies after update
                    try self.installGlobalDeps(project_root);
                }
            }
        }

        // 7. Update cache
        const project_hash_for_cache = lib.string.md5Hash(project_root);
        const dep_mtime = if (dep_file) |file| blk: {
            const f = io_helper.cwd().openFile(io_helper.io, file, .{}) catch break :blk 0;
            defer f.close(io_helper.io);
            const stat = f.stat(io_helper.io) catch break :blk 0;
            break :blk @divFloor(stat.mtime.toNanoseconds(), std.time.ns_per_s);
        } else 0;

        const entry = try self.allocator.create(lib.cache.env_cache.Entry);
        entry.* = .{
            .hash = project_hash_for_cache,
            .dep_file = try self.allocator.dupe(u8, dep_file orelse ""),
            .dep_mtime = dep_mtime,
            .path = try self.allocator.dupe(u8, env_dir),
            .env_vars = std.StringHashMap([]const u8).init(self.allocator),
            .created_at = @as(i64, @intCast((io_helper.clockGettime()).sec)),
            .cached_at = @as(i64, @intCast((io_helper.clockGettime()).sec)),
            .last_validated = @as(i64, @intCast((io_helper.clockGettime()).sec)),
        };

        try self.env_cache.put(entry);

        // 8. Generate shell code for activation
        return try self.generateShellCode(project_root, env_dir);
    }

    /// Generate shell code for environment activation
    fn generateShellCode(self: *ShellCommands, project_root: []const u8, env_dir: []const u8) ![]const u8 {
        const env_bin = try std.fs.path.join(self.allocator, &[_][]const u8{
            env_dir,
            "bin",
        });
        defer self.allocator.free(env_bin);

        // Check if pantry/.bin exists in the project
        const pantry_bin = try std.fmt.allocPrint(
            self.allocator,
            "{s}/pantry/.bin",
            .{project_root},
        );
        defer self.allocator.free(pantry_bin);

        const has_pantry = blk: {
            var dir = io_helper.cwd().openDir(io_helper.io, pantry_bin, .{}) catch break :blk false;
            dir.close(io_helper.io);
            break :blk true;
        };

        // Get runtime paths from ~/.pantry/runtimes
        const runtime_paths = try self.getRuntimePaths(project_root);
        defer self.allocator.free(runtime_paths);

        // Check if global bin directory exists
        const home_dir = lib.core.Paths.home(self.allocator) catch null;
        defer if (home_dir) |h| self.allocator.free(h);

        const global_bin_path = if (home_dir) |h|
            std.fmt.allocPrint(self.allocator, "{s}/.pantry/global/bin", .{h}) catch null
        else
            null;
        defer if (global_bin_path) |p| self.allocator.free(p);

        const has_global_bin = if (global_bin_path) |p| blk: {
            var dir = io_helper.cwd().openDir(io_helper.io, p, .{}) catch break :blk false;
            dir.close(io_helper.io);
            break :blk true;
        } else false;

        // Build PATH (highest precedence first)
        var path_components: std.ArrayList([]const u8) = .{};
        defer path_components.deinit(self.allocator);

        // 0. Global binaries (highest priority - always available)
        if (has_global_bin) {
            try path_components.append(self.allocator, global_bin_path.?);
        }

        // 1. Runtime binaries
        if (runtime_paths.len > 0) {
            try path_components.append(self.allocator, runtime_paths);
        }

        // 2. Project-local binaries
        if (has_pantry) {
            try path_components.append(self.allocator, pantry_bin);
        }

        // 3. Environment binaries
        try path_components.append(self.allocator, env_bin);

        // Join all paths
        const new_path = try std.mem.join(self.allocator, ":", path_components.items);
        defer self.allocator.free(new_path);

        // Generate shell code
        return try std.fmt.allocPrint(
            self.allocator,
            \\export PANTRY_CURRENT_PROJECT="{s}"
            \\export PANTRY_ENV_BIN_PATH="{s}"
            \\export PANTRY_ENV_DIR="{s}"
            \\PATH="{s}:$PATH"
            \\export PATH
        ,
            .{ project_root, env_bin, env_dir, new_path },
        );
    }

    /// Get runtime bin paths for the project
    fn getRuntimePaths(self: *ShellCommands, project_root: []const u8) ![]const u8 {
        // Parse dependency file to find runtime dependencies
        const detector = @import("../deps/detector.zig");
        const parser = @import("../deps/parser.zig");

        const deps_file = (try detector.findDepsFile(self.allocator, project_root)) orelse {
            return try self.allocator.dupe(u8, "");
        };
        defer {
            self.allocator.free(deps_file.path);
        }

        const deps = try parser.inferDependencies(self.allocator, deps_file);
        defer {
            for (deps) |*dep| {
                var d = dep.*;
                d.deinit(self.allocator);
            }
            self.allocator.free(deps);
        }

        // Find runtime dependencies and build paths
        var runtime_paths: std.ArrayList([]const u8) = .{};
        defer {
            for (runtime_paths.items) |path| self.allocator.free(path);
            runtime_paths.deinit(self.allocator);
        }

        const home_dir = try lib.core.Paths.home(self.allocator);
        defer self.allocator.free(home_dir);

        for (deps) |dep| {
            if (dep.isRuntime()) {
                // Build path to runtime bin directory
                const runtime_bin = try std.fs.path.join(self.allocator, &[_][]const u8{
                    home_dir,
                    ".pantry",
                    "runtimes",
                    dep.name,
                    dep.version,
                    "bin",
                });

                // Check if it exists
                io_helper.accessAbsolute(runtime_bin, .{}) catch {
                    self.allocator.free(runtime_bin);
                    continue;
                };

                try runtime_paths.append(self.allocator, runtime_bin);
            }
        }

        // Join all runtime paths
        if (runtime_paths.items.len == 0) {
            return try self.allocator.dupe(u8, "");
        }

        return try std.mem.join(self.allocator, ":", runtime_paths.items);
    }

    /// Install dependencies marked with global: true to ~/.pantry/global/
    fn installGlobalDeps(self: *ShellCommands, project_root_path: []const u8) !void {
        const parser = @import("../deps/parser.zig");

        // Look specifically for deps.yaml/deps.yml files (global: true is a YAML concept)
        const yaml_files = [_][]const u8{
            "deps.yaml",
            "deps.yml",
            "dependencies.yaml",
            "dependencies.yml",
        };

        var deps_file_path: ?[]const u8 = null;
        defer if (deps_file_path) |p| self.allocator.free(p);

        for (yaml_files) |yaml_name| {
            const candidate = std.fs.path.join(self.allocator, &[_][]const u8{
                project_root_path,
                yaml_name,
            }) catch continue;

            io_helper.accessAbsolute(candidate, .{}) catch {
                self.allocator.free(candidate);
                continue;
            };

            deps_file_path = candidate;
            break;
        }

        const yaml_path = deps_file_path orelse {
            return; // No deps.yaml found
        };

        // Parse deps.yaml using the dedicated YAML parser
        const deps = parser.parseDepsFile(self.allocator, yaml_path) catch return;
        defer {
            for (deps) |*dep| {
                var d = dep.*;
                d.deinit(self.allocator);
            }
            self.allocator.free(deps);
        }

        // Filter for global deps
        var has_global = false;
        for (deps) |dep| {
            if (dep.global) {
                has_global = true;
                break;
            }
        }
        if (!has_global) return;

        // Determine global install directory
        const home_dir = lib.core.Paths.home(self.allocator) catch return;
        defer self.allocator.free(home_dir);

        const global_dir = std.fmt.allocPrint(self.allocator, "{s}/.pantry/global", .{home_dir}) catch return;
        defer self.allocator.free(global_dir);

        const global_bin = std.fmt.allocPrint(self.allocator, "{s}/bin", .{global_dir}) catch return;
        defer self.allocator.free(global_bin);

        // Create global directories
        io_helper.makePath(global_dir) catch return;
        io_helper.makePath(global_bin) catch return;

        style.print("🌐 Installing global dependencies...\n", .{});

        var pkg_cache = lib.cache.PackageCache.init(self.allocator) catch return;
        defer pkg_cache.deinit();

        for (deps) |dep| {
            if (!dep.global) continue;

            style.print("  → {s}@{s} (global)", .{ dep.name, dep.version });

            const spec = lib.packages.PackageSpec{
                .name = dep.name,
                .version = dep.version,
            };

            var installer = lib.install.Installer.init(self.allocator, &pkg_cache) catch {
                style.print(" ... failed to init installer\n", .{});
                continue;
            };
            // Override data_dir to global directory
            self.allocator.free(installer.data_dir);
            installer.data_dir = self.allocator.dupe(u8, global_dir) catch {
                style.print(" ... failed\n", .{});
                continue;
            };
            defer installer.deinit();

            var result = installer.install(spec, .{}) catch {
                style.print(" ... failed\n", .{});
                continue;
            };
            defer result.deinit(self.allocator);

            style.print(" ... {s}\n", .{
                if (result.from_cache) "cached" else "installed",
            });
        }

        style.print("✅ Global packages available in ~/.pantry/global/bin\n", .{});
    }

    /// Auto-start services configured in pantry.json or deps.yaml
    fn autoStartServices(self: *ShellCommands, project_root: []const u8) !void {
        // First try pantry.json format
        const services = lib.config.findProjectServices(self.allocator, project_root) catch null;

        if (services) |services_list| {
            defer {
                for (services_list) |*svc| {
                    var s = svc.*;
                    s.deinit(self.allocator);
                }
                self.allocator.free(services_list);
            }

            for (services_list) |svc| {
                if (!svc.auto_start) continue;
                try self.startServiceWithContext(svc.name, project_root);
            }
            return;
        }

        // Fallback: try deps.yaml format (services.autoStart array)
        try self.autoStartServicesFromYaml(project_root);
    }

    /// Parse deps.yaml services.autoStart section and start services
    fn autoStartServicesFromYaml(self: *ShellCommands, project_root: []const u8) !void {
        const yaml_files = [_][]const u8{
            "deps.yaml",
            "deps.yml",
            "dependencies.yaml",
        };

        var yaml_path: ?[]const u8 = null;
        defer if (yaml_path) |p| self.allocator.free(p);

        for (yaml_files) |yaml_name| {
            const candidate = std.fs.path.join(self.allocator, &[_][]const u8{
                project_root,
                yaml_name,
            }) catch continue;

            io_helper.accessAbsolute(candidate, .{}) catch {
                self.allocator.free(candidate);
                continue;
            };

            yaml_path = candidate;
            break;
        }

        const file_path = yaml_path orelse return;

        // Read and parse the YAML file for services section
        const content = io_helper.readFileAlloc(self.allocator, file_path, 1 * 1024 * 1024) catch return;
        defer self.allocator.free(content);

        // Parse custom services first so they're available when autoStart references them
        var custom_configs = std.StringHashMap(CustomServiceDef).init(self.allocator);
        defer {
            var it = custom_configs.iterator();
            while (it.next()) |entry| {
                self.allocator.free(entry.key_ptr.*);
                entry.value_ptr.deinit(self.allocator);
            }
            custom_configs.deinit();
        }
        self.parseCustomServices(content, &custom_configs) catch {};

        // Simple YAML parser for services.autoStart with port override support
        var in_services = false;
        var in_auto_start = false;
        var services_enabled = false;
        var in_map_entry = false;
        var current_entry_name: ?[]const u8 = null;
        var current_entry_port: ?u16 = null;

        var auto_start_entries: std.ArrayList(AutoStartEntry) = .{};
        defer {
            for (auto_start_entries.items) |*entry| entry.deinit(self.allocator);
            auto_start_entries.deinit(self.allocator);
        }

        var line_iter = std.mem.splitScalar(u8, content, '\n');
        while (line_iter.next()) |line| {
            const trimmed = std.mem.trim(u8, line, " \t\r");

            if (trimmed.len == 0 or trimmed[0] == '#') continue;

            // Check for "services:" top-level section
            if (std.mem.eql(u8, trimmed, "services:")) {
                in_services = true;
                in_auto_start = false;
                continue;
            }

            // If we hit another top-level key, exit services section
            if (in_services and trimmed.len > 0 and trimmed[0] != ' ' and trimmed[0] != '-' and !std.mem.startsWith(u8, line, " ") and !std.mem.startsWith(u8, line, "\t")) {
                if (!std.mem.eql(u8, trimmed, "services:")) {
                    in_services = false;
                    in_auto_start = false;
                    continue;
                }
            }

            if (in_services) {
                // Check for "enabled: true"
                if (std.mem.indexOf(u8, trimmed, "enabled:")) |_| {
                    if (std.mem.indexOf(u8, trimmed, "true") != null) {
                        services_enabled = true;
                    }
                    continue;
                }

                // Check for "autoStart:"
                if (std.mem.indexOf(u8, trimmed, "autoStart:")) |_| {
                    in_auto_start = true;
                    in_map_entry = false;
                    continue;
                }

                // Parse autoStart list items
                if (in_auto_start and std.mem.startsWith(u8, trimmed, "- ")) {
                    // Flush previous map entry if any
                    if (current_entry_name) |name| {
                        auto_start_entries.append(self.allocator, .{
                            .name = name,
                            .port = current_entry_port,
                        }) catch {};
                        current_entry_name = null;
                        current_entry_port = null;
                    }

                    const value = std.mem.trim(u8, trimmed[2..], " \t\r");
                    if (value.len == 0) continue;

                    // Check if this is a map-style entry: "- name: redis"
                    if (std.mem.startsWith(u8, value, "name:")) {
                        const name_val = parseYamlValue(value["name:".len..]);
                        if (name_val.len > 0) {
                            current_entry_name = self.allocator.dupe(u8, name_val) catch continue;
                            current_entry_port = null;
                            in_map_entry = true;
                        }
                    } else {
                        // Simple string entry: "- postgres"
                        const duped = self.allocator.dupe(u8, value) catch continue;
                        auto_start_entries.append(self.allocator, .{
                            .name = duped,
                            .port = null,
                        }) catch {
                            self.allocator.free(duped);
                        };
                        in_map_entry = false;
                    }
                } else if (in_auto_start and in_map_entry and current_entry_name != null) {
                    // Parse properties of map-style entry
                    if (std.mem.startsWith(u8, trimmed, "port:")) {
                        const port_val = parseYamlValue(trimmed["port:".len..]);
                        current_entry_port = std.fmt.parseInt(u16, port_val, 10) catch null;
                    } else if (!std.mem.startsWith(u8, trimmed, "- ") and
                        !std.mem.startsWith(u8, trimmed, "name:") and
                        countLeadingSpaces(line) <= 4)
                    {
                        // End of map entry, flush
                        if (current_entry_name) |name| {
                            auto_start_entries.append(self.allocator, .{
                                .name = name,
                                .port = current_entry_port,
                            }) catch {};
                            current_entry_name = null;
                            current_entry_port = null;
                        }
                        in_map_entry = false;
                        in_auto_start = false;
                    }
                } else if (in_auto_start and !std.mem.startsWith(u8, trimmed, "- ")) {
                    // Flush final map entry
                    if (current_entry_name) |name| {
                        auto_start_entries.append(self.allocator, .{
                            .name = name,
                            .port = current_entry_port,
                        }) catch {};
                        current_entry_name = null;
                        current_entry_port = null;
                    }
                    in_auto_start = false;
                }
            }
        }

        // Flush any remaining map entry
        if (current_entry_name) |name| {
            auto_start_entries.append(self.allocator, .{
                .name = name,
                .port = current_entry_port,
            }) catch {};
        }

        if (!services_enabled) return;

        // Compute project hash for per-project isolation
        const service_cmd = @import("../cli/commands/services.zig");
        const project_hash = service_cmd.computeProjectHash(self.allocator, project_root) catch null;
        defer if (project_hash) |ph| self.allocator.free(ph);

        // Topological sort: start services respecting dependsOn ordering
        // 1. Collect all services with their dependencies
        var started = std.StringHashMap(bool).init(self.allocator);
        defer started.deinit();

        // First pass: start services without dependencies
        for (auto_start_entries.items) |entry| {
            const has_deps = if (custom_configs.get(entry.name)) |custom_def|
                (custom_def.depends_on != null and custom_def.depends_on.?.len > 0)
            else
                false;

            if (!has_deps) {
                self.startAutoStartEntry(entry, &custom_configs, project_root, project_hash) catch |err| {
                    style.print("Failed to start {s}: {s}\n", .{ entry.name, @errorName(err) });
                };
                try started.put(entry.name, true);
            }
        }

        // Wait for health checks on first batch
        self.waitForServices(project_root) catch {};

        // Second pass: start services whose dependencies are satisfied
        var remaining: usize = auto_start_entries.items.len - started.count();
        var max_iterations: usize = 10;
        while (remaining > 0 and max_iterations > 0) : (max_iterations -= 1) {
            var made_progress = false;

            for (auto_start_entries.items) |entry| {
                if (started.get(entry.name) != null) continue;

                const custom_def = custom_configs.get(entry.name);
                const deps = if (custom_def) |cd| cd.depends_on else null;

                if (deps) |dep_list| {
                    // Check all dependencies are started
                    var all_started = true;
                    for (dep_list) |dep| {
                        if (started.get(dep) == null) {
                            all_started = false;
                            break;
                        }
                    }

                    if (all_started) {
                        self.startAutoStartEntry(entry, &custom_configs, project_root, project_hash) catch |err| {
                            style.print("Failed to start {s}: {s}\n", .{ entry.name, @errorName(err) });
                        };
                        try started.put(entry.name, true);
                        made_progress = true;
                    }
                } else {
                    // No deps but wasn't started? Start now
                    self.startAutoStartEntry(entry, &custom_configs, project_root, project_hash) catch |err| {
                        style.print("Failed to start {s}: {s}\n", .{ entry.name, @errorName(err) });
                    };
                    try started.put(entry.name, true);
                    made_progress = true;
                }
            }

            remaining = auto_start_entries.items.len - started.count();
            if (!made_progress) {
                style.print("Warning: Circular dependency detected, {d} service(s) could not be started\n", .{remaining});
                break;
            }
        }
    }

    /// Start a single autoStart entry (handling port overrides, custom services, and project isolation)
    fn startAutoStartEntry(
        self: *ShellCommands,
        entry: AutoStartEntry,
        custom_configs: *std.StringHashMap(CustomServiceDef),
        project_root: []const u8,
        project_hash: ?[]const u8,
    ) !void {
        // Check if this is a custom service
        if (custom_configs.get(entry.name)) |custom_def| {
            self.startCustomService(entry.name, custom_def, project_root) catch |err| {
                style.print("Failed to start custom service {s}: {s}\n", .{ entry.name, @errorName(err) });
            };
        } else if (entry.port) |port| {
            // Port override: use getServiceConfigWithPort
            const service_cmd = @import("../cli/commands/services.zig");
            var config = service_cmd.getServiceConfigWithPort(self.allocator, entry.name, port, project_root) catch |err| {
                style.print("Failed to configure {s} with port {d}: {s}\n", .{ entry.name, port, @errorName(err) });
                return;
            };

            // Apply project isolation if available
            if (project_hash) |ph| {
                config.project_id = self.allocator.dupe(u8, ph) catch null;
            }

            var mgr = lib.services.manager.ServiceManager.init(self.allocator);
            defer mgr.deinit();

            const canonical_name = self.allocator.dupe(u8, config.name) catch return;
            defer self.allocator.free(canonical_name);

            // Ensure postgres data dir if needed
            if (std.mem.eql(u8, entry.name, "postgres") or std.mem.eql(u8, entry.name, "postgresql")) {
                self.ensurePostgresDataDir(project_root) catch {};
            }

            style.print("Starting service: {s} (port {d})...\n", .{ entry.name, port });
            mgr.register(config) catch {
                config.deinit(self.allocator);
                return;
            };
            mgr.start(canonical_name) catch |err| {
                style.print("Failed to start {s}: {s}\n", .{ entry.name, @errorName(err) });
                return;
            };
            style.print("{s} started on port {d}\n", .{ entry.name, port });
        } else {
            // Standard service start with project isolation
            try self.startServiceWithContextAndIsolation(entry.name, project_root, project_hash);
        }
    }

    /// Custom service definition parsed from deps.yaml
    const CustomServiceDef = struct {
        command: ?[]const u8 = null,
        port: ?u16 = null,
        health_check: ?[]const u8 = null,
        working_directory: ?[]const u8 = null,
        depends_on: ?[]const []const u8 = null,

        fn deinit(self: *CustomServiceDef, allocator: std.mem.Allocator) void {
            if (self.command) |c| allocator.free(c);
            if (self.health_check) |h| allocator.free(h);
            if (self.working_directory) |w| allocator.free(w);
            if (self.depends_on) |deps| {
                for (deps) |d| allocator.free(d);
                allocator.free(deps);
            }
        }
    };

    /// AutoStart entry supporting both simple string and map-style with port overrides
    const AutoStartEntry = struct {
        name: []const u8,
        port: ?u16 = null,

        fn deinit(self: *AutoStartEntry, allocator: std.mem.Allocator) void {
            allocator.free(self.name);
        }
    };

    /// Parse custom: section under services: in deps.yaml
    /// Format:
    ///   services:
    ///     custom:
    ///       my-worker:
    ///         command: "node worker.js"
    ///         port: 3001
    ///         healthCheck: "curl -sf http://localhost:3001/health"
    ///         workingDirectory: "."
    fn parseCustomServices(self: *ShellCommands, content: []const u8, customs: *std.StringHashMap(CustomServiceDef)) !void {
        var in_services = false;
        var in_custom = false;
        var current_name: ?[]const u8 = null;
        var current_def = CustomServiceDef{};
        const custom_indent: usize = 4; // "    custom:" is at indent 4

        var line_iter = std.mem.splitScalar(u8, content, '\n');
        while (line_iter.next()) |line| {
            const trimmed = std.mem.trim(u8, line, " \t\r");
            if (trimmed.len == 0 or trimmed[0] == '#') continue;

            const indent = countLeadingSpaces(line);

            // Top-level key
            if (indent == 0) {
                if (std.mem.eql(u8, trimmed, "services:")) {
                    in_services = true;
                    in_custom = false;
                } else {
                    // Flush current custom service if any
                    if (current_name) |name| {
                        if (current_def.command != null) {
                            try customs.put(name, current_def);
                        } else {
                            self.allocator.free(name);
                            current_def.deinit(self.allocator);
                        }
                        current_name = null;
                        current_def = CustomServiceDef{};
                    }
                    in_services = false;
                    in_custom = false;
                }
                continue;
            }

            if (!in_services) continue;

            // "  custom:" at indent 2 or 4
            if (indent <= custom_indent and std.mem.eql(u8, trimmed, "custom:")) {
                in_custom = true;
                continue;
            }

            // If we're at a sibling key at the same indent as custom:, exit custom section
            if (in_custom and indent <= custom_indent and !std.mem.eql(u8, trimmed, "custom:") and
                !std.mem.startsWith(u8, trimmed, "- "))
            {
                // Flush current
                if (current_name) |name| {
                    if (current_def.command != null) {
                        try customs.put(name, current_def);
                    } else {
                        self.allocator.free(name);
                        current_def.deinit(self.allocator);
                    }
                    current_name = null;
                    current_def = CustomServiceDef{};
                }

                // Check if this is another services-level key (autoStart, enabled, groups)
                if (std.mem.indexOf(u8, trimmed, "autoStart:") != null or
                    std.mem.indexOf(u8, trimmed, "enabled:") != null or
                    std.mem.indexOf(u8, trimmed, "groups:") != null)
                {
                    in_custom = false;
                    continue;
                }
                in_custom = false;
                continue;
            }

            if (!in_custom) continue;

            // Service name line (indent = custom_indent + 2, ends with ":")
            if (indent == custom_indent + 2 and std.mem.endsWith(u8, trimmed, ":") and
                !std.mem.startsWith(u8, trimmed, "- "))
            {
                // Flush previous custom service
                if (current_name) |name| {
                    if (current_def.command != null) {
                        try customs.put(name, current_def);
                    } else {
                        self.allocator.free(name);
                        current_def.deinit(self.allocator);
                    }
                }
                current_def = CustomServiceDef{};
                const svc_name = trimmed[0 .. trimmed.len - 1];
                current_name = try self.allocator.dupe(u8, svc_name);
                continue;
            }

            // Property lines (indent = custom_indent + 4)
            if (current_name != null and indent >= custom_indent + 4) {
                if (std.mem.startsWith(u8, trimmed, "command:")) {
                    const val = parseYamlValue(trimmed["command:".len..]);
                    if (val.len > 0) {
                        current_def.command = try self.allocator.dupe(u8, val);
                    }
                } else if (std.mem.startsWith(u8, trimmed, "port:")) {
                    const val = parseYamlValue(trimmed["port:".len..]);
                    current_def.port = std.fmt.parseInt(u16, val, 10) catch null;
                } else if (std.mem.startsWith(u8, trimmed, "healthCheck:")) {
                    const val = parseYamlValue(trimmed["healthCheck:".len..]);
                    if (val.len > 0) {
                        current_def.health_check = try self.allocator.dupe(u8, val);
                    }
                } else if (std.mem.startsWith(u8, trimmed, "workingDirectory:")) {
                    const val = parseYamlValue(trimmed["workingDirectory:".len..]);
                    if (val.len > 0) {
                        current_def.working_directory = try self.allocator.dupe(u8, val);
                    }
                } else if (std.mem.startsWith(u8, trimmed, "dependsOn:")) {
                    // Parse dependsOn list - collect items from following lines
                    var deps_list: std.ArrayList([]const u8) = .{};
                    while (line_iter.next()) |dep_line| {
                        const dep_trimmed = std.mem.trim(u8, dep_line, " \t\r");
                        const dep_indent = countLeadingSpaces(dep_line);
                        if (dep_trimmed.len == 0 or dep_trimmed[0] == '#') continue;
                        if (dep_indent <= indent or !std.mem.startsWith(u8, dep_trimmed, "- ")) break;
                        const dep_name = std.mem.trim(u8, dep_trimmed[2..], " \t\r");
                        if (dep_name.len > 0) {
                            const duped_dep = self.allocator.dupe(u8, dep_name) catch continue;
                            deps_list.append(self.allocator, duped_dep) catch {
                                self.allocator.free(duped_dep);
                                continue;
                            };
                        }
                    }
                    if (deps_list.items.len > 0) {
                        current_def.depends_on = deps_list.toOwnedSlice(self.allocator) catch null;
                    } else {
                        deps_list.deinit(self.allocator);
                    }
                } else if (std.mem.startsWith(u8, trimmed, "- ") and indent > custom_indent + 4) {
                    // This could be a dependsOn list item at deeper indent; skip
                }
            }
        }

        // Flush final custom service
        if (current_name) |name| {
            if (current_def.command != null) {
                try customs.put(name, current_def);
            } else {
                self.allocator.free(name);
                current_def.deinit(self.allocator);
            }
        }
    }

    /// Count leading spaces in a line
    fn countLeadingSpaces(line: []const u8) usize {
        var count: usize = 0;
        for (line) |c| {
            if (c == ' ') {
                count += 1;
            } else if (c == '\t') {
                count += 2; // treat tab as 2 spaces
            } else {
                break;
            }
        }
        return count;
    }

    /// Parse a YAML value: strip leading/trailing whitespace and quotes
    fn parseYamlValue(raw: []const u8) []const u8 {
        var val = std.mem.trim(u8, raw, " \t\r");
        // Strip surrounding quotes
        if (val.len >= 2) {
            if ((val[0] == '"' and val[val.len - 1] == '"') or
                (val[0] == '\'' and val[val.len - 1] == '\''))
            {
                val = val[1 .. val.len - 1];
            }
        }
        return val;
    }

    /// Start a custom service defined in deps.yaml
    fn startCustomService(self: *ShellCommands, name: []const u8, def: CustomServiceDef, project_root: []const u8) !void {
        style.print("🚀 Starting custom service: {s}...\n", .{name});

        // Build a ServiceConfig from the custom definition
        const env_vars = std.StringHashMap([]const u8).init(self.allocator);

        // Resolve working directory
        var wd: ?[]const u8 = null;
        if (def.working_directory) |w| {
            if (std.mem.eql(u8, w, ".")) {
                wd = try self.allocator.dupe(u8, project_root);
            } else if (w.len > 0 and w[0] == '/') {
                wd = try self.allocator.dupe(u8, w);
            } else {
                wd = try std.fmt.allocPrint(self.allocator, "{s}/{s}", .{ project_root, w });
            }
        }

        const config = lib.services.ServiceConfig{
            .name = try self.allocator.dupe(u8, name),
            .display_name = try self.allocator.dupe(u8, name),
            .description = try std.fmt.allocPrint(self.allocator, "Custom service: {s}", .{name}),
            .start_command = try self.allocator.dupe(u8, def.command orelse return error.MissingCommand),
            .working_directory = wd,
            .env_vars = env_vars,
            .port = def.port,
            .health_check = if (def.health_check) |hc| try self.allocator.dupe(u8, hc) else null,
        };

        // Register and start via ServiceManager
        var mgr = lib.services.manager.ServiceManager.init(self.allocator);
        defer mgr.deinit();

        try mgr.register(config);
        mgr.start(name) catch |err| {
            style.print("⚠️  Failed to start custom service {s}: {s}\n", .{ name, @errorName(err) });
            return;
        };

        style.print("✅ {s} started\n", .{name});
    }

    /// Start a single service by name (with project context for binary resolution)
    fn startService(self: *ShellCommands, service_name: []const u8) !void {
        return self.startServiceWithContext(service_name, null);
    }

    fn startServiceWithContext(self: *ShellCommands, service_name: []const u8, project_root: ?[]const u8) !void {
        return self.startServiceWithContextAndIsolation(service_name, project_root, null);
    }

    /// Start a service with project context and optional per-project isolation
    fn startServiceWithContextAndIsolation(self: *ShellCommands, service_name: []const u8, project_root: ?[]const u8, project_hash: ?[]const u8) !void {
        style.print("🚀 Starting service: {s}...\n", .{service_name});

        // For postgres, ensure PGDATA is initialized
        if (std.mem.eql(u8, service_name, "postgres") or std.mem.eql(u8, service_name, "postgresql")) {
            self.ensurePostgresDataDir(project_root) catch {};
        }

        const service_cmd = @import("../cli/commands/services.zig");

        // Get config and apply project isolation
        var config = service_cmd.getServiceConfig(self.allocator, service_name, project_root) catch |err| {
            style.print("⚠️  Failed to start {s}: {s}\n", .{ service_name, @errorName(err) });
            return;
        };

        // Apply project isolation if available
        if (project_hash) |ph| {
            config.project_id = self.allocator.dupe(u8, ph) catch null;
        }

        var mgr = lib.services.manager.ServiceManager.init(self.allocator);
        defer mgr.deinit();

        const canonical_name = self.allocator.dupe(u8, config.name) catch return;
        defer self.allocator.free(canonical_name);

        mgr.register(config) catch {
            config.deinit(self.allocator);
            return;
        };

        mgr.start(canonical_name) catch |err| {
            style.print("⚠️  Failed to start {s}: {s}\n", .{ service_name, @errorName(err) });
            return;
        };

        style.print("✅ {s} started\n", .{service_name});
    }

    /// Wait for started services to be ready (health checks)
    /// Uses data-driven health checks from ServiceConfig rather than hardcoded commands
    fn waitForServices(self: *ShellCommands, project_root: []const u8) !void {
        const content = blk: {
            const yaml_files = [_][]const u8{ "deps.yaml", "deps.yml", "dependencies.yaml" };
            for (yaml_files) |yaml_name| {
                const candidate = std.fs.path.join(self.allocator, &[_][]const u8{ project_root, yaml_name }) catch continue;
                defer self.allocator.free(candidate);
                break :blk io_helper.readFileAlloc(self.allocator, candidate, 1 * 1024 * 1024) catch continue;
            }
            return;
        };
        defer self.allocator.free(content);

        // Collect service names from autoStart section
        var service_names: std.ArrayList([]const u8) = .{};
        defer service_names.deinit(self.allocator);

        var in_services = false;
        var in_auto_start = false;
        var line_iter = std.mem.splitScalar(u8, content, '\n');
        while (line_iter.next()) |line| {
            const trimmed = std.mem.trim(u8, line, " \t\r");
            if (trimmed.len == 0 or trimmed[0] == '#') continue;

            if (std.mem.eql(u8, trimmed, "services:")) {
                in_services = true;
                in_auto_start = false;
                continue;
            }

            if (in_services and trimmed.len > 0 and trimmed[0] != ' ' and trimmed[0] != '-' and
                !std.mem.startsWith(u8, line, " ") and !std.mem.startsWith(u8, line, "\t"))
            {
                if (!std.mem.eql(u8, trimmed, "services:")) {
                    in_services = false;
                    in_auto_start = false;
                    continue;
                }
            }

            if (in_services) {
                if (std.mem.indexOf(u8, trimmed, "autoStart:") != null) {
                    in_auto_start = true;
                    continue;
                }
                if (in_auto_start and std.mem.startsWith(u8, trimmed, "- ")) {
                    const svc_name = std.mem.trim(u8, trimmed[2..], " \t\r");
                    if (svc_name.len > 0) {
                        service_names.append(self.allocator, svc_name) catch continue;
                    }
                } else if (in_auto_start and !std.mem.startsWith(u8, trimmed, "- ")) {
                    in_auto_start = false;
                }
            }
        }

        // Run health checks for each service
        const service_cmd = @import("../cli/commands/services.zig");
        for (service_names.items) |svc_name| {
            var config = service_cmd.getServiceConfig(self.allocator, svc_name, project_root) catch continue;
            defer config.deinit(self.allocator);

            const health_cmd = config.health_check orelse continue;

            // Run health check with up to 10 retries, 500ms delay
            var attempts: u32 = 0;
            while (attempts < 10) : (attempts += 1) {
                const result = io_helper.childRun(self.allocator, &[_][]const u8{
                    "sh", "-c", health_cmd,
                }) catch {
                    io_helper.nanosleep(0, 500 * std.time.ns_per_ms);
                    continue;
                };
                defer self.allocator.free(result.stdout);
                defer self.allocator.free(result.stderr);
                if (result.term == .exited and result.term.exited == 0) break;
                io_helper.nanosleep(0, 500 * std.time.ns_per_ms);
            }
        }
    }

    /// Ensure PostgreSQL data directory exists and is initialized
    fn ensurePostgresDataDir(self: *ShellCommands, project_root: ?[]const u8) !void {
        const home_dir = try lib.core.Paths.home(self.allocator);
        defer self.allocator.free(home_dir);

        const pgdata = try std.fmt.allocPrint(self.allocator, "{s}/.local/share/pantry/data/postgres", .{home_dir});
        defer self.allocator.free(pgdata);

        // Check if PGDATA already exists and has content
        io_helper.accessAbsolute(pgdata, .{}) catch {
            // PGDATA doesn't exist - create it and run initdb
            io_helper.makePath(pgdata) catch return;

            style.print("  📀 Initializing PostgreSQL data directory...\n", .{});

            // Find initdb binary
            var initdb_path: []const u8 = "initdb";
            var initdb_allocated = false;
            defer if (initdb_allocated) self.allocator.free(initdb_path);

            if (project_root) |pr| {
                const local = try std.fmt.allocPrint(self.allocator, "{s}/pantry/.bin/initdb", .{pr});
                io_helper.accessAbsolute(local, .{}) catch {
                    self.allocator.free(local);
                    return;
                };
                initdb_path = local;
                initdb_allocated = true;
            }

            const result = io_helper.childRun(self.allocator, &[_][]const u8{
                initdb_path, "-D", pgdata, "--no-locale", "--encoding=UTF8",
            }) catch |err| {
                style.print("  ⚠️  initdb failed: {s}\n", .{@errorName(err)});
                return;
            };
            defer self.allocator.free(result.stdout);
            defer self.allocator.free(result.stderr);

            if (result.term == .exited and result.term.exited == 0) {
                style.print("  ✓ PostgreSQL data directory initialized\n", .{});
            } else {
                style.print("  ⚠️  initdb failed (exit {d})\n", .{if (result.term == .exited) result.term.exited else 0});
                if (result.stderr.len > 0) {
                    style.print("    {s}\n", .{result.stderr[0..@min(result.stderr.len, 200)]});
                }
            }
            return;
        };

        // Check if it has PG_VERSION (initialized)
        const pg_version_path = try std.fmt.allocPrint(self.allocator, "{s}/PG_VERSION", .{pgdata});
        defer self.allocator.free(pg_version_path);

        io_helper.accessAbsolute(pg_version_path, .{}) catch {
            // Directory exists but not initialized
            style.print("  📀 Initializing PostgreSQL data directory...\n", .{});

            var initdb_path: []const u8 = "initdb";
            var initdb_allocated = false;
            defer if (initdb_allocated) self.allocator.free(initdb_path);

            if (project_root) |pr| {
                const local = try std.fmt.allocPrint(self.allocator, "{s}/pantry/.bin/initdb", .{pr});
                io_helper.accessAbsolute(local, .{}) catch {
                    self.allocator.free(local);
                    return;
                };
                initdb_path = local;
                initdb_allocated = true;
            }

            const result = io_helper.childRun(self.allocator, &[_][]const u8{
                initdb_path, "-D", pgdata, "--no-locale", "--encoding=UTF8",
            }) catch return;
            defer self.allocator.free(result.stdout);
            defer self.allocator.free(result.stderr);

            if (result.term == .exited and result.term.exited == 0) {
                style.print("  ✓ PostgreSQL data directory initialized\n", .{});
            }
        };
    }

    /// Auto-create database based on .env file if postgres is a dependency
    fn autoCreateDatabase(self: *ShellCommands, project_root: []const u8) !void {
        // Check if .env exists in project root
        const env_path = try std.fs.path.join(self.allocator, &[_][]const u8{
            project_root, ".env",
        });
        defer self.allocator.free(env_path);

        const env_content = io_helper.readFileAlloc(self.allocator, env_path, 1 * 1024 * 1024) catch return;
        defer self.allocator.free(env_content);

        // Parse DB_CONNECTION, DB_DATABASE, DB_HOST, DB_PORT, DB_USERNAME from .env
        var db_connection: ?[]const u8 = null;
        var db_database: ?[]const u8 = null;
        var db_host: []const u8 = "127.0.0.1";
        var db_port: []const u8 = "5432";
        var db_username: ?[]const u8 = null;

        var line_iter = std.mem.splitScalar(u8, env_content, '\n');
        while (line_iter.next()) |line| {
            const trimmed = std.mem.trim(u8, line, " \t\r");
            if (trimmed.len == 0 or trimmed[0] == '#') continue;

            if (std.mem.startsWith(u8, trimmed, "DB_CONNECTION=")) {
                db_connection = std.mem.trim(u8, trimmed["DB_CONNECTION=".len..], " \t\r\"'");
            } else if (std.mem.startsWith(u8, trimmed, "DB_DATABASE=")) {
                db_database = std.mem.trim(u8, trimmed["DB_DATABASE=".len..], " \t\r\"'");
            } else if (std.mem.startsWith(u8, trimmed, "DB_HOST=")) {
                db_host = std.mem.trim(u8, trimmed["DB_HOST=".len..], " \t\r\"'");
            } else if (std.mem.startsWith(u8, trimmed, "DB_PORT=")) {
                db_port = std.mem.trim(u8, trimmed["DB_PORT=".len..], " \t\r\"'");
            } else if (std.mem.startsWith(u8, trimmed, "DB_USERNAME=")) {
                db_username = std.mem.trim(u8, trimmed["DB_USERNAME=".len..], " \t\r\"'");
            }
        }

        // Only handle PostgreSQL for now
        const connection = db_connection orelse return;
        if (!std.mem.eql(u8, connection, "pgsql") and !std.mem.eql(u8, connection, "postgres")) return;

        const database = db_database orelse return;
        if (database.len == 0) return;

        const username = db_username orelse return;
        if (username.len == 0) return;

        // Build PATH with pantry/.bin so pantry-installed psql/createdb are found
        const check_cmd = try std.fmt.allocPrint(
            self.allocator,
            "export PATH=\"{s}/pantry/.bin:$PATH\"; psql -h {s} -p {s} -U {s} -d {s} -c 'SELECT 1' > /dev/null 2>&1",
            .{ project_root, db_host, db_port, username, database },
        );
        defer self.allocator.free(check_cmd);

        const check = io_helper.childRun(self.allocator, &[_][]const u8{
            "sh", "-c", check_cmd,
        }) catch return;
        self.allocator.free(check.stdout);
        self.allocator.free(check.stderr);

        if (check.term == .exited and check.term.exited == 0) return; // DB exists

        // Database doesn't exist - create it
        style.print("📀 Creating database '{s}'...\n", .{database});

        const create_cmd = try std.fmt.allocPrint(
            self.allocator,
            "export PATH=\"{s}/pantry/.bin:$PATH\"; createdb -h {s} -p {s} -U {s} {s}",
            .{ project_root, db_host, db_port, username, database },
        );
        defer self.allocator.free(create_cmd);

        const create = io_helper.childRun(self.allocator, &[_][]const u8{
            "sh", "-c", create_cmd,
        }) catch return;
        defer self.allocator.free(create.stdout);
        defer self.allocator.free(create.stderr);

        if (create.term == .exited and create.term.exited == 0) {
            style.print("  ✓ Database '{s}' created\n", .{database});
        } else {
            style.print("  ✗ Failed to create database '{s}'\n", .{database});
            if (create.stderr.len > 0) {
                style.print("    {s}\n", .{create.stderr[0..@min(create.stderr.len, 200)]});
            }
        }
    }

    /// Execute postSetup commands from pantry.config.ts / pantry.config.js
    fn executePostSetupCommands(self: *ShellCommands, project_root: []const u8) !void {
        // Look for pantry.config.ts or pantry.config.js
        const config_names = [_][]const u8{
            "pantry.config.ts",
            "pantry.config.js",
            ".pantry.config.ts",
            ".pantry.config.js",
        };

        var config_path: ?[]const u8 = null;
        defer if (config_path) |p| self.allocator.free(p);

        for (config_names) |name| {
            const candidate = std.fs.path.join(self.allocator, &[_][]const u8{
                project_root,
                name,
            }) catch continue;

            io_helper.accessAbsolute(candidate, .{}) catch {
                self.allocator.free(candidate);
                continue;
            };

            config_path = candidate;
            break;
        }

        const cfg_path = config_path orelse {
            return; // No config file found
        };

        // Execute config file using bun or node to get JSON output
        // Build list of runtime paths to try (project-local, global, system)
        const home_dir = lib.core.Paths.home(self.allocator) catch null;
        defer if (home_dir) |h| self.allocator.free(h);

        // Collect runtime paths to try
        var runtime_paths: [8][]const u8 = undefined;
        var runtime_count: usize = 0;
        var runtime_allocs: [8]bool = .{ false, false, false, false, false, false, false, false };

        // 1. Project-local pantry/.bin/bun and pantry/.bin/node
        for ([_][]const u8{ "bun", "node" }) |name| {
            const local = std.fmt.allocPrint(self.allocator, "{s}/pantry/.bin/{s}", .{ project_root, name }) catch continue;
            if (blk: {
                io_helper.accessAbsolute(local, .{}) catch break :blk false;
                break :blk true;
            }) {
                runtime_paths[runtime_count] = local;
                runtime_allocs[runtime_count] = true;
                runtime_count += 1;
            } else {
                self.allocator.free(local);
            }
        }

        // 2. Global pantry bun/node
        if (home_dir) |h| {
            for ([_][]const u8{ "bun", "node" }) |name| {
                const global = std.fmt.allocPrint(self.allocator, "{s}/.local/share/pantry/global/bin/{s}", .{ h, name }) catch continue;
                if (blk: {
                    io_helper.accessAbsolute(global, .{}) catch break :blk false;
                    break :blk true;
                }) {
                    runtime_paths[runtime_count] = global;
                    runtime_allocs[runtime_count] = true;
                    runtime_count += 1;
                } else {
                    self.allocator.free(global);
                }
            }
        }

        // 3. System paths
        for ([_][]const u8{ "/opt/homebrew/bin/bun", "/opt/homebrew/bin/node", "/usr/local/bin/bun", "/usr/local/bin/node" }) |path| {
            if (blk: {
                io_helper.accessAbsolute(path, .{}) catch break :blk false;
                break :blk true;
            }) {
                runtime_paths[runtime_count] = path;
                runtime_count += 1;
            }
        }

        defer for (0..runtime_count) |i| {
            if (runtime_allocs[i]) self.allocator.free(runtime_paths[i]);
        };

        var json_output: ?[]const u8 = null;
        defer if (json_output) |j| self.allocator.free(j);

        for (runtime_paths[0..runtime_count]) |runtime| {
            const wrapper = std.fmt.allocPrint(
                self.allocator,
                "import c from '{s}'; console.log(JSON.stringify(c.default || c));",
                .{cfg_path},
            ) catch continue;
            defer self.allocator.free(wrapper);

            const result = io_helper.childRun(
                self.allocator,
                &[_][]const u8{ runtime, "-e", wrapper },
            ) catch continue;
            defer self.allocator.free(result.stderr);

            if (result.term == .exited and result.term.exited == 0 and result.stdout.len > 0) {
                json_output = result.stdout;
                break;
            }
            self.allocator.free(result.stdout);
        }

        const json_str = json_output orelse return;

        // Parse JSON to extract postSetup commands
        const parsed = std.json.parseFromSlice(std.json.Value, self.allocator, json_str, .{}) catch return;
        defer parsed.deinit();

        const root = parsed.value;
        if (root != .object) return;

        const post_setup = root.object.get("postSetup") orelse return;
        if (post_setup != .object) return;

        // Check if enabled (default: true if postSetup exists)
        if (post_setup.object.get("enabled")) |enabled_val| {
            if (enabled_val == .bool and !enabled_val.bool) return;
        }

        const commands = post_setup.object.get("commands") orelse return;
        if (commands != .array) return;

        if (commands.array.items.len == 0) return;

        style.print("🔧 Running post-setup commands...\n", .{});

        for (commands.array.items) |cmd_val| {
            if (cmd_val != .object) continue;
            const cmd_obj = cmd_val.object;

            const command_str = blk: {
                const cmd = cmd_obj.get("command") orelse continue;
                if (cmd != .string) continue;
                break :blk cmd.string;
            };

            const cmd_name = blk: {
                if (cmd_obj.get("name")) |n| {
                    if (n == .string) break :blk n.string;
                }
                break :blk command_str;
            };

            const description = blk: {
                if (cmd_obj.get("description")) |d| {
                    if (d == .string) break :blk d.string;
                }
                break :blk cmd_name;
            };

            style.print("  → {s}...\n", .{description});

            // Build full command string with args if provided
            var base_cmd: []const u8 = command_str;
            var base_cmd_alloc = false;
            defer if (base_cmd_alloc) self.allocator.free(base_cmd);

            if (cmd_obj.get("args")) |args_val| {
                if (args_val == .array and args_val.array.items.len > 0) {
                    var parts: std.ArrayList(u8) = .{};
                    defer parts.deinit(self.allocator);
                    parts.appendSlice(self.allocator, command_str) catch continue;
                    for (args_val.array.items) |arg| {
                        if (arg == .string) {
                            parts.append(self.allocator, ' ') catch continue;
                            parts.appendSlice(self.allocator, arg.string) catch continue;
                        }
                    }
                    base_cmd = parts.toOwnedSlice(self.allocator) catch continue;
                    base_cmd_alloc = true;
                }
            }

            // Wrap command with PATH that includes pantry/.bin so installed tools are available
            const wrapped_cmd = std.fmt.allocPrint(
                self.allocator,
                "export PATH=\"{s}/pantry/.bin:$PATH\"; {s}",
                .{ project_root, base_cmd },
            ) catch continue;
            defer self.allocator.free(wrapped_cmd);

            // Change to project directory for command execution
            var pr_buf: [std.fs.max_path_bytes:0]u8 = undefined;
            @memcpy(pr_buf[0..project_root.len], project_root);
            pr_buf[project_root.len] = 0;

            const original_cwd = io_helper.getCwdAlloc(self.allocator) catch continue;
            defer self.allocator.free(original_cwd);

            if (std.c.chdir(&pr_buf) != 0) continue;
            defer {
                var oc_buf: [std.fs.max_path_bytes:0]u8 = undefined;
                @memcpy(oc_buf[0..original_cwd.len], original_cwd);
                oc_buf[original_cwd.len] = 0;
                _ = std.c.chdir(&oc_buf);
            }

            const result = io_helper.childRun(
                self.allocator,
                &[_][]const u8{ "sh", "-c", wrapped_cmd },
            ) catch |err| {
                style.print("  ✗ {s} failed: {s}\n", .{ cmd_name, @errorName(err) });
                // Check if required (default: true)
                if (cmd_obj.get("required")) |req| {
                    if (req == .bool and !req.bool) continue;
                }
                return err;
            };
            defer self.allocator.free(result.stdout);
            defer self.allocator.free(result.stderr);

            const cmd_failed = result.term != .exited or result.term.exited != 0;
            if (cmd_failed) {
                const exit_code: u32 = if (result.term == .exited) result.term.exited else 0;
                style.print("  ✗ {s} failed (exit {d})\n", .{ cmd_name, exit_code });
                // Print last 20 lines of output for debugging (errors are usually at the bottom)
                const output = if (result.stderr.len > 0) result.stderr else result.stdout;
                if (output.len > 0) {
                    // Count total non-empty lines first
                    var total_lines: u32 = 0;
                    var count_iter = std.mem.splitScalar(u8, output, '\n');
                    while (count_iter.next()) |out_line| {
                        if (out_line.len > 0) total_lines += 1;
                    }
                    // Print the last 20 lines
                    const skip_lines = if (total_lines > 20) total_lines - 20 else 0;
                    var lines = std.mem.splitScalar(u8, output, '\n');
                    var line_count: u32 = 0;
                    while (lines.next()) |out_line| {
                        if (out_line.len > 0) {
                            if (line_count >= skip_lines) {
                                style.print("    {s}\n", .{out_line[0..@min(out_line.len, 200)]});
                            }
                            line_count += 1;
                        }
                    }
                }
                // Check if required (default: true)
                if (cmd_obj.get("required")) |req| {
                    if (req == .bool and !req.bool) continue;
                }
                return error.PostSetupCommandFailed;
            }

            style.print("  ✓ {s}\n", .{cmd_name});
        }
    }

    fn detectProjectRoot(self: *ShellCommands, pwd: []const u8) !?[]const u8 {
        // Known dependency files to look for (ordered by priority)
        const dep_files = [_][]const u8{
            "pantry.json",
            "pantry.jsonc",
            "deps.yaml",
            "deps.yml",
            "dependencies.yaml",
            "pkgx.yaml",
            "package.json",
            "Cargo.toml",
            "go.mod",
            "pyproject.toml",
            "requirements.txt",
            "Gemfile",
            "composer.json",
        };

        var current_dir = try self.allocator.dupe(u8, pwd);
        defer self.allocator.free(current_dir);

        while (true) {
            // Check for any dependency file
            for (dep_files) |dep_file| {
                const file_path = try std.fs.path.join(self.allocator, &[_][]const u8{
                    current_dir,
                    dep_file,
                });
                defer self.allocator.free(file_path);

                io_helper.cwd().access(io_helper.io, file_path, .{}) catch continue;

                // Found a dependency file!
                return try self.allocator.dupe(u8, current_dir);
            }

            // Move up directory tree
            const parent = std.fs.path.dirname(current_dir) orelse break;
            if (std.mem.eql(u8, parent, current_dir)) break; // Reached root

            // Duplicate parent before freeing current_dir since parent points into current_dir
            const new_dir = try self.allocator.dupe(u8, parent);
            self.allocator.free(current_dir);
            current_dir = new_dir;
        }

        return null;
    }

    fn findDependencyFile(self: *ShellCommands, project_root: []const u8) !?[]const u8 {
        const dep_files = [_][]const u8{
            "pantry.json",
            "pantry.jsonc",
            "deps.yaml",
            "deps.yml",
            "dependencies.yaml",
            "pkgx.yaml",
            "package.json",
            "Cargo.toml",
            "go.mod",
            "pyproject.toml",
            "requirements.txt",
            "Gemfile",
            "composer.json",
        };

        for (dep_files) |dep_file| {
            const file_path = try std.fs.path.join(self.allocator, &[_][]const u8{
                project_root,
                dep_file,
            });
            errdefer self.allocator.free(file_path);

            io_helper.cwd().access(io_helper.io, file_path, .{}) catch {
                self.allocator.free(file_path);
                continue;
            };

            return file_path;
        }

        return null;
    }
};

test "ShellCommands init and deinit" {
    const allocator = std.testing.allocator;

    var commands = try ShellCommands.init(allocator);
    defer commands.deinit();
}

test "ShellCommands lookup cache miss" {
    const allocator = std.testing.allocator;

    var commands = try ShellCommands.init(allocator);
    defer commands.deinit();

    const result = try commands.lookup("/nonexistent/path");
    try std.testing.expect(result == null);
}

test "ShellCommands detectProjectRoot" {
    const allocator = std.testing.allocator;

    var commands = try ShellCommands.init(allocator);
    defer commands.deinit();

    // Create test project structure
    const test_dir = "test_project_detect";
    io_helper.cwd().makeDir(io_helper.io, test_dir) catch {};
    defer io_helper.deleteTree(test_dir) catch {};

    const pkg_json = try std.fs.path.join(allocator, &[_][]const u8{ test_dir, "package.json" });
    defer allocator.free(pkg_json);

    {
        const file = try io_helper.cwd().createFile(io_helper.io, pkg_json, .{});
        defer file.close(io_helper.io);
        try io_helper.writeAllToFile(file, "{}");
    }

    const root = try commands.detectProjectRoot(test_dir);
    try std.testing.expect(root != null);
    if (root) |r| {
        defer allocator.free(r);
        try std.testing.expect(std.mem.indexOf(u8, r, test_dir) != null);
    }
}

test "ShellCommands activate generates shell code" {
    const allocator = std.testing.allocator;

    var commands = try ShellCommands.init(allocator);
    defer commands.deinit();

    // Create test project
    const test_dir = "test_project_activate";
    io_helper.cwd().makeDir(io_helper.io, test_dir) catch {};
    defer io_helper.deleteTree(test_dir) catch {};

    const pkg_json = try std.fs.path.join(allocator, &[_][]const u8{ test_dir, "package.json" });
    defer allocator.free(pkg_json);

    {
        const file = try io_helper.cwd().createFile(io_helper.io, pkg_json, .{});
        defer file.close(io_helper.io);
        try io_helper.writeAllToFile(file, "{}");
    }

    const shell_code = try commands.activate(test_dir);
    defer allocator.free(shell_code);

    try std.testing.expect(shell_code.len > 0);
    try std.testing.expect(std.mem.indexOf(u8, shell_code, "PANTRY_CURRENT_PROJECT") != null);
    try std.testing.expect(std.mem.indexOf(u8, shell_code, "PANTRY_ENV_BIN_PATH") != null);
    try std.testing.expect(std.mem.indexOf(u8, shell_code, "export PATH") != null);
}
