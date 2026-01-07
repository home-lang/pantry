//! Offline mode support
//!
//! Allows installation from cache when network is unavailable

const std = @import("std");
const lib = @import("../lib.zig");
const io_helper = lib.io_helper;

/// Offline mode configuration
pub const OfflineConfig = struct {
    /// Enable offline mode
    enabled: bool = false,
    /// Fail if package not in cache
    strict: bool = true,
    /// Cache directory
    cache_dir: ?[]const u8 = null,
};

/// Check if we're in offline mode
pub fn isOfflineMode() bool {
    // Check environment variable
    const offline_env = std.posix.getenv("PANTRY_OFFLINE") orelse return false;
    return std.mem.eql(u8, offline_env, "1") or std.mem.eql(u8, offline_env, "true");
}

/// Try to install from cache in offline mode
pub fn installFromCache(
    allocator: std.mem.Allocator,
    package_name: []const u8,
    version: []const u8,
    dest_dir: []const u8,
) !bool {
    const cache_dir = try getCacheDir(allocator);
    defer allocator.free(cache_dir);

    // Check if package exists in cache
    const cached_path = try std.fs.path.join(allocator, &[_][]const u8{
        cache_dir,
        package_name,
        version,
    });
    defer allocator.free(cached_path);

    // Check if directory exists
    io_helper.accessAbsolute(cached_path, .{}) catch {
        std.debug.print("❌ {s}@{s} not found in cache (offline mode)\n", .{ package_name, version });
        return false;
    };

    // Copy from cache to destination
    try copyDir(cached_path, dest_dir);

    std.debug.print("✅ {s}@{s} installed from cache\n", .{ package_name, version });
    return true;
}

/// Get cache directory
fn getCacheDir(allocator: std.mem.Allocator) ![]const u8 {
    const home = try lib.Paths.home(allocator);
    defer allocator.free(home);

    return try std.fs.path.join(allocator, &[_][]const u8{
        home,
        ".pantry",
        "cache",
        "packages",
    });
}

/// Copy directory recursively
fn copyDir(src: []const u8, dest: []const u8) !void {
    // Use std.fs.Dir for iteration and copy (Io.Dir doesn't have iterate() in Zig 0.16)
    var src_dir = try io_helper.openDirAbsoluteForIteration(src);
    defer src_dir.close();

    // Create destination directory
    io_helper.makePath(dest) catch |err| switch (err) {
        error.PathAlreadyExists => {},
        else => return err,
    };

    var dest_dir = try std.fs.openDirAbsolute(dest, .{});
    defer dest_dir.close();

    // Iterate and copy
    var it = src_dir.iterate();
    while (it.next() catch null) |entry| {
        switch (entry.kind) {
            .file => {
                try src_dir.copyFile(entry.name, dest_dir, entry.name, .{});
            },
            .directory => {
                const src_subdir = try std.fs.path.join(
                    std.heap.page_allocator,
                    &[_][]const u8{ src, entry.name },
                );
                defer std.heap.page_allocator.free(src_subdir);

                const dest_subdir = try std.fs.path.join(
                    std.heap.page_allocator,
                    &[_][]const u8{ dest, entry.name },
                );
                defer std.heap.page_allocator.free(dest_subdir);

                try copyDir(src_subdir, dest_subdir);
            },
            else => {},
        }
    }
}

/// Network proxy configuration
pub const ProxyConfig = struct {
    /// HTTP proxy URL
    http_proxy: ?[]const u8 = null,
    /// HTTPS proxy URL
    https_proxy: ?[]const u8 = null,
    /// No proxy hosts
    no_proxy: ?[]const u8 = null,

    /// Load proxy configuration from environment
    pub fn fromEnv() ProxyConfig {
        return .{
            .http_proxy = std.posix.getenv("HTTP_PROXY") orelse std.posix.getenv("http_proxy"),
            .https_proxy = std.posix.getenv("HTTPS_PROXY") orelse std.posix.getenv("https_proxy"),
            .no_proxy = std.posix.getenv("NO_PROXY") orelse std.posix.getenv("no_proxy"),
        };
    }

    /// Check if host should bypass proxy
    pub fn shouldBypass(self: *const ProxyConfig, host: []const u8) bool {
        const no_proxy = self.no_proxy orelse return false;

        // Parse NO_PROXY comma-separated list
        var it = std.mem.split(u8, no_proxy, ",");
        while (it.next()) |pattern| {
            const trimmed = std.mem.trim(u8, pattern, &std.ascii.whitespace);
            if (std.mem.eql(u8, trimmed, "*")) return true;
            if (std.mem.eql(u8, trimmed, host)) return true;
            if (std.mem.endsWith(u8, host, trimmed)) return true;
        }

        return false;
    }
};
