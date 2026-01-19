//! Package Registry Commands
//!
//! Commands for discovering and querying packages in the registry:
//! - search: Find packages by keyword
//! - info: Show detailed package information
//! - list: List installed packages
//! - publish: Publish a package to the Pantry registry

const std = @import("std");
const io_helper = @import("../../io_helper.zig");
const lib = @import("../../lib.zig");
const common = @import("common.zig");
const http = std.http;

const CommandResult = common.CommandResult;
const cache = lib.cache;
const install = lib.install;

/// Default Pantry registry URL
const PANTRY_REGISTRY_URL = "https://registry.stacksjs.org";

/// Search for packages in the registry
pub fn searchCommand(allocator: std.mem.Allocator, args: []const []const u8) !CommandResult {
    if (args.len == 0) {
        return CommandResult.err(allocator, "Error: No search term specified");
    }

    const packages = @import("../../packages/generated.zig");
    const search_term = args[0];

    std.debug.print("Searching for '{s}'...\n\n", .{search_term});

    var found: usize = 0;
    for (packages.packages) |pkg| {
        if (std.ascii.indexOfIgnoreCase(pkg.domain, search_term) != null or
            std.ascii.indexOfIgnoreCase(pkg.name, search_term) != null or
            std.ascii.indexOfIgnoreCase(pkg.description, search_term) != null)
        {
            std.debug.print("  {s}\n", .{pkg.name});
            std.debug.print("    Domain: {s}\n", .{pkg.domain});
            std.debug.print("    {s}\n\n", .{pkg.description});
            found += 1;
        }
    }

    if (found == 0) {
        std.debug.print("No packages found.\n", .{});
    } else {
        std.debug.print("Found {d} package(s)\n", .{found});
    }

    return .{ .exit_code = 0 };
}

/// Show detailed information about a package
pub fn infoCommand(allocator: std.mem.Allocator, args: []const []const u8) !CommandResult {
    if (args.len == 0) {
        return CommandResult.err(allocator, "Error: No package specified");
    }

    const packages = @import("../../packages/generated.zig");
    const pkg_name = args[0];

    const pkg = packages.getPackageByName(pkg_name);

    if (pkg == null) {
        const msg = try std.fmt.allocPrint(
            allocator,
            "Package '{s}' not found",
            .{pkg_name},
        );
        return .{
            .exit_code = 1,
            .message = msg,
        };
    }

    std.debug.print("\n{s}\n", .{pkg.?.name});
    std.debug.print("  Domain: {s}\n", .{pkg.?.domain});
    std.debug.print("  Description: {s}\n", .{pkg.?.description});

    if (pkg.?.homepage_url) |url| {
        std.debug.print("  Homepage: {s}\n", .{url});
    }

    if (pkg.?.programs.len > 0) {
        std.debug.print("  Programs:\n", .{});
        for (pkg.?.programs) |program| {
            std.debug.print("    - {s}\n", .{program});
        }
    }

    if (pkg.?.dependencies.len > 0) {
        std.debug.print("  Dependencies:\n", .{});
        for (pkg.?.dependencies) |dep| {
            std.debug.print("    - {s}\n", .{dep});
        }
    }

    if (pkg.?.build_dependencies.len > 0) {
        std.debug.print("  Build Dependencies:\n", .{});
        for (pkg.?.build_dependencies) |dep| {
            std.debug.print("    - {s}\n", .{dep});
        }
    }

    if (pkg.?.aliases.len > 0) {
        std.debug.print("  Aliases:\n", .{});
        for (pkg.?.aliases) |alias| {
            std.debug.print("    - {s}\n", .{alias});
        }
    }

    std.debug.print("\n", .{});

    return .{ .exit_code = 0 };
}

/// List all installed packages
pub fn listCommand(allocator: std.mem.Allocator, _: []const []const u8) !CommandResult {
    var pkg_cache = try cache.PackageCache.init(allocator);
    defer pkg_cache.deinit();

    var installer = try install.Installer.init(allocator, &pkg_cache);
    defer installer.deinit();

    std.debug.print("Installed packages:\n\n", .{});

    var installed = try installer.listInstalled();
    defer {
        for (installed.items) |*pkg| {
            pkg.deinit(allocator);
        }
        installed.deinit(allocator);
    }

    for (installed.items) |pkg| {
        std.debug.print("  {s}@{s}\n", .{ pkg.name, pkg.version });
    }

    std.debug.print("\n{d} package(s) installed\n", .{installed.items.len});

    return .{ .exit_code = 0 };
}

/// Display the currently authenticated user
pub fn whoamiCommand(allocator: std.mem.Allocator, _: []const []const u8) !CommandResult {
    // Try to get user from Pantry config
    const home = std.process.getEnvVarOwned(allocator, "HOME") catch {
        return CommandResult.err(allocator, "Error: Could not determine home directory");
    };
    defer allocator.free(home);

    const pantryrc_path = try std.fs.path.join(allocator, &[_][]const u8{ home, ".pantryrc" });
    defer allocator.free(pantryrc_path);

    var username: ?[]const u8 = null;
    defer if (username) |u| allocator.free(u);

    // Try to read .pantryrc to find username
    const file = io_helper.openFileAbsolute(pantryrc_path, .{}) catch |err| {
        if (err == error.FileNotFound) {
            std.debug.print("Not logged in (no .pantryrc found)\n", .{});
            std.debug.print("\nTo authenticate:\n", .{});
            std.debug.print("  1. Get an authentication token from the Pantry registry\n", .{});
            std.debug.print("  2. Add it to ~/.pantry/credentials as: PANTRY_TOKEN=your_token\n", .{});
            std.debug.print("\nOr use OIDC for tokenless publishing from CI/CD:\n", .{});
            std.debug.print("  pantry publisher add --help\n", .{});
            return .{ .exit_code = 1 };
        }
        return err;
    };
    defer file.close(io_helper.io);

    const content = try io_helper.readFileAlloc(allocator, pantryrc_path, 1024 * 1024);
    defer allocator.free(content);

    // Parse .pantryrc for username or email
    var lines = std.mem.splitScalar(u8, content, '\n');
    var found_auth = false;
    while (lines.next()) |line| {
        const trimmed = std.mem.trim(u8, line, " \t\r");
        if (trimmed.len == 0 or trimmed[0] == '#') continue;

        // Look for username or email
        if (std.mem.indexOf(u8, trimmed, "username=")) |idx| {
            const value_start = idx + "username=".len;
            username = try allocator.dupe(u8, std.mem.trim(u8, trimmed[value_start..], " \t\"'"));
            break;
        } else if (std.mem.indexOf(u8, trimmed, "email=")) |idx| {
            const value_start = idx + "email=".len;
            username = try allocator.dupe(u8, std.mem.trim(u8, trimmed[value_start..], " \t\"'"));
            break;
        } else if (std.mem.indexOf(u8, trimmed, "_authToken=")) |_| {
            found_auth = true;
        }
    }

    if (username) |u| {
        std.debug.print("{s}\n", .{u});
        return .{ .exit_code = 0 };
    } else if (found_auth) {
        std.debug.print("Authenticated (token found in .pantryrc)\n", .{});
        std.debug.print("Note: Username not configured. Add 'username=YOUR_USERNAME' to ~/.pantryrc\n", .{});
        return .{ .exit_code = 0 };
    } else {
        std.debug.print("Not logged in\n", .{});
        std.debug.print("\nTo authenticate:\n", .{});
        std.debug.print("  1. Get an authentication token from the Pantry registry\n", .{});
        std.debug.print("  2. Add it to ~/.pantry/credentials as: PANTRY_TOKEN=your_token\n", .{});
        std.debug.print("  3. Optionally add: username=YOUR_USERNAME\n", .{});
        std.debug.print("\nOr use OIDC for tokenless publishing from CI/CD:\n", .{});
        std.debug.print("  pantry publisher add --help\n", .{});
        return .{ .exit_code = 1 };
    }
}

// ============================================================================
// Registry Publish Command
// ============================================================================

pub const RegistryPublishOptions = struct {
    registry: []const u8 = PANTRY_REGISTRY_URL,
    token: ?[]const u8 = null,
    access: []const u8 = "public",
    tag: []const u8 = "latest",
    dry_run: bool = false,
};

/// Publish a package to the Pantry registry
/// This uploads the tarball directly to S3 via the registry API
pub fn registryPublishCommand(allocator: std.mem.Allocator, args: []const []const u8, options: RegistryPublishOptions) !CommandResult {
    _ = args;

    // Get current working directory
    const cwd = io_helper.realpathAlloc(allocator, ".") catch {
        return CommandResult.err(allocator, "Error: Could not determine current directory");
    };
    defer allocator.free(cwd);

    // Find config file (pantry.json or package.json)
    const config_path = common.findConfigFile(allocator, cwd) catch {
        return CommandResult.err(allocator, "Error: No package configuration found (pantry.json, package.json)");
    };
    defer allocator.free(config_path);

    std.debug.print("Publishing to Pantry registry...\n", .{});
    std.debug.print("Config: {s}\n", .{config_path});

    // Read and parse config
    const config_content = io_helper.readFileAlloc(allocator, config_path, 10 * 1024 * 1024) catch {
        return CommandResult.err(allocator, "Error: Could not read config file");
    };
    defer allocator.free(config_content);

    const parsed = std.json.parseFromSlice(std.json.Value, allocator, config_content, .{}) catch {
        return CommandResult.err(allocator, "Error: Could not parse config file");
    };
    defer parsed.deinit();

    const root = parsed.value;
    if (root != .object) {
        return CommandResult.err(allocator, "Error: Config file is not a valid JSON object");
    }

    // Extract package name and version
    const name = if (root.object.get("name")) |n|
        if (n == .string) n.string else return CommandResult.err(allocator, "Error: Missing or invalid 'name' in config")
    else
        return CommandResult.err(allocator, "Error: Missing 'name' in config");

    const version = if (root.object.get("version")) |v|
        if (v == .string) v.string else return CommandResult.err(allocator, "Error: Missing or invalid 'version' in config")
    else
        return CommandResult.err(allocator, "Error: Missing 'version' in config");

    std.debug.print("Package: {s}@{s}\n", .{ name, version });
    std.debug.print("Registry: {s}\n", .{options.registry});

    // Check if we have AWS credentials for direct S3 upload
    const aws_key = std.posix.getenv("AWS_ACCESS_KEY_ID");
    const has_aws_creds = aws_key != null or awsCredentialsFileExists();

    // Get auth token (from options, env, or ~/.pantry/credentials)
    // Token is optional if we have AWS credentials for direct S3 upload
    var token: ?[]const u8 = options.token;
    var token_owned = false;
    if (token == null) {
        token = std.process.getEnvVarOwned(allocator, "PANTRY_REGISTRY_TOKEN") catch null;
        if (token != null) token_owned = true;
    }
    if (token == null) {
        token = readPantryToken(allocator) catch null;
        if (token != null) token_owned = true;
    }
    defer if (token_owned and token != null) allocator.free(token.?);

    // If no AWS credentials and no token, error out
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

    if (has_aws_creds) {
        std.debug.print("Using direct S3 upload (AWS credentials found)\n", .{});
    }

    if (options.dry_run) {
        std.debug.print("\n[DRY RUN] Would publish {s}@{s} to {s}\n", .{ name, version, options.registry });
        return .{ .exit_code = 0 };
    }

    // Create tarball
    std.debug.print("Creating tarball...\n", .{});
    const tarball_path = try createTarball(allocator, cwd, name, version);
    defer allocator.free(tarball_path);
    defer io_helper.deleteFile(tarball_path) catch {};

    // Read tarball
    const tarball_data = io_helper.readFileAlloc(allocator, tarball_path, 100 * 1024 * 1024) catch {
        return CommandResult.err(allocator, "Error: Could not read tarball");
    };
    defer allocator.free(tarball_data);

    std.debug.print("Tarball size: {d} bytes\n", .{tarball_data.len});

    // Upload to registry
    std.debug.print("Uploading to registry...\n", .{});

    const result = uploadToRegistry(allocator, options.registry, name, version, tarball_data, token orelse "", config_content) catch |err| {
        const err_msg = try std.fmt.allocPrint(allocator, "Error: Failed to upload to registry: {any}", .{err});
        return CommandResult.err(allocator, err_msg);
    };
    defer allocator.free(result);

    std.debug.print("\n{s}\n", .{result});
    std.debug.print("Published {s}@{s} to Pantry registry\n", .{ name, version });

    return .{ .exit_code = 0 };
}

/// Read PANTRY_TOKEN from ~/.pantry/credentials
fn readPantryToken(allocator: std.mem.Allocator) ![]u8 {
    const home = std.posix.getenv("HOME") orelse return error.EnvironmentVariableNotFound;

    var path_buf: [std.fs.max_path_bytes]u8 = undefined;
    const credentials_path = try std.fmt.bufPrint(&path_buf, "{s}/.pantry/credentials", .{home});

    const content = io_helper.readFileAlloc(allocator, credentials_path, 64 * 1024) catch {
        return error.FileNotFound;
    };
    defer allocator.free(content);

    // Parse key=value pairs
    var lines = std.mem.splitSequence(u8, content, "\n");
    while (lines.next()) |line| {
        const trimmed = std.mem.trim(u8, line, &std.ascii.whitespace);
        if (trimmed.len == 0 or trimmed[0] == '#') continue;

        if (std.mem.indexOfScalar(u8, trimmed, '=')) |eq_pos| {
            const key = std.mem.trim(u8, trimmed[0..eq_pos], &std.ascii.whitespace);
            const value = std.mem.trim(u8, trimmed[eq_pos + 1 ..], &std.ascii.whitespace);

            if (std.mem.eql(u8, key, "PANTRY_TOKEN") or std.mem.eql(u8, key, "PANTRY_REGISTRY_TOKEN")) {
                return try allocator.dupe(u8, value);
            }
        }
    }

    return error.EnvironmentVariableNotFound;
}

/// Create tarball of the current project
fn createTarball(
    allocator: std.mem.Allocator,
    package_dir: []const u8,
    package_name: []const u8,
    version: []const u8,
) ![]const u8 {
    // Sanitize package name for tarball filename
    var sanitized_name = try allocator.alloc(u8, package_name.len);
    defer allocator.free(sanitized_name);
    for (package_name, 0..) |c, i| {
        sanitized_name[i] = if (c == '@' or c == '/') '-' else c;
    }
    const clean_name = if (sanitized_name[0] == '-') sanitized_name[1..] else sanitized_name;

    const tarball_name = try std.fmt.allocPrint(allocator, "{s}-{s}.tgz", .{ clean_name, version });
    defer allocator.free(tarball_name);

    // Create tarball in temp directory
    const tmp_dir = std.posix.getenv("TMPDIR") orelse std.posix.getenv("TMP") orelse "/tmp";
    const tarball_path = try std.fs.path.join(allocator, &[_][]const u8{ tmp_dir, tarball_name });

    // Create staging directory: /tmp/pantry-staging/package/
    const staging_base = try std.fs.path.join(allocator, &[_][]const u8{ tmp_dir, "pantry-staging" });
    defer allocator.free(staging_base);
    const staging_pkg = try std.fs.path.join(allocator, &[_][]const u8{ staging_base, "package" });
    defer allocator.free(staging_pkg);

    // Clean and create staging directory
    _ = io_helper.childRun(allocator, &[_][]const u8{ "rm", "-rf", staging_base }) catch {};
    const mkdir_result = try io_helper.childRun(allocator, &[_][]const u8{ "mkdir", "-p", staging_pkg });
    defer allocator.free(mkdir_result.stdout);
    defer allocator.free(mkdir_result.stderr);

    // Copy files to staging (excluding common non-publishable files)
    const src_path = try std.fmt.allocPrint(allocator, "{s}/", .{package_dir});
    defer allocator.free(src_path);
    const dst_path = try std.fmt.allocPrint(allocator, "{s}/", .{staging_pkg});
    defer allocator.free(dst_path);

    const cp_result = try io_helper.childRun(allocator, &[_][]const u8{
        "rsync",
        "-a",
        "--exclude=node_modules",
        "--exclude=pantry",
        "--exclude=.git",
        "--exclude=*.tgz",
        "--exclude=.github",
        "--exclude=.claude",
        "--exclude=zig-out",
        "--exclude=zig-cache",
        "--exclude=dist",
        src_path,
        dst_path,
    });
    defer allocator.free(cp_result.stdout);
    defer allocator.free(cp_result.stderr);

    if (cp_result.term != .Exited or cp_result.term.Exited != 0) {
        std.debug.print("rsync failed: {s}\n", .{cp_result.stderr});
        return error.TarballCreationFailed;
    }

    // Create tarball with "package" directory at root
    const tar_result = try io_helper.childRun(allocator, &[_][]const u8{
        "tar",
        "-czf",
        tarball_path,
        "-C",
        staging_base,
        "package",
    });
    defer allocator.free(tar_result.stdout);
    defer allocator.free(tar_result.stderr);

    // Cleanup staging
    _ = io_helper.childRun(allocator, &[_][]const u8{ "rm", "-rf", staging_base }) catch {};

    if (tar_result.term != .Exited or tar_result.term.Exited != 0) {
        std.debug.print("tar failed: {s}\n", .{tar_result.stderr});
        return error.TarballCreationFailed;
    }

    return tarball_path;
}

/// Upload tarball to Pantry registry - direct S3 upload or via HTTP
fn uploadToRegistry(
    allocator: std.mem.Allocator,
    registry_url: []const u8,
    name: []const u8,
    version: []const u8,
    tarball_data: []const u8,
    token: []const u8,
    metadata_json: []const u8,
) ![]const u8 {
    // Check if we should use direct S3 upload (AWS credentials available)
    const aws_key = std.posix.getenv("AWS_ACCESS_KEY_ID");
    const has_aws_creds = aws_key != null or awsCredentialsFileExists();

    if (has_aws_creds) {
        return uploadToS3Direct(allocator, name, version, tarball_data, metadata_json);
    }

    // Fall back to HTTP upload via registry server
    return uploadViaHttp(allocator, registry_url, tarball_data, token, metadata_json);
}

/// Check if ~/.aws/credentials file exists
fn awsCredentialsFileExists() bool {
    const home = std.posix.getenv("HOME") orelse return false;
    var path_buf: [std.fs.max_path_bytes]u8 = undefined;
    const creds_path = std.fmt.bufPrint(&path_buf, "{s}/.aws/credentials", .{home}) catch return false;
    io_helper.accessAbsolute(creds_path, .{}) catch return false;
    return true;
}

/// Upload directly to S3 using AWS CLI
fn uploadToS3Direct(
    allocator: std.mem.Allocator,
    name: []const u8,
    version: []const u8,
    tarball_data: []const u8,
    metadata_json: []const u8,
) ![]const u8 {
    const bucket = "pantry-registry";
    const tmp_dir = std.posix.getenv("TMPDIR") orelse std.posix.getenv("TMP") orelse "/tmp";

    // Sanitize package name for S3 key
    var sanitized_name = try allocator.alloc(u8, name.len);
    defer allocator.free(sanitized_name);
    for (name, 0..) |c, i| {
        sanitized_name[i] = if (c == '@' or c == '/') '-' else c;
    }
    const clean_name = if (sanitized_name[0] == '-') sanitized_name[1..] else sanitized_name;

    // Build tarball filename and S3 key
    const tarball_filename = try std.fmt.allocPrint(allocator, "{s}-{s}.tgz", .{ clean_name, version });
    defer allocator.free(tarball_filename);

    const tarball_key = try std.fmt.allocPrint(allocator, "packages/{s}/{s}/{s}", .{ clean_name, version, tarball_filename });
    defer allocator.free(tarball_key);

    const metadata_key = try std.fmt.allocPrint(allocator, "packages/{s}/metadata.json", .{clean_name});
    defer allocator.free(metadata_key);

    // Write tarball to temp file
    const tarball_tmp = try std.fs.path.join(allocator, &[_][]const u8{ tmp_dir, tarball_filename });
    defer allocator.free(tarball_tmp);

    const file = try io_helper.cwd().createFile(io_helper.io, tarball_tmp, .{});
    try io_helper.writeAllToFile(file, tarball_data);
    file.close(io_helper.io);
    defer io_helper.deleteFile(tarball_tmp) catch {};

    // Write metadata to temp file
    const metadata_tmp = try std.fs.path.join(allocator, &[_][]const u8{ tmp_dir, "metadata.json" });
    defer allocator.free(metadata_tmp);

    const meta_file = try io_helper.cwd().createFile(io_helper.io, metadata_tmp, .{});
    try io_helper.writeAllToFile(meta_file, metadata_json);
    meta_file.close(io_helper.io);
    defer io_helper.deleteFile(metadata_tmp) catch {};

    // Upload tarball to S3
    const s3_tarball_uri = try std.fmt.allocPrint(allocator, "s3://{s}/{s}", .{ bucket, tarball_key });
    defer allocator.free(s3_tarball_uri);

    std.debug.print("  Uploading tarball to S3...\n", .{});
    const tarball_result = try io_helper.childRun(allocator, &[_][]const u8{
        "aws",
        "s3",
        "cp",
        tarball_tmp,
        s3_tarball_uri,
        "--content-type",
        "application/gzip",
    });
    defer allocator.free(tarball_result.stdout);
    defer allocator.free(tarball_result.stderr);

    if (tarball_result.term != .Exited or tarball_result.term.Exited != 0) {
        std.debug.print("S3 upload failed: {s}\n", .{tarball_result.stderr});
        return error.UploadFailed;
    }

    // Upload metadata to S3
    const s3_metadata_uri = try std.fmt.allocPrint(allocator, "s3://{s}/{s}", .{ bucket, metadata_key });
    defer allocator.free(s3_metadata_uri);

    std.debug.print("  Uploading metadata to S3...\n", .{});
    const metadata_result = try io_helper.childRun(allocator, &[_][]const u8{
        "aws",
        "s3",
        "cp",
        metadata_tmp,
        s3_metadata_uri,
        "--content-type",
        "application/json",
    });
    defer allocator.free(metadata_result.stdout);
    defer allocator.free(metadata_result.stderr);

    if (metadata_result.term != .Exited or metadata_result.term.Exited != 0) {
        std.debug.print("S3 metadata upload failed: {s}\n", .{metadata_result.stderr});
        return error.UploadFailed;
    }

    const success_msg = try std.fmt.allocPrint(allocator, "Published to s3://{s}/{s}", .{ bucket, tarball_key });
    return success_msg;
}

/// Upload via HTTP to registry server
fn uploadViaHttp(
    allocator: std.mem.Allocator,
    registry_url: []const u8,
    tarball_data: []const u8,
    token: []const u8,
    metadata_json: []const u8,
) ![]const u8 {
    // Write tarball to temp file for curl to read
    const tmp_dir = std.posix.getenv("TMPDIR") orelse std.posix.getenv("TMP") orelse "/tmp";
    const tarball_tmp = try std.fs.path.join(allocator, &[_][]const u8{ tmp_dir, "pantry-upload.tgz" });
    defer allocator.free(tarball_tmp);

    // Write tarball data to temp file using io_helper pattern
    const file = try io_helper.cwd().createFile(io_helper.io, tarball_tmp, .{});
    try io_helper.writeAllToFile(file, tarball_data);
    file.close(io_helper.io);

    // Build URL
    const publish_url = try std.fmt.allocPrint(allocator, "{s}/publish", .{registry_url});
    defer allocator.free(publish_url);

    // Build auth header
    const auth_header = try std.fmt.allocPrint(allocator, "Authorization: Bearer {s}", .{token});
    defer allocator.free(auth_header);

    // Build tarball form field with @file syntax
    const tarball_field = try std.fmt.allocPrint(allocator, "tarball=@{s}", .{tarball_tmp});
    defer allocator.free(tarball_field);

    // Build metadata form field
    const metadata_field = try std.fmt.allocPrint(allocator, "metadata={s}", .{metadata_json});
    defer allocator.free(metadata_field);

    // Use curl with -F for multipart form data (handles binary properly)
    const curl_result = try io_helper.childRun(allocator, &[_][]const u8{
        "curl",
        "-s",
        "-X",
        "POST",
        publish_url,
        "-H",
        auth_header,
        "-F",
        tarball_field,
        "-F",
        metadata_field,
    });
    defer allocator.free(curl_result.stderr);

    // Clean up temp file
    io_helper.deleteFile(tarball_tmp) catch {};

    if (curl_result.term != .Exited or curl_result.term.Exited != 0) {
        std.debug.print("curl error: {s}\n", .{curl_result.stderr});
        allocator.free(curl_result.stdout);
        return error.UploadFailed;
    }

    return curl_result.stdout;
}
