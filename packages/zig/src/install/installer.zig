const std = @import("std");
const io_helper = @import("../io_helper.zig");
const core = @import("../core/platform.zig");
const cache = @import("../cache.zig");
const packages = @import("../packages.zig");
const errors = @import("../core/error.zig");
const downloader = @import("downloader.zig");
const extractor = @import("extractor.zig");
const libfixer = @import("libfixer.zig");
const semver = @import("../packages/semver.zig");
const style = @import("../cli/style.zig");

const pantryError = errors.pantryError;
const Paths = core.Paths;
const PackageCache = cache.PackageCache;
const PackageSpec = packages.PackageSpec;

/// Installation options
pub const InstallOptions = struct {
    /// Force reinstall even if cached
    force: bool = false,
    /// Verbose output
    verbose: bool = false,
    /// Dry run (don't actually install)
    dry_run: bool = false,
    /// Project root path for local installations (if null, install globally)
    project_root: ?[]const u8 = null,
    /// Quiet mode (minimal output)
    quiet: bool = false,
    /// Inline progress options for parallel installation display
    inline_progress: ?downloader.InlineProgressOptions = null,
    /// Skip transitive dependency resolution (caller handles it)
    skip_transitive_resolution: bool = false,
};

/// Installation result
pub const InstallResult = struct {
    /// Package name
    name: []const u8,
    /// Package version
    version: []const u8,
    /// Install path
    install_path: []const u8,
    /// Was cached
    from_cache: bool,
    /// Installation time in milliseconds
    install_time_ms: u64,
    /// Integrity string (SRI or hex SHA256) captured from the resolver, if any.
    /// Persisted to the lockfile for `--frozen` re-verification. Owned by the
    /// returned struct; freed in `deinit`. `null` when the source didn't
    /// provide an integrity value.
    integrity: ?[]const u8 = null,

    pub fn deinit(self: *InstallResult, allocator: std.mem.Allocator) void {
        allocator.free(self.name);
        allocator.free(self.version);
        allocator.free(self.install_path);
        if (self.integrity) |i| allocator.free(i);
    }
};

/// Thread-safe wrapper for the installing stack
const InstallingStack = struct {
    map: std.StringHashMap(void),
    mutex: io_helper.Mutex,
    allocator: std.mem.Allocator,

    fn init(allocator: std.mem.Allocator) InstallingStack {
        return .{
            .map = std.StringHashMap(void).init(allocator),
            .mutex = io_helper.Mutex{},
            .allocator = allocator,
        };
    }

    pub fn deinit(self: *InstallingStack) void {
        // Clean up all keys
        var it = self.map.iterator();
        while (it.next()) |entry| {
            self.allocator.free(entry.key_ptr.*);
        }
        self.map.deinit(self.allocator);
    }

    /// Atomically check if key exists and insert if not. Returns true if inserted, false if already present.
    /// Eliminates the TOCTOU race between separate contains() + put() calls.
    fn tryPut(self: *InstallingStack, key: []const u8) !bool {
        self.mutex.lock();
        defer self.mutex.unlock();
        if (self.map.contains(key)) return false;
        const key_owned = try self.allocator.dupe(u8, key);
        self.map.put(key_owned, {}) catch |err| {
            self.allocator.free(key_owned);
            return err;
        };
        return true;
    }

    fn remove(self: *InstallingStack, key: []const u8) void {
        self.mutex.lock();
        defer self.mutex.unlock();
        if (self.map.fetchRemove(key)) |entry| {
            self.allocator.free(entry.key);
        }
    }
};

/// Thread-safe two-level npm cache.
/// Level 1: package name → raw registry JSON bytes (avoids duplicate HTTP fetches).
/// Level 2: name@constraint → resolved version + tarball URL (avoids duplicate parsing).
const NpmCache = struct {
    // --- Level 2: resolution cache (name@constraint → version + tarball + integrity) ---
    const ResolutionEntry = struct {
        version: []const u8,
        tarball_url: []const u8,
        integrity: ?[]const u8 = null,
    };

    resolution_map: std.StringHashMap(ResolutionEntry),
    resolution_mutex: io_helper.Mutex,

    // --- Level 1: registry response cache (package name → raw JSON bytes) ---
    registry_map: std.StringHashMap([]const u8),
    registry_mutex: io_helper.Mutex,

    allocator: std.mem.Allocator,

    fn init(allocator: std.mem.Allocator) NpmCache {
        return .{
            .resolution_map = std.StringHashMap(ResolutionEntry).init(allocator),
            .resolution_mutex = .{},
            .registry_map = std.StringHashMap([]const u8).init(allocator),
            .registry_mutex = .{},
            .allocator = allocator,
        };
    }

    fn deinit(self: *NpmCache) void {
        // Free resolution entries
        var it = self.resolution_map.iterator();
        while (it.next()) |entry| {
            self.allocator.free(entry.key_ptr.*);
            self.allocator.free(entry.value_ptr.version);
            self.allocator.free(entry.value_ptr.tarball_url);
            if (entry.value_ptr.integrity) |i| self.allocator.free(i);
        }
        self.resolution_map.deinit(self.allocator);

        // Free registry entries
        var rit = self.registry_map.iterator();
        while (rit.next()) |entry| {
            self.allocator.free(entry.key_ptr.*);
            self.allocator.free(entry.value_ptr.*);
        }
        self.registry_map.deinit(self.allocator);
    }

    /// Level 2: Look up a cached resolution. Returns caller-owned copies of the strings.
    fn getResolution(self: *NpmCache, key: []const u8, allocator: std.mem.Allocator) ?Installer.NpmResolution {
        self.resolution_mutex.lock();
        defer self.resolution_mutex.unlock();
        const entry = self.resolution_map.get(key) orelse return null;
        const ver = allocator.dupe(u8, entry.version) catch return null;
        const url = allocator.dupe(u8, entry.tarball_url) catch {
            allocator.free(ver);
            return null;
        };
        const integ = if (entry.integrity) |i| (allocator.dupe(u8, i) catch null) else null;
        return Installer.NpmResolution{
            .version = ver,
            .tarball_url = url,
            .integrity = integ,
        };
    }

    /// Level 2: Check if a resolution exists without allocating (for hasNpmResolution).
    fn containsResolution(self: *NpmCache, key: []const u8) bool {
        self.resolution_mutex.lock();
        defer self.resolution_mutex.unlock();
        return self.resolution_map.contains(key);
    }

    /// Level 2: Store a resolution result (skip if another thread already cached it).
    fn putResolution(self: *NpmCache, key: []const u8, version: []const u8, tarball_url: []const u8, integrity: ?[]const u8) void {
        self.resolution_mutex.lock();
        defer self.resolution_mutex.unlock();
        // Another thread may have resolved while we were parsing - skip to avoid memory leak
        if (self.resolution_map.contains(key)) return;
        const owned_key = self.allocator.dupe(u8, key) catch return;
        const owned_ver = self.allocator.dupe(u8, version) catch {
            self.allocator.free(owned_key);
            return;
        };
        const owned_url = self.allocator.dupe(u8, tarball_url) catch {
            self.allocator.free(owned_key);
            self.allocator.free(owned_ver);
            return;
        };
        const owned_integrity = if (integrity) |i| (self.allocator.dupe(u8, i) catch null) else null;
        self.resolution_map.put(owned_key, .{ .version = owned_ver, .tarball_url = owned_url, .integrity = owned_integrity }) catch {
            self.allocator.free(owned_key);
            self.allocator.free(owned_ver);
            self.allocator.free(owned_url);
            if (owned_integrity) |oi| self.allocator.free(oi);
        };
    }

    /// Level 1: Get cached raw registry JSON bytes. Returns duped bytes (caller owns).
    fn getRegistryJson(self: *NpmCache, package_name: []const u8, allocator: std.mem.Allocator) ?[]const u8 {
        self.registry_mutex.lock();
        defer self.registry_mutex.unlock();
        const data = self.registry_map.get(package_name) orelse return null;
        return allocator.dupe(u8, data) catch null;
    }

    /// Level 1: Store raw registry JSON bytes (skip if another thread already cached it).
    fn putRegistryJson(self: *NpmCache, package_name: []const u8, json_bytes: []const u8) void {
        self.registry_mutex.lock();
        defer self.registry_mutex.unlock();
        // Another thread may have inserted while we were fetching - skip to avoid memory leak
        if (self.registry_map.contains(package_name)) return;
        const owned_key = self.allocator.dupe(u8, package_name) catch return;
        const owned_data = self.allocator.dupe(u8, json_bytes) catch {
            self.allocator.free(owned_key);
            return;
        };
        self.registry_map.put(owned_key, owned_data) catch {
            self.allocator.free(owned_key);
            self.allocator.free(owned_data);
        };
    }
};

/// Package installer
pub const Installer = struct {
    /// Package cache
    cache: *PackageCache,
    /// Data directory
    data_dir: []const u8,
    /// Allocator
    allocator: std.mem.Allocator,
    /// Track packages currently being installed to prevent infinite loops (shared across threads)
    installing_stack: *InstallingStack,
    /// Two-level npm cache: registry JSON by name + resolution by name@constraint
    npm_cache: *NpmCache,
    /// Custom npm registry URL (from .npmrc), null = use default
    custom_registry_url: ?[]const u8 = null,
    /// Install directory name (default: "pantry", configurable via pantry.toml)
    modules_dir: []const u8 = "pantry",
    /// In-memory cache of hoisted packages: name → installed version (avoids repeated filesystem checks)
    hoisted_versions: *HoisteVersionCache,
    /// Lockfile for lockfile-first resolution (skip npm registry queries when locked)
    lockfile: ?*@import("../deps/resolution/lockfile.zig").LockFile = null,
    /// Shared HTTP client for connection pooling (reuses TCP/TLS connections across requests)
    /// std.http.Client has a built-in 32-connection pool with mutex protection.
    http_client: *std.http.Client,
    /// Verbose debug logging (set once, checked throughout all install paths)
    verbose: bool = false,

    /// Thread-safe cache tracking which packages are installed at the hoisted level.
    /// Eliminates redundant filesystem checks when the same transitive dep is encountered
    /// dozens of times in a dependency tree.
    pub const HoisteVersionCache = struct {
        map: std.StringHashMap([]const u8),
        mutex: io_helper.Mutex,
        alloc: std.mem.Allocator,

        fn init(allocator: std.mem.Allocator) HoisteVersionCache {
            return .{
                .map = std.StringHashMap([]const u8).init(allocator),
                .mutex = .{},
                .alloc = allocator,
            };
        }

        fn deinit(self: *HoisteVersionCache) void {
            var it = self.map.iterator();
            while (it.next()) |entry| {
                self.alloc.free(entry.key_ptr.*);
                self.alloc.free(entry.value_ptr.*);
            }
            self.map.deinit(self.alloc);
        }

        /// Check if a package is already hoisted with a version satisfying the constraint.
        pub fn checkSatisfies(self: *HoisteVersionCache, name: []const u8, version_constraint: []const u8) bool {
            self.mutex.lock();
            defer self.mutex.unlock();
            const installed_version = self.map.get(name) orelse return false;
            const npm_zig = @import("../registry/npm.zig");
            const constraint = npm_zig.SemverConstraint.parse(version_constraint) catch return true;
            return constraint.satisfies(installed_version);
        }

        /// Record a package as installed at the hoisted level.
        pub fn put(self: *HoisteVersionCache, name: []const u8, version: []const u8) void {
            self.mutex.lock();
            defer self.mutex.unlock();
            if (self.map.contains(name)) return; // First version wins (hoisted)
            const owned_name = self.alloc.dupe(u8, name) catch return;
            const owned_version = self.alloc.dupe(u8, version) catch {
                self.alloc.free(owned_name);
                return;
            };
            self.map.put(owned_name, owned_version) catch {
                self.alloc.free(owned_name);
                self.alloc.free(owned_version);
            };
        }

        /// Atomic check-and-reserve: if `name` is not already hoisted, insert a
        /// placeholder version and return true. A second racing thread observing
        /// the placeholder will see `checkSatisfies()` return true (because the
        /// reservation matches any constraint) and skip the redundant install.
        ///
        /// After the install completes the caller must call `finalizeReservation`
        /// with the real resolved version.
        pub fn tryReserve(self: *HoisteVersionCache, name: []const u8, version_hint: []const u8) bool {
            self.mutex.lock();
            defer self.mutex.unlock();
            if (self.map.contains(name)) return false;
            const owned_name = self.alloc.dupe(u8, name) catch return false;
            const owned_version = self.alloc.dupe(u8, version_hint) catch {
                self.alloc.free(owned_name);
                return false;
            };
            self.map.put(owned_name, owned_version) catch {
                self.alloc.free(owned_name);
                self.alloc.free(owned_version);
                return false;
            };
            return true;
        }

        /// Replace the stored version for an entry previously created via
        /// `tryReserve`. If the entry does not exist, acts like `put`. Safe to
        /// call even if the entry already has the final version (no-op).
        pub fn finalizeReservation(self: *HoisteVersionCache, name: []const u8, final_version: []const u8) void {
            self.mutex.lock();
            defer self.mutex.unlock();
            if (self.map.getEntry(name)) |entry| {
                if (std.mem.eql(u8, entry.value_ptr.*, final_version)) return;
                const owned_version = self.alloc.dupe(u8, final_version) catch return;
                const old = entry.value_ptr.*;
                entry.value_ptr.* = owned_version;
                self.alloc.free(old);
                return;
            }
            // Not reserved — fall through to put-like behaviour (unlocked path below
            // is unnecessary since we're still inside the mutex).
            const owned_name = self.alloc.dupe(u8, name) catch return;
            const owned_version = self.alloc.dupe(u8, final_version) catch {
                self.alloc.free(owned_name);
                return;
            };
            self.map.put(owned_name, owned_version) catch {
                self.alloc.free(owned_name);
                self.alloc.free(owned_version);
            };
        }

        /// Release a reservation that turned out to be un-installable (e.g. resolver
        /// failure) so another thread can retry. Only removes the entry if the
        /// current value equals `version_hint`.
        pub fn releaseReservation(self: *HoisteVersionCache, name: []const u8, version_hint: []const u8) void {
            self.mutex.lock();
            defer self.mutex.unlock();
            if (self.map.getEntry(name)) |entry| {
                if (!std.mem.eql(u8, entry.value_ptr.*, version_hint)) return;
                const old_key = entry.key_ptr.*;
                const old_val = entry.value_ptr.*;
                _ = self.map.remove(name);
                self.alloc.free(old_key);
                self.alloc.free(old_val);
            }
        }
    };

    pub fn init(allocator: std.mem.Allocator, pkg_cache: *PackageCache) !Installer {
        const data_dir = try Paths.data(allocator);
        errdefer allocator.free(data_dir);

        const installing_stack = try allocator.create(InstallingStack);
        installing_stack.* = InstallingStack.init(allocator);

        const npm_cache = try allocator.create(NpmCache);
        npm_cache.* = NpmCache.init(allocator);

        const hoisted_versions = try allocator.create(HoisteVersionCache);
        hoisted_versions.* = HoisteVersionCache.init(allocator);

        // Shared HTTP client — connection pool (32 slots) reuses TCP/TLS across all requests
        const http_client = try allocator.create(std.http.Client);
        http_client.* = .{ .allocator = allocator, .io = io_helper.io };

        return .{
            .cache = pkg_cache,
            .data_dir = data_dir,
            .allocator = allocator,
            .installing_stack = installing_stack,
            .npm_cache = npm_cache,
            .hoisted_versions = hoisted_versions,
            .http_client = http_client,
        };
    }

    /// Set custom npm registry URL (from .npmrc configuration)
    pub fn setRegistryUrl(self: *Installer, url: []const u8) void {
        if (self.custom_registry_url) |old| self.allocator.free(old);
        self.custom_registry_url = self.allocator.dupe(u8, url) catch null;
    }

    /// Set lockfile for lockfile-first resolution (skips npm registry on subsequent installs)
    pub fn setLockfile(self: *Installer, lf: *@import("../deps/resolution/lockfile.zig").LockFile) void {
        self.lockfile = lf;
    }

    /// Pre-resolve all npm dependencies via the pantry registry's bulk resolution endpoint.
    /// Makes a single HTTP POST to /npm/resolve with all deps, and pre-populates the
    /// L2 npm cache with resolved versions + tarball URLs. This eliminates individual
    /// HTTP requests to registry.npmjs.org during transitive resolution.
    pub const BulkDep = struct { name: []const u8, version: []const u8 };

    pub fn bulkResolveViaPantryRegistry(
        self: *Installer,
        deps: []const BulkDep,
    ) void {
        if (deps.len == 0) return;

        // Build JSON request body: {"dependencies":{"react":"^16","lodash":"^4",...}}
        // Perf: Pre-calculate size to avoid ArrayList resizing
        var estimated_size: usize = 20; // {"dependencies":{}}
        for (deps) |dep| {
            estimated_size += dep.name.len + dep.version.len + 8; // "name":"version",
        }
        var body_buf = std.ArrayList(u8).initCapacity(self.allocator, estimated_size) catch {
            var fallback: std.ArrayList(u8) = .empty;
            return fallback.deinit(self.allocator);
        };
        defer body_buf.deinit(self.allocator);
        body_buf.appendSlice(self.allocator, "{\"dependencies\":{") catch return;

        var first = true;
        for (deps) |dep| {
            if (!first) body_buf.append(self.allocator, ',') catch continue;
            first = false;
            body_buf.append(self.allocator, '"') catch continue;
            body_buf.appendSlice(self.allocator, dep.name) catch continue;
            body_buf.appendSlice(self.allocator, "\":\"") catch continue;
            body_buf.appendSlice(self.allocator, dep.version) catch continue;
            body_buf.append(self.allocator, '"') catch continue;
        }
        body_buf.appendSlice(self.allocator, "}}") catch return;

        // POST to our registry's bulk resolver (uses shared HTTP client for connection pooling)
        const registry_url = "https://registry.pantry.dev/npm/resolve";
        const response = io_helper.httpPostJsonWithClient(self.http_client, self.allocator, registry_url, body_buf.items) catch return;
        defer self.allocator.free(response);

        if (response.len == 0) return;

        // Parse response and populate L2 npm cache
        const parsed = std.json.parseFromSlice(std.json.Value, self.allocator, response, .{}) catch return;
        defer parsed.deinit();

        if (parsed.value != .object) return;
        const resolved_obj = parsed.value.object.get("resolved") orelse return;
        if (resolved_obj != .object) return;

        var it = resolved_obj.object.iterator();
        while (it.next()) |entry| {
            const pkg_name = entry.key_ptr.*;
            const pkg_val = entry.value_ptr.*;
            if (pkg_val != .object) continue;

            const version = if (pkg_val.object.get("version")) |v| (if (v == .string) v.string else continue) else continue;
            const tarball = if (pkg_val.object.get("tarball")) |t| (if (t == .string) t.string else continue) else continue;
            const integrity = if (pkg_val.object.get("integrity")) |i| (if (i == .string) i.string else null) else null;

            // Cache as L2 resolution entry for all common constraint patterns
            // Perf: Use stack buffer for cache keys (avoids 4 allocPrint per package)
            var cache_key_buf: [512]u8 = undefined;
            const cache_keys = [_][]const u8{ "latest", "*", "" };
            for (cache_keys) |suffix| {
                const key = std.fmt.bufPrint(&cache_key_buf, "{s}@{s}", .{ pkg_name, suffix }) catch continue;
                self.npm_cache.putResolution(key, version, tarball, integrity);
            }
            // Also cache the exact resolved version
            {
                const key = std.fmt.bufPrint(&cache_key_buf, "{s}@{s}", .{ pkg_name, version }) catch continue;
                self.npm_cache.putResolution(key, version, tarball, integrity);
            }
            // Cache with the ORIGINAL constraint from the input deps (e.g. "^1.2.3", "~2.0.0")
            // so that hasNpmResolution() and resolveNpmPackage() hit L2 cache instead of
            // making per-package HTTP requests to npm/pantry registries.
            for (deps) |dep| {
                if (std.mem.eql(u8, dep.name, pkg_name)) {
                    const key = std.fmt.bufPrint(&cache_key_buf, "{s}@{s}", .{ pkg_name, dep.version }) catch break;
                    self.npm_cache.putResolution(key, version, tarball, integrity);
                    break;
                }
            }

            // Cache transitive dependency constraints from the response.
            // Each resolved package may have a "dependencies" object mapping dep names
            // to their version constraints (e.g. {"loose-envify": "^1.1.0"}).
            // By looking up those dep names in the resolved tree and caching their
            // constraint keys, we avoid per-package npm registry queries during
            // transitive dependency resolution.
            if (pkg_val.object.get("dependencies")) |deps_val| {
                if (deps_val == .object) {
                    var deps_it = deps_val.object.iterator();
                    while (deps_it.next()) |dep_entry| {
                        const dep_name = dep_entry.key_ptr.*;
                        const dep_constraint = dep_entry.value_ptr.*;
                        if (dep_constraint != .string) continue;

                        // Look up the resolved version for this transitive dep
                        if (resolved_obj.object.get(dep_name)) |resolved_dep| {
                            if (resolved_dep != .object) continue;
                            const dep_ver = if (resolved_dep.object.get("version")) |v| (if (v == .string) v.string else continue) else continue;
                            const dep_tarball = if (resolved_dep.object.get("tarball")) |t| (if (t == .string) t.string else continue) else continue;
                            const dep_integrity = if (resolved_dep.object.get("integrity")) |i| (if (i == .string) i.string else null) else null;

                            // Cache as dep_name@constraint (e.g. "loose-envify@^1.1.0")
                            const dep_key = std.fmt.bufPrint(&cache_key_buf, "{s}@{s}", .{ dep_name, dep_constraint.string }) catch continue;
                            self.npm_cache.putResolution(dep_key, dep_ver, dep_tarball, dep_integrity);
                        }
                    }
                }
            }
        }
    }

    /// Check if a package has been pre-resolved in the npm cache
    /// (e.g. via bulkResolveViaPantryRegistry or lockfile-first resolution).
    /// Used to skip expensive pantry registry lookups when resolution is already cached.
    /// Non-allocating: just checks existence in the cache.
    pub fn hasNpmResolution(self: *Installer, name: []const u8, version: []const u8) bool {
        var cache_key_buf: [512]u8 = undefined;
        const cache_key = std.fmt.bufPrint(&cache_key_buf, "{s}@{s}", .{ name, version }) catch return false;
        return self.npm_cache.containsResolution(cache_key);
    }

    /// Batch install all packages from lockfile in parallel.
    /// This is the fast path when lockfile exists but modules are missing:
    /// 1. Flatten lockfile → list of {name, version, tarball_url}
    /// 2. Filter to only packages not already on disk
    /// 3. Download/extract in parallel using tarball cache
    /// Returns number of packages installed, or null if lockfile not available.
    pub fn installAllFromLockfile(
        self: *Installer,
        project_root: []const u8,
    ) !?usize {
        const lf = self.lockfile orelse return null;

        // 1. Collect all packages that need installation
        const PkgEntry = struct {
            name: []const u8,
            version: []const u8,
            tarball_url: []const u8,
        };

        var to_install: std.ArrayList(PkgEntry) = .empty;
        defer to_install.deinit(self.allocator);

        var lf_iter = lf.packages.iterator();
        while (lf_iter.next()) |entry| {
            const pkg = entry.value_ptr.*;
            if (pkg.name.len == 0 or pkg.version.len == 0) continue;

            // Check if already installed on disk
            var dir_buf: [std.fs.max_path_bytes]u8 = undefined;
            const install_dir = std.fmt.bufPrint(&dir_buf, "{s}/{s}/{s}", .{
                project_root, self.modules_dir, pkg.name,
            }) catch continue;
            io_helper.accessAbsolute(install_dir, .{}) catch {
                // Not installed — need to extract

                // Build tarball URL from lockfile resolved field or npm convention
                const url = if (pkg.resolved.len > 0 and !std.mem.startsWith(u8, pkg.resolved, "registry:"))
                    pkg.resolved
                else blk: {
                    // Construct npm tarball URL from name+version
                    const base_name = if (std.mem.indexOf(u8, pkg.name, "/")) |slash|
                        pkg.name[slash + 1 ..]
                    else
                        pkg.name;
                    // Perf: Use stack buffer for URL construction, then dupe only once
                    var url_buf: [1024]u8 = undefined;
                    const url_str = std.fmt.bufPrint(&url_buf, "https://registry.npmjs.org/{s}/-/{s}-{s}.tgz", .{
                        pkg.name, base_name, pkg.version,
                    }) catch continue;
                    break :blk self.allocator.dupe(u8, url_str) catch continue;
                };

                to_install.append(self.allocator, .{
                    .name = pkg.name,
                    .version = pkg.version,
                    .tarball_url = url,
                }) catch continue;
                continue;
            };
            // Already installed — add to hoisted cache for fast transitive skips
            self.hoisted_versions.put(pkg.name, pkg.version);
        }

        if (to_install.items.len == 0) return 0;

        // 2. Install in parallel using thread pool
        const results = try self.allocator.alloc(bool, to_install.items.len);
        defer self.allocator.free(results);
        for (results) |*r| r.* = false;

        const BatchCtx = struct {
            entries: []const PkgEntry,
            results: []bool,
            next: *std.atomic.Value(usize),
            installer: *Installer,
            project_root: []const u8,

            fn worker(ctx: *@This()) void {
                while (true) {
                    const i = ctx.next.fetchAdd(1, .monotonic);
                    if (i >= ctx.entries.len) break;

                    const entry = ctx.entries[i];
                    const spec = PackageSpec{
                        .name = entry.name,
                        .version = entry.version,
                        .source = .npm,
                        .url = entry.tarball_url,
                    };

                    var result = ctx.installer.installFromNpm(spec, .{
                        .project_root = ctx.project_root,
                        .quiet = true,
                        .skip_transitive_resolution = true, // We install everything flat
                    }) catch {
                        continue;
                    };
                    result.deinit(ctx.installer.allocator);
                    ctx.results[i] = true;
                }
            }
        };

        var next_idx = std.atomic.Value(usize).init(0);
        var ctx = BatchCtx{
            .entries = to_install.items,
            .results = results,
            .next = &next_idx,
            .installer = self,
            .project_root = project_root,
        };

        const cpu_count = std.Thread.getCpuCount() catch 4;
        const max_threads = @min(cpu_count, 16);
        const thread_count = @min(to_install.items.len, max_threads);
        var threads = try self.allocator.alloc(?std.Thread, max_threads);
        defer self.allocator.free(threads);
        for (threads) |*t| t.* = null;

        for (0..thread_count) |t| {
            threads[t] = std.Thread.spawn(.{}, BatchCtx.worker, .{&ctx}) catch null;
        }

        // Perf: Join threads directly instead of polling with nanosleep
        // (eliminates 50ms sleep latency between checks)
        for (threads) |*t| {
            if (t.*) |thread| {
                thread.join();
                t.* = null;
            }
        }

        // Count successes and populate hoisted cache
        var installed: usize = 0;
        for (to_install.items, 0..) |entry, i| {
            if (results[i]) {
                installed += 1;
                self.hoisted_versions.put(entry.name, entry.version);
            }
        }

        // Note: tarball_url strings point into lockfile-owned memory (for lockfile resolved fields)
        // or are constructed URLs. Constructed URLs are short-lived and freed by ArrayList deinit.

        return installed;
    }

    pub fn deinit(self: *Installer) void {
        self.allocator.free(self.data_dir);
        if (self.custom_registry_url) |url| self.allocator.free(url);
        self.installing_stack.deinit();
        self.allocator.destroy(self.installing_stack);
        self.npm_cache.deinit();
        self.allocator.destroy(self.npm_cache);
        self.hoisted_versions.deinit();
        self.allocator.destroy(self.hoisted_versions);
        self.http_client.deinit();
        self.allocator.destroy(self.http_client);
    }

    /// Install a package
    pub fn install(
        self: *Installer,
        spec: PackageSpec,
        options: InstallOptions,
    ) !InstallResult {
        const start_ts_ = io_helper.clockGettime();
        const start_time = @as(i64, @intCast(start_ts_.sec)) * 1000 + @divFloor(@as(i64, @intCast(start_ts_.nsec)), 1_000_000);

        if (options.verbose) {
            std.debug.print("[verbose:installer] install() called: name={s}, version={s}, source={s}, project_root={s}\n", .{
                spec.name,
                spec.version,
                @tagName(spec.source),
                if (options.project_root) |pr| pr else "(global)",
            });
        }

        // Check if this is a local path dependency
        const is_local_path = std.mem.startsWith(u8, spec.version, "~/") or
            std.mem.startsWith(u8, spec.version, "/");

        if (is_local_path) {
            if (options.verbose) std.debug.print("[verbose:installer] -> local path dependency: {s}\n", .{spec.version});
            return try self.installLocalPath(spec, options);
        }

        // Check if this is a GitHub dependency
        if (spec.source == .github) {
            if (options.verbose) std.debug.print("[verbose:installer] -> github source: {s}\n", .{spec.name});
            return try self.installFromGitHub(spec, options);
        }

        // Check if this is a generic git dependency (git+https://, git+ssh://, git://)
        if (spec.source == .git) {
            if (options.verbose) std.debug.print("[verbose:installer] -> git source: {s}\n", .{spec.name});
            return try self.installFromGit(spec, options);
        }

        // Check if this is a URL dependency (https:// tarball)
        if (spec.source == .http) {
            if (options.verbose) std.debug.print("[verbose:installer] -> http/url source: {s}\n", .{spec.name});
            return try self.installFromUrl(spec, options);
        }

        // Check if this is a Zig from ziglang.org (dev or stable)
        if (spec.source == .ziglang) {
            if (options.verbose) std.debug.print("[verbose:installer] -> ziglang source: {s}\n", .{spec.name});
            return try self.installFromZiglang(spec, options);
        }

        // Check if this is an npm package
        if (spec.source == .npm) {
            if (options.verbose) std.debug.print("[verbose:installer] -> npm source: {s} url={s}\n", .{ spec.name, if (spec.url) |u| u else "(null)" });
            return try self.installFromNpm(spec, options);
        }

        // Check if package exists in registry (used for domain resolution and fallback)
        const pkg_registry = @import("../packages/generated.zig");
        const pkg_info = pkg_registry.getPackageByName(spec.name);

        // Use registry domain if available, otherwise use the package name as domain
        // This allows S3-only packages that aren't in generated.zig to still be installed
        const domain = if (pkg_info) |info| info.domain else spec.name;

        // Resolve version constraint to actual version
        // Try S3 registry first (has the most up-to-date versions), then generated.zig
        var resolved_spec = spec;
        var s3_version_alloc: ?[]const u8 = null;
        var s3_tarball_url: ?[]const u8 = null;
        var from_s3 = false;
        defer if (s3_version_alloc) |v| self.allocator.free(v);
        // If tarball URL wasn't consumed by download functions, free it here
        defer if (s3_tarball_url) |u| self.allocator.free(@constCast(u));

        // Perf: Skip S3/Pantry registry lookups for packages that are clearly npm
        // (scoped @scope/name or non-domain names without dots). These will never be in S3.
        const is_scoped_name = spec.name.len > 0 and spec.name[0] == '@';
        const is_domain_name = std.mem.indexOfScalar(u8, spec.name, '.') != null;
        const skip_s3_lookup = is_scoped_name or (!is_domain_name and pkg_info == null);

        if (options.verbose) std.debug.print("[verbose:installer] looking up S3 registry for domain={s}, version={s} (skip_s3={})\n", .{ domain, spec.version, skip_s3_lookup });

        if (!skip_s3_lookup) {
            if (downloader.lookupS3Registry(self.allocator, domain, spec.version)) |s3_result| {
                if (options.verbose) std.debug.print("[verbose:installer] S3 registry hit: {s} @ {s} url={s}\n", .{ domain, s3_result.version, s3_result.tarball_url });
                s3_version_alloc = s3_result.version;
                s3_tarball_url = s3_result.tarball_url;
                resolved_spec = PackageSpec{
                    .name = spec.name,
                    .version = s3_result.version,
                };
                from_s3 = true;
            } else if (downloader.lookupPantryPublished(self.allocator, domain, spec.version)) |pub_result| {
                if (options.verbose) std.debug.print("[verbose:installer] pantry published hit: {s} @ {s}\n", .{ domain, pub_result.version });
                s3_version_alloc = pub_result.version;
                s3_tarball_url = pub_result.tarball_url;
                resolved_spec = PackageSpec{
                    .name = spec.name,
                    .version = pub_result.version,
                };
                from_s3 = true;
            }
        }

        if (!from_s3) {
            if (pkg_info) |_| {
                // Fall back to generated.zig version list
                if (semver.resolveVersion(domain, spec.version)) |resolved_version| {
                    if (options.verbose) std.debug.print("[verbose:installer] generated.zig resolved: {s} -> {s}\n", .{ domain, resolved_version });
                    resolved_spec = PackageSpec{
                        .name = spec.name,
                        .version = resolved_version,
                    };
                } else {
                    if (options.verbose) std.debug.print("[verbose:installer] generated.zig version resolution failed for {s} @ {s}\n", .{ domain, spec.version });
                }
            } else {
                if (options.verbose) std.debug.print("[verbose:installer] NOT FOUND: {s} not in generated.zig or S3\n", .{domain});
                return error.PackageNotFound;
            }
        }

        // Create a unique key for this package installation (domain@version)
        // Use stack buffer to avoid heap allocation in hot path
        var key_buf: [512]u8 = undefined;
        const install_key = std.fmt.bufPrint(&key_buf, "{s}@{s}", .{ domain, resolved_spec.version }) catch
            try std.fmt.allocPrint(self.allocator, "{s}@{s}", .{ domain, resolved_spec.version });
        const key_is_heap = install_key.ptr != &key_buf;
        defer if (key_is_heap) self.allocator.free(@constCast(install_key));

        if (options.verbose) std.debug.print("[verbose:installer] install_key={s}, checking circular dep\n", .{install_key});

        // Atomically check+insert to prevent circular dependency loops (race-free)
        if (!try self.installing_stack.tryPut(install_key)) {
            if (options.verbose) std.debug.print("[verbose:installer] CIRCULAR DEP detected for {s}, skipping\n", .{install_key});
            // Already being installed in the call stack - skip to avoid infinite loop
            const end_ts_ = io_helper.clockGettime();
            const end_time = @as(i64, @intCast(end_ts_.sec)) * 1000 + @divFloor(@as(i64, @intCast(end_ts_.nsec)), 1_000_000);
            return InstallResult{
                .name = try self.allocator.dupe(u8, resolved_spec.name),
                .version = try self.allocator.dupe(u8, resolved_spec.version),
                .install_path = try self.allocator.dupe(u8, ""),
                .from_cache = true,
                .install_time_ms = @intCast(end_time - start_time),
            };
        }
        defer {
            // Remove from stack when we're done
            self.installing_stack.remove(install_key);
        }

        // Track whether we used cache
        var used_cache = false;

        // Determine install location based on whether we have a project root
        // Transfer ownership of s3_tarball_url to the download function (it will free it)
        const transfer_url = s3_tarball_url;
        s3_tarball_url = null; // Prevent defer from double-freeing

        if (options.verbose) std.debug.print("[verbose:installer] installing {s} @ {s} (from_s3={}, has_transfer_url={})\n", .{
            resolved_spec.name,
            resolved_spec.version,
            from_s3,
            transfer_url != null,
        });

        const install_path = if (options.project_root) |project_root| blk: {
            if (options.verbose) std.debug.print("[verbose:installer] -> installToProject: {s} to {s}/{s}\n", .{ resolved_spec.name, project_root, self.modules_dir });
            break :blk try self.installToProject(resolved_spec, domain, project_root, options, &used_cache, transfer_url);
        } else blk: {
            if (options.verbose) std.debug.print("[verbose:installer] -> installGlobal: {s}\n", .{resolved_spec.name});
            break :blk try self.installGlobal(resolved_spec, domain, options, &used_cache, transfer_url);
        };

        if (options.verbose) std.debug.print("[verbose:installer] installed {s} @ {s} -> {s} (cached={})\n", .{ resolved_spec.name, resolved_spec.version, install_path, used_cache });

        // Install dependencies after the main package is installed
        // Skip for S3-sourced packages since they are self-contained with all libs bundled
        if (!from_s3) {
            if (pkg_info) |info| {
                if (options.verbose) std.debug.print("[verbose:installer] installing sub-dependencies for {s} (count={d})\n", .{ resolved_spec.name, info.dependencies.len });
                try self.installDependencies(info.dependencies, options);
            }
        }

        const end_ts_ = io_helper.clockGettime();
        const end_time = @as(i64, @intCast(end_ts_.sec)) * 1000 + @divFloor(@as(i64, @intCast(end_ts_.nsec)), 1_000_000);

        // Report download analytics (fire-and-forget, never blocks install)
        if (!used_cache) {
            reportDownloadAnalytics(self.allocator, domain, resolved_spec.version);
        }

        if (options.verbose) std.debug.print("[verbose:installer] install() complete: {s} @ {s} ({d}ms)\n", .{ resolved_spec.name, resolved_spec.version, @as(u64, @intCast(end_time - start_time)) });

        return InstallResult{
            .name = try self.allocator.dupe(u8, resolved_spec.name),
            .version = try self.allocator.dupe(u8, resolved_spec.version),
            .install_path = install_path,
            .from_cache = used_cache,
            .install_time_ms = @intCast(end_time - start_time),
        };
    }

    /// Install a local path dependency by creating a symlink
    fn installLocalPath(
        self: *Installer,
        spec: PackageSpec,
        options: InstallOptions,
    ) !InstallResult {
        const start_ts_ = io_helper.clockGettime();
        const start_time = @as(i64, @intCast(start_ts_.sec)) * 1000 + @divFloor(@as(i64, @intCast(start_ts_.nsec)), 1_000_000);

        // Expand ~ to home directory if needed
        var local_path: []const u8 = undefined;
        const needs_free = if (std.mem.startsWith(u8, spec.version, "~/")) blk: {
            const home = try Paths.home(self.allocator);
            defer self.allocator.free(home);
            local_path = try std.fmt.allocPrint(
                self.allocator,
                "{s}/{s}",
                .{ home, spec.version[2..] },
            );
            break :blk true;
        } else blk: {
            local_path = spec.version;
            break :blk false;
        };
        defer if (needs_free) self.allocator.free(local_path);

        // Verify the local path exists
        var local_dir = io_helper.cwd().openDir(io_helper.io, local_path, .{}) catch |err| {
            style.print("Error: Local path '{s}' does not exist or is not accessible: {}\n", .{ local_path, err });
            return error.FileNotFound;
        };
        local_dir.close(io_helper.io);

        // Get absolute path for the local dependency
        const abs_local_path = try io_helper.realpathAlloc(self.allocator, local_path);
        defer self.allocator.free(abs_local_path);

        // Create symlink in project's pantry if we have a project root
        const symlink_path = if (options.project_root) |project_root| blk: {
            const modules_bin = try std.fmt.allocPrint(
                self.allocator,
                "{s}/{s}/.bin/{s}",
                .{ project_root, self.modules_dir, spec.name },
            );
            errdefer self.allocator.free(modules_bin);

            // Create pantry/.bin directory
            const modules_bin_dir = try std.fmt.allocPrint(
                self.allocator,
                "{s}/{s}/.bin",
                .{ project_root, self.modules_dir },
            );
            defer self.allocator.free(modules_bin_dir);

            try io_helper.makePath(modules_bin_dir);

            // Check if symlink already exists
            io_helper.deleteFile(modules_bin) catch {};

            // Create symlink to local path's bin or the path itself
            const target_bin = try std.fmt.allocPrint(
                self.allocator,
                "{s}/bin/{s}",
                .{ abs_local_path, spec.name },
            );
            defer self.allocator.free(target_bin);

            // Try bin/name first, fall back to the directory itself
            const target = blk2: {
                var check_bin = io_helper.cwd().openFile(io_helper.io, target_bin, .{}) catch break :blk2 abs_local_path;
                check_bin.close(io_helper.io);
                break :blk2 target_bin;
            };

            const symlink_module = @import("symlink.zig");
            symlink_module.createSymlinkCrossPlatform(target, modules_bin) catch |err| {
                if (!style.isCI()) style.print("Warning: Failed to create symlink {s} -> {s}: {}\n", .{ modules_bin, target, err });
            };

            break :blk modules_bin;
        } else blk: {
            break :blk try self.allocator.dupe(u8, abs_local_path);
        };

        const end_ts_ = io_helper.clockGettime();
        const end_time = @as(i64, @intCast(end_ts_.sec)) * 1000 + @divFloor(@as(i64, @intCast(end_ts_.nsec)), 1_000_000);

        if (!options.quiet) {
            style.print("  ✓ linked to {s}\n", .{local_path});
        }

        return InstallResult{
            .name = try self.allocator.dupe(u8, spec.name),
            .version = try self.allocator.dupe(u8, "local"),
            .install_path = symlink_path,
            .from_cache = false,
            .install_time_ms = @intCast(end_time - start_time),
        };
    }

    /// Install a package from GitHub
    fn installFromGitHub(
        self: *Installer,
        spec: PackageSpec,
        options: InstallOptions,
    ) !InstallResult {
        const start_ts_ = io_helper.clockGettime();
        const start_time = @as(i64, @intCast(start_ts_.sec)) * 1000 + @divFloor(@as(i64, @intCast(start_ts_.nsec)), 1_000_000);

        if (spec.repo == null) {
            return error.InvalidGitHubSpec;
        }

        const repo = spec.repo.?;

        // Determine install location
        // For project installations, don't include version in path to match build expectations
        const install_dir = if (options.project_root) |project_root| blk: {
            break :blk try std.fmt.allocPrint(
                self.allocator,
                "{s}/{s}/{s}",
                .{ project_root, self.modules_dir, spec.name },
            );
        } else blk: {
            break :blk try std.fmt.allocPrint(
                self.allocator,
                "{s}/packages/{s}/{s}",
                .{ self.data_dir, spec.name, spec.version },
            );
        };
        errdefer self.allocator.free(install_dir);

        // Check if already installed (lightweight access check, no dir handle)
        const already_installed = !options.force and blk: {
            io_helper.accessAbsolute(install_dir, .{}) catch break :blk false;
            break :blk true;
        };

        if (already_installed) {
            const end_ts_ = io_helper.clockGettime();
            const end_time = @as(i64, @intCast(end_ts_.sec)) * 1000 + @divFloor(@as(i64, @intCast(end_ts_.nsec)), 1_000_000);
            return InstallResult{
                .name = try self.allocator.dupe(u8, spec.name),
                .version = try self.allocator.dupe(u8, spec.version),
                .install_path = install_dir,
                .from_cache = true,
                .install_time_ms = @intCast(end_time - start_time),
            };
        }

        if (!options.quiet) {
            if (!style.isCI()) style.print("  → Cloning from GitHub: {s}#{s}\n", .{ repo, spec.version });
        }

        // Create temp directory for cloning
        const home_dir = try Paths.home(self.allocator);
        defer self.allocator.free(home_dir);
        const temp_dir = try std.fmt.allocPrint(
            self.allocator,
            "{s}/.pantry/.tmp/github-{s}-{s}",
            .{ home_dir, spec.name, spec.version },
        );
        defer {
            self.allocator.free(temp_dir);
            io_helper.deleteTree(temp_dir) catch {};
        }

        // Clone the repository
        const clone_url = try std.fmt.allocPrint(
            self.allocator,
            "https://github.com/{s}.git",
            .{repo},
        );
        defer self.allocator.free(clone_url);

        // Try cloning with the specified branch/tag first
        var clone_result = try io_helper.childRun(self.allocator, &[_][]const u8{ "git", "clone", "--depth", "1", "--branch", spec.version, clone_url, temp_dir });

        // If the branch-specific clone failed, try without branch (use default branch)
        if (clone_result.term != .exited or clone_result.term.exited != 0) {
            self.allocator.free(clone_result.stdout);
            self.allocator.free(clone_result.stderr);

            clone_result = try io_helper.childRun(self.allocator, &[_][]const u8{ "git", "clone", "--depth", "1", clone_url, temp_dir });
        }
        defer {
            self.allocator.free(clone_result.stdout);
            self.allocator.free(clone_result.stderr);
        }

        if (clone_result.term != .exited or clone_result.term.exited != 0) {
            if (!options.quiet and !style.isCI()) {
                style.print("  ✗ Failed to clone: {s}\n", .{clone_result.stderr});
            }
            return error.GitCloneFailed;
        }

        // Create install directory
        try io_helper.makePath(install_dir);

        // Move contents from temp to final location
        // Git clone creates a directory, so we need to move the contents
        // Use std.fs.Dir for iteration (Io.Dir doesn't have iterate() in Zig 0.16)
        var temp_dir_handle = try io_helper.openDirForIteration(temp_dir);
        defer temp_dir_handle.close();

        var iter = temp_dir_handle.iterate();
        while (iter.next() catch null) |entry| {
            var src_buf: [std.fs.max_path_bytes]u8 = undefined;
            const src_path = std.fmt.bufPrint(&src_buf, "{s}/{s}", .{ temp_dir, entry.name }) catch continue;

            var dst_buf: [std.fs.max_path_bytes]u8 = undefined;
            const dest_path = std.fmt.bufPrint(&dst_buf, "{s}/{s}", .{ install_dir, entry.name }) catch continue;

            io_helper.rename(src_path, dest_path) catch continue;
        }

        // Create project symlinks if installing to project
        if (options.project_root) |project_root| {
            try self.createProjectSymlinks(project_root, spec.name, spec.version, install_dir);
        }

        const end_ts_ = io_helper.clockGettime();
        const end_time = @as(i64, @intCast(end_ts_.sec)) * 1000 + @divFloor(@as(i64, @intCast(end_ts_.nsec)), 1_000_000);

        return InstallResult{
            .name = try self.allocator.dupe(u8, spec.name),
            .version = try self.allocator.dupe(u8, spec.version),
            .install_path = install_dir,
            .from_cache = false,
            .install_time_ms = @intCast(end_time - start_time),
        };
    }

    /// Install a package from a generic git URL (git+https://, git+ssh://, git://)
    fn installFromGit(
        self: *Installer,
        spec: PackageSpec,
        options: InstallOptions,
    ) !InstallResult {
        const start_ts_ = io_helper.clockGettime();
        const start_time = @as(i64, @intCast(start_ts_.sec)) * 1000 + @divFloor(@as(i64, @intCast(start_ts_.nsec)), 1_000_000);

        const git_url_raw = spec.url orelse return error.InvalidGitUrl;

        // Strip git+ prefix if present (git+https:// -> https://, git+ssh:// -> ssh://)
        const git_url = if (std.mem.startsWith(u8, git_url_raw, "git+"))
            git_url_raw[4..]
        else
            git_url_raw;

        // Determine ref (branch/tag/commit) from spec
        const ref = spec.branch orelse spec.tag orelse spec.version;

        // Determine install location
        const install_dir = if (options.project_root) |project_root| blk: {
            break :blk try std.fmt.allocPrint(
                self.allocator,
                "{s}/{s}/{s}",
                .{ project_root, self.modules_dir, spec.name },
            );
        } else blk: {
            break :blk try std.fmt.allocPrint(
                self.allocator,
                "{s}/packages/git/{s}/{s}",
                .{ self.data_dir, spec.name, spec.version },
            );
        };
        errdefer self.allocator.free(install_dir);

        // Check if already installed
        const already_installed = !options.force and blk: {
            io_helper.accessAbsolute(install_dir, .{}) catch break :blk false;
            break :blk true;
        };

        if (already_installed) {
            const end_ts_ = io_helper.clockGettime();
            const end_time = @as(i64, @intCast(end_ts_.sec)) * 1000 + @divFloor(@as(i64, @intCast(end_ts_.nsec)), 1_000_000);
            return InstallResult{
                .name = try self.allocator.dupe(u8, spec.name),
                .version = try self.allocator.dupe(u8, spec.version),
                .install_path = install_dir,
                .from_cache = true,
                .install_time_ms = @intCast(end_time - start_time),
            };
        }

        if (!options.quiet) {
            if (!style.isCI()) style.print("  → Cloning from git: {s}#{s}\n", .{ git_url, ref });
        }

        // Create temp directory for cloning
        const home_dir = try Paths.home(self.allocator);
        defer self.allocator.free(home_dir);
        const temp_dir = try std.fmt.allocPrint(
            self.allocator,
            "{s}/.pantry/.tmp/git-{s}-{s}",
            .{ home_dir, spec.name, spec.version },
        );
        defer {
            self.allocator.free(temp_dir);
            io_helper.deleteTree(temp_dir) catch {};
        }

        // Clone with specified ref
        var clone_result = try io_helper.childRun(self.allocator, &[_][]const u8{
            "git", "clone", "--depth", "1", "--branch", ref, git_url, temp_dir,
        });

        // If branch-specific clone failed, try without branch
        if (clone_result.term != .exited or clone_result.term.exited != 0) {
            self.allocator.free(clone_result.stdout);
            self.allocator.free(clone_result.stderr);
            clone_result = try io_helper.childRun(self.allocator, &[_][]const u8{
                "git", "clone", "--depth", "1", git_url, temp_dir,
            });
        }
        defer {
            self.allocator.free(clone_result.stdout);
            self.allocator.free(clone_result.stderr);
        }

        if (clone_result.term != .exited or clone_result.term.exited != 0) {
            if (!options.quiet and !style.isCI()) {
                style.print("  ✗ Failed to clone: {s}\n", .{clone_result.stderr});
            }
            return error.GitCloneFailed;
        }

        // Move contents to install directory
        try io_helper.makePath(install_dir);
        var temp_dir_handle = try io_helper.openDirForIteration(temp_dir);
        defer temp_dir_handle.close();

        var iter = temp_dir_handle.iterate();
        while (iter.next() catch null) |entry| {
            var src_buf: [std.fs.max_path_bytes]u8 = undefined;
            const src_path = std.fmt.bufPrint(&src_buf, "{s}/{s}", .{ temp_dir, entry.name }) catch continue;
            var dst_buf: [std.fs.max_path_bytes]u8 = undefined;
            const dest_path = std.fmt.bufPrint(&dst_buf, "{s}/{s}", .{ install_dir, entry.name }) catch continue;
            io_helper.rename(src_path, dest_path) catch continue;
        }

        if (options.project_root) |project_root| {
            try self.createProjectSymlinks(project_root, spec.name, spec.version, install_dir);
        }

        const end_ts_ = io_helper.clockGettime();
        const end_time = @as(i64, @intCast(end_ts_.sec)) * 1000 + @divFloor(@as(i64, @intCast(end_ts_.nsec)), 1_000_000);
        return InstallResult{
            .name = try self.allocator.dupe(u8, spec.name),
            .version = try self.allocator.dupe(u8, spec.version),
            .install_path = install_dir,
            .from_cache = false,
            .install_time_ms = @intCast(end_time - start_time),
        };
    }

    /// Install a package from a URL (tarball download)
    fn installFromUrl(
        self: *Installer,
        spec: PackageSpec,
        options: InstallOptions,
    ) !InstallResult {
        const start_ts_ = io_helper.clockGettime();
        const start_time = @as(i64, @intCast(start_ts_.sec)) * 1000 + @divFloor(@as(i64, @intCast(start_ts_.nsec)), 1_000_000);

        const download_url = spec.url orelse return error.NoUrlProvided;

        // Validate URL scheme to prevent SSRF
        if (!std.mem.startsWith(u8, download_url, "https://") and
            !std.mem.startsWith(u8, download_url, "http://"))
        {
            return error.InvalidUrlScheme;
        }

        // Determine install location
        const install_dir = if (options.project_root) |project_root| blk: {
            break :blk try std.fmt.allocPrint(
                self.allocator,
                "{s}/{s}/{s}",
                .{ project_root, self.modules_dir, spec.name },
            );
        } else blk: {
            break :blk try std.fmt.allocPrint(
                self.allocator,
                "{s}/packages/url/{s}/{s}",
                .{ self.data_dir, spec.name, spec.version },
            );
        };
        errdefer self.allocator.free(install_dir);

        // Check if already installed
        const already_installed = !options.force and blk: {
            io_helper.accessAbsolute(install_dir, .{}) catch break :blk false;
            break :blk true;
        };

        if (already_installed) {
            const end_ts_ = io_helper.clockGettime();
            const end_time = @as(i64, @intCast(end_ts_.sec)) * 1000 + @divFloor(@as(i64, @intCast(end_ts_.nsec)), 1_000_000);
            return InstallResult{
                .name = try self.allocator.dupe(u8, spec.name),
                .version = try self.allocator.dupe(u8, spec.version),
                .install_path = install_dir,
                .from_cache = true,
                .install_time_ms = @intCast(end_time - start_time),
            };
        }

        if (!options.quiet) {
            style.print("  → Downloading from URL: {s}\n", .{download_url});
        }

        // Download tarball to temp location
        const tmp_dir = io_helper.getTempDir();
        const safe_name = try std.mem.replaceOwned(u8, self.allocator, spec.name, "/", "__");
        defer self.allocator.free(safe_name);
        const tarball_path = try std.fmt.allocPrint(
            self.allocator,
            "{s}/pantry-url-{s}.tgz",
            .{ tmp_dir, safe_name },
        );
        defer {
            self.allocator.free(tarball_path);
            io_helper.deleteFile(tarball_path) catch {};
        }

        io_helper.httpDownloadFile(self.allocator, download_url, tarball_path) catch {
            if (!options.quiet) {
                style.print("  ✗ Failed to download: {s}\n", .{download_url});
            }
            return error.DownloadFailed;
        };

        // Create install directory and extract
        try io_helper.makePath(install_dir);

        {
            const tarball_data = try io_helper.readFileAlloc(self.allocator, tarball_path, 500 * 1024 * 1024);
            defer self.allocator.free(tarball_data);

            var dest = try io_helper.cwd().openDir(io_helper.io, install_dir, .{});
            defer dest.close(io_helper.io);

            var input_reader: std.Io.Reader = .fixed(tarball_data);
            var window_buf: [65536]u8 = undefined;
            var decompressor: std.compress.flate.Decompress = .init(&input_reader, .gzip, &window_buf);
            std.tar.pipeToFileSystem(io_helper.io, dest, &decompressor.reader, .{
                .strip_components = 1,
            }) catch |err| {
                if (!options.quiet) {
                    style.print("  ✗ Failed to extract tarball: {}\n", .{err});
                }
                return error.ExtractionFailed;
            };
        }

        if (options.project_root) |project_root| {
            try self.createNpmShims(project_root, spec.name, install_dir);
        }

        const end_ts_ = io_helper.clockGettime();
        const end_time = @as(i64, @intCast(end_ts_.sec)) * 1000 + @divFloor(@as(i64, @intCast(end_ts_.nsec)), 1_000_000);
        return InstallResult{
            .name = try self.allocator.dupe(u8, spec.name),
            .version = try self.allocator.dupe(u8, spec.version),
            .install_path = install_dir,
            .from_cache = false,
            .install_time_ms = @intCast(end_time - start_time),
        };
    }

    /// Install a package from npm registry
    fn installFromNpm(
        self: *Installer,
        spec: PackageSpec,
        options: InstallOptions,
    ) !InstallResult {
        const start_ts_ = io_helper.clockGettime();
        const start_time = @as(i64, @intCast(start_ts_.sec)) * 1000 + @divFloor(@as(i64, @intCast(start_ts_.nsec)), 1_000_000);

        const tarball_url = spec.url orelse return error.NoTarballUrl;

        if (options.verbose) std.debug.print("[verbose:npm] installFromNpm: {s} @ {s} url={s}\n", .{ spec.name, spec.version, tarball_url });

        // Determine install location
        const install_dir = if (options.project_root) |project_root| blk: {
            break :blk try std.fmt.allocPrint(
                self.allocator,
                "{s}/{s}/{s}",
                .{ project_root, self.modules_dir, spec.name },
            );
        } else blk: {
            break :blk try std.fmt.allocPrint(
                self.allocator,
                "{s}/packages/npm/{s}/{s}",
                .{ self.data_dir, spec.name, spec.version },
            );
        };
        errdefer self.allocator.free(install_dir);

        if (options.verbose) std.debug.print("[verbose:npm] install_dir={s}\n", .{install_dir});

        // Check if already installed (lightweight access check, no dir handle)
        const already_installed = !options.force and blk: {
            io_helper.accessAbsolute(install_dir, .{}) catch break :blk false;
            break :blk true;
        };

        if (already_installed) {
            if (options.verbose) std.debug.print("[verbose:npm] already installed (cached): {s}\n", .{install_dir});
            const end_ts_ = io_helper.clockGettime();
            const end_time = @as(i64, @intCast(end_ts_.sec)) * 1000 + @divFloor(@as(i64, @intCast(end_ts_.nsec)), 1_000_000);
            return InstallResult{
                .name = try self.allocator.dupe(u8, spec.name),
                .version = try self.allocator.dupe(u8, spec.version),
                .install_path = install_dir,
                .from_cache = true,
                .install_time_ms = @intCast(end_time - start_time),
            };
        }

        // Content-addressed tarball cache: check if we already have this tarball on disk
        const cached_tarball = self.cache.get(spec.name, spec.version) catch null;
        const tarball_data = if (cached_tarball) |meta| blk: {
            if (options.verbose) std.debug.print("[verbose:npm] found cached tarball for {s} @ {s}\n", .{ spec.name, spec.version });
            break :blk io_helper.readFileAlloc(self.allocator, meta.cache_path, 256 * 1024 * 1024) catch null;
        } else null;

        const tarball_bytes = tarball_data orelse blk: {
            if (options.verbose) std.debug.print("[verbose:npm] downloading tarball: {s}\n", .{tarball_url});
            // Download tarball via shared connection pool with retry (handles transient failures)
            var downloaded: ?[]const u8 = null;
            var dl_attempt: u32 = 0;
            while (dl_attempt < 3) : (dl_attempt += 1) {
                if (options.verbose) std.debug.print("[verbose:npm] download attempt {d}/3 for {s}\n", .{ dl_attempt + 1, spec.name });
                downloaded = io_helper.httpGetWithClient(self.http_client, self.allocator, tarball_url) catch {
                    if (options.verbose) std.debug.print("[verbose:npm] download attempt {d} FAILED for {s}\n", .{ dl_attempt + 1, spec.name });
                    if (dl_attempt < 2) {
                        io_helper.nanosleep(0, (dl_attempt + 1) * 200 * std.time.ns_per_ms);
                        continue;
                    }
                    if (!options.quiet) {
                        style.print("  ✗ Failed to download: {s}\n", .{tarball_url});
                    }
                    return error.DownloadFailed;
                };
                if (downloaded) |d| {
                    if (d.len > 0) {
                        if (options.verbose) std.debug.print("[verbose:npm] downloaded {d} bytes for {s}\n", .{ d.len, spec.name });
                        break;
                    }
                    self.allocator.free(d);
                    downloaded = null;
                }
            }

            const dl = downloaded orelse {
                if (!options.quiet) {
                    style.print("  ✗ Empty tarball: {s}\n", .{tarball_url});
                }
                return error.DownloadFailed;
            };

            // Store in content-addressed cache for future installs
            var checksum: [32]u8 = undefined;
            std.crypto.hash.sha2.Sha256.hash(dl, &checksum, .{});
            self.cache.put(spec.name, spec.version, tarball_url, checksum, dl) catch {};

            break :blk dl;
        };
        defer self.allocator.free(tarball_bytes);

        // Create install directory
        try io_helper.makePath(install_dir);

        // Extract tarball from memory — npm tarballs have a 'package' directory inside
        if (options.verbose) std.debug.print("[verbose:npm] extracting tarball ({d} bytes) to {s}\n", .{ tarball_bytes.len, install_dir });
        {
            var dest = try io_helper.cwd().openDir(io_helper.io, install_dir, .{});
            defer dest.close(io_helper.io);

            var input_reader: std.Io.Reader = .fixed(tarball_bytes);
            var window_buf: [65536]u8 = undefined;
            var decompressor: std.compress.flate.Decompress = .init(&input_reader, .gzip, &window_buf);
            // Use diagnostics to tolerate duplicate tar entries (some npm packages
            // have the same file listed twice, e.g. ts-mocker's dist/bin/cli.js)
            var tar_diagnostics: std.tar.Diagnostics = .{ .allocator = self.allocator };
            defer tar_diagnostics.deinit();
            std.tar.pipeToFileSystem(io_helper.io, dest, &decompressor.reader, .{
                .strip_components = 1,
                .diagnostics = &tar_diagnostics,
            }) catch {
                if (options.verbose) std.debug.print("[verbose:npm] EXTRACTION FAILED for {s}\n", .{spec.name});
                if (!options.quiet) {
                    style.print("  ✗ Failed to extract {s} — skipping\n", .{spec.name});
                }
                io_helper.deleteTree(install_dir) catch {};
                return error.ExtractionFailed;
            };
        }
        if (options.verbose) std.debug.print("[verbose:npm] extraction complete for {s}\n", .{spec.name});

        // Create shims for npm package binaries
        if (options.project_root) |project_root| {
            if (options.verbose) std.debug.print("[verbose:npm] creating shims for {s} in {s}/{s}/.bin\n", .{ spec.name, project_root, self.modules_dir });
            try self.createNpmShims(project_root, spec.name, install_dir);
            if (options.verbose) std.debug.print("[verbose:npm] shims created for {s}\n", .{spec.name});
        }

        // Record in hoisted cache so future encounters skip filesystem checks
        if (options.project_root != null) {
            self.hoisted_versions.put(spec.name, spec.version);
        }

        // Resolve transitive dependencies (dependencies + peerDependencies)
        // Skip if the caller will handle transitive resolution (e.g. installTransitiveDepInner)
        if (!options.skip_transitive_resolution) {
            if (options.project_root) |project_root| {
                if (options.verbose) std.debug.print("[verbose:npm] resolving transitive deps for {s}\n", .{spec.name});
                self.resolveTransitiveDeps(install_dir, project_root, 0) catch |err| {
                    if (options.verbose) std.debug.print("[verbose:npm] transitive deps FAILED for {s}: {}\n", .{ spec.name, err });
                    style.print("Warning: Failed to resolve transitive deps for {s}: {}\n", .{ spec.name, err });
                };
            }
        }

        const end_ts_ = io_helper.clockGettime();
        const end_time = @as(i64, @intCast(end_ts_.sec)) * 1000 + @divFloor(@as(i64, @intCast(end_ts_.nsec)), 1_000_000);

        if (options.verbose) std.debug.print("[verbose:npm] installFromNpm complete: {s} @ {s} ({d}ms)\n", .{ spec.name, spec.version, @as(u64, @intCast(end_time - start_time)) });

        return InstallResult{
            .name = try self.allocator.dupe(u8, spec.name),
            .version = try self.allocator.dupe(u8, spec.version),
            .install_path = install_dir,
            .from_cache = false,
            .install_time_ms = @intCast(end_time - start_time),
        };
    }

    // ========================================================================
    // Transitive Dependency Resolution
    // ========================================================================

    pub const NpmResolution = struct {
        version: []const u8,
        tarball_url: []const u8,
        integrity: ?[]const u8 = null, // sha512-... or shasum
    };

    /// Extended resolution result that includes transitive dependency info.
    /// Used by the parallel pipeline to resolve the full dep tree from metadata alone.
    pub const NpmResolutionWithDeps = struct {
        version: []const u8,
        tarball_url: []const u8,
        integrity: ?[]const u8 = null,
        dependencies: []DepEntry,

        pub const DepEntry = struct {
            name: []const u8,
            version_constraint: []const u8,
            is_optional: bool,
        };

        pub fn deinit(self: *NpmResolutionWithDeps, allocator: std.mem.Allocator) void {
            allocator.free(self.version);
            allocator.free(self.tarball_url);
            if (self.integrity) |i| allocator.free(i);
            for (self.dependencies) |dep| {
                allocator.free(dep.name);
                allocator.free(dep.version_constraint);
            }
            allocator.free(self.dependencies);
        }
    };

    /// Collected dependency entry for batch processing.
    const CollectedDep = struct {
        name: []const u8, // owned (allocator.dupe)
        version: []const u8, // owned (allocator.dupe)
        is_optional: bool,
    };

    /// Thread context for BFS parallel transitive dependency resolution.
    /// Workers pick deps from a shared atomic index, resolve + install each one,
    /// and store the resulting install path for the next BFS wave.
    const BfsDepThreadCtx = struct {
        installer: *Installer,
        deps: []const CollectedDep,
        results: []?[]const u8, // install paths for next wave (null = skipped/failed)
        project_root: []const u8,
        next: *std.atomic.Value(usize),

        fn worker(ctx: *BfsDepThreadCtx) void {
            while (true) {
                const i = ctx.next.fetchAdd(1, .monotonic);
                if (i >= ctx.deps.len) break;

                const dep = ctx.deps[i];
                const install_path = ctx.installer.installSingleTransitiveDep(
                    dep.name,
                    dep.version,
                    ctx.project_root,
                    dep.is_optional,
                );
                ctx.results[i] = install_path;
            }
        }
    };

    /// Install a single transitive dependency (used by BFS workers).
    /// Returns the install path (caller-owned) on success, or null on skip/failure.
    /// Handles hoisted cache check, circular dep detection, version conflict nesting,
    /// npm resolution, and download+extract. Does NOT recurse — BFS handles the next wave.
    fn installSingleTransitiveDep(
        self: *Installer,
        name: []const u8,
        version_constraint: []const u8,
        project_root: []const u8,
        is_optional: bool,
    ) ?[]const u8 {
        if (self.verbose) std.debug.print("[verbose:transitive] installSingleTransitiveDep: {s} @ {s} (optional={})\n", .{ name, version_constraint, is_optional });
        return self.installSingleTransitiveDepInner(name, version_constraint, project_root) catch |err| {
            if (self.verbose) std.debug.print("[verbose:transitive] FAILED: {s} @ {s}: {}\n", .{ name, version_constraint, err });
            if (!is_optional and !style.isCI()) {
                style.print("    ! {s}: {}\n", .{ name, err });
            }
            return null;
        };
    }

    /// Inner implementation for installSingleTransitiveDep (returns error union).
    fn installSingleTransitiveDepInner(
        self: *Installer,
        name: []const u8,
        version_constraint: []const u8,
        project_root: []const u8,
    ) !?[]const u8 {
        // 0. Fast path: check in-memory hoisted cache (no filesystem I/O needed)
        if (self.hoisted_versions.checkSatisfies(name, version_constraint)) return null;

        // 1. Check if already installed at hoisted location (use stack buffer for path check)
        var exist_buf: [std.fs.max_path_bytes]u8 = undefined;
        const existing_dir = std.fmt.bufPrint(&exist_buf, "{s}/{s}/{s}", .{ project_root, self.modules_dir, name }) catch
            try std.fmt.allocPrint(self.allocator, "{s}/{s}/{s}", .{ project_root, self.modules_dir, name });
        const exist_is_heap = existing_dir.ptr != &exist_buf;
        defer if (exist_is_heap) self.allocator.free(@constCast(existing_dir));

        // Determine install root: hoisted (project_root) by default, nested on conflict
        var install_root = project_root;

        const already_installed = blk: {
            io_helper.accessAbsolute(existing_dir, .{}) catch break :blk false;
            break :blk true;
        };

        if (already_installed) {
            // Read existing package.json version to check if it satisfies the constraint
            var pj_buf: [std.fs.max_path_bytes]u8 = undefined;
            const pj_path = std.fmt.bufPrint(&pj_buf, "{s}/package.json", .{existing_dir}) catch return null;

            const pj_content = io_helper.readFileAlloc(self.allocator, pj_path, 1024 * 1024) catch return null;
            defer self.allocator.free(pj_content);

            const pj_parsed = std.json.parseFromSlice(std.json.Value, self.allocator, pj_content, .{}) catch return null;
            defer pj_parsed.deinit();

            if (pj_parsed.value != .object) return null;
            const ver_val = pj_parsed.value.object.get("version") orelse return null;
            if (ver_val != .string) return null;

            const npm_zig = @import("../registry/npm.zig");
            const constraint = npm_zig.SemverConstraint.parse(version_constraint) catch return null;
            if (constraint.satisfies(ver_val.string)) {
                // Cache this result so future lookups skip filesystem entirely
                self.hoisted_versions.put(name, ver_val.string);
                return null;
            }

            // Version conflict: cannot nest in BFS (no parent_dir context), skip
            // The old DFS would install nested under parent, but BFS processes deps in waves
            // without tracking which parent requested them. In practice, version conflicts
            // at the hoisted level are rare and the first-installed version wins.
            _ = &install_root; // suppress unused
            return null;
        }

        // 2. Circular dependency check
        const install_key = std.fmt.allocPrint(self.allocator, "npm:{s}", .{name}) catch return null;
        defer self.allocator.free(install_key);

        if (!(self.installing_stack.tryPut(install_key) catch return null)) return null;
        defer self.installing_stack.remove(install_key);

        // 3. Resolve via npm registry directly
        const npm_info = self.resolveNpmPackage(name, version_constraint) catch return null;
        defer self.allocator.free(npm_info.version);
        defer self.allocator.free(npm_info.tarball_url);
        defer if (npm_info.integrity) |int| self.allocator.free(int);

        const spec = PackageSpec{
            .name = name,
            .version = npm_info.version,
            .source = .npm,
            .url = npm_info.tarball_url,
        };

        var result = self.installFromNpm(spec, .{
            .project_root = install_root,
            .quiet = true,
            .skip_transitive_resolution = true, // BFS handles the next wave
        }) catch return null;

        // Only print if actually installed (not cached), suppress in CI
        if (!result.from_cache and !style.isCI()) {
            style.print("    + {s}@{s}\n", .{ name, npm_info.version });
        }

        // Return the install path so BFS can enqueue it for the next wave
        const path = self.allocator.dupe(u8, result.install_path) catch null;
        result.deinit(self.allocator);
        return path;
    }

    /// Collect dependencies from a package.json file into the output list.
    /// Reads "dependencies" and "peerDependencies" (skips devDependencies).
    /// Handles npm aliases, workspace refs, optional peers.
    /// Skips deps already satisfied by the hoisted cache.
    fn collectDepsFromPackageJson(
        self: *Installer,
        package_dir: []const u8,
        out: *std.ArrayList(CollectedDep),
    ) void {
        // Read package.json from the installed package (stack buffer for path)
        var pjp_buf: [std.fs.max_path_bytes]u8 = undefined;
        const pkg_json_path = std.fmt.bufPrint(&pjp_buf, "{s}/package.json", .{package_dir}) catch {
            const heap_path = std.fmt.allocPrint(self.allocator, "{s}/package.json", .{package_dir}) catch return;
            defer self.allocator.free(heap_path);
            self.collectDepsFromPackageJsonPath(heap_path, out);
            return;
        };
        self.collectDepsFromPackageJsonPath(pkg_json_path, out);
    }

    /// Inner helper: collect deps given an already-formed package.json path.
    fn collectDepsFromPackageJsonPath(
        self: *Installer,
        pkg_json_path: []const u8,
        out: *std.ArrayList(CollectedDep),
    ) void {
        const content = io_helper.readFileAlloc(self.allocator, pkg_json_path, 10 * 1024 * 1024) catch return;
        defer self.allocator.free(content);

        const parsed = std.json.parseFromSlice(std.json.Value, self.allocator, content, .{}) catch return;
        defer parsed.deinit();

        if (parsed.value != .object) return;

        // Process dependencies and peerDependencies (skip devDependencies)
        const sections = [_][]const u8{ "dependencies", "peerDependencies" };
        const peer_meta = parsed.value.object.get("peerDependenciesMeta");

        for (sections) |section_key| {
            const deps_val = parsed.value.object.get(section_key) orelse continue;
            if (deps_val != .object) continue;

            const is_peer_section = std.mem.eql(u8, section_key, "peerDependencies");

            var it = deps_val.object.iterator();
            while (it.next()) |entry| {
                const dep_name = entry.key_ptr.*;
                const dep_version_val = entry.value_ptr.*;

                var dep_version: []const u8 = if (dep_version_val == .string) dep_version_val.string else "latest";

                // Skip workspace references (monorepo internal deps)
                if (std.mem.startsWith(u8, dep_version, "workspace:")) continue;

                // Handle npm aliases: "npm:actual-package@^1.0.0" → resolve actual name + constraint
                var actual_name: []const u8 = dep_name;
                if (std.mem.startsWith(u8, dep_version, "npm:")) {
                    const alias_spec = dep_version[4..]; // strip "npm:"
                    // Find last '@' to split name@version (handle scoped packages like @scope/pkg@^1.0)
                    if (std.mem.lastIndexOf(u8, alias_spec, "@")) |at_idx| {
                        if (at_idx > 0) {
                            actual_name = alias_spec[0..at_idx];
                            dep_version = alias_spec[at_idx + 1 ..];
                        }
                    } else {
                        // No version in alias, just a package name
                        actual_name = alias_spec;
                        dep_version = "latest";
                    }
                }

                // Fast path: check in-memory hoisted cache before any I/O
                if (self.hoisted_versions.checkSatisfies(actual_name, dep_version)) continue;

                // Determine if this is an optional peer dependency
                var is_optional = false;
                if (is_peer_section) {
                    if (peer_meta) |meta| {
                        if (meta == .object) {
                            if (meta.object.get(dep_name)) |dep_meta| {
                                if (dep_meta == .object) {
                                    if (dep_meta.object.get("optional")) |opt_val| {
                                        if (opt_val == .bool and opt_val.bool) {
                                            is_optional = true;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                out.append(self.allocator, .{
                    .name = self.allocator.dupe(u8, actual_name) catch continue,
                    .version = self.allocator.dupe(u8, dep_version) catch continue,
                    .is_optional = is_optional,
                }) catch continue;
            }
        }
    }

    /// Resolve transitive dependencies using breadth-first parallel resolution.
    /// Instead of DFS recursion (which serializes at depth >= 1), this processes
    /// dependencies in waves: each wave collects all deps from the current level,
    /// resolves+installs them in parallel, then enqueues the newly installed
    /// package dirs for the next wave. This maximizes HTTP concurrency across
    /// all depth levels.
    fn resolveTransitiveDeps(
        self: *Installer,
        package_dir: []const u8,
        project_root: []const u8,
        depth: u32,
    ) !void {
        const max_depth: u32 = 50;
        if (depth >= max_depth) {
            if (self.verbose) std.debug.print("[verbose:bfs] max depth ({d}) reached, stopping\n", .{max_depth});
            return;
        }
        if (self.verbose) std.debug.print("[verbose:bfs] resolveTransitiveDeps: depth={d}, pkg_dir={s}\n", .{ depth, package_dir });

        // BFS work queue: directories of packages whose deps need resolving
        var work_queue: std.ArrayList([]const u8) = .empty;
        defer {
            for (work_queue.items) |item| self.allocator.free(item);
            work_queue.deinit(self.allocator);
        }

        // Seed with initial package directory
        const initial_dir = self.allocator.dupe(u8, package_dir) catch return;
        work_queue.append(self.allocator, initial_dir) catch {
            self.allocator.free(initial_dir);
            return;
        };

        var current_depth: u32 = depth;

        while (work_queue.items.len > 0 and current_depth < max_depth) {
            // Take current batch and clear the queue for the next wave
            const batch_len = work_queue.items.len;
            const current_batch = self.allocator.alloc([]const u8, batch_len) catch break;
            @memcpy(current_batch, work_queue.items[0..batch_len]);
            work_queue.clearRetainingCapacity();

            // Phase 1: Read all package.json files and collect deps
            var all_deps: std.ArrayList(CollectedDep) = .empty;

            for (current_batch) |pkg_dir| {
                self.collectDepsFromPackageJson(pkg_dir, &all_deps);
            }

            // Free batch dirs — we're done reading their package.json files
            for (current_batch) |dir| self.allocator.free(dir);
            self.allocator.free(current_batch);

            if (all_deps.items.len == 0) {
                for (all_deps.items) |dep| {
                    self.allocator.free(@constCast(dep.name));
                    self.allocator.free(@constCast(dep.version));
                }
                all_deps.deinit(self.allocator);
                break;
            }

            // Deduplicate: if two packages in this wave both depend on "lodash@^4",
            // we only need to resolve+install it once. Use hoisted cache for dedup.
            var unique_deps: std.ArrayList(CollectedDep) = .empty;
            {
                // Track names we've already added in this wave to avoid duplicates
                var seen = std.StringHashMap(void).init(self.allocator);
                defer seen.deinit(self.allocator);

                for (all_deps.items) |dep| {
                    // Re-check hoisted cache (may have been populated by previous wave)
                    if (self.hoisted_versions.checkSatisfies(dep.name, dep.version)) {
                        self.allocator.free(@constCast(dep.name));
                        self.allocator.free(@constCast(dep.version));
                        continue;
                    }
                    if (seen.contains(dep.name)) {
                        self.allocator.free(@constCast(dep.name));
                        self.allocator.free(@constCast(dep.version));
                        continue;
                    }
                    seen.put(dep.name, {}) catch {};
                    unique_deps.append(self.allocator, dep) catch {
                        self.allocator.free(@constCast(dep.name));
                        self.allocator.free(@constCast(dep.version));
                        continue;
                    };
                }
            }
            // all_deps items have been moved to unique_deps or freed; just deinit the list
            all_deps.deinit(self.allocator);

            if (unique_deps.items.len == 0) {
                unique_deps.deinit(self.allocator);
                break;
            }

            // Phase 2: Resolve and install ALL deps for this wave in parallel
            const results = self.allocator.alloc(?[]const u8, unique_deps.items.len) catch {
                // Fallback: free deps and bail
                for (unique_deps.items) |dep| {
                    self.allocator.free(@constCast(dep.name));
                    self.allocator.free(@constCast(dep.version));
                }
                unique_deps.deinit(self.allocator);
                break;
            };
            for (results) |*r| r.* = null;

            if (self.verbose) std.debug.print("[verbose:bfs] wave at depth={d}: {d} unique deps to resolve\n", .{ current_depth, unique_deps.items.len });

            var next_idx = std.atomic.Value(usize).init(0);
            var ctx = BfsDepThreadCtx{
                .installer = self,
                .deps = unique_deps.items,
                .results = results,
                .next = &next_idx,
                .project_root = project_root,
            };

            // Use a thread pool for parallel resolution. Cap at 3 to keep total concurrent
            // HTTP connections within bounds (8 top-level threads × 3 BFS = 24, within the
            // 32-slot connection pool). Higher values cause hangs from connection exhaustion.
            const max_bfs_threads: usize = 3;
            const thread_count = @min(unique_deps.items.len, max_bfs_threads);

            if (thread_count <= 1) {
                BfsDepThreadCtx.worker(&ctx);
            } else {
                const spawned = thread_count - 1; // main thread participates too
                var threads = self.allocator.alloc(?std.Thread, spawned) catch {
                    BfsDepThreadCtx.worker(&ctx);
                    break;
                };
                defer self.allocator.free(threads);
                for (threads) |*t| t.* = null;

                for (0..spawned) |t| {
                    threads[t] = std.Thread.spawn(.{}, BfsDepThreadCtx.worker, .{&ctx}) catch null;
                }

                BfsDepThreadCtx.worker(&ctx);

                for (threads) |*t| {
                    if (t.*) |thread| {
                        thread.join();
                        t.* = null;
                    }
                }
            }

            if (self.verbose) std.debug.print("[verbose:bfs] wave at depth={d} complete\n", .{current_depth});

            // Free collected deps (names/versions were borrowed during install)
            for (unique_deps.items) |dep| {
                self.allocator.free(@constCast(dep.name));
                self.allocator.free(@constCast(dep.version));
            }
            unique_deps.deinit(self.allocator);

            // Collect newly installed package dirs for the next BFS wave
            var enqueued: usize = 0;
            for (results) |r| {
                if (r) |install_path| {
                    work_queue.append(self.allocator, install_path) catch {
                        self.allocator.free(install_path);
                        continue;
                    };
                    enqueued += 1;
                }
            }
            self.allocator.free(results);

            if (enqueued == 0) break;
            current_depth += 1;
        }
    }

    /// Install an optional transitive peer dependency.
    /// Silently skips if the package can't be resolved (optional peers are best-effort).
    fn installOptionalTransitiveDep(
        self: *Installer,
        name: []const u8,
        version_constraint: []const u8,
        project_root: []const u8,
        parent_package_dir: []const u8,
        depth: u32,
    ) void {
        self.installTransitiveDepInner(name, version_constraint, project_root, parent_package_dir, depth) catch {
            // Optional peer dep — silently skip on failure
        };
    }

    /// Install a single transitive dependency.
    /// Checks already-installed, circular deps, then resolves via Pantry DynamoDB or npm.
    /// Returns void (not error union) — all errors are handled internally.
    fn installTransitiveDep(
        self: *Installer,
        name: []const u8,
        version_constraint: []const u8,
        project_root: []const u8,
        parent_package_dir: []const u8,
        depth: u32,
    ) void {
        self.installTransitiveDepInner(name, version_constraint, project_root, parent_package_dir, depth) catch |err| {
            if (!style.isCI()) style.print("    ! {s}: {}\n", .{ name, err });
        };
    }

    fn installTransitiveDepInner(
        self: *Installer,
        name: []const u8,
        version_constraint: []const u8,
        project_root: []const u8,
        parent_package_dir: []const u8,
        depth: u32,
    ) !void {
        // 0. Fast path: check in-memory hoisted cache (no filesystem I/O needed)
        if (self.hoisted_versions.checkSatisfies(name, version_constraint)) return;

        // 1. Check if already installed at hoisted location (use stack buffer for path check)
        var exist_buf: [std.fs.max_path_bytes]u8 = undefined;
        const existing_dir = std.fmt.bufPrint(&exist_buf, "{s}/{s}/{s}", .{ project_root, self.modules_dir, name }) catch
            try std.fmt.allocPrint(self.allocator, "{s}/{s}/{s}", .{ project_root, self.modules_dir, name });
        const exist_is_heap = existing_dir.ptr != &exist_buf;
        defer if (exist_is_heap) self.allocator.free(@constCast(existing_dir));

        // Determine install root: hoisted (project_root) by default, nested (parent_package_dir) on conflict
        var install_root = project_root;

        const already_installed = blk: {
            io_helper.accessAbsolute(existing_dir, .{}) catch break :blk false;
            break :blk true;
        };

        if (already_installed) {
            // Read existing package.json version to check if it satisfies the constraint
            var pj_buf: [std.fs.max_path_bytes]u8 = undefined;
            const pj_path = std.fmt.bufPrint(&pj_buf, "{s}/package.json", .{existing_dir}) catch return;

            const pj_content = io_helper.readFileAlloc(self.allocator, pj_path, 1024 * 1024) catch return;
            defer self.allocator.free(pj_content);

            const pj_parsed = std.json.parseFromSlice(std.json.Value, self.allocator, pj_content, .{}) catch return;
            defer pj_parsed.deinit();

            if (pj_parsed.value != .object) return;
            const ver_val = pj_parsed.value.object.get("version") orelse return;
            if (ver_val != .string) return;

            const npm_zig = @import("../registry/npm.zig");
            const constraint = npm_zig.SemverConstraint.parse(version_constraint) catch return;
            if (constraint.satisfies(ver_val.string)) {
                // Cache this result so future lookups skip filesystem entirely
                self.hoisted_versions.put(name, ver_val.string);
                return;
            }

            // Version conflict: install nested under the parent package instead
            install_root = parent_package_dir;
        }

        // 2. Circular dependency check
        const install_key = try std.fmt.allocPrint(self.allocator, "npm:{s}", .{name});
        defer self.allocator.free(install_key);

        if (!try self.installing_stack.tryPut(install_key)) return;
        defer self.installing_stack.remove(install_key);

        // 3. Resolve via npm registry directly
        // (Skip Pantry DynamoDB/S3 lookup for transitive deps — spawning `aws` CLI subprocess
        //  per dep is extremely slow and npm packages are never in Pantry's registry anyway)
        const npm_info = try self.resolveNpmPackage(name, version_constraint);
        defer self.allocator.free(npm_info.version);
        defer self.allocator.free(npm_info.tarball_url);

        const spec = PackageSpec{
            .name = name,
            .version = npm_info.version,
            .source = .npm,
            .url = npm_info.tarball_url,
        };

        var result = try self.installFromNpm(spec, .{
            .project_root = install_root,
            .quiet = true,
            .skip_transitive_resolution = true, // We handle recursion here
        });

        // Only print if actually installed (not already cached/installed), and suppress in CI
        if (!result.from_cache and !style.isCI()) {
            style.print("    + {s}@{s}\n", .{ name, npm_info.version });
        }

        // Recurse into this dep's deps
        self.resolveTransitiveDeps(result.install_path, project_root, depth) catch {};
        result.deinit(self.allocator);
    }

    /// Query npm registry to resolve a version constraint to a concrete version + tarball URL.
    /// Uses a two-level cache: L1 caches raw registry JSON by package name (avoids duplicate
    /// HTTP fetches for the same package with different constraints), L2 caches resolved
    /// version+tarball by name@constraint (avoids duplicate JSON parsing).
    /// Uses native HTTP via io_helper.httpGet (std.http.Client with TLS, redirects, decompression).
    pub fn resolveNpmPackage(
        self: *Installer,
        name: []const u8,
        version_constraint: []const u8,
    ) !NpmResolution {
        if (self.verbose) std.debug.print("[verbose:resolve] resolveNpmPackage: {s} @ {s}\n", .{ name, version_constraint });

        // --- Level 2 cache check: exact name@constraint match ---
        // Perf: Stack buffer for cache key (avoids heap alloc on every resolve call)
        var cache_key_stack: [512]u8 = undefined;
        const cache_key = std.fmt.bufPrint(&cache_key_stack, "{s}@{s}", .{ name, version_constraint }) catch
            try std.fmt.allocPrint(self.allocator, "{s}@{s}", .{ name, version_constraint });
        const cache_key_is_heap = (name.len + 1 + version_constraint.len > 512);
        defer if (cache_key_is_heap) self.allocator.free(cache_key);

        if (self.npm_cache.getResolution(cache_key, self.allocator)) |cached| {
            if (self.verbose) std.debug.print("[verbose:resolve] L2 cache hit: {s} -> {s}\n", .{ cache_key, cached.version });
            return cached;
        }

        // --- Lockfile-first resolution: skip npm registry entirely if locked ---
        if (self.lockfile) |lf| {
            const lockfile_zig = @import("../deps/resolution/lockfile.zig");
            if (lockfile_zig.getLockedVersion(lf, name)) |locked| {
                // Verify the locked version satisfies the constraint
                const npm_zig = @import("../registry/npm.zig");
                const constraint = npm_zig.SemverConstraint.parse(version_constraint) catch null;
                const satisfies = if (constraint) |c| c.satisfies(locked.version) else true;

                if (satisfies) {
                    // Build tarball URL from locked resolved field or npm convention
                    const tarball_url = if (locked.resolved.len > 0 and !std.mem.startsWith(u8, locked.resolved, "registry:"))
                        try self.allocator.dupe(u8, locked.resolved)
                    else
                        try std.fmt.allocPrint(self.allocator, "https://registry.npmjs.org/{s}/-/{s}-{s}.tgz", .{
                            name,
                            // Strip scope prefix for tarball filename (e.g. @types/node → node)
                            if (std.mem.indexOf(u8, name, "/")) |slash_idx| name[slash_idx + 1 ..] else name,
                            locked.version,
                        });

                    const result = NpmResolution{
                        .version = try self.allocator.dupe(u8, locked.version),
                        .tarball_url = tarball_url,
                        .integrity = if (locked.integrity) |i| (self.allocator.dupe(u8, i) catch null) else null,
                    };

                    // Cache the lockfile resolution for future lookups
                    self.npm_cache.putResolution(cache_key, result.version, result.tarball_url, result.integrity);
                    return result;
                }
            }
        }

        // --- Level 1 cache: get or fetch raw registry JSON ---
        const npm_response = if (self.npm_cache.getRegistryJson(name, self.allocator)) |cached_json|
            cached_json
        else blk: {
            // Fetch from npm registry using native HTTP (no curl subprocess)
            // Uses custom registry from .npmrc if configured, otherwise default npm registry
            const registry_base = self.custom_registry_url orelse "https://registry.npmjs.org";
            // Perf: Stack buffer for npm registry URL (avoids heap alloc per package)
            var npm_url_buf: [1024]u8 = undefined;
            const npm_url = std.fmt.bufPrint(&npm_url_buf, "{s}/{s}", .{ registry_base, name }) catch
                try std.fmt.allocPrint(self.allocator, "{s}/{s}", .{ registry_base, name });
            const npm_url_is_heap = (registry_base.len + 1 + name.len > 1024);
            defer if (npm_url_is_heap) self.allocator.free(npm_url);

            // Retry up to 3 times with brief backoff for transient failures
            // Uses shared HTTP client for connection pooling (reuses TCP/TLS connections)
            var response_body: ?[]const u8 = null;
            var attempt: u32 = 0;
            while (attempt < 3) : (attempt += 1) {
                response_body = io_helper.httpGetWithClient(self.http_client, self.allocator, npm_url) catch {
                    if (attempt < 2) {
                        io_helper.nanosleep(0, (attempt + 1) * 50 * std.time.ns_per_ms);
                        continue;
                    }
                    return error.NpmRegistryUnavailable;
                };
                break;
            }
            const body = response_body orelse return error.NpmRegistryUnavailable;

            // Store in L1 cache for other threads/constraints (cache takes ownership via dupe)
            self.npm_cache.putRegistryJson(name, body);

            break :blk body;
        };
        defer self.allocator.free(npm_response);

        if (npm_response.len == 0) return error.NpmRegistryUnavailable;

        // --- Parse and resolve ---
        const parsed = std.json.parseFromSlice(std.json.Value, self.allocator, npm_response, .{}) catch {
            return error.InvalidNpmResponse;
        };
        defer parsed.deinit();

        if (parsed.value != .object) return error.InvalidNpmResponse;

        // Resolve version
        const target_version = try self.resolveNpmVersion(parsed.value, version_constraint);

        // Get tarball URL from versions[target_version].dist.tarball
        const versions_obj = parsed.value.object.get("versions") orelse return error.NoVersions;
        if (versions_obj != .object) return error.InvalidNpmResponse;

        const version_data = versions_obj.object.get(target_version) orelse return error.VersionNotFound;
        if (version_data != .object) return error.InvalidNpmResponse;

        const dist = version_data.object.get("dist") orelse return error.NoTarballUrl;
        if (dist != .object) return error.NoTarballUrl;

        const tarball = dist.object.get("tarball") orelse return error.NoTarballUrl;
        if (tarball != .string) return error.NoTarballUrl;

        // Perf: Determine integrity source first, dupe only once (avoids potential double-alloc)
        const integrity_str: ?[]const u8 = blk: {
            if (dist.object.get("integrity")) |i| {
                if (i == .string and i.string.len > 0) break :blk i.string;
            }
            if (dist.object.get("shasum")) |s| {
                if (s == .string and s.string.len > 0) break :blk s.string;
            }
            break :blk null;
        };
        const integrity: ?[]const u8 = if (integrity_str) |s| try self.allocator.dupe(u8, s) else null;

        const result = NpmResolution{
            .version = try self.allocator.dupe(u8, target_version),
            .tarball_url = try self.allocator.dupe(u8, tarball.string),
            .integrity = integrity,
        };

        // Store in L2 cache for other threads with same constraint
        self.npm_cache.putResolution(cache_key, result.version, result.tarball_url, result.integrity);

        return result;
    }

    /// Resolve an npm package AND extract its transitive dependency list from registry metadata.
    /// Used by the parallel pipeline (Phase 1) to build the full dependency tree without downloading tarballs.
    /// Shares the same L1/L2 cache as resolveNpmPackage().
    pub fn resolveNpmPackageWithDeps(
        self: *Installer,
        name: []const u8,
        version_constraint: []const u8,
    ) !NpmResolutionWithDeps {
        // --- L2 cache check (same as resolveNpmPackage) ---
        var cache_key_stack: [512]u8 = undefined;
        const cache_key = std.fmt.bufPrint(&cache_key_stack, "{s}@{s}", .{ name, version_constraint }) catch
            try std.fmt.allocPrint(self.allocator, "{s}@{s}", .{ name, version_constraint });
        const cache_key_is_heap = (name.len + 1 + version_constraint.len > 512);
        defer if (cache_key_is_heap) self.allocator.free(cache_key);

        // --- L3 deps cache check: if we already resolved this exact version's deps ---
        // Build version key after L2 check since we need the resolved version
        // (falls through if no L2 hit)

        // --- Lockfile-first resolution ---
        if (self.lockfile) |lf| {
            const lockfile_zig = @import("../deps/resolution/lockfile.zig");
            if (lockfile_zig.getLockedVersion(lf, name)) |locked| {
                const npm_zig = @import("../registry/npm.zig");
                const constraint = npm_zig.SemverConstraint.parse(version_constraint) catch null;
                const satisfies = if (constraint) |c| c.satisfies(locked.version) else true;

                if (satisfies) {
                    const tarball_url = if (locked.resolved.len > 0 and !std.mem.startsWith(u8, locked.resolved, "registry:"))
                        try self.allocator.dupe(u8, locked.resolved)
                    else
                        try std.fmt.allocPrint(self.allocator, "https://registry.npmjs.org/{s}/-/{s}-{s}.tgz", .{
                            name,
                            if (std.mem.indexOf(u8, name, "/")) |slash_idx| name[slash_idx + 1 ..] else name,
                            locked.version,
                        });

                    // Lockfile LockedVersion doesn't store transitive deps, so return empty.
                    // The pipeline will still discover transitive deps via registry metadata
                    // on subsequent BFS waves if needed.
                    const empty_deps = try self.allocator.alloc(NpmResolutionWithDeps.DepEntry, 0);

                    return NpmResolutionWithDeps{
                        .version = try self.allocator.dupe(u8, locked.version),
                        .tarball_url = tarball_url,
                        .integrity = if (locked.integrity) |i| (self.allocator.dupe(u8, i) catch null) else null,
                        .dependencies = empty_deps,
                    };
                }
            }
        }

        // --- L1 cache: get or fetch raw registry JSON ---
        const npm_response = if (self.npm_cache.getRegistryJson(name, self.allocator)) |cached_json|
            cached_json
        else blk: {
            const registry_base = self.custom_registry_url orelse "https://registry.npmjs.org";
            var npm_url_buf: [1024]u8 = undefined;
            const npm_url = std.fmt.bufPrint(&npm_url_buf, "{s}/{s}", .{ registry_base, name }) catch
                try std.fmt.allocPrint(self.allocator, "{s}/{s}", .{ registry_base, name });
            const npm_url_is_heap = (registry_base.len + 1 + name.len > 1024);
            defer if (npm_url_is_heap) self.allocator.free(npm_url);

            // Use abbreviated npm metadata (10-50x smaller than full JSON)
            const npm_accept_header = [_]std.http.Header{
                .{ .name = "Accept", .value = "application/vnd.npm.install-v1+json" },
            };
            var response_body: ?[]const u8 = null;
            var attempt: u32 = 0;
            while (attempt < 3) : (attempt += 1) {
                response_body = io_helper.httpGetWithClientAndHeaders(self.http_client, self.allocator, npm_url, &npm_accept_header) catch {
                    if (attempt < 2) {
                        io_helper.nanosleep(0, (attempt + 1) * 50 * std.time.ns_per_ms);
                        continue;
                    }
                    return error.NpmRegistryUnavailable;
                };
                break;
            }
            const body = response_body orelse return error.NpmRegistryUnavailable;
            // Cache in L1 so other threads/waves reuse this response
            self.npm_cache.putRegistryJson(name, body);
            break :blk body;
        };
        defer self.allocator.free(npm_response);

        if (npm_response.len == 0) return error.NpmRegistryUnavailable;

        // --- Parse, resolve, and extract deps ---
        const parsed = std.json.parseFromSlice(std.json.Value, self.allocator, npm_response, .{}) catch {
            return error.InvalidNpmResponse;
        };
        defer parsed.deinit();

        if (parsed.value != .object) return error.InvalidNpmResponse;

        const target_version = try self.resolveNpmVersion(parsed.value, version_constraint);

        const versions_obj = parsed.value.object.get("versions") orelse return error.NoVersions;
        if (versions_obj != .object) return error.InvalidNpmResponse;

        const version_data = versions_obj.object.get(target_version) orelse return error.VersionNotFound;
        if (version_data != .object) return error.InvalidNpmResponse;

        const dist = version_data.object.get("dist") orelse return error.NoTarballUrl;
        if (dist != .object) return error.NoTarballUrl;

        const tarball_val = dist.object.get("tarball") orelse return error.NoTarballUrl;
        if (tarball_val != .string) return error.NoTarballUrl;

        const integrity_str: ?[]const u8 = blk: {
            if (dist.object.get("integrity")) |i| {
                if (i == .string and i.string.len > 0) break :blk i.string;
            }
            if (dist.object.get("shasum")) |s| {
                if (s == .string and s.string.len > 0) break :blk s.string;
            }
            break :blk null;
        };

        // Extract dependencies + peerDependencies from version_data
        var deps_list = std.ArrayList(NpmResolutionWithDeps.DepEntry).empty;

        const dep_sections = [_][]const u8{ "dependencies", "peerDependencies" };
        const peer_meta = version_data.object.get("peerDependenciesMeta");

        for (dep_sections) |section| {
            const is_peer = std.mem.eql(u8, section, "peerDependencies");
            const deps_val = version_data.object.get(section) orelse continue;
            if (deps_val != .object) continue;

            var iter = deps_val.object.iterator();
            while (iter.next()) |entry| {
                if (entry.value_ptr.* != .string) continue;
                const dep_name = entry.key_ptr.*;
                const dep_version = entry.value_ptr.string;

                // Skip workspace: references
                if (std.mem.startsWith(u8, dep_version, "workspace:")) continue;

                // Check if peer dep is optional
                var is_optional = is_peer; // all peers are optional by default
                if (is_peer and peer_meta != null) {
                    if (peer_meta.?.object.get(dep_name)) |meta| {
                        if (meta == .object) {
                            if (meta.object.get("optional")) |opt| {
                                if (opt == .bool) is_optional = opt.bool;
                            }
                        }
                    }
                }

                deps_list.append(self.allocator, .{
                    .name = self.allocator.dupe(u8, dep_name) catch continue,
                    .version_constraint = self.allocator.dupe(u8, dep_version) catch continue,
                    .is_optional = is_optional,
                }) catch continue;
            }
        }

        // Cache the basic resolution in L2 for other threads
        self.npm_cache.putResolution(cache_key, target_version, tarball_val.string, integrity_str);

        return NpmResolutionWithDeps{
            .version = try self.allocator.dupe(u8, target_version),
            .tarball_url = try self.allocator.dupe(u8, tarball_val.string),
            .integrity = if (integrity_str) |s| try self.allocator.dupe(u8, s) else null,
            .dependencies = deps_list.toOwnedSlice(self.allocator) catch &.{},
        };
    }

    /// Resolve a version constraint against npm registry data.
    /// Handles "latest", "*", "^1.2.3", "~1.2.3", ">=1.0.0", exact versions.
    fn resolveNpmVersion(
        self: *Installer,
        npm_response: std.json.Value,
        constraint_str: []const u8,
    ) ![]const u8 {
        _ = self;
        const npm_zig = @import("../registry/npm.zig");

        // Handle "latest", "*", or empty
        if (std.mem.eql(u8, constraint_str, "latest") or
            std.mem.eql(u8, constraint_str, "*") or
            constraint_str.len == 0)
        {
            return getDistTagLatest(npm_response);
        }

        // Parse the constraint
        const constraint = npm_zig.SemverConstraint.parse(constraint_str) catch {
            // If parse fails, try as exact version string
            return constraint_str;
        };

        // Get versions object
        const versions_obj = npm_response.object.get("versions") orelse return error.NoVersions;
        if (versions_obj != .object) return error.InvalidNpmResponse;

        // Find highest version satisfying the constraint
        // Perf: Cache parsed best version to avoid re-parsing on every comparison
        var best_version: ?[]const u8 = null;
        var best_parsed: ?npm_zig.SemverConstraint.Version = null;
        var it = versions_obj.object.iterator();
        while (it.next()) |entry| {
            const ver = entry.key_ptr.*;
            if (constraint.satisfies(ver)) {
                if (best_version == null) {
                    best_version = ver;
                    best_parsed = npm_zig.SemverConstraint.parseVersion(ver) catch null;
                } else {
                    const cur_parsed = npm_zig.SemverConstraint.parseVersion(ver) catch continue;
                    if (best_parsed) |bp| {
                        if (cur_parsed.major > bp.major or
                            (cur_parsed.major == bp.major and cur_parsed.minor > bp.minor) or
                            (cur_parsed.major == bp.major and cur_parsed.minor == bp.minor and cur_parsed.patch > bp.patch))
                        {
                            best_version = ver;
                            best_parsed = cur_parsed;
                        }
                    } else {
                        best_version = ver;
                        best_parsed = cur_parsed;
                    }
                }
            }
        }

        return best_version orelse getDistTagLatest(npm_response);
    }

    /// Get dist-tags.latest from npm response
    fn getDistTagLatest(npm_response: std.json.Value) ![]const u8 {
        const dist_tags = npm_response.object.get("dist-tags") orelse return error.NoDistTags;
        if (dist_tags != .object) return error.InvalidNpmResponse;
        const latest = dist_tags.object.get("latest") orelse return error.NoLatestTag;
        if (latest != .string) return error.InvalidNpmResponse;
        return latest.string;
    }

    /// Compare two semver version strings. Returns >0 if a > b, <0 if a < b, 0 if equal.
    fn compareSemver(a: []const u8, b: []const u8) i32 {
        const npm_zig = @import("../registry/npm.zig");
        const va = npm_zig.SemverConstraint.parseVersion(a) catch return 0;
        const vb = npm_zig.SemverConstraint.parseVersion(b) catch return 0;

        if (va.major != vb.major) return if (va.major > vb.major) @as(i32, 1) else @as(i32, -1);
        if (va.minor != vb.minor) return if (va.minor > vb.minor) @as(i32, 1) else @as(i32, -1);
        if (va.patch != vb.patch) return if (va.patch > vb.patch) @as(i32, 1) else @as(i32, -1);
        return 0;
    }

    /// Install Zig from ziglang.org (handles both stable and dev versions)
    fn installFromZiglang(
        self: *Installer,
        spec: PackageSpec,
        options: InstallOptions,
    ) !InstallResult {
        const start_ts_ = io_helper.clockGettime();
        const start_time = @as(i64, @intCast(start_ts_.sec)) * 1000 + @divFloor(@as(i64, @intCast(start_ts_.nsec)), 1_000_000);

        // Use standard install path — same as every other package: {modules_dir}/{domain}/v{version}
        const install_dir = if (options.project_root) |project_root|
            try self.getProjectPackageDir(project_root, "ziglang.org", spec.version)
        else blk: {
            const home = try Paths.home(self.allocator);
            defer self.allocator.free(home);
            break :blk try std.fmt.allocPrint(
                self.allocator,
                "{s}/.pantry/global/packages/ziglang.org/v{s}",
                .{ home, spec.version },
            );
        };
        errdefer self.allocator.free(install_dir);

        // Check if already installed (lightweight access check, no dir handle)
        const already_installed = !options.force and blk: {
            io_helper.accessAbsolute(install_dir, .{}) catch break :blk false;
            break :blk true;
        };

        if (already_installed) {
            const end_ts_ = io_helper.clockGettime();
            const end_time = @as(i64, @intCast(end_ts_.sec)) * 1000 + @divFloor(@as(i64, @intCast(end_ts_.nsec)), 1_000_000);
            return InstallResult{
                .name = try self.allocator.dupe(u8, spec.name),
                .version = try self.allocator.dupe(u8, spec.version),
                .install_path = install_dir,
                .from_cache = true,
                .install_time_ms = @intCast(end_time - start_time),
            };
        }

        // Resolve semver constraints (^, ~, >=, etc.) against known versions first
        const effective_version = blk: {
            if (spec.version.len > 0 and (spec.version[0] == '^' or spec.version[0] == '~' or spec.version[0] == '>' or spec.version[0] == '<')) {
                if (semver.resolveVersion("ziglang.org", spec.version)) |resolved| {
                    if (!options.quiet) {
                        style.print("  → Resolved {s} to {s}\n", .{ spec.version, resolved });
                    }
                    break :blk resolved;
                }
                // If no match in generated.zig, fall back to latest
                if (!options.quiet) {
                    style.print("  → No match for {s}, resolving latest\n", .{spec.version});
                }
                break :blk spec.version;
            }
            break :blk spec.version;
        };

        // Resolve short dev versions like "0.16.0-dev" to full version, or "*"/"latest" to latest stable
        const resolved_version = try downloader.resolveZigDevVersion(self.allocator, effective_version);
        defer if (!std.mem.eql(u8, resolved_version, effective_version)) self.allocator.free(resolved_version);

        if (!options.quiet) {
            const is_dev = downloader.isZigDevVersion(resolved_version);
            if (is_dev) {
                if (!std.mem.eql(u8, resolved_version, spec.version)) {
                    style.print("  → Resolved {s} to {s}\n", .{ spec.version, resolved_version });
                }
                style.print("  → Downloading Zig dev from ziglang.org: {s}\n", .{resolved_version});
            } else {
                style.print("  → Downloading Zig from ziglang.org: {s}\n", .{resolved_version});
            }
        }

        // Build download URL
        const url = try downloader.buildZiglangUrl(self.allocator, resolved_version);
        defer self.allocator.free(url);

        // Create temp directory for downloading
        const home = try Paths.home(self.allocator);
        defer self.allocator.free(home);

        const temp_dir = try std.fmt.allocPrint(
            self.allocator,
            "{s}/.pantry/.tmp/zig-{s}",
            .{ home, spec.version },
        );
        defer {
            self.allocator.free(temp_dir);
            io_helper.deleteTree(temp_dir) catch {};
        }

        try io_helper.makePath(temp_dir);

        // Download the archive (Windows uses .zip, others use .tar.xz)
        const is_windows = comptime @import("builtin").os.tag == .windows;
        const archive_ext = if (is_windows) "zip" else "tar.xz";
        const archive_path = try std.fmt.allocPrint(
            self.allocator,
            "{s}/zig.{s}",
            .{ temp_dir, archive_ext },
        );
        defer self.allocator.free(archive_path);

        // Try to download
        if (options.inline_progress) |progress_opts| {
            try downloader.downloadFileInline(self.allocator, url, archive_path, progress_opts);
        } else {
            try downloader.downloadFileQuiet(self.allocator, url, archive_path, options.quiet);
        }

        // Show "extracting..." status if inline progress is enabled
        if (options.inline_progress) |progress_opts| {
            const lines_up = progress_opts.total_deps - progress_opts.line_offset;
            style.moveUp(lines_up);
            style.clearLine();
            style.print("{s}+{s} {s}@{s}{s}{s} {s}(extracting...){s}\n", .{
                style.dim,
                style.reset,
                progress_opts.pkg_name,
                style.dim,
                style.italic,
                progress_opts.pkg_version,
                style.dim,
                style.reset,
            });
            if (progress_opts.line_offset < progress_opts.total_deps - 1) {
                style.moveDown(lines_up - 1);
            }
        }

        // Extract archive to temp directory
        const extract_dir = try std.fmt.allocPrint(
            self.allocator,
            "{s}/extracted",
            .{temp_dir},
        );
        defer self.allocator.free(extract_dir);

        try io_helper.makePath(extract_dir);
        try extractor.extractArchiveQuiet(self.allocator, archive_path, extract_dir, archive_ext, options.quiet);

        // Find the actual source directory (zig archives nest contents in zig-{platform}-{arch}-{version}/)
        var extracted_handle = try io_helper.openDirAbsoluteForIteration(extract_dir);
        defer extracted_handle.close();

        var zig_source_dir: ?[]const u8 = null;
        var iter = extracted_handle.iterate();
        while (iter.next() catch null) |entry| {
            if (entry.kind == .directory and std.mem.startsWith(u8, entry.name, "zig-")) {
                zig_source_dir = try std.fmt.allocPrint(self.allocator, "{s}/{s}", .{ extract_dir, entry.name });
                break;
            }
        }

        if (zig_source_dir == null) {
            zig_source_dir = try self.allocator.dupe(u8, extract_dir);
        }
        defer self.allocator.free(zig_source_dir.?);

        // Create install directory and copy contents
        try io_helper.makePath(install_dir);
        try self.copyDirectoryStructure(zig_source_dir.?, install_dir);

        // Ensure zig binary is executable (not needed on Windows)
        if (comptime !is_windows) {
            var chmod_buf: [std.fs.max_path_bytes:0]u8 = undefined;
            const zig_path = std.fmt.bufPrint(chmod_buf[0..std.fs.max_path_bytes], "{s}/zig", .{install_dir}) catch null;
            if (zig_path) |p| {
                chmod_buf[p.len] = 0;
                _ = std.c.chmod(&chmod_buf, 0o755);
            }
        }

        // Use the standard symlink creation — same as all other packages.
        // discoverBinaries now finds executables at the package root (e.g. zig binary),
        // so no special-case symlink logic is needed here.
        if (options.project_root) |project_root| {
            try self.createProjectSymlinks(project_root, "ziglang.org", spec.version, install_dir);
        }

        const end_ts_ = io_helper.clockGettime();
        const end_time = @as(i64, @intCast(end_ts_.sec)) * 1000 + @divFloor(@as(i64, @intCast(end_ts_.nsec)), 1_000_000);

        return InstallResult{
            .name = try self.allocator.dupe(u8, spec.name),
            .version = try self.allocator.dupe(u8, resolved_version),
            .install_path = install_dir,
            .from_cache = false,
            .install_time_ms = @intCast(end_time - start_time),
        };
    }

    /// Install package globally (old behavior)
    fn installGlobal(
        self: *Installer,
        spec: PackageSpec,
        domain: []const u8,
        options: InstallOptions,
        used_cache: *bool,
        s3_url: ?[]const u8,
    ) ![]const u8 {
        const global_pkg_dir = try self.getGlobalPackageDir(domain, spec.version);
        defer self.allocator.free(global_pkg_dir);

        const from_cache = !options.force and blk: {
            io_helper.accessAbsolute(global_pkg_dir, .{}) catch break :blk false;
            break :blk true;
        };

        used_cache.* = from_cache;

        const install_path = if (from_cache) blk: {
            // Use cached package - free the unused S3 URL
            if (s3_url) |url| self.allocator.free(@constCast(url));
            break :blk try self.installFromCache(spec, "");
        } else blk: {
            // Download and install to global cache (transfers ownership of s3_url)
            break :blk try self.installFromNetwork(spec, options, s3_url);
        };

        // Create symlinks in data_dir/bin (e.g., ~/.pantry/global/bin or /usr/local/bin)
        const symlink_mod = @import("symlink.zig");
        symlink_mod.createPackageSymlinks(
            self.allocator,
            domain,
            spec.version,
            self.data_dir,
        ) catch |err| {
            // Log error but don't fail the install
            if (!style.isCI()) style.print("Warning: Failed to create symlinks: {}\n", .{err});
        };

        return install_path;
    }

    /// Install package to project's pantry directory
    fn installToProject(
        self: *Installer,
        spec: PackageSpec,
        domain: []const u8,
        project_root: []const u8,
        options: InstallOptions,
        used_cache: *bool,
        s3_url_param: ?[]const u8,
    ) ![]const u8 {
        // Track URL ownership locally so we can free on any error path
        var owned_url = s3_url_param;
        errdefer if (owned_url) |url| self.allocator.free(@constCast(url));

        const project_pkg_dir = try self.getProjectPackageDir(project_root, domain, spec.version);
        errdefer self.allocator.free(project_pkg_dir);

        if (self.verbose) std.debug.print("[verbose:project] installToProject: {s} @ {s} -> {s}\n", .{ spec.name, spec.version, project_pkg_dir });

        // Check if already installed in project (verify actual package structure, not just dir existence)
        const already_installed = !options.force and self.hasPackageStructure(project_pkg_dir);

        if (already_installed) {
            if (self.verbose) std.debug.print("[verbose:project] already installed in project: {s}\n", .{project_pkg_dir});
            // Already in pantry - free unused S3 URL, create symlinks and return
            if (owned_url) |url| {
                self.allocator.free(@constCast(url));
                owned_url = null;
            }
            used_cache.* = true;
            try self.createProjectSymlinks(project_root, domain, spec.version, project_pkg_dir);
            return project_pkg_dir;
        }

        // Check if package exists in global cache first
        const global_pkg_dir = try self.getGlobalPackageDir(domain, spec.version);
        defer self.allocator.free(global_pkg_dir);

        const has_global = blk: {
            io_helper.accessAbsolute(global_pkg_dir, .{}) catch break :blk false;
            break :blk true;
        };

        if (has_global) {
            // Copy from global cache - free unused S3 URL
            if (owned_url) |url| {
                self.allocator.free(@constCast(url));
                owned_url = null;
            }
            used_cache.* = true;
            try io_helper.makePath(project_pkg_dir);
            try self.copyDirectoryStructure(global_pkg_dir, project_pkg_dir);
            try self.createProjectSymlinks(project_root, domain, spec.version, project_pkg_dir);
            return project_pkg_dir;
        }

        // Not in global cache - download directly to project's pantry (transfers ownership of URL)
        used_cache.* = false;
        const url_to_transfer = owned_url;
        owned_url = null; // Transfer ownership BEFORE call to prevent double-free on error
        try self.downloadAndInstallToProject(spec, domain, project_pkg_dir, options, url_to_transfer);
        try self.createProjectSymlinks(project_root, domain, spec.version, project_pkg_dir);

        return project_pkg_dir;
    }

    /// Download and install package directly to project directory (bypassing global cache)
    fn downloadAndInstallToProject(self: *Installer, spec: PackageSpec, domain: []const u8, project_pkg_dir: []const u8, options: InstallOptions, transferred_url: ?[]const u8) !void {
        const home = try Paths.home(self.allocator);
        defer self.allocator.free(home);

        const temp_dir = try std.fmt.allocPrint(
            self.allocator,
            "{s}/.pantry/.tmp/{s}-{s}",
            .{ home, spec.name, spec.version },
        );
        defer self.allocator.free(temp_dir);

        try io_helper.makePath(temp_dir);
        defer io_helper.deleteTree(temp_dir) catch {};

        var downloaded = false;
        var archive_path: []const u8 = undefined;
        var used_format: []const u8 = undefined;
        var used_url: []const u8 = undefined;

        // Use transferred URL if available, otherwise do a fresh S3 lookup
        // Checks: binaries/ (publish:binary) → packages/pantry/ (publish) → fallback URL
        const s3_url: ?[]const u8 = if (transferred_url) |url|
            url
        else if (downloader.lookupS3Registry(self.allocator, domain, spec.version)) |s3_result| blk: {
            self.allocator.free(s3_result.version);
            break :blk s3_result.tarball_url;
        } else if (downloader.lookupPantryPublished(self.allocator, domain, spec.version)) |pub_result| blk: {
            self.allocator.free(pub_result.version);
            break :blk pub_result.tarball_url;
        } else blk: {
            // Fallback: construct URL directly from known pattern when S3 lookup fails
            // (e.g., when curl subprocess can't run or registry is temporarily unreachable)
            const platform = comptime plat: {
                const os_str = switch (@import("builtin").os.tag) {
                    .macos => "darwin",
                    .linux => "linux",
                    else => "linux",
                };
                const arch_str = switch (@import("builtin").cpu.arch) {
                    .aarch64 => "arm64",
                    .x86_64 => "x86-64",
                    else => "x86-64",
                };
                break :plat os_str ++ "-" ++ arch_str;
            };
            break :blk std.fmt.allocPrint(
                self.allocator,
                "https://registry.pantry.dev/binaries/{s}/{s}/{s}/{s}-{s}.tar.gz",
                .{ domain, spec.version, platform, domain, spec.version },
            ) catch null;
        };

        if (s3_url) |url| {
            const temp_archive_path = try std.fmt.allocPrint(
                self.allocator,
                "{s}/package.tar.gz",
                .{temp_dir},
            );

            const s3_ok = blk: {
                if (options.inline_progress) |progress_opts| {
                    downloader.downloadFileInline(self.allocator, url, temp_archive_path, progress_opts) catch {
                        break :blk false;
                    };
                } else {
                    downloader.downloadFileQuiet(self.allocator, url, temp_archive_path, options.quiet) catch {
                        break :blk false;
                    };
                }
                break :blk true;
            };

            if (s3_ok) {
                downloaded = true;
                archive_path = temp_archive_path;
                used_format = "tar.gz";
                used_url = url;
            } else {
                self.allocator.free(temp_archive_path);
                self.allocator.free(@constCast(url));
            }
        } else {
            if (!options.quiet) {
                style.print("  {s}(no URL resolved for {s}@{s}){s}\n", .{ style.dim, spec.name, spec.version, style.reset });
            }
        }

        if (!downloaded) {
            if (!options.quiet) {
                style.print("  Error: package {s}@{s} not found in registry\n", .{ spec.name, spec.version });
            }
            return error.DownloadFailed;
        }
        defer self.allocator.free(archive_path);
        defer self.allocator.free(@constCast(used_url));

        // Show "extracting..." status if inline progress is enabled
        if (options.inline_progress) |progress_opts| {
            const lines_up = progress_opts.total_deps - progress_opts.line_offset;
            style.moveUp(lines_up);
            style.clearLine();
            style.print("{s}+{s} {s}@{s}{s}{s} {s}(verifying...){s}\n", .{
                style.dim,
                style.reset,
                progress_opts.pkg_name,
                style.dim,
                style.italic,
                progress_opts.pkg_version,
                style.dim,
                style.reset,
            });
            if (progress_opts.line_offset < progress_opts.total_deps - 1) {
                style.moveDown(lines_up - 1);
            }
        }

        // Extract archive to temp directory with verification
        const extract_dir = try std.fmt.allocPrint(
            self.allocator,
            "{s}/extracted",
            .{temp_dir},
        );
        defer self.allocator.free(extract_dir);

        try io_helper.makePath(extract_dir);
        try extractor.extractArchiveWithVerification(self.allocator, archive_path, extract_dir, used_format, used_url, options.verbose);

        // Find the actual package root
        const package_source = try self.findPackageRoot(extract_dir, domain, spec.version);
        defer self.allocator.free(package_source);

        // Copy package contents to project directory
        try io_helper.makePath(project_pkg_dir);
        try self.copyDirectoryStructure(package_source, project_pkg_dir);

        // Fix library paths for macOS
        try libfixer.fixDirectoryLibraryPaths(self.allocator, project_pkg_dir);

        // Remove macOS quarantine/provenance xattrs so launchd can run service binaries
        if (comptime @import("builtin").os.tag == .macos) {
            _ = io_helper.childRun(self.allocator, &[_][]const u8{
                "/usr/bin/xattr", "-cr", project_pkg_dir,
            }) catch {};
        }
    }

    /// Install from cached package (global cache location)
    fn installFromCache(
        self: *Installer,
        spec: PackageSpec,
        _: []const u8,
    ) ![]const u8 {
        // Resolve package name to domain
        const pkg_registry = @import("../packages/generated.zig");
        const pkg_info = pkg_registry.getPackageByName(spec.name);
        const domain = if (pkg_info) |info| info.domain else spec.name;

        // Check if package exists in global cache
        const global_pkg_dir = try self.getGlobalPackageDir(domain, spec.version);
        defer self.allocator.free(global_pkg_dir);

        // Verify it exists (lightweight access check)
        io_helper.accessAbsolute(global_pkg_dir, .{}) catch {
            // Not in global cache - shouldn't happen if cache.has() returned true
            return error.CacheInconsistent;
        };

        // Create symlinks in environment bin directory
        try self.createEnvSymlinks(domain, spec.version, global_pkg_dir);

        // Return the global package directory (not env-specific)
        return try self.allocator.dupe(u8, global_pkg_dir);
    }

    /// Get global package directory (shared across all environments)
    /// Uses /usr/local/packages/ for system-wide global installations
    /// Or ~/.pantry/global/packages/ for user-local installations
    fn getGlobalPackageDir(self: *Installer, domain: []const u8, version: []const u8) ![]const u8 {
        // Check if we're using system-wide installation (/usr/local)
        if (std.mem.eql(u8, self.data_dir, "/usr/local")) {
            return std.fmt.allocPrint(
                self.allocator,
                "/usr/local/packages/{s}/v{s}",
                .{ domain, version },
            );
        }

        // Otherwise use user-local path (~/.pantry/global/packages/)
        const home = try Paths.home(self.allocator);
        defer self.allocator.free(home);

        return std.fmt.allocPrint(
            self.allocator,
            "{s}/.pantry/global/packages/{s}/v{s}",
            .{ home, domain, version },
        );
    }

    /// Get project-local package directory (pantry)
    fn getProjectPackageDir(self: *Installer, project_root: []const u8, domain: []const u8, version: []const u8) ![]const u8 {
        return std.fmt.allocPrint(
            self.allocator,
            "{s}/{s}/{s}/v{s}",
            .{ project_root, self.modules_dir, domain, version },
        );
    }

    /// Create symlinks in environment bin directory to global package
    fn createEnvSymlinks(self: *Installer, domain: []const u8, version: []const u8, global_pkg_dir: []const u8) !void {
        // Get package info to find which programs to symlink
        const pkg_registry = @import("../packages/generated.zig");
        const pkg_info = pkg_registry.getPackageByName(domain) orelse return;

        if (pkg_info.programs.len == 0) return;

        // Environment bin directory
        const env_bin_dir = try std.fmt.allocPrint(
            self.allocator,
            "{s}/bin",
            .{self.data_dir},
        );
        defer self.allocator.free(env_bin_dir);

        try io_helper.makePath(env_bin_dir);

        // Global package bin directory
        const global_bin_dir = try std.fmt.allocPrint(
            self.allocator,
            "{s}/bin",
            .{global_pkg_dir},
        );
        defer self.allocator.free(global_bin_dir);

        // Create symlinks for each program
        for (pkg_info.programs) |program| {
            const source = try std.fmt.allocPrint(
                self.allocator,
                "{s}/{s}",
                .{ global_bin_dir, program },
            );
            defer self.allocator.free(source);

            const link = try std.fmt.allocPrint(
                self.allocator,
                "{s}/{s}",
                .{ env_bin_dir, program },
            );
            defer self.allocator.free(link);

            // Check if source exists
            io_helper.accessAbsolute(source, .{}) catch |err| {
                if (err == error.FileNotFound) {
                    if (!style.isCI()) style.print("Warning: Program not found: {s}\n", .{source});
                    continue;
                }
                return err;
            };

            // Remove existing symlink if it exists
            io_helper.deleteFile(link) catch {};

            // Create symlink
            io_helper.symLink(source, link) catch |err| {
                if (!style.isCI()) style.print("Warning: Failed to create symlink for {s}: {}\n", .{ program, err });
            };
        }

        _ = version; // not used in current implementation
    }

    /// Create symlinks in project's pantry/.bin directory
    fn createProjectSymlinks(self: *Installer, project_root: []const u8, domain: []const u8, version: []const u8, package_dir: []const u8) !void {
        // Project bin directory (pantry/.bin)
        const project_bin_dir = try std.fmt.allocPrint(
            self.allocator,
            "{s}/{s}/.bin",
            .{ project_root, self.modules_dir },
        );
        defer self.allocator.free(project_bin_dir);

        try io_helper.makePath(project_bin_dir);

        // First, try to load bin paths from package configuration (pantry.json or package.json)
        var custom_bins_created = false;
        const config_loader = @import("../config.zig");

        // Try pantry.json first, then package.json
        const config_names = [_][]const u8{ "pantry.json", "package.json" };
        for (config_names) |config_name| {
            const config_path = try std.fmt.allocPrint(
                self.allocator,
                "{s}/{s}",
                .{ package_dir, config_name },
            );
            defer self.allocator.free(config_path);

            // Check if config file exists
            io_helper.accessAbsolute(config_path, .{}) catch continue;

            // Try to load and extract bin paths
            var config = config_loader.loadpantryConfig(self.allocator, .{
                .name = "pantry",
                .cwd = package_dir,
            }) catch continue;
            defer config.deinit();

            if (config_loader.extractBinPaths(self.allocator, config)) |maybe_bin_map| {
                if (maybe_bin_map) |bin_map_const| {
                    var bin_map = bin_map_const;
                    defer {
                        var it = bin_map.iterator();
                        while (it.next()) |entry| {
                            self.allocator.free(entry.key_ptr.*);
                            self.allocator.free(entry.value_ptr.*);
                        }
                        bin_map.deinit(self.allocator);
                    }

                    // Create symlinks for custom bin paths
                    var it = bin_map.iterator();
                    while (it.next()) |entry| {
                        const bin_name = entry.key_ptr.*;
                        const bin_path = entry.value_ptr.*;

                        const source = try std.fmt.allocPrint(
                            self.allocator,
                            "{s}/{s}",
                            .{ package_dir, bin_path },
                        );
                        defer self.allocator.free(source);

                        const link = try std.fmt.allocPrint(
                            self.allocator,
                            "{s}/{s}",
                            .{ project_bin_dir, bin_name },
                        );
                        defer self.allocator.free(link);

                        // Check if source exists
                        io_helper.accessAbsolute(source, .{}) catch |err| {
                            if (err == error.FileNotFound) {
                                if (!style.isCI()) style.print("Warning: Bin not found: {s}\n", .{source});
                                continue;
                            }
                            return err;
                        };

                        // Remove existing symlink if it exists
                        io_helper.deleteFile(link) catch {};

                        // Create symlink
                        io_helper.symLink(source, link) catch |err| {
                            if (!style.isCI()) style.print("Warning: Failed to create symlink for {s}: {}\n", .{ bin_name, err });
                            continue;
                        };

                        custom_bins_created = true;
                    }

                    // If we found and processed custom bins, we're done
                    if (custom_bins_created) return;
                }
            } else |_| {
                // Failed to extract bin paths, try next config file
                continue;
            }
        }

        // Fallback: Discover binaries in the package (using npm-aware logic)
        const symlink = @import("symlink.zig");
        const binaries = symlink.discoverBinaries(self.allocator, package_dir) catch return;
        defer {
            for (binaries) |*bin| {
                var b = bin.*;
                b.deinit(self.allocator);
            }
            self.allocator.free(binaries);
        }

        if (binaries.len == 0) return;

        // Create symlinks for each discovered binary
        for (binaries) |bin_info| {
            const link = try std.fmt.allocPrint(
                self.allocator,
                "{s}/{s}",
                .{ project_bin_dir, bin_info.name },
            );
            defer self.allocator.free(link);

            // Remove existing symlink if it exists
            io_helper.deleteFile(link) catch {};

            // Create symlink using absolute paths
            io_helper.symLink(bin_info.path, link) catch |err| {
                if (!style.isCI()) style.print("Warning: Failed to create symlink for {s}: {}\n", .{ bin_info.name, err });
            };
        }

        _ = version; // not used in current implementation
        _ = domain; // not used with new discovery method
    }

    /// Create shims for npm package binaries
    /// Reads bin config from package.json and creates cross-platform shims
    pub fn createNpmShims(self: *Installer, project_root: []const u8, package_name: []const u8, install_dir: []const u8) !void {
        const symlink_mod = @import("symlink.zig");

        if (self.verbose) std.debug.print("[verbose:shims] createNpmShims: pkg={s}, install_dir={s}\n", .{ package_name, install_dir });

        // Project bin directory (pantry/.bin)
        const shim_dir = try std.fmt.allocPrint(
            self.allocator,
            "{s}/{s}/.bin",
            .{ project_root, self.modules_dir },
        );
        defer self.allocator.free(shim_dir);

        if (self.verbose) std.debug.print("[verbose:shims] shim_dir={s}\n", .{shim_dir});

        try io_helper.makePath(shim_dir);

        // Read package.json from install directory
        const pkg_json_path = try std.fmt.allocPrint(
            self.allocator,
            "{s}/package.json",
            .{install_dir},
        );
        defer self.allocator.free(pkg_json_path);

        const pkg_content = io_helper.readFileAlloc(self.allocator, pkg_json_path, 1024 * 1024) catch {
            if (self.verbose) std.debug.print("[verbose:shims] no package.json found for {s}\n", .{package_name});
            return;
        };
        defer self.allocator.free(pkg_content);

        const parsed = std.json.parseFromSlice(std.json.Value, self.allocator, pkg_content, .{}) catch {
            if (self.verbose) std.debug.print("[verbose:shims] failed to parse package.json for {s}\n", .{package_name});
            return;
        };
        defer parsed.deinit();

        if (parsed.value != .object) return;

        // Check for bin field
        const bin_value = parsed.value.object.get("bin") orelse {
            if (self.verbose) std.debug.print("[verbose:shims] no bin field in package.json for {s}\n", .{package_name});
            return;
        };

        if (self.verbose) std.debug.print("[verbose:shims] found bin field for {s} (type={s})\n", .{ package_name, @tagName(bin_value) });

        if (bin_value == .string) {
            // Single binary with package name
            symlink_mod.createShimFromBinString(
                self.allocator,
                package_name,
                install_dir,
                bin_value.string,
                shim_dir,
            ) catch |err| {
                if (!style.isCI()) style.print("Warning: Failed to create shim: {}\n", .{err});
            };
        } else if (bin_value == .object) {
            // Multiple binaries
            symlink_mod.createShimsFromBinConfig(
                self.allocator,
                install_dir,
                bin_value,
                shim_dir,
            ) catch |err| {
                if (!style.isCI()) style.print("Warning: Failed to create shims: {}\n", .{err});
            };
        }
    }

    /// Install from network (download)
    fn installFromNetwork(self: *Installer, spec: PackageSpec, options: InstallOptions, transferred_url: ?[]const u8) ![]const u8 {
        // Resolve package name to domain
        const pkg_registry = @import("../packages/generated.zig");
        const pkg_info = pkg_registry.getPackageByName(spec.name);
        const domain = if (pkg_info) |info| info.domain else spec.name;

        // Check if already exists in global cache
        const global_pkg_dir = try self.getGlobalPackageDir(domain, spec.version);
        errdefer self.allocator.free(global_pkg_dir);

        var check_dir = io_helper.cwd().openDir(io_helper.io, global_pkg_dir, .{}) catch |err| blk: {
            if (err != error.FileNotFound) return err;
            break :blk null;
        };
        if (check_dir) |*dir| {
            dir.close(io_helper.io);
            // Already downloaded to global cache - free unused URL, create env symlinks
            if (transferred_url) |url| self.allocator.free(@constCast(url));
            try self.createEnvSymlinks(domain, spec.version, global_pkg_dir);
            return global_pkg_dir;
        }

        // Not in global cache - download and install to global location (installFromNetwork)
        const home = try Paths.home(self.allocator);
        defer self.allocator.free(home);

        const temp_dir = try std.fmt.allocPrint(
            self.allocator,
            "{s}/.pantry/.tmp/{s}-{s}",
            .{ home, spec.name, spec.version },
        );
        defer self.allocator.free(temp_dir);

        try io_helper.makePath(temp_dir);
        defer io_helper.deleteTree(temp_dir) catch {};

        var downloaded = false;
        var archive_path: []const u8 = undefined;
        var used_format: []const u8 = undefined;
        var used_url: []const u8 = undefined;

        // Use transferred URL if available, otherwise do a fresh S3 lookup
        // Checks: binaries/ (publish:binary) → packages/pantry/ (publish) → fallback URL
        const s3_url: ?[]const u8 = if (transferred_url) |url|
            url
        else if (downloader.lookupS3Registry(self.allocator, domain, spec.version)) |s3_result| blk: {
            self.allocator.free(s3_result.version);
            break :blk s3_result.tarball_url;
        } else if (downloader.lookupPantryPublished(self.allocator, domain, spec.version)) |pub_result| blk: {
            self.allocator.free(pub_result.version);
            break :blk pub_result.tarball_url;
        } else blk: {
            // Fallback: construct URL directly from known pattern when S3 lookup fails
            const platform = comptime plat: {
                const os_str = switch (@import("builtin").os.tag) {
                    .macos => "darwin",
                    .linux => "linux",
                    else => "linux",
                };
                const arch_str = switch (@import("builtin").cpu.arch) {
                    .aarch64 => "arm64",
                    .x86_64 => "x86-64",
                    else => "x86-64",
                };
                break :plat os_str ++ "-" ++ arch_str;
            };
            break :blk std.fmt.allocPrint(
                self.allocator,
                "https://registry.pantry.dev/binaries/{s}/{s}/{s}/{s}-{s}.tar.gz",
                .{ domain, spec.version, platform, domain, spec.version },
            ) catch null;
        };

        if (s3_url) |url| {
            const temp_archive_path = try std.fmt.allocPrint(
                self.allocator,
                "{s}/package.tar.gz",
                .{temp_dir},
            );

            const s3_ok = blk: {
                if (options.inline_progress) |progress_opts| {
                    downloader.downloadFileInline(self.allocator, url, temp_archive_path, progress_opts) catch {
                        break :blk false;
                    };
                } else {
                    downloader.downloadFileQuiet(self.allocator, url, temp_archive_path, options.quiet) catch {
                        break :blk false;
                    };
                }
                break :blk true;
            };

            if (s3_ok) {
                downloaded = true;
                archive_path = temp_archive_path;
                used_format = "tar.gz";
                used_url = url;
            } else {
                self.allocator.free(temp_archive_path);
                self.allocator.free(@constCast(url));
            }
        } else {
            if (!options.quiet) {
                style.print("  {s}(no URL resolved for {s}@{s} via network){s}\n", .{ style.dim, spec.name, spec.version, style.reset });
            }
        }

        if (!downloaded) {
            if (!options.quiet) {
                style.print("  Error: package {s}@{s} not found in registry\n", .{ spec.name, spec.version });
            }
            return error.DownloadFailed;
        }
        defer self.allocator.free(archive_path);
        defer self.allocator.free(@constCast(used_url));

        // Show "extracting..." status if inline progress is enabled
        if (options.inline_progress) |progress_opts| {
            const lines_up = progress_opts.total_deps - progress_opts.line_offset;
            style.moveUp(lines_up);
            style.clearLine();
            style.print("{s}+{s} {s}@{s}{s}{s} {s}(verifying...){s}\n", .{
                style.dim,
                style.reset,
                progress_opts.pkg_name,
                style.dim,
                style.italic,
                progress_opts.pkg_version,
                style.dim,
                style.reset,
            });
            if (progress_opts.line_offset < progress_opts.total_deps - 1) {
                style.moveDown(lines_up - 1);
            }
        }

        // Extract archive to temp directory with verification
        const extract_dir = try std.fmt.allocPrint(
            self.allocator,
            "{s}/extracted",
            .{temp_dir},
        );
        defer self.allocator.free(extract_dir);

        try io_helper.makePath(extract_dir);
        try extractor.extractArchiveWithVerification(self.allocator, archive_path, extract_dir, used_format, used_url, options.verbose);

        // Find the actual package root (might be nested like domain/v{version}/)
        const package_source = try self.findPackageRoot(extract_dir, domain, spec.version);
        defer self.allocator.free(package_source);

        // Copy/move package contents to global cache location
        try io_helper.makePath(global_pkg_dir);
        try self.copyDirectoryStructure(package_source, global_pkg_dir);

        // Fix library paths for macOS (especially for Node.js OpenSSL issue)
        try libfixer.fixDirectoryLibraryPaths(self.allocator, global_pkg_dir);

        // Now create symlinks in the environment bin directory
        try self.createEnvSymlinks(domain, spec.version, global_pkg_dir);

        // Return the global package directory path
        return global_pkg_dir;
    }

    /// Create symlinks for package binaries in the global bin directory
    fn createBinSymlinks(self: *Installer, domain: []const u8, version: []const u8, install_dir: []const u8) !void {
        // Get package info to find which programs to symlink
        const pkg_registry = @import("../packages/generated.zig");
        const pkg_info = pkg_registry.getPackageByName(domain) orelse return;

        if (pkg_info.programs.len == 0) return;

        // Create global bin directory
        const bin_dir = try std.fmt.allocPrint(
            self.allocator,
            "{s}/bin",
            .{self.data_dir},
        );
        defer self.allocator.free(bin_dir);

        try io_helper.makePath(bin_dir);

        // The actual binaries are in {install_dir}/{domain}/v{version}/bin/
        const actual_bin_dir = try std.fmt.allocPrint(
            self.allocator,
            "{s}/{s}/v{s}/bin",
            .{ install_dir, domain, version },
        );
        defer self.allocator.free(actual_bin_dir);

        // Create symlinks for each program
        for (pkg_info.programs) |program| {
            const source = try std.fmt.allocPrint(
                self.allocator,
                "{s}/{s}",
                .{ actual_bin_dir, program },
            );
            defer self.allocator.free(source);

            const link = try std.fmt.allocPrint(
                self.allocator,
                "{s}/{s}",
                .{ bin_dir, program },
            );
            defer self.allocator.free(link);

            // Check if source exists
            io_helper.accessAbsolute(source, .{}) catch |err| {
                if (err == error.FileNotFound) {
                    if (!style.isCI()) style.print("Warning: Program not found: {s}\n", .{source});
                    continue;
                }
                return err;
            };

            // Remove existing symlink if it exists
            io_helper.deleteFile(link) catch {};

            // Create symlink
            io_helper.symLink(source, link) catch |err| {
                if (!style.isCI()) style.print("Warning: Failed to create symlink for {s}: {}\n", .{ program, err });
            };
        }
    }

    /// Get installation directory for package
    fn getInstallDir(self: *Installer, name: []const u8, version: []const u8) ![]const u8 {
        return std.fmt.allocPrint(
            self.allocator,
            "{s}/packages/{s}/{s}",
            .{ self.data_dir, name, version },
        );
    }

    /// Uninstall a package
    pub fn uninstall(self: *Installer, name: []const u8, version: []const u8) !void {
        const install_dir = try self.getInstallDir(name, version);
        defer self.allocator.free(install_dir);

        // Remove installation directory
        io_helper.deleteTree(install_dir) catch |err| switch (err) {
            error.FileNotFound => return,
            else => return err,
        };
    }

    /// List installed packages
    pub fn listInstalled(self: *Installer) !std.ArrayList(packages.InstalledPackage) {
        var installed = try std.ArrayList(packages.InstalledPackage).initCapacity(self.allocator, 16);
        errdefer installed.deinit(self.allocator);

        const packages_dir = try std.fmt.allocPrint(
            self.allocator,
            "{s}/packages",
            .{self.data_dir},
        );
        defer self.allocator.free(packages_dir);

        // Use FsDir for iteration (Io.Dir doesn't have iterate() in Zig 0.16)
        var dir = io_helper.openDirForIteration(packages_dir) catch {
            return installed;
        };
        defer dir.close();

        var it = dir.iterate();
        while (it.next() catch null) |entry| {
            if (entry.kind != .directory) continue;

            // Build full path to package directory
            const pkg_path = try std.fmt.allocPrint(
                self.allocator,
                "{s}/{s}",
                .{ packages_dir, entry.name },
            );
            defer self.allocator.free(pkg_path);

            // Each package has its own directory with version subdirectories
            var pkg_dir = io_helper.openDirForIteration(pkg_path) catch continue;
            defer pkg_dir.close();

            var ver_it = pkg_dir.iterate();
            while (ver_it.next() catch null) |ver_entry| {
                if (ver_entry.kind != .directory) continue;

                const install_path = try std.fmt.allocPrint(
                    self.allocator,
                    "{s}/{s}/{s}",
                    .{ packages_dir, entry.name, ver_entry.name },
                );

                // Use io_helper.statFile with full path
                const stat = io_helper.statFile(install_path) catch continue;

                try installed.append(self.allocator, .{
                    .name = try self.allocator.dupe(u8, entry.name),
                    .version = try self.allocator.dupe(u8, ver_entry.name),
                    .install_path = install_path,
                    .installed_at = @intCast(@divFloor(stat.ctime, std.time.ns_per_s)),
                    .size = @intCast(stat.size),
                });
            }
        }

        return installed;
    }

    /// Find the actual package root in the extracted directory
    fn findPackageRoot(self: *Installer, extract_dir: []const u8, domain: []const u8, version: []const u8) ![]const u8 {
        // Try common package layouts:
        // 1. Direct pkgx format: {domain}/v{version}/
        const pkgx_path = try std.fmt.allocPrint(
            self.allocator,
            "{s}/{s}/v{s}",
            .{ extract_dir, domain, version },
        );

        // Check if this path has the package structure (bin, lib, etc.)
        if (self.hasPackageStructure(pkgx_path)) {
            return pkgx_path;
        }
        self.allocator.free(pkgx_path);

        // 2. Try just the extract directory itself
        if (self.hasPackageStructure(extract_dir)) {
            return try self.allocator.dupe(u8, extract_dir);
        }

        // 3. Try first subdirectory
        // Use std.fs.Dir for iteration (Io.Dir doesn't have iterate() in Zig 0.16)
        var dir = try io_helper.openDirAbsoluteForIteration(extract_dir);
        defer dir.close();

        var it = dir.iterate();
        while (it.next() catch null) |entry| {
            if (entry.kind != .directory) continue;

            const subdir_path = try std.fs.path.join(
                self.allocator,
                &[_][]const u8{ extract_dir, entry.name },
            );
            defer self.allocator.free(subdir_path);

            if (self.hasPackageStructure(subdir_path)) {
                return try self.allocator.dupe(u8, subdir_path);
            }
        }

        // Fallback to extract directory
        return try self.allocator.dupe(u8, extract_dir);
    }

    /// Check if a directory has package structure (bin, lib, include, share, etc.)
    fn hasPackageStructure(self: *Installer, dir_path: []const u8) bool {
        _ = self;
        // Use std.fs.Dir for iteration (Io.Dir doesn't have iterate() in Zig 0.16)
        var dir = io_helper.openDirAbsoluteForIteration(dir_path) catch return false;
        defer dir.close();

        var it = dir.iterate();
        while (it.next() catch null) |entry| {
            if (entry.kind != .directory) continue;

            // Check for common package directories
            if (std.mem.eql(u8, entry.name, "bin") or
                std.mem.eql(u8, entry.name, "lib") or
                std.mem.eql(u8, entry.name, "include") or
                std.mem.eql(u8, entry.name, "share") or
                std.mem.eql(u8, entry.name, "sbin"))
            {
                return true;
            }
        }

        return false;
    }

    /// Copy directory structure from source to destination
    fn copyDirectoryStructure(self: *Installer, source: []const u8, dest: []const u8) !void {
        // Use std.fs.Dir for iteration (Io.Dir doesn't have iterate() in Zig 0.16)
        var src_dir = try io_helper.openDirAbsoluteForIteration(source);
        defer src_dir.close();

        // Ensure destination exists
        try io_helper.makePath(dest);

        // Check if this is a bin or sbin directory - files here need to be executable
        const is_bin_dir = std.mem.endsWith(u8, source, "/bin") or
            std.mem.endsWith(u8, source, "/sbin") or
            std.mem.eql(u8, std.fs.path.basename(source), "bin") or
            std.mem.eql(u8, std.fs.path.basename(source), "sbin");

        var it = src_dir.iterate();
        while (it.next() catch null) |entry| {
            const src_path = try std.fs.path.join(
                self.allocator,
                &[_][]const u8{ source, entry.name },
            );
            defer self.allocator.free(src_path);

            const dst_path = try std.fs.path.join(
                self.allocator,
                &[_][]const u8{ dest, entry.name },
            );
            defer self.allocator.free(dst_path);

            if (entry.kind == .directory) {
                // Recursively copy directory
                try self.copyDirectoryStructure(src_path, dst_path);
            } else if (entry.kind == .sym_link) {
                // Recreate symlink — read the target and create a new symlink at dest
                const link_target = io_helper.readLinkAlloc(self.allocator, src_path) catch continue;
                defer self.allocator.free(link_target);
                io_helper.symLink(link_target, dst_path) catch |err| switch (err) {
                    error.PathAlreadyExists => {
                        io_helper.deleteFile(dst_path) catch {};
                        io_helper.symLink(link_target, dst_path) catch {};
                    },
                    else => {},
                };
            } else {
                // Copy file using io_helper wrapper
                try io_helper.copyFile(src_path, dst_path);

                // Make files in bin directories executable
                if (is_bin_dir) {
                    self.makeExecutable(dst_path);
                }
            }
        }
    }

    /// Make a file executable (chmod +x) using native syscall
    fn makeExecutable(self: *Installer, path: []const u8) void {
        _ = self;
        var path_buf: [std.fs.max_path_bytes:0]u8 = undefined;
        if (path.len >= std.fs.max_path_bytes) return;
        @memcpy(path_buf[0..path.len], path);
        path_buf[path.len] = 0;
        const result = std.c.chmod(&path_buf, 0o755);
        if (result != 0) {
            if (!style.isCI()) style.print("Warning: chmod +x failed for {s}\n", .{path});
        }
    }

    /// Install package dependencies recursively
    fn installDependencies(self: *Installer, dependencies: []const []const u8, options: InstallOptions) !void {
        if (dependencies.len == 0) return;

        const Platform = @import("../core/platform.zig").Platform;
        const current_platform = Platform.current();

        // 1. Filter applicable dependencies (skip wrong-platform deps)
        const DepEntry = struct { dep: []const u8, is_optional: bool };
        var applicable: std.ArrayList(DepEntry) = .empty;
        defer applicable.deinit(self.allocator);

        for (dependencies) |dep_str| {
            const is_optional = std.mem.indexOf(u8, dep_str, "#") != null;

            if (std.mem.startsWith(u8, dep_str, "linux:") or
                std.mem.startsWith(u8, dep_str, "darwin:") or
                std.mem.startsWith(u8, dep_str, "windows:") or
                std.mem.startsWith(u8, dep_str, "freebsd:"))
            {
                const colon_pos = std.mem.indexOf(u8, dep_str, ":") orelse continue;
                const platform = dep_str[0..colon_pos];
                const actual_dep = dep_str[colon_pos + 1 ..];

                const matches = blk: {
                    if (std.mem.eql(u8, platform, "linux") and current_platform == .linux) break :blk true;
                    if (std.mem.eql(u8, platform, "darwin") and current_platform == .darwin) break :blk true;
                    if (std.mem.eql(u8, platform, "windows") and current_platform == .windows) break :blk true;
                    if (std.mem.eql(u8, platform, "freebsd") and current_platform == .freebsd) break :blk true;
                    break :blk false;
                };

                if (matches) {
                    applicable.append(self.allocator, .{ .dep = actual_dep, .is_optional = is_optional }) catch continue;
                }
            } else {
                applicable.append(self.allocator, .{ .dep = dep_str, .is_optional = is_optional }) catch continue;
            }
        }

        if (applicable.items.len == 0) return;

        // 2. Install in parallel using thread pool
        const DepResult = struct { err: ?anyerror, is_optional: bool };
        const results = self.allocator.alloc(DepResult, applicable.items.len) catch {
            // Fallback to sequential on alloc failure
            for (applicable.items) |item| {
                self.installDependency(item.dep, options) catch |err| {
                    if (!item.is_optional) return err;
                };
            }
            return;
        };
        defer self.allocator.free(results);
        @memset(results, .{ .err = null, .is_optional = false });

        const DepCtx = struct {
            items: []const DepEntry,
            results: []DepResult,
            next: *std.atomic.Value(usize),
            installer: *Installer,
            options: InstallOptions,

            fn worker(ctx: *@This()) void {
                while (true) {
                    const i = ctx.next.fetchAdd(1, .monotonic);
                    if (i >= ctx.items.len) break;

                    const item = ctx.items[i];
                    ctx.results[i].is_optional = item.is_optional;
                    ctx.installer.installDependency(item.dep, ctx.options) catch |err| {
                        if (!style.isCI()) style.print("  ! Failed to install dependency {s}: {}\n", .{ item.dep, err });
                        ctx.results[i].err = err;
                    };
                }
            }
        };

        var next_idx = std.atomic.Value(usize).init(0);
        var ctx = DepCtx{
            .items = applicable.items,
            .results = results,
            .next = &next_idx,
            .installer = self,
            .options = options,
        };

        const cpu_count = std.Thread.getCpuCount() catch 4;
        const max_threads = @min(cpu_count, 8);
        const thread_count = @min(applicable.items.len, max_threads);

        if (thread_count <= 1) {
            // Single dep: just run inline, no thread overhead
            DepCtx.worker(&ctx);
        } else {
            var threads: [8]?std.Thread = .{ null, null, null, null, null, null, null, null };
            for (0..thread_count) |t| {
                threads[t] = std.Thread.spawn(.{}, DepCtx.worker, .{&ctx}) catch null;
            }
            for (&threads) |*t| {
                if (t.*) |thread| {
                    thread.join();
                    t.* = null;
                }
            }
        }

        // Check for critical failures
        for (results) |result| {
            if (result.err != null and !result.is_optional) {
                return result.err.?;
            }
        }
    }

    /// Install a single dependency
    fn installDependency(self: *Installer, dep_str: []const u8, options: InstallOptions) anyerror!void {
        // Strip out comment if present (e.g., "pkg^1.0 # comment" -> "pkg^1.0")
        const dep_without_comment = blk: {
            if (std.mem.indexOf(u8, dep_str, "#")) |comment_pos| {
                // Trim whitespace before the comment
                var end = comment_pos;
                while (end > 0 and dep_str[end - 1] == ' ') {
                    end -= 1;
                }
                break :blk dep_str[0..end];
            }
            break :blk dep_str;
        };

        // Parse dependency string (name@version or name^version, etc.)
        const at_pos = std.mem.indexOfAny(u8, dep_without_comment, "@^~>=<");
        const name = if (at_pos) |pos| dep_without_comment[0..pos] else dep_without_comment;
        const raw_version = if (at_pos) |pos| dep_without_comment[pos..] else "latest";

        // Normalize @X and @X.Y to ^X and ^X.Y (treat @ as caret for major/minor versions)
        var version_owned: ?[]const u8 = null;
        defer if (version_owned) |v| self.allocator.free(v);

        const version = blk: {
            if (std.mem.startsWith(u8, raw_version, "@")) {
                const ver_without_at = raw_version[1..];
                // Count dots to see if it's @X or @X.Y (not @X.Y.Z)
                var dot_count: usize = 0;
                for (ver_without_at) |c| {
                    if (c == '.') dot_count += 1;
                }
                // If @X or @X.Y, convert to caret
                if (dot_count < 2) {
                    const normalized = try std.fmt.allocPrint(self.allocator, "^{s}", .{ver_without_at});
                    version_owned = normalized;
                    break :blk normalized;
                }
            }
            break :blk raw_version;
        };

        // Check if already installed to avoid infinite recursion
        const pkg_registry = @import("../packages/generated.zig");
        const pkg_info = pkg_registry.getPackageByName(name) orelse {
            // Package not in registry, skip
            return;
        };

        const domain = pkg_info.domain;

        // Resolve version
        const resolved_version = semver.resolveVersion(domain, version) orelse {
            if (!style.isCI()) style.print("  ! Could not resolve version for {s}{s}\n", .{ name, version });
            return error.VersionNotFound;
        };

        // Check if already installed
        const global_pkg_dir = try self.getGlobalPackageDir(domain, resolved_version);
        defer self.allocator.free(global_pkg_dir);

        var check_dir = io_helper.cwd().openDir(io_helper.io, global_pkg_dir, .{}) catch |err| {
            if (err != error.FileNotFound) return err;
            // Not installed, continue
            const spec = PackageSpec{
                .name = name,
                .version = resolved_version,
            };

            if (!style.isCI()) style.print("    → Installing dependency: {s}@{s}\n", .{ name, resolved_version });

            // Install the dependency (this will recursively install its dependencies)
            const result = self.install(spec, options) catch |e| {
                if (!style.isCI()) style.print("  ! Failed to install dependency: {}\n", .{e});
                return e;
            };
            var mut_result = result;
            defer mut_result.deinit(self.allocator);
            return;
        };
        check_dir.close(io_helper.io);

        // Already installed, skip
        if (!style.isCI()) style.print("    ✓ Dependency already installed: {s}@{s}\n", .{ name, resolved_version });
    }
};

test "Installer basic operations" {
    const allocator = std.testing.allocator;

    var pkg_cache = try PackageCache.init(allocator);
    defer pkg_cache.deinit();

    var installer = try Installer.init(allocator, &pkg_cache);
    defer installer.deinit();

    // Create a test package spec
    const spec = PackageSpec{
        .name = "test-pkg",
        .version = "1.0.0",
    };

    // Test installation (will create directory)
    var result = try installer.install(spec, .{});
    defer result.deinit(allocator);

    try std.testing.expect(result.install_path.len > 0);
    try std.testing.expectEqualStrings("test-pkg", result.name);
    try std.testing.expectEqualStrings("1.0.0", result.version);

    // Clean up
    try installer.uninstall("test-pkg", "1.0.0");
}

test "HoisteVersionCache tryReserve is single-winner" {
    var hcache = Installer.HoisteVersionCache.init(std.testing.allocator);
    defer hcache.deinit();
    try std.testing.expect(hcache.tryReserve("react", "^18"));
    // Second attempt must fail — reservation is held
    try std.testing.expect(!hcache.tryReserve("react", "^18"));
    hcache.finalizeReservation("react", "18.2.0");
    try std.testing.expect(hcache.checkSatisfies("react", "^18"));
}

test "HoisteVersionCache releaseReservation lets a retry win" {
    var hcache = Installer.HoisteVersionCache.init(std.testing.allocator);
    defer hcache.deinit();
    try std.testing.expect(hcache.tryReserve("lodash", "^4"));
    hcache.releaseReservation("lodash", "^4");
    try std.testing.expect(hcache.tryReserve("lodash", "^4"));
}

/// Report a package download to the pantry.dev analytics API.
/// Truly fire-and-forget: runs in a detached thread so installs are never blocked.
/// Perf: Analytics is fire-and-forget and non-critical. Instead of spawning a
/// detached 2MB-stack thread per package, we batch events and send them in a
/// single request at the end of the install. This eliminates thread explosion
/// during installs with many packages.
var analytics_events: std.ArrayList(AnalyticsEvent) = .empty;
var analytics_mutex: io_helper.Mutex = .{};

const AnalyticsEvent = struct {
    domain: []const u8,
    version: []const u8,
};

fn reportDownloadAnalytics(allocator: std.mem.Allocator, domain: []const u8, version: []const u8) void {
    const owned_domain = allocator.dupe(u8, domain) catch return;
    const owned_version = allocator.dupe(u8, version) catch {
        allocator.free(owned_domain);
        return;
    };
    analytics_mutex.lock();
    defer analytics_mutex.unlock();
    analytics_events.append(allocator, .{ .domain = owned_domain, .version = owned_version }) catch {
        allocator.free(owned_domain);
        allocator.free(owned_version);
    };
}

/// Flush all batched analytics events in a single detached thread.
/// Call this once after install completes.
pub fn flushAnalytics(allocator: std.mem.Allocator) void {
    analytics_mutex.lock();
    const events = analytics_events.items;
    if (events.len == 0) {
        analytics_mutex.unlock();
        return;
    }
    // Take ownership of the list, reset the global
    const owned_items = allocator.dupe(AnalyticsEvent, events) catch {
        analytics_mutex.unlock();
        return;
    };
    for (analytics_events.items) |ev| {
        allocator.free(ev.domain);
        allocator.free(ev.version);
    }
    analytics_events.clearRetainingCapacity();
    analytics_mutex.unlock();

    // Send in a single detached thread
    const thread = std.Thread.spawn(.{ .stack_size = 2 * 1024 * 1024 }, analyticsFlushWorker, .{ allocator, owned_items }) catch {
        for (owned_items) |ev| {
            allocator.free(ev.domain);
            allocator.free(ev.version);
        }
        allocator.free(owned_items);
        return;
    };
    thread.detach();
}

fn analyticsFlushWorker(allocator: std.mem.Allocator, events: []const AnalyticsEvent) void {
    defer {
        for (events) |ev| {
            allocator.free(ev.domain);
            allocator.free(ev.version);
        }
        allocator.free(events);
    }

    // Build a JSON array of events
    var buf = std.ArrayList(u8).empty;
    defer buf.deinit(allocator);
    buf.appendSlice(allocator, "[") catch return;
    for (events, 0..) |ev, i| {
        if (i > 0) buf.appendSlice(allocator, ",") catch return;
        const entry = std.fmt.allocPrint(allocator, "{{\"packageName\":\"{s}\",\"category\":\"download\",\"version\":\"{s}\"}}", .{ ev.domain, ev.version }) catch return;
        defer allocator.free(entry);
        buf.appendSlice(allocator, entry) catch return;
    }
    buf.appendSlice(allocator, "]") catch return;

    _ = io_helper.httpPostJson(allocator, "https://registry.pantry.dev/analytics/events", buf.items) catch return;
}
