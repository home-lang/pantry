/* eslint-disable no-console */
import type { Command } from '../cli/types'
import { config } from '../config'
import { performSetup } from '../setup'

function parseArgs(argv: string[]): { force: boolean, verbose: boolean, release?: string, target?: string } {
  let force = false
  let verbose = false
  let release: string | undefined
  let target: string | undefined

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--force')
      force = true
    else if (a === '--verbose')
      verbose = true
    else if (a === '--release' && i + 1 < argv.length)
      release = argv[++i]
    else if (a.startsWith('--release='))
      release = a.split('=')[1]
    else if (a === '--target' && i + 1 < argv.length)
      target = argv[++i]
    else if (a.startsWith('--target='))
      target = a.split('=')[1]
  }

  return { force, verbose, release, target }
}

const command: Command = {
  name: 'setup',
  description: 'Download and install Launchpad binary to /usr/local/bin',
  async run(ctx) {
    const { force, verbose, release, target } = parseArgs(ctx.argv || [])

    if (verbose)
      config.verbose = true

    // Default version derived from package.json
    const pkg = await import('../../package.json')
    const version = (pkg as any).default?.version || (pkg as any).version || '0.0.0'
    const DEFAULT_SETUP_VERSION = `v${version}`

    const targetVersion = release || DEFAULT_SETUP_VERSION
    const targetPath = target || '/usr/local/bin/launchpad'

    console.log('🚀 Setting up Launchpad binary...')
    console.log('')

    try {
      const verificationSucceeded = await performSetup({
        targetVersion,
        targetPath,
        force,
        verbose,
      })

      console.log('')
      if (verificationSucceeded) {
        console.log('🎉 Setup completed successfully!')
        console.log('')
        console.log('🚀 Next steps:')
        console.log('1. Restart your terminal or reload your shell configuration')
        console.log('2. Run: launchpad --version')
        console.log('3. Get started: launchpad bootstrap')
        return 0
      }
      else {
        console.log('⚠️  Setup completed with verification issues')
        console.log('')
        console.log('⚠️  The binary was installed but failed verification.')
        console.log('It may still work, but there could be compatibility issues.')
        console.log('')
        console.log('🔧 Recommended actions:')
        console.log('1. Try running: launchpad --version')
        console.log('2. If it hangs, try a different version with --release')
        console.log('3. Consider building from source if issues persist')
        console.log('')
        console.log('💡 Alternative: Build from source:')
        console.log('  git clone https://github.com/stacksjs/launchpad.git')
        console.log('  cd launchpad && bun install && bun run build')
        return 0
      }
    }
    catch (error) {
      console.error('Setup failed:', error instanceof Error ? error.message : String(error))
      console.log('')
      console.log('🔧 Troubleshooting:')
      console.log('• Check your internet connection')
      console.log('• Verify the version exists on GitHub releases: https://github.com/stacksjs/launchpad/releases')
      console.log('• Try a different version with --release (e.g., --release v0.3.5)')
      console.log('• Try a different target path with --target')
      console.log('• Use --verbose for more detailed output')
      console.log('')
      console.log('💡 Alternative: Build from source:')
      console.log('  git clone https://github.com/stacksjs/launchpad.git')
      console.log('  cd launchpad && bun install && bun run build')
      return 1
    }
  },
}

export default command
