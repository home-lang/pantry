//! Lifecycle Scripts Module
//!
//! This module handles package lifecycle scripts with a security-first approach.
//! Unlike npm/yarn, Pantry uses a "default-secure" model where only trusted
//! packages can execute lifecycle scripts.
//!
//! Lifecycle scripts supported:
//! - preinstall: Runs before the package is installed
//! - postinstall: Runs after the package is installed
//! - preuninstall: Runs before the package is uninstalled
//! - postuninstall: Runs after the package is uninstalled
//! - prepublishOnly: Runs before the package is published
//!
//! Security Model:
//! - Scripts are disabled by default
//! - Packages must be in trustedDependencies to run scripts
//! - Top 500 npm packages with scripts are trusted by default
//! - --ignore-scripts flag disables all script execution

const std = @import("std");
const lib = @import("lib.zig");
const io_helper = @import("io_helper.zig");
const style = @import("cli/style.zig");

// ============================================================================
// Sub-modules
// ============================================================================

pub const enhanced = @import("lifecycle/enhanced.zig");
pub const hooks = @import("lifecycle/hooks.zig");

// ============================================================================
// Types
// ============================================================================

/// Lifecycle script types
pub const LifecycleScript = enum {
    // Install hooks
    preinstall,
    postinstall,
    preuninstall,
    postuninstall,
    // Publish hooks
    prepublish,
    prepare,
    prepublishOnly,
    prepack,
    postpack,
    publish,
    postpublish,
    // Prepare sub-hooks
    preprepare,
    postprepare,

    pub fn toString(self: LifecycleScript) []const u8 {
        return switch (self) {
            .preinstall => "preinstall",
            .postinstall => "postinstall",
            .preuninstall => "preuninstall",
            .postuninstall => "postuninstall",
            .prepublish => "prepublish",
            .prepare => "prepare",
            .prepublishOnly => "prepublishOnly",
            .prepack => "prepack",
            .postpack => "postpack",
            .publish => "publish",
            .postpublish => "postpublish",
            .preprepare => "preprepare",
            .postprepare => "postprepare",
        };
    }

    pub fn fromString(s: []const u8) ?LifecycleScript {
        if (std.mem.eql(u8, s, "preinstall")) return .preinstall;
        if (std.mem.eql(u8, s, "postinstall")) return .postinstall;
        if (std.mem.eql(u8, s, "preuninstall")) return .preuninstall;
        if (std.mem.eql(u8, s, "postuninstall")) return .postuninstall;
        if (std.mem.eql(u8, s, "prepublish")) return .prepublish;
        if (std.mem.eql(u8, s, "prepare")) return .prepare;
        if (std.mem.eql(u8, s, "prepublishOnly")) return .prepublishOnly;
        if (std.mem.eql(u8, s, "prepack")) return .prepack;
        if (std.mem.eql(u8, s, "postpack")) return .postpack;
        if (std.mem.eql(u8, s, "publish")) return .publish;
        if (std.mem.eql(u8, s, "postpublish")) return .postpublish;
        if (std.mem.eql(u8, s, "preprepare")) return .preprepare;
        if (std.mem.eql(u8, s, "postprepare")) return .postprepare;
        return null;
    }
};

/// Lifecycle script execution result
pub const ScriptResult = struct {
    success: bool,
    exit_code: u8,
    stdout: ?[]const u8,
    stderr: ?[]const u8,
    duration_ms: u64 = 0,

    pub fn deinit(self: *ScriptResult, allocator: std.mem.Allocator) void {
        if (self.stdout) |out| allocator.free(out);
        if (self.stderr) |err| allocator.free(err);
    }
};

/// Lifecycle script execution options
pub const ScriptOptions = struct {
    cwd: []const u8,
    ignore_scripts: bool = false,
    verbose: bool = false,
    timeout_ms: u32 = 120000, // 2 minutes default
    modules_dir: []const u8 = "pantry",
};

// ============================================================================
// Default Trusted Dependencies
// ============================================================================

/// Top npm packages with lifecycle scripts that are trusted by default
/// Based on bun's default-trusted-dependencies.txt
pub const DEFAULT_TRUSTED_DEPENDENCIES = [_][]const u8{
    // Native addons and build tools
    "node-sass",
    "node-gyp",
    "node-pre-gyp",
    "@mapbox/node-pre-gyp",
    "prebuild-install",

    // Popular packages with postinstall
    "esbuild",
    "swc",
    "@swc/core",
    "@swc/wasm",
    "sharp",
    "canvas",
    "sqlite3",
    "better-sqlite3",
    "bcrypt",
    "argon2",
    "sodium",
    "leveldown",
    "grpc",
    "@grpc/grpc-js",
    "protobufjs",

    // Frontend build tools
    "puppeteer",
    "playwright",
    "@playwright/test",
    "chromedriver",
    "geckodriver",
    "electron",
    "electron-rebuild",

    // Development tools
    "husky",
    "simple-git-hooks",
    "lefthook",
    "patch-package",
    "postinstall-postinstall",

    // Other commonly used packages
    "core-js",
    "core-js-pure",
    "eos-transit",
    "zeromq",
    "node-sass-tilde-importer",
};

// ============================================================================
// Trusted Dependencies Management
// ============================================================================

/// Check if a package is in the default trusted list
pub fn isDefaultTrusted(package_name: []const u8) bool {
    for (DEFAULT_TRUSTED_DEPENDENCIES) |trusted| {
        if (std.mem.eql(u8, package_name, trusted)) {
            return true;
        }
    }
    return false;
}

/// Load trusted dependencies from package.json
pub fn loadTrustedDependencies(
    allocator: std.mem.Allocator,
    config: std.json.Parsed(std.json.Value),
) !std.StringHashMap(void) {
    var trusted = std.StringHashMap(void).init(allocator);
    errdefer trusted.deinit();

    const root = config.value.object;

    // Check for trustedDependencies field
    if (root.get("trustedDependencies")) |trusted_deps| {
        if (trusted_deps != .array) return trusted;

        for (trusted_deps.array.items) |item| {
            if (item != .string) continue;
            const name = try allocator.dupe(u8, item.string);
            try trusted.put(name, {});
        }
    }

    return trusted;
}

/// Check if a package is trusted (either in config or default list)
pub fn isTrusted(
    package_name: []const u8,
    trusted_deps: std.StringHashMap(void),
) bool {
    // Check user-specified trusted dependencies
    if (trusted_deps.contains(package_name)) {
        return true;
    }

    // Check default trusted list
    return isDefaultTrusted(package_name);
}

// ============================================================================
// Script Extraction
// ============================================================================

/// Extract lifecycle scripts from package.json
pub fn extractScripts(
    allocator: std.mem.Allocator,
    package_json: std.json.Parsed(std.json.Value),
) !std.StringHashMap([]const u8) {
    var scripts = std.StringHashMap([]const u8).init(allocator);
    errdefer scripts.deinit();

    const root = package_json.value.object;

    if (root.get("scripts")) |scripts_obj| {
        if (scripts_obj != .object) return scripts;

        var it = scripts_obj.object.iterator();
        while (it.next()) |entry| {
            const script_name = try allocator.dupe(u8, entry.key_ptr.*);
            const script_cmd = switch (entry.value_ptr.*) {
                .string => |s| try allocator.dupe(u8, s),
                else => continue,
            };
            try scripts.put(script_name, script_cmd);
        }
    }

    return scripts;
}

// ============================================================================
// Script Execution
// ============================================================================

/// Execute a lifecycle script
pub fn executeScript(
    allocator: std.mem.Allocator,
    script_name: []const u8,
    script_cmd: []const u8,
    options: ScriptOptions,
) !ScriptResult {
    if (options.ignore_scripts) {
        return ScriptResult{
            .success = true,
            .exit_code = 0,
            .stdout = null,
            .stderr = null,
        };
    }

    if (options.verbose) {
        style.print("Running script: {s}\n", .{script_name});
        style.print("  Command: {s}\n", .{script_cmd});
        style.print("  CWD: {s}\n", .{options.cwd});
    }

    // Execute the script using Child.run for simplicity
    const is_windows = @import("builtin").os.tag == .windows;

    // Prepend {modules_dir}/.bin to PATH so local binaries
    // (tsc, eslint, etc.) are found without global installation.
    // We walk UP the directory tree from CWD, adding each {modules_dir}/.bin
    // found along the way. This is critical for monorepo support where
    // dependencies (and their .bin stubs) are hoisted to the workspace root.
    // We bake the actual parent PATH value into the command instead of relying
    // on $PATH expansion, because some child process environments may not
    // properly inherit the parent's PATH (e.g., in CI environments).
    const current_path = io_helper.getenv("PATH") orelse "/usr/local/bin:/usr/bin:/bin";

    // Build colon-separated list of {modules_dir}/.bin paths from CWD upward
    var nm_path_buf = std.ArrayList(u8){};
    defer nm_path_buf.deinit(allocator);

    {
        var dir: []const u8 = options.cwd;
        var depth: usize = 0;
        while (depth < 20) : (depth += 1) {
            if (nm_path_buf.items.len > 0) {
                try nm_path_buf.append(allocator, ':');
            }
            try nm_path_buf.appendSlice(allocator, dir);
            try nm_path_buf.append(allocator, '/');
            try nm_path_buf.appendSlice(allocator, options.modules_dir);
            try nm_path_buf.appendSlice(allocator, "/.bin");

            dir = std.fs.path.dirname(dir) orelse break;
        }
    }

    const wrapped_cmd = if (is_windows)
        script_cmd
    else if (nm_path_buf.items.len > 0)
        try std.fmt.allocPrint(allocator, "export PATH=\"{s}:{s}\" && {s}", .{ nm_path_buf.items, current_path, script_cmd })
    else
        try std.fmt.allocPrint(allocator, "export PATH=\"{s}/{s}/.bin:{s}\" && {s}", .{ options.cwd, options.modules_dir, current_path, script_cmd });
    defer if (!is_windows) allocator.free(wrapped_cmd);

    const timer = std.time.Instant.now() catch null;

    const result = io_helper.childRunWithOptions(allocator, &[_][]const u8{
        if (is_windows) "cmd" else "sh",
        if (is_windows) "/C" else "-c",
        wrapped_cmd,
    }, .{
        .cwd = options.cwd,
    }) catch |err| {
        const error_msg = try std.fmt.allocPrint(allocator, "Failed to execute script: {}", .{err});
        return ScriptResult{
            .success = false,
            .exit_code = 1,
            .stdout = null,
            .stderr = error_msg,
        };
    };

    const duration_ms: u64 = if (timer) |start| blk: {
        const end = std.time.Instant.now() catch break :blk 0;
        break :blk end.since(start) / std.time.ns_per_ms;
    } else 0;

    const success = switch (result.term) {
        .exited => |code| code == 0,
        else => false,
    };

    const exit_code: u8 = switch (result.term) {
        .exited => |code| @intCast(code),
        else => 1,
    };

    const stdout = if (result.stdout.len > 0)
        try allocator.dupe(u8, result.stdout)
    else
        null;

    const stderr = if (result.stderr.len > 0)
        try allocator.dupe(u8, result.stderr)
    else
        null;

    // Free the result's stdout/stderr
    allocator.free(result.stdout);
    allocator.free(result.stderr);

    // Always print output on failure so users can debug script issues
    if (!success) {
        if (stdout) |out| {
            style.print("  stdout: {s}\n", .{out});
        }
        if (stderr) |err| {
            style.print("  stderr: {s}\n", .{err});
        }
    } else if (options.verbose) {
        if (stdout) |out| {
            style.print("  stdout: {s}\n", .{out});
        }
        if (stderr) |err| {
            style.print("  stderr: {s}\n", .{err});
        }
        style.print("  exit code: {d}\n", .{exit_code});
    }

    return ScriptResult{
        .success = success,
        .exit_code = exit_code,
        .stdout = stdout,
        .stderr = stderr,
        .duration_ms = duration_ms,
    };
}

/// Run lifecycle script for a package
pub fn runLifecycleScript(
    allocator: std.mem.Allocator,
    package_name: []const u8,
    script_type: LifecycleScript,
    package_path: []const u8,
    options: ScriptOptions,
) !?ScriptResult {
    // Check if scripts are globally disabled
    if (options.ignore_scripts) {
        return null;
    }

    // Read package.json
    const package_json_path = try std.fs.path.join(allocator, &[_][]const u8{ package_path, "package.json" });
    defer allocator.free(package_json_path);

    const package_json_content = io_helper.readFileAlloc(allocator, package_json_path, 1024 * 1024) catch |err| {
        if (err == error.FileNotFound) return null;
        return err;
    };
    defer allocator.free(package_json_content);

    const parsed = try std.json.parseFromSlice(std.json.Value, allocator, package_json_content, .{});
    defer parsed.deinit();

    // Extract scripts
    var scripts = try extractScripts(allocator, parsed);
    defer {
        var it = scripts.iterator();
        while (it.next()) |entry| {
            allocator.free(entry.key_ptr.*);
            allocator.free(entry.value_ptr.*);
        }
        scripts.deinit();
    }

    // Check if the lifecycle script exists
    const script_name = script_type.toString();
    const script_cmd = scripts.get(script_name) orelse return null;

    // Load trusted dependencies from root package.json
    const cwd = try io_helper.getCwdAlloc(allocator);
    defer allocator.free(cwd);

    const root_package_json_path = try std.fs.path.join(allocator, &[_][]const u8{ cwd, "package.json" });
    defer allocator.free(root_package_json_path);

    const root_package_json = io_helper.readFileAlloc(allocator, root_package_json_path, 1024 * 1024) catch {
        // If no root package.json, use empty trusted list
        var empty_trusted = std.StringHashMap(void).init(allocator);
        defer empty_trusted.deinit();

        if (!isTrusted(package_name, empty_trusted)) {
            if (options.verbose) {
                style.print("Skipping script for untrusted package: {s}\n", .{package_name});
            }
            return null;
        }

        return try executeScript(allocator, script_name, script_cmd, .{
            .cwd = package_path,
            .ignore_scripts = options.ignore_scripts,
            .verbose = options.verbose,
            .timeout_ms = options.timeout_ms,
        });
    };
    defer allocator.free(root_package_json);

    const root_parsed = try std.json.parseFromSlice(std.json.Value, allocator, root_package_json, .{});
    defer root_parsed.deinit();

    var trusted_deps = try loadTrustedDependencies(allocator, root_parsed);
    defer {
        var it = trusted_deps.keyIterator();
        while (it.next()) |key| {
            allocator.free(key.*);
        }
        trusted_deps.deinit();
    }

    // Check if package is trusted
    if (!isTrusted(package_name, trusted_deps)) {
        if (options.verbose) {
            style.print("Skipping script for untrusted package: {s}\n", .{package_name});
            style.print("  Add to trustedDependencies in package.json to enable\n", .{});
        }
        return null;
    }

    // Execute the script
    return try executeScript(allocator, script_name, script_cmd, .{
        .cwd = package_path,
        .ignore_scripts = options.ignore_scripts,
        .verbose = options.verbose,
        .timeout_ms = options.timeout_ms,
    });
}

// ============================================================================
// Batch Execution
// ============================================================================

/// Run lifecycle scripts for multiple packages
pub fn runLifecycleScriptsForPackages(
    allocator: std.mem.Allocator,
    packages: []const struct { name: []const u8, path: []const u8 },
    script_type: LifecycleScript,
    options: ScriptOptions,
) !void {
    for (packages) |pkg| {
        const result = try runLifecycleScript(
            allocator,
            pkg.name,
            script_type,
            pkg.path,
            options,
        );

        if (result) |*r| {
            defer {
                var res = r.*;
                res.deinit(allocator);
            }

            if (!r.success) {
                style.print("Lifecycle script failed for {s}\n", .{pkg.name});
                if (r.stderr) |err| {
                    style.print("{s}\n", .{err});
                }
                return error.LifecycleScriptFailed;
            }
        }
    }
}

// ============================================================================
// Script Helper for Publish Flow
// ============================================================================

/// Run a named script from a scripts JSON object if it exists.
/// Returns true if script ran successfully or didn't exist, false if it failed.
pub fn runScriptIfExists(
    allocator: std.mem.Allocator,
    scripts_obj: std.json.ObjectMap,
    script_name: []const u8,
    cwd: []const u8,
) bool {
    const script_val = scripts_obj.get(script_name) orelse return true; // No script = success
    const script_cmd = switch (script_val) {
        .string => |s| s,
        else => return true, // Invalid script value = skip
    };

    style.print("Running {s} script...\n", .{script_name});
    if (executeScript(allocator, script_name, script_cmd, .{ .cwd = cwd })) |result| {
        defer {
            var r = result;
            r.deinit(allocator);
        }
        if (!result.success) {
            style.print("  ✗ {s} failed with exit code {d}\n", .{ script_name, result.exit_code });
            return false;
        }
        style.print("  ✓ {s} completed\n", .{script_name});
        return true;
    } else |_| {
        style.print("  ✗ {s} failed to execute\n", .{script_name});
        return false;
    }
}

/// Run the full npm publish lifecycle sequence.
/// Order: prepublish → prepare → prepublishOnly → prepack
/// Returns false if any required script fails.
pub fn runPrePublishScripts(
    allocator: std.mem.Allocator,
    scripts_obj: std.json.ObjectMap,
    cwd: []const u8,
) bool {
    // npm publish lifecycle order (before tarball creation):
    // 1. prepublish (deprecated but still supported)
    // 2. prepare
    // 3. prepublishOnly
    // 4. prepack
    if (!runScriptIfExists(allocator, scripts_obj, "prepublish", cwd)) return false;
    if (!runScriptIfExists(allocator, scripts_obj, "prepare", cwd)) return false;
    if (!runScriptIfExists(allocator, scripts_obj, "prepublishOnly", cwd)) return false;
    if (!runScriptIfExists(allocator, scripts_obj, "prepack", cwd)) return false;
    return true;
}

/// Run post-pack scripts (after tarball creation, before publish).
pub fn runPostPackScripts(
    allocator: std.mem.Allocator,
    scripts_obj: std.json.ObjectMap,
    cwd: []const u8,
) bool {
    return runScriptIfExists(allocator, scripts_obj, "postpack", cwd);
}

/// Run post-publish scripts (after successful publish).
pub fn runPostPublishScripts(
    allocator: std.mem.Allocator,
    scripts_obj: std.json.ObjectMap,
    cwd: []const u8,
) bool {
    // publish script runs, then postpublish
    if (!runScriptIfExists(allocator, scripts_obj, "publish", cwd)) return false;
    if (!runScriptIfExists(allocator, scripts_obj, "postpublish", cwd)) return false;
    return true;
}
