const std = @import("std");
const common = @import("common.zig");
const lib = @import("../../lib.zig");
const style = @import("../style.zig");

const CommandResult = common.CommandResult;
const DependencyInfo = common.DependencyInfo;

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

    pub fn reset() []const u8 {
        return style.reset;
    }
};

/// Outdated package information
pub const OutdatedPackage = struct {
    name: []const u8,
    current: []const u8,
    wanted: []const u8,
    latest: []const u8,
    status: VersionStatus,
    location: []const u8, // "dependencies" or "devDependencies"

    pub fn deinit(self: *OutdatedPackage, allocator: std.mem.Allocator) void {
        allocator.free(self.name);
        allocator.free(self.current);
        allocator.free(self.wanted);
        allocator.free(self.latest);
        allocator.free(self.location);
    }
};

/// Check for outdated packages
pub fn execute(allocator: std.mem.Allocator, args: []const []const u8) !CommandResult {
    _ = args;

    // Load pantry.json
    const config_result = lib.loadpantryConfig(allocator, .{}) catch {
        return CommandResult.err(allocator, common.ERROR_NO_CONFIG);
    };
    defer {
        var mut_result = config_result;
        mut_result.deinit();
    }

    // Extract dependencies
    const deps_map = try lib.extractDependencies(allocator, config_result.value);
    defer {
        var mut_deps = deps_map;
        var it = mut_deps.iterator();
        while (it.next()) |entry| {
            allocator.free(entry.key_ptr.*);
            var dep_info = entry.value_ptr;
            dep_info.deinit(allocator);
        }
        mut_deps.deinit();
    }

    // Check each dependency for updates
    var outdated = std.ArrayList(OutdatedPackage).init(allocator);
    defer {
        for (outdated.items) |*pkg| {
            pkg.deinit(allocator);
        }
        outdated.deinit();
    }

    var dep_iter = deps_map.iterator();
    while (dep_iter.next()) |entry| {
        const pkg_name = entry.key_ptr.*;
        const dep_info = entry.value_ptr;

        // Check for updates (simplified - real implementation would query registry)
        const update_info = try checkForUpdates(allocator, pkg_name, dep_info.version);
        defer {
            if (update_info) |info| {
                var mut_info = info;
                mut_info.deinit(allocator);
            }
        }

        if (update_info) |info| {
            if (info.status != .up_to_date) {
                try outdated.append(info);
            }
        }
    }

    // Display results
    if (outdated.items.len == 0) {
        const stdout = std.io.getStdOut().writer();
        try stdout.print("✓ All packages are up to date!\n", .{});
        return CommandResult.success(allocator, null);
    }

    // Print table header
    const stdout = std.io.getStdOut().writer();
    try stdout.print("\nOutdated Packages:\n\n", .{});
    try stdout.print("{s:<30} {s:<15} {s:<15} {s:<15} {s:<20}\n", .{
        "Package",
        "Current",
        "Wanted",
        "Latest",
        "Location",
    });
    try stdout.print("{s}\n", .{"-" ** 95});

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

    // Print outdated packages
    for (outdated.items) |pkg| {
        const color_code = pkg.status.color();
        const reset_code = VersionStatus.reset();

        try stdout.print("{s}{s:<30}{s} {s:<15} {s:<15} {s:<15} {s:<20}\n", .{
            color_code,
            pkg.name,
            reset_code,
            pkg.current,
            pkg.wanted,
            pkg.latest,
            pkg.location,
        });
    }

    try stdout.print("\n");
    try stdout.print("Legend: ", .{});
    try stdout.print("{s}Red{s} = Major update  ", .{ VersionStatus.major_update.color(), VersionStatus.reset() });
    try stdout.print("{s}Yellow{s} = Minor update\n\n", .{ VersionStatus.minor_update.color(), VersionStatus.reset() });

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

/// Check if a package has updates available
fn checkForUpdates(
    allocator: std.mem.Allocator,
    package_name: []const u8,
    current_version: []const u8,
) !?OutdatedPackage {
    // This is a simplified implementation
    // In a real implementation, this would:
    // 1. Query the registry for the latest version
    // 2. Parse version ranges
    // 3. Determine wanted version based on semver constraints

    // For now, simulate some outdated packages for demonstration
    const SimulatedUpdate = struct {
        name: []const u8,
        current: []const u8,
        wanted: []const u8,
        latest: []const u8,
        status: VersionStatus,
    };

    const known_updates = [_]SimulatedUpdate{
        .{
            .name = "lodash",
            .current = "4.17.15",
            .wanted = "4.17.21",
            .latest = "4.17.21",
            .status = .minor_update,
        },
        .{
            .name = "express",
            .current = "4.17.1",
            .wanted = "4.18.2",
            .latest = "5.0.0",
            .status = .major_update,
        },
        .{
            .name = "react",
            .current = "17.0.2",
            .wanted = "17.0.2",
            .latest = "18.2.0",
            .status = .major_update,
        },
    };

    for (known_updates) |update| {
        if (std.mem.eql(u8, package_name, update.name)) {
            // Check if current version matches
            if (std.mem.eql(u8, current_version, update.current)) {
                return OutdatedPackage{
                    .name = try allocator.dupe(u8, update.name),
                    .current = try allocator.dupe(u8, update.current),
                    .wanted = try allocator.dupe(u8, update.wanted),
                    .latest = try allocator.dupe(u8, update.latest),
                    .status = update.status,
                    .location = try allocator.dupe(u8, "dependencies"),
                };
            }
        }
    }

    // Package is up to date or unknown
    return null;
}

/// Compare semantic versions
fn compareVersions(a: []const u8, b: []const u8) std.math.Order {
    // Simple version comparison (real implementation would parse semver properly)
    const a_parts = std.mem.split(u8, a, ".");
    const b_parts = std.mem.split(u8, b, ".");

    var a_iter = a_parts;
    var b_iter = b_parts;

    while (true) {
        const a_part = a_iter.next();
        const b_part = b_iter.next();

        if (a_part == null and b_part == null) return .eq;
        if (a_part == null) return .lt;
        if (b_part == null) return .gt;

        const a_num = std.fmt.parseInt(u32, a_part.?, 10) catch 0;
        const b_num = std.fmt.parseInt(u32, b_part.?, 10) catch 0;

        if (a_num < b_num) return .lt;
        if (a_num > b_num) return .gt;
    }
}

/// Determine version status based on current and latest
fn determineStatus(current: []const u8, latest: []const u8) VersionStatus {
    if (std.mem.eql(u8, current, latest)) {
        return .up_to_date;
    }

    // Parse versions to determine major vs minor update
    var current_parts = std.mem.split(u8, current, ".");
    var latest_parts = std.mem.split(u8, latest, ".");

    const current_major = std.fmt.parseInt(u32, current_parts.next() orelse "0", 10) catch 0;
    const latest_major = std.fmt.parseInt(u32, latest_parts.next() orelse "0", 10) catch 0;

    if (latest_major > current_major) {
        return .major_update;
    } else {
        return .minor_update;
    }
}
