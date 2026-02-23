//! Scripts commands: run, list

const std = @import("std");
const io_helper = @import("../../io_helper.zig");
const lib = @import("../../lib.zig");
const common = @import("common.zig");
const style = @import("../style.zig");

const CommandResult = common.CommandResult;

pub const RunScriptOptions = struct {
    timeout_ms: u64 = 120000,
};

// ============================================================================
// Run Script Command
// ============================================================================

/// Run a script from pantry.json
pub fn runScriptCommand(allocator: std.mem.Allocator, args: []const []const u8) !CommandResult {
    return runScriptCommandWithOptions(allocator, args, .{});
}

/// Run a script from pantry.json with advanced options
pub fn runScriptCommandWithOptions(
    allocator: std.mem.Allocator,
    args: []const []const u8,
    options: RunScriptOptions,
) !CommandResult {
    if (args.len == 0) {
        return CommandResult.err(allocator, "Error: No script name provided\nUsage: pantry run <script-name> [args...]");
    }

    const script_name = args[0];
    const script_args = if (args.len > 1) args[1..] else &[_][]const u8{};

    // Get current working directory
    const cwd = io_helper.realpathAlloc(allocator, ".") catch {
        return CommandResult.err(allocator, "Error: Could not determine current directory");
    };
    defer allocator.free(cwd);

    // Find project scripts
    const scripts_map = lib.config.findProjectScripts(allocator, cwd) catch |err| {
        const msg = try std.fmt.allocPrint(allocator, "Error loading scripts: {}", .{err});
        return .{
            .exit_code = 1,
            .message = msg,
        };
    };

    if (scripts_map == null) {
        return CommandResult.err(allocator, "Error: No scripts found in pantry.json");
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

    // Find the requested script
    const script_command = scripts.get(script_name) orelse {
        // Build error message with available scripts
        var count: usize = 0;
        var it_count = scripts.iterator();
        while (it_count.next()) |_| count += 1;

        const prefix = try std.fmt.allocPrint(allocator, "Error: Script '{s}' not found\n\nAvailable scripts:\n", .{script_name});
        defer allocator.free(prefix);

        // Collect script names
        var names = try allocator.alloc([]const u8, count);
        defer allocator.free(names);

        var idx: usize = 0;
        var it = scripts.iterator();
        while (it.next()) |entry| {
            names[idx] = entry.key_ptr.*;
            idx += 1;
        }

        // Format list of scripts
        var list = std.ArrayList(u8){};
        defer list.deinit(allocator);
        for (names) |name| {
            try list.appendSlice(allocator, "  ");
            try list.appendSlice(allocator, name);
            try list.appendSlice(allocator, "\n");
        }

        const msg = try std.fmt.allocPrint(allocator, "{s}{s}", .{ prefix, list.items });

        return .{
            .exit_code = 1,
            .message = msg,
        };
    };

    // Build display command
    var command_list = std.ArrayList(u8){};
    defer command_list.deinit(allocator);

    try command_list.appendSlice(allocator, script_command);
    for (script_args) |arg| {
        try command_list.append(allocator, ' ');
        try command_list.appendSlice(allocator, arg);
    }
    const display_command = command_list.items;

    // Print what we're running
    style.print("{s}$ {s}{s}\n", .{ style.dim, display_command, style.reset });

    // Set up command wrapper with pantry/.bin in PATH
    const pantry_bin = try std.fmt.allocPrint(allocator, "{s}/node_modules/.bin", .{cwd});
    defer allocator.free(pantry_bin);

    // Get current PATH and prepend pantry/.bin
    const current_path = io_helper.getEnvVarOwned(allocator, "PATH") catch try allocator.dupe(u8, "/usr/bin:/bin");
    defer allocator.free(current_path);
    const wrapped_command = try std.fmt.allocPrint(
        allocator,
        "export PATH=\"{s}:{s}\" && {s}",
        .{ pantry_bin, current_path, display_command },
    );
    defer allocator.free(wrapped_command);

    // Execute with timeout support
    const result = io_helper.childRunWithOptions(allocator, &[_][]const u8{ "sh", "-c", wrapped_command }, .{
        .cwd = cwd,
        .timeout_ms = options.timeout_ms,
    }) catch |err| {
        const msg = try std.fmt.allocPrint(allocator, "Error executing script: {}", .{err});
        return .{
            .exit_code = 1,
            .message = msg,
        };
    };
    defer allocator.free(result.stdout);
    defer allocator.free(result.stderr);

    // Check for timeout
    if (result.timed_out) {
        style.print("{s}Error: Script '{s}' timed out after {d}ms{s}\n", .{
            style.red,
            script_name,
            options.timeout_ms,
            style.reset,
        });
        return .{ .exit_code = 1 };
    }

    // Print output
    if (result.stdout.len > 0) {
        style.print("{s}", .{result.stdout});
    }
    if (result.stderr.len > 0) {
        style.print("{s}", .{result.stderr});
    }

    const exit_code: u8 = switch (result.term) {
        .exited => |code| @intCast(code),
        else => 1,
    };

    return .{ .exit_code = if (exit_code == 0) 0 else 1 };
}

// ============================================================================
// List Scripts Command
// ============================================================================

/// List all available scripts in the current project
pub fn listScriptsCommand(allocator: std.mem.Allocator) !CommandResult {
    // Get current working directory
    const cwd = io_helper.realpathAlloc(allocator, ".") catch {
        return CommandResult.err(allocator, "Error: Could not determine current directory");
    };
    defer allocator.free(cwd);

    // Find project scripts
    const scripts_map = lib.config.findProjectScripts(allocator, cwd) catch |err| {
        const msg = try std.fmt.allocPrint(allocator, "Error loading scripts: {}", .{err});
        return .{
            .exit_code = 1,
            .message = msg,
        };
    };

    if (scripts_map == null) {
        return .{
            .exit_code = 0,
            .message = try allocator.dupe(u8, "No scripts found in pantry.json"),
        };
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

    // Build output listing all scripts
    var output_list = std.ArrayList(u8){};
    defer output_list.deinit(allocator);

    try output_list.appendSlice(allocator, style.bold);
    try output_list.appendSlice(allocator, "Available scripts:");
    try output_list.appendSlice(allocator, style.reset);
    try output_list.appendSlice(allocator, "\n\n");

    // Collect and sort script names
    var script_names_buf: [100][]const u8 = undefined;
    var script_count: usize = 0;

    var it = scripts.iterator();
    while (it.next()) |entry| {
        if (script_count >= script_names_buf.len) break;
        script_names_buf[script_count] = entry.key_ptr.*;
        script_count += 1;
    }

    const script_names = script_names_buf[0..script_count];

    // Simple bubble sort
    var i: usize = 0;
    while (i < script_names.len) : (i += 1) {
        var j: usize = i + 1;
        while (j < script_names.len) : (j += 1) {
            if (std.mem.order(u8, script_names[i], script_names[j]) == .gt) {
                const temp = script_names[i];
                script_names[i] = script_names[j];
                script_names[j] = temp;
            }
        }
    }

    // Print scripts in sorted order
    for (script_names) |name| {
        const command = scripts.get(name).?;
        try output_list.appendSlice(allocator, "  ");
        try output_list.appendSlice(allocator, style.cyan);
        try output_list.appendSlice(allocator, name);
        try output_list.appendSlice(allocator, style.reset);
        try output_list.appendSlice(allocator, "\n    ");
        try output_list.appendSlice(allocator, command);
        try output_list.appendSlice(allocator, "\n\n");
    }

    return .{
        .exit_code = 0,
        .message = try allocator.dupe(u8, output_list.items),
    };
}
