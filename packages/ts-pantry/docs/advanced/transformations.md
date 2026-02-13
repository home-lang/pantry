# Custom Package Transformations

ts-pkgx allows you to implement custom transformations for package data to suit your specific needs.

## Basic Transformation

You can implement custom transformation logic when processing packages:

```typescript
import type { PkgxPackage } from 'ts-pkgx'
import { fetchPantryPackage } from 'ts-pkgx'

async function fetchAndTransform(packageName: string): Promise<PkgxPackage> {
  const { packageInfo } = await fetchPantryPackage(packageName)

  // Add custom metadata
  const enhancedPackage: PkgxPackage = {
    ...packageInfo,
    description: `${packageInfo.description} [Enhanced]`,
    // Add custom fields or modify existing ones
    customCategory: determineCategory(packageInfo),
  }

  return enhancedPackage
}

function determineCategory(pkg: PkgxPackage): string {
  if (pkg.domain.includes('lang'))
    return 'programming-language'
  if (pkg.programs.some(p => p.includes('server')))
    return 'server'
  return 'utility'
}
```

This approach allows you to extend the basic package information with your own custom fields or modify existing ones.

## Transform Packages in Batches

You can apply transformations to multiple packages at once:

```typescript
import { fetchPantryPackage } from 'ts-pkgx'
import { fetchPackageListFromGitHub } from 'ts-pkgx/utils'

async function transformPackageBatch(category: string): Promise<PkgxPackage[]> {
  // Get all packages from GitHub
  const allPackages = await fetchPackageListFromGitHub()

  // Filter packages by category (example: languages)
  const filteredPackages = allPackages.filter(pkg =>
    pkg.includes('lang') || ['python', 'node', 'ruby', 'go'].some(lang => pkg.includes(lang))
  )

  // Fetch and transform each package
  const results = await Promise.all(
    filteredPackages.map(async (pkg) => {
      try {
        const { packageInfo } = await fetchPantryPackage(pkg)
        return {
          ...packageInfo,
          category,
          importance: calculateImportance(packageInfo),
        }
      }
      catch (error) {
        console.error(`Error processing ${pkg}:`, error)
        return null
      }
    })
  )

  // Filter out nulls from errors
  return results.filter(Boolean) as PkgxPackage[]
}

function calculateImportance(pkg: PkgxPackage): number {
  let score = 0
  // More programs = higher score
  score += pkg.programs.length * 2
  // More dependencies = higher complexity = higher score
  score += pkg.dependencies.length
  // Has GitHub URL = higher score
  score += pkg.githubUrl ? 5 : 0
  return score
}

// Usage
const languagePackages = await transformPackageBatch('programming-languages')
```

## Custom Package Analysis

You can create functions to analyze package data:

```typescript
function analyzePackageDependencies(pkg: PkgxPackage): {
  directDeps: string[]
  hasCyclicDeps: boolean
  depthLevel: number
} {
  // Implementation of dependency analysis
  const directDeps = pkg.dependencies

  // Check for circular dependencies (simplified example)
  const hasCyclicDeps = pkg.dependencies.some((dep) => {
    const depPkg = getPackage(dep)
    return depPkg && depPkg.dependencies.includes(pkg.domain)
  })

  // Calculate dependency depth (simplified)
  const depthLevel = Math.min(3, pkg.dependencies.length > 0 ? 1 : 0)

  return { directDeps, hasCyclicDeps, depthLevel }
}
```

## Extending Package Properties

You can extend the basic PkgxPackage interface with additional properties:

```typescript
// Extended package type with custom properties
interface ExtendedPkgxPackage extends PkgxPackage {
  category: string
  popularity: number
  latestVersion: string
  installOptions: {
    global: string
    local: string
  }
}

function extendPackage(pkg: PkgxPackage): ExtendedPkgxPackage {
  return {
    ...pkg,
    category: determineCategory(pkg),
    popularity: calculatePopularity(pkg),
    latestVersion: pkg.versions[0] || 'unknown',
    installOptions: {
      global: `pkgx ${pkg.domain} --global`,
      local: `pkgx ${pkg.domain}`
    }
  }
}
```

## Save Transformed Packages

You can save your transformed packages in custom formats:

```typescript
import fs from 'node:fs'
import path from 'node:path'

function saveTransformedPackage(
  pkg: ExtendedPkgxPackage,
  outputDir: string
): void {
  const fileName = `${pkg.domain.replace(/\./g, '_')}.json`
  const filePath = path.join(outputDir, fileName)

  fs.writeFileSync(
    filePath,
    JSON.stringify(pkg, null, 2)
  )

  console.log(`Saved transformed package to ${filePath}`)
}
```

## Transform During Fetch

You can integrate transformations directly into the fetch process:

```typescript
// Modify the fetchAndSavePackage function to include transformations
async function fetchTransformAndSavePackage(
  packageName: string,
  outputDir: string,
  transformer: (pkg: PkgxPackage) => PkgxPackage
): Promise<{ success: boolean, filePath?: string }> {
  try {
    // Fetch the package
    const { packageInfo } = await fetchPantryPackage(packageName)

    // Apply the transformation
    const transformedPackage = transformer(packageInfo)

    // Save the transformed package
    const fileName = `${packageName.replace(/\./g, '')}.json`
    const filePath = path.join(outputDir, fileName)

    fs.writeFileSync(filePath, JSON.stringify(transformedPackage, null, 2))

    return { success: true, filePath }
  }
  catch (error) {
    console.error(`Error processing ${packageName}:`, error)
    return { success: false }
  }
}
```

This customization capability allows you to tailor the package data to your specific requirements.
