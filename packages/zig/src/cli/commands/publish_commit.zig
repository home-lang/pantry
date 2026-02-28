//! Publish Commit Command
//!
//! Publishes packages from the current git commit to the Pantry registry,
//! equivalent to `pkg-pr-new publish`. Packages are stored under a
//! commit-specific path and can be installed directly via tarball URL.
//!
//! Usage:
//!   pantry publish:commit './packages/*'
//!   pantry publish:commit './storage/framework/core/*'
//!   pantry publish:commit --dry-run './packages/*'

const std = @import("std");
const io_helper = @import("../../io_helper.zig");
const style = @import("../style.zig");
const common = @import("common.zig");
const registry_commands = @import("registry.zig");

const CommandResult = common.CommandResult;

/// Default Pantry registry URL
const PANTRY_REGISTRY_URL = "https://registry.stacksjs.com";

pub const PublishCommitOptions = struct {
    registry: []const u8 = PANTRY_REGISTRY_URL,
    token: ?[]const u8 = null,
    dry_run: bool = false,
    compact: bool = false,
};

/// Publish packages from the current git commit.
/// Accepts glob patterns as positional arguments to specify package directories.
/// Auto-detects git SHA and repository info.
pub fn publishCommitCommand(allocator: std.mem.Allocator, args: []const []const u8, options: PublishCommitOptions) !CommandResult {
    // Get current working directory
    const cwd = io_helper.realpathAlloc(allocator, ".") catch {
        return CommandResult.err(allocator, "Error: Could not determine current directory");
    };
    defer allocator.free(cwd);

    // Get git commit SHA
    const sha = getGitSha(allocator) catch {
        return CommandResult.err(allocator, "Error: Could not determine git commit SHA. Are you in a git repository?");
    };
    defer allocator.free(sha);

    if (sha.len == 0) {
        return CommandResult.err(allocator, "Error: Empty git SHA. Are you in a git repository?");
    }

    const short_sha = if (sha.len >= 7) sha[0..7] else sha;

    // Get repository info
    const repo_url = getGitRepoUrl(allocator) catch blk: {
        break :blk null;
    };
    defer if (repo_url) |r| allocator.free(r);

    style.print("\n{s}Publishing commit {s}{s}{s}...{s}\n", .{ style.bold, style.cyan, short_sha, style.reset ++ style.bold, style.reset });
    if (repo_url) |url| {
        style.print("Repository: {s}\n", .{url});
    }
    style.print("Registry: {s}\n\n", .{options.registry});

    // Resolve package directories from glob patterns
    var package_dirs = std.ArrayList(PackageInfo){};
    defer {
        for (package_dirs.items) |*pkg| {
            pkg.deinit(allocator);
        }
        package_dirs.deinit(allocator);
    }

    if (args.len > 0) {
        // Use provided glob patterns
        for (args) |pattern| {
            try resolveGlobPattern(allocator, cwd, pattern, &package_dirs);
        }
    } else {
        // No patterns provided — auto-detect monorepo packages
        const monorepo_packages = registry_commands.detectMonorepoPackages(allocator, cwd, null) catch null;
        if (monorepo_packages) |pkgs| {
            for (pkgs) |pkg| {
                try package_dirs.append(allocator, .{
                    .name = try allocator.dupe(u8, pkg.name),
                    .path = try allocator.dupe(u8, pkg.path),
                    .config_path = try allocator.dupe(u8, pkg.config_path),
                    .version = null,
                });
            }
            // Free the monorepo package slice (we duped the strings)
            for (pkgs) |*pkg| {
                var p = pkg.*;
                p.deinit(allocator);
            }
            allocator.free(pkgs);
        } else {
            // Single package — use CWD
            const config_path = common.findConfigFile(allocator, cwd) catch {
                return CommandResult.err(allocator, "Error: No package configuration found. Provide glob patterns or run from a package directory.");
            };
            const pkg_name = readPackageName(allocator, config_path) catch "unknown";
            const pkg_version = readPackageVersion(allocator, config_path) catch null;

            try package_dirs.append(allocator, .{
                .name = try allocator.dupe(u8, pkg_name),
                .path = try allocator.dupe(u8, cwd),
                .config_path = config_path,
                .version = if (pkg_version) |v| try allocator.dupe(u8, v) else null,
            });
        }
    }

    if (package_dirs.items.len == 0) {
        return CommandResult.err(allocator, "Error: No packages found matching the provided patterns");
    }

    style.print("Found {d} package(s) to publish:\n", .{package_dirs.items.len});
    for (package_dirs.items) |pkg| {
        style.print("  - {s}", .{pkg.name});
        if (pkg.version) |v| {
            style.print(" (v{s})", .{v});
        }
        style.print("\n", .{});
    }
    style.print("\n", .{});

    if (options.dry_run) {
        style.print("{s}[DRY RUN]{s} Would publish the above packages from commit {s}\n", .{ style.yellow, style.reset, short_sha });
        return .{ .exit_code = 0 };
    }

    // Check for authentication (ensure env vars are non-empty, not just set)
    const aws_key = io_helper.getenv("AWS_ACCESS_KEY_ID");
    const has_aws_creds = (aws_key != null and aws_key.?.len > 0) or awsCredentialsFileExists();

    var token: ?[]const u8 = if (options.token) |t| (if (t.len > 0) t else null) else null;
    var token_owned = false;
    if (token == null) {
        token = io_helper.getEnvVarOwned(allocator, "PANTRY_REGISTRY_TOKEN") catch null;
        if (token) |t| {
            if (t.len == 0) {
                allocator.free(t);
                token = null;
            } else {
                token_owned = true;
            }
        }
    }
    if (token == null) {
        token = io_helper.getEnvVarOwned(allocator, "PANTRY_TOKEN") catch null;
        if (token) |t| {
            if (t.len == 0) {
                allocator.free(t);
                token = null;
            } else {
                token_owned = true;
            }
        }
    }
    if (token == null) {
        token = registry_commands.readPantryToken(allocator) catch null;
        if (token) |t| {
            if (t.len == 0) {
                allocator.free(t);
                token = null;
            } else {
                token_owned = true;
            }
        }
    }
    defer if (token_owned and token != null) allocator.free(token.?);

    if (!has_aws_creds and token == null) {
        return CommandResult.err(
            allocator,
            \\Error: No authentication found.
            \\
            \\For direct S3 upload, configure AWS credentials in ~/.aws/credentials
            \\Or set PANTRY_REGISTRY_TOKEN for HTTP upload to registry server.
            ,
        );
    }

    // Publish each package
    var succeeded: usize = 0;
    var failed: usize = 0;

    // Collect results for summary output
    var result_urls = std.ArrayList(PublishResult){};
    defer {
        for (result_urls.items) |*r| {
            r.deinit(allocator);
        }
        result_urls.deinit(allocator);
    }

    for (package_dirs.items) |pkg| {
        style.print("Publishing {s}{s}{s}...\n", .{ style.bold, pkg.name, style.reset });

        const result = publishCommitPackage(allocator, pkg, sha, repo_url, options, has_aws_creds, token) catch |err| {
            failed += 1;
            style.print("  {s}✗{s} Failed: {any}\n", .{ style.red, style.reset, err });
            continue;
        };

        if (result.success) {
            succeeded += 1;
            style.print("  {s}✓{s} Published\n", .{ style.green, style.reset });
            try result_urls.append(allocator, .{
                .name = try allocator.dupe(u8, pkg.name),
                .url = try allocator.dupe(u8, result.url),
            });
        } else {
            failed += 1;
            style.print("  {s}✗{s} Failed\n", .{ style.red, style.reset });
        }
    }

    // Print summary with install URLs
    style.print("\n{s}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━{s}\n", .{ style.dim, style.reset });

    if (succeeded > 0) {
        style.print("\n{s}✓ Published {d}/{d} package(s) from commit {s}{s}\n\n", .{
            style.green,
            succeeded,
            succeeded + failed,
            short_sha,
            style.reset,
        });

        style.print("{s}Install URLs:{s}\n", .{ style.bold, style.reset });
        for (result_urls.items) |r| {
            style.print("  {s}{s}{s}\n", .{ style.cyan, r.name, style.reset });
            style.print("    npm i {s}\n\n", .{r.url});
        }
    }

    if (failed > 0) {
        style.print("{s}✗ {d} package(s) failed{s}\n", .{ style.red, failed, style.reset });
    }

    return .{ .exit_code = if (failed > 0) 1 else 0 };
}

// ============================================================================
// Internal Types
// ============================================================================

const PackageInfo = struct {
    name: []const u8,
    path: []const u8,
    config_path: []const u8,
    version: ?[]const u8,

    pub fn deinit(self: *PackageInfo, allocator: std.mem.Allocator) void {
        allocator.free(self.name);
        allocator.free(self.path);
        allocator.free(self.config_path);
        if (self.version) |v| allocator.free(v);
    }
};

const PublishResult = struct {
    name: []const u8,
    url: []const u8,

    pub fn deinit(self: *PublishResult, allocator: std.mem.Allocator) void {
        allocator.free(self.name);
        allocator.free(self.url);
    }
};

const CommitPublishResult = struct {
    success: bool,
    url: []const u8,
};

// ============================================================================
// Git Helpers
// ============================================================================

/// Get the current git commit SHA (full 40-char hash)
fn getGitSha(allocator: std.mem.Allocator) ![]const u8 {
    const result = try io_helper.childRun(allocator, &[_][]const u8{ "git", "rev-parse", "HEAD" });
    defer allocator.free(result.stderr);

    if (result.term != .exited or result.term.exited != 0) {
        allocator.free(result.stdout);
        return error.GitNotAvailable;
    }

    // Trim trailing newline
    const stdout = result.stdout;
    const trimmed = std.mem.trim(u8, stdout, &std.ascii.whitespace);
    if (trimmed.len == 0) {
        allocator.free(stdout);
        return error.GitNotAvailable;
    }

    const sha = try allocator.dupe(u8, trimmed);
    allocator.free(stdout);
    return sha;
}

/// Get the git remote URL, normalized to https
fn getGitRepoUrl(allocator: std.mem.Allocator) ![]const u8 {
    const result = try io_helper.childRun(allocator, &[_][]const u8{ "git", "remote", "get-url", "origin" });
    defer allocator.free(result.stderr);

    if (result.term != .exited or result.term.exited != 0) {
        allocator.free(result.stdout);
        return error.GitNotAvailable;
    }

    const stdout = result.stdout;
    defer allocator.free(stdout);
    const trimmed = std.mem.trim(u8, stdout, &std.ascii.whitespace);

    if (trimmed.len == 0) return error.GitNotAvailable;

    // Convert git@github.com:owner/repo.git to https://github.com/owner/repo
    if (std.mem.startsWith(u8, trimmed, "git@")) {
        if (std.mem.indexOf(u8, trimmed, ":")) |colon_idx| {
            const host = trimmed[4..colon_idx];
            var path = trimmed[colon_idx + 1 ..];
            if (std.mem.endsWith(u8, path, ".git")) {
                path = path[0 .. path.len - 4];
            }
            return try std.fmt.allocPrint(allocator, "https://{s}/{s}", .{ host, path });
        }
    }

    // Already https
    if (std.mem.startsWith(u8, trimmed, "https://")) {
        var url = trimmed;
        if (std.mem.endsWith(u8, url, ".git")) {
            url = url[0 .. url.len - 4];
        }
        return try allocator.dupe(u8, url);
    }

    return try allocator.dupe(u8, trimmed);
}

// ============================================================================
// Glob Pattern Resolution
// ============================================================================

/// Resolve a glob pattern to a list of package directories.
/// Supports patterns like './packages/*', './storage/framework/core/*'
fn resolveGlobPattern(
    allocator: std.mem.Allocator,
    cwd: []const u8,
    pattern: []const u8,
    packages: *std.ArrayList(PackageInfo),
) !void {
    // Strip leading ./ if present
    var clean_pattern = pattern;
    if (std.mem.startsWith(u8, clean_pattern, "./")) {
        clean_pattern = clean_pattern[2..];
    }

    // Check if pattern ends with /* (directory glob)
    if (std.mem.endsWith(u8, clean_pattern, "/*")) {
        const dir_prefix = clean_pattern[0 .. clean_pattern.len - 2];
        const base_dir = try std.fs.path.join(allocator, &[_][]const u8{ cwd, dir_prefix });
        defer allocator.free(base_dir);

        var dir = io_helper.openDirForIteration(base_dir) catch |err| {
            style.print("Warning: Could not open directory '{s}': {any}\n", .{ dir_prefix, err });
            return;
        };
        defer dir.close();

        var iter = dir.iterate();
        while (iter.next() catch null) |entry| {
            if (entry.kind != .directory) continue;
            if (std.mem.startsWith(u8, entry.name, ".")) continue;
            if (std.mem.eql(u8, entry.name, "node_modules")) continue;

            const entry_path = try std.fs.path.join(allocator, &[_][]const u8{ base_dir, entry.name });
            errdefer allocator.free(entry_path);

            // Check for package.json
            const config_path = try std.fs.path.join(allocator, &[_][]const u8{ entry_path, "package.json" });

            const has_config = blk: {
                io_helper.accessAbsolute(config_path, .{}) catch break :blk false;
                break :blk true;
            };

            if (!has_config) {
                allocator.free(config_path);
                allocator.free(entry_path);
                continue;
            }

            // Read package name and check if private
            const content = io_helper.readFileAlloc(allocator, config_path, 10 * 1024 * 1024) catch {
                allocator.free(config_path);
                allocator.free(entry_path);
                continue;
            };
            defer allocator.free(content);

            const parsed = std.json.parseFromSlice(std.json.Value, allocator, content, .{}) catch {
                allocator.free(config_path);
                allocator.free(entry_path);
                continue;
            };
            defer parsed.deinit();

            const root = parsed.value;
            if (root != .object) {
                allocator.free(config_path);
                allocator.free(entry_path);
                continue;
            }

            // Skip private packages
            const is_private = if (root.object.get("private")) |p|
                if (p == .bool) p.bool else false
            else
                false;

            if (is_private) {
                style.print("  Skipping {s} (private)\n", .{entry.name});
                allocator.free(config_path);
                allocator.free(entry_path);
                continue;
            }

            const pkg_name = if (root.object.get("name")) |n|
                if (n == .string) n.string else entry.name
            else
                entry.name;

            const pkg_version = if (root.object.get("version")) |v|
                if (v == .string) v.string else null
            else
                null;

            try packages.append(allocator, .{
                .name = try allocator.dupe(u8, pkg_name),
                .path = entry_path,
                .config_path = config_path,
                .version = if (pkg_version) |v| try allocator.dupe(u8, v) else null,
            });
        }
    } else {
        // Treat as a direct path to a single package
        const pkg_path = try std.fs.path.join(allocator, &[_][]const u8{ cwd, clean_pattern });
        errdefer allocator.free(pkg_path);

        const config_path = try std.fs.path.join(allocator, &[_][]const u8{ pkg_path, "package.json" });

        const has_config = blk: {
            io_helper.accessAbsolute(config_path, .{}) catch break :blk false;
            break :blk true;
        };

        if (!has_config) {
            allocator.free(config_path);
            allocator.free(pkg_path);
            style.print("Warning: No package.json found at '{s}'\n", .{clean_pattern});
            return;
        }

        const pkg_name = readPackageName(allocator, config_path) catch clean_pattern;
        const pkg_version = readPackageVersion(allocator, config_path) catch null;

        try packages.append(allocator, .{
            .name = try allocator.dupe(u8, pkg_name),
            .path = pkg_path,
            .config_path = config_path,
            .version = if (pkg_version) |v| try allocator.dupe(u8, v) else null,
        });
    }
}

// ============================================================================
// Package Helpers
// ============================================================================

/// Read the "name" field from a package.json
fn readPackageName(allocator: std.mem.Allocator, config_path: []const u8) ![]const u8 {
    const content = try io_helper.readFileAlloc(allocator, config_path, 10 * 1024 * 1024);
    defer allocator.free(content);

    const parsed = try std.json.parseFromSlice(std.json.Value, allocator, content, .{});
    defer parsed.deinit();

    if (parsed.value != .object) return error.InvalidConfig;

    if (parsed.value.object.get("name")) |n| {
        if (n == .string) return try allocator.dupe(u8, n.string);
    }

    return error.MissingName;
}

/// Read the "version" field from a package.json
fn readPackageVersion(allocator: std.mem.Allocator, config_path: []const u8) ![]const u8 {
    const content = try io_helper.readFileAlloc(allocator, config_path, 10 * 1024 * 1024);
    defer allocator.free(content);

    const parsed = try std.json.parseFromSlice(std.json.Value, allocator, content, .{});
    defer parsed.deinit();

    if (parsed.value != .object) return error.InvalidConfig;

    if (parsed.value.object.get("version")) |v| {
        if (v == .string) return try allocator.dupe(u8, v.string);
    }

    return error.MissingVersion;
}

// ============================================================================
// Publishing
// ============================================================================

/// Publish a single package for a commit
fn publishCommitPackage(
    allocator: std.mem.Allocator,
    pkg: PackageInfo,
    sha: []const u8,
    repo_url: ?[]const u8,
    options: PublishCommitOptions,
    has_aws_creds: bool,
    token: ?[]const u8,
) !CommitPublishResult {
    // Read config content for tarball creation
    const config_content = try io_helper.readFileAlloc(allocator, pkg.config_path, 10 * 1024 * 1024);
    defer allocator.free(config_content);

    // Create tarball using the existing tarball creation logic
    const tarball_path = try registry_commands.createTarball(allocator, pkg.path, pkg.name, sha[0..7], config_content);
    defer allocator.free(tarball_path);
    defer io_helper.deleteFile(tarball_path) catch {};

    // Read tarball data
    const tarball_data = try io_helper.readFileAlloc(allocator, tarball_path, 100 * 1024 * 1024);
    defer allocator.free(tarball_data);

    style.print("  Tarball: {d} bytes\n", .{tarball_data.len});

    // Upload
    if (has_aws_creds) {
        return uploadCommitToS3(allocator, pkg.name, sha, tarball_data, repo_url, pkg.version, options);
    } else {
        return uploadCommitViaHttp(allocator, pkg.name, sha, tarball_data, repo_url, pkg.version, options, token orelse "");
    }
}

/// Upload commit package directly to S3
fn uploadCommitToS3(
    allocator: std.mem.Allocator,
    name: []const u8,
    sha: []const u8,
    tarball_data: []const u8,
    repo_url: ?[]const u8,
    version: ?[]const u8,
    options: PublishCommitOptions,
) !CommitPublishResult {
    const bucket = io_helper.getenv("PANTRY_S3_BUCKET") orelse "pantry-registry";
    const tmp_dir = io_helper.getTempDir();

    // Sanitize package name
    var sanitized_name = try allocator.alloc(u8, name.len);
    defer allocator.free(sanitized_name);
    for (name, 0..) |c, i| {
        sanitized_name[i] = if (c == '@' or c == '/') '-' else c;
    }
    const clean_name = if (sanitized_name[0] == '-') sanitized_name[1..] else sanitized_name;

    // S3 key: commits/{sha}/{safeName}/{safeName}.tgz
    const tarball_key = try std.fmt.allocPrint(allocator, "commits/{s}/{s}/{s}.tgz", .{ sha, clean_name, clean_name });
    defer allocator.free(tarball_key);

    const tarball_filename = try std.fmt.allocPrint(allocator, "{s}-{s}.tgz", .{ clean_name, sha[0..7] });
    defer allocator.free(tarball_filename);

    // Write tarball to temp file
    const tarball_tmp = try std.fs.path.join(allocator, &[_][]const u8{ tmp_dir, tarball_filename });
    defer allocator.free(tarball_tmp);

    const file = try io_helper.cwd().createFile(io_helper.io, tarball_tmp, .{});
    try io_helper.writeAllToFile(file, tarball_data);
    file.close(io_helper.io);
    defer io_helper.deleteFile(tarball_tmp) catch {};

    // Upload tarball to S3
    const s3_uri = try std.fmt.allocPrint(allocator, "s3://{s}/{s}", .{ bucket, tarball_key });
    defer allocator.free(s3_uri);

    const upload_result = try io_helper.childRun(allocator, &[_][]const u8{
        "aws", "s3", "cp", tarball_tmp, s3_uri, "--content-type", "application/gzip",
    });
    defer allocator.free(upload_result.stdout);
    defer allocator.free(upload_result.stderr);

    if (upload_result.term != .exited or upload_result.term.exited != 0) {
        style.print("  S3 upload failed: {s}\n", .{upload_result.stderr});
        return .{ .success = false, .url = "" };
    }

    // Update DynamoDB with commit record
    try updateCommitDynamoDB(allocator, name, clean_name, sha, tarball_key, repo_url, version);

    // Build the install URL
    const encoded_name = try allocator.dupe(u8, name);
    defer allocator.free(encoded_name);

    const install_url = try std.fmt.allocPrint(allocator, "{s}/commits/{s}/{s}/tarball", .{
        options.registry,
        sha,
        name,
    });

    return .{ .success = true, .url = install_url };
}

/// Update DynamoDB with commit publish record
fn updateCommitDynamoDB(
    allocator: std.mem.Allocator,
    name: []const u8,
    clean_name: []const u8,
    sha: []const u8,
    s3_path: []const u8,
    repo_url: ?[]const u8,
    version: ?[]const u8,
) !void {
    const table_name = io_helper.getenv("PANTRY_DYNAMODB_TABLE") orelse "pantry-packages";

    // Get timestamp
    var timestamp_buf: [24]u8 = undefined;
    const timestamp: []const u8 = blk: {
        const ts = io_helper.clockGettime();
        const epoch_secs: std.time.epoch.EpochSeconds = .{ .secs = @intCast(ts.sec) };
        const epoch_day = epoch_secs.getEpochDay();
        const year_day = epoch_day.calculateYearDay();
        const month_day = year_day.calculateMonthDay();
        const day_secs = epoch_secs.getDaySeconds();
        break :blk std.fmt.bufPrint(&timestamp_buf, "{d:0>4}-{d:0>2}-{d:0>2}T{d:0>2}:{d:0>2}:{d:0>2}Z", .{
            year_day.year,
            @intFromEnum(month_day.month),
            month_day.day_index + 1,
            day_secs.getHoursIntoDay(),
            day_secs.getMinutesIntoHour(),
            day_secs.getSecondsIntoMinute(),
        }) catch "1970-01-01T00:00:00Z";
    };

    const repo = repo_url orelse "";
    const ver = version orelse "";

    // Primary record: COMMIT#{sha} / PACKAGE#{name}
    const item_json = try std.fmt.allocPrint(allocator,
        \\{{
        \\  "PK": {{"S": "COMMIT#{s}"}},
        \\  "SK": {{"S": "PACKAGE#{s}"}},
        \\  "name": {{"S": "{s}"}},
        \\  "sha": {{"S": "{s}"}},
        \\  "safeName": {{"S": "{s}"}},
        \\  "s3Path": {{"S": "{s}"}},
        \\  "repository": {{"S": "{s}"}},
        \\  "version": {{"S": "{s}"}},
        \\  "publishedAt": {{"S": "{s}"}}
        \\}}
    , .{ sha, name, name, sha, clean_name, s3_path, repo, ver, timestamp });
    defer allocator.free(item_json);

    const result = try io_helper.childRun(allocator, &[_][]const u8{
        "aws", "dynamodb", "put-item", "--table-name", table_name, "--item", item_json,
    });
    defer allocator.free(result.stdout);
    defer allocator.free(result.stderr);

    if (result.term != .exited or result.term.exited != 0) {
        style.print("  Warning: DynamoDB update failed: {s}\n", .{result.stderr});
    }

    // Reverse lookup record: COMMIT_PACKAGE#{name} / SHA#{sha}
    const reverse_json = try std.fmt.allocPrint(allocator,
        \\{{
        \\  "PK": {{"S": "COMMIT_PACKAGE#{s}"}},
        \\  "SK": {{"S": "SHA#{s}"}},
        \\  "name": {{"S": "{s}"}},
        \\  "sha": {{"S": "{s}"}},
        \\  "repository": {{"S": "{s}"}},
        \\  "publishedAt": {{"S": "{s}"}}
        \\}}
    , .{ name, sha, name, sha, repo, timestamp });
    defer allocator.free(reverse_json);

    const reverse_result = try io_helper.childRun(allocator, &[_][]const u8{
        "aws", "dynamodb", "put-item", "--table-name", table_name, "--item", reverse_json,
    });
    defer allocator.free(reverse_result.stdout);
    defer allocator.free(reverse_result.stderr);

    // Don't fail on reverse lookup write failure
    if (reverse_result.term != .exited or reverse_result.term.exited != 0) {
        style.print("  Warning: DynamoDB reverse index failed\n", .{});
    }
}

/// Upload commit package via HTTP to registry server
fn uploadCommitViaHttp(
    allocator: std.mem.Allocator,
    name: []const u8,
    sha: []const u8,
    tarball_data: []const u8,
    repo_url: ?[]const u8,
    version: ?[]const u8,
    options: PublishCommitOptions,
    token: []const u8,
) !CommitPublishResult {
    const boundary = "----PantryCommitUpload7MA4YWxkTrZu0gW";

    // Build metadata JSON
    const repo = repo_url orelse "";
    const ver = version orelse "";
    const metadata_json = try std.fmt.allocPrint(allocator,
        \\{{"sha":"{s}","repository":"{s}","packages":[{{"name":"{s}","version":"{s}"}}]}}
    , .{ sha, repo, name, ver });
    defer allocator.free(metadata_json);

    // Build the tarball field name: package:{name}
    const field_name = try std.fmt.allocPrint(allocator, "package:{s}", .{name});
    defer allocator.free(field_name);

    // Build multipart body
    const part1_header_str = try std.fmt.allocPrint(allocator, "--{s}\r\nContent-Disposition: form-data; name=\"metadata\"\r\nContent-Type: text/plain\r\n\r\n", .{boundary});
    defer allocator.free(part1_header_str);

    const part2_header_str = try std.fmt.allocPrint(allocator, "\r\n--{s}\r\nContent-Disposition: form-data; name=\"{s}\"; filename=\"package.tgz\"\r\nContent-Type: application/octet-stream\r\n\r\n", .{ boundary, field_name });
    defer allocator.free(part2_header_str);

    const closing_str = try std.fmt.allocPrint(allocator, "\r\n--{s}--\r\n", .{boundary});
    defer allocator.free(closing_str);

    const body_len = part1_header_str.len + metadata_json.len + part2_header_str.len + tarball_data.len + closing_str.len;

    const body = try allocator.alloc(u8, body_len);
    defer allocator.free(body);
    var offset: usize = 0;
    @memcpy(body[offset..][0..part1_header_str.len], part1_header_str);
    offset += part1_header_str.len;
    @memcpy(body[offset..][0..metadata_json.len], metadata_json);
    offset += metadata_json.len;
    @memcpy(body[offset..][0..part2_header_str.len], part2_header_str);
    offset += part2_header_str.len;
    @memcpy(body[offset..][0..tarball_data.len], tarball_data);
    offset += tarball_data.len;
    @memcpy(body[offset..][0..closing_str.len], closing_str);

    // Build URL
    const publish_url = try std.fmt.allocPrint(allocator, "{s}/publish/commit", .{options.registry});
    defer allocator.free(publish_url);

    const auth_value = try std.fmt.allocPrint(allocator, "Bearer {s}", .{token});
    defer allocator.free(auth_value);

    const content_type = try std.fmt.allocPrint(allocator, "multipart/form-data; boundary={s}", .{boundary});
    defer allocator.free(content_type);

    // HTTP POST
    var client: std.http.Client = .{
        .allocator = allocator,
        .io = io_helper.io,
    };
    defer client.deinit();

    var alloc_writer = std.Io.Writer.Allocating.init(allocator);
    errdefer alloc_writer.deinit();

    var redirect_buf: [8192]u8 = undefined;

    const result = client.fetch(.{
        .location = .{ .url = publish_url },
        .method = .POST,
        .payload = body,
        .response_writer = &alloc_writer.writer,
        .redirect_buffer = &redirect_buf,
        .redirect_behavior = @enumFromInt(5),
        .headers = .{
            .content_type = .{ .override = content_type },
            .authorization = .{ .override = auth_value },
        },
    }) catch {
        alloc_writer.deinit();
        return .{ .success = false, .url = "" };
    };

    const resp_data = alloc_writer.writer.buffer[0..alloc_writer.writer.end];

    if (result.status != .ok and result.status != .created) {
        if (resp_data.len > 0) {
            style.print("  Upload error: {s}\n", .{resp_data});
        }
        alloc_writer.deinit();
        return .{ .success = false, .url = "" };
    }

    alloc_writer.deinit();

    const install_url = try std.fmt.allocPrint(allocator, "{s}/commits/{s}/{s}/tarball", .{
        options.registry,
        sha,
        name,
    });

    return .{ .success = true, .url = install_url };
}

/// Check if ~/.aws/credentials file exists
fn awsCredentialsFileExists() bool {
    const home = io_helper.getenv("HOME") orelse return false;
    var path_buf: [std.fs.max_path_bytes]u8 = undefined;
    const creds_path = std.fmt.bufPrint(&path_buf, "{s}/.aws/credentials", .{home}) catch return false;
    io_helper.accessAbsolute(creds_path, .{}) catch return false;
    return true;
}
