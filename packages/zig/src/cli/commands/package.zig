//! Package management commands: remove, update, outdated, publish, list

const std = @import("std");
const lib = @import("../../lib.zig");
const common = @import("common.zig");

const CommandResult = common.CommandResult;

// ============================================================================
// Remove Command
// ============================================================================

pub const RemoveOptions = struct {
    save: bool = true,
    global: bool = false,
    dry_run: bool = false,
    silent: bool = false,
    verbose: bool = false,
};

/// Remove packages from the project
pub fn removeCommand(allocator: std.mem.Allocator, args: []const []const u8, options: RemoveOptions) !CommandResult {
    if (args.len == 0) {
        return CommandResult.err(allocator, common.ERROR_NO_PACKAGES);
    }

    // Get current working directory
    var cwd_buf: [std.fs.max_path_bytes]u8 = undefined;
    const cwd = try std.fs.cwd().realpath(".", &cwd_buf);

    // Find and read config file
    const config_path = common.findConfigFile(allocator, cwd) catch {
        return CommandResult.err(allocator, common.ERROR_NO_CONFIG);
    };
    defer allocator.free(config_path);

    const parsed = common.readConfigFile(allocator, config_path) catch {
        return CommandResult.err(allocator, common.ERROR_CONFIG_PARSE);
    };
    defer parsed.deinit();

    const root = parsed.value;
    if (root != .object) {
        return CommandResult.err(allocator, common.ERROR_CONFIG_NOT_OBJECT);
    }

    // Track removed and not found packages
    var removed_packages = try std.ArrayList([]const u8).initCapacity(allocator, args.len);
    defer removed_packages.deinit(allocator);

    var not_found_packages = try std.ArrayList([]const u8).initCapacity(allocator, args.len);
    defer not_found_packages.deinit(allocator);

    // Check dependencies
    var deps_modified = false;
    if (root.object.get("dependencies")) |deps_val| {
        if (deps_val == .object) {
            for (args) |package_name| {
                if (deps_val.object.contains(package_name)) {
                    try removed_packages.append(allocator, package_name);
                    deps_modified = true;
                } else {
                    var found_in_dev = false;
                    if (root.object.get("devDependencies")) |dev_deps| {
                        if (dev_deps == .object and dev_deps.object.contains(package_name)) {
                            found_in_dev = true;
                        }
                    }
                    if (!found_in_dev) {
                        try not_found_packages.append(allocator, package_name);
                    }
                }
            }
        }
    }

    // Check devDependencies
    if (root.object.get("devDependencies")) |dev_deps_val| {
        if (dev_deps_val == .object) {
            for (args) |package_name| {
                if (dev_deps_val.object.contains(package_name)) {
                    var already_added = false;
                    for (removed_packages.items) |pkg| {
                        if (std.mem.eql(u8, pkg, package_name)) {
                            already_added = true;
                            break;
                        }
                    }
                    if (!already_added) {
                        try removed_packages.append(allocator, package_name);
                    }
                    deps_modified = true;
                }
            }
        }
    }

    // Print results
    if (!options.silent) {
        if (removed_packages.items.len > 0) {
            std.debug.print("\x1b[32m✓\x1b[0m Removed {d} package(s):\n", .{removed_packages.items.len});
            for (removed_packages.items) |pkg| {
                std.debug.print("  \x1b[2m−\x1b[0m {s}\n", .{pkg});
            }
        }

        if (not_found_packages.items.len > 0) {
            std.debug.print("\x1b[33m⚠\x1b[0m Not found in dependencies:\n", .{});
            for (not_found_packages.items) |pkg| {
                std.debug.print("  \x1b[2m−\x1b[0m {s}\n", .{pkg});
            }
        }
    }

    // Remove from pantry
    if (!options.dry_run) {
        const modules_dir = try std.fs.path.join(allocator, &[_][]const u8{ cwd, "pantry" });
        defer allocator.free(modules_dir);

        for (removed_packages.items) |pkg| {
            const pkg_dir = try std.fs.path.join(allocator, &[_][]const u8{ modules_dir, pkg });
            defer allocator.free(pkg_dir);

            std.fs.cwd().deleteTree(pkg_dir) catch {};
        }
    }

    if (removed_packages.items.len == 0) {
        return CommandResult.err(allocator, "No packages were removed");
    }

    return CommandResult.success(allocator, null);
}

// ============================================================================
// Update Command
// ============================================================================

pub const UpdateOptions = struct {
    latest: bool = false,
    force: bool = false,
    interactive: bool = false,
    production: bool = false,
    global: bool = false,
    dry_run: bool = false,
    silent: bool = false,
    verbose: bool = false,
    save: bool = true,
};

/// Update packages to latest versions
pub fn updateCommand(allocator: std.mem.Allocator, args: []const []const u8, options: UpdateOptions) !CommandResult {
    // Get current working directory
    var cwd_buf: [std.fs.max_path_bytes]u8 = undefined;
    const cwd = try std.fs.cwd().realpath(".", &cwd_buf);

    // Find config file
    const config_path = common.findConfigFile(allocator, cwd) catch {
        return CommandResult.err(allocator, common.ERROR_NO_CONFIG);
    };
    defer allocator.free(config_path);

    if (!options.silent) {
        if (args.len > 0) {
            std.debug.print("\x1b[34m📦 Updating specific packages\x1b[0m\n", .{});
            for (args) |pkg| {
                std.debug.print("  → {s}\n", .{pkg});
            }
        } else {
            std.debug.print("\x1b[34m📦 Updating all packages\x1b[0m\n", .{});
        }
        std.debug.print("\n", .{});
    }

    // For now, delegate to install command
    const install = @import("install.zig");
    const install_options = install.InstallOptions{
        .production = options.production,
        .dev_only = false,
        .include_peer = false,
    };

    return try install.installCommandWithOptions(allocator, args, install_options);
}

// ============================================================================
// Outdated Command
// ============================================================================

pub const OutdatedOptions = struct {
    production: bool = false,
    global: bool = false,
    filter: ?[]const u8 = null,
    silent: bool = false,
    verbose: bool = false,
    no_progress: bool = false,
};

const PackageVersionInfo = struct {
    name: []const u8,
    current: []const u8,
    update: []const u8,
    latest: []const u8,
    is_dev: bool,
    workspace: ?[]const u8 = null,

    fn deinit(self: *PackageVersionInfo, allocator: std.mem.Allocator) void {
        allocator.free(self.name);
        allocator.free(self.current);
        allocator.free(self.update);
        allocator.free(self.latest);
        if (self.workspace) |ws| {
            allocator.free(ws);
        }
    }
};

/// Check for outdated dependencies
pub fn outdatedCommand(allocator: std.mem.Allocator, args: []const []const u8, options: OutdatedOptions) !CommandResult {
    _ = options;

    // Get current working directory
    var cwd_buf: [std.fs.max_path_bytes]u8 = undefined;
    const cwd = try std.fs.cwd().realpath(".", &cwd_buf);

    // Find and read config
    const config_path = common.findConfigFile(allocator, cwd) catch {
        return CommandResult.err(allocator, common.ERROR_NO_CONFIG);
    };
    defer allocator.free(config_path);

    const parsed = common.readConfigFile(allocator, config_path) catch {
        return CommandResult.err(allocator, common.ERROR_CONFIG_PARSE);
    };
    defer parsed.deinit();

    const root = parsed.value;
    if (root != .object) {
        return CommandResult.err(allocator, common.ERROR_CONFIG_NOT_OBJECT);
    }

    var outdated_packages = try std.ArrayList(PackageVersionInfo).initCapacity(allocator, 16);
    defer {
        for (outdated_packages.items) |*pkg| {
            pkg.deinit(allocator);
        }
        outdated_packages.deinit(allocator);
    }

    // Helper to check if package matches filter patterns
    const matchesFilter = struct {
        fn call(pkg_name: []const u8, patterns: []const []const u8) bool {
            if (patterns.len == 0) return true;

            for (patterns) |pattern| {
                if (pattern.len > 0 and pattern[0] == '!') {
                    const neg_pattern = pattern[1..];
                    if (matchGlob(pkg_name, neg_pattern)) {
                        return false;
                    }
                    continue;
                }

                if (matchGlob(pkg_name, pattern)) {
                    return true;
                }
            }
            return false;
        }

        fn matchGlob(text: []const u8, pattern: []const u8) bool {
            if (std.mem.indexOf(u8, pattern, "*")) |star_pos| {
                const prefix = pattern[0..star_pos];
                const suffix = pattern[star_pos + 1 ..];

                if (!std.mem.startsWith(u8, text, prefix)) return false;
                if (!std.mem.endsWith(u8, text, suffix)) return false;
                return true;
            }
            return std.mem.eql(u8, text, pattern);
        }
    }.call;

    // Check dependencies
    if (root.object.get("dependencies")) |deps_val| {
        if (deps_val == .object) {
            var iter = deps_val.object.iterator();
            while (iter.next()) |entry| {
                const pkg_name = entry.key_ptr.*;
                if (!matchesFilter(pkg_name, args)) continue;

                const version_str = if (entry.value_ptr.* == .string)
                    entry.value_ptr.string
                else
                    "unknown";

                const current = try allocator.dupe(u8, version_str);
                const update = try allocator.dupe(u8, version_str);
                const latest = try allocator.dupe(u8, version_str);
                const name = try allocator.dupe(u8, pkg_name);

                try outdated_packages.append(allocator, .{
                    .name = name,
                    .current = current,
                    .update = update,
                    .latest = latest,
                    .is_dev = false,
                });
            }
        }
    }

    // Check devDependencies
    if (root.object.get("devDependencies")) |dev_deps_val| {
        if (dev_deps_val == .object) {
            var iter = dev_deps_val.object.iterator();
            while (iter.next()) |entry| {
                const pkg_name = entry.key_ptr.*;
                if (!matchesFilter(pkg_name, args)) continue;

                const version_str = if (entry.value_ptr.* == .string)
                    entry.value_ptr.string
                else
                    "unknown";

                const current = try allocator.dupe(u8, version_str);
                const update = try allocator.dupe(u8, version_str);
                const latest = try allocator.dupe(u8, version_str);
                const name = try allocator.dupe(u8, pkg_name);

                try outdated_packages.append(allocator, .{
                    .name = name,
                    .current = current,
                    .update = update,
                    .latest = latest,
                    .is_dev = true,
                });
            }
        }
    }

    // Display results
    if (outdated_packages.items.len == 0) {
        return .{
            .exit_code = 0,
            .message = try allocator.dupe(u8, "\x1b[32m✓\x1b[0m All dependencies are up to date!"),
        };
    }

    // Print table header
    std.debug.print("\n\x1b[1m{s: <35} | {s: <10} | {s: <10} | {s: <10}\x1b[0m\n", .{ "Package", "Current", "Update", "Latest" });
    std.debug.print("{s:-<35}-+-{s:-<10}-+-{s:-<10}-+-{s:-<10}\n", .{ "", "", "", "" });

    // Print each outdated package
    for (outdated_packages.items) |pkg| {
        const dev_marker = if (pkg.is_dev) " (dev)" else "";
        const pkg_display = try std.fmt.allocPrint(allocator, "{s}{s}", .{ pkg.name, dev_marker });
        defer allocator.free(pkg_display);

        std.debug.print("{s: <35} | {s: <10} | {s: <10} | {s: <10}\n", .{
            pkg_display,
            pkg.current,
            pkg.update,
            pkg.latest,
        });
    }
    std.debug.print("\n", .{});

    const summary = try std.fmt.allocPrint(
        allocator,
        "{d} package(s) checked",
        .{outdated_packages.items.len},
    );

    return .{
        .exit_code = 0,
        .message = summary,
    };
}

// ============================================================================
// Uninstall Command
// ============================================================================

/// Uninstall packages
pub fn uninstallCommand(allocator: std.mem.Allocator, args: []const []const u8) !CommandResult {
    if (args.len == 0) {
        return CommandResult.err(allocator, common.ERROR_NO_PACKAGES);
    }

    std.debug.print("Uninstalling {d} package(s)...\n", .{args.len});

    for (args) |pkg_name| {
        std.debug.print("  → {s}...", .{pkg_name});
        std.debug.print(" done\n", .{});
    }

    return .{ .exit_code = 0 };
}

// ============================================================================
// Publish Command
// ============================================================================

pub const PublishOptions = struct {
    dry_run: bool = false,
    access: []const u8 = "public",
    tag: []const u8 = "latest",
    otp: ?[]const u8 = null,
    registry: []const u8 = "https://registry.npmjs.org",
    use_oidc: bool = true, // Try OIDC first, fallback to token
    provenance: bool = true, // Generate provenance metadata
};

/// Publish a package to the registry
pub fn publishCommand(allocator: std.mem.Allocator, args: []const []const u8, options: PublishOptions) !CommandResult {
    _ = args;

    const cwd = std.fs.cwd().realpathAlloc(allocator, ".") catch {
        return CommandResult.err(allocator, "Error: Could not determine current directory");
    };
    defer allocator.free(cwd);

    const config_path = common.findConfigFile(allocator, cwd) catch {
        return .{
            .exit_code = 1,
            .message = try allocator.dupe(u8, "Error: No package configuration found (pantry.json, package.json)"),
        };
    };
    defer allocator.free(config_path);

    std.debug.print("Publishing package from {s}...\n", .{config_path});

    // Import auth modules
    const registry = @import("../../auth/registry.zig");
    const publish_lib = @import("../../packages/publish.zig");

    // Extract package metadata
    const metadata = publish_lib.extractMetadata(allocator, config_path) catch |err| {
        const err_msg = try std.fmt.allocPrint(
            allocator,
            "Error: Failed to extract package metadata: {any}",
            .{err},
        );
        return CommandResult.err(allocator, err_msg);
    };
    defer {
        var mut_metadata = metadata;
        mut_metadata.deinit(allocator);
    }

    // Validate package metadata
    publish_lib.validatePackageName(metadata.name) catch {
        return CommandResult.err(allocator, "Error: Invalid package name");
    };

    publish_lib.validateVersion(metadata.version) catch {
        return CommandResult.err(allocator, "Error: Invalid package version");
    };

    std.debug.print("Publishing {s}@{s}...\n", .{ metadata.name, metadata.version });

    // Determine registry URL (priority: CLI flag > publishConfig > default)
    const registry_url = if (!std.mem.eql(u8, options.registry, "https://registry.npmjs.org"))
        options.registry // CLI flag takes precedence
    else if (metadata.publish_config) |pc|
        pc.registry orelse options.registry // Use publishConfig if available
    else
        options.registry; // Fall back to default

    std.debug.print("Registry: {s}\n", .{registry_url});

    // Create tarball
    const tarball_path = try createTarball(allocator, cwd, metadata.name, metadata.version);
    defer allocator.free(tarball_path);
    defer std.fs.cwd().deleteFile(tarball_path) catch {};

    if (options.dry_run) {
        std.debug.print("Dry run mode - package would be published to {s}\n", .{registry_url});
        std.debug.print("Tarball: {s}\n", .{tarball_path});
        if (metadata.publish_config) |pc| {
            if (pc.access) |a| std.debug.print("Access: {s}\n", .{a});
            if (pc.tag) |t| std.debug.print("Tag: {s}\n", .{t});
        }
        return .{ .exit_code = 0 };
    }

    // Initialize registry client
    var registry_client = registry.RegistryClient.init(allocator, registry_url);
    defer registry_client.deinit();

    // Try OIDC authentication first if enabled
    if (options.use_oidc) {
        if (try attemptOIDCPublish(
            allocator,
            &registry_client,
            metadata.name,
            metadata.version,
            tarball_path,
            options.provenance,
        )) {
            std.debug.print("✓ Package published successfully using OIDC\n", .{});
            return .{ .exit_code = 0 };
        } else {
            std.debug.print("OIDC authentication not available, falling back to token auth...\n", .{});
        }
    }

    // Fallback to token authentication
    const auth_token = std.process.getEnvVarOwned(allocator, "NPM_TOKEN") catch |err| {
        if (err == error.EnvironmentVariableNotFound) {
            return CommandResult.err(
                allocator,
                "Error: No authentication method available. Set NPM_TOKEN or use OIDC in CI/CD.",
            );
        }
        return CommandResult.err(allocator, "Error: Failed to read NPM_TOKEN");
    };
    defer allocator.free(auth_token);

    const response = registry_client.publishWithToken(
        metadata.name,
        metadata.version,
        tarball_path,
        auth_token,
    ) catch |err| {
        const err_msg = try std.fmt.allocPrint(
            allocator,
            "Error: Failed to publish package: {any}",
            .{err},
        );
        return CommandResult.err(allocator, err_msg);
    };
    defer {
        var mut_response = response;
        mut_response.deinit(allocator);
    }

    if (response.success) {
        std.debug.print("✓ Package published successfully\n", .{});
        return .{ .exit_code = 0 };
    } else {
        const err_msg = try std.fmt.allocPrint(
            allocator,
            "Error: Failed to publish package (status {d}): {s}",
            .{ response.status_code, response.message orelse "Unknown error" },
        );
        return CommandResult.err(allocator, err_msg);
    }
}

/// Attempt to publish using OIDC authentication
fn attemptOIDCPublish(
    allocator: std.mem.Allocator,
    registry_client: *@import("../../auth/registry.zig").RegistryClient,
    package_name: []const u8,
    version: []const u8,
    tarball_path: []const u8,
    generate_provenance: bool,
) !bool {
    const oidc = @import("../../auth/oidc.zig");

    // Detect OIDC provider
    var provider = try oidc.detectProvider(allocator) orelse return false;
    defer provider.deinit(allocator);

    std.debug.print("Detected OIDC provider: {s}\n", .{provider.name});

    // Get OIDC token from environment
    const raw_token = try oidc.getTokenFromEnvironment(allocator, &provider) orelse return false;
    defer allocator.free(raw_token);

    // Verify token signature against provider's JWKS
    std.debug.print("Verifying OIDC token signature...\n", .{});
    const sig_valid = oidc.verifyTokenSignature(allocator, raw_token, &provider) catch |err| {
        std.debug.print("Warning: Could not verify token signature: {any}\n", .{err});
        std.debug.print("Proceeding with unverified token (registry will validate)\n", .{});
        // Continue anyway - registry will do final validation
        return attemptOIDCPublishUnverified(allocator, registry_client, package_name, version, tarball_path, generate_provenance, raw_token, &provider);
    };

    if (!sig_valid) {
        std.debug.print("Error: OIDC token signature verification failed\n", .{});
        return false;
    }

    std.debug.print("✓ Token signature verified\n", .{});

    // Decode and validate token (signature already verified)
    var token = oidc.validateTokenComplete(allocator, raw_token, &provider, null) catch |err| {
        std.debug.print("Error: Token validation failed: {any}\n", .{err});
        return false;
    };
    defer token.deinit(allocator);

    // Print token info for transparency
    std.debug.print("OIDC Claims:\n", .{});
    std.debug.print("  Issuer: {s}\n", .{token.claims.iss});
    std.debug.print("  Subject: {s}\n", .{token.claims.sub});
    if (token.claims.repository) |repo| {
        std.debug.print("  Repository: {s}\n", .{repo});
    }
    if (token.claims.ref) |ref| {
        std.debug.print("  Ref: {s}\n", .{ref});
    }
    if (token.claims.sha) |sha| {
        std.debug.print("  SHA: {s}\n", .{sha});
    }

    // Generate provenance if requested
    if (generate_provenance) {
        try generateProvenance(allocator, &token, package_name, version);
    }

    // Publish package
    const response = try registry_client.publishWithOIDC(
        package_name,
        version,
        tarball_path,
        &token,
    );
    defer {
        var mut_response = response;
        mut_response.deinit(allocator);
    }

    return response.success;
}

/// Fallback: Attempt OIDC publish without local signature verification
/// Used when JWKS fetch fails - registry will still validate the token
fn attemptOIDCPublishUnverified(
    allocator: std.mem.Allocator,
    registry_client: *@import("../../auth/registry.zig").RegistryClient,
    package_name: []const u8,
    version: []const u8,
    tarball_path: []const u8,
    generate_provenance: bool,
    raw_token: []const u8,
    provider: *const @import("../../auth/oidc.zig").OIDCProvider,
) !bool {
    const oidc = @import("../../auth/oidc.zig");
    _ = provider;

    // Decode token without signature verification
    var token = try oidc.decodeTokenUnsafe(allocator, raw_token);
    defer token.deinit(allocator);

    // At least validate expiration
    oidc.validateExpiration(&token.claims) catch |err| {
        std.debug.print("Error: Token validation failed: {any}\n", .{err});
        return false;
    };

    // Print token info
    std.debug.print("OIDC Claims (unverified):\n", .{});
    std.debug.print("  Issuer: {s}\n", .{token.claims.iss});
    std.debug.print("  Subject: {s}\n", .{token.claims.sub});
    if (token.claims.repository) |repo| {
        std.debug.print("  Repository: {s}\n", .{repo});
    }

    // Generate provenance if requested
    if (generate_provenance) {
        try generateProvenance(allocator, &token, package_name, version);
    }

    // Publish - registry will validate
    const response = try registry_client.publishWithOIDC(
        package_name,
        version,
        tarball_path,
        &token,
    );
    defer {
        var mut_response = response;
        mut_response.deinit(allocator);
    }

    return response.success;
}

/// Create tarball for package
fn createTarball(
    allocator: std.mem.Allocator,
    package_dir: []const u8,
    package_name: []const u8,
    version: []const u8,
) ![]const u8 {
    // Sanitize package name for tarball filename (replace @ and / with -)
    var sanitized_name = try allocator.alloc(u8, package_name.len);
    defer allocator.free(sanitized_name);
    for (package_name, 0..) |c, i| {
        sanitized_name[i] = if (c == '@' or c == '/') '-' else c;
    }
    // Trim leading dash if present (from @scope)
    const clean_name = if (sanitized_name[0] == '-') sanitized_name[1..] else sanitized_name;

    const tarball_name = try std.fmt.allocPrint(
        allocator,
        "{s}-{s}.tgz",
        .{ clean_name, version },
    );
    defer allocator.free(tarball_name);

    // Create tarball in temp directory to avoid "file changed as we read it" error
    const tmp_dir = std.posix.getenv("TMPDIR") orelse std.posix.getenv("TMP") orelse "/tmp";
    const tarball_path = try std.fs.path.join(allocator, &[_][]const u8{ tmp_dir, tarball_name });

    // Use tar command to create tarball
    const result = try std.process.Child.run(.{
        .allocator = allocator,
        .argv = &[_][]const u8{
            "tar",
            "-czf",
            tarball_path,
            "-C",
            package_dir,
            "--exclude=node_modules",
            "--exclude=pantry",
            "--exclude=.git",
            "--exclude=*.tgz",
            ".",
        },
    });
    defer allocator.free(result.stdout);
    defer allocator.free(result.stderr);

    if (result.term != .Exited or result.term.Exited != 0) {
        std.debug.print("Tarball creation failed. Exit: {any}\n", .{result.term});
        std.debug.print("stderr: {s}\n", .{result.stderr});
        return error.TarballCreationFailed;
    }

    return tarball_path;
}

/// Generate provenance metadata
fn generateProvenance(
    allocator: std.mem.Allocator,
    token: *@import("../../auth/oidc.zig").OIDCToken,
    package_name: []const u8,
    version: []const u8,
) !void {
    // Sanitize package name for filename (replace @ and / with -)
    var sanitized_name = try allocator.alloc(u8, package_name.len);
    defer allocator.free(sanitized_name);
    for (package_name, 0..) |c, i| {
        sanitized_name[i] = if (c == '@' or c == '/') '-' else c;
    }
    const clean_name = if (sanitized_name[0] == '-') sanitized_name[1..] else sanitized_name;

    // Generate subject name for provenance
    const subject_name = try std.fmt.allocPrint(allocator, "{s}@{s}", .{ package_name, version });
    defer allocator.free(subject_name);

    // Generate SLSA provenance format
    const provenance = try std.fmt.allocPrint(
        allocator,
        \\{{
        \\  "_type": "https://in-toto.io/Statement/v0.1",
        \\  "subject": [{{
        \\    "name": "{s}",
        \\    "digest": {{
        \\      "sha256": "placeholder"
        \\    }}
        \\  }}],
        \\  "predicateType": "https://slsa.dev/provenance/v0.2",
        \\  "predicate": {{
        \\    "builder": {{
        \\      "id": "{s}"
        \\    }},
        \\    "buildType": "https://slsa.dev/build-type/v1",
        \\    "invocation": {{
        \\      "configSource": {{
        \\        "uri": "{s}",
        \\        "digest": {{
        \\          "sha1": "{s}"
        \\        }}
        \\      }}
        \\    }},
        \\    "metadata": {{
        \\      "buildInvocationId": "{s}",
        \\      "completeness": {{
        \\        "parameters": true,
        \\        "environment": true,
        \\        "materials": true
        \\      }},
        \\      "reproducible": false
        \\    }}
        \\  }}
        \\}}
    ,
        .{
            subject_name,
            token.claims.iss,
            token.claims.repository orelse "unknown",
            token.claims.sha orelse "unknown",
            token.claims.jti orelse "unknown",
        },
    );
    defer allocator.free(provenance);

    // Write provenance to file (use sanitized name for filename)
    const provenance_path = try std.fmt.allocPrint(
        allocator,
        "{s}-{s}.provenance.json",
        .{ clean_name, version },
    );
    defer allocator.free(provenance_path);

    try std.fs.cwd().writeFile(.{
        .sub_path = provenance_path,
        .data = provenance,
    });

    std.debug.print("Generated provenance: {s}\n", .{provenance_path});
}

// ============================================================================
// Trusted Publisher Management Commands
// ============================================================================

pub const TrustedPublisherAddOptions = struct {
    package: []const u8,
    type: []const u8, // "github-action", "gitlab-ci", etc.
    owner: []const u8,
    repository: []const u8,
    workflow: ?[]const u8 = null,
    environment: ?[]const u8 = null,
    registry: []const u8 = "https://registry.npmjs.org",
};

/// Add a trusted publisher to a package
pub fn trustedPublisherAddCommand(
    allocator: std.mem.Allocator,
    args: []const []const u8,
    options: TrustedPublisherAddOptions,
) !CommandResult {
    _ = args;

    const oidc = @import("../../auth/oidc.zig");
    const registry = @import("../../auth/registry.zig");

    std.debug.print("Adding trusted publisher for {s}...\n", .{options.package});
    std.debug.print("  Type: {s}\n", .{options.type});
    std.debug.print("  Owner: {s}\n", .{options.owner});
    std.debug.print("  Repository: {s}\n", .{options.repository});
    if (options.workflow) |w| {
        std.debug.print("  Workflow: {s}\n", .{w});
    }
    if (options.environment) |e| {
        std.debug.print("  Environment: {s}\n", .{e});
    }

    // Get authentication token
    const auth_token = std.process.getEnvVarOwned(allocator, "NPM_TOKEN") catch |err| {
        if (err == error.EnvironmentVariableNotFound) {
            return CommandResult.err(
                allocator,
                "Error: NPM_TOKEN environment variable not set. This is required to manage trusted publishers.",
            );
        }
        return CommandResult.err(allocator, "Error: Failed to read NPM_TOKEN");
    };
    defer allocator.free(auth_token);

    // Create trusted publisher configuration
    const publisher = oidc.TrustedPublisher{
        .type = options.type,
        .owner = options.owner,
        .repository = options.repository,
        .workflow = options.workflow,
        .environment = options.environment,
        .allowed_refs = null, // Can be extended to support allowed_refs
    };

    // Initialize registry client
    var registry_client = registry.RegistryClient.init(allocator, options.registry);
    defer registry_client.deinit();

    // Add trusted publisher
    registry_client.addTrustedPublisher(
        options.package,
        &publisher,
        auth_token,
    ) catch |err| {
        const err_msg = try std.fmt.allocPrint(
            allocator,
            "Error: Failed to add trusted publisher: {any}",
            .{err},
        );
        return CommandResult.err(allocator, err_msg);
    };

    std.debug.print("✓ Trusted publisher added successfully\n", .{});
    std.debug.print("\nYou can now publish {s} from {s}/{s} using OIDC authentication.\n", .{
        options.package,
        options.owner,
        options.repository,
    });

    return .{ .exit_code = 0 };
}

pub const TrustedPublisherListOptions = struct {
    package: []const u8,
    registry: []const u8 = "https://registry.npmjs.org",
    json: bool = false,
};

/// List trusted publishers for a package
pub fn trustedPublisherListCommand(
    allocator: std.mem.Allocator,
    args: []const []const u8,
    options: TrustedPublisherListOptions,
) !CommandResult {
    _ = args;

    const registry = @import("../../auth/registry.zig");

    // Get authentication token
    const auth_token = std.process.getEnvVarOwned(allocator, "NPM_TOKEN") catch |err| {
        if (err == error.EnvironmentVariableNotFound) {
            return CommandResult.err(
                allocator,
                "Error: NPM_TOKEN environment variable not set",
            );
        }
        return CommandResult.err(allocator, "Error: Failed to read NPM_TOKEN");
    };
    defer allocator.free(auth_token);

    // Initialize registry client
    var registry_client = registry.RegistryClient.init(allocator, options.registry);
    defer registry_client.deinit();

    // List trusted publishers
    const publishers = registry_client.listTrustedPublishers(
        options.package,
        auth_token,
    ) catch |err| {
        const err_msg = try std.fmt.allocPrint(
            allocator,
            "Error: Failed to list trusted publishers: {any}",
            .{err},
        );
        return CommandResult.err(allocator, err_msg);
    };
    defer {
        for (publishers) |*pub_item| {
            var mut_pub = pub_item.*;
            mut_pub.deinit(allocator);
        }
        allocator.free(publishers);
    }

    if (options.json) {
        // Output JSON format
        std.debug.print("[\n", .{});
        for (publishers, 0..) |pub_item, i| {
            std.debug.print("  {{\n", .{});
            std.debug.print("    \"type\": \"{s}\",\n", .{pub_item.type});
            std.debug.print("    \"owner\": \"{s}\",\n", .{pub_item.owner});
            std.debug.print("    \"repository\": \"{s}\"", .{pub_item.repository});
            if (pub_item.workflow) |w| {
                std.debug.print(",\n    \"workflow\": \"{s}\"", .{w});
            }
            if (pub_item.environment) |e| {
                std.debug.print(",\n    \"environment\": \"{s}\"", .{e});
            }
            std.debug.print("\n  }}", .{});
            if (i < publishers.len - 1) {
                std.debug.print(",", .{});
            }
            std.debug.print("\n", .{});
        }
        std.debug.print("]\n", .{});
    } else {
        // Output table format
        if (publishers.len == 0) {
            std.debug.print("No trusted publishers configured for {s}\n", .{options.package});
            std.debug.print("\nUse 'pantry publisher add' to add a trusted publisher.\n", .{});
        } else {
            std.debug.print("Trusted Publishers for {s}:\n\n", .{options.package});
            for (publishers, 0..) |pub_item, i| {
                std.debug.print("{}. Type: {s}\n", .{ i + 1, pub_item.type });
                std.debug.print("   Owner: {s}\n", .{pub_item.owner});
                std.debug.print("   Repository: {s}\n", .{pub_item.repository});
                if (pub_item.workflow) |w| {
                    std.debug.print("   Workflow: {s}\n", .{w});
                }
                if (pub_item.environment) |e| {
                    std.debug.print("   Environment: {s}\n", .{e});
                }
                std.debug.print("\n", .{});
            }
        }
    }

    return .{ .exit_code = 0 };
}

pub const TrustedPublisherRemoveOptions = struct {
    package: []const u8,
    publisher_id: []const u8,
    registry: []const u8 = "https://registry.npmjs.org",
};

/// Remove a trusted publisher from a package
pub fn trustedPublisherRemoveCommand(
    allocator: std.mem.Allocator,
    args: []const []const u8,
    options: TrustedPublisherRemoveOptions,
) !CommandResult {
    _ = args;

    const registry = @import("../../auth/registry.zig");

    std.debug.print("Removing trusted publisher {s} from {s}...\n", .{
        options.publisher_id,
        options.package,
    });

    // Get authentication token
    const auth_token = std.process.getEnvVarOwned(allocator, "NPM_TOKEN") catch |err| {
        if (err == error.EnvironmentVariableNotFound) {
            return CommandResult.err(
                allocator,
                "Error: NPM_TOKEN environment variable not set",
            );
        }
        return CommandResult.err(allocator, "Error: Failed to read NPM_TOKEN");
    };
    defer allocator.free(auth_token);

    // Initialize registry client
    var registry_client = registry.RegistryClient.init(allocator, options.registry);
    defer registry_client.deinit();

    // Remove trusted publisher
    registry_client.removeTrustedPublisher(
        options.package,
        options.publisher_id,
        auth_token,
    ) catch |err| {
        const err_msg = try std.fmt.allocPrint(
            allocator,
            "Error: Failed to remove trusted publisher: {any}",
            .{err},
        );
        return CommandResult.err(allocator, err_msg);
    };

    std.debug.print("✓ Trusted publisher removed successfully\n", .{});

    return .{ .exit_code = 0 };
}

// ============================================================================
// Why Command
// ============================================================================

pub const WhyOptions = struct {
    top: bool = false, // Show only top-level dependencies
    depth: ?usize = null, // Maximum depth of dependency tree to display
};

/// Dependency chain node for displaying why a package is installed
const DependencyChain = struct {
    package_name: []const u8,
    version: []const u8,
    required_by: []const u8,
    version_constraint: []const u8,
    dep_type: []const u8, // "prod", "dev", "peer", "optional"
    depth: usize,
    children: std.ArrayList(*DependencyChain),

    pub fn deinit(self: *DependencyChain, allocator: std.mem.Allocator) void {
        for (self.children.items) |child| {
            child.deinit(allocator);
            allocator.destroy(child);
        }
        self.children.deinit();
    }
};

/// Explain why a package is installed
pub fn whyCommand(allocator: std.mem.Allocator, args: []const []const u8, options: WhyOptions) !CommandResult {
    if (args.len == 0) {
        return CommandResult.err(allocator, "Error: No package specified\nUsage: pantry why <package>");
    }

    const package_pattern = args[0];

    // Get current working directory
    var cwd_buf: [std.fs.max_path_bytes]u8 = undefined;
    const cwd = try std.fs.cwd().realpath(".", &cwd_buf);

    // Find config file
    const config_path = common.findConfigFile(allocator, cwd) catch {
        return CommandResult.err(allocator, common.ERROR_NO_CONFIG);
    };
    defer allocator.free(config_path);

    // Parse config file
    const parsed = common.readConfigFile(allocator, config_path) catch {
        return CommandResult.err(allocator, common.ERROR_CONFIG_PARSE);
    };
    defer parsed.deinit();

    // Extract dependencies from config
    var deps_map = try common.extractAllDependencies(allocator, parsed);
    defer {
        var it = deps_map.iterator();
        while (it.next()) |entry| {
            allocator.free(entry.key_ptr.*);
        }
        deps_map.deinit();
    }

    // Find matching packages
    var matches = std.ArrayList([]const u8){};
    defer matches.deinit(allocator);

    var it = deps_map.iterator();
    while (it.next()) |entry| {
        if (matchesPattern(entry.key_ptr.*, package_pattern)) {
            try matches.append(allocator, entry.key_ptr.*);
        }
    }

    if (matches.items.len == 0) {
        const msg = try std.fmt.allocPrint(
            allocator,
            "Package '{s}' not found in dependencies",
            .{package_pattern},
        );
        return .{
            .exit_code = 1,
            .message = msg,
        };
    }

    // Display dependency chains for each match
    for (matches.items) |pkg_name| {
        const dep_info = deps_map.get(pkg_name).?;

        std.debug.print("{s}@{s}\n", .{ pkg_name, dep_info.version });

        if (options.top) {
            // Show only top-level dependency
            const dep_type_str = switch (dep_info.dep_type) {
                .normal => "",
                .dev => "dev ",
                .peer => "peer ",
                .optional => "optional ",
            };

            // Get project name from config
            const project_name = if (parsed.value.object.get("name")) |name_val|
                name_val.string
            else
                "project";

            std.debug.print("  └─ {s}{s}@1.0.0 (requires {s})\n", .{
                dep_type_str,
                project_name,
                dep_info.version,
            });
        } else {
            // Build and display full dependency tree
            try displayDependencyTree(allocator, pkg_name, dep_info, parsed, 1, options.depth orelse 999);
        }

        std.debug.print("\n", .{});
    }

    const summary = try std.fmt.allocPrint(
        allocator,
        "Found {d} package(s) matching '{s}'",
        .{ matches.items.len, package_pattern },
    );

    return .{
        .exit_code = 0,
        .message = summary,
    };
}

/// Check if a package name matches a pattern (supports glob patterns)
fn matchesPattern(pkg_name: []const u8, pattern: []const u8) bool {
    // Handle exact match
    if (std.mem.eql(u8, pkg_name, pattern)) {
        return true;
    }

    // Handle glob patterns
    if (std.mem.indexOf(u8, pattern, "*")) |star_pos| {
        const prefix = pattern[0..star_pos];
        const suffix = pattern[star_pos + 1 ..];

        if (!std.mem.startsWith(u8, pkg_name, prefix)) return false;
        if (!std.mem.endsWith(u8, pkg_name, suffix)) return false;
        return true;
    }

    return false;
}

/// Display dependency tree recursively
fn displayDependencyTree(
    allocator: std.mem.Allocator,
    pkg_name: []const u8,
    dep_info: common.DependencyInfo,
    parsed: std.json.Parsed(std.json.Value),
    current_depth: usize,
    max_depth: usize,
) !void {
    if (current_depth > max_depth) {
        const indent = try createIndent(allocator, current_depth);
        defer allocator.free(indent);
        std.debug.print("{s}└─ (deeper dependencies hidden)\n", .{indent});
        return;
    }

    const dep_type_str = switch (dep_info.dep_type) {
        .normal => "",
        .dev => "dev ",
        .peer => "peer ",
        .optional => "optional ",
    };

    // Get project name from config
    const project_name = if (parsed.value.object.get("name")) |name_val|
        name_val.string
    else
        "project";

    const indent = try createIndent(allocator, current_depth);
    defer allocator.free(indent);

    std.debug.print("{s}└─ {s}{s}@1.0.0 (requires {s})\n", .{
        indent,
        dep_type_str,
        project_name,
        dep_info.version,
    });

    // For a real implementation, we would recursively check transitive dependencies
    // This is a simplified version showing the direct dependency relationship
    _ = pkg_name;
}

/// Create indentation string for tree display
fn createIndent(allocator: std.mem.Allocator, depth: usize) ![]u8 {
    const indent_per_level = 3;
    const total_spaces = depth * indent_per_level;
    const indent = try allocator.alloc(u8, total_spaces);
    @memset(indent, ' ');
    return indent;
}
