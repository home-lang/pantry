//! Parallel Install Pipeline
//!
//! 3-phase pipeline that separates dependency resolution, tarball downloading,
//! and extraction into distinct parallel phases for maximum throughput.
//!
//! Phase 1: Resolve full dependency tree from npm registry metadata (no downloads)
//! Phase 2: Download all tarballs in parallel
//! Phase 3: Extract all packages + create bin shims

const std = @import("std");
const io_helper = @import("../io_helper.zig");
const installer_mod = @import("installer.zig");
const cache_mod = @import("../cache.zig");
const packages = @import("../packages.zig");
const style = @import("../cli/style.zig");

const Installer = installer_mod.Installer;
const PackageCache = cache_mod.PackageCache;
const PackageSpec = packages.PackageSpec;

// ============================================================================
// Public Types
// ============================================================================

pub const ResolvedPackage = struct {
    name: []const u8,
    version: []const u8,
    tarball_url: []const u8,
    integrity: ?[]const u8,
    source: packages.PackageSource,
};

pub const PackageResult = struct {
    name: []const u8,
    version: []const u8,
    success: bool,
    error_msg: ?[]const u8 = null,
    from_cache: bool = false,
};

pub const PipelineResult = struct {
    installed_count: usize,
    cached_count: usize,
    failed_count: usize,
    results: []PackageResult,

    pub fn deinit(self: *PipelineResult, allocator: std.mem.Allocator) void {
        for (self.results) |*r| {
            if (r.error_msg) |msg| allocator.free(msg);
            if (r.name.len > 0) allocator.free(r.name);
            if (r.version.len > 0) allocator.free(r.version);
        }
        allocator.free(self.results);
    }
};

/// Input dependency for the pipeline
pub const PipelineDep = struct {
    name: []const u8,
    version: []const u8,
    source: packages.PackageSource,
};

// ============================================================================
// Phase 1: Full Tree Resolution
// ============================================================================

/// Concurrent work queue for dependency resolution.
/// Threads continuously pick up work as transitive deps are discovered — no wave boundaries.
const ResolveQueue = struct {
    /// Growing list of deps to resolve. Threads read via atomic index, main logic appends under mutex.
    items: std.ArrayList(QueueItem),
    /// Total items added (threads read this atomically to know when to stop)
    total: std.atomic.Value(usize),
    /// Next item to claim (work-stealing via atomic increment)
    next: std.atomic.Value(usize),
    /// Mutex for appending new items and updating resolved/seen
    mutex: io_helper.Mutex,
    /// Deduplicate by package name (first version wins, hoisted)
    seen: std.StringHashMap(void),
    /// Resolved packages (output)
    resolved: std.ArrayList(ResolvedPackage),
    /// Shared installer for npm resolution
    installer: *Installer,
    allocator: std.mem.Allocator,
    verbose: bool,
    /// Track how many workers are idle (for termination detection)
    idle_count: std.atomic.Value(usize),
    thread_count: usize,

    const QueueItem = struct {
        name: []const u8,
        version: []const u8,
        is_top_level: bool,
        source: packages.PackageSource,
    };

    fn init(allocator: std.mem.Allocator, inst: *Installer, verbose: bool, thread_count: usize) ResolveQueue {
        return .{
            .items = std.ArrayList(QueueItem).empty,
            .total = std.atomic.Value(usize).init(0),
            .next = std.atomic.Value(usize).init(0),
            .mutex = .{},
            .seen = std.StringHashMap(void).init(allocator),
            .resolved = std.ArrayList(ResolvedPackage).empty,
            .installer = inst,
            .allocator = allocator,
            .verbose = verbose,
            .idle_count = std.atomic.Value(usize).init(0),
            .thread_count = thread_count,
        };
    }

    fn deinit(self: *ResolveQueue) void {
        // Free unprocessed queue items
        const processed = self.next.load(.monotonic);
        for (self.items.items[processed..]) |item| {
            if (!item.is_top_level) {
                self.allocator.free(item.name);
                self.allocator.free(item.version);
            }
        }
        self.items.deinit(self.allocator);

        var seen_iter = self.seen.iterator();
        while (seen_iter.next()) |entry| {
            self.allocator.free(entry.key_ptr.*);
        }
        self.seen.deinit();
        // Note: resolved list ownership transfers to caller
    }

    /// Try to enqueue a dep. Returns false if already seen (deduped).
    fn tryEnqueue(self: *ResolveQueue, name: []const u8, version: []const u8, source: packages.PackageSource) bool {
        self.mutex.lock();
        defer self.mutex.unlock();

        if (self.seen.contains(name)) return false;

        const owned_name = self.allocator.dupe(u8, name) catch return false;
        const owned_version = self.allocator.dupe(u8, version) catch {
            self.allocator.free(owned_name);
            return false;
        };

        self.seen.put(self.allocator.dupe(u8, name) catch {
            self.allocator.free(owned_name);
            self.allocator.free(owned_version);
            return false;
        }, {}) catch {
            self.allocator.free(owned_name);
            self.allocator.free(owned_version);
            return false;
        };

        self.items.append(self.allocator, .{
            .name = owned_name,
            .version = owned_version,
            .is_top_level = false,
            .source = source,
        }) catch {
            self.allocator.free(owned_name);
            self.allocator.free(owned_version);
            return false;
        };

        _ = self.total.fetchAdd(1, .release);
        return true;
    }

    /// Add a resolved package to the output list.
    fn addResolved(self: *ResolveQueue, pkg: ResolvedPackage) void {
        self.mutex.lock();
        defer self.mutex.unlock();
        self.resolved.append(self.allocator, pkg) catch {};
    }

    /// Worker function: continuously resolve deps from the queue.
    fn worker(self: *ResolveQueue) void {
        while (true) {
            const i = self.next.fetchAdd(1, .monotonic);
            const total = self.total.load(.acquire);

            if (i >= total) {
                // No work available right now. Check if all threads are idle (termination).
                _ = self.next.fetchSub(1, .monotonic); // put it back
                const idle = self.idle_count.fetchAdd(1, .acq_rel) + 1;

                if (idle >= self.thread_count) {
                    // All threads idle and no more work — we're done
                    // Wake other threads by bumping total to a sentinel
                    return;
                }

                // Spin-wait briefly for new work
                io_helper.nanosleep(0, 1 * std.time.ns_per_ms);
                _ = self.idle_count.fetchSub(1, .acq_rel);

                // Re-check if total grew
                const new_total = self.total.load(.acquire);
                if (new_total > total) continue;

                // Check if all threads became idle while we were waiting
                const idle2 = self.idle_count.load(.acquire);
                if (idle2 >= self.thread_count - 1) return; // we're the last active
                continue;
            }

            // Mark as active
            _ = self.idle_count.store(0, .release);

            // Get the item (mutex needed because items list may be growing)
            self.mutex.lock();
            const item = if (i < self.items.items.len) self.items.items[i] else {
                self.mutex.unlock();
                continue;
            };
            self.mutex.unlock();

            // Skip non-npm
            if (item.source != .npm and item.source != .pantry) continue;

            // Skip if already resolved by hoisted cache
            if (self.installer.hoisted_versions.checkSatisfies(item.name, item.version)) continue;

            if (self.verbose) {
                std.debug.print("[verbose:pipeline:resolve] [{d}/{d}] {s} @ {s}\n", .{ i + 1, self.total.load(.acquire), item.name, item.version });
            }

            // Resolve via npm registry
            const result = self.installer.resolveNpmPackageWithDeps(item.name, item.version) catch continue;

            // Add to resolved output
            const owned_name = self.allocator.dupe(u8, item.name) catch {
                self.allocator.free(result.version);
                self.allocator.free(result.tarball_url);
                if (result.integrity) |int| self.allocator.free(int);
                for (result.dependencies) |dep| {
                    self.allocator.free(dep.name);
                    self.allocator.free(dep.version_constraint);
                }
                self.allocator.free(result.dependencies);
                continue;
            };

            self.addResolved(.{
                .name = owned_name,
                .version = result.version,
                .tarball_url = result.tarball_url,
                .integrity = result.integrity,
                .source = .npm,
            });

            // Record in hoisted cache
            self.installer.hoisted_versions.put(item.name, result.version);

            // Enqueue transitive deps immediately (no wave boundary!)
            for (result.dependencies) |dep| {
                if (!self.tryEnqueue(dep.name, dep.version_constraint, .npm)) {
                    self.allocator.free(dep.name);
                    self.allocator.free(dep.version_constraint);
                }
            }
            self.allocator.free(result.dependencies);
        }
    }
};

/// Resolve the full dependency tree using a concurrent work queue.
/// No wave boundaries — threads continuously pick up work as transitive deps are discovered.
fn resolveFullTree(
    allocator: std.mem.Allocator,
    inst: *Installer,
    top_level_deps: []const PipelineDep,
    verbose: bool,
) !std.ArrayList(ResolvedPackage) {
    const cpu_count = std.Thread.getCpuCount() catch 4;
    const max_threads = @min(cpu_count, 16);
    const thread_count = @max(max_threads, 2);

    var queue = ResolveQueue.init(allocator, inst, verbose, thread_count);

    // Seed with top-level deps
    for (top_level_deps) |dep| {
        queue.mutex.lock();
        queue.seen.put(allocator.dupe(u8, dep.name) catch {
            queue.mutex.unlock();
            continue;
        }, {}) catch {
            queue.mutex.unlock();
            continue;
        };
        queue.items.append(allocator, .{
            .name = dep.name,
            .version = dep.version,
            .is_top_level = true,
            .source = dep.source,
        }) catch {
            queue.mutex.unlock();
            continue;
        };
        _ = queue.total.fetchAdd(1, .release);
        queue.mutex.unlock();
    }

    if (verbose) {
        std.debug.print("[verbose:pipeline:resolve] starting concurrent resolution with {d} threads, {d} initial deps\n", .{ thread_count, top_level_deps.len });
    }

    // Spawn worker threads
    const spawned = thread_count - 1;
    var threads = try allocator.alloc(?std.Thread, spawned);
    defer allocator.free(threads);
    for (threads) |*t| t.* = null;

    for (0..spawned) |t| {
        threads[t] = std.Thread.spawn(.{}, ResolveQueue.worker, .{&queue}) catch null;
    }
    // Main thread participates
    ResolveQueue.worker(&queue);

    // Join all threads
    for (threads) |*t| {
        if (t.*) |thread| {
            thread.join();
            t.* = null;
        }
    }

    if (verbose) {
        std.debug.print("[verbose:pipeline:resolve] tree resolved: {d} unique packages, queue processed {d} items\n", .{ queue.resolved.items.len, queue.next.load(.monotonic) });
    }

    // Transfer resolved list ownership to caller
    const result = queue.resolved;
    queue.resolved = std.ArrayList(ResolvedPackage).empty;
    queue.deinit();

    return result;
}

// ============================================================================
// Phase 2: Parallel Download
// ============================================================================

const DownloadThreadCtx = struct {
    installer: *Installer,
    packages: []const ResolvedPackage,
    results: []PackageResult,
    project_root: []const u8,
    modules_dir: []const u8,
    next: *std.atomic.Value(usize),
    verbose: bool,

    fn worker(ctx: *DownloadThreadCtx) void {
        const alloc = ctx.installer.allocator;
        while (true) {
            const i = ctx.next.fetchAdd(1, .monotonic);
            if (i >= ctx.packages.len) break;

            const pkg = ctx.packages[i];
            // Dupe name+version so results outlive the resolved list
            const owned_name = alloc.dupe(u8, pkg.name) catch "";
            const owned_version = alloc.dupe(u8, pkg.version) catch "";

            // Skip non-npm packages
            if (pkg.source != .npm) {
                ctx.results[i] = .{
                    .name = owned_name,
                    .version = owned_version,
                    .success = true,
                    .from_cache = true,
                };
                continue;
            }

            // Check if already installed on disk
            var exist_buf: [std.fs.max_path_bytes]u8 = undefined;
            const install_dir = std.fmt.bufPrint(&exist_buf, "{s}/{s}/{s}", .{ ctx.project_root, ctx.modules_dir, pkg.name }) catch {
                ctx.results[i] = .{ .name = owned_name, .version = owned_version, .success = false, .error_msg = null };
                continue;
            };

            const already_installed = blk: {
                io_helper.accessAbsolute(install_dir, .{}) catch break :blk false;
                break :blk true;
            };

            if (already_installed) {
                ctx.results[i] = .{
                    .name = owned_name,
                    .version = owned_version,
                    .success = true,
                    .from_cache = true,
                };
                continue;
            }

            if (ctx.verbose) {
                std.debug.print("[verbose:pipeline:download] downloading: {s} @ {s}\n", .{ pkg.name, pkg.version });
            }

            // Check content-addressed cache
            const cached_tarball = ctx.installer.cache.get(pkg.name, pkg.version) catch null;
            const tarball_data = if (cached_tarball) |meta|
                io_helper.readFileAlloc(ctx.installer.allocator, meta.cache_path, 256 * 1024 * 1024) catch null
            else
                null;

            const tarball_bytes = tarball_data orelse dl_blk: {
                // Download tarball with retry
                var downloaded: ?[]const u8 = null;
                var dl_attempt: u32 = 0;
                while (dl_attempt < 3) : (dl_attempt += 1) {
                    downloaded = io_helper.httpGetWithClient(ctx.installer.http_client, ctx.installer.allocator, pkg.tarball_url) catch {
                        if (dl_attempt < 2) {
                            io_helper.nanosleep(0, (dl_attempt + 1) * 200 * std.time.ns_per_ms);
                            continue;
                        }
                        break :dl_blk null;
                    };
                    if (downloaded) |d| {
                        if (d.len > 0) break;
                        ctx.installer.allocator.free(d);
                        downloaded = null;
                    }
                }
                const dl = downloaded orelse {
                    ctx.results[i] = .{ .name = owned_name, .version = owned_version, .success = false, .error_msg = null };
                    continue;
                };

                // Store in content-addressed cache
                var checksum: [32]u8 = undefined;
                std.crypto.hash.sha2.Sha256.hash(dl, &checksum, .{});
                ctx.installer.cache.put(pkg.name, pkg.version, pkg.tarball_url, checksum, dl) catch {};

                break :dl_blk dl;
            };

            if (tarball_bytes == null) {
                ctx.results[i] = .{ .name = owned_name, .version = owned_version, .success = false, .error_msg = null };
                continue;
            }
            defer ctx.installer.allocator.free(tarball_bytes.?);

            // Extract tarball to install directory
            io_helper.makePath(install_dir) catch {
                ctx.results[i] = .{ .name = owned_name, .version = owned_version, .success = false, .error_msg = null };
                continue;
            };

            const extract_success = blk: {
                var dest = io_helper.cwd().openDir(io_helper.io, install_dir, .{}) catch break :blk false;
                defer dest.close(io_helper.io);

                var input_reader: std.Io.Reader = .fixed(tarball_bytes.?);
                var window_buf: [65536]u8 = undefined;
                var decompressor: std.compress.flate.Decompress = .init(&input_reader, .gzip, &window_buf);
                std.tar.pipeToFileSystem(io_helper.io, dest, &decompressor.reader, .{
                    .strip_components = 1,
                }) catch {
                    io_helper.deleteTree(install_dir) catch {};
                    break :blk false;
                };
                break :blk true;
            };

            if (!extract_success) {
                ctx.results[i] = .{ .name = owned_name, .version = owned_version, .success = false, .error_msg = null };
                continue;
            }

            // Create bin shims
            ctx.installer.createNpmShims(ctx.project_root, pkg.name, install_dir) catch {};

            // Record in hoisted cache
            ctx.installer.hoisted_versions.put(pkg.name, pkg.version);

            ctx.results[i] = .{
                .name = owned_name,
                .version = owned_version,
                .success = true,
                .from_cache = false,
            };

            if (ctx.verbose) {
                std.debug.print("[verbose:pipeline:download] installed: {s} @ {s}\n", .{ pkg.name, pkg.version });
            }
        }
    }
};

// ============================================================================
// Pipeline Entry Point
// ============================================================================

/// Run the 3-phase parallel install pipeline.
/// Returns results for each package (success/fail, for reporting and lockfile generation).
pub fn run(
    allocator: std.mem.Allocator,
    inst: *Installer,
    top_level_deps: []const PipelineDep,
    project_root: []const u8,
    verbose: bool,
) !PipelineResult {
    const total_start = io_helper.clockGettime();
    const total_start_ms = @as(i64, @intCast(total_start.sec)) * 1000 + @divFloor(@as(i64, @intCast(total_start.nsec)), 1_000_000);

    // ── Phase 1: Resolve full dependency tree ──
    if (verbose) std.debug.print("[verbose:pipeline] Phase 1: resolving dependency tree...\n", .{});

    var resolved = try resolveFullTree(allocator, inst, top_level_deps, verbose);
    defer {
        for (resolved.items) |pkg| {
            allocator.free(pkg.name);
            allocator.free(pkg.version);
            allocator.free(pkg.tarball_url);
            if (pkg.integrity) |i| allocator.free(i);
        }
        resolved.deinit(allocator);
    }

    const phase1_ts = io_helper.clockGettime();
    const phase1_ms = @as(i64, @intCast(phase1_ts.sec)) * 1000 + @divFloor(@as(i64, @intCast(phase1_ts.nsec)), 1_000_000);
    if (verbose) {
        std.debug.print("[verbose:pipeline:timer] Phase 1 (resolve): {d}ms — {d} packages\n", .{ phase1_ms - total_start_ms, resolved.items.len });
    }

    if (resolved.items.len == 0) {
        return PipelineResult{
            .installed_count = 0,
            .cached_count = 0,
            .failed_count = 0,
            .results = try allocator.alloc(PackageResult, 0),
        };
    }

    // ── Phase 2+3: Download + Extract in parallel ──
    // Combined into one phase since downloading and extracting per-package
    // is more cache-friendly than downloading all then extracting all.
    if (verbose) std.debug.print("[verbose:pipeline] Phase 2: downloading & extracting {d} packages...\n", .{resolved.items.len});

    const results = try allocator.alloc(PackageResult, resolved.items.len);
    for (results) |*r| r.* = .{ .name = "", .version = "", .success = false };

    var next_idx = std.atomic.Value(usize).init(0);
    var dl_ctx = DownloadThreadCtx{
        .installer = inst,
        .packages = resolved.items,
        .results = results,
        .project_root = project_root,
        .modules_dir = inst.modules_dir,
        .next = &next_idx,
        .verbose = verbose,
    };

    // Use up to 16 threads for download + extract
    const cpu_count = std.Thread.getCpuCount() catch 4;
    const max_threads = @min(cpu_count, 16);
    const thread_count = @min(resolved.items.len, max_threads);

    if (thread_count <= 1) {
        DownloadThreadCtx.worker(&dl_ctx);
    } else {
        const spawned = thread_count - 1;
        var threads = try allocator.alloc(?std.Thread, spawned);
        defer allocator.free(threads);
        for (threads) |*t| t.* = null;

        for (0..spawned) |t| {
            threads[t] = std.Thread.spawn(.{}, DownloadThreadCtx.worker, .{&dl_ctx}) catch null;
        }
        DownloadThreadCtx.worker(&dl_ctx);

        for (threads) |*t| {
            if (t.*) |thread| {
                thread.join();
                t.* = null;
            }
        }
    }

    const phase2_ts = io_helper.clockGettime();
    const phase2_ms = @as(i64, @intCast(phase2_ts.sec)) * 1000 + @divFloor(@as(i64, @intCast(phase2_ts.nsec)), 1_000_000);

    // Count results
    var installed: usize = 0;
    var cached: usize = 0;
    var failed: usize = 0;
    for (results) |r| {
        if (r.success) {
            if (r.from_cache) cached += 1 else installed += 1;
        } else {
            if (r.name.len > 0) failed += 1;
        }
    }

    if (verbose) {
        std.debug.print("[verbose:pipeline:timer] Phase 2 (download+extract): {d}ms\n", .{phase2_ms - phase1_ms});
        std.debug.print("[verbose:pipeline:timer] Total pipeline: {d}ms — installed={d}, cached={d}, failed={d}\n", .{
            phase2_ms - total_start_ms, installed, cached, failed,
        });
    }

    return PipelineResult{
        .installed_count = installed,
        .cached_count = cached,
        .failed_count = failed,
        .results = results,
    };
}
