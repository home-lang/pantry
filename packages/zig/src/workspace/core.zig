const std = @import("std");
const io_helper = @import("../io_helper.zig");

/// Workspace configuration
pub const WorkspaceConfig = struct {
    /// Workspace root directory
    root: []const u8,
    /// Package patterns (glob patterns for package directories)
    packages: [][]const u8,
    /// Shared dependencies configuration
    shared_deps: bool = true,
    /// Hoist dependencies to root
    hoist: bool = true,
    /// Workspace name
    name: ?[]const u8 = null,
    /// Workspace version
    version: ?[]const u8 = null,

    pub fn deinit(self: *WorkspaceConfig, allocator: std.mem.Allocator) void {
        allocator.free(self.root);
        for (self.packages) |pkg| {
            allocator.free(pkg);
        }
        allocator.free(self.packages);
        if (self.name) |n| allocator.free(n);
        if (self.version) |v| allocator.free(v);
    }

    /// Load workspace config from pantry.json
    pub fn fromJson(allocator: std.mem.Allocator, json: std.json.Value, root: []const u8) !WorkspaceConfig {
        if (json != .object) return error.InvalidWorkspaceConfig;

        const obj = json.object;
        const workspace = obj.get("workspace") orelse return error.NoWorkspaceConfig;

        if (workspace != .object) return error.InvalidWorkspaceConfig;
        const ws_obj = workspace.object;

        // Get packages
        const packages_val = ws_obj.get("packages") orelse return error.NoPackages;
        if (packages_val != .array) return error.InvalidPackages;

        var packages = std.ArrayList([]const u8).init(allocator);
        errdefer {
            for (packages.items) |pkg| {
                allocator.free(pkg);
            }
            packages.deinit();
        }

        for (packages_val.array.items) |item| {
            if (item == .string) {
                try packages.append(try allocator.dupe(u8, item.string));
            }
        }

        // Get optional fields
        const shared_deps = if (ws_obj.get("sharedDeps")) |sd|
            if (sd == .bool) sd.bool else true
        else
            true;

        const hoist = if (ws_obj.get("hoist")) |h|
            if (h == .bool) h.bool else true
        else
            true;

        const name = if (ws_obj.get("name")) |n|
            if (n == .string) try allocator.dupe(u8, n.string) else null
        else
            null;

        const version = if (ws_obj.get("version")) |v|
            if (v == .string) try allocator.dupe(u8, v.string) else null
        else
            null;

        return .{
            .root = try allocator.dupe(u8, root),
            .packages = try packages.toOwnedSlice(),
            .shared_deps = shared_deps,
            .hoist = hoist,
            .name = name,
            .version = version,
        };
    }
};

/// Package within a workspace
pub const WorkspacePackage = struct {
    /// Package name
    name: []const u8,
    /// Package version
    version: []const u8,
    /// Relative path from workspace root
    path: []const u8,
    /// Dependencies
    dependencies: std.StringHashMap([]const u8),
    /// Dev dependencies
    dev_dependencies: std.StringHashMap([]const u8),
    /// Bin paths exported
    bin: std.StringHashMap([]const u8),
    /// Whether this package is private
    private: bool = false,

    pub fn deinit(self: *WorkspacePackage, allocator: std.mem.Allocator) void {
        allocator.free(self.name);
        allocator.free(self.version);
        allocator.free(self.path);

        var dep_it = self.dependencies.iterator();
        while (dep_it.next()) |entry| {
            allocator.free(entry.key_ptr.*);
            allocator.free(entry.value_ptr.*);
        }
        self.dependencies.deinit();

        var dev_it = self.dev_dependencies.iterator();
        while (dev_it.next()) |entry| {
            allocator.free(entry.key_ptr.*);
            allocator.free(entry.value_ptr.*);
        }
        self.dev_dependencies.deinit();

        var bin_it = self.bin.iterator();
        while (bin_it.next()) |entry| {
            allocator.free(entry.key_ptr.*);
            allocator.free(entry.value_ptr.*);
        }
        self.bin.deinit();
    }

    /// Load package from directory
    pub fn fromDirectory(allocator: std.mem.Allocator, root_path: []const u8, relative_path: []const u8) !WorkspacePackage {
        const full_path = try std.fmt.allocPrint(allocator, "{s}/{s}", .{ root_path, relative_path });
        defer allocator.free(full_path);

        const config_path = try std.fmt.allocPrint(allocator, "{s}/pantry.json", .{full_path});
        defer allocator.free(config_path);

        // Read config file
        const file = try io_helper.cwd().openFile(io_helper.io, config_path, .{});
        defer file.close(io_helper.io);

        const content = try file.readToEndAlloc(allocator, std.Io.Limit.limited(10 * 1024 * 1024));
        defer allocator.free(content);

        const parsed = try std.json.parseFromSlice(std.json.Value, allocator, content, .{});
        defer parsed.deinit();

        return try fromJson(allocator, parsed.value, relative_path);
    }

    /// Parse package from JSON
    fn fromJson(allocator: std.mem.Allocator, json: std.json.Value, path: []const u8) !WorkspacePackage {
        if (json != .object) return error.InvalidPackageConfig;

        const obj = json.object;

        // Get name
        const name = if (obj.get("name")) |n|
            if (n == .string) try allocator.dupe(u8, n.string) else return error.MissingName
        else
            return error.MissingName;
        errdefer allocator.free(name);

        // Get version
        const version = if (obj.get("version")) |v|
            if (v == .string) try allocator.dupe(u8, v.string) else try allocator.dupe(u8, "0.0.0")
        else
            try allocator.dupe(u8, "0.0.0");
        errdefer allocator.free(version);

        // Get dependencies
        var dependencies = std.StringHashMap([]const u8).init(allocator);
        errdefer {
            var it = dependencies.iterator();
            while (it.next()) |entry| {
                allocator.free(entry.key_ptr.*);
                allocator.free(entry.value_ptr.*);
            }
            dependencies.deinit();
        }

        if (obj.get("dependencies")) |deps| {
            if (deps == .object) {
                var it = deps.object.iterator();
                while (it.next()) |entry| {
                    if (entry.value_ptr.* == .string) {
                        const key = try allocator.dupe(u8, entry.key_ptr.*);
                        const value = try allocator.dupe(u8, entry.value_ptr.*.string);
                        try dependencies.put(key, value);
                    }
                }
            }
        }

        // Get dev dependencies
        var dev_dependencies = std.StringHashMap([]const u8).init(allocator);
        errdefer {
            var it = dev_dependencies.iterator();
            while (it.next()) |entry| {
                allocator.free(entry.key_ptr.*);
                allocator.free(entry.value_ptr.*);
            }
            dev_dependencies.deinit();
        }

        if (obj.get("devDependencies")) |deps| {
            if (deps == .object) {
                var it = deps.object.iterator();
                while (it.next()) |entry| {
                    if (entry.value_ptr.* == .string) {
                        const key = try allocator.dupe(u8, entry.key_ptr.*);
                        const value = try allocator.dupe(u8, entry.value_ptr.*.string);
                        try dev_dependencies.put(key, value);
                    }
                }
            }
        }

        // Get bin
        var bin = std.StringHashMap([]const u8).init(allocator);
        errdefer {
            var it = bin.iterator();
            while (it.next()) |entry| {
                allocator.free(entry.key_ptr.*);
                allocator.free(entry.value_ptr.*);
            }
            bin.deinit();
        }

        if (obj.get("bin")) |bin_val| {
            if (bin_val == .object) {
                var it = bin_val.object.iterator();
                while (it.next()) |entry| {
                    if (entry.value_ptr.* == .string) {
                        const key = try allocator.dupe(u8, entry.key_ptr.*);
                        const value = try allocator.dupe(u8, entry.value_ptr.*.string);
                        try bin.put(key, value);
                    }
                }
            }
        }

        // Get private flag
        const private = if (obj.get("private")) |p|
            if (p == .bool) p.bool else false
        else
            false;

        return .{
            .name = name,
            .version = version,
            .path = try allocator.dupe(u8, path),
            .dependencies = dependencies,
            .dev_dependencies = dev_dependencies,
            .bin = bin,
            .private = private,
        };
    }
};

/// Workspace dependency graph
pub const DependencyGraph = struct {
    /// Package name to package mapping
    packages: std.StringHashMap(*WorkspacePackage),
    /// Dependency edges (package -> [dependencies])
    edges: std.StringHashMap(std.ArrayList([]const u8)),
    /// Allocator
    allocator: std.mem.Allocator,

    pub fn init(allocator: std.mem.Allocator) DependencyGraph {
        return .{
            .packages = std.StringHashMap(*WorkspacePackage).init(allocator),
            .edges = std.StringHashMap(std.ArrayList([]const u8)).init(allocator),
            .allocator = allocator,
        };
    }

    pub fn deinit(self: *DependencyGraph) void {
        var edge_it = self.edges.iterator();
        while (edge_it.next()) |entry| {
            self.allocator.free(entry.key_ptr.*);
            for (entry.value_ptr.items) |dep| {
                self.allocator.free(dep);
            }
            entry.value_ptr.deinit();
        }
        self.edges.deinit();

        var pkg_it = self.packages.iterator();
        while (pkg_it.next()) |entry| {
            self.allocator.free(entry.key_ptr.*);
        }
        self.packages.deinit();
    }

    /// Add package to graph
    pub fn addPackage(self: *DependencyGraph, pkg: *WorkspacePackage) !void {
        const name = try self.allocator.dupe(u8, pkg.name);
        try self.packages.put(name, pkg);

        // Add dependency edges
        var deps = std.ArrayList([]const u8).init(self.allocator);
        var dep_it = pkg.dependencies.keyIterator();
        while (dep_it.next()) |dep_name| {
            try deps.append(try self.allocator.dupe(u8, dep_name.*));
        }

        const edge_key = try self.allocator.dupe(u8, pkg.name);
        try self.edges.put(edge_key, deps);
    }

    /// Get topological sort of packages (for build order)
    pub fn topologicalSort(self: *DependencyGraph) ![][]const u8 {
        var result: std.ArrayList([]const u8) = .{};
        errdefer {
            for (result.items) |item| {
                self.allocator.free(item);
            }
            result.deinit(self.allocator);
        }

        var visited = std.StringHashMap(bool).init(self.allocator);
        defer visited.deinit();

        var temp_mark = std.StringHashMap(bool).init(self.allocator);
        defer temp_mark.deinit();

        var pkg_it = self.packages.keyIterator();
        while (pkg_it.next()) |name| {
            if (!visited.contains(name.*)) {
                try self.visit(name.*, &visited, &temp_mark, &result);
            }
        }

        return try result.toOwnedSlice(self.allocator);
    }

    fn visit(
        self: *DependencyGraph,
        name: []const u8,
        visited: *std.StringHashMap(bool),
        temp_mark: *std.StringHashMap(bool),
        result: *std.ArrayList([]const u8),
    ) !void {
        if (temp_mark.contains(name)) {
            return error.CyclicDependency;
        }

        if (visited.contains(name)) {
            return;
        }

        try temp_mark.put(name, true);

        // Visit dependencies
        if (self.edges.get(name)) |deps| {
            for (deps.items) |dep| {
                // Only visit if it's a workspace package
                if (self.packages.contains(dep)) {
                    try self.visit(dep, visited, temp_mark, result);
                }
            }
        }

        _ = temp_mark.remove(name);
        try visited.put(name, true);
        try result.append(self.allocator, try self.allocator.dupe(u8, name));
    }

    /// Check for circular dependencies
    pub fn hasCircularDependencies(self: *DependencyGraph) bool {
        _ = self.topologicalSort() catch {
            return true;
        };
        return false;
    }
};

/// Workspace manager
pub const Workspace = struct {
    /// Workspace configuration
    config: WorkspaceConfig,
    /// Packages in workspace
    packages: std.ArrayList(WorkspacePackage),
    /// Dependency graph
    graph: DependencyGraph,
    /// Allocator
    allocator: std.mem.Allocator,

    pub fn init(allocator: std.mem.Allocator, config: WorkspaceConfig) !Workspace {
        return .{
            .config = config,
            .packages = std.ArrayList(WorkspacePackage).init(allocator),
            .graph = DependencyGraph.init(allocator),
            .allocator = allocator,
        };
    }

    pub fn deinit(self: *Workspace) void {
        for (self.packages.items) |*pkg| {
            pkg.deinit(self.allocator);
        }
        self.packages.deinit();
        self.graph.deinit();
    }

    /// Discover all packages in workspace
    pub fn discover(self: *Workspace) !void {
        for (self.config.packages) |pattern| {
            try self.discoverPattern(pattern);
        }

        // Build dependency graph
        for (self.packages.items) |*pkg| {
            try self.graph.addPackage(pkg);
        }
    }

    fn discoverPattern(self: *Workspace, pattern: []const u8) !void {
        // Check if pattern contains wildcards
        if (std.mem.indexOfAny(u8, pattern, "*?")) |_| {
            // Handle wildcard patterns with recursive discovery
            try self.discoverGlobPattern(pattern);
        } else {
            // Direct path
            const pkg = try WorkspacePackage.fromDirectory(
                self.allocator,
                self.config.root,
                pattern,
            );
            try self.packages.append(pkg);
        }
    }

    /// Match a glob pattern against a path
    fn matchGlob(pattern: []const u8, path: []const u8) bool {
        var p_idx: usize = 0;
        var s_idx: usize = 0;
        var star_idx: ?usize = null;
        var match_idx: usize = 0;

        while (s_idx < path.len) {
            if (p_idx < pattern.len) {
                const p_char = pattern[p_idx];
                const s_char = path[s_idx];

                if (p_char == '*') {
                    // Wildcard: remember position
                    star_idx = p_idx;
                    match_idx = s_idx;
                    p_idx += 1;
                    continue;
                } else if (p_char == '?' or p_char == s_char) {
                    // Single char wildcard or exact match
                    p_idx += 1;
                    s_idx += 1;
                    continue;
                }
            }

            // Mismatch: backtrack to last wildcard if any
            if (star_idx) |star| {
                p_idx = star + 1;
                match_idx += 1;
                s_idx = match_idx;
            } else {
                return false;
            }
        }

        // Consume any trailing wildcards in pattern
        while (p_idx < pattern.len and pattern[p_idx] == '*') {
            p_idx += 1;
        }

        return p_idx == pattern.len;
    }

    /// Recursively discover packages matching a glob pattern
    fn discoverGlobPattern(self: *Workspace, pattern: []const u8) !void {
        // Split pattern into segments
        const has_double_star = std.mem.indexOf(u8, pattern, "**") != null;

        if (has_double_star) {
            // ** means recursive directory search
            try self.discoverGlobRecursive(".", pattern);
        } else {
            // Single * means match within current directory level
            const dir_path = blk: {
                // Get directory part before wildcard
                var last_slash: usize = 0;
                for (pattern, 0..) |c, i| {
                    if (c == '/') last_slash = i;
                    if (c == '*' or c == '?') break;
                }

                if (last_slash > 0) {
                    break :blk pattern[0..last_slash];
                } else {
                    break :blk ".";
                }
            };

            const full_dir = try std.fmt.allocPrint(self.allocator, "{s}/{s}", .{ self.config.root, dir_path });
            defer self.allocator.free(full_dir);

            var dir = io_helper.cwd().openDir(io_helper.io, full_dir, .{ .iterate = true }) catch return;
            defer dir.close(io_helper.io);

            var it = dir.iterate();
            while (try it.next(io_helper.io)) |entry| {
                if (entry.kind == .directory) {
                    const rel_path = if (std.mem.eql(u8, dir_path, "."))
                        try self.allocator.dupe(u8, entry.name)
                    else
                        try std.fmt.allocPrint(
                            self.allocator,
                            "{s}/{s}",
                            .{ dir_path, entry.name },
                        );
                    defer self.allocator.free(rel_path);

                    // Check if path matches pattern
                    if (matchGlob(pattern, rel_path)) {
                        // Check if pantry.json exists
                        const config_path = try std.fmt.allocPrint(
                            self.allocator,
                            "{s}/{s}/pantry.json",
                            .{ self.config.root, rel_path },
                        );
                        defer self.allocator.free(config_path);

                        io_helper.cwd().access(io_helper.io, config_path, .{}) catch continue;

                        const pkg = try WorkspacePackage.fromDirectory(
                            self.allocator,
                            self.config.root,
                            rel_path,
                        );
                        try self.packages.append(pkg);
                    }
                }
            }
        }
    }

    /// Recursively discover packages with ** patterns
    fn discoverGlobRecursive(self: *Workspace, base_path: []const u8, pattern: []const u8) !void {
        const full_dir = try std.fmt.allocPrint(self.allocator, "{s}/{s}", .{ self.config.root, base_path });
        defer self.allocator.free(full_dir);

        var dir = io_helper.cwd().openDir(io_helper.io, full_dir, .{ .iterate = true }) catch return;
        defer dir.close(io_helper.io);

        var it = dir.iterate();
        while (try it.next(io_helper.io)) |entry| {
            if (entry.kind == .directory) {
                // Skip hidden directories and node_modules
                if (entry.name[0] == '.' or std.mem.eql(u8, entry.name, "node_modules")) {
                    continue;
                }

                const rel_path = if (std.mem.eql(u8, base_path, "."))
                    try self.allocator.dupe(u8, entry.name)
                else
                    try std.fmt.allocPrint(
                        self.allocator,
                        "{s}/{s}",
                        .{ base_path, entry.name },
                    );
                defer self.allocator.free(rel_path);

                // Check if path matches pattern
                if (matchGlob(pattern, rel_path)) {
                    // Check if pantry.json exists
                    const config_path = try std.fmt.allocPrint(
                        self.allocator,
                        "{s}/{s}/pantry.json",
                        .{ self.config.root, rel_path },
                    );
                    defer self.allocator.free(config_path);

                    if (io_helper.cwd().access(io_helper.io, config_path, .{})) {
                        const pkg = try WorkspacePackage.fromDirectory(
                            self.allocator,
                            self.config.root,
                            rel_path,
                        );
                        try self.packages.append(pkg);
                    } else |_| {}
                }

                // Recurse into subdirectory
                try self.discoverGlobRecursive(rel_path, pattern);
            }
        }
    }

    /// Get package by name
    pub fn getPackage(self: *Workspace, name: []const u8) ?*WorkspacePackage {
        for (self.packages.items) |*pkg| {
            if (std.mem.eql(u8, pkg.name, name)) {
                return pkg;
            }
        }
        return null;
    }

    /// Get build order for packages
    pub fn getBuildOrder(self: *Workspace) ![][]const u8 {
        return try self.graph.topologicalSort();
    }

    /// Check if workspace has circular dependencies
    pub fn hasCircularDependencies(self: *Workspace) bool {
        return self.graph.hasCircularDependencies();
    }

    /// Link packages (create symlinks between workspace packages)
    pub fn link(self: *Workspace) !void {
        for (self.packages.items) |*pkg| {
            try self.linkPackage(pkg);
        }
    }

    fn linkPackage(self: *Workspace, pkg: *WorkspacePackage) !void {
        const pkg_path = try std.fmt.allocPrint(
            self.allocator,
            "{s}/{s}",
            .{ self.config.root, pkg.path },
        );
        defer self.allocator.free(pkg_path);

        const node_modules = try std.fmt.allocPrint(
            self.allocator,
            "{s}/node_modules",
            .{pkg_path},
        );
        defer self.allocator.free(node_modules);

        // Create node_modules if it doesn't exist
        try io_helper.cwd().createDirPath(io_helper.io, node_modules);

        // Link workspace dependencies
        var dep_it = pkg.dependencies.iterator();
        while (dep_it.next()) |entry| {
            const dep_name = entry.key_ptr.*;

            // Check if it's a workspace package
            if (self.getPackage(dep_name)) |dep_pkg| {
                const dep_full_path = try std.fmt.allocPrint(
                    self.allocator,
                    "{s}/{s}",
                    .{ self.config.root, dep_pkg.path },
                );
                defer self.allocator.free(dep_full_path);

                const link_path = try std.fmt.allocPrint(
                    self.allocator,
                    "{s}/{s}",
                    .{ node_modules, dep_name },
                );
                defer self.allocator.free(link_path);

                // Create symlink
                io_helper.cwd().symLink(dep_full_path, link_path, io_helper.io, .{ .is_directory = true }) catch |err| {
                    if (err != error.PathAlreadyExists) {
                        return err;
                    }
                };
            }
        }
    }
};
