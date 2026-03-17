const std = @import("std");
const types = @import("types.zig");
const io_helper = @import("../io_helper.zig");

/// Compare two string hashmaps for equality
fn stringMapsEqual(a: ?std.StringHashMap([]const u8), b: ?std.StringHashMap([]const u8)) bool {
    if (a) |*a_map| {
        if (b) |*b_map| {
            if (a_map.count() != b_map.count()) return false;
            var it = a_map.iterator();
            while (it.next()) |entry| {
                const b_val = b_map.get(entry.key_ptr.*) orelse return false;
                if (!std.mem.eql(u8, entry.value_ptr.*, b_val)) return false;
            }
            return true;
        } else return false;
    } else return b == null;
}

/// Compare two lockfiles, ignoring the generatedAt field
/// Returns true if lockfiles are equal (excluding generatedAt)
pub fn lockfilesEqual(a: *const types.Lockfile, b: *const types.Lockfile) bool {
    // Compare version
    if (!std.mem.eql(u8, a.version, b.version)) return false;

    // Compare lockfile_version
    if (a.lockfile_version != b.lockfile_version) return false;

    // Compare workspace count
    if (a.workspaces.count() != b.workspaces.count()) return false;

    // Compare workspaces
    var ws_it = a.workspaces.iterator();
    while (ws_it.next()) |entry| {
        const key = entry.key_ptr.*;
        const a_ws = entry.value_ptr.*;
        const b_ws = b.workspaces.get(key) orelse return false;

        if (!std.mem.eql(u8, a_ws.name, b_ws.name)) return false;
        if (a_ws.isolation != b_ws.isolation) return false;
        if (!stringMapsEqual(a_ws.dependencies, b_ws.dependencies)) return false;
        if (!stringMapsEqual(a_ws.dev_dependencies, b_ws.dev_dependencies)) return false;
        if (!stringMapsEqual(a_ws.system, b_ws.system)) return false;
    }

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

        // Compare optional string fields
        inline for (.{ "url", "resolved", "integrity" }) |field| {
            const a_val = @field(a_pkg, field);
            const b_val = @field(b_pkg, field);
            if (a_val) |av| {
                if (b_val) |bv| {
                    if (!std.mem.eql(u8, av, bv)) return false;
                } else return false;
            } else if (b_val != null) return false;
        }

        // Compare string map fields
        if (!stringMapsEqual(a_pkg.dependencies, b_pkg.dependencies)) return false;
        if (!stringMapsEqual(a_pkg.peer_dependencies, b_pkg.peer_dependencies)) return false;
        if (!stringMapsEqual(a_pkg.bin, b_pkg.bin)) return false;
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

/// Append a JSON-escaped string to the buffer (handles quotes, backslashes, control chars)
fn appendJsonEscaped(buf: *std.ArrayList(u8), allocator: std.mem.Allocator, s: []const u8) !void {
    for (s) |c| {
        switch (c) {
            '"' => try buf.appendSlice(allocator, "\\\""),
            '\\' => try buf.appendSlice(allocator, "\\\\"),
            '\n' => try buf.appendSlice(allocator, "\\n"),
            '\r' => try buf.appendSlice(allocator, "\\r"),
            '\t' => try buf.appendSlice(allocator, "\\t"),
            else => try buf.append(allocator, c),
        }
    }
}

/// Write a string-keyed hashmap as a JSON object
/// Collect and sort keys from a StringHashMap for deterministic output
fn sortedKeys(allocator: std.mem.Allocator, map: anytype) ![]const []const u8 {
    const count = map.count();
    var keys = try allocator.alloc([]const u8, count);
    var i: usize = 0;
    var it = map.iterator();
    while (it.next()) |entry| {
        keys[i] = entry.key_ptr.*;
        i += 1;
    }
    std.mem.sort([]const u8, keys, {}, struct {
        fn cmp(_: void, a: []const u8, b: []const u8) bool {
            return std.mem.order(u8, a, b) == .lt;
        }
    }.cmp);
    return keys;
}

fn writeJsonStringMap(buf: *std.ArrayList(u8), allocator: std.mem.Allocator, map: *const std.StringHashMap([]const u8), indent: []const u8) !void {
    try buf.appendSlice(allocator, "{\n");
    const keys = try sortedKeys(allocator, map.*);
    defer allocator.free(keys);
    var first_entry = true;
    for (keys) |key| {
        if (!first_entry) try buf.appendSlice(allocator, ",\n");
        first_entry = false;
        try buf.appendSlice(allocator, indent);
        try buf.appendSlice(allocator, "  \"");
        try appendJsonEscaped(buf, allocator, key);
        try buf.appendSlice(allocator, "\": \"");
        try appendJsonEscaped(buf, allocator, map.get(key).?);
        try buf.appendSlice(allocator, "\"");
    }
    try buf.appendSlice(allocator, "\n");
    try buf.appendSlice(allocator, indent);
    try buf.appendSlice(allocator, "}");
}

/// Write lockfile to disk in JSON format (always writes, internal use)
/// Uses atomic write (write to temp file, then rename) to prevent corruption.
fn writeLockfileForce(allocator: std.mem.Allocator, lockfile: *const types.Lockfile, file_path: []const u8) !void {
    var buf = try std.ArrayList(u8).initCapacity(allocator, 16384);
    defer buf.deinit(allocator);

    var fmt_buf: [1024]u8 = undefined;

    try buf.appendSlice(allocator, "{\n");
    {
        const s = std.fmt.bufPrint(&fmt_buf, "  \"version\": \"{s}\",\n", .{lockfile.version}) catch return error.FormatError;
        try buf.appendSlice(allocator, s);
    }
    {
        const s = std.fmt.bufPrint(&fmt_buf, "  \"lockfileVersion\": {d},\n", .{lockfile.lockfile_version}) catch return error.FormatError;
        try buf.appendSlice(allocator, s);
    }

    // Write workspaces section (sorted for deterministic output)
    if (lockfile.workspaces.count() > 0) {
        try buf.appendSlice(allocator, "  \"workspaces\": {\n");
        const ws_keys = try sortedKeys(allocator, lockfile.workspaces);
        defer allocator.free(ws_keys);
        var ws_first = true;
        for (ws_keys) |ws_key| {
            const ws = lockfile.workspaces.getPtr(ws_key).?;
            if (!ws_first) try buf.appendSlice(allocator, ",\n");
            ws_first = false;

            try buf.appendSlice(allocator, "    \"");
            try appendJsonEscaped(&buf, allocator, ws_key);
            try buf.appendSlice(allocator, "\": {\n      \"name\": \"");
            try appendJsonEscaped(&buf, allocator, ws.name);
            try buf.appendSlice(allocator, "\"");

            if (ws.version) |v| {
                try buf.appendSlice(allocator, ",\n      \"version\": \"");
                try appendJsonEscaped(&buf, allocator, v);
                try buf.appendSlice(allocator, "\"");
            }

            // Write isolation mode (only if non-default)
            if (ws.isolation != .shared) {
                try buf.appendSlice(allocator, ",\n      \"isolation\": \"");
                try buf.appendSlice(allocator, ws.isolation.toString());
                try buf.appendSlice(allocator, "\"");
            }

            if (ws.dependencies) |*deps| {
                if (deps.count() > 0) {
                    try buf.appendSlice(allocator, ",\n      \"dependencies\": ");
                    try writeJsonStringMap(&buf, allocator, deps, "      ");
                }
            }

            if (ws.dev_dependencies) |*deps| {
                if (deps.count() > 0) {
                    try buf.appendSlice(allocator, ",\n      \"devDependencies\": ");
                    try writeJsonStringMap(&buf, allocator, deps, "      ");
                }
            }

            if (ws.system) |*deps| {
                if (deps.count() > 0) {
                    try buf.appendSlice(allocator, ",\n      \"system\": ");
                    try writeJsonStringMap(&buf, allocator, deps, "      ");
                }
            }

            try buf.appendSlice(allocator, "\n    }");
        }
        try buf.appendSlice(allocator, "\n  },\n");
    }

    // Write packages section (sorted for deterministic output)
    try buf.appendSlice(allocator, "  \"packages\": {\n");

    const pkg_keys = try sortedKeys(allocator, lockfile.packages);
    defer allocator.free(pkg_keys);
    var first = true;
    for (pkg_keys) |pkg_key| {
        const pkg = lockfile.packages.getPtr(pkg_key).?;
        if (!first) try buf.appendSlice(allocator, ",\n");
        first = false;

        try buf.appendSlice(allocator, "    \"");
        try appendJsonEscaped(&buf, allocator, pkg_key);
        try buf.appendSlice(allocator, "\": {\n      \"name\": \"");
        try appendJsonEscaped(&buf, allocator, pkg.name);
        try buf.appendSlice(allocator, "\",\n      \"version\": \"");
        try appendJsonEscaped(&buf, allocator, pkg.version);
        try buf.appendSlice(allocator, "\",\n      \"source\": \"");
        try buf.appendSlice(allocator, pkg.source.toString());
        try buf.appendSlice(allocator, "\"");

        if (pkg.resolved) |resolved| {
            try buf.appendSlice(allocator, ",\n      \"resolved\": \"");
            try appendJsonEscaped(&buf, allocator, resolved);
            try buf.appendSlice(allocator, "\"");
        }
        if (pkg.integrity) |integrity| {
            try buf.appendSlice(allocator, ",\n      \"integrity\": \"");
            try appendJsonEscaped(&buf, allocator, integrity);
            try buf.appendSlice(allocator, "\"");
        }

        // Write dependencies
        if (pkg.dependencies) |*deps| {
            if (deps.count() > 0) {
                try buf.appendSlice(allocator, ",\n      \"dependencies\": ");
                try writeJsonStringMap(&buf, allocator, deps, "      ");
            }
        }

        // Write peerDependencies
        if (pkg.peer_dependencies) |*deps| {
            if (deps.count() > 0) {
                try buf.appendSlice(allocator, ",\n      \"peerDependencies\": ");
                try writeJsonStringMap(&buf, allocator, deps, "      ");
            }
        }

        // Write bin entries
        if (pkg.bin) |*b| {
            if (b.count() > 0) {
                try buf.appendSlice(allocator, ",\n      \"bin\": ");
                try writeJsonStringMap(&buf, allocator, b, "      ");
            }
        }

        // Write optionalPeers (sorted)
        if (pkg.optional_peers) |*op| {
            if (op.count() > 0) {
                try buf.appendSlice(allocator, ",\n      \"optionalPeers\": [");
                const op_keys = try sortedKeys(allocator, op.*);
                defer allocator.free(op_keys);
                var first_op = true;
                for (op_keys) |op_key| {
                    if (!first_op) try buf.appendSlice(allocator, ", ");
                    first_op = false;
                    try buf.appendSlice(allocator, "\"");
                    try appendJsonEscaped(&buf, allocator, op_key);
                    try buf.appendSlice(allocator, "\"");
                }
                try buf.appendSlice(allocator, "]");
            }
        }

        try buf.appendSlice(allocator, "\n    }");
    }

    try buf.appendSlice(allocator, "\n  }\n}\n");

    // Atomic write: write to temp file, then rename over the target.
    // This prevents corruption if the process is killed mid-write.
    const tmp_path = try std.fmt.allocPrint(allocator, "{s}.tmp", .{file_path});
    defer allocator.free(tmp_path);

    const file = try io_helper.cwd().createFile(io_helper.io, tmp_path, .{});
    defer file.close(io_helper.io);
    try io_helper.writeAllToFile(file, buf.items);

    // Rename temp file to final path (atomic on POSIX)
    io_helper.rename(tmp_path, file_path) catch {
        // Fallback: if rename fails (e.g., cross-device), write directly
        const direct_file = try io_helper.cwd().createFile(io_helper.io, file_path, .{});
        defer direct_file.close(io_helper.io);
        try io_helper.writeAllToFile(direct_file, buf.items);
    };
}

/// Read lockfile from disk
pub fn readLockfile(allocator: std.mem.Allocator, file_path: []const u8) !types.Lockfile {
    const content = try io_helper.readFileAlloc(allocator, file_path, 10 * 1024 * 1024); // 10MB max
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

    const now = blk: {
        const ts = io_helper.clockGettime();
        break :blk ts.sec;
    };
    const generated_at = if (root.object.get("generatedAt")) |v|
        if (v == .string) std.fmt.parseInt(i64, v.string, 10) catch now else now
    else
        now;

    var lockfile = types.Lockfile{
        .version = try allocator.dupe(u8, version),
        .lockfile_version = lockfile_version,
        .workspaces = std.StringHashMap(types.WorkspaceLockEntry).init(allocator),
        .packages = std.StringHashMap(types.LockfileEntry).init(allocator),
        .generated_at = generated_at,
    };
    errdefer lockfile.deinit(allocator);

    // Parse workspaces
    if (root.object.get("workspaces")) |ws_value| {
        if (ws_value == .object) {
            var ws_it = ws_value.object.iterator();
            while (ws_it.next()) |entry| {
                const ws_key = entry.key_ptr.*;
                const ws_val = entry.value_ptr.*;
                if (ws_val != .object) continue;

                const ws_name = if (ws_val.object.get("name")) |v|
                    if (v == .string) v.string else ws_key
                else
                    ws_key;

                var ws_version: ?[]const u8 = null;
                if (ws_val.object.get("version")) |v| {
                    if (v == .string) ws_version = try allocator.dupe(u8, v.string);
                }

                var ws_deps: ?std.StringHashMap([]const u8) = null;
                var ws_dev_deps: ?std.StringHashMap([]const u8) = null;
                var ws_system: ?std.StringHashMap([]const u8) = null;

                inline for (.{
                    .{ "dependencies", &ws_deps },
                    .{ "devDependencies", &ws_dev_deps },
                    .{ "system", &ws_system },
                }) |pair| {
                    if (ws_val.object.get(pair[0])) |deps_val| {
                        if (deps_val == .object) {
                            var map = std.StringHashMap([]const u8).init(allocator);
                            var d_it = deps_val.object.iterator();
                            while (d_it.next()) |d_entry| {
                                if (d_entry.value_ptr.* == .string) {
                                    try map.put(
                                        try allocator.dupe(u8, d_entry.key_ptr.*),
                                        try allocator.dupe(u8, d_entry.value_ptr.string),
                                    );
                                }
                            }
                            if (map.count() > 0) pair[1].* = map else map.deinit();
                        }
                    }
                }

                // Parse isolation mode
                const ws_isolation = if (ws_val.object.get("isolation")) |iso_val|
                    if (iso_val == .string) types.WorkspaceIsolation.fromString(iso_val.string) orelse .shared else .shared
                else
                    .shared;

                try lockfile.workspaces.put(try allocator.dupe(u8, ws_key), .{
                    .name = try allocator.dupe(u8, ws_name),
                    .version = ws_version,
                    .dependencies = ws_deps,
                    .dev_dependencies = ws_dev_deps,
                    .system = ws_system,
                    .isolation = ws_isolation,
                });
            }
        }
    }

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
                if (v == .string) v.string else "pantry"
            else
                "pantry";

            const source = types.PackageSource.fromString(source_str) orelse .pantry;

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

            // Parse string map fields (dependencies, peerDependencies, bin)
            var dependencies: ?std.StringHashMap([]const u8) = null;
            var peer_dependencies: ?std.StringHashMap([]const u8) = null;
            var bin: ?std.StringHashMap([]const u8) = null;

            inline for (.{
                .{ "dependencies", &dependencies },
                .{ "peerDependencies", &peer_dependencies },
                .{ "bin", &bin },
            }) |pair| {
                if (pkg_value.object.get(pair[0])) |deps_value| {
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
                        if (deps_map.count() > 0) pair[1].* = deps_map else deps_map.deinit();
                    }
                }
            }

            // Parse optionalPeers (array of strings)
            var optional_peers: ?std.StringHashMap(bool) = null;
            if (pkg_value.object.get("optionalPeers")) |op_val| {
                if (op_val == .array) {
                    var op_map = std.StringHashMap(bool).init(allocator);
                    for (op_val.array.items) |item| {
                        if (item == .string) {
                            try op_map.put(try allocator.dupe(u8, item.string), true);
                        }
                    }
                    if (op_map.count() > 0) optional_peers = op_map else op_map.deinit();
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
                .peer_dependencies = peer_dependencies,
                .bin = bin,
                .optional_peers = optional_peers,
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
    var lock_path_buf: [std.fs.max_path_bytes]u8 = undefined;
    const lock_path_slice = try tmp.dir.realpath(std.testing.io, ".", &lock_path_buf);
    const lock_path = try allocator.dupe(u8, lock_path_slice);
    defer allocator.free(lock_path);
    const lock_file_path = try std.fmt.allocPrint(allocator, "{s}/pantry.lock", .{lock_path});
    defer allocator.free(lock_file_path);

    try writeLockfile(allocator, &lockfile, lock_file_path);

    // Read lockfile
    var read_lockfile = try readLockfile(allocator, lock_file_path);
    defer read_lockfile.deinit(allocator);

    try std.testing.expectEqualStrings("1.0.0", read_lockfile.version);
    try std.testing.expectEqual(@as(u32, 2), read_lockfile.lockfile_version);
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
        .source = .pantry,
        .url = null,
        .resolved = null,
        .integrity = null,
        .dependencies = null,
    };
    try lockfile1.addEntry(allocator, "test-pkg@1.0.0", entry1);

    const entry2 = types.LockfileEntry{
        .name = try allocator.dupe(u8, "test-pkg"),
        .version = try allocator.dupe(u8, "1.0.0"),
        .source = .pantry,
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
        .source = .pantry,
        .url = null,
        .resolved = null,
        .integrity = null,
        .dependencies = null,
    };
    try lockfile1.addEntry(allocator, "pkg1@1.0.0", entry1);

    const entry2 = types.LockfileEntry{
        .name = try allocator.dupe(u8, "pkg2"),
        .version = try allocator.dupe(u8, "2.0.0"),
        .source = .pantry,
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
        .source = .pantry,
        .url = null,
        .resolved = null,
        .integrity = null,
        .dependencies = null,
    };
    try lockfile1.addEntry(allocator, "test@1.0.0", entry1);

    // Write initial file
    var lock_path_buf2: [std.fs.max_path_bytes]u8 = undefined;
    const lock_path_slice2 = try tmp.dir.realpath(std.testing.io, ".", &lock_path_buf2);
    const lock_path = try allocator.dupe(u8, lock_path_slice2);
    defer allocator.free(lock_path);
    const lock_file_path = try std.fmt.allocPrint(allocator, "{s}/pantry.lock", .{lock_path});
    defer allocator.free(lock_file_path);

    try writeLockfile(allocator, &lockfile1, lock_file_path);

    // Read the file content
    const content1 = try std.Io.Dir.cwd().readFileAlloc(std.testing.io, lock_file_path, allocator, std.Io.Limit.limited(1024 * 1024));
    defer allocator.free(content1);

    // Create second lockfile with different generatedAt but same content
    var lockfile2 = try types.Lockfile.init(allocator, "1.0.0");
    defer lockfile2.deinit(allocator);
    lockfile2.generated_at = 2000; // Different timestamp

    const entry2 = types.LockfileEntry{
        .name = try allocator.dupe(u8, "test"),
        .version = try allocator.dupe(u8, "1.0.0"),
        .source = .pantry,
        .url = null,
        .resolved = null,
        .integrity = null,
        .dependencies = null,
    };
    try lockfile2.addEntry(allocator, "test@1.0.0", entry2);

    // Write again - should be skipped
    try writeLockfile(allocator, &lockfile2, lock_file_path);

    // Check file content hasn't changed (generatedAt should still be 1000, not 2000)
    const content2 = try std.Io.Dir.cwd().readFileAlloc(std.testing.io, lock_file_path, allocator, std.Io.Limit.limited(1024 * 1024));
    defer allocator.free(content2);
    try std.testing.expectEqualStrings(content1, content2);
}
