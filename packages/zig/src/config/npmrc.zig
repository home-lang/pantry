//! .npmrc configuration file parser
//!
//! Parses INI-style .npmrc files from project and user directories.
//! Supports:
//! - registry=<url> (default registry)
//! - @scope:registry=<url> (scoped registries)
//! - //registry.npmjs.org/:_authToken=<token> (auth tokens)
//! - //registry.npmjs.org/:_auth=<base64> (basic auth)
//! - proxy=<url> and https-proxy=<url> (proxy settings)
//! - strict-ssl=true/false

const std = @import("std");
const io_helper = @import("../io_helper.zig");

/// Parsed .npmrc configuration
pub const NpmrcConfig = struct {
    /// Default registry URL (overrides https://registry.npmjs.org)
    registry: ?[]const u8 = null,

    /// Scoped registry overrides: @scope -> registry URL
    scoped_registries: std.StringHashMap([]const u8),

    /// Auth tokens: registry host -> token
    auth_tokens: std.StringHashMap([]const u8),

    /// Basic auth (base64 encoded): registry host -> encoded value
    basic_auth: std.StringHashMap([]const u8),

    /// Proxy settings
    proxy: ?[]const u8 = null,
    https_proxy: ?[]const u8 = null,

    /// SSL settings
    strict_ssl: bool = true,

    allocator: std.mem.Allocator,

    pub fn init(allocator: std.mem.Allocator) NpmrcConfig {
        return .{
            .scoped_registries = std.StringHashMap([]const u8).init(allocator),
            .auth_tokens = std.StringHashMap([]const u8).init(allocator),
            .basic_auth = std.StringHashMap([]const u8).init(allocator),
            .allocator = allocator,
        };
    }

    pub fn deinit(self: *NpmrcConfig) void {
        if (self.registry) |r| self.allocator.free(r);
        if (self.proxy) |p| self.allocator.free(p);
        if (self.https_proxy) |hp| self.allocator.free(hp);

        var sr_iter = self.scoped_registries.iterator();
        while (sr_iter.next()) |entry| {
            self.allocator.free(entry.key_ptr.*);
            self.allocator.free(entry.value_ptr.*);
        }
        self.scoped_registries.deinit();

        var at_iter = self.auth_tokens.iterator();
        while (at_iter.next()) |entry| {
            self.allocator.free(entry.key_ptr.*);
            self.allocator.free(entry.value_ptr.*);
        }
        self.auth_tokens.deinit();

        var ba_iter = self.basic_auth.iterator();
        while (ba_iter.next()) |entry| {
            self.allocator.free(entry.key_ptr.*);
            self.allocator.free(entry.value_ptr.*);
        }
        self.basic_auth.deinit();
    }

    /// Get the registry URL for a given package name.
    /// Returns scoped registry if the package is scoped, otherwise default registry.
    pub fn getRegistryForPackage(self: *const NpmrcConfig, package_name: []const u8) ?[]const u8 {
        // Check if this is a scoped package
        if (package_name.len > 0 and package_name[0] == '@') {
            if (std.mem.indexOf(u8, package_name, "/")) |slash_pos| {
                const scope = package_name[0..slash_pos];
                if (self.scoped_registries.get(scope)) |registry_url| {
                    return registry_url;
                }
            }
        }
        return self.registry;
    }

    /// Get the auth token for a given registry URL.
    pub fn getAuthTokenForRegistry(self: *const NpmrcConfig, registry_url: []const u8) ?[]const u8 {
        return lookupHostCredential(&self.auth_tokens, registry_url);
    }

    /// Get basic auth for a given registry URL.
    pub fn getBasicAuthForRegistry(self: *const NpmrcConfig, registry_url: []const u8) ?[]const u8 {
        return lookupHostCredential(&self.basic_auth, registry_url);
    }
};

/// Match a registry URL against a host-keyed credential map.
///
/// Security: we never use substring matching on the URL (an earlier
/// implementation did `indexOf(url, key)`, which would hand out a token for
/// "npmjs.org" to a registry URL like "https://npmjs.org.attacker.example").
/// Instead we do:
///   1. exact host match
///   2. host-with-path-prefix match, where the key is e.g. `registry.example.com/api`
///      — the real host and the path prefix must both match.
///   3. host match ignoring a single trailing '/' on the key.
fn lookupHostCredential(
    map: *const std.StringHashMap([]const u8),
    registry_url: []const u8,
) ?[]const u8 {
    const host_and_path = stripScheme(registry_url) orelse return null;
    const host = hostOnly(host_and_path);

    // 1) Exact host
    if (map.get(host)) |token| return token;

    // 2) Keys are stored with optional path and trailing slash; try them.
    var iter = map.iterator();
    while (iter.next()) |entry| {
        const key = entry.key_ptr.*;
        const key_trimmed = if (key.len > 0 and key[key.len - 1] == '/') key[0 .. key.len - 1] else key;
        if (std.mem.eql(u8, host, key_trimmed)) return entry.value_ptr.*;
        // Path-prefix form: key may include a path after the host. Require an
        // exact scheme-stripped prefix match, and that the next char is '/' or EOS
        // so "npmjs.org" never matches "npmjs.org.evil.com".
        if (std.mem.startsWith(u8, host_and_path, key_trimmed)) {
            const after = host_and_path[key_trimmed.len..];
            if (after.len == 0 or after[0] == '/') return entry.value_ptr.*;
        }
    }

    return null;
}

/// Drop "http://" / "https://" prefix from a URL; return the rest or null if
/// no recognized scheme.
fn stripScheme(url: []const u8) ?[]const u8 {
    if (std.mem.startsWith(u8, url, "https://")) return url[8..];
    if (std.mem.startsWith(u8, url, "http://")) return url[7..];
    return null;
}

/// Take everything before the first '/' (host portion only).
fn hostOnly(host_and_path: []const u8) []const u8 {
    if (std.mem.indexOfScalar(u8, host_and_path, '/')) |i| return host_and_path[0..i];
    return host_and_path;
}

test "lookupHostCredential rejects substring host attack" {
    const allocator = std.testing.allocator;
    var map = std.StringHashMap([]const u8).init(allocator);
    defer {
        var it = map.iterator();
        while (it.next()) |entry| {
            allocator.free(entry.key_ptr.*);
            allocator.free(entry.value_ptr.*);
        }
        map.deinit();
    }

    try map.put(try allocator.dupe(u8, "registry.npmjs.org"), try allocator.dupe(u8, "secret"));

    // Exact match → hit
    try std.testing.expectEqualStrings("secret", lookupHostCredential(&map, "https://registry.npmjs.org/").?);
    try std.testing.expectEqualStrings("secret", lookupHostCredential(&map, "https://registry.npmjs.org/foo").?);

    // Attacker host that SUPERSTRINGS the key must NOT match
    try std.testing.expect(lookupHostCredential(&map, "https://registry.npmjs.org.attacker.example/") == null);
    try std.testing.expect(lookupHostCredential(&map, "https://evil-registry.npmjs.org/") == null);
}

/// Extract host portion from a URL (e.g., "https://registry.npmjs.org" -> "registry.npmjs.org")
fn extractHost(url: []const u8) ?[]const u8 {
    var start: usize = 0;
    if (std.mem.startsWith(u8, url, "https://")) {
        start = 8;
    } else if (std.mem.startsWith(u8, url, "http://")) {
        start = 7;
    }

    if (start >= url.len) return null;

    const rest = url[start..];
    if (std.mem.indexOf(u8, rest, "/")) |slash_pos| {
        return rest[0..slash_pos];
    }
    return rest;
}

/// Load .npmrc configuration, merging project-level and user-level files.
/// Project-level settings take precedence over user-level settings.
///
/// Parse errors other than FileNotFound are surfaced as a stderr warning so
/// a corrupted .npmrc doesn't silently wipe out the user's auth config.
pub fn loadNpmrc(allocator: std.mem.Allocator, project_dir: ?[]const u8) !NpmrcConfig {
    var config = NpmrcConfig.init(allocator);
    errdefer config.deinit();

    const stderr = std.io.getStdErr().writer();

    // Load user-level ~/.npmrc first (lower priority)
    const home = @import("../core/platform.zig").Paths.home(allocator) catch null;
    if (home) |home_dir| {
        defer allocator.free(home_dir);
        const user_npmrc = try std.fmt.allocPrint(allocator, "{s}/.npmrc", .{home_dir});
        defer allocator.free(user_npmrc);
        parseNpmrcFile(allocator, user_npmrc, &config) catch |err| {
            if (err != error.FileNotFound) {
                stderr.print("pantry: warning: failed to parse {s} ({s}); continuing without user-level .npmrc\n", .{ user_npmrc, @errorName(err) }) catch {};
            }
        };
    }

    // Load project-level .npmrc (higher priority, overwrites user settings)
    if (project_dir) |proj| {
        const project_npmrc = try std.fmt.allocPrint(allocator, "{s}/.npmrc", .{proj});
        defer allocator.free(project_npmrc);
        parseNpmrcFile(allocator, project_npmrc, &config) catch |err| {
            if (err != error.FileNotFound) {
                stderr.print("pantry: warning: failed to parse {s} ({s}); continuing without project .npmrc\n", .{ project_npmrc, @errorName(err) }) catch {};
            }
        };
    }

    return config;
}

/// Expand ${VAR} and $VAR references in a .npmrc value. Standard .npmrc files
/// use this for auth tokens (`//registry.npmjs.org/:_authToken=${NPM_TOKEN}`).
/// An unknown env var expands to the empty string (matching npm's behaviour
/// and avoiding aborted installs when a token just isn't set in this env).
/// Returns a caller-owned slice.
pub fn expandEnvVars(allocator: std.mem.Allocator, value: []const u8) ![]const u8 {
    var out = std.ArrayList(u8).empty;
    defer out.deinit(allocator);

    var i: usize = 0;
    while (i < value.len) {
        const c = value[i];
        if (c != '$' or i + 1 >= value.len) {
            try out.append(allocator, c);
            i += 1;
            continue;
        }

        // ${NAME}
        if (value[i + 1] == '{') {
            const end = std.mem.indexOfScalarPos(u8, value, i + 2, '}') orelse {
                try out.append(allocator, c);
                i += 1;
                continue;
            };
            const name = value[i + 2 .. end];
            if (io_helper.getEnvVarOwned(allocator, name)) |env_val| {
                defer allocator.free(env_val);
                try out.appendSlice(allocator, env_val);
            } else |_| {}
            i = end + 1;
            continue;
        }

        // $NAME (alpha/underscore only)
        const is_name_start = (value[i + 1] == '_') or
            (value[i + 1] >= 'A' and value[i + 1] <= 'Z') or
            (value[i + 1] >= 'a' and value[i + 1] <= 'z');
        if (!is_name_start) {
            try out.append(allocator, c);
            i += 1;
            continue;
        }
        var end = i + 1;
        while (end < value.len) : (end += 1) {
            const ch = value[end];
            const is_name = (ch == '_') or
                (ch >= '0' and ch <= '9') or
                (ch >= 'A' and ch <= 'Z') or
                (ch >= 'a' and ch <= 'z');
            if (!is_name) break;
        }
        const name = value[i + 1 .. end];
        if (io_helper.getEnvVarOwned(allocator, name)) |env_val| {
            defer allocator.free(env_val);
            try out.appendSlice(allocator, env_val);
        } else |_| {}
        i = end;
    }

    return out.toOwnedSlice(allocator);
}

test "expandEnvVars handles ${VAR} and $VAR and leaves literal $" {
    const allocator = std.testing.allocator;
    // No env refs → identity
    {
        const s = try expandEnvVars(allocator, "plain value");
        defer allocator.free(s);
        try std.testing.expectEqualStrings("plain value", s);
    }
    // Missing env var expands to empty, not an error
    {
        const s = try expandEnvVars(allocator, "prefix-${PANTRY_TEST_DEFINITELY_NOT_SET}-suffix");
        defer allocator.free(s);
        try std.testing.expectEqualStrings("prefix--suffix", s);
    }
    // Literal $ at end of string is kept
    {
        const s = try expandEnvVars(allocator, "price: $");
        defer allocator.free(s);
        try std.testing.expectEqualStrings("price: $", s);
    }
}

/// Parse a single .npmrc file and merge into config
fn parseNpmrcFile(
    allocator: std.mem.Allocator,
    file_path: []const u8,
    config: *NpmrcConfig,
) !void {
    const content = try io_helper.readFileAlloc(allocator, file_path, 1024 * 1024);
    defer allocator.free(content);

    var line_iter = std.mem.splitScalar(u8, content, '\n');
    while (line_iter.next()) |raw_line| {
        const line = std.mem.trim(u8, raw_line, " \t\r");

        // Skip empty lines and comments
        if (line.len == 0) continue;
        if (line[0] == '#' or line[0] == ';') continue;

        // Find the = separator
        const eq_pos = std.mem.indexOf(u8, line, "=") orelse continue;
        if (eq_pos == 0) continue;

        const key = std.mem.trim(u8, line[0..eq_pos], " \t");
        const raw_value = std.mem.trim(u8, line[eq_pos + 1 ..], " \t");

        if (key.len == 0 or raw_value.len == 0) continue;

        // Expand $VAR / ${VAR} env references in the value (standard .npmrc
        // convention for auth tokens, e.g. `${NPM_TOKEN}`).
        const value = expandEnvVars(allocator, raw_value) catch raw_value;
        const should_free_value = value.ptr != raw_value.ptr;
        defer if (should_free_value) allocator.free(value);

        // Parse known keys
        if (std.mem.eql(u8, key, "registry")) {
            // Default registry
            if (config.registry) |old| allocator.free(old);
            config.registry = try allocator.dupe(u8, value);
        } else if (std.mem.eql(u8, key, "proxy")) {
            if (config.proxy) |old| allocator.free(old);
            config.proxy = try allocator.dupe(u8, value);
        } else if (std.mem.eql(u8, key, "https-proxy")) {
            if (config.https_proxy) |old| allocator.free(old);
            config.https_proxy = try allocator.dupe(u8, value);
        } else if (std.mem.eql(u8, key, "strict-ssl")) {
            config.strict_ssl = std.mem.eql(u8, value, "true");
        } else if (std.mem.startsWith(u8, key, "@") and std.mem.endsWith(u8, key, ":registry")) {
            // Scoped registry: @scope:registry=<url>
            const scope_end = std.mem.indexOf(u8, key, ":registry") orelse continue;
            const scope = key[0..scope_end];

            // Remove old entry if exists
            if (config.scoped_registries.fetchRemove(scope)) |old| {
                allocator.free(old.key);
                allocator.free(old.value);
            }

            try config.scoped_registries.put(
                try allocator.dupe(u8, scope),
                try allocator.dupe(u8, value),
            );
        } else if (std.mem.startsWith(u8, key, "//") and std.mem.endsWith(u8, key, ":_authToken")) {
            // Auth token: //registry.npmjs.org/:_authToken=<token>
            // Extract the registry host part between // and /:_authToken
            const host_start: usize = 2; // skip //
            const host_end = std.mem.indexOf(u8, key, "/:_authToken") orelse continue;
            const host = key[host_start..host_end];

            if (config.auth_tokens.fetchRemove(host)) |old| {
                allocator.free(old.key);
                allocator.free(old.value);
            }

            try config.auth_tokens.put(
                try allocator.dupe(u8, host),
                try allocator.dupe(u8, value),
            );
        } else if (std.mem.startsWith(u8, key, "//") and std.mem.endsWith(u8, key, ":_auth")) {
            // Basic auth: //registry.npmjs.org/:_auth=<base64>
            const host_start: usize = 2;
            const host_end = std.mem.indexOf(u8, key, "/:_auth") orelse continue;
            const host = key[host_start..host_end];

            if (config.basic_auth.fetchRemove(host)) |old| {
                allocator.free(old.key);
                allocator.free(old.value);
            }

            try config.basic_auth.put(
                try allocator.dupe(u8, host),
                try allocator.dupe(u8, value),
            );
        }
    }
}
