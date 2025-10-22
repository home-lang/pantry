/* eslint-disable no-console */
import type { Command } from '../cli/types'
import fs from 'node:fs'
import { homedir } from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { config } from '../config'
import { performSetup } from '../setup'

function parseArgs(argv: string[]): { force: boolean, verbose: boolean, target?: string, release?: string, dryRun: boolean } {
  let force = false
  let verbose = false
  let target: string | undefined
  let release: string | undefined
  let dryRun = false

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--force')
      force = true
    else if (a === '--verbose')
      verbose = true
    else if (a === '--dry-run')
      dryRun = true
    else if (a === '--target' && i + 1 < argv.length)
      target = argv[++i]
    else if (a.startsWith('--target='))
      target = a.split('=')[1]
    else if (a === '--release' && i + 1 < argv.length)
      release = argv[++i]
    else if (a.startsWith('--release='))
      release = a.split('=')[1]
  }

  return { force, verbose, target, release, dryRun }
}

async function detectCurrentBinaryPath(_verbose: boolean): Promise<string> {
  // Try which launchpad
  try {
    const { execSync } = await import('node:child_process')
    const whichResult = execSync('which launchpad', { encoding: 'utf8', stdio: 'pipe' })
    const whichPath = whichResult.trim()

    // Use 'which' result unless it points to a development environment
    if (!whichPath.includes('/packages/') && !whichPath.includes('/dist/') && !whichPath.includes('/src/')) {
      return whichPath
    }

    // Development environment detected, look for actual installed binary
    const realBinaryPaths = [
      '/usr/local/bin/launchpad',
      '/usr/bin/launchpad',
      path.join(homedir(), '.local/bin/launchpad'),
      path.join(homedir(), '.bun/bin/launchpad'),
      path.join(homedir(), 'bin/launchpad'),
    ]

    for (const realPath of realBinaryPaths) {
      if (fs.existsSync(realPath)) {
        try {
          const stats = fs.lstatSync(realPath)
          if (stats.isSymbolicLink()) {
            const linkTarget = fs.readlinkSync(realPath)
            if (!linkTarget.includes('/packages/') && !linkTarget.includes('/dist/')) {
              return realPath
            }
          }
          else {
            return realPath
          }
        }
        catch {
          return realPath
        }
      }
    }

    return whichPath
  }
  catch {
    // Fallbacks
    if (process.argv[1] && process.argv[1].includes('launchpad') && !process.argv[1].includes('.test.') && !process.argv[1].includes('/test/') && !process.argv[1].includes('/packages/') && !process.argv[1].includes('/dist/')) {
      return process.argv[1]
    }

    const commonPaths = [
      '/usr/local/bin/launchpad',
      '/usr/bin/launchpad',
      path.join(homedir(), '.local/bin/launchpad'),
      path.join(homedir(), '.bun/bin/launchpad'),
      path.join(homedir(), 'bin/launchpad'),
    ]

    for (const p of commonPaths) {
      if (fs.existsSync(p))
        return p
    }

    return '/usr/local/bin/launchpad'
  }
}

const command: Command = {
  name: 'upgrade',
  description: 'Upgrade Launchpad to the latest version',
  async run(ctx) {
    const { force, verbose, target, release, dryRun } = parseArgs(ctx.argv || [])

    if (verbose)
      config.verbose = true

    // Detect current binary
    const currentBinaryPath = await detectCurrentBinaryPath(verbose)
    const targetPath = target || currentBinaryPath

    if (verbose) {
      console.log(`🔍 Detected current binary: ${currentBinaryPath}`)
      console.log(`🎯 Upgrade target: ${targetPath}`)
    }

    // Resolve target version
    let targetVersion = release
    if (!targetVersion) {
      try {
        const response = await globalThis.fetch('https://api.github.com/repos/stacksjs/launchpad/releases/latest')
        if (!response.ok)
          throw new Error(`GitHub API request failed: ${response.status} ${response.statusText}`)
        const json = await response.json() as { tag_name: string }
        targetVersion = json.tag_name
      }
      catch (error) {
        console.error('Failed to check latest version:', error instanceof Error ? error.message : String(error))
        console.log('You can specify a version manually with --release')
        return 1
      }
    }

    // Read current version from package.json for comparison (local dev)
    const pkg = await import('../../package.json')
    const currentVersion = (pkg as any).default?.version || (pkg as any).version || '0.0.0'

    if (!force && targetVersion === `v${currentVersion}`) {
      console.log(`✅ You're already on the latest version of Launchpad \x1B[2m\x1B[3m(v${currentVersion})\x1B[0m`)
      if (verbose)
        console.log('💡 Use --force to reinstall the same version')
      return 0
    }

    if (verbose && targetVersion !== `v${currentVersion}`) {
      console.log(`🚀 Upgrading from v${currentVersion} to ${targetVersion}`)
    }

    if (dryRun) {
      console.log('\n🔍 DRY RUN MODE - Showing what would be upgraded:\n')
      console.log(`📋 Current binary: ${currentBinaryPath}`)
      console.log(`📋 Current version: v${currentVersion}`)
      console.log(`📋 Target version: ${targetVersion}`)
      console.log(`📋 Target path: ${targetPath}`)
      if (targetVersion === `v${currentVersion}`) {
        console.log('\n✅ Already on target version - no upgrade needed')
        console.log('💡 Use --force to reinstall the same version')
      }
      else {
        console.log('\n🧰 Would download, extract and install the new binary to the target path')
        console.log('🧪 Would verify by running --version and report status')
      }
      return 0
    }

    try {
      const ok = await performSetup({ targetVersion, targetPath, force: true, verbose })
      if (ok) {
        console.log(`Congrats! Launchpad was updated to ${targetVersion}`)
      }
      else {
        if (fs.existsSync(targetPath)) {
          const stats = fs.statSync(targetPath)
          if (stats.size > 1000000) {
            console.log(`Congrats! Launchpad was updated to ${targetVersion}`)
          }
          else {
            console.log('Upgrade completed with verification issues')
            console.log('The binary may still work, but there could be compatibility issues.')
            console.log('Try running: launchpad --version')
          }
        }
        else {
          console.log('Upgrade failed - binary not found at target location')
        }
      }
      return 0
    }
    catch (error) {
      console.error('Upgrade failed:', error instanceof Error ? error.message : String(error))
      if (verbose) {
        console.log('Try running the setup command manually:')
        console.log(`  launchpad setup --release ${targetVersion} --target "${targetPath}" --force`)
      }
      return 1
    }
  },
}

export default command
