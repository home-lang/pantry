import type { Buffer } from 'node:buffer'
import type { JsonResponse } from './types'
import { spawn, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { config } from './config'
import { install_prefix } from './install'
import { Path } from './path'
import { standardPath } from './utils'
import { Version } from './version'

/**
 * Options for query_pkgx
 */
export interface QueryPkgxOptions {
  timeout?: number
}

/**
 * Find pkgx on the system path
 */
export function get_pkgx(): string {
  for (const dir of process.env.PATH?.split(':') || []) {
    const pkgx = path.join(dir, 'pkgx')
    if (fs.existsSync(pkgx)) {
      try {
        const output = spawnSync(pkgx, ['--version'], { encoding: 'utf8' }).stdout
        const match = output.match(/^pkgx (\d+.\d+)/)
        if (!match || Number.parseFloat(match[1]) < 2.4) {
          console.error('\x1B[31mError: pkgx version must be 2.4 or higher\x1B[0m')
          process.exit(1)
        }
        return pkgx
      }
      catch {
        // Try next path
      }
    }
  }
  throw new Error('no `pkgx` found in `$PATH`. Please install pkgx first by running: ./launchpad pkgx')
}

/**
 * Query pkgx for package information
 */
export async function query_pkgx(
  pkgx: string,
  args: string[],
  options?: QueryPkgxOptions,
): Promise<[JsonResponse, Record<string, string>]> {
  // Ensure args is always an array
  const pkgArgs = Array.isArray(args) ? args.map(x => `+${x}`) : [`+${args}`]

  const env: Record<string, string> = {
    PATH: standardPath(),
  }

  const envVarsToKeep = [
    'HOME',
    'PKGX_DIR',
    'PKGX_PANTRY_DIR',
    'PKGX_DIST_URL',
    'XDG_DATA_HOME',
  ]

  for (const key of envVarsToKeep) {
    if (process.env[key])
      env[key] = process.env[key]!
  }

  const needs_sudo_backwards = install_prefix().string === '/usr/local'
  let cmd = needs_sudo_backwards ? '/usr/bin/sudo' : pkgx

  if (needs_sudo_backwards) {
    if (!process.env.SUDO_USER) {
      if (process.getuid?.() === 0) {
        console.warn('\x1B[33mwarning\x1B[0m', 'installing as root; installing via `sudo` is preferred')
      }
      cmd = pkgx
    }
    else {
      pkgArgs.unshift('-u', process.env.SUDO_USER, pkgx)
    }
  }

  return new Promise((resolve, reject) => {
    // Use timeout if specified in options
    const timeoutMs = options?.timeout || 0
    let timeoutId: NodeJS.Timeout | undefined

    const cmdArgs = [...pkgArgs, '--json=v2']


    const proc = spawn(cmd, cmdArgs, {
      stdio: ['ignore', 'pipe', 'inherit'],
      env,
    })

    let stdout = ''
    proc.stdout.on('data', (data: Buffer) => {
      stdout += data.toString()
    })

    if (timeoutMs > 0) {
      timeoutId = setTimeout(() => {
        proc.kill()
        reject(new Error(`Command timed out after ${timeoutMs}ms`))
      }, timeoutMs)
    }

    proc.on('close', (code: number) => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      if (code !== 0) {
        process.exit(code ?? 1)
      }

      try {
        const json = JSON.parse(stdout)

        // Handle JSON v2 format where pkgs is an object, not an array
        const pkgsData = json.pkgs
        const pkgs = Object.values(pkgsData).map((x: any) => {
          return {
            path: new Path(x.path),
            pkg: {
              project: x.project,
              version: new Version(x.version),
            },
          }
        })

        const pkg = pkgs.find(x => `+${x.pkg.project}` === pkgArgs[0])!

        // Convert pkgs object to runtime_env format for compatibility
        const runtime_env: Record<string, Record<string, string>> = {}
        for (const [project, pkgData] of Object.entries(pkgsData) as [string, any][]) {
          if (pkgData.env) {
            runtime_env[project] = pkgData.env
          }
        }

        resolve([{
          pkg,
          pkgs,
          env: json.env,
          runtime_env,
        }, env])
      }
      catch (err) {
        reject(err)
      }
    })
  })
}

/**
 * Check if pkgx automatic updates are enabled
 * @returns True if auto-updates are enabled
 */
export async function check_pkgx_autoupdate(): Promise<boolean> {
  // Check if pkgx is configured for auto-updates
  try {
    const pkgxConfigDir = path.join(os.homedir(), '.config', 'pkgx')
    const configPath = path.join(pkgxConfigDir, 'config.json')

    if (fs.existsSync(configPath)) {
      const configData = JSON.parse(fs.readFileSync(configPath, 'utf-8'))

      // Get the auto-update setting (default is true)
      return configData.auto_update !== false
    }

    // If config doesn't exist, default is true
    return true
  }
  catch (error) {
    // If there's an error, assume default (true)
    if (config.verbose)
      console.warn(`Failed to check pkgx auto-update configuration: ${error instanceof Error ? error.message : String(error)}`)

    return true
  }
}

/**
 * Configure pkgx auto-update setting
 * @param enable Whether to enable auto-updates
 * @returns True if the configuration was successful
 */
export async function configure_pkgx_autoupdate(enable: boolean): Promise<boolean> {
  try {
    const pkgxConfigDir = path.join(os.homedir(), '.config', 'pkgx')
    const configPath = path.join(pkgxConfigDir, 'config.json')

    // Create config directory if it doesn't exist
    if (!fs.existsSync(pkgxConfigDir)) {
      fs.mkdirSync(pkgxConfigDir, { recursive: true })
    }

    // Load existing config if it exists
    let configData: Record<string, any> = {}
    if (fs.existsSync(configPath)) {
      configData = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
    }

    // Update auto-update setting
    configData.auto_update = enable

    // Write config
    fs.writeFileSync(configPath, JSON.stringify(configData, null, 2))

    if (config.verbose)
      console.warn(`pkgx auto-update set to: ${enable}`)

    return true
  }
  catch (error) {
    if (config.verbose)
      console.error(`Failed to configure pkgx auto-update: ${error instanceof Error ? error.message : String(error)}`)

    return false
  }
}
