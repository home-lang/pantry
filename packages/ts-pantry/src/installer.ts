/**
 * Cross-platform system package installer for pantry.
 *
 * Uses Node.js APIs to bootstrap standalone runtimes on macOS, Linux and
 * Windows without requiring the CLI. It can also install registry artifacts;
 * use the native Pantry resolver when their runtime dependency graph is needed.
 *
 * Usage:
 *   import { installPackage, detectPlatform } from 'ts-pantry/installer'
 *   await installPackage('ziglang.org', '0.16.0-dev.2984+cb7d2b056', { installDir: './pantry' })
 */

import * as fs from 'node:fs'
import * as path from 'node:path'
import * as os from 'node:os'
import * as https from 'node:https'
import * as http from 'node:http'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { Transform } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { compareVersions } from './generate-zig'

/**
 * Base URL of the binary registry.
 *
 * Read per call, not captured at module load. `PANTRY_REGISTRY_URL` is how a
 * consumer points this SDK at a staging or local registry, and a module-level
 * constant silently ignored anyone who set it after the first import —
 * including a test file that is not the first one the runner happens to load.
 * The read is a property lookup; the lazy version costs nothing.
 */
function registryBase(): string {
  return (process.env.PANTRY_REGISTRY_URL || 'https://registry.pantry.dev').replace(/\/$/, '')
}

// ── Types ──

export interface Platform {
  os: 'darwin' | 'linux' | 'windows'
  arch: 'x86_64' | 'aarch64'
}

export interface InstallOptions {
  /** Directory to install into (default: ./pantry) */
  installDir?: string
  /** Override the detected host platform, e.g. when fetching a Linux deploy binary from macOS. */
  platform?: Platform
  /** Create .bin/ symlinks/copies (default: true) */
  createBinLinks?: boolean
  /** Quiet mode — suppress progress output (default: false) */
  quiet?: boolean
  /** Receive bounded transport-retry diagnostics. */
  onRetry?: (message: string) => void
  /**
   * Mirror this package's binaries to a stable user-level directory so they
   * appear on PATH after a one-time `pantry shell-init`. When `true` the
   * default global bin dir (`globalBinDir()`) is used; pass a path to override.
   *
   * This is what makes `pantry install <foo>@<v>` actually put `foo` on the
   * caller's PATH the same way Homebrew does.
   */
  globalBin?: boolean | string
}

export interface InstallResult {
  name: string
  version: string
  installPath: string
  binaries: string[]
  /** Symlinks created in the global bin dir, if `globalBin` was requested. */
  globalLinks?: string[]
}

/** Normalize canonical versions to the registry's filesystem-safe spelling. */
export function normalizeInstallerVersion(domain: string, version: string): string {
  if (domain !== 'ziglang.org') return version
  return version.replace(/(-dev\.\d+)\+([0-9A-Za-z-]+)$/, '$1_$2')
}

/**
 * Stable user-level directory we expose on PATH via `pantry shell-init`.
 * Mirrors the Zig CLI's `$HOME/.local/share/pantry/global/bin` convention so
 * both installers can share a single location.
 */
export function globalBinDir(): string {
  // Honour XDG_DATA_HOME first to be friendly to Linux/Nix-style users.
  const xdg = process.env.XDG_DATA_HOME
  const base = xdg && xdg.length > 0 ? xdg : path.join(os.homedir(), '.local', 'share')
  return path.join(base, 'pantry', 'global', 'bin')
}

/**
 * Registry of known system packages and how to install them.
 * Each entry maps a package domain to a function that returns the download URL
 * and list of binaries for a given version and platform.
 */
interface PackageResolver {
  /** Build the download URL for this package+version+platform */
  getDownloadUrl(version: string, platform: Platform): string
  /** Archive format */
  getArchiveFormat(platform: Platform): 'tar.xz' | 'tar.gz' | 'zip'
  /** List of binaries this package provides */
  getBinaries(platform: Platform): string[]
  /** The directory name inside the archive (if any) */
  getArchivePrefix?(version: string, platform: Platform): string
}

// ── Platform Detection ──

export function detectPlatform(): Platform {
  const osName = os.platform()
  const arch = os.arch()

  return {
    os: osName === 'darwin' ? 'darwin' : osName === 'win32' ? 'windows' : 'linux',
    arch: arch === 'arm64' ? 'aarch64' : 'x86_64',
  }
}

// ── Package Resolvers ──

export function ziglangOfficialDownload(version: string, platform: Platform): { url: string, format: 'tar.xz' | 'zip', prefix: string } {
  const upstreamVersion = version.replace(/(-dev\.\d+)_([0-9A-Za-z-]+)$/, '$1+$2')
  const osName = platform.os === 'darwin' ? 'macos' : platform.os
  const arch = platform.arch === 'aarch64' ? 'aarch64' : 'x86_64'
  const format = platform.os === 'windows' ? 'zip' : 'tar.xz'
  const prefix = `zig-${arch}-${osName}-${upstreamVersion}`
  const archive = `${prefix}.${format}`
  return {
    url: upstreamVersion.includes('-dev.')
      ? `https://ziglang.org/builds/${archive}`
      : `https://ziglang.org/download/${upstreamVersion}/${archive}`,
    format,
    prefix,
  }
}

export function sqliteOfficialDownloadUrl(version: string, platform: Platform): string {
  const [major, minor, patch] = version.split('.').map(Number)
  if (major !== 3 || !Number.isInteger(minor) || !Number.isInteger(patch))
    throw new Error(`Unsupported SQLite version: ${version}`)
  const year = minor >= 52 ? 2026 : minor >= 48 ? 2025 : 2024
  const platformMap: Record<string, string> = {
    'darwin-aarch64': 'osx-arm64',
    'darwin-x86_64': 'osx-x64',
    'linux-x86_64': 'linux-x64',
    'windows-aarch64': 'win-arm64',
    'windows-x86_64': 'win-x64',
  }
  const target = platformMap[`${platform.os}-${platform.arch}`]
  if (!target) throw new Error(`Unsupported platform for SQLite tools: ${platform.os}-${platform.arch}`)
  const archiveVersion = `${major}${minor}${String(patch).padStart(2, '0')}00`
  return `https://sqlite.org/${year}/sqlite-tools-${target}-${archiveVersion}.zip`
}

/**
 * Whether a domain is Bun, under either of the two names it goes by.
 *
 * The alias table canonicalizes `bun.sh` to `bun.com`, because Bun's site moved
 * and old lockfiles still say `bun.sh`. The resolver here was only ever keyed on
 * `bun.sh`, so once a spec had been through that canonicalization nothing
 * matched it: `isSupported('bun.com')` said no, the action logged "not supported
 * by TS installer SDK, skipping", and the very next step failed on
 * `bun: command not found`.
 */
function isBunDomain(domain: string): boolean {
  return domain === 'bun.sh' || domain === 'bun.com'
}

const resolvers: Record<string, PackageResolver> = {
  'github.com/mail-os/mail': {
    getDownloadUrl(version: string, platform: Platform): string {
      if (platform.os !== 'linux' || platform.arch !== 'x86_64') {
        throw new Error('github.com/mail-os/mail currently publishes linux-x86_64 release binaries')
      }
      const osMap: Record<string, string> = { darwin: 'macos', linux: 'linux', windows: 'windows' }
      const artifact = `mail-${platform.arch}-${osMap[platform.os]}`
      return `https://github.com/mail-os/mail/releases/download/v${version}/${artifact}.tar.gz`
    },
    getArchiveFormat() {
      return 'tar.gz' as const
    },
    getBinaries(platform: Platform) {
      const osMap: Record<string, string> = { darwin: 'macos', linux: 'linux', windows: 'windows' }
      return [`mail-${platform.arch}-${osMap[platform.os]}`, 'mail']
    },
  },

  'ziglang.org': {
    getDownloadUrl(version: string, platform: Platform): string {
      return ziglangOfficialDownload(version, platform).url
    },
    getArchiveFormat(platform: Platform) {
      return ziglangOfficialDownload('0.0.0', platform).format
    },
    getBinaries(platform: Platform) {
      return platform.os === 'windows' ? ['zig.exe'] : ['zig']
    },
    getArchivePrefix(version: string, platform: Platform) {
      return ziglangOfficialDownload(version, platform).prefix
    },
  },

  'bun.sh': {
    getDownloadUrl(version: string, platform: Platform): string {
      const platformMap: Record<string, string> = {
        'darwin-aarch64': 'darwin-aarch64',
        'darwin-x86_64': 'darwin-x64',
        'linux-aarch64': 'linux-aarch64',
        'linux-x86_64': 'linux-x64',
        'windows-x86_64': 'windows-x64',
      }
      const key = `${platform.os}-${platform.arch}`
      const platStr = platformMap[key] || 'linux-x64'
      return `https://github.com/oven-sh/bun/releases/download/bun-v${version}/bun-${platStr}.zip`
    },
    getArchiveFormat() {
      return 'zip' as const
    },
    getBinaries(platform: Platform) {
      return platform.os === 'windows' ? ['bun.exe'] : ['bun', 'bunx']
    },
    getArchivePrefix(_version: string, platform: Platform) {
      const platformMap: Record<string, string> = {
        'darwin-aarch64': 'bun-darwin-aarch64',
        'darwin-x86_64': 'bun-darwin-x64',
        'linux-aarch64': 'bun-linux-aarch64',
        'linux-x86_64': 'bun-linux-x64',
        'windows-x86_64': 'bun-windows-x64',
      }
      const key = `${platform.os}-${platform.arch}`
      const prefix = platformMap[key]
      if (!prefix) throw new Error(`Unsupported platform for bun: ${key}`)
      return prefix
    },
  },

  'sqlite.org': {
    getDownloadUrl(version: string, platform: Platform): string {
      return sqliteOfficialDownloadUrl(version, platform)
    },
    getArchiveFormat() {
      return 'zip' as const
    },
    getBinaries(platform: Platform) {
      const suffix = platform.os === 'windows' ? '.exe' : ''
      return [`sqlite3${suffix}`, `sqldiff${suffix}`, `sqlite3_analyzer${suffix}`, `sqlite3_rsync${suffix}`]
    },
  },

  'nodejs.org': {
    getDownloadUrl(version: string, platform: Platform): string {
      const osMap: Record<string, string> = { darwin: 'darwin', linux: 'linux', windows: 'win' }
      const archMap: Record<string, string> = { x86_64: 'x64', aarch64: 'arm64' }
      const ext = platform.os === 'windows' ? 'zip' : 'tar.xz'
      return `https://nodejs.org/dist/v${version}/node-v${version}-${osMap[platform.os]}-${archMap[platform.arch]}.${ext}`
    },
    getArchiveFormat(platform: Platform) {
      return platform.os === 'windows' ? 'zip' : 'tar.xz'
    },
    getBinaries(platform: Platform) {
      return platform.os === 'windows' ? ['node.exe', 'npm.cmd', 'npx.cmd'] : ['node', 'npm', 'npx']
    },
    getArchivePrefix(version: string, platform: Platform) {
      const osMap: Record<string, string> = { darwin: 'darwin', linux: 'linux', windows: 'win' }
      const archMap: Record<string, string> = { x86_64: 'x64', aarch64: 'arm64' }
      return `node-v${version}-${osMap[platform.os]}-${archMap[platform.arch]}`
    },
  },
}

// ── Core Install Function ──

/**
 * (Re)create the `.bin/<name>` links for an installed package, pointing each at
 * the real binary under `pkgDir` (root or `bin/` subdir). Binaries absent from
 * the archive (e.g. `bunx`, `npx`) are aliased to the primary binary.
 *
 * This is intentionally idempotent and always run — including for already-installed
 * packages — so a real binary reliably *owns* its `.bin` entry. Without this, a
 * second installer writing the same dir (e.g. a registry client that drops a
 * placeholder stub for a platform it lacks) could leave `.bin/<name>` pointing at
 * a broken stub even though the genuine binary is present on disk.
 */
function linkBinary(source: string, destination: string, platform: Platform): void {
  try { fs.unlinkSync(destination) } catch { /* Entry does not exist yet. */ }
  if (platform.os === 'windows') {
    fs.copyFileSync(source, destination)
    return
  }

  // Resolve directory aliases before computing a relocatable entrypoint, but
  // preserve the installed program's name for multicall wrappers.
  const target = path.relative(fs.realpathSync(path.dirname(destination)), path.join(fs.realpathSync(path.dirname(source)), path.basename(source)))
  const descriptor = fs.openSync(source, 'r')
  const magic = Buffer.alloc(2)
  try { fs.readSync(descriptor, magic, 0, 2, 0) }
  finally { fs.closeSync(descriptor) }
  if (magic.toString() === '#!') {
    // A symlink leaves $0 pointing at .bin. Prefix-relative scripts such as
    // Git then look for libexec beside the environment rather than their
    // package. Execute the installed script so its own prefix stays intact.
    const quoted = `'${target.replaceAll("'", "'\\''")}'`
    fs.writeFileSync(destination, `#!/bin/sh\ns=$0\nwhile [ -h "$s" ]; do\n  link=$(readlink "$s") || exit\n  case $link in /*) s=$link ;; *) s=$(dirname -- "$s")/$link ;; esac\ndone\nbasedir=$(CDPATH= cd -- "$(dirname -- "$s")" && pwd) || exit\nexec "$basedir"/${quoted} "$@"\n`, { mode: 0o755 })
  }
  else fs.symlinkSync(target, destination)
}

function linkBinaries(pkgDir: string, binaries: string[], binDir: string, platform: Platform): void {
  fs.mkdirSync(binDir, { recursive: true })
  let primaryBin: string | null = null

  for (const bin of binaries) {
    // Check both root and bin/ subdirectory
    let srcBin = path.join(pkgDir, bin)
    if (!fs.existsSync(srcBin)) {
      srcBin = path.join(pkgDir, 'bin', bin)
    }

    if (!fs.existsSync(srcBin)) {
      // Binary doesn't exist in archive — create as alias to primary binary
      // (e.g. bunx -> bun, npx -> node)
      if (primaryBin) {
        const dstBin = path.join(binDir, bin)
        linkBinary(primaryBin, dstBin, platform)
      }
      continue
    }

    if (!primaryBin) primaryBin = srcBin

    const dstBin = path.join(binDir, bin)
    linkBinary(srcBin, dstBin, platform)
  }
}

/**
 * Resolve a requested platform/version without installing its artifact.
 */
export async function resolvePackageVersion(
  domain: string,
  version: string,
  platform: Platform = detectPlatform(),
  options: Pick<InstallOptions, 'onRetry'> = {},
): Promise<string> {
  // Resolve semver constraints (^, ~, >=, etc.) to concrete versions
  if (/^[\^~>=<]/.test(version)) {
    version = await resolveVersionConstraint(domain, version, platform)
  }
  else if (version === 'latest' || version === '*' || !version) {
    version = await resolveLatestVersion(domain, platform)
  }
  // Resolve short dev versions (e.g. "0.16.0-dev") to full version via upstream API
  else if (domain === 'ziglang.org' && version.endsWith('-dev')) {
    const resolved = await resolveZigShortDevVersion(version, platform, { onRetry: options.onRetry })
    if (!resolved)
      throw new Error(`Could not resolve ${version} to a published ziglang.org development build`)
    version = resolved
  }

  version = normalizeInstallerVersion(domain, version)

  // Catch every path where version resolution silently produced "". An
  // empty version string used to slip through and become a `bun-v/...`-
  // style 404 a few seconds later — a 5-step debug for what's really a
  // resolver failure.
  if (!version) {
    throw new Error(`Could not resolve a concrete version for ${domain} (got empty string from resolver)`)
  }
  return version
}

/** Install a package artifact; dependency graphs belong to the native CLI. */
export async function installPackage(
  domain: string,
  version: string,
  options: InstallOptions = {},
): Promise<InstallResult> {
  const platform = options.platform || detectPlatform()
  const resolver: PackageResolver | undefined = resolvers[domain]
  version = await resolvePackageVersion(domain, version, platform, options)

  const installDir = options.installDir || path.join(process.cwd(), 'pantry')
  const binDir = path.join(installDir, '.bin')
  // The layout `pantry install` uses, `<domain>/v<version>`: each installer
  // then finds the other's copy already in place, so a package is fetched and
  // stored once rather than once per installer.
  const pkgDir = path.join(installDir, domain, `v${version}`)

  // Check if already installed. A built-in resolver names its binaries up
  // front; a registry package's are whatever landed in `bin/`, so the presence
  // of that directory is what "installed" means for it.
  const declared = resolver?.getBinaries(platform)
  if (resolver && (!declared || declared.length === 0)) {
    throw new Error(`No binaries defined for ${domain} on ${platform.os}-${platform.arch}`)
  }

  const cached = declared
    ? fs.existsSync(path.join(pkgDir, declared[0])) || fs.existsSync(path.join(pkgDir, 'bin', declared[0]))
    : installedRegistryBinaries(pkgDir).length > 0

  if (cached) {
    const binaries = declared ?? installedRegistryBinaries(pkgDir)
    if (!options.quiet) console.log(`  ✓ ${domain}@${version} (cached)`)
    // Re-assert the .bin links even when already installed, so the genuine
    // binary keeps ownership of `.bin/<name>` if another installer clobbered it.
    if (options.createBinLinks !== false) {
      linkBinaries(pkgDir, binaries, binDir, platform)
    }
    const globalLinks = maybeLinkToGlobalBin(pkgDir, binaries, platform, options)
    return { name: domain, version, installPath: pkgDir, binaries, globalLinks }
  }

  // One metadata read serves both registry cases: the Zig dev-build mirror, and
  // every package that has no built-in resolver at all.
  const needsMetadata = !resolver || (domain === 'ziglang.org' && version.includes('-dev.'))
  const metadata = needsMetadata ? await registryMetadata(domain, { onRetry: options.onRetry }) : null

  // Prefer our own mirror when upstream is known to purge the artifact.
  const mirror = resolver
    ? (domain === 'ziglang.org' && version.includes('-dev.')
        ? zigRegistryMirror(metadata, version, platform)
        : null)
    : registryDownloadSource(metadata, version, platform)

  if (!resolver && !mirror) {
    throw new Error(
      `Cannot install ${domain}@${version}: no built-in resolver, and the registry `
      + `publishes no ${registryPlatformKey(platform)} artifact for that version.`,
    )
  }

  const url = mirror?.url ?? resolver!.getDownloadUrl(version, platform)
  const format = mirror?.format ?? resolver!.getArchiveFormat(platform)
  // The registry lists the digest alongside the artifact, so use it rather than
  // paying a second request for the `.sha256` sidecar that says the same thing.
  const publishedSha256 = (mirror as { sha256?: string } | null)?.sha256

  if (!options.quiet) console.log(`  → ${domain}@${version} from ${new URL(url).hostname}`)

  // Download
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pantry-'))
  const archivePath = path.join(tmpDir, `archive.${format}`)

  try {
    let expectedSha256: string | undefined = publishedSha256
    if (!expectedSha256 && url.startsWith(`${registryBase()}/binaries/`)) {
      const checksumPath = path.join(tmpDir, 'archive.sha256')
      await downloadFileReliably(`${url}.sha256`, checksumPath, {
        quiet: options.quiet,
        onRetry: options.onRetry,
      })
      const checksum = fs.readFileSync(checksumPath, 'utf8').match(/\b([a-f0-9]{64})\b/i)?.[1]
      if (!checksum)
        throw new Error(`Invalid SHA-256 checksum response for ${url}`)
      expectedSha256 = checksum.toLowerCase()
    }

    try {
      await downloadFileReliably(url, archivePath, {
        quiet: options.quiet,
        onRetry: options.onRetry,
        expectedSha256,
      })
    }
    catch (error) {
      // A purged Zig dev build fails here as a bare 404 that names neither the
      // cause nor the fix. Say both, while we still have the metadata that
      // knows which builds are mirrored.
      const hint = mirror ? null : zigPurgedDevBuildHint(metadata, domain, version, platform)
      if (!hint) throw error
      throw new Error(`${error instanceof Error ? error.message : String(error)}\n\n${hint}`)
    }

    // Extract
    const extractDir = path.join(tmpDir, 'extracted')
    fs.mkdirSync(extractDir, { recursive: true })
    await extractArchive(archivePath, extractDir, format)

    // Find the source directory (archives usually have a top-level folder)
    let sourceDir = extractDir
    const prefix = mirror ? mirror.prefix : resolver!.getArchivePrefix?.(version, platform)
    if (prefix) {
      const prefixPath = path.join(extractDir, prefix)
      if (fs.existsSync(prefixPath)) {
        sourceDir = prefixPath
      }
      else {
        // Try first directory in extract
        const entries = fs.readdirSync(extractDir)
        const firstDir = entries.find(e => fs.statSync(path.join(extractDir, e)).isDirectory())
        if (firstDir) sourceDir = path.join(extractDir, firstDir)
      }
    }

    // Copy to install directory
    fs.mkdirSync(pkgDir, { recursive: true })
    copyDirRecursive(sourceDir, pkgDir)

    // A registry package's binaries are known only now, from what it shipped.
    const binaries = declared ?? installedRegistryBinaries(pkgDir)
    if (binaries.length === 0) {
      throw new Error(`${domain}@${version} unpacked with no executables in bin/`)
    }

    // Make binaries executable (non-Windows)
    if (platform.os !== 'windows') {
      for (const bin of binaries) {
        const binPath = path.join(pkgDir, bin)
        if (fs.existsSync(binPath)) {
          fs.chmodSync(binPath, 0o755)
        }
        // Also check bin/ subdirectory
        const binSubPath = path.join(pkgDir, 'bin', bin)
        if (fs.existsSync(binSubPath)) {
          fs.chmodSync(binSubPath, 0o755)
        }
      }

      // Restoring the bit only on the DECLARED binaries leaves a package that
      // shells out to its own helpers broken in a way that looks like the
      // wrapper working: git's `bin/git` ran fine and then died on
      // `exec .../libexec/git: Permission denied`, which reads as "not a git
      // repository" to everything downstream. Anything living in a directory
      // that exists to hold executables needs the bit too.
      for (const dir of ['bin', 'sbin', 'libexec']) {
        makeTreeExecutable(path.join(pkgDir, dir))
      }
    }

    // Create .bin/ links
    if (options.createBinLinks !== false) {
      linkBinaries(pkgDir, binaries, binDir, platform)
    }

    if (!options.quiet) console.log(`  ✓ ${domain}@${version}`)
    const globalLinks = maybeLinkToGlobalBin(pkgDir, binaries, platform, options)
    return { name: domain, version, installPath: pkgDir, binaries, globalLinks }
  }
  finally {
    // Clean up temp directory
    try { fs.rmSync(tmpDir, { recursive: true, force: true }) } catch { /* */ }
  }
}

/**
 * If `options.globalBin` is set, mirror each freshly installed binary into the
 * stable global bin dir so users can put a single dir on PATH and have every
 * pantry-installed package show up there. Returns the list of created link
 * paths (or an empty array when the option is off).
 */
function maybeLinkToGlobalBin(
  pkgDir: string,
  binaries: string[],
  platform: Platform,
  options: InstallOptions,
): string[] {
  if (!options.globalBin) return []

  const targetDir = typeof options.globalBin === 'string' ? options.globalBin : globalBinDir()
  fs.mkdirSync(targetDir, { recursive: true })

  const created: string[] = []
  for (const bin of binaries) {
    let srcBin = path.join(pkgDir, bin)
    if (!fs.existsSync(srcBin)) srcBin = path.join(pkgDir, 'bin', bin)
    if (!fs.existsSync(srcBin)) continue

    const dstBin = path.join(targetDir, bin)
    linkBinary(srcBin, dstBin, platform)
    created.push(dstBin)
  }

  if (!options.quiet && created.length > 0) {
    console.log(`    → linked ${created.length} binary(ies) into ${targetDir}`)
  }
  return created
}

/**
 * Install multiple packages in parallel.
 */
export async function installPackages(
  packages: Array<{ domain: string, version: string }>,
  options: InstallOptions = {},
): Promise<InstallResult[]> {
  return Promise.all(
    packages.map(pkg => installPackage(pkg.domain, pkg.version, options)),
  )
}

/**
 * Resolve 'latest' version for known packages.
 */
export async function resolveLatestVersion(domain: string, platform: Platform = detectPlatform()): Promise<string> {
  if (isBunDomain(domain)) {
    // Try GitHub API first, then fall back to the newest version in the
    // bundled package metadata. The earlier code returned `""` on API
    // failure, which produced a `bun-v/bun-linux-x64.zip` 404 — silently
    // breaking CI installs for anyone whose runner pool was rate-limited
    // (60 req/hr unauthenticated, easy to exhaust).
    const resp = await fetchJSON('https://api.github.com/repos/oven-sh/bun/releases/latest').catch(() => null)
    const tag = (resp as { tag_name?: string } | null)?.tag_name?.replace(/^bun-v/, '') || ''
    if (tag) return tag
    const fallback = await latestFromPackageMetadata(domain)
    if (fallback) return fallback
    throw new Error('Failed to resolve latest bun.sh version (GitHub API unreachable, no bundled metadata)')
  }
  if (domain === 'ziglang.org') {
    const versions = await registryVersions(domain, platform)
    if (versions.length > 0) return versions.sort(compareVersions)[0]
    throw new Error(`Failed to resolve a ziglang.org version published for ${registryPlatformKey(platform)}`)
  }
  if (domain === 'nodejs.org') {
    const resp = await fetchJSON('https://nodejs.org/dist/index.json').catch(() => null)
    const versions = (resp as Array<{ version: string, lts: boolean | string }> | null) || []
    const lts = versions.find(v => v.lts)
    const v = (lts?.version || versions[0]?.version || '').replace(/^v/, '')
    if (v) return v
    const fallback = await latestFromPackageMetadata(domain)
    if (fallback) return fallback
    throw new Error('Failed to resolve latest nodejs.org version')
  }
  if (domain === 'github.com/mail-os/mail') {
    const resp = await fetchJSON('https://api.github.com/repos/mail-os/mail/releases/latest').catch(() => null)
    const releaseTag = (resp as { tag_name?: string } | null)?.tag_name?.replace(/^v/, '') || ''
    if (releaseTag) return releaseTag

    const tags = await fetchJSON('https://api.github.com/repos/mail-os/mail/tags?per_page=1').catch(() => null)
    const tag = ((tags as Array<{ name?: string }> | null)?.[0]?.name || '').replace(/^v/, '')
    if (tag) return tag

    const fallback = await latestFromPackageMetadata(domain)
    if (fallback) return fallback
    throw new Error('Failed to resolve latest github.com/mail-os/mail version')
  }
  // Anything else pantry publishes: the registry is the only list that proves
  // an artifact exists for this runner's platform, which is exactly the
  // question "what is the latest version" is being asked in aid of.
  const published = await registryVersions(domain, platform)
  if (published.length > 0) return published.sort(compareVersions)[0]

  throw new Error(
    `Cannot resolve latest version for ${domain} `
    + `(no built-in resolver, and the registry publishes nothing for ${registryPlatformKey(platform)})`,
  )
}

/** Return the highest version from `packages/index.js` for `domain`, or "". */
async function latestFromPackageMetadata(domain: string): Promise<string> {
  try {
    const pkgKey = domain.replace(/[^a-z0-9]/gi, '').toLowerCase()
    const { packages } = await import('./packages/index.js').catch(() => import('./index.js'))
    // The generated `Pantry` type is a closed object; the cast through
    // `unknown` lets us look up by computed key without listing every
    // domain explicitly here.
    const pkg = (packages as unknown as Record<string, { versions?: readonly string[] }>)[pkgKey]
    const versions = pkg?.versions || []
    // Take the first stable (non-pre-release) version — the bundled list is
    // typically newest-first; fall back to any version if there are no stables.
    return versions.find(v => !v.includes('-')) || versions[0] || ''
  }
  catch {
    return ''
  }
}

/**
 * Resolve a short Zig dev version like "0.17.0-dev" from the Pantry registry.
 */
async function resolveZigShortDevVersion(shortVersion: string, platform: Platform, retryOptions: NetworkRetryOptions = {}): Promise<string | null> {
  const versions = await registryVersions('ziglang.org', platform, retryOptions)
  const mirrored = versions.filter(version => version.startsWith(`${shortVersion}.`)).sort(compareVersions)[0]
  if (mirrored) return mirrored

  const index = await fetchJSON('https://ziglang.org/download/index.json', 3, retryOptions).catch(() => null) as { master?: { version?: string } } | null
  const upstream = index?.master?.version || ''
  return upstream.startsWith(`${shortVersion}.`) ? upstream : null
}

export interface RegistryPlatformMetadata {
  /** Path of the tarball, relative to the registry root. */
  tarball?: string
  sha256?: string
}

export interface RegistryVersionMetadata {
  platforms?: Record<string, RegistryPlatformMetadata>
}

export interface RegistryMetadata {
  versions?: Record<string, RegistryVersionMetadata>
}

export function registryPlatformKey(platform: Platform): string {
  const arch = platform.arch === 'aarch64' ? 'arm64' : 'x86-64'
  return `${platform.os}-${arch}`
}

export function registryVersionsForPlatform(metadata: RegistryMetadata | null, platform: Platform): string[] {
  const platformKey = registryPlatformKey(platform)
  return Object.entries(metadata?.versions || {})
    .filter(([, version]) => Object.hasOwn(version.platforms || {}, platformKey))
    .map(([version]) => version)
}

async function registryMetadata(domain: string, retryOptions: NetworkRetryOptions = {}): Promise<RegistryMetadata | null> {
  return await fetchJSON(`${registryBase()}/binaries/${encodeURI(domain)}/metadata.json`, 5, retryOptions)
    .catch(() => null) as RegistryMetadata | null
}

async function registryVersions(domain: string, platform: Platform, retryOptions: NetworkRetryOptions = {}): Promise<string[]> {
  return registryVersionsForPlatform(await registryMetadata(domain, retryOptions), platform)
}

/**
 * Install `domain@version` straight from the registry, for any package that
 * has one published — no per-package resolver required.
 *
 * The five resolvers below this fetch from each project's own origin, which is
 * right for the handful of toolchains that need bespoke URL shapes. Everything
 * else pantry builds lands in the registry under one predictable layout, and
 * before this the SDK simply refused it: `isSupported()` said no, the GitHub
 * Action logged "not supported by TS installer SDK, skipping", and the next
 * step failed on `command not found` — on Linux runners especially, since a
 * macOS developer's local `pantry install` uses a different code path and
 * succeeds. The binaries were sitting in the registry the whole time.
 *
 * The path is read from the metadata rather than reconstructed, so a registry
 * that changes its layout does not silently 404 here.
 */
export function registryDownloadSource(
  metadata: RegistryMetadata | null,
  version: string,
  platform: Platform,
): (DownloadSource & { sha256?: string }) | null {
  const published = metadata?.versions?.[version]?.platforms?.[registryPlatformKey(platform)]
  if (!published?.tarball) return null

  return {
    url: `${registryBase()}/${published.tarball.replace(/^\/+/, '')}`,
    format: 'tar.gz',
    // Registry tarballs extract straight to the package root (`bin/`, `lib/`),
    // with no versioned wrapper directory to strip.
    prefix: '',
    sha256: published.sha256?.toLowerCase(),
  }
}

/**
 * Executables a package installed from the registry provides.
 *
 * The built-in resolvers declare their binaries up front because they have to
 * name a bespoke archive layout. A registry package needs no such declaration:
 * every one of them puts its executables in `bin/`, so reading the directory
 * is both simpler and incapable of drifting from what was actually shipped.
 */
export function installedRegistryBinaries(pkgDir: string): string[] {
  try {
    return fs.readdirSync(path.join(pkgDir, 'bin'))
      .filter(name => !name.startsWith('.'))
      .sort()
  }
  catch {
    return []
  }
}

/** Where an archive is fetched from, and how to unwrap it once downloaded. */
export interface DownloadSource {
  url: string
  format: 'tar.xz' | 'tar.gz' | 'zip'
  /** Top-level directory inside the archive; '' when it extracts to the root. */
  prefix: string
}

/**
 * The registry mirror to install `ziglang.org@version` from, or null to use
 * ziglang.org itself.
 *
 * ziglang.org deletes a `-dev` archive once master moves past it, which is
 * precisely why version resolution picks the newest dev build *our registry
 * mirrors*. Resolving against the mirror and then downloading from upstream
 * left every mirrored-but-purged build resolving fine and 404ing on download —
 * e.g. linux-arm64, whose newest mirrored dev build is long gone upstream.
 *
 * Tagged releases deliberately stay on ziglang.org: upstream keeps those
 * indefinitely, so serving them ourselves would spend our own egress for
 * nothing.
 */
export function zigRegistryMirror(
  metadata: RegistryMetadata | null,
  version: string,
  platform: Platform,
): DownloadSource | null {
  if (!version.includes('-dev.') || !metadata) return null
  const platformKey = registryPlatformKey(platform)
  // The registry indexes some dev builds under `+<hash>` and others under
  // `_<hash>`, and only one spelling may carry this platform's artifact.
  const spellings = [
    version.replace(/(-dev\.\d+)_([0-9A-Za-z-]+)$/, '$1+$2'),
    version.replace(/(-dev\.\d+)\+([0-9A-Za-z-]+)$/, '$1_$2'),
  ]
  const mirrored = spellings.find(candidate =>
    Object.hasOwn(metadata.versions?.[candidate]?.platforms || {}, platformKey),
  )
  if (!mirrored) return null

  // `+` is a legal path character, so leave it unescaped: that spelling also
  // resolves on registries deployed before the proxy learned to percent-decode.
  const encoded = encodeURIComponent(mirrored).replace(/%2B/gi, '+')
  return {
    url: `${registryBase()}/binaries/ziglang.org/${encoded}/${platformKey}/ziglang.org-${encoded}.tar.gz`,
    format: 'tar.gz',
    // Registry tarballs extract straight to the package root (`bin/`, `lib/`),
    // with no `zig-<arch>-<os>-<version>/` wrapper to strip.
    prefix: '',
  }
}

/**
 * Why a pinned Zig dev build just 404'd, and which ones to pin instead.
 *
 * ziglang.org serves only the current master build, so an exact `-dev` pin
 * works for a few weeks and then stops existing. What the pin's owner sees is a
 * bare `HTTP 404 downloading https://ziglang.org/builds/...`, which reads as a
 * network blip or a typo rather than "upstream deleted this and is never
 * bringing it back" — and in CI it arrives at the first step, having explained
 * nothing about why a pipeline that passed last month now cannot start.
 *
 * We mirror dev builds precisely so a pin can outlive that pruning, so when the
 * pinned build is not among them the fix is to pin one that is. Returns null
 * when this is not that failure, in which case the original error stands.
 */
export function zigPurgedDevBuildHint(
  metadata: RegistryMetadata | null,
  domain: string,
  version: string,
  platform: Platform,
): string | null {
  if (domain !== 'ziglang.org' || !version.includes('-dev.')) return null

  const platformKey = registryPlatformKey(platform)
  // `compareVersions` is newest-first by construction, so no reverse here.
  const mirrored = registryVersionsForPlatform(metadata, platform)
    .filter(candidate => candidate.includes('-dev.'))
    .sort(compareVersions)

  return [
    `ziglang.org keeps only the current master build, so the pinned dev build ${version} no longer exists upstream.`,
    `The pantry registry mirrors dev builds so a pin can outlive that pruning, but it carries no ${platformKey} artifact for this one.`,
    mirrored.length > 0
      ? `Pin one it does carry, newest first: ${mirrored.slice(0, 3).join(', ')}.`
      : `It currently mirrors no ${platformKey} dev build either — pin a tagged release instead.`,
  ].join('\n')
}

/** Does `version` satisfy `op` + `target`? Shared by the bundled and live scans. */
export interface InstallerConstraint {
  operator: '^' | '~' | '>=' | '<=' | '>' | '<' | '='
  target: string
}

export function parseInstallerConstraint(constraint: string): InstallerConstraint | null {
  const match = constraint.match(/^([~^]|>=|<=|>|<|=)(\d+(?:\.\d+){0,10}(?:-[0-9A-Za-z.-]+)?(?:[+_][0-9A-Za-z.-]+)?)/)
  if (!match) return null
  return { operator: match[1] as InstallerConstraint['operator'], target: match[2] }
}

function numericCore(version: string): number[] {
  return version.split(/[+_-]/, 1)[0].split('.').map(part => Number.parseInt(part, 10))
}

function compareInstallerVersions(a: string, b: string): number {
  const left = numericCore(a)
  const right = numericCore(b)
  for (let i = 0; i < Math.max(left.length, right.length, 3); i++) {
    const difference = (left[i] || 0) - (right[i] || 0)
    if (difference) return difference
  }

  const leftPrerelease = a.includes('-')
  const rightPrerelease = b.includes('-')
  if (leftPrerelease !== rightPrerelease) return leftPrerelease ? -1 : 1

  const leftDev = Number.parseInt(a.match(/-dev\.(\d+)/)?.[1] || '0', 10)
  const rightDev = Number.parseInt(b.match(/-dev\.(\d+)/)?.[1] || '0', 10)
  return leftDev - rightDev
}

export function satisfiesInstallerConstraint(version: string, constraint: InstallerConstraint): boolean {
  const { operator: op, target: targetRaw } = constraint
  // Skip dev/pre-release versions for stable constraints
  if (version.includes('-') && !targetRaw.includes('-')) return false
  const parts = numericCore(version)
  const target = numericCore(targetRaw)
  if (parts.some(Number.isNaN) || target.some(Number.isNaN)) return false

  // A partial constraint omits components ("^26", "~1.3"), so read every slot
  // through a 0 default on BOTH sides. Comparing against a bare target[1] made
  // each test `x > undefined` — always false — so "^26" matched nothing and the
  // caller silently installed "latest" instead of a node 26.
  const [vMaj, vMin, vPat] = [parts[0] || 0, parts[1] || 0, parts[2] || 0]
  const [tMaj, tMin, tPat] = [target[0] || 0, target[1] || 0, target[2] || 0]
  const order = compareInstallerVersions(version, targetRaw)

  if (op === '^') {
    if (order < 0) return false
    // Omitted components are ranges: ^0 permits every stable 0.x, and
    // ^0.0 permits every 0.0 patch. An explicit ^0.0.3 still pins its patch.
    if (target.length === 1) return vMaj === tMaj
    if (tMaj === 0 && target.length === 2) return vMaj === 0 && vMin === tMin
    // ^0.0.3 pins the patch; ^0.15.1 pins the minor; ^1.2.3 pins the major.
    if (tMaj === 0 && tMin === 0) return vMaj === 0 && vMin === 0 && vPat === tPat
    if (tMaj === 0) return vMaj === 0 && vMin === tMin
    // ^x.y.z: same major, minor.patch >= target
    return vMaj === tMaj
  }
  if (op === '~') {
    if (order < 0) return false
    return target.length === 1 ? vMaj === tMaj : vMaj === tMaj && vMin === tMin
  }
  if (op === '>=') return order >= 0
  if (op === '<=') return order <= 0
  if (op === '>') return order > 0
  if (op === '<') return order < 0
  if (op === '=') return order === 0
  return false
}

/**
 * Live version list for the domains that publish one, newest-first.
 *
 * The bundled catalog in `packages/index.js` is a point-in-time snapshot: it
 * goes stale the moment upstream cuts a release (bun.sh tops out at 1.3.0
 * there while 1.3.14 is current), so a constraint like `^1.3.14` matched
 * nothing and we silently installed "latest" instead. Consulting upstream
 * keeps a correct `deps.yaml` pin from depending on when this package was
 * last published. Returns [] for domains with no live source — the bundled
 * list is then the only answer.
 */
async function fetchLiveVersions(domain: string, platform: Platform): Promise<string[]> {
  if (isBunDomain(domain)) {
    const resp = await fetchJSON('https://api.github.com/repos/oven-sh/bun/releases?per_page=100').catch(() => null)
    const releases = (resp as Array<{ tag_name?: string }> | null) || []
    return releases.map(r => (r.tag_name || '').replace(/^bun-v/, '')).filter(Boolean)
  }
  if (domain === 'nodejs.org') {
    const resp = await fetchJSON('https://nodejs.org/dist/index.json').catch(() => null)
    const versions = (resp as Array<{ version?: string }> | null) || []
    return versions.map(v => (v.version || '').replace(/^v/, '')).filter(Boolean)
  }
  if (domain === 'ziglang.org') {
    // The installer downloads zig from ziglang.org itself, and ziglang.org
    // PRUNES dev builds — so the origin's live index is the only list that
    // proves a tarball is still downloadable. Preferring the registry's
    // mirrored list here pinned a pruned dev build and deadlocked CI: the
    // job that refreshes the mirror could not install zig to run, so the
    // stale pin could never heal itself. Origin first; the registry is the
    // fallback for when the origin index is unreachable.
    const index = await fetchJSON('https://ziglang.org/download/index.json').catch(() => null) as ZigDownloadIndex | null
    const origin = zigOriginVersions(index, platform)
    if (origin.length > 0) return origin
    return await registryVersions(domain, platform)
  }
  // For a registry-published package the registry *is* the live list, so a
  // `^0.0.37`-style constraint resolves against what can actually be installed
  // rather than against nothing.
  return await registryVersions(domain, platform)
}

export type ZigDownloadIndex = Record<string, Record<string, unknown> & { version?: string }>

/** Return only Zig versions that the live origin publishes for this target. */
export function zigOriginVersions(index: ZigDownloadIndex | null, platform: Platform): string[] {
  const platformKey = `${platform.arch}-${platform.os === 'darwin' ? 'macos' : platform.os}`
  return Object.entries(index || {})
    .filter(([, entry]) => Boolean(entry[platformKey]))
    .map(([key, entry]) => entry.version || key)
    .filter(Boolean)
}

/** Newest-first semver sort, so the first match found is always the highest. */
export function compareInstallerVersionsDesc(a: string, b: string): number {
  return compareInstallerVersions(b, a)
}

export function resolveInstallerConstraintFromCandidates(constraint: string, candidates: readonly string[]): string | null {
  const parsed = parseInstallerConstraint(constraint)
  if (!parsed) return null
  return [...new Set(candidates)].sort(compareInstallerVersionsDesc).find(version => satisfiesInstallerConstraint(version, parsed)) || null
}

/**
 * Resolve a semver constraint (^1.0.0, ~1.2.0, >=1.0.0, etc.) to the best matching concrete version.
 */
async function resolveVersionConstraint(domain: string, constraint: string, platform: Platform): Promise<string> {
  if (!parseInstallerConstraint(constraint)) return resolveLatestVersion(domain, platform)

  // Get available versions from package metadata
  let bundledVersions: readonly string[]
  try {
    const pkgKey = domain.replace(/[^a-z0-9]/gi, '').toLowerCase()
    const { packages } = await import('./packages/index.js').catch(() => import('./index.js'))
    const pkg = (packages as any)[pkgKey]
    bundledVersions = pkg?.versions || []
  }
  catch {
    bundledVersions = []
  }

  // Union of upstream + bundled, sorted so the first match is the highest one.
  // Merging rather than preferring either list keeps resolution working when
  // upstream is unreachable (bundled-only) and when it's ahead (live-only).
  const live = await fetchLiveVersions(domain, platform)
  // The Pantry registry is authoritative for Zig binaries. Bundled recipe
  // versions do not prove that a particular target artifact was published.
  const candidates = domain === 'ziglang.org'
    ? live.sort(compareInstallerVersionsDesc)
    : [...new Set([...live, ...bundledVersions])].sort(compareInstallerVersionsDesc)
  const resolved = resolveInstallerConstraintFromCandidates(constraint, candidates)
  if (resolved) return resolved

  // Nothing upstream or bundled satisfies the pin. Installing "latest" here
  // would hand back a version the caller explicitly did not ask for, which is
  // worse than stopping: a `^1.2` pin quietly became 1.3.x.
  throw new Error(
    `No version of ${domain} satisfies "${constraint}" `
    + `(checked ${candidates.length} version${candidates.length === 1 ? '' : 's'}`
    + `${candidates.length > 0 ? `, newest ${candidates[0]}` : ''}).`,
  )
}

// ── Helpers ──

export interface NetworkRetryOptions {
  maxAttempts?: number
  retryDelayMs?: number
  sleep?: (milliseconds: number) => Promise<void>
  onRetry?: (message: string) => void
}

export interface DownloadFileOptions extends NetworkRetryOptions {
  quiet?: boolean
  expectedSha256?: string
  stallTimeoutMs?: number
}

const DEFAULT_NETWORK_MAX_ATTEMPTS = 4

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

function errorStatus(error: unknown): number | undefined {
  if (typeof error === 'object' && error !== null && 'statusCode' in error) {
    const status = Number((error as { statusCode?: unknown }).statusCode)
    if (Number.isFinite(status)) return status
  }
  const match = errorMessage(error).match(/\bHTTP\s+(\d{3})\b/i)
  return match ? Number(match[1]) : undefined
}

function errorCode(error: unknown): string {
  if (typeof error !== 'object' || error === null) return ''
  const direct = 'code' in error ? String((error as { code?: unknown }).code || '') : ''
  if (direct) return direct
  const cause = 'cause' in error ? (error as { cause?: unknown }).cause : undefined
  return typeof cause === 'object' && cause !== null && 'code' in cause
    ? String((cause as { code?: unknown }).code || '')
    : ''
}

export function isRetryableNetworkError(error: unknown): boolean {
  const status = errorStatus(error)
  if (status !== undefined)
    return status === 408 || status === 425 || status === 429 || status >= 500

  if (/^(?:ECONNRESET|ECONNREFUSED|EPIPE|ETIMEDOUT|EAI_AGAIN|ENETDOWN|ENETUNREACH|EHOSTUNREACH|UND_ERR_SOCKET)$/i.test(errorCode(error)))
    return true

  return /socket hang up|connection reset|premature close|aborted|terminated|timed? ?out|temporar|stalled|incomplete download|checksum mismatch/i.test(errorMessage(error))
}

export async function retryNetworkOperation<T>(
  label: string,
  operation: () => Promise<T>,
  options: NetworkRetryOptions = {},
): Promise<T> {
  const maxAttempts = options.maxAttempts ?? DEFAULT_NETWORK_MAX_ATTEMPTS
  const retryDelayMs = options.retryDelayMs ?? 1000
  const sleep = options.sleep ?? (milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds)))

  let lastError: unknown
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await operation()
    }
    catch (error) {
      lastError = error
      if (!isRetryableNetworkError(error)) throw error
      if (attempt === maxAttempts) break
      const delay = Math.min(retryDelayMs * 2 ** (attempt - 1), 10_000)
      options.onRetry?.(`${label} failed (${errorMessage(error)}); retrying in ${delay}ms`)
      await sleep(delay)
    }
  }

  throw new Error(`${label} failed after ${maxAttempts} attempts: ${errorMessage(lastError)}`)
}

function openDownload(url: string, maxRedirects: number, stallTimeoutMs: number): Promise<http.IncomingMessage> {
  return new Promise((resolve, reject) => {
    const get = url.startsWith('https') ? https.get : http.get
    const req = get(url, { headers: { 'User-Agent': 'pantry-installer' } }, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume()
        if (maxRedirects <= 0) return reject(new Error(`Too many redirects for ${url}`))
        const redirect = new URL(res.headers.location, url).href
        return openDownload(redirect, maxRedirects - 1, stallTimeoutMs).then(resolve, reject)
      }

      if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 300) {
        res.resume()
        const error = Object.assign(new Error(`HTTP ${res.statusCode || 'unknown'} downloading ${url}`), {
          statusCode: res.statusCode,
        })
        return reject(error)
      }

      res.setTimeout(stallTimeoutMs, () => {
        res.destroy(new Error(`Download stalled (no data for ${stallTimeoutMs / 1000}s): ${url}`))
      })
      resolve(res)
    })
    req.setTimeout(stallTimeoutMs, () => {
      req.destroy(new Error(`Download timed out after ${stallTimeoutMs / 1000}s: ${url}`))
    })
    req.once('error', reject)
  })
}

async function downloadFileOnce(url: string, dest: string, options: DownloadFileOptions): Promise<void> {
  const partialPath = `${dest}.part`
  try { fs.rmSync(partialPath, { force: true }) } catch { /* ignore */ }

  const response = await openDownload(url, 10, options.stallTimeoutMs ?? 60_000)
  const showProgress = !options.quiet && process.stderr.isTTY
  const declaredLength = Number.parseInt(String(response.headers['content-length'] || ''), 10)
  const total = Number.isFinite(declaredLength) ? declaredLength : 0
  let received = 0
  let lastPrintAt = 0
  const hash = options.expectedSha256 ? createHash('sha256') : undefined

  const meter = new Transform({
    transform(chunk: Buffer, _encoding, callback) {
      received += chunk.length
      hash?.update(chunk)
      const now = Date.now()
      if (showProgress && now - lastPrintAt > 200) {
        lastPrintAt = now
        const mb = (received / 1_048_576).toFixed(1)
        if (total > 0) {
          const totalMb = (total / 1_048_576).toFixed(1)
          const pct = Math.floor((received / total) * 100)
          process.stderr.write(`\r    ${mb}/${totalMb} MB (${pct}%)`)
        }
        else {
          process.stderr.write(`\r    ${mb} MB`)
        }
      }
      callback(null, chunk)
    },
  })

  try {
    await pipeline(response, meter, fs.createWriteStream(partialPath))
    if (!response.complete || (total > 0 && received !== total))
      throw new Error(`Incomplete download for ${url}: received ${received} of ${total || 'unknown'} bytes`)

    if (options.expectedSha256) {
      const actual = hash!.digest('hex')
      if (actual !== options.expectedSha256.toLowerCase())
        throw new Error(`Checksum mismatch for ${url}: expected ${options.expectedSha256}, got ${actual}`)
    }

    fs.renameSync(partialPath, dest)
  }
  catch (error) {
    try { fs.rmSync(partialPath, { force: true }) } catch { /* ignore */ }
    throw error
  }
  finally {
    if (showProgress && lastPrintAt > 0) process.stderr.write('\r\x1b[K')
  }
}

export async function downloadFileReliably(url: string, dest: string, options: DownloadFileOptions = {}): Promise<void> {
  await retryNetworkOperation(
    `Download ${url}`,
    () => downloadFileOnce(url, dest, options),
    options,
  )
}

async function extractArchive(archivePath: string, destDir: string, format: string): Promise<void> {
  if (format === 'zip') {
    // Use system unzip (available on all platforms)
    if (process.platform === 'win32') {
      execFileSync('powershell', ['-NoProfile', '-Command', 'Expand-Archive', '-Path', archivePath, '-DestinationPath', destDir, '-Force'], { stdio: 'pipe' })
    }
    else {
      execFileSync('unzip', ['-o', '-q', archivePath, '-d', destDir], { stdio: 'pipe' })
    }
  }
  else if (format === 'tar.xz') {
    execFileSync('tar', ['xJf', archivePath, '-C', destDir], { stdio: 'pipe' })
  }
  else if (format === 'tar.gz') {
    execFileSync('tar', ['xzf', archivePath, '-C', destDir], { stdio: 'pipe' })
  }
  else {
    throw new Error(`Unsupported archive format: ${format}`)
  }
}

function copyDirRecursive(src: string, dest: string): void {
  fs.cpSync(src, dest, { recursive: true })
}

/**
 * Give every regular file under `dir` the executable bit, following
 * subdirectories. Used on the directories whose whole purpose is to hold
 * executables (`bin`, `sbin`, `libexec`), where an archive that lost its mode
 * bits leaves helpers that the package's own wrappers exec.
 *
 * Preserves whatever read/write bits are already there and never widens a
 * file that is already executable.
 */
function makeTreeExecutable(dir: string): void {
  let entries: fs.Dirent[]
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true })
  }
  catch {
    return // directory absent for this package
  }

  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name)
    try {
      if (entry.isDirectory()) {
        makeTreeExecutable(entryPath)
        continue
      }
      if (!entry.isFile())
        continue // leave symlinks and specials alone

      const mode = fs.statSync(entryPath).mode & 0o777
      // Mirror each read bit into the matching execute bit.
      const withExec = mode | ((mode & 0o444) >> 2)
      if (withExec !== mode)
        fs.chmodSync(entryPath, withExec)
    }
    catch {
      // A single unreadable entry should not abort the install.
    }
  }
}

function fetchJSONOnce(url: string, maxRedirects: number): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const get = url.startsWith('https') ? https.get : http.get
    const headers: Record<string, string> = {
      'User-Agent': 'pantry-installer',
      'Accept': 'application/json',
    }
    // Authenticate api.github.com calls when a GITHUB_TOKEN is available.
    // Unauthenticated requests share a 60 req/hr quota across the entire
    // runner pool's IP range, which is routinely exhausted on busy CI;
    // an authenticated request gets 5000/hr per token. The token is set
    // automatically on GitHub Actions runners — outside CI we just skip.
    if (url.includes('api.github.com')) {
      const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN
      if (token) headers.Authorization = `Bearer ${token}`
    }
    const req = get(url, { headers, timeout: 30000 }, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        if (maxRedirects <= 0) return reject(new Error(`Too many redirects for ${url}`))
        const redirect = new URL(res.headers.location, url).href
        return fetchJSONOnce(redirect, maxRedirects - 1).then(resolve, reject)
      }
      if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 300) {
        return reject(Object.assign(new Error(`HTTP ${res.statusCode || 'unknown'} fetching ${url}`), {
          statusCode: res.statusCode,
        }))
      }
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try { resolve(JSON.parse(data)) }
        catch (e) { reject(e) }
      })
    })
    req.on('error', reject)
    req.on('timeout', () => {
      req.destroy()
      reject(new Error(`Request timed out: ${url}`))
    })
  })
}

function fetchJSON(url: string, maxRedirects = 5, retryOptions: NetworkRetryOptions = {}): Promise<unknown> {
  return retryNetworkOperation(
    `Fetch ${url}`,
    () => fetchJSONOnce(url, maxRedirects),
    retryOptions,
  )
}

/**
 * Check if a package domain has a known resolver.
 */
// Registered under both names, so a spec resolves whether it arrived as the
// historical `bun.sh` or the canonical `bun.com`.
resolvers['bun.com'] = resolvers['bun.sh']

export function isSupported(domain: string): boolean {
  return domain in resolvers
}

/**
 * Whether this SDK can install `domain` on `platform`.
 *
 * Broader than {@link isSupported}, and asynchronous for the reason that
 * matters: most installable packages have no built-in resolver, and the only
 * way to know whether one is installable here is to ask the registry what it
 * publishes for this platform. Callers that gate on the synchronous
 * `isSupported` reject those packages before ever looking — which is how
 * `craft-native.org` came to be skipped on Linux runners while its Linux
 * tarball sat in the registry.
 *
 * A registry that cannot be reached answers `false` rather than throwing: the
 * caller's next move is to report a skip, and a network blip should not fail
 * the run outright.
 */
export async function isInstallable(
  domain: string,
  platform: Platform = detectPlatform(),
): Promise<boolean> {
  if (isSupported(domain)) return true
  return (await registryVersions(domain, platform)).length > 0
}

/**
 * Get list of all supported package domains.
 */
export function supportedPackages(): string[] {
  return Object.keys(resolvers)
}

/**
 * Get the primary binary name for a supported package domain.
 * Returns the first non-Windows binary (e.g. 'bun' for 'bun.sh', 'zig' for 'ziglang.org').
 */
export function getPrimaryBinary(domain: string): string | undefined {
  const resolver = resolvers[domain]
  if (!resolver) return undefined
  const platform = detectPlatform()
  const bins = resolver.getBinaries(platform)
  return bins[0]
}
