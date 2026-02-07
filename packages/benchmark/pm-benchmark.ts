#!/usr/bin/env bun

import { bench, group, run, summary } from 'mitata'
import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { execSync } from 'node:child_process'

// ── Types ──────────────────────────────────────────────────────────────────

interface PackageManager {
  name: string
  install: string
  lockfiles: string[]
  cacheClear: string
}

// ── Package Manager Definitions ────────────────────────────────────────────

const HOME = process.env.HOME ?? '~'

const ALL_MANAGERS: PackageManager[] = [
  {
    name: 'pantry',
    install: 'pantry install',
    lockfiles: ['pantry.lock'],
    cacheClear: `rm -rf ${join(HOME, '.pantry', 'cache')}`,
  },
  {
    name: 'bun',
    install: 'bun install',
    lockfiles: ['bun.lockb', 'bun.lock'],
    cacheClear: 'bun pm cache rm',
  },
  {
    name: 'pnpm',
    install: 'pnpm install',
    lockfiles: ['pnpm-lock.yaml'],
    cacheClear: 'pnpm store prune',
  },
  {
    name: 'npm',
    install: 'npm install --no-audit --no-fund',
    lockfiles: ['package-lock.json'],
    cacheClear: 'npm cache clean --force',
  },
  {
    name: 'yarn',
    install: 'yarn install',
    lockfiles: ['yarn.lock'],
    cacheClear: 'yarn cache clean',
  },
]

const FIXTURES = ['small', 'medium', 'large'] as const
type Fixture = (typeof FIXTURES)[number]
type Scenario = 'cold' | 'warm' | 'reinstall'

// ── CLI Argument Parsing ───────────────────────────────────────────────────

function parseArgs(): { fixtures: Fixture[]; scenarios: Scenario[]; managers: string[] } {
  const args = process.argv.slice(2)
  let fixtures: Fixture[] = [...FIXTURES]
  let scenarios: Scenario[] = ['cold', 'warm', 'reinstall']
  let managers: string[] = []

  for (const arg of args) {
    if (arg.startsWith('--fixture=')) {
      const val = arg.split('=')[1]
      fixtures = val.split(',') as Fixture[]
    }
    else if (arg.startsWith('--scenario=')) {
      const val = arg.split('=')[1]
      scenarios = val.split(',') as Scenario[]
    }
    else if (arg.startsWith('--managers=')) {
      const val = arg.split('=')[1]
      managers = val.split(',')
    }
  }

  return { fixtures, scenarios, managers }
}

// ── Utility Functions ──────────────────────────────────────────────────────

function isAvailable(cmd: string): boolean {
  try {
    execSync(`which ${cmd}`, { stdio: 'ignore' })
    return true
  }
  catch {
    return false
  }
}

function detectManagers(filter: string[]): PackageManager[] {
  const available: PackageManager[] = []
  for (const pm of ALL_MANAGERS) {
    if (filter.length > 0 && !filter.includes(pm.name))
      continue
    const cmd = pm.install.split(' ')[0]
    if (isAvailable(cmd)) {
      available.push(pm)
    }
    else {
      console.log(`  skipping ${pm.name} (not installed)`)
    }
  }
  return available
}

function setupTempDir(fixture: Fixture, pmName: string): string {
  const base = join(tmpdir(), 'pantry-bench', `${fixture}-${pmName}`)
  rmSync(base, { recursive: true, force: true })
  mkdirSync(base, { recursive: true })
  const fixtureDir = join(import.meta.dir, 'fixtures', fixture)
  cpSync(fixtureDir, base, { recursive: true })
  return base
}

function cleanNodeModules(dir: string): void {
  rmSync(join(dir, 'node_modules'), { recursive: true, force: true })
}

function cleanLockfiles(dir: string): void {
  for (const mgr of ALL_MANAGERS) {
    for (const lf of mgr.lockfiles) {
      const p = join(dir, lf)
      if (existsSync(p))
        rmSync(p, { force: true })
    }
  }
}

function clearCache(pm: PackageManager): void {
  try {
    execSync(pm.cacheClear, { stdio: 'ignore', timeout: 30_000 })
  }
  catch {
    // Cache clear may fail if cache doesn't exist — that's fine
  }
}

function pmInstall(pm: PackageManager, dir: string): void {
  execSync(pm.install, { cwd: dir, stdio: 'ignore', timeout: 300_000 })
}

// ── Main ───────────────────────────────────────────────────────────────────

const { fixtures, scenarios, managers: managerFilter } = parseArgs()

console.log('\n  Package Manager Benchmark')
console.log('  ========================\n')

const managers = detectManagers(managerFilter)

if (managers.length === 0) {
  console.error('No package managers found!')
  process.exit(1)
}

console.log(`  Package managers: ${managers.map(m => m.name).join(', ')}`)
console.log(`  Fixtures: ${fixtures.join(', ')}`)
console.log(`  Scenarios: ${scenarios.join(', ')}\n`)

// Set up temp directories for each PM x fixture combination
const dirs: Record<string, Record<string, string>> = {}
for (const fixture of fixtures) {
  dirs[fixture] = {}
  for (const pm of managers) {
    dirs[fixture][pm.name] = setupTempDir(fixture, pm.name)
  }
}

// ── Register Benchmarks ────────────────────────────────────────────────────

for (const fixture of fixtures) {
  // Cold Install: no cache, no lockfile, no node_modules
  if (scenarios.includes('cold')) {
    summary(() => {
      group(`Cold Install (${fixture})`, () => {
        for (const pm of managers) {
          const dir = dirs[fixture][pm.name]
          const b = bench(pm.name, () => {
            cleanNodeModules(dir)
            cleanLockfiles(dir)
            clearCache(pm)
            pmInstall(pm, dir)
          })
          if (pm.name === 'pantry')
            b.baseline(true)
        }
      })
    })
  }

  // Warm Install: has lockfile + cache, no node_modules
  if (scenarios.includes('warm')) {
    // Pre-populate: run install once per PM to generate lockfiles + fill cache
    console.log(`  Preparing warm install for ${fixture}...`)
    for (const pm of managers) {
      const dir = dirs[fixture][pm.name]
      cleanNodeModules(dir)
      cleanLockfiles(dir)
      try {
        pmInstall(pm, dir)
      }
      catch (e) {
        console.error(`  Warning: pre-populate failed for ${pm.name} (${fixture})`)
      }
    }

    summary(() => {
      group(`Warm Install (${fixture})`, () => {
        for (const pm of managers) {
          const dir = dirs[fixture][pm.name]
          const b = bench(pm.name, () => {
            cleanNodeModules(dir)
            pmInstall(pm, dir)
          })
          if (pm.name === 'pantry')
            b.baseline(true)
        }
      })
    })
  }

  // Reinstall: everything in place, just run install again (integrity check / no-op)
  if (scenarios.includes('reinstall')) {
    // Ensure node_modules exist
    for (const pm of managers) {
      const dir = dirs[fixture][pm.name]
      if (!existsSync(join(dir, 'node_modules'))) {
        try {
          pmInstall(pm, dir)
        }
        catch {
          // ignore
        }
      }
    }

    summary(() => {
      group(`Reinstall (${fixture})`, () => {
        for (const pm of managers) {
          const dir = dirs[fixture][pm.name]
          const b = bench(pm.name, () => {
            pmInstall(pm, dir)
          })
          if (pm.name === 'pantry')
            b.baseline(true)
        }
      })
    })
  }
}

// ── Run ────────────────────────────────────────────────────────────────────

await run()

// ── Cleanup ────────────────────────────────────────────────────────────────

rmSync(join(tmpdir(), 'pantry-bench'), { recursive: true, force: true })
