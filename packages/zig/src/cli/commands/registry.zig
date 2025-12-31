//! Package Registry Commands
//!
//! Commands for discovering and querying packages in the registry:
//! - search: Find packages by keyword
//! - info: Show detailed package information
//! - list: List installed packages

const std = @import("std");
const lib = @import("../../lib.zig");
const common = @import("common.zig");

const CommandResult = common.CommandResult;
const cache = lib.cache;
const install = lib.install;

/// Search for packages in the registry
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

/// Show detailed information about a package
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

/// List all installed packages
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

/// Display the currently authenticated user
pub fn whoamiCommand(allocator: std.mem.Allocator, _: []const []const u8) !CommandResult {
    // Try to get user from Pantry config
    const home = std.process.getEnvVarOwned(allocator, "HOME") catch {
        return CommandResult.err(allocator, "Error: Could not determine home directory");
    };
    defer allocator.free(home);

    const pantryrc_path = try std.fs.path.join(allocator, &[_][]const u8{ home, ".pantryrc" });
    defer allocator.free(pantryrc_path);

    var username: ?[]const u8 = null;
    defer if (username) |u| allocator.free(u);

    // Try to read .pantryrc to find username
    const file = std.fs.openFileAbsolute(pantryrc_path, .{}) catch |err| {
        if (err == error.FileNotFound) {
            std.debug.print("Not logged in (no .pantryrc found)\n", .{});
            std.debug.print("\nTo authenticate:\n", .{});
            std.debug.print("  1. Get an authentication token from the Pantry registry\n", .{});
            std.debug.print("  2. Add it to ~/.pantryrc as: //registry.pantry.dev/:_authToken=YOUR_TOKEN\n", .{});
            std.debug.print("\nOr use OIDC for tokenless publishing from CI/CD:\n", .{});
            std.debug.print("  pantry publisher add --help\n", .{});
            return .{ .exit_code = 1 };
        }
        return err;
    };
    defer file.close();

    const content = try std.Io.Dir.cwd().readFileAlloc(pantryrc_path, allocator, std.Io.Limit.limited(1024 * 1024));
    defer allocator.free(content);

    // Parse .pantryrc for username or email
    var lines = std.mem.splitScalar(u8, content, '\n');
    var found_auth = false;
    while (lines.next()) |line| {
        const trimmed = std.mem.trim(u8, line, " \t\r");
        if (trimmed.len == 0 or trimmed[0] == '#') continue;

        // Look for username or email
        if (std.mem.indexOf(u8, trimmed, "username=")) |idx| {
            const value_start = idx + "username=".len;
            username = try allocator.dupe(u8, std.mem.trim(u8, trimmed[value_start..], " \t\"'"));
            break;
        } else if (std.mem.indexOf(u8, trimmed, "email=")) |idx| {
            const value_start = idx + "email=".len;
            username = try allocator.dupe(u8, std.mem.trim(u8, trimmed[value_start..], " \t\"'"));
            break;
        } else if (std.mem.indexOf(u8, trimmed, "_authToken=")) |_| {
            found_auth = true;
        }
    }

    if (username) |u| {
        std.debug.print("{s}\n", .{u});
        return .{ .exit_code = 0 };
    } else if (found_auth) {
        std.debug.print("Authenticated (token found in .pantryrc)\n", .{});
        std.debug.print("Note: Username not configured. Add 'username=YOUR_USERNAME' to ~/.pantryrc\n", .{});
        return .{ .exit_code = 0 };
    } else {
        std.debug.print("Not logged in\n", .{});
        std.debug.print("\nTo authenticate:\n", .{});
        std.debug.print("  1. Get an authentication token from the Pantry registry\n", .{});
        std.debug.print("  2. Add it to ~/.pantryrc as: //registry.pantry.dev/:_authToken=YOUR_TOKEN\n", .{});
        std.debug.print("  3. Optionally add: username=YOUR_USERNAME\n", .{});
        std.debug.print("\nOr use OIDC for tokenless publishing from CI/CD:\n", .{});
        std.debug.print("  pantry publisher add --help\n", .{});
        return .{ .exit_code = 1 };
    }
}
