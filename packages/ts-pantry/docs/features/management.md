# Package Management

ts-pkgx provides robust features for managing and accessing package information after it has been fetched.

## Package Index Generation

ts-pkgx can automatically generate an index file that exports all packages and provides utility functions for working with them:

```typescript
import { getPackage, pantry } from 'ts-pkgx'

// Access a package by domain
const bunPackage = pantry['bun.sh']

// Or by alias
const alsoBundle = getPackage('bun')
```

The index file is regenerated whenever you fetch or update packages, ensuring it's always up to date with the latest package information.

## Package Organization

ts-pkgx organizes packages in a structured way:

1. **Individual Package Files**: Each package has its own file (e.g., `nodejsorg.ts`, `bunsh.ts`) with its exported data
2. **Index File**: Provides a unified way to access all packages
3. **Pantry Object**: All packages are available in a single object, indexed by domain

This organization makes it easy to find and work with specific packages.

## Alias Support

ts-pkgx supports package aliases, making it easy to find packages by their common names rather than their full domain names:

```typescript
// These both return the same package
const nodeByDomain = getPackage('nodejs.org')
const nodeByAlias = getPackage('node')
```

The built-in aliases cover most common packages:

```typescript
const PACKAGE_ALIASES: Record<string, string> = {
  node: 'nodejs.org',
  python: 'python.org',
  go: 'go.dev',
  rust: 'rust-lang.org',
  ruby: 'ruby-lang.org',
  php: 'php.net',
  perl: 'perl.org',
  deno: 'deno.land',
  bun: 'bun.sh',
  // ... and many more
}
```

You can also extend this list with your own aliases for your specific needs.

## Automatic Updates

ts-pkgx provides tools for automatically updating package information:

```bash
# Update all packages
bun run pkgx:update
```

This ensures your package information stays up to date without requiring manual intervention.

## Package Catalog Generation

ts-pkgx can generate a comprehensive package catalog in markdown format:

```bash
# Generate package catalog
bun run pkgx:docs
```

This creates a well-organized document with all packages grouped by category, making it easy to browse and explore the available packages.

## Package Search

After fetching packages, you can easily search through them:

```typescript
import { pantry } from 'ts-pkgx'

// Find all packages related to JavaScript
const jsPackages = Object.values(pantry).filter(pkg =>
  pkg.description.toLowerCase().includes('javascript')
  || pkg.programs.some(prog => prog.includes('js'))
)

// Find packages by domain pattern
const rustPackages = Object.entries(pantry)
  .filter(([domain]) => domain.includes('rust'))
  .map(([_, pkg]) => pkg)
```

## Package Comparison

ts-pkgx makes it easy to compare packages:

```typescript
import { getPackage } from 'ts-pkgx'

// Compare Node.js and Deno
const node = getPackage('node')
const deno = getPackage('deno')

// Compare provided programs
const commonPrograms = node.programs.filter(prog => deno.programs.includes(prog))
```

This can be helpful for understanding the relationships between different packages and what functionality they provide.
