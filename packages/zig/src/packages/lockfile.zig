const std = @import("std");
const types = @import("types.zig");

/// Write lockfile to disk in JSON format
pub fn writeLockfile(_: std.mem.Allocator, lockfile: *const types.Lockfile, file_path: []const u8) !void {
    const file = try std.fs.createFileAbsolute(file_path, .{});
    defer file.close();

    var buffered = std.io.bufferedWriter(file.writer());
    const writer = buffered.writer();

    try writer.writeAll("{\n");
    try writer.print("  \"version\": \"{s}\",\n", .{lockfile.version});
    try writer.print("  \"lockfileVersion\": {d},\n", .{lockfile.lockfile_version});
    try writer.print("  \"generatedAt\": \"{d}\",\n", .{lockfile.generated_at});
    try writer.writeAll("  \"packages\": {\n");

    var it = lockfile.packages.iterator();
    var first = true;
    while (it.next()) |entry| {
        if (!first) {
            try writer.writeAll(",\n");
        }
        first = false;

        try writer.print("    \"{s}\": {{\n", .{entry.key_ptr.*});
        try writer.print("      \"name\": \"{s}\",\n", .{entry.value_ptr.name});
        try writer.print("      \"version\": \"{s}\",\n", .{entry.value_ptr.version});
        try writer.print("      \"source\": \"{s}\"", .{entry.value_ptr.source.toString()});

        if (entry.value_ptr.url) |url| {
            try writer.print(",\n      \"url\": \"{s}\"", .{url});
        }
        if (entry.value_ptr.resolved) |resolved| {
            try writer.print(",\n      \"resolved\": \"{s}\"", .{resolved});
        }
        if (entry.value_ptr.integrity) |integrity| {
            try writer.print(",\n      \"integrity\": \"{s}\"", .{integrity});
        }

        // Write dependencies if any
        if (entry.value_ptr.dependencies) |*deps| {
            if (deps.count() > 0) {
                try writer.writeAll(",\n      \"dependencies\": {\n");
                var deps_it = deps.iterator();
                var first_dep = true;
                while (deps_it.next()) |dep_entry| {
                    if (!first_dep) {
                        try writer.writeAll(",\n");
                    }
                    first_dep = false;
                    try writer.print("        \"{s}\": \"{s}\"", .{ dep_entry.key_ptr.*, dep_entry.value_ptr.* });
                }
                try writer.writeAll("\n      }");
            }
        }

        try writer.writeAll("\n    }");
    }

    try writer.writeAll("\n  }\n}\n");
    try buffered.flush();
}

/// Read lockfile from disk
pub fn readLockfile(allocator: std.mem.Allocator, file_path: []const u8) !types.Lockfile {
    const file = try std.fs.openFileAbsolute(file_path, .{});
    defer file.close();

    const content = try file.readToEndAlloc(allocator, 10 * 1024 * 1024); // 10MB max
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
    else "unknown";

    const lockfile_version = if (root.object.get("lockfileVersion")) |v|
        if (v == .integer) @as(u32, @intCast(v.integer)) else 1
    else 1;

    const generated_at = if (root.object.get("generatedAt")) |v|
        if (v == .string) std.fmt.parseInt(i64, v.string, 10) catch std.time.timestamp() else std.time.timestamp()
    else std.time.timestamp();

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

        var it = packages_value.object.iterator();
        while (it.next()) |entry| {
            const pkg_key = entry.key_ptr.*;
            const pkg_value = entry.value_ptr.*;
            if (pkg_value != .object) continue;

            const name = if (pkg_value.object.get("name")) |v|
                if (v == .string) v.string else pkg_key
            else pkg_key;

            const pkg_version = if (pkg_value.object.get("version")) |v|
                if (v == .string) v.string else "unknown"
            else "unknown";

            const source_str = if (pkg_value.object.get("source")) |v|
                if (v == .string) v.string else "pkgx"
            else "pkgx";

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
    const lock_file_path = try std.fmt.allocPrint(allocator, "{s}/package-lock.json", .{lock_path});
    defer allocator.free(lock_file_path);

    try writeLockfile(allocator, &lockfile, lock_file_path);

    // Read lockfile
    var read_lockfile = try readLockfile(allocator, lock_file_path);
    defer read_lockfile.deinit(allocator);

    try std.testing.expectEqualStrings("1.0.0", read_lockfile.version);
    try std.testing.expectEqual(@as(u32, 1), read_lockfile.lockfile_version);
    try std.testing.expectEqual(@as(usize, 1), read_lockfile.packages.count());
}
