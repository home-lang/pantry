const std = @import("std");
const testing = std.testing;
const lib = @import("lib");

test "Lockfile - init creates valid lockfile" {
    const allocator = testing.allocator;

    var lockfile = try lib.packages.Lockfile.init(allocator, "1.0.0");
    defer lockfile.deinit(allocator);

    try testing.expectEqualStrings("1.0.0", lockfile.version);
    try testing.expect(lockfile.lockfile_version == 1);
}

test "Lockfile - addEntry and retrieve" {
    const allocator = testing.allocator;

    var lockfile = try lib.packages.Lockfile.init(allocator, "1.0.0");
    defer lockfile.deinit(allocator);

    const entry = lib.packages.LockfileEntry{
        .name = try allocator.dupe(u8, "test-package"),
        .version = try allocator.dupe(u8, "1.2.3"),
        .source = .pkgx,
        .url = null,
        .resolved = null,
        .integrity = null,
        .dependencies = null,
    };

    try lockfile.addEntry(allocator, "test-package@1.2.3", entry);

    const retrieved = lockfile.packages.get("test-package@1.2.3");
    try testing.expect(retrieved != null);
    if (retrieved) |pkg| {
        try testing.expectEqualStrings("test-package", pkg.name);
        try testing.expectEqualStrings("1.2.3", pkg.version);
    }
}

test "Lockfile - multiple entries" {
    const allocator = testing.allocator;

    var lockfile = try lib.packages.Lockfile.init(allocator, "1.0.0");
    defer lockfile.deinit(allocator);

    const entries = [_]struct { name: []const u8, version: []const u8 }{
        .{ .name = "pkg1", .version = "1.0.0" },
        .{ .name = "pkg2", .version = "2.0.0" },
        .{ .name = "pkg3", .version = "3.0.0" },
    };

    for (entries) |e| {
        const entry = lib.packages.LockfileEntry{
            .name = try allocator.dupe(u8, e.name),
            .version = try allocator.dupe(u8, e.version),
            .source = .pkgx,
            .url = null,
            .resolved = null,
            .integrity = null,
            .dependencies = null,
        };
        const key = try std.fmt.allocPrint(allocator, "{s}@{s}", .{ e.name, e.version });
        defer allocator.free(key);
        try lockfile.addEntry(allocator, key, entry);
    }

    try testing.expect(lockfile.packages.count() == 3);
}

test "Lockfile - write and read roundtrip" {
    const allocator = testing.allocator;

    var tmp = testing.tmpDir(.{});
    defer tmp.cleanup();

    // Create lockfile
    var lockfile = try lib.packages.Lockfile.init(allocator, "1.0.0");
    defer lockfile.deinit(allocator);

    const entry = lib.packages.LockfileEntry{
        .name = try allocator.dupe(u8, "test-pkg"),
        .version = try allocator.dupe(u8, "1.0.0"),
        .source = .local,
        .url = try allocator.dupe(u8, "~/Code/test-pkg"),
        .resolved = null,
        .integrity = null,
        .dependencies = null,
    };
    try lockfile.addEntry(allocator, "test-pkg@1.0.0", entry);

    // Write to temp file
    const path = try tmp.dir.realpathAlloc(allocator, ".");
    defer allocator.free(path);

    const lockfile_path = try std.fmt.allocPrint(allocator, "{s}/.freezer", .{path});
    defer allocator.free(lockfile_path);

    try lib.packages.writeLockfile(allocator, &lockfile, lockfile_path);

    // Read it back
    var read_lockfile = try lib.packages.readLockfile(allocator, lockfile_path);
    defer read_lockfile.deinit(allocator);

    try testing.expectEqualStrings("1.0.0", read_lockfile.version);
    try testing.expect(read_lockfile.packages.count() == 1);

    const retrieved = read_lockfile.packages.get("test-pkg@1.0.0");
    try testing.expect(retrieved != null);
    if (retrieved) |pkg| {
        try testing.expectEqualStrings("test-pkg", pkg.name);
        try testing.expectEqualStrings("1.0.0", pkg.version);
        try testing.expect(pkg.source == .local);
    }
}

test "Lockfile - PackageSource enum values" {
    try testing.expect(@TypeOf(lib.packages.PackageSource.local) != void);
    try testing.expect(@TypeOf(lib.packages.PackageSource.pkgx) != void);
    try testing.expect(@TypeOf(lib.packages.PackageSource.github) != void);
    try testing.expect(@TypeOf(lib.packages.PackageSource.npm) != void);
}

test "Lockfile - entry with dependencies" {
    const allocator = testing.allocator;

    var lockfile = try lib.packages.Lockfile.init(allocator, "1.0.0");
    defer lockfile.deinit(allocator);

    var deps = std.StringHashMap([]const u8).init(allocator);
    try deps.put(try allocator.dupe(u8, "dep1"), try allocator.dupe(u8, "1.0.0"));
    try deps.put(try allocator.dupe(u8, "dep2"), try allocator.dupe(u8, "2.0.0"));

    const entry = lib.packages.LockfileEntry{
        .name = try allocator.dupe(u8, "parent-pkg"),
        .version = try allocator.dupe(u8, "1.0.0"),
        .source = .pkgx,
        .url = null,
        .resolved = null,
        .integrity = null,
        .dependencies = deps,
    };

    try lockfile.addEntry(allocator, "parent-pkg@1.0.0", entry);

    const retrieved = lockfile.packages.get("parent-pkg@1.0.0");
    try testing.expect(retrieved != null);
    if (retrieved) |pkg| {
        try testing.expect(pkg.dependencies != null);
        if (pkg.dependencies) |dep_map| {
            try testing.expect(dep_map.count() == 2);
        }
    }
}
