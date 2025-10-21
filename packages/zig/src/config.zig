const std = @import("std");
const zonfig = @import("zonfig");

// Re-export zonfig for convenience
pub const ConfigResult = zonfig.ConfigResult;
pub const ConfigSource = zonfig.ConfigSource;
pub const MergeStrategy = zonfig.MergeStrategy;
pub const ZonfigError = zonfig.ZonfigError;

// Launchpad-specific config loader
pub const loader = @import("config/loader.zig");
pub const LaunchpadConfigLoader = loader.LaunchpadConfigLoader;
pub const LoadOptions = loader.LoadOptions;
pub const loadLaunchpadConfig = loader.loadLaunchpadConfig;

// Re-export core zonfig functions
pub const loadConfig = zonfig.loadConfig;
pub const tryLoadConfig = zonfig.tryLoadConfig;
pub const deepMerge = zonfig.deepMerge;

test {
    // Run all config tests
    std.testing.refAllDecls(@This());
    std.testing.refAllDecls(loader);
}
