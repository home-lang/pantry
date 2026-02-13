#!/usr/bin/env bun

/**
 * Pantry CLI
 *
 * A CLI tool that uses your custom S3 registry for packages
 * built with custom extensions (like PHP with pdo_pgsql).
 *
 * Usage:
 *   pantry install    # Install packages from pantry.yaml
 *   pantry shell      # Start a shell with packages in PATH
 *   pantry run <cmd>  # Run a command with packages in PATH
 */

import { existsSync, readFileSync, mkdirSync } from 'node:fs'
import { execSync, spawn } from 'node:child_process'
import { join } from 'node:path'
import { homedir } from 'node:os'

const INSTALL_DIR = join(homedir(), '.pantry')
const DEFAULT_BUCKET = 'pantry-registry'
const DEFAULT_REGION = 'us-east-1'

interface Config {
  dependencies: Record<string, string>
}

function findConfig(): string | null {
  const candidates = ['pantry.yaml', 'deps.yaml', '.pantry.yaml']

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate
    }
  }

  return null
}

function parseConfig(path: string): Config {
  const content = readFileSync(path, 'utf-8')
  const config: Config = { dependencies: {} }

  const lines = content.split('\n')
  let inDeps = false

  for (const line of lines) {
    const trimmed = line.trim()

    if (trimmed === 'dependencies:') {
      inDeps = true
      continue
    }

    if (inDeps && line.match(/^\s+\S/)) {
      const match = trimmed.match(/^([^:]+):\s*(.+)$/)
      if (match) {
        config.dependencies[match[1].trim()] = match[2].trim().replace(/['"]/g, '')
      }
    } else if (inDeps && !line.match(/^\s/) && trimmed !== '') {
      inDeps = false
    }
  }

  return config
}

function getInstalledPackagePaths(packages: string[]): string[] {
  const paths: string[] = []

  for (const pkg of packages) {
    const binDir = join(INSTALL_DIR, pkg, 'current', 'bin')
    const sbinDir = join(INSTALL_DIR, pkg, 'current', 'sbin')

    if (existsSync(binDir)) paths.push(binDir)
    if (existsSync(sbinDir)) paths.push(sbinDir)
  }

  return paths
}

function getLibraryPaths(packages: string[]): string[] {
  const paths: string[] = []

  for (const pkg of packages) {
    const libDir = join(INSTALL_DIR, pkg, 'current', 'lib')
    if (existsSync(libDir)) paths.push(libDir)
  }

  return paths
}

async function install(bucket: string, region: string): Promise<boolean> {
  const configPath = findConfig()

  if (!configPath) {
    console.error('❌ No pantry.yaml or deps.yaml found in current directory')
    return false
  }

  console.log(`📦 Installing from ${configPath}...`)

  // Run the download script
  const scriptPath = join(import.meta.dir, 'download-from-s3.ts')
  const cmd = `bun "${scriptPath}" -c "${configPath}" -b "${bucket}" -r "${region}"`

  try {
    execSync(cmd, { stdio: 'inherit' })
    return true
  } catch (error) {
    return false
  }
}

function shellEnv(packages: string[]): Record<string, string> {
  const binPaths = getInstalledPackagePaths(packages)
  const libPaths = getLibraryPaths(packages)

  const env: Record<string, string> = { ...process.env }

  if (binPaths.length > 0) {
    env.PATH = [...binPaths, process.env.PATH || ''].join(':')
  }

  if (libPaths.length > 0) {
    env.LD_LIBRARY_PATH = [...libPaths, process.env.LD_LIBRARY_PATH || ''].join(':')
    env.DYLD_LIBRARY_PATH = [...libPaths, process.env.DYLD_LIBRARY_PATH || ''].join(':')
  }

  // Set custom indicator
  env.PANTRY_CUSTOM = '1'
  env.PANTRY_DIR = INSTALL_DIR

  return env
}

async function startShell(packages: string[]): Promise<void> {
  const env = shellEnv(packages)
  const shell = process.env.SHELL || '/bin/bash'

  console.log(`\n🐚 Starting shell with ${packages.length} packages in PATH`)
  console.log(`   Packages: ${packages.join(', ')}`)
  console.log(`   Exit with 'exit' or Ctrl+D\n`)

  const child = spawn(shell, ['-i'], {
    stdio: 'inherit',
    env,
  })

  await new Promise<void>((resolve) => {
    child.on('close', () => resolve())
  })
}

async function runCommand(packages: string[], args: string[]): Promise<number> {
  const env = shellEnv(packages)

  const child = spawn(args[0], args.slice(1), {
    stdio: 'inherit',
    env,
  })

  return new Promise((resolve) => {
    child.on('close', (code) => resolve(code || 0))
  })
}

function showStatus(packages: string[]): void {
  console.log(`\n📊 Pantry Status`)
  console.log(`${'='.repeat(50)}`)
  console.log(`Install directory: ${INSTALL_DIR}`)
  console.log(`\nInstalled packages:`)

  for (const pkg of packages) {
    const pkgDir = join(INSTALL_DIR, pkg)
    const currentLink = join(pkgDir, 'current')

    if (existsSync(currentLink)) {
      try {
        const version = readFileSync(currentLink, 'utf-8').trim() ||
          execSync(`readlink "${currentLink}"`, { encoding: 'utf-8' }).trim()
        console.log(`  ✅ ${pkg} @ ${version}`)
      } catch {
        console.log(`  ✅ ${pkg}`)
      }
    } else if (existsSync(pkgDir)) {
      console.log(`  ⚠️  ${pkg} (no current version linked)`)
    } else {
      console.log(`  ❌ ${pkg} (not installed)`)
    }
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2)
  const command = args[0]

  // Parse global options
  let bucket = DEFAULT_BUCKET
  let region = DEFAULT_REGION

  const bucketIdx = args.indexOf('--bucket')
  if (bucketIdx !== -1 && args[bucketIdx + 1]) {
    bucket = args[bucketIdx + 1]
  }

  const regionIdx = args.indexOf('--region')
  if (regionIdx !== -1 && args[regionIdx + 1]) {
    region = args[regionIdx + 1]
  }

  // Get config for package list
  const configPath = findConfig()
  const config = configPath ? parseConfig(configPath) : { dependencies: {} }
  const packages = Object.keys(config.dependencies)

  switch (command) {
    case 'install':
    case 'i':
      const success = await install(bucket, region)
      process.exit(success ? 0 : 1)
      break

    case 'shell':
    case 'sh':
      if (packages.length === 0) {
        console.error('❌ No packages defined in pantry.yaml')
        process.exit(1)
      }
      await startShell(packages)
      break

    case 'run':
    case 'exec':
      if (args.length < 2) {
        console.error('Usage: pantry run <command> [args...]')
        process.exit(1)
      }
      const exitCode = await runCommand(packages, args.slice(1))
      process.exit(exitCode)
      break

    case 'status':
    case 'list':
      showStatus(packages)
      break

    case 'env':
      // Print environment variables for sourcing
      const env = shellEnv(packages)
      console.log(`export PATH="${env.PATH}"`)
      if (env.LD_LIBRARY_PATH) {
        console.log(`export LD_LIBRARY_PATH="${env.LD_LIBRARY_PATH}"`)
      }
      if (env.DYLD_LIBRARY_PATH) {
        console.log(`export DYLD_LIBRARY_PATH="${env.DYLD_LIBRARY_PATH}"`)
      }
      break

    case 'help':
    case '--help':
    case '-h':
    default:
      console.log(`
pantry - Custom package manager using your S3 registry

Usage:
  pantry <command> [options]

Commands:
  install, i     Install packages from pantry.yaml
  shell, sh      Start an interactive shell with packages in PATH
  run, exec      Run a command with packages in PATH
  status, list   Show installed package status
  env            Print environment variables for sourcing
  help           Show this help message

Options:
  --bucket <name>    S3 bucket name (default: ${DEFAULT_BUCKET})
  --region <region>  AWS region (default: ${DEFAULT_REGION})

Examples:
  # Install all packages from pantry.yaml
  pantry install

  # Start a shell with packages available
  pantry shell

  # Run PHP with custom extensions
  pantry run php -v

  # Run composer install
  pantry run composer install

  # Source environment in current shell
  eval $(pantry env)

Configuration:
  Create a pantry.yaml in your project:

  dependencies:
    php.net: ^8.4
    getcomposer.org: ^2
    postgresql.org: ^17
    redis.io: ^7
`)
      break
  }
}

main().catch((error) => {
  console.error('Error:', error.message)
  process.exit(1)
})
