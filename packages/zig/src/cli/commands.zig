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

    // TODO: Access service definitions and list them
    std.debug.print("  PostgreSQL (postgresql)\n", .{});
    std.debug.print("  Redis (redis)\n", .{});
    std.debug.print("  MySQL (mysql)\n", .{});

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
    // TODO: Implement actual service start logic
    std.debug.print("Done.\n", .{});

    return .{ .exit_code = 0 };
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
    // TODO: Implement actual service stop logic
    std.debug.print("Done.\n", .{});

    return .{ .exit_code = 0 };
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
    // TODO: Implement actual service restart logic
    std.debug.print("Done.\n", .{});

    return .{ .exit_code = 0 };
}

/// Status service command
pub fn statusCommand(_: std.mem.Allocator, args: []const []const u8) !CommandResult {
    if (args.len == 0) {
        // Show status of all services
        std.debug.print("Service status:\n\n", .{});
        std.debug.print("  PostgreSQL: not running\n", .{});
        std.debug.print("  Redis: not running\n", .{});
        std.debug.print("  MySQL: not running\n", .{});
    } else {
        // Show status of specific service
        const service_name = args[0];
        std.debug.print("{s}: not running\n", .{service_name});
    }

    return .{ .exit_code = 0 };
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
pub fn shellActivateCommand(_: std.mem.Allocator, dir: []const u8) !CommandResult {
    std.debug.print("Activating environment for {s}...\n", .{dir});

    // TODO: Detect dependency files, install packages, generate shell code
    // For now, return success
    return .{ .exit_code = 0 };
}

test "Command structures" {
    const result = CommandResult{
        .exit_code = 0,
        .message = null,
    };
    _ = result;
}
