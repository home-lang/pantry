//! Workspace Package Installation
//!
//! Handles installation for workspace/monorepo setups.

const std = @import("std");
const io_helper = @import("../../../io_helper.zig");
const lib = @import("../../../lib.zig");
const types = @import("types.zig");

const cache = lib.cache;
const install = lib.install;
const helpers = @import("helpers.zig");

/// Result of a single workspace remote package install
const WorkspaceInstallResult = struct {
    name: []const u8,
    version: []const u8,
    success: bool,
    error_msg: ?[]const u8,

    fn deinit(self: *WorkspaceInstallResult, allocator: std.mem.Allocator) void {
        if (self.error_msg) |msg| allocator.free(msg);
    }
};

/// Install a single remote workspace dependency (runs in thread).
/// Uses a shared Installer for deduplication via InstallingStack.
fn installSingleWorkspaceDep(
    allocator: std.mem.Allocator,
    dep: lib.deps.parser.PackageDependency,
    workspace_root: []const u8,
    shared_installer: *install.Installer,
) WorkspaceInstallResult {
    const parser = @import("../../../deps/parser.zig");
    const pkg_registry = @import("../../../packages/generated.zig");

    const clean_name = if (std.mem.startsWith(u8, dep.name, "auto:"))
        dep.name[5..]
    else if (std.mem.startsWith(u8, dep.name, "npm:"))
        dep.name[4..]
    else if (std.mem.startsWith(u8, dep.name, "local:"))
        dep.name[6..]
    else
        dep.name;

    const is_npm_package = std.mem.startsWith(u8, dep.name, "npm:") or
        std.mem.startsWith(u8, dep.name, "auto:");

    const pkg_source: lib.packages.PackageSource = switch (dep.source) {
        .registry => .pkgx,
        .github => .github,
        .git => .git,
        .url => .http,
    };

    // For npm/auto packages, try Pantry DynamoDB then npm registry
    if (is_npm_package or (pkg_source == .pkgx and
        pkg_registry.getPackageByName(clean_name) == null))
    {
        // Try Pantry DynamoDB registry first
        if (helpers.lookupPantryRegistry(allocator, clean_name) catch |err| lkup: {
            std.debug.print("\x1b[2m  ? {s}: pantry registry lookup failed: {}\x1b[0m\n", .{ clean_name, err });
            break :lkup null;
        }) |info| {
            var pantry_info = info;
            defer pantry_info.deinit(allocator);

            const npm_spec = lib.packages.PackageSpec{
                .name = clean_name,
                .version = allocator.dupe(u8, pantry_info.version) catch return .{
                    .name = clean_name, .version = dep.version, .success = false, .error_msg = null,
                },
                .source = .npm,
                .url = allocator.dupe(u8, pantry_info.tarball_url) catch return .{
                    .name = clean_name, .version = dep.version, .success = false, .error_msg = null,
                },
            };
            defer allocator.free(npm_spec.version);
            defer allocator.free(npm_spec.url.?);

            var result = shared_installer.install(npm_spec, .{
                .project_root = workspace_root,
                .quiet = true,
            }) catch |err| {
                return .{
                    .name = clean_name,
                    .version = dep.version,
                    .success = false,
                    .error_msg = std.fmt.allocPrint(allocator, "{any}", .{err}) catch null,
                };
            };
            const ver = allocator.dupe(u8, result.version) catch dep.version;
            result.deinit(allocator);
            return .{ .name = clean_name, .version = ver, .success = true, .error_msg = null };
        }

        // Fall back to npm registry
        const npm_info = shared_installer.resolveNpmPackage(clean_name, dep.version) catch |err| {
            return .{
                .name = clean_name,
                .version = dep.version,
                .success = false,
                .error_msg = std.fmt.allocPrint(allocator, "not found in pantry or npm: {}", .{err}) catch null,
            };
        };
        defer allocator.free(npm_info.version);
        defer allocator.free(npm_info.tarball_url);

        const npm_spec = lib.packages.PackageSpec{
            .name = clean_name,
            .version = npm_info.version,
            .source = .npm,
            .url = npm_info.tarball_url,
        };

        var result = shared_installer.install(npm_spec, .{
            .project_root = workspace_root,
            .quiet = true,
        }) catch |err| {
            return .{
                .name = clean_name,
                .version = dep.version,
                .success = false,
                .error_msg = std.fmt.allocPrint(allocator, "{any}", .{err}) catch null,
            };
        };
        const ver = allocator.dupe(u8, result.version) catch dep.version;
        result.deinit(allocator);
        return .{ .name = clean_name, .version = ver, .success = true, .error_msg = null };
    }

    // Create package spec for pkgx/GitHub packages
    var repo_owned: ?[]const u8 = null;
    const spec = if (pkg_source == .github and dep.github_ref != null) blk: {
        const gh_ref = dep.github_ref.?;
        repo_owned = std.fmt.allocPrint(allocator, "{s}/{s}", .{ gh_ref.owner, gh_ref.repo }) catch return .{
            .name = clean_name, .version = dep.version, .success = false, .error_msg = null,
        };
        break :blk lib.packages.PackageSpec{
            .name = clean_name,
            .version = gh_ref.ref,
            .source = .github,
            .repo = repo_owned,
        };
    } else if (pkg_source == .github) blk: {
        const gh_ref = parser.parseGitHubUrl(allocator, dep.version) catch return .{
            .name = clean_name, .version = dep.version, .success = false, .error_msg = null,
        };
        if (gh_ref == null) {
            return .{
                .name = clean_name,
                .version = dep.version,
                .success = false,
                .error_msg = std.fmt.allocPrint(allocator, "invalid GitHub URL", .{}) catch null,
            };
        }
        const ref = gh_ref.?;
        defer {
            allocator.free(ref.owner);
            allocator.free(ref.repo);
            allocator.free(ref.ref);
        }
        repo_owned = std.fmt.allocPrint(allocator, "{s}/{s}", .{ ref.owner, ref.repo }) catch return .{
            .name = clean_name, .version = dep.version, .success = false, .error_msg = null,
        };
        break :blk lib.packages.PackageSpec{
            .name = clean_name,
            .version = ref.ref,
            .source = .github,
            .repo = repo_owned,
        };
    } else lib.packages.PackageSpec{
        .name = clean_name,
        .version = dep.version,
        .source = pkg_source,
    };
    defer if (repo_owned) |r| allocator.free(r);

    var result = shared_installer.install(spec, .{
        .project_root = workspace_root,
        .quiet = true,
    }) catch |err| {
        return .{
            .name = clean_name,
            .version = dep.version,
            .success = false,
            .error_msg = std.fmt.allocPrint(allocator, "{any}", .{err}) catch null,
        };
    };
    const ver = allocator.dupe(u8, result.version) catch dep.version;
    result.deinit(allocator);
    return .{ .name = clean_name, .version = ver, .success = true, .error_msg = null };
}

/// Thread context for parallel workspace installs
const WorkspaceThreadContext = struct {
    deps: []const lib.deps.parser.PackageDependency,
    results: []WorkspaceInstallResult,
    next: *std.atomic.Value(usize),
    alloc: std.mem.Allocator,
    workspace_root: []const u8,
    shared_installer: *install.Installer,
    lockfile_packages: ?*const std.StringHashMap(lib.packages.LockfileEntry),

    fn worker(ctx: *WorkspaceThreadContext) void {
        while (true) {
            const i = ctx.next.fetchAdd(1, .monotonic);
            if (i >= ctx.deps.len) break;

            // Skip packages that match lockfile and exist at destination
            if (ctx.lockfile_packages) |lf_pkgs| {
                if (helpers.canSkipFromLockfile(lf_pkgs, ctx.deps[i].name, ctx.deps[i].version, ctx.workspace_root, ctx.alloc)) {
                    const clean = helpers.stripDisplayPrefix(ctx.deps[i].name);
                    ctx.results[i] = .{
                        .name = clean,
                        .version = ctx.deps[i].version,
                        .success = true,
                        .error_msg = null,
                    };
                    continue;
                }
            }

            ctx.results[i] = installSingleWorkspaceDep(
                ctx.alloc,
                ctx.deps[i],
                ctx.workspace_root,
                ctx.shared_installer,
            );
        }
    }
};

pub fn installWorkspaceCommand(
    allocator: std.mem.Allocator,
    workspace_root: []const u8,
    workspace_file_path: []const u8,
) !types.CommandResult {
    return installWorkspaceCommandWithOptions(allocator, workspace_root, workspace_file_path, .{});
}

pub fn installWorkspaceCommandWithOptions(
    allocator: std.mem.Allocator,
    workspace_root: []const u8,
    workspace_file_path: []const u8,
    options: types.InstallOptions,
) !types.CommandResult {
    const workspace_module = @import("../../../packages/workspace.zig");
    const parser = @import("../../../deps/parser.zig");

    // Load workspace configuration
    var workspace_config = try workspace_module.loadWorkspaceConfig(
        allocator,
        workspace_file_path,
        workspace_root,
    );
    defer workspace_config.deinit(allocator);

    // Load catalogs from root package.json
    var catalog_manager = lib.deps.catalogs.CatalogManager.init(allocator);
    defer catalog_manager.deinit();

    const root_package_json_path = try std.fs.path.join(allocator, &[_][]const u8{ workspace_root, "package.json" });
    defer allocator.free(root_package_json_path);

    if (io_helper.readFileAlloc(allocator, root_package_json_path, 1024 * 1024)) |package_json_content| {
        defer allocator.free(package_json_content);

        if (std.json.parseFromSlice(std.json.Value, allocator, package_json_content, .{})) |parsed| {
            defer parsed.deinit();
            catalog_manager = try lib.deps.catalogs.parseFromPackageJson(allocator, parsed);

            // Show catalog info if any catalogs were loaded
            var catalog_count: usize = 0;
            if (catalog_manager.default_catalog != null) catalog_count += 1;
            catalog_count += catalog_manager.named_catalogs.count();

            if (catalog_count > 0) {
                std.debug.print("📚 Found {d} catalog(s)\n", .{catalog_count});
            }
        } else |_| {
            // Failed to parse package.json, continue without catalogs
        }
    } else |_| {
        // No package.json or failed to read, continue without catalogs
    }

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

    // Apply filter if provided
    const filter_module = @import("../../../packages/filter.zig");
    var filter = if (options.filter) |filter_str| blk: {
        // Parse filter string - could be comma-separated patterns
        var patterns_list = std.ArrayList([]const u8){};
        defer patterns_list.deinit(allocator);

        var iter = std.mem.splitScalar(u8, filter_str, ',');
        while (iter.next()) |pattern| {
            const trimmed = std.mem.trim(u8, pattern, " \t");
            if (trimmed.len > 0) {
                try patterns_list.append(allocator, trimmed);
            }
        }

        break :blk try filter_module.Filter.initWithPatterns(allocator, patterns_list.items);
    } else filter_module.Filter.init(allocator);
    defer filter.deinit();

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
        // Skip members that don't match the filter
        if (!filter.matchesMember(member)) {
            continue;
        }

        std.debug.print("{s}📦 {s}{s}\n", .{ dim, member.name, reset });

        // Load dependencies for this member
        var member_deps: ?[]parser.PackageDependency = null;
        defer if (member_deps) |deps| {
            allocator.free(deps);
        };

        // Try config file first
        if (member.config_path) |_| {
            var config_result = @import("../../../config/loader.zig").loadpantryConfig(
                allocator,
                .{
                    .name = "pantry",
                    .cwd = member.abs_path,
                },
            ) catch null;

            if (config_result) |*config| {
                defer config.deinit();
                const deps_extractor = @import("../../../config/dependencies.zig");
                member_deps = try deps_extractor.extractDependencies(allocator, config.*);
            }
        }

        // Try deps file if config didn't work
        if (member_deps == null and member.deps_file_path != null) {
            const detector = @import("../../../deps/detector.zig");
            if (try detector.findDepsFile(allocator, member.abs_path)) |deps_file| {
                defer allocator.free(deps_file.path);
                member_deps = try parser.inferDependencies(allocator, deps_file);
            }
        }

        if (member_deps) |deps| {
            for (deps) |dep| {
                // Skip workspace:* references — these are resolved via symlinks, not installed
                if (std.mem.startsWith(u8, dep.version, "workspace:")) {
                    continue;
                }

                // Resolve catalog references
                var resolved_dep = dep;

                if (lib.deps.catalogs.CatalogManager.isCatalogReference(dep.version)) {
                    if (catalog_manager.resolveCatalogReference(dep.name, dep.version)) |resolved_version| {
                        // Replace catalog reference with actual version
                        allocator.free(resolved_dep.version);
                        resolved_dep.version = try allocator.dupe(u8, resolved_version);
                    } else {
                        // Catalog reference not found - warn user
                        const catalog_name = lib.deps.catalogs.CatalogManager.getCatalogName(dep.version);
                        if (catalog_name) |cat_name| {
                            if (cat_name.len == 0) {
                                std.debug.print("Warning: Package '{s}' references default catalog but no version found\n", .{dep.name});
                            } else {
                                std.debug.print("Warning: Package '{s}' references catalog '{s}' but no version found\n", .{ dep.name, cat_name });
                            }
                        }
                        // Skip this dependency
                        continue;
                    }
                }

                // Create a unique key for this dependency
                const dep_key = try std.fmt.allocPrint(allocator, "{s}@{s}", .{ resolved_dep.name, resolved_dep.version });
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
                    all_deps_buffer[all_deps_count] = try resolved_dep.clone(allocator);
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
    try io_helper.makePath(env_dir);
    const bin_dir = try std.fmt.allocPrint(allocator, "{s}/bin", .{env_dir});
    defer allocator.free(bin_dir);
    try io_helper.makePath(bin_dir);

    // Install each dependency using a shared installer for deduplication
    var pkg_cache = try cache.PackageCache.init(allocator);
    defer pkg_cache.deinit();

    var shared_installer = try install.Installer.init(allocator, &pkg_cache);
    allocator.free(shared_installer.data_dir);
    shared_installer.data_dir = try allocator.dupe(u8, env_dir);
    defer shared_installer.deinit();

    var success_count: usize = 0;
    var failed_count: usize = 0;

    // Read existing lockfile for incremental install skipping
    const lockfile_reader = @import("../../../packages/lockfile.zig");
    const ws_lockfile_path = try std.fmt.allocPrint(allocator, "{s}/pantry.lock", .{workspace_root});
    defer allocator.free(ws_lockfile_path);
    var existing_lockfile: ?lib.packages.Lockfile = lockfile_reader.readLockfile(allocator, ws_lockfile_path) catch null;
    defer if (existing_lockfile) |*lf| lf.deinit(allocator);

    // Clean up dependencies after installation
    defer {
        for (all_deps_buffer[0..all_deps_count]) |*dep| {
            var d = dep.*;
            d.deinit(allocator);
        }
    }

    const all_deps = all_deps_buffer[0..all_deps_count];

    // Check if all packages can be skipped (lockfile + destination match)
    var ws_skipped_count: usize = 0;
    if (existing_lockfile) |*lf| {
        for (all_deps) |dep| {
            if (helpers.canSkipFromLockfile(&lf.packages, dep.name, dep.version, workspace_root, allocator)) {
                ws_skipped_count += 1;
            }
        }
    }

    if (ws_skipped_count == all_deps_count) {
        std.debug.print("{s}✓{s} All {d} packages already up to date\n", .{ green, reset, all_deps_count });
        return .{ .exit_code = 0 };
    }

    if (ws_skipped_count > 0) {
        std.debug.print("{s}  ↳ {d} package(s) already up to date, installing {d} remaining...{s}\n", .{
            dim, ws_skipped_count, all_deps_count - ws_skipped_count, reset,
        });
    }

    // ---- Pass 1: Handle local/link deps sequentially (just symlinks, microseconds) ----
    for (all_deps) |dep| {
        if (!helpers.isLocalDependency(dep)) continue;

        const clean_name = if (std.mem.startsWith(u8, dep.name, "auto:"))
            dep.name[5..]
        else if (std.mem.startsWith(u8, dep.name, "npm:"))
            dep.name[4..]
        else if (std.mem.startsWith(u8, dep.name, "local:"))
            dep.name[6..]
        else
            dep.name;

        // Resolve the local path (handles link:, ~/, absolute, and relative paths)
        const local_path = if (helpers.isLinkDependency(dep.version)) lp: {
            const resolved = helpers.resolveLinkVersion(allocator, dep.version) catch {
                failed_count += 1;
                continue;
            };
            break :lp resolved orelse {
                std.debug.print("{s}✗{s} {s}@{s} {s}(not linked - run 'pantry link' in the package directory){s}\n", .{ "\x1b[31m", reset, clean_name, dep.version, dim, reset });
                failed_count += 1;
                continue;
            };
        } else if (std.mem.startsWith(u8, dep.version, "~/")) lp: {
            const home_path = lib.Paths.home(allocator) catch {
                failed_count += 1;
                continue;
            };
            defer allocator.free(home_path);
            break :lp std.fmt.allocPrint(allocator, "{s}/{s}", .{ home_path, dep.version[2..] }) catch {
                failed_count += 1;
                continue;
            };
        } else if (std.mem.startsWith(u8, dep.version, "/"))
            allocator.dupe(u8, dep.version) catch {
                failed_count += 1;
                continue;
            }
        else
            std.fmt.allocPrint(allocator, "{s}/{s}", .{ workspace_root, dep.version }) catch {
                failed_count += 1;
                continue;
            };
        defer allocator.free(local_path);

        // Check if path exists
        io_helper.accessAbsolute(local_path, .{}) catch {
            std.debug.print("{s}✗{s} {s}@{s} {s}(path not found){s}\n", .{ "\x1b[31m", reset, clean_name, dep.version, dim, reset });
            failed_count += 1;
            continue;
        };

        // Create pantry/{package} symlink in workspace root's pantry/ directory
        const pantry_dir = std.fmt.allocPrint(allocator, "{s}/pantry", .{workspace_root}) catch {
            failed_count += 1;
            continue;
        };
        defer allocator.free(pantry_dir);
        io_helper.makePath(pantry_dir) catch {};

        const link_path = std.fmt.allocPrint(allocator, "{s}/{s}", .{ pantry_dir, clean_name }) catch {
            failed_count += 1;
            continue;
        };
        defer allocator.free(link_path);

        // Remove existing symlink/dir and create new one
        io_helper.deleteFile(link_path) catch {};
        io_helper.deleteTree(link_path) catch {};
        io_helper.symLink(local_path, link_path) catch |err| {
            std.debug.print("{s}✗{s} {s}@{s} {s}(symlink failed: {}){s}\n", .{ "\x1b[31m", reset, clean_name, dep.version, dim, err, reset });
            failed_count += 1;
            continue;
        };

        std.debug.print("{s}✓{s} {s}@{s} {s}(linked){s}\n", .{ green, reset, clean_name, dep.version, dim, reset });
        success_count += 1;
    }

    // ---- Pass 2: Collect remote deps, then install them in parallel ----
    // Count remote deps
    var remote_count: usize = 0;
    for (all_deps) |dep| {
        if (!helpers.isLocalDependency(dep)) remote_count += 1;
    }

    if (remote_count > 0) {
        // Collect remote deps into a contiguous array
        var remote_deps = try allocator.alloc(lib.deps.parser.PackageDependency, remote_count);
        defer allocator.free(remote_deps);
        {
            var ri: usize = 0;
            for (all_deps) |dep| {
                if (!helpers.isLocalDependency(dep)) {
                    remote_deps[ri] = dep;
                    ri += 1;
                }
            }
        }

        // Allocate result storage
        const remote_results = try allocator.alloc(WorkspaceInstallResult, remote_count);
        defer {
            for (remote_results) |*r| r.deinit(allocator);
            allocator.free(remote_results);
        }
        for (remote_results) |*r| {
            r.* = .{ .name = "", .version = "", .success = false, .error_msg = null };
        }

        // Thread context for parallel remote installs
        var next_idx = std.atomic.Value(usize).init(0);
        var thread_ctx = WorkspaceThreadContext{
            .deps = remote_deps,
            .results = remote_results,
            .next = &next_idx,
            .alloc = allocator,
            .workspace_root = workspace_root,
            .shared_installer = &shared_installer,
            .lockfile_packages = if (existing_lockfile) |*lf| &lf.packages else null,
        };

        // Spawn worker threads scaled to CPU count
        const cpu_count = std.Thread.getCpuCount() catch 4;
        const max_threads = @min(cpu_count, 32);
        const thread_count = @min(remote_count, max_threads);
        var threads = try allocator.alloc(?std.Thread, max_threads);
        defer allocator.free(threads);
        for (threads) |*t| t.* = null;

        for (0..thread_count) |t| {
            threads[t] = std.Thread.spawn(.{}, WorkspaceThreadContext.worker, .{&thread_ctx}) catch null;
        }

        // Main thread also participates
        thread_ctx.worker();

        // Join all threads
        for (threads) |*t| {
            if (t.*) |thread| {
                thread.join();
                t.* = null;
            }
        }

        // Print results
        for (remote_results) |result| {
            if (result.name.len == 0) continue;
            if (result.success) {
                std.debug.print("{s}✓{s} {s}@{s}\n", .{ green, reset, result.name, result.version });
                success_count += 1;
            } else {
                const red = "\x1b[31m";
                std.debug.print("{s}✗{s} {s}@{s}", .{ red, reset, result.name, result.version });
                if (result.error_msg) |msg| {
                    std.debug.print(" {s}({s}){s}\n", .{ dim, msg, reset });
                } else {
                    std.debug.print("\n", .{});
                }
                failed_count += 1;
            }
        }
    }

    // Generate workspace lockfile
    const lockfile_path = try std.fmt.allocPrint(allocator, "{s}/pantry.lock", .{workspace_root});
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
    const lockfile_writer = @import("../../../packages/lockfile.zig");
    lockfile_writer.writeLockfile(allocator, &lockfile, lockfile_path) catch |err| {
        const yellow = "\x1b[33m";
        std.debug.print("\n{s}⚠{s}  Failed to write lockfile: {}\n", .{ yellow, reset, err });
    };

    // Link workspace members into root pantry/ so they can reference each other
    const pantry_dir = try std.fmt.allocPrint(allocator, "{s}/pantry", .{workspace_root});
    defer allocator.free(pantry_dir);
    io_helper.makePath(pantry_dir) catch {};

    var linked_count: usize = 0;
    for (workspace_config.members) |member| {
        // Read member's package.json to get its published name
        const member_pkg_path = try std.fmt.allocPrint(allocator, "{s}/package.json", .{member.abs_path});
        defer allocator.free(member_pkg_path);

        const pkg_name_owned: ?[]const u8 = blk: {
            const pkg_content = io_helper.readFileAlloc(allocator, member_pkg_path, 1024 * 1024) catch break :blk null;
            defer allocator.free(pkg_content);

            const pkg_parsed = std.json.parseFromSlice(std.json.Value, allocator, pkg_content, .{}) catch break :blk null;
            defer pkg_parsed.deinit();

            if (pkg_parsed.value == .object) {
                if (pkg_parsed.value.object.get("name")) |name_val| {
                    if (name_val == .string) {
                        break :blk allocator.dupe(u8, name_val.string) catch null;
                    }
                }
            }
            break :blk null;
        };
        defer if (pkg_name_owned) |n| allocator.free(n);
        const pkg_name = pkg_name_owned orelse member.name;

        // Handle scoped packages (@scope/name)
        const link_path = try std.fmt.allocPrint(allocator, "{s}/{s}", .{ pantry_dir, pkg_name });
        defer allocator.free(link_path);

        // Create parent directory for scoped packages
        if (std.mem.indexOf(u8, pkg_name, "/")) |_| {
            const parent = std.fs.path.dirname(link_path) orelse continue;
            const parent_owned = try allocator.dupe(u8, parent);
            defer allocator.free(parent_owned);
            io_helper.makePath(parent_owned) catch {};
        }

        // Create symlink: pantry/{name} -> {member.abs_path}
        io_helper.deleteFile(link_path) catch {};
        io_helper.symLink(member.abs_path, link_path) catch |err| {
            std.debug.print("{s}  ! Failed to link {s}: {}{s}\n", .{ dim, pkg_name, err, reset });
            continue;
        };
        linked_count += 1;
    }

    if (linked_count > 0) {
        std.debug.print("{s}🔗{s} Linked {d} workspace package(s)\n", .{ blue, reset, linked_count });
    }

    // Summary
    std.debug.print("\n{s}✓{s} Workspace setup complete! Installed {d} package(s)", .{ green, reset, success_count });
    if (failed_count > 0) {
        const red = "\x1b[31m";
        std.debug.print(", {s}{d} failed{s}", .{ red, failed_count, reset });
    }
    std.debug.print("\n", .{});

    return .{ .exit_code = 0 };
}
