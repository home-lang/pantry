// Package management module exports
pub const types = @import("packages/types.zig");
pub const lockfile = @import("packages/lockfile.zig");
pub const registry = @import("packages/registry.zig");
pub const dep_graph = @import("packages/dep_graph.zig");
pub const filter = @import("packages/filter.zig");
pub const workspace_deps = @import("packages/workspace_deps.zig");
pub const changed_detector = @import("packages/changed_detector.zig");
pub const advanced_glob = @import("packages/advanced_glob.zig");

// Re-export main types
pub const PackageSpec = types.PackageSpec;
pub const PackageInfo = types.PackageInfo;
pub const InstalledPackage = types.InstalledPackage;
pub const PackageSource = types.PackageSource;
pub const Lockfile = types.Lockfile;
pub const LockfileEntry = types.LockfileEntry;

// Re-export lockfile functions
pub const writeLockfile = lockfile.writeLockfile;
pub const readLockfile = lockfile.readLockfile;

// Re-export registry types
pub const PackageRegistry = registry.PackageRegistry;
pub const compareVersions = registry.compareVersions;
pub const satisfiesConstraint = registry.satisfiesConstraint;

// Re-export dependency graph types
pub const DependencyGraph = dep_graph.DependencyGraph;
pub const DependencyNode = dep_graph.DependencyGraph.DependencyNode;
pub const Conflict = dep_graph.DependencyGraph.Conflict;
