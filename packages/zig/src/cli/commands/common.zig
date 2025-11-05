//! Common types and utilities shared across all commands

const std = @import("std");
const lib = @import("../../lib.zig");

// ============================================================================
// Common Error Messages
// ============================================================================

pub const ERROR_NO_CONFIG = "Error: No package.json or pantry.json found";
pub const ERROR_CONFIG_PARSE = "Error: Failed to parse config file";
pub const ERROR_CONFIG_NOT_OBJECT = "Error: Config file must be a JSON object";
pub const ERROR_NO_PACKAGES = "Error: No packages specified";

// ============================================================================
// Command Result Type
// ============================================================================

/// Result returned by all command functions
pub const CommandResult = struct {
    exit_code: u8,
    message: ?[]const u8 = null,

    pub fn deinit(self: *CommandResult, allocator: std.mem.Allocator) void {
        if (self.message) |msg| {
            allocator.free(msg);
        }
    }

    /// Create success result with optional message
    pub fn success(allocator: std.mem.Allocator, message: ?[]const u8) !CommandResult {
        return .{
            .exit_code = 0,
            .message = if (message) |msg| try allocator.dupe(u8, msg) else null,
        };
    }

    /// Create error result with message
    pub fn err(allocator: std.mem.Allocator, message: []const u8) !CommandResult {
        return .{
            .exit_code = 1,
            .message = try allocator.dupe(u8, message),
        };
    }
};

// ============================================================================
// Path Utilities
// ============================================================================

/// Check if a version string is a local filesystem path
pub fn isLocalPath(version: []const u8) bool {
    return std.mem.startsWith(u8, version, "~/") or
        std.mem.startsWith(u8, version, "./") or
        std.mem.startsWith(u8, version, "../") or
        std.mem.startsWith(u8, version, "/");
}

/// Check if a dependency is local (either has local: prefix or is a filesystem path)
pub fn isLocalDependency(dep: lib.deps.parser.PackageDependency) bool {
    return std.mem.startsWith(u8, dep.name, "local:") or
        std.mem.startsWith(u8, dep.name, "auto:") or
        isLocalPath(dep.version);
}

/// Strip display prefixes like "auto:" and "local:" from package names for output
pub fn stripDisplayPrefix(name: []const u8) []const u8 {
    if (std.mem.startsWith(u8, name, "auto:")) {
        return name[5..]; // Skip "auto:"
    } else if (std.mem.startsWith(u8, name, "local:")) {
        return name[6..]; // Skip "local:"
    }
    return name;
}

// ============================================================================
// Config File Utilities
// ============================================================================

/// Find config file (package.json, pantry.json, etc.)
pub fn findConfigFile(allocator: std.mem.Allocator, cwd: []const u8) ![]const u8 {
    const config_files = [_][]const u8{
        "pantry.json",
        "pantry.jsonc",
        "package.json",
        "package.jsonc",
    };

    for (config_files) |config_file| {
        const full_path = try std.fs.path.join(allocator, &[_][]const u8{ cwd, config_file });
        defer allocator.free(full_path);

        std.fs.cwd().access(full_path, .{}) catch continue;

        return try allocator.dupe(u8, full_path);
    }

    return error.ConfigNotFound;
}

/// Read and parse config file with JSONC support
pub fn readConfigFile(allocator: std.mem.Allocator, config_path: []const u8) !std.json.Parsed(std.json.Value) {
    // Read file
    const config_content = try std.fs.cwd().readFileAlloc(allocator, config_path, 1024 * 1024);
    defer allocator.free(config_content);

    // Strip JSONC comments if needed
    const jsonc_util = @import("../../utils/jsonc.zig");
    const is_jsonc = std.mem.endsWith(u8, config_path, ".jsonc");
    const json_content = if (is_jsonc)
        try jsonc_util.stripComments(allocator, config_content)
    else
        try allocator.dupe(u8, config_content);
    defer allocator.free(json_content);

    return try std.json.parseFromSlice(std.json.Value, allocator, json_content, .{});
}
