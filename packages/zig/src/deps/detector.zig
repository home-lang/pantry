const std = @import("std");

pub const DepsFile = struct {
    path: []const u8,
    format: FileFormat,

    pub const FileFormat = enum {
        pantry_json,       // pantry.json
        pantry_jsonc,      // pantry.jsonc
        deps_yaml,
        deps_yml,
        dependencies_yaml,
        pkgx_yaml,
        package_json,
        package_jsonc,     // Zig package.jsonc
        zig_json,          // zig.json
        cargo_toml,
        pyproject_toml,
        requirements_txt,
        gemfile,
        go_mod,
        composer_json,
    };
};

/// Find dependency file in directory or parent directories
pub fn findDepsFile(allocator: std.mem.Allocator, start_dir: []const u8) !?DepsFile {
    const file_names = [_][]const u8{
        "pantry.json",        // pantry.json (highest priority)
        "pantry.jsonc",       // pantry.jsonc
        "deps.yaml",
        "deps.yml",
        "dependencies.yaml",
        "pkgx.yaml",
        "package.json",
        "package.jsonc",      // Zig package.jsonc
        "zig.json",           // zig.json
        "Cargo.toml",
        "pyproject.toml",
        "requirements.txt",
        "Gemfile",
        "go.mod",
        "composer.json",
    };

    var current_dir_buf: [std.fs.max_path_bytes]u8 = undefined;
    const current_dir = try std.fs.realpath(start_dir, &current_dir_buf);

    var dir_path = try allocator.dupe(u8, current_dir);
    defer allocator.free(dir_path);

    // Walk up the directory tree
    while (true) {
        // Try each dependency file name
        for (file_names, 0..) |file_name, i| {
            const full_path = try std.fs.path.join(allocator, &[_][]const u8{ dir_path, file_name });
            defer allocator.free(full_path);

            // Check if file exists
            std.fs.accessAbsolute(full_path, .{}) catch {
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
        "deps.yaml",
        "deps.yml",
        "dependencies.yaml",
        "dependencies.yml",
        "pkgx.yaml",
        "pkgx.yml",
        "launchpad.config.ts",
        "launchpad.config.js",
    };

    for (deps_files) |deps_file| {
        if (std.mem.eql(u8, filename, deps_file)) return true;
    }

    return false;
}

/// Infer format from filename
pub fn inferFormat(filename: []const u8) ?DepsFile.FileFormat {
    if (std.mem.eql(u8, filename, "pantry.json")) return .pantry_json;
    if (std.mem.eql(u8, filename, "pantry.jsonc")) return .pantry_jsonc;
    if (std.mem.eql(u8, filename, "deps.yaml")) return .deps_yaml;
    if (std.mem.eql(u8, filename, "deps.yml")) return .deps_yml;
    if (std.mem.eql(u8, filename, "dependencies.yaml")) return .dependencies_yaml;
    if (std.mem.eql(u8, filename, "pkgx.yaml")) return .pkgx_yaml;
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

test "findDepsFile" {
    const allocator = std.testing.allocator;

    // Test with current directory
    const result = try findDepsFile(allocator, ".");
    if (result) |deps_file| {
        defer allocator.free(deps_file.path);
        std.debug.print("Found: {s}\n", .{deps_file.path});
    }
}
