const std = @import("std");
const io_helper = @import("../io_helper.zig");
const core = @import("../core/platform.zig");
const cache = @import("../cache.zig");
const packages = @import("../packages.zig");
const errors = @import("../core/error.zig");
const downloader = @import("downloader.zig");
const extractor = @import("extractor.zig");
const verified_staging = @import("verified_staging.zig");
const materialization = @import("materialization.zig");
const libfixer = @import("libfixer.zig");
const ca_certs = @import("ca_certs.zig");
const pkgx_shebang = @import("pkgx_shebang.zig");
const npm_platform = @import("npm_platform.zig");
const validator = @import("validator.zig");
const semver = @import("../packages/semver.zig");
const registry_versions_mod = @import("registry_versions.zig");
const bun_lock = @import("../deps/resolution/bun_lock.zig");
const style = @import("../cli/style.zig");

const pantryError = errors.pantryError;
const Paths = core.Paths;
const PackageCache = cache.PackageCache;
const PackageSpec = packages.PackageSpec;

/// The lockfile extraction fast path is only safe for entries that carry an
/// immutable HTTP tarball URL and an exact resolved version. Registry markers
/// and legacy constraint-only entries must go through their source-aware
/// resolver instead of being fabricated into npm tarball URLs.
fn canRestoreLockTarball(version: []const u8, resolved: []const u8) bool {
    if (!std.mem.startsWith(u8, resolved, "https://") and !std.mem.startsWith(u8, resolved, "http://")) return false;
    if (version.len == 0) return false;
    return switch (version[0]) {
        '^', '~', '>', '<', '=', '*', '|' => false,
        else => true,
    };
}

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
        self.map.deinit();
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
        self.resolution_map.deinit();

        // Free registry entries
        var rit = self.registry_map.iterator();
        while (rit.next()) |entry| {
            self.allocator.free(entry.key_ptr.*);
            self.allocator.free(entry.value_ptr.*);
        }
        self.registry_map.deinit();
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

/// pantry.lock's pin, unless bun.lock prefers a different version for the
/// same range - then null, so resolution selects bun.lock's version instead.
fn pantryLockPin(
    locked: ?@import("../deps/resolution/lockfile.zig").LockedVersion,
    bun_pin: ?[]const u8,
) ?@import("../deps/resolution/lockfile.zig").LockedVersion {
    const pin = locked orelse return null;
    if (bun_pin) |preferred| {
        if (!std.mem.eql(u8, preferred, pin.version)) return null;
    }
    return pin;
}

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
    /// bun.lock pins. When the project also has a bun.lock, an npm range is
    /// resolved to bun.lock's version whenever that version satisfies it, so
    /// pantry/ and node_modules/ hold the same tree (stacksjs/stacks#2848).
    bun_pins: ?*const bun_lock.BunLockPins = null,
    /// Shared HTTP client for connection pooling (reuses TCP/TLS connections across requests)
    /// std.http.Client has a built-in 32-connection pool with mutex protection.
    http_client: *std.http.Client,
    /// Verbose debug logging (set once, checked throughout all install paths)
    verbose: bool = false,
    /// The pantry packages the install pipeline already chose, domain -> exact
    /// version, set for the length of a pipeline run. A sub-dependency that one
    /// of these satisfies installs at that version rather than its own newest
    /// (see `plannedVersionFor`). Read-only while workers run.
    planned_pantry: ?*const std.StringHashMap([]const u8) = null,
    /// Packages this run downloaded or materialized (not already in place),
    /// across threads. A package whose dependency tree gained nothing new
    /// keeps the library paths it was fixed with (see `libraryPathsCurrent`).
    fresh_installs: std.atomic.Value(usize) = .init(0),

    /// Thread-safe cache tracking which packages are installed at the hoisted level.
    /// Eliminates redundant filesystem checks when the same transitive dep is encountered
    /// dozens of times in a dependency tree.
    pub const HoisteVersionCache = struct {
        map: std.StringHashMap([]const u8),
        mutex: io_helper.Mutex,
        alloc: std.mem.Allocator,
        /// bun.lock pins (see `Installer.bun_pins`). A hoisted version that
        /// satisfies a range is not good enough when bun.lock pins a
        /// different version that also satisfies it.
        bun_pins: ?*const bun_lock.BunLockPins = null,

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
            self.map.deinit();
        }

        /// Check if a package is already hoisted with a version satisfying the constraint.
        pub fn checkSatisfies(self: *HoisteVersionCache, name: []const u8, version_constraint: []const u8) bool {
            self.mutex.lock();
            defer self.mutex.unlock();
            const installed_version = self.map.get(name) orelse return false;
            if (self.bun_pins) |pins| {
                if (pins.preferredVersion(name, version_constraint)) |pinned| {
                    return std.mem.eql(u8, installed_version, pinned);
                }
            }
            const npm_zig = @import("../registry/npm.zig");
            const constraint = npm_zig.SemverConstraint.parse(version_constraint) catch return true;
            return constraint.satisfies(installed_version);
        }

        /// Record a package as installed at the hoisted level.
        pub fn put(self: *HoisteVersionCache, name: []const u8, version: []const u8) void {
            self.mutex.lock();
            defer self.mutex.unlock();
            if (self.map.getEntry(name)) |entry| {
                // First version wins (hoisted) - unless this one is bun.lock's
                // pin replacing a stale version, e.g. the old pantry.lock pin
                // recorded from disk before the pinned version was installed.
                const pins = self.bun_pins orelse return;
                const pinned = pins.get(name) orelse return;
                if (!std.mem.eql(u8, version, pinned) or std.mem.eql(u8, entry.value_ptr.*, pinned)) return;
                const owned_version = self.alloc.dupe(u8, version) catch return;
                self.alloc.free(entry.value_ptr.*);
                entry.value_ptr.* = owned_version;
                return;
            }
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

    /// Set the project's bun.lock pins so npm resolution agrees with Bun's tree.
    /// Must be called before any concurrent resolution; the pins are read-only.
    pub fn setBunLockPins(self: *Installer, pins: *const bun_lock.BunLockPins) void {
        self.bun_pins = pins;
        self.hoisted_versions.bun_pins = pins;
    }

    /// bun.lock's version for `name@range` when it pins one that satisfies the
    /// range, else null.
    pub fn preferredBunPin(self: *const Installer, name: []const u8, range: []const u8) ?[]const u8 {
        const pins = self.bun_pins orelse return null;
        return pins.preferredVersion(name, range);
    }

    /// The version to take from registry metadata: bun.lock's pin when it
    /// satisfies the range and the registry lists it, else the highest match.
    fn pickNpmVersion(self: *Installer, npm_response: std.json.Value, name: []const u8, version_constraint: []const u8) ![]const u8 {
        if (self.preferredBunPin(name, version_constraint)) |pinned| {
            if (npm_response.object.get("versions")) |versions| {
                if (versions == .object) {
                    if (versions.object.getKey(pinned)) |key| return key;
                }
            }
        }
        return self.resolveNpmVersion(npm_response, version_constraint);
    }

    /// Check if a package has been pre-resolved in the npm cache
    /// (e.g. via lockfile-first resolution).
    /// Used to skip expensive pantry registry lookups when resolution is already cached.
    /// Non-allocating: just checks existence in the cache.
    pub fn hasNpmResolution(self: *Installer, name: []const u8, version: []const u8) bool {
        var cache_key_buf: [512]u8 = undefined;
        const cache_key = std.fmt.bufPrint(&cache_key_buf, "{s}@{s}", .{ name, version }) catch return false;
        return self.npm_cache.containsResolution(cache_key);
    }

    /// Return caller-owned resolution metadata already obtained by the npm
    /// resolver. Lockfile writers use this to persist the exact
    /// tarball and integrity without issuing a duplicate registry request.
    pub fn getCachedNpmResolution(self: *Installer, name: []const u8, version: []const u8) ?NpmResolution {
        var cache_key_buf: [512]u8 = undefined;
        const cache_key = std.fmt.bufPrint(&cache_key_buf, "{s}@{s}", .{ name, version }) catch return null;
        return self.npm_cache.getResolution(cache_key, self.allocator);
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
            if (pkg.name.len == 0 or !canRestoreLockTarball(pkg.version, pkg.resolved)) continue;

            // Check if already installed on disk
            var dir_buf: [std.fs.max_path_bytes]u8 = undefined;
            const install_dir = std.fmt.bufPrint(&dir_buf, "{s}/{s}/{s}", .{
                project_root, self.modules_dir, pkg.name,
            }) catch continue;
            io_helper.accessAbsolute(install_dir, .{}) catch {
                // Not installed — need to extract

                to_install.append(self.allocator, .{
                    .name = pkg.name,
                    .version = pkg.version,
                    .tarball_url = pkg.resolved,
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

        // Tarball URL strings point into lockfile-owned memory.

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

        // Zig artifacts are mirrored into Pantry by sync-zig-dev.yml. Even an
        // explicit ziglang source must install from our registry so builds do
        // not depend on a slow or disappearing upstream development archive.
        if (spec.source == .ziglang) {
            if (options.verbose) std.debug.print("[verbose:installer] -> mirrored zig package: {s}\n", .{spec.name});
            return try self.install(.{
                .name = "ziglang.org",
                .version = spec.version,
                .source = .pantry,
            }, options);
        }

        // Check if this is an npm package
        if (spec.source == .npm) {
            if (options.verbose) std.debug.print("[verbose:installer] -> npm source: {s} url={s}\n", .{ spec.name, if (spec.url) |u| u else "(null)" });
            return try self.installFromNpm(spec, options);
        }

        // Zig's official archive is a reliable fallback when the Pantry
        // binary registry is unavailable. Route the canonical domain through
        // the dedicated installer before generic Pantry package resolution.
        if (std.mem.eql(u8, spec.name, "ziglang.org")) {
            if (options.verbose) std.debug.print("[verbose:installer] -> zig package: {s}\n", .{spec.name});
            return try self.installFromZiglang(spec, options);
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

        // Already in this project at a version the request accepts: use it, as
        // npm and bun keep an installed version that satisfies its range. The
        // registry lookup this skips cost a second or more per package, every
        // time, for packages that were already there (a cached CI service
        // tree spent three minutes re-resolving what it had restored).
        var resolved_locally = false;
        if (!options.force) {
            if (options.project_root) |project_root| {
                if (self.installedProjectVersion(project_root, domain, spec.version)) |local| {
                    s3_version_alloc = local;
                    resolved_spec = PackageSpec{ .name = spec.name, .version = local };
                    resolved_locally = true;
                    if (options.verbose) std.debug.print("[verbose:installer] already in project: {s} @ {s} satisfies {s}\n", .{ domain, local, spec.version });
                }
            }
        }

        if (!skip_s3_lookup and !resolved_locally) {
            if (try downloader.lookupS3Registry(self.allocator, domain, spec.version)) |s3_result| {
                if (options.verbose) std.debug.print("[verbose:installer] S3 registry hit: {s} @ {s} url={s}\n", .{ domain, s3_result.version, s3_result.tarball_url });
                s3_version_alloc = s3_result.version;
                s3_tarball_url = s3_result.tarball_url;
                resolved_spec = PackageSpec{
                    .name = spec.name,
                    .version = s3_result.version,
                };
                from_s3 = true;
            } else if (try downloader.lookupPantryPublished(self.allocator, domain, spec.version)) |pub_result| {
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

        if (!from_s3 and !resolved_locally) {
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
        const fresh_before = self.fresh_installs.load(.monotonic);

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
        if (!used_cache) _ = self.fresh_installs.fetchAdd(1, .monotonic);

        // Install dependencies after the main package is installed. This must
        // run for S3-sourced packages too: registry tarballs are NOT
        // self-contained — e.g. git links @rpath/zlib.net/v1/lib/libz.dylib and
        // expects the separate zlib.net package alongside it. Skipping this for
        // S3 packages left git/codex/etc. with dangling @rpath libs (dyld then
        // fails to load them). installDependencies is idempotent, so re-running
        // for already-present deps is cheap.
        if (pkg_info) |info| {
            if (options.verbose) std.debug.print("[verbose:installer] installing sub-dependencies for {s} (count={d})\n", .{ resolved_spec.name, info.dependencies.len });
            try self.installDependencies(info.dependencies, options);

            // Re-fix this package's libraries now that its dependencies are on
            // disk: cross-package references (e.g. a Homebrew-built libssh2 that
            // hardcodes openssl's path) can only be repointed once the providing
            // package — openssl.org here — is installed. The first pass ran
            // before deps existed. Idempotent: rpath re-adds are refused and
            // install-name -change is a no-op when already correct.
            if (install_path.len > 0) {
                const tree_root = self.projectTreeRoot(options);
                defer if (tree_root) |root| self.allocator.free(root);
                // Already in place, nothing new beneath it this run, and fixed
                // for this same tree before: its paths are as this would leave
                // them. Rewriting every library again took 0.1 to 10 seconds a
                // package (postgresql.org: 9.8s) on an install with nothing to do.
                const unchanged = used_cache and self.fresh_installs.load(.monotonic) == fresh_before;
                if (!(unchanged and libraryPathsCurrent(self.allocator, install_path, tree_root))) {
                    libfixer.fixDirectoryLibraryPathsInTree(self.allocator, install_path, tree_root) catch {};
                    markLibraryPathsCurrent(self.allocator, install_path, tree_root);
                }
            }
        }

        // An OpenSSL finds its CA bundle at `<prefix>/ssl/cert.pem`, which only
        // curl.se/ca-certs provides; link the two whichever arrives second.
        if (install_path.len > 0 and (std.mem.eql(u8, domain, "openssl.org") or std.mem.eql(u8, domain, "curl.se/ca-certs"))) {
            if (ca_certs.treeRootOf(install_path, domain)) |root| ca_certs.linkBundles(self.allocator, root);
        }

        // Scripts mirrored from pkgx name their interpreter as `#!/usr/bin/env
        // -S pkgx python@3.11`, which nothing here can run. Point them at the
        // interpreter in this tree, installing a satisfying one if needed.
        if (install_path.len > 0) {
            pkgx_shebang.fixInstalledPackage(self, install_path, domain, resolved_spec.version, options);
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

        // Check if already installed.
        //
        // A project install writes to `<project>/<modules>/<name>`, which is not
        // version-scoped: the same directory holds whichever version went in
        // last. So "the directory exists" is not "the requested version is
        // installed", and treating it as such made `pantry install pkg@1.2.3`
        // over an existing 1.2.2 report success and change nothing - the whole
        // point of naming a version. The version on disk is read and compared;
        // a mismatch is a reinstall, not a cache hit.
        const already_installed = !options.force and blk: {
            io_helper.accessAbsolute(install_dir, .{}) catch break :blk false;
            if (options.project_root != null and !self.installedVersionMatches(install_dir, spec.version)) {
                if (options.verbose) std.debug.print("[verbose:npm] a different version is installed at {s}; replacing it\n", .{install_dir});
                io_helper.deleteTree(install_dir) catch {};
                break :blk false;
            }
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
        // Zig's std.tar alone was not enough here: a 183MB pantry package
        // (573MB unpacked) failed in it while /usr/bin/tar handled the same
        // bytes fine, so vitess.io could be downloaded and verified and still
        // never install. extractGzipFromMemory falls back to system tar, as
        // the sibling extractArchiveQuiet already does for large archives.
        extractor.extractGzipFromMemory(self.allocator, tarball_bytes, install_dir, 1) catch |err| {
            if (options.verbose) std.debug.print("[verbose:npm] EXTRACTION FAILED for {s}: {s}\n", .{ spec.name, @errorName(err) });
            if (!options.quiet) {
                // Name the error. The previous `catch {}` discarded it, so an
                // install that died here said only "Failed to extract — skipping"
                // and left nothing to act on.
                style.print("  ✗ Failed to extract {s} ({s}, {d} bytes) — skipping\n", .{ spec.name, @errorName(err), tarball_bytes.len });
            }
            io_helper.deleteTree(install_dir) catch {};
            return error.ExtractionFailed;
        };
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
        /// False when the version's `os`/`cpu`/`libc` exclude this machine:
        /// a platform package (`@esbuild/linux-x64` on a Mac) that belongs in
        /// the lock but not on disk.
        platform_ok: bool = true,

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
        return self.installSingleTransitiveDepInner(name, version_constraint, project_root, is_optional) catch |err| {
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
        is_optional: bool,
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

        // 3. Resolve via npm registry directly. An optional dependency is
        // usually one of a family of per-platform builds (`@esbuild/*`,
        // `@sqld/*`); its metadata says which machine it is for, and only
        // that one is downloaded.
        const npm_info: NpmResolution = if (is_optional) blk: {
            var with_deps = self.resolveNpmPackageWithDeps(name, version_constraint) catch return null;
            for (with_deps.dependencies) |dep| {
                self.allocator.free(dep.name);
                self.allocator.free(dep.version_constraint);
            }
            self.allocator.free(with_deps.dependencies);
            with_deps.dependencies = &.{};
            if (!with_deps.platform_ok) {
                if (self.verbose) std.debug.print("[verbose:transitive] {s}@{s} is for another platform, skipping\n", .{ name, with_deps.version });
                with_deps.deinit(self.allocator);
                return null;
            }
            break :blk .{ .version = with_deps.version, .tarball_url = with_deps.tarball_url, .integrity = with_deps.integrity };
        } else self.resolveNpmPackage(name, version_constraint) catch return null;
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

        // Process dependencies, optionalDependencies and peerDependencies
        // (skip devDependencies). optionalDependencies carry the per-platform
        // native builds (`@esbuild/darwin-arm64`, `@sqld/darwin-arm64`, ...)
        // that a package's bin cannot run without; installSingleTransitiveDep
        // keeps the ones for this machine.
        const sections = [_][]const u8{ "dependencies", "optionalDependencies", "peerDependencies" };
        const peer_meta = parsed.value.object.get("peerDependenciesMeta");

        for (sections) |section_key| {
            const deps_val = parsed.value.object.get(section_key) orelse continue;
            if (deps_val != .object) continue;

            const is_peer_section = std.mem.eql(u8, section_key, "peerDependencies");
            const is_optional_section = std.mem.eql(u8, section_key, "optionalDependencies");

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

                // Determine if this is an optional (or optional peer) dependency
                var is_optional = is_optional_section;
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
                all_deps.deinit(self.allocator);
                break;
            }

            // Deduplicate: if two packages in this wave both depend on "lodash@^4",
            // we only need to resolve+install it once. Use hoisted cache for dedup.
            var unique_deps: std.ArrayList(CollectedDep) = .empty;
            {
                // Track names we've already added in this wave to avoid duplicates
                var seen = std.StringHashMap(void).init(self.allocator);
                defer seen.deinit();

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
        // bun.lock's pin outranks pantry.lock's: when it satisfies the range
        // and differs from pantry.lock's, skip this shortcut so the registry
        // path below selects it.
        const bun_pin = self.preferredBunPin(name, version_constraint);
        if (self.lockfile) |lf| {
            const lockfile_zig = @import("../deps/resolution/lockfile.zig");
            if (pantryLockPin(lockfile_zig.getLockedVersion(lf, name), bun_pin)) |locked| {
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
                response_body = io_helper.httpGetTimeout(self.allocator, npm_url, &.{}, 10000) catch {
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
        const target_version = try self.pickNpmVersion(parsed.value, name, version_constraint);

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

        // --- Lockfile pin ---
        // pantry.lock's version is kept when it still satisfies the range,
        // but the registry metadata is read regardless: it is the only record
        // of what that version depends on and which platform it is for. This
        // used to answer from the lock alone with no dependencies, so any
        // install with a pantry.lock present installed the top-level npm
        // packages and nothing beneath them - chalk without ansi-styles,
        // esbuild without @esbuild/darwin-arm64.
        //
        // bun.lock's pin outranks pantry.lock's: when it satisfies the range
        // and differs from pantry.lock's, pantryLockPin yields nothing and
        // pickNpmVersion selects bun's.
        var lock_pinned: ?[]const u8 = null;
        if (self.lockfile) |lf| {
            const lockfile_zig = @import("../deps/resolution/lockfile.zig");
            if (pantryLockPin(lockfile_zig.getLockedVersion(lf, name), self.preferredBunPin(name, version_constraint))) |locked| {
                const npm_zig = @import("../registry/npm.zig");
                const constraint = npm_zig.SemverConstraint.parse(version_constraint) catch null;
                if (if (constraint) |c| c.satisfies(locked.version) else true) lock_pinned = locked.version;
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
                response_body = io_helper.httpGetTimeout(self.allocator, npm_url, &npm_accept_header, 10000) catch {
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

        const versions_obj = parsed.value.object.get("versions") orelse return error.NoVersions;
        if (versions_obj != .object) return error.InvalidNpmResponse;

        const target_version = if (lock_pinned) |pinned|
            versions_obj.object.getKey(pinned) orelse try self.pickNpmVersion(parsed.value, name, version_constraint)
        else
            try self.pickNpmVersion(parsed.value, name, version_constraint);

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

        // Extract dependencies, optionalDependencies and peerDependencies
        // from version_data. The optional ones are the per-platform native
        // builds; each is resolved like any other dep and then kept off disk
        // unless its `os`/`cpu`/`libc` match (see `platform_ok`).
        var deps_list = std.ArrayList(NpmResolutionWithDeps.DepEntry).empty;

        const dep_sections = [_][]const u8{ "dependencies", "optionalDependencies", "peerDependencies" };
        const peer_meta = version_data.object.get("peerDependenciesMeta");

        for (dep_sections) |section| {
            const is_peer = std.mem.eql(u8, section, "peerDependencies");
            const is_optional_section = std.mem.eql(u8, section, "optionalDependencies");
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
                var is_optional = is_peer or is_optional_section; // all peers are optional by default
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
            .platform_ok = npm_platform.allowsCurrentHost(version_data),
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

        // A version the registry has, named exactly, is that version. The
        // range check below ignores prerelease tags, so `0.24.1-pre.42` - how
        // sqld pins its `@sqld/*` platform builds - matched every
        // 0.24.1-pre.N and came back as whichever the iteration met first.
        {
            var exact = constraint_str;
            if (exact.len > 0 and exact[0] == '=') exact = exact[1..];
            if (exact.len > 0 and exact[0] == 'v') exact = exact[1..];
            if (npm_response.object.get("versions")) |versions| {
                if (versions == .object) {
                    if (versions.object.getKey(exact)) |key| return key;
                }
            }
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
                        const same_core = cur_parsed.major == bp.major and cur_parsed.minor == bp.minor and cur_parsed.patch == bp.patch;
                        if (cur_parsed.major > bp.major or
                            (cur_parsed.major == bp.major and cur_parsed.minor > bp.minor) or
                            (cur_parsed.major == bp.major and cur_parsed.minor == bp.minor and cur_parsed.patch > bp.patch) or
                            // Same release, so the prerelease tag decides:
                            // 1.0.0 over 1.0.0-rc.2 over 1.0.0-rc.1.
                            (same_core and semver.compareVersions(ver, best_version.?) == .gt))
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

    /// Install a Zig archive mirrored by the Pantry registry.
    fn installFromZiglang(
        self: *Installer,
        spec: PackageSpec,
        options: InstallOptions,
    ) !InstallResult {
        const start_ts_ = io_helper.clockGettime();
        const start_time = @as(i64, @intCast(start_ts_.sec)) * 1000 + @divFloor(@as(i64, @intCast(start_ts_.nsec)), 1_000_000);

        // Resolve wildcard, short development, and range requests from the live
        // binary registry before choosing the install path. The generated catalog
        // is intentionally not allowed to freeze a rolling Zig development range.
        const resolved_version = try downloader.resolveZigDevVersion(self.allocator, spec.version);
        defer self.allocator.free(resolved_version);
        if (!options.quiet and !std.mem.eql(u8, resolved_version, spec.version)) {
            style.print("  → Resolved {s} to {s}\n", .{ spec.version, resolved_version });
        }

        // Use standard install path — same as every other package: {modules_dir}/{domain}/v{version}
        const install_dir = if (options.project_root) |project_root|
            try self.getProjectPackageDir(project_root, "ziglang.org", resolved_version)
        else blk: {
            const global = try Paths.globalDir(self.allocator);
            defer self.allocator.free(global);
            break :blk try std.fmt.allocPrint(
                self.allocator,
                "{s}/packages/ziglang.org/v{s}",
                .{ global, resolved_version },
            );
        };
        errdefer self.allocator.free(install_dir);

        // Check if already installed (lightweight access check, no dir handle)
        const already_installed = !options.force and blk: {
            io_helper.accessAbsolute(install_dir, .{}) catch break :blk false;
            break :blk true;
        };

        if (already_installed) {
            if (options.project_root) |project_root| {
                try self.createProjectSymlinks(project_root, "ziglang.org", resolved_version, install_dir);
            }

            const end_ts_ = io_helper.clockGettime();
            const end_time = @as(i64, @intCast(end_ts_.sec)) * 1000 + @divFloor(@as(i64, @intCast(end_ts_.nsec)), 1_000_000);
            return InstallResult{
                .name = try self.allocator.dupe(u8, spec.name),
                .version = try self.allocator.dupe(u8, resolved_version),
                .install_path = install_dir,
                .from_cache = true,
                .install_time_ms = @intCast(end_time - start_time),
            };
        }

        const registry_artifact = try downloader.lookupS3Registry(self.allocator, "ziglang.org", resolved_version);
        defer if (registry_artifact) |artifact| {
            self.allocator.free(artifact.tarball_url);
            self.allocator.free(artifact.version);
        };

        if (!options.quiet) {
            const is_dev = downloader.isZigDevVersion(resolved_version);
            if (registry_artifact != null and is_dev) {
                if (!std.mem.eql(u8, resolved_version, spec.version)) {
                    style.print("  → Resolved {s} to {s}\n", .{ spec.version, resolved_version });
                }
                style.print("  → Downloading mirrored Zig dev from registry.pantry.dev: {s}\n", .{resolved_version});
            } else if (registry_artifact != null) {
                style.print("  → Downloading mirrored Zig from registry.pantry.dev: {s}\n", .{resolved_version});
            } else {
                style.print("  → Pantry mirror unavailable; downloading Zig from ziglang.org: {s}\n", .{resolved_version});
            }
        }

        // Prefer the Pantry mirror, but keep installs available during registry
        // outages by falling back to Zig's official archive for this version.
        const url = if (registry_artifact) |artifact|
            try self.allocator.dupe(u8, artifact.tarball_url)
        else
            try downloader.buildZiglangFallbackUrl(self.allocator, resolved_version);
        defer self.allocator.free(url);

        // Create temp directory for downloading
        const home = try Paths.home(self.allocator);
        defer self.allocator.free(home);

        const temp_dir = try std.fmt.allocPrint(
            self.allocator,
            "{s}/.pantry/.tmp/zig-{s}",
            .{ home, resolved_version },
        );
        defer {
            self.allocator.free(temp_dir);
            io_helper.deleteTree(temp_dir) catch {};
        }

        try io_helper.makePath(temp_dir);

        // Mirrored Unix archives are gzip; official Zig archives are xz.
        const is_windows = comptime @import("builtin").os.tag == .windows;
        const archive_ext = if (is_windows) "zip" else if (registry_artifact != null) "tar.gz" else "tar.xz";
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
            const zig_path = std.fmt.bufPrint(chmod_buf[0..std.fs.max_path_bytes], "{s}/bin/zig", .{install_dir}) catch null;
            if (zig_path) |p| {
                chmod_buf[p.len] = 0;
                _ = std.c.chmod(&chmod_buf, 0o755);
            }
        }

        // Use the standard symlink creation — same as all other packages.
        // discoverBinaries now finds executables at the package root (e.g. zig binary),
        // so no special-case symlink logic is needed here.
        if (options.project_root) |project_root| {
            try self.createProjectSymlinks(project_root, "ziglang.org", resolved_version, install_dir);
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

        // Create symlinks under the SAME base getGlobalPackageDir installs into:
        // "/usr/local" for system installs, else Paths.globalDir() (whose /bin is
        // the dir the shell hook puts on PATH). Passing self.data_dir was a bug —
        // for user installs the package actually lives under data_dir/global/packages,
        // so createPackageSymlinks(data_dir) looked in data_dir/packages (wrong) and
        // linked into data_dir/bin (not on PATH), leaving global installs with no
        // usable symlinks.
        const symlink_mod = @import("symlink.zig");
        const symlink_base = if (std.mem.eql(u8, self.data_dir, "/usr/local"))
            try self.allocator.dupe(u8, "/usr/local")
        else
            try Paths.globalDir(self.allocator);
        defer self.allocator.free(symlink_base);
        try symlink_mod.createPackageSymlinks(
            self.allocator,
            domain,
            spec.version,
            symlink_base,
        );

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
        const already_installed = !options.force and
            self.hasPackageStructure(project_pkg_dir) and
            validator.hasUsableDeclaredPrograms(self.allocator, domain, project_pkg_dir);

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

        const has_global = self.hasPackageStructure(global_pkg_dir) and
            validator.hasUsableDeclaredPrograms(self.allocator, domain, global_pkg_dir) and
            verified_staging.canMaterializeTree(self.allocator, global_pkg_dir);

        if (has_global) {
            // Copy from global cache - free unused S3 URL
            if (owned_url) |url| {
                self.allocator.free(@constCast(url));
                owned_url = null;
            }
            used_cache.* = true;
            try self.materializeVerifiedProjectPackage(global_pkg_dir, project_pkg_dir, domain);
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

    /// Whether the package already at `dir` is the exact version asked for.
    ///
    /// Missing or unreadable `package.json`, or a version that cannot be read,
    /// answers false: an install that cannot prove the right version is there
    /// should do the work rather than assume, since the cost of being wrong is
    /// silence.
    fn installedVersionMatches(self: *Installer, dir: []const u8, wanted: []const u8) bool {
        var path_buf: [std.fs.max_path_bytes]u8 = undefined;
        const manifest = std.fmt.bufPrint(&path_buf, "{s}/package.json", .{dir}) catch return false;

        const content = io_helper.readFileAlloc(self.allocator, manifest, 1024 * 1024) catch return false;
        defer self.allocator.free(content);

        const parsed = std.json.parseFromSlice(std.json.Value, self.allocator, content, .{}) catch return false;
        defer parsed.deinit();

        if (parsed.value != .object) return false;
        const version = parsed.value.object.get("version") orelse return false;
        if (version != .string) return false;

        return std.mem.eql(u8, version.string, wanted);
    }

    /// Download and install package directly to project directory (bypassing global cache)
    fn downloadAndInstallToProject(self: *Installer, spec: PackageSpec, domain: []const u8, project_pkg_dir: []const u8, options: InstallOptions, transferred_url: ?[]const u8) !void {
        const home = try Paths.home(self.allocator);
        defer self.allocator.free(home);

        const staging_parent = try std.fmt.allocPrint(self.allocator, "{s}/.pantry/.tmp", .{home});
        defer self.allocator.free(staging_parent);
        var staging = try verified_staging.Extraction.init(self.allocator, staging_parent);
        defer staging.deinit();
        const temp_dir = staging.root;

        var downloaded = false;
        var archive_path: []const u8 = undefined;
        var used_format: []const u8 = undefined;
        var used_url: []const u8 = undefined;

        // Use transferred URL if available, otherwise do a fresh S3 lookup
        // Checks: binaries/ (publish:binary) → packages/pantry/ (publish) → fallback URL
        const s3_url: ?[]const u8 = if (transferred_url) |url|
            url
        else if (try downloader.lookupS3Registry(self.allocator, domain, spec.version)) |s3_result| blk: {
            self.allocator.free(s3_result.version);
            break :blk s3_result.tarball_url;
        } else if (try downloader.lookupPantryPublished(self.allocator, domain, spec.version)) |pub_result| blk: {
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

        // Path of the content-addressed cache file backing this archive, if it was
        // served from cache — used to evict a poisoned entry on checksum mismatch.
        var cached_archive_path: ?[]const u8 = null;

        if (s3_url) |url| {
            const temp_archive_path = try std.fmt.allocPrint(
                self.allocator,
                "{s}/package.tar.gz",
                .{temp_dir},
            );

            const s3_ok = blk: {
                const cached_meta = self.cache.get(domain, spec.version) catch blk_cache: {
                    if (!std.mem.eql(u8, domain, spec.name)) {
                        break :blk_cache self.cache.get(spec.name, spec.version) catch null;
                    }
                    break :blk_cache null;
                };
                if (cached_meta) |meta| {
                    if (io_helper.readFileAlloc(self.allocator, meta.cache_path, 512 * 1024 * 1024)) |cached_bytes| {
                        defer self.allocator.free(cached_bytes);
                        const file = io_helper.cwd().createFile(io_helper.io, temp_archive_path, .{}) catch break :blk false;
                        defer file.close(io_helper.io);
                        io_helper.writeAllToFile(file, cached_bytes) catch break :blk false;
                        // The cache is written before checksum verification, so a single
                        // bad download would otherwise poison it forever. Remember the
                        // backing file so a checksum mismatch below can evict + re-fetch.
                        cached_archive_path = self.allocator.dupe(u8, meta.cache_path) catch null;
                        break :blk true;
                    } else |_| {}
                }

                if (options.inline_progress) |progress_opts| {
                    downloader.downloadFileInline(self.allocator, url, temp_archive_path, progress_opts) catch |err| {
                        self.allocator.free(temp_archive_path);
                        self.allocator.free(@constCast(url));
                        return err;
                    };
                } else {
                    downloader.downloadFileQuiet(self.allocator, url, temp_archive_path, options.quiet) catch |err| {
                        self.allocator.free(temp_archive_path);
                        self.allocator.free(@constCast(url));
                        return err;
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
        const extract_dir = staging.payload;
        defer if (cached_archive_path) |p| self.allocator.free(p);
        staging.extractVerified(archive_path, used_format, used_url, options.verbose) catch |err| {
            // A poisoned cache entry (bad bytes stored before checksum verification)
            // would fail every install forever. If the archive came from cache and
            // failed to verify/extract (corrupt or checksum mismatch), evict it and
            // re-download once from the registry before giving up.
            if (cached_archive_path != null) {
                io_helper.deleteFile(cached_archive_path.?) catch {};
                if (!options.quiet) {
                    style.print("  {s}evicting bad cached archive for {s}@{s}, re-downloading…{s}\n", .{ style.dim, spec.name, spec.version, style.reset });
                }
                if (options.inline_progress) |progress_opts| {
                    try downloader.downloadFileInline(self.allocator, used_url, archive_path, progress_opts);
                } else {
                    try downloader.downloadFileQuiet(self.allocator, used_url, archive_path, options.quiet);
                }
                try staging.extractVerified(archive_path, used_format, used_url, options.verbose);
            } else {
                return err;
            }
        };

        // Find the actual package root
        const package_source = try self.findPackageRoot(extract_dir, domain, spec.version);
        defer self.allocator.free(package_source);

        // Downloads and cache repairs use the same verified, atomic copy.
        try self.materializeVerifiedExtraction(&staging, package_source, project_pkg_dir, domain);

        // Fix library paths for macOS; references to other packages in this
        // project's pantry/ are written relative to the referencing binary.
        const tree_root = self.projectTreeRoot(options);
        defer if (tree_root) |root| self.allocator.free(root);
        try libfixer.fixDirectoryLibraryPathsInTree(self.allocator, project_pkg_dir, tree_root);

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

    /// Get global package directory (shared across all environments).
    /// Uses /usr/local/packages/ for system-wide global installations, or
    /// the user-local pantry data dir (Paths.globalDir, e.g.
    /// `~/.local/share/pantry/global/packages`) otherwise. The user-local
    /// path is the same root the shell hook adds to PATH, so packages put
    /// here are immediately discoverable.
    fn getGlobalPackageDir(self: *Installer, domain: []const u8, version: []const u8) ![]const u8 {
        // Check if we're using system-wide installation (/usr/local)
        if (std.mem.eql(u8, self.data_dir, "/usr/local")) {
            return std.fmt.allocPrint(
                self.allocator,
                "/usr/local/packages/{s}/v{s}",
                .{ domain, version },
            );
        }

        const global = try Paths.globalDir(self.allocator);
        defer self.allocator.free(global);

        return std.fmt.allocPrint(
            self.allocator,
            "{s}/packages/{s}/v{s}",
            .{ global, domain, version },
        );
    }

    /// The project's pantry dir (`<project>/pantry`) for a project install, or
    /// null for a global one. Caller owns the result.
    fn projectTreeRoot(self: *Installer, options: InstallOptions) ?[]u8 {
        const project_root = options.project_root orelse return null;
        return std.fmt.allocPrint(self.allocator, "{s}/{s}", .{ project_root, self.modules_dir }) catch null;
    }

    /// Get project-local package directory (pantry)
    /// The newest version of `domain` installed in this project that
    /// `constraint` accepts ("latest", "*" or empty: any), and whose package is
    /// complete and usable; null when there is none. Only real version
    /// directories count: `v3` and `v3.6` are links to `v3.6.5`.
    fn installedProjectVersion(self: *Installer, project_root: []const u8, domain: []const u8, constraint: []const u8) ?[]const u8 {
        const domain_dir = std.fmt.allocPrint(self.allocator, "{s}/{s}/{s}", .{ project_root, self.modules_dir, domain }) catch return null;
        defer self.allocator.free(domain_dir);
        var dir = io_helper.openDirAbsoluteForIteration(domain_dir) catch return null;
        defer dir.close();
        const any = constraint.len == 0 or std.mem.eql(u8, constraint, "latest") or std.mem.eql(u8, constraint, "*");
        const parsed: ?semver.Constraint = if (any) null else semver.parseConstraint(constraint) catch return null;
        var best: ?[]u8 = null;
        var it = dir.iterate();
        while (it.next() catch null) |entry| {
            if (entry.kind != .directory) continue;
            if (entry.name.len < 2 or entry.name[0] != 'v' or !std.ascii.isDigit(entry.name[1])) continue;
            const version = entry.name[1..];
            if (parsed) |c| if (!semver.satisfiesConstraint(version, c)) continue;
            if (best) |current| if (semver.compareVersions(version, current) != .gt) continue;
            const package_dir = std.fs.path.join(self.allocator, &.{ domain_dir, entry.name }) catch continue;
            defer self.allocator.free(package_dir);
            if (!self.hasPackageStructure(package_dir) or !validator.hasUsableDeclaredPrograms(self.allocator, domain, package_dir)) continue;
            if (best) |current| self.allocator.free(current);
            best = self.allocator.dupe(u8, version) catch null;
        }
        return best;
    }

    const library_paths_marker = ".pantry-library-paths";

    /// Whether `install_path`'s libraries were last fixed for `tree_root`.
    fn libraryPathsCurrent(allocator: std.mem.Allocator, install_path: []const u8, tree_root: ?[]const u8) bool {
        const marker = std.fs.path.join(allocator, &.{ install_path, library_paths_marker }) catch return false;
        defer allocator.free(marker);
        const recorded = io_helper.readFileAlloc(allocator, marker, 64 * 1024) catch return false;
        defer allocator.free(recorded);
        return std.mem.eql(u8, recorded, tree_root orelse "");
    }

    fn markLibraryPathsCurrent(allocator: std.mem.Allocator, install_path: []const u8, tree_root: ?[]const u8) void {
        const marker = std.fs.path.join(allocator, &.{ install_path, library_paths_marker }) catch return;
        defer allocator.free(marker);
        const file = io_helper.createFileAbsolute(marker, .{ .truncate = true }) catch return;
        defer io_helper.closeFile(file);
        io_helper.writeAllToFile(file, tree_root orelse "") catch {};
    }

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

            try @import("symlink.zig").createProgramActivation(self.allocator, link, source, null);
        }

        _ = version; // not used in current implementation
    }

    /// Create symlinks in project's pantry/.bin directory
    /// Create one version-alias symlink (e.g. `vMAJOR` or `vMAJOR.MINOR`) next
    /// to a concrete install dir. Best effort — never fatal, and never clobbers
    /// a real directory (deleteFile only unlinks symlinks; on a real dir it
    /// fails and we leave it). The alias and its target are siblings, so the
    /// link is written as just `vVERSION` and survives the tree moving.
    fn linkVersionAlias(self: *Installer, parent: []const u8, target_dir: []const u8, full_version: []const u8, alias_version: []const u8) void {
        // Don't alias a version onto itself (e.g. a bare "1" install).
        if (std.mem.eql(u8, alias_version, full_version)) return;
        const link = std.fmt.allocPrint(self.allocator, "{s}/v{s}", .{ parent, alias_version }) catch return;
        defer self.allocator.free(link);
        io_helper.deleteFile(link) catch {};
        @import("symlink.zig").symLinkInTree(self.allocator, parent, target_dir, link) catch {};
    }

    /// Create `vMAJOR` and `vMAJOR.MINOR` compat symlinks pointing at the
    /// concrete `vVERSION` install dir, so a dependent binary whose dylib rpath
    /// references a truncated version (e.g. `@rpath/zlib.net/v1/lib/libz.dylib`)
    /// resolves to `zlib.net/v1.3.2`. Without these, packages like git fail to
    /// load their shared libs at runtime ("Library not loaded: @rpath/…").
    fn createVersionCompatSymlinks(self: *Installer, version: []const u8, package_dir: []const u8) void {
        const parent = std.fs.path.dirname(package_dir) orelse return;
        var it = std.mem.splitScalar(u8, version, '.');
        const major = it.next() orelse return;
        if (major.len == 0) return;
        const minor = it.next();

        self.linkVersionAlias(parent, package_dir, version, major);
        if (minor) |m| {
            if (m.len > 0) {
                const mm = std.fmt.allocPrint(self.allocator, "{s}.{s}", .{ major, m }) catch return;
                defer self.allocator.free(mm);
                self.linkVersionAlias(parent, package_dir, version, mm);
            }
        }
    }

    fn createProjectSymlinks(self: *Installer, project_root: []const u8, domain: []const u8, version: []const u8, package_dir: []const u8) !void {
        // Project bin directory (pantry/.bin)
        const project_bin_dir = try std.fmt.allocPrint(
            self.allocator,
            "{s}/{s}/.bin",
            .{ project_root, self.modules_dir },
        );
        defer self.allocator.free(project_bin_dir);

        try io_helper.makePath(project_bin_dir);

        // Links from pantry/.bin into packages under pantry/ are written
        // relative to this root, so the tree keeps working however it is
        // reached (a symlink, a worktree sharing it) or wherever it moves.
        const tree_root = try std.fmt.allocPrint(self.allocator, "{s}/{s}", .{ project_root, self.modules_dir });
        defer self.allocator.free(tree_root);

        // Major/minor version compat symlinks (vMAJOR, vMAJOR.MINOR → vVERSION)
        // so dependents' dylib rpaths that use a truncated version resolve.
        self.createVersionCompatSymlinks(version, package_dir);

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
                        bin_map.deinit();
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

                        try @import("symlink.zig").createProgramActivation(self.allocator, link, source, tree_root);

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

        // Link each discovered binary into the project .bin dir.
        for (binaries) |bin_info| {
            const link = try std.fmt.allocPrint(
                self.allocator,
                "{s}/{s}",
                .{ project_bin_dir, bin_info.name },
            );
            defer self.allocator.free(link);

            try symlink.createProgramActivation(self.allocator, link, bin_info.path, tree_root);
        }

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

        // Shims reference packages under pantry/ relative to themselves.
        const tree_root = try std.fmt.allocPrint(self.allocator, "{s}/{s}", .{ project_root, self.modules_dir });
        defer self.allocator.free(tree_root);

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
                tree_root,
            ) catch |err| {
                if (self.verbose) std.debug.print("[verbose:shims] failed to create shim for {s}: {s}\n", .{ package_name, @errorName(err) });
            };
        } else if (bin_value == .object) {
            // Multiple binaries
            symlink_mod.createShimsFromBinConfig(
                self.allocator,
                install_dir,
                bin_value,
                shim_dir,
                tree_root,
            ) catch |err| {
                if (self.verbose) std.debug.print("[verbose:shims] failed to create shims for {s}: {s}\n", .{ package_name, @errorName(err) });
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

        const staging_parent = try std.fmt.allocPrint(self.allocator, "{s}/.pantry/.tmp", .{home});
        defer self.allocator.free(staging_parent);
        var staging = try verified_staging.Extraction.init(self.allocator, staging_parent);
        defer staging.deinit();
        const temp_dir = staging.root;

        var downloaded = false;
        var archive_path: []const u8 = undefined;
        var used_format: []const u8 = undefined;
        var used_url: []const u8 = undefined;

        // Use transferred URL if available, otherwise do a fresh S3 lookup
        // Checks: binaries/ (publish:binary) → packages/pantry/ (publish) → fallback URL
        const s3_url: ?[]const u8 = if (transferred_url) |url|
            url
        else if (try downloader.lookupS3Registry(self.allocator, domain, spec.version)) |s3_result| blk: {
            self.allocator.free(s3_result.version);
            break :blk s3_result.tarball_url;
        } else if (try downloader.lookupPantryPublished(self.allocator, domain, spec.version)) |pub_result| blk: {
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
                    downloader.downloadFileInline(self.allocator, url, temp_archive_path, progress_opts) catch |err| {
                        self.allocator.free(temp_archive_path);
                        self.allocator.free(@constCast(url));
                        return err;
                    };
                } else {
                    downloader.downloadFileQuiet(self.allocator, url, temp_archive_path, options.quiet) catch |err| {
                        self.allocator.free(temp_archive_path);
                        self.allocator.free(@constCast(url));
                        return err;
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
        const extract_dir = staging.payload;
        try staging.extractVerified(archive_path, used_format, used_url, options.verbose);

        // Find the actual package root (might be nested like domain/v{version}/)
        const package_source = try self.findPackageRoot(extract_dir, domain, spec.version);
        defer self.allocator.free(package_source);

        // Copy/move package contents to global cache location
        try self.materializeVerifiedExtraction(&staging, package_source, global_pkg_dir, domain);

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
    ///
    /// Scans the *global* package store. Installs land in
    /// `data_dir/global/packages` — the path getGlobalPackageDir writes and the
    /// same one createPackageSymlinks was corrected to use above — so reading
    /// `data_dir/packages` opened a directory that has never existed. The
    /// iteration then failed open and `pantry list` answered "0 package(s)
    /// installed" on a machine with a fully populated store.
    pub fn listInstalled(self: *Installer) !std.ArrayList(packages.InstalledPackage) {
        var installed = try std.ArrayList(packages.InstalledPackage).initCapacity(self.allocator, 16);
        errdefer {
            for (installed.items) |*pkg| pkg.deinit(self.allocator);
            installed.deinit(self.allocator);
        }

        const packages_dir = if (std.mem.eql(u8, self.data_dir, "/usr/local"))
            try self.allocator.dupe(u8, "/usr/local/packages")
        else blk: {
            const global = try Paths.globalDir(self.allocator);
            defer self.allocator.free(global);
            break :blk try std.fmt.allocPrint(self.allocator, "{s}/packages", .{global});
        };
        defer self.allocator.free(packages_dir);

        try self.collectInstalled(packages_dir, "", 0, &installed);

        return installed;
    }

    /// List the packages installed into a project's `modules_dir`.
    ///
    /// `pantry install <pkg>` run inside a project installs there, not into the
    /// global store — so listing only the global store answered "0 package(s)
    /// installed" immediately after a successful project install, and the
    /// install looked like it had lied about what it placed.
    pub fn listInstalledInProject(
        self: *Installer,
        project_root: []const u8,
    ) !std.ArrayList(packages.InstalledPackage) {
        var installed = try std.ArrayList(packages.InstalledPackage).initCapacity(self.allocator, 16);
        errdefer {
            for (installed.items) |*pkg| pkg.deinit(self.allocator);
            installed.deinit(self.allocator);
        }

        const modules_path = try std.fmt.allocPrint(
            self.allocator,
            "{s}/{s}",
            .{ project_root, self.modules_dir },
        );
        defer self.allocator.free(modules_path);

        try self.collectInstalled(modules_path, "", 0, &installed);

        return installed;
    }

    /// How many path segments a domain may span before the walk gives up.
    /// The longest in the registry today is three (`github.com/router-for-me/
    /// CLIProxyAPI`); the cap only exists so an unexpected deep tree cannot turn
    /// a listing into an unbounded walk.
    const max_domain_depth = 4;

    /// Walk one level of a package store, appending every `v{version}` leaf.
    ///
    /// A domain is not always one path segment: `gnu.org/bash` and
    /// `gnupg.org/libgcrypt` nest, so a fixed two-level walk reported `gnu.org`
    /// at version `bash` and never saw the versions underneath. Version
    /// directories are the ones written as `v{version}`; every other directory
    /// is a further segment of the domain.
    ///
    /// Major-version aliases (`v1` -> `v1.3.14`) are symlinks rather than
    /// directories, so the `.directory` filter already keeps each version once.
    fn collectInstalled(
        self: *Installer,
        dir_path: []const u8,
        domain: []const u8,
        depth: usize,
        out: *std.ArrayList(packages.InstalledPackage),
    ) !void {
        // Use FsDir for iteration (Io.Dir doesn't have iterate() in Zig 0.16)
        var dir = io_helper.openDirForIteration(dir_path) catch return;
        defer dir.close();

        var it = dir.iterate();
        while (it.next() catch null) |entry| {
            if (entry.kind != .directory) continue;

            // `.bin` and friends hold symlinks into the packages, not packages.
            if (entry.name.len > 0 and entry.name[0] == '.') continue;

            const child_path = try std.fmt.allocPrint(
                self.allocator,
                "{s}/{s}",
                .{ dir_path, entry.name },
            );

            const is_version = entry.name.len > 1 and
                entry.name[0] == 'v' and
                std.ascii.isDigit(entry.name[1]);

            if (!is_version) {
                defer self.allocator.free(child_path);

                if (depth + 1 >= max_domain_depth) continue;

                // A project's modules_dir holds npm packages beside the domain
                // trees, and those nest without limit. A pantry domain directory
                // contains only `v*` version directories, so a package.json marks
                // an npm package — prune there rather than descending into every
                // dependency's own sources looking for versions that cannot exist.
                if (self.hasPackageJson(child_path)) continue;

                const nested = if (domain.len == 0)
                    try self.allocator.dupe(u8, entry.name)
                else
                    try std.fmt.allocPrint(self.allocator, "{s}/{s}", .{ domain, entry.name });
                defer self.allocator.free(nested);

                try self.collectInstalled(child_path, nested, depth + 1, out);
                continue;
            }

            // A version directory directly under the root has no domain to
            // belong to; skip rather than record a nameless package.
            if (domain.len == 0) {
                self.allocator.free(child_path);
                continue;
            }

            // Use io_helper.statFile with full path
            const stat = io_helper.statFile(child_path) catch {
                self.allocator.free(child_path);
                continue;
            };

            try out.append(self.allocator, .{
                .name = try self.allocator.dupe(u8, domain),
                .version = try self.allocator.dupe(u8, entry.name[1..]),
                .install_path = child_path,
                .installed_at = @intCast(@divFloor(stat.ctime, std.time.ns_per_s)),
                .size = @intCast(stat.size),
            });
        }
    }

    /// Whether `dir_path` holds a package.json, i.e. is an npm package rather
    /// than a segment of a pantry domain.
    fn hasPackageJson(self: *Installer, dir_path: []const u8) bool {
        const manifest = std.fmt.allocPrint(
            self.allocator,
            "{s}/package.json",
            .{dir_path},
        ) catch return false;
        defer self.allocator.free(manifest);

        _ = io_helper.statFile(manifest) catch return false;
        return true;
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
        // Use std.fs.Dir for iteration (Io.Dir doesn't have iterate() in Zig 0.16)
        var dir = io_helper.openDirAbsoluteForIteration(dir_path) catch return false;
        defer dir.close();

        var it = dir.iterate();
        while (it.next() catch null) |entry| {
            // Flat Windows archives are still checked against the complete
            // target-native executable contract before the tree is accepted.
            if (@import("builtin").os.tag == .windows and entry.kind == .file and
                std.ascii.endsWithIgnoreCase(entry.name, ".exe"))
            {
                const executable = std.fs.path.join(self.allocator, &.{ dir_path, entry.name }) catch return false;
                defer self.allocator.free(executable);
                const metadata = io_helper.statFile(executable) catch continue;
                if (metadata.size > 0) return true;
            }
            if (entry.kind != .directory) continue;

            // Check for common package directories
            if (std.mem.eql(u8, entry.name, "bin") or
                std.mem.eql(u8, entry.name, "lib") or
                std.mem.eql(u8, entry.name, "include") or
                std.mem.eql(u8, entry.name, "share") or
                std.mem.eql(u8, entry.name, "sbin") or
                std.mem.eql(u8, entry.name, "ssl"))
            {
                return true;
            }
        }

        return false;
    }

    /// Copy a shared package without consuming or modifying its source.
    fn copyDirectoryStructure(self: *Installer, source: []const u8, dest: []const u8) !void {
        var src_dir = try io_helper.openDirAbsoluteForIteration(source);
        defer src_dir.close();
        try io_helper.makePath(dest);
        var it = src_dir.iterate();
        while (try it.next()) |entry| {
            const src_path = try std.fs.path.join(self.allocator, &.{ source, entry.name });
            defer self.allocator.free(src_path);
            const dst_path = try std.fs.path.join(self.allocator, &.{ dest, entry.name });
            defer self.allocator.free(dst_path);
            if (entry.kind == .directory) {
                try self.copyDirectoryStructure(src_path, dst_path);
            } else if (entry.kind == .sym_link) {
                const target = try io_helper.readLinkAlloc(self.allocator, src_path);
                defer self.allocator.free(target);
                try io_helper.symLink(target, dst_path);
            } else {
                try io_helper.copyFile(src_path, dst_path);
            }
        }
        try materialization.preserveDirectoryPermissions(source, dest);
    }

    const MaterializationOperations = struct {
        installer: *Installer,

        pub fn copy(self: *const @This(), source: []const u8, destination: []const u8) !void {
            return self.installer.copyDirectoryStructure(source, destination);
        }

        pub fn rename(_: *const @This(), source: []const u8, destination: []const u8) !void {
            return io_helper.renameClassified(source, destination);
        }
    };

    const MaterializationValidation = struct {
        installer: *Installer,
        domain: []const u8,
        version: ?[]const u8,

        pub fn check(self: *const @This(), directory: []const u8) bool {
            return self.installer.hasPackageStructure(directory) and
                validator.hasUsableDeclaredProgramsAtVersion(self.installer.allocator, self.domain, directory, self.version);
        }
    };

    /// Shared global/cache packages are always copied, never renamed away.
    fn materializeVerifiedProjectPackage(self: *Installer, source: []const u8, dest: []const u8, domain: []const u8) !void {
        return self.materializePackage(.{ .shared = source }, dest, domain);
    }

    /// Only these two cold-download paths hold a fresh verified extraction.
    fn materializeVerifiedExtraction(self: *Installer, extraction: *const verified_staging.Extraction, source: []const u8, dest: []const u8, domain: []const u8) !void {
        return self.materializePackage(.{ .exclusive = .{ .extraction = extraction, .path = source } }, dest, domain);
    }

    fn materializePackage(self: *Installer, source: materialization.Source, dest: []const u8, domain: []const u8) !void {
        const directory = std.fs.path.basename(dest);
        const version: ?[]const u8 = if (directory.len > 1 and directory[0] == 'v' and std.ascii.isDigit(directory[1])) directory[1..] else null;
        const validation = MaterializationValidation{ .installer = self, .domain = domain, .version = version };
        const operations = MaterializationOperations{ .installer = self };
        _ = materialization.publish(self.allocator, source, dest, &validation, &operations) catch |err| {
            if (err == error.InvalidPackageSource) {
                std.debug.print("[pantry:validate] Invalid package source for {s}: {s} (package structure={})\n", .{ domain, source.path(), self.hasPackageStructure(source.path()) });
                validator.reportUnusableDeclaredPrograms(self.allocator, domain, source.path(), version);
            }
            return err;
        };
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
        const planned = if (self.planned_pantry) |plan| plannedVersionFor(plan, domain, version) else null;
        const resolved_version = planned orelse semver.resolveVersion(domain, version) orelse {
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
                .version = planned orelse dependencyInstallVersion(version, resolved_version),
            };

            if (self.verbose) style.print("    → Installing dependency: {s}@{s}\n", .{ name, spec.version });

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
        if (self.verbose) style.print("    ✓ Dependency already installed: {s}@{s}\n", .{ name, resolved_version });
    }
};

/// The version a sub-dependency is installed at: its constraint, as declared.
///
/// `semver.resolveVersion` picks from generated.zig, which lists every
/// upstream release whether or not the binary registry has built it yet. php.net
/// declares `libpng.org^1`, generated.zig said 1.6.59 while 1.6.58 was the newest
/// darwin-arm64 artifact, and so php, webp and composer all failed with
/// "libpng.org@1.6.59 not found in registry" - beside a 1.6.58 the same install
/// had just put on disk. Handing `install()` the constraint lets it ask the
/// registry for the newest complete artifact that satisfies it
/// (`registry_versions.select`), and fall back to generated.zig only when the
/// registry has none. A bare name ("latest") resolves the same way.
///
/// `resolved` is used only when the constraint is empty.
fn dependencyInstallVersion(constraint: []const u8, resolved: []const u8) []const u8 {
    return if (constraint.len == 0) resolved else constraint;
}

/// The version the pipeline already chose for `domain`, when it satisfies
/// `constraint`, else null.
///
/// The pipeline flattens a project's pantry packages one version per domain,
/// a declared one first. Each package then installs its own dependencies as
/// well, and those used to pick their own version: getcomposer.org depends on
/// plain `php.net`, so a project declaring `php.net: ~8.4` also got php 8.5.8,
/// whose `php` replaced 8.4's in pantry/.bin, and `php -v` said 8.5. Reusing
/// the planned version keeps one php, the declared one.
fn plannedVersionFor(plan: *const std.StringHashMap([]const u8), domain: []const u8, constraint: []const u8) ?[]const u8 {
    const planned = plan.get(domain) orelse return null;
    return if (plannedSatisfies(planned, constraint)) planned else null;
}

fn plannedSatisfies(planned: []const u8, constraint: []const u8) bool {
    // Only an exact version can stand in for a dependency.
    _ = semver.parseVersion(planned) catch return false;
    if (registry_versions_mod.isUnversioned(constraint)) return true;
    const c = semver.parseConstraint(constraint) catch return false;
    return semver.satisfiesConstraint(planned, c);
}

test "a planned version stands in for a dependency it satisfies" {
    var plan = std.StringHashMap([]const u8).init(std.testing.allocator);
    defer plan.deinit();
    try plan.put("php.net", "8.4.22");
    try plan.put("mysql.com", "^8");
    try plan.put("openjdk.org", "17.0.20.8");
    try std.testing.expectEqualStrings("17.0.20.8", plannedVersionFor(&plan, "openjdk.org", ">=17").?);

    // composer's bare `php.net`, and ranges the declared 8.4.22 is inside.
    try std.testing.expectEqualStrings("8.4.22", plannedVersionFor(&plan, "php.net", "latest").?);
    try std.testing.expectEqualStrings("8.4.22", plannedVersionFor(&plan, "php.net", "^8").?);
    try std.testing.expectEqualStrings("8.4.22", plannedVersionFor(&plan, "php.net", ">=8.1").?);
    // A dependency that needs something else still gets its own.
    try std.testing.expect(plannedVersionFor(&plan, "php.net", ">=8.5") == null);
    // A plan entry that is still a range decides nothing.
    try std.testing.expect(plannedVersionFor(&plan, "mysql.com", "latest") == null);
    try std.testing.expect(plannedVersionFor(&plan, "zlib.net", "^1") == null);
}

test "a sub-dependency installs at its constraint, not generated.zig's newest" {
    try std.testing.expectEqualStrings("^1", dependencyInstallVersion("^1", "1.6.59"));
    try std.testing.expectEqualStrings(">=10.30", dependencyInstallVersion(">=10.30", "10.47.0"));
    try std.testing.expectEqualStrings("latest", dependencyInstallVersion("latest", "8.5.11"));
    try std.testing.expectEqualStrings("1.6.58", dependencyInstallVersion("", "1.6.58"));
}

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

    // Unknown packages should fail cleanly without creating partial state.
    try std.testing.expectError(error.PackageNotFound, installer.install(spec, .{}));
}

test "listInstalledInProject reports the packages install placed there" {
    const allocator = std.testing.allocator;

    var tmp_dir = std.testing.tmpDir(.{});
    defer tmp_dir.cleanup();

    var path_buf: [std.fs.max_path_bytes]u8 = undefined;
    const tmp_len = try tmp_dir.dir.realPath(io_helper.io, &path_buf);
    const project_root = path_buf[0..tmp_len];

    // The layout a project install writes, plus the two things that share the
    // modules dir with it: the `.bin` symlink farm and npm packages.
    const dirs = [_][]const u8{
        "pantry/gnupg.org/v2.4.8/bin",
        "pantry/gnupg.org/libgcrypt/v1.12.1/lib", // nested domain
        "pantry/bun.sh/v1.3.14/bin",
        "pantry/.bin", // symlinks, not packages
        "pantry/acorn/v8", // npm package that happens to hold a `v8` dir
    };
    for (dirs) |rel| {
        const full = try std.fmt.allocPrint(allocator, "{s}/{s}", .{ project_root, rel });
        defer allocator.free(full);
        try io_helper.makePath(full);
    }

    const manifest = try std.fmt.allocPrint(allocator, "{s}/pantry/acorn/package.json", .{project_root});
    defer allocator.free(manifest);
    const manifest_file = try io_helper.cwd().createFile(io_helper.io, manifest, .{});
    manifest_file.close(io_helper.io);

    var pkg_cache = try PackageCache.init(allocator);
    defer pkg_cache.deinit();

    var installer = try Installer.init(allocator, &pkg_cache);
    defer installer.deinit();

    var installed = try installer.listInstalledInProject(project_root);
    defer {
        for (installed.items) |*pkg| pkg.deinit(allocator);
        installed.deinit(allocator);
    }

    var found_gnupg = false;
    var found_nested = false;
    var found_bun = false;
    for (installed.items) |pkg| {
        // `.bin` holds symlinks and acorn is an npm package; neither is a
        // package this should name, and acorn's `v8` is the case that makes
        // the package.json prune load-bearing rather than an optimisation.
        try std.testing.expect(!std.mem.startsWith(u8, pkg.name, "."));
        try std.testing.expect(!std.mem.eql(u8, pkg.name, "acorn"));

        if (std.mem.eql(u8, pkg.name, "gnupg.org")) {
            // The version is reported without the `v` the directory carries.
            try std.testing.expectEqualStrings("2.4.8", pkg.version);
            found_gnupg = true;
        } else if (std.mem.eql(u8, pkg.name, "gnupg.org/libgcrypt")) {
            try std.testing.expectEqualStrings("1.12.1", pkg.version);
            found_nested = true;
        } else if (std.mem.eql(u8, pkg.name, "bun.sh")) {
            try std.testing.expectEqualStrings("1.3.14", pkg.version);
            found_bun = true;
        }
    }

    try std.testing.expect(found_gnupg);
    try std.testing.expect(found_nested);
    try std.testing.expect(found_bun);
    try std.testing.expectEqual(@as(usize, 3), installed.items.len);
}

test "installedVersionMatches reads the version on disk rather than trusting the directory" {
    // The defect this guards: a project install writes to
    // `<project>/<modules>/<name>`, which is not version-scoped, so "the
    // directory is there" said nothing about which version was in it -
    // installing 1.3.0 over 1.2.0 was a cache hit that changed nothing.
    const allocator = std.testing.allocator;

    var tmp_dir = std.testing.tmpDir(.{});
    defer tmp_dir.cleanup();

    var path_buf: [std.fs.max_path_bytes]u8 = undefined;
    const tmp_len = try tmp_dir.dir.realPath(io_helper.io, &path_buf);
    const project_root = path_buf[0..tmp_len];

    const package_dir = try std.fmt.allocPrint(allocator, "{s}/pantry/left-pad", .{project_root});
    defer allocator.free(package_dir);
    try io_helper.makePath(package_dir);

    var pkg_cache = try PackageCache.init(allocator);
    defer pkg_cache.deinit();

    var installer = try Installer.init(allocator, &pkg_cache);
    defer installer.deinit();

    // No manifest at all: cannot prove the right version is there, so do the work.
    try std.testing.expect(!installer.installedVersionMatches(package_dir, "1.2.0"));

    try tmp_dir.dir.writeFile(io_helper.io, .{
        .sub_path = "pantry/left-pad/package.json",
        .data = "{\"name\":\"left-pad\",\"version\":\"1.2.0\"}",
    });

    try std.testing.expect(installer.installedVersionMatches(package_dir, "1.2.0"));
    try std.testing.expect(!installer.installedVersionMatches(package_dir, "1.3.0"));
}

test "lockfile restore fast path accepts only immutable npm tarballs" {
    const tarball = "https://registry.npmjs.org/bunfig/-/bunfig-0.15.15.tgz";
    try std.testing.expect(canRestoreLockTarball("0.15.15", tarball));
    try std.testing.expect(!canRestoreLockTarball("^0.15.15", tarball));
    try std.testing.expect(!canRestoreLockTarball("", tarball));
    try std.testing.expect(!canRestoreLockTarball("0.15.15", ""));
    try std.testing.expect(!canRestoreLockTarball("0.15.15", "registry:bunfig@0.15.15"));
}

test "cached npm resolution exposes caller-owned lockfile metadata" {
    const allocator = std.testing.allocator;
    var pkg_cache = try PackageCache.init(allocator);
    defer pkg_cache.deinit();
    var installer = try Installer.init(allocator, &pkg_cache);
    defer installer.deinit();

    installer.npm_cache.putResolution(
        "bunfig@^0.15.15",
        "0.15.15",
        "https://registry.npmjs.org/bunfig/-/bunfig-0.15.15.tgz",
        "sha512-fixture",
    );

    const resolution = installer.getCachedNpmResolution("bunfig", "^0.15.15").?;
    defer {
        allocator.free(resolution.version);
        allocator.free(resolution.tarball_url);
        if (resolution.integrity) |integrity| allocator.free(integrity);
    }
    try std.testing.expectEqualStrings("0.15.15", resolution.version);
    try std.testing.expectEqualStrings("sha512-fixture", resolution.integrity.?);
    try std.testing.expect(installer.getCachedNpmResolution("bunfig", "^1") == null);
}

/// Registry metadata fixture for the bun.lock tests: three in-range versions.
const better_dx_registry_fixture =
    \\{"name":"better-dx","dist-tags":{"latest":"0.2.27"},"versions":{
    \\"0.2.25":{"dist":{"tarball":"https://registry.npmjs.org/better-dx/-/better-dx-0.2.25.tgz","integrity":"sha512-25"},"dependencies":{"buddy-bot":"^0.10.5"}},
    \\"0.2.26":{"dist":{"tarball":"https://registry.npmjs.org/better-dx/-/better-dx-0.2.26.tgz","integrity":"sha512-26"},"dependencies":{"@buddysh/buddy":"^0.11.2"}},
    \\"0.2.27":{"dist":{"tarball":"https://registry.npmjs.org/better-dx/-/better-dx-0.2.27.tgz","integrity":"sha512-27"}}}}
;

fn testBunPins(allocator: std.mem.Allocator, better_dx: []const u8) !bun_lock.BunLockPins {
    var pins = bun_lock.BunLockPins{ .allocator = allocator };
    errdefer pins.deinit();
    try pins.pins.put(allocator, try allocator.dupe(u8, "better-dx"), try allocator.dupe(u8, better_dx));
    return pins;
}

test "npm resolution prefers bun.lock's in-range pin over pantry.lock's pin and the latest match" {
    // stacksjs/stacks#2848: pantry.lock pinned better-dx 0.2.25, bun.lock 0.2.26,
    // the registry has 0.2.27, and the range is ^0.2.24. Bun installed 0.2.26 in
    // node_modules/, so pantry must install 0.2.26 in pantry/.
    const allocator = std.testing.allocator;
    const resolution_lockfile = @import("../deps/resolution/lockfile.zig");

    var pkg_cache = try PackageCache.init(allocator);
    defer pkg_cache.deinit();
    var installer = try Installer.init(allocator, &pkg_cache);
    defer installer.deinit();

    var lock = resolution_lockfile.LockFile.init(allocator);
    defer lock.deinit();
    try lock.addPackage("better-dx", "0.2.25", "https://registry.npmjs.org/better-dx/-/better-dx-0.2.25.tgz", "sha512-25");
    installer.setLockfile(&lock);
    installer.npm_cache.putRegistryJson("better-dx", better_dx_registry_fixture);

    var pins = try testBunPins(allocator, "0.2.26");
    defer pins.deinit();
    installer.setBunLockPins(&pins);

    const resolved = try installer.resolveNpmPackage("better-dx", "^0.2.24");
    defer {
        allocator.free(resolved.version);
        allocator.free(resolved.tarball_url);
        if (resolved.integrity) |i| allocator.free(i);
    }
    try std.testing.expectEqualStrings("0.2.26", resolved.version);
    try std.testing.expectEqualStrings("https://registry.npmjs.org/better-dx/-/better-dx-0.2.26.tgz", resolved.tarball_url);
    try std.testing.expectEqualStrings("sha512-26", resolved.integrity.?);

    // The pipeline's resolver walks the pinned version's own dependencies.
    const with_deps = try installer.resolveNpmPackageWithDeps("better-dx", "~0.2.24");
    defer {
        allocator.free(with_deps.version);
        allocator.free(with_deps.tarball_url);
        if (with_deps.integrity) |i| allocator.free(i);
        for (with_deps.dependencies) |dep| {
            allocator.free(dep.name);
            allocator.free(dep.version_constraint);
        }
        allocator.free(with_deps.dependencies);
    }
    try std.testing.expectEqualStrings("0.2.26", with_deps.version);
    try std.testing.expectEqual(@as(usize, 1), with_deps.dependencies.len);
    try std.testing.expectEqualStrings("@buddysh/buddy", with_deps.dependencies[0].name);
}

test "npm resolution ignores a bun.lock pin outside the range" {
    const allocator = std.testing.allocator;
    const resolution_lockfile = @import("../deps/resolution/lockfile.zig");

    var pkg_cache = try PackageCache.init(allocator);
    defer pkg_cache.deinit();
    var installer = try Installer.init(allocator, &pkg_cache);
    defer installer.deinit();

    var lock = resolution_lockfile.LockFile.init(allocator);
    defer lock.deinit();
    try lock.addPackage("better-dx", "0.2.25", "https://registry.npmjs.org/better-dx/-/better-dx-0.2.25.tgz", "sha512-25");
    installer.setLockfile(&lock);
    installer.npm_cache.putRegistryJson("better-dx", better_dx_registry_fixture);

    // bun.lock pins 0.2.26 but the range is exactly 0.2.25: pantry.lock's pin stands.
    var pins = try testBunPins(allocator, "0.2.26");
    defer pins.deinit();
    installer.setBunLockPins(&pins);

    const resolved = try installer.resolveNpmPackage("better-dx", "0.2.25");
    defer {
        allocator.free(resolved.version);
        allocator.free(resolved.tarball_url);
        if (resolved.integrity) |i| allocator.free(i);
    }
    try std.testing.expectEqualStrings("0.2.25", resolved.version);
}

test "npm resolution without a bun.lock keeps pantry.lock's pin" {
    const allocator = std.testing.allocator;
    const resolution_lockfile = @import("../deps/resolution/lockfile.zig");

    var pkg_cache = try PackageCache.init(allocator);
    defer pkg_cache.deinit();
    var installer = try Installer.init(allocator, &pkg_cache);
    defer installer.deinit();

    var lock = resolution_lockfile.LockFile.init(allocator);
    defer lock.deinit();
    try lock.addPackage("better-dx", "0.2.25", "https://registry.npmjs.org/better-dx/-/better-dx-0.2.25.tgz", "sha512-25");
    installer.setLockfile(&lock);
    installer.npm_cache.putRegistryJson("better-dx", better_dx_registry_fixture);

    const resolved = try installer.resolveNpmPackage("better-dx", "^0.2.24");
    defer {
        allocator.free(resolved.version);
        allocator.free(resolved.tarball_url);
        if (resolved.integrity) |i| allocator.free(i);
    }
    try std.testing.expectEqualStrings("0.2.25", resolved.version);
}

/// stacksjs/stacks: pantry.lock pinned @stacksjs/stx 0.2.395 under `^0.2.395`
/// and stx 0.2.396 was then published. A plain `pantry install` has to keep the
/// pin - only `pantry update` or `--force` moves it - on both resolver paths.
fn expectLockPinKept(installer: *Installer) !void {
    const allocator = std.testing.allocator;

    const resolved = try installer.resolveNpmPackage("better-dx", "^0.2.24");
    defer {
        allocator.free(resolved.version);
        allocator.free(resolved.tarball_url);
        if (resolved.integrity) |i| allocator.free(i);
    }
    try std.testing.expectEqualStrings("0.2.25", resolved.version);
    try std.testing.expectEqualStrings("https://registry.npmjs.org/better-dx/-/better-dx-0.2.25.tgz", resolved.tarball_url);

    // A different range spelling, so the L2 entry above cannot answer it.
    const with_deps = try installer.resolveNpmPackageWithDeps("better-dx", "~0.2.24");
    defer {
        allocator.free(with_deps.version);
        allocator.free(with_deps.tarball_url);
        if (with_deps.integrity) |i| allocator.free(i);
        for (with_deps.dependencies) |dep| {
            allocator.free(dep.name);
            allocator.free(dep.version_constraint);
        }
        allocator.free(with_deps.dependencies);
    }
    try std.testing.expectEqualStrings("0.2.25", with_deps.version);
    try std.testing.expectEqualStrings("sha512-25", with_deps.integrity.?);
    // The pinned version's own dependencies, not the newest release's.
    try std.testing.expectEqual(@as(usize, 1), with_deps.dependencies.len);
    try std.testing.expectEqualStrings("buddy-bot", with_deps.dependencies[0].name);
}

test "a satisfying pantry.lock pin survives a newer in-range release" {
    const allocator = std.testing.allocator;
    const resolution_lockfile = @import("../deps/resolution/lockfile.zig");

    var pkg_cache = try PackageCache.init(allocator);
    defer pkg_cache.deinit();
    var installer = try Installer.init(allocator, &pkg_cache);
    defer installer.deinit();

    var lock = resolution_lockfile.LockFile.init(allocator);
    defer lock.deinit();
    try lock.addPackage("better-dx", "0.2.25", "https://registry.npmjs.org/better-dx/-/better-dx-0.2.25.tgz", "sha512-25");
    installer.setLockfile(&lock);
    // The registry's latest is 0.2.27, which the range also admits.
    installer.npm_cache.putRegistryJson("better-dx", better_dx_registry_fixture);

    try expectLockPinKept(&installer);
}

test "a satisfying pin both lockfiles agree on survives a newer in-range release" {
    const allocator = std.testing.allocator;
    const resolution_lockfile = @import("../deps/resolution/lockfile.zig");

    var pkg_cache = try PackageCache.init(allocator);
    defer pkg_cache.deinit();
    var installer = try Installer.init(allocator, &pkg_cache);
    defer installer.deinit();

    var lock = resolution_lockfile.LockFile.init(allocator);
    defer lock.deinit();
    try lock.addPackage("better-dx", "0.2.25", "https://registry.npmjs.org/better-dx/-/better-dx-0.2.25.tgz", "sha512-25");
    installer.setLockfile(&lock);
    installer.npm_cache.putRegistryJson("better-dx", better_dx_registry_fixture);

    var pins = try testBunPins(allocator, "0.2.25");
    defer pins.deinit();
    installer.setBunLockPins(&pins);

    try expectLockPinKept(&installer);
}

test "hoisted cache does not accept an in-range version bun.lock does not pin" {
    const allocator = std.testing.allocator;
    var hcache = Installer.HoisteVersionCache.init(allocator);
    defer hcache.deinit();
    var pins = try testBunPins(allocator, "0.2.26");
    defer pins.deinit();
    hcache.bun_pins = &pins;

    // The stale pantry.lock version recorded from disk.
    hcache.put("better-dx", "0.2.25");
    try std.testing.expect(!hcache.checkSatisfies("better-dx", "^0.2.24"));
    // A range the pin does not satisfy falls back to plain semver.
    try std.testing.expect(hcache.checkSatisfies("better-dx", "0.2.25"));

    // Installing bun.lock's version replaces the stale entry.
    hcache.put("better-dx", "0.2.26");
    try std.testing.expect(hcache.checkSatisfies("better-dx", "^0.2.24"));
    // Any other version still loses to the first one recorded.
    hcache.put("better-dx", "0.2.27");
    try std.testing.expect(hcache.checkSatisfies("better-dx", "^0.2.24"));
}

test "pantryLockPin yields to a differing bun.lock pin" {
    const locked: @import("../deps/resolution/lockfile.zig").LockedVersion = .{ .version = "0.2.25", .resolved = "", .integrity = null };
    try std.testing.expectEqualStrings("0.2.25", pantryLockPin(locked, null).?.version);
    try std.testing.expectEqualStrings("0.2.25", pantryLockPin(locked, "0.2.25").?.version);
    try std.testing.expect(pantryLockPin(locked, "0.2.26") == null);
    try std.testing.expect(pantryLockPin(null, "0.2.26") == null);
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
    // Take ownership of the events. `owned_items` is a shallow copy, so it
    // shares each event's domain/version allocations — the flush worker frees
    // them when it's done. We must NOT free them here (doing so left owned_items
    // dangling and the worker double-freed them). clearRetainingCapacity drops
    // the entries without touching the strings they referenced.
    const owned_items = allocator.dupe(AnalyticsEvent, events) catch {
        analytics_mutex.unlock();
        return;
    };
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

/// sqld 0.24.1-pre.42 as the npm registry publishes it: the CLI package names
/// one optional build per platform, and each build says where it runs.
const sqld_registry_fixture =
    \\{"name":"sqld","dist-tags":{"latest":"0.24.1-pre.42"},"versions":{"0.24.1-pre.42":{
    \\"dist":{"tarball":"https://registry.npmjs.org/sqld/-/sqld-0.24.1-pre.42.tgz","integrity":"sha512-sqld"},
    \\"bin":{"sqld":".bin/sqld"},
    \\"optionalDependencies":{"@sqld/darwin-arm64":"0.24.1-pre.42","@sqld/darwin-x64":"0.24.1-pre.42","@sqld/linux-arm64":"0.24.1-pre.42","@sqld/linux-x64":"0.24.1-pre.42"}}}}
;

fn sqldPlatformFixture(comptime os: []const u8, comptime cpu: []const u8) []const u8 {
    return "{\"name\":\"@sqld/" ++ os ++ "-" ++ cpu ++ "\",\"dist-tags\":{\"latest\":\"0.24.1-pre.42\"},\"versions\":{\"0.24.1-pre.42\":{" ++
        "\"dist\":{\"tarball\":\"https://registry.npmjs.org/@sqld/" ++ os ++ "-" ++ cpu ++ "/-/" ++ os ++ "-" ++ cpu ++ "-0.24.1-pre.42.tgz\"}," ++
        "\"os\":[\"" ++ os ++ "\"],\"cpu\":[\"" ++ cpu ++ "\"]}}}";
}

test "optionalDependencies are resolved, and only this machine's platform build is installable" {
    const allocator = std.testing.allocator;
    const resolution_lockfile = @import("../deps/resolution/lockfile.zig");

    var pkg_cache = try PackageCache.init(allocator);
    defer pkg_cache.deinit();
    var installer = try Installer.init(allocator, &pkg_cache);
    defer installer.deinit();

    installer.npm_cache.putRegistryJson("sqld", sqld_registry_fixture);
    const platforms = [_]struct { name: []const u8, json: []const u8, os: []const u8, cpu: []const u8 }{
        .{ .name = "@sqld/darwin-arm64", .json = sqldPlatformFixture("darwin", "arm64"), .os = "darwin", .cpu = "arm64" },
        .{ .name = "@sqld/darwin-x64", .json = sqldPlatformFixture("darwin", "x64"), .os = "darwin", .cpu = "x64" },
        .{ .name = "@sqld/linux-arm64", .json = sqldPlatformFixture("linux", "arm64"), .os = "linux", .cpu = "arm64" },
        .{ .name = "@sqld/linux-x64", .json = sqldPlatformFixture("linux", "x64"), .os = "linux", .cpu = "x64" },
    };
    for (platforms) |p| installer.npm_cache.putRegistryJson(p.name, p.json);

    // A lock (written on some other machine) that records every platform's
    // build must not make a foreign one look installable here.
    var lock = resolution_lockfile.LockFile.init(allocator);
    defer lock.deinit();
    for (platforms) |p| try lock.addPackage(p.name, "0.24.1-pre.42", "", null);
    // And the parent's own pin must not cost it its dependencies: answering
    // from the lock alone returned none, so a reinstall over an existing
    // pantry.lock never reached any package beneath the top level.
    try lock.addPackage("sqld", "0.24.1-pre.42", "registry:sqld@0.24.1-pre.42", null);
    installer.setLockfile(&lock);

    var parent = try installer.resolveNpmPackageWithDeps("sqld", "0.24.1-pre.42");
    defer parent.deinit(installer.allocator);
    try std.testing.expect(parent.platform_ok);
    try std.testing.expectEqual(@as(usize, 4), parent.dependencies.len);
    for (parent.dependencies) |dep| {
        try std.testing.expect(dep.is_optional);
        try std.testing.expectEqualStrings("0.24.1-pre.42", dep.version_constraint);
    }

    const host = npm_platform.Host.current();
    var host_matches: usize = 0;
    for (platforms) |p| {
        var r = try installer.resolveNpmPackageWithDeps(p.name, "0.24.1-pre.42");
        defer r.deinit(installer.allocator);
        const want = std.mem.eql(u8, p.os, host.os) and std.mem.eql(u8, p.cpu, host.cpu);
        try std.testing.expectEqual(want, r.platform_ok);
        if (r.platform_ok) host_matches += 1;
    }
    // On the platforms the fixture covers, exactly one build is ours.
    const covered = (std.mem.eql(u8, host.os, "darwin") or std.mem.eql(u8, host.os, "linux")) and
        (std.mem.eql(u8, host.cpu, "arm64") or std.mem.eql(u8, host.cpu, "x64"));
    try std.testing.expectEqual(@as(usize, if (covered) 1 else 0), host_matches);
}

test "an exact prerelease resolves to itself, not the first prerelease of its release" {
    const allocator = std.testing.allocator;
    var pkg_cache = try PackageCache.init(allocator);
    defer pkg_cache.deinit();
    var installer = try Installer.init(allocator, &pkg_cache);
    defer installer.deinit();

    const json =
        \\{"name":"@sqld/darwin-arm64","dist-tags":{"latest":"0.24.1-pre.42"},"versions":{
        \\"0.24.1-pre.1":{},"0.24.1-pre.9":{},"0.24.1-pre.42":{},"0.24.1-pre.10":{}}}
    ;
    const parsed = try std.json.parseFromSlice(std.json.Value, allocator, json, .{});
    defer parsed.deinit();
    try std.testing.expectEqualStrings("0.24.1-pre.42", try installer.resolveNpmVersion(parsed.value, "0.24.1-pre.42"));
    try std.testing.expectEqualStrings("0.24.1-pre.9", try installer.resolveNpmVersion(parsed.value, "=0.24.1-pre.9"));
}

test "project links stay inside pantry/ when it is installed through a worktree's symlink that then disappears" {
    // A git worktree whose `pantry` resolved to the main checkout's pantry
    // ran `pantry install`; the version aliases, .bin links and .bin shims it
    // rewrote pointed into the worktree, so deleting the worktree broke git,
    // bun, and every dylib loaded through `zlib.net/v1`.
    if (@import("builtin").os.tag == .windows) return error.SkipZigTest;
    const allocator = std.testing.allocator;
    var arena_state = std.heap.ArenaAllocator.init(allocator);
    defer arena_state.deinit();
    const arena = arena_state.allocator();

    var tmp_dir = std.testing.tmpDir(.{});
    defer tmp_dir.cleanup();
    var root_buf: [std.fs.max_path_bytes]u8 = undefined;
    const root = root_buf[0..try tmp_dir.dir.realPath(io_helper.io, &root_buf)];
    const at = struct {
        fn path(a: std.mem.Allocator, base: []const u8, sub: []const u8) []const u8 {
            return std.fmt.allocPrint(a, "{s}/{s}", .{ base, sub }) catch @panic("oom");
        }
    }.path;

    const files = [_]struct { sub: []const u8, body: []const u8 }{
        .{ .sub = "main/pantry/zlib.net/v1.3.2/lib/libz.dylib", .body = "" },
        // git's wrapper finds its data through $0, which is why it is shimmed.
        .{ .sub = "main/pantry/git-scm.org/v2.53.0/bin/git", .body = "#!/bin/sh\ncat \"$(dirname \"$0\")/../share/msg\"\n" },
        .{ .sub = "main/pantry/git-scm.org/v2.53.0/share/msg", .body = "git-ok\n" },
        // No `#!`: activated like a native binary; sh still runs it.
        .{ .sub = "main/pantry/bun.sh/v1.3.14/bin/bun", .body = "echo \"$@\"\n" },
    };
    for (files) |entry| {
        const path = at(arena, root, entry.sub);
        try io_helper.makePath(std.fs.path.dirname(path).?);
        const file = try io_helper.createFile(path, .{});
        try io_helper.writeAllToFile(file, entry.body);
        io_helper.closeFile(file);
        const z = try arena.dupeSentinel(u8, path, 0);
        _ = std.c.chmod(z, 0o755);
    }
    try io_helper.makePath(at(arena, root, "wt"));
    try io_helper.symLink(at(arena, root, "main/pantry"), at(arena, root, "wt/pantry"));

    var pkg_cache = try PackageCache.init(allocator);
    defer pkg_cache.deinit();
    var installer = try Installer.init(allocator, &pkg_cache);
    defer installer.deinit();

    const wt = at(arena, root, "wt");
    try installer.createProjectSymlinks(wt, "zlib.net", "1.3.2", at(arena, root, "wt/pantry/zlib.net/v1.3.2"));
    try installer.createProjectSymlinks(wt, "git-scm.org", "2.53.0", at(arena, root, "wt/pantry/git-scm.org/v2.53.0"));
    try installer.createProjectSymlinks(wt, "bun.sh", "1.3.14", at(arena, root, "wt/pantry/bun.sh/v1.3.14"));

    // Relative, and never through the worktree.
    try std.testing.expectEqualStrings("v1.3.2", try io_helper.readLinkAlloc(arena, at(arena, root, "main/pantry/zlib.net/v1")));
    try std.testing.expectEqualStrings("v1.3.2", try io_helper.readLinkAlloc(arena, at(arena, root, "main/pantry/zlib.net/v1.3")));
    const bun_shim = try io_helper.readFileAlloc(arena, at(arena, root, "main/pantry/.bin/bun"), 4096);
    try std.testing.expect(std.mem.indexOf(u8, bun_shim, "\"$d/../bun.sh/v1.3.14/bin/bun\"") != null);
    try std.testing.expect(std.mem.indexOf(u8, bun_shim, root) == null);
    const shim = try io_helper.readFileAlloc(arena, at(arena, root, "main/pantry/.bin/git"), 4096);
    try std.testing.expect(std.mem.indexOf(u8, shim, "\"$d/../git-scm.org/v2.53.0/bin/git\"") != null);
    try std.testing.expect(std.mem.indexOf(u8, shim, root) == null);

    try io_helper.deleteFile(at(arena, root, "wt/pantry"));
    try io_helper.deleteTree(wt);
    try io_helper.rename(at(arena, root, "main"), at(arena, root, "moved"));

    try io_helper.accessAbsolute(at(arena, root, "moved/pantry/zlib.net/v1/lib/libz.dylib"), .{});
    try io_helper.accessAbsolute(at(arena, root, "moved/pantry/zlib.net/v1.3/lib/libz.dylib"), .{});
    const cases = [_]struct { cmd: []const u8, out: []const u8 }{
        .{ .cmd = "moved/pantry/.bin/git", .out = "git-ok\n" },
        .{ .cmd = "moved/pantry/.bin/bun hi", .out = "hi\n" },
    };
    for (cases) |case| {
        const result = try io_helper.childRunWithOptions(arena, &.{ "/bin/sh", "-c", case.cmd }, .{ .cwd = root });
        try std.testing.expect(result.term == .exited and result.term.exited == 0);
        try std.testing.expectEqualStrings(case.out, result.stdout);
    }
}

test "verified materialization preserves executables beneath lib without making data executable" {
    if (@import("builtin").os.tag == .windows) return error.SkipZigTest;
    const allocator = std.testing.allocator;
    var pkg_cache = try PackageCache.init(allocator);
    defer pkg_cache.deinit();
    var installer = try Installer.init(allocator, &pkg_cache);
    defer installer.deinit();
    var tmp = std.testing.tmpDir(.{});
    defer tmp.cleanup();
    try tmp.dir.createDirPath(io_helper.io, "source/bin");
    try tmp.dir.createDirPath(io_helper.io, "source/lib/application");
    try tmp.dir.writeFile(io_helper.io, .{ .sub_path = "source/lib/application/chrome", .data = "#!/bin/sh\nprintf 'owned-helper-ok\\n'\n" });
    try tmp.dir.writeFile(io_helper.io, .{ .sub_path = "source/lib/application/data", .data = "owned-data" });
    var root_buf: [std.fs.max_path_bytes]u8 = undefined;
    const root_len = try tmp.dir.realPathFile(io_helper.io, ".", &root_buf);
    const root = root_buf[0..root_len];
    const source = try std.fs.path.join(allocator, &.{ root, "source" });
    defer allocator.free(source);
    const dest = try std.fs.path.join(allocator, &.{ root, "installed" });
    defer allocator.free(dest);
    const program = try std.fs.path.join(allocator, &.{ source, "lib/application/chrome" });
    defer allocator.free(program);
    const file = try io_helper.openFileAbsolute(program, .{});
    try file.setPermissions(io_helper.io, io_helper.File.Permissions.fromMode(0o751));
    file.close(io_helper.io);
    const link = try std.fs.path.join(allocator, &.{ source, "bin/google-chrome-stable" });
    defer allocator.free(link);
    try io_helper.symLink("../lib/application/chrome", link);
    try installer.materializeVerifiedProjectPackage(source, dest, "google.com/chrome");
    const installed = try std.fs.path.join(allocator, &.{ dest, "bin/google-chrome-stable" });
    defer allocator.free(installed);
    const result = try io_helper.childRun(allocator, &.{installed});
    defer allocator.free(result.stdout);
    defer allocator.free(result.stderr);
    try std.testing.expect(result.term == .exited and result.term.exited == 0);
    try std.testing.expectEqualStrings("owned-helper-ok\n", result.stdout);
    const data = try std.fs.path.join(allocator, &.{ dest, "lib/application/data" });
    defer allocator.free(data);
    try std.testing.expect(!io_helper.isExecutable(data));
}

test "verified legacy execute-only helper installs and runs without a privileged copy" {
    if (@import("builtin").os.tag == .windows) return error.SkipZigTest;
    const allocator = std.testing.allocator;
    var pkg_cache = try PackageCache.init(allocator);
    defer pkg_cache.deinit();
    var installer = try Installer.init(allocator, &pkg_cache);
    defer installer.deinit();
    var tmp = std.testing.tmpDir(.{});
    defer tmp.cleanup();
    var root_buf: [std.fs.max_path_bytes]u8 = undefined;
    const root_len = try tmp.dir.realPathFile(io_helper.io, ".", &root_buf);
    const root = root_buf[0..root_len];
    try tmp.dir.writeFile(io_helper.io, .{ .sub_path = "original.tar.gz", .data = @embedFile("fixtures/execute-only-package.tar.gz") });
    const archive = try std.fs.path.join(allocator, &.{ root, "original.tar.gz" });
    defer allocator.free(archive);
    const before = try extractor.computeChecksum(allocator, archive);
    defer allocator.free(before);
    var staging = try verified_staging.Extraction.init(allocator, root);
    defer staging.deinit();
    try staging.extractVerified(archive, "tar.gz", null, false);
    const dest = try std.fs.path.join(allocator, &.{ root, "installed" });
    defer allocator.free(dest);
    try installer.materializeVerifiedProjectPackage(staging.payload, dest, "example.invalid");
    const helper = try std.fs.path.join(allocator, &.{ dest, "bin/helper" });
    defer allocator.free(helper);
    const result = try io_helper.childRun(allocator, &.{helper});
    defer allocator.free(result.stdout);
    defer allocator.free(result.stderr);
    try std.testing.expect(result.term == .exited and result.term.exited == 0);
    try std.testing.expectEqualStrings("legacy-helper-ok\n", result.stdout);
    const helper_stat = try io_helper.cwd().statFile(io_helper.io, helper, .{});
    try std.testing.expectEqual(@as(u32, 0o510), helper_stat.permissions.toMode() & 0o7777);
    const data = try std.fs.path.join(allocator, &.{ dest, "share/data" });
    defer allocator.free(data);
    const data_stat = try io_helper.cwd().statFile(io_helper.io, data, .{});
    try std.testing.expectEqual(@as(u32, 0o644), data_stat.permissions.toMode() & 0o7777);
    const after = try extractor.computeChecksum(allocator, archive);
    defer allocator.free(after);
    try std.testing.expectEqualStrings(before, after);
}

test "verified materialization accepts the published data-only CA package without executable permissions" {
    const allocator = std.testing.allocator;
    var pkg_cache = try PackageCache.init(allocator);
    defer pkg_cache.deinit();
    var installer = try Installer.init(allocator, &pkg_cache);
    defer installer.deinit();
    var tmp = std.testing.tmpDir(.{});
    defer tmp.cleanup();
    try tmp.dir.createDirPath(io_helper.io, "source/ssl");
    try tmp.dir.writeFile(io_helper.io, .{ .sub_path = "source/ssl/cert.pem", .data = "-----BEGIN CERTIFICATE-----\nfixture\n-----END CERTIFICATE-----\n" });
    var root_buf: [std.fs.max_path_bytes]u8 = undefined;
    const root_len = try tmp.dir.realPathFile(io_helper.io, ".", &root_buf);
    const source = try std.fs.path.join(allocator, &.{ root_buf[0..root_len], "source" });
    defer allocator.free(source);
    const dest = try std.fs.path.join(allocator, &.{ root_buf[0..root_len], "installed" });
    defer allocator.free(dest);
    try installer.materializeVerifiedProjectPackage(source, dest, "curl.se/ca-certs");
    const bundle = try std.fs.path.join(allocator, &.{ dest, "ssl/cert.pem" });
    defer allocator.free(bundle);
    const bytes = try io_helper.readFileAlloc(allocator, bundle, 1024);
    defer allocator.free(bytes);
    try std.testing.expect(std.mem.indexOf(u8, bytes, "BEGIN CERTIFICATE") != null);
    if (@import("builtin").os.tag != .windows) try std.testing.expect(!io_helper.isExecutable(bundle));
}

// Real filesystem fixtures for publication, with failures injected only at the
// operation boundary. Production has no environment switches for these cases.
const MaterializationFixture = struct {
    allocator: std.mem.Allocator,
    temporary: std.testing.TmpDir,
    root: []const u8,
    destination: []const u8,
    extraction: verified_staging.Extraction,
    payload_bytes: u64,

    fn init(allocator: std.mem.Allocator) !@This() {
        var temporary = std.testing.tmpDir(.{});
        errdefer temporary.cleanup();
        var buffer: [std.fs.max_path_bytes]u8 = undefined;
        const length = try temporary.dir.realPathFile(io_helper.io, ".", &buffer);
        const root = try allocator.dupe(u8, buffer[0..length]);
        errdefer allocator.free(root);
        try temporary.dir.createDirPath(io_helper.io, "seed/bin");
        try temporary.dir.createDirPath(io_helper.io, "seed/libexec");
        try temporary.dir.createDirPath(io_helper.io, "seed/share");
        try temporary.dir.writeFile(io_helper.io, .{
            .sub_path = "seed/libexec/chrome",
            .data = "#!/bin/sh\ncat \"$(dirname \"$0\")/../share/marker\"\n",
        });
        try temporary.dir.writeFile(io_helper.io, .{ .sub_path = "seed/share/marker", .data = "owned-resource\n" });
        const blob = try allocator.alloc(u8, 8 * 1024 * 1024 + 137);
        defer allocator.free(blob);
        @memset(blob, 0x5a);
        try temporary.dir.writeFile(io_helper.io, .{ .sub_path = "seed/share/blob", .data = blob });
        const seed = try std.fs.path.join(allocator, &.{ root, "seed" });
        defer allocator.free(seed);
        const program = try std.fs.path.join(allocator, &.{ seed, "libexec/chrome" });
        defer allocator.free(program);
        const program_file = try io_helper.openFileAbsolute(program, .{});
        defer program_file.close(io_helper.io);
        try program_file.setPermissions(io_helper.io, io_helper.File.Permissions.fromMode(0o751));
        const link = try std.fs.path.join(allocator, &.{ seed, "bin/google-chrome-stable" });
        defer allocator.free(link);
        try io_helper.symLink("../libexec/chrome", link);
        const archive = try std.fs.path.join(allocator, &.{ root, "original.tar.gz" });
        defer allocator.free(archive);
        const packed = try io_helper.childRun(allocator, &.{ "/usr/bin/tar", "-czf", archive, "-C", seed, "." });
        defer allocator.free(packed.stdout);
        defer allocator.free(packed.stderr);
        if (packed.term != .exited or packed.term.exited != 0) return error.MaterializationFixtureArchiveFailed;
        var extraction = try verified_staging.Extraction.init(allocator, root);
        errdefer extraction.deinit();
        try extraction.extractVerified(archive, "tar.gz", null, false);
        const destination = try std.fs.path.join(allocator, &.{ root, "installed/v1" });
        errdefer allocator.free(destination);
        return .{
            .allocator = allocator,
            .temporary = temporary,
            .root = root,
            .destination = destination,
            .payload_bytes = try materializationRegularBytes(allocator, extraction.payload),
            .extraction = extraction,
        };
    }

    fn deinit(self: *@This()) void {
        self.extraction.deinit();
        materialization.removeOwnedTree(self.allocator, self.root) catch {};
        self.temporary.cleanup();
        self.allocator.free(self.destination);
        self.allocator.free(self.root);
    }

    fn owned(self: *const @This()) materialization.Source {
        return .{ .exclusive = .{ .extraction = &self.extraction, .path = self.extraction.payload } };
    }

    fn installOld(self: *const @This()) !void {
        try io_helper.makePath(self.destination);
        const marker = try std.fs.path.join(self.allocator, &.{ self.destination, "old" });
        defer self.allocator.free(marker);
        const file = try io_helper.createFileAbsolute(marker, .{});
        defer file.close(io_helper.io);
        try io_helper.writeAllToFile(file, "previous-installation");
    }

    fn expectOld(self: *const @This()) !void {
        const marker = try std.fs.path.join(self.allocator, &.{ self.destination, "old" });
        defer self.allocator.free(marker);
        const bytes = try io_helper.readFileAlloc(self.allocator, marker, 128);
        defer self.allocator.free(bytes);
        try std.testing.expectEqualStrings("previous-installation", bytes);
    }

    fn expectNoTransaction(self: *const @This()) !void {
        var directory = try io_helper.openDirAbsoluteForIteration(std.fs.path.dirname(self.destination).?);
        defer directory.close();
        var entries = directory.iterate();
        while (try entries.next()) |entry|
            try std.testing.expectEqualStrings("v1", entry.name);
    }
};

fn materializationRegularBytes(allocator: std.mem.Allocator, path: []const u8) !u64 {
    const metadata = io_helper.cwd().statFile(io_helper.io, path, .{ .follow_symlinks = false }) catch |err| {
        if (err == error.FileNotFound) return 0;
        return err;
    };
    if (metadata.kind == .file) return metadata.size;
    if (metadata.kind != .directory) return 0;
    var directory = try io_helper.openDirAbsoluteForIteration(path);
    defer directory.close();
    var entries = directory.iterate();
    var total: u64 = 0;
    while (try entries.next()) |entry| {
        const child = try std.fs.path.join(allocator, &.{ path, entry.name });
        defer allocator.free(child);
        total += try materializationRegularBytes(allocator, child);
    }
    return total;
}

const MaterializationTestOperations = struct {
    fixture: *const MaterializationFixture,
    installer: *Installer,
    source_rename_error: ?anyerror = null,
    fail_copy: bool = false,
    fail_retire: bool = false,
    fail_commit: bool = false,
    fail_rollback: bool = false,
    copy_calls: usize = 0,
    cross_device_errors: usize = 0,
    partial_bytes_written: usize = 0,
    staged_regular_bytes: u64 = 0,

    pub fn copy(self: *@This(), source: []const u8, destination: []const u8) !void {
        self.copy_calls += 1;
        if (self.fail_copy) {
            try io_helper.makePath(destination);
            const path = try std.fs.path.join(self.fixture.allocator, &.{ destination, "partial" });
            defer self.fixture.allocator.free(path);
            const file = try io_helper.createFileAbsolute(path, .{});
            defer file.close(io_helper.io);
            const bytes = [_]u8{0xab} ** (65536 + 1);
            try io_helper.writeAllToFile(file, &bytes);
            self.partial_bytes_written = @intCast((try file.stat(io_helper.io)).size);
            return error.NoSpaceLeft;
        }
        try self.installer.copyDirectoryStructure(source, destination);
        self.staged_regular_bytes = try materializationRegularBytes(self.fixture.allocator, source) +
            try materializationRegularBytes(self.fixture.allocator, destination);
    }

    pub fn rename(self: *@This(), source: []const u8, destination: []const u8) !void {
        const source_move = std.mem.eql(u8, source, self.fixture.extraction.payload);
        if (source_move) {
            if (self.source_rename_error) |err| return err;
        } else if (std.mem.eql(u8, source, self.fixture.destination)) {
            if (self.fail_retire) return error.AccessDenied;
        } else if (std.mem.eql(u8, destination, self.fixture.destination)) {
            if (std.mem.eql(u8, std.fs.path.basename(source), "previous")) {
                if (self.fail_rollback) return error.AccessDenied;
            } else if (self.fail_commit) return error.AccessDenied;
        }
        io_helper.renameClassified(source, destination) catch |err| {
            if (err == error.CrossDevice) self.cross_device_errors += 1;
            return err;
        };
        if (source_move) {
            self.staged_regular_bytes = try materializationRegularBytes(self.fixture.allocator, source) +
                try materializationRegularBytes(self.fixture.allocator, destination);
        }
    }
};

test "native materialization: exclusive verified extraction moves without a second expanded payload and keeps executable resources" {
    if (@import("builtin").os.tag == .windows) return error.SkipZigTest;
    const allocator = std.testing.allocator;
    var pkg_cache = try PackageCache.init(allocator);
    defer pkg_cache.deinit();
    var installer = try Installer.init(allocator, &pkg_cache);
    defer installer.deinit();
    var fixture = try MaterializationFixture.init(allocator);
    defer fixture.deinit();
    const blob = try std.fs.path.join(allocator, &.{ fixture.extraction.payload, "share/blob" });
    defer allocator.free(blob);
    const before = try io_helper.cwd().statFile(io_helper.io, blob, .{});
    const original_hash = try extractor.computeChecksum(allocator, blob);
    defer allocator.free(original_hash);
    const validation = Installer.MaterializationValidation{ .installer = &installer, .domain = "google.com/chrome", .version = null };
    var operations = MaterializationTestOperations{ .fixture = &fixture, .installer = &installer };
    try std.testing.expectEqual(materialization.Outcome.moved, try materialization.publish(allocator, fixture.owned(), fixture.destination, &validation, &operations));
    try std.testing.expectEqual(@as(usize, 0), operations.copy_calls);
    try std.testing.expectEqual(fixture.payload_bytes, operations.staged_regular_bytes);
    try std.testing.expectError(error.FileNotFound, io_helper.cwd().statFile(io_helper.io, fixture.extraction.payload, .{}));
    const installed_blob = try std.fs.path.join(allocator, &.{ fixture.destination, "share/blob" });
    defer allocator.free(installed_blob);
    const after = try io_helper.cwd().statFile(io_helper.io, installed_blob, .{});
    try std.testing.expectEqual(before.inode, after.inode);
    try std.testing.expectEqual(before.size, after.size);
    const installed_hash = try extractor.computeChecksum(allocator, installed_blob);
    defer allocator.free(installed_hash);
    try std.testing.expectEqualStrings(original_hash, installed_hash);
    const entry = try std.fs.path.join(allocator, &.{ fixture.destination, "bin/google-chrome-stable" });
    defer allocator.free(entry);
    const link = try io_helper.readLinkAlloc(allocator, entry);
    defer allocator.free(link);
    try std.testing.expectEqualStrings("../libexec/chrome", link);
    const result = try io_helper.childRun(allocator, &.{entry});
    defer allocator.free(result.stdout);
    defer allocator.free(result.stderr);
    try std.testing.expect(result.term == .exited and result.term.exited == 0);
    try std.testing.expectEqualStrings("owned-resource\n", result.stdout);
    const program = try std.fs.path.join(allocator, &.{ fixture.destination, "libexec/chrome" });
    defer allocator.free(program);
    try std.testing.expectEqual(@as(u32, 0o751), (try io_helper.cwd().statFile(io_helper.io, program, .{})).permissions.toMode() & 0o7777);
    try fixture.expectNoTransaction();
    std.debug.print("[pantry:materialize:test] exclusive payload={d}B stage-snapshot={d}B copies={d}; inode preserved (logical bytes, not filesystem peak)\n", .{ fixture.payload_bytes, operations.staged_regular_bytes, operations.copy_calls });
}

test "native materialization: shared cache publication copies and preserves the original immutable tree" {
    if (@import("builtin").os.tag == .windows) return error.SkipZigTest;
    const allocator = std.testing.allocator;
    var pkg_cache = try PackageCache.init(allocator);
    defer pkg_cache.deinit();
    var installer = try Installer.init(allocator, &pkg_cache);
    defer installer.deinit();
    var fixture = try MaterializationFixture.init(allocator);
    defer fixture.deinit();
    const shared_directory = try std.fs.path.join(allocator, &.{ fixture.extraction.payload, "share" });
    defer allocator.free(shared_directory);
    const shared_directory_z = try io_helper.dupeZ(allocator, u8, shared_directory);
    defer allocator.free(shared_directory_z);
    if (std.c.chmod(shared_directory_z, 0o555) != 0) return error.SharedFixtureModeFailed;
    const shared_blob = try std.fs.path.join(allocator, &.{ shared_directory, "blob" });
    defer allocator.free(shared_blob);
    const before = try io_helper.cwd().statFile(io_helper.io, shared_blob, .{});
    const before_hash = try extractor.computeChecksum(allocator, shared_blob);
    defer allocator.free(before_hash);
    const validation = Installer.MaterializationValidation{ .installer = &installer, .domain = "google.com/chrome", .version = null };
    var operations = MaterializationTestOperations{ .fixture = &fixture, .installer = &installer };
    try std.testing.expectEqual(materialization.Outcome.copied, try materialization.publish(allocator, .{ .shared = fixture.extraction.payload }, fixture.destination, &validation, &operations));
    try std.testing.expectEqual(@as(usize, 1), operations.copy_calls);
    try std.testing.expectEqual(2 * fixture.payload_bytes, operations.staged_regular_bytes);
    try std.testing.expectEqual(fixture.payload_bytes, try materializationRegularBytes(allocator, fixture.extraction.payload));
    try std.testing.expectEqual(fixture.payload_bytes, try materializationRegularBytes(allocator, fixture.destination));
    try std.testing.expectEqual(before.inode, (try io_helper.cwd().statFile(io_helper.io, shared_blob, .{})).inode);
    const after_hash = try extractor.computeChecksum(allocator, shared_blob);
    defer allocator.free(after_hash);
    try std.testing.expectEqualStrings(before_hash, after_hash);
    try std.testing.expectEqual(@as(u32, 0o555), (try io_helper.cwd().statFile(io_helper.io, shared_directory, .{})).permissions.toMode() & 0o7777);
    const installed_directory = try std.fs.path.join(allocator, &.{ fixture.destination, "share" });
    defer allocator.free(installed_directory);
    try std.testing.expectEqual(@as(u32, 0o555), (try io_helper.cwd().statFile(io_helper.io, installed_directory, .{})).permissions.toMode() & 0o7777);
    try fixture.expectNoTransaction();
}

test "native materialization: exclusive ownership rejects unverified and outside directories before changing a destination" {
    if (@import("builtin").os.tag == .windows) return error.SkipZigTest;
    const allocator = std.testing.allocator;
    var pkg_cache = try PackageCache.init(allocator);
    defer pkg_cache.deinit();
    var installer = try Installer.init(allocator, &pkg_cache);
    defer installer.deinit();
    var fixture = try MaterializationFixture.init(allocator);
    defer fixture.deinit();
    try fixture.installOld();
    var unverified = try verified_staging.Extraction.init(allocator, fixture.root);
    defer unverified.deinit();
    const validation = Installer.MaterializationValidation{ .installer = &installer, .domain = "google.com/chrome", .version = null };
    var operations = MaterializationTestOperations{ .fixture = &fixture, .installer = &installer };
    try std.testing.expectError(error.UnverifiedExtraction, materialization.publish(allocator, .{ .exclusive = .{ .extraction = &unverified, .path = fixture.extraction.payload } }, fixture.destination, &validation, &operations));
    try std.testing.expectError(error.UnownedPackageSource, materialization.publish(allocator, .{ .exclusive = .{ .extraction = &fixture.extraction, .path = fixture.root } }, fixture.destination, &validation, &operations));
    try std.testing.expectEqual(@as(usize, 0), operations.copy_calls);
    try fixture.expectOld();
    try fixture.expectNoTransaction();
}

test "native materialization: an ordinary rename failure never falls back to copying and preserves the old package" {
    if (@import("builtin").os.tag == .windows) return error.SkipZigTest;
    const allocator = std.testing.allocator;
    var pkg_cache = try PackageCache.init(allocator);
    defer pkg_cache.deinit();
    var installer = try Installer.init(allocator, &pkg_cache);
    defer installer.deinit();
    var fixture = try MaterializationFixture.init(allocator);
    defer fixture.deinit();
    try fixture.installOld();
    const validation = Installer.MaterializationValidation{ .installer = &installer, .domain = "google.com/chrome", .version = null };
    for ([_]anyerror{ error.AccessDenied, error.NoSpaceLeft, error.RenameError, error.Canceled }) |failure| {
        var operations = MaterializationTestOperations{ .fixture = &fixture, .installer = &installer, .source_rename_error = failure };
        try std.testing.expectError(failure, materialization.publish(allocator, fixture.owned(), fixture.destination, &validation, &operations));
        try std.testing.expectEqual(@as(usize, 0), operations.copy_calls);
        try fixture.expectOld();
        try fixture.expectNoTransaction();
    }
}

test "native materialization: a copy failing beyond 64KiB removes its candidate and leaves shared source and destination intact" {
    if (@import("builtin").os.tag == .windows) return error.SkipZigTest;
    const allocator = std.testing.allocator;
    var pkg_cache = try PackageCache.init(allocator);
    defer pkg_cache.deinit();
    var installer = try Installer.init(allocator, &pkg_cache);
    defer installer.deinit();
    var fixture = try MaterializationFixture.init(allocator);
    defer fixture.deinit();
    try fixture.installOld();
    const validation = Installer.MaterializationValidation{ .installer = &installer, .domain = "google.com/chrome", .version = null };
    var operations = MaterializationTestOperations{ .fixture = &fixture, .installer = &installer, .fail_copy = true };
    try std.testing.expectError(error.NoSpaceLeft, materialization.publish(allocator, .{ .shared = fixture.extraction.payload }, fixture.destination, &validation, &operations));
    try std.testing.expect(operations.partial_bytes_written > 65536);
    try std.testing.expectEqual(fixture.payload_bytes, try materializationRegularBytes(allocator, fixture.extraction.payload));
    try fixture.expectOld();
    try fixture.expectNoTransaction();
}

test "native materialization: failed commit rolls back the old destination and cleans the consumed candidate" {
    if (@import("builtin").os.tag == .windows) return error.SkipZigTest;
    const allocator = std.testing.allocator;
    var pkg_cache = try PackageCache.init(allocator);
    defer pkg_cache.deinit();
    var installer = try Installer.init(allocator, &pkg_cache);
    defer installer.deinit();
    var fixture = try MaterializationFixture.init(allocator);
    defer fixture.deinit();
    try fixture.installOld();
    const validation = Installer.MaterializationValidation{ .installer = &installer, .domain = "google.com/chrome", .version = null };
    var operations = MaterializationTestOperations{ .fixture = &fixture, .installer = &installer, .fail_commit = true };
    try std.testing.expectError(error.AccessDenied, materialization.publish(allocator, fixture.owned(), fixture.destination, &validation, &operations));
    try fixture.expectOld();
    try fixture.expectNoTransaction();
}

test "native materialization: real cross-device extraction move falls back only on the filesystem's CrossDevice error" {
    if (@import("builtin").os.tag != .linux) return error.SkipZigTest;
    const allocator = std.testing.allocator;
    var pkg_cache = try PackageCache.init(allocator);
    defer pkg_cache.deinit();
    var installer = try Installer.init(allocator, &pkg_cache);
    defer installer.deinit();
    var fixture = try MaterializationFixture.init(allocator);
    defer fixture.deinit();
    var other_filesystem = try verified_staging.Extraction.init(allocator, "/dev/shm");
    defer other_filesystem.deinit();
    const destination = try std.fs.path.join(allocator, &.{ other_filesystem.root, "installed/v1" });
    allocator.free(fixture.destination);
    fixture.destination = destination;
    const validation = Installer.MaterializationValidation{ .installer = &installer, .domain = "google.com/chrome", .version = null };
    var operations = MaterializationTestOperations{ .fixture = &fixture, .installer = &installer };
    try std.testing.expectEqual(materialization.Outcome.cross_device_copy, try materialization.publish(allocator, fixture.owned(), fixture.destination, &validation, &operations));
    try std.testing.expectEqual(@as(usize, 1), operations.cross_device_errors);
    try std.testing.expectEqual(@as(usize, 1), operations.copy_calls);
    try std.testing.expectEqual(fixture.payload_bytes, try materializationRegularBytes(allocator, fixture.extraction.payload));
    try std.testing.expectEqual(fixture.payload_bytes, try materializationRegularBytes(allocator, fixture.destination));
    try fixture.expectNoTransaction();
}

test "native materialization: failure to retire an old destination leaves it untouched and removes the new candidate" {
    if (@import("builtin").os.tag == .windows) return error.SkipZigTest;
    const allocator = std.testing.allocator;
    var pkg_cache = try PackageCache.init(allocator);
    defer pkg_cache.deinit();
    var installer = try Installer.init(allocator, &pkg_cache);
    defer installer.deinit();
    var fixture = try MaterializationFixture.init(allocator);
    defer fixture.deinit();
    try fixture.installOld();
    const validation = Installer.MaterializationValidation{ .installer = &installer, .domain = "google.com/chrome", .version = null };
    var operations = MaterializationTestOperations{ .fixture = &fixture, .installer = &installer, .fail_retire = true };
    try std.testing.expectError(error.AccessDenied, materialization.publish(allocator, fixture.owned(), fixture.destination, &validation, &operations));
    try fixture.expectOld();
    try fixture.expectNoTransaction();
}

test "native materialization: candidate validation failure cannot displace the previous installation" {
    if (@import("builtin").os.tag == .windows) return error.SkipZigTest;
    const allocator = std.testing.allocator;
    var pkg_cache = try PackageCache.init(allocator);
    defer pkg_cache.deinit();
    var installer = try Installer.init(allocator, &pkg_cache);
    defer installer.deinit();
    var fixture = try MaterializationFixture.init(allocator);
    defer fixture.deinit();
    try fixture.installOld();
    const Validation = struct {
        original: []const u8,
        base: Installer.MaterializationValidation,
        pub fn check(self: *const @This(), path: []const u8) bool {
            return std.mem.eql(u8, self.original, path) and self.base.check(path);
        }
    };
    const validation = Validation{ .original = fixture.extraction.payload, .base = .{ .installer = &installer, .domain = "google.com/chrome", .version = null } };
    var operations = MaterializationTestOperations{ .fixture = &fixture, .installer = &installer };
    try std.testing.expectError(error.InvalidPackageMaterialization, materialization.publish(allocator, fixture.owned(), fixture.destination, &validation, &operations));
    try fixture.expectOld();
    try fixture.expectNoTransaction();
}

test "native materialization: a failed rollback retains the old package for recovery instead of deleting the backup" {
    if (@import("builtin").os.tag == .windows) return error.SkipZigTest;
    const allocator = std.testing.allocator;
    var pkg_cache = try PackageCache.init(allocator);
    defer pkg_cache.deinit();
    var installer = try Installer.init(allocator, &pkg_cache);
    defer installer.deinit();
    var fixture = try MaterializationFixture.init(allocator);
    defer fixture.deinit();
    try fixture.installOld();
    const validation = Installer.MaterializationValidation{ .installer = &installer, .domain = "google.com/chrome", .version = null };
    var operations = MaterializationTestOperations{ .fixture = &fixture, .installer = &installer, .fail_commit = true, .fail_rollback = true };
    try std.testing.expectError(error.PackageRollbackFailed, materialization.publish(allocator, fixture.owned(), fixture.destination, &validation, &operations));
    try std.testing.expectError(error.FileNotFound, io_helper.cwd().statFile(io_helper.io, fixture.destination, .{}));
    var parent = try io_helper.openDirAbsoluteForIteration(std.fs.path.dirname(fixture.destination).?);
    defer parent.close();
    var iterator = parent.iterate();
    const entry = (try iterator.next()) orelse return error.PreviousPackageLost;
    const retained = try std.fs.path.join(allocator, &.{ std.fs.path.dirname(fixture.destination).?, entry.name });
    defer allocator.free(retained);
    const previous = try std.fs.path.join(allocator, &.{ retained, "previous" });
    defer allocator.free(previous);
    const marker = try std.fs.path.join(allocator, &.{ previous, "old" });
    defer allocator.free(marker);
    const bytes = try io_helper.readFileAlloc(allocator, marker, 128);
    defer allocator.free(bytes);
    try std.testing.expectEqualStrings("previous-installation", bytes);
    // Recovery is possible from the exact retained directory reported by the
    // failed transaction. No second install or upload is needed.
    try io_helper.renameClassified(previous, fixture.destination);
    try materialization.removeOwnedTree(allocator, retained);
    try fixture.expectOld();
    try fixture.expectNoTransaction();
}

fn materializationAllocationFailure(failing: std.mem.Allocator) !void {
    const allocator = std.testing.allocator;
    var pkg_cache = try PackageCache.init(allocator);
    defer pkg_cache.deinit();
    var installer = try Installer.init(allocator, &pkg_cache);
    defer installer.deinit();
    var fixture = try MaterializationFixture.init(allocator);
    defer fixture.deinit();
    try fixture.installOld();
    const validation = Installer.MaterializationValidation{ .installer = &installer, .domain = "google.com/chrome", .version = null };
    var operations = MaterializationTestOperations{ .fixture = &fixture, .installer = &installer };
    _ = materialization.publish(failing, fixture.owned(), fixture.destination, &validation, &operations) catch |err| {
        try fixture.expectOld();
        try fixture.expectNoTransaction();
        return err;
    };
    try fixture.expectNoTransaction();
}

test "native materialization: every transaction allocation failure removes its owned directory" {
    if (@import("builtin").os.tag == .windows) return error.SkipZigTest;
    try std.testing.checkAllAllocationFailures(std.testing.allocator, materializationAllocationFailure, .{});
}
