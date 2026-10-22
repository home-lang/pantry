//! Locate a command, optionally returning its installed provider for packaging.
const std = @import("std");
const io_helper = @import("../../io_helper.zig");
const activation = @import("../../install/symlink.zig");
const CommandResult = @import("common.zig").CommandResult;

pub fn whichCommand(allocator: std.mem.Allocator, program: []const u8, resolve: bool) !CommandResult {
    const found = try io_helper.findExecutable(allocator, program) orelse
        return CommandResult.err(allocator, "Executable not found on PATH");
    defer allocator.free(found);
    if (!resolve) return CommandResult.success(allocator, found);
    const target = activation.resolveExecutablePath(allocator, found) catch |err| {
        return .{ .exit_code = 1, .message = try std.fmt.allocPrint(allocator, "Cannot resolve executable: {s}", .{@errorName(err)}) };
    };
    return .{ .exit_code = 0, .message = target };
}
