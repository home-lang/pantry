const std = @import("std");
const io_helper = @import("../io_helper.zig");

/// Package source types
pub const PackageSource = enum {
    pantry, // Pantry registry (system packages)
    github, // GitHub releases or repositories
    npm, // npm registry
    http, // Direct HTTP download
    git, // Git repository
    local, // Local filesystem path (linked package)
    ziglang, // ziglang.org official releases (stable and dev)

    pub fn toString(self: PackageSource) []const u8 {
        return switch (self) {
            .pantry => "pantry",
            .github => "github",
            .npm => "npm",
            .http => "http",
            .git => "git",
            .local => "local",
            .ziglang => "ziglang",
        };
    }

    pub fn fromString(s: []const u8) ?PackageSource {
        if (std.mem.eql(u8, s, "pantry")) return .pantry;
        if (std.mem.eql(u8, s, "pkgx")) return .pantry; // backwards compat
        if (std.mem.eql(u8, s, "github")) return .github;
        if (std.mem.eql(u8, s, "npm")) return .npm;
        if (std.mem.eql(u8, s, "http")) return .http;
        if (std.mem.eql(u8, s, "git")) return .git;
        if (std.mem.eql(u8, s, "local")) return .local;
        if (std.mem.eql(u8, s, "ziglang")) return .ziglang;
        return null;
    }
};

/// Package specification
pub const PackageSpec = struct {
    /// Package name
    name: []const u8,
    /// Package version (semantic version)
    version: []const u8,
    /// Package source (default: pantry)
    source: PackageSource = .pantry,
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
        self.dependencies.deinit(allocator);
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
    resolved: ?[]const u8 = null, // Actual download URL (tarball)
    integrity: ?[]const u8 = null, // Integrity hash (sha512 or shasum)
    dependencies: ?std.StringHashMap([]const u8) = null,
    peer_dependencies: ?std.StringHashMap([]const u8) = null,
    bin: ?std.StringHashMap([]const u8) = null,
    optional_peers: ?std.StringHashMap(bool) = null,

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
            deps.deinit(allocator);
        }
        if (self.peer_dependencies) |*deps| {
            var it = deps.iterator();
            while (it.next()) |entry| {
                allocator.free(entry.key_ptr.*);
                allocator.free(entry.value_ptr.*);
            }
            deps.deinit(allocator);
        }
        if (self.bin) |*b| {
            var it = b.iterator();
            while (it.next()) |entry| {
                allocator.free(entry.key_ptr.*);
                allocator.free(entry.value_ptr.*);
            }
            b.deinit(allocator);
        }
        if (self.optional_peers) |*op| {
            var it = op.iterator();
            while (it.next()) |entry| {
                allocator.free(entry.key_ptr.*);
            }
            op.deinit(allocator);
        }
    }
};

/// Workspace dependency isolation mode
pub const WorkspaceIsolation = enum {
    /// Shared: all workspace members share the same dependency versions (default)
    shared,
    /// Isolated: each workspace member resolves its own dependency versions
    isolated,
    /// Inherit: use the root workspace's dependencies, members can override
    inherit,

    pub fn toString(self: WorkspaceIsolation) []const u8 {
        return switch (self) {
            .shared => "shared",
            .isolated => "isolated",
            .inherit => "inherit",
        };
    }

    pub fn fromString(s: []const u8) ?WorkspaceIsolation {
        if (std.mem.eql(u8, s, "shared")) return .shared;
        if (std.mem.eql(u8, s, "isolated")) return .isolated;
        if (std.mem.eql(u8, s, "inherit")) return .inherit;
        return null;
    }
};

/// Workspace member entry in the lockfile
/// Records what each workspace member declared as dependencies
pub const WorkspaceLockEntry = struct {
    name: []const u8,
    version: ?[]const u8 = null,
    dependencies: ?std.StringHashMap([]const u8) = null,
    dev_dependencies: ?std.StringHashMap([]const u8) = null,
    system: ?std.StringHashMap([]const u8) = null,
    /// Per-workspace dependency isolation mode
    isolation: WorkspaceIsolation = .shared,

    pub fn deinit(self: *WorkspaceLockEntry, allocator: std.mem.Allocator) void {
        allocator.free(self.name);
        if (self.version) |v| allocator.free(v);
        inline for (.{ "dependencies", "dev_dependencies", "system" }) |field_name| {
            if (@field(self, field_name)) |*deps| {
                var it = deps.iterator();
                while (it.next()) |entry| {
                    allocator.free(entry.key_ptr.*);
                    allocator.free(entry.value_ptr.*);
                }
                deps.deinit(allocator);
            }
        }
    }
};

/// Complete lockfile structure
pub const Lockfile = struct {
    version: []const u8,
    lockfile_version: u32 = 2,
    workspaces: std.StringHashMap(WorkspaceLockEntry),
    packages: std.StringHashMap(LockfileEntry),
    generated_at: i64,

    pub fn init(allocator: std.mem.Allocator, version: []const u8) !Lockfile {
        return Lockfile{
            .version = try allocator.dupe(u8, version),
            .lockfile_version = 2,
            .workspaces = std.StringHashMap(WorkspaceLockEntry).init(allocator),
            .packages = std.StringHashMap(LockfileEntry).init(allocator),
            .generated_at = (io_helper.clockGettime()).sec,
        };
    }

    pub fn deinit(self: *Lockfile, allocator: std.mem.Allocator) void {
        allocator.free(self.version);
        var ws_it = self.workspaces.iterator();
        while (ws_it.next()) |entry| {
            allocator.free(entry.key_ptr.*);
            var ws_entry = entry.value_ptr.*;
            ws_entry.deinit(allocator);
        }
        self.workspaces.deinit(allocator);
        var it = self.packages.iterator();
        while (it.next()) |entry| {
            allocator.free(entry.key_ptr.*);
            var lock_entry = entry.value_ptr.*;
            lock_entry.deinit(allocator);
        }
        self.packages.deinit(allocator);
    }

    pub fn addEntry(self: *Lockfile, allocator: std.mem.Allocator, key: []const u8, entry: LockfileEntry) !void {
        try self.packages.put(try allocator.dupe(u8, key), entry);
    }

    pub fn addWorkspace(self: *Lockfile, allocator: std.mem.Allocator, path: []const u8, entry: WorkspaceLockEntry) !void {
        try self.workspaces.put(try allocator.dupe(u8, path), entry);
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
