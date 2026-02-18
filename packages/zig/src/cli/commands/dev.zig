//! Developer/debugging commands

const std = @import("std");
const io_helper = @import("../../io_helper.zig");
const lib = @import("../../lib.zig");
const common = @import("common.zig");
const style = @import("../style.zig");

const CommandResult = common.CommandResult;
const string = lib.string;

pub fn devShellcodeCommand(allocator: std.mem.Allocator) !CommandResult {
    // Generate minimal, performant shell integration code with instant deactivation
    const shellcode =
        \\
        \\# pantry shell integration - minimal and performant
        \\
        \\# Dependency file names to check (keep in sync with Zig detector)
        \\__LP_DEP_FILES=(
        \\  "config/deps.ts" "pantry.config.ts" "pantry.config.js" "dependencies.yaml" "dependencies.yml"
        \\  "deps.yaml" "deps.yml" "pkgx.yaml" "pkgx.yml" "package.json"
        \\  "pyproject.toml" "requirements.txt" "Cargo.toml" "go.mod" "Gemfile" "deno.json"
        \\)
        \\
        \\# Find dependency file in current directory or parents
        \\__lp_find_dep_file() {
        \\  local dir="$1"
        \\  local depth=0
        \\  local max_depth=10  # Don't search more than 10 levels up
        \\
        \\  while [[ "$dir" != "/" && $depth -lt $max_depth ]]; do
        \\    for fname in "${__LP_DEP_FILES[@]}"; do
        \\      if [[ -f "$dir/$fname" ]]; then
        \\        echo "$dir/$fname"
        \\        return 0
        \\      fi
        \\    done
        \\    dir=$(dirname "$dir")
        \\    ((depth++))
        \\  done
        \\  return 1
        \\}
        \\
        \\# Get file modification time (cross-platform)
        \\__lp_mtime() {
        \\  local f="$1"
        \\  if stat -f %m "$f" >/dev/null 2>&1; then
        \\    stat -f %m "$f"  # macOS/BSD
        \\  elif stat -c %Y "$f" >/dev/null 2>&1; then
        \\    stat -c %Y "$f"  # Linux
        \\  else
        \\    echo 0
        \\  fi
        \\}
        \\
        \\pantry_chpwd() {
        \\  # SUPER FAST: Skip if PWD hasn't changed
        \\  if [[ "$__LP_LAST_PWD" == "$PWD" ]]; then
        \\    return 0
        \\  fi
        \\  export __LP_LAST_PWD="$PWD"
        \\
        \\  # INSTANT DEACTIVATION: Check if we've left a project
        \\  if [[ -n "$pantry_CURRENT_PROJECT" ]]; then
        \\    # We had a project - check if we've left it
        \\    if [[ "$PWD" != "$pantry_CURRENT_PROJECT"* ]]; then
        \\      # Left the project - deactivate instantly (no subprocess calls!)
        \\      if [[ -n "$pantry_ENV_BIN_PATH" ]]; then
        \\        PATH=$(echo "$PATH" | sed "s|$pantry_ENV_BIN_PATH:||g; s|:$pantry_ENV_BIN_PATH||g; s|^$pantry_ENV_BIN_PATH$||g")
        \\        export PATH
        \\      fi
        \\      unset pantry_CURRENT_PROJECT pantry_ENV_BIN_PATH pantry_DEP_FILE pantry_DEP_MTIME
        \\      # IMPORTANT: Return immediately after deactivation - don't search for new projects!
        \\      # Only search when entering a directory, not when leaving
        \\      return 0
        \\    fi
        \\
        \\    # Still in same project - check if dependency file changed
        \\    if [[ -n "$pantry_DEP_FILE" && -f "$pantry_DEP_FILE" ]]; then
        \\      local current_mtime=$(__lp_mtime "$pantry_DEP_FILE")
        \\      if [[ "$current_mtime" != "$pantry_DEP_MTIME" ]]; then
        \\        # Dependency file changed! Force re-activation
        \\        # Deactivate first
        \\        if [[ -n "$pantry_ENV_BIN_PATH" ]]; then
        \\          PATH=$(echo "$PATH" | sed "s|$pantry_ENV_BIN_PATH:||g; s|:$pantry_ENV_BIN_PATH||g; s|^$pantry_ENV_BIN_PATH$||g")
        \\        fi
        \\        unset pantry_CURRENT_PROJECT pantry_ENV_BIN_PATH pantry_DEP_FILE pantry_DEP_MTIME
        \\        # Fall through to re-activation below
        \\      else
        \\        # No changes - skip lookup
        \\        return 0
        \\      fi
        \\    else
        \\      # No dependency file tracked or file deleted - skip lookup
        \\      return 0
        \\    fi
        \\  fi
        \\
        \\  # If we're not in a project, do a quick check before expensive file search
        \\  # Only search for dependency files if we're likely in a project directory
        \\  if [[ -z "$pantry_CURRENT_PROJECT" ]]; then
        \\    # Not in any project - do a fast single-directory check first
        \\    local has_dep_file=0
        \\    for fname in "${__LP_DEP_FILES[@]}"; do
        \\      if [[ -f "$PWD/$fname" ]]; then
        \\        has_dep_file=1
        \\        break
        \\      fi
        \\    done
        \\
        \\    # If no dep file in current dir, don't bother searching parents
        \\    if [[ $has_dep_file -eq 0 ]]; then
        \\      return 0
        \\    fi
        \\  fi
        \\
        \\  # FAST PATH: Check if we have a dependency file (only if needed)
        \\  local dep_file=$(__lp_find_dep_file "$PWD")
        \\  if [[ -z "$dep_file" ]]; then
        \\    # No dependency file found - skip expensive lookup
        \\    return 0
        \\  fi
        \\
        \\  # Not in a project (or dep file changed) - find environment by hash
        \\  # Call Zig binary to get environment path for this project
        \\  local env_lookup
        \\  env_lookup=$(pantry env:lookup "$PWD" 2>/dev/null)
        \\
        \\  if [[ -n "$env_lookup" ]]; then
        \\    # env_lookup format: "env_dir|dep_file"
        \\    local env_dir env_dep_file
        \\    IFS='|' read -r env_dir env_dep_file <<< "$env_lookup"
        \\
        \\    if [[ -d "$env_dir/bin" ]]; then
        \\      # Activate environment
        \\      export PATH="$env_dir/bin:$PATH"
        \\      export pantry_ENV_BIN_PATH="$env_dir/bin"
        \\      export pantry_CURRENT_PROJECT="$PWD"
        \\      export pantry_DEP_FILE="$dep_file"
        \\      export pantry_DEP_MTIME=$(__lp_mtime "$dep_file")
        \\    fi
        \\  else
        \\    # No environment found - auto-install if we have a dep file
        \\    if [[ -n "$dep_file" ]]; then
        \\      if pantry install; then
        \\        # Retry lookup after install
        \\        env_lookup=$(pantry env:lookup "$PWD" 2>/dev/null)
        \\        if [[ -n "$env_lookup" ]]; then
        \\          local env_dir env_dep_file
        \\          IFS='|' read -r env_dir env_dep_file <<< "$env_lookup"
        \\          if [[ -d "$env_dir/bin" ]]; then
        \\            export PATH="$env_dir/bin:$PATH"
        \\            export pantry_ENV_BIN_PATH="$env_dir/bin"
        \\            export pantry_CURRENT_PROJECT="$PWD"
        \\            export pantry_DEP_FILE="$dep_file"
        \\            export pantry_DEP_MTIME=$(__lp_mtime "$dep_file")
        \\          fi
        \\        fi
        \\      fi
        \\    fi
        \\  fi
        \\}
        \\
        \\# Add to chpwd hooks for zsh
        \\if [[ -n "$ZSH_VERSION" ]]; then
        \\  if [[ -z "${chpwd_functions[(r)pantry_chpwd]}" ]]; then
        \\    chpwd_functions+=(pantry_chpwd)
        \\  fi
        \\elif [[ -n "$BASH_VERSION" ]]; then
        \\  # Bash: use PROMPT_COMMAND
        \\  if [[ "$PROMPT_COMMAND" != *"pantry_chpwd"* ]]; then
        \\    PROMPT_COMMAND="pantry_chpwd;$PROMPT_COMMAND"
        \\  fi
        \\fi
        \\
        \\# Run on shell start
        \\pantry_chpwd
        \\
    ;

    // Write to stdout (not stderr!) so eval can capture it
    const stdout_file = std.fs.File{ .handle = std.posix.STDOUT_FILENO };
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
        const stdin_file = std.fs.File{ .handle = std.posix.STDIN_FILENO };
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
        defer file.close();

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
