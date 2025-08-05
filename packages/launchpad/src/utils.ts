import type { SupportedArchitecture, SupportedPlatform } from './types'
import fs from 'node:fs'
import { arch, platform } from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { config } from './config'
import { getLatestVersion, parsePackageSpec, resolvePackageName } from './package-resolution'
import { Path } from './path'

// Cache for binary path lookups
const binaryPathCache = new Map<string, string | null>()

/**
 * Get the installation prefix
 */
export function install_prefix(): Path {
  // Check for test environment override first
  if (process.env.LAUNCHPAD_PREFIX) {
    return new Path(process.env.LAUNCHPAD_PREFIX)
  }

  // Check if there's a configured installation path
  if (config.installPath)
    return new Path(config.installPath)

  // if /usr/local is writable, use that
  if (writable('/usr/local')) {
    return new Path('/usr/local')
  }

  return Path.home().join('.local')
}

/**
 * Check if a directory is writable
 */
export function writable(dirPath: string): boolean {
  try {
    fs.accessSync(dirPath, fs.constants.W_OK)
    return true
  }
  catch {
    return false
  }
}

/**
 * Get platform string for distribution
 */
export function getPlatform(): SupportedPlatform {
  const os = platform()
  switch (os) {
    case 'darwin': return 'darwin'
    case 'linux': return 'linux'
    case 'win32': return 'windows'
    default: throw new Error(`Unsupported platform: ${os}`)
  }
}

/**
 * Get architecture string for distribution
 */
export function getArchitecture(): SupportedArchitecture {
  const nodeArch = arch()
  switch (nodeArch) {
    case 'x64': return 'x86_64'
    case 'arm64': return 'aarch64'
    case 'arm': return 'armv7l'
    default: throw new Error(`Unsupported architecture: ${nodeArch}`)
  }
}

/**
 * Get the user's default shell
 */
export function getUserShell(): string {
  const shell = process.env.SHELL || process.env.COMSPEC || '/bin/bash'
  return shell
}

/**
 * Check if a directory is in the PATH
 */
export function isInPath(dirPath: string): boolean {
  const pathEnv = process.env.PATH || ''
  const paths = pathEnv.split(path.delimiter)
  return paths.includes(dirPath)
}

/**
 * Add a directory to the PATH
 */
export function addToPath(dirPath: string): boolean {
  try {
    // Update process.env.PATH directly for immediate effect
    const currentPath = process.env.PATH || ''
    if (!currentPath.includes(dirPath)) {
      // If PATH is empty or undefined, just set it to the new path
      if (!currentPath) {
        process.env.PATH = dirPath
      }
      else {
        process.env.PATH = `${dirPath}:${currentPath}`
      }
    }

    // Also write to shell configuration file for persistence
    const shell = getUserShell()
    const shellConfig = getShellConfigFile(shell)

    if (!shellConfig) {
      return true // Still return true since we updated the env var
    }

    const pathLine = `export PATH="${dirPath}:$PATH"`
    const configContent = fs.readFileSync(shellConfig, 'utf-8')

    if (!configContent.includes(pathLine)) {
      fs.appendFileSync(shellConfig, `\n${pathLine}\n`)
      return true
    }

    return true // Return true since we updated the env var
  }
  catch {
    return false
  }
}

/**
 * Get the shell configuration file path
 */
function getShellConfigFile(shell: string): string | null {
  const home = process.env.HOME || process.env.USERPROFILE
  if (!home)
    return null

  if (shell.includes('zsh')) {
    return path.join(home, '.zshrc')
  }
  if (shell.includes('bash')) {
    return path.join(home, '.bashrc')
  }
  if (shell.includes('fish')) {
    return path.join(home, '.config/fish/config.fish')
  }

  return null
}

/**
 * Check if a directory is a temporary directory
 */
export function isTemporaryDirectory(dirPath: string): boolean {
  const tempDirs = [
    '/tmp',
    '/var/tmp',
    process.env.TMPDIR,
    process.env.TEMP,
    process.env.TMP,
  ].filter(Boolean)

  return tempDirs.some(tempDir => dirPath.startsWith(tempDir || ''))
}

/**
 * Find a binary in the system PATH
 */
export function findBinaryInPath(binaryName: string): string | null {
  // Check cache first
  if (binaryPathCache.has(binaryName)) {
    return binaryPathCache.get(binaryName) || null
  }

  const pathEnv = process.env.PATH || ''
  const paths = pathEnv.split(path.delimiter)

  for (const dir of paths) {
    if (!dir)
      continue

    const binaryPath = path.join(dir, binaryName)
    try {
      const stat = fs.statSync(binaryPath)
      if (stat.isFile() && (stat.mode & fs.constants.X_OK)) {
        binaryPathCache.set(binaryName, binaryPath)
        return binaryPath
      }
    }
    catch {
      // File doesn't exist or not accessible
      continue
    }
  }

  // Not found
  binaryPathCache.set(binaryName, null)
  return null
}

/**
 * Clear the binary path cache
 */
export function clearBinaryPathCache(): void {
  binaryPathCache.clear()
}

/**
 * Find a binary in a specific environment
 */
export function findBinaryInEnvironment(binaryName: string, envPath?: string): string | null {
  if (!envPath) {
    return findBinaryInPath(binaryName)
  }

  const binaryPath = path.join(envPath, 'bin', binaryName)
  try {
    const stat = fs.statSync(binaryPath)
    if (stat.isFile() && (stat.mode & fs.constants.X_OK)) {
      return binaryPath
    }
  }
  catch {
    // File doesn't exist or not accessible
  }

  return null
}

/**
 * Copy directory structure preserving the layout
 */
export async function copyDirectoryStructure(source: string, target: string): Promise<void> {
  await fs.promises.mkdir(target, { recursive: true })

  const entries = await fs.promises.readdir(source, { withFileTypes: true })

  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name)
    const targetPath = path.join(target, entry.name)

    if (entry.isDirectory()) {
      await copyDirectoryStructure(sourcePath, targetPath)
    }
    else if (entry.isFile()) {
      try {
        await fs.promises.copyFile(sourcePath, targetPath)

        // Preserve executable permissions
        const stat = await fs.promises.stat(sourcePath)
        await fs.promises.chmod(targetPath, stat.mode)
      }
      catch (error) {
        if (error instanceof Error && 'code' in error && error.code === 'EACCES') {
          // Permission denied - try to continue with other files
          // Only show permission errors for critical files, not verbose spam
          continue
        }
        throw error
      }
    }
  }
}

/**
 * Deduplicate packages by domain, keeping only the latest version
 */
export function deduplicatePackagesByVersion(packages: string[]): string[] {
  const packageMap = new Map<string, { spec: string, version: string }>()

  for (const pkg of packages) {
    const { name: packageName } = parsePackageSpec(pkg)
    const domain = resolvePackageName(packageName)
    const { version: requestedVersion } = parsePackageSpec(pkg)

    let version = requestedVersion
    if (!version) {
      const latestVersion = getLatestVersion(domain)
      version = typeof latestVersion === 'string' ? latestVersion : String(latestVersion)
    }

    const existing = packageMap.get(domain)
    if (!existing) {
      packageMap.set(domain, { spec: pkg, version })
    }
    else {
      // Compare versions and keep the latest
      try {
        if (typeof Bun !== 'undefined' && Bun.semver) {
          const comparison = Bun.semver.order(version, existing.version)
          if (comparison > 0) {
            // New version is newer
            packageMap.set(domain, { spec: pkg, version })
          }
          // Otherwise keep existing (newer or equal)
        }
        else {
          // Fallback: just keep the last one if no semver available
          packageMap.set(domain, { spec: pkg, version })
        }
      }
      catch {
        // If version comparison fails, keep the last one
        packageMap.set(domain, { spec: pkg, version })
      }
    }
  }

  return Array.from(packageMap.values()).map(entry => entry.spec)
}
