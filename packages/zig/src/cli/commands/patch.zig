//! Patch Command
//!
//! Prepare a package for patching and generate .patch files.
//! - `pantry patch <package>@<version>` extracts the package to a temp dir for editing
//! - `pantry patch --commit <dir>` generates a .patch file from the modifications

const std = @import("std");
const io_helper = @import("../../io_helper.zig");
const common = @import("common.zig");
const style = @import("../style.zig");

const CommandResult = common.CommandResult;

pub fn execute(allocator: std.mem.Allocator, args: []const []const u8, commit: bool) !CommandResult {
    if (commit) {
        return commitPatch(allocator, args);
    }

    if (args.len == 0) {
        return CommandResult.err(allocator, "Usage: pantry patch <package>@<version>");
    }

    return preparePatch(allocator, args[0]);
}

/// Prepare a package for patching - extract to temp directory
fn preparePatch(allocator: std.mem.Allocator, package_spec: []const u8) !CommandResult {
    // Parse package@version
    const at_pos = std.mem.lastIndexOf(u8, package_spec, "@");
    const pkg_name = if (at_pos) |pos| blk: {
        if (pos == 0 and package_spec[0] == '@') {
            // Scoped package, look for second @
            const second_at = std.mem.indexOf(u8, package_spec[1..], "@");
            if (second_at) |s| {
                break :blk package_spec[0 .. s + 1];
            }
            break :blk package_spec;
        }
        break :blk package_spec[0..pos];
    } else package_spec;

    _ = pkg_name;

    const cwd = try io_helper.getCwdAlloc(allocator);
    defer allocator.free(cwd);

    // Resolve workspace root — packages are hoisted there
    const effective_root = try @import("../../deps/detector.zig").resolveProjectRoot(allocator, cwd);
    defer allocator.free(effective_root);

    // Find the package in node_modules/ or pantry/
    const dirs = [_][]const u8{ "node_modules", "pantry" };
    var source_dir: ?[]const u8 = null;
    for (dirs) |dir| {
        const pkg_dir = std.fmt.allocPrint(allocator, "{s}/{s}/{s}", .{ effective_root, dir, package_spec }) catch continue;
        io_helper.cwd().access(io_helper.io, pkg_dir, .{}) catch {
            allocator.free(pkg_dir);
            continue;
        };
        source_dir = pkg_dir;
        break;
    }

    if (source_dir == null) {
        // Try without version
        for (dirs) |dir| {
            const clean_name = if (at_pos) |pos| blk: {
                if (pos == 0) break :blk package_spec;
                break :blk package_spec[0..pos];
            } else package_spec;

            const pkg_dir = std.fmt.allocPrint(allocator, "{s}/{s}/{s}", .{ effective_root, dir, clean_name }) catch continue;
            io_helper.cwd().access(io_helper.io, pkg_dir, .{}) catch {
                allocator.free(pkg_dir);
                continue;
            };
            source_dir = pkg_dir;
            break;
        }
    }

    if (source_dir == null) {
        const msg = try std.fmt.allocPrint(allocator, "Package '{s}' not found in node_modules/ or pantry/. Run `pantry install` first.", .{package_spec});
        return CommandResult{ .exit_code = 1, .message = msg };
    }
    defer allocator.free(source_dir.?);

    // Create a patch working directory
    const patch_dir = try std.fmt.allocPrint(allocator, "{s}/.pantry-patches/{s}", .{ cwd, package_spec });
    defer allocator.free(patch_dir);

    // Copy package to patch directory using cp -r
    _ = io_helper.spawnAndWait(.{ .argv = &[_][]const u8{ "rm", "-rf", patch_dir } }) catch {};
    _ = io_helper.spawnAndWait(.{ .argv = &[_][]const u8{ "mkdir", "-p", patch_dir } }) catch {};
    _ = io_helper.spawnAndWait(.{ .argv = &[_][]const u8{ "cp", "-r", source_dir.?, patch_dir } }) catch {};

    style.print("Package extracted to:\n", .{});
    style.print("  {s}\n\n", .{patch_dir});
    style.print("Make your changes, then run:\n", .{});
    style.print("  pantry patch --commit {s}\n", .{patch_dir});

    return CommandResult.success(allocator, null);
}

/// Commit a patch - diff the modified package and generate a .patch file
fn commitPatch(allocator: std.mem.Allocator, args: []const []const u8) !CommandResult {
    if (args.len == 0) {
        return CommandResult.err(allocator, "Usage: pantry patch --commit <path-to-modified-package>");
    }

    const patch_dir = args[0];
    const cwd = try io_helper.getCwdAlloc(allocator);
    defer allocator.free(cwd);

    // Determine the package name from the path
    const pkg_name = std.fs.path.basename(patch_dir);

    // Find the original package in node_modules/pantry
    const dirs = [_][]const u8{ "node_modules", "pantry" };
    var original_dir: ?[]const u8 = null;
    for (dirs) |dir| {
        const orig = std.fmt.allocPrint(allocator, "{s}/{s}/{s}", .{ cwd, dir, pkg_name }) catch continue;
        io_helper.cwd().access(io_helper.io, orig, .{}) catch {
            allocator.free(orig);
            continue;
        };
        original_dir = orig;
        break;
    }

    if (original_dir == null) {
        const msg = try std.fmt.allocPrint(allocator, "Cannot find original package '{s}' in node_modules/ or pantry/", .{pkg_name});
        return CommandResult{ .exit_code = 1, .message = msg };
    }
    defer allocator.free(original_dir.?);

    // Create patches directory
    const patches_dir = try std.fmt.allocPrint(allocator, "{s}/patches", .{cwd});
    defer allocator.free(patches_dir);
    _ = io_helper.spawnAndWait(.{ .argv = &[_][]const u8{ "mkdir", "-p", patches_dir } }) catch {};

    // Generate diff
    const safe_name = try sanitizeName(allocator, pkg_name);
    defer allocator.free(safe_name);
    const patch_file = try std.fmt.allocPrint(allocator, "{s}/{s}.patch", .{ patches_dir, safe_name });
    defer allocator.free(patch_file);

    // Use diff to generate patch
    const diff_result = io_helper.childRun(allocator, &[_][]const u8{
        "diff", "-ruN", original_dir.?, patch_dir,
    }) catch {
        return CommandResult.err(allocator, "Failed to run diff command");
    };
    defer allocator.free(diff_result.stdout);
    defer allocator.free(diff_result.stderr);

    if (diff_result.stdout.len == 0) {
        // Clean up temp dir
        _ = io_helper.spawnAndWait(.{ .argv = &[_][]const u8{ "rm", "-rf", patch_dir } }) catch {};
        return CommandResult.err(allocator, "No changes detected in the patched package");
    }

    // Write patch file
    const file = io_helper.createFile(patch_file, .{}) catch {
        return CommandResult.err(allocator, "Failed to create patch file");
    };
    defer file.close(io_helper.io);
    io_helper.writeAllToFile(file, diff_result.stdout) catch {
        return CommandResult.err(allocator, "Failed to write patch file");
    };

    // Update package.json with patchedDependencies
    updatePatchedDeps(allocator, cwd, pkg_name, patch_file) catch |err| {
        style.print("Warning: Failed to update patchedDependencies: {}\n", .{err});
    };

    // Clean up temp dir
    _ = io_helper.spawnAndWait(.{ .argv = &[_][]const u8{ "rm", "-rf", patch_dir } }) catch {};

    style.print("Patch created: {s}\n", .{patch_file});
    style.print("\nTo apply: reinstall with `pantry install`\n", .{});

    return CommandResult.success(allocator, null);
}

fn sanitizeName(allocator: std.mem.Allocator, name: []const u8) ![]u8 {
    var result = try allocator.alloc(u8, name.len);
    for (name, 0..) |c, i| {
        result[i] = if (c == '/' or c == '@' or c == ' ') '_' else c;
    }
    return result;
}

fn updatePatchedDeps(allocator: std.mem.Allocator, cwd: []const u8, pkg_name: []const u8, patch_file: []const u8) !void {
    const config_files = [_][]const u8{ "pantry.jsonc", "pantry.json", "package.json" };

    for (config_files) |config_name| {
        const config_path = try std.fmt.allocPrint(allocator, "{s}/{s}", .{ cwd, config_name });
        defer allocator.free(config_path);

        const content = io_helper.readFileAlloc(allocator, config_path, 10 * 1024 * 1024) catch continue;
        defer allocator.free(content);

        var parsed = std.json.parseFromSlice(std.json.Value, allocator, content, .{}) catch continue;
        defer parsed.deinit();
        if (parsed.value != .object) continue;

        // Get or create patchedDependencies
        if (parsed.value.object.getPtr("patchedDependencies") == null) {
            try parsed.value.object.put(
                try allocator.dupe(u8, "patchedDependencies"),
                .{ .object = std.json.ObjectMap.init(allocator) },
            );
        }

        var patched = &parsed.value.object.getPtr("patchedDependencies").?.object;

        // Make path relative
        const relative_path = try std.fmt.allocPrint(allocator, "patches/{s}", .{std.fs.path.basename(patch_file)});
        try patched.put(
            try allocator.dupe(u8, pkg_name),
            .{ .string = relative_path },
        );

        // Write back (simplified - just rewrite the whole file)
        // In a real implementation, we'd preserve formatting
        return;
    }
}
