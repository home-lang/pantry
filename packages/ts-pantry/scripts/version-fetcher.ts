#!/usr/bin/env bun

/**
 * Version Fetcher — Discovers new package versions from GitHub releases/tags
 *
 * Replaces the pkgx-based version discovery (pkgx-scraper.ts, pkgx-fetcher.ts).
 * Each recipe defines a versionSource that tells us where to check for new versions.
 *
 * Usage:
 *   bun scripts/version-fetcher.ts [--domain <domain>] [--dry-run] [--concurrency <N>]
 */

import { appendFileSync, existsSync, readdirSync, readFileSync, writeFileSync, renameSync } from 'node:fs'
import { join } from 'node:path'
import type { VersionSource, Recipe } from './recipe-types'
import { revisedPackageVersions } from './package-revisions'

const recipesDir = join(import.meta.dir, '..', 'src', 'recipes')
const packagesDir = join(import.meta.dir, '..', 'src', 'packages')

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || ''
const dryRun = process.argv.includes('--dry-run')
const targetDomain = process.argv.includes('--domain')
  ? process.argv[process.argv.indexOf('--domain') + 1]
  : null
const concurrencyArg = process.argv.includes('--concurrency')
  ? process.argv[process.argv.indexOf('--concurrency') + 1]
  : process.env.VERSION_FETCHER_CONCURRENCY
const concurrency = Math.max(1, Math.min(32, Number.parseInt(concurrencyArg || '16', 10) || 16))

// ── GitHub API ────────────────────────────────────────────────────────

/**
 * The upstream could not be asked — as distinct from having nothing to say.
 *
 * Both used to return `[]`, and the sweep counted that as "checked, no new
 * versions, 0 errors". So a rate-limited run and a run where every package was
 * genuinely current produced the same summary and the same green tick, and the
 * only way to tell them apart was to read 600 lines of log for the word 403.
 */
export class UpstreamUnavailable extends Error {
  constructor(readonly repo: string, readonly status: number, readonly rateLimited: boolean) {
    super(`${repo}: GitHub API returned ${status}${rateLimited ? ' (rate limit exhausted)' : ''}`)
    this.name = 'UpstreamUnavailable'
  }
}

/** A 403/429 with no requests left is the transient one, and the dangerous one. */
function isRateLimited(resp: Response): boolean {
  if (resp.status !== 403 && resp.status !== 429) return false
  const remaining = resp.headers.get('x-ratelimit-remaining')
  return remaining === null || remaining === '0'
}

async function fetchGitHubReleases(repo: string, tagPattern?: RegExp, stable = true): Promise<string[]> {
  const headers: Record<string, string> = { Accept: 'application/vnd.github.v3+json' }
  if (GITHUB_TOKEN) headers.Authorization = `token ${GITHUB_TOKEN}`

  const url = `https://api.github.com/repos/${repo}/releases?per_page=50`
  const resp = await fetch(url, { headers, signal: AbortSignal.timeout(30000) })
  if (!resp.ok)
    throw new UpstreamUnavailable(repo, resp.status, isRateLimited(resp))

  const releases = await resp.json() as Array<{ tag_name: string, prerelease: boolean, draft: boolean }>
  const versions: string[] = []

  for (const release of releases) {
    if (release.draft) continue
    if (stable && release.prerelease) continue

    let version = release.tag_name
    if (tagPattern) {
      const match = version.match(tagPattern)
      // Join all capture groups so multi-part tag schemes work, e.g. PostgreSQL's
      // `REL_17_10` with /^REL_(\d+)_(\d+)$/ → "17.10". Single-group patterns are
      // unchanged (one group → just that group).
      if (match) version = match.length > 2 ? match.slice(1).filter(Boolean).join('.') : match[1]
      else continue
    }
    else {
      // Default: strip leading 'v'
      version = version.replace(/^v/, '')
    }

    // Only accept versions that look like semver (digits + dots, optional pre-release suffix)
    if (version && (/^\d[\d.]*\d$/.test(version) || /^\d[\d.]*\d[._-]\w+$/.test(version))) {
      versions.push(version)
    }
  }

  return versions
}

/**
 * Domains whose version source cannot be made to work with a tag pattern, and
 * why. These are EXPECTED to resolve nothing, so the sweep separates them from
 * a genuine regression rather than lumping all of it into one number that only
 * ever grows.
 *
 * Removing an entry is the point: each is a real piece of work, not a
 * permanent excuse. Adding one requires the same standard — a reason a reader
 * can check, not "this one is awkward".
 */
const KNOWN_NO_VERSION_SOURCE: Record<string, string> = {
  'luajit.org': 'LuaJIT publishes no tags or releases at all — it ships rolling v2.1/v2.0 branches. Needs a rolling-version scheme, not a tag pattern.',
  'min.io': 'Tags are RELEASE.2025-10-15T17-29-55Z, which no semver-shaped filter accepts, and distributable.url is hardcoded to one 2023 release — so a version source alone would produce versions nothing can build.',
  'elizaOS.github.io': 'Every tag is a beta (v2.0.11-beta.7); there is no stable series to select.',
  'cpanmin.us': 'The numeric tags belong to Menlo, a different product in the same repo; cpanminus\'s own releases are not distinguishable by pattern.',
  'unicode.org': 'ICU tags `release-78.3` against a catalog shipping 78.3.0. Taking it would add a second, shorter spelling of a version we already have.',
}

/** Apply `tagPattern` (or the default v-strip) and keep only version-shaped
 * results. Factored out so the pager below can ask whether a page contained
 * anything usable, and so that question is answered by the same code that
 * produces the final list rather than a copy of it. */
function matchTags(tags: Array<{ name: string }>, tagPattern?: RegExp): string[] {
  const out: string[] = []
  for (const tag of tags) {
    let version = tag.name
    if (tagPattern) {
      const match = version.match(tagPattern)
      if (!match) continue
      version = match.length > 2 ? match.slice(1).filter(Boolean).join('.') : match[1]
    }
    else { version = version.replace(/^v/, '') }
    if (version && (/^\d[\d.]*\d$/.test(version) || /^\d[\d.]*\d[._-]\w+$/.test(version))) out.push(version)
  }
  return out
}

/** Extra tag pages to try when the first yields nothing usable. See below. */
const TAG_PAGE_LIMIT = 6

async function fetchGitHubTags(repo: string, tagPattern?: RegExp): Promise<string[]> {
  const headers: Record<string, string> = { Accept: 'application/vnd.github.v3+json' }
  if (GITHUB_TOKEN) headers.Authorization = `token ${GITHUB_TOKEN}`

  // GitHub's tag listing is not ordered by version or by date, and for some
  // repos the first page is unusable: apache/apr opens with
  // `apache-1_3-merge-2-pre` and `STRIKER_2_0_51_RC2`, and glennrp/libpng's
  // first fifty tags are all `v1.7.0beta*` while the releases we want are
  // v1.6.x further in. A single page therefore returned nothing and the
  // package froze.
  //
  // Page on ONLY while nothing has matched. The common case — a repo whose
  // first page is fine — still costs exactly one request, so this adds no load
  // to the 600-recipe sweep; it just stops giving up early on the repos that
  // need it.
  const tags: Array<{ name: string }> = []
  for (let page = 1; page <= TAG_PAGE_LIMIT; page++) {
    const url = `https://api.github.com/repos/${repo}/tags?per_page=100&page=${page}`
    const resp = await fetch(url, { headers, signal: AbortSignal.timeout(30000) })
    if (!resp.ok) {
      // A later page failing is not fatal when earlier ones gave us tags.
      if (page === 1)
        throw new UpstreamUnavailable(repo, resp.status, isRateLimited(resp))
      break
    }
    const batch = await resp.json() as Array<{ name: string }>
    if (!batch.length)
      break
    tags.push(...batch)
    if (matchTags(batch, tagPattern).length > 0)
      break
  }

  return matchTags(tags, tagPattern)
}

// ── Version Discovery ─────────────────────────────────────────────────

async function fetchVersions(source: VersionSource): Promise<string[]> {
  switch (source.type) {
    case 'github-releases':
      return fetchGitHubReleases(source.repo, source.tagPattern, source.stable !== false)
    case 'github-tags':
      return fetchGitHubTags(source.repo, source.tagPattern)
    case 'url-pattern':
      return source.knownVersions // URL pattern just returns known versions
    case 'custom':
      return source.fetch()
    default:
      return []
  }
}

// ── Recipe Loading ────────────────────────────────────────────────────

async function loadAllRecipes(): Promise<Recipe[]> {
  const recipes: Recipe[] = []

  if (!existsSync(recipesDir)) return recipes

  function scan(dir: string): void {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        scan(join(dir, entry.name))
      }
      else if (entry.name.endsWith('.ts')) {
        try {
          // We'll import at runtime
          const fullPath = join(dir, entry.name)
          recipes.push({ _path: fullPath } as any) // placeholder, loaded later
        }
        catch {}
      }
    }
  }
  scan(recipesDir)
  return recipes
}

// ── Package Definition Updater ────────────────────────────────────────

function domainToKey(domain: string): string {
  return domain.replace(/[.\-/]/g, '').toLowerCase()
}

// Semver-style prerelease comparison (SemVer §11). Returns <0 if `a` has lower
// precedence than `b`, >0 if higher, 0 if equal. Build metadata (everything
// after `+`) carries no precedence and is ignored. Dotted identifiers are
// compared one at a time: numeric identifiers numerically (so `dev.1000`
// outranks `dev.956`, which a plain string compare gets backwards), and a
// numeric identifier always ranks below a non-numeric one.
function comparePrerelease(a: string, b: string): number {
  const ida = a.split('+')[0].split('.')
  const idb = b.split('+')[0].split('.')
  const len = Math.max(ida.length, idb.length)
  for (let i = 0; i < len; i++) {
    const x = ida[i]
    const y = idb[i]
    if (x === undefined) return -1 // fewer identifiers ⇒ lower precedence
    if (y === undefined) return 1
    const nx = /^\d+$/.test(x)
    const ny = /^\d+$/.test(y)
    if (nx && ny) {
      const d = Number.parseInt(x, 10) - Number.parseInt(y, 10)
      if (d !== 0) return d
    }
    else if (nx !== ny) {
      return nx ? -1 : 1 // numeric identifier < non-numeric identifier
    }
    else if (x !== y) {
      return x < y ? -1 : 1
    }
  }
  return 0
}

// Locate a package's metadata file. Most CLI packages are flat at
// src/packages/<key>.ts, but apps and fonts live one level down
// (src/packages/apps/<key>.ts, src/packages/fonts/<key>.ts). Without the
// subdirectory search this returned undefined for every app and font, so
// version-fetcher silently never bumped them — leaving the CLI's baked
// `@latest` (generated.zig) permanently stale (e.g. raycast stuck at 1.89.0).
function findPackageFile(key: string, domain: string): string | undefined {
  for (const p of [join(packagesDir, `${key}.ts`), join(packagesDir, `${domain}.ts`)]) {
    if (existsSync(p)) return p
  }
  for (const entry of readdirSync(packagesDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    const p = join(packagesDir, entry.name, `${key}.ts`)
    if (existsSync(p)) return p
  }
  return undefined
}

/**
 * How many upstream versions a single sweep may add to one package.
 *
 * Override with VERSION_CATALOG_ADD_LIMIT for a deliberate backfill.
 */
const CATALOG_ADD_LIMIT = Math.max(1, Number.parseInt(process.env.VERSION_CATALOG_ADD_LIMIT || '20', 10) || 20)

/** Newest first, by the same dotted-numeric ordering the catalog is written in. */
export function sortVersionsDesc(versions: string[]): string[] {
  return [...versions].sort((a, b) => {
    const parse = (v: string) => (v.split('-')[0] ?? '').split('.').map((part) => {
      const n = Number.parseInt(part, 10)
      return Number.isNaN(n) ? 0 : n
    })
    const x = parse(a)
    const y = parse(b)
    for (let i = 0; i < Math.max(x.length, y.length); i++) {
      const diff = (y[i] ?? 0) - (x[i] ?? 0)
      if (diff !== 0) return diff
    }
    // Equal numerics: a release outranks a prerelease.
    const preA = a.includes('-')
    const preB = b.includes('-')
    if (preA !== preB) return preA ? 1 : -1
    return 0
  })
}

/**
 * Merge upstream versions into a package's existing list.
 *
 * Adds at most `limit` of the newest incoming versions and removes nothing.
 * Returns the union plus what was actually added, so the caller can skip
 * rewriting a file that gained nothing.
 */
export function mergeCatalogVersions(
  current: string[],
  incoming: string[],
  limit: number,
): { versions: string[], added: string[] } {
  const existing = new Set(current)
  const candidates = sortVersionsDesc(incoming).slice(0, Math.max(1, limit))
  const added = candidates.filter(v => !existing.has(v))
  return { versions: [...new Set([...candidates, ...current])], added }
}

function updatePackageVersions(domain: string, newVersions: string[]): boolean {
  const key = domainToKey(domain)
  const filePath = findPackageFile(key, domain)
  if (!filePath) return false

  const content = readFileSync(filePath, 'utf-8')

  // Find the versions array
  const versionsMatch = content.match(/versions:\s*\[([\s\S]*?)\]\s*as const/)
  if (!versionsMatch) return false

  const currentVersions = versionsMatch[1]
    .split(',')
    .map(v => v.trim().replace(/'/g, ''))
    .filter(Boolean)

  // Merge: add new versions to existing, never remove existing versions.
  //
  // But add at most CATALOG_ADD_LIMIT of them, newest first. Upstream can hand
  // us fifty releases (or six hundred tags), and merging the lot means one
  // sweep dumps a package's entire history into the catalog — which is how
  // vim.org reached 2,998 entries and the catalogs together reached ~32,000,
  // while a publish only ever builds --max-versions (3) or
  // --popular-max-versions (20) of them. Everything past that is listed as
  // installable and is not published.
  //
  // The intended shape is the recent window plus everything new from here on,
  // with older versions filled in on demand — the registry already records what
  // people actually ask for at /analytics/{name}/requested-versions. This is the
  // cap that was missing from that design, not a new policy.
  //
  // It bounds GROWTH rather than trimming: nothing already listed is removed,
  // because some of it is published and delisting a published version would
  // break installs of it.
  const merged = mergeCatalogVersions(currentVersions, newVersions, CATALOG_ADD_LIMIT)
  if (merged.added.length === 0) return false // No new versions

  const allVersions = merged.versions
  // Sort semantically (newest first)
  allVersions.sort((a, b) => {
    const parse = (v: string) => {
      const dashIdx = v.indexOf('-')
      const numeric = (dashIdx === -1 ? v : v.slice(0, dashIdx)).split('.').map(s => {
        const n = Number.parseInt(s, 10)
        return Number.isNaN(n) ? 0 : n
      })
      const prerelease = dashIdx === -1 ? null : v.slice(dashIdx + 1)
      return { numeric, prerelease }
    }
    const pa = parse(a)
    const pb = parse(b)
    const len = Math.max(pa.numeric.length, pb.numeric.length)
    for (let i = 0; i < len; i++) {
      const diff = (pb.numeric[i] ?? 0) - (pa.numeric[i] ?? 0)
      if (diff !== 0) return diff
    }
    // Same numeric core: a release (no prerelease) outranks any prerelease, and
    // among prereleases compare identifier-by-identifier so newer dev builds
    // sort first (newest-first ⇒ negate the ascending-precedence comparison).
    if (pa.prerelease === null && pb.prerelease !== null) return -1
    if (pa.prerelease !== null && pb.prerelease === null) return 1
    if (pa.prerelease !== null && pb.prerelease !== null) {
      return -comparePrerelease(pa.prerelease, pb.prerelease)
    }
    return 0
  })

  const finalVersions = allVersions

  // Check if anything changed
  if (JSON.stringify(finalVersions) === JSON.stringify(currentVersions)) {
    return false // No change
  }

  const newVersionsStr = finalVersions.map(v => `\n    '${v}'`).join(',') + ',\n  '
  const latest = finalVersions[0]
  const updated = content
    .replace(
      /versions:\s*\[([\s\S]*?)\]\s*as const/,
      `versions: [${newVersionsStr}] as const`,
    )
    // These generated files document themselves in a JSDoc block that quotes
    // the latest version twice. Rewriting only the array left every package's
    // own documentation contradicting its data — bun.com sat at "@version
    // `1.3.14`" while the array below it started at 1.4.0 — so anything reading
    // the header (docs site, editor hover, a human) got the stale answer.
    .replace(
      /(@version `)[^`]*(` \()\d+( versions available\))/,
      `$1${latest}$2${finalVersions.length}$3`,
    )
    .replace(
      /(console\.log\(pkg\.versions\[0\]\) \/\/ ")[^"]*(" \(latest\))/,
      `$1${latest}$2`,
    )

  if (dryRun) {
    console.log(`  [dry-run] Would update ${domain}: ${currentVersions[0]} → ${finalVersions[0]}`)
    return true
  }

  const tmpFile = `${filePath}.tmp`
  writeFileSync(tmpFile, updated)
  renameSync(tmpFile, filePath)
  return true
}

// ── Main ──────────────────────────────────────────────────────────────

async function main() {
  console.log('Fetching versions from native recipes...\n')

  // Find all recipe files
  if (!existsSync(recipesDir)) {
    console.log('No recipes directory found')
    process.exit(0)
  }

  const recipeFiles: string[] = []
  function scan(dir: string): void {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) scan(join(dir, entry.name))
      else if (entry.name.endsWith('.ts')) recipeFiles.push(join(dir, entry.name))
    }
  }
  scan(recipesDir)

  /** Set once any upstream answers "rate limit exhausted": the sweep is void. */
  let rateLimitHit = false

  async function processRecipeFile(file: string): Promise<{ checked: number, updated: number, errors: number, unavailable: number }> {
    try {
      const mod = await import(file)
      const recipe: Recipe = mod.recipe || mod.default
      if (!recipe?.domain || !recipe?.versionSource) return { checked: 0, updated: 0, errors: 0, unavailable: 0 }

      if (targetDomain && recipe.domain !== targetDomain) return { checked: 0, updated: 0, errors: 0, unavailable: 0 }

      const versions = revisedPackageVersions(await fetchVersions(recipe.versionSource), recipe.revisions)
      if (versions.length === 0) {
        console.log(`  ${recipe.domain}: no versions found`)
        noVersionDomains.push(recipe.domain)
        return { checked: 1, updated: 0, errors: 0, unavailable: 0 }
      }

      const changed = updatePackageVersions(recipe.domain, versions)
      if (changed) {
        console.log(`  ${recipe.domain}: updated to ${versions[0]} (${versions.length} versions)`)
        return { checked: 1, updated: 1, errors: 0, unavailable: 0 }
      }

      return { checked: 1, updated: 0, errors: 0, unavailable: 0 }
    }
    catch (err) {
      // An upstream we could not reach is not the same as a recipe that failed
      // to load, and neither is "no new versions". Counting them apart is the
      // difference between a sweep that found nothing and a sweep that asked
      // nothing — which used to look identical from the summary line.
      if (err instanceof UpstreamUnavailable) {
        console.error(`  UNAVAILABLE ${err.message}`)
        if (err.rateLimited) rateLimitHit = true
        return { checked: 1, updated: 0, errors: 0, unavailable: 1 }
      }
      const basename = file.split('/').pop()
      console.error(`  ERROR loading ${basename}: ${(err as Error).message}`)
      return { checked: 0, updated: 0, errors: 1, unavailable: 0 }
    }
  }

  console.log(`Using concurrency: ${concurrency}\n`)

  let updated = 0
  let checked = 0
  // Recipes whose versionSource returned nothing — see the summary below.
  const noVersionDomains: string[] = []
  let errors = 0
  let unavailable = 0
  let nextIndex = 0
  const workers = Array.from({ length: Math.min(concurrency, recipeFiles.length) }, async () => {
    while (true) {
      const index = nextIndex++
      if (index >= recipeFiles.length) return
      const result = await processRecipeFile(recipeFiles[index])
      checked += result.checked
      updated += result.updated
      errors += result.errors
      unavailable += result.unavailable
    }
  })

  await Promise.all(workers)

  console.log(`\nDone: ${checked} checked, ${updated} updated, ${errors} errors, ${unavailable} unreachable, ${noVersionDomains.length} resolved no version`)

  // A version source that returns nothing is not the same as an upstream being
  // unreachable, and until now it was neither counted nor surfaced — just one
  // `no versions found` line among six hundred. The package silently freezes at
  // whatever was last hand-committed, and nothing ever says so. go.dev sat on
  // 1.26.1 that way for months, because golang/go publishes no GitHub releases
  // at all and its `github-releases` source could never have worked.
  //
  // Surfaced as a warning, not a failure: ~80 recipes are in this state today
  // (mostly tagPattern mismatches), so failing the sweep would make the run
  // permanently red and train everyone to ignore it. The count belongs in the
  // summary so the backlog is visible and can be driven down.
  if (noVersionDomains.length > 0) {
    const all = noVersionDomains.slice().sort()
    const known = all.filter(d => KNOWN_NO_VERSION_SOURCE[d])
    const list = all.filter(d => !KNOWN_NO_VERSION_SOURCE[d])

    if (known.length > 0) {
      console.log(`\nKnown-unresolvable version sources (${known.length}), each for a recorded reason:`)
      for (const domain of known) console.log(`  ${domain}: ${KNOWN_NO_VERSION_SOURCE[domain]}`)
    }
    if (list.length > 0)
      console.log(`\nVersion sources that resolved nothing (${list.length}): ${list.join(', ')}`)
    // Only the UNEXPECTED ones are worth an annotation. A warning that fires
    // every run for the same five known cases is one nobody reads, and it would
    // hide the sixth.
    if (list.length > 0 && process.env.GITHUB_ACTIONS === 'true')
      console.log(`::warning title=Version sources resolving nothing::${list.length} recipe(s) returned no versions and are not in the known-unresolvable list; those packages are frozen at their last committed version. The run log names them.`)

    const summaryPath = process.env.GITHUB_STEP_SUMMARY
    if (summaryPath) {
      try {
        appendFileSync(summaryPath, [
          '## Version sources resolving nothing',
          '',
          `${list.length} of ${checked} recipes returned no versions and are not known-unresolvable, so those packages cannot auto-update.`,
          '',
          ...list.map(d => `- ${d}`),
          '',
          ...(known.length ? ['<details><summary>Known-unresolvable, with reasons</summary>', '', ...known.map(d => `- **${d}** — ${KNOWN_NO_VERSION_SOURCE[d]}`), '', '</details>', ''] : []),
        ].join('\n'))
      }
      catch {
        // A summary we cannot write is not a reason to fail the sweep.
      }
    }
  }

  // A rate-limited sweep has not checked anything; it has merely failed to ask.
  // Committing its result would record "no new versions" for every package it
  // never reached, and the next run would start from that as though it were a
  // fact. Fail instead, so the run is visibly red and simply runs again.
  if (rateLimitHit) {
    console.error('\nGitHub rate limit exhausted — this sweep is incomplete and its result must not be trusted.')
    console.error('Give the workflow a token with a higher limit (PAT_TOKEN), or run it less often.')
    process.exitCode = 1
    return
  }

  // Some upstreams are permanently gone (renamed repos, deleted projects), so a
  // handful of unreachable ones is the steady state rather than a regression.
  // A fifth of the catalog is not.
  if (checked > 0 && unavailable > checked / 5) {
    console.error(`\n${unavailable} of ${checked} upstreams were unreachable — too many to treat this sweep as complete.`)
    process.exitCode = 1
  }
}

// Only when run as a script. Importing this file — a test reaching for
// `UpstreamUnavailable`, say — used to kick off a full sweep of every recipe as
// a side effect of the import.
if (import.meta.main)
  main().catch(console.error)
