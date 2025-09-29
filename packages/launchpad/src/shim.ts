/* eslint-disable no-console */
import fs from 'node:fs'
import { EOL } from 'node:os'
import path from 'node:path'
import { config } from './config'
import { install } from './install'
import { Path } from './path'
import { addToPath, expandTildePath, getUserShell, isInPath, isTemporaryDirectory } from './utils'

/**
 * Create a shim for a package
 */
export async function create_shim(args: string[], basePath: string): Promise<string[]> {
  if (args.length === 0) {
    throw new Error('No packages specified')
  }

  const shimDir = path.join(basePath, 'bin')
  // Ensure the shim directory exists upfront
  fs.mkdirSync(shimDir, { recursive: true })

  try {
    // Install packages using our own system
    await install(args, basePath)

    if (config.verbose) {
      console.warn(`Installed packages: ${args.join(', ')}`)
    }

    const createdShims: string[] = []

    // Create shims for the installed packages
    // Our new installation system puts binaries directly in basePath/bin
    const installBinDir = path.join(basePath, 'bin')

    if (fs.existsSync(installBinDir)) {
      // Get all executable files in the installation bin directory
      const binEntries = fs.readdirSync(installBinDir, { withFileTypes: true })

      for (const entry of binEntries) {
        if (!entry.isFile())
          continue

        const actualBinaryPath = path.join(installBinDir, entry.name)
        if (!isExecutable(actualBinaryPath))
          continue

        const shimPath = path.join(shimDir, entry.name)

        // Check if shim already exists and we're not forcing reinstall
        if (fs.existsSync(shimPath) && !config.forceReinstall) {
          if (config.verbose) {
            console.warn(`Shim for ${entry.name} already exists at ${shimPath}. Skipping.`)
          }
          continue
        }

        // Determine which package this binary belongs to (best guess)
        const packageName = args.find((pkg) => {
          const [name] = pkg.split('@')
          return entry.name.includes(name) || name.includes(entry.name)
        }) || args[0] // fallback to first package

        // Create robust shim content with fallback handling
        const shimContent = createRobustShimContent(packageName, entry.name, actualBinaryPath)

        // Write the shim
        fs.writeFileSync(shimPath, shimContent, { mode: 0o755 })
        createdShims.push(shimPath)

        if (config.verbose) {
          console.warn(`Created shim for ${entry.name} at ${shimPath}`)
        }
      }
    }
    else if (config.verbose) {
      console.warn(`No binaries found in ${installBinDir}`)
    }

    // Check if any packages actually got installed successfully
    // If no shims were created and no binaries found, it means installation failed
    if (createdShims.length === 0) {
      // Check if the installation directory has any actual content
      const hasContent = fs.existsSync(installBinDir) && fs.readdirSync(installBinDir).length > 0
      if (!hasContent) {
        throw new Error(`No executables found for packages: ${args.join(', ')}. Installation may have failed.`)
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
    // Properly expand tilde in the path using Node.js homedir()
    const expandedPath = expandTildePath(config.shimPath)
    return new Path(expandedPath)
  }

  // Fall back to default ~/.local/bin
  return Path.home().join('.local/bin')
}
