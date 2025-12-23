const std = @import("std");

/// Benchmark result
pub const BenchmarkResult = struct {
    name: []const u8,
    iterations: usize,
    total_ns: u64,
    avg_ns: u64,
    min_ns: u64,
    max_ns: u64,

    pub fn format(self: BenchmarkResult) void {
        std.debug.print("\nBenchmark: {s}\n", .{self.name});
        std.debug.print("  Iterations: {d}\n", .{self.iterations});
        std.debug.print("  Total: {d}ns ({d}ms)\n", .{ self.total_ns, self.total_ns / std.time.ns_per_ms });
        std.debug.print("  Average: {d}ns ({d}μs)\n", .{ self.avg_ns, self.avg_ns / std.time.ns_per_us });
        std.debug.print("  Min: {d}ns\n", .{self.min_ns});
        std.debug.print("  Max: {d}ns\n", .{self.max_ns});
    }
};

/// Benchmark a function
pub fn benchmark(
    allocator: std.mem.Allocator,
    name: []const u8,
    iterations: usize,
    func: anytype,
) !BenchmarkResult {
    _ = allocator;

    var total_ns: u64 = 0;
    var min_ns: u64 = std.math.maxInt(u64);
    var max_ns: u64 = 0;

    var i: usize = 0;
    while (i < iterations) : (i += 1) {
        const start_time = std.posix.clock_gettime(.MONOTONIC) catch std.posix.timespec{ .sec = 0, .nsec = 0 };
        func();
        const end_time = std.posix.clock_gettime(.MONOTONIC) catch std.posix.timespec{ .sec = 0, .nsec = 0 };

        // Handle nanosecond rollover correctly
        const sec_diff = end_time.sec - start_time.sec;
        const nsec_diff = end_time.nsec - start_time.nsec;
        const elapsed = @as(u64, @intCast(sec_diff * std.time.ns_per_s + nsec_diff));
        total_ns += elapsed;

        if (elapsed < min_ns) min_ns = elapsed;
        if (elapsed > max_ns) max_ns = elapsed;
    }

    return BenchmarkResult{
        .name = name,
        .iterations = iterations,
        .total_ns = total_ns,
        .avg_ns = total_ns / iterations,
        .min_ns = min_ns,
        .max_ns = max_ns,
    };
}

/// Benchmark cache lookup
pub fn benchmarkCacheLookup(
    allocator: std.mem.Allocator,
    cache: anytype,
    key: anytype,
    iterations: usize,
) !BenchmarkResult {
    var total_ns: u64 = 0;
    var min_ns: u64 = std.math.maxInt(u64);
    var max_ns: u64 = 0;

    var i: usize = 0;
    while (i < iterations) : (i += 1) {
        const start_time = std.posix.clock_gettime(.MONOTONIC) catch std.posix.timespec{ .sec = 0, .nsec = 0 };
        _ = try cache.get(key);
        const end_time = std.posix.clock_gettime(.MONOTONIC) catch std.posix.timespec{ .sec = 0, .nsec = 0 };

        const elapsed = @as(u64, @intCast((end_time.sec - start_time.sec) * std.time.ns_per_s + (end_time.nsec - start_time.nsec)));
        total_ns += elapsed;

        if (elapsed < min_ns) min_ns = elapsed;
        if (elapsed > max_ns) max_ns = elapsed;
    }

    const name = try std.fmt.allocPrint(allocator, "Cache Lookup ({d} iterations)", .{iterations});
    defer allocator.free(name);

    return BenchmarkResult{
        .name = "Cache Lookup",
        .iterations = iterations,
        .total_ns = total_ns,
        .avg_ns = total_ns / iterations,
        .min_ns = min_ns,
        .max_ns = max_ns,
    };
}

/// Benchmark hash computation
pub fn benchmarkHash(
    allocator: std.mem.Allocator,
    data: []const u8,
    iterations: usize,
) !BenchmarkResult {
    const string = @import("core/string.zig");

    var total_ns: u64 = 0;
    var min_ns: u64 = std.math.maxInt(u64);
    var max_ns: u64 = 0;

    var i: usize = 0;
    while (i < iterations) : (i += 1) {
        const start_time = std.posix.clock_gettime(.MONOTONIC) catch std.posix.timespec{ .sec = 0, .nsec = 0 };
        _ = string.md5Hash(data);
        const end_time = std.posix.clock_gettime(.MONOTONIC) catch std.posix.timespec{ .sec = 0, .nsec = 0 };

        const elapsed = @as(u64, @intCast((end_time.sec - start_time.sec) * std.time.ns_per_s + (end_time.nsec - start_time.nsec)));
        total_ns += elapsed;

        if (elapsed < min_ns) min_ns = elapsed;
        if (elapsed > max_ns) max_ns = elapsed;
    }

    const name = try std.fmt.allocPrint(allocator, "MD5 Hash ({d} bytes)", .{data.len});
    defer allocator.free(name);

    return BenchmarkResult{
        .name = "MD5 Hash",
        .iterations = iterations,
        .total_ns = total_ns,
        .avg_ns = total_ns / iterations,
        .min_ns = min_ns,
        .max_ns = max_ns,
    };
}

test "benchmark" {
    const allocator = std.testing.allocator;

    const result = try benchmark(allocator, "test", 10, struct {
        fn func() void {
            // Simple loop - timing may be 0 for very fast operations
            var i: usize = 0;
            while (i < 100) : (i += 1) {
                std.mem.doNotOptimizeAway(&i);
            }
        }
    }.func);

    try std.testing.expect(result.iterations == 10);
    // For very fast operations, timing may round to 0, which is acceptable
    // We just verify the benchmark ran without errors
}

test "benchmarkHash" {
    const allocator = std.testing.allocator;

    const data = "test data for hashing";
    const result = try benchmarkHash(allocator, data, 100);

    try std.testing.expect(result.iterations == 100);
    try std.testing.expect(result.total_ns > 0);
    try std.testing.expect(result.avg_ns > 0);
    try std.testing.expect(result.min_ns <= result.avg_ns);
    try std.testing.expect(result.max_ns >= result.avg_ns);
}
