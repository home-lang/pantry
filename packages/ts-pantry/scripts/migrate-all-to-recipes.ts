#!/usr/bin/env bun

/**
 * Migrate ALL packages to native TS recipes.
 *
 * Reads every package.yml in src/pantry/ and src/desktop-pantry/,
 * applies any overrides from package-overrides.ts, and generates
 * a standalone src/recipes/{domain}.ts file.
 *
 * This handles ALL categories:
 *   - Pre-built binaries (already done by migrate-to-recipes.ts, skipped)
 *   - Source builds with standard build systems (autoconf/cmake/meson/make)
 *   - Complex builds with heavy overrides
 *
 * Usage:
 *   bun scripts/migrate-all-to-recipes.ts [--dry-run] [--force] [--domain <domain>]
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { packageOverrides } from './package-overrides'
import type { NormalizedRecipe } from './buildkit'

const baseDir = join(import.meta.dir, '..')
const recipesDir = join(baseDir, 'src', 'recipes')
const packagesDir = join(baseDir, 'src', 'packages')
const pantryDir = join(baseDir, 'src', 'pantry')
const desktopPantryDir = join(baseDir, 'src', 'desktop-pantry')

const dryRun = process.argv.includes('--dry-run')
const force = process.argv.includes('--force')
const targetDomain = process.argv.includes('--domain')
  ? process.argv[process.argv.indexOf('--domain') + 1]
  : null

function parseYaml(content: string): Record<string, any> {
  return Bun.YAML.parse(content) as Record<string, any>
}

function domainToKey(domain: string): string {
  return domain.replace(/[.\-/]/g, '').toLowerCase()
}

// ── Find all YAML recipes ─────────────────────────────────────────────

interface YamlPackage {
  domain: string
  yamlPath: string
  isDesktopApp: boolean
}

function findAllYamls(): YamlPackage[] {
  const packages: YamlPackage[] = []

  function scan(dir: string, prefix: string, isDesktop: boolean): void {
    if (!existsSync(dir)) return
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        scan(join(dir, entry.name), prefix ? `${prefix}/${entry.name}` : entry.name, isDesktop)
      }
      else if (entry.name === 'package.yml' && prefix) {
        packages.push({ domain: prefix, yamlPath: join(dir, entry.name), isDesktopApp: isDesktop })
      }
    }
  }

  scan(pantryDir, '', false)
  scan(desktopPantryDir, '', true)
  return packages
}

// ── Load package metadata from TS definitions ─────────────────────────

interface PkgMeta {
  name: string
  description: string
  homepage: string
  github: string
  programs: string[]
  versions: string[]
  dependencies: string[]
  buildDependencies: string[]
}

function loadPkgMeta(domain: string): PkgMeta | null {
  const key = domainToKey(domain)
  const file = join(packagesDir, `${key}.ts`)
  if (!existsSync(file)) return null
  const content = readFileSync(file, 'utf-8')

  const extract = (pattern: RegExp): string => content.match(pattern)?.[1] || ''
  const extractArray = (field: string): string[] => {
    const match = content.match(new RegExp(`${field}:\\s*\\[([\\s\\S]*?)\\]\\s*as const`))
    if (!match) return []
    return match[1].split(',').map(v => v.trim().replace(/'/g, '')).filter(Boolean)
  }

  return {
    name: extract(/name:\s*'([^']+)'/),
    description: extract(/description:\s*'([^']+)'/),
    homepage: extract(/homepageUrl:\s*'([^']+)'/),
    github: extract(/githubUrl:\s*'([^']+)'/),
    programs: extractArray('programs'),
    versions: extractArray('versions'),
    dependencies: extractArray('dependencies'),
    buildDependencies: extractArray('buildDependencies'),
  }
}

// ── Apply overrides to get final recipe ───────────────────────────────

function applyOverrides(recipe: Record<string, any>, domain: string, platform: string): Record<string, any> {
  // Normalize build
  if (typeof recipe.build === 'string') recipe.build = { script: [recipe.build] }
  else if (Array.isArray(recipe.build)) recipe.build = { script: recipe.build }

  const override = packageOverrides[domain]
  if (!override) return recipe

  if (override.modifyRecipe) {
    try { override.modifyRecipe(recipe as NormalizedRecipe, platform) }
    catch {}
  }
  if (override.distributableUrl && recipe.distributable) {
    recipe.distributable.url = override.distributableUrl
  }
  if (override.stripComponents !== undefined && recipe.distributable) {
    recipe.distributable['strip-components'] = override.stripComponents
  }
  if (override.env) {
    if (!recipe.build) recipe.build = {}
    recipe.build.env = { ...(recipe.build.env || {}), ...override.env }
  }
  if (override.prependScript && recipe.build?.script) {
    const existing = Array.isArray(recipe.build.script) ? recipe.build.script : [recipe.build.script]
    recipe.build.script = [
      ...override.prependScript.map((s: any) => typeof s === 'string' ? s : (s.run || '')),
      ...existing,
    ]
  }
  if (override.supportedPlatforms) {
    recipe.platforms = override.supportedPlatforms
  }

  return recipe
}

// ── Guess version source from YAML and GitHub URL ─────────────────────

function guessVersionSource(yaml: Record<string, any>, github: string): string {
  // Check YAML versions.github field
  const ghRepo = yaml.versions?.github
  if (ghRepo) {
    const strip = yaml.versions?.strip
    const patternStr = strip
      ? `    tagPattern: /${strip.toString().replace(/\//g, '\\/')}/,\n`
      : ''
    return `  versionSource: {\n    type: 'github-releases',\n    repo: '${ghRepo}',\n${patternStr}  },\n`
  }

  // Check GitHub URL from TS definition
  if (github) {
    const match = github.match(/github\.com\/([^/]+\/[^/]+)/)
    if (match) {
      return `  versionSource: {\n    type: 'github-releases',\n    repo: '${match[1].replace(/\.git$/, '')}',\n    tagPattern: /^v(.+)$/,\n  },\n`
    }
  }

  return ''
}

// ── Convert script to TS string array ─────────────────────────────────

function scriptToTs(script: any): string[] {
  if (!script) return ['echo "no build script"']
  if (typeof script === 'string') return script.split('\n')
  if (Array.isArray(script)) {
    return script.flatMap((step: any) => {
      if (typeof step === 'string') return step.split('\n')
      if (step?.run) {
        const run = typeof step.run === 'string' ? step.run : step.run.join('\n')
        const lines = run.split('\n')
        if (step['working-directory']) {
          return [`cd "${step['working-directory']}"`, ...lines]
        }
        return lines
      }
      return []
    })
  }
  return []
}

// ── Convert env to TS ─────────────────────────────────────────────────

function envToTs(env: Record<string, any> | undefined): string {
  if (!env || Object.keys(env).length === 0) return ''
  const entries: string[] = []
  for (const [key, value] of Object.entries(env)) {
    // Skip platform sub-objects for now
    if (typeof value === 'object' && !Array.isArray(value)) continue
    if (Array.isArray(value)) {
      entries.push(`      '${key}': [${value.map((v: string) => `'${escapeTs(String(v))}'`).join(', ')}]`)
    }
    else {
      entries.push(`      '${key}': '${escapeTs(String(value))}'`)
    }
  }
  if (entries.length === 0) return ''
  return `    env: {\n${entries.join(',\n')},\n    },\n`
}

// ── Convert dependencies to TS ────────────────────────────────────────

function depsToTs(deps: Record<string, any> | undefined, fieldName: string): string {
  if (!deps || Object.keys(deps).length === 0) return ''
  const entries: string[] = []
  for (const [key, value] of Object.entries(deps)) {
    // Skip platform sub-objects
    if (['darwin', 'linux', 'windows'].includes(key)) continue
    entries.push(`    '${key}': '${String(value)}'`)
  }
  if (entries.length === 0) return ''
  return `  ${fieldName}: {\n${entries.join(',\n')},\n  },\n`
}

function escapeTs(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

// ── Generate recipe file ──────────────────────────────────────────────

function generateRecipeFile(
  domain: string,
  yaml: Record<string, any>,
  meta: PkgMeta | null,
  isDesktopApp: boolean,
): string {
  const name = meta?.name || domain
  const desc = meta?.description || ''
  const homepage = meta?.homepage || ''
  const github = meta?.github || ''
  const programs = meta?.programs || yaml.provides?.filter((p: string) => p.startsWith('bin/')).map((p: string) => p.replace('bin/', '')) || []

  const distributable = yaml.distributable
    ? `  distributable: {\n    url: '${escapeTs(yaml.distributable.url)}',\n${yaml.distributable['strip-components'] !== undefined ? `    stripComponents: ${yaml.distributable['strip-components']},\n` : ''}  },\n`
    : yaml.distributable === undefined
      ? ''
      : '  distributable: null,\n'

  const platforms = yaml.platforms
    ? `  platforms: [${(Array.isArray(yaml.platforms) ? yaml.platforms : [yaml.platforms]).map((p: string) => `'${p}'`).join(', ')}],\n`
    : ''

  const versionSource = guessVersionSource(yaml, github)

  const deps = depsToTs(yaml.dependencies, 'dependencies')
  const buildDeps = depsToTs(yaml.build?.dependencies, 'buildDependencies')

  const script = scriptToTs(yaml.build?.script)
  const env = envToTs(yaml.build?.env)
  const skip = yaml.build?.skip
    ? `    skip: [${(Array.isArray(yaml.build.skip) ? yaml.build.skip : [yaml.build.skip]).map((s: string) => `'${s}'`).join(', ')}],\n`
    : ''

  const escapedScript = script.map(line => `      '${escapeTs(line)}'`).join(',\n')

  return `import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: '${domain}',
  name: '${escapeTs(name)}',
${desc ? `  description: '${escapeTs(desc)}',\n` : ''}${homepage ? `  homepage: '${homepage}',\n` : ''}${github ? `  github: '${github}',\n` : ''}  programs: [${programs.map((p: string) => `'${p}'`).join(', ')}],
${platforms}${versionSource}${distributable}${deps}${buildDeps}
  build: {
    script: [
${escapedScript},
    ],
${env}${skip}  },
}
`
}

// ── Main ──────────────────────────────────────────────────────────────

const allYamls = findAllYamls()
console.log(`Found ${allYamls.length} YAML packages to process\n`)

let migrated = 0
let skipped = 0
let errors = 0

for (const { domain, yamlPath, isDesktopApp } of allYamls) {
  if (targetDomain && domain !== targetDomain) continue

  // Skip if native recipe already exists (unless --force)
  const recipePath = join(recipesDir, `${domain}.ts`)
  if (existsSync(recipePath) && !force) {
    skipped++
    continue
  }

  try {
    // Parse YAML
    const yamlContent = readFileSync(yamlPath, 'utf-8')
    const yaml = parseYaml(yamlContent)

    // Apply overrides to get final recipe
    const final = applyOverrides({ ...yaml }, domain, 'darwin-arm64')

    // Load TS package metadata
    const meta = loadPkgMeta(domain)
    if (!meta) {
      // No TS definition — skip (can't determine programs/versions)
      skipped++
      continue
    }

    // Generate recipe
    const recipeContent = generateRecipeFile(domain, final, meta, isDesktopApp)

    if (dryRun) {
      migrated++
      continue
    }

    // Write recipe file
    mkdirSync(dirname(recipePath), { recursive: true })
    writeFileSync(recipePath, recipeContent)
    migrated++
  }
  catch (err: any) {
    errors++
    if (targetDomain) console.error(`  ERROR ${domain}: ${err.message}`)
  }
}

console.log(`\nMigration complete: ${migrated} migrated, ${skipped} skipped (already have recipe), ${errors} errors`)
console.log(`Total recipes: ${migrated + skipped} (of ${allYamls.length} YAML packages)`)
