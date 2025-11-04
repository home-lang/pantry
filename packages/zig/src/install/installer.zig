const std = @import("std");
const core = @import("../core/platform.zig");
const cache = @import("../cache.zig");
const packages = @import("../packages.zig");
const errors = @import("../core/error.zig");
const downloader = @import("downloader.zig");
const extractor = @import("extractor.zig");
const libfixer = @import("libfixer.zig");
const semver = @import("../packages/semver.zig");

const pantryError = errors.pantryError;
const Paths = core.Paths;
const PackageCache = cache.PackageCache;
const PackageSpec = packages.PackageSpec;

/// Installation options
pub const InstallOptions = struct {
    /// Force reinstall even if cached
    force: bool = false,
    /// Verbose output
    verbose: bool = false,
    /// Dry run (don't actually install)
    dry_run: bool = false,
    /// Project root path for local installations (if null, install globally)
    project_root: ?[]const u8 = null,
    /// Quiet mode (minimal output)
    quiet: bool = false,
    /// Inline progress options for parallel installation display
    inline_progress: ?downloader.InlineProgressOptions = null,
};

/// Installation result
pub const InstallResult = struct {
    /// Package name
    name: []const u8,
    /// Package version
    version: []const u8,
    /// Install path
    install_path: []const u8,
    /// Was cached
    from_cache: bool,
    /// Installation time in milliseconds
    install_time_ms: u64,

    pub fn deinit(self: *InstallResult, allocator: std.mem.Allocator) void {
        allocator.free(self.name);
        allocator.free(self.version);
        allocator.free(self.install_path);
    }
};

/// Thread-safe wrapper for the installing stack
const InstallingStack = struct {
    map: std.StringHashMap(void),
    mutex: std.Thread.Mutex,
    allocator: std.mem.Allocator,

    fn init(allocator: std.mem.Allocator) InstallingStack {
        return .{
            .map = std.StringHashMap(void).init(allocator),
            .mutex = std.Thread.Mutex{},
            .allocator = allocator,
        };
    }

    pub fn deinit(self: *InstallingStack) void {
        // Clean up all keys
        var it = self.map.iterator();
        while (it.next()) |entry| {
            self.allocator.free(entry.key_ptr.*);
        }
        self.map.deinit();
    }

    fn contains(self: *InstallingStack, key: []const u8) bool {
        self.mutex.lock();
        defer self.mutex.unlock();
        return self.map.contains(key);
    }

    fn put(self: *InstallingStack, key: []const u8) !void {
        self.mutex.lock();
        defer self.mutex.unlock();
        const key_owned = try self.allocator.dupe(u8, key);
        try self.map.put(key_owned, {});
    }

    fn remove(self: *InstallingStack, key: []const u8) void {
        self.mutex.lock();
        defer self.mutex.unlock();
        if (self.map.fetchRemove(key)) |entry| {
            self.allocator.free(entry.key);
        }
    }
};

/// Package installer
pub const Installer = struct {
    /// Package cache
    cache: *PackageCache,
    /// Data directory
    data_dir: []const u8,
    /// Allocator
    allocator: std.mem.Allocator,
    /// Track packages currently being installed to prevent infinite loops (shared across threads)
    installing_stack: *InstallingStack,

    pub fn init(allocator: std.mem.Allocator, pkg_cache: *PackageCache) !Installer {
        const data_dir = try Paths.data(allocator);
        errdefer allocator.free(data_dir);

        const installing_stack = try allocator.create(InstallingStack);
        installing_stack.* = InstallingStack.init(allocator);

        return .{
            .cache = pkg_cache,
            .data_dir = data_dir,
            .allocator = allocator,
            .installing_stack = installing_stack,
        };
    }

    pub fn deinit(self: *Installer) void {
        self.allocator.free(self.data_dir);
        self.installing_stack.deinit();
        self.allocator.destroy(self.installing_stack);
    }

    /// Install a package
    pub fn install(
        self: *Installer,
        spec: PackageSpec,
        options: InstallOptions,
    ) !InstallResult {
        const start_time = std.time.milliTimestamp();

        // Check if this is a local path dependency
        const is_local_path = std.mem.startsWith(u8, spec.version, "~/") or
            std.mem.startsWith(u8, spec.version, "/");

        if (is_local_path) {
            // Handle local path dependency
            return try self.installLocalPath(spec, options);
        }

        // Check if package exists in global cache (filesystem check, not in-memory cache)
        const pkg_registry = @import("../packages/generated.zig");
        const pkg_info = pkg_registry.getPackageByName(spec.name);
        const domain = if (pkg_info) |info| info.domain else spec.name;

        // Resolve version constraint to actual version
        var resolved_spec = spec;
        if (pkg_info) |_| {
            // Try to resolve version constraint (e.g., ^1.2.16 -> 1.3.1)
            if (semver.resolveVersion(domain, spec.version)) |resolved_version| {
                // Create a new spec with the resolved version
                resolved_spec = PackageSpec{
                    .name = spec.name,
                    .version = resolved_version,
                };
            }
        }

        // Create a unique key for this package installation (domain@version)
        const install_key = try std.fmt.allocPrint(
            self.allocator,
            "{s}@{s}",
            .{ domain, resolved_spec.version },
        );
        defer self.allocator.free(install_key);

        // Check if we're already installing this package (circular dependency)
        if (self.installing_stack.contains(install_key)) {
            // Already being installed in the call stack - skip to avoid infinite loop
            const end_time = std.time.milliTimestamp();
            return InstallResult{
                .name = try self.allocator.dupe(u8, resolved_spec.name),
                .version = try self.allocator.dupe(u8, resolved_spec.version),
                .install_path = try self.allocator.dupe(u8, ""),
                .from_cache = true,
                .install_time_ms = @intCast(end_time - start_time),
            };
        }

        // Mark this package as being installed
        try self.installing_stack.put(install_key);
        defer {
            // Remove from stack when we're done
            self.installing_stack.remove(install_key);
        }

        // Determine install location based on whether we have a project root
        const install_path = if (options.project_root) |project_root|
            try self.installToProject(resolved_spec, domain, project_root, options)
        else
            try self.installGlobal(resolved_spec, domain, options);

        // Install dependencies after the main package is installed
        if (pkg_info) |info| {
            try self.installDependencies(info.dependencies, options);
        }

        const end_time = std.time.milliTimestamp();

        return InstallResult{
            .name = try self.allocator.dupe(u8, resolved_spec.name),
            .version = try self.allocator.dupe(u8, resolved_spec.version),
            .install_path = install_path,
            .from_cache = false, // TODO: track cache hits properly
            .install_time_ms = @intCast(end_time - start_time),
        };
    }

    /// Install a local path dependency by creating a symlink
    fn installLocalPath(
        self: *Installer,
        spec: PackageSpec,
        options: InstallOptions,
    ) !InstallResult {
        const start_time = std.time.milliTimestamp();

        // Expand ~ to home directory if needed
        var local_path: []const u8 = undefined;
        const needs_free = if (std.mem.startsWith(u8, spec.version, "~/")) blk: {
            const home = try Paths.home(self.allocator);
            defer self.allocator.free(home);
            local_path = try std.fmt.allocPrint(
                self.allocator,
                "{s}/{s}",
                .{ home, spec.version[2..] },
            );
            break :blk true;
        } else blk: {
            local_path = spec.version;
            break :blk false;
        };
        defer if (needs_free) self.allocator.free(local_path);

        // Verify the local path exists
        var local_dir = std.fs.cwd().openDir(local_path, .{}) catch |err| {
            std.debug.print("Error: Local path '{s}' does not exist or is not accessible: {}\n", .{ local_path, err });
            return error.FileNotFound;
        };
        local_dir.close();

        // Get absolute path for the local dependency
        const abs_local_path = try std.fs.cwd().realpathAlloc(self.allocator, local_path);
        defer self.allocator.free(abs_local_path);

        // Create symlink in project's pantry_modules if we have a project root
        const symlink_path = if (options.project_root) |project_root| blk: {
            const modules_bin = try std.fmt.allocPrint(
                self.allocator,
                "{s}/pantry_modules/.bin/{s}",
                .{ project_root, spec.name },
            );
            errdefer self.allocator.free(modules_bin);

            // Create pantry_modules/.bin directory
            const modules_bin_dir = try std.fmt.allocPrint(
                self.allocator,
                "{s}/pantry_modules/.bin",
                .{project_root},
            );
            defer self.allocator.free(modules_bin_dir);

            try std.fs.cwd().makePath(modules_bin_dir);

            // Check if symlink already exists
            std.fs.cwd().deleteFile(modules_bin) catch {};

            // Create symlink to local path's bin or the path itself
            const target_bin = try std.fmt.allocPrint(
                self.allocator,
                "{s}/bin/{s}",
                .{ abs_local_path, spec.name },
            );
            defer self.allocator.free(target_bin);

            // Try bin/name first, fall back to the directory itself
            const target = blk2: {
                var check_bin = std.fs.cwd().openFile(target_bin, .{}) catch break :blk2 abs_local_path;
                check_bin.close();
                break :blk2 target_bin;
            };

            std.posix.symlink(target, modules_bin) catch |err| {
                std.debug.print("Warning: Failed to create symlink {s} -> {s}: {}\n", .{ modules_bin, target, err });
            };

            break :blk modules_bin;
        } else blk: {
            break :blk try self.allocator.dupe(u8, abs_local_path);
        };

        const end_time = std.time.milliTimestamp();

        if (!options.quiet) {
            std.debug.print("  ✓ linked to {s}\n", .{local_path});
        }

        return InstallResult{
            .name = try self.allocator.dupe(u8, spec.name),
            .version = try self.allocator.dupe(u8, "local"),
            .install_path = symlink_path,
            .from_cache = false,
            .install_time_ms = @intCast(end_time - start_time),
        };
    }

    /// Install package globally (old behavior)
    fn installGlobal(
        self: *Installer,
        spec: PackageSpec,
        domain: []const u8,
        options: InstallOptions,
    ) ![]const u8 {
        const global_pkg_dir = try self.getGlobalPackageDir(domain, spec.version);
        defer self.allocator.free(global_pkg_dir);

        const from_cache = !options.force and blk: {
            var check_dir = std.fs.cwd().openDir(global_pkg_dir, .{}) catch break :blk false;
            check_dir.close();
            break :blk true;
        };

        const install_path = if (from_cache) blk: {
            // Use cached package (from global location)
            break :blk try self.installFromCache(spec, "");
        } else blk: {
            // Download and install to global cache
            break :blk try self.installFromNetwork(spec, options);
        };

        // Create symlinks in data_dir/bin (e.g., ~/.pantry/global/bin or /usr/local/bin)
        const symlink_mod = @import("symlink.zig");
        symlink_mod.createPackageSymlinks(
            self.allocator,
            domain,
            spec.version,
            self.data_dir,
        ) catch |err| {
            // Log error but don't fail the install
            std.debug.print("Warning: Failed to create symlinks: {}\n", .{err});
        };

        return install_path;
    }

    /// Install package to project's pantry_modules directory
    fn installToProject(
        self: *Installer,
        spec: PackageSpec,
        domain: []const u8,
        project_root: []const u8,
        options: InstallOptions,
    ) ![]const u8 {
        const project_pkg_dir = try self.getProjectPackageDir(project_root, domain, spec.version);
        errdefer self.allocator.free(project_pkg_dir);

        // Check if already installed in project
        const already_installed = !options.force and blk: {
            var check_dir = std.fs.cwd().openDir(project_pkg_dir, .{}) catch break :blk false;
            check_dir.close();
            break :blk true;
        };

        if (already_installed) {
            // Already in pantry_modules - create symlinks and return
            try self.createProjectSymlinks(project_root, domain, spec.version, project_pkg_dir);
            return project_pkg_dir;
        }

        // Check if package exists in global cache first
        const global_pkg_dir = try self.getGlobalPackageDir(domain, spec.version);
        defer self.allocator.free(global_pkg_dir);

        var global_dir = std.fs.cwd().openDir(global_pkg_dir, .{}) catch |err| blk: {
            if (err != error.FileNotFound) return err;
            break :blk null;
        };

        if (global_dir) |*dir| {
            dir.close();
            // Copy from global cache to project's pantry_modules
            try std.fs.cwd().makePath(project_pkg_dir);
            try self.copyDirectoryStructure(global_pkg_dir, project_pkg_dir);
            try self.createProjectSymlinks(project_root, domain, spec.version, project_pkg_dir);
            return project_pkg_dir;
        }

        // Not in global cache - download directly to project's pantry_modules
        try self.downloadAndInstallToProject(spec, domain, project_pkg_dir, options);
        try self.createProjectSymlinks(project_root, domain, spec.version, project_pkg_dir);

        return project_pkg_dir;
    }

    /// Download and install package directly to project directory (bypassing global cache)
    fn downloadAndInstallToProject(self: *Installer, spec: PackageSpec, domain: []const u8, project_pkg_dir: []const u8, options: InstallOptions) !void {
        const home = try Paths.home(self.allocator);
        defer self.allocator.free(home);

        const temp_dir = try std.fmt.allocPrint(
            self.allocator,
            "{s}/.pantry/.tmp/{s}-{s}",
            .{ home, spec.name, spec.version },
        );
        defer self.allocator.free(temp_dir);

        try std.fs.cwd().makePath(temp_dir);
        defer std.fs.cwd().deleteTree(temp_dir) catch {};

        // Try different archive formats
        const formats = [_][]const u8{ "tar.xz", "tar.gz" };
        var downloaded = false;
        var archive_path: []const u8 = undefined;
        var used_format: []const u8 = undefined;

        for (formats) |format| {
            // Build download URL
            const url = try downloader.buildPackageUrl(
                self.allocator,
                domain,
                spec.version,
                format,
            );
            defer self.allocator.free(url);

            // Create archive path
            const temp_archive_path = try std.fmt.allocPrint(
                self.allocator,
                "{s}/package.{s}",
                .{ temp_dir, format },
            );

            // Try to download (use inline progress if available, otherwise use quiet mode)
            if (options.inline_progress) |progress_opts| {
                downloader.downloadFileInline(self.allocator, url, temp_archive_path, progress_opts) catch |err| {
                    self.allocator.free(temp_archive_path);
                    std.debug.print("Failed to download {s}: {}\n", .{ url, err });
                    continue;
                };
            } else {
                downloader.downloadFileQuiet(self.allocator, url, temp_archive_path, options.quiet) catch |err| {
                    self.allocator.free(temp_archive_path);
                    std.debug.print("Failed to download {s}: {}\n", .{ url, err });
                    continue;
                };
            }

            // Success!
            downloaded = true;
            archive_path = temp_archive_path;
            used_format = format;
            break;
        }

        if (!downloaded) {
            return error.DownloadFailed;
        }
        defer self.allocator.free(archive_path);

        // Show "extracting..." status if inline progress is enabled
        if (options.inline_progress) |progress_opts| {
            const lines_up = progress_opts.total_deps - progress_opts.line_offset;
            std.debug.print("\x1b[{d}A\r\x1b[K{s}+{s} {s}@{s}{s}{s} {s}(extracting...){s}\n", .{
                lines_up,
                progress_opts.dim_str,
                "\x1b[0m",
                progress_opts.pkg_name,
                progress_opts.dim_str,
                progress_opts.italic_str,
                progress_opts.pkg_version,
                progress_opts.dim_str,
                "\x1b[0m",
            });
            if (progress_opts.line_offset < progress_opts.total_deps - 1) {
                std.debug.print("\x1b[{d}B", .{lines_up - 1});
            }
        }

        // Extract archive to temp directory
        const extract_dir = try std.fmt.allocPrint(
            self.allocator,
            "{s}/extracted",
            .{temp_dir},
        );
        defer self.allocator.free(extract_dir);

        try std.fs.cwd().makePath(extract_dir);
        try extractor.extractArchiveQuiet(self.allocator, archive_path, extract_dir, used_format, options.quiet);

        // Find the actual package root
        const package_source = try self.findPackageRoot(extract_dir, domain, spec.version);
        defer self.allocator.free(package_source);

        // Copy package contents to project directory
        try std.fs.cwd().makePath(project_pkg_dir);
        try self.copyDirectoryStructure(package_source, project_pkg_dir);

        // Fix library paths for macOS
        try libfixer.fixDirectoryLibraryPaths(self.allocator, project_pkg_dir);
    }

    /// Install from cached package (global cache location)
    fn installFromCache(
        self: *Installer,
        spec: PackageSpec,
        _: []const u8,
    ) ![]const u8 {
        // Resolve package name to domain
        const pkg_registry = @import("../packages/generated.zig");
        const pkg_info = pkg_registry.getPackageByName(spec.name);
        const domain = if (pkg_info) |info| info.domain else spec.name;

        // Check if package exists in global cache
        const global_pkg_dir = try self.getGlobalPackageDir(domain, spec.version);
        defer self.allocator.free(global_pkg_dir);

        // Verify it exists
        var check_dir = std.fs.cwd().openDir(global_pkg_dir, .{}) catch {
            // Not in global cache - shouldn't happen if cache.has() returned true
            return error.CacheInconsistent;
        };
        check_dir.close();

        // Create symlinks in environment bin directory
        try self.createEnvSymlinks(domain, spec.version, global_pkg_dir);

        // Return the global package directory (not env-specific)
        return try self.allocator.dupe(u8, global_pkg_dir);
    }

    /// Get global package directory (shared across all environments)
    /// Uses /usr/local/packages/ for system-wide global installations
    /// Or ~/.pantry/global/packages/ for user-local installations
    fn getGlobalPackageDir(self: *Installer, domain: []const u8, version: []const u8) ![]const u8 {
        // Check if we're using system-wide installation (/usr/local)
        if (std.mem.eql(u8, self.data_dir, "/usr/local")) {
            return std.fmt.allocPrint(
                self.allocator,
                "/usr/local/packages/{s}/v{s}",
                .{ domain, version },
            );
        }

        // Otherwise use user-local path (~/.pantry/global/packages/)
        const home = try Paths.home(self.allocator);
        defer self.allocator.free(home);

        return std.fmt.allocPrint(
            self.allocator,
            "{s}/.pantry/global/packages/{s}/v{s}",
            .{ home, domain, version },
        );
    }

    /// Get project-local package directory (pantry_modules)
    fn getProjectPackageDir(self: *Installer, project_root: []const u8, domain: []const u8, version: []const u8) ![]const u8 {
        return std.fmt.allocPrint(
            self.allocator,
            "{s}/pantry_modules/{s}/v{s}",
            .{ project_root, domain, version },
        );
    }

    /// Create symlinks in environment bin directory to global package
    fn createEnvSymlinks(self: *Installer, domain: []const u8, version: []const u8, global_pkg_dir: []const u8) !void {
        // Get package info to find which programs to symlink
        const pkg_registry = @import("../packages/generated.zig");
        const pkg_info = pkg_registry.getPackageByName(domain) orelse return;

        if (pkg_info.programs.len == 0) return;

        // Environment bin directory
        const env_bin_dir = try std.fmt.allocPrint(
            self.allocator,
            "{s}/bin",
            .{self.data_dir},
        );
        defer self.allocator.free(env_bin_dir);

        try std.fs.cwd().makePath(env_bin_dir);

        // Global package bin directory
        const global_bin_dir = try std.fmt.allocPrint(
            self.allocator,
            "{s}/bin",
            .{global_pkg_dir},
        );
        defer self.allocator.free(global_bin_dir);

        // Create symlinks for each program
        for (pkg_info.programs) |program| {
            const source = try std.fmt.allocPrint(
                self.allocator,
                "{s}/{s}",
                .{ global_bin_dir, program },
            );
            defer self.allocator.free(source);

            const link = try std.fmt.allocPrint(
                self.allocator,
                "{s}/{s}",
                .{ env_bin_dir, program },
            );
            defer self.allocator.free(link);

            // Check if source exists
            std.fs.accessAbsolute(source, .{}) catch |err| {
                if (err == error.FileNotFound) {
                    std.debug.print("Warning: Program not found: {s}\n", .{source});
                    continue;
                }
                return err;
            };

            // Remove existing symlink if it exists
            std.fs.deleteFileAbsolute(link) catch {};

            // Create symlink
            std.fs.symLinkAbsolute(source, link, .{}) catch |err| {
                std.debug.print("Warning: Failed to create symlink for {s}: {}\n", .{ program, err });
            };
        }

        _ = version; // not used in current implementation
    }

    /// Create symlinks in project's pantry_modules/.bin directory
    fn createProjectSymlinks(self: *Installer, project_root: []const u8, domain: []const u8, version: []const u8, package_dir: []const u8) !void {
        // Project bin directory (pantry_modules/.bin)
        const project_bin_dir = try std.fmt.allocPrint(
            self.allocator,
            "{s}/pantry_modules/.bin",
            .{project_root},
        );
        defer self.allocator.free(project_bin_dir);

        try std.fs.cwd().makePath(project_bin_dir);

        // First, try to load bin paths from package configuration (pantry.json or package.json)
        var custom_bins_created = false;
        const config_loader = @import("../config.zig");

        // Try pantry.json first, then package.json
        const config_names = [_][]const u8{ "pantry.json", "package.json" };
        for (config_names) |config_name| {
            const config_path = try std.fmt.allocPrint(
                self.allocator,
                "{s}/{s}",
                .{ package_dir, config_name },
            );
            defer self.allocator.free(config_path);

            // Check if config file exists
            std.fs.accessAbsolute(config_path, .{}) catch continue;

            // Try to load and extract bin paths
            var config = config_loader.loadpantryConfig(self.allocator, .{
                .name = "pantry",
                .cwd = package_dir,
            }) catch continue;
            defer config.deinit();

            if (config_loader.extractBinPaths(self.allocator, config)) |maybe_bin_map| {
                if (maybe_bin_map) |bin_map_const| {
                    var bin_map = bin_map_const;
                    defer {
                        var it = bin_map.iterator();
                        while (it.next()) |entry| {
                            self.allocator.free(entry.key_ptr.*);
                            self.allocator.free(entry.value_ptr.*);
                        }
                        bin_map.deinit();
                    }

                    // Create symlinks for custom bin paths
                    var it = bin_map.iterator();
                    while (it.next()) |entry| {
                        const bin_name = entry.key_ptr.*;
                        const bin_path = entry.value_ptr.*;

                        const source = try std.fmt.allocPrint(
                            self.allocator,
                            "{s}/{s}",
                            .{ package_dir, bin_path },
                        );
                        defer self.allocator.free(source);

                        const link = try std.fmt.allocPrint(
                            self.allocator,
                            "{s}/{s}",
                            .{ project_bin_dir, bin_name },
                        );
                        defer self.allocator.free(link);

                        // Check if source exists
                        std.fs.accessAbsolute(source, .{}) catch |err| {
                            if (err == error.FileNotFound) {
                                std.debug.print("Warning: Bin not found: {s}\n", .{source});
                                continue;
                            }
                            return err;
                        };

                        // Remove existing symlink if it exists
                        std.fs.deleteFileAbsolute(link) catch {};

                        // Create symlink
                        std.fs.symLinkAbsolute(source, link, .{}) catch |err| {
                            std.debug.print("Warning: Failed to create symlink for {s}: {}\n", .{ bin_name, err });
                            continue;
                        };

                        custom_bins_created = true;
                    }

                    // If we found and processed custom bins, we're done
                    if (custom_bins_created) return;
                }
            } else |_| {
                // Failed to extract bin paths, try next config file
                continue;
            }
        }

        // Fallback: Discover binaries in the package (using npm-aware logic)
        const symlink = @import("symlink.zig");
        const binaries = symlink.discoverBinaries(self.allocator, package_dir) catch return;
        defer {
            for (binaries) |*bin| {
                var b = bin.*;
                b.deinit(self.allocator);
            }
            self.allocator.free(binaries);
        }

        if (binaries.len == 0) return;

        // Create symlinks for each discovered binary
        for (binaries) |bin_info| {
            const link = try std.fmt.allocPrint(
                self.allocator,
                "{s}/{s}",
                .{ project_bin_dir, bin_info.name },
            );
            defer self.allocator.free(link);

            // Remove existing symlink if it exists
            std.fs.deleteFileAbsolute(link) catch {};

            // Create symlink using absolute paths
            std.fs.symLinkAbsolute(bin_info.path, link, .{}) catch |err| {
                std.debug.print("Warning: Failed to create symlink for {s}: {}\n", .{ bin_info.name, err });
            };
        }

        _ = version; // not used in current implementation
        _ = domain; // not used with new discovery method
    }

    /// Install from network (download)
    fn installFromNetwork(self: *Installer, spec: PackageSpec, options: InstallOptions) ![]const u8 {
        // Resolve package name to domain
        const pkg_registry = @import("../packages/generated.zig");
        const pkg_info = pkg_registry.getPackageByName(spec.name);
        const domain = if (pkg_info) |info| info.domain else spec.name;

        // Check if already exists in global cache
        const global_pkg_dir = try self.getGlobalPackageDir(domain, spec.version);
        errdefer self.allocator.free(global_pkg_dir);

        var check_dir = std.fs.cwd().openDir(global_pkg_dir, .{}) catch |err| blk: {
            if (err != error.FileNotFound) return err;
            break :blk null;
        };
        if (check_dir) |*dir| {
            dir.close();
            // Already downloaded to global cache - just create env symlinks
            try self.createEnvSymlinks(domain, spec.version, global_pkg_dir);
            return global_pkg_dir;
        }

        // Not in global cache - download and install to global location
        const home = try Paths.home(self.allocator);
        defer self.allocator.free(home);

        const temp_dir = try std.fmt.allocPrint(
            self.allocator,
            "{s}/.pantry/.tmp/{s}-{s}",
            .{ home, spec.name, spec.version },
        );
        defer self.allocator.free(temp_dir);

        try std.fs.cwd().makePath(temp_dir);
        defer std.fs.cwd().deleteTree(temp_dir) catch {};

        // Try different archive formats
        const formats = [_][]const u8{ "tar.xz", "tar.gz" };
        var downloaded = false;
        var archive_path: []const u8 = undefined;
        var used_format: []const u8 = undefined;

        for (formats) |format| {
            // Build download URL
            const url = try downloader.buildPackageUrl(
                self.allocator,
                domain,
                spec.version,
                format,
            );
            defer self.allocator.free(url);

            // Create archive path
            const temp_archive_path = try std.fmt.allocPrint(
                self.allocator,
                "{s}/package.{s}",
                .{ temp_dir, format },
            );

            // Try to download (use inline progress if available, otherwise use quiet mode)
            if (options.inline_progress) |progress_opts| {
                downloader.downloadFileInline(self.allocator, url, temp_archive_path, progress_opts) catch |err| {
                    self.allocator.free(temp_archive_path);
                    std.debug.print("Failed to download {s}: {}\n", .{ url, err });
                    continue;
                };
            } else {
                downloader.downloadFileQuiet(self.allocator, url, temp_archive_path, options.quiet) catch |err| {
                    self.allocator.free(temp_archive_path);
                    std.debug.print("Failed to download {s}: {}\n", .{ url, err });
                    continue;
                };
            }

            // Success!
            downloaded = true;
            archive_path = temp_archive_path;
            used_format = format;
            break;
        }

        if (!downloaded) {
            return error.DownloadFailed;
        }
        defer self.allocator.free(archive_path);

        // Show "extracting..." status if inline progress is enabled
        if (options.inline_progress) |progress_opts| {
            const lines_up = progress_opts.total_deps - progress_opts.line_offset;
            std.debug.print("\x1b[{d}A\r\x1b[K{s}+{s} {s}@{s}{s}{s} {s}(extracting...){s}\n", .{
                lines_up,
                progress_opts.dim_str,
                "\x1b[0m",
                progress_opts.pkg_name,
                progress_opts.dim_str,
                progress_opts.italic_str,
                progress_opts.pkg_version,
                progress_opts.dim_str,
                "\x1b[0m",
            });
            if (progress_opts.line_offset < progress_opts.total_deps - 1) {
                std.debug.print("\x1b[{d}B", .{lines_up - 1});
            }
        }

        // Extract archive to temp directory
        const extract_dir = try std.fmt.allocPrint(
            self.allocator,
            "{s}/extracted",
            .{temp_dir},
        );
        defer self.allocator.free(extract_dir);

        try std.fs.cwd().makePath(extract_dir);
        try extractor.extractArchiveQuiet(self.allocator, archive_path, extract_dir, used_format, options.quiet);

        // Find the actual package root (might be nested like domain/v{version}/)
        const package_source = try self.findPackageRoot(extract_dir, domain, spec.version);
        defer self.allocator.free(package_source);

        // Copy/move package contents to global cache location
        try std.fs.cwd().makePath(global_pkg_dir);
        try self.copyDirectoryStructure(package_source, global_pkg_dir);

        // Fix library paths for macOS (especially for Node.js OpenSSL issue)
        try libfixer.fixDirectoryLibraryPaths(self.allocator, global_pkg_dir);

        // Now create symlinks in the environment bin directory
        try self.createEnvSymlinks(domain, spec.version, global_pkg_dir);

        // Return the global package directory path
        return global_pkg_dir;
    }

    /// Create symlinks for package binaries in the global bin directory
    fn createBinSymlinks(self: *Installer, domain: []const u8, version: []const u8, install_dir: []const u8) !void {
        // Get package info to find which programs to symlink
        const pkg_registry = @import("../packages/generated.zig");
        const pkg_info = pkg_registry.getPackageByName(domain) orelse return;

        if (pkg_info.programs.len == 0) return;

        // Create global bin directory
        const bin_dir = try std.fmt.allocPrint(
            self.allocator,
            "{s}/bin",
            .{self.data_dir},
        );
        defer self.allocator.free(bin_dir);

        try std.fs.cwd().makePath(bin_dir);

        // The actual binaries are in {install_dir}/{domain}/v{version}/bin/
        const actual_bin_dir = try std.fmt.allocPrint(
            self.allocator,
            "{s}/{s}/v{s}/bin",
            .{ install_dir, domain, version },
        );
        defer self.allocator.free(actual_bin_dir);

        // Create symlinks for each program
        for (pkg_info.programs) |program| {
            const source = try std.fmt.allocPrint(
                self.allocator,
                "{s}/{s}",
                .{ actual_bin_dir, program },
            );
            defer self.allocator.free(source);

            const link = try std.fmt.allocPrint(
                self.allocator,
                "{s}/{s}",
                .{ bin_dir, program },
            );
            defer self.allocator.free(link);

            // Check if source exists
            std.fs.accessAbsolute(source, .{}) catch |err| {
                if (err == error.FileNotFound) {
                    std.debug.print("Warning: Program not found: {s}\n", .{source});
                    continue;
                }
                return err;
            };

            // Remove existing symlink if it exists
            std.fs.deleteFileAbsolute(link) catch {};

            // Create symlink
            std.fs.symLinkAbsolute(source, link, .{}) catch |err| {
                std.debug.print("Warning: Failed to create symlink for {s}: {}\n", .{ program, err });
            };
        }
    }

    /// Get installation directory for package
    fn getInstallDir(self: *Installer, name: []const u8, version: []const u8) ![]const u8 {
        return std.fmt.allocPrint(
            self.allocator,
            "{s}/packages/{s}/{s}",
            .{ self.data_dir, name, version },
        );
    }

    /// Uninstall a package
    pub fn uninstall(self: *Installer, name: []const u8, version: []const u8) !void {
        const install_dir = try self.getInstallDir(name, version);
        defer self.allocator.free(install_dir);

        // Remove installation directory
        std.fs.cwd().deleteTree(install_dir) catch |err| switch (err) {
            error.FileNotFound => return,
            else => return err,
        };
    }

    /// List installed packages
    pub fn listInstalled(self: *Installer) !std.ArrayList(packages.InstalledPackage) {
        var installed = try std.ArrayList(packages.InstalledPackage).initCapacity(self.allocator, 16);
        errdefer installed.deinit(self.allocator);

        const packages_dir = try std.fmt.allocPrint(
            self.allocator,
            "{s}/packages",
            .{self.data_dir},
        );
        defer self.allocator.free(packages_dir);

        var dir = std.fs.cwd().openDir(packages_dir, .{ .iterate = true }) catch |err| switch (err) {
            error.FileNotFound => return installed,
            else => return err,
        };
        defer dir.close();

        var it = dir.iterate();
        while (try it.next()) |entry| {
            if (entry.kind != .directory) continue;

            // Each package has its own directory with version subdirectories
            var pkg_dir = try dir.openDir(entry.name, .{ .iterate = true });
            defer pkg_dir.close();

            var ver_it = pkg_dir.iterate();
            while (try ver_it.next()) |ver_entry| {
                if (ver_entry.kind != .directory) continue;

                const install_path = try std.fmt.allocPrint(
                    self.allocator,
                    "{s}/{s}/{s}",
                    .{ packages_dir, entry.name, ver_entry.name },
                );

                const stat = try pkg_dir.statFile(ver_entry.name);

                try installed.append(self.allocator, .{
                    .name = try self.allocator.dupe(u8, entry.name),
                    .version = try self.allocator.dupe(u8, ver_entry.name),
                    .install_path = install_path,
                    .installed_at = @intCast(stat.ctime),
                    .size = @intCast(stat.size),
                });
            }
        }

        return installed;
    }

    /// Find the actual package root in the extracted directory
    fn findPackageRoot(self: *Installer, extract_dir: []const u8, domain: []const u8, version: []const u8) ![]const u8 {
        // Try common package layouts:
        // 1. Direct pkgx format: {domain}/v{version}/
        const pkgx_path = try std.fmt.allocPrint(
            self.allocator,
            "{s}/{s}/v{s}",
            .{ extract_dir, domain, version },
        );

        // Check if this path has the package structure (bin, lib, etc.)
        if (self.hasPackageStructure(pkgx_path)) {
            return pkgx_path;
        }
        self.allocator.free(pkgx_path);

        // 2. Try just the extract directory itself
        if (self.hasPackageStructure(extract_dir)) {
            return try self.allocator.dupe(u8, extract_dir);
        }

        // 3. Try first subdirectory
        var dir = try std.fs.openDirAbsolute(extract_dir, .{ .iterate = true });
        defer dir.close();

        var it = dir.iterate();
        while (try it.next()) |entry| {
            if (entry.kind != .directory) continue;

            const subdir_path = try std.fs.path.join(
                self.allocator,
                &[_][]const u8{ extract_dir, entry.name },
            );
            defer self.allocator.free(subdir_path);

            if (self.hasPackageStructure(subdir_path)) {
                return try self.allocator.dupe(u8, subdir_path);
            }
        }

        // Fallback to extract directory
        return try self.allocator.dupe(u8, extract_dir);
    }

    /// Check if a directory has package structure (bin, lib, include, share, etc.)
    fn hasPackageStructure(self: *Installer, dir_path: []const u8) bool {
        _ = self;
        var dir = std.fs.openDirAbsolute(dir_path, .{ .iterate = true }) catch return false;
        defer dir.close();

        var it = dir.iterate();
        while (it.next() catch return false) |entry| {
            if (entry.kind != .directory) continue;

            // Check for common package directories
            if (std.mem.eql(u8, entry.name, "bin") or
                std.mem.eql(u8, entry.name, "lib") or
                std.mem.eql(u8, entry.name, "include") or
                std.mem.eql(u8, entry.name, "share") or
                std.mem.eql(u8, entry.name, "sbin"))
            {
                return true;
            }
        }

        return false;
    }

    /// Copy directory structure from source to destination
    fn copyDirectoryStructure(self: *Installer, source: []const u8, dest: []const u8) !void {
        var src_dir = try std.fs.openDirAbsolute(source, .{ .iterate = true });
        defer src_dir.close();

        // Ensure destination exists
        try std.fs.cwd().makePath(dest);

        var it = src_dir.iterate();
        while (try it.next()) |entry| {
            const src_path = try std.fs.path.join(
                self.allocator,
                &[_][]const u8{ source, entry.name },
            );
            defer self.allocator.free(src_path);

            const dst_path = try std.fs.path.join(
                self.allocator,
                &[_][]const u8{ dest, entry.name },
            );
            defer self.allocator.free(dst_path);

            if (entry.kind == .directory) {
                // Recursively copy directory
                try self.copyDirectoryStructure(src_path, dst_path);
            } else {
                // Copy file
                try std.fs.copyFileAbsolute(src_path, dst_path, .{});
            }
        }
    }

    /// Install package dependencies recursively
    fn installDependencies(self: *Installer, dependencies: []const []const u8, options: InstallOptions) !void {
        if (dependencies.len == 0) return;

        // Track if any critical dependency failed
        var has_critical_failure = false;
        var first_error: ?anyerror = null;

        for (dependencies) |dep_str| {
            // Check if this is an optional dependency (ends with # comment)
            const is_optional = std.mem.indexOf(u8, dep_str, "#") != null;

            // Skip platform-specific dependencies that don't apply
            if (std.mem.startsWith(u8, dep_str, "linux:") or
                std.mem.startsWith(u8, dep_str, "darwin:") or
                std.mem.startsWith(u8, dep_str, "windows:"))
            {
                // Parse platform prefix
                const colon_pos = std.mem.indexOf(u8, dep_str, ":") orelse continue;
                const platform = dep_str[0..colon_pos];
                const actual_dep = dep_str[colon_pos + 1 ..];

                // Check if this platform applies to us
                const Platform = @import("../core/platform.zig").Platform;
                const current_platform = Platform.current();
                const matches = blk: {
                    if (std.mem.eql(u8, platform, "linux:") and current_platform == .linux) break :blk true;
                    if (std.mem.eql(u8, platform, "darwin:") and current_platform == .darwin) break :blk true;
                    if (std.mem.eql(u8, platform, "windows:") and current_platform == .windows) break :blk true;
                    break :blk false;
                };

                if (!matches) continue;

                // Install the actual dependency
                self.installDependency(actual_dep, options) catch |err| {
                    std.debug.print("  ! Failed to install dependency {s}: {}\n", .{ actual_dep, err });
                    if (!is_optional and !has_critical_failure) {
                        has_critical_failure = true;
                        first_error = err;
                    }
                };
            } else {
                // Regular dependency
                self.installDependency(dep_str, options) catch |err| {
                    std.debug.print("  ! Failed to install dependency {s}: {}\n", .{ dep_str, err });
                    if (!is_optional and !has_critical_failure) {
                        has_critical_failure = true;
                        first_error = err;
                    }
                };
            }
        }

        // If any critical dependency failed, propagate the error
        if (has_critical_failure) {
            if (first_error) |err| {
                return err;
            }
        }
    }

    /// Install a single dependency
    fn installDependency(self: *Installer, dep_str: []const u8, options: InstallOptions) anyerror!void {
        // Strip out comment if present (e.g., "pkg^1.0 # comment" -> "pkg^1.0")
        const dep_without_comment = blk: {
            if (std.mem.indexOf(u8, dep_str, "#")) |comment_pos| {
                // Trim whitespace before the comment
                var end = comment_pos;
                while (end > 0 and dep_str[end - 1] == ' ') {
                    end -= 1;
                }
                break :blk dep_str[0..end];
            }
            break :blk dep_str;
        };

        // Parse dependency string (name@version or name^version, etc.)
        const at_pos = std.mem.indexOfAny(u8, dep_without_comment, "@^~>=<");
        const name = if (at_pos) |pos| dep_without_comment[0..pos] else dep_without_comment;
        const raw_version = if (at_pos) |pos| dep_without_comment[pos..] else "latest";

        // Normalize @X and @X.Y to ^X and ^X.Y (treat @ as caret for major/minor versions)
        var version_owned: ?[]const u8 = null;
        defer if (version_owned) |v| self.allocator.free(v);

        const version = blk: {
            if (std.mem.startsWith(u8, raw_version, "@")) {
                const ver_without_at = raw_version[1..];
                // Count dots to see if it's @X or @X.Y (not @X.Y.Z)
                var dot_count: usize = 0;
                for (ver_without_at) |c| {
                    if (c == '.') dot_count += 1;
                }
                // If @X or @X.Y, convert to caret
                if (dot_count < 2) {
                    const normalized = try std.fmt.allocPrint(self.allocator, "^{s}", .{ver_without_at});
                    version_owned = normalized;
                    break :blk normalized;
                }
            }
            break :blk raw_version;
        };

        // Check if already installed to avoid infinite recursion
        const pkg_registry = @import("../packages/generated.zig");
        const pkg_info = pkg_registry.getPackageByName(name) orelse {
            // Package not in registry, skip
            return;
        };

        const domain = pkg_info.domain;

        // Resolve version
        const resolved_version = semver.resolveVersion(domain, version) orelse {
            std.debug.print("  ! Could not resolve version for {s}{s}\n", .{ name, version });
            return error.VersionNotFound;
        };

        // Check if already installed
        const global_pkg_dir = try self.getGlobalPackageDir(domain, resolved_version);
        defer self.allocator.free(global_pkg_dir);

        var check_dir = std.fs.cwd().openDir(global_pkg_dir, .{}) catch |err| {
            if (err != error.FileNotFound) return err;
            // Not installed, continue
            const spec = PackageSpec{
                .name = name,
                .version = resolved_version,
            };

            std.debug.print("    → Installing dependency: {s}@{s}\n", .{ name, resolved_version });

            // Install the dependency (this will recursively install its dependencies)
            const result = self.install(spec, options) catch |e| {
                std.debug.print("  ! Failed to install dependency: {}\n", .{e});
                return e;
            };
            var mut_result = result;
            defer mut_result.deinit(self.allocator);
            return;
        };
        check_dir.close();

        // Already installed, skip
        std.debug.print("    ✓ Dependency already installed: {s}@{s}\n", .{ name, resolved_version });
    }
};

test "Installer basic operations" {
    const allocator = std.testing.allocator;

    var pkg_cache = try PackageCache.init(allocator);
    defer pkg_cache.deinit();

    var installer = try Installer.init(allocator, &pkg_cache);
    defer installer.deinit();

    // Create a test package spec
    const spec = PackageSpec{
        .name = "test-pkg",
        .version = "1.0.0",
    };

    // Test installation (will create directory)
    var result = try installer.install(spec, .{});
    defer result.deinit(allocator);

    try std.testing.expect(result.install_path.len > 0);
    try std.testing.expectEqualStrings("test-pkg", result.name);
    try std.testing.expectEqualStrings("1.0.0", result.version);

    // Clean up
    try installer.uninstall("test-pkg", "1.0.0");
}
