#!/usr/bin/env bun
import { spawn, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { EOL, homedir, platform } from 'node:os'
import path from 'node:path'
import { parseArgs } from 'node:util'
import { config } from './config'

// Use Bun's native semver handling
const { semver } = Bun

// Simple class to represent semantic versions
export class Version {
  raw: string
  major: number
  minor: number
  patch: number

  constructor(version: string) {
    this.raw = version
    const parts = version.replace(/^v/, '').split('.')
    this.major = Number.parseInt(parts[0] || '0', 10)
    this.minor = Number.parseInt(parts[1] || '0', 10)
    this.patch = Number.parseInt(parts[2] || '0', 10)
  }

  toString(): string {
    return this.raw
  }
}

// Types based on previous implementation
interface Installation {
  path: Path
  pkg: {
    project: string
    version: Version
  }
}

interface JsonResponse {
  runtime_env: Record<string, Record<string, string>>
  pkgs: Installation[]
  env: Record<string, Record<string, string>>
  pkg: Installation
}

// Path class replacement for the Deno Path class
export class Path {
  string: string

  constructor(pathStr: string) {
    this.string = pathStr
  }

  static home(): Path {
    return new Path(homedir())
  }

  join(...parts: string[]): Path {
    return new Path(path.join(this.string, ...parts))
  }

  isDirectory(): boolean {
    try {
      return fs.statSync(this.string).isDirectory()
    }
    catch {
      return false
    }
  }

  exists(): boolean {
    return fs.existsSync(this.string)
  }

  parent(): Path {
    return new Path(path.dirname(this.string))
  }

  basename(): string {
    return path.basename(this.string)
  }

  relative({ to }: { to: Path }): string {
    return path.relative(to.string, this.string)
  }

  async* ls(): AsyncGenerator<readonly [Path, { name: string, isDirectory: boolean, isSymlink: boolean }], void, unknown> {
    try {
      for (const entry of fs.readdirSync(this.string, { withFileTypes: true })) {
        const entryPath = new Path(path.join(this.string, entry.name))
        yield [entryPath, {
          name: entry.name,
          isDirectory: entry.isDirectory(),
          isSymlink: entry.isSymbolicLink(),
        }] as const
      }
    }
    catch (error) {
      if (config.verbose)
        console.error(`Error reading directory ${this.string}:`, error)
    }
  }
}

/**
 * Helper function to get a standard PATH environment variable
 */
export function standardPath(): string {
  let standardPath = '/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin'

  // For package managers installed via homebrew
  let homebrewPrefix = ''
  switch (platform()) {
    case 'darwin':
      homebrewPrefix = '/opt/homebrew' // /usr/local is already in the path
      break
    case 'linux':
      homebrewPrefix = `/home/linuxbrew/.linuxbrew:${homedir()}/.linuxbrew`
      break
  }

  if (homebrewPrefix) {
    homebrewPrefix = process.env.HOMEBREW_PREFIX ?? homebrewPrefix
    standardPath = `${homebrewPrefix}/bin:${standardPath}`
  }

  return standardPath
}

/**
 * Process command-line arguments and execute the appropriate command
 */
export async function run(args: string[] = process.argv.slice(2)): Promise<void> {
  const parsedArgs = parseArgs({
    args,
    options: {
      help: {
        type: 'boolean',
        short: 'h',
      },
      version: {
        type: 'boolean',
        short: 'v',
      },
      pin: {
        type: 'boolean',
        short: 'p',
      },
    },
    allowPositionals: true,
  })

  const positionals = parsedArgs.positionals || []

  if (parsedArgs.values.help || positionals[0] === 'help') {
    const command = spawnSync('pkgx', [
      'glow',
      'https://raw.githubusercontent.com/stacksjs/launchpad/main/README.md',
    ], { stdio: 'inherit' })

    process.exit(command.status ?? 0)
  }
  else if (parsedArgs.values.version) {
    console.log('launchpad 0.0.0+dev')
    return
  }

  const subCommand = positionals[0]
  const subCommandArgs = positionals.slice(1)

  switch (subCommand) {
    case 'install':
    case 'i':
      {
        const installDir = install_prefix().string
        const results = await install(subCommandArgs, installDir)
        console.log(results.join('\n'))
      }
      break

    case 'local-install':
    case 'li':
      if (install_prefix().string !== '/usr/local') {
        await install(subCommandArgs, Path.home().join('.local').string)
      }
      else {
        console.error('deprecated: use `launchpad install` without `sudo` instead')
      }
      break

    case 'stub':
    case 'shim':
      await shim(subCommandArgs, install_prefix().string)
      break

    case 'uninstall':
    case 'rm':
      {
        let allSuccess = true
        for (const arg of subCommandArgs) {
          if (!await uninstall(arg)) {
            allSuccess = false
          }
        }
        process.exit(allSuccess ? 0 : 1)
      }
      break

    case 'list':
    case 'ls':
      for await (const path of ls()) {
        console.log(path)
      }
      break

    case 'update':
    case 'up':
    case 'upgrade':
      await update()
      break

    case 'pin':
      console.error('\x1B[31mU EARLY! soz, not implemented\x1B[0m')
      process.exit(1)
      break

    case 'outdated':
      await outdated()
      break

    default:
      if (args.length === 0) {
        console.error('https://github.com/stacksjs/launchpad')
      }
      else {
        console.error('invalid usage')
      }
      process.exit(2)
  }
}

/**
 * Install packages
 */
export async function install(args: string[], basePath: string): Promise<string[]> {
  if (args.length === 0) {
    console.error('no packages specified')
    process.exit(1)
  }

  const pkgx = get_pkgx()

  const [json] = await query_pkgx(pkgx, args)
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
    // create ${dst}/pkgs/${prefix}
    await mirror_directory(path.join(dst, 'pkgs'), pkgx_dir, pkg_prefix)
    // symlink ${dst}/pkgs/${prefix} to ${dst}
    if (!pkg_prefix.startsWith('pkgx.sh/v')) {
      // ^^ don't overwrite ourselves
      // ^^ * https://github.com/pkgxdev/pkgm/issues/14
      // ^^ * https://github.com/pkgxdev/pkgm/issues/17
      await symlink(path.join(dst, 'pkgs', pkg_prefix), dst)
    }
    // create v1, etc. symlinks
    await create_v_symlinks(path.join(dst, 'pkgs', pkg_prefix))
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
        // TODO should be specific with the project
        sh += dev_stub_text(to_stub, bin_prefix, entry.name)

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
 * Create shims (stubs) for packages
 */
export async function shim(args: string[], basePath: string): Promise<void> {
  const pkgx = get_pkgx()

  fs.mkdirSync(path.join(basePath, 'bin'), { recursive: true })

  const json = (await query_pkgx(pkgx, args))[0]

  // This is simplified from the original implementation as we're missing some functions
  for (const pkg of json.pkgs) {
    for (const bin of ['bin', 'sbin']) {
      const bin_prefix = pkg.path.join(bin)
      if (!bin_prefix.exists())
        continue

      for (const entry of fs.readdirSync(bin_prefix.string, { withFileTypes: true })) {
        if (!entry.isFile() && !entry.isSymbolicLink())
          continue

        const name = entry.name
        const quick_shim = platform() === 'darwin' && pkgx === '/usr/local/bin/pkgx'
        const interpreter = quick_shim
          ? '/usr/local/bin/pkgx'
          : '/usr/bin/env -S pkgx'

        const pkgArg = `${pkg.pkg.project}`
        const shim = `#!${interpreter} --shebang --quiet +${pkgArg} -- ${name}`

        const binPath = path.join(basePath, 'bin', name)
        if (fs.existsSync(binPath)) {
          fs.unlinkSync(binPath)
        }

        // Without the newline zsh on macOS fails to invoke the interpreter with a bad interpreter error
        fs.writeFileSync(binPath, shim + EOL, { mode: 0o755 })
        console.log(binPath)
      }
    }
  }
}

/**
 * Query pkgx for package information
 */
async function query_pkgx(
  pkgx: string,
  args: string[],
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
    const proc = spawn(cmd, [...args, '--json=v1'], {
      stdio: ['ignore', 'pipe', 'inherit'],
      env,
    })

    let stdout = ''
    proc.stdout.on('data', (data) => {
      stdout += data.toString()
    })

    proc.on('close', (code) => {
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
 * Symlink a directory structure
 */
async function symlink(src: string, dst: string): Promise<void> {
  for (const base of [
    'bin',
    'sbin',
    'share',
    'lib',
    'libexec',
    'var',
    'etc',
    'ssl', // FIXME for ca-certs
  ]) {
    const foo = path.join(src, base)
    if (fs.existsSync(foo)) {
      await processEntry(foo, path.join(dst, base))
    }
  }

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
    else {
      // reinstall
      if (fs.existsSync(targetPath)) {
        fs.unlinkSync(targetPath)
      }
      symlink_with_overwrite(sourcePath, targetPath)
    }
  }
}

/**
 * Create version symlinks
 */
async function create_v_symlinks(prefix: string): Promise<void> {
  const shelf = path.dirname(prefix)

  // Collect valid versions
  const versions: { name: string, version: Version }[] = []
  for (const name of fs.readdirSync(shelf, { withFileTypes: true })) {
    if (name.isSymbolicLink())
      continue
    if (!name.isDirectory())
      continue
    if (name.name === 'var')
      continue
    if (!name.name.startsWith('v'))
      continue
    if (/^v\d+$/.test(name.name))
      continue // pcre.org/v2

    const version = parseVersion(name.name)
    if (version) {
      versions.push({ name: name.name, version })
    }
  }

  // Collect versions per major version
  const major_versions: Record<string, string> = {}

  // Sort versions by semver order and find the latest for each major version
  versions.sort((a, b) => {
    return semver.order(a.version.toString(), b.version.toString())
  })

  // For each version, update the major_versions record if it's newer
  for (const { name, version } of versions) {
    const majorKey = `${version.major}`
    if (!major_versions[majorKey]
      || semver.order(version.toString(), major_versions[majorKey]) > 0) {
      major_versions[majorKey] = name
    }
  }

  // Create symlinks for the latest version in each major version
  for (const [key, versionName] of Object.entries(major_versions)) {
    symlink_with_overwrite(versionName, path.join(shelf, `v${key}`))
  }
}

// Helper to parse a version string into a Version object
function parseVersion(versionStr: string): Version | null {
  if (!versionStr || typeof versionStr !== 'string')
    return null
  if (!versionStr.match(/^v?\d+(\.\d+)?(\.\d+)?/))
    return null
  return new Version(versionStr)
}

/**
 * Expand the runtime environment variables
 */
function expand_runtime_env(
  json: JsonResponse,
  basePath: string,
): Record<string, Record<string, string>> {
  const { runtime_env, pkgs } = json

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
 * Create a symlink, overwriting if necessary
 */
function symlink_with_overwrite(src: string, dst: string): void {
  if (fs.existsSync(dst) && fs.lstatSync(dst).isSymbolicLink()) {
    fs.unlinkSync(dst)
  }
  try {
    fs.symlinkSync(src, dst)
  }
  catch (error) {
    if (config.verbose)
      console.error(`Failed to create symlink from ${src} to ${dst}:`, error)
  }
}

/**
 * Find pkgx on the system path
 */
function get_pkgx(): string {
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
      catch (error) {
        // Try next path
      }
    }
  }
  throw new Error('no `pkgx` found in `$PATH`')
}

/**
 * List installed packages
 */
export async function* ls(): AsyncGenerator<string, void, unknown> {
  for (const pathStr of [
    new Path('/usr/local/pkgs'),
    Path.home().join('.local/pkgs'),
  ]) {
    if (!pathStr.isDirectory())
      continue

    const dirs: Path[] = [pathStr]
    let dir: Path | undefined

    while ((dir = dirs.pop()) != undefined) {
      for await (const [path, { name, isDirectory, isSymlink }] of dir.ls()) {
        if (!isDirectory || isSymlink)
          continue
        if (/^v\d+\./.test(name)) {
          yield path.string
        }
        else {
          dirs.push(path)
        }
      }
    }
  }
}

/**
 * Uninstall a package
 */
export async function uninstall(arg: string): Promise<boolean> {
  // Simplified implementation
  let projectName = arg

  const root = install_prefix()
  const dir = root.join('pkgs', projectName)

  if (!dir.isDirectory()) {
    console.error(`not installed: ${dir.string}`)

    if (
      root.string === '/usr/local'
      && Path.home().join('.local/pkgs', projectName).isDirectory()
    ) {
      console.error(
        `\x1B[33m! rerun without \`sudo\` to uninstall ~/.local/pkgs/${projectName}\x1B[0m`,
      )
    }
    else if (new Path('/usr/local/pkgs').join(projectName).isDirectory()) {
      console.error(
        `\x1B[33m! rerun as \`sudo\` to uninstall /usr/local/pkgs/${projectName}\x1B[0m`,
      )
    }

    return false
  }

  console.error('\x1B[31muninstalling\x1B[0m', dir.string)

  try {
    fs.rmSync(dir.string, { recursive: true, force: true })
    return true
  }
  catch (error) {
    console.error('Failed to uninstall:', error)
    return false
  }
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

/**
 * List outdated packages
 */
export async function outdated(): Promise<void> {
  console.log('Checking for outdated packages...')
  console.log('This feature is simplified in the current implementation.')

  // A simplified implementation since we're missing some of the original functions
}

/**
 * Update packages
 */
export async function update(): Promise<void> {
  console.log('Updating packages...')
  console.log('This feature is simplified in the current implementation.')

  // A simplified implementation since we're missing some of the original functions
}

/**
 * Get the installation prefix
 */
export function install_prefix(): Path {
  // if /usr/local is writable, use that
  if (writable('/usr/local')) {
    return new Path('/usr/local')
  }
  else {
    return Path.home().join('.local')
  }
}

/**
 * Generate the text for a development stub
 */
function dev_stub_text(selfpath: string, bin_prefix: string, name: string): string {
  if (selfpath.startsWith('/usr/local') && selfpath !== '/usr/local/bin/dev') {
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
  else {
    return `exec ${bin_prefix}/${name} "$@"`
  }
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
