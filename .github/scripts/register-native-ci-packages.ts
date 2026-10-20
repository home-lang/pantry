import { mkdirSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { savePackageAsTypeScript } from '../../packages/ts-pantry/src/fetch'
import { recipeDepsToSpecs } from '../../packages/ts-pantry/src/dependency-spec'
import { generateIndex, generateAliases } from '../../packages/ts-pantry/src/generate'
import { generateZigDefinitions } from '../../packages/ts-pantry/src/generate-zig'
import { compareInstallerVersionsDesc } from '../../packages/ts-pantry/src/installer'
import type { Recipe } from '../../packages/ts-pantry/scripts/recipe-types'
import type { PkgxPackage } from '../../packages/ts-pantry/src/types'

/** Retain previously catalogued releases when registering a new native recipe. */
export function mergeRecipeVersions(previous: readonly string[], requested: readonly string[]): string[] {
  if (!requested.length || requested.some(version => !/^\d+(?:\.\d+){0,10}$/.test(version)))
    throw new Error('Native package registration requires exact stable versions')
  return [...new Set([...previous, ...requested])].sort(compareInstallerVersionsDesc)
}

if (import.meta.main) {
  const source = path.resolve(import.meta.dir, '../../packages/ts-pantry')
  const output = path.join(source, 'src/packages')
  const module = await import(pathToFileURL(path.join(output, 'index.ts')).href)
  const previous = Object.values(module.pantry) as PkgxPackage[]
  const seeds = await Bun.file(new URL('../maintenance/native-ci-packages.json', import.meta.url)).json() as Record<string, string[]>
  for (const [domain, requested] of Object.entries(seeds)) {
    if (!/^[a-z0-9][a-z0-9./_-]*$/i.test(domain) || domain.split('/').some(part => !part || part === '.' || part === '..'))
      throw new Error(`Invalid recipe domain: ${domain}`)
    const { recipe } = await import(pathToFileURL(path.join(source, 'src/recipes', `${domain}.ts`)).href) as { recipe: Recipe }
    if (recipe.domain !== domain) throw new Error(`Recipe identity mismatch: ${domain}`)
    const current = previous.find(pkg => pkg.domain === domain)
    savePackageAsTypeScript(output, domain, {
      ...current,
      name: recipe.name, domain, description: recipe.description || '', packageYmlUrl: current?.packageYmlUrl || '',
      homepageUrl: recipe.homepage || '', githubUrl: recipe.github || '',
      installCommand: `pantry install ${domain}`, pantryInstallCommand: `pantry install ${domain}`,
      programs: recipe.programs, ...(recipe.platformPrograms ? { platformPrograms: recipe.platformPrograms } : {}),
      ...(recipe.programVersions ? { programVersions: recipe.programVersions } : {}),
      companions: current?.companions || [], dependencies: recipeDepsToSpecs(recipe.dependencies),
      buildDependencies: recipeDepsToSpecs(recipe.buildDependencies),
      versions: mergeRecipeVersions(current?.versions || [], requested), aliases: current?.aliases || [recipe.name],
    })
  }
  if (!await generateIndex(output)) throw new Error('Native package index generation failed')
  await generateAliases(output)
  await generateZigDefinitions(output, path.resolve(source, '../zig/src/packages/generated.zig'))
  mkdirSync('artifacts/native-catalog', { recursive: true })
  await Bun.write('artifacts/native-catalog/registration.json', JSON.stringify({ at: new Date().toISOString(), seeds, bun: Bun.version }, null, 2) + '\n')
}
