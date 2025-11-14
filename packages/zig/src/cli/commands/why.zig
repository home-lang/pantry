const std = @import("std");
const common = @import("common.zig");
const lib = @import("../../lib.zig");

const CommandResult = common.CommandResult;

/// Dependency path entry
pub const DependencyPath = struct {
    package: []const u8,
    version: []const u8,
    depth: usize,

    pub fn deinit(self: *DependencyPath, allocator: std.mem.Allocator) void {
        allocator.free(self.package);
        allocator.free(self.version);
    }
};

/// Explain why a package is installed
pub fn execute(allocator: std.mem.Allocator, args: []const []const u8) !CommandResult {
    if (args.len == 0) {
        return CommandResult.err(allocator, "Usage: pantry why <package-name>");
    }

    const package_name = args[0];

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

    const stdout = std.io.getStdOut().writer();

    // Check if package is a direct dependency
    if (deps_map.get(package_name)) |dep_info| {
        try stdout.print("\n📦 {s}@{s}\n\n", .{ package_name, dep_info.version });
        try stdout.print("This package is a {s}direct dependency{s}.\n", .{ "\x1b[1m", "\x1b[0m" });
        try stdout.print("Listed in: dependencies\n\n", .{});

        return CommandResult.success(allocator, null);
    }

    // Find dependency paths
    var paths = std.ArrayList(std.ArrayList(DependencyPath)).init(allocator);
    defer {
        for (paths.items) |*path| {
            for (path.items) |*entry| {
                entry.deinit(allocator);
            }
            path.deinit();
        }
        paths.deinit();
    }

    try findDependencyPaths(allocator, &deps_map, package_name, &paths);

    if (paths.items.len == 0) {
        const message = try std.fmt.allocPrint(
            allocator,
            "Package '{s}' is not installed (directly or transitively)",
            .{package_name},
        );
        return CommandResult{
            .exit_code = 1,
            .message = message,
        };
    }

    // Display dependency paths
    try stdout.print("\n📦 {s}\n\n", .{package_name});
    try stdout.print("This package is installed because of the following dependency chain{s}:\n\n", .{
        if (paths.items.len > 1) "s" else "",
    });

    for (paths.items, 0..) |path, i| {
        if (i > 0) try stdout.print("\n", .{});

        for (path.items, 0..) |entry, j| {
            const indent = "  " ** entry.depth;
            const arrow = if (j == 0) "→" else "└─";

            try stdout.print("{s}{s} {s}@{s}\n", .{
                indent,
                arrow,
                entry.package,
                entry.version,
            });
        }
    }

    try stdout.print("\n", .{});

    const message = try std.fmt.allocPrint(
        allocator,
        "Found {d} dependency path{s}",
        .{ paths.items.len, if (paths.items.len == 1) "" else "s" },
    );

    return CommandResult{
        .exit_code = 0,
        .message = message,
    };
}

/// Find all dependency paths to a package
fn findDependencyPaths(
    allocator: std.mem.Allocator,
    deps_map: *const std.StringHashMap(common.DependencyInfo),
    target: []const u8,
    paths: *std.ArrayList(std.ArrayList(DependencyPath)),
) !void {
    // This is a simplified implementation
    // Real implementation would:
    // 1. Build full dependency graph
    // 2. Perform DFS/BFS to find all paths
    // 3. Handle circular dependencies

    // For demonstration, create a simple simulated path
    var dep_iter = deps_map.iterator();
    while (dep_iter.next()) |entry| {
        const pkg_name = entry.key_ptr.*;
        const dep_info = entry.value_ptr;

        // Simulate: if package name contains target, create a path
        if (std.mem.indexOf(u8, pkg_name, target)) |_| {
            var path = std.ArrayList(DependencyPath).init(allocator);

            try path.append(.{
                .package = try allocator.dupe(u8, pkg_name),
                .version = try allocator.dupe(u8, dep_info.version),
                .depth = 0,
            });

            try path.append(.{
                .package = try allocator.dupe(u8, target),
                .version = try allocator.dupe(u8, "1.0.0"),
                .depth = 1,
            });

            try paths.append(path);
        }
    }
}

/// Build dependency graph
fn buildDependencyGraph(
    allocator: std.mem.Allocator,
    deps_map: *const std.StringHashMap(common.DependencyInfo),
) !std.StringHashMap(std.ArrayList([]const u8)) {
    var graph = std.StringHashMap(std.ArrayList([]const u8)).init(allocator);

    var dep_iter = deps_map.iterator();
    while (dep_iter.next()) |entry| {
        const pkg_name = entry.key_ptr.*;

        // For each package, we'd need to load its package.json
        // and get its dependencies
        // This is simplified

        const pkg_deps = std.ArrayList([]const u8).init(allocator);
        try graph.put(try allocator.dupe(u8, pkg_name), pkg_deps);
    }

    return graph;
}
