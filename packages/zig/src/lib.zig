// Launchpad - Modern dependency manager (Zig implementation)
// Main library exports

pub const core = @import("core/platform.zig");
pub const string = @import("core/string.zig");
pub const errors = @import("core/error.zig");
pub const path = @import("core/path.zig");
pub const cache = @import("cache.zig");
pub const packages = @import("packages.zig");
pub const env = @import("env.zig");
pub const shell = @import("shell.zig");
pub const install = @import("install.zig");
pub const config = @import("config.zig");
pub const commands = @import("cli/commands.zig");
pub const deps = @import("deps.zig");
pub const benchmark = @import("benchmark.zig");

// Re-export commonly used types
pub const Platform = core.Platform;
pub const Architecture = core.Architecture;
pub const Paths = core.Paths;
pub const LaunchpadError = errors.LaunchpadError;
pub const ErrorContext = errors.ErrorContext;
pub const EnvCache = cache.EnvCache;
pub const PackageCache = cache.PackageCache;
pub const ConfigResult = config.ConfigResult;
pub const loadLaunchpadConfig = config.loadLaunchpadConfig;

test {
    @import("std").testing.refAllDecls(@This());
}
