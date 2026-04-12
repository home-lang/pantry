//! Outdated package detection
//!
//! Check which dependencies have newer versions available by querying
//! the appropriate registry (npm for JS packages, S3 for system packages).

const std = @import("std");
const io_helper = @import("../../io_helper.zig");
const common = @import("common.zig");
const style = @import("../style.zig");
const aliases = @import("../../packages/aliases.zig");
const parser = @import("../../deps/parser.zig");
const update_mod = @import("update.zig");
const MetadataCache = update_mod.MetadataCache;

const CommandResult = common.CommandResult;

/// Module-level metadata cache pointer. When set, queryNpmVersions and
/// querySystemVersions will consult this before falling back to a direct
/// HTTP fetch, mirroring the approach used in update.zig.
var g_metadata_cache: ?*MetadataCache = null;

fn cachedHttpGet(allocator: std.mem.Allocator, url: []const u8) ![]u8 {
    if (g_metadata_cache) |cache| {
        if (cache.getOrFetch(url)) |body| return body;
    }
    return io_helper.httpGet(allocator, url);
}

/// Dependency kind for version resolution
const DepKind = enum { npm, system, skip };

/// Package version comparison result
pub const VersionStatus = enum {
    up_to_date,
    minor_update,
    major_update,
    unknown,

    pub fn color(self: VersionStatus) []const u8 {
        return switch (self) {
            .up_to_date => style.green,
            .minor_update => style.yellow,
            .major_update => style.red,
            .unknown => style.dim,
        };
    }
};

/// Outdated package information
pub const OutdatedPackage = struct {
    name: []const u8,
    current: []const u8,
    wanted: []const u8,
    latest: []const u8,
    status: VersionStatus,
    location: []const u8,

    pub fn deinit(self: *OutdatedPackage, allocator: std.mem.Allocator) void {
        allocator.free(self.name);
        allocator.free(self.current);
        allocator.free(self.wanted);
        allocator.free(self.latest);
        allocator.free(self.location);
    }
};

/// Registry version info
const RegistryVersionInfo = struct {
    latest: []const u8,
    wanted: []const u8,

    pub fn deinit(self: *RegistryVersionInfo, allocator: std.mem.Allocator) void {
        allocator.free(self.latest);
        allocator.free(self.wanted);
    }
};

/// Classify a dependency by its name and version
fn classifyDep(name: []const u8, version: []const u8) DepKind {
    if (std.mem.startsWith(u8, version, "link:")) return .skip;
    if (std.mem.startsWith(u8, version, "workspace:")) return .skip;
    if (std.mem.startsWith(u8, version, "~") and version.len > 1 and version[1] == '/') return .skip; // ~/path
    if (std.mem.startsWith(u8, version, "/") or std.mem.startsWith(u8, version, ".")) return .skip;
    if (std.mem.startsWith(u8, name, "npm:")) return .npm;
    if (std.mem.startsWith(u8, name, "auto:")) {
        // auto: means "try pantry registry first, then npm" — classify by the underlying name
        const inner = name[5..];
        if (std.mem.indexOf(u8, inner, ".") != null) return .system;
        if (aliases.resolvealias(inner) != null) return .system;
        return .npm;
    }
    if (std.mem.startsWith(u8, name, "@")) return .npm;
    if (std.mem.indexOf(u8, name, ".") != null) return .system;
    if (aliases.resolvealias(name) != null) return .system;
    return .npm;
}

/// Resolve domain for a system dep
fn resolveSystemDomain(name: []const u8) []const u8 {
    const clean = if (std.mem.startsWith(u8, name, "auto:")) name[5..] else name;
    if (std.mem.indexOf(u8, clean, ".") != null) return clean;
    return aliases.resolvealias(clean) orelse clean;
}

/// Check if a name matches a glob-style filter pattern
fn matchesFilter(name: []const u8, pattern: []const u8) bool {
    // Negation pattern
    if (pattern.len > 0 and pattern[0] == '!') {
        return !matchesFilter(name, pattern[1..]);
    }
    // Exact match
    if (std.mem.eql(u8, name, pattern)) return true;
    // Wildcard at end: "eslint*" matches "eslint-plugin-foo"
    if (std.mem.endsWith(u8, pattern, "*")) {
        return std.mem.startsWith(u8, name, pattern[0 .. pattern.len - 1]);
    }
    // Wildcard at start: "*-utils" matches "string-utils"
    if (pattern.len > 0 and pattern[0] == '*') {
        return std.mem.endsWith(u8, name, pattern[1..]);
    }
    // Scoped wildcard: "@types/*" matches "@types/node"
    if (std.mem.indexOf(u8, pattern, "/*")) |slash_pos| {
        if (std.mem.endsWith(u8, pattern, "/*")) {
            const scope = pattern[0..slash_pos];
            if (std.mem.indexOf(u8, name, "/")) |name_slash| {
                return std.mem.eql(u8, name[0..name_slash], scope);
            }
        }
    }
    return false;
}

/// Check if a dep name matches any of the filter patterns
fn matchesFilters(name: []const u8, filters: []const []const u8) bool {
    if (filters.len == 0) return true; // No filters = match all

    // Check for negation-only patterns (all start with !)
    var has_positive = false;
    for (filters) |f| {
        if (f.len == 0) continue;
        if (f[0] != '!') {
            has_positive = true;
            break;
        }
    }

    if (!has_positive) {
        // Only negation patterns: include everything except negated
        for (filters) |f| {
            if (!matchesFilter(name, f)) return false;
        }
        return true;
    }

    // Has positive patterns: must match at least one positive, and not match any negation
    var matched_positive = false;
    for (filters) |f| {
        if (f.len == 0) continue;
        if (f[0] == '!') {
            if (!matchesFilter(name, f)) return false;
        } else {
            if (matchesFilter(name, f)) matched_positive = true;
        }
    }
    return matched_positive;
}

/// Check for outdated packages
pub fn execute(allocator: std.mem.Allocator, args: []const []const u8) !CommandResult {
    const cwd = try io_helper.getCwdAlloc(allocator);
    defer allocator.free(cwd);

    // Collect all deps from root + workspace members (reuse update logic)
    const deps = try update_mod.collectAllDeps(allocator, cwd);
    defer {
        for (deps) |*dep| {
            var d = dep.*;
            d.deinit(allocator);
        }
        allocator.free(deps);
    }

    if (deps.len == 0) {
        return CommandResult.success(allocator, "No dependencies found");
    }

    style.print("Checking {d} package{s} for updates...\n\n", .{
        deps.len,
        if (deps.len == 1) "" else "s",
    });

    // Parallel metadata prefetch: build URL list and fetch all concurrently
    // so the serial loop below runs at parse speed, not network latency * N.
    var metadata_cache = MetadataCache.init(allocator);
    defer metadata_cache.deinit();
    g_metadata_cache = &metadata_cache;
    defer g_metadata_cache = null;

    {
        var prefetch_urls = std.ArrayList([]u8).empty;
        defer {
            for (prefetch_urls.items) |u| allocator.free(u);
            prefetch_urls.deinit(allocator);
        }

        for (deps) |dep| {
            const kind = classifyDep(dep.name, dep.version);
            if (kind == .skip) continue;

            switch (kind) {
                .npm => {
                    const clean_name = if (std.mem.startsWith(u8, dep.name, "auto:"))
                        dep.name[5..]
                    else if (std.mem.startsWith(u8, dep.name, "npm:"))
                        dep.name[4..]
                    else
                        dep.name;
                    if (std.fmt.allocPrint(allocator, "https://registry.npmjs.org/{s}", .{clean_name})) |url| {
                        prefetch_urls.append(allocator, url) catch {};
                    } else |_| {}
                },
                .system => {
                    const domain = resolveSystemDomain(dep.name);
                    if (std.fmt.allocPrint(allocator, "https://pantry-registry.s3.amazonaws.com/binaries/{s}/metadata.json", .{domain})) |url| {
                        prefetch_urls.append(allocator, url) catch {};
                    } else |_| {}
                },
                .skip => {},
            }
        }

        if (prefetch_urls.items.len > 0) {
            if (allocator.alloc([]const u8, prefetch_urls.items.len)) |const_urls| {
                defer allocator.free(const_urls);
                for (prefetch_urls.items, 0..) |u, idx| const_urls[idx] = u;
                update_mod.prefetchMetadata(allocator, &metadata_cache, const_urls);
            } else |_| {}
        }
    }

    // Check each dependency for updates
    var outdated = std.ArrayList(OutdatedPackage).empty;
    defer {
        for (outdated.items) |*pkg| {
            pkg.deinit(allocator);
        }
        outdated.deinit(allocator);
    }

    for (deps) |dep| {
        // Apply filter patterns from args
        if (!matchesFilters(dep.name, args)) continue;

        const kind = classifyDep(dep.name, dep.version);
        if (kind == .skip) continue;

        // Get installed version from pantry/ or node_modules/
        const installed = getInstalledVersion(allocator, cwd, dep.name) orelse stripPrefix(dep.version);

        // Query appropriate registry
        var registry_info: ?RegistryVersionInfo = switch (kind) {
            .npm => queryNpmVersions(allocator, dep.name, dep.version),
            .system => querySystemVersions(allocator, dep.name, dep.version),
            .skip => null,
        };
        if (registry_info == null) continue;
        defer registry_info.?.deinit(allocator);

        // Determine update status
        const status = determineStatus(installed, registry_info.?.latest);
        if (status == .up_to_date) continue;

        const location: []const u8 = switch (kind) {
            .system => "system",
            .npm => switch (dep.dep_type) {
                .normal => "dependencies",
                .dev => "devDependencies",
                .peer => "peerDependencies",
            },
            .skip => "local",
        };

        try outdated.append(allocator, .{
            .name = try allocator.dupe(u8, dep.name),
            .current = try allocator.dupe(u8, installed),
            .wanted = try allocator.dupe(u8, registry_info.?.wanted),
            .latest = try allocator.dupe(u8, registry_info.?.latest),
            .status = status,
            .location = try allocator.dupe(u8, location),
        });
    }

    // Display results
    if (outdated.items.len == 0) {
        style.print("{s}All packages are up to date!{s}\n", .{ style.green, style.reset });
        return CommandResult.success(allocator, null);
    }

    // Sort by status (major updates first)
    std.mem.sort(OutdatedPackage, outdated.items, {}, struct {
        fn lessThan(_: void, a: OutdatedPackage, b: OutdatedPackage) bool {
            const a_val: u8 = switch (a.status) {
                .major_update => 0,
                .minor_update => 1,
                .up_to_date => 2,
                .unknown => 3,
            };
            const b_val: u8 = switch (b.status) {
                .major_update => 0,
                .minor_update => 1,
                .up_to_date => 2,
                .unknown => 3,
            };
            return a_val < b_val;
        }
    }.lessThan);

    // Print table
    style.print("Outdated Packages:\n\n", .{});
    style.print("{s:<30} {s:<15} {s:<15} {s:<15} {s:<20}\n", .{
        "Package",
        "Current",
        "Wanted",
        "Latest",
        "Location",
    });

    var sep_i: usize = 0;
    while (sep_i < 95) : (sep_i += 1) {
        style.print("-", .{});
    }
    style.print("\n", .{});

    for (outdated.items) |pkg| {
        const clr = pkg.status.color();
        style.print("{s}{s:<30}{s} {s:<15} {s:<15} {s:<15} {s:<20}\n", .{
            clr,
            pkg.name,
            style.reset,
            pkg.current,
            pkg.wanted,
            pkg.latest,
            pkg.location,
        });
    }

    style.print("\n", .{});
    style.print("Legend: {s}Red{s} = Major update  {s}Yellow{s} = Minor update\n\n", .{
        VersionStatus.major_update.color(),
        style.reset,
        VersionStatus.minor_update.color(),
        style.reset,
    });

    const message = try std.fmt.allocPrint(
        allocator,
        "Found {d} outdated package{s}",
        .{ outdated.items.len, if (outdated.items.len == 1) "" else "s" },
    );

    return CommandResult{
        .exit_code = 0,
        .message = message,
    };
}

/// Strip semver prefix
fn stripPrefix(version: []const u8) []const u8 {
    if (version.len == 0) return version;
    if (version[0] == '^' or version[0] == '~') return version[1..];
    if (std.mem.startsWith(u8, version, ">=") or std.mem.startsWith(u8, version, "<=")) return version[2..];
    if (version[0] == '>' or version[0] == '<') return version[1..];
    return version;
}

/// Read the installed version of a package from pantry/<name>/package.json (or node_modules/)
fn getInstalledVersion(allocator: std.mem.Allocator, project_root: []const u8, name: []const u8) ?[]const u8 {
    // Strip prefix from name for path lookup
    const clean_name = if (std.mem.startsWith(u8, name, "auto:"))
        name[5..]
    else if (std.mem.startsWith(u8, name, "npm:"))
        name[4..]
    else
        name;

    const dirs = [_][]const u8{ "pantry", "node_modules" };
    for (dirs) |dir| {
        const pkg_json_path = std.fmt.allocPrint(allocator, "{s}/{s}/{s}/package.json", .{ project_root, dir, clean_name }) catch continue;
        defer allocator.free(pkg_json_path);

        const content = io_helper.readFileAlloc(allocator, pkg_json_path, 2 * 1024 * 1024) catch continue;
        defer allocator.free(content);

        const parsed = std.json.parseFromSlice(std.json.Value, allocator, content, .{}) catch continue;
        defer parsed.deinit();

        if (parsed.value != .object) continue;
        const version_val = parsed.value.object.get("version") orelse continue;
        if (version_val != .string) continue;
        return allocator.dupe(u8, version_val.string) catch null;
    }
    return null;
}

/// Query npm registry for latest and wanted versions
fn queryNpmVersions(allocator: std.mem.Allocator, name: []const u8, constraint: []const u8) ?RegistryVersionInfo {
    const clean_name = if (std.mem.startsWith(u8, name, "auto:"))
        name[5..]
    else if (std.mem.startsWith(u8, name, "npm:"))
        name[4..]
    else
        name;

    const url = std.fmt.allocPrint(allocator, "https://registry.npmjs.org/{s}", .{clean_name}) catch return null;
    defer allocator.free(url);

    const body = cachedHttpGet(allocator, url) catch return null;
    defer allocator.free(body);
    if (body.len == 0) return null;

    const parsed = std.json.parseFromSlice(std.json.Value, allocator, body, .{}) catch return null;
    defer parsed.deinit();
    if (parsed.value != .object) return null;

    // Get dist-tags.latest
    const latest = blk: {
        const dist_tags = parsed.value.object.get("dist-tags") orelse break :blk null;
        if (dist_tags != .object) break :blk null;
        const latest_val = dist_tags.object.get("latest") orelse break :blk null;
        if (latest_val != .string) break :blk null;
        break :blk latest_val.string;
    } orelse return null;

    // Find wanted version (highest satisfying constraint)
    const wanted = blk: {
        if (constraint.len == 0 or std.mem.eql(u8, constraint, "*") or std.mem.eql(u8, constraint, "latest")) {
            break :blk latest;
        }
        const versions_obj = parsed.value.object.get("versions") orelse break :blk latest;
        if (versions_obj != .object) break :blk latest;
        var best: ?[]const u8 = null;
        var ver_iter = versions_obj.object.iterator();
        while (ver_iter.next()) |entry| {
            const ver = entry.key_ptr.*;
            if (satisfiesConstraint(ver, constraint)) {
                if (best == null or compareVersions(ver, best.?) == .gt) best = ver;
            }
        }
        break :blk best orelse latest;
    };

    return RegistryVersionInfo{
        .latest = allocator.dupe(u8, latest) catch return null,
        .wanted = allocator.dupe(u8, wanted) catch return null,
    };
}

/// Query Pantry S3 registry for system package versions
fn querySystemVersions(allocator: std.mem.Allocator, name: []const u8, constraint: []const u8) ?RegistryVersionInfo {
    const domain = resolveSystemDomain(name);

    const metadata_url = std.fmt.allocPrint(
        allocator,
        "https://pantry-registry.s3.amazonaws.com/binaries/{s}/metadata.json",
        .{domain},
    ) catch return null;
    defer allocator.free(metadata_url);

    const body = cachedHttpGet(allocator, metadata_url) catch return null;
    defer allocator.free(body);
    if (body.len == 0) return null;

    const parsed = std.json.parseFromSlice(std.json.Value, allocator, body, .{}) catch return null;
    defer parsed.deinit();
    if (parsed.value != .object) return null;

    const versions_obj = parsed.value.object.get("versions") orelse return null;
    if (versions_obj != .object) return null;

    // Find latest (highest version overall)
    var absolute_best: ?[]const u8 = null;
    var wanted_best: ?[]const u8 = null;
    var ver_iter = versions_obj.object.iterator();
    while (ver_iter.next()) |entry| {
        const ver = entry.key_ptr.*;
        // Track absolute latest
        if (absolute_best == null or compareVersions(ver, absolute_best.?) == .gt) {
            absolute_best = ver;
        }
        // Track wanted (satisfies constraint)
        if (constraint.len == 0 or std.mem.eql(u8, constraint, "*") or std.mem.eql(u8, constraint, "latest") or
            satisfiesConstraint(ver, constraint))
        {
            if (wanted_best == null or compareVersions(ver, wanted_best.?) == .gt) {
                wanted_best = ver;
            }
        }
    }

    const latest = absolute_best orelse return null;
    const wanted = wanted_best orelse latest;

    return RegistryVersionInfo{
        .latest = allocator.dupe(u8, latest) catch return null,
        .wanted = allocator.dupe(u8, wanted) catch return null,
    };
}

/// Check if a version satisfies a semver constraint string (supports ^, ~, >=, >, <=, <, exact, *)
pub fn satisfiesConstraint(version: []const u8, constraint: []const u8) bool {
    const npm = @import("../../registry/npm.zig");
    const SemverConstraint = npm.SemverConstraint;

    // Handle OR groups (||)
    var or_iter = std.mem.splitSequence(u8, constraint, "||");
    while (or_iter.next()) |or_segment| {
        const trimmed = std.mem.trim(u8, or_segment, " \t");
        if (trimmed.len == 0) continue;

        var all_match = true;
        var space_iter = std.mem.tokenizeScalar(u8, trimmed, ' ');
        while (space_iter.next()) |token| {
            const t = std.mem.trim(u8, token, " \t");
            if (t.len == 0) continue;
            const sc = SemverConstraint.parse(t) catch {
                all_match = false;
                break;
            };
            if (!sc.satisfies(version)) {
                all_match = false;
                break;
            }
        }
        if (all_match) return true;
    }
    return false;
}

/// Compare semantic versions
pub fn compareVersions(a: []const u8, b: []const u8) std.math.Order {
    var a_iter = std.mem.splitScalar(u8, a, '.');
    var b_iter = std.mem.splitScalar(u8, b, '.');

    var i: usize = 0;
    while (i < 3) : (i += 1) {
        const a_part = a_iter.next();
        const b_part = b_iter.next();

        if (a_part == null and b_part == null) return .eq;
        if (a_part == null) return .lt;
        if (b_part == null) return .gt;

        const a_clean = if (std.mem.indexOf(u8, a_part.?, "-")) |dash| a_part.?[0..dash] else a_part.?;
        const b_clean = if (std.mem.indexOf(u8, b_part.?, "-")) |dash| b_part.?[0..dash] else b_part.?;

        const a_num = std.fmt.parseInt(u32, a_clean, 10) catch 0;
        const b_num = std.fmt.parseInt(u32, b_clean, 10) catch 0;

        if (a_num < b_num) return .lt;
        if (a_num > b_num) return .gt;
    }
    return .eq;
}

/// Determine version status based on current and latest
fn determineStatus(current: []const u8, latest: []const u8) VersionStatus {
    if (std.mem.eql(u8, current, latest)) return .up_to_date;

    var current_parts = std.mem.splitScalar(u8, current, '.');
    var latest_parts = std.mem.splitScalar(u8, latest, '.');

    const current_major = std.fmt.parseInt(u32, current_parts.next() orelse "0", 10) catch 0;
    const latest_major = std.fmt.parseInt(u32, latest_parts.next() orelse "0", 10) catch 0;

    if (latest_major > current_major) return .major_update;
    return .minor_update;
}
