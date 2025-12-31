//! Workspace Dependency Ordering
//!
//! Analyzes dependencies between workspace members and provides
//! topological ordering for script execution and builds.

const std = @import("std");
const types = @import("types.zig");
const resolver = @import("../deps/resolver.zig");

/// Result of workspace dependency analysis
pub const WorkspaceOrderResult = struct {
    /// Ordered workspace members (ready to process in order)
    order: []types.WorkspaceMember,
    /// Groups of members that can be processed in parallel
    parallel_groups: [][]types.WorkspaceMember,
    allocator: std.mem.Allocator,

    pub fn deinit(self: *WorkspaceOrderResult) void {
        // Note: WorkspaceMember data is owned by WorkspaceConfig, don't free
        self.allocator.free(self.order);

        for (self.parallel_groups) |group| {
            self.allocator.free(group);
        }
        self.allocator.free(self.parallel_groups);
    }
};

/// Extract workspace dependencies from member
/// Looks for dependencies on other workspace members in pantry.json/package.json
fn extractWorkspaceDependencies(
    allocator: std.mem.Allocator,
    member: types.WorkspaceMember,
    all_members: []const types.WorkspaceMember,
) ![][]const u8 {
    var deps = std.ArrayList([]const u8){};
    errdefer {
        for (deps.items) |dep| {
            allocator.free(dep);
        }
        deps.deinit(allocator);
    }

    // Try to read package.json or pantry.json from the member
    const config_files = [_][]const u8{ "package.json", "pantry.json", "pantry.jsonc" };

    for (config_files) |config_file| {
        const config_path = try std.fs.path.join(allocator, &[_][]const u8{ member.abs_path, config_file });
        defer allocator.free(config_path);

        const content = std.Io.Dir.cwd().readFileAlloc(config_path, allocator, std.Io.Limit.limited(10 * 1024 * 1024)) catch continue;
        defer allocator.free(content);

        // Parse JSON to find dependencies
        const parsed = std.json.parseFromSlice(std.json.Value, allocator, content, .{}) catch continue;
        defer parsed.deinit();

        const root = parsed.value;
        if (root != .object) continue;

        // Check dependencies, devDependencies, and peerDependencies
        const dep_fields = [_][]const u8{ "dependencies", "devDependencies", "peerDependencies" };

        for (dep_fields) |field| {
            const deps_obj = root.object.get(field) orelse continue;
            if (deps_obj != .object) continue;

            // Check each dependency
            var iter = deps_obj.object.iterator();
            while (iter.next()) |entry| {
                const dep_name = entry.key_ptr.*;

                // Check if this dependency is a workspace member
                for (all_members) |other_member| {
                    // Match by package name
                    if (std.mem.eql(u8, dep_name, other_member.name)) {
                        try deps.append(allocator, try allocator.dupe(u8, other_member.name));
                        break;
                    }
                }
            }
        }

        // Found a config file, stop looking
        break;
    }

    return try deps.toOwnedSlice(allocator);
}

/// Order workspace members by dependencies
/// Returns members in the order they should be processed
pub fn orderWorkspaceMembers(
    allocator: std.mem.Allocator,
    members: []const types.WorkspaceMember,
) !WorkspaceOrderResult {
    if (members.len == 0) {
        return WorkspaceOrderResult{
            .order = try allocator.alloc(types.WorkspaceMember, 0),
            .parallel_groups = try allocator.alloc([]types.WorkspaceMember, 0),
            .allocator = allocator,
        };
    }

    // Build dependency list for resolver
    var resolver_deps = std.ArrayList(resolver.Dependency){};
    defer {
        for (resolver_deps.items) |*dep| {
            allocator.free(dep.name);
            allocator.free(dep.version);
            for (dep.dependencies) |d| {
                allocator.free(d);
            }
            allocator.free(dep.dependencies);
        }
        resolver_deps.deinit(allocator);
    }

    // Extract dependencies for each member
    for (members) |member| {
        const workspace_deps = try extractWorkspaceDependencies(allocator, member, members);

        try resolver_deps.append(allocator, .{
            .name = try allocator.dupe(u8, member.name),
            .version = try allocator.dupe(u8, "workspace"),
            .dependencies = workspace_deps,
        });
    }

    // Perform topological sort
    var sort_result = try resolver.topologicalSort(allocator, resolver_deps.items);
    defer sort_result.deinit();

    // Build ordered member list
    var ordered = try allocator.alloc(types.WorkspaceMember, members.len);
    errdefer allocator.free(ordered);

    for (sort_result.order, 0..) |sorted_name, i| {
        // Find matching member
        for (members) |member| {
            if (std.mem.eql(u8, member.name, sorted_name)) {
                ordered[i] = member;
                break;
            }
        }
    }

    // Build parallel groups based on dependency levels
    const parallel_groups = try buildParallelGroups(allocator, members, resolver_deps.items);

    return WorkspaceOrderResult{
        .order = ordered,
        .parallel_groups = parallel_groups,
        .allocator = allocator,
    };
}

/// Build parallel execution groups
/// Members in the same group have no dependencies on each other
fn buildParallelGroups(
    allocator: std.mem.Allocator,
    members: []const types.WorkspaceMember,
    deps: []const resolver.Dependency,
) ![][]types.WorkspaceMember {
    // Calculate dependency level for each member
    var levels = std.StringHashMap(usize).init(allocator);
    defer levels.deinit();

    // Initialize all to level 0
    for (members) |member| {
        try levels.put(member.name, 0);
    }

    // Calculate levels using BFS-like approach
    var changed = true;
    while (changed) {
        changed = false;

        for (deps) |dep| {
            const current_level = levels.get(dep.name) orelse 0;

            // Find max level of dependencies
            var max_dep_level: usize = 0;
            for (dep.dependencies) |dep_name| {
                const dep_level = levels.get(dep_name) orelse 0;
                max_dep_level = @max(max_dep_level, dep_level + 1);
            }

            if (max_dep_level > current_level) {
                try levels.put(dep.name, max_dep_level);
                changed = true;
            }
        }
    }

    // Find max level
    var max_level: usize = 0;
    var level_iter = levels.valueIterator();
    while (level_iter.next()) |level| {
        max_level = @max(max_level, level.*);
    }

    // Create groups
    var groups = try allocator.alloc(std.ArrayList(types.WorkspaceMember), max_level + 1);
    defer {
        for (groups) |*group| {
            group.deinit(allocator);
        }
        allocator.free(groups);
    }

    for (groups) |*group| {
        group.* = std.ArrayList(types.WorkspaceMember){};
    }

    // Assign members to groups
    for (members) |member| {
        const level = levels.get(member.name) orelse 0;
        try groups[level].append(allocator, member);
    }

    // Convert to owned slices
    var result = try allocator.alloc([]types.WorkspaceMember, max_level + 1);
    for (groups, 0..) |*group, i| {
        result[i] = try group.toOwnedSlice(allocator);
    }

    return result;
}

// ============================================================================
// Tests
// ============================================================================

test "extractWorkspaceDependencies - no deps" {
    const allocator = std.testing.allocator;

    const member = types.WorkspaceMember{
        .name = "foo",
        .path = "./packages/foo",
        .abs_path = "/nonexistent",
        .config_path = null,
        .deps_file_path = null,
    };

    const members = [_]types.WorkspaceMember{member};
    const deps = try extractWorkspaceDependencies(allocator, member, &members);
    defer {
        for (deps) |d| allocator.free(d);
        allocator.free(deps);
    }

    try std.testing.expect(deps.len == 0);
}

test "orderWorkspaceMembers - empty" {
    const allocator = std.testing.allocator;

    const members = [_]types.WorkspaceMember{};
    var result = try orderWorkspaceMembers(allocator, &members);
    defer result.deinit();

    try std.testing.expect(result.order.len == 0);
    try std.testing.expect(result.parallel_groups.len == 0);
}

test "orderWorkspaceMembers - single member" {
    const allocator = std.testing.allocator;

    const member = types.WorkspaceMember{
        .name = "foo",
        .path = "./packages/foo",
        .abs_path = "/nonexistent",
        .config_path = null,
        .deps_file_path = null,
    };

    const members = [_]types.WorkspaceMember{member};
    var result = try orderWorkspaceMembers(allocator, &members);
    defer result.deinit();

    try std.testing.expect(result.order.len == 1);
    try std.testing.expectEqualStrings("foo", result.order[0].name);
}

test "buildParallelGroups - independent members" {
    const allocator = std.testing.allocator;

    const member_a = types.WorkspaceMember{
        .name = "a",
        .path = "./a",
        .abs_path = "/a",
        .config_path = null,
        .deps_file_path = null,
    };

    const member_b = types.WorkspaceMember{
        .name = "b",
        .path = "./b",
        .abs_path = "/b",
        .config_path = null,
        .deps_file_path = null,
    };

    const members = [_]types.WorkspaceMember{ member_a, member_b };

    const deps = [_]resolver.Dependency{
        .{ .name = "a", .version = "1.0.0", .dependencies = &[_][]const u8{} },
        .{ .name = "b", .version = "1.0.0", .dependencies = &[_][]const u8{} },
    };

    const groups = try buildParallelGroups(allocator, &members, &deps);
    defer {
        for (groups) |group| {
            allocator.free(group);
        }
        allocator.free(groups);
    }

    // Both members should be in same group (level 0) since they're independent
    try std.testing.expect(groups.len >= 1);
    try std.testing.expect(groups[0].len == 2);
}

test "buildParallelGroups - dependent members" {
    const allocator = std.testing.allocator;

    const member_a = types.WorkspaceMember{
        .name = "a",
        .path = "./a",
        .abs_path = "/a",
        .config_path = null,
        .deps_file_path = null,
    };

    const member_b = types.WorkspaceMember{
        .name = "b",
        .path = "./b",
        .abs_path = "/b",
        .config_path = null,
        .deps_file_path = null,
    };

    const members = [_]types.WorkspaceMember{ member_a, member_b };

    const deps_b = [_][]const u8{"a"};
    const deps = [_]resolver.Dependency{
        .{ .name = "a", .version = "1.0.0", .dependencies = &[_][]const u8{} },
        .{ .name = "b", .version = "1.0.0", .dependencies = &deps_b },
    };

    const groups = try buildParallelGroups(allocator, &members, &deps);
    defer {
        for (groups) |group| {
            allocator.free(group);
        }
        allocator.free(groups);
    }

    // Should have 2 groups: a in first, b in second
    try std.testing.expect(groups.len == 2);
    try std.testing.expect(groups[0].len == 1);
    try std.testing.expect(groups[1].len == 1);
    try std.testing.expectEqualStrings("a", groups[0][0].name);
    try std.testing.expectEqualStrings("b", groups[1][0].name);
}
