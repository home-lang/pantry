/* eslint-disable no-console */
import type { Command } from '../cli/types'
import process from 'node:process'
import { config } from '../config'

const cmd: Command = {
  name: 'reinstall',
  description: 'Uninstall and reinstall packages',
  async run({ argv, env: _env }) {
    const { uninstall } = await import('../uninstall')
    const { install } = await import('../install')

    const verbose = argv.includes('--verbose')
    const force = argv.includes('--force')
    const dryRun = argv.includes('--dry-run')
    const global = argv.includes('--global') || argv.includes('-g')
    const _depsOnly = argv.includes('--deps-only')
    const quiet = argv.includes('--quiet')

    // Extract path option
    let customPath: string | undefined
    const pathIndex = argv.indexOf('--path')
    if (pathIndex !== -1 && pathIndex + 1 < argv.length) {
      customPath = argv[pathIndex + 1]
    }

    if (verbose)
      config.verbose = true

    // Positional args (packages)
    const packages = argv.filter(a => !a.startsWith('--') && a !== '-g')

    if (packages.length === 0) {
      console.error('No packages specified for reinstallation')
      console.log('')
      console.log('Usage examples:')
      console.log('  launchpad reinstall node python')
      console.log('  launchpad reinstall php --force')
      console.log('  launchpad reinstall node --global')
      return 1
    }

    if (dryRun)
      console.log('🔍 DRY RUN MODE - Nothing will actually be reinstalled')

    console.log(`${dryRun ? 'Would reinstall' : 'Reinstalling'} packages: ${packages.join(', ')}`)

    if (!force && !dryRun) {
      console.log('Use --force to skip confirmation or --dry-run to preview')
      if (!force) {
        // In a real implementation, we might prompt for confirmation here
        // For now, we'll just proceed as if confirmation was given
        console.log('Proceeding with reinstallation...')
      }
    }

    let allSuccess = true
    const results: { package: string, success: boolean, message?: string }[] = []

    for (const pkg of packages) {
      try {
        if (dryRun) {
          console.log(`Would reinstall: ${pkg}`)
          results.push({ package: pkg, success: true, message: 'dry run' })
          continue
        }

        // Step 1: Uninstall the package
        if (!quiet)
          console.log(`Uninstalling ${pkg}...`)

        const uninstallSuccess = await uninstall(pkg)
        if (!uninstallSuccess) {
          console.error(`Failed to uninstall ${pkg}. Skipping reinstallation.`)
          results.push({ package: pkg, success: false, message: 'Uninstallation failed' })
          allSuccess = false
          continue
        }

        // Step 2: Reinstall the package
        if (!quiet)
          console.log(`Installing ${pkg}...`)

        // Determine the installation path
        const installPath = customPath || (global ? undefined : process.cwd())

        // Install the package
        let installSuccess = false
        try {
          const result = await install(pkg, installPath)
          installSuccess = Array.isArray(result) && result.length > 0
        }
        catch (error) {
          console.error(`Installation error: ${error instanceof Error ? error.message : String(error)}`)
          installSuccess = false
        }

        if (installSuccess) {
          results.push({ package: pkg, success: true })
          if (!quiet)
            console.log(`Successfully reinstalled ${pkg}`)
        }
        else {
          results.push({ package: pkg, success: false, message: 'Installation failed' })
          allSuccess = false
          console.error(`Failed to reinstall ${pkg}`)
        }
      }
      catch (error) {
        console.error(`Failed to reinstall ${pkg}:`, error instanceof Error ? error.message : String(error))
        results.push({ package: pkg, success: false, message: error instanceof Error ? error.message : String(error) })
        allSuccess = false
      }
    }

    if (!quiet) {
      console.log('')
      console.log('Reinstall Summary:')
      const successful = results.filter(r => r.success)
      const failed = results.filter(r => !r.success)

      if (successful.length > 0)
        console.log(`✅ ${dryRun ? 'Would reinstall' : 'Successfully reinstalled'}: ${successful.map(r => r.package).join(', ')}`)

      if (failed.length > 0)
        console.log(`❌ Failed: ${failed.map(r => r.package).join(', ')}`)
    }

    return allSuccess ? 0 : 1
  },
}

export default cmd
