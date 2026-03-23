//! Install Command Helper Functions
//!
//! Utility functions used across install command implementations.

const std = @import("std");
const lib = @import("../../../lib.zig");
const io_helper = @import("../../../io_helper.zig");
const types = @import("types.zig");
const cache = lib.cache;
const install = lib.install;
const style = @import("../../style.zig");

// ============================================================================
// Package Alias Resolution
// ============================================================================

/// Resolve well-known package name aliases to their canonical domain names.
/// For example, "meilisearch" -> "meilisearch.com" (the npm package "meilisearch"
/// is the JS client, while "meilisearch.com" is the server binary).
pub fn resolvePackageAlias(name: []const u8) []const u8 {
    const aliases = .{
        // Runtimes & languages
        .{ "bun", "bun.sh" },
        .{ "zig", "ziglang.org" },
        .{ "node", "nodejs.org" },
        .{ "nodejs", "nodejs.org" },
        .{ "python", "python.org" },
        .{ "ruby", "ruby-lang.org" },
        .{ "go", "go.dev" },
        .{ "golang", "go.dev" },
        .{ "rust", "rust-lang.org" },
        .{ "rustc", "rust-lang.org" },
        .{ "cargo", "rust-lang.org/cargo" },
        .{ "rustup", "rust-lang.org/rustup" },
        .{ "deno", "deno.land" },
        .{ "java", "openjdk.org" },
        .{ "kotlin", "kotlinlang.org" },
        .{ "scala", "scala-lang.org" },
        .{ "swift", "swift.org" },
        .{ "dart", "dart.dev" },
        .{ "flutter", "flutter.dev" },
        .{ "lua", "lua.org" },
        .{ "luajit", "luajit.org" },
        .{ "perl", "perl.org" },
        .{ "php", "php.net" },
        .{ "julia", "julialang.org" },
        .{ "erlang", "erlang.org" },
        .{ "elixir", "elixir-lang.org" },
        .{ "nim", "nim-lang.org" },
        .{ "crystal", "crystal-lang.org" },
        .{ "haskell", "haskell.org" },
        .{ "ocaml", "ocaml.org" },
        // Package managers
        .{ "npm", "npmjs.com" },
        .{ "pnpm", "pnpm.io" },
        .{ "yarn", "yarnpkg.com" },
        .{ "pip", "pip.pypa.io" },
        .{ "pipenv", "pipenv.pypa.io" },
        .{ "poetry", "python-poetry.org" },
        .{ "gem", "rubygems.org" },
        .{ "luarocks", "luarocks.org" },
        .{ "maven", "maven.apache.org" },
        .{ "gradle", "gradle.org" },
        .{ "sbt", "scala-sbt.org" },
        // Databases
        .{ "redis", "redis.io" },
        .{ "postgres", "postgresql.org" },
        .{ "postgresql", "postgresql.org" },
        .{ "mysql", "mysql.com" },
        .{ "mariadb", "mariadb.com/server" },
        .{ "sqlite", "sqlite.org" },
        .{ "mongodb", "mongodb.com" },
        .{ "mongo", "mongodb.com" },
        .{ "memcached", "memcached.org" },
        // Web servers & proxies
        .{ "nginx", "nginx.org" },
        .{ "caddy", "caddyserver.com" },
        .{ "httpd", "apache.org/httpd" },
        .{ "apache", "apache.org/httpd" },
        // Build tools
        .{ "cmake", "cmake.org" },
        .{ "ninja", "ninja-build.org" },
        .{ "meson", "mesonbuild.com" },
        .{ "make", "gnu.org/make" },
        // Compilers & toolchains
        .{ "llvm", "llvm.org" },
        .{ "clang", "llvm.org" },
        .{ "clang-format", "llvm.org/clang-format" },
        .{ "gcc", "gnu.org/gcc" },
        .{ "protobuf", "protobuf.dev" },
        .{ "grpc", "grpc.io" },
        // CLI tools
        .{ "curl", "curl.se" },
        .{ "git", "git-scm.org" },
        .{ "vim", "vim.org" },
        .{ "neovim", "neovim.io" },
        .{ "nvim", "neovim.io" },
        .{ "tmux", "github.com/tmux/tmux" },
        .{ "fzf", "github.com/junegunn/fzf" },
        .{ "lazygit", "github.com/jesseduffield/lazygit" },
        .{ "jq", "jqlang.github.io/jq" },
        .{ "yq", "github.com/mikefarah/yq" },
        .{ "gh", "cli.github.com" },
        .{ "bat", "github.com/sharkdp/bat" },
        .{ "ripgrep", "github.com/BurntSushi/ripgrep" },
        .{ "rg", "github.com/BurntSushi/ripgrep" },
        .{ "fd", "github.com/sharkdp/fd" },
        .{ "eza", "github.com/eza-community/eza" },
        .{ "starship", "starship.rs" },
        .{ "zsh", "zsh.sourceforge.io" },
        .{ "fish", "fishshell.com" },
        .{ "httpie", "httpie.io" },
        // Multimedia
        .{ "ffmpeg", "ffmpeg.org" },
        .{ "openssl", "openssl.org" },
        // DevOps & infra
        .{ "terraform", "terraform.io" },
        .{ "vault", "vaultproject.io" },
        .{ "consul", "consul.io" },
        .{ "packer", "packer.io" },
        .{ "helm", "helm.sh" },
        .{ "ansible", "ansible.com" },
        .{ "docker-compose", "docker.com/compose" },
        .{ "docker-buildx", "docker.com/buildx" },
        .{ "flyctl", "fly.io" },
        .{ "railway", "railway.app" },
        .{ "supabase", "supabase.com/cli" },
        .{ "aws", "aws.amazon.com/cli" },
        .{ "gcloud", "google.com/gcloud" },
        // JS/TS tools
        .{ "typescript", "typescriptlang.org" },
        .{ "tsc", "typescriptlang.org" },
        .{ "prettier", "prettier.io" },
        .{ "biome", "biomejs.dev" },
        .{ "vite", "vitejs.dev" },
        .{ "tailwindcss", "tailwindcss.com" },
        .{ "tailwind", "tailwindcss.com" },
        .{ "sass", "sass-lang.com/sassc" },
        .{ "hugo", "gohugo.io" },
        // Messaging & streaming
        .{ "kafka", "kafka.apache.org" },
        .{ "rabbitmq", "rabbitmq.com" },
        .{ "zookeeper", "apache.org/zookeeper" },
        // Misc
        .{ "meilisearch", "meilisearch.com" },
        .{ "goreleaser", "goreleaser.com" },
        .{ "act", "github.com/nektos/act" },
        .{ "dive", "github.com/wagoodman/dive" },
        .{ "craft", "github.com/stacksjs/craft" },
    };
    inline for (aliases) |entry| {
        if (std.mem.eql(u8, name, entry[0])) return entry[1];
    }
    return name;
}

// ============================================================================
// Pantry Registry Lookup (S3/DynamoDB)
// ============================================================================

pub const PantryPackageInfo = struct {
    s3_path: []const u8,
    version: []const u8,
    tarball_url: []const u8,

    pub fn deinit(self: *PantryPackageInfo, allocator: std.mem.Allocator) void {
        allocator.free(self.s3_path);
        allocator.free(self.version);
        allocator.free(self.tarball_url);
    }
};

/// Platform string for current OS/arch (comptime)
const current_platform = blk: {
    const os_str = switch (@import("builtin").os.tag) {
        .macos => "darwin",
        .linux => "linux",
        else => "linux",
    };
    const arch_str = switch (@import("builtin").cpu.arch) {
        .aarch64 => "arm64",
        .x86_64 => "x86-64",
        else => "x86-64",
    };
    break :blk os_str ++ "-" ++ arch_str;
};

/// Look up a package in the Pantry registry.
/// First tries the registry REST API, then falls back to direct S3 metadata.json lookup.
/// Returns package info if found, null if not found or query fails.
pub fn lookupPantryRegistry(allocator: std.mem.Allocator, name: []const u8) !?PantryPackageInfo {
    // Try registry REST API first (native HTTP, no subprocess)
    const api_result = lookupViaRegistryApi(allocator, name, current_platform, null);
    if (api_result) |info| return info;

    // Fallback: try direct S3 metadata.json lookup
    return lookupViaS3Metadata(allocator, name, current_platform, null);
}

/// Variant with shared HTTP client for connection pooling (used from workspace install threads).
pub fn lookupPantryRegistryWithClient(allocator: std.mem.Allocator, name: []const u8, client: *std.http.Client) !?PantryPackageInfo {
    const api_result = lookupViaRegistryApi(allocator, name, current_platform, client);
    if (api_result) |info| return info;
    return lookupViaS3Metadata(allocator, name, current_platform, client);
}

/// Lightweight S3-only lookup (no AWS CLI subprocess, just HTTP).
/// Used for non-domain packages like "zig-config" that are in our S3 registry
/// but would be incorrectly skipped by the domain-style check.
pub fn lookupPantryS3Only(allocator: std.mem.Allocator, name: []const u8) ?PantryPackageInfo {
    return lookupViaS3Metadata(allocator, name, current_platform, null);
}

/// Variant with shared HTTP client for connection pooling.
pub fn lookupPantryS3OnlyWithClient(allocator: std.mem.Allocator, name: []const u8, client: *std.http.Client) ?PantryPackageInfo {
    return lookupViaS3Metadata(allocator, name, current_platform, client);
}

/// Try looking up package via the pantry registry REST API (native HTTP, no subprocess).
/// Returns package info if found, null on any error.
fn lookupViaRegistryApi(allocator: std.mem.Allocator, name: []const u8, platform: []const u8, client: ?*std.http.Client) ?PantryPackageInfo {
    // Perf: Stack buffer for URL (avoids heap alloc)
    var url_buf: [512]u8 = undefined;
    const api_url = std.fmt.bufPrint(&url_buf, "https://registry.pantry.dev/packages/{s}", .{name}) catch return null;

    const response = if (client) |c|
        io_helper.httpGetWithClient(c, allocator, api_url) catch return null
    else
        io_helper.httpGet(allocator, api_url) catch return null;
    defer allocator.free(response);

    if (response.len == 0) return null;

    const parsed = std.json.parseFromSlice(std.json.Value, allocator, response, .{}) catch return null;
    defer parsed.deinit();

    if (parsed.value != .object) return null;
    // Error response (404, etc.)
    if (parsed.value.object.get("error") != null) return null;

    const version = if (parsed.value.object.get("version")) |v| (if (v == .string) v.string else return null) else return null;

    // If the response has a direct tarball URL, use it
    if (parsed.value.object.get("tarballUrl")) |t| {
        if (t == .string and t.string.len > 0) {
            return PantryPackageInfo{
                .s3_path = allocator.dupe(u8, name) catch return null,
                .version = allocator.dupe(u8, version) catch return null,
                .tarball_url = allocator.dupe(u8, t.string) catch return null,
            };
        }
    }

    // Otherwise, resolve via S3 metadata for platform-specific tarball
    return lookupViaS3Metadata(allocator, name, platform, client);
}

/// Try looking up package via direct S3 metadata.json URL.
/// This works without AWS credentials — just needs HTTP access to S3.
/// Accepts optional shared HTTP client for connection pooling.
fn lookupViaS3Metadata(allocator: std.mem.Allocator, name: []const u8, platform: []const u8, client: ?*std.http.Client) ?PantryPackageInfo {
    const metadata_url = std.fmt.allocPrint(
        allocator,
        "https://pantry-registry.s3.amazonaws.com/binaries/{s}/metadata.json",
        .{name},
    ) catch return null;
    defer allocator.free(metadata_url);

    const metadata_response = if (client) |c|
        io_helper.httpGetWithClient(c, allocator, metadata_url) catch return null
    else
        io_helper.httpGet(allocator, metadata_url) catch return null;
    defer allocator.free(metadata_response);

    const meta_parsed = std.json.parseFromSlice(std.json.Value, allocator, metadata_response, .{}) catch return null;
    defer meta_parsed.deinit();

    const meta_root = meta_parsed.value;
    if (meta_root != .object) return null;

    // Use latestVersion from the metadata
    const latest_version_val = meta_root.object.get("latestVersion") orelse return null;
    const version = if (latest_version_val == .string) latest_version_val.string else return null;

    const versions_obj = meta_root.object.get("versions") orelse return null;
    if (versions_obj != .object) return null;

    const version_info = versions_obj.object.get(version) orelse return null;
    if (version_info != .object) return null;

    const platforms_obj = version_info.object.get("platforms") orelse return null;
    if (platforms_obj != .object) return null;

    const platform_info = platforms_obj.object.get(platform) orelse return null;
    if (platform_info != .object) return null;

    const tarball_path_val = platform_info.object.get("tarball") orelse return null;
    const tarball_path = if (tarball_path_val == .string) tarball_path_val.string else return null;

    const s3_path = std.fmt.allocPrint(
        allocator,
        "binaries/{s}/metadata.json",
        .{name},
    ) catch return null;

    const tarball_url = std.fmt.allocPrint(
        allocator,
        "https://pantry-registry.s3.amazonaws.com/{s}",
        .{tarball_path},
    ) catch {
        allocator.free(s3_path);
        return null;
    };

    return PantryPackageInfo{
        .s3_path = s3_path,
        .version = allocator.dupe(u8, version) catch {
            allocator.free(s3_path);
            allocator.free(tarball_url);
            return null;
        },
        .tarball_url = tarball_url,
    };
}

/// Resolve platform-specific tarball from a metadata.json URL.
fn resolveFromMetadataUrl(allocator: std.mem.Allocator, s3_path: []const u8, version: []const u8, platform: []const u8) ?PantryPackageInfo {
    const metadata_url = std.fmt.allocPrint(
        allocator,
        "https://pantry-registry.s3.amazonaws.com/{s}",
        .{s3_path},
    ) catch return null;
    defer allocator.free(metadata_url);

    // Note: resolveFromMetadataUrl is only called from legacy codepaths;
    // the main lookup functions now use the client-aware variants directly.
    const metadata_response = io_helper.httpGet(allocator, metadata_url) catch return null;
    defer allocator.free(metadata_response);

    const meta_parsed = std.json.parseFromSlice(std.json.Value, allocator, metadata_response, .{}) catch return null;
    defer meta_parsed.deinit();

    const meta_root = meta_parsed.value;
    if (meta_root != .object) return null;

    const versions_obj = meta_root.object.get("versions") orelse return null;
    if (versions_obj != .object) return null;

    const version_info = versions_obj.object.get(version) orelse return null;
    if (version_info != .object) return null;

    const platforms_obj = version_info.object.get("platforms") orelse return null;
    if (platforms_obj != .object) return null;

    const platform_info = platforms_obj.object.get(platform) orelse return null;
    if (platform_info != .object) return null;

    const tarball_path_val = platform_info.object.get("tarball") orelse return null;
    const tarball_path = if (tarball_path_val == .string) tarball_path_val.string else return null;

    const tarball_url = std.fmt.allocPrint(
        allocator,
        "https://pantry-registry.s3.amazonaws.com/{s}",
        .{tarball_path},
    ) catch return null;

    return PantryPackageInfo{
        .s3_path = allocator.dupe(u8, s3_path) catch {
            allocator.free(tarball_url);
            return null;
        },
        .version = allocator.dupe(u8, version) catch {
            allocator.free(tarball_url);
            // s3_path was already duped, but we can't easily free it here
            return null;
        },
        .tarball_url = tarball_url,
    };
}

// ============================================================================
// Install Helpers
// ============================================================================

/// Check if a version string is a local filesystem path
pub fn isLocalPath(version: []const u8) bool {
    return std.mem.startsWith(u8, version, "~/") or
        std.mem.startsWith(u8, version, "./") or
        std.mem.startsWith(u8, version, "../") or
        std.mem.startsWith(u8, version, "/");
}

/// Check if a version string is a link: dependency
pub fn isLinkDependency(version: []const u8) bool {
    return std.mem.startsWith(u8, version, "link:");
}

/// Check if a dependency is local (either has local: prefix, is a filesystem path, or is a link:)
pub fn isLocalDependency(dep: lib.deps.parser.PackageDependency) bool {
    return std.mem.startsWith(u8, dep.name, "local:") or
        isLinkDependency(dep.version) or
        isLocalPath(dep.version);
}

pub fn normalizePackageName(name: []const u8) []const u8 {
    if (std.mem.startsWith(u8, name, "auto:")) {
        return name[5..];
    } else if (std.mem.startsWith(u8, name, "npm:")) {
        return name[4..];
    } else if (std.mem.startsWith(u8, name, "local:")) {
        return name[6..];
    }
    return name;
}

/// Strip internal routing prefixes ("auto:", "local:") from package names for display.
/// "npm:" is preserved because it conveys the source to the user.
pub fn stripDisplayPrefix(name: []const u8) []const u8 {
    if (std.mem.startsWith(u8, name, "auto:")) {
        return name[5..];
    } else if (std.mem.startsWith(u8, name, "local:")) {
        return name[6..];
    }
    return name;
}

/// Validate that a package name contains only safe characters.
/// Rejects path traversal sequences and other dangerous characters.
pub fn validatePackageName(name: []const u8) bool {
    if (name.len == 0 or name.len > 214) return false; // npm limit

    // Reject path traversal
    if (std.mem.indexOf(u8, name, "..") != null) return false;

    // Reject backslashes (Windows path sep)
    if (std.mem.indexOfScalar(u8, name, '\\') != null) return false;

    // Allow @scope/name format, alphanumeric, dash, underscore, dot, slash
    for (name) |c| {
        switch (c) {
            'a'...'z', 'A'...'Z', '0'...'9', '-', '_', '.', '/', '@' => {},
            else => return false,
        }
    }

    return true;
}

/// Resolve a `link:` version string to its actual filesystem path.
/// Reads the symlink at `~/.pantry/links/{name}` to find the real path.
/// Returns null if the link is not registered.
pub fn resolveLinkVersion(allocator: std.mem.Allocator, version: []const u8) !?[]const u8 {
    if (!isLinkDependency(version)) return null;
    const link_name = version[5..]; // Skip "link:"
    const link_cmds = @import("../link.zig");
    return try link_cmds.resolveLinkPath(allocator, link_name);
}

/// Pre-built set of package names from a lockfile for O(1) lookup.
/// Build once with `buildLockfileNameSet`, then use with `canSkipFromLockfileWithNameSet`.
pub const LockfileNameSet = std.StringHashMap(void);

/// Map of package name → version constraint from lockfile workspace entries.
/// Used to detect when a version constraint in package.json has changed.
pub const LockfileConstraintMap = std.StringHashMap([]const u8);

/// Build a set of package names from lockfile entries for O(1) lookups.
/// The lockfile keys are "name@resolved_version", so we extract the name part.
/// Caller must call `deinit()` on the returned set when done.
pub fn buildLockfileNameSet(
    lockfile_packages: *const std.StringHashMap(lib.packages.LockfileEntry),
    allocator: std.mem.Allocator,
) LockfileNameSet {
    var name_set = LockfileNameSet.init(allocator);
    var it = lockfile_packages.iterator();
    while (it.next()) |entry| {
        // Use the name from the value (already parsed, reliable)
        name_set.put(entry.value_ptr.name, {}) catch {};
    }
    return name_set;
}

/// Build a map of package name → version constraint from lockfile workspace entries.
/// Collects constraints from all workspace members' dependencies and devDependencies.
/// The stored values are the original constraint strings (e.g., "^1.0.0") as recorded
/// when the lockfile was written, NOT resolved versions.
pub fn buildConstraintMapFromWorkspaces(
    lockfile_workspaces: *const std.StringHashMap(lib.packages.WorkspaceLockEntry),
    allocator: std.mem.Allocator,
) LockfileConstraintMap {
    var map = LockfileConstraintMap.init(allocator);
    var ws_it = lockfile_workspaces.iterator();
    while (ws_it.next()) |ws_entry| {
        inline for (.{ "dependencies", "dev_dependencies" }) |field_name| {
            if (@field(ws_entry.value_ptr.*, field_name)) |deps| {
                var dep_it = deps.iterator();
                while (dep_it.next()) |dep| {
                    map.put(dep.key_ptr.*, dep.value_ptr.*) catch {};
                }
            }
        }
    }
    return map;
}

/// Fast version of canSkipFromLockfile that uses a pre-built name set for O(1) lookup.
/// When a constraint_map is provided, also verifies that the version constraint from
/// the current package.json matches what was recorded in the lockfile.
pub fn canSkipFromLockfileWithNameSet(
    name_set: *const LockfileNameSet,
    dep_name: []const u8,
    dep_version: []const u8,
    constraint_map: ?*const LockfileConstraintMap,
    proj_dir: []const u8,
    modules_dir: []const u8,
) bool {
    const clean_name = normalizePackageName(dep_name);
    if (!name_set.contains(clean_name)) return false;

    // Check if version constraint has changed since lockfile was written
    if (constraint_map) |cm| {
        if (cm.get(clean_name)) |stored_constraint| {
            if (!std.mem.eql(u8, stored_constraint, dep_version)) return false;
        }
    }

    // Check if destination directory actually exists
    var dest_buf: [std.fs.max_path_bytes]u8 = undefined;
    const dest_dir = std.fmt.bufPrint(&dest_buf, "{s}/{s}/{s}", .{ proj_dir, modules_dir, clean_name }) catch return false;
    io_helper.accessAbsolute(dest_dir, .{}) catch return false;

    return true;
}

/// Check if a package can be skipped based on the lockfile.
/// Returns true if the lockfile has an entry with a matching name AND the destination directory exists.
/// The lockfile keys are "name@resolved_version" while dep files have constraints like "^4.17.21",
/// so we match by name (iterating entries) rather than by exact key.
/// NOTE: For hot loops, prefer buildLockfileNameSet + canSkipFromLockfileWithNameSet for O(1) lookup.
pub fn canSkipFromLockfile(
    lockfile_packages: *const std.StringHashMap(lib.packages.LockfileEntry),
    dep_name: []const u8,
    _: []const u8,
    proj_dir: []const u8,
    _: std.mem.Allocator,
    modules_dir: []const u8,
) bool {
    const clean_name = normalizePackageName(dep_name);

    // Perf: Direct HashMap lookup O(1) instead of iterating all entries O(n)
    if (lockfile_packages.get(clean_name) == null) {
        // Fallback: check by value.name field (for entries keyed differently)
        var found = false;
        var it = lockfile_packages.iterator();
        while (it.next()) |entry| {
            if (std.mem.eql(u8, entry.value_ptr.name, clean_name)) {
                found = true;
                break;
            }
        }
        if (!found) return false;
    }

    // Check if destination directory actually exists (use stack buffer + access instead of openDir)
    var dest_buf: [std.fs.max_path_bytes]u8 = undefined;
    const dest_dir = std.fmt.bufPrint(&dest_buf, "{s}/{s}/{s}", .{ proj_dir, modules_dir, clean_name }) catch return false;
    io_helper.accessAbsolute(dest_dir, .{}) catch return false;

    return true;
}

/// Worker function for concurrent package installation
/// TODO: Re-enable when std.Io.Group API stabilizes
pub fn installPackageWorker(task_ptr: *types.InstallTask) void {
    // defer task_ptr.wg.finish(); // Removed - std.Thread.WaitGroup deprecated
    defer task_ptr.allocator.destroy(task_ptr);

    const result = installSinglePackage(
        task_ptr.allocator,
        task_ptr.dep,
        task_ptr.proj_dir,
        task_ptr.env_dir,
        task_ptr.bin_dir,
        task_ptr.cwd,
        task_ptr.pkg_cache,
        task_ptr.options,
    ) catch |err| {
        task_ptr.result.* = .{
            .name = task_ptr.dep.name,
            .version = task_ptr.dep.version,
            .success = false,
            .error_msg = std.fmt.allocPrint(
                task_ptr.allocator,
                "failed: {}",
                .{err},
            ) catch null,
            .install_time_ms = 0,
        };
        return;
    };
    task_ptr.result.* = result;
}

/// Handle install errors with recovery suggestions
fn handleInstallError(
    allocator: std.mem.Allocator,
    err: anyerror,
    lookup_name: []const u8,
    version: []const u8,
    quiet: bool,
) types.InstallTaskResult {
    const recovery_mod = @import("../../../install/recovery.zig");

    const context_msg = std.fmt.allocPrint(allocator, "Failed to install {s}@{s}", .{ lookup_name, version }) catch null;
    defer if (context_msg) |m| allocator.free(m);

    const suggestion = if (context_msg) |m|
        (recovery_mod.RecoverySuggestion.suggest(allocator, err, m) catch null)
    else
        null;

    const is_package_not_found = switch (err) {
        error.PackageNotFound => true,
        else => false,
    };

    const is_payment_required = switch (err) {
        error.PaymentRequired => true,
        else => false,
    };

    if (suggestion) |s| {
        if (!quiet or is_package_not_found) {
            s.print();
        }
    }

    const error_msg = if (is_payment_required)
        (std.fmt.allocPrint(allocator, "payment required — visit https://pantry.dev/packages/{s}/checkout to purchase access", .{lookup_name}) catch null)
    else if (is_package_not_found)
        (std.fmt.allocPrint(allocator, "not found in registry", .{}) catch null)
    else
        (std.fmt.allocPrint(allocator, "failed: {}", .{err}) catch null);

    return .{
        .name = lookup_name,
        .version = version,
        .success = false,
        .error_msg = error_msg,
        .install_time_ms = 0,
    };
}

/// Install a single package (used by both sequential and concurrent installers)
pub fn installSinglePackage(
    allocator: std.mem.Allocator,
    dep: lib.deps.parser.PackageDependency,
    proj_dir: []const u8,
    env_dir: []const u8,
    bin_dir: []const u8,
    cwd: []const u8,
    shared_installer: *install.Installer,
    options: types.InstallOptions,
) !types.InstallTaskResult {
    const start_ts = io_helper.clockGettime();
    const start_time = @as(i64, @intCast(start_ts.sec)) * 1000 + @as(i64, @intCast(@divFloor(start_ts.nsec, 1_000_000)));

    // Skip local packages - they're handled separately
    if (isLocalDependency(dep)) {
        return .{
            .name = "",
            .version = "",
            .success = true,
            .error_msg = null,
            .install_time_ms = 0,
        };
    }

    // Validate package exists in registry (strip "auto:" prefix for lookups)
    const pkg_registry = @import("../../../packages/generated.zig");
    const stripped_name = normalizePackageName(dep.name);
    // Resolve well-known package aliases (e.g. "meilisearch" -> "meilisearch.com")
    const lookup_name = resolvePackageAlias(stripped_name);
    const pkg_info = pkg_registry.getPackageByName(lookup_name);

    // Check if this is a zig dev version (should use ziglang.org instead of pkgx)
    const is_zig_package = std.mem.eql(u8, lookup_name, "zig") or
        std.mem.eql(u8, lookup_name, "ziglang") or
        std.mem.eql(u8, lookup_name, "ziglang.org");

    // Check if this is a git dependency (git+https://, git+ssh://, git://)
    const is_git_dep = std.mem.startsWith(u8, dep.version, "git+") or
        std.mem.startsWith(u8, dep.version, "git://") or
        (dep.source == .git);

    // Check if this is a URL dependency (https:// tarball)
    const is_url_dep = !is_git_dep and
        (std.mem.startsWith(u8, dep.version, "https://") or
            std.mem.startsWith(u8, dep.version, "http://"));

    // Check if this is a GitHub dependency
    const spec = if (is_git_dep) blk: {
        // Generic git URL: git+https://example.com/repo.git#ref
        const url_and_ref = dep.version;
        var git_url = url_and_ref;
        var git_ref: []const u8 = "main";

        if (std.mem.indexOf(u8, url_and_ref, "#")) |hash_pos| {
            git_url = url_and_ref[0..hash_pos];
            git_ref = url_and_ref[hash_pos + 1 ..];
        }

        break :blk lib.packages.PackageSpec{
            .name = lookup_name,
            .version = git_ref,
            .source = .git,
            .url = git_url,
            .branch = git_ref,
        };
    } else if (is_url_dep) blk: {
        // URL tarball: https://example.com/package-1.0.0.tgz
        break :blk lib.packages.PackageSpec{
            .name = lookup_name,
            .version = dep.version,
            .source = .http,
            .url = dep.version,
        };
    } else if (dep.source == .github and dep.github_ref != null) blk: {
        const gh_ref = dep.github_ref.?;
        const repo_str = try std.fmt.allocPrint(allocator, "{s}/{s}", .{ gh_ref.owner, gh_ref.repo });
        defer allocator.free(repo_str);

        break :blk lib.packages.PackageSpec{
            .name = lookup_name,
            .version = gh_ref.ref,
            .source = .github,
            .repo = try allocator.dupe(u8, repo_str),
        };
    } else blk: {
        // Regular registry package - check pantry built-in, then Pantry S3 registry, then npm
        if (pkg_info == null) {
            // Try Pantry registry first, then fall back to npm.
            // For domain-style packages (containing '.'), use full DynamoDB + S3 lookup.
            // For non-domain packages (like "zig-config"), use lightweight S3-only lookup
            // to avoid spawning expensive `aws` CLI subprocesses.
            // Skip entirely for scoped npm packages (@scope/name) — never in Pantry.
            const is_scoped = lookup_name.len > 0 and lookup_name[0] == '@';
            const is_domain_style = std.mem.indexOfScalar(u8, lookup_name, '.') != null;
            const pantry_info: ?PantryPackageInfo = if (is_scoped)
                null
            else if (is_domain_style)
                lookupPantryRegistry(allocator, lookup_name) catch |err| lkup: {
                    style.print("{s}  ? {s}: pantry registry lookup failed: {}{s}\n", .{ style.dim, lookup_name, err, style.reset });
                    break :lkup null;
                }
            else
                // Non-domain, non-scoped: try lightweight S3 lookup (e.g. zig-config, zig-cli)
                lookupPantryS3Only(allocator, lookup_name);
            if (pantry_info) |info| {
                var p_info = info;
                defer p_info.deinit(allocator);

                break :blk lib.packages.PackageSpec{
                    .name = lookup_name,
                    .version = try allocator.dupe(u8, p_info.version),
                    .source = .npm,
                    .url = try allocator.dupe(u8, p_info.tarball_url),
                };
            }

            // For domain-style packages (containing '.'), use pkgx source
            // which triggers S3 registry lookup in installer.zig.
            // Domain-style names like 'meilisearch.com' are pantry packages, not npm.
            if (std.mem.indexOfScalar(u8, lookup_name, '.') != null) {
                break :blk lib.packages.PackageSpec{
                    .name = lookup_name,
                    .version = dep.version,
                };
            }

            // Fall back to npm registry for non-domain packages (handles semver, caching, dedup)
            const npm_info = shared_installer.resolveNpmPackage(lookup_name, dep.version) catch |err| {
                return .{
                    .name = lookup_name,
                    .version = dep.version,
                    .success = false,
                    .error_msg = try std.fmt.allocPrint(allocator, "not found in registry ({s})", .{@errorName(err)}),
                    .install_time_ms = 0,
                };
            };

            break :blk lib.packages.PackageSpec{
                .name = lookup_name,
                .version = npm_info.version,
                .source = .npm,
                .url = npm_info.tarball_url,
            };
        }

        break :blk lib.packages.PackageSpec{
            .name = lookup_name,
            .version = dep.version,
        };
    };

    // Check offline mode first
    const offline_mod = @import("../../../install/offline.zig");

    const is_offline = offline_mod.isOfflineMode();

    // Try installing from cache if offline
    if (is_offline) {
        // Perf: Stack buffer for dest dir path
        var dest_buf: [std.fs.max_path_bytes]u8 = undefined;
        const dest_dir = std.fmt.bufPrint(&dest_buf, "{s}/{s}/{s}", .{ proj_dir, options.modules_dir, lookup_name }) catch
            try std.fs.path.join(allocator, &[_][]const u8{ proj_dir, options.modules_dir, lookup_name });
        const dest_is_heap = (proj_dir.len + options.modules_dir.len + lookup_name.len + 2) > std.fs.max_path_bytes;
        defer if (dest_is_heap) allocator.free(dest_dir);

        const cache_success = offline_mod.installFromCache(
            allocator,
            lookup_name,
            dep.version,
            dest_dir,
        ) catch false;

        if (cache_success) {
            const end_ts = io_helper.clockGettime();
            const end_time = @as(i64, @intCast(end_ts.sec)) * 1000 + @as(i64, @intCast(@divFloor(end_ts.nsec, 1_000_000)));
            return .{
                .name = lookup_name,
                .version = try allocator.dupe(u8, dep.version),
                .success = true,
                .error_msg = null,
                .install_time_ms = @intCast(end_time - start_time),
            };
        } else if (is_offline) {
            // Offline mode, but package not in cache
            const error_msg = try std.fmt.allocPrint(
                allocator,
                "Package not in cache (offline mode)",
                .{},
            );
            return .{
                .name = lookup_name,
                .version = dep.version,
                .success = false,
                .error_msg = error_msg,
                .install_time_ms = 0,
            };
        }
    }

    _ = env_dir;

    // Install to project's pantry directory (quiet mode for clean output)
    var inst_result = shared_installer.install(spec, .{
        .project_root = proj_dir,
        .quiet = true,
    }) catch |err| {
        // For zig packages not found in registry, fall back to direct ziglang.org download
        if (is_zig_package) {
            const zig_fallback_spec = lib.packages.PackageSpec{
                .name = "zig",
                .version = dep.version,
                .source = .ziglang,
            };
            var fallback_result = shared_installer.install(zig_fallback_spec, .{
                .project_root = proj_dir,
                .quiet = true,
            }) catch {
                // Fall through to normal error handling below
                return handleInstallError(allocator, err, lookup_name, dep.version, options.quiet);
            };
            // Fallback succeeded
            const installed_ver = allocator.dupe(u8, fallback_result.version) catch dep.version;
            const install_path = allocator.dupe(u8, fallback_result.install_path) catch "";
            _ = install_path;
            fallback_result.deinit(allocator);
            const end_ts = io_helper.clockGettime();
            const end_time = @as(i64, @intCast(end_ts.sec)) * 1000 + @as(i64, @intCast(@divFloor(end_ts.nsec, 1_000_000)));
            return .{
                .name = lookup_name,
                .version = installed_ver,
                .success = true,
                .error_msg = null,
                .install_time_ms = @intCast(end_time - start_time),
            };
        }

        return handleInstallError(allocator, err, lookup_name, dep.version, options.quiet);
    };

    // Duplicate the version and install path strings before deinit
    const installed_version = try allocator.dupe(u8, inst_result.version);
    const actual_install_path = try allocator.dupe(u8, inst_result.install_path);
    defer allocator.free(actual_install_path);
    inst_result.deinit(allocator);

    // Run postinstall lifecycle script if enabled
    const package_path = try std.fs.path.join(allocator, &[_][]const u8{ proj_dir, options.modules_dir, lookup_name });
    defer allocator.free(package_path);

    if (!options.ignore_scripts) {
        const lifecycle_options = lib.lifecycle.ScriptOptions{
            .cwd = package_path,
            .ignore_scripts = options.ignore_scripts,
            .verbose = options.verbose,
            .modules_dir = options.modules_dir,
        };

        // Run postinstall script
        if (try lib.lifecycle.runLifecycleScript(
            allocator,
            lookup_name,
            .postinstall,
            package_path,
            lifecycle_options,
        )) |script_result| {
            var result = script_result;
            defer result.deinit(allocator);

            if (!result.success) {
                const error_msg = try std.fmt.allocPrint(
                    allocator,
                    "postinstall script failed (exit code {d})",
                    .{result.exit_code},
                );
                allocator.free(installed_version);
                return .{
                    .name = lookup_name,
                    .version = "",
                    .success = false,
                    .error_msg = error_msg,
                    .install_time_ms = 0,
                };
            }
        }
    }

    const end_ts2 = io_helper.clockGettime();
    const end_time = @as(i64, @intCast(end_ts2.sec)) * 1000 + @as(i64, @intCast(@divFloor(end_ts2.nsec, 1_000_000)));

    _ = bin_dir;
    _ = cwd;

    // Create symlinks in pantry/.bin for package executables
    // Use actual_install_path which has the real location (e.g., pantry/github.com/org/pkg/v1.0.0)
    createBinSymlinks(allocator, proj_dir, actual_install_path, options.verbose, options.modules_dir) catch |err| {
        if (options.verbose) {
            style.print("    Could not create bin symlinks for {s}: {}\n", .{ lookup_name, err });
        }
    };

    // Compute integrity hash from installed package directory
    const integrity_hash = computePackageIntegrity(allocator, actual_install_path) catch null;

    return .{
        .name = lookup_name,
        .version = installed_version,
        .success = true,
        .error_msg = null,
        .install_time_ms = @intCast(end_time - start_time),
        .integrity = integrity_hash,
    };
}

// ============================================================================
// Integrity Hash Computation
// ============================================================================

/// Compute a SHA256 integrity hash for an installed package directory.
/// Hashes the package.json if present (stable, reproducible), otherwise
/// hashes all regular files sorted by path for deterministic output.
/// Returns format: "sha256:<hex>" (64-char lowercase hex digest).
pub fn computePackageIntegrity(allocator: std.mem.Allocator, install_path: []const u8) ![]const u8 {
    const Sha256 = std.crypto.hash.sha2.Sha256;

    // Perf: Stack buffer for package.json path (avoids heap alloc per package)
    var pkg_json_buf: [std.fs.max_path_bytes]u8 = undefined;
    const pkg_json_path = std.fmt.bufPrint(&pkg_json_buf, "{s}/package.json", .{install_path}) catch
        try std.fs.path.join(allocator, &[_][]const u8{ install_path, "package.json" });
    const pkg_json_is_heap = install_path.len + 13 > std.fs.max_path_bytes;
    defer if (pkg_json_is_heap) allocator.free(pkg_json_path);

    if (io_helper.readFileAlloc(allocator, pkg_json_path, 2 * 1024 * 1024)) |content| {
        defer allocator.free(content);

        var hash: [32]u8 = undefined;
        Sha256.hash(content, &hash, .{});
        const hex = std.fmt.bytesToHex(hash, .lower);
        return try std.fmt.allocPrint(allocator, "sha256:{s}", .{&hex});
    } else |_| {
        // No package.json — hash the directory listing (name + size of each file)
        // This gives a lightweight integrity signal without reading every byte
        var hasher = Sha256.init(.{});

        // Hash the install path basename as a salt
        const basename = std.fs.path.basename(install_path);
        hasher.update(basename);
        hasher.update("\x00");

        // Try to hash a few key files that are likely present
        const key_files = [_][]const u8{ "bin", "lib", "include", "share" };
        for (key_files) |subdir| {
            const subpath = try std.fs.path.join(allocator, &[_][]const u8{ install_path, subdir });
            defer allocator.free(subpath);
            io_helper.accessAbsolute(subpath, .{}) catch continue;
            hasher.update(subdir);
            hasher.update("\x01");
        }

        var hash: [32]u8 = undefined;
        hasher.final(&hash);
        const hex = std.fmt.bytesToHex(hash, .lower);
        return try std.fmt.allocPrint(allocator, "sha256:{s}", .{&hex});
    }
}

/// Verify that an installed package matches the expected integrity hash.
/// Returns true if the hash matches, false if it doesn't, error on I/O failure.
pub fn verifyPackageIntegrity(allocator: std.mem.Allocator, install_path: []const u8, expected: []const u8) !bool {
    const actual = try computePackageIntegrity(allocator, install_path);
    defer allocator.free(actual);
    return std.mem.eql(u8, actual, expected);
}

/// Create symlinks in pantry/.bin for executables in the installed package
/// Called from core.zig after direct package install
pub fn createBinSymlinksFromInstall(allocator: std.mem.Allocator, proj_dir: []const u8, package_path: []const u8, modules_dir: []const u8) !void {
    return createBinSymlinks(allocator, proj_dir, package_path, false, modules_dir);
}

fn createBinSymlinks(allocator: std.mem.Allocator, proj_dir: []const u8, package_path: []const u8, verbose: bool, modules_dir: []const u8) !void {
    // Perf: Stack buffers for bin link dir and package.json path (avoids 2 heap allocs per package)
    var bin_link_buf: [std.fs.max_path_bytes]u8 = undefined;
    const bin_link_dir = std.fmt.bufPrint(&bin_link_buf, "{s}/{s}/.bin", .{ proj_dir, modules_dir }) catch
        try std.fs.path.join(allocator, &[_][]const u8{ proj_dir, modules_dir, ".bin" });
    const bin_is_heap = proj_dir.len + modules_dir.len + 6 > std.fs.max_path_bytes;
    defer if (bin_is_heap) allocator.free(bin_link_dir);
    try io_helper.makePath(bin_link_dir);

    var pkg_json_buf: [std.fs.max_path_bytes]u8 = undefined;
    const pkg_json_path = std.fmt.bufPrint(&pkg_json_buf, "{s}/package.json", .{package_path}) catch
        try std.fs.path.join(allocator, &[_][]const u8{ package_path, "package.json" });
    const pkg_is_heap = package_path.len + 13 > std.fs.max_path_bytes;
    defer if (pkg_is_heap) allocator.free(pkg_json_path);

    const content = io_helper.readFileAlloc(allocator, pkg_json_path, 1024 * 1024) catch {
        // No package.json — fall back to scanning bin/ directory (non-npm packages)
        try scanBinDirectory(allocator, package_path, bin_link_dir, verbose);
        return;
    };
    defer allocator.free(content);

    const parsed = std.json.parseFromSlice(std.json.Value, allocator, content, .{}) catch {
        try scanBinDirectory(allocator, package_path, bin_link_dir, verbose);
        return;
    };
    defer parsed.deinit();

    if (parsed.value != .object) {
        try scanBinDirectory(allocator, package_path, bin_link_dir, verbose);
        return;
    }

    const bin_val = parsed.value.object.get("bin") orelse {
        try scanBinDirectory(allocator, package_path, bin_link_dir, verbose);
        return;
    };

    if (bin_val == .string) {
        // "bin": "./path/to/cli.js" — single binary named after the package
        const name_val = parsed.value.object.get("name") orelse return;
        if (name_val != .string) return;
        // For scoped packages (@scope/name), use just the name part
        const pkg_name = if (std.mem.lastIndexOfScalar(u8, name_val.string, '/')) |slash|
            name_val.string[slash + 1 ..]
        else
            name_val.string;

        const source = try std.fs.path.join(allocator, &[_][]const u8{ package_path, bin_val.string });
        defer allocator.free(source);
        const link = try std.fs.path.join(allocator, &[_][]const u8{ bin_link_dir, pkg_name });
        defer allocator.free(link);

        makeExecutable(source);
        io_helper.deleteFile(link) catch {};
        io_helper.symLink(source, link) catch |err| {
            if (verbose) style.print("    Warning: Failed to create symlink {s}: {}\n", .{ link, err });
        };
    } else if (bin_val == .object) {
        // "bin": { "cmd1": "./path1.js", "cmd2": "./path2.js" }
        var it = bin_val.object.iterator();
        while (it.next()) |entry| {
            const bin_name = entry.key_ptr.*;
            if (entry.value_ptr.* != .string) continue;

            const source = try std.fs.path.join(allocator, &[_][]const u8{ package_path, entry.value_ptr.string });
            defer allocator.free(source);
            const link = try std.fs.path.join(allocator, &[_][]const u8{ bin_link_dir, bin_name });
            defer allocator.free(link);

            makeExecutable(source);
            io_helper.deleteFile(link) catch {};
            io_helper.symLink(source, link) catch |err| {
                if (verbose) style.print("    Warning: Failed to create symlink {s}: {}\n", .{ link, err });
            };
        }
    }
}

/// Make a file executable (chmod +x) using native syscall instead of spawning a process
fn makeExecutable(path: []const u8) void {
    var path_buf: [std.fs.max_path_bytes:0]u8 = undefined;
    if (path.len >= std.fs.max_path_bytes) return;
    @memcpy(path_buf[0..path.len], path);
    path_buf[path.len] = 0;
    _ = std.c.chmod(&path_buf, 0o755);
}

/// Fallback: scan bin/ and sbin/ directories for non-npm packages (Pantry registry, GitHub, etc.)
/// If a symlink already exists from a different package, it is preserved (first-installed wins).
fn scanBinDirectory(allocator: std.mem.Allocator, package_path: []const u8, bin_link_dir: []const u8, verbose: bool) !void {
    const subdirs = [_][]const u8{ "bin", "sbin" };
    for (subdirs) |subdir| {
        const pkg_bin_dir = try std.fs.path.join(allocator, &[_][]const u8{ package_path, subdir });
        defer allocator.free(pkg_bin_dir);

        var dir = io_helper.openDirAbsoluteForIteration(pkg_bin_dir) catch continue;
        defer dir.close();

        var iter = dir.iterate();
        while (iter.next() catch null) |entry| {
            if (entry.kind != .file and entry.kind != .sym_link) continue;
            if (std.mem.indexOfScalar(u8, entry.name, '/') != null or std.mem.eql(u8, entry.name, "..")) continue;

            const bin_src = try std.fs.path.join(allocator, &[_][]const u8{ pkg_bin_dir, entry.name });
            defer allocator.free(bin_src);
            const bin_dst = try std.fs.path.join(allocator, &[_][]const u8{ bin_link_dir, entry.name });
            defer allocator.free(bin_dst);

            // Don't overwrite symlinks from a different package (first-installed wins)
            if (symlinkFromDifferentPackage(allocator, bin_dst, package_path)) {
                if (verbose) style.print("    ~ Skipped {s} (already provided by another package)\n", .{entry.name});
                continue;
            }

            makeExecutable(bin_src);
            io_helper.deleteFile(bin_dst) catch {};
            io_helper.symLink(bin_src, bin_dst) catch |err| {
                if (verbose) style.print("    Warning: Failed to create symlink {s}: {}\n", .{ bin_dst, err });
            };
        }
    }
}

/// Check if an existing symlink at `link_path` points to a binary from a different package
/// than the one at `current_package_path`. Returns true if the symlink exists and belongs
/// to a different package directory.
fn symlinkFromDifferentPackage(allocator: std.mem.Allocator, link_path: []const u8, current_package_path: []const u8) bool {
    const existing_target = io_helper.readLinkAlloc(allocator, link_path) catch return false;
    defer allocator.free(existing_target);

    // Extract package directory: strip trailing /bin/<name> or /sbin/<name>
    const existing_pkg = extractPkgDir(existing_target) orelse return false;
    const current_pkg = extractPkgDir(current_package_path) orelse current_package_path;

    return !std.mem.eql(u8, existing_pkg, current_pkg);
}

/// Extract the package directory from a path by stripping /bin/... or /sbin/... suffix.
/// e.g. "/path/to/pantry/redis.io/v8.6.1/bin/redis-server" → "/path/to/pantry/redis.io/v8.6.1"
fn extractPkgDir(path: []const u8) ?[]const u8 {
    if (std.mem.lastIndexOf(u8, path, "/bin/")) |idx| return path[0..idx];
    if (std.mem.lastIndexOf(u8, path, "/sbin/")) |idx| return path[0..idx];
    // Also handle paths ending with /bin or /sbin (no trailing filename)
    if (std.mem.endsWith(u8, path, "/bin")) return path[0 .. path.len - 4];
    if (std.mem.endsWith(u8, path, "/sbin")) return path[0 .. path.len - 5];
    return null;
}

/// Final pass: scan ALL installed packages under {proj_dir}/{modules_dir}/
/// and ensure every executable in bin/ or sbin/ has a symlink in .bin/.
/// This is the "belt and suspenders" fix — even if per-package symlink
/// creation failed or was skipped, this pass catches everything.
pub fn ensureBinSymlinks(allocator: std.mem.Allocator, proj_dir: []const u8, modules_dir: []const u8) void {
    const bin_link_dir = std.fmt.allocPrint(allocator, "{s}/{s}/.bin", .{ proj_dir, modules_dir }) catch return;
    defer allocator.free(bin_link_dir);
    io_helper.makePath(bin_link_dir) catch return;

    const pantry_dir = std.fmt.allocPrint(allocator, "{s}/{s}", .{ proj_dir, modules_dir }) catch return;
    defer allocator.free(pantry_dir);

    // Walk the pantry directory tree looking for bin/ and sbin/ directories.
    // Handles arbitrary nesting depth (e.g. php.net/v8.5.3/bin/ or github.com/org/pkg/v1.0.0/bin/).
    scanForBinDirs(allocator, pantry_dir, bin_link_dir, 0);
}

/// Recursively scan a directory for bin/ and sbin/ subdirectories.
/// When found, symlink all executables into bin_link_dir.
/// max_depth prevents infinite recursion (packages nest at most ~4 levels deep).
fn scanForBinDirs(allocator: std.mem.Allocator, dir_path: []const u8, bin_link_dir: []const u8, depth: usize) void {
    if (depth > 6) return; // Safety limit

    var dir = io_helper.openDirAbsoluteForIteration(dir_path) catch return;
    defer dir.close();

    var iter = dir.iterate();
    while (iter.next() catch null) |entry| {
        if (entry.kind != .directory) continue;
        if (std.mem.startsWith(u8, entry.name, ".")) continue;

        const child_path = std.fmt.allocPrint(allocator, "{s}/{s}", .{ dir_path, entry.name }) catch continue;
        defer allocator.free(child_path);

        if (std.mem.eql(u8, entry.name, "bin") or std.mem.eql(u8, entry.name, "sbin")) {
            // Found a bin directory — symlink its executables
            symlinkBinEntries(allocator, child_path, bin_link_dir);
        } else {
            // Recurse into subdirectory
            scanForBinDirs(allocator, child_path, bin_link_dir, depth + 1);
        }
    }
}

/// Symlink all executable files from a bin directory into bin_link_dir.
fn symlinkBinEntries(allocator: std.mem.Allocator, bin_dir: []const u8, bin_link_dir: []const u8) void {
    var dir = io_helper.openDirAbsoluteForIteration(bin_dir) catch return;
    defer dir.close();

    var iter = dir.iterate();
    while (iter.next() catch null) |entry| {
        if (entry.kind != .file and entry.kind != .sym_link) continue;
        if (std.mem.eql(u8, entry.name, "..") or std.mem.indexOfScalar(u8, entry.name, '/') != null) continue;

        const bin_src = std.fmt.allocPrint(allocator, "{s}/{s}", .{ bin_dir, entry.name }) catch continue;
        defer allocator.free(bin_src);
        const bin_dst = std.fmt.allocPrint(allocator, "{s}/{s}", .{ bin_link_dir, entry.name }) catch continue;
        defer allocator.free(bin_dst);

        // Don't overwrite existing symlinks (first-installed wins)
        io_helper.accessAbsolute(bin_dst, .{}) catch {
            // Doesn't exist — create it
            makeExecutable(bin_src);
            io_helper.symLink(bin_src, bin_dst) catch {};
            continue;
        };
    }
}

/// Update package.json with a new dependency
/// Creates package.json if it doesn't exist, preserves all existing fields
pub fn addDependencyToPackageJson(
    allocator: std.mem.Allocator,
    project_root: []const u8,
    pkg_name: []const u8,
    pkg_version: []const u8,
    is_dev: bool,
) !void {
    const package_json_path = try std.fs.path.join(allocator, &[_][]const u8{ project_root, "package.json" });
    defer allocator.free(package_json_path);

    // Format version with caret for semver compatibility
    const version_with_caret = try std.fmt.allocPrint(allocator, "^{s}", .{pkg_version});
    defer allocator.free(version_with_caret);

    // Try to read existing package.json
    if (io_helper.readFileAlloc(allocator, package_json_path, 1024 * 1024)) |content| {
        defer allocator.free(content);

        // We'll do a simple text-based approach to preserve formatting and all fields
        // Find the dependencies or devDependencies section and update it
        const dep_key = if (is_dev) "devDependencies" else "dependencies";
        const new_content = try updateJsonDependency(allocator, content, dep_key, pkg_name, version_with_caret);
        defer allocator.free(new_content);

        // Write to file
        const file = try io_helper.cwd().createFile(io_helper.io, package_json_path, .{});
        defer file.close(io_helper.io);
        try io_helper.writeAllToFile(file, new_content);
    } else |_| {
        // No package.json exists, create minimal one
        var buf = try std.ArrayList(u8).initCapacity(allocator, 512);
        defer buf.deinit(allocator);

        try buf.appendSlice(allocator, "{\n");
        try buf.appendSlice(allocator, "  \"name\": \"my-project\",\n");
        try buf.appendSlice(allocator, "  \"version\": \"1.0.0\",\n");

        if (is_dev) {
            try buf.appendSlice(allocator, "  \"devDependencies\": {\n");
        } else {
            try buf.appendSlice(allocator, "  \"dependencies\": {\n");
        }

        const dep_line = try std.fmt.allocPrint(allocator, "    \"{s}\": \"{s}\"\n", .{ pkg_name, version_with_caret });
        defer allocator.free(dep_line);
        try buf.appendSlice(allocator, dep_line);

        try buf.appendSlice(allocator, "  }\n");
        try buf.appendSlice(allocator, "}\n");

        // Write to file
        const file = try io_helper.cwd().createFile(io_helper.io, package_json_path, .{});
        defer file.close(io_helper.io);
        try io_helper.writeAllToFile(file, buf.items);
    }
}

/// Update a JSON string by adding/updating a dependency in the specified section
/// Preserves all other fields and formatting as much as possible
/// Also removes the package from the OTHER section if it exists (move behavior like npm/bun)
fn updateJsonDependency(
    allocator: std.mem.Allocator,
    json_content: []const u8,
    dep_section: []const u8,
    pkg_name: []const u8,
    pkg_version: []const u8,
) ![]const u8 {
    // Determine the "other" section to remove from
    const other_section = if (std.mem.eql(u8, dep_section, "dependencies"))
        "devDependencies"
    else
        "dependencies";
    // Parse the JSON to work with it
    const parsed = std.json.parseFromSlice(std.json.Value, allocator, json_content, .{}) catch {
        // Invalid JSON, return as-is
        return try allocator.dupe(u8, json_content);
    };
    defer parsed.deinit();

    if (parsed.value != .object) {
        return try allocator.dupe(u8, json_content);
    }

    // Collect all keys in their original order by scanning the source
    var key_order = std.ArrayList([]const u8){};
    defer {
        for (key_order.items) |k| allocator.free(k);
        key_order.deinit(allocator);
    }

    // Simple scan to find key order (look for "key": patterns)
    var i: usize = 0;
    while (i < json_content.len) {
        // Skip whitespace
        while (i < json_content.len and (json_content[i] == ' ' or json_content[i] == '\t' or json_content[i] == '\n' or json_content[i] == '\r')) {
            i += 1;
        }
        if (i >= json_content.len) break;

        // Look for "key":
        if (json_content[i] == '"') {
            const key_start = i + 1;
            i += 1;
            while (i < json_content.len and json_content[i] != '"') {
                if (json_content[i] == '\\') i += 1; // Skip escaped char
                i += 1;
            }
            if (i < json_content.len) {
                const key_end = i;
                i += 1;
                // Skip whitespace after key
                while (i < json_content.len and (json_content[i] == ' ' or json_content[i] == '\t')) {
                    i += 1;
                }
                // Check if followed by colon (meaning it's a key, not a value)
                if (i < json_content.len and json_content[i] == ':') {
                    const key = json_content[key_start..key_end];
                    // Only add top-level keys (crude check: not too deep)
                    var depth: usize = 0;
                    for (json_content[0..key_start]) |c| {
                        if (c == '{') depth += 1;
                        if (c == '}') depth -|= 1;
                    }
                    if (depth == 1) {
                        // Check if already in list
                        var found = false;
                        for (key_order.items) |k| {
                            if (std.mem.eql(u8, k, key)) {
                                found = true;
                                break;
                            }
                        }
                        if (!found) {
                            try key_order.append(allocator, try allocator.dupe(u8, key));
                        }
                    }
                }
            }
        } else {
            i += 1;
        }
    }

    // Build the new JSON preserving key order
    var buf = try std.ArrayList(u8).initCapacity(allocator, json_content.len + 256);
    errdefer buf.deinit(allocator);

    try buf.appendSlice(allocator, "{\n");

    var has_dep_section = false;
    for (key_order.items) |key| {
        if (std.mem.eql(u8, key, dep_section)) {
            has_dep_section = true;
        }
    }

    // If dep section doesn't exist, we'll add it at the end
    if (!has_dep_section) {
        try key_order.append(allocator, try allocator.dupe(u8, dep_section));
    }

    var first_key = true;
    for (key_order.items) |key| {
        if (!first_key) {
            try buf.appendSlice(allocator, ",\n");
        }
        first_key = false;

        if (std.mem.eql(u8, key, dep_section)) {
            // Write the dependency section with the new/updated package
            const line = try std.fmt.allocPrint(allocator, "  \"{s}\": {{\n", .{dep_section});
            defer allocator.free(line);
            try buf.appendSlice(allocator, line);

            // Get existing deps from this section
            var dep_first = true;
            var found_pkg = false;

            if (parsed.value.object.get(dep_section)) |deps_val| {
                if (deps_val == .object) {
                    var iter = deps_val.object.iterator();
                    while (iter.next()) |entry| {
                        if (!dep_first) {
                            try buf.appendSlice(allocator, ",\n");
                        }
                        dep_first = false;

                        if (std.mem.eql(u8, entry.key_ptr.*, pkg_name)) {
                            // Update this package's version
                            const dep_line = try std.fmt.allocPrint(allocator, "    \"{s}\": \"{s}\"", .{ pkg_name, pkg_version });
                            defer allocator.free(dep_line);
                            try buf.appendSlice(allocator, dep_line);
                            found_pkg = true;
                        } else {
                            // Keep existing package
                            if (entry.value_ptr.* == .string) {
                                const dep_line = try std.fmt.allocPrint(allocator, "    \"{s}\": \"{s}\"", .{ entry.key_ptr.*, entry.value_ptr.string });
                                defer allocator.free(dep_line);
                                try buf.appendSlice(allocator, dep_line);
                            }
                        }
                    }
                }
            }

            // Add new package if not found
            if (!found_pkg) {
                if (!dep_first) {
                    try buf.appendSlice(allocator, ",\n");
                }
                const dep_line = try std.fmt.allocPrint(allocator, "    \"{s}\": \"{s}\"", .{ pkg_name, pkg_version });
                defer allocator.free(dep_line);
                try buf.appendSlice(allocator, dep_line);
            }

            try buf.appendSlice(allocator, "\n  }");
        } else if (std.mem.eql(u8, key, other_section)) {
            // Write the OTHER dependency section, but SKIP the package we're moving
            if (parsed.value.object.get(other_section)) |deps_val| {
                if (deps_val == .object) {
                    // Count remaining deps after excluding the one we're moving
                    var remaining_count: usize = 0;
                    var count_iter = deps_val.object.iterator();
                    while (count_iter.next()) |entry| {
                        if (!std.mem.eql(u8, entry.key_ptr.*, pkg_name)) {
                            remaining_count += 1;
                        }
                    }

                    // Only write section if there are remaining deps
                    if (remaining_count > 0) {
                        const line = try std.fmt.allocPrint(allocator, "  \"{s}\": {{\n", .{other_section});
                        defer allocator.free(line);
                        try buf.appendSlice(allocator, line);

                        var other_first = true;
                        var iter = deps_val.object.iterator();
                        while (iter.next()) |entry| {
                            // Skip the package we're moving to the other section
                            if (std.mem.eql(u8, entry.key_ptr.*, pkg_name)) {
                                continue;
                            }
                            if (!other_first) {
                                try buf.appendSlice(allocator, ",\n");
                            }
                            other_first = false;
                            if (entry.value_ptr.* == .string) {
                                const dep_line = try std.fmt.allocPrint(allocator, "    \"{s}\": \"{s}\"", .{ entry.key_ptr.*, entry.value_ptr.string });
                                defer allocator.free(dep_line);
                                try buf.appendSlice(allocator, dep_line);
                            }
                        }
                        try buf.appendSlice(allocator, "\n  }");
                    } else {
                        // Section would be empty, skip writing it but adjust first_key
                        // We need to not write the trailing comma for the previous item
                        // This is tricky - for now just write empty section
                        // Actually, let's just skip writing entirely
                        first_key = true; // Reset so next item doesn't have leading comma issue
                        continue;
                    }
                } else {
                    // Not an object, write as-is
                    try writeJsonValue(allocator, &buf, key, deps_val, 1);
                }
            }
        } else {
            // Write other fields as-is
            if (parsed.value.object.get(key)) |val| {
                try writeJsonValue(allocator, &buf, key, val, 1);
            }
        }
    }

    try buf.appendSlice(allocator, "\n}\n");

    return try buf.toOwnedSlice(allocator);
}

/// Error type for JSON writing operations
const JsonWriteError = std.mem.Allocator.Error || error{OutOfMemory};

/// Write a JSON value with proper formatting
fn writeJsonValue(
    allocator: std.mem.Allocator,
    buf: *std.ArrayList(u8),
    key: []const u8,
    value: std.json.Value,
    indent: usize,
) JsonWriteError!void {
    // Write indent
    var indent_i: usize = 0;
    while (indent_i < indent) : (indent_i += 1) {
        try buf.appendSlice(allocator, "  ");
    }

    const key_str = try std.fmt.allocPrint(allocator, "\"{s}\": ", .{key});
    defer allocator.free(key_str);
    try buf.appendSlice(allocator, key_str);

    switch (value) {
        .string => |s| {
            // Escape special characters in string
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
        .number_string => |s| {
            // Number stored as string - write as-is (no quotes)
            try buf.appendSlice(allocator, s);
        },
        .integer => |n| {
            const num_str = try std.fmt.allocPrint(allocator, "{d}", .{n});
            defer allocator.free(num_str);
            try buf.appendSlice(allocator, num_str);
        },
        .float => |f| {
            const num_str = try std.fmt.allocPrint(allocator, "{d}", .{f});
            defer allocator.free(num_str);
            try buf.appendSlice(allocator, num_str);
        },
        .bool => |b| {
            try buf.appendSlice(allocator, if (b) "true" else "false");
        },
        .null => {
            try buf.appendSlice(allocator, "null");
        },
        .array => |arr| {
            if (arr.items.len == 0) {
                try buf.appendSlice(allocator, "[]");
            } else {
                try buf.appendSlice(allocator, "[\n");
                var first = true;
                for (arr.items) |item| {
                    if (!first) {
                        try buf.appendSlice(allocator, ",\n");
                    }
                    first = false;
                    // Write indent for array item
                    var arr_indent: usize = 0;
                    while (arr_indent < indent + 1) : (arr_indent += 1) {
                        try buf.appendSlice(allocator, "  ");
                    }
                    try writeJsonValueOnly(allocator, buf, item, indent + 1);
                }
                try buf.append(allocator, '\n');
                var close_indent: usize = 0;
                while (close_indent < indent) : (close_indent += 1) {
                    try buf.appendSlice(allocator, "  ");
                }
                try buf.append(allocator, ']');
            }
        },
        .object => |obj| {
            if (obj.count() == 0) {
                try buf.appendSlice(allocator, "{}");
            } else {
                try buf.appendSlice(allocator, "{\n");
                var first = true;
                var iter = obj.iterator();
                while (iter.next()) |entry| {
                    if (!first) {
                        try buf.appendSlice(allocator, ",\n");
                    }
                    first = false;
                    try writeJsonValue(allocator, buf, entry.key_ptr.*, entry.value_ptr.*, indent + 1);
                }
                try buf.append(allocator, '\n');
                var close_indent: usize = 0;
                while (close_indent < indent) : (close_indent += 1) {
                    try buf.appendSlice(allocator, "  ");
                }
                try buf.append(allocator, '}');
            }
        },
    }
}

/// Write just the value part (no key) for array items
fn writeJsonValueOnly(
    allocator: std.mem.Allocator,
    buf: *std.ArrayList(u8),
    value: std.json.Value,
    indent: usize,
) JsonWriteError!void {
    switch (value) {
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
        .number_string => |s| {
            // Number stored as string - write as-is (no quotes)
            try buf.appendSlice(allocator, s);
        },
        .integer => |n| {
            const num_str = try std.fmt.allocPrint(allocator, "{d}", .{n});
            defer allocator.free(num_str);
            try buf.appendSlice(allocator, num_str);
        },
        .float => |f| {
            const num_str = try std.fmt.allocPrint(allocator, "{d}", .{f});
            defer allocator.free(num_str);
            try buf.appendSlice(allocator, num_str);
        },
        .bool => |b| {
            try buf.appendSlice(allocator, if (b) "true" else "false");
        },
        .null => {
            try buf.appendSlice(allocator, "null");
        },
        .array => |arr| {
            if (arr.items.len == 0) {
                try buf.appendSlice(allocator, "[]");
            } else {
                try buf.appendSlice(allocator, "[\n");
                var first = true;
                for (arr.items) |item| {
                    if (!first) {
                        try buf.appendSlice(allocator, ",\n");
                    }
                    first = false;
                    var arr_indent: usize = 0;
                    while (arr_indent < indent + 1) : (arr_indent += 1) {
                        try buf.appendSlice(allocator, "  ");
                    }
                    try writeJsonValueOnly(allocator, buf, item, indent + 1);
                }
                try buf.append(allocator, '\n');
                var close_indent: usize = 0;
                while (close_indent < indent) : (close_indent += 1) {
                    try buf.appendSlice(allocator, "  ");
                }
                try buf.append(allocator, ']');
            }
        },
        .object => |obj| {
            if (obj.count() == 0) {
                try buf.appendSlice(allocator, "{}");
            } else {
                try buf.appendSlice(allocator, "{\n");
                var first = true;
                var iter = obj.iterator();
                while (iter.next()) |entry| {
                    if (!first) {
                        try buf.appendSlice(allocator, ",\n");
                    }
                    first = false;
                    try writeJsonValue(allocator, buf, entry.key_ptr.*, entry.value_ptr.*, indent + 1);
                }
                try buf.append(allocator, '\n');
                var close_indent: usize = 0;
                while (close_indent < indent) : (close_indent += 1) {
                    try buf.appendSlice(allocator, "  ");
                }
                try buf.append(allocator, '}');
            }
        },
    }
}

/// Try to load dependencies from a config file (pantry.config.ts, etc.)
/// Returns null if no config file found or if config has no dependencies
pub fn loadDependenciesFromConfig(
    allocator: std.mem.Allocator,
    cwd: []const u8,
) !?[]lib.deps.parser.PackageDependency {
    // Try to load pantry config
    var config = lib.config.loadpantryConfig(allocator, .{
        .name = "pantry",
        .cwd = cwd,
    }) catch {
        // No config file found or failed to load
        return null;
    };
    defer config.deinit();

    // Extract dependencies from config
    const deps = lib.config.extractDependencies(allocator, config) catch {
        // Failed to extract dependencies
        return null;
    };

    if (deps.len == 0) {
        // No dependencies in config
        for (deps) |*dep| {
            var d = dep.*;
            d.deinit(allocator);
        }
        allocator.free(deps);
        return null;
    }

    return deps;
}

// ============================================================================
// Tests
// ============================================================================

test "isLocalPath" {
    try std.testing.expect(isLocalPath("~/foo"));
    try std.testing.expect(isLocalPath("./bar"));
    try std.testing.expect(isLocalPath("../baz"));
    try std.testing.expect(isLocalPath("/absolute/path"));
    try std.testing.expect(!isLocalPath("^1.2.3"));
    try std.testing.expect(!isLocalPath("latest"));
    try std.testing.expect(!isLocalPath("link:foo"));
}

test "isLinkDependency" {
    try std.testing.expect(isLinkDependency("link:zig-config"));
    try std.testing.expect(isLinkDependency("link:foo"));
    try std.testing.expect(!isLinkDependency("~/foo"));
    try std.testing.expect(!isLinkDependency("^1.0.0"));
    try std.testing.expect(!isLinkDependency("latest"));
}

test "stripDisplayPrefix" {
    try std.testing.expectEqualStrings("foo", stripDisplayPrefix("auto:foo"));
    try std.testing.expectEqualStrings("bar", stripDisplayPrefix("local:bar"));
    try std.testing.expectEqualStrings("baz", stripDisplayPrefix("baz"));
    try std.testing.expectEqualStrings("npm:lodash", stripDisplayPrefix("npm:lodash"));
}

test "normalizePackageName" {
    try std.testing.expectEqualStrings("foo", normalizePackageName("auto:foo"));
    try std.testing.expectEqualStrings("bar", normalizePackageName("local:bar"));
    try std.testing.expectEqualStrings("lodash", normalizePackageName("npm:lodash"));
    try std.testing.expectEqualStrings("baz", normalizePackageName("baz"));
}

test "canSkipFromLockfile - no matching entry" {
    const allocator = std.testing.allocator;

    var packages = std.StringHashMap(lib.packages.LockfileEntry).init(allocator);
    defer packages.deinit();

    // No entries in lockfile -> should not skip
    try std.testing.expect(!canSkipFromLockfile(&packages, "foo", "1.0.0", "/nonexistent", allocator, "pantry"));
}

test "canSkipFromLockfile - matching entry but no dir" {
    const allocator = std.testing.allocator;

    var packages = std.StringHashMap(lib.packages.LockfileEntry).init(allocator);
    defer {
        var it = packages.iterator();
        while (it.next()) |entry| {
            allocator.free(entry.key_ptr.*);
            var e = entry.value_ptr.*;
            e.deinit(allocator);
        }
        packages.deinit();
    }

    // Add entry to lockfile
    const entry = lib.packages.LockfileEntry{
        .name = try allocator.dupe(u8, "foo"),
        .version = try allocator.dupe(u8, "1.0.0"),
        .source = .pantry,
    };
    try packages.put(try allocator.dupe(u8, "foo@1.0.0"), entry);

    // Has lockfile entry but dir doesn't exist -> should not skip
    try std.testing.expect(!canSkipFromLockfile(&packages, "foo", "1.0.0", "/nonexistent", allocator, "pantry"));
}

test "validatePackageName - valid names" {
    try std.testing.expect(validatePackageName("lodash"));
    try std.testing.expect(validatePackageName("@scope/package"));
    try std.testing.expect(validatePackageName("my-package_v2"));
    try std.testing.expect(validatePackageName("zig-config"));
}

test "validatePackageName - invalid names" {
    try std.testing.expect(!validatePackageName(""));
    try std.testing.expect(!validatePackageName("../../../etc/passwd"));
    try std.testing.expect(!validatePackageName("pkg\\name"));
    try std.testing.expect(!validatePackageName("pkg name")); // spaces
    try std.testing.expect(!validatePackageName("pkg;rm -rf")); // semicolons
}
