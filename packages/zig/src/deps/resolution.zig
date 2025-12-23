//! Dependency Resolution Module
//!
//! Advanced dependency resolution features including:
//! - Conflict resolution with multiple strategies
//! - Peer dependency management and validation
//! - Optional dependency handling
//! - Lock file generation and validation

const std = @import("std");

pub const conflict = @import("resolution/conflict.zig");
pub const peer = @import("resolution/peer.zig");
pub const optional = @import("resolution/optional.zig");
pub const lockfile = @import("resolution/lockfile.zig");

// Re-export commonly used types
pub const ResolutionStrategy = conflict.ResolutionStrategy;
pub const ConflictResolver = conflict.ConflictResolver;
pub const VersionChecker = conflict.VersionChecker;

pub const PeerDependency = peer.PeerDependency;
pub const PeerDependencyManager = peer.PeerDependencyManager;

pub const OptionalDependency = optional.OptionalDependency;
pub const OptionalDependencyManager = optional.OptionalDependencyManager;

pub const LockFile = lockfile.LockFile;
pub const LockedPackage = lockfile.LockedPackage;

/// Complete dependency resolution context
pub const ResolutionContext = struct {
    allocator: std.mem.Allocator,
    conflict_resolver: ConflictResolver,
    peer_manager: PeerDependencyManager,
    optional_manager: OptionalDependencyManager,
    lock_file: ?LockFile = null,

    pub fn init(
        allocator: std.mem.Allocator,
        strategy: ResolutionStrategy,
    ) !ResolutionContext {
        return .{
            .allocator = allocator,
            .conflict_resolver = ConflictResolver.init(allocator, strategy),
            .peer_manager = PeerDependencyManager.init(allocator),
            .optional_manager = try OptionalDependencyManager.init(allocator),
        };
    }

    pub fn deinit(self: *ResolutionContext) void {
        self.conflict_resolver.deinit();
        self.peer_manager.deinit();
        self.optional_manager.deinit();
        if (self.lock_file) |*lock| {
            lock.deinit();
        }
    }

    /// Load lock file if it exists
    pub fn loadLockFile(self: *ResolutionContext, path: []const u8) !void {
        self.lock_file = LockFile.read(self.allocator, path) catch |err| {
            if (err == error.FileNotFound) {
                return; // No lock file exists yet
            }
            return err;
        };
    }

    /// Save lock file
    pub fn saveLockFile(self: *ResolutionContext, path: []const u8) !void {
        if (self.lock_file) |*lock| {
            try lock.write(path);
        } else {
            return error.NoLockFileToSave;
        }
    }

    /// Resolve all dependencies
    pub fn resolveAll(self: *ResolutionContext) !ResolutionResult {
        // Resolve conflicts
        var conflict_resolutions = try self.conflict_resolver.resolveAll();
        errdefer {
            var it = conflict_resolutions.iterator();
            while (it.next()) |entry| {
                self.allocator.free(entry.key_ptr.*);
                self.allocator.free(entry.value_ptr.*);
            }
            conflict_resolutions.deinit();
        }

        // Validate peer dependencies
        var peer_validation = try self.peer_manager.validate();
        errdefer peer_validation.deinit();

        // Get optional dependency summary
        const optional_summary = self.optional_manager.getSummary();

        return .{
            .conflict_resolutions = conflict_resolutions,
            .peer_validation = peer_validation,
            .optional_summary = optional_summary,
            .allocator = self.allocator,
        };
    }
};

/// Combined resolution result
pub const ResolutionResult = struct {
    conflict_resolutions: std.StringHashMap([]const u8),
    peer_validation: peer.ValidationResult,
    optional_summary: OptionalDependencyManager.Summary,
    allocator: std.mem.Allocator,

    pub fn deinit(self: *ResolutionResult) void {
        var it = self.conflict_resolutions.iterator();
        while (it.next()) |entry| {
            self.allocator.free(entry.key_ptr.*);
            self.allocator.free(entry.value_ptr.*);
        }
        self.conflict_resolutions.deinit();

        self.peer_validation.deinit();
    }

    /// Format complete resolution report
    pub fn formatReport(self: *const ResolutionResult, allocator: std.mem.Allocator) ![]const u8 {
        var output = try std.ArrayList(u8).initCapacity(allocator, 512);
        defer output.deinit(allocator);

        try output.appendSlice(allocator, "=== Dependency Resolution Report ===\n\n");

        // Conflict resolutions
        if (self.conflict_resolutions.count() > 0) {
            try output.print(allocator, "Resolved conflicts ({d}):\n", .{self.conflict_resolutions.count()});
            var it = self.conflict_resolutions.iterator();
            while (it.next()) |entry| {
                try output.print(allocator, "  ✓ {s} -> {s}\n", .{ entry.key_ptr.*, entry.value_ptr.* });
            }
            try output.appendSlice(allocator, "\n");
        }

        // Peer dependencies
        if (!self.peer_validation.satisfied) {
            const peer_report = try PeerDependencyManager.formatValidationReport(&self.peer_validation, allocator);
            defer allocator.free(peer_report);
            try output.appendSlice(allocator, peer_report);
            try output.appendSlice(allocator, "\n");
        } else {
            try output.appendSlice(allocator, "✓ All peer dependencies satisfied\n\n");
        }

        // Optional dependencies
        if (self.optional_summary.total > 0) {
            try output.print(allocator, "Optional dependencies:\n", .{});
            try output.print(allocator, "  Installed: {d}/{d}\n", .{
                self.optional_summary.installed,
                self.optional_summary.total,
            });
            if (self.optional_summary.failed > 0) {
                try output.print(allocator, "  Failed: {d}\n", .{self.optional_summary.failed});
            }
            if (self.optional_summary.skipped > 0) {
                try output.print(allocator, "  Skipped: {d}\n", .{self.optional_summary.skipped});
            }
        }

        return try output.toOwnedSlice(allocator);
    }
};
