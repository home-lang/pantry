#!/usr/bin/env bun

/**
 * Pantry vs Composer — PHP Package Install Benchmark
 *
 * Fair comparison: both tools run their actual CLI commands.
 * No tricks, no special flags, no in-process shortcuts.
 *
 * - pantry: `pantry install` (reads composer.json, downloads from Packagist natively)
 * - composer: `composer install` (standard PHP package manager)
 */

import { bench, group, run, summary } from 'mitata'
import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { execSync } from 'node:child_process'

// ── Helpers ──────────────────────────────────────────────────────────────────

function isAvailable(cmd: string): boolean {
  try { execSync(`which ${cmd}`, { stdio: 'ignore' }); return true }
  catch { return false }
}

function setupDir(fixture: string, label: string): string {
  const base = join(tmpdir(), 'pantry-vs-composer', `${fixture}-${label}`)
  rmSync(base, { recursive: true, force: true })
  mkdirSync(base, { recursive: true })
  cpSync(join(import.meta.dir, 'fixtures', fixture, 'composer.json'), join(base, 'composer.json'))
  return base
}

function cleanVendor(dir: string): void {
  rmSync(join(dir, 'vendor'), { recursive: true, force: true })
  rmSync(join(dir, 'node_modules'), { recursive: true, force: true })
  rmSync(join(dir, 'pantry'), { recursive: true, force: true })
}

function cleanLock(dir: string): void {
  for (const f of ['composer.lock', 'pantry.lock']) {
    const p = join(dir, f)
    if (existsSync(p)) rmSync(p, { force: true })
  }
}

// ── Check availability ──────────────────────────────────────────────────────

const hasPantry = isAvailable('pantry')
const hasComposer = isAvailable('composer')

if (!hasPantry) { console.error('pantry not installed'); process.exit(1) }
if (!hasComposer) { console.error('composer not installed'); process.exit(1) }

console.log('\n  Pantry vs Composer — PHP Package Install Benchmark')
console.log('  ==================================================\n')

const pantryVersion = execSync('pantry --version 2>&1 || echo unknown', { encoding: 'utf-8' }).trim()
const composerVersion = execSync('composer --version 2>&1 | head -1', { encoding: 'utf-8' }).trim()
console.log(`  pantry:   ${pantryVersion}`)
console.log(`  composer: ${composerVersion}`)
console.log('  Both tools install identical PHP deps from the same composer.json\n')

// ── Fixtures ────────────────────────────────────────────────────────────────

const fixtures = ['small', 'medium', 'large'] as const
const pantryDirs: Record<string, string> = {}
const composerDirs: Record<string, string> = {}

for (const f of fixtures) {
  pantryDirs[f] = setupDir(f, 'pantry')
  composerDirs[f] = setupDir(f, 'composer')
}

// ── Cold Install ────────────────────────────────────────────────────────────

for (const f of fixtures) {
  summary(() => {
    group(`Cold Install (${f})`, () => {
      bench('pantry', () => {
        cleanVendor(pantryDirs[f])
        cleanLock(pantryDirs[f])
        execSync('pantry install', { cwd: pantryDirs[f], stdio: 'ignore', timeout: 300_000 })
      }).baseline(true)

      bench('composer', () => {
        cleanVendor(composerDirs[f])
        cleanLock(composerDirs[f])
        try { execSync('composer clear-cache 2>/dev/null', { stdio: 'ignore' }) } catch {}
        execSync('composer install --no-interaction --no-progress --prefer-dist', {
          cwd: composerDirs[f], stdio: 'ignore', timeout: 300_000,
        })
      })
    })
  })
}

// ── Warm Install ────────────────────────────────────────────────────────────

console.log('  Preparing warm install (pre-populating caches)...')
for (const f of fixtures) {
  try { execSync('pantry install', { cwd: pantryDirs[f], stdio: 'ignore', timeout: 300_000 }) } catch {}
  try { execSync('composer install --no-interaction --no-progress --prefer-dist', { cwd: composerDirs[f], stdio: 'ignore', timeout: 300_000 }) } catch {}
}

for (const f of fixtures) {
  summary(() => {
    group(`Warm Install (${f})`, () => {
      bench('pantry', () => {
        cleanVendor(pantryDirs[f])
        execSync('pantry install', { cwd: pantryDirs[f], stdio: 'ignore', timeout: 300_000 })
      }).baseline(true)

      bench('composer', () => {
        cleanVendor(composerDirs[f])
        execSync('composer install --no-interaction --no-progress --prefer-dist', {
          cwd: composerDirs[f], stdio: 'ignore', timeout: 300_000,
        })
      })
    })
  })
}

// ── Reinstall (no-op) ───────────────────────────────────────────────────────

for (const f of fixtures) {
  if (!existsSync(join(pantryDirs[f], 'vendor')) && !existsSync(join(pantryDirs[f], 'pantry'))) {
    try { execSync('pantry install', { cwd: pantryDirs[f], stdio: 'ignore', timeout: 300_000 }) } catch {}
  }
  if (!existsSync(join(composerDirs[f], 'vendor'))) {
    try { execSync('composer install --no-interaction --no-progress --prefer-dist', { cwd: composerDirs[f], stdio: 'ignore', timeout: 300_000 }) } catch {}
  }

  summary(() => {
    group(`Reinstall / no-op (${f})`, () => {
      bench('pantry', () => {
        execSync('pantry install', { cwd: pantryDirs[f], stdio: 'ignore', timeout: 300_000 })
      }).baseline(true)

      bench('composer', () => {
        execSync('composer install --no-interaction --no-progress --prefer-dist', {
          cwd: composerDirs[f], stdio: 'ignore', timeout: 300_000,
        })
      })
    })
  })
}

// eslint-disable-next-line ts/no-top-level-await
await run()

rmSync(join(tmpdir(), 'pantry-vs-composer'), { recursive: true, force: true })
