# Domain Handling

ts-pkgx provides sophisticated tools for working with package domains and managing path conversions.

## Nested Path Support

ts-pkgx properly handles packages with nested paths, such as `agwa.name/git-crypt`:

```typescript
// Fetch a nested package
const gitCrypt = await fetchPantryPackage('agwa.name/git-crypt')

// Access a nested package
const gitCryptPackage = getPackage('agwa.name/git-crypt')

// Or by subpath alias
const alsoGitCrypt = getPackage('git-crypt')
```

This ensures that you can work with all packages, regardless of their path structure.

## Domain Utilities

ts-pkgx provides utility functions for converting between domain names, variable names, and file names:

```typescript
import { convertDomainToFileName, convertDomainToVarName, guessOriginalDomain } from 'ts-pkgx/tools/domainUtils'

// Convert domain to variable name
const varName = convertDomainToVarName('bun.sh') // "bunsh"
const nestedVarName = convertDomainToVarName('agwa.name/git-crypt') // "agwanamegitcrypt"

// Convert domain to file name
const fileName = convertDomainToFileName('bun.sh') // "bunsh"
const nestedFileName = convertDomainToFileName('agwa.name/git-crypt') // "agwaname-gitcrypt"

// Guess original domain from filename
const domain = guessOriginalDomain('bunsh') // "bun.sh"
const nestedDomain = guessOriginalDomain('agwaname-gitcrypt') // "agwa.name/gitcrypt"
```

These utilities make it easy to convert between different naming conventions.

## Automatic Domain Resolution

ts-pkgx automatically resolves package names to their full domain names:

```typescript
// These all resolve to 'nodejs.org'
await fetchPantryPackage('node')
await fetchPantryPackage('nodejs')
await fetchPantryPackage('nodejs.org')
```

This allows users to refer to packages in different ways, while still getting the correct results.

## Safeguarding Package Names

ts-pkgx ensures that package names are safe for use as variable names and file names:

1. Converting dots to empty strings: `node.js` → `nodejs`
2. Handling special characters: `/` → `-`
3. Making names TypeScript-friendly

This lets you safely use package names in generated TypeScript files.

## Domain Validation

ts-pkgx validates domain names to ensure they are properly formatted:

```typescript
// Valid domains
fetchPantryPackage('nodejs.org')
fetchPantryPackage('bun.sh')
fetchPantryPackage('agwa.name/git-crypt')

// Handled automatically
fetchPantryPackage('node') // Resolves to nodejs.org
```

## Domain Aliases

ts-pkgx maintains a map of aliases to full domain names:

```typescript
const PACKAGE_ALIASES: Record<string, string> = {
  node: 'nodejs.org',
  python: 'python.org',
  // ... and many more
}
```

You can extend this map with your own aliases:

```typescript
import { PACKAGE_ALIASES } from 'ts-pkgx'

// Add your custom aliases
PACKAGE_ALIASES.js = 'nodejs.org'
PACKAGE_ALIASES.py = 'python.org'
```

## Path Normalization

ts-pkgx normalizes package paths to ensure consistent handling:

```typescript
// These all resolve to the same package
getPackage('agwa.name/git-crypt')
getPackage('git-crypt')
getPackage('agwaname/git-crypt')
```

This makes it easier to work with packages that have complex paths.

## Subpath Extraction

For nested paths, ts-pkgx automatically extracts the relevant parts:

```typescript
const { packageInfo, originalName, fullDomainName } = await fetchPantryPackage('agwa.name/git-crypt')

console.log(originalName) // 'agwa.name/git-crypt'
console.log(fullDomainName) // 'agwa.name/git-crypt'
console.log(packageInfo.name) // 'git-crypt' (just the subpath)
```

This allows for more intuitive handling of nested packages.
