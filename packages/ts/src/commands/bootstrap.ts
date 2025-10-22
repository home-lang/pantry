/* eslint-disable no-console */
import type { Command } from '../cli/types'
import fs from 'node:fs'
import path from 'node:path'
import { config } from '../config'
import { install_prefix } from '../install'
import { Path } from '../path'
import { addToPath, isInPath } from '../utils'

const command: Command = {
  name: 'bootstrap',
  description: 'Install essential tools for a complete Launchpad setup',
  async run(ctx) {
    // parse argv
    let verbose = false
    let force = false
    let autoPath: boolean | undefined
    let customPath: string | undefined
    let skipShellIntegration = false

    const argv = ctx.argv || []
    for (let i = 0; i < argv.length; i++) {
      const a = argv[i]
      if (a === '--verbose') {
        verbose = true
      }
      else if (a === '--force') {
        force = true
      }
      else if (a === '--no-auto-path') {
        autoPath = false
      }
      else if (a === '--skip-shell-integration') {
        skipShellIntegration = true
      }
      else if (a === '--path') {
        if (i + 1 < argv.length) {
          customPath = argv[++i]
        }
      }
      else if (a.startsWith('--path=')) {
        customPath = a.split('=')[1]
      }
    }

    if (verbose)
      config.verbose = true
    if (force)
      config.forceReinstall = true
    if (autoPath === false)
      config.autoAddToPath = false

    console.log('🚀 Bootstrapping Launchpad - Installing essential tools...')

    const installPath = customPath ? new Path(customPath) : install_prefix()
    console.log(`📍 Installation prefix: ${installPath.string}`)
    console.log('')

    const results: { tool: string, status: 'success' | 'failed' | 'skipped' | 'already-installed', message?: string }[] = []

    const addResult = (tool: string, status: typeof results[0]['status'], message?: string) => {
      results.push({ tool, status, message })
      const emoji = status === 'success' ? '✅' : status === 'failed' ? '❌' : status === 'skipped' ? '⏭️' : '🔄'
      console.log(`${emoji} ${tool}: ${message || status}`)
    }

    // 1. Ensure directories exist
    console.log('📁 Setting up directories...')
    const binDir = path.join(installPath.string, 'bin')
    const sbinDir = path.join(installPath.string, 'sbin')

    try {
      fs.mkdirSync(binDir, { recursive: true })
      fs.mkdirSync(sbinDir, { recursive: true })
      addResult('directories', 'success', 'created bin/ and sbin/')
    }
    catch (error) {
      addResult('directories', 'failed', error instanceof Error ? error.message : String(error))
    }

    console.log('')

    // 2. Setup PATH
    console.log('🛤️  Setting up PATH...')

    if (config.autoAddToPath) {
      let pathUpdated = false

      if (!isInPath(binDir)) {
        const added = addToPath(binDir)
        if (added) {
          console.log(`✅ Added ${binDir} to PATH`)
          pathUpdated = true
        }
        else {
          console.log(`⚠️  Could not automatically add ${binDir} to PATH`)
        }
      }
      else {
        console.log(`✅ ${binDir} already in PATH`)
      }

      if (!isInPath(sbinDir)) {
        const added = addToPath(sbinDir)
        if (added) {
          console.log(`✅ Added ${sbinDir} to PATH`)
          pathUpdated = true
        }
        else {
          console.log(`⚠️  Could not automatically add ${sbinDir} to PATH`)
        }
      }
      else {
        console.log(`✅ ${sbinDir} already in PATH`)
      }

      if (pathUpdated)
        addResult('PATH setup', 'success', 'PATH updated successfully')
      else addResult('PATH setup', 'success', 'PATH already configured')
    }
    else {
      addResult('PATH setup', 'skipped', 'auto PATH setup disabled')
    }

    console.log('')

    // 3. Shell integration setup
    if (!skipShellIntegration) {
      console.log('🐚 Setting up shell integration...')

      try {
        const { default: integrate } = await import('../dev/integrate')
        await integrate('install', { dryrun: false })
        addResult('shell integration', 'success', 'hooks installed')
      }
      catch (error) {
        addResult('shell integration', 'failed', error instanceof Error ? error.message : String(error))
      }
    }
    else {
      addResult('shell integration', 'skipped', 'skipped by user')
    }

    console.log('')

    // 4. Summary
    console.log('📋 Bootstrap Summary:')
    console.log('═══════════════════')

    const successful = results.filter(r => r.status === 'success' || r.status === 'already-installed')
    const failed = results.filter(r => r.status === 'failed')
    const skipped = results.filter(r => r.status === 'skipped')

    successful.forEach(r => console.log(`✅ ${r.tool}: ${r.message || r.status}`))
    failed.forEach(r => console.log(`❌ ${r.tool}: ${r.message || r.status}`))
    skipped.forEach(r => console.log(`⏭️  ${r.tool}: ${r.message || r.status}`))

    console.log('')

    if (failed.length === 0) {
      console.log('🎉 Bootstrap completed successfully!')
      console.log('')
      console.log('🚀 Next steps:')
      console.log('1. Restart your terminal or run: source ~/.zshrc (or your shell config)')
      console.log('2. Install packages: launchpad install node python')
      console.log('3. Create shims: launchpad shim node')
      console.log('4. List installed: launchpad list')
    }
    else {
      console.log(`⚠️  Bootstrap completed with ${failed.length} failed component(s)`)
      console.log('')
      console.log('🔧 You can continue using Launchpad, but some features may not work optimally')
    }

    return failed.length === 0 ? 0 : 1
  },
}

export default command
