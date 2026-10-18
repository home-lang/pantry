//! Parallel Install Pipeline
//!
//! 3-phase pipeline that separates dependency resolution, tarball downloading,
//! and extraction into distinct parallel phases for maximum throughput.
//!
//! Phase 1: Resolve full dependency tree from npm registry metadata (no downloads)
//! Phase 2: Download all tarballs in parallel
//! Phase 3: Extract all packages + create bin shims

const std = @import("std");
const builtin = @import("builtin");
const io_helper = @import("../io_helper.zig");
const installer_mod = @import("installer.zig");
const cache_mod = @import("../cache.zig");
const packages = @import("../packages.zig");
const generated = @import("../packages/generated.zig");
const style = @import("../cli/style.zig");
const offline = @import("offline.zig");
const patches_mod = @import("patches.zig");
const downloader = @import("downloader.zig");

const Installer = installer_mod.Installer;
const PackageCache = cache_mod.PackageCache;
const PackageSpec = packages.PackageSpec;

/// Verify a downloaded tarball's bytes against an `integrity` string, which
/// may be either:
///   * an npm-style SRI value like "sha512-BASE64..." / "sha256-BASE64..."
///   * a raw lowercase hex SHA256 (64 chars)
///
/// Unknown, malformed, or unsupported formats fail closed. Callers only invoke
/// this function when the registry supplied an integrity value, so treating an
/// uncheckable claim as valid would silently bypass the package contract.
pub fn verifyIntegrity(allocator: std.mem.Allocator, bytes: []const u8, integrity: []const u8) bool {
    // Raw hex SHA256
    if (integrity.len == 64) {
        var is_hex = true;
        for (integrity) |c| {
            if (!((c >= '0' and c <= '9') or (c >= 'a' and c <= 'f') or (c >= 'A' and c <= 'F'))) {
                is_hex = false;
                break;
            }
        }
        if (is_hex) {
            var digest: [32]u8 = undefined;
            std.crypto.hash.sha2.Sha256.hash(bytes, &digest, .{});
            const hex = std.fmt.bytesToHex(digest, .lower);
            // Case-insensitive compare
            for (hex, 0..) |h, i| {
                const g = integrity[i];
                const lower_g: u8 = if (g >= 'A' and g <= 'Z') g + ('a' - 'A') else g;
                if (h != lower_g) return false;
            }
            return true;
        }
    }

    // SRI form: "<algo>-<base64>"
    const dash = std.mem.indexOfScalar(u8, integrity, '-') orelse return false;
    const algo = integrity[0..dash];
    const b64 = integrity[dash + 1 ..];

    if (std.mem.eql(u8, algo, "sha256")) {
        var digest: [32]u8 = undefined;
        std.crypto.hash.sha2.Sha256.hash(bytes, &digest, .{});
        var expected: [32]u8 = undefined;
        const decoded = std.base64.standard.Decoder.calcSizeForSlice(b64) catch return false;
        if (decoded != 32) return false;
        std.base64.standard.Decoder.decode(&expected, b64) catch return false;
        return std.mem.eql(u8, &digest, &expected);
    } else if (std.mem.eql(u8, algo, "sha512")) {
        var digest: [64]u8 = undefined;
        std.crypto.hash.sha2.Sha512.hash(bytes, &digest, .{});
        var expected: [64]u8 = undefined;
        const decoded = std.base64.standard.Decoder.calcSizeForSlice(b64) catch return false;
        if (decoded != 64) return false;
        std.base64.standard.Decoder.decode(&expected, b64) catch return false;
        return std.mem.eql(u8, &digest, &expected);
    } else if (std.mem.eql(u8, algo, "sha1")) {
        // sha1 still shows up on npm; verify for completeness
        var digest: [20]u8 = undefined;
        std.crypto.hash.Sha1.hash(bytes, &digest, .{});
        var expected: [20]u8 = undefined;
        const decoded = std.base64.standard.Decoder.calcSizeForSlice(b64) catch return false;
        if (decoded != 20) return false;
        std.base64.standard.Decoder.decode(&expected, b64) catch return false;
        return std.mem.eql(u8, &digest, &expected);
    }

    _ = allocator;
    return false;
}

test "parsePantryDepSpec and parseForeignOsDepSpec partition every spec" {
    // A spec is for this host, or for another one, or unusable. The two parsers
    // must never both claim one, and between them must not lose a usable spec.
    const this_os = switch (builtin.os.tag) {
        .linux => "linux",
        .macos => "darwin",
        .windows => "windows",
        else => "",
    };
    const other_os = if (std.mem.eql(u8, this_os, "linux")) "darwin" else "linux";

    var native_buf: [64]u8 = undefined;
    const native = try std.fmt.bufPrint(&native_buf, "{s}:gnu.org/gcc/libstdcxx^14", .{this_os});
    var foreign_buf: [64]u8 = undefined;
    const foreign = try std.fmt.bufPrint(&foreign_buf, "{s}:gnu.org/gcc/libstdcxx^14", .{other_os});

    // Guarded for this host: installable, not foreign.
    try std.testing.expect(parsePantryDepSpec(native) != null);
    try std.testing.expect(parseForeignOsDepSpec(native) == null);

    // Guarded for another host: foreign, not installable.
    try std.testing.expect(parsePantryDepSpec(foreign) == null);
    const parsed_foreign = parseForeignOsDepSpec(foreign) orelse return error.TestExpectedForeign;
    try std.testing.expectEqualStrings("gnu.org/gcc/libstdcxx", parsed_foreign.domain);
    try std.testing.expectEqualStrings("^14", parsed_foreign.version);

    // Unguarded: installable everywhere, and never foreign.
    try std.testing.expect(parsePantryDepSpec("openssl.org^3") != null);
    try std.testing.expect(parseForeignOsDepSpec("openssl.org^3") == null);
}

test "parseForeignOsDepSpec keeps the comment and version handling of the native parser" {
    const other_os = if (builtin.os.tag == .linux) "darwin" else "linux";

    var buf: [96]u8 = undefined;
    const spec = try std.fmt.bufPrint(&buf, "{s}:gnu.org/gcc/libstdcxx@15 # since 20250814.0", .{other_os});
    const parsed = parseForeignOsDepSpec(spec) orelse return error.TestExpectedForeign;

    try std.testing.expectEqualStrings("gnu.org/gcc/libstdcxx", parsed.domain);
    try std.testing.expectEqualStrings("15", parsed.version);
}

test "platformDependentClosure is symmetric, and reaches a pin only through its declarer" {
    // Two properties, both learned the hard way (pantry-pm/pantry#232).
    //
    // SYMMETRY. An OS guard on a version constraint makes a package resolve
    // differently per platform, in BOTH directions. The first version of this
    // asked "is the guard for an OS I am not", which is right on the host the
    // guard excludes and wrong on the host it names: `git-scm.org` declares
    // `linux:gnu.org/gettext^0.21`, so on macOS gettext looks foreign and is
    // kept, while on Linux it looks perfectly native and the macOS pin is swept
    // as a stale duplicate. A macOS install then dropped one record and a Linux
    // install dropped the other. Asking "is it guarded at all" is the same
    // question on both.
    //
    // LEAF-NESS. A guarded pin does not declare its own guard - the package
    // that declares it is one the host resolves natively - so a closure seeded
    // only from the pins finds nothing, and every one of them then looks stale.
    //
    // The pair is discovered from the catalog rather than hard-coded, so this
    // asserts the same thing on every platform.
    const allocator = std.testing.allocator;

    var declaring: ?[]const u8 = null;
    var pin: ?[]const u8 = null;
    outer: for (generated.packages) |info| {
        for (info.dependencies) |spec| {
            if (parseOsGuardedDepSpec(spec)) |guarded| {
                declaring = info.domain;
                pin = guarded.domain;
                break :outer;
            }
        }
    }
    const declaring_domain = declaring orelse return error.SkipZigTest;
    const pin_domain = pin.?;

    // Reached from the package that declares the guard.
    var from_declaring = try platformDependentClosure(allocator, &.{declaring_domain});
    defer from_declaring.deinit();
    try std.testing.expect(from_declaring.contains(pin_domain));

    // Not reached from the pin itself, because a package does not declare
    // itself. That asymmetry is why the caller has to seed from what it just
    // resolved as well as from what the lockfile already holds.
    var from_pin = try platformDependentClosure(allocator, &.{pin_domain});
    defer from_pin.deinit();
    try std.testing.expect(!from_pin.contains(pin_domain));
}

test "platformDependentClosure answers the same on either side of a guard" {
    // The symmetry above, asserted without needing to run on two machines: a
    // guard is native on one host and foreign on the other, and this must reach
    // the domain in both cases. `parseForeignOsDepSpec` agrees with
    // `parseOsGuardedDepSpec` on exactly one of the two, which is the bug.
    const native_prefix = switch (builtin.os.tag) {
        .linux => "linux",
        .macos => "darwin",
        .windows => "windows",
        else => return error.SkipZigTest,
    };
    const foreign_prefix = if (std.mem.eql(u8, native_prefix, "linux")) "darwin" else "linux";

    var native_buf: [64]u8 = undefined;
    const native = try std.fmt.bufPrint(&native_buf, "{s}:gnu.org/gettext^0.21", .{native_prefix});
    var foreign_buf: [64]u8 = undefined;
    const foreign = try std.fmt.bufPrint(&foreign_buf, "{s}:gnu.org/gettext^0.21", .{foreign_prefix});

    // Guarded either way, so platform-dependent either way.
    try std.testing.expectEqualStrings("gnu.org/gettext", parseOsGuardedDepSpec(native).?.domain);
    try std.testing.expectEqualStrings("gnu.org/gettext", parseOsGuardedDepSpec(foreign).?.domain);

    // Where the old question disagreed with itself.
    try std.testing.expect(parseForeignOsDepSpec(native) == null);
    try std.testing.expect(parseForeignOsDepSpec(foreign) != null);

    // And an unguarded spec is not platform-dependent at all.
    try std.testing.expect(parseOsGuardedDepSpec("gnu.org/gettext") == null);
    try std.testing.expect(parseOsGuardedDepSpec("openssl.org^3") == null);
}
test "parseForeignOsDepSpec rejects what nobody can use" {
    // Malformed is not the same as foreign. A caller asking "which pins does
    // this host legitimately not know about" must not be handed junk.
    try std.testing.expect(parseForeignOsDepSpec("") == null);
    try std.testing.expect(parseForeignOsDepSpec("   ") == null);
    try std.testing.expect(parseForeignOsDepSpec("# just a comment") == null);
    try std.testing.expect(parseForeignOsDepSpec("linux/x86-64") == null);
    // A colon that is not an OS guard is a domain, and belongs to this host.
    try std.testing.expect(parseForeignOsDepSpec("example.com:8080/pkg") == null);
}

test "verifyIntegrity sha256 hex happy path" {
    const allocator = std.testing.allocator;
    const body = "hello world";
    // sha256("hello world") = b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9
    const hex = "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9";
    try std.testing.expect(verifyIntegrity(allocator, body, hex));
    const bad = "0000000000000000000000000000000000000000000000000000000000000000";
    try std.testing.expect(!verifyIntegrity(allocator, body, bad));
}

test "verifyIntegrity rejects unknown and malformed claims" {
    const allocator = std.testing.allocator;
    try std.testing.expect(!verifyIntegrity(allocator, "x", "frobnitz-abc"));
    try std.testing.expect(!verifyIntegrity(allocator, "x", "missing-separator"[0..7]));
    try std.testing.expect(!verifyIntegrity(allocator, "x", "sha256-not-base64!"));
}

test "verifyIntegrity sha512 SRI happy path" {
    const allocator = std.testing.allocator;
    const body = "hello world";
    // node -e 'console.log("sha512-" + require("crypto").createHash("sha512").update("hello world").digest("base64"))'
    const sri = "sha512-MJ7MSJwS1utMxA9QyQLytNDtd+5RGnx6m808qG1M2G+YndNbxf9JlnDaNCVbRbDP2DDoH2Bdz33FVC6TrpzXbw==";
    try std.testing.expect(verifyIntegrity(allocator, body, sri));
}

test "verifyIntegrity sha1 SRI" {
    const allocator = std.testing.allocator;
    // sha1("hello world") = 2aae6c35c94fcfb415dbe95f408b9ce91ee846ed
    const body = "hello world";
    const sri = "sha1-Kq5sNclPz7QV2+lfQIuc6R7oRu0=";
    try std.testing.expect(verifyIntegrity(allocator, body, sri));
}

test "verifyIntegrity detects tampered body under sha256 hex" {
    const allocator = std.testing.allocator;
    const original = "hello world";
    const tampered = "hello World"; // capital W
    // sha256("hello world") hex
    const hex = "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9";
    try std.testing.expect(verifyIntegrity(allocator, original, hex));
    try std.testing.expect(!verifyIntegrity(allocator, tampered, hex));
}

// ============================================================================
// Public Types
// ============================================================================

pub const ResolvedPackage = struct {
    name: []const u8,
    version: []const u8,
    tarball_url: []const u8,
    integrity: ?[]const u8,
    source: packages.PackageSource,
    github_owner: ?[]const u8 = null,
    github_repo: ?[]const u8 = null,
    /// Reached only through `optionalDependencies`: a failure to install it
    /// does not fail the install.
    optional: bool = false,
    /// A platform package for another machine (`@esbuild/linux-x64` on a
    /// Mac). Recorded in the lock, as bun.lock records every platform's, but
    /// not downloaded.
    lock_only: bool = false,
};

pub const PackageResult = struct {
    name: []const u8,
    version: []const u8,
    success: bool,
    error_msg: ?[]const u8 = null,
    from_cache: bool = false,
    /// See `ResolvedPackage.lock_only`: belongs in the lock, not on disk, and
    /// is not reported as installed.
    lock_only: bool = false,
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
    github_owner: ?[]const u8 = null,
    github_repo: ?[]const u8 = null,
    /// Reached through an `optionalDependencies` entry.
    optional: bool = false,
};

fn canUseNpmFastPath(top_level_count: usize, npm_count: usize, missing_npm_count: usize) bool {
    return missing_npm_count == 0 and npm_count > 0 and npm_count == top_level_count;
}

test "npm fast path does not skip mixed-source dependencies" {
    try std.testing.expect(canUseNpmFastPath(3, 3, 0));
    try std.testing.expect(!canUseNpmFastPath(4, 3, 0));
    try std.testing.expect(!canUseNpmFastPath(3, 3, 1));
}

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

            // Skip non-npm packages in resolution phase. .pantry-source
            // (system) deps don't have npm metadata — they resolve via the
            // pantry S3 registry inside the download phase. Routing them
            // through resolveNpmPackageWithDeps would hit npmjs.org and find
            // squatter packages (e.g. `bun.sh@0.0.0`).
            if (dep.source != .npm) {
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

/// Parse a generated-catalog dependency spec into a domain + version
/// constraint, honoring `os:` / `os/arch:` prefixes and stripping ` # comments`.
/// Examples: `apache.org/apr^1`, `linux:gnu.org/gcc/libstdcxx^14 # since …`,
/// `gnome.org/libxml2~2.13`, `apache.org/thrift=0.22.0`, `…libstdcxx@14`.
/// Returns null when the spec targets a different OS or architecture. Returned slices point
/// into `spec_in` (a static catalog string), so callers dupe before storing.
fn parsePantryDepSpec(spec_in: []const u8) ?struct { domain: []const u8, version: []const u8 } {
    const parsed = parseDepSpecForOs(spec_in) orelse return null;
    return if (parsed.foreign) null else .{ .domain = parsed.domain, .version = parsed.version };
}

/// The same spec, but only when its OS or architecture guard excludes this host.
///
/// `parsePantryDepSpec` answers null for those, which is right for installing -
/// there is nothing to fetch. It is wrong for *recording*: the lockfile
/// describes the dependency graph, and that graph contains the Linux-only
/// libstdc++ whether or not this machine can install it. Discarding it on
/// regeneration is what made a committed pantry.lock unable to survive an
/// install on a second platform (pantry-pm/pantry#231).
///
/// Returns null for a spec meant for this host, and for a malformed one -
/// callers want "which pins does this host legitimately not know about", and a
/// spec nobody can parse is not one of them.
pub fn parseForeignOsDepSpec(spec_in: []const u8) ?struct { domain: []const u8, version: []const u8 } {
    const parsed = parseDepSpecForOs(spec_in) orelse return null;
    return if (parsed.foreign) .{ .domain = parsed.domain, .version = parsed.version } else null;
}

/// The same spec, but only when it carries an OS or architecture guard.
///
/// This is the question the lockfile actually needs answered, and it is not the
/// same as `parseForeignOsDepSpec`. An OS guard on a VERSION CONSTRAINT means
/// the package resolves differently per platform, in both directions:
/// `git-scm.org` declares `linux:gnu.org/gettext^0.21`, so Linux resolves
/// gettext to 0.21.1 and macOS - where the guard does not apply, and no other
/// constraint does - resolves it to 1.0.0. Both records belong in a
/// cross-platform lock.
///
/// Asking "is this guarded for an OS I am not" gets that right on macOS and
/// wrong on Linux, where the guard is the native one and nothing marks the
/// macOS version as belonging to somebody else. Asking "is this guarded at all"
/// is symmetric, which is what a lockfile that has to survive a round trip
/// needs (pantry-pm/pantry#232).
pub fn parseOsGuardedDepSpec(spec_in: []const u8) ?struct { domain: []const u8, version: []const u8 } {
    const parsed = parseDepSpecForOs(spec_in) orelse return null;
    return if (parsed.guarded) .{ .domain = parsed.domain, .version = parsed.version } else null;
}

/// The spec's domain and version whatever OS it is guarded for, if any.
///
/// Used when walking what a platform-dependent pin itself depends on: those
/// deps are usually unguarded, because the package they belong to already only
/// exists on that platform. Asking "is this guarded" of them answers no and
/// loses them.
pub fn parseAnyOsDepSpec(spec_in: []const u8) ?struct { domain: []const u8, version: []const u8 } {
    const parsed = parseDepSpecForOs(spec_in) orelse return null;
    return .{ .domain = parsed.domain, .version = parsed.version };
}

const ParsedPlatformDep = struct { domain: []const u8, version: []const u8, foreign: bool, guarded: bool };

fn normalizedDepArch(arch: []const u8) []const u8 {
    if (std.mem.eql(u8, arch, "x64") or std.mem.eql(u8, arch, "x86_64")) return "x86-64";
    if (std.mem.eql(u8, arch, "arm64")) return "aarch64";
    return arch;
}

fn parseDepSpecForOs(spec_in: []const u8) ?ParsedPlatformDep {
    const os = switch (builtin.os.tag) {
        .linux => "linux",
        .macos => "darwin",
        .windows => "windows",
        else => @tagName(builtin.os.tag),
    };
    return parseDepSpecForPlatform(spec_in, os, @tagName(builtin.cpu.arch));
}

fn parseDepSpecForPlatform(spec_in: []const u8, os: []const u8, arch: []const u8) ?ParsedPlatformDep {
    var spec = spec_in;
    if (std.mem.indexOfScalar(u8, spec, '#')) |h| spec = spec[0..h];
    spec = std.mem.trim(u8, spec, " \t");
    if (spec.len == 0) return null;

    var foreign = false;
    var guarded = false;

    // The same OS/architecture guards as recipe and TypeScript metadata.
    if (std.mem.indexOfScalar(u8, spec, ':')) |colon| {
        const prefix = spec[0..colon];
        const slash = std.mem.indexOfScalar(u8, prefix, '/');
        const guard_os = if (slash) |at| prefix[0..at] else prefix;
        const is_os = std.mem.eql(u8, guard_os, "linux") or std.mem.eql(u8, guard_os, "darwin") or std.mem.eql(u8, guard_os, "windows");
        if (is_os) {
            guarded = true;
            foreign = !std.mem.eql(u8, guard_os, os);
            if (slash) |at| {
                const guard_arch = prefix[at + 1 ..];
                if (guard_arch.len == 0 or std.mem.indexOfScalar(u8, guard_arch, '/') != null) return null;
                foreign = foreign or !std.mem.eql(u8, normalizedDepArch(guard_arch), normalizedDepArch(arch));
            }
            spec = std.mem.trim(u8, spec[colon + 1 ..], " \t");
        }
    }
    if (spec.len == 0) return null;

    // Split the domain from its version constraint at the first operator char.
    var vstart: usize = spec.len;
    for (spec, 0..) |c, i| {
        if (c == '^' or c == '~' or c == '>' or c == '<' or c == '=' or c == '@') {
            vstart = i;
            break;
        }
    }
    const domain = std.mem.trim(u8, spec[0..vstart], " \t");
    if (domain.len == 0) return null;
    // Skip malformed platform-tag pseudo-domains (e.g. `darwin/x86-64`).
    if (std.mem.startsWith(u8, domain, "darwin/") or std.mem.startsWith(u8, domain, "linux/") or std.mem.startsWith(u8, domain, "windows/")) return null;
    var version: []const u8 = "latest";
    if (vstart < spec.len) {
        var v = spec[vstart..];
        if (v.len > 0 and v[0] == '@') v = v[1..]; // `domain@14` → exact 14
        v = std.mem.trim(u8, v, " \t");
        if (v.len > 0) version = v;
    }
    return .{ .domain = domain, .version = version, .foreign = foreign, .guarded = guarded };
}

/// Every package whose resolved version depends on which platform installs it.
///
/// Seeded from the OS-GUARDED dependencies of `seeds` - guarded for any OS,
/// not only for one this host is not - then walked through what those need in
/// turn, guarded or not, because a package that only exists on Linux does not
/// guard its own dependencies a second time. `linux:gnu.org/gcc/libstdcxx@14`
/// is a seed; gmp, mpfr, mpc and binutils arrive on the walk.
///
/// The symmetry is what makes a lock survive a round trip, and it is the part
/// that took two goes to get right. A guard for ANOTHER OS marks a package this
/// host cannot install, which is the obvious case. A guard for THIS one marks a
/// package this host resolves under a constraint the other host does not have,
/// which is the same problem seen from the other side: `git-scm.org` declares
/// `linux:gnu.org/gettext^0.21`, so Linux pins gettext 0.21.1 and macOS pins
/// 1.0.0, and a lock naming only one of them is a lock that cannot cross
/// (pantry-pm/pantry#232).
///
/// A domain nothing declares any more is in neither set, so an obsolete record
/// is still pruned - which is what keeps this from being "carry everything
/// forward".
///
/// The caller owns the returned map. Keys point into the static catalog, so
/// they outlive it and need no freeing.
pub fn platformDependentClosure(allocator: std.mem.Allocator, seeds: []const []const u8) !std.StringHashMap(void) {
    var wanted = std.StringHashMap(void).init(allocator);
    errdefer wanted.deinit();

    var frontier = std.ArrayList([]const u8).empty;
    defer frontier.deinit(allocator);

    for (seeds) |domain| {
        const info = generated.getPackageByDomain(domain) orelse continue;
        for (info.dependencies) |spec| {
            const guarded = parseOsGuardedDepSpec(spec) orelse continue;
            if ((try wanted.getOrPut(guarded.domain)).found_existing) continue;
            try frontier.append(allocator, guarded.domain);
        }
    }

    while (frontier.pop()) |domain| {
        const info = generated.getPackageByDomain(domain) orelse continue;
        for (info.dependencies) |spec| {
            const parsed = parseAnyOsDepSpec(spec) orelse continue;
            if ((try wanted.getOrPut(parsed.domain)).found_existing) continue;
            try frontier.append(allocator, parsed.domain);
        }
    }

    return wanted;
}

/// Append `domain`'s transitive system (pantry) dependencies — read from the
/// embedded package catalog — to `wave` so they get resolved + downloaded too.
/// Without this, a package's shared-library deps (php → libpq/libonig/…,
/// nginx → libpcre) are never installed and the binary fails to load.
/// Best-effort; never fails the install.
fn enqueuePantryDeps(allocator: std.mem.Allocator, domain: []const u8, wave: *std.ArrayList(PipelineDep)) void {
    const info = generated.getPackageByDomain(domain) orelse return;
    for (info.dependencies) |spec| {
        const parsed = parsePantryDepSpec(spec) orelse continue;
        const name = allocator.dupe(u8, parsed.domain) catch continue;
        const ver = allocator.dupe(u8, parsed.version) catch {
            allocator.free(name);
            continue;
        };
        wave.append(allocator, .{ .name = name, .version = ver, .source = .pantry }) catch {
            allocator.free(name);
            allocator.free(ver);
        };
    }
}

fn resolvePantryRegistryTarball(
    allocator: std.mem.Allocator,
    name: []const u8,
    version: []const u8,
) !?ResolvedPackage {
    if (try downloader.lookupS3Registry(allocator, name, version)) |s3_result| {
        return .{
            .name = allocator.dupe(u8, name) catch {
                allocator.free(s3_result.version);
                allocator.free(s3_result.tarball_url);
                return null;
            },
            .version = s3_result.version,
            .tarball_url = s3_result.tarball_url,
            .integrity = null,
            .source = .pantry,
        };
    }

    if (downloader.lookupPantryPublished(allocator, name, version)) |pub_result| {
        return .{
            .name = allocator.dupe(u8, name) catch {
                allocator.free(pub_result.version);
                allocator.free(pub_result.tarball_url);
                return null;
            },
            .version = pub_result.version,
            .tarball_url = pub_result.tarball_url,
            .integrity = null,
            .source = .pantry,
        };
    }

    return null;
}

/// Post-resolution pass: walk the resolved set and pull in the transitive
/// system (pantry) dependencies of every pantry package, reading the dep specs
/// from the embedded catalog and resolving each from the registry. Runs after
/// resolution regardless of which resolver produced the set (server-side bulk
/// `resolveViaRegistry` OR the client-side BFS), so a package's shared-library
/// deps (php → libpq/libonig/libxml2/icu/libsodium, nginx → libpcre) are always
/// installed alongside it. BFS via index walk — appended deps get expanded too.
/// Best-effort: a dep missing from the registry is logged (verbose) and skipped.
fn expandTransitivePantryDeps(
    allocator: std.mem.Allocator,
    resolved: *std.ArrayList(ResolvedPackage),
    verbose: bool,
) !void {
    var present = std.StringHashMap(void).init(allocator);
    defer present.deinit();
    for (resolved.items) |p| present.put(p.name, {}) catch {};

    var i: usize = 0;
    while (i < resolved.items.len) : (i += 1) {
        if (resolved.items[i].source != .pantry) continue;
        const info = generated.getPackageByDomain(resolved.items[i].name) orelse continue;
        for (info.dependencies) |spec| {
            const parsed = parsePantryDepSpec(spec) orelse continue;
            if (present.contains(parsed.domain)) continue;
            const pkg = try resolvePantryRegistryTarball(allocator, parsed.domain, parsed.version) orelse {
                if (verbose) std.debug.print("[verbose:pipeline] transitive dep {s} not in registry — skipped\n", .{parsed.domain});
                continue;
            };
            present.put(pkg.name, {}) catch {};
            resolved.append(allocator, pkg) catch {
                allocator.free(pkg.name);
                allocator.free(pkg.version);
                allocator.free(pkg.tarball_url);
                if (pkg.integrity) |x| allocator.free(x);
            };
        }
    }
}

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
                            .optional = current_wave.items[ri].optional,
                            .lock_only = !result.platform_ok,
                        });
                        // Fix: name should be the dep name, not the version
                        resolved.items[resolved.items.len - 1].name = try allocator.dupe(u8, name_key);

                        // Record in hoisted cache for dedup in later waves
                        if (result.platform_ok) inst.hoisted_versions.put(name_key, result.version);
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

                // Enqueue transitive deps for next wave. A package for
                // another platform is not installed, so neither is anything
                // it needs.
                for (result.dependencies) |dep| {
                    // Skip already-resolved
                    if (!result.platform_ok or seen.contains(dep.name)) {
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
                    // Optional deps are tolerated if they fail (see run()).
                    next_wave.append(allocator, .{
                        .name = dep.name,
                        .version = dep.version_constraint,
                        .source = .npm,
                        .optional = dep.is_optional,
                    }) catch {
                        allocator.free(dep.name);
                        allocator.free(dep.version_constraint);
                        continue;
                    };
                }
                allocator.free(result.dependencies);
            } else {
                // Resolution returned no result — add non-npm packages
                // directly with their original source preserved. .pantry,
                // .github, .git, .http, .ziglang, .local all install via
                // their own paths in the download phase (or out-of-band).
                const dep = current_wave.items[ri];
                if (dep.source == .npm) {
                    if (try resolvePantryRegistryTarball(allocator, dep.name, dep.version)) |pantry_pkg| {
                        if (!seen.contains(dep.name)) {
                            try seen.put(try allocator.dupe(u8, dep.name), {});
                            try resolved.append(allocator, pantry_pkg);
                            inst.hoisted_versions.put(pantry_pkg.name, pantry_pkg.version);
                            // Pull in its transitive system deps (shared libs).
                            enqueuePantryDeps(allocator, dep.name, &next_wave);
                        } else {
                            allocator.free(pantry_pkg.name);
                            allocator.free(pantry_pkg.version);
                            allocator.free(pantry_pkg.tarball_url);
                            if (pantry_pkg.integrity) |i| allocator.free(i);
                        }
                    }
                } else {
                    if (!seen.contains(dep.name)) {
                        try seen.put(try allocator.dupe(u8, dep.name), {});
                        if (dep.source == .pantry) {
                            const pantry_pkg = if (packages.isRollingZigDevChannel(dep.name, dep.version))
                                null
                            else
                                try resolvePantryRegistryTarball(allocator, dep.name, dep.version);
                            if (pantry_pkg) |resolved_pkg| {
                                try resolved.append(allocator, resolved_pkg);
                            } else {
                                try resolved.append(allocator, .{
                                    .name = try allocator.dupe(u8, dep.name),
                                    .version = try allocator.dupe(u8, dep.version),
                                    .tarball_url = try allocator.dupe(u8, ""),
                                    .integrity = null,
                                    .source = dep.source,
                                });
                            }
                            // Pull in its transitive system deps (shared libs)
                            // from the embedded catalog so the binary can load.
                            enqueuePantryDeps(allocator, dep.name, &next_wave);
                        } else {
                            try resolved.append(allocator, .{
                                .name = try allocator.dupe(u8, dep.name),
                                .version = try allocator.dupe(u8, dep.version),
                                .tarball_url = try allocator.dupe(u8, ""),
                                .integrity = null,
                                .source = dep.source,
                                .github_owner = dep.github_owner,
                                .github_repo = dep.github_repo,
                            });
                        }
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
    completed: *std.atomic.Value(usize),
    verbose: bool,
    show_progress: bool,

    fn worker(ctx: *DownloadThreadCtx) void {
        const alloc = ctx.installer.allocator;
        while (true) {
            const i = ctx.next.fetchAdd(1, .monotonic);
            if (i >= ctx.packages.len) break;

            // Bump the finished-package count on every exit from this iteration
            // — success, failure, or any early `continue` in the body — so the
            // live progress line advances exactly once per package. The inner
            // download-retry loop's `continue` targets that loop, not this one,
            // so it never trips this defer early.
            defer _ = ctx.completed.fetchAdd(1, .release);

            const pkg = ctx.packages[i];
            // Dupe name+version so results outlive the resolved list
            const owned_name = alloc.dupe(u8, pkg.name) catch "";
            const owned_version = alloc.dupe(u8, pkg.version) catch "";

            if (pkg.lock_only) {
                ctx.results[i] = .{ .name = owned_name, .version = owned_version, .success = true, .from_cache = true, .lock_only = true };
                continue;
            }

            // .pantry source: system binaries from registry.pantry.dev.
            // Delegate to installer.install() which handles S3 lookup,
            // version resolution, download, and extraction for system deps.
            if (pkg.source == .pantry) {
                const spec = PackageSpec{
                    .name = pkg.name,
                    .version = pkg.version,
                    .source = .pantry,
                };
                const opts = installer_mod.InstallOptions{
                    .verbose = ctx.verbose,
                    .project_root = ctx.project_root,
                    // Silence the installer's own per-package download/extract
                    // lines while the live spinner owns the terminal line.
                    .quiet = ctx.show_progress,
                };
                if (ctx.installer.install(spec, opts)) |install_result_| {
                    var ir = install_result_;
                    defer ir.deinit(alloc);
                    ctx.results[i] = .{
                        .name = owned_name,
                        .version = alloc.dupe(u8, ir.version) catch owned_version,
                        .success = true,
                        .from_cache = ir.from_cache,
                    };
                    if (ctx.verbose) {
                        std.debug.print("[verbose:pipeline:download] pantry-source installed: {s} @ {s}\n", .{ pkg.name, ir.version });
                    }
                } else |err| {
                    const msg = std.fmt.allocPrint(alloc, "{s}", .{@errorName(err)}) catch null;
                    ctx.results[i] = .{
                        .name = owned_name,
                        .version = owned_version,
                        .success = false,
                        .error_msg = msg,
                    };
                    if (ctx.verbose) {
                        std.debug.print("[verbose:pipeline:download] pantry-source FAILED: {s} @ {s}: {s}\n", .{ pkg.name, pkg.version, @errorName(err) });
                    }
                }
                continue;
            }

            if (pkg.source == .github) {
                const owner = pkg.github_owner orelse {
                    ctx.results[i] = .{ .name = owned_name, .version = owned_version, .success = false, .error_msg = alloc.dupe(u8, "missing GitHub owner") catch null };
                    continue;
                };
                const repo_name = pkg.github_repo orelse {
                    ctx.results[i] = .{ .name = owned_name, .version = owned_version, .success = false, .error_msg = alloc.dupe(u8, "missing GitHub repository") catch null };
                    continue;
                };
                var repo_buf: [512]u8 = undefined;
                const repo = std.fmt.bufPrint(&repo_buf, "{s}/{s}", .{ owner, repo_name }) catch {
                    ctx.results[i] = .{ .name = owned_name, .version = owned_version, .success = false, .error_msg = alloc.dupe(u8, "GitHub repository name is too long") catch null };
                    continue;
                };
                const spec = PackageSpec{
                    .name = pkg.name,
                    .version = pkg.version,
                    .source = .github,
                    .repo = repo,
                };
                const opts = installer_mod.InstallOptions{
                    .verbose = ctx.verbose,
                    .project_root = ctx.project_root,
                    .quiet = ctx.show_progress,
                };
                if (ctx.installer.install(spec, opts)) |install_result_| {
                    var ir = install_result_;
                    defer ir.deinit(alloc);
                    ctx.results[i] = .{
                        .name = owned_name,
                        .version = alloc.dupe(u8, ir.version) catch owned_version,
                        .success = true,
                        .from_cache = ir.from_cache,
                    };
                } else |err| {
                    ctx.results[i] = .{
                        .name = owned_name,
                        .version = owned_version,
                        .success = false,
                        .error_msg = std.fmt.allocPrint(alloc, "{s}", .{@errorName(err)}) catch null,
                    };
                }
                continue;
            }

            // Skip other non-npm packages (handled out-of-band by caller)
            if (pkg.source != .npm) {
                ctx.results[i] = .{
                    .name = owned_name,
                    .version = owned_version,
                    .success = true,
                    .from_cache = true,
                };
                continue;
            }

            // Check if the exact resolved version is already installed on disk.
            // A name-only directory check retained stale packages after a
            // manifest constraint was bumped.
            const already_installed = installedNpmPackageMatches(
                ctx.installer.allocator,
                ctx.project_root,
                ctx.modules_dir,
                pkg.name,
                pkg.version,
                false,
            );

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

            var exist_buf: [std.fs.max_path_bytes]u8 = undefined;
            const install_dir = std.fmt.bufPrint(&exist_buf, "{s}/{s}/{s}", .{ ctx.project_root, ctx.modules_dir, pkg.name }) catch {
                ctx.results[i] = .{ .name = owned_name, .version = owned_version, .success = false, .error_msg = null };
                continue;
            };

            // Check content-addressed cache
            const cached_tarball = ctx.installer.cache.get(pkg.name, pkg.version) catch null;
            const tarball_data = if (cached_tarball) |meta|
                io_helper.readFileAlloc(ctx.installer.allocator, meta.cache_path, 256 * 1024 * 1024) catch null
            else
                null;

            // Offline mode: if tarball isn't in the content-addressed cache, we refuse to
            // touch the network. A clear error message is surfaced via error_msg so the
            // user knows exactly which package was missing and can either re-run online
            // or pre-seed the cache.
            if (tarball_data == null and offline.isOfflineMode()) {
                const em = std.fmt.allocPrint(
                    ctx.installer.allocator,
                    "{s}@{s}: not in cache and PANTRY_OFFLINE=1 is set",
                    .{ pkg.name, pkg.version },
                ) catch null;
                ctx.results[i] = .{
                    .name = owned_name,
                    .version = owned_version,
                    .success = false,
                    .error_msg = em,
                };
                continue;
            }

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
                ctx.installer.cache.put(pkg.name, pkg.version, pkg.tarball_url, checksum, dl) catch |err| {
                    if (ctx.verbose) std.debug.print("[verbose:pipeline] cache put failed: {s}\n", .{@errorName(err)});
                };

                break :dl_blk dl;
            };

            if (tarball_bytes == null) {
                ctx.results[i] = .{ .name = owned_name, .version = owned_version, .success = false, .error_msg = null };
                continue;
            }
            defer ctx.installer.allocator.free(tarball_bytes.?);

            // Integrity verification — if the resolver gave us an integrity value
            // (SRI or raw hex), make sure the bytes match before we touch disk.
            // Unknown formats are accepted silently to avoid bricking installs.
            if (pkg.integrity) |integrity| {
                if (integrity.len > 0 and !verifyIntegrity(ctx.installer.allocator, tarball_bytes.?, integrity)) {
                    const em = std.fmt.allocPrint(
                        ctx.installer.allocator,
                        "{s}@{s}: integrity mismatch (expected {s})",
                        .{ pkg.name, pkg.version, integrity[0..@min(integrity.len, 80)] },
                    ) catch null;
                    ctx.results[i] = .{
                        .name = owned_name,
                        .version = owned_version,
                        .success = false,
                        .error_msg = em,
                    };
                    continue;
                }
            }

            // Atomic extraction: extract into <install_dir>.partial first, then rename
            // to <install_dir>. A crash mid-extract leaves a `.partial` sibling that we
            // clean up on every entry, so it never lands as a half-installed package.
            var partial_buf: [std.fs.max_path_bytes]u8 = undefined;
            const partial_dir = std.fmt.bufPrint(&partial_buf, "{s}.partial", .{install_dir}) catch {
                ctx.results[i] = .{ .name = owned_name, .version = owned_version, .success = false, .error_msg = null };
                continue;
            };
            // Clean up any leftover partial from a previous run
            io_helper.deleteTree(partial_dir) catch {};
            io_helper.makePath(partial_dir) catch {
                ctx.results[i] = .{ .name = owned_name, .version = owned_version, .success = false, .error_msg = null };
                continue;
            };

            const extract_success = blk: {
                var dest = io_helper.cwd().openDir(io_helper.io, partial_dir, .{}) catch break :blk false;
                defer dest.close(io_helper.io);

                var input_reader: std.Io.Reader = .fixed(tarball_bytes.?);
                var window_buf: [65536]u8 = undefined;
                var decompressor: std.compress.flate.Decompress = .init(&input_reader, .gzip, &window_buf);
                // Use diagnostics to handle duplicate tar entries (e.g. ts-mocker has
                // dist/bin/cli.js listed twice). Without diagnostics, pipeToFileSystem
                // errors on the duplicate and aborts extraction.
                var diagnostics: std.tar.Diagnostics = .{ .allocator = ctx.installer.allocator };
                defer diagnostics.deinit();
                std.tar.pipeToFileSystem(io_helper.io, dest, &decompressor.reader, .{
                    .strip_components = 1,
                    .diagnostics = &diagnostics,
                }) catch {
                    io_helper.deleteTree(partial_dir) catch {};
                    break :blk false;
                };
                break :blk true;
            };

            if (!extract_success) {
                io_helper.deleteTree(partial_dir) catch {};
                ctx.results[i] = .{ .name = owned_name, .version = owned_version, .success = false, .error_msg = null };
                continue;
            }

            // Rename .partial → install_dir atomically. If a previous install is
            // present, we delete it first so the rename target is free.
            io_helper.accessAbsolute(install_dir, .{}) catch {
                // Good — target doesn't exist, proceed
            };
            io_helper.deleteTree(install_dir) catch {};
            io_helper.rename(partial_dir, install_dir) catch {
                // Best-effort recovery: fall back to moving by copy, then clean up.
                io_helper.makePath(install_dir) catch {};
                // Leave a breadcrumb so partial contents are cleaned next run
                io_helper.deleteTree(partial_dir) catch {};
                ctx.results[i] = .{ .name = owned_name, .version = owned_version, .success = false, .error_msg = null };
                continue;
            };

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
// Phase 1 (Fast): Server-Side Bulk Resolution
// ============================================================================

/// Resolve the full dependency tree via a single POST to registry.pantry.dev/npm/resolve.
/// The server resolves the entire transitive tree server-side (BFS with concurrent npm fetches).
/// Falls back to client-side resolveFullTree() if the server is unreachable.
fn resolveViaRegistry(
    allocator: std.mem.Allocator,
    inst: *Installer,
    top_level_deps: []const PipelineDep,
    verbose: bool,
) !std.ArrayList(ResolvedPackage) {
    // Build JSON body: {"dependencies":{"react":"^18","lodash":"^4",...}}
    // Only include npm packages (skip domain-style/pantry packages)
    var body_buf = std.ArrayList(u8).empty;
    defer body_buf.deinit(allocator);
    body_buf.appendSlice(allocator, "{\"dependencies\":{") catch
        return resolveFullTree(allocator, inst, top_level_deps, verbose);

    var first = true;
    var npm_count: usize = 0;
    for (top_level_deps) |dep| {
        if (dep.source != .npm) continue;
        if (!first) body_buf.append(allocator, ',') catch continue;
        first = false;
        body_buf.append(allocator, '"') catch continue;
        body_buf.appendSlice(allocator, dep.name) catch continue;
        body_buf.appendSlice(allocator, "\":\"") catch continue;
        body_buf.appendSlice(allocator, dep.version) catch continue;
        body_buf.append(allocator, '"') catch continue;
        npm_count += 1;
    }
    body_buf.appendSlice(allocator, "}}") catch
        return resolveFullTree(allocator, inst, top_level_deps, verbose);

    if (npm_count == 0) {
        return resolveFullTree(allocator, inst, top_level_deps, verbose);
    }

    if (verbose) {
        std.debug.print("[verbose:pipeline:registry] POSTing {d} deps to registry.pantry.dev/npm/resolve...\n", .{npm_count});
    }

    // Single HTTP POST to resolve entire tree server-side
    const response = io_helper.httpPostJsonTimeout(
        allocator,
        "https://registry.pantry.dev/npm/resolve",
        body_buf.items,
        5000,
    ) catch {
        if (verbose) std.debug.print("[verbose:pipeline:registry] server unreachable, falling back to client-side resolution\n", .{});
        return resolveFullTree(allocator, inst, top_level_deps, verbose);
    };
    defer allocator.free(response);

    if (response.len == 0) {
        return resolveFullTree(allocator, inst, top_level_deps, verbose);
    }

    // Parse response
    const parsed = std.json.parseFromSlice(std.json.Value, allocator, response, .{}) catch {
        if (verbose) std.debug.print("[verbose:pipeline:registry] failed to parse response, falling back\n", .{});
        return resolveFullTree(allocator, inst, top_level_deps, verbose);
    };
    defer parsed.deinit();

    if (parsed.value != .object) return resolveFullTree(allocator, inst, top_level_deps, verbose);
    const resolved_obj = parsed.value.object.get("resolved") orelse
        return resolveFullTree(allocator, inst, top_level_deps, verbose);
    if (resolved_obj != .object) return resolveFullTree(allocator, inst, top_level_deps, verbose);

    // Build resolved list from server response
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

    var iter = resolved_obj.object.iterator();
    while (iter.next()) |entry| {
        const pkg_name = entry.key_ptr.*;
        const pkg_val = entry.value_ptr.*;
        if (pkg_val != .object) continue;

        const version = if (pkg_val.object.get("version")) |v| (if (v == .string) v.string else continue) else continue;
        const tarball = if (pkg_val.object.get("tarball")) |t| (if (t == .string) t.string else continue) else continue;
        const integrity_val = if (pkg_val.object.get("integrity")) |i| (if (i == .string and i.string.len > 0) i.string else null) else null;

        try resolved.append(allocator, .{
            .name = try allocator.dupe(u8, pkg_name),
            .version = try allocator.dupe(u8, version),
            .tarball_url = try allocator.dupe(u8, tarball),
            .integrity = if (integrity_val) |i| try allocator.dupe(u8, i) else null,
            .source = .npm,
        });

        // Also populate hoisted cache for dedup
        inst.hoisted_versions.put(pkg_name, version);
    }

    // Check if any top-level npm deps are missing from server response.
    // The server may skip some due to dedup, caching, or resolution failures.
    // Fall back to individual resolution for those.
    var missing_count: usize = 0;
    for (top_level_deps) |dep| {
        if (dep.source != .npm) continue;

        // Check if this dep (or its alias) is in the resolved list
        var found = false;
        for (resolved.items) |pkg| {
            if (std.mem.eql(u8, pkg.name, dep.name)) {
                found = true;
                break;
            }
        }
        if (!found) {
            // This dependency entered the bulk request explicitly as npm. If
            // the server has not observed a just-published version yet, resolve
            // it directly against npm instead of reclassifying it through the
            // Pantry registry. Reclassification can return Pantry metadata for
            // a same-named package and then route the npm tarball through the
            // system-package installer, ending in PackageNotFound.
            const npm_info = inst.resolveNpmPackage(dep.name, dep.version) catch continue;
            defer allocator.free(npm_info.version);
            defer allocator.free(npm_info.tarball_url);
            defer if (npm_info.integrity) |i| allocator.free(i);

            try resolved.append(allocator, .{
                .name = try allocator.dupe(u8, dep.name),
                .version = try allocator.dupe(u8, npm_info.version),
                .tarball_url = try allocator.dupe(u8, npm_info.tarball_url),
                .integrity = if (npm_info.integrity) |i| try allocator.dupe(u8, i) else null,
                .source = .npm,
            });
            inst.hoisted_versions.put(dep.name, npm_info.version);
            missing_count += 1;
        }
    }

    if (verbose and missing_count > 0) {
        std.debug.print("[verbose:pipeline:registry] individually resolved {d} packages missed by server\n", .{missing_count});
    }

    // Add non-npm top-level deps (pantry/github/etc) that weren't sent to the server
    for (top_level_deps) |dep| {
        if (dep.source == .npm) continue;
        if (dep.source == .pantry and !packages.isRollingZigDevChannel(dep.name, dep.version)) {
            if (try resolvePantryRegistryTarball(allocator, dep.name, dep.version)) |pantry_pkg| {
                try resolved.append(allocator, pantry_pkg);
                continue;
            }
        }
        try resolved.append(allocator, .{
            .name = try allocator.dupe(u8, dep.name),
            .version = try allocator.dupe(u8, dep.version),
            .tarball_url = try allocator.dupe(u8, ""),
            .integrity = null,
            .source = dep.source,
            .github_owner = dep.github_owner,
            .github_repo = dep.github_repo,
        });
    }

    if (verbose) {
        std.debug.print("[verbose:pipeline:registry] server resolved {d} packages (from {d} top-level deps)\n", .{ resolved.items.len, npm_count });
    }

    return resolved;
}

/// The Pantry registry bulk endpoints are an optional acceleration layer, not
/// an authoritative dependency source. Keep npm installs independent from
/// registry availability unless a caller explicitly opts into the accelerator.
fn registryAccelerationValueEnabled(value: ?[]const u8) bool {
    const raw = value orelse return false;
    return std.ascii.eqlIgnoreCase(raw, "true") or std.mem.eql(u8, raw, "1");
}

fn registryAccelerationEnabled(allocator: std.mem.Allocator) bool {
    const value = io_helper.getEnvVarOwned(allocator, "PANTRY_REGISTRY_ACCELERATION") catch return false;
    defer allocator.free(value);
    return registryAccelerationValueEnabled(value);
}

test "registry acceleration is opt-in" {
    try std.testing.expect(!registryAccelerationValueEnabled(null));
    try std.testing.expect(!registryAccelerationValueEnabled(""));
    try std.testing.expect(!registryAccelerationValueEnabled("false"));
    try std.testing.expect(registryAccelerationValueEnabled("1"));
    try std.testing.expect(registryAccelerationValueEnabled("TRUE"));
}

fn appendJsonString(allocator: std.mem.Allocator, out: *std.ArrayList(u8), value: []const u8) !void {
    try out.append(allocator, '"');
    for (value) |c| {
        switch (c) {
            '"' => try out.appendSlice(allocator, "\\\""),
            '\\' => try out.appendSlice(allocator, "\\\\"),
            '\n' => try out.appendSlice(allocator, "\\n"),
            '\r' => try out.appendSlice(allocator, "\\r"),
            '\t' => try out.appendSlice(allocator, "\\t"),
            else => {
                if (c < 0x20) {
                    const hex = "0123456789abcdef";
                    try out.appendSlice(allocator, "\\u00");
                    try out.append(allocator, hex[c >> 4]);
                    try out.append(allocator, hex[c & 0x0f]);
                } else {
                    try out.append(allocator, c);
                }
            },
        }
    }
    try out.append(allocator, '"');
}

fn isInstalledOrCached(
    inst: *Installer,
    project_root: []const u8,
    modules_dir: []const u8,
    pkg: ResolvedPackage,
) bool {
    var install_dir_buf: [std.fs.max_path_bytes]u8 = undefined;
    const install_dir = std.fmt.bufPrint(&install_dir_buf, "{s}/{s}/{s}", .{ project_root, modules_dir, pkg.name }) catch return false;
    io_helper.accessAbsolute(install_dir, .{}) catch {
        const cached = inst.cache.get(pkg.name, pkg.version) catch null;
        return cached != null;
    };

    // A directory with the right package name is not enough: constraints can
    // resolve to a newer release while an older package is still on disk. The
    // previous name-only check silently retained that stale version and then
    // rewrote pantry.lock with the new constraint as though it were resolved.
    if (pkg.source == .npm) {
        return installedNpmPackageMatches(inst.allocator, project_root, modules_dir, pkg.name, pkg.version, false);
    }

    if (pkg.source == .pantry) {
        var version_dir_buf: [std.fs.max_path_bytes]u8 = undefined;
        const version_dir = std.fmt.bufPrint(&version_dir_buf, "{s}/v{s}", .{ install_dir, pkg.version }) catch return false;
        io_helper.accessAbsolute(version_dir, .{}) catch return false;
        return true;
    }

    return false;
}

fn packageManifestHasVersion(allocator: std.mem.Allocator, manifest: []const u8, expected_version: []const u8) bool {
    const parsed = std.json.parseFromSlice(std.json.Value, allocator, manifest, .{}) catch return false;
    defer parsed.deinit();
    if (parsed.value != .object) return false;
    const version = parsed.value.object.get("version") orelse return false;
    return version == .string and std.mem.eql(u8, version.string, expected_version);
}

fn packageManifestSatisfiesConstraint(allocator: std.mem.Allocator, manifest: []const u8, version_constraint: []const u8) bool {
    const parsed = std.json.parseFromSlice(std.json.Value, allocator, manifest, .{}) catch return false;
    defer parsed.deinit();
    if (parsed.value != .object) return false;
    const version = parsed.value.object.get("version") orelse return false;
    if (version != .string) return false;
    if (std.mem.eql(u8, version.string, version_constraint)) return true;

    const semver = @import("../packages/semver.zig");
    const constraint = semver.parseConstraint(version_constraint) catch return false;
    return semver.satisfiesConstraint(version.string, constraint);
}

fn installedNpmPackageMatches(
    allocator: std.mem.Allocator,
    project_root: []const u8,
    modules_dir: []const u8,
    name: []const u8,
    expected_version: []const u8,
    accept_constraint: bool,
) bool {
    var manifest_path_buf: [std.fs.max_path_bytes]u8 = undefined;
    const manifest_path = std.fmt.bufPrint(&manifest_path_buf, "{s}/{s}/{s}/package.json", .{ project_root, modules_dir, name }) catch return false;
    const manifest = io_helper.readFileAlloc(allocator, manifest_path, 2 * 1024 * 1024) catch return false;
    defer allocator.free(manifest);
    return if (accept_constraint)
        packageManifestSatisfiesConstraint(allocator, manifest, expected_version)
    else
        packageManifestHasVersion(allocator, manifest, expected_version);
}

test "installed package manifest must match the resolved version" {
    const allocator = std.testing.allocator;
    const manifest = "{\"name\":\"bunfig\",\"version\":\"0.15.6\"}";

    try std.testing.expect(packageManifestHasVersion(allocator, manifest, "0.15.6"));
    try std.testing.expect(!packageManifestHasVersion(allocator, manifest, "0.15.15"));
    try std.testing.expect(!packageManifestHasVersion(allocator, "{\"name\":\"bunfig\"}", "0.15.15"));
    try std.testing.expect(packageManifestSatisfiesConstraint(allocator, manifest, "^0.15.0"));
    try std.testing.expect(!packageManifestSatisfiesConstraint(allocator, manifest, "^0.15.15"));
}

fn buildNpmBulkDownloadBody(
    allocator: std.mem.Allocator,
    inst: *Installer,
    packages_to_download: []const ResolvedPackage,
    project_root: []const u8,
    modules_dir: []const u8,
) !?[]u8 {
    var body = try std.ArrayList(u8).initCapacity(allocator, packages_to_download.len * 160 + 32);
    errdefer body.deinit(allocator);

    try body.appendSlice(allocator, "{\"packages\":[");
    var first = true;
    var count: usize = 0;

    for (packages_to_download) |pkg| {
        if (pkg.source != .npm and pkg.source != .pantry) continue;
        if (pkg.tarball_url.len == 0) continue;
        if (isInstalledOrCached(inst, project_root, modules_dir, pkg)) continue;

        if (!first) try body.append(allocator, ',');
        first = false;
        try body.append(allocator, '{');
        try body.appendSlice(allocator, "\"name\":");
        try appendJsonString(allocator, &body, pkg.name);
        try body.appendSlice(allocator, ",\"version\":");
        try appendJsonString(allocator, &body, pkg.version);
        try body.appendSlice(allocator, ",\"tarball\":");
        try appendJsonString(allocator, &body, pkg.tarball_url);
        if (pkg.integrity) |integrity| {
            try body.appendSlice(allocator, ",\"integrity\":");
            try appendJsonString(allocator, &body, integrity);
        }
        try body.append(allocator, '}');
        count += 1;
    }

    try body.appendSlice(allocator, "]}");
    if (count == 0) {
        body.deinit(allocator);
        return null;
    }
    return try body.toOwnedSlice(allocator);
}

fn createBulkDownloadTempDir(allocator: std.mem.Allocator, inst: *Installer) ![]const u8 {
    const now = io_helper.clockGettime();
    const stamp = @as(u64, @intCast(now.sec)) * std.time.ns_per_s + @as(u64, @intCast(now.nsec));
    const temp_dir = try std.fmt.allocPrint(allocator, "{s}/registry-bulk-{d}", .{ inst.cache.cache_dir, stamp });
    errdefer allocator.free(temp_dir);
    try io_helper.makePath(temp_dir);
    return temp_dir;
}

fn extractBulkDownloadArchive(
    allocator: std.mem.Allocator,
    archive: []const u8,
    temp_dir: []const u8,
) !void {
    var dest = io_helper.cwd().openDir(io_helper.io, temp_dir, .{}) catch return error.FileNotFound;
    defer dest.close(io_helper.io);

    var input_reader: std.Io.Reader = .fixed(archive);
    var diagnostics: std.tar.Diagnostics = .{ .allocator = allocator };
    defer diagnostics.deinit();
    try std.tar.pipeToFileSystem(io_helper.io, dest, &input_reader, .{
        .diagnostics = &diagnostics,
    });
}

fn cacheBulkDownloadEntries(
    allocator: std.mem.Allocator,
    inst: *Installer,
    temp_dir: []const u8,
    verbose: bool,
) !usize {
    const manifest_path = try std.fmt.allocPrint(allocator, "{s}/manifest.json", .{temp_dir});
    defer allocator.free(manifest_path);

    const manifest_bytes = try io_helper.readFileAlloc(allocator, manifest_path, 16 * 1024 * 1024);
    defer allocator.free(manifest_bytes);

    const parsed = try std.json.parseFromSlice(std.json.Value, allocator, manifest_bytes, .{});
    defer parsed.deinit();

    if (parsed.value != .object) return 0;
    const packages_val = parsed.value.object.get("packages") orelse return 0;
    if (packages_val != .array) return 0;

    var cached_count: usize = 0;
    for (packages_val.array.items) |pkg_val| {
        if (pkg_val != .object) continue;
        const name = if (pkg_val.object.get("name")) |v| (if (v == .string) v.string else continue) else continue;
        const version = if (pkg_val.object.get("version")) |v| (if (v == .string) v.string else continue) else continue;
        const tarball_url = if (pkg_val.object.get("tarball")) |v| (if (v == .string) v.string else continue) else continue;
        const file = if (pkg_val.object.get("file")) |v| (if (v == .string) v.string else continue) else continue;
        const integrity = if (pkg_val.object.get("integrity")) |v| (if (v == .string and v.string.len > 0) v.string else null) else null;

        if (!std.mem.startsWith(u8, file, "packages/")) continue;
        if (std.mem.indexOf(u8, file, "..") != null or std.mem.startsWith(u8, file, "/")) continue;

        const tarball_path = try std.fmt.allocPrint(allocator, "{s}/{s}", .{ temp_dir, file });
        defer allocator.free(tarball_path);

        const tarball_bytes = io_helper.readFileAlloc(allocator, tarball_path, 512 * 1024 * 1024) catch continue;
        defer allocator.free(tarball_bytes);

        if (integrity) |expected| {
            if (!verifyIntegrity(allocator, tarball_bytes, expected)) {
                if (verbose) std.debug.print("[verbose:pipeline:bulk-download] integrity mismatch for {s}@{s}\n", .{ name, version });
                continue;
            }
        }

        var checksum: [32]u8 = undefined;
        std.crypto.hash.sha2.Sha256.hash(tarball_bytes, &checksum, .{});
        inst.cache.put(name, version, tarball_url, checksum, tarball_bytes) catch |err| {
            if (verbose) std.debug.print("[verbose:pipeline:bulk-download] cache put failed for {s}@{s}: {s}\n", .{ name, version, @errorName(err) });
            continue;
        };
        cached_count += 1;
    }

    return cached_count;
}

/// Prefetch all missing registry tarballs through one Pantry registry response
/// stream. The download endpoint returns an uncompressed tar containing package
/// archives plus a manifest. We extract it into a temp directory, verify
/// integrity when available, then seed the normal content-addressed cache so
/// the installer below never fans out into one HTTP request per package.
fn prefetchNpmTarballsViaRegistry(
    allocator: std.mem.Allocator,
    inst: *Installer,
    resolved: []const ResolvedPackage,
    project_root: []const u8,
    modules_dir: []const u8,
    verbose: bool,
) void {
    if (offline.isOfflineMode()) return;

    const body = buildNpmBulkDownloadBody(allocator, inst, resolved, project_root, modules_dir) catch return;
    const request_body = body orelse return;
    defer allocator.free(request_body);

    if (verbose) {
        std.debug.print("[verbose:pipeline:bulk-download] POSTing registry tarball set to registry.pantry.dev/registry/download\n", .{});
    }

    const archive = io_helper.httpPostJsonWithClient(
        inst.http_client,
        allocator,
        "https://registry.pantry.dev/registry/download",
        request_body,
    ) catch blk: {
        if (verbose) std.debug.print("[verbose:pipeline:bulk-download] canonical endpoint unavailable; trying /npm/download compatibility alias\n", .{});
        break :blk io_helper.httpPostJsonWithClient(
            inst.http_client,
            allocator,
            "https://registry.pantry.dev/npm/download",
            request_body,
        ) catch {
            if (verbose) std.debug.print("[verbose:pipeline:bulk-download] stream unavailable; falling back to per-package downloads\n", .{});
            return;
        };
    };
    defer allocator.free(archive);
    if (archive.len == 0) return;

    const temp_dir = createBulkDownloadTempDir(allocator, inst) catch return;
    defer {
        io_helper.deleteTree(temp_dir) catch {};
        allocator.free(temp_dir);
    }

    extractBulkDownloadArchive(allocator, archive, temp_dir) catch |err| {
        if (verbose) std.debug.print("[verbose:pipeline:bulk-download] extract failed: {s}\n", .{@errorName(err)});
        return;
    };

    const cached = cacheBulkDownloadEntries(allocator, inst, temp_dir, verbose) catch |err| blk: {
        if (verbose) std.debug.print("[verbose:pipeline:bulk-download] cache import failed: {s}\n", .{@errorName(err)});
        break :blk 0;
    };
    if (verbose and cached > 0) {
        std.debug.print("[verbose:pipeline:bulk-download] cached {d} registry tarballs from one registry stream\n", .{cached});
    }
}

// ============================================================================
// Pipeline Entry Point
// ============================================================================

/// Remove any `<pkg>.partial` extraction dirs inside `<project_root>/<modules_dir>`
/// left over from a previously crashed install. Best-effort; any IO errors are
/// reported to the caller which logs them at verbose level.
fn cleanupStalePartials(
    allocator: std.mem.Allocator,
    project_root: []const u8,
    modules_dir: []const u8,
    verbose: bool,
) !void {
    const base = try std.fmt.allocPrint(allocator, "{s}/{s}", .{ project_root, modules_dir });
    defer allocator.free(base);

    var dir = io_helper.openDirForIteration(base) catch return;
    defer dir.close();

    var it = dir.iterate();
    var cleaned: usize = 0;
    while (it.next() catch null) |entry| {
        if (!std.mem.endsWith(u8, entry.name, ".partial")) continue;
        const victim = try std.fmt.allocPrint(allocator, "{s}/{s}", .{ base, entry.name });
        defer allocator.free(victim);
        io_helper.deleteTree(victim) catch continue;
        cleaned += 1;
    }
    if (verbose and cleaned > 0) {
        std.debug.print("[verbose:pipeline:recovery] cleaned {d} stale .partial dirs\n", .{cleaned});
    }
}

/// Run the 3-phase parallel install pipeline.
/// Returns results for each package (success/fail, for reporting and lockfile generation).
/// Drives the live install progress line on its own thread. The download
/// workers (the main thread included) are busy doing I/O, so a dedicated thread
/// is what keeps the spinner animating during long downloads — the whole point
/// being that a multi-second install never looks frozen.
const ProgressCtx = struct {
    completed: *std.atomic.Value(usize),
    total: usize,
    stop: *std.atomic.Value(bool),

    fn run(ctx: *ProgressCtx) void {
        var frame: usize = 0;
        // Brief grace period so cached/instant installs finish before the
        // spinner ever paints — they stay completely clean.
        io_helper.nanosleep(0, 120 * std.time.ns_per_ms);
        while (!ctx.stop.load(.acquire)) {
            const done = ctx.completed.load(.acquire);
            style.printPipelineProgress(done, ctx.total, frame);
            frame +%= 1;
            io_helper.nanosleep(0, 90 * std.time.ns_per_ms);
        }
    }
};

pub fn run(
    allocator: std.mem.Allocator,
    inst: *Installer,
    top_level_deps: []const PipelineDep,
    project_root: []const u8,
    verbose: bool,
) !PipelineResult {
    const total_start = io_helper.clockGettime();
    const total_start_ms = @as(i64, @intCast(total_start.sec)) * 1000 + @divFloor(@as(i64, @intCast(total_start.nsec)), 1_000_000);

    // ── Phase 0: Recovery — sweep stale `.partial` extraction dirs left behind by
    // crashed runs. Cheap (single iteration) and keeps disk clean without user action.
    cleanupStalePartials(allocator, project_root, inst.modules_dir, verbose) catch |err| {
        if (verbose) std.debug.print("[verbose:pipeline:recovery] cleanup skipped: {s}\n", .{@errorName(err)});
    };

    // ── Fast path: check if all top-level deps are already installed ──
    {
        var present_count: usize = 0;
        var npm_count: usize = 0;
        for (top_level_deps) |dep| {
            // Only check npm packages — system/pantry packages aren't in ./pantry/
            if (dep.source != .npm) continue;
            npm_count += 1;
            // With a bun.lock pin in range, only that exact version counts as
            // present: an older in-range copy is the drift this must repair.
            const bun_pin = inst.preferredBunPin(dep.name, dep.version);
            if (installedNpmPackageMatches(
                allocator,
                project_root,
                inst.modules_dir,
                dep.name,
                bun_pin orelse dep.version,
                bun_pin == null,
            )) present_count += 1;
        }

        // Skip only when every top-level npm dep is present on disk. Missing
        // packages must go through resolution/download; otherwise a fresh
        // project can get an empty pantry/ with an "up to date" summary.
        const missing = npm_count - present_count;
        if (canUseNpmFastPath(top_level_deps.len, npm_count, missing)) {
            if (verbose) {
                const check_ts = io_helper.clockGettime();
                const check_ms = @as(i64, @intCast(check_ts.sec)) * 1000 + @divFloor(@as(i64, @intCast(check_ts.nsec)), 1_000_000);
                std.debug.print("[verbose:pipeline] all {d} top-level npm deps already installed ({d}ms)\n", .{ npm_count, check_ms - total_start_ms });
            }
            // Return empty result — nothing to install
            return PipelineResult{
                .installed_count = 0,
                .cached_count = top_level_deps.len,
                .failed_count = 0,
                .results = try allocator.alloc(PackageResult, 0),
            };
        }
    }

    // ── Phase 1: Resolve full dependency tree ──
    // Resolve from npm by default. The Pantry server-side bulk resolver and
    // tarball stream remain an explicit acceleration mode, never a dependency.
    const use_registry_acceleration = registryAccelerationEnabled(allocator);
    if (verbose) {
        const source = if (use_registry_acceleration) "Pantry registry accelerator" else "npm registry";
        std.debug.print("[verbose:pipeline] Phase 1: resolving dependency tree via {s}...\n", .{source});
    }
    var resolved = if (use_registry_acceleration)
        try resolveViaRegistry(allocator, inst, top_level_deps, verbose)
    else
        try resolveFullTree(allocator, inst, top_level_deps, verbose);
    defer {
        for (resolved.items) |pkg| {
            allocator.free(pkg.name);
            allocator.free(pkg.version);
            allocator.free(pkg.tarball_url);
            if (pkg.integrity) |i| allocator.free(i);
        }
        resolved.deinit(allocator);
    }

    // Pull in transitive system (pantry) dependencies so dependent binaries can
    // load their shared libraries. Independent of which resolver ran above.
    try expandTransitivePantryDeps(allocator, &resolved, verbose);

    // Each pantry package also installs its own dependencies; tell the
    // installer which versions this run already chose, so those reuse them
    // instead of adding a second version (see Installer.planned_pantry).
    var planned_pantry = std.StringHashMap([]const u8).init(allocator);
    defer planned_pantry.deinit();
    for (resolved.items) |pkg| {
        if (pkg.source != .pantry) continue;
        planned_pantry.put(pkg.name, pkg.version) catch {};
    }
    const previous_plan = inst.planned_pantry;
    inst.planned_pantry = &planned_pantry;
    defer inst.planned_pantry = previous_plan;

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

    // ── Phase 1.5: Bulk tarball prefetch through Pantry ──
    // For large npm trees, this turns N individual tarball downloads into one
    // registry response stream. The normal worker phase still handles cache
    // hits, extraction, integrity checks, and fallback if the stream is
    // unavailable or skips a tarball.
    if (use_registry_acceleration) {
        prefetchNpmTarballsViaRegistry(allocator, inst, resolved.items, project_root, inst.modules_dir, verbose);
    }

    // ── Phase 2+3: Download + Extract in parallel ──
    // Combined into one phase since downloading and extracting per-package
    // is more cache-friendly than downloading all then extracting all.
    if (verbose) std.debug.print("[verbose:pipeline] Phase 2: downloading & extracting {d} packages...\n", .{resolved.items.len});

    const results = try allocator.alloc(PackageResult, resolved.items.len);
    for (results) |*r| r.* = .{ .name = "", .version = "", .success = false };

    // Live progress: animate a single "installing X/N" line while the workers
    // download+extract. Interactive TTY only — never CI, redirected output,
    // quiet, or verbose (verbose prints its own detail). Computing it here on
    // the main thread also warms style's cached TTY/CI checks so the progress
    // thread reads them race-free.
    //
    // Multi-package only: the spinner's value is the X/N completion count. For a
    // single package it would just sit at 0/1 for the whole download while
    // suppressing the installer's own byte-level progress (e.g. zig's "MB / MB"),
    // which is far more useful — so leave single-package installs to that.
    const show_progress = !verbose and !style.isCI() and style.colorsEnabled() and !style.isQuiet() and resolved.items.len > 1;

    var next_idx = std.atomic.Value(usize).init(0);
    var completed = std.atomic.Value(usize).init(0);
    var dl_ctx = DownloadThreadCtx{
        .installer = inst,
        .packages = resolved.items,
        .results = results,
        .project_root = project_root,
        .modules_dir = inst.modules_dir,
        .next = &next_idx,
        .completed = &completed,
        .verbose = verbose,
        .show_progress = show_progress,
    };

    var stop_progress = std.atomic.Value(bool).init(false);
    var progress_ctx = ProgressCtx{ .completed = &completed, .total = resolved.items.len, .stop = &stop_progress };
    const progress_thread: ?std.Thread = if (show_progress)
        (std.Thread.spawn(.{}, ProgressCtx.run, .{&progress_ctx}) catch null)
    else
        null;

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

    // Stop the progress animation and wipe its line before any result output.
    if (progress_thread) |pt| {
        stop_progress.store(true, .release);
        pt.join();
        style.clearLine();
    }

    const phase2_ts = io_helper.clockGettime();
    const phase2_ms = @as(i64, @intCast(phase2_ts.sec)) * 1000 + @divFloor(@as(i64, @intCast(phase2_ts.nsec)), 1_000_000);

    // Count results
    var installed: usize = 0;
    var cached: usize = 0;
    var failed: usize = 0;
    for (results, 0..) |*r, ri| {
        if (r.lock_only) continue;
        if (r.success) {
            if (r.from_cache) cached += 1 else installed += 1;
        } else if (r.name.len > 0) {
            if (resolved.items[ri].optional) {
                // npm and bun both carry on past an optional dependency that
                // will not install; it is neither reported nor locked.
                if (verbose) std.debug.print("[verbose:pipeline] optional {s}@{s} did not install, skipping\n", .{ r.name, r.version });
                if (r.error_msg) |msg| allocator.free(msg);
                allocator.free(r.name);
                if (r.version.len > 0) allocator.free(r.version);
                r.* = .{ .name = "", .version = "", .success = false };
                continue;
            }
            failed += 1;
        }
    }

    if (verbose) {
        std.debug.print("[verbose:pipeline:timer] Phase 2 (download+extract): {d}ms\n", .{phase2_ms - phase1_ms});
    }

    // ── Phase 3: Post-install patches ──
    // Skip gracefully when no `patchedDependencies` field is present. The patch
    // module is a no-op in that case, so the cost is one file read.
    const patch_result = patches_mod.applyPatchesIn(
        allocator,
        project_root,
        inst.modules_dir,
        verbose,
    ) catch |err| blk: {
        if (verbose) std.debug.print("[verbose:pipeline:patches] error: {s}\n", .{@errorName(err)});
        break :blk patches_mod.PatchResult{ .applied = 0, .failed = 0, .skipped = 0 };
    };
    if (verbose and (patch_result.applied + patch_result.failed + patch_result.skipped) > 0) {
        std.debug.print("[verbose:pipeline:patches] applied={d} failed={d} skipped={d}\n", .{
            patch_result.applied, patch_result.failed, patch_result.skipped,
        });
    }

    if (verbose) {
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

test "dependency architecture guards select the actual target and retain foreign pins" {
    const spec = "darwin/x86-64:libisl.sourceforge.io^0";
    const linux = parseDepSpecForPlatform(spec, "linux", "x86_64").?;
    try std.testing.expect(linux.foreign and linux.guarded);
    try std.testing.expectEqualStrings("libisl.sourceforge.io", linux.domain);
    try std.testing.expectEqualStrings("^0", linux.version);
    try std.testing.expect(!parseDepSpecForPlatform(spec, "darwin", "x64").?.foreign);
    try std.testing.expect(parseDepSpecForPlatform(spec, "darwin", "aarch64").?.foreign);
    try std.testing.expect(!parseDepSpecForPlatform("darwin/arm64:openssl.org@3", "darwin", "aarch64").?.foreign);
    try std.testing.expect(!parseDepSpecForPlatform("linux/aarch64:openssl.org^3", "linux", "arm64").?.foreign);
    try std.testing.expect(!parseDepSpecForPlatform("windows/x86_64:zlib.net", "windows", "x64").?.foreign);
    try std.testing.expect(!parseDepSpecForPlatform("zlib.net^1", "linux", "x64").?.guarded);
    try std.testing.expect(parseDepSpecForPlatform("darwin//x64:zlib.net", "darwin", "x64") == null);
}
