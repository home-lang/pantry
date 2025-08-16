/* eslint-disable no-console */
/**
 * Performance benchmarking utilities for Launchpad
 */

import { execSync } from 'node:child_process'
import { mkdirSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import process from 'node:process'

// Configuration files to detect (matching the shell regex pattern)
const PROJECT_FILES = [
  // Dependencies files
  'dependencies.yaml',
  'dependencies.yml',
  'deps.yaml',
  'deps.yml',
  'pkgx.yaml',
  'pkgx.yml',
  'launchpad.yaml',
  'launchpad.yml',

  // Package managers
  'package.json',
  'pyproject.toml',
  'Cargo.toml',
  'go.mod',
  'go.sum',
  'Gemfile',
  'deno.json',
  'deno.jsonc',

  // CI/CD
  'action.yml',
  'action.yaml',
  'skaffold.yml',
  'skaffold.yaml',

  // Version files
  '.nvmrc',
  '.node-version',
  '.ruby-version',
  '.python-version',
  '.terraform-version',

  // Lock files
  'yarn.lock',
  'bun.lock',
  'bun.lockb',
  '.yarnrc',
  'requirements.txt',
  'setup.py',
  'Pipfile',
  'Pipfile.lock',
]

/**
 * Fast Bun/Node.js implementation using optimized file system checks
 */
export function findProjectRootFast(startDir: string): string | null {
  let currentDir = startDir

  while (currentDir !== '/') {
    try {
      // Use readdirSync with withFileTypes for better performance (single syscall)
      const entries = readdirSync(currentDir, { withFileTypes: true })

      // Check if any of our target files exist
      for (const entry of entries) {
        if (entry.isFile() && PROJECT_FILES.includes(entry.name)) {
          return currentDir
        }
      }
    }
    catch {
      // Directory not readable, continue up the tree
    }

    currentDir = dirname(currentDir)
  }

  return null
}

/**
 * Shell fallback implementation (current approach)
 */
function findProjectRootShell(startDir: string): string | null {
  try {
    const shellScript = `
      dir="${startDir}"
      while [[ "$dir" != "/" ]]; do
        files=$(ls -1a "$dir" 2>/dev/null | grep -E '^(dependencies|deps|pkgx|launchpad)\\.(yaml|yml)$|^package\\.json$|^pyproject\\.toml$|^Cargo\\.toml$|^go\\.(mod|sum)$|^Gemfile$|^deno\\.jsonc?$|^action\\.ya?ml$|^skaffold\\.ya?ml$|^\\.(nvmrc|node-version|ruby-version|python-version|terraform-version)$|^(yarn\\.lock|bun\\.lock|bun\\.lockb|\\.yarnrc|requirements\\.txt|setup\\.py|Pipfile\\.?lock?)$' | head -1)
        if [[ -n "$files" ]]; then
          echo "$dir"
          exit 0
        fi
        dir="$(dirname "$dir")"
      done
      exit 1
    `

    const result = execSync(shellScript, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'],
    }).trim()

    return result || null
  }
  catch {
    return null
  }
}

/**
 * Optimized implementation: Always use fast approach since we're in Node.js/Bun environment
 */
export function findProjectRoot(startDir: string): string | null {
  return findProjectRootFast(startDir)
}

/**
 * Benchmark function
 */
async function benchmark(name: string, fn: () => Promise<any> | any, iterations: number = 1000): Promise<number> {
  // Warmup
  for (let i = 0; i < 10; i++) {
    await fn()
  }

  const start = performance.now()

  for (let i = 0; i < iterations; i++) {
    await fn()
  }

  const end = performance.now()
  const totalTime = end - start
  const avgTime = totalTime / iterations

  console.log(`${name}: ${avgTime.toFixed(3)}ms avg (${totalTime.toFixed(1)}ms total, ${iterations} iterations)`)
  return avgTime
}

/**
 * Create test directory structure for benchmarking (optimized with native fs)
 */
function createTestStructure(baseDir: string, depth: number = 10): string {
  const testDir = join(baseDir, `test-structure-${Date.now()}`)

  // Create nested directory structure using native fs (faster than shell)
  let currentPath = testDir
  for (let i = 0; i < depth; i++) {
    currentPath = join(currentPath, `level-${i}`)
  }

  // Create all directories at once (much faster than individual mkdir calls)
  mkdirSync(currentPath, { recursive: true })

  // Place a package.json at the root level using native fs
  const packageJsonPath = join(testDir, 'package.json')
  writeFileSync(packageJsonPath, '{"name": "test"}')

  return currentPath // Return the deepest directory
}

/**
 * Run file detection benchmark
 */
export async function runFileDetectionBenchmark(options: {
  depths?: number[]
  iterations?: number
  verbose?: boolean
  json?: boolean
} = {}): Promise<void> {
  const {
    depths = [3, 7, 15, 25],
    json = false,
  } = options

  if (!json) {
    console.log('🚀 File Detection Performance Comparison\n')
    console.log('Testing directory traversal performance for project file detection...\n')
  }

  const results: Record<string, Record<string, number>> = {}

  for (const depth of depths) {
    const testName = `${depth} levels`
    if (!json) {
      console.log(`📁 Testing: ${testName}`)
      console.log('─'.repeat(50))
    }

    const testDir = createTestStructure('/tmp', depth)

    try {
      // Determine iterations based on approach and depth
      const bunSyncIterations = options.iterations || Math.max(100, 1000 - (depth * 20))
      const shellIterations = options.iterations || Math.max(50, 200 - (depth * 5))

      const bunSyncTime = await benchmark(
        json ? '' : 'Bun Direct (sync)    ',
        () => findProjectRootFast(testDir),
        bunSyncIterations,
      )

      const shellTime = await benchmark(
        json ? '' : 'Shell (current)      ',
        () => findProjectRootShell(testDir),
        shellIterations,
      )

      results[testName] = {
        'Bun Direct': bunSyncTime,
        'Shell': shellTime,
      }

      if (!json) {
        // Calculate speed improvements
        const bunDirectVsShell = ((shellTime - bunSyncTime) / shellTime * 100)

        console.log(`\n📊 Speed Improvements vs Shell:`)
        console.log(`   Bun Direct: ${bunDirectVsShell > 0 ? '+' : ''}${bunDirectVsShell.toFixed(1)}% ${bunDirectVsShell > 0 ? 'faster' : 'slower'}`)
        console.log('\n')
      }
    }
    finally {
      // Cleanup
      execSync(`rm -rf "${testDir.split('/').slice(0, -depth).join('/')}"`)
    }
  }

  if (json) {
    console.log(JSON.stringify(results, null, 2))
  }
  else {
    // Summary table
    console.log('📈 PERFORMANCE SUMMARY')
    console.log('═'.repeat(80))
    console.log(`${'Test Case'.padEnd(20) + 'Bun Direct'.padEnd(15) + 'Shell'.padEnd(15)}Improvement`)
    console.log('─'.repeat(80))

    for (const [testName, times] of Object.entries(results)) {
      const bunDirect = times['Bun Direct'].toFixed(2)
      const shell = times.Shell.toFixed(2)
      const improvement = ((times.Shell - times['Bun Direct']) / times.Shell * 100).toFixed(1)

      console.log(
        `${testName.padEnd(20)
        + `${bunDirect}ms`.padEnd(15)
        + `${shell}ms`.padEnd(15)
        }+${improvement}% faster`,
      )
    }

    console.log('\n🎯 RECOMMENDATION: Use Bun Direct approach for significant performance gains')
  }
}
