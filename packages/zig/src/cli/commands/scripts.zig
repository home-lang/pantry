//! Scripts commands: run, list

const std = @import("std");
const io_helper = @import("../../io_helper.zig");
const lib = @import("../../lib.zig");
const common = @import("common.zig");
const style = @import("../style.zig");

const CommandResult = common.CommandResult;

pub const RunScriptOptions = struct {
    timeout_ms: u64 = 0,
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
        var list = std.ArrayList(u8).empty;
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
    var command_list = std.ArrayList(u8).empty;
    defer command_list.deinit(allocator);

    try command_list.appendSlice(allocator, script_command);
    for (script_args) |arg| {
        try command_list.appendSlice(allocator, " '");
        for (arg) |ch| {
            if (ch == '\'') {
                try command_list.appendSlice(allocator, "'\\''");
            } else {
                try command_list.append(allocator, ch);
            }
        }
        try command_list.append(allocator, '\'');
    }
    const display_command = command_list.items;

    // Print what we're running
    style.print("{s}$ {s}{s}\n", .{ style.dim, display_command, style.reset });

    // Load pantry.toml to get modules directory name
    const pantry_config = lib.config.loadPantryToml(allocator, cwd) catch lib.config.PantryConfig{};

    // Determine the effective project root for PATH — in a workspace, packages
    // are hoisted to the workspace root, so .bin is there, not in the member dir.
    const effective_root = try @import("../../deps/detector.zig").resolveProjectRoot(allocator, cwd);
    defer allocator.free(effective_root);

    // Set up command wrapper with pantry/.bin in PATH
    const pantry_bin = try std.fmt.allocPrint(allocator, "{s}/{s}/.bin", .{ effective_root, pantry_config.install.modules_dir });
    defer allocator.free(pantry_bin);

    // Also walk up from cwd adding each node_modules/.bin so JS package
    // binaries (nuxt, vite, eslint, …) installed by bun/pnpm/npm are
    // findable. Mirrors lifecycle.zig's PATH walking — without this,
    // `pantry run dev` (which shells out to e.g. `nuxt dev`) fails with
    // "command not found" even though `bun install` populated
    // node_modules/.bin/nuxt.
    var nm_path_buf = std.ArrayList(u8).empty;
    defer nm_path_buf.deinit(allocator);
    {
        var dir: []const u8 = cwd;
        while (true) {
            if (nm_path_buf.items.len > 0) try nm_path_buf.append(allocator, ':');
            try nm_path_buf.appendSlice(allocator, dir);
            try nm_path_buf.appendSlice(allocator, "/node_modules/.bin");
            const parent = std.fs.path.dirname(dir) orelse break;
            if (std.mem.eql(u8, parent, dir)) break;
            dir = parent;
        }
    }

    // Get current PATH and prepend pantry/.bin then node_modules/.bin chain
    const current_path = io_helper.getEnvVarOwned(allocator, "PATH") catch try allocator.dupe(u8, "/usr/bin:/bin");
    defer allocator.free(current_path);
    const wrapped_command = try std.fmt.allocPrint(
        allocator,
        "export PATH=\"{s}:{s}:{s}\" && {s}",
        .{ pantry_bin, nm_path_buf.items, current_path, display_command },
    );
    defer allocator.free(wrapped_command);

    // Stream the child's stdout/stderr straight through to the user's
    // terminal instead of buffering it in memory until exit. The
    // previous implementation called io_helper.childRunWithOptions
    // which, with timeout_ms == 0, falls through to std.process.run
    // — that blocks until the child exits and captures stdout/stderr
    // into allocated buffers, which only get printed below after the
    // child has returned. That's fine for one-shot scripts (build,
    // lint, test) but breaks every long-running script (dev servers,
    // file watchers, `preview`): the URL banner and any progress
    // output stay invisible until the user kills the process, at
    // which point pantry finally flushes everything to the terminal
    // — way too late to be useful. Spawning with inherited stdio
    // hands the child the same FDs pantry itself has, so writes
    // from the child appear immediately in the user's terminal.
    //
    // With inherited stdio we no longer capture output ourselves —
    // result.stdout/stderr become empty regardless of timeout — so
    // the post-exit "Print output" block below is gone too.
    const argv = [_][]const u8{ "sh", "-c", wrapped_command };
    var child = std.process.spawn(io_helper.getIo(), .{
        .argv = &argv,
        .cwd = io_helper.toCwd(cwd),
    }) catch |err| {
        const msg = try std.fmt.allocPrint(allocator, "Error executing script: {}", .{err});
        return .{
            .exit_code = 1,
            .message = msg,
        };
    };

    const wait_result = io_helper.waitWithTimeout(&child, options.timeout_ms) catch |err| {
        const msg = try std.fmt.allocPrint(allocator, "Error waiting for script: {}", .{err});
        return .{
            .exit_code = 1,
            .message = msg,
        };
    };

    const term = switch (wait_result) {
        .success => |t| t,
        .timeout => {
            style.print("{s}Error: Script '{s}' timed out after {d}ms{s}\n", .{
                style.red,
                script_name,
                options.timeout_ms,
                style.reset,
            });
            return .{ .exit_code = 1 };
        },
    };

    const exit_code: u8 = switch (term) {
        .exited => |code| if (code <= 255) @intCast(code) else 1,
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
    var output_list = std.ArrayList(u8).empty;
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
