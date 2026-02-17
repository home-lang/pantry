//! Peer Dependency Resolution
//!
//! Handles peer dependencies - dependencies that should be provided by the
//! consuming package's dependency tree rather than bundled with the package.
//!
//! Example: A React component library has React as a peer dependency

const std = @import("std");
const SemverConstraint = @import("../../registry/npm.zig").SemverConstraint;

/// Peer dependency requirement
pub const PeerDependency = struct {
    name: []const u8,
    version_range: []const u8,
    optional: bool = false,
    required_by: []const u8,

    pub fn deinit(self: *PeerDependency, allocator: std.mem.Allocator) void {
        allocator.free(self.name);
        allocator.free(self.version_range);
        allocator.free(self.required_by);
    }
};

/// Peer dependency validation result
pub const ValidationResult = struct {
    satisfied: bool,
    missing: []MissingPeer,
    incompatible: []IncompatiblePeer,
    warnings: []Warning,
    allocator: std.mem.Allocator,

    pub const MissingPeer = struct {
        name: []const u8,
        required_by: []const u8,
        version_range: []const u8,
        optional: bool,

        pub fn deinit(self: *MissingPeer, allocator: std.mem.Allocator) void {
            allocator.free(self.name);
            allocator.free(self.required_by);
            allocator.free(self.version_range);
        }
    };

    pub const IncompatiblePeer = struct {
        name: []const u8,
        required_by: []const u8,
        required_version: []const u8,
        installed_version: []const u8,

        pub fn deinit(self: *IncompatiblePeer, allocator: std.mem.Allocator) void {
            allocator.free(self.name);
            allocator.free(self.required_by);
            allocator.free(self.required_version);
            allocator.free(self.installed_version);
        }
    };

    pub const Warning = struct {
        message: []const u8,

        pub fn deinit(self: *Warning, allocator: std.mem.Allocator) void {
            allocator.free(self.message);
        }
    };

    pub fn deinit(self: *ValidationResult) void {
        for (self.missing) |*peer| {
            peer.deinit(self.allocator);
        }
        self.allocator.free(self.missing);

        for (self.incompatible) |*peer| {
            peer.deinit(self.allocator);
        }
        self.allocator.free(self.incompatible);

        for (self.warnings) |*warning| {
            warning.deinit(self.allocator);
        }
        self.allocator.free(self.warnings);
    }
};

/// Peer dependency manager
pub const PeerDependencyManager = struct {
    allocator: std.mem.Allocator,
    /// Map of package name -> installed version
    installed: std.StringHashMap([]const u8),
    /// List of peer dependencies to validate
    peers: std.ArrayList(PeerDependency),
    /// Auto-install missing peers (default: false, warn only)
    auto_install: bool = false,

    pub fn init(allocator: std.mem.Allocator) PeerDependencyManager {
        return .{
            .allocator = allocator,
            .installed = std.StringHashMap([]const u8).init(allocator),
            .peers = .{},
        };
    }

    pub fn deinit(self: *PeerDependencyManager) void {
        // Free installed map
        var installed_it = self.installed.iterator();
        while (installed_it.next()) |entry| {
            self.allocator.free(entry.key_ptr.*);
            self.allocator.free(entry.value_ptr.*);
        }
        self.installed.deinit();

        // Free peers list
        for (self.peers.items) |*peer| {
            peer.deinit(self.allocator);
        }
        self.peers.deinit(self.allocator);
    }

    /// Record an installed package
    pub fn recordInstalled(self: *PeerDependencyManager, name: []const u8, version: []const u8) !void {
        const name_copy = try self.allocator.dupe(u8, name);
        errdefer self.allocator.free(name_copy);

        const version_copy = try self.allocator.dupe(u8, version);
        errdefer self.allocator.free(version_copy);

        try self.installed.put(name_copy, version_copy);
    }

    /// Add a peer dependency requirement
    pub fn addPeerDependency(
        self: *PeerDependencyManager,
        name: []const u8,
        version_range: []const u8,
        required_by: []const u8,
        optional: bool,
    ) !void {
        try self.peers.append(self.allocator, .{
            .name = try self.allocator.dupe(u8, name),
            .version_range = try self.allocator.dupe(u8, version_range),
            .required_by = try self.allocator.dupe(u8, required_by),
            .optional = optional,
        });
    }

    /// Validate all peer dependencies
    pub fn validate(self: *PeerDependencyManager) !ValidationResult {
        var missing: std.ArrayList(ValidationResult.MissingPeer) = .{};
        var incompatible: std.ArrayList(ValidationResult.IncompatiblePeer) = .{};
        var warnings: std.ArrayList(ValidationResult.Warning) = .{};

        for (self.peers.items) |peer| {
            const installed_version = self.installed.get(peer.name);

            if (installed_version == null) {
                // Peer is missing
                try missing.append(self.allocator, .{
                    .name = try self.allocator.dupe(u8, peer.name),
                    .required_by = try self.allocator.dupe(u8, peer.required_by),
                    .version_range = try self.allocator.dupe(u8, peer.version_range),
                    .optional = peer.optional,
                });

                if (peer.optional) {
                    const warning_msg = try std.fmt.allocPrint(
                        self.allocator,
                        "Optional peer dependency '{s}@{s}' not found (required by {s})",
                        .{ peer.name, peer.version_range, peer.required_by },
                    );
                    try warnings.append(self.allocator, .{ .message = warning_msg });
                }
            } else {
                // Check version compatibility
                const installed = installed_version.?;
                if (!satisfiesRange(installed, peer.version_range)) {
                    try incompatible.append(self.allocator, .{
                        .name = try self.allocator.dupe(u8, peer.name),
                        .required_by = try self.allocator.dupe(u8, peer.required_by),
                        .required_version = try self.allocator.dupe(u8, peer.version_range),
                        .installed_version = try self.allocator.dupe(u8, installed),
                    });
                }
            }
        }

        const satisfied = missing.items.len == 0 and incompatible.items.len == 0;

        return .{
            .satisfied = satisfied,
            .missing = try missing.toOwnedSlice(self.allocator),
            .incompatible = try incompatible.toOwnedSlice(self.allocator),
            .warnings = try warnings.toOwnedSlice(self.allocator),
            .allocator = self.allocator,
        };
    }

    /// Get list of packages to auto-install
    pub fn getAutoInstallList(self: *PeerDependencyManager) ![]PeerDependency {
        if (!self.auto_install) {
            return &[_]PeerDependency{};
        }

        var to_install = std.ArrayList(PeerDependency).init(self.allocator);

        for (self.peers.items) |peer| {
            // Only auto-install if not already installed and not optional
            if (self.installed.get(peer.name) == null and !peer.optional) {
                try to_install.append(.{
                    .name = try self.allocator.dupe(u8, peer.name),
                    .version_range = try self.allocator.dupe(u8, peer.version_range),
                    .required_by = try self.allocator.dupe(u8, peer.required_by),
                    .optional = peer.optional,
                });
            }
        }

        return try to_install.toOwnedSlice();
    }

    /// Format validation report
    pub fn formatValidationReport(result: *const ValidationResult, allocator: std.mem.Allocator) ![]const u8 {
        var output = try std.ArrayList(u8).initCapacity(allocator, 256);
        defer output.deinit(allocator);

        if (result.satisfied) {
            try output.appendSlice(allocator, "✓ All peer dependencies satisfied\n");
            return try output.toOwnedSlice(allocator);
        }

        try output.appendSlice(allocator, "Peer dependency issues:\n\n");

        // Missing peers
        if (result.missing.len > 0) {
            try output.print(allocator, "Missing peer dependencies ({d}):\n", .{result.missing.len});
            for (result.missing) |peer| {
                if (peer.optional) {
                    try output.print(allocator, "  ⚠  {s}@{s} (optional, required by {s})\n", .{
                        peer.name,
                        peer.version_range,
                        peer.required_by,
                    });
                } else {
                    try output.print(allocator, "  ✗  {s}@{s} (required by {s})\n", .{
                        peer.name,
                        peer.version_range,
                        peer.required_by,
                    });
                }
            }
            try output.appendSlice(allocator, "\n");
        }

        // Incompatible peers
        if (result.incompatible.len > 0) {
            try output.print(allocator, "Incompatible peer dependencies ({d}):\n", .{result.incompatible.len});
            for (result.incompatible) |peer| {
                try output.print(allocator, "  ✗  {s}: installed {s}, but {s} requires {s}\n", .{
                    peer.name,
                    peer.installed_version,
                    peer.required_by,
                    peer.required_version,
                });
            }
            try output.appendSlice(allocator, "\n");
        }

        // Warnings
        if (result.warnings.len > 0) {
            try output.print(allocator, "Warnings ({d}):\n", .{result.warnings.len});
            for (result.warnings) |warning| {
                try output.print(allocator, "  ⚠  {s}\n", .{warning.message});
            }
        }

        return try output.toOwnedSlice(allocator);
    }
};

/// Check if a version satisfies a semver range constraint.
/// Supports compound ranges separated by spaces (e.g. ">=1.0.0 <2.0.0")
/// and logical OR ranges separated by "||" (e.g. "^1.0.0 || ^2.0.0").
fn satisfiesRange(version: []const u8, range: []const u8) bool {
    // Handle wildcard / empty ranges
    if (range.len == 0 or std.mem.eql(u8, range, "*") or std.mem.eql(u8, range, "latest")) {
        return true;
    }

    // Split on "||" for logical OR groups — any group matching is sufficient
    var or_iter = std.mem.splitSequence(u8, range, "||");
    while (or_iter.next()) |or_segment| {
        const trimmed = std.mem.trim(u8, or_segment, " \t");
        if (trimmed.len == 0) continue;

        if (satisfiesAndGroup(version, trimmed)) {
            return true;
        }
    }

    return false;
}

/// Check if a version satisfies all constraints in a space-separated AND group.
/// e.g. ">=1.0.0 <2.0.0" means version must satisfy BOTH constraints.
fn satisfiesAndGroup(version: []const u8, group: []const u8) bool {
    var pos: usize = 0;
    while (pos < group.len) {
        // Skip whitespace
        while (pos < group.len and (group[pos] == ' ' or group[pos] == '\t')) {
            pos += 1;
        }
        if (pos >= group.len) break;

        // Find end of this constraint token
        const start = pos;
        // Advance past operator prefix
        while (pos < group.len and (group[pos] == '^' or group[pos] == '~' or
            group[pos] == '>' or group[pos] == '<' or group[pos] == '=' or group[pos] == 'v'))
        {
            pos += 1;
        }
        // Advance past version number (digits, dots, hyphens, plus)
        while (pos < group.len and group[pos] != ' ' and group[pos] != '\t') {
            pos += 1;
        }

        const token = std.mem.trim(u8, group[start..pos], " \t");
        if (token.len == 0) continue;

        const constraint = SemverConstraint.parse(token) catch return false;
        if (!constraint.satisfies(version)) {
            return false;
        }
    }
    return true;
}
