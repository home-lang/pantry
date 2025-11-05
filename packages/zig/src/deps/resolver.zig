const std = @import("std");

/// Represents a package dependency
pub const Dependency = struct {
    name: []const u8,
    version: []const u8,
    dependencies: []const []const u8, // List of dependency names
};

/// Result of topological sort
pub const SortResult = struct {
    /// Sorted package names in install order
    order: [][]const u8,
    allocator: std.mem.Allocator,

    pub fn deinit(self: *SortResult) void {
        for (self.order) |name| {
            self.allocator.free(name);
        }
        self.allocator.free(self.order);
    }
};

/// Topological sort for dependency resolution
/// Returns packages in the order they should be installed
pub fn topologicalSort(
    allocator: std.mem.Allocator,
    packages: []const Dependency,
) !SortResult {
    if (packages.len == 0) {
        return SortResult{
            .order = try allocator.alloc([]const u8, 0),
            .allocator = allocator,
        };
    }

    // Build dependency graph
    var in_degree = std.StringHashMap(usize).init(allocator);
    defer in_degree.deinit();

    var adj_list = std.StringHashMap(std.ArrayList([]const u8)).init(allocator);
    defer {
        var it = adj_list.iterator();
        while (it.next()) |entry| {
            entry.value_ptr.deinit(allocator);
        }
        adj_list.deinit();
    }

    // Initialize in-degree and adjacency list
    for (packages) |pkg| {
        try in_degree.put(pkg.name, 0);
        const list = std.ArrayList([]const u8){};
        try adj_list.put(pkg.name, list);
    }

    // Build graph edges and count in-degrees
    for (packages) |pkg| {
        for (pkg.dependencies) |dep| {
            // Add edge from dependency to package
            if (adj_list.getPtr(dep)) |list| {
                try list.append(allocator, pkg.name);
            }

            // Increment in-degree of package
            if (in_degree.getPtr(pkg.name)) |degree| {
                degree.* += 1;
            }
        }
    }

    // Find all nodes with in-degree 0 (no dependencies)
    var queue = std.ArrayList([]const u8){};
    defer queue.deinit(allocator);

    var it = in_degree.iterator();
    while (it.next()) |entry| {
        if (entry.value_ptr.* == 0) {
            try queue.append(allocator, entry.key_ptr.*);
        }
    }

    // Process queue
    var result = std.ArrayList([]const u8){};
    errdefer {
        for (result.items) |name| {
            allocator.free(name);
        }
        result.deinit(allocator);
    }

    while (queue.items.len > 0) {
        const node = queue.orderedRemove(0);
        try result.append(allocator, try allocator.dupe(u8, node));

        // Reduce in-degree of neighbors
        if (adj_list.get(node)) |neighbors| {
            for (neighbors.items) |neighbor| {
                if (in_degree.getPtr(neighbor)) |degree| {
                    degree.* -= 1;
                    if (degree.* == 0) {
                        try queue.append(allocator, neighbor);
                    }
                }
            }
        }
    }

    // Check for circular dependencies
    if (result.items.len != packages.len) {
        return error.CircularDependency;
    }

    return SortResult{
        .order = try result.toOwnedSlice(allocator),
        .allocator = allocator,
    };
}

test "topologicalSort basic" {
    const allocator = std.testing.allocator;

    // Create test packages: A -> B -> C
    const deps_b = [_][]const u8{"A"};
    const deps_c = [_][]const u8{"B"};

    const packages = [_]Dependency{
        .{ .name = "A", .version = "1.0.0", .dependencies = &[_][]const u8{} },
        .{ .name = "B", .version = "1.0.0", .dependencies = &deps_b },
        .{ .name = "C", .version = "1.0.0", .dependencies = &deps_c },
    };

    var result = try topologicalSort(allocator, &packages);
    defer result.deinit();

    try std.testing.expect(result.order.len == 3);

    // A should be installed before B, B before C
    var a_idx: usize = 0;
    var b_idx: usize = 0;
    var c_idx: usize = 0;

    for (result.order, 0..) |name, i| {
        if (std.mem.eql(u8, name, "A")) a_idx = i;
        if (std.mem.eql(u8, name, "B")) b_idx = i;
        if (std.mem.eql(u8, name, "C")) c_idx = i;
    }

    try std.testing.expect(a_idx < b_idx);
    try std.testing.expect(b_idx < c_idx);
}

test "topologicalSort circular dependency" {
    const allocator = std.testing.allocator;

    // Create circular dependency: A -> B -> A
    const deps_a = [_][]const u8{"B"};
    const deps_b = [_][]const u8{"A"};

    const packages = [_]Dependency{
        .{ .name = "A", .version = "1.0.0", .dependencies = &deps_a },
        .{ .name = "B", .version = "1.0.0", .dependencies = &deps_b },
    };

    const result = topologicalSort(allocator, &packages);
    try std.testing.expectError(error.CircularDependency, result);
}

test "topologicalSort empty" {
    const allocator = std.testing.allocator;

    const packages = [_]Dependency{};

    var result = try topologicalSort(allocator, &packages);
    defer result.deinit();

    try std.testing.expect(result.order.len == 0);
}

test "topologicalSort diamond dependency" {
    const allocator = std.testing.allocator;

    // Diamond: A <- B, A <- C, B <- D, C <- D
    const deps_b = [_][]const u8{"A"};
    const deps_c = [_][]const u8{"A"};
    const deps_d_arr = [_][]const u8{ "B", "C" };

    const packages = [_]Dependency{
        .{ .name = "A", .version = "1.0.0", .dependencies = &[_][]const u8{} },
        .{ .name = "B", .version = "1.0.0", .dependencies = &deps_b },
        .{ .name = "C", .version = "1.0.0", .dependencies = &deps_c },
        .{ .name = "D", .version = "1.0.0", .dependencies = &deps_d_arr },
    };

    var result = try topologicalSort(allocator, &packages);
    defer result.deinit();

    try std.testing.expect(result.order.len == 4);

    // A should be first, D should be last
    try std.testing.expectEqualStrings("A", result.order[0]);
    try std.testing.expectEqualStrings("D", result.order[3]);
}
