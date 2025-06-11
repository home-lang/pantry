/* eslint-disable no-console */
import fs from 'node:fs'
import { EOL } from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { config } from './config'
import { install } from './install'
import { Path } from './path'
import { addToPath, getUserShell, isInPath, isTemporaryDirectory } from './utils'

/**
 * Create a shim for a package
 */
export async function create_shim(args: string[], basePath: string): Promise<string[]> {
  if (args.length === 0) {
    throw new Error('No packages specified')
  }

  try {
    // Install packages using our own system
    await install(args, basePath)

    if (config.verbose) {
      console.warn(`Installed packages: ${args.join(', ')}`)
    }

    const shimDir = path.join(basePath, 'bin')
    // Ensure the shim directory exists
    fs.mkdirSync(shimDir, { recursive: true })

    const createdShims: string[] = []

    // Create shims for the installed packages
    for (const packageSpec of args) {
      const [packageName] = packageSpec.split('@')

      // Find the package installation directory
      const pkgsDir = path.join(basePath, 'pkgs')
      if (!fs.existsSync(pkgsDir)) {
        continue
      }

      // Look for the package directory (could be domain-based)
      let packageDir: string | null = null

      // Try common domain patterns
      const possibleNames = [
        packageName,
        packageName.replace(/\./g, '_'),
        packageName.replace(/\//g, '_'),
      ]

      for (const name of possibleNames) {
        const searchDir = path.join(pkgsDir, name)
        if (fs.existsSync(searchDir)) {
          // Find the version directory (look for v* directories)
          const versionDirs = fs.readdirSync(searchDir, { withFileTypes: true })
            .filter(entry => entry.isDirectory() && entry.name.startsWith('v'))
            .sort((a, b) => b.name.localeCompare(a.name)) // Sort newest first

          if (versionDirs.length > 0) {
            packageDir = path.join(searchDir, versionDirs[0].name)
            break
          }
        }
      }

      if (!packageDir) {
        if (config.verbose) {
          console.warn(`Could not find installation directory for ${packageName}`)
        }
        continue
      }

      const binDir = path.join(packageDir, 'bin')
      if (fs.existsSync(binDir)) {
        const binEntries = fs.readdirSync(binDir, { withFileTypes: true })

        for (const entry of binEntries) {
          if (!entry.isFile())
            continue

          if (!isExecutable(path.join(binDir, entry.name)))
            continue

          const shimPath = path.join(shimDir, entry.name)

          // Check if shim already exists and we're not forcing reinstall
          if (fs.existsSync(shimPath) && !config.forceReinstall) {
            if (config.verbose) {
              console.warn(`Shim for ${entry.name} already exists at ${shimPath}. Skipping.`)
            }
            continue
          }

          // Create robust shim content with fallback handling
          const actualBinaryPath = path.join(binDir, entry.name)
          const shimContent = createRobustShimContent(packageName, entry.name, actualBinaryPath)

          // Write the shim
          fs.writeFileSync(shimPath, shimContent, { mode: 0o755 })
          createdShims.push(shimPath)
        }
      }
    }

    // Check if shimDir is in PATH and add it if necessary
    if (createdShims.length > 0 && !isInPath(shimDir)) {
      // Check if this is a temporary directory - if so, don't suggest adding to PATH
      const isTemporary = isTemporaryDirectory(shimDir)

      if (config.autoAddToPath && !isTemporary) {
        const added = addToPath(shimDir)
        if (added) {
          console.log(`Added ${shimDir} to your PATH. You may need to restart your terminal or source your shell configuration file.`)

          // Provide a specific command to source the configuration file
          const shell = getUserShell()
          if (shell.includes('zsh')) {
            console.log('Run this command to update your PATH in the current session:')
            console.log('  source ~/.zshrc')
          }
          else if (shell.includes('bash')) {
            console.log('Run this command to update your PATH in the current session:')
            console.log('  source ~/.bashrc  # or ~/.bash_profile')
          }
        }
        else {
          console.log(`Could not add ${shimDir} to your PATH automatically.`)
          console.log(`Please add it manually to your shell configuration file:`)
          console.log(`  echo 'export PATH="${shimDir}:$PATH"' >> ~/.zshrc  # or your shell config file`)
        }
      }
      else if (!isTemporary) {
        console.log(`Note: ${shimDir} is not in your PATH.`)
        console.log(`To use the installed shims, add it to your PATH:`)
        console.log(`  echo 'export PATH="${shimDir}:$PATH"' >> ~/.zshrc  # or your shell config file`)
      }
      // For temporary directories, we don't show any PATH-related messages
    }

    return createdShims
  }
  catch (error) {
    throw new Error(`Failed to create shims: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Create robust shim content with fallback handling
 */
function createRobustShimContent(packageName: string, commandName: string, actualBinaryPath: string): string {
  return `#!/bin/sh
# Shim for ${packageName} - ${commandName}
# Created by Launchpad

# Try the direct binary path first if it exists
if [ -x "${actualBinaryPath}" ]; then
  exec "${actualBinaryPath}" "$@"
fi

# Final fallback to system command if available
if command -v "${commandName}" >/dev/null 2>&1 && [ "$(command -v "${commandName}")" != "$0" ]; then
  echo "⚠️  Launchpad binary failed, using system version..." >&2
  exec "$(command -v "${commandName}")" "$@"
fi

# If all else fails, provide helpful error message
echo "❌ ${commandName} not found. Install ${packageName} with: launchpad install ${packageName}" >&2
exit 127
${EOL}`
}

/**
 * Check if a file is executable
 */
function isExecutable(filePath: string): boolean {
  try {
    const stats = fs.statSync(filePath)
    // Check if the file is executable by the owner
    return (stats.mode & fs.constants.S_IXUSR) !== 0
  }
  catch {
    return false
  }
}

/**
 * Get the shim installation directory
 */
export function shim_dir(): Path {
  // Use the configured shimPath if available
  if (config.shimPath) {
    // Handle ~ in the path
    if (config.shimPath.startsWith('~')) {
      const homePath = process.env.HOME || process.env.USERPROFILE || ''
      return new Path(config.shimPath.replace(/^~/, homePath))
    }
    return new Path(config.shimPath)
  }

  // Fall back to default ~/.local/bin
  return Path.home().join('.local/bin')
}
