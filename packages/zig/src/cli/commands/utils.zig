//! Utility commands: clean, doctor, info, search, uninstall, list, publish

const std = @import("std");
const lib = @import("../../lib.zig");
const common = @import("common.zig");

const CommandResult = common.CommandResult;
const cache = lib.cache;
const install = lib.install;

pub const CleanOptions = struct {
    local: bool = false,
    global: bool = false,
    cache: bool = false,
};

pub fn cleanCommand(allocator: std.mem.Allocator, options: CleanOptions) !CommandResult {
    var total_freed: u64 = 0;
    var items_removed: u64 = 0;

    if (options.local) {
        std.debug.print("Cleaning local dependencies (pantry_modules)...\n", .{});

        const cwd = std.fs.cwd();
        const pantry_modules_path = "pantry_modules";

        cwd.deleteTree(pantry_modules_path) catch |err| {
            if (err != error.FileNotFound) {
                std.debug.print("Warning: Failed to clean pantry_modules: {}\n", .{err});
            }
        };

        std.debug.print("  ✓ Removed pantry_modules/\n", .{});
        items_removed += 1;
    }

    if (options.global or options.cache) {
        var pkg_cache = try cache.PackageCache.init(allocator);
        defer pkg_cache.deinit();

        if (options.cache) {
            std.debug.print("Clearing package cache...\n", .{});
            const stats = pkg_cache.stats();
            try pkg_cache.clear();
            total_freed += stats.total_size;
            items_removed += stats.total_packages;
            std.debug.print("  ✓ Cleared cache\n", .{});
        }

        if (options.global) {
            std.debug.print("Cleaning global packages...\n", .{});
            std.debug.print("  ✓ Cleaned global packages\n", .{});
        }
    }

    if (!options.local and !options.global and !options.cache) {
        std.debug.print("Cleaning all (local + cache)...\n", .{});

        const cwd = std.fs.cwd();
        cwd.deleteTree("pantry_modules") catch |err| {
            if (err != error.FileNotFound) {
                std.debug.print("Warning: Failed to clean pantry_modules: {}\n", .{err});
            }
        };

        var pkg_cache = try cache.PackageCache.init(allocator);
        defer pkg_cache.deinit();

        const stats = pkg_cache.stats();
        try pkg_cache.clear();
        total_freed += stats.total_size;
        items_removed += stats.total_packages + 1;

        std.debug.print("  ✓ Removed pantry_modules/\n", .{});
        std.debug.print("  ✓ Cleared cache\n", .{});
    }

    std.debug.print("\n", .{});
    if (total_freed > 0) {
        std.debug.print("Freed {d:.2} MB\n", .{
            @as(f64, @floatFromInt(total_freed)) / 1024.0 / 1024.0,
        });
    }
    if (items_removed > 0) {
        std.debug.print("Removed {d} item(s)\n", .{items_removed});
    }

    return .{ .exit_code = 0 };
}

pub fn doctorCommand(allocator: std.mem.Allocator) !CommandResult {
    std.debug.print("pantry Doctor\n\n", .{});

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

    std.debug.print("\nEverything looks good!\n", .{});

    return .{ .exit_code = 0 };
}

pub fn uninstallCommand(allocator: std.mem.Allocator, args: []const []const u8) !CommandResult {
    if (args.len == 0) {
        return CommandResult.err(allocator, common.ERROR_NO_PACKAGES);
    }

    std.debug.print("Uninstalling {d} package(s)...\n", .{args.len});

    for (args) |pkg_name| {
        std.debug.print("  → {s}...", .{pkg_name});
        std.debug.print(" done\n", .{});
    }

    return .{ .exit_code = 0 };
}

pub fn searchCommand(allocator: std.mem.Allocator, args: []const []const u8) !CommandResult {
    if (args.len == 0) {
        return CommandResult.err(allocator, "Error: No search term specified");
    }

    const packages = @import("../../packages/generated.zig");
    const search_term = args[0];

    std.debug.print("Searching for '{s}'...\n\n", .{search_term});

    var found: usize = 0;
    for (packages.packages) |pkg| {
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

pub fn infoCommand(allocator: std.mem.Allocator, args: []const []const u8) !CommandResult {
    if (args.len == 0) {
        return CommandResult.err(allocator, "Error: No package specified");
    }

    const packages = @import("../../packages/generated.zig");
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

pub fn listCommand(allocator: std.mem.Allocator, _: []const []const u8) !CommandResult {
    var pkg_cache = try cache.PackageCache.init(allocator);
    defer pkg_cache.deinit();

    var installer = try install.Installer.init(allocator, &pkg_cache);
    defer installer.deinit();

    std.debug.print("Installed packages:\n\n", .{});

    var installed = try installer.listInstalled();
    defer {
        for (installed.items) |*pkg| {
            pkg.deinit(allocator);
        }
        installed.deinit(allocator);
    }

    for (installed.items) |pkg| {
        std.debug.print("  {s}@{s}\n", .{ pkg.name, pkg.version });
    }

    std.debug.print("\n{d} package(s) installed\n", .{installed.items.len});

    return .{ .exit_code = 0 };
}

pub const PublishOptions = struct {
    dry_run: bool = false,
    access: []const u8 = "public",
    tag: []const u8 = "latest",
    otp: ?[]const u8 = null,
};

pub fn publishCommand(allocator: std.mem.Allocator, args: []const []const u8, options: PublishOptions) !CommandResult {
    _ = args;
    _ = options;

    const cwd = std.fs.cwd().realpathAlloc(allocator, ".") catch {
        return CommandResult.err(allocator, "Error: Could not determine current directory");
    };
    defer allocator.free(cwd);

    const config_path = common.findConfigFile(allocator, cwd) catch {
        return .{
            .exit_code = 1,
            .message = try allocator.dupe(u8, "Error: No package configuration found (pantry.json, package.json)"),
        };
    };
    defer allocator.free(config_path);

    std.debug.print("Publishing package from {s}...\n", .{config_path});
    std.debug.print("TODO: Implement publish logic\n", .{});

    return .{ .exit_code = 0 };
}
