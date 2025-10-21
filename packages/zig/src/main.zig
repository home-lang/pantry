const std = @import("std");
const lib = @import("lib.zig");
const commands = @import("cli/commands.zig");

pub fn main() !void {
    var gpa = std.heap.GeneralPurposeAllocator(.{}){};
    defer _ = gpa.deinit();
    const allocator = gpa.allocator();

    const args = try std.process.argsAlloc(allocator);
    defer std.process.argsFree(allocator, args);

    if (args.len < 2) {
        try printHelp();
        return;
    }

    const command = args[1];
    const command_args = if (args.len > 2) args[2..] else &[_][]const u8{};

    var result: commands.CommandResult = undefined;

    // Route commands
    if (std.mem.eql(u8, command, "--version") or std.mem.eql(u8, command, "-v")) {
        try printVersion();
        return;
    } else if (std.mem.eql(u8, command, "--help") or std.mem.eql(u8, command, "-h")) {
        try printHelp();
        return;
    } else if (std.mem.eql(u8, command, "install")) {
        result = try commands.installCommand(allocator, command_args);
    } else if (std.mem.eql(u8, command, "list")) {
        result = try commands.listCommand(allocator);
    } else if (std.mem.eql(u8, command, "cache:stats")) {
        result = try commands.cacheStatsCommand(allocator);
    } else if (std.mem.eql(u8, command, "cache:clear")) {
        result = try commands.cacheClearCommand(allocator);
    } else if (std.mem.eql(u8, command, "env:list")) {
        result = try commands.envListCommand(allocator);
    } else if (std.mem.eql(u8, command, "env:remove")) {
        if (command_args.len == 0) {
            std.debug.print("Error: env:remove requires a hash argument\n", .{});
            std.process.exit(1);
        }
        result = try commands.envRemoveCommand(allocator, command_args[0]);
    } else if (std.mem.eql(u8, command, "shell:integrate")) {
        result = try commands.shellIntegrateCommand(allocator);
    } else {
        std.debug.print("Unknown command: {s}\n", .{command});
        std.debug.print("Run 'launchpad --help' for usage\n", .{});
        std.process.exit(1);
    }

    defer result.deinit(allocator);

    if (result.message) |msg| {
        std.debug.print("{s}\n", .{msg});
    }

    std.process.exit(result.exit_code);
}

fn printVersion() !void {
    std.debug.print("launchpad 1.0.0-alpha (Zig)\n", .{});
}

fn printHelp() !void {
    std.debug.print(
        \\launchpad - Modern dependency manager
        \\
        \\Usage:
        \\  launchpad <command> [options]
        \\
        \\Commands:
        \\  install [packages...]    Install packages
        \\  uninstall [packages...]  Remove packages
        \\  list                     List installed packages
        \\  search <term>            Search for packages
        \\  info <package>           Show package information
        \\
        \\  env:list                 List environments
        \\  env:inspect <hash>       Inspect environment
        \\  env:clean                Clean old environments
        \\  env:remove <hash>        Remove environment
        \\
        \\  cache:clear              Clear cache
        \\  cache:stats              Show cache statistics
        \\
        \\  shell:lookup <dir>       Cache lookup (internal)
        \\  shell:activate <dir>     Activate environment (internal)
        \\
        \\Options:
        \\  --version, -v     Show version
        \\  --help, -h        Show this help
        \\
        \\For more information, visit: https://github.com/stacksjs/launchpad
        \\
    , .{});
}
