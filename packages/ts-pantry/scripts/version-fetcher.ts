#!/usr/bin/env bun

/**
 * Version Fetcher — Discovers new package versions from GitHub releases/tags
 *
 * Replaces the pkgx-based version discovery (pkgx-scraper.ts, pkgx-fetcher.ts).
 * Each recipe defines a versionSource that tells us where to check for new versions.
 *
 * Usage:
 *   bun scripts/version-fetcher.ts [--domain <domain>] [--dry-run]
 */

import { existsSync, readdirSync, readFileSync, writeFileSync, renameSync } from 'node:fs'
import { join } from 'node:path'
import type { VersionSource, Recipe } from './recipe-types'

const recipesDir = join(import.meta.dir, '..', 'src', 'recipes')
const packagesDir = join(import.meta.dir, '..', 'src', 'packages')

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || ''
const dryRun = process.argv.includes('--dry-run')
const targetDomain = process.argv.includes('--domain')
  ? process.argv[process.argv.indexOf('--domain') + 1]
  : null

// ── GitHub API ────────────────────────────────────────────────────────

async function fetchGitHubReleases(repo: string, tagPattern?: RegExp, stable = true): Promise<string[]> {
  const headers: Record<string, string> = { Accept: 'application/vnd.github.v3+json' }
  if (GITHUB_TOKEN) headers.Authorization = `token ${GITHUB_TOKEN}`

  const url = `https://api.github.com/repos/${repo}/releases?per_page=50`
  const resp = await fetch(url, { headers })
  if (!resp.ok) {
    console.error(`  GitHub API error for ${repo}: ${resp.status}`)
    return []
  }

  const releases = await resp.json() as Array<{ tag_name: string, prerelease: boolean, draft: boolean }>
  const versions: string[] = []

  for (const release of releases) {
    if (release.draft) continue
    if (stable && release.prerelease) continue

    let version = release.tag_name
    if (tagPattern) {
      const match = version.match(tagPattern)
      if (match) version = match[1]
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

async function fetchGitHubTags(repo: string, tagPattern?: RegExp): Promise<string[]> {
  const headers: Record<string, string> = { Accept: 'application/vnd.github.v3+json' }
  if (GITHUB_TOKEN) headers.Authorization = `token ${GITHUB_TOKEN}`

  const url = `https://api.github.com/repos/${repo}/tags?per_page=50`
  const resp = await fetch(url, { headers })
  if (!resp.ok) return []

  const tags = await resp.json() as Array<{ name: string }>
  const versions: string[] = []

  for (const tag of tags) {
    let version = tag.name
    if (tagPattern) {
      const match = version.match(tagPattern)
      if (match) version = match[1]
      else continue
    }
    else {
      version = version.replace(/^v/, '')
    }
    if (version && (/^\d[\d.]*\d$/.test(version) || /^\d[\d.]*\d[._-]\w+$/.test(version))) versions.push(version)
  }

  return versions
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

function updatePackageVersions(domain: string, newVersions: string[]): boolean {
  const key = domainToKey(domain)
  const filePath = join(packagesDir, `${key}.ts`)
  if (!existsSync(filePath)) return false

  const content = readFileSync(filePath, 'utf-8')

  // Find the versions array
  const versionsMatch = content.match(/versions:\s*\[([\s\S]*?)\]\s*as const/)
  if (!versionsMatch) return false

  const currentVersions = versionsMatch[1]
    .split(',')
    .map(v => v.trim().replace(/'/g, ''))
    .filter(Boolean)

  // Merge: add new versions to existing, never remove existing versions
  const existingSet = new Set(currentVersions)
  const added = newVersions.filter(v => !existingSet.has(v))
  if (added.length === 0) return false // No new versions

  const allVersions = [...new Set([...newVersions, ...currentVersions])]
  // Sort semantically (newest first)
  allVersions.sort((a, b) => {
    const ap = a.split('.').map(Number)
    const bp = b.split('.').map(Number)
    for (let i = 0; i < Math.max(ap.length, bp.length); i++) {
      const diff = (bp[i] || 0) - (ap[i] || 0)
      if (diff !== 0) return diff
    }
    return 0
  })

  const finalVersions = allVersions

  // Check if anything changed
  if (JSON.stringify(finalVersions) === JSON.stringify(currentVersions)) {
    return false // No change
  }

  const newVersionsStr = finalVersions.map(v => `\n    '${v}'`).join(',') + ',\n  '
  const updated = content.replace(
    /versions:\s*\[([\s\S]*?)\]\s*as const/,
    `versions: [${newVersionsStr}] as const`,
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

  let updated = 0
  let checked = 0
  let errors = 0

  for (const file of recipeFiles) {
    try {
      const mod = await import(file)
      const recipe: Recipe = mod.recipe || mod.default
      if (!recipe?.domain || !recipe?.versionSource) continue

      if (targetDomain && recipe.domain !== targetDomain) continue

      checked++
      const versions = await fetchVersions(recipe.versionSource)
      if (versions.length === 0) {
        console.log(`  ${recipe.domain}: no versions found`)
        continue
      }

      const changed = updatePackageVersions(recipe.domain, versions)
      if (changed) {
        console.log(`  ${recipe.domain}: updated to ${versions[0]} (${versions.length} versions)`)
        updated++
      }
    }
    catch (err) {
      const basename = file.split('/').pop()
      console.error(`  ERROR loading ${basename}: ${(err as Error).message}`)
      errors++
    }
  }

  console.log(`\nDone: ${checked} checked, ${updated} updated, ${errors} errors`)
}

main().catch(console.error)
