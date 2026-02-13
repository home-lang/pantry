# Batch Processing

ts-pkgx implements smart batch processing to optimize the fetching and updating of multiple packages.

## Overview

Batch processing in ts-pkgx allows you to efficiently process large numbers of packages by:

1. Breaking the work into smaller batches
2. Processing batches in parallel where possible
3. Skipping unchanged packages
4. Providing progress feedback

This approach is particularly valuable when working with the pkgx.dev pantry, which contains around 1,000 packages.

## Automatic Batching

When using the `--all` flag, ts-pkgx automatically implements batch processing:

```bash
# Fetch all packages with optimized batch processing
bun run pkgx:fetch --all
```

You can customize the batch size through the CLI or API for optimal performance on your system.

## Parallel Processing

Within each batch, packages are processed in parallel to maximize throughput:

```typescript
// Process a batch of packages in parallel
const results = await Promise.all(batch.map(packageName => updatePackage(packageName)))
```

This parallel approach dramatically speeds up processing compared to sequential updates.

## Memory Management

Batch processing helps manage memory usage efficiently:

```bash
# Process all packages with default batch size (20)
bun run pkgx:fetch --all

# Limit to first 50 packages (useful for testing)
bun run pkgx:fetch --all --limit 50
```

By processing packages in batches, memory usage is kept under control even when dealing with hundreds or thousands of packages.

## Concurrency Control

You can control the level of parallelism using the `--concurrency` option:

```bash
# Process with higher concurrency (faster but more resource-intensive)
bun run pkgx:fetch --all --concurrency 20

# Process with lower concurrency (slower but more stable)
bun run pkgx:fetch --all --concurrency 5
```

The default concurrency is 10, which works well for most systems.

## Progress Feedback

ts-pkgx provides detailed progress feedback during batch processing:

```
Processing batch 1/50 (packages 1-20)
Processing batch 2/50 (packages 21-40)
...
Updated 762 out of 1000 packages
```

This keeps you informed about the progress of long-running operations.

## Skip Unchanged Packages

For better performance, ts-pkgx checks if a package file has changed before writing to disk:

```typescript
// Only write if content has changed
if (newContent !== existingContent) {
  fs.writeFileSync(filePath, newContent)
  return true // Package was updated
}
return false // No changes needed
```

This optimization significantly speeds up subsequent runs as only changed packages are written to disk.

## Automatic Retry

ts-pkgx implements automatic retry logic for failed package fetches:

```typescript
// Retry with increased timeout if fetch fails
if (error.toString().includes('Timeout')) {
  if (retryNumber < maxRetries) {
    return await fetchAndSavePackage(
      packageName,
      outputDir,
      timeout,
      saveAsJson,
      retryNumber + 1,
      maxRetries
    )
  }
}
```

This ensures that temporary issues don't cause the entire batch to fail.

## Retry Options

You can customize retry behavior through the command line:

```bash
# Set the maximum number of retry attempts
bun run pkgx:fetch --all --max-retries 5

# Increase timeout for each package
bun run pkgx:fetch --all --timeout 60000
```

## Benchmarks

Batch processing dramatically improves performance:

| Method | Time to Process 1000 Packages |
|--------|-------------------------------|
| Sequential | ~60 minutes |
| Batch (20) | ~10 minutes |
| Batch (40) | ~6 minutes |

Actual performance depends on your network connection, system specs, and the specific packages being processed.

## Using Batch Processing in Your Code

You can implement the same batch processing approach in your own code:

```typescript
import { fetchPackageListFromGitHub } from 'ts-pkgx/utils'

async function updatePackagesInBatches() {
  // Get all packages
  const packages = await fetchPackageListFromGitHub()

  // Define batch size
  const BATCH_SIZE = 20
  const batches = Math.ceil(packages.length / BATCH_SIZE)

  // Process in batches
  for (let i = 0; i < batches; i++) {
    const start = i * BATCH_SIZE
    const end = Math.min(start + BATCH_SIZE, packages.length)
    const batch = packages.slice(start, end)

    console.log(`Processing batch ${i + 1}/${batches}`)

    // Process batch in parallel
    await Promise.all(batch.map(pkg => updatePackage(pkg)))
  }
}
