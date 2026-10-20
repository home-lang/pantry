//! One verbosity policy for native installation and extraction diagnostics.
const std = @import("std");
const io_helper = @import("../io_helper.zig");

pub fn enabled(command_flag: bool) bool {
    return requested(command_flag, io_helper.getenv("PANTRY_VERBOSE") orelse io_helper.getenv("PANTRY_DEBUG"));
}

fn requested(command_flag: bool, environment: ?[]const u8) bool {
    if (command_flag) return true;
    const value = std.mem.trim(u8, environment orelse return false, " \t\r\n");
    return value.len > 0 and !std.mem.eql(u8, value, "0") and !std.ascii.eqlIgnoreCase(value, "false") and !std.ascii.eqlIgnoreCase(value, "off") and !std.ascii.eqlIgnoreCase(value, "no");
}

test "explicit verbosity and environment toggles share one policy" {
    try std.testing.expect(requested(true, "0"));
    try std.testing.expect(requested(false, "1"));
    try std.testing.expect(requested(false, " true "));
    for ([_]?[]const u8{ null, "", " ", "0", "false", "FALSE", "off", "NO" }) |value|
        try std.testing.expect(!requested(false, value));
}
