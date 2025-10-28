const std = @import("std");
const core = @import("../core/platform.zig");
const cache = @import("../cache.zig");
const packages = @import("../packages.zig");
const errors = @import("../core/error.zig");
const downloader = @import("downloader.zig");
const extractor = @import("extractor.zig");
const libfixer = @import("libfixer.zig");

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

/// Package installer
pub const Installer = struct {
    /// Package cache
    cache: *PackageCache,
    /// Data directory
    data_dir: []const u8,
    /// Allocator
    allocator: std.mem.Allocator,

    pub fn init(allocator: std.mem.Allocator, pkg_cache: *PackageCache) !Installer {
        const data_dir = try Paths.data(allocator);
        errdefer allocator.free(data_dir);

        return .{
            .cache = pkg_cache,
            .data_dir = data_dir,
            .allocator = allocator,
        };
    }

    pub fn deinit(self: *Installer) void {
        self.allocator.free(self.data_dir);
    }

    /// Install a package
    pub fn install(
        self: *Installer,
        spec: PackageSpec,
        options: InstallOptions,
    ) !InstallResult {
        const start_time = std.time.milliTimestamp();

        // Check if package exists in global cache (filesystem check, not in-memory cache)
        const pkg_registry = @import("../packages/generated.zig");
        const pkg_info = pkg_registry.getPackageByName(spec.name);
        const domain = if (pkg_info) |info| info.domain else spec.name;

        // Determine install location based on whether we have a project root
        const install_path = if (options.project_root) |project_root|
            try self.installToProject(spec, domain, project_root, options)
        else
            try self.installGlobal(spec, domain, options);

        const end_time = std.time.milliTimestamp();

        return InstallResult{
            .name = try self.allocator.dupe(u8, spec.name),
            .version = try self.allocator.dupe(u8, spec.version),
            .install_path = install_path,
            .from_cache = false, // TODO: track cache hits properly
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

        if (from_cache) {
            // Use cached package (from global location)
            return try self.installFromCache(spec, "");
        } else {
            // Download and install to global cache
            return try self.installFromNetwork(spec);
        }
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
        try self.downloadAndInstallToProject(spec, domain, project_pkg_dir);
        try self.createProjectSymlinks(project_root, domain, spec.version, project_pkg_dir);

        return project_pkg_dir;
    }

    /// Download and install package directly to project directory (bypassing global cache)
    fn downloadAndInstallToProject(self: *Installer, spec: PackageSpec, domain: []const u8, project_pkg_dir: []const u8) !void {
        const home = try Paths.home(self.allocator);
        defer self.allocator.free(home);

        const temp_dir = try std.fmt.allocPrint(
            self.allocator,
            "{s}/.local/share/pantry/.tmp/{s}-{s}",
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

            // Try to download
            downloader.downloadFile(self.allocator, url, temp_archive_path) catch |err| {
                self.allocator.free(temp_archive_path);
                std.debug.print("Failed to download {s}: {}\n", .{ url, err });
                continue;
            };

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

        // Extract archive to temp directory
        const extract_dir = try std.fmt.allocPrint(
            self.allocator,
            "{s}/extracted",
            .{temp_dir},
        );
        defer self.allocator.free(extract_dir);

        try std.fs.cwd().makePath(extract_dir);
        try extractor.extractArchive(self.allocator, archive_path, extract_dir, used_format);

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
    /// Uses /usr/local/share/pantry/packages/ for global installations
    fn getGlobalPackageDir(self: *Installer, domain: []const u8, version: []const u8) ![]const u8 {
        return std.fmt.allocPrint(
            self.allocator,
            "/usr/local/share/pantry/packages/{s}/v{s}",
            .{ domain, version },
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
        // Get package info to find which programs to symlink
        const pkg_registry = @import("../packages/generated.zig");
        const pkg_info = pkg_registry.getPackageByName(domain) orelse return;

        if (pkg_info.programs.len == 0) return;

        // Project bin directory (pantry_modules/.bin)
        const project_bin_dir = try std.fmt.allocPrint(
            self.allocator,
            "{s}/pantry_modules/.bin",
            .{project_root},
        );
        defer self.allocator.free(project_bin_dir);

        try std.fs.cwd().makePath(project_bin_dir);

        // Package bin directory
        const pkg_bin_dir = try std.fmt.allocPrint(
            self.allocator,
            "{s}/bin",
            .{package_dir},
        );
        defer self.allocator.free(pkg_bin_dir);

        // Create symlinks for each program
        for (pkg_info.programs) |program| {
            const source = try std.fmt.allocPrint(
                self.allocator,
                "{s}/{s}",
                .{ pkg_bin_dir, program },
            );
            defer self.allocator.free(source);

            const link = try std.fmt.allocPrint(
                self.allocator,
                "{s}/{s}",
                .{ project_bin_dir, program },
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

    /// Install from network (download)
    fn installFromNetwork(self: *Installer, spec: PackageSpec) ![]const u8 {
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
            "{s}/.local/share/pantry/.tmp/{s}-{s}",
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

            // Try to download
            downloader.downloadFile(self.allocator, url, temp_archive_path) catch |err| {
                self.allocator.free(temp_archive_path);
                std.debug.print("Failed to download {s}: {}\n", .{ url, err });
                continue;
            };

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

        // Extract archive to temp directory
        const extract_dir = try std.fmt.allocPrint(
            self.allocator,
            "{s}/extracted",
            .{temp_dir},
        );
        defer self.allocator.free(extract_dir);

        try std.fs.cwd().makePath(extract_dir);
        try extractor.extractArchive(self.allocator, archive_path, extract_dir, used_format);

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
