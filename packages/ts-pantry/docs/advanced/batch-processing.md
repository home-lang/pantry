# Optimized Batch Processing

Fetching and processing packages can be resource-intensive, especially when dealing with a large number of packages. This section explains the optimized batch processing techniques used in ts-pkgx.

## How Batch Processing Works

When fetching multiple packages at once, ts-pkgx uses a batched approach to prevent overwhelming system resources:

1. Packages are processed in small batches (typically 15-20 packages per batch)
2. Each batch is processed in parallel using Promise.all
3. Resource cleanup happens after each batch completes

This approach prevents memory issues and ensures stable performance even when processing hundreds of packages.

## Using Batch Processing

### CLI Command

The CLI supports batch processing natively with the `--all` flag:

```bash
# Fetch all packages using batch processing
bun run pkgx:fetch-all

# Or with the CLI directly
bun bin/cli.ts fetch --all
```

### With Package Selection

You can also specify multiple packages to process in a batch:

```bash
# Fetch specific packages in a batch
bun bin/cli.ts fetch --pkg="nodejs.org,bun.sh,deno.land"
```

### Cleanup Command

The CLI includes a cleanup command to fix variable naming issues across all package files:

```bash
# Fix variable naming issues
bun run pkgx:cleanup

# Or with the CLI directly
bun bin/cli.ts cleanup
```

This command:

1. Scans all package files for variable names with hyphens or other invalid characters
2. Updates the files with TypeScript-friendly variable and interface names
3. Regenerates the index.ts file to reflect the changes

Use this command after adding new packages or when experiencing issues with variable names.

## Benefits of Batch Processing

- **Memory Efficiency**: Prevents memory exhaustion by processing in smaller chunks
- **Speed**: Parallel processing within each batch maximizes throughput
- **Reliability**: Graceful handling of errors within batches prevents entire operation failures
- **Resource Management**: Proper cleanup between batches prevents resource leaks

## Implementation Details

The batch processing logic is implemented in:

- `bin/cli.ts` - CLI interface for batch operations

See the source code for implementation details.

## Understanding Batch Processing

Batch processing allows ts-pkgx to efficiently process hundreds or thousands of packages by:
1. Breaking the work into smaller batches
2. Processing each batch in parallel
3. Managing memory consumption
4. Providing progress tracking
5. Handling errors gracefully

## Dynamic Batch Size Adjustment

Implement dynamic batch size adjustment based on system performance:

```typescript
import { performance } from 'node:perf_hooks'
import { fetchPackageListFromGitHub } from 'ts-pkgx/utils'

async function updatePackagesWithDynamicBatching() {
  // Get the list of all packages from GitHub
  const packages = await fetchPackageListFromGitHub()
  console.log(`Found ${packages.length} packages to update`)

  // Start with a moderate batch size
  let BATCH_SIZE = 20
  let totalUpdated = 0
  let lastBatchTime = 0

  // Process packages in batches
  for (let start = 0; start < packages.length; start += BATCH_SIZE) {
    const end = Math.min(start + BATCH_SIZE, packages.length)
    const batch = packages.slice(start, end)

    console.log(`Processing batch ${Math.floor(start / BATCH_SIZE) + 1} (packages ${start + 1}-${end})`)

    // Measure performance of this batch
    const batchStartTime = performance.now()

    // Process the batch
    const results = await Promise.all(
      batch.map(pkg => updatePackage(pkg))
    )

    // Count updated packages
    const updatedInBatch = results.filter(Boolean).length
    totalUpdated += updatedInBatch

    // Measure batch completion time
    const batchTime = performance.now() - batchStartTime
    console.log(`Batch completed in ${(batchTime / 1000).toFixed(2)}s, updated ${updatedInBatch}/${batch.length} packages`)

    // Adjust batch size based on performance
    if (lastBatchTime > 0) {
      if (batchTime > lastBatchTime * 1.5 && BATCH_SIZE > 10) {
        // If this batch took significantly longer, reduce batch size
        BATCH_SIZE = Math.max(5, Math.floor(BATCH_SIZE * 0.8))
        console.log(`Performance degraded, reducing batch size to ${BATCH_SIZE}`)
      }
      else if (batchTime < lastBatchTime * 0.7 && BATCH_SIZE < 50) {
        // If this batch was significantly faster, increase batch size
        BATCH_SIZE = Math.min(50, Math.floor(BATCH_SIZE * 1.2))
        console.log(`Performance improved, increasing batch size to ${BATCH_SIZE}`)
      }
    }

    lastBatchTime = batchTime

    // Optional: add a small delay between batches to prevent overloading
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  console.log(`Updated ${totalUpdated} out of ${packages.length} packages`)
}
```

## Memory Usage Monitoring

Monitor memory usage during batch processing:

```typescript
import process from 'node:process'

function getMemoryUsage(): { used: number, max: number, percent: number } {
  const memoryUsage = process.memoryUsage()
  const usedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024)
  const totalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024)
  const percent = Math.round((usedMB / totalMB) * 100)

  return { used: usedMB, max: totalMB, percent }
}

async function updatePackagesWithMemoryMonitoring() {
  // Get the list of all packages
  const packages = await fetchPackageListFromGitHub()

  // Initial batch size
  let BATCH_SIZE = 20

  // Process packages in batches
  for (let start = 0; start < packages.length; start += BATCH_SIZE) {
    const end = Math.min(start + BATCH_SIZE, packages.length)
    const batch = packages.slice(start, end)

    // Check memory before processing
    const memBefore = getMemoryUsage()
    console.log(`Memory before batch: ${memBefore.used}MB / ${memBefore.max}MB (${memBefore.percent}%)`)

    // Process the batch
    await Promise.all(batch.map(pkg => updatePackage(pkg)))

    // Check memory after processing
    const memAfter = getMemoryUsage()
    console.log(`Memory after batch: ${memAfter.used}MB / ${memAfter.max}MB (${memAfter.percent}%)`)

    // Adjust batch size based on memory pressure
    if (memAfter.percent > 85 && BATCH_SIZE > 5) {
      // Memory pressure is high, reduce batch size
      BATCH_SIZE = Math.floor(BATCH_SIZE * 0.7)
      console.log(`High memory usage detected, reducing batch size to ${BATCH_SIZE}`)

      // Force garbage collection if available
      if (globalThis.gc) {
        console.log('Forcing garbage collection')
        globalThis.gc()
      }
    }
    else if (memAfter.percent < 50 && BATCH_SIZE < 40) {
      // Memory usage is low, increase batch size
      BATCH_SIZE = Math.min(40, Math.floor(BATCH_SIZE * 1.2))
      console.log(`Low memory usage detected, increasing batch size to ${BATCH_SIZE}`)
    }
  }
}

// To enable manual garbage collection (run with --expose-gc flag)
// node --expose-gc script.js
```

## Concurrent Batch Processing

Process multiple batches concurrently:

```typescript
async function concurrentBatchProcessing(
  allItems: string[],
  processorFn: (item: string) => Promise<any>,
  options: {
    batchSize?: number
    maxConcurrentBatches?: number
    progressCallback?: (completed: number, total: number) => void
  } = {}
) {
  const {
    batchSize = 20,
    maxConcurrentBatches = 3,
    progressCallback
  } = options

  // Split all items into batches
  const batches: string[][] = []
  for (let i = 0; i < allItems.length; i += batchSize) {
    batches.push(allItems.slice(i, i + batchSize))
  }

  console.log(`Split ${allItems.length} items into ${batches.length} batches of up to ${batchSize} items each`)
  console.log(`Processing up to ${maxConcurrentBatches} batches concurrently`)

  let completedItems = 0
  const totalItems = allItems.length

  // Process batches in chunks to limit concurrency
  for (let i = 0; i < batches.length; i += maxConcurrentBatches) {
    const batchChunk = batches.slice(i, i + maxConcurrentBatches)

    console.log(`Processing batch chunk ${Math.floor(i / maxConcurrentBatches) + 1}/${Math.ceil(batches.length / maxConcurrentBatches)}`)

    // Process each batch in this chunk concurrently
    const batchPromises = batchChunk.map(async (batch, batchIndex) => {
      const batchNumber = i + batchIndex + 1
      console.log(`Starting batch ${batchNumber}/${batches.length}`)

      // Process each item in the batch concurrently
      const results = await Promise.all(
        batch.map(item => processorFn(item))
      )

      completedItems += batch.length

      if (progressCallback) {
        progressCallback(completedItems, totalItems)
      }

      console.log(`Completed batch ${batchNumber}/${batches.length}`)
      return results
    })

    // Wait for all batches in this chunk to complete
    await Promise.all(batchPromises)
  }
}

// Usage:
await concurrentBatchProcessing(
  packages,
  updatePackage,
  {
    batchSize: 15,
    maxConcurrentBatches: 2,
    progressCallback: (completed, total) => {
      const percent = Math.round((completed / total) * 100)
      console.log(`Progress: ${completed}/${total} (${percent}%)`)
    }
  }
)
```

## Priority Queue Processing

Implement a priority queue for package processing:

```typescript
interface QueueItem<T> {
  item: T
  priority: number
}

class PriorityQueue<T> {
  private queue: QueueItem<T>[] = []

  enqueue(item: T, priority: number): void {
    this.queue.push({ item, priority })
    this.sort()
  }

  dequeue(): T | undefined {
    return this.queue.shift()?.item
  }

  get length(): number {
    return this.queue.length
  }

  private sort(): void {
    this.queue.sort((a, b) => b.priority - a.priority)
  }
}

async function priorityBatchProcessing() {
  // Get all packages
  const packages = await fetchPackageListFromGitHub()

  // Create priority queue
  const queue = new PriorityQueue<string>()

  // Add packages to queue with priorities
  for (const pkg of packages) {
    // Prioritize certain packages (example: based on naming patterns)
    let priority = 1 // Default priority

    if (pkg.includes('lang')) {
      // Programming languages get higher priority
      priority = 3
    }
    else if (pkg.includes('db') || pkg.includes('sql')) {
      // Databases get medium priority
      priority = 2
    }

    queue.enqueue(pkg, priority)
  }

  // Process the queue in batches
  const BATCH_SIZE = 20

  while (queue.length > 0) {
    const batch = []

    for (let i = 0; i < BATCH_SIZE && queue.length > 0; i++) {
      const pkg = queue.dequeue()
      if (pkg) {
        batch.push(pkg)
      }
    }

    console.log(`Processing batch of ${batch.length} items (${queue.length} remaining in queue)`)

    // Process the batch
    await Promise.all(batch.map(pkg => updatePackage(pkg)))
  }
}
```

## Resumable Batch Processing

Implement resumable batch processing for long-running operations:

```typescript
import fs from 'node:fs'
import path from 'node:path'

interface ProcessingState {
  totalItems: number
  processedItems: string[]
  pendingItems: string[]
  lastProcessed: string | null
  startTime: number
  lastUpdated: number
}

class ResumableBatchProcessor {
  private stateFile: string
  private state: ProcessingState

  constructor(stateFile: string = 'batch-process-state.json') {
    this.stateFile = stateFile
    this.state = this.loadState()
  }

  private loadState(): ProcessingState {
    if (fs.existsSync(this.stateFile)) {
      try {
        return JSON.parse(fs.readFileSync(this.stateFile, 'utf8'))
      }
      catch (error) {
        console.error('Error loading state file:', error)
      }
    }

    return {
      totalItems: 0,
      processedItems: [],
      pendingItems: [],
      lastProcessed: null,
      startTime: Date.now(),
      lastUpdated: Date.now()
    }
  }

  private saveState(): void {
    this.state.lastUpdated = Date.now()
    fs.writeFileSync(this.stateFile, JSON.stringify(this.state, null, 2))
  }

  async processItems(
    items: string[],
    processFn: (item: string) => Promise<boolean>,
    batchSize: number = 20
  ): Promise<{ completed: string[], failed: string[] }> {
    // Initialize state if new run
    if (this.state.totalItems === 0 || this.state.pendingItems.length === 0) {
      this.state.totalItems = items.length
      this.state.pendingItems = [...items]
      this.state.processedItems = []
      this.state.startTime = Date.now()
      this.saveState()
    }
    else {
      console.log(`Resuming from previous run. ${this.state.processedItems.length}/${this.state.totalItems} items already processed.`)
    }

    const failed: string[] = []

    // Process in batches
    while (this.state.pendingItems.length > 0) {
      const batch = this.state.pendingItems.slice(0, batchSize)

      console.log(`Processing batch: ${batch.length} items (${this.state.pendingItems.length - batch.length} remaining)`)

      // Process each item in the batch
      const results = await Promise.allSettled(
        batch.map(async (item) => {
          try {
            const success = await processFn(item)
            return { item, success }
          }
          catch (error) {
            console.error(`Error processing ${item}:`, error)
            return { item, success: false, error }
          }
        })
      )

      // Update state based on results
      for (const result of results) {
        if (result.status === 'fulfilled') {
          // Remove item from pending list
          this.state.pendingItems = this.state.pendingItems.filter(i => i !== result.value.item)

          // Add to processed or failed list
          if (result.value.success) {
            this.state.processedItems.push(result.value.item)
            this.state.lastProcessed = result.value.item
          }
          else {
            failed.push(result.value.item)
          }
        }
        else {
          // Handle rejected promise (shouldn't happen with allSettled, but just in case)
          console.error(`Unexpected rejection for item:`, result.reason)
        }
      }

      // Save state after each batch
      this.saveState()

      // Optional: add a small delay between batches
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    return {
      completed: this.state.processedItems,
      failed
    }
  }

  getProgress(): { processed: number, total: number, percent: number, elapsedMs: number } {
    return {
      processed: this.state.processedItems.length,
      total: this.state.totalItems,
      percent: this.state.totalItems > 0
        ? (this.state.processedItems.length / this.state.totalItems) * 100
        : 0,
      elapsedMs: Date.now() - this.state.startTime
    }
  }

  reset(): void {
    this.state = {
      totalItems: 0,
      processedItems: [],
      pendingItems: [],
      lastProcessed: null,
      startTime: Date.now(),
      lastUpdated: Date.now()
    }
    this.saveState()
  }
}

// Usage
async function resumableBatchExample() {
  const processor = new ResumableBatchProcessor()
  const packages = await fetchPackageListFromGitHub()

  // Process with ability to resume
  const results = await processor.processItems(
    packages,
    updatePackage,
    20 // batch size
  )

  console.log(`Completed processing ${results.completed.length} packages successfully`)
  console.log(`Failed to process ${results.failed.length} packages`)
}
```

## Worker Thread Implementation

For CPU-bound operations, you can use worker threads:

```typescript
import os from 'node:os'
import path from 'node:path'
import { Worker } from 'node:worker_threads'

async function batchProcessWithWorkers(
  items: string[],
  workerScriptPath: string,
  options: { maxWorkers?: number, batchSize?: number } = {}
) {
  const {
    maxWorkers = Math.max(1, os.cpus().length - 1),
    batchSize = 20
  } = options

  console.log(`Using ${maxWorkers} worker threads with batch size ${batchSize}`)

  // Split items into batches
  const batches: string[][] = []
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize))
  }

  // Create a pool of workers
  const workers = Array.from({ length: maxWorkers }, () => {
    return new Worker(path.resolve(workerScriptPath))
  })

  // Function to get an available worker
  const getWorker = () => {
    return new Promise<Worker>((resolve) => {
      // Find first idle worker, or wait for one to become available
      const checkWorkers = () => {
        for (const worker of workers) {
          if (worker.threadId && !worker.threadId.busy) {
            worker.threadId.busy = true
            return resolve(worker)
          }
        }
        // If all workers are busy, wait and check again
        setTimeout(checkWorkers, 100)
      }

      checkWorkers()
    })
  }

  // Process all batches
  const results = []
  for (const [index, batch] of batches.entries()) {
    console.log(`Processing batch ${index + 1}/${batches.length}`)

    const worker = await getWorker()

    const result = await new Promise((resolve, reject) => {
      worker.once('message', resolve)
      worker.once('error', reject)
      worker.postMessage({ batch })
    })

    // Mark worker as available
    worker.threadId.busy = false

    results.push(result)
  }

  // Terminate all workers
  await Promise.all(workers.map((worker) => {
    return new Promise<void>((resolve) => {
      worker.terminate().then(() => resolve())
    })
  }))

  return results.flat()
}

// Worker script (save to worker.js)
/*
const { parentPort } = require('worker_threads');
const { updatePackage } = require('../path/to/updatePackage');

parentPort.on('message', async ({ batch }) => {
  console.log(`Worker ${process.pid} processing batch of ${batch.length} items`);

  const results = await Promise.all(batch.map(async (item) => {
    try {
      const result = await updatePackage(item);
      return { item, success: true, result };
    } catch (error) {
      return { item, success: false, error: error.message };
    }
  }));

  parentPort.postMessage(results);
});
*/

// Usage
const results = await batchProcessWithWorkers(
  packages,
  './worker.js',
  { maxWorkers: 4, batchSize: 10 }
)
```

These advanced batch processing techniques allow you to customize and optimize ts-pkgx for your specific needs, especially when working with large numbers of packages.
