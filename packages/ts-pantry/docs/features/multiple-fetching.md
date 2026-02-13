# Multiple Package Fetching

ts-pkgx provides flexible options for fetching multiple packages at once using the pantry-based approach, giving you precise control over which packages to fetch.

## Using the `--pkg` Option

The `--pkg` option allows you to fetch multiple specific packages in a single command:

```bash
# Fetch multiple packages with one command
ts-pkgx fetch --pkg node,bun,python

# With custom options
ts-pkgx fetch --pkg "go.dev,python.org,rust-lang.org" --json --timeout 60000

# Using Bun scripts (alternative)
bun run pkgx:fetch --pkg node,bun,python
```

This is particularly useful when you need information about several specific packages without having to fetch the entire pantry.

## Comma-Separated Package List

The `--pkg` option accepts a comma-separated list of package names:

```bash
# Fetch packages by their aliases or domain names
ts-pkgx fetch --pkg node,python,bun,deno

# Quotes are helpful when using dots or special characters
ts-pkgx fetch --pkg "nodejs.org,python.org,rust-lang.org"

# Nested packages are also supported
ts-pkgx fetch --pkg "agwa.name/git-crypt,aws.amazon.com/cli"
```

Both aliases (like `node`) and full domain names (like `nodejs.org`) are supported, including nested packages.

## Combined with Other Options

The multiple package fetching feature can be combined with other CLI options:

```bash
# Save as JSON instead of TypeScript
ts-pkgx fetch --pkg node,bun --json

# Custom output directory
ts-pkgx fetch --pkg node,bun --output-dir ./custom-packages

# Increased timeout for complex packages
ts-pkgx fetch --pkg "rust-lang.org,go.dev" --timeout 60000

# Debug mode for troubleshooting
ts-pkgx fetch --pkg "rust-lang.org,go.dev" --debug --verbose

# Custom cache settings
ts-pkgx fetch --pkg node,bun --cache-dir ./my-cache --cache-expiration 30

# Disable caching for fresh data
ts-pkgx fetch --pkg node,bun --no-cache

# CI integration with JSON output
ts-pkgx fetch --pkg "node,bun,python" --output-json
```

## Benefits Over Individual Fetching

Fetching multiple packages at once offers several advantages:

1. **Reduced Overhead**: Shares setup costs (pantry loading, cache initialization)
2. **Faster Processing**: Handles packages in an optimized way with shared resources
3. **Simplified Commands**: One command instead of multiple individual ones
4. **Consistent Output**: All packages are processed with the same options
5. **Automatic Index Generation**: The index is only regenerated once after all packages are fetched
6. **Enhanced Caching**: Intelligent cache sharing between packages

## API-Based Multiple Fetching

You can also fetch multiple packages programmatically using the pantry-based approach:

```typescript
import { fetchPantryPackageWithMetadata, saveToCacheAndOutput } from 'ts-pkgx'

async function fetchMultiplePackages(packageNames: string[], options = {}) {
  const results = await Promise.all(
    packageNames.map(async (pkg) => {
      try {
        const result = await fetchPantryPackageWithMetadata(pkg, {
          timeout: 60000,
          cache: true,
          cacheExpirationMinutes: 60,
          ...options,
        })

        if (result) {
          // Save to cache and output
          const { outputPath } = saveToCacheAndOutput(pkg, result.packageInfo, {
            cacheDir: '.cache/packages',
            outputDir: 'src/packages',
            cache: true,
          })

          return { name: pkg, success: true, result: result.packageInfo, outputPath }
        }
        else {
          return { name: pkg, success: false, error: 'Package not found' }
        }
      }
      catch (error) {
        return { name: pkg, success: false, error: error.message }
      }
    })
  )

  // Process results
  const successful = results.filter(r => r.success)
  const failed = results.filter(r => !r.success)

  console.log(`Successfully fetched: ${successful.length} packages`)
  if (failed.length > 0) {
    console.log(`Failed to fetch: ${failed.length} packages`)
    failed.forEach(f => console.log(`  - ${f.name}: ${f.error}`))
  }

  return results
}

// Usage
fetchMultiplePackages(['node', 'python', 'bun', 'agwa.name/git-crypt'])
```

## Advanced Batch Configuration

For high-performance batch operations:

```typescript
import { fetchAndSaveAllPackages } from 'ts-pkgx'

async function fetchSpecificPackagesBatch(packageNames: string[]) {
  // Create a temporary pantry filtering approach
  const results: string[] = []

  for (const packageName of packageNames) {
    try {
      const result = await fetchPantryPackageWithMetadata(packageName, {
        timeout: 60000,
        debug: false,
        cache: true,
        cacheExpirationMinutes: 1440, // 24 hours
      })

      if (result) {
        saveToCacheAndOutput(packageName, result.packageInfo, {
          cacheDir: '.cache/packages',
          outputDir: 'src/packages',
          cache: true,
        })
        results.push(packageName)
      }
    }
    catch (error) {
      console.error(`Failed to fetch ${packageName}:`, error.message)
    }
  }

  return results
}
```

## Efficiency Improvements

Multiple package fetching leverages several efficiency improvements:

1. **Pantry-Based Approach**: Uses local pantry data for reliable metadata
2. **Shared Cache**: Reuses cache entries efficiently across packages
3. **Intelligent Resource Management**: Proper browser resource cleanup
4. **Parallel Processing**: Processes packages concurrently where possible
5. **Smart Caching**: Only fetches fresh data when cache expires
6. **Optimized Output**: Generates TypeScript files with comprehensive JSDoc

## Performance Tuning

Optimize multiple package fetching for your environment:

```bash
# High-performance setup
ts-pkgx fetch --pkg "node,bun,python,go,rust" --concurrency 8 --timeout 30000

# Conservative setup for slower networks
ts-pkgx fetch --pkg "node,bun,python" --timeout 120000 --cache-expiration 60

# Debug setup for troubleshooting
ts-pkgx fetch --pkg "problematic-package" --debug --verbose --timeout 180000
```

## CI/CD Integration

Use multiple package fetching in automation:

```bash
# Get structured JSON output for CI systems
result=$(ts-pkgx fetch --pkg "node,bun,python" --output-json)

# Extract updated packages
echo "$result" | jq -r '.updatedPackages[]'

# Check success status
if echo "$result" | jq -e '.success' > /dev/null; then
  echo "All packages fetched successfully"
else
  echo "Some packages failed to fetch"
  echo "$result" | jq -r '.error // "Unknown error"'
fi
```

## Use Cases

Multiple package fetching is ideal for:

- Fetching a subset of related packages (e.g., all JavaScript runtimes)
- Updating specific packages that have changed
- Testing with a small set of packages before fetching all
- Creating a custom collection of packages for your project
- CI/CD pipelines that need specific packages
- Development environments with specific tooling requirements

## Error Handling

Handle errors gracefully when fetching multiple packages:

```typescript
async function robustMultipleFetch(packages: string[]) {
  const results = {
    successful: [] as string[],
    failed: [] as { name: string, error: string }[],
  }

  for (const pkg of packages) {
    try {
      const result = await fetchPantryPackageWithMetadata(pkg, {
        timeout: 60000,
        cache: true,
      })

      if (result) {
        results.successful.push(pkg)
        console.log(`✅ ${pkg} - fetched successfully`)
      }
      else {
        results.failed.push({ name: pkg, error: 'Package not found in pantry' })
        console.log(`❌ ${pkg} - not found`)
      }
    }
    catch (error) {
      results.failed.push({ name: pkg, error: error.message })
      console.log(`❌ ${pkg} - ${error.message}`)
    }
  }

  return results
}
```
