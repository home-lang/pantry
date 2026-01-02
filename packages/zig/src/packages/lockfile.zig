const std = @import("std");
const types = @import("types.zig");

/// Compare two lockfiles, ignoring the generatedAt field
/// Returns true if lockfiles are equal (excluding generatedAt)
pub fn lockfilesEqual(a: *const types.Lockfile, b: *const types.Lockfile) bool {
    // Compare version
    if (!std.mem.eql(u8, a.version, b.version)) return false;

    // Compare lockfile_version
    if (a.lockfile_version != b.lockfile_version) return false;

    // Compare package count
    if (a.packages.count() != b.packages.count()) return false;

    // Compare each package
    var it = a.packages.iterator();
    while (it.next()) |entry| {
        const key = entry.key_ptr.*;
        const a_pkg = entry.value_ptr.*;

        // Check if key exists in b
        const b_pkg = b.packages.get(key) orelse return false;

        // Compare package fields
        if (!std.mem.eql(u8, a_pkg.name, b_pkg.name)) return false;
        if (!std.mem.eql(u8, a_pkg.version, b_pkg.version)) return false;
        if (a_pkg.source != b_pkg.source) return false;

        // Compare optional fields
        if (a_pkg.url) |a_url| {
            if (b_pkg.url) |b_url| {
                if (!std.mem.eql(u8, a_url, b_url)) return false;
            } else return false;
        } else if (b_pkg.url != null) return false;

        if (a_pkg.resolved) |a_resolved| {
            if (b_pkg.resolved) |b_resolved| {
                if (!std.mem.eql(u8, a_resolved, b_resolved)) return false;
            } else return false;
        } else if (b_pkg.resolved != null) return false;

        if (a_pkg.integrity) |a_integrity| {
            if (b_pkg.integrity) |b_integrity| {
                if (!std.mem.eql(u8, a_integrity, b_integrity)) return false;
            } else return false;
        } else if (b_pkg.integrity != null) return false;

        // Compare dependencies
        if (a_pkg.dependencies) |*a_deps| {
            if (b_pkg.dependencies) |*b_deps| {
                if (a_deps.count() != b_deps.count()) return false;

                var deps_it = a_deps.iterator();
                while (deps_it.next()) |dep_entry| {
                    const dep_key = dep_entry.key_ptr.*;
                    const a_dep_value = dep_entry.value_ptr.*;
                    const b_dep_value = b_deps.get(dep_key) orelse return false;
                    if (!std.mem.eql(u8, a_dep_value, b_dep_value)) return false;
                }
            } else return false;
        } else if (b_pkg.dependencies != null) return false;
    }

    return true;
}

/// Write lockfile to disk in JSON format, but only if it differs from existing file
/// (ignoring generatedAt field)
pub fn writeLockfile(allocator: std.mem.Allocator, lockfile: *const types.Lockfile, file_path: []const u8) !void {
    // Try to read existing lockfile
    if (readLockfile(allocator, file_path)) |existing_lockfile| {
        var existing = existing_lockfile;
        defer existing.deinit(allocator);

        // Compare lockfiles (ignoring generatedAt)
        if (lockfilesEqual(lockfile, &existing)) {
            // No changes needed, skip writing
            return;
        }
    } else |_| {
        // File doesn't exist or can't be read, proceed with writing
    }

    // Write the lockfile
    try writeLockfileForce(allocator, lockfile, file_path);
}

/// Write lockfile to disk in JSON format (always writes, internal use)
fn writeLockfileForce(allocator: std.mem.Allocator, lockfile: *const types.Lockfile, file_path: []const u8) !void {
    const file = try std.fs.createFileAbsolute(file_path, .{});
    defer file.close();

    // Use std.json.stringify instead of manual JSON writing
    var buf = try std.ArrayList(u8).initCapacity(allocator, 4096);
    defer buf.deinit(allocator);

    // Manually build JSON structure
    try buf.appendSlice(allocator, "{\n");
    {
        const line = try std.fmt.allocPrint(allocator, "  \"version\": \"{s}\",\n", .{lockfile.version});
        defer allocator.free(line);
        try buf.appendSlice(allocator, line);
    }
    {
        const line = try std.fmt.allocPrint(allocator, "  \"lockfileVersion\": {d},\n", .{lockfile.lockfile_version});
        defer allocator.free(line);
        try buf.appendSlice(allocator, line);
    }
    {
        const line = try std.fmt.allocPrint(allocator, "  \"generatedAt\": \"{d}\",\n", .{lockfile.generated_at});
        defer allocator.free(line);
        try buf.appendSlice(allocator, line);
    }
    try buf.appendSlice(allocator, "  \"packages\": {\n");

    var it = lockfile.packages.iterator();
    var first = true;
    while (it.next()) |entry| {
        if (!first) {
            try buf.appendSlice(allocator, ",\n");
        }
        first = false;

        {
            const line = try std.fmt.allocPrint(allocator, "    \"{s}\": {{\n", .{entry.key_ptr.*});
            defer allocator.free(line);
            try buf.appendSlice(allocator, line);
        }
        {
            const line = try std.fmt.allocPrint(allocator, "      \"name\": \"{s}\",\n", .{entry.value_ptr.name});
            defer allocator.free(line);
            try buf.appendSlice(allocator, line);
        }
        {
            const line = try std.fmt.allocPrint(allocator, "      \"version\": \"{s}\",\n", .{entry.value_ptr.version});
            defer allocator.free(line);
            try buf.appendSlice(allocator, line);
        }
        {
            const line = try std.fmt.allocPrint(allocator, "      \"source\": \"{s}\"", .{entry.value_ptr.source.toString()});
            defer allocator.free(line);
            try buf.appendSlice(allocator, line);
        }

        if (entry.value_ptr.url) |url| {
            const line = try std.fmt.allocPrint(allocator, ",\n      \"url\": \"{s}\"", .{url});
            defer allocator.free(line);
            try buf.appendSlice(allocator, line);
        }
        if (entry.value_ptr.resolved) |resolved| {
            const line = try std.fmt.allocPrint(allocator, ",\n      \"resolved\": \"{s}\"", .{resolved});
            defer allocator.free(line);
            try buf.appendSlice(allocator, line);
        }
        if (entry.value_ptr.integrity) |integrity| {
            const line = try std.fmt.allocPrint(allocator, ",\n      \"integrity\": \"{s}\"", .{integrity});
            defer allocator.free(line);
            try buf.appendSlice(allocator, line);
        }

        // Write dependencies if any
        if (entry.value_ptr.dependencies) |*deps| {
            if (deps.count() > 0) {
                try buf.appendSlice(allocator, ",\n      \"dependencies\": {\n");
                var deps_it = deps.iterator();
                var first_dep = true;
                while (deps_it.next()) |dep_entry| {
                    if (!first_dep) {
                        try buf.appendSlice(allocator, ",\n");
                    }
                    first_dep = false;
                    const line = try std.fmt.allocPrint(allocator, "        \"{s}\": \"{s}\"", .{ dep_entry.key_ptr.*, dep_entry.value_ptr.* });
                    defer allocator.free(line);
                    try buf.appendSlice(allocator, line);
                }
                try buf.appendSlice(allocator, "\n      }");
            }
        }

        try buf.appendSlice(allocator, "\n    }");
    }

    try buf.appendSlice(allocator, "\n  }\n}\n");

    // Write to file
    try file.writeAll(buf.items);
}

/// Read lockfile from disk
pub fn readLockfile(allocator: std.mem.Allocator, file_path: []const u8) !types.Lockfile {
    const content = try std.fs.cwd().readFileAlloc(file_path, allocator, std.Io.Limit.limited(10 * 1024 * 1024)); // 10MB max
    defer allocator.free(content);

    const parsed = try std.json.parseFromSlice(
        std.json.Value,
        allocator,
        content,
        .{},
    );
    defer parsed.deinit();

    const root = parsed.value;
    if (root != .object) return error.InvalidLockfile;

    const version = if (root.object.get("version")) |v|
        if (v == .string) v.string else "unknown"
    else
        "unknown";

    const lockfile_version = if (root.object.get("lockfileVersion")) |v|
        if (v == .integer) @as(u32, @intCast(v.integer)) else 1
    else
        1;

    const now = (std.posix.clock_gettime(.REALTIME) catch std.posix.timespec{ .sec = 0, .nsec = 0 }).sec;
    const generated_at = if (root.object.get("generatedAt")) |v|
        if (v == .string) std.fmt.parseInt(i64, v.string, 10) catch now else now
    else
        now;

    var lockfile = types.Lockfile{
        .version = try allocator.dupe(u8, version),
        .lockfile_version = lockfile_version,
        .packages = std.StringHashMap(types.LockfileEntry).init(allocator),
        .generated_at = generated_at,
    };
    errdefer lockfile.deinit(allocator);

    // Parse packages
    if (root.object.get("packages")) |packages_value| {
        if (packages_value != .object) return error.InvalidLockfile;

        var pkg_it = packages_value.object.iterator();
        while (pkg_it.next()) |entry| {
            const pkg_key = entry.key_ptr.*;
            const pkg_value = entry.value_ptr.*;
            if (pkg_value != .object) continue;

            const name = if (pkg_value.object.get("name")) |v|
                if (v == .string) v.string else pkg_key
            else
                pkg_key;

            const pkg_version = if (pkg_value.object.get("version")) |v|
                if (v == .string) v.string else "unknown"
            else
                "unknown";

            const source_str = if (pkg_value.object.get("source")) |v|
                if (v == .string) v.string else "pkgx"
            else
                "pkgx";

            const source = types.PackageSource.fromString(source_str) orelse .pkgx;

            var url: ?[]const u8 = null;
            if (pkg_value.object.get("url")) |v| {
                if (v == .string) url = try allocator.dupe(u8, v.string);
            }

            var resolved: ?[]const u8 = null;
            if (pkg_value.object.get("resolved")) |v| {
                if (v == .string) resolved = try allocator.dupe(u8, v.string);
            }

            var integrity: ?[]const u8 = null;
            if (pkg_value.object.get("integrity")) |v| {
                if (v == .string) integrity = try allocator.dupe(u8, v.string);
            }

            var dependencies: ?std.StringHashMap([]const u8) = null;
            if (pkg_value.object.get("dependencies")) |deps_value| {
                if (deps_value == .object) {
                    var deps_map = std.StringHashMap([]const u8).init(allocator);
                    var deps_it = deps_value.object.iterator();
                    while (deps_it.next()) |dep_entry| {
                        if (dep_entry.value_ptr.* == .string) {
                            try deps_map.put(
                                try allocator.dupe(u8, dep_entry.key_ptr.*),
                                try allocator.dupe(u8, dep_entry.value_ptr.string),
                            );
                        }
                    }
                    dependencies = deps_map;
                }
            }

            const lock_entry = types.LockfileEntry{
                .name = try allocator.dupe(u8, name),
                .version = try allocator.dupe(u8, pkg_version),
                .source = source,
                .url = url,
                .resolved = resolved,
                .integrity = integrity,
                .dependencies = dependencies,
            };

            try lockfile.packages.put(try allocator.dupe(u8, pkg_key), lock_entry);
        }
    }

    return lockfile;
}

test "lockfile write and read" {
    const allocator = std.testing.allocator;

    var tmp = std.testing.tmpDir(.{});
    defer tmp.cleanup();

    // Create lockfile
    var lockfile = try types.Lockfile.init(allocator, "1.0.0");
    defer lockfile.deinit(allocator);

    // Add entry
    const entry = types.LockfileEntry{
        .name = try allocator.dupe(u8, "test-package"),
        .version = try allocator.dupe(u8, "1.0.0"),
        .source = .github,
        .url = try allocator.dupe(u8, "https://github.com/test/test"),
        .resolved = try allocator.dupe(u8, "https://github.com/test/test/archive/v1.0.0.tar.gz"),
        .integrity = try allocator.dupe(u8, "sha256-abc123"),
        .dependencies = null,
    };
    try lockfile.addEntry(allocator, "test-package@1.0.0", entry);

    // Write lockfile
    const lock_path = try tmp.dir.realpathAlloc(allocator, ".");
    defer allocator.free(lock_path);
    const lock_file_path = try std.fmt.allocPrint(allocator, "{s}/pantry.lock", .{lock_path});
    defer allocator.free(lock_file_path);

    try writeLockfile(allocator, &lockfile, lock_file_path);

    // Read lockfile
    var read_lockfile = try readLockfile(allocator, lock_file_path);
    defer read_lockfile.deinit(allocator);

    try std.testing.expectEqualStrings("1.0.0", read_lockfile.version);
    try std.testing.expectEqual(@as(u32, 1), read_lockfile.lockfile_version);
    try std.testing.expectEqual(@as(usize, 1), read_lockfile.packages.count());
}

test "lockfile comparison ignores generatedAt" {
    const allocator = std.testing.allocator;

    // Create two lockfiles with same content but different generatedAt
    var lockfile1 = try types.Lockfile.init(allocator, "1.0.0");
    defer lockfile1.deinit(allocator);
    lockfile1.generated_at = 1000;

    var lockfile2 = try types.Lockfile.init(allocator, "1.0.0");
    defer lockfile2.deinit(allocator);
    lockfile2.generated_at = 2000; // Different timestamp

    // Add same package to both
    const entry1 = types.LockfileEntry{
        .name = try allocator.dupe(u8, "test-pkg"),
        .version = try allocator.dupe(u8, "1.0.0"),
        .source = .pkgx,
        .url = null,
        .resolved = null,
        .integrity = null,
        .dependencies = null,
    };
    try lockfile1.addEntry(allocator, "test-pkg@1.0.0", entry1);

    const entry2 = types.LockfileEntry{
        .name = try allocator.dupe(u8, "test-pkg"),
        .version = try allocator.dupe(u8, "1.0.0"),
        .source = .pkgx,
        .url = null,
        .resolved = null,
        .integrity = null,
        .dependencies = null,
    };
    try lockfile2.addEntry(allocator, "test-pkg@1.0.0", entry2);

    // Should be equal despite different generatedAt
    try std.testing.expect(lockfilesEqual(&lockfile1, &lockfile2));
}

test "lockfile comparison detects package changes" {
    const allocator = std.testing.allocator;

    // Create two lockfiles with different packages
    var lockfile1 = try types.Lockfile.init(allocator, "1.0.0");
    defer lockfile1.deinit(allocator);

    var lockfile2 = try types.Lockfile.init(allocator, "1.0.0");
    defer lockfile2.deinit(allocator);

    // Add different packages
    const entry1 = types.LockfileEntry{
        .name = try allocator.dupe(u8, "pkg1"),
        .version = try allocator.dupe(u8, "1.0.0"),
        .source = .pkgx,
        .url = null,
        .resolved = null,
        .integrity = null,
        .dependencies = null,
    };
    try lockfile1.addEntry(allocator, "pkg1@1.0.0", entry1);

    const entry2 = types.LockfileEntry{
        .name = try allocator.dupe(u8, "pkg2"),
        .version = try allocator.dupe(u8, "2.0.0"),
        .source = .pkgx,
        .url = null,
        .resolved = null,
        .integrity = null,
        .dependencies = null,
    };
    try lockfile2.addEntry(allocator, "pkg2@2.0.0", entry2);

    // Should NOT be equal
    try std.testing.expect(!lockfilesEqual(&lockfile1, &lockfile2));
}

test "writeLockfile skips write when no changes" {
    const allocator = std.testing.allocator;

    var tmp = std.testing.tmpDir(.{});
    defer tmp.cleanup();

    // Create initial lockfile
    var lockfile1 = try types.Lockfile.init(allocator, "1.0.0");
    defer lockfile1.deinit(allocator);
    lockfile1.generated_at = 1000;

    const entry1 = types.LockfileEntry{
        .name = try allocator.dupe(u8, "test"),
        .version = try allocator.dupe(u8, "1.0.0"),
        .source = .pkgx,
        .url = null,
        .resolved = null,
        .integrity = null,
        .dependencies = null,
    };
    try lockfile1.addEntry(allocator, "test@1.0.0", entry1);

    // Write initial file
    const lock_path = try tmp.dir.realpathAlloc(allocator, ".");
    defer allocator.free(lock_path);
    const lock_file_path = try std.fmt.allocPrint(allocator, "{s}/pantry.lock", .{lock_path});
    defer allocator.free(lock_file_path);

    try writeLockfile(allocator, &lockfile1, lock_file_path);

    // Read the file content
    const content1 = try std.fs.cwd().readFileAlloc(lock_file_path, allocator, std.Io.Limit.limited(1024 * 1024));
    defer allocator.free(content1);

    // Create second lockfile with different generatedAt but same content
    var lockfile2 = try types.Lockfile.init(allocator, "1.0.0");
    defer lockfile2.deinit(allocator);
    lockfile2.generated_at = 2000; // Different timestamp

    const entry2 = types.LockfileEntry{
        .name = try allocator.dupe(u8, "test"),
        .version = try allocator.dupe(u8, "1.0.0"),
        .source = .pkgx,
        .url = null,
        .resolved = null,
        .integrity = null,
        .dependencies = null,
    };
    try lockfile2.addEntry(allocator, "test@1.0.0", entry2);

    // Write again - should be skipped
    try writeLockfile(allocator, &lockfile2, lock_file_path);

    // Check file content hasn't changed (generatedAt should still be 1000, not 2000)
    const content2 = try std.fs.cwd().readFileAlloc(lock_file_path, allocator, std.Io.Limit.limited(1024 * 1024));
    defer allocator.free(content2);
    try std.testing.expectEqualStrings(content1, content2);
}
