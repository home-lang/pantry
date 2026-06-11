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
/// Activation + deactivation on PWD change. The autoActivate opt-in gate is
/// enforced binary-side in `shell:lookup`, so this hook inherits it for
/// free. Auto-install is deliberately NOT ported to nushell (its scripting
/// surface shifts between releases; run `pantry install` once per project
/// and the hook activates from then on).
fn generateNushellHook(allocator: std.mem.Allocator) ![]const u8 {
    const hook =
        \\# pantry shell integration for nushell
        \\# Drop into ~/.config/nushell/env.nu (or source from config.nu)
        \\$env.config = ($env.config | upsert hooks.env_change.PWD {|config|
        \\  let hooks = ($config.hooks.env_change.PWD? | default [])
        \\  $hooks | append {|before, after|
        \\    let lookup = (do --ignore-errors { pantry shell:lookup $after } | default '' | str trim)
        \\    if ($lookup | is-empty) {
        \\      # Left a project (or none here): drop the previously added bin dir.
        \\      if 'PANTRY_ENV_BIN_PATH' in $env {
        \\        $env.PATH = ($env.PATH | where {|p| $p != $env.PANTRY_ENV_BIN_PATH })
        \\        hide-env --ignore-errors PANTRY_CURRENT_PROJECT PANTRY_ENV_DIR PANTRY_ENV_BIN_PATH
        \\      }
        \\    } else {
        \\      let parts = ($lookup | split row -n 2 '|')
        \\      let env_dir = ($parts | get 0)
        \\      let project_dir = (if (($parts | length) > 1) { $parts | get 1 } else { $after })
        \\      let bin = ($env_dir | path join 'bin')
        \\      if ($bin | path exists) {
        \\        # De-dupe PATH
        \\        let clean = ($env.PATH | where {|p| $p != $bin })
        \\        $env.PATH = ([$bin] ++ $clean)
        \\        $env.PANTRY_CURRENT_PROJECT = $project_dir
        \\        $env.PANTRY_ENV_DIR = $env_dir
        \\        $env.PANTRY_ENV_BIN_PATH = $bin
        \\      }
        \\    }
        \\  }
        \\})
    ;
    return try allocator.dupe(u8, hook);
}

/// PowerShell hook. Uses a ScriptBlock wired into the prompt so it fires after
/// every `cd`. Safe to stick in $PROFILE. Parity with the bash/zsh template:
/// deactivation on leave, autoActivate opt-in gate (binary-side for
/// activation; Select-String-gated before any uninvited install), and
/// one-shot auto-install memoized per (deps file, LastWriteTime).
fn generatePowershellHook(allocator: std.mem.Allocator) ![]const u8 {
    const hook =
        \\# pantry shell integration for PowerShell
        \\$global:__PantryLastPwd = $null
        \\$global:__PantryNoInstall = $null
        \\$global:__PantryDepFiles = @(
        \\    'pantry.json','pantry.jsonc','pantry.yaml','pantry.yml',
        \\    'deps.yaml','deps.yml','dependencies.yaml','dependencies.yml',
        \\    'pkgx.yaml','pkgx.yml','config/deps.ts','.config/deps.ts',
        \\    'pantry.config.ts','.config/pantry.ts','pantry.config.js',
        \\    'package.json','package.jsonc','zig.json','pyproject.toml',
        \\    'requirements.txt','Cargo.toml','go.mod','Gemfile','deno.json','composer.json'
        \\)
        \\
        \\function global:Invoke-PantryDeactivate {
        \\    if ($env:PANTRY_ENV_BIN_PATH) {
        \\        $sep = [IO.Path]::PathSeparator
        \\        $env:PATH = (($env:PATH -split [regex]::Escape($sep)) | Where-Object { $_ -ne $env:PANTRY_ENV_BIN_PATH }) -join $sep
        \\        Remove-Item Env:PANTRY_CURRENT_PROJECT,Env:PANTRY_ENV_DIR,Env:PANTRY_ENV_BIN_PATH -ErrorAction SilentlyContinue
        \\    }
        \\}
        \\
        \\function global:Invoke-PantryActivate([string]$lookup, [string]$pwdPath) {
        \\    $parts = $lookup -split '\|', 2
        \\    $envDir = $parts[0]
        \\    $projectDir = if ($parts.Count -ge 2) { $parts[1] } else { $pwdPath }
        \\    $bin = Join-Path $envDir 'bin'
        \\    if (-not (Test-Path $bin)) { return $false }
        \\    # De-dupe PATH
        \\    $sep = [IO.Path]::PathSeparator
        \\    $existing = ($env:PATH -split [regex]::Escape($sep)) | Where-Object { $_ -ne $bin }
        \\    $env:PATH = (@($bin) + $existing) -join $sep
        \\    $env:PANTRY_CURRENT_PROJECT = $projectDir
        \\    $env:PANTRY_ENV_DIR        = $envDir
        \\    $env:PANTRY_ENV_BIN_PATH   = $bin
        \\    return $true
        \\}
        \\
        \\function global:Invoke-PantryChpwd {
        \\    $pwdPath = (Get-Location).Path
        \\    if ($global:__PantryLastPwd -eq $pwdPath) { return }
        \\    $global:__PantryLastPwd = $pwdPath
        \\    if (-not (Get-Command pantry -ErrorAction SilentlyContinue)) { return }
        \\
        \\    try { $lookup = & pantry shell:lookup $pwdPath 2>$null } catch { $lookup = $null }
        \\    if ($lookup) { [void](Invoke-PantryActivate $lookup $pwdPath); return }
        \\
        \\    Invoke-PantryDeactivate
        \\    if ($env:PANTRY_NO_AUTO_INSTALL) { return }
        \\
        \\    # Auto-install: only for projects that opt in with autoActivate: true,
        \\    # and only once per (deps file, mtime) — never on every cd.
        \\    $dep = $null
        \\    foreach ($f in $global:__PantryDepFiles) {
        \\        $p = Join-Path $pwdPath $f
        \\        if (Test-Path $p -PathType Leaf) { $dep = $p; break }
        \\    }
        \\    if (-not $dep) { return }
        \\    if (-not (Select-String -Path $dep -Quiet -Pattern '^\s*"?autoActivate"?\s*:\s*"?true"?')) { return }
        \\    $stamp = "$dep|$((Get-Item $dep).LastWriteTimeUtc.Ticks)"
        \\    if ($global:__PantryNoInstall -eq $stamp) { return }
        \\    Write-Host "pantry: setting up $(Split-Path $pwdPath -Leaf)..."
        \\    & pantry install *> $null
        \\    try { $lookup = & pantry shell:lookup $pwdPath 2>$null } catch { $lookup = $null }
        \\    if ($lookup -and (Invoke-PantryActivate $lookup $pwdPath)) {
        \\        Write-Host "pantry: $(Split-Path $pwdPath -Leaf) ready"
        \\    } else {
        \\        $global:__PantryNoInstall = $stamp
        \\    }
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

/// Generate zsh hook. Delegates to the full `dev:shellcode` template — the
/// template registers its own chpwd hook, caching, opt-in gating and PATH
/// repair. (A previous version eval'd `pantry shell:lookup` output directly,
/// but lookup emits `env_dir|project_dir`, NOT shell code — eval parsed the
/// `|` as a pipeline and tried to execute both paths as commands.)
fn generateZshHook(allocator: std.mem.Allocator) ![]const u8 {
    const hook =
        \\# pantry shell integration for zsh
        \\command -v pantry >/dev/null 2>&1 && eval "$(pantry dev:shellcode)"
    ;
    return try allocator.dupe(u8, hook);
}

/// Generate bash hook. Same delegation as zsh — the template handles
/// PROMPT_COMMAND registration itself.
fn generateBashHook(allocator: std.mem.Allocator) ![]const u8 {
    const hook =
        \\# pantry shell integration for bash
        \\command -v pantry >/dev/null 2>&1 && eval "$(pantry dev:shellcode)"
    ;
    return try allocator.dupe(u8, hook);
}

/// Generate fish hook. The bash/zsh template doesn't run under fish, so this
/// parses the `env_dir|project_dir` lookup output explicitly (same contract
/// the nushell/powershell hooks use). Feature parity with the template:
/// deactivation on leave, autoActivate opt-in gate (binary-side for
/// activation; grep-gated here before any uninvited install), and one-shot
/// auto-install memoized per (deps file, mtime).
fn generateFishHook(allocator: std.mem.Allocator) ![]const u8 {
    const hook =
        \\# pantry shell integration for fish
        \\set -g __pantry_dep_files pantry.json pantry.jsonc pantry.yaml pantry.yml deps.yaml deps.yml dependencies.yaml dependencies.yml pkgx.yaml pkgx.yml config/deps.ts .config/deps.ts pantry.config.ts .config/pantry.ts pantry.config.js package.json package.jsonc zig.json pyproject.toml requirements.txt Cargo.toml go.mod Gemfile deno.json composer.json
        \\
        \\function __pantry_dep_here
        \\  for f in $__pantry_dep_files
        \\    if test -f "$argv[1]/$f"
        \\      echo "$argv[1]/$f"
        \\      return 0
        \\    end
        \\  end
        \\  return 1
        \\end
        \\
        \\function __pantry_deactivate
        \\  if set -q PANTRY_ENV_BIN_PATH
        \\    if set -l idx (contains -i -- "$PANTRY_ENV_BIN_PATH" $PATH)
        \\      set -e PATH[$idx]
        \\    end
        \\    set -e PANTRY_CURRENT_PROJECT PANTRY_ENV_DIR PANTRY_ENV_BIN_PATH
        \\  end
        \\end
        \\
        \\function __pantry_activate_from
        \\  set -l parts (string split -m1 '|' -- $argv[1])
        \\  set -l env_dir $parts[1]
        \\  set -l project_dir $parts[2]
        \\  set -l bin "$env_dir/bin"
        \\  test -d "$bin"; or return 1
        \\  if not contains -- "$bin" $PATH
        \\    set -gx PATH "$bin" $PATH
        \\  end
        \\  set -gx PANTRY_CURRENT_PROJECT $project_dir
        \\  set -gx PANTRY_ENV_DIR $env_dir
        \\  set -gx PANTRY_ENV_BIN_PATH $bin
        \\end
        \\
        \\function pantry_pwd --on-variable PWD
        \\  command -q pantry; or return
        \\  set -l lookup (pantry shell:lookup "$PWD" 2>/dev/null)
        \\  if test -n "$lookup"
        \\    __pantry_activate_from $lookup
        \\    return
        \\  end
        \\  __pantry_deactivate
        \\  # Auto-install: only for projects that opt in with autoActivate: true,
        \\  # and only once per (deps file, mtime) — never on every cd.
        \\  set -q PANTRY_NO_AUTO_INSTALL; and return
        \\  set -l dep (__pantry_dep_here "$PWD"); or return
        \\  grep -qiE '^[[:space:]]*"?autoActivate"?[[:space:]]*:[[:space:]]*"?true"?' "$dep" 2>/dev/null; or return
        \\  set -l m (command stat -f %m "$dep" 2>/dev/null; or command stat -c %Y "$dep" 2>/dev/null)
        \\  test "$__pantry_noinstall" = "$dep|$m"; and return
        \\  echo "pantry: setting up "(basename "$PWD")"…" >&2
        \\  pantry install >/dev/null 2>&1
        \\  set -l lookup (pantry shell:lookup "$PWD" 2>/dev/null)
        \\  if test -n "$lookup"; and __pantry_activate_from $lookup
        \\    echo "pantry: "(basename "$PWD")" ready" >&2
        \\  else
        \\    set -g __pantry_noinstall "$dep|$m"
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

    // Check if already installed — either our own marker or a hand-added
    // `eval "$(pantry dev:shellcode)"` line. Never append a duplicate hook.
    if (std.mem.indexOf(u8, existing, "pantry shell integration") != null or
        std.mem.indexOf(u8, existing, "pantry dev:shellcode") != null)
    {
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

    // Test zsh hook — must delegate to the full template, never eval raw
    // shell:lookup output (its `env|proj` format is not shell code).
    {
        const hook = try generateHook(.zsh, allocator);
        defer allocator.free(hook);
        try std.testing.expect(std.mem.indexOf(u8, hook, "pantry dev:shellcode") != null);
        try std.testing.expect(std.mem.indexOf(u8, hook, "eval \"$env_info\"") == null);
    }

    // Test bash hook
    {
        const hook = try generateHook(.bash, allocator);
        defer allocator.free(hook);
        try std.testing.expect(std.mem.indexOf(u8, hook, "pantry dev:shellcode") != null);
    }

    // Fish hook — parses the lookup output instead of eval'ing it.
    {
        const hook = try generateHook(.fish, allocator);
        defer allocator.free(hook);
        try std.testing.expect(std.mem.indexOf(u8, hook, "--on-variable PWD") != null);
        try std.testing.expect(std.mem.indexOf(u8, hook, "string split") != null);
        try std.testing.expect(std.mem.indexOf(u8, hook, "eval $env_info") == null);
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
