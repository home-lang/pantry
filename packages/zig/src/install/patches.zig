//! Post-install patch support
//!
//! Applies patches from the project's `patches/` directory to installed packages.
//! Reads `patchedDependencies` from package.json to determine which patches to apply.
//!
//! Format in package.json:
//! ```json
//! {
//!   "patchedDependencies": {
//!     "lodash@4.17.21": "patches/lodash@4.17.21.patch"
//!   }
//! }
//! ```

const std = @import("std");
const io_helper = @import("../io_helper.zig");
const style = @import("../cli/style.zig");

/// Patch entry from patchedDependencies
pub const PatchEntry = struct {
    package_name: []const u8,
    version: ?[]const u8,
    patch_path: []const u8,

    pub fn deinit(self: *PatchEntry, allocator: std.mem.Allocator) void {
        allocator.free(self.package_name);
        if (self.version) |v| allocator.free(v);
        allocator.free(self.patch_path);
    }
};

/// Result of applying patches
pub const PatchResult = struct {
    applied: usize,
    failed: usize,
    skipped: usize,
};

/// Read patchedDependencies from package.json
pub fn readPatchedDependencies(
    allocator: std.mem.Allocator,
    project_root: []const u8,
) ![]PatchEntry {
    const pkg_json_path = try std.fmt.allocPrint(allocator, "{s}/package.json", .{project_root});
    defer allocator.free(pkg_json_path);

    const content = io_helper.readFileAlloc(allocator, pkg_json_path, 2 * 1024 * 1024) catch return &[_]PatchEntry{};
    defer allocator.free(content);

    const parsed = std.json.parseFromSlice(std.json.Value, allocator, content, .{}) catch return &[_]PatchEntry{};
    defer parsed.deinit();

    if (parsed.value != .object) return &[_]PatchEntry{};

    // Check for patchedDependencies field
    const patched_deps = parsed.value.object.get("patchedDependencies") orelse return &[_]PatchEntry{};
    if (patched_deps != .object) return &[_]PatchEntry{};

    var entries = std.ArrayList(PatchEntry){};
    errdefer {
        for (entries.items) |*e| e.deinit(allocator);
        entries.deinit(allocator);
    }

    var it = patched_deps.object.iterator();
    while (it.next()) |entry| {
        const key = entry.key_ptr.*; // e.g., "lodash@4.17.21" or "lodash"
        const patch_path_val = entry.value_ptr.*;
        if (patch_path_val != .string) continue;

        // Parse key: "name@version" or just "name"
        var name: []const u8 = key;
        var version: ?[]const u8 = null;

        if (std.mem.lastIndexOf(u8, key, "@")) |at_pos| {
            // Handle scoped packages: @scope/pkg@version
            if (at_pos > 0) {
                name = key[0..at_pos];
                version = key[at_pos + 1 ..];
            }
        }

        try entries.append(allocator, .{
            .package_name = try allocator.dupe(u8, name),
            .version = if (version) |v| try allocator.dupe(u8, v) else null,
            .patch_path = try allocator.dupe(u8, patch_path_val.string),
        });
    }

    return entries.toOwnedSlice(allocator);
}

/// Apply all patches from patchedDependencies to installed packages.
/// Should be called after install completes.
pub fn applyPatches(
    allocator: std.mem.Allocator,
    project_root: []const u8,
    verbose: bool,
) !PatchResult {
    var result = PatchResult{ .applied = 0, .failed = 0, .skipped = 0 };

    const entries = try readPatchedDependencies(allocator, project_root);
    if (entries.len == 0) return result;
    defer {
        for (entries) |*e| {
            var entry = e.*;
            entry.deinit(allocator);
        }
        allocator.free(entries);
    }

    style.print("Applying {d} patch{s}...\n", .{
        entries.len,
        if (entries.len == 1) "" else "es",
    });

    for (entries) |entry| {
        // Resolve patch file path (relative to project root)
        const patch_file_path = if (std.mem.startsWith(u8, entry.patch_path, "/"))
            try allocator.dupe(u8, entry.patch_path)
        else
            try std.fmt.allocPrint(allocator, "{s}/{s}", .{ project_root, entry.patch_path });
        defer allocator.free(patch_file_path);

        // Check if patch file exists
        io_helper.accessAbsolute(patch_file_path, .{}) catch {
            if (verbose) {
                style.print("  {s}⚠{s} Patch file not found: {s}\n", .{ style.yellow, style.reset, entry.patch_path });
            }
            result.skipped += 1;
            continue;
        };

        // Determine the package directory in node_modules
        const pkg_dir = try std.fmt.allocPrint(allocator, "{s}/node_modules/{s}", .{ project_root, entry.package_name });
        defer allocator.free(pkg_dir);

        // Check if package is installed
        io_helper.accessAbsolute(pkg_dir, .{}) catch {
            if (verbose) {
                style.print("  {s}⚠{s} Package not installed: {s}\n", .{ style.yellow, style.reset, entry.package_name });
            }
            result.skipped += 1;
            continue;
        };

        // Apply the patch using `patch` command
        const apply_result = applyPatchFile(allocator, pkg_dir, patch_file_path) catch {
            style.print("  {s}✗{s} Failed to apply patch for {s}\n", .{ style.red, style.reset, entry.package_name });
            result.failed += 1;
            continue;
        };

        if (apply_result) {
            style.print("  {s}✓{s} Patched {s}\n", .{ style.green, style.reset, entry.package_name });
            result.applied += 1;
        } else {
            style.print("  {s}✗{s} Patch failed for {s}\n", .{ style.red, style.reset, entry.package_name });
            result.failed += 1;
        }
    }

    return result;
}

/// Apply a single patch file to a target directory using the `patch` command.
/// Returns true if the patch was applied successfully.
fn applyPatchFile(
    allocator: std.mem.Allocator,
    target_dir: []const u8,
    patch_path: []const u8,
) !bool {
    // Read the patch content
    const patch_content = try io_helper.readFileAlloc(allocator, patch_path, 10 * 1024 * 1024);
    defer allocator.free(patch_content);

    if (patch_content.len == 0) return false;

    // Try `patch -p1 --forward` first (standard git-style patches)
    // --forward: skip patches that appear to be already applied
    const result = io_helper.childRunWithOptions(allocator, &[_][]const u8{
        "patch", "-p1", "--forward", "--silent", "-i", patch_path,
    }, .{ .cwd = target_dir }) catch {
        // `patch` command not available, try `git apply` as fallback
        const git_result = io_helper.childRunWithOptions(allocator, &[_][]const u8{
            "git", "apply", "--directory", target_dir, patch_path,
        }, .{ .cwd = target_dir }) catch return false;
        defer allocator.free(git_result.stdout);
        defer allocator.free(git_result.stderr);
        return git_result.term.exited == 0;
    };
    defer allocator.free(result.stdout);
    defer allocator.free(result.stderr);

    return result.term.exited == 0;
}
