const std = @import("std");
const testing = std.testing;
const framework = @import("zig-test-framework");
const lib = @import("lib");

pub fn main() !void {
    var gpa = std.heap.GeneralPurposeAllocator(.{}){};
    defer _ = gpa.deinit();
    const allocator = gpa.allocator();

    // Initialize test registry
    var registry = framework.getRegistry(allocator);
    defer framework.cleanupRegistry();

    // Run tests with coverage
    const coverage_options = framework.CoverageOptions{
        .enabled = true,
        .tool = .kcov,
        .output_dir = "coverage",
        .include_patterns = &[_][]const u8{"src/**/*.zig"},
        .exclude_patterns = &[_][]const u8{
            "src/packages/generated.zig",
            "test/**/*.zig",
        },
    };

    const runner_options = framework.RunnerOptions{
        .allocator = allocator,
        .reporter_type = .spec,
        .parallel = true,
        .max_workers = 4,
        .fail_fast = false,
        .coverage = coverage_options,
    };

    const results = try framework.runTestsWithOptions(registry, runner_options);
    defer results.deinit(allocator);

    // Print coverage summary
    if (results.coverage) |coverage| {
        try framework.printCoverageSummary(allocator, coverage, std.io.getStdOut().writer());
    }

    // Exit with appropriate code
    if (results.failed > 0) {
        std.process.exit(1);
    }
}

test "pantry core functionality" {
    // This will be discovered and run by the framework
    const allocator = testing.allocator;

    framework.describe("Pantry Core", .{}, struct {
        pub fn setup() !void {
            framework.describe("String utilities", .{}, struct {
                pub fn testHashToHex() !void {
                    framework.it("should convert hash to hex string", .{}, struct {
                        pub fn run() !void {
                            const hash: [16]u8 = .{ 0xde, 0xad, 0xbe, 0xef, 0xca, 0xfe, 0xba, 0xbe, 0x12, 0x34, 0x56, 0x78, 0x9a, 0xbc, 0xde, 0xf0 };
                            const result = try lib.string.hashToHex(hash, testing.allocator);
                            defer testing.allocator.free(result);

                            try framework.expect(result).toEqual("deadbeefcafebabe123456789abcdef0");
                        }
                    }.run);
                }

                pub fn run() !void {
                    try testHashToHex();
                }
            }.run);
        }
    }.setup);
}
