// Installation module exports
pub const installer = @import("install/installer.zig");
pub const parallel = @import("install/parallel.zig");
pub const validator = @import("install/validator.zig");
pub const symlink = @import("install/symlink.zig");
pub const wrapper = @import("install/wrapper.zig");
pub const rollback = @import("install/rollback.zig");
pub const runtime = @import("install/runtime.zig");
pub const downloader = @import("install/downloader.zig");

// Re-export main types
pub const Installer = installer.Installer;
pub const InstallOptions = installer.InstallOptions;
pub const InstallResult = installer.InstallResult;

// Re-export runtime types
pub const RuntimeInstaller = runtime.RuntimeInstaller;
pub const RuntimeType = runtime.RuntimeType;
pub const RuntimeInstallOptions = runtime.RuntimeInstallOptions;
pub const RuntimeInstallResult = runtime.RuntimeInstallResult;

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

// Re-export symlink types
pub const createBinarySymlink = symlink.createBinarySymlink;
pub const createVersionSymlink = symlink.createVersionSymlink;
pub const createPackageSymlinks = symlink.createPackageSymlinks;
pub const removePackageSymlinks = symlink.removePackageSymlinks;
pub const discoverBinaries = symlink.discoverBinaries;

// Re-export wrapper types
pub const generateShellWrapper = wrapper.generateShellWrapper;
pub const createBinaryWrapper = wrapper.createBinaryWrapper;
pub const createPackageWrappers = wrapper.createPackageWrappers;
pub const generateEnvWrapper = wrapper.generateEnvWrapper;
pub const fixMacOSLibraryPaths = wrapper.fixMacOSLibraryPaths;

// Re-export rollback types
pub const RollbackManager = rollback.RollbackManager;
pub const RollbackAction = rollback.RollbackAction;
