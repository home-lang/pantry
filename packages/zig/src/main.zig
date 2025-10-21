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
    }
    // Package management
    else if (std.mem.eql(u8, command, "install")) {
        result = try commands.installCommand(allocator, command_args);
    } else if (std.mem.eql(u8, command, "uninstall")) {
        result = try commands.uninstallCommand(allocator, command_args);
    } else if (std.mem.eql(u8, command, "list")) {
        result = try commands.listCommand(allocator);
    } else if (std.mem.eql(u8, command, "search")) {
        result = try commands.searchCommand(allocator, command_args);
    } else if (std.mem.eql(u8, command, "info")) {
        result = try commands.infoCommand(allocator, command_args);
    } else if (std.mem.eql(u8, command, "update")) {
        result = try commands.updateCommand(allocator, command_args);
    } else if (std.mem.eql(u8, command, "outdated")) {
        result = try commands.outdatedCommand(allocator);
    }
    // Cache commands
    else if (std.mem.eql(u8, command, "cache:stats")) {
        result = try commands.cacheStatsCommand(allocator);
    } else if (std.mem.eql(u8, command, "cache:clear") or std.mem.eql(u8, command, "clean")) {
        result = try commands.cacheClearCommand(allocator);
    } else if (std.mem.eql(u8, command, "cache:clean")) {
        result = try commands.cacheCleanCommand(allocator);
    }
    // Environment commands
    else if (std.mem.eql(u8, command, "env:list")) {
        result = try commands.envListCommand(allocator);
    } else if (std.mem.eql(u8, command, "env:inspect")) {
        if (command_args.len == 0) {
            std.debug.print("Error: env:inspect requires a hash argument\n", .{});
            std.process.exit(1);
        }
        result = try commands.envInspectCommand(allocator, command_args[0]);
    } else if (std.mem.eql(u8, command, "env:remove")) {
        if (command_args.len == 0) {
            std.debug.print("Error: env:remove requires a hash argument\n", .{});
            std.process.exit(1);
        }
        result = try commands.envRemoveCommand(allocator, command_args[0]);
    } else if (std.mem.eql(u8, command, "env:clean")) {
        result = try commands.envCleanCommand(allocator);
    } else if (std.mem.eql(u8, command, "env:lookup")) {
        if (command_args.len == 0) {
            std.debug.print("Error: env:lookup requires a directory argument\n", .{});
            std.process.exit(1);
        }
        result = try commands.envLookupCommand(allocator, command_args[0]);
    }
    // Shell commands
    else if (std.mem.eql(u8, command, "shell:integrate")) {
        result = try commands.shellIntegrateCommand(allocator);
    } else if (std.mem.eql(u8, command, "shell:lookup")) {
        if (command_args.len == 0) {
            std.debug.print("Error: shell:lookup requires a directory argument\n", .{});
            std.process.exit(1);
        }
        result = try commands.shellLookupCommand(allocator, command_args[0]);
    } else if (std.mem.eql(u8, command, "shell:activate")) {
        if (command_args.len == 0) {
            std.debug.print("Error: shell:activate requires a directory argument\n", .{});
            std.process.exit(1);
        }
        result = try commands.shellActivateCommand(allocator, command_args[0]);
    }
    // Dev commands
    else if (std.mem.eql(u8, command, "dev:shellcode")) {
        result = try commands.devShellcodeCommand(allocator);
    } else if (std.mem.eql(u8, command, "dev:md5")) {
        if (command_args.len == 0) {
            std.debug.print("Error: dev:md5 requires a file path argument\n", .{});
            std.process.exit(1);
        }
        result = try commands.devMd5Command(allocator, command_args[0]);
    } else if (std.mem.eql(u8, command, "dev:find-project-root")) {
        if (command_args.len == 0) {
            std.debug.print("Error: dev:find-project-root requires a directory argument\n", .{});
            std.process.exit(1);
        }
        result = try commands.devFindProjectRootCommand(allocator, command_args[0]);
    } else if (std.mem.eql(u8, command, "dev:check-updates")) {
        result = try commands.devCheckUpdatesCommand(allocator);
    }
    // Service commands
    else if (std.mem.eql(u8, command, "services")) {
        result = try commands.servicesCommand(allocator);
    } else if (std.mem.eql(u8, command, "start")) {
        result = try commands.startCommand(allocator, command_args);
    } else if (std.mem.eql(u8, command, "stop")) {
        result = try commands.stopCommand(allocator, command_args);
    } else if (std.mem.eql(u8, command, "restart")) {
        result = try commands.restartCommand(allocator, command_args);
    } else if (std.mem.eql(u8, command, "status")) {
        result = try commands.statusCommand(allocator, command_args);
    }
    // Utility commands
    else if (std.mem.eql(u8, command, "doctor")) {
        result = try commands.doctorCommand(allocator);
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
        \\Package Management:
        \\  install [packages...]    Install packages
        \\  uninstall [packages...]  Remove packages
        \\  list                     List installed packages
        \\  search <term>            Search for packages
        \\  info <package>           Show package information
        \\  update [packages...]     Update packages
        \\  outdated                 Check for outdated packages
        \\
        \\Environment Management:
        \\  env:list                 List environments
        \\  env:inspect <hash>       Inspect environment
        \\  env:clean                Clean old environments
        \\  env:remove <hash>        Remove environment
        \\
        \\Cache Management:
        \\  clean                    Clear all cache (alias for cache:clear)
        \\  cache:clear              Clear all cache
        \\  cache:clean              Clean unused cache entries
        \\  cache:stats              Show cache statistics
        \\
        \\Service Management:
        \\  services                 List available services
        \\  start <service>          Start a service
        \\  stop <service>           Stop a service
        \\  restart <service>        Restart a service
        \\  status [service]         Show service status
        \\
        \\Shell Integration:
        \\  shell:integrate          Install shell integration
        \\  shell:lookup <dir>       Cache lookup (internal)
        \\  shell:activate <dir>     Activate environment (internal)
        \\
        \\Development:
        \\  dev:shellcode            Generate shell integration code
        \\  dev:md5 <file>           Compute MD5 hash
        \\  dev:find-project-root    Find project root directory
        \\  dev:check-updates        Check for updates
        \\
        \\Utilities:
        \\  doctor                   Verify installation
        \\
        \\Options:
        \\  --version, -v            Show version
        \\  --help, -h               Show this help
        \\
        \\For more information, visit: https://github.com/stacksjs/launchpad
        \\
    , .{});
}
