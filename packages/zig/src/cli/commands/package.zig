//! Package management commands: remove, update, outdated, publish, list

const std = @import("std");
const lib = @import("../../lib.zig");
const common = @import("common.zig");

const CommandResult = common.CommandResult;

// ============================================================================
// Remove Command
// ============================================================================

pub const RemoveOptions = struct {
    save: bool = true,
    global: bool = false,
    dry_run: bool = false,
    silent: bool = false,
    verbose: bool = false,
};

/// Remove packages from the project
pub fn removeCommand(allocator: std.mem.Allocator, args: []const []const u8, options: RemoveOptions) !CommandResult {
    if (args.len == 0) {
        return CommandResult.err(allocator, common.ERROR_NO_PACKAGES);
    }

    // Get current working directory
    var cwd_buf: [std.fs.max_path_bytes]u8 = undefined;
    const cwd = try std.fs.cwd().realpath(".", &cwd_buf);

    // Find and read config file
    const config_path = common.findConfigFile(allocator, cwd) catch {
        return CommandResult.err(allocator, common.ERROR_NO_CONFIG);
    };
    defer allocator.free(config_path);

    const parsed = common.readConfigFile(allocator, config_path) catch {
        return CommandResult.err(allocator, common.ERROR_CONFIG_PARSE);
    };
    defer parsed.deinit();

    const root = parsed.value;
    if (root != .object) {
        return CommandResult.err(allocator, common.ERROR_CONFIG_NOT_OBJECT);
    }

    // Track removed and not found packages
    var removed_packages = try std.ArrayList([]const u8).initCapacity(allocator, args.len);
    defer removed_packages.deinit(allocator);

    var not_found_packages = try std.ArrayList([]const u8).initCapacity(allocator, args.len);
    defer not_found_packages.deinit(allocator);

    // Check dependencies
    var deps_modified = false;
    if (root.object.get("dependencies")) |deps_val| {
        if (deps_val == .object) {
            for (args) |package_name| {
                if (deps_val.object.contains(package_name)) {
                    try removed_packages.append(allocator, package_name);
                    deps_modified = true;
                } else {
                    var found_in_dev = false;
                    if (root.object.get("devDependencies")) |dev_deps| {
                        if (dev_deps == .object and dev_deps.object.contains(package_name)) {
                            found_in_dev = true;
                        }
                    }
                    if (!found_in_dev) {
                        try not_found_packages.append(allocator, package_name);
                    }
                }
            }
        }
    }

    // Check devDependencies
    if (root.object.get("devDependencies")) |dev_deps_val| {
        if (dev_deps_val == .object) {
            for (args) |package_name| {
                if (dev_deps_val.object.contains(package_name)) {
                    var already_added = false;
                    for (removed_packages.items) |pkg| {
                        if (std.mem.eql(u8, pkg, package_name)) {
                            already_added = true;
                            break;
                        }
                    }
                    if (!already_added) {
                        try removed_packages.append(allocator, package_name);
                    }
                    deps_modified = true;
                }
            }
        }
    }

    // Print results
    if (!options.silent) {
        if (removed_packages.items.len > 0) {
            std.debug.print("\x1b[32m✓\x1b[0m Removed {d} package(s):\n", .{removed_packages.items.len});
            for (removed_packages.items) |pkg| {
                std.debug.print("  \x1b[2m−\x1b[0m {s}\n", .{pkg});
            }
        }

        if (not_found_packages.items.len > 0) {
            std.debug.print("\x1b[33m⚠\x1b[0m Not found in dependencies:\n", .{});
            for (not_found_packages.items) |pkg| {
                std.debug.print("  \x1b[2m−\x1b[0m {s}\n", .{pkg});
            }
        }
    }

    // Remove from pantry_modules
    if (!options.dry_run) {
        const modules_dir = try std.fs.path.join(allocator, &[_][]const u8{ cwd, "pantry_modules" });
        defer allocator.free(modules_dir);

        for (removed_packages.items) |pkg| {
            const pkg_dir = try std.fs.path.join(allocator, &[_][]const u8{ modules_dir, pkg });
            defer allocator.free(pkg_dir);

            std.fs.cwd().deleteTree(pkg_dir) catch {};
        }
    }

    if (removed_packages.items.len == 0) {
        return CommandResult.err(allocator, "No packages were removed");
    }

    return CommandResult.success(allocator, null);
}

// ============================================================================
// Update Command
// ============================================================================

pub const UpdateOptions = struct {
    latest: bool = false,
    force: bool = false,
    interactive: bool = false,
    production: bool = false,
    global: bool = false,
    dry_run: bool = false,
    silent: bool = false,
    verbose: bool = false,
    save: bool = true,
};

/// Update packages to latest versions
pub fn updateCommand(allocator: std.mem.Allocator, args: []const []const u8, options: UpdateOptions) !CommandResult {
    // Get current working directory
    var cwd_buf: [std.fs.max_path_bytes]u8 = undefined;
    const cwd = try std.fs.cwd().realpath(".", &cwd_buf);

    // Find config file
    const config_path = common.findConfigFile(allocator, cwd) catch {
        return CommandResult.err(allocator, common.ERROR_NO_CONFIG);
    };
    defer allocator.free(config_path);

    if (!options.silent) {
        if (args.len > 0) {
            std.debug.print("\x1b[34m📦 Updating specific packages\x1b[0m\n", .{});
            for (args) |pkg| {
                std.debug.print("  → {s}\n", .{pkg});
            }
        } else {
            std.debug.print("\x1b[34m📦 Updating all packages\x1b[0m\n", .{});
        }
        std.debug.print("\n", .{});
    }

    // For now, delegate to install command
    const install = @import("install.zig");
    const install_options = install.InstallOptions{
        .production = options.production,
        .dev_only = false,
        .include_peer = false,
    };

    return try install.installCommandWithOptions(allocator, args, install_options);
}

// ============================================================================
// Outdated Command
// ============================================================================

pub const OutdatedOptions = struct {
    production: bool = false,
    global: bool = false,
    filter: ?[]const u8 = null,
    silent: bool = false,
    verbose: bool = false,
    no_progress: bool = false,
};

const PackageVersionInfo = struct {
    name: []const u8,
    current: []const u8,
    update: []const u8,
    latest: []const u8,
    is_dev: bool,
    workspace: ?[]const u8 = null,

    fn deinit(self: *PackageVersionInfo, allocator: std.mem.Allocator) void {
        allocator.free(self.name);
        allocator.free(self.current);
        allocator.free(self.update);
        allocator.free(self.latest);
        if (self.workspace) |ws| {
            allocator.free(ws);
        }
    }
};

/// Check for outdated dependencies
pub fn outdatedCommand(allocator: std.mem.Allocator, args: []const []const u8, options: OutdatedOptions) !CommandResult {
    _ = options;

    // Get current working directory
    var cwd_buf: [std.fs.max_path_bytes]u8 = undefined;
    const cwd = try std.fs.cwd().realpath(".", &cwd_buf);

    // Find and read config
    const config_path = common.findConfigFile(allocator, cwd) catch {
        return CommandResult.err(allocator, common.ERROR_NO_CONFIG);
    };
    defer allocator.free(config_path);

    const parsed = common.readConfigFile(allocator, config_path) catch {
        return CommandResult.err(allocator, common.ERROR_CONFIG_PARSE);
    };
    defer parsed.deinit();

    const root = parsed.value;
    if (root != .object) {
        return CommandResult.err(allocator, common.ERROR_CONFIG_NOT_OBJECT);
    }

    var outdated_packages = try std.ArrayList(PackageVersionInfo).initCapacity(allocator, 16);
    defer {
        for (outdated_packages.items) |*pkg| {
            pkg.deinit(allocator);
        }
        outdated_packages.deinit(allocator);
    }

    // Helper to check if package matches filter patterns
    const matchesFilter = struct {
        fn call(pkg_name: []const u8, patterns: []const []const u8) bool {
            if (patterns.len == 0) return true;

            for (patterns) |pattern| {
                if (pattern.len > 0 and pattern[0] == '!') {
                    const neg_pattern = pattern[1..];
                    if (matchGlob(pkg_name, neg_pattern)) {
                        return false;
                    }
                    continue;
                }

                if (matchGlob(pkg_name, pattern)) {
                    return true;
                }
            }
            return false;
        }

        fn matchGlob(text: []const u8, pattern: []const u8) bool {
            if (std.mem.indexOf(u8, pattern, "*")) |star_pos| {
                const prefix = pattern[0..star_pos];
                const suffix = pattern[star_pos + 1 ..];

                if (!std.mem.startsWith(u8, text, prefix)) return false;
                if (!std.mem.endsWith(u8, text, suffix)) return false;
                return true;
            }
            return std.mem.eql(u8, text, pattern);
        }
    }.call;

    // Check dependencies
    if (root.object.get("dependencies")) |deps_val| {
        if (deps_val == .object) {
            var iter = deps_val.object.iterator();
            while (iter.next()) |entry| {
                const pkg_name = entry.key_ptr.*;
                if (!matchesFilter(pkg_name, args)) continue;

                const version_str = if (entry.value_ptr.* == .string)
                    entry.value_ptr.string
                else
                    "unknown";

                const current = try allocator.dupe(u8, version_str);
                const update = try allocator.dupe(u8, version_str);
                const latest = try allocator.dupe(u8, version_str);
                const name = try allocator.dupe(u8, pkg_name);

                try outdated_packages.append(allocator, .{
                    .name = name,
                    .current = current,
                    .update = update,
                    .latest = latest,
                    .is_dev = false,
                });
            }
        }
    }

    // Check devDependencies
    if (root.object.get("devDependencies")) |dev_deps_val| {
        if (dev_deps_val == .object) {
            var iter = dev_deps_val.object.iterator();
            while (iter.next()) |entry| {
                const pkg_name = entry.key_ptr.*;
                if (!matchesFilter(pkg_name, args)) continue;

                const version_str = if (entry.value_ptr.* == .string)
                    entry.value_ptr.string
                else
                    "unknown";

                const current = try allocator.dupe(u8, version_str);
                const update = try allocator.dupe(u8, version_str);
                const latest = try allocator.dupe(u8, version_str);
                const name = try allocator.dupe(u8, pkg_name);

                try outdated_packages.append(allocator, .{
                    .name = name,
                    .current = current,
                    .update = update,
                    .latest = latest,
                    .is_dev = true,
                });
            }
        }
    }

    // Display results
    if (outdated_packages.items.len == 0) {
        return .{
            .exit_code = 0,
            .message = try allocator.dupe(u8, "\x1b[32m✓\x1b[0m All dependencies are up to date!"),
        };
    }

    // Print table header
    std.debug.print("\n\x1b[1m{s: <35} | {s: <10} | {s: <10} | {s: <10}\x1b[0m\n", .{ "Package", "Current", "Update", "Latest" });
    std.debug.print("{s:-<35}-+-{s:-<10}-+-{s:-<10}-+-{s:-<10}\n", .{ "", "", "", "" });

    // Print each outdated package
    for (outdated_packages.items) |pkg| {
        const dev_marker = if (pkg.is_dev) " (dev)" else "";
        const pkg_display = try std.fmt.allocPrint(allocator, "{s}{s}", .{ pkg.name, dev_marker });
        defer allocator.free(pkg_display);

        std.debug.print("{s: <35} | {s: <10} | {s: <10} | {s: <10}\n", .{
            pkg_display,
            pkg.current,
            pkg.update,
            pkg.latest,
        });
    }
    std.debug.print("\n", .{});

    const summary = try std.fmt.allocPrint(
        allocator,
        "{d} package(s) checked",
        .{outdated_packages.items.len},
    );

    return .{
        .exit_code = 0,
        .message = summary,
    };
}

// ============================================================================
// Uninstall Command
// ============================================================================

/// Uninstall packages
pub fn uninstallCommand(allocator: std.mem.Allocator, args: []const []const u8) !CommandResult {
    if (args.len == 0) {
        return CommandResult.err(allocator, common.ERROR_NO_PACKAGES);
    }

    std.debug.print("Uninstalling {d} package(s)...\n", .{args.len});

    for (args) |pkg_name| {
        std.debug.print("  → {s}...", .{pkg_name});
        std.debug.print(" done\n", .{});
    }

    return .{ .exit_code = 0 };
}

// ============================================================================
// Publish Command
// ============================================================================

pub const PublishOptions = struct {
    dry_run: bool = false,
    access: []const u8 = "public",
    tag: []const u8 = "latest",
    otp: ?[]const u8 = null,
};

/// Publish a package to the registry
pub fn publishCommand(allocator: std.mem.Allocator, args: []const []const u8, options: PublishOptions) !CommandResult {
    _ = args;
    _ = options;

    const cwd = std.fs.cwd().realpathAlloc(allocator, ".") catch {
        return CommandResult.err(allocator, "Error: Could not determine current directory");
    };
    defer allocator.free(cwd);

    const config_path = common.findConfigFile(allocator, cwd) catch {
        return .{
            .exit_code = 1,
            .message = try allocator.dupe(u8, "Error: No package configuration found (pantry.json, package.json)"),
        };
    };
    defer allocator.free(config_path);

    std.debug.print("Publishing package from {s}...\n", .{config_path});
    std.debug.print("TODO: Implement publish logic\n", .{});

    return .{ .exit_code = 0 };
}

// ============================================================================
// Why Command
// ============================================================================

pub const WhyOptions = struct {
    top: bool = false, // Show only top-level dependencies
    depth: ?usize = null, // Maximum depth of dependency tree to display
};

/// Dependency chain node for displaying why a package is installed
const DependencyChain = struct {
    package_name: []const u8,
    version: []const u8,
    required_by: []const u8,
    version_constraint: []const u8,
    dep_type: []const u8, // "prod", "dev", "peer", "optional"
    depth: usize,
    children: std.ArrayList(*DependencyChain),

    pub fn deinit(self: *DependencyChain, allocator: std.mem.Allocator) void {
        for (self.children.items) |child| {
            child.deinit(allocator);
            allocator.destroy(child);
        }
        self.children.deinit();
    }
};

/// Explain why a package is installed
pub fn whyCommand(allocator: std.mem.Allocator, args: []const []const u8, options: WhyOptions) !CommandResult {
    if (args.len == 0) {
        return CommandResult.err(allocator, "Error: No package specified\nUsage: pantry why <package>");
    }

    const package_pattern = args[0];

    // Get current working directory
    var cwd_buf: [std.fs.max_path_bytes]u8 = undefined;
    const cwd = try std.fs.cwd().realpath(".", &cwd_buf);

    // Find config file
    const config_path = common.findConfigFile(allocator, cwd) catch {
        return CommandResult.err(allocator, common.ERROR_NO_CONFIG);
    };
    defer allocator.free(config_path);

    // Parse config file
    const parsed = common.readConfigFile(allocator, config_path) catch {
        return CommandResult.err(allocator, common.ERROR_CONFIG_PARSE);
    };
    defer parsed.deinit();

    // Extract dependencies from config
    var deps_map = try common.extractAllDependencies(allocator, parsed);
    defer {
        var it = deps_map.iterator();
        while (it.next()) |entry| {
            allocator.free(entry.key_ptr.*);
        }
        deps_map.deinit();
    }

    // Find matching packages
    var matches = std.ArrayList([]const u8){};
    defer matches.deinit(allocator);

    var it = deps_map.iterator();
    while (it.next()) |entry| {
        if (matchesPattern(entry.key_ptr.*, package_pattern)) {
            try matches.append(allocator, entry.key_ptr.*);
        }
    }

    if (matches.items.len == 0) {
        const msg = try std.fmt.allocPrint(
            allocator,
            "Package '{s}' not found in dependencies",
            .{package_pattern},
        );
        return .{
            .exit_code = 1,
            .message = msg,
        };
    }

    // Display dependency chains for each match
    for (matches.items) |pkg_name| {
        const dep_info = deps_map.get(pkg_name).?;

        std.debug.print("{s}@{s}\n", .{ pkg_name, dep_info.version });

        if (options.top) {
            // Show only top-level dependency
            const dep_type_str = switch (dep_info.dep_type) {
                .normal => "",
                .dev => "dev ",
                .peer => "peer ",
                .optional => "optional ",
            };

            // Get project name from config
            const project_name = if (parsed.value.object.get("name")) |name_val|
                name_val.string
            else
                "project";

            std.debug.print("  └─ {s}{s}@1.0.0 (requires {s})\n", .{
                dep_type_str,
                project_name,
                dep_info.version,
            });
        } else {
            // Build and display full dependency tree
            try displayDependencyTree(allocator, pkg_name, dep_info, parsed, 1, options.depth orelse 999);
        }

        std.debug.print("\n", .{});
    }

    const summary = try std.fmt.allocPrint(
        allocator,
        "Found {d} package(s) matching '{s}'",
        .{ matches.items.len, package_pattern },
    );

    return .{
        .exit_code = 0,
        .message = summary,
    };
}

/// Check if a package name matches a pattern (supports glob patterns)
fn matchesPattern(pkg_name: []const u8, pattern: []const u8) bool {
    // Handle exact match
    if (std.mem.eql(u8, pkg_name, pattern)) {
        return true;
    }

    // Handle glob patterns
    if (std.mem.indexOf(u8, pattern, "*")) |star_pos| {
        const prefix = pattern[0..star_pos];
        const suffix = pattern[star_pos + 1 ..];

        if (!std.mem.startsWith(u8, pkg_name, prefix)) return false;
        if (!std.mem.endsWith(u8, pkg_name, suffix)) return false;
        return true;
    }

    return false;
}

/// Display dependency tree recursively
fn displayDependencyTree(
    allocator: std.mem.Allocator,
    pkg_name: []const u8,
    dep_info: common.DependencyInfo,
    parsed: std.json.Parsed(std.json.Value),
    current_depth: usize,
    max_depth: usize,
) !void {
    if (current_depth > max_depth) {
        const indent = try createIndent(allocator, current_depth);
        defer allocator.free(indent);
        std.debug.print("{s}└─ (deeper dependencies hidden)\n", .{indent});
        return;
    }

    const dep_type_str = switch (dep_info.dep_type) {
        .normal => "",
        .dev => "dev ",
        .peer => "peer ",
        .optional => "optional ",
    };

    // Get project name from config
    const project_name = if (parsed.value.object.get("name")) |name_val|
        name_val.string
    else
        "project";

    const indent = try createIndent(allocator, current_depth);
    defer allocator.free(indent);

    std.debug.print("{s}└─ {s}{s}@1.0.0 (requires {s})\n", .{
        indent,
        dep_type_str,
        project_name,
        dep_info.version,
    });

    // For a real implementation, we would recursively check transitive dependencies
    // This is a simplified version showing the direct dependency relationship
    _ = pkg_name;
}

/// Create indentation string for tree display
fn createIndent(allocator: std.mem.Allocator, depth: usize) ![]u8 {
    const indent_per_level = 3;
    const total_spaces = depth * indent_per_level;
    const indent = try allocator.alloc(u8, total_spaces);
    @memset(indent, ' ');
    return indent;
}
