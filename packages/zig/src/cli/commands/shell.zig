//! Shell integration commands

const std = @import("std");
const lib = @import("../../lib.zig");
const common = @import("common.zig");

const CommandResult = common.CommandResult;
const shell = lib.shell;

pub fn shellIntegrateCommand(allocator: std.mem.Allocator) !CommandResult {
    const detected_shell = shell.Shell.detect();

    if (detected_shell == .unknown) {
        return CommandResult.err(allocator, "Error: Could not detect shell");
    }

    std.debug.print("Detected shell: {s}\n", .{detected_shell.name()});
    std.debug.print("Installing shell integration...\n", .{});

    shell.install(allocator) catch |err| {
        const msg = try std.fmt.allocPrint(
            allocator,
            "Error: Failed to install shell integration: {}",
            .{err},
        );
        return .{
            .exit_code = 1,
            .message = msg,
        };
    };

    std.debug.print("Done! Restart your shell or run:\n", .{});
    switch (detected_shell) {
        .zsh => std.debug.print("  source ~/.zshrc\n", .{}),
        .bash => std.debug.print("  source ~/.bashrc\n", .{}),
        .fish => std.debug.print("  source ~/.config/fish/config.fish\n", .{}),
        .unknown => {},
    }

    return .{ .exit_code = 0 };
}

pub fn shellCodeCommand(allocator: std.mem.Allocator) !CommandResult {
    var generator = shell.ShellCodeGenerator.init(allocator, .{
        .show_messages = true,
        .activation_message = "✅ Environment activated",
        .deactivation_message = "Environment deactivated",
        .verbose = false,
    });
    defer generator.deinit();

    const shell_code = try generator.generate();

    return .{
        .exit_code = 0,
        .message = shell_code,
    };
}

pub fn shellLookupCommand(allocator: std.mem.Allocator, dir: []const u8) !CommandResult {
    const detector = @import("../../deps/detector.zig");

    const deps_file = (try detector.findDepsFile(allocator, dir)) orelse {
        return .{ .exit_code = 1 };
    };
    defer allocator.free(deps_file.path);

    const project_hash = lib.string.hashDependencyFile(deps_file.path);
    const hex = try lib.string.hashToHex(project_hash, allocator);
    defer allocator.free(hex);

    return .{
        .exit_code = 0,
        .message = try allocator.dupe(u8, hex),
    };
}

pub fn shellActivateCommand(allocator: std.mem.Allocator, dir: []const u8) !CommandResult {
    _ = dir;
    _ = allocator;
    return .{ .exit_code = 0 };
}
