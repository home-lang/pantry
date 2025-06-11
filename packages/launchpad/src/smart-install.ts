import { install, install_prefix } from './install'

export interface InstallResult {
  success: boolean
  method: 'launchpad' | 'brew' | 'apt' | 'manual'
  packages: string[]
  message: string
  error?: string
}

/**
 * Smart install function that tries multiple installation methods
 */
export async function smartInstall(packages: string[], verbose = false): Promise<InstallResult> {
  if (packages.length === 0) {
    return {
      success: false,
      method: 'manual',
      packages: [],
      message: 'No packages specified for installation',
    }
  }

  // First try our Launchpad installation system
  try {
    if (verbose) {
      console.warn('📦 Trying Launchpad installation...')
    }

    const basePath = install_prefix().string
    await install(packages, basePath)

    return {
      success: true,
      method: 'launchpad',
      packages,
      message: `Successfully installed ${packages.join(', ')} using Launchpad`,
    }
  }
  catch (launchpadError) {
    if (verbose) {
      console.warn(`⚠️  Launchpad failed: ${launchpadError instanceof Error ? launchpadError.message : launchpadError}`)
    }

    // Return failure since we only support Launchpad now
    return {
      success: false,
      method: 'launchpad',
      packages,
      message: `Launchpad installation failed: ${launchpadError instanceof Error ? launchpadError.message : launchpadError}`,
      error: launchpadError instanceof Error ? launchpadError.message : String(launchpadError),
    }
  }
}

/**
 * Check if a package manager is available on the system
 */
export async function checkPackageManager(manager: string): Promise<boolean> {
  try {
    const { execSync } = await import('node:child_process')
    execSync(`command -v ${manager}`, { stdio: 'ignore' })
    return true
  }
  catch {
    return false
  }
}
