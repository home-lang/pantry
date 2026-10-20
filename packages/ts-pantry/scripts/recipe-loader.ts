/**
 * Recipe Loader — Dual-path loader for package build recipes
 *
 * Tries to load a native TypeScript recipe from src/recipes/ first.
 * Loads native TS recipes from src/recipes/. YAML fallback is legacy (dirs deleted).
 *
 * This enables incremental migration: packages can be moved from YAML+overrides
 * to native TS recipes one at a time without breaking anything.
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Recipe, LoadedRecipe } from './recipe-types'
import type { NormalizedRecipe } from './buildkit'
import { evaluateCondition } from './buildkit'
import { programsForPlatform } from '../src/programs'
import { recipeBuildVersion } from './package-revisions'

// package-overrides.ts removed — overrides migrated to src/recipes/*.ts
const packageOverrides: Record<string, any> = {}

const scriptsDir = fileURLToPath(new URL('.', import.meta.url))
const tsPackagesDir = join(scriptsDir, '..', 'src')

/**
 * Load a recipe for a package domain.
 *
 * 1. Check src/recipes/{domain}.ts for a native TS recipe
 * 2. Fall back to src/pantry/{domain}/package.yml (or desktop-pantry/)
 * 3. Apply package-overrides.ts if loading from YAML
 */
// eslint-disable-next-line pickier/no-unused-vars
export async function loadRecipe(
  domain: string,
  _platform?: string,
  version?: string,
): Promise<LoadedRecipe & { yamlPath?: string }> {
  // 1. Try native TS recipe
  const recipePath = findRecipeFile(domain)
  if (recipePath) {
    try {
      const mod = await import(recipePath)
      const def: Recipe = mod.recipe || mod.default
      if (def) {
        const identity = version ? recipeBuildVersion(version, def.revisions) : undefined
        return {
          recipe: recipeDefToNormalized(def, _platform, identity?.upstream),
          upstreamVersion: identity?.upstream,
          publicationVersion: identity?.current,
          requiresRecipeBuild: Object.keys(def.revisions ?? {}).length > 0,
          source: 'recipe',
          propsDir: def.propsDir ? join(recipePath, '..', def.propsDir) : undefined,
        }
      }
    }
    catch (err) {
      console.warn(`[recipe-loader] Failed to load TS recipe for ${domain}: ${(err as Error).message}`)
      // Fall through to YAML
    }
  }

  // 2. Load YAML recipe (pantry or desktop-pantry)
  const yamlPath = findYamlRecipe(domain)
  if (!yamlPath) {
    throw new Error(`No recipe found for ${domain} (checked src/recipes/ and src/pantry/)`)
  }

  const content = readFileSync(yamlPath, 'utf-8')
  const recipe = Bun.YAML.parse(content) as Record<string, any>

  // 3. Normalize the build field
  const normalized = normalizeRecipe(recipe)

  // 4. Apply overrides
  const override = packageOverrides[domain]
  let source: 'yaml' | 'yaml+override' = 'yaml'
  if (override) {
    source = 'yaml+override'
    if (override.modifyRecipe) {
      override.modifyRecipe(normalized as NormalizedRecipe, _platform)
    }
    if (override.distributableUrl && normalized.distributable) {
      (normalized.distributable as any).url = override.distributableUrl
    }
    if (override.env) {
      if (!normalized.build) normalized.build = {}
      normalized.build.env = { ...(normalized.build.env || {}), ...override.env }
    }
    if (override.prependScript && normalized.build?.script) {
      const existing = Array.isArray(normalized.build.script) ? normalized.build.script : [normalized.build.script]
      normalized.build.script = [...override.prependScript.map((s: any) => typeof s === 'string' ? s : s.run), ...existing]
    }
  }

  return {
    recipe: normalized,
    source,
    yamlPath,
    propsDir: existsSync(join(yamlPath, '..', 'props')) ? join(yamlPath, '..', 'props') : undefined,
  }
}

// Lazy `<filename>.ts` → absolute path index, so recipes organised into
// subfolders (e.g. recipes/fonts/, recipes/apps/) resolve without the domain
// having to encode the folder. Domain filenames (ghostty.org.ts, inter.font.ts)
// are unique, so a basename index is collision-free for these.
let _recipeIndex: Map<string, string> | null = null
function recipeIndex(): Map<string, string> {
  if (_recipeIndex)
    return _recipeIndex
  const map = new Map<string, string>()
  const recipesDir = join(tsPackagesDir, 'recipes')
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name)
      if (entry.isDirectory())
        walk(full)
      else if (entry.name.endsWith('.ts') && !map.has(entry.name))
        map.set(entry.name, full)
    }
  }
  if (existsSync(recipesDir))
    walk(recipesDir)
  _recipeIndex = map
  return map
}

/** Find a native TS recipe file for a domain */
function findRecipeFile(domain: string): string | null {
  const recipesDir = join(tsPackagesDir, 'recipes')
  // Try exact file: src/recipes/domain.ts
  const flat = join(recipesDir, `${domain}.ts`)
  if (existsSync(flat)) return flat
  // Try nested: src/recipes/domain/index.ts or src/recipes/parent/child.ts
  const nested = join(recipesDir, domain, 'index.ts')
  if (existsSync(nested)) return nested
  // Try with path separator: src/recipes/parent/child.ts
  const parts = domain.split('/')
  if (parts.length > 1) {
    const nestedFile = join(recipesDir, ...parts.slice(0, -1), `${parts[parts.length - 1]}.ts`)
    if (existsSync(nestedFile)) return nestedFile
  }
  // Fallback: a `<basename>.ts` file anywhere under recipes/ (subfolder layout).
  // For slash-domains (logitech.com/options-plus) the file is named by the last
  // path segment (options-plus.ts), not the whole domain — try both keys.
  const idx = recipeIndex()
  const lastSegment = parts[parts.length - 1]
  return idx.get(`${domain}.ts`) ?? (parts.length > 1 ? idx.get(`${lastSegment}.ts`) ?? null : null)
}

/** Find a YAML recipe file in pantry or desktop-pantry */
function findYamlRecipe(domain: string): string | null {
  const pantryPath = join(tsPackagesDir, 'pantry', domain, 'package.yml')
  if (existsSync(pantryPath)) return pantryPath
  const desktopPath = join(tsPackagesDir, 'desktop-pantry', domain, 'package.yml')
  if (existsSync(desktopPath)) return desktopPath
  return null
}

/** Normalize a YAML recipe's build field to object form */
function normalizeRecipe(recipe: Record<string, any>): Record<string, any> {
  const normalized = { ...recipe }
  if (typeof normalized.build === 'string') {
    normalized.build = { script: [normalized.build] }
  }
  else if (Array.isArray(normalized.build)) {
    normalized.build = { script: normalized.build }
  }
  return normalized
}

/** Convert a native Recipe to buildkit-compatible format */
function recipeDefToNormalized(def: Recipe, platform = '', version?: string): Record<string, any> {
  let dependencies = { ...def.dependencies }
  let buildDependencies = { ...def.buildDependencies }
  for (const override of def.dependencyOverrides || []) {
    if (version && evaluateCondition(override.if, platform, version)) {
      dependencies = { ...dependencies, ...override.dependencies }
      buildDependencies = { ...buildDependencies, ...override.buildDependencies }
    }
  }
  return {
    distributable: def.distributable
      ? { url: typeof def.distributable.url === 'function' ? (version ? def.distributable.url(version, platform) : '') : def.distributable.url, 'strip-components': def.distributable.stripComponents }
      : undefined,
    dependencies,
    build: {
      dependencies: buildDependencies,
      script: def.build.script,
      env: def.build.env || {},
      // Recipes author this as kebab-case `working-directory` (matching buildkit's
      // reader and the per-step field); fall back to camelCase for older defs.
      'working-directory': (def.build as any)['working-directory'] ?? def.build.workingDirectory,
      skip: def.build.skip,
    },
    programs: programsForPlatform(def, platform, version),
    platformPrograms: def.platformPrograms,
    platformProgramOverrides: def.platformProgramOverrides,
    programVersions: def.programVersions,
    platforms: def.platforms,
    publish: def.publish,
    sourceablePrograms: def.sourceablePrograms,
    runtimeResources: typeof def.runtimeResources === 'function' ? version ? def.runtimeResources(version) : [] : def.runtimeResources,
    test: def.test
      ? { script: def.test.script, env: def.test.env, required: def.test.required }
      : undefined,
  }
}
