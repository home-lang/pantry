//! Workspace Package Installation
//!
//! Handles installation for workspace/monorepo setups.

const std = @import("std");
const io_helper = @import("../../../io_helper.zig");
const lib = @import("../../../lib.zig");
const types = @import("types.zig");

const cache = lib.cache;
const install = lib.install;

fn findLockfileEntryByName(lockfile: *lib.packages.Lockfile, name: []const u8) ?*const lib.packages.LockfileEntry {
    var iterator = lockfile.packages.iterator();
    while (iterator.next()) |entry| {
        if (std.mem.eql(u8, entry.value_ptr.name, name)) return entry.value_ptr;
    }
    return null;
}

/// Names parsed from a workspace manifest are already unambiguous: regular
/// dependency sections contain npm package names, while `system` entries have
/// already been canonicalized to Pantry domains by the dependency parser.
fn workspaceDependencyName(name: []const u8) []const u8 {
    return helpers.normalizePackageName(name);
}

fn workspaceDependencySource(dep: lib.deps.parser.PackageDependency) lib.packages.PackageSource {
    return switch (dep.source) {
        .github => .github,
        .git => .git,
        .url => .http,
        .pantry => .pantry,
        .npm => .npm,
        .registry => if (std.mem.indexOfScalar(u8, workspaceDependencyName(dep.name), '.') != null) .pantry else .npm,
    };
}

/// bun.lock pins a version of this npm dependency that satisfies its range
/// and differs from what pantry.lock recorded, so the dependency cannot be
/// skipped as up to date: it has to be re-resolved to bun.lock's version.
fn bunLockSupersedesLock(
    installer: *const install.Installer,
    existing: *lib.packages.Lockfile,
    dep: lib.deps.parser.PackageDependency,
    clean_name: []const u8,
) bool {
    if (workspaceDependencySource(dep) != .npm) return false;
    const pinned = installer.preferredBunPin(clean_name, dep.version) orelse return false;
    const locked = findLockfileEntryByName(existing, clean_name) orelse return true;
    return !std.mem.eql(u8, locked.version, pinned);
}

fn shouldResolveWorkspaceDependencyRemotely(
    dependency_name: []const u8,
    dependency_version: []const u8,
    workspace_package_name: []const u8,
    workspace_package_version: []const u8,
) bool {
    if (std.mem.startsWith(u8, dependency_version, "workspace:")) return false;
    if (!std.mem.eql(u8, workspaceDependencyName(dependency_name), workspace_package_name)) return true;
    return !(lib.packages.satisfiesConstraint(workspace_package_version, dependency_version) catch false);
}

fn workspaceDependencyIsLocal(
    workspace_package_versions: *const std.StringHashMap([]const u8),
    dependency_name: []const u8,
    dependency_version: []const u8,
) bool {
    if (std.mem.startsWith(u8, dependency_version, "workspace:")) return true;
    const clean_name = workspaceDependencyName(dependency_name);
    const workspace_version = workspace_package_versions.get(clean_name) orelse return false;
    return !shouldResolveWorkspaceDependencyRemotely(
        clean_name,
        dependency_version,
        clean_name,
        workspace_version,
    );
}

fn workspaceCommandResult(allocator: std.mem.Allocator, failed_count: usize) !types.CommandResult {
    if (failed_count == 0) return .{ .exit_code = 0 };
    return .{
        .exit_code = 1,
        .message = try std.fmt.allocPrint(allocator, "{d} workspace package(s) failed to install", .{failed_count}),
    };
}
const helpers = @import("helpers.zig");
const style = @import("../../style.zig");
const generated_packages = @import("../../../packages/generated.zig");
const install_pipeline = @import("../../../install/pipeline.zig");

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
    const clean_name = workspaceDependencyName(dep.name);

    const is_npm_package = std.mem.startsWith(u8, dep.name, "npm:") or
        std.mem.startsWith(u8, dep.name, "auto:");

    const pkg_source = workspaceDependencySource(dep);

    // For npm/auto packages, try Pantry registry then npm registry.
    // Domain-style: full DynamoDB + S3 lookup. Non-domain: S3-only (lightweight).
    // Skip entirely for scoped npm packages (@scope/name).
    // PERF: Skip pantry registry lookup entirely if the bulk resolver already pre-resolved
    // this package, or if the version is a semver constraint (npm packages never in Pantry).
    const is_scoped = clean_name.len > 0 and clean_name[0] == '@';
    const is_domain_style = std.mem.indexOfScalar(u8, clean_name, '.') != null;
    const version_is_semver = dep.version.len > 0 and
        (dep.version[0] == '^' or dep.version[0] == '~' or
            dep.version[0] == '>' or dep.version[0] == '<' or
            dep.version[0] == '=' or dep.version[0] == '*' or
            (dep.version[0] >= '0' and dep.version[0] <= '9'));
    const bulk_resolved = shared_installer.hasNpmResolution(clean_name, dep.version);
    if (pkg_source == .npm or is_npm_package or (pkg_source == .pantry and
        pkg_registry.getPackageByName(clean_name) == null))
    {
        // Try Pantry registry first — but skip if bulk resolver already has this package,
        // or if the version is a semver constraint (these are always npm packages).
        const skip_pantry = bulk_resolved or is_scoped or version_is_semver;
        const pantry_lookup: ?helpers.PantryPackageInfo = if (skip_pantry)
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
                    .error_msg = allocator.dupe(u8, style.friendlyErrorName(err)) catch null,
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
                .error_msg = allocator.dupe(u8, style.friendlyErrorName(err)) catch null,
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
    } else blk: {
        // For Zig aliases, always use Pantry's mirrored ziglang.org package.
        const is_zig_ws = std.mem.eql(u8, clean_name, "zig") or
            std.mem.eql(u8, clean_name, "ziglang") or
            std.mem.eql(u8, clean_name, "ziglang.org");
        break :blk if (is_zig_ws) lib.packages.PackageSpec{
            .name = "ziglang.org",
            .version = dep.version,
            .source = .pantry,
        } else lib.packages.PackageSpec{
            .name = clean_name,
            .version = dep.version,
            .source = pkg_source,
            .url = if (pkg_source == .http) dep.version else null,
        };
    };
    defer if (repo_owned) |r| allocator.free(r);

    var result = shared_installer.install(spec, .{
        .project_root = workspace_root,
        .quiet = true,
    }) catch |err| {
        // Retry Zig through the canonical mirrored package spelling.
        const is_zig_package = std.mem.eql(u8, clean_name, "zig") or
            std.mem.eql(u8, clean_name, "ziglang") or
            std.mem.eql(u8, clean_name, "ziglang.org");
        if (is_zig_package) {
            const zig_spec = lib.packages.PackageSpec{
                .name = "ziglang.org",
                .version = dep.version,
                .source = .pantry,
            };
            var fallback = shared_installer.install(zig_spec, .{
                .project_root = workspace_root,
                .quiet = true,
            }) catch {
                return .{
                    .name = clean_name,
                    .version = dep.version,
                    .success = false,
                    .error_msg = allocator.dupe(u8, style.friendlyErrorName(err)) catch null,
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
            .error_msg = allocator.dupe(u8, style.friendlyErrorName(err)) catch null,
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
    verbose: bool = false,

    fn worker(ctx: *WorkspaceThreadContext) void {
        if (ctx.verbose) {
            std.debug.print("[verbose:ws] worker thread started (tid={d})\n", .{std.Thread.getCurrentId()});
        }
        while (true) {
            const i = ctx.next.fetchAdd(1, .monotonic);
            if (i >= ctx.deps.len) break;

            if (ctx.verbose) {
                std.debug.print("[verbose:ws] [{d}/{d}] processing: {s} @ {s}\n", .{ i + 1, ctx.deps.len, ctx.deps[i].name, ctx.deps[i].version });
            }

            // Skip packages that match lockfile and exist at destination (O(1) via name set)
            if (ctx.lockfile_name_set) |ns| {
                const clean_name = workspaceDependencyName(ctx.deps[i].name);
                if (helpers.canSkipCanonicalFromLockfileWithNameSet(ns, clean_name, ctx.deps[i].version, ctx.constraint_map, ctx.workspace_root, ctx.shared_installer.modules_dir)) {
                    const clean = helpers.stripDisplayPrefix(ctx.deps[i].name);
                    if (ctx.verbose) {
                        std.debug.print("[verbose:ws] [{d}/{d}] skipped (lockfile match): {s}\n", .{ i + 1, ctx.deps.len, ctx.deps[i].name });
                    }
                    ctx.results[i] = .{
                        .name = clean,
                        .version = ctx.deps[i].version,
                        .success = true,
                        .error_msg = null,
                    };
                    continue;
                }
            }

            var pkg_start_ms: i64 = 0;
            if (ctx.verbose) {
                const pkg_ts = io_helper.clockGettime();
                pkg_start_ms = @as(i64, @intCast(pkg_ts.sec)) * 1000 + @divFloor(@as(i64, @intCast(pkg_ts.nsec)), 1_000_000);
                std.debug.print("[verbose:ws] [{d}/{d}] installing: {s} @ {s}\n", .{ i + 1, ctx.deps.len, ctx.deps[i].name, ctx.deps[i].version });
            }

            ctx.results[i] = installSingleWorkspaceDep(
                ctx.alloc,
                ctx.deps[i],
                ctx.workspace_root,
                ctx.shared_installer,
            );

            if (ctx.verbose) {
                const pkg_end_ts = io_helper.clockGettime();
                const pkg_end_ms = @as(i64, @intCast(pkg_end_ts.sec)) * 1000 + @divFloor(@as(i64, @intCast(pkg_end_ts.nsec)), 1_000_000);
                std.debug.print("[verbose:timer] [{d}/{d}] {s}: {d}ms (success={})\n", .{ i + 1, ctx.deps.len, ctx.deps[i].name, pkg_end_ms - pkg_start_ms, ctx.results[i].success });
            }
        }
        if (ctx.verbose) {
            std.debug.print("[verbose:ws] worker thread exiting (tid={d})\n", .{std.Thread.getCurrentId()});
        }
    }
};

/// Copy a lockfile entry, so the regenerated lock owns its own memory.
fn dupeLockfileEntry(allocator: std.mem.Allocator, entry: *const lib.packages.LockfileEntry) !lib.packages.LockfileEntry {
    return .{
        .name = try allocator.dupe(u8, entry.name),
        .version = try allocator.dupe(u8, entry.version),
        .source = entry.source,
        .url = if (entry.url) |u| try allocator.dupe(u8, u) else null,
        .resolved = if (entry.resolved) |r| try allocator.dupe(u8, r) else null,
        .integrity = if (entry.integrity) |i| try allocator.dupe(u8, i) else null,
        // Deliberately not carried: the maps describe how this pin was reached,
        // and a foreign-OS pin was not reached from here. The identity - name,
        // version, tarball, integrity - is the part that has to survive.
        .dependencies = null,
        .peer_dependencies = null,
        .bin = null,
        .optional_peers = null,
    };
}

/// Restore pins another platform resolves differently.
///
/// The regenerated lock holds what THIS host resolved. Two kinds of record are
/// missing from it, and neither left the dependency graph: one the catalog
/// guards behind a different OS, which this machine was never allowed to fetch;
/// and one another OS resolves to a different version, because a guard applying
/// there and not here changes the constraint. Both come back from the previous
/// lock.
///
/// The catalog is what makes this safe to distinguish from pruning: a pin is
/// carried forward only when some package in the new lock still declares it
/// behind an OS guard. A record nothing points at any more is obsolete on every
/// platform, and is left out exactly as before.
fn carryForwardForeignOsPins(
    allocator: std.mem.Allocator,
    lockfile: *lib.packages.Lockfile,
    existing: *const lib.packages.Lockfile,
) !void {
    // Which pins are foreign-OS, asked of the lock that still has them.
    //
    // Read from `existing` rather than the regenerated lock, because the
    // regenerated one does not carry system packages at all at this point -
    // those are merged afterwards by the companion step, so looking there finds
    // nothing and the whole pass becomes a no-op.
    var seeds = std.ArrayList([]const u8).empty;
    defer seeds.deinit(allocator);

    var declared_it = existing.packages.iterator();
    while (declared_it.next()) |entry| {
        if (entry.value_ptr.source != .pantry) continue;
        try seeds.append(allocator, entry.value_ptr.name);
    }

    var wanted = try install_pipeline.platformDependentClosure(allocator, seeds.items);
    defer wanted.deinit();

    if (wanted.count() == 0) return;

    var existing_it = existing.packages.iterator();
    while (existing_it.next()) |entry| {
        if (entry.value_ptr.source != .pantry) continue;
        if (!wanted.contains(entry.value_ptr.name)) continue;
        if (lockfile.packages.contains(entry.key_ptr.*)) continue;

        const copied = try dupeLockfileEntry(allocator, entry.value_ptr);
        try lockfile.addEntry(allocator, entry.key_ptr.*, copied);
    }
}

/// Hand the JS and PHP trees to the package managers that own them (bun/pnpm/
/// yarn/npm, composer). Each delegate skips itself when its tree is current,
/// so this is safe to call on every install, including one where every
/// pantry-resolved dependency was already up to date. Returns a failed
/// result for the caller to return, or null to carry on.
fn delegateEcosystemInstalls(
    allocator: std.mem.Allocator,
    workspace_root: []const u8,
    options: types.InstallOptions,
) !?types.CommandResult {
    const composer_delegate = @import("../../../deps/composer_delegate.zig");
    _ = composer_delegate.installPhpDeps(allocator, workspace_root, options.verbose) catch |err| {
        if (options.verbose) {
            style.print("Warning: Composer delegation failed: {}\n", .{err});
        }
    };

    const js_delegate = @import("../../../deps/js_delegate.zig");
    _ = js_delegate.installJsDeps(allocator, workspace_root, options.verbose, options.linker) catch |err| {
        return .{
            .exit_code = 1,
            .message = try std.fmt.allocPrint(allocator, "JavaScript dependency installation failed: {s}", .{@errorName(err)}),
        };
    };

    return null;
}

/// Complete the workspace only after its declared companion runtimes exist.
/// The combined installer calls this after the system-dependency phase; a
/// standalone workspace completes it immediately after linking its packages.
pub fn completeEcosystemInstall(allocator: std.mem.Allocator, workspace_root: []const u8, options: types.InstallOptions) !?types.CommandResult {
    if (try delegateEcosystemInstalls(allocator, workspace_root, options)) |failure| return failure;

    install.flushAnalytics(allocator);
    const lf_hooks = @import("lockfile_hooks.zig");
    if (try lf_hooks.executePostInstallHook(allocator, workspace_root, options.verbose)) |*post_result| {
        defer {
            var result = post_result.*;
            result.deinit(allocator);
        }
        if (!post_result.success) style.printWarn("Post-install hook failed\n", .{});
    }
    return null;
}

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

    // A forced install must not resume the completed-package set from an older
    // run, otherwise every recorded dependency is silently skipped.
    if (options.force) recovery.InstallCheckpoint.clearPersisted(allocator, workspace_root);

    // Load recovery checkpoint (for resuming interrupted installs)
    var checkpoint = recovery.InstallCheckpoint.loadFromDisk(allocator, workspace_root) catch null orelse recovery.InstallCheckpoint.init(allocator);
    defer checkpoint.deinit();

    const resuming_count: usize = checkpoint.installed_packages.count();

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

    // Index published workspace package names and versions before collecting
    // dependencies. Package managers prefer a matching local workspace member
    // for ordinary semver ranges as well as explicit `workspace:` references.
    var workspace_package_versions = std.StringHashMap([]const u8).init(allocator);
    defer {
        var versions_iter = workspace_package_versions.iterator();
        while (versions_iter.next()) |entry| {
            allocator.free(entry.key_ptr.*);
            allocator.free(entry.value_ptr.*);
        }
        workspace_package_versions.deinit();
    }
    for (workspace_config.members) |member| {
        const member_pkg_path = try std.fs.path.join(allocator, &.{ member.abs_path, "package.json" });
        defer allocator.free(member_pkg_path);

        const member_content = io_helper.readFileAlloc(allocator, member_pkg_path, 1024 * 1024) catch continue;
        defer allocator.free(member_content);
        const member_parsed = std.json.parseFromSlice(std.json.Value, allocator, member_content, .{}) catch continue;
        defer member_parsed.deinit();
        if (member_parsed.value != .object) continue;

        const name_value = member_parsed.value.object.get("name") orelse continue;
        const version_value = member_parsed.value.object.get("version") orelse continue;
        if (name_value != .string or version_value != .string) continue;
        if (workspace_package_versions.contains(name_value.string)) continue;

        const owned_name = try allocator.dupe(u8, name_value.string);
        errdefer allocator.free(owned_name);
        const owned_version = try allocator.dupe(u8, version_value.string);
        errdefer allocator.free(owned_version);
        try workspace_package_versions.put(owned_name, owned_version);
    }

    // Apply filter if provided
    const filter_module = @import("../../../packages/filter.zig");
    var filter = if (options.filter) |filter_str| blk: {
        // Parse filter string - could be comma-separated patterns
        var patterns_list = std.ArrayList([]const u8).empty;
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

    // Process root-level dependencies from the workspace file (system deps, root deps).
    // Dedup by clean package name: flat pantry/ install can only have one version per
    // package, so `name@^1.0.0` and `name@1.0.0` must collapse to a single install.
    {
        const detector = @import("../../../deps/detector.zig");
        const root_deps_file = detector.DepsFile{
            .path = workspace_file_path,
            .format = detector.inferFormat(std.fs.path.basename(workspace_file_path)) orelse .package_json,
        };
        const root_deps = parser.inferDependencies(allocator, root_deps_file) catch null;
        if (root_deps) |deps| {
            defer allocator.free(deps);
            for (deps) |dep| {
                if (workspaceDependencyIsLocal(&workspace_package_versions, dep.name, dep.version)) continue;

                const clean_dep_name = workspaceDependencyName(dep.name);
                if (!deps_seen.contains(clean_dep_name)) {
                    try deps_seen.put(try allocator.dupe(u8, clean_dep_name), {});
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
        // Use the already-discovered deps_file_path directly — don't re-search
        // with findDepsFile() which walks UP the directory tree and may find
        // the root package.json instead of the member's.
        if (member.deps_file_path) |deps_path| {
            const detector = @import("../../../deps/detector.zig");
            const format = detector.inferFormat(std.fs.path.basename(deps_path)) orelse .package_json;
            const deps_file = detector.DepsFile{ .path = deps_path, .format = format };
            member_deps = parser.inferDependencies(allocator, deps_file) catch null;
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
                    const catalog_package_name = workspaceDependencyName(dep.name);
                    if (helpers.resolveWorkspaceCatalogReference(&catalog_manager, dep.name, dep.version)) |resolved_version| {
                        // Replace catalog reference with actual version
                        allocator.free(resolved_dep.version);
                        resolved_dep.version = try allocator.dupe(u8, resolved_version);
                    } else {
                        // Catalog reference not found - warn user
                        const catalog_name = lib.deps.catalogs.CatalogManager.getCatalogName(dep.version);
                        if (catalog_name) |cat_name| {
                            if (cat_name.len == 0) {
                                style.printWarn("Package '{s}' references default catalog but no version found\n", .{catalog_package_name});
                            } else {
                                style.printWarn("Package '{s}' references catalog '{s}' but no version found\n", .{ catalog_package_name, cat_name });
                            }
                        }
                        // Skip this dependency
                        continue;
                    }
                }

                if (workspaceDependencyIsLocal(&workspace_package_versions, resolved_dep.name, resolved_dep.version)) {
                    continue;
                }

                // Dedup by clean package name only — flat pantry/ install resolves
                // each package to a single version.
                const clean_dep_name = workspaceDependencyName(resolved_dep.name);
                if (!deps_seen.contains(clean_dep_name)) {
                    try deps_seen.put(try allocator.dupe(u8, clean_dep_name), {});
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
        // Internal-only workspaces still need member links and a complete
        // staged lock. The combined caller completes ecosystem installation
        // after companion runtimes are available.
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

    style.printInstallingEx(all_deps_count, resuming_count);

    const install_start_ts = io_helper.clockGettime();
    const install_start_ms = @as(i64, @intCast(install_start_ts.sec)) * 1000 + @divFloor(@as(i64, @intCast(install_start_ts.nsec)), 1_000_000);

    // Hash workspace root for environment directory
    var workspace_hasher = std.crypto.hash.Md5.init(.{});
    workspace_hasher.update(workspace_root);
    var workspace_hash: [16]u8 = undefined;
    workspace_hasher.final(&workspace_hash);
    const workspace_hash_short = try std.fmt.allocPrint(allocator, "{x:0>8}", .{std.mem.readInt(u32, workspace_hash[0..4], .little)});
    defer allocator.free(workspace_hash_short);

    const data_dir = try lib.Paths.data(allocator);
    defer allocator.free(data_dir);

    const env_name = try std.fmt.allocPrint(allocator, "{s}_{s}-workspace", .{ workspace_config.name, workspace_hash_short });
    defer allocator.free(env_name);

    const env_dir = try std.fs.path.join(allocator, &[_][]const u8{ data_dir, "envs", env_name });
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
    shared_installer.verbose = options.verbose;

    // Configure installer with .npmrc settings (custom registry URL)
    if (npmrc_config.registry) |custom_registry| {
        shared_installer.setRegistryUrl(custom_registry);
    }

    const lockfile_reader = @import("../../../packages/lockfile.zig");
    const ws_lockfile_path = try std.fmt.allocPrint(allocator, "{s}/pantry.lock", .{workspace_root});
    defer allocator.free(ws_lockfile_path);

    // Force ignores lock-driven restore and resolution without deleting the
    // committed lock before this install (and any companion phase) succeeds.

    // Wire up resolution lockfile for lockfile-first resolution (avoids npm registry queries for locked packages)
    const lockfile_hooks = @import("lockfile_hooks.zig");
    var ws_resolution_lockfile = if (options.force)
        null
    else
        lockfile_hooks.loadOrCreateLockfile(allocator, workspace_root) catch null;
    defer if (ws_resolution_lockfile) |*lf| lf.deinit();
    if (ws_resolution_lockfile) |*lf| {
        shared_installer.setLockfile(lf);
    }

    // When Bun also locks this workspace, resolve npm ranges to bun.lock's pins
    // so pantry/ and node_modules/ install the same versions.
    var ws_bun_pins = lib.deps.resolution.BunLockPins.load(allocator, workspace_root);
    defer if (ws_bun_pins) |*pins| pins.deinit();
    if (ws_bun_pins) |*pins| {
        shared_installer.setBunLockPins(pins);
    }

    // ── FAST PATH: batch install from lockfile ──
    // If lockfile has packages resolved but they're missing from disk (e.g. after
    // clean checkout), extract them all in parallel without any resolution/registry queries.
    if (!options.force) {
        if (shared_installer.installAllFromLockfile(workspace_root)) |batch_count_opt| {
            if (batch_count_opt) |batch_count| {
                if (batch_count > 0) {
                    style.print("{s}{s}{s} Restored {d} packages from lockfile\n", .{ style.green, style.check, style.reset, batch_count });
                }
            }
        } else |_| {}
    }

    defer shared_installer.deinit();

    var success_count: usize = 0;
    var failed_count: usize = 0;
    var cached_count: usize = 0;

    // Read existing lockfile for incremental install skipping.
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
                const clean_name = workspaceDependencyName(dep.name);
                if (bunLockSupersedesLock(&shared_installer, lf, dep, clean_name)) continue;
                if (helpers.canSkipCanonicalFromLockfileWithNameSet(ns, clean_name, dep.version, cm_ptr, workspace_root, options.modules_dir)) {
                    ws_skipped_count += 1;
                }
            }
        }
    }

    if (all_deps_count > 0 and ws_skipped_count == all_deps_count) {
        const ws_count = workspace_config.members.len;
        const ws_label = if (ws_count == 1) "workspace member" else "workspace members";
        style.print("{s}{s}{s} {s}{d}{s} packages + {s}{d}{s} {s} up to date\n", .{
            style.green,      style.check,    style.reset,
            style.green_bold, all_deps_count, style.reset,
            style.green_bold, ws_count,       style.reset,
            ws_label,
        });

        // Installed external packages do not prove workspace metadata is
        // unchanged. Keep generating/validating the complete lock, repairing
        // member links and retrying ecosystem delegates below even when every
        // external dependency can be reused.
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

    var installed_versions = std.StringHashMap([]const u8).init(allocator);
    defer {
        var version_it = installed_versions.iterator();
        while (version_it.next()) |entry| {
            allocator.free(entry.key_ptr.*);
            allocator.free(entry.value_ptr.*);
        }
        installed_versions.deinit();
    }

    // ---- Pass 2: Install remote deps via parallel pipeline ----
    // Count remote deps
    var remote_count: usize = 0;
    for (all_deps) |dep| {
        if (!helpers.isLocalDependency(dep)) remote_count += 1;
    }

    if (remote_count > 0) {
        const pipeline = @import("../../../install/pipeline.zig");

        // Build pipeline dep list from remote deps
        var pipeline_deps = try allocator.alloc(pipeline.PipelineDep, remote_count);
        defer allocator.free(pipeline_deps);
        {
            var ri: usize = 0;
            for (all_deps) |dep| {
                if (helpers.isLocalDependency(dep)) continue;
                const clean_name = workspaceDependencyName(dep.name);
                // Domain-style names (containing '.') are pantry/system packages, not npm
                pipeline_deps[ri] = .{
                    .name = clean_name,
                    .version = dep.version,
                    .source = workspaceDependencySource(dep),
                    .github_owner = if (dep.github_ref) |ref| ref.owner else null,
                    .github_repo = if (dep.github_ref) |ref| ref.repo else null,
                };
                ri += 1;
            }
        }

        // Run the 3-phase parallel pipeline
        var pipeline_result = try pipeline.run(
            allocator,
            &shared_installer,
            pipeline_deps,
            workspace_root,
            options.verbose,
        );
        defer pipeline_result.deinit(allocator);

        // Print results and collect resolution data for lockfile
        for (pipeline_result.results) |result| {
            if (result.name.len == 0) continue;
            if (result.success) {
                if (!installed_versions.contains(result.name)) {
                    try installed_versions.put(
                        try allocator.dupe(u8, result.name),
                        try allocator.dupe(u8, result.version),
                    );
                }
                // Another platform's optional build: locked, not installed.
                if (result.lock_only) continue;
                style.printInstalled(result.name, result.version);
                success_count += 1;
                if (result.from_cache) cached_count += 1;
                checkpoint.recordPackage(result.name) catch {};
            } else {
                style.printFailed(result.name, result.version, result.error_msg);
                failed_count += 1;
            }
        }

        if (options.verbose) {
            const phase_ts = io_helper.clockGettime();
            const phase_ms = @as(i64, @intCast(phase_ts.sec)) * 1000 + @divFloor(@as(i64, @intCast(phase_ts.nsec)), 1_000_000);
            std.debug.print("[verbose:timer] parallel install phase complete: {d}ms\n", .{phase_ms - install_start_ms});
        }
    }

    // Ensure pantry/.bin has symlinks for all installed package binaries. This
    // also repairs stale or broken shell shims when every package was cached.
    helpers.ensureBinSymlinks(allocator, workspace_root, options.modules_dir);

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
    // A dependency several members declare is visited once per declaration;
    // report a moved pin once.
    var moved_pins = std.StringHashMap(void).init(allocator);
    defer moved_pins.deinit();
    for (all_deps_buffer[0..all_deps_count]) |dep| {
        const clean_dep_name = workspaceDependencyName(dep.name);

        // Determine the correct source
        const lock_source = workspaceDependencySource(dep);

        // Read installed package.json for dependencies and bin entries
        var installed_version: ?[]const u8 = null;
        defer if (installed_version) |version| allocator.free(version);
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
                        if (pkg_parsed.value.object.get("version")) |version_val| {
                            if (version_val == .string)
                                installed_version = try allocator.dupe(u8, version_val.string);
                        }

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

        const existing_entry: ?*const lib.packages.LockfileEntry = if (existing_lockfile) |*existing|
            findLockfileEntryByName(existing, clean_dep_name)
        else
            null;
        const compatible_existing_entry: ?*const lib.packages.LockfileEntry = if (existing_entry) |entry|
            if (entry.source == lock_source) entry else null
        else
            null;

        // Reuse exact metadata captured by the bulk/per-package resolver. If
        // the package was already installed, the pipeline may legitimately do
        // no resolution work; resolve that installed exact version only when
        // the old lock entry cannot supply complete matching metadata.
        var resolution = if (lock_source == .npm)
            shared_installer.getCachedNpmResolution(clean_dep_name, dep.version)
        else
            null;
        if (lock_source == .npm and resolution == null) {
            const desired_version = installed_version orelse dep.version;
            const existing_is_complete = if (compatible_existing_entry) |entry|
                std.mem.eql(u8, entry.version, desired_version) and entry.resolved != null and entry.integrity != null
            else
                false;
            if (!existing_is_complete)
                resolution = shared_installer.resolveNpmPackage(clean_dep_name, desired_version) catch null;
        }
        defer if (resolution) |*r| {
            allocator.free(r.version);
            allocator.free(r.tarball_url);
            if (r.integrity) |integrity| allocator.free(integrity);
        };
        const resolved_version = if (resolution) |r| r.version else null;

        const entry_version = resolved_version orelse installed_versions.get(clean_dep_name) orelse installed_version orelse if (compatible_existing_entry) |entry| entry.version else dep.version;
        const can_reuse_existing = if (compatible_existing_entry) |entry|
            std.mem.eql(u8, entry.version, entry_version)
        else
            false;
        if (compatible_existing_entry) |previous| {
            if (!can_reuse_existing) {
                const seen = try moved_pins.getOrPut(clean_dep_name);
                if (!seen.found_existing) {
                    const via_bun_lock = if (shared_installer.preferredBunPin(clean_dep_name, dep.version)) |pin|
                        std.mem.eql(u8, pin, entry_version)
                    else
                        false;
                    style.printLockPinMoved(clean_dep_name, previous.version, entry_version, via_bun_lock);
                }
            }
        }
        const resolved_url = if (resolution) |r|
            r.tarball_url
        else if (can_reuse_existing)
            compatible_existing_entry.?.resolved
        else
            null;
        const resolved_integrity = if (resolution) |r|
            r.integrity
        else if (can_reuse_existing)
            compatible_existing_entry.?.integrity
        else
            null;

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

    // Keep the pins this host is not allowed to resolve.
    //
    // The lockfile describes the dependency graph, and that graph contains
    // packages guarded for another platform - `linux:gnu.org/gcc/libstdcxx^14`
    // and the eight others alongside it. `parsePantryDepSpec` skips those while
    // installing, correctly: there is nothing here to fetch. But this lock is
    // built from scratch out of what *was* installed, so skipping them while
    // recording deleted them, and a pantry.lock committed from one platform
    // could not survive an install on the other (pantry-pm/pantry#231).
    //
    // Only pins something still depends on are kept. A record the catalog no
    // longer points at from any platform is obsolete and still disappears,
    // which is the property that keeps regeneration able to prune.
    if (existing_lockfile) |*existing| {
        try carryForwardForeignOsPins(allocator, &lockfile, existing);
    }

    // A workspace with a separate companion deps file stages its workspace
    // lock first so the caller can merge system packages and validate the
    // complete result atomically against the committed lockfile.
    if (options.lockfile_output_path) |output_path| {
        const lockfile_writer = @import("../../../packages/lockfile.zig");
        try lockfile_writer.writeLockfile(allocator, &lockfile, output_path);
    } else if (options.frozen_lockfile) {
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
            style.print("{s}  ! Failed to link {s}: {s}{s}\n", .{ style.dim, pkg_name, style.friendlyErrorName(err), style.reset });
            continue;
        };
        linked_count += 1;
    }

    if (linked_count > 0) {
        style.printWorkspaceLinked(linked_count);
    }

    // Workspace packages are bin providers too, and they outrank anything
    // transitive, so settle contested pantry/.bin names once they are linked.
    install.bin_ownership.resolveBinCollisions(allocator, workspace_root, options.modules_dir);

    // Sync build.zig.zon with installed zig deps
    {
        const zig_zon_sync = @import("../../../deps/zig_zon_sync.zig");
        zig_zon_sync.syncBuildZigZon(allocator, workspace_root, "pantry", options.verbose) catch |err| {
            if (options.verbose) {
                style.print("Warning: Failed to sync build.zig.zon: {}\n", .{err});
            }
        };
    }

    if (!options.defer_ecosystem_install) {
        if (try completeEcosystemInstall(allocator, workspace_root, options)) |failure| return failure;
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
    style.printWorkspaceCompleteEx(success_count, cached_count, failed_count, elapsed_ms);

    if (options.verbose) {
        std.debug.print("[verbose:timer] total install time: {d}ms\n", .{elapsed_ms});
    }

    return workspaceCommandResult(allocator, failed_count);
}

test "findLockfileEntryByName finds resolved entries independent of key spelling" {
    const allocator = std.testing.allocator;
    var lockfile = try lib.packages.Lockfile.init(allocator, "1.0.0");
    defer lockfile.deinit(allocator);

    try lockfile.addEntry(allocator, "bunfig@0.15.15", .{
        .name = try allocator.dupe(u8, "bunfig"),
        .version = try allocator.dupe(u8, "0.15.15"),
        .source = .npm,
    });

    try std.testing.expectEqualStrings("0.15.15", findLockfileEntryByName(&lockfile, "bunfig").?.version);
    try std.testing.expect(findLockfileEntryByName(&lockfile, "missing") == null);
}

test "workspace dependency names preserve npm packages and strip explicit prefixes" {
    try std.testing.expectEqualStrings("typescript", workspaceDependencyName("typescript"));
    try std.testing.expectEqualStrings("node", workspaceDependencyName("node"));
    try std.testing.expectEqualStrings("bun.sh", workspaceDependencyName("bun.sh"));
    try std.testing.expectEqualStrings("bunfig", workspaceDependencyName("npm:bunfig"));
    try std.testing.expectEqualStrings("zig-config", workspaceDependencyName("github:zig-config"));
    try std.testing.expectEqualStrings("archive", workspaceDependencyName("http:archive"));
}

test "workspace dependency source distinguishes npm names from system domains" {
    const npm_dep = lib.deps.parser.PackageDependency{ .name = "node", .version = "^23.11.1" };
    const typescript_dep = lib.deps.parser.PackageDependency{ .name = "typescript", .version = "^7" };
    const system_dep = lib.deps.parser.PackageDependency{ .name = "nodejs.org", .version = "^20" };
    const explicit_npm_dep = lib.deps.parser.PackageDependency{ .name = "npm:bunfig", .version = "^0.15" };
    const explicit_pantry_dep = lib.deps.parser.PackageDependency{ .name = "zig-config", .version = "^0.1", .source = .pantry };
    const url_dep = lib.deps.parser.PackageDependency{ .name = "http:archive", .version = "https://example.com/archive.tgz", .source = .url };

    try std.testing.expectEqual(lib.packages.PackageSource.npm, workspaceDependencySource(npm_dep));
    try std.testing.expectEqual(lib.packages.PackageSource.npm, workspaceDependencySource(typescript_dep));
    try std.testing.expectEqual(lib.packages.PackageSource.pantry, workspaceDependencySource(system_dep));
    try std.testing.expectEqual(lib.packages.PackageSource.npm, workspaceDependencySource(explicit_npm_dep));
    try std.testing.expectEqual(lib.packages.PackageSource.pantry, workspaceDependencySource(explicit_pantry_dep));
    try std.testing.expectEqual(lib.packages.PackageSource.http, workspaceDependencySource(url_dep));
}

test "matching workspace packages satisfy ordinary semver dependencies locally" {
    try std.testing.expect(!shouldResolveWorkspaceDependencyRemotely(
        "@stacksjs/actions",
        "^0.74.22",
        "@stacksjs/actions",
        "0.74.22",
    ));
    try std.testing.expect(shouldResolveWorkspaceDependencyRemotely(
        "@stacksjs/actions",
        "^0.75.0",
        "@stacksjs/actions",
        "0.74.22",
    ));
    try std.testing.expect(shouldResolveWorkspaceDependencyRemotely(
        "@stacksjs/actions",
        "^0.74.22",
        "@stacksjs/router",
        "0.74.22",
    ));
}

test "workspace command fails when any package installation failed" {
    const allocator = std.testing.allocator;

    var success = try workspaceCommandResult(allocator, 0);
    defer success.deinit(allocator);
    try std.testing.expectEqual(@as(u8, 0), success.exit_code);
    try std.testing.expect(success.message == null);

    var failure = try workspaceCommandResult(allocator, 2);
    defer failure.deinit(allocator);
    try std.testing.expectEqual(@as(u8, 1), failure.exit_code);
    try std.testing.expectEqualStrings("2 workspace package(s) failed to install", failure.message.?);
}

test "ecosystem delegates report a failed JS install instead of success" {
    // The early "everything up to date" return runs these too, so a JS tree
    // left broken by an earlier failed install is retried rather than
    // reported as current. This pins the helper's contract: a package manager
    // that fails surfaces as a failed command, never as null (carry on).
    if (comptime @import("builtin").os.tag == .windows) return;

    const allocator = std.testing.allocator;
    var tmp_dir = std.testing.tmpDir(.{});
    defer tmp_dir.cleanup();

    var path_buf: [std.fs.max_path_bytes]u8 = undefined;
    const path_len = try tmp_dir.dir.realPath(io_helper.io, &path_buf);
    const project_dir = path_buf[0..path_len];

    try tmp_dir.dir.writeFile(io_helper.io, .{
        .sub_path = "package.json",
        .data = "{\"dependencies\":{\"left-pad\":\"1.3.0\"}}",
    });
    try tmp_dir.dir.writeFile(io_helper.io, .{ .sub_path = "package-lock.json", .data = "{}" });
    try tmp_dir.dir.createDirPath(io_helper.io, "pantry/.bin");
    const fake_npm = try tmp_dir.dir.createFile(io_helper.io, "pantry/.bin/npm", .{});
    try fake_npm.writeStreamingAll(io_helper.io, "#!/bin/sh\nexit 42\n");
    fake_npm.close(io_helper.io);
    const fake_npm_path = try std.fs.path.join(allocator, &.{ project_dir, "pantry/.bin/npm" });
    defer allocator.free(fake_npm_path);
    var chmod_buf: [std.fs.max_path_bytes:0]u8 = undefined;
    @memcpy(chmod_buf[0..fake_npm_path.len], fake_npm_path);
    chmod_buf[fake_npm_path.len] = 0;
    try std.testing.expect(std.c.chmod(&chmod_buf, 0o755) == 0);

    var failure = (try delegateEcosystemInstalls(allocator, project_dir, .{})) orelse return error.TestExpectedFailure;
    defer failure.deinit(allocator);
    try std.testing.expectEqual(@as(u8, 1), failure.exit_code);
    try std.testing.expectEqualStrings("JavaScript dependency installation failed: JsInstallFailed", failure.message.?);
}

test "ecosystem delegates carry on when there is nothing to install" {
    const allocator = std.testing.allocator;
    var tmp_dir = std.testing.tmpDir(.{});
    defer tmp_dir.cleanup();

    var path_buf: [std.fs.max_path_bytes]u8 = undefined;
    const path_len = try tmp_dir.dir.realPath(io_helper.io, &path_buf);

    try std.testing.expect((try delegateEcosystemInstalls(allocator, path_buf[0..path_len], .{})) == null);
}
