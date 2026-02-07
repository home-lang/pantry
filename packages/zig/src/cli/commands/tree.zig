//! Dependency tree visualization
//!
//! Display package dependencies in a tree format

const std = @import("std");
const io_helper = @import("../../io_helper.zig");
const lib = @import("../../lib.zig");
const style = @import("../style.zig");

const CommandResult = struct {
    exit_code: u8,
    message: ?[]const u8 = null,

    pub fn deinit(self: *CommandResult, allocator: std.mem.Allocator) void {
        if (self.message) |msg| {
            allocator.free(msg);
        }
    }
};

const TreeOptions = struct {
    show_versions: bool = true,
    show_dev: bool = true,
    show_peer: bool = false,
    max_depth: ?usize = null,
    json: bool = false,
};

const PackageNode = struct {
    name: []const u8,
    version: []const u8,
    dep_type: DepType,
    dependencies: std.ArrayList(*PackageNode),
    allocator: std.mem.Allocator,

    const DepType = enum {
        normal,
        dev,
        peer,
    };

    pub fn init(allocator: std.mem.Allocator, name: []const u8, version: []const u8, dep_type: DepType) !*PackageNode {
        const node = try allocator.create(PackageNode);
        node.* = .{
            .name = try allocator.dupe(u8, name),
            .version = try allocator.dupe(u8, version),
            .dep_type = dep_type,
            .dependencies = std.ArrayList(*PackageNode){},
            .allocator = allocator,
        };
        return node;
    }

    pub fn deinit(self: *PackageNode) void {
        self.allocator.free(self.name);
        self.allocator.free(self.version);
        for (self.dependencies.items) |child| {
            child.deinit();
        }
        self.dependencies.deinit(self.allocator);
        self.allocator.destroy(self);
    }
};

pub fn treeCommand(allocator: std.mem.Allocator, args: []const []const u8) !CommandResult {
    var options = TreeOptions{};

    // Parse options
    for (args) |arg| {
        if (std.mem.eql(u8, arg, "--no-versions")) {
            options.show_versions = false;
        } else if (std.mem.eql(u8, arg, "--no-dev")) {
            options.show_dev = false;
        } else if (std.mem.eql(u8, arg, "--peer")) {
            options.show_peer = true;
        } else if (std.mem.eql(u8, arg, "--json")) {
            options.json = true;
        } else if (std.mem.startsWith(u8, arg, "--depth=")) {
            const depth_str = arg["--depth=".len..];
            options.max_depth = try std.fmt.parseInt(usize, depth_str, 10);
        }
    }

    const cwd = try io_helper.getCwdAlloc(allocator);
    defer allocator.free(cwd);

    // Find and parse dependency file
    const detector = @import("../../deps/detector.zig");
    const parser = @import("../../deps/parser.zig");

    const deps_file = (try detector.findDepsFile(allocator, cwd)) orelse {
        return .{
            .exit_code = 1,
            .message = try allocator.dupe(u8, "No dependency file found"),
        };
    };
    defer allocator.free(deps_file.path);

    const deps = try parser.inferDependencies(allocator, deps_file);
    defer {
        for (deps) |*dep| {
            var d = dep.*;
            d.deinit(allocator);
        }
        allocator.free(deps);
    }

    // Build dependency tree
    var root = try PackageNode.init(allocator, "root", "0.0.0", .normal);
    defer root.deinit();

    for (deps) |dep| {
        // Filter based on options
        if (!options.show_dev and dep.dep_type == .dev) continue;
        if (!options.show_peer and dep.dep_type == .peer) continue;

        const node = try PackageNode.init(
            allocator,
            dep.name,
            dep.version,
            switch (dep.dep_type) {
                .normal => .normal,
                .dev => .dev,
                .peer => .peer,
            },
        );
        try root.dependencies.append(root.allocator, node);
    }

    // Display tree
    if (options.json) {
        try printTreeJson(allocator, root);
    } else {
        style.print("\n", .{});
        try printTree(root, "", true, options);
        style.print("\n", .{});

        // Print legend
        style.print("Legend:\n", .{});
        style.print("  {s}⚬{s} normal dependency\n", .{ style.green, style.reset });
        if (options.show_dev) {
            style.print("  {s}⚬{s} dev dependency\n", .{ style.yellow, style.reset });
        }
        if (options.show_peer) {
            style.print("  {s}⚬{s} peer dependency\n", .{ style.cyan, style.reset });
        }
    }

    return .{ .exit_code = 0 };
}

fn printTree(node: *PackageNode, prefix: []const u8, is_last: bool, options: TreeOptions) !void {
    if (node.dep_type != .normal or std.mem.eql(u8, node.name, "root")) {
        // Root node, skip printing
        for (node.dependencies.items, 0..) |child, i| {
            const child_is_last = i == node.dependencies.items.len - 1;
            try printTree(child, "", child_is_last, options);
        }
        return;
    }

    // Print current node
    const color = switch (node.dep_type) {
        .normal => style.green,
        .dev => style.yellow,
        .peer => style.cyan,
    };

    style.print("{s}", .{prefix});
    style.print("{s}", .{if (is_last) "└── " else "├── "});
    style.print("{s}⚬{s} ", .{ color, style.reset });

    if (options.show_versions) {
        style.print("{s}@{s}\n", .{ node.name, node.version });
    } else {
        style.print("{s}\n", .{node.name});
    }

    // Print children
    const new_prefix = try std.fmt.allocPrint(
        node.allocator,
        "{s}{s}",
        .{ prefix, if (is_last) "    " else "│   " },
    );
    defer node.allocator.free(new_prefix);

    for (node.dependencies.items, 0..) |child, i| {
        const child_is_last = i == node.dependencies.items.len - 1;
        try printTree(child, new_prefix, child_is_last, options);
    }
}

fn printTreeJson(allocator: std.mem.Allocator, root: *PackageNode) !void {
    var output = std.ArrayList(u8){};
    defer output.deinit(allocator);

    try output.appendSlice(allocator, "{\n");
    try output.appendSlice(allocator, "  \"dependencies\": [\n");

    for (root.dependencies.items, 0..) |node, i| {
        try printNodeJson(allocator, &output, node, 2);
        if (i < root.dependencies.items.len - 1) {
            try output.appendSlice(allocator, ",\n");
        } else {
            try output.appendSlice(allocator, "\n");
        }
    }

    try output.appendSlice(allocator, "  ]\n");
    try output.appendSlice(allocator, "}\n");

    style.print("{s}", .{output.items});
}

fn printNodeJson(allocator: std.mem.Allocator, output: *std.ArrayList(u8), node: *PackageNode, indent: usize) !void {
    // Create indent string (spaces)
    const indent_str = try allocator.alloc(u8, indent);
    @memset(indent_str, ' ');
    defer allocator.free(indent_str);

    try output.appendSlice(allocator, indent_str);
    try output.appendSlice(allocator, "{\n");

    try output.appendSlice(allocator, indent_str);
    const name_line = try std.fmt.allocPrint(allocator, "  \"name\": \"{s}\",\n", .{node.name});
    defer allocator.free(name_line);
    try output.appendSlice(allocator, name_line);

    try output.appendSlice(allocator, indent_str);
    const version_line = try std.fmt.allocPrint(allocator, "  \"version\": \"{s}\",\n", .{node.version});
    defer allocator.free(version_line);
    try output.appendSlice(allocator, version_line);

    try output.appendSlice(allocator, indent_str);
    const type_line = try std.fmt.allocPrint(allocator, "  \"type\": \"{s}\",\n", .{@tagName(node.dep_type)});
    defer allocator.free(type_line);
    try output.appendSlice(allocator, type_line);

    if (node.dependencies.items.len > 0) {
        try output.appendSlice(allocator, indent_str);
        try output.appendSlice(allocator, "  \"dependencies\": [\n");

        for (node.dependencies.items, 0..) |child, i| {
            try printNodeJson(allocator, output, child, indent + 4);
            if (i < node.dependencies.items.len - 1) {
                try output.appendSlice(allocator, ",\n");
            } else {
                try output.appendSlice(allocator, "\n");
            }
        }

        try output.appendSlice(allocator, indent_str);
        try output.appendSlice(allocator, "  ]\n");
    }

    try output.appendSlice(allocator, indent_str);
    try output.appendSlice(allocator, "}");
}
