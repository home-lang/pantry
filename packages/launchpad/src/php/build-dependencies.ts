import { execSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { homedir, platform } from 'node:os'
import { logUniqueMessage } from '../logging'
import { install } from '../install'

export interface DependencyPaths {
  includeDirs: string[]
  libDirs: string[]
  pkgConfigDirs: string[]
}

export class BuildDependencyManager {
  private launchpadDir: string
  private currentPlatform: string

  constructor() {
    this.currentPlatform = platform()
    this.launchpadDir = join(homedir(), '.local')
  }

  async installBuildDependencies(): Promise<void> {
    if (this.currentPlatform === 'darwin') {
      await this.installMacOSDependencies()
    } else if (this.currentPlatform === 'linux') {
      await this.installLinuxDependencies()
    }
  }

  private async installMacOSDependencies(): Promise<void> {
    logUniqueMessage('Installing macOS build dependencies via Launchpad...')

    const launchpadPackages = [
      'gnu.org/autoconf',
      'gnu.org/automake',
      'gnu.org/libtool',
      'gnu.org/bison',
      're2c.org',
      'freedesktop.org/pkg-config',
      'xmlsoft.org/libxml2',
      'openssl.org',
      'curl.se',
      'libzip.org',
      'zlib.net',
      'github.com/kkos/oniguruma',
      'sqlite.org',
      'postgresql.org',
      'mysql.com'
    ]

    try {
      // Install packages via Launchpad
      const installDir = this.launchpadDir

      for (const pkg of launchpadPackages) {
        logUniqueMessage(`Installing ${pkg}...`)
        await install([pkg], installDir)
      }

      logUniqueMessage('✅ macOS dependencies installed successfully')
    } catch (error) {
      throw new Error(`Failed to install macOS dependencies: ${error}`)
    }
  }

  private async installLinuxDependencies(): Promise<void> {
    logUniqueMessage('Installing Linux build dependencies via Launchpad...')

    const launchpadPackages = [
      'gnu.org/gcc',
      'gnu.org/autoconf',
      'gnu.org/automake',
      'gnu.org/libtool',
      'gnu.org/bison',
      're2c.org',
      'freedesktop.org/pkg-config',
      'xmlsoft.org/libxml2',
      'openssl.org',
      'curl.se',
      'libzip.org',
      'zlib.net',
      'github.com/kkos/oniguruma',
      'sqlite.org',
      'postgresql.org',
      'mysql.com'
    ]

    try {
      // Install packages via Launchpad
      const installDir = this.launchpadDir

      for (const pkg of launchpadPackages) {
        logUniqueMessage(`Installing ${pkg}...`)
        await install([pkg], installDir)
      }

      logUniqueMessage('✅ Linux dependencies installed successfully')
    } catch (error) {
      throw new Error(`Failed to install Linux dependencies: ${error}`)
    }
  }

  getDependencyPaths(): DependencyPaths {
    if (this.currentPlatform === 'darwin') {
      return this.findLaunchpadPaths()
    } else if (this.currentPlatform === 'linux') {
      return this.getLinuxDependencyPaths()
    }

    return { includeDirs: [], libDirs: [], pkgConfigDirs: [] }
  }

  private findLaunchpadPaths(): DependencyPaths {
    const launchpadDir = this.launchpadDir
    const includeDirs: string[] = []
    const libDirs: string[] = []
    const pkgConfigDirs: string[] = []

    if (!existsSync(launchpadDir)) {
      logUniqueMessage(`⚠️ Launchpad directory not found: ${launchpadDir}`)
      return { includeDirs, libDirs, pkgConfigDirs }
    }

    try {
      // Find all package directories in Launchpad
      const entries = execSync(`find "${launchpadDir}" -maxdepth 3 -type d -name "v*"`, { encoding: 'utf8' })
        .split('\n')
        .filter(Boolean)

      for (const entry of entries) {
        // Add include directories
        const includeDir = join(entry, 'include')
        if (existsSync(includeDir)) {
          includeDirs.push(includeDir)
        }

        // Add lib directories
        const libDir = join(entry, 'lib')
        if (existsSync(libDir)) {
          libDirs.push(libDir)
        }

        // Add pkgconfig directories
        const pkgConfigDir = join(entry, 'lib', 'pkgconfig')
        if (existsSync(pkgConfigDir)) {
          pkgConfigDirs.push(pkgConfigDir)
        }
      }

      logUniqueMessage(`Found ${includeDirs.length} include dirs, ${libDirs.length} lib dirs, ${pkgConfigDirs.length} pkgconfig dirs`)

    } catch (error) {
      logUniqueMessage(`⚠️ Failed to scan Launchpad directories: ${error}`)
    }

    return { includeDirs, libDirs, pkgConfigDirs }
  }

  private getLinuxDependencyPaths(): DependencyPaths {
    return {
      includeDirs: ['/usr/include', '/usr/local/include'],
      libDirs: ['/usr/lib', '/usr/local/lib', '/usr/lib/x86_64-linux-gnu'],
      pkgConfigDirs: ['/usr/lib/pkgconfig', '/usr/local/lib/pkgconfig', '/usr/lib/x86_64-linux-gnu/pkgconfig']
    }
  }

  findPostgresPrefix(): string | null {
    const possiblePaths = [
      join(this.launchpadDir, 'postgresql.org'),
      '/usr/lib/postgresql/16',
      '/usr/lib/postgresql/15',
      '/usr/lib/postgresql/14',
      '/usr/lib/postgresql/13',
      '/usr/local/pgsql'
    ]

    for (const path of possiblePaths) {
      if (existsSync(path)) {
        // For Launchpad installations, find the latest version
        if (path.includes('postgresql.org')) {
          try {
            const versions = execSync(`find "${path}" -maxdepth 1 -type d -name "v*" | sort -V | tail -1`, { encoding: 'utf8' }).trim()
            if (versions && existsSync(versions)) {
              return versions
            }
          } catch (error) {
            continue
          }
        }
        return path
      }
    }

    return null
  }

  findLibraryPrefix(library: string): string | null {
    // Check Launchpad first
    const launchpadPath = join(this.launchpadDir, library)
    if (existsSync(launchpadPath)) {
      // Find the latest version directory
      try {
        const versions = execSync(`find "${launchpadPath}" -maxdepth 1 -type d -name "v*" | sort -V | tail -1`, { encoding: 'utf8' }).trim()
        if (versions && existsSync(versions)) {
          return versions
        }
      } catch (error) {
        // Continue to system paths
      }
    }

    // Fallback to system paths
    const systemPaths = [
      `/usr/local/opt/${library}`,
      `/usr/lib/${library}`,
      `/usr/local/lib/${library}`,
      `/opt/${library}`
    ]

    for (const path of systemPaths) {
      if (existsSync(path)) {
        return path
      }
    }

    return null
  }
}
