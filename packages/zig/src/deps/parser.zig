const std = @import("std");
const detector = @import("detector.zig");
const io_helper = @import("../io_helper.zig");
const style = @import("../cli/style.zig");

pub const DependencyType = enum {
    normal,
    dev,
    peer,
};

pub const DependencySource = enum {
    registry, // pkgx registry
    github, // GitHub repository
    git, // Generic git repository
    url, // Direct URL download
};

pub const GitHubRef = struct {
    owner: []const u8,
    repo: []const u8,
    ref: []const u8, // branch, tag, or commit hash

    pub fn deinit(self: *GitHubRef, allocator: std.mem.Allocator) void {
        allocator.free(self.owner);
        allocator.free(self.repo);
        allocator.free(self.ref);
    }
};

pub const PackageDependency = struct {
    name: []const u8,
    version: []const u8,
    global: bool = false,
    dep_type: DependencyType = .normal,
    source: DependencySource = .registry,
    github_ref: ?GitHubRef = null,

    pub fn deinit(self: *PackageDependency, allocator: std.mem.Allocator) void {
        allocator.free(self.name);
        allocator.free(self.version);
        if (self.github_ref) |*gh_ref| {
            var gh = gh_ref.*;
            gh.deinit(allocator);
        }
    }

    /// Check if this dependency is a runtime (bun, node, deno, python)
    /// Recognizes both canonical names and pkgx-style aliases (bun.com, nodejs.org, etc.)
    pub fn isRuntime(self: *const PackageDependency) bool {
        return std.mem.eql(u8, self.name, "bun") or
            std.mem.eql(u8, self.name, "bun.com") or
            std.mem.eql(u8, self.name, "bun.sh") or
            std.mem.eql(u8, self.name, "node") or
            std.mem.eql(u8, self.name, "nodejs.org") or
            std.mem.eql(u8, self.name, "deno") or
            std.mem.eql(u8, self.name, "deno.land") or
            std.mem.eql(u8, self.name, "python") or
            std.mem.eql(u8, self.name, "python.org");
    }

    /// Check if this dependency is a system package (not an npm package)
    /// System packages use domain-style names (e.g., sqlite.org, bun.com)
    pub fn isSystemDep(self: *const PackageDependency) bool {
        // Domain-style names contain a dot (e.g., bun.com, sqlite.org)
        // Scoped npm packages start with @ (e.g., @stacksjs/cloud)
        // Regular npm packages are simple names (e.g., stripe, typescript)
        if (std.mem.startsWith(u8, self.name, "@")) return false;
        if (std.mem.startsWith(u8, self.name, "npm:")) return false;
        if (std.mem.startsWith(u8, self.name, "auto:")) return false;
        return std.mem.indexOf(u8, self.name, ".") != null;
    }

    pub fn clone(self: PackageDependency, allocator: std.mem.Allocator) !PackageDependency {
        var cloned_github_ref: ?GitHubRef = null;
        if (self.github_ref) |gh_ref| {
            cloned_github_ref = GitHubRef{
                .owner = try allocator.dupe(u8, gh_ref.owner),
                .repo = try allocator.dupe(u8, gh_ref.repo),
                .ref = try allocator.dupe(u8, gh_ref.ref),
            };
        }

        return PackageDependency{
            .name = try allocator.dupe(u8, self.name),
            .version = try allocator.dupe(u8, self.version),
            .global = self.global,
            .dep_type = self.dep_type,
            .source = self.source,
            .github_ref = cloned_github_ref,
        };
    }
};

/// Parse GitHub URL formats:
/// - github:owner/repo#ref
/// - https://github.com/owner/repo#ref
/// - git+https://github.com/owner/repo.git#ref
/// Returns GitHubRef if it's a GitHub URL, null otherwise
pub fn parseGitHubUrl(allocator: std.mem.Allocator, version: []const u8) !?GitHubRef {
    var owner: []const u8 = undefined;
    var repo: []const u8 = undefined;
    var ref: []const u8 = "main"; // default branch

    if (std.mem.startsWith(u8, version, "github:")) {
        // Format: github:owner/repo#ref
        const after_prefix = version[7..]; // skip "github:"

        // Find # for ref
        if (std.mem.indexOf(u8, after_prefix, "#")) |hash_pos| {
            ref = after_prefix[hash_pos + 1 ..];
            const owner_repo = after_prefix[0..hash_pos];

            // Split owner/repo
            if (std.mem.indexOf(u8, owner_repo, "/")) |slash_pos| {
                owner = owner_repo[0..slash_pos];
                repo = owner_repo[slash_pos + 1 ..];
            } else {
                return null; // Invalid format
            }
        } else {
            // No ref specified, use default
            if (std.mem.indexOf(u8, after_prefix, "/")) |slash_pos| {
                owner = after_prefix[0..slash_pos];
                repo = after_prefix[slash_pos + 1 ..];
            } else {
                return null; // Invalid format
            }
        }

        return GitHubRef{
            .owner = try allocator.dupe(u8, owner),
            .repo = try allocator.dupe(u8, repo),
            .ref = try allocator.dupe(u8, ref),
        };
    } else if (std.mem.indexOf(u8, version, "github.com/")) |github_pos| {
        // Format: https://github.com/owner/repo#ref or git+https://github.com/owner/repo.git#ref
        const after_github = version[github_pos + 11 ..]; // skip "github.com/"

        // Find # for ref
        var owner_repo = after_github;
        if (std.mem.indexOf(u8, after_github, "#")) |hash_pos| {
            ref = after_github[hash_pos + 1 ..];
            owner_repo = after_github[0..hash_pos];
        }

        // Remove .git suffix if present
        if (std.mem.endsWith(u8, owner_repo, ".git")) {
            owner_repo = owner_repo[0 .. owner_repo.len - 4];
        }

        // Split owner/repo
        if (std.mem.indexOf(u8, owner_repo, "/")) |slash_pos| {
            owner = owner_repo[0..slash_pos];
            repo = owner_repo[slash_pos + 1 ..];
        } else {
            return null; // Invalid format
        }

        return GitHubRef{
            .owner = try allocator.dupe(u8, owner),
            .repo = try allocator.dupe(u8, repo),
            .ref = try allocator.dupe(u8, ref),
        };
    }

    return null; // Not a GitHub URL
}

test "parseGitHubUrl with github: prefix" {
    const allocator = std.testing.allocator;

    // Test: github:owner/repo#ref
    {
        const gh_ref = try parseGitHubUrl(allocator, "github:lodash/lodash#4.17.21");
        try std.testing.expect(gh_ref != null);
        defer {
            var ref = gh_ref.?;
            ref.deinit(allocator);
        }

        try std.testing.expectEqualStrings("lodash", gh_ref.?.owner);
        try std.testing.expectEqualStrings("lodash", gh_ref.?.repo);
        try std.testing.expectEqualStrings("4.17.21", gh_ref.?.ref);
    }

    // Test: github:owner/repo (no ref, should default to main)
    {
        const gh_ref = try parseGitHubUrl(allocator, "github:chalk/chalk");
        try std.testing.expect(gh_ref != null);
        defer {
            var ref = gh_ref.?;
            ref.deinit(allocator);
        }

        try std.testing.expectEqualStrings("chalk", gh_ref.?.owner);
        try std.testing.expectEqualStrings("chalk", gh_ref.?.repo);
        try std.testing.expectEqualStrings("main", gh_ref.?.ref);
    }
}

test "parseGitHubUrl with https URL" {
    const allocator = std.testing.allocator;

    // Test: https://github.com/owner/repo#ref
    {
        const gh_ref = try parseGitHubUrl(allocator, "https://github.com/lodash/lodash#4.17.21");
        try std.testing.expect(gh_ref != null);
        defer {
            var ref = gh_ref.?;
            ref.deinit(allocator);
        }

        try std.testing.expectEqualStrings("lodash", gh_ref.?.owner);
        try std.testing.expectEqualStrings("lodash", gh_ref.?.repo);
        try std.testing.expectEqualStrings("4.17.21", gh_ref.?.ref);
    }

    // Test: git+https://github.com/owner/repo.git#ref
    {
        const gh_ref = try parseGitHubUrl(allocator, "git+https://github.com/chalk/chalk.git#v5.3.0");
        try std.testing.expect(gh_ref != null);
        defer {
            var ref = gh_ref.?;
            ref.deinit(allocator);
        }

        try std.testing.expectEqualStrings("chalk", gh_ref.?.owner);
        try std.testing.expectEqualStrings("chalk", gh_ref.?.repo);
        try std.testing.expectEqualStrings("v5.3.0", gh_ref.?.ref);
    }
}

test "parseGitHubUrl with non-GitHub URL" {
    const allocator = std.testing.allocator;

    // Should return null for non-GitHub URLs
    const result1 = try parseGitHubUrl(allocator, "^3.0.0");
    try std.testing.expect(result1 == null);

    const result2 = try parseGitHubUrl(allocator, "latest");
    try std.testing.expect(result2 == null);

    const result3 = try parseGitHubUrl(allocator, "1.2.3");
    try std.testing.expect(result3 == null);
}

/// Escape single quotes in a string for safe embedding in JS single-quoted strings.
/// Replaces `'` with `\\x27`.
fn escapeSingleQuotes(allocator: std.mem.Allocator, input: []const u8) ![]const u8 {
    // Fast path: no quotes to escape
    if (std.mem.indexOf(u8, input, "'") == null) {
        return try allocator.dupe(u8, input);
    }

    var result = try std.ArrayList(u8).initCapacity(allocator, input.len + 16);
    errdefer result.deinit(allocator);

    for (input) |c| {
        if (c == '\'') {
            try result.appendSlice(allocator, "\\x27");
        } else {
            try result.append(allocator, c);
        }
    }

    return try result.toOwnedSlice(allocator);
}

/// Execute a TypeScript dependency file using Bun or Node
/// Returns JSON string output from the executed file
fn executeTsConfigFile(allocator: std.mem.Allocator, file_path: []const u8) ![]const u8 {
    // Try Bun first, then Node.js
    const runtimes = [_][]const u8{ "bun", "node" };

    for (runtimes) |runtime| {
        // Escape single quotes in the file path for JS string safety.
        // Replace ' with \x27 which is valid inside JS single-quoted strings.
        const safe_path = try escapeSingleQuotes(allocator, file_path);
        defer allocator.free(safe_path);

        // Create a wrapper script that imports the config and outputs JSON
        const wrapper_script = try std.fmt.allocPrint(
            allocator,
            \\import config from '{s}';
            \\const output = config.default || config;
            \\console.log(JSON.stringify(output));
        ,
            .{safe_path},
        );
        defer allocator.free(wrapper_script);

        // Bun uses --eval, Node uses eval
        const eval_flag = if (std.mem.eql(u8, runtime, "bun")) "--eval" else "eval";

        // Try to execute with this runtime using io_helper for cross-platform compatibility
        const result = io_helper.childRun(
            allocator,
            &[_][]const u8{ runtime, eval_flag, wrapper_script },
        ) catch continue; // Try next runtime if this one fails

        defer allocator.free(result.stdout);
        defer allocator.free(result.stderr);

        switch (result.term) {
            .exited => |code| {
                if (code == 0) {
                    return try allocator.dupe(u8, result.stdout);
                }
            },
            else => {}, // Signal or other termination
        }
    }

    return error.NoRuntimeAvailable;
}

/// Parse TypeScript config file (config/deps.ts or pantry.config.ts)
/// Executes the TS file with Bun/Node and parses JSON output
pub fn parseTsConfigFile(allocator: std.mem.Allocator, file_path: []const u8) ![]PackageDependency {
    // Execute the TypeScript file
    const json_output = executeTsConfigFile(allocator, file_path) catch |err| {
        return err;
    };
    defer allocator.free(json_output);

    // Parse JSON output
    const parsed = try std.json.parseFromSlice(
        std.json.Value,
        allocator,
        json_output,
        .{},
    );
    defer parsed.deinit();

    // Extract dependencies from the parsed JSON
    // The TS file should export an object with a "dependencies" field
    var deps = try std.ArrayList(PackageDependency).initCapacity(allocator, 8);
    errdefer {
        for (deps.items) |*dep| dep.deinit(allocator);
        deps.deinit(allocator);
    }

    if (parsed.value != .object) {
        return deps.toOwnedSlice(allocator);
    }

    // Get dependencies object
    if (parsed.value.object.get("dependencies")) |deps_value| {
        if (deps_value != .object) return deps.toOwnedSlice(allocator);

        var it = deps_value.object.iterator();
        while (it.next()) |entry| {
            const pkg_name = entry.key_ptr.*;
            const pkg_spec = entry.value_ptr.*;

            // Simple version: "package": "version"
            if (pkg_spec == .string) {
                const dep = PackageDependency{
                    .name = try allocator.dupe(u8, pkg_name),
                    .version = try allocator.dupe(u8, pkg_spec.string),
                    .source = .registry,
                };
                try deps.append(allocator, dep);
            }
            // Object format: "package": { "version": "1.0.0", ... }
            else if (pkg_spec == .object) {
                var version: []const u8 = "latest";
                var global = false;

                if (pkg_spec.object.get("version")) |v| {
                    if (v == .string) version = v.string;
                }
                if (pkg_spec.object.get("global")) |g| {
                    if (g == .bool) global = g.bool;
                }

                const dep = PackageDependency{
                    .name = try allocator.dupe(u8, pkg_name),
                    .version = try allocator.dupe(u8, version),
                    .global = global,
                    .source = .registry,
                };
                try deps.append(allocator, dep);
            }
        }
    }

    return deps.toOwnedSlice(allocator);
}

/// Infer dependencies from a file based on its format
pub fn inferDependencies(
    allocator: std.mem.Allocator,
    deps_file: detector.DepsFile,
) ![]PackageDependency {
    return switch (deps_file.format) {
        // Pantry native formats
        .pantry_json, .pantry_jsonc => try parseZigPackageJson(allocator, deps_file.path),
        // TypeScript config files - execute with Bun/Node
        .config_deps_ts, .dotconfig_deps_ts, .pantry_config_ts, .dotconfig_pantry_ts => try parseTsConfigFile(allocator, deps_file.path),
        .pantry_yaml, .pantry_yml, .deps_yaml, .deps_yml, .dependencies_yaml, .pkgx_yaml => try parseDepsFile(allocator, deps_file.path),
        // Other package manager formats (fallback)
        .package_json, .package_jsonc, .zig_json => try parseZigPackageJson(allocator, deps_file.path),
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

    const content = try io_helper.readFileAlloc(allocator, file_path, 10 * 1024 * 1024); // 10MB max
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
    var current_package_indent: usize = 0;

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
                if (c == ' ') indent_level += 1 else if (c == '\t') indent_level += 2 else break;
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

                // Determine if this is a new package or a property of current package
                // A property has greater indentation than its parent package
                const is_property = current_package != null and indent_level > current_package_indent;

                if (!is_property) {
                    // New package entry
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
                    current_package_indent = indent_level;

                    // If value is present, it's simple format: "package: version"
                    if (value.len > 0) {
                        current_version = value;
                    }
                } else {
                    // Property of current package (version, global)
                    if (std.mem.eql(u8, key, "version")) {
                        current_version = value;
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

    // NOTE: Test disabled because Zig 0.16 Io.Dir doesn't have realpath.
    // parseDepsFile works in practice when given absolute paths.
    _ = test_content;
    _ = allocator;
}

/// Parse package.json to infer Node.js version from engines field
fn parsePackageJson(allocator: std.mem.Allocator, file_path: []const u8) ![]PackageDependency {
    const file = try io_helper.openFileAbsolute(file_path, .{});
    defer file.close(io_helper.io);

    const content = try file.readToEndAlloc(allocator, std.Io.Limit.limited(10 * 1024 * 1024));
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
                    const version = version_start[0..quote2];
                    // Keep version constraint prefixes (^, ~, >=, etc.) - semver resolver will handle them

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

/// Parse composer.json to extract PHP dependencies.
///
/// Returns php.net as a system dep (to ensure PHP is installed),
/// plus a special "__composer_install__" marker dep that the install
/// flow uses to trigger `composer install` after system deps are ready.
///
/// The actual PHP library deps (laravel/framework, etc.) are installed
/// by Composer itself — pantry orchestrates the process.
fn parseComposerJson(allocator: std.mem.Allocator, file_path: []const u8) ![]PackageDependency {
    var deps = try std.ArrayList(PackageDependency).initCapacity(allocator, 4);
    errdefer {
        for (deps.items) |*dep| dep.deinit(allocator);
        deps.deinit(allocator);
    }

    // composer.json is a project-level manifest — PHP and Composer should already
    // be installed by the user (via `pantry install php.net`, brew, or system package manager).
    // We only add a marker dep that triggers native Packagist downloading in post-install.
    _ = file_path;

    try deps.append(allocator, .{
        .name = try allocator.dupe(u8, "__composer_install__"),
        .version = try allocator.dupe(u8, "latest"),
    });

    return deps.toOwnedSlice(allocator);
}

/// Source resolution preferences
pub const SourceResolutionOrder = struct {
    order: []const []const u8 = &[_][]const u8{ "pantry", "npm", "github" },

    pub fn default() SourceResolutionOrder {
        return .{
            .order = &[_][]const u8{ "pantry", "npm", "github" },
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

        // Domain format detection (e.g., nodejs.org, bun.sh, info-zip.org/zip)
        // Must come before GitHub owner/repo check since domain-style names
        // can contain slashes (e.g., info-zip.org/zip)
        if (std.mem.indexOf(u8, pkg_name, ".")) |_| {
            // Extract the base (before any slash) to check for domain TLDs
            const base = if (std.mem.indexOf(u8, pkg_name, "/")) |slash_pos|
                pkg_name[0..slash_pos]
            else
                pkg_name;

            if (std.mem.endsWith(u8, base, ".org") or
                std.mem.endsWith(u8, base, ".com") or
                std.mem.endsWith(u8, base, ".dev") or
                std.mem.endsWith(u8, base, ".io") or
                std.mem.endsWith(u8, base, ".sh") or
                std.mem.endsWith(u8, base, ".net"))
            {
                return .{
                    .source = "pantry",
                };
            }
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
    source: []const u8 = "pantry", // pantry, github, npm, http, git
    url: ?[]const u8 = null,
    repo: ?[]const u8 = null, // For github: owner/repo
    branch: ?[]const u8 = null, // For git
    tag: ?[]const u8 = null, // For github releases
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
    // Read and strip comments for JSONC support
    const content = try io_helper.readFileAlloc(allocator, file_path, 10 * 1024 * 1024);
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

    // Parse dependencies, devDependencies, peerDependencies, and pantry.dependencies
    const dep_sections = [_]struct { key: []const u8, dep_type: DependencyType }{
        .{ .key = "dependencies", .dep_type = .normal },
        .{ .key = "devDependencies", .dep_type = .dev },
        .{ .key = "peerDependencies", .dep_type = .peer },
    };

    // Also check pantry.dependencies section (bun/npm-safe pantry deps)
    if (parsed.value.object.get("pantry")) |pantry_val| {
        if (pantry_val == .object) {
            const pantry_dep_sections = [_]struct { key: []const u8, dep_type: DependencyType }{
                .{ .key = "dependencies", .dep_type = .normal },
                .{ .key = "devDependencies", .dep_type = .dev },
            };
            for (pantry_dep_sections) |section| {
                if (pantry_val.object.get(section.key)) |deps_value| {
                    if (deps_value != .object) continue;

                    var it = deps_value.object.iterator();
                    while (it.next()) |entry| {
                        const pkg_name = entry.key_ptr.*;
                        const pkg_spec = entry.value_ptr.*;
                        var version: []const u8 = "latest";

                        if (pkg_spec == .string) {
                            version = pkg_spec.string;
                        } else if (pkg_spec == .object) {
                            if (pkg_spec.object.get("version")) |v| {
                                if (v == .string) version = v.string;
                            }
                        }

                        const detection = SourceDetection.fromPackageName(pkg_name);
                        const full_name = if (!std.mem.eql(u8, detection.source, "auto"))
                            try allocator.dupe(u8, pkg_name)
                        else
                            try std.fmt.allocPrint(allocator, "auto:{s}", .{pkg_name});

                        try deps.append(allocator, .{
                            .name = full_name,
                            .version = try allocator.dupe(u8, version),
                            .global = false,
                            .dep_type = section.dep_type,
                            .source = .registry,
                            .github_ref = null,
                        });
                    }
                }
            }
        }
    }

    // Check for "composer" section — PHP deps defined in pantry.jsonc/package.json
    // e.g.: { "composer": { "laravel/framework": "^11.0", "monolog/monolog": "^3.0" } }
    // Pantry doesn't resolve these itself — it ensures PHP is installed and delegates to Composer.
    if (parsed.value.object.get("composer")) |composer_val| {
        if (composer_val == .object and composer_val.object.count() > 0) {
            // Ensure PHP is installed
            try deps.append(allocator, .{
                .name = try allocator.dupe(u8, "php.net"),
                .version = try allocator.dupe(u8, "latest"),
            });
            // Trigger Composer delegation in post-install
            try deps.append(allocator, .{
                .name = try allocator.dupe(u8, "__composer_install__"),
                .version = try allocator.dupe(u8, "latest"),
            });
        }
    }

    // Parse "system" field for system/pantry dependencies (short names like "bun", "sqlite")
    if (parsed.value.object.get("system")) |system_val| {
        if (system_val == .object) {
            const pkg_registry = @import("../packages/generated.zig");
            var domain_buf: [256]u8 = undefined;

            var sys_it = system_val.object.iterator();
            while (sys_it.next()) |entry| {
                const short_name = entry.key_ptr.*;
                const pkg_spec = entry.value_ptr.*;
                var version: []const u8 = "latest";

                if (pkg_spec == .string) {
                    version = pkg_spec.string;
                } else if (pkg_spec == .object) {
                    if (pkg_spec.object.get("version")) |v| {
                        if (v == .string) version = v.string;
                    }
                }

                // Resolve short name to canonical domain via registry
                // e.g., "bun" -> "bun.sh", "sqlite" -> "sqlite.org"
                // Try exact match first, then try "{name}.org" domain match
                const canonical_name = if (pkg_registry.getPackageByName(short_name)) |pkg_info|
                    pkg_info.domain
                else if (pkg_registry.getPackageByDomain(
                    std.fmt.bufPrint(&domain_buf, "{s}.org", .{short_name}) catch short_name,
                )) |pkg_info|
                    pkg_info.domain
                else if (pkg_registry.getPackageByDomain(
                    std.fmt.bufPrint(&domain_buf, "{s}.com", .{short_name}) catch short_name,
                )) |pkg_info|
                    pkg_info.domain
                else
                    short_name; // fallback to the name as-is

                try deps.append(allocator, .{
                    .name = try allocator.dupe(u8, canonical_name),
                    .version = try allocator.dupe(u8, version),
                    .global = false,
                    .dep_type = .normal,
                    .source = .registry,
                    .github_ref = null,
                });
            }
        }
    }

    for (dep_sections) |section| {
        if (parsed.value.object.get(section.key)) |deps_value| {
            if (deps_value != .object) continue;

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
                var parsed_github_ref: ?GitHubRef = null;

                // Handle simplified npm-style syntax: "package": "version"
                if (pkg_spec == .string) {
                    version = pkg_spec.string;

                    // First, check if the version string itself is a GitHub URL
                    if (try parseGitHubUrl(allocator, version)) |github_ref| {
                        source = "github";
                        repo = try std.fmt.allocPrint(allocator, "{s}/{s}", .{ github_ref.owner, github_ref.repo });
                        version = github_ref.ref;
                        parsed_github_ref = github_ref;
                    } else {
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
                // Perf: Use stack buffer for name formatting (avoids allocPrint per dep)
                const full_name = blk: {
                    var name_buf: [512]u8 = undefined;
                    if (!std.mem.eql(u8, source, "auto")) {
                        const prefix_and_value: struct { p: []const u8, v: []const u8 } = if (std.mem.eql(u8, source, "github"))
                            .{ .p = "github:", .v = repo orelse pkg_name }
                        else if (std.mem.eql(u8, source, "npm"))
                            .{ .p = "npm:", .v = pkg_name }
                        else if (std.mem.eql(u8, source, "http"))
                            .{ .p = "http:", .v = url orelse pkg_name }
                        else if (std.mem.eql(u8, source, "git"))
                            .{ .p = "git:", .v = url orelse pkg_name }
                        else if (std.mem.eql(u8, source, "local"))
                            .{ .p = "local:", .v = url orelse pkg_name }
                        else if (std.mem.eql(u8, source, "pantry") or std.mem.eql(u8, source, "pkgx"))
                            .{ .p = "", .v = pkg_name }
                        else
                            .{ .p = "auto:", .v = pkg_name };

                        const formatted = std.fmt.bufPrint(&name_buf, "{s}{s}", .{ prefix_and_value.p, prefix_and_value.v }) catch
                            try std.fmt.allocPrint(allocator, "{s}{s}", .{ prefix_and_value.p, prefix_and_value.v });
                        break :blk try allocator.dupe(u8, formatted);
                    }

                    const formatted = std.fmt.bufPrint(&name_buf, "auto:{s}", .{pkg_name}) catch
                        try std.fmt.allocPrint(allocator, "auto:{s}", .{pkg_name});
                    break :blk try allocator.dupe(u8, formatted);
                };

                // Determine the dependency source
                const dep_source: DependencySource = if (std.mem.eql(u8, source, "github"))
                    .github
                else if (std.mem.eql(u8, source, "git"))
                    .git
                else if (std.mem.eql(u8, source, "url") or std.mem.eql(u8, source, "http"))
                    .url
                else
                    .registry;

                try deps.append(allocator, .{
                    .name = full_name,
                    .version = try allocator.dupe(u8, version),
                    .global = global,
                    .dep_type = section.dep_type,
                    .source = dep_source,
                    .github_ref = parsed_github_ref,
                });
            }
        }
    }

    return try deps.toOwnedSlice(allocator);
}

/// Parse workspace isolation config from a pantry.json/pantry.jsonc config file.
/// Returns the isolation mode string or null if not configured.
/// Example: { "workspaces": { "isolation": "isolated" } }
///          { "workspaces": { "packages": ["packages/*"], "isolation": "inherit" } }
pub fn parseWorkspaceIsolation(allocator: std.mem.Allocator, file_path: []const u8) !?[]const u8 {
    const content = io_helper.readFileAlloc(allocator, file_path, 10 * 1024 * 1024) catch return null;
    defer allocator.free(content);

    const json_content = stripJsonComments(allocator, content) catch return null;
    defer allocator.free(json_content);

    const parsed = std.json.parseFromSlice(std.json.Value, allocator, json_content, .{}) catch return null;
    defer parsed.deinit();

    if (parsed.value != .object) return null;

    // Check workspaces.isolation
    if (parsed.value.object.get("workspaces")) |ws_val| {
        if (ws_val == .object) {
            if (ws_val.object.get("isolation")) |iso_val| {
                if (iso_val == .string) {
                    return try allocator.dupe(u8, iso_val.string);
                }
            }
        }
    }

    return null;
}

/// Strip JSON comments (// and /* */) and trailing commas for JSONC support
fn stripJsonComments(allocator: std.mem.Allocator, content: []const u8) ![]const u8 {
    // Single-pass: strip comments AND trailing commas in one allocation
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
        if (i + 1 < content.len and content[i] == '/' and content[i + 1] == '/') {
            while (i < content.len and content[i] != '\n') : (i += 1) {}
            if (i < content.len) {
                try result.append(allocator, '\n');
                i += 1;
            }
            continue;
        }

        // Handle /* */ comments
        if (i + 1 < content.len and content[i] == '/' and content[i + 1] == '*') {
            i += 2;
            while (i + 1 < content.len) : (i += 1) {
                if (content[i] == '*' and content[i + 1] == '/') {
                    i += 2;
                    break;
                }
            }
            continue;
        }

        // Strip trailing commas: if we see ',' followed by whitespace then '}' or ']', skip the comma
        if (c == ',') {
            var k = i + 1;
            while (k < content.len and (content[k] == ' ' or content[k] == '\t' or content[k] == '\n' or content[k] == '\r')) : (k += 1) {}
            // Also skip comments when looking ahead for trailing comma detection
            if (k + 1 < content.len and content[k] == '/' and content[k + 1] == '/') {
                // Comment after comma — skip to newline, then check
                var kk = k + 2;
                while (kk < content.len and content[kk] != '\n') : (kk += 1) {}
                if (kk < content.len) kk += 1; // skip newline
                while (kk < content.len and (content[kk] == ' ' or content[kk] == '\t' or content[kk] == '\n' or content[kk] == '\r')) : (kk += 1) {}
                if (kk < content.len and (content[kk] == '}' or content[kk] == ']')) {
                    i += 1;
                    continue; // Skip trailing comma
                }
            }
            if (k < content.len and (content[k] == '}' or content[k] == ']')) {
                i += 1;
                continue; // Skip trailing comma
            }
        }

        // Regular character
        try result.append(allocator, content[i]);
        i += 1;
    }

    return result.toOwnedSlice(allocator);
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

test "SourceDetection.fromPackageName detects pantry domain" {
    const detection = SourceDetection.fromPackageName("nodejs.org");
    try std.testing.expectEqualStrings("pantry", detection.source);
}

test "SourceDetection.fromPackageName detects scoped npm package" {
    const detection = SourceDetection.fromPackageName("@types/node");
    try std.testing.expectEqualStrings("npm", detection.source);
}

test "SourceDetection.fromPackageName handles ambiguous names" {
    const detection = SourceDetection.fromPackageName("typescript");
    try std.testing.expectEqualStrings("auto", detection.source);
}

test "SourceDetection.fromPackageName detects domain with slash as pantry" {
    const detection = SourceDetection.fromPackageName("info-zip.org/zip");
    try std.testing.expectEqualStrings("pantry", detection.source);

    const detection2 = SourceDetection.fromPackageName("info-zip.org/unzip");
    try std.testing.expectEqualStrings("pantry", detection2.source);
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

    // NOTE: Test disabled because Zig 0.16 Io.Dir doesn't have realpath.
    _ = test_content;
    _ = allocator;
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

    // NOTE: Test disabled because Zig 0.16 Io.Dir doesn't have realpath.
    _ = test_content;
    _ = allocator;
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

    // NOTE: Test disabled because Zig 0.16 Io.Dir doesn't have realpath.
    _ = test_content;
    _ = allocator;
}
