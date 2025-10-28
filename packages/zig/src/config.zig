const std = @import("std");
const zonfig = @import("zonfig");

// Re-export zonfig for convenience
pub const ConfigResult = zonfig.ConfigResult;
pub const ConfigSource = zonfig.ConfigSource;
pub const MergeStrategy = zonfig.MergeStrategy;
pub const ZonfigError = zonfig.ZonfigError;

// pantry-specific config loader
pub const loader = @import("config/loader.zig");
pub const pantryConfigLoader = loader.pantryConfigLoader;
pub const LoadOptions = loader.LoadOptions;
pub const loadpantryConfig = loader.loadpantryConfig;

// Dependency extraction from config
pub const dependencies = @import("config/dependencies.zig");
pub const extractDependencies = dependencies.extractDependencies;

// Re-export core zonfig functions
pub const loadConfig = zonfig.loadConfig;
pub const tryLoadConfig = zonfig.tryLoadConfig;
pub const deepMerge = zonfig.deepMerge;

test {
    // Run all config tests
    std.testing.refAllDecls(@This());
    std.testing.refAllDecls(loader);
    std.testing.refAllDecls(dependencies);
}
