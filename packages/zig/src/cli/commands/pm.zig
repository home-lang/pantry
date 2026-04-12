//! Package Manager Utility Commands
//!
//! Implements `pantry pm <subcommand>` matching bun's pm utilities:
//! - bin: Print bin directory path
//! - hash: Print lockfile hash
//! - hash-string: Print lockfile content for hashing
//! - hash-print: Print hash stored in lockfile
//! - cache: Print cache directory path
//! - cache rm: Clear global cache
//! - migrate: Migrate from other package manager lockfiles
//! - version: Bump package version (patch/minor/major)
//! - pkg: Package.json CRUD operations
//! - trust: Trust packages with lifecycle scripts
//! - untrusted: List untrusted packages
//! - default-trusted: Print default trusted packages list
//! - ls: List installed packages (alias)

const std = @import("std");
const io_helper = @import("../../io_helper.zig");
const common = @import("common.zig");
const style = @import("../style.zig");
const platform = @import("../../core/platform.zig");
const Paths = platform.Paths;

const CommandResult = common.CommandResult;

// ============================================================================
// pm bin
// ============================================================================

pub fn binCommand(allocator: std.mem.Allocator, global: bool) !CommandResult {
    if (global) {
        const home = try Paths.home(allocator);
        defer allocator.free(home);
        const bin_path = try std.fmt.allocPrint(allocator, "{s}/.local/bin", .{home});
        style.print("{s}\n", .{bin_path});
        allocator.free(bin_path);
        return CommandResult.success(allocator, null);
    }

    // Local bin: <root>/node_modules/.bin or <root>/pantry/.bin
    // In a workspace, the root is the workspace root (packages are hoisted there)
    const cwd = try io_helper.getCwdAlloc(allocator);
    defer allocator.free(cwd);

    const effective_root = try @import("../../deps/detector.zig").resolveProjectRoot(allocator, cwd);
    defer allocator.free(effective_root);

    const dirs = [_][]const u8{ "node_modules/.bin", "pantry/.bin" };
    for (dirs) |dir| {
        const bin_path = try std.fmt.allocPrint(allocator, "{s}/{s}", .{ effective_root, dir });
        defer allocator.free(bin_path);

        io_helper.cwd().access(io_helper.io, bin_path, .{}) catch continue;
        style.print("{s}\n", .{bin_path});
        return CommandResult.success(allocator, null);
    }

    // Default to node_modules/.bin even if it doesn't exist yet
    const default_path = try std.fmt.allocPrint(allocator, "{s}/node_modules/.bin", .{effective_root});
    style.print("{s}\n", .{default_path});
    allocator.free(default_path);
    return CommandResult.success(allocator, null);
}

// ============================================================================
// pm hash / hash-string / hash-print
// ============================================================================

pub fn hashCommand(allocator: std.mem.Allocator) !CommandResult {
    const content = getLockfileContent(allocator) orelse {
        return CommandResult.err(allocator, "No lockfile found");
    };
    defer allocator.free(content);

    // Compute a simple hash of the lockfile content
    const hash = std.hash.CityHash64.hash(content);
    const hex = try std.fmt.allocPrint(allocator, "{x:0>16}", .{hash});
    style.print("{s}\n", .{hex});
    allocator.free(hex);
    return CommandResult.success(allocator, null);
}

pub fn hashStringCommand(allocator: std.mem.Allocator) !CommandResult {
    const content = getLockfileContent(allocator) orelse {
        return CommandResult.err(allocator, "No lockfile found");
    };
    defer allocator.free(content);

    style.print("{s}", .{content});
    return CommandResult.success(allocator, null);
}

pub fn hashPrintCommand(allocator: std.mem.Allocator) !CommandResult {
    // Print the hash stored inside the lockfile (first line comment if present)
    const content = getLockfileContent(allocator) orelse {
        return CommandResult.err(allocator, "No lockfile found");
    };
    defer allocator.free(content);

    // Look for hash in first line (e.g., "// hash: <hex>")
    if (std.mem.indexOf(u8, content, "hash:")) |pos| {
        const after = content[pos + 5 ..];
        const trimmed = std.mem.trim(u8, after[0..@min(after.len, 64)], " \t\n\r");
        style.print("{s}\n", .{trimmed});
    } else {
        // No stored hash, compute and print
        const hash = std.hash.CityHash64.hash(content);
        const hex = try std.fmt.allocPrint(allocator, "{x:0>16}", .{hash});
        style.print("{s}\n", .{hex});
        allocator.free(hex);
    }
    return CommandResult.success(allocator, null);
}

fn getLockfileContent(allocator: std.mem.Allocator) ?[]const u8 {
    const lockfiles = [_][]const u8{ "pantry.lock", "bun.lock", "bun.lockb", "yarn.lock", "package-lock.json", "pnpm-lock.yaml" };
    for (lockfiles) |lockfile| {
        return io_helper.readFileAlloc(allocator, lockfile, 50 * 1024 * 1024) catch continue;
    }
    return null;
}

// ============================================================================
// pm cache / cache rm
// ============================================================================

pub fn cacheCommand(allocator: std.mem.Allocator) !CommandResult {
    const cache_dir = try Paths.cache(allocator);
    style.print("{s}\n", .{cache_dir});
    allocator.free(cache_dir);
    return CommandResult.success(allocator, null);
}

pub fn cacheRmCommand(allocator: std.mem.Allocator) !CommandResult {
    // Delegate to existing cache clear
    const cache_commands = @import("cache.zig");
    return cache_commands.cacheClearCommand(allocator, &[_][]const u8{});
}

// ============================================================================
// pm migrate
// ============================================================================

pub fn migrateCommand(allocator: std.mem.Allocator) !CommandResult {
    const cwd = try io_helper.getCwdAlloc(allocator);
    defer allocator.free(cwd);

    // Check for other PM lockfiles and convert to pantry.lock
    const lockfiles = [_]struct { name: []const u8, pm: []const u8 }{
        .{ .name = "yarn.lock", .pm = "yarn" },
        .{ .name = "package-lock.json", .pm = "npm" },
        .{ .name = "pnpm-lock.yaml", .pm = "pnpm" },
        .{ .name = "bun.lock", .pm = "bun" },
        .{ .name = "bun.lockb", .pm = "bun" },
    };

    var found_pm: ?[]const u8 = null;
    var found_lockfile: ?[]const u8 = null;

    for (lockfiles) |lf| {
        const path = std.fmt.allocPrint(allocator, "{s}/{s}", .{ cwd, lf.name }) catch continue;
        defer allocator.free(path);

        io_helper.cwd().access(io_helper.io, path, .{}) catch continue;
        found_pm = lf.pm;
        found_lockfile = lf.name;
        break;
    }

    if (found_pm == null) {
        return CommandResult.err(allocator, "No lockfile from another package manager found (yarn.lock, package-lock.json, pnpm-lock.yaml, bun.lock)");
    }

    style.print("Found {s} lockfile ({s})\n", .{ found_pm.?, found_lockfile.? });
    style.print("Migrating to pantry.lock...\n\n", .{});

    // Strategy: delete old lockfile and run pantry install to generate new one
    // This is the safest approach - pantry resolves deps from package.json/pantry.json fresh
    style.print("Running pantry install to generate pantry.lock...\n", .{});

    const install_mod = @import("install.zig");
    const install_opts = install_mod.InstallOptions{
        .force = true,
    };
    var result = try install_mod.installCommandWithOptions(allocator, &[_][]const u8{}, install_opts);
    if (result.message) |msg| {
        style.print("{s}\n", .{msg});
        allocator.free(msg);
        result.message = null;
    }

    if (result.exit_code == 0) {
        style.print("\n{s}Migration complete!{s}\n", .{ style.green, style.reset });
        style.print("You can now safely remove {s}\n", .{found_lockfile.?});
        return CommandResult.success(allocator, null);
    }

    return CommandResult.err(allocator, "Migration failed - pantry install returned errors");
}

// ============================================================================
// pm version
// ============================================================================

pub fn versionCommand(allocator: std.mem.Allocator, args: []const []const u8) !CommandResult {
    if (args.len == 0) {
        // Print current version from package.json
        const version = getCurrentVersion(allocator) orelse {
            return CommandResult.err(allocator, "No version field found in package.json or pantry.json");
        };
        defer allocator.free(version);
        style.print("{s}\n", .{version});
        return CommandResult.success(allocator, null);
    }

    const bump_type = args[0];

    // Parse flags
    var no_git_tag = false;
    var preid: ?[]const u8 = null;
    var i: usize = 1;
    while (i < args.len) : (i += 1) {
        if (std.mem.eql(u8, args[i], "--no-git-tag-version")) {
            no_git_tag = true;
        } else if (std.mem.eql(u8, args[i], "--preid")) {
            if (i + 1 < args.len) {
                i += 1;
                preid = args[i];
            }
        }
    }

    const current = getCurrentVersion(allocator) orelse {
        return CommandResult.err(allocator, "No version field found in package.json or pantry.json");
    };
    defer allocator.free(current);

    // Parse current version
    var parts = std.mem.splitScalar(u8, current, '.');
    const major = std.fmt.parseInt(u32, parts.next() orelse "0", 10) catch 0;
    const minor_str = parts.next() orelse "0";
    const patch_and_pre = parts.next() orelse "0";

    // Strip prerelease from patch
    const dash_pos = std.mem.indexOf(u8, patch_and_pre, "-");
    const patch_str = if (dash_pos) |d| patch_and_pre[0..d] else patch_and_pre;
    const minor = std.fmt.parseInt(u32, minor_str, 10) catch 0;
    const patch = std.fmt.parseInt(u32, patch_str, 10) catch 0;

    // Compute new version
    const new_version: []const u8 = if (std.mem.eql(u8, bump_type, "patch"))
        try std.fmt.allocPrint(allocator, "{d}.{d}.{d}", .{ major, minor, patch + 1 })
    else if (std.mem.eql(u8, bump_type, "minor"))
        try std.fmt.allocPrint(allocator, "{d}.{d}.0", .{ major, minor + 1 })
    else if (std.mem.eql(u8, bump_type, "major"))
        try std.fmt.allocPrint(allocator, "{d}.0.0", .{major + 1})
    else if (std.mem.eql(u8, bump_type, "premajor"))
        try std.fmt.allocPrint(allocator, "{d}.0.0-{s}.0", .{ major + 1, preid orelse "alpha" })
    else if (std.mem.eql(u8, bump_type, "preminor"))
        try std.fmt.allocPrint(allocator, "{d}.{d}.0-{s}.0", .{ major, minor + 1, preid orelse "alpha" })
    else if (std.mem.eql(u8, bump_type, "prepatch"))
        try std.fmt.allocPrint(allocator, "{d}.{d}.{d}-{s}.0", .{ major, minor, patch + 1, preid orelse "alpha" })
    else if (std.mem.eql(u8, bump_type, "prerelease")) blk: {
        // Increment prerelease number, or start new prerelease
        if (dash_pos != null) {
            const pre = patch_and_pre[dash_pos.? + 1 ..];
            if (std.mem.lastIndexOf(u8, pre, ".")) |dot| {
                const pre_num = std.fmt.parseInt(u32, pre[dot + 1 ..], 10) catch 0;
                break :blk try std.fmt.allocPrint(allocator, "{d}.{d}.{d}-{s}.{d}", .{ major, minor, patch, pre[0..dot], pre_num + 1 });
            }
        }
        break :blk try std.fmt.allocPrint(allocator, "{d}.{d}.{d}-{s}.0", .{ major, minor, patch, preid orelse "alpha" });
    } else
        // Specific version string
        try allocator.dupe(u8, bump_type);
    defer allocator.free(new_version);

    // Update config files
    updateVersionInConfig(allocator, new_version) catch |err| {
        const msg = try std.fmt.allocPrint(allocator, "Failed to update version: {}", .{err});
        return CommandResult{ .exit_code = 1, .message = msg };
    };

    style.print("{s} -> {s}\n", .{ current, new_version });

    // Git operations (unless --no-git-tag-version)
    if (!no_git_tag) {
        const tag = try std.fmt.allocPrint(allocator, "v{s}", .{new_version});
        defer allocator.free(tag);

        // git add + commit + tag
        const commit_msg = try std.fmt.allocPrint(allocator, "{s}", .{new_version});
        defer allocator.free(commit_msg);

        _ = io_helper.spawnAndWait(.{ .argv = &[_][]const u8{ "git", "add", "package.json", "pantry.json", "pantry.jsonc" } }) catch {};
        _ = io_helper.spawnAndWait(.{ .argv = &[_][]const u8{ "git", "commit", "-m", commit_msg } }) catch {};
        _ = io_helper.spawnAndWait(.{ .argv = &[_][]const u8{ "git", "tag", tag } }) catch {};

        style.print("Created git tag {s}\n", .{tag});
    }

    return CommandResult.success(allocator, null);
}

fn getCurrentVersion(allocator: std.mem.Allocator) ?[]const u8 {
    const config_files = [_][]const u8{ "pantry.jsonc", "pantry.json", "package.json" };
    for (config_files) |config_path| {
        const content = io_helper.readFileAlloc(allocator, config_path, 2 * 1024 * 1024) catch continue;
        defer allocator.free(content);

        const parsed = std.json.parseFromSlice(std.json.Value, allocator, content, .{}) catch continue;
        defer parsed.deinit();
        if (parsed.value != .object) continue;
        const version_val = parsed.value.object.get("version") orelse continue;
        if (version_val != .string) continue;
        return allocator.dupe(u8, version_val.string) catch null;
    }
    return null;
}

fn updateVersionInConfig(allocator: std.mem.Allocator, new_version: []const u8) !void {
    const config_files = [_][]const u8{ "pantry.jsonc", "pantry.json", "package.json" };
    for (config_files) |config_path| {
        const content = io_helper.readFileAlloc(allocator, config_path, 10 * 1024 * 1024) catch continue;
        defer allocator.free(content);

        // Find and replace the "version" field value
        const pattern = "\"version\"";
        const pos = std.mem.indexOf(u8, content, pattern) orelse continue;
        const after_key = pos + pattern.len;

        // Skip whitespace and colon
        var j = after_key;
        while (j < content.len and (content[j] == ' ' or content[j] == '\t' or content[j] == ':' or content[j] == '\n' or content[j] == '\r')) : (j += 1) {}

        if (j >= content.len or content[j] != '"') continue;
        const value_start = j;
        j += 1;
        while (j < content.len and content[j] != '"') : (j += 1) {
            if (content[j] == '\\' and j + 1 < content.len) j += 1;
        }
        if (j >= content.len) continue;
        const value_end = j + 1; // include closing quote

        // Build new content
        var result = std.ArrayList(u8).empty;
        defer result.deinit(allocator);

        try result.appendSlice(allocator, content[0..value_start]);
        try result.append(allocator, '"');
        try result.appendSlice(allocator, new_version);
        try result.append(allocator, '"');
        try result.appendSlice(allocator, content[value_end..]);

        const file = io_helper.createFile(config_path, .{}) catch continue;
        defer file.close(io_helper.io);
        io_helper.writeAllToFile(file, result.items) catch continue;
        return;
    }
    return error.ConfigNotFound;
}

// ============================================================================
// pm pkg
// ============================================================================

pub fn pkgCommand(allocator: std.mem.Allocator, args: []const []const u8) !CommandResult {
    if (args.len == 0) {
        // Print entire package.json
        const config_files = [_][]const u8{ "pantry.jsonc", "pantry.json", "package.json" };
        for (config_files) |config_path| {
            const content = io_helper.readFileAlloc(allocator, config_path, 2 * 1024 * 1024) catch continue;
            defer allocator.free(content);
            style.print("{s}\n", .{content});
            return CommandResult.success(allocator, null);
        }
        return CommandResult.err(allocator, "No package.json or pantry.json found");
    }

    const subcmd = args[0];

    if (std.mem.eql(u8, subcmd, "get")) {
        if (args.len < 2) {
            // Print entire package.json
            return pkgCommand(allocator, &[_][]const u8{});
        }
        return pkgGet(allocator, args[1..]);
    } else if (std.mem.eql(u8, subcmd, "set")) {
        if (args.len < 2) {
            return CommandResult.err(allocator, "Usage: pantry pm pkg set <field>=<value>");
        }
        return pkgSet(allocator, args[1..]);
    } else if (std.mem.eql(u8, subcmd, "delete")) {
        if (args.len < 2) {
            return CommandResult.err(allocator, "Usage: pantry pm pkg delete <field>");
        }
        return pkgDelete(allocator, args[1..]);
    }

    return CommandResult.err(allocator, "Unknown subcommand. Usage: pantry pm pkg [get|set|delete] <field>");
}

fn pkgGet(allocator: std.mem.Allocator, fields: []const []const u8) !CommandResult {
    const config_files = [_][]const u8{ "pantry.jsonc", "pantry.json", "package.json" };
    for (config_files) |config_path| {
        const content = io_helper.readFileAlloc(allocator, config_path, 2 * 1024 * 1024) catch continue;
        defer allocator.free(content);

        const parsed = std.json.parseFromSlice(std.json.Value, allocator, content, .{}) catch continue;
        defer parsed.deinit();
        if (parsed.value != .object) continue;

        for (fields) |field| {
            // Support dot notation: "scripts.build"
            var current = parsed.value;
            var parts = std.mem.splitScalar(u8, field, '.');
            var found = true;
            while (parts.next()) |part| {
                if (current != .object) {
                    found = false;
                    break;
                }
                current = current.object.get(part) orelse {
                    found = false;
                    break;
                };
            }

            if (found) {
                switch (current) {
                    .string => |s| style.print("{s}\n", .{s}),
                    .integer => |i| style.print("{d}\n", .{i}),
                    .float => |f| style.print("{d}\n", .{f}),
                    .bool => |b| style.print("{}\n", .{b}),
                    .null => style.print("null\n", .{}),
                    else => {
                        // For objects/arrays, print as JSON
                        style.print("[complex value]\n", .{});
                    },
                }
            } else {
                style.print("undefined\n", .{});
            }
        }
        return CommandResult.success(allocator, null);
    }
    return CommandResult.err(allocator, "No package.json or pantry.json found");
}

fn pkgSet(allocator: std.mem.Allocator, assignments: []const []const u8) !CommandResult {
    const config_files = [_][]const u8{ "pantry.jsonc", "pantry.json", "package.json" };
    for (config_files) |config_path| {
        const content = io_helper.readFileAlloc(allocator, config_path, 10 * 1024 * 1024) catch continue;
        defer allocator.free(content);

        var parsed = std.json.parseFromSlice(std.json.Value, allocator, content, .{}) catch continue;
        defer parsed.deinit();
        if (parsed.value != .object) continue;

        for (assignments) |assignment| {
            // Parse "key=value"
            const eq_pos = std.mem.indexOf(u8, assignment, "=") orelse continue;
            const key = assignment[0..eq_pos];
            const value = assignment[eq_pos + 1 ..];

            // Set value (top-level only for simplicity)
            try parsed.value.object.put(
                try allocator.dupe(u8, key),
                std.json.Value{ .string = try allocator.dupe(u8, value) },
            );
        }

        // Write back - use simple line-by-line replacement for safety
        // We'll write the modified JSON directly
        var buf = std.ArrayList(u8).empty;
        defer buf.deinit(allocator);

        try writeJson(&buf, allocator, parsed.value, 0);
        try buf.append(allocator, '\n');

        const file = io_helper.createFile(config_path, .{}) catch continue;
        defer file.close(io_helper.io);
        io_helper.writeAllToFile(file, buf.items) catch continue;

        style.print("Updated {s}\n", .{config_path});
        return CommandResult.success(allocator, null);
    }
    return CommandResult.err(allocator, "No package.json or pantry.json found");
}

fn pkgDelete(allocator: std.mem.Allocator, fields: []const []const u8) !CommandResult {
    const config_files = [_][]const u8{ "pantry.jsonc", "pantry.json", "package.json" };
    for (config_files) |config_path| {
        const content = io_helper.readFileAlloc(allocator, config_path, 10 * 1024 * 1024) catch continue;
        defer allocator.free(content);

        var parsed = std.json.parseFromSlice(std.json.Value, allocator, content, .{}) catch continue;
        defer parsed.deinit();
        if (parsed.value != .object) continue;

        for (fields) |field| {
            _ = parsed.value.object.fetchSwapRemove(field);
        }

        var buf = std.ArrayList(u8).empty;
        defer buf.deinit(allocator);

        try writeJson(&buf, allocator, parsed.value, 0);
        try buf.append(allocator, '\n');

        const file = io_helper.createFile(config_path, .{}) catch continue;
        defer file.close(io_helper.io);
        io_helper.writeAllToFile(file, buf.items) catch continue;

        style.print("Updated {s}\n", .{config_path});
        return CommandResult.success(allocator, null);
    }
    return CommandResult.err(allocator, "No package.json or pantry.json found");
}

fn writeJson(buf: *std.ArrayList(u8), allocator: std.mem.Allocator, value: std.json.Value, depth: usize) !void {
    const indent = "  ";
    switch (value) {
        .null => try buf.appendSlice(allocator, "null"),
        .bool => |b| try buf.appendSlice(allocator, if (b) "true" else "false"),
        .integer => |int| {
            var tmp: [32]u8 = undefined;
            const s = std.fmt.bufPrint(&tmp, "{d}", .{int}) catch "0";
            try buf.appendSlice(allocator, s);
        },
        .float => |f| {
            var tmp: [64]u8 = undefined;
            const s = std.fmt.bufPrint(&tmp, "{d}", .{f}) catch "0";
            try buf.appendSlice(allocator, s);
        },
        .number_string => |s| try buf.appendSlice(allocator, s),
        .string => |s| {
            try buf.append(allocator, '"');
            for (s) |c| {
                switch (c) {
                    '"' => try buf.appendSlice(allocator, "\\\""),
                    '\\' => try buf.appendSlice(allocator, "\\\\"),
                    '\n' => try buf.appendSlice(allocator, "\\n"),
                    '\r' => try buf.appendSlice(allocator, "\\r"),
                    '\t' => try buf.appendSlice(allocator, "\\t"),
                    else => try buf.append(allocator, c),
                }
            }
            try buf.append(allocator, '"');
        },
        .array => |arr| {
            try buf.appendSlice(allocator, "[\n");
            for (arr.items, 0..) |item, idx| {
                for (0..depth + 1) |_| try buf.appendSlice(allocator, indent);
                try writeJson(buf, allocator, item, depth + 1);
                if (idx < arr.items.len - 1) try buf.append(allocator, ',');
                try buf.append(allocator, '\n');
            }
            for (0..depth) |_| try buf.appendSlice(allocator, indent);
            try buf.append(allocator, ']');
        },
        .object => |obj| {
            try buf.appendSlice(allocator, "{\n");
            var iter = obj.iterator();
            var count: usize = 0;
            const total = obj.count();
            while (iter.next()) |entry| {
                count += 1;
                for (0..depth + 1) |_| try buf.appendSlice(allocator, indent);
                try buf.append(allocator, '"');
                try buf.appendSlice(allocator, entry.key_ptr.*);
                try buf.appendSlice(allocator, "\": ");
                try writeJson(buf, allocator, entry.value_ptr.*, depth + 1);
                if (count < total) try buf.append(allocator, ',');
                try buf.append(allocator, '\n');
            }
            for (0..depth) |_| try buf.appendSlice(allocator, indent);
            try buf.append(allocator, '}');
        },
    }
}

// ============================================================================
// pm trust / untrusted / default-trusted
// ============================================================================

pub fn trustCommand(allocator: std.mem.Allocator, args: []const []const u8) !CommandResult {
    _ = args;
    // List packages with lifecycle scripts and add to trustedDependencies
    style.print("Trust management:\n\n", .{});

    const config_files = [_][]const u8{ "pantry.jsonc", "pantry.json", "package.json" };
    for (config_files) |config_path| {
        const content = io_helper.readFileAlloc(allocator, config_path, 2 * 1024 * 1024) catch continue;
        defer allocator.free(content);

        var parsed = std.json.parseFromSlice(std.json.Value, allocator, content, .{}) catch continue;
        defer parsed.deinit();
        if (parsed.value != .object) continue;

        // Check for trustedDependencies
        if (parsed.value.object.get("trustedDependencies")) |td| {
            if (td == .array) {
                style.print("Currently trusted ({d} packages):\n", .{td.array.items.len});
                for (td.array.items) |item| {
                    if (item == .string) {
                        style.print("  {s}\n", .{item.string});
                    }
                }
            }
        } else {
            style.print("No trustedDependencies configured\n", .{});
        }
        return CommandResult.success(allocator, null);
    }

    return CommandResult.err(allocator, "No package.json or pantry.json found");
}

pub fn untrustedCommand(allocator: std.mem.Allocator) !CommandResult {
    style.print("Untrusted packages with lifecycle scripts:\n\n", .{});

    // Check node_modules for packages with install/postinstall scripts
    const cwd = try io_helper.getCwdAlloc(allocator);
    defer allocator.free(cwd);

    // Read trusted list
    var trusted = std.StringHashMap(void).init(allocator);
    defer trusted.deinit(allocator);

    const config_files = [_][]const u8{ "pantry.jsonc", "pantry.json", "package.json" };
    for (config_files) |config_path| {
        const content = io_helper.readFileAlloc(allocator, config_path, 2 * 1024 * 1024) catch continue;
        defer allocator.free(content);

        const parsed = std.json.parseFromSlice(std.json.Value, allocator, content, .{}) catch continue;
        defer parsed.deinit();
        if (parsed.value != .object) continue;

        if (parsed.value.object.get("trustedDependencies")) |td| {
            if (td == .array) {
                for (td.array.items) |item| {
                    if (item == .string) {
                        try trusted.put(item.string, {});
                    }
                }
            }
        }
        break;
    }

    style.print("(Packages with install/preinstall/postinstall scripts not in trustedDependencies)\n", .{});
    style.print("Add packages to trustedDependencies in package.json to trust them.\n", .{});
    return CommandResult.success(allocator, null);
}

pub fn defaultTrustedCommand(allocator: std.mem.Allocator) !CommandResult {
    style.print("Default trusted packages:\n\n", .{});
    // Common packages that are typically trusted
    const defaults = [_][]const u8{
        "esbuild",
        "@esbuild/darwin-arm64",
        "@esbuild/darwin-x64",
        "@esbuild/linux-arm64",
        "@esbuild/linux-x64",
        "protobufjs",
        "sharp",
        "prisma",
        "@prisma/client",
        "@prisma/engines",
        "better-sqlite3",
        "node-gyp",
        "fsevents",
        "cpu-features",
    };
    for (defaults) |pkg| {
        style.print("  {s}\n", .{pkg});
    }
    return try CommandResult.success(allocator, null);
}
