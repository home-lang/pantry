const std = @import("std");
const registry = @import("registry.zig");
const resolver = @import("../deps/resolver.zig");

/// Dependency graph for package resolution
pub const DependencyGraph = struct {
    allocator: std.mem.Allocator,
    nodes: std.StringHashMap(DependencyNode),

    pub const DependencyNode = struct {
        name: []const u8,
        version: []const u8,
        dependencies: []const []const u8,

        pub fn deinit(self: *DependencyNode, allocator: std.mem.Allocator) void {
            allocator.free(self.name);
            allocator.free(self.version);
            for (self.dependencies) |dep| {
                allocator.free(dep);
            }
            allocator.free(self.dependencies);
        }
    };

    pub fn init(allocator: std.mem.Allocator) DependencyGraph {
        return .{
            .allocator = allocator,
            .nodes = std.StringHashMap(DependencyNode).init(allocator),
        };
    }

    pub fn deinit(self: *DependencyGraph) void {
        var it = self.nodes.valueIterator();
        while (it.next()) |node| {
            // Note: keys are owned by nodes, so don't free separately
            var mut_node = @constCast(node);
            mut_node.deinit(self.allocator);
        }

        var key_it = self.nodes.keyIterator();
        while (key_it.next()) |key| {
            self.allocator.free(key.*);
        }

        self.nodes.deinit();
    }

    /// Resolve all dependencies for a package list
    pub fn resolve(
        self: *DependencyGraph,
        reg: *registry.PackageRegistry,
        packages_list: []const []const u8,
    ) ![][]const u8 {
        // Build dependency graph
        for (packages_list) |pkg_spec| {
            try self.addPackage(reg, pkg_spec);
        }

        // Convert to resolver.Dependency format
        var deps = try std.ArrayList(resolver.Dependency).initCapacity(self.allocator, self.nodes.count());
        defer {
            for (deps.items) |*dep| {
                // Dependencies are borrowed from nodes, don't free
                _ = dep;
            }
            deps.deinit(self.allocator);
        }

        var it = self.nodes.valueIterator();
        while (it.next()) |node| {
            try deps.append(self.allocator, resolver.Dependency{
                .name = node.name,
                .version = node.version,
                .dependencies = node.dependencies,
            });
        }

        // Topological sort for install order
        const result = try resolver.topologicalSort(self.allocator, deps.items);
        return result.order;
    }

    fn addPackage(
        self: *DependencyGraph,
        reg: *registry.PackageRegistry,
        pkg_spec: []const u8,
    ) error{ InvalidPackageSpec, PackageNotFound, OutOfMemory }!void {
        // Parse package spec (name@version or just name)
        var iter = std.mem.split(u8, pkg_spec, "@");
        const name = iter.next() orelse return error.InvalidPackageSpec;
        const constraint = iter.next();

        // Resolve version
        const version = try reg.resolveVersion(name, constraint);

        // Create key
        const key = try std.fmt.allocPrint(self.allocator, "{s}@{s}", .{ name, version });
        errdefer self.allocator.free(key);

        if (self.nodes.contains(key)) {
            self.allocator.free(key);
            return; // Already processed
        }

        // Get package info
        const pkg = reg.getPackage(name) orelse return error.PackageNotFound;

        // For now, packages don't have dependencies in generated.zig
        // This would need to be added
        const deps = try self.allocator.alloc([]const u8, 0);

        const node = DependencyNode{
            .name = try self.allocator.dupe(u8, name),
            .version = try self.allocator.dupe(u8, version),
            .dependencies = deps,
        };

        try self.nodes.put(key, node);

        // If package had dependencies, recursively add them
        _ = pkg; // pkg would have dependencies field
    }

    /// Detect version conflicts
    pub fn detectConflicts(self: *DependencyGraph) ![]Conflict {
        var conflicts = std.ArrayList(Conflict).init(self.allocator);
        errdefer conflicts.deinit(self.allocator);

        // Group packages by name
        var by_name = std.StringHashMap(std.ArrayList([]const u8)).init(self.allocator);
        defer {
            var deinit_it = by_name.valueIterator();
            while (deinit_it.next()) |list| {
                list.deinit(self.allocator);
            }
            by_name.deinit();
        }

        var it = self.nodes.iterator();
        while (it.next()) |entry| {
            const node = entry.value_ptr;

            const list = by_name.get(node.name) orelse blk: {
                const new_list = std.ArrayList([]const u8).init(self.allocator);
                try by_name.put(node.name, new_list);
                break :blk new_list;
            };

            try list.append(self.allocator, node.version);
            try by_name.put(node.name, list);
        }

        // Check for multiple versions of same package
        var name_it = by_name.iterator();
        while (name_it.next()) |entry| {
            if (entry.value_ptr.items.len > 1) {
                try conflicts.append(self.allocator, Conflict{
                    .package = entry.key_ptr.*,
                    .versions = try entry.value_ptr.toOwnedSlice(self.allocator),
                });
            }
        }

        return try conflicts.toOwnedSlice(self.allocator);
    }

    pub const Conflict = struct {
        package: []const u8,
        versions: [][]const u8,

        pub fn deinit(self: *Conflict, allocator: std.mem.Allocator) void {
            for (self.versions) |v| {
                allocator.free(v);
            }
            allocator.free(self.versions);
        }
    };
};

test "DependencyGraph basic" {
    const allocator = std.testing.allocator;

    var reg = registry.PackageRegistry.init(allocator);
    defer reg.deinit();

    var graph = DependencyGraph.init(allocator);
    defer graph.deinit();

    // Add a package
    const packages = [_][]const u8{"node"};
    const resolved = try graph.resolve(&reg, &packages);
    defer allocator.free(resolved);
    for (resolved) |pkg| {
        allocator.free(pkg);
    }

    try std.testing.expect(resolved.len >= 1);
}

test "DependencyGraph conflict detection" {
    const allocator = std.testing.allocator;

    var graph = DependencyGraph.init(allocator);
    defer graph.deinit();

    // Manually add conflicting versions
    try graph.nodes.put(try allocator.dupe(u8, "pkg@1.0.0"), DependencyGraph.DependencyNode{
        .name = try allocator.dupe(u8, "pkg"),
        .version = try allocator.dupe(u8, "1.0.0"),
        .dependencies = try allocator.alloc([]const u8, 0),
    });

    try graph.nodes.put(try allocator.dupe(u8, "pkg@2.0.0"), DependencyGraph.DependencyNode{
        .name = try allocator.dupe(u8, "pkg"),
        .version = try allocator.dupe(u8, "2.0.0"),
        .dependencies = try allocator.alloc([]const u8, 0),
    });

    const conflicts = try graph.detectConflicts();
    defer {
        for (conflicts) |c| {
            var mut_c = @constCast(&c);
            mut_c.deinit(allocator);
        }
        allocator.free(conflicts);
    }

    try std.testing.expect(conflicts.len == 1);
    try std.testing.expectEqualStrings("pkg", conflicts[0].package);
}
