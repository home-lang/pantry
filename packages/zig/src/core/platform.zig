const std = @import("std");
const builtin = @import("builtin");
const io_helper = @import("../io_helper.zig");

/// Supported platforms
pub const Platform = enum {
    darwin,
    linux,
    windows,
    freebsd,

    /// Get the current platform at compile time
    pub fn current() Platform {
        return switch (builtin.os.tag) {
            .macos => .darwin,
            .linux => .linux,
            .windows => .windows,
            .freebsd => .freebsd,
            else => @compileError("Unsupported platform"),
        };
    }

    /// Get platform name as string
    pub fn name(self: Platform) []const u8 {
        return switch (self) {
            .darwin => "darwin",
            .linux => "linux",
            .windows => "windows",
            .freebsd => "freebsd",
        };
    }

    /// Get platform name as string (alias for name())
    pub fn toString(self: Platform) []const u8 {
        return self.name();
    }

    /// Get platform name in Node.js format
    pub fn toNodeString(self: Platform) []const u8 {
        return switch (self) {
            .darwin => "darwin",
            .linux => "linux",
            .windows => "win",
            .freebsd => "freebsd",
        };
    }

    /// Get platform name in Deno format
    pub fn toDenoString(self: Platform) []const u8 {
        return switch (self) {
            .darwin => "apple-darwin",
            .linux => "unknown-linux-gnu",
            .windows => "pc-windows-msvc",
            .freebsd => "unknown-freebsd",
        };
    }

    /// Get CPU architecture as string (x64, arm64, etc.)
    pub fn arch() ![]const u8 {
        const cpu_arch = Architecture.current();
        return switch (cpu_arch) {
            .aarch64 => "arm64",
            .x86_64 => "x64",
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

/// Platform spelling used by Pantry's native binary registry. It differs
/// from pkgx's architecture spelling and must never substitute another OS.
pub fn binaryRegistryKey(platform: Platform, architecture: Architecture) []const u8 {
    return switch (platform) {
        .darwin => switch (architecture) {
            .aarch64 => "darwin-arm64",
            .x86_64 => "darwin-x86-64",
        },
        .linux => switch (architecture) {
            .aarch64 => "linux-arm64",
            .x86_64 => "linux-x86-64",
        },
        .windows => switch (architecture) {
            .aarch64 => "windows-arm64",
            .x86_64 => "windows-x86-64",
        },
        .freebsd => switch (architecture) {
            .aarch64 => "freebsd-arm64",
            .x86_64 => "freebsd-x86-64",
        },
    };
}

test "binary registry platform: every supported host keeps its operating system" {
    const cases = .{
        .{ Platform.darwin, Architecture.aarch64, "darwin-arm64" },
        .{ Platform.darwin, Architecture.x86_64, "darwin-x86-64" },
        .{ Platform.linux, Architecture.aarch64, "linux-arm64" },
        .{ Platform.linux, Architecture.x86_64, "linux-x86-64" },
        .{ Platform.windows, Architecture.aarch64, "windows-arm64" },
        .{ Platform.windows, Architecture.x86_64, "windows-x86-64" },
        .{ Platform.freebsd, Architecture.aarch64, "freebsd-arm64" },
        .{ Platform.freebsd, Architecture.x86_64, "freebsd-x86-64" },
    };
    inline for (cases) |case| try std.testing.expectEqualStrings(case[2], binaryRegistryKey(case[0], case[1]));
}

/// Path resolution utilities
pub const Paths = struct {
    /// Get user's home directory
    pub fn home(allocator: std.mem.Allocator) ![]const u8 {
        return switch (Platform.current()) {
            .darwin, .linux, .freebsd => blk: {
                if (io_helper.getEnvVarOwned(allocator, "HOME")) |h| {
                    break :blk h;
                } else |_| {
                    // Fallback when HOME is not set (e.g. systemd services, buddy dev)
                    break :blk try allocator.dupe(u8, "/tmp");
                }
            },
            .windows => blk: {
                if (io_helper.getEnvVarOwned(allocator, "USERPROFILE")) |h| {
                    break :blk h;
                } else |_| {
                    break :blk try allocator.dupe(u8, "C:\\Temp");
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
            .linux, .freebsd => blk: {
                // Try XDG_CACHE_HOME first
                if (io_helper.getEnvVarOwned(allocator, "XDG_CACHE_HOME")) |xdg| {
                    defer allocator.free(xdg);
                    break :blk try std.fmt.allocPrint(allocator, "{s}/pantry", .{xdg});
                } else |_| {
                    break :blk try std.fmt.allocPrint(allocator, "{s}/.cache/pantry", .{home_dir});
                }
            },
            .windows => blk: {
                // Prefer LOCALAPPDATA for Windows cache path
                if (io_helper.getEnvVarOwned(allocator, "LOCALAPPDATA")) |local| {
                    defer allocator.free(local);
                    break :blk try std.fmt.allocPrint(allocator, "{s}\\pantry\\cache", .{local});
                } else |_| {
                    break :blk try std.fmt.allocPrint(allocator, "{s}\\AppData\\Local\\pantry\\cache", .{home_dir});
                }
            },
        };
    }

    /// Get data directory path
    pub fn data(allocator: std.mem.Allocator) ![]const u8 {
        const home_dir = try home(allocator);
        defer allocator.free(home_dir);

        return switch (Platform.current()) {
            .darwin => try std.fmt.allocPrint(allocator, "{s}/.local/share/pantry", .{home_dir}),
            .linux, .freebsd => blk: {
                // Try XDG_DATA_HOME first
                if (io_helper.getEnvVarOwned(allocator, "XDG_DATA_HOME")) |xdg| {
                    defer allocator.free(xdg);
                    break :blk try std.fmt.allocPrint(allocator, "{s}/pantry", .{xdg});
                } else |_| {
                    break :blk try std.fmt.allocPrint(allocator, "{s}/.local/share/pantry", .{home_dir});
                }
            },
            .windows => blk: {
                // Prefer LOCALAPPDATA for Windows data path
                if (io_helper.getEnvVarOwned(allocator, "LOCALAPPDATA")) |local| {
                    defer allocator.free(local);
                    break :blk try std.fmt.allocPrint(allocator, "{s}\\pantry\\data", .{local});
                } else |_| {
                    break :blk try std.fmt.allocPrint(allocator, "{s}\\AppData\\Local\\pantry\\data", .{home_dir});
                }
            },
        };
    }

    /// Get the user-level "global" install root.
    ///
    /// All commands that install user-level packages **must** use this so
    /// the location stays in lock-step with the PATH entry the shell hook
    /// installs (see `shell/templates/shell_integration.sh`). Mismatching
    /// these paths means binaries land somewhere PATH never sees, which is
    /// exactly the bug we hit historically (~/.pantry/global vs.
    /// ~/.local/share/pantry/global).
    ///
    /// Layout:
    ///   <data>/global/packages/<name>/v<version>/...   (versioned installs)
    ///   <data>/global/bin/<name>                      (PATH-visible link)
    pub fn globalDir(allocator: std.mem.Allocator) ![]const u8 {
        const data_dir = try Paths.data(allocator);
        defer allocator.free(data_dir);
        return std.fmt.allocPrint(allocator, "{s}/global", .{data_dir});
    }

    /// Bin dir inside `globalDir` — the single location the shell hook puts
    /// on PATH. Use this whenever you need to symlink a freshly installed
    /// binary so users can actually run it.
    pub fn globalBinDir(allocator: std.mem.Allocator) ![]const u8 {
        const root = try Paths.globalDir(allocator);
        defer allocator.free(root);
        return std.fmt.allocPrint(allocator, "{s}/bin", .{root});
    }

    /// Get config directory path
    pub fn config(allocator: std.mem.Allocator) ![]const u8 {
        const home_dir = try home(allocator);
        defer allocator.free(home_dir);

        return switch (Platform.current()) {
            .darwin => try std.fmt.allocPrint(allocator, "{s}/.config/pantry", .{home_dir}),
            .linux, .freebsd => blk: {
                // Try XDG_CONFIG_HOME first
                if (io_helper.getEnvVarOwned(allocator, "XDG_CONFIG_HOME")) |xdg| {
                    defer allocator.free(xdg);
                    break :blk try std.fmt.allocPrint(allocator, "{s}/pantry", .{xdg});
                } else |_| {
                    break :blk try std.fmt.allocPrint(allocator, "{s}/.config/pantry", .{home_dir});
                }
            },
            .windows => blk: {
                // Prefer LOCALAPPDATA for Windows config path
                if (io_helper.getEnvVarOwned(allocator, "LOCALAPPDATA")) |local| {
                    defer allocator.free(local);
                    break :blk try std.fmt.allocPrint(allocator, "{s}\\pantry\\config", .{local});
                } else |_| {
                    break :blk try std.fmt.allocPrint(allocator, "{s}\\AppData\\Local\\pantry\\config", .{home_dir});
                }
            },
        };
    }

    /// Get library environment variable name for current platform
    pub fn libraryPathVar() []const u8 {
        return switch (Platform.current()) {
            .darwin => "DYLD_LIBRARY_PATH",
            .linux, .freebsd => "LD_LIBRARY_PATH",
            .windows => "PATH",
        };
    }

    /// Get path separator for current platform
    pub fn pathSeparator() u8 {
        return switch (Platform.current()) {
            .darwin, .linux, .freebsd => ':',
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
