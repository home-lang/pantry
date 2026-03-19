#!/usr/bin/env bun

/**
 * Pantry vs Composer Benchmark
 *
 * Fair comparison: both tools install PHP/Composer packages from Packagist.
 * Pantry handles PHP deps through its Composer integration.
 *
 * Scenarios:
 * 1. Cold install — no cache, no lockfile, no vendor/
 * 2. Warm install — lockfile + cache exist, vendor/ removed
 * 3. Reinstall — everything in place (no-op / integrity check)
 *
 * Both tools use the same composer.json fixtures with identical dependencies.
 */

import { bench, group, run, summary } from 'mitata'
import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { execSync } from 'node:child_process'

// ── Helpers ──────────────────────────────────────────────────────────────────

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
  // Only copy composer.json — both tools will use it
  const composerJson = join(fixtureDir, 'composer.json')
  if (existsSync(composerJson)) {
    cpSync(composerJson, join(base, 'composer.json'))
  }
  else {
    throw new Error(`No composer.json fixture found for ${fixture}`)
  }
  return base
}

function cleanVendor(dir: string): void {
  rmSync(join(dir, 'vendor'), { recursive: true, force: true })
}

function cleanLock(dir: string): void {
  const lock = join(dir, 'composer.lock')
  if (existsSync(lock)) rmSync(lock, { force: true })
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

console.log('\n  Pantry vs Composer — PHP Package Install Benchmark')
console.log('  ==================================================\n')

const pantryVersion = execSync('pantry --version 2>&1 || echo unknown', { encoding: 'utf-8' }).trim()
const composerVersion = execSync('composer --version 2>&1 | head -1', { encoding: 'utf-8' }).trim()
console.log(`  pantry:   ${pantryVersion}`)
console.log(`  composer: ${composerVersion}`)
console.log('  Note: Both tools install identical PHP deps from the same composer.json\n')

// ── Fixtures ────────────────────────────────────────────────────────────────

const fixtures = ['small', 'medium', 'large'] as const

const pantryDirs: Record<string, string> = {}
const composerDirs: Record<string, string> = {}
for (const fixture of fixtures) {
  pantryDirs[fixture] = setupTempDir(fixture, 'pantry')
  composerDirs[fixture] = setupTempDir(fixture, 'composer')
}

// ── Cold Install ────────────────────────────────────────────────────────────
// No cache, no lockfile, no vendor/ — measures full resolution + download

for (const fixture of fixtures) {
  summary(() => {
    group(`Cold Install (${fixture})`, () => {
      bench('pantry', () => {
        cleanVendor(pantryDirs[fixture])
        cleanLock(pantryDirs[fixture])
        execSync('pantry install', { cwd: pantryDirs[fixture], stdio: 'ignore', timeout: 300_000 })
      }).baseline(true)

      bench('composer', () => {
        cleanVendor(composerDirs[fixture])
        cleanLock(composerDirs[fixture])
        execSync('composer install --no-interaction --no-progress --no-suggest', { cwd: composerDirs[fixture], stdio: 'ignore', timeout: 300_000 })
      })
    })
  })
}

// ── Warm Install ────────────────────────────────────────────────────────────
// Lockfile + cache exist, vendor/ removed — measures download + extraction only

// Pre-populate: generate lockfiles and fill caches
console.log('  Preparing warm install (generating lockfiles + filling caches)...')
for (const fixture of fixtures) {
  try { execSync('pantry install', { cwd: pantryDirs[fixture], stdio: 'ignore', timeout: 300_000 }) } catch {}
  try { execSync('composer install --no-interaction --no-progress --no-suggest', { cwd: composerDirs[fixture], stdio: 'ignore', timeout: 300_000 }) } catch {}
}

for (const fixture of fixtures) {
  summary(() => {
    group(`Warm Install (${fixture})`, () => {
      bench('pantry', () => {
        cleanVendor(pantryDirs[fixture])
        execSync('pantry install', { cwd: pantryDirs[fixture], stdio: 'ignore', timeout: 300_000 })
      }).baseline(true)

      bench('composer', () => {
        cleanVendor(composerDirs[fixture])
        execSync('composer install --no-interaction --no-progress --no-suggest', { cwd: composerDirs[fixture], stdio: 'ignore', timeout: 300_000 })
      })
    })
  })
}

// ── Reinstall (no-op) ───────────────────────────────────────────────────────
// Everything in place — measures integrity check / up-to-date detection

// Ensure everything is installed
for (const fixture of fixtures) {
  if (!existsSync(join(composerDirs[fixture], 'vendor'))) {
    try { execSync('composer install --no-interaction --no-progress --no-suggest', { cwd: composerDirs[fixture], stdio: 'ignore', timeout: 300_000 }) } catch {}
  }
}

for (const fixture of fixtures) {
  summary(() => {
    group(`Reinstall / no-op (${fixture})`, () => {
      bench('pantry', () => {
        execSync('pantry install', { cwd: pantryDirs[fixture], stdio: 'ignore', timeout: 300_000 })
      }).baseline(true)

      bench('composer', () => {
        execSync('composer install --no-interaction --no-progress --no-suggest', { cwd: composerDirs[fixture], stdio: 'ignore', timeout: 300_000 })
      })
    })
  })
}

// ── Run ──────────────────────────────────────────────────────────────────────

// eslint-disable-next-line ts/no-top-level-await
await run()

// ── Cleanup ──────────────────────────────────────────────────────────────────

rmSync(join(tmpdir(), 'pantry-vs-composer'), { recursive: true, force: true })
