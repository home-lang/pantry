const std = @import("std");
const types = @import("types.zig");
const detector = @import("../deps/detector.zig");
const config_loader = @import("../config/loader.zig");
const deps_extractor = @import("../config/dependencies.zig");
const lib = @import("../lib.zig");
const io_helper = lib.io_helper;
const style = @import("../cli/style.zig");

/// Discover workspace members based on glob patterns
/// This is a simple glob matcher that supports * wildcards
pub fn discoverMembers(
    allocator: std.mem.Allocator,
    workspace_root: []const u8,
    patterns: [][]const u8,
) ![]types.WorkspaceMember {
    // We'll collect members in a temporary buffer
    var members_buffer: [256]types.WorkspaceMember = undefined;
    var member_count: usize = 0;

    // For each pattern, find matching directories
    for (patterns) |pattern| {
        const pattern_members = try discoverMembersForPattern(allocator, workspace_root, pattern);
        defer allocator.free(pattern_members);

        for (pattern_members) |member| {
            if (member_count >= members_buffer.len) {
                style.print("Error: Too many workspace members (limit: {d})\n", .{members_buffer.len});
                style.print("Consider splitting into multiple workspaces or increasing the buffer size\n", .{});
                return error.TooManyWorkspaceMembers;
            }
            members_buffer[member_count] = member;
            member_count += 1;
        }
    }

    // Copy to final slice
    const members = try allocator.alloc(types.WorkspaceMember, member_count);
    @memcpy(members, members_buffer[0..member_count]);
    return members;
}

/// Discover workspace members for a single pattern
fn discoverMembersForPattern(
    allocator: std.mem.Allocator,
    workspace_root: []const u8,
    pattern: []const u8,
) ![]types.WorkspaceMember {
    var members_buffer: [128]types.WorkspaceMember = undefined;
    var member_count: usize = 0;
    // Simple glob matching: support patterns like "packages/*" or "apps/*"
    // More complex patterns would need a full glob implementation

    // Check if pattern contains a wildcard
    if (std.mem.indexOf(u8, pattern, "*")) |wildcard_pos| {
        // Extract the directory part before the wildcard
        const base_dir = pattern[0..wildcard_pos];

        // If wildcard is at the end (e.g., "packages/*"), list all subdirectories
        if (wildcard_pos == pattern.len - 1) {
            const full_base_path = try std.fs.path.join(allocator, &[_][]const u8{ workspace_root, base_dir });
            defer allocator.free(full_base_path);

            // Open the directory
            // Use std.fs.Dir for iteration (Io.Dir doesn't have iterate() in Zig 0.16)
            var dir = io_helper.openDirAbsoluteForIteration(full_base_path) catch |err| {
                // If directory doesn't exist, skip this pattern - return empty list
                if (err == error.FileNotFound) {
                    return allocator.alloc(types.WorkspaceMember, 0);
                }
                return err;
            };
            defer dir.close();

            // Iterate through subdirectories
            var iter = dir.iterate();
            while (iter.next() catch null) |entry| {
                if (entry.kind != .directory) continue;

                // Skip common ignore directories
                if (std.mem.eql(u8, entry.name, "node_modules") or
                    std.mem.eql(u8, entry.name, "cdk.out") or
                    std.mem.eql(u8, entry.name, ".cache") or
                    std.mem.eql(u8, entry.name, ".git") or
                    std.mem.eql(u8, entry.name, "dist") or
                    std.mem.eql(u8, entry.name, "build") or
                    std.mem.eql(u8, entry.name, ".next") or
                    std.mem.eql(u8, entry.name, ".turbo") or
                    std.mem.startsWith(u8, entry.name, "."))
                {
                    continue;
                }

                // Construct member path
                const member_rel_path = try std.fs.path.join(allocator, &[_][]const u8{ base_dir, entry.name });
                errdefer allocator.free(member_rel_path);

                const member_abs_path = try std.fs.path.join(allocator, &[_][]const u8{ workspace_root, member_rel_path });
                errdefer allocator.free(member_abs_path);

                // Check if this directory has a config or deps file
                const config_path = try findConfigFile(allocator, member_abs_path);
                const deps_file_path = try findDepsFileInDir(allocator, member_abs_path);

                // Only add as member if it has a config or deps file
                if (config_path != null or deps_file_path != null) {
                    if (member_count >= members_buffer.len) {
                        style.print("Error: Too many workspace members in pattern (limit: {d})\n", .{members_buffer.len});
                        return error.TooManyWorkspaceMembers;
                    }
                    members_buffer[member_count] = .{
                        .name = try allocator.dupe(u8, entry.name),
                        .path = member_rel_path,
                        .abs_path = member_abs_path,
                        .config_path = config_path,
                        .deps_file_path = deps_file_path,
                    };
                    member_count += 1;
                } else {
                    // Clean up if not a valid member
                    allocator.free(member_rel_path);
                    allocator.free(member_abs_path);
                }
            }
        }
    } else {
        // No wildcard - exact directory match
        const member_abs_path = try std.fs.path.join(allocator, &[_][]const u8{ workspace_root, pattern });
        errdefer allocator.free(member_abs_path);

        // Check if directory exists
        io_helper.accessAbsolute(member_abs_path, .{}) catch {
            allocator.free(member_abs_path);
            return allocator.alloc(types.WorkspaceMember, 0);
        };

        // Check if this directory has a config or deps file
        const config_path = try findConfigFile(allocator, member_abs_path);
        const deps_file_path = try findDepsFileInDir(allocator, member_abs_path);

        if (config_path != null or deps_file_path != null) {
            const member_name = std.fs.path.basename(pattern);
            if (member_count >= members_buffer.len) {
                style.print("Error: Too many workspace members (limit: {d})\n", .{members_buffer.len});
                return error.TooManyWorkspaceMembers;
            }
            members_buffer[member_count] = .{
                .name = try allocator.dupe(u8, member_name),
                .path = try allocator.dupe(u8, pattern),
                .abs_path = member_abs_path,
                .config_path = config_path,
                .deps_file_path = deps_file_path,
            };
            member_count += 1;
        } else {
            allocator.free(member_abs_path);
        }
    }

    // Return the collected members
    const members = try allocator.alloc(types.WorkspaceMember, member_count);
    @memcpy(members, members_buffer[0..member_count]);
    return members;
}

/// Find config file in a directory (pantry.config.ts, pantry.json, etc.)
fn findConfigFile(allocator: std.mem.Allocator, dir_path: []const u8) !?[]const u8 {
    const config_files = [_][]const u8{
        "pantry.config.ts",
        "pantry.config.js",
        "pantry.json",
        "pantry.jsonc",
    };

    for (config_files) |config_file| {
        const full_path = try std.fs.path.join(allocator, &[_][]const u8{ dir_path, config_file });
        defer allocator.free(full_path);

        io_helper.accessAbsolute(full_path, .{}) catch continue;

        // Found a config file
        return try allocator.dupe(u8, full_path);
    }

    return null;
}

/// Find deps file in a directory (package.json, pantry.json, etc.)
fn findDepsFileInDir(allocator: std.mem.Allocator, dir_path: []const u8) !?[]const u8 {
    const result = try detector.findDepsFile(allocator, dir_path);
    if (result) |deps_file| {
        // Check if the deps file is actually in this directory (not a parent)
        const deps_dir = std.fs.path.dirname(deps_file.path) orelse return null;
        if (std.mem.eql(u8, deps_dir, dir_path)) {
            return deps_file.path;
        }
        allocator.free(deps_file.path);
    }
    return null;
}

/// Load workspace configuration from a file
pub fn loadWorkspaceConfig(
    allocator: std.mem.Allocator,
    workspace_file_path: []const u8,
    workspace_root: []const u8,
) !types.WorkspaceConfig {
    // Try pantry config first (pantry.json, pantry.config.ts, etc.)
    if (config_loader.loadpantryConfig(
        allocator,
        .{
            .name = "pantry",
            .cwd = workspace_root,
        },
    )) |config_result_val| {
        var config_result = config_result_val;
        defer config_result.deinit();

        if (try deps_extractor.extractWorkspacePatterns(allocator, config_result)) |patterns| {
            errdefer {
                for (patterns) |pattern| allocator.free(pattern);
                allocator.free(patterns);
            }

            const fallback_name = std.fs.path.basename(workspace_root);
            const workspace_name = try deps_extractor.extractWorkspaceName(allocator, config_result, fallback_name);
            errdefer allocator.free(workspace_name);

            const members = try discoverMembers(allocator, workspace_root, patterns);
            errdefer {
                for (members) |*member| {
                    var m = member.*;
                    m.deinit(allocator);
                }
                allocator.free(members);
            }

            return types.WorkspaceConfig{
                .root_path = try allocator.dupe(u8, workspace_root),
                .name = workspace_name,
                .patterns = patterns,
                .members = members,
            };
        }
    } else |_| {
        // Pantry config not available, fall through to package.json
    }

    // Fall back to reading package.json directly (npm/bun compatible)
    return loadWorkspaceConfigFromPackageJson(allocator, workspace_file_path, workspace_root);
}

/// Load workspace config directly from package.json (npm/bun compatible)
fn loadWorkspaceConfigFromPackageJson(
    allocator: std.mem.Allocator,
    file_path: []const u8,
    workspace_root: []const u8,
) !types.WorkspaceConfig {
    const content = io_helper.readFileAlloc(allocator, file_path, 10 * 1024 * 1024) catch {
        return error.NoWorkspacePatternsFound;
    };
    defer allocator.free(content);

    const parsed = std.json.parseFromSlice(std.json.Value, allocator, content, .{}) catch {
        return error.NoWorkspacePatternsFound;
    };
    defer parsed.deinit();

    if (parsed.value != .object) return error.NoWorkspacePatternsFound;

    // Extract workspaces field
    const workspaces_val = parsed.value.object.get("workspaces") orelse
        return error.NoWorkspacePatternsFound;

    // Parse patterns from workspaces field (array or object with "packages" key)
    var patterns_list = std.ArrayList([]const u8){};
    errdefer {
        for (patterns_list.items) |p| allocator.free(p);
        patterns_list.deinit(allocator);
    }

    switch (workspaces_val) {
        .array => |arr| {
            for (arr.items) |item| {
                if (item == .string) {
                    try patterns_list.append(allocator, try allocator.dupe(u8, item.string));
                }
            }
        },
        .object => |obj| {
            // npm also supports { "packages": ["packages/*"] } format
            if (obj.get("packages")) |pkgs| {
                if (pkgs == .array) {
                    for (pkgs.array.items) |item| {
                        if (item == .string) {
                            try patterns_list.append(allocator, try allocator.dupe(u8, item.string));
                        }
                    }
                }
            }
        },
        .string => |s| {
            try patterns_list.append(allocator, try allocator.dupe(u8, s));
        },
        else => return error.NoWorkspacePatternsFound,
    }

    if (patterns_list.items.len == 0) return error.NoWorkspacePatternsFound;

    const patterns = try patterns_list.toOwnedSlice(allocator);
    errdefer {
        for (patterns) |p| allocator.free(p);
        allocator.free(patterns);
    }

    // Extract name
    const workspace_name = if (parsed.value.object.get("name")) |name_val|
        if (name_val == .string)
            try allocator.dupe(u8, name_val.string)
        else
            try allocator.dupe(u8, std.fs.path.basename(workspace_root))
    else
        try allocator.dupe(u8, std.fs.path.basename(workspace_root));
    errdefer allocator.free(workspace_name);

    // Discover members
    const members = try discoverMembers(allocator, workspace_root, patterns);
    errdefer {
        for (members) |*member| {
            var m = member.*;
            m.deinit(allocator);
        }
        allocator.free(members);
    }

    return types.WorkspaceConfig{
        .root_path = try allocator.dupe(u8, workspace_root),
        .name = workspace_name,
        .patterns = patterns,
        .members = members,
    };
}
