//! `pantry registry` — operating a registry you run yourself.
//!
//! Standing up a private registry used to mean a folder of shell scripts that
//! every fork had to keep in sync with the server they drive. It is the same
//! product as `pantry install` and `pantry publish`, so it belongs in the same
//! binary:
//!
//!   pantry registry setup          Provision a box and start the service
//!   pantry registry storage        Point it at an S3-compatible bucket
//!   pantry registry rotate-token   Replace the shared registry token
//!   pantry registry member add     Create an account (signups are closed on
//!                                  a private registry)
//!   pantry registry token issue    Mint a read-only or publish token
//!   pantry registry token revoke   Revoke one
//!   pantry registry info           What a registry says about itself
//!
//! The first three drive the box over SSH; the rest are ordinary HTTPS calls to
//! the registry's admin API, authenticated with the credential `pantry token
//! set` already stores.
//!
//! Where the registry lives comes from flags, then the environment:
//!
//!   PANTRY_REGISTRY_HOST      Hostname of the box (no default — a default
//!                             would point a fork at someone else's server)
//!   PANTRY_REGISTRY_SSH_USER  SSH user (default: root)
//!   PANTRY_REGISTRY_SSH_KEY   Identity file (default: your agent)
//!   PANTRY_REGISTRY_SERVICE   systemd unit (default: pantry-registry)
//!   PANTRY_REGISTRY_ENV_FILE  Unit's EnvironmentFile
//!   PANTRY_REGISTRY_URL       Public URL (default: https://$HOST)

const std = @import("std");
const lib = @import("../../lib.zig");
const io_helper = @import("../../io_helper.zig");
const style = @import("../style.zig");
const common = @import("common.zig");
const token_commands = @import("token.zig");

const CommandResult = common.CommandResult;

pub const default_service = "pantry-registry";
pub const default_env_file = "/opt/pantry-registry/registry.env";
pub const default_repo_path = "/opt/pantry-registry/repo";
pub const default_port = "3000";

// ---------------------------------------------------------------------------
// Where the registry is
// ---------------------------------------------------------------------------

pub const Remote = struct {
    host: []const u8,
    user: []const u8,
    key: ?[]const u8,
    service: []const u8,
    env_file: []const u8,
    url: []const u8,
};

pub const RemoteOptions = struct {
    host: ?[]const u8 = null,
    user: ?[]const u8 = null,
    key: ?[]const u8 = null,
    service: ?[]const u8 = null,
    env_file: ?[]const u8 = null,
    url: ?[]const u8 = null,
};

pub fn env(arena: std.mem.Allocator, name: []const u8) ?[]const u8 {
    const value = io_helper.getEnvVarOwned(arena, name) catch return null;
    if (value.len == 0) return null;
    return value;
}

fn pick(arena: std.mem.Allocator, flag: ?[]const u8, names: []const []const u8, fallback: ?[]const u8) ?[]const u8 {
    if (flag) |v| {
        if (v.len > 0) return v;
    }
    for (names) |name| {
        if (env(arena, name)) |v| return v;
    }
    return fallback;
}

const missing_host_message =
    \\Error: no registry host.
    \\
    \\Point it at your own box:
    \\
    \\  pantry registry setup --host registry.example.com --repo https://github.com/you/your-fork
    \\
    \\or export PANTRY_REGISTRY_HOST. There is deliberately no default — one
    \\would mean a fork that forgets this reconfigures someone else's server.
;

fn resolveRemote(arena: std.mem.Allocator, opts: RemoteOptions) ?Remote {
    const host = pick(arena, opts.host, &.{ "PANTRY_REGISTRY_HOST", "REGISTRY_HOST" }, null) orelse return null;
    const url = pick(arena, opts.url, &.{"PANTRY_REGISTRY_URL"}, null) orelse
        (std.fmt.allocPrint(arena, "https://{s}", .{host}) catch return null);

    return .{
        .host = host,
        .user = pick(arena, opts.user, &.{ "PANTRY_REGISTRY_SSH_USER", "SSH_USER" }, "root").?,
        .key = pick(arena, opts.key, &.{ "PANTRY_REGISTRY_SSH_KEY", "SSH_KEY" }, null),
        .service = pick(arena, opts.service, &.{"PANTRY_REGISTRY_SERVICE"}, default_service).?,
        .env_file = pick(arena, opts.env_file, &.{"PANTRY_REGISTRY_ENV_FILE"}, default_env_file).?,
        .url = std.mem.trimEnd(u8, url, "/"),
    };
}

// ---------------------------------------------------------------------------
// Talking to the box
// ---------------------------------------------------------------------------

fn sshExec(arena: std.mem.Allocator, r: Remote, command: []const u8) !io_helper.ChildRunResult {
    var argv: std.ArrayList([]const u8) = .empty;
    try argv.appendSlice(arena, &.{ "ssh", "-o", "StrictHostKeyChecking=no", "-o", "ConnectTimeout=20" });
    if (r.key) |key| try argv.appendSlice(arena, &.{ "-i", key });
    try argv.append(arena, try std.fmt.allocPrint(arena, "{s}@{s}", .{ r.user, r.host }));
    try argv.append(arena, command);
    return io_helper.childRun(arena, argv.items);
}

fn exitedZero(result: io_helper.ChildRunResult) bool {
    return switch (result.term) {
        .exited => |code| code == 0,
        else => false,
    };
}

/// Run a multi-line script on the box with positional arguments.
///
/// The script travels base64-encoded in the command line rather than on the
/// child's stdin: it survives quoting intact, and one `ssh` invocation either
/// applies the whole thing or none of it. A half-applied provision — unit
/// installed, environment file missing — is harder to reason about than a
/// failure that changed nothing.
fn sshScript(arena: std.mem.Allocator, r: Remote, script: []const u8, args: []const []const u8) !io_helper.ChildRunResult {
    const Encoder = std.base64.standard.Encoder;
    const encoded = try arena.alloc(u8, Encoder.calcSize(script.len));
    _ = Encoder.encode(encoded, script);

    var command: std.ArrayList(u8) = .empty;
    try command.appendSlice(arena, "printf %s ");
    try command.appendSlice(arena, encoded);
    try command.appendSlice(arena, " | base64 -d | bash -s --");
    for (args) |arg| {
        try command.append(arena, ' ');
        try appendShellQuoted(&command, arena, arg);
    }

    return sshExec(arena, r, command.items);
}

/// Single-quote a value for a POSIX shell: everything inside is literal, and an
/// embedded quote closes, escapes, and reopens.
fn appendShellQuoted(out: *std.ArrayList(u8), arena: std.mem.Allocator, value: []const u8) !void {
    try out.append(arena, '\'');
    for (value) |c| {
        if (c == '\'') {
            try out.appendSlice(arena, "'\\''");
        } else {
            try out.append(arena, c);
        }
    }
    try out.append(arena, '\'');
}

/// Set KEY=VALUE pairs in the unit's EnvironmentFile.
///
/// The values go in the EnvironmentFile rather than as `Environment=` lines in
/// the unit: systemd applies directives in order, so unit lines above an
/// `EnvironmentFile=` are overridden by it. Tools that wrote the unit appeared
/// to succeed — service restarted, no error — while changing nothing the
/// process actually read.
const set_env_script =
    \\set -euo pipefail
    \\env_file="$1"; shift
    \\if [ ! -f "$env_file" ]; then
    \\  echo "Error: $env_file not found on the registry host." >&2
    \\  echo "Is the registry deployed here, and is --env-file correct?" >&2
    \\  exit 1
    \\fi
    \\cp "$env_file" "$env_file.bak.$(date -u +%Y%m%d%H%M%S)"
    \\for pair in "$@"; do
    \\  key="${pair%%=*}"
    \\  value="${pair#*=}"
    \\  if grep -q "^${key}=" "$env_file"; then
    \\    # awk, not sed: the value can contain slashes and other characters
    \\    # that would need escaping in a sed replacement.
    \\    awk -v k="$key" -v v="$value" \
    \\      'BEGIN{done=0} $0 ~ "^"k"=" {print k"="v; done=1; next} {print} END{if(!done) print k"="v}' \
    \\      "$env_file" > "$env_file.tmp"
    \\    mv "$env_file.tmp" "$env_file"
    \\  else
    \\    printf '%s=%s\n' "$key" "$value" >> "$env_file"
    \\  fi
    \\  # Read every write back before anything restarts on the strength of it.
    \\  if ! grep -qxF "${key}=${value}" "$env_file"; then
    \\    echo "Error: ${key} was not written to $env_file" >&2
    \\    exit 1
    \\  fi
    \\done
    \\chmod 600 "$env_file"
;

fn setEnv(arena: std.mem.Allocator, r: Remote, pairs: []const []const u8) !bool {
    var args: std.ArrayList([]const u8) = .empty;
    try args.append(arena, r.env_file);
    try args.appendSlice(arena, pairs);

    const result = try sshScript(arena, r, set_env_script, args.items);
    if (!exitedZero(result)) {
        if (result.stderr.len > 0) style.print("{s}", .{result.stderr});
        return false;
    }
    return true;
}

fn restart(arena: std.mem.Allocator, r: Remote) !bool {
    const command = try std.fmt.allocPrint(
        arena,
        "systemctl daemon-reload && systemctl restart '{s}' && sleep 2 && systemctl is-active '{s}'",
        .{ r.service, r.service },
    );
    const result = try sshExec(arena, r, command);
    if (!exitedZero(result)) {
        if (result.stderr.len > 0) style.print("{s}", .{result.stderr});
        return false;
    }
    return true;
}

/// Poll the public health endpoint. A restart returns before the process is
/// accepting connections, so a single request races it.
fn waitHealthy(arena: std.mem.Allocator, url: []const u8, attempts: usize) bool {
    const health = std.fmt.allocPrint(arena, "{s}/health", .{url}) catch return false;
    var i: usize = 0;
    while (i < attempts) : (i += 1) {
        if (io_helper.httpRequest(arena, .GET, health, null, &.{})) |res| {
            if (res.status == 200) return true;
        } else |_| {}
        io_helper.sleepMs(3000);
    }
    return false;
}

// ---------------------------------------------------------------------------
// Tokens
// ---------------------------------------------------------------------------

/// A registry token: `ptry_` plus 256 bits of randomness, the same shape the
/// server mints for user API tokens.
fn generateToken(arena: std.mem.Allocator) ![]const u8 {
    var raw: [32]u8 = undefined;
    io_helper.randomBytes(&raw);
    return std.fmt.allocPrint(arena, "ptry_{x}", .{&raw});
}

fn readRemoteToken(arena: std.mem.Allocator, r: Remote) ?[]const u8 {
    const command = std.fmt.allocPrint(
        arena,
        "grep -m1 '^PANTRY_REGISTRY_TOKEN=' '{s}' 2>/dev/null | cut -d= -f2-",
        .{r.env_file},
    ) catch return null;
    const result = sshExec(arena, r, command) catch return null;
    if (!exitedZero(result)) return null;
    const value = std.mem.trim(u8, result.stdout, &std.ascii.whitespace);
    return if (value.len == 0) null else value;
}

/// The credential to authenticate admin API calls with: an explicit --token,
/// else whatever `pantry token set` stored for this registry, else the
/// environment.
pub fn credentialFor(arena: std.mem.Allocator, explicit: ?[]const u8, registry_url: []const u8) ?[]const u8 {
    const resolved = token_commands.resolve(arena, explicit, registry_url, token_commands.default_key) catch return null;
    const found = resolved orelse return null;
    return found.value;
}

// ---------------------------------------------------------------------------
// Admin API over HTTPS
// ---------------------------------------------------------------------------

pub fn appendJsonString(out: *std.ArrayList(u8), arena: std.mem.Allocator, value: []const u8) !void {
    try out.append(arena, '"');
    for (value) |c| {
        switch (c) {
            '"' => try out.appendSlice(arena, "\\\""),
            '\\' => try out.appendSlice(arena, "\\\\"),
            '\n' => try out.appendSlice(arena, "\\n"),
            '\r' => try out.appendSlice(arena, "\\r"),
            '\t' => try out.appendSlice(arena, "\\t"),
            else => {
                if (c < 0x20) {
                    var escape_buf: [6]u8 = undefined;
                    const escaped = try std.fmt.bufPrint(&escape_buf, "\\u{x:0>4}", .{c});
                    try out.appendSlice(arena, escaped);
                } else {
                    try out.append(arena, c);
                }
            },
        }
    }
    try out.append(arena, '"');
}

pub fn adminPost(
    arena: std.mem.Allocator,
    registry_url: []const u8,
    path: []const u8,
    token: []const u8,
    body: []const u8,
) !io_helper.HttpResponse {
    const url = try std.fmt.allocPrint(arena, "{s}{s}", .{ registry_url, path });
    const auth = try std.fmt.allocPrint(arena, "Bearer {s}", .{token});
    const headers = [_]std.http.Header{.{ .name = "Authorization", .value = auth }};
    return io_helper.httpRequest(arena, .POST, url, body, &headers);
}

/// Surface the server's own `error` message rather than a bare status code —
/// it already says whether the token, the payload or the user was the problem.
pub fn apiError(arena: std.mem.Allocator, res: io_helper.HttpResponse) []const u8 {
    var parsed = std.json.parseFromSlice(std.json.Value, arena, res.body, .{ .ignore_unknown_fields = true }) catch
        return std.fmt.allocPrint(arena, "HTTP {d}", .{res.status}) catch "request failed";
    defer parsed.deinit();

    if (parsed.value == .object) {
        if (parsed.value.object.get("error")) |e| {
            if (e == .string)
                return arena.dupe(u8, e.string) catch e.string;
        }
    }
    return std.fmt.allocPrint(arena, "HTTP {d}", .{res.status}) catch "request failed";
}

// ---------------------------------------------------------------------------
// pantry registry setup
// ---------------------------------------------------------------------------

/// Provisioning, in one pass: Bun, the checkout, the environment file, the
/// systemd unit, and a local health check before we claim success.
const provision_script =
    \\set -euo pipefail
    \\repo="$1"; ref="$2"; repo_path="$3"; env_file="$4"; service="$5"; port="$6"; base_url="$7"; visibility="$8"
    \\
    \\command -v git >/dev/null 2>&1 || { echo "Error: git is not installed on the box." >&2; exit 1; }
    \\
    \\if ! command -v bun >/dev/null 2>&1 && [ ! -x /root/.bun/bin/bun ]; then
    \\  echo "    Installing Bun..."
    \\  curl -fsSL https://bun.sh/install | bash >/dev/null
    \\fi
    \\bun_bin="$(command -v bun || echo /root/.bun/bin/bun)"
    \\echo "    Bun: $($bun_bin --version)"
    \\
    \\if ! command -v clamdscan >/dev/null 2>&1 || ! command -v ionice >/dev/null 2>&1 || ! command -v systemd-run >/dev/null 2>&1; then
    \\  command -v apt-get >/dev/null 2>&1 || { echo "Error: clamav-daemon is required and this host has no apt-get." >&2; exit 1; }
    \\  echo "    Installing ClamAV publish-time scanner..."
    \\  DEBIAN_FRONTEND=noninteractive apt-get update -qq
    \\  DEBIAN_FRONTEND=noninteractive apt-get install -y -qq clamav-daemon clamav-freshclam util-linux >/dev/null
    \\fi
    \\clam_conf=/etc/clamav/clamd.conf
    \\[ -f "$clam_conf" ] || { echo "Error: $clam_conf was not installed." >&2; exit 1; }
    \\set_clam() {
    \\  key="$1"; value="$2"
    \\  if grep -Eq "^[#[:space:]]*${key}[[:space:]]+" "$clam_conf"; then
    \\    sed -Ei "s|^[#[:space:]]*${key}[[:space:]]+.*|${key} ${value}|" "$clam_conf"
    \\  else
    \\    printf '%s %s\n' "$key" "$value" >> "$clam_conf"
    \\  fi
    \\}
    \\set_clam TCPAddr 127.0.0.1
    \\set_clam TCPSocket 3310
    \\set_clam StreamMaxLength 2G
    \\set_clam MaxScanSize 8G
    \\set_clam MaxFileSize 2G
    \\set_clam AlertExceedsMax yes
    \\set_clam MaxRecursion 30
    \\# 100000 rejected our largest archives as
    \\# Heuristics.Limits.Exceeded.MaxFiles. Matches setup-clamav, whose
    \\# clamd scans those same artifacts.
    \\set_clam MaxFiles 1000000
    \\# Must not sit below Registry's largest per-artifact scan budget
    \\# (MAX_SCAN_TIMEOUT_MS, 45 min), or the engine aborts scans Registry is
    \\# still waiting for. This was 225s, sized against an HTTP timeout ladder
    \\# that no longer applies now that a scan outlives its request.
    \\set_clam MaxScanTime 2700000
    \\# Moved together with DEFAULT_MAX_CONCURRENT_ISOLATED_SCANS (4); raising
    \\# either alone only queues inside clamd.
    \\set_clam MaxThreads 4
    \\set_clam MaxQueue 8
    \\set_clam ConcurrentDatabaseReload no
    \\clam_capacity_dir=/etc/systemd/system/clamav-daemon.service.d
    \\install -d -m 0755 "$clam_capacity_dir"
    \\clam_capacity_tmp=$(mktemp "$clam_capacity_dir/pantry-registry-capacity.conf.XXXXXX")
    \\cat > "$clam_capacity_tmp" <<'CLAMD_UNIT'
    \\[Service]
    \\Nice=10
    \\CPUSchedulingPolicy=batch
    \\CPUWeight=25
    \\IOSchedulingClass=idle
    \\IOWeight=25
    \\MemoryAccounting=yes
    \\MemoryHigh=55%
    \\MemoryMax=65%
    \\MemorySwapMax=0
    \\OOMScoreAdjust=250
    \\CLAMD_UNIT
    \\clam_cpu_count=$(nproc)
    \\if [ "$clam_cpu_count" -gt 1 ]; then
    \\  printf 'CPUAffinity=1-%s\n' "$((clam_cpu_count - 1))" >> "$clam_capacity_tmp"
    \\fi
    \\mv -f "$clam_capacity_tmp" "$clam_capacity_dir/pantry-registry-capacity.conf"
    \\systemctl daemon-reload
    \\systemctl enable --quiet clamav-freshclam clamav-daemon
    \\systemctl restart clamav-freshclam || true
    \\systemctl restart clamav-daemon
    \\systemctl is-active --quiet clamav-daemon || { echo "Error: clamav-daemon did not start." >&2; exit 1; }
    \\clam_memory_max=$(systemctl show clamav-daemon --property=MemoryMax --value)
    \\clam_swap_max=$(systemctl show clamav-daemon --property=MemorySwapMax --value)
    \\case "$clam_memory_max" in ''|infinity) echo "Error: clamav-daemon memory limit was not applied." >&2; exit 1 ;; esac
    \\[ "$clam_swap_max" = 0 ] || { echo "Error: clamav-daemon swap limit was not applied." >&2; exit 1; }
    \\if [ "$clam_cpu_count" -gt 1 ]; then
    \\  clam_effective_affinity=$(systemctl show clamav-daemon --property=CPUAffinity --value)
    \\  [ -n "$clam_effective_affinity" ] || { echo "Error: clamav-daemon CPU affinity was not applied." >&2; exit 1; }
    \\fi
    \\echo "    clamd resources: cpus=$clam_cpu_count memory_max=$clam_memory_max swap_max=$clam_swap_max"
    \\
    \\if [ -d "$repo_path/.git" ]; then
    \\  echo "    Updating checkout..."
    \\  git -C "$repo_path" fetch --quiet origin "$ref"
    \\  git -C "$repo_path" checkout --quiet "$ref"
    \\  git -C "$repo_path" reset --hard --quiet "origin/$ref"
    \\else
    \\  echo "    Cloning $repo..."
    \\  mkdir -p "$(dirname "$repo_path")"
    \\  git clone --quiet --branch "$ref" "$repo" "$repo_path"
    \\fi
    \\
    \\echo "    Installing dependencies..."
    \\(cd "$repo_path" && "$bun_bin" install --frozen-lockfile >/dev/null 2>&1 || "$bun_bin" install >/dev/null)
    \\(cd "$repo_path" && "$bun_bin" packages/registry/scripts/provision-zig.ts)
    \\echo "    Building production server..."
    \\(cd "$repo_path/packages/registry" && NODE_ENV=production "$bun_bin" run build:server)
    \\
    \\mkdir -p "$(dirname "$env_file")"
    \\[ -f "$env_file" ] || install -m 600 /dev/null "$env_file"
    \\chmod 600 "$env_file"
    \\
    \\set_env() {
    \\  key="$1"; value="$2"
    \\  if grep -q "^${key}=" "$env_file"; then
    \\    awk -v k="$key" -v v="$value" '$0 ~ "^"k"=" {print k"="v; next} {print}' "$env_file" > "$env_file.tmp"
    \\    mv "$env_file.tmp" "$env_file"
    \\  else
    \\    printf '%s=%s\n' "$key" "$value" >> "$env_file"
    \\  fi
    \\}
    \\
    \\set_env PANTRY_ZIG_BIN "$(cat "$repo_path/packages/registry/pantry/registry-zig-path")"
    \\set_env PORT "$port"
    \\set_env BASE_URL "$base_url"
    \\set_env REGISTRY_VISIBILITY "$visibility"
    \\set_env PANTRY_MALWARE_SCANNING required
    \\set_env PANTRY_REQUIRE_MALWARE_SCAN_ATTESTATION true
    \\set_env CLAMD_SOCKET /run/clamav/clamd.ctl
    \\set_env CLAMD_HOST 127.0.0.1
    \\set_env CLAMD_PORT 3310
    \\set_env CLAMD_TIMEOUT_MS 240000
    \\set_env CLAMD_HEALTH_TIMEOUT_MS 5000
    \\set_env CLAMD_MAX_BYTES 4294967296
    \\set_env PANTRY_SCANNER_SYSTEMD_ISOLATION true
    \\set_env PANTRY_SCANNER_WORKER_MEMORY_MAX 1G
    \\# Disk, explicitly: the worker stages each artifact here so an archive
    \\# clamd could not cover in one pass can be re-read member by member. A
    \\# tmpfs /tmp would charge that file to the worker's own MemoryMax.
    \\install -d -m 700 /opt/pantry-registry/scan-scratch
    \\set_env PANTRY_SCANNER_SCRATCH_DIR /opt/pantry-registry/scan-scratch
    \\set_env PANTRY_HTTP_IDLE_TIMEOUT_SECONDS 255
    \\set_env PANTRY_REQUIRE_BINARY_SCAN_ATTESTATION true
    \\if ! grep -q '^PANTRY_BINARY_STAGING_SECRET=' "$env_file"; then
    \\  command -v openssl >/dev/null 2>&1 || { echo "Error: openssl is required to generate the binary staging secret." >&2; exit 1; }
    \\  set_env PANTRY_BINARY_STAGING_SECRET "$(openssl rand -hex 32)"
    \\fi
    \\chmod 600 "$env_file"
    \\
    \\cat > "/etc/systemd/system/${service}.service" <<UNIT
    \\[Unit]
    \\Description=Pantry Registry
    \\Requires=clamav-daemon.service
    \\After=network.target clamav-daemon.service
    \\
    \\[Service]
    \\Type=simple
    \\WorkingDirectory=${repo_path}/packages/registry
    \\EnvironmentFile=${env_file}
    \\Environment=APP_ENV=production
    \\Environment=NODE_ENV=production
    \\ExecStart=${bun_bin} run dist/server.js
    \\Restart=always
    \\RestartSec=5
    \\MemoryAccounting=yes
    \\# Sized above the service's observed working set (~400 MB serving the
    \\# registry and coordinating scans), not below it. A MemoryHigh under the
    \\# floor does not apply back-pressure, it deadlocks: the kernel throttles
    \\# the cgroup to reclaim memory that is live and cannot be given back, and
    \\# the process crawls instead of either working or failing. The scan
    \\# workers were configured that way and wedged at 0.1% CPU for 25 minutes
    \\# at a time.
    \\MemoryHigh=1G
    \\MemoryMax=1536M
    \\
    \\[Install]
    \\WantedBy=multi-user.target
    \\UNIT
    \\
    \\systemctl daemon-reload
    \\systemctl enable --quiet "$service"
    \\systemctl restart "$service"
    \\sleep 2
    \\systemctl is-active "$service"
    \\
    \\for _ in 1 2 3 4 5 6 7 8 9 10; do
    \\  if curl -fsS "http://localhost:${port}/ready" >/dev/null 2>&1; then
    \\    echo "    Local readiness check passed (registry + malware scanner)."
    \\    exit 0
    \\  fi
    \\  sleep 2
    \\done
    \\
    \\echo "Error: the service did not answer /ready on localhost:${port}." >&2
    \\echo "Logs: journalctl -u ${service} -n 50 --no-pager" >&2
    \\exit 1
;

pub const SetupOptions = struct {
    remote: RemoteOptions = .{},
    repo: ?[]const u8 = null,
    ref: ?[]const u8 = null,
    path: ?[]const u8 = null,
    port: ?[]const u8 = null,
    public: bool = false,
    rotate_token: bool = false,
    storage: StorageOptions = .{},
};

pub fn setupCommand(allocator: std.mem.Allocator, opts: SetupOptions) !CommandResult {
    var arena_state = std.heap.ArenaAllocator.init(allocator);
    defer arena_state.deinit();
    const arena = arena_state.allocator();

    const r = resolveRemote(arena, opts.remote) orelse
        return CommandResult.err(allocator, missing_host_message);

    const repo = pick(arena, opts.repo, &.{"PANTRY_REGISTRY_REPO"}, null) orelse gitOriginUrl(arena) orelse
        return CommandResult.err(allocator, "Error: --repo is required (the git URL to deploy), or run from a checkout with an origin remote.");
    const ref = pick(arena, opts.ref, &.{"PANTRY_REGISTRY_REF"}, "main").?;
    const path = pick(arena, opts.path, &.{"PANTRY_REGISTRY_PATH"}, default_repo_path).?;
    const port = pick(arena, opts.port, &.{"PANTRY_REGISTRY_PORT"}, default_port).?;
    const visibility: []const u8 = if (opts.public) "public" else "private";

    style.print("==> Target\n", .{});
    style.print("    Host:       {s}@{s}\n", .{ r.user, r.host });
    style.print("    Repo:       {s} ({s})\n", .{ repo, ref });
    style.print("    Path:       {s}\n", .{path});
    style.print("    URL:        {s}\n", .{r.url});
    style.print("    Visibility: {s}\n", .{visibility});

    style.print("==> Provisioning...\n", .{});
    const provisioned = try sshScript(arena, r, provision_script, &.{ repo, ref, path, r.env_file, r.service, port, r.url, visibility });
    if (provisioned.stdout.len > 0) style.print("{s}", .{provisioned.stdout});
    if (!exitedZero(provisioned)) {
        if (provisioned.stderr.len > 0) style.print("{s}", .{provisioned.stderr});
        return CommandResult.err(allocator, "Provisioning failed. Nothing was started; fix the error above and re-run.");
    }
    style.print("    Provisioned.\n", .{});

    // Storage, if credentials were supplied. Skipped silently otherwise so a
    // re-run to change visibility doesn't need them again.
    if (opts.storage.bucket != null or env(arena, "S3_BUCKET") != null) {
        style.print("==> Configuring object storage...\n", .{});
        var storage_result = try storageCommand(allocator, .{
            .remote = opts.remote,
            .provider = opts.storage.provider,
            .bucket = opts.storage.bucket,
            .region = opts.storage.region,
            .endpoint = opts.storage.endpoint,
            .access_key_id = opts.storage.access_key_id,
            .secret_access_key = opts.storage.secret_access_key,
            .metadata_backend = opts.storage.metadata_backend,
            .quiet_header = true,
        });
        defer storage_result.deinit(allocator);
        if (storage_result.exit_code != 0) {
            if (storage_result.message) |msg| style.print("{s}\n", .{msg});
            return CommandResult.err(allocator, "Storage configuration failed — the service is running, but has nowhere to put tarballs.");
        }
    } else {
        style.print("==> Storage: no bucket given, leaving storage configuration alone.\n", .{});
        style.print("    Run `pantry registry storage` when you have credentials.\n", .{});
    }

    // Token: keep an existing one unless asked to replace it.
    var token: []const u8 = undefined;
    const existing = readRemoteToken(arena, r);
    if (existing != null and !opts.rotate_token) {
        style.print("==> Token: already set, keeping it (--rotate-token replaces it).\n", .{});
        token = existing.?;
    } else {
        style.print("==> Generating registry token...\n", .{});
        token = try generateToken(arena);
        if (!try setEnv(arena, r, &.{try std.fmt.allocPrint(arena, "PANTRY_REGISTRY_TOKEN={s}", .{token})}))
            return CommandResult.err(allocator, "Could not write the token to the registry's environment file.");
        if (!try restart(arena, r))
            return CommandResult.err(allocator, "The token was written but the service did not restart cleanly.");
        style.print("    Written and service restarted.\n", .{});
    }

    // Prove it from the outside. A green local /health only says the process
    // started; it says nothing about TLS, or about whether reads are closed.
    style.print("==> Verifying {s}...\n", .{r.url});
    if (waitHealthy(arena, r.url, 10)) {
        style.print("    Healthy.\n", .{});
    } else {
        style.print("    The process is up locally but the public URL didn't answer.\n", .{});
        style.print("    That is usually TLS: point your proxy at localhost:{s}.\n", .{port});
    }

    if (!opts.public) {
        const probe = try std.fmt.allocPrint(arena, "{s}/packages/any-package", .{r.url});
        const anon = io_helper.httpRequest(arena, .GET, probe, null, &.{}) catch null;
        if (anon) |res| {
            style.print("    Anonymous read: HTTP {d} (expected 401)\n", .{res.status});
            if (res.status != 401) {
                style.print("    WARNING: anonymous reads are NOT refused. Check REGISTRY_VISIBILITY in {s}.\n", .{r.env_file});
            }
        }
    }

    const summary = try std.fmt.allocPrint(arena,
        \\
        \\Done. Your registry is live at {s}.
        \\
        \\Token (store it somewhere safe — it is the admin credential):
        \\
        \\  {s}
        \\
        \\Publish to it:
        \\
        \\  echo '{s}' | pantry token set --registry {s}
        \\  pantry publish --registry {s}
        \\
        \\Install from it (any machine, with a token stored as above):
        \\
        \\  export PANTRY_REGISTRY_URL={s}
        \\  pantry install
        \\
        \\Add a teammate (private registries have signups closed):
        \\
        \\  pantry registry member add dev@yourco.com --password '...' --registry {s}
        \\  pantry registry token issue dev@yourco.com --name laptop --registry {s}
        \\
        \\Terminate TLS in front of the process, e.g. a two-line Caddyfile:
        \\
        \\  {s} {{
        \\    reverse_proxy localhost:{s}
        \\  }}
        \\
        \\More: https://pantry.dev/self-hosting
    , .{ r.url, token, token, r.url, r.url, r.url, r.url, r.url, r.host, port });

    return CommandResult.success(allocator, summary);
}

fn gitOriginUrl(arena: std.mem.Allocator) ?[]const u8 {
    const result = io_helper.childRun(arena, &.{ "git", "remote", "get-url", "origin" }) catch return null;
    if (!exitedZero(result)) return null;
    const trimmed = std.mem.trim(u8, result.stdout, &std.ascii.whitespace);
    return if (trimmed.len == 0) null else trimmed;
}

// ---------------------------------------------------------------------------
// pantry registry storage
// ---------------------------------------------------------------------------

pub const StorageOptions = struct {
    remote: RemoteOptions = .{},
    provider: ?[]const u8 = null,
    bucket: ?[]const u8 = null,
    region: ?[]const u8 = null,
    endpoint: ?[]const u8 = null,
    access_key_id: ?[]const u8 = null,
    secret_access_key: ?[]const u8 = null,
    metadata_backend: ?[]const u8 = null,
    /// Set when called from `setup`, which has already printed a header.
    quiet_header: bool = false,
};

pub fn storageCommand(allocator: std.mem.Allocator, opts: StorageOptions) !CommandResult {
    var arena_state = std.heap.ArenaAllocator.init(allocator);
    defer arena_state.deinit();
    const arena = arena_state.allocator();

    const r = resolveRemote(arena, opts.remote) orelse
        return CommandResult.err(allocator, missing_host_message);

    const provider = pick(arena, opts.provider, &.{"STORAGE_PROVIDER"}, "aws").?;
    const bucket = pick(arena, opts.bucket, &.{"S3_BUCKET"}, null) orelse
        return CommandResult.err(allocator, "Error: --bucket is required (the bucket name on your provider).");
    const region = pick(arena, opts.region, &.{"S3_REGION"}, null) orelse
        return CommandResult.err(allocator, "Error: --region is required (Hetzner: fsn1|nbg1|hel1, Backblaze: e.g. us-west-004, AWS: e.g. us-east-1).");
    const key_id = pick(arena, opts.access_key_id, &.{ "S3_ACCESS_KEY_ID", "HETZNER_S3_ACCESS_KEY_ID", "B2_ACCESS_KEY_ID" }, null) orelse
        return CommandResult.err(allocator, "Error: --access-key-id is required (or set S3_ACCESS_KEY_ID).");
    const secret = pick(arena, opts.secret_access_key, &.{ "S3_SECRET_ACCESS_KEY", "HETZNER_S3_SECRET_ACCESS_KEY", "B2_SECRET_ACCESS_KEY" }, null) orelse
        return CommandResult.err(allocator, "Error: --secret-access-key is required (or set S3_SECRET_ACCESS_KEY).");
    const metadata = pick(arena, opts.metadata_backend, &.{"METADATA_BACKEND"}, "object").?;

    // Derive the endpoint from provider + region unless given. MinIO and other
    // S3-compatible services always need it spelled out.
    const endpoint = pick(arena, opts.endpoint, &.{"S3_ENDPOINT"}, null) orelse blk: {
        if (std.mem.eql(u8, provider, "hetzner"))
            break :blk try std.fmt.allocPrint(arena, "{s}.your-objectstorage.com", .{region});
        if (std.mem.eql(u8, provider, "backblaze"))
            break :blk try std.fmt.allocPrint(arena, "s3.{s}.backblazeb2.com", .{region});
        if (std.mem.eql(u8, provider, "aws"))
            break :blk try std.fmt.allocPrint(arena, "s3.{s}.amazonaws.com", .{region});
        return CommandResult.err(allocator, "Unknown provider — pass --endpoint explicitly (or use hetzner | backblaze | aws).");
    };

    if (!opts.quiet_header) style.print("==> Registry object storage\n", .{});
    style.print("    Host:     {s}\n", .{r.host});
    style.print("    Provider: {s}\n", .{provider});
    style.print("    Bucket:   {s}\n", .{bucket});
    style.print("    Region:   {s}\n", .{region});
    style.print("    Endpoint: {s}\n", .{endpoint});
    style.print("    Metadata: {s}\n", .{metadata});

    const pairs = [_][]const u8{
        try std.fmt.allocPrint(arena, "STORAGE_PROVIDER={s}", .{provider}),
        try std.fmt.allocPrint(arena, "S3_BUCKET={s}", .{bucket}),
        try std.fmt.allocPrint(arena, "S3_REGION={s}", .{region}),
        try std.fmt.allocPrint(arena, "S3_ENDPOINT={s}", .{endpoint}),
        try std.fmt.allocPrint(arena, "METADATA_BACKEND={s}", .{metadata}),
        try std.fmt.allocPrint(arena, "S3_ACCESS_KEY_ID={s}", .{key_id}),
        try std.fmt.allocPrint(arena, "S3_SECRET_ACCESS_KEY={s}", .{secret}),
    };

    style.print("==> Writing configuration to {s}...\n", .{r.env_file});
    if (!try setEnv(arena, r, &pairs))
        return CommandResult.err(allocator, "Could not write the storage configuration.");

    style.print("==> Restarting {s}...\n", .{r.service});
    if (!try restart(arena, r))
        return CommandResult.err(allocator, "Configuration was written but the service did not restart cleanly.");

    if (!waitHealthy(arena, r.url, 8))
        style.print("    Warning: {s}/health did not answer.\n", .{r.url});

    const message = try std.fmt.allocPrint(
        arena,
        "\nDone. The registry now stores objects in {s} ({s} @ {s}).",
        .{ provider, bucket, endpoint },
    );
    return CommandResult.success(allocator, message);
}

// ---------------------------------------------------------------------------
// pantry registry payments
// ---------------------------------------------------------------------------

pub const PaymentsOptions = struct {
    remote: RemoteOptions = .{},
    secret_key: ?[]const u8 = null,
    webhook_secret: ?[]const u8 = null,
    /// The platform's cut of a sale, in basis points (100 = 1%).
    fee_bps: ?[]const u8 = null,
    /// Turn payments off again: paid packages stay priced but nobody can pay.
    disable: bool = false,
};

/// Configure Stripe on the registry box, so publishers can charge for packages.
///
/// The keys go into the same EnvironmentFile as everything else and are never
/// echoed back — a secret key in a terminal scrollback is a secret key in a
/// screen recording.
pub fn paymentsCommand(allocator: std.mem.Allocator, opts: PaymentsOptions) !CommandResult {
    var arena_state = std.heap.ArenaAllocator.init(allocator);
    defer arena_state.deinit();
    const arena = arena_state.allocator();

    const r = resolveRemote(arena, opts.remote) orelse
        return CommandResult.err(allocator, missing_host_message);

    if (opts.disable) {
        style.print("==> Disabling payments on {s}...\n", .{r.host});
        if (!try setEnv(arena, r, &.{ "STRIPE_SECRET_KEY=", "STRIPE_WEBHOOK_SECRET=" }))
            return CommandResult.err(allocator, "Could not clear the Stripe configuration.");
        if (!try restart(arena, r))
            return CommandResult.err(allocator, "Configuration was cleared but the service did not restart cleanly.");
        return CommandResult.success(allocator, "Payments are off. Priced packages stay priced and stay gated — nobody can complete a purchase until you configure Stripe again.");
    }

    const secret = pick(arena, opts.secret_key, &.{"STRIPE_SECRET_KEY"}, null) orelse
        return CommandResult.err(allocator,
            \\Error: --secret-key is required (or set STRIPE_SECRET_KEY).
            \\
            \\From the Stripe dashboard: Developers → API keys → Secret key (sk_live_… or sk_test_…).
        );
    const webhook = pick(arena, opts.webhook_secret, &.{"STRIPE_WEBHOOK_SECRET"}, null) orelse
        return CommandResult.err(allocator,
            \\Error: --webhook-secret is required (or set STRIPE_WEBHOOK_SECRET).
            \\
            \\In Stripe, add an endpoint for `checkout.session.completed` pointing at
            \\<your-registry>/webhooks/stripe, then copy its signing secret (whsec_…).
            \\Without it the registry cannot tell a real payment from a forged one, so
            \\it refuses every webhook — and nobody's purchase would ever land.
        );

    if (!std.mem.startsWith(u8, secret, "sk_") and !std.mem.startsWith(u8, secret, "rk_"))
        return CommandResult.err(allocator, "That doesn't look like a Stripe secret key (expected sk_… or rk_…).");
    if (!std.mem.startsWith(u8, webhook, "whsec_"))
        return CommandResult.err(allocator, "That doesn't look like a Stripe webhook signing secret (expected whsec_…).");

    var pairs: std.ArrayList([]const u8) = .empty;
    try pairs.append(arena, try std.fmt.allocPrint(arena, "STRIPE_SECRET_KEY={s}", .{secret}));
    try pairs.append(arena, try std.fmt.allocPrint(arena, "STRIPE_WEBHOOK_SECRET={s}", .{webhook}));
    if (pick(arena, opts.fee_bps, &.{"PANTRY_PLATFORM_FEE_BPS"}, null)) |fee| {
        _ = std.fmt.parseInt(u32, fee, 10) catch
            return CommandResult.err(allocator, "--fee-bps must be a whole number of basis points (100 = 1%).");
        try pairs.append(arena, try std.fmt.allocPrint(arena, "PANTRY_PLATFORM_FEE_BPS={s}", .{fee}));
    }

    const live = std.mem.startsWith(u8, secret, "sk_live") or std.mem.startsWith(u8, secret, "rk_live");
    style.print("==> Configuring payments on {s} ({s} mode)...\n", .{ r.host, if (live) "live" else "test" });
    if (!try setEnv(arena, r, pairs.items))
        return CommandResult.err(allocator, "Could not write the Stripe configuration.");

    style.print("==> Restarting {s}...\n", .{r.service});
    if (!try restart(arena, r))
        return CommandResult.err(allocator, "Configuration was written but the service did not restart cleanly.");

    if (!waitHealthy(arena, r.url, 8))
        style.print("    Warning: {s}/health did not answer.\n", .{r.url});

    const message = try std.fmt.allocPrint(arena,
        \\
        \\Payments are on ({s} mode).
        \\
        \\Point a Stripe webhook at:
        \\
        \\  {s}/webhooks/stripe        (event: checkout.session.completed)
        \\
        \\Publishers can now price their packages:
        \\
        \\  pantry price set <package> 9.00 --registry {s}
    , .{ if (live) "live" else "test", r.url, r.url });

    return CommandResult.success(allocator, message);
}

// ---------------------------------------------------------------------------
// pantry registry rotate-token
// ---------------------------------------------------------------------------

pub const RotateOptions = struct {
    remote: RemoteOptions = .{},
    /// Repositories whose PANTRY_TOKEN secret should be updated, "owner/name,…".
    repos: ?[]const u8 = null,
};

pub fn rotateTokenCommand(allocator: std.mem.Allocator, opts: RotateOptions) !CommandResult {
    var arena_state = std.heap.ArenaAllocator.init(allocator);
    defer arena_state.deinit();
    const arena = arena_state.allocator();

    const r = resolveRemote(arena, opts.remote) orelse
        return CommandResult.err(allocator, missing_host_message);

    style.print("==> Generating new token...\n", .{});
    const token = try generateToken(arena);
    style.print("    Token: {s}...\n", .{token[0..@min(token.len, 20)]});

    style.print("==> Updating {s}...\n", .{r.host});
    if (!try setEnv(arena, r, &.{try std.fmt.allocPrint(arena, "PANTRY_REGISTRY_TOKEN={s}", .{token})}))
        return CommandResult.err(allocator, "Could not write the new token. Nothing else was changed.");

    style.print("==> Restarting {s}...\n", .{r.service});
    if (!try restart(arena, r))
        return CommandResult.err(allocator, "The token was written but the service did not restart cleanly.");

    // Gate the CI update on the server actually accepting the new value. The
    // alternative — rotating secrets first — breaks every publishing repo at
    // once with nothing to point at.
    style.print("==> Verifying the server accepts it...\n", .{});
    const probe = try std.fmt.allocPrint(arena, "{s}/zig/publish", .{r.url});
    const auth = try std.fmt.allocPrint(arena, "Bearer {s}", .{token});
    const headers = [_]std.http.Header{.{ .name = "Authorization", .value = auth }};

    var accepted = false;
    var attempt: usize = 0;
    while (attempt < 5) : (attempt += 1) {
        if (io_helper.httpRequest(arena, .POST, probe, "{}", &headers)) |res| {
            // Anything but 401 means authentication passed and the server went
            // on to reject the (empty) request on its merits.
            if (res.status != 401 and res.status != 502 and res.status != 503) {
                accepted = true;
                style.print("    Accepted (HTTP {d}).\n", .{res.status});
                break;
            }
        } else |_| {}
        io_helper.sleepMs(3000);
    }

    if (!accepted) {
        return CommandResult.err(allocator,
            \\ERROR: the registry still rejects the new token.
            \\The server is now out of sync with CI. No repository secrets were
            \\updated, so publishing still works on the old token.
        );
    }

    const repos = pick(arena, opts.repos, &.{"PANTRY_TOKEN_REPOS"}, null);
    if (repos == null) {
        const message = try std.fmt.allocPrint(arena,
            \\
            \\Done. Token rotated on {s}:
            \\
            \\  {s}
            \\
            \\No repositories given, so no CI secrets were updated. Pass
            \\--repos "owner/name,..." to update them, or per repo:
            \\
            \\  pantry token set --registry {s} && pantry token sync --repo owner/name
        , .{ r.host, token, r.url });
        return CommandResult.success(allocator, message);
    }

    style.print("==> Updating GitHub secrets...\n", .{});
    var failures: usize = 0;
    var it = std.mem.splitScalar(u8, repos.?, ',');
    while (it.next()) |raw| {
        const repo = std.mem.trim(u8, raw, &std.ascii.whitespace);
        if (repo.len == 0) continue;
        const result = io_helper.childRun(arena, &.{ "gh", "secret", "set", "PANTRY_TOKEN", "--repo", repo, "--body", token }) catch {
            style.print("    Failed: {s} (is the gh CLI installed and authenticated?)\n", .{repo});
            failures += 1;
            continue;
        };
        if (exitedZero(result)) {
            style.print("    Updated: {s}\n", .{repo});
        } else {
            style.print("    Failed:  {s} — {s}\n", .{ repo, std.mem.trim(u8, result.stderr, &std.ascii.whitespace) });
            failures += 1;
        }
    }

    if (failures > 0)
        return CommandResult.err(allocator, "Some repository secrets were not updated. The registry is on the new token — re-run `pantry token sync` for the repos above.");

    const message = try std.fmt.allocPrint(arena, "\nDone. Token rotated on {s} and pushed to CI:\n\n  {s}", .{ r.host, token });
    return CommandResult.success(allocator, message);
}

// ---------------------------------------------------------------------------
// pantry registry member add
// ---------------------------------------------------------------------------

pub const MemberOptions = struct {
    registry: ?[]const u8 = null,
    token: ?[]const u8 = null,
    email: []const u8,
    name: ?[]const u8 = null,
    password: ?[]const u8 = null,
    admin: bool = false,
};

pub fn resolveRegistryUrl(arena: std.mem.Allocator, explicit: ?[]const u8) ?[]const u8 {
    const url = pick(arena, explicit, &.{ "PANTRY_REGISTRY_URL", "PANTRY_REGISTRY_HOST" }, null) orelse return null;
    if (std.mem.indexOf(u8, url, "://") == null)
        return std.fmt.allocPrint(arena, "https://{s}", .{url}) catch null;
    return std.mem.trimEnd(u8, url, "/");
}

pub const missing_registry_message =
    \\Error: no registry URL.
    \\
    \\Pass --registry https://registry.example.com, or export PANTRY_REGISTRY_URL.
;

pub fn missingTokenMessage(arena: std.mem.Allocator, url: []const u8) []const u8 {
    return std.fmt.allocPrint(arena,
        \\Error: no admin credential for {s}.
        \\
        \\Store the registry token first:
        \\
        \\  pantry token set --registry {s}
    , .{ url, url }) catch "Error: no admin credential for this registry.";
}

pub fn memberAddCommand(allocator: std.mem.Allocator, opts: MemberOptions) !CommandResult {
    var arena_state = std.heap.ArenaAllocator.init(allocator);
    defer arena_state.deinit();
    const arena = arena_state.allocator();

    const url = resolveRegistryUrl(arena, opts.registry) orelse
        return CommandResult.err(allocator, missing_registry_message);
    const token = credentialFor(arena, opts.token, url) orelse
        return CommandResult.err(allocator, missingTokenMessage(arena, url));

    const password = opts.password orelse
        return CommandResult.err(allocator, "Error: --password is required (the member can change it after logging in).");
    if (password.len < 8)
        return CommandResult.err(allocator, "Error: the password must be at least 8 characters.");

    var body: std.ArrayList(u8) = .empty;
    try body.appendSlice(arena, "{\"email\":");
    try appendJsonString(&body, arena, opts.email);
    try body.appendSlice(arena, ",\"name\":");
    try appendJsonString(&body, arena, opts.name orelse opts.email);
    try body.appendSlice(arena, ",\"password\":");
    try appendJsonString(&body, arena, password);
    try body.appendSlice(arena, if (opts.admin) ",\"role\":\"admin\"}" else "}");

    const res = adminPost(arena, url, "/admin/users", token, body.items) catch
        return CommandResult.err(allocator, "Could not reach the registry.");

    if (!res.ok())
        return CommandResult.err(allocator, try std.fmt.allocPrint(arena, "Could not create the account: {s}", .{apiError(arena, res)}));

    const message = try std.fmt.allocPrint(arena,
        \\Created {s} on {s}{s}.
        \\
        \\They can log in at {s}/login and manage their own tokens, or you can
        \\issue one for them:
        \\
        \\  pantry registry token issue {s} --name laptop --registry {s}
    , .{ opts.email, url, if (opts.admin) " as an admin" else "", url, opts.email, url });

    return CommandResult.success(allocator, message);
}

// ---------------------------------------------------------------------------
// pantry registry token issue / revoke
// ---------------------------------------------------------------------------

pub const IssueOptions = struct {
    registry: ?[]const u8 = null,
    token: ?[]const u8 = null,
    email: []const u8,
    name: ?[]const u8 = null,
    /// Defaults to read-only: the credential a consumer of a private registry
    /// needs, and nothing more.
    publish: bool = false,
    expires_in_days: ?[]const u8 = null,
};

pub fn tokenIssueCommand(allocator: std.mem.Allocator, opts: IssueOptions) !CommandResult {
    var arena_state = std.heap.ArenaAllocator.init(allocator);
    defer arena_state.deinit();
    const arena = arena_state.allocator();

    const url = resolveRegistryUrl(arena, opts.registry) orelse
        return CommandResult.err(allocator, missing_registry_message);
    const admin = credentialFor(arena, opts.token, url) orelse
        return CommandResult.err(allocator, missingTokenMessage(arena, url));

    var body: std.ArrayList(u8) = .empty;
    try body.appendSlice(arena, "{\"email\":");
    try appendJsonString(&body, arena, opts.email);
    try body.appendSlice(arena, ",\"name\":");
    try appendJsonString(&body, arena, opts.name orelse "issued by pantry");
    try body.appendSlice(arena, ",\"permissions\":");
    try body.appendSlice(arena, if (opts.publish) "[\"publish\",\"read\"]" else "[\"read\"]");
    if (opts.expires_in_days) |days| {
        const parsed = std.fmt.parseInt(u32, days, 10) catch
            return CommandResult.err(allocator, "Error: --expires-in-days must be a number.");
        var days_buf: [32]u8 = undefined;
        try body.appendSlice(arena, try std.fmt.bufPrint(&days_buf, ",\"expiresInDays\":{d}", .{parsed}));
    }
    try body.append(arena, '}');

    const res = adminPost(arena, url, "/admin/tokens", admin, body.items) catch
        return CommandResult.err(allocator, "Could not reach the registry.");

    if (!res.ok())
        return CommandResult.err(allocator, try std.fmt.allocPrint(arena, "Could not issue the token: {s}", .{apiError(arena, res)}));

    var parsed = std.json.parseFromSlice(std.json.Value, arena, res.body, .{ .ignore_unknown_fields = true }) catch
        return CommandResult.err(allocator, "The registry returned a response this version doesn't understand.");
    defer parsed.deinit();

    const issued = if (parsed.value == .object) parsed.value.object.get("token") else null;
    if (issued == null or issued.? != .string)
        return CommandResult.err(allocator, "The registry did not return a token.");

    const id = blk: {
        const info = if (parsed.value == .object) parsed.value.object.get("info") else null;
        if (info) |i| {
            if (i == .object) {
                if (i.object.get("id")) |v| {
                    if (v == .string) break :blk v.string;
                }
            }
        }
        break :blk "";
    };

    // Printed once, because that is all the server keeps — it stores a hash.
    const message = try std.fmt.allocPrint(arena,
        \\Issued a {s} token for {s}. It is shown once:
        \\
        \\  {s}
        \\
        \\On the machine that will use it:
        \\
        \\  export PANTRY_REGISTRY_URL={s}
        \\  echo '{s}' | pantry token set --registry {s}
        \\
        \\Revoke it with:
        \\
        \\  pantry registry token revoke {s} --id {s} --registry {s}
    , .{
        if (opts.publish) "publish" else "read-only",
        opts.email,
        issued.?.string,
        url,
        issued.?.string,
        url,
        opts.email,
        id,
        url,
    });

    return CommandResult.success(allocator, message);
}

pub const RevokeOptions = struct {
    registry: ?[]const u8 = null,
    token: ?[]const u8 = null,
    email: []const u8,
    id: ?[]const u8 = null,
};

pub fn tokenRevokeCommand(allocator: std.mem.Allocator, opts: RevokeOptions) !CommandResult {
    var arena_state = std.heap.ArenaAllocator.init(allocator);
    defer arena_state.deinit();
    const arena = arena_state.allocator();

    const url = resolveRegistryUrl(arena, opts.registry) orelse
        return CommandResult.err(allocator, missing_registry_message);
    const admin = credentialFor(arena, opts.token, url) orelse
        return CommandResult.err(allocator, missingTokenMessage(arena, url));
    const id = opts.id orelse
        return CommandResult.err(allocator, "Error: --id is required (shown when the token was issued, and on the owner's account page).");

    var body: std.ArrayList(u8) = .empty;
    try body.appendSlice(arena, "{\"email\":");
    try appendJsonString(&body, arena, opts.email);
    try body.appendSlice(arena, ",\"id\":");
    try appendJsonString(&body, arena, id);
    try body.append(arena, '}');

    const res = adminPost(arena, url, "/admin/tokens/revoke", admin, body.items) catch
        return CommandResult.err(allocator, "Could not reach the registry.");

    if (!res.ok())
        return CommandResult.err(allocator, try std.fmt.allocPrint(arena, "Could not revoke the token: {s}", .{apiError(arena, res)}));

    const message = try std.fmt.allocPrint(arena, "Revoked {s} for {s}. The next download with it is refused.", .{ id, opts.email });
    return CommandResult.success(allocator, message);
}

// ---------------------------------------------------------------------------
// pantry registry info
// ---------------------------------------------------------------------------

pub fn infoCommand(allocator: std.mem.Allocator, registry: ?[]const u8) !CommandResult {
    var arena_state = std.heap.ArenaAllocator.init(allocator);
    defer arena_state.deinit();
    const arena = arena_state.allocator();

    const url = resolveRegistryUrl(arena, registry) orelse
        return CommandResult.err(allocator, missing_registry_message);

    const endpoint = try std.fmt.allocPrint(arena, "{s}/api/registry-info", .{url});
    const res = io_helper.httpRequest(arena, .GET, endpoint, null, &.{}) catch
        return CommandResult.err(allocator, try std.fmt.allocPrint(arena, "Could not reach {s}.", .{url}));

    if (!res.ok()) {
        // Older registries predate this endpoint; /health still tells us it's alive.
        const health = try std.fmt.allocPrint(arena, "{s}/health", .{url});
        const alive = io_helper.httpRequest(arena, .GET, health, null, &.{}) catch null;
        if (alive != null and alive.?.status == 200)
            return CommandResult.success(allocator, try std.fmt.allocPrint(arena, "{s} is up but does not report its visibility (registry predates /api/registry-info).", .{url}));
        return CommandResult.err(allocator, try std.fmt.allocPrint(arena, "{s} answered HTTP {d}.", .{ url, res.status }));
    }

    var parsed = std.json.parseFromSlice(std.json.Value, arena, res.body, .{ .ignore_unknown_fields = true }) catch
        return CommandResult.err(allocator, "The registry returned a response this version doesn't understand.");
    defer parsed.deinit();

    const visibility = readString(parsed.value, "visibility") orelse "unknown";
    const signups = if (parsed.value == .object) parsed.value.object.get("signupsEnabled") else null;
    const signups_on = signups != null and signups.? == .bool and signups.?.bool;

    const message = try std.fmt.allocPrint(arena,
        \\{s}
        \\  Visibility: {s}
        \\  Reads:      {s}
        \\  Signups:    {s}
    , .{
        url,
        visibility,
        if (std.mem.eql(u8, visibility, "private")) "require a token or session" else "open to anyone",
        if (signups_on) "open" else "closed (members are provisioned by an operator)",
    });

    return CommandResult.success(allocator, message);
}

fn readString(value: std.json.Value, key: []const u8) ?[]const u8 {
    if (value != .object) return null;
    const found = value.object.get(key) orelse return null;
    return if (found == .string) found.string else null;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test "shell quoting keeps a value literal, including quotes" {
    const alloc = std.testing.allocator;
    var out: std.ArrayList(u8) = .empty;
    defer out.deinit(alloc);

    try appendShellQuoted(&out, alloc, "plain");
    try std.testing.expectEqualStrings("'plain'", out.items);

    out.clearRetainingCapacity();
    try appendShellQuoted(&out, alloc, "it's; rm -rf /");
    try std.testing.expectEqualStrings("'it'\\''s; rm -rf /'", out.items);
}

test "json strings escape quotes, backslashes and control characters" {
    const alloc = std.testing.allocator;
    var out: std.ArrayList(u8) = .empty;
    defer out.deinit(alloc);

    try appendJsonString(&out, alloc, "pa\"ss\\word\n");
    try std.testing.expectEqualStrings("\"pa\\\"ss\\\\word\\n\"", out.items);
}

test "a generated token looks like a registry token" {
    var arena_state = std.heap.ArenaAllocator.init(std.testing.allocator);
    defer arena_state.deinit();
    const arena = arena_state.allocator();

    const a = try generateToken(arena);
    const b = try generateToken(arena);
    try std.testing.expect(std.mem.startsWith(u8, a, "ptry_"));
    try std.testing.expectEqual(@as(usize, 5 + 64), a.len);
    try std.testing.expect(!std.mem.eql(u8, a, b));
}

test "a registry URL is normalised, and a bare host gets a scheme" {
    var arena_state = std.heap.ArenaAllocator.init(std.testing.allocator);
    defer arena_state.deinit();
    const arena = arena_state.allocator();

    try std.testing.expectEqualStrings("https://r.example.com", resolveRegistryUrl(arena, "https://r.example.com/").?);
    try std.testing.expectEqualStrings("https://r.example.com", resolveRegistryUrl(arena, "r.example.com").?);
    try std.testing.expectEqualStrings("http://localhost:3000", resolveRegistryUrl(arena, "http://localhost:3000").?);
}
