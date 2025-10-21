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

test "Command structures" {
    const result = CommandResult{
        .exit_code = 0,
        .message = null,
    };
    _ = result;
}
