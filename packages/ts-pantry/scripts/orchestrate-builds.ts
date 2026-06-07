// Build orchestrator: keeps re-dispatching the `Build` workflow at the live
// coverage gap until each platform plateaus, then stops on its own.
//
// Run by .github/workflows/build-orchestrator.yml on a 30-min cron. It exists
// because the Hetzner fleet auto-sweeps continuously (systemd) but CI waves are
// one-shot — without a driver, the darwin / linux-arm64 source gap never closes.
//
// Division of labour (see CLAUDE.md "Cross-platform download fanout"):
//   - linux-x86-64        -> owned by the Hetzner fleet, NOT dispatched here.
//   - linux-arm64         -> ubuntu-24.04-arm runners (cheap/free on public repos).
//   - darwin-arm64/x86-64 -> macos-15 / macos-15-intel (bill 10x — guarded).
//
// Guards that bound macOS spend:
//   - Anti-pileup: if >= RUNNING_CAP `Build` runs are already in_progress, skip
//     this whole cycle and let them drain (no stacking waves).
//   - Plateau: per-platform `missing` count is persisted across runs. If it
//     hasn't dropped for STALL_LIMIT consecutive cycles the remaining gap is the
//     broken-recipe tail (needs recipe-grind, not more runners) — stop
//     dispatching that platform. force=false means runners only build the slice
//     that's actually missing, so a shrinking `missing` is real progress.
//
// State persists via a JSON file the workflow round-trips through actions/cache.

import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'

const REPO = process.env.ORCH_REPO || 'pantry-pm/pantry'
const STATE_PATH = process.env.ORCH_STATE_PATH || 'orchestrator-state.json'
const PACKAGES_API = process.env.ORCH_PACKAGES_API || 'https://registry.pantry.dev/api/packages'
const RUNNING_CAP = Number(process.env.ORCH_RUNNING_CAP || 3)
const STALL_LIMIT = Number(process.env.ORCH_STALL_LIMIT || 3)
const DRY_RUN = process.env.ORCH_DRY_RUN === '1'

const ALL_PLATFORMS = ['darwin-arm64', 'darwin-x86-64', 'linux-x86-64', 'linux-arm64'] as const
type Platform = (typeof ALL_PLATFORMS)[number]

// Per-platform fan-out: [stripes, parallel-workers-per-runner]. linux-arm64 is
// cheap so it gets a wider fan; macOS is throttled to keep the bill sane.
const FANOUT: Record<string, { stripes: number, parallel: number }> = {
  'linux-arm64': { stripes: 4, parallel: 3 },
  'darwin-arm64': { stripes: 3, parallel: 2 },
  'darwin-x86-64': { stripes: 3, parallel: 2 },
}
// Platforms this orchestrator drives (linux-x86-64 is the fleet's job).
const DRIVEN = ['linux-arm64', 'darwin-arm64', 'darwin-x86-64']

interface PkgState { missing: number, stall: number }
type OrchState = Record<string, PkgState>

function loadState(): OrchState {
  if (!existsSync(STATE_PATH))
    return {}
  try { return JSON.parse(readFileSync(STATE_PATH, 'utf8')) }
  catch { return {} }
}

function saveState(s: OrchState): void {
  writeFileSync(STATE_PATH, `${JSON.stringify(s, null, 2)}\n`)
}

async function fetchGap(): Promise<Record<string, number>> {
  const res = await fetch(PACKAGES_API)
  if (!res.ok)
    throw new Error(`packages API ${res.status}`)
  const data = await res.json() as { packages: Array<{ platforms: Record<string, boolean>, supportedPlatforms?: string[] }> }
  const missing: Record<string, number> = { 'linux-arm64': 0, 'darwin-arm64': 0, 'darwin-x86-64': 0 }
  for (const p of data.packages) {
    const sup = p.supportedPlatforms?.length ? p.supportedPlatforms : ALL_PLATFORMS
    for (const plat of DRIVEN) {
      if (sup.includes(plat) && !p.platforms[plat])
        missing[plat]++
    }
  }
  return missing
}

function runningBuilds(): number {
  try {
    const out = execFileSync('gh', [
      'run', 'list', '--repo', REPO, '--workflow', 'Build',
      '--status', 'in_progress', '--json', 'databaseId', '-q', 'length',
    ], { encoding: 'utf8' })
    return Number(out.trim()) || 0
  }
  catch { return 0 }
}

function dispatch(platform: Platform | string, stripe: string, parallel: number): void {
  const args = [
    'workflow', 'run', 'Build', '--repo', REPO,
    '-f', `platform=${platform}`, '-f', `stripe=${stripe}`,
    '-f', `parallel=${parallel}`, '-f', 'force=false', '-f', 'multi_version=false',
  ]
  if (DRY_RUN) {
    console.log(`  [dry-run] gh ${args.join(' ')}`)
    return
  }
  execFileSync('gh', args, { stdio: 'inherit' })
}

async function main(): Promise<void> {
  const prev = loadState()
  const missing = await fetchGap()
  const next: OrchState = {}

  console.log('Coverage gap (missing slots) per driven platform:')
  for (const plat of DRIVEN)
    console.log(`  ${plat}: ${missing[plat]}`)

  // Anti-pileup: don't stack waves on top of still-draining ones.
  const running = runningBuilds()
  console.log(`\nBuild runs in_progress: ${running} (cap ${RUNNING_CAP})`)

  const willDispatch: string[] = []
  for (const plat of DRIVEN) {
    const m = missing[plat]
    const prevM = prev[plat]?.missing
    let stall = prev[plat]?.stall ?? 0

    if (m === 0) {
      console.log(`\n${plat}: COMPLETE (0 missing) — nothing to dispatch.`)
      next[plat] = { missing: 0, stall: 0 }
      continue
    }
    // No progress since last cycle => count a stall.
    if (prevM !== undefined && m >= prevM)
      stall++
    else
      stall = 0
    next[plat] = { missing: m, stall }

    if (stall >= STALL_LIMIT) {
      console.log(`\n${plat}: PLATEAUED (${m} missing, no progress ${stall}x) — remaining gap is the broken-recipe tail; stop dispatching (needs recipe-grind, not runners).`)
      continue
    }
    if (running >= RUNNING_CAP) {
      console.log(`\n${plat}: ${m} missing, but ${running} runs already draining (>= cap) — defer to next cycle.`)
      continue
    }
    willDispatch.push(plat)
  }

  for (const plat of willDispatch) {
    const fan = FANOUT[plat]
    console.log(`\n${plat}: dispatching ${fan.stripes}-way fan-out x parallel ${fan.parallel} (${missing[plat]} missing, stall ${next[plat].stall}/${STALL_LIMIT})`)
    for (let i = 0; i < fan.stripes; i++)
      dispatch(plat, `${i}/${fan.stripes}`, fan.parallel)
  }

  saveState(next)
  console.log('\nState saved.')

  const allDone = DRIVEN.every(p => next[p]?.missing === 0)
  const allStalled = DRIVEN.every(p => next[p]?.missing === 0 || (next[p]?.stall ?? 0) >= STALL_LIMIT)
  if (allDone)
    console.log('::notice::All driven platforms COMPLETE — gap closed.')
  else if (allStalled)
    console.log('::notice::All driven platforms complete-or-plateaued — only the broken-recipe tail remains (recipe-grind, not capacity).')
}

main().catch((e) => {
  console.error('orchestrator error:', e?.message || e)
  process.exit(1)
})
