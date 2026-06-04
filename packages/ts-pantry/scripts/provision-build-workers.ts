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
const K_LOCAL = Number(process.env.WORKER_LOCAL_PARALLELISM || 6) // workers per box
const PLATFORM = process.env.WORKER_PLATFORM || 'linux-x86-64'

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
  TOTAL=\$(bun scripts/build-all-packages.ts -b "\$S3_BUCKET" -r "\$S3_REGION" --platform "\$PLATFORM" --count-only 2>/dev/null | tail -1)
  PARTS=\$(( K * BOX_COUNT )); [ "\$PARTS" -lt 1 ] && PARTS=1
  SIZE=\$(( (TOTAL + PARTS - 1) / PARTS )); [ "\$SIZE" -lt 1 ] && SIZE=1
  echo "\$(date -u +%H:%M:%S) pass: TOTAL=\$TOTAL BOX \$BOX_INDEX/\$BOX_COUNT K=\$K SIZE=\$SIZE"
  pkill -f "build-all-packages.*\$PLATFORM" 2>/dev/null; sleep 1
  for i in \$(seq 0 \$((K-1))); do
    batch=\$(( BOX_INDEX * K + i ))
    root="/root/pb-\$i"; rm -rf "\$root" 2>/dev/null; mkdir -p "\$root"
    BUILDKIT_ROOT="\$root" nohup bun scripts/build-all-packages.ts \\
      -b "\$S3_BUCKET" -r "\$S3_REGION" --platform "\$PLATFORM" \\
      --batch "\$batch" --batch-size "\$SIZE" \\
      > "/root/sweep-\$PLATFORM-w\$i.log" 2>&1 &
  done
  while pgrep -f "build-all-packages.*\$PLATFORM" >/dev/null 2>&1; do sleep 30; done
  sleep 20
done
`
}

// disk guard: prune accumulated buildkit-* dirs when the box runs low.
const GUARD_SCRIPT = `#!/usr/bin/env bash
while true; do
  free=\$(df -k / | awk 'NR==2{print int(\$4/1024/1024)}')
  if [ "\${free:-99}" -lt 30 ]; then
    for r in /root/pb-*; do [ -d "\$r" ] || continue
      find "\$r" -maxdepth 1 -type d -mmin +3 \\( -name 'buildkit-deps-*' -o -name 'buildkit-install-*' \\) -exec rm -rf {} + 2>/dev/null
      find "\$r" -maxdepth 1 -type d -name 'buildkit-artifacts-*' -exec rm -rf {} + 2>/dev/null
    done
    rm -rf /root/.cargo/registry/cache/* /root/.cargo/registry/src/* /root/.cache/* /root/.bun/install/cache/* 2>/dev/null
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

function configureBox(ip: string, boxIndex: number, boxCount: number): void {
  log(`  ${ip}: configuring as box ${boxIndex}/${boxCount}`)
  // clear any build cruft inherited from the snapshot, refresh repo
  ssh(ip, 'rm -rf /root/pb-* /root/.cache/* 2>/dev/null; cd /root/pantry && git fetch origin main -q && git reset --hard origin/main -q')
  sshWrite(ip, '/root/fleet-daemon.sh', daemonScript(boxIndex, boxCount))
  sshWrite(ip, '/root/box-disk-guard.sh', GUARD_SCRIPT)
  sshWrite(ip, '/etc/systemd/system/pantry-fleet.service', FLEET_UNIT)
  sshWrite(ip, '/etc/systemd/system/pantry-diskguard.service', GUARD_UNIT)
  // Manage everything via systemd so it survives reboots and there is ONE daemon.
  // The snapshot bakes in pantry-sweep.service (the OLD full-set daemon); it must
  // be stopped+disabled or it respawns overlapping workers and wins.
  ssh(ip, [
    'chmod +x /root/fleet-daemon.sh /root/box-disk-guard.sh',
    'systemctl disable --now pantry-sweep.service 2>/dev/null || true',
    'pkill -9 -f "sweep-daemon.sh|xorg-loop.sh|build-all-packages" 2>/dev/null || true',
    'sleep 1',
    'systemctl daemon-reload',
    'systemctl enable --now pantry-diskguard.service',
    'systemctl enable --now pantry-fleet.service',
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

function primaryIp(): string { return process.env.PRIMARY_BUILD_IP || '178.156.228.227' }

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
  // fleet = primary (index 0) + elastic boxes
  const fleet = [{ ip: primaryIp(), name: 'primary' }, ...elastic.map(e => ({ ip: e.ip, name: e.name }))]
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
  const fleet = [{ ip: primaryIp(), name: 'primary (136035759)' }, ...elastic.map(e => ({ ip: e.ip, name: `${e.name} (${e.id})` }))]
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
