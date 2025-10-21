const std = @import("std");
const core = @import("../core/platform.zig");
const cache = @import("../cache.zig");
const packages = @import("../packages.zig");
const errors = @import("../core/error.zig");

const LaunchpadError = errors.LaunchpadError;
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

        // Check cache first
        const from_cache = !options.force and try self.cache.has(spec.name, spec.version);

        var install_path: []const u8 = undefined;

        if (from_cache) {
            // Use cached package
            const meta = (try self.cache.get(spec.name, spec.version)).?;
            install_path = try self.installFromCache(spec, meta.cache_path);
        } else {
            // Download and install
            install_path = try self.installFromNetwork(spec);
        }

        const end_time = std.time.milliTimestamp();

        return InstallResult{
            .name = try self.allocator.dupe(u8, spec.name),
            .version = try self.allocator.dupe(u8, spec.version),
            .install_path = install_path,
            .from_cache = from_cache,
            .install_time_ms = @intCast(end_time - start_time),
        };
    }

    /// Install from cached package
    fn installFromCache(
        self: *Installer,
        spec: PackageSpec,
        cache_path: []const u8,
    ) ![]const u8 {
        const install_dir = try self.getInstallDir(spec.name, spec.version);
        errdefer self.allocator.free(install_dir);

        // Create install directory
        try std.fs.cwd().makePath(install_dir);

        // For now, just return the install path
        // In a real implementation, we would extract the archive here
        return install_dir;
    }

    /// Install from network (download)
    fn installFromNetwork(self: *Installer, spec: PackageSpec) ![]const u8 {
        const install_dir = try self.getInstallDir(spec.name, spec.version);
        errdefer self.allocator.free(install_dir);

        // Create install directory
        try std.fs.cwd().makePath(install_dir);

        // In a real implementation:
        // 1. Download package from registry
        // 2. Verify checksum
        // 3. Extract archive
        // 4. Store in cache
        // 5. Create symlinks

        return install_dir;
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
        var installed = std.ArrayList(packages.InstalledPackage).init(self.allocator);
        errdefer installed.deinit();

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

                try installed.append(.{
                    .name = try self.allocator.dupe(u8, entry.name),
                    .version = try self.allocator.dupe(u8, ver_entry.name),
                    .install_path = install_path,
                    .installed_at = stat.ctime,
                    .size = @intCast(stat.size),
                });
            }
        }

        return installed;
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
