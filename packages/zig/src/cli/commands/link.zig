//! Link/Unlink Commands
//!
//! Register and manage locally linked packages, similar to `bun link`.
//!
//! - `pantry link` (no args): Register current directory as a global link
//! - `pantry link <name>`: Link a registered package into the current project
//! - `pantry unlink` (no args): Unregister current directory from global links
//! - `pantry unlink <name>`: Remove a specific global link

const std = @import("std");
const lib = @import("../../lib.zig");
const io_helper = @import("../../io_helper.zig");
const common = @import("common.zig");
const CommandResult = common.CommandResult;

/// Get the global links directory (~/.pantry/links/)
fn getLinksDir(allocator: std.mem.Allocator) ![]const u8 {
    const home = try lib.Paths.home(allocator);
    defer allocator.free(home);
    return try std.fmt.allocPrint(allocator, "{s}/.pantry/links", .{home});
}

/// Get the package name from pantry.json or package.json in the given directory
fn getPackageName(allocator: std.mem.Allocator, dir: []const u8) !?[]const u8 {
    // Try pantry.json first, then fall back to package.json
    const config_files = [_][]const u8{ "pantry.json", "package.json" };
    for (config_files) |config_file| {
        const config_path = try std.fmt.allocPrint(allocator, "{s}/{s}", .{ dir, config_file });
        defer allocator.free(config_path);

        const content = io_helper.readFileAlloc(allocator, config_path, 64 * 1024) catch {
            continue;
        };
        defer allocator.free(content);

        const parsed = std.json.parseFromSlice(std.json.Value, allocator, content, .{}) catch {
            continue;
        };
        defer parsed.deinit();

        if (parsed.value != .object) continue;
        const name_val = parsed.value.object.get("name") orelse continue;
        if (name_val != .string) continue;
        return try allocator.dupe(u8, name_val.string);
    }
    return null;
}

/// Get the basename of a path (last component)
fn basename(path: []const u8) []const u8 {
    if (std.mem.lastIndexOfScalar(u8, path, '/')) |pos| {
        return path[pos + 1 ..];
    }
    return path;
}

/// Register current directory or link a package into the project
pub fn linkCommand(allocator: std.mem.Allocator, name: ?[]const u8) !CommandResult {
    const cwd = try io_helper.getCwdAlloc(allocator);
    defer allocator.free(cwd);

    const links_dir = try getLinksDir(allocator);
    defer allocator.free(links_dir);
    try io_helper.makePath(links_dir);

    if (name) |pkg_name| {
        // Reject path traversal in package names
        if (std.mem.indexOf(u8, pkg_name, "..") != null) {
            return .{ .exit_code = 1, .message = try allocator.dupe(u8, "Invalid package name: contains path traversal") };
        }
        // `pantry link <name>`: Link a registered package into the current project
        const link_path = try std.fmt.allocPrint(allocator, "{s}/{s}", .{ links_dir, pkg_name });
        defer allocator.free(link_path);

        // Read the global link to get source path
        const source_path = io_helper.readLinkAlloc(allocator, link_path) catch {
            return .{
                .exit_code = 1,
                .message = try std.fmt.allocPrint(allocator, "Package '{s}' is not linked globally. Run 'pantry link' in the package directory first.", .{pkg_name}),
            };
        };
        defer allocator.free(source_path);

        // Create pantry/ directory in project root
        const pantry_dir = try std.fmt.allocPrint(allocator, "{s}/pantry", .{cwd});
        defer allocator.free(pantry_dir);
        try io_helper.makePath(pantry_dir);

        // Create symlink: pantry/{name} -> source_path
        const dest_path = try std.fmt.allocPrint(allocator, "{s}/{s}", .{ pantry_dir, pkg_name });
        defer allocator.free(dest_path);

        // Ensure parent directory exists for scoped packages (e.g., @scope/name)
        if (std.fs.path.dirname(dest_path)) |parent| {
            io_helper.makePath(parent) catch {};
        }

        io_helper.deleteFile(dest_path) catch {};
        io_helper.deleteTree(dest_path) catch {};
        io_helper.symLink(source_path, dest_path) catch {
            return .{
                .exit_code = 1,
                .message = try std.fmt.allocPrint(allocator, "Failed to create symlink for '{s}'", .{pkg_name}),
            };
        };

        return .{
            .exit_code = 0,
            .message = try std.fmt.allocPrint(allocator, "Linked {s} -> {s}", .{ pkg_name, source_path }),
        };
    } else {
        // `pantry link` (no args): Register current directory as a global link
        const pkg_name = try getPackageName(allocator, cwd) orelse try allocator.dupe(u8, basename(cwd));
        defer allocator.free(pkg_name);

        const link_path = try std.fmt.allocPrint(allocator, "{s}/{s}", .{ links_dir, pkg_name });
        defer allocator.free(link_path);

        // Ensure parent directory exists for scoped packages (e.g., @scope/name)
        if (std.fs.path.dirname(link_path)) |parent| {
            io_helper.makePath(parent) catch {};
        }

        // Remove existing link if present
        io_helper.deleteFile(link_path) catch {};

        // Create symlink: ~/.pantry/links/{name} -> cwd
        io_helper.symLink(cwd, link_path) catch {
            return .{
                .exit_code = 1,
                .message = try std.fmt.allocPrint(allocator, "Failed to register link for '{s}'", .{pkg_name}),
            };
        };

        return .{
            .exit_code = 0,
            .message = try std.fmt.allocPrint(allocator, "Linked {s} -> {s}", .{ pkg_name, cwd }),
        };
    }
}

/// Unregister current directory or remove a specific global link
pub fn unlinkCommand(allocator: std.mem.Allocator, name: ?[]const u8) !CommandResult {
    const links_dir = try getLinksDir(allocator);
    defer allocator.free(links_dir);

    const pkg_name = if (name) |n|
        try allocator.dupe(u8, n)
    else blk: {
        const cwd = try io_helper.getCwdAlloc(allocator);
        defer allocator.free(cwd);
        break :blk try getPackageName(allocator, cwd) orelse try allocator.dupe(u8, basename(cwd));
    };
    defer allocator.free(pkg_name);

    const link_path = try std.fmt.allocPrint(allocator, "{s}/{s}", .{ links_dir, pkg_name });
    defer allocator.free(link_path);

    io_helper.deleteFile(link_path) catch {
        return .{
            .exit_code = 1,
            .message = try std.fmt.allocPrint(allocator, "Package '{s}' is not linked.", .{pkg_name}),
        };
    };

    return .{
        .exit_code = 0,
        .message = try std.fmt.allocPrint(allocator, "Unlinked {s}", .{pkg_name}),
    };
}

/// Resolve a `link:` dependency to its actual filesystem path.
/// Returns the path the global link points to, or null if not found.
pub fn resolveLinkPath(allocator: std.mem.Allocator, link_name: []const u8) !?[]const u8 {
    const links_dir = try getLinksDir(allocator);
    defer allocator.free(links_dir);

    const link_path = try std.fmt.allocPrint(allocator, "{s}/{s}", .{ links_dir, link_name });
    defer allocator.free(link_path);

    return io_helper.readLinkAlloc(allocator, link_path) catch null;
}

/// Default directories to search for projects when auto-linking.
const DEFAULT_SEARCH_DIRS = [_][]const u8{
    "Code",
    "Projects",
    "Developer",
    "dev",
    "src",
    "workspace",
    "repos",
};

/// Maximum directory depth to search when auto-discovering projects.
const AUTO_LINK_MAX_DEPTH: usize = 3;

/// Directories that are never projects — skip without stat/read.
pub fn isSkippableDir(name: []const u8) bool {
    return name.len == 0 or name[0] == '.' or
        std.mem.eql(u8, name, "node_modules") or
        std.mem.eql(u8, name, "pantry") or
        std.mem.eql(u8, name, "dist") or
        std.mem.eql(u8, name, "build") or
        std.mem.eql(u8, name, "target") or
        std.mem.eql(u8, name, "zig-out") or
        std.mem.eql(u8, name, "zig-cache") or
        std.mem.eql(u8, name, "__pycache__") or
        std.mem.eql(u8, name, "vendor") or
        std.mem.eql(u8, name, "coverage");
}

/// Result map from batch auto-discovery: pkg_name → discovered path.
pub const AutoLinkResults = struct {
    map: std.StringHashMap([]const u8),
    allocator: std.mem.Allocator,

    pub fn get(self: *const AutoLinkResults, key: []const u8) ?[]const u8 {
        return self.map.get(key);
    }

    pub fn deinit(self: *AutoLinkResults) void {
        var it = self.map.iterator();
        while (it.next()) |entry| {
            self.allocator.free(entry.key_ptr.*);
            self.allocator.free(entry.value_ptr.*);
        }
        self.map.deinit();
    }
};

/// Batch auto-discover multiple packages in a single directory tree scan.
/// Returns a map of pkg_name → discovered_path for all found packages.
/// Each found package is also registered as a global link.
///
/// Performance strategy:
/// 1. Build a set of target names + their unscoped basenames for fast lookup
/// 2. Walk directory tree ONCE for all packages
/// 3. At each directory, only read package.json if the directory basename
///    matches a target name (fast path) — avoids JSON parsing for ~95% of dirs
/// 4. Fall back to reading package.json for remaining unresolved deps in a second pass
/// 5. Early exit as soon as all packages are resolved
pub fn autoDiscoverAndLinkBatch(
    allocator: std.mem.Allocator,
    pkg_names: []const []const u8,
    custom_search_paths: ?[]const u8,
) !AutoLinkResults {
    var results = AutoLinkResults{
        .map = std.StringHashMap([]const u8).init(allocator),
        .allocator = allocator,
    };
    errdefer results.deinit(); // struct deinit - calls map.deinit(allocator) internally

    if (pkg_names.len == 0) return results;

    // Build lookup sets: full package name and unscoped basename
    // e.g., "@stacksjs/bun-router" → also match dir named "bun-router"
    var name_set = std.StringHashMap([]const u8).init(allocator);
    defer name_set.deinit();

    for (pkg_names) |name| {
        const base = unscopedName(name);
        // Map basename → full package name (for dir-name matching)
        name_set.put(base, name) catch {};
        // Also map the full name itself (for cases where dir matches full name)
        if (!std.mem.eql(u8, base, name)) {
            name_set.put(name, name) catch {};
        }
    }

    const home = try lib.Paths.home(allocator);
    defer allocator.free(home);

    // Phase 1: Name-based fast scan — only read package.json when dir name matches
    try scanSearchPaths(allocator, home, custom_search_paths, pkg_names, &name_set, &results, false);

    // Phase 2: If any packages still unresolved, do a full scan reading all package.json files
    if (results.map.count() < pkg_names.len) {
        try scanSearchPaths(allocator, home, custom_search_paths, pkg_names, &name_set, &results, true);
    }

    return results;
}

/// Extract unscoped name: "@scope/name" → "name", "name" → "name"
pub fn unscopedName(pkg_name: []const u8) []const u8 {
    if (pkg_name.len > 0 and pkg_name[0] == '@') {
        if (std.mem.indexOfScalar(u8, pkg_name, '/')) |slash| {
            return pkg_name[slash + 1 ..];
        }
    }
    return pkg_name;
}

/// Scan configured or default search paths.
fn scanSearchPaths(
    allocator: std.mem.Allocator,
    home: []const u8,
    custom_search_paths: ?[]const u8,
    pkg_names: []const []const u8,
    name_set: *std.StringHashMap([]const u8),
    results: *AutoLinkResults,
    read_all_json: bool,
) !void {
    if (custom_search_paths) |paths_str| {
        var iter = std.mem.splitScalar(u8, paths_str, ',');
        while (iter.next()) |raw_path| {
            const trimmed = std.mem.trim(u8, raw_path, " \t");
            if (trimmed.len == 0) continue;

            const abs_path = if (std.mem.startsWith(u8, trimmed, "~/"))
                try std.fmt.allocPrint(allocator, "{s}/{s}", .{ home, trimmed[2..] })
            else if (std.mem.startsWith(u8, trimmed, "/"))
                try allocator.dupe(u8, trimmed)
            else
                try std.fmt.allocPrint(allocator, "{s}/{s}", .{ home, trimmed });
            defer allocator.free(abs_path);

            try scanDirBatch(allocator, abs_path, pkg_names, name_set, results, 0, read_all_json);
            if (results.map.count() >= pkg_names.len) return; // All found
        }
    } else {
        for (DEFAULT_SEARCH_DIRS) |rel_dir| {
            const abs_path = try std.fmt.allocPrint(allocator, "{s}/{s}", .{ home, rel_dir });
            defer allocator.free(abs_path);

            try scanDirBatch(allocator, abs_path, pkg_names, name_set, results, 0, read_all_json);
            if (results.map.count() >= pkg_names.len) return; // All found
        }
    }
}

/// Recursively scan a directory, matching against all target package names.
/// When `read_all_json` is false (phase 1), only reads package.json in dirs whose
/// basename matches a target name. When true (phase 2), reads all package.json files.
fn scanDirBatch(
    allocator: std.mem.Allocator,
    dir_path: []const u8,
    pkg_names: []const []const u8,
    name_set: *std.StringHashMap([]const u8),
    results: *AutoLinkResults,
    depth: usize,
    read_all_json: bool,
) !void {
    if (depth > AUTO_LINK_MAX_DEPTH) return;
    if (results.map.count() >= pkg_names.len) return; // All found — early exit

    var fs_dir = io_helper.openDirAbsoluteForIteration(dir_path) catch return;
    defer fs_dir.close();

    var iter = fs_dir.iterate();
    while (try iter.next()) |entry| {
        if (entry.kind != .directory and entry.kind != .sym_link) continue;
        if (isSkippableDir(entry.name)) continue;

        const sub_path = try std.fmt.allocPrint(allocator, "{s}/{s}", .{ dir_path, entry.name });
        var matched = false;

        // Fast path: directory name matches a target package name?
        const name_match = name_set.get(entry.name);

        const should_read = if (name_match != null)
            true // Dir name matches a target — always verify via package.json
        else
            read_all_json; // Phase 2: read all package.json in subdirs

        if (should_read) {
            if (try readPackageName(allocator, sub_path)) |found_name| {
                // Check if this name matches any unresolved target
                for (pkg_names) |target| {
                    if (std.mem.eql(u8, found_name, target) and !results.map.contains(target)) {
                        // Register global link and store in results
                        try registerGlobalLink(allocator, target, sub_path);
                        const key = try allocator.dupe(u8, target);
                        // sub_path ownership transfers to the results map
                        try results.map.put(key, sub_path);
                        matched = true;
                        break;
                    }
                }
                allocator.free(found_name);
            }
        }

        if (matched) {
            // Don't recurse into matched project, don't free sub_path (owned by results)
            if (results.map.count() >= pkg_names.len) return;
            continue;
        }

        // Recurse into subdirectory
        if (depth + 1 <= AUTO_LINK_MAX_DEPTH) {
            try scanDirBatch(allocator, sub_path, pkg_names, name_set, results, depth + 1, read_all_json);
        }

        allocator.free(sub_path);
        if (results.map.count() >= pkg_names.len) return;
    }
}

/// Read the "name" field from package.json or pantry.json in a directory.
/// Returns the name string (caller-owned) or null if not found.
pub fn readPackageName(allocator: std.mem.Allocator, dir_path: []const u8) !?[]const u8 {
    const config_files = [_][]const u8{ "package.json", "pantry.json" };
    for (config_files) |config_file| {
        const config_path = try std.fmt.allocPrint(allocator, "{s}/{s}", .{ dir_path, config_file });
        defer allocator.free(config_path);

        const content = io_helper.readFileAlloc(allocator, config_path, 64 * 1024) catch continue;
        defer allocator.free(content);

        const parsed = std.json.parseFromSlice(std.json.Value, allocator, content, .{}) catch continue;
        defer parsed.deinit();

        if (parsed.value != .object) continue;
        const name_val = parsed.value.object.get("name") orelse continue;
        if (name_val != .string) continue;

        return try allocator.dupe(u8, name_val.string);
    }
    return null;
}

/// Register a discovered project as a global link (~/.pantry/links/{name} -> path).
fn registerGlobalLink(allocator: std.mem.Allocator, pkg_name: []const u8, target_path: []const u8) !void {
    const links_dir = try getLinksDir(allocator);
    defer allocator.free(links_dir);
    try io_helper.makePath(links_dir);

    const link_path = try std.fmt.allocPrint(allocator, "{s}/{s}", .{ links_dir, pkg_name });
    defer allocator.free(link_path);

    // Ensure parent directory exists for scoped packages (e.g., @scope/name)
    if (std.fs.path.dirname(link_path)) |parent| {
        io_helper.makePath(parent) catch {};
    }

    // Remove existing link if present, then create
    io_helper.deleteFile(link_path) catch {};
    try io_helper.symLink(target_path, link_path);
}
