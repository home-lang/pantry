const std = @import("std");
const io_helper = @import("../../io_helper.zig");
const common = @import("common.zig");
const lib = @import("../../lib.zig");
const style = @import("../style.zig");

const CommandResult = common.CommandResult;

/// Update packages to latest versions
pub fn execute(allocator: std.mem.Allocator, args: []const []const u8) !CommandResult {
    const detector = @import("../../deps/detector.zig");
    const parser = @import("../../deps/parser.zig");

    // Parse flags
    var update_specific: ?[]const u8 = null;
    var dry_run = false;
    var latest = false;

    var i: usize = 0;
    while (i < args.len) : (i += 1) {
        const arg = args[i];
        if (std.mem.eql(u8, arg, "--all")) {
            // Accepted for backwards compat but is now the default
        } else if (std.mem.eql(u8, arg, "--dry-run")) {
            dry_run = true;
        } else if (std.mem.eql(u8, arg, "--latest")) {
            latest = true;
        } else if (std.mem.eql(u8, arg, "--force") or std.mem.eql(u8, arg, "-f")) {
            latest = true; // --force implies fetching latest
        } else if (!std.mem.startsWith(u8, arg, "-")) {
            update_specific = arg;
        }
    }

    // Find dependency file
    const cwd = try io_helper.getCwdAlloc(allocator);
    defer allocator.free(cwd);

    const deps_file = (try detector.findDepsFile(allocator, cwd)) orelse {
        return CommandResult.err(allocator, "No dependency file found (pantry.json, pantry.jsonc, or package.json)");
    };
    defer allocator.free(deps_file.path);

    // Parse dependencies
    const deps = try parser.inferDependencies(allocator, deps_file);
    defer {
        for (deps) |*dep| {
            var d = dep.*;
            d.deinit(allocator);
        }
        allocator.free(deps);
    }

    if (deps.len == 0) {
        return CommandResult.success(allocator, "No dependencies found");
    }

    if (dry_run) {
        style.print("Dry run mode - no changes will be made\n\n", .{});
    }

    var updates_made: usize = 0;
    var errors_encountered: usize = 0;

    if (update_specific) |pkg_name| {
        // Update specific package
        style.print("Updating {s}...\n", .{pkg_name});

        // Find the package in deps
        var found_dep: ?parser.PackageDependency = null;
        for (deps) |dep| {
            if (std.mem.eql(u8, dep.name, pkg_name)) {
                found_dep = dep;
                break;
            }
        }

        if (found_dep) |dep| {
            var result = updatePackage(allocator, dep.name, dep.version, dry_run, latest) catch |err| {
                style.print("Failed to check {s}: {}\n", .{ pkg_name, err });
                errors_encountered += 1;
                return CommandResult.err(allocator, "Failed to check package for updates");
            };
            defer result.deinit(allocator);

            if (result.has_update) {
                updates_made += 1;
                if (result.new_version) |new_ver| {
                    style.print("Updated {s}: {s} -> {s}\n", .{ pkg_name, result.current_version, new_ver });
                } else {
                    style.print("Updated {s}\n", .{pkg_name});
                }
            } else {
                style.print("{s} is already up to date ({s})\n", .{ pkg_name, result.current_version });
            }
        } else {
            return CommandResult.err(allocator, "Package not found in dependencies");
        }
    } else {
        // Default: update all packages (matching bun behavior)
        style.print("Updating all packages...\n\n", .{});

        for (deps) |dep| {
            // Skip non-registry deps (github, git, url)
            if (dep.source != .registry) continue;
            // Skip workspace:* deps
            if (std.mem.startsWith(u8, dep.version, "workspace:")) continue;

            style.print("Checking {s}... ", .{dep.name});

            var result = updatePackage(allocator, dep.name, dep.version, dry_run, latest) catch |err| {
                style.print("Error: {}\n", .{err});
                errors_encountered += 1;
                continue;
            };
            defer result.deinit(allocator);

            if (result.has_update) {
                updates_made += 1;
                if (result.new_version) |new_ver| {
                    style.print("{s} -> {s}\n", .{ result.current_version, new_ver });
                } else {
                    style.print("Updated\n", .{});
                }
            } else {
                style.print("Up to date ({s})\n", .{result.current_version});
            }
        }
    }

    style.print("\n", .{});

    if (dry_run) {
        const message = try std.fmt.allocPrint(
            allocator,
            "Dry run complete: {d} package{s} would be updated",
            .{ updates_made, if (updates_made == 1) "" else "s" },
        );
        return CommandResult{
            .exit_code = 0,
            .message = message,
        };
    }

    if (updates_made > 0) {
        // Auto-run install to apply updates (like bun update does)
        style.print("\nInstalling updated packages...\n", .{});
        const install_mod = @import("install.zig");
        const install_opts = install_mod.InstallOptions{
            .force = true,
        };
        const install_result = try install_mod.installCommandWithOptions(allocator, &[_][]const u8{}, install_opts);
        if (install_result.message) |msg| {
            allocator.free(msg);
        }

        const message = try std.fmt.allocPrint(
            allocator,
            "Updated {d} package{s}",
            .{ updates_made, if (updates_made == 1) "" else "s" },
        );
        return CommandResult{
            .exit_code = if (errors_encountered > 0) 1 else 0,
            .message = message,
        };
    } else {
        return CommandResult.success(allocator, "All packages are already up to date");
    }
}

/// Update result containing version info
const UpdateResult = struct {
    has_update: bool,
    new_version: ?[]const u8,
    current_version: []const u8,

    pub fn deinit(self: *UpdateResult, allocator: std.mem.Allocator) void {
        if (self.new_version) |v| allocator.free(v);
    }
};

/// Update a single package by querying the NPM registry
fn updatePackage(
    allocator: std.mem.Allocator,
    package_name: []const u8,
    current_version: []const u8,
    dry_run: bool,
    use_latest: bool,
) !UpdateResult {
    const outdated_mod = @import("outdated.zig");

    // Strip version prefix (^, ~, etc.) from current version to get actual installed version
    var installed_version = current_version;
    if (current_version.len > 0) {
        if (current_version[0] == '^' or current_version[0] == '~') {
            installed_version = current_version[1..];
        } else if (std.mem.startsWith(u8, current_version, ">=") or
            std.mem.startsWith(u8, current_version, "<="))
        {
            installed_version = current_version[2..];
        } else if (current_version[0] == '>' or current_version[0] == '<') {
            installed_version = current_version[1..];
        }
    }

    // When --latest, use "*" as constraint to get absolute latest
    const constraint = if (use_latest) "*" else current_version;

    // Query registry for version info
    const url = try std.fmt.allocPrint(allocator, "https://registry.npmjs.org/{s}", .{package_name});
    defer allocator.free(url);

    const body = io_helper.httpGet(allocator, url) catch {
        return UpdateResult{
            .has_update = false,
            .new_version = null,
            .current_version = installed_version,
        };
    };
    defer allocator.free(body);

    if (body.len == 0) {
        return UpdateResult{ .has_update = false, .new_version = null, .current_version = installed_version };
    }

    const parsed = std.json.parseFromSlice(std.json.Value, allocator, body, .{}) catch {
        return UpdateResult{ .has_update = false, .new_version = null, .current_version = installed_version };
    };
    defer parsed.deinit();

    if (parsed.value != .object) {
        return UpdateResult{ .has_update = false, .new_version = null, .current_version = installed_version };
    }

    // Get dist-tags.latest
    const latest_version = blk: {
        const dist_tags = parsed.value.object.get("dist-tags") orelse break :blk null;
        if (dist_tags != .object) break :blk null;
        const latest_val = dist_tags.object.get("latest") orelse break :blk null;
        if (latest_val != .string) break :blk null;
        break :blk latest_val.string;
    } orelse {
        return UpdateResult{ .has_update = false, .new_version = null, .current_version = installed_version };
    };

    // Determine the target version
    const target_version = if (use_latest or std.mem.eql(u8, constraint, "*"))
        latest_version
    else blk: {
        // Find highest version satisfying the constraint
        const versions_obj = parsed.value.object.get("versions") orelse break :blk latest_version;
        if (versions_obj != .object) break :blk latest_version;

        var best: ?[]const u8 = null;
        var ver_iter = versions_obj.object.iterator();
        while (ver_iter.next()) |entry| {
            const ver = entry.key_ptr.*;
            if (outdated_mod.satisfiesConstraint(ver, constraint)) {
                if (best == null or outdated_mod.compareVersions(ver, best.?) == .gt) {
                    best = ver;
                }
            }
        }
        break :blk best orelse latest_version;
    };

    // Compare with installed version
    if (std.mem.eql(u8, installed_version, target_version)) {
        return UpdateResult{ .has_update = false, .new_version = null, .current_version = installed_version };
    }

    // Check if target is actually newer
    if (outdated_mod.compareVersions(target_version, installed_version) != .gt) {
        return UpdateResult{ .has_update = false, .new_version = null, .current_version = installed_version };
    }

    const new_version = try allocator.dupe(u8, target_version);

    // If not dry run, update the config file
    if (!dry_run) {
        updateConfigFile(allocator, package_name, new_version) catch |err| {
            style.print("Warning: Failed to update config for {s}: {}\n", .{ package_name, err });
        };
    }

    return UpdateResult{
        .has_update = true,
        .new_version = new_version,
        .current_version = installed_version,
    };
}

/// Update pantry.json/pantry.jsonc/package.json with new version
fn updateConfigFile(
    allocator: std.mem.Allocator,
    package_name: []const u8,
    new_version: []const u8,
) !void {
    const config_files = [_][]const u8{ "pantry.jsonc", "pantry.json", "package.json" };
    for (config_files) |config_path| {
        const content = io_helper.readFileAlloc(allocator, config_path, 10 * 1024 * 1024) catch continue;
        defer allocator.free(content);

        const updated = try updateJsonContent(allocator, content, package_name, new_version);
        defer allocator.free(updated);

        // Write back by creating/overwriting the file
        const file = io_helper.createFile(config_path, .{}) catch continue;
        defer file.close(io_helper.io);
        io_helper.writeAllToFile(file, updated) catch continue;
        return;
    }
    return error.ConfigNotFound;
}

/// Update version in JSON content string.
/// Uses text-level scanning to preserve formatting, indentation, and trailing
/// commas exactly as they were — only the version string value changes.
fn updateJsonContent(
    allocator: std.mem.Allocator,
    content: []const u8,
    package_name: []const u8,
    new_version: []const u8,
) ![]u8 {
    var result = std.ArrayList(u8){};
    defer result.deinit(allocator);

    // Build the search key: "package_name"
    const pattern = try std.fmt.allocPrint(allocator, "\"{s}\"", .{package_name});
    defer allocator.free(pattern);

    // Dependency section markers we recognise
    const dep_sections = [_][]const u8{
        "\"dependencies\"",
        "\"devDependencies\"",
        "\"peerDependencies\"",
        "\"optionalDependencies\"",
    };

    var i: usize = 0;
    var in_dependencies = false;
    var brace_depth: usize = 0;

    while (i < content.len) {
        // --- detect entry into a dependency section ---
        if (!in_dependencies or brace_depth == 0) {
            for (dep_sections) |section| {
                if (i + section.len <= content.len and
                    std.mem.startsWith(u8, content[i..], section))
                {
                    in_dependencies = true;
                    brace_depth = 0;
                    break;
                }
            }
        }

        // --- track brace depth to know when we leave the section ---
        if (in_dependencies) {
            if (content[i] == '{') {
                brace_depth += 1;
            } else if (content[i] == '}') {
                if (brace_depth > 0) {
                    brace_depth -= 1;
                    if (brace_depth == 0) {
                        in_dependencies = false;
                    }
                }
            }
        }

        // --- inside a dependency object, look for our package key ---
        if (in_dependencies and brace_depth > 0 and
            i + pattern.len <= content.len and
            std.mem.startsWith(u8, content[i..], pattern))
        {
            // Copy the key verbatim
            try result.appendSlice(allocator, content[i .. i + pattern.len]);
            i += pattern.len;

            // Copy whitespace / colon / whitespace between key and value
            while (i < content.len and (content[i] == ' ' or content[i] == '\t' or
                content[i] == '\n' or content[i] == '\r' or content[i] == ':'))
            {
                try result.append(allocator, content[i]);
                i += 1;
            }

            // Expect opening quote of the version string
            if (i < content.len and content[i] == '"') {
                const version_start = i + 1; // position after opening "
                i += 1; // skip opening quote

                // Walk to closing quote, handling escape sequences
                while (i < content.len and content[i] != '"') {
                    if (content[i] == '\\' and i + 1 < content.len) {
                        i += 1; // skip escaped char
                    }
                    i += 1;
                }
                if (i < content.len) {
                    i += 1; // skip closing quote
                }

                // Extract the old version to preserve its range prefix
                const old_version = content[version_start .. i - 1];
                var prefix: []const u8 = "";
                if (old_version.len > 0) {
                    if (old_version[0] == '^' or old_version[0] == '~') {
                        prefix = old_version[0..1];
                    } else if (std.mem.startsWith(u8, old_version, ">=") or
                        std.mem.startsWith(u8, old_version, "<="))
                    {
                        prefix = old_version[0..2];
                    } else if (old_version[0] == '>' or old_version[0] == '<') {
                        prefix = old_version[0..1];
                    }
                }

                // Write the new version with the original prefix preserved
                try result.append(allocator, '"');
                try result.appendSlice(allocator, prefix);
                try result.appendSlice(allocator, new_version);
                try result.append(allocator, '"');
                continue;
            }
        }

        // --- default: copy byte as-is ---
        try result.append(allocator, content[i]);
        i += 1;
    }

    return try allocator.dupe(u8, result.items);
}
