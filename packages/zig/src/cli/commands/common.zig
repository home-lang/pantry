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
// Dependency Types
// ============================================================================

pub const DependencyType = enum {
    normal,
    dev,
    peer,
    optional,
};

pub const DependencyInfo = struct {
    version: []const u8,
    dep_type: DependencyType,
};

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

        std.Io.Dir.cwd().access(full_path, .{}) catch continue;

        return try allocator.dupe(u8, full_path);
    }

    return error.ConfigNotFound;
}

/// Read and parse config file with JSONC support
pub fn readConfigFile(allocator: std.mem.Allocator, config_path: []const u8) !std.json.Parsed(std.json.Value) {
    // Read file
    const config_content = try std.Io.Dir.cwd().readFileAlloc(config_path, allocator, std.Io.Limit.limited(1024 * 1024));
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

/// Extract all dependencies from parsed config with their types
pub fn extractAllDependencies(
    allocator: std.mem.Allocator,
    parsed: std.json.Parsed(std.json.Value),
) !std.StringHashMap(DependencyInfo) {
    var deps_map = std.StringHashMap(DependencyInfo).init(allocator);
    errdefer deps_map.deinit();

    const root = parsed.value.object;

    // Process each dependency type
    const dep_types = [_]struct {
        key: []const u8,
        dep_type: DependencyType,
    }{
        .{ .key = "dependencies", .dep_type = .normal },
        .{ .key = "devDependencies", .dep_type = .dev },
        .{ .key = "peerDependencies", .dep_type = .peer },
        .{ .key = "optionalDependencies", .dep_type = .optional },
    };

    for (dep_types) |dt| {
        if (root.get(dt.key)) |deps_val| {
            if (deps_val != .object) continue;

            var it = deps_val.object.iterator();
            while (it.next()) |entry| {
                const name = try allocator.dupe(u8, entry.key_ptr.*);
                errdefer allocator.free(name);

                const version = switch (entry.value_ptr.*) {
                    .string => |s| s,
                    else => "unknown",
                };

                try deps_map.put(name, .{
                    .version = version,
                    .dep_type = dt.dep_type,
                });
            }
        }
    }

    return deps_map;
}
