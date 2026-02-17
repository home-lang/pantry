const std = @import("std");
const zig_config = @import("zig-config");

// Re-export zig-config types and functions
pub const UntypedConfigResult = zig_config.UntypedConfigResult;
pub const ConfigResult = zig_config.ConfigResult;
pub const ConfigSource = zig_config.ConfigSource;
pub const MergeStrategy = zig_config.MergeStrategy;
pub const ZigConfigError = zig_config.ZigConfigError;

// pantry-specific config loader
pub const loader = @import("config/loader.zig");
pub const pantryConfigLoader = loader.pantryConfigLoader;
pub const LoadOptions = loader.LoadOptions;
pub const loadpantryConfig = loader.loadpantryConfig;

// Dependency extraction from config
pub const dependencies = @import("config/dependencies.zig");
pub const extractDependencies = dependencies.extractDependencies;
pub const extractBinPaths = dependencies.extractBinPaths;

// Script extraction from config
pub const scripts = @import("config/scripts.zig");
pub const extractScripts = scripts.extractScripts;
pub const findProjectScripts = scripts.findProjectScripts;

// Service extraction from config
pub const services = @import("config/services.zig");
pub const ServiceConfig = services.ServiceConfig;
pub const extractServices = services.extractServices;
pub const findProjectServices = services.findProjectServices;

// TOML parser
pub const toml_parser = @import("config/toml.zig");

// .npmrc configuration
pub const npmrc = @import("config/npmrc.zig");
pub const NpmrcConfig = npmrc.NpmrcConfig;
pub const loadNpmrc = npmrc.loadNpmrc;

// pantry.toml project configuration
pub const pantry_config = @import("config/pantry_config.zig");
pub const PantryConfig = pantry_config.PantryConfig;
pub const LinkerMode = pantry_config.LinkerMode;
pub const loadPantryToml = pantry_config.loadPantryToml;

// Re-export core zig-config functions
pub const loadConfig = zig_config.loadConfig;
pub const tryLoadConfig = zig_config.tryLoadConfig;
pub const deepMerge = zig_config.deepMerge;

test {
    // Run all config tests
    std.testing.refAllDecls(@This());
    std.testing.refAllDecls(loader);
    std.testing.refAllDecls(dependencies);
    std.testing.refAllDecls(scripts);
    std.testing.refAllDecls(services);
}
