//! Outdated package detection
//!
//! Check which dependencies have newer versions available by querying
//! the npm registry for each package listed in the project's dependency file.

const std = @import("std");
const io_helper = @import("../../io_helper.zig");
const common = @import("common.zig");
const style = @import("../style.zig");

const CommandResult = common.CommandResult;

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

/// Registry version info returned from npm
const RegistryVersionInfo = struct {
    latest: []const u8,
    wanted: []const u8,

    pub fn deinit(self: *RegistryVersionInfo, allocator: std.mem.Allocator) void {
        allocator.free(self.latest);
        allocator.free(self.wanted);
    }
};

/// Check for outdated packages
pub fn execute(allocator: std.mem.Allocator, args: []const []const u8) !CommandResult {
    _ = args;

    const detector = @import("../../deps/detector.zig");
    const parser = @import("../../deps/parser.zig");

    const cwd = try io_helper.getCwdAlloc(allocator);
    defer allocator.free(cwd);

    // Find dependency file
    const deps_file = (try detector.findDepsFile(allocator, cwd)) orelse {
        return CommandResult.err(allocator, "No dependency file found");
    };
    defer allocator.free(deps_file.path);

    // Parse dependencies
    const deps = try parser.inferDependencies(allocator, deps_file);
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

    // Check each dependency for updates
    var outdated = std.ArrayList(OutdatedPackage).init(allocator);
    defer {
        for (outdated.items) |*pkg| {
            pkg.deinit(allocator);
        }
        outdated.deinit();
    }

    for (deps) |dep| {
        // Get installed version from node_modules/<name>/package.json
        const installed = getInstalledVersion(allocator, cwd, dep.name) orelse continue;
        defer allocator.free(installed);

        // Query npm registry for latest and wanted versions
        var registry_info = queryRegistryVersions(allocator, dep.name, dep.version) orelse continue;
        defer registry_info.deinit(allocator);

        // Determine update status
        const status = determineStatus(installed, registry_info.latest);
        if (status == .up_to_date) continue;

        const location: []const u8 = switch (dep.dep_type) {
            .normal => "dependencies",
            .dev => "devDependencies",
            .peer => "peerDependencies",
        };

        try outdated.append(.{
            .name = try allocator.dupe(u8, dep.name),
            .current = try allocator.dupe(u8, installed),
            .wanted = try allocator.dupe(u8, registry_info.wanted),
            .latest = try allocator.dupe(u8, registry_info.latest),
            .status = status,
            .location = try allocator.dupe(u8, location),
        });
    }

    // Display results
    if (outdated.items.len == 0) {
        style.print("{s}✓{s} All packages are up to date!\n", .{ style.green, style.reset });
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

    // Separator
    var i: usize = 0;
    while (i < 95) : (i += 1) {
        style.print("-", .{});
    }
    style.print("\n", .{});

    // Print outdated packages
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

/// Read the installed version of a package from node_modules/<name>/package.json
fn getInstalledVersion(allocator: std.mem.Allocator, project_root: []const u8, name: []const u8) ?[]const u8 {
    const pkg_json_path = std.fmt.allocPrint(allocator, "{s}/node_modules/{s}/package.json", .{ project_root, name }) catch return null;
    defer allocator.free(pkg_json_path);

    const content = io_helper.readFileAlloc(allocator, pkg_json_path, 2 * 1024 * 1024) catch return null;
    defer allocator.free(content);

    const parsed = std.json.parseFromSlice(std.json.Value, allocator, content, .{}) catch return null;
    defer parsed.deinit();

    if (parsed.value != .object) return null;

    const version_val = parsed.value.object.get("version") orelse return null;
    if (version_val != .string) return null;

    return allocator.dupe(u8, version_val.string) catch null;
}

/// Query the npm registry for the latest version of a package.
/// Returns { latest: dist-tags.latest, wanted: max version satisfying constraint }.
fn queryRegistryVersions(allocator: std.mem.Allocator, name: []const u8, constraint: []const u8) ?RegistryVersionInfo {
    const url = std.fmt.allocPrint(allocator, "https://registry.npmjs.org/{s}", .{name}) catch return null;
    defer allocator.free(url);

    const body = io_helper.httpGet(allocator, url) catch return null;
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

    // Get "wanted" version: the highest version that satisfies the constraint.
    // If no versions object, or constraint is *, just use latest.
    const wanted = blk: {
        // Skip complex resolution for simple constraints
        if (constraint.len == 0 or std.mem.eql(u8, constraint, "*") or std.mem.eql(u8, constraint, "latest")) {
            break :blk latest;
        }

        const versions_obj = parsed.value.object.get("versions") orelse break :blk latest;
        if (versions_obj != .object) break :blk latest;

        // Iterate versions and find the highest that satisfies
        var best: ?[]const u8 = null;
        var ver_iter = versions_obj.object.iterator();
        while (ver_iter.next()) |entry| {
            const ver = entry.key_ptr.*;
            if (satisfiesConstraint(ver, constraint)) {
                if (best == null or compareVersions(ver, best.?) == .gt) {
                    best = ver;
                }
            }
        }

        break :blk best orelse latest;
    };

    return RegistryVersionInfo{
        .latest = allocator.dupe(u8, latest) catch return null,
        .wanted = allocator.dupe(u8, wanted) catch return null,
    };
}

/// Check if a version satisfies a semver constraint string (supports ^, ~, >=, >, <=, <, exact, *)
fn satisfiesConstraint(version: []const u8, constraint: []const u8) bool {
    const npm = @import("../../registry/npm.zig");
    const SemverConstraint = npm.SemverConstraint;

    // Handle OR groups (||)
    var or_iter = std.mem.splitSequence(u8, constraint, "||");
    while (or_iter.next()) |or_segment| {
        const trimmed = std.mem.trim(u8, or_segment, " \t");
        if (trimmed.len == 0) continue;

        // Check AND group (space-separated constraints)
        var all_match = true;
        var space_iter = std.mem.tokenizeScalar(u8, trimmed, ' ');
        while (space_iter.next()) |token| {
            const t = std.mem.trim(u8, token, " \t");
            if (t.len == 0) continue;
            const sc = SemverConstraint.parse(t) orelse {
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
fn compareVersions(a: []const u8, b: []const u8) std.math.Order {
    var a_iter = std.mem.splitScalar(u8, a, '.');
    var b_iter = std.mem.splitScalar(u8, b, '.');

    // Compare up to 3 parts (major.minor.patch)
    var i: usize = 0;
    while (i < 3) : (i += 1) {
        const a_part = a_iter.next();
        const b_part = b_iter.next();

        if (a_part == null and b_part == null) return .eq;
        if (a_part == null) return .lt;
        if (b_part == null) return .gt;

        // Strip pre-release suffix (e.g., "0-beta.1" → "0")
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
    if (std.mem.eql(u8, current, latest)) {
        return .up_to_date;
    }

    var current_parts = std.mem.splitScalar(u8, current, '.');
    var latest_parts = std.mem.splitScalar(u8, latest, '.');

    const current_major = std.fmt.parseInt(u32, current_parts.next() orelse "0", 10) catch 0;
    const latest_major = std.fmt.parseInt(u32, latest_parts.next() orelse "0", 10) catch 0;

    if (latest_major > current_major) {
        return .major_update;
    } else {
        return .minor_update;
    }
}
