//! Core Install Logic
//!
//! Main installation command implementation for project dependencies.

const std = @import("std");
const io_helper = @import("../../../io_helper.zig");
const lib = @import("../../../lib.zig");
const types = @import("types.zig");
const helpers = @import("helpers.zig");
const env_deps = @import("env_deps.zig");
const workspace = @import("workspace.zig");
const global = @import("global.zig");

const lockfile_hooks = @import("lockfile_hooks.zig");
const offline = @import("../../../install/offline.zig");
const recovery = @import("../../../install/recovery.zig");
const style = @import("../../style.zig");
const dependency_parser = @import("../../../deps/parser.zig");

const cache = lib.cache;
const string = lib.string;
const install = lib.install;

fn shouldInstallWithNativePipeline(delegates_js_dependencies: bool, source: dependency_parser.DependencySource) bool {
    return !delegates_js_dependencies or source == .pantry;
}

fn resolutionLockMatches(
    lock_file: *lib.deps.resolution.LockFile,
    name: []const u8,
    version: []const u8,
    resolved: []const u8,
) bool {
    const locked = lockfile_hooks.getLockedVersionForPackage(lock_file, name) orelse return false;
    return std.mem.eql(u8, locked.version, version) and
        std.mem.eql(u8, locked.resolved, resolved);
}

/// Fast path: check if all packages are already installed without doing expensive
/// workspace detection, config loading, hook execution, etc.
/// Returns a CommandResult if everything is up-to-date, null otherwise.
/// Repair the links in the project's `pantry/` (its workspace root's, inside
/// a workspace). Links pantry writes are relative since 0.11.70; this fixes the
/// ones an older pantry left behind, which a skipped package never rewrote.
fn repairProjectTree(allocator: std.mem.Allocator, cwd: []const u8, modules_dir: []const u8) void {
    const detector = @import("../../../deps/detector.zig");
    const tree_repair = @import("../../../install/tree_repair.zig");

    const ws = detector.findWorkspaceFile(allocator, cwd) catch null;
    defer if (ws) |w| {
        allocator.free(w.path);
        allocator.free(w.root_dir);
    };
    const root = if (ws) |w| w.root_dir else cwd;
    const tree = if (std.fs.path.isAbsolute(modules_dir))
        allocator.dupe(u8, modules_dir) catch return
    else
        std.fmt.allocPrint(allocator, "{s}/{s}", .{ root, modules_dir }) catch return;
    defer allocator.free(tree);

    const stats = tree_repair.repairTree(allocator, tree);
    const changed = stats.relinked + stats.retargeted + stats.removed;
    if (changed > 0) {
        style.print("  Repaired {d} link(s) in {s}: {d} made relative, {d} re-pointed, {d} dangling removed\n", .{ changed, modules_dir, stats.relinked, stats.retargeted, stats.removed });
    }
}

fn tryFastUpToDate(allocator: std.mem.Allocator, cwd: []const u8, start_time: i64, modules_dir: []const u8, linker: ?types.LinkerMode) !?types.CommandResult {
    const detector = @import("../../../deps/detector.zig");
    const parser = @import("../../../deps/parser.zig");
    const lockfile_reader = @import("../../../packages/lockfile.zig");

    // 0. Detect workspace context — use workspace root for lockfile/dir checks
    var ws_root_alloc: ?[]const u8 = null;
    defer if (ws_root_alloc) |d| allocator.free(d);
    var ws_path_alloc: ?[]const u8 = null;
    defer if (ws_path_alloc) |p| allocator.free(p);

    const effective_dir = blk: {
        const ws_check = detector.findWorkspaceFile(allocator, cwd) catch null;
        if (ws_check) |ws| {
            ws_path_alloc = ws.path;
            ws_root_alloc = ws.root_dir;
            break :blk ws.root_dir;
        }
        break :blk cwd;
    };
    const is_workspace = ws_root_alloc != null;

    // 1. Find dep file (use effective_dir for lockfile, CWD for dep file discovery)
    const dep_file_names = [_][]const u8{ "pantry.json", "pantry.jsonc", "package.json" };
    var dep_path: ?[]const u8 = null;
    defer if (dep_path) |p| allocator.free(p);

    if (!is_workspace) {
        // Perf: Use stack buffer for fast-path dep file check (avoids 3 allocs)
        var dep_path_buf: [std.fs.max_path_bytes]u8 = undefined;
        for (dep_file_names) |name| {
            const full = std.fmt.bufPrint(&dep_path_buf, "{s}/{s}", .{ cwd, name }) catch continue;
            io_helper.accessAbsolute(full, .{}) catch continue;
            dep_path = try allocator.dupe(u8, full);
            break;
        }
    }

    // 2. Check lockfile exists and read it (at effective_dir for workspaces)
    // Perf: Use stack buffer for lockfile path (avoids heap alloc)
    var lockfile_path_buf: [std.fs.max_path_bytes]u8 = undefined;
    const lockfile_path_stack = std.fmt.bufPrint(&lockfile_path_buf, "{s}/pantry.lock", .{effective_dir}) catch return null;

    var lockfile = lockfile_reader.readLockfile(allocator, lockfile_path_stack) catch return null;
    defer lockfile.deinit(allocator);

    if (lockfile.packages.count() == 0) return null;

    // Workspace manifests and companion deps.yaml files must be compared by
    // declared constraints, not directory counts or mtimes. The workspace
    // installer below performs that authoritative check after parsing every
    // member; bypassing it allowed pulled/checked-out manifests with older
    // mtimes to leave pantry.lock permanently stale.
    if (is_workspace) return null;

    // Non-workspace path: check deps against lockfile
    const found_path = dep_path orelse return null;

    // 3. Parse dep file to get dependency list
    const format = detector.inferFormat(std.fs.path.basename(found_path)) orelse return null;
    const deps_file = detector.DepsFile{ .path = found_path, .format = format };
    const deps = parser.inferDependencies(allocator, deps_file) catch return null;
    defer {
        for (deps) |*dep| {
            var d = dep.*;
            d.deinit(allocator);
        }
        allocator.free(deps);
    }

    if (deps.len == 0) return null;

    // 4. Check all deps against lockfile + verify dirs exist (O(1) per dep via name set)
    // Perf: For small dep lists, skip HashMap construction and use direct lockfile lookup
    // (HashMap has allocation + hashing overhead; direct lookup is O(1) per dep via StringHashMap.get)
    if (deps.len <= 32) {
        var checked_count: usize = 0;
        for (deps) |dep| {
            if (!helpers.canSkipFromLockfile(&lockfile.packages, dep.name, dep.version, cwd, allocator, modules_dir)) {
                return null;
            }
            checked_count += 1;
        }
        if (checked_count == 0) return null;
    } else {
        var name_set = helpers.buildLockfileNameSet(&lockfile.packages, allocator);
        defer name_set.deinit();
        var constraint_map = helpers.buildConstraintMapFromWorkspaces(&lockfile.workspaces, allocator);
        defer constraint_map.deinit();

        var checked_count: usize = 0;
        for (deps) |dep| {
            if (!helpers.canSkipFromLockfileWithNameSet(&name_set, dep.name, dep.version, &constraint_map, cwd, modules_dir)) {
                return null;
            }
            checked_count += 1;
        }
        if (checked_count == 0) return null;
    }

    // 4a. Services the project's .env names (DB_CONNECTION=pgsql, ...) count
    // as dependencies too, or a changed driver would never be installed.
    {
        const inferred = env_deps.infer(allocator, cwd, deps, .{ .report = false }) catch &.{};
        defer env_deps.freeDeps(allocator, inferred);
        for (inferred) |dep| {
            if (!helpers.canSkipFromLockfile(&lockfile.packages, dep.name, dep.version, cwd, allocator, modules_dir)) return null;
        }
    }

    // 4b. Verify integrity hashes for locked packages (if present)
    // Perf: Use stack buffer for path construction (avoids alloc per package)
    var pkg_it = lockfile.packages.iterator();
    var integrity_path_buf: [std.fs.max_path_bytes]u8 = undefined;
    while (pkg_it.next()) |entry| {
        const pkg = entry.value_ptr.*;
        if (pkg.integrity) |expected_integrity| {
            const pkg_path = std.fmt.bufPrint(&integrity_path_buf, "{s}/{s}/{s}", .{ effective_dir, modules_dir, pkg.name }) catch continue;
            const valid = helpers.verifyPackageIntegrity(allocator, pkg_path, expected_integrity) catch {
                return null; // Integrity verification failed (missing/unreadable) → reinstall
            };
            if (!valid) {
                return null; // Integrity mismatch → fall through to slow path for reinstall
            }
        }
    }

    // 5. All up-to-date!

    // Before declaring victory, give the JS delegate a chance to run if a
    // package.json is present and its mtime indicates JS deps may be stale.
    // Without this, editing package.json (without touching pantry.json) would
    // leave `pantry install` falsely reporting "up to date" while node_modules
    // is stale. The delegate has its own fast no-op check so the common case
    // (nothing changed) stays cheap.
    {
        const js_delegate = @import("../../../deps/js_delegate.zig");
        _ = js_delegate.installJsDeps(allocator, effective_dir, false, linker) catch |err| {
            return .{
                .exit_code = 1,
                .message = try std.fmt.allocPrint(allocator, "JavaScript dependency installation failed: {s}", .{@errorName(err)}),
            };
        };
    }

    helpers.ensureBinSymlinks(allocator, effective_dir, modules_dir);

    const end_ts = io_helper.clockGettime();
    const end_time = @as(i64, @intCast(end_ts.sec)) * 1000 + @as(i64, @intCast(@divFloor(end_ts.nsec, 1_000_000)));
    const elapsed_ms = @as(f64, @floatFromInt(end_time - start_time));
    style.printUpToDate(lockfile.packages.count(), 0, elapsed_ms);
    return .{ .exit_code = 0 };
}

/// Extract the dependency domain from a generated-catalog spec, honoring the
/// `os:` prefix (returns null for other-OS deps) and stripping the version
/// constraint and ` # comment`. e.g. `linux:gnu.org/gcc^14 # note` → `gnu.org/gcc`
/// (on Linux), `apache.org/apr^1` → `apache.org/apr`. Returned slice points into
/// `spec_in` (a static catalog string).
/// A catalog dependency spec split into its parts:
/// `unicode.org^73 # v25` → domain `unicode.org`, constraint `^73`.
const DepSpec = struct { domain: []const u8, constraint: []const u8 };

fn depDomainFromSpec(spec_in: []const u8) ?DepSpec {
    var spec = spec_in;
    if (std.mem.indexOfScalar(u8, spec, '#')) |h| spec = spec[0..h];
    spec = std.mem.trim(u8, spec, " \t");
    if (spec.len == 0) return null;
    if (std.mem.indexOfScalar(u8, spec, ':')) |colon| {
        const prefix = spec[0..colon];
        const is_os = std.mem.eql(u8, prefix, "linux") or std.mem.eql(u8, prefix, "darwin") or std.mem.eql(u8, prefix, "windows");
        if (is_os) {
            const cur = switch (@import("builtin").os.tag) {
                .linux => "linux",
                .macos => "darwin",
                .windows => "windows",
                else => "",
            };
            if (!std.mem.eql(u8, prefix, cur)) return null;
            spec = std.mem.trim(u8, spec[colon + 1 ..], " \t");
        }
    }
    var vend: usize = spec.len;
    for (spec, 0..) |c, i| {
        if (c == '^' or c == '~' or c == '>' or c == '<' or c == '=' or c == '@') {
            vend = i;
            break;
        }
    }
    const domain = std.mem.trim(u8, spec[0..vend], " \t");
    if (domain.len == 0) return null;
    // Skip malformed platform-tag pseudo-domains (e.g. `darwin/x86-64`) some
    // catalog entries carry — not installable packages.
    if (std.mem.startsWith(u8, domain, "darwin/") or std.mem.startsWith(u8, domain, "linux/") or std.mem.startsWith(u8, domain, "windows/")) return null;

    var constraint = std.mem.trim(u8, spec[vend..], " \t");
    // The catalog spells an exact pin `@1.1`; everything downstream speaks
    // `name@version`, so drop the redundant leading `@`.
    if (constraint.len > 0 and constraint[0] == '@') constraint = constraint[1..];
    return .{ .domain = domain, .constraint = constraint };
}

/// Whether a version string names one version and no other.
///
/// `1.2.0` is exact; `^1.2.0`, `~1.2`, `>=1.2.0`, `1.x`, `*`, `latest` and the
/// empty string are not. The distinction decides whether a request may be
/// answered from the Pantry registry - which resolves ranges but ignores the
/// version asked for - or has to go to npm, which honours an exact version.
/// The exit code a manifest install ends on.
///
/// Named rather than inline so the rule has a test, the way
/// `workspaceCommandResult` does for the workspace path. It is one line, and
/// it was the wrong line for long enough to be worth pinning: see the comment
/// at its call site for what a silently-zero install costs a caller.
fn manifestExitCode(failed_count: usize) u8 {
    return if (failed_count > 0) 1 else 0;
}

fn isExactVersion(version: []const u8) bool {
    if (version.len == 0) return false;
    if (std.mem.eql(u8, version, "latest")) return false;

    // A version starts with a digit; anything else is an operator or a tag.
    if (version[0] < '0' or version[0] > '9') return false;

    for (version) |c| {
        switch (c) {
            '^', '~', '>', '<', '=', '|', ' ', '*', 'x', 'X', ',' => return false,
            else => {},
        }
    }

    return true;
}

/// Append the transitive system-dependency closure of the explicitly-requested
/// packages to `package_args` (deduped) so a package's shared-library deps
/// (php → libpq/libonig/libxml2/icu/libsodium, nginx → libpcre) are installed
/// alongside it. Deps are read from the embedded catalog and installed at the
/// version each parent declares. Best-effort.
fn appendTransitiveDeps(allocator: std.mem.Allocator, package_args: *std.ArrayList([]const u8)) void {
    const generated = @import("../../../packages/generated.zig");
    var seen = std.StringHashMap(void).init(allocator);
    defer seen.deinit();
    var queue = std.ArrayList([]const u8).empty;
    defer queue.deinit(allocator);

    // Seed with the resolved domains of the requested packages.
    for (package_args.items) |a| {
        const domain = helpers.resolvePackageAlias(helpers.splitPackageSpec(a).name);
        if (seen.contains(domain)) continue;
        seen.put(domain, {}) catch {};
        queue.append(allocator, domain) catch {};
    }

    // BFS the dependency graph from the embedded catalog.
    var i: usize = 0;
    while (i < queue.items.len) : (i += 1) {
        const info = generated.getPackageByDomain(queue.items[i]) orelse continue;
        for (info.dependencies) |spec| {
            const dep = depDomainFromSpec(spec) orelse continue;
            if (seen.contains(dep.domain)) continue;
            seen.put(dep.domain, {}) catch {};
            queue.append(allocator, dep.domain) catch {};

            // Install each dep at the version its parent declares, not `latest`.
            // A package links the library it was BUILT against: node v26 wants
            // unicode.org v73 and openssl v1.1 (the catalog pins both), so
            // resolving them to latest installed icu 78 / openssl 3.6 and left
            // node unable to start at all — `dyld: Library not loaded:
            // @rpath/unicode.org/v73/lib/libicui18n.dylib`.
            const owned = if (dep.constraint.len > 0)
                std.fmt.allocPrint(allocator, "{s}@{s}", .{ dep.domain, dep.constraint }) catch continue
            else
                allocator.dupe(u8, dep.domain) catch continue;
            package_args.append(allocator, owned) catch {
                allocator.free(owned);
            };
        }
    }
}

/// Install packages - main entry point
pub fn installCommand(allocator: std.mem.Allocator, args: []const []const u8) !types.CommandResult {
    return installCommandWithOptions(allocator, args, .{});
}

fn previewInstall(allocator: std.mem.Allocator, package_args: []const []const u8) !types.CommandResult {
    style.print("Dry run: no changes will be made.\n", .{});

    if (package_args.len > 0) {
        for (package_args) |package| {
            style.print("  Would install {s}\n", .{package});
        }
        return .{ .exit_code = 0 };
    }

    const detector = @import("../../../deps/detector.zig");
    const cwd = try io_helper.getCwdAlloc(allocator);
    defer allocator.free(cwd);

    const lookup = try detector.findDepsAndWorkspaceFile(allocator, cwd);
    defer {
        if (lookup.deps_file) |deps_file| allocator.free(deps_file.path);
        if (lookup.workspace_file) |workspace_file| {
            allocator.free(workspace_file.path);
            allocator.free(workspace_file.root_dir);
        }
    }

    var found = false;
    if (lookup.workspace_file) |workspace_file| {
        style.print("  Would install workspace dependencies from {s}\n", .{workspace_file.path});
        found = true;
    }
    if (lookup.deps_file) |deps_file| {
        if (lookup.workspace_file == null or !std.mem.eql(u8, deps_file.path, lookup.workspace_file.?.path)) {
            style.print("  Would install project dependencies from {s}\n", .{deps_file.path});
        }
        found = true;
    }

    if (!found) {
        return .{
            .exit_code = 1,
            .message = try allocator.dupe(u8, "No dependency manifest found"),
        };
    }

    return .{ .exit_code = 0 };
}

/// Install packages with options
pub fn installCommandWithOptions(allocator: std.mem.Allocator, args: []const []const u8, initial_options: types.InstallOptions) !types.CommandResult {
    // Parse flags and filter out non-package arguments
    var is_global = false;
    var options = initial_options;
    var package_args = try std.ArrayList([]const u8).initCapacity(allocator, args.len);
    defer package_args.deinit(allocator);

    for (args) |arg| {
        if (std.mem.eql(u8, arg, "-g") or std.mem.eql(u8, arg, "--global")) {
            is_global = true;
        } else if (std.mem.eql(u8, arg, "--force") or std.mem.eql(u8, arg, "-f")) {
            options.force = true;
        } else if (std.mem.eql(u8, arg, "--frozen-lockfile")) {
            options.frozen_lockfile = true;
        } else if (std.mem.eql(u8, arg, "--no-cache")) {
            options.no_cache = true;
        } else if (std.mem.eql(u8, arg, "--no-save")) {
            options.no_save = true;
        } else if (std.mem.eql(u8, arg, "--dry-run")) {
            options.dry_run = true;
        } else if (std.mem.eql(u8, arg, "--no-auto-link")) {
            options.auto_link = false;
        } else if (std.mem.eql(u8, arg, "--quiet") or std.mem.eql(u8, arg, "-q")) {
            options.quiet = true;
        } else if (!std.mem.startsWith(u8, arg, "-")) {
            try package_args.append(allocator, arg);
        }
    }

    // Honor quiet mode for all downstream output: progress, per-package lines,
    // summaries and headers are suppressed; errors/failures still surface via
    // style.printForced. shell:activate / `pantry env` pass quiet=true so that
    // `eval "$(pantry env)"` never tries to execute progress chatter.
    // PANTRY_QUIET=1 forces quiet for every entry point (install/add/ci and the
    // auto-install triggered on `cd`) without needing a flag each time.
    if (io_helper.getEnvVarOwned(allocator, "PANTRY_QUIET")) |val| {
        defer allocator.free(val);
        if (std.mem.eql(u8, val, "1") or std.mem.eql(u8, val, "true")) options.quiet = true;
    } else |_| {}
    style.setQuiet(options.quiet);

    // Header (bun-style): "pantry install v0.10.3 (hash)" once at the top of
    // every install — including the auto-install fired on `cd`. print() is
    // quiet-aware, so `pantry env`/shell:activate (quiet=true) emit nothing.
    const build_version = @import("version");
    style.printHeader("install", build_version.version, build_version.commit_hash);

    if (options.dry_run) {
        return previewInstall(allocator, package_args.items);
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
        // Whatever path the install takes, up-to-date included, leave the
        // tree's links relative and none of them dangling (see tree_repair).
        defer repairProjectTree(allocator, cwd, options.modules_dir);

        // Start timing for install operation (millisecond precision)
        const start_ts = io_helper.clockGettime();
        const start_time = @as(i64, @intCast(start_ts.sec)) * 1000 + @as(i64, @intCast(@divFloor(start_ts.nsec, 1_000_000)));

        // ── FAST PATH: check if everything is already up-to-date ──
        // This avoids expensive workspace detection, config loading, hooks, etc.
        // Skipped when --force is set (user wants to re-download everything)
        if (!options.force) {
            if (try tryFastUpToDate(allocator, cwd, start_time, options.modules_dir, options.linker)) |result| {
                return result;
            }
        }

        // Combined lookup: find both deps file and workspace file in a single directory walk
        // (avoids two separate realpath + directory traversals)
        const lookup = try detector.findDepsAndWorkspaceFile(allocator, cwd);

        // If we're in a workspace, handle that first
        if (lookup.workspace_file) |ws_file| {
            const has_companion_deps = if (lookup.deps_file) |df|
                !std.mem.eql(u8, df.path, ws_file.path)
            else
                false;
            var staged_lockfile_path: ?[]const u8 = null;
            defer if (staged_lockfile_path) |path| {
                io_helper.deleteFile(path) catch {};
                allocator.free(path);
            };

            var workspace_options = options;
            // The committed lock must describe the complete install. Stage both
            // phases even without --frozen-lockfile, so a companion failure or
            // interruption cannot replace it with an npm-only workspace lock.
            if (has_companion_deps and (options.frozen_lockfile or !options.no_save)) {
                const lockfile_nonce = io_helper.clockGettime();
                staged_lockfile_path = try std.fmt.allocPrint(
                    allocator,
                    "{s}/.pantry.lock.{d}-{d}.tmp",
                    .{ ws_file.root_dir, lockfile_nonce.sec, lockfile_nonce.nsec },
                );
                workspace_options.lockfile_output_path = staged_lockfile_path;
            }

            const ws_result = workspace.installWorkspaceCommandWithOptions(allocator, ws_file.root_dir, ws_file.path, workspace_options);
            if (ws_result) |result| {
                var final_result = result;

                // Monorepos often keep system/runtime deps in deps.yaml (or pantry.json)
                // alongside package.json workspaces. Install that companion file too.
                if (lookup.deps_file) |df| {
                    defer allocator.free(df.path);
                    if (!std.mem.eql(u8, df.path, ws_file.path)) {
                        var companion_options = options;
                        if (staged_lockfile_path != null) companion_options.frozen_lockfile = false;
                        try mergeCompanionResult(allocator, &final_result, installCompanionDepsFile(
                            allocator,
                            df,
                            ws_file.root_dir,
                            companion_options,
                            staged_lockfile_path,
                            options.frozen_lockfile,
                        ), df.path);
                    }
                }

                if (staged_lockfile_path) |generated_path| {
                    try finalizeCombinedWorkspaceLock(allocator, ws_file.root_dir, generated_path, options.frozen_lockfile, &final_result);
                }

                defer {
                    allocator.free(ws_file.path);
                    allocator.free(ws_file.root_dir);
                }
                return final_result;
            } else |err| {
                // Workspace config couldn't be loaded (e.g. no valid workspaces patterns,
                // JSON parse error, or "workspaces" was just a substring match).
                // Fall through to normal dep handling.
                allocator.free(ws_file.path);
                allocator.free(ws_file.root_dir);
                if (err != error.NoWorkspacePatternsFound) return err;
            }
        }

        // Try standard dep file detection first (fast: just filesystem access checks)
        // Only fall back to config loading (slow: may spawn Bun/Node) if no dep file found
        var deps: []parser.PackageDependency = undefined;
        var deps_file_path: ?[]const u8 = null;
        var used_config = false;
        var delegates_js_dependencies = false;
        defer if (deps_file_path) |path| allocator.free(path);

        if (lookup.deps_file) |deps_file| {
            if (parser.inferDependencies(allocator, deps_file)) |parsed_deps| {
                deps_file_path = deps_file.path;
                deps = parsed_deps;
                delegates_js_dependencies = deps_file.format == .package_json or deps_file.format == .package_jsonc;
            } else |err| {
                allocator.free(deps_file.path);
                if (err == error.NoRuntimeAvailable) {
                    // TS config file detected but no bun/node runtime available — exit silently.
                    return .{ .exit_code = 0, .message = null };
                }
                return err;
            }
        } else {
            // No standard dep file, try config file (pantry.config.ts, etc.)
            const config_deps = try helpers.loadDependenciesFromConfig(allocator, cwd);
            if (config_deps) |config_dep_list| {
                deps = config_dep_list;
                used_config = true;
            } else {
                return .{
                    .exit_code = 1,
                    .message = try allocator.dupe(u8, "Error: No packages specified and no dependency file found"),
                };
            }
        }

        defer {
            for (deps) |*dep| {
                var d = dep.*;
                d.deinit(allocator);
            }
            // Only free deps if we allocated it (not if it came from config)
            if (!used_config) {
                allocator.free(deps);
            }
        }

        // Install GUI apps & fonts declared in deps.yaml (macOS). Runs before the
        // dependency filter so it still fires when a project declares only
        // apps:/fonts: and no command-line dependencies. No-op off macOS; every
        // failure is non-fatal so it never breaks the CLI-dependency install.
        if (deps_file_path) |dpath| {
            const desktop_apps = @import("../../../install/desktop_apps.zig");
            desktop_apps.installFromDepsFile(allocator, dpath, options.quiet);
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
                    // Peer deps only if explicitly enabled via pantry.toml or --peer flag
                    if (dep.dep_type == .peer) {
                        break :blk options.include_peer;
                    }
                    break :blk true;
                }
            };

            if (should_include) {
                // Skip marker deps — these are handled by post-install delegation
                if (std.mem.startsWith(u8, dep.name, "__") and std.mem.endsWith(u8, dep.name, "__")) {
                    continue;
                }
                // A conventional package.json belongs to its selected JS package
                // manager. Installing those entries into pantry/ and then invoking
                // bun/pnpm/yarn/npm duplicated the full dependency graph and made
                // clean installs unnecessarily slow. Explicit Pantry dependencies
                // (`pantry` / `system` fields) retain source=.pantry and still flow
                // through the native pipeline before JS delegation runs once.
                if (!shouldInstallWithNativePipeline(delegates_js_dependencies, dep.source)) {
                    continue;
                }
                try filtered_deps.append(allocator, dep);
            }
        }

        // Services the project's .env names (DB_CONNECTION=pgsql -> postgresql.org,
        // ...), unless the dependency file already declares them (#36).
        const env_inferred = env_deps.infer(
            allocator,
            if (deps_file_path) |path| std.fs.path.dirname(path) orelse cwd else cwd,
            deps,
            .{ .frozen_lockfile = options.frozen_lockfile },
        ) catch &.{};
        defer env_deps.freeDeps(allocator, env_inferred);
        try filtered_deps.appendSlice(allocator, env_inferred);

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
                    style.print("Found {d} package override(s)\n", .{override_map.count()});
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
            // Even with zero npm/system deps, check for PHP deps (composer.json)
            // and Zig deps (build.zig.zon) that need post-install handling
            const proj_dir_early = if (deps_file_path) |path|
                std.fs.path.dirname(path) orelse cwd
            else
                cwd;

            // Run Composer delegate for PHP deps
            {
                const composer_delegate = @import("../../../deps/composer_delegate.zig");
                const php_installed = composer_delegate.installPhpDeps(allocator, proj_dir_early, options.verbose) catch false;
                if (php_installed) {
                    const end_ts = io_helper.clockGettime();
                    const end_time = @as(i64, @intCast(end_ts.sec)) * 1000 + @as(i64, @intCast(@divFloor(end_ts.nsec, 1_000_000)));
                    const elapsed_ms = @as(f64, @floatFromInt(end_time - start_time));
                    style.printSummary(0, 0, elapsed_ms);
                    return .{ .exit_code = 0 };
                }
            }

            // Run JS delegate for package.json deps
            {
                const js_delegate = @import("../../../deps/js_delegate.zig");
                const js_installed = js_delegate.installJsDeps(allocator, proj_dir_early, options.verbose, options.linker) catch |err| {
                    return .{
                        .exit_code = 1,
                        .message = try std.fmt.allocPrint(allocator, "JavaScript dependency installation failed: {s}", .{@errorName(err)}),
                    };
                };
                if (js_installed) {
                    const end_ts = io_helper.clockGettime();
                    const end_time = @as(i64, @intCast(end_ts.sec)) * 1000 + @as(i64, @intCast(@divFloor(end_ts.nsec, 1_000_000)));
                    const elapsed_ms = @as(f64, @floatFromInt(end_time - start_time));
                    style.printSummary(0, 0, elapsed_ms);
                    return .{ .exit_code = 0 };
                }
            }

            // Sync build.zig.zon for Zig deps
            {
                const zig_zon_sync = @import("../../../deps/zig_zon_sync.zig");
                zig_zon_sync.syncBuildZigZon(allocator, proj_dir_early, options.modules_dir, options.verbose) catch {};
            }

            if (deps_file_path) |path| {
                style.print("No dependencies to install from {s}\n", .{path});
            } else {
                style.print("No dependencies to install from config file\n", .{});
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

        // Hash dependency file path (or project dir if using config)
        // Uses path instead of file contents to avoid re-reading the dep file
        const hash_input = if (deps_file_path) |path|
            path
        else
            proj_dir;

        var dep_hasher = std.crypto.hash.Md5.init(.{});
        dep_hasher.update(hash_input);
        var dep_hash: [16]u8 = undefined;
        dep_hasher.final(&dep_hash);
        const dep_hash_hex = try string.hashToHex(dep_hash, allocator);
        defer allocator.free(dep_hash_hex);
        const dep_hash_short = try std.fmt.allocPrint(allocator, "d{s}", .{dep_hash_hex[0..8]});
        defer allocator.free(dep_hash_short);

        // Create environment directory under the pantry data dir (same layout as shell integration)
        const data_dir = try lib.Paths.data(allocator);
        defer allocator.free(data_dir);

        const env_name = try std.fmt.allocPrint(
            allocator,
            "{s}_{s}-{s}",
            .{ proj_basename, proj_hash_short, dep_hash_short },
        );
        defer allocator.free(env_name);

        const env_dir = try std.fs.path.join(allocator, &[_][]const u8{ data_dir, "envs", env_name });
        defer allocator.free(env_dir);

        // Create environment directory structure
        try io_helper.makePath(env_dir);
        const bin_dir = try std.fmt.allocPrint(allocator, "{s}/bin", .{env_dir});
        defer allocator.free(bin_dir);
        try io_helper.makePath(bin_dir);

        // Check if we're in offline mode
        const is_offline = offline.isOfflineMode();
        if (is_offline) {
            style.printOffline();
        }

        // Show force mode indicator
        if (options.force) {
            style.print("{s}Force mode:{s} ignoring cache and lockfile\n", .{ style.yellow, style.reset });
        }

        // Try to resume from a previous interrupted install, or create a fresh checkpoint
        var checkpoint = recovery.InstallCheckpoint.loadFromDisk(allocator, proj_dir) catch null orelse recovery.InstallCheckpoint.init(allocator);
        defer checkpoint.deinit();

        const resuming_count: usize = checkpoint.installed_packages.count();

        // Set checkpoint path for persistence (enables resume on interrupt)
        checkpoint.setCheckpointPath(proj_dir) catch |err| {
            if (options.verbose) {
                style.print("Warning: Could not set checkpoint path: {}\n", .{err});
            }
        };

        // Create backup of current state
        checkpoint.createBackup(proj_dir) catch |err| {
            if (options.verbose) {
                style.print("Could not create backup: {}\n", .{err});
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
                    style.print("Rollback failed: {}\n", .{err});
                };
                return .{
                    .exit_code = 1,
                    .message = try allocator.dupe(u8, "Pre-install hook failed"),
                };
            }
        }

        // Load .npmrc configuration for custom registries and auth tokens
        var npmrc_config = lib.config.loadNpmrc(allocator, cwd) catch lib.config.NpmrcConfig.init(allocator);
        defer npmrc_config.deinit();

        // Apply .npmrc registry override to environment if present
        if (npmrc_config.registry) |custom_registry| {
            if (options.verbose) {
                style.print("Using registry from .npmrc: {s}\n", .{custom_registry});
            }
        }

        // Clean Bun-style output - just show what we're installing
        style.printInstallingEx(deps_to_install.len, resuming_count);

        if (options.verbose) {
            const setup_ts = io_helper.clockGettime();
            const setup_ms = @as(i64, @intCast(setup_ts.sec)) * 1000 + @as(i64, @intCast(@divFloor(setup_ts.nsec, 1_000_000)));
            std.debug.print("[verbose:timer] setup phase complete: {d}ms\n", .{setup_ms - start_time});
        }

        // Install each dependency concurrently using a shared installer for deduplication
        var pkg_cache = try cache.PackageCache.init(allocator);
        defer pkg_cache.deinit();

        var shared_installer = try install.Installer.init(allocator, &pkg_cache);
        allocator.free(shared_installer.data_dir);
        shared_installer.data_dir = try allocator.dupe(u8, env_dir);
        shared_installer.modules_dir = options.modules_dir;
        shared_installer.verbose = options.verbose;

        // Configure installer with .npmrc settings
        if (npmrc_config.registry) |custom_registry| {
            shared_installer.setRegistryUrl(custom_registry);
        }

        // Wire up lockfile for lockfile-first resolution (skip npm registry on subsequent installs)
        shared_installer.setLockfile(&lock_file);

        // Prefer bun.lock's pins for npm ranges they satisfy, so a project
        // locked by both pantry and Bun gets one tree (stacksjs/stacks#2848).
        var bun_pins = lib.deps.resolution.BunLockPins.load(allocator, proj_dir);
        defer if (bun_pins) |*pins| pins.deinit();
        if (bun_pins) |*pins| shared_installer.setBunLockPins(pins);

        defer shared_installer.deinit();

        // Batch install from lockfile: if lockfile has all packages resolved,
        // extract them in parallel (skips individual resolution + recursive dep walking)
        if (shared_installer.installAllFromLockfile(proj_dir)) |batch_count_opt| {
            if (batch_count_opt) |batch_count| {
                if (batch_count > 0) {
                    style.print("{s}{s}{s} Restored {d} packages from lockfile\n", .{ style.green, style.check, style.reset, batch_count });
                }
            }
        } else |_| {}

        // ── Parallel pipeline: resolve tree → download → extract ──
        const pipeline = @import("../../../install/pipeline.zig");

        // Build pipeline dep list
        var pipeline_deps = try allocator.alloc(pipeline.PipelineDep, deps_to_install.len);
        defer allocator.free(pipeline_deps);
        for (deps_to_install, 0..) |dep, di| {
            const clean_name = helpers.resolvePackageAlias(helpers.normalizePackageName(dep.name));
            // Domain-style names (containing '.') are pantry/system packages, not npm
            const is_domain = std.mem.indexOfScalar(u8, clean_name, '.') != null;
            pipeline_deps[di] = .{
                .name = clean_name,
                .version = dep.version,
                .source = if (is_domain) .pantry else switch (dep.source) {
                    .registry => .npm,
                    .pantry => .pantry,
                    .npm => .npm,
                    .github => .github,
                    .git => .git,
                    .url => .http,
                },
                .github_owner = if (dep.github_ref) |ref| ref.owner else null,
                .github_repo = if (dep.github_ref) |ref| ref.repo else null,
            };
        }

        var pipeline_result = try pipeline.run(
            allocator,
            &shared_installer,
            pipeline_deps,
            proj_dir,
            options.verbose,
        );
        defer pipeline_result.deinit(allocator);

        // Print results
        var success_count: usize = 0;
        var failed_count: usize = 0;

        for (pipeline_result.results) |result| {
            // Another platform's optional build: locked, not installed.
            if (result.name.len == 0 or result.lock_only) continue;
            if (result.success) {
                style.printInstalled(result.name, result.version);
                success_count += 1;
            } else {
                style.printFailed(result.name, result.version, result.error_msg);
                failed_count += 1;
            }
        }

        if (options.verbose) {
            const phase_ts = io_helper.clockGettime();
            const phase_ms = @as(i64, @intCast(phase_ts.sec)) * 1000 + @as(i64, @intCast(@divFloor(phase_ts.nsec, 1_000_000)));
            std.debug.print("[verbose:timer] parallel install phase complete: {d}ms\n", .{phase_ms - start_time});
        }

        // Handle local packages separately (they need special symlink handling)
        // Create pantry directory if it doesn't exist
        const pantry_dir = try std.fmt.allocPrint(allocator, "{s}/{s}", .{ proj_dir, options.modules_dir });
        defer allocator.free(pantry_dir);
        try io_helper.makePath(pantry_dir);

        // Batch auto-discovery: collect all unresolved link: deps, scan directory tree once
        const link_cmds = @import("../link.zig");
        var auto_link_results: ?link_cmds.AutoLinkResults = null;
        defer if (auto_link_results) |*r| r.deinit();

        if (options.auto_link) {
            // Collect unresolved link: dep names
            var unresolved = std.ArrayList([]const u8).empty;
            defer unresolved.deinit(allocator);

            for (deps) |dep| {
                if (!helpers.isLinkDependency(dep.version)) continue;
                const link_name = dep.version[5..]; // Skip "link:"
                // Check if already registered as a global link
                if (try link_cmds.resolveLinkPath(allocator, link_name)) |existing| {
                    allocator.free(existing);
                    continue;
                }
                try unresolved.append(allocator, link_name);
            }

            if (unresolved.items.len > 0) {
                auto_link_results = try link_cmds.autoDiscoverAndLinkBatch(allocator, unresolved.items, options.link_search_paths);

                // Print auto-linked messages for discovered packages
                for (unresolved.items) |link_name| {
                    if (auto_link_results.?.get(link_name)) |discovered_path| {
                        style.printAutoLinked(link_name, discovered_path);
                    }
                }
            }
        }

        for (deps) |dep| {
            if (!helpers.isLocalDependency(dep)) continue;

            // Resolve local path (handles link:, ~/, absolute, and relative paths)
            // Note: auto-discovered deps are now registered as global links,
            // so resolveLinkVersion will find them via the symlink.
            const local_path = if (helpers.isLinkDependency(dep.version)) blk: {
                const resolved = try helpers.resolveLinkVersion(allocator, dep.version);
                break :blk resolved orelse {
                    style.printFailed(dep.name, dep.version, "not linked - run 'pantry link' in the package directory");
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
                style.printWarning(dep.name, dep.version, "path not found");
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
                style.printFailed(dep.name, "", "invalid package name");
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
                    io_helper.symLink(src_path, src_link_path) catch {
                        style.printFailed(helpers.stripDisplayPrefix(dep.name), dep.version, "symlink failed");
                        failed_count += 1;
                        continue;
                    };
                },
                else => {
                    style.printFailed(helpers.stripDisplayPrefix(dep.name), dep.version, "symlink failed");
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
                            style.print("    Warning: Failed to create bin symlink {s}: {}\n", .{ link_path, err2 });
                        }
                    };
                },
                else => {
                    if (options.verbose) {
                        style.print("    Warning: Failed to create bin symlink {s}: {}\n", .{ link_path, symlink_err });
                    }
                },
            };

            // Create pantry/.bin directory and symlink binaries from zig-out/bin
            const local_bin_dir = try std.fmt.allocPrint(allocator, "{s}/{s}/.bin", .{ proj_dir, options.modules_dir });
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
                                    style.print("    Warning: Failed to create local bin symlink {s}: {}\n", .{ bin_dst, sym_err });
                                }
                            },
                        };
                    }
                }
            } else |_| {
                // No zig-out/bin directory, that's fine
            }

            const display_name = helpers.stripDisplayPrefix(dep.name);
            style.printLinked(display_name, dep.version);
            success_count += 1;
        }

        // Final pass: ensure pantry/.bin has symlinks for all installed package binaries.
        // Only run if there were actual installs (not all cache hits) to avoid expensive dir scan.
        if (success_count > 0) {
            helpers.ensureBinSymlinks(allocator, proj_dir, options.modules_dir);
        }

        // The resolution lock is the canonical file for this install path.
        // A second v2 writer used to emit a constraint-only lock here, only for
        // the resolution writer below to overwrite it moments later. Besides
        // format churn, that branch rejected every frozen install regardless
        // of whether its lock was current.
        var frozen_lockfile_changed = false;

        // Add successful packages to pantry.lock and record in checkpoint.
        for (pipeline_result.results) |result| {
            if (result.success and result.name.len > 0) {
                const clean_name = helpers.normalizePackageName(result.name);
                const resolved_url = try std.fmt.allocPrint(allocator, "registry:{s}@{s}", .{ clean_name, result.version });
                defer allocator.free(resolved_url);

                if (options.frozen_lockfile) {
                    if (!resolutionLockMatches(&lock_file, clean_name, result.version, resolved_url))
                        frozen_lockfile_changed = true;
                } else if (!options.no_save) {
                    if (lockfile_hooks.getLockedVersionForPackage(&lock_file, clean_name)) |previous| {
                        if (!std.mem.eql(u8, previous.version, result.version))
                            style.printLockPinMoved(clean_name, previous.version, result.version, false);
                    }
                    try lockfile_hooks.addPackageToLockfile(&lock_file, clean_name, result.version, resolved_url, null);
                }
                // Nothing of it is on disk to record below.
                if (result.lock_only) continue;

                // Record successful package installation in checkpoint
                checkpoint.recordPackage(clean_name) catch |err| {
                    if (options.verbose) {
                        style.print("Could not record package in checkpoint: {}\n", .{err});
                    }
                };

                // Record installed files/directories
                const pkg_dir = try std.fmt.allocPrint(allocator, "{s}/{s}/{s}", .{ proj_dir, options.modules_dir, clean_name });
                defer allocator.free(pkg_dir);
                checkpoint.recordDir(pkg_dir) catch |err| {
                    if (options.verbose) {
                        style.print("Could not record directory in checkpoint: {}\n", .{err});
                    }
                };
            }
        }

        if (frozen_lockfile_changed) {
            style.printWarn("Lockfile would be modified but --frozen-lockfile is set\n", .{});
            return .{
                .exit_code = 1,
                .message = try allocator.dupe(u8, "Error: lockfile is out of date (--frozen-lockfile)"),
            };
        }

        if (!options.frozen_lockfile and !options.no_save)
            try lockfile_hooks.saveLockfile(&lock_file, cwd);

        // Apply patches from patchedDependencies in package.json
        {
            const patch_mod = @import("../../../install/patches.zig");
            const patch_result = patch_mod.applyPatches(allocator, proj_dir, options.verbose) catch |err| blk: {
                if (options.verbose) {
                    style.print("Warning: Failed to apply patches: {}\n", .{err});
                }
                break :blk patch_mod.PatchResult{ .applied = 0, .failed = 0, .skipped = 0 };
            };
            if (patch_result.applied > 0 or patch_result.failed > 0) {
                style.print("Patches: {d} applied", .{patch_result.applied});
                if (patch_result.failed > 0) {
                    style.print(", {s}{d} failed{s}", .{ style.red, patch_result.failed, style.reset });
                }
                style.print("\n", .{});
            }
        }

        // Sync build.zig.zon with installed zig deps
        {
            const zig_zon_sync = @import("../../../deps/zig_zon_sync.zig");
            zig_zon_sync.syncBuildZigZon(allocator, proj_dir, options.modules_dir, options.verbose) catch |err| {
                if (options.verbose) {
                    style.print("Warning: Failed to sync build.zig.zon: {}\n", .{err});
                }
            };
        }

        // Delegate to Composer for PHP deps if composer.json is present
        {
            const composer_delegate = @import("../../../deps/composer_delegate.zig");
            _ = composer_delegate.installPhpDeps(allocator, proj_dir, options.verbose) catch |err| {
                if (options.verbose) {
                    style.print("Warning: Composer delegation failed: {}\n", .{err});
                }
            };
        }

        // Delegate to bun/pnpm/yarn/npm for JS deps if package.json is present
        {
            const js_delegate = @import("../../../deps/js_delegate.zig");
            _ = js_delegate.installJsDeps(allocator, proj_dir, options.verbose, options.linker) catch |err| {
                return .{
                    .exit_code = 1,
                    .message = try std.fmt.allocPrint(allocator, "JavaScript dependency installation failed: {s}", .{@errorName(err)}),
                };
            };
        }

        // Total = everything we actually acted on (top-level + transitive +
        // local links), so the summary is consistent with success_count. Using
        // deps.len (top-level only) produced nonsense like "9/3 packages
        // installed" when transitive deps pushed success_count past the
        // top-level count. With this, an all-success run reads "9 packages
        // installed" and a partial run reads e.g. "7/9 packages installed".
        const total_deps = success_count + failed_count;
        const end_ts = io_helper.clockGettime();
        const end_time = @as(i64, @intCast(end_ts.sec)) * 1000 + @as(i64, @intCast(@divFloor(end_ts.nsec, 1_000_000)));
        const elapsed_ms = @as(f64, @floatFromInt(end_time - start_time));
        if (success_count > 0) {
            style.printSummary(success_count, total_deps, elapsed_ms);
        } else if (failed_count == 0) {
            // Genuinely nothing to do — everything already present.
            style.printCheckedSummary(success_count, total_deps, elapsed_ms);
        }
        // else: success_count == 0 AND something failed — don't print a green
        // "N packages up to date" line that contradicts the red failure summary
        // printed just below. The failure count is the only honest summary here.

        if (options.verbose) {
            std.debug.print("[verbose:timer] total install time: {d}ms\n", .{@as(i64, @intFromFloat(elapsed_ms))});
        }

        if (failed_count > 0) {
            style.printFailureCount(failed_count);

            if (options.verbose) {
                style.printWarn("Some packages failed. Use 'pantry clean' to reset, or fix errors and retry.\n", .{});
            }
        }

        // Flush batched analytics (single HTTP request in background thread)
        install.flushAnalytics(allocator);

        // Execute post-install hook
        if (try lockfile_hooks.executePostInstallHook(allocator, cwd, options.verbose)) |*post_result| {
            defer {
                var r = post_result.*;
                r.deinit(allocator);
            }
            if (!post_result.success) {
                style.printWarn("Post-install hook failed\n", .{});
                // Don't fail the install, just warn
            }
        }

        // Clean up checkpoint file on completion (resume rarely useful, avoids polluting project)
        checkpoint.cleanup();

        // Update env cache so shell:lookup finds this env on next cd (no binary re-scan needed)
        {
            const env_cache_mod = lib.cache.env_cache;
            var env_cache = lib.cache.EnvCache.initWithPersistence(allocator) catch null;
            if (env_cache) |*ec| {
                defer ec.deinit();

                const project_hash_for_cache = string.md5Hash(proj_dir);
                const dep_mtime: i128 = if (deps_file_path) |path| blk: {
                    const f = io_helper.cwd().openFile(io_helper.io, path, .{}) catch break :blk 0;
                    defer f.close(io_helper.io);
                    const fstat = f.stat(io_helper.io) catch break :blk 0;
                    break :blk @divFloor(fstat.mtime.toNanoseconds(), std.time.ns_per_s);
                } else 0;

                const now = @as(i64, @intCast((io_helper.clockGettime()).sec));
                const entry = allocator.create(env_cache_mod.Entry) catch null;
                if (entry) |e| {
                    e.* = .{
                        .hash = project_hash_for_cache,
                        .dep_file = allocator.dupe(u8, deps_file_path orelse "") catch "",
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

        // A package the manifest asked for and did not get is a failed install,
        // and the exit code has to say so.
        //
        // This path returned 0 unconditionally while the other three - named
        // installs, the companion deps file, and workspaces - all returned 1.
        // So `pantry install` reading a pantry.json printed "1 package(s)
        // failed to install" in red and then reported success to its caller,
        // which is the shape that does real damage: every script that runs
        // `pantry install && build` carried on into a build with a missing
        // system dependency, and the failure surfaced later as something else
        // entirely - a compiler not found, a binary that is not there.
        //
        // Everything counted in `failed_count` is a dependency that is absent:
        // it did not download, it is not linked, its path does not exist, its
        // name was unsafe, or its symlink could not be made. None of those is
        // a state a caller should be told is fine.
        return .{ .exit_code = manifestExitCode(failed_count) };
    }

    // Detect if we're in a project directory
    const detector = @import("../../../deps/detector.zig");
    const cwd = try io_helper.getCwdAlloc(allocator);
    defer allocator.free(cwd);

    const project_root = blk: {
        // Check for workspace context first — named installs should go to workspace root
        const ws_file = try detector.findWorkspaceFile(allocator, cwd);
        if (ws_file) |ws| {
            defer allocator.free(ws.path);
            // Use workspace root, not the member directory
            break :blk ws.root_dir; // root_dir is already allocated
        }

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
    installer.modules_dir = options.modules_dir;
    defer installer.deinit();

    // Start timing (millisecond precision)
    const start_ts2 = io_helper.clockGettime();
    const start_time = @as(i64, @intCast(start_ts2.sec)) * 1000 + @as(i64, @intCast(@divFloor(start_ts2.nsec, 1_000_000)));

    // Expand the requested packages with their transitive system-dependency
    // closure so dependent binaries can load their shared libraries. The first
    // `user_requested_count` entries are what the user asked for; the rest are
    // pulled-in deps whose install failures are non-fatal.
    const user_requested_count = package_args.items.len;
    appendTransitiveDeps(allocator, &package_args);

    style.printInstalling(user_requested_count);

    var success_count: usize = 0;
    var failed_count: usize = 0;

    // Track successful installs for lockfile
    // Tracks packages we've installed so we can emit a lockfile entry per-pkg.
    // `integrity` is the SRI/hex hash captured from the resolver when available
    // — persisted into the lockfile so a subsequent `pantry install --frozen`
    // can re-verify the tarball against the pinned digest.
    var installed_packages = std.ArrayList(struct {
        name: []const u8,
        version: []const u8,
        source: lib.packages.PackageSource,
        integrity: ?[]const u8 = null,
    }).empty;
    defer {
        for (installed_packages.items) |pkg| {
            allocator.free(pkg.name);
            allocator.free(pkg.version);
        }
        installed_packages.deinit(allocator);
    }

    for (package_args.items, 0..) |pkg_spec_str, arg_idx| {
        const is_transitive_dep = arg_idx >= user_requested_count;
        // Parse package spec (name@version). Scope-aware: a scoped name begins
        // with '@', so splitting on the FIRST '@' emptied the name and turned
        // the scope into the version — every scoped package resolved to nothing.
        const parts = helpers.splitPackageSpec(pkg_spec_str);
        const raw_name = parts.name;
        const version = parts.version;

        // Resolve aliases (e.g. "meilisearch" -> "meilisearch.com")
        const name = helpers.resolvePackageAlias(raw_name);

        // Check if package exists in pantry registry first
        const pkg_registry = @import("../../../packages/generated.zig");
        const pkg_info = pkg_registry.getPackageByName(name);

        // For Zig aliases, always route to Pantry's mirrored ziglang.org package.
        const is_zig_pkg = std.mem.eql(u8, name, "zig") or
            std.mem.eql(u8, name, "ziglang") or
            std.mem.eql(u8, name, "ziglang.org");

        // Determine the package spec - use npm fallback if not in pantry registry
        const spec = if (is_zig_pkg) lib.packages.PackageSpec{
            .name = "ziglang.org",
            .version = version,
            .source = .pantry,
        } else if (pkg_info != null) lib.packages.PackageSpec{
            .name = name,
            .version = version,
        } else npm_fallback: {
            // An exact version the caller named, as opposed to a range or the
            // default.
            //
            // The Pantry registry lookup below answers with whatever version it
            // currently holds and takes no version argument, so consulting it
            // for an exact request silently installed something else:
            // `pantry install left-pad@1.2.0` reported success and put 1.3.0 on
            // disk. An exact version is the one thing a caller cannot be talked
            // out of, so it skips the registry and goes to npm, which resolves
            // the version it was asked for.
            //
            // A *range* is not a pin and must not take this path: the npm
            // branch below looks the version string up as a key in `versions`,
            // which `^1.2.0` is not, so routing a range there fails the install
            // outright. Ranges keep the registry path, which resolves them.
            const pinned = isExactVersion(version);

            // Try Pantry S3/DynamoDB registry first
            if (if (pinned) null else helpers.lookupPantryRegistry(allocator, name) catch |err| lkup: {
                style.print("{s}  ? {s}: pantry registry lookup failed: {}{s}\n", .{ style.dim, name, err, style.reset });
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

            // For domain-style packages (containing '.'), use pkgx source
            // which triggers S3 registry lookup in installer.zig.
            if (std.mem.indexOfScalar(u8, name, '.') != null) {
                break :npm_fallback lib.packages.PackageSpec{
                    .name = name,
                    .version = version,
                };
            }

            // Fall back to npm registry — fetch directly into memory (no temp file, no curl)
            const npm_url = std.fmt.allocPrint(allocator, "https://registry.npmjs.org/{s}", .{name}) catch {
                break :npm_fallback lib.packages.PackageSpec{ .name = name, .version = version };
            };
            defer allocator.free(npm_url);

            const npm_response = io_helper.httpGet(allocator, npm_url) catch {
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
        style.print("  {s}>{s} {s}@{s}...", .{ style.dim, style.reset, name, spec.version });

        var result = installer.install(spec, .{
            .project_root = project_root,
            .quiet = false, // Show download progress
        }) catch |err| {
            style.clearLine();
            // Provide friendly error messages
            const error_msg = switch (err) {
                error.PackageNotFound => "not found in pantry or npm registry",
                error.NoTarballUrl => "npm package found but no tarball URL available",
                else => style.friendlyErrorName(err),
            };
            // A pulled-in transitive dep failing is non-fatal (it may lack a
            // build for this platform); only requested packages count as failures.
            if (is_transitive_dep) {
                if (options.verbose)
                    style.print("{s}  ? optional dep {s}: {s}{s}\n", .{ style.dim, name, error_msg, style.reset });
            } else {
                style.printFailed(name, spec.version, error_msg);
                failed_count += 1;
            }
            continue;
        };

        defer result.deinit(allocator);

        style.clearLine();
        style.printInstalled(name, result.version);
        success_count += 1;

        // Track for lockfile
        const tracked_integrity: ?[]const u8 = if (result.integrity) |i|
            (allocator.dupe(u8, i) catch null)
        else
            null;
        installed_packages.append(allocator, .{
            .name = allocator.dupe(u8, name) catch continue,
            .version = allocator.dupe(u8, result.version) catch continue,
            .source = spec.source,
            .integrity = tracked_integrity,
        }) catch |err| {
            style.print("Warning: Failed to track installed package {s}: {}\n", .{ name, err });
            if (tracked_integrity) |ti| allocator.free(ti);
        };

        // Record the new dependency in the manifest (skip when --no-save).
        //
        // Only what the user actually asked for: `is_transitive_dep` entries are
        // the system-library closure we expanded above (node pulls in unicode.org,
        // openssl.org, zlib.net, curl.se/ca-certs), and listing those as direct
        // dependencies claims the project depends on them directly. Worse, they
        // were recorded at the *closure's* resolved version rather than the one
        // actually installed, so the manifest contradicted what was on disk.
        //
        // And route by source: system packages are declared in deps.yaml, npm
        // packages in package.json. Writing a domain like `curl.se/ca-certs` into
        // package.json left pnpm unable to install the project at all.
        if (!options.no_save and !is_transitive_dep) {
            if (spec.source == .pantry) {
                helpers.addDependencyToDepsYaml(allocator, project_root, name, result.version) catch |err| {
                    style.printWarn("Failed to update deps.yaml: {}\n", .{err});
                };
            } else {
                helpers.addDependencyToPackageJson(allocator, project_root, name, result.version, options.dev_only) catch |err| {
                    style.printWarn("Failed to update package.json: {}\n", .{err});
                };
            }
        }
    }

    // Ensure pantry/.bin has symlinks for all installed package binaries
    helpers.ensureBinSymlinks(allocator, project_root, options.modules_dir);

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
                    style.printWarn("Failed to create lockfile: {}\n", .{init_err});
                    return .{ .exit_code = 0 };
                };
            }
            style.printWarn("Failed to read lockfile: {}\n", .{err});
            return .{ .exit_code = 0 };
        };
        defer lockfile.deinit(allocator);

        // Add new packages to the lockfile (replace existing versions of same package)
        for (installed_packages.items) |pkg| {
            // First, remove any existing entries for this package (different versions)
            var keys_to_remove = std.ArrayList([]const u8).empty;
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
                .integrity = if (pkg.integrity) |i| (allocator.dupe(u8, i) catch null) else null,
                .dependencies = null,
            };

            const key = std.fmt.allocPrint(allocator, "{s}@{s}", .{ pkg.name, pkg.version }) catch continue;
            defer allocator.free(key);
            lockfile.addEntry(allocator, key, entry) catch |err| {
                style.print("Warning: Failed to add lockfile entry for {s}: {}\n", .{ pkg.name, err });
            };
        }

        // Write merged lockfile
        style.printLockfileSaving();
        lockfile_writer.writeLockfile(allocator, &lockfile, lockfile_path) catch |err| {
            style.printWarn("Failed to write lockfile: {}\n", .{err});
        };
        style.printLockfileSaved();
    }

    // Clean summary with timing
    const end_ts2 = io_helper.clockGettime();
    const end_time = @as(i64, @intCast(end_ts2.sec)) * 1000 + @as(i64, @intCast(@divFloor(end_ts2.nsec, 1_000_000)));
    const elapsed_ms = @as(f64, @floatFromInt(end_time - start_time));

    style.printSummary(success_count, package_args.items.len, elapsed_ms);

    if (failed_count > 0) {
        style.printFailureCount(failed_count);
        return .{ .exit_code = 1 };
    }

    return .{ .exit_code = 0 };
}

test "package.json delegates ordinary JS dependency sources" {
    try std.testing.expect(!shouldInstallWithNativePipeline(true, .registry));
    try std.testing.expect(!shouldInstallWithNativePipeline(true, .npm));
    try std.testing.expect(!shouldInstallWithNativePipeline(true, .github));
    try std.testing.expect(!shouldInstallWithNativePipeline(true, .git));
    try std.testing.expect(!shouldInstallWithNativePipeline(true, .url));
}

test "package.json keeps explicit Pantry dependencies native" {
    try std.testing.expect(shouldInstallWithNativePipeline(true, .pantry));
    try std.testing.expect(shouldInstallWithNativePipeline(false, .npm));
}

fn mergeCompanionResult(allocator: std.mem.Allocator, final_result: *types.CommandResult, result: anyerror!types.CommandResult, deps_path: []const u8) !void {
    if (result) |value| {
        var companion = value;
        defer companion.deinit(allocator);
        if (companion.exit_code != 0 and final_result.exit_code == 0) {
            final_result.exit_code = companion.exit_code;
            if (final_result.message) |message| allocator.free(message);
            final_result.message = companion.message;
            companion.message = null;
        }
    } else |err| {
        if (final_result.exit_code == 0) {
            final_result.exit_code = 1;
            if (final_result.message) |message| allocator.free(message);
            final_result.message = null;
            final_result.message = try std.fmt.allocPrint(allocator, "Error installing {s}: {s}", .{ std.fs.path.basename(deps_path), @errorName(err) });
        }
    }
}

fn finalizeCombinedWorkspaceLock(allocator: std.mem.Allocator, project_root: []const u8, generated_path: []const u8, frozen: bool, result: *types.CommandResult) !void {
    if (result.exit_code != 0) return;
    const committed_path = try std.fs.path.join(allocator, &.{ project_root, "pantry.lock" });
    defer allocator.free(committed_path);
    if (!frozen) return std.Io.Dir.renameAbsolute(generated_path, committed_path, io_helper.getIo());

    const writer = @import("../../../packages/lockfile.zig");
    var committed = writer.readLockfile(allocator, committed_path) catch null;
    defer if (committed) |*lockfile| lockfile.deinit(allocator);
    var generated = writer.readLockfile(allocator, generated_path) catch null;
    defer if (generated) |*lockfile| lockfile.deinit(allocator);
    const matches = if (committed) |*existing|
        if (generated) |*candidate| writer.lockfilesEqual(existing, candidate) else false
    else
        false;
    if (!matches) {
        result.exit_code = 1;
        if (result.message) |message| allocator.free(message);
        result.message = null;
        result.message = try allocator.dupe(u8, "Error: lockfile is out of date (--frozen-lockfile)");
    }
}

test "companion exceptions fail the workspace install and preserve its committed lock" {
    const allocator = std.testing.allocator;
    var directory = std.testing.tmpDir(.{});
    defer directory.cleanup();
    try directory.dir.writeFile(io_helper.io, .{ .sub_path = "pantry.lock", .data = "committed complete lock" });
    try directory.dir.writeFile(io_helper.io, .{ .sub_path = "staged.lock", .data = "workspace only lock" });
    const cwd_path = try io_helper.getCwdAlloc(allocator);
    defer allocator.free(cwd_path);
    const root = try std.fs.path.join(allocator, &.{ cwd_path, ".zig-cache", "tmp", directory.sub_path[0..] });
    defer allocator.free(root);
    const staged = try std.fs.path.join(allocator, &.{ root, "staged.lock" });
    defer allocator.free(staged);
    var result = types.CommandResult{ .exit_code = 0 };
    defer result.deinit(allocator);
    try mergeCompanionResult(allocator, &result, error.InvalidDependencyFile, "deps.yaml");
    try std.testing.expectEqual(@as(u8, 1), result.exit_code);
    try std.testing.expectEqualStrings("Error installing deps.yaml: InvalidDependencyFile", result.message.?);
    try finalizeCombinedWorkspaceLock(allocator, root, staged, false, &result);
    const committed = try directory.dir.readFileAlloc(io_helper.io, "pantry.lock", allocator, .limited(1024));
    defer allocator.free(committed);
    try std.testing.expectEqualStrings("committed complete lock", committed);
}

test "successful companion workspace installs publish the complete staged lock" {
    const allocator = std.testing.allocator;
    var directory = std.testing.tmpDir(.{});
    defer directory.cleanup();
    try directory.dir.writeFile(io_helper.io, .{ .sub_path = "pantry.lock", .data = "previous complete lock" });
    try directory.dir.writeFile(io_helper.io, .{ .sub_path = "staged.lock", .data = "new complete lock" });
    const cwd_path = try io_helper.getCwdAlloc(allocator);
    defer allocator.free(cwd_path);
    const root = try std.fs.path.join(allocator, &.{ cwd_path, ".zig-cache", "tmp", directory.sub_path[0..] });
    defer allocator.free(root);
    const staged = try std.fs.path.join(allocator, &.{ root, "staged.lock" });
    defer allocator.free(staged);
    var result = types.CommandResult{ .exit_code = 0 };
    defer result.deinit(allocator);
    try mergeCompanionResult(allocator, &result, types.CommandResult{ .exit_code = 0 }, "deps.yaml");
    try finalizeCombinedWorkspaceLock(allocator, root, staged, false, &result);
    try std.testing.expectEqual(@as(u8, 0), result.exit_code);
    const committed = try directory.dir.readFileAlloc(io_helper.io, "pantry.lock", allocator, .limited(1024));
    defer allocator.free(committed);
    try std.testing.expectEqualStrings("new complete lock", committed);
    try std.testing.expectError(error.FileNotFound, directory.dir.access(io_helper.io, "staged.lock", .{}));
}

/// Install a companion deps file (e.g. deps.yaml) when a workspace manifest (package.json)
/// was already installed. Keeps system/runtime deps in sync for monorepos.
fn installCompanionDepsFile(
    allocator: std.mem.Allocator,
    df: @import("../../../deps/detector.zig").DepsFile,
    project_root: []const u8,
    options: types.InstallOptions,
    lockfile_path: ?[]const u8,
    frozen_environment: bool,
) !types.CommandResult {
    const parser = @import("../../../deps/parser.zig");
    const pipeline = @import("../../../install/pipeline.zig");

    const declared_deps = try parser.inferDependencies(allocator, df);
    defer {
        for (declared_deps) |*dep| {
            var owned_dep = dep.*;
            owned_dep.deinit(allocator);
        }
        allocator.free(declared_deps);
    }

    // Services the project's .env names, unless declared (#36). A non-null
    // Frozen installs infer only what the committed lock already records.
    // A staged path is also used by ordinary installs; it does not make their
    // environment inference frozen.
    const env_inferred = env_deps.infer(allocator, project_root, declared_deps, .{
        .frozen_lockfile = frozen_environment,
    }) catch &.{};
    defer env_deps.freeDeps(allocator, env_inferred);
    const deps = if (env_inferred.len == 0) declared_deps else try std.mem.concat(allocator, parser.PackageDependency, &.{ declared_deps, env_inferred });
    defer if (env_inferred.len > 0) allocator.free(deps);
    if (deps.len == 0) return .{ .exit_code = 0 };

    const proj_basename = std.fs.path.basename(project_root);

    var proj_hasher = std.crypto.hash.Md5.init(.{});
    proj_hasher.update(project_root);
    var proj_hash: [16]u8 = undefined;
    proj_hasher.final(&proj_hash);
    const proj_hash_short = try std.fmt.allocPrint(allocator, "{x:0>8}", .{std.mem.readInt(u32, proj_hash[0..4], .little)});
    defer allocator.free(proj_hash_short);

    var dep_hasher = std.crypto.hash.Md5.init(.{});
    dep_hasher.update(df.path);
    var dep_hash: [16]u8 = undefined;
    dep_hasher.final(&dep_hash);
    const dep_hash_hex = try string.hashToHex(dep_hash, allocator);
    defer allocator.free(dep_hash_hex);
    const dep_hash_short = try std.fmt.allocPrint(allocator, "d{s}", .{dep_hash_hex[0..8]});
    defer allocator.free(dep_hash_short);

    const data_dir = try lib.Paths.data(allocator);
    defer allocator.free(data_dir);

    const env_name = try std.fmt.allocPrint(allocator, "{s}_{s}-{s}", .{ proj_basename, proj_hash_short, dep_hash_short });
    defer allocator.free(env_name);

    const env_dir = try std.fs.path.join(allocator, &[_][]const u8{ data_dir, "envs", env_name });
    defer allocator.free(env_dir);

    try io_helper.makePath(env_dir);
    const bin_dir = try std.fmt.allocPrint(allocator, "{s}/bin", .{env_dir});
    defer allocator.free(bin_dir);
    try io_helper.makePath(bin_dir);

    style.printInstalling(deps.len);

    var pkg_cache = try cache.PackageCache.init(allocator);
    defer pkg_cache.deinit();

    var shared_installer = try install.Installer.init(allocator, &pkg_cache);
    allocator.free(shared_installer.data_dir);
    shared_installer.data_dir = try allocator.dupe(u8, env_dir);
    shared_installer.modules_dir = options.modules_dir;
    shared_installer.verbose = options.verbose;
    defer shared_installer.deinit();

    var pipeline_deps = try allocator.alloc(pipeline.PipelineDep, deps.len);
    defer allocator.free(pipeline_deps);
    for (deps, 0..) |dep, di| {
        const clean_name = helpers.resolvePackageAlias(helpers.normalizePackageName(dep.name));
        const is_domain = std.mem.indexOfScalar(u8, clean_name, '.') != null;
        pipeline_deps[di] = .{
            .name = clean_name,
            .version = dep.version,
            .source = if (is_domain) .pantry else switch (dep.source) {
                .registry => .npm,
                .pantry => .pantry,
                .npm => .npm,
                .github => .github,
                .git => .git,
                .url => .http,
            },
            .github_owner = if (dep.github_ref) |ref| ref.owner else null,
            .github_repo = if (dep.github_ref) |ref| ref.repo else null,
        };
    }

    var pipeline_result = try pipeline.run(allocator, &shared_installer, pipeline_deps, project_root, options.verbose);
    defer pipeline_result.deinit(allocator);

    var failed_count: usize = 0;
    for (pipeline_result.results) |result| {
        if (result.name.len == 0 or result.lock_only) continue;
        if (result.success) {
            style.printInstalled(result.name, result.version);
        } else {
            style.printFailed(result.name, result.version, result.error_msg);
            failed_count += 1;
        }
    }

    if (failed_count > 0) {
        return .{
            .exit_code = 1,
            .message = try std.fmt.allocPrint(allocator, "{d} system package(s) failed to install from {s}", .{ failed_count, std.fs.path.basename(df.path) }),
        };
    }

    // The workspace installer writes pantry.lock before this companion
    // deps.yaml pass. Merge the resolved system packages back into that same
    // lockfile so `pantry install` actually refreshes stale runtime pins while
    // preserving every workspace and npm entry.
    if (!options.no_save) {
        const lockfile_changed = try syncCompanionLockfile(
            allocator,
            project_root,
            deps,
            pipeline_result.results,
            options.frozen_lockfile,
            lockfile_path,
        );
        if (options.frozen_lockfile and lockfile_changed) {
            return .{
                .exit_code = 1,
                .message = try allocator.dupe(u8, "Error: lockfile is out of date (--frozen-lockfile)"),
            };
        }
    }

    return .{ .exit_code = 0 };
}

/// Merge packages installed from a workspace's companion deps file into the
/// comprehensive v2 lockfile. Returns true when the lockfile content changed.
fn syncCompanionLockfile(
    allocator: std.mem.Allocator,
    project_root: []const u8,
    deps: []const @import("../../../deps/parser.zig").PackageDependency,
    results: []const @import("../../../install/pipeline.zig").PackageResult,
    frozen: bool,
    lockfile_path_override: ?[]const u8,
) !bool {
    const lockfile_writer = @import("../../../packages/lockfile.zig");
    const owned_lockfile_path = if (lockfile_path_override == null)
        try std.fs.path.join(allocator, &.{ project_root, "pantry.lock" })
    else
        null;
    defer if (owned_lockfile_path) |path| allocator.free(path);
    const lockfile_path = lockfile_path_override orelse owned_lockfile_path.?;

    var original: ?lib.packages.Lockfile = lockfile_writer.readLockfile(allocator, lockfile_path) catch null;
    defer if (original) |*lockfile| lockfile.deinit(allocator);

    var lockfile = if (original != null)
        try lockfile_writer.readLockfile(allocator, lockfile_path)
    else
        try lib.packages.Lockfile.init(allocator, "1.0.0");
    defer lockfile.deinit(allocator);

    try mergeCompanionLockfileEntries(allocator, &lockfile, deps, results);

    const changed = if (original) |*existing|
        !lockfile_writer.lockfilesEqual(existing, &lockfile)
    else
        true;

    if (changed and !frozen) {
        style.printLockfileSaving();
        try lockfile_writer.writeLockfile(allocator, &lockfile, lockfile_path);
        style.printLockfileSaved();
    }

    return changed;
}

/// Update the in-memory lockfile while retaining unrelated workspace/package
/// data. Kept separate from disk I/O so the merge behavior is regression tested.
fn mergeCompanionLockfileEntries(
    allocator: std.mem.Allocator,
    lockfile: *lib.packages.Lockfile,
    deps: []const @import("../../../deps/parser.zig").PackageDependency,
    results: []const @import("../../../install/pipeline.zig").PackageResult,
) !void {
    // Packages whose resolved version depends on which platform installs them,
    // so the sweep below can tell a stale pin from another platform's.
    //
    // Seeded from `results` as well as the lockfile, and both halves are load
    // bearing. What the lockfile holds here is only what the workspace step
    // carried forward - the foreign pins themselves - and a foreign pin is a
    // leaf: nothing in that set declares the guard that makes it foreign. The
    // package that does declare it is the one this host just resolved, so it
    // arrives in `results` and nowhere else. Seeding from the lock alone left
    // `git-scm.org` out of the closure, which is the only package that says
    // `linux:gnu.org/gettext^0.21`, and gettext's Linux pin was then swept as
    // if it were stale.
    var foreign_seeds = std.ArrayList([]const u8).empty;
    defer foreign_seeds.deinit(allocator);
    {
        var seed_it = lockfile.packages.iterator();
        while (seed_it.next()) |entry| {
            if (entry.value_ptr.source == .pantry)
                try foreign_seeds.append(allocator, entry.value_ptr.name);
        }
        for (results) |result| {
            if (!result.success or result.name.len == 0) continue;
            const seed_name = helpers.resolvePackageAlias(helpers.normalizePackageName(result.name));
            if (std.mem.indexOfScalar(u8, seed_name, '.') == null) continue;
            try foreign_seeds.append(allocator, seed_name);
        }
    }
    var platform_pins = try @import("../../../install/pipeline.zig")
        .platformDependentClosure(allocator, foreign_seeds.items);
    defer platform_pins.deinit();

    // Record the requested constraints on the root workspace. This gives the
    // fast path a stable source-of-truth without discarding system deps declared
    // directly in package.json.
    if (lockfile.workspaces.getPtr("")) |root_workspace| {
        if (root_workspace.system == null)
            root_workspace.system = std.StringHashMap([]const u8).init(allocator);

        var system = &root_workspace.system.?;
        for (deps) |dep| {
            const clean_name = helpers.resolvePackageAlias(helpers.normalizePackageName(dep.name));
            if (std.mem.indexOfScalar(u8, clean_name, '.') == null) continue;

            const owned_version = try allocator.dupe(u8, dep.version);
            if (system.getPtr(clean_name)) |existing_version| {
                allocator.free(existing_version.*);
                existing_version.* = owned_version;
            } else {
                try system.put(try allocator.dupe(u8, clean_name), owned_version);
            }
        }
    }

    for (results) |result| {
        if (!result.success or result.name.len == 0) continue;
        const clean_name = helpers.resolvePackageAlias(helpers.normalizePackageName(result.name));

        // Replace every older pin for this package, regardless of its key's
        // version spelling (constraint or resolved version).
        var keys_to_remove = std.ArrayList([]const u8).empty;
        defer {
            for (keys_to_remove.items) |key| allocator.free(key);
            keys_to_remove.deinit(allocator);
        }

        var package_it = lockfile.packages.iterator();
        while (package_it.next()) |entry| {
            if (!std.mem.eql(u8, entry.value_ptr.name, clean_name)) continue;

            // Unless it is another platform's pin of the same package.
            //
            // Superseding an older pin is what this sweep is for. But two
            // platforms can legitimately need two versions: `git-scm.org`
            // declares `linux:gnu.org/gettext^0.21`, so gettext resolves to
            // 0.21.1 on Linux and to 1.0.0 on macOS, where that guard does not
            // apply and nothing else constrains it. Both are correct, the lock
            // keys by name@version so both fit, and removing by name alone
            // deleted whichever one the running host did not resolve - a lock
            // that cannot survive the trip to the other platform
            // (pantry-pm/pantry#231, #232).
            if (platform_pins.contains(entry.value_ptr.name) and !std.mem.eql(u8, entry.value_ptr.version, result.version)) continue;

            try keys_to_remove.append(allocator, try allocator.dupe(u8, entry.key_ptr.*));
        }

        for (keys_to_remove.items) |key| {
            if (lockfile.packages.fetchRemove(key)) |removed| {
                allocator.free(removed.key);
                var old_entry = removed.value;
                old_entry.deinit(allocator);
            }
        }

        const entry = lib.packages.LockfileEntry{
            .name = try allocator.dupe(u8, clean_name),
            .version = try allocator.dupe(u8, result.version),
            .source = if (std.mem.indexOfScalar(u8, clean_name, '.') != null) .pantry else .npm,
            .resolved = try std.fmt.allocPrint(allocator, "registry:{s}@{s}", .{ clean_name, result.version }),
        };
        const key = try std.fmt.allocPrint(allocator, "{s}@{s}", .{ clean_name, result.version });
        defer allocator.free(key);
        try lockfile.addEntry(allocator, key, entry);
    }
}

test "depDomainFromSpec keeps the version constraint its parent declares" {
    const t = std.testing;

    // A package links the library it was built against, so the closure must
    // install the declared version — resolving these to `latest` gave node v26
    // icu 78 / openssl 3.6 instead of the v73 / v1.1 it links, and node then
    // died on startup with a dyld "Library not loaded" error.
    const icu = depDomainFromSpec("unicode.org^73 # v25").?;
    try t.expectEqualStrings("unicode.org", icu.domain);
    try t.expectEqualStrings("^73", icu.constraint);

    // `@1.1` is the catalog's exact-pin spelling; the `@` is dropped so the
    // spec round-trips through the installer's `name@version` parsing.
    const ssl = depDomainFromSpec("openssl.org@1.1").?;
    try t.expectEqualStrings("openssl.org", ssl.domain);
    try t.expectEqualStrings("1.1", ssl.constraint);

    // An unconstrained dep stays unconstrained (resolves to latest).
    const pnpm = depDomainFromSpec("pnpm.io").?;
    try t.expectEqualStrings("pnpm.io", pnpm.domain);
    try t.expectEqualStrings("", pnpm.constraint);

    try t.expectEqualStrings(">=2.7", depDomainFromSpec("python.org>=2.7").?.constraint);
    try t.expectEqualStrings("~23.3", depDomainFromSpec("nodejs.org~23.3").?.constraint);

    // Platform-tagged pseudo-domains are not installable packages.
    try t.expect(depDomainFromSpec("darwin/x86-64") == null);
}

test "frozen resolution locks accept only the current resolved package" {
    const t = std.testing;
    const allocator = t.allocator;

    var lockfile = lib.deps.resolution.LockFile.init(allocator);
    defer lockfile.deinit();

    try lockfile.addPackage("bun.sh", "1.3.14", "registry:bun.sh@1.3.14", null);

    try t.expect(resolutionLockMatches(
        &lockfile,
        "bun.sh",
        "1.3.14",
        "registry:bun.sh@1.3.14",
    ));
    try t.expect(!resolutionLockMatches(
        &lockfile,
        "bun.sh",
        "1.3.15",
        "registry:bun.sh@1.3.15",
    ));
    try t.expect(!resolutionLockMatches(
        &lockfile,
        "nodejs.org",
        "24.0.0",
        "registry:nodejs.org@24.0.0",
    ));
}

test "companion deps replace stale system pins without dropping workspace packages" {
    const t = std.testing;
    const allocator = t.allocator;
    const parser = @import("../../../deps/parser.zig");
    const pipeline = @import("../../../install/pipeline.zig");

    var lockfile = try lib.packages.Lockfile.init(allocator, "1.0.0");
    defer lockfile.deinit(allocator);

    try lockfile.addWorkspace(allocator, "", .{
        .name = try allocator.dupe(u8, "fixture"),
        .system = blk: {
            var system = std.StringHashMap([]const u8).init(allocator);
            try system.put(try allocator.dupe(u8, "bun.sh"), try allocator.dupe(u8, "^1.3.4"));
            break :blk system;
        },
    });
    try lockfile.addWorkspace(allocator, "packages/ui", .{
        .name = try allocator.dupe(u8, "@fixture/ui"),
    });
    try lockfile.addEntry(allocator, "bun.sh@^1.3.4", .{
        .name = try allocator.dupe(u8, "bun.sh"),
        .version = try allocator.dupe(u8, "^1.3.4"),
        .source = .pantry,
    });
    try lockfile.addEntry(allocator, "lit@3.3.1", .{
        .name = try allocator.dupe(u8, "lit"),
        .version = try allocator.dupe(u8, "3.3.1"),
        .source = .npm,
    });

    const deps = [_]parser.PackageDependency{.{
        .name = "bun.sh",
        .version = "^1.3.14",
    }};
    const results = [_]pipeline.PackageResult{.{
        .name = "bun.sh",
        .version = "1.3.14",
        .success = true,
    }};

    try mergeCompanionLockfileEntries(allocator, &lockfile, &deps, &results);

    try t.expectEqualStrings("^1.3.14", lockfile.workspaces.get("").?.system.?.get("bun.sh").?);
    try t.expect(lockfile.packages.get("bun.sh@^1.3.4") == null);
    try t.expectEqualStrings("1.3.14", lockfile.packages.get("bun.sh@1.3.14").?.version);
    try t.expect(lockfile.packages.get("lit@3.3.1") != null);
    try t.expect(lockfile.workspaces.get("packages/ui") != null);
}

test "a manifest install fails when a package it asked for did not arrive" {
    // The bug this pins: this path returned 0 unconditionally while every other
    // install path returned 1, so `pantry install` printed "1 package(s) failed
    // to install" in red and told its caller everything was fine. Scripts
    // shaped like `pantry install && build` then built without the dependency.
    try std.testing.expectEqual(@as(u8, 1), manifestExitCode(1));
    try std.testing.expectEqual(@as(u8, 1), manifestExitCode(9));
}

test "and succeeds when nothing failed" {
    // Including the two cases that are not installs at all: everything already
    // present, and a manifest with no dependencies. Both count zero failures.
    try std.testing.expectEqual(@as(u8, 0), manifestExitCode(0));
}

test "isExactVersion separates a pin from a range" {
    const t = std.testing;

    // Exact: these skip the Pantry registry, which would answer with whatever
    // version it holds rather than the one asked for.
    try t.expect(isExactVersion("1.2.0"));
    try t.expect(isExactVersion("0.72.34"));
    try t.expect(isExactVersion("9.2.0-rc1"));

    // Ranges and tags are not pins. Routing one to npm looks the string up as a
    // key in `versions`, where `^1.2.0` is not, so the install fails outright -
    // which is how a caret range stopped installing in 0.11.37.
    try t.expect(!isExactVersion("^1.2.0"));
    try t.expect(!isExactVersion("~1.3"));
    try t.expect(!isExactVersion(">=1.2.0"));
    try t.expect(!isExactVersion("1.x"));
    try t.expect(!isExactVersion("1.2.0 || 1.3.0"));
    try t.expect(!isExactVersion("*"));
    try t.expect(!isExactVersion("latest"));
    try t.expect(!isExactVersion(""));
}
