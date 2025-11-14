// Cache module exports
pub const env_cache = @import("cache/env_cache.zig");
pub const package_cache = @import("cache/package_cache.zig");
pub const optimized = @import("cache/optimized.zig");
pub const shared = @import("cache/shared.zig");

// Re-export main types
pub const EnvCache = env_cache.EnvCache;
pub const EnvEntry = env_cache.Entry;
pub const PackageCache = package_cache.PackageCache;
pub const PackageMetadata = package_cache.PackageMetadata;
pub const OptimizedCache = optimized.OptimizedCache;
pub const CacheConfig = optimized.CacheConfig;
pub const CacheStatistics = optimized.CacheStatistics;
pub const SharedCache = shared.SharedCache;
pub const SharedCacheConfig = shared.SharedCacheConfig;
pub const GlobalCache = shared.GlobalCache;
