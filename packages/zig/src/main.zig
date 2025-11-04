const std = @import("std");
const cli = @import("zig-cli");
const lib = @import("lib");

// ============================================================================
// Command Option Definitions
// ============================================================================

const InstallOptions = struct {
    packages: []const []const u8 = &[_][]const u8{}, // Variadic packages
    global: bool = false,
    force: bool = false,
    verbose: bool = false,
};

const ListOptions = struct {
    format: []const u8 = "table", // table, json, simple
    verbose: bool = false,
};

const CacheStatsOptions = struct {
    format: []const u8 = "table",
};

const CacheClearOptions = struct {
    all: bool = false,
    force: bool = false,
};

const EnvListOptions = struct {
    format: []const u8 = "table", // table, json, simple
    verbose: bool = false,
};

const EnvInspectOptions = struct {
    hash: []const u8,
    verbose: bool = false,
    show_stubs: bool = false,
};

const EnvCleanOptions = struct {
    days: u32 = 30,
    dry_run: bool = false,
    force: bool = false,
};

const EnvRemoveOptions = struct {
    hash: []const u8,
    force: bool = false,
};

const ShellLookupOptions = struct {
    dir: []const u8,
};

const ShellActivateOptions = struct {
    dir: []const u8,
};

// ============================================================================
// Command Actions
// ============================================================================

fn installAction(ctx: *cli.BaseCommand.ParseContext) !void {
    const allocator = ctx.allocator;

    // Get variadic package arguments
    var packages = std.ArrayList([]const u8){};
    defer packages.deinit(allocator);

    var i: usize = 0;
    while (ctx.getArgument(i)) |pkg| : (i += 1) {
        try packages.append(allocator, pkg);
    }

    const global = ctx.hasOption("global");
    const user = ctx.hasOption("user");
    const force = ctx.hasOption("force");
    const verbose = ctx.hasOption("verbose");
    const production = ctx.hasOption("production");
    const dev_only = ctx.hasOption("dev");
    const include_peer = ctx.hasOption("peer");

    _ = force;
    _ = verbose;

    // If global flag is set and no packages specified, install global dependencies
    if (global and packages.items.len == 0) {
        const result = if (user)
            try lib.commands.installGlobalDepsCommandUserLocal(allocator)
        else
            try lib.commands.installGlobalDepsCommand(allocator);
        defer result.deinit(allocator);

        if (result.message) |msg| {
            std.debug.print("{s}\n", .{msg});
        }

        std.process.exit(result.exit_code);
    }

    // If global flag is set WITH packages, install those packages globally
    if (global and packages.items.len > 0) {
        const result = try lib.commands.installPackagesGloballyCommand(allocator, packages.items);
        defer result.deinit(allocator);

        if (result.message) |msg| {
            std.debug.print("{s}\n", .{msg});
        }

        std.process.exit(result.exit_code);
    }

    // Call existing install logic with options
    const install_options = lib.commands.InstallOptions{
        .production = production,
        .dev_only = dev_only,
        .include_peer = include_peer,
    };
    const result = try lib.commands.installCommandWithOptions(allocator, packages.items, install_options);
    defer result.deinit(allocator);

    if (result.message) |msg| {
        std.debug.print("{s}\n", .{msg});
    }

    std.process.exit(result.exit_code);
}

fn runAction(ctx: *cli.BaseCommand.ParseContext) !void {
    const allocator = ctx.allocator;

    const script_name = ctx.getArgument(0) orelse {
        std.debug.print("Error: No script name provided\n", .{});
        std.process.exit(1);
    };

    // Use a stack-allocated array for args
    var args_buf: [32][]const u8 = undefined;
    var args_len: usize = 0;

    args_buf[args_len] = script_name;
    args_len += 1;

    // Get remaining arguments
    var i: usize = 1;
    while (true) : (i += 1) {
        const arg = ctx.getArgument(i) orelse break;
        if (args_len >= args_buf.len) break; // Prevent overflow
        args_buf[args_len] = arg;
        args_len += 1;
    }

    var result = try lib.commands.runScriptCommand(allocator, args_buf[0..args_len]);
    defer result.deinit(allocator);

    if (result.message) |msg| {
        std.debug.print("{s}\n", .{msg});
    }

    std.process.exit(result.exit_code);
}

fn scriptsListAction(ctx: *cli.BaseCommand.ParseContext) !void {
    const allocator = ctx.allocator;

    var result = try lib.commands.listScriptsCommand(allocator);
    defer result.deinit(allocator);

    if (result.message) |msg| {
        std.debug.print("{s}\n", .{msg});
    }

    std.process.exit(result.exit_code);
}

fn listAction(ctx: *cli.BaseCommand.ParseContext) !void {
    const allocator = ctx.allocator;

    const format = ctx.getOption("format") orelse "table";
    const verbose = ctx.hasOption("verbose");

    _ = format;
    _ = verbose;

    const result = try lib.commands.listCommand(allocator, &[_][]const u8{});
    defer result.deinit(allocator);

    if (result.message) |msg| {
        std.debug.print("{s}\n", .{msg});
    }

    std.process.exit(result.exit_code);
}

fn cacheStatsAction(ctx: *cli.BaseCommand.ParseContext) !void {
    const allocator = ctx.allocator;

    const format = ctx.getOption("format") orelse "table";
    _ = format;

    const result = try lib.commands.cacheStatsCommand(allocator, &[_][]const u8{});
    defer result.deinit(allocator);

    if (result.message) |msg| {
        std.debug.print("{s}\n", .{msg});
    }

    std.process.exit(result.exit_code);
}

fn cacheClearAction(ctx: *cli.BaseCommand.ParseContext) !void {
    const allocator = ctx.allocator;

    const force = ctx.hasOption("force");
    _ = force;

    const result = try lib.commands.cacheClearCommand(allocator, &[_][]const u8{});
    defer result.deinit(allocator);

    if (result.message) |msg| {
        std.debug.print("{s}\n", .{msg});
    }

    std.process.exit(result.exit_code);
}

fn cleanAction(ctx: *cli.BaseCommand.ParseContext) !void {
    const allocator = ctx.allocator;

    const clean_local = ctx.hasOption("local");
    const clean_global = ctx.hasOption("global");
    const clean_cache = ctx.hasOption("cache");
    const clean_all = ctx.hasOption("all");

    // If no flags specified, default to cleaning local deps (which includes env cache)
    // This is the most common dev workflow: clean project to test fresh install
    const should_clean_local = clean_all or clean_local or (!clean_local and !clean_global and !clean_cache and !clean_all);
    const should_clean_global = clean_all or clean_global;
    const should_clean_cache = clean_all or clean_cache;

    const result = try lib.commands.cleanCommand(allocator, .{
        .local = should_clean_local,
        .global = should_clean_global,
        .cache = should_clean_cache,
    });
    defer result.deinit(allocator);

    if (result.message) |msg| {
        std.debug.print("{s}\n", .{msg});
    }

    std.process.exit(result.exit_code);
}

fn envListAction(ctx: *cli.BaseCommand.ParseContext) !void {
    const allocator = ctx.allocator;

    const format = ctx.getOption("format") orelse "table";
    const verbose = ctx.hasOption("verbose");

    _ = format;
    _ = verbose;

    const result = try lib.commands.envListCommand(allocator, &[_][]const u8{});
    defer result.deinit(allocator);

    if (result.message) |msg| {
        std.debug.print("{s}\n", .{msg});
    }

    std.process.exit(result.exit_code);
}

fn envInspectAction(ctx: *cli.BaseCommand.ParseContext) !void {
    const allocator = ctx.allocator;

    const hash = ctx.getArgument(0) orelse {
        std.debug.print("Error: env:inspect requires a hash argument\n", .{});
        std.process.exit(1);
    };

    const verbose = ctx.hasOption("verbose");
    _ = verbose;

    const result = try lib.commands.envInspectCommand(allocator, hash);
    defer result.deinit(allocator);

    if (result.message) |msg| {
        std.debug.print("{s}\n", .{msg});
    }

    std.process.exit(result.exit_code);
}

fn envCleanAction(ctx: *cli.BaseCommand.ParseContext) !void {
    const allocator = ctx.allocator;

    const dry_run = ctx.hasOption("dry-run");
    const force = ctx.hasOption("force");

    _ = dry_run;
    _ = force;

    const result = try lib.commands.envCleanCommand(allocator, &[_][]const u8{});
    defer result.deinit(allocator);

    if (result.message) |msg| {
        std.debug.print("{s}\n", .{msg});
    }

    std.process.exit(result.exit_code);
}

fn envRemoveAction(ctx: *cli.BaseCommand.ParseContext) !void {
    const allocator = ctx.allocator;

    const hash = ctx.getArgument(0) orelse {
        std.debug.print("Error: env:remove requires a hash argument\n", .{});
        std.process.exit(1);
    };

    const force = ctx.hasOption("force");
    _ = force;

    const result = try lib.commands.envRemoveCommand(allocator, hash);
    defer result.deinit(allocator);

    if (result.message) |msg| {
        std.debug.print("{s}\n", .{msg});
    }

    std.process.exit(result.exit_code);
}

fn shellIntegrateAction(ctx: *cli.BaseCommand.ParseContext) !void {
    const allocator = ctx.allocator;

    const result = try lib.commands.shellIntegrateCommand(allocator);
    defer result.deinit(allocator);

    if (result.message) |msg| {
        std.debug.print("{s}\n", .{msg});
    }

    std.process.exit(result.exit_code);
}

fn shellLookupAction(ctx: *cli.BaseCommand.ParseContext) !void {
    const allocator = ctx.allocator;

    const dir = ctx.getArgument(0) orelse {
        std.debug.print("Error: shell:lookup requires a directory argument\n", .{});
        std.process.exit(1);
    };

    const result = try lib.commands.shellLookupCommand(allocator, dir);
    defer result.deinit(allocator);

    if (result.message) |msg| {
        std.debug.print("{s}\n", .{msg});
    }

    std.process.exit(result.exit_code);
}

fn shellActivateAction(ctx: *cli.BaseCommand.ParseContext) !void {
    const allocator = ctx.allocator;

    const dir = ctx.getArgument(0) orelse {
        std.debug.print("Error: shell:activate requires a directory argument\n", .{});
        std.process.exit(1);
    };

    const result = try lib.commands.shellActivateCommand(allocator, dir);
    defer result.deinit(allocator);

    if (result.message) |msg| {
        std.debug.print("{s}\n", .{msg});
    }

    std.process.exit(result.exit_code);
}

fn devShellcodeAction(ctx: *cli.BaseCommand.ParseContext) !void {
    const allocator = ctx.allocator;

    var result = try lib.commands.shellCodeCommand(allocator);
    defer result.deinit(allocator);

    if (result.message) |msg| {
        // Write to stdout for eval to capture
        // In Zig 0.15, we access stdout via file descriptor 1
        const stdout_fd: std.posix.fd_t = 1;
        const bytes_written = std.posix.write(stdout_fd, msg) catch |err| {
            std.debug.print("Error writing to stdout: {}\n", .{err});
            std.process.exit(1);
        };
        _ = bytes_written;
    }

    std.process.exit(result.exit_code);
}

fn servicesAction(ctx: *cli.BaseCommand.ParseContext) !void {
    const allocator = ctx.allocator;

    const result = try lib.commands.servicesListCommand(allocator);
    defer result.deinit(allocator);

    if (result.message) |msg| {
        std.debug.print("{s}\n", .{msg});
    }

    std.process.exit(result.exit_code);
}

fn startAction(ctx: *cli.BaseCommand.ParseContext) !void {
    const allocator = ctx.allocator;

    const service_name = ctx.getArgument(0) orelse {
        std.debug.print("Error: start requires a service name argument\n", .{});
        std.process.exit(1);
    };

    const args = [_][]const u8{service_name};
    const result = try lib.commands.serviceStartCommand(allocator, &args);
    defer result.deinit(allocator);

    if (result.message) |msg| {
        std.debug.print("{s}\n", .{msg});
    }

    std.process.exit(result.exit_code);
}

fn stopAction(ctx: *cli.BaseCommand.ParseContext) !void {
    const allocator = ctx.allocator;

    const service_name = ctx.getArgument(0) orelse {
        std.debug.print("Error: stop requires a service name argument\n", .{});
        std.process.exit(1);
    };

    const args = [_][]const u8{service_name};
    const result = try lib.commands.serviceStopCommand(allocator, &args);
    defer result.deinit(allocator);

    if (result.message) |msg| {
        std.debug.print("{s}\n", .{msg});
    }

    std.process.exit(result.exit_code);
}

fn restartAction(ctx: *cli.BaseCommand.ParseContext) !void {
    const allocator = ctx.allocator;

    const service_name = ctx.getArgument(0) orelse {
        std.debug.print("Error: restart requires a service name argument\n", .{});
        std.process.exit(1);
    };

    const args = [_][]const u8{service_name};
    const result = try lib.commands.serviceRestartCommand(allocator, &args);
    defer result.deinit(allocator);

    if (result.message) |msg| {
        std.debug.print("{s}\n", .{msg});
    }

    std.process.exit(result.exit_code);
}

fn statusAction(ctx: *cli.BaseCommand.ParseContext) !void {
    const allocator = ctx.allocator;

    const service_name = ctx.getArgument(0) orelse {
        std.debug.print("Error: status requires a service name argument\n", .{});
        std.process.exit(1);
    };

    const args = [_][]const u8{service_name};
    const result = try lib.commands.serviceStatusCommand(allocator, &args);
    defer result.deinit(allocator);

    if (result.message) |msg| {
        std.debug.print("{s}\n", .{msg});
    }

    std.process.exit(result.exit_code);
}

// ============================================================================
// Main
// ============================================================================

pub fn main() !void {
    var gpa = std.heap.GeneralPurposeAllocator(.{}){};
    defer _ = gpa.deinit();
    const allocator = gpa.allocator();

    // Create root command
    var root = try cli.BaseCommand.init(allocator, "pantry", "Modern dependency manager");
    defer {
        root.deinit();
        allocator.destroy(root);
    }

    // ========================================================================
    // Install Command
    // ========================================================================
    var install_cmd = try cli.BaseCommand.init(allocator, "install", "Install packages");

    const install_packages_arg = cli.Argument.init("packages", "Packages to install", .string)
        .withRequired(false)
        .withVariadic(true);
    _ = try install_cmd.addArgument(install_packages_arg);

    const global_opt = cli.Option.init("global", "global", "Install globally", .bool)
        .withShort('g');
    _ = try install_cmd.addOption(global_opt);

    const user_opt = cli.Option.init("user", "user", "Install to user directory (~/.pantry/global)", .bool)
        .withShort('u');
    _ = try install_cmd.addOption(user_opt);

    const install_force_opt = cli.Option.init("force", "force", "Force installation", .bool)
        .withShort('f');
    _ = try install_cmd.addOption(install_force_opt);

    const install_verbose_opt = cli.Option.init("verbose", "verbose", "Verbose output", .bool)
        .withShort('v');
    _ = try install_cmd.addOption(install_verbose_opt);

    const install_production_opt = cli.Option.init("production", "production", "Skip devDependencies (install only dependencies)", .bool)
        .withShort('p');
    _ = try install_cmd.addOption(install_production_opt);

    const install_dev_opt = cli.Option.init("dev", "dev", "Install devDependencies only", .bool)
        .withShort('d');
    _ = try install_cmd.addOption(install_dev_opt);

    const install_peer_opt = cli.Option.init("peer", "peer", "Install peerDependencies", .bool);
    _ = try install_cmd.addOption(install_peer_opt);

    _ = install_cmd.setAction(installAction);
    _ = try root.addCommand(install_cmd);

    // ========================================================================
    // List Command
    // ========================================================================
    var list_cmd = try cli.BaseCommand.init(allocator, "list", "List installed packages");

    const list_format_opt = cli.Option.init("format", "format", "Output format (table, json, simple)", .string)
        .withDefault("table");
    _ = try list_cmd.addOption(list_format_opt);

    const list_verbose_opt = cli.Option.init("verbose", "verbose", "Verbose output", .bool)
        .withShort('v');
    _ = try list_cmd.addOption(list_verbose_opt);

    _ = list_cmd.setAction(listAction);
    _ = try root.addCommand(list_cmd);

    // ========================================================================
    // Run Command (Script Runner)
    // ========================================================================
    var run_cmd = try cli.BaseCommand.init(allocator, "run", "Run a script from pantry.json or package.json");

    const run_script_arg = cli.Argument.init("script", "Script name", .string)
        .withRequired(true);
    _ = try run_cmd.addArgument(run_script_arg);

    const run_args_arg = cli.Argument.init("args", "Script arguments", .string)
        .withVariadic(true)
        .withRequired(false);
    _ = try run_cmd.addArgument(run_args_arg);

    _ = run_cmd.setAction(runAction);
    _ = try root.addCommand(run_cmd);

    // ========================================================================
    // Scripts Command
    // ========================================================================
    var scripts_list_cmd = try cli.BaseCommand.init(allocator, "scripts", "List available scripts");
    _ = scripts_list_cmd.setAction(scriptsListAction);
    _ = try root.addCommand(scripts_list_cmd);

    // ========================================================================
    // Common Script Shortcuts (npm-style)
    // ========================================================================
    // Add shortcuts for common scripts: dev, test, build
    // Note: 'start' is reserved for service management
    const common_scripts = [_]struct { name: []const u8, desc: []const u8 }{
        .{ .name = "dev", .desc = "Run development script (alias for 'run dev')" },
        .{ .name = "test", .desc = "Run test script (alias for 'run test')" },
        .{ .name = "build", .desc = "Run build script (alias for 'run build')" },
    };

    inline for (common_scripts) |script_info| {
        const ScriptName = struct {
            const name = script_info.name;
        };

        var shortcut_cmd = try cli.BaseCommand.init(allocator, script_info.name, script_info.desc);

        const shortcut_args_arg = cli.Argument.init("args", "Script arguments", .string)
            .withVariadic(true)
            .withRequired(false);
        _ = try shortcut_cmd.addArgument(shortcut_args_arg);

        const ActionStruct = struct {
            fn action(ctx: *cli.BaseCommand.ParseContext) !void {
                const alloc = ctx.allocator;

                // Use a stack-allocated array for script name + args
                var args_buf: [16][]const u8 = undefined;
                var args_len: usize = 0;

                // Add the script name (command name)
                args_buf[args_len] = ScriptName.name;
                args_len += 1;

                // Add any additional arguments
                var i: usize = 0;
                while (true) : (i += 1) {
                    const arg = ctx.getArgument(i) orelse break;
                    if (args_len >= args_buf.len) break; // Prevent overflow
                    args_buf[args_len] = arg;
                    args_len += 1;
                }

                var result = try lib.commands.runScriptCommand(alloc, args_buf[0..args_len]);
                defer result.deinit(alloc);

                if (result.message) |msg| {
                    std.debug.print("{s}\n", .{msg});
                }

                std.process.exit(result.exit_code);
            }
        };

        _ = shortcut_cmd.setAction(ActionStruct.action);
        _ = try root.addCommand(shortcut_cmd);
    }

    // ========================================================================
    // Cache Commands
    // ========================================================================
    var cache_stats_cmd = try cli.BaseCommand.init(allocator, "cache:stats", "Show cache statistics");

    const cache_stats_format_opt = cli.Option.init("format", "format", "Output format", .string)
        .withDefault("table");
    _ = try cache_stats_cmd.addOption(cache_stats_format_opt);

    _ = cache_stats_cmd.setAction(cacheStatsAction);
    _ = try root.addCommand(cache_stats_cmd);

    var cache_clear_cmd = try cli.BaseCommand.init(allocator, "cache:clear", "Clear cache");

    const cache_clear_force_opt = cli.Option.init("force", "force", "Force clearing", .bool)
        .withShort('f');
    _ = try cache_clear_cmd.addOption(cache_clear_force_opt);

    _ = cache_clear_cmd.setAction(cacheClearAction);
    _ = try root.addCommand(cache_clear_cmd);

    // clean command with options for local/global
    var clean_cmd = try cli.BaseCommand.init(allocator, "clean", "Clean local dependencies and env cache (default)");

    const clean_local_opt = cli.Option.init("local", "local", "Clean local project dependencies (pantry_modules)", .bool)
        .withShort('l');
    _ = try clean_cmd.addOption(clean_local_opt);

    const clean_global_opt = cli.Option.init("global", "global", "Clean global dependencies", .bool)
        .withShort('g');
    _ = try clean_cmd.addOption(clean_global_opt);

    const clean_cache_opt = cli.Option.init("cache", "cache", "Clean package cache", .bool)
        .withShort('c');
    _ = try clean_cmd.addOption(clean_cache_opt);

    const clean_all_opt = cli.Option.init("all", "all", "Clean everything (local, global, cache)", .bool)
        .withShort('a');
    _ = try clean_cmd.addOption(clean_all_opt);

    _ = clean_cmd.setAction(cleanAction);
    _ = try root.addCommand(clean_cmd);

    // ========================================================================
    // Environment Commands
    // ========================================================================
    var env_list_cmd = try cli.BaseCommand.init(allocator, "env:list", "List environments");

    const env_list_format_opt = cli.Option.init("format", "format", "Output format", .string)
        .withDefault("table");
    _ = try env_list_cmd.addOption(env_list_format_opt);

    const env_list_verbose_opt = cli.Option.init("verbose", "verbose", "Verbose output", .bool)
        .withShort('v');
    _ = try env_list_cmd.addOption(env_list_verbose_opt);

    _ = env_list_cmd.setAction(envListAction);
    _ = try root.addCommand(env_list_cmd);

    var env_inspect_cmd = try cli.BaseCommand.init(allocator, "env:inspect", "Inspect environment");

    const env_inspect_hash_arg = cli.Argument.init("hash", "Environment hash", .string)
        .withRequired(true);
    _ = try env_inspect_cmd.addArgument(env_inspect_hash_arg);

    const env_inspect_verbose_opt = cli.Option.init("verbose", "verbose", "Verbose output", .bool)
        .withShort('v');
    _ = try env_inspect_cmd.addOption(env_inspect_verbose_opt);

    _ = env_inspect_cmd.setAction(envInspectAction);
    _ = try root.addCommand(env_inspect_cmd);

    var env_clean_cmd = try cli.BaseCommand.init(allocator, "env:clean", "Clean old environments");

    const env_clean_dry_run_opt = cli.Option.init("dry-run", "dry-run", "Dry run", .bool);
    _ = try env_clean_cmd.addOption(env_clean_dry_run_opt);

    const env_clean_force_opt = cli.Option.init("force", "force", "Force removal", .bool)
        .withShort('f');
    _ = try env_clean_cmd.addOption(env_clean_force_opt);

    _ = env_clean_cmd.setAction(envCleanAction);
    _ = try root.addCommand(env_clean_cmd);

    var env_remove_cmd = try cli.BaseCommand.init(allocator, "env:remove", "Remove environment");

    const env_remove_hash_arg = cli.Argument.init("hash", "Environment hash", .string)
        .withRequired(true);
    _ = try env_remove_cmd.addArgument(env_remove_hash_arg);

    const env_remove_force_opt = cli.Option.init("force", "force", "Force removal", .bool)
        .withShort('f');
    _ = try env_remove_cmd.addOption(env_remove_force_opt);

    _ = env_remove_cmd.setAction(envRemoveAction);
    _ = try root.addCommand(env_remove_cmd);

    // ========================================================================
    // Shell Commands
    // ========================================================================
    var shell_integrate_cmd = try cli.BaseCommand.init(allocator, "shell:integrate", "Install shell integration");
    _ = shell_integrate_cmd.setAction(shellIntegrateAction);
    _ = try root.addCommand(shell_integrate_cmd);

    var shell_lookup_cmd = try cli.BaseCommand.init(allocator, "shell:lookup", "Cache lookup (internal)");

    const shell_lookup_dir_arg = cli.Argument.init("dir", "Directory", .string)
        .withRequired(true);
    _ = try shell_lookup_cmd.addArgument(shell_lookup_dir_arg);

    _ = shell_lookup_cmd.setAction(shellLookupAction);
    _ = try root.addCommand(shell_lookup_cmd);

    var shell_activate_cmd = try cli.BaseCommand.init(allocator, "shell:activate", "Activate environment (internal)");

    const shell_activate_dir_arg = cli.Argument.init("dir", "Directory", .string)
        .withRequired(true);
    _ = try shell_activate_cmd.addArgument(shell_activate_dir_arg);

    _ = shell_activate_cmd.setAction(shellActivateAction);
    _ = try root.addCommand(shell_activate_cmd);

    // ========================================================================
    // Dev Commands
    // ========================================================================
    var dev_shellcode_cmd = try cli.BaseCommand.init(allocator, "dev:shellcode", "Generate shell integration code");
    _ = dev_shellcode_cmd.setAction(devShellcodeAction);
    _ = try root.addCommand(dev_shellcode_cmd);

    // ========================================================================
    // Service Commands
    // ========================================================================
    var services_cmd = try cli.BaseCommand.init(allocator, "services", "List available services");
    _ = services_cmd.setAction(servicesAction);
    _ = try root.addCommand(services_cmd);

    var start_cmd = try cli.BaseCommand.init(allocator, "start", "Start a service");

    const start_service_arg = cli.Argument.init("service", "Service name", .string)
        .withRequired(true);
    _ = try start_cmd.addArgument(start_service_arg);

    const start_port_opt = cli.Option.init("port", "port", "Service port", .int)
        .withShort('p');
    _ = try start_cmd.addOption(start_port_opt);

    _ = start_cmd.setAction(startAction);
    _ = try root.addCommand(start_cmd);

    var stop_cmd = try cli.BaseCommand.init(allocator, "stop", "Stop a service");

    const stop_service_arg = cli.Argument.init("service", "Service name", .string)
        .withRequired(true);
    _ = try stop_cmd.addArgument(stop_service_arg);

    _ = stop_cmd.setAction(stopAction);
    _ = try root.addCommand(stop_cmd);

    var restart_cmd = try cli.BaseCommand.init(allocator, "restart", "Restart a service");

    const restart_service_arg = cli.Argument.init("service", "Service name", .string)
        .withRequired(true);
    _ = try restart_cmd.addArgument(restart_service_arg);

    _ = restart_cmd.setAction(restartAction);
    _ = try root.addCommand(restart_cmd);

    var status_cmd = try cli.BaseCommand.init(allocator, "status", "Check service status");

    const status_service_arg = cli.Argument.init("service", "Service name", .string)
        .withRequired(true);
    _ = try status_cmd.addArgument(status_service_arg);

    _ = status_cmd.setAction(statusAction);
    _ = try root.addCommand(status_cmd);

    // Parse arguments
    const args = try std.process.argsAlloc(allocator);
    defer std.process.argsFree(allocator, args);

    var parser = cli.Parser.init(allocator);
    try parser.parse(root, args[1..]);
}
