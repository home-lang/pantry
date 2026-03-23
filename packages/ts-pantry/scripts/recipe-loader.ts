/**
 * Recipe Loader — Dual-path loader for package build recipes
 *
 * Tries to load a native TypeScript recipe from src/recipes/ first.
 * Falls back to YAML recipe from src/pantry/ (or desktop-pantry/) + package-overrides.ts.
 *
 * This enables incremental migration: packages can be moved from YAML+overrides
 * to native TS recipes one at a time without breaking anything.
 */

import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { RecipeDefinition, LoadedRecipe } from './recipe-types'
import type { NormalizedRecipe } from './buildkit'

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
export async function loadRecipe(
  domain: string,
  platform?: string,
): Promise<LoadedRecipe & { yamlPath?: string }> {
  // 1. Try native TS recipe
  const recipePath = findRecipeFile(domain)
  if (recipePath) {
    try {
      const mod = await import(recipePath)
      const def: RecipeDefinition = mod.recipe || mod.default
      if (def) {
        return {
          recipe: recipeDefToNormalized(def),
          source: 'recipe',
          propsDir: def.propsDir ? join(recipePath, '..', def.propsDir) : undefined,
        }
      }
    }
    catch {
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
      override.modifyRecipe(normalized as NormalizedRecipe, platform)
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
      normalized.build.script = [...override.prependScript.map(s => typeof s === 'string' ? s : s.run), ...existing]
    }
  }

  return {
    recipe: normalized,
    source,
    yamlPath,
    propsDir: existsSync(join(yamlPath, '..', 'props')) ? join(yamlPath, '..', 'props') : undefined,
  }
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
  return null
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

/** Convert a native RecipeDefinition to buildkit-compatible format */
function recipeDefToNormalized(def: RecipeDefinition): Record<string, any> {
  return {
    distributable: def.distributable
      ? { url: def.distributable.url, 'strip-components': def.distributable.stripComponents }
      : def.distributable === null
        ? undefined
        : undefined,
    dependencies: def.dependencies || {},
    build: {
      dependencies: def.buildDependencies || {},
      script: def.build.script,
      env: def.build.env || {},
      'working-directory': def.build.workingDirectory,
      skip: def.build.skip,
    },
    platforms: def.platforms,
    test: def.test
      ? { script: def.test.script, env: def.test.env }
      : undefined,
  }
}
