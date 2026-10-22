const std = @import("std");

fn buildRootPathExists(b: *std.Build, sub_path: []const u8) bool {
    dependOnBuildRootPathExistence(b, sub_path);
    if (std.fs.path.isAbsolute(sub_path)) {
        if (@hasField(std.Build.Graph, "io")) {
            std.Io.Dir.cwd().access(b.graph.io, sub_path, .{}) catch return false;
        } else {
            std.fs.cwd().access(sub_path, .{}) catch return false;
        }
        return true;
    }
    if (@hasField(std.Build, "root")) {
        const path = b.root.join(b.allocator, sub_path) catch return false;
        path.root_dir.handle.access(b.graph.io, path.sub_path, .{}) catch return false;
        return true;
    }

    if (@hasField(std.Build.Graph, "io")) {
        b.build_root.handle.access(b.graph.io, sub_path, .{}) catch return false;
        return true;
    }

    b.build_root.handle.access(sub_path, .{}) catch return false;
    return true;
}

fn buildInputPath(b: *std.Build, sub_path: []const u8) std.Build.LazyPath {
    if (!std.fs.path.isAbsolute(sub_path)) return b.path(sub_path);
    if (@hasDecl(std.Build.Graph, "cwdRelativePath")) return b.graph.cwdRelativePath(sub_path);
    return .{ .cwd_relative = sub_path };
}

fn readBuildRootFileAlloc(b: *std.Build, sub_path: []const u8, max_bytes: usize) ![]u8 {
    dependOnBuildRootPathExistence(b, sub_path);
    if (std.fs.path.isAbsolute(sub_path)) {
        if (@hasField(std.Build.Graph, "io")) {
            return trackBuildRootFileContents(b, sub_path, try std.Io.Dir.cwd().readFileAlloc(b.graph.io, sub_path, b.allocator, .limited(max_bytes)));
        }
        return trackBuildRootFileContents(b, sub_path, try std.fs.cwd().readFileAlloc(b.allocator, sub_path, max_bytes));
    }
    if (@hasField(std.Build, "root")) {
        const path = try b.root.join(b.allocator, sub_path);
        return trackBuildRootFileContents(b, sub_path, try path.root_dir.handle.readFileAlloc(b.graph.io, path.sub_path, b.allocator, .limited(max_bytes)));
    }

    if (@hasField(std.Build.Graph, "io")) {
        return trackBuildRootFileContents(b, sub_path, try b.build_root.handle.readFileAlloc(b.graph.io, sub_path, b.allocator, .limited(max_bytes)));
    }

    return trackBuildRootFileContents(b, sub_path, try b.build_root.handle.readFileAlloc(b.allocator, sub_path, max_bytes));
}

fn trackBuildRootFileContents(b: *std.Build, sub_path: []const u8, contents: []u8) []u8 {
    if (@hasDecl(std.Build, "dependOnFileContents")) b.dependOnFileContents(buildInputPath(b, sub_path));
    return contents;
}

fn dependOnBuildRootPathExistence(b: *std.Build, sub_path: []const u8) void {
    if (comptime !@hasDecl(std.Build, "dependOnDirectoryContents")) return;
    // Missing files cannot be content inputs. Observe the closest existing
    // parent directory so creation/removal (including Git packed refs) still
    // invalidates configuration, while successful reads track file contents.
    var parent = std.fs.path.dirname(sub_path) orelse ".";
    while (true) {
        if (buildRootDirectoryExists(b, parent)) {
            b.dependOnDirectoryContents(buildInputPath(b, parent));
            return;
        }
        parent = std.fs.path.dirname(parent) orelse return;
    }
}

fn buildRootDirectoryExists(b: *std.Build, sub_path: []const u8) bool {
    if (std.fs.path.isAbsolute(sub_path)) {
        if (@hasField(std.Build.Graph, "io")) {
            var directory = std.Io.Dir.cwd().openDir(b.graph.io, sub_path, .{}) catch return false;
            directory.close(b.graph.io);
        } else {
            var directory = std.fs.cwd().openDir(sub_path, .{}) catch return false;
            directory.close();
        }
        return true;
    }
    if (@hasField(std.Build, "root")) {
        const path = b.root.join(b.allocator, sub_path) catch return false;
        var directory = path.root_dir.handle.openDir(b.graph.io, path.sub_path, .{}) catch return false;
        directory.close(b.graph.io);
        return true;
    }
    if (@hasField(std.Build.Graph, "io")) {
        var directory = b.build_root.handle.openDir(b.graph.io, sub_path, .{}) catch return false;
        directory.close(b.graph.io);
        return true;
    }
    var directory = b.build_root.handle.openDir(sub_path, .{}) catch return false;
    directory.close();
    return true;
}

/// Resolve dependency path - uses workspace root pantry/ directory (created by `pantry install`)
/// For local dev: `pantry install` symlinks from ~/Code/Libraries/*
/// For CI: workflow clones deps into pantry/ at workspace root
fn resolveDependencyPath(b: *std.Build, package_name: []const u8, entry_point: []const u8, fallback_path: []const u8) []const u8 {
    // pantry/ folder is at the workspace root (../../ from packages/zig/)
    const primary = b.fmt("../../pantry/{s}/{s}", .{ package_name, entry_point });
    // Try primary path first, fall back to fallback
    const primary_exists = buildRootPathExists(b, primary);
    if (primary_exists) {
        return primary;
    }
    // Try fallback path
    const fallback_exists = buildRootPathExists(b, fallback_path);
    if (fallback_exists) {
        return fallback_path;
    }
    // Neither exists. Returning the missing path here "fails at compile time"
    // as the old comment claimed, but it fails as
    //
    //   error: failed to check cache: .../zig-cli/src/root.zig file_hash FileNotFound
    //
    // which names a cache and not the missing dependency, buried under a
    // hundred lines of build graph. The warning above it scrolls past unread.
    // Stop at the actual problem and say what to do about it.
    std.debug.panic(
        "dependency '{s}' not found at '{s}' or '{s}'.\n" ++
            "Run 'pantry install' in the repository root first - build.zig resolves " ++
            "these from the gitignored pantry/ directory, so a fresh checkout or a " ++
            "CI job that skipped the workspace install will not have them.\n",
        .{ package_name, primary, fallback_path },
    );
}

pub fn build(b: *std.Build) void {
    const target = b.standardTargetOptions(.{});
    // Default local builds to ReleaseFast: startup time dominates the
    // shell-integration path, and the strip default below keys off this.
    // NOTE: standardOptimizeOption(.{ .preferred_optimize_mode = ... }) is
    // avoided on purpose — on zig 0.17 it drops the -Doptimize flag entirely
    // and silently falls back to Debug unless --release is passed, which also
    // broke scripts that pass -Doptimize=Debug (e.g. scripts/coverage.sh).
    const optimize = b.option(std.builtin.OptimizeMode, "optimize", "Optimization mode (default: ReleaseFast)") orelse std.builtin.OptimizeMode.ReleaseFast;

    // Option to strip debug symbols for smaller binaries
    // Strip debug symbols by default in release builds: it cut `pantry`'s
    // process startup ~5x (≈26ms → ≈5ms), which directly speeds up the
    // `shell:lookup` fired on every cold `cd`. Debug/ReleaseSafe keep symbols
    // for backtraces; override either way with `-Dstrip=true|false`.
    const strip = b.option(bool, "strip", "Strip debug symbols") orelse
        (optimize == std.builtin.OptimizeMode.ReleaseFast or optimize == std.builtin.OptimizeMode.ReleaseSmall);

    // Single-threaded mode for smaller binary (optional, off by default)
    const single_threaded = b.option(bool, "single-threaded", "Build in single-threaded mode for smaller binary") orelse false;

    // Get version from package.json
    const version = getPackageVersion(b) catch "0.1.0";

    // Get git commit hash (short)
    const commit_hash = getGitCommitHash(b) catch "unknown";

    // Create version options
    const version_options = b.addOptions();
    version_options.addOption([]const u8, "version", version);
    version_options.addOption([]const u8, "commit_hash", commit_hash);

    // zig-config: import source directly to avoid cross-compilation issues
    // with the dependency's build.zig (which has .link_libc = true)
    const zig_config_mod = b.createModule(.{
        .root_source_file = b.path("../../pantry/zig-config/src/zig-config.zig"),
    });

    // Resolve zig-cli path
    const cli_path = resolveDependencyPath(
        b,
        "zig-cli",
        "src/root.zig",
        "../../../zig-cli/src/root.zig",
    );

    // Add zig-cli module (from external repository)
    const cli_mod = b.addModule("zig-cli", .{
        .root_source_file = b.path(cli_path),
        .target = target,
    });

    // Resolve zig-test-framework path
    const test_framework_path = resolveDependencyPath(
        b,
        "zig-test-framework",
        "src/lib.zig",
        "../../../zig-test-framework/src/lib.zig",
    );

    // Add zig-test-framework module
    const test_framework_mod = b.addModule("zig-test-framework", .{
        .root_source_file = b.path(test_framework_path),
        .target = target,
    });

    // Create the library module
    const lib_mod = b.addModule("pantry", .{
        .root_source_file = b.path("src/lib.zig"),
        .target = target,
        .link_libc = true,
    });

    // Add zig-config as an import to the library
    lib_mod.addImport("zig_config", zig_config_mod);

    // Add version options module
    const version_mod = version_options.createModule();
    lib_mod.addImport("version", version_mod);

    // Executable
    const exe = b.addExecutable(.{
        .name = "pantry",
        .root_module = b.createModule(.{
            .root_source_file = b.path("src/main.zig"),
            .target = target,
            .optimize = optimize,
            .imports = &.{
                .{ .name = "lib", .module = lib_mod },
                .{ .name = "zig-cli", .module = cli_mod },
                .{ .name = "version", .module = version_mod },
            },
            .strip = strip,
            .single_threaded = single_threaded,
        }),
    });
    b.installArtifact(exe);

    // Package executor aliases (like npx/bunx) - symlinks to pantry binary
    inline for (.{ "panx", "pnx", "launchpad" }) |alias_name| {
        const symlink_step = b.addInstallBinFile(exe.getEmittedBin(), alias_name);
        b.getInstallStep().dependOn(&symlink_step.step);
    }

    // Run command
    const run_step = b.step("run", "Run the app");
    const run_cmd = b.addRunArtifact(exe);
    run_step.dependOn(&run_cmd.step);
    run_cmd.step.dependOn(b.getInstallStep());

    if (@hasField(std.Build, "args")) {
        if (b.args) |args| {
            run_cmd.addArgs(args);
        }
    }

    // Tests for library module
    const lib_test_mod = b.createModule(.{
        .root_source_file = b.path("src/lib.zig"),
        .target = target,
        .optimize = optimize,
        .link_libc = true,
        .imports = &.{
            .{ .name = "zig_config", .module = zig_config_mod },
            .{ .name = "zig-test-framework", .module = test_framework_mod },
            .{ .name = "version", .module = version_mod },
        },
    });
    const lib_tests = b.addTest(.{
        .root_module = lib_test_mod,
    });
    const run_lib_tests = b.addRunArtifact(lib_tests);

    // Tests for core functionality
    const core_test_mod = b.createModule(.{
        .root_source_file = b.path("test/core_test.zig"),
        .target = target,
        .optimize = optimize,
        .link_libc = true,
        .imports = &.{
            .{ .name = "lib", .module = lib_mod },
            .{ .name = "zig-test-framework", .module = test_framework_mod },
        },
    });
    const core_tests = b.addTest(.{
        .root_module = core_test_mod,
    });
    const run_core_tests = b.addRunArtifact(core_tests);

    // Integration tests
    const integration_test_mod = b.createModule(.{
        .root_source_file = b.path("test/integration_test.zig"),
        .target = target,
        .optimize = optimize,
        .link_libc = true,
        .imports = &.{
            .{ .name = "lib", .module = lib_mod },
            .{ .name = "zig-test-framework", .module = test_framework_mod },
        },
    });
    const integration_tests = b.addTest(.{
        .root_module = integration_test_mod,
    });
    const run_integration_tests = b.addRunArtifact(integration_tests);

    // Environment management tests
    const env_test_mod = b.createModule(.{
        .root_source_file = b.path("test/env_test.zig"),
        .target = target,
        .optimize = optimize,
        .link_libc = true,
        .imports = &.{
            .{ .name = "lib", .module = lib_mod },
            .{ .name = "zig-test-framework", .module = test_framework_mod },
        },
    });
    const env_tests = b.addTest(.{
        .root_module = env_test_mod,
    });
    const run_env_tests = b.addRunArtifact(env_tests);

    // Services tests
    const services_test_mod = b.createModule(.{
        .root_source_file = b.path("test/services_test.zig"),
        .target = target,
        .optimize = optimize,
        .link_libc = true,
        .imports = &.{
            .{ .name = "pantry", .module = lib_mod },
            .{ .name = "zig-test-framework", .module = test_framework_mod },
        },
    });
    const services_tests = b.addTest(.{
        .root_module = services_test_mod,
    });
    const run_services_tests = b.addRunArtifact(services_tests);

    // New comprehensive tests
    const string_test_mod = b.createModule(.{
        .root_source_file = b.path("test/string_test.zig"),
        .target = target,
        .optimize = optimize,
        .link_libc = true,
        .imports = &.{
            .{ .name = "lib", .module = lib_mod },
            .{ .name = "zig-test-framework", .module = test_framework_mod },
        },
    });
    const string_tests = b.addTest(.{
        .root_module = string_test_mod,
    });
    const run_string_tests = b.addRunArtifact(string_tests);

    const path_test_mod = b.createModule(.{
        .root_source_file = b.path("test/path_test.zig"),
        .target = target,
        .optimize = optimize,
        .link_libc = true,
        .imports = &.{
            .{ .name = "lib", .module = lib_mod },
            .{ .name = "zig-test-framework", .module = test_framework_mod },
        },
    });
    const path_tests = b.addTest(.{
        .root_module = path_test_mod,
    });
    const run_path_tests = b.addRunArtifact(path_tests);

    const platform_test_mod = b.createModule(.{
        .root_source_file = b.path("test/platform_test.zig"),
        .target = target,
        .optimize = optimize,
        .link_libc = true,
        .imports = &.{
            .{ .name = "lib", .module = lib_mod },
            .{ .name = "zig-test-framework", .module = test_framework_mod },
        },
    });
    const platform_tests = b.addTest(.{
        .root_module = platform_test_mod,
    });
    const run_platform_tests = b.addRunArtifact(platform_tests);

    const lockfile_test_mod = b.createModule(.{
        .root_source_file = b.path("test/lockfile_test.zig"),
        .target = target,
        .optimize = optimize,
        .link_libc = true,
        .imports = &.{
            .{ .name = "lib", .module = lib_mod },
            .{ .name = "zig-test-framework", .module = test_framework_mod },
        },
    });
    const lockfile_tests = b.addTest(.{
        .root_module = lockfile_test_mod,
    });
    const run_lockfile_tests = b.addRunArtifact(lockfile_tests);

    const config_comprehensive_test_mod = b.createModule(.{
        .root_source_file = b.path("test/config_comprehensive_test.zig"),
        .target = target,
        .optimize = optimize,
        .link_libc = true,
        .imports = &.{
            .{ .name = "lib", .module = lib_mod },
            .{ .name = "zig-test-framework", .module = test_framework_mod },
        },
    });
    const config_comprehensive_tests = b.addTest(.{
        .root_module = config_comprehensive_test_mod,
    });
    const run_config_comprehensive_tests = b.addRunArtifact(config_comprehensive_tests);

    // OIDC authentication tests
    const oidc_test_mod = b.createModule(.{
        .root_source_file = b.path("src/auth/oidc_test.zig"),
        .target = target,
        .optimize = optimize,
        .link_libc = true,
        .imports = &.{
            .{ .name = "lib", .module = lib_mod },
            .{ .name = "zig-test-framework", .module = test_framework_mod },
        },
    });
    const oidc_tests = b.addTest(.{
        .root_module = oidc_test_mod,
    });
    const run_oidc_tests = b.addRunArtifact(oidc_tests);

    // Publish commit tests (pkg-pr-new equivalent)
    const publish_commit_test_mod = b.createModule(.{
        .root_source_file = b.path("test/publish_commit_test.zig"),
        .target = target,
        .optimize = optimize,
        .link_libc = true,
        .imports = &.{
            .{ .name = "lib", .module = lib_mod },
            .{ .name = "zig-test-framework", .module = test_framework_mod },
        },
    });
    const publish_commit_tests = b.addTest(.{
        .root_module = publish_commit_test_mod,
    });
    const run_publish_commit_tests = b.addRunArtifact(publish_commit_tests);

    // Resolution tests (conflict resolution, peer deps, optional deps, lockfile)
    const resolution_test_mod = b.createModule(.{
        .root_source_file = b.path("test/resolution_test.zig"),
        .target = target,
        .optimize = optimize,
        .link_libc = true,
        .imports = &.{
            .{ .name = "lib", .module = lib_mod },
            .{ .name = "zig-test-framework", .module = test_framework_mod },
        },
    });
    const resolution_tests = b.addTest(.{
        .root_module = resolution_test_mod,
    });
    const run_resolution_tests = b.addRunArtifact(resolution_tests);

    // PM commands tests (pm subcommands, outdated, update, patch)
    const pm_commands_test_mod = b.createModule(.{
        .root_source_file = b.path("test/pm_commands_test.zig"),
        .target = target,
        .optimize = optimize,
        .link_libc = true,
        .imports = &.{
            .{ .name = "lib", .module = lib_mod },
            .{ .name = "zig-test-framework", .module = test_framework_mod },
        },
    });
    const pm_commands_tests = b.addTest(.{
        .root_module = pm_commands_test_mod,
    });
    const run_pm_commands_tests = b.addRunArtifact(pm_commands_tests);

    // Credential store tests (token set/get/scoping, file permissions).
    // Rooted inside src/ so the module can import the command file directly —
    // tests only run for files that are imported for their own sake.
    const token_test_mod = b.createModule(.{
        .root_source_file = b.path("src/test_token_root.zig"),
        .target = target,
        .optimize = optimize,
        .link_libc = true,
    });
    const token_tests = b.addTest(.{
        .root_module = token_test_mod,
    });
    const run_token_tests = b.addRunArtifact(token_tests);

    const install_test_mod = b.createModule(.{
        .root_source_file = b.path("src/test_install_root.zig"),
        .target = target,
        .optimize = optimize,
        .link_libc = true,
        .imports = &.{
            .{ .name = "zig_config", .module = zig_config_mod },
            .{ .name = "version", .module = version_mod },
        },
    });
    const run_install_tests = b.addRunArtifact(b.addTest(.{ .root_module = install_test_mod }));
    const materialization_test_step = b.step("test:materialization", "Run native install ownership and publication failure regressions");
    const focused_materialization_tests = b.addTest(.{ .root_module = lib_mod, .filters = &.{"native materialization:"} });
    materialization_test_step.dependOn(&b.addRunArtifact(focused_materialization_tests).step);
    const binary_platform_step = b.step("test:binary-platform", "Keep native registry URLs on the requested operating system");
    const binary_platform_tests = b.addTest(.{ .root_module = lib_mod, .filters = &.{"binary registry platform:"} });
    binary_platform_step.dependOn(&b.addRunArtifact(binary_platform_tests).step);
    const executable_test_step = b.step("test:executables", "Resolve native provider files through activation launchers");
    const executable_tests = b.addTest(.{ .root_module = lib_mod, .filters = &.{"executable resolution:"} });
    executable_test_step.dependOn(&b.addRunArtifact(executable_tests).step);

    // Registry endpoint tests (which registry a request goes to, and whether it
    // carries a credential). Rooted inside src/ for the same reason.
    const registry_test_mod = b.createModule(.{
        .root_source_file = b.path("src/test_registry_root.zig"),
        .target = target,
        .optimize = optimize,
        .link_libc = true,
    });
    const registry_tests = b.addTest(.{
        .root_module = registry_test_mod,
    });
    const run_registry_tests = b.addRunArtifact(registry_tests);

    // Registry version selection tests (placeholders, prereleases, ordering).
    // Rooted inside src/ for the same reason.
    const version_test_mod = b.createModule(.{
        .root_source_file = b.path("src/test_version_root.zig"),
        .target = target,
        .optimize = optimize,
        .link_libc = true,
    });
    const version_tests = b.addTest(.{
        .root_module = version_test_mod,
    });
    const run_version_tests = b.addRunArtifact(version_tests);

    // Workspace tests (detection, config loading, member discovery, install paths)
    const workspace_test_mod = b.createModule(.{
        .root_source_file = b.path("test/workspace_test.zig"),
        .target = target,
        .optimize = optimize,
        .link_libc = true,
        .imports = &.{
            .{ .name = "lib", .module = lib_mod },
            .{ .name = "zig-test-framework", .module = test_framework_mod },
        },
    });
    const workspace_tests = b.addTest(.{
        .root_module = workspace_test_mod,
    });
    const run_workspace_tests = b.addRunArtifact(workspace_tests);

    // Auto-link tests (discovery, batch resolution, config, edge cases)
    const auto_link_test_mod = b.createModule(.{
        .root_source_file = b.path("test/auto_link_test.zig"),
        .target = target,
        .optimize = optimize,
        .link_libc = true,
        .imports = &.{
            .{ .name = "lib", .module = lib_mod },
            .{ .name = "zig-test-framework", .module = test_framework_mod },
        },
    });
    const auto_link_tests = b.addTest(.{
        .root_module = auto_link_test_mod,
    });
    const run_auto_link_tests = b.addRunArtifact(auto_link_tests);

    // Relocatable tree tests (pantry-internal links survive the tree moving
    // or the path it was installed through disappearing)
    const relocatable_tree_test_mod = b.createModule(.{
        .root_source_file = b.path("test/relocatable_tree_test.zig"),
        .target = target,
        .optimize = optimize,
        .link_libc = true,
        .imports = &.{
            .{ .name = "lib", .module = lib_mod },
        },
    });
    const relocatable_tree_tests = b.addTest(.{
        .root_module = relocatable_tree_test_mod,
    });
    const run_relocatable_tree_tests = b.addRunArtifact(relocatable_tree_tests);

    // Shell integration benchmark
    const shell_bench_mod = b.createModule(.{
        .root_source_file = b.path("bench/shell_bench.zig"),
        .target = target,
        .optimize = std.builtin.OptimizeMode.ReleaseFast,
        .link_libc = true,
        .imports = &.{
            .{ .name = "lib", .module = lib_mod },
        },
    });
    const shell_bench = b.addExecutable(.{
        .name = "shell_bench",
        .root_module = shell_bench_mod,
    });
    const run_shell_bench = b.addRunArtifact(shell_bench);
    const shell_bench_step = b.step("bench:shell", "Run shell integration benchmarks");
    shell_bench_step.dependOn(&run_shell_bench.step);

    const test_step = b.step("test", "Run unit tests");
    test_step.dependOn(&run_lib_tests.step);
    test_step.dependOn(&run_core_tests.step);
    test_step.dependOn(&run_env_tests.step);
    test_step.dependOn(&run_services_tests.step);
    test_step.dependOn(&run_string_tests.step);
    test_step.dependOn(&run_path_tests.step);
    test_step.dependOn(&run_platform_tests.step);
    test_step.dependOn(&run_lockfile_tests.step);
    test_step.dependOn(&run_config_comprehensive_tests.step);
    test_step.dependOn(&run_oidc_tests.step);
    test_step.dependOn(&run_resolution_tests.step);
    test_step.dependOn(&run_publish_commit_tests.step);
    test_step.dependOn(&run_pm_commands_tests.step);
    test_step.dependOn(&run_token_tests.step);
    test_step.dependOn(&run_install_tests.step);
    test_step.dependOn(&run_registry_tests.step);
    test_step.dependOn(&run_version_tests.step);
    test_step.dependOn(&run_workspace_tests.step);
    test_step.dependOn(&run_auto_link_tests.step);
    test_step.dependOn(&run_relocatable_tree_tests.step);

    const auto_link_step = b.step("test:auto-link", "Run auto-link tests");

    const install_step = b.step("test:install", "Run process launch and combined workspace install tests");
    install_step.dependOn(&run_install_tests.step);
    auto_link_step.dependOn(&run_auto_link_tests.step);

    const relocatable_tree_step = b.step("test:relocatable", "Run relocatable pantry tree tests");
    relocatable_tree_step.dependOn(&run_relocatable_tree_tests.step);

    const services_step = b.step("test:services", "Run services tests");
    services_step.dependOn(&run_services_tests.step);

    const integration_step = b.step("test:integration", "Run integration tests");
    integration_step.dependOn(&run_integration_tests.step);

    const publish_commit_step = b.step("test:publish-commit", "Run publish commit tests");
    publish_commit_step.dependOn(&run_publish_commit_tests.step);

    const token_step = b.step("test:token", "Run credential store tests");
    token_step.dependOn(&run_token_tests.step);

    const registry_step = b.step("test:registry", "Run registry endpoint tests");
    registry_step.dependOn(&run_registry_tests.step);

    const pm_commands_step = b.step("test:pm", "Run PM commands tests");
    pm_commands_step.dependOn(&run_pm_commands_tests.step);

    const workspace_step = b.step("test:workspace", "Run workspace tests");
    workspace_step.dependOn(&run_workspace_tests.step);

    const test_all_step = b.step("test:all", "Run all tests");
    test_all_step.dependOn(&run_lib_tests.step);
    test_all_step.dependOn(&run_core_tests.step);
    test_all_step.dependOn(&run_integration_tests.step);
    test_all_step.dependOn(&run_env_tests.step);
    test_all_step.dependOn(&run_services_tests.step);
    test_all_step.dependOn(&run_string_tests.step);
    test_all_step.dependOn(&run_path_tests.step);
    test_all_step.dependOn(&run_platform_tests.step);
    test_all_step.dependOn(&run_lockfile_tests.step);
    test_all_step.dependOn(&run_config_comprehensive_tests.step);
    test_all_step.dependOn(&run_resolution_tests.step);
    test_all_step.dependOn(&run_publish_commit_tests.step);
    test_all_step.dependOn(&run_pm_commands_tests.step);
    test_all_step.dependOn(&run_token_tests.step);
    test_all_step.dependOn(&run_install_tests.step);
    test_all_step.dependOn(&run_auto_link_tests.step);
    test_all_step.dependOn(&run_relocatable_tree_tests.step);

    // Coverage report
    const coverage_cmd = b.addSystemCommand(&[_][]const u8{
        "bash",
        "scripts/coverage.sh",
    });
    const coverage_step = b.step("coverage", "Generate test coverage report");
    coverage_step.dependOn(&coverage_cmd.step);

    // Benchmarks
    const bench_mod = b.createModule(.{
        .root_source_file = b.path("bench/bench.zig"),
        .target = target,
        .optimize = std.builtin.OptimizeMode.ReleaseFast,
        .link_libc = true,
        .imports = &.{
            .{ .name = "lib", .module = lib_mod },
        },
    });
    const bench_exe = b.addExecutable(.{
        .name = "bench",
        .root_module = bench_mod,
    });

    const run_bench = b.addRunArtifact(bench_exe);
    const bench_step = b.step("bench", "Run benchmarks");
    bench_step.dependOn(&run_bench.step);

    // Cross-compilation targets
    const targets = [_]std.Target.Query{
        .{ .cpu_arch = .aarch64, .os_tag = .macos },
        .{ .cpu_arch = .x86_64, .os_tag = .macos },
        .{ .cpu_arch = .aarch64, .os_tag = .linux },
        .{ .cpu_arch = .x86_64, .os_tag = .linux },
        .{ .cpu_arch = .x86_64, .os_tag = .windows },
        .{ .cpu_arch = .x86_64, .os_tag = .freebsd },
        .{ .cpu_arch = .aarch64, .os_tag = .freebsd },
    };

    const compile_all_step = b.step("compile-all", "Compile for all platforms");

    for (targets) |t| {
        const resolved_target = b.resolveTargetQuery(t);

        // Use zig-config from build.zig.zon dependency (target-agnostic module)
        const cross_zig_config_mod = zig_config_mod;

        const cross_lib_mod = b.createModule(.{
            .root_source_file = b.path("src/lib.zig"),
            .target = resolved_target,
            .link_libc = true,
        });

        // Add zig-config to the cross-compiled library
        cross_lib_mod.addImport("zig_config", cross_zig_config_mod);

        // Add version options module to cross-compiled library
        cross_lib_mod.addImport("version", version_mod);

        const cross_exe = b.addExecutable(.{
            .name = "pantry",
            .root_module = b.createModule(.{
                .root_source_file = b.path("src/main.zig"),
                .target = resolved_target,
                .optimize = std.builtin.OptimizeMode.ReleaseFast,
                // Strip the distributed binaries: cuts process startup ~5x
                // (≈26ms → ≈5ms), which every `cd` pays via `shell:lookup`.
                .strip = true,
                .link_libc = true,
                .imports = &.{
                    .{ .name = "lib", .module = cross_lib_mod },
                    .{ .name = "zig-cli", .module = cli_mod },
                    .{ .name = "version", .module = version_mod },
                },
            }),
        });

        const target_name = b.fmt("{s}-{s}", .{ @tagName(t.os_tag.?), @tagName(t.cpu_arch.?) });

        const install = b.addInstallArtifact(cross_exe, .{
            .dest_dir = .{
                .override = .{
                    .custom = b.fmt("bin/{s}", .{target_name}),
                },
            },
        });

        // `zig build` hides its progress bar in a non-TTY (CI), so a plain
        // `compile-all` runs 5+ minutes with zero output. Print a line as each
        // target finishes — under the build's default parallelism these land as
        // real progress, so the log shows which platforms are done and which
        // are still cooking instead of dead air.
        const done = b.addSystemCommand(&.{ "echo", b.fmt("[compile-all] ✓ {s}", .{target_name}) });
        done.step.dependOn(&install.step);

        compile_all_step.dependOn(&done.step);
    }
}

/// Get package version from package.json
fn getPackageVersion(b: *std.Build) ![]const u8 {
    // The distributable CLI and TypeScript package share one release version.
    // The repository root is private and is not bumped by the package release
    // workflow, so it must not be used as the binary's version source.
    const content = readBuildRootFileAlloc(b, "../ts-pantry/package.json", 1024 * 1024) catch return "0.0.0";
    // Find "version": "x.y.z" (first occurrence)
    const needle = "\"version\"";
    const idx = std.mem.indexOf(u8, content, needle) orelse return "0.0.0";
    const after = content[idx + needle.len ..];
    // Skip colon and whitespace, then extract the quoted value
    var i: usize = 0;
    while (i < after.len and (after[i] == ' ' or after[i] == ':' or after[i] == '\t' or after[i] == '\n' or after[i] == '\r')) : (i += 1) {}
    if (i >= after.len or after[i] != '"') return "0.0.0";
    i += 1;
    const start = i;
    while (i < after.len and after[i] != '"') : (i += 1) {}
    return after[start..i];
}

/// Resolve both normal repositories and Git's linked-worktree marker file.
fn getGitDirectory(b: *std.Build, candidate: []const u8) !?[]const u8 {
    if (buildRootDirectoryExists(b, candidate)) return candidate;
    const marker = readBuildRootFileAlloc(b, candidate, 4096) catch return null;
    if (!std.mem.startsWith(u8, marker, "gitdir:")) return null;
    const target = std.mem.trim(u8, marker["gitdir:".len..], &std.ascii.whitespace);
    if (target.len == 0) return null;
    if (std.fs.path.isAbsolute(target)) return target;
    return try std.fs.path.join(b.allocator, &.{ std.fs.path.dirname(candidate) orelse ".", target });
}

/// Get git commit hash (short)
fn getGitCommitHash(b: *std.Build) ![]const u8 {
    // Resolve HEAD by reading .git directly instead of b.run("git rev-parse"):
    // Run-step results are cached in .zig-cache keyed by argv, so the commit
    // stamp silently went stale on incremental builds after new commits.
    //
    // readBuildRootFileAlloc registers every observed file as a configure
    // dependency, so incremental builds refresh the stamp after a commit too.
    const git_dir = (try getGitDirectory(b, "../../.git")) orelse
        (try getGitDirectory(b, ".git")) orelse return "unknown";
    const head_path = try std.fs.path.join(b.allocator, &.{ git_dir, "HEAD" });
    const head = readBuildRootFileAlloc(b, head_path, 512) catch return "unknown";
    const trimmed = std.mem.trim(u8, head, &std.ascii.whitespace);
    if (trimmed.len == 0) {
        return "unknown";
    }

    // Detached HEAD: the file already holds the commit hash.
    if (!std.mem.startsWith(u8, trimmed, "ref:")) {
        return if (trimmed.len >= 7) trimmed[0..@min(9, trimmed.len)] else "unknown";
    }

    // "ref: refs/heads/<branch>" — resolve the loose ref first.
    const ref = std.mem.trim(u8, trimmed["ref:".len..], &std.ascii.whitespace);
    const common_path = try std.fs.path.join(b.allocator, &.{ git_dir, "commondir" });
    const refs_dir = if (readBuildRootFileAlloc(b, common_path, 4096)) |content| blk: {
        const target = std.mem.trim(u8, content, &std.ascii.whitespace);
        if (target.len == 0) break :blk git_dir;
        break :blk if (std.fs.path.isAbsolute(target)) target else try std.fs.path.join(b.allocator, &.{ git_dir, target });
    } else |_| git_dir;
    const loose_path = try std.fs.path.join(b.allocator, &.{ refs_dir, ref });
    if (readBuildRootFileAlloc(b, loose_path, 512)) |content| {
        const hash = std.mem.trim(u8, content, &std.ascii.whitespace);
        if (hash.len >= 7) return hash[0..@min(9, hash.len)];
    } else |_| {}

    // Fresh clones and gc'd repos keep refs only in packed-refs.
    const packed_path = try std.fs.path.join(b.allocator, &.{ refs_dir, "packed-refs" });
    const packed_refs = readBuildRootFileAlloc(b, packed_path, 4 * 1024 * 1024) catch return "unknown";
    var lines = std.mem.splitScalar(u8, packed_refs, '\n');
    while (lines.next()) |line| {
        if (line.len == 0 or line[0] == '#' or line[0] == '^') continue;
        const sp = std.mem.indexOfScalar(u8, line, ' ') orelse continue;
        if (std.mem.eql(u8, std.mem.trim(u8, line[sp + 1 ..], &std.ascii.whitespace), ref)) {
            const hash = line[0..sp];
            if (hash.len >= 7) return hash[0..@min(9, hash.len)];
        }
    }
    return "unknown";
}
