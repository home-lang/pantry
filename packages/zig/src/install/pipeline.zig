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

/// Thread context for parallel npm metadata resolution
const ResolveThreadCtx = struct {
    installer: *Installer,
    deps: []const PipelineDep,
    results: []?Installer.NpmResolutionWithDeps,
    next: *std.atomic.Value(usize),
    verbose: bool,

    fn worker(ctx: *ResolveThreadCtx) void {
        while (true) {
            const i = ctx.next.fetchAdd(1, .monotonic);
            if (i >= ctx.deps.len) break;

            const dep = ctx.deps[i];

            // Skip non-npm packages in resolution phase
            if (dep.source != .npm and dep.source != .pantry) {
                ctx.results[i] = null;
                continue;
            }

            if (ctx.verbose) {
                std.debug.print("[verbose:pipeline:resolve] resolving: {s} @ {s}\n", .{ dep.name, dep.version });
            }

            ctx.results[i] = ctx.installer.resolveNpmPackageWithDeps(dep.name, dep.version) catch |err| blk: {
                if (ctx.verbose) {
                    std.debug.print("[verbose:pipeline:resolve] FAILED: {s} @ {s}: {}\n", .{ dep.name, dep.version, err });
                }
                break :blk null;
            };
        }
    }
};

/// Resolve the full dependency tree from npm registry metadata.
/// Returns a flat deduplicated list of all packages to install.
fn resolveFullTree(
    allocator: std.mem.Allocator,
    inst: *Installer,
    top_level_deps: []const PipelineDep,
    verbose: bool,
) !std.ArrayList(ResolvedPackage) {
    var resolved = std.ArrayList(ResolvedPackage).empty;
    errdefer {
        for (resolved.items) |pkg| {
            allocator.free(pkg.name);
            allocator.free(pkg.version);
            allocator.free(pkg.tarball_url);
            if (pkg.integrity) |i| allocator.free(i);
        }
        resolved.deinit(allocator);
    }

    // Track resolved packages by name to deduplicate
    var seen = std.StringHashMap(void).init(allocator);
    defer seen.deinit();

    // BFS wave queue: starts with top-level deps
    var current_wave = std.ArrayList(PipelineDep).empty;
    defer current_wave.deinit(allocator);

    // Seed with top-level deps
    for (top_level_deps) |dep| {
        try current_wave.append(allocator, dep);
    }

    var depth: u32 = 0;
    const max_depth: u32 = 30;

    while (current_wave.items.len > 0 and depth < max_depth) {
        const wave_size = current_wave.items.len;

        if (verbose) {
            std.debug.print("[verbose:pipeline:resolve] wave {d}: {d} deps to resolve\n", .{ depth, wave_size });
        }

        // Resolve this wave in parallel
        const results = try allocator.alloc(?Installer.NpmResolutionWithDeps, wave_size);
        defer allocator.free(results);
        for (results) |*r| r.* = null;

        var next_idx = std.atomic.Value(usize).init(0);
        var ctx = ResolveThreadCtx{
            .installer = inst,
            .deps = current_wave.items,
            .results = results,
            .next = &next_idx,
            .verbose = verbose,
        };

        // Cap at 8 threads for metadata resolution. Higher values (12+) cause
        // connection hangs on macOS. 8 is the stable sweet spot.
        const cpu_count = std.Thread.getCpuCount() catch 4;
        const max_threads = @min(cpu_count, 8);
        const thread_count = @min(wave_size, max_threads);

        if (thread_count <= 1) {
            ResolveThreadCtx.worker(&ctx);
        } else {
            const spawned = thread_count - 1;
            var threads = try allocator.alloc(?std.Thread, spawned);
            defer allocator.free(threads);
            for (threads) |*t| t.* = null;

            for (0..spawned) |t| {
                threads[t] = std.Thread.spawn(.{}, ResolveThreadCtx.worker, .{&ctx}) catch null;
            }
            ResolveThreadCtx.worker(&ctx);

            for (threads) |*t| {
                if (t.*) |thread| {
                    thread.join();
                    t.* = null;
                }
            }
        }

        // Collect results and build next wave from transitive deps
        var next_wave = std.ArrayList(PipelineDep).empty;

        for (results, 0..) |maybe_result, ri| {
            if (maybe_result) |res| {
                const result = res;
                // Add to resolved list if not seen
                if (!seen.contains(result.version)) {
                    // Use name as dedup key (hoisted: first version wins)
                    const name_key = current_wave.items[ri].name;
                    if (!seen.contains(name_key)) {
                        try seen.put(try allocator.dupe(u8, name_key), {});
                        try resolved.append(allocator, .{
                            .name = result.version, // transfer ownership
                            .version = result.version,
                            .tarball_url = result.tarball_url,
                            .integrity = result.integrity,
                            .source = .npm,
                        });
                        // Fix: name should be the dep name, not the version
                        resolved.items[resolved.items.len - 1].name = try allocator.dupe(u8, name_key);

                        // Record in hoisted cache for dedup in later waves
                        inst.hoisted_versions.put(name_key, result.version);
                    } else {
                        // Already resolved, free the result
                        allocator.free(result.version);
                        allocator.free(result.tarball_url);
                        if (result.integrity) |i| allocator.free(i);
                    }
                } else {
                    allocator.free(result.version);
                    allocator.free(result.tarball_url);
                    if (result.integrity) |i| allocator.free(i);
                }

                // Enqueue transitive deps for next wave
                for (result.dependencies) |dep| {
                    // Skip already-resolved
                    if (seen.contains(dep.name)) {
                        allocator.free(dep.name);
                        allocator.free(dep.version_constraint);
                        continue;
                    }
                    // Skip already-installed
                    if (inst.hoisted_versions.checkSatisfies(dep.name, dep.version_constraint)) {
                        allocator.free(dep.name);
                        allocator.free(dep.version_constraint);
                        continue;
                    }
                    // Skip optional deps that fail (silently)
                    next_wave.append(allocator, .{
                        .name = dep.name,
                        .version = dep.version_constraint,
                        .source = .npm,
                    }) catch {
                        allocator.free(dep.name);
                        allocator.free(dep.version_constraint);
                        continue;
                    };
                }
                allocator.free(result.dependencies);
            } else {
                // Resolution failed — add non-npm packages directly
                const dep = current_wave.items[ri];
                if (dep.source != .npm and dep.source != .pantry) {
                    if (!seen.contains(dep.name)) {
                        try seen.put(try allocator.dupe(u8, dep.name), {});
                        try resolved.append(allocator, .{
                            .name = try allocator.dupe(u8, dep.name),
                            .version = try allocator.dupe(u8, dep.version),
                            .tarball_url = try allocator.dupe(u8, ""),
                            .integrity = null,
                            .source = dep.source,
                        });
                    }
                }
            }
        }

        // Swap waves
        // Free old wave dep strings only if they were allocated for transitive deps (depth > 0)
        if (depth > 0) {
            for (current_wave.items) |dep| {
                allocator.free(dep.name);
                allocator.free(dep.version);
            }
        }
        current_wave.clearRetainingCapacity();

        // Deduplicate next wave by name
        var next_seen = std.StringHashMap(void).init(allocator);
        defer next_seen.deinit();
        for (next_wave.items) |dep| {
            if (next_seen.contains(dep.name) or seen.contains(dep.name)) {
                allocator.free(dep.name);
                allocator.free(dep.version);
                continue;
            }
            next_seen.put(dep.name, {}) catch continue;
            current_wave.append(allocator, dep) catch {
                allocator.free(dep.name);
                allocator.free(dep.version);
            };
        }
        next_wave.deinit(allocator);

        depth += 1;
    }

    // Free remaining wave items
    if (depth > 0) {
        for (current_wave.items) |dep| {
            allocator.free(dep.name);
            allocator.free(dep.version);
        }
    }

    if (verbose) {
        std.debug.print("[verbose:pipeline:resolve] tree resolved: {d} unique packages in {d} waves\n", .{ resolved.items.len, depth });
    }

    return resolved;
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
