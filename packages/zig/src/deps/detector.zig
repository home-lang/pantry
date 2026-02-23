const std = @import("std");
const io_helper = @import("../io_helper.zig");
const style = @import("../cli/style.zig");

pub const DepsFile = struct {
    path: []const u8,
    format: FileFormat,

    pub const FileFormat = enum {
        pantry_json, // pantry.json (highest priority)
        pantry_jsonc, // pantry.jsonc
        deps_yaml, // deps.yaml (before TS configs - no runtime needed)
        deps_yml,
        dependencies_yaml,
        pkgx_yaml,
        config_deps_ts, // config/deps.ts (typed TS config - needs runtime)
        pantry_config_ts, // pantry.config.ts (needs runtime)
        package_json, // package.json (npm/bun/yarn compatible)
        package_jsonc, // Zig package.jsonc
        zig_json, // zig.json
        cargo_toml,
        pyproject_toml,
        requirements_txt,
        gemfile,
        go_mod,
        composer_json,
    };
};

/// Workspace file detection result
pub const WorkspaceFile = struct {
    path: []const u8,
    root_dir: []const u8,

    pub fn deinit(self: *WorkspaceFile, allocator: std.mem.Allocator) void {
        allocator.free(self.path);
        allocator.free(self.root_dir);
    }
};

/// Find dependency file in directory or parent directories
pub fn findDepsFile(allocator: std.mem.Allocator, start_dir: []const u8) !?DepsFile {
    const file_names = [_][]const u8{
        "pantry.json", // pantry.json (highest priority)
        "pantry.jsonc", // pantry.jsonc
        "deps.yaml", // deps.yaml (before TS configs - pure YAML, no runtime needed)
        "deps.yml",
        "dependencies.yaml",
        "pkgx.yaml",
        "config/deps.ts", // config/deps.ts (typed TS config - needs runtime)
        "pantry.config.ts", // pantry.config.ts (needs runtime)
        // Other package manager formats (lower priority, fallback only)
        "package.json", // package.json (npm/bun/yarn compatible)
        "package.jsonc", // Zig package.jsonc
        "zig.json", // zig.json
        "Cargo.toml",
        "pyproject.toml",
        "requirements.txt",
        "Gemfile",
        "go.mod",
        "composer.json",
    };

    var current_dir_buf: [std.fs.max_path_bytes]u8 = undefined;
    const current_dir = try io_helper.realpath(start_dir, &current_dir_buf);

    var dir_path = try allocator.dupe(u8, current_dir);
    defer allocator.free(dir_path);

    // Walk up the directory tree
    while (true) {
        // Try each dependency file name
        for (file_names, 0..) |file_name, i| {
            const full_path = try std.fs.path.join(allocator, &[_][]const u8{ dir_path, file_name });
            defer allocator.free(full_path);

            // Check if file exists
            io_helper.accessAbsolute(full_path, .{}) catch {
                continue;
            };

            // Found a dependency file!
            const format: DepsFile.FileFormat = @enumFromInt(i);
            return DepsFile{
                .path = try allocator.dupe(u8, full_path),
                .format = format,
            };
        }

        // Move to parent directory
        const parent = std.fs.path.dirname(dir_path) orelse break;
        if (std.mem.eql(u8, parent, dir_path)) break; // Reached root

        const new_dir = try allocator.dupe(u8, parent);
        allocator.free(dir_path);
        dir_path = new_dir;
    }

    return null;
}

/// Check if a filename is a recognized deps file
pub fn isDepsFile(filename: []const u8) bool {
    const deps_files = [_][]const u8{
        "deps.ts",
        "deps.yaml",
        "deps.yml",
        "dependencies.yaml",
        "dependencies.yml",
        "pkgx.yaml",
        "pkgx.yml",
        "pantry.config.ts",
        "pantry.config.js",
    };

    for (deps_files) |deps_file| {
        if (std.mem.eql(u8, filename, deps_file)) return true;
    }

    // Also check for config/deps.ts pattern
    if (std.mem.endsWith(u8, filename, "config/deps.ts")) return true;

    return false;
}

/// Infer format from filename
pub fn inferFormat(filename: []const u8) ?DepsFile.FileFormat {
    // Pantry formats first (highest priority)
    if (std.mem.eql(u8, filename, "pantry.json")) return .pantry_json;
    if (std.mem.eql(u8, filename, "pantry.jsonc")) return .pantry_jsonc;
    if (std.mem.endsWith(u8, filename, "config/deps.ts")) return .config_deps_ts;
    if (std.mem.eql(u8, filename, "pantry.config.ts")) return .pantry_config_ts;
    if (std.mem.eql(u8, filename, "deps.yaml")) return .deps_yaml;
    if (std.mem.eql(u8, filename, "deps.yml")) return .deps_yml;
    if (std.mem.eql(u8, filename, "dependencies.yaml")) return .dependencies_yaml;
    if (std.mem.eql(u8, filename, "pkgx.yaml")) return .pkgx_yaml;
    // Other package managers (fallback)
    if (std.mem.eql(u8, filename, "package.json")) return .package_json;
    if (std.mem.eql(u8, filename, "package.jsonc")) return .package_jsonc;
    if (std.mem.eql(u8, filename, "zig.json")) return .zig_json;
    if (std.mem.eql(u8, filename, "Cargo.toml")) return .cargo_toml;
    if (std.mem.eql(u8, filename, "pyproject.toml")) return .pyproject_toml;
    if (std.mem.eql(u8, filename, "requirements.txt")) return .requirements_txt;
    if (std.mem.eql(u8, filename, "Gemfile")) return .gemfile;
    if (std.mem.eql(u8, filename, "go.mod")) return .go_mod;
    if (std.mem.eql(u8, filename, "composer.json")) return .composer_json;
    return null;
}

/// Find workspace configuration file in directory or parent directories
/// Looks for files with a "workspaces" field (e.g., pantry.json)
pub fn findWorkspaceFile(allocator: std.mem.Allocator, start_dir: []const u8) !?WorkspaceFile {
    const workspace_file_names = [_][]const u8{
        "pantry.json", // Highest priority for workspace configs
        "pantry.jsonc",
        "package.json", // npm/bun compatible
    };

    var current_dir_buf: [std.fs.max_path_bytes]u8 = undefined;
    const current_dir = try io_helper.realpath(start_dir, &current_dir_buf);

    var dir_path = try allocator.dupe(u8, current_dir);
    defer allocator.free(dir_path);

    // Walk up the directory tree
    while (true) {
        // Try each workspace file name
        for (workspace_file_names) |file_name| {
            const full_path = try std.fs.path.join(allocator, &[_][]const u8{ dir_path, file_name });
            defer allocator.free(full_path);

            // Check if file exists
            io_helper.accessAbsolute(full_path, .{}) catch {
                continue;
            };

            // Read file to check if it has a workspaces field
            const contents = io_helper.readFileAlloc(allocator, full_path, 10 * 1024 * 1024) catch continue;
            defer allocator.free(contents);

            // Quick check for "workspaces" field (we'll do proper JSON parsing later)
            if (std.mem.indexOf(u8, contents, "\"workspaces\"") != null or
                std.mem.indexOf(u8, contents, "'workspaces'") != null)
            {
                // Found a workspace file!
                return WorkspaceFile{
                    .path = try allocator.dupe(u8, full_path),
                    .root_dir = try allocator.dupe(u8, dir_path),
                };
            }
        }

        // Move to parent directory
        const parent = std.fs.path.dirname(dir_path) orelse break;
        if (std.mem.eql(u8, parent, dir_path)) break; // Reached root

        const new_dir = try allocator.dupe(u8, parent);
        allocator.free(dir_path);
        dir_path = new_dir;
    }

    return null;
}

/// Combined result from findDepsAndWorkspaceFile
pub const DepsAndWorkspaceResult = struct {
    deps_file: ?DepsFile = null,
    workspace_file: ?WorkspaceFile = null,
};

/// Find both dependency file and workspace file in a single directory walk.
/// This avoids the overhead of two separate realpath + directory traversals.
pub fn findDepsAndWorkspaceFile(allocator: std.mem.Allocator, start_dir: []const u8) !DepsAndWorkspaceResult {
    const dep_file_names = [_][]const u8{
        "pantry.json",       "pantry.jsonc",     "deps.yaml",      "deps.yml",
        "dependencies.yaml", "pkgx.yaml",        "config/deps.ts", "pantry.config.ts",
        "package.json",      "package.jsonc",    "zig.json",       "Cargo.toml",
        "pyproject.toml",    "requirements.txt", "Gemfile",        "go.mod",
        "composer.json",
    };
    const workspace_file_names = [_][]const u8{ "pantry.json", "pantry.jsonc", "package.json" };

    var current_dir_buf: [std.fs.max_path_bytes]u8 = undefined;
    const current_dir = try io_helper.realpath(start_dir, &current_dir_buf);

    var dir_path = try allocator.dupe(u8, current_dir);
    defer allocator.free(dir_path);

    var result: DepsAndWorkspaceResult = .{};

    while (true) {
        // Check for deps file (if not already found)
        if (result.deps_file == null) {
            for (dep_file_names, 0..) |file_name, i| {
                const full_path = try std.fs.path.join(allocator, &[_][]const u8{ dir_path, file_name });
                defer allocator.free(full_path);
                io_helper.accessAbsolute(full_path, .{}) catch continue;
                const format: DepsFile.FileFormat = @enumFromInt(i);
                result.deps_file = DepsFile{
                    .path = try allocator.dupe(u8, full_path),
                    .format = format,
                };
                break;
            }
        }

        // Check for workspace file (if not already found)
        if (result.workspace_file == null) {
            for (workspace_file_names) |file_name| {
                const full_path = try std.fs.path.join(allocator, &[_][]const u8{ dir_path, file_name });
                defer allocator.free(full_path);
                io_helper.accessAbsolute(full_path, .{}) catch continue;

                // Quick read to check for "workspaces" field
                const contents = io_helper.readFileAlloc(allocator, full_path, 10 * 1024 * 1024) catch continue;
                defer allocator.free(contents);

                if (std.mem.indexOf(u8, contents, "\"workspaces\"") != null or
                    std.mem.indexOf(u8, contents, "'workspaces'") != null)
                {
                    result.workspace_file = WorkspaceFile{
                        .path = try allocator.dupe(u8, full_path),
                        .root_dir = try allocator.dupe(u8, dir_path),
                    };
                    break;
                }
            }
        }

        // If we found both, we're done
        if (result.deps_file != null and result.workspace_file != null) break;

        // Move to parent directory
        const parent = std.fs.path.dirname(dir_path) orelse break;
        if (std.mem.eql(u8, parent, dir_path)) break;

        const new_dir = try allocator.dupe(u8, parent);
        allocator.free(dir_path);
        dir_path = new_dir;
    }

    return result;
}

test "findDepsFile" {
    const allocator = std.testing.allocator;

    // Test with current directory
    const result = try findDepsFile(allocator, ".");
    if (result) |deps_file| {
        defer allocator.free(deps_file.path);
        style.print("Found: {s}\n", .{deps_file.path});
    }
}
