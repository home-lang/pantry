/* eslint-disable no-console */
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'

interface EnvironmentInfo {
  hash: string
  projectName: string
  path: string
  size: string
  sizeBytes: number
  packages: number
  binaries: number
  created: Date
  modified: Date
}

interface ListEnvironmentsOptions {
  verbose: boolean
  format: string
}

interface InspectEnvironmentOptions {
  verbose: boolean
  showStubs: boolean
}

interface CleanEnvironmentsOptions {
  dryRun: boolean
  olderThanDays: number
  force: boolean
  verbose: boolean
}

interface RemoveEnvironmentOptions {
  force: boolean
  verbose: boolean
}

function getEnvironmentsBaseDir(): string {
  return path.join(os.homedir(), '.local', 'share', 'launchpad')
}

function formatSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`
}

function calculateDirectorySize(dirPath: string): number {
  if (!fs.existsSync(dirPath)) {
    return 0
  }

  let totalSize = 0
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true })
    for (const entry of entries) {
      const entryPath = path.join(dirPath, entry.name)
      try {
        if (entry.isDirectory()) {
          totalSize += calculateDirectorySize(entryPath)
        }
        else {
          const stats = fs.statSync(entryPath)
          totalSize += stats.size
        }
      }
      catch {
        // Skip files we can't read
      }
    }
  }
  catch {
    // Skip directories we can't read
  }
  return totalSize
}

function countItems(dirPath: string): number {
  if (!fs.existsSync(dirPath)) {
    return 0
  }

  try {
    return fs.readdirSync(dirPath).length
  }
  catch {
    return 0
  }
}

function parseEnvironmentHash(hash: string): { projectName: string, shortHash: string } {
  const parts = hash.split('_')
  if (parts.length >= 2) {
    const shortHash = parts.pop() || ''
    const projectName = parts.join('_')
    return { projectName, shortHash }
  }
  return { projectName: hash, shortHash: '' }
}

function getAllEnvironments(): EnvironmentInfo[] {
  const envsDir = getEnvironmentsBaseDir()

  if (!fs.existsSync(envsDir)) {
    return []
  }

  const environments: EnvironmentInfo[] = []

  try {
    const entries = fs.readdirSync(envsDir, { withFileTypes: true })

    for (const entry of entries) {
      if (!entry.isDirectory()) {
        continue
      }

      // Skip directories that don't look like environment hashes (should contain an underscore)
      if (!entry.name.includes('_')) {
        continue
      }

      const envPath = path.join(envsDir, entry.name)
      const { projectName } = parseEnvironmentHash(entry.name)

      try {
        const stats = fs.statSync(envPath)
        const sizeBytes = calculateDirectorySize(envPath)
        const packages = countItems(path.join(envPath, 'pkgs'))
        const binaries = countItems(path.join(envPath, 'bin'))

        environments.push({
          hash: entry.name,
          projectName,
          path: envPath,
          size: formatSize(sizeBytes),
          sizeBytes,
          packages,
          binaries,
          created: stats.birthtime,
          modified: stats.mtime,
        })
      }
      catch {
        // Skip environments we can't read
      }
    }
  }
  catch {
    // Skip if we can't read the environments directory
  }

  return environments.sort((a, b) => b.modified.getTime() - a.modified.getTime())
}

export async function listEnvironments(options: ListEnvironmentsOptions): Promise<void> {
  const environments = getAllEnvironments()

  if (environments.length === 0) {
    console.log('📭 No development environments found')
    return
  }

  switch (options.format) {
    case 'json':
      console.log(JSON.stringify(environments.map(env => ({
        hash: env.hash,
        projectName: env.projectName,
        packages: env.packages,
        binaries: env.binaries,
        size: env.size,
        created: env.created.toISOString(),
      })), null, 2))
      break

    case 'simple':
      environments.forEach((env) => {
        console.log(`${env.projectName} (${env.hash})`)
      })
      break

    default: { // table
      console.log('📦 Development Environments:\n')

      const table = [
        ['Project', 'Packages', 'Binaries', 'Size', 'Created'],
      ]

      if (options.verbose) {
        table[0].push('Hash')
      }

      environments.forEach((env) => {
        const row = [
          env.projectName,
          env.packages.toString(),
          env.binaries.toString(),
          env.size,
          env.created.toLocaleDateString(),
        ]

        if (options.verbose) {
          row.push(env.hash)
        }

        table.push(row)
      })

      // Calculate column widths
      const colWidths = table[0].map((_, colIndex) =>
        Math.max(...table.map(row => row[colIndex]?.length || 0)),
      )

      // Print header
      const header = table[0].map((col, i) => col.padEnd(colWidths[i])).join(' │ ')
      console.log(`│ ${header} │`)

      // Print separator
      const separator = colWidths.map(width => '─'.repeat(width)).join('─┼─')
      console.log(`├─${separator}─┤`)

      // Print rows
      table.slice(1).forEach((row) => {
        const formattedRow = row.map((col, i) => col.padEnd(colWidths[i])).join(' │ ')
        console.log(`│ ${formattedRow} │`)
      })

      // Print footer
      const footer = '─'.repeat(header.length + 4)
      console.log(`└${footer}┘`)

      console.log(`\nTotal: ${environments.length} environment(s)`)
      break
    }
  }
}

export async function inspectEnvironment(hash: string, options: InspectEnvironmentOptions): Promise<void> {
  const envsDir = getEnvironmentsBaseDir()
  const envPath = path.join(envsDir, hash)

  if (!fs.existsSync(envPath)) {
    console.error(`❌ Environment not found: ${hash}`)
    console.log('\nAvailable environments:')
    const environments = getAllEnvironments()
    if (environments.length > 0) {
      environments.forEach((env) => {
        console.log(`  • ${env.hash} (${env.projectName})`)
      })
    }
    else {
      console.log('  (none)')
    }
    process.exit(1)
  }

  const { projectName } = parseEnvironmentHash(hash)
  const stats = fs.statSync(envPath)
  const sizeBytes = calculateDirectorySize(envPath)
  const packages = countItems(path.join(envPath, 'pkgs'))
  const binaries = countItems(path.join(envPath, 'bin'))

  console.log(`🔍 Inspecting environment: ${hash}\n`)

  console.log('📋 Basic Information:')
  console.log(`  Project Name: ${projectName}`)
  console.log(`  Hash: ${hash}`)
  console.log(`  Path: ${envPath}`)
  console.log(`  Size: ${formatSize(sizeBytes)}`)
  console.log(`  Created: ${stats.birthtime.toLocaleString()}`)
  console.log(`  Modified: ${stats.mtime.toLocaleString()}`)

  if (options.verbose || options.showStubs) {
    console.log('\n📁 Directory Structure:')
    const subdirs = ['bin', 'pkgs', 'lib', 'share', 'sbin', 'include']
    subdirs.forEach((subdir) => {
      const subdirPath = path.join(envPath, subdir)
      const count = countItems(subdirPath)
      if (count > 0) {
        console.log(`  ${subdir}/: ${count} item(s)`)
      }
    })
  }

  // Show installed packages
  const pkgsDir = path.join(envPath, 'pkgs')
  if (fs.existsSync(pkgsDir)) {
    console.log('\n📦 Installed Packages:')
    try {
      const pkgDirs = fs.readdirSync(pkgsDir, { withFileTypes: true })
        .filter(entry => entry.isDirectory())
        .map(entry => entry.name)

      if (pkgDirs.length > 0) {
        pkgDirs.forEach((pkg) => {
          console.log(`  ${pkg}`)
        })
      }
      else {
        console.log('  (none)')
      }
    }
    catch {
      console.log('  (unable to read packages)')
    }
  }

  // Show binaries
  const binDir = path.join(envPath, 'bin')
  if (fs.existsSync(binDir)) {
    console.log('\n🔧 BIN Binaries:')
    try {
      const binFiles = fs.readdirSync(binDir)
      if (binFiles.length > 0) {
        binFiles.slice(0, 10).forEach((bin) => {
          const binPath = path.join(binDir, bin)
          try {
            const binStats = fs.statSync(binPath)
            const type = binStats.isFile() ? 'file' : 'directory'
            const executable = binStats.isFile() && (binStats.mode & 0o111) ? ', executable' : ''
            console.log(`  ${bin} (${type}${executable})`)
          }
          catch {
            console.log(`  ${bin} (unknown)`)
          }
        })
        if (binFiles.length > 10) {
          console.log(`  ... and ${binFiles.length - 10} more`)
        }
      }
      else {
        console.log('  (none)')
      }
    }
    catch {
      console.log('  (unable to read binaries)')
    }
  }

  // Show binary stub contents if requested
  if (options.showStubs && fs.existsSync(binDir)) {
    console.log('\n📄 Binary Stub Contents:')
    try {
      const binFiles = fs.readdirSync(binDir).slice(0, 3) // Show first 3 stubs
      for (const bin of binFiles) {
        const binPath = path.join(binDir, bin)
        try {
          const content = fs.readFileSync(binPath, 'utf8')
          console.log(`\n  ${bin}:`)
          console.log(content.slice(0, 200).split('\n').map(line => `    ${line}`).join('\n'))
          if (content.length > 200) {
            console.log('    ... (truncated)')
          }
        }
        catch {
          console.log(`\n  ${bin}: (unable to read)`)
        }
      }
    }
    catch {
      console.log('  (unable to read stub files)')
    }
  }

  // Health check
  console.log('\n🏥 Health Check:')
  const hasPackages = packages > 0
  const hasBinaries = binaries > 0
  const hasRequiredDirs = fs.existsSync(path.join(envPath, 'bin'))

  console.log(`  ${hasBinaries ? '✅' : '❌'} Binaries present`)
  console.log(`  ${hasPackages ? '✅' : '❌'} ${packages} package(s) installed`)
  console.log(`  ${hasRequiredDirs ? '✅' : '❌'} Directory structure`)

  const isHealthy = hasPackages && hasBinaries && hasRequiredDirs
  console.log(`\nOverall Status: ${isHealthy ? '✅ Healthy' : '⚠️  Issues detected'}`)
}

export async function cleanEnvironments(options: CleanEnvironmentsOptions): Promise<void> {
  const environments = getAllEnvironments()

  if (environments.length === 0) {
    console.log('📭 No development environments found')
    return
  }

  const now = new Date()
  const olderThanMs = options.olderThanDays * 24 * 60 * 60 * 1000

  // Filter environments to clean
  const toClean = environments.filter((env) => {
    const age = now.getTime() - env.modified.getTime()
    const isOld = age > olderThanMs
    const isEmpty = env.packages === 0 && env.binaries === 0
    const isBroken = !fs.existsSync(path.join(env.path, 'bin'))

    return isOld || isEmpty || isBroken
  })

  if (toClean.length === 0) {
    console.log('📭 No environments need cleaning')
    console.log(`Checked ${environments.length} environment(s), all are recent and healthy`)
    return
  }

  const totalSize = toClean.reduce((sum, env) => sum + env.sizeBytes, 0)

  if (options.dryRun) {
    console.log('🔍 DRY RUN MODE - Nothing will actually be cleaned\n')
  }

  console.log(`${options.dryRun ? 'Would clean' : 'Cleaning'} ${toClean.length} environment(s)`)
  console.log(`Total size to ${options.dryRun ? 'be freed' : 'free'}: ${formatSize(totalSize)}\n`)

  console.log('**Cleanup Criteria:**')
  console.log(`- Environments older than ${options.olderThanDays} days`)
  console.log('- Environments with no binaries (failed installations)')
  console.log('- Empty or corrupted environment directories\n')

  console.log('**Environments to clean:**')
  toClean.forEach((env) => {
    const age = Math.floor((now.getTime() - env.modified.getTime()) / (24 * 60 * 60 * 1000))
    const reason = age > options.olderThanDays
      ? `${age} days old`
      : env.packages === 0 && env.binaries === 0
        ? 'empty'
        : 'corrupted'

    console.log(`  • ${env.hash} (${env.projectName}) - ${env.size} - ${reason}`)

    if (options.verbose) {
      console.log(`    Path: ${env.path}`)
      console.log(`    Last modified: ${env.modified.toLocaleString()}`)
    }
  })

  if (options.dryRun) {
    return
  }

  if (!options.force) {
    console.log('\n⚠️  This will permanently delete the environments listed above!')
    console.log('Use --force to skip this confirmation or --dry-run to preview')
    process.exit(0)
  }

  // Perform cleanup
  let removed = 0
  let failed = 0
  let freedBytes = 0

  console.log('\n🗑️  Removing environments...')

  for (const env of toClean) {
    try {
      if (options.verbose) {
        console.log(`  Removing ${env.hash}...`)
      }

      freedBytes += env.sizeBytes
      fs.rmSync(env.path, { recursive: true, force: true })
      removed++

      if (options.verbose) {
        console.log(`    ✅ Removed ${env.hash} (${env.size})`)
      }
    }
    catch (error) {
      failed++
      console.error(`    ❌ Failed to remove ${env.hash}:`, error instanceof Error ? error.message : String(error))
    }
  }

  console.log('\n✅ Environment cleanup completed!')
  console.log(`  • Removed: ${removed}/${toClean.length} environment(s)`)
  if (failed > 0) {
    console.log(`  • Failed: ${failed} environment(s)`)
  }
  console.log(`  • Freed: ${formatSize(freedBytes)} of disk space`)
}

export async function removeEnvironment(hash: string, options: RemoveEnvironmentOptions): Promise<void> {
  const envsDir = getEnvironmentsBaseDir()
  const envPath = path.join(envsDir, hash)

  if (!fs.existsSync(envPath)) {
    console.error(`❌ Environment not found: ${hash}`)
    console.log('\nAvailable environments:')
    const environments = getAllEnvironments()
    if (environments.length > 0) {
      environments.forEach((env) => {
        console.log(`  • ${env.hash} (${env.projectName})`)
      })
    }
    else {
      console.log('  (none)')
    }
    process.exit(1)
  }

  const { projectName } = parseEnvironmentHash(hash)
  const sizeBytes = calculateDirectorySize(envPath)
  const size = formatSize(sizeBytes)

  console.log(`🗑️  Removing environment: ${hash}`)
  console.log(`  Project: ${projectName}`)
  console.log(`  Size: ${size}`)
  console.log(`  Path: ${envPath}`)

  if (options.verbose) {
    const packages = countItems(path.join(envPath, 'pkgs'))
    const binaries = countItems(path.join(envPath, 'bin'))
    console.log(`  Packages: ${packages}`)
    console.log(`  Binaries: ${binaries}`)
  }

  if (!options.force) {
    console.log('\n⚠️  This will permanently delete this environment!')
    console.log('Use --force to skip this confirmation')
    process.exit(0)
  }

  try {
    console.log('\n🗑️  Removing...')
    fs.rmSync(envPath, { recursive: true, force: true })

    console.log('\n✅ Environment removed successfully!')
    console.log(`  • Freed: ${size} of disk space`)

    if (options.verbose) {
      console.log(`  • Path: ${envPath}`)
      console.log(`  • Project: ${projectName}`)
    }
  }
  catch (error) {
    console.error('\n❌ Failed to remove environment:', error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}
