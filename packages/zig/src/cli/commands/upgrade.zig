const std = @import("std");
const lib = @import("lib");
const io_helper = lib.io_helper;
const style = lib.style;
const downloader = lib.install.downloader;
const CommandResult = lib.commands.common.CommandResult;

const REPO = "home-lang/pantry";

pub const UpgradeOptions = struct {
    canary: bool = false,
    verbose: bool = false,
    dry_run: bool = false,
};

/// Self-update pantry to the latest (or canary) version.
///
/// Usage:
///   pantry upgrade            # upgrade to latest stable release
///   pantry upgrade --canary   # upgrade to latest canary (pre-release)
pub fn upgradeCommand(allocator: std.mem.Allocator, _: []const []const u8, options: UpgradeOptions) !CommandResult {
    const version_options = @import("version");
    const current_version = version_options.version;

    style.print("{s}>{s} pantry upgrade\n", .{ style.green, style.reset });

    // Detect platform
    const os_str = comptime switch (@import("builtin").os.tag) {
        .macos => "darwin",
        .linux => "linux",
        .windows => "windows",
        .freebsd => "freebsd",
        else => "linux",
    };
    const arch_str = comptime switch (@import("builtin").cpu.arch) {
        .aarch64 => "arm64",
        .x86_64 => "x64",
        else => "x64",
    };
    const zip_name = comptime "pantry-" ++ os_str ++ "-" ++ arch_str ++ ".zip";
    const is_windows = comptime @import("builtin").os.tag == .windows;
    const bin_name = if (is_windows) "pantry.exe" else "pantry";

    style.print("  Current version: {s}\n", .{current_version});
    style.print("  Platform: " ++ os_str ++ "-" ++ arch_str ++ "\n", .{});

    if (options.canary) {
        style.print("  Channel: {s}canary{s}\n", .{ style.yellow, style.reset });
    }

    // Fetch latest release info from GitHub API
    const api_url = if (options.canary)
        "https://api.github.com/repos/" ++ REPO ++ "/releases"
    else
        "https://api.github.com/repos/" ++ REPO ++ "/releases/latest";

    style.print("  Checking for updates...\n", .{});

    const response = io_helper.httpGet(allocator, api_url) catch |err| {
        const msg = try std.fmt.allocPrint(
            allocator,
            "Failed to reach GitHub API ({s}). URL: {s}\n" ++
                "    Hints: check internet, set HTTPS_PROXY, or try --canary/--dry-run.",
            .{ @errorName(err), api_url },
        );
        return CommandResult.err(allocator, msg);
    };
    defer allocator.free(response);

    if (response.len == 0) {
        const msg = try std.fmt.allocPrint(
            allocator,
            "Empty response from GitHub API (url: {s}). API rate limit? try again in a few minutes.",
            .{api_url},
        );
        return CommandResult.err(allocator, msg);
    }

    // Parse the release JSON
    const parsed = std.json.parseFromSlice(std.json.Value, allocator, response, .{}) catch |err| {
        const msg = try std.fmt.allocPrint(
            allocator,
            "Failed to parse GitHub API response ({s}). body[0..64]={s}",
            .{ @errorName(err), response[0..@min(response.len, 64)] },
        );
        return CommandResult.err(allocator, msg);
    };
    defer parsed.deinit();

    // For canary, use first release; for stable, response is already the latest
    const release = if (options.canary) blk: {
        if (parsed.value != .array) break :blk parsed.value;
        if (parsed.value.array.items.len == 0) {
            return CommandResult.err(allocator, "No releases found");
        }
        break :blk parsed.value.array.items[0];
    } else parsed.value;

    if (release != .object) {
        return CommandResult.err(allocator, "Unexpected GitHub API response format");
    }

    // Get version tag
    const tag = if (release.object.get("tag_name")) |t| (if (t == .string) t.string else "unknown") else "unknown";
    const latest_version = if (tag.len > 0 and tag[0] == 'v') tag[1..] else tag;

    // Check if already up to date
    if (std.mem.eql(u8, latest_version, current_version)) {
        style.print("\n  {s}Already up to date!{s} ({s})\n", .{ style.green, style.reset, current_version });
        return .{ .exit_code = 0 };
    }

    style.print("  New version: {s}{s}{s}\n", .{ style.green, latest_version, style.reset });

    if (options.dry_run) {
        style.print("\n  {s}[dry-run]{s} Would upgrade {s} → {s}\n", .{ style.yellow, style.reset, current_version, latest_version });
        return .{ .exit_code = 0 };
    }

    // Find download URL for our platform
    const assets = if (release.object.get("assets")) |a| (if (a == .array) a.array.items else &[_]std.json.Value{}) else &[_]std.json.Value{};

    var download_url: ?[]const u8 = null;
    for (assets) |asset| {
        if (asset != .object) continue;
        const name = if (asset.object.get("name")) |n| (if (n == .string) n.string else continue) else continue;
        if (std.mem.eql(u8, name, zip_name)) {
            download_url = if (asset.object.get("browser_download_url")) |u| (if (u == .string) u.string else null) else null;
            break;
        }
    }

    const url = download_url orelse {
        const msg = try std.fmt.allocPrint(allocator, "No binary found for " ++ zip_name ++ " in release {s}", .{tag});
        return CommandResult.err(allocator, msg);
    };

    if (options.verbose) {
        style.print("  Download: {s}\n", .{url});
    }

    // Download and extract
    style.print("  Downloading {s}...\n", .{zip_name});

    const home = io_helper.getenv("HOME") orelse "/tmp";
    const tmp_zip = try std.fmt.allocPrint(allocator, "{s}/.pantry/.tmp/pantry-upgrade.zip", .{home});
    defer allocator.free(tmp_zip);
    const tmp_dir = try std.fmt.allocPrint(allocator, "{s}/.pantry/.tmp/pantry-upgrade", .{home});
    defer allocator.free(tmp_dir);
    const tmp_parent = try std.fmt.allocPrint(allocator, "{s}/.pantry/.tmp", .{home});
    defer allocator.free(tmp_parent);

    io_helper.makePath(tmp_parent) catch {};
    io_helper.makePath(tmp_dir) catch {};

    downloader.downloadFileQuiet(allocator, url, tmp_zip, false) catch |err| {
        const msg = try std.fmt.allocPrint(
            allocator,
            "Failed to download update ({s}).\n" ++
                "    URL: {s}\n" ++
                "    Hints: retry; set HTTPS_PROXY; check https://status.github.com",
            .{ @errorName(err), url },
        );
        return CommandResult.err(allocator, msg);
    };

    // Extract
    style.print("  Extracting...\n", .{});
    _ = io_helper.spawnAndWait(.{
        .argv = &.{ "unzip", "-o", tmp_zip, "-d", tmp_dir },
    }) catch |err| {
        const msg = try std.fmt.allocPrint(
            allocator,
            "Failed to extract update ({s}). Archive may be corrupt; try: pantry upgrade --canary",
            .{@errorName(err)},
        );
        return CommandResult.err(allocator, msg);
    };

    // Install path + staged binary path
    const install_path = try std.fmt.allocPrint(allocator, "{s}/.local/bin/{s}", .{ home, bin_name });
    defer allocator.free(install_path);
    const new_binary = try std.fmt.allocPrint(allocator, "{s}/{s}", .{ tmp_dir, bin_name });
    defer allocator.free(new_binary);

    // Staged binary must exist before we do anything
    io_helper.accessAbsolute(new_binary, .{}) catch |err| {
        const msg = try std.fmt.allocPrint(
            allocator,
            "Extracted archive missing expected binary {s} ({s})",
            .{ new_binary, @errorName(err) },
        );
        return CommandResult.err(allocator, msg);
    };

    // chmod +x the staged binary before verifying
    _ = io_helper.spawnAndWait(.{
        .argv = &.{ "chmod", "+x", new_binary },
    }) catch {};

    // Smoke-test the staged binary: `pantry --version` should exit 0 and print the new tag.
    // This protects against corrupt downloads that extract but don't run.
    style.print("  Verifying staged binary...\n", .{});
    const verify_result = io_helper.childRun(allocator, &[_][]const u8{ new_binary, "--version" }) catch |err| {
        io_helper.deleteTree(tmp_dir) catch {};
        io_helper.deleteFile(tmp_zip) catch {};
        const msg = try std.fmt.allocPrint(
            allocator,
            "Staged binary failed to execute ({s}). Upgrade aborted; existing install left intact.",
            .{@errorName(err)},
        );
        return CommandResult.err(allocator, msg);
    };
    defer allocator.free(verify_result.stdout);
    defer allocator.free(verify_result.stderr);
    if (verify_result.term != .exited or verify_result.term.exited != 0) {
        io_helper.deleteTree(tmp_dir) catch {};
        io_helper.deleteFile(tmp_zip) catch {};
        const msg = try std.fmt.allocPrint(
            allocator,
            "Staged binary exited non-zero during verification (stderr: {s}). Upgrade aborted; existing install left intact.",
            .{verify_result.stderr[0..@min(verify_result.stderr.len, 256)]},
        );
        return CommandResult.err(allocator, msg);
    }

    style.print("  Installing to {s}...\n", .{install_path});

    // Atomic replace: rename(2) into place so the binary swap is crash-safe.
    // The parent dir must exist; we stage alongside for same-filesystem rename.
    const staging_final = try std.fmt.allocPrint(allocator, "{s}.pantry-upgrade-{d}", .{ install_path, @as(i64, @intCast(io_helper.clockGettime().sec)) * 1000 });
    defer allocator.free(staging_final);

    // Try cross-filesystem-safe copy-then-rename: copy to staging next to target, then rename.
    io_helper.copyFile(new_binary, staging_final) catch |err| {
        io_helper.deleteTree(tmp_dir) catch {};
        io_helper.deleteFile(tmp_zip) catch {};
        const msg = try std.fmt.allocPrint(
            allocator,
            "Failed to stage new binary at {s} ({s}). Try: sudo pantry upgrade, or check {s} is writable.",
            .{ staging_final, @errorName(err), install_path },
        );
        return CommandResult.err(allocator, msg);
    };
    _ = io_helper.spawnAndWait(.{
        .argv = &.{ "chmod", "+x", staging_final },
    }) catch {};

    io_helper.rename(staging_final, install_path) catch |err| {
        // rename failed — clean up staging and report
        io_helper.deleteFile(staging_final) catch {};
        io_helper.deleteTree(tmp_dir) catch {};
        io_helper.deleteFile(tmp_zip) catch {};
        const msg = try std.fmt.allocPrint(
            allocator,
            "Atomic rename failed ({s}). Target: {s}; Staged: {s}. Existing install left intact.",
            .{ @errorName(err), install_path, staging_final },
        );
        return CommandResult.err(allocator, msg);
    };

    // Cleanup
    io_helper.deleteTree(tmp_dir) catch {};
    io_helper.deleteFile(tmp_zip) catch {};

    style.print("\n  {s}Upgraded!{s} {s} → {s}{s}{s}\n", .{
        style.green,     style.reset,
        current_version, style.green,
        latest_version,  style.reset,
    });

    return .{ .exit_code = 0 };
}
