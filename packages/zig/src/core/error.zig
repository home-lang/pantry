const std = @import("std");

/// Comprehensive error types for pantry operations
pub const pantryError = error{
    // File system errors
    FileNotFound,
    DirectoryNotFound,
    PermissionDenied,
    DiskFull,
    PathTooLong,

    // Cache errors
    CacheCorrupted,
    CacheReadFailed,
    CacheWriteFailed,
    CacheLockTimeout,

    // Package errors
    PackageNotFound,
    PackageVersionNotFound,
    PackageDownloadFailed,
    PackageExtractionFailed,
    PackageCorrupted,
    PackageAlreadyInstalled,

    // Dependency errors
    DependencyResolutionFailed,
    DependencyConflict,
    CircularDependency,
    DependencyFileInvalid,

    // Environment errors
    EnvironmentNotFound,
    EnvironmentCorrupted,
    EnvironmentActivationFailed,
    EnvironmentHashMismatch,

    // Configuration errors
    ConfigFileInvalid,
    ConfigFileNotFound,
    ConfigValidationFailed,

    // Network errors
    NetworkUnavailable,
    DownloadTimeout,
    ConnectionFailed,
    InvalidUrl,

    // Platform errors
    UnsupportedPlatform,
    UnsupportedArchitecture,
    PlatformDetectionFailed,

    // Shell integration errors
    ShellNotSupported,
    ShellConfigFailed,
    ShellHookFailed,

    // Service errors
    ServiceNotFound,
    ServiceStartFailed,
    ServiceStopFailed,
    ServiceAlreadyRunning,
    ServiceNotRunning,

    // General errors
    InvalidArgument,
    InvalidFormat,
    OperationCancelled,
    OutOfMemory,
    Timeout,
    Unknown,

    // System errors
    HomeNotFound,
    SystemCallFailed,
};

/// Format error with context for user-friendly display
pub fn formatError(err: pantryError, allocator: std.mem.Allocator) ![]const u8 {
    return switch (err) {
        // File system errors
        error.FileNotFound => try allocator.dupe(u8, "File not found"),
        error.DirectoryNotFound => try allocator.dupe(u8, "Directory not found"),
        error.PermissionDenied => try allocator.dupe(u8, "Permission denied - try running with elevated privileges"),
        error.DiskFull => try allocator.dupe(u8, "Disk full - free up space and try again"),
        error.PathTooLong => try allocator.dupe(u8, "Path too long"),

        // Cache errors
        error.CacheCorrupted => try allocator.dupe(u8, "Cache is corrupted - run 'pantry cache:clear' to fix"),
        error.CacheReadFailed => try allocator.dupe(u8, "Failed to read from cache"),
        error.CacheWriteFailed => try allocator.dupe(u8, "Failed to write to cache"),
        error.CacheLockTimeout => try allocator.dupe(u8, "Cache lock timeout - another operation may be in progress"),

        // Package errors
        error.PackageNotFound => try allocator.dupe(u8, "Package not found in registry"),
        error.PackageVersionNotFound => try allocator.dupe(u8, "Package version not found"),
        error.PackageDownloadFailed => try allocator.dupe(u8, "Failed to download package"),
        error.PackageExtractionFailed => try allocator.dupe(u8, "Failed to extract package"),
        error.PackageCorrupted => try allocator.dupe(u8, "Package is corrupted - try clearing cache"),
        error.PackageAlreadyInstalled => try allocator.dupe(u8, "Package is already installed"),

        // Dependency errors
        error.DependencyResolutionFailed => try allocator.dupe(u8, "Failed to resolve dependencies"),
        error.DependencyConflict => try allocator.dupe(u8, "Dependency conflict detected"),
        error.CircularDependency => try allocator.dupe(u8, "Circular dependency detected"),
        error.DependencyFileInvalid => try allocator.dupe(u8, "Dependency file is invalid or corrupted"),

        // Environment errors
        error.EnvironmentNotFound => try allocator.dupe(u8, "Environment not found"),
        error.EnvironmentCorrupted => try allocator.dupe(u8, "Environment is corrupted"),
        error.EnvironmentActivationFailed => try allocator.dupe(u8, "Failed to activate environment"),
        error.EnvironmentHashMismatch => try allocator.dupe(u8, "Environment hash mismatch"),

        // Configuration errors
        error.ConfigFileInvalid => try allocator.dupe(u8, "Configuration file is invalid"),
        error.ConfigFileNotFound => try allocator.dupe(u8, "Configuration file not found"),
        error.ConfigValidationFailed => try allocator.dupe(u8, "Configuration validation failed"),

        // Network errors
        error.NetworkUnavailable => try allocator.dupe(u8, "Network unavailable - check your connection"),
        error.DownloadTimeout => try allocator.dupe(u8, "Download timed out - try again"),
        error.ConnectionFailed => try allocator.dupe(u8, "Connection failed"),
        error.InvalidUrl => try allocator.dupe(u8, "Invalid URL"),

        // Platform errors
        error.UnsupportedPlatform => try allocator.dupe(u8, "Platform is not supported"),
        error.UnsupportedArchitecture => try allocator.dupe(u8, "Architecture is not supported"),
        error.PlatformDetectionFailed => try allocator.dupe(u8, "Failed to detect platform"),

        // Shell integration errors
        error.ShellNotSupported => try allocator.dupe(u8, "Shell is not supported"),
        error.ShellConfigFailed => try allocator.dupe(u8, "Failed to configure shell"),
        error.ShellHookFailed => try allocator.dupe(u8, "Shell hook failed"),

        // Service errors
        error.ServiceNotFound => try allocator.dupe(u8, "Service not found"),
        error.ServiceStartFailed => try allocator.dupe(u8, "Failed to start service"),
        error.ServiceStopFailed => try allocator.dupe(u8, "Failed to stop service"),
        error.ServiceAlreadyRunning => try allocator.dupe(u8, "Service is already running"),
        error.ServiceNotRunning => try allocator.dupe(u8, "Service is not running"),

        // General errors
        error.InvalidArgument => try allocator.dupe(u8, "Invalid argument"),
        error.InvalidFormat => try allocator.dupe(u8, "Invalid format"),
        error.OperationCancelled => try allocator.dupe(u8, "Operation cancelled"),
        error.OutOfMemory => try allocator.dupe(u8, "Out of memory"),
        error.Timeout => try allocator.dupe(u8, "Operation timed out"),
        error.Unknown => try allocator.dupe(u8, "Unknown error occurred"),

        // System errors
        error.HomeNotFound => try allocator.dupe(u8, "Could not determine home directory"),
        error.SystemCallFailed => try allocator.dupe(u8, "System call failed"),
    };
}

/// Error context for detailed error reporting
pub const ErrorContext = struct {
    error_type: pantryError,
    message: []const u8,
    file_path: ?[]const u8 = null,
    line: ?usize = null,
    context: ?[]const u8 = null,

    /// Format error with full context
    pub fn format(self: ErrorContext, allocator: std.mem.Allocator) ![]const u8 {
        var list = try std.ArrayList(u8).initCapacity(allocator, 256);
        defer list.deinit(allocator);

        const writer = list.writer(allocator);

        // Error type and message
        const error_msg = try formatError(self.error_type, allocator);
        defer allocator.free(error_msg);
        try writer.print("Error: {s}\n", .{error_msg});

        // Additional message if provided
        if (self.message.len > 0) {
            try writer.print("Details: {s}\n", .{self.message});
        }

        // File path and line if available
        if (self.file_path) |path| {
            if (self.line) |ln| {
                try writer.print("Location: {s}:{d}\n", .{ path, ln });
            } else {
                try writer.print("File: {s}\n", .{path});
            }
        }

        // Additional context if provided
        if (self.context) |ctx| {
            try writer.print("Context: {s}\n", .{ctx});
        }

        return list.toOwnedSlice(allocator);
    }
};

test "formatError" {
    const allocator = std.testing.allocator;

    const msg = try formatError(error.PackageNotFound, allocator);
    defer allocator.free(msg);

    try std.testing.expect(msg.len > 0);
    try std.testing.expect(std.mem.indexOf(u8, msg, "not found") != null);
}

test "ErrorContext format" {
    const allocator = std.testing.allocator;

    const ctx = ErrorContext{
        .error_type = error.CacheCorrupted,
        .message = "Hash mismatch detected",
        .file_path = "/tmp/cache/env.json",
        .line = 42,
        .context = "While reading environment cache",
    };

    const formatted = try ctx.format(allocator);
    defer allocator.free(formatted);

    try std.testing.expect(std.mem.indexOf(u8, formatted, "Error:") != null);
    try std.testing.expect(std.mem.indexOf(u8, formatted, "Hash mismatch") != null);
    try std.testing.expect(std.mem.indexOf(u8, formatted, "/tmp/cache") != null);
}
