import { exec } from 'node:child_process'
import { platform } from 'node:os'
import { promisify } from 'node:util'
import { install, install_prefix } from './install'

const execAsync = promisify(exec)

export interface SmartInstallOptions {
  packages: string[]
  installPath?: string
  fallbackToSystem?: boolean
  verbose?: boolean
}

export interface InstallResult {
  success: boolean
  method: 'pkgx' | 'brew' | 'apt' | 'manual'
  installedPackages: string[]
  failedPackages: string[]
  message: string
}

/**
 * Smart installer that automatically tries the best installation method
 */
export async function smartInstall(options: SmartInstallOptions): Promise<InstallResult> {
  const { packages, installPath, fallbackToSystem = true, verbose = false } = options

  if (verbose) {
    // eslint-disable-next-line no-console
    console.log(`🔍 Smart installing: ${packages.join(', ')}`)
  }

  // First try pkgx if available
  try {
    if (verbose)
      // eslint-disable-next-line no-console
      console.log('📦 Trying pkgx installation...')

    await install(packages, installPath || install_prefix().string)

    return {
      success: true,
      method: 'pkgx',
      installedPackages: packages,
      failedPackages: [],
      message: `Successfully installed ${packages.join(', ')} using pkgx`,
    }
  }
  catch (pkgxError) {
    if (verbose) {
      // eslint-disable-next-line no-console
      console.log(`⚠️  pkgx failed: ${pkgxError instanceof Error ? pkgxError.message : pkgxError}`)
    }

    if (!fallbackToSystem) {
      return {
        success: false,
        method: 'pkgx',
        installedPackages: [],
        failedPackages: packages,
        message: `pkgx installation failed: ${pkgxError instanceof Error ? pkgxError.message : pkgxError}`,
      }
    }
  }

  // Fallback to system package managers
  if (verbose)
    // eslint-disable-next-line no-console
    console.log('🔧 Falling back to system package manager...')

  try {
    const systemResult = await installWithSystemPackageManager(packages, verbose)
    return systemResult
  }
  catch (systemError) {
    return {
      success: false,
      method: 'manual',
      installedPackages: [],
      failedPackages: packages,
      message: `All installation methods failed. Last error: ${systemError instanceof Error ? systemError.message : systemError}`,
    }
  }
}

async function installWithSystemPackageManager(packages: string[], verbose: boolean): Promise<InstallResult> {
  const currentPlatform = platform()

  // Map common package names to platform-specific names
  const packageMappings: Record<string, Record<string, string>> = {
    'nodejs.org': {
      darwin: 'node',
      linux: 'nodejs',
    },
    'python.org': {
      darwin: 'python3',
      linux: 'python3',
    },
    'go.dev': {
      darwin: 'go',
      linux: 'golang',
    },
    'rust-lang.org': {
      darwin: 'rust',
      linux: 'rustc',
    },
    'git-scm.org': {
      darwin: 'git',
      linux: 'git',
    },
    'curl.se': {
      darwin: 'curl',
      linux: 'curl',
    },
  }

  const installedPackages: string[] = []
  const failedPackages: string[] = []

  for (const pkg of packages) {
    try {
      const systemPackageName = packageMappings[pkg]?.[currentPlatform] || pkg

      if (currentPlatform === 'darwin') {
        // Try Homebrew
        if (verbose)
          // eslint-disable-next-line no-console
          console.log(`🍺 Installing ${systemPackageName} with Homebrew...`)

        // Check if brew is available
        try {
          await execAsync('command -v brew')
        }
        catch {
          throw new Error('Homebrew not found. Install it from https://brew.sh/')
        }

        await execAsync(`brew install ${systemPackageName}`)
        installedPackages.push(pkg)

        if (verbose)
          // eslint-disable-next-line no-console
          console.log(`✅ Successfully installed ${systemPackageName}`)
      }
      else if (currentPlatform === 'linux') {
        // Try apt (Ubuntu/Debian)
        if (verbose)
          // eslint-disable-next-line no-console
          console.log(`📦 Installing ${systemPackageName} with apt...`)

        try {
          await execAsync('command -v apt-get')
          await execAsync(`sudo apt-get update && sudo apt-get install -y ${systemPackageName}`)
          installedPackages.push(pkg)

          if (verbose)
            // eslint-disable-next-line no-console
            console.log(`✅ Successfully installed ${systemPackageName}`)
        }
        catch {
          // Try yum (RHEL/CentOS)
          try {
            await execAsync('command -v yum')
            await execAsync(`sudo yum install -y ${systemPackageName}`)
            installedPackages.push(pkg)

            if (verbose)
              // eslint-disable-next-line no-console
              console.log(`✅ Successfully installed ${systemPackageName}`)
          }
          catch {
            throw new Error('No supported package manager found (tried apt, yum)')
          }
        }
      }
      else {
        throw new Error(`Platform ${currentPlatform} not supported for automatic installation`)
      }
    }
    catch (error) {
      failedPackages.push(pkg)
      if (verbose) {
        // eslint-disable-next-line no-console
        console.log(`❌ Failed to install ${pkg}: ${error instanceof Error ? error.message : error}`)
      }
    }
  }

  const method = currentPlatform === 'darwin' ? 'brew' : 'apt'
  const success = installedPackages.length > 0

  return {
    success,
    method,
    installedPackages,
    failedPackages,
    message: success
      ? `Installed ${installedPackages.join(', ')} using ${method}${failedPackages.length > 0 ? `. Failed: ${failedPackages.join(', ')}` : ''}`
      : `Failed to install any packages using ${method}`,
  }
}

/**
 * Check if a package is already installed on the system
 */
export async function isPackageInstalled(packageName: string): Promise<boolean> {
  // Map package names to their common command names
  const commandMappings: Record<string, string[]> = {
    'nodejs.org': ['node', 'nodejs'],
    'python.org': ['python3', 'python'],
    'go.dev': ['go'],
    'rust-lang.org': ['rustc', 'cargo'],
    'git-scm.org': ['git'],
    'curl.se': ['curl'],
    'zsh': ['zsh'],
    'bun.sh': ['bun'],
  }

  const commands = commandMappings[packageName] || [packageName]

  for (const cmd of commands) {
    try {
      await execAsync(`command -v ${cmd}`)
      return true
    }
    catch {
      // Command not found, try next
    }
  }

  return false
}

/**
 * Get installation instructions for manual installation
 */
export function getManualInstallInstructions(packages: string[]): string {
  const currentPlatform = platform()
  let instructions = '📋 Manual installation instructions:\n\n'

  for (const pkg of packages) {
    instructions += `# For ${pkg}:\n`

    switch (pkg) {
      case 'nodejs.org':
        if (currentPlatform === 'darwin') {
          instructions += 'brew install node\n'
          instructions += '# Or download from: https://nodejs.org/\n'
        }
        else {
          instructions += 'sudo apt install nodejs npm  # Ubuntu/Debian\n'
          instructions += 'sudo yum install nodejs npm  # RHEL/CentOS\n'
        }
        break

      case 'python.org':
        if (currentPlatform === 'darwin') {
          instructions += 'brew install python3\n'
        }
        else {
          instructions += 'sudo apt install python3 python3-pip\n'
        }
        break

      case 'go.dev':
        if (currentPlatform === 'darwin') {
          instructions += 'brew install go\n'
        }
        else {
          instructions += 'sudo apt install golang\n'
        }
        instructions += '# Or download from: https://golang.org/dl/\n'
        break

      case 'rust-lang.org':
        instructions += 'curl --proto "=https" --tlsv1.2 -sSf https://sh.rustup.rs | sh\n'
        break

      case 'zsh':
        if (currentPlatform === 'darwin') {
          instructions += 'brew install zsh\n'
          instructions += '# Or zsh is usually pre-installed on macOS\n'
        }
        else {
          instructions += 'sudo apt install zsh\n'
        }
        break

      default:
        if (currentPlatform === 'darwin') {
          instructions += `brew install ${pkg}\n`
        }
        else {
          instructions += `sudo apt install ${pkg}\n`
        }
        instructions += `# Or search for ${pkg} in your package manager\n`
    }

    instructions += '\n'
  }

  return instructions
}
