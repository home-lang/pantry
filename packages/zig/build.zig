const std = @import("std");

pub fn build(b: *std.Build) void {
    const target = b.standardTargetOptions(.{});
    const optimize = b.standardOptimizeOption(.{});

    // Add zonfig module (from external repository)
    const zonfig_mod = b.addModule("zonfig", .{
        .root_source_file = b.path("../../../zonfig/src/zonfig.zig"),
        .target = target,
    });

    // Add zig-cli module (from external repository)
    const cli_mod = b.addModule("pantry .{
        .root_source_file = b.path("../../../zig-cli/src/root.zig"),
        .target = target,
    });

    // Create the library module
    const lib_mod = b.addModule("launchpad", .{
        .root_source_file = b.path("src/lib.zig"),
        .target = target,
    });

    // Add zonfig as an import to the library
    lib_mod.addImport("zonfig", zonfig_mod);

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
            },
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
    const lib_tests = b.addTest(.{
        .root_module = lib_mod,
    });
    const run_lib_tests = b.addRunArtifact(lib_tests);

    // Tests for core functionality
    const core_test_mod = b.createModule(.{
        .root_source_file = b.path("test/core_test.zig"),
        .target = target,
        .optimize = optimize,
        .imports = &.{
            .{ .name = "lib", .module = lib_mod },
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
        .imports = &.{
            .{ .name = "lib", .module = lib_mod },
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
        .imports = &.{
            .{ .name = "lib", .module = lib_mod },
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
        .imports = &.{
            .{ .name = "pantry", .module = lib_mod },
        },
    });
    const services_tests = b.addTest(.{
        .root_module = services_test_mod,
    });
    const run_services_tests = b.addRunArtifact(services_tests);

    // Shell integration benchmark
    const shell_bench_mod = b.createModule(.{
        .root_source_file = b.path("bench/shell_bench.zig"),
        .target = target,
        .optimize = .ReleaseFast,
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

    const integration_step = b.step("test:integration", "Run integration tests");
    integration_step.dependOn(&run_integration_tests.step);

    const test_all_step = b.step("test:all", "Run all tests");
    test_all_step.dependOn(&run_lib_tests.step);
    test_all_step.dependOn(&run_core_tests.step);
    test_all_step.dependOn(&run_integration_tests.step);

    // Benchmarks
    const bench_mod = b.createModule(.{
        .root_source_file = b.path("bench/bench.zig"),
        .target = target,
        .optimize = .ReleaseFast,
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
    bench_step.dependOn(&run_bench.step);pantry

    // Cross-compilation targets
    const targets = [_]std.Target.Query{
        .{ .cpu_arch = .aarch64, .os_tag = .macos },
        .{ .cpu_arch = .x86_64, .os_tag = .macos },
        .{ .cpu_arch = .aarch64, .os_tag = .linux },
        .{ .cpu_arch = .x86_64, .os_tag = .linux },
        .{ .cpu_arch = .x86_64, .os_tag = .windows },
    };

    const compile_all_step = b.step("compile-all", "Compile for all platforms");

    for (targets) |t| {
        const resolved_target = b.resolveTargetQuery(t);

        // Create zonfig module for this target
        const cross_zonfig_mod = b.addModule("zonfig", .{
            .root_source_file = b.path("../../../zonfig/src/zonfig.zig"),
            .target = resolved_target,
        });

        const cross_lib_mod = b.addModule("launchpad", .{
            .root_source_file = b.path("src/lib.zig"),
            .target = resolved_target,
        });

        // Add zonfig to the cross-compiled library
        cross_lib_mod.addImport("zonfig", cross_zonfig_mod);

        const cross_exe = b.addExecutable(.{
            .name = "pantry",
            .root_module = b.createModule(.{
                .root_source_file = b.path("src/main.zig"),
                .target = resolved_target,
                .optimize = .ReleaseFast,
                .imports = &.{
                    .{ .name = "lib", .module = cross_lib_mod },
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
