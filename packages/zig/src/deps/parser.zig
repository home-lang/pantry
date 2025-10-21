const std = @import("std");
const detector = @import("detector.zig");

pub const PackageDependency = struct {
    name: []const u8,
    version: []const u8,
    global: bool = false,

    pub fn deinit(self: *PackageDependency, allocator: std.mem.Allocator) void {
        allocator.free(self.name);
        allocator.free(self.version);
    }
};

/// Infer dependencies from a file based on its format
pub fn inferDependencies(
    allocator: std.mem.Allocator,
    deps_file: detector.DepsFile,
) ![]PackageDependency {
    return switch (deps_file.format) {
        .deps_yaml, .deps_yml, .dependencies_yaml, .pkgx_yaml => try parseDepsFile(allocator, deps_file.path),
        .package_json => try parsePackageJson(allocator, deps_file.path),
        .cargo_toml => try parseCargoToml(allocator, deps_file.path),
        .pyproject_toml => try parsePyprojectToml(allocator, deps_file.path),
        .requirements_txt => try parseRequirementsTxt(allocator, deps_file.path),
        .gemfile => try parseGemfile(allocator, deps_file.path),
        .go_mod => try parseGoMod(allocator, deps_file.path),
        .composer_json => try parseComposerJson(allocator, deps_file.path),
    };
}

/// Parse a deps.yaml or similar file to extract package dependencies
/// Handles both simple format and object format with global flags:
/// global: true          # Top-level global flag
/// dependencies:
///   nodejs.org: 20.11.0     # Simple format (inherits top-level global)
///   python.org:             # Object format with explicit global
///     version: ~3.12
///     global: true
pub fn parseDepsFile(allocator: std.mem.Allocator, file_path: []const u8) ![]PackageDependency {
    // Read file contents
    const file = try std.fs.openFileAbsolute(file_path, .{});
    defer file.close();

    const content = try file.readToEndAlloc(allocator, 10 * 1024 * 1024); // 10MB max
    defer allocator.free(content);

    var deps = try std.ArrayList(PackageDependency).initCapacity(allocator, 16);
    errdefer {
        for (deps.items) |*dep| dep.deinit(allocator);
        deps.deinit(allocator);
    }

    // Parse top-level global flag
    var top_level_global = false;
    var lines_iter = std.mem.tokenizeScalar(u8, content, '\n');
    while (lines_iter.next()) |line| {
        const trimmed = std.mem.trim(u8, line, " \t\r");
        if (trimmed.len == 0 or trimmed[0] == '#') continue;

        // Check for top-level "global: true"
        if (std.mem.startsWith(u8, trimmed, "global:")) {
            const value = std.mem.trim(u8, trimmed[7..], " \t");
            if (std.mem.eql(u8, value, "true")) {
                top_level_global = true;
            }
        }

        // Stop at dependencies section
        if (std.mem.eql(u8, trimmed, "dependencies:")) {
            break;
        }
    }

    // Parse dependencies
    var lines = std.mem.tokenizeScalar(u8, content, '\n');
    var in_dependencies = false;
    var current_package: ?[]const u8 = null;
    var current_version: ?[]const u8 = null;
    var current_global: ?bool = null;

    while (lines.next()) |line| {
        const trimmed = std.mem.trim(u8, line, " \t\r");

        // Skip empty lines and comments
        if (trimmed.len == 0 or trimmed[0] == '#') continue;

        // Check if we're entering dependencies section
        if (std.mem.eql(u8, trimmed, "dependencies:")) {
            in_dependencies = true;
            continue;
        }

        if (in_dependencies) {
            // Count leading spaces to determine indentation level
            var indent_level: usize = 0;
            for (line) |c| {
                if (c == ' ') indent_level += 1
                else if (c == '\t') indent_level += 2
                else break;
            }

            // Level 0 = end of dependencies section
            if (indent_level == 0) {
                // Save pending package if any
                if (current_package) |pkg| {
                    if (current_version) |ver| {
                        try deps.append(allocator, .{
                            .name = try allocator.dupe(u8, pkg),
                            .version = try allocator.dupe(u8, ver),
                            .global = current_global orelse top_level_global,
                        });
                    }
                }
                in_dependencies = false;
                continue;
            }

            if (std.mem.indexOf(u8, trimmed, ":")) |colon_pos| {
                const key = std.mem.trim(u8, trimmed[0..colon_pos], " \t");
                const value = std.mem.trim(u8, trimmed[colon_pos + 1 ..], " \t");

                // Level 1 = package name
                if (indent_level <= 4) {
                    // Save previous package if any
                    if (current_package) |pkg| {
                        if (current_version) |ver| {
                            try deps.append(allocator, .{
                                .name = try allocator.dupe(u8, pkg),
                                .version = try allocator.dupe(u8, ver),
                                .global = current_global orelse top_level_global,
                            });
                        }
                    }

                    // Start new package
                    current_package = key;
                    current_version = null;
                    current_global = null;

                    // If value is present, it's simple format: "package: version"
                    if (value.len > 0) {
                        var version = value;
                        // Remove version constraint prefix
                        if (version.len > 0 and (version[0] == '^' or version[0] == '~' or version[0] == '=')) {
                            version = version[1..];
                        }
                        if (std.mem.startsWith(u8, version, ">=")) {
                            version = version[2..];
                        }
                        current_version = version;
                    }
                } else {
                    // Level 2+ = package properties (version, global)
                    if (std.mem.eql(u8, key, "version")) {
                        var version = value;
                        if (version.len > 0 and (version[0] == '^' or version[0] == '~' or version[0] == '=')) {
                            version = version[1..];
                        }
                        if (std.mem.startsWith(u8, version, ">=")) {
                            version = version[2..];
                        }
                        current_version = version;
                    } else if (std.mem.eql(u8, key, "global")) {
                        current_global = std.mem.eql(u8, value, "true");
                    }
                }
            }
        }
    }

    // Save last package if any
    if (current_package) |pkg| {
        if (current_version) |ver| {
            try deps.append(allocator, .{
                .name = try allocator.dupe(u8, pkg),
                .version = try allocator.dupe(u8, ver),
                .global = current_global orelse top_level_global,
            });
        }
    }

    return deps.toOwnedSlice(allocator);
}

test "parseDepsFile" {
    const allocator = std.testing.allocator;

    // Create a test file
    const test_content =
        \\dependencies:
        \\  nodejs.org: 20.11.0
        \\  python.org: ~3.12
        \\  bun.sh: ^1.0.0
        \\
    ;

    var tmp_dir = std.testing.tmpDir(.{});
    defer tmp_dir.cleanup();

    const file = try tmp_dir.dir.createFile("test-deps.yaml", .{});
    defer file.close();
    try file.writeAll(test_content);

    const path = try tmp_dir.dir.realpathAlloc(allocator, "test-deps.yaml");
    defer allocator.free(path);

    const deps = try parseDepsFile(allocator, path);
    defer {
        for (deps) |*dep| {
            var d = dep.*;
            d.deinit(allocator);
        }
        allocator.free(deps);
    }

    try std.testing.expectEqual(@as(usize, 3), deps.len);
    try std.testing.expectEqualStrings("nodejs.org", deps[0].name);
    try std.testing.expectEqualStrings("20.11.0", deps[0].version);
    try std.testing.expectEqualStrings("python.org", deps[1].name);
    try std.testing.expectEqualStrings("3.12", deps[1].version);
}

/// Parse package.json to infer Node.js version from engines field
fn parsePackageJson(allocator: std.mem.Allocator, file_path: []const u8) ![]PackageDependency {
    const file = try std.fs.openFileAbsolute(file_path, .{});
    defer file.close();

    const content = try file.readToEndAlloc(allocator, 10 * 1024 * 1024);
    defer allocator.free(content);

    var deps = try std.ArrayList(PackageDependency).initCapacity(allocator, 4);
    errdefer {
        for (deps.items) |*dep| dep.deinit(allocator);
        deps.deinit(allocator);
    }

    // Look for "engines": { "node": ">=20.0.0" }
    if (std.mem.indexOf(u8, content, "\"engines\"")) |engines_pos| {
        if (std.mem.indexOf(u8, content[engines_pos..], "\"node\"")) |node_pos| {
            const after_node = content[engines_pos + node_pos + 7 ..];
            if (std.mem.indexOf(u8, after_node, "\"")) |quote1| {
                const version_start = after_node[quote1 + 1 ..];
                if (std.mem.indexOf(u8, version_start, "\"")) |quote2| {
                    var version = version_start[0..quote2];
                    // Strip version prefix
                    if (version.len > 0 and (version[0] == '^' or version[0] == '~' or version[0] == '=')) {
                        version = version[1..];
                    }
                    if (std.mem.startsWith(u8, version, ">=")) {
                        version = version[2..];
                    }

                    try deps.append(allocator, .{
                        .name = try allocator.dupe(u8, "nodejs.org"),
                        .version = try allocator.dupe(u8, version),
                    });
                }
            }
        }
    }

    return deps.toOwnedSlice(allocator);
}

/// Parse Cargo.toml to infer Rust dependency
fn parseCargoToml(_: std.mem.Allocator, _: []const u8) ![]PackageDependency {
    // For now, just return empty slice - would need TOML parser
    return &[_]PackageDependency{};
}

/// Parse pyproject.toml to infer Python dependency  
fn parsePyprojectToml(_: std.mem.Allocator, _: []const u8) ![]PackageDependency {
    // For now, just return empty slice - would need TOML parser
    return &[_]PackageDependency{};
}

/// Parse requirements.txt to infer Python dependency
fn parseRequirementsTxt(allocator: std.mem.Allocator, file_path: []const u8) ![]PackageDependency {
    _ = file_path;
    // Infer Python is needed if requirements.txt exists
    var deps = try std.ArrayList(PackageDependency).initCapacity(allocator, 1);
    try deps.append(allocator, .{
        .name = try allocator.dupe(u8, "python.org"),
        .version = try allocator.dupe(u8, "3.12.0"),
    });
    return deps.toOwnedSlice(allocator);
}

/// Parse Gemfile to infer Ruby dependency
fn parseGemfile(allocator: std.mem.Allocator, file_path: []const u8) ![]PackageDependency {
    _ = file_path;
    // Infer Ruby is needed if Gemfile exists
    var deps = try std.ArrayList(PackageDependency).initCapacity(allocator, 1);
    try deps.append(allocator, .{
        .name = try allocator.dupe(u8, "ruby-lang.org"),
        .version = try allocator.dupe(u8, "3.3.0"),
    });
    return deps.toOwnedSlice(allocator);
}

/// Parse go.mod to infer Go dependency
fn parseGoMod(allocator: std.mem.Allocator, file_path: []const u8) ![]PackageDependency {
    _ = file_path;
    // Infer Go is needed if go.mod exists
    var deps = try std.ArrayList(PackageDependency).initCapacity(allocator, 1);
    try deps.append(allocator, .{
        .name = try allocator.dupe(u8, "go.dev"),
        .version = try allocator.dupe(u8, "1.21.0"),
    });
    return deps.toOwnedSlice(allocator);
}

/// Parse composer.json to infer PHP dependency
fn parseComposerJson(allocator: std.mem.Allocator, file_path: []const u8) ![]PackageDependency {
    _ = file_path;
    // Infer PHP is needed if composer.json exists
    var deps = try std.ArrayList(PackageDependency).initCapacity(allocator, 1);
    try deps.append(allocator, .{
        .name = try allocator.dupe(u8, "php.net"),
        .version = try allocator.dupe(u8, "8.3.0"),
    });
    return deps.toOwnedSlice(allocator);
}
