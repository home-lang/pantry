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
        // Extract host from registry URL
        const host = extractHost(registry_url) orelse return null;

        // Try exact match first
        if (self.auth_tokens.get(host)) |token| {
            return token;
        }

        // Try with and without trailing slash
        var iter = self.auth_tokens.iterator();
        while (iter.next()) |entry| {
            if (std.mem.indexOf(u8, registry_url, entry.key_ptr.*) != null) {
                return entry.value_ptr.*;
            }
        }

        return null;
    }

    /// Get basic auth for a given registry URL.
    pub fn getBasicAuthForRegistry(self: *const NpmrcConfig, registry_url: []const u8) ?[]const u8 {
        const host = extractHost(registry_url) orelse return null;

        if (self.basic_auth.get(host)) |auth| {
            return auth;
        }

        var iter = self.basic_auth.iterator();
        while (iter.next()) |entry| {
            if (std.mem.indexOf(u8, registry_url, entry.key_ptr.*) != null) {
                return entry.value_ptr.*;
            }
        }

        return null;
    }
};

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
pub fn loadNpmrc(allocator: std.mem.Allocator, project_dir: ?[]const u8) !NpmrcConfig {
    var config = NpmrcConfig.init(allocator);
    errdefer config.deinit();

    // Load user-level ~/.npmrc first (lower priority)
    const home = @import("../core/platform.zig").Paths.home(allocator) catch null;
    if (home) |home_dir| {
        defer allocator.free(home_dir);
        const user_npmrc = try std.fmt.allocPrint(allocator, "{s}/.npmrc", .{home_dir});
        defer allocator.free(user_npmrc);
        parseNpmrcFile(allocator, user_npmrc, &config) catch {};
    }

    // Load project-level .npmrc (higher priority, overwrites user settings)
    if (project_dir) |proj| {
        const project_npmrc = try std.fmt.allocPrint(allocator, "{s}/.npmrc", .{proj});
        defer allocator.free(project_npmrc);
        parseNpmrcFile(allocator, project_npmrc, &config) catch {};
    }

    return config;
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
        const value = std.mem.trim(u8, line[eq_pos + 1 ..], " \t");

        if (key.len == 0 or value.len == 0) continue;

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
