const std = @import("std");
const builtin = @import("builtin");

/// Supported platforms
pub const Platform = enum {
    darwin,
    linux,
    windows,

    /// Get the current platform at compile time
    pub fn current() Platform {
        return switch (builtin.os.tag) {
            .macos => .darwin,
            .linux => .linux,
            .windows => .windows,
            else => @compileError("Unsupported platform"),
        };
    }

    /// Get platform name as string
    pub fn name(self: Platform) []const u8 {
        return switch (self) {
            .darwin => "darwin",
            .linux => "linux",
            .windows => "windows",
        };
    }
};

/// Supported CPU architectures
pub const Architecture = enum {
    aarch64,
    x86_64,

    /// Get the current architecture at compile time
    pub fn current() Architecture {
        return switch (builtin.cpu.arch) {
            .aarch64 => .aarch64,
            .x86_64 => .x86_64,
            else => @compileError("Unsupported architecture"),
        };
    }

    /// Get architecture name as string
    pub fn name(self: Architecture) []const u8 {
        return switch (self) {
            .aarch64 => "aarch64",
            .x86_64 => "x86_64",
        };
    }
};

/// Path resolution utilities
pub const Paths = struct {
    /// Get user's home directory
    pub fn home(allocator: std.mem.Allocator) ![]const u8 {
        return switch (Platform.current()) {
            .darwin, .linux => blk: {
                if (std.process.getEnvVarOwned(allocator, "HOME")) |h| {
                    break :blk h;
                } else |_| {
                    return error.HomeNotFound;
                }
            },
            .windows => blk: {
                if (std.process.getEnvVarOwned(allocator, "USERPROFILE")) |h| {
                    break :blk h;
                } else |_| {
                    return error.HomeNotFound;
                }
            },
        };
    }

    /// Get cache directory path
    pub fn cache(allocator: std.mem.Allocator) ![]const u8 {
        const home_dir = try home(allocator);
        defer allocator.free(home_dir);

        return switch (Platform.current()) {
            .darwin => try std.fmt.allocPrint(allocator, "{s}/.cache/pantry", .{home_dir}),
            .linux => blk: {
                // Try XDG_CACHE_HOME first
                if (std.process.getEnvVarOwned(allocator, "XDG_CACHE_HOME")) |xdg| {
                    defer allocator.free(xdg);
                    break :blk try std.fmt.allocPrint(allocator, "{s}/pantry", .{xdg});
                } else |_| {
                    break :blk try std.fmt.allocPrint(allocator, "{s}/.cache/pantry", .{home_dir});
                }
            },
            .windows => try std.fmt.allocPrint(allocator, "{s}\\AppData\\Local\\pantry\\cache", .{home_dir}),
        };
    }

    /// Get data directory path
    pub fn data(allocator: std.mem.Allocator) ![]const u8 {
        const home_dir = try home(allocator);
        defer allocator.free(home_dir);

        return switch (Platform.current()) {
            .darwin => try std.fmt.allocPrint(allocator, "{s}/.pantry", .{home_dir}),
            .linux => try std.fmt.allocPrint(allocator, "{s}/.pantry", .{home_dir}),
            .windows => try std.fmt.allocPrint(allocator, "{s}\\AppData\\Local\\pantry\\data", .{home_dir}),
        };
    }

    /// Get config directory path
    pub fn config(allocator: std.mem.Allocator) ![]const u8 {
        const home_dir = try home(allocator);
        defer allocator.free(home_dir);

        return switch (Platform.current()) {
            .darwin => try std.fmt.allocPrint(allocator, "{s}/.config/pantry", .{home_dir}),
            .linux => blk: {
                // Try XDG_CONFIG_HOME first
                if (std.process.getEnvVarOwned(allocator, "XDG_CONFIG_HOME")) |xdg| {
                    defer allocator.free(xdg);
                    break :blk try std.fmt.allocPrint(allocator, "{s}/pantry", .{xdg});
                } else |_| {
                    break :blk try std.fmt.allocPrint(allocator, "{s}/.config/pantry", .{home_dir});
                }
            },
            .windows => try std.fmt.allocPrint(allocator, "{s}\\AppData\\Local\\pantry\\config", .{home_dir}),
        };
    }

    /// Get library environment variable name for current platform
    pub fn libraryPathVar() []const u8 {
        return switch (Platform.current()) {
            .darwin => "DYLD_LIBRARY_PATH",
            .linux => "LD_LIBRARY_PATH",
            .windows => "PATH",
        };
    }

    /// Get path separator for current platform
    pub fn pathSeparator() u8 {
        return switch (Platform.current()) {
            .darwin, .linux => ':',
            .windows => ';',
        };
    }
};

test "Platform detection" {
    const platform = Platform.current();
    const arch = Architecture.current();

    // Just ensure they compile and return valid values
    _ = platform.name();
    _ = arch.name();
}

test "Path resolution" {
    const allocator = std.testing.allocator;

    // Test home directory
    const home_dir = try Paths.home(allocator);
    defer allocator.free(home_dir);
    try std.testing.expect(home_dir.len > 0);

    // Test cache directory
    const cache_dir = try Paths.cache(allocator);
    defer allocator.free(cache_dir);
    try std.testing.expect(cache_dir.len > 0);
    try std.testing.expect(std.mem.indexOf(u8, cache_dir, "pantry") != null);

    // Test data directory
    const data_dir = try Paths.data(allocator);
    defer allocator.free(data_dir);
    try std.testing.expect(data_dir.len > 0);
    try std.testing.expect(std.mem.indexOf(u8, data_dir, "pantry") != null);

    // Test config directory
    const config_dir = try Paths.config(allocator);
    defer allocator.free(config_dir);
    try std.testing.expect(config_dir.len > 0);
    try std.testing.expect(std.mem.indexOf(u8, config_dir, "pantry") != null);
}

test "Library path variables" {
    const lib_var = Paths.libraryPathVar();
    try std.testing.expect(lib_var.len > 0);

    const sep = Paths.pathSeparator();
    try std.testing.expect(sep == ':' or sep == ';');
}
