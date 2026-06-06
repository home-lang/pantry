#!/usr/bin/env bun
/**
 * Provision (and tear down) a fleet of persistent Hetzner build-worker boxes that
 * crank through the source-build sweep in parallel, partitioned so no two boxes
 * build the same package. Wraps ts-cloud's HetznerClient — the same cloud library
 * the rest of the repo uses (build-driver.ts, ts-cloud cloud.config).
 *
 * Boxes boot from a snapshot of the already-configured primary build box
 * (toolchains + repo + creds + scripts baked in), so setup is just: git pull,
 * drop a fleet-partitioned build daemon, launch it. ~1 min to building vs ~20 min
 * for a fresh apt bootstrap.
 *
 * Fleet partitioning: the primary box (always-on) plus the elastic workers form a
 * fleet of N boxes. Each box b runs K local workers; build-all-packages is sliced
 * into K*N batches and box b takes batches [b*K, b*K+K). Disjoint, no overlap.
 *
 * Usage:
 *   bun scripts/provision-build-workers.ts up [count]     # default 2 elastic boxes
 *   bun scripts/provision-build-workers.ts down           # destroy elastic boxes
 *   bun scripts/provision-build-workers.ts list           # fleet status
 *   bun scripts/provision-build-workers.ts snapshot       # refresh the template image
 *   bun scripts/provision-build-workers.ts rebalance      # re-partition current fleet
 *
 * Env: HCLOUD token from ~/.hcloud-token (or HETZNER_API_TOKEN). Server type via
 *   WORKER_SERVER_TYPE (default cpx41), location via HETZNER_LOCATION (default the
 *   primary box's), creds from ~/.pantry-hetzner.env.
 */
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { HetznerClient, resolveHetznerApiToken } from '@stacksjs/ts-cloud'

// ── constants ──────────────────────────────────────────────────────────────────
const PRIMARY_ID = 136035759 // pantry-build-x86 — always-on template source
const WORKER_LABEL = 'pantry-build-worker' // label for elastic boxes we manage
const SERVER_TYPE = process.env.WORKER_SERVER_TYPE || 'cpx41'
const LOCATION = process.env.HETZNER_LOCATION || 'ash' // primary lives in ash-dc1
const K_LOCAL = Number(process.env.WORKER_LOCAL_PARALLELISM || 8) // workers per box (≈ vCPUs; most workers skip/download, so this fills cores)
// Build multiple important versions per package (not just latest). Single-version
// work is nearly exhausted on linux-x86-64, leaving the fleet idle-skipping; this
// gives every box a large real backlog and raises coverage. 0/1 = latest only.
const MAX_VERSIONS = Number(process.env.MAX_VERSIONS || 5)
const PLATFORM = process.env.WORKER_PLATFORM || 'linux-x86-64'
// Watchdog caps (minutes). A worker's own BATCH_TIME_BUDGET_MS is 100 min and its
// per-package timeout is 60 min, so a healthy worker exits well under these. These
// are the hard backstop that guarantees a box can never sit with a hung worker for
// hours: kill any single worker older than WATCHDOG_WORKER_MIN, and force-restart
// the whole pass after WATCHDOG_PASS_MIN.
const WATCHDOG_WORKER_MIN = Number(process.env.WATCHDOG_WORKER_MIN || 110)
const WATCHDOG_PASS_MIN = Number(process.env.WATCHDOG_PASS_MIN || 120)

function log(m: string): void { process.stdout.write(`${new Date().toISOString().slice(11, 19)} ${m}\n`) }

function client(): HetznerClient {
  const f = join(homedir(), '.hcloud-token')
  const tok = existsSync(f) ? readFileSync(f, 'utf8').trim() : undefined
  return new HetznerClient({ apiToken: resolveHetznerApiToken(tok) })
}

// ── ssh helpers (system binaries; boxes use the project SSH key) ─────────────────
const SSH_OPTS = [
  '-o', 'StrictHostKeyChecking=accept-new',
  '-o', 'UserKnownHostsFile=/dev/null',
  '-o', 'ConnectTimeout=15',
  '-o', 'ServerAliveInterval=30',
  '-i', join(homedir(), '.ssh', 'id_ed25519'),
]
function ssh(ip: string, cmd: string): string {
  return execFileSync('ssh', [...SSH_OPTS, `root@${ip}`, cmd], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
}
function sshWrite(ip: string, path: string, content: string): void {
  execFileSync('ssh', [...SSH_OPTS, `root@${ip}`, `cat > ${path}`], { input: content, stdio: ['pipe', 'inherit', 'inherit'] })
}
async function waitForSsh(ip: string, maxMs = 300000): Promise<void> {
  const start = Date.now()
  while (Date.now() - start < maxMs) {
    try { ssh(ip, 'echo ok'); return }
    catch { await Bun.sleep(8000) }
  }
  throw new Error(`${ip}: never reachable over SSH`)
}

async function sshKeyId(c: HetznerClient): Promise<number> {
  const pub = join(homedir(), '.ssh', 'id_ed25519.pub')
  if (!existsSync(pub))
    throw new Error(`SSH public key not found at ${pub}`)
  const body = readFileSync(pub, 'utf8').trim().split(/\s+/).slice(0, 2).join(' ')
  const keys = await c.listSshKeys()
  const match = keys.find(k => k.public_key.split(/\s+/).slice(0, 2).join(' ') === body)
  if (!match)
    throw new Error('local SSH key (~/.ssh/id_ed25519) is not registered in this Hetzner project')
  return match.id
}

// ── the fleet-partitioned build daemon written onto each box ─────────────────────
// box b of N runs K local workers; build-all-packages is split into K*N batches
// and this box takes batches [b*K, b*K+K). Loops, auto-pulls, self-cleans deps.
function daemonScript(boxIndex: number, boxCount: number): string {
  return `#!/usr/bin/env bash
set -uo pipefail
PLATFORM=${PLATFORM}
K=${K_LOCAL}
BOX_INDEX=${boxIndex}
BOX_COUNT=${boxCount}
export PATH=/root/.bun/bin:/root/.cargo/bin:/usr/local/go/bin:\$PATH
while true; do
  git -C /root/pantry fetch origin main -q && git -C /root/pantry reset --hard origin/main -q
  /root/.bun/bin/bun install --cwd /root/pantry >/dev/null 2>&1 || true
  cd /root/pantry/packages/ts-pantry
  set -a; source /root/.pantry-hetzner.env; set +a
  STRIPES=\$(( K * BOX_COUNT )); [ "\$STRIPES" -lt 1 ] && STRIPES=1
  echo "\$(date -u +%H:%M:%S) pass: BOX \$BOX_INDEX/\$BOX_COUNT K=\$K STRIPES=\$STRIPES"
  pkill -f "build-all-packages.*\$PLATFORM" 2>/dev/null; sleep 1
  for i in \$(seq 0 \$((K-1))); do
    stripe=\$(( BOX_INDEX * K + i ))   # global worker index across the fleet
    root="/root/pb-\$i"; rm -rf "\$root" 2>/dev/null; mkdir -p "\$root"
    BUILDKIT_ROOT="\$root" nohup bun scripts/build-all-packages.ts \\
      -b "\$S3_BUCKET" -r "\$S3_REGION" --platform "\$PLATFORM" \\
      --stripe "\$stripe/\$STRIPES" \\
      --multi-version --max-versions ${MAX_VERSIONS} \\
      > "/root/sweep-\$PLATFORM-w\$i.log" 2>&1 &
  done
  # Bounded wait: never block forever on a wedged worker. We observed boxes sit
  # IDLE for hours because one hung build-all-packages process kept this loop in
  # the wait below while the other K-1 workers had already exited. Track a pass
  # deadline and a per-worker age cap; when exceeded, SIGKILL the stragglers and
  # start a fresh pass. Worst case the box loses one pass-length, then self-heals.
  PASS_DEADLINE_S=\$(( ${WATCHDOG_PASS_MIN} * 60 ))     # whole-pass cap
  WORKER_MAX_S=\$(( ${WATCHDOG_WORKER_MIN} * 60 ))      # single-worker age cap
  pass_start=\$(date +%s)
  while pgrep -f "build-all-packages.*\$PLATFORM" >/dev/null 2>&1; do
    now=\$(date +%s); elapsed=\$(( now - pass_start ))
    if [ "\$elapsed" -ge "\$PASS_DEADLINE_S" ]; then
      echo "\$(date -u +%H:%M:%S) watchdog: pass exceeded \$PASS_DEADLINE_S s — killing all workers, starting fresh pass"
      pkill -9 -f "build-all-packages.*\$PLATFORM" 2>/dev/null
      break
    fi
    # Kill any individual worker older than WORKER_MAX_S (etimes = elapsed seconds).
    for pid in \$(pgrep -f "build-all-packages.*\$PLATFORM" 2>/dev/null); do
      age=\$(ps -o etimes= -p "\$pid" 2>/dev/null | tr -d ' ')
      [ -n "\$age" ] || continue
      if [ "\$age" -ge "\$WORKER_MAX_S" ]; then
        echo "\$(date -u +%H:%M:%S) watchdog: worker \$pid age \${age}s >= \${WORKER_MAX_S}s — SIGKILL"
        kill -9 "\$pid" 2>/dev/null
        # kill its descendants too (compiler/make/curl left behind)
        pkill -9 -P "\$pid" 2>/dev/null
      fi
    done
    sleep 30
  done
  sleep 20
done
`
}

// disk guard: prune accumulated buildkit-* dirs when the box runs low, and
// self-heal a wedged fleet (a last-resort backstop to the daemon's own watchdog).
const GUARD_SCRIPT = `#!/usr/bin/env bash
# STALL_MIN: if the fleet service is active but no worker log has been written in
# this many minutes, the build pass is wedged in a way the in-loop watchdog isn't
# catching — restart the unit so the box self-heals instead of idling for hours.
STALL_MIN=90
while true; do
  free=\$(df -k / | awk 'NR==2{print int(\$4/1024/1024)}')
  if [ "\${free:-99}" -lt 30 ]; then
    for r in /root/pb-*; do [ -d "\$r" ] || continue
      find "\$r" -maxdepth 1 -type d -mmin +3 \\( -name 'buildkit-deps-*' -o -name 'buildkit-install-*' \\) -exec rm -rf {} + 2>/dev/null
      find "\$r" -maxdepth 1 -type d -name 'buildkit-artifacts-*' -exec rm -rf {} + 2>/dev/null
    done
    rm -rf /root/.cargo/registry/cache/* /root/.cargo/registry/src/* /root/.cache/* /root/.bun/install/cache/* 2>/dev/null
  fi
  # stall detector: fleet active but zero forward progress (no sweep log touched
  # in STALL_MIN minutes) ⇒ restart the fleet daemon.
  if systemctl is-active --quiet pantry-fleet.service; then
    if ls /root/sweep-*.log >/dev/null 2>&1; then
      if [ -z "\$(find /root/sweep-*.log -mmin -\$STALL_MIN 2>/dev/null)" ]; then
        echo "\$(date -u +%H:%M:%S) diskguard: no sweep-log progress in \${STALL_MIN}m — restarting pantry-fleet.service"
        pkill -9 -f 'build-all-packages' 2>/dev/null
        systemctl restart pantry-fleet.service 2>/dev/null || true
      fi
    fi
  fi
  sleep 60
done
`

const FLEET_UNIT = `[Unit]
Description=pantry fleet build daemon
After=network-online.target
[Service]
ExecStart=/root/fleet-daemon.sh
Restart=always
RestartSec=10
[Install]
WantedBy=multi-user.target
`
const GUARD_UNIT = `[Unit]
Description=pantry build-box disk guard
[Service]
ExecStart=/root/box-disk-guard.sh
Restart=always
RestartSec=10
[Install]
WantedBy=multi-user.target
`

// Cross-platform download fanout: a download recipe (distributable:null + a
// build.script that curls a per-platform prebuilt asset) has NO compile step, so
// ANY box can produce the artifact for ANY target platform — it just curls the
// foreign asset and uploads it under that platform's key. build-package skips the
// execution health-check for a foreign target (you can't run a Mach-O on Linux)
// and instead sanity-checks the binary's `file` magic (ELF/Mach-O + arch). This
// lets the x86-64 Linux fleet fill darwin-arm64 / darwin-x86-64 / linux-arm64 for
// every download recipe with no macOS or ARM hardware. Each box is assigned ONE
// foreign platform (partitioned by box index) to avoid redundant racing.
const XDL_PLATFORMS = ['darwin-arm64', 'linux-arm64', 'darwin-x86-64']
const XDL_DAEMON_SCRIPT = `#!/bin/bash
# Cross-platform download fanout: fills prebuilt-download artifacts for one FOREIGN
# target platform from this box. Only download recipes (--download-only); source skipped.
PLAT="\${1:-$(cat /root/xdl-platform 2>/dev/null)}"
[ -z "$PLAT" ] && { echo "no platform (arg or /root/xdl-platform)"; exit 1; }
set -a; . /root/.pantry-hetzner.env 2>/dev/null; set +a
export PATH="/root/.bun/bin:$PATH"
cd /root/pantry/packages/ts-pantry || exit 1
mkdir -p /root/pb-xdl
while true; do
  BUILDKIT_ROOT=/root/pb-xdl /root/.bun/bin/bun scripts/build-all-packages.ts \\
    --platform "$PLAT" --download-only --multi-version --max-versions ${MAX_VERSIONS} \\
    --bucket pantry-registry --region fsn1 >> "/root/xdl-$PLAT.log" 2>&1
  sleep 600
done
`
const XDL_UNIT = `[Unit]
Description=Pantry cross-platform download fanout
After=network-online.target
[Service]
ExecStart=/root/xdl-daemon.sh
Restart=always
RestartSec=30
[Install]
WantedBy=multi-user.target
`

// Dev libs that aren't in the S3 dep registry, so source builds fall back to the
// system copy. Without the -dev packages the fallback has no headers/.pc/.so and
// builds fail (libfido2→libudev, shared-mime-info→glib, yubikey-agent→pcsclite).
const SYSTEM_DEV_LIBS = 'libudev-dev libglib2.0-dev libpcsclite-dev libsystemd-dev libdbus-1-dev '
  + 'libegl-dev libgl-dev libgles-dev libglvnd-dev mesa-common-dev '
  // g++-14: C++23 packages (btop's std::ranges::to etc.) need libstdc++14;
  // gnu.org/gcc@14 isn't in S3 so builds fall back to the system compiler.
  + 'g++-14 gcc-14 '
  + 'python3-dev libcairo2-dev libffi-dev'

function configureBox(ip: string, boxIndex: number, boxCount: number): void {
  log(`  ${ip}: configuring as box ${boxIndex}/${boxCount}`)
  // clear any build cruft inherited from the snapshot, refresh repo
  ssh(ip, 'rm -rf /root/pb-* /root/.cache/* 2>/dev/null; cd /root/pantry && git fetch origin main -q && git reset --hard origin/main -q')
  // ensure system-fallback dev libs are present (idempotent; best-effort)
  try { ssh(ip, `DEBIAN_FRONTEND=noninteractive apt-get install -y -q -o DPkg::Lock::Timeout=120 ${SYSTEM_DEV_LIBS} >/dev/null 2>&1 || true`) }
  catch { /* non-fatal */ }
  // Ensure the build-status reporting token is present in the box env. The
  // snapshot predates the token, so without this every report-build POST 401s and
  // the box builds INVISIBLY (no `hetzner` on the dashboard). Inject it from the
  // local ~/.pantry-hetzner.env (idempotent) so every provision/rebalance is seamless.
  try {
    const localEnv = join(homedir(), '.pantry-hetzner.env')
    const tok = existsSync(localEnv)
      ? (readFileSync(localEnv, 'utf8').match(/^PANTRY_REGISTRY_TOKEN=(.+)$/m)?.[1] || '').trim()
      : ''
    if (tok)
      ssh(ip, `grep -q '^PANTRY_REGISTRY_TOKEN=' /root/.pantry-hetzner.env 2>/dev/null || printf 'PANTRY_REGISTRY_TOKEN=%s\\n' '${tok}' >> /root/.pantry-hetzner.env`)
  }
  catch { /* non-fatal: reporting just stays off if the local token is missing */ }
  sshWrite(ip, '/root/fleet-daemon.sh', daemonScript(boxIndex, boxCount))
  sshWrite(ip, '/root/box-disk-guard.sh', GUARD_SCRIPT)
  sshWrite(ip, '/etc/systemd/system/pantry-fleet.service', FLEET_UNIT)
  sshWrite(ip, '/etc/systemd/system/pantry-diskguard.service', GUARD_UNIT)
  // Cross-platform download fanout: assign this box ONE foreign platform (partitioned
  // by index) and run a download-only sweep for it continuously. Source builds stay on
  // their native channel; only prebuilt-download recipes are fanned out cross-platform.
  const xdlPlatform = XDL_PLATFORMS[boxIndex % XDL_PLATFORMS.length]
  ssh(ip, `printf '%s\\n' '${xdlPlatform}' > /root/xdl-platform`)
  sshWrite(ip, '/root/xdl-daemon.sh', XDL_DAEMON_SCRIPT)
  sshWrite(ip, '/etc/systemd/system/pantry-xdl.service', XDL_UNIT)
  // Manage everything via systemd so it survives reboots and there is ONE daemon.
  // The snapshot bakes in pantry-sweep.service (the OLD full-set daemon); it must
  // be stopped+disabled or it respawns overlapping workers and wins.
  // Every step is best-effort (`|| true`) so a single failure — e.g. a transient
  // chmod hiccup during a live rebalance — can NEVER abort the daemon-reload +
  // enable/restart that actually brings the box back. chmod each file
  // independently so a missing/locked file doesn't take the other down with it.
  // The trailing `is-active` is the one diagnostic we DO want a real exit code on.
  ssh(ip, [
    'chmod +x /root/fleet-daemon.sh || true',
    'chmod +x /root/box-disk-guard.sh || true',
    'systemctl disable --now pantry-sweep.service 2>/dev/null || true',
    'pkill -9 -f "sweep-daemon.sh|xorg-loop.sh|build-all-packages" 2>/dev/null || true',
    'sleep 1',
    'systemctl daemon-reload || true',
    'systemctl enable --now pantry-diskguard.service || true',
    'systemctl enable pantry-fleet.service || true',
    'systemctl restart pantry-fleet.service || true',
    'chmod +x /root/xdl-daemon.sh || true',
    'systemctl reset-failed pantry-xdl.service 2>/dev/null || true',
    'systemctl enable pantry-xdl.service || true',
    'systemctl restart pantry-xdl.service || true',
    'sleep 2',
    'systemctl is-active pantry-fleet.service',
  ].join('\n'))
}

// ── image (snapshot) discovery ───────────────────────────────────────────────────
async function templateImageId(c: HetznerClient): Promise<number> {
  // listImages isn't in the typed client; hit the API directly with its token.
  const tok = (c as any).apiToken || (existsSync(join(homedir(), '.hcloud-token')) ? readFileSync(join(homedir(), '.hcloud-token'), 'utf8').trim() : '')
  const r = await fetch('https://api.hetzner.cloud/v1/images?type=snapshot', { headers: { Authorization: `Bearer ${tok}` } })
  const d: any = await r.json()
  const imgs = (d.images || []).filter((i: any) => i.labels?.role === 'pantry-build' || /pantry-build-worker/.test(i.description || ''))
  const ready = imgs.filter((i: any) => i.status === 'available').sort((a: any, b: any) => (b.created || '').localeCompare(a.created || ''))
  if (!ready.length) {
    const creating = imgs.find((i: any) => i.status === 'creating')
    if (creating)
      throw new Error(`template snapshot still creating (image ${creating.id}); re-run when available`)
    throw new Error('no pantry-build snapshot image found — run: provision-build-workers.ts snapshot')
  }
  return ready[0].id
}

async function elasticServers(c: HetznerClient): Promise<Array<{ id: number, ip: string, name: string }>> {
  const servers = await c.listServers()
  return servers
    .filter(s => s.labels?.purpose === WORKER_LABEL)
    .map(s => ({ id: s.id, ip: s.public_net?.ipv4?.ip || '', name: s.name }))
}

// The always-on primary box may have been torn down (cost saving). Only include
// it in the fleet if a server with PRIMARY_ID actually still exists, otherwise
// the elastic boxes ARE the whole fleet (and rebalance must not SSH a dead IP).
async function primaryBox(c: HetznerClient): Promise<{ ip: string, name: string } | null> {
  try {
    const servers = await c.listServers()
    const p = servers.find(s => s.id === PRIMARY_ID)
    const ip = p?.public_net?.ipv4?.ip
    return ip ? { ip, name: `primary (${PRIMARY_ID})` } : null
  }
  catch { return null }
}

// ── commands ─────────────────────────────────────────────────────────────────────
async function up(count: number): Promise<void> {
  const c = client()
  const imageId = await templateImageId(c)
  const keyId = await sshKeyId(c)
  log(`booting ${count} worker(s) from snapshot image ${imageId} (${SERVER_TYPE} @ ${LOCATION})`)
  const stamp = Date.now().toString(36)
  const created: Array<{ id: number, ip: string }> = []
  for (let i = 0; i < count; i++) {
    const name = `pantry-build-worker-${stamp}-${i}`
    const { server } = await c.createServer({
      name,
      serverType: SERVER_TYPE,
      image: String(imageId) as any, // numeric snapshot id; sent through verbatim
      location: LOCATION,
      sshKeys: [keyId],
      labels: { purpose: WORKER_LABEL, platform: PLATFORM },
    })
    const running = await c.waitForServerRunning(server.id)
    const ip = running.public_net?.ipv4?.ip
    if (!ip) throw new Error(`${name}: running but no public IPv4`)
    log(`  created ${name} (${ip})`)
    created.push({ id: server.id, ip })
  }
  for (const s of created) await waitForSsh(s.ip)
  await rebalance() // partition the whole fleet (primary + all elastic)
  log(`✓ ${count} worker(s) up and building. Fleet rebalanced.`)
}

async function rebalance(): Promise<void> {
  const c = client()
  const elastic = (await elasticServers(c)).filter(s => s.ip)
  // fleet = primary (index 0, only if it still exists) + elastic boxes
  const primary = await primaryBox(c)
  const fleet = [...(primary ? [primary] : []), ...elastic.map(e => ({ ip: e.ip, name: e.name }))]
  log(`rebalancing fleet of ${fleet.length} box(es) (K=${K_LOCAL} → ${fleet.length * K_LOCAL} partitions)`)
  for (let i = 0; i < fleet.length; i++) {
    try { configureBox(fleet[i].ip, i, fleet.length) }
    catch (e) { log(`  ⚠️  ${fleet[i].ip}: ${(e as Error).message}`) }
  }
}

async function down(): Promise<void> {
  const c = client()
  const elastic = await elasticServers(c)
  if (!elastic.length) { log('no elastic worker boxes to destroy'); return }
  for (const s of elastic) {
    log(`destroying ${s.name} (${s.id})`)
    await c.deleteServer(s.id)
  }
  log(`✓ destroyed ${elastic.length} worker(s). Re-partitioning remaining fleet…`)
  await rebalance()
}

async function list(): Promise<void> {
  const c = client()
  const elastic = await elasticServers(c)
  const primary = await primaryBox(c)
  const fleet = [...(primary ? [primary] : []), ...elastic.map(e => ({ ip: e.ip, name: `${e.name} (${e.id})` }))]
  log(`fleet: ${fleet.length} box(es)`)
  for (const b of fleet) {
    let act = '?'
    try { act = ssh(b.ip, 'echo "$(pgrep -fc build-all-packages) workers, $(df -h / | awk \'NR==2{print $4}\') free"').trim() }
    catch { act = 'unreachable' }
    log(`  ${b.name.padEnd(40)} ${b.ip.padEnd(16)} ${act}`)
  }
}

async function snapshot(): Promise<void> {
  const c = client()
  const tok = (existsSync(join(homedir(), '.hcloud-token')) ? readFileSync(join(homedir(), '.hcloud-token'), 'utf8').trim() : '')
  log(`creating snapshot of primary box ${PRIMARY_ID}…`)
  const r = await fetch(`https://api.hetzner.cloud/v1/servers/${PRIMARY_ID}/actions/create_image`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'snapshot', description: 'pantry-build-worker-template', labels: { role: 'pantry-build' } }),
  })
  const d: any = await r.json()
  if (d.error) throw new Error(d.error.message)
  log(`✓ snapshot image ${d.image?.id} creating (poll: provision-build-workers.ts list once available)`)
}

async function main(): Promise<void> {
  const [cmd, arg] = process.argv.slice(2)
  switch (cmd) {
    case 'up': await up(Number(arg) || 2); break
    case 'down': await down(); break
    case 'list': await list(); break
    case 'snapshot': await snapshot(); break
    case 'rebalance': await rebalance(); break
    default:
      process.stdout.write('usage: provision-build-workers.ts <up [count]|down|list|snapshot|rebalance>\n')
      process.exit(1)
  }
}

main().catch((e) => { process.stderr.write(`error: ${(e as Error).message}\n`); process.exit(1) })
