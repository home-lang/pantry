import type { QueryPkgxOptions } from './pkgx'
import type { JsonResponse } from './types'
import fs from 'node:fs'
import { EOL } from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { config } from './config'
import { Path } from './path'
import { get_pkgx, query_pkgx } from './pkgx'
import { addToPath, getUserShell, isInPath, isTemporaryDirectory } from './utils'

/**
 * Create a shim for a package
 */
export async function create_shim(args: string[], basePath: string): Promise<string[]> {
  if (args.length === 0) {
    throw new Error('No packages specified')
  }

  const pkgx = get_pkgx()
  let retries = 0
  let json: JsonResponse

  // Try to query pkgx with retries
  while (true) {
    try {
      const queryOptions: QueryPkgxOptions = {
        timeout: config.timeout,
      }
      const [jsonResult] = await query_pkgx(pkgx, args, queryOptions)
      json = jsonResult
      break
    }
    catch (error) {
      retries++
      if (retries >= config.maxRetries) {
        throw new Error(`Failed to query pkgx after ${config.maxRetries} attempts: ${error instanceof Error ? error.message : String(error)}`)
      }
      console.warn(`Retrying pkgx query (attempt ${retries}/${config.maxRetries})...`)
      // Wait a bit before retrying
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  const shimDir = path.join(basePath, 'bin')
  // Ensure the shim directory exists
  fs.mkdirSync(shimDir, { recursive: true })

  const createdShims: string[] = []

  for (const installation of json.pkgs) {
    const { pkg } = installation
    const binDir = path.join(installation.path.string, 'bin')

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
        const shimContent = createRobustShimContent(pkg.project, pkg.version.toString(), entry.name, actualBinaryPath)

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
        console.warn(`Added ${shimDir} to your PATH. You may need to restart your terminal or source your shell configuration file.`)

        // Provide a specific command to source the configuration file
        const shell = getUserShell()
        if (shell.includes('zsh')) {
          console.warn('Run this command to update your PATH in the current session:')
          console.warn('  source ~/.zshrc')
        }
        else if (shell.includes('bash')) {
          console.warn('Run this command to update your PATH in the current session:')
          console.warn('  source ~/.bashrc  # or ~/.bash_profile')
        }
      }
      else {
        console.warn(`Could not add ${shimDir} to your PATH automatically.`)
        console.warn(`Please add it manually to your shell configuration file:`)
        console.warn(`  echo 'export PATH="${shimDir}:$PATH"' >> ~/.zshrc  # or your shell config file`)
      }
    }
    else if (!isTemporary) {
      console.warn(`Note: ${shimDir} is not in your PATH.`)
      console.warn(`To use the installed shims, add it to your PATH:`)
      console.warn(`  echo 'export PATH="${shimDir}:$PATH"' >> ~/.zshrc  # or your shell config file`)
    }
    // For temporary directories, we don't show any PATH-related messages
  }

  return createdShims
}

/**
 * Create robust shim content with fallback handling
 */
function createRobustShimContent(project: string, version: string, commandName: string, actualBinaryPath: string): string {
  return `#!/bin/sh
# Shim for ${project}@${version} - ${commandName}
# Created by Launchpad

# Try the direct binary path first if it exists
if [ -x "${actualBinaryPath}" ]; then
  exec "${actualBinaryPath}" "$@"
fi

# Fallback to pkgx with specific version
if command -v pkgx >/dev/null 2>&1; then
  exec pkgx -q ${project}@${version} ${commandName} "$@"
fi

# Final fallback to system command if available
if command -v "${commandName}" >/dev/null 2>&1 && [ "$(command -v "${commandName}")" != "$0" ]; then
  echo "⚠️  pkgx ${project} failed, using system version..." >&2
  exec "$(command -v "${commandName}")" "$@"
fi

# If all else fails, provide helpful error message
echo "❌ ${commandName} not found. Install ${project} with: launchpad install ${project}" >&2
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
