const std = @import("std");

/// Package specification
pub const PackageSpec = struct {
    /// Package name
    name: []const u8,
    /// Package version (semantic version)
    version: []const u8,
    /// Platform override (optional)
    platform: ?[]const u8 = null,
    /// Architecture override (optional)
    arch: ?[]const u8 = null,

    pub fn deinit(self: *PackageSpec, allocator: std.mem.Allocator) void {
        allocator.free(self.name);
        allocator.free(self.version);
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
