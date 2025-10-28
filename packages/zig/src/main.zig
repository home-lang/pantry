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
    const force = ctx.hasOption("force");
    const verbose = ctx.hasOption("verbose");

    _ = global;
    _ = force;
    _ = verbose;

    // Call existing install logic
    const result = try lib.commands.installCommand(allocator, packages.items);
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

    const install_force_opt = cli.Option.init("force", "force", "Force installation", .bool)
        .withShort('f');
    _ = try install_cmd.addOption(install_force_opt);

    const install_verbose_opt = cli.Option.init("verbose", "verbose", "Verbose output", .bool)
        .withShort('v');
    _ = try install_cmd.addOption(install_verbose_opt);

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

    // clean alias for cache:clear
    var clean_cmd = try cli.BaseCommand.init(allocator, "clean", "Clear all cache");
    _ = clean_cmd.setAction(cacheClearAction);
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
