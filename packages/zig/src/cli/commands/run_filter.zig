//! Filtered script execution for workspace packages
//!
//! This module provides the ability to run scripts in multiple workspace packages
//! using filter patterns, similar to bun's --filter functionality.

const std = @import("std");
const io_helper = @import("../../io_helper.zig");
const lib = @import("../../lib.zig");
const common = @import("common.zig");
const style = @import("../style.zig");

const CommandResult = common.CommandResult;

/// Options for running scripts with filter
pub const RunFilterOptions = struct {
    filter: ?[]const u8 = null,
    parallel: bool = true, // Run scripts in parallel (respecting dependency order)
    verbose: bool = false,
    respect_order: bool = true, // Respect dependency order (topological sort)
    changed_only: bool = false, // Only run on changed packages (git-based)
    changed_base: []const u8 = "HEAD", // Git ref to compare against
    watch: bool = false, // Watch for changes and re-run
};

/// Run a script across multiple workspace members matching the filter
pub fn runScriptWithFilter(
    allocator: std.mem.Allocator,
    script_name: []const u8,
    script_args: []const []const u8,
    options: RunFilterOptions,
) !CommandResult {
    // Get current working directory
    const cwd = io_helper.realpathAlloc(allocator, ".") catch {
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
            style.print("Using named filter '{s}'\n", .{filter_str});
            if (named_filter.description) |desc| {
                style.print("  {s}\n", .{desc});
            }

            // Resolve inheritance chain
            const resolved_patterns = filter_configs.resolveWithInheritance(filter_str) catch |err| switch (err) {
                error.CircularInheritance => {
                    return CommandResult.err(allocator, "Error: Circular inheritance detected in filter configuration");
                },
                error.FilterNotFound => {
                    // Fallback to direct patterns if resolution fails
                    break :blk try filter_module.Filter.initWithPatterns(allocator, named_filter.patterns);
                },
                else => return err,
            };
            defer {
                for (resolved_patterns) |pattern| {
                    allocator.free(pattern);
                }
                allocator.free(resolved_patterns);
            }

            if (named_filter.extends) |parent| {
                style.print("  (extends '{s}')\n", .{parent});
            }

            // Create a copy of patterns since they'll be freed
            var patterns_copy = try allocator.alloc([]const u8, resolved_patterns.len);
            for (resolved_patterns, 0..) |pattern, i| {
                patterns_copy[i] = try allocator.dupe(u8, pattern);
            }

            break :blk try filter_module.Filter.initWithPatterns(allocator, patterns_copy);
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

        style.print("Detected {d} changed package(s) since {s}\n\n", .{
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
    style.print("{s}Running script '{s}' in {d} package(s)", .{
        style.blue,
        script_name,
        matching_members.items.len,
    });

    if (options.respect_order and ordered_result.parallel_groups.len > 1) {
        style.print(" ({d} parallel groups)", .{ordered_result.parallel_groups.len});
    }
    style.print(":{s}\n", .{style.reset});

    for (ordered_result.order) |member| {
        style.print("{s}  • {s}{s}\n", .{ style.dim, member.name, style.reset });
    }
    style.print("\n", .{});

    // Execute scripts - either in parallel groups or sequentially
    var success_count: usize = 0;
    var failed_count: usize = 0;
    var skipped_count: usize = 0;

    if (options.parallel and ordered_result.parallel_groups.len > 0) {
        // Execute in parallel groups
        const parallel_executor = @import("parallel_executor.zig");

        for (ordered_result.parallel_groups, 0..) |group, group_idx| {
            if (group.len == 0) continue;

            if (ordered_result.parallel_groups.len > 1) {
                style.print("{s}Group {d} ({d} package(s)){s}\n", .{ style.dim, group_idx + 1, group.len, style.reset });
            }

            // Execute group in parallel
            const results = parallel_executor.executeParallelGroup(
                allocator,
                group,
                script_name,
                script_args,
                options.verbose,
            ) catch |err| {
                style.print("{s}✗{s} Group {d} failed: {}\n", .{ style.red, style.reset, group_idx + 1, err });
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
                    style.print("{s}⊘{s} {s} {s}(no scripts defined){s}\n", .{ style.yellow, style.reset, result.member_name, style.dim, style.reset });
                    skipped_count += 1;
                } else if (result.stderr.len > 0 and std.mem.indexOf(u8, result.stderr, "Script not found") != null) {
                    style.print("{s}⊘{s} {s} {s}(script not found){s}\n", .{ style.yellow, style.reset, result.member_name, style.dim, style.reset });
                    skipped_count += 1;
                } else if (result.success) {
                    style.print("{s}✓{s} {s} {s}({d}ms){s}\n", .{ style.green, style.reset, result.member_name, style.dim, result.duration_ms, style.reset });
                    if (options.verbose and result.stdout.len > 0) {
                        style.print("{s}", .{result.stdout});
                    }
                    success_count += 1;
                } else {
                    style.print("{s}✗{s} {s} {s}(exit code: {d}){s}\n", .{ style.red, style.reset, result.member_name, style.dim, result.exit_code, style.reset });
                    if (result.stderr.len > 0) {
                        style.print("{s}", .{result.stderr});
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
                style.print("{s}⊘{s} {s} {s}(no scripts defined){s}\n", .{
                    style.yellow,
                    style.reset,
                    member.name,
                    style.dim,
                    style.reset,
                });
                skipped_count += 1;
                continue;
            };

            if (scripts_map == null) {
                style.print("{s}⊘{s} {s} {s}(no scripts defined){s}\n", .{
                    style.yellow,
                    style.reset,
                    member.name,
                    style.dim,
                    style.reset,
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
                style.print("{s}⊘{s} {s} {s}(script not found){s}\n", .{
                    style.yellow,
                    style.reset,
                    member.name,
                    style.dim,
                    style.reset,
                });
                skipped_count += 1;
                continue;
            };

            // Execute the script
            style.print("{s}→{s} {s}\n", .{ style.blue, style.reset, member.name });

            // Build command with args
            var command_list = std.ArrayList(u8){};
            defer command_list.deinit(allocator);

            try command_list.appendSlice(allocator, script_command);
            for (script_args) |arg| {
                try command_list.append(allocator, ' ');
                try command_list.appendSlice(allocator, arg);
            }

            const full_command = command_list.items;

            // Execute in member directory
            const result = io_helper.childRunWithOptions(allocator, &[_][]const u8{ "sh", "-c", full_command }, .{
                .cwd = member.abs_path,
            }) catch |err| {
                style.print("{s}✗{s} {s} {s}({any}){s}\n", .{
                    style.red,
                    style.reset,
                    member.name,
                    style.dim,
                    err,
                    style.reset,
                });
                failed_count += 1;
                continue;
            };
            defer {
                allocator.free(result.stdout);
                allocator.free(result.stderr);
            }

            if (result.term.exited == 0) {
                style.print("{s}✓{s} {s}\n", .{ style.green, style.reset, member.name });
                if (options.verbose and result.stdout.len > 0) {
                    style.print("{s}", .{result.stdout});
                }
                success_count += 1;
            } else {
                style.print("{s}✗{s} {s} {s}(exit code: {}){s}\n", .{
                    style.red,
                    style.reset,
                    member.name,
                    style.dim,
                    result.term.exited,
                    style.reset,
                });
                if (result.stderr.len > 0) {
                    style.print("{s}", .{result.stderr});
                }
                failed_count += 1;
            }
        }
    }

    // Summary
    style.print("\n{s}✓{s} {d} succeeded", .{ style.green, style.reset, success_count });
    if (failed_count > 0) {
        style.print(", {s}{d} failed{s}", .{ style.red, failed_count, style.reset });
    }
    if (skipped_count > 0) {
        style.print(", {s}{d} skipped{s}", .{ style.yellow, skipped_count, style.reset });
    }
    style.print("\n", .{});

    const exit_code: u8 = if (failed_count > 0) 1 else 0;

    // If watch mode is enabled, start watching
    if (options.watch) {
        try watchAndRerun(
            allocator,
            script_name,
            script_args,
            matching_members.items,
            options,
        );
        return .{ .exit_code = 0 };
    }

    return .{ .exit_code = exit_code };
}

/// Watch for file changes and re-run the script
fn watchAndRerun(
    allocator: std.mem.Allocator,
    script_name: []const u8,
    script_args: []const []const u8,
    members: []const lib.packages.types.WorkspaceMember,
    options: RunFilterOptions,
) !void {
    const file_watcher = lib.packages.file_watcher;

    var watcher = try file_watcher.FileWatcher.init(
        allocator,
        members,
        .{
            .poll_interval_ms = 500,
            .debounce_ms = 100,
        },
    );
    defer watcher.deinit();

    // Create a simple polling loop
    style.print("👀 Watching for changes in {d} package(s)...\n", .{members.len});
    style.print("   Press Ctrl+C to stop\n\n", .{});

    // Initial scan
    try watcher.scanAllFiles();

    while (!watcher.should_stop.load(.acquire)) {
        // Poll for changes
        const changes = try watcher.detectChanges();
        defer {
            for (changes) |change| {
                allocator.free(change.file_path);
            }
            allocator.free(changes);
        }

        if (changes.len > 0) {
            // Print detected changes
            style.print("\n{s}───────────────────────────────────────{s}\n", .{ style.dim, style.reset });
            style.print("{s}Detected {d} file change(s):{s}\n", .{ style.blue, changes.len, style.reset });

            var affected_members = std.StringHashMap(void).init(allocator);
            defer affected_members.deinit();

            for (changes[0..@min(5, changes.len)]) |event| {
                const change_type = switch (event.change_type) {
                    .created => "created",
                    .modified => "modified",
                    .deleted => "deleted",
                };

                // Get relative path for nicer display
                const rel_path = if (std.mem.startsWith(u8, event.file_path, event.member.abs_path))
                    event.file_path[event.member.abs_path.len..]
                else
                    event.file_path;

                style.print("  {s}{s}{s} in {s} ({s})\n", .{
                    style.dim,
                    rel_path,
                    style.reset,
                    event.member.name,
                    change_type,
                });

                try affected_members.put(event.member.name, {});
            }
            if (changes.len > 5) {
                style.print("  ... and {d} more\n", .{changes.len - 5});
            }

            style.print("\n{s}Re-running script '{s}' in {d} affected package(s)...{s}\n", .{
                style.blue,
                script_name,
                affected_members.count(),
                style.reset,
            });
            style.print("{s}───────────────────────────────────────{s}\n\n", .{ style.dim, style.reset });

            // Wait for debounce
            io_helper.nanosleep(0, watcher.options.debounce_ms * std.time.ns_per_ms);

            // Re-run the script execution logic
            try executeScriptsInMembers(
                allocator,
                script_name,
                script_args,
                members,
                options,
            );

            style.print("\n{s}👀 Watching for changes...{s}\n", .{ style.dim, style.reset });
        }

        // Sleep for poll interval
        io_helper.nanosleep(0, watcher.options.poll_interval_ms * std.time.ns_per_ms);
    }
}

/// Execute scripts in the given members (extracted for reuse in watch mode)
fn executeScriptsInMembers(
    allocator: std.mem.Allocator,
    script_name: []const u8,
    script_args: []const []const u8,
    members: []const lib.packages.types.WorkspaceMember,
    options: RunFilterOptions,
) !void {
    const workspace_deps = @import("../../packages/workspace_deps.zig");

    // Order members by dependencies if requested
    var ordered_result = if (options.respect_order)
        try workspace_deps.orderWorkspaceMembers(allocator, members)
    else blk: {
        const order = try allocator.dupe(lib.packages.types.WorkspaceMember, members);
        const groups = try allocator.alloc([]lib.packages.types.WorkspaceMember, 1);
        groups[0] = try allocator.dupe(lib.packages.types.WorkspaceMember, members);
        break :blk workspace_deps.WorkspaceOrderResult{
            .order = order,
            .parallel_groups = groups,
            .allocator = allocator,
        };
    };
    defer ordered_result.deinit();

    var success_count: usize = 0;
    var failed_count: usize = 0;
    var skipped_count: usize = 0;

    if (options.parallel and ordered_result.parallel_groups.len > 0) {
        const parallel_executor = @import("parallel_executor.zig");

        for (ordered_result.parallel_groups, 0..) |group, group_idx| {
            if (group.len == 0) continue;

            if (ordered_result.parallel_groups.len > 1) {
                style.print("{s}Group {d} ({d} package(s)){s}\n", .{ style.dim, group_idx + 1, group.len, style.reset });
            }

            const results = parallel_executor.executeParallelGroup(
                allocator,
                group,
                script_name,
                script_args,
                options.verbose,
            ) catch |err| {
                style.print("{s}✗{s} Group {d} failed: {}\n", .{ style.red, style.reset, group_idx + 1, err });
                failed_count += group.len;
                continue;
            };
            defer {
                for (results) |*result| {
                    result.deinit();
                }
                allocator.free(results);
            }

            for (results) |result| {
                if (result.stderr.len > 0 and std.mem.indexOf(u8, result.stderr, "No scripts defined") != null) {
                    style.print("{s}⊘{s} {s} {s}(no scripts defined){s}\n", .{ style.yellow, style.reset, result.member_name, style.dim, style.reset });
                    skipped_count += 1;
                } else if (result.stderr.len > 0 and std.mem.indexOf(u8, result.stderr, "Script not found") != null) {
                    style.print("{s}⊘{s} {s} {s}(script not found){s}\n", .{ style.yellow, style.reset, result.member_name, style.dim, style.reset });
                    skipped_count += 1;
                } else if (result.success) {
                    style.print("{s}✓{s} {s} {s}({d}ms){s}\n", .{ style.green, style.reset, result.member_name, style.dim, result.duration_ms, style.reset });
                    if (options.verbose and result.stdout.len > 0) {
                        style.print("{s}", .{result.stdout});
                    }
                    success_count += 1;
                } else {
                    style.print("{s}✗{s} {s} {s}(exit code: {d}){s}\n", .{ style.red, style.reset, result.member_name, style.dim, result.exit_code, style.reset });
                    if (result.stderr.len > 0) {
                        style.print("{s}", .{result.stderr});
                    }
                    failed_count += 1;
                }
            }
        }
    } else {
        // Sequential execution
        for (ordered_result.order) |member| {
            const scripts_map = lib.config.findProjectScripts(allocator, member.abs_path) catch {
                style.print("{s}⊘{s} {s} {s}(no scripts defined){s}\n", .{ style.yellow, style.reset, member.name, style.dim, style.reset });
                skipped_count += 1;
                continue;
            };

            if (scripts_map == null) {
                style.print("{s}⊘{s} {s} {s}(no scripts defined){s}\n", .{ style.yellow, style.reset, member.name, style.dim, style.reset });
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

            const script_command = scripts.get(script_name) orelse {
                style.print("{s}⊘{s} {s} {s}(script not found){s}\n", .{ style.yellow, style.reset, member.name, style.dim, style.reset });
                skipped_count += 1;
                continue;
            };

            style.print("{s}→{s} {s}\n", .{ style.blue, style.reset, member.name });

            var command_list = std.ArrayList(u8){};
            defer command_list.deinit(allocator);

            try command_list.appendSlice(allocator, script_command);
            for (script_args) |arg| {
                try command_list.append(allocator, ' ');
                try command_list.appendSlice(allocator, arg);
            }

            const full_command = command_list.items;

            const result = io_helper.childRunWithOptions(allocator, &[_][]const u8{ "sh", "-c", full_command }, .{
                .cwd = member.abs_path,
            }) catch |err| {
                style.print("{s}✗{s} {s} {s}({any}){s}\n", .{ style.red, style.reset, member.name, style.dim, err, style.reset });
                failed_count += 1;
                continue;
            };
            defer {
                allocator.free(result.stdout);
                allocator.free(result.stderr);
            }

            if (result.term.exited == 0) {
                style.print("{s}✓{s} {s}\n", .{ style.green, style.reset, member.name });
                if (options.verbose and result.stdout.len > 0) {
                    style.print("{s}", .{result.stdout});
                }
                success_count += 1;
            } else {
                style.print("{s}✗{s} {s} {s}(exit code: {}){s}\n", .{ style.red, style.reset, member.name, style.dim, result.term.exited, style.reset });
                if (result.stderr.len > 0) {
                    style.print("{s}", .{result.stderr});
                }
                failed_count += 1;
            }
        }
    }

    // Summary
    style.print("\n{s}✓{s} {d} succeeded", .{ style.green, style.reset, success_count });
    if (failed_count > 0) {
        style.print(", {s}{d} failed{s}", .{ style.red, failed_count, style.reset });
    }
    if (skipped_count > 0) {
        style.print(", {s}{d} skipped{s}", .{ style.yellow, skipped_count, style.reset });
    }
    style.print("\n", .{});
}
