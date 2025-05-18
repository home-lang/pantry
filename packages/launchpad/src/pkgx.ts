import type { Buffer } from 'node:buffer'
import type { JsonResponse } from './types'
import { spawn, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
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
  throw new Error('no `pkgx` found in `$PATH`')
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
  const pkgArgs = Array.isArray(args) ? args.map(x => `+${x}`) : []

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

    const proc = spawn(cmd, [...args, '--json=v1'], {
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
        const pkgs = (json.pkgs as { path: string, project: string, version: string }[]).map((x) => {
          return {
            path: new Path(x.path),
            pkg: {
              project: x.project,
              version: new Version(x.version),
            },
          }
        })

        const pkg = pkgs.find(x => `+${x.pkg.project}` === pkgArgs[0])!

        resolve([{
          pkg,
          pkgs,
          env: json.env,
          runtime_env: json.runtime_env,
        }, env])
      }
      catch (err) {
        reject(err)
      }
    })
  })
}
