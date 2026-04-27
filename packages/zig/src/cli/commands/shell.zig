//! Shell integration commands

const std = @import("std");
const io_helper = @import("../../io_helper.zig");
const lib = @import("../../lib.zig");
const common = @import("common.zig");
const style = @import("../style.zig");

const CommandResult = common.CommandResult;
const shell = lib.shell;

pub fn shellIntegrateCommand(allocator: std.mem.Allocator) !CommandResult {
    const detected_shell = shell.Shell.detect();

    if (detected_shell == .unknown) {
        return CommandResult.err(allocator, "Error: Could not detect shell");
    }

    style.print("Detected shell: {s}\n", .{detected_shell.name()});
    style.print("Installing shell integration...\n", .{});

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

    // Mirror the running pantry executable into the global bin dir so that
    // after a single `pantry shell:integrate` (and a shell restart), pantry
    // itself remains on PATH — even if the user installed it from a one-off
    // location like `~/Code/Tools/...`.
    selfLinkIntoGlobalBin(allocator) catch |err| {
        style.printWarn("Could not self-link pantry into global bin dir: {s}\n", .{@errorName(err)});
    };

    style.print("Done! Restart your shell or run:\n", .{});
    switch (detected_shell) {
        .zsh => style.print("  source ~/.zshrc\n", .{}),
        .bash => style.print("  source ~/.bashrc\n", .{}),
        .fish => style.print("  source ~/.config/fish/config.fish\n", .{}),
        .nushell => style.print("  source $nu.env-path\n", .{}),
        .powershell => style.print("  . $PROFILE\n", .{}),
        .unknown => {},
    }

    return .{ .exit_code = 0 };
}

/// Symlink the currently running `pantry` executable into the global bin dir
/// (the one the shell hook adds to PATH). No-op when the running binary is
/// already inside that dir or the OS doesn't expose an executable path.
/// Delegates to `install/symlink.zig` so we share the cross-platform
/// (Windows-copy / Unix-symlink) behaviour with every other binary linker.
fn selfLinkIntoGlobalBin(allocator: std.mem.Allocator) !void {
    // Zig 0.17 moved the exe-path API onto `std.process` and routed it
    // through the Io vtable.
    const exe_path_z = try std.process.executablePathAlloc(io_helper.io, allocator);
    defer allocator.free(exe_path_z);
    const exe_path: []const u8 = exe_path_z;

    const global_bin = try lib.core.Paths.globalBinDir(allocator);
    defer allocator.free(global_bin);

    // Already inside the global bin dir? Nothing to do.
    if (std.mem.startsWith(u8, exe_path, global_bin)) return;

    try io_helper.makePath(global_bin);

    const link_path = try std.fmt.allocPrint(allocator, "{s}/pantry", .{global_bin});
    defer allocator.free(link_path);

    // The shared helper handles "already exists" by deleting and retrying.
    const symlink_mod = @import("../../install/symlink.zig");
    try symlink_mod.createSymlinkCrossPlatform(exe_path, link_path);
    style.print("✓ Linked pantry into {s}\n", .{global_bin});
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
    const shell_cmds = @import("../../shell/commands.zig");

    var commands = try shell_cmds.ShellCommands.init(allocator);
    defer commands.deinit();

    const result = try commands.lookup(dir);

    if (result) |env_info| {
        return .{
            .exit_code = 0,
            .message = env_info,
        };
    }

    return .{ .exit_code = 1 };
}

/// Handle unknown shell subcommands with a helpful suggestion message.
pub fn shellUnknownSubcommand(allocator: std.mem.Allocator, subcommand: []const u8) !CommandResult {
    const msg = try std.fmt.allocPrint(
        allocator,
        "Unknown shell subcommand: '{s}'\n\nValid subcommands:\n" ++
            "  integrate   Install shell hook into your shell config\n" ++
            "  code        Print shell integration code to stdout\n" ++
            "  lookup      Look up environment for a directory\n" ++
            "  activate    Activate environment for a directory\n",
        .{subcommand},
    );
    return .{
        .exit_code = 1,
        .message = msg,
    };
}

pub fn shellActivateCommand(allocator: std.mem.Allocator, dir: []const u8) !CommandResult {
    // Use the full ShellCommands implementation for activate
    const shell_cmds = @import("../../shell/commands.zig");

    var commands = try shell_cmds.ShellCommands.init(allocator);
    defer commands.deinit();

    const shell_code = commands.activate(dir) catch |err| {
        const msg = try std.fmt.allocPrint(
            allocator,
            "Error: Failed to activate environment: {s}",
            .{@errorName(err)},
        );
        return .{
            .exit_code = 1,
            .message = msg,
        };
    };

    return .{
        .exit_code = 0,
        .message = shell_code,
    };
}
