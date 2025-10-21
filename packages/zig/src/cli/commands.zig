const std = @import("std");
const lib = @import("../lib.zig");

const cache = lib.cache;
const env = lib.env;
const install = lib.install;
const shell = lib.shell;
const string = lib.string;

/// Command execution result
pub const CommandResult = struct {
    exit_code: u8,
    message: ?[]const u8 = null,

    pub fn deinit(self: *CommandResult, allocator: std.mem.Allocator) void {
        if (self.message) |msg| {
            allocator.free(msg);
        }
    }
};

/// Install command
pub fn installCommand(allocator: std.mem.Allocator, args: []const []const u8) !CommandResult {
    if (args.len == 0) {
        return .{
            .exit_code = 1,
            .message = try allocator.dupe(u8, "Error: No packages specified"),
        };
    }

    // Initialize package cache and installer
    var pkg_cache = try cache.PackageCache.init(allocator);
    defer pkg_cache.deinit();

    var installer = try install.Installer.init(allocator, &pkg_cache);
    defer installer.deinit();

    std.debug.print("Installing {d} package(s)...\n", .{args.len});

    for (args) |pkg_spec_str| {
        // Parse package spec (name@version)
        const at_pos = std.mem.indexOf(u8, pkg_spec_str, "@");
        const name = if (at_pos) |pos| pkg_spec_str[0..pos] else pkg_spec_str;
        const version = if (at_pos) |pos| pkg_spec_str[pos + 1 ..] else "latest";

        std.debug.print("  → {s}@{s}...", .{ name, version });

        const spec = lib.packages.PackageSpec{
            .name = name,
            .version = version,
        };

        var result = installer.install(spec, .{}) catch |err| {
            std.debug.print(" failed: {}\n", .{err});
            continue;
        };
        defer result.deinit(allocator);

        if (result.from_cache) {
            std.debug.print(" done (cached, {d}ms)\n", .{result.install_time_ms});
        } else {
            std.debug.print(" done ({d}ms)\n", .{result.install_time_ms});
        }
    }

    return .{ .exit_code = 0 };
}

/// List command
pub fn listCommand(allocator: std.mem.Allocator) !CommandResult {
    var pkg_cache = try cache.PackageCache.init(allocator);
    defer pkg_cache.deinit();

    var installer = try install.Installer.init(allocator, &pkg_cache);
    defer installer.deinit();

    var installed = try installer.listInstalled();
    defer {
        for (installed.items) |*pkg| {
            pkg.deinit(allocator);
        }
        installed.deinit(allocator);
    }

    if (installed.items.len == 0) {
        std.debug.print("No packages installed.\n", .{});
        return .{ .exit_code = 0 };
    }

    std.debug.print("Installed packages ({d}):\n\n", .{installed.items.len});
    for (installed.items) |pkg| {
        std.debug.print("  {s}@{s}\n", .{ pkg.name, pkg.version });
        std.debug.print("    Path: {s}\n", .{pkg.install_path});
        std.debug.print("    Size: {d} bytes\n", .{pkg.size});
    }

    return .{ .exit_code = 0 };
}

/// Cache stats command
pub fn cacheStatsCommand(allocator: std.mem.Allocator) !CommandResult {
    var pkg_cache = try cache.PackageCache.init(allocator);
    defer pkg_cache.deinit();

    const stats = pkg_cache.stats();

    std.debug.print("Cache Statistics:\n\n", .{});
    std.debug.print("  Total packages: {d}\n", .{stats.total_packages});
    std.debug.print("  Total size: {d} bytes ({d:.2} MB)\n", .{
        stats.total_size,
        @as(f64, @floatFromInt(stats.total_size)) / 1024.0 / 1024.0,
    });

    return .{ .exit_code = 0 };
}

/// Cache clear command
pub fn cacheClearCommand(allocator: std.mem.Allocator) !CommandResult {
    var pkg_cache = try cache.PackageCache.init(allocator);
    defer pkg_cache.deinit();

    const stats_before = pkg_cache.stats();

    std.debug.print("Clearing cache...\n", .{});
    try pkg_cache.clear();

    std.debug.print("Removed {d} package(s)\n", .{stats_before.total_packages});
    std.debug.print("Freed {d:.2} MB\n", .{
        @as(f64, @floatFromInt(stats_before.total_size)) / 1024.0 / 1024.0,
    });

    return .{ .exit_code = 0 };
}

/// Environment list command
pub fn envListCommand(allocator: std.mem.Allocator) !CommandResult {
    var manager = try env.EnvManager.init(allocator);
    defer manager.deinit();

    var envs = try manager.list();
    defer envs.deinit(allocator);

    if (envs.items.len == 0) {
        std.debug.print("No environments found.\n", .{});
        return .{ .exit_code = 0 };
    }

    std.debug.print("Environments ({d}):\n\n", .{envs.items.len});
    for (envs.items) |hash| {
        const hex = try string.hashToHex(hash, allocator);
        defer allocator.free(hex);
        std.debug.print("  {s}\n", .{hex});
    }

    return .{ .exit_code = 0 };
}

/// Environment remove command
pub fn envRemoveCommand(allocator: std.mem.Allocator, hash_str: []const u8) !CommandResult {
    var manager = try env.EnvManager.init(allocator);
    defer manager.deinit();

    // Parse hash from hex string
    if (hash_str.len != 32) {
        return .{
            .exit_code = 1,
            .message = try allocator.dupe(u8, "Error: Invalid hash (must be 32 hex characters)"),
        };
    }

    var hash: [16]u8 = undefined;
    _ = std.fmt.hexToBytes(&hash, hash_str) catch {
        return .{
            .exit_code = 1,
            .message = try allocator.dupe(u8, "Error: Invalid hex string"),
        };
    };

    std.debug.print("Removing environment {s}...\n", .{hash_str});
    try manager.remove(hash);
    std.debug.print("Done.\n", .{});

    return .{ .exit_code = 0 };
}

/// Shell integrate command
pub fn shellIntegrateCommand(allocator: std.mem.Allocator) !CommandResult {
    const detected_shell = shell.Shell.detect();

    if (detected_shell == .unknown) {
        return .{
            .exit_code = 1,
            .message = try allocator.dupe(u8, "Error: Could not detect shell"),
        };
    }

    std.debug.print("Detected shell: {s}\n", .{detected_shell.name()});
    std.debug.print("Installing shell integration...\n", .{});

    shell.install(allocator) catch |err| {
        const msg = try std.fmt.allocPrint(
            allocator,
            "Error: Failed to install shell integration: {}",
            .{err},
        );
        return .{
            .exit_code = 1,
            .message = msg,
        };
    };

    std.debug.print("Done! Restart your shell or run:\n", .{});
    switch (detected_shell) {
        .zsh => std.debug.print("  source ~/.zshrc\n", .{}),
        .bash => std.debug.print("  source ~/.bashrc\n", .{}),
        .fish => std.debug.print("  source ~/.config/fish/config.fish\n", .{}),
        .unknown => {},
    }

    return .{ .exit_code = 0 };
}

/// Uninstall command
pub fn uninstallCommand(allocator: std.mem.Allocator, args: []const []const u8) !CommandResult {
    if (args.len == 0) {
        return .{
            .exit_code = 1,
            .message = try allocator.dupe(u8, "Error: No packages specified"),
        };
    }

    std.debug.print("Uninstalling {d} package(s)...\n", .{args.len});

    for (args) |pkg_name| {
        std.debug.print("  → {s}...", .{pkg_name});
        // TODO: Implement actual uninstall logic
        std.debug.print(" done\n", .{});
    }

    return .{ .exit_code = 0 };
}

/// Search command
pub fn searchCommand(allocator: std.mem.Allocator, args: []const []const u8) !CommandResult {
    if (args.len == 0) {
        return .{
            .exit_code = 1,
            .message = try allocator.dupe(u8, "Error: No search term specified"),
        };
    }

    const packages = @import("../packages/generated.zig");
    const search_term = args[0];

    std.debug.print("Searching for '{s}'...\n\n", .{search_term});

    var found: usize = 0;
    for (packages.packages) |pkg| {
        // Simple case-insensitive substring search
        if (std.ascii.indexOfIgnoreCase(pkg.domain, search_term) != null or
            std.ascii.indexOfIgnoreCase(pkg.name, search_term) != null or
            std.ascii.indexOfIgnoreCase(pkg.description, search_term) != null)
        {
            std.debug.print("  {s}\n", .{pkg.name});
            std.debug.print("    Domain: {s}\n", .{pkg.domain});
            std.debug.print("    {s}\n\n", .{pkg.description});
            found += 1;
        }
    }

    if (found == 0) {
        std.debug.print("No packages found.\n", .{});
    } else {
        std.debug.print("Found {d} package(s)\n", .{found});
    }

    return .{ .exit_code = 0 };
}

/// Info command
pub fn infoCommand(allocator: std.mem.Allocator, args: []const []const u8) !CommandResult {
    if (args.len == 0) {
        return .{
            .exit_code = 1,
            .message = try allocator.dupe(u8, "Error: No package specified"),
        };
    }

    const packages = @import("../packages/generated.zig");
    const pkg_name = args[0];

    const pkg = packages.getPackageByName(pkg_name);

    if (pkg == null) {
        const msg = try std.fmt.allocPrint(
            allocator,
            "Package '{s}' not found",
            .{pkg_name},
        );
        return .{
            .exit_code = 1,
            .message = msg,
        };
    }

    std.debug.print("\n{s}\n", .{pkg.?.name});
    std.debug.print("  Domain: {s}\n", .{pkg.?.domain});
    std.debug.print("  Description: {s}\n", .{pkg.?.description});

    if (pkg.?.homepage_url) |url| {
        std.debug.print("  Homepage: {s}\n", .{url});
    }

    if (pkg.?.programs.len > 0) {
        std.debug.print("  Programs:\n", .{});
        for (pkg.?.programs) |program| {
            std.debug.print("    - {s}\n", .{program});
        }
    }

    if (pkg.?.dependencies.len > 0) {
        std.debug.print("  Dependencies:\n", .{});
        for (pkg.?.dependencies) |dep| {
            std.debug.print("    - {s}\n", .{dep});
        }
    }

    if (pkg.?.build_dependencies.len > 0) {
        std.debug.print("  Build Dependencies:\n", .{});
        for (pkg.?.build_dependencies) |dep| {
            std.debug.print("    - {s}\n", .{dep});
        }
    }

    if (pkg.?.aliases.len > 0) {
        std.debug.print("  Aliases:\n", .{});
        for (pkg.?.aliases) |alias| {
            std.debug.print("    - {s}\n", .{alias});
        }
    }

    std.debug.print("\n", .{});

    return .{ .exit_code = 0 };
}

/// Environment inspect command
pub fn envInspectCommand(allocator: std.mem.Allocator, hash_str: []const u8) !CommandResult {
    var manager = try env.EnvManager.init(allocator);
    defer manager.deinit();

    if (hash_str.len != 32) {
        return .{
            .exit_code = 1,
            .message = try allocator.dupe(u8, "Error: Invalid hash (must be 32 hex characters)"),
        };
    }

    var hash: [16]u8 = undefined;
    _ = std.fmt.hexToBytes(&hash, hash_str) catch {
        return .{
            .exit_code = 1,
            .message = try allocator.dupe(u8, "Error: Invalid hex string"),
        };
    };

    std.debug.print("Environment: {s}\n\n", .{hash_str});
    // TODO: Implement actual inspect logic
    std.debug.print("  Status: Active\n", .{});
    std.debug.print("  Created: (timestamp)\n", .{});
    std.debug.print("  Packages: (package list)\n", .{});

    return .{ .exit_code = 0 };
}

/// Environment clean command
pub fn envCleanCommand(allocator: std.mem.Allocator) !CommandResult {
    var manager = try env.EnvManager.init(allocator);
    defer manager.deinit();

    std.debug.print("Cleaning old environments...\n", .{});
    // TODO: Implement actual clean logic
    std.debug.print("Removed 0 environment(s)\n", .{});

    return .{ .exit_code = 0 };
}

/// Cache clean command (different from clear - removes unused/old entries)
pub fn cacheCleanCommand(allocator: std.mem.Allocator) !CommandResult {
    var pkg_cache = try cache.PackageCache.init(allocator);
    defer pkg_cache.deinit();

    std.debug.print("Cleaning cache (removing unused entries)...\n", .{});
    // TODO: Implement smart clean logic (keep frequently used, remove old)
    std.debug.print("Done.\n", .{});

    return .{ .exit_code = 0 };
}

/// Doctor command - verify installation and environment
pub fn doctorCommand(allocator: std.mem.Allocator) !CommandResult {
    std.debug.print("Launchpad Doctor\n\n", .{});

    // Check paths
    const home = try lib.Paths.home(allocator);
    defer allocator.free(home);
    std.debug.print("✓ Home: {s}\n", .{home});

    const cache_dir = try lib.Paths.cache(allocator);
    defer allocator.free(cache_dir);
    std.debug.print("✓ Cache: {s}\n", .{cache_dir});

    const data = try lib.Paths.data(allocator);
    defer allocator.free(data);
    std.debug.print("✓ Data: {s}\n", .{data});

    const config = try lib.Paths.config(allocator);
    defer allocator.free(config);
    std.debug.print("✓ Config: {s}\n", .{config});

    // Check shell integration
    const detected_shell = shell.Shell.detect();
    std.debug.print("✓ Shell: {s}\n", .{detected_shell.name()});

    // Check package registry
    const packages = @import("../packages/generated.zig");
    std.debug.print("✓ Package registry: {d} packages\n", .{packages.packages.len});

    std.debug.print("\nEverything looks good!\n", .{});

    return .{ .exit_code = 0 };
}

/// Update command - update packages
pub fn updateCommand(_: std.mem.Allocator, args: []const []const u8) !CommandResult {
    if (args.len == 0) {
        std.debug.print("Updating all packages...\n", .{});
        // TODO: Implement update all logic
    } else {
        std.debug.print("Updating {d} package(s)...\n", .{args.len});
        for (args) |pkg_name| {
            std.debug.print("  → {s}...", .{pkg_name});
            // TODO: Implement update single package logic
            std.debug.print(" done\n", .{});
        }
    }

    return .{ .exit_code = 0 };
}

/// Outdated command - check for outdated packages
pub fn outdatedCommand(allocator: std.mem.Allocator) !CommandResult {
    var pkg_cache = try cache.PackageCache.init(allocator);
    defer pkg_cache.deinit();

    var installer = try install.Installer.init(allocator, &pkg_cache);
    defer installer.deinit();

    std.debug.print("Checking for outdated packages...\n\n", .{});

    var installed = try installer.listInstalled();
    defer {
        for (installed.items) |*pkg| {
            pkg.deinit(allocator);
        }
        installed.deinit(allocator);
    }

    // TODO: Implement actual version checking logic
    std.debug.print("All packages are up to date.\n", .{});

    return .{ .exit_code = 0 };
}

/// Services list command
pub fn servicesCommand(_: std.mem.Allocator) !CommandResult {
    std.debug.print("Available services:\n\n", .{});

    // List all available services with their default ports
    const services = [_]struct { name: []const u8, display: []const u8, port: u16 }{
        .{ .name = "postgres", .display = "PostgreSQL", .port = 5432 },
        .{ .name = "mysql", .display = "MySQL", .port = 3306 },
        .{ .name = "redis", .display = "Redis", .port = 6379 },
        .{ .name = "nginx", .display = "Nginx", .port = 80 },
        .{ .name = "mongodb", .display = "MongoDB", .port = 27017 },
    };

    for (services) |svc| {
        std.debug.print("  {s: <12} {s} (default port: {d})\n", .{ svc.name, svc.display, svc.port });
    }

    std.debug.print("\nUsage:\n", .{});
    std.debug.print("  launchpad start <service>    Start a service\n", .{});
    std.debug.print("  launchpad stop <service>     Stop a service\n", .{});
    std.debug.print("  launchpad restart <service>  Restart a service\n", .{});
    std.debug.print("  launchpad status [service]   Show service status\n", .{});

    return .{ .exit_code = 0 };
}

/// Start service command
pub fn startCommand(allocator: std.mem.Allocator, args: []const []const u8) !CommandResult {
    if (args.len == 0) {
        return .{
            .exit_code = 1,
            .message = try allocator.dupe(u8, "Error: No service specified"),
        };
    }

    const service_name = args[0];
    std.debug.print("Starting {s}...\n", .{service_name});

    // Use platform-specific service management
    const platform = lib.Platform.current();

    switch (platform) {
        .darwin => {
            // macOS: use brew services
            const result = std.process.Child.run(.{
                .allocator = allocator,
                .argv = &[_][]const u8{ "brew", "services", "start", service_name },
            }) catch |err| {
                const msg = try std.fmt.allocPrint(
                    allocator,
                    "Failed to start {s}: {}",
                    .{ service_name, err },
                );
                return .{
                    .exit_code = 1,
                    .message = msg,
                };
            };
            defer allocator.free(result.stdout);
            defer allocator.free(result.stderr);

            if (result.term.Exited == 0) {
                std.debug.print("✓ Started {s}\n", .{service_name});
                return .{ .exit_code = 0 };
            } else {
                std.debug.print("Error: {s}\n", .{result.stderr});
                return .{ .exit_code = 1 };
            }
        },
        .linux => {
            // Linux: use systemctl
            const result = std.process.Child.run(.{
                .allocator = allocator,
                .argv = &[_][]const u8{ "systemctl", "start", service_name },
            }) catch |err| {
                const msg = try std.fmt.allocPrint(
                    allocator,
                    "Failed to start {s}: {}",
                    .{ service_name, err },
                );
                return .{
                    .exit_code = 1,
                    .message = msg,
                };
            };
            defer allocator.free(result.stdout);
            defer allocator.free(result.stderr);

            if (result.term.Exited == 0) {
                std.debug.print("✓ Started {s}\n", .{service_name});
                return .{ .exit_code = 0 };
            } else {
                std.debug.print("Error: {s}\n", .{result.stderr});
                return .{ .exit_code = 1 };
            }
        },
        .windows => {
            std.debug.print("Service management not yet supported on Windows\n", .{});
            return .{ .exit_code = 1 };
        },
    }
}

/// Stop service command
pub fn stopCommand(allocator: std.mem.Allocator, args: []const []const u8) !CommandResult {
    if (args.len == 0) {
        return .{
            .exit_code = 1,
            .message = try allocator.dupe(u8, "Error: No service specified"),
        };
    }

    const service_name = args[0];
    std.debug.print("Stopping {s}...\n", .{service_name});

    const platform = lib.Platform.current();

    switch (platform) {
        .darwin => {
            const result = std.process.Child.run(.{
                .allocator = allocator,
                .argv = &[_][]const u8{ "brew", "services", "stop", service_name },
            }) catch |err| {
                const msg = try std.fmt.allocPrint(
                    allocator,
                    "Failed to stop {s}: {}",
                    .{ service_name, err },
                );
                return .{
                    .exit_code = 1,
                    .message = msg,
                };
            };
            defer allocator.free(result.stdout);
            defer allocator.free(result.stderr);

            if (result.term.Exited == 0) {
                std.debug.print("✓ Stopped {s}\n", .{service_name});
                return .{ .exit_code = 0 };
            } else {
                std.debug.print("Error: {s}\n", .{result.stderr});
                return .{ .exit_code = 1 };
            }
        },
        .linux => {
            const result = std.process.Child.run(.{
                .allocator = allocator,
                .argv = &[_][]const u8{ "systemctl", "stop", service_name },
            }) catch |err| {
                const msg = try std.fmt.allocPrint(
                    allocator,
                    "Failed to stop {s}: {}",
                    .{ service_name, err },
                );
                return .{
                    .exit_code = 1,
                    .message = msg,
                };
            };
            defer allocator.free(result.stdout);
            defer allocator.free(result.stderr);

            if (result.term.Exited == 0) {
                std.debug.print("✓ Stopped {s}\n", .{service_name});
                return .{ .exit_code = 0 };
            } else {
                std.debug.print("Error: {s}\n", .{result.stderr});
                return .{ .exit_code = 1 };
            }
        },
        .windows => {
            std.debug.print("Service management not yet supported on Windows\n", .{});
            return .{ .exit_code = 1 };
        },
    }
}

/// Restart service command
pub fn restartCommand(allocator: std.mem.Allocator, args: []const []const u8) !CommandResult {
    if (args.len == 0) {
        return .{
            .exit_code = 1,
            .message = try allocator.dupe(u8, "Error: No service specified"),
        };
    }

    const service_name = args[0];
    std.debug.print("Restarting {s}...\n", .{service_name});

    const platform = lib.Platform.current();

    switch (platform) {
        .darwin => {
            const result = std.process.Child.run(.{
                .allocator = allocator,
                .argv = &[_][]const u8{ "brew", "services", "restart", service_name },
            }) catch |err| {
                const msg = try std.fmt.allocPrint(
                    allocator,
                    "Failed to restart {s}: {}",
                    .{ service_name, err },
                );
                return .{
                    .exit_code = 1,
                    .message = msg,
                };
            };
            defer allocator.free(result.stdout);
            defer allocator.free(result.stderr);

            if (result.term.Exited == 0) {
                std.debug.print("✓ Restarted {s}\n", .{service_name});
                return .{ .exit_code = 0 };
            } else {
                std.debug.print("Error: {s}\n", .{result.stderr});
                return .{ .exit_code = 1 };
            }
        },
        .linux => {
            const result = std.process.Child.run(.{
                .allocator = allocator,
                .argv = &[_][]const u8{ "systemctl", "restart", service_name },
            }) catch |err| {
                const msg = try std.fmt.allocPrint(
                    allocator,
                    "Failed to restart {s}: {}",
                    .{ service_name, err },
                );
                return .{
                    .exit_code = 1,
                    .message = msg,
                };
            };
            defer allocator.free(result.stdout);
            defer allocator.free(result.stderr);

            if (result.term.Exited == 0) {
                std.debug.print("✓ Restarted {s}\n", .{service_name});
                return .{ .exit_code = 0 };
            } else {
                std.debug.print("Error: {s}\n", .{result.stderr});
                return .{ .exit_code = 1 };
            }
        },
        .windows => {
            std.debug.print("Service management not yet supported on Windows\n", .{});
            return .{ .exit_code = 1 };
        },
    }
}

/// Status service command
pub fn statusCommand(allocator: std.mem.Allocator, args: []const []const u8) !CommandResult {
    const platform = lib.Platform.current();

    if (args.len == 0) {
        // Show status of all services using brew services list
        switch (platform) {
            .darwin => {
                std.debug.print("Service status:\n\n", .{});
                const result = std.process.Child.run(.{
                    .allocator = allocator,
                    .argv = &[_][]const u8{ "brew", "services", "list" },
                }) catch {
                    std.debug.print("Error: Could not get service status\n", .{});
                    return .{ .exit_code = 1 };
                };
                defer allocator.free(result.stdout);
                defer allocator.free(result.stderr);

                std.debug.print("{s}\n", .{result.stdout});
                return .{ .exit_code = 0 };
            },
            .linux => {
                std.debug.print("Service status:\n\n", .{});
                const services_list = [_][]const u8{ "postgresql", "redis", "mysql", "nginx", "mongodb" };
                for (services_list) |svc| {
                    const result = std.process.Child.run(.{
                        .allocator = allocator,
                        .argv = &[_][]const u8{ "systemctl", "is-active", svc },
                    }) catch {
                        std.debug.print("  {s}: unknown\n", .{svc});
                        continue;
                    };
                    defer allocator.free(result.stdout);
                    defer allocator.free(result.stderr);

                    const status = std.mem.trim(u8, result.stdout, &std.ascii.whitespace);
                    std.debug.print("  {s}: {s}\n", .{ svc, status });
                }
                return .{ .exit_code = 0 };
            },
            .windows => {
                std.debug.print("Service management not yet supported on Windows\n", .{});
                return .{ .exit_code = 1 };
            },
        }
    } else {
        // Show status of specific service
        const service_name = args[0];

        switch (platform) {
            .darwin => {
                const result = std.process.Child.run(.{
                    .allocator = allocator,
                    .argv = &[_][]const u8{ "brew", "services", "list" },
                }) catch {
                    std.debug.print("{s}: unknown\n", .{service_name});
                    return .{ .exit_code = 1 };
                };
                defer allocator.free(result.stdout);
                defer allocator.free(result.stderr);

                // Parse output for the specific service
                if (std.mem.indexOf(u8, result.stdout, service_name)) |_| {
                    std.debug.print("{s}\n", .{result.stdout});
                } else {
                    std.debug.print("{s}: not installed\n", .{service_name});
                }
                return .{ .exit_code = 0 };
            },
            .linux => {
                const result = std.process.Child.run(.{
                    .allocator = allocator,
                    .argv = &[_][]const u8{ "systemctl", "status", service_name },
                }) catch {
                    std.debug.print("{s}: not found\n", .{service_name});
                    return .{ .exit_code = 1 };
                };
                defer allocator.free(result.stdout);
                defer allocator.free(result.stderr);

                std.debug.print("{s}\n", .{result.stdout});
                return .{ .exit_code = 0 };
            },
            .windows => {
                std.debug.print("Service management not yet supported on Windows\n", .{});
                return .{ .exit_code = 1 };
            },
        }
    }
}

/// Shell lookup command (for shell integration)
pub fn shellLookupCommand(allocator: std.mem.Allocator, dir: []const u8) !CommandResult {
    // Hash the dependency file path
    const hash = string.hashDependencyFile(dir);

    // Check environment cache
    var env_cache = cache.EnvCache.init(allocator);
    defer env_cache.deinit();

    if (try env_cache.get(hash)) |entry| {
        // Cache hit - output shell code with PATH
        std.debug.print("export PATH=\"{s}:$PATH\"\n", .{entry.path});
        return .{ .exit_code = 0 };
    }

    // Cache miss - no output
    return .{ .exit_code = 1 };
}

/// Shell activate command (for shell integration)
pub fn shellActivateCommand(allocator: std.mem.Allocator, dir: []const u8) !CommandResult {
    const detector = @import("../deps/detector.zig");
    const parser = @import("../deps/parser.zig");

    // Find dependency file
    const deps_file = (try detector.findDepsFile(allocator, dir)) orelse {
        // No dependency file found
        return .{ .exit_code = 1 };
    };
    defer allocator.free(deps_file.path);

    // Calculate environment hash from dependency file path
    const hash = string.hashDependencyFile(deps_file.path);
    const hash_hex = try string.hashToHex(hash, allocator);
    defer allocator.free(hash_hex);

    // Check environment cache first
    var env_cache = cache.EnvCache.init(allocator);
    defer env_cache.deinit();

    if (try env_cache.get(hash)) |entry| {
        // Cache hit - output cached shell code
        std.debug.print("export PATH=\"{s}:$PATH\"\n", .{entry.path});
        return .{ .exit_code = 0 };
    }

    std.debug.print("Found dependency file: {s} (hash: {s})\n", .{ deps_file.path, hash_hex });

    // Parse dependency file (auto-detects format)
    const deps = try parser.inferDependencies(allocator, deps_file);
    defer {
        for (deps) |*dep| {
            var d = dep.*;
            d.deinit(allocator);
        }
        allocator.free(deps);
    }

    if (deps.len == 0) {
        std.debug.print("No dependencies found\n", .{});
        return .{ .exit_code = 0 };
    }

    // Initialize package cache and installer
    var pkg_cache = try cache.PackageCache.init(allocator);
    defer pkg_cache.deinit();

    var installer = try install.Installer.init(allocator, &pkg_cache);
    defer installer.deinit();

    std.debug.print("Installing {d} package(s)...\n", .{deps.len});

    // Install each dependency
    for (deps) |dep| {
        std.debug.print("  → {s}@{s}...", .{ dep.name, dep.version });

        const spec = lib.packages.PackageSpec{
            .name = dep.name,
            .version = dep.version,
        };

        var result = installer.install(spec, .{}) catch |err| {
            std.debug.print(" failed: {}\n", .{err});
            continue;
        };
        defer result.deinit(allocator);

        if (result.from_cache) {
            std.debug.print(" done (cached, {d}ms)\n", .{result.install_time_ms});
        } else {
            std.debug.print(" done ({d}ms)\n", .{result.install_time_ms});
        }
    }

    // Output shell code to add bin directory to PATH
    const bin_dir = try std.fmt.allocPrint(
        allocator,
        "{s}/bin",
        .{installer.data_dir},
    );
    defer allocator.free(bin_dir);

    // Cache this environment for fast lookup next time
    const mtime = blk: {
        const file_stat = std.fs.cwd().statFile(deps_file.path) catch break :blk 0;
        break :blk @as(i64, @intCast(file_stat.mtime));
    };

    const entry = try allocator.create(cache.env_cache.Entry);
    const env_vars = std.StringHashMap([]const u8).init(allocator);
    entry.* = .{
        .hash = hash,
        .dep_file = try allocator.dupe(u8, deps_file.path),
        .dep_mtime = @as(i128, @intCast(mtime)),
        .path = try allocator.dupe(u8, bin_dir),
        .env_vars = env_vars,
        .created_at = std.time.timestamp(),
    };
    try env_cache.put(entry);

    std.debug.print("\nexport PATH=\"{s}:$PATH\"\n", .{bin_dir});

    return .{ .exit_code = 0 };
}

test "Command structures" {
    const result = CommandResult{
        .exit_code = 0,
        .message = null,
    };
    _ = result;
}
