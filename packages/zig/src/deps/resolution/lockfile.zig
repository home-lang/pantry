//! Lock File Generation and Validation
//!
//! Lock files ensure reproducible installs by recording exact versions
//! and integrity hashes of all installed dependencies.
//!
//! Format: pantry.lock (JSON)

const std = @import("std");

/// Lock file format version
pub const LOCK_FILE_VERSION = "1.0";
pub const LOCK_FILE_NAME = "pantry.lock";

/// Package entry in lock file
pub const LockedPackage = struct {
    name: []const u8,
    version: []const u8,
    resolved: []const u8, // URL or registry identifier
    integrity: ?[]const u8 = null, // SHA-512 hash
    dependencies: std.StringHashMap([]const u8),
    dev: bool = false,
    optional: bool = false,
    allocator: std.mem.Allocator,

    pub fn init(allocator: std.mem.Allocator) LockedPackage {
        return .{
            .name = "",
            .version = "",
            .resolved = "",
            .dependencies = std.StringHashMap([]const u8).init(allocator),
            .allocator = allocator,
        };
    }

    pub fn deinit(self: *LockedPackage) void {
        self.allocator.free(self.name);
        self.allocator.free(self.version);
        self.allocator.free(self.resolved);
        if (self.integrity) |integrity| {
            self.allocator.free(integrity);
        }

        var it = self.dependencies.iterator();
        while (it.next()) |entry| {
            self.allocator.free(entry.key_ptr.*);
            self.allocator.free(entry.value_ptr.*);
        }
        self.dependencies.deinit();
    }
};

/// Lock file structure
pub const LockFile = struct {
    version: []const u8,
    packages: std.StringHashMap(LockedPackage),
    allocator: std.mem.Allocator,

    pub fn init(allocator: std.mem.Allocator) LockFile {
        return .{
            .version = LOCK_FILE_VERSION,
            .packages = std.StringHashMap(LockedPackage).init(allocator),
            .allocator = allocator,
        };
    }

    pub fn deinit(self: *LockFile) void {
        var it = self.packages.iterator();
        while (it.next()) |entry| {
            self.allocator.free(entry.key_ptr.*);
            var pkg = entry.value_ptr.*;
            pkg.deinit();
        }
        self.packages.deinit();
    }

    /// Add a package to the lock file
    pub fn addPackage(
        self: *LockFile,
        name: []const u8,
        version: []const u8,
        resolved: []const u8,
        integrity: ?[]const u8,
    ) !void {
        const key = try self.createKey(name, version);
        errdefer self.allocator.free(key);

        var pkg = LockedPackage.init(self.allocator);
        pkg.name = try self.allocator.dupe(u8, name);
        pkg.version = try self.allocator.dupe(u8, version);
        pkg.resolved = try self.allocator.dupe(u8, resolved);
        if (integrity) |hash| {
            pkg.integrity = try self.allocator.dupe(u8, hash);
        }

        try self.packages.put(key, pkg);
    }

    /// Get a locked package
    pub fn getPackage(self: *LockFile, name: []const u8, version: []const u8) ?*LockedPackage {
        const key_buf = self.createKey(name, version) catch return null;
        defer self.allocator.free(key_buf);

        return self.packages.getPtr(key_buf);
    }

    /// Create a unique key for a package
    fn createKey(self: *LockFile, name: []const u8, version: []const u8) ![]const u8 {
        return try std.fmt.allocPrint(self.allocator, "{s}@{s}", .{ name, version });
    }

    /// Write lock file to disk
    pub fn write(self: *LockFile, path: []const u8) !void {
        var output: std.ArrayList(u8) = .{};
        defer output.deinit(self.allocator);

        try output.appendSlice(self.allocator, "{\n");
        var buf: [1024]u8 = undefined;
        const version_line = try std.fmt.bufPrint(&buf, "  \"version\": \"{s}\",\n", .{self.version});
        try output.appendSlice(self.allocator, version_line);
        try output.appendSlice(self.allocator, "  \"packages\": {\n");

        var it = self.packages.iterator();
        var first = true;
        while (it.next()) |entry| {
            if (!first) {
                try output.appendSlice(self.allocator, ",\n");
            }
            first = false;

            const key = entry.key_ptr.*;
            const pkg = entry.value_ptr.*;

            const key_line = try std.fmt.bufPrint(&buf, "    \"{s}\": {{\n", .{key});
            try output.appendSlice(self.allocator, key_line);
            const name_line = try std.fmt.bufPrint(&buf, "      \"name\": \"{s}\",\n", .{pkg.name});
            try output.appendSlice(self.allocator, name_line);
            const version_line2 = try std.fmt.bufPrint(&buf, "      \"version\": \"{s}\",\n", .{pkg.version});
            try output.appendSlice(self.allocator, version_line2);
            const resolved_line = try std.fmt.bufPrint(&buf, "      \"resolved\": \"{s}\"", .{pkg.resolved});
            try output.appendSlice(self.allocator, resolved_line);

            if (pkg.integrity) |integrity| {
                const integrity_line = try std.fmt.bufPrint(&buf, ",\n      \"integrity\": \"{s}\"", .{integrity});
                try output.appendSlice(self.allocator, integrity_line);
            }

            if (pkg.dev) {
                try output.appendSlice(self.allocator, ",\n      \"dev\": true");
            }

            if (pkg.optional) {
                try output.appendSlice(self.allocator, ",\n      \"optional\": true");
            }

            if (pkg.dependencies.count() > 0) {
                try output.appendSlice(self.allocator, ",\n      \"dependencies\": {\n");

                var dep_it = pkg.dependencies.iterator();
                var dep_first = true;
                while (dep_it.next()) |dep_entry| {
                    if (!dep_first) {
                        try output.appendSlice(self.allocator, ",\n");
                    }
                    dep_first = false;

                    const dep_line = try std.fmt.bufPrint(&buf, "        \"{s}\": \"{s}\"", .{
                        dep_entry.key_ptr.*,
                        dep_entry.value_ptr.*,
                    });
                    try output.appendSlice(self.allocator, dep_line);
                }

                try output.appendSlice(self.allocator, "\n      }");
            }

            try output.appendSlice(self.allocator, "\n    }");
        }

        try output.appendSlice(self.allocator, "\n  }\n}\n");

        const file = try std.Io.Dir.cwd().createFile(path, .{});
        defer file.close();

        const content = try output.toOwnedSlice(self.allocator);
        defer self.allocator.free(content);

        try file.writeAll(content);
    }

    /// Read lock file from disk
    pub fn read(allocator: std.mem.Allocator, path: []const u8) !LockFile {
        const content = try std.Io.Dir.cwd().readFileAlloc(path, allocator, std.Io.Limit.limited(10 * 1024 * 1024));
        defer allocator.free(content);

        return try parse(allocator, content);
    }

    /// Parse lock file from JSON string
    pub fn parse(allocator: std.mem.Allocator, json_str: []const u8) !LockFile {
        const parsed = try std.json.parseFromSlice(std.json.Value, allocator, json_str, .{});
        defer parsed.deinit();

        var lock_file = LockFile.init(allocator);
        errdefer lock_file.deinit();

        const root = parsed.value.object;

        // Get version
        if (root.get("version")) |version_val| {
            if (version_val == .string) {
                // Version is checked but not stored (we use constant)
                _ = version_val.string;
            }
        }

        // Parse packages
        if (root.get("packages")) |packages_val| {
            if (packages_val != .object) return error.InvalidLockFile;

            var it = packages_val.object.iterator();
            while (it.next()) |entry| {
                const key = entry.key_ptr.*;
                const pkg_val = entry.value_ptr.*;

                if (pkg_val != .object) continue;

                var pkg = LockedPackage.init(allocator);
                errdefer pkg.deinit();

                // Parse package fields
                if (pkg_val.object.get("name")) |name| {
                    if (name == .string) {
                        pkg.name = try allocator.dupe(u8, name.string);
                    }
                }

                if (pkg_val.object.get("version")) |version| {
                    if (version == .string) {
                        pkg.version = try allocator.dupe(u8, version.string);
                    }
                }

                if (pkg_val.object.get("resolved")) |resolved| {
                    if (resolved == .string) {
                        pkg.resolved = try allocator.dupe(u8, resolved.string);
                    }
                }

                if (pkg_val.object.get("integrity")) |integrity| {
                    if (integrity == .string) {
                        pkg.integrity = try allocator.dupe(u8, integrity.string);
                    }
                }

                if (pkg_val.object.get("dev")) |dev| {
                    if (dev == .bool) {
                        pkg.dev = dev.bool;
                    }
                }

                if (pkg_val.object.get("optional")) |optional| {
                    if (optional == .bool) {
                        pkg.optional = optional.bool;
                    }
                }

                // Parse dependencies
                if (pkg_val.object.get("dependencies")) |deps| {
                    if (deps == .object) {
                        var dep_it = deps.object.iterator();
                        while (dep_it.next()) |dep_entry| {
                            const dep_name = dep_entry.key_ptr.*;
                            const dep_version = switch (dep_entry.value_ptr.*) {
                                .string => |s| s,
                                else => continue,
                            };

                            try pkg.dependencies.put(
                                try allocator.dupe(u8, dep_name),
                                try allocator.dupe(u8, dep_version),
                            );
                        }
                    }
                }

                try lock_file.packages.put(try allocator.dupe(u8, key), pkg);
            }
        }

        return lock_file;
    }

    /// Validate that installed packages match lock file
    pub fn validate(
        self: *LockFile,
        installed: std.StringHashMap([]const u8),
    ) !ValidationResult {
        var missing: std.ArrayList([]const u8) = .{};
        var version_mismatch: std.ArrayList(ValidationResult.VersionMismatch) = .{};

        var it = self.packages.iterator();
        while (it.next()) |entry| {
            const pkg = entry.value_ptr.*;

            const installed_version = installed.get(pkg.name);
            if (installed_version == null) {
                try missing.append(self.allocator, try self.allocator.dupe(u8, pkg.name));
            } else if (!std.mem.eql(u8, installed_version.?, pkg.version)) {
                try version_mismatch.append(self.allocator, .{
                    .name = try self.allocator.dupe(u8, pkg.name),
                    .expected = try self.allocator.dupe(u8, pkg.version),
                    .actual = try self.allocator.dupe(u8, installed_version.?),
                });
            }
        }

        const valid = missing.items.len == 0 and version_mismatch.items.len == 0;

        return .{
            .valid = valid,
            .missing = try missing.toOwnedSlice(self.allocator),
            .version_mismatch = try version_mismatch.toOwnedSlice(self.allocator),
            .allocator = self.allocator,
        };
    }
};

/// Lock file validation result
pub const ValidationResult = struct {
    valid: bool,
    missing: [][]const u8,
    version_mismatch: []VersionMismatch,
    allocator: std.mem.Allocator,

    pub const VersionMismatch = struct {
        name: []const u8,
        expected: []const u8,
        actual: []const u8,
    };

    pub fn deinit(self: *ValidationResult) void {
        for (self.missing) |name| {
            self.allocator.free(name);
        }
        self.allocator.free(self.missing);

        for (self.version_mismatch) |*mismatch| {
            self.allocator.free(mismatch.name);
            self.allocator.free(mismatch.expected);
            self.allocator.free(mismatch.actual);
        }
        self.allocator.free(self.version_mismatch);
    }

    pub fn format(self: *const ValidationResult, allocator: std.mem.Allocator) ![]const u8 {
        var output = try std.ArrayList(u8).initCapacity(allocator, 256);
        defer output.deinit(allocator);

        if (self.valid) {
            try output.appendSlice(allocator, "✓ Lock file is valid\n");
            return try output.toOwnedSlice(allocator);
        }

        try output.appendSlice(allocator, "Lock file validation failed:\n\n");

        if (self.missing.len > 0) {
            try output.print(allocator, "Missing packages ({d}):\n", .{self.missing.len});
            for (self.missing) |name| {
                try output.print(allocator, "  - {s}\n", .{name});
            }
            try output.appendSlice(allocator, "\n");
        }

        if (self.version_mismatch.len > 0) {
            try output.print(allocator, "Version mismatches ({d}):\n", .{self.version_mismatch.len});
            for (self.version_mismatch) |mismatch| {
                try output.print(allocator, "  - {s}: expected {s}, got {s}\n", .{
                    mismatch.name,
                    mismatch.expected,
                    mismatch.actual,
                });
            }
        }

        return try output.toOwnedSlice(allocator);
    }
};

/// Generate lock file from current installation
pub fn generateLockFile(
    allocator: std.mem.Allocator,
    installed: std.StringHashMap([]const u8),
    registry_urls: std.StringHashMap([]const u8),
) !LockFile {
    var lock_file = LockFile.init(allocator);
    errdefer lock_file.deinit();

    var it = installed.iterator();
    while (it.next()) |entry| {
        const name = entry.key_ptr.*;
        const version = entry.value_ptr.*;

        const resolved = registry_urls.get(name) orelse {
            // Default registry URL
            const default_url = try std.fmt.allocPrint(
                allocator,
                "https://registry.npmjs.org/{s}/-/{s}-{s}.tgz",
                .{ name, name, version },
            );
            defer allocator.free(default_url);

            try lock_file.addPackage(name, version, default_url, null);
            continue;
        };

        try lock_file.addPackage(name, version, resolved, null);
    }

    return lock_file;
}

/// Resolved version from lockfile
pub const LockedVersion = struct {
    version: []const u8,
    resolved: []const u8,
    integrity: ?[]const u8,
};

/// Get locked version for a package if it exists in lockfile
/// This is the key function for deterministic installs
pub fn getLockedVersion(lock_file: *LockFile, name: []const u8) ?LockedVersion {
    // Search through all packages to find one matching the name
    var it = lock_file.packages.iterator();
    while (it.next()) |entry| {
        const pkg = entry.value_ptr.*;
        if (std.mem.eql(u8, pkg.name, name)) {
            return LockedVersion{
                .version = pkg.version,
                .resolved = pkg.resolved,
                .integrity = pkg.integrity,
            };
        }
    }
    return null;
}

/// Options for resolving versions
pub const ResolveOptions = struct {
    /// If true, only use versions from lockfile (fail if not found)
    frozen: bool = false,
    /// If true, prefer lockfile version but allow updates
    prefer_lockfile: bool = true,
};

/// Result of version resolution
pub const ResolvedVersion = struct {
    version: []const u8,
    resolved_url: ?[]const u8,
    integrity: ?[]const u8,
    from_lockfile: bool,
};

/// Resolve version for a package, using lockfile if available
/// This implements the deterministic install logic:
/// 1. If frozen mode, only use lockfile versions (fail if missing)
/// 2. If prefer_lockfile, use lockfile version if available
/// 3. Otherwise, resolve from registry (caller provides resolved version)
pub fn resolveVersionWithLockfile(
    allocator: std.mem.Allocator,
    lock_file: ?*LockFile,
    name: []const u8,
    requested_version: []const u8,
    registry_resolved: ?[]const u8,
    options: ResolveOptions,
) !ResolvedVersion {
    _ = allocator;

    // Try to get locked version
    if (lock_file) |lf| {
        if (getLockedVersion(lf, name)) |locked| {
            // Found in lockfile
            return ResolvedVersion{
                .version = locked.version,
                .resolved_url = locked.resolved,
                .integrity = locked.integrity,
                .from_lockfile = true,
            };
        }
    }

    // Not in lockfile
    if (options.frozen) {
        // Frozen mode requires lockfile entry
        return error.PackageNotInLockfile;
    }

    // Use registry-resolved version
    return ResolvedVersion{
        .version = requested_version,
        .resolved_url = registry_resolved,
        .integrity = null,
        .from_lockfile = false,
    };
}

/// Check if lockfile exists in directory
pub fn lockfileExists(cwd: []const u8) bool {
    const allocator = std.heap.page_allocator;
    const lockfile_path = std.fs.path.join(
        allocator,
        &[_][]const u8{ cwd, LOCK_FILE_NAME },
    ) catch return false;
    defer allocator.free(lockfile_path);

    std.Io.Dir.cwd().access(lockfile_path, .{}) catch return false;
    return true;
}

/// Load lockfile from directory if it exists
pub fn loadLockfileIfExists(allocator: std.mem.Allocator, cwd: []const u8) !?LockFile {
    const lockfile_path = try std.fs.path.join(
        allocator,
        &[_][]const u8{ cwd, LOCK_FILE_NAME },
    );
    defer allocator.free(lockfile_path);

    return LockFile.read(allocator, lockfile_path) catch |err| {
        if (err == error.FileNotFound) {
            return null;
        }
        return err;
    };
}
