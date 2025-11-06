//! Version information for Pantry
//!
//! This file contains compile-time version and build information

/// Pantry version string
pub const version = "0.1.0"; // Will be overridden by build.zig

/// Git commit hash (short)
pub const commit_hash = "unknown"; // Will be overridden by build.zig

/// Full version string with commit hash
pub fn fullVersion() []const u8 {
    return version ++ " (" ++ commit_hash ++ ")";
}
