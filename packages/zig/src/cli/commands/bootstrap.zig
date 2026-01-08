//! Bootstrap command - System setup for pantry
//!
//! Sets up the development environment including:
//! - Installing Bun runtime (optional)
//! - Configuring PATH automatically
//! - Setting up shell integration for project auto-activation

const std = @import("std");
const io_helper = @import("../../io_helper.zig");
const lib = @import("../../lib.zig");
const common = @import("common.zig");
const shell_cmd = @import("shell.zig");

const CommandResult = common.CommandResult;
const shell = lib.shell;

pub const BootstrapOptions = struct {
    path: ?[]const u8 = null, // Custom installation path
    verbose: bool = false,
    skip_bun: bool = false,
    skip_shell_integration: bool = false,
};

/// Bootstrap the development environment
pub fn bootstrapCommand(allocator: std.mem.Allocator, options: BootstrapOptions) !CommandResult {
    std.debug.print("\n", .{});
    std.debug.print("╔══════════════════════════════════════════════════════════════╗\n", .{});
    std.debug.print("║              pantry - Development Environment Setup          ║\n", .{});
    std.debug.print("╚══════════════════════════════════════════════════════════════╝\n", .{});
    std.debug.print("\n", .{});

    var steps_completed: u8 = 0;
    var steps_total: u8 = 0;

    // Count total steps
    if (!options.skip_bun) steps_total += 1;
    steps_total += 1; // PATH configuration
    if (!options.skip_shell_integration) steps_total += 1;

    // Step 1: Determine installation path
    const install_path = options.path orelse blk: {
        // Try /usr/local first, fall back to ~/.local
        io_helper.makePath("/usr/local/bin") catch |err| {
            if (err == error.AccessDenied or err == error.PermissionDenied) {
                const home = try lib.Paths.home(allocator);
                defer allocator.free(home);
                break :blk try std.fmt.allocPrint(allocator, "{s}/.local", .{home});
            }
            return err;
        };
        break :blk null;
    };
    defer if (options.path == null and install_path != null) allocator.free(install_path.?);

    const effective_path = install_path orelse "/usr/local";

    if (options.verbose) {
        std.debug.print("Installation path: {s}\n\n", .{effective_path});
    }

    // Step 2: Install Bun (if not skipped)
    if (!options.skip_bun) {
        std.debug.print("[{d}/{d}] Installing Bun runtime...\n", .{ steps_completed + 1, steps_total });

        const bun_result = installBun(allocator, effective_path, options.verbose);
        if (bun_result) |_| {
            std.debug.print("     ✓ Bun installed successfully\n", .{});
            steps_completed += 1;
        } else |err| {
            std.debug.print("     ⚠ Bun installation skipped: {}\n", .{err});
            if (options.verbose) {
                std.debug.print("       You can install Bun manually: curl -fsSL https://bun.sh/install | bash\n", .{});
            }
        }
        std.debug.print("\n", .{});
    }

    // Step 3: Configure PATH
    std.debug.print("[{d}/{d}] Configuring PATH...\n", .{ steps_completed + 1, steps_total });

    const path_result = configurePath(allocator, effective_path, options.verbose);
    if (path_result) |msg| {
        std.debug.print("     ✓ {s}\n", .{msg});
        allocator.free(msg);
        steps_completed += 1;
    } else |err| {
        std.debug.print("     ⚠ PATH configuration skipped: {}\n", .{err});
    }
    std.debug.print("\n", .{});

    // Step 4: Shell integration (if not skipped)
    if (!options.skip_shell_integration) {
        std.debug.print("[{d}/{d}] Setting up shell integration...\n", .{ steps_completed + 1, steps_total });

        const detected_shell = shell.Shell.detect();
        if (detected_shell != .unknown) {
            shell.install(allocator) catch |err| {
                std.debug.print("     ⚠ Shell integration failed: {}\n", .{err});
            };
            std.debug.print("     ✓ Shell integration installed for {s}\n", .{detected_shell.name()});
            steps_completed += 1;
        } else {
            std.debug.print("     ⚠ Could not detect shell type\n", .{});
        }
        std.debug.print("\n", .{});
    }

    // Summary
    std.debug.print("══════════════════════════════════════════════════════════════════\n", .{});
    std.debug.print("\n", .{});

    if (steps_completed == steps_total) {
        std.debug.print("✅ Bootstrap complete! ({d}/{d} steps)\n", .{ steps_completed, steps_total });
    } else {
        std.debug.print("⚠️  Bootstrap completed with warnings ({d}/{d} steps)\n", .{ steps_completed, steps_total });
    }

    std.debug.print("\n", .{});
    std.debug.print("Next steps:\n", .{});
    std.debug.print("  1. Restart your shell or run: source ~/.{s}rc\n", .{shell.Shell.detect().name()});
    std.debug.print("  2. Create a project with dependencies:\n", .{});
    std.debug.print("     echo 'dependencies:\\n  - node@22' > deps.yaml\n", .{});
    std.debug.print("  3. Enter the directory - environment activates automatically!\n", .{});
    std.debug.print("\n", .{});
    std.debug.print("For more info: https://stacks-pantry.netlify.app/quickstart\n", .{});
    std.debug.print("\n", .{});

    return .{ .exit_code = 0 };
}

/// Install Bun runtime
fn installBun(allocator: std.mem.Allocator, install_path: []const u8, verbose: bool) !void {
    _ = install_path;

    // Check if bun is already installed
    const result = io_helper.childRun(allocator, &[_][]const u8{ "bun", "--version" });

    if (result) |r| {
        defer allocator.free(r.stdout);
        defer allocator.free(r.stderr);

        if (r.term.Exited == 0) {
            if (verbose) {
                const version = std.mem.trim(u8, r.stdout, &std.ascii.whitespace);
                std.debug.print("       Bun already installed: v{s}\n", .{version});
            }
            return;
        }
    } else |_| {
        // Bun not found, try to install it
    }

    // Try to install bun using curl
    const install_result = std.process.Child.run(.{
        .allocator = allocator,
        .argv = &[_][]const u8{ "sh", "-c", "curl -fsSL https://bun.sh/install | bash" },
    });

    if (install_result) |r| {
        defer allocator.free(r.stdout);
        defer allocator.free(r.stderr);

        if (r.term.Exited != 0) {
            return error.BunInstallFailed;
        }
    } else |err| {
        return err;
    }
}

/// Configure PATH to include pantry binaries
fn configurePath(allocator: std.mem.Allocator, install_path: []const u8, verbose: bool) ![]const u8 {
    const home = try lib.Paths.home(allocator);
    defer allocator.free(home);

    const detected_shell = shell.Shell.detect();
    const rc_file = switch (detected_shell) {
        .zsh => try std.fmt.allocPrint(allocator, "{s}/.zshrc", .{home}),
        .bash => try std.fmt.allocPrint(allocator, "{s}/.bashrc", .{home}),
        .fish => try std.fmt.allocPrint(allocator, "{s}/.config/fish/config.fish", .{home}),
        .unknown => return error.UnknownShell,
    };
    defer allocator.free(rc_file);

    // Read existing rc file
    const rc_content = io_helper.readFileAlloc(allocator, rc_file, 1024 * 1024) catch "";
    defer if (rc_content.len > 0) allocator.free(rc_content);

    // Check if PATH is already configured
    const path_export = try std.fmt.allocPrint(allocator, "{s}/bin", .{install_path});
    defer allocator.free(path_export);

    if (std.mem.indexOf(u8, rc_content, path_export) != null) {
        return try allocator.dupe(u8, "PATH already configured");
    }

    // Add PATH configuration
    const path_line = switch (detected_shell) {
        .fish => try std.fmt.allocPrint(allocator, "\n# pantry PATH\nset -gx PATH {s}/bin $PATH\n", .{install_path}),
        else => try std.fmt.allocPrint(allocator, "\n# pantry PATH\nexport PATH=\"{s}/bin:$PATH\"\n", .{install_path}),
    };
    defer allocator.free(path_line);

    // Append to rc file using blocking std.fs API
    try io_helper.appendToFile(rc_file, path_line);

    if (verbose) {
        std.debug.print("       Added to {s}\n", .{rc_file});
    }

    return try std.fmt.allocPrint(allocator, "PATH configured in {s}", .{std.fs.path.basename(rc_file)});
}
