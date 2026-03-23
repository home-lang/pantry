#!/usr/bin/env bun

/**
 * Migrate pre-built binary overrides to native TS recipes.
 *
 * Reads package-overrides.ts and for each entry that has:
 *   recipe.distributable = undefined (pre-built binary download)
 * generates a standalone src/recipes/{domain}.ts file.
 *
 * Usage:
 *   bun scripts/migrate-to-recipes.ts [--dry-run] [--domain <domain>]
 */

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { packageOverrides } from './package-overrides'

const recipesDir = join(import.meta.dir, '..', 'src', 'recipes')
const packagesDir = join(import.meta.dir, '..', 'src', 'packages')
const desktopPantryDir = join(import.meta.dir, '..', 'src', 'desktop-pantry')
const pantryDir = join(import.meta.dir, '..', 'src', 'pantry')

const dryRun = process.argv.includes('--dry-run')
const targetDomain = process.argv.includes('--domain')
  ? process.argv[process.argv.indexOf('--domain') + 1]
  : null

interface PackageMeta {
  name: string
  domain: string
  description: string
  homepage: string
  github: string
  programs: string[]
  versions: string[]
  aliases: string[]
  dependencies: string[]
}

function domainToKey(domain: string): string {
  return domain.replace(/[.\-/]/g, '').toLowerCase()
}

/** Load package metadata from src/packages/*.ts */
function loadPackageMeta(domain: string): PackageMeta | null {
  const key = domainToKey(domain)
  const files = [
    join(packagesDir, `${key}.ts`),
  ]

  for (const file of files) {
    if (!existsSync(file)) continue
    const content = readFileSync(file, 'utf-8')

    const getName = (s: string) => s.match(/name:\s*'([^']+)'/)?.[1] || domain
    const getDesc = (s: string) => s.match(/description:\s*'([^']+)'/)?.[1] || ''
    const getHomepage = (s: string) => s.match(/homepageUrl:\s*'([^']+)'/)?.[1] || ''
    const getGithub = (s: string) => s.match(/githubUrl:\s*'([^']+)'/)?.[1] || ''
    const getPrograms = (s: string) => {
      const match = s.match(/programs:\s*\[([\s\S]*?)\]\s*as const/)
      if (!match) return []
      return match[1].split(',').map(p => p.trim().replace(/'/g, '')).filter(Boolean)
    }
    const getVersions = (s: string) => {
      const match = s.match(/versions:\s*\[([\s\S]*?)\]\s*as const/)
      if (!match) return []
      return match[1].split(',').map(v => v.trim().replace(/'/g, '')).filter(Boolean)
    }
    const getAliases = (s: string) => {
      const match = s.match(/aliases:\s*\[([\s\S]*?)\]\s*as const/)
      if (!match) return []
      return match[1].split(',').map(a => a.trim().replace(/'/g, '')).filter(Boolean)
    }
    const getDeps = (s: string) => {
      const match = s.match(/dependencies:\s*\[([\s\S]*?)\]\s*as const/)
      if (!match) return []
      return match[1].split(',').map(d => d.trim().replace(/'/g, '')).filter(Boolean)
    }

    return {
      name: getName(content),
      domain,
      description: getDesc(content),
      homepage: getHomepage(content),
      github: getGithub(content),
      programs: getPrograms(content),
      versions: getVersions(content),
      aliases: getAliases(content),
      dependencies: getDeps(content),
    }
  }
  return null
}

/** Extract the build script from an override by running modifyRecipe on a mock recipe */
function extractBuildScript(domain: string, override: any): { script: string[], platforms: string[] } | null {
  if (!override.modifyRecipe) return null

  // Create a mock recipe and let the override modify it
  const mockRecipe: any = {
    distributable: { url: 'https://placeholder.test/{{version}}.tar.gz' },
    dependencies: { 'mock.dep': '*' },
    build: {
      dependencies: { 'mock.build.dep': '*' },
      script: ['echo placeholder'],
      env: { PLACEHOLDER: 'true' },
    },
  }

  try {
    override.modifyRecipe(mockRecipe, 'darwin-arm64')
  }
  catch {
    return null
  }

  // Check if it's a pre-built binary pattern (distributable set to undefined)
  if (mockRecipe.distributable !== undefined && mockRecipe.distributable !== null) {
    return null // Not a pre-built binary
  }

  const script = mockRecipe.build?.script
  if (!script) return null

  const scriptLines = Array.isArray(script)
    ? script.flatMap((s: any) => typeof s === 'string' ? s.split('\n') : [s])
    : [String(script)]

  return {
    script: scriptLines.filter((s: string) => typeof s === 'string'),
    platforms: override.supportedPlatforms || [],
  }
}

/** Guess GitHub repo from homepage or github URL */
function guessGitHubRepo(meta: PackageMeta): string | null {
  const url = meta.github || meta.homepage
  if (!url) return null
  const match = url.match(/github\.com\/([^/]+\/[^/]+)/)
  return match ? match[1].replace(/\.git$/, '') : null
}

/** Generate a TS recipe file */
function generateRecipe(domain: string, meta: PackageMeta, script: string[], platforms: string[]): string {
  const repo = guessGitHubRepo(meta)
  const versionSource = repo
    ? `  versionSource: {\n    type: 'github-releases',\n    repo: '${repo}',\n    tagPattern: /^v(.+)$/,\n  },\n`
    : ''

  const escapedScript = script.map(line =>
    `    '${line.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`,
  ).join(',\n')

  const platformsStr = platforms.length > 0
    ? `  platforms: [${platforms.map(p => `'${p}'`).join(', ')}],\n`
    : ''

  return `import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: '${domain}',
  name: '${meta.name.replace(/'/g, "\\'")}',
  description: '${meta.description.replace(/'/g, "\\'")}',
  homepage: '${meta.homepage}',
${meta.github ? `  github: '${meta.github}',\n` : ''}  programs: [${meta.programs.map(p => `'${p}'`).join(', ')}],
${platformsStr}${versionSource}
  build: {
    script: [
${escapedScript},
    ],
  },
}
`
}

// ── Main ──────────────────────────────────────────────────────────────

let migrated = 0
let skipped = 0
let failed = 0

for (const [domain, override] of Object.entries(packageOverrides)) {
  if (targetDomain && domain !== targetDomain) continue

  // Skip if recipe already exists
  const recipePath = join(recipesDir, `${domain}.ts`)
  if (existsSync(recipePath)) {
    skipped++
    continue
  }

  // Extract build script from override
  const extracted = extractBuildScript(domain, override)
  if (!extracted) {
    // Not a pre-built binary override — skip for now
    skipped++
    continue
  }

  // Load package metadata
  const meta = loadPackageMeta(domain)
  if (!meta) {
    console.log(`  SKIP ${domain}: no TS package definition found`)
    skipped++
    continue
  }

  // Generate recipe
  const recipe = generateRecipe(domain, meta, extracted.script, extracted.platforms)

  if (dryRun) {
    console.log(`  [dry-run] Would create: src/recipes/${domain}.ts`)
    migrated++
    continue
  }

  // Write recipe file
  const outPath = join(recipesDir, `${domain}.ts`)
  mkdirSync(dirname(outPath), { recursive: true })
  writeFileSync(outPath, recipe)
  console.log(`  Created: src/recipes/${domain}.ts`)
  migrated++
}

console.log(`\nMigration complete: ${migrated} migrated, ${skipped} skipped, ${failed} failed`)
