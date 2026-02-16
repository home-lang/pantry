//! Package Registry Commands
//!
//! Commands for discovering and querying packages in the registry:
//! - search: Find packages by keyword
//! - info: Show detailed package information
//! - list: List installed packages
//! - publish: Publish a package to the Pantry registry

const std = @import("std");
const io_helper = @import("../../io_helper.zig");
const lib = @import("../../lib.zig");
const common = @import("common.zig");
const style = @import("../style.zig");
const http = std.http;

const CommandResult = common.CommandResult;
const cache = lib.cache;
const install = lib.install;
const lifecycle = lib.lifecycle;

/// Default Pantry registry URL
const PANTRY_REGISTRY_URL = "https://registry.stacksjs.org";

/// Search for packages in the registry
pub fn searchCommand(allocator: std.mem.Allocator, args: []const []const u8) !CommandResult {
    if (args.len == 0) {
        return CommandResult.err(allocator, "Error: No search term specified");
    }

    const packages = @import("../../packages/generated.zig");
    const search_term = args[0];

    style.print("Searching for '{s}'...\n\n", .{search_term});

    var found: usize = 0;
    for (packages.packages) |pkg| {
        if (std.ascii.indexOfIgnoreCase(pkg.domain, search_term) != null or
            std.ascii.indexOfIgnoreCase(pkg.name, search_term) != null or
            std.ascii.indexOfIgnoreCase(pkg.description, search_term) != null)
        {
            style.print("  {s}\n", .{pkg.name});
            style.print("    Domain: {s}\n", .{pkg.domain});
            style.print("    {s}\n\n", .{pkg.description});
            found += 1;
        }
    }

    if (found == 0) {
        style.print("No packages found.\n", .{});
    } else {
        style.print("Found {d} package(s)\n", .{found});
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

    style.print("\n{s}\n", .{pkg.?.name});
    style.print("  Domain: {s}\n", .{pkg.?.domain});
    style.print("  Description: {s}\n", .{pkg.?.description});

    if (pkg.?.homepage_url) |url| {
        style.print("  Homepage: {s}\n", .{url});
    }

    if (pkg.?.programs.len > 0) {
        style.print("  Programs:\n", .{});
        for (pkg.?.programs) |program| {
            style.print("    - {s}\n", .{program});
        }
    }

    if (pkg.?.dependencies.len > 0) {
        style.print("  Dependencies:\n", .{});
        for (pkg.?.dependencies) |dep| {
            style.print("    - {s}\n", .{dep});
        }
    }

    if (pkg.?.build_dependencies.len > 0) {
        style.print("  Build Dependencies:\n", .{});
        for (pkg.?.build_dependencies) |dep| {
            style.print("    - {s}\n", .{dep});
        }
    }

    if (pkg.?.aliases.len > 0) {
        style.print("  Aliases:\n", .{});
        for (pkg.?.aliases) |alias| {
            style.print("    - {s}\n", .{alias});
        }
    }

    style.print("\n", .{});

    return .{ .exit_code = 0 };
}

/// List all installed packages
pub fn listCommand(allocator: std.mem.Allocator, _: []const []const u8) !CommandResult {
    var pkg_cache = try cache.PackageCache.init(allocator);
    defer pkg_cache.deinit();

    var installer = try install.Installer.init(allocator, &pkg_cache);
    defer installer.deinit();

    style.print("Installed packages:\n\n", .{});

    var installed = try installer.listInstalled();
    defer {
        for (installed.items) |*pkg| {
            pkg.deinit(allocator);
        }
        installed.deinit(allocator);
    }

    for (installed.items) |pkg| {
        style.print("  {s}@{s}\n", .{ pkg.name, pkg.version });
    }

    style.print("\n{d} package(s) installed\n", .{installed.items.len});

    return .{ .exit_code = 0 };
}

/// Display the currently authenticated user
pub fn whoamiCommand(allocator: std.mem.Allocator, _: []const []const u8) !CommandResult {
    // Try to get user from Pantry config
    const home = io_helper.getEnvVarOwned(allocator, "HOME") catch {
        return CommandResult.err(allocator, "Error: Could not determine home directory");
    };
    defer allocator.free(home);

    const pantryrc_path = try std.fs.path.join(allocator, &[_][]const u8{ home, ".pantryrc" });
    defer allocator.free(pantryrc_path);

    var username: ?[]const u8 = null;
    defer if (username) |u| allocator.free(u);

    // Try to read .pantryrc to find username
    const file = io_helper.openFileAbsolute(pantryrc_path, .{}) catch |err| {
        if (err == error.FileNotFound) {
            style.print("Not logged in (no .pantryrc found)\n", .{});
            style.print("\nTo authenticate:\n", .{});
            style.print("  1. Get an authentication token from the Pantry registry\n", .{});
            style.print("  2. Add it to ~/.pantry/credentials as: PANTRY_TOKEN=your_token\n", .{});
            style.print("\nOr use OIDC for tokenless publishing from CI/CD:\n", .{});
            style.print("  pantry publisher add --help\n", .{});
            return .{ .exit_code = 1 };
        }
        return err;
    };
    defer file.close(io_helper.io);

    const content = try io_helper.readFileAlloc(allocator, pantryrc_path, 1024 * 1024);
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
        style.print("{s}\n", .{u});
        return .{ .exit_code = 0 };
    } else if (found_auth) {
        style.print("Authenticated (token found in .pantryrc)\n", .{});
        style.print("Note: Username not configured. Add 'username=YOUR_USERNAME' to ~/.pantryrc\n", .{});
        return .{ .exit_code = 0 };
    } else {
        style.print("Not logged in\n", .{});
        style.print("\nTo authenticate:\n", .{});
        style.print("  1. Get an authentication token from the Pantry registry\n", .{});
        style.print("  2. Add it to ~/.pantry/credentials as: PANTRY_TOKEN=your_token\n", .{});
        style.print("  3. Optionally add: username=YOUR_USERNAME\n", .{});
        style.print("\nOr use OIDC for tokenless publishing from CI/CD:\n", .{});
        style.print("  pantry publisher add --help\n", .{});
        return .{ .exit_code = 1 };
    }
}

// ============================================================================
// Monorepo Detection
// ============================================================================

pub const MonorepoPackage = struct {
    name: []const u8,
    path: []const u8,
    config_path: []const u8,

    pub fn deinit(self: *MonorepoPackage, allocator: std.mem.Allocator) void {
        allocator.free(self.name);
        allocator.free(self.path);
        allocator.free(self.config_path);
    }
};

/// Detect monorepo packages in the packages/ directory (recursive).
/// Returns null if no packages/ directory exists.
/// Returns a list of non-private packages with their paths.
pub fn detectMonorepoPackages(allocator: std.mem.Allocator, project_root: []const u8) !?[]MonorepoPackage {
    const packages_dir = try std.fs.path.join(allocator, &[_][]const u8{ project_root, "packages" });
    defer allocator.free(packages_dir);

    // Check if packages/ directory exists
    io_helper.accessAbsolute(packages_dir, .{}) catch {
        return null; // No packages/ directory
    };

    var packages = std.ArrayList(MonorepoPackage){};
    errdefer {
        for (packages.items) |*pkg| {
            pkg.deinit(allocator);
        }
        packages.deinit(allocator);
    }

    // Recursively scan packages/ for directories containing package.json
    try scanForPackages(allocator, packages_dir, &packages);

    if (packages.items.len == 0) {
        packages.deinit(allocator);
        return null;
    }

    return try packages.toOwnedSlice(allocator);
}

/// Recursively scan a directory for subdirectories containing package.json.
/// If a directory has package.json, it's treated as a package (not recursed further).
/// If a directory has no package.json, recurse into its subdirectories.
fn scanForPackages(allocator: std.mem.Allocator, dir_path: []const u8, packages: *std.ArrayList(MonorepoPackage)) !void {
    var dir = io_helper.openDirForIteration(dir_path) catch return;
    defer dir.close();

    var iter = dir.iterate();
    while (iter.next() catch null) |entry| {
        if (entry.kind != .directory) continue;

        // Skip common non-package directories
        if (std.mem.eql(u8, entry.name, "node_modules") or
            std.mem.eql(u8, entry.name, ".git") or
            std.mem.eql(u8, entry.name, "dist") or
            std.mem.eql(u8, entry.name, "build") or
            std.mem.eql(u8, entry.name, ".turbo") or
            std.mem.startsWith(u8, entry.name, "."))
        {
            continue;
        }

        const entry_path = try std.fs.path.join(allocator, &[_][]const u8{ dir_path, entry.name });
        errdefer allocator.free(entry_path);

        const config_path = try std.fs.path.join(allocator, &[_][]const u8{ entry_path, "package.json" });

        // Check if this directory has a package.json
        const has_pkg_json = blk: {
            io_helper.accessAbsolute(config_path, .{}) catch {
                break :blk false;
            };
            break :blk true;
        };

        if (has_pkg_json) {
            // This is a package — check if private and add if not
            const content = io_helper.readFileAlloc(allocator, config_path, 10 * 1024 * 1024) catch {
                allocator.free(config_path);
                allocator.free(entry_path);
                continue;
            };
            defer allocator.free(content);

            const parsed = std.json.parseFromSlice(std.json.Value, allocator, content, .{}) catch {
                allocator.free(config_path);
                allocator.free(entry_path);
                continue;
            };
            defer parsed.deinit();

            const root = parsed.value;
            if (root != .object) {
                allocator.free(config_path);
                allocator.free(entry_path);
                continue;
            }

            // Check if private
            const is_private = if (root.object.get("private")) |p|
                if (p == .bool) p.bool else false
            else
                false;

            if (is_private) {
                style.print("  Skipping {s} (private)\n", .{entry.name});
                allocator.free(config_path);
                allocator.free(entry_path);
                continue;
            }

            // Get package name from package.json
            const pkg_name = if (root.object.get("name")) |n|
                if (n == .string) n.string else entry.name
            else
                entry.name;

            try packages.append(allocator, .{
                .name = try allocator.dupe(u8, pkg_name),
                .path = entry_path,
                .config_path = config_path,
            });
        } else {
            // No package.json — recurse into subdirectories
            allocator.free(config_path);
            try scanForPackages(allocator, entry_path, packages);
            allocator.free(entry_path);
        }
    }
}

// ============================================================================
// Registry Publish Command
// ============================================================================

pub const RegistryPublishOptions = struct {
    registry: []const u8 = PANTRY_REGISTRY_URL,
    token: ?[]const u8 = null,
    access: []const u8 = "public",
    tag: []const u8 = "latest",
    dry_run: bool = false,
};

/// Publish a package to the Pantry registry
/// This uploads the tarball directly to S3 via the registry API
/// Auto-detects monorepos (packages/ directory) and publishes all non-private packages.
pub fn registryPublishCommand(allocator: std.mem.Allocator, args: []const []const u8, options: RegistryPublishOptions) !CommandResult {
    _ = args;

    // Get current working directory
    const cwd = io_helper.realpathAlloc(allocator, ".") catch {
        return CommandResult.err(allocator, "Error: Could not determine current directory");
    };
    defer allocator.free(cwd);

    // Check for monorepo (packages/ directory with package.json files)
    const monorepo_packages = detectMonorepoPackages(allocator, cwd) catch null;
    defer if (monorepo_packages) |pkgs| {
        for (pkgs) |*pkg| {
            var p = pkg.*;
            p.deinit(allocator);
        }
        allocator.free(pkgs);
    };

    if (monorepo_packages) |pkgs| {
        // Monorepo mode — publish each non-private package
        style.print("Monorepo detected: {d} publishable package(s) in packages/\n", .{pkgs.len});
        style.print("----------------------------------------\n", .{});

        // Detect root files to propagate to packages that don't have their own
        const root_files = [_][]const u8{ "README.md", "LICENSE", "LICENSE.md" };
        var has_root_file: [root_files.len]bool = undefined;
        var root_file_paths: [root_files.len]?[]const u8 = undefined;
        for (root_files, 0..) |file_name, i| {
            const root_path = std.fs.path.join(allocator, &[_][]const u8{ cwd, file_name }) catch null;
            root_file_paths[i] = root_path;
            has_root_file[i] = if (root_path) |p| blk: {
                io_helper.accessAbsolute(p, .{}) catch break :blk false;
                break :blk true;
            } else false;
        }
        defer for (&root_file_paths) |*p| {
            if (p.*) |path| allocator.free(path);
        };

        var failed: usize = 0;
        var succeeded: usize = 0;

        for (pkgs) |pkg| {
            style.print("\nPublishing {s}...\n", .{pkg.name});

            // Propagate root files (README, LICENSE) to package if missing
            var copied_files: [root_files.len]?[]const u8 = .{null} ** root_files.len;
            for (root_files, 0..) |file_name, i| {
                if (!has_root_file[i]) continue;
                const pkg_file_path = std.fs.path.join(allocator, &[_][]const u8{ pkg.path, file_name }) catch continue;
                // Check if package already has its own copy
                io_helper.accessAbsolute(pkg_file_path, .{}) catch {
                    // Package doesn't have this file — copy from root
                    if (root_file_paths[i]) |root_path| {
                        if (io_helper.copyFile(root_path, pkg_file_path)) {
                            copied_files[i] = pkg_file_path;
                            style.print("  Copied root {s} to {s}\n", .{ file_name, pkg.name });
                        } else |_| {
                            allocator.free(pkg_file_path);
                        }
                    } else {
                        allocator.free(pkg_file_path);
                    }
                    continue;
                };
                // File exists in package — don't overwrite
                allocator.free(pkg_file_path);
            }

            const result = publishSingleToRegistry(allocator, pkg.path, pkg.config_path, options);

            // Cleanup: remove propagated files after publish
            for (&copied_files) |*cf| {
                if (cf.*) |path| {
                    io_helper.deleteFile(path) catch {};
                    allocator.free(path);
                    cf.* = null;
                }
            }

            if (result) |r| {
                if (r.exit_code == 0) {
                    succeeded += 1;
                } else {
                    failed += 1;
                    if (r.message) |msg| style.print("  Error: {s}\n", .{msg});
                }
                var res = r;
                res.deinit(allocator);
            } else |err| {
                failed += 1;
                style.print("  Error: {any}\n", .{err});
            }
            style.print("----------------------------------------\n", .{});
        }

        style.print("\nPublished {d}/{d} packages", .{ succeeded, succeeded + failed });
        if (failed > 0) {
            style.print(" ({d} failed)", .{failed});
        }
        style.print("\n", .{});

        return .{ .exit_code = if (failed > 0) 1 else 0 };
    }

    // Single package mode — publish CWD
    const config_path = common.findConfigFile(allocator, cwd) catch {
        return CommandResult.err(allocator, "Error: No package configuration found (pantry.json, package.json)");
    };
    defer allocator.free(config_path);

    return publishSingleToRegistry(allocator, cwd, config_path, options);
}

/// Publish a single package directory to the Pantry registry.
fn publishSingleToRegistry(
    allocator: std.mem.Allocator,
    package_dir: []const u8,
    config_path: []const u8,
    options: RegistryPublishOptions,
) !CommandResult {
    style.print("Publishing to Pantry registry...\n", .{});
    style.print("Config: {s}\n", .{config_path});

    // Read and parse config
    const config_content = io_helper.readFileAlloc(allocator, config_path, 10 * 1024 * 1024) catch {
        return CommandResult.err(allocator, "Error: Could not read config file");
    };
    defer allocator.free(config_content);

    const parsed = std.json.parseFromSlice(std.json.Value, allocator, config_content, .{}) catch {
        return CommandResult.err(allocator, "Error: Could not parse config file");
    };
    defer parsed.deinit();

    const root = parsed.value;
    if (root != .object) {
        return CommandResult.err(allocator, "Error: Config file is not a valid JSON object");
    }

    // Extract package name and version
    const name = if (root.object.get("name")) |n|
        if (n == .string) n.string else return CommandResult.err(allocator, "Error: Missing or invalid 'name' in config")
    else
        return CommandResult.err(allocator, "Error: Missing 'name' in config");

    const version = if (root.object.get("version")) |v|
        if (v == .string) v.string else return CommandResult.err(allocator, "Error: Missing or invalid 'version' in config")
    else
        return CommandResult.err(allocator, "Error: Missing 'version' in config");

    style.print("Package: {s}@{s}\n", .{ name, version });

    // Display binaries if present
    if (root.object.get("bin")) |bin_value| {
        style.print("Binaries: ", .{});
        if (bin_value == .string) {
            // Single binary with package name
            const pkg_name = if (std.mem.indexOf(u8, name, "/")) |idx| name[idx + 1 ..] else name;
            style.print("{s}\n", .{pkg_name});
        } else if (bin_value == .object) {
            // Multiple binaries
            var first = true;
            var bin_iter = bin_value.object.iterator();
            while (bin_iter.next()) |entry| {
                if (!first) style.print(", ", .{});
                style.print("{s}", .{entry.key_ptr.*});
                first = false;
            }
            style.print("\n", .{});
        }
    }

    style.print("Registry: {s}\n", .{options.registry});

    // Check if we have AWS credentials for direct S3 upload
    const aws_key = io_helper.getenv("AWS_ACCESS_KEY_ID");
    const has_aws_creds = aws_key != null or awsCredentialsFileExists();

    // Get auth token (from options, env, or ~/.pantry/credentials)
    // Token is optional if we have AWS credentials for direct S3 upload
    var token: ?[]const u8 = options.token;
    var token_owned = false;
    if (token == null) {
        token = io_helper.getEnvVarOwned(allocator, "PANTRY_REGISTRY_TOKEN") catch null;
        if (token != null) token_owned = true;
    }
    if (token == null) {
        token = readPantryToken(allocator) catch null;
        if (token != null) token_owned = true;
    }
    defer if (token_owned and token != null) allocator.free(token.?);

    // If no AWS credentials and no token, error out
    if (!has_aws_creds and token == null) {
        return CommandResult.err(
            allocator,
            \\Error: No authentication found.
            \\
            \\For direct S3 upload, configure AWS credentials in ~/.aws/credentials
            \\Or set PANTRY_REGISTRY_TOKEN for HTTP upload to registry server.
            ,
        );
    }

    if (has_aws_creds) {
        style.print("Using direct S3 upload (AWS credentials found)\n", .{});
    }

    // Check if version already exists or is lower than published
    style.print("Checking existing versions...\n", .{});
    const version_check: ?VersionCheckResult = checkExistingVersion(allocator, name, version) catch |err| blk: {
        // If we can't check (e.g., network error), warn but continue
        style.print("  Warning: Could not check existing versions: {any}\n", .{err});
        break :blk null;
    };

    if (version_check) |check| {
        defer allocator.free(check.latest_version);
        if (check.version_exists) {
            const err_msg = try std.fmt.allocPrint(
                allocator,
                "Error: Version {s} already exists in registry.\nBump the version in package.json before publishing.",
                .{version},
            );
            return CommandResult.err(allocator, err_msg);
        }
        if (check.is_lower_version) {
            const err_msg = try std.fmt.allocPrint(
                allocator,
                "Error: Version {s} is lower than the latest published version ({s}).\nVersion must be greater than the latest published version.",
                .{ version, check.latest_version },
            );
            return CommandResult.err(allocator, err_msg);
        }
        style.print("  Latest version: {s}, publishing: {s} ✓\n", .{ check.latest_version, version });
    }

    if (options.dry_run) {
        style.print("\n[DRY RUN] Would publish {s}@{s} to {s}\n", .{ name, version, options.registry });
        return .{ .exit_code = 0 };
    }

    // Run prepublish lifecycle scripts if defined
    // Priority: prepublishOnly > prepublish > build (pantry convenience fallback)
    if (root.object.get("scripts")) |scripts_val| {
        if (scripts_val == .object) {
            const script_info: struct { script: ?[]const u8, name: []const u8 } =
                if (scripts_val.object.get("prepublishOnly")) |s|
                    .{ .script = if (s == .string) s.string else null, .name = "prepublishOnly" }
                else if (scripts_val.object.get("prepublish")) |s|
                    .{ .script = if (s == .string) s.string else null, .name = "prepublish" }
                else if (scripts_val.object.get("build")) |s|
                    .{ .script = if (s == .string) s.string else null, .name = "build" }
                else
                    .{ .script = null, .name = "" };

            if (script_info.script) |script| {
                style.print("Running {s} script...\n", .{script_info.name});
                const result = lifecycle.executeScript(allocator, script_info.name, script, .{
                    .cwd = package_dir,
                }) catch |err| {
                    const err_msg = try std.fmt.allocPrint(allocator, "Error: {s} script failed: {any}", .{ script_info.name, err });
                    return CommandResult.err(allocator, err_msg);
                };
                if (!result.success) {
                    const err_msg = try std.fmt.allocPrint(allocator, "Error: {s} script failed with exit code {d}", .{ script_info.name, result.exit_code });
                    return CommandResult.err(allocator, err_msg);
                }
                style.print("✓ {s} completed\n", .{script_info.name});
            }
        }
    }

    // Create tarball
    style.print("Creating tarball...\n", .{});
    const tarball_path = try createTarball(allocator, package_dir, name, version, config_content);
    defer allocator.free(tarball_path);
    defer io_helper.deleteFile(tarball_path) catch {};

    // Read tarball
    const tarball_data = io_helper.readFileAlloc(allocator, tarball_path, 100 * 1024 * 1024) catch {
        return CommandResult.err(allocator, "Error: Could not read tarball");
    };
    defer allocator.free(tarball_data);

    style.print("Tarball size: {d} bytes\n", .{tarball_data.len});

    // Upload to registry
    style.print("Uploading to registry...\n", .{});

    const result = uploadToRegistry(allocator, options.registry, name, version, tarball_data, token orelse "", config_content) catch |err| {
        const err_msg = try std.fmt.allocPrint(allocator, "Error: Failed to upload to registry: {any}", .{err});
        return CommandResult.err(allocator, err_msg);
    };
    defer allocator.free(result);

    style.print("\n{s}\n", .{result});
    style.print("Published {s}@{s} to Pantry registry\n", .{ name, version });

    return .{ .exit_code = 0 };
}

/// Read PANTRY_TOKEN from ~/.pantry/credentials
fn readPantryToken(allocator: std.mem.Allocator) ![]u8 {
    const home = io_helper.getenv("HOME") orelse return error.EnvironmentVariableNotFound;

    var path_buf: [std.fs.max_path_bytes]u8 = undefined;
    const credentials_path = try std.fmt.bufPrint(&path_buf, "{s}/.pantry/credentials", .{home});

    const content = io_helper.readFileAlloc(allocator, credentials_path, 64 * 1024) catch {
        return error.FileNotFound;
    };
    defer allocator.free(content);

    // Parse key=value pairs
    var lines = std.mem.splitSequence(u8, content, "\n");
    while (lines.next()) |line| {
        const trimmed = std.mem.trim(u8, line, &std.ascii.whitespace);
        if (trimmed.len == 0 or trimmed[0] == '#') continue;

        if (std.mem.indexOfScalar(u8, trimmed, '=')) |eq_pos| {
            const key = std.mem.trim(u8, trimmed[0..eq_pos], &std.ascii.whitespace);
            const value = std.mem.trim(u8, trimmed[eq_pos + 1 ..], &std.ascii.whitespace);

            if (std.mem.eql(u8, key, "PANTRY_TOKEN") or std.mem.eql(u8, key, "PANTRY_REGISTRY_TOKEN")) {
                return try allocator.dupe(u8, value);
            }
        }
    }

    return error.EnvironmentVariableNotFound;
}

/// Create tarball of the current project respecting package.json "files" field
fn createTarball(
    allocator: std.mem.Allocator,
    package_dir: []const u8,
    package_name: []const u8,
    version: []const u8,
    config_content: []const u8,
) ![]const u8 {
    // Sanitize package name for tarball filename
    var sanitized_name = try allocator.alloc(u8, package_name.len);
    defer allocator.free(sanitized_name);
    for (package_name, 0..) |c, i| {
        sanitized_name[i] = if (c == '@' or c == '/') '-' else c;
    }
    const clean_name = if (sanitized_name[0] == '-') sanitized_name[1..] else sanitized_name;

    const tarball_name = try std.fmt.allocPrint(allocator, "{s}-{s}.tgz", .{ clean_name, version });
    defer allocator.free(tarball_name);

    // Create tarball in temp directory
    const tmp_dir = io_helper.getTempDir();
    const tarball_path = try std.fs.path.join(allocator, &[_][]const u8{ tmp_dir, tarball_name });

    // Create staging directory: /tmp/pantry-staging/package/
    const staging_base = try std.fs.path.join(allocator, &[_][]const u8{ tmp_dir, "pantry-staging" });
    defer allocator.free(staging_base);
    const staging_pkg = try std.fs.path.join(allocator, &[_][]const u8{ staging_base, "package" });
    defer allocator.free(staging_pkg);

    // Clean and create staging directory
    io_helper.deleteTree(staging_base) catch {};
    try io_helper.makePath(staging_pkg);

    // Parse package.json to get "files" array and "bin" field
    const parsed = std.json.parseFromSlice(std.json.Value, allocator, config_content, .{}) catch {
        style.print("Warning: Could not parse package.json, using default file inclusion\n", .{});
        return createTarballDefault(allocator, package_dir, staging_pkg, staging_base, tarball_path);
    };
    defer parsed.deinit();
    const root = parsed.value;

    // Check if "files" array exists in package.json
    const files_array = if (root.object.get("files")) |f| switch (f) {
        .array => |arr| arr,
        else => null,
    } else null;

    // Get bin files to include
    var bin_files_list: [16][]const u8 = undefined;
    var bin_files_count: usize = 0;
    if (root.object.get("bin")) |bin_val| {
        switch (bin_val) {
            .string => |s| {
                if (bin_files_count < 16) {
                    bin_files_list[bin_files_count] = s;
                    bin_files_count += 1;
                }
            },
            .object => |obj| {
                for (obj.values()) |v| {
                    if (bin_files_count < 16) {
                        if (v == .string) {
                            bin_files_list[bin_files_count] = v.string;
                            bin_files_count += 1;
                        }
                    }
                }
            },
            else => {},
        }
    }
    const bin_files = bin_files_list[0..bin_files_count];

    if (files_array) |files| {
        // Use explicit "files" list - only copy specified files/folders
        style.print("  Using 'files' field from package.json...\n", .{});

        // Always copy package.json first
        const pkg_json_src = try std.fs.path.join(allocator, &[_][]const u8{ package_dir, "package.json" });
        defer allocator.free(pkg_json_src);
        const pkg_json_dst = try std.fs.path.join(allocator, &[_][]const u8{ staging_pkg, "package.json" });
        defer allocator.free(pkg_json_dst);
        io_helper.copyFile(pkg_json_src, pkg_json_dst) catch {};

        // Copy each file/folder from "files" array
        for (files.items) |item| {
            if (item == .string) {
                const file_entry = item.string;
                const src = try std.fs.path.join(allocator, &[_][]const u8{ package_dir, file_entry });
                defer allocator.free(src);
                const dst = try std.fs.path.join(allocator, &[_][]const u8{ staging_pkg, file_entry });
                defer allocator.free(dst);

                // Create parent directory if needed
                if (std.fs.path.dirname(dst)) |parent| {
                    io_helper.makePath(parent) catch {};
                }

                // Use cp -r to handle both files and directories
                const cp_result = io_helper.childRun(allocator, &[_][]const u8{ "cp", "-r", src, dst }) catch continue;
                allocator.free(cp_result.stdout);
                allocator.free(cp_result.stderr);
            }
        }

        // Also copy bin files if not already included
        for (bin_files) |bin_file| {
            // Strip leading ./ if present
            const clean_bin = if (bin_file.len > 2 and bin_file[0] == '.' and bin_file[1] == '/') bin_file[2..] else bin_file;
            const bin_src = try std.fs.path.join(allocator, &[_][]const u8{ package_dir, clean_bin });
            defer allocator.free(bin_src);
            const bin_dst = try std.fs.path.join(allocator, &[_][]const u8{ staging_pkg, clean_bin });
            defer allocator.free(bin_dst);

            if (std.fs.path.dirname(bin_dst)) |parent| {
                io_helper.makePath(parent) catch {};
            }
            const cp_result = io_helper.childRun(allocator, &[_][]const u8{ "cp", "-r", bin_src, bin_dst }) catch continue;
            allocator.free(cp_result.stdout);
            allocator.free(cp_result.stderr);
        }

        // Always include README*, LICENSE*, CHANGELOG* if they exist
        // Use native directory iteration instead of shell glob to avoid command injection
        const always_include_prefixes = [_][]const u8{ "README", "LICENSE", "CHANGELOG", "readme", "license", "changelog" };
        if (io_helper.openDirAbsoluteForIteration(package_dir)) |dir_val| {
            var dir = dir_val;
            defer dir.close();
            var iter = dir.iterate();
            while (iter.next() catch null) |entry| {
                if (entry.kind != .file) continue;
                for (always_include_prefixes) |prefix| {
                    if (std.mem.startsWith(u8, entry.name, prefix)) {
                        const src = std.fs.path.join(allocator, &[_][]const u8{ package_dir, entry.name }) catch continue;
                        defer allocator.free(src);
                        const dst = std.fs.path.join(allocator, &[_][]const u8{ staging_pkg, entry.name }) catch continue;
                        defer allocator.free(dst);
                        const cp_result = io_helper.childRun(allocator, &[_][]const u8{ "cp", src, dst }) catch continue;
                        allocator.free(cp_result.stdout);
                        allocator.free(cp_result.stderr);
                        break;
                    }
                }
            }
        } else |_| {}
    } else {
        // No "files" field - use default behavior (exclude common non-publishable files)
        return createTarballDefault(allocator, package_dir, staging_pkg, staging_base, tarball_path);
    }

    // Create tarball with "package" directory at root
    const tar_result = try io_helper.childRun(allocator, &[_][]const u8{
        "tar",
        "-czf",
        tarball_path,
        "-C",
        staging_base,
        "package",
    });
    defer allocator.free(tar_result.stdout);
    defer allocator.free(tar_result.stderr);

    // Cleanup staging
    io_helper.deleteTree(staging_base) catch {};

    if (tar_result.term != .exited or tar_result.term.exited != 0) {
        style.print("tar failed: {s}\n", .{tar_result.stderr});
        return error.TarballCreationFailed;
    }

    return tarball_path;
}

/// Default tarball creation - use .pantryignore or .gitignore for exclusions
fn createTarballDefault(
    allocator: std.mem.Allocator,
    package_dir: []const u8,
    staging_pkg: []const u8,
    staging_base: []const u8,
    tarball_path: []const u8,
) ![]const u8 {
    const src_path = try std.fmt.allocPrint(allocator, "{s}/", .{package_dir});
    defer allocator.free(src_path);
    const dst_path = try std.fmt.allocPrint(allocator, "{s}/", .{staging_pkg});
    defer allocator.free(dst_path);

    // Read ignore patterns from .pantryignore or .gitignore
    var ignore_patterns: [128][]const u8 = undefined;
    var ignore_count: usize = 0;

    // Always exclude these (npm standard)
    const always_exclude = [_][]const u8{
        "node_modules",
        ".git",
        "*.tgz",
        ".DS_Store",
        "*.log",
        ".pantryignore",
        ".gitignore",
        ".npmignore",
        "pantry.lock",
        "package-lock.json",
        "yarn.lock",
        "bun.lockb",
        "pnpm-lock.yaml",
    };
    for (always_exclude) |pattern| {
        if (ignore_count < ignore_patterns.len) {
            ignore_patterns[ignore_count] = pattern;
            ignore_count += 1;
        }
    }

    // Try to read ignore files in priority order: .pantryignore > .npmignore > .gitignore
    var dynamic_patterns: [64][]u8 = undefined;
    var dynamic_count: usize = 0;
    defer {
        for (0..dynamic_count) |i| {
            allocator.free(dynamic_patterns[i]);
        }
    }

    style.print("  Scanning for ignore files in: {s}\n", .{package_dir});

    const ignore_file_content = blk: {
        // Priority 1: .pantryignore (pantry-specific)
        const pantryignore_path = std.fs.path.join(allocator, &[_][]const u8{ package_dir, ".pantryignore" }) catch {
            style.print("    Failed to join .pantryignore path\n", .{});
            break :blk null;
        };
        defer allocator.free(pantryignore_path);
        style.print("    Checking: {s}\n", .{pantryignore_path});
        const pantry_content = io_helper.readFileAlloc(allocator, pantryignore_path, 64 * 1024) catch |err| {
            style.print("    .pantryignore not found or unreadable: {any}\n", .{err});
            // Continue to next option
            const npmignore_path = std.fs.path.join(allocator, &[_][]const u8{ package_dir, ".npmignore" }) catch break :blk null;
            defer allocator.free(npmignore_path);
            style.print("    Checking: {s}\n", .{npmignore_path});
            const npm_content = io_helper.readFileAlloc(allocator, npmignore_path, 64 * 1024) catch |err2| {
                style.print("    .npmignore not found or unreadable: {any}\n", .{err2});
                // Continue to .gitignore
                const gitignore_path = std.fs.path.join(allocator, &[_][]const u8{ package_dir, ".gitignore" }) catch break :blk null;
                defer allocator.free(gitignore_path);
                style.print("    Checking: {s}\n", .{gitignore_path});
                const git_content = io_helper.readFileAlloc(allocator, gitignore_path, 64 * 1024) catch |err3| {
                    style.print("    .gitignore not found or unreadable: {any}\n", .{err3});
                    break :blk null;
                };
                if (git_content.len > 0) {
                    style.print("  Using .gitignore for exclusions ({d} bytes)\n", .{git_content.len});
                    break :blk git_content;
                }
                allocator.free(git_content);
                break :blk null;
            };
            if (npm_content.len > 0) {
                style.print("  Using .npmignore for exclusions ({d} bytes)\n", .{npm_content.len});
                break :blk npm_content;
            }
            allocator.free(npm_content);
            break :blk null;
        };
        if (pantry_content.len > 0) {
            style.print("  Using .pantryignore for exclusions ({d} bytes)\n", .{pantry_content.len});
            break :blk pantry_content;
        }
        allocator.free(pantry_content);
        style.print("  .pantryignore is empty\n", .{});
        break :blk null;
    };
    defer if (ignore_file_content) |content| allocator.free(content);

    // Parse ignore file content if found
    if (ignore_file_content) |content| {
        var lines = std.mem.splitScalar(u8, content, '\n');
        while (lines.next()) |line| {
            // Skip empty lines and comments
            const trimmed = std.mem.trim(u8, line, " \t\r");
            if (trimmed.len == 0 or trimmed[0] == '#') continue;

            // Skip negation patterns (we don't support them yet)
            if (trimmed[0] == '!') continue;

            // Add the pattern
            if (ignore_count < ignore_patterns.len and dynamic_count < dynamic_patterns.len) {
                const pattern_copy = try allocator.dupe(u8, trimmed);
                dynamic_patterns[dynamic_count] = pattern_copy;
                ignore_patterns[ignore_count] = pattern_copy;
                ignore_count += 1;
                dynamic_count += 1;
                style.print("    + exclude: {s}\n", .{trimmed});
            }
        }
    }

    // Build rsync command with all exclude patterns
    var rsync_args: [256][]const u8 = undefined;
    var arg_count: usize = 0;

    rsync_args[arg_count] = "rsync";
    arg_count += 1;
    rsync_args[arg_count] = "-a";
    arg_count += 1;

    // Add all exclude patterns
    var exclude_flags: [128][]u8 = undefined;
    var exclude_flag_count: usize = 0;
    defer {
        for (0..exclude_flag_count) |i| {
            allocator.free(exclude_flags[i]);
        }
    }

    for (ignore_patterns[0..ignore_count]) |pattern| {
        if (arg_count < rsync_args.len - 2 and exclude_flag_count < exclude_flags.len) {
            const flag = try std.fmt.allocPrint(allocator, "--exclude={s}", .{pattern});
            exclude_flags[exclude_flag_count] = flag;
            rsync_args[arg_count] = flag;
            arg_count += 1;
            exclude_flag_count += 1;
        }
    }

    rsync_args[arg_count] = src_path;
    arg_count += 1;
    rsync_args[arg_count] = dst_path;
    arg_count += 1;

    const cp_result = try io_helper.childRun(allocator, rsync_args[0..arg_count]);
    defer allocator.free(cp_result.stdout);
    defer allocator.free(cp_result.stderr);

    if (cp_result.term != .exited or cp_result.term.exited != 0) {
        style.print("rsync failed: {s}\n", .{cp_result.stderr});
        return error.TarballCreationFailed;
    }

    // Always include root-level markdown files, LICENSE, and CHANGELOG
    // These are important for npm registry display
    const always_include = [_][]const u8{ "*.md", "LICENSE", "LICENSE.*", "CHANGELOG", "CHANGELOG.*" };
    for (always_include) |pattern| {
        const cp_cmd = try std.fmt.allocPrint(allocator, "cp {s}/{s} {s}/ 2>/dev/null || true", .{ package_dir, pattern, staging_pkg });
        defer allocator.free(cp_cmd);
        const include_result = io_helper.childRun(allocator, &[_][]const u8{ "sh", "-c", cp_cmd }) catch continue;
        allocator.free(include_result.stdout);
        allocator.free(include_result.stderr);
    }

    // Create tarball with "package" directory at root
    const tar_result = try io_helper.childRun(allocator, &[_][]const u8{
        "tar",
        "-czf",
        tarball_path,
        "-C",
        staging_base,
        "package",
    });
    defer allocator.free(tar_result.stdout);
    defer allocator.free(tar_result.stderr);

    // Cleanup staging
    io_helper.deleteTree(staging_base) catch {};

    if (tar_result.term != .exited or tar_result.term.exited != 0) {
        style.print("tar failed: {s}\n", .{tar_result.stderr});
        return error.TarballCreationFailed;
    }

    return tarball_path;
}

/// Upload tarball to Pantry registry - direct S3 upload or via HTTP
fn uploadToRegistry(
    allocator: std.mem.Allocator,
    registry_url: []const u8,
    name: []const u8,
    version: []const u8,
    tarball_data: []const u8,
    token: []const u8,
    metadata_json: []const u8,
) ![]const u8 {
    // Check if we should use direct S3 upload (AWS credentials available)
    const aws_key = io_helper.getenv("AWS_ACCESS_KEY_ID");
    const has_aws_creds = aws_key != null or awsCredentialsFileExists();

    if (has_aws_creds) {
        return uploadToS3Direct(allocator, name, version, tarball_data, metadata_json);
    }

    // Fall back to HTTP upload via registry server
    return uploadViaHttp(allocator, registry_url, tarball_data, token, metadata_json);
}

/// Check if ~/.aws/credentials file exists
fn awsCredentialsFileExists() bool {
    const home = io_helper.getenv("HOME") orelse return false;
    var path_buf: [std.fs.max_path_bytes]u8 = undefined;
    const creds_path = std.fmt.bufPrint(&path_buf, "{s}/.aws/credentials", .{home}) catch return false;
    io_helper.accessAbsolute(creds_path, .{}) catch return false;
    return true;
}

/// Upload directly to S3 using AWS CLI
fn uploadToS3Direct(
    allocator: std.mem.Allocator,
    name: []const u8,
    version: []const u8,
    tarball_data: []const u8,
    metadata_json: []const u8,
) ![]const u8 {
    const bucket = "pantry-registry";
    const tmp_dir = io_helper.getTempDir();

    // Sanitize package name for S3 key
    var sanitized_name = try allocator.alloc(u8, name.len);
    defer allocator.free(sanitized_name);
    for (name, 0..) |c, i| {
        sanitized_name[i] = if (c == '@' or c == '/') '-' else c;
    }
    const clean_name = if (sanitized_name[0] == '-') sanitized_name[1..] else sanitized_name;

    // Build tarball filename and S3 key
    const tarball_filename = try std.fmt.allocPrint(allocator, "{s}-{s}.tgz", .{ clean_name, version });
    defer allocator.free(tarball_filename);

    const tarball_key = try std.fmt.allocPrint(allocator, "packages/pantry/{s}/{s}/{s}", .{ clean_name, version, tarball_filename });
    defer allocator.free(tarball_key);

    const metadata_key = try std.fmt.allocPrint(allocator, "packages/pantry/{s}/metadata.json", .{clean_name});
    defer allocator.free(metadata_key);

    // Write tarball to temp file
    const tarball_tmp = try std.fs.path.join(allocator, &[_][]const u8{ tmp_dir, tarball_filename });
    defer allocator.free(tarball_tmp);

    const file = try io_helper.cwd().createFile(io_helper.io, tarball_tmp, .{});
    try io_helper.writeAllToFile(file, tarball_data);
    file.close(io_helper.io);
    defer io_helper.deleteFile(tarball_tmp) catch {};

    // Write metadata to temp file
    const metadata_tmp = try std.fs.path.join(allocator, &[_][]const u8{ tmp_dir, "metadata.json" });
    defer allocator.free(metadata_tmp);

    const meta_file = try io_helper.cwd().createFile(io_helper.io, metadata_tmp, .{});
    try io_helper.writeAllToFile(meta_file, metadata_json);
    meta_file.close(io_helper.io);
    defer io_helper.deleteFile(metadata_tmp) catch {};

    // Upload tarball to S3
    const s3_tarball_uri = try std.fmt.allocPrint(allocator, "s3://{s}/{s}", .{ bucket, tarball_key });
    defer allocator.free(s3_tarball_uri);

    style.print("  Uploading tarball to S3...\n", .{});
    const tarball_result = try io_helper.childRun(allocator, &[_][]const u8{
        "aws",
        "s3",
        "cp",
        tarball_tmp,
        s3_tarball_uri,
        "--content-type",
        "application/gzip",
    });
    defer allocator.free(tarball_result.stdout);
    defer allocator.free(tarball_result.stderr);

    if (tarball_result.term != .exited or tarball_result.term.exited != 0) {
        style.print("S3 upload failed: {s}\n", .{tarball_result.stderr});
        return error.UploadFailed;
    }

    // Upload metadata to S3
    const s3_metadata_uri = try std.fmt.allocPrint(allocator, "s3://{s}/{s}", .{ bucket, metadata_key });
    defer allocator.free(s3_metadata_uri);

    style.print("  Uploading metadata to S3...\n", .{});
    const metadata_result = try io_helper.childRun(allocator, &[_][]const u8{
        "aws",
        "s3",
        "cp",
        metadata_tmp,
        s3_metadata_uri,
        "--content-type",
        "application/json",
    });
    defer allocator.free(metadata_result.stdout);
    defer allocator.free(metadata_result.stderr);

    if (metadata_result.term != .exited or metadata_result.term.exited != 0) {
        style.print("S3 metadata upload failed: {s}\n", .{metadata_result.stderr});
        return error.UploadFailed;
    }

    // Update DynamoDB index
    style.print("  Updating DynamoDB index...\n", .{});
    try updateDynamoDBIndex(allocator, name, clean_name, tarball_key, version, metadata_json);

    const success_msg = try std.fmt.allocPrint(allocator, "Published to s3://{s}/{s}", .{ bucket, tarball_key });
    return success_msg;
}

/// Update DynamoDB index for the published package
fn updateDynamoDBIndex(
    allocator: std.mem.Allocator,
    name: []const u8,
    clean_name: []const u8,
    s3_path: []const u8,
    version: []const u8,
    metadata_json: []const u8,
) !void {
    const table_name = "pantry-packages";

    // Parse metadata to extract description, author, etc.
    const parsed = std.json.parseFromSlice(std.json.Value, allocator, metadata_json, .{}) catch {
        style.print("Warning: Could not parse metadata for DynamoDB\n", .{});
        return;
    };
    defer parsed.deinit();

    const root = parsed.value;
    if (root != .object) return;

    // Extract fields from metadata
    const description = if (root.object.get("description")) |d| if (d == .string) d.string else "" else "";
    const license = if (root.object.get("license")) |l| if (l == .string) l.string else "" else "";
    const homepage = if (root.object.get("homepage")) |h| if (h == .string) h.string else "" else "";

    // Get author (can be string or object)
    var author: []const u8 = "";
    if (root.object.get("author")) |a| {
        if (a == .string) {
            author = a.string;
        } else if (a == .object) {
            if (a.object.get("name")) |n| {
                if (n == .string) author = n.string;
            }
        }
    }

    // Get repository (can be string or object)
    var repository: []const u8 = "";
    if (root.object.get("repository")) |r| {
        if (r == .string) {
            repository = r.string;
        } else if (r == .object) {
            if (r.object.get("url")) |u| {
                if (u == .string) repository = u.string;
            }
        }
    }

    // If no repository, try to get from .git/config (native, no subprocess)
    if (repository.len == 0) {
        const git_config = io_helper.readFileAlloc(allocator, ".git/config", 64 * 1024) catch null;
        if (git_config) |config| {
            defer allocator.free(config);
            // Parse [remote "origin"] url
            var in_origin = false;
            var lines = std.mem.splitScalar(u8, config, '\n');
            while (lines.next()) |line| {
                const tl = std.mem.trim(u8, line, " \t\r");
                if (std.mem.startsWith(u8, tl, "[remote \"origin\"]")) {
                    in_origin = true;
                    continue;
                }
                if (in_origin) {
                    if (tl.len > 0 and tl[0] == '[') break;
                    if (std.mem.startsWith(u8, tl, "url = ") or std.mem.startsWith(u8, tl, "url=")) {
                        const sep = if (std.mem.indexOf(u8, tl, "= ")) |i| i + 2 else if (std.mem.indexOf(u8, tl, "=")) |i| i + 1 else continue;
                        const trimmed = std.mem.trim(u8, tl[sep..], " \t");
                        if (std.mem.startsWith(u8, trimmed, "git@")) {
                            if (std.mem.indexOf(u8, trimmed, ":")) |colon_idx| {
                                const host = trimmed[4..colon_idx];
                                var path = trimmed[colon_idx + 1 ..];
                                if (std.mem.endsWith(u8, path, ".git")) {
                                    path = path[0 .. path.len - 4];
                                }
                                repository = std.fmt.allocPrint(allocator, "https://{s}/{s}", .{ host, path }) catch "";
                            }
                        } else if (std.mem.startsWith(u8, trimmed, "https://")) {
                            var url = trimmed;
                            if (std.mem.endsWith(u8, url, ".git")) {
                                url = url[0 .. url.len - 4];
                            }
                            repository = allocator.dupe(u8, url) catch "";
                        }
                        break;
                    }
                }
            }
        }
    }

    // Default repository if still empty
    if (repository.len == 0) {
        repository = std.fmt.allocPrint(allocator, "https://github.com/stacksjs/{s}", .{clean_name}) catch "";
    }

    // Get keywords as JSON array - just store as empty for now
    // DynamoDB will store keywords in a simpler format
    const keywords_json: []const u8 = "[]";

    // Extract bin field and normalize to escaped JSON string for DynamoDB
    // The bin JSON needs escaped quotes since it's embedded in another JSON string
    var bin_json_escaped: []const u8 = "{}";
    var bin_json_escaped_owned = false;
    if (root.object.get("bin")) |bin_value| {
        if (bin_value == .string) {
            // Single binary: "bin": "./cli.js" -> {\"pkg-name\": \"./cli.js\"}
            const pkg_name = if (std.mem.indexOf(u8, name, "/")) |idx| name[idx + 1 ..] else name;
            bin_json_escaped = std.fmt.allocPrint(allocator, "{{\\\"" ++ "{s}" ++ "\\\": \\\"" ++ "{s}" ++ "\\\"}}", .{ pkg_name, bin_value.string }) catch "{}";
            bin_json_escaped_owned = true;
        } else if (bin_value == .object) {
            // Multiple binaries: manually build escaped JSON object
            const maybe_json_buf = std.ArrayList(u8).initCapacity(allocator, 256);
            if (maybe_json_buf) |json_buf_init| {
                var json_buf = json_buf_init;
                build_bin: {
                    json_buf.appendSlice(allocator, "{") catch break :build_bin;
                    var bin_iter = bin_value.object.iterator();
                    var first_bin = true;
                    while (bin_iter.next()) |entry| {
                        if (entry.value_ptr.* == .string) {
                            if (!first_bin) json_buf.appendSlice(allocator, ", ") catch break :build_bin;
                            const bin_entry = std.fmt.allocPrint(allocator, "\\\"{s}\\\": \\\"{s}\\\"", .{ entry.key_ptr.*, entry.value_ptr.string }) catch continue;
                            defer allocator.free(bin_entry);
                            json_buf.appendSlice(allocator, bin_entry) catch break :build_bin;
                            first_bin = false;
                        }
                    }
                    json_buf.appendSlice(allocator, "}") catch break :build_bin;
                }
                bin_json_escaped = json_buf.toOwnedSlice(allocator) catch "{}";
                bin_json_escaped_owned = true;
            } else |_| {}
        }
    }
    defer if (bin_json_escaped_owned) allocator.free(bin_json_escaped);

    // Get current timestamp as ISO 8601 string (native, no subprocess)
    var timestamp_buf: [24]u8 = undefined;
    const timestamp: []const u8 = blk: {
        const ts = io_helper.clockGettime();
        const epoch_secs: std.time.epoch.EpochSeconds = .{ .secs = @intCast(ts.sec) };
        const epoch_day = epoch_secs.getEpochDay();
        const year_day = epoch_day.calculateYearDay();
        const month_day = year_day.calculateMonthDay();
        const day_secs = epoch_secs.getDaySeconds();
        break :blk std.fmt.bufPrint(&timestamp_buf, "{d:0>4}-{d:0>2}-{d:0>2}T{d:0>2}:{d:0>2}:{d:0>2}Z", .{
            year_day.year,
            @intFromEnum(month_day.month),
            month_day.day_index + 1,
            day_secs.getHoursIntoDay(),
            day_secs.getMinutesIntoHour(),
            day_secs.getSecondsIntoMinute(),
        }) catch "1970-01-01T00:00:00Z";
    };

    // Build DynamoDB put-item JSON
    const item_json = try std.fmt.allocPrint(allocator,
        \\{{
        \\  "packageName": {{"S": "{s}"}},
        \\  "safeName": {{"S": "{s}"}},
        \\  "s3Path": {{"S": "{s}"}},
        \\  "latestVersion": {{"S": "{s}"}},
        \\  "description": {{"S": "{s}"}},
        \\  "author": {{"S": "{s}"}},
        \\  "license": {{"S": "{s}"}},
        \\  "repository": {{"S": "{s}"}},
        \\  "homepage": {{"S": "{s}"}},
        \\  "keywords": {{"S": "{s}"}},
        \\  "bin": {{"S": "{s}"}},
        \\  "updatedAt": {{"S": "{s}"}},
        \\  "createdAt": {{"S": "{s}"}}
        \\}}
    , .{
        name,
        clean_name,
        s3_path,
        version,
        description,
        author,
        license,
        repository,
        homepage,
        keywords_json,
        bin_json_escaped,
        timestamp,
        timestamp, // createdAt (will be preserved if item exists)
    });
    defer allocator.free(item_json);

    // Write JSON to temp file
    const tmp_dir = io_helper.getTempDir();
    const item_tmp = try std.fs.path.join(allocator, &[_][]const u8{ tmp_dir, "pantry-dynamodb-item.json" });
    defer allocator.free(item_tmp);

    const file = try io_helper.cwd().createFile(io_helper.io, item_tmp, .{});
    try io_helper.writeAllToFile(file, item_json);
    file.close(io_helper.io);
    defer io_helper.deleteFile(item_tmp) catch {};

    // Call AWS CLI to put item
    const result = try io_helper.childRun(allocator, &[_][]const u8{
        "aws",
        "dynamodb",
        "put-item",
        "--table-name",
        table_name,
        "--item",
        item_json,
    });
    defer allocator.free(result.stdout);
    defer allocator.free(result.stderr);

    if (result.term != .exited or result.term.exited != 0) {
        style.print("DynamoDB update failed: {s}\n", .{result.stderr});
        // Don't fail the whole publish, just warn
        return;
    }

    style.print("  Updated DynamoDB index for {s}\n", .{name});
}

/// Upload via HTTP to registry server (native — no curl subprocess)
fn uploadViaHttp(
    allocator: std.mem.Allocator,
    registry_url: []const u8,
    tarball_data: []const u8,
    token: []const u8,
    metadata_json: []const u8,
) ![]const u8 {
    const boundary = "----PantryUploadBoundary7MA4YWxkTrZu0gW";

    // Build multipart body
    // Part 1: tarball (binary)
    const part1_header = "--" ++ boundary ++ "\r\n" ++
        "Content-Disposition: form-data; name=\"tarball\"; filename=\"package.tgz\"\r\n" ++
        "Content-Type: application/octet-stream\r\n\r\n";
    const part1_footer = "\r\n";

    // Part 2: metadata (text)
    const part2_header = "--" ++ boundary ++ "\r\n" ++
        "Content-Disposition: form-data; name=\"metadata\"\r\n" ++
        "Content-Type: text/plain\r\n\r\n";
    const part2_footer = "\r\n";

    const closing = "--" ++ boundary ++ "--\r\n";

    const body_len = part1_header.len + tarball_data.len + part1_footer.len +
        part2_header.len + metadata_json.len + part2_footer.len + closing.len;

    // Assemble the full body
    const body = try allocator.alloc(u8, body_len);
    defer allocator.free(body);
    var offset: usize = 0;
    @memcpy(body[offset..][0..part1_header.len], part1_header);
    offset += part1_header.len;
    @memcpy(body[offset..][0..tarball_data.len], tarball_data);
    offset += tarball_data.len;
    @memcpy(body[offset..][0..part1_footer.len], part1_footer);
    offset += part1_footer.len;
    @memcpy(body[offset..][0..part2_header.len], part2_header);
    offset += part2_header.len;
    @memcpy(body[offset..][0..metadata_json.len], metadata_json);
    offset += metadata_json.len;
    @memcpy(body[offset..][0..part2_footer.len], part2_footer);
    offset += part2_footer.len;
    @memcpy(body[offset..][0..closing.len], closing);

    // Build publish URL
    const publish_url = try std.fmt.allocPrint(allocator, "{s}/publish", .{registry_url});
    defer allocator.free(publish_url);

    // Build auth header value
    const auth_value = try std.fmt.allocPrint(allocator, "Bearer {s}", .{token});
    defer allocator.free(auth_value);

    // Perform HTTP POST with native client
    var client: std.http.Client = .{
        .allocator = allocator,
        .io = io_helper.io,
    };
    defer client.deinit();

    var alloc_writer = std.Io.Writer.Allocating.init(allocator);
    errdefer alloc_writer.deinit();

    var redirect_buf: [8192]u8 = undefined;

    const result = client.fetch(.{
        .location = .{ .url = publish_url },
        .method = .POST,
        .payload = body,
        .response_writer = &alloc_writer.writer,
        .redirect_buffer = &redirect_buf,
        .redirect_behavior = @enumFromInt(5),
        .headers = .{
            .content_type = .{ .override = "multipart/form-data; boundary=" ++ boundary },
            .authorization = .{ .override = auth_value },
        },
    }) catch {
        alloc_writer.deinit();
        return error.UploadFailed;
    };

    if (result.status != .ok and result.status != .created) {
        const err_data = alloc_writer.writer.buffer[0..alloc_writer.writer.end];
        if (err_data.len > 0) {
            style.print("Upload error: {s}\n", .{err_data});
        }
        alloc_writer.deinit();
        return error.UploadFailed;
    }

    // Return response body (caller owns)
    const data = alloc_writer.writer.buffer[0..alloc_writer.writer.end];
    const owned = try allocator.dupe(u8, data);
    alloc_writer.deinit();
    return owned;
}

/// Result of version check
const VersionCheckResult = struct {
    version_exists: bool,
    is_lower_version: bool,
    latest_version: []const u8,
};

/// Check if a version already exists in the registry
fn checkExistingVersion(allocator: std.mem.Allocator, name: []const u8, version: []const u8) !?VersionCheckResult {
    const table_name = "pantry-packages";

    // Build key JSON (DynamoDB uses "packageName" as the key)
    const key_json = try std.fmt.allocPrint(allocator, "{{\"packageName\": {{\"S\": \"{s}\"}}}}", .{name});
    defer allocator.free(key_json);

    // Query DynamoDB for the package
    const result = io_helper.childRun(allocator, &[_][]const u8{
        "aws",
        "dynamodb",
        "get-item",
        "--table-name",
        table_name,
        "--key",
        key_json,
        "--projection-expression",
        "latestVersion",
    }) catch {
        return null; // Can't check, let it proceed
    };
    defer allocator.free(result.stdout);
    defer allocator.free(result.stderr);

    if (result.term != .exited or result.term.exited != 0) {
        return null; // Query failed, let it proceed
    }

    // Parse the response
    const parsed = std.json.parseFromSlice(std.json.Value, allocator, result.stdout, .{}) catch {
        return null;
    };
    defer parsed.deinit();

    const root = parsed.value;
    if (root != .object) return null;

    const item = root.object.get("Item") orelse {
        // No item found, first publish
        return VersionCheckResult{
            .version_exists = false,
            .is_lower_version = false,
            .latest_version = try allocator.dupe(u8, "none"),
        };
    };
    if (item != .object) return null;

    // Check for empty item (package doesn't exist)
    if (item.object.count() == 0) {
        return VersionCheckResult{
            .version_exists = false,
            .is_lower_version = false,
            .latest_version = try allocator.dupe(u8, "none"),
        };
    }

    const version_obj = item.object.get("latestVersion") orelse return null;
    if (version_obj != .object) return null;

    const latest_version = if (version_obj.object.get("S")) |v|
        if (v == .string) v.string else return null
    else
        return null;

    // Check if same version
    if (std.mem.eql(u8, latest_version, version)) {
        return VersionCheckResult{
            .version_exists = true,
            .is_lower_version = false,
            .latest_version = try allocator.dupe(u8, latest_version),
        };
    }

    // Compare versions (simple semver comparison)
    const is_lower = isLowerVersion(version, latest_version);

    return VersionCheckResult{
        .version_exists = false,
        .is_lower_version = is_lower,
        .latest_version = try allocator.dupe(u8, latest_version),
    };
}

/// Simple semver comparison: returns true if v1 < v2
fn isLowerVersion(v1: []const u8, v2: []const u8) bool {
    var v1_parts = std.mem.splitScalar(u8, v1, '.');
    var v2_parts = std.mem.splitScalar(u8, v2, '.');

    // Compare each part
    inline for (0..3) |_| {
        const p1_str = v1_parts.next() orelse "0";
        const p2_str = v2_parts.next() orelse "0";

        const p1 = std.fmt.parseInt(u32, p1_str, 10) catch 0;
        const p2 = std.fmt.parseInt(u32, p2_str, 10) catch 0;

        if (p1 < p2) return true;
        if (p1 > p2) return false;
    }

    return false; // Equal versions
}
