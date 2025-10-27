// Package management module exports
pub const types = @import("packages/types.zig");
pub const lockfile = @import("packages/lockfile.zig");

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
