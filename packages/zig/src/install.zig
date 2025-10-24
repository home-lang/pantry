// Installation module exports
pub const installer = @import("install/installer.zig");

// Re-export main types
pub const Installer = installer.Installer;
pub const InstallOptions = installer.InstallOptions;
pub const InstallResult = installer.InstallResult;
