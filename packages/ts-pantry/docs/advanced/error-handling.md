# Error Handling

ts-pkgx provides several ways to handle errors when fetching and processing packages. This page covers advanced error handling techniques for more robust applications.

## Custom Retry Logic

Implement custom retry logic for package fetching:

```typescript
import { fetchPantryPackage } from 'ts-pkgx'

async function fetchWithRetry(packageName: string, maxRetries = 3): Promise<any> {
  let lastError

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt} of ${maxRetries} for ${packageName}`)
      return await fetchPantryPackage(packageName, {
        timeout: 30000 * attempt, // Increase timeout with each retry
      })
    }
    catch (error) {
      lastError = error
      console.error(`Attempt ${attempt} failed for ${packageName}:`, error.message)

      // Don't retry for certain errors
      if (error.message.includes('404') || error.message.includes('Not Found')) {
        throw new Error(`Package ${packageName} not found`)
      }

      // Wait before retrying
      if (attempt < maxRetries) {
        const delay = 2000 * attempt // Increasing delay
        console.log(`Waiting ${delay}ms before retry...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  throw new Error(`Failed to fetch ${packageName} after ${maxRetries} attempts: ${lastError.message}`)
}
```

## Error Classification

Classify and handle different types of errors:

```typescript
function classifyError(error: any, packageName: string): {
  type: 'not_found' | 'timeout' | 'parse_error' | 'network_error' | 'unknown'
  retryable: boolean
  message: string
} {
  const errorString = error.toString()

  if (errorString.includes('404') || errorString.includes('Not Found')) {
    return {
      type: 'not_found',
      retryable: false, // No point retrying a 404
      message: `Package ${packageName} not found`
    }
  }

  if (errorString.includes('Timeout') || errorString.includes('timed out')) {
    return {
      type: 'timeout',
      retryable: true, // Timeouts are often temporary
      message: `Timeout fetching ${packageName}`
    }
  }

  if (errorString.includes('JSON') || errorString.includes('parse')) {
    return {
      type: 'parse_error',
      retryable: true, // Parsing errors might be temporary
      message: `Error parsing data for ${packageName}`
    }
  }

  if (errorString.includes('network') || errorString.includes('connect') || errorString.includes('ECONNREFUSED')) {
    return {
      type: 'network_error',
      retryable: true, // Network errors are often temporary
      message: `Network error fetching ${packageName}`
    }
  }

  return {
    type: 'unknown',
    retryable: true, // Assume unknown errors are retryable
    message: `Unknown error fetching ${packageName}: ${errorString}`
  }
}
```

## Fallback Content Creation

Create fallback content when package fetching fails:

```typescript
import type { PkgxPackage } from 'ts-pkgx'
import fs from 'node:fs'
import path from 'node:path'

async function createFallbackPackage(
  packageName: string,
  outputDir: string,
  error: any
): Promise<PkgxPackage> {
  console.error(`Creating fallback package for ${packageName} due to error:`, error.message)

  // Extract domain and subpath if present
  const parts = packageName.split('/')
  const domain = parts[0]
  const subPath = parts.length > 1 ? parts.slice(1).join('/') : null

  // Create a minimal package with error info
  const fallbackPackage: PkgxPackage = {
    name: subPath || packageName,
    domain,
    description: `${packageName} package (Fallback due to fetch error)`,
    packageYmlUrl: `https://github.com/pkgxdev/pantry/tree/main/projects/${packageName}/package.yml`,
    homepageUrl: '',
    githubUrl: '',
    installCommand: `pkgx ${packageName}`,
    programs: [],
    companions: [],
    dependencies: [],
    versions: [],
    aliases: subPath ? [subPath] : undefined,
    fullPath: packageName,
    // Additional error information
    _error: {
      message: error.message,
      timestamp: new Date().toISOString(),
      classified: classifyError(error, packageName)
    }
  }

  // Save the fallback package
  const safeFilename = packageName.replace(/\./g, '').replace(/\//g, '-').toLowerCase()
  const filePath = path.join(outputDir, `${safeFilename}.json`)

  fs.writeFileSync(filePath, JSON.stringify(fallbackPackage, null, 2))
  console.log(`Created fallback package at ${filePath}`)

  return fallbackPackage
}
```

## Error Logging

Implement comprehensive error logging:

```typescript
import fs from 'node:fs'
import path from 'node:path'

interface ErrorLogEntry {
  timestamp: string
  packageName: string
  error: {
    message: string
    stack?: string
    type: string
  }
  context: Record<string, any>
}

class PackageErrorLogger {
  private logDir: string
  private logFile: string

  constructor(logDir = './logs') {
    this.logDir = logDir
    this.logFile = path.join(logDir, 'package-errors.log')

    // Ensure log directory exists
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true })
    }
  }

  log(packageName: string, error: any, context: Record<string, any> = {}): void {
    const entry: ErrorLogEntry = {
      timestamp: new Date().toISOString(),
      packageName,
      error: {
        message: error.message || String(error),
        stack: error.stack,
        type: error.constructor.name
      },
      context
    }

    // Append to log file
    fs.appendFileSync(
      this.logFile,
      `${JSON.stringify(entry)}\n`
    )

    // For significant errors, save a separate file
    if (this.isSignificantError(error)) {
      const filename = `${packageName.replace(/\W+/g, '-')}-${Date.now()}.error.json`
      fs.writeFileSync(
        path.join(this.logDir, filename),
        JSON.stringify(entry, null, 2)
      )
    }

    console.error(`Error logged for ${packageName}:`, error.message)
  }

  private isSignificantError(error: any): boolean {
    const errorString = String(error)

    // Consider these significant enough for individual logging
    return !(
      errorString.includes('timeout')
      || errorString.includes('429') // Too many requests
      || errorString.includes('404') // Not found
    )
  }

  getRecentErrors(count = 10): ErrorLogEntry[] {
    if (!fs.existsSync(this.logFile))
      return []

    const lines = fs.readFileSync(this.logFile, 'utf8')
      .split('\n')
      .filter(Boolean)
      .slice(-count)

    return lines.map(line => JSON.parse(line))
  }
}

// Usage
const errorLogger = new PackageErrorLogger()

try {
  // Some operation that might fail
  await fetchPantryPackage('example.com')
}
catch (error) {
  errorLogger.log('example.com', error, {
    attempt: 2,
    timestamp: Date.now()
  })
}
```

## Graceful Degradation

Implement graceful degradation for batch operations:

```typescript
async function batchFetchWithGracefulDegradation(
  packageNames: string[],
  options = {}
): Promise<{
    succeeded: Array<{ name: string, package: PkgxPackage }>
    failed: Array<{ name: string, error: any }>
  }> {
  const results = {
    succeeded: [],
    failed: []
  }

  // Process in batches to avoid overwhelming resources
  const BATCH_SIZE = 10
  const batches = Math.ceil(packageNames.length / BATCH_SIZE)

  for (let i = 0; i < batches; i++) {
    const start = i * BATCH_SIZE
    const end = Math.min(start + BATCH_SIZE, packageNames.length)
    const batch = packageNames.slice(start, end)

    console.log(`Processing batch ${i + 1}/${batches} (packages ${start + 1}-${end})`)

    // Process each package in the batch
    const batchResults = await Promise.allSettled(
      batch.map(async (packageName) => {
        try {
          const { packageInfo } = await fetchWithRetry(packageName)
          return { name: packageName, package: packageInfo }
        }
        catch (error) {
          // Log the error but don't fail the entire batch
          errorLogger.log(packageName, error)
          const packageError = new Error(`Failed to fetch package: ${packageName}`)
          packageError.cause = error
          packageError.packageName = packageName
          throw packageError
        }
      })
    )

    // Sort results
    batchResults.forEach((result) => {
      if (result.status === 'fulfilled') {
        results.succeeded.push(result.value)
      }
      else {
        results.failed.push(result.reason)
      }
    })

    // If too many failures, slow down or adjust batch size
    const failureRate = results.failed.length / (results.succeeded.length + results.failed.length)
    if (failureRate > 0.5 && batch.length > 1) {
      console.warn(`High failure rate (${failureRate.toFixed(2)}), reducing batch size and slowing down`)
      BATCH_SIZE = Math.max(1, Math.floor(BATCH_SIZE / 2))
      await new Promise(resolve => setTimeout(resolve, 5000)) // Cool-down period
    }
  }

  return results
}
```

## Error Tracking and Analysis

Track and analyze errors to identify patterns:

```typescript
class ErrorTracker {
  private errors: Map<string, {
    count: number
    lastSeen: Date
    examples: Array<{ error: any, context: any }>
  }> = new Map()

  track(errorType: string, error: any, context: any = {}): void {
    if (!this.errors.has(errorType)) {
      this.errors.set(errorType, {
        count: 0,
        lastSeen: new Date(),
        examples: []
      })
    }

    const entry = this.errors.get(errorType)!
    entry.count++
    entry.lastSeen = new Date()

    // Keep some examples but limit to avoid memory issues
    if (entry.examples.length < 5) {
      entry.examples.push({ error, context })
    }
  }

  getReport(): Record<string, any> {
    const report: Record<string, any> = {}

    this.errors.forEach((data, errorType) => {
      report[errorType] = {
        count: data.count,
        lastSeen: data.lastSeen.toISOString(),
        examples: data.examples.map(e => ({
          message: e.error.message || String(e.error),
          context: e.context
        }))
      }
    })

    return report
  }

  resetCounts(): void {
    this.errors.forEach((data) => {
      data.count = 0
    })
  }
}

// Usage
const errorTracker = new ErrorTracker()

// When an error occurs
try {
  await fetchPantryPackage('example.com')
}
catch (error) {
  const errorType = classifyError(error, 'example.com').type
  errorTracker.track(errorType, error, {
    packageName: 'example.com',
    timestamp: Date.now()
  })
}

// Generate a report
console.log(errorTracker.getReport())
```

These advanced error handling techniques will help you build more robust applications that can gracefully handle failures when working with ts-pkgx.
