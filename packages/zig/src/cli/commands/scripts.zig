//! Scripts commands: run, list

const std = @import("std");
const lib = @import("../../lib.zig");
const common = @import("common.zig");

const CommandResult = common.CommandResult;

// ============================================================================
// Run Script Command
// ============================================================================

/// Run a script from pantry.json or package.json
pub fn runScriptCommand(allocator: std.mem.Allocator, args: []const []const u8) !CommandResult {
    if (args.len == 0) {
        return CommandResult.err(allocator, "Error: No script name provided\nUsage: pantry run <script-name> [args...]");
    }

    const script_name = args[0];
    const script_args = if (args.len > 1) args[1..] else &[_][]const u8{};

    // Get current working directory
    const cwd = std.fs.cwd().realpathAlloc(allocator, ".") catch {
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
        return CommandResult.err(allocator, "Error: No scripts found in pantry.json or package.json");
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
        var list_buf: [1024]u8 = undefined;
        var list_stream = std.io.fixedBufferStream(&list_buf);
        const writer = list_stream.writer();
        for (names) |name| {
            writer.print("  {s}\n", .{name}) catch break;
        }

        const msg = try std.fmt.allocPrint(allocator, "{s}{s}", .{ prefix, list_stream.getWritten() });

        return .{
            .exit_code = 1,
            .message = msg,
        };
    };

    // Build display command
    var command_buf: [2048]u8 = undefined;
    var command_stream = std.io.fixedBufferStream(&command_buf);
    const cmd_writer = command_stream.writer();

    try cmd_writer.writeAll(script_command);
    for (script_args) |arg| {
        try cmd_writer.writeByte(' ');
        try cmd_writer.writeAll(arg);
    }
    const display_command = try allocator.dupe(u8, command_stream.getWritten());
    defer allocator.free(display_command);

    // Print what we're running
    std.debug.print("\x1b[2m$ {s}\x1b[0m\n", .{display_command});

    // Build argv for shell execution
    var argv_buf: [128][]const u8 = undefined;
    argv_buf[0] = "sh";
    argv_buf[1] = "-c";
    argv_buf[2] = script_command;
    argv_buf[3] = "_"; // sh placeholder for $0

    var argc: usize = 4;
    for (script_args) |arg| {
        if (argc >= argv_buf.len) break;
        argv_buf[argc] = arg;
        argc += 1;
    }

    // Execute the script
    const result = std.process.Child.run(.{
        .allocator = allocator,
        .argv = argv_buf[0..argc],
        .cwd = cwd,
    }) catch |err| {
        const msg = try std.fmt.allocPrint(allocator, "Error executing script: {}", .{err});
        return .{
            .exit_code = 1,
            .message = msg,
        };
    };
    defer allocator.free(result.stdout);
    defer allocator.free(result.stderr);

    // Print output
    if (result.stdout.len > 0) {
        std.debug.print("{s}", .{result.stdout});
    }
    if (result.stderr.len > 0) {
        std.debug.print("{s}", .{result.stderr});
    }

    return .{
        .exit_code = if (result.term.Exited == 0) @as(u8, 0) else @as(u8, 1),
    };
}

// ============================================================================
// List Scripts Command
// ============================================================================

/// List all available scripts in the current project
pub fn listScriptsCommand(allocator: std.mem.Allocator) !CommandResult {
    // Get current working directory
    const cwd = std.fs.cwd().realpathAlloc(allocator, ".") catch {
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
            .message = try allocator.dupe(u8, "No scripts found in pantry.json or package.json"),
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
    var output_buf: [8192]u8 = undefined;
    var output_stream = std.io.fixedBufferStream(&output_buf);
    const writer = output_stream.writer();

    try writer.writeAll("\x1b[1mAvailable scripts:\x1b[0m\n\n");

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
        try writer.writeAll("  \x1b[36m");
        try writer.writeAll(name);
        try writer.writeAll("\x1b[0m\n    ");
        try writer.writeAll(command);
        try writer.writeAll("\n\n");
    }

    const output_bytes = output_stream.getWritten();
    return .{
        .exit_code = 0,
        .message = try allocator.dupe(u8, output_bytes),
    };
}
