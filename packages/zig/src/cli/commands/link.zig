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

/// Get the package name from pantry.json in the given directory
fn getPackageName(allocator: std.mem.Allocator, dir: []const u8) !?[]const u8 {
    const config_path = try std.fmt.allocPrint(allocator, "{s}/pantry.json", .{dir});
    defer allocator.free(config_path);

    const content = io_helper.readFileAlloc(allocator, config_path, 64 * 1024) catch {
        return null;
    };
    defer allocator.free(content);

    const parsed = std.json.parseFromSlice(std.json.Value, allocator, content, .{}) catch {
        return null;
    };
    defer parsed.deinit();

    if (parsed.value != .object) return null;
    const name_val = parsed.value.object.get("name") orelse return null;
    if (name_val != .string) return null;
    return try allocator.dupe(u8, name_val.string);
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
