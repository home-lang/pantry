//! Filtered script execution for workspace packages
//!
//! This module provides the ability to run scripts in multiple workspace packages
//! using filter patterns, similar to bun's --filter functionality.

const std = @import("std");
const lib = @import("../../lib.zig");
const common = @import("common.zig");

const CommandResult = common.CommandResult;

/// Options for running scripts with filter
pub const RunFilterOptions = struct {
    filter: ?[]const u8 = null,
    parallel: bool = true, // Run scripts in parallel (respecting dependency order)
    verbose: bool = false,
    respect_order: bool = true, // Respect dependency order (topological sort)
    changed_only: bool = false, // Only run on changed packages (git-based)
    changed_base: []const u8 = "HEAD", // Git ref to compare against
};

/// Run a script across multiple workspace members matching the filter
pub fn runScriptWithFilter(
    allocator: std.mem.Allocator,
    script_name: []const u8,
    script_args: []const []const u8,
    options: RunFilterOptions,
) !CommandResult {
    // Get current working directory
    const cwd = std.fs.cwd().realpathAlloc(allocator, ".") catch {
        return CommandResult.err(allocator, "Error: Could not determine current directory");
    };
    defer allocator.free(cwd);

    // Try to find workspace configuration
    const detector = @import("../../deps/detector.zig");
    const workspace_file = try detector.findWorkspaceFile(allocator, cwd);

    if (workspace_file == null) {
        // Not in a workspace - fall back to single script execution
        return CommandResult.err(allocator, "Error: --filter can only be used in a workspace");
    }

    defer {
        allocator.free(workspace_file.?.path);
        allocator.free(workspace_file.?.root_dir);
    }

    const ws_file = workspace_file.?;

    // Load workspace configuration
    const workspace_module = @import("../../packages/workspace.zig");
    var workspace_config = try workspace_module.loadWorkspaceConfig(
        allocator,
        ws_file.path,
        ws_file.root_dir,
    );
    defer workspace_config.deinit(allocator);

    // Load filter configurations from pantry.json
    const filter_config_module = @import("../../packages/filter_config.zig");
    const config_path = try std.fs.path.join(allocator, &[_][]const u8{ ws_file.root_dir, "pantry.json" });
    defer allocator.free(config_path);

    var filter_configs = try filter_config_module.loadFromConfig(allocator, config_path);
    defer filter_configs.deinit();

    // Parse filter patterns
    const filter_module = @import("../../packages/filter.zig");
    var filter = if (options.filter) |filter_str| blk: {
        // Check if it's a named filter from config
        if (filter_configs.get(filter_str)) |named_filter| {
            std.debug.print("Using named filter '{s}'\n", .{filter_str});
            if (named_filter.description) |desc| {
                std.debug.print("  {s}\n", .{desc});
            }
            break :blk try filter_module.Filter.initWithPatterns(allocator, named_filter.patterns);
        }

        var patterns_list = std.ArrayList([]const u8){};
        defer patterns_list.deinit(allocator);

        var iter = std.mem.splitScalar(u8, filter_str, ',');
        while (iter.next()) |pattern| {
            const trimmed = std.mem.trim(u8, pattern, " \t");
            if (trimmed.len > 0) {
                try patterns_list.append(allocator, trimmed);
            }
        }

        break :blk try filter_module.Filter.initWithPatterns(allocator, patterns_list.items);
    } else filter_module.Filter.init(allocator);
    defer filter.deinit();

    // Collect workspace members that match the filter
    var matching_members = std.ArrayList(lib.packages.types.WorkspaceMember){};
    defer matching_members.deinit(allocator);

    for (workspace_config.members) |member| {
        if (filter.matchesMember(member)) {
            try matching_members.append(allocator, member);
        }
    }

    // Apply changed detection if requested
    if (options.changed_only) {
        const changed_detector = lib.packages.changed_detector;
        var changed_result = try changed_detector.detectChangedMembers(
            allocator,
            ws_file.root_dir,
            matching_members.items,
            .{
                .base = options.changed_base,
                .include_uncommitted = true,
                .include_untracked = false,
            },
        );
        defer changed_result.deinit();

        // Replace matching_members with only changed ones
        matching_members.deinit(allocator);
        matching_members = std.ArrayList(lib.packages.types.WorkspaceMember){};

        for (changed_result.changed_members) |changed_member| {
            try matching_members.append(allocator, changed_member);
        }

        if (matching_members.items.len == 0) {
            const msg = try std.fmt.allocPrint(
                allocator,
                "No changed packages found (comparing against {s})",
                .{options.changed_base},
            );
            return .{
                .exit_code = 0,
                .message = msg,
            };
        }

        std.debug.print("Detected {d} changed package(s) since {s}\n\n", .{
            matching_members.items.len,
            options.changed_base,
        });
    }

    if (matching_members.items.len == 0) {
        return CommandResult.err(allocator, "Error: No workspace members match the filter pattern");
    }

    // Order members by dependencies if requested
    const workspace_deps = @import("../../packages/workspace_deps.zig");
    var ordered_result = if (options.respect_order)
        try workspace_deps.orderWorkspaceMembers(allocator, matching_members.items)
    else blk: {
        // No ordering - just copy the members
        const order = try allocator.dupe(lib.packages.types.WorkspaceMember, matching_members.items);
        const groups = try allocator.alloc([]lib.packages.types.WorkspaceMember, 1);
        groups[0] = try allocator.dupe(lib.packages.types.WorkspaceMember, matching_members.items);
        break :blk workspace_deps.WorkspaceOrderResult{
            .order = order,
            .parallel_groups = groups,
            .allocator = allocator,
        };
    };
    defer ordered_result.deinit();

    // Display which packages we're running in
    const blue = "\x1b[34m";
    const dim = "\x1b[2m";
    const reset = "\x1b[0m";

    std.debug.print("{s}Running script '{s}' in {d} package(s)", .{
        blue,
        script_name,
        matching_members.items.len,
    });

    if (options.respect_order and ordered_result.parallel_groups.len > 1) {
        std.debug.print(" ({d} parallel groups)", .{ordered_result.parallel_groups.len});
    }
    std.debug.print(":{s}\n", .{reset});

    for (ordered_result.order) |member| {
        std.debug.print("{s}  • {s}{s}\n", .{ dim, member.name, reset });
    }
    std.debug.print("\n", .{});

    // Execute scripts - either in parallel groups or sequentially
    var success_count: usize = 0;
    var failed_count: usize = 0;
    var skipped_count: usize = 0;

    const green = "\x1b[32m";
    const red = "\x1b[31m";
    const yellow = "\x1b[33m";

    if (options.parallel and ordered_result.parallel_groups.len > 0) {
        // Execute in parallel groups
        const parallel_executor = @import("parallel_executor.zig");

        for (ordered_result.parallel_groups, 0..) |group, group_idx| {
            if (group.len == 0) continue;

            if (ordered_result.parallel_groups.len > 1) {
                std.debug.print("{s}Group {d} ({d} package(s)){s}\n", .{ dim, group_idx + 1, group.len, reset });
            }

            // Execute group in parallel
            const results = parallel_executor.executeParallelGroup(
                allocator,
                group,
                script_name,
                script_args,
                options.verbose,
            ) catch |err| {
                std.debug.print("{s}✗{s} Group {d} failed: {}\n", .{ red, reset, group_idx + 1, err });
                failed_count += group.len;
                continue;
            };
            defer {
                for (results) |*result| {
                    result.deinit();
                }
                allocator.free(results);
            }

            // Display results
            for (results) |result| {
                if (result.stderr.len > 0 and std.mem.indexOf(u8, result.stderr, "No scripts defined") != null) {
                    std.debug.print("{s}⊘{s} {s} {s}(no scripts defined){s}\n", .{ yellow, reset, result.member_name, dim, reset });
                    skipped_count += 1;
                } else if (result.stderr.len > 0 and std.mem.indexOf(u8, result.stderr, "Script not found") != null) {
                    std.debug.print("{s}⊘{s} {s} {s}(script not found){s}\n", .{ yellow, reset, result.member_name, dim, reset });
                    skipped_count += 1;
                } else if (result.success) {
                    std.debug.print("{s}✓{s} {s} {s}({d}ms){s}\n", .{ green, reset, result.member_name, dim, result.duration_ms, reset });
                    if (options.verbose and result.stdout.len > 0) {
                        std.debug.print("{s}", .{result.stdout});
                    }
                    success_count += 1;
                } else {
                    std.debug.print("{s}✗{s} {s} {s}(exit code: {d}){s}\n", .{ red, reset, result.member_name, dim, result.exit_code, reset });
                    if (result.stderr.len > 0) {
                        std.debug.print("{s}", .{result.stderr});
                    }
                    failed_count += 1;
                }
            }
        }
    } else {
        // Sequential execution (original code)
        for (ordered_result.order) |member| {
        // Load scripts for this member
        const scripts_map = lib.config.findProjectScripts(allocator, member.abs_path) catch {
            std.debug.print("{s}⊘{s} {s} {s}(no scripts defined){s}\n", .{
                yellow,
                reset,
                member.name,
                dim,
                reset,
            });
            skipped_count += 1;
            continue;
        };

        if (scripts_map == null) {
            std.debug.print("{s}⊘{s} {s} {s}(no scripts defined){s}\n", .{
                yellow,
                reset,
                member.name,
                dim,
                reset,
            });
            skipped_count += 1;
            continue;
        }

        var scripts = scripts_map.?;
        defer {
            var it = scripts.iterator();
            while (it.next()) |entry| {
                allocator.free(entry.key_ptr.*);
                allocator.free(entry.value_ptr.*);
            }
            scripts.deinit();
        }

        // Check if the script exists for this member
        const script_command = scripts.get(script_name) orelse {
            std.debug.print("{s}⊘{s} {s} {s}(script not found){s}\n", .{
                yellow,
                reset,
                member.name,
                dim,
                reset,
            });
            skipped_count += 1;
            continue;
        };

        // Execute the script
        std.debug.print("{s}→{s} {s}\n", .{ blue, reset, member.name });

        // Build command with args
        var command_buf: [2048]u8 = undefined;
        var command_stream = std.io.fixedBufferStream(&command_buf);
        const cmd_writer = command_stream.writer();

        try cmd_writer.writeAll(script_command);
        for (script_args) |arg| {
            try cmd_writer.writeByte(' ');
            try cmd_writer.writeAll(arg);
        }

        const full_command = command_stream.getWritten();

        // Execute in member directory
        const result = std.process.Child.run(.{
            .allocator = allocator,
            .argv = &[_][]const u8{ "sh", "-c", full_command },
            .cwd = member.abs_path,
        }) catch |err| {
            std.debug.print("{s}✗{s} {s} {s}({any}){s}\n", .{
                red,
                reset,
                member.name,
                dim,
                err,
                reset,
            });
            failed_count += 1;
            continue;
        };
        defer {
            allocator.free(result.stdout);
            allocator.free(result.stderr);
        }

        if (result.term.Exited == 0) {
            std.debug.print("{s}✓{s} {s}\n", .{ green, reset, member.name });
            if (options.verbose and result.stdout.len > 0) {
                std.debug.print("{s}", .{result.stdout});
            }
            success_count += 1;
        } else {
            std.debug.print("{s}✗{s} {s} {s}(exit code: {}){s}\n", .{
                red,
                reset,
                member.name,
                dim,
                result.term.Exited,
                reset,
            });
            if (result.stderr.len > 0) {
                std.debug.print("{s}", .{result.stderr});
            }
            failed_count += 1;
        }
        }
    }

    // Summary
    std.debug.print("\n{s}✓{s} {d} succeeded", .{ green, reset, success_count });
    if (failed_count > 0) {
        std.debug.print(", {s}{d} failed{s}", .{ red, failed_count, reset });
    }
    if (skipped_count > 0) {
        std.debug.print(", {s}{d} skipped{s}", .{ yellow, skipped_count, reset });
    }
    std.debug.print("\n", .{});

    const exit_code: u8 = if (failed_count > 0) 1 else 0;
    return .{ .exit_code = exit_code };
}
