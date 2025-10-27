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
        .package_jsonc, .zig_json, .pantry_json, .pantry_jsonc => try parseZigPackageJson(allocator, deps_file.path),
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

/// Source resolution preferences
pub const SourceResolutionOrder = struct {
    order: []const []const u8 = &[_][]const u8{ "pkgx", "npm", "github" },

    pub fn default() SourceResolutionOrder {
        return .{
            .order = &[_][]const u8{ "pkgx", "npm", "github" },
        };
    }
};

/// Detect package source from package name/identifier
/// Returns the detected source type and additional metadata
pub const SourceDetection = struct {
    source: []const u8,
    repo: ?[]const u8 = null,
    url: ?[]const u8 = null,

    pub fn fromPackageName(pkg_name: []const u8) SourceDetection {
        // Local path detection (starts with ./ or ../ or ~/ or /)
        if (std.mem.startsWith(u8, pkg_name, "./") or
            std.mem.startsWith(u8, pkg_name, "../") or
            std.mem.startsWith(u8, pkg_name, "~/") or
            std.mem.startsWith(u8, pkg_name, "/"))
        {
            return .{
                .source = "local",
                .url = pkg_name,
            };
        }

        // HTTP/HTTPS URL detection
        if (std.mem.startsWith(u8, pkg_name, "http://") or std.mem.startsWith(u8, pkg_name, "https://")) {
            return .{
                .source = "http",
                .url = pkg_name,
            };
        }

        // Git URL detection
        if (std.mem.endsWith(u8, pkg_name, ".git")) {
            return .{
                .source = "git",
                .url = pkg_name,
            };
        }

        // GitHub owner/repo format detection
        if (std.mem.indexOf(u8, pkg_name, "/")) |_| {
            // Check if it's a scoped npm package (@org/package)
            if (pkg_name[0] == '@') {
                return .{
                    .source = "npm",
                };
            }
            // Otherwise assume GitHub owner/repo format
            return .{
                .source = "github",
                .repo = pkg_name,
            };
        }

        // Domain format detection (e.g., nodejs.org, bun.sh)
        if (std.mem.indexOf(u8, pkg_name, ".")) |_| {
            // Check if it contains common TLDs or domain patterns
            if (std.mem.endsWith(u8, pkg_name, ".org") or
                std.mem.endsWith(u8, pkg_name, ".com") or
                std.mem.endsWith(u8, pkg_name, ".dev") or
                std.mem.endsWith(u8, pkg_name, ".io") or
                std.mem.endsWith(u8, pkg_name, ".sh") or
                std.mem.endsWith(u8, pkg_name, ".net"))
            {
                return .{
                    .source = "pkgx",
                };
            }
        }

        // Default: Could be npm or pkgx
        // This will be resolved based on resolution order at runtime
        return .{
            .source = "auto", // Will check pkgx first, then npm, then github
        };
    }
};

/// Extended package dependency with source information
pub const ExtendedPackageDependency = struct {
    name: []const u8,
    version: []const u8,
    source: []const u8 = "pkgx", // pkgx, github, npm, http, git
    url: ?[]const u8 = null,
    repo: ?[]const u8 = null,     // For github: owner/repo
    branch: ?[]const u8 = null,   // For git
    tag: ?[]const u8 = null,      // For github releases
    registry: ?[]const u8 = null, // For npm
    global: bool = false,

    pub fn deinit(self: *ExtendedPackageDependency, allocator: std.mem.Allocator) void {
        allocator.free(self.name);
        allocator.free(self.version);
        allocator.free(self.source);
        if (self.url) |u| allocator.free(u);
        if (self.repo) |r| allocator.free(r);
        if (self.branch) |b| allocator.free(b);
        if (self.tag) |t| allocator.free(t);
        if (self.registry) |r| allocator.free(r);
    }

    pub fn toSimple(self: *const ExtendedPackageDependency, allocator: std.mem.Allocator) !PackageDependency {
        return PackageDependency{
            .name = try allocator.dupe(u8, self.name),
            .version = try allocator.dupe(u8, self.version),
            .global = self.global,
        };
    }
};

/// Parse package.jsonc or zig.json for Zig package dependencies
/// Supports multiple sources: GitHub, npm, HTTP, git, pkgx
///
/// Simplified npm-style syntax (source auto-detected):
/// {
///   "dependencies": {
///     "typescript": "^5.0.0",           // Auto-detects from npm/pkgx
///     "nodejs.org": "20.11.0",          // pkgx (domain format)
///     "owner/repo": "^1.0.0",           // GitHub (owner/repo format)
///     "https://example.com/lib.tar.gz": "1.0.0"  // HTTP (URL format)
///   }
/// }
///
/// Explicit source syntax:
/// {
///   "dependencies": {
///     "bunpress": {
///       "source": "github",
///       "repo": "stacksjs/bunpress",
///       "version": "latest"
///     },
///     "somelib": {
///       "source": "npm",
///       "version": "^1.0.0"
///     }
///   }
/// }
pub fn parseZigPackageJson(allocator: std.mem.Allocator, file_path: []const u8) ![]PackageDependency {
    const file = try std.fs.openFileAbsolute(file_path, .{});
    defer file.close();

    // Read and strip comments for JSONC support
    const content = try file.readToEndAlloc(allocator, 10 * 1024 * 1024);
    defer allocator.free(content);

    const json_content = try stripJsonComments(allocator, content);
    defer allocator.free(json_content);

    // Parse JSON
    const parsed = try std.json.parseFromSlice(
        std.json.Value,
        allocator,
        json_content,
        .{},
    );
    defer parsed.deinit();

    var deps = try std.ArrayList(PackageDependency).initCapacity(allocator, 8);
    errdefer {
        for (deps.items) |*dep| dep.deinit(allocator);
        deps.deinit(allocator);
    }

    // Get dependencies object
    if (parsed.value.object.get("dependencies")) |deps_value| {
        if (deps_value != .object) return deps.toOwnedSlice(allocator);

        var it = deps_value.object.iterator();
        while (it.next()) |entry| {
            const pkg_name = entry.key_ptr.*;
            const pkg_spec = entry.value_ptr.*;

            var version: []const u8 = "latest";
            var source: []const u8 = "auto";
            var url: ?[]const u8 = null;
            var repo: ?[]const u8 = null;
            var tag: ?[]const u8 = null;
            var branch: ?[]const u8 = null;
            var global = false;

            // Handle simplified npm-style syntax: "package": "version"
            if (pkg_spec == .string) {
                version = pkg_spec.string;

                // Auto-detect source from package name
                const detection = SourceDetection.fromPackageName(pkg_name);
                source = detection.source;

                // Set detected metadata
                if (detection.repo) |r| {
                    repo = r;
                }
                if (detection.url) |u| {
                    url = u;
                }
            }
            // Handle explicit object format: "package": { ... }
            else if (pkg_spec == .object) {
                if (pkg_spec.object.get("version")) |v| {
                    if (v == .string) version = v.string;
                }
                if (pkg_spec.object.get("source")) |s| {
                    if (s == .string) source = s.string;
                }
                if (pkg_spec.object.get("url")) |u| {
                    if (u == .string) url = u.string;
                }
                if (pkg_spec.object.get("repo")) |r| {
                    if (r == .string) repo = r.string;
                }
                if (pkg_spec.object.get("tag")) |t| {
                    if (t == .string) tag = t.string;
                }
                if (pkg_spec.object.get("branch")) |b| {
                    if (b == .string) branch = b.string;
                }
                if (pkg_spec.object.get("global")) |g| {
                    if (g == .bool) global = g.bool;
                }
            }

            // Build full name with source prefix for tracking
            const full_name = blk: {
                // If source is explicit and has additional metadata, use it
                if (!std.mem.eql(u8, source, "auto")) {
                    if (std.mem.eql(u8, source, "github")) {
                        const github_repo = repo orelse pkg_name;
                        break :blk try std.fmt.allocPrint(allocator, "github:{s}", .{github_repo});
                    } else if (std.mem.eql(u8, source, "npm")) {
                        break :blk try std.fmt.allocPrint(allocator, "npm:{s}", .{pkg_name});
                    } else if (std.mem.eql(u8, source, "http")) {
                        const http_url = url orelse pkg_name;
                        break :blk try std.fmt.allocPrint(allocator, "http:{s}", .{http_url});
                    } else if (std.mem.eql(u8, source, "git")) {
                        const git_url = url orelse pkg_name;
                        break :blk try std.fmt.allocPrint(allocator, "git:{s}", .{git_url});
                    } else if (std.mem.eql(u8, source, "local")) {
                        const local_path = url orelse pkg_name;
                        break :blk try std.fmt.allocPrint(allocator, "local:{s}", .{local_path});
                    } else if (std.mem.eql(u8, source, "pkgx")) {
                        break :blk try allocator.dupe(u8, pkg_name);
                    }
                }

                // Auto-detection: mark with "auto:" prefix for later resolution
                break :blk try std.fmt.allocPrint(allocator, "auto:{s}", .{pkg_name});
            };

            try deps.append(allocator, .{
                .name = full_name,
                .version = try allocator.dupe(u8, version),
                .global = global,
            });
        }
    }

    return try deps.toOwnedSlice(allocator);
}

/// Strip JSON comments (// and /* */) and trailing commas for JSONC support
fn stripJsonComments(allocator: std.mem.Allocator, content: []const u8) ![]const u8 {
    var result = try std.ArrayList(u8).initCapacity(allocator, content.len);
    errdefer result.deinit(allocator);

    var i: usize = 0;
    var in_string = false;
    var escape_next = false;

    while (i < content.len) {
        const c = content[i];

        // Track string state (to avoid stripping // inside strings like "https://...")
        if (c == '"' and !escape_next) {
            in_string = !in_string;
            try result.append(allocator, c);
            i += 1;
            escape_next = false;
            continue;
        }

        // Track escape sequences within strings
        if (in_string) {
            if (c == '\\' and !escape_next) {
                escape_next = true;
            } else {
                escape_next = false;
            }
            try result.append(allocator, c);
            i += 1;
            continue;
        }

        // Only strip comments when NOT inside a string
        // Handle // comments
        if (!in_string and i + 1 < content.len and content[i] == '/' and content[i + 1] == '/') {
            // Skip until end of line
            while (i < content.len and content[i] != '\n') : (i += 1) {}
            if (i < content.len) {
                try result.append(allocator, '\n'); // Keep newline
                i += 1;
            }
            continue;
        }

        // Handle /* */ comments
        if (!in_string and i + 1 < content.len and content[i] == '/' and content[i + 1] == '*') {
            // Skip until */
            i += 2;
            while (i + 1 < content.len) : (i += 1) {
                if (content[i] == '*' and content[i + 1] == '/') {
                    i += 2;
                    break;
                }
            }
            continue;
        }

        // Regular character
        try result.append(allocator, content[i]);
        i += 1;
    }

    // Strip trailing commas (e.g., ",}" or ",]")
    const raw_json = result.items;
    var cleaned = try std.ArrayList(u8).initCapacity(allocator, raw_json.len);
    defer result.deinit(allocator);
    errdefer cleaned.deinit(allocator);

    var j: usize = 0;
    while (j < raw_json.len) {
        if (raw_json[j] == ',') {
            // Look ahead to see if this is a trailing comma
            var k = j + 1;
            while (k < raw_json.len and (raw_json[k] == ' ' or raw_json[k] == '\t' or raw_json[k] == '\n' or raw_json[k] == '\r')) : (k += 1) {}

            // If next non-whitespace is } or ], skip the comma
            if (k < raw_json.len and (raw_json[k] == '}' or raw_json[k] == ']')) {
                j += 1;
                continue;
            }
        }

        try cleaned.append(allocator, raw_json[j]);
        j += 1;
    }

    return cleaned.toOwnedSlice(allocator);
}

test "stripJsonComments" {
    const allocator = std.testing.allocator;

    const input =
        \\{
        \\  // This is a comment
        \\  "name": "test", /* inline comment */
        \\  "version": "1.0.0"
        \\}
    ;

    const output = try stripJsonComments(allocator, input);
    defer allocator.free(output);

    try std.testing.expect(std.mem.indexOf(u8, output, "//") == null);
    try std.testing.expect(std.mem.indexOf(u8, output, "/*") == null);
    try std.testing.expect(std.mem.indexOf(u8, output, "name") != null);
}

test "SourceDetection.fromPackageName detects GitHub owner/repo" {
    const detection = SourceDetection.fromPackageName("stacksjs/bunpress");
    try std.testing.expectEqualStrings("github", detection.source);
    try std.testing.expect(detection.repo != null);
    try std.testing.expectEqualStrings("stacksjs/bunpress", detection.repo.?);
}

test "SourceDetection.fromPackageName detects HTTP URL" {
    const detection = SourceDetection.fromPackageName("https://example.com/lib.tar.gz");
    try std.testing.expectEqualStrings("http", detection.source);
    try std.testing.expect(detection.url != null);
}

test "SourceDetection.fromPackageName detects pkgx domain" {
    const detection = SourceDetection.fromPackageName("nodejs.org");
    try std.testing.expectEqualStrings("pkgx", detection.source);
}

test "SourceDetection.fromPackageName detects scoped npm package" {
    const detection = SourceDetection.fromPackageName("@types/node");
    try std.testing.expectEqualStrings("npm", detection.source);
}

test "SourceDetection.fromPackageName handles ambiguous names" {
    const detection = SourceDetection.fromPackageName("typescript");
    try std.testing.expectEqualStrings("auto", detection.source);
}

test "parseZigPackageJson with explicit GitHub source" {
    const allocator = std.testing.allocator;

    const test_content =
        \\{
        \\  "dependencies": {
        \\    "bunpress": {
        \\      "source": "github",
        \\      "repo": "stacksjs/bunpress",
        \\      "version": "latest"
        \\    }
        \\  }
        \\}
    ;

    var tmp_dir = std.testing.tmpDir(.{});
    defer tmp_dir.cleanup();

    const file = try tmp_dir.dir.createFile("package.jsonc", .{});
    defer file.close();
    try file.writeAll(test_content);

    const path = try tmp_dir.dir.realpathAlloc(allocator, "package.jsonc");
    defer allocator.free(path);

    const deps = try parseZigPackageJson(allocator, path);
    defer {
        for (deps) |*dep| {
            var d = dep.*;
            d.deinit(allocator);
        }
        allocator.free(deps);
    }

    try std.testing.expectEqual(@as(usize, 1), deps.len);
    try std.testing.expect(std.mem.startsWith(u8, deps[0].name, "github:"));
    try std.testing.expectEqualStrings("latest", deps[0].version);
}

test "parseZigPackageJson with simplified npm-style syntax" {
    const allocator = std.testing.allocator;

    const test_content =
        \\{
        \\  "dependencies": {
        \\    "stacksjs/bunpress": "^1.0.0",
        \\    "nodejs.org": "20.11.0",
        \\    "typescript": "^5.0.0",
        \\    "@types/node": "^20.0.0"
        \\  }
        \\}
    ;

    var tmp_dir = std.testing.tmpDir(.{});
    defer tmp_dir.cleanup();

    const file = try tmp_dir.dir.createFile("package.jsonc", .{});
    defer file.close();
    try file.writeAll(test_content);

    const path = try tmp_dir.dir.realpathAlloc(allocator, "package.jsonc");
    defer allocator.free(path);

    const deps = try parseZigPackageJson(allocator, path);
    defer {
        for (deps) |*dep| {
            var d = dep.*;
            d.deinit(allocator);
        }
        allocator.free(deps);
    }

    try std.testing.expectEqual(@as(usize, 4), deps.len);

    // Check that sources were detected correctly
    var found_github = false;
    var found_pkgx = false;
    var found_auto = false;
    var found_npm = false;

    for (deps) |dep| {
        if (std.mem.startsWith(u8, dep.name, "github:")) found_github = true;
        if (std.mem.indexOf(u8, dep.name, ":") == null) found_pkgx = true;
        if (std.mem.startsWith(u8, dep.name, "auto:")) found_auto = true;
        if (std.mem.startsWith(u8, dep.name, "npm:")) found_npm = true;
    }

    try std.testing.expect(found_github); // stacksjs/bunpress
    try std.testing.expect(found_npm); // @types/node
}

test "parseZigPackageJson with mixed explicit and simplified syntax" {
    const allocator = std.testing.allocator;

    const test_content =
        \\{
        \\  "dependencies": {
        \\    "explicit-github": {
        \\      "source": "github",
        \\      "repo": "user/repo",
        \\      "version": "1.0.0"
        \\    },
        \\    "owner/repo": "^2.0.0",
        \\    "nodejs.org": "20.11.0"
        \\  }
        \\}
    ;

    var tmp_dir = std.testing.tmpDir(.{});
    defer tmp_dir.cleanup();

    const file = try tmp_dir.dir.createFile("package.jsonc", .{});
    defer file.close();
    try file.writeAll(test_content);

    const path = try tmp_dir.dir.realpathAlloc(allocator, "package.jsonc");
    defer allocator.free(path);

    const deps = try parseZigPackageJson(allocator, path);
    defer {
        for (deps) |*dep| {
            var d = dep.*;
            d.deinit(allocator);
        }
        allocator.free(deps);
    }

    try std.testing.expectEqual(@as(usize, 3), deps.len);
}
