/**
 * Cross-platform system package installer for pantry.
 *
 * Uses Node.js APIs exclusively — works on macOS, Linux, and Windows
 * without requiring the Zig CLI binary. This is the canonical way to
 * install system packages (zig, bun, node, etc.) from pantry recipes.
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
import { execSync } from 'node:child_process'

// ── Types ──

export interface Platform {
  os: 'darwin' | 'linux' | 'windows'
  arch: 'x86_64' | 'aarch64'
}

export interface InstallOptions {
  /** Directory to install into (default: ./pantry) */
  installDir?: string
  /** Create .bin/ symlinks/copies (default: true) */
  createBinLinks?: boolean
  /** Quiet mode — suppress progress output (default: false) */
  quiet?: boolean
}

export interface InstallResult {
  name: string
  version: string
  installPath: string
  binaries: string[]
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

function detectPlatform(): Platform {
  const osName = os.platform()
  const arch = os.arch()

  return {
    os: osName === 'darwin' ? 'darwin' : osName === 'win32' ? 'windows' : 'linux',
    arch: arch === 'arm64' ? 'aarch64' : 'x86_64',
  }
}

// ── Package Resolvers ──

const resolvers: Record<string, PackageResolver> = {
  'ziglang.org': {
    getDownloadUrl(version: string, platform: Platform): string {
      const archMap: Record<string, string> = { x86_64: 'x86_64', aarch64: 'aarch64' }
      const osMap: Record<string, string> = { darwin: 'macos', linux: 'linux', windows: 'windows' }
      const arch = archMap[platform.arch]
      const osName = osMap[platform.os]
      const ext = platform.os === 'windows' ? 'zip' : 'tar.xz'

      if (version.includes('-dev')) {
        return `https://ziglang.org/builds/zig-${arch}-${osName}-${version}.${ext}`
      }
      return `https://ziglang.org/download/${version}/zig-${arch}-${osName}-${version}.${ext}`
    },
    getArchiveFormat(platform: Platform) {
      return platform.os === 'windows' ? 'zip' : 'tar.xz'
    },
    getBinaries(platform: Platform) {
      return platform.os === 'windows' ? ['zig.exe'] : ['zig']
    },
    getArchivePrefix(version: string, platform: Platform) {
      const archMap: Record<string, string> = { x86_64: 'x86_64', aarch64: 'aarch64' }
      const osMap: Record<string, string> = { darwin: 'macos', linux: 'linux', windows: 'windows' }
      return `zig-${archMap[platform.arch]}-${osMap[platform.os]}-${version}`
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
      return platformMap[`${platform.os}-${platform.arch}`] || 'bun-linux-x64'
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
 * Install a system package by downloading from its official source.
 * Works cross-platform using only Node.js APIs.
 */
export async function installPackage(
  domain: string,
  version: string,
  options: InstallOptions = {},
): Promise<InstallResult> {
  const platform = detectPlatform()
  const resolver = resolvers[domain]
  if (!resolver) {
    throw new Error(`Unknown package: ${domain}. Supported: ${Object.keys(resolvers).join(', ')}`)
  }

  const installDir = options.installDir || path.join(process.cwd(), 'pantry')
  const binDir = path.join(installDir, '.bin')
  const pkgDir = path.join(installDir, domain.replace(/\./g, '-'), version)

  // Check if already installed
  const binaries = resolver.getBinaries(platform)
  if (binaries.length === 0) {
    throw new Error(`No binaries defined for ${domain} on ${platform.os}-${platform.arch}`)
  }
  const firstBin = path.join(pkgDir, binaries[0])
  if (fs.existsSync(firstBin)) {
    if (!options.quiet) console.log(`  ✓ ${domain}@${version} (cached)`)
    return { name: domain, version, installPath: pkgDir, binaries }
  }

  const url = resolver.getDownloadUrl(version, platform)
  const format = resolver.getArchiveFormat(platform)

  if (!options.quiet) console.log(`  → ${domain}@${version} from ${new URL(url).hostname}`)

  // Download
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pantry-'))
  const archivePath = path.join(tmpDir, `archive.${format}`)

  try {
    await downloadFile(url, archivePath)

    // Extract
    const extractDir = path.join(tmpDir, 'extracted')
    fs.mkdirSync(extractDir, { recursive: true })
    await extractArchive(archivePath, extractDir, format)

    // Find the source directory (archives usually have a top-level folder)
    let sourceDir = extractDir
    const prefix = resolver.getArchivePrefix?.(version, platform)
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
    }

    // Create .bin/ links
    if (options.createBinLinks !== false) {
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
            try { fs.unlinkSync(dstBin) } catch { /* */ }
            if (platform.os === 'windows') {
              fs.copyFileSync(primaryBin, dstBin)
            }
            else {
              fs.symlinkSync(primaryBin, dstBin)
            }
          }
          continue
        }

        if (!primaryBin) primaryBin = srcBin

        const dstBin = path.join(binDir, bin)
        try { fs.unlinkSync(dstBin) } catch { /* doesn't exist */ }

        if (platform.os === 'windows') {
          fs.copyFileSync(srcBin, dstBin)
        }
        else {
          fs.symlinkSync(srcBin, dstBin)
        }
      }
    }

    if (!options.quiet) console.log(`  ✓ ${domain}@${version}`)
    return { name: domain, version, installPath: pkgDir, binaries }
  }
  finally {
    // Clean up temp directory
    try { fs.rmSync(tmpDir, { recursive: true, force: true }) } catch { /* */ }
  }
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
export async function resolveLatestVersion(domain: string): Promise<string> {
  if (domain === 'bun.sh') {
    // Try GitHub API first, fall back to known recent version
    const resp = await fetchJSON('https://api.github.com/repos/oven-sh/bun/releases/latest').catch(() => null)
    const tag = (resp as { tag_name?: string } | null)?.tag_name || ''
    return tag.replace(/^bun-v/, '')
  }
  if (domain === 'ziglang.org') {
    const resp = await fetchJSON('https://ziglang.org/download/index.json')
    return (resp as { master?: { version?: string } }).master?.version || ''
  }
  if (domain === 'nodejs.org') {
    const resp = await fetchJSON('https://nodejs.org/dist/index.json')
    const versions = resp as Array<{ version: string, lts: boolean | string }>
    const lts = versions.find(v => v.lts)
    return (lts?.version || versions[0]?.version || '').replace(/^v/, '')
  }
  throw new Error(`Cannot resolve latest version for ${domain}`)
}

// ── Helpers ──

function downloadFile(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest)
    const get = url.startsWith('https') ? https.get : http.get

    get(url, (res) => {
      // Handle redirects
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        file.close()
        fs.unlinkSync(dest)
        return downloadFile(res.headers.location, dest).then(resolve, reject)
      }

      if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 300) {
        file.close()
        return reject(new Error(`HTTP ${res.statusCode || 'unknown'} downloading ${url}`))
      }

      res.pipe(file)
      file.on('finish', () => { file.close(); resolve() })
      file.on('error', reject)
    }).on('error', (err) => {
      file.close()
      reject(err)
    })
  })
}

async function extractArchive(archivePath: string, destDir: string, format: string): Promise<void> {
  if (format === 'zip') {
    // Use system unzip (available on all platforms)
    if (process.platform === 'win32') {
      execSync(`powershell -NoProfile -Command "Expand-Archive -Path '${archivePath}' -DestinationPath '${destDir}' -Force"`, { stdio: 'pipe' })
    }
    else {
      execSync(`unzip -o -q "${archivePath}" -d "${destDir}"`, { stdio: 'pipe' })
    }
  }
  else if (format === 'tar.xz') {
    execSync(`tar xf "${archivePath}" -C "${destDir}"`, { stdio: 'pipe' })
  }
  else if (format === 'tar.gz') {
    execSync(`tar xzf "${archivePath}" -C "${destDir}"`, { stdio: 'pipe' })
  }
  else {
    throw new Error(`Unsupported archive format: ${format}`)
  }
}

function copyDirRecursive(src: string, dest: string): void {
  fs.cpSync(src, dest, { recursive: true })
}

function fetchJSON(url: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const get = url.startsWith('https') ? https.get : http.get
    get(url, { headers: { 'User-Agent': 'pantry-installer' } }, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchJSON(res.headers.location).then(resolve, reject)
      }
      if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 300) {
        return reject(new Error(`HTTP ${res.statusCode || 'unknown'} fetching ${url}`))
      }
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try { resolve(JSON.parse(data)) }
        catch (e) { reject(e) }
      })
    }).on('error', reject)
  })
}

/**
 * Check if a package domain has a known resolver.
 */
export function isSupported(domain: string): boolean {
  return domain in resolvers
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
