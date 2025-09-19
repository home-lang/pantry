#!/usr/bin/env bun

import type { PhpBuildConfig } from './precompiler'
import { existsSync, mkdirSync } from 'node:fs'
import { arch, platform } from 'node:os'
import { join } from 'node:path'
import { logUniqueMessage } from '../logging'
import { BuildDependencyManager } from './build-dependencies'
import { PhpPrecompiler } from './precompiler'

interface BuildOptions {
  version?: string
  config?: string
  platform?: string
  arch?: string
  buildDir?: string
  outputDir?: string
  skipDeps?: boolean
}

async function main(): Promise<void> {
  const args = process.argv.slice(2)
  const options: BuildOptions = {}

  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    const nextArg = args[i + 1]

    switch (arg) {
      case '--version':
        options.version = nextArg
        i++
        break
      case '--config':
        options.config = nextArg
        i++
        break
      case '--platform':
        options.platform = nextArg
        i++
        break
      case '--arch':
        options.arch = nextArg
        i++
        break
      case '--build-dir':
        options.buildDir = nextArg
        i++
        break
      case '--output-dir':
        options.outputDir = nextArg
        i++
        break
      case '--skip-deps':
        options.skipDeps = true
        break
      case '--help':
        showHelp()
        process.exit(0)
    }
  }

  // Set defaults
  const config: PhpBuildConfig = {
    version: options.version || '8.4.12',
    config: (options.config as any) || 'laravel-mysql',
    platform: (options.platform as any) || platform(),
    arch: (options.arch as any) || (arch() === 'arm64' ? 'arm64' : 'x86_64'),
    buildDir: options.buildDir || join(process.cwd(), 'build'),
    outputDir: options.outputDir || join(process.cwd(), 'binaries'),
  }

  logUniqueMessage('PHP Precompilation Build Script')
  logUniqueMessage('================================')
  logUniqueMessage(`Version: ${config.version}`)
  logUniqueMessage(`Config: ${config.config}`)
  logUniqueMessage(`Platform: ${config.platform}`)
  logUniqueMessage(`Architecture: ${config.arch}`)
  logUniqueMessage(`Build Directory: ${config.buildDir}`)
  logUniqueMessage(`Output Directory: ${config.outputDir}`)
  logUniqueMessage('')

  try {
    // Create directories
    mkdirSync(config.buildDir, { recursive: true })
    mkdirSync(config.outputDir, { recursive: true })

    // Install dependencies if not skipped
    if (!options.skipDeps) {
      logUniqueMessage('Installing build dependencies...')
      const depManager = new BuildDependencyManager()
      await depManager.installBuildDependencies()
    }
    else {
      logUniqueMessage('Skipping dependency installation')
    }

    // Build PHP
    const precompiler = new PhpPrecompiler(config)
    const binaryPath = await precompiler.buildPhp()

    logUniqueMessage('')
    logUniqueMessage('✅ PHP build completed successfully!')
    logUniqueMessage(`Binary location: ${binaryPath}`)

    // Test the binary
    await testPhpBinary(binaryPath)
  }
  catch (error) {
    logUniqueMessage('❌ PHP build failed!')
    logUniqueMessage(error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}

async function testPhpBinary(binaryPath: string): Promise<void> {
  const phpBinary = join(binaryPath, 'bin', 'php')

  if (!existsSync(phpBinary)) {
    logUniqueMessage('⚠️ PHP binary not found for testing')
    return
  }

  try {
    const { execSync } = await import('node:child_process')

    logUniqueMessage('Testing PHP binary...')
    const version = execSync(`"${phpBinary}" --version`, { encoding: 'utf8' })
    logUniqueMessage(`PHP Version: ${version.split('\n')[0]}`)

    const modules = execSync(`"${phpBinary}" -m`, { encoding: 'utf8' })
    const moduleList = modules.split('\n').filter(m => m.trim() && !m.startsWith('['))
    logUniqueMessage(`Loaded modules (${moduleList.length}): ${moduleList.slice(0, 10).join(', ')}${moduleList.length > 10 ? '...' : ''}`)
  }
  catch (error) {
    logUniqueMessage(`⚠️ Failed to test PHP binary: ${String(error)}`)
  }
}

function showHelp(): void {
  console.log(`
PHP Precompilation Build Script

Usage: bun run build-script.ts [options]

Options:
  --version <version>     PHP version to build (default: 8.4.12)
  --config <config>       Build configuration (default: laravel-mysql)
                         Options: laravel-mysql, laravel-postgres, laravel-sqlite,
                                 api-only, enterprise, wordpress, full-stack
  --platform <platform>   Target platform (default: current)
                         Options: linux, darwin, win32
  --arch <arch>          Target architecture (default: current)
                         Options: x64, arm64, x86_64
  --build-dir <dir>      Build directory (default: ./build)
  --output-dir <dir>     Output directory (default: ./binaries)
  --skip-deps           Skip dependency installation
  --help                Show this help message

Examples:
  bun run build-script.ts
  bun run build-script.ts --version 8.3.25 --config enterprise
  bun run build-script.ts --config laravel-postgres --skip-deps
`)
}

if (import.meta.main) {
  main().catch(console.error)
}

export { main as buildPhp }
