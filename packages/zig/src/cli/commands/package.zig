//! Package management commands: remove, update, outdated, publish, list

const std = @import("std");
const io_helper = @import("../../io_helper.zig");
const lib = @import("../../lib.zig");
const common = @import("common.zig");
const style = @import("../style.zig");

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

    // Build paths - packages are in pantry/
    const pantry_dir = try std.fmt.allocPrint(allocator, "{s}/pantry", .{cwd});
    defer allocator.free(pantry_dir);

    const bin_dir = try std.fmt.allocPrint(allocator, "{s}/.bin", .{pantry_dir});
    defer allocator.free(bin_dir);

    // Load package registry to map names to domains
    const pkg_registry = @import("../../packages/generated.zig");

    const lockfile_path = try std.fmt.allocPrint(allocator, "{s}/pantry.lock", .{cwd});
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
    var output = std.ArrayList(u8){};
    defer output.deinit(allocator);

    try serializeJsonWithRemovals(allocator, &output, parsed.value, packages_to_remove);

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
                        var filtered_deps = std.json.ObjectMap.init(allocator);
                        defer filtered_deps.deinit();

                        var dep_iter = val.object.iterator();
                        while (dep_iter.next()) |dep_entry| {
                            if (!packages_to_remove.contains(dep_entry.key_ptr.*)) {
                                try filtered_deps.put(dep_entry.key_ptr.*, dep_entry.value_ptr.*);
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
        var keys_to_remove = std.ArrayList([]const u8){};
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
}

// ============================================================================
// Publish Command
// ============================================================================

pub const PublishOptions = struct {
    access: []const u8 = "public",
    tag: []const u8 = "latest",
    otp: ?[]const u8 = null,
    registry: []const u8 = "https://registry.stacksjs.org", // Pantry registry (default)
    use_oidc: bool = true, // Try OIDC first, fallback to token
    provenance: bool = true, // Generate provenance metadata
    use_npm: bool = false, // Set to true to publish to npm instead
};

/// Publish a package to the registry (npm).
/// Auto-detects monorepos (packages/ directory) and publishes all non-private packages.
pub fn publishCommand(allocator: std.mem.Allocator, args: []const []const u8, options: PublishOptions) !CommandResult {
    _ = args;

    const cwd = io_helper.realpathAlloc(allocator, ".") catch {
        return CommandResult.err(allocator, "Error: Could not determine current directory");
    };
    defer allocator.free(cwd);

    // Check for monorepo (packages/ directory with package.json files)
    const registry_cmds = @import("registry.zig");
    const monorepo_packages = registry_cmds.detectMonorepoPackages(allocator, cwd) catch null;
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

        style.print("Monorepo detected: {d} publishable package(s) in packages/\n", .{pkgs.len});
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

        var failed: usize = 0;
        var succeeded: usize = 0;

        for (pkgs) |pkg| {
            style.print("\nPublishing {s}...\n", .{pkg.name});

            // Propagate root files (README, LICENSE) to package if missing
            var copied_files: [root_files.len]?[]const u8 = .{null} ** root_files.len;
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

            const result = publishSingleToNpm(allocator, pkg.path, pkg.config_path, options);

            // Cleanup: remove propagated files after publish
            for (&copied_files) |*cf| {
                if (cf.*) |path| {
                    io_helper.deleteFile(path) catch {};
                    allocator.free(path);
                    cf.* = null;
                }
            }

            if (result) |r| {
                if (r.exit_code == 0) {
                    succeeded += 1;
                } else {
                    failed += 1;
                    if (r.message) |msg| style.print("  Error: {s}\n", .{msg});
                }
                var res = r;
                res.deinit(allocator);
            } else |err| {
                failed += 1;
                style.print("  Error: {any}\n", .{err});
            }
            style.print("----------------------------------------\n", .{});
        }

        style.print("\nPublished {d}/{d} packages", .{ succeeded, succeeded + failed });
        if (failed > 0) {
            style.print(" ({d} failed)", .{failed});
        }
        style.print("\n", .{});

        return .{ .exit_code = if (failed > 0) 1 else 0 };
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

/// Publish a single package directory to npm.
fn publishSingleToNpm(
    allocator: std.mem.Allocator,
    package_dir: []const u8,
    config_path: []const u8,
    options: PublishOptions,
) !CommandResult {
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
    if (scripts_obj) |scripts| {
        if (!lib.lifecycle.runPrePublishScripts(allocator, scripts, package_dir)) {
            return CommandResult.err(allocator, "Pre-publish lifecycle script failed");
        }
    }

    // Create tarball
    const tarball_info = try createTarball(allocator, package_dir, metadata.name, metadata.version);
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
    if (scripts_obj) |scripts| {
        if (!lib.lifecycle.runPostPackScripts(allocator, scripts, package_dir)) {
            return CommandResult.err(allocator, "postpack lifecycle script failed");
        }
    }

    // Print publish config
    const tag_str: []const u8 = if (metadata.publish_config) |pc|
        if (pc.tag) |t| t else "latest"
    else
        "latest";
    style.print("\nTag: {s}\n", .{tag_str});

    // Determine access level
    const access_str: []const u8 = if (metadata.publish_config) |pc|
        if (pc.access) |a| a else if (metadata.name[0] == '@') "restricted" else "public"
    else if (metadata.name[0] == '@')
        "restricted"
    else
        "public";
    style.print("Access: {s}\n", .{access_str});
    style.print("Registry: {s}\n", .{registry_url});

    // Initialize registry client
    var registry_client = try registry.RegistryClient.init(allocator, registry_url);
    defer registry_client.deinit();

    // Set package.json content so npm metadata includes all fields
    // (types, exports, module, dependencies, bin, etc.)
    // Resolve workspace: protocol deps so npm metadata has real versions
    const resolved_pkg_json = if (config_content) |content|
        resolveWorkspaceProtocol(allocator, content, package_dir) catch content
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
        const result = try attemptOIDCPublish(
            allocator,
            &registry_client,
            metadata.name,
            metadata.version,
            tarball_info.path,
            options.provenance,
        );

        if (result.success) {
            if (options.provenance) {
                style.print("\n✓ Sigstore provenance attached\n", .{});
                style.print("✓ Published {s}@{s} with provenance\n", .{ metadata.name, metadata.version });
            } else {
                style.print("\n✓ Published {s}@{s}\n", .{ metadata.name, metadata.version });
            }
            // Run post-publish scripts: publish → postpublish
            if (scripts_obj) |scripts| {
                _ = lib.lifecycle.runPostPublishScripts(allocator, scripts, package_dir);
            }
            return .{ .exit_code = 0 };
        } else {
            // OIDC failed - only fail on version conflict, otherwise fall back to token
            if (result.is_version_conflict) {
                const err_msg = try std.fmt.allocPrint(
                    allocator,
                    "Error: Version {s} already exists on npm.\nBump the version in package.json before publishing (e.g., 'npm version patch').",
                    .{metadata.version},
                );
                return CommandResult.err(allocator, err_msg);
            }
            // Fall through to token authentication (handles first-time publish, no trusted publisher configured, etc.)
            style.print("OIDC authentication not available, falling back to token...\n", .{});
        }
    }

    // Fallback to token authentication
    // Check NPM_TOKEN first, then NODE_AUTH_TOKEN (used by setup-node action), then ~/.pantry/credentials
    const auth_token = io_helper.getEnvVarOwned(allocator, "NPM_TOKEN") catch blk: {
        break :blk io_helper.getEnvVarOwned(allocator, "NODE_AUTH_TOKEN") catch blk2: {
            break :blk2 readPantryCredential(allocator, "NPM_TOKEN") catch blk3: {
                break :blk3 readPantryCredential(allocator, "npm_token") catch blk4: {
                    break :blk4 promptAndSaveToken(allocator) catch |err| {
                        if (err == error.EnvironmentVariableNotFound or err == error.FileNotFound or err == error.EndOfStream) {
                            // Check if running in CI (non-interactive)
                            const is_ci = io_helper.getEnvVarOwned(allocator, "CI") catch null;
                            if (is_ci) |ci| {
                                allocator.free(ci);
                                return CommandResult.err(
                                    allocator,
                                    \\Error: No authentication method available in CI.
                                    \\
                                    \\Ensure NPM_TOKEN secret is set in your repository:
                                    \\  gh secret set NPM_TOKEN
                                    \\
                                    \\Or configure OIDC trusted publishing on npm.
                                    ,
                                );
                            }
                            return CommandResult.err(
                                allocator,
                                \\Error: No authentication method available.
                                \\
                                \\To fix this, you can either:
                                \\  1. Set NPM_TOKEN environment variable
                                \\  2. Create ~/.pantry/credentials with your npm token:
                                \\     NPM_TOKEN=npm_xxxxxxxxxxxx
                                \\  3. Use OIDC authentication in GitHub Actions (recommended for CI)
                                \\
                                \\Get your npm token from: https://www.npmjs.com/settings/tokens
                                ,
                            );
                        }
                        return CommandResult.err(allocator, "Error: Failed to read auth token");
                    };
                };
            };
        };
    };
    defer allocator.free(auth_token);

    const response = registry_client.publishWithToken(
        metadata.name,
        metadata.version,
        tarball_info.path,
        auth_token,
    ) catch |err| {
        const err_msg = try std.fmt.allocPrint(
            allocator,
            "Error: Failed to publish package: {any}",
            .{err},
        );
        return CommandResult.err(allocator, err_msg);
    };
    defer {
        var mut_response = response;
        mut_response.deinit(allocator);
    }

    if (response.success) {
        style.print("\n✓ Published {s}@{s}\n", .{ metadata.name, metadata.version });
        // Run post-publish scripts: publish → postpublish
        if (scripts_obj) |scripts| {
            _ = lib.lifecycle.runPostPublishScripts(allocator, scripts, package_dir);
        }
        return .{ .exit_code = 0 };
    } else {
        // Clean error output: "{status} {status_text}: {url}\n - {message}"
        const status_text: []const u8 = switch (response.status_code) {
            401 => "Unauthorized",
            403 => "Forbidden",
            404 => "Not Found",
            409 => "Conflict",
            422 => "Unprocessable Entity",
            else => "Error",
        };

        const error_summary = if (response.error_details) |d| (d.summary orelse response.message orelse "Unknown error") else (response.message orelse "Unknown error");

        style.print("\n{d} {s}: {s}/{s}\n", .{ response.status_code, status_text, registry_url, metadata.name });
        style.print(" - {s}\n", .{error_summary});
        style.print("Registry: {s}\n", .{registry_url});

        const err_msg = try std.fmt.allocPrint(
            allocator,
            "{d} {s}: {s}",
            .{ response.status_code, status_text, error_summary },
        );
        return CommandResult.err(allocator, err_msg);
    }
}

/// Result of OIDC publish attempt
const OIDCPublishResult = struct {
    success: bool,
    error_message: ?[]const u8 = null,
    is_version_conflict: bool = false,
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

    // Generate Sigstore provenance bundle if requested
    var sigstore_bundle: ?[]const u8 = null;
    defer if (sigstore_bundle) |bundle| allocator.free(bundle);

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

    // Publish package with provenance bundle
    const response = try registry_client.publishWithOIDCAndProvenance(
        package_name,
        version,
        tarball_path,
        &token,
        sigstore_bundle,
    );
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
            } else {
                error_msg = try std.fmt.allocPrint(allocator, "Publish failed with status {d}", .{response.status_code});
            }
        } else {
            error_msg = try std.fmt.allocPrint(allocator, "Publish failed with status {d}", .{response.status_code});
        }

        return .{
            .success = false,
            .error_message = error_msg,
            .is_version_conflict = is_version_conflict,
        };
    }

    return .{ .success = true };
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

    // Publish with provenance - registry will validate token
    const response = try registry_client.publishWithOIDCAndProvenance(
        package_name,
        version,
        tarball_path,
        &token,
        sigstore_bundle,
    );
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
            } else {
                error_msg = try std.fmt.allocPrint(allocator, "Publish failed with status {d}", .{response.status_code});
            }
        } else {
            error_msg = try std.fmt.allocPrint(allocator, "Publish failed with status {d}", .{response.status_code});
        }

        return .{
            .success = false,
            .error_message = error_msg,
            .is_version_conflict = is_version_conflict,
        };
    }

    return .{ .success = true };
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

    // npm requires all files to be inside a "package/" directory in the tarball
    // Create staging directory structure: /tmp/pantry-staging/package/
    const staging_base = try std.fs.path.join(allocator, &[_][]const u8{ tmp_dir, "pantry-staging" });
    defer allocator.free(staging_base);
    const staging_pkg = try std.fs.path.join(allocator, &[_][]const u8{ staging_base, "package" });
    defer allocator.free(staging_pkg);

    // Clean and create staging directory
    io_helper.deleteTree(staging_base) catch {};

    try io_helper.makePath(staging_pkg);

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
                io_helper.makePath(parent) catch continue;
            }

            // Use cp -rp which works correctly for both files and directories.
            // Previously we checked statFile().kind to decide cp -p vs cp -rp,
            // but on Linux openFile() can succeed on directories, causing
            // statFile to return kind=.file for dirs. cp -p then silently
            // skips directories ("omitting directory"), so only package.json
            // ended up in the tarball.
            const cp = io_helper.childRun(allocator, &[_][]const u8{ "cp", "-rp", src, dst }) catch |err| {
                style.print("  Warning: Failed to copy '{s}': {}\n", .{ file_entry, err });
                continue;
            };
            defer allocator.free(cp.stdout);
            defer allocator.free(cp.stderr);

            const cp_ok = switch (cp.term) {
                .exited => |code| code == 0,
                else => false,
            };
            if (!cp_ok) {
                style.print("  Warning: cp failed for '{s}': {s}\n", .{ file_entry, cp.stderr });
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

        // Read additional exclusion patterns from .pantryignore or .npmignore
        var extra_excludes: [64][]u8 = undefined;
        var extra_exclude_count: usize = 0;
        defer for (extra_excludes[0..extra_exclude_count]) |e| allocator.free(e);

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

        // Parse ignore file patterns
        if (ignore_content) |content| {
            var lines = std.mem.splitScalar(u8, content, '\n');
            while (lines.next()) |line| {
                const trimmed = std.mem.trim(u8, line, " \t\r");
                if (trimmed.len == 0 or trimmed[0] == '#' or trimmed[0] == '!') continue;
                if (extra_exclude_count < extra_excludes.len) {
                    extra_excludes[extra_exclude_count] = std.fmt.allocPrint(allocator, "--exclude={s}", .{trimmed}) catch continue;
                    extra_exclude_count += 1;
                }
            }
        }

        // Build rsync args with both default and custom exclusions
        var rsync_args: [128][]const u8 = undefined;
        var rsync_argc: usize = 0;

        rsync_args[rsync_argc] = "rsync";
        rsync_argc += 1;
        rsync_args[rsync_argc] = "-a";
        rsync_argc += 1;

        // Add custom exclusions first
        for (extra_excludes[0..extra_exclude_count]) |e| {
            rsync_args[rsync_argc] = e;
            rsync_argc += 1;
        }

        // Default exclusions
        const default_excludes = [_][]const u8{
            "--exclude=.git",
            "--exclude=.gitignore",
            "--exclude=.gitattributes",
            "--exclude=.gitmodules",
            "--exclude=.svn",
            "--exclude=.hg",
            "--exclude=CVS",
            "--exclude=.npmignore",
            "--exclude=.pantryignore",
            "--exclude=.npmrc",
            "--exclude=.yarnrc",
            "--exclude=.yarnrc.yml",
            "--exclude=package-lock.json",
            "--exclude=yarn.lock",
            "--exclude=pnpm-lock.yaml",
            "--exclude=bun.lockb",
            "--exclude=shrinkwrap.yaml",
            "--exclude=pantry.lock",
            "--exclude=node_modules",
            "--exclude=pantry",
            "--exclude=.nyc_output",
            "--exclude=coverage",
            "--exclude=.coverage",
            "--exclude=*.tgz",
            "--exclude=*.tar.xz",
            "--exclude=.DS_Store",
            "--exclude=Thumbs.db",
            "--exclude=._*",
            "--exclude=*.swp",
            "--exclude=*.orig",
            "--exclude=.idea",
            "--exclude=.vscode",
            "--exclude=*.sublime-*",
            "--exclude=.github",
            "--exclude=.gitlab-ci.yml",
            "--exclude=.travis.yml",
            "--exclude=.circleci",
            "--exclude=.env",
            "--exclude=.env.*",
            "--exclude=*.pem",
            "--exclude=*.key",
            "--exclude=*.log",
            "--exclude=npm-debug.log",
            "--exclude=deps.yaml",
            "--exclude=.claude",
            "--exclude=pantry",
        };
        for (default_excludes) |e| {
            rsync_args[rsync_argc] = e;
            rsync_argc += 1;
        }

        rsync_args[rsync_argc] = src_path;
        rsync_argc += 1;
        rsync_args[rsync_argc] = dst_path;
        rsync_argc += 1;

        const cp_result = try io_helper.childRun(allocator, rsync_args[0..rsync_argc]);
        defer allocator.free(cp_result.stdout);
        defer allocator.free(cp_result.stderr);

        if (cp_result.term != .exited or cp_result.term.exited != 0) {
            style.print("rsync failed. stderr: {s}\n", .{cp_result.stderr});
            return error.TarballCreationFailed;
        }
    }

    // Resolve workspace: protocol dependencies in the staged package.json.
    // e.g., "workspace:*" → "0.2.9", "workspace:^" → "^0.2.9", "workspace:~" → "~0.2.9"
    // npm doesn't understand workspace: protocol — the published package.json must have real versions.
    {
        const staged_pkg_json = try std.fs.path.join(allocator, &[_][]const u8{ staging_pkg, "package.json" });
        defer allocator.free(staged_pkg_json);

        const pkg_content = io_helper.readFileAlloc(allocator, staged_pkg_json, 1024 * 1024) catch null;
        if (pkg_content) |content| {
            defer allocator.free(content);
            const resolved_content = resolveWorkspaceProtocol(allocator, content, package_dir) catch content;
            defer if (resolved_content.ptr != content.ptr) allocator.free(resolved_content);

            if (resolved_content.ptr != content.ptr) {
                if (io_helper.createFile(staged_pkg_json, .{ .truncate = true })) |file| {
                    defer file.close(io_helper.io);
                    io_helper.writeAllToFile(file, resolved_content) catch |err| {
                        style.print("  Warning: Failed to write resolved package.json: {}\n", .{err});
                    };
                } else |err| {
                    style.print("  Warning: Failed to create resolved package.json: {}\n", .{err});
                }
            }
        }
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
    const result = try io_helper.childRun(allocator, &[_][]const u8{
        "tar",
        "-czf",
        tarball_path,
        "-C",
        staging_base,
        "package",
    });
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
            .shasum = [_]u8{'0'} ** 40,
            .integrity = [_]u8{'0'} ** 95,
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

/// Sort monorepo packages by dependency order using topological sort (Kahn's algorithm).
/// Packages that are depended on by others come first, so their `prepublishOnly` scripts
/// run before dependents try to build against them.
fn sortPackagesByDependencyOrder(
    allocator: std.mem.Allocator,
    packages: []@import("registry.zig").MonorepoPackage,
) void {
    const n = packages.len;
    if (n <= 1) return;

    // Map workspace package names to their index
    var name_to_idx = std.StringHashMap(usize).init(allocator);
    defer name_to_idx.deinit();
    for (packages, 0..) |pkg, i| {
        name_to_idx.put(pkg.name, i) catch continue;
    }

    // Compute in-degree: how many workspace deps each package has
    var in_degree_buf: [64]usize = undefined;
    const in_degree = in_degree_buf[0..n];
    @memset(in_degree, 0);

    // dependents[i] stores indices of packages that depend on packages[i]
    var dep_buf: [64]std.ArrayList(usize) = undefined;
    const dependents = dep_buf[0..n];
    for (0..n) |i| dependents[i] = std.ArrayList(usize){};
    defer for (0..n) |i| dependents[i].deinit(allocator);

    for (packages, 0..) |pkg, i| {
        const content = io_helper.readFileAlloc(allocator, pkg.config_path, 1024 * 1024) catch continue;
        defer allocator.free(content);

        const parsed = std.json.parseFromSlice(std.json.Value, allocator, content, .{}) catch continue;
        defer parsed.deinit();

        if (parsed.value != .object) continue;

        const dep_fields = [_][]const u8{ "dependencies", "devDependencies", "peerDependencies" };
        for (dep_fields) |field| {
            const deps_val = parsed.value.object.get(field) orelse continue;
            if (deps_val != .object) continue;

            var iter = deps_val.object.iterator();
            while (iter.next()) |entry| {
                if (name_to_idx.get(entry.key_ptr.*)) |dep_idx| {
                    // Package i depends on dep_idx → dep_idx must come first
                    in_degree[i] += 1;
                    dependents[dep_idx].append(allocator, i) catch continue;
                }
            }
        }
    }

    // Kahn's algorithm: process 0 in-degree first
    var sorted_buf: [64]usize = undefined;
    const sorted = sorted_buf[0..n];
    var sorted_count: usize = 0;

    var queue = std.ArrayList(usize){};
    defer queue.deinit(allocator);
    for (0..n) |i| {
        if (in_degree[i] == 0) queue.append(allocator, i) catch continue;
    }

    while (queue.items.len > 0) {
        const idx = queue.orderedRemove(0);
        sorted[sorted_count] = idx;
        sorted_count += 1;

        for (dependents[idx].items) |dep| {
            in_degree[dep] -= 1;
            if (in_degree[dep] == 0) {
                queue.append(allocator, dep) catch continue;
            }
        }
    }

    // Append any remaining (circular deps) in original order
    for (0..n) |i| {
        if (in_degree[i] > 0) {
            sorted[sorted_count] = i;
            sorted_count += 1;
        }
    }

    // Reorder packages in-place using the sorted indices
    var tmp_buf: [64]@import("registry.zig").MonorepoPackage = undefined;
    const tmp = tmp_buf[0..n];
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

/// Resolve workspace: protocol dependencies in package.json content.
/// Returns a new allocation with resolved versions, or the original content if nothing to resolve.
/// Caller must free the result if it differs from the input (check ptr equality).
fn resolveWorkspaceProtocol(allocator: std.mem.Allocator, content: []const u8, package_dir: []const u8) ![]const u8 {
    // Quick check: if no workspace: refs, return original content
    if (std.mem.indexOf(u8, content, "\"workspace:") == null) return content;

    const packages_parent = std.fs.path.dirname(package_dir) orelse return content;

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

            // Look up the actual version from sibling package
            var dir_iter = io_helper.openDirForIteration(packages_parent) catch continue;
            defer dir_iter.close();
            var iter = dir_iter.iterate();
            while (iter.next() catch null) |entry| {
                if (entry.kind != .directory) continue;
                const sibling_path = std.fs.path.join(allocator, &[_][]const u8{ packages_parent, entry.name, "package.json" }) catch continue;
                defer allocator.free(sibling_path);
                const sib_content = io_helper.readFileAlloc(allocator, sibling_path, 64 * 1024) catch continue;
                defer allocator.free(sib_content);
                const sib_parsed = std.json.parseFromSlice(std.json.Value, allocator, sib_content, .{}) catch continue;
                defer sib_parsed.deinit();
                if (sib_parsed.value != .object) continue;
                const sib_name = if (sib_parsed.value.object.get("name")) |n| (if (n == .string) n.string else null) else null;
                const sib_version = if (sib_parsed.value.object.get("version")) |v| (if (v == .string) v.string else null) else null;
                if (sib_name != null and sib_version != null and std.mem.eql(u8, sib_name.?, dep_name)) {
                    // Determine version prefix based on workspace spec
                    const prefix: []const u8 = if (std.mem.eql(u8, ws_spec, "^")) "^" else if (std.mem.eql(u8, ws_spec, "~")) "~" else "";
                    const resolved_ver = std.fmt.allocPrint(allocator, "{s}{s}", .{ prefix, sib_version.? }) catch continue;
                    const key_dup = allocator.dupe(u8, dep_name) catch {
                        allocator.free(resolved_ver);
                        continue;
                    };
                    resolutions.put(key_dup, resolved_ver) catch {
                        allocator.free(key_dup);
                        allocator.free(resolved_ver);
                    };
                    style.print("  Resolved {s}: workspace:{s} → {s}{s}\n", .{ dep_name, ws_spec, prefix, sib_version.? });
                    break;
                }
            }
        }
    }

    if (resolutions.count() == 0) return content;

    // Do string replacements in the original content
    var result = std.ArrayList(u8){};
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
    package: []const u8,
    type: []const u8, // "github-action", "gitlab-ci", etc.
    owner: []const u8,
    repository: []const u8,
    workflow: ?[]const u8 = null,
    environment: ?[]const u8 = null,
    registry: []const u8 = "https://registry.npmjs.org",
};

/// Add a trusted publisher to a package
pub fn trustedPublisherAddCommand(
    allocator: std.mem.Allocator,
    args: []const []const u8,
    options: TrustedPublisherAddOptions,
) !CommandResult {
    _ = args;

    const oidc = @import("../../auth/oidc.zig");
    const registry = @import("../../auth/registry.zig");

    style.print("Adding trusted publisher for {s}...\n", .{options.package});
    style.print("  Type: {s}\n", .{options.type});
    style.print("  Owner: {s}\n", .{options.owner});
    style.print("  Repository: {s}\n", .{options.repository});
    if (options.workflow) |w| {
        style.print("  Workflow: {s}\n", .{w});
    }
    if (options.environment) |e| {
        style.print("  Environment: {s}\n", .{e});
    }

    // Get authentication token
    const auth_token = io_helper.getEnvVarOwned(allocator, "NPM_TOKEN") catch |err| {
        if (err == error.EnvironmentVariableNotFound) {
            return CommandResult.err(
                allocator,
                "Error: NPM_TOKEN environment variable not set. This is required to manage trusted publishers.",
            );
        }
        return CommandResult.err(allocator, "Error: Failed to read NPM_TOKEN");
    };
    defer allocator.free(auth_token);

    // Create trusted publisher configuration
    const publisher = oidc.TrustedPublisher{
        .type = options.type,
        .owner = options.owner,
        .repository = options.repository,
        .workflow = options.workflow,
        .environment = options.environment,
        .allowed_refs = null, // Can be extended to support allowed_refs
    };

    // Initialize registry client
    var registry_client = try registry.RegistryClient.init(allocator, options.registry);
    defer registry_client.deinit();

    // Add trusted publisher
    registry_client.addTrustedPublisher(
        options.package,
        &publisher,
        auth_token,
    ) catch |err| {
        const err_msg = try std.fmt.allocPrint(
            allocator,
            "Error: Failed to add trusted publisher: {any}",
            .{err},
        );
        return CommandResult.err(allocator, err_msg);
    };

    style.print("✓ Trusted publisher added successfully\n", .{});
    style.print("\nYou can now publish {s} from {s}/{s} using OIDC authentication.\n", .{
        options.package,
        options.owner,
        options.repository,
    });

    return .{ .exit_code = 0 };
}

pub const TrustedPublisherListOptions = struct {
    package: []const u8,
    registry: []const u8 = "https://registry.npmjs.org",
    json: bool = false,
};

/// List trusted publishers for a package
pub fn trustedPublisherListCommand(
    allocator: std.mem.Allocator,
    args: []const []const u8,
    options: TrustedPublisherListOptions,
) !CommandResult {
    _ = args;

    const registry = @import("../../auth/registry.zig");

    // Get authentication token
    const auth_token = io_helper.getEnvVarOwned(allocator, "NPM_TOKEN") catch |err| {
        if (err == error.EnvironmentVariableNotFound) {
            return CommandResult.err(
                allocator,
                "Error: NPM_TOKEN environment variable not set",
            );
        }
        return CommandResult.err(allocator, "Error: Failed to read NPM_TOKEN");
    };
    defer allocator.free(auth_token);

    // Initialize registry client
    var registry_client = try registry.RegistryClient.init(allocator, options.registry);
    defer registry_client.deinit();

    // List trusted publishers
    const publishers = registry_client.listTrustedPublishers(
        options.package,
        auth_token,
    ) catch |err| {
        const err_msg = try std.fmt.allocPrint(
            allocator,
            "Error: Failed to list trusted publishers: {any}",
            .{err},
        );
        return CommandResult.err(allocator, err_msg);
    };
    defer {
        for (publishers) |*pub_item| {
            var mut_pub = pub_item.*;
            mut_pub.deinit(allocator);
        }
        allocator.free(publishers);
    }

    if (options.json) {
        // Output JSON format
        style.print("[\n", .{});
        for (publishers, 0..) |pub_item, i| {
            style.print("  {{\n", .{});
            style.print("    \"type\": \"{s}\",\n", .{pub_item.type});
            style.print("    \"owner\": \"{s}\",\n", .{pub_item.owner});
            style.print("    \"repository\": \"{s}\"", .{pub_item.repository});
            if (pub_item.workflow) |w| {
                style.print(",\n    \"workflow\": \"{s}\"", .{w});
            }
            if (pub_item.environment) |e| {
                style.print(",\n    \"environment\": \"{s}\"", .{e});
            }
            style.print("\n  }}", .{});
            if (i < publishers.len - 1) {
                style.print(",", .{});
            }
            style.print("\n", .{});
        }
        style.print("]\n", .{});
    } else {
        // Output table format
        if (publishers.len == 0) {
            style.print("No trusted publishers configured for {s}\n", .{options.package});
            style.print("\nUse 'pantry publisher add' to add a trusted publisher.\n", .{});
        } else {
            style.print("Trusted Publishers for {s}:\n\n", .{options.package});
            for (publishers, 0..) |pub_item, i| {
                style.print("{}. Type: {s}\n", .{ i + 1, pub_item.type });
                style.print("   Owner: {s}\n", .{pub_item.owner});
                style.print("   Repository: {s}\n", .{pub_item.repository});
                if (pub_item.workflow) |w| {
                    style.print("   Workflow: {s}\n", .{w});
                }
                if (pub_item.environment) |e| {
                    style.print("   Environment: {s}\n", .{e});
                }
                style.print("\n", .{});
            }
        }
    }

    return .{ .exit_code = 0 };
}

pub const TrustedPublisherRemoveOptions = struct {
    package: []const u8,
    publisher_id: []const u8,
    registry: []const u8 = "https://registry.npmjs.org",
};

/// Remove a trusted publisher from a package
pub fn trustedPublisherRemoveCommand(
    allocator: std.mem.Allocator,
    args: []const []const u8,
    options: TrustedPublisherRemoveOptions,
) !CommandResult {
    _ = args;

    const registry = @import("../../auth/registry.zig");

    style.print("Removing trusted publisher {s} from {s}...\n", .{
        options.publisher_id,
        options.package,
    });

    // Get authentication token
    const auth_token = io_helper.getEnvVarOwned(allocator, "NPM_TOKEN") catch |err| {
        if (err == error.EnvironmentVariableNotFound) {
            return CommandResult.err(
                allocator,
                "Error: NPM_TOKEN environment variable not set",
            );
        }
        return CommandResult.err(allocator, "Error: Failed to read NPM_TOKEN");
    };
    defer allocator.free(auth_token);

    // Initialize registry client
    var registry_client = try registry.RegistryClient.init(allocator, options.registry);
    defer registry_client.deinit();

    // Remove trusted publisher
    registry_client.removeTrustedPublisher(
        options.package,
        options.publisher_id,
        auth_token,
    ) catch |err| {
        const err_msg = try std.fmt.allocPrint(
            allocator,
            "Error: Failed to remove trusted publisher: {any}",
            .{err},
        );
        return CommandResult.err(allocator, err_msg);
    };

    style.print("✓ Trusted publisher removed successfully\n", .{});

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

/// Save a credential to ~/.pantry/credentials file
/// Creates the file and directory if they don't exist
pub fn savePantryCredential(allocator: std.mem.Allocator, key: []const u8, value: []const u8) !void {
    // Get home directory
    const home = io_helper.getenv("HOME") orelse return error.EnvironmentVariableNotFound;

    // Build paths
    var dir_buf: [std.fs.max_path_bytes]u8 = undefined;
    const pantry_dir = try std.fmt.bufPrint(&dir_buf, "{s}/.pantry", .{home});

    var path_buf: [std.fs.max_path_bytes]u8 = undefined;
    const credentials_path = try std.fmt.bufPrint(&path_buf, "{s}/.pantry/credentials", .{home});

    // Create directory if needed
    io_helper.makePath(pantry_dir) catch {};

    // Read existing content or start fresh
    const existing_content = io_helper.readFileAlloc(allocator, credentials_path, 64 * 1024) catch try allocator.alloc(u8, 0);
    defer allocator.free(existing_content);

    // Build new content
    var new_content: std.ArrayList(u8) = .{};
    defer new_content.deinit(allocator);

    var found = false;
    var lines = std.mem.splitSequence(u8, existing_content, "\n");
    while (lines.next()) |line| {
        const trimmed = std.mem.trim(u8, line, &std.ascii.whitespace);
        if (trimmed.len == 0) continue;

        // Check if this is the key we're updating
        if (std.mem.indexOfScalar(u8, trimmed, '=')) |eq_pos| {
            const line_key = std.mem.trim(u8, trimmed[0..eq_pos], &std.ascii.whitespace);
            if (std.mem.eql(u8, line_key, key)) {
                // Replace with new value
                try new_content.appendSlice(allocator, key);
                try new_content.append(allocator, '=');
                try new_content.appendSlice(allocator, value);
                try new_content.append(allocator, '\n');
                found = true;
                continue;
            }
        }

        // Keep existing line
        try new_content.appendSlice(allocator, trimmed);
        try new_content.append(allocator, '\n');
    }

    // Append new key if not found
    if (!found) {
        try new_content.appendSlice(allocator, key);
        try new_content.append(allocator, '=');
        try new_content.appendSlice(allocator, value);
        try new_content.append(allocator, '\n');
    }

    // Write file with restricted permissions (0600)
    const file = try std.Io.Dir.createFileAbsolute(io_helper.io, credentials_path, .{});
    defer file.close(io_helper.io);
    try io_helper.writeAllToFile(file, new_content.items);
    // Set restrictive permissions after writing (POSIX only)
    if (comptime @import("builtin").os.tag != .windows) {
        file.setPermissions(io_helper.io, std.Io.File.Permissions.fromMode(0o600)) catch {};
    }
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
    var new_content: std.ArrayList(u8) = .{};
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
