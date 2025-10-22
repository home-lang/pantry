const std = @import("std");

// Core modules
pub const errors = @import("errors.zig");
pub const types = @import("types.zig");
pub const merge = @import("merge.zig");
pub const config_loader = @import("config_loader.zig");

// Services
pub const FileLoader = @import("services/file_loader.zig").FileLoader;
pub const EnvProcessor = @import("services/env_processor.zig").EnvProcessor;

// Re-export commonly used types
pub const ZonfigError = errors.ZonfigError;
pub const ErrorInfo = errors.ErrorInfo;
pub const ConfigSource = types.ConfigSource;
pub const MergeStrategy = types.MergeStrategy;
pub const LoadOptions = types.LoadOptions;
pub const ConfigResult = types.ConfigResult;
pub const SourceInfo = types.SourceInfo;
pub const MergeOptions = types.MergeOptions;

// Main API
pub const loadConfig = config_loader.loadConfig;
pub const tryLoadConfig = config_loader.tryLoadConfig;
pub const deepMerge = merge.deepMerge;

test "zonfig exports" {
    // Verify all types are exported correctly
    const testing = std.testing;

    try testing.expect(@TypeOf(ZonfigError) == type);
    try testing.expect(@TypeOf(ConfigSource) == type);
    try testing.expect(@TypeOf(MergeStrategy) == type);
    try testing.expect(@TypeOf(loadConfig) == @TypeOf(config_loader.loadConfig));
}

test {
    // Run all tests from submodules
    std.testing.refAllDecls(@This());
    std.testing.refAllDecls(errors);
    std.testing.refAllDecls(types);
    std.testing.refAllDecls(merge);
    std.testing.refAllDecls(config_loader);
    std.testing.refAllDecls(FileLoader);
    std.testing.refAllDecls(EnvProcessor);
}
