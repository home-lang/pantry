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
const style = @import("../../style.zig");

/// Result of a single workspace remote package install
const WorkspaceInstallResult = struct {
    name: []const u8,
    version: []const u8,
    success: bool,
    error_msg: ?[]const u8,
    // Enriched fields for lockfile
    resolved_version: ?[]const u8 = null, // Exact resolved version
    tarball_url: ?[]const u8 = null, // Resolved download URL
    integrity: ?[]const u8 = null, // Integrity hash (sha512 or shasum)

    fn deinit(self: *WorkspaceInstallResult, allocator: std.mem.Allocator) void {
        if (self.error_msg) |msg| allocator.free(msg);
        if (self.resolved_version) |v| allocator.free(v);
        if (self.tarball_url) |u| allocator.free(u);
        if (self.integrity) |i| allocator.free(i);
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

    // Resolve aliases (e.g. "bun" -> "bun.sh", "zig" -> "ziglang.org")
    const clean_name = helpers.resolvePackageAlias(helpers.normalizePackageName(dep.name));

    const is_npm_package = std.mem.startsWith(u8, dep.name, "npm:") or
        std.mem.startsWith(u8, dep.name, "auto:");

    const pkg_source: lib.packages.PackageSource = switch (dep.source) {
        .registry => .pantry,
        .github => .github,
        .git => .git,
        .url => .http,
    };

    // For npm/auto packages, try Pantry registry then npm registry.
    // Domain-style: full DynamoDB + S3 lookup. Non-domain: S3-only (lightweight).
    // Skip entirely for scoped npm packages (@scope/name).
    // PERF: Skip pantry registry lookup entirely if the bulk resolver already pre-resolved
    // this package (avoids per-package HTTP to S3 / AWS CLI subprocess to DynamoDB).
    const is_scoped = clean_name.len > 0 and clean_name[0] == '@';
    const is_domain_style = std.mem.indexOfScalar(u8, clean_name, '.') != null;
    const bulk_resolved = shared_installer.hasNpmResolution(clean_name, dep.version);
    if (is_npm_package or (pkg_source == .pantry and
        pkg_registry.getPackageByName(clean_name) == null))
    {
        // Try Pantry registry first — but skip if bulk resolver already has this package.
        // Uses shared HTTP client for connection pooling across worker threads.
        const pantry_lookup: ?helpers.PantryPackageInfo = if (bulk_resolved or is_scoped)
            null
        else if (is_domain_style)
            helpers.lookupPantryRegistryWithClient(allocator, clean_name, shared_installer.http_client) catch null
        else
            helpers.lookupPantryS3OnlyWithClient(allocator, clean_name, shared_installer.http_client);

        if (pantry_lookup) |pantry_info_val| {
            var pantry_info = pantry_info_val;
            defer pantry_info.deinit(allocator);

            const npm_spec = lib.packages.PackageSpec{
                .name = clean_name,
                .version = allocator.dupe(u8, pantry_info.version) catch return .{
                    .name = clean_name,
                    .version = dep.version,
                    .success = false,
                    .error_msg = null,
                },
                .source = .npm,
                .url = allocator.dupe(u8, pantry_info.tarball_url) catch return .{
                    .name = clean_name,
                    .version = dep.version,
                    .success = false,
                    .error_msg = null,
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
            const pantry_resolved_url = allocator.dupe(u8, pantry_info.tarball_url) catch null;
            result.deinit(allocator);
            return .{
                .name = clean_name,
                .version = ver,
                .success = true,
                .error_msg = null,
                .resolved_version = allocator.dupe(u8, pantry_info.version) catch null,
                .tarball_url = pantry_resolved_url,
                .integrity = null,
            };
        }

        // Fall back to npm registry
        const npm_info = shared_installer.resolveNpmPackage(clean_name, dep.version) catch |err| {
            return .{
                .name = clean_name,
                .version = dep.version,
                .success = false,
                .error_msg = std.fmt.allocPrint(allocator, "not found in registry ({s})", .{@errorName(err)}) catch null,
            };
        };
        defer allocator.free(npm_info.version);
        defer allocator.free(npm_info.tarball_url);
        defer if (npm_info.integrity) |i| allocator.free(i);

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
        const resolved_url = allocator.dupe(u8, npm_info.tarball_url) catch null;
        const resolved_integrity = if (npm_info.integrity) |i| (allocator.dupe(u8, i) catch null) else null;
        result.deinit(allocator);
        return .{
            .name = clean_name,
            .version = ver,
            .success = true,
            .error_msg = null,
            .resolved_version = allocator.dupe(u8, npm_info.version) catch null,
            .tarball_url = resolved_url,
            .integrity = resolved_integrity,
        };
    }

    // Create package spec for pkgx/GitHub packages
    var repo_owned: ?[]const u8 = null;
    const spec = if (pkg_source == .github and dep.github_ref != null) blk: {
        const gh_ref = dep.github_ref.?;
        repo_owned = std.fmt.allocPrint(allocator, "{s}/{s}", .{ gh_ref.owner, gh_ref.repo }) catch return .{
            .name = clean_name,
            .version = dep.version,
            .success = false,
            .error_msg = null,
        };
        break :blk lib.packages.PackageSpec{
            .name = clean_name,
            .version = gh_ref.ref,
            .source = .github,
            .repo = repo_owned,
        };
    } else if (pkg_source == .github) blk: {
        const gh_ref = parser.parseGitHubUrl(allocator, dep.version) catch return .{
            .name = clean_name,
            .version = dep.version,
            .success = false,
            .error_msg = null,
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
            .name = clean_name,
            .version = dep.version,
            .success = false,
            .error_msg = null,
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
        // For zig packages not found in registry, fall back to direct ziglang.org download
        const is_zig_package = std.mem.eql(u8, clean_name, "zig") or
            std.mem.eql(u8, clean_name, "ziglang") or
            std.mem.eql(u8, clean_name, "ziglang.org");
        if (is_zig_package) {
            const zig_spec = lib.packages.PackageSpec{
                .name = "zig",
                .version = dep.version,
                .source = .ziglang,
            };
            var fallback = shared_installer.install(zig_spec, .{
                .project_root = workspace_root,
                .quiet = true,
            }) catch {
                return .{
                    .name = clean_name,
                    .version = dep.version,
                    .success = false,
                    .error_msg = std.fmt.allocPrint(allocator, "{any}", .{err}) catch null,
                };
            };
            const ver = allocator.dupe(u8, fallback.version) catch dep.version;
            fallback.deinit(allocator);
            return .{ .name = clean_name, .version = ver, .success = true, .error_msg = null };
        }
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
    lockfile_name_set: ?*const helpers.LockfileNameSet,
    constraint_map: ?*const helpers.LockfileConstraintMap,

    fn worker(ctx: *WorkspaceThreadContext) void {
        while (true) {
            const i = ctx.next.fetchAdd(1, .monotonic);
            if (i >= ctx.deps.len) break;

            // Skip packages that match lockfile and exist at destination (O(1) via name set)
            if (ctx.lockfile_name_set) |ns| {
                if (helpers.canSkipFromLockfileWithNameSet(ns, ctx.deps[i].name, ctx.deps[i].version, ctx.constraint_map, ctx.workspace_root, ctx.shared_installer.modules_dir)) {
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
    const offline = @import("../../../install/offline.zig");
    const recovery = @import("../../../install/recovery.zig");

    // Offline mode detection
    const is_offline = offline.isOfflineMode();
    if (is_offline) {
        style.print("{s}⚡ Offline mode{s} — installing from cache only\n", .{ style.dim, style.reset });
    }

    // Load recovery checkpoint (for resuming interrupted installs)
    var checkpoint = recovery.InstallCheckpoint.loadFromDisk(allocator, workspace_root) catch null orelse recovery.InstallCheckpoint.init(allocator);
    defer checkpoint.deinit();

    const resuming = checkpoint.installed_packages.count() > 0;
    if (resuming) {
        style.print("{s}{s}{s} Resuming — {d} packages already installed\n", .{ style.green, style.check, style.reset, checkpoint.installed_packages.count() });
    }

    checkpoint.setCheckpointPath(workspace_root) catch {};

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
                style.print("Found {d} catalog(s)\n", .{catalog_count});
            }
        } else |_| {
            // Failed to parse package.json, continue without catalogs
        }
    } else |_| {
        // No package.json or failed to read, continue without catalogs
    }

    if (options.verbose) {
        style.printWorkspaceHeader(workspace_config.name);
        style.printWorkspaceMembers(workspace_config.members.len);
    }

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

    // Process root-level dependencies from the workspace file (system deps, root deps)
    {
        const detector = @import("../../../deps/detector.zig");
        // Use the workspace file itself (package.json / pantry.jsonc) for root deps
        const root_deps_file = detector.DepsFile{
            .path = workspace_file_path,
            .format = detector.inferFormat(std.fs.path.basename(workspace_file_path)) orelse .package_json,
        };
        const root_deps = parser.inferDependencies(allocator, root_deps_file) catch null;
        if (root_deps) |deps| {
            defer allocator.free(deps);
            for (deps) |dep| {
                if (std.mem.startsWith(u8, dep.version, "workspace:")) continue;

                const clean_dep_name = helpers.normalizePackageName(dep.name);
                var key_buf: [512]u8 = undefined;
                const dep_key = std.fmt.bufPrint(&key_buf, "{s}@{s}", .{ clean_dep_name, dep.version }) catch
                    try std.fmt.allocPrint(allocator, "{s}@{s}", .{ clean_dep_name, dep.version });
                const key_is_heap = dep_key.ptr != &key_buf;
                defer if (key_is_heap) allocator.free(dep_key);

                if (!deps_seen.contains(dep_key)) {
                    try deps_seen.put(try allocator.dupe(u8, dep_key), {});
                    if (all_deps_count < all_deps_buffer.len) {
                        all_deps_buffer[all_deps_count] = try dep.clone(allocator);
                        all_deps_count += 1;
                    }
                }
            }
        }
    }

    // Process each workspace member
    for (workspace_config.members) |member| {
        // Skip members that don't match the filter
        if (!filter.matchesMember(member)) {
            continue;
        }

        if (options.verbose) style.printWorkspaceMember(member.name);

        // Load dependencies for this member
        var member_deps: ?[]parser.PackageDependency = null;
        defer if (member_deps) |deps| {
            allocator.free(deps);
        };

        // Try deps file first (fast: just filesystem access)
        if (member.deps_file_path != null) {
            const detector = @import("../../../deps/detector.zig");
            if (try detector.findDepsFile(allocator, member.abs_path)) |deps_file| {
                defer allocator.free(deps_file.path);
                member_deps = try parser.inferDependencies(allocator, deps_file);
            }
        }

        // Fall back to config file if deps file didn't work (slow: may spawn bun/node)
        if (member_deps == null and member.config_path != null) {
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

        if (member_deps) |deps| {
            for (deps) |dep| {
                // Skip workspace:* references — these are resolved via symlinks, not installed
                if (std.mem.startsWith(u8, dep.version, "workspace:")) {
                    continue;
                }

                // Filter peer deps: only include if enabled via pantry.toml or --peer flag
                if (dep.dep_type == .peer and !options.include_peer) {
                    continue;
                }

                // Filter dev deps in production mode
                if (dep.dep_type == .dev and options.production) {
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
                                style.printWarn("Package '{s}' references default catalog but no version found\n", .{dep.name});
                            } else {
                                style.printWarn("Package '{s}' references catalog '{s}' but no version found\n", .{ dep.name, cat_name });
                            }
                        }
                        // Skip this dependency
                        continue;
                    }
                }

                // Create a unique key for this dependency (stack buffer to avoid heap alloc per dep)
                const clean_dep_name = helpers.normalizePackageName(resolved_dep.name);
                var key_buf: [512]u8 = undefined;
                const dep_key = std.fmt.bufPrint(&key_buf, "{s}@{s}", .{ clean_dep_name, resolved_dep.version }) catch
                    try std.fmt.allocPrint(allocator, "{s}@{s}", .{ clean_dep_name, resolved_dep.version });
                const key_is_heap = dep_key.ptr != &key_buf;
                defer if (key_is_heap) allocator.free(dep_key);

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
            if (options.verbose) style.printWorkspaceMemberDeps(deps.len);
        } else {
            if (options.verbose) style.printWorkspaceMemberNoDeps();
        }
    }

    if (options.verbose) style.print("\n", .{});

    if (all_deps_count == 0) {
        style.print("{s}{s}{s} No dependencies to install\n", .{ style.green, style.check, style.reset });
        return .{ .exit_code = 0 };
    }

    // Execute pre-install hook
    const lf_hooks = @import("lockfile_hooks.zig");
    if (try lf_hooks.executePreInstallHook(allocator, workspace_root, options.verbose)) |*pre_result| {
        defer {
            var r = pre_result.*;
            r.deinit(allocator);
        }
        if (!pre_result.success) {
            style.printWarn("Pre-install hook failed\n", .{});
            return .{ .exit_code = 1, .message = try allocator.dupe(u8, "Pre-install hook failed") };
        }
    }

    style.printInstalling(all_deps_count);

    const install_start_ts = io_helper.clockGettime();
    const install_start_ms = @as(i64, @intCast(install_start_ts.sec)) * 1000 + @divFloor(@as(i64, @intCast(install_start_ts.nsec)), 1_000_000);

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

    // Load .npmrc configuration for custom registries and auth tokens
    var npmrc_config = lib.config.loadNpmrc(allocator, workspace_root) catch lib.config.NpmrcConfig.init(allocator);
    defer npmrc_config.deinit();

    // Install each dependency using a shared installer for deduplication
    var pkg_cache = try cache.PackageCache.init(allocator);
    defer pkg_cache.deinit();

    var shared_installer = try install.Installer.init(allocator, &pkg_cache);
    allocator.free(shared_installer.data_dir);
    shared_installer.data_dir = try allocator.dupe(u8, env_dir);
    shared_installer.modules_dir = options.modules_dir;

    // Configure installer with .npmrc settings (custom registry URL)
    if (npmrc_config.registry) |custom_registry| {
        shared_installer.setRegistryUrl(custom_registry);
    }

    // Wire up resolution lockfile for lockfile-first resolution (avoids npm registry queries for locked packages)
    const lockfile_hooks = @import("lockfile_hooks.zig");
    var ws_resolution_lockfile = lockfile_hooks.loadOrCreateLockfile(allocator, workspace_root) catch null;
    defer if (ws_resolution_lockfile) |*lf| lf.deinit();
    if (ws_resolution_lockfile) |*lf| {
        shared_installer.setLockfile(lf);
    }

    // ── FAST PATH: batch install from lockfile ──
    // If lockfile has packages resolved but they're missing from disk (e.g. after
    // clean checkout), extract them all in parallel without any resolution/registry queries.
    if (shared_installer.installAllFromLockfile(workspace_root)) |batch_count_opt| {
        if (batch_count_opt) |batch_count| {
            if (batch_count > 0) {
                style.print("{s}{s}{s} Restored {d} packages from lockfile\n", .{ style.green, style.check, style.reset, batch_count });
            }
        }
    } else |_| {}

    // ── PRE-RESOLVE: bulk npm resolution via pantry registry ──
    // Single HTTP POST resolves ALL deps at once instead of N individual requests
    // to registry.npmjs.org. Pre-populates the L2 npm cache so resolveNpmPackage()
    // returns instantly from cache during parallel install.
    {
        var stack_bulk: [1024]install.Installer.BulkDep = undefined;
        var bi: usize = 0;
        for (all_deps_buffer[0..all_deps_count]) |dep| {
            if (helpers.isLocalDependency(dep)) continue;
            if (bi >= stack_bulk.len) break;
            stack_bulk[bi] = .{
                .name = helpers.normalizePackageName(dep.name),
                .version = dep.version,
            };
            bi += 1;
        }
        if (bi > 0) {
            shared_installer.bulkResolveViaPantryRegistry(stack_bulk[0..bi]);
        }
    }

    defer shared_installer.deinit();

    var success_count: usize = 0;
    var failed_count: usize = 0;

    // Read existing lockfile for incremental install skipping
    const lockfile_reader = @import("../../../packages/lockfile.zig");
    const ws_lockfile_path = try std.fmt.allocPrint(allocator, "{s}/pantry.lock", .{workspace_root});
    defer allocator.free(ws_lockfile_path);

    // --force: delete existing lockfile to force full re-resolution from registry
    if (options.force) {
        io_helper.deleteFile(ws_lockfile_path) catch {};
    }

    var existing_lockfile: ?lib.packages.Lockfile = if (options.force)
        null
    else
        lockfile_reader.readLockfile(allocator, ws_lockfile_path) catch null;
    defer if (existing_lockfile) |*lf| lf.deinit(allocator);

    // Clean up dependencies after installation
    defer {
        for (all_deps_buffer[0..all_deps_count]) |*dep| {
            var d = dep.*;
            d.deinit(allocator);
        }
    }

    const all_deps = all_deps_buffer[0..all_deps_count];

    // Resolution data map: package name -> (resolved_version, tarball_url, integrity)
    // Populated from install results, used when generating the lockfile
    const ResolutionData = struct {
        resolved_version: ?[]const u8 = null,
        tarball_url: ?[]const u8 = null,
        integrity: ?[]const u8 = null,
    };
    var resolution_map = std.StringHashMap(ResolutionData).init(allocator);
    defer {
        var rmap_it = resolution_map.iterator();
        while (rmap_it.next()) |entry| {
            allocator.free(entry.key_ptr.*);
            if (entry.value_ptr.resolved_version) |v| allocator.free(v);
            if (entry.value_ptr.tarball_url) |u| allocator.free(u);
            if (entry.value_ptr.integrity) |i| allocator.free(i);
        }
        resolution_map.deinit();
    }

    // Check if all packages can be skipped (lockfile + destination match + version constraint match)
    // Build name set once for O(1) lookups instead of O(n) iteration per dep
    var ws_skipped_count: usize = 0;
    var ws_name_set: ?helpers.LockfileNameSet = null;
    defer if (ws_name_set) |*ns| ns.deinit();
    var ws_constraint_map: ?helpers.LockfileConstraintMap = null;
    defer if (ws_constraint_map) |*cm| cm.deinit();
    if (existing_lockfile) |*lf| {
        ws_name_set = helpers.buildLockfileNameSet(&lf.packages, allocator);
        ws_constraint_map = helpers.buildConstraintMapFromWorkspaces(&lf.workspaces, allocator);
        if (ws_name_set) |*ns| {
            const cm_ptr: ?*const helpers.LockfileConstraintMap = if (ws_constraint_map) |*cm| cm else null;
            for (all_deps) |dep| {
                if (helpers.canSkipFromLockfileWithNameSet(ns, dep.name, dep.version, cm_ptr, workspace_root, options.modules_dir)) {
                    ws_skipped_count += 1;
                }
            }
        }
    }

    if (ws_skipped_count == all_deps_count) {
        const ws_count = workspace_config.members.len;
        const ws_label = if (ws_count == 1) "workspace member" else "workspace members";
        style.print("{s}{s}{s} {s}{d}{s} packages + {s}{d}{s} {s} up to date\n", .{
            style.green,      style.check,    style.reset,
            style.green_bold, all_deps_count, style.reset,
            style.green_bold, ws_count,       style.reset,
            ws_label,
        });
        return .{ .exit_code = 0 };
    }

    if (ws_skipped_count > 0) {
        style.printSkipping(ws_skipped_count, all_deps_count - ws_skipped_count);
    }

    // ---- Pass 1: Handle local/link deps sequentially (just symlinks, microseconds) ----
    for (all_deps) |dep| {
        if (!helpers.isLocalDependency(dep)) continue;

        const clean_name = helpers.normalizePackageName(dep.name);

        // Resolve the local path (handles link:, ~/, absolute, and relative paths)
        const local_path = if (helpers.isLinkDependency(dep.version)) lp: {
            const resolved = helpers.resolveLinkVersion(allocator, dep.version) catch {
                failed_count += 1;
                continue;
            };
            break :lp resolved orelse {
                style.printFailed(clean_name, dep.version, "not linked - run 'pantry link' in the package directory");
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
            style.printFailed(clean_name, dep.version, "path not found");
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
        io_helper.symLink(local_path, link_path) catch {
            style.printFailed(clean_name, dep.version, "symlink failed");
            failed_count += 1;
            continue;
        };

        // Strip "link:" prefix from version for cleaner display
        const display_version = if (std.mem.startsWith(u8, dep.version, "link:"))
            dep.version[5..]
        else
            dep.version;
        style.printLinked(clean_name, display_version);
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
            .lockfile_name_set = if (ws_name_set) |*ns| ns else null,
            .constraint_map = if (ws_constraint_map) |*cm| cm else null,
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

        // Main thread shows spinner progress instead of participating as worker
        var frame: usize = 0;
        while (next_idx.load(.monotonic) < remote_count) {
            const current = @min(next_idx.load(.monotonic), remote_count);
            const pkg_name = if (current < remote_deps.len) remote_deps[current].name else "...";
            style.printProgress(current, remote_count, pkg_name, frame);
            frame +%= 1;
            io_helper.nanosleep(0, 80 * std.time.ns_per_ms);
        }
        style.clearProgress();

        // Join all threads
        for (threads) |*t| {
            if (t.*) |thread| {
                thread.join();
                t.* = null;
            }
        }

        // Print results and collect resolution data for lockfile
        for (remote_results) |result| {
            if (result.name.len == 0) continue;
            if (result.success) {
                style.printInstalled(result.name, result.version);
                success_count += 1;

                // Record in checkpoint for resume capability
                checkpoint.recordPackage(result.name) catch {};

                // Capture resolution data for lockfile
                if (result.resolved_version != null or result.tarball_url != null or result.integrity != null) {
                    const res_key = allocator.dupe(u8, result.name) catch continue;
                    resolution_map.put(res_key, .{
                        .resolved_version = if (result.resolved_version) |v| (allocator.dupe(u8, v) catch null) else null,
                        .tarball_url = if (result.tarball_url) |u| (allocator.dupe(u8, u) catch null) else null,
                        .integrity = if (result.integrity) |i| (allocator.dupe(u8, i) catch null) else null,
                    }) catch {
                        allocator.free(res_key);
                    };
                }
            } else {
                style.printFailed(result.name, result.version, result.error_msg);
                failed_count += 1;
            }
        }
    }

    // Ensure pantry/.bin has symlinks for all installed package binaries
    // Only run if there were actual installs (skip expensive dir scan on cache hits)
    if (success_count > 0) {
        helpers.ensureBinSymlinks(allocator, workspace_root, options.modules_dir);
    }

    // Generate workspace lockfile
    const lockfile_path = try std.fmt.allocPrint(allocator, "{s}/pantry.lock", .{workspace_root});
    defer allocator.free(lockfile_path);

    var lockfile = try lib.packages.Lockfile.init(allocator, "1.0.0");
    defer lockfile.deinit(allocator);

    // --- Add workspace entries (what each workspace member declared) ---
    {
        // Root workspace entry
        var root_ws_deps: ?std.StringHashMap([]const u8) = null;
        var root_ws_dev_deps: ?std.StringHashMap([]const u8) = null;
        var root_ws_system: ?std.StringHashMap([]const u8) = null;
        const root_pkg_path = try std.fmt.allocPrint(allocator, "{s}/package.json", .{workspace_root});
        defer allocator.free(root_pkg_path);

        if (io_helper.readFileAlloc(allocator, root_pkg_path, 2 * 1024 * 1024)) |root_content| {
            defer allocator.free(root_content);
            if (std.json.parseFromSlice(std.json.Value, allocator, root_content, .{})) |root_parsed| {
                defer root_parsed.deinit();
                if (root_parsed.value == .object) {
                    // Collect dependencies, devDependencies, system
                    inline for (.{
                        .{ "dependencies", &root_ws_deps },
                        .{ "devDependencies", &root_ws_dev_deps },
                        .{ "system", &root_ws_system },
                    }) |pair| {
                        if (root_parsed.value.object.get(pair[0])) |deps_val| {
                            if (deps_val == .object) {
                                var map = std.StringHashMap([]const u8).init(allocator);
                                var d_it = deps_val.object.iterator();
                                while (d_it.next()) |d_entry| {
                                    if (d_entry.value_ptr.* == .string) {
                                        map.put(
                                            allocator.dupe(u8, d_entry.key_ptr.*) catch continue,
                                            allocator.dupe(u8, d_entry.value_ptr.string) catch continue,
                                        ) catch {};
                                    }
                                }
                                if (map.count() > 0) pair[1].* = map else map.deinit();
                            }
                        }
                    }

                    const root_name = if (root_parsed.value.object.get("name")) |n|
                        if (n == .string) n.string else workspace_config.name
                    else
                        workspace_config.name;

                    // Parse workspace isolation mode from root config
                    const ws_isolation = blk: {
                        if (root_parsed.value.object.get("workspaces")) |ws_val| {
                            if (ws_val == .object) {
                                if (ws_val.object.get("isolation")) |iso_val| {
                                    if (iso_val == .string) {
                                        break :blk lib.packages.WorkspaceIsolation.fromString(iso_val.string) orelse .shared;
                                    }
                                }
                            }
                        }
                        // Also check pantry.workspaces.isolation
                        if (root_parsed.value.object.get("pantry")) |pantry_val| {
                            if (pantry_val == .object) {
                                if (pantry_val.object.get("workspaces")) |ws_val| {
                                    if (ws_val == .object) {
                                        if (ws_val.object.get("isolation")) |iso_val| {
                                            if (iso_val == .string) {
                                                break :blk lib.packages.WorkspaceIsolation.fromString(iso_val.string) orelse .shared;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        break :blk .shared;
                    };

                    try lockfile.addWorkspace(allocator, "", .{
                        .name = try allocator.dupe(u8, root_name),
                        .version = null,
                        .dependencies = root_ws_deps,
                        .dev_dependencies = root_ws_dev_deps,
                        .system = root_ws_system,
                        .isolation = ws_isolation,
                    });
                }
            } else |_| {}
        } else |_| {}

        // Workspace member entries
        for (workspace_config.members) |member| {
            const member_pkg = try std.fmt.allocPrint(allocator, "{s}/package.json", .{member.abs_path});
            defer allocator.free(member_pkg);

            const m_content = io_helper.readFileAlloc(allocator, member_pkg, 1024 * 1024) catch continue;
            defer allocator.free(m_content);

            const m_parsed = std.json.parseFromSlice(std.json.Value, allocator, m_content, .{}) catch continue;
            defer m_parsed.deinit();

            if (m_parsed.value != .object) continue;

            const m_name = if (m_parsed.value.object.get("name")) |n|
                if (n == .string) n.string else member.name
            else
                member.name;

            const m_version: ?[]const u8 = if (m_parsed.value.object.get("version")) |v|
                if (v == .string) (allocator.dupe(u8, v.string) catch null) else null
            else
                null;

            var m_deps: ?std.StringHashMap([]const u8) = null;
            var m_dev_deps: ?std.StringHashMap([]const u8) = null;

            inline for (.{ .{ "dependencies", &m_deps }, .{ "devDependencies", &m_dev_deps } }) |pair| {
                if (m_parsed.value.object.get(pair[0])) |deps_val| {
                    if (deps_val == .object) {
                        var map = std.StringHashMap([]const u8).init(allocator);
                        var d_it = deps_val.object.iterator();
                        while (d_it.next()) |d_entry| {
                            if (d_entry.value_ptr.* == .string) {
                                map.put(
                                    allocator.dupe(u8, d_entry.key_ptr.*) catch continue,
                                    allocator.dupe(u8, d_entry.value_ptr.string) catch continue,
                                ) catch {};
                            }
                        }
                        if (map.count() > 0) pair[1].* = map else map.deinit();
                    }
                }
            }

            // Compute relative path from workspace root
            const rel_path = if (std.mem.startsWith(u8, member.abs_path, workspace_root))
                member.abs_path[workspace_root.len + 1 ..]
            else
                member.path;

            // Parse per-member isolation override (from member's pantry field)
            const member_isolation = member_iso: {
                if (m_parsed.value.object.get("pantry")) |pantry_val| {
                    if (pantry_val == .object) {
                        if (pantry_val.object.get("isolation")) |iso_val| {
                            if (iso_val == .string) {
                                break :member_iso lib.packages.WorkspaceIsolation.fromString(iso_val.string) orelse .shared;
                            }
                        }
                    }
                }
                break :member_iso .shared;
            };

            // Parse per-member system deps
            var m_system: ?std.StringHashMap([]const u8) = null;
            if (m_parsed.value.object.get("system")) |system_val| {
                if (system_val == .object) {
                    var smap = std.StringHashMap([]const u8).init(allocator);
                    var s_it = system_val.object.iterator();
                    while (s_it.next()) |s_entry| {
                        if (s_entry.value_ptr.* == .string) {
                            smap.put(
                                allocator.dupe(u8, s_entry.key_ptr.*) catch continue,
                                allocator.dupe(u8, s_entry.value_ptr.string) catch continue,
                            ) catch {};
                        }
                    }
                    if (smap.count() > 0) m_system = smap else smap.deinit();
                }
            }
            // Also check pantry.system
            if (m_system == null) {
                if (m_parsed.value.object.get("pantry")) |pantry_val| {
                    if (pantry_val == .object) {
                        if (pantry_val.object.get("system")) |system_val| {
                            if (system_val == .object) {
                                var smap = std.StringHashMap([]const u8).init(allocator);
                                var s_it = system_val.object.iterator();
                                while (s_it.next()) |s_entry| {
                                    if (s_entry.value_ptr.* == .string) {
                                        smap.put(
                                            allocator.dupe(u8, s_entry.key_ptr.*) catch continue,
                                            allocator.dupe(u8, s_entry.value_ptr.string) catch continue,
                                        ) catch {};
                                    }
                                }
                                if (smap.count() > 0) m_system = smap else smap.deinit();
                            }
                        }
                    }
                }
            }

            try lockfile.addWorkspace(allocator, rel_path, .{
                .name = try allocator.dupe(u8, m_name),
                .version = m_version,
                .dependencies = m_deps,
                .dev_dependencies = m_dev_deps,
                .system = m_system,
                .isolation = member_isolation,
            });
        }
    }

    // --- Add package entries with resolved data ---
    const pkg_registry = @import("../../../packages/generated.zig");
    for (all_deps_buffer[0..all_deps_count]) |dep| {
        const clean_dep_name = helpers.normalizePackageName(dep.name);

        // Determine the correct source
        const lock_source: lib.packages.PackageSource = if (dep.source != .registry)
            switch (dep.source) {
                .github => .github,
                .git => .git,
                .url => .http,
                .registry => unreachable,
            }
        else if (std.mem.startsWith(u8, dep.name, "npm:") or
            std.mem.startsWith(u8, dep.name, "auto:"))
            .npm
        else if (pkg_registry.getPackageByName(clean_dep_name) != null)
            .pantry
        else
            .npm;

        // Look up resolution data captured during installation
        const resolution = resolution_map.get(clean_dep_name);
        const resolved_version = if (resolution) |r| r.resolved_version else null;
        const entry_version = resolved_version orelse dep.version;
        const resolved_url = if (resolution) |r| r.tarball_url else null;
        const resolved_integrity = if (resolution) |r| r.integrity else null;

        // Read installed package.json for dependencies and bin entries
        var pkg_deps: ?std.StringHashMap([]const u8) = null;
        var pkg_peer_deps: ?std.StringHashMap([]const u8) = null;
        var pkg_bin: ?std.StringHashMap([]const u8) = null;
        var pkg_optional_peers: ?std.StringHashMap(bool) = null;

        if (lock_source == .npm) {
            const installed_pkg_path = try std.fmt.allocPrint(
                allocator,
                "{s}/{s}/{s}/package.json",
                .{ workspace_root, shared_installer.modules_dir, clean_dep_name },
            );
            defer allocator.free(installed_pkg_path);

            if (io_helper.readFileAlloc(allocator, installed_pkg_path, 2 * 1024 * 1024)) |pkg_content| {
                defer allocator.free(pkg_content);

                if (std.json.parseFromSlice(std.json.Value, allocator, pkg_content, .{})) |pkg_parsed| {
                    defer pkg_parsed.deinit();
                    if (pkg_parsed.value == .object) {
                        // Extract dependencies
                        if (pkg_parsed.value.object.get("dependencies")) |deps_val| {
                            if (deps_val == .object and deps_val.object.count() > 0) {
                                var map = std.StringHashMap([]const u8).init(allocator);
                                var d_it = deps_val.object.iterator();
                                while (d_it.next()) |d_entry| {
                                    if (d_entry.value_ptr.* == .string) {
                                        map.put(
                                            allocator.dupe(u8, d_entry.key_ptr.*) catch continue,
                                            allocator.dupe(u8, d_entry.value_ptr.string) catch continue,
                                        ) catch {};
                                    }
                                }
                                if (map.count() > 0) pkg_deps = map else map.deinit();
                            }
                        }

                        // Extract peerDependencies
                        if (pkg_parsed.value.object.get("peerDependencies")) |deps_val| {
                            if (deps_val == .object and deps_val.object.count() > 0) {
                                var map = std.StringHashMap([]const u8).init(allocator);
                                var d_it = deps_val.object.iterator();
                                while (d_it.next()) |d_entry| {
                                    if (d_entry.value_ptr.* == .string) {
                                        map.put(
                                            allocator.dupe(u8, d_entry.key_ptr.*) catch continue,
                                            allocator.dupe(u8, d_entry.value_ptr.string) catch continue,
                                        ) catch {};
                                    }
                                }
                                if (map.count() > 0) pkg_peer_deps = map else map.deinit();
                            }
                        }

                        // Extract peerDependenciesMeta (optional peers)
                        if (pkg_parsed.value.object.get("peerDependenciesMeta")) |meta_val| {
                            if (meta_val == .object) {
                                var omap = std.StringHashMap(bool).init(allocator);
                                var m_it = meta_val.object.iterator();
                                while (m_it.next()) |m_entry| {
                                    if (m_entry.value_ptr.* == .object) {
                                        if (m_entry.value_ptr.object.get("optional")) |opt| {
                                            if (opt == .bool and opt.bool) {
                                                omap.put(
                                                    allocator.dupe(u8, m_entry.key_ptr.*) catch continue,
                                                    true,
                                                ) catch {};
                                            }
                                        }
                                    }
                                }
                                if (omap.count() > 0) pkg_optional_peers = omap else omap.deinit();
                            }
                        }

                        // Extract bin entries
                        if (pkg_parsed.value.object.get("bin")) |bin_val| {
                            if (bin_val == .string) {
                                // Single binary: use package name as command
                                var map = std.StringHashMap([]const u8).init(allocator);
                                const bin_name = if (std.mem.lastIndexOf(u8, clean_dep_name, "/")) |idx|
                                    clean_dep_name[idx + 1 ..]
                                else
                                    clean_dep_name;
                                map.put(
                                    allocator.dupe(u8, bin_name) catch "",
                                    allocator.dupe(u8, bin_val.string) catch "",
                                ) catch {};
                                if (map.count() > 0) pkg_bin = map else map.deinit();
                            } else if (bin_val == .object) {
                                var map = std.StringHashMap([]const u8).init(allocator);
                                var b_it = bin_val.object.iterator();
                                while (b_it.next()) |b_entry| {
                                    if (b_entry.value_ptr.* == .string) {
                                        map.put(
                                            allocator.dupe(u8, b_entry.key_ptr.*) catch continue,
                                            allocator.dupe(u8, b_entry.value_ptr.string) catch continue,
                                        ) catch {};
                                    }
                                }
                                if (map.count() > 0) pkg_bin = map else map.deinit();
                            }
                        }
                    }
                } else |_| {}
            } else |_| {}
        }

        const entry = lib.packages.LockfileEntry{
            .name = try allocator.dupe(u8, clean_dep_name),
            .version = try allocator.dupe(u8, entry_version),
            .source = lock_source,
            .url = null,
            .resolved = if (resolved_url) |u| (try allocator.dupe(u8, u)) else null,
            .integrity = if (resolved_integrity) |i| (try allocator.dupe(u8, i)) else null,
            .dependencies = pkg_deps,
            .peer_dependencies = pkg_peer_deps,
            .bin = pkg_bin,
            .optional_peers = pkg_optional_peers,
        };

        // Use resolved version in key if available
        const key = try std.fmt.allocPrint(allocator, "{s}@{s}", .{ clean_dep_name, entry_version });
        defer allocator.free(key);
        try lockfile.addEntry(allocator, key, entry);
    }

    // Write lockfile (unless --frozen-lockfile or --no-save)
    if (options.frozen_lockfile) {
        // In frozen lockfile mode, check if lockfile would change
        const lockfile_writer = @import("../../../packages/lockfile.zig");
        if (existing_lockfile) |*existing| {
            if (!lockfile_writer.lockfilesEqual(existing, &lockfile)) {
                return types.CommandResult{
                    .exit_code = 1,
                    .message = try allocator.dupe(u8, "Error: lockfile is out of date (--frozen-lockfile)"),
                };
            }
        } else {
            // No existing lockfile but we'd generate one - that's a change
            return types.CommandResult{
                .exit_code = 1,
                .message = try allocator.dupe(u8, "Error: no lockfile found (--frozen-lockfile)"),
            };
        }
    } else if (!options.no_save) {
        const lockfile_writer = @import("../../../packages/lockfile.zig");
        style.printLockfileSaving();
        lockfile_writer.writeLockfile(allocator, &lockfile, lockfile_path) catch |err| {
            style.printWarn("Failed to write lockfile: {}\n", .{err});
        };
        style.printLockfileSaved();
    }

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

        // Remove existing symlink/dir and create new one
        io_helper.deleteFile(link_path) catch {};
        io_helper.deleteTree(link_path) catch {};
        io_helper.symLink(member.abs_path, link_path) catch |err| {
            style.print("{s}  ! Failed to link {s}: {}{s}\n", .{ style.dim, pkg_name, err, style.reset });
            continue;
        };
        linked_count += 1;
    }

    if (linked_count > 0) {
        style.printWorkspaceLinked(linked_count);
    }

    // Sync build.zig.zon with installed zig deps
    {
        const zig_zon_sync = @import("../../../deps/zig_zon_sync.zig");
        zig_zon_sync.syncBuildZigZon(allocator, workspace_root, "pantry", options.verbose) catch |err| {
            if (options.verbose) {
                style.print("Warning: Failed to sync build.zig.zon: {}\n", .{err});
            }
        };
    }

    // Delegate to Composer for PHP deps if composer.json is present
    {
        const composer_delegate = @import("../../../deps/composer_delegate.zig");
        _ = composer_delegate.installPhpDeps(allocator, workspace_root, options.verbose) catch |err| {
            if (options.verbose) {
                style.print("Warning: Composer delegation failed: {}\n", .{err});
            }
        };
    }

    // Execute post-install hook
    if (try lf_hooks.executePostInstallHook(allocator, workspace_root, options.verbose)) |*post_result| {
        defer {
            var r = post_result.*;
            r.deinit(allocator);
        }
        if (!post_result.success) {
            style.printWarn("Post-install hook failed\n", .{});
        }
    }

    // Update env cache so shell:lookup finds this env on next cd (no binary re-scan needed)
    {
        const string = lib.string;
        var env_cache = lib.cache.EnvCache.initWithPersistence(allocator) catch null;
        if (env_cache) |*ec| {
            defer ec.deinit();

            const project_hash = string.md5Hash(workspace_root);
            const dep_mtime: i128 = blk: {
                const f = io_helper.cwd().openFile(io_helper.io, workspace_file_path, .{}) catch break :blk 0;
                defer f.close(io_helper.io);
                const fstat = f.stat(io_helper.io) catch break :blk 0;
                break :blk @divFloor(fstat.mtime.toNanoseconds(), std.time.ns_per_s);
            };

            const now = @as(i64, @intCast((io_helper.clockGettime()).sec));
            const entry = allocator.create(lib.cache.env_cache.Entry) catch null;
            if (entry) |e| {
                e.* = .{
                    .hash = project_hash,
                    .dep_file = allocator.dupe(u8, workspace_file_path) catch "",
                    .dep_mtime = dep_mtime,
                    .path = allocator.dupe(u8, env_dir) catch "",
                    .env_vars = std.StringHashMap([]const u8).init(allocator),
                    .created_at = now,
                    .cached_at = now,
                    .last_validated = now,
                };
                ec.put(e) catch {};
            }
        }
    }

    // Clean up checkpoint on success (no resume needed)
    if (failed_count == 0) {
        checkpoint.cleanup();
    }

    // Summary
    const install_end_ts = io_helper.clockGettime();
    const install_end_ms = @as(i64, @intCast(install_end_ts.sec)) * 1000 + @divFloor(@as(i64, @intCast(install_end_ts.nsec)), 1_000_000);
    const elapsed_ms: u64 = @intCast(@max(0, install_end_ms - install_start_ms));
    style.printWorkspaceComplete(success_count, failed_count, elapsed_ms);

    return .{ .exit_code = 0 };
}
