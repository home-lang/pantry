//! Optional Dependencies
//!
//! Handles optional dependencies - dependencies that enhance functionality
//! but are not required for core operation. Installation failures of optional
//! dependencies should not fail the entire installation.

const std = @import("std");

/// Optional dependency specification
pub const OptionalDependency = struct {
    name: []const u8,
    version: []const u8,
    reason: ?[]const u8 = null,
    platform_specific: bool = false,
    platforms: [][]const u8 = &[_][]const u8{},

    pub fn deinit(self: *OptionalDependency, allocator: std.mem.Allocator) void {
        allocator.free(self.name);
        allocator.free(self.version);
        if (self.reason) |reason| {
            allocator.free(reason);
        }
        for (self.platforms) |platform| {
            allocator.free(platform);
        }
        if (self.platforms.len > 0) {
            allocator.free(self.platforms);
        }
    }
};

/// Installation result for optional dependency
pub const InstallResult = struct {
    name: []const u8,
    success: bool,
    error_message: ?[]const u8 = null,
    skipped: bool = false,
    skip_reason: ?[]const u8 = null,

    pub fn deinit(self: *InstallResult, allocator: std.mem.Allocator) void {
        allocator.free(self.name);
        if (self.error_message) |msg| {
            allocator.free(msg);
        }
        if (self.skip_reason) |reason| {
            allocator.free(reason);
        }
    }
};

/// Optional dependency manager
pub const OptionalDependencyManager = struct {
    allocator: std.mem.Allocator,
    /// Map of package name -> optional dependency info
    optional_deps: std.StringHashMap(OptionalDependency),
    /// Installation results
    results: std.ArrayList(InstallResult),
    /// Current platform
    current_platform: []const u8,
    /// Continue on failure (default: true for optional deps)
    continue_on_failure: bool = true,

    pub fn init(allocator: std.mem.Allocator) !OptionalDependencyManager {
        const platform = try detectPlatform(allocator);
        return .{
            .allocator = allocator,
            .optional_deps = std.StringHashMap(OptionalDependency).init(allocator),
            .results = .{},
            .current_platform = platform,
        };
    }

    pub fn deinit(self: *OptionalDependencyManager) void {
        self.allocator.free(self.current_platform);

        var it = self.optional_deps.iterator();
        while (it.next()) |entry| {
            self.allocator.free(entry.key_ptr.*);
            var dep = entry.value_ptr.*;
            dep.deinit(self.allocator);
        }
        self.optional_deps.deinit();

        for (self.results.items) |*result| {
            result.deinit(self.allocator);
        }
        self.results.deinit(self.allocator);
    }

    /// Add an optional dependency
    pub fn addOptionalDependency(
        self: *OptionalDependencyManager,
        dep: OptionalDependency,
    ) !void {
        const name_copy = try self.allocator.dupe(u8, dep.name);
        try self.optional_deps.put(name_copy, dep);
    }

    /// Check if a dependency should be installed on current platform
    pub fn shouldInstall(self: *OptionalDependencyManager, name: []const u8) bool {
        const dep = self.optional_deps.get(name) orelse return false;

        if (!dep.platform_specific) {
            return true;
        }

        // Check if current platform is in the list
        for (dep.platforms) |platform| {
            if (std.mem.eql(u8, platform, self.current_platform)) {
                return true;
            }
        }

        return false;
    }

    /// Record installation result
    pub fn recordResult(
        self: *OptionalDependencyManager,
        name: []const u8,
        success: bool,
        error_message: ?[]const u8,
    ) !void {
        try self.results.append(self.allocator, .{
            .name = try self.allocator.dupe(u8, name),
            .success = success,
            .error_message = if (error_message) |msg| try self.allocator.dupe(u8, msg) else null,
            .skipped = false,
        });
    }

    /// Record skipped installation
    pub fn recordSkipped(
        self: *OptionalDependencyManager,
        name: []const u8,
        reason: []const u8,
    ) !void {
        try self.results.append(self.allocator, .{
            .name = try self.allocator.dupe(u8, name),
            .success = false,
            .skipped = true,
            .skip_reason = try self.allocator.dupe(u8, reason),
        });
    }

    /// Get summary of installation results
    pub fn getSummary(self: *OptionalDependencyManager) Summary {
        var installed: usize = 0;
        var failed: usize = 0;
        var skipped: usize = 0;

        for (self.results.items) |result| {
            if (result.skipped) {
                skipped += 1;
            } else if (result.success) {
                installed += 1;
            } else {
                failed += 1;
            }
        }

        return .{
            .total = self.results.items.len,
            .installed = installed,
            .failed = failed,
            .skipped = skipped,
        };
    }

    /// Format installation report
    pub fn formatReport(self: *OptionalDependencyManager, allocator: std.mem.Allocator) ![]const u8 {
        var output: std.ArrayList(u8) = .{};
        defer output.deinit(allocator);
        const writer = output.writer(allocator);

        const summary = self.getSummary();

        try writer.print("\nOptional dependencies ({d} total):\n", .{summary.total});

        if (summary.installed > 0) {
            try writer.print("  ✓ Installed: {d}\n", .{summary.installed});
        }

        if (summary.skipped > 0) {
            try writer.print("  ⊘ Skipped: {d}\n", .{summary.skipped});
        }

        if (summary.failed > 0) {
            try writer.print("  ✗ Failed: {d}\n", .{summary.failed});
        }

        // Detail section
        if (summary.failed > 0 or summary.skipped > 0) {
            try writer.writeAll("\nDetails:\n");

            for (self.results.items) |result| {
                if (result.skipped) {
                    try writer.print("  ⊘ {s}", .{result.name});
                    if (result.skip_reason) |reason| {
                        try writer.print(" - {s}", .{reason});
                    }
                    try writer.writeAll("\n");
                } else if (!result.success) {
                    try writer.print("  ✗ {s}", .{result.name});
                    if (result.error_message) |msg| {
                        try writer.print(" - {s}", .{msg});
                    }
                    try writer.writeAll("\n");
                }
            }
        }

        return try output.toOwnedSlice(allocator);
    }

    pub const Summary = struct {
        total: usize,
        installed: usize,
        failed: usize,
        skipped: usize,
    };
};

/// Detect current platform
fn detectPlatform(allocator: std.mem.Allocator) ![]const u8 {
    const builtin = @import("builtin");
    const os_tag = builtin.os.tag;
    const arch = builtin.cpu.arch;

    const os_str = switch (os_tag) {
        .linux => "linux",
        .macos => "darwin",
        .windows => "win32",
        else => "unknown",
    };

    const arch_str = switch (arch) {
        .x86_64 => "x64",
        .aarch64 => "arm64",
        .x86 => "ia32",
        else => "unknown",
    };

    return try std.fmt.allocPrint(allocator, "{s}-{s}", .{ os_str, arch_str });
}

/// Parse optional dependencies from package.json
pub fn parseFromPackageJson(
    allocator: std.mem.Allocator,
    parsed: std.json.Parsed(std.json.Value),
) !std.ArrayList(OptionalDependency) {
    var deps = std.ArrayList(OptionalDependency).init(allocator);
    errdefer {
        for (deps.items) |*dep| {
            dep.deinit(allocator);
        }
        deps.deinit();
    }

    const root = parsed.value.object;

    // Check for optionalDependencies field
    if (root.get("optionalDependencies")) |optional_deps| {
        if (optional_deps != .object) return deps;

        var it = optional_deps.object.iterator();
        while (it.next()) |entry| {
            const name = entry.key_ptr.*;
            const version = switch (entry.value_ptr.*) {
                .string => |s| s,
                else => continue,
            };

            try deps.append(.{
                .name = try allocator.dupe(u8, name),
                .version = try allocator.dupe(u8, version),
            });
        }
    }

    return deps;
}
