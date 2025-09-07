#!/usr/bin/env bun

import { join } from 'node:path'
import { platform, arch } from 'node:os'
import { PhpPrecompiler, type PhpBuildConfig } from '../packages/launchpad/src/php/precompiler'
import { BuildDependencyManager } from '../packages/launchpad/src/php/build-dependencies'

const config: PhpBuildConfig = {
  version: process.env.PHP_VERSION || '8.4.12',
  config: (process.env.PHP_CONFIG as any) || 'laravel-mysql',
  platform: (process.env.TARGET_PLATFORM as any) || platform(),
  arch: (process.env.TARGET_ARCH as any) || (arch() === 'arm64' ? 'arm64' : 'x86_64'),
  buildDir: process.env.BUILD_DIR || join(process.cwd(), 'build'),
  outputDir: process.env.OUTPUT_DIR || join(process.cwd(), 'binaries')
}

async function main(): Promise<void> {
  console.log(`Building PHP ${config.version} for ${config.platform}-${config.arch} (${config.config})`)
  
  try {
    // Install dependencies
    const depManager = new BuildDependencyManager()
    await depManager.installBuildDependencies()
    
    // Build PHP
    const precompiler = new PhpPrecompiler(config)
    const binaryPath = await precompiler.buildPhp()
    
    console.log(`✅ PHP build completed: ${binaryPath}`)
    
    // Set output for GitHub Actions
    if (process.env.GITHUB_OUTPUT) {
      const fs = await import('node:fs')
      fs.appendFileSync(process.env.GITHUB_OUTPUT, `binary_path=${binaryPath}\n`)
    }
    
  } catch (error) {
    console.error('❌ PHP build failed:', error)
    process.exit(1)
  }
}

if (import.meta.main) {
  main()
}

export { main }
