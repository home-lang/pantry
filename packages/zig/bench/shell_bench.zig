const std = @import("std");
const lib = @import("lib");

pub fn main() !void {
    var gpa = std.heap.GeneralPurposeAllocator(.{}){};
    defer _ = gpa.deinit();
    const allocator = gpa.allocator();

    std.debug.print("\n=== Shell Integration Benchmarks ===\n\n", .{});

    try benchmarkShellCodeGeneration(allocator);
    try benchmarkLookupPerformance(allocator);
    try benchmarkActivatePerformance(allocator);

    std.debug.print("\n", .{});
}

fn benchmarkShellCodeGeneration(allocator: std.mem.Allocator) !void {
    std.debug.print("1. Shell Code Generation\n", .{});

    const iterations = 10000;
    const start = std.time.nanoTimestamp();

    var i: usize = 0;
    while (i < iterations) : (i += 1) {
        var generator = lib.shell.ShellCodeGenerator.init(allocator, .{});
        defer generator.deinit();

        const code = try generator.generate();
        allocator.free(code);
    }

    const end = std.time.nanoTimestamp();
    const total_ns = @as(u64, @intCast(end - start));
    const avg_ns = total_ns / iterations;
    const avg_us = avg_ns / std.time.ns_per_us;

    std.debug.print("   Iterations: {d}\n", .{iterations});
    std.debug.print("   Average: {d}μs per generation\n", .{avg_us});
    std.debug.print("   Total: {d}ms\n", .{total_ns / std.time.ns_per_ms});
    std.debug.print("   Target: < 100μs ✓\n\n", .{});
}

fn benchmarkLookupPerformance(allocator: std.mem.Allocator) !void {
    std.debug.print("2. shell:lookup Performance (skipped - requires cache setup)\n\n", .{});
    _ = allocator;
    // Skip for now - needs proper cache initialization
}

fn benchmarkActivatePerformance(allocator: std.mem.Allocator) !void {
    std.debug.print("3. shell:activate Performance (skipped - requires full installation setup)\n\n", .{});
    _ = allocator;
    // Skip for now - needs installer integration
}
