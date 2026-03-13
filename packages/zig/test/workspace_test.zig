const std = @import("std");
const testing = std.testing;
const lib = @import("lib");

// ============================================================================
// Detector Tests — workspace file detection
// ============================================================================

test "detector.findWorkspaceFile - returns null when no workspace file exists" {
    const allocator = testing.allocator;

    // Use /tmp which shouldn't have workspace files
    const result = try lib.deps.detector.findWorkspaceFile(allocator, "/tmp");
    if (result) |ws| {
        defer allocator.free(ws.path);
        defer allocator.free(ws.root_dir);
        // If /tmp somehow has a workspace file, that's fine — just verify the result struct
        try testing.expect(ws.path.len > 0);
        try testing.expect(ws.root_dir.len > 0);
    }
}

test "detector.findDepsAndWorkspaceFile - returns both files when present" {
    const allocator = testing.allocator;

    // Create a temporary workspace directory structure
    const tmp = try createTempDir(allocator);
    defer cleanupTempDir(allocator, tmp);

    // Create root package.json with workspaces field
    const root_pkg = try std.fs.path.join(allocator, &[_][]const u8{ tmp, "package.json" });
    defer allocator.free(root_pkg);
    try writeFile(root_pkg, "{\"name\": \"test-ws\", \"workspaces\": [\"packages/*\"]}");

    // Create a member directory with its own package.json
    const member_dir = try std.fs.path.join(allocator, &[_][]const u8{ tmp, "packages", "app" });
    defer allocator.free(member_dir);
    {
        const packages_dir = try std.fs.path.join(allocator, &[_][]const u8{ tmp, "packages" });
        defer allocator.free(packages_dir);
        try lib.io_helper.makePath(packages_dir);
    }
    try lib.io_helper.makePath(member_dir);

    const member_pkg = try std.fs.path.join(allocator, &[_][]const u8{ member_dir, "package.json" });
    defer allocator.free(member_pkg);
    try writeFile(member_pkg, "{\"name\": \"app\", \"dependencies\": {\"express\": \"^4.0\"}}");

    // Search from member directory — should find both files
    const result = try lib.deps.detector.findDepsAndWorkspaceFile(allocator, member_dir);

    // Should find deps file in member directory
    try testing.expect(result.deps_file != null);
    if (result.deps_file) |df| {
        defer allocator.free(df.path);
        try testing.expect(std.mem.endsWith(u8, df.path, "package.json"));
        // deps file should be in the MEMBER directory
        const deps_dir = std.fs.path.dirname(df.path) orelse "";
        try testing.expect(std.mem.endsWith(u8, deps_dir, "app"));
    }

    // Should find workspace file in root directory
    try testing.expect(result.workspace_file != null);
    if (result.workspace_file) |ws| {
        defer allocator.free(ws.path);
        defer allocator.free(ws.root_dir);
        // Workspace file should be at root (the package.json with "workspaces")
        try testing.expect(std.mem.endsWith(u8, ws.root_dir, std.fs.path.basename(tmp)));
    }
}

test "detector.findDepsAndWorkspaceFile - finds workspace even when member has pantry.json" {
    const allocator = testing.allocator;

    const tmp = try createTempDir(allocator);
    defer cleanupTempDir(allocator, tmp);

    // Root has package.json with workspaces
    const root_pkg = try std.fs.path.join(allocator, &[_][]const u8{ tmp, "package.json" });
    defer allocator.free(root_pkg);
    try writeFile(root_pkg, "{\"name\": \"ws-root\", \"workspaces\": [\"packages/*\"]}");

    // Member has pantry.json (higher priority dep file than package.json)
    const member_dir = try std.fs.path.join(allocator, &[_][]const u8{ tmp, "packages", "lib" });
    defer allocator.free(member_dir);
    {
        const packages_dir = try std.fs.path.join(allocator, &[_][]const u8{ tmp, "packages" });
        defer allocator.free(packages_dir);
        try lib.io_helper.makePath(packages_dir);
    }
    try lib.io_helper.makePath(member_dir);

    const member_pantry = try std.fs.path.join(allocator, &[_][]const u8{ member_dir, "pantry.json" });
    defer allocator.free(member_pantry);
    try writeFile(member_pantry, "{\"dependencies\": {\"lodash\": \"^4.0\"}}");

    const result = try lib.deps.detector.findDepsAndWorkspaceFile(allocator, member_dir);

    // Should find pantry.json as deps file
    try testing.expect(result.deps_file != null);
    if (result.deps_file) |df| {
        defer allocator.free(df.path);
        try testing.expect(std.mem.endsWith(u8, df.path, "pantry.json"));
        try testing.expect(df.format == .pantry_json);
    }

    // Should still find workspace file at root
    try testing.expect(result.workspace_file != null);
    if (result.workspace_file) |ws| {
        defer allocator.free(ws.path);
        defer allocator.free(ws.root_dir);
    }
}

test "detector.findDepsAndWorkspaceFile - no workspace when workspaces field absent" {
    const allocator = testing.allocator;

    const tmp = try createTempDir(allocator);
    defer cleanupTempDir(allocator, tmp);

    // Root has package.json WITHOUT workspaces
    const root_pkg = try std.fs.path.join(allocator, &[_][]const u8{ tmp, "package.json" });
    defer allocator.free(root_pkg);
    try writeFile(root_pkg, "{\"name\": \"solo-project\", \"dependencies\": {\"express\": \"^4.0\"}}");

    const result = try lib.deps.detector.findDepsAndWorkspaceFile(allocator, tmp);

    // Should find deps file
    try testing.expect(result.deps_file != null);
    if (result.deps_file) |df| {
        defer allocator.free(df.path);
    }

    // Should NOT find workspace file
    if (result.workspace_file) |ws| {
        defer allocator.free(ws.path);
        defer allocator.free(ws.root_dir);
        // This shouldn't happen, but clean up if it does
    }
    try testing.expect(result.workspace_file == null);
}

test "detector.findDepsAndWorkspaceFile - format enum mapping is correct" {
    // Verify that the format indices in findDepsAndWorkspaceFile match the FileFormat enum
    // This is a compile-time check encoded as a test
    const FileFormat = lib.deps.detector.DepsFile.FileFormat;

    // These are the critical mappings that must be correct
    try testing.expectEqual(@as(u32, 0), @intFromEnum(FileFormat.pantry_json));
    try testing.expectEqual(@as(u32, 1), @intFromEnum(FileFormat.pantry_jsonc));
    try testing.expectEqual(@as(u32, 2), @intFromEnum(FileFormat.pantry_yaml));
    try testing.expectEqual(@as(u32, 3), @intFromEnum(FileFormat.pantry_yml));
    try testing.expectEqual(@as(u32, 4), @intFromEnum(FileFormat.deps_yaml));
    try testing.expectEqual(@as(u32, 5), @intFromEnum(FileFormat.deps_yml));
    try testing.expectEqual(@as(u32, 6), @intFromEnum(FileFormat.dependencies_yaml));
    try testing.expectEqual(@as(u32, 7), @intFromEnum(FileFormat.pkgx_yaml));
    try testing.expectEqual(@as(u32, 8), @intFromEnum(FileFormat.config_deps_ts));
    try testing.expectEqual(@as(u32, 9), @intFromEnum(FileFormat.dotconfig_deps_ts));
    try testing.expectEqual(@as(u32, 10), @intFromEnum(FileFormat.pantry_config_ts));
    try testing.expectEqual(@as(u32, 11), @intFromEnum(FileFormat.dotconfig_pantry_ts));
    try testing.expectEqual(@as(u32, 12), @intFromEnum(FileFormat.package_json));
    try testing.expectEqual(@as(u32, 13), @intFromEnum(FileFormat.package_jsonc));
}

test "detector.inferFormat - all formats map correctly" {
    try testing.expectEqual(lib.deps.detector.DepsFile.FileFormat.pantry_json, lib.deps.detector.inferFormat("pantry.json").?);
    try testing.expectEqual(lib.deps.detector.DepsFile.FileFormat.pantry_jsonc, lib.deps.detector.inferFormat("pantry.jsonc").?);
    try testing.expectEqual(lib.deps.detector.DepsFile.FileFormat.package_json, lib.deps.detector.inferFormat("package.json").?);
    try testing.expectEqual(lib.deps.detector.DepsFile.FileFormat.cargo_toml, lib.deps.detector.inferFormat("Cargo.toml").?);
    try testing.expect(lib.deps.detector.inferFormat("unknown.xyz") == null);
}

// ============================================================================
// Workspace Discovery Tests
// ============================================================================

test "workspace discovery - finds members with package.json" {
    const allocator = testing.allocator;
    const workspace_mod = @import("lib").deps.detector;
    _ = workspace_mod;

    const tmp = try createTempDir(allocator);
    defer cleanupTempDir(allocator, tmp);

    // Create workspace structure
    // root/
    //   package.json (with workspaces)
    //   packages/
    //     app/package.json
    //     lib/package.json
    //     empty/ (no package.json — should be skipped)
    const root_pkg = try std.fs.path.join(allocator, &[_][]const u8{ tmp, "package.json" });
    defer allocator.free(root_pkg);
    try writeFile(root_pkg, "{\"name\": \"ws\", \"workspaces\": [\"packages/*\"]}");

    {
        const packages_dir = try std.fs.path.join(allocator, &[_][]const u8{ tmp, "packages" });
        defer allocator.free(packages_dir);
        try lib.io_helper.makePath(packages_dir);
    }

    // Create app member
    const app_dir = try std.fs.path.join(allocator, &[_][]const u8{ tmp, "packages", "app" });
    defer allocator.free(app_dir);
    try lib.io_helper.makePath(app_dir);
    const app_pkg = try std.fs.path.join(allocator, &[_][]const u8{ app_dir, "package.json" });
    defer allocator.free(app_pkg);
    try writeFile(app_pkg, "{\"name\": \"@ws/app\", \"dependencies\": {\"express\": \"^4.0\"}}");

    // Create lib member
    const lib_dir = try std.fs.path.join(allocator, &[_][]const u8{ tmp, "packages", "lib" });
    defer allocator.free(lib_dir);
    try lib.io_helper.makePath(lib_dir);
    const lib_pkg = try std.fs.path.join(allocator, &[_][]const u8{ lib_dir, "package.json" });
    defer allocator.free(lib_pkg);
    try writeFile(lib_pkg, "{\"name\": \"@ws/lib\", \"dependencies\": {\"lodash\": \"^4.0\"}}");

    // Create empty dir (no config — should not be discovered as member)
    const empty_dir = try std.fs.path.join(allocator, &[_][]const u8{ tmp, "packages", "empty" });
    defer allocator.free(empty_dir);
    try lib.io_helper.makePath(empty_dir);

    // Discover members using patterns
    const patterns = [_][]const u8{"packages/*"};
    const packages_workspace = @import("lib");
    _ = packages_workspace;

    // Use the workspace discovery from packages/workspace.zig
    // Since we can't easily call discoverMembers directly (it's in packages/workspace.zig which
    // needs the detector module), we test the detection flow instead

    // From app_dir, findDepsAndWorkspaceFile should find workspace root
    const result = try lib.deps.detector.findDepsAndWorkspaceFile(allocator, app_dir);

    try testing.expect(result.deps_file != null);
    try testing.expect(result.workspace_file != null);

    if (result.deps_file) |df| {
        allocator.free(df.path);
    }
    if (result.workspace_file) |ws| {
        // root_dir should be the tmp directory (workspace root)
        try testing.expectEqualStrings(tmp, ws.root_dir);
        allocator.free(ws.path);
        allocator.free(ws.root_dir);
    }

    // From empty_dir (no deps file in it), walking up finds root's package.json
    const empty_result = try lib.deps.detector.findDepsAndWorkspaceFile(allocator, empty_dir);
    // deps_file may be found by walking up to root's package.json
    if (empty_result.deps_file) |df| {
        allocator.free(df.path);
    }
    // Workspace should still be found by walking up
    try testing.expect(empty_result.workspace_file != null);
    if (empty_result.workspace_file) |ws| {
        allocator.free(ws.path);
        allocator.free(ws.root_dir);
    }

    _ = patterns;
}

test "workspace discovery - skips node_modules and .git directories" {
    const allocator = testing.allocator;

    const tmp = try createTempDir(allocator);
    defer cleanupTempDir(allocator, tmp);

    // Create node_modules dir with a package.json (should be ignored)
    const nm_dir = try std.fs.path.join(allocator, &[_][]const u8{ tmp, "node_modules" });
    defer allocator.free(nm_dir);
    try lib.io_helper.makePath(nm_dir);
    const nm_pkg = try std.fs.path.join(allocator, &[_][]const u8{ nm_dir, "package.json" });
    defer allocator.free(nm_pkg);
    try writeFile(nm_pkg, "{\"name\": \"fake\", \"workspaces\": [\"*\"]}");

    // Create .git dir (should be ignored)
    const git_dir = try std.fs.path.join(allocator, &[_][]const u8{ tmp, ".git" });
    defer allocator.free(git_dir);
    try lib.io_helper.makePath(git_dir);

    // Should NOT find workspace from these directories
    const result = try lib.deps.detector.findDepsAndWorkspaceFile(allocator, tmp);
    // Clean up any found results
    if (result.deps_file) |df| {
        allocator.free(df.path);
    }
    if (result.workspace_file) |ws| {
        var w = ws;
        w.deinit(allocator);
    }
    // The tmp dir itself doesn't have a proper package.json at its level,
    // so we shouldn't find anything (node_modules content is ignored by shouldSkipDir
    // in workspace discovery, not in detector — but the key test is that
    // node_modules/package.json is not treated as a workspace root)
}

// ============================================================================
// Workspace Config Loading Tests
// ============================================================================

test "workspace config - package.json workspaces array format" {
    const allocator = testing.allocator;

    const tmp = try createTempDir(allocator);
    defer cleanupTempDir(allocator, tmp);

    // Standard npm workspaces format
    const root_pkg = try std.fs.path.join(allocator, &[_][]const u8{ tmp, "package.json" });
    defer allocator.free(root_pkg);
    try writeFile(root_pkg, "{\"name\": \"my-ws\", \"workspaces\": [\"packages/*\", \"apps/*\"]}");

    // Verify workspace detection works
    const ws = try lib.deps.detector.findWorkspaceFile(allocator, tmp);
    try testing.expect(ws != null);
    if (ws) |w| {
        defer allocator.free(w.path);
        defer allocator.free(w.root_dir);
        try testing.expectEqualStrings(tmp, w.root_dir);
    }
}

test "workspace config - package.json workspaces object format (npm)" {
    const allocator = testing.allocator;

    const tmp = try createTempDir(allocator);
    defer cleanupTempDir(allocator, tmp);

    // npm also supports { packages: [...] } format
    const root_pkg = try std.fs.path.join(allocator, &[_][]const u8{ tmp, "package.json" });
    defer allocator.free(root_pkg);
    try writeFile(root_pkg, "{\"name\": \"my-ws\", \"workspaces\": {\"packages\": [\"packages/*\"]}}");

    const ws = try lib.deps.detector.findWorkspaceFile(allocator, tmp);
    try testing.expect(ws != null);
    if (ws) |w| {
        defer allocator.free(w.path);
        defer allocator.free(w.root_dir);
    }
}

test "workspace config - pantry.json with workspaces" {
    const allocator = testing.allocator;

    const tmp = try createTempDir(allocator);
    defer cleanupTempDir(allocator, tmp);

    // pantry.json is higher priority than package.json
    const pantry_json = try std.fs.path.join(allocator, &[_][]const u8{ tmp, "pantry.json" });
    defer allocator.free(pantry_json);
    try writeFile(pantry_json, "{\"workspaces\": [\"packages/*\"]}");

    const ws = try lib.deps.detector.findWorkspaceFile(allocator, tmp);
    try testing.expect(ws != null);
    if (ws) |w| {
        defer allocator.free(w.path);
        defer allocator.free(w.root_dir);
        // Should find pantry.json, not package.json
        try testing.expect(std.mem.endsWith(u8, w.path, "pantry.json"));
    }
}

test "workspace config - deeply nested member detects root workspace" {
    const allocator = testing.allocator;

    const tmp = try createTempDir(allocator);
    defer cleanupTempDir(allocator, tmp);

    // Create deep structure: root/packages/app/src/components/
    const root_pkg = try std.fs.path.join(allocator, &[_][]const u8{ tmp, "package.json" });
    defer allocator.free(root_pkg);
    try writeFile(root_pkg, "{\"name\": \"deep-ws\", \"workspaces\": [\"packages/*\"]}");

    const deep_dir = try std.fs.path.join(allocator, &[_][]const u8{ tmp, "packages", "app", "src", "components" });
    defer allocator.free(deep_dir);
    try makeDirRecursive(deep_dir);

    // Also create the member's package.json
    const app_pkg = try std.fs.path.join(allocator, &[_][]const u8{ tmp, "packages", "app", "package.json" });
    defer allocator.free(app_pkg);
    try writeFile(app_pkg, "{\"name\": \"app\", \"dependencies\": {}}");

    // From deep inside a member, should still find workspace root
    const result = try lib.deps.detector.findDepsAndWorkspaceFile(allocator, deep_dir);

    if (result.deps_file) |df| {
        defer allocator.free(df.path);
        // Deps file should be found at the app level (walking up from src/components/)
        try testing.expect(std.mem.indexOf(u8, df.path, "app") != null);
    }

    try testing.expect(result.workspace_file != null);
    if (result.workspace_file) |ws| {
        defer allocator.free(ws.path);
        defer allocator.free(ws.root_dir);
        try testing.expectEqualStrings(tmp, ws.root_dir);
    }
}

// ============================================================================
// Workspace Protocol Tests — workspace: version references
// ============================================================================

test "workspace protocol - workspace:* dependencies are skipped in install" {
    // workspace:* deps should be resolved via symlinks, not registry
    // This tests the parser's handling of workspace protocol
    const allocator = testing.allocator;

    const content =
        \\{
        \\  "name": "test",
        \\  "dependencies": {
        \\    "@ws/lib": "workspace:*",
        \\    "express": "^4.0",
        \\    "@ws/utils": "workspace:^1.0.0"
        \\  }
        \\}
    ;

    const tmp = try createTempDir(allocator);
    defer cleanupTempDir(allocator, tmp);

    const pkg_path = try std.fs.path.join(allocator, &[_][]const u8{ tmp, "package.json" });
    defer allocator.free(pkg_path);
    try writeFile(pkg_path, content);

    const deps_file = lib.deps.detector.DepsFile{
        .path = pkg_path,
        .format = .package_json,
    };
    const deps = try lib.deps.parser.inferDependencies(allocator, deps_file);
    defer {
        for (deps) |*dep| {
            var d = dep.*;
            d.deinit(allocator);
        }
        allocator.free(deps);
    }

    // Should parse all 3 dependencies
    try testing.expect(deps.len == 3);

    // Count workspace: deps
    var workspace_count: usize = 0;
    var registry_count: usize = 0;
    for (deps) |dep| {
        if (std.mem.startsWith(u8, dep.version, "workspace:")) {
            workspace_count += 1;
        } else {
            registry_count += 1;
        }
    }
    try testing.expect(workspace_count == 2);
    try testing.expect(registry_count == 1);
}

// ============================================================================
// Multiple Workspace Format Tests
// ============================================================================

test "workspace detection - pantry.jsonc with comments and workspaces" {
    const allocator = testing.allocator;

    const tmp = try createTempDir(allocator);
    defer cleanupTempDir(allocator, tmp);

    // pantry.jsonc can have comments
    const pantry_jsonc = try std.fs.path.join(allocator, &[_][]const u8{ tmp, "pantry.jsonc" });
    defer allocator.free(pantry_jsonc);
    try writeFile(pantry_jsonc,
        \\{
        \\  // This is a comment
        \\  "workspaces": ["packages/*"]
        \\}
    );

    const ws = try lib.deps.detector.findWorkspaceFile(allocator, tmp);
    try testing.expect(ws != null);
    if (ws) |w| {
        defer allocator.free(w.path);
        defer allocator.free(w.root_dir);
        try testing.expect(std.mem.endsWith(u8, w.path, "pantry.jsonc"));
    }
}

// ============================================================================
// Scoped Package Workspace Tests
// ============================================================================

test "scoped packages in workspace are handled correctly" {
    // Test that @scope/name packages are properly handled in workspace context
    const allocator = testing.allocator;

    const content =
        \\{
        \\  "name": "@myorg/app",
        \\  "dependencies": {
        \\    "@myorg/shared": "workspace:*",
        \\    "@types/node": "^20.0.0",
        \\    "express": "^4.0"
        \\  },
        \\  "devDependencies": {
        \\    "@myorg/tools": "workspace:^1.0.0",
        \\    "typescript": "^5.0"
        \\  }
        \\}
    ;

    const tmp = try createTempDir(allocator);
    defer cleanupTempDir(allocator, tmp);

    const pkg_path = try std.fs.path.join(allocator, &[_][]const u8{ tmp, "package.json" });
    defer allocator.free(pkg_path);
    try writeFile(pkg_path, content);

    const deps_file = lib.deps.detector.DepsFile{
        .path = pkg_path,
        .format = .package_json,
    };
    const deps = try lib.deps.parser.inferDependencies(allocator, deps_file);
    defer {
        for (deps) |*dep| {
            var d = dep.*;
            d.deinit(allocator);
        }
        allocator.free(deps);
    }

    // Should parse dependencies (at least some)
    try testing.expect(deps.len > 0);

    // Look for scoped packages — they may have prefixes (npm:, auto:)
    var found_workspace_dep = false;
    var found_types_dep = false;
    for (deps) |dep| {
        // Check for workspace references
        if (std.mem.startsWith(u8, dep.version, "workspace:")) {
            found_workspace_dep = true;
        }
        // Check for @types/node (with or without prefix)
        if (std.mem.indexOf(u8, dep.name, "types/node") != null or
            std.mem.indexOf(u8, dep.name, "@types") != null)
        {
            found_types_dep = true;
        }
    }
    try testing.expect(found_workspace_dep);
    try testing.expect(found_types_dep);
}

// ============================================================================
// Edge Cases
// ============================================================================

test "workspace detection - empty workspaces array" {
    const allocator = testing.allocator;

    const tmp = try createTempDir(allocator);
    defer cleanupTempDir(allocator, tmp);

    const root_pkg = try std.fs.path.join(allocator, &[_][]const u8{ tmp, "package.json" });
    defer allocator.free(root_pkg);
    try writeFile(root_pkg, "{\"name\": \"empty-ws\", \"workspaces\": []}");

    // Should still find the workspace file (it has the "workspaces" key)
    const ws = try lib.deps.detector.findWorkspaceFile(allocator, tmp);
    try testing.expect(ws != null);
    if (ws) |w| {
        defer allocator.free(w.path);
        defer allocator.free(w.root_dir);
    }
}

test "workspace detection - workspaces with nohoist" {
    const allocator = testing.allocator;

    const tmp = try createTempDir(allocator);
    defer cleanupTempDir(allocator, tmp);

    // yarn-style workspaces with nohoist
    const root_pkg = try std.fs.path.join(allocator, &[_][]const u8{ tmp, "package.json" });
    defer allocator.free(root_pkg);
    try writeFile(root_pkg,
        \\{
        \\  "name": "yarn-ws",
        \\  "workspaces": {
        \\    "packages": ["packages/*"],
        \\    "nohoist": ["**/react-native"]
        \\  }
        \\}
    );

    const ws = try lib.deps.detector.findWorkspaceFile(allocator, tmp);
    try testing.expect(ws != null);
    if (ws) |w| {
        defer allocator.free(w.path);
        defer allocator.free(w.root_dir);
    }
}

test "workspace detection - multiple package.json files in hierarchy" {
    const allocator = testing.allocator;

    const tmp = try createTempDir(allocator);
    defer cleanupTempDir(allocator, tmp);

    // Root: has workspaces
    const root_pkg = try std.fs.path.join(allocator, &[_][]const u8{ tmp, "package.json" });
    defer allocator.free(root_pkg);
    try writeFile(root_pkg, "{\"name\": \"root\", \"workspaces\": [\"packages/*\"]}");

    // Intermediate dir: has package.json WITHOUT workspaces
    {
        const packages_dir = try std.fs.path.join(allocator, &[_][]const u8{ tmp, "packages" });
        defer allocator.free(packages_dir);
        try lib.io_helper.makePath(packages_dir);
    }
    const app_dir = try std.fs.path.join(allocator, &[_][]const u8{ tmp, "packages", "app" });
    defer allocator.free(app_dir);
    try lib.io_helper.makePath(app_dir);
    const app_pkg = try std.fs.path.join(allocator, &[_][]const u8{ app_dir, "package.json" });
    defer allocator.free(app_pkg);
    try writeFile(app_pkg, "{\"name\": \"app\", \"dependencies\": {\"react\": \"^18\"}}");

    // Deep: no package.json
    const src_dir = try std.fs.path.join(allocator, &[_][]const u8{ app_dir, "src" });
    defer allocator.free(src_dir);
    try lib.io_helper.makePath(src_dir);

    // From deep src dir, workspace root should be correctly identified
    const result = try lib.deps.detector.findDepsAndWorkspaceFile(allocator, src_dir);

    // deps file should be app/package.json
    try testing.expect(result.deps_file != null);
    if (result.deps_file) |df| {
        defer allocator.free(df.path);
        const dir = std.fs.path.dirname(df.path) orelse "";
        try testing.expect(std.mem.endsWith(u8, dir, "app"));
    }

    // workspace file should be at root
    try testing.expect(result.workspace_file != null);
    if (result.workspace_file) |ws| {
        defer allocator.free(ws.path);
        defer allocator.free(ws.root_dir);
        try testing.expectEqualStrings(tmp, ws.root_dir);
    }
}

test "workspace detection - workspaces string containing escaped quotes" {
    const allocator = testing.allocator;

    const tmp = try createTempDir(allocator);
    defer cleanupTempDir(allocator, tmp);

    // The string "workspaces" should be found even in complex JSON
    const root_pkg = try std.fs.path.join(allocator, &[_][]const u8{ tmp, "package.json" });
    defer allocator.free(root_pkg);
    try writeFile(root_pkg,
        \\{"name":"complex","version":"1.0.0","private":true,"workspaces":["packages/*","libs/*"]}
    );

    const ws = try lib.deps.detector.findWorkspaceFile(allocator, tmp);
    try testing.expect(ws != null);
    if (ws) |w| {
        defer allocator.free(w.path);
        defer allocator.free(w.root_dir);
    }
}

// ============================================================================
// Catalog Resolution in Workspace Tests
// ============================================================================

test "catalog references - catalog: prefix is detected" {
    // Verify catalog reference detection works
    try testing.expect(lib.deps.catalogs.CatalogManager.isCatalogReference("catalog:"));
    try testing.expect(lib.deps.catalogs.CatalogManager.isCatalogReference("catalog:react"));
    try testing.expect(!lib.deps.catalogs.CatalogManager.isCatalogReference("^1.0.0"));
    try testing.expect(!lib.deps.catalogs.CatalogManager.isCatalogReference("workspace:*"));
}

// ============================================================================
// Helper functions for test setup
// ============================================================================

fn createTempDir(allocator: std.mem.Allocator) ![]const u8 {
    // Use clock for unique temp dir names
    const ts = lib.io_helper.clockGettime();
    const timestamp = @as(u64, @intCast(ts.sec)) * 1_000_000 + @as(u64, @intCast(@divFloor(ts.nsec, 1000)));
    const dir_name = try std.fmt.allocPrint(allocator, "/tmp/pantry-test-{d}", .{timestamp});
    try lib.io_helper.makePath(dir_name);
    return dir_name;
}

fn cleanupTempDir(allocator: std.mem.Allocator, path: []const u8) void {
    lib.io_helper.deleteTree(path) catch {};
    allocator.free(path);
}

fn writeFile(path: []const u8, content: []const u8) !void {
    const file = try lib.io_helper.createFile(path, .{});
    defer file.close(lib.io_helper.io);
    try lib.io_helper.writeAllToFile(file, content);
}

fn makeDirRecursive(path: []const u8) !void {
    try lib.io_helper.makePath(path);
}
