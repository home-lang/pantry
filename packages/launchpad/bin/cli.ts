#!/usr/bin/env bun
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { CAC } from 'cac'
import { version } from '../package.json'
import { install, install_prefix } from '../src'
import { config } from '../src/config'
import { Path } from '../src/path'

const cli = new CAC('launchpad')

cli.version(version)
cli.help()

// Main installation command
cli
  .command('install [packages...]', 'Install packages')
  .alias('i')
  .option('--verbose', 'Enable verbose output')
  .option('--path <path>', 'Custom installation path')
  .example('launchpad install node python')
  .example('launchpad install --path ~/.local node python')
  .action(async (packages: string[], options: { verbose?: boolean, path?: string }) => {
    if (options.verbose) {
      config.verbose = true
    }

    // Ensure packages is an array
    const packageList = Array.isArray(packages) ? packages : [packages].filter(Boolean)

    if (packageList.length === 0) {
      console.error('No packages specified')
      process.exit(1)
    }

    try {
      const installPath = options.path || install_prefix().string
      console.warn(`Installing packages: ${packageList.join(', ')}`)

      const results = await install(packageList, installPath)

      if (results.length > 0) {
        console.log(`Successfully installed ${results.length} binaries:`)
        results.forEach((file) => {
          console.log(`  ${file}`)
        })
      }
      else {
        console.log('No binaries were installed')
      }
    }
    catch (error) {
      console.error('Installation failed:', error instanceof Error ? error.message : String(error))
      process.exit(1)
    }
  })

// List command
cli
  .command('list', 'List installed packages')
  .alias('ls')
  .example('launchpad list')
  .example('launchpad ls')
  .action(async () => {
    try {
      const binDir = path.join(install_prefix().string, 'bin')

      if (!fs.existsSync(binDir)) {
        console.log('No packages installed')
        return
      }

      const files = fs.readdirSync(binDir)
      if (files.length === 0) {
        console.log('No packages installed')
      }
      else {
        console.log('Installed packages:')
        files.forEach((file) => {
          console.log(`  ${file}`)
        })
      }
    }
    catch (error) {
      console.error('Failed to list packages:', error instanceof Error ? error.message : String(error))
      process.exit(1)
    }
  })

// Bootstrap command - simplified
cli
  .command('bootstrap', 'Set up Launchpad environment')
  .option('--verbose', 'Enable verbose output')
  .option('--path <path>', 'Custom installation path')
  .example('launchpad bootstrap')
  .example('launchpad bootstrap --path ~/.local')
  .action(async (options: { verbose?: boolean, path?: string }) => {
    if (options.verbose) {
      config.verbose = true
    }

    console.log('🚀 Bootstrapping Launchpad...')

    const installPath = options.path ? new Path(options.path) : install_prefix()
    console.log(`📍 Installation prefix: ${installPath.string}`)

    // Ensure bin directory exists
    const binDir = path.join(installPath.string, 'bin')
    fs.mkdirSync(binDir, { recursive: true })

    // Add to PATH if not already there
    const { addToPath, isInPath } = await import('../src/utils')

    if (!isInPath(binDir)) {
      try {
        addToPath(binDir)
        console.log(`✅ Added ${binDir} to PATH`)
      }
      catch (error) {
        console.log(`⚠️  Could not automatically add to PATH: ${error}`)
        console.log(`Please add this to your shell profile:`)
        console.log(`export PATH="${binDir}:$PATH"`)
      }
    }
    else {
      console.log(`✅ ${binDir} is already in PATH`)
    }

    console.log('🎉 Bootstrap complete!')
    console.log('')
    console.log('Next steps:')
    console.log('  • Install packages: ./launchpad install node python')
    console.log('  • List installed: ./launchpad list')
    console.log('  • Get help: ./launchpad --help')
  })

// Parse CLI arguments
try {
  cli.version(version)
  cli.help()
  cli.parse()
}
catch (error) {
  console.error('CLI error:', error instanceof Error ? error.message : String(error))
  process.exit(1)
}
