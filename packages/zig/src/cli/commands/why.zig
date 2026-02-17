//! Dependency path explanation
//!
//! Explain why a package is installed by tracing dependency paths
//! through node_modules package.json files.

const std = @import("std");
const io_helper = @import("../../io_helper.zig");
const common = @import("common.zig");
const style = @import("../style.zig");

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

    // Check if package is a direct dependency
    for (deps) |dep| {
        if (std.mem.eql(u8, dep.name, package_name)) {
            // Get installed version
            const installed = getPackageVersion(allocator, cwd, dep.name) orelse dep.version;
            const free_installed = !std.mem.eql(u8, installed, dep.version);
            defer if (free_installed) allocator.free(installed);

            const dep_type_str: []const u8 = switch (dep.dep_type) {
                .normal => "dependencies",
                .dev => "devDependencies",
                .peer => "peerDependencies",
            };

            style.print("\n{s}📦 {s}@{s}{s}\n\n", .{ style.bold, package_name, installed, style.reset });
            style.print("This package is a {s}direct dependency{s}.\n", .{ style.bold, style.reset });
            style.print("Listed in: {s}\n", .{dep_type_str});
            style.print("Required version: {s}\n\n", .{dep.version});

            return CommandResult.success(allocator, null);
        }
    }

    // Not a direct dependency — search transitive paths through node_modules
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

    // Track visited packages to prevent infinite loops
    var visited = std.StringHashMap(void).init(allocator);
    defer visited.deinit();

    // Search from each direct dependency
    for (deps) |dep| {
        var current_path = std.ArrayList(DependencyPath).init(allocator);

        // Add the direct dep as the first entry
        const dep_version = getPackageVersion(allocator, cwd, dep.name) orelse (allocator.dupe(u8, dep.version) catch continue);

        try current_path.append(.{
            .package = try allocator.dupe(u8, dep.name),
            .version = dep_version,
            .depth = 0,
        });

        visited.clearRetainingCapacity();
        try visited.put(dep.name, {});

        try searchTransitiveDeps(
            allocator,
            cwd,
            dep.name,
            package_name,
            &current_path,
            &paths,
            &visited,
            1,
            5, // max depth
        );

        // If no path was found through this dep, free the current_path
        if (paths.items.len == 0 or paths.items[paths.items.len - 1].items.len == 0) {
            // current_path entries were copied into found paths or need cleanup
        }

        // Clean up current_path if it wasn't added to paths
        var found_in_paths = false;
        for (paths.items) |*p| {
            if (p.items.len > 0 and p.items.ptr == current_path.items.ptr) {
                found_in_paths = true;
                break;
            }
        }
        if (!found_in_paths) {
            for (current_path.items) |*entry| {
                entry.deinit(allocator);
            }
            current_path.deinit();
        }
    }

    if (paths.items.len == 0) {
        // Also check if the package simply exists in node_modules (installed but not tracked)
        const check_path = try std.fmt.allocPrint(allocator, "{s}/node_modules/{s}", .{ cwd, package_name });
        defer allocator.free(check_path);

        io_helper.accessAbsolute(check_path, .{}) catch {
            const message = try std.fmt.allocPrint(
                allocator,
                "Package '{s}' is not installed (directly or transitively)",
                .{package_name},
            );
            return CommandResult{
                .exit_code = 1,
                .message = message,
            };
        };

        // Package exists but we couldn't trace the path
        style.print("\n{s}📦 {s}{s}\n\n", .{ style.bold, package_name, style.reset });
        style.print("This package is installed in node_modules but the dependency chain could not be traced.\n", .{});
        style.print("It may be a transitive dependency installed by your package manager.\n\n", .{});

        return CommandResult.success(allocator, null);
    }

    // Display dependency paths
    style.print("\n{s}📦 {s}{s}\n\n", .{ style.bold, package_name, style.reset });
    style.print("This package is installed because of the following dependency chain{s}:\n\n", .{
        if (paths.items.len > 1) "s" else "",
    });

    for (paths.items, 0..) |path, i| {
        if (i > 0) style.print("\n", .{});

        for (path.items, 0..) |entry, j| {
            // Indent based on depth
            var indent_count: usize = 0;
            while (indent_count < entry.depth * 2) : (indent_count += 1) {
                style.print(" ", .{});
            }

            const arrow: []const u8 = if (j == 0) "→" else "└─";
            style.print("{s} {s}@{s}\n", .{ arrow, entry.package, entry.version });
        }
    }

    style.print("\n", .{});

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

/// Read the version of a package from node_modules/<name>/package.json
fn getPackageVersion(allocator: std.mem.Allocator, project_root: []const u8, name: []const u8) ?[]const u8 {
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

/// Recursively search for the target package in the dependency tree
fn searchTransitiveDeps(
    allocator: std.mem.Allocator,
    project_root: []const u8,
    current_pkg: []const u8,
    target: []const u8,
    current_path: *std.ArrayList(DependencyPath),
    found_paths: *std.ArrayList(std.ArrayList(DependencyPath)),
    visited: *std.StringHashMap(void),
    depth: usize,
    max_depth: usize,
) !void {
    if (depth > max_depth) return;

    // Read node_modules/<current_pkg>/package.json to get its dependencies
    const pkg_json_path = try std.fmt.allocPrint(allocator, "{s}/node_modules/{s}/package.json", .{ project_root, current_pkg });
    defer allocator.free(pkg_json_path);

    const content = io_helper.readFileAlloc(allocator, pkg_json_path, 2 * 1024 * 1024) catch return;
    defer allocator.free(content);

    const parsed = std.json.parseFromSlice(std.json.Value, allocator, content, .{}) catch return;
    defer parsed.deinit();

    if (parsed.value != .object) return;

    // Check "dependencies" field
    const deps_val = parsed.value.object.get("dependencies") orelse return;
    if (deps_val != .object) return;

    var it = deps_val.object.iterator();
    while (it.next()) |entry| {
        const dep_name = entry.key_ptr.*;
        const dep_ver_val = entry.value_ptr.*;
        const dep_ver: []const u8 = if (dep_ver_val == .string) dep_ver_val.string else "*";

        if (std.mem.eql(u8, dep_name, target)) {
            // Found the target! Build a complete path by cloning current_path and appending target.
            var found_path = std.ArrayList(DependencyPath).init(allocator);
            for (current_path.items) |existing_entry| {
                try found_path.append(.{
                    .package = try allocator.dupe(u8, existing_entry.package),
                    .version = try allocator.dupe(u8, existing_entry.version),
                    .depth = existing_entry.depth,
                });
            }

            // Get actual installed version of the target
            const target_ver = getPackageVersion(allocator, project_root, target) orelse (allocator.dupe(u8, dep_ver) catch continue);

            try found_path.append(.{
                .package = try allocator.dupe(u8, target),
                .version = target_ver,
                .depth = depth,
            });

            try found_paths.append(found_path);
            continue;
        }

        // Recurse into this dependency if not visited
        if (visited.contains(dep_name)) continue;
        try visited.put(dep_name, {});

        const child_ver = getPackageVersion(allocator, project_root, dep_name) orelse (allocator.dupe(u8, dep_ver) catch continue);

        try current_path.append(.{
            .package = try allocator.dupe(u8, dep_name),
            .version = child_ver,
            .depth = depth,
        });

        try searchTransitiveDeps(
            allocator,
            project_root,
            dep_name,
            target,
            current_path,
            found_paths,
            visited,
            depth + 1,
            max_depth,
        );

        // Backtrack: remove the entry we just added
        if (current_path.items.len > 0) {
            var removed = current_path.pop();
            removed.deinit(allocator);
        }

        _ = visited.remove(dep_name);
    }
}
