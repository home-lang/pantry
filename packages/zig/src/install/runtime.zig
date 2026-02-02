const std = @import("std");
const core = @import("../core/platform.zig");
const packages = @import("../packages.zig");
const downloader = @import("downloader.zig");
const extractor = @import("extractor.zig");
const io_helper = @import("../io_helper.zig");

/// Runtime types that can be installed
pub const RuntimeType = enum {
    bun,
    node,
    deno,
    python,

    pub fn fromString(s: []const u8) ?RuntimeType {
        if (std.mem.eql(u8, s, "bun")) return .bun;
        if (std.mem.eql(u8, s, "node")) return .node;
        if (std.mem.eql(u8, s, "deno")) return .deno;
        if (std.mem.eql(u8, s, "python")) return .python;
        return null;
    }

    pub fn toString(self: RuntimeType) []const u8 {
        return switch (self) {
            .bun => "bun",
            .node => "node",
            .deno => "deno",
            .python => "python",
        };
    }

    /// Get the package name in pkgx registry
    pub fn packageName(self: RuntimeType) []const u8 {
        return switch (self) {
            .bun => "bun",
            .node => "node",
            .deno => "deno",
            .python => "python",
        };
    }
};

/// Runtime installation options
pub const RuntimeInstallOptions = struct {
    /// Force reinstall even if already installed
    force: bool = false,
    /// Verbose output
    verbose: bool = false,
    /// Quiet mode
    quiet: bool = false,
};

/// Runtime installation result
pub const RuntimeInstallResult = struct {
    runtime: RuntimeType,
    version: []const u8,
    install_path: []const u8,
    binary_path: []const u8,

    pub fn deinit(self: *RuntimeInstallResult, allocator: std.mem.Allocator) void {
        allocator.free(self.version);
        allocator.free(self.install_path);
        allocator.free(self.binary_path);
    }
};

/// Runtime installer
pub const RuntimeInstaller = struct {
    allocator: std.mem.Allocator,
    runtimes_dir: []const u8,

    pub fn init(allocator: std.mem.Allocator) !RuntimeInstaller {
        const paths = try core.Paths.init(allocator);
        defer paths.deinit(allocator);

        const runtimes_dir = try std.fs.path.join(allocator, &[_][]const u8{
            paths.home,
            ".pantry",
            "runtimes",
        });

        // Ensure runtimes directory exists
        io_helper.makePath(runtimes_dir) catch |err| switch (err) {
            error.PathAlreadyExists => {},
            else => return err,
        };

        return .{
            .allocator = allocator,
            .runtimes_dir = runtimes_dir,
        };
    }

    pub fn deinit(self: *RuntimeInstaller) void {
        self.allocator.free(self.runtimes_dir);
    }

    /// Install a runtime with a specific version
    pub fn install(
        self: *RuntimeInstaller,
        runtime: RuntimeType,
        version: []const u8,
        options: RuntimeInstallOptions,
    ) !RuntimeInstallResult {
        const start_time = @as(i64, @intCast((std.posix.clock_gettime(.REALTIME) catch std.posix.timespec{ .sec = 0, .nsec = 0 }).sec * 1000));

        if (!options.quiet) {
            std.debug.print("📦 Installing {s}@{s}...\n", .{ runtime.toString(), version });
        }

        // Check if already installed
        const install_dir = try self.getRuntimeInstallDir(runtime, version);
        defer self.allocator.free(install_dir);

        const binary_path = try self.getRuntimeBinaryPath(runtime, version);

        if (!options.force) {
            io_helper.accessAbsolute(binary_path, .{}) catch |err| switch (err) {
                error.FileNotFound => {},
                else => {
                    // Already installed
                    if (!options.quiet) {
                        std.debug.print("✓ {s}@{s} already installed\n", .{ runtime.toString(), version });
                    }
                    return RuntimeInstallResult{
                        .runtime = runtime,
                        .version = try self.allocator.dupe(u8, version),
                        .install_path = try self.allocator.dupe(u8, install_dir),
                        .binary_path = binary_path,
                    };
                },
            };
        }

        // Get download URL from pkgx package info
        const download_url = try self.getDownloadUrl(runtime, version);
        defer self.allocator.free(download_url);

        if (options.verbose) {
            std.debug.print("📥 Downloading from: {s}\n", .{download_url});
        }

        // Create temporary download directory
        const temp_dir = try std.fs.path.join(self.allocator, &[_][]const u8{
            self.runtimes_dir,
            ".tmp",
        });
        defer self.allocator.free(temp_dir);

        io_helper.makePath(temp_dir) catch |err| switch (err) {
            error.PathAlreadyExists => {},
            else => return err,
        };

        // Download tarball
        const tarball_name = try std.fmt.allocPrint(self.allocator, "{s}-{s}.tar.gz", .{
            runtime.toString(),
            version,
        });
        defer self.allocator.free(tarball_name);

        const tarball_path = try std.fs.path.join(self.allocator, &[_][]const u8{
            temp_dir,
            tarball_name,
        });
        defer self.allocator.free(tarball_path);

        // Download with progress
        try downloader.downloadFileQuiet(self.allocator, download_url, tarball_path, options.quiet);

        // Extract to install directory
        io_helper.makePath(install_dir) catch |err| switch (err) {
            error.PathAlreadyExists => {
                // Clean existing directory
                io_helper.deleteTree(install_dir) catch {};
                try io_helper.makePath(install_dir);
            },
            else => return err,
        };

        if (options.verbose) {
            std.debug.print("📂 Extracting to: {s}\n", .{install_dir});
        }

        // Extract tarball
        try extractor.extractTarball(self.allocator, tarball_path, install_dir);

        // Clean up tarball
        io_helper.deleteFile(tarball_path) catch {};

        // Verify binary exists
        io_helper.accessAbsolute(binary_path, .{}) catch {
            std.debug.print("❌ Installation failed: binary not found at {s}\n", .{binary_path});
            return error.BinaryNotFound;
        };

        // Make binary executable
        const file = try io_helper.openFileAbsolute(binary_path, .{});
        defer file.close();

        const metadata = try file.metadata();
        var perms = metadata.permissions();
        perms.inner.unixSet(.user, .{ .execute = true });
        perms.inner.unixSet(.group, .{ .execute = true });
        perms.inner.unixSet(.other, .{ .execute = true });
        try file.setPermissions(perms);

        const elapsed_ms = @as(u64, @intCast(@as(i64, @intCast((std.posix.clock_gettime(.REALTIME) catch std.posix.timespec{ .sec = 0, .nsec = 0 }).sec * 1000)) - start_time));

        if (!options.quiet) {
            std.debug.print("✅ {s}@{s} installed ({d}ms)\n", .{
                runtime.toString(),
                version,
                elapsed_ms,
            });
        }

        return RuntimeInstallResult{
            .runtime = runtime,
            .version = try self.allocator.dupe(u8, version),
            .install_path = try self.allocator.dupe(u8, install_dir),
            .binary_path = binary_path,
        };
    }

    /// Get the installation directory for a runtime version
    fn getRuntimeInstallDir(self: *RuntimeInstaller, runtime: RuntimeType, version: []const u8) ![]const u8 {
        return try std.fs.path.join(self.allocator, &[_][]const u8{
            self.runtimes_dir,
            runtime.toString(),
            version,
        });
    }

    /// Get the binary path for a runtime version
    fn getRuntimeBinaryPath(self: *RuntimeInstaller, runtime: RuntimeType, version: []const u8) ![]const u8 {
        const install_dir = try self.getRuntimeInstallDir(runtime, version);
        defer self.allocator.free(install_dir);

        const binary_name = runtime.toString();

        return try std.fs.path.join(self.allocator, &[_][]const u8{
            install_dir,
            "bin",
            binary_name,
        });
    }

    /// Get download URL for runtime version
    fn getDownloadUrl(self: *RuntimeInstaller, runtime: RuntimeType, version: []const u8) ![]const u8 {
        // For now, use direct download URLs from official sources
        // TODO: Query pkgx API for actual download URLs

        const platform = core.Platform.current();
        const arch = try core.Platform.arch();

        return switch (runtime) {
            .bun => try std.fmt.allocPrint(
                self.allocator,
                "https://github.com/oven-sh/bun/releases/download/bun-v{s}/bun-{s}-{s}.zip",
                .{ version, platform.toString(), arch },
            ),
            .node => try std.fmt.allocPrint(
                self.allocator,
                "https://nodejs.org/dist/v{s}/node-v{s}-{s}-{s}.tar.gz",
                .{ version, version, platform.toNodeString(), arch },
            ),
            .deno => try std.fmt.allocPrint(
                self.allocator,
                "https://github.com/denoland/deno/releases/download/v{s}/deno-{s}-{s}.zip",
                .{ version, platform.toDenoString(), arch },
            ),
            .python => try std.fmt.allocPrint(
                self.allocator,
                "https://www.python.org/ftp/python/{s}/Python-{s}.tgz",
                .{ version, version },
            ),
        };
    }

    /// List installed runtime versions
    pub fn listInstalled(self: *RuntimeInstaller, runtime: RuntimeType) ![][]const u8 {
        const runtime_dir = try std.fs.path.join(self.allocator, &[_][]const u8{
            self.runtimes_dir,
            runtime.toString(),
        });
        defer self.allocator.free(runtime_dir);

        var dir = io_helper.openDirAbsolute(runtime_dir, .{ .iterate = true }) catch |err| switch (err) {
            error.FileNotFound => return &[_][]const u8{},
            else => return err,
        };
        defer dir.close(io_helper.io);

        var versions = std.ArrayList([]const u8).init(self.allocator);
        errdefer {
            for (versions.items) |v| self.allocator.free(v);
            versions.deinit();
        }

        var iter = dir.iterate();
        while (try iter.next(io_helper.io)) |entry| {
            if (entry.kind == .directory) {
                const version = try self.allocator.dupe(u8, entry.name);
                try versions.append(version);
            }
        }

        return versions.toOwnedSlice();
    }

    /// Uninstall a runtime version
    pub fn uninstall(self: *RuntimeInstaller, runtime: RuntimeType, version: []const u8) !void {
        const install_dir = try self.getRuntimeInstallDir(runtime, version);
        defer self.allocator.free(install_dir);

        io_helper.deleteTree(install_dir) catch |err| switch (err) {
            error.FileNotFound => {
                std.debug.print("❌ {s}@{s} not installed\n", .{ runtime.toString(), version });
                return error.NotInstalled;
            },
            else => return err,
        };

        std.debug.print("✅ Uninstalled {s}@{s}\n", .{ runtime.toString(), version });
    }
};
