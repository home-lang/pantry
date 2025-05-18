import type { QueryPkgxOptions } from './pkgx'
import type { JsonResponse } from './types'
import fs from 'node:fs'
import { EOL, platform } from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { config } from './config'
import { Path } from './path'
import { get_pkgx, query_pkgx } from './pkgx'
import { create_v_symlinks, symlink, symlink_with_overwrite } from './symlink'

/**
 * Install packages
 */
export async function install(args: string[], basePath: string): Promise<string[]> {
  if (args.length === 0) {
    console.error('no packages specified')
    process.exit(1)
  }

  const pkgx = get_pkgx()
  let retries = 0
  let json: JsonResponse

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

  const pkg_prefixes = json.pkgs.map(x => `${x.pkg.project}/v${x.pkg.version}`)

  // Get the pkgx_dir this way as it is a) more reliable and b) the only way if
  // we are running as sudo on linux since it doesn't give us a good way to get
  // the home directory of the pre-sudo user
  const pkgx_dir = (() => {
    const { path, pkg } = json.pkgs[0]!
    const remove = `${pkg.project}/v${pkg.version}`
    return path.string.slice(0, -remove.length - 1)
  })()

  const runtime_env = expand_runtime_env(json, basePath)

  const dst = basePath
  for (const pkg_prefix of pkg_prefixes) {
    // Check if package is already installed and skip if not forcing reinstall
    const pkgDstPath = path.join(dst, 'pkgs', pkg_prefix)
    if (fs.existsSync(pkgDstPath) && !config.forceReinstall) {
      if (config.verbose) {
        console.warn(`Package ${pkg_prefix} is already installed at ${pkgDstPath}. Skipping.`)
      }
      continue
    }

    // create ${dst}/pkgs/${prefix}
    await mirror_directory(path.join(dst, 'pkgs'), pkgx_dir, pkg_prefix)
    // symlink ${dst}/pkgs/${prefix} to ${dst}
    if (!pkg_prefix.startsWith('pkgx.sh/v')) {
      // ^^ don't overwrite ourselves
      // ^^ * https://github.com/pkgxdev/pkgm/issues/14
      // ^^ * https://github.com/pkgxdev/pkgm/issues/17
      await symlink(path.join(dst, 'pkgs', pkg_prefix), dst)
    }

    // create v1, etc. symlinks if enabled
    if (config.symlinkVersions) {
      await create_v_symlinks(path.join(dst, 'pkgs', pkg_prefix))
    }
  }

  const rv: string[] = []

  for (const [project, env] of Object.entries(runtime_env)) {
    if (project === 'pkgx.sh')
      continue

    const pkg_prefix = pkg_prefixes.find(x => x.startsWith(project))!

    if (!pkg_prefix)
      continue // FIXME wtf?

    for (const bin of ['bin', 'sbin']) {
      const bin_prefix = path.join(`${dst}/pkgs`, pkg_prefix, bin)

      if (!fs.existsSync(bin_prefix))
        continue

      for (const entry of fs.readdirSync(bin_prefix, { withFileTypes: true })) {
        if (!entry.isFile())
          continue

        const to_stub = path.join(dst, bin, entry.name)

        let sh = `#!/bin/sh${EOL}`
        for (const [key, value] of Object.entries(env)) {
          sh += `export ${key}="${value}"${EOL}`
        }

        sh += EOL

        // Determine if this is a dev-aware installation
        const isDevAware = config.devAware
          && isDevPackagePresent(pkg_prefixes)
          && to_stub.startsWith('/usr/local')
          && entry.name !== 'dev' // Don't make dev itself dev-aware

        // Use the appropriate stub text
        sh += isDevAware
          ? dev_stub_text(to_stub, bin_prefix, entry.name)
          : regular_stub_text(bin_prefix, entry.name)

        if (fs.existsSync(to_stub)) {
          fs.unlinkSync(to_stub) // FIXME inefficient to symlink for no reason
        }

        fs.writeFileSync(to_stub, sh.trim() + EOL, { mode: 0o755 })
        rv.push(to_stub)
      }
    }
  }

  if (!process.env.PATH?.split(':')?.includes(path.join(basePath, 'bin'))) {
    console.warn('\x1B[33m! warning:\x1B[0m', `${path.join(basePath, 'bin')} not in $PATH`)
  }

  return rv
}

/**
 * Check if the dev package is present in the installation list
 */
function isDevPackagePresent(pkg_prefixes: string[]): boolean {
  return pkg_prefixes.some(prefix => prefix.startsWith('dev.pkgx.sh/v'))
}

/**
 * Mirror a directory
 */
async function mirror_directory(dst: string, src: string, prefix: string): Promise<void> {
  await processEntry(path.join(src, prefix), path.join(dst, prefix))

  async function processEntry(sourcePath: string, targetPath: string): Promise<void> {
    const fileInfo = fs.statSync(sourcePath, { throwIfNoEntry: false })
    if (!fileInfo)
      return

    if (fileInfo.isDirectory()) {
      // Create the target directory
      fs.mkdirSync(targetPath, { recursive: true })

      // Recursively process the contents of the directory
      for (const entry of fs.readdirSync(sourcePath)) {
        const entrySourcePath = path.join(sourcePath, entry)
        const entryTargetPath = path.join(targetPath, entry)
        await processEntry(entrySourcePath, entryTargetPath)
      }
    }
    else if (fileInfo.isFile()) {
      // Remove the target file if it exists
      if (fs.existsSync(targetPath)) {
        fs.unlinkSync(targetPath)
      }
      // Create a hard link for files
      try {
        fs.linkSync(sourcePath, targetPath)
      }
      catch {
        // Fall back to copying if hard linking fails
        fs.copyFileSync(sourcePath, targetPath)
      }
    }
    else if (fs.lstatSync(sourcePath).isSymbolicLink()) {
      // Recreate symlink in the target directory
      const linkTarget = fs.readlinkSync(sourcePath)
      symlink_with_overwrite(linkTarget, targetPath)
    }
  }
}

/**
 * Expand the runtime environment variables
 */
function expand_runtime_env(
  json: JsonResponse,
  basePath: string,
): Record<string, Record<string, string>> {
  const { runtime_env } = json

  const expanded: Record<string, Set<string>> = {}
  for (const [_project, env] of Object.entries(runtime_env)) {
    for (const [key, value] of Object.entries(env)) {
      // Simplified version without the moustaches processing
      expanded[key] ??= new Set<string>()
      expanded[key].add(value)
    }
  }

  // fix https://github.com/pkgxdev/pkgm/pull/30#issuecomment-2678957666
  if (platform() === 'linux') {
    expanded.LD_LIBRARY_PATH ??= new Set<string>()
    expanded.LD_LIBRARY_PATH.add(`${basePath}/lib`)
  }

  const rv: Record<string, string> = {}
  for (const [key, set] of Object.entries(expanded)) {
    rv[key] = [...set].join(':')
  }

  // DUMB but easiest way to fix a bug
  const rv2: Record<string, Record<string, string>> = {}
  for (const { pkg: { project } } of json.pkgs) {
    rv2[project] = rv
  }

  return rv2
}

/**
 * Generate the text for a regular executable stub
 */
function regular_stub_text(bin_prefix: string, name: string): string {
  return `exec ${bin_prefix}/${name} "$@"`
}

/**
 * Generate the text for a development stub
 */
function dev_stub_text(selfpath: string, bin_prefix: string, name: string): string {
  return `
dev_check() {
  [ -x /usr/local/bin/dev ] || return 1
  local d="$PWD"
  until [ "$d" = / ]; do
    if [ -f "${datadir()}/pkgx/dev/$d/dev.pkgx.activated" ]; then
      echo $d
      return 0
    fi
    d="$(dirname "$d")"
  done
  return 1
}

if d="$(dev_check)"; then
  eval "$(/usr/local/bin/dev "$d" 2>/dev/null)"
  [ "$(command -v ${name} 2>/dev/null)" != "${selfpath}" ] && exec ${name} "$@"
fi

exec ${bin_prefix}/${name} "$@"
`.trim()
}

/**
 * Get the data directory
 */
function datadir(): string {
  const default_data_home = platform() === 'darwin'
    ? '/Library/Application Support'
    : '/.local/share'
  return `\${XDG_DATA_HOME:-$HOME${default_data_home}}`
}

/**
 * Get the installation prefix
 */
export function install_prefix(): Path {
  // Check if there's a configured installation path
  if (config.installationPath)
    return new Path(config.installationPath)

  // if /usr/local is writable, use that
  if (writable('/usr/local')) {
    return new Path('/usr/local')
  }

  return Path.home().join('.local')
}

/**
 * Check if a directory is writable
 */
function writable(dirPath: string): boolean {
  try {
    // This is pretty gross
    const testPath = path.join(dirPath, '.writable_test')
    fs.mkdirSync(testPath, { recursive: true })
    fs.rmdirSync(testPath)
    return true
  }
  catch {
    return false
  }
}
