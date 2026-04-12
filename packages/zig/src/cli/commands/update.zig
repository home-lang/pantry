const std = @import("std");
const io_helper = @import("../../io_helper.zig");
const common = @import("common.zig");
const lib = @import("../../lib.zig");
const style = @import("../style.zig");
const aliases = @import("../../packages/aliases.zig");
const parser = @import("../../deps/parser.zig");

const CommandResult = common.CommandResult;

/// File-local pointer to the active run's metadata cache. Set at the top of
/// `execute` and cleared at the bottom; `updatePackage` / `updateSystemPackage`
/// consult this before falling back to a direct HTTP fetch. This keeps the
/// existing function signatures stable while letting us serve cached bodies.
var g_metadata_cache: ?*MetadataCache = null;

fn cachedHttpGet(allocator: std.mem.Allocator, url: []const u8) ![]u8 {
    if (g_metadata_cache) |cache| {
        if (cache.getOrFetch(url)) |body| return body;
    }
    return io_helper.httpGet(allocator, url);
}

/// Thread-safe URL → body cache used by `pantry update` to avoid refetching the
/// same registry metadata multiple times in a single run and to let a parallel
/// prefetch phase populate all URLs concurrently before the serial update loop.
pub const MetadataCache = struct {
    map: std.StringHashMap([]const u8),
    mutex: io_helper.Mutex,
    alloc: std.mem.Allocator,

    pub fn init(alloc: std.mem.Allocator) MetadataCache {
        return .{
            .map = std.StringHashMap([]const u8).init(alloc),
            .mutex = .{},
            .alloc = alloc,
        };
    }

    pub fn deinit(self: *MetadataCache) void {
        var it = self.map.iterator();
        while (it.next()) |entry| {
            self.alloc.free(entry.key_ptr.*);
            self.alloc.free(entry.value_ptr.*);
        }
        self.map.deinit();
    }

    /// Atomic get-or-fetch. If URL is cached, returns a caller-owned copy of the
    /// cached body. Otherwise fetches it, stores it, and returns a copy.
    pub fn getOrFetch(self: *MetadataCache, url: []const u8) ?[]u8 {
        self.mutex.lock();
        if (self.map.get(url)) |cached| {
            const copy = self.alloc.dupe(u8, cached) catch {
                self.mutex.unlock();
                return null;
            };
            self.mutex.unlock();
            return copy;
        }
        self.mutex.unlock();

        const body = io_helper.httpGet(self.alloc, url) catch return null;
        // Insert (race tolerated — last writer wins for cache; we still return
        // the body we just fetched).
        self.mutex.lock();
        defer self.mutex.unlock();
        const owned_key = self.alloc.dupe(u8, url) catch return body;
        const owned_val = self.alloc.dupe(u8, body) catch {
            self.alloc.free(owned_key);
            return body;
        };
        if (self.map.fetchPut(owned_key, owned_val) catch null) |prev| {
            // Someone raced us — free the old value.
            self.alloc.free(prev.key);
            self.alloc.free(prev.value);
        }
        return body;
    }
};

/// Shared context for a `pantry update` invocation. Passed into updatePackage /
/// updateSystemPackage so they can hit the cache instead of firing HTTP per-call.
pub const UpdateContext = struct {
    metadata: *MetadataCache,
};

/// Worker context for parallel metadata prefetch.
const PrefetchCtx = struct {
    cache: *MetadataCache,
    urls: []const []const u8,
    next: *std.atomic.Value(usize),

    fn worker(ctx: *PrefetchCtx) void {
        while (true) {
            const i = ctx.next.fetchAdd(1, .monotonic);
            if (i >= ctx.urls.len) break;
            if (ctx.cache.getOrFetch(ctx.urls[i])) |body| {
                ctx.cache.alloc.free(body);
            }
        }
    }
};

/// Fan out HTTP fetches for all URLs in `urls` across a bounded thread pool
/// (at most 8 threads to keep registry courteous). Results land in `cache`.
pub fn prefetchMetadata(
    allocator: std.mem.Allocator,
    cache: *MetadataCache,
    urls: []const []const u8,
) void {
    if (urls.len == 0) return;
    if (urls.len == 1) {
        if (cache.getOrFetch(urls[0])) |b| cache.alloc.free(b);
        return;
    }

    const cpu_count = std.Thread.getCpuCount() catch 4;
    const thread_count = @min(urls.len, @min(cpu_count, 8));

    var next = std.atomic.Value(usize).init(0);
    var ctx = PrefetchCtx{ .cache = cache, .urls = urls, .next = &next };

    if (thread_count <= 1) {
        ctx.worker();
        return;
    }

    const spawned = thread_count - 1;
    const threads = allocator.alloc(?std.Thread, spawned) catch {
        ctx.worker();
        return;
    };
    defer allocator.free(threads);
    for (threads) |*t| t.* = null;

    for (0..spawned) |t| {
        threads[t] = std.Thread.spawn(.{}, PrefetchCtx.worker, .{&ctx}) catch null;
    }
    ctx.worker();
    for (threads) |*t| {
        if (t.*) |th| {
            th.join();
            t.* = null;
        }
    }
}

test "MetadataCache dedupes fetches" {
    const allocator = std.testing.allocator;
    var cache = MetadataCache.init(allocator);
    defer cache.deinit();

    // Seed manually to avoid hitting the network in tests.
    const url = "https://example.test/body";
    const key = try allocator.dupe(u8, url);
    const body = try allocator.dupe(u8, "cached-body");
    try cache.map.put(key, body);

    const first = cache.getOrFetch(url) orelse return error.TestFetchFailed;
    defer allocator.free(first);
    try std.testing.expectEqualStrings("cached-body", first);
}

/// Dependency kind for version resolution
const DepKind = enum {
    npm, // npm registry package
    system, // Pantry system package (domain-style or aliased short name)
    skip, // link:, workspace:*, local path — nothing to update
};

/// Classify a dependency by its name and version to determine how to resolve updates.
fn classifyDep(name: []const u8, version: []const u8) DepKind {
    // link: and workspace: are local — skip
    if (std.mem.startsWith(u8, version, "link:")) return .skip;
    if (std.mem.startsWith(u8, version, "workspace:")) return .skip;
    // Local paths
    if (std.mem.startsWith(u8, version, "~") or std.mem.startsWith(u8, version, "/") or std.mem.startsWith(u8, version, ".")) return .skip;
    // Explicit npm prefix
    if (std.mem.startsWith(u8, name, "npm:")) return .npm;
    // auto: prefix means "try pantry registry first, then npm" — classify by the underlying name
    if (std.mem.startsWith(u8, name, "auto:")) {
        const inner = name[5..];
        if (std.mem.indexOf(u8, inner, ".") != null) return .system;
        if (aliases.resolvealias(inner) != null) return .system;
        return .npm;
    }
    // Scoped npm packages
    if (std.mem.startsWith(u8, name, "@")) return .npm;
    // Domain-style names (contain a dot) → system/pantry package
    if (std.mem.indexOf(u8, name, ".") != null) return .system;
    // Short names that have an alias (e.g., "bun" → "bun.sh") → system
    if (aliases.resolvealias(name) != null) return .system;
    // Everything else is assumed to be npm
    return .npm;
}

/// Resolve the domain name for a system dependency (alias resolution)
fn resolveSystemDomain(name: []const u8) []const u8 {
    // Strip auto: prefix if present
    const clean = if (std.mem.startsWith(u8, name, "auto:")) name[5..] else name;
    // If already a domain (has .), use as-is
    if (std.mem.indexOf(u8, clean, ".") != null) return clean;
    // Try alias resolution
    return aliases.resolvealias(clean) orelse clean;
}

/// Update packages to latest versions
pub fn execute(allocator: std.mem.Allocator, args: []const []const u8) !CommandResult {
    // Parse flags
    var update_specific: ?[]const u8 = null;
    var dry_run = false;
    var latest = false;

    var i: usize = 0;
    while (i < args.len) : (i += 1) {
        const arg = args[i];
        if (std.mem.eql(u8, arg, "--all")) {
            // Accepted for backwards compat but is now the default
        } else if (std.mem.eql(u8, arg, "--dry-run")) {
            dry_run = true;
        } else if (std.mem.eql(u8, arg, "--latest")) {
            latest = true;
        } else if (std.mem.eql(u8, arg, "--force") or std.mem.eql(u8, arg, "-f")) {
            latest = true; // --force implies fetching latest
        } else if (!std.mem.startsWith(u8, arg, "-")) {
            update_specific = arg;
        }
    }

    // Find dependency file
    const cwd = try io_helper.getCwdAlloc(allocator);
    defer allocator.free(cwd);

    // Collect all deps from root + workspace members
    const deps = try collectAllDeps(allocator, cwd);
    defer {
        for (deps) |*dep| {
            var d = dep.*;
            d.deinit(allocator);
        }
        allocator.free(deps);
    }

    if (deps.len == 0) {
        // Distinguish "no deps file at all" from "deps file is empty". The former
        // almost always means the user ran `pantry update` in the wrong directory
        // and deserves a real error, not the cheerful-sounding success message.
        const detector = @import("../../deps/detector.zig");
        const has_deps_file = blk: {
            const f = detector.findDepsFile(allocator, cwd) catch break :blk false;
            if (f) |found| {
                allocator.free(found.path);
                break :blk true;
            }
            break :blk false;
        };
        const has_pkg_json = blk: {
            const p = std.fmt.allocPrint(allocator, "{s}/package.json", .{cwd}) catch break :blk false;
            defer allocator.free(p);
            io_helper.accessAbsolute(p, .{}) catch break :blk false;
            break :blk true;
        };
        if (!has_deps_file and !has_pkg_json) {
            const msg = try std.fmt.allocPrint(
                allocator,
                "No dependency file found in {s}.\n" ++
                    "    Expected one of: pantry.jsonc, pantry.json, deps.yaml, dependencies.yaml, package.json, pyproject.toml, Cargo.toml, go.mod.\n" ++
                    "    Are you running `pantry update` from the right directory?",
                .{cwd},
            );
            return CommandResult.err(allocator, msg);
        }
        return CommandResult.success(allocator, "No dependencies found (deps file present but empty)");
    }

    if (dry_run) {
        style.print("Dry run mode - no changes will be made\n\n", .{});
    }

    // Shared metadata cache + parallel prefetch: before we enter the serial
    // version-check loop below, fan out HTTP requests for every package we're
    // about to examine. Subsequent lookups hit the in-memory cache so the
    // update loop runs at CPU/parse speed rather than network latency * N.
    var metadata_cache = MetadataCache.init(allocator);
    defer metadata_cache.deinit();
    g_metadata_cache = &metadata_cache;
    defer g_metadata_cache = null;

    // Build URL list for prefetch
    var prefetch_urls = std.ArrayList([]u8).empty;
    defer {
        for (prefetch_urls.items) |u| allocator.free(u);
        prefetch_urls.deinit(allocator);
    }
    for (deps) |dep| {
        const kind = classifyDep(dep.name, dep.version);
        if (kind == .skip) continue;
        if (update_specific) |name| {
            if (!std.mem.eql(u8, dep.name, name)) continue;
        }
        const url = switch (kind) {
            .skip => continue,
            .npm => blk: {
                const clean_name = if (std.mem.startsWith(u8, dep.name, "auto:"))
                    dep.name[5..]
                else if (std.mem.startsWith(u8, dep.name, "npm:"))
                    dep.name[4..]
                else
                    dep.name;
                break :blk std.fmt.allocPrint(allocator, "https://registry.npmjs.org/{s}", .{clean_name}) catch continue;
            },
            .system => blk: {
                const domain = resolveSystemDomain(dep.name);
                break :blk std.fmt.allocPrint(
                    allocator,
                    "https://pantry-registry.s3.amazonaws.com/binaries/{s}/metadata.json",
                    .{domain},
                ) catch continue;
            },
        };
        prefetch_urls.append(allocator, url) catch {
            allocator.free(url);
            continue;
        };
    }
    if (prefetch_urls.items.len > 0) {
        // Convert to const slices for the prefetch API. On allocation failure we
        // just skip prefetch (the serial loop will still work, just slower).
        if (allocator.alloc([]const u8, prefetch_urls.items.len)) |const_urls| {
            defer allocator.free(const_urls);
            for (prefetch_urls.items, 0..) |u, idx| const_urls[idx] = u;
            prefetchMetadata(allocator, &metadata_cache, const_urls);
        } else |_| {}
    }

    var updates_made: usize = 0;
    var errors_encountered: usize = 0;

    if (update_specific) |pkg_name| {
        // Update specific package
        style.print("Updating {s}...\n", .{pkg_name});

        // Find the package in deps
        var found_dep: ?parser.PackageDependency = null;
        for (deps) |dep| {
            if (std.mem.eql(u8, dep.name, pkg_name)) {
                found_dep = dep;
                break;
            }
        }

        if (found_dep) |dep| {
            const kind = classifyDep(dep.name, dep.version);
            if (kind == .skip) {
                style.print("{s} is a local/linked dependency, skipping\n", .{pkg_name});
                return CommandResult.success(allocator, null);
            }

            var result = updatePackage(allocator, dep.name, dep.version, dry_run, latest, kind) catch |err| {
                style.print("Failed to check {s}: {}\n", .{ pkg_name, err });
                errors_encountered += 1;
                return CommandResult.err(allocator, "Failed to check package for updates");
            };
            defer result.deinit(allocator);

            if (result.has_update) {
                updates_made += 1;
                if (result.new_version) |new_ver| {
                    style.print("Updated {s}: {s} -> {s}\n", .{ pkg_name, result.current_version, new_ver });
                }
            } else {
                style.print("{s} is already up to date ({s})\n", .{ pkg_name, result.current_version });
            }
        } else {
            return CommandResult.err(allocator, "Package not found in dependencies");
        }
    } else {
        // Default: update all packages (matching bun behavior)
        style.print("Updating all packages...\n\n", .{});

        for (deps) |dep| {
            const kind = classifyDep(dep.name, dep.version);
            if (kind == .skip) continue;

            style.print("Checking {s}... ", .{dep.name});

            var result = updatePackage(allocator, dep.name, dep.version, dry_run, latest, kind) catch |err| {
                style.print("Error: {}\n", .{err});
                errors_encountered += 1;
                continue;
            };
            defer result.deinit(allocator);

            if (result.has_update) {
                updates_made += 1;
                if (result.new_version) |new_ver| {
                    style.print("{s} -> {s}\n", .{ result.current_version, new_ver });
                }
            } else {
                style.print("Up to date ({s})\n", .{result.current_version});
            }
        }
    }

    style.print("\n", .{});

    if (dry_run) {
        const message = try std.fmt.allocPrint(
            allocator,
            "Dry run complete: {d} package{s} would be updated",
            .{ updates_made, if (updates_made == 1) "" else "s" },
        );
        return CommandResult{
            .exit_code = 0,
            .message = message,
        };
    }

    if (updates_made > 0) {
        // Auto-run install to apply updates (like bun update does)
        style.print("Installing updated packages...\n", .{});
        const install_mod = @import("install.zig");
        const install_opts = install_mod.InstallOptions{
            .force = true,
        };
        const install_result = try install_mod.installCommandWithOptions(allocator, &[_][]const u8{}, install_opts);
        if (install_result.message) |msg| {
            allocator.free(msg);
        }

        const message = try std.fmt.allocPrint(
            allocator,
            "Updated {d} package{s}",
            .{ updates_made, if (updates_made == 1) "" else "s" },
        );
        return CommandResult{
            .exit_code = if (errors_encountered > 0) 1 else 0,
            .message = message,
        };
    } else {
        return CommandResult.success(allocator, "All packages are already up to date");
    }
}

/// Update result containing version info
const UpdateResult = struct {
    has_update: bool,
    new_version: ?[]const u8,
    current_version: []const u8,

    pub fn deinit(self: *UpdateResult, allocator: std.mem.Allocator) void {
        if (self.new_version) |v| allocator.free(v);
    }
};

/// Strip semver prefix (^, ~, >=, etc.)
fn stripPrefix(version: []const u8) []const u8 {
    if (version.len == 0) return version;
    if (version[0] == '^' or version[0] == '~') return version[1..];
    if (std.mem.startsWith(u8, version, ">=") or std.mem.startsWith(u8, version, "<=")) return version[2..];
    if (version[0] == '>' or version[0] == '<') return version[1..];
    return version;
}

const no_update = UpdateResult{ .has_update = false, .new_version = null, .current_version = "" };

/// Update a single package by querying the appropriate registry
fn updatePackage(
    allocator: std.mem.Allocator,
    package_name: []const u8,
    current_version: []const u8,
    dry_run: bool,
    use_latest: bool,
    kind: DepKind,
) !UpdateResult {
    const outdated_mod = @import("outdated.zig");
    const installed_version = stripPrefix(current_version);
    const constraint = if (use_latest) "*" else current_version;

    switch (kind) {
        .skip => return no_update,
        .system => return updateSystemPackage(allocator, package_name, installed_version, constraint, dry_run, use_latest),
        .npm => {
            // Strip auto: prefix for npm lookup
            const clean_name = if (std.mem.startsWith(u8, package_name, "auto:"))
                package_name[5..]
            else if (std.mem.startsWith(u8, package_name, "npm:"))
                package_name[4..]
            else
                package_name;

            const url = try std.fmt.allocPrint(allocator, "https://registry.npmjs.org/{s}", .{clean_name});
            defer allocator.free(url);

            const body = cachedHttpGet(allocator, url) catch {
                return UpdateResult{ .has_update = false, .new_version = null, .current_version = installed_version };
            };
            defer allocator.free(body);
            if (body.len == 0) return UpdateResult{ .has_update = false, .new_version = null, .current_version = installed_version };

            const parsed = std.json.parseFromSlice(std.json.Value, allocator, body, .{}) catch {
                return UpdateResult{ .has_update = false, .new_version = null, .current_version = installed_version };
            };
            defer parsed.deinit();
            if (parsed.value != .object) return UpdateResult{ .has_update = false, .new_version = null, .current_version = installed_version };

            // Get dist-tags.latest
            const latest_version = blk: {
                const dist_tags = parsed.value.object.get("dist-tags") orelse break :blk null;
                if (dist_tags != .object) break :blk null;
                const latest_val = dist_tags.object.get("latest") orelse break :blk null;
                if (latest_val != .string) break :blk null;
                break :blk latest_val.string;
            } orelse return UpdateResult{ .has_update = false, .new_version = null, .current_version = installed_version };

            // Determine the target version
            const target_version = if (use_latest or std.mem.eql(u8, constraint, "*"))
                latest_version
            else blk: {
                const versions_obj = parsed.value.object.get("versions") orelse break :blk latest_version;
                if (versions_obj != .object) break :blk latest_version;
                var best: ?[]const u8 = null;
                var ver_iter = versions_obj.object.iterator();
                while (ver_iter.next()) |entry| {
                    const ver = entry.key_ptr.*;
                    if (outdated_mod.satisfiesConstraint(ver, constraint)) {
                        if (best == null or outdated_mod.compareVersions(ver, best.?) == .gt) {
                            best = ver;
                        }
                    }
                }
                break :blk best orelse latest_version;
            };

            if (std.mem.eql(u8, installed_version, target_version)) {
                return UpdateResult{ .has_update = false, .new_version = null, .current_version = installed_version };
            }
            if (outdated_mod.compareVersions(target_version, installed_version) != .gt) {
                return UpdateResult{ .has_update = false, .new_version = null, .current_version = installed_version };
            }

            const new_version = try allocator.dupe(u8, target_version);
            if (!dry_run) {
                updateConfigFile(allocator, package_name, new_version) catch |err| {
                    style.print("Warning: Failed to update config for {s}: {}\n", .{ package_name, err });
                };
            }
            return UpdateResult{ .has_update = true, .new_version = new_version, .current_version = installed_version };
        },
    }
}

/// Update a system/pantry package by querying the S3 metadata registry
fn updateSystemPackage(
    allocator: std.mem.Allocator,
    package_name: []const u8,
    installed_version: []const u8,
    constraint: []const u8,
    dry_run: bool,
    use_latest: bool,
) !UpdateResult {
    const outdated_mod = @import("outdated.zig");
    const domain = resolveSystemDomain(package_name);

    // Query S3 metadata for this domain
    const metadata_url = try std.fmt.allocPrint(
        allocator,
        "https://pantry-registry.s3.amazonaws.com/binaries/{s}/metadata.json",
        .{domain},
    );
    defer allocator.free(metadata_url);

    const body = cachedHttpGet(allocator, metadata_url) catch {
        return UpdateResult{ .has_update = false, .new_version = null, .current_version = installed_version };
    };
    defer allocator.free(body);
    if (body.len == 0) return UpdateResult{ .has_update = false, .new_version = null, .current_version = installed_version };

    const parsed = std.json.parseFromSlice(std.json.Value, allocator, body, .{}) catch {
        return UpdateResult{ .has_update = false, .new_version = null, .current_version = installed_version };
    };
    defer parsed.deinit();
    if (parsed.value != .object) return UpdateResult{ .has_update = false, .new_version = null, .current_version = installed_version };

    const versions_obj = parsed.value.object.get("versions") orelse {
        return UpdateResult{ .has_update = false, .new_version = null, .current_version = installed_version };
    };
    if (versions_obj != .object) return UpdateResult{ .has_update = false, .new_version = null, .current_version = installed_version };

    // Find best matching version
    var best: ?[]const u8 = null;
    var ver_iter = versions_obj.object.iterator();
    while (ver_iter.next()) |entry| {
        const ver = entry.key_ptr.*;
        if (use_latest or std.mem.eql(u8, constraint, "*") or outdated_mod.satisfiesConstraint(ver, constraint)) {
            if (best == null or outdated_mod.compareVersions(ver, best.?) == .gt) {
                best = ver;
            }
        }
    }

    const target_version = best orelse return UpdateResult{ .has_update = false, .new_version = null, .current_version = installed_version };

    if (std.mem.eql(u8, installed_version, target_version)) {
        return UpdateResult{ .has_update = false, .new_version = null, .current_version = installed_version };
    }
    if (outdated_mod.compareVersions(target_version, installed_version) != .gt) {
        return UpdateResult{ .has_update = false, .new_version = null, .current_version = installed_version };
    }

    const new_version = try allocator.dupe(u8, target_version);
    if (!dry_run) {
        updateConfigFile(allocator, package_name, new_version) catch |err| {
            style.print("Warning: Failed to update config for {s}: {}\n", .{ package_name, err });
        };
    }
    return UpdateResult{ .has_update = true, .new_version = new_version, .current_version = installed_version };
}

/// Update pantry.json/pantry.jsonc/package.json with new version
fn updateConfigFile(
    allocator: std.mem.Allocator,
    package_name: []const u8,
    new_version: []const u8,
) !void {
    const config_files = [_][]const u8{ "pantry.jsonc", "pantry.json", "package.json" };
    for (config_files) |config_path| {
        const content = io_helper.readFileAlloc(allocator, config_path, 10 * 1024 * 1024) catch continue;
        defer allocator.free(content);

        const updated = try updateJsonContent(allocator, content, package_name, new_version);
        defer allocator.free(updated);

        // Write back by creating/overwriting the file
        const file = io_helper.createFile(config_path, .{}) catch continue;
        defer file.close(io_helper.io);
        io_helper.writeAllToFile(file, updated) catch continue;
        return;
    }
    return error.ConfigNotFound;
}

/// Collect all dependencies from root config and all workspace member package.json files.
/// Deduplicates by package name (keeps the first seen version).
pub fn collectAllDeps(allocator: std.mem.Allocator, cwd: []const u8) ![]parser.PackageDependency {
    const detector = @import("../../deps/detector.zig");

    var all_deps = std.ArrayList(parser.PackageDependency).empty;
    defer all_deps.deinit(allocator);

    var seen = std.StringHashMap(void).init(allocator);
    defer {
        var iter = seen.iterator();
        while (iter.next()) |entry| allocator.free(entry.key_ptr.*);
        seen.deinit();
    }

    // Helper to add deps if not already seen
    const addDeps = struct {
        fn call(
            a: std.mem.Allocator,
            list: *std.ArrayList(parser.PackageDependency),
            s: *std.StringHashMap(void),
            deps: []const parser.PackageDependency,
        ) !void {
            for (deps) |dep| {
                if (std.mem.startsWith(u8, dep.version, "workspace:")) continue;
                if (s.contains(dep.name)) continue;
                try s.put(try a.dupe(u8, dep.name), {});
                try list.append(a, try dep.clone(a));
            }
        }
    }.call;

    // 1) Root deps (try deps file, fall back to package.json)
    if (try detector.findDepsFile(allocator, cwd)) |deps_file| {
        defer allocator.free(deps_file.path);
        const root_deps = parser.inferDependencies(allocator, deps_file) catch |err| blk: {
            if (err == error.NoRuntimeAvailable) {
                // TS config failed - fall through to package.json below
                break :blk null;
            }
            return err;
        };
        if (root_deps) |deps| {
            defer allocator.free(deps);
            try addDeps(allocator, &all_deps, &seen, deps);
        }
    }

    // 2) Always parse root package.json for deps + workspace discovery
    const pkg_json_path = try std.fmt.allocPrint(allocator, "{s}/package.json", .{cwd});
    defer allocator.free(pkg_json_path);

    const pkg_content = io_helper.readFileAlloc(allocator, pkg_json_path, 10 * 1024 * 1024) catch null;
    if (pkg_content) |content| {
        defer allocator.free(content);

        // Parse root package.json deps (if not already added from a pantry config)
        {
            const pkg_file = detector.DepsFile{ .path = pkg_json_path, .format = .package_json };
            if (parser.inferDependencies(allocator, pkg_file)) |deps| {
                defer allocator.free(deps);
                try addDeps(allocator, &all_deps, &seen, deps);
            } else |_| {}
        }

        // Extract workspace patterns and scan member package.json files
        const parsed = std.json.parseFromSlice(std.json.Value, allocator, content, .{}) catch null;
        if (parsed) |p| {
            defer p.deinit();
            if (p.value == .object) {
                if (p.value.object.get("workspaces")) |ws_val| {
                    if (ws_val == .array) {
                        for (ws_val.array.items) |item| {
                            if (item != .string) continue;
                            const pattern = item.string;
                            // Skip negation patterns
                            if (pattern.len > 0 and pattern[0] == '!') continue;

                            // Resolve glob-like workspace patterns to find member dirs
                            try scanWorkspaceMembers(allocator, cwd, pattern, &all_deps, &seen);
                        }
                    }
                }
            }
        }
    }

    return try allocator.dupe(parser.PackageDependency, all_deps.items);
}

/// Scan workspace members matching a glob pattern and collect their deps.
/// Supports:
///   - plain paths:       "packages/core"
///   - one-level globs:   "packages/*"
///   - recursive globs:   "apps/**", "apps/**/*"   (walks the whole subtree)
///
/// For `**` patterns the walker descends the full tree (bounded by
/// `max_recursion_depth`), stopping at node_modules / .git / dist.
fn scanWorkspaceMembers(
    allocator: std.mem.Allocator,
    workspace_root: []const u8,
    pattern: []const u8,
    all_deps: *std.ArrayList(parser.PackageDependency),
    seen: *std.StringHashMap(void),
) !void {
    // Resolve the pattern to a base directory (everything before any `*`)
    const star_pos = std.mem.indexOf(u8, pattern, "*");
    const base_rel = if (star_pos) |pos| blk: {
        var last_slash: usize = 0;
        for (pattern[0..pos], 0..) |c, i| {
            if (c == '/') last_slash = i + 1;
        }
        break :blk if (last_slash > 0) pattern[0 .. last_slash - 1] else ".";
    } else pattern;

    const is_recursive = star_pos != null and
        star_pos.? + 1 < pattern.len and pattern[star_pos.? + 1] == '*';

    const base_dir = try std.fmt.allocPrint(allocator, "{s}/{s}", .{ workspace_root, base_rel });
    defer allocator.free(base_dir);

    if (is_recursive) {
        try walkRecursivelyForPackageJson(allocator, base_dir, 0, all_deps, seen);
        return;
    }

    // Non-recursive: open the base dir and pick up immediate subdirs only.
    var dir = io_helper.cwd().openDir(io_helper.io, base_dir, .{ .iterate = true }) catch return;
    defer dir.close(io_helper.io);

    var iter = dir.iterate();
    while (try iter.next(io_helper.io)) |entry| {
        if (entry.kind != .directory) continue;
        if (skipWorkspaceDir(entry.name)) continue;
        try scanMemberDir(allocator, base_dir, entry.name, all_deps, seen);
    }
}

/// Maximum directory recursion depth for `**` glob expansion.
/// 12 is deep enough for every real-world monorepo we've seen while still
/// bounding runtime on pathological trees (symlink loops are defended against
/// by `skipWorkspaceDir` + our walker ignoring non-directory entries).
const max_recursion_depth: u8 = 12;

fn skipWorkspaceDir(name: []const u8) bool {
    if (name.len == 0) return true;
    if (name[0] == '.') return true;
    if (std.mem.eql(u8, name, "node_modules")) return true;
    if (std.mem.eql(u8, name, "dist")) return true;
    if (std.mem.eql(u8, name, "build")) return true;
    if (std.mem.eql(u8, name, "target")) return true;
    if (std.mem.eql(u8, name, "vendor")) return true;
    return false;
}

/// Depth-first walk under `dir` collecting deps from every `package.json` we find.
/// The walker prunes common junk directories and never follows symlinks.
fn walkRecursivelyForPackageJson(
    allocator: std.mem.Allocator,
    dir_path: []const u8,
    depth: u8,
    all_deps: *std.ArrayList(parser.PackageDependency),
    seen: *std.StringHashMap(void),
) !void {
    if (depth > max_recursion_depth) return;

    // If a package.json exists at this level, collect its deps first.
    {
        const pkg_json = try std.fmt.allocPrint(allocator, "{s}/package.json", .{dir_path});
        defer allocator.free(pkg_json);
        if (io_helper.accessAbsolute(pkg_json, .{})) |_| {
            try scanMemberDir(allocator, dir_path, ".", all_deps, seen);
        } else |_| {}
    }

    var dir = io_helper.cwd().openDir(io_helper.io, dir_path, .{ .iterate = true }) catch return;
    defer dir.close(io_helper.io);

    var iter = dir.iterate();
    while (try iter.next(io_helper.io)) |entry| {
        if (entry.kind != .directory) continue;
        if (skipWorkspaceDir(entry.name)) continue;

        const child = try std.fmt.allocPrint(allocator, "{s}/{s}", .{ dir_path, entry.name });
        defer allocator.free(child);
        try walkRecursivelyForPackageJson(allocator, child, depth + 1, all_deps, seen);
    }
}

test "skipWorkspaceDir filters junk dirs and keeps real ones" {
    try std.testing.expect(skipWorkspaceDir(".git"));
    try std.testing.expect(skipWorkspaceDir("node_modules"));
    try std.testing.expect(skipWorkspaceDir("dist"));
    try std.testing.expect(skipWorkspaceDir("target"));
    try std.testing.expect(!skipWorkspaceDir("apps"));
    try std.testing.expect(!skipWorkspaceDir("packages"));
    try std.testing.expect(!skipWorkspaceDir("frontend"));
}

/// Scan a single workspace member directory for package.json deps.
fn scanMemberDir(
    allocator: std.mem.Allocator,
    base_dir: []const u8,
    rel_name: []const u8,
    all_deps: *std.ArrayList(parser.PackageDependency),
    seen: *std.StringHashMap(void),
) !void {
    const detector = @import("../../deps/detector.zig");

    const member_pkg = try std.fmt.allocPrint(allocator, "{s}/{s}/package.json", .{ base_dir, rel_name });
    defer allocator.free(member_pkg);

    io_helper.accessAbsolute(member_pkg, .{}) catch return;

    const member_file = detector.DepsFile{ .path = member_pkg, .format = .package_json };
    const member_deps = parser.inferDependencies(allocator, member_file) catch return;
    defer allocator.free(member_deps);

    for (member_deps) |dep| {
        if (std.mem.startsWith(u8, dep.version, "workspace:")) continue;
        if (seen.contains(dep.name)) continue;
        try seen.put(try allocator.dupe(u8, dep.name), {});
        try all_deps.append(allocator, try dep.clone(allocator));
    }
}

/// Update version in JSON content string.
/// Searches dependencies, devDependencies, peerDependencies, optionalDependencies,
/// AND the system section (for pantry system deps).
fn updateJsonContent(
    allocator: std.mem.Allocator,
    content: []const u8,
    package_name: []const u8,
    new_version: []const u8,
) ![]u8 {
    var result = std.ArrayList(u8).empty;
    defer result.deinit(allocator);

    const pattern = try std.fmt.allocPrint(allocator, "\"{s}\"", .{package_name});
    defer allocator.free(pattern);

    // All JSON sections where a version string can appear
    const dep_sections = [_][]const u8{
        "\"dependencies\"",
        "\"devDependencies\"",
        "\"peerDependencies\"",
        "\"optionalDependencies\"",
        "\"system\"",
    };

    var i: usize = 0;
    var in_section = false;
    var brace_depth: usize = 0;

    while (i < content.len) {
        if (!in_section or brace_depth == 0) {
            for (dep_sections) |section| {
                if (i + section.len <= content.len and
                    std.mem.startsWith(u8, content[i..], section))
                {
                    in_section = true;
                    brace_depth = 0;
                    break;
                }
            }
        }

        if (in_section) {
            if (content[i] == '{') {
                brace_depth += 1;
            } else if (content[i] == '}') {
                if (brace_depth > 0) {
                    brace_depth -= 1;
                    if (brace_depth == 0) in_section = false;
                }
            }
        }

        if (in_section and brace_depth > 0 and
            i + pattern.len <= content.len and
            std.mem.startsWith(u8, content[i..], pattern))
        {
            try result.appendSlice(allocator, content[i .. i + pattern.len]);
            i += pattern.len;

            while (i < content.len and (content[i] == ' ' or content[i] == '\t' or
                content[i] == '\n' or content[i] == '\r' or content[i] == ':'))
            {
                try result.append(allocator, content[i]);
                i += 1;
            }

            if (i < content.len and content[i] == '"') {
                const version_start = i + 1;
                i += 1;
                while (i < content.len and content[i] != '"') {
                    if (content[i] == '\\' and i + 1 < content.len) i += 1;
                    i += 1;
                }
                if (i < content.len) i += 1;

                const old_version = content[version_start .. i - 1];
                var prefix: []const u8 = "";
                if (old_version.len > 0) {
                    if (old_version[0] == '^' or old_version[0] == '~') {
                        prefix = old_version[0..1];
                    } else if (std.mem.startsWith(u8, old_version, ">=") or std.mem.startsWith(u8, old_version, "<=")) {
                        prefix = old_version[0..2];
                    } else if (old_version[0] == '>' or old_version[0] == '<') {
                        prefix = old_version[0..1];
                    }
                }

                try result.append(allocator, '"');
                try result.appendSlice(allocator, prefix);
                try result.appendSlice(allocator, new_version);
                try result.append(allocator, '"');
                continue;
            }
        }

        try result.append(allocator, content[i]);
        i += 1;
    }

    return try allocator.dupe(u8, result.items);
}
