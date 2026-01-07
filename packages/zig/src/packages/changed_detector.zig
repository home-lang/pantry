//! Changed Packages Detector
//!
//! Detects which workspace packages have changed based on git status.
//! Useful for incremental builds and selective testing.

const std = @import("std");
const types = @import("types.zig");
const io_helper = @import("../io_helper.zig");

/// Result of changed detection
pub const ChangedResult = struct {
    changed_members: []types.WorkspaceMember,
    base_ref: []const u8,
    allocator: std.mem.Allocator,

    pub fn deinit(self: *ChangedResult) void {
        // Note: members are borrowed from workspace, don't free
        self.allocator.free(self.changed_members);
        self.allocator.free(self.base_ref);
    }
};

/// Options for changed detection
pub const ChangedOptions = struct {
    /// Base git ref to compare against (default: "HEAD")
    base: []const u8 = "HEAD",
    /// Include uncommitted changes
    include_uncommitted: bool = true,
    /// Include untracked files
    include_untracked: bool = false,
};

/// Get changed files from git
fn getChangedFiles(
    allocator: std.mem.Allocator,
    workspace_root: []const u8,
    options: ChangedOptions,
) ![][]const u8 {
    var changed_files = std.ArrayList([]const u8){};
    errdefer {
        for (changed_files.items) |file| {
            allocator.free(file);
        }
        changed_files.deinit(allocator);
    }

    // Get committed changes
    const git_diff_cmd = try std.fmt.allocPrint(
        allocator,
        "git diff --name-only {s}",
        .{options.base},
    );
    defer allocator.free(git_diff_cmd);

    const diff_result = try std.process.Child.run(.{
        .allocator = allocator,
        .argv = &[_][]const u8{ "sh", "-c", git_diff_cmd },
        .cwd = workspace_root,
    });
    defer {
        allocator.free(diff_result.stdout);
        allocator.free(diff_result.stderr);
    }

    if (diff_result.term.Exited == 0) {
        var lines = std.mem.splitScalar(u8, diff_result.stdout, '\n');
        while (lines.next()) |line| {
            const trimmed = std.mem.trim(u8, line, " \t\r");
            if (trimmed.len > 0) {
                try changed_files.append(allocator, try allocator.dupe(u8, trimmed));
            }
        }
    }

    // Get uncommitted changes if requested
    if (options.include_uncommitted) {
        const status_result = try std.process.Child.run(.{
            .allocator = allocator,
            .argv = &[_][]const u8{ "git", "diff", "--name-only", "HEAD" },
            .cwd = workspace_root,
        });
        defer {
            allocator.free(status_result.stdout);
            allocator.free(status_result.stderr);
        }

        if (status_result.term.Exited == 0) {
            var lines = std.mem.splitScalar(u8, status_result.stdout, '\n');
            while (lines.next()) |line| {
                const trimmed = std.mem.trim(u8, line, " \t\r");
                if (trimmed.len > 0) {
                    // Check if already in list
                    var found = false;
                    for (changed_files.items) |existing| {
                        if (std.mem.eql(u8, existing, trimmed)) {
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        try changed_files.append(allocator, try allocator.dupe(u8, trimmed));
                    }
                }
            }
        }
    }

    // Get untracked files if requested
    if (options.include_untracked) {
        const untracked_result = try std.process.Child.run(.{
            .allocator = allocator,
            .argv = &[_][]const u8{ "git", "ls-files", "--others", "--exclude-standard" },
            .cwd = workspace_root,
        });
        defer {
            allocator.free(untracked_result.stdout);
            allocator.free(untracked_result.stderr);
        }

        if (untracked_result.term.Exited == 0) {
            var lines = std.mem.splitScalar(u8, untracked_result.stdout, '\n');
            while (lines.next()) |line| {
                const trimmed = std.mem.trim(u8, line, " \t\r");
                if (trimmed.len > 0) {
                    try changed_files.append(allocator, try allocator.dupe(u8, trimmed));
                }
            }
        }
    }

    return try changed_files.toOwnedSlice(allocator);
}

/// Check if a file path is within a directory
fn isFileInDirectory(file_path: []const u8, dir_path: []const u8) bool {
    // Normalize paths by removing leading "./"
    const clean_file = if (std.mem.startsWith(u8, file_path, "./"))
        file_path[2..]
    else
        file_path;

    const clean_dir = if (std.mem.startsWith(u8, dir_path, "./"))
        dir_path[2..]
    else
        dir_path;

    // Check if file path starts with directory path
    if (!std.mem.startsWith(u8, clean_file, clean_dir)) {
        return false;
    }

    // Ensure it's actually in the directory (not just a prefix match)
    if (clean_file.len == clean_dir.len) {
        return true;
    }

    if (clean_file.len > clean_dir.len) {
        return clean_file[clean_dir.len] == '/';
    }

    return false;
}

/// Detect which workspace members have changed
pub fn detectChangedMembers(
    allocator: std.mem.Allocator,
    workspace_root: []const u8,
    members: []const types.WorkspaceMember,
    options: ChangedOptions,
) !ChangedResult {
    // Get all changed files
    const changed_files = try getChangedFiles(allocator, workspace_root, options);
    defer {
        for (changed_files) |file| {
            allocator.free(file);
        }
        allocator.free(changed_files);
    }

    // Track which members have changes
    var changed = std.ArrayList(types.WorkspaceMember){};
    errdefer changed.deinit(allocator);

    for (members) |member| {
        // Check if any changed file is in this member's directory
        for (changed_files) |file| {
            if (isFileInDirectory(file, member.path)) {
                try changed.append(allocator, member);
                break;
            }
        }
    }

    return ChangedResult{
        .changed_members = try changed.toOwnedSlice(allocator),
        .base_ref = try allocator.dupe(u8, options.base),
        .allocator = allocator,
    };
}

// ============================================================================
// Tests
// ============================================================================

test "isFileInDirectory - basic" {
    try std.testing.expect(isFileInDirectory("packages/foo/src/index.ts", "packages/foo"));
    try std.testing.expect(isFileInDirectory("./packages/foo/src/index.ts", "./packages/foo"));
    try std.testing.expect(!isFileInDirectory("packages/bar/src/index.ts", "packages/foo"));
}

test "isFileInDirectory - edge cases" {
    try std.testing.expect(isFileInDirectory("packages/foo-bar/index.ts", "packages/foo-bar"));
    try std.testing.expect(!isFileInDirectory("packages/foo-bar/index.ts", "packages/foo"));
    try std.testing.expect(isFileInDirectory("packages/foo/index.ts", "packages/foo"));
}

test "detectChangedMembers - no git repo" {
    const allocator = std.testing.allocator;

    const member = types.WorkspaceMember{
        .name = "test",
        .path = "./test",
        .abs_path = "/tmp",
        .config_path = null,
        .deps_file_path = null,
    };

    const members = [_]types.WorkspaceMember{member};

    // This should fail or return empty since /tmp is not a git repo
    const result = detectChangedMembers(
        allocator,
        "/tmp",
        &members,
        .{},
    ) catch |err| {
        // Expected to fail in non-git directory
        try std.testing.expect(err == error.OutOfMemory or err == error.Unexpected);
        return;
    };
    defer result.deinit();
}
