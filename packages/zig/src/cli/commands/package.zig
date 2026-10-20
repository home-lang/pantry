//! Package management commands: remove, update, outdated, publish, list

const std = @import("std");
const io_helper = @import("../../io_helper.zig");
const lib = @import("../../lib.zig");
const common = @import("common.zig");
const token_commands = @import("token.zig");
const style = @import("../style.zig");
const workspace_publish = @import("workspace_publish.zig");
const publish_plan = @import("publish_plan.zig");
const publish_ignore = @import("publish_ignore.zig");

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
    const cwd = try io_helper.realpath(".", &cwd_buf);

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

    // Track removed and not found packages — use HashMap for O(1) dedup
    var removed_set = std.StringHashMap(void).init(allocator);
    defer removed_set.deinit();
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
                    if (!removed_set.contains(package_name)) {
                        try removed_set.put(package_name, {});
                        try removed_packages.append(allocator, package_name);
                    }
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
                    if (!removed_set.contains(package_name)) {
                        try removed_set.put(package_name, {});
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
            style.print("{s}✓{s} Removed {d} package(s):\n", .{ style.green, style.reset, removed_packages.items.len });
            for (removed_packages.items) |pkg| {
                style.print("  {s}−{s} {s}\n", .{ style.dim, style.reset, pkg });
            }
        }

        if (not_found_packages.items.len > 0) {
            style.print("{s}⚠{s} Not found in dependencies:\n", .{ style.yellow, style.reset });
            for (not_found_packages.items) |pkg| {
                style.print("  {s}−{s} {s}\n", .{ style.dim, style.reset, pkg });
            }
        }
    }

    // Remove from pantry
    if (!options.dry_run) {
        const modules_dir = try std.fs.path.join(allocator, &[_][]const u8{ cwd, "pantry" });
        defer allocator.free(modules_dir);

        for (removed_packages.items) |pkg| {
            var pd_buf: [std.fs.max_path_bytes]u8 = undefined;
            const pkg_dir = std.fmt.bufPrint(&pd_buf, "{s}/{s}", .{ modules_dir, pkg }) catch continue;
            io_helper.deleteTree(pkg_dir) catch {};
        }

        if (options.save and deps_modified) {
            try removeFromConfigFile(allocator, cwd, args);

            const project_root = try @import("../../deps/detector.zig").resolveProjectRoot(allocator, cwd);
            defer allocator.free(project_root);
            const lockfile_path = try std.fs.path.join(allocator, &[_][]const u8{ project_root, "pantry.lock" });
            defer allocator.free(lockfile_path);
            try updateLockfileAfterUninstall(allocator, lockfile_path, args);
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
    const cwd = try io_helper.realpath(".", &cwd_buf);

    // Find config file
    const config_path = common.findConfigFile(allocator, cwd) catch {
        return CommandResult.err(allocator, common.ERROR_NO_CONFIG);
    };
    defer allocator.free(config_path);

    if (!options.silent) {
        if (args.len > 0) {
            style.print("{s}📦 Updating specific packages{s}\n", .{ style.blue, style.reset });
            for (args) |pkg| {
                style.print("  → {s}\n", .{pkg});
            }
        } else {
            style.print("{s}📦 Updating all packages{s}\n", .{ style.blue, style.reset });
        }
        style.print("\n", .{});
    }

    // For now, delegate to install command
    const install = @import("install.zig");
    const install_options = install.InstallOptions{
        .production = options.production,
        .dev_only = false,
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
    const cwd = try io_helper.realpath(".", &cwd_buf);

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
            .message = try std.fmt.allocPrint(allocator, "{s}✓{s} All dependencies are up to date!", .{ style.green, style.reset }),
        };
    }

    // Print table header
    style.print("\n{s}{s: <35} | {s: <10} | {s: <10} | {s: <10}{s}\n", .{ style.bold, "Package", "Current", "Update", "Latest", style.reset });
    style.print("{s:-<35}-+-{s:-<10}-+-{s:-<10}-+-{s:-<10}\n", .{ "", "", "", "" });

    // Print each outdated package
    for (outdated_packages.items) |pkg| {
        const dev_marker = if (pkg.is_dev) " (dev)" else "";
        const pkg_display = try std.fmt.allocPrint(allocator, "{s}{s}", .{ pkg.name, dev_marker });
        defer allocator.free(pkg_display);

        style.print("{s: <35} | {s: <10} | {s: <10} | {s: <10}\n", .{
            pkg_display,
            pkg.current,
            pkg.update,
            pkg.latest,
        });
    }
    style.print("\n", .{});

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

    // Get current working directory
    const cwd = try io_helper.getCwdAlloc(allocator);
    defer allocator.free(cwd);

    // Resolve effective project root — in a workspace, packages are at workspace root
    const effective_root = try @import("../../deps/detector.zig").resolveProjectRoot(allocator, cwd);
    defer allocator.free(effective_root);

    // Build paths - packages are in pantry/
    const pantry_dir = try std.fmt.allocPrint(allocator, "{s}/pantry", .{effective_root});
    defer allocator.free(pantry_dir);

    const bin_dir = try std.fmt.allocPrint(allocator, "{s}/.bin", .{pantry_dir});
    defer allocator.free(bin_dir);

    // Load package registry to map names to domains
    const pkg_registry = @import("../../packages/generated.zig");

    const lockfile_path = try std.fmt.allocPrint(allocator, "{s}/pantry.lock", .{effective_root});
    defer allocator.free(lockfile_path);

    style.print("{s}➤{s} Uninstalling {d} package(s)...\n", .{ style.green, style.reset, args.len });

    var success_count: usize = 0;

    for (args) |pkg_name| {
        // Look up package domain from registry
        const pkg_info = pkg_registry.getPackageByName(pkg_name);
        const domain = if (pkg_info) |info| info.domain else pkg_name;

        const pkg_dir = try std.fmt.allocPrint(allocator, "{s}/{s}", .{ pantry_dir, domain });
        defer allocator.free(pkg_dir);

        var dir_removed = false;

        // Try to remove package directory (if it exists)
        if (io_helper.accessAbsolute(pkg_dir, .{})) |_| {
            io_helper.deleteTree(pkg_dir) catch |err| {
                style.print("{s}⚠{s}  {s} {s}(failed to remove directory: {}){s}\n", .{ style.yellow, style.reset, pkg_name, style.dim, err, style.reset });
            };
            dir_removed = true;

            // Remove symlinks from pantry/.bin - check if they're broken after removing pkg dir
            if (io_helper.openDirAbsoluteForIteration(bin_dir)) |dir_handle| {
                var dir = dir_handle;
                defer dir.close();
                var iter = dir.iterate();
                while (iter.next() catch null) |entry| {
                    if (entry.kind == .sym_link) {
                        const link_path = std.fmt.allocPrint(allocator, "{s}/{s}", .{ bin_dir, entry.name }) catch continue;
                        defer allocator.free(link_path);

                        // Check if symlink is now broken (target was in removed package)
                        io_helper.accessAbsolute(link_path, .{}) catch {
                            // Symlink is broken, remove it
                            io_helper.deleteFile(link_path) catch {};
                        };
                    }
                }
            } else |_| {}
        } else |_| {}

        style.print("{s}✓{s} {s}{s}\n", .{ style.green, style.reset, pkg_name, if (!dir_removed) " (from config only)" else "" });
        success_count += 1;
    }

    // Always remove packages from package.json/pantry.json and lockfile
    removeFromConfigFile(allocator, cwd, args) catch |err| {
        style.print("{s}⚠{s}  Failed to update config file: {}\n", .{ style.yellow, style.reset, err });
    };

    updateLockfileAfterUninstall(allocator, lockfile_path, args) catch |err| {
        style.print("{s}⚠{s}  Failed to update lockfile: {}\n", .{ style.yellow, style.reset, err });
    };

    style.print("\nRemoved {s}{d}{s} package(s)\n", .{ style.green, success_count, style.reset });

    return .{ .exit_code = 0 };
}

/// Remove packages from package.json or pantry.json
fn removeFromConfigFile(allocator: std.mem.Allocator, cwd: []const u8, packages: []const []const u8) !void {
    // Find config file
    const config_path = common.findConfigFile(allocator, cwd) catch return;
    defer allocator.free(config_path);

    // Read the config file content
    const content = try io_helper.readFileAlloc(allocator, config_path, 1024 * 1024);
    defer allocator.free(content);

    // Parse the JSON to verify structure and find packages
    const parsed = try std.json.parseFromSlice(std.json.Value, allocator, content, .{});
    defer parsed.deinit();

    if (parsed.value != .object) return;

    // Track which packages we found and need to remove
    var packages_to_remove = std.StringHashMap(void).init(allocator);
    defer packages_to_remove.deinit();

    for (packages) |pkg| {
        // Check if package is in dependencies
        if (parsed.value.object.get("dependencies")) |deps| {
            if (deps == .object and deps.object.contains(pkg)) {
                try packages_to_remove.put(pkg, {});
            }
        }
        // Check if package is in devDependencies
        if (parsed.value.object.get("devDependencies")) |deps| {
            if (deps == .object and deps.object.contains(pkg)) {
                try packages_to_remove.put(pkg, {});
            }
        }
    }

    if (packages_to_remove.count() == 0) return;

    // Rebuild JSON with packages removed
    // We need to manually reconstruct to preserve formatting as much as possible
    var output = std.ArrayList(u8).empty;
    defer output.deinit(allocator);

    try serializeJsonWithRemovals(allocator, &output, parsed.value, packages_to_remove);
    try output.append(allocator, '\n');

    // Write the updated content back
    const file = try io_helper.createFile(config_path, .{ .truncate = true });
    defer file.close(io_helper.io);
    try io_helper.writeAllToFile(file, output.items);
}

/// Serialize JSON value to output, removing specified packages from dependencies
fn serializeJsonWithRemovals(
    allocator: std.mem.Allocator,
    output: *std.ArrayList(u8),
    value: std.json.Value,
    packages_to_remove: std.StringHashMap(void),
) !void {
    switch (value) {
        .object => |obj| {
            try output.appendSlice(allocator, "{\n");
            var first = true;
            var iter = obj.iterator();
            while (iter.next()) |entry| {
                const key = entry.key_ptr.*;
                const val = entry.value_ptr.*;

                // Special handling for dependencies and devDependencies
                if (std.mem.eql(u8, key, "dependencies") or std.mem.eql(u8, key, "devDependencies")) {
                    if (val == .object) {
                        // Filter out packages to remove
                        var filtered_deps: std.json.ObjectMap = .empty;
                        defer filtered_deps.deinit(allocator);

                        var dep_iter = val.object.iterator();
                        while (dep_iter.next()) |dep_entry| {
                            if (!packages_to_remove.contains(dep_entry.key_ptr.*)) {
                                try filtered_deps.put(allocator, dep_entry.key_ptr.*, dep_entry.value_ptr.*);
                            }
                        }

                        // Only include the key if there are remaining deps
                        if (filtered_deps.count() > 0) {
                            if (!first) try output.appendSlice(allocator, ",\n");
                            first = false;
                            try output.appendSlice(allocator, "  \"");
                            try output.appendSlice(allocator, key);
                            try output.appendSlice(allocator, "\": {\n");

                            var dep_first = true;
                            var filtered_iter = filtered_deps.iterator();
                            while (filtered_iter.next()) |dep_entry| {
                                if (!dep_first) try output.appendSlice(allocator, ",\n");
                                dep_first = false;
                                try output.appendSlice(allocator, "    \"");
                                try output.appendSlice(allocator, dep_entry.key_ptr.*);
                                try output.appendSlice(allocator, "\": ");
                                try serializeValue(allocator, output, dep_entry.value_ptr.*, 2);
                            }
                            try output.appendSlice(allocator, "\n  }");
                        }
                        continue;
                    }
                }

                // Regular key-value pair
                if (!first) try output.appendSlice(allocator, ",\n");
                first = false;
                try output.appendSlice(allocator, "  \"");
                try output.appendSlice(allocator, key);
                try output.appendSlice(allocator, "\": ");
                try serializeValue(allocator, output, val, 1);
            }
            try output.appendSlice(allocator, "\n}");
        },
        else => try serializeValue(allocator, output, value, 0),
    }
}

/// Serialize a single JSON value
fn serializeValue(allocator: std.mem.Allocator, output: *std.ArrayList(u8), value: std.json.Value, depth: usize) !void {
    const indent = "  ";
    switch (value) {
        .null => try output.appendSlice(allocator, "null"),
        .bool => |b| try output.appendSlice(allocator, if (b) "true" else "false"),
        .integer => |i| {
            var buf: [32]u8 = undefined;
            const slice = std.fmt.bufPrint(&buf, "{d}", .{i}) catch "0";
            try output.appendSlice(allocator, slice);
        },
        .float => |f| {
            var buf: [64]u8 = undefined;
            const slice = std.fmt.bufPrint(&buf, "{d}", .{f}) catch "0";
            try output.appendSlice(allocator, slice);
        },
        .string => |s| {
            try output.append(allocator, '"');
            for (s) |c| {
                switch (c) {
                    '"' => try output.appendSlice(allocator, "\\\""),
                    '\\' => try output.appendSlice(allocator, "\\\\"),
                    '\n' => try output.appendSlice(allocator, "\\n"),
                    '\r' => try output.appendSlice(allocator, "\\r"),
                    '\t' => try output.appendSlice(allocator, "\\t"),
                    else => try output.append(allocator, c),
                }
            }
            try output.append(allocator, '"');
        },
        .array => |arr| {
            if (arr.items.len == 0) {
                try output.appendSlice(allocator, "[]");
            } else {
                try output.appendSlice(allocator, "[\n");
                for (arr.items, 0..) |item, i| {
                    for (0..depth + 1) |_| try output.appendSlice(allocator, indent);
                    try serializeValue(allocator, output, item, depth + 1);
                    if (i < arr.items.len - 1) try output.append(allocator, ',');
                    try output.append(allocator, '\n');
                }
                for (0..depth) |_| try output.appendSlice(allocator, indent);
                try output.append(allocator, ']');
            }
        },
        .object => |obj| {
            if (obj.count() == 0) {
                try output.appendSlice(allocator, "{}");
            } else {
                try output.appendSlice(allocator, "{\n");
                var first = true;
                var iter = obj.iterator();
                while (iter.next()) |entry| {
                    if (!first) try output.appendSlice(allocator, ",\n");
                    first = false;
                    for (0..depth + 1) |_| try output.appendSlice(allocator, indent);
                    try output.append(allocator, '"');
                    try output.appendSlice(allocator, entry.key_ptr.*);
                    try output.appendSlice(allocator, "\": ");
                    try serializeValue(allocator, output, entry.value_ptr.*, depth + 1);
                }
                try output.append(allocator, '\n');
                for (0..depth) |_| try output.appendSlice(allocator, indent);
                try output.append(allocator, '}');
            }
        },
        .number_string => |s| try output.appendSlice(allocator, s),
    }
}

/// Update lockfile after uninstalling packages - remove only the uninstalled entries
fn updateLockfileAfterUninstall(allocator: std.mem.Allocator, lockfile_path: []const u8, removed_packages: []const []const u8) !void {
    const lockfile_mod = @import("../../packages/lockfile.zig");

    // Try to read existing lockfile
    var lockfile = lockfile_mod.readLockfile(allocator, lockfile_path) catch |err| {
        // If no lockfile exists, nothing to update
        if (err == error.FileNotFound) return;
        return err;
    };
    defer lockfile.deinit(allocator);

    // Remove uninstalled packages from the lockfile
    for (removed_packages) |pkg_name| {
        // Lockfile keys are in format "name@version", so we need to find matching keys
        var keys_to_remove = std.ArrayList([]const u8).empty;
        defer keys_to_remove.deinit(allocator);

        var iter = lockfile.packages.iterator();
        while (iter.next()) |entry| {
            const key = entry.key_ptr.*;
            // Check if key starts with "pkg_name@"
            if (std.mem.startsWith(u8, key, pkg_name)) {
                // Verify it's followed by @ (not just a prefix match)
                if (key.len > pkg_name.len and key[pkg_name.len] == '@') {
                    keys_to_remove.append(allocator, key) catch continue;
                }
            }
        }

        // Remove the matching keys
        for (keys_to_remove.items) |key| {
            if (lockfile.packages.fetchRemove(key)) |kv| {
                // Free the entry
                var entry = kv.value;
                entry.deinit(allocator);
                allocator.free(kv.key);
            }
        }
    }

    // Write updated lockfile (keep it even if empty, like npm does)
    lockfile_mod.writeLockfile(allocator, &lockfile, lockfile_path) catch |err| {
        style.printWarn("Failed to write lockfile: {}\n", .{err});
    };

    // Sync build.zig.zon after removal
    {
        const zig_zon_sync = @import("../../deps/zig_zon_sync.zig");
        var proj_buf: [std.fs.max_path_bytes]u8 = undefined;
        const proj_dir = io_helper.realpath(".", &proj_buf) catch ".";
        zig_zon_sync.syncBuildZigZon(allocator, proj_dir, "pantry", false) catch {};
    }
}

// ============================================================================
// Publish Command
// ============================================================================

/// Classifying npm's "this version is taken" rejections. Kept in its own
/// file because it is pure string matching over a response body, and no test
/// target reaches this module's own test blocks — publish_conflict.zig is
/// where they actually run.
const publish_conflict = @import("publish_conflict.zig");
pub const ConflictKind = publish_conflict.ConflictKind;
pub const classifyConflict = publish_conflict.classifyConflict;

pub const PublishOptions = struct {
    /// Explicit CLI overrides. Null preserves publishConfig and registry defaults.
    access: ?[]const u8 = null,
    tag: ?[]const u8 = null,
    otp: ?[]const u8 = null,
    registry: []const u8 = "https://registry.pantry.dev", // Pantry registry (default)
    dry_run: bool = false,
    use_oidc: bool = true, // Try OIDC first, fallback to token
    provenance: bool = true, // Generate provenance metadata
    use_npm: bool = false, // Set to true to publish to npm instead
    skip: ?[]const u8 = null, // Comma-separated list of package directory names to skip
    github_release: bool = false, // Create a GitHub release after publishing
    release_files: ?[]const u8 = null, // Comma-separated file paths to attach to release
    /// Skip publishing a package whose target (name@version) is already on
    /// the registry. Massive speedup for monorepo releases that bump every
    /// package's version uniformly — most icon/leaf packages are unchanged
    /// and re-publishing them just wastes time and risks 429s. Currently
    /// honored for npm only (`--npm`).
    skip_existing: bool = true,
    /// Skip the package's own npm lifecycle scripts (prepublish, prepare,
    /// prepublishOnly, prepack, postpack, publish, postpublish). Mirrors
    /// `bun/npm publish --ignore-scripts`: use when dist is already built by a
    /// separate step and the packages' prepublishOnly (e.g. `tsc`) would fail
    /// or is redundant. npm path only.
    ignore_scripts: bool = false,
    /// Read a package back from the public registry after npm accepts it
    /// (metadata, then the whole tarball against its integrity) before
    /// reporting it published. `--no-readback` skips that on an accepted
    /// upload only, for a caller that checks every package itself afterwards
    /// (stacks' release confirms all 85 before promoting them): the readback
    /// took 40 to 80 seconds a package while the upload took about 8. An
    /// upload whose outcome is unknown (a dropped response, a 5xx, a
    /// conflict) is still read back, since that is how its outcome is learned.
    readback: bool = true,
    /// Set by a batch publish: an accepted upload is queued here instead of
    /// being read back at once, and the batch reads it back right before
    /// uploading a package that installs it, or after its last upload. The
    /// readback is npm's propagation delay, wall-clock rather than work - a
    /// stx release spent 100 to 120 seconds on each of its packages in turn,
    /// three stages of ten minutes - and queued, those delays overlap.
    deferred_readbacks: ?*ReadbackQueue = null,
};

pub const DeferredReadback = publish_plan.DeferredReadback;
pub const ReadbackQueue = publish_plan.ReadbackQueue;
const deferReadback = publish_plan.deferReadback;
const queuedDependency = publish_plan.queuedDependency;

/// Read one queued upload back from the public registry, as an immediate
/// readback would have: metadata, then the whole tarball against its integrity.
fn confirmDeferredReadback(allocator: std.mem.Allocator, item: *const DeferredReadback) bool {
    const registry = @import("../../auth/registry.zig");
    var client = registry.RegistryClient.init(allocator, item.registry_url) catch return false;
    defer client.deinit();
    const started = io_helper.getMilliTimestamp();
    const confirmed = client.confirmPublication(item.name, item.version, &item.integrity, npm_publish_timeout_ms) catch false;
    const elapsed = io_helper.getMilliTimestamp() - started;
    style.print("  {s}timings:{s} public readback of {s}@{s} {d}.{d}s\n", .{ style.dim, style.reset, item.name, item.version, @divFloor(elapsed, 1000), @divFloor(@mod(elapsed, 1000), 100) });
    if (confirmed) {
        style.print("✓ Published {s}@{s}\n", .{ item.name, item.version });
    } else {
        var buffer: [1024]u8 = undefined;
        if (publish_plan.pendingReport(&buffer, item.*)) |report| style.print("{s}", .{report}) else |_| style.print("  Error: {s}\n", .{publish_plan.pending_publication});
    }
    return confirmed;
}

fn resolveNpmAccess(explicit: ?[]const u8, configured: ?[]const u8, package_name: []const u8) []const u8 {
    return explicit orelse configured orelse if (package_name.len > 0 and package_name[0] == '@') "restricted" else "public";
}

fn resolveNpmTag(explicit: ?[]const u8, configured: ?[]const u8) []const u8 {
    return explicit orelse configured orelse "latest";
}

test "npm publish settings prefer CLI then publishConfig then defaults" {
    try std.testing.expectEqualStrings("public", resolveNpmAccess("public", "restricted", "@example/pkg"));
    try std.testing.expectEqualStrings("restricted", resolveNpmAccess(null, "restricted", "plain-pkg"));
    try std.testing.expectEqualStrings("restricted", resolveNpmAccess(null, null, "@example/pkg"));
    try std.testing.expectEqualStrings("public", resolveNpmAccess(null, null, "plain-pkg"));
    try std.testing.expectEqualStrings("next", resolveNpmTag("next", "beta"));
    try std.testing.expectEqualStrings("beta", resolveNpmTag(null, "beta"));
    try std.testing.expectEqualStrings("latest", resolveNpmTag(null, null));
}

/// Publish a package to the registry (npm).
/// Auto-detects monorepos (packages/ directory) and publishes all non-private packages.
pub fn publishCommand(allocator: std.mem.Allocator, args: []const []const u8, options: PublishOptions) !CommandResult {
    const cwd = io_helper.realpathAlloc(allocator, ".") catch {
        return CommandResult.err(allocator, "Error: Could not determine current directory");
    };
    defer allocator.free(cwd);

    // When explicit path/glob args are given, those are the packages to
    // publish (they need not live under packages/). Otherwise auto-detect a
    // monorepo (packages/ directory with package.json files).
    const registry_cmds = @import("registry.zig");
    const monorepo_packages = if (args.len > 0)
        registry_cmds.detectPackagesFromArgs(allocator, cwd, args, options.skip) catch null
    else
        registry_cmds.detectMonorepoPackages(allocator, cwd, options.skip) catch null;
    defer if (monorepo_packages) |pkgs| {
        for (pkgs) |*pkg| {
            var p = pkg.*;
            p.deinit(allocator);
        }
        allocator.free(pkgs);
    };

    if (monorepo_packages) |pkgs| {
        // Monorepo mode — publish each non-private package to npm

        // Sort packages by dependency order so that packages depended on by others
        // are published first (e.g., core before cli). Without this, `prepublishOnly`
        // scripts that import workspace siblings (like `tsc` resolving a workspace dep)
        // would fail because the dependency hasn't been built yet.
        sortPackagesByDependencyOrder(allocator, pkgs);

        if (args.len > 0) {
            style.print("{d} package(s) selected\n", .{pkgs.len});
        } else {
            style.print("Monorepo detected: {d} publishable package(s) in packages/\n", .{pkgs.len});
        }
        for (pkgs, 0..) |pkg, i| {
            style.print("  {d}. {s}\n", .{ i + 1, pkg.name });
        }
        style.print("----------------------------------------\n", .{});

        // Detect root files to propagate to packages that don't have their own
        const root_files = [_][]const u8{ "README.md", "LICENSE", "LICENSE.md" };
        var has_root_file: [root_files.len]bool = undefined;
        var root_file_paths: [root_files.len]?[]const u8 = undefined;
        for (root_files, 0..) |file_name, i| {
            const root_path = std.fs.path.join(allocator, &[_][]const u8{ cwd, file_name }) catch null;
            root_file_paths[i] = root_path;
            has_root_file[i] = if (root_path) |p| blk: {
                io_helper.accessAbsolute(p, .{}) catch break :blk false;
                break :blk true;
            } else false;
        }
        defer for (&root_file_paths) |*p| {
            if (p.*) |path| allocator.free(path);
        };

        // Accepted uploads waiting for their public readback (see
        // PublishOptions.deferred_readbacks).
        var readbacks: ReadbackQueue = .empty;
        defer {
            for (readbacks.items) |item| item.deinit(allocator);
            readbacks.deinit(allocator);
        }
        var batch_options = options;
        if (options.readback) batch_options.deferred_readbacks = &readbacks;

        var failed: usize = 0;
        var succeeded: usize = 0;
        var skipped: usize = 0;
        // Packages that did not publish in this run, so the ones that install
        // them can wait rather than go up uninstallable (publish_plan.zig).
        var failed_names: std.ArrayList([]const u8) = .empty;
        defer failed_names.deinit(allocator);

        for (pkgs) |pkg| {
            style.print("\nPublishing {s}...\n", .{pkg.name});

            if (io_helper.readFileAlloc(allocator, pkg.config_path, 10 * 1024 * 1024)) |manifest| {
                defer allocator.free(manifest);
                // A package that installs a queued upload waits for that
                // readback first, so it never goes up before what it
                // installs is public.
                while (queuedDependency(allocator, manifest, readbacks.items)) |index| {
                    const item = readbacks.orderedRemove(index);
                    defer item.deinit(allocator);
                    if (confirmDeferredReadback(allocator, &item)) continue;
                    failed += 1;
                    succeeded -|= 1;
                    for (pkgs) |other| {
                        if (std.mem.eql(u8, other.name, item.name)) failed_names.append(allocator, other.name) catch {};
                    }
                }
                if (publish_plan.heldBackBy(allocator, manifest, failed_names.items)) |dependency| {
                    style.print(
                        "  {s}↷{s} held back: it installs {s}, which didn't publish. Fix that and run again; what's already on npm is skipped.\n",
                        .{ style.yellow, style.reset, dependency },
                    );
                    style.print("----------------------------------------\n", .{});
                    failed += 1;
                    failed_names.append(allocator, pkg.name) catch {};
                    continue;
                }
            } else |_| {}

            // Propagate root files (README, LICENSE) to package if missing
            var copied_files: [root_files.len]?[]const u8 = @splat(null);
            for (root_files, 0..) |file_name, i| {
                if (!has_root_file[i]) continue;
                const pkg_file_path = std.fs.path.join(allocator, &[_][]const u8{ pkg.path, file_name }) catch continue;
                // Check if package already has its own copy
                io_helper.accessAbsolute(pkg_file_path, .{}) catch {
                    // Package doesn't have this file — copy from root
                    if (root_file_paths[i]) |root_path| {
                        if (io_helper.copyFile(root_path, pkg_file_path)) {
                            copied_files[i] = pkg_file_path;
                            style.print("  Copied root {s} to {s}\n", .{ file_name, pkg.name });
                        } else |_| {
                            allocator.free(pkg_file_path);
                        }
                    } else {
                        allocator.free(pkg_file_path);
                    }
                    continue;
                };
                // File exists in package — don't overwrite
                allocator.free(pkg_file_path);
            }

            const result = publishSingleToNpm(allocator, pkg.path, pkg.config_path, batch_options);

            // Cleanup: remove propagated files after publish
            for (&copied_files) |*cf| {
                if (cf.*) |path| {
                    io_helper.deleteFile(path) catch {};
                    allocator.free(path);
                    cf.* = null;
                }
            }

            // Detect rate-limit failures up front so we can extend the
            // inter-package cooldown before processing the result data.
            var rate_limited = false;
            var server_retry_after_ms: u64 = 0;
            var was_skipped = false;
            if (result) |r| {
                if (r.exit_code == 0) {
                    if (r.skipped) {
                        skipped += 1;
                        was_skipped = true;
                    } else {
                        succeeded += 1;
                    }
                } else {
                    failed += 1;
                    failed_names.append(allocator, pkg.name) catch {};
                    if (r.message) |msg| style.print("  Error: {s}\n", .{msg});
                    if (r.rate_limited) {
                        rate_limited = true;
                        server_retry_after_ms = @as(u64, r.retry_after_seconds) * 1000;
                    }
                }
                var res = r;
                res.deinit(allocator);
            } else |err| {
                failed += 1;
                failed_names.append(allocator, pkg.name) catch {};
                style.print("  Error: {any}\n", .{err});
            }
            style.print("----------------------------------------\n", .{});

            // Inter-package throttle: keeps us under Cloudflare's rolling
            // burst threshold for registry.npmjs.org. We observed sustained
            // publishes triggering 1015 errors after ~16 min at 750ms gap.
            // For a 220-package monorepo, 750ms × 220 = 165s of throttle —
            // well under that 16 min ceiling, and combined with per-publish
            // network time keeps full releases comfortably below it. Larger
            // monorepos (or back-to-back releases that share the rolling
            // window) auto-recover via the rate-limit handler below.
            //
            // After a rate-limited *failure*, sleep significantly longer
            // (server retry_after with a 60s floor). Cloudflare's IP-level
            // cooldown stays sticky after each 429, so going straight into
            // the next package guarantees more 429s until the cooldown
            // clears.
            //
            // Skipped packages cost us only one cheap GET (no PUT, no
            // tarball upload) so we don't need the publish throttle at
            // all — small fixed delay is enough to be polite to the
            // registry without serializing the no-op path.
            if (rate_limited) {
                const cooldown_ms: u64 = @max(server_retry_after_ms, @as(u64, 60_000));
                style.print(
                    "  {s}⏸{s} Rate-limited; pausing {d}s before next package to let Cloudflare cooldown clear...\n",
                    .{ style.yellow, style.reset, cooldown_ms / 1000 },
                );
                io_helper.sleepMs(cooldown_ms);
            } else if (was_skipped) {
                io_helper.sleepMs(50);
            } else {
                io_helper.sleepMs(750);
            }
        }

        // The rest have been propagating while later packages uploaded.
        if (readbacks.items.len > 0) style.print("\nReading back {d} accepted upload(s)\n", .{readbacks.items.len});
        for (readbacks.items) |*item| {
            if (confirmDeferredReadback(allocator, item)) continue;
            failed += 1;
            succeeded -|= 1;
        }

        style.print("\nPublished {d}/{d} packages", .{ succeeded, pkgs.len });
        if (skipped > 0) {
            // Skips cover both "already on the registry" and native/Zig
            // packages that don't publish to npm — keep the wording general.
            style.print(" ({d} skipped)", .{skipped});
        }
        if (failed > 0) {
            style.print(" ({d} failed)", .{failed});
        }
        style.print("\n", .{});

        if (options.github_release and succeeded > 0) {
            createGitHubRelease(allocator, options);
        }

        return .{ .exit_code = if (failed > 0) 1 else 0 };
    }

    // Explicit args were given but matched no publishable packages — error
    // rather than silently falling back to publishing the CWD.
    if (args.len > 0) {
        return CommandResult.err(allocator, "Error: No publishable packages matched the given path(s)/glob(s)");
    }

    // Single package mode — publish CWD
    const config_path = common.findConfigFile(allocator, cwd) catch {
        return .{
            .exit_code = 1,
            .message = try allocator.dupe(u8, "Error: No package configuration found (pantry.json, package.json)"),
        };
    };
    defer allocator.free(config_path);

    return publishSingleToNpm(allocator, cwd, config_path, options);
}

/// Whether an error from the registry HTTP client should be treated as
/// transient — caller should back off and retry rather than failing the
/// publish. Covers the socket-level write failures we've observed when
/// publishing 200+ packages back-to-back to registry.npmjs.org.
/// Errors raised before a connection exists, when nothing can have been sent.
fn isConnectionSetupError(err: anyerror) bool {
    return switch (err) {
        error.TlsInitializationFailed,
        error.ConnectionRefused,
        error.UnknownHostName,
        error.NameServerFailure,
        error.TemporaryNameServerFailure,
        error.NetworkUnreachable,
        error.HostUnreachable,
        => true,
        else => false,
    };
}

fn isTransientNetworkError(err: anyerror) bool {
    return switch (err) {
        error.WriteFailed,
        error.ConnectionResetByPeer,
        error.ConnectionTimedOut,
        error.Timeout,
        error.EndOfStream,
        error.NetworkUnreachable,
        // DNS hiccups on shared CI runners: getAddrInfo surfaces these when
        // resolving registry.npmjs.org mid-run. `NameServerFailure` (SERVFAIL)
        // and `TemporaryNameServerFailure` (TRY_AGAIN) are both retryable — a
        // single flaky lookup shouldn't fail one package out of a 74-pkg
        // release. We've observed `error.NameServerFailure` alone knocking out
        // exactly one package per publish.
        error.NameServerFailure,
        error.TemporaryNameServerFailure,
        error.UnknownHostName,
        error.HostLacksNetworkAddresses,
        => true,
        else => false,
    };
}

test "a bounded timeout before sending an upload is retryable" {
    try std.testing.expect(isTransientNetworkError(error.Timeout));
}

/// Reason a package should be skipped when publishing to npm, or null to publish.
///
/// Native (Zig) packages live on the Pantry registry, not npm: their source is
/// Zig + a prebuilt binary with no JavaScript entry, so pushing them to npm
/// ships a broken package. We auto-detect them by the presence of a `build.zig`
/// in the package directory. A package can override the auto-detection with
/// `"pantry": { "npm": true | false }` in its package.json (true forces an npm
/// publish even with a build.zig; false skips npm regardless).
pub fn npmSkipReason(allocator: std.mem.Allocator, package_dir: []const u8, config_path: []const u8) ?[]const u8 {
    // Explicit override: package.json "pantry": { "npm": bool }.
    if (io_helper.readFileAlloc(allocator, config_path, 10 * 1024 * 1024)) |content| {
        defer allocator.free(content);
        if (std.json.parseFromSlice(std.json.Value, allocator, content, .{})) |parsed| {
            defer parsed.deinit();
            if (parsed.value == .object) {
                if (parsed.value.object.get("pantry")) |p| {
                    if (p == .object) {
                        if (p.object.get("npm")) |n| {
                            if (n == .bool) return if (n.bool) null else "pantry.npm=false";
                        }
                    }
                }
            }
        } else |_| {}
    } else |_| {}

    // Auto-detect native Zig packages by the presence of build.zig.
    const build_zig = std.fs.path.join(allocator, &[_][]const u8{ package_dir, "build.zig" }) catch return null;
    defer allocator.free(build_zig);
    io_helper.accessAbsolute(build_zig, .{}) catch return null;
    return "native Zig package — publishes to the Pantry registry, not npm";
}

fn completeVerifiedNpmPublication(
    allocator: std.mem.Allocator,
    name: []const u8,
    version: []const u8,
    scripts: ?std.json.ObjectMap,
    package_dir: []const u8,
    options: PublishOptions,
) CommandResult {
    const queued = if (options.deferred_readbacks) |queue| queue.items.len > 0 and std.mem.eql(u8, queue.items[queue.items.len - 1].name, name) and std.mem.eql(u8, queue.items[queue.items.len - 1].version, version) else false;
    style.print("\n✓ {s} {s}@{s}\n", .{ if (queued) "Uploaded" else "Published", name, version });
    if (!options.ignore_scripts) {
        if (scripts) |configured| {
            _ = lib.lifecycle.runPostPublishScripts(allocator, configured, package_dir);
        }
    }
    if (options.github_release) createGitHubRelease(allocator, options);
    return .{ .exit_code = 0 };
}

fn publishSingleToNpm(
    allocator: std.mem.Allocator,
    package_dir: []const u8,
    config_path: []const u8,
    options: PublishOptions,
) !CommandResult {
    // Native/Zig packages don't belong on npm — skip before doing any work.
    if (npmSkipReason(allocator, package_dir, config_path)) |reason| {
        style.print("\n{s}↷{s} skipping npm publish — {s}\n", .{ style.dim, style.reset, reason });
        return .{ .exit_code = 0, .skipped = true };
    }

    // Import auth modules
    const registry = @import("../../auth/registry.zig");
    const publish_lib = @import("../../packages/publish.zig");

    // Extract package metadata
    const metadata = publish_lib.extractMetadata(allocator, config_path) catch |err| {
        const err_msg = try std.fmt.allocPrint(
            allocator,
            "Error: Failed to extract package metadata: {any}",
            .{err},
        );
        return CommandResult.err(allocator, err_msg);
    };
    defer {
        var mut_metadata = metadata;
        mut_metadata.deinit(allocator);
    }

    // Validate package metadata
    publish_lib.validatePackageName(metadata.name) catch {
        return CommandResult.err(allocator, "Error: Invalid package name");
    };

    publish_lib.validateVersion(metadata.version) catch {
        return CommandResult.err(allocator, "Error: Invalid package version");
    };

    style.print("Publishing {s}@{s}...\n\n", .{ metadata.name, metadata.version });

    // Determine registry URL (priority: CLI flag > publishConfig > default)
    const registry_url = if (!std.mem.eql(u8, options.registry, "https://registry.npmjs.org"))
        options.registry // CLI flag takes precedence
    else if (metadata.publish_config) |pc|
        pc.registry orelse options.registry // Use publishConfig if available
    else
        options.registry; // Fall back to default

    // Skip-if-already-published pre-check.
    //
    // Workspace releases bump every package's version even when the package
    // itself didn't change. Without this check, every release republishes
    // ~all N packages serially — burning ~1h of CI time and tripping
    // Cloudflare's 1015 rate-limit on registry.npmjs.org. A cheap GET to
    // `/{pkg}/{version}` lets us short-circuit on packages whose target
    // version is already on the registry.
    //
    // Off by default for non-npm registries (we only know the npm response
    // semantics — Pantry's own registry uses a different shape). Only a
    // confirmed missing version permits a new upload. A failed availability
    // lookup must not turn an accepted version into a duplicate PUT.
    // Private metadata requires the credential obtained by the publication
    // path below. Keep the cheap anonymous precheck for public packages only;
    // authenticated immutable-version conflicts still verify before skipping.
    const precheck_access = resolveNpmAccess(options.access, if (metadata.publish_config) |pc| pc.access else null, metadata.name);
    if (options.skip_existing and std.mem.eql(u8, precheck_access, "public")) {
        var precheck_client = registry.RegistryClient.init(allocator, registry_url) catch |err| return .{
            .exit_code = 1,
            .message = try std.fmt.allocPrint(allocator, "Public version availability could not be verified: {s}. Upload was not started.", .{@errorName(err)}),
        };
        defer precheck_client.deinit();
        const exists = precheck_client.versionExists(metadata.name, metadata.version) catch |err| return .{
            .exit_code = 1,
            .message = try std.fmt.allocPrint(allocator, "Public version availability could not be verified: {s}. Upload was not started.", .{@errorName(err)}),
        };
        if (exists) {
            if (!try precheck_client.confirmPublication(metadata.name, metadata.version, null, npm_publish_timeout_ms)) {
                return CommandResult.err(allocator, "Existing version is pending public tarball availability. Do not upload this version again.");
            }
            style.print("\n{s}↷{s} {s}@{s} already published — skipping\n", .{ style.dim, style.reset, metadata.name, metadata.version });
            return .{ .exit_code = 0, .skipped = true };
        }
    }

    // Parse package.json for lifecycle scripts
    const config_content = io_helper.readFileAlloc(allocator, config_path, 10 * 1024 * 1024) catch null;
    defer if (config_content) |c| allocator.free(c);

    const parsed_config = if (config_content) |content|
        std.json.parseFromSlice(std.json.Value, allocator, content, .{}) catch null
    else
        null;
    defer if (parsed_config) |p| p.deinit();

    // Get scripts object for lifecycle hooks
    const scripts_obj: ?std.json.ObjectMap = if (parsed_config) |p| blk: {
        if (p.value != .object) break :blk null;
        const scripts_val = p.value.object.get("scripts") orelse break :blk null;
        if (scripts_val != .object) break :blk null;
        break :blk scripts_val.object;
    } else null;

    // Run pre-publish lifecycle scripts: prepublish → prepare → prepublishOnly → prepack
    if (!options.ignore_scripts) {
        if (scripts_obj) |scripts| {
            if (!lib.lifecycle.runPrePublishScripts(allocator, scripts, package_dir)) {
                return CommandResult.err(allocator, "Pre-publish lifecycle script failed");
            }
        }
    }

    // Create tarball
    const tarball_info = createTarball(allocator, package_dir, metadata.name, metadata.version) catch |err| {
        if (err == error.UnresolvableWorkspaceDependency) {
            return CommandResult.err(allocator, "Error: Could not resolve workspace: protocol ranges (see details above).");
        }
        return err;
    };
    defer allocator.free(tarball_info.path);
    defer io_helper.deleteFile(tarball_info.path) catch {};

    // Print tarball summary (bun-style)
    style.print("Total files: {d}\n", .{tarball_info.total_files});
    style.print("Shasum: {s}\n", .{&tarball_info.shasum});
    style.print("Integrity: {s}\n", .{&tarball_info.integrity});
    var unpacked_buf: [32]u8 = undefined;
    var packed_buf: [32]u8 = undefined;
    style.print("Unpacked size: {s}\n", .{formatSize(&unpacked_buf, tarball_info.unpacked_size)});
    style.print("Packed size: {s}\n", .{formatSize(&packed_buf, tarball_info.packed_size)});

    // Run postpack script (after tarball creation)
    if (!options.ignore_scripts) {
        if (scripts_obj) |scripts| {
            if (!lib.lifecycle.runPostPackScripts(allocator, scripts, package_dir)) {
                return CommandResult.err(allocator, "postpack lifecycle script failed");
            }
        }
    }

    // Print publish config
    const configured_tag = if (metadata.publish_config) |pc| pc.tag else null;
    const tag_str = resolveNpmTag(options.tag, configured_tag);
    style.print("\nTag: {s}\n", .{tag_str});

    // Determine access level
    const configured_access = if (metadata.publish_config) |pc| pc.access else null;
    const access_str = resolveNpmAccess(options.access, configured_access, metadata.name);
    if (!std.mem.eql(u8, access_str, "public") and !std.mem.eql(u8, access_str, "restricted")) {
        return CommandResult.err(allocator, "Error: npm access must be 'public' or 'restricted'");
    }
    if (tag_str.len == 0) {
        return CommandResult.err(allocator, "Error: npm dist-tag cannot be empty");
    }
    style.print("Access: {s}\n", .{access_str});
    style.print("Registry: {s}\n", .{registry_url});

    if (options.dry_run) {
        style.print("\n{s}Dry run:{s} package prepared successfully; skipping npm authentication and upload.\n", .{ style.cyan, style.reset });
        return .{ .exit_code = 0 };
    }

    // Initialize registry client
    var registry_client = try registry.RegistryClient.init(allocator, registry_url);
    defer registry_client.deinit();
    registry_client.publish_access = access_str;
    registry_client.publish_tag = tag_str;
    registry_client.publish_otp = options.otp;

    // Set package.json content so npm metadata includes all fields
    // (types, exports, module, dependencies, bin, etc.)
    // Resolve workspace and catalog protocol deps so npm metadata matches the
    // staged tarball and contains only registry-installable ranges.
    const resolved_pkg_json = if (config_content) |content|
        workspace_publish.rewriteManifestContent(allocator, content, package_dir) catch |err| {
            if (err == error.UnresolvableWorkspaceDependency) {
                return CommandResult.err(allocator, "Error: Could not resolve workspace/catalog protocol ranges (see details above).");
            }
            return err;
        }
    else
        null;
    defer if (resolved_pkg_json) |r| {
        if (config_content) |c| {
            if (r.ptr != c.ptr) allocator.free(r);
        }
    };
    registry_client.package_json = resolved_pkg_json;

    // Try OIDC authentication first if enabled
    if (options.use_oidc) {
        var result = try attemptOIDCPublishWithTimeout(
            allocator,
            &registry_client,
            metadata.name,
            metadata.version,
            tarball_info.path,
            options.provenance,
            npm_publish_timeout_ms,
        );
        defer result.deinit(allocator);

        if (result.success) {
            const deferred = options.readback and options.deferred_readbacks != null;
            if (deferred) try deferReadback(allocator, options.deferred_readbacks.?, metadata.name, metadata.version, tarball_info.shasum, tarball_info.integrity, registry_url);
            const confirm_started = io_helper.getMilliTimestamp();
            const confirmed = !options.readback or deferred or try registry_client.confirmPublication(metadata.name, metadata.version, &tarball_info.integrity, npm_publish_timeout_ms);
            const confirm_ms = io_helper.getMilliTimestamp() - confirm_started;
            if (deferred)
                style.print("  {s}accepted by npm; read back once a package needs it or the batch is uploaded{s}\n", .{ style.dim, style.reset })
            else if (options.readback)
                style.print("  {s}timings:{s} public readback {d}.{d}s\n", .{ style.dim, style.reset, @divFloor(confirm_ms, 1000), @divFloor(@mod(confirm_ms, 1000), 100) })
            else
                style.print("  {s}accepted by npm; public readback left to the caller (--no-readback){s}\n", .{ style.dim, style.reset });
            if (!confirmed) {
                return CommandResult.err(allocator, publish_plan.pending_publication);
            }
            // A queued readback reports "Published" when it confirms.
            const done = if (deferred) "Uploaded" else "Published";
            if (result.provenance) {
                style.print("\n✓ Sigstore provenance attached\n", .{});
                style.print("✓ {s} {s}@{s} with provenance\n", .{ done, metadata.name, metadata.version });
            } else if (options.provenance) {
                style.print("\n✓ {s} {s}@{s}\n", .{ done, metadata.name, metadata.version });
                style.print("  {s}⚠{s} without provenance: signing it failed\n", .{ style.yellow, style.reset });
            } else {
                style.print("\n✓ {s} {s}@{s}\n", .{ done, metadata.name, metadata.version });
            }
            // Run post-publish scripts: publish → postpublish
            if (!options.ignore_scripts) {
                if (scripts_obj) |scripts| {
                    _ = lib.lifecycle.runPostPublishScripts(allocator, scripts, package_dir);
                }
            }
            if (options.github_release) {
                createGitHubRelease(allocator, options);
            }
            return .{ .exit_code = 0 };
        } else {
            // OIDC failed - check if it's a definitive registry rejection or just an auth issue
            if (result.is_version_conflict) {
                // `skip_existing` is the monorepo-release mode: the caller
                // already agreed that a version which is on the registry is a
                // SKIP, not a failure — that is what the pre-check above does.
                // A conflict here means the pre-check's GET disagreed with the
                // PUT, which happens when the version was published between
                // the two, or is staged and not yet readable. Failing the run
                // for it contradicts the pre-check and, mid-release, strands
                // the packages that already went out.
                if (options.skip_existing) {
                    if (!try registry_client.confirmPublication(metadata.name, metadata.version, null, npm_publish_timeout_ms)) {
                        return CommandResult.err(allocator, "Claimed version is pending public metadata and tarball availability. Do not upload this version again.");
                    }
                    style.print("\n{s}↷{s} {s}@{s} already claimed on npm — skipping\n", .{ style.dim, style.reset, metadata.name, metadata.version });
                    return .{ .exit_code = 0, .skipped = true };
                }
                const err_msg = try std.fmt.allocPrint(
                    allocator,
                    "Error: Version {s} already exists on npm.\nBump the version in package.json before publishing (e.g., 'npm version patch').",
                    .{metadata.version},
                );
                return CommandResult.err(allocator, err_msg);
            }

            if (classifyOidcFailure(result.status_code) == .definitive) {
                const err_msg = result.error_message orelse "Publish rejected by registry";
                style.print("\n{d} {s}\n", .{
                    result.status_code,
                    err_msg,
                });
                return CommandResult.err(allocator, try allocator.dupe(u8, err_msg));
            }

            // A failed publish is not the same as an unpublished package.
            //
            // npm accepts the upload, then commits the version asynchronously.
            // Under a large monorepo release the commit can land a minute or
            // more after the request we were reading has already errored, so a
            // response we could not read says nothing about whether the version
            // exists. It did in the stacksjs/stacks 0.72.57 release: two of 82
            // packages reported "OIDC publish failed", the run exited 1 — and
            // both versions were on npm, carrying Sigstore provenance naming
            // that very run as the builder. OIDC had worked; only our reading
            // of it had not.
            //
            // So ask the registry before believing the error. Only on this
            // path: a definitive rejection above never published anything, and
            // the success path never gets here. Nor does a failure that came
            // before the upload — no CI provider, a token npm would not
            // exchange for a package with no trusted publisher — which used to
            // wait two minutes per package for a version that was never sent.
            if (result.sent and try registry_client.confirmPublication(metadata.name, metadata.version, &tarball_info.integrity, npm_publish_timeout_ms)) {
                style.print(
                    "\n{s}✓{s} {s}@{s} is on the registry — the publish landed, the response did not\n",
                    .{ style.green, style.reset, metadata.name, metadata.version },
                );
                if (!options.ignore_scripts) {
                    if (scripts_obj) |scripts| {
                        _ = lib.lifecycle.runPostPublishScripts(allocator, scripts, package_dir);
                    }
                }
                if (options.github_release) {
                    createGitHubRelease(allocator, options);
                }
                return .{ .exit_code = 0 };
            }
            if (result.sent) {
                return CommandResult.err(allocator, "Upload outcome is pending public verification. Do not send another upload while this version may be staged.");
            }

            // Genuinely not published. Say what actually went wrong rather than
            // asserting a cause: this branch takes every non-definitive status,
            // and blaming trusted publishing for a 500 or a dropped connection
            // sends people to a settings page that was never the problem.
            if (result.error_message) |msg| {
                style.print("\nOIDC publish failed ({d}): {s}\n", .{ result.status_code, msg });
            } else {
                style.print("\nOIDC publish failed ({d}).\n", .{result.status_code});
            }
            if (result.status_code == 401 or result.status_code == 404) {
                style.print("If this package has no trusted publisher, configure one:\n", .{});
                style.print("  https://www.npmjs.com/package/{s}/access\n", .{metadata.name});
            }
            style.print("\nFalling back to token authentication...\n", .{});
        }
    }

    // Fallback to token authentication. Accept the environment variable names
    // used by npm, setup-node, and Bun so workflows do not need package-manager
    // specific glue just to publish.
    const auth_token = readNpmAuthToken(allocator, true) catch |err| {
        if (err == error.EnvironmentVariableNotFound or err == error.FileNotFound or err == error.EndOfStream) {
            // Check if running in CI (non-interactive)
            const is_ci = io_helper.getEnvVarOwned(allocator, "CI") catch null;
            if (is_ci) |ci| {
                allocator.free(ci);
                return CommandResult.err(
                    allocator,
                    \\Error: No authentication method available in CI.
                    \\
                    \\Ensure NPM_TOKEN is set in your repository:
                    \\  gh secret set NPM_TOKEN
                    \\
                    \\Pantry also accepts NODE_AUTH_TOKEN and BUN_AUTH_TOKEN.
                    \\Standard project and user npmrc tokens are also supported.
                    \\Or configure OIDC trusted publishing on npm.
                    ,
                );
            }
            return CommandResult.err(
                allocator,
                \\Error: No authentication method available.
                \\
                \\To fix this, you can either:
                \\  1. Set NPM_TOKEN, NODE_AUTH_TOKEN, or BUN_AUTH_TOKEN
                \\  2. Configure a project or user npmrc auth token
                \\  3. Create ~/.pantry/credentials with your npm token:
                \\     NPM_TOKEN=npm_xxxxxxxxxxxx
                \\  4. Use OIDC trusted publishing in GitHub Actions
                \\
                \\Get your npm token from: https://www.npmjs.com/settings/tokens
                ,
            );
        }
        return CommandResult.err(allocator, "Error: Failed to read auth token");
    };
    defer allocator.free(auth_token);

    // Publish with retry-on-rate-limit. Cloudflare in front of registry.npmjs.org
    // returns 429 on burst publishes (a real risk in monorepo mode publishing
    // hundreds of packages in a row). Retry explicit rate-limit rejections and
    // pre-upload network failures with bounded exponential backoff. Ambiguous
    // post-upload outcomes require verification and must never resend bytes.
    const max_publish_attempts: u8 = 8;
    var publish_attempt: u8 = 0;
    const response = blk: while (true) {
        publish_attempt += 1;
        const r = registry_client.publishWithTokenTimeout(
            metadata.name,
            metadata.version,
            tarball_info.path,
            auth_token,
            npm_publish_timeout_ms,
        ) catch |err| {
            // A request can commit before its response fails. Never send a
            // second PUT after bytes may have reached the registry.
            if (registry_client.token_upload_started) {
                if (try registry_client.confirmPublication(metadata.name, metadata.version, &tarball_info.integrity, npm_publish_timeout_ms)) {
                    return completeVerifiedNpmPublication(allocator, metadata.name, metadata.version, scripts_obj, package_dir, options);
                }
                return CommandResult.err(allocator, "Upload outcome is pending public verification. Do not send another upload while this version may be staged.");
            }
            // Transient network errors before any upload can be retried.
            // Transient network errors (WriteFailed, ConnectionResetByPeer,
            // EndOfStream, etc.) — treat like a retryable HTTP failure and
            // back off exponentially before reattempting. Without this we
            // give up on a single flaky socket and the package never lands.
            if (publish_attempt < max_publish_attempts and isTransientNetworkError(err)) {
                const backoff_ms: u64 = @as(u64, 5_000) << @as(u6, @intCast(publish_attempt - 1));
                style.print(
                    "  {s}⚠{s} Network error: {any} (attempt {d}/{d}); retrying in {d}s...\n",
                    .{ style.yellow, style.reset, err, publish_attempt, max_publish_attempts, backoff_ms / 1000 },
                );
                io_helper.sleepMs(backoff_ms);
                continue;
            }
            // Final / non-transient failure — surface as a rate-limited-ish
            // result so the monorepo loop applies the cooldown (the npm
            // endpoint may be unhealthy more broadly).
            const err_msg = try std.fmt.allocPrint(
                allocator,
                "Error: Failed to publish package: {any}",
                .{err},
            );
            return .{
                .exit_code = 1,
                .message = err_msg,
                .rate_limited = isTransientNetworkError(err),
                .retry_after_seconds = 0,
            };
        };
        // A server error, request timeout, or redirect can follow a committed
        // write. Read back the exact tarball instead of repeating the PUT.
        if (r.status_code == 408 or (r.status_code >= 500 and r.status_code < 600) or (r.status_code >= 300 and r.status_code < 400)) {
            var owned_response = r;
            defer owned_response.deinit(allocator);
            if (try registry_client.confirmPublication(metadata.name, metadata.version, &tarball_info.integrity, npm_publish_timeout_ms)) {
                return completeVerifiedNpmPublication(allocator, metadata.name, metadata.version, scripts_obj, package_dir, options);
            }
            return CommandResult.err(allocator, "Upload outcome is pending public verification. Do not send another upload while this version may be staged.");
        }
        if (r.success or !r.isRetryable() or publish_attempt >= max_publish_attempts) {
            break :blk r;
        }
        // Free the retryable failure response before sleeping + retrying.
        var mut_r = r;
        // Exponential backoff floor (5s, 10s, 20s, 40s, 80s) raised to the
        // server-suggested retry_after when present. Cloudflare's 429 body
        // contains `retry_after: 30` and ignoring it means we keep retrying
        // before the IP-level cooldown clears.
        const backoff_ms: u64 = @as(u64, 5_000) << @as(u6, @intCast(publish_attempt - 1));
        const server_ms: u64 = if (r.retry_after_seconds) |s| @as(u64, s) * 1000 else 0;
        const wait_ms: u64 = @max(backoff_ms, server_ms);
        if (server_ms > backoff_ms) {
            style.print(
                "  {s}⚠{s} Registry returned {d} (attempt {d}/{d}); honoring retry_after, waiting {d}s...\n",
                .{ style.yellow, style.reset, r.status_code, publish_attempt, max_publish_attempts, wait_ms / 1000 },
            );
        } else {
            style.print(
                "  {s}⚠{s} Registry returned {d} (attempt {d}/{d}); retrying in {d}s...\n",
                .{ style.yellow, style.reset, r.status_code, publish_attempt, max_publish_attempts, wait_ms / 1000 },
            );
        }
        mut_r.deinit(allocator);
        io_helper.sleepMs(wait_ms);
    };
    defer {
        var mut_response = response;
        mut_response.deinit(allocator);
    }

    if (response.success) {
        if (options.readback and options.deferred_readbacks != null) {
            try deferReadback(allocator, options.deferred_readbacks.?, metadata.name, metadata.version, tarball_info.shasum, tarball_info.integrity, registry_url);
            style.print("  {s}accepted by npm; read back once a package needs it or the batch is uploaded{s}\n", .{ style.dim, style.reset });
        } else if (options.readback and !try registry_client.confirmPublication(metadata.name, metadata.version, &tarball_info.integrity, npm_publish_timeout_ms)) {
            return CommandResult.err(allocator, publish_plan.pending_publication);
        }
        return completeVerifiedNpmPublication(allocator, metadata.name, metadata.version, scripts_obj, package_dir, options);
    } else {
        // Check for version conflict (npm returns 403 with EPUBLISHCONFLICT or conflict text)
        var is_version_conflict = false;
        if (response.error_details) |details| {
            if (details.code) |code| {
                if (std.mem.eql(u8, code, "EPUBLISHCONFLICT")) {
                    is_version_conflict = true;
                }
            }
        }
        // Also check response body text for version conflict indicators
        // (403 for already-published, 409 for staged-but-not-yet-readable).
        const conflict_kind = classifyConflict(
            if (response.error_details) |d| d.code else null,
            response.message,
        );
        if (conflict_kind != .none) is_version_conflict = true;

        if (is_version_conflict) {
            // See the OIDC path above: under `skip_existing` a conflict is the
            // pre-check losing a race, not a mistake worth failing over.
            if (options.skip_existing) {
                if (!try registry_client.confirmPublication(metadata.name, metadata.version, null, npm_publish_timeout_ms)) {
                    return CommandResult.err(allocator, "Claimed version is pending public metadata and tarball availability. Do not upload this version again.");
                }
                const why: []const u8 = if (conflict_kind == .staged)
                    "already claimed and verified"
                else
                    "already published";
                style.print("\n{s}↷{s} {s}@{s} {s} — skipping\n", .{ style.dim, style.reset, metadata.name, metadata.version, why });
                return .{ .exit_code = 0, .skipped = true };
            }
            style.print("\nError: Version {s} of {s} already exists on npm.\n", .{ metadata.version, metadata.name });
            style.print("Bump the version in package.json before publishing (e.g., 'npm version patch').\n", .{});
            const err_msg = try std.fmt.allocPrint(
                allocator,
                "Version {s} already exists on npm",
                .{metadata.version},
            );
            return CommandResult.err(allocator, err_msg);
        }

        // Clean error output: "{status} {status_text}: {url}\n - {message}"
        const status_text: []const u8 = switch (response.status_code) {
            401 => "Unauthorized",
            403 => "Forbidden",
            404 => "Not Found",
            409 => "Conflict",
            422 => "Unprocessable Entity",
            else => "Error",
        };

        const error_summary = blk: {
            if (response.error_details) |d| {
                if (d.summary) |s| break :blk s;
            }
            // Fallback: try to extract a readable message from the raw response body
            if (response.message) |msg| {
                // If it's JSON, try to pull out "error" field directly
                if (std.json.parseFromSlice(std.json.Value, allocator, msg, .{})) |parsed| {
                    defer parsed.deinit();
                    if (parsed.value == .object) {
                        if (parsed.value.object.get("error")) |err_val| {
                            if (err_val == .string and err_val.string.len > 0) {
                                break :blk allocator.dupe(u8, err_val.string) catch msg;
                            }
                        }
                    }
                } else |_| {}
                // Not JSON or no error field — show raw body (truncated)
                if (msg.len > 0 and msg.len < 1024) break :blk msg;
            }
            break :blk "Unknown error";
        };

        style.print("\n{d} {s}: {s}/{s}\n", .{ response.status_code, status_text, registry_url, metadata.name });
        style.print(" - {s}\n", .{error_summary});

        // npm often returns 404 for token auth failures so private package
        // names do not leak. Make the actionable path explicit.
        if (response.status_code == 401 or response.status_code == 404) {
            style.print("\nHint: npm token authentication failed for {s}.\n", .{metadata.name});
            style.print("Create an npm Automation or granular access token with read/write access to this package, then store it as NPM_TOKEN.\n", .{});
            style.print("You can also configure OIDC trusted publishing for this package with:\n", .{});
            style.print("  pantry publisher:add --package {s} --owner <owner> --repository <repo> --workflow .github/workflows/release.yml\n", .{metadata.name});
            style.print("Verify tokens at: https://www.npmjs.com/settings/tokens\n", .{});
        }
        if (publish_plan.missingScope(metadata.name, error_summary)) |scope| {
            style.print("\nThe {s} scope doesn't exist on npm, or this account isn't a member of it.\n", .{scope});
            style.print("No token can publish there until it does: create the organization at\n", .{});
            style.print("  https://www.npmjs.com/org/create\n", .{});
            style.print("and add the account that publishes.\n", .{});
        }

        style.print("Registry: {s}\n", .{registry_url});

        const err_msg = try std.fmt.allocPrint(
            allocator,
            "{d} {s}: {s}",
            .{ response.status_code, status_text, error_summary },
        );
        // Surface rate-limit / retry-after info to the monorepo loop so it
        // can extend the inter-package throttle. Without this, every
        // remaining package starts publishing immediately after this one
        // gives up — and Cloudflare's IP-level cooldown is still active.
        return .{
            .exit_code = 1,
            .message = err_msg,
            .rate_limited = response.isRetryable(),
            .retry_after_seconds = response.retry_after_seconds orelse 0,
        };
    }
}

/// Create a GitHub release (non-fatal: warnings only, never fails the command).
fn createGitHubRelease(allocator: std.mem.Allocator, options: PublishOptions) void {
    const github = @import("../../auth/github.zig");

    // 1. Detect context (tag, owner/repo)
    var ctx = github.detectGitHubContext(allocator) orelse {
        style.printWarn("GitHub release: could not detect tag/repo (not in a tagged CI build?)\n", .{});
        return;
    };
    defer ctx.deinit(allocator);

    // 2. Get GITHUB_TOKEN
    const token = io_helper.getEnvVarOwned(allocator, "GITHUB_TOKEN") catch {
        style.printWarn("GitHub release: GITHUB_TOKEN not set, skipping\n", .{});
        return;
    };
    defer allocator.free(token);

    style.print("\nCreating GitHub release for {s}...\n", .{ctx.tag});

    // 3. Init client
    var client = github.GitHubClient.init(allocator, token) catch {
        style.printWarn("GitHub release: failed to init HTTP client\n", .{});
        return;
    };
    defer client.deinit();

    // 4. Check if release already exists
    const existing_id = client.getReleaseByTag(ctx.owner, ctx.repo, ctx.tag) catch null;
    const release_id: u64 = if (existing_id) |id| blk: {
        style.print("  Release already exists (id={d}), uploading assets...\n", .{id});
        break :blk id;
    } else blk: {
        // Create release
        var resp = client.createRelease(
            ctx.owner,
            ctx.repo,
            ctx.tag,
            ctx.tag,
            "",
            false,
            false,
        ) catch {
            style.printWarn("GitHub release: failed to create release\n", .{});
            return;
        };
        defer resp.deinit(allocator);

        if (!resp.success) {
            if (resp.message) |msg| {
                style.printWarn("GitHub release: {s}\n", .{msg});
            } else {
                style.printWarn("GitHub release: create failed\n", .{});
            }
            return;
        }

        if (resp.html_url) |url| {
            style.print("  Release created: {s}\n", .{url});
        }

        break :blk resp.release_id orelse {
            style.printWarn("GitHub release: no release ID in response\n", .{});
            return;
        };
    };

    // 5. Detect assets
    const assets = if (options.release_files) |files|
        github.detectReleaseAssetsFromFiles(allocator, files)
    else
        github.detectReleaseAssets(allocator, &[_][]const u8{ "bin", "dist" });
    defer {
        for (assets) |*a| {
            var asset = a.*;
            asset.deinit(allocator);
        }
        allocator.free(assets);
    }

    if (assets.len == 0) {
        style.print("  No release assets found\n", .{});
        return;
    }

    // 6. Upload each asset
    style.print("  Uploading {d} asset(s)...\n", .{assets.len});
    for (assets) |asset| {
        var upload_resp = client.uploadReleaseAsset(
            ctx.owner,
            ctx.repo,
            release_id,
            asset.path,
            asset.name,
        ) catch {
            style.printWarn("  Failed to upload {s}\n", .{asset.name});
            continue;
        };
        defer upload_resp.deinit(allocator);

        if (upload_resp.success) {
            style.print("  Uploaded {s}\n", .{asset.name});
        } else {
            if (upload_resp.message) |msg| {
                style.printWarn("  Failed to upload {s}: {s}\n", .{ asset.name, msg });
            } else {
                style.printWarn("  Failed to upload {s}\n", .{asset.name});
            }
        }
    }
}

/// Result of OIDC publish attempt
const OIDCPublishResult = struct {
    success: bool,
    error_message: ?[]const u8 = null,
    is_version_conflict: bool = false,
    status_code: u16 = 0,
    /// Whether the upload carried a Sigstore provenance bundle. Signing can
    /// fail without failing the publish, and then it went up without one.
    provenance: bool = false,
    /// Whether an upload was made, or may have been. Every failure before the
    /// upload — no CI provider, no OIDC token, one npm would not exchange —
    /// leaves this false, and then there is no landed version to look for.
    sent: bool = false,

    fn deinit(self: *OIDCPublishResult, allocator: std.mem.Allocator) void {
        if (self.error_message) |message| allocator.free(message);
        self.* = undefined;
    }
};

/// One package upload should never be able to consume the whole release job.
/// npm publish requests normally finish in seconds; two minutes still leaves
/// ample room for a large tarball while bounding a socket whose peer accepted
/// bytes and then stopped responding.
const npm_publish_timeout_ms: u64 = 120_000;

const OIDCPublishTaskResult = anyerror!OIDCPublishResult;

fn attemptOIDCPublishTask(
    allocator: std.mem.Allocator,
    registry_client: *@import("../../auth/registry.zig").RegistryClient,
    package_name: []const u8,
    version: []const u8,
    tarball_path: []const u8,
    generate_provenance: bool,
) OIDCPublishTaskResult {
    return attemptOIDCPublish(
        allocator,
        registry_client,
        package_name,
        version,
        tarball_path,
        generate_provenance,
    );
}

fn oidcPublishTimeoutTask(timeout_ms: u64) void {
    const ns: i96 = @intCast(@as(u128, timeout_ms) * @as(u128, std.time.ns_per_ms));
    io_helper.getIo().sleep(.{ .nanoseconds = ns }, .awake) catch {};
}

fn attemptOIDCPublishWithTimeout(
    allocator: std.mem.Allocator,
    registry_client: *@import("../../auth/registry.zig").RegistryClient,
    package_name: []const u8,
    version: []const u8,
    tarball_path: []const u8,
    generate_provenance: bool,
    timeout_ms: u64,
) !OIDCPublishResult {
    if (timeout_ms == 0) {
        return attemptOIDCPublish(
            allocator,
            registry_client,
            package_name,
            version,
            tarball_path,
            generate_provenance,
        );
    }

    const Selection = union(enum) {
        response: OIDCPublishTaskResult,
        timeout: void,
    };
    var result_buffer: [2]Selection = undefined;
    var select = std.Io.Select(Selection).init(io_helper.getIo(), &result_buffer);

    try select.concurrent(.response, attemptOIDCPublishTask, .{
        allocator,
        registry_client,
        package_name,
        version,
        tarball_path,
        generate_provenance,
    });
    select.concurrent(.timeout, oidcPublishTimeoutTask, .{timeout_ms}) catch |err| {
        while (select.cancel()) |selected| {
            if (selected == .response) {
                if (selected.response) |response| {
                    var owned_response = response;
                    owned_response.deinit(allocator);
                } else |_| {}
            }
        }
        return err;
    };

    const first = try select.await();
    switch (first) {
        .response => |response| {
            while (select.cancel()) |_| {}
            return response;
        },
        .timeout => {
            while (select.cancel()) |selected| {
                if (selected == .response) {
                    if (selected.response) |response| {
                        var owned_response = response;
                        owned_response.deinit(allocator);
                    } else |_| {}
                }
            }
            // The upload may be in flight still: it counts as sent.
            return .{
                .success = false,
                .status_code = 0,
                .sent = true,
                .error_message = try std.fmt.allocPrint(
                    allocator,
                    "OIDC publish timed out after {d}s",
                    .{timeout_ms / 1000},
                ),
            };
        },
    }
}

/// What an OIDC publish failure tells us about the package's fate.
pub const OidcFailureKind = enum {
    /// The registry looked at the request and said no. Nothing was published,
    /// and no other credential would change that.
    definitive,
    /// We do not know. The status says the request did not complete cleanly,
    /// which is not the same as the version not existing — npm commits a
    /// publish asynchronously, so an upload it accepted can land after the
    /// connection carrying our answer has already broken.
    inconclusive,
};

/// Classify an OIDC publish failure by status.
///
/// Only the three the registry uses to REJECT are definitive. Everything else —
/// 401, 5xx, a timeout or dropped connection reported as 0 — leaves the outcome
/// genuinely unknown, and the caller must ask the registry rather than assume.
///
/// 404 is the subtle one and belongs on the inconclusive side twice over: from
/// the OIDC exchange it means this package has no trusted publisher, so a token
/// may still work; and npm also answers 404 for a package a credential cannot
/// see, which says nothing about whether the version exists.
pub fn classifyOidcFailure(status_code: u16) OidcFailureKind {
    return switch (status_code) {
        403, 409, 422 => .definitive,
        else => .inconclusive,
    };
}

/// Wall time per phase of one OIDC publish, so a slow one shows in the log.
const PublishPhases = struct {
    const Phase = enum { token, verify, provenance, upload };
    started_ms: i64,
    last_ms: i64,
    spent_ms: [4]i64 = .{ -1, -1, -1, -1 },

    fn start() PublishPhases {
        const now = io_helper.getMilliTimestamp();
        return .{ .started_ms = now, .last_ms = now };
    }

    fn mark(self: *PublishPhases, phase: Phase) void {
        const now = io_helper.getMilliTimestamp();
        self.spent_ms[@backingInt(phase)] = now - self.last_ms;
        self.last_ms = now;
    }

    fn print(self: *const PublishPhases) void {
        if (self.spent_ms[@backingInt(Phase.token)] < 0) return;
        const names = [_][]const u8{ "oidc token", "jwks verify", "provenance (fulcio+rekor)", "npm exchange+upload" };
        style.print("  {s}timings:{s}", .{ style.dim, style.reset });
        for (self.spent_ms, 0..) |ms, i| {
            if (ms < 0) continue;
            style.print(" {s} {d}.{d}s", .{ names[i], @divFloor(ms, 1000), @divFloor(@mod(ms, 1000), 100) });
            if (i + 1 < self.spent_ms.len and self.spent_ms[i + 1] >= 0) style.print(" ·", .{});
        }
        const total = io_helper.getMilliTimestamp() - self.started_ms;
        style.print(" (total {d}.{d}s)\n", .{ @divFloor(total, 1000), @divFloor(@mod(total, 1000), 100) });
    }
};

/// Attempt to publish using OIDC authentication with Sigstore provenance
fn attemptOIDCPublish(
    allocator: std.mem.Allocator,
    registry_client: *@import("../../auth/registry.zig").RegistryClient,
    package_name: []const u8,
    version: []const u8,
    tarball_path: []const u8,
    generate_provenance: bool,
) !OIDCPublishResult {
    const oidc = @import("../../auth/oidc.zig");
    const sigstore = @import("../../auth/sigstore.zig");
    // Each phase's wall time, printed once the upload is answered: a package
    // spent a minute or more between "Registry:" and "Published" with nothing
    // in the log to say where (stacks v0.75.232/233).
    var phases = PublishPhases.start();

    // Detect OIDC provider
    var provider = try oidc.detectProvider(allocator) orelse return .{
        .success = false,
        .error_message = try allocator.dupe(u8, "No OIDC provider detected. Are you running in GitHub Actions or another CI environment?"),
    };
    defer provider.deinit(allocator);

    // Get OIDC token from environment
    const raw_token = try oidc.getTokenFromEnvironment(allocator, &provider) orelse return .{
        .success = false,
        .error_message = try allocator.dupe(u8, "Could not get OIDC token from environment. Ensure 'id-token: write' permission is set in your workflow."),
    };
    defer allocator.free(raw_token);
    phases.mark(.token);

    // Verify token signature against provider's JWKS
    const sig_valid = oidc.verifyTokenSignature(allocator, raw_token, &provider) catch {
        // Continue anyway - registry will do final validation
        return attemptOIDCPublishUnverified(allocator, registry_client, package_name, version, tarball_path, generate_provenance, raw_token, &provider);
    };

    if (!sig_valid) {
        return .{
            .success = false,
            .error_message = try allocator.dupe(u8, "OIDC token signature verification failed"),
        };
    }

    // Decode and validate token (signature already verified)
    var token = oidc.validateTokenComplete(allocator, raw_token, &provider, null) catch |err| {
        return .{
            .success = false,
            .error_message = try std.fmt.allocPrint(allocator, "Token validation failed: {any}", .{err}),
        };
    };
    defer token.deinit(allocator);
    phases.mark(.verify);

    // Generate Sigstore provenance bundle if requested
    var sigstore_bundle: ?[]const u8 = null;
    defer if (sigstore_bundle) |bundle| allocator.free(bundle);
    defer phases.print();

    if (generate_provenance) {
        // Read tarball for hashing
        const tarball_data = io_helper.readFileAlloc(allocator, tarball_path, 100 * 1024 * 1024) catch |err| {
            return .{
                .success = false,
                .error_message = try std.fmt.allocPrint(allocator, "Could not read tarball: {any}", .{err}),
            };
        };
        defer allocator.free(tarball_data);

        // Create signed provenance using Sigstore (Fulcio + Rekor)
        sigstore_bundle = sigstore.createSignedProvenance(
            allocator,
            &token,
            package_name,
            version,
            tarball_data,
        ) catch null;
    }
    phases.mark(.provenance);

    // Publish package with provenance bundle, retrying on rate-limit / 5xx.
    const max_oidc_attempts: u8 = 8;
    var oidc_attempt: u8 = 0;
    const response = blk: while (true) {
        oidc_attempt += 1;
        const r = registry_client.publishWithOIDCAndProvenance(
            package_name,
            version,
            tarball_path,
            &token,
            sigstore_bundle,
        ) catch |err| {
            // A connection that never opened sent nothing, so trying again
            // cannot publish twice. Seen mid-release as TlsInitializationFailed,
            // which failed @stacksjs/datetime and stopped v0.75.234. Anything
            // that may have reached npm (a reset, a timeout) is not retried:
            // its outcome is unknown and a second upload would conflict.
            if (oidc_attempt < max_oidc_attempts and isConnectionSetupError(err)) {
                const wait_ms: u64 = @as(u64, 2_000) << @as(u6, @intCast(oidc_attempt - 1));
                style.print("  {s}⚠{s} Could not connect to the registry ({any}, attempt {d}/{d}); retrying in {d}s...\n", .{ style.yellow, style.reset, err, oidc_attempt, max_oidc_attempts, wait_ms / 1000 });
                io_helper.sleepMs(wait_ms);
                continue;
            }
            return err;
        };
        if (r.success or !r.isRetryable() or oidc_attempt >= max_oidc_attempts) {
            break :blk r;
        }
        var mut_r = r;
        const backoff_ms: u64 = @as(u64, 5_000) << @as(u6, @intCast(oidc_attempt - 1));
        const server_ms: u64 = if (r.retry_after_seconds) |s| @as(u64, s) * 1000 else 0;
        const wait_ms: u64 = @max(backoff_ms, server_ms);
        style.print(
            "  {s}⚠{s} Registry returned {d} (attempt {d}/{d}); retrying in {d}s...\n",
            .{ style.yellow, style.reset, r.status_code, oidc_attempt, max_oidc_attempts, wait_ms / 1000 },
        );
        mut_r.deinit(allocator);
        io_helper.sleepMs(wait_ms);
    };
    phases.mark(.upload);
    defer {
        var mut_response = response;
        mut_response.deinit(allocator);
    }

    if (!response.success) {
        // Build error message from response
        var error_msg: []const u8 = undefined;
        var is_version_conflict = false;

        if (response.error_details) |details| {
            if (details.code) |code| {
                if (std.mem.eql(u8, code, "EPUBLISHCONFLICT")) {
                    is_version_conflict = true;
                }
            }
            if (details.summary) |summary| {
                error_msg = try allocator.dupe(u8, summary);
            } else if (response.message) |msg| {
                error_msg = try allocator.dupe(u8, msg);
            } else {
                error_msg = try std.fmt.allocPrint(allocator, "Publish failed with status {d}", .{response.status_code});
            }
        } else if (response.message) |msg| {
            error_msg = try allocator.dupe(u8, msg);
        } else {
            error_msg = try std.fmt.allocPrint(allocator, "Publish failed with status {d}", .{response.status_code});
        }

        // Also detect version conflict from response body text (npm returns
        // 403 for an already-published version, 409 for a staged one).
        if (!is_version_conflict) {
            const code_str: ?[]const u8 = if (response.error_details) |d| d.code else null;
            is_version_conflict = classifyConflict(code_str, response.message) != .none;
        }

        return .{
            .success = false,
            .error_message = error_msg,
            .is_version_conflict = is_version_conflict,
            .status_code = @intCast(response.status_code),
            .sent = !response.not_sent,
        };
    }

    return .{ .success = true, .provenance = sigstore_bundle != null };
}

/// Fallback: Attempt OIDC publish without local signature verification
/// Used when JWKS fetch fails - registry will still validate the token
fn attemptOIDCPublishUnverified(
    allocator: std.mem.Allocator,
    registry_client: *@import("../../auth/registry.zig").RegistryClient,
    package_name: []const u8,
    version: []const u8,
    tarball_path: []const u8,
    generate_provenance: bool,
    raw_token: []const u8,
    provider: *const @import("../../auth/oidc.zig").OIDCProvider,
) !OIDCPublishResult {
    const oidc = @import("../../auth/oidc.zig");
    const sigstore = @import("../../auth/sigstore.zig");
    _ = provider;

    // Decode token without signature verification
    var token = try oidc.decodeTokenUnsafe(allocator, raw_token);
    defer token.deinit(allocator);

    // At least validate expiration
    oidc.validateExpiration(&token.claims) catch |err| {
        return .{
            .success = false,
            .error_message = try std.fmt.allocPrint(allocator, "Token expired or invalid: {any}", .{err}),
        };
    };

    // Generate Sigstore provenance bundle if requested
    var sigstore_bundle: ?[]const u8 = null;
    defer if (sigstore_bundle) |bundle| allocator.free(bundle);

    if (generate_provenance) {
        // Read tarball for hashing
        if (io_helper.readFileAlloc(allocator, tarball_path, 100 * 1024 * 1024)) |tarball_data| {
            defer allocator.free(tarball_data);

            sigstore_bundle = sigstore.createSignedProvenance(
                allocator,
                &token,
                package_name,
                version,
                tarball_data,
            ) catch null;
        } else |_| {}
    }

    // Publish with provenance - registry will validate token. Retry on 429/5xx.
    const max_oidc_unverified_attempts: u8 = 8;
    var oidc_unverified_attempt: u8 = 0;
    const response = blk: while (true) {
        oidc_unverified_attempt += 1;
        const r = try registry_client.publishWithOIDCAndProvenance(
            package_name,
            version,
            tarball_path,
            &token,
            sigstore_bundle,
        );
        if (r.success or !r.isRetryable() or oidc_unverified_attempt >= max_oidc_unverified_attempts) {
            break :blk r;
        }
        var mut_r = r;
        const backoff_ms: u64 = @as(u64, 5_000) << @as(u6, @intCast(oidc_unverified_attempt - 1));
        const server_ms: u64 = if (r.retry_after_seconds) |s| @as(u64, s) * 1000 else 0;
        const wait_ms: u64 = @max(backoff_ms, server_ms);
        style.print(
            "  {s}⚠{s} Registry returned {d} (attempt {d}/{d}); retrying in {d}s...\n",
            .{ style.yellow, style.reset, r.status_code, oidc_unverified_attempt, max_oidc_unverified_attempts, wait_ms / 1000 },
        );
        mut_r.deinit(allocator);
        io_helper.sleepMs(wait_ms);
    };
    defer {
        var mut_response = response;
        mut_response.deinit(allocator);
    }

    if (!response.success) {
        var error_msg: []const u8 = undefined;
        var is_version_conflict = false;

        if (response.error_details) |details| {
            if (details.code) |code| {
                if (std.mem.eql(u8, code, "EPUBLISHCONFLICT")) {
                    is_version_conflict = true;
                }
            }
            if (details.summary) |summary| {
                error_msg = try allocator.dupe(u8, summary);
            } else if (response.message) |msg| {
                error_msg = try allocator.dupe(u8, msg);
            } else {
                error_msg = try std.fmt.allocPrint(allocator, "Publish failed with status {d}", .{response.status_code});
            }
        } else if (response.message) |msg| {
            error_msg = try allocator.dupe(u8, msg);
        } else {
            error_msg = try std.fmt.allocPrint(allocator, "Publish failed with status {d}", .{response.status_code});
        }

        // Also detect version conflict from response body text (npm returns
        // 403 for an already-published version, 409 for a staged one).
        if (!is_version_conflict) {
            const code_str: ?[]const u8 = if (response.error_details) |d| d.code else null;
            is_version_conflict = classifyConflict(code_str, response.message) != .none;
        }

        return .{
            .success = false,
            .error_message = error_msg,
            .is_version_conflict = is_version_conflict,
            .status_code = @intCast(response.status_code),
            .sent = !response.not_sent,
        };
    }

    return .{ .success = true, .provenance = sigstore_bundle != null };
}

/// Info about a created tarball for clean publish output
const TarballInfo = struct {
    path: []const u8,
    packed_size: u64,
    unpacked_size: u64,
    total_files: usize,
    shasum: [40]u8,
    integrity: [95]u8,
};

/// Format byte size as human-readable string (e.g. "3.56KB", "0.98MB")
fn formatSize(buf: []u8, size: u64) []const u8 {
    if (size < 1024) {
        return std.fmt.bufPrint(buf, "{d}B", .{size}) catch "?";
    } else if (size < 1024 * 1024) {
        return std.fmt.bufPrint(buf, "{d:.2}KB", .{@as(f64, @floatFromInt(size)) / 1024.0}) catch "?";
    } else {
        return std.fmt.bufPrint(buf, "{d:.2}MB", .{@as(f64, @floatFromInt(size)) / (1024.0 * 1024.0)}) catch "?";
    }
}

/// Create tarball for package following npm's `files` array and publish standards
fn createTarball(
    allocator: std.mem.Allocator,
    package_dir: []const u8,
    package_name: []const u8,
    version: []const u8,
) !TarballInfo {
    // Sanitize package name for tarball filename (replace @ and / with -)
    var sanitized_name = try allocator.alloc(u8, package_name.len);
    defer allocator.free(sanitized_name);
    for (package_name, 0..) |c, i| {
        sanitized_name[i] = if (c == '@' or c == '/') '-' else c;
    }
    // Trim leading dash if present (from @scope)
    const clean_name = if (sanitized_name[0] == '-') sanitized_name[1..] else sanitized_name;

    const tarball_name = try std.fmt.allocPrint(
        allocator,
        "{s}-{s}.tgz",
        .{ clean_name, version },
    );
    defer allocator.free(tarball_name);

    // Create tarball in temp directory to avoid "file changed as we read it" error
    const tmp_dir = io_helper.getTempDir();
    const tarball_path = try std.fs.path.join(allocator, &[_][]const u8{ tmp_dir, tarball_name });

    // npm requires all files to be inside a "package/" directory in the tarball.
    // One staging directory per publish. A fixed /tmp/pantry-staging was
    // shared by every publish on the machine: a monorepo publishing a
    // dependency layer in parallel had each publish delete the others'
    // staged files mid-copy, and packages went up without their dist.
    const staging_base = try io_helper.uniqueTempPath(allocator, "pantry-staging");
    defer allocator.free(staging_base);
    const staging_pkg = try std.fs.path.join(allocator, &[_][]const u8{ staging_base, "package" });
    defer allocator.free(staging_pkg);

    // Clean and create staging directory
    io_helper.deleteTree(staging_base) catch {};

    try io_helper.makePath(staging_pkg);
    errdefer io_helper.deleteTree(staging_base) catch {};

    // Read package.json to check for `files` array
    const pkg_json_path = try std.fs.path.join(allocator, &[_][]const u8{ package_dir, "package.json" });
    defer allocator.free(pkg_json_path);

    const files_array = getFilesArrayFromPackageJson(allocator, pkg_json_path) catch null;
    defer if (files_array) |arr| {
        for (arr) |f| allocator.free(f);
        allocator.free(arr);
    };

    // Always-included files (npm behavior) - case-insensitive patterns
    const always_include = [_][]const u8{
        "package.json",
        "README",
        "README.md",
        "README.txt",
        "readme",
        "readme.md",
        "readme.txt",
        "LICENSE",
        "LICENSE.md",
        "LICENSE.txt",
        "license",
        "license.md",
        "license.txt",
        "LICENCE",
        "LICENCE.md",
        "licence",
        "CHANGELOG",
        "CHANGELOG.md",
        "changelog",
        "changelog.md",
        "HISTORY",
        "HISTORY.md",
        "history",
        "history.md",
        "NOTICE",
        "NOTICE.md",
        "notice",
    };

    if (files_array) |files| {
        // Whitelist mode: only copy files specified in `files` array + always-included files
        // Copy always-included files first
        for (always_include) |filename| {
            const src = try std.fs.path.join(allocator, &[_][]const u8{ package_dir, filename });
            defer allocator.free(src);
            const dst = try std.fs.path.join(allocator, &[_][]const u8{ staging_pkg, filename });
            defer allocator.free(dst);

            // Check if file exists
            io_helper.accessAbsolute(src, .{}) catch continue;

            // Copy the file
            io_helper.copyFile(src, dst) catch continue;
        }

        // Copy each file/directory from the `files` array
        for (files) |file_entry| {
            const src = try std.fs.path.join(allocator, &[_][]const u8{ package_dir, file_entry });
            defer allocator.free(src);
            const dst = try std.fs.path.join(allocator, &[_][]const u8{ staging_pkg, file_entry });
            defer allocator.free(dst);

            // Check if source exists
            io_helper.accessAbsolute(src, .{}) catch {
                style.print("  Warning: '{s}' in files array not found, skipping\n", .{file_entry});
                continue;
            };

            // Create parent directory if needed
            if (std.fs.path.dirname(dst)) |parent| {
                io_helper.makePath(parent) catch |err| {
                    style.print("  Error: cannot stage '{s}': {}\n", .{ file_entry, err });
                    return error.TarballCreationFailed;
                };
            }

            // Use cp -rp which works correctly for both files and directories.
            // Previously we checked statFile().kind to decide cp -p vs cp -rp,
            // but on Linux openFile() can succeed on directories, causing
            // statFile to return kind=.file for dirs. cp -p then silently
            // skips directories ("omitting directory"), so only package.json
            // ended up in the tarball.
            // A `files` entry that exists and cannot be copied fails the
            // publish: skipping it uploads a package without that entry.
            const cp = io_helper.childRun(allocator, &[_][]const u8{ "cp", "-rp", src, dst }) catch |err| {
                style.print("  Error: failed to copy '{s}': {}\n", .{ file_entry, err });
                return error.TarballCreationFailed;
            };
            defer allocator.free(cp.stdout);
            defer allocator.free(cp.stderr);

            const cp_ok = switch (cp.term) {
                .exited => |code| code == 0,
                else => false,
            };
            if (!cp_ok) {
                style.print("  Error: cp failed for '{s}': {s}\n", .{ file_entry, cp.stderr });
                return error.TarballCreationFailed;
            }
        }

        // Auto-include files referenced by `bin` and `main` fields (npm behavior).
        // npm always includes these regardless of the `files` array.
        {
            const pkg_content = io_helper.readFileAlloc(allocator, pkg_json_path, 1024 * 1024) catch null;
            defer if (pkg_content) |c| allocator.free(c);

            if (pkg_content) |content| {
                const parsed_pkg = std.json.parseFromSlice(std.json.Value, allocator, content, .{}) catch null;
                defer if (parsed_pkg) |p| p.deinit();

                if (parsed_pkg) |p| {
                    if (p.value == .object) {
                        // Auto-include `main` entry
                        if (p.value.object.get("main")) |main_val| {
                            if (main_val == .string) {
                                autoIncludeEntry(allocator, package_dir, staging_pkg, main_val.string);
                            }
                        }

                        // Auto-include `bin` entries (string or object map)
                        if (p.value.object.get("bin")) |bin_val| {
                            switch (bin_val) {
                                .string => |s| {
                                    autoIncludeEntry(allocator, package_dir, staging_pkg, s);
                                },
                                .object => |obj| {
                                    for (obj.values()) |v| {
                                        if (v == .string) {
                                            autoIncludeEntry(allocator, package_dir, staging_pkg, v.string);
                                        }
                                    }
                                },
                                else => {},
                            }
                        }
                    }
                }
            }
        }
    } else {
        // No `files` array - use exclusion-based approach (legacy behavior)

        const src_path = try std.fmt.allocPrint(allocator, "{s}/", .{package_dir});
        defer allocator.free(src_path);
        const dst_path = try std.fmt.allocPrint(allocator, "{s}/", .{staging_pkg});
        defer allocator.free(dst_path);

        // Ignore rules use gitignore semantics, matched here rather than by
        // rsync, whose pattern language differs between GNU rsync and macOS's
        // openrsync (see publish_ignore.zig and #202).
        var rules = publish_ignore.IgnoreRules.init(allocator);
        defer rules.deinit();

        // Default exclusions
        const default_excludes = [_][]const u8{
            ".git",
            ".gitignore",
            ".gitattributes",
            ".gitmodules",
            ".svn",
            ".hg",
            "CVS",
            ".npmignore",
            ".pantryignore",
            ".npmrc",
            ".yarnrc",
            ".yarnrc.yml",
            "package-lock.json",
            "yarn.lock",
            "pnpm-lock.yaml",
            "bun.lockb",
            "shrinkwrap.yaml",
            "pantry.lock",
            "node_modules",
            "pantry",
            ".nyc_output",
            "coverage",
            ".coverage",
            "*.tgz",
            "*.tar.xz",
            ".DS_Store",
            "Thumbs.db",
            "._*",
            "*.swp",
            "*.orig",
            ".idea",
            ".vscode",
            "*.sublime-*",
            ".github",
            ".gitlab-ci.yml",
            ".travis.yml",
            ".circleci",
            ".env",
            ".env.*",
            "*.pem",
            "*.key",
            "*.log",
            "npm-debug.log",
            "deps.yaml",
            ".claude",
        };
        for (default_excludes) |pattern| _ = try rules.add(pattern);

        // Additional patterns from .pantryignore or .npmignore
        const ignore_content = blk: {
            // Priority: .pantryignore > .npmignore
            const pantryignore_path = std.fs.path.join(allocator, &[_][]const u8{ package_dir, ".pantryignore" }) catch break :blk null;
            defer allocator.free(pantryignore_path);
            const pantry_content = io_helper.readFileAlloc(allocator, pantryignore_path, 64 * 1024) catch null;
            if (pantry_content) |c| {
                if (c.len > 0) {
                    break :blk c;
                }
                allocator.free(c);
            }

            const npmignore_path = std.fs.path.join(allocator, &[_][]const u8{ package_dir, ".npmignore" }) catch break :blk null;
            defer allocator.free(npmignore_path);
            const npm_content = io_helper.readFileAlloc(allocator, npmignore_path, 64 * 1024) catch null;
            if (npm_content) |c| {
                if (c.len > 0) {
                    break :blk c;
                }
                allocator.free(c);
            }

            break :blk null;
        };
        defer if (ignore_content) |c| allocator.free(c);

        if (ignore_content) |content| {
            var lines = std.mem.splitScalar(u8, content, '\n');
            while (lines.next()) |line| _ = try rules.add(line);
        }

        const exclude_list_path = try std.fs.path.join(allocator, &[_][]const u8{ staging_base, "rsync-excludes" });
        defer allocator.free(exclude_list_path);
        _ = try publish_ignore.writeExcludeFile(allocator, &rules, package_dir, exclude_list_path);
        const exclude_from = try std.fmt.allocPrint(allocator, "--exclude-from={s}", .{exclude_list_path});
        defer allocator.free(exclude_from);

        const cp_result = try io_helper.childRun(allocator, &[_][]const u8{ "rsync", "-a", exclude_from, src_path, dst_path });
        defer allocator.free(cp_result.stdout);
        defer allocator.free(cp_result.stderr);

        if (cp_result.term != .exited or cp_result.term.exited != 0) {
            style.print("rsync failed. stderr: {s}\n", .{cp_result.stderr});
            return error.TarballCreationFailed;
        }
    }

    // Resolve workspace and catalog protocol dependencies in the staged
    // package.json. npm and Bun cannot install either protocol outside the
    // source monorepo, so publishing an unresolved range must fail loudly.
    {
        const staged_pkg_json = try std.fs.path.join(allocator, &[_][]const u8{ staging_pkg, "package.json" });
        defer allocator.free(staged_pkg_json);
        try workspace_publish.rewriteStagedManifest(allocator, staged_pkg_json, package_dir);
    }

    // Compute unpacked size and file count from staging directory before tarball creation
    var unpacked_size: u64 = 0;
    var total_files: usize = 0;
    {
        const du_cmd = try std.fmt.allocPrint(allocator, "find {s} -type f -exec stat -f%z {{}} + 2>/dev/null || find {s} -type f -exec stat -c%s {{}} +", .{ staging_pkg, staging_pkg });
        defer allocator.free(du_cmd);
        const du = io_helper.childRun(allocator, &[_][]const u8{ "sh", "-c", du_cmd }) catch null;
        if (du) |d| {
            defer allocator.free(d.stdout);
            defer allocator.free(d.stderr);
            var lines = std.mem.splitScalar(u8, d.stdout, '\n');
            while (lines.next()) |line| {
                const trimmed = std.mem.trim(u8, line, " \t\r");
                if (trimmed.len == 0) continue;
                if (std.fmt.parseInt(u64, trimmed, 10)) |sz| {
                    unpacked_size += sz;
                    total_files += 1;
                } else |_| {}
            }
        }
    }

    // Print "packed" lines for key files (like bun does)
    {
        const key_files = [_][]const u8{ "package.json", "README.md", "README", "LICENSE", "LICENSE.md", "CHANGELOG.md" };
        for (key_files) |filename| {
            const fpath = std.fs.path.join(allocator, &[_][]const u8{ staging_pkg, filename }) catch continue;
            defer allocator.free(fpath);
            const stat = io_helper.statFile(fpath) catch continue;
            const fsize: u64 = @intCast(stat.size);
            var size_buf: [32]u8 = undefined;
            const size_str = formatSize(&size_buf, fsize);
            style.print("packed {s} {s}\n", .{ size_str, filename });
        }
    }

    // Create tarball with "package" directory at root
    const result = try packStaged(allocator, staging_base, tarball_path);
    defer allocator.free(result.stdout);
    defer allocator.free(result.stderr);

    // Cleanup staging
    io_helper.deleteTree(staging_base) catch {};

    if (result.term != .exited or result.term.exited != 0) {
        return error.TarballCreationFailed;
    }

    // Get packed (tarball) size
    const packed_size: u64 = blk: {
        const stat = io_helper.statFile(tarball_path) catch break :blk 0;
        break :blk @intCast(stat.size);
    };

    if (packed_size > 50 * 1024 * 1024) { // 50MB warning
        style.print("WARNING: Tarball is very large ({d:.2}MB)! Check for unwanted files.\n", .{@as(f64, @floatFromInt(packed_size)) / (1024.0 * 1024.0)});
    }

    // Compute SHA-1 shasum and SHA-512 integrity from tarball
    const tarball_data = io_helper.readFileAlloc(allocator, tarball_path, 100 * 1024 * 1024) catch {
        return TarballInfo{
            .path = tarball_path,
            .packed_size = packed_size,
            .unpacked_size = unpacked_size,
            .total_files = total_files,
            .shasum = @splat('0'),
            .integrity = @splat('0'),
        };
    };
    defer allocator.free(tarball_data);

    // SHA-1 shasum (hex)
    const hex_chars = "0123456789abcdef";
    var sha1: [20]u8 = undefined;
    std.crypto.hash.Sha1.hash(tarball_data, &sha1, .{});
    var shasum: [40]u8 = undefined;
    for (sha1, 0..) |byte, i| {
        shasum[i * 2] = hex_chars[byte >> 4];
        shasum[i * 2 + 1] = hex_chars[byte & 0x0F];
    }

    // SHA-512 integrity (base64)
    var sha512: [64]u8 = undefined;
    std.crypto.hash.sha2.Sha512.hash(tarball_data, &sha512, .{});
    var integrity: [95]u8 = undefined;
    @memcpy(integrity[0..7], "sha512-");
    _ = std.base64.standard.Encoder.encode(integrity[7..], &sha512);

    return TarballInfo{
        .path = tarball_path,
        .packed_size = packed_size,
        .unpacked_size = unpacked_size,
        .total_files = total_files,
        .shasum = shasum,
        .integrity = integrity,
    };
}

/// Archive `staging_base/package` as npm expects a package tarball: its files
/// under `package/`, and nothing else.
///
/// `tar -czf out -C base package` is not that on macOS. Its bsdtar stores
/// extended attributes, and macOS puts `com.apple.provenance` on every file a
/// process writes — so each entry gained an AppleDouble twin (`._package`,
/// `package/._dist`, …), hidden from `tar -t`, and the first of them sits
/// outside `package/`. npm refuses the whole upload: `415 invalid path:
/// package/`. Every publish from a Mac failed that way, while Linux CI, on
/// GNU tar, never saw it.
///
/// So the archive lists the files themselves, sorted, without directory
/// entries (as npm's own tarballs do), with extended attributes off and
/// AppleDouble disabled. A tar too minimal for those flags (BusyBox) gets the
/// plain command, which on those systems has nothing to add anyway.
fn packStaged(allocator: std.mem.Allocator, staging_base: []const u8, tarball_path: []const u8) !io_helper.ChildRunResult {
    const list_path = try std.fs.path.join(allocator, &[_][]const u8{ staging_base, ".pantry-files" });
    defer allocator.free(list_path);

    hardened: {
        const found = io_helper.childRunWithOptions(allocator, &[_][]const u8{ "find", "package", "-type", "f" }, .{ .cwd = staging_base }) catch break :hardened;
        defer allocator.free(found.stdout);
        defer allocator.free(found.stderr);
        if (found.term != .exited or found.term.exited != 0) break :hardened;

        var files: std.ArrayList([]const u8) = .empty;
        defer files.deinit(allocator);
        var lines = std.mem.splitScalar(u8, found.stdout, '\n');
        while (lines.next()) |line| {
            if (line.len > 0) files.append(allocator, line) catch break :hardened;
        }
        if (files.items.len == 0) break :hardened;
        std.mem.sort([]const u8, files.items, {}, struct {
            fn lessThan(_: void, a: []const u8, b: []const u8) bool {
                return std.mem.lessThan(u8, a, b);
            }
        }.lessThan);

        var list: std.ArrayList(u8) = .empty;
        defer list.deinit(allocator);
        for (files.items) |file| {
            list.appendSlice(allocator, file) catch break :hardened;
            list.append(allocator, '\n') catch break :hardened;
        }
        {
            const file = io_helper.createFile(list_path, .{ .truncate = true }) catch break :hardened;
            defer io_helper.closeFile(file);
            io_helper.writeAllToFile(file, list.items) catch break :hardened;
        }
        defer io_helper.deleteFile(list_path) catch {};

        const packed_files = io_helper.childRunWithOptions(allocator, &[_][]const u8{
            "/usr/bin/env",   "COPYFILE_DISABLE=1", "tar",        "--no-xattrs",
            "--no-recursion", "-czf",               tarball_path, "-T",
            ".pantry-files",
        }, .{ .cwd = staging_base }) catch break :hardened;
        if (packed_files.term == .exited and packed_files.term.exited == 0) return packed_files;
        allocator.free(packed_files.stdout);
        allocator.free(packed_files.stderr);
    }

    return io_helper.childRun(allocator, &[_][]const u8{ "tar", "-czf", tarball_path, "-C", staging_base, "package" });
}

/// Sort monorepo packages by dependency order using topological sort (Kahn's algorithm).
/// Packages that are depended on by others come first, so their `prepublishOnly` scripts
/// run before dependents try to build against them.

// Whether `peerDependenciesMeta` marks this peer optional.
//
// npm's shape is `{ "pkg": { "optional": true } }`; anything else, including a
// missing entry, means the peer is required.
fn isOptionalPeer(peer_meta: ?std.json.ObjectMap, name: []const u8) bool {
    const meta = peer_meta orelse return false;
    const entry = meta.get(name) orelse return false;
    if (entry != .object) return false;
    const flag = entry.object.get("optional") orelse return false;
    return flag == .bool and flag.bool;
}

test "an optional peer does not constrain publish order" {
    const allocator = std.testing.allocator;

    const json =
        \\{
        \\  "peerDependencies": { "@scope/hard": "1.0.0", "@scope/soft": "1.0.0" },
        \\  "peerDependenciesMeta": { "@scope/soft": { "optional": true } }
        \\}
    ;

    const parsed = try std.json.parseFromSlice(std.json.Value, allocator, json, .{});
    defer parsed.deinit();

    const meta = parsed.value.object.get("peerDependenciesMeta").?.object;

    // The optional one is skipped; the required one still orders the publish.
    try std.testing.expect(isOptionalPeer(meta, "@scope/soft"));
    try std.testing.expect(!isOptionalPeer(meta, "@scope/hard"));

    // A peer nobody mentioned in the meta map is required, and so is every
    // peer when there is no meta map at all.
    try std.testing.expect(!isOptionalPeer(meta, "@scope/absent"));
    try std.testing.expect(!isOptionalPeer(null, "@scope/soft"));
}

fn sortPackagesByDependencyOrder(
    allocator: std.mem.Allocator,
    packages: []@import("registry.zig").MonorepoPackage,
) void {
    const n = packages.len;
    if (n <= 1) return;

    // Sort by name first, so the order does not depend on what readdir
    // happened to return.
    //
    // Kahn's below cannot fully order a workspace whose graph has a cycle, and
    // real workspaces have them - a devDependency back-edge is enough, and one
    // framework this publishes has 41 of its 82 packages in a single strongly
    // connected component. Whatever it cannot place is emitted in input order,
    // so without this the release order was decided by the filesystem: the same
    // workspace ordered one way on a laptop and another way in CI, and a
    // release was not reproducible from one run to the next.
    //
    // No order is correct for packages inside a cycle. Publishing is not
    // harmed by that - npm does not check that a dependency exists when it
    // accepts a package - but a release that cannot be reproduced is worth
    // fixing on its own.
    const Pkg = @import("registry.zig").MonorepoPackage;
    std.mem.sort(Pkg, packages, {}, struct {
        fn lessThan(_: void, a: Pkg, b: Pkg) bool {
            return std.mem.order(u8, a.name, b.name) == .lt;
        }
    }.lessThan);

    // Map workspace package names to their index
    var name_to_idx = std.StringHashMap(usize).init(allocator);
    defer name_to_idx.deinit();
    for (packages, 0..) |pkg, i| {
        name_to_idx.put(pkg.name, i) catch continue;
    }

    // Compute in-degree: how many workspace deps each package has
    const in_degree = allocator.alloc(usize, n) catch return;
    defer allocator.free(in_degree);
    @memset(in_degree, 0);

    // dependents[i] stores indices of packages that depend on packages[i]
    const dependents = allocator.alloc(std.ArrayList(usize), n) catch return;
    defer allocator.free(dependents);
    for (0..n) |i| dependents[i] = std.ArrayList(usize).empty;
    defer for (0..n) |i| dependents[i].deinit(allocator);

    for (packages, 0..) |pkg, i| {
        const content = io_helper.readFileAlloc(allocator, pkg.config_path, 1024 * 1024) catch continue;
        defer allocator.free(content);

        const parsed = std.json.parseFromSlice(std.json.Value, allocator, content, .{}) catch continue;
        defer parsed.deinit();

        if (parsed.value != .object) continue;

        // An optional peer need not be installed for the dependent to work,
        // so it constrains neither resolution nor the order things publish in.
        // Counting it puts packages in a cycle that are not really in one, and
        // a cycle here means somebody gets published before a dependency it
        // declares.
        const peer_meta: ?std.json.ObjectMap = blk: {
            const meta = parsed.value.object.get("peerDependenciesMeta") orelse break :blk null;
            if (meta != .object) break :blk null;
            break :blk meta.object;
        };

        const dep_fields = [_][]const u8{ "dependencies", "devDependencies", "peerDependencies" };
        for (dep_fields) |field| {
            const deps_val = parsed.value.object.get(field) orelse continue;
            if (deps_val != .object) continue;

            const is_peer = std.mem.eql(u8, field, "peerDependencies");

            var iter = deps_val.object.iterator();
            while (iter.next()) |entry| {
                if (is_peer and isOptionalPeer(peer_meta, entry.key_ptr.*)) continue;

                if (name_to_idx.get(entry.key_ptr.*)) |dep_idx| {
                    // Package i depends on dep_idx → dep_idx must come first
                    in_degree[i] += 1;
                    dependents[dep_idx].append(allocator, i) catch continue;
                }
            }
        }
    }

    // Kahn's algorithm: process 0 in-degree first
    const sorted = allocator.alloc(usize, n) catch return;
    defer allocator.free(sorted);
    var sorted_count: usize = 0;

    var queue = std.ArrayList(usize).empty;
    defer queue.deinit(allocator);
    for (0..n) |i| {
        if (in_degree[i] == 0) queue.append(allocator, i) catch continue;
    }

    // Drain what is ready; when nothing is ready and packages remain, cut the
    // cycle and carry on.
    //
    // Appending the remainder wholesale, which is what this used to do, gives
    // up on everything merely downstream of a cycle as well as on the cycle
    // itself - and most of the workspace is downstream. Cutting one package at
    // a time and re-draining lets everything that was only waiting on the cut
    // fall back into proper order. On the framework this was written against
    // it roughly halves the number of packages published before a dependency
    // they declare.
    //
    // The cut is the remaining package with the fewest unmet dependencies:
    // the one closest to being ready, so the least is lost by forcing it.
    // Ties go to the lowest index, and the packages were sorted by name above,
    // so the same workspace is cut the same way on every machine.
    while (sorted_count < n) {
        while (queue.items.len > 0) {
            const idx = queue.orderedRemove(0);
            sorted[sorted_count] = idx;
            sorted_count += 1;

            for (dependents[idx].items) |dep| {
                if (in_degree[dep] == 0) continue;
                in_degree[dep] -= 1;
                if (in_degree[dep] == 0) {
                    queue.append(allocator, dep) catch continue;
                }
            }
        }

        if (sorted_count >= n) break;

        var fewest: ?usize = null;
        for (0..n) |i| {
            if (in_degree[i] == 0) continue;
            if (fewest == null or in_degree[i] < in_degree[fewest.?]) fewest = i;
        }

        const cut = fewest orelse break;
        in_degree[cut] = 0;
        queue.append(allocator, cut) catch break;
    }

    // Reorder packages in-place using the sorted indices
    const tmp = allocator.alloc(@import("registry.zig").MonorepoPackage, n) catch return;
    defer allocator.free(tmp);
    for (0..n) |i| {
        tmp[i] = packages[sorted[i]];
    }
    @memcpy(packages, tmp);
}

/// Auto-include a single file/directory entry into the staging area.
/// Used for `bin` and `main` entries that npm always includes regardless of `files` array.
fn autoIncludeEntry(allocator: std.mem.Allocator, package_dir: []const u8, staging_pkg: []const u8, entry: []const u8) void {
    // Strip leading ./ if present
    const clean_entry = if (std.mem.startsWith(u8, entry, "./")) entry[2..] else entry;
    if (clean_entry.len == 0) return;

    const src = std.fs.path.join(allocator, &[_][]const u8{ package_dir, clean_entry }) catch return;
    defer allocator.free(src);
    const dst = std.fs.path.join(allocator, &[_][]const u8{ staging_pkg, clean_entry }) catch return;
    defer allocator.free(dst);

    // Check if source exists
    io_helper.accessAbsolute(src, .{}) catch return;

    // Check if already copied (from files array)
    io_helper.accessAbsolute(dst, .{}) catch {
        // Not yet copied — copy it now
        if (std.fs.path.dirname(dst)) |parent| {
            io_helper.makePath(parent) catch return;
        }

        const cp = io_helper.childRun(allocator, &[_][]const u8{ "cp", "-rp", src, dst }) catch return;
        defer allocator.free(cp.stdout);
        defer allocator.free(cp.stderr);

        const cp_ok = switch (cp.term) {
            .exited => |code| code == 0,
            else => false,
        };
        if (cp_ok) {
            style.print("  + {s} (auto-included)\n", .{clean_entry});
        }
        return;
    };
    // Already exists in staging (copied from files array) — skip
}

/// Walk up from `start_dir` looking for a package.json that declares a
/// `workspaces` field. Returns the directory containing that package.json
/// (caller-owned), or null if none found before hitting the filesystem root.
fn findWorkspaceRoot(allocator: std.mem.Allocator, start_dir: []const u8) ?[]const u8 {
    var current = std.fs.path.dirname(start_dir) orelse return null;
    var depth: u8 = 0;
    while (depth < 12) : (depth += 1) {
        const pkg_path = std.fs.path.join(allocator, &[_][]const u8{ current, "package.json" }) catch return null;
        defer allocator.free(pkg_path);

        const content = io_helper.readFileAlloc(allocator, pkg_path, 1024 * 1024) catch null;
        if (content) |c| {
            defer allocator.free(c);
            // Cheap text check first to avoid parsing every package.json on the
            // walk; only parse when we see the workspaces key at all.
            if (std.mem.indexOf(u8, c, "\"workspaces\"") != null) {
                const parsed = std.json.parseFromSlice(std.json.Value, allocator, c, .{}) catch break;
                defer parsed.deinit();
                if (parsed.value == .object and parsed.value.object.get("workspaces") != null) {
                    return allocator.dupe(u8, current) catch null;
                }
            }
        }

        const parent = std.fs.path.dirname(current) orelse break;
        if (std.mem.eql(u8, parent, current)) break;
        current = parent;
    }
    return null;
}

/// Recursively scan `root` for a package.json with `name == dep_name`, and
/// return its `version` string (caller-owned) or null if not found. Skips
/// node_modules and dotfiles to avoid traversing the dep graph.
fn findSiblingVersion(allocator: std.mem.Allocator, root: []const u8, dep_name: []const u8) !?[]const u8 {
    var dir = io_helper.openDirForIteration(root) catch return null;
    defer dir.close();

    var iter = dir.iterate();
    while (iter.next() catch null) |entry| {
        if (entry.kind != .directory) continue;
        if (std.mem.startsWith(u8, entry.name, ".")) continue;
        if (std.mem.eql(u8, entry.name, "node_modules")) continue;
        if (std.mem.eql(u8, entry.name, "dist")) continue;
        if (std.mem.eql(u8, entry.name, "build")) continue;

        const sub_path = std.fs.path.join(allocator, &[_][]const u8{ root, entry.name }) catch continue;
        defer allocator.free(sub_path);

        // Try this directory's package.json
        const pkg_path = std.fs.path.join(allocator, &[_][]const u8{ sub_path, "package.json" }) catch continue;
        defer allocator.free(pkg_path);

        const sib_content = io_helper.readFileAlloc(allocator, pkg_path, 64 * 1024) catch null;
        if (sib_content) |sc| {
            defer allocator.free(sc);
            const sib_parsed = std.json.parseFromSlice(std.json.Value, allocator, sc, .{}) catch null;
            if (sib_parsed) |sp| {
                defer sp.deinit();
                if (sp.value == .object) {
                    const name_val = sp.value.object.get("name");
                    const version_val = sp.value.object.get("version");
                    if (name_val != null and name_val.? == .string and
                        version_val != null and version_val.? == .string and
                        std.mem.eql(u8, name_val.?.string, dep_name))
                    {
                        return try allocator.dupe(u8, version_val.?.string);
                    }
                }
            }
        }

        // Recurse into subdirectories
        if (try findSiblingVersion(allocator, sub_path, dep_name)) |v| return v;
    }

    return null;
}

/// Resolve workspace: protocol dependencies in package.json content.
/// Returns a new allocation with resolved versions, or the original content if nothing to resolve.
/// Caller must free the result if it differs from the input (check ptr equality).
/// Fails loudly with error.UnresolvableWorkspaceDependency when a workspace:
/// range cannot be resolved — publishing it verbatim would produce an
/// uninstallable package.
fn resolveWorkspaceProtocol(allocator: std.mem.Allocator, content: []const u8, package_dir: []const u8) ![]const u8 {
    // Quick check: if no workspace: refs, return original content
    if (std.mem.indexOf(u8, content, "\"workspace:") == null) return content;

    // Find the workspace root by walking up from package_dir until we hit a
    // package.json with a `workspaces` field. Falls back to the immediate
    // parent directory if no workspace root is found, preserving the old
    // behavior for non-workspace monorepo layouts.
    //
    // Without this, nested package layouts (e.g. `packages/collections/foo`
    // depending on `packages/bar`) silently ship `workspace:*` to npm —
    // because the immediate parent dir scan only sees `packages/collections/`,
    // not the sibling `packages/bar/`.
    const workspace_root = findWorkspaceRoot(allocator, package_dir) orelse std.fs.path.dirname(package_dir) orelse return content;
    defer if (workspace_root.ptr != package_dir.ptr) allocator.free(workspace_root);

    // Parse the package.json properly with std.json
    const parsed = std.json.parseFromSlice(std.json.Value, allocator, content, .{}) catch return content;
    defer parsed.deinit();
    if (parsed.value != .object) return content;

    // Collect workspace dep resolutions: dep_name -> resolved_version
    const dep_sections = [_][]const u8{ "dependencies", "devDependencies", "peerDependencies", "optionalDependencies" };
    var resolutions = std.StringHashMap([]const u8).init(allocator);
    defer {
        var it = resolutions.iterator();
        while (it.next()) |entry| {
            allocator.free(entry.key_ptr.*);
            allocator.free(entry.value_ptr.*);
        }
        resolutions.deinit();
    }

    for (dep_sections) |section| {
        const deps_val = parsed.value.object.get(section) orelse continue;
        if (deps_val != .object) continue;
        for (deps_val.object.keys(), deps_val.object.values()) |dep_name, dep_ver| {
            if (dep_ver != .string) continue;
            if (!std.mem.startsWith(u8, dep_ver.string, "workspace:")) continue;
            const ws_spec = dep_ver.string["workspace:".len..];

            // Look up the actual version from a sibling package — recursively
            // scan the workspace root so deeply nested layouts resolve too.
            const found = findSiblingVersion(allocator, workspace_root, dep_name) catch null;
            if (found == null) {
                // Fail loudly: shipping a literal workspace: range to npm
                // would produce an uninstallable package.
                style.printError(
                    "Cannot publish: dependency \"{s}\" ({s}) uses \"workspace:{s}\" but no workspace package with that name was found below the workspace root.\nRefusing to publish an unresolvable workspace: range — the published package would be uninstallable.\n",
                    .{ dep_name, section, ws_spec },
                );
                return error.UnresolvableWorkspaceDependency;
            }
            if (found) |sib_version| {
                defer allocator.free(sib_version);
                // Determine version prefix based on workspace spec
                const prefix: []const u8 = if (std.mem.eql(u8, ws_spec, "^")) "^" else if (std.mem.eql(u8, ws_spec, "~")) "~" else "";
                const resolved_ver = std.fmt.allocPrint(allocator, "{s}{s}", .{ prefix, sib_version }) catch continue;
                const key_dup = allocator.dupe(u8, dep_name) catch {
                    allocator.free(resolved_ver);
                    continue;
                };
                resolutions.put(key_dup, resolved_ver) catch {
                    allocator.free(key_dup);
                    allocator.free(resolved_ver);
                };
                style.print("  Resolved {s}: workspace:{s} → {s}{s}\n", .{ dep_name, ws_spec, prefix, sib_version });
            }
        }
    }

    if (resolutions.count() == 0) return content;

    // Do string replacements in the original content
    var result = std.ArrayList(u8).empty;
    defer result.deinit(allocator);

    var i: usize = 0;
    while (i < content.len) {
        if (i + 12 < content.len and std.mem.startsWith(u8, content[i..], "\"workspace:")) {
            // Find the closing quote
            if (std.mem.indexOfPos(u8, content, i + 1, "\"")) |close_q| {
                // Find which dep name this belongs to by scanning backwards
                var dep_name: ?[]const u8 = null;
                if (i >= 4) {
                    var j = i - 1;
                    while (j > 0 and (content[j] == ' ' or content[j] == '\t' or content[j] == '\n' or content[j] == '\r')) : (j -= 1) {}
                    if (j > 0 and content[j] == ':') {
                        j -= 1;
                        while (j > 0 and (content[j] == ' ' or content[j] == '\t')) : (j -= 1) {}
                        if (content[j] == '"') {
                            const key_end = j;
                            j -= 1;
                            while (j > 0 and content[j] != '"') : (j -= 1) {}
                            if (content[j] == '"') {
                                dep_name = content[j + 1 .. key_end];
                            }
                        }
                    }
                }

                if (dep_name) |name| {
                    if (resolutions.get(name)) |resolved_ver| {
                        try result.append(allocator, '"');
                        try result.appendSlice(allocator, resolved_ver);
                        try result.append(allocator, '"');
                        i = close_q + 1;
                        continue;
                    }
                }

                // No resolution found, copy as-is
                try result.appendSlice(allocator, content[i .. close_q + 1]);
                i = close_q + 1;
                continue;
            }
        }
        try result.append(allocator, content[i]);
        i += 1;
    }

    return try result.toOwnedSlice(allocator);
}

/// Extract the `files` array from package.json
fn getFilesArrayFromPackageJson(allocator: std.mem.Allocator, pkg_json_path: []const u8) ![][]const u8 {
    const content = try io_helper.readFileAlloc(allocator, pkg_json_path, 1024 * 1024);
    defer allocator.free(content);

    const parsed = try std.json.parseFromSlice(std.json.Value, allocator, content, .{});
    defer parsed.deinit();

    if (parsed.value != .object) return error.InvalidJson;

    const files_val = parsed.value.object.get("files") orelse return error.NoFilesArray;
    if (files_val != .array) return error.NoFilesArray;

    var result = try allocator.alloc([]const u8, files_val.array.items.len);
    var count: usize = 0;
    errdefer {
        for (result[0..count]) |f| allocator.free(f);
        allocator.free(result);
    }

    for (files_val.array.items) |item| {
        if (item == .string) {
            result[count] = try allocator.dupe(u8, item.string);
            count += 1;
        }
    }

    // Resize if some items weren't strings
    if (count < result.len) {
        result = try allocator.realloc(result, count);
    }

    if (count == 0) {
        allocator.free(result);
        return error.NoFilesArray;
    }

    return result;
}

/// Generate provenance metadata
fn generateProvenance(
    allocator: std.mem.Allocator,
    token: *@import("../../auth/oidc.zig").OIDCToken,
    package_name: []const u8,
    version: []const u8,
) !void {
    // Sanitize package name for filename (replace @ and / with -)
    var sanitized_name = try allocator.alloc(u8, package_name.len);
    defer allocator.free(sanitized_name);
    for (package_name, 0..) |c, i| {
        sanitized_name[i] = if (c == '@' or c == '/') '-' else c;
    }
    const clean_name = if (sanitized_name[0] == '-') sanitized_name[1..] else sanitized_name;

    // Generate subject name for provenance
    const subject_name = try std.fmt.allocPrint(allocator, "{s}@{s}", .{ package_name, version });
    defer allocator.free(subject_name);

    // Generate SLSA provenance format
    const provenance = try std.fmt.allocPrint(
        allocator,
        \\{{
        \\  "_type": "https://in-toto.io/Statement/v0.1",
        \\  "subject": [{{
        \\    "name": "{s}",
        \\    "digest": {{
        \\      "sha256": "placeholder"
        \\    }}
        \\  }}],
        \\  "predicateType": "https://slsa.dev/provenance/v0.2",
        \\  "predicate": {{
        \\    "builder": {{
        \\      "id": "{s}"
        \\    }},
        \\    "buildType": "https://slsa.dev/build-type/v1",
        \\    "invocation": {{
        \\      "configSource": {{
        \\        "uri": "{s}",
        \\        "digest": {{
        \\          "sha1": "{s}"
        \\        }}
        \\      }}
        \\    }},
        \\    "metadata": {{
        \\      "buildInvocationId": "{s}",
        \\      "completeness": {{
        \\        "parameters": true,
        \\        "environment": true,
        \\        "materials": true
        \\      }},
        \\      "reproducible": false
        \\    }}
        \\  }}
        \\}}
    ,
        .{
            subject_name,
            token.claims.iss,
            token.claims.repository orelse "unknown",
            token.claims.sha orelse "unknown",
            token.claims.jti orelse "unknown",
        },
    );
    defer allocator.free(provenance);

    // Write provenance to file (use sanitized name for filename)
    const provenance_path = try std.fmt.allocPrint(
        allocator,
        "{s}-{s}.provenance.json",
        .{ clean_name, version },
    );
    defer allocator.free(provenance_path);

    // Use io_helper for writeFile
    const fs_file = try io_helper.cwd().createFile(io_helper.io, provenance_path, .{});
    defer fs_file.close(io_helper.io);
    try io_helper.writeAllToFile(fs_file, provenance);

    style.print("Generated provenance: {s}\n", .{provenance_path});
}

// ============================================================================
// Trusted Publisher Management Commands
// ============================================================================

pub const TrustedPublisherAddOptions = struct {
    /// The package. Null: every publishable package of the monorepo here
    /// (packages/), or the package in this directory.
    package: ?[]const u8 = null,
    type: []const u8 = "github-action", // "github-action" or "gitlab-ci"
    /// The repository's owner. Optional when `repository` is `owner/repo`.
    owner: ?[]const u8 = null,
    repository: []const u8,
    /// The workflow that publishes: a path or just its file name.
    workflow: ?[]const u8 = null,
    environment: ?[]const u8 = null,
    registry: []const u8 = "https://registry.npmjs.org",
    /// A one-time password, if you have one ready; otherwise pantry asks.
    otp: ?[]const u8 = null,
};

const npm_trust = @import("../../auth/npm_trust.zig");

/// The packages a trust command acts on: the one named, or else every
/// publishable package of the monorepo here, or else the package here.
fn trustTargets(allocator: std.mem.Allocator, named: ?[]const u8) ![][]const u8 {
    var names: std.ArrayList([]const u8) = .empty;
    errdefer {
        for (names.items) |n| allocator.free(n);
        names.deinit(allocator);
    }
    if (named) |name| {
        try names.append(allocator, try allocator.dupe(u8, name));
        return names.toOwnedSlice(allocator);
    }
    const cwd = try io_helper.realpathAlloc(allocator, ".");
    defer allocator.free(cwd);
    const registry_cmds = @import("registry.zig");
    if (registry_cmds.detectMonorepoPackages(allocator, cwd, null) catch null) |pkgs| {
        defer {
            for (pkgs) |*pkg| {
                var p = pkg.*;
                p.deinit(allocator);
            }
            allocator.free(pkgs);
        }
        for (pkgs) |pkg| try names.append(allocator, try allocator.dupe(u8, pkg.name));
        std.mem.sort([]const u8, names.items, {}, struct {
            fn lessThan(_: void, a: []const u8, b: []const u8) bool {
                return std.mem.lessThan(u8, a, b);
            }
        }.lessThan);
        return names.toOwnedSlice(allocator);
    }
    const config_path = common.findConfigFile(allocator, cwd) catch return names.toOwnedSlice(allocator);
    defer allocator.free(config_path);
    const content = io_helper.readFileAlloc(allocator, config_path, 1024 * 1024) catch return names.toOwnedSlice(allocator);
    defer allocator.free(content);
    const parsed = std.json.parseFromSlice(std.json.Value, allocator, content, .{}) catch return names.toOwnedSlice(allocator);
    defer parsed.deinit();
    if (parsed.value == .object) {
        if (parsed.value.object.get("name")) |n| {
            if (n == .string) try names.append(allocator, try allocator.dupe(u8, n.string));
        }
    }
    return names.toOwnedSlice(allocator);
}

fn freeTrustTargets(allocator: std.mem.Allocator, names: [][]const u8) void {
    for (names) |n| allocator.free(n);
    allocator.free(names);
}

/// The npm token trust commands authenticate with, or the message for its absence.
fn trustAuthToken(allocator: std.mem.Allocator) ![]u8 {
    return readNpmAuthToken(allocator, false) catch |err| {
        if (err == error.EnvironmentVariableNotFound or err == error.FileNotFound) return error.NoNpmToken;
        return err;
    };
}

const no_npm_token_message = "Error: No npm auth token found. Log in with `pantry login`, or set NPM_TOKEN (or NODE_AUTH_TOKEN / BUN_AUTH_TOKEN).";

/// One trust request, with npm's two-factor step taken care of: approved in
/// the browser when npm offers that, typed in otherwise. `otp` carries the
/// password between calls, so a monorepo asks once while npm accepts it.
fn trustCall(
    allocator: std.mem.Allocator,
    client: *@import("../../auth/registry.zig").RegistryClient,
    method: std.http.Method,
    package_name: []const u8,
    id: ?[]const u8,
    body: ?[]const u8,
    auth_token: []const u8,
    otp: *?[]const u8,
) !npm_trust.Response {
    var attempt: u8 = 0;
    while (true) : (attempt += 1) {
        var response = try npm_trust.request(client, method, package_name, id, body, auth_token, otp.*);
        if (!response.needs_otp or attempt >= 3) return response;

        // A password npm turned down is spent.
        if (otp.*) |old| {
            allocator.free(old);
            otp.* = null;
        }
        if (npm_trust.webAuth(allocator, response.body)) |found| {
            var web = found;
            defer web.deinit(allocator);
            response.deinit(allocator);
            style.print("\n  npm wants two-factor approval. Approve it in your browser:\n    {s}\n", .{web.auth_url});
            _ = openInBrowser(allocator, web.auth_url);
            style.print("  Waiting for approval...\n", .{});
            otp.* = npm_trust.awaitWebAuth(client, web.done_url, auth_token, 300, &.{}) catch |err| {
                style.print("  Browser approval didn't complete ({any}).\n", .{err});
                return err;
            };
            continue;
        }
        response.deinit(allocator);
        if (io_helper.getEnvVarOwned(allocator, "CI")) |ci| {
            allocator.free(ci);
            return error.OtpRequired;
        } else |_| {}
        style.print("\n  npm wants a one-time password. Enter the code from your authenticator: ", .{});
        var buf: [64]u8 = undefined;
        const read = io_helper.readStdin(&buf) catch return error.OtpRequired;
        const code = std.mem.trim(u8, buf[0..read], &std.ascii.whitespace);
        if (code.len == 0) return error.OtpRequired;
        otp.* = try allocator.dupe(u8, code);
    }
}

fn openInBrowser(allocator: std.mem.Allocator, url: []const u8) bool {
    const argv: []const []const u8 = switch (@import("builtin").os.tag) {
        .macos => &.{ "open", url },
        .windows => &.{ "cmd", "/c", "start", url },
        else => &.{ "xdg-open", url },
    };
    const result = io_helper.childRun(allocator, argv) catch return false;
    allocator.free(result.stdout);
    allocator.free(result.stderr);
    return result.term == .exited and result.term.exited == 0;
}

/// Trust a CI workflow to publish a package with OIDC, through npm's trusted
/// publishing API (the one `npm trust` uses). Without --package, every
/// publishable package of the monorepo here is set up the same way, behind
/// a single two-factor approval when npm allows it.
pub fn trustedPublisherAddCommand(
    allocator: std.mem.Allocator,
    args: []const []const u8,
    options: TrustedPublisherAddOptions,
) !CommandResult {
    _ = args;
    const registry = @import("../../auth/registry.zig");

    if (!npm_trust.isGitHub(options.type) and !npm_trust.isGitLab(options.type)) {
        return CommandResult.err(allocator, "Error: pantry sets up GitHub Actions (github-action) and GitLab CI (gitlab-ci) publishers. For CircleCI, use `npm trust circleci`.");
    }
    const workflow = options.workflow orelse {
        return CommandResult.err(allocator, if (npm_trust.isGitHub(options.type))
            "Error: --workflow is required: the workflow that publishes, e.g. release.yml"
        else
            "Error: --workflow is required: the pipeline file that publishes, e.g. .gitlab-ci.yml");
    };
    const repository = if (std.mem.indexOfScalar(u8, options.repository, '/') != null)
        try allocator.dupe(u8, options.repository)
    else if (options.owner) |owner|
        try std.fmt.allocPrint(allocator, "{s}/{s}", .{ owner, options.repository })
    else
        return CommandResult.err(allocator, "Error: --owner is required, or give --repository as owner/repo");
    defer allocator.free(repository);

    const packages = trustTargets(allocator, options.package) catch {
        return CommandResult.err(allocator, "Error: Could not read the packages here");
    };
    defer freeTrustTargets(allocator, packages);
    if (packages.len == 0) {
        return CommandResult.err(allocator, "Error: No package here to set up. Pass --package, or run this in a package or a monorepo with packages/.");
    }
    for (packages) |name| {
        if (npm_trust.nameProblem(name)) |problem| {
            const msg = try std.fmt.allocPrint(allocator, "Error: \"{s}\" can't be an npm package name: {s}", .{ name, problem });
            return CommandResult.err(allocator, msg);
        }
    }

    const body = npm_trust.configBody(allocator, options.type, repository, workflow, options.environment) catch {
        return CommandResult.err(allocator, "Error: Could not build the trust configuration");
    };
    defer allocator.free(body);

    style.print("Trusting {s} ({s}) to publish with OIDC:\n", .{ repository, npm_trust.workflowFile(workflow) });
    if (options.environment) |e| style.print("  Environment: {s}\n", .{e});
    for (packages) |name| style.print("  {s}\n", .{name});

    const auth_token = trustAuthToken(allocator) catch |err| {
        if (err == error.NoNpmToken) return CommandResult.err(allocator, no_npm_token_message);
        return CommandResult.err(allocator, "Error: Failed to read npm auth token");
    };
    defer allocator.free(auth_token);

    var client = try registry.RegistryClient.init(allocator, options.registry);
    defer client.deinit();

    var otp: ?[]const u8 = if (options.otp) |o| try allocator.dupe(u8, o) else null;
    defer if (otp) |o| allocator.free(o);

    var failed: usize = 0;
    for (packages) |name| {
        var response = trustCall(allocator, &client, .POST, name, null, body, auth_token, &otp) catch |err| {
            failed += 1;
            if (err == error.OtpRequired) {
                style.print("  ✗ {s}: npm needs a one-time password; pass --otp <code>\n", .{name});
            } else {
                style.print("  ✗ {s}: {any}\n", .{ name, err });
            }
            continue;
        };
        defer response.deinit(allocator);
        if (response.ok()) {
            style.print("  ✓ {s}\n", .{name});
            continue;
        }
        const message = try npm_trust.message(allocator, response.body);
        defer allocator.free(message);
        if (response.status == 409) {
            style.print("  ✓ {s} (already trusted: {s})\n", .{ name, message });
            continue;
        }
        failed += 1;
        style.print("  ✗ {s}: {d} {s}\n", .{ name, response.status, message });
        if (response.tokenBypasses2fa()) {
            style.print("    This token skips two-factor, and npm no longer takes those for trust settings. Log in with `pantry login` and run this again.\n", .{});
        } else if (response.status == 401) {
            style.print("    npm didn't accept the token. Log in with `pantry login` and run this again.\n", .{});
        } else if (response.status == 404) {
            style.print("    npm answers 404 for a package that isn't on npm yet, or that this account can't administer.\n", .{});
        }
    }

    if (failed > 0) {
        const msg = try std.fmt.allocPrint(allocator, "{d} of {d} package(s) not set up", .{ failed, packages.len });
        return CommandResult.err(allocator, msg);
    }
    style.print("\nPublishing from {s} with `pantry publish --npm` now uses OIDC, with provenance.\n", .{repository});
    return .{ .exit_code = 0 };
}

pub const TrustedPublisherListOptions = struct {
    /// Null: every publishable package here, as for publisher:add.
    package: ?[]const u8 = null,
    registry: []const u8 = "https://registry.npmjs.org",
    json: bool = false,
    otp: ?[]const u8 = null,
};

/// List the workflows trusted to publish a package.
pub fn trustedPublisherListCommand(
    allocator: std.mem.Allocator,
    args: []const []const u8,
    options: TrustedPublisherListOptions,
) !CommandResult {
    _ = args;
    const registry = @import("../../auth/registry.zig");

    const packages = trustTargets(allocator, options.package) catch {
        return CommandResult.err(allocator, "Error: Could not read the packages here");
    };
    defer freeTrustTargets(allocator, packages);
    if (packages.len == 0) return CommandResult.err(allocator, "Error: No package here. Pass --package.");

    const auth_token = trustAuthToken(allocator) catch |err| {
        if (err == error.NoNpmToken) return CommandResult.err(allocator, no_npm_token_message);
        return CommandResult.err(allocator, "Error: Failed to read npm auth token");
    };
    defer allocator.free(auth_token);

    var client = try registry.RegistryClient.init(allocator, options.registry);
    defer client.deinit();
    var otp: ?[]const u8 = if (options.otp) |o| try allocator.dupe(u8, o) else null;
    defer if (otp) |o| allocator.free(o);

    var failed: usize = 0;
    if (options.json) style.print("{{", .{});
    for (packages, 0..) |name, n| {
        var response = trustCall(allocator, &client, .GET, name, null, null, auth_token, &otp) catch |err| {
            failed += 1;
            if (!options.json) style.print("{s}: {any}\n", .{ name, err });
            continue;
        };
        defer response.deinit(allocator);
        if (options.json) {
            style.print("{s}\"{s}\": {s}", .{ if (n > 0) "," else "", name, if (response.ok()) response.body else "null" });
            if (!response.ok()) failed += 1;
            continue;
        }
        if (!response.ok()) {
            failed += 1;
            const message = try npm_trust.message(allocator, response.body);
            defer allocator.free(message);
            style.print("{s}: {d} {s}\n", .{ name, response.status, message });
            continue;
        }
        printTrustConfigs(allocator, name, response.body);
    }
    if (options.json) style.print("}}\n", .{});
    return .{ .exit_code = if (failed > 0) 1 else 0 };
}

fn printTrustConfigs(allocator: std.mem.Allocator, name: []const u8, body: []const u8) void {
    const parsed = std.json.parseFromSlice(std.json.Value, allocator, body, .{}) catch {
        style.print("{s}: {s}\n", .{ name, body });
        return;
    };
    defer parsed.deinit();
    const items: []const std.json.Value = switch (parsed.value) {
        .array => |a| a.items,
        .object => &[_]std.json.Value{parsed.value},
        else => &.{},
    };
    if (items.len == 0) {
        style.print("{s}: no trusted publishers\n", .{name});
        return;
    }
    style.print("{s}:\n", .{name});
    for (items) |item| {
        if (item != .object) continue;
        const get = struct {
            fn str(v: ?std.json.Value) []const u8 {
                const value = v orelse return "";
                return if (value == .string) value.string else "";
            }
        }.str;
        const claims = item.object.get("claims");
        const c: ?std.json.ObjectMap = if (claims) |cl| (if (cl == .object) cl.object else null) else null;
        const where = if (c) |m| (if (get(m.get("repository")).len > 0) get(m.get("repository")) else get(m.get("project_path"))) else "";
        var file: []const u8 = "";
        if (c) |m| {
            for ([_][]const u8{ "workflow_ref", "ci_config_ref_uri" }) |key| {
                if (m.get(key)) |ref| {
                    if (ref == .object) file = get(ref.object.get("file"));
                }
            }
        }
        style.print("  {s}  {s} {s} {s}", .{ get(item.object.get("id")), get(item.object.get("type")), where, file });
        if (c) |m| {
            const env = get(m.get("environment"));
            if (env.len > 0) style.print(" (environment {s})", .{env});
        }
        style.print("\n", .{});
    }
}

pub const TrustedPublisherRemoveOptions = struct {
    package: []const u8,
    publisher_id: []const u8,
    registry: []const u8 = "https://registry.npmjs.org",
    otp: ?[]const u8 = null,
};

/// Stop trusting a workflow to publish a package, by the id publisher:list shows.
pub fn trustedPublisherRemoveCommand(
    allocator: std.mem.Allocator,
    args: []const []const u8,
    options: TrustedPublisherRemoveOptions,
) !CommandResult {
    _ = args;
    const registry = @import("../../auth/registry.zig");

    if (npm_trust.nameProblem(options.package)) |problem| {
        const msg = try std.fmt.allocPrint(allocator, "Error: \"{s}\" can't be an npm package name: {s}", .{ options.package, problem });
        return CommandResult.err(allocator, msg);
    }
    const auth_token = trustAuthToken(allocator) catch |err| {
        if (err == error.NoNpmToken) return CommandResult.err(allocator, no_npm_token_message);
        return CommandResult.err(allocator, "Error: Failed to read npm auth token");
    };
    defer allocator.free(auth_token);

    var client = try registry.RegistryClient.init(allocator, options.registry);
    defer client.deinit();
    var otp: ?[]const u8 = if (options.otp) |o| try allocator.dupe(u8, o) else null;
    defer if (otp) |o| allocator.free(o);

    var response = trustCall(allocator, &client, .DELETE, options.package, options.publisher_id, null, auth_token, &otp) catch |err| {
        const msg = try std.fmt.allocPrint(allocator, "Error: Failed to remove trusted publisher: {any}", .{err});
        return CommandResult.err(allocator, msg);
    };
    defer response.deinit(allocator);
    if (!response.ok()) {
        const message = try npm_trust.message(allocator, response.body);
        defer allocator.free(message);
        const msg = try std.fmt.allocPrint(allocator, "Error: {d} {s}", .{ response.status, message });
        return CommandResult.err(allocator, msg);
    }
    style.print("✓ Removed trusted publisher {s} from {s}\n", .{ options.publisher_id, options.package });
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
        self.children.deinit(allocator);
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
    const cwd = try io_helper.realpath(".", &cwd_buf);

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
    var matches = std.ArrayList([]const u8).empty;
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

        style.print("{s}@{s}\n", .{ pkg_name, dep_info.version });

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

            style.print("  └─ {s}{s}@1.0.0 (requires {s})\n", .{
                dep_type_str,
                project_name,
                dep_info.version,
            });
        } else {
            // Build and display full dependency tree
            try displayDependencyTree(allocator, pkg_name, dep_info, parsed, 1, options.depth orelse 999);
        }

        style.print("\n", .{});
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
        style.print("{s}└─ (deeper dependencies hidden)\n", .{indent});
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

    style.print("{s}└─ {s}{s}@1.0.0 (requires {s})\n", .{
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

// ============================================================================
// Credential Storage Helpers
// ============================================================================

/// Read a credential from ~/.pantry/credentials file
/// The file format is simple key=value pairs, one per line
/// Example:
///   npm_token=npm_xxxxxxxxxxxx
///   github_token=ghp_xxxxxxxxxxxx
fn readPantryCredential(allocator: std.mem.Allocator, key: []const u8) ![]u8 {
    // Get home directory
    const home = io_helper.getenv("HOME") orelse return error.EnvironmentVariableNotFound;

    // Build path to credentials file
    var path_buf: [std.fs.max_path_bytes]u8 = undefined;
    const credentials_path = try std.fmt.bufPrint(&path_buf, "{s}/.pantry/credentials", .{home});

    // Read file contents
    const content = io_helper.readFileAlloc(allocator, credentials_path, 64 * 1024) catch |err| {
        if (err == error.FileNotFound) return error.FileNotFound;
        return err;
    };
    defer allocator.free(content);

    // Parse key=value pairs
    var lines = std.mem.splitSequence(u8, content, "\n");
    while (lines.next()) |line| {
        const trimmed = std.mem.trim(u8, line, &std.ascii.whitespace);

        // Skip empty lines and comments
        if (trimmed.len == 0 or trimmed[0] == '#') continue;

        // Find the = separator
        if (std.mem.indexOfScalar(u8, trimmed, '=')) |eq_pos| {
            const line_key = std.mem.trim(u8, trimmed[0..eq_pos], &std.ascii.whitespace);
            const line_value = std.mem.trim(u8, trimmed[eq_pos + 1 ..], &std.ascii.whitespace);

            if (std.mem.eql(u8, line_key, key)) {
                return try allocator.dupe(u8, line_value);
            }
        }
    }

    return error.EnvironmentVariableNotFound;
}

fn readNpmAuthToken(allocator: std.mem.Allocator, allow_prompt: bool) ![]u8 {
    return io_helper.getEnvVarOwned(allocator, "NPM_TOKEN") catch blk: {
        break :blk io_helper.getEnvVarOwned(allocator, "NODE_AUTH_TOKEN") catch blk2: {
            break :blk2 io_helper.getEnvVarOwned(allocator, "BUN_AUTH_TOKEN") catch blk3: {
                break :blk3 readNpmrcAuthToken(allocator) catch blk4: {
                    break :blk4 readPantryCredential(allocator, "NPM_TOKEN") catch blk5: {
                        break :blk5 readPantryCredential(allocator, "npm_token") catch {
                            if (allow_prompt) {
                                return promptAndSaveToken(allocator);
                            }
                            return error.EnvironmentVariableNotFound;
                        };
                    };
                };
            };
        };
    };
}

fn parseNpmrcAuthToken(allocator: std.mem.Allocator, content: []const u8) ![]u8 {
    var lines = std.mem.splitScalar(u8, content, '\n');
    while (lines.next()) |line| {
        const trimmed = std.mem.trim(u8, line, &std.ascii.whitespace);
        if (trimmed.len == 0 or trimmed[0] == '#' or trimmed[0] == ';') continue;
        const eq_pos = std.mem.indexOfScalar(u8, trimmed, '=') orelse continue;
        const key = std.mem.trim(u8, trimmed[0..eq_pos], &std.ascii.whitespace);
        if (!std.mem.eql(u8, key, "_authToken") and !std.mem.endsWith(u8, key, ":_authToken")) continue;

        var value = std.mem.trim(u8, trimmed[eq_pos + 1 ..], &std.ascii.whitespace);
        if (value.len >= 2 and ((value[0] == '"' and value[value.len - 1] == '"') or (value[0] == '\'' and value[value.len - 1] == '\''))) {
            value = value[1 .. value.len - 1];
        }
        if (value.len == 0) continue;

        // npmrc commonly delegates the secret to an environment variable.
        if (value.len > 3 and std.mem.startsWith(u8, value, "${") and value[value.len - 1] == '}') {
            return io_helper.getEnvVarOwned(allocator, value[2 .. value.len - 1]);
        }
        return allocator.dupe(u8, value);
    }
    return error.EnvironmentVariableNotFound;
}

fn readNpmrcTokenAtPath(allocator: std.mem.Allocator, path: []const u8) ![]u8 {
    const content = try io_helper.readFileAlloc(allocator, path, 1024 * 1024);
    defer allocator.free(content);
    return parseNpmrcAuthToken(allocator, content);
}

fn readNpmrcAuthToken(allocator: std.mem.Allocator) ![]u8 {
    // npm precedence gives the project file priority over the user config.
    if (readNpmrcTokenAtPath(allocator, ".npmrc")) |token| return token else |_| {}

    if (io_helper.getEnvVarOwned(allocator, "NPM_CONFIG_USERCONFIG")) |user_config| {
        defer allocator.free(user_config);
        return readNpmrcTokenAtPath(allocator, user_config);
    } else |_| {}

    const home = io_helper.getenv("HOME") orelse return error.EnvironmentVariableNotFound;
    const user_path = try std.fs.path.join(allocator, &.{ home, ".npmrc" });
    defer allocator.free(user_path);
    return readNpmrcTokenAtPath(allocator, user_path);
}

test "npmrc token parser supports registry keys quotes and comments" {
    const content =
        \\# npm authentication
        \\registry=https://registry.npmjs.org/
        \\//registry.npmjs.org/:_authToken="npm_secret_value"
    ;
    const token = try parseNpmrcAuthToken(std.testing.allocator, content);
    defer std.testing.allocator.free(token);
    try std.testing.expectEqualStrings("npm_secret_value", token);
}

test "npmrc token parser supports unscoped auth token" {
    const token = try parseNpmrcAuthToken(std.testing.allocator, "_authToken='local-token'\n");
    defer std.testing.allocator.free(token);
    try std.testing.expectEqualStrings("local-token", token);
}

/// Save a credential to ~/.pantry/credentials.
///
/// Delegates to the credential store so this path and `pantry token set` write
/// the same format — an earlier hand-rolled writer here flattened the file and
/// would have dropped any registry-scoped entries it didn't understand.
pub fn savePantryCredential(allocator: std.mem.Allocator, key: []const u8, value: []const u8) !void {
    var store = try token_commands.Store.load(allocator);
    defer store.deinit();

    try store.set(key, null, value);
    try store.save();
}

/// Save a credential to the project's .env file
/// Only saves if the key doesn't already exist in .env
fn saveToProjectEnv(allocator: std.mem.Allocator, key: []const u8, value: []const u8) !void {
    // Read existing .env content or start fresh
    const existing_content = io_helper.readFileAlloc(allocator, ".env", 64 * 1024) catch try allocator.alloc(u8, 0);
    defer allocator.free(existing_content);

    // Check if key already exists
    var lines = std.mem.splitSequence(u8, existing_content, "\n");
    while (lines.next()) |line| {
        const trimmed = std.mem.trim(u8, line, &std.ascii.whitespace);
        if (trimmed.len == 0) continue;

        if (std.mem.indexOfScalar(u8, trimmed, '=')) |eq_pos| {
            const line_key = std.mem.trim(u8, trimmed[0..eq_pos], &std.ascii.whitespace);
            if (std.mem.eql(u8, line_key, key)) {
                // Key already exists, don't overwrite
                return;
            }
        }
    }

    // Append key to .env
    var new_content: std.ArrayList(u8) = .empty;
    defer new_content.deinit(allocator);

    // Copy existing content
    if (existing_content.len > 0) {
        try new_content.appendSlice(allocator, existing_content);
        // Ensure newline before appending
        if (existing_content[existing_content.len - 1] != '\n') {
            try new_content.append(allocator, '\n');
        }
    }

    // Append new key=value
    try new_content.appendSlice(allocator, key);
    try new_content.append(allocator, '=');
    try new_content.appendSlice(allocator, value);
    try new_content.append(allocator, '\n');

    // Write to .env file
    const file = try io_helper.cwd().createFile(io_helper.io, ".env", .{});
    defer file.close(io_helper.io);
    try io_helper.writeAllToFile(file, new_content.items);
}

/// Prompt user for NPM token and save it to ~/.pantry/credentials
fn promptAndSaveToken(allocator: std.mem.Allocator) ![]u8 {
    // Check if running in CI - don't prompt in non-interactive environments
    if (io_helper.getEnvVarOwned(allocator, "CI")) |ci| {
        allocator.free(ci);
        return error.EnvironmentVariableNotFound;
    } else |_| {}

    style.print("\n", .{});
    style.print("+-----------------------------------------------------------------+\n", .{});
    style.print("|  No NPM token found. Let's set one up!                          |\n", .{});
    style.print("|                                                                 |\n", .{});
    style.print("|  Get your token from: https://www.npmjs.com/settings/tokens    |\n", .{});
    style.print("|  Create a new \"Automation\" or \"Publish\" token.                  |\n", .{});
    style.print("+-----------------------------------------------------------------+\n", .{});
    style.print("\n", .{});
    style.print("Enter your NPM token: ", .{});

    // Read token from stdin
    var buf: [512]u8 = undefined;
    const bytes_read = io_helper.readStdin(&buf) catch {
        return error.EndOfStream;
    };

    if (bytes_read == 0) {
        return error.EndOfStream;
    }

    const token_line = buf[0..bytes_read];

    const token = std.mem.trim(u8, token_line, &std.ascii.whitespace);

    if (token.len == 0) {
        style.print("Error: No token provided.\n", .{});
        return error.EndOfStream;
    }

    // Validate token format (should start with npm_)
    if (!std.mem.startsWith(u8, token, "npm_")) {
        style.print("\nWarning: Token doesn't start with 'npm_'. Make sure you copied the full token.\n", .{});
    }

    // Save to ~/.pantry/credentials (user-level persistence)
    savePantryCredential(allocator, "NPM_TOKEN", token) catch |err| {
        style.print("Warning: Could not save token to ~/.pantry/credentials: {any}\n", .{err});
        // Continue anyway - we have the token in memory
    };

    // Also save to project's .env file (project-level)
    saveToProjectEnv(allocator, "NPM_TOKEN", token) catch {
        // Silently ignore - .env storage is optional
    };

    style.print("Token saved to:\n", .{});
    style.print("  ~/.pantry/credentials (user-level)\n", .{});
    style.print("  .env (project-level, if writable)\n", .{});
    style.print("\nNote: Make sure .env is in your .gitignore!\n\n", .{});

    return try allocator.dupe(u8, token);
}
