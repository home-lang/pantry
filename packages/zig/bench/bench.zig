const std = @import("std");
const lib = @import("lib");
const string = lib.string;
const Paths = lib.Paths;

const ITERATIONS = 1_000_000;
const WARMUP_ITERATIONS = 10_000;

pub fn main() !void {
    var gpa = std.heap.GeneralPurposeAllocator(.{}){};
    defer _ = gpa.deinit();
    const allocator = gpa.allocator();

    std.debug.print("\n=== Launchpad Benchmarks ===\n\n", .{});

    try benchmarkHashing(allocator);
    try benchmarkPathResolution(allocator);
    try benchmarkStringInterning(allocator);

    std.debug.print("\n=== Benchmarks Complete ===\n", .{});
}

fn benchmarkHashing(allocator: std.mem.Allocator) !void {
    std.debug.print("Hashing Benchmarks:\n", .{});

    // Benchmark small string hashing (uses FNV-1a)
    {
        const input = "package.json";
        var timer = try std.time.Timer.start();

        // Warmup
        for (0..WARMUP_ITERATIONS) |_| {
            _ = string.md5Hash(input);
        }

        // Benchmark
        const start = timer.read();
        for (0..ITERATIONS) |_| {
            _ = string.md5Hash(input);
        }
        const end = timer.read();

        const elapsed_ns = end - start;
        const ns_per_op = elapsed_ns / ITERATIONS;

        std.debug.print("  Small string (FNV-1a): {d} ns/op ({d:.2} M ops/sec)\n", .{
            ns_per_op,
            @as(f64, @floatFromInt(ITERATIONS)) / (@as(f64, @floatFromInt(elapsed_ns)) / 1_000_000_000.0),
        });
    }

    // Benchmark large string hashing (uses MD5)
    {
        const input = "a" ** 100;
        var timer = try std.time.Timer.start();

        // Warmup
        for (0..WARMUP_ITERATIONS) |_| {
            _ = string.md5Hash(input);
        }

        // Benchmark
        const start = timer.read();
        for (0..ITERATIONS) |_| {
            _ = string.md5Hash(input);
        }
        const end = timer.read();

        const elapsed_ns = end - start;
        const ns_per_op = elapsed_ns / ITERATIONS;

        std.debug.print("  Large string (MD5): {d} ns/op ({d:.2} M ops/sec)\n", .{
            ns_per_op,
            @as(f64, @floatFromInt(ITERATIONS)) / (@as(f64, @floatFromInt(elapsed_ns)) / 1_000_000_000.0),
        });
    }

    // Benchmark hashToHex
    {
        const hash = string.md5Hash("test");
        var timer = try std.time.Timer.start();

        // Warmup
        for (0..WARMUP_ITERATIONS) |_| {
            const hex = try string.hashToHex(hash, allocator);
            allocator.free(hex);
        }

        // Benchmark
        const start = timer.read();
        for (0..ITERATIONS) |_| {
            const hex = try string.hashToHex(hash, allocator);
            allocator.free(hex);
        }
        const end = timer.read();

        const elapsed_ns = end - start;
        const ns_per_op = elapsed_ns / ITERATIONS;

        std.debug.print("  Hash to hex: {d} ns/op ({d:.2} M ops/sec)\n\n", .{
            ns_per_op,
            @as(f64, @floatFromInt(ITERATIONS)) / (@as(f64, @floatFromInt(elapsed_ns)) / 1_000_000_000.0),
        });
    }
}

fn benchmarkPathResolution(allocator: std.mem.Allocator) !void {
    std.debug.print("Path Resolution Benchmarks:\n", .{});

    const iterations = 100_000; // Fewer iterations for I/O operations
    const warmup = 1_000;

    // Benchmark home path resolution
    {
        var timer = try std.time.Timer.start();

        // Warmup
        for (0..warmup) |_| {
            const home = try Paths.home(allocator);
            allocator.free(home);
        }

        // Benchmark
        const start = timer.read();
        for (0..iterations) |_| {
            const home = try Paths.home(allocator);
            allocator.free(home);
        }
        const end = timer.read();

        const elapsed_ns = end - start;
        const ns_per_op = elapsed_ns / iterations;

        std.debug.print("  Home path: {d} ns/op ({d:.2} K ops/sec)\n", .{
            ns_per_op,
            @as(f64, @floatFromInt(iterations)) / (@as(f64, @floatFromInt(elapsed_ns)) / 1_000_000_000.0) / 1000.0,
        });
    }

    // Benchmark cache path resolution
    {
        var timer = try std.time.Timer.start();

        // Warmup
        for (0..warmup) |_| {
            const cache = try Paths.cache(allocator);
            allocator.free(cache);
        }

        // Benchmark
        const start = timer.read();
        for (0..iterations) |_| {
            const cache = try Paths.cache(allocator);
            allocator.free(cache);
        }
        const end = timer.read();

        const elapsed_ns = end - start;
        const ns_per_op = elapsed_ns / iterations;

        std.debug.print("  Cache path: {d} ns/op ({d:.2} K ops/sec)\n\n", .{
            ns_per_op,
            @as(f64, @floatFromInt(iterations)) / (@as(f64, @floatFromInt(elapsed_ns)) / 1_000_000_000.0) / 1000.0,
        });
    }
}

fn benchmarkStringInterning(allocator: std.mem.Allocator) !void {
    std.debug.print("String Interning Benchmarks:\n", .{});

    const iterations = 100_000;
    const warmup = 1_000;

    var interner = string.StringInterner.init(allocator);
    defer interner.deinit();

    // Pre-populate with some strings
    _ = try interner.intern("node");
    _ = try interner.intern("bun");
    _ = try interner.intern("deno");

    // Benchmark interning existing strings (cache hit)
    {
        var timer = try std.time.Timer.start();

        // Warmup
        for (0..warmup) |_| {
            _ = try interner.intern("node");
        }

        // Benchmark
        const start = timer.read();
        for (0..iterations) |_| {
            _ = try interner.intern("node");
        }
        const end = timer.read();

        const elapsed_ns = end - start;
        const ns_per_op = elapsed_ns / iterations;

        std.debug.print("  Intern (hit): {d} ns/op ({d:.2} M ops/sec)\n", .{
            ns_per_op,
            @as(f64, @floatFromInt(iterations)) / (@as(f64, @floatFromInt(elapsed_ns)) / 1_000_000_000.0),
        });
    }

    // Benchmark interning new strings (cache miss)
    {
        var timer = try std.time.Timer.start();

        // Warmup
        for (0..warmup) |i| {
            var buf: [64]u8 = undefined;
            const str = try std.fmt.bufPrint(&buf, "warmup_{d}", .{i});
            _ = try interner.intern(str);
        }

        // Benchmark
        const start = timer.read();
        for (0..iterations) |i| {
            var buf: [64]u8 = undefined;
            const str = try std.fmt.bufPrint(&buf, "test_{d}", .{i});
            _ = try interner.intern(str);
        }
        const end = timer.read();

        const elapsed_ns = end - start;
        const ns_per_op = elapsed_ns / iterations;

        std.debug.print("  Intern (miss): {d} ns/op ({d:.2} K ops/sec)\n", .{
            ns_per_op,
            @as(f64, @floatFromInt(iterations)) / (@as(f64, @floatFromInt(elapsed_ns)) / 1_000_000_000.0) / 1000.0,
        });
    }

    // Benchmark pointer comparison
    {
        const str1 = try interner.intern("benchmark");
        const str2 = try interner.intern("benchmark");

        var timer = try std.time.Timer.start();

        // Warmup
        for (0..WARMUP_ITERATIONS) |_| {
            _ = string.StringInterner.equalPtr(str1, str2);
        }

        // Benchmark
        const start = timer.read();
        for (0..ITERATIONS) |_| {
            _ = string.StringInterner.equalPtr(str1, str2);
        }
        const end = timer.read();

        const elapsed_ns = end - start;
        const ns_per_op = elapsed_ns / ITERATIONS;

        std.debug.print("  Pointer compare: {d} ns/op ({d:.2} M ops/sec)\n\n", .{
            ns_per_op,
            @as(f64, @floatFromInt(ITERATIONS)) / (@as(f64, @floatFromInt(elapsed_ns)) / 1_000_000_000.0),
        });
    }
}
