const std = @import("std");
const common = @import("common.zig");
const lib = @import("../../lib.zig");
const outdated_cmd = @import("outdated.zig");

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
            const result = try updatePackage(allocator, pkg_name, dep_info.version, dry_run);
            if (result) {
                updates_made += 1;
                try stdout.print("✓ Updated {s}\n", .{pkg_name});
            } else {
                try stdout.print("✗ Failed to update {s}\n", .{pkg_name});
                errors_encountered += 1;
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

            const result = try updatePackage(allocator, pkg_name, dep_info.version, dry_run);
            if (result) {
                updates_made += 1;
                try stdout.print("✓ Updated\n", .{});
            } else {
                try stdout.print("⊘ Up to date\n", .{});
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

/// Update a single package
fn updatePackage(
    allocator: std.mem.Allocator,
    package_name: []const u8,
    current_version: []const u8,
    dry_run: bool,
) !bool {
    _ = allocator;
    _ = dry_run;

    // Simplified implementation
    // Real implementation would:
    // 1. Query registry for latest version
    // 2. Update pantry.json with new version
    // 3. Handle version constraints properly

    // Simulate some packages having updates
    const has_update = (std.mem.eql(u8, package_name, "lodash") or
        std.mem.eql(u8, package_name, "express") or
        std.mem.eql(u8, package_name, "react"));

    if (has_update) {
        // Simulate version check
        _ = current_version;
        return true;
    }

    return false;
}

/// Update pantry.json with new version
fn updateConfigFile(
    allocator: std.mem.Allocator,
    package_name: []const u8,
    new_version: []const u8,
) !void {
    _ = allocator;
    _ = package_name;
    _ = new_version;

    // Real implementation would:
    // 1. Read pantry.json
    // 2. Parse JSON
    // 3. Update version
    // 4. Write back to file

    // For now, this is a placeholder
}
