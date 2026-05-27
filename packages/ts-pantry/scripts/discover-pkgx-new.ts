#!/usr/bin/env bun

/**
 * Discover packages that pkgx's pantry has but ours does not.
 *
 * pkgx (github.com/pkgxdev/pantry) continuously adds new package definitions.
 * We keep our own formulas up to date version-wise (update-packages.yml) but
 * don't add brand-new packages. This script diffs pkgx's top-level project list
 * against our `src/packages/*.ts` files and prints the domains we're missing, so
 * the pkgx-sync workflow can open one PR per new package for review.
 *
 * A pkgx domain maps to a file via convertDomainToFileName (e.g. `nodejs.org` ->
 * `nodejsorg.ts`); if that file is absent, the package is new to us.
 *
 * Usage:
 *   bun scripts/discover-pkgx-new.ts [--limit N] [--json]
 *
 * Output: newline-separated new domains on stdout (capped by --limit, default 25);
 * a human summary goes to stderr so it doesn't pollute the captured list.
 */

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { parseArgs } from 'node:util'
import { fetchPkgxProjects } from '../src/fetch'
import { convertDomainToFileName } from '../src/utils'

// Keep stdout reserved for the machine-readable domain list — the fetch helpers
// log progress via console.log, so route those to stderr.
console.log = (...args: unknown[]) => console.error(...args)

const { values } = parseArgs({
  args: process.argv.slice(2),
  options: {
    limit: { type: 'string', short: 'l', default: '25' },
    json: { type: 'boolean', default: false },
    'packages-dir': { type: 'string', default: 'src/packages' },
  },
  allowPositionals: false,
})

const limit = Math.max(0, Number.parseInt(values.limit as string, 10) || 25)
const packagesDir = path.resolve(process.cwd(), values['packages-dir'] as string)

// Domains pkgx lists but that aren't worth scaffolding automatically: meta dirs
// and our own non-package files. Keep this conservative — reviewers gate the rest.
const IGNORED = new Set(['index', 'aliases'])

function existsLocally(domain: string): boolean {
  const file = convertDomainToFileName(domain)
  if (IGNORED.has(file))
    return true
  return fs.existsSync(path.join(packagesDir, `${file}.ts`))
}

async function main(): Promise<void> {
  if (!fs.existsSync(packagesDir)) {
    console.error(`Packages directory not found: ${packagesDir}`)
    process.exit(1)
  }

  const projects = await fetchPkgxProjects()
  const newDomains = projects
    .map(p => p.name)
    .filter(name => name && !existsLocally(name))

  console.error(`pkgx projects: ${projects.length} | already present: ${projects.length - newDomains.length} | new: ${newDomains.length}`)

  const limited = limit > 0 ? newDomains.slice(0, limit) : newDomains
  if (limit > 0 && newDomains.length > limit)
    console.error(`Emitting first ${limit} of ${newDomains.length} new domains (raise --limit for more).`)

  if (values.json) {
    process.stdout.write(`${JSON.stringify(limited)}\n`)
  }
  else {
    for (const domain of limited)
      process.stdout.write(`${domain}\n`)
  }
}

main().catch((err) => {
  console.error('discover-pkgx-new failed:', err instanceof Error ? err.message : err)
  process.exit(1)
})
