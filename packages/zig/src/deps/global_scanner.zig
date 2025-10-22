const std = @import("std");
const detector = @import("detector.zig");
const parser = @import("parser.zig");

/// Scan common locations for dependency files with global packages
pub fn scanForGlobalDeps(allocator: std.mem.Allocator) ![]parser.PackageDependency {
    const home = std.posix.getenv("HOME") orelse return &[_]parser.PackageDependency{};

    // Common locations to search
    const search_locations = [_][]const u8{
        "",               // Home directory root
        ".dotfiles",
        ".config",
        "Code",
        "Projects",
        "Development",
        "dev",
    };

    var all_global_deps = try std.ArrayList(parser.PackageDependency).initCapacity(allocator, 16);
    errdefer {
        for (all_global_deps.items) |*dep| dep.deinit(allocator);
        all_global_deps.deinit(allocator);
    }

    // Search each location
    for (search_locations) |location| {
        const search_path = if (location.len == 0)
            try allocator.dupe(u8, home)
        else
            try std.fmt.allocPrint(allocator, "{s}/{s}", .{ home, location });
        defer allocator.free(search_path);

        // Check if path exists
        std.fs.accessAbsolute(search_path, .{}) catch continue;

        // Look for deps files in this location (non-recursive for home dir, recursive for others)
        const is_home_root = location.len == 0;
        if (is_home_root) {
            // Only check root level for home directory
            try scanDirectoryForGlobalDeps(allocator, search_path, &all_global_deps, 0, 0);
        } else {
            // Search up to 3 levels deep for other directories
            try scanDirectoryForGlobalDeps(allocator, search_path, &all_global_deps, 3, 0);
        }
    }

    return all_global_deps.toOwnedSlice(allocator);
}

/// Recursively scan a directory for deps files with global packages
fn scanDirectoryForGlobalDeps(
    allocator: std.mem.Allocator,
    dir_path: []const u8,
    global_deps: *std.ArrayList(parser.PackageDependency),
    max_depth: usize,
    current_depth: usize,
) !void {
    if (current_depth > max_depth) return;

    var dir = std.fs.openDirAbsolute(dir_path, .{ .iterate = true }) catch return;
    defer dir.close();

    var iterator = dir.iterate();

    while (try iterator.next()) |entry| {
        // Skip hidden files/directories (except .dotfiles and .config at root)
        if (entry.name[0] == '.' and current_depth > 0) continue;

        // Skip common directories that shouldn't be searched
        if (shouldSkipDirectory(entry.name)) continue;

        const entry_path = try std.fmt.allocPrint(allocator, "{s}/{s}", .{ dir_path, entry.name });
        defer allocator.free(entry_path);

        switch (entry.kind) {
            .file => {
                // Check if this is a deps file
                if (detector.isDepsFile(entry.name)) {
                    // Try to parse it and extract global packages
                    const deps_file = detector.DepsFile{
                        .path = entry_path,
                        .format = detector.inferFormat(entry.name) orelse continue,
                    };

                    const deps = parser.inferDependencies(allocator, deps_file) catch continue;
                    defer {
                        for (deps) |*dep| {
                            var d = dep.*;
                            d.deinit(allocator);
                        }
                        allocator.free(deps);
                    }

                    // Filter for global packages only
                    for (deps) |dep| {
                        if (dep.global) {
                            try global_deps.append(allocator, .{
                                .name = try allocator.dupe(u8, dep.name),
                                .version = try allocator.dupe(u8, dep.version),
                                .global = true,
                            });
                        }
                    }
                }
            },
            .directory => {
                // Recurse into subdirectories
                try scanDirectoryForGlobalDeps(allocator, entry_path, global_deps, max_depth, current_depth + 1);
            },
            else => {},
        }
    }
}

/// Check if a directory should be skipped during scanning
fn shouldSkipDirectory(name: []const u8) bool {
    const skip_dirs = [_][]const u8{
        "node_modules",
        "vendor",
        ".git",
        ".svn",
        ".hg",
        "dist",
        "build",
        "target",
        "out",
        "tmp",
        "temp",
        ".cache",
        "cache",
        "__pycache__",
        ".venv",
        "venv",
        ".tox",
        "coverage",
    };

    for (skip_dirs) |skip_dir| {
        if (std.mem.eql(u8, name, skip_dir)) return true;
    }

    return false;
}
