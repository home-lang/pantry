const std = @import("std");

pub fn build(b: *std.Build) void {
    const target = b.standardTargetOptions(.{});
    const optimize = b.standardOptimizeOption(.{});

    // Create the library module
    const lib_mod = b.addModule("launchpad", .{
        .root_source_file = b.path("src/lib.zig"),
        .target = target,
    });

    // Executable
    const exe = b.addExecutable(.{
        .name = "launchpad",
        .root_module = b.createModule(.{
            .root_source_file = b.path("src/main.zig"),
            .target = target,
            .optimize = optimize,
            .imports = &.{
                .{ .name = "lib", .module = lib_mod },
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

    const test_step = b.step("test", "Run unit tests");
    test_step.dependOn(&run_lib_tests.step);
    test_step.dependOn(&run_core_tests.step);

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
    bench_step.dependOn(&run_bench.step);

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
        const cross_lib_mod = b.addModule("launchpad", .{
            .root_source_file = b.path("src/lib.zig"),
            .target = b.resolveTargetQuery(t),
        });

        const cross_exe = b.addExecutable(.{
            .name = "launchpad",
            .root_module = b.createModule(.{
                .root_source_file = b.path("src/main.zig"),
                .target = b.resolveTargetQuery(t),
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
