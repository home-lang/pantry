//! Pantry Configuration (pantry.toml)
//!
//! Project-level configuration for the pantry package manager.
//! Modeled after bun's bunfig.toml.
//!
//! Search order:
//! 1. pantry.toml in CWD
//! 2. Walk up parent directories
//! 3. ~/.config/pantry/pantry.toml (global fallback)
//! 4. Defaults (isolated linker, peer=false)

const std = @import("std");
const toml = @import("toml.zig");
const io_helper = @import("../io_helper.zig");

/// Linker strategy for dependency installation
pub const LinkerMode = enum {
    /// Default: each package resolved independently (like pnpm)
    isolated,
    /// Hoist dependencies to root node_modules (like npm/bun default)
    hoisted,

    pub fn fromString(s: []const u8) ?LinkerMode {
        if (std.mem.eql(u8, s, "isolated")) return .isolated;
        if (std.mem.eql(u8, s, "hoisted")) return .hoisted;
        return null;
    }
};

/// Pantry project configuration
pub const PantryConfig = struct {
    install: InstallConfig = .{},

    pub const InstallConfig = struct {
        /// Linker strategy: isolated (default) or hoisted
        linker: LinkerMode = .isolated,
        /// Whether to auto-install peer dependencies (default: false)
        peer: bool = false,
        /// Whether to install dev dependencies (default: true)
        dev: bool = true,
        /// Whether to install optional dependencies (default: true)
        optional: bool = true,
        /// Production mode — skip devDependencies (default: false)
        production: bool = false,
        /// Registry URL override
        registry: ?[]const u8 = null,
        /// Frozen lockfile — error if lockfile is out of date (default: false)
        frozen_lockfile: bool = false,
    };
};

/// Load pantry.toml configuration.
/// Searches CWD, parent directories, then ~/.config/pantry/.
/// Returns default config if no file is found.
pub fn loadPantryToml(allocator: std.mem.Allocator, cwd: []const u8) !PantryConfig {
    // Try to find pantry.toml walking up from CWD
    if (try findPantryToml(allocator, cwd)) |toml_path| {
        defer allocator.free(toml_path);
        return parseTomlFile(allocator, toml_path);
    }

    // Try global config: ~/.config/pantry/pantry.toml
    if (try findGlobalConfig(allocator)) |global_path| {
        defer allocator.free(global_path);
        return parseTomlFile(allocator, global_path);
    }

    // No config file found — return defaults
    return .{};
}

/// Search for pantry.toml starting from `start_dir`, walking up to root.
fn findPantryToml(allocator: std.mem.Allocator, start_dir: []const u8) !?[]const u8 {
    var dir = try allocator.dupe(u8, start_dir);
    defer allocator.free(dir);

    while (true) {
        const candidate = try std.fs.path.join(allocator, &[_][]const u8{ dir, "pantry.toml" });

        io_helper.accessAbsolute(candidate, .{}) catch {
            allocator.free(candidate);

            // Move to parent directory
            const parent = std.fs.path.dirname(dir);
            if (parent == null or std.mem.eql(u8, parent.?, dir)) {
                // Reached root
                return null;
            }
            const new_dir = try allocator.dupe(u8, parent.?);
            allocator.free(dir);
            dir = new_dir;
            continue;
        };

        return candidate;
    }
}

/// Try ~/.config/pantry/pantry.toml
fn findGlobalConfig(allocator: std.mem.Allocator) !?[]const u8 {
    const home = io_helper.getenv("HOME") orelse return null;
    const path = try std.fmt.allocPrint(allocator, "{s}/.config/pantry/pantry.toml", .{home});

    io_helper.accessAbsolute(path, .{}) catch {
        allocator.free(path);
        return null;
    };

    return path;
}

/// Read and parse a pantry.toml file into PantryConfig.
fn parseTomlFile(allocator: std.mem.Allocator, path: []const u8) !PantryConfig {
    const content = io_helper.readFileAlloc(allocator, path, 64 * 1024) catch {
        return .{}; // If we can't read it, use defaults
    };
    defer allocator.free(content);

    return parseTomlContent(allocator, content);
}

/// Parse TOML content string into PantryConfig.
pub fn parseTomlContent(allocator: std.mem.Allocator, content: []const u8) !PantryConfig {
    var table = try toml.parse(allocator, content);
    defer table.deinit();

    var config = PantryConfig{};

    // [install] section
    if (table.getString("install.linker")) |linker_str| {
        if (LinkerMode.fromString(linker_str)) |mode| {
            config.install.linker = mode;
        }
    }

    if (table.getBool("install.peer")) |peer| {
        config.install.peer = peer;
    }

    if (table.getBool("install.dev")) |dev| {
        config.install.dev = dev;
    }

    if (table.getBool("install.optional")) |optional| {
        config.install.optional = optional;
    }

    if (table.getBool("install.production")) |production| {
        config.install.production = production;
    }

    if (table.getString("install.registry")) |registry| {
        config.install.registry = try allocator.dupe(u8, registry);
    }

    if (table.getBool("install.frozenLockfile")) |frozen| {
        config.install.frozen_lockfile = frozen;
    }

    return config;
}

// ============================================================================
// Tests
// ============================================================================

test "default config" {
    const config = PantryConfig{};
    try std.testing.expectEqual(LinkerMode.isolated, config.install.linker);
    try std.testing.expectEqual(false, config.install.peer);
    try std.testing.expectEqual(true, config.install.dev);
    try std.testing.expectEqual(true, config.install.optional);
    try std.testing.expectEqual(false, config.install.production);
    try std.testing.expect(config.install.registry == null);
    try std.testing.expectEqual(false, config.install.frozen_lockfile);
}

test "parse hoisted config" {
    const allocator = std.testing.allocator;
    const config = try parseTomlContent(allocator,
        \\[install]
        \\linker = "hoisted"
        \\peer = true
    );

    try std.testing.expectEqual(LinkerMode.hoisted, config.install.linker);
    try std.testing.expectEqual(true, config.install.peer);
    // Other fields retain defaults
    try std.testing.expectEqual(true, config.install.dev);
    try std.testing.expectEqual(false, config.install.production);
}

test "parse production config" {
    const allocator = std.testing.allocator;
    var config = try parseTomlContent(allocator,
        \\[install]
        \\production = true
        \\dev = false
        \\frozenLockfile = true
        \\registry = "https://npm.mycompany.com/"
    );

    try std.testing.expectEqual(true, config.install.production);
    try std.testing.expectEqual(false, config.install.dev);
    try std.testing.expectEqual(true, config.install.frozen_lockfile);
    try std.testing.expectEqualStrings("https://npm.mycompany.com/", config.install.registry.?);

    // Clean up allocated registry string
    allocator.free(config.install.registry.?);
}

test "parse empty file returns defaults" {
    const allocator = std.testing.allocator;
    const config = try parseTomlContent(allocator, "");
    try std.testing.expectEqual(LinkerMode.isolated, config.install.linker);
    try std.testing.expectEqual(false, config.install.peer);
}

test "LinkerMode.fromString" {
    try std.testing.expectEqual(LinkerMode.isolated, LinkerMode.fromString("isolated").?);
    try std.testing.expectEqual(LinkerMode.hoisted, LinkerMode.fromString("hoisted").?);
    try std.testing.expect(LinkerMode.fromString("invalid") == null);
}

test "loadPantryToml returns defaults when no file exists" {
    const allocator = std.testing.allocator;
    // Use a path that definitely won't have pantry.toml
    const config = try loadPantryToml(allocator, "/tmp/nonexistent-pantry-test-path");
    try std.testing.expectEqual(LinkerMode.isolated, config.install.linker);
    try std.testing.expectEqual(false, config.install.peer);
}
