const std = @import("std");
const lib = @import("lib");
const commands = lib.commands;

test "why command - no package specified" {
    const allocator = std.testing.allocator;

    const result = try commands.whyCommand(allocator, &[_][]const u8{}, .{});
    defer {
        var r = result;
        r.deinit(allocator);
    }

    try std.testing.expectEqual(@as(u8, 1), result.exit_code);
    try std.testing.expect(result.message != null);
    try std.testing.expect(std.mem.indexOf(u8, result.message.?, "No package specified") != null);
}

test "why command - package not found" {
    const allocator = std.testing.allocator;

    // Create temporary test directory
    var tmp_dir = std.testing.tmpDir(.{});
    defer tmp_dir.cleanup();

    // Create a minimal package.json
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

    const result = try commands.whyCommand(allocator, &[_][]const u8{"nonexistent-package"}, .{});
    defer {
        var r = result;
        r.deinit(allocator);
    }

    try std.testing.expectEqual(@as(u8, 1), result.exit_code);
    try std.testing.expect(result.message != null);
    try std.testing.expect(std.mem.indexOf(u8, result.message.?, "not found") != null);
}

test "why command - find specific package" {
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

    const result = try commands.whyCommand(allocator, &[_][]const u8{"react"}, .{});
    defer {
        var r = result;
        r.deinit(allocator);
    }

    try std.testing.expectEqual(@as(u8, 0), result.exit_code);
    try std.testing.expect(result.message != null);
    try std.testing.expect(std.mem.indexOf(u8, result.message.?, "Found") != null);
}

test "why command - glob pattern matching @types/*" {
    const allocator = std.testing.allocator;

    // Create temporary test directory
    var tmp_dir = std.testing.tmpDir(.{});
    defer tmp_dir.cleanup();

    // Create package.json with @types dependencies
    const package_json =
        \\{
        \\  "name": "test-app",
        \\  "version": "1.0.0",
        \\  "dependencies": {
        \\    "react": "^18.0.0"
        \\  },
        \\  "devDependencies": {
        \\    "@types/react": "^18.0.0",
        \\    "@types/node": "^20.0.0"
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

    const result = try commands.whyCommand(allocator, &[_][]const u8{"@types/*"}, .{});
    defer {
        var r = result;
        r.deinit(allocator);
    }

    try std.testing.expectEqual(@as(u8, 0), result.exit_code);
    try std.testing.expect(result.message != null);
    try std.testing.expect(std.mem.indexOf(u8, result.message.?, "2 package(s)") != null or
        std.mem.indexOf(u8, result.message.?, "Found") != null);
}

test "why command - glob pattern matching suffix *-react" {
    const allocator = std.testing.allocator;

    // Create temporary test directory
    var tmp_dir = std.testing.tmpDir(.{});
    defer tmp_dir.cleanup();

    // Create package.json with suffix-matching dependencies
    const package_json =
        \\{
        \\  "name": "test-app",
        \\  "version": "1.0.0",
        \\  "dependencies": {
        \\    "react": "^18.0.0",
        \\    "preact": "^10.0.0",
        \\    "inferno-react": "^1.0.0"
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

    const result = try commands.whyCommand(allocator, &[_][]const u8{"*-react"}, .{});
    defer {
        var r = result;
        r.deinit(allocator);
    }

    try std.testing.expectEqual(@as(u8, 0), result.exit_code);
    try std.testing.expect(result.message != null);
}

test "why command - dev dependency type indicated" {
    const allocator = std.testing.allocator;

    // Create temporary test directory
    var tmp_dir = std.testing.tmpDir(.{});
    defer tmp_dir.cleanup();

    // Create package.json with dev dependencies
    const package_json =
        \\{
        \\  "name": "test-app",
        \\  "version": "1.0.0",
        \\  "devDependencies": {
        \\    "@types/react": "^18.0.0"
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

    const result = try commands.whyCommand(allocator, &[_][]const u8{"@types/react"}, .{});
    defer {
        var r = result;
        r.deinit(allocator);
    }

    try std.testing.expectEqual(@as(u8, 0), result.exit_code);
}

test "why command - peer dependency type" {
    const allocator = std.testing.allocator;

    // Create temporary test directory
    var tmp_dir = std.testing.tmpDir(.{});
    defer tmp_dir.cleanup();

    // Create package.json with peer dependencies
    const package_json =
        \\{
        \\  "name": "test-app",
        \\  "version": "1.0.0",
        \\  "peerDependencies": {
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

    const result = try commands.whyCommand(allocator, &[_][]const u8{"react"}, .{});
    defer {
        var r = result;
        r.deinit(allocator);
    }

    try std.testing.expectEqual(@as(u8, 0), result.exit_code);
}

test "why command - JSONC support" {
    const allocator = std.testing.allocator;

    // Create temporary test directory
    var tmp_dir = std.testing.tmpDir(.{});
    defer tmp_dir.cleanup();

    // Create package.jsonc with comments
    const package_jsonc =
        \\{
        \\  // Project configuration
        \\  "name": "test-jsonc",
        \\  "version": "1.0.0",
        \\  "dependencies": {
        \\    "express": "^4.18.0" // Web framework
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

    const result = try commands.whyCommand(allocator, &[_][]const u8{"express"}, .{});
    defer {
        var r = result;
        r.deinit(allocator);
    }

    try std.testing.expectEqual(@as(u8, 0), result.exit_code);
    try std.testing.expect(result.message != null);
}

test "why command - --top option" {
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

    const result = try commands.whyCommand(allocator, &[_][]const u8{"react"}, .{ .top = true });
    defer {
        var r = result;
        r.deinit(allocator);
    }

    try std.testing.expectEqual(@as(u8, 0), result.exit_code);
}

test "why command - multiple matches for pattern" {
    const allocator = std.testing.allocator;

    // Create temporary test directory
    var tmp_dir = std.testing.tmpDir(.{});
    defer tmp_dir.cleanup();

    // Create package.json with multiple lodash packages
    const package_json =
        \\{
        \\  "name": "test-app",
        \\  "version": "1.0.0",
        \\  "dependencies": {
        \\    "lodash": "^4.17.21",
        \\    "lodash-es": "^4.17.21",
        \\    "lodash-fp": "^0.10.4"
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

    const result = try commands.whyCommand(allocator, &[_][]const u8{"lodash*"}, .{});
    defer {
        var r = result;
        r.deinit(allocator);
    }

    try std.testing.expectEqual(@as(u8, 0), result.exit_code);
    try std.testing.expect(result.message != null);
    try std.testing.expect(std.mem.indexOf(u8, result.message.?, "3 package(s)") != null or
        std.mem.indexOf(u8, result.message.?, "Found") != null);
}
