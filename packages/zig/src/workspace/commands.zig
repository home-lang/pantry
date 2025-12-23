const std = @import("std");
const core = @import("core.zig");

const Workspace = core.Workspace;
const WorkspaceConfig = core.WorkspaceConfig;
const WorkspacePackage = core.WorkspacePackage;

/// Read entire file contents (Zig 0.16 compatible)
fn readFileAlloc(allocator: std.mem.Allocator, file: std.fs.File, max_size: usize) ![]u8 {
    const file_size = try file.getEndPos();
    if (file_size > max_size) return error.FileTooBig;
    const buffer = try allocator.alloc(u8, @intCast(file_size));
    errdefer allocator.free(buffer);
    const bytes_read = try file.preadAll(buffer, 0);
    if (bytes_read != buffer.len) return error.UnexpectedEndOfFile;
    return buffer;
}

/// Workspace command result
pub const CommandResult = struct {
    success: bool,
    message: []const u8,
    packages_affected: usize = 0,

    pub fn deinit(self: *CommandResult, allocator: std.mem.Allocator) void {
        allocator.free(self.message);
    }
};

/// Initialize a new workspace
pub fn init(allocator: std.mem.Allocator, root: []const u8, name: ?[]const u8) !CommandResult {
    // Create workspace directory
    try std.fs.cwd().makePath(root);

    // Create workspace config
    const config_path = try std.fmt.allocPrint(allocator, "{s}/pantry.json", .{root});
    defer allocator.free(config_path);

    const workspace_name = name orelse "my-workspace";

    const config_content = try std.fmt.allocPrint(
        allocator,
        \\{{
        \\  "name": "{s}",
        \\  "version": "0.0.0",
        \\  "workspace": {{
        \\    "packages": [
        \\      "packages/*"
        \\    ],
        \\    "sharedDeps": true,
        \\    "hoist": true
        \\  }}
        \\}}
        \\
    ,
        .{workspace_name},
    );
    defer allocator.free(config_content);

    const file = try std.fs.cwd().createFile(config_path, .{});
    defer file.close();
    try file.writeAll(config_content);

    // Create packages directory
    const packages_dir = try std.fmt.allocPrint(allocator, "{s}/packages", .{root});
    defer allocator.free(packages_dir);
    try std.fs.cwd().makePath(packages_dir);

    const message = try std.fmt.allocPrint(
        allocator,
        "Initialized workspace '{s}' at {s}",
        .{ workspace_name, root },
    );

    return .{
        .success = true,
        .message = message,
    };
}

/// List all packages in workspace
pub fn list(allocator: std.mem.Allocator, workspace: *Workspace) !CommandResult {
    var output = try std.ArrayList(u8).initCapacity(allocator, 512);
    defer output.deinit(allocator);

    try output.print(allocator, "Workspace: {s}\n", .{workspace.config.name orelse "unnamed"});
    try output.print(allocator, "Packages ({d}):\n\n", .{workspace.packages.items.len});

    for (workspace.packages.items) |pkg| {
        try output.print(allocator, "  {s}@{s}\n", .{ pkg.name, pkg.version });
        try output.print(allocator, "    Path: {s}\n", .{pkg.path});

        if (pkg.dependencies.count() > 0) {
            try output.print(allocator, "    Dependencies: {d}\n", .{pkg.dependencies.count()});
        }

        if (pkg.private) {
            try output.print(allocator, "    [PRIVATE]\n", .{});
        }

        try output.print(allocator, "\n", .{});
    }

    return .{
        .success = true,
        .message = try output.toOwnedSlice(allocator),
        .packages_affected = workspace.packages.items.len,
    };
}

/// Run a script across all packages
pub fn runScript(
    allocator: std.mem.Allocator,
    workspace: *Workspace,
    script_name: []const u8,
    parallel: bool,
) !CommandResult {
    const build_order = try workspace.getBuildOrder();
    defer {
        for (build_order) |pkg_name| {
            allocator.free(pkg_name);
        }
        allocator.free(build_order);
    }

    var succeeded: usize = 0;
    var failed: usize = 0;

    if (parallel) {
        // Run in parallel (simplified - real impl would use thread pool)
        for (build_order) |pkg_name| {
            if (workspace.getPackage(pkg_name)) |pkg| {
                const result = runPackageScript(allocator, workspace, pkg, script_name) catch {
                    failed += 1;
                    continue;
                };
                if (result) succeeded += 1 else failed += 1;
            }
        }
    } else {
        // Run sequentially in build order
        for (build_order) |pkg_name| {
            if (workspace.getPackage(pkg_name)) |pkg| {
                const result = runPackageScript(allocator, workspace, pkg, script_name) catch {
                    failed += 1;
                    continue;
                };
                if (result) succeeded += 1 else failed += 1;
            }
        }
    }

    const message = try std.fmt.allocPrint(
        allocator,
        "Ran '{s}' script: {d} succeeded, {d} failed",
        .{ script_name, succeeded, failed },
    );

    return .{
        .success = failed == 0,
        .message = message,
        .packages_affected = succeeded + failed,
    };
}

fn runPackageScript(
    allocator: std.mem.Allocator,
    workspace: *Workspace,
    pkg: *WorkspacePackage,
    script_name: []const u8,
) !bool {
    const pkg_path = try std.fmt.allocPrint(
        allocator,
        "{s}/{s}",
        .{ workspace.config.root, pkg.path },
    );
    defer allocator.free(pkg_path);

    // Read package config to get scripts
    const config_path = try std.fmt.allocPrint(allocator, "{s}/pantry.json", .{pkg_path});
    defer allocator.free(config_path);

    const file = std.fs.cwd().openFile(config_path, .{}) catch return false;
    defer file.close();

    const content = try readFileAlloc(allocator, file, 10 * 1024 * 1024);
    defer allocator.free(content);

    const parsed = try std.json.parseFromSlice(std.json.Value, allocator, content, .{});
    defer parsed.deinit();

    if (parsed.value != .object) return false;
    const scripts = parsed.value.object.get("scripts") orelse return false;

    if (scripts != .object) return false;
    const script = scripts.object.get(script_name) orelse return false;

    if (script != .string) return false;

    // Execute script
    std.debug.print("Running '{s}' in {s}...\n", .{ script_name, pkg.name });

    var child = std.process.Child.init(&[_][]const u8{ "sh", "-c", script.string }, allocator);
    child.cwd = pkg_path;
    child.stdout_behavior = .Inherit;
    child.stderr_behavior = .Inherit;

    const term = try child.spawnAndWait();

    return switch (term) {
        .Exited => |code| code == 0,
        else => false,
    };
}

/// Link all workspace packages
pub fn linkAll(allocator: std.mem.Allocator, workspace: *Workspace) !CommandResult {
    try workspace.link();

    const message = try std.fmt.allocPrint(
        allocator,
        "Linked {d} workspace packages",
        .{workspace.packages.items.len},
    );

    return .{
        .success = true,
        .message = message,
        .packages_affected = workspace.packages.items.len,
    };
}

/// Check workspace for issues
pub fn check(allocator: std.mem.Allocator, workspace: *Workspace) !CommandResult {
    var issues = try std.ArrayList(u8).initCapacity(allocator, 256);
    defer issues.deinit(allocator);

    var has_issues = false;

    // Check for circular dependencies
    if (workspace.hasCircularDependencies()) {
        has_issues = true;
        try issues.print(allocator, "❌ Circular dependencies detected\n", .{});
    }

    // Check for missing dependencies
    for (workspace.packages.items) |pkg| {
        var dep_it = pkg.dependencies.keyIterator();
        while (dep_it.next()) |dep_name| {
            // Check if it's a workspace package that doesn't exist
            const is_workspace_dep = for (workspace.packages.items) |p| {
                if (std.mem.eql(u8, p.name, dep_name.*)) break true;
            } else false;

            if (!is_workspace_dep) {
                // External dependency - could check if it's installed
                continue;
            }
        }
    }

    // Check for duplicate package names
    var name_map = std.StringHashMap(usize).init(allocator);
    defer name_map.deinit();

    for (workspace.packages.items) |pkg| {
        const result = try name_map.getOrPut(pkg.name);
        if (result.found_existing) {
            has_issues = true;
            try issues.print(allocator, "❌ Duplicate package name: {s}\n", .{pkg.name});
        } else {
            result.value_ptr.* = 1;
        }
    }

    if (!has_issues) {
        try issues.print(allocator, "✅ No issues found\n", .{});
    }

    return .{
        .success = !has_issues,
        .message = try issues.toOwnedSlice(allocator),
        .packages_affected = workspace.packages.items.len,
    };
}

/// Show workspace dependency graph
pub fn graph(allocator: std.mem.Allocator, workspace: *Workspace) !CommandResult {
    var output = try std.ArrayList(u8).initCapacity(allocator, 512);
    defer output.deinit(allocator);

    try output.print(allocator, "Workspace Dependency Graph:\n\n", .{});

    for (workspace.packages.items) |pkg| {
        try output.print(allocator, "{s}@{s}\n", .{ pkg.name, pkg.version });

        if (pkg.dependencies.count() > 0) {
            var dep_it = pkg.dependencies.iterator();
            while (dep_it.next()) |entry| {
                const dep_name = entry.key_ptr.*;
                const is_workspace = workspace.getPackage(dep_name) != null;

                if (is_workspace) {
                    try output.print(allocator, "  ├─ {s} [workspace]\n", .{dep_name});
                } else {
                    try output.print(allocator, "  ├─ {s} [external]\n", .{dep_name});
                }
            }
        } else {
            try output.print(allocator, "  (no dependencies)\n", .{});
        }

        try output.print(allocator, "\n", .{});
    }

    // Show build order
    const build_order = try workspace.getBuildOrder();
    defer {
        for (build_order) |name| {
            allocator.free(name);
        }
        allocator.free(build_order);
    }

    try output.print(allocator, "Build Order:\n", .{});
    for (build_order, 0..) |pkg_name, i| {
        try output.print(allocator, "  {d}. {s}\n", .{ i + 1, pkg_name });
    }

    return .{
        .success = true,
        .message = try output.toOwnedSlice(allocator),
        .packages_affected = workspace.packages.items.len,
    };
}

/// Execute command in specific package
pub fn exec(
    allocator: std.mem.Allocator,
    workspace: *Workspace,
    package_name: []const u8,
    command: []const []const u8,
) !CommandResult {
    const pkg = workspace.getPackage(package_name) orelse {
        const message = try std.fmt.allocPrint(
            allocator,
            "Package '{s}' not found in workspace",
            .{package_name},
        );
        return .{
            .success = false,
            .message = message,
        };
    };

    const pkg_path = try std.fmt.allocPrint(
        allocator,
        "{s}/{s}",
        .{ workspace.config.root, pkg.path },
    );
    defer allocator.free(pkg_path);

    var child = std.process.Child.init(command, allocator);
    child.cwd = pkg_path;
    child.stdout_behavior = .Inherit;
    child.stderr_behavior = .Inherit;

    const term = try child.spawnAndWait();

    const success = switch (term) {
        .Exited => |code| code == 0,
        else => false,
    };

    const message = if (success)
        try std.fmt.allocPrint(allocator, "Command executed successfully in {s}", .{package_name})
    else
        try std.fmt.allocPrint(allocator, "Command failed in {s}", .{package_name});

    return .{
        .success = success,
        .message = message,
        .packages_affected = 1,
    };
}
