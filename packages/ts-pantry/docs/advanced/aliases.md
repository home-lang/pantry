# Extending the Aliases System

ts-pkgx includes a built-in aliases system that maps common package names to their full domain names. You can extend this system to customize it for your specific needs.

## Understanding the Aliases System

The aliases system is a simple mapping from shorthand names to full domain names:

```typescript
import { PACKAGE_ALIASES } from 'ts-pkgx/fetch'

// Examine the built-in aliases
console.log(PACKAGE_ALIASES)
```

The default aliases include mappings like:

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

## Adding Custom Aliases

You can add your own aliases to the system:

```typescript
import { PACKAGE_ALIASES } from 'ts-pkgx/fetch'

// Add custom aliases
function extendAliases(customAliases: Record<string, string>): void {
  Object.entries(customAliases).forEach(([alias, domain]) => {
    if (!PACKAGE_ALIASES[alias]) {
      PACKAGE_ALIASES[alias] = domain
      console.log(`Added alias: ${alias} -> ${domain}`)
    }
  })
}

// Usage
extendAliases({
  js: 'nodejs.org',
  py: 'python.org',
  rs: 'rust-lang.org',
  bunjs: 'bun.sh',
})
```

This allows you to use your preferred shorthand names when fetching packages.

## Organization-Specific Aliases

For teams or organizations, you might want to create a set of standardized aliases:

```typescript
// Organization-specific aliases for a team
const ORGANIZATION_ALIASES: Record<string, string> = {
  'web-server': 'nginx.org',
  'db': 'postgresql.org',
  'cache': 'redis.io',
  'mq': 'rabbitmq.com',
  'search': 'elastic.co',
  'frontend': 'reactjs.org',
}

// Extend the standard aliases with organization-specific ones
extendAliases(ORGANIZATION_ALIASES)
```

## Creating Category Aliases

You can create aliases that represent categories of packages:

```typescript
// Map categories to their representative package
const CATEGORY_ALIASES: Record<string, string> = {
  'js-runtime': 'nodejs.org',
  'py-runtime': 'python.org',
  'database': 'postgresql.org',
  'container': 'docker.com',
  'orchestration': 'kubernetes.io',
}

extendAliases(CATEGORY_ALIASES)
```

## Aliases for Nested Paths

For packages with nested paths, you can create aliases for easier access:

```typescript
// Aliases for nested paths
const NESTED_PATH_ALIASES: Record<string, string> = {
  'git-crypt': 'agwa.name/git-crypt',
  'bun-create': 'github.com/oven-sh/create-bun',
  'cargo-generate': 'github.com/cargo-generate/cargo-generate',
}

extendAliases(NESTED_PATH_ALIASES)
```

## Version-Specific Aliases

You can create aliases for specific versions of packages:

```typescript
// Aliases for specific versions
const VERSION_ALIASES: Record<string, string> = {
  'node16': 'nodejs.org@16',
  'node18': 'nodejs.org@18',
  'node20': 'nodejs.org@20',
  'python3.9': 'python.org@3.9',
  'python3.10': 'python.org@3.10',
}

// You would need to modify the resolver to handle the version part
function resolveVersionedAlias(alias: string): { domain: string, version?: string } {
  if (VERSION_ALIASES[alias]) {
    const [domain, version] = VERSION_ALIASES[alias].split('@')
    return { domain, version }
  }

  if (PACKAGE_ALIASES[alias]) {
    return { domain: PACKAGE_ALIASES[alias] }
  }

  return { domain: alias }
}
```

## Persisting Custom Aliases

For persistent customization, you can save and load your aliases:

```typescript
import fs from 'node:fs'
import path from 'node:path'

const ALIASES_FILE = path.join(process.cwd(), 'pkgx-aliases.json')

// Save aliases to a file
function saveAliases(): void {
  fs.writeFileSync(ALIASES_FILE, JSON.stringify(PACKAGE_ALIASES, null, 2))
  console.log(`Saved aliases to ${ALIASES_FILE}`)
}

// Load aliases from a file
function loadAliases(): void {
  if (fs.existsSync(ALIASES_FILE)) {
    try {
      const aliases = JSON.parse(fs.readFileSync(ALIASES_FILE, 'utf8'))
      extendAliases(aliases)
      console.log(`Loaded aliases from ${ALIASES_FILE}`)
    }
    catch (error) {
      console.error('Error loading aliases:', error)
    }
  }
}

// Initialize aliases when your application starts
loadAliases()

// Save aliases when your application exits
process.on('exit', saveAliases)
```

## Generating Aliases Automatically

You can generate aliases automatically based on domain patterns:

```typescript
import { pantry } from 'ts-pkgx'

// Generate aliases for all packages
function generateAliases(): Record<string, string> {
  const generatedAliases: Record<string, string> = {}

  for (const [domain, pkg] of Object.entries(pantry)) {
    // Basic name alias (remove spaces and lowercase)
    const nameAlias = pkg.name.toLowerCase().replace(/\s+/g, '')
    if (!PACKAGE_ALIASES[nameAlias] && nameAlias !== domain) {
      generatedAliases[nameAlias] = domain
    }

    // First word of the domain (before the dot)
    const domainFirstPart = domain.split('.')[0]
    if (!PACKAGE_ALIASES[domainFirstPart] && domainFirstPart !== domain) {
      generatedAliases[domainFirstPart] = domain
    }

    // For packages with programs, use the main program name as an alias
    if (pkg.programs.length > 0) {
      const mainProgram = pkg.programs[0]
      if (!PACKAGE_ALIASES[mainProgram] && mainProgram !== domain) {
        generatedAliases[mainProgram] = domain
      }
    }
  }

  return generatedAliases
}

// Generate and extend aliases
const autoAliases = generateAliases()
extendAliases(autoAliases)
```

## CLI for Alias Management

You can add CLI commands to manage aliases:

```typescript
cli
  .command('alias <name> <domain>', 'Add a package alias')
  .action((name, domain) => {
    PACKAGE_ALIASES[name] = domain
    console.log(`Added alias: ${name} -> ${domain}`)
    saveAliases()
  })

cli
  .command('aliases', 'List all package aliases')
  .action(() => {
    console.log('Package aliases:')
    Object.entries(PACKAGE_ALIASES)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([alias, domain]) => {
        console.log(`  ${alias.padEnd(15)} -> ${domain}`)
      })
  })

cli
  .command('remove-alias <name>', 'Remove a package alias')
  .action((name) => {
    if (PACKAGE_ALIASES[name]) {
      const domain = PACKAGE_ALIASES[name]
      delete PACKAGE_ALIASES[name]
      console.log(`Removed alias: ${name} -> ${domain}`)
      saveAliases()
    }
    else {
      console.error(`Alias not found: ${name}`)
    }
  })
```

These extensions to the aliases system allow you to customize ts-pkgx to fit your specific workflow and preferences.
