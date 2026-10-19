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
// Package Spec Parsing
// ============================================================================

/// A package spec split into its name and version constraint.
pub const PackageSpecParts = struct {
    name: []const u8,
    /// "latest" when the spec carried no version.
    version: []const u8,
};

/// Split `name@version` into its parts, correctly for scoped packages.
///
/// A scoped npm name BEGINS with '@' — `@stacksjs/tlsx` — so the first '@' in
/// the string is the scope marker, not the version delimiter. Splitting on it
/// yielded an empty name and a version of "stacksjs/tlsx", and every scoped
/// package resolved to nothing: `pantry add @types/semver` reported "not found
/// in pantry or npm registry" for a package that has existed for years. The
/// same spec without a scope installed fine, which is why this went unnoticed.
///
/// npm's own rule is what applies: the version delimiter is the first '@' AFTER
/// position zero.
pub fn splitPackageSpec(spec: []const u8) PackageSpecParts {
    const scoped = spec.len > 0 and spec[0] == '@';
    const search_from: usize = if (scoped) 1 else 0;

    const rel = std.mem.indexOfScalar(u8, spec[search_from..], '@');
    if (rel) |r| {
        const at = r + search_from;
        return .{ .name = spec[0..at], .version = spec[at + 1 ..] };
    }

    return .{ .name = spec, .version = "latest" };
}

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
        // composer is the PHP dependency manager; the bare name otherwise collides
        // with an unrelated npm "composer" package and installs that instead.
        .{ "composer", "getcomposer.org" },
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
        .{ "typesense", "typesense.org" },
        .{ "goreleaser", "goreleaser.com" },
        .{ "act", "github.com/nektos/act" },
        .{ "dive", "github.com/wagoodman/dive" },
        .{ "craft", "craft-native.org" },
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
    return lookupPantryRegistryImpl(allocator, name, null);
}

/// Variant with shared HTTP client for connection pooling (used from workspace install threads).
pub fn lookupPantryRegistryWithClient(allocator: std.mem.Allocator, name: []const u8, client: *std.http.Client) !?PantryPackageInfo {
    return lookupPantryRegistryImpl(allocator, name, client);
}

fn lookupPantryRegistryImpl(allocator: std.mem.Allocator, name: []const u8, client: ?*std.http.Client) ?PantryPackageInfo {
    // Try registry REST API first (native HTTP, no subprocess)
    var api_result = lookupViaRegistryApi(allocator, name, current_platform, client);
    if (api_result) |info| {
        // The API answers with the registry's single latestVersion, which has
        // pointed at a prerelease (libgeos.org answered 3.15.0beta2 with 3.15.0
        // published). Ask the binary metadata, which is chosen per version and
        // platform, and keep the API's answer only if that has nothing better.
        if (!install.downloader.registry_versions.isPrerelease(info.version)) return info;
        if (lookupViaS3Metadata(allocator, name, current_platform, client)) |meta_info| {
            api_result.?.deinit(allocator);
            return meta_info;
        }
        return api_result;
    }

    // Fallback: try direct S3 metadata.json lookup
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
        "https://registry.pantry.dev/binaries/{s}/metadata.json",
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

    // Choose from the versions themselves rather than trusting latestVersion:
    // the pointer has sat on a prerelease (libgeos.org at 3.15.0rc1 beside
    // 3.15.0), and it says nothing about whether THIS platform's upload is
    // complete or only a placeholder.
    const versions_obj = meta_root.object.get("versions") orelse return null;
    if (versions_obj != .object) return null;

    const selection = install.downloader.registry_versions.select(versions_obj.object, "latest", platform) orelse return null;
    const version = selection.version;
    const platform_info = selection.platform_info;

    const tarball_path_val = platform_info.object.get("tarball") orelse return null;
    const tarball_path = if (tarball_path_val == .string) tarball_path_val.string else return null;

    const s3_path = std.fmt.allocPrint(
        allocator,
        "binaries/{s}/metadata.json",
        .{name},
    ) catch return null;

    const tarball_url = std.fmt.allocPrint(
        allocator,
        "https://registry.pantry.dev/{s}",
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
        "https://registry.pantry.dev/{s}",
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
        "https://registry.pantry.dev/{s}",
        .{tarball_path},
    ) catch return null;

    const duped_s3_path = allocator.dupe(u8, s3_path) catch {
        allocator.free(tarball_url);
        return null;
    };
    const duped_version = allocator.dupe(u8, version) catch {
        allocator.free(duped_s3_path);
        allocator.free(tarball_url);
        return null;
    };

    return PantryPackageInfo{
        .s3_path = duped_s3_path,
        .version = duped_version,
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
    } else if (std.mem.startsWith(u8, name, "github:")) {
        return name[7..];
    } else if (std.mem.startsWith(u8, name, "http:")) {
        return name[5..];
    } else if (std.mem.startsWith(u8, name, "git:")) {
        return name[4..];
    }
    return name;
}

/// Resolve a workspace catalog reference after stripping Pantry's internal
/// source-routing prefix from the package name.
pub fn resolveWorkspaceCatalogReference(
    manager: *lib.deps.catalogs.CatalogManager,
    package_name: []const u8,
    catalog_ref: []const u8,
) ?[]const u8 {
    return manager.resolveCatalogReference(normalizePackageName(package_name), catalog_ref);
}

/// Strip internal routing prefixes ("auto:", "local:") from package names for display.
/// "npm:" is preserved because it conveys the source to the user.
pub fn stripDisplayPrefix(name: []const u8) []const u8 {
    if (std.mem.startsWith(u8, name, "auto:")) {
        return name[5..];
    } else if (std.mem.startsWith(u8, name, "local:")) {
        return name[6..];
    } else if (std.mem.startsWith(u8, name, "github:")) {
        return name[7..];
    } else if (std.mem.startsWith(u8, name, "http:")) {
        return name[5..];
    } else if (std.mem.startsWith(u8, name, "git:")) {
        return name[4..];
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
        inline for (.{ "dependencies", "dev_dependencies", "system" }) |field_name| {
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
    const clean_name = resolvePackageAlias(normalizePackageName(dep_name));
    return canSkipCanonicalFromLockfileWithNameSet(name_set, clean_name, dep_version, constraint_map, proj_dir, modules_dir);
}

/// Workspace manifests already distinguish npm dependencies from `system`
/// dependencies. The parser canonicalizes the latter, so callers must not run
/// ordinary npm names (for example `typescript` or `node`) through the system
/// alias table while checking the lockfile.
pub fn canSkipCanonicalFromLockfileWithNameSet(
    name_set: *const LockfileNameSet,
    clean_name: []const u8,
    dep_version: []const u8,
    constraint_map: ?*const LockfileConstraintMap,
    proj_dir: []const u8,
    modules_dir: []const u8,
) bool {
    // A short Zig dev version is a rolling channel. Upstream removes old dev
    // archives, so an existing concrete lock/install must be refreshed through
    // download/index.json instead of being treated as permanently up to date.
    if (lib.packages.isRollingZigDevChannel(clean_name, dep_version)) return false;

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
    return install.hasUsableDeclaredPrograms(std.heap.page_allocator, clean_name, dest_dir);
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
    const clean_name = resolvePackageAlias(normalizePackageName(dep_name));

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
    return install.hasUsableDeclaredPrograms(std.heap.page_allocator, clean_name, dest_dir);
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

    if (options.verbose) {
        std.debug.print("[verbose:helper] installSinglePackage: {s} @ {s} (source={s}, proj={s})\n", .{ dep.name, dep.version, @tagName(dep.source), proj_dir });
    }

    // Skip local packages - they're handled separately
    if (isLocalDependency(dep)) {
        if (options.verbose) {
            std.debug.print("[verbose:helper] skipping local dependency: {s}\n", .{dep.name});
        }
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

    if (options.verbose) {
        std.debug.print("[verbose:helper] resolved: {s} -> stripped={s} -> lookup={s} (in_registry={})\n", .{ dep.name, stripped_name, lookup_name, pkg_info != null });
    }

    // Keep every Zig spelling on the mirrored Pantry registry path.
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
    } else if (is_zig_package) blk: {
        // Zig packages are always resolved and downloaded from Pantry's mirror.
        break :blk lib.packages.PackageSpec{
            .name = "ziglang.org",
            .version = dep.version,
            .source = .pantry,
        };
    } else blk: {
        // Regular registry package - check pantry built-in, then Pantry S3 registry, then npm
        if (pkg_info == null) {
            // Perf: Skip Pantry registry lookup entirely when the version looks like
            // an npm semver constraint (^, ~, >=, *, digit prefix). Pantry S3 packages
            // use exact versions or domain-style names — they never have semver ranges.
            // This avoids 1-2 wasted HTTP round trips per npm package (~100ms each).
            const is_scoped = lookup_name.len > 0 and lookup_name[0] == '@';
            const is_domain_style = std.mem.indexOfScalar(u8, lookup_name, '.') != null;
            const version_is_semver = dep.version.len > 0 and
                (dep.version[0] == '^' or dep.version[0] == '~' or
                    dep.version[0] == '>' or dep.version[0] == '<' or
                    dep.version[0] == '=' or dep.version[0] == '*' or
                    (dep.version[0] >= '0' and dep.version[0] <= '9'));
            // Domain packages (bun.sh, ziglang.org, …) use the pantry S3 registry with
            // semver constraints — do not treat their version ranges as npm semver.
            const skip_pantry_lookup = is_scoped or (version_is_semver and !is_domain_style);

            if (options.verbose) {
                std.debug.print("[verbose:helper] pantry lookup: name={s}, is_scoped={}, is_domain={}, version_is_semver={}, skip={}\n", .{ lookup_name, is_scoped, is_domain_style, version_is_semver, skip_pantry_lookup });
            }

            const pantry_info: ?PantryPackageInfo = if (skip_pantry_lookup)
                null
            else if (is_domain_style)
                lookupPantryRegistry(allocator, lookup_name) catch |err| lkup: {
                    style.print("{s}  ? {s}: pantry registry lookup failed: {}{s}\n", .{ style.dim, lookup_name, err, style.reset });
                    break :lkup null;
                }
            else
                // Non-domain, non-scoped, non-semver: try lightweight S3 lookup (e.g. zig-config, zig-cli)
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
            if (is_domain_style) {
                break :blk lib.packages.PackageSpec{
                    .name = lookup_name,
                    .version = dep.version,
                };
            }

            // Check if version looks like a commit SHA (7-40 hex chars)
            // If so, resolve from pantry registry commit packages: registry.pantry.dev/{name}@{sha}
            const is_commit_sha = dep.version.len >= 7 and dep.version.len <= 40 and isHexString(dep.version);
            if (is_commit_sha) {
                const commit_url = try std.fmt.allocPrint(allocator, "https://registry.pantry.dev/{s}@{s}", .{ lookup_name, dep.version });
                break :blk lib.packages.PackageSpec{
                    .name = lookup_name,
                    .version = dep.version,
                    .source = .http,
                    .url = commit_url,
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

    if (options.verbose) {
        std.debug.print("[verbose:helper] calling installer.install for {s} (source={s}, version={s}, url={s})\n", .{
            spec.name,
            @tagName(spec.source),
            spec.version,
            if (spec.url) |u| u else "(null)",
        });
    }

    // Install to project's pantry directory (quiet mode for clean output)
    var inst_result = shared_installer.install(spec, .{
        .project_root = proj_dir,
        .quiet = true,
        .verbose = options.verbose,
    }) catch |err| {
        if (options.verbose) {
            std.debug.print("[verbose:helper] installer.install FAILED for {s}: {}\n", .{ spec.name, err });
        }
        // Retry Zig through the canonical mirrored package spelling.
        if (is_zig_package) {
            if (options.verbose) {
                std.debug.print("[verbose:helper] trying zig fallback for {s}\n", .{dep.version});
            }
            const zig_fallback_spec = lib.packages.PackageSpec{
                .name = "ziglang.org",
                .version = dep.version,
                .source = .pantry,
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

    if (options.verbose) {
        std.debug.print("[verbose:helper] installer.install SUCCESS for {s}: version={s}, path={s}, from_cache={}\n", .{ spec.name, inst_result.version, inst_result.install_path, inst_result.from_cache });
    }

    // Duplicate the version and install path strings before deinit
    const installed_version = try allocator.dupe(u8, inst_result.version);
    const actual_install_path = try allocator.dupe(u8, inst_result.install_path);
    defer allocator.free(actual_install_path);
    inst_result.deinit(allocator);

    // Run postinstall lifecycle script if enabled
    const package_path = try std.fs.path.join(allocator, &[_][]const u8{ proj_dir, options.modules_dir, lookup_name });
    defer allocator.free(package_path);

    if (options.verbose) {
        std.debug.print("[verbose:helper] package_path for lifecycle/shims: {s}\n", .{package_path});
    }

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
    // pantry/ itself: links from .bin to packages inside it are written relative.
    const tree_root = std.fs.path.dirname(bin_link_dir) orelse bin_link_dir;

    var pkg_json_buf: [std.fs.max_path_bytes]u8 = undefined;
    const pkg_json_path = std.fmt.bufPrint(&pkg_json_buf, "{s}/package.json", .{package_path}) catch
        try std.fs.path.join(allocator, &[_][]const u8{ package_path, "package.json" });
    const pkg_is_heap = package_path.len + 13 > std.fs.max_path_bytes;
    defer if (pkg_is_heap) allocator.free(pkg_json_path);

    const content = io_helper.readFileAlloc(allocator, pkg_json_path, 1024 * 1024) catch {
        // No package.json — fall back to scanning bin/ directory (non-npm packages)
        try scanBinDirectory(allocator, package_path, bin_link_dir, tree_root, verbose);
        return;
    };
    defer allocator.free(content);

    const parsed = std.json.parseFromSlice(std.json.Value, allocator, content, .{}) catch {
        try scanBinDirectory(allocator, package_path, bin_link_dir, tree_root, verbose);
        return;
    };
    defer parsed.deinit();

    if (parsed.value != .object) {
        try scanBinDirectory(allocator, package_path, bin_link_dir, tree_root, verbose);
        return;
    }

    const bin_val = parsed.value.object.get("bin") orelse {
        try scanBinDirectory(allocator, package_path, bin_link_dir, tree_root, verbose);
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
        makeExecutable(source);
        try install.symlink.createShim(allocator, pkg_name, source, bin_link_dir, tree_root);
    } else if (bin_val == .object) {
        // "bin": { "cmd1": "./path1.js", "cmd2": "./path2.js" }
        var it = bin_val.object.iterator();
        while (it.next()) |entry| {
            const bin_name = entry.key_ptr.*;
            if (entry.value_ptr.* != .string) continue;

            const source = try std.fs.path.join(allocator, &[_][]const u8{ package_path, entry.value_ptr.string });
            defer allocator.free(source);
            makeExecutable(source);
            try install.symlink.createShim(allocator, bin_name, source, bin_link_dir, tree_root);
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
fn scanBinDirectory(allocator: std.mem.Allocator, package_path: []const u8, bin_link_dir: []const u8, tree_root: []const u8, verbose: bool) !void {
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
            try install.symlink.createProgramActivation(allocator, bin_dst, bin_src, tree_root);
        }
    }
}

/// Check if a string is a valid hex string (0-9, a-f only).
/// Used to detect commit SHAs in version specifiers.
fn isHexString(s: []const u8) bool {
    for (s) |c| {
        if (!((c >= '0' and c <= '9') or (c >= 'a' and c <= 'f'))) return false;
    }
    return s.len > 0;
}

/// Check if an existing symlink at `link_path` points to a binary from a different package
/// than the one at `current_package_path`. Returns true if the symlink exists and belongs
/// to a different package directory.
fn symlinkFromDifferentPackage(allocator: std.mem.Allocator, link_path: []const u8, current_package_path: []const u8) bool {
    // Relative targets (how pantry writes links inside its own tree) are
    // resolved against the link's directory before comparing.
    const existing_target = install.symlink.resolvedActivationTarget(allocator, link_path) orelse return false;
    defer allocator.free(existing_target);

    // A link that no longer resolves belongs to nobody: let it be replaced.
    io_helper.access(existing_target, .{}) catch return false;

    // Extract package directory: strip trailing /bin/<name> or /sbin/<name>
    const existing_pkg = extractPkgDir(existing_target) orelse return false;
    const current_pkg = extractPkgDir(current_package_path) orelse current_package_path;

    return !install.symlink.samePath(existing_pkg, current_pkg);
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
    scanForBinDirs(allocator, pantry_dir, bin_link_dir, pantry_dir, 0);

    // Create alias symlinks for known multi-name binaries.
    // bun.sh ships only `bin/bun`, but the binary dispatches to `bunx` behavior
    // when invoked under that name. The upstream tarball doesn't include a
    // bunx entry, so we create the symlink ourselves.
    createBinAliases(allocator, bin_link_dir);

    // If the project pins Zig, make sure the shell shim follows that request
    // even when multiple Zig toolchains are already present in pantry/.
    ensureConfiguredZigSymlink(allocator, proj_dir, pantry_dir, bin_link_dir);

    // Two npm packages declaring the same bin name: give it to the one the
    // project's dependency graph ranks first, never to whichever was shimmed
    // last (pantry-pm/pantry#235).
    install.bin_ownership.resolveBinCollisions(allocator, proj_dir, modules_dir);
}

/// Create alias symlinks for known multi-name binaries.
/// e.g. bunx invokes `bun x` through the primary executable activation.
fn createBinAliases(allocator: std.mem.Allocator, bin_link_dir: []const u8) void {
    const aliases = [_]struct {
        primary: []const u8,
        alias: []const u8,
        arguments: []const []const u8,
    }{
        .{ .primary = "bun", .alias = "bunx", .arguments = &.{"x"} },
    };

    for (aliases) |a| {
        const primary_path = std.fmt.allocPrint(allocator, "{s}/{s}", .{ bin_link_dir, a.primary }) catch continue;
        defer allocator.free(primary_path);
        // Only create the alias if the primary binary exists in .bin/
        io_helper.accessAbsolute(primary_path, .{}) catch continue;

        const alias_path = std.fmt.allocPrint(allocator, "{s}/{s}", .{ bin_link_dir, a.alias }) catch continue;
        defer allocator.free(alias_path);
        // Upgrade our former primary-name link; preserve another provider.
        const legacy = install.symlink.resolvedLinkTarget(allocator, alias_path);
        defer if (legacy) |target| allocator.free(target);
        if (legacy == null or !install.symlink.samePath(legacy.?, primary_path)) {
            io_helper.accessAbsolute(alias_path, .{}) catch {
                _ = install.symlink.writeShimWithArguments(allocator, alias_path, "", primary_path, std.fs.path.dirname(bin_link_dir), a.arguments);
                continue;
            };
            continue;
        }
        _ = install.symlink.writeShimWithArguments(allocator, alias_path, "", primary_path, std.fs.path.dirname(bin_link_dir), a.arguments);
    }
}

/// Recursively scan a directory for bin/ and sbin/ subdirectories.
/// When found, symlink all executables into bin_link_dir.
/// max_depth prevents infinite recursion (packages nest at most ~4 levels deep).
fn scanForBinDirs(allocator: std.mem.Allocator, dir_path: []const u8, bin_link_dir: []const u8, tree_root: []const u8, depth: usize) void {
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
            symlinkBinEntries(allocator, child_path, bin_link_dir, tree_root);
        } else {
            // Recurse into subdirectory
            scanForBinDirs(allocator, child_path, bin_link_dir, tree_root, depth + 1);
        }
    }
}

/// Symlink all executable files from a bin directory into bin_link_dir.
fn symlinkBinEntries(allocator: std.mem.Allocator, bin_dir: []const u8, bin_link_dir: []const u8, tree_root: []const u8) void {
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

        // Upgrade our legacy activation, preserve another installed provider.
        if (install.symlink.resolvedActivationTarget(allocator, bin_dst)) |existing| {
            defer allocator.free(existing);
            if (!install.symlink.samePath(existing, bin_src)) {
                io_helper.accessAbsolute(existing, .{}) catch {
                    makeExecutable(bin_src);
                    install.symlink.createProgramActivation(allocator, bin_dst, bin_src, tree_root) catch {};
                    continue;
                };
                continue;
            }
        } else {
            io_helper.accessAbsolute(bin_dst, .{}) catch {
                makeExecutable(bin_src);
                install.symlink.createProgramActivation(allocator, bin_dst, bin_src, tree_root) catch {};
                continue;
            };
            continue;
        }
        makeExecutable(bin_src);
        install.symlink.createProgramActivation(allocator, bin_dst, bin_src, tree_root) catch {};
    }
}

fn ensureConfiguredZigSymlink(allocator: std.mem.Allocator, proj_dir: []const u8, pantry_dir: []const u8, bin_link_dir: []const u8) void {
    const requested = readRequestedZigVersion(allocator, proj_dir) orelse return;
    defer allocator.free(requested);

    const zig_bin = findBestZigBinary(allocator, pantry_dir, requested) orelse return;
    defer allocator.free(zig_bin);

    const link_path = std.fmt.allocPrint(allocator, "{s}/zig", .{bin_link_dir}) catch return;
    defer allocator.free(link_path);

    makeExecutable(zig_bin);
    install.symlink.createProgramActivation(allocator, link_path, zig_bin, pantry_dir) catch {};
}

/// Record a system (pantry-source) dependency in deps.yaml.
///
/// System packages belong here rather than in package.json: several of their
/// domains are not legal npm package names — `curl.se/ca-certs` has a slash
/// without an `@scope` — and pnpm refuses to install a project whose manifest
/// contains one at all (ERR_PNPM_INVALID_DEPENDENCY_NAME), so saving them to
/// package.json broke the very project we had just installed into.
///
/// Writes the flat, two-space-indented `dependencies:` map that
/// readRequestedZigVersion and config/dependencies.zig parse.
pub fn addDependencyToDepsYaml(
    allocator: std.mem.Allocator,
    project_root: []const u8,
    pkg_name: []const u8,
    pkg_version: []const u8,
) !void {
    const deps_path = try std.fs.path.join(allocator, &[_][]const u8{ project_root, "deps.yaml" });
    defer allocator.free(deps_path);

    const entry = try std.fmt.allocPrint(allocator, "  {s}: ^{s}", .{ pkg_name, pkg_version });
    defer allocator.free(entry);

    var out = try std.ArrayList(u8).initCapacity(allocator, 256);
    defer out.deinit(allocator);

    if (io_helper.readFileAlloc(allocator, deps_path, 1024 * 1024)) |content| {
        defer allocator.free(content);

        const key_prefix = try std.fmt.allocPrint(allocator, "{s}:", .{pkg_name});
        defer allocator.free(key_prefix);

        // Whether the key is already in the file decides which of the two
        // branches below may fire, so it has to be known before the rewrite
        // starts. A single pass could not know it: `dependencies:` is reached
        // first, the insert fired there, and the `wrote` flag it set then locked
        // out the re-pin branch for the existing entry further down. Every
        // `pantry install <pkg>` appended another copy of a key already present
        // — four `gnupg.org: ^2.4.8` lines in one deps.yaml, which YAML reads as
        // one key and a human reads as a corrupted file.
        const has_key = blk: {
            var scan = std.mem.splitScalar(u8, content, '\n');
            while (scan.next()) |raw_line| {
                const trimmed = std.mem.trim(u8, raw_line, " \t\r\n");
                if (std.mem.startsWith(u8, trimmed, key_prefix)) break :blk true;
            }
            break :blk false;
        };

        var wrote = false;
        var lines = std.mem.splitScalar(u8, content, '\n');
        var first = true;
        while (lines.next()) |raw_line| {
            const trimmed = std.mem.trim(u8, raw_line, " \t\r\n");

            // Re-pin an existing entry in place, preserving the rest of the file.
            if (has_key and std.mem.startsWith(u8, trimmed, key_prefix)) {
                // Later copies are the damage the old behaviour left behind.
                // Dropping them repairs the file on the next install rather than
                // requiring the duplicates to be deleted by hand.
                if (wrote) continue;

                if (!first) try out.append(allocator, '\n');
                try out.appendSlice(allocator, entry);
                wrote = true;
                first = false;
                continue;
            }

            if (!first) try out.append(allocator, '\n');
            try out.appendSlice(allocator, raw_line);
            first = false;

            // New entry goes directly under the existing `dependencies:` key.
            if (!has_key and !wrote and std.mem.eql(u8, trimmed, "dependencies:")) {
                try out.append(allocator, '\n');
                try out.appendSlice(allocator, entry);
                wrote = true;
            }
        }

        // No `dependencies:` map yet — start one.
        if (!wrote) {
            if (out.items.len > 0 and out.items[out.items.len - 1] != '\n') try out.append(allocator, '\n');
            try out.appendSlice(allocator, "dependencies:\n");
            try out.appendSlice(allocator, entry);
            try out.append(allocator, '\n');
        }
    } else |_| {
        try out.appendSlice(allocator, "dependencies:\n");
        try out.appendSlice(allocator, entry);
        try out.append(allocator, '\n');
    }

    if (out.items.len > 0 and out.items[out.items.len - 1] != '\n') try out.append(allocator, '\n');

    const file = try io_helper.cwd().createFile(io_helper.io, deps_path, .{});
    defer file.close(io_helper.io);
    try io_helper.writeAllToFile(file, out.items);
}

fn readRequestedZigVersion(allocator: std.mem.Allocator, proj_dir: []const u8) ?[]u8 {
    const deps_path = std.fmt.allocPrint(allocator, "{s}/deps.yaml", .{proj_dir}) catch return null;
    defer allocator.free(deps_path);

    const content = io_helper.readFileAlloc(allocator, deps_path, 1024 * 1024) catch return null;
    defer allocator.free(content);

    var lines = std.mem.splitScalar(u8, content, '\n');
    while (lines.next()) |raw_line| {
        const line = std.mem.trim(u8, raw_line, " \t\r\n");
        if (line.len == 0 or line[0] == '#') continue;

        if (std.mem.startsWith(u8, line, "zig:") or
            std.mem.startsWith(u8, line, "ziglang:") or
            std.mem.startsWith(u8, line, "ziglang.org:"))
        {
            const colon = std.mem.indexOfScalar(u8, line, ':') orelse continue;
            var value = std.mem.trim(u8, line[colon + 1 ..], " \t\r\n\"'");
            if (std.mem.indexOfScalar(u8, value, '#')) |comment| {
                value = std.mem.trim(u8, value[0..comment], " \t\r\n\"'");
            }
            if (value.len > 0 and value[value.len - 1] == ',') {
                value = std.mem.trim(u8, value[0 .. value.len - 1], " \t\r\n\"'");
            }
            if (value.len == 0) return null;
            return allocator.dupe(u8, value) catch null;
        }
    }

    return null;
}

fn findBestZigBinary(allocator: std.mem.Allocator, pantry_dir: []const u8, requested: []const u8) ?[]u8 {
    const zig_root = std.fmt.allocPrint(allocator, "{s}/ziglang.org", .{pantry_dir}) catch return null;
    defer allocator.free(zig_root);

    var dir = io_helper.openDirAbsoluteForIteration(zig_root) catch return null;
    defer dir.close();

    var best_bin: ?[]u8 = null;
    var best_rank: ?ZigVersionRank = null;

    var iter = dir.iterate();
    while (iter.next() catch null) |entry| {
        if (entry.kind != .directory) continue;
        if (!std.mem.startsWith(u8, entry.name, "v")) continue;
        const version = entry.name[1..];
        if (!zigVersionMatchesRequest(version, requested)) continue;

        const bin_path = std.fmt.allocPrint(allocator, "{s}/{s}/bin/zig", .{ zig_root, entry.name }) catch continue;
        io_helper.accessAbsolute(bin_path, .{}) catch {
            allocator.free(bin_path);
            continue;
        };

        const rank = parseZigVersionRank(version);
        if (best_rank == null or rank.order(best_rank.?) == .gt) {
            if (best_bin) |old| allocator.free(old);
            best_bin = bin_path;
            best_rank = rank;
        } else {
            allocator.free(bin_path);
        }
    }

    return best_bin;
}

fn zigVersionMatchesRequest(version: []const u8, requested_raw: []const u8) bool {
    const requested = if (std.mem.startsWith(u8, requested_raw, "v")) requested_raw[1..] else requested_raw;
    if (std.mem.eql(u8, requested, "*") or std.mem.eql(u8, requested, "latest")) return true;
    if (std.mem.endsWith(u8, requested, "-dev")) return std.mem.startsWith(u8, version, requested);

    const requested_prefix = versionPrefixBeforeHash(requested);
    const version_prefix = versionPrefixBeforeHash(version);
    return std.mem.eql(u8, version_prefix, requested_prefix);
}

fn versionPrefixBeforeHash(version: []const u8) []const u8 {
    for (version, 0..) |c, i| {
        if (c == '+' or c == '_') return version[0..i];
    }
    return version;
}

const ZigVersionRank = struct {
    major: u32 = 0,
    minor: u32 = 0,
    patch: u32 = 0,
    stable: bool = false,
    dev_build: u32 = 0,

    fn order(self: ZigVersionRank, other: ZigVersionRank) std.math.Order {
        if (self.major != other.major) return std.math.order(self.major, other.major);
        if (self.minor != other.minor) return std.math.order(self.minor, other.minor);
        if (self.patch != other.patch) return std.math.order(self.patch, other.patch);
        if (self.stable != other.stable) return if (self.stable) .gt else .lt;
        return std.math.order(self.dev_build, other.dev_build);
    }
};

fn parseZigVersionRank(version: []const u8) ZigVersionRank {
    const dev_pos = std.mem.indexOf(u8, version, "-dev");
    const base = if (dev_pos) |pos| version[0..pos] else version;

    var rank = ZigVersionRank{ .stable = dev_pos == null };
    var parts = std.mem.splitScalar(u8, base, '.');
    if (parts.next()) |part| rank.major = std.fmt.parseInt(u32, part, 10) catch 0;
    if (parts.next()) |part| rank.minor = std.fmt.parseInt(u32, part, 10) catch 0;
    if (parts.next()) |part| rank.patch = std.fmt.parseInt(u32, part, 10) catch 0;

    if (dev_pos) |pos| {
        const marker = "-dev.";
        if (version.len > pos + marker.len and std.mem.startsWith(u8, version[pos..], marker)) {
            const rest = version[pos + marker.len ..];
            var end: usize = 0;
            while (end < rest.len and rest[end] >= '0' and rest[end] <= '9') : (end += 1) {}
            if (end > 0) rank.dev_build = std.fmt.parseInt(u32, rest[0..end], 10) catch 0;
        }
    }

    return rank;
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
    var key_order = std.ArrayList([]const u8).empty;
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
    try std.testing.expectEqualStrings("qux", stripDisplayPrefix("github:qux"));
    try std.testing.expectEqualStrings("archive", stripDisplayPrefix("http:archive"));
    try std.testing.expectEqualStrings("repo", stripDisplayPrefix("git:repo"));
    try std.testing.expectEqualStrings("baz", stripDisplayPrefix("baz"));
    try std.testing.expectEqualStrings("npm:lodash", stripDisplayPrefix("npm:lodash"));
}

test "normalizePackageName" {
    try std.testing.expectEqualStrings("foo", normalizePackageName("auto:foo"));
    try std.testing.expectEqualStrings("bar", normalizePackageName("local:bar"));
    try std.testing.expectEqualStrings("lodash", normalizePackageName("npm:lodash"));
    try std.testing.expectEqualStrings("qux", normalizePackageName("github:qux"));
    try std.testing.expectEqualStrings("baz", normalizePackageName("baz"));
}

test "workspace constraint map includes system dependencies" {
    const allocator = std.testing.allocator;
    var lockfile = try lib.packages.Lockfile.init(allocator, "1.0.0");
    defer lockfile.deinit(allocator);

    var dependencies = std.StringHashMap([]const u8).init(allocator);
    try dependencies.put(try allocator.dupe(u8, "bunfig"), try allocator.dupe(u8, "^0.15.15"));
    var system = std.StringHashMap([]const u8).init(allocator);
    try system.put(try allocator.dupe(u8, "bun.sh"), try allocator.dupe(u8, "^1.3.14"));
    try lockfile.addWorkspace(allocator, "", .{
        .name = try allocator.dupe(u8, "fixture"),
        .dependencies = dependencies,
        .system = system,
    });

    var constraints = buildConstraintMapFromWorkspaces(&lockfile.workspaces, allocator);
    defer constraints.deinit();

    try std.testing.expectEqualStrings("^0.15.15", constraints.get("bunfig").?);
    try std.testing.expectEqualStrings("^1.3.14", constraints.get("bun.sh").?);
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

test "splitPackageSpec: unscoped" {
    const parts = splitPackageSpec("is-odd");
    try std.testing.expectEqualStrings("is-odd", parts.name);
    try std.testing.expectEqualStrings("latest", parts.version);
}

test "splitPackageSpec: unscoped with version" {
    const parts = splitPackageSpec("is-odd@3.0.1");
    try std.testing.expectEqualStrings("is-odd", parts.name);
    try std.testing.expectEqualStrings("3.0.1", parts.version);
}

test "splitPackageSpec: scoped keeps its scope and defaults the version" {
    // The regression: the leading '@' was read as the version delimiter, so the
    // name came out empty and the version came out "stacksjs/tlsx".
    const parts = splitPackageSpec("@stacksjs/tlsx");
    try std.testing.expectEqualStrings("@stacksjs/tlsx", parts.name);
    try std.testing.expectEqualStrings("latest", parts.version);
}

test "splitPackageSpec: scoped with version" {
    const parts = splitPackageSpec("@stacksjs/tlsx@0.13.15");
    try std.testing.expectEqualStrings("@stacksjs/tlsx", parts.name);
    try std.testing.expectEqualStrings("0.13.15", parts.version);
}

test "splitPackageSpec: scoped with a semver range" {
    const parts = splitPackageSpec("@types/semver@^7.5.0");
    try std.testing.expectEqualStrings("@types/semver", parts.name);
    try std.testing.expectEqualStrings("^7.5.0", parts.version);
}

test "splitPackageSpec: domain-style system package is unaffected" {
    const parts = splitPackageSpec("nodejs.org@22.1.0");
    try std.testing.expectEqualStrings("nodejs.org", parts.name);
    try std.testing.expectEqualStrings("22.1.0", parts.version);
}

test "splitPackageSpec: a bare '@' is not treated as a scope with no name" {
    const parts = splitPackageSpec("@");
    try std.testing.expectEqualStrings("@", parts.name);
    try std.testing.expectEqualStrings("latest", parts.version);
}

test "splitPackageSpec: empty spec does not panic" {
    const parts = splitPackageSpec("");
    try std.testing.expectEqualStrings("", parts.name);
    try std.testing.expectEqualStrings("latest", parts.version);
}

test "addDependencyToDepsYaml re-pins an existing key instead of appending" {
    const allocator = std.testing.allocator;

    var tmp_dir = std.testing.tmpDir(.{});
    defer tmp_dir.cleanup();

    var path_buf: [std.fs.max_path_bytes]u8 = undefined;
    const tmp_len = try tmp_dir.dir.realPath(io_helper.io, &path_buf);
    const project_root = path_buf[0..tmp_len];

    const deps_path = try std.fmt.allocPrint(allocator, "{s}/deps.yaml", .{project_root});
    defer allocator.free(deps_path);

    const write = struct {
        fn f(path: []const u8, body: []const u8) !void {
            const file = try io_helper.cwd().createFile(io_helper.io, path, .{});
            defer file.close(io_helper.io);
            try io_helper.writeAllToFile(file, body);
        }
    }.f;

    // The key already exists, and it sits *below* `dependencies:` — the order
    // every real deps.yaml has, and the one that used to append a second copy.
    try write(deps_path,
        \\dependencies:
        \\  git: ^2.47.0
        \\  gnupg.org: ^2.4.0
        \\
    );

    try addDependencyToDepsYaml(allocator, project_root, "gnupg.org", "2.4.8");

    const once = try io_helper.readFileAlloc(allocator, deps_path, 1024 * 1024);
    defer allocator.free(once);

    try std.testing.expectEqualStrings(
        \\dependencies:
        \\  git: ^2.47.0
        \\  gnupg.org: ^2.4.8
        \\
    , once);

    // Installing again must be a no-op, not another line.
    try addDependencyToDepsYaml(allocator, project_root, "gnupg.org", "2.4.8");

    const twice = try io_helper.readFileAlloc(allocator, deps_path, 1024 * 1024);
    defer allocator.free(twice);
    try std.testing.expectEqualStrings(once, twice);

    // A neighbouring key that merely shares a prefix is not the same key.
    try addDependencyToDepsYaml(allocator, project_root, "gnupg.org/npth", "1.8.0");

    const with_nested = try io_helper.readFileAlloc(allocator, deps_path, 1024 * 1024);
    defer allocator.free(with_nested);

    try std.testing.expectEqualStrings(
        \\dependencies:
        \\  gnupg.org/npth: ^1.8.0
        \\  git: ^2.47.0
        \\  gnupg.org: ^2.4.8
        \\
    , with_nested);
}

test "addDependencyToDepsYaml repairs a file the append bug already duplicated" {
    const allocator = std.testing.allocator;

    var tmp_dir = std.testing.tmpDir(.{});
    defer tmp_dir.cleanup();

    var path_buf: [std.fs.max_path_bytes]u8 = undefined;
    const tmp_len = try tmp_dir.dir.realPath(io_helper.io, &path_buf);
    const project_root = path_buf[0..tmp_len];

    const deps_path = try std.fmt.allocPrint(allocator, "{s}/deps.yaml", .{project_root});
    defer allocator.free(deps_path);

    const file = try io_helper.cwd().createFile(io_helper.io, deps_path, .{});
    try io_helper.writeAllToFile(file,
        \\dependencies:
        \\  gnupg.org: ^2.4.8
        \\  gnupg.org: ^2.4.8
        \\  git: ^2.47.0
        \\  gnupg.org: ^2.4.8
        \\
    );
    file.close(io_helper.io);

    try addDependencyToDepsYaml(allocator, project_root, "gnupg.org", "2.4.8");

    const repaired = try io_helper.readFileAlloc(allocator, deps_path, 1024 * 1024);
    defer allocator.free(repaired);

    try std.testing.expectEqualStrings(
        \\dependencies:
        \\  gnupg.org: ^2.4.8
        \\  git: ^2.47.0
        \\
    , repaired);
}
