#!/usr/bin/env bun
/**
 * build-driver — pluggable build-executor for populating the registry.
 *
 * The registry is populated by building packages per-platform and uploading the
 * artifacts to object storage. WHERE that build runs is a swappable "driver":
 *
 *   - github   : dispatch the sync-binaries / build GitHub Actions workflows
 *                (the normal path; free for public repos)
 *   - hetzner  : provision an ephemeral Hetzner Cloud Linux server, build there,
 *                upload to Hetzner Object Storage, then DESTROY the server
 *                (used when Actions is unavailable; Linux only)
 *   - local    : run the build on this machine (used for darwin-arm64 on a Mac)
 *
 * All Hetzner Cloud operations go through ts-cloud's HetznerClient
 * (@stacksjs/ts-cloud) — the same cloud library used everywhere else.
 *
 * The active driver is read from .config/build-driver.json ({"driver":"github"})
 * or the BUILD_DRIVER env var (env wins). Switch back with:
 *   bun scripts/build-driver.ts use github
 *
 * Usage:
 *   bun scripts/build-driver.ts run --platforms linux-x86-64,linux-arm64
 *   bun scripts/build-driver.ts run --driver hetzner --platforms linux-arm64
 *   bun scripts/build-driver.ts use github
 *   bun scripts/build-driver.ts status            # config + any live hetzner build servers
 *   bun scripts/build-driver.ts destroy           # tear down any leftover pantry-build-* servers
 *
 * Hetzner needs an API token: ~/.hcloud-token (preferred), HCLOUD_TOKEN or
 * HETZNER_API_TOKEN. The local SSH key (~/.ssh/id_ed25519) must already be
 * registered in the Hetzner project. Object-storage upload creds come from
 * ~/.pantry-hetzner.env or the STORAGE_PROVIDER / S3_* environment.
 */
import { execFileSync, execSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { HetznerClient, resolveHetznerApiToken } from '@stacksjs/ts-cloud'

const REPO_ROOT = resolve(import.meta.dir, '../../..')
const CONFIG_PATH = join(REPO_ROOT, '.config', 'build-driver.json')
const TS_PANTRY = join(REPO_ROOT, 'packages', 'ts-pantry')

// Hetzner Cloud is Linux only. x86 packages need an x86 instance (cpx/cx/ccx);
// arm64 packages need an Ampere (cax) instance. Ordered by preference — the
// driver tries each in turn and falls through on "type unavailable in location"
// (Hetzner frequently runs arm/large types out of stock).
const SERVER_TYPE_FALLBACK: Record<string, string[]> = {
  'linux-x86-64': ['cpx42', 'cpx52', 'cpx62', 'cx53', 'cx43', 'ccx33', 'ccx43'],
  'linux-arm64': ['cax41', 'cax31', 'cax21'],
}
const HETZNER_LOCATION = process.env.HETZNER_LOCATION || 'fsn1' // co-located with the object storage
const HETZNER_IMAGE = 'ubuntu-24.04'

type DriverName = 'github' | 'hetzner' | 'local'

function log(msg: string): void {
  process.stdout.write(`${new Date().toISOString().slice(11, 19)} ${msg}\n`)
}

function hetzner(): HetznerClient {
  const file = join(homedir(), '.hcloud-token')
  const fileTok = existsSync(file) ? readFileSync(file, 'utf8').trim() : undefined
  return new HetznerClient({ apiToken: resolveHetznerApiToken(fileTok) })
}

// ── config ───────────────────────────────────────────────────────────────────
function readConfig(): { driver: DriverName } {
  if (process.env.BUILD_DRIVER)
    return { driver: process.env.BUILD_DRIVER as DriverName }
  if (existsSync(CONFIG_PATH))
    return JSON.parse(readFileSync(CONFIG_PATH, 'utf8'))
  return { driver: 'github' }
}

function writeConfig(driver: DriverName): void {
  mkdirSync(dirname(CONFIG_PATH), { recursive: true })
  writeFileSync(CONFIG_PATH, `${JSON.stringify({ driver }, null, 2)}\n`)
  log(`build driver set to "${driver}" (${CONFIG_PATH})`)
}

// ── SSH key + server lifecycle (via ts-cloud) ──────────────────────────────────
/** Find the id of the local SSH public key as already registered in Hetzner. */
async function sshKeyId(client: HetznerClient): Promise<number> {
  const pubPath = join(homedir(), '.ssh', 'id_ed25519.pub')
  if (!existsSync(pubPath))
    throw new Error(`SSH public key not found at ${pubPath}`)
  const body = readFileSync(pubPath, 'utf8').trim().split(/\s+/).slice(0, 2).join(' ')
  const keys = await client.listSshKeys()
  const match = keys.find(k => k.public_key.split(/\s+/).slice(0, 2).join(' ') === body)
  if (!match)
    throw new Error('local SSH key (~/.ssh/id_ed25519) is not registered in this Hetzner project — add it in the Hetzner console first')
  return match.id
}

/** Create a server, trying the fallback server types until one has capacity. */
async function createServerWithFallback(client: HetznerClient, platform: string, name: string, keyId: number, override?: string): Promise<{ id: number, ip: string, type: string }> {
  const types = override ? [override] : SERVER_TYPE_FALLBACK[platform]
  let lastErr: Error | undefined
  for (const serverType of types) {
    try {
      log(`${platform}: trying ${serverType} in ${HETZNER_LOCATION}`)
      const { server } = await client.createServer({
        name,
        serverType,
        image: HETZNER_IMAGE,
        location: HETZNER_LOCATION,
        sshKeys: [keyId],
        labels: { purpose: 'pantry-build', platform },
      })
      const running = await client.waitForServerRunning(server.id)
      const ip = running.public_net?.ipv4?.ip
      if (!ip)
        throw new Error('server running but no public IPv4')
      return { id: server.id, ip, type: serverType }
    }
    catch (e) {
      const msg = (e as Error).message
      lastErr = e as Error
      if (/unavailable|unsupported location|resource_unavailable|no available/i.test(msg)) {
        log(`${platform}: ${serverType} unavailable, trying next`)
        continue
      }
      throw e
    }
  }
  throw new Error(`no server type available for ${platform} in ${HETZNER_LOCATION}: ${lastErr?.message}`)
}

// ── ssh / scp helpers (system binaries) ─────────────────────────────────────────
const SSH_OPTS = [
  '-o', 'StrictHostKeyChecking=accept-new',
  '-o', 'UserKnownHostsFile=/dev/null',
  '-o', 'ConnectTimeout=15',
  '-o', 'ServerAliveInterval=30',
  '-o', 'ServerAliveCountMax=10',
  '-i', join(homedir(), '.ssh', 'id_ed25519'),
]
function ssh(ip: string, cmd: string, opts: { quiet?: boolean } = {}): string {
  return execFileSync('ssh', [...SSH_OPTS, `root@${ip}`, cmd], {
    encoding: 'utf8',
    stdio: opts.quiet ? ['ignore', 'pipe', 'ignore'] : ['ignore', 'pipe', 'inherit'],
    maxBuffer: 64 * 1024 * 1024,
  })
}
function scp(localPath: string, ip: string, remotePath: string): void {
  execFileSync('scp', [...SSH_OPTS, localPath, `root@${ip}:${remotePath}`], { stdio: 'inherit' })
}
function sshWriteFile(ip: string, remotePath: string, content: string): void {
  execFileSync('ssh', [...SSH_OPTS, `root@${ip}`, `cat > ${remotePath}`], { input: content, stdio: ['pipe', 'inherit', 'inherit'] })
}

/** Poll until sshd accepts connections on the freshly-booted server. */
async function waitForSsh(ip: string, maxMs = 300000): Promise<void> {
  const start = Date.now()
  while (Date.now() - start < maxMs) {
    try {
      ssh(ip, 'echo ok', { quiet: true })
      return
    }
    catch {
      await Bun.sleep(8000)
    }
  }
  throw new Error('server never became reachable over SSH')
}

/**
 * Run a build script detached on the box (survives SSH drops) and stream its log
 * back by polling byte-offsets, until a done-marker appears or the process exits.
 */
async function runDetachedBuild(ip: string, script: string): Promise<void> {
  sshWriteFile(ip, '/root/pbuild.sh', `${script}\ntouch /var/log/pbuild.done\n`)
  ssh(ip, 'chmod +x /root/pbuild.sh; rm -f /var/log/pbuild.done; setsid bash /root/pbuild.sh >/var/log/pbuild.log 2>&1 </dev/null & echo started', { quiet: true })
  let offset = 0
  for (;;) {
    let chunk = ''
    try {
      chunk = ssh(ip, `tail -c +${offset + 1} /var/log/pbuild.log 2>/dev/null`, { quiet: true })
    }
    catch { /* transient ssh hiccup — retry next tick */ }
    if (chunk) {
      process.stdout.write(chunk)
      offset += Buffer.byteLength(chunk)
    }
    let state = 'RUN'
    try {
      state = ssh(ip, 'if [ -f /var/log/pbuild.done ]; then echo DONE; elif pgrep -f pbuild.sh >/dev/null; then echo RUN; else echo GONE; fi', { quiet: true }).trim()
    }
    catch { /* retry */ }
    if (state === 'DONE' || state === 'GONE')
      return
    await Bun.sleep(15000)
  }
}

function storageEnvFile(): string {
  const f = join(homedir(), '.pantry-hetzner.env')
  if (existsSync(f))
    return f
  const keys = ['STORAGE_PROVIDER', 'S3_BUCKET', 'S3_REGION', 'S3_ENDPOINT', 'S3_ACCESS_KEY_ID', 'S3_SECRET_ACCESS_KEY']
  const lines = keys.filter(k => process.env[k]).map(k => `${k}=${process.env[k]}`)
  if (!lines.some(l => l.startsWith('S3_ACCESS_KEY_ID=')))
    throw new Error('No object-storage creds: provide ~/.pantry-hetzner.env or S3_* env vars')
  const fallback = '/tmp/pantry-storage.env'
  writeFileSync(fallback, `${lines.join('\n')}\n`, { mode: 0o600 })
  return fallback
}

// Combined setup + build, run detached on the box. Setup waits out the boot-time
// apt lock (cloud-init / unattended-upgrades) instead of racing it, and fails
// LOUDLY if the toolchain doesn't come up — the previous silent "|| true" on apt
// let bun go missing and produced an empty no-op build.
const APT_PACKAGES = [
  'build-essential libreadline-dev zlib1g-dev libssl-dev',
  'cmake meson ninja-build patchelf pkg-config',
  'autoconf automake libtool gettext intltool',
  'libffi-dev libexpat1-dev libbz2-dev liblzma-dev libncurses5-dev libsqlite3-dev',
  'python3-venv python3-pip python3-dev',
  'libcurl4-openssl-dev libxml2-dev libonig-dev ruby ruby-dev scons',
  'gperf bison flex texinfo nasm yasm libgmp-dev libmpfr-dev libmpc-dev',
  'libuv1-dev libpcre2-dev libevent-dev libglib2.0-dev libpixman-1-dev',
  'libgit2-dev libssh2-1-dev protobuf-compiler libprotobuf-dev',
  'liblz4-dev libzstd-dev libyaml-dev libedit-dev libelf-dev tcl-dev tk-dev',
  'git curl unzip xz-utils',
].join(' ')

function fullScript(platform: string, force: boolean): string {
  return [
    'set -x',
    'export DEBIAN_FRONTEND=noninteractive',
    'echo "### SETUP: waiting for cloud-init/apt locks to clear"',
    'cloud-init status --wait 2>/dev/null || true',
    // -o Lock::Timeout makes apt WAIT for the boot lock instead of failing.
    'apt-get -o DPkg::Lock::Timeout=600 update',
    `apt-get -o DPkg::Lock::Timeout=600 install -y ${APT_PACKAGES}`,
    'echo "### SETUP: installing bun + rust"',
    'curl -fsSL https://bun.sh/install | bash',
    'export BUN_INSTALL=/root/.bun',
    'export PATH=/root/.bun/bin:/root/.cargo/bin:$PATH',
    'curl --proto "=https" --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --default-toolchain stable',
    'command -v bun >/dev/null || { echo "### FATAL: bun not installed"; exit 1; }',
    'echo "### SETUP: cloning repo"',
    'rm -rf /opt/pantry && git clone --depth 1 https://github.com/home-lang/pantry.git /opt/pantry',
    'cd /opt/pantry && bun install',
    'cd /opt/pantry/packages/ts-pantry',
    'set -a; . /root/.storage.env; set +a',
    'export BUILDKIT_ROOT=/var/buildkit; mkdir -p $BUILDKIT_ROOT',
    `TOTAL=$(bun scripts/build-all-packages.ts --count-only --platform ${platform} 2>/dev/null | tail -1)`,
    '[ -n "$TOTAL" ] || { echo "### FATAL: package count empty (bun/recipe load failed)"; exit 1; }',
    'LAST=$(( (TOTAL - 1) / 50 ))',
    `echo "### building $TOTAL packages for ${platform} in $((LAST+1)) batches"`,
    'for b in $(seq 0 $LAST); do',
    '  echo "### BATCH $b/$LAST $(date -u +%H:%M:%SZ)";',
    `  bun scripts/build-all-packages.ts -b "$S3_BUCKET" -r "$S3_REGION" --platform ${platform} --batch $b --batch-size 50${force ? ' --force' : ''} || true;`,
    '  rm -rf $BUILDKIT_ROOT/* /tmp/buildkit-* 2>/dev/null || true;',
    'done',
    'echo "### ALL BATCHES DONE"',
  ].join('\n')
}

// ── drivers ────────────────────────────────────────────────────────────────────
async function hetznerDriver(platforms: string[], opts: { force?: boolean, serverType?: string, keepServer?: boolean }): Promise<void> {
  const linux = platforms.filter(p => SERVER_TYPE_FALLBACK[p])
  for (const p of platforms.filter(p => !SERVER_TYPE_FALLBACK[p]))
    log(`SKIP ${p}: not a Linux platform Hetzner can build`)
  if (!linux.length)
    throw new Error('hetzner driver builds Linux platforms only (linux-x86-64, linux-arm64)')

  const client = hetzner()
  const keyId = await sshKeyId(client)
  const credsLocal = storageEnvFile()

  for (const platform of linux) {
    const name = `pantry-build-${platform}-${Date.now().toString(36)}`
    let server: { id: number, ip: string, type: string }
    try {
      server = await createServerWithFallback(client, platform, name, keyId, opts.serverType)
    }
    catch (e) {
      log(`SKIP ${platform}: ${(e as Error).message}`)
      continue
    }
    log(`── ${platform}: ${server.type} server ${server.id} running at ${server.ip}; waiting for SSH…`)
    try {
      await waitForSsh(server.ip)
      log(`${platform}: uploading creds + starting setup-and-build (detached)`)
      scp(credsLocal, server.ip, '/root/.storage.env')
      await runDetachedBuild(server.ip, fullScript(platform, !!opts.force))
      log(`${platform}: build finished`)
    }
    finally {
      if (opts.keepServer) {
        log(`${platform}: --keep-server set; leaving server ${server.id} ALIVE (destroy later: build-driver destroy)`)
      }
      else {
        log(`${platform}: destroying server ${server.id}`)
        await client.deleteServer(server.id).catch((e: Error) => log(`WARN: delete failed: ${e.message}`))
      }
    }
  }
}

function githubDriver(platforms: string[], opts: { force?: boolean }): void {
  log('dispatching sync-binaries.yml via gh (builds all configured platforms)')
  const args = ['workflow', 'run', 'sync-binaries.yml']
  if (opts.force)
    args.push('-f', 'force=true')
  execFileSync('gh', args, { stdio: 'inherit', cwd: REPO_ROOT })
  log(`note: github driver builds the workflow's full platform matrix, not just ${platforms.join(',')}`)
}

function localDriver(platforms: string[], opts: { force?: boolean }): void {
  for (const platform of platforms) {
    log(`local build: ${platform}`)
    const env = { ...process.env, BUILDKIT_ROOT: process.env.BUILDKIT_ROOT || '/tmp/pantry-build' }
    const bucket = process.env.S3_BUCKET || 'pantry-registry'
    const region = process.env.S3_REGION || 'fsn1'
    execSync(
      `bun scripts/build-all-packages.ts -b "${bucket}" -r "${region}" --platform ${platform}${opts.force ? ' --force' : ''}`,
      { stdio: 'inherit', cwd: TS_PANTRY, env },
    )
  }
}

// ── CLI ──────────────────────────────────────────────────────────────────────
function parseArgs(argv: string[]): { cmd: string, flags: Record<string, string | boolean> } {
  const [cmd, ...rest] = argv
  const flags: Record<string, string | boolean> = {}
  for (let i = 0; i < rest.length; i++) {
    const a = rest[i]
    if (a.startsWith('--')) {
      const key = a.slice(2)
      const next = rest[i + 1]
      if (next && !next.startsWith('--')) {
        flags[key] = next
        i++
      }
      else { flags[key] = true }
    }
    else if (!flags._positional) {
      flags._positional = a
    }
  }
  return { cmd: cmd || 'status', flags }
}

async function main(): Promise<void> {
  const { cmd, flags } = parseArgs(process.argv.slice(2))

  if (cmd === 'use') {
    const d = flags._positional as DriverName
    if (!['github', 'hetzner', 'local'].includes(d))
      throw new Error('usage: build-driver use <github|hetzner|local>')
    writeConfig(d)
    return
  }

  if (cmd === 'status') {
    log(`active driver: ${readConfig().driver}`)
    try {
      const servers = (await hetzner().listServers()).filter(s => s.labels?.purpose === 'pantry-build')
      if (servers.length)
        servers.forEach(s => log(`  live build server: ${s.name} (${s.id}) ${s.public_net?.ipv4?.ip || ''} ${s.status}`))
      else log('  no live pantry-build servers')
    }
    catch (e) {
      log(`  (hetzner status unavailable: ${(e as Error).message})`)
    }
    return
  }

  if (cmd === 'destroy') {
    const client = hetzner()
    const servers = (await client.listServers()).filter(s => s.labels?.purpose === 'pantry-build')
    if (!servers.length) {
      log('no pantry-build servers to destroy')
      return
    }
    for (const s of servers) {
      log(`destroying ${s.name} (${s.id})`)
      await client.deleteServer(s.id)
    }
    return
  }

  if (cmd === 'run') {
    const driver = (flags.driver as DriverName) || readConfig().driver
    const platforms = ((flags.platforms as string) || '').split(',').map(s => s.trim()).filter(Boolean)
    if (!platforms.length)
      throw new Error('usage: build-driver run --platforms linux-x86-64,linux-arm64 [--driver hetzner] [--force] [--keep-server]')
    const opts = { force: !!flags.force, serverType: flags['server-type'] as string | undefined, keepServer: !!flags['keep-server'] }
    log(`run: driver=${driver} platforms=${platforms.join(',')} force=${!!opts.force}`)
    if (driver === 'hetzner') await hetznerDriver(platforms, opts)
    else if (driver === 'local') localDriver(platforms, opts)
    else githubDriver(platforms, opts)
    return
  }

  throw new Error(`unknown command "${cmd}". Commands: run | use | status | destroy`)
}

main().catch((e) => {
  process.stderr.write(`ERROR: ${(e as Error).message}\n`)
  process.exit(1)
})
