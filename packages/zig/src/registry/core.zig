const std = @import("std");

/// Registry type enumeration
pub const RegistryType = enum {
    /// pkgx registry (default)
    pkgx,
    /// npm registry
    npm,
    /// GitHub packages/releases
    github,
    /// Custom HTTP registry
    custom,

    pub fn fromString(s: []const u8) ?RegistryType {
        if (std.mem.eql(u8, s, "pkgx")) return .pkgx;
        if (std.mem.eql(u8, s, "npm")) return .npm;
        if (std.mem.eql(u8, s, "github")) return .github;
        if (std.mem.eql(u8, s, "custom")) return .custom;
        return null;
    }

    pub fn toString(self: RegistryType) []const u8 {
        return switch (self) {
            .pkgx => "pkgx",
            .npm => "npm",
            .github => "github",
            .custom => "custom",
        };
    }
};

/// Authentication methods for registries
pub const Authentication = union(enum) {
    /// No authentication
    none,
    /// Bearer token (npm, custom)
    bearer: []const u8,
    /// Basic auth (username:password)
    basic: struct {
        username: []const u8,
        password: []const u8,
    },
    /// OIDC token (CI/CD environments)
    oidc: []const u8,
    /// Custom header
    custom: struct {
        name: []const u8,
        value: []const u8,
    },

    pub fn deinit(self: *Authentication, allocator: std.mem.Allocator) void {
        switch (self.*) {
            .none => {},
            .bearer => |token| allocator.free(token),
            .basic => |creds| {
                allocator.free(creds.username);
                allocator.free(creds.password);
            },
            .oidc => |token| allocator.free(token),
            .custom => |header| {
                allocator.free(header.name);
                allocator.free(header.value);
            },
        }
    }
};

/// Registry configuration
pub const RegistryConfig = struct {
    /// Type of registry
    type: RegistryType,

    /// Base URL for the registry
    url: []const u8,

    /// Authentication configuration
    auth: Authentication = .none,

    /// Priority (lower = higher priority for fallback)
    priority: u8 = 100,

    /// Registry name/identifier
    name: ?[]const u8 = null,

    /// Whether this registry is enabled
    enabled: bool = true,

    pub fn deinit(self: *RegistryConfig, allocator: std.mem.Allocator) void {
        allocator.free(self.url);
        self.auth.deinit(allocator);
        if (self.name) |n| allocator.free(n);
    }

    /// Default pkgx registry
    pub fn pkgx(allocator: std.mem.Allocator) !RegistryConfig {
        return RegistryConfig{
            .type = .pkgx,
            .url = try allocator.dupe(u8, "https://dist.pkgx.dev"),
            .auth = .none,
            .priority = 10,
            .name = try allocator.dupe(u8, "pkgx"),
        };
    }

    /// Default npm registry
    pub fn npm(allocator: std.mem.Allocator) !RegistryConfig {
        return RegistryConfig{
            .type = .npm,
            .url = try allocator.dupe(u8, "https://registry.npmjs.org"),
            .auth = .none,
            .priority = 20,
            .name = try allocator.dupe(u8, "npm"),
        };
    }

    /// GitHub packages registry
    pub fn github(allocator: std.mem.Allocator) !RegistryConfig {
        return RegistryConfig{
            .type = .github,
            .url = try allocator.dupe(u8, "https://api.github.com"),
            .auth = .none,
            .priority = 30,
            .name = try allocator.dupe(u8, "github"),
        };
    }
};

/// Package metadata from registry
pub const PackageMetadata = struct {
    name: []const u8,
    version: []const u8,
    description: ?[]const u8 = null,
    repository: ?[]const u8 = null,
    homepage: ?[]const u8 = null,
    license: ?[]const u8 = null,
    tarball_url: ?[]const u8 = null,
    checksum: ?[]const u8 = null,
    dependencies: ?std.StringHashMap([]const u8) = null,
    dev_dependencies: ?std.StringHashMap([]const u8) = null,

    pub fn deinit(self: *PackageMetadata, allocator: std.mem.Allocator) void {
        allocator.free(self.name);
        allocator.free(self.version);
        if (self.description) |d| allocator.free(d);
        if (self.repository) |r| allocator.free(r);
        if (self.homepage) |h| allocator.free(h);
        if (self.license) |l| allocator.free(l);
        if (self.tarball_url) |u| allocator.free(u);
        if (self.checksum) |c| allocator.free(c);
        if (self.dependencies) |*deps| {
            var it = deps.iterator();
            while (it.next()) |entry| {
                allocator.free(entry.key_ptr.*);
                allocator.free(entry.value_ptr.*);
            }
            deps.deinit();
        }
        if (self.dev_dependencies) |*deps| {
            var it = deps.iterator();
            while (it.next()) |entry| {
                allocator.free(entry.key_ptr.*);
                allocator.free(entry.value_ptr.*);
            }
            deps.deinit();
        }
    }
};

/// Registry interface that all registry implementations must conform to
pub const RegistryInterface = struct {
    ptr: *anyopaque,
    vtable: *const VTable,

    pub const VTable = struct {
        /// Fetch package metadata
        fetchMetadata: *const fn (
            ptr: *anyopaque,
            allocator: std.mem.Allocator,
            package_name: []const u8,
            version: ?[]const u8,
        ) anyerror!PackageMetadata,

        /// Download package tarball
        downloadTarball: *const fn (
            ptr: *anyopaque,
            allocator: std.mem.Allocator,
            package_name: []const u8,
            version: []const u8,
            dest_path: []const u8,
        ) anyerror!void,

        /// Search for packages
        search: *const fn (
            ptr: *anyopaque,
            allocator: std.mem.Allocator,
            query: []const u8,
        ) anyerror![]PackageMetadata,

        /// List all versions of a package
        listVersions: *const fn (
            ptr: *anyopaque,
            allocator: std.mem.Allocator,
            package_name: []const u8,
        ) anyerror![][]const u8,

        /// Publish a package
        publish: *const fn (
            ptr: *anyopaque,
            allocator: std.mem.Allocator,
            metadata: *const PackageMetadata,
            tarball_path: []const u8,
        ) anyerror!void,

        /// Cleanup
        deinit: *const fn (ptr: *anyopaque) void,
    };

    pub fn fetchMetadata(
        self: RegistryInterface,
        allocator: std.mem.Allocator,
        package_name: []const u8,
        version: ?[]const u8,
    ) !PackageMetadata {
        return self.vtable.fetchMetadata(self.ptr, allocator, package_name, version);
    }

    pub fn downloadTarball(
        self: RegistryInterface,
        allocator: std.mem.Allocator,
        package_name: []const u8,
        version: []const u8,
        dest_path: []const u8,
    ) !void {
        return self.vtable.downloadTarball(self.ptr, allocator, package_name, version, dest_path);
    }

    pub fn search(
        self: RegistryInterface,
        allocator: std.mem.Allocator,
        query: []const u8,
    ) ![]PackageMetadata {
        return self.vtable.search(self.ptr, allocator, query);
    }

    pub fn listVersions(
        self: RegistryInterface,
        allocator: std.mem.Allocator,
        package_name: []const u8,
    ) ![][]const u8 {
        return self.vtable.listVersions(self.ptr, allocator, package_name);
    }

    pub fn publish(
        self: RegistryInterface,
        allocator: std.mem.Allocator,
        metadata: *const PackageMetadata,
        tarball_path: []const u8,
    ) !void {
        return self.vtable.publish(self.ptr, allocator, metadata, tarball_path);
    }

    pub fn deinit(self: RegistryInterface) void {
        self.vtable.deinit(self.ptr);
    }
};

/// Multi-registry manager
pub const RegistryManager = struct {
    allocator: std.mem.Allocator,
    registries: std.ArrayList(RegistryConfig),
    default_registry: ?usize = null,

    pub fn init(allocator: std.mem.Allocator) RegistryManager {
        return .{
            .allocator = allocator,
            .registries = std.ArrayList(RegistryConfig).init(allocator),
        };
    }

    pub fn deinit(self: *RegistryManager) void {
        for (self.registries.items) |*registry| {
            registry.deinit(self.allocator);
        }
        self.registries.deinit();
    }

    /// Add a registry to the manager
    pub fn addRegistry(self: *RegistryManager, config: RegistryConfig) !void {
        try self.registries.append(config);

        // Sort by priority
        std.mem.sort(RegistryConfig, self.registries.items, {}, struct {
            fn lessThan(_: void, a: RegistryConfig, b: RegistryConfig) bool {
                return a.priority < b.priority;
            }
        }.lessThan);
    }

    /// Get registry by name
    pub fn getRegistry(self: *const RegistryManager, name: []const u8) ?*const RegistryConfig {
        for (self.registries.items) |*registry| {
            if (registry.name) |reg_name| {
                if (std.mem.eql(u8, reg_name, name)) {
                    return registry;
                }
            }
        }
        return null;
    }

    /// Get registry by type
    pub fn getRegistryByType(self: *const RegistryManager, reg_type: RegistryType) ?*const RegistryConfig {
        for (self.registries.items) |*registry| {
            if (registry.type == reg_type and registry.enabled) {
                return registry;
            }
        }
        return null;
    }

    /// Get default registry (highest priority enabled registry)
    pub fn getDefaultRegistry(self: *const RegistryManager) ?*const RegistryConfig {
        if (self.default_registry) |idx| {
            if (idx < self.registries.items.len) {
                return &self.registries.items[idx];
            }
        }

        // Return first enabled registry
        for (self.registries.items) |*registry| {
            if (registry.enabled) {
                return registry;
            }
        }
        return null;
    }

    /// Set default registry by name
    pub fn setDefaultRegistry(self: *RegistryManager, name: []const u8) !void {
        for (self.registries.items, 0..) |*registry, idx| {
            if (registry.name) |reg_name| {
                if (std.mem.eql(u8, reg_name, name)) {
                    self.default_registry = idx;
                    return;
                }
            }
        }
        return error.RegistryNotFound;
    }

    /// Load registries from configuration
    pub fn loadFromConfig(self: *RegistryManager, config: std.json.Value) !void {
        if (config != .object) return error.InvalidConfig;

        const obj = config.object;
        const registries_arr = obj.get("registries") orelse return;

        if (registries_arr != .array) return error.InvalidConfig;

        for (registries_arr.array.items) |registry_val| {
            if (registry_val != .object) continue;

            const registry_obj = registry_val.object;

            // Get type
            const type_str = if (registry_obj.get("type")) |t|
                if (t == .string) t.string else "custom"
            else
                "custom";

            const reg_type = RegistryType.fromString(type_str) orelse .custom;

            // Get URL
            const url = if (registry_obj.get("url")) |u|
                if (u == .string) try self.allocator.dupe(u8, u.string) else return error.MissingUrl
            else
                return error.MissingUrl;

            // Get name
            const name = if (registry_obj.get("name")) |n|
                if (n == .string) try self.allocator.dupe(u8, n.string) else null
            else
                null;

            // Get priority
            const priority = if (registry_obj.get("priority")) |p|
                if (p == .integer) @as(u8, @intCast(p.integer)) else 100
            else
                100;

            // Get enabled
            const enabled = if (registry_obj.get("enabled")) |e|
                if (e == .bool) e.bool else true
            else
                true;

            // Get auth
            var auth = Authentication.none;
            if (registry_obj.get("auth")) |auth_val| {
                if (auth_val == .object) {
                    const auth_obj = auth_val.object;
                    const auth_type = if (auth_obj.get("type")) |t|
                        if (t == .string) t.string else "none"
                    else
                        "none";

                    if (std.mem.eql(u8, auth_type, "bearer")) {
                        if (auth_obj.get("token")) |token| {
                            if (token == .string) {
                                auth = .{ .bearer = try self.allocator.dupe(u8, token.string) };
                            }
                        }
                    }
                }
            }

            const config_struct = RegistryConfig{
                .type = reg_type,
                .url = url,
                .auth = auth,
                .priority = priority,
                .name = name,
                .enabled = enabled,
            };

            try self.addRegistry(config_struct);
        }
    }
};
