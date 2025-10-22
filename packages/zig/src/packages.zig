// Package management module exports
pub const types = @import("packages/types.zig");

// Re-export main types
pub const PackageSpec = types.PackageSpec;
pub const PackageInfo = types.PackageInfo;
pub const InstalledPackage = types.InstalledPackage;
