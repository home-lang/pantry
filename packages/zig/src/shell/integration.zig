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
    nushell,
    powershell,
    unknown,

    /// Detect current shell from environment. Checks both `$SHELL` (Unix) and
    /// Windows-friendly env vars so nushell/powershell users get picked up.
    pub fn detect() Shell {
        // Explicit override
        if (io_helper.getEnvVarOwned(std.heap.page_allocator, "PANTRY_SHELL")) |forced| {
            defer std.heap.page_allocator.free(forced);
            if (std.mem.eql(u8, forced, "zsh")) return .zsh;
            if (std.mem.eql(u8, forced, "bash")) return .bash;
            if (std.mem.eql(u8, forced, "fish")) return .fish;
            if (std.mem.eql(u8, forced, "nushell") or std.mem.eql(u8, forced, "nu")) return .nushell;
            if (std.mem.eql(u8, forced, "powershell") or std.mem.eql(u8, forced, "pwsh")) return .powershell;
        } else |_| {}

        // PowerShell sets $PSModulePath; check that before $SHELL which may
        // be unset on Windows.
        if (io_helper.getEnvVarOwned(std.heap.page_allocator, "PSModulePath")) |ps| {
            std.heap.page_allocator.free(ps);
            return .powershell;
        } else |_| {}

        // Nushell sets $NU_VERSION in its environment.
        if (io_helper.getEnvVarOwned(std.heap.page_allocator, "NU_VERSION")) |nu| {
            std.heap.page_allocator.free(nu);
            return .nushell;
        } else |_| {}

        const shell_env = io_helper.getEnvVarOwned(std.heap.page_allocator, "SHELL") catch return .unknown;
        defer std.heap.page_allocator.free(shell_env);

        if (std.mem.endsWith(u8, shell_env, "zsh")) return .zsh;
        if (std.mem.endsWith(u8, shell_env, "bash")) return .bash;
        if (std.mem.endsWith(u8, shell_env, "fish")) return .fish;
        if (std.mem.endsWith(u8, shell_env, "nu")) return .nushell;
        if (std.mem.endsWith(u8, shell_env, "pwsh") or std.mem.endsWith(u8, shell_env, "powershell")) return .powershell;
        return .unknown;
    }

    pub fn name(self: Shell) []const u8 {
        return switch (self) {
            .zsh => "zsh",
            .bash => "bash",
            .fish => "fish",
            .nushell => "nushell",
            .powershell => "powershell",
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
        .nushell => try generateNushellHook(allocator),
        .powershell => try generatePowershellHook(allocator),
        .unknown => error.ShellNotSupported,
    };
}

/// Nushell hook. Uses `env_change PWD` (Nushell's chpwd analogue) and invokes
/// `pantry shell:lookup` which emits `env_dir|project_dir` — the same format
/// the bash/zsh shellcode consumes. Set PATH via `$env.PATH = ...` pre-pending
/// the env bin dir.
fn generateNushellHook(allocator: std.mem.Allocator) ![]const u8 {
    const hook =
        \\# pantry shell integration for nushell
        \\# Drop into ~/.config/nushell/env.nu (or source from config.nu)
        \\$env.config = ($env.config | upsert hooks.env_change.PWD {|config|
        \\  let hooks = ($config.hooks.env_change.PWD? | default [])
        \\  $hooks | append {|before, after|
        \\    let lookup = (do --ignore-errors { pantry shell:lookup $after } | str trim)
        \\    if ($lookup | is-empty) { return }
        \\    let parts = ($lookup | split column '|' env project)
        \\    let env_dir = ($parts | get 0.env)
        \\    let project_dir = ($parts | get 0.project)
        \\    let bin = $'($env_dir)/bin'
        \\    if not ($bin | path exists) { return }
        \\    # De-dupe PATH
        \\    let clean = ($env.PATH | where {|p| $p != $bin })
        \\    $env.PATH = ([$bin] ++ $clean)
        \\    $env.PANTRY_CURRENT_PROJECT = $project_dir
        \\    $env.PANTRY_ENV_DIR = $env_dir
        \\    $env.PANTRY_ENV_BIN_PATH = $bin
        \\  }
        \\})
    ;
    return try allocator.dupe(u8, hook);
}

/// PowerShell hook. Uses a ScriptBlock wired into the prompt so it fires after
/// every `cd`. Safe to stick in $PROFILE.
fn generatePowershellHook(allocator: std.mem.Allocator) ![]const u8 {
    const hook =
        \\# pantry shell integration for PowerShell
        \\$global:__PantryLastPwd = $null
        \\function Invoke-PantryChpwd {
        \\    if ($global:__PantryLastPwd -eq (Get-Location).Path) { return }
        \\    $global:__PantryLastPwd = (Get-Location).Path
        \\
        \\    try {
        \\        $lookup = & pantry shell:lookup (Get-Location).Path 2>$null
        \\    } catch { return }
        \\    if (-not $lookup) { return }
        \\
        \\    $parts = $lookup -split '\|', 2
        \\    if ($parts.Count -lt 1) { return }
        \\    $envDir = $parts[0]
        \\    $projectDir = if ($parts.Count -ge 2) { $parts[1] } else { (Get-Location).Path }
        \\    $bin = Join-Path $envDir 'bin'
        \\    if (-not (Test-Path $bin)) { return }
        \\
        \\    # De-dupe PATH
        \\    $sep = [IO.Path]::PathSeparator
        \\    $existing = $env:PATH -split [regex]::Escape($sep) | Where-Object { $_ -ne $bin }
        \\    $env:PATH = $bin + $sep + ($existing -join $sep)
        \\    $env:PANTRY_CURRENT_PROJECT = $projectDir
        \\    $env:PANTRY_ENV_DIR        = $envDir
        \\    $env:PANTRY_ENV_BIN_PATH   = $bin
        \\}
        \\
        \\# Hook into the prompt so Invoke-PantryChpwd fires after every `cd`.
        \\$existingPrompt = $function:prompt
        \\function global:prompt {
        \\    Invoke-PantryChpwd
        \\    & $existingPrompt
        \\}
        \\
        \\# Run once at shell start
        \\Invoke-PantryChpwd
    ;
    return try allocator.dupe(u8, hook);
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
        // Prefer a drop-in `conf.d/pantry.fish` if `~/.config/fish/conf.d`
        // exists — keeps the user's config.fish clean. Falls back to config.fish.
        .fish => blk: {
            const confd = try std.fmt.allocPrint(allocator, "{s}/.config/fish/conf.d", .{home});
            defer allocator.free(confd);
            io_helper.cwd().access(io_helper.io, confd, .{}) catch {
                break :blk try std.fmt.allocPrint(allocator, "{s}/.config/fish/config.fish", .{home});
            };
            break :blk try std.fmt.allocPrint(allocator, "{s}/.config/fish/conf.d/pantry.fish", .{home});
        },
        .nushell => try std.fmt.allocPrint(allocator, "{s}/.config/nushell/env.nu", .{home}),
        .powershell => blk: {
            // Best-effort default: $HOME/Documents/PowerShell/Microsoft.PowerShell_profile.ps1
            // Users who symlink their profile elsewhere can always use `pantry shell:install --path`.
            break :blk try std.fmt.allocPrint(allocator, "{s}/Documents/PowerShell/Microsoft.PowerShell_profile.ps1", .{home});
        },
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

    // Fish hook
    {
        const hook = try generateHook(.fish, allocator);
        defer allocator.free(hook);
        try std.testing.expect(std.mem.indexOf(u8, hook, "--on-variable PWD") != null);
    }

    // Nushell hook
    {
        const hook = try generateHook(.nushell, allocator);
        defer allocator.free(hook);
        try std.testing.expect(std.mem.indexOf(u8, hook, "env_change.PWD") != null);
        try std.testing.expect(std.mem.indexOf(u8, hook, "pantry shell:lookup") != null);
    }

    // PowerShell hook
    {
        const hook = try generateHook(.powershell, allocator);
        defer allocator.free(hook);
        try std.testing.expect(std.mem.indexOf(u8, hook, "Invoke-PantryChpwd") != null);
        try std.testing.expect(std.mem.indexOf(u8, hook, "$env:PATH") != null);
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
