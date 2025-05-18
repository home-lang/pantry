import type { QueryPkgxOptions } from './pkgx'
import type { JsonResponse } from './types'
import fs from 'node:fs'
import { EOL } from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { config } from './config'
import { Path } from './path'
import { get_pkgx, query_pkgx } from './pkgx'

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

        // Create the shim content
        const shimContent = `#!/usr/bin/env -S pkgx -q! ${pkg.project}@${pkg.version}${EOL}`

        // Write the shim
        fs.writeFileSync(shimPath, shimContent, { mode: 0o755 })
        createdShims.push(shimPath)
      }
    }
  }

  return createdShims
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
