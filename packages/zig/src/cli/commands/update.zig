const std = @import("std");
const io_helper = @import("../../io_helper.zig");
const common = @import("common.zig");
const lib = @import("../../lib.zig");
const outdated_cmd = @import("outdated.zig");
const npm = @import("../../registry/npm.zig");
const registry_core = @import("../../registry/core.zig");
const style = @import("../style.zig");

const CommandResult = common.CommandResult;

/// Update packages to latest versions
pub fn execute(allocator: std.mem.Allocator, args: []const []const u8) !CommandResult {
    // Parse flags
    var update_all = false;
    var update_specific: ?[]const u8 = null;
    var dry_run = false;

    var i: usize = 0;
    while (i < args.len) : (i += 1) {
        const arg = args[i];
        if (std.mem.eql(u8, arg, "--all")) {
            update_all = true;
        } else if (std.mem.eql(u8, arg, "--dry-run")) {
            dry_run = true;
        } else if (!std.mem.startsWith(u8, arg, "-")) {
            update_specific = arg;
        }
    }

    // Load pantry.json
    const config_result = lib.loadpantryConfig(allocator, .{}) catch {
        return CommandResult.err(allocator, common.ERROR_NO_CONFIG);
    };
    defer {
        var mut_result = config_result;
        mut_result.deinit();
    }

    const stdout = std.io.getStdOut().writer();

    if (dry_run) {
        try stdout.print("🔍 Dry run mode - no changes will be made\n\n", .{});
    }

    // Get outdated packages
    const deps_map = try lib.extractDependencies(allocator, config_result.value);
    defer {
        var mut_deps = deps_map;
        var it = mut_deps.iterator();
        while (it.next()) |entry| {
            allocator.free(entry.key_ptr.*);
            var dep_info = entry.value_ptr;
            dep_info.deinit(allocator);
        }
        mut_deps.deinit();
    }

    var updates_made: usize = 0;
    var errors_encountered: usize = 0;

    if (update_specific) |pkg_name| {
        // Update specific package
        try stdout.print("Updating {s}...\n", .{pkg_name});

        if (deps_map.get(pkg_name)) |dep_info| {
            var result = updatePackage(allocator, pkg_name, dep_info.version, dry_run) catch |err| {
                try stdout.print("✗ Failed to check {s}: {}\n", .{ pkg_name, err });
                errors_encountered += 1;
                return CommandResult.err(allocator, "Failed to check package for updates");
            };
            defer result.deinit(allocator);

            if (result.has_update) {
                updates_made += 1;
                if (result.new_version) |new_ver| {
                    try stdout.print("✓ Updated {s}: {s} → {s}\n", .{ pkg_name, result.current_version, new_ver });
                } else {
                    try stdout.print("✓ Updated {s}\n", .{pkg_name});
                }
            } else {
                try stdout.print("⊘ {s} is already up to date ({s})\n", .{ pkg_name, result.current_version });
            }
        } else {
            return CommandResult.err(allocator, "Package not found in dependencies");
        }
    } else if (update_all) {
        // Update all packages
        try stdout.print("Updating all packages...\n\n", .{});

        var dep_iter = deps_map.iterator();
        while (dep_iter.next()) |entry| {
            const pkg_name = entry.key_ptr.*;
            const dep_info = entry.value_ptr;

            try stdout.print("Checking {s}... ", .{pkg_name});

            var result = updatePackage(allocator, pkg_name, dep_info.version, dry_run) catch |err| {
                try stdout.print("✗ Error: {}\n", .{err});
                errors_encountered += 1;
                continue;
            };
            defer result.deinit(allocator);

            if (result.has_update) {
                updates_made += 1;
                if (result.new_version) |new_ver| {
                    try stdout.print("✓ {s} → {s}\n", .{ result.current_version, new_ver });
                } else {
                    try stdout.print("✓ Updated\n", .{});
                }
            } else {
                try stdout.print("⊘ Up to date ({s})\n", .{result.current_version});
            }
        }
    } else {
        // No specific package and not --all
        return CommandResult.err(
            allocator,
            "Please specify a package name or use --all to update all packages",
        );
    }

    try stdout.print("\n", .{});

    if (dry_run) {
        const message = try std.fmt.allocPrint(
            allocator,
            "Dry run complete: {d} package{s} would be updated",
            .{ updates_made, if (updates_made == 1) "" else "s" },
        );
        return CommandResult{
            .exit_code = 0,
            .message = message,
        };
    }

    if (updates_made > 0) {
        try stdout.print("📝 Don't forget to run 'pantry install' to apply updates\n", .{});

        const message = try std.fmt.allocPrint(
            allocator,
            "Updated {d} package{s}",
            .{ updates_made, if (updates_made == 1) "" else "s" },
        );
        return CommandResult{
            .exit_code = if (errors_encountered > 0) 1 else 0,
            .message = message,
        };
    } else {
        return CommandResult.success(allocator, "All packages are already up to date");
    }
}

/// Update result containing version info
const UpdateResult = struct {
    has_update: bool,
    new_version: ?[]const u8,
    current_version: []const u8,

    pub fn deinit(self: *UpdateResult, allocator: std.mem.Allocator) void {
        if (self.new_version) |v| allocator.free(v);
    }
};

/// Update a single package by querying the NPM registry
fn updatePackage(
    allocator: std.mem.Allocator,
    package_name: []const u8,
    current_version: []const u8,
    dry_run: bool,
) !UpdateResult {
    // Initialize NPM registry
    var registry_config = try registry_core.RegistryConfig.npm(allocator);
    defer registry_config.deinit(allocator);

    var registry = try npm.NpmRegistry.init(allocator, registry_config);
    defer registry.deinit();

    // Strip version prefix (^, ~, etc.) from current version to get actual installed version
    var installed_version = current_version;
    if (current_version.len > 0) {
        if (current_version[0] == '^' or current_version[0] == '~') {
            installed_version = current_version[1..];
        } else if (std.mem.startsWith(u8, current_version, ">=") or
            std.mem.startsWith(u8, current_version, "<="))
        {
            installed_version = current_version[2..];
        } else if (current_version[0] == '>' or current_version[0] == '<') {
            installed_version = current_version[1..];
        }
    }

    // Use the constraint to resolve the best matching version
    const resolution = npm.resolveVersion(
        &registry,
        allocator,
        package_name,
        current_version, // Use full constraint for resolution
        installed_version, // Compare against stripped version
    ) catch |err| {
        // If we can't reach the registry, return no update
        switch (err) {
            error.PackageNotFound => return UpdateResult{
                .has_update = false,
                .new_version = null,
                .current_version = installed_version,
            },
            else => return err,
        }
    };
    defer {
        var res = resolution;
        res.deinit(allocator);
    }

    if (resolution.has_update) {
        const new_version = try allocator.dupe(u8, resolution.version);

        // If not dry run, update the config file
        if (!dry_run) {
            updateConfigFile(allocator, package_name, new_version) catch |err| {
                // Log but don't fail - config update is best effort
                style.print("Warning: Failed to update config for {s}: {}\n", .{ package_name, err });
            };
        }

        return UpdateResult{
            .has_update = true,
            .new_version = new_version,
            .current_version = installed_version,
        };
    }

    return UpdateResult{
        .has_update = false,
        .new_version = null,
        .current_version = installed_version,
    };
}

/// Update pantry.json with new version
fn updateConfigFile(
    allocator: std.mem.Allocator,
    package_name: []const u8,
    new_version: []const u8,
) !void {
    // Try to find and read pantry.json
    const config_path = "pantry.json";
    const file = io_helper.cwd().openFile(io_helper.io, config_path, .{ .mode = .read_write }) catch |err| {
        // Try package.json as fallback
        if (err == error.FileNotFound) {
            const pkg_file = io_helper.cwd().openFile(io_helper.io, "package.json", .{ .mode = .read_write }) catch {
                return error.ConfigNotFound;
            };
            defer pkg_file.close(io_helper.io);
            try updateJsonFile(allocator, pkg_file, package_name, new_version);
            return;
        }
        return err;
    };
    defer file.close(io_helper.io);

    try updateJsonFile(allocator, file, package_name, new_version);
}

/// Update version in a JSON config file
fn updateJsonFile(
    allocator: std.mem.Allocator,
    file: std.Io.File,
    package_name: []const u8,
    new_version: []const u8,
) !void {
    // Read file content
    const content = try file.readToEndAlloc(io_helper.io, allocator, 10 * 1024 * 1024);
    defer allocator.free(content);

    // Find the package in dependencies and update version
    // We'll do a simple text replacement to preserve formatting/comments
    var result = std.ArrayList(u8).init(allocator);
    defer result.deinit();

    // Pattern to find: "package_name": "version" in dependencies
    // We need to handle both dependencies and devDependencies sections
    var i: usize = 0;
    var in_dependencies = false;
    var brace_depth: usize = 0;

    while (i < content.len) {
        // Track if we're inside dependencies object
        if (i + 14 < content.len) {
            if (std.mem.startsWith(u8, content[i..], "\"dependencies\"") or
                std.mem.startsWith(u8, content[i..], "\"devDependencies\"") or
                std.mem.startsWith(u8, content[i..], "\"peerDependencies\""))
            {
                in_dependencies = true;
                brace_depth = 0;
            }
        }

        // Track brace depth when in dependencies
        if (in_dependencies) {
            if (content[i] == '{') {
                brace_depth += 1;
            } else if (content[i] == '}') {
                if (brace_depth > 0) {
                    brace_depth -= 1;
                    if (brace_depth == 0) {
                        in_dependencies = false;
                    }
                }
            }
        }

        // Look for package name pattern when in dependencies
        if (in_dependencies and brace_depth > 0) {
            // Check for "package_name": pattern
            const pattern = try std.fmt.allocPrint(allocator, "\"{s}\"", .{package_name});
            defer allocator.free(pattern);

            if (i + pattern.len < content.len and std.mem.startsWith(u8, content[i..], pattern)) {
                // Found the package, copy the key
                try result.appendSlice(pattern);
                i += pattern.len;

                // Skip whitespace and colon
                while (i < content.len and (content[i] == ' ' or content[i] == '\t' or content[i] == ':')) {
                    try result.append(content[i]);
                    i += 1;
                }

                // Skip whitespace after colon
                while (i < content.len and (content[i] == ' ' or content[i] == '\t')) {
                    try result.append(content[i]);
                    i += 1;
                }

                // Now we should be at the version string
                if (i < content.len and content[i] == '"') {
                    // Find the end of the version string
                    const version_start = i;
                    i += 1; // skip opening quote
                    while (i < content.len and content[i] != '"') {
                        i += 1;
                    }
                    if (i < content.len) {
                        i += 1; // skip closing quote
                    }

                    // Check if the old version had a prefix (^, ~, etc.)
                    const old_version = content[version_start + 1 .. i - 1];
                    var prefix: []const u8 = "";
                    if (old_version.len > 0) {
                        if (old_version[0] == '^' or old_version[0] == '~') {
                            prefix = old_version[0..1];
                        } else if (std.mem.startsWith(u8, old_version, ">=") or
                            std.mem.startsWith(u8, old_version, "<="))
                        {
                            prefix = old_version[0..2];
                        }
                    }

                    // Write new version with prefix preserved
                    try result.append('"');
                    try result.appendSlice(prefix);
                    try result.appendSlice(new_version);
                    try result.append('"');
                    continue;
                }
            }
        }

        try result.append(content[i]);
        i += 1;
    }

    // Write back to file
    try file.seekTo(io_helper.io, 0);
    try io_helper.writeAllToFile(file, result.items);
    try file.setEndPos(io_helper.io, result.items.len);
}
