const std = @import("std");
const lib = @import("lib.zig");

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

    if (std.mem.eql(u8, command, "--version") or std.mem.eql(u8, command, "-v")) {
        try printVersion();
    } else if (std.mem.eql(u8, command, "--help") or std.mem.eql(u8, command, "-h")) {
        try printHelp();
    } else {
        std.debug.print("Unknown command: {s}\n", .{command});
        std.debug.print("Run 'launchpad --help' for usage\n", .{});
        std.process.exit(1);
    }
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
