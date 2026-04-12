//! Version information for Pantry
//!
//! This file provides compile-time fallback values for version and commit hash.
//! At build time, `build.zig` generates an `options` module that overrides these
//! constants with the real version (from package.json) and the actual git commit
//! hash. When building outside of the full build system (e.g. standalone ast-check
//! or editor tooling), these defaults are used instead.

/// Pantry version string
pub const version = "0.1.0"; // Will be overridden by build.zig

/// Git commit hash (short)
pub const commit_hash = "unknown"; // Will be overridden by build.zig

/// Full version string with commit hash
pub fn fullVersion() []const u8 {
    return version ++ " (" ++ commit_hash ++ ")";
}
