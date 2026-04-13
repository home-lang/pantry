//! Developer/debugging commands

const std = @import("std");
const io_helper = @import("../../io_helper.zig");
const lib = @import("../../lib.zig");
const common = @import("common.zig");
const style = @import("../style.zig");

const CommandResult = common.CommandResult;
const string = lib.string;

pub fn devShellcodeCommand(allocator: std.mem.Allocator) !CommandResult {
    // Generate minimal, performant shell integration code
    // Key design: shell-side cache avoids spawning binary on every cd
    const shellcode =
        \\
        \\# pantry shell integration - optimized for instant cd
        \\# Shell-side cache: ~/.pantry/cache/shell-env.cache (plain text, no binary needed)
        \\
        \\__PANTRY_CACHE_FILE="${HOME}/.pantry/cache/shell-env.cache"
        \\
        \\# Dependency file names to check (keep in sync with Zig detector)
        \\__PANTRY_DEP_FILES=(
        \\  "pantry.json" "pantry.jsonc" "pantry.yaml" "pantry.yml"
        \\  "deps.yaml" "deps.yml" "dependencies.yaml" "dependencies.yml"
        \\  "pkgx.yaml" "pkgx.yml" "config/deps.ts" ".config/deps.ts" "pantry.config.ts" ".config/pantry.ts" "pantry.config.js"
        \\  "package.json" "pyproject.toml" "requirements.txt" "Cargo.toml"
        \\  "go.mod" "Gemfile" "deno.json" "composer.json"
        \\)
        \\
        \\# Get file modification time (cross-platform, cached detection)
        \\if stat -f %m / >/dev/null 2>&1; then
        \\  __pantry_mtime() { stat -f %m "$1" 2>/dev/null || echo 0; }
        \\else
        \\  __pantry_mtime() { stat -c %Y "$1" 2>/dev/null || echo 0; }
        \\fi
        \\
        \\# Remove a path component from PATH (pure bash, no sed/subprocess)
        \\__pantry_path_remove() {
        \\  local p=":${PATH}:" remove=":$1:"
        \\  p="${p//$remove/:}"
        \\  p="${p#:}"; p="${p%:}"
        \\  PATH="$p"
        \\}
        \\
        \\# Prepend a directory to PATH, de-duplicating any existing copies (pure bash).
        \\__pantry_path_prepend() {
        \\  local dir="$1"
        \\  [[ -z "$dir" ]] && return 0
        \\  # Strip every existing occurrence of $dir from PATH
        \\  local p=":${PATH}:" remove=":$dir:"
        \\  while [[ "$p" == *"$remove"* ]]; do
        \\    p="${p//$remove/:}"
        \\  done
        \\  p="${p#:}"; p="${p%:}"
        \\  if [[ -n "$p" ]]; then
        \\    PATH="$dir:$p"
        \\  else
        \\    PATH="$dir"
        \\  fi
        \\}
        \\
        \\# Find dependency file in current directory only (fast single-dir check)
        \\__pantry_find_dep_here() {
        \\  local dir="$1"
        \\  for fname in "${__PANTRY_DEP_FILES[@]}"; do
        \\    if [[ -f "$dir/$fname" ]]; then
        \\      echo "$dir/$fname"
        \\      return 0
        \\    fi
        \\  done
        \\  return 1
        \\}
        \\
        \\# Find dependency file walking up parents (max 10 levels)
        \\__pantry_find_dep_file() {
        \\  local dir="$1" depth=0
        \\  while [[ "$dir" != "/" && $depth -lt 10 ]]; do
        \\    for fname in "${__PANTRY_DEP_FILES[@]}"; do
        \\      if [[ -f "$dir/$fname" ]]; then
        \\        echo "$dir/$fname"
        \\        return 0
        \\      fi
        \\    done
        \\    dir="${dir%/*}"
        \\    [[ -z "$dir" ]] && dir="/"
        \\    ((depth++))
        \\  done
        \\  return 1
        \\}
        \\
        \\# Shell-side cache lookup (pure shell, zero subprocesses).
        \\# Format: dir|env_dir|dep_file|mtime|size|last_access (one entry per line)
        \\# The `last_access` field is an integer epoch for LRU-style eviction; on a
        \\# hit we bump it, which pushes the entry to the tail of the file on the
        \\# next write. Entries older than PANTRY_CACHE_MAX_AGE seconds (default 30
        \\# days) are evicted unconditionally.
        \\__pantry_cache_lookup() {
        \\  [[ -f "$__PANTRY_CACHE_FILE" ]] || return 1
        \\  local line cached_dir env_dir dep_file cached_mtime cached_size cached_access
        \\  local target_dir="$1"
        \\  local now; now=$(date +%s 2>/dev/null || echo 0)
        \\  while IFS='|' read -r cached_dir env_dir dep_file cached_mtime cached_size cached_access; do
        \\    [[ "$cached_dir" == "$target_dir" ]] || continue
        \\    # Validate: env bin dir still exists
        \\    [[ -d "$env_dir/bin" ]] || return 1
        \\    # Validate: dep file mtime AND size unchanged (size catches same-second edits)
        \\    if [[ -n "$dep_file" && -f "$dep_file" ]]; then
        \\      [[ "$(__pantry_mtime "$dep_file")" == "$cached_mtime" ]] || return 1
        \\      local cur_size
        \\      cur_size=$(stat -f %z "$dep_file" 2>/dev/null || stat -c %s "$dep_file" 2>/dev/null || echo 0)
        \\      [[ -z "$cached_size" || "$cur_size" == "$cached_size" ]] || return 1
        \\    fi
        \\    REPLY="$env_dir"
        \\    # LRU bump: rewrite this entry with a fresh access timestamp (best-effort).
        \\    __pantry_cache_write "$target_dir" "$env_dir" "${dep_file:-}" "${cached_mtime:-0}" >/dev/null 2>&1 || true
        \\    return 0
        \\  done < "$__PANTRY_CACHE_FILE"
        \\  return 1
        \\}
        \\
        \\# Write/update shell-side cache entry. Implements LRU: on write we re-emit
        \\# all entries (excluding stale ones and the target dir) in access order,
        \\# then append the target dir at the tail with a fresh timestamp. Size is
        \\# capped by PANTRY_CACHE_MAX_ENTRIES (default 100, was 50).
        \\__pantry_cache_write() {
        \\  local dir="$1" env_dir="$2" dep_file="$3" mtime="$4"
        \\  local max_entries="${PANTRY_CACHE_MAX_ENTRIES:-100}"
        \\  local max_age="${PANTRY_CACHE_MAX_AGE:-2592000}" # 30 days
        \\  mkdir -p "${__PANTRY_CACHE_FILE%/*}" 2>/dev/null
        \\  local tmp="${__PANTRY_CACHE_FILE}.$$"
        \\  local now size keep_lines
        \\  now=$(date +%s 2>/dev/null || echo 0)
        \\  if [[ -n "$dep_file" && -f "$dep_file" ]]; then
        \\    size=$(stat -f %z "$dep_file" 2>/dev/null || stat -c %s "$dep_file" 2>/dev/null || echo 0)
        \\  else
        \\    size=0
        \\  fi
        \\  keep_lines=$((max_entries - 1))
        \\  if [[ -f "$__PANTRY_CACHE_FILE" ]]; then
        \\    # Preserve existing entries (dropping stale and the target dir), cap to keep_lines
        \\    while IFS='|' read -r d rest_env rest_dep rest_mtime rest_size rest_access; do
        \\      [[ "$d" == "$dir" ]] && continue
        \\      if [[ -n "$rest_access" && "$rest_access" -gt 0 && $((now - rest_access)) -gt "$max_age" ]]; then
        \\        continue
        \\      fi
        \\      echo "$d|$rest_env|$rest_dep|$rest_mtime|$rest_size|$rest_access"
        \\    done < "$__PANTRY_CACHE_FILE" | tail -n "$keep_lines" > "$tmp"
        \\  fi
        \\  echo "${dir}|${env_dir}|${dep_file}|${mtime}|${size}|${now}" >> "$tmp"
        \\  mv -f "$tmp" "$__PANTRY_CACHE_FILE" 2>/dev/null
        \\}
        \\
        \\# Activate an environment (set PATH + env vars)
        \\__pantry_activate() {
        \\  local env_dir="$1" project_dir="$2" dep_file="$3"
        \\  export PANTRY_CURRENT_PROJECT="$project_dir"
        \\  export PANTRY_ENV_BIN_PATH="$env_dir/bin"
        \\  export PANTRY_ENV_DIR="$env_dir"
        \\  export PANTRY_DEP_FILE="$dep_file"
        \\  export PANTRY_DEP_MTIME="$(__pantry_mtime "$dep_file")"
        \\  # Add env bin to PATH with de-duplication (avoids PATH growing on repeat cds)
        \\  __pantry_path_prepend "$env_dir/bin"
        \\  # Add pantry/.bin if it exists (project-local tool wrappers)
        \\  if [[ -d "$project_dir/pantry/.bin" ]]; then
        \\    export PANTRY_BIN_PATH="$project_dir/pantry/.bin"
        \\    __pantry_path_prepend "$PANTRY_BIN_PATH"
        \\  fi
        \\  export PATH
        \\}
        \\
        \\# Deactivate current environment
        \\__pantry_deactivate() {
        \\  [[ -n "$PANTRY_ENV_BIN_PATH" ]] && __pantry_path_remove "$PANTRY_ENV_BIN_PATH"
        \\  [[ -n "$PANTRY_BIN_PATH" ]] && __pantry_path_remove "$PANTRY_BIN_PATH"
        \\  export PATH
        \\  unset PANTRY_CURRENT_PROJECT PANTRY_ENV_BIN_PATH PANTRY_ENV_DIR PANTRY_BIN_PATH PANTRY_DEP_FILE PANTRY_DEP_MTIME
        \\}
        \\
        \\pantry_chpwd() {
        \\  # SUPER FAST: Skip if PWD hasn't changed
        \\  [[ "$__PANTRY_LAST_PWD" == "$PWD" ]] && return 0
        \\  __PANTRY_LAST_PWD="$PWD"
        \\
        \\  # ULTRA FAST: Still in same project (exact match or subdirectory)
        \\  if [[ -n "$PANTRY_CURRENT_PROJECT" ]]; then
        \\    if [[ "$PWD" == "$PANTRY_CURRENT_PROJECT" || "$PWD" == "$PANTRY_CURRENT_PROJECT/"* ]]; then
        \\      # Still in project - check if dep file changed
        \\      if [[ -n "$PANTRY_DEP_FILE" && -f "$PANTRY_DEP_FILE" ]]; then
        \\        local m="$(__pantry_mtime "$PANTRY_DEP_FILE")"
        \\        [[ "$m" == "$PANTRY_DEP_MTIME" ]] && return 0
        \\        # Dep file changed - deactivate and re-detect below
        \\        __pantry_deactivate
        \\      else
        \\        return 0
        \\      fi
        \\    else
        \\      # Left the project - instant deactivation (no subprocess!)
        \\      __pantry_deactivate
        \\      return 0
        \\    fi
        \\  fi
        \\
        \\  # SHELL-SIDE CACHE: Check for this dir first (covers subdirs cached from parent lookups)
        \\  if __pantry_cache_lookup "$PWD"; then
        \\    local dep_file
        \\    dep_file=$(__pantry_find_dep_here "$PWD") || dep_file=""
        \\    __pantry_activate "$REPLY" "$PWD" "${dep_file:-}"
        \\    return 0
        \\  fi
        \\
        \\  # Quick single-dir check: any dep file here?
        \\  local dep_file
        \\  dep_file=$(__pantry_find_dep_here "$PWD")
        \\  if [[ $? -ne 0 ]]; then
        \\    # No dep file in current dir - still check binary (walks parent dirs)
        \\    # but skip if we already checked this dir
        \\    [[ "$__PANTRY_LAST_NO_ENV" == "$PWD" ]] && return 0
        \\  fi
        \\
        \\  # BINARY LOOKUP: Walks up parent dirs, checks Zig-side cache (~50ms, first visit)
        \\  local lookup_result lookup_err lookup_rc
        \\  lookup_err=$(mktemp 2>/dev/null || echo "/tmp/pantry-lookup-err.$$")
        \\  lookup_result=$(pantry shell:lookup "$PWD" 2>"$lookup_err")
        \\  lookup_rc=$?
        \\  if [[ $lookup_rc -eq 0 && -n "$lookup_result" ]]; then
        \\    rm -f "$lookup_err" 2>/dev/null
        \\    local env_dir="${lookup_result%%|*}"
        \\    local project_dir="${lookup_result#*|}"
        \\    if [[ -d "$env_dir/bin" ]]; then
        \\      local mtime="0"
        \\      [[ -n "$dep_file" ]] && mtime="$(__pantry_mtime "$dep_file")"
        \\      __pantry_cache_write "$PWD" "$env_dir" "${dep_file:-}" "$mtime"
        \\      [[ "$PWD" != "$project_dir" ]] && __pantry_cache_write "$project_dir" "$env_dir" "${dep_file:-}" "$mtime"
        \\      __pantry_activate "$env_dir" "${project_dir:-$PWD}" "${dep_file:-}"
        \\      return 0
        \\    fi
        \\  elif [[ $lookup_rc -ne 0 && $lookup_rc -ne 1 ]]; then
        \\    # Non-zero non-"no env" exit → pantry binary crashed. Show the stderr so the
        \\    # user knows why their prompt isn't activating anything. Exit 1 is reserved
        \\    # for "no env found" and is intentionally silent.
        \\    if [[ -s "$lookup_err" ]]; then
        \\      printf 'pantry: shell:lookup failed (exit %d): %s\n' "$lookup_rc" "$(cat "$lookup_err")" >&2
        \\    else
        \\      printf 'pantry: shell:lookup failed (exit %d)\n' "$lookup_rc" >&2
        \\    fi
        \\  fi
        \\  rm -f "$lookup_err" 2>/dev/null
        \\
        \\  # No env found but dep file exists — auto-install.
        \\  # Opt-out: PANTRY_NO_AUTO_INSTALL=1
        \\  # Background:  PANTRY_DEV_INSTALL_BG=1  (prompt returns immediately)
        \\  # Timeout:     PANTRY_DEV_INSTALL_TIMEOUT=<seconds>  (default 120, enforced via `timeout` if present)
        \\  if [[ -n "$dep_file" && -z "$PANTRY_NO_AUTO_INSTALL" ]]; then
        \\    local __pantry_timeout="${PANTRY_DEV_INSTALL_TIMEOUT:-120}"
        \\    if [[ -n "$PANTRY_DEV_INSTALL_BG" ]]; then
        \\      # Background install: don't block the prompt. Write outcome to ~/.pantry/.auto-install.log
        \\      local __pantry_log="${HOME}/.pantry/.auto-install.log"
        \\      mkdir -p "${HOME}/.pantry" 2>/dev/null
        \\      (
        \\        if command -v timeout >/dev/null 2>&1; then
        \\          timeout "$__pantry_timeout" pantry install >>"$__pantry_log" 2>&1
        \\        else
        \\          pantry install >>"$__pantry_log" 2>&1
        \\        fi
        \\      ) &
        \\      disown 2>/dev/null
        \\      printf 'pantry: auto-install started in background (see %s)\n' "$__pantry_log" >&2
        \\    else
        \\      local __pantry_install_rc=0
        \\      if command -v timeout >/dev/null 2>&1; then
        \\        timeout "$__pantry_timeout" pantry install 2>&1
        \\        __pantry_install_rc=$?
        \\        if [[ $__pantry_install_rc -eq 124 ]]; then
        \\          printf 'pantry: auto-install timed out after %ss (set PANTRY_DEV_INSTALL_TIMEOUT or PANTRY_DEV_INSTALL_BG=1)\n' "$__pantry_timeout" >&2
        \\        fi
        \\      else
        \\        pantry install 2>&1
        \\        __pantry_install_rc=$?
        \\      fi
        \\      if [[ $__pantry_install_rc -eq 0 ]]; then
        \\        lookup_result=$(pantry shell:lookup "$PWD" 2>/dev/null)
        \\        if [[ $? -eq 0 && -n "$lookup_result" ]]; then
        \\          local env_dir="${lookup_result%%|*}"
        \\          local project_dir="${lookup_result#*|}"
        \\          if [[ -d "$env_dir/bin" ]]; then
        \\            local mtime="$(__pantry_mtime "$dep_file")"
        \\            __pantry_cache_write "$PWD" "$env_dir" "$dep_file" "$mtime"
        \\            [[ "$PWD" != "$project_dir" ]] && __pantry_cache_write "$project_dir" "$env_dir" "$dep_file" "$mtime"
        \\            __pantry_activate "$env_dir" "${project_dir:-$PWD}" "$dep_file"
        \\            return 0
        \\          fi
        \\        fi
        \\      fi
        \\    fi
        \\  fi
        \\
        \\  # Remember to skip repeated lookups
        \\  __PANTRY_LAST_NO_ENV="$PWD"
        \\}
        \\
        \\# Hook registration
        \\if [[ -n "$ZSH_VERSION" ]]; then
        \\  if [[ -z "${chpwd_functions[(r)pantry_chpwd]}" ]]; then
        \\    chpwd_functions+=(pantry_chpwd)
        \\  fi
        \\elif [[ -n "$BASH_VERSION" ]]; then
        \\  [[ "$PROMPT_COMMAND" != *"pantry_chpwd"* ]] && PROMPT_COMMAND="pantry_chpwd;$PROMPT_COMMAND"
        \\fi
        \\
        \\# Add global packages to PATH
        \\[[ -d "$HOME/.local/share/pantry/global/bin" ]] && \
        \\  [[ ":$PATH:" != *":$HOME/.local/share/pantry/global/bin:"* ]] && \
        \\  PATH="$HOME/.local/share/pantry/global/bin:$PATH" && export PATH
        \\
        \\# Run on shell start
        \\pantry_chpwd
        \\
    ;

    // Write to stdout (not stderr!) so eval can capture it
    const stdout_file = std.io.getStdOut();
    try stdout_file.writeAll(shellcode);
    try stdout_file.writeAll("\n");
    _ = allocator;
    return .{ .exit_code = 0 };
}

/// Dev: MD5 command - compute MD5 hash of a file or stdin
pub fn devMd5Command(allocator: std.mem.Allocator, path: []const u8) !CommandResult {
    const is_stdin = std.mem.eql(u8, path, "/dev/stdin");

    var hasher = std.crypto.hash.Md5.init(.{});

    if (is_stdin) {
        // Read from stdin (Zig 0.15 API)
        const stdin_file = std.io.getStdIn();
        var buf: [4096]u8 = undefined;
        while (true) {
            const bytes_read = try stdin_file.read(&buf);
            if (bytes_read == 0) break;
            hasher.update(buf[0..bytes_read]);
        }
    } else {
        // Read from file
        const file = io_helper.cwd().openFile(io_helper.io, path, .{}) catch |err| {
            const msg = try std.fmt.allocPrint(
                allocator,
                "Error: Failed to open file {s}: {}",
                .{ path, err },
            );
            return .{
                .exit_code = 1,
                .message = msg,
            };
        };
        defer file.close(io_helper.io);

        var buf: [4096]u8 = undefined;
        while (true) {
            const bytes_read = try file.read(&buf);
            if (bytes_read == 0) break;
            hasher.update(buf[0..bytes_read]);
        }
    }

    var digest: [16]u8 = undefined;
    hasher.final(&digest);

    // Convert to hex string
    const hex = try string.hashToHex(digest, allocator);
    defer allocator.free(hex);

    style.print("{s}\n", .{hex});

    return .{ .exit_code = 0 };
}

/// Dev: find-project-root command - find project root from a directory
pub fn devFindProjectRootCommand(allocator: std.mem.Allocator, start_dir: []const u8) !CommandResult {
    const detector = @import("../../deps/detector.zig");

    // Try to find a dependency file
    const deps_file = (try detector.findDepsFile(allocator, start_dir)) orelse {
        // No project found
        return .{ .exit_code = 1 };
    };
    defer allocator.free(deps_file.path);

    // Get the directory of the dependency file
    const project_dir = std.fs.path.dirname(deps_file.path) orelse start_dir;

    style.print("{s}\n", .{project_dir});

    return .{ .exit_code = 0 };
}

/// Dev: check-updates command - check for newer pantry version
/// Called in background by shell integration. Writes update info to ~/.pantry/.update-available
pub fn devCheckUpdatesCommand(allocator: std.mem.Allocator) !CommandResult {
    const version_options = @import("version");
    const current_version = version_options.version;

    // Determine update marker file path
    const home = io_helper.getEnvVarOwned(allocator, "HOME") catch {
        return .{ .exit_code = 0 };
    };
    defer allocator.free(home);

    const marker_path = try std.fmt.allocPrint(allocator, "{s}/.pantry/.update-available", .{home});
    defer allocator.free(marker_path);

    // Check if we already checked recently (within 24 hours)
    if (io_helper.statFile(marker_path)) |stat| {
        const now_ts = io_helper.clockGettime();
        const now_sec: i128 = @intCast(now_ts.sec);
        const now_ns: i128 = now_sec * 1_000_000_000;
        const file_age_ns = now_ns - stat.mtime;
        const one_day_ns: i128 = 86400 * 1_000_000_000;
        if (file_age_ns < one_day_ns) {
            // Checked less than 24 hours ago, skip
            return .{ .exit_code = 0 };
        }
    } else |_| {}

    // Query npm registry for latest pantry version
    const registry_url = "https://registry.npmjs.org/pantry-cli/latest";
    const response = io_helper.httpGet(allocator, registry_url) catch {
        // Network error - silently skip (this is a background check)
        return .{ .exit_code = 0 };
    };
    defer allocator.free(response);

    // Parse JSON response to get version field
    const parsed = std.json.parseFromSlice(std.json.Value, allocator, response, .{}) catch {
        return .{ .exit_code = 0 };
    };
    defer parsed.deinit();

    if (parsed.value != .object) return .{ .exit_code = 0 };

    const version_val = parsed.value.object.get("version") orelse return .{ .exit_code = 0 };
    if (version_val != .string) return .{ .exit_code = 0 };

    const latest_version = version_val.string;

    // Compare versions - if different and latest is newer, write marker
    if (!std.mem.eql(u8, current_version, latest_version)) {
        // Ensure ~/.pantry directory exists
        const pantry_dir = try std.fmt.allocPrint(allocator, "{s}/.pantry", .{home});
        defer allocator.free(pantry_dir);
        io_helper.makePath(pantry_dir) catch {};

        // Write the latest version to the marker file
        const file = io_helper.createFile(marker_path, .{ .truncate = true }) catch {
            return .{ .exit_code = 0 };
        };
        defer io_helper.closeFile(file);
        io_helper.writeAllToFile(file, latest_version) catch {};
    } else {
        // Up to date - remove marker if it exists
        io_helper.deleteFile(marker_path) catch {};
    }

    return .{ .exit_code = 0 };
}
