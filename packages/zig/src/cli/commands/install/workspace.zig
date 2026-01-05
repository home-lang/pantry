//! Workspace Package Installation
//!
//! Handles installation for workspace/monorepo setups.

const std = @import("std");
const io_helper = @import("../../../io_helper.zig");
const lib = @import("../../../lib.zig");
const types = @import("types.zig");

const cache = lib.cache;
const install = lib.install;

pub fn installWorkspaceCommand(
    allocator: std.mem.Allocator,
    workspace_root: []const u8,
    workspace_file_path: []const u8,
) !types.CommandResult {
    return installWorkspaceCommandWithOptions(allocator, workspace_root, workspace_file_path, .{});
}

pub fn installWorkspaceCommandWithOptions(
    allocator: std.mem.Allocator,
    workspace_root: []const u8,
    workspace_file_path: []const u8,
    options: types.InstallOptions,
) !types.CommandResult {
    const workspace_module = @import("../../../packages/workspace.zig");
    const parser = @import("../../../deps/parser.zig");

    // Load workspace configuration
    var workspace_config = try workspace_module.loadWorkspaceConfig(
        allocator,
        workspace_file_path,
        workspace_root,
    );
    defer workspace_config.deinit(allocator);

    // Load catalogs from root package.json
    var catalog_manager = lib.deps.catalogs.CatalogManager.init(allocator);
    defer catalog_manager.deinit();

    const root_package_json_path = try std.fs.path.join(allocator, &[_][]const u8{ workspace_root, "package.json" });
    defer allocator.free(root_package_json_path);

    if (io_helper.readFileAlloc(allocator, root_package_json_path, 1024 * 1024)) |package_json_content| {
        defer allocator.free(package_json_content);

        if (std.json.parseFromSlice(std.json.Value, allocator, package_json_content, .{})) |parsed| {
            defer parsed.deinit();
            catalog_manager = try lib.deps.catalogs.parseFromPackageJson(allocator, parsed);

            // Show catalog info if any catalogs were loaded
            var catalog_count: usize = 0;
            if (catalog_manager.default_catalog != null) catalog_count += 1;
            catalog_count += catalog_manager.named_catalogs.count();

            if (catalog_count > 0) {
                std.debug.print("📚 Found {d} catalog(s)\n", .{catalog_count});
            }
        } else |_| {
            // Failed to parse package.json, continue without catalogs
        }
    } else |_| {
        // No package.json or failed to read, continue without catalogs
    }

    const green = "\x1b[32m";
    const blue = "\x1b[34m";
    const dim = "\x1b[2m";
    const reset = "\x1b[0m";

    std.debug.print("{s}🔍 Workspace:{s} {s}\n", .{ blue, reset, workspace_config.name });
    std.debug.print("{s}   Found {d} workspace member(s)\n\n", .{ dim, workspace_config.members.len });

    if (workspace_config.members.len == 0) {
        return .{
            .exit_code = 0,
            .message = try allocator.dupe(u8, "No workspace members found to install"),
        };
    }

    // Apply filter if provided
    const filter_module = @import("../../../packages/filter.zig");
    var filter = if (options.filter) |filter_str| blk: {
        // Parse filter string - could be comma-separated patterns
        var patterns_list = std.ArrayList([]const u8){};
        defer patterns_list.deinit(allocator);

        var iter = std.mem.splitScalar(u8, filter_str, ',');
        while (iter.next()) |pattern| {
            const trimmed = std.mem.trim(u8, pattern, " \t");
            if (trimmed.len > 0) {
                try patterns_list.append(allocator, trimmed);
            }
        }

        break :blk try filter_module.Filter.initWithPatterns(allocator, patterns_list.items);
    } else filter_module.Filter.init(allocator);
    defer filter.deinit();

    // Collect all dependencies from all workspace members
    var all_deps_buffer: [1024]parser.PackageDependency = undefined;
    var all_deps_count: usize = 0;

    // Track which deps are for which members
    var deps_seen = std.StringHashMap(void).init(allocator);
    defer {
        var iter = deps_seen.iterator();
        while (iter.next()) |entry| {
            allocator.free(entry.key_ptr.*);
        }
        deps_seen.deinit();
    }

    // Process each workspace member
    for (workspace_config.members) |member| {
        // Skip members that don't match the filter
        if (!filter.matchesMember(member)) {
            continue;
        }

        std.debug.print("{s}📦 {s}{s}\n", .{ dim, member.name, reset });

        // Load dependencies for this member
        var member_deps: ?[]parser.PackageDependency = null;
        defer if (member_deps) |deps| {
            allocator.free(deps);
        };

        // Try config file first
        if (member.config_path) |_| {
            var config_result = @import("../../../config/loader.zig").loadpantryConfig(
                allocator,
                .{
                    .name = "pantry",
                    .cwd = member.abs_path,
                },
            ) catch null;

            if (config_result) |*config| {
                defer config.deinit();
                const deps_extractor = @import("../../../config/dependencies.zig");
                member_deps = try deps_extractor.extractDependencies(allocator, config.*);
            }
        }

        // Try deps file if config didn't work
        if (member_deps == null and member.deps_file_path != null) {
            const detector = @import("../../../deps/detector.zig");
            if (try detector.findDepsFile(allocator, member.abs_path)) |deps_file| {
                defer allocator.free(deps_file.path);
                member_deps = try parser.inferDependencies(allocator, deps_file);
            }
        }

        if (member_deps) |deps| {
            for (deps) |dep| {
                // Resolve catalog references
                var resolved_dep = dep;

                if (lib.deps.catalogs.CatalogManager.isCatalogReference(dep.version)) {
                    if (catalog_manager.resolveCatalogReference(dep.name, dep.version)) |resolved_version| {
                        // Replace catalog reference with actual version
                        allocator.free(resolved_dep.version);
                        resolved_dep.version = try allocator.dupe(u8, resolved_version);
                    } else {
                        // Catalog reference not found - warn user
                        const catalog_name = lib.deps.catalogs.CatalogManager.getCatalogName(dep.version);
                        if (catalog_name) |cat_name| {
                            if (cat_name.len == 0) {
                                std.debug.print("Warning: Package '{s}' references default catalog but no version found\n", .{dep.name});
                            } else {
                                std.debug.print("Warning: Package '{s}' references catalog '{s}' but no version found\n", .{ dep.name, cat_name });
                            }
                        }
                        // Skip this dependency
                        continue;
                    }
                }

                // Create a unique key for this dependency
                const dep_key = try std.fmt.allocPrint(allocator, "{s}@{s}", .{ resolved_dep.name, resolved_dep.version });
                defer allocator.free(dep_key);

                // Only add if we haven't seen this exact dep before
                if (!deps_seen.contains(dep_key)) {
                    try deps_seen.put(try allocator.dupe(u8, dep_key), {});
                    if (all_deps_count >= all_deps_buffer.len) {
                        return .{
                            .exit_code = 1,
                            .message = try allocator.dupe(u8, "Too many dependencies in workspace (max 1024)"),
                        };
                    }
                    all_deps_buffer[all_deps_count] = try resolved_dep.clone(allocator);
                    all_deps_count += 1;
                }
            }
            std.debug.print("{s}   └─ {d} dependencies\n", .{ dim, deps.len });
        } else {
            std.debug.print("{s}   └─ No dependencies\n", .{dim});
        }
    }

    std.debug.print("\n", .{});

    if (all_deps_count == 0) {
        std.debug.print("{s}✓{s} No dependencies to install\n", .{ green, reset });
        return .{ .exit_code = 0 };
    }

    std.debug.print("{s}➤{s} Installing {d} unique package(s) for workspace...\n", .{ green, reset, all_deps_count });

    // Create workspace environment
    const home = try lib.Paths.home(allocator);
    defer allocator.free(home);

    // Hash workspace root for environment directory
    var workspace_hasher = std.crypto.hash.Md5.init(.{});
    workspace_hasher.update(workspace_root);
    var workspace_hash: [16]u8 = undefined;
    workspace_hasher.final(&workspace_hash);
    const workspace_hash_short = try std.fmt.allocPrint(allocator, "{x:0>8}", .{std.mem.readInt(u32, workspace_hash[0..4], .little)});
    defer allocator.free(workspace_hash_short);

    // Create environment directory
    const env_dir = try std.fmt.allocPrint(
        allocator,
        "{s}/.pantry/envs/{s}_{s}-workspace",
        .{ home, workspace_config.name, workspace_hash_short },
    );
    defer allocator.free(env_dir);

    // Create environment directory structure
    try io_helper.cwd().createDirPath(io_helper.io, env_dir);
    const bin_dir = try std.fmt.allocPrint(allocator, "{s}/bin", .{env_dir});
    defer allocator.free(bin_dir);
    try io_helper.cwd().createDirPath(io_helper.io, bin_dir);

    // Install each dependency
    var pkg_cache = try cache.PackageCache.init(allocator);
    defer pkg_cache.deinit();

    var installer_instance = try install.Installer.init(allocator, &pkg_cache);
    defer installer_instance.deinit();

    var success_count: usize = 0;
    var failed_count: usize = 0;

    // Clean up dependencies after installation
    defer {
        for (all_deps_buffer[0..all_deps_count]) |*dep| {
            var d = dep.*;
            d.deinit(allocator);
        }
    }

    for (all_deps_buffer[0..all_deps_count]) |dep| {
        // Map DependencySource to PackageSource
        const pkg_source: lib.packages.PackageSource = switch (dep.source) {
            .registry => .pkgx,
            .github => .github,
            .git => .git,
            .url => .http,
        };

        // Create package spec, parsing GitHub URLs if needed
        const spec = if (pkg_source == .github and dep.github_ref != null) blk: {
            // Use already-parsed GitHub ref from dependency
            const gh_ref = dep.github_ref.?;

            const repo_str = try std.fmt.allocPrint(allocator, "{s}/{s}", .{ gh_ref.owner, gh_ref.repo });
            errdefer allocator.free(repo_str);

            break :blk lib.packages.PackageSpec{
                .name = dep.name,
                .version = gh_ref.ref,
                .source = .github,
                .repo = repo_str,
            };
        } else if (pkg_source == .github) blk: {
            // Fallback: try parsing GitHub URL from version string
            const gh_ref = try parser.parseGitHubUrl(allocator, dep.version) orelse {
                const red = "\x1b[31m";
                std.debug.print("{s}✗{s} {s}@{s} {s}(invalid GitHub URL){s}\n", .{ red, reset, dep.name, dep.version, dim, reset });
                failed_count += 1;
                continue;
            };
            defer {
                allocator.free(gh_ref.owner);
                allocator.free(gh_ref.repo);
                allocator.free(gh_ref.ref);
            }

            const repo_str = try std.fmt.allocPrint(allocator, "{s}/{s}", .{ gh_ref.owner, gh_ref.repo });
            errdefer allocator.free(repo_str);

            break :blk lib.packages.PackageSpec{
                .name = dep.name,
                .version = gh_ref.ref,
                .source = .github,
                .repo = repo_str,
            };
        } else lib.packages.PackageSpec{
            .name = dep.name,
            .version = dep.version,
            .source = pkg_source,
        };
        defer if (spec.repo) |r| allocator.free(r);

        var result = installer_instance.install(spec, .{
            .project_root = workspace_root,
            .quiet = true,
        }) catch |err| {
            const red = "\x1b[31m";
            std.debug.print("{s}✗{s} {s}@{s} {s}({any}){s}\n", .{ red, reset, dep.name, dep.version, dim, err, reset });
            failed_count += 1;
            continue;
        };
        defer result.deinit(allocator);

        std.debug.print("{s}✓{s} {s}@{s}\n", .{ green, reset, dep.name, dep.version });
        success_count += 1;
    }

    // Generate workspace lockfile
    const lockfile_path = try std.fmt.allocPrint(allocator, "{s}/pantry.lock", .{workspace_root});
    defer allocator.free(lockfile_path);

    var lockfile = try lib.packages.Lockfile.init(allocator, "1.0.0");
    defer lockfile.deinit(allocator);

    // Add entries for all installed packages
    for (all_deps_buffer[0..all_deps_count]) |dep| {
        const entry = lib.packages.LockfileEntry{
            .name = try allocator.dupe(u8, dep.name),
            .version = try allocator.dupe(u8, dep.version),
            .source = switch (dep.source) {
                .registry => .pkgx,
                .github => .github,
                .git => .git,
                .url => .http,
            },
            .url = null,
            .resolved = null,
            .integrity = null,
            .dependencies = null,
        };

        const key = try std.fmt.allocPrint(allocator, "{s}@{s}", .{ dep.name, dep.version });
        defer allocator.free(key);
        try lockfile.addEntry(allocator, key, entry);
    }

    // Write lockfile
    const lockfile_writer = @import("../../../packages/lockfile.zig");
    lockfile_writer.writeLockfile(allocator, &lockfile, lockfile_path) catch |err| {
        const yellow = "\x1b[33m";
        std.debug.print("\n{s}⚠{s}  Failed to write lockfile: {}\n", .{ yellow, reset, err });
    };

    // Summary
    std.debug.print("\n{s}✓{s} Workspace setup complete! Installed {d} package(s)", .{ green, reset, success_count });
    if (failed_count > 0) {
        const red = "\x1b[31m";
        std.debug.print(", {s}{d} failed{s}", .{ red, failed_count, reset });
    }
    std.debug.print("\n", .{});

    return .{ .exit_code = 0 };
}
