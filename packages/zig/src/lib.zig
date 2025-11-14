// pantry - Modern dependency manager (Zig implementation)
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
pub const services = @import("services.zig");
pub const lifecycle = @import("lifecycle.zig");
pub const utils = struct {
    pub const jsonc = @import("utils/jsonc.zig");
};
pub const auth = struct {
    pub const oidc = @import("auth/oidc.zig");
    pub const signing = @import("auth/signing.zig");
    pub const registry = @import("auth/registry.zig");
    pub const policy = @import("auth/policy.zig");
};
pub const registry = struct {
    pub const core = @import("registry/core.zig");
    pub const npm = @import("registry/npm.zig");
    pub const custom = @import("registry/custom.zig");
};
pub const workspace = @import("workspace.zig");

// Re-export commonly used types
pub const Platform = core.Platform;
pub const Architecture = core.Architecture;
pub const Paths = core.Paths;
pub const pantryError = errors.pantryError;
pub const ErrorContext = errors.ErrorContext;
pub const EnvCache = cache.EnvCache;
pub const PackageCache = cache.PackageCache;
pub const ConfigResult = config.ConfigResult;
pub const loadpantryConfig = config.loadpantryConfig;

test {
    @import("std").testing.refAllDecls(@This());
}
