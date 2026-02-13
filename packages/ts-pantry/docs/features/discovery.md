# Package Discovery

ts-pkgx provides robust features for discovering and fetching package information from pkgx.dev.

## Package Fetching

ts-pkgx can fetch detailed information about packages from pkgx.dev, including:

- Basic metadata (name, domain, description)
- Available versions
- Programs provided by the package
- Dependencies and companion packages
- Installation commands
- Links to documentation, source code, and related resources

```typescript
import { fetchPantryPackage } from 'ts-pkgx'

// Fetch a single package
const { packageInfo, originalName, fullDomainName } = await fetchPantryPackage('node')
console.log(packageInfo)
```

## Single Package Fetching

You can fetch information about a specific package using the `fetchPantryPackage` function or the CLI command:

```bash
# API approach
import { fetchPantryPackage } from 'ts-pkgx'
const result = await fetchPantryPackage('nodejs.org')

# CLI approach
bun run pkgx:fetch node
```

## Multiple Package Fetching

Fetch several packages at once with the `--pkg` option:

```bash
# Fetch multiple packages with one command
bun run pkgx:fetch --pkg node,bun,python

# With custom options
bun run pkgx:fetch --pkg "go.dev,python.org,rust-lang.org" --json --timeout 60000
```

This allows you to fetch multiple specific packages efficiently without having to run separate commands or fetch the entire pantry.

## Bulk Fetching

You can fetch information about all available packages at once using the `fetchAndSaveAllPackages` function or the CLI command:

```bash
# API approach
import { fetchAndSaveAllPackages } from 'ts-pkgx'
const savedPackages = await fetchAndSaveAllPackages()

# CLI approach
bun run pkgx:fetch-all
```

This will retrieve information about all packages listed on pkgx.dev and save them to your specified output directory.

## Smart Caching

ts-pkgx implements caching for GitHub API requests to improve performance and avoid hitting rate limits:

```bash
# Custom cache duration (in minutes)
bun run pkgx:fetch-all --github-cache-duration 120 # 2 hours
```

This caching mechanism allows subsequent fetches to be much faster as they can use the cached data instead of making fresh API calls.

## Search and Lookup

After packages are fetched, you can easily search and look them up:

```typescript
// Using the pantry object (indexed by domain)
import { getPackage, pantry } from 'ts-pkgx'

const nodePackage = pantry['nodejs.org']
const nodeByAlias = getPackage('node')
```

This makes it simple to access package information once you've fetched it.
