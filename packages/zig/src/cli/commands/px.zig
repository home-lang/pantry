//! Package executor command - run packages from npm (like npx/bunx)

const std = @import("std");
const io_helper = @import("../../io_helper.zig");
const lib = @import("../../lib.zig");
const common = @import("common.zig");

const CommandResult = common.CommandResult;

pub const PxOptions = struct {
    use_pantry: bool = false,
    package_name: ?[]const u8 = null,
    silent: bool = false,
    verbose: bool = false,
};

/// Run packages from npm (like npx/bunx)
pub fn pxCommand(allocator: std.mem.Allocator, args: []const []const u8, options: PxOptions) !CommandResult {
    if (args.len == 0) {
        return CommandResult.err(allocator, "Error: No executable specified\nUsage: pantry px <executable> [args...]");
    }

    const executable_name = args[0];
    const package_name = options.package_name orelse executable_name;

    if (!options.silent) {
        std.debug.print("\x1b[34m📦 Running package executable\x1b[0m\n", .{});
        std.debug.print("\x1b[2m   Package: {s}\x1b[0m\n", .{package_name});
        std.debug.print("\x1b[2m   Executable: {s}\x1b[0m\n\n", .{executable_name});
    }

    // Get current working directory
    var cwd_buf: [std.fs.max_path_bytes]u8 = undefined;
    const cwd = try io_helper.realpath(".", &cwd_buf);

    // Check local bin first
    const local_bin = try std.fs.path.join(allocator, &[_][]const u8{ cwd, "pantry", ".bin", executable_name });
    defer allocator.free(local_bin);

    const found_local = blk: {
        io_helper.cwd().access(io_helper.io, local_bin, .{}) catch {
            break :blk false;
        };
        break :blk true;
    };

    // Check global bin
    const home = std.process.getEnvVarOwned(allocator, "HOME") catch |err| blk: {
        if (err == error.EnvironmentVariableNotFound) {
            // Try USERPROFILE on Windows
            break :blk std.process.getEnvVarOwned(allocator, "USERPROFILE") catch "/tmp";
        }
        break :blk "/tmp";
    };
    defer if (!std.mem.eql(u8, home, "/tmp")) allocator.free(home);

    const global_bin = try std.fs.path.join(allocator, &[_][]const u8{ home, ".local", "share", "pantry", "global", "bin", executable_name });
    defer allocator.free(global_bin);

    const found_global = blk: {
        if (found_local) break :blk false;
        io_helper.cwd().access(io_helper.io, global_bin, .{}) catch {
            break :blk false;
        };
        break :blk true;
    };

    // If not found, install the package
    if (!found_local and !found_global) {
        if (!options.silent) {
            std.debug.print("\x1b[33m📥 Package not found, installing {s}...\x1b[0m\n\n", .{package_name});
        }

        // Install the package globally temporarily
        const install_args = [_][]const u8{package_name};
        const install = @import("install.zig");
        const install_options = install.InstallOptions{};
        const install_result = try install.installCommandWithOptions(allocator, &install_args, install_options);
        defer if (install_result.message) |msg| allocator.free(msg);

        if (install_result.exit_code != 0) {
            return .{
                .exit_code = 1,
                .message = try std.fmt.allocPrint(allocator, "Error: Failed to install package '{s}'", .{package_name}),
            };
        }

        // After install, check local bin again
        io_helper.cwd().access(io_helper.io, local_bin, .{}) catch {
            return .{
                .exit_code = 1,
                .message = try std.fmt.allocPrint(allocator, "Error: Package '{s}' installed but executable '{s}' not found", .{ package_name, executable_name }),
            };
        };
    }

    // Determine which bin to execute
    const bin_path = if (found_local) local_bin else global_bin;

    // Execute the binary with arguments
    var argv = try std.ArrayList([]const u8).initCapacity(allocator, args.len + 1);
    defer argv.deinit(allocator);

    try argv.append(allocator, bin_path);
    for (args[1..]) |arg| {
        try argv.append(allocator, arg);
    }

    const result = try std.process.Child.run(.{
        .allocator = allocator,
        .argv = argv.items,
    });

    // Print output
    if (result.stdout.len > 0) {
        std.debug.print("{s}", .{result.stdout});
    }
    if (result.stderr.len > 0) {
        std.debug.print("{s}", .{result.stderr});
    }

    allocator.free(result.stdout);
    allocator.free(result.stderr);

    const exit_code: u8 = switch (result.term) {
        .Exited => |code| @intCast(code),
        else => 1,
    };

    return .{ .exit_code = exit_code };
}
