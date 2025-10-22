// Cache module exports
pub const env_cache = @import("cache/env_cache.zig");
pub const package_cache = @import("cache/package_cache.zig");

// Re-export main types
pub const EnvCache = env_cache.EnvCache;
pub const EnvEntry = env_cache.Entry;
pub const PackageCache = package_cache.PackageCache;
pub const PackageMetadata = package_cache.PackageMetadata;
