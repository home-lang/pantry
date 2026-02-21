const std = @import("std");

/// Resolve dependency path - uses workspace root pantry/ directory (created by `pantry install`)
/// For local dev: `pantry install` symlinks from ~/Code/Libraries/*
/// For CI: workflow clones deps into pantry/ at workspace root
fn resolveDependencyPath(b: *std.Build, package_name: []const u8, entry_point: []const u8, fallback_path: []const u8) []const u8 {
    _ = fallback_path;
    // pantry/ folder is at the workspace root (../../ from packages/zig/)
    return b.fmt("../../pantry/{s}/{s}", .{ package_name, entry_point });
}

pub fn build(b: *std.Build) void {
    const target = b.standardTargetOptions(.{});
    const optimize = b.standardOptimizeOption(.{ .preferred_optimize_mode = .ReleaseFast });

    // Option to strip debug symbols for smaller binaries
    const strip = b.option(bool, "strip", "Strip debug symbols") orelse false;

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

    // zig-config from build.zig.zon dependency (GitHub: zig-utils/zig-config)
    const zig_config_dep = b.dependency("zig_config", .{
        .target = target,
    });
    const zig_config_mod = zig_config_dep.module("zig-config");

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
    lib_mod.addImport("zig-config", zig_config_mod);

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

    // Run command
    const run_step = b.step("run", "Run the app");
    const run_cmd = b.addRunArtifact(exe);
    run_step.dependOn(&run_cmd.step);
    run_cmd.step.dependOn(b.getInstallStep());

    if (b.args) |args| {
        run_cmd.addArgs(args);
    }

    // Tests for library module
    const lib_test_mod = b.createModule(.{
        .root_source_file = b.path("src/lib.zig"),
        .target = target,
        .optimize = optimize,
        .link_libc = true,
        .imports = &.{
            .{ .name = "zig-config", .module = zig_config_mod },
            .{ .name = "zig-test-framework", .module = test_framework_mod },
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

    // Shell integration benchmark
    const shell_bench_mod = b.createModule(.{
        .root_source_file = b.path("bench/shell_bench.zig"),
        .target = target,
        .optimize = .ReleaseFast,
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

    const integration_step = b.step("test:integration", "Run integration tests");
    integration_step.dependOn(&run_integration_tests.step);

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
        .optimize = .ReleaseFast,
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

        // Use zig-config from build.zig.zon dependency for cross target
        const cross_zig_config_dep = b.dependency("zig_config", .{
            .target = resolved_target,
        });
        const cross_zig_config_mod = cross_zig_config_dep.module("zig-config");

        const cross_lib_mod = b.addModule("pantry", .{
            .root_source_file = b.path("src/lib.zig"),
            .target = resolved_target,
            .link_libc = true,
        });

        // Add zig-config to the cross-compiled library
        cross_lib_mod.addImport("zig-config", cross_zig_config_mod);

        // Add version options module to cross-compiled library
        cross_lib_mod.addImport("version", version_mod);

        const cross_exe = b.addExecutable(.{
            .name = "pantry",
            .root_module = b.createModule(.{
                .root_source_file = b.path("src/main.zig"),
                .target = resolved_target,
                .optimize = .ReleaseFast,
                .link_libc = true,
                .imports = &.{
                    .{ .name = "lib", .module = cross_lib_mod },
                    .{ .name = "zig-cli", .module = cli_mod },
                    .{ .name = "version", .module = version_mod },
                },
            }),
        });

        const install = b.addInstallArtifact(cross_exe, .{
            .dest_dir = .{
                .override = .{
                    .custom = b.fmt("bin/{s}-{s}", .{
                        @tagName(t.os_tag.?),
                        @tagName(t.cpu_arch.?),
                    }),
                },
            },
        });

        compile_all_step.dependOn(&install.step);
    }
}

/// Get package version from package.json
fn getPackageVersion(b: *std.Build) ![]const u8 {
    // Read version directly from root package.json (../../ from packages/zig/)
    const io = b.graph.io;
    const content = b.build_root.handle.readFileAlloc(io, "../../package.json", b.allocator, .limited(1024 * 1024)) catch return "0.0.0";
    // Find "version": "x.y.z" (first occurrence)
    const needle = "\"version\"";
    const idx = std.mem.indexOf(u8, content, needle) orelse return "0.0.0";
    const after = content[idx + needle.len..];
    // Skip colon and whitespace, then extract the quoted value
    var i: usize = 0;
    while (i < after.len and (after[i] == ' ' or after[i] == ':' or after[i] == '\t' or after[i] == '\n' or after[i] == '\r')) : (i += 1) {}
    if (i >= after.len or after[i] != '"') return "0.0.0";
    i += 1;
    const start = i;
    while (i < after.len and after[i] != '"') : (i += 1) {}
    return after[start..i];
}

/// Get git commit hash (short)
fn getGitCommitHash(b: *std.Build) ![]const u8 {
    const result = b.run(&.{ "git", "rev-parse", "--short", "HEAD" });
    // Trim whitespace/newline
    const trimmed = std.mem.trim(u8, result, &std.ascii.whitespace);
    if (trimmed.len > 0) {
        return b.allocator.dupe(u8, trimmed) catch return "unknown";
    }
    return "unknown";
}
