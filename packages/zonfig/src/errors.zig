const std = @import("std");

/// Zonfig error types
pub const ZonfigError = error{
    // File errors
    ConfigFileNotFound,
    ConfigFileInvalid,
    ConfigFilePermissionDenied,
    ConfigFileSyntaxError,

    // Validation errors
    ConfigValidationFailed,
    ConfigSchemaViolation,

    // Environment errors
    EnvVarParseError,

    // Merge errors
    CircularReferenceDetected,
    MergeStrategyInvalid,

    // Cache errors
    CacheError,
};

/// Error information with context
pub const ErrorInfo = struct {
    code: []const u8,
    message: []const u8,
    context: ?[]const u8 = null,
    retryable: bool = false,

    pub fn deinit(self: *ErrorInfo, allocator: std.mem.Allocator) void {
        allocator.free(self.code);
        allocator.free(self.message);
        if (self.context) |ctx| {
            allocator.free(ctx);
        }
    }
};

/// Create error info from error type
pub fn createError(
    allocator: std.mem.Allocator,
    err: ZonfigError,
    context: ?[]const u8,
) !ErrorInfo {
    const code = try allocator.dupe(u8, @errorName(err));
    const message = try allocator.dupe(u8, getErrorMessage(err));
    const ctx = if (context) |c| try allocator.dupe(u8, c) else null;

    return ErrorInfo{
        .code = code,
        .message = message,
        .context = ctx,
        .retryable = isRetryable(err),
    };
}

/// Get human-readable error message
pub fn getErrorMessage(err: ZonfigError) []const u8 {
    return switch (err) {
        error.ConfigFileNotFound => "Configuration file not found",
        error.ConfigFileInvalid => "Configuration file is invalid",
        error.ConfigFilePermissionDenied => "Permission denied accessing configuration file",
        error.ConfigFileSyntaxError => "Syntax error in configuration file",
        error.ConfigValidationFailed => "Configuration validation failed",
        error.ConfigSchemaViolation => "Configuration violates schema",
        error.EnvVarParseError => "Failed to parse environment variable",
        error.CircularReferenceDetected => "Circular reference detected in configuration",
        error.MergeStrategyInvalid => "Invalid merge strategy",
        error.CacheError => "Cache operation failed",
    };
}

/// Check if error is retryable
pub fn isRetryable(err: ZonfigError) bool {
    return switch (err) {
        error.ConfigFileNotFound => false,
        error.ConfigFileInvalid => false,
        error.ConfigFilePermissionDenied => true, // Might be temporary
        error.ConfigFileSyntaxError => false,
        error.ConfigValidationFailed => false,
        error.ConfigSchemaViolation => false,
        error.EnvVarParseError => false,
        error.CircularReferenceDetected => false,
        error.MergeStrategyInvalid => false,
        error.CacheError => true, // Cache errors might be transient
    };
}

test "createError allocates and populates ErrorInfo" {
    const allocator = std.testing.allocator;

    var error_info = try createError(allocator, error.ConfigFileNotFound, "test.json");
    defer error_info.deinit(allocator);

    try std.testing.expectEqualStrings("ConfigFileNotFound", error_info.code);
    try std.testing.expectEqualStrings("Configuration file not found", error_info.message);
    try std.testing.expect(error_info.context != null);
    try std.testing.expectEqualStrings("test.json", error_info.context.?);
    try std.testing.expectEqual(false, error_info.retryable);
}

test "getErrorMessage returns correct messages" {
    try std.testing.expectEqualStrings(
        "Configuration file not found",
        getErrorMessage(error.ConfigFileNotFound),
    );
    try std.testing.expectEqualStrings(
        "Circular reference detected in configuration",
        getErrorMessage(error.CircularReferenceDetected),
    );
}

test "isRetryable returns correct values" {
    try std.testing.expectEqual(false, isRetryable(error.ConfigFileNotFound));
    try std.testing.expectEqual(true, isRetryable(error.ConfigFilePermissionDenied));
    try std.testing.expectEqual(true, isRetryable(error.CacheError));
}
