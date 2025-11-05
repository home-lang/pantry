const std = @import("std");

/// Get the number of CPU cores available on the system
/// Returns the logical CPU count (includes hyperthreading)
pub fn getCpuCount() usize {
    // Zig 0.15.1 provides Thread.getCpuCount()
    return std.Thread.getCpuCount() catch 1;
}

/// Get the default concurrency level for script execution
/// Returns CPU count * 2, with a minimum of 2 and maximum of 64
pub fn getDefaultConcurrency() usize {
    const cpu_count = getCpuCount();
    const concurrency = cpu_count * 2;

    // Minimum 2, maximum 64
    if (concurrency < 2) return 2;
    if (concurrency > 64) return 64;
    return concurrency;
}

test "getCpuCount returns positive number" {
    const count = getCpuCount();
    try std.testing.expect(count > 0);
}

test "getDefaultConcurrency returns reasonable value" {
    const concurrency = getDefaultConcurrency();
    try std.testing.expect(concurrency >= 2);
    try std.testing.expect(concurrency <= 64);
}
