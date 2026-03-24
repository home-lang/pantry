const std = @import("std");
const io_helper = @import("../io_helper.zig");

/// Sync build.zig.zon dependencies block to match installed Zig packages in the pantry/ directory.
///
/// After `pantry install`, this function:
/// 1. Finds the project's build.zig.zon (if it exists)
/// 2. Scans the pantry/ directory for Zig library packages (those containing a build.zig.zon)
/// 3. Rewrites the .dependencies block to use local .path references
/// 4. Removes deps that are no longer in pantry/
///
/// If no build.zig.zon exists in the project, this is a no-op.
pub fn syncBuildZigZon(allocator: std.mem.Allocator, project_dir: []const u8, pantry_dir_name: []const u8, verbose: bool) !void {
    // Check if build.zig.zon exists in the project root
    const zon_path = try std.fs.path.join(allocator, &.{ project_dir, "build.zig.zon" });
    defer allocator.free(zon_path);

    const zon_content = io_helper.readFileAlloc(allocator, zon_path, 1024 * 1024) catch |err| {
        if (err == error.FileNotFound) return; // No build.zig.zon, nothing to sync
        return err;
    };
    defer allocator.free(zon_content);

    // Scan pantry/ dir for zig packages (directories that contain a build.zig.zon)
    const pantry_path = try std.fs.path.join(allocator, &.{ project_dir, pantry_dir_name });
    defer allocator.free(pantry_path);

    var zig_deps = std.ArrayList(ZigDep).empty;
    defer {
        for (zig_deps.items) |dep| {
            allocator.free(dep.name);
            allocator.free(dep.rel_path);
        }
        zig_deps.deinit(allocator);
    }

    var pantry_dir = io_helper.openDirForIteration(pantry_path) catch |err| {
        if (err == error.FileNotFound) return;
        return err;
    };
    defer pantry_dir.close();

    var dir_it = pantry_dir.iterate();
    while (try dir_it.next()) |entry| {
        if (entry.kind != .directory) continue;

        // Check if this directory contains a build.zig.zon (indicating it's a zig package)
        const sub_zon = try std.fmt.allocPrint(allocator, "{s}/{s}/build.zig.zon", .{ pantry_path, entry.name });
        defer allocator.free(sub_zon);

        const has_zon = blk: {
            io_helper.accessAbsolute(sub_zon, .{}) catch break :blk false;
            break :blk true;
        };

        if (has_zon) {
            // Convert hyphenated name to underscore for zig identifier
            const zig_name = try hyphenToUnderscore(allocator, entry.name);
            const rel_path = try std.fmt.allocPrint(allocator, "{s}/{s}", .{ pantry_dir_name, entry.name });

            try zig_deps.append(allocator, .{
                .name = zig_name,
                .rel_path = rel_path,
            });
        }
    }

    if (zig_deps.items.len == 0 and !hasDependenciesBlock(zon_content)) {
        return; // No zig deps and no existing deps block, nothing to do
    }

    // Generate the new build.zig.zon content
    const new_content = try generateUpdatedZon(allocator, zon_content, zig_deps.items);
    defer allocator.free(new_content);

    // Only write if content changed
    if (std.mem.eql(u8, zon_content, new_content)) {
        if (verbose) {
            std.debug.print("build.zig.zon: already up to date\n", .{});
        }
        return;
    }

    // Write the updated content
    const file = try io_helper.createFile(zon_path, .{});
    defer file.close(io_helper.io);
    try io_helper.writeAllToFile(file, new_content);

    if (verbose) {
        std.debug.print("build.zig.zon: synced {d} zig dependencies\n", .{zig_deps.items.len});
    }
}

const ZigDep = struct {
    name: []const u8, // zig identifier (underscores)
    rel_path: []const u8, // relative path from project root
};

/// Convert hyphens to underscores for a valid Zig bare identifier
fn hyphenToUnderscore(allocator: std.mem.Allocator, name: []const u8) ![]const u8 {
    const result = try allocator.alloc(u8, name.len);
    for (name, 0..) |c, i| {
        result[i] = if (c == '-') '_' else c;
    }
    return result;
}

/// Check if the ZON content has a .dependencies block
fn hasDependenciesBlock(content: []const u8) bool {
    return std.mem.indexOf(u8, content, ".dependencies") != null;
}

/// Generate updated build.zig.zon content with synced dependencies.
/// Preserves everything outside the .dependencies block.
fn generateUpdatedZon(allocator: std.mem.Allocator, original: []const u8, deps: []const ZigDep) ![]const u8 {
    var buf = std.ArrayList(u8).empty;
    errdefer buf.deinit(allocator);

    // Build the new dependencies block
    var deps_block = std.ArrayList(u8).empty;
    defer deps_block.deinit(allocator);

    if (deps.len > 0) {
        try deps_block.appendSlice(allocator, "    .dependencies = .{\n");
        for (deps) |dep| {
            try deps_block.appendSlice(allocator, "        .");
            try deps_block.appendSlice(allocator, dep.name);
            try deps_block.appendSlice(allocator, " = .{\n");
            try deps_block.appendSlice(allocator, "            .path = \"");
            try deps_block.appendSlice(allocator, dep.rel_path);
            try deps_block.appendSlice(allocator, "\",\n");
            try deps_block.appendSlice(allocator, "        },\n");
        }
        try deps_block.appendSlice(allocator, "    },\n");
    }

    // Find the existing .dependencies block and replace it
    if (std.mem.indexOf(u8, original, ".dependencies")) |dep_start| {
        // Find the start of the line containing .dependencies
        var line_start = dep_start;
        while (line_start > 0 and original[line_start - 1] != '\n') {
            line_start -= 1;
        }

        // Find the closing of the dependencies block — match the .{ ... }, pattern
        // We need to count braces to find the correct closing
        var brace_depth: i32 = 0;
        var dep_end: usize = dep_start;
        var found_open = false;
        while (dep_end < original.len) : (dep_end += 1) {
            if (original[dep_end] == '{') {
                brace_depth += 1;
                found_open = true;
            } else if (original[dep_end] == '}') {
                brace_depth -= 1;
                if (found_open and brace_depth == 0) {
                    dep_end += 1; // include the closing }
                    // Skip trailing comma and newline
                    while (dep_end < original.len and (original[dep_end] == ',' or original[dep_end] == '\n' or original[dep_end] == '\r' or original[dep_end] == ' ')) {
                        dep_end += 1;
                    }
                    break;
                }
            }
        }

        // Replace: everything before deps + new deps block + everything after deps
        try buf.appendSlice(allocator, original[0..line_start]);
        try buf.appendSlice(allocator, deps_block.items);
        try buf.appendSlice(allocator, original[dep_end..]);
    } else {
        // No existing .dependencies block — insert before .paths
        if (std.mem.indexOf(u8, original, ".paths")) |paths_start| {
            // Find start of line
            var line_start = paths_start;
            while (line_start > 0 and original[line_start - 1] != '\n') {
                line_start -= 1;
            }
            try buf.appendSlice(allocator, original[0..line_start]);
            try buf.appendSlice(allocator, deps_block.items);
            try buf.appendSlice(allocator, original[line_start..]);
        } else {
            // No .paths either — insert before closing }
            const last_brace = std.mem.lastIndexOf(u8, original, "}") orelse {
                try buf.appendSlice(allocator, original);
                return try buf.toOwnedSlice(allocator);
            };
            try buf.appendSlice(allocator, original[0..last_brace]);
            try buf.appendSlice(allocator, deps_block.items);
            try buf.appendSlice(allocator, original[last_brace..]);
        }
    }

    return try buf.toOwnedSlice(allocator);
}
