#!/usr/bin/env bun

/**
 * Pantry vs Composer Benchmark
 *
 * Compares pantry and Composer (PHP) across multiple scenarios:
 * 1. Cold install (no cache, no lockfile)
 * 2. Warm install (with cache + lockfile, no vendor/)
 * 3. Reinstall (everything in place — integrity check / no-op)
 * 4. Add single package
 * 5. Remove single package
 *
 * Uses real PHP/Composer projects with typical dependency trees.
 */

import { bench, group, run, summary } from 'mitata'
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { execSync } from 'node:child_process'

// ── Helpers ──────────────────────────────────────────────────────────────────

const HOME = process.env.HOME ?? '~'

function isAvailable(cmd: string): boolean {
  try {
    execSync(`which ${cmd}`, { stdio: 'ignore' })
    return true
  }
  catch {
    return false
  }
}

function setupTempDir(fixture: string, label: string): string {
  const base = join(tmpdir(), 'pantry-vs-composer', `${fixture}-${label}`)
  rmSync(base, { recursive: true, force: true })
  mkdirSync(base, { recursive: true })
  const fixtureDir = join(import.meta.dir, 'fixtures', fixture)
  cpSync(fixtureDir, base, { recursive: true })
  return base
}

function clean(dir: string): void {
  rmSync(join(dir, 'node_modules'), { recursive: true, force: true })
  rmSync(join(dir, 'vendor'), { recursive: true, force: true })
}

function cleanLocks(dir: string): void {
  for (const f of ['composer.lock', 'pantry.lock', 'package-lock.json', 'bun.lockb', 'bun.lock']) {
    const p = join(dir, f)
    if (existsSync(p)) rmSync(p, { force: true })
  }
}

// ── Check availability ──────────────────────────────────────────────────────

const hasPantry = isAvailable('pantry')
const hasComposer = isAvailable('composer')

if (!hasPantry) {
  console.error('pantry is not installed. Install with: curl -fsSL https://pantry.dev | sh')
  process.exit(1)
}
if (!hasComposer) {
  console.error('composer is not installed. Install with: pantry install php.net')
  process.exit(1)
}

console.log('\n  Pantry vs Composer Benchmark')
console.log('  ============================\n')

const pantryVersion = execSync('pantry --version 2>&1 || echo unknown', { encoding: 'utf-8' }).trim()
const composerVersion = execSync('composer --version 2>&1 | head -1', { encoding: 'utf-8' }).trim()
console.log(`  pantry:   ${pantryVersion}`)
console.log(`  composer: ${composerVersion}\n`)

// ── Fixtures ────────────────────────────────────────────────────────────────

const fixtures = ['small', 'medium', 'large'] as const

// Set up temp dirs
const pantryDirs: Record<string, string> = {}
const composerDirs: Record<string, string> = {}
for (const fixture of fixtures) {
  pantryDirs[fixture] = setupTempDir(fixture, 'pantry')
  composerDirs[fixture] = setupTempDir(fixture, 'composer')
}

// ── Cold Install ────────────────────────────────────────────────────────────

for (const fixture of fixtures) {
  summary(() => {
    group(`Cold Install (${fixture})`, () => {
      bench('pantry', () => {
        clean(pantryDirs[fixture])
        cleanLocks(pantryDirs[fixture])
        try { execSync(`rm -rf ${join(HOME, '.pantry', 'cache')}`, { stdio: 'ignore' }) } catch {}
        execSync('pantry install', { cwd: pantryDirs[fixture], stdio: 'ignore', timeout: 300_000 })
      }).baseline(true)

      bench('composer', () => {
        clean(composerDirs[fixture])
        cleanLocks(composerDirs[fixture])
        try { execSync('composer clear-cache', { stdio: 'ignore' }) } catch {}
        execSync('composer install --no-interaction --no-progress', { cwd: composerDirs[fixture], stdio: 'ignore', timeout: 300_000 })
      })
    })
  })
}

// ── Warm Install ────────────────────────────────────────────────────────────

// Pre-populate lockfiles + caches
console.log('  Preparing warm install fixtures...')
for (const fixture of fixtures) {
  clean(pantryDirs[fixture])
  cleanLocks(pantryDirs[fixture])
  try { execSync('pantry install', { cwd: pantryDirs[fixture], stdio: 'ignore', timeout: 300_000 }) } catch {}

  clean(composerDirs[fixture])
  cleanLocks(composerDirs[fixture])
  try { execSync('composer install --no-interaction --no-progress', { cwd: composerDirs[fixture], stdio: 'ignore', timeout: 300_000 }) } catch {}
}

for (const fixture of fixtures) {
  summary(() => {
    group(`Warm Install (${fixture})`, () => {
      bench('pantry', () => {
        clean(pantryDirs[fixture])
        execSync('pantry install', { cwd: pantryDirs[fixture], stdio: 'ignore', timeout: 300_000 })
      }).baseline(true)

      bench('composer', () => {
        clean(composerDirs[fixture])
        execSync('composer install --no-interaction --no-progress', { cwd: composerDirs[fixture], stdio: 'ignore', timeout: 300_000 })
      })
    })
  })
}

// ── Reinstall (no-op / integrity check) ─────────────────────────────────────

for (const fixture of fixtures) {
  // Ensure everything installed
  if (!existsSync(join(pantryDirs[fixture], 'node_modules')) && !existsSync(join(pantryDirs[fixture], 'pantry'))) {
    try { execSync('pantry install', { cwd: pantryDirs[fixture], stdio: 'ignore', timeout: 300_000 }) } catch {}
  }
  if (!existsSync(join(composerDirs[fixture], 'vendor'))) {
    try { execSync('composer install --no-interaction --no-progress', { cwd: composerDirs[fixture], stdio: 'ignore', timeout: 300_000 }) } catch {}
  }

  summary(() => {
    group(`Reinstall / no-op (${fixture})`, () => {
      bench('pantry', () => {
        execSync('pantry install', { cwd: pantryDirs[fixture], stdio: 'ignore', timeout: 300_000 })
      }).baseline(true)

      bench('composer', () => {
        execSync('composer install --no-interaction --no-progress', { cwd: composerDirs[fixture], stdio: 'ignore', timeout: 300_000 })
      })
    })
  })
}

// ── Add Package ─────────────────────────────────────────────────────────────

summary(() => {
  group('Add single package', () => {
    const pantryDir = pantryDirs.medium
    const composerDir = composerDirs.medium

    bench('pantry (add)', () => {
      execSync('pantry add ramsey/uuid', { cwd: pantryDir, stdio: 'ignore', timeout: 300_000 })
      // Clean up for next iteration
      try {
        const pkg = JSON.parse(readFileSync(join(pantryDir, 'package.json'), 'utf-8'))
        delete pkg.dependencies?.['ramsey/uuid']
        writeFileSync(join(pantryDir, 'package.json'), JSON.stringify(pkg, null, 2))
      }
      catch {}
    }).baseline(true)

    bench('composer (require)', () => {
      execSync('composer require ramsey/uuid --no-interaction --no-progress', { cwd: composerDir, stdio: 'ignore', timeout: 300_000 })
      // Clean up for next iteration
      execSync('composer remove ramsey/uuid --no-interaction --no-progress', { cwd: composerDir, stdio: 'ignore', timeout: 300_000 })
    })
  })
})

// ── Remove Package ──────────────────────────────────────────────────────────

summary(() => {
  group('Remove single package', () => {
    const pantryDir = pantryDirs.medium
    const composerDir = composerDirs.medium

    bench('pantry (remove)', () => {
      // Add then remove
      execSync('pantry add lodash', { cwd: pantryDir, stdio: 'ignore', timeout: 300_000 })
      execSync('pantry remove lodash', { cwd: pantryDir, stdio: 'ignore', timeout: 300_000 })
    }).baseline(true)

    bench('composer (remove)', () => {
      // Add then remove
      execSync('composer require nesbot/carbon --no-interaction --no-progress', { cwd: composerDir, stdio: 'ignore', timeout: 300_000 })
      execSync('composer remove nesbot/carbon --no-interaction --no-progress', { cwd: composerDir, stdio: 'ignore', timeout: 300_000 })
    })
  })
})

// ── Run ──────────────────────────────────────────────────────────────────────

// eslint-disable-next-line ts/no-top-level-await
await run()

// ── Cleanup ──────────────────────────────────────────────────────────────────

rmSync(join(tmpdir(), 'pantry-vs-composer'), { recursive: true, force: true })
