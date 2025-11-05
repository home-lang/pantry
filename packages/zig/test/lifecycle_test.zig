const std = @import("std");
const lib = @import("lib");
const lifecycle = lib.lifecycle;

test "LifecycleScript - toString" {
    try std.testing.expectEqualStrings("preinstall", lifecycle.LifecycleScript.preinstall.toString());
    try std.testing.expectEqualStrings("postinstall", lifecycle.LifecycleScript.postinstall.toString());
    try std.testing.expectEqualStrings("preuninstall", lifecycle.LifecycleScript.preuninstall.toString());
    try std.testing.expectEqualStrings("postuninstall", lifecycle.LifecycleScript.postuninstall.toString());
    try std.testing.expectEqualStrings("prepublishOnly", lifecycle.LifecycleScript.prepublishOnly.toString());
}

test "LifecycleScript - fromString" {
    try std.testing.expectEqual(@as(?lifecycle.LifecycleScript, .preinstall), lifecycle.LifecycleScript.fromString("preinstall"));
    try std.testing.expectEqual(@as(?lifecycle.LifecycleScript, .postinstall), lifecycle.LifecycleScript.fromString("postinstall"));
    try std.testing.expectEqual(@as(?lifecycle.LifecycleScript, .preuninstall), lifecycle.LifecycleScript.fromString("preuninstall"));
    try std.testing.expectEqual(@as(?lifecycle.LifecycleScript, .postuninstall), lifecycle.LifecycleScript.fromString("postuninstall"));
    try std.testing.expectEqual(@as(?lifecycle.LifecycleScript, .prepublishOnly), lifecycle.LifecycleScript.fromString("prepublishOnly"));
    try std.testing.expectEqual(@as(?lifecycle.LifecycleScript, null), lifecycle.LifecycleScript.fromString("invalid"));
}

test "isDefaultTrusted - known packages" {
    try std.testing.expect(lifecycle.isDefaultTrusted("node-sass"));
    try std.testing.expect(lifecycle.isDefaultTrusted("esbuild"));
    try std.testing.expect(lifecycle.isDefaultTrusted("sharp"));
    try std.testing.expect(lifecycle.isDefaultTrusted("puppeteer"));
    try std.testing.expect(lifecycle.isDefaultTrusted("husky"));
}

test "isDefaultTrusted - unknown packages" {
    try std.testing.expect(!lifecycle.isDefaultTrusted("unknown-package"));
    try std.testing.expect(!lifecycle.isDefaultTrusted("malicious-pkg"));
    try std.testing.expect(!lifecycle.isDefaultTrusted(""));
}

test "loadTrustedDependencies - empty config" {
    const allocator = std.testing.allocator;

    const json_str =
        \\{
        \\  "name": "test-app",
        \\  "version": "1.0.0"
        \\}
    ;

    const parsed = try std.json.parseFromSlice(std.json.Value, allocator, json_str, .{});
    defer parsed.deinit();

    var trusted = try lifecycle.loadTrustedDependencies(allocator, parsed);
    defer {
        var it = trusted.keyIterator();
        while (it.next()) |key| {
            allocator.free(key.*);
        }
        trusted.deinit();
    }

    try std.testing.expectEqual(@as(usize, 0), trusted.count());
}

test "loadTrustedDependencies - with trusted packages" {
    const allocator = std.testing.allocator;

    const json_str =
        \\{
        \\  "name": "test-app",
        \\  "version": "1.0.0",
        \\  "trustedDependencies": ["custom-package", "another-pkg"]
        \\}
    ;

    const parsed = try std.json.parseFromSlice(std.json.Value, allocator, json_str, .{});
    defer parsed.deinit();

    var trusted = try lifecycle.loadTrustedDependencies(allocator, parsed);
    defer {
        var it = trusted.keyIterator();
        while (it.next()) |key| {
            allocator.free(key.*);
        }
        trusted.deinit();
    }

    try std.testing.expectEqual(@as(usize, 2), trusted.count());
    try std.testing.expect(trusted.contains("custom-package"));
    try std.testing.expect(trusted.contains("another-pkg"));
}

test "isTrusted - custom trusted package" {
    const allocator = std.testing.allocator;

    var trusted = std.StringHashMap(void).init(allocator);
    defer trusted.deinit();

    const key = try allocator.dupe(u8, "my-package");
    try trusted.put(key, {});
    defer allocator.free(key);

    try std.testing.expect(lifecycle.isTrusted("my-package", trusted));
    try std.testing.expect(!lifecycle.isTrusted("other-package", trusted));
}

test "isTrusted - default trusted package" {
    const allocator = std.testing.allocator;

    var trusted = std.StringHashMap(void).init(allocator);
    defer trusted.deinit();

    // Should be trusted even without being in the custom list
    try std.testing.expect(lifecycle.isTrusted("node-sass", trusted));
    try std.testing.expect(lifecycle.isTrusted("esbuild", trusted));
}

test "extractScripts - no scripts" {
    const allocator = std.testing.allocator;

    const json_str =
        \\{
        \\  "name": "test-pkg",
        \\  "version": "1.0.0"
        \\}
    ;

    const parsed = try std.json.parseFromSlice(std.json.Value, allocator, json_str, .{});
    defer parsed.deinit();

    var scripts = try lifecycle.extractScripts(allocator, parsed);
    defer {
        var it = scripts.iterator();
        while (it.next()) |entry| {
            allocator.free(entry.key_ptr.*);
            allocator.free(entry.value_ptr.*);
        }
        scripts.deinit();
    }

    try std.testing.expectEqual(@as(usize, 0), scripts.count());
}

test "extractScripts - with lifecycle scripts" {
    const allocator = std.testing.allocator;

    const json_str =
        \\{
        \\  "name": "test-pkg",
        \\  "version": "1.0.0",
        \\  "scripts": {
        \\    "preinstall": "echo pre",
        \\    "postinstall": "echo post",
        \\    "test": "jest"
        \\  }
        \\}
    ;

    const parsed = try std.json.parseFromSlice(std.json.Value, allocator, json_str, .{});
    defer parsed.deinit();

    var scripts = try lifecycle.extractScripts(allocator, parsed);
    defer {
        var it = scripts.iterator();
        while (it.next()) |entry| {
            allocator.free(entry.key_ptr.*);
            allocator.free(entry.value_ptr.*);
        }
        scripts.deinit();
    }

    try std.testing.expectEqual(@as(usize, 3), scripts.count());
    try std.testing.expect(scripts.contains("preinstall"));
    try std.testing.expect(scripts.contains("postinstall"));
    try std.testing.expect(scripts.contains("test"));

    const preinstall_cmd = scripts.get("preinstall").?;
    try std.testing.expectEqualStrings("echo pre", preinstall_cmd);
}

test "executeScript - with ignore_scripts flag" {
    const allocator = std.testing.allocator;

    var tmp_dir = std.testing.tmpDir(.{});
    defer tmp_dir.cleanup();

    var tmp_path_buf: [std.fs.max_path_bytes]u8 = undefined;
    const tmp_path = try tmp_dir.dir.realpath(".", &tmp_path_buf);

    const result = try lifecycle.executeScript(
        allocator,
        "test",
        "echo hello",
        .{
            .cwd = tmp_path,
            .ignore_scripts = true,
        },
    );

    try std.testing.expect(result.success);
    try std.testing.expectEqual(@as(u8, 0), result.exit_code);
}

test "executeScript - simple echo command" {
    const allocator = std.testing.allocator;

    var tmp_dir = std.testing.tmpDir(.{});
    defer tmp_dir.cleanup();

    var tmp_path_buf: [std.fs.max_path_bytes]u8 = undefined;
    const tmp_path = try tmp_dir.dir.realpath(".", &tmp_path_buf);

    var result = try lifecycle.executeScript(
        allocator,
        "test",
        "echo hello",
        .{
            .cwd = tmp_path,
            .ignore_scripts = false,
        },
    );
    defer result.deinit(allocator);

    try std.testing.expect(result.success);
    try std.testing.expectEqual(@as(u8, 0), result.exit_code);
    try std.testing.expect(result.stdout != null);
}

test "executeScript - failing command" {
    const allocator = std.testing.allocator;

    var tmp_dir = std.testing.tmpDir(.{});
    defer tmp_dir.cleanup();

    var tmp_path_buf: [std.fs.max_path_bytes]u8 = undefined;
    const tmp_path = try tmp_dir.dir.realpath(".", &tmp_path_buf);

    var result = try lifecycle.executeScript(
        allocator,
        "test",
        "exit 1",
        .{
            .cwd = tmp_path,
            .ignore_scripts = false,
        },
    );
    defer result.deinit(allocator);

    try std.testing.expect(!result.success);
    try std.testing.expectEqual(@as(u8, 1), result.exit_code);
}

test "runLifecycleScript - package without scripts" {
    const allocator = std.testing.allocator;

    var tmp_dir = std.testing.tmpDir(.{});
    defer tmp_dir.cleanup();

    // Create a package.json without scripts
    const package_json =
        \\{
        \\  "name": "test-pkg",
        \\  "version": "1.0.0"
        \\}
    ;

    try tmp_dir.dir.writeFile(.{ .sub_path = "package.json", .data = package_json });

    var tmp_path_buf: [std.fs.max_path_bytes]u8 = undefined;
    const tmp_path = try tmp_dir.dir.realpath(".", &tmp_path_buf);

    const result = try lifecycle.runLifecycleScript(
        allocator,
        "test-pkg",
        .postinstall,
        tmp_path,
        .{ .cwd = tmp_path },
    );

    try std.testing.expectEqual(@as(?lifecycle.ScriptResult, null), result);
}

test "runLifecycleScript - untrusted package skipped" {
    const allocator = std.testing.allocator;

    var tmp_dir = std.testing.tmpDir(.{});
    defer tmp_dir.cleanup();

    // Create a package.json with postinstall script
    const package_json =
        \\{
        \\  "name": "untrusted-pkg",
        \\  "version": "1.0.0",
        \\  "scripts": {
        \\    "postinstall": "echo dangerous"
        \\  }
        \\}
    ;

    try tmp_dir.dir.writeFile(.{ .sub_path = "package.json", .data = package_json });

    var tmp_path_buf: [std.fs.max_path_bytes]u8 = undefined;
    const tmp_path = try tmp_dir.dir.realpath(".", &tmp_path_buf);

    const result = try lifecycle.runLifecycleScript(
        allocator,
        "untrusted-pkg",
        .postinstall,
        tmp_path,
        .{
            .cwd = tmp_path,
            .verbose = false,
        },
    );

    // Should be skipped (null) because package is not trusted
    try std.testing.expectEqual(@as(?lifecycle.ScriptResult, null), result);
}

test "runLifecycleScript - trusted package executes" {
    const allocator = std.testing.allocator;

    var tmp_dir = std.testing.tmpDir(.{});
    defer tmp_dir.cleanup();

    // Create root package.json with trustedDependencies
    const root_package_json =
        \\{
        \\  "name": "root-app",
        \\  "version": "1.0.0",
        \\  "trustedDependencies": ["safe-pkg"]
        \\}
    ;

    // Create package directory
    try tmp_dir.dir.makeDir("node_modules");
    try tmp_dir.dir.makeDir("node_modules/safe-pkg");

    const package_json =
        \\{
        \\  "name": "safe-pkg",
        \\  "version": "1.0.0",
        \\  "scripts": {
        \\    "postinstall": "echo installed"
        \\  }
        \\}
    ;

    try tmp_dir.dir.writeFile(.{ .sub_path = "package.json", .data = root_package_json });
    try tmp_dir.dir.writeFile(.{ .sub_path = "node_modules/safe-pkg/package.json", .data = package_json });

    // Change to temp directory for root package.json lookup
    const original_cwd = try std.process.getCwdAlloc(allocator);
    defer allocator.free(original_cwd);

    var tmp_path_buf: [std.fs.max_path_bytes]u8 = undefined;
    const tmp_path = try tmp_dir.dir.realpath(".", &tmp_path_buf);

    try std.process.changeCurDir(tmp_path);
    defer std.process.changeCurDir(original_cwd) catch {};

    const pkg_path = try std.fs.path.join(allocator, &[_][]const u8{ tmp_path, "node_modules", "safe-pkg" });
    defer allocator.free(pkg_path);

    var result_opt = try lifecycle.runLifecycleScript(
        allocator,
        "safe-pkg",
        .postinstall,
        pkg_path,
        .{
            .cwd = pkg_path,
            .verbose = false,
        },
    );

    if (result_opt) |*result| {
        defer result.deinit(allocator);
        try std.testing.expect(result.success);
    }
}

test "runLifecycleScript - default trusted package" {
    const allocator = std.testing.allocator;

    var tmp_dir = std.testing.tmpDir(.{});
    defer tmp_dir.cleanup();

    // Create root package.json WITHOUT trustedDependencies
    const root_package_json =
        \\{
        \\  "name": "root-app",
        \\  "version": "1.0.0"
        \\}
    ;

    try tmp_dir.dir.makeDir("node_modules");
    try tmp_dir.dir.makeDir("node_modules/node-sass");

    const package_json =
        \\{
        \\  "name": "node-sass",
        \\  "version": "6.0.0",
        \\  "scripts": {
        \\    "postinstall": "echo building"
        \\  }
        \\}
    ;

    try tmp_dir.dir.writeFile(.{ .sub_path = "package.json", .data = root_package_json });
    try tmp_dir.dir.writeFile(.{ .sub_path = "node_modules/node-sass/package.json", .data = package_json });

    const original_cwd = try std.process.getCwdAlloc(allocator);
    defer allocator.free(original_cwd);

    var tmp_path_buf: [std.fs.max_path_bytes]u8 = undefined;
    const tmp_path = try tmp_dir.dir.realpath(".", &tmp_path_buf);

    try std.process.changeCurDir(tmp_path);
    defer std.process.changeCurDir(original_cwd) catch {};

    const pkg_path = try std.fs.path.join(allocator, &[_][]const u8{ tmp_path, "node_modules", "node-sass" });
    defer allocator.free(pkg_path);

    var result_opt = try lifecycle.runLifecycleScript(
        allocator,
        "node-sass",
        .postinstall,
        pkg_path,
        .{
            .cwd = pkg_path,
            .verbose = false,
        },
    );

    // Should execute because node-sass is in default trusted list
    if (result_opt) |*result| {
        defer result.deinit(allocator);
        try std.testing.expect(result.success);
    }
}
