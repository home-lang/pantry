import type { PkgxPackage } from '../src/types'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { recipeDepsToSpecs } from '../src/dependency-spec'
import { savePackageAsTypeScript } from '../src/fetch'
import { loadRecipe } from './recipe-loader'

/** Regenerate dependency metadata from the recipe that owns the actual build. */
export async function syncRecipeDependencies(domains: string[]): Promise<void> {
  const output = path.resolve(import.meta.dir, '../src/packages')
  for (const domain of domains) {
    if (!/^[a-z0-9][a-z0-9./_-]*$/i.test(domain) || domain.split('/').some(part => !part || part === '.' || part === '..'))
      throw new Error(`Invalid package domain: ${domain}`)
    const filename = domain.includes('/') ? domain : domain.replace(/\./g, '')
    const module = await import(pathToFileURL(path.join(output, `${filename}.ts`)).href)
    const current = Object.values(module).find((value): value is PkgxPackage =>
    !!value && typeof value === 'object' && 'domain' in value && value.domain === domain,
  )
  if (!current) throw new Error(`No generated metadata for ${domain}`)
  const { recipe } = await loadRecipe(domain)
  savePackageAsTypeScript(output, domain, {
    ...current,
    dependencies: recipeDepsToSpecs(recipe.dependencies),
    buildDependencies: recipeDepsToSpecs(recipe.build?.dependencies),
  })
  console.log(`Regenerated recipe dependencies: ${domain}`)
}
}

if (import.meta.main) {
  const domains = process.argv.slice(2)
  if (!domains.length) throw new Error('Pass the package domains to regenerate')
  await syncRecipeDependencies(domains)
}
