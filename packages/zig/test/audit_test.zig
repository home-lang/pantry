const std = @import("std");
const lib = @import("lib");
const commands = lib.commands;

test "audit command - no config file" {
    const allocator = std.testing.allocator;

    // Create temporary test directory without config
    var tmp_dir = std.testing.tmpDir(.{});
    defer tmp_dir.cleanup();

    // Change to temp directory
    const original_cwd = try std.process.getCwdAlloc(allocator);
    defer allocator.free(original_cwd);

    var tmp_path_buf: [std.fs.max_path_bytes]u8 = undefined;
    const tmp_path = try tmp_dir.dir.realpath(".", &tmp_path_buf);
    try std.process.changeCurDir(tmp_path);
    defer std.process.changeCurDir(original_cwd) catch {};

    const result = try commands.auditCommand(allocator, &[_][]const u8{}, .{});
    defer {
        var r = result;
        r.deinit(allocator);
    }

    try std.testing.expectEqual(@as(u8, 1), result.exit_code);
    try std.testing.expect(result.message != null);
}

test "audit command - empty dependencies" {
    const allocator = std.testing.allocator;

    // Create temporary test directory
    var tmp_dir = std.testing.tmpDir(.{});
    defer tmp_dir.cleanup();

    // Create package.json with no dependencies
    const package_json =
        \\{
        \\  "name": "test-project",
        \\  "version": "1.0.0"
        \\}
    ;

    try tmp_dir.dir.writeFile(.{ .sub_path = "package.json", .data = package_json });

    // Change to temp directory
    const original_cwd = try std.process.getCwdAlloc(allocator);
    defer allocator.free(original_cwd);

    var tmp_path_buf: [std.fs.max_path_bytes]u8 = undefined;
    const tmp_path = try tmp_dir.dir.realpath(".", &tmp_path_buf);
    try std.process.changeCurDir(tmp_path);
    defer std.process.changeCurDir(original_cwd) catch {};

    const result = try commands.auditCommand(allocator, &[_][]const u8{}, .{});
    defer {
        var r = result;
        r.deinit(allocator);
    }

    try std.testing.expectEqual(@as(u8, 0), result.exit_code);
    try std.testing.expect(result.message != null);
    try std.testing.expect(std.mem.indexOf(u8, result.message.?, "No vulnerabilities") != null);
}

test "audit command - with dependencies (stub)" {
    const allocator = std.testing.allocator;

    // Create temporary test directory
    var tmp_dir = std.testing.tmpDir(.{});
    defer tmp_dir.cleanup();

    // Create package.json with dependencies
    const package_json =
        \\{
        \\  "name": "test-app",
        \\  "version": "1.0.0",
        \\  "dependencies": {
        \\    "react": "^18.0.0",
        \\    "lodash": "^4.17.21"
        \\  }
        \\}
    ;

    try tmp_dir.dir.writeFile(.{ .sub_path = "package.json", .data = package_json });

    // Change to temp directory
    const original_cwd = try std.process.getCwdAlloc(allocator);
    defer allocator.free(original_cwd);

    var tmp_path_buf: [std.fs.max_path_bytes]u8 = undefined;
    const tmp_path = try tmp_dir.dir.realpath(".", &tmp_path_buf);
    try std.process.changeCurDir(tmp_path);
    defer std.process.changeCurDir(original_cwd) catch {};

    const result = try commands.auditCommand(allocator, &[_][]const u8{}, .{});
    defer {
        var r = result;
        r.deinit(allocator);
    }

    // Since vulnerability DB querying is stubbed, should find no vulnerabilities
    try std.testing.expectEqual(@as(u8, 0), result.exit_code);
}

test "audit command - prod only flag" {
    const allocator = std.testing.allocator;

    // Create temporary test directory
    var tmp_dir = std.testing.tmpDir(.{});
    defer tmp_dir.cleanup();

    // Create package.json with both prod and dev dependencies
    const package_json =
        \\{
        \\  "name": "test-app",
        \\  "version": "1.0.0",
        \\  "dependencies": {
        \\    "react": "^18.0.0"
        \\  },
        \\  "devDependencies": {
        \\    "typescript": "^5.0.0"
        \\  }
        \\}
    ;

    try tmp_dir.dir.writeFile(.{ .sub_path = "package.json", .data = package_json });

    // Change to temp directory
    const original_cwd = try std.process.getCwdAlloc(allocator);
    defer allocator.free(original_cwd);

    var tmp_path_buf: [std.fs.max_path_bytes]u8 = undefined;
    const tmp_path = try tmp_dir.dir.realpath(".", &tmp_path_buf);
    try std.process.changeCurDir(tmp_path);
    defer std.process.changeCurDir(original_cwd) catch {};

    const result = try commands.auditCommand(allocator, &[_][]const u8{}, .{ .prod_only = true });
    defer {
        var r = result;
        r.deinit(allocator);
    }

    try std.testing.expectEqual(@as(u8, 0), result.exit_code);
}

test "audit command - JSON output" {
    const allocator = std.testing.allocator;

    // Create temporary test directory
    var tmp_dir = std.testing.tmpDir(.{});
    defer tmp_dir.cleanup();

    // Create package.json
    const package_json =
        \\{
        \\  "name": "test-app",
        \\  "version": "1.0.0",
        \\  "dependencies": {
        \\    "react": "^18.0.0"
        \\  }
        \\}
    ;

    try tmp_dir.dir.writeFile(.{ .sub_path = "package.json", .data = package_json });

    // Change to temp directory
    const original_cwd = try std.process.getCwdAlloc(allocator);
    defer allocator.free(original_cwd);

    var tmp_path_buf: [std.fs.max_path_bytes]u8 = undefined;
    const tmp_path = try tmp_dir.dir.realpath(".", &tmp_path_buf);
    try std.process.changeCurDir(tmp_path);
    defer std.process.changeCurDir(original_cwd) catch {};

    const result = try commands.auditCommand(allocator, &[_][]const u8{}, .{ .json = true });
    defer {
        var r = result;
        r.deinit(allocator);
    }

    try std.testing.expect(result.message != null);
    // Should be valid JSON
    try std.testing.expect(std.mem.indexOf(u8, result.message.?, "{\"vulnerabilities\":[") != null);
}

test "audit command - severity level filtering" {
    const allocator = std.testing.allocator;

    // Create temporary test directory
    var tmp_dir = std.testing.tmpDir(.{});
    defer tmp_dir.cleanup();

    // Create package.json
    const package_json =
        \\{
        \\  "name": "test-app",
        \\  "version": "1.0.0",
        \\  "dependencies": {
        \\    "lodash": "^4.17.21"
        \\  }
        \\}
    ;

    try tmp_dir.dir.writeFile(.{ .sub_path = "package.json", .data = package_json });

    // Change to temp directory
    const original_cwd = try std.process.getCwdAlloc(allocator);
    defer allocator.free(original_cwd);

    var tmp_path_buf: [std.fs.max_path_bytes]u8 = undefined;
    const tmp_path = try tmp_dir.dir.realpath(".", &tmp_path_buf);
    try std.process.changeCurDir(tmp_path);
    defer std.process.changeCurDir(original_cwd) catch {};

    const result = try commands.auditCommand(allocator, &[_][]const u8{}, .{
        .audit_level = .high,
    });
    defer {
        var r = result;
        r.deinit(allocator);
    }

    try std.testing.expectEqual(@as(u8, 0), result.exit_code);
}

test "audit command - security scanner configuration" {
    const allocator = std.testing.allocator;

    // Create temporary test directory
    var tmp_dir = std.testing.tmpDir(.{});
    defer tmp_dir.cleanup();

    // Create package.json with security scanner config
    const package_json =
        \\{
        \\  "name": "test-app",
        \\  "version": "1.0.0",
        \\  "security": {
        \\    "scanner": "@acme/security-scanner"
        \\  },
        \\  "dependencies": {
        \\    "react": "^18.0.0"
        \\  }
        \\}
    ;

    try tmp_dir.dir.writeFile(.{ .sub_path = "package.json", .data = package_json });

    // Change to temp directory
    const original_cwd = try std.process.getCwdAlloc(allocator);
    defer allocator.free(original_cwd);

    var tmp_path_buf: [std.fs.max_path_bytes]u8 = undefined;
    const tmp_path = try tmp_dir.dir.realpath(".", &tmp_path_buf);
    try std.process.changeCurDir(tmp_path);
    defer std.process.changeCurDir(original_cwd) catch {};

    const result = try commands.auditCommand(allocator, &[_][]const u8{}, .{});
    defer {
        var r = result;
        r.deinit(allocator);
    }

    try std.testing.expect(result.message != null);
    // Should acknowledge the scanner
    try std.testing.expect(std.mem.indexOf(u8, result.message.?, "scanner") != null or
        std.mem.indexOf(u8, result.message.?, "Security") != null);
}

test "audit command - JSONC support" {
    const allocator = std.testing.allocator;

    // Create temporary test directory
    var tmp_dir = std.testing.tmpDir(.{});
    defer tmp_dir.cleanup();

    // Create package.jsonc with comments
    const package_jsonc =
        \\{
        \\  // Project configuration
        \\  "name": "test-app",
        \\  "version": "1.0.0",
        \\  "dependencies": {
        \\    "react": "^18.0.0" // UI library
        \\  }
        \\}
    ;

    try tmp_dir.dir.writeFile(.{ .sub_path = "package.jsonc", .data = package_jsonc });

    // Change to temp directory
    const original_cwd = try std.process.getCwdAlloc(allocator);
    defer allocator.free(original_cwd);

    var tmp_path_buf: [std.fs.max_path_bytes]u8 = undefined;
    const tmp_path = try tmp_dir.dir.realpath(".", &tmp_path_buf);
    try std.process.changeCurDir(tmp_path);
    defer std.process.changeCurDir(original_cwd) catch {};

    const result = try commands.auditCommand(allocator, &[_][]const u8{}, .{});
    defer {
        var r = result;
        r.deinit(allocator);
    }

    try std.testing.expectEqual(@as(u8, 0), result.exit_code);
}

test "Severity enum - from string" {
    try std.testing.expectEqual(@as(?commands.Severity, .low), commands.Severity.fromString("low"));
    try std.testing.expectEqual(@as(?commands.Severity, .moderate), commands.Severity.fromString("moderate"));
    try std.testing.expectEqual(@as(?commands.Severity, .high), commands.Severity.fromString("high"));
    try std.testing.expectEqual(@as(?commands.Severity, .critical), commands.Severity.fromString("critical"));
    try std.testing.expectEqual(@as(?commands.Severity, null), commands.Severity.fromString("invalid"));
}

test "Severity enum - to string" {
    try std.testing.expectEqualStrings("low", commands.Severity.low.toString());
    try std.testing.expectEqualStrings("moderate", commands.Severity.moderate.toString());
    try std.testing.expectEqualStrings("high", commands.Severity.high.toString());
    try std.testing.expectEqualStrings("critical", commands.Severity.critical.toString());
}

test "Severity enum - to int ordering" {
    try std.testing.expect(commands.Severity.low.toInt() < commands.Severity.moderate.toInt());
    try std.testing.expect(commands.Severity.moderate.toInt() < commands.Severity.high.toInt());
    try std.testing.expect(commands.Severity.high.toInt() < commands.Severity.critical.toInt());
}
