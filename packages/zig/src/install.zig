// Installation module exports
pub const installer = @import("install/installer.zig");
pub const parallel = @import("install/parallel.zig");
pub const validator = @import("install/validator.zig");

// Re-export main types
pub const Installer = installer.Installer;
pub const InstallOptions = installer.InstallOptions;
pub const InstallResult = installer.InstallResult;

// Re-export parallel download types
pub const DownloadTask = parallel.DownloadTask;
pub const DownloadResult = parallel.DownloadResult;
pub const downloadParallel = parallel.downloadParallel;
pub const downloadParallelWithRetry = parallel.downloadParallelWithRetry;

// Re-export validation types
pub const ValidationResult = validator.ValidationResult;
pub const validateInstallation = validator.validateInstallation;
pub const validateBinary = validator.validateBinary;
pub const validateDirectoryStructure = validator.validateDirectoryStructure;
