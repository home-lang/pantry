const std = @import("std");
const io_helper = @import("../io_helper.zig");
const core = @import("../core/platform.zig");
const errors = @import("../core/error.zig");

const pantryError = errors.pantryError;
const Platform = core.Platform;

/// Shell types
pub const Shell = enum {
    zsh,
    bash,
    fish,
    unknown,

    /// Detect current shell from environment
    pub fn detect() Shell {
        const shell_env = io_helper.getEnvVarOwned(std.heap.page_allocator, "SHELL") catch return .unknown;
        defer std.heap.page_allocator.free(shell_env);

        if (std.mem.endsWith(u8, shell_env, "zsh")) return .zsh;
        if (std.mem.endsWith(u8, shell_env, "bash")) return .bash;
        if (std.mem.endsWith(u8, shell_env, "fish")) return .fish;
        return .unknown;
    }

    pub fn name(self: Shell) []const u8 {
        return switch (self) {
            .zsh => "zsh",
            .bash => "bash",
            .fish => "fish",
            .unknown => "unknown",
        };
    }
};

/// Generate shell hook code for environment activation
pub fn generateHook(shell: Shell, allocator: std.mem.Allocator) ![]const u8 {
    return switch (shell) {
        .zsh => try generateZshHook(allocator),
        .bash => try generateBashHook(allocator),
        .fish => try generateFishHook(allocator),
        .unknown => error.ShellNotSupported,
    };
}

/// Generate zsh hook (chpwd function)
fn generateZshHook(allocator: std.mem.Allocator) ![]const u8 {
    const hook =
        \\# pantry shell integration for zsh
        \\pantry_chpwd() {
        \\  if command -v pantry >/dev/null 2>&1; then
        \\    local env_info
        \\    env_info=$(pantry shell:lookup "$PWD" 2>/dev/null)
        \\    if [ -n "$env_info" ]; then
        \\      eval "$env_info"
        \\    fi
        \\  fi
        \\}
        \\
        \\# Add to chpwd hooks
        \\if [[ -z "${chpwd_functions[(r)pantry_chpwd]}" ]]; then
        \\  chpwd_functions+=(pantry_chpwd)
        \\fi
        \\
        \\# Run on shell start
        \\pantry_chpwd
    ;
    return try allocator.dupe(u8, hook);
}

/// Generate bash hook (PROMPT_COMMAND)
fn generateBashHook(allocator: std.mem.Allocator) ![]const u8 {
    const hook =
        \\# pantry shell integration for bash
        \\pantry_prompt_command() {
        \\  if command -v pantry >/dev/null 2>&1; then
        \\    local env_info
        \\    env_info=$(pantry shell:lookup "$PWD" 2>/dev/null)
        \\    if [ -n "$env_info" ]; then
        \\      eval "$env_info"
        \\    fi
        \\  fi
        \\}
        \\
        \\# Add to PROMPT_COMMAND
        \\if [[ ":$PROMPT_COMMAND:" != *":pantry_prompt_command:"* ]]; then
        \\  PROMPT_COMMAND="pantry_prompt_command${PROMPT_COMMAND:+;$PROMPT_COMMAND}"
        \\fi
        \\
        \\# Run on shell start
        \\pantry_prompt_command
    ;
    return try allocator.dupe(u8, hook);
}

/// Generate fish hook
fn generateFishHook(allocator: std.mem.Allocator) ![]const u8 {
    const hook =
        \\# pantry shell integration for fish
        \\function pantry_pwd --on-variable PWD
        \\  if command -v pantry >/dev/null 2>&1
        \\    set -l env_info (pantry shell:lookup "$PWD" 2>/dev/null)
        \\    if test -n "$env_info"
        \\      eval $env_info
        \\    end
        \\  end
        \\end
        \\
        \\# Run on shell start
        \\pantry_pwd
    ;
    return try allocator.dupe(u8, hook);
}

/// Generate activation script for environment
pub fn generateActivation(
    allocator: std.mem.Allocator,
    path: []const u8,
    env_vars: std.StringHashMap([]const u8),
) ![]const u8 {
    var script = try std.ArrayList(u8).initCapacity(allocator, 256);
    defer script.deinit(allocator);

    // Export PATH
    try script.print(allocator, "export PATH=\"{s}\"\n", .{path});

    // Export environment variables
    var it = env_vars.iterator();
    while (it.next()) |entry| {
        try script.print(allocator, "export {s}=\"{s}\"\n", .{ entry.key_ptr.*, entry.value_ptr.* });
    }

    return script.toOwnedSlice(allocator);
}

/// Get shell RC file path
pub fn getRcFile(shell: Shell, allocator: std.mem.Allocator) ![]const u8 {
    const home = try core.Paths.home(allocator);
    defer allocator.free(home);

    return switch (shell) {
        .zsh => try std.fmt.allocPrint(allocator, "{s}/.zshrc", .{home}),
        .bash => blk: {
            // Try .bashrc first, then .bash_profile
            const bashrc = try std.fmt.allocPrint(allocator, "{s}/.bashrc", .{home});
            io_helper.cwd().access(io_helper.io, bashrc, .{}) catch {
                allocator.free(bashrc);
                break :blk try std.fmt.allocPrint(allocator, "{s}/.bash_profile", .{home});
            };
            break :blk bashrc;
        },
        .fish => try std.fmt.allocPrint(allocator, "{s}/.config/fish/config.fish", .{home}),
        .unknown => error.ShellNotSupported,
    };
}

/// Install shell integration
pub fn install(allocator: std.mem.Allocator) !void {
    const shell = Shell.detect();
    if (shell == .unknown) {
        return error.ShellNotSupported;
    }

    const rc_file = try getRcFile(shell, allocator);
    defer allocator.free(rc_file);

    const hook = try generateHook(shell, allocator);
    defer allocator.free(hook);

    // Read existing RC file
    const existing = io_helper.readFileAlloc(allocator, rc_file, 1024 * 1024) catch |err| switch (err) {
        error.FileNotFound => "",
        else => return err,
    };
    defer if (existing.len > 0) allocator.free(existing);

    // Check if already installed
    if (std.mem.indexOf(u8, existing, "pantry shell integration") != null) {
        // Already installed
        return;
    }

    // Append hook to RC file using blocking std.fs API
    const full_hook = try std.mem.concat(allocator, u8, &[_][]const u8{ "\n\n", hook, "\n" });
    defer allocator.free(full_hook);
    try io_helper.appendToFile(rc_file, full_hook);
}

test "Shell detection" {
    const shell = Shell.detect();
    _ = shell.name();
}

test "Hook generation" {
    const allocator = std.testing.allocator;

    // Test zsh hook
    {
        const hook = try generateHook(.zsh, allocator);
        defer allocator.free(hook);
        try std.testing.expect(std.mem.indexOf(u8, hook, "pantry_chpwd") != null);
    }

    // Test bash hook
    {
        const hook = try generateHook(.bash, allocator);
        defer allocator.free(hook);
        try std.testing.expect(std.mem.indexOf(u8, hook, "PROMPT_COMMAND") != null);
    }
}

test "Activation script generation" {
    const allocator = std.testing.allocator;

    var env_vars = std.StringHashMap([]const u8).init(allocator);
    defer env_vars.deinit();
    try env_vars.put("NODE_VERSION", "20.0.0");

    const script = try generateActivation(allocator, "/usr/local/bin:/usr/bin", env_vars);
    defer allocator.free(script);

    try std.testing.expect(std.mem.indexOf(u8, script, "export PATH=") != null);
    try std.testing.expect(std.mem.indexOf(u8, script, "NODE_VERSION") != null);
}
