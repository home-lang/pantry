const std = @import("std");
const io_helper = @import("../../io_helper.zig");
const common = @import("common.zig");
const lib = @import("../../lib.zig");
const style = @import("../style.zig");

const CommandResult = common.CommandResult;

/// OIDC setup command - helps configure npm trusted publishing
pub fn execute(allocator: std.mem.Allocator, args: []const []const u8) !CommandResult {
    _ = args;

    style.print("\n", .{});
    style.print("╭─────────────────────────────────────────────────────────╮\n", .{});
    style.print("│           npm Trusted Publisher Setup                   │\n", .{});
    style.print("╰─────────────────────────────────────────────────────────╯\n", .{});
    style.print("\n", .{});

    // 1. Read package.json to get package name
    const package_name = getPackageName(allocator) catch |err| {
        const msg = try std.fmt.allocPrint(allocator, "Failed to read package.json: {any}", .{err});
        return CommandResult.err(allocator, msg);
    };
    defer allocator.free(package_name);

    style.print("📦 Package: {s}\n", .{package_name});

    // 2. Detect GitHub repository
    const repo = detectGitHubRepo(allocator) catch |err| {
        style.print("⚠️  Could not detect GitHub repository: {any}\n", .{err});
        style.print("   You'll need to enter the repository manually on npm.\n\n", .{});
        return printManualInstructions(allocator, package_name, null, null);
    };
    defer allocator.free(repo);

    style.print("🔗 Repository: {s}\n", .{repo});

    // 3. Find workflow files
    const workflow = findWorkflowFile(allocator) catch |err| {
        style.print("⚠️  Could not find workflow file: {any}\n", .{err});
        style.print("   You'll need to enter the workflow filename manually on npm.\n\n", .{});
        return printManualInstructions(allocator, package_name, repo, null);
    };
    defer allocator.free(workflow);

    style.print("⚙️  Workflow: {s}\n", .{workflow});
    style.print("\n", .{});

    return printSetupInstructions(allocator, package_name, repo, workflow);
}

fn getPackageName(allocator: std.mem.Allocator) ![]const u8 {
    const content = io_helper.readFileAlloc(allocator, "package.json", 1024 * 1024) catch {
        return error.PackageJsonNotFound;
    };
    defer allocator.free(content);

    const parsed = std.json.parseFromSlice(std.json.Value, allocator, content, .{}) catch {
        return error.InvalidPackageJson;
    };
    defer parsed.deinit();

    if (parsed.value != .object) return error.InvalidPackageJson;

    const name = parsed.value.object.get("name") orelse return error.MissingName;
    if (name != .string) return error.InvalidName;

    return try allocator.dupe(u8, name.string);
}

fn detectGitHubRepo(allocator: std.mem.Allocator) ![]const u8 {
    // Read .git/config to get origin URL (native, no subprocess)
    const config = try io_helper.readFileAlloc(allocator, ".git/config", 64 * 1024);
    defer allocator.free(config);

    var url: []const u8 = "";
    var in_origin = false;
    var lines = std.mem.splitScalar(u8, config, '\n');
    while (lines.next()) |line| {
        const tl = std.mem.trim(u8, line, " \t\r");
        if (std.mem.startsWith(u8, tl, "[remote \"origin\"]")) {
            in_origin = true;
            continue;
        }
        if (in_origin) {
            if (tl.len > 0 and tl[0] == '[') break;
            if (std.mem.startsWith(u8, tl, "url = ") or std.mem.startsWith(u8, tl, "url=")) {
                const sep = if (std.mem.indexOf(u8, tl, "= ")) |i| i + 2 else if (std.mem.indexOf(u8, tl, "=")) |i| i + 1 else continue;
                url = std.mem.trim(u8, tl[sep..], " \t");
                break;
            }
        }
    }

    if (url.len == 0) return error.EmptyOutput;

    // Parse GitHub URL formats:
    // https://github.com/owner/repo.git
    // git@github.com:owner/repo.git
    // https://github.com/owner/repo

    if (std.mem.startsWith(u8, url, "https://github.com/")) {
        url = url["https://github.com/".len..];
    } else if (std.mem.startsWith(u8, url, "git@github.com:")) {
        url = url["git@github.com:".len..];
    } else {
        return error.NotGitHubRepo;
    }

    // Remove .git suffix if present
    if (std.mem.endsWith(u8, url, ".git")) {
        url = url[0 .. url.len - 4];
    }

    return try allocator.dupe(u8, url);
}

fn findWorkflowFile(allocator: std.mem.Allocator) ![]const u8 {
    // Look for workflow files in .github/workflows/
    var dir = io_helper.openDirAbsoluteForIteration(".github/workflows") catch {
        return error.NoWorkflowDir;
    };
    defer dir.close();

    var iter = dir.iterate();

    // Look for publish.yml or similar
    const preferred = [_][]const u8{ "publish.yml", "publish.yaml", "release.yml", "release.yaml", "npm-publish.yml" };

    var first_yml: ?[]const u8 = null;

    while (iter.next() catch null) |entry| {
        if (entry.kind != .file) continue;

        const name = entry.name;
        if (!std.mem.endsWith(u8, name, ".yml") and !std.mem.endsWith(u8, name, ".yaml")) continue;

        // Check if it's a preferred name
        for (preferred) |pref| {
            if (std.mem.eql(u8, name, pref)) {
                return try allocator.dupe(u8, name);
            }
        }

        // Keep track of first yml file as fallback
        if (first_yml == null) {
            first_yml = try allocator.dupe(u8, name);
        }
    }

    if (first_yml) |yml| {
        return yml;
    }

    return error.NoWorkflowFound;
}

fn printSetupInstructions(allocator: std.mem.Allocator, package_name: []const u8, repo: []const u8, workflow: []const u8) !CommandResult {
    // URL encode the package name for the npm URL
    const encoded_name = try urlEncode(allocator, package_name);
    defer allocator.free(encoded_name);

    style.print("────────────────────────────────────────────────────────────\n", .{});
    style.print("To enable OIDC trusted publishing, configure on npm:\n\n", .{});

    style.print("1. Go to: https://www.npmjs.com/package/{s}/access\n\n", .{encoded_name});

    style.print("2. Under \"Trusted Publishing\", click \"Add Trusted Publisher\"\n\n", .{});

    style.print("3. Enter these values:\n", .{});
    style.print("   • Repository:     {s}\n", .{repo});
    style.print("   • Workflow file:  {s}\n", .{workflow});
    style.print("   • Environment:    (leave empty unless using GitHub environments)\n\n", .{});

    style.print("4. Click \"Add Trusted Publisher\"\n\n", .{});

    style.print("────────────────────────────────────────────────────────────\n", .{});
    style.print("Once configured, you can publish without any secrets:\n\n", .{});
    style.print("  pantry publish --access public\n\n", .{});

    style.print("Your workflow needs these permissions:\n\n", .{});
    style.print("  permissions:\n", .{});
    style.print("    contents: read\n", .{});
    style.print("    id-token: write\n\n", .{});

    return CommandResult.success(allocator, null);
}

fn printManualInstructions(allocator: std.mem.Allocator, package_name: []const u8, repo: ?[]const u8, workflow: ?[]const u8) !CommandResult {
    const encoded_name = try urlEncode(allocator, package_name);
    defer allocator.free(encoded_name);

    style.print("────────────────────────────────────────────────────────────\n", .{});
    style.print("To enable OIDC trusted publishing:\n\n", .{});

    style.print("1. Go to: https://www.npmjs.com/package/{s}/access\n\n", .{encoded_name});

    style.print("2. Under \"Trusted Publishing\", add:\n", .{});
    if (repo) |r| {
        style.print("   • Repository:     {s}\n", .{r});
    } else {
        style.print("   • Repository:     <your-github-org/repo>\n", .{});
    }
    if (workflow) |w| {
        style.print("   • Workflow file:  {s}\n", .{w});
    } else {
        style.print("   • Workflow file:  <your-workflow.yml>\n", .{});
    }
    style.print("   • Environment:    (optional)\n\n", .{});

    return CommandResult.success(allocator, null);
}

fn urlEncode(allocator: std.mem.Allocator, input: []const u8) ![]const u8 {
    var len: usize = 0;
    for (input) |c| {
        len += switch (c) {
            '/', '@' => 3,
            else => 1,
        };
    }

    if (len == input.len) {
        return try allocator.dupe(u8, input);
    }

    const result = try allocator.alloc(u8, len);
    var i: usize = 0;
    for (input) |c| {
        switch (c) {
            '/' => {
                result[i] = '%';
                result[i + 1] = '2';
                result[i + 2] = 'F';
                i += 3;
            },
            '@' => {
                result[i] = '%';
                result[i + 1] = '4';
                result[i + 2] = '0';
                i += 3;
            },
            else => {
                result[i] = c;
                i += 1;
            },
        }
    }
    return result;
}
