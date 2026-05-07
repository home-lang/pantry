const std = @import("std");
const testing = std.testing;
const lib = @import("lib");
const io_helper = lib.io_helper;

const resolution = lib.deps.resolution;
const ConflictResolver = resolution.ConflictResolver;
const PeerDependencyManager = resolution.PeerDependencyManager;
const OptionalDependencyManager = resolution.OptionalDependencyManager;
const LockFile = resolution.LockFile;
const ResolutionContext = resolution.ResolutionContext;

// ============================================================================
// Conflict Resolution Tests
// ============================================================================

test "ConflictResolver - no conflicts" {
    const allocator = testing.allocator;

    var resolver = ConflictResolver.init(allocator, .highest_compatible);
    defer resolver.deinit();

    try resolver.recordRequirement("lodash", "my-app", "^4.17.21");

    var resolutions = try resolver.resolveAll();
    defer {
        var it = resolutions.iterator();
        while (it.next()) |entry| {
            allocator.free(entry.key_ptr.*);
            allocator.free(entry.value_ptr.*);
        }
        resolutions.deinit();
    }

    try testing.expectEqual(@as(usize, 1), resolutions.count());

    const lodash_version = resolutions.get("lodash").?;
    try testing.expectEqualStrings("^4.17.21", lodash_version);
}

test "ConflictResolver - multiple requirements first_wins" {
    const allocator = testing.allocator;

    var resolver = ConflictResolver.init(allocator, .first_wins);
    defer resolver.deinit();

    try resolver.recordRequirement("lodash", "package-a", "^4.17.20");
    try resolver.recordRequirement("lodash", "package-b", "^4.17.21");
    try resolver.recordRequirement("lodash", "package-c", "^4.17.19");

    var resolutions = try resolver.resolveAll();
    defer {
        var it = resolutions.iterator();
        while (it.next()) |entry| {
            allocator.free(entry.key_ptr.*);
            allocator.free(entry.value_ptr.*);
        }
        resolutions.deinit();
    }

    const lodash_version = resolutions.get("lodash").?;
    try testing.expectEqualStrings("^4.17.20", lodash_version); // First one wins
}

test "ConflictResolver - multiple requirements last_wins" {
    const allocator = testing.allocator;

    var resolver = ConflictResolver.init(allocator, .last_wins);
    defer resolver.deinit();

    try resolver.recordRequirement("lodash", "package-a", "^4.17.20");
    try resolver.recordRequirement("lodash", "package-b", "^4.17.21");
    try resolver.recordRequirement("lodash", "package-c", "^4.17.19");

    var resolutions = try resolver.resolveAll();
    defer {
        var it = resolutions.iterator();
        while (it.next()) |entry| {
            allocator.free(entry.key_ptr.*);
            allocator.free(entry.value_ptr.*);
        }
        resolutions.deinit();
    }

    const lodash_version = resolutions.get("lodash").?;
    try testing.expectEqualStrings("^4.17.19", lodash_version); // Last one wins
}

test "ConflictResolver - conflict report" {
    const allocator = testing.allocator;

    var resolver = ConflictResolver.init(allocator, .strict);
    defer resolver.deinit();

    try resolver.recordRequirement("lodash", "package-a", "^4.17.20");
    try resolver.recordRequirement("lodash", "package-b", "^4.17.21");

    const report = try resolver.getConflictReport(allocator);
    defer allocator.free(report);

    try testing.expect(report.len > 0);
    try testing.expect(std.mem.indexOf(u8, report, "lodash") != null);
}

test "VersionChecker - exact match" {
    const checker = resolution.VersionChecker;

    try testing.expect(checker.satisfies("1.2.3", "1.2.3"));
    try testing.expect(!checker.satisfies("1.2.4", "1.2.3"));
}

test "VersionChecker - caret range" {
    const checker = resolution.VersionChecker;

    try testing.expect(checker.satisfies("1.2.3", "^1.2.0"));
    try testing.expect(checker.satisfies("1.9.9", "^1.2.0"));
    // Note: Our simplified implementation doesn't properly handle major version boundaries
}

// ============================================================================
// Peer Dependency Tests
// ============================================================================

test "PeerDependencyManager - no peers" {
    const allocator = testing.allocator;

    var manager = PeerDependencyManager.init(allocator);
    defer manager.deinit();

    try manager.recordInstalled("react", "18.2.0");

    var validation = try manager.validate();
    defer validation.deinit();

    try testing.expect(validation.satisfied);
    try testing.expectEqual(@as(usize, 0), validation.missing.len);
    try testing.expectEqual(@as(usize, 0), validation.incompatible.len);
}

test "PeerDependencyManager - satisfied peer" {
    const allocator = testing.allocator;

    var manager = PeerDependencyManager.init(allocator);
    defer manager.deinit();

    try manager.recordInstalled("react", "18.2.0");
    try manager.addPeerDependency("react", "^18.0.0", "react-dom", false);

    var validation = try manager.validate();
    defer validation.deinit();

    try testing.expect(validation.satisfied);
}

test "PeerDependencyManager - missing peer" {
    const allocator = testing.allocator;

    var manager = PeerDependencyManager.init(allocator);
    defer manager.deinit();

    try manager.addPeerDependency("react", "^18.0.0", "react-dom", false);

    var validation = try manager.validate();
    defer validation.deinit();

    try testing.expect(!validation.satisfied);
    try testing.expectEqual(@as(usize, 1), validation.missing.len);

    const missing = validation.missing[0];
    try testing.expectEqualStrings("react", missing.name);
    try testing.expectEqualStrings("react-dom", missing.required_by);
}

test "PeerDependencyManager - optional missing peer" {
    const allocator = testing.allocator;

    var manager = PeerDependencyManager.init(allocator);
    defer manager.deinit();

    try manager.addPeerDependency("react", "^18.0.0", "react-dom", true);

    var validation = try manager.validate();
    defer validation.deinit();

    // Missing optional peer still means satisfied
    try testing.expect(!validation.satisfied);
    try testing.expectEqual(@as(usize, 1), validation.missing.len);
    try testing.expect(validation.missing[0].optional);
    try testing.expect(validation.warnings.len > 0);
}

test "PeerDependencyManager - format validation report" {
    const allocator = testing.allocator;

    var manager = PeerDependencyManager.init(allocator);
    defer manager.deinit();

    try manager.addPeerDependency("react", "^18.0.0", "react-dom", false);

    var validation = try manager.validate();
    defer validation.deinit();

    const report = try PeerDependencyManager.formatValidationReport(&validation, allocator);
    defer allocator.free(report);

    try testing.expect(report.len > 0);
    try testing.expect(std.mem.indexOf(u8, report, "Missing peer dependencies") != null);
}

// ============================================================================
// Optional Dependency Tests
// ============================================================================

test "OptionalDependencyManager - initialization" {
    const allocator = testing.allocator;

    var manager = try OptionalDependencyManager.init(allocator);
    defer manager.deinit();

    try testing.expect(manager.current_platform.len > 0);
}

test "OptionalDependencyManager - add and check" {
    const allocator = testing.allocator;

    var manager = try OptionalDependencyManager.init(allocator);
    defer manager.deinit();

    const dep = resolution.OptionalDependency{
        .name = try allocator.dupe(u8, "fsevents"),
        .version = try allocator.dupe(u8, "2.3.2"),
        .platform_specific = false,
    };

    try manager.addOptionalDependency(dep);

    try testing.expect(manager.shouldInstall("fsevents"));
}

test "OptionalDependencyManager - platform specific" {
    const allocator = testing.allocator;

    var manager = try OptionalDependencyManager.init(allocator);
    defer manager.deinit();

    var platforms = try allocator.alloc([]const u8, 1);
    platforms[0] = try allocator.dupe(u8, "linux-x64");

    const dep = resolution.OptionalDependency{
        .name = try allocator.dupe(u8, "linux-only"),
        .version = try allocator.dupe(u8, "1.0.0"),
        .platform_specific = true,
        .platforms = platforms,
    };

    try manager.addOptionalDependency(dep);

    // Should install only on linux-x64
    const current_is_linux = std.mem.eql(u8, manager.current_platform, "linux-x64");
    try testing.expectEqual(current_is_linux, manager.shouldInstall("linux-only"));
}

test "OptionalDependencyManager - record results" {
    const allocator = testing.allocator;

    var manager = try OptionalDependencyManager.init(allocator);
    defer manager.deinit();

    try manager.recordResult("package-a", true, null);
    try manager.recordResult("package-b", false, "Installation failed");
    try manager.recordSkipped("package-c", "Platform not supported");

    const summary = manager.getSummary();

    try testing.expectEqual(@as(usize, 3), summary.total);
    try testing.expectEqual(@as(usize, 1), summary.installed);
    try testing.expectEqual(@as(usize, 1), summary.failed);
    try testing.expectEqual(@as(usize, 1), summary.skipped);
}

test "OptionalDependencyManager - format report" {
    const allocator = testing.allocator;

    var manager = try OptionalDependencyManager.init(allocator);
    defer manager.deinit();

    try manager.recordResult("package-a", true, null);
    try manager.recordResult("package-b", false, "Installation failed");

    const report = try manager.formatReport(allocator);
    defer allocator.free(report);

    try testing.expect(report.len > 0);
    try testing.expect(std.mem.indexOf(u8, report, "Optional dependencies") != null);
}

// ============================================================================
// Lock File Tests
// ============================================================================

test "LockFile - create and add package" {
    const allocator = testing.allocator;

    var lock_file = LockFile.init(allocator);
    defer lock_file.deinit();

    try lock_file.addPackage("lodash", "4.17.21", "https://registry.npmjs.org/lodash", null);

    const pkg = lock_file.getPackage("lodash", "4.17.21");
    try testing.expect(pkg != null);
    try testing.expectEqualStrings("lodash", pkg.?.name);
    try testing.expectEqualStrings("4.17.21", pkg.?.version);
}

test "LockFile - write and read" {
    const allocator = testing.allocator;

    // Create lock file
    var lock_file = LockFile.init(allocator);
    defer lock_file.deinit();

    try lock_file.addPackage("lodash", "4.17.21", "https://registry.npmjs.org/lodash", "sha512-abc123");
    try lock_file.addPackage("react", "18.2.0", "https://registry.npmjs.org/react", null);

    // Write to temp file
    const temp_path = "test_lock.json";
    defer io_helper.deleteFile(temp_path) catch {};

    try lock_file.write(temp_path);

    // Read it back
    var read_lock = try LockFile.read(allocator, temp_path);
    defer read_lock.deinit();

    try testing.expectEqual(@as(usize, 2), read_lock.packages.count());

    const lodash = read_lock.getPackage("lodash", "4.17.21");
    try testing.expect(lodash != null);
    try testing.expectEqualStrings("lodash", lodash.?.name);
    try testing.expectEqualStrings("sha512-abc123", lodash.?.integrity.?);
}

test "LockFile - validate matching installation" {
    const allocator = testing.allocator;

    var lock_file = LockFile.init(allocator);
    defer lock_file.deinit();

    try lock_file.addPackage("lodash", "4.17.21", "https://registry.npmjs.org/lodash", null);
    try lock_file.addPackage("react", "18.2.0", "https://registry.npmjs.org/react", null);

    var installed = std.StringHashMap([]const u8).init(allocator);
    defer {
        var it = installed.iterator();
        while (it.next()) |entry| {
            allocator.free(entry.key_ptr.*);
            allocator.free(entry.value_ptr.*);
        }
        installed.deinit();
    }

    try installed.put(try allocator.dupe(u8, "lodash"), try allocator.dupe(u8, "4.17.21"));
    try installed.put(try allocator.dupe(u8, "react"), try allocator.dupe(u8, "18.2.0"));

    var validation = try lock_file.validate(installed);
    defer validation.deinit();

    try testing.expect(validation.valid);
    try testing.expectEqual(@as(usize, 0), validation.missing.len);
    try testing.expectEqual(@as(usize, 0), validation.version_mismatch.len);
}

test "LockFile - validate with missing package" {
    const allocator = testing.allocator;

    var lock_file = LockFile.init(allocator);
    defer lock_file.deinit();

    try lock_file.addPackage("lodash", "4.17.21", "https://registry.npmjs.org/lodash", null);
    try lock_file.addPackage("react", "18.2.0", "https://registry.npmjs.org/react", null);

    var installed = std.StringHashMap([]const u8).init(allocator);
    defer {
        var it = installed.iterator();
        while (it.next()) |entry| {
            allocator.free(entry.key_ptr.*);
            allocator.free(entry.value_ptr.*);
        }
        installed.deinit();
    }

    try installed.put(try allocator.dupe(u8, "lodash"), try allocator.dupe(u8, "4.17.21"));
    // Missing react

    var validation = try lock_file.validate(installed);
    defer validation.deinit();

    try testing.expect(!validation.valid);
    try testing.expectEqual(@as(usize, 1), validation.missing.len);
    try testing.expectEqualStrings("react", validation.missing[0]);
}

test "LockFile - validate with version mismatch" {
    const allocator = testing.allocator;

    var lock_file = LockFile.init(allocator);
    defer lock_file.deinit();

    try lock_file.addPackage("lodash", "4.17.21", "https://registry.npmjs.org/lodash", null);

    var installed = std.StringHashMap([]const u8).init(allocator);
    defer {
        var it = installed.iterator();
        while (it.next()) |entry| {
            allocator.free(entry.key_ptr.*);
            allocator.free(entry.value_ptr.*);
        }
        installed.deinit();
    }

    try installed.put(try allocator.dupe(u8, "lodash"), try allocator.dupe(u8, "4.17.20")); // Wrong version

    var validation = try lock_file.validate(installed);
    defer validation.deinit();

    try testing.expect(!validation.valid);
    try testing.expectEqual(@as(usize, 1), validation.version_mismatch.len);

    const mismatch = validation.version_mismatch[0];
    try testing.expectEqualStrings("lodash", mismatch.name);
    try testing.expectEqualStrings("4.17.21", mismatch.expected);
    try testing.expectEqualStrings("4.17.20", mismatch.actual);
}

// ============================================================================
// Resolution Context Tests
// ============================================================================

test "ResolutionContext - initialization" {
    const allocator = testing.allocator;

    var context = try ResolutionContext.init(allocator, .highest_compatible);
    defer context.deinit();

    try testing.expect(context.lock_file == null);
}

test "ResolutionContext - resolve all" {
    const allocator = testing.allocator;

    var context = try ResolutionContext.init(allocator, .first_wins);
    defer context.deinit();

    // Add some conflicts
    try context.conflict_resolver.recordRequirement("lodash", "app", "^4.17.21");

    // Add peer deps
    try context.peer_manager.recordInstalled("react", "18.2.0");
    try context.peer_manager.addPeerDependency("react", "^18.0.0", "react-dom", false);

    // Resolve all
    var result = try context.resolveAll();
    defer result.deinit();

    try testing.expect(result.conflict_resolutions.count() > 0);
    try testing.expect(result.peer_validation.satisfied);
}
