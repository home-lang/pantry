// #!/usr/bin/env bun
// /* eslint-disable no-console */

// /**
//  * Performance comparison between shell-based file detection and Bun glob implementation
//  * This benchmark tests the speed of finding project configuration files in directory trees
//  */

// import { Glob } from 'bun'
// import { execSync } from 'node:child_process'
// import { existsSync } from 'node:fs'
// import { dirname, join } from 'node:path'

// // Configuration files to detect (matching the shell regex pattern)
// const PROJECT_FILES = [
//   // Dependencies files
//   'dependencies.yaml',
//   'dependencies.yml',
//   'deps.yaml',
//   'deps.yml',
//   'pkgx.yaml',
//   'pkgx.yml',
//   'launchpad.yaml',
//   'launchpad.yml',

//   // Package managers
//   'package.json',
//   'pyproject.toml',
//   'Cargo.toml',
//   'go.mod',
//   'go.sum',
//   'Gemfile',
//   'deno.json',
//   'deno.jsonc',

//   // CI/CD
//   'action.yml',
//   'action.yaml',
//   'skaffold.yml',
//   'skaffold.yaml',

//   // Version files
//   '.nvmrc',
//   '.node-version',
//   '.ruby-version',
//   '.python-version',
//   '.terraform-version',

//   // Lock files
//   'yarn.lock',
//   'bun.lock',
//   'bun.lockb',
//   '.yarnrc',
//   'requirements.txt',
//   'setup.py',
//   'Pipfile',
//   'Pipfile.lock',
// ]

// /**
//  * Bun-based implementation using glob patterns
//  */
// async function findProjectRootBun(startDir: string): Promise<string | null> {
//   let currentDir = startDir

//   while (currentDir !== '/') {
//     // Use Bun's Glob to check for any project files in current directory
//     const pattern = `{${PROJECT_FILES.join(',')}}`
//     const glob = new Glob(pattern)
//     const matches = []

//     for await (const file of glob.scan({ cwd: currentDir, onlyFiles: true })) {
//       matches.push(file)
//       break // We only need to know if any file exists
//     }

//     if (matches.length > 0) {
//       return currentDir
//     }

//     currentDir = dirname(currentDir)
//   }

//   return null
// }

// /**
//  * Optimized Bun implementation using direct file system checks
//  */
// function findProjectRootBunSync(startDir: string): string | null {
//   let currentDir = startDir

//   while (currentDir !== '/') {
//     // Direct file existence checks (faster than glob for small file lists)
//     for (const file of PROJECT_FILES) {
//       const filePath = join(currentDir, file)
//       if (existsSync(filePath)) {
//         return currentDir
//       }
//     }

//     currentDir = dirname(currentDir)
//   }

//   return null
// }

// /**
//  * Shell-based implementation (current approach)
//  */
// function findProjectRootShell(startDir: string): string | null {
//   try {
//     const shellScript = `
//       dir="${startDir}"
//       while [[ "$dir" != "/" ]]; do
//         files=$(ls -1a "$dir" 2>/dev/null | grep -E '^(dependencies|deps|pkgx|launchpad)\\.(yaml|yml)$|^package\\.json$|^pyproject\\.toml$|^Cargo\\.toml$|^go\\.(mod|sum)$|^Gemfile$|^deno\\.jsonc?$|^action\\.ya?ml$|^skaffold\\.ya?ml$|^\\.(nvmrc|node-version|ruby-version|python-version|terraform-version)$|^(yarn\\.lock|bun\\.lock|bun\\.lockb|\\.yarnrc|requirements\\.txt|setup\\.py|Pipfile\\.?lock?)$' | head -1)
//         if [[ -n "$files" ]]; then
//           echo "$dir"
//           exit 0
//         fi
//         dir="$(dirname "$dir")"
//       done
//       exit 1
//     `

//     const result = execSync(shellScript, {
//       encoding: 'utf8',
//       stdio: ['pipe', 'pipe', 'ignore'],
//     }).trim()

//     return result || null
//   }
//   catch {
//     return null
//   }
// }

// /**
//  * Create test directory structure for benchmarking
//  */
// function createTestStructure(baseDir: string, depth: number = 10): string {
//   const testDir = join(baseDir, `test-structure-${Date.now()}`)

//   // Create nested directory structure
//   let currentPath = testDir
//   for (let i = 0; i < depth; i++) {
//     currentPath = join(currentPath, `level-${i}`)
//     execSync(`mkdir -p "${currentPath}"`)
//   }

//   // Place a package.json at the root level
//   const packageJsonPath = join(testDir, 'package.json')
//   execSync(`echo '{"name": "test"}' > "${packageJsonPath}"`)

//   return currentPath // Return the deepest directory
// }

// /**
//  * Benchmark function
//  */
// async function benchmark(name: string, fn: () => Promise<any> | any, iterations: number = 1000): Promise<number> {
//   // Warmup
//   for (let i = 0; i < 10; i++) {
//     await fn()
//   }

//   const start = performance.now()

//   for (let i = 0; i < iterations; i++) {
//     await fn()
//   }

//   const end = performance.now()
//   const totalTime = end - start
//   const avgTime = totalTime / iterations

//   console.log(`${name}: ${avgTime.toFixed(3)}ms avg (${totalTime.toFixed(1)}ms total, ${iterations} iterations)`)
//   return avgTime
// }

// /**
//  * Main benchmark execution
//  */
// async function main() {
//   console.log('🚀 File Detection Performance Comparison\n')
//   console.log('Testing directory traversal performance for project file detection...\n')

//   // Create test structures with different depths
//   const testCases = [
//     { name: 'Shallow (3 levels)', depth: 3 },
//     { name: 'Medium (7 levels)', depth: 7 },
//     { name: 'Deep (15 levels)', depth: 15 },
//     { name: 'Very Deep (25 levels)', depth: 25 },
//   ]

//   const results: Record<string, Record<string, number>> = {}

//   for (const testCase of testCases) {
//     console.log(`📁 Testing: ${testCase.name}`)
//     console.log('─'.repeat(50))

//     const testDir = createTestStructure('/tmp', testCase.depth)

//     try {
//       // Benchmark each approach
//       const bunAsyncTime = await benchmark(
//         'Bun Glob (async)     ',
//         () => findProjectRootBun(testDir),
//         500,
//       )

//       const bunSyncTime = await benchmark(
//         'Bun Direct (sync)    ',
//         () => findProjectRootBunSync(testDir),
//         1000,
//       )

//       const shellTime = await benchmark(
//         'Shell (current)      ',
//         () => findProjectRootShell(testDir),
//         200, // Fewer iterations for shell due to process overhead
//       )

//       results[testCase.name] = {
//         'Bun Glob': bunAsyncTime,
//         'Bun Direct': bunSyncTime,
//         'Shell': shellTime,
//       }

//       // Calculate speed improvements
//       const bunDirectVsShell = ((shellTime - bunSyncTime) / shellTime * 100)
//       const bunGlobVsShell = ((shellTime - bunAsyncTime) / shellTime * 100)

//       console.log(`\n📊 Speed Improvements vs Shell:`)
//       console.log(`   Bun Direct: ${bunDirectVsShell > 0 ? '+' : ''}${bunDirectVsShell.toFixed(1)}% ${bunDirectVsShell > 0 ? 'faster' : 'slower'}`)
//       console.log(`   Bun Glob:   ${bunGlobVsShell > 0 ? '+' : ''}${bunGlobVsShell.toFixed(1)}% ${bunGlobVsShell > 0 ? 'faster' : 'slower'}`)
//     }
//     finally {
//       // Cleanup
//       execSync(`rm -rf "${testDir.split('/').slice(0, -testCase.depth).join('/')}"`)
//     }

//     console.log('\n')
//   }

//   // Summary table
//   console.log('📈 PERFORMANCE SUMMARY')
//   console.log('═'.repeat(80))
//   console.log(`${'Test Case'.padEnd(20) + 'Bun Direct'.padEnd(15) + 'Bun Glob'.padEnd(15) + 'Shell'.padEnd(15)}Best`)
//   console.log('─'.repeat(80))

//   for (const [testName, times] of Object.entries(results)) {
//     const bunDirect = times['Bun Direct'].toFixed(2)
//     const bunGlob = times['Bun Glob'].toFixed(2)
//     const shell = times.Shell.toFixed(2)

//     const fastest = Math.min(times['Bun Direct'], times['Bun Glob'], times.Shell)
//     let best = ''
//     if (fastest === times['Bun Direct'])
//       best = 'Bun Direct'
//     else if (fastest === times['Bun Glob'])
//       best = 'Bun Glob'
//     else best = 'Shell'

//     console.log(
//       testName.padEnd(20)
//       + `${bunDirect}ms`.padEnd(15)
//       + `${bunGlob}ms`.padEnd(15)
//       + `${shell}ms`.padEnd(15)
//       + best,
//     )
//   }

//   console.log('\n🎯 RECOMMENDATIONS:')
//   console.log('─'.repeat(50))

//   // Calculate overall averages
//   const avgBunDirect = Object.values(results).reduce((sum, r) => sum + r['Bun Direct'], 0) / Object.keys(results).length
//   const avgBunGlob = Object.values(results).reduce((sum, r) => sum + r['Bun Glob'], 0) / Object.keys(results).length
//   const avgShell = Object.values(results).reduce((sum, r) => sum + r.Shell, 0) / Object.keys(results).length

//   if (avgBunDirect < avgShell && avgBunDirect < avgBunGlob) {
//     const improvement = ((avgShell - avgBunDirect) / avgShell * 100)
//     console.log(`✅ Use Bun Direct approach - ${improvement.toFixed(1)}% faster on average`)
//     console.log('   + Fastest performance')
//     console.log('   + No async overhead')
//     console.log('   + Simple implementation')
//     console.log('   - Requires Node.js/Bun runtime')
//   }
//   else if (avgBunGlob < avgShell) {
//     const improvement = ((avgShell - avgBunGlob) / avgShell * 100)
//     console.log(`✅ Use Bun Glob approach - ${improvement.toFixed(1)}% faster on average`)
//     console.log('   + Good performance')
//     console.log('   + More flexible pattern matching')
//     console.log('   - Async overhead')
//     console.log('   - Requires Node.js/Bun runtime')
//   }
//   else {
//     console.log('✅ Keep Shell approach')
//     console.log('   + Works in any environment')
//     console.log('   + No runtime dependencies')
//     console.log('   - Slower due to process overhead')
//   }

//   console.log('\n💡 Additional Notes:')
//   console.log('   • Shell approach has consistent performance regardless of depth')
//   console.log('   • Bun approaches scale better with directory depth')
//   console.log('   • Consider hybrid approach: Bun when available, shell as fallback')
// }

// // Run the benchmark
// if (import.meta.main) {
//   main().catch(console.error)
// }

// export { findProjectRootBun, findProjectRootBunSync, findProjectRootShell }
