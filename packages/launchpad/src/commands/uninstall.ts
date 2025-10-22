/* eslint-disable no-console */
import type { Command } from '../cli/types'

const cmd: Command = {
  name: 'uninstall',
  description: 'Remove installed packages',
  async run({ argv, env: _env }) {
    const { uninstall } = await import('../uninstall')
    const { config } = await import('../config')

    const verbose = argv.includes('--verbose')
    const force = argv.includes('--force')
    const dryRun = argv.includes('--dry-run')
    const global = argv.includes('--global')

    if (verbose)
      config.verbose = true

    // Positional args (packages)
    const packages = argv.filter(a => !a.startsWith('--'))

    if (packages.length === 0) {
      console.error('No packages specified for removal')
      console.log('')
      console.log('Usage examples:')
      console.log('  launchpad uninstall node python')
      console.log('  launchpad remove node@18 --force')
      return 1
    }

    if (dryRun)
      console.log('🔍 DRY RUN MODE - Nothing will actually be removed')

    console.log(`${dryRun ? 'Would remove' : 'Removing'} packages: ${packages.join(', ')}`)

    if (!force && !dryRun) {
      console.log('Use --force to skip confirmation or --dry-run to preview')
    }

    let allSuccess = true
    const results: { package: string, success: boolean, message?: string }[] = []

    for (const pkg of packages) {
      try {
        if (dryRun) {
          console.log(`Would uninstall: ${pkg}`)
          results.push({ package: pkg, success: true, message: 'dry run' })
          // Still check dependencies in dry-run mode
          if (global) {
            const { handleDependencyCleanup } = await import('../uninstall')
            await handleDependencyCleanup(pkg, true) // Pass true for dry-run mode
          }
        }
        else {
          const success = await uninstall(pkg, global)
          results.push({ package: pkg, success })
          if (!success)
            allSuccess = false
        }
      }
      catch (error) {
        console.error(`Failed to uninstall ${pkg}:`, error instanceof Error ? error.message : String(error))
        results.push({ package: pkg, success: false, message: error instanceof Error ? error.message : String(error) })
        allSuccess = false
      }
    }

    console.log('')
    console.log('Uninstall Summary:')
    const successful = results.filter(r => r.success)
    const failed = results.filter(r => !r.success)

    if (successful.length > 0)
      console.log(`✅ ${dryRun ? 'Would remove' : 'Successfully removed'}: ${successful.map(r => r.package).join(', ')}`)

    if (failed.length > 0)
      console.log(`❌ Failed: ${failed.map(r => r.package).join(', ')}`)

    return allSuccess ? 0 : 1
  },
}

export default cmd
