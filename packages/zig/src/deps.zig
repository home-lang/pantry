// Dependency management module exports
pub const detector = @import("deps/detector.zig");
pub const parser = @import("deps/parser.zig");
pub const global_scanner = @import("deps/global_scanner.zig");
pub const resolver = @import("deps/resolver.zig");
pub const overrides = @import("deps/overrides.zig");
pub const catalogs = @import("deps/catalogs.zig");
pub const resolution = @import("deps/resolution.zig");

// Re-export main types
pub const Dependency = resolver.Dependency;
pub const SortResult = resolver.SortResult;
pub const topologicalSort = resolver.topologicalSort;
pub const OverrideMap = overrides.OverrideMap;
pub const parseOverrides = overrides.parseFromPackageJson;
pub const CatalogManager = catalogs.CatalogManager;
pub const parseCatalogs = catalogs.parseFromPackageJson;

// Re-export resolution types
pub const ResolutionStrategy = resolution.ResolutionStrategy;
pub const ConflictResolver = resolution.ConflictResolver;
pub const PeerDependencyManager = resolution.PeerDependencyManager;
pub const OptionalDependencyManager = resolution.OptionalDependencyManager;
pub const LockFile = resolution.LockFile;
pub const ResolutionContext = resolution.ResolutionContext;
