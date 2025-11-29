const std = @import("std");

/// Package source types
pub const PackageSource = enum {
    pkgx, // Default: pkgx.dev ecosystem
    github, // GitHub releases or repositories
    npm, // npm registry
    http, // Direct HTTP download
    git, // Git repository
    local, // Local filesystem path (linked package)

    pub fn toString(self: PackageSource) []const u8 {
        return switch (self) {
            .pkgx => "pkgx",
            .github => "github",
            .npm => "npm",
            .http => "http",
            .git => "git",
            .local => "local",
        };
    }

    pub fn fromString(s: []const u8) ?PackageSource {
        if (std.mem.eql(u8, s, "pkgx")) return .pkgx;
        if (std.mem.eql(u8, s, "github")) return .github;
        if (std.mem.eql(u8, s, "npm")) return .npm;
        if (std.mem.eql(u8, s, "http")) return .http;
        if (std.mem.eql(u8, s, "git")) return .git;
        if (std.mem.eql(u8, s, "local")) return .local;
        return null;
    }
};

/// Package specification
pub const PackageSpec = struct {
    /// Package name
    name: []const u8,
    /// Package version (semantic version)
    version: []const u8,
    /// Package source (default: pkgx)
    source: PackageSource = .pkgx,
    /// Source-specific URL (for http/git sources)
    url: ?[]const u8 = null,
    /// GitHub repository (owner/repo format for github source)
    repo: ?[]const u8 = null,
    /// Git branch (for git source)
    branch: ?[]const u8 = null,
    /// Release tag (for github source)
    tag: ?[]const u8 = null,
    /// npm registry URL (for custom npm registries)
    registry: ?[]const u8 = null,
    /// Platform override (optional)
    platform: ?[]const u8 = null,
    /// Architecture override (optional)
    arch: ?[]const u8 = null,

    pub fn deinit(self: *PackageSpec, allocator: std.mem.Allocator) void {
        allocator.free(self.name);
        allocator.free(self.version);
        if (self.url) |u| allocator.free(u);
        if (self.repo) |r| allocator.free(r);
        if (self.branch) |b| allocator.free(b);
        if (self.tag) |t| allocator.free(t);
        if (self.registry) |r| allocator.free(r);
        if (self.platform) |p| allocator.free(p);
        if (self.arch) |a| allocator.free(a);
    }
};

/// Package metadata from registry
pub const PackageInfo = struct {
    /// Package name
    name: []const u8,
    /// Package version
    version: []const u8,
    /// Download URL
    url: []const u8,
    /// SHA256 checksum
    checksum: [32]u8,
    /// Dependencies
    dependencies: std.ArrayList(PackageSpec),
    /// Install size in bytes
    size: usize,

    pub fn deinit(self: *PackageInfo, allocator: std.mem.Allocator) void {
        allocator.free(self.name);
        allocator.free(self.version);
        allocator.free(self.url);
        for (self.dependencies.items) |*dep| {
            dep.deinit(allocator);
        }
        self.dependencies.deinit();
    }
};

/// Installed package information
pub const InstalledPackage = struct {
    /// Package name
    name: []const u8,
    /// Package version
    version: []const u8,
    /// Install path
    install_path: []const u8,
    /// Installed timestamp
    installed_at: i64,
    /// Installed size in bytes
    size: usize,

    pub fn deinit(self: *InstalledPackage, allocator: std.mem.Allocator) void {
        allocator.free(self.name);
        allocator.free(self.version);
        allocator.free(self.install_path);
    }
};

/// Lockfile entry for a single package
pub const LockfileEntry = struct {
    name: []const u8,
    version: []const u8,
    source: PackageSource,
    url: ?[]const u8 = null,
    resolved: ?[]const u8 = null, // Actual download URL
    integrity: ?[]const u8 = null, // SHA256 checksum
    dependencies: ?std.StringHashMap([]const u8) = null,

    pub fn deinit(self: *LockfileEntry, allocator: std.mem.Allocator) void {
        allocator.free(self.name);
        allocator.free(self.version);
        if (self.url) |u| allocator.free(u);
        if (self.resolved) |r| allocator.free(r);
        if (self.integrity) |i| allocator.free(i);
        if (self.dependencies) |*deps| {
            var it = deps.iterator();
            while (it.next()) |entry| {
                allocator.free(entry.key_ptr.*);
                allocator.free(entry.value_ptr.*);
            }
            deps.deinit();
        }
    }
};

/// Complete lockfile structure
pub const Lockfile = struct {
    version: []const u8,
    lockfile_version: u32 = 1,
    packages: std.StringHashMap(LockfileEntry),
    generated_at: i64,

    pub fn init(allocator: std.mem.Allocator, version: []const u8) !Lockfile {
        return Lockfile{
            .version = try allocator.dupe(u8, version),
            .lockfile_version = 1,
            .packages = std.StringHashMap(LockfileEntry).init(allocator),
            .generated_at = (std.posix.clock_gettime(.REALTIME) catch std.posix.timespec{ .sec = 0, .nsec = 0 }).sec,
        };
    }

    pub fn deinit(self: *Lockfile, allocator: std.mem.Allocator) void {
        allocator.free(self.version);
        var it = self.packages.iterator();
        while (it.next()) |entry| {
            allocator.free(entry.key_ptr.*);
            var lock_entry = entry.value_ptr.*;
            lock_entry.deinit(allocator);
        }
        self.packages.deinit();
    }

    pub fn addEntry(self: *Lockfile, allocator: std.mem.Allocator, key: []const u8, entry: LockfileEntry) !void {
        try self.packages.put(try allocator.dupe(u8, key), entry);
    }
};

test "PackageSpec lifecycle" {
    const allocator = std.testing.allocator;

    var spec = PackageSpec{
        .name = try allocator.dupe(u8, "node"),
        .version = try allocator.dupe(u8, "20.0.0"),
    };
    defer spec.deinit(allocator);

    try std.testing.expectEqualStrings("node", spec.name);
    try std.testing.expectEqualStrings("20.0.0", spec.version);
}

test "PackageSource string conversion" {
    try std.testing.expectEqualStrings("github", PackageSource.github.toString());
    try std.testing.expectEqualStrings("npm", PackageSource.npm.toString());

    try std.testing.expect(PackageSource.fromString("github") == .github);
    try std.testing.expect(PackageSource.fromString("npm") == .npm);
    try std.testing.expect(PackageSource.fromString("invalid") == null);
}

/// Workspace member information
pub const WorkspaceMember = struct {
    /// Package name
    name: []const u8,
    /// Relative path from workspace root
    path: []const u8,
    /// Absolute path
    abs_path: []const u8,
    /// Config file path (if any)
    config_path: ?[]const u8 = null,
    /// Dependency file path (if any)
    deps_file_path: ?[]const u8 = null,

    pub fn deinit(self: *WorkspaceMember, allocator: std.mem.Allocator) void {
        allocator.free(self.name);
        allocator.free(self.path);
        allocator.free(self.abs_path);
        if (self.config_path) |p| allocator.free(p);
        if (self.deps_file_path) |p| allocator.free(p);
    }
};

/// Workspace configuration
pub const WorkspaceConfig = struct {
    /// Workspace root directory (absolute path)
    root_path: []const u8,
    /// Workspace name (from config or directory name)
    name: []const u8,
    /// Glob patterns for workspace members (e.g., ["packages/*", "apps/*"])
    patterns: [][]const u8,
    /// Discovered workspace members
    members: []WorkspaceMember,

    pub fn deinit(self: *WorkspaceConfig, allocator: std.mem.Allocator) void {
        allocator.free(self.root_path);
        allocator.free(self.name);
        for (self.patterns) |pattern| {
            allocator.free(pattern);
        }
        allocator.free(self.patterns);
        for (self.members) |*member| {
            var m = member.*;
            m.deinit(allocator);
        }
        allocator.free(self.members);
    }
};
