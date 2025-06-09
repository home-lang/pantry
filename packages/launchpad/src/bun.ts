import fs, { createWriteStream } from 'node:fs'
import { arch, platform } from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { pipeline } from 'node:stream/promises'
import { config } from './config'

type Platform = 'darwin' | 'linux' | 'win32'

interface BunAsset {
  filename: string
  url: string
}

interface GithubRelease {
  tag_name: string
}

// Cache configuration for GitHub API responses
const CACHE_DIR = path.join(process.env.HOME || '.', '.cache', 'launchpad')
const GITHUB_CACHE_FILE = path.join(CACHE_DIR, 'github-bun-releases.json')
const CACHE_TTL = 60 * 60 * 1000 // 1 hour in milliseconds

/**
 * Check if a path is valid for installation
 */
function validatePath(installPath: string): boolean {
  try {
    // Check if the path exists or can be created
    fs.mkdirSync(installPath, { recursive: true })
    return true
  }
  catch {
    return false
  }
}

/**
 * Check if cache exists and is still valid
 */
function isCacheValid(): boolean {
  if (!fs.existsSync(GITHUB_CACHE_FILE)) {
    return false
  }

  try {
    const stats = fs.statSync(GITHUB_CACHE_FILE)
    const now = Date.now()
    const cacheAge = now - stats.mtimeMs

    // Check if cache is expired
    return cacheAge < CACHE_TTL
  }
  catch {
    return false
  }
}

/**
 * Read cached GitHub response data
 */
function readGithubCache(): GithubRelease | null {
  try {
    if (isCacheValid()) {
      const cacheData = fs.readFileSync(GITHUB_CACHE_FILE, 'utf-8')
      return JSON.parse(cacheData) as GithubRelease
    }
  }
  catch (error) {
    if (config.verbose) {
      console.warn(`Failed to read GitHub cache: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  return null
}

/**
 * Update the GitHub API response cache
 */
function updateGithubCache(data: GithubRelease): void {
  try {
    fs.mkdirSync(CACHE_DIR, { recursive: true })
    fs.writeFileSync(GITHUB_CACHE_FILE, JSON.stringify(data))
  }
  catch (error) {
    if (config.verbose) {
      console.warn(`Failed to update GitHub cache: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
}

/**
 * Get the latest Bun version from GitHub API
 */
export async function get_latest_bun_version(): Promise<string> {
  // Try to get version from cache first
  const cachedData = readGithubCache()
  if (cachedData && cachedData.tag_name) {
    if (config.verbose) {
      console.warn('Using cached GitHub release data')
    }

    return cachedData.tag_name.replace(/^bun-v?/, '') // Remove 'bun-v' or 'bun-' or 'v' prefix
  }

  // Fetch from GitHub API if cache is missing or invalid
  const response = await fetch('https://api.github.com/repos/oven-sh/bun/releases/latest')

  if (!response.ok) {
    throw new Error(`Failed to fetch latest Bun version: ${response.statusText}`)
  }

  const data = await response.json() as GithubRelease

  // Update cache with new data
  updateGithubCache(data)

  return data.tag_name.replace(/^bun-v?/, '') // Remove 'bun-v' or 'bun-' or 'v' prefix
}

/**
 * Determine the appropriate Bun download URL based on the current platform and architecture
 */
export function get_bun_asset(version: string): BunAsset {
  const currentPlatform = platform() as Platform
  const currentArch = arch() === 'arm64' ? 'aarch64' : 'x64'

  if (config.verbose)
    console.warn(`Platform: ${currentPlatform}, Architecture: ${currentArch}`)

  // Mapping platform and architecture to asset name
  let filename: string

  switch (currentPlatform) {
    case 'darwin': // macOS
      filename = `bun-darwin-${currentArch}.zip`
      break
    case 'linux':
      filename = `bun-linux-${currentArch}.zip`
      break
    case 'win32': // Windows
      filename = `bun-windows-x64.zip` // Bun only supports x64 on Windows
      break
    default:
      throw new Error(`Unsupported platform: ${currentPlatform}`)
  }

  const url = `https://github.com/oven-sh/bun/releases/download/v${version}/${filename}`

  return { filename, url }
}

/**
 * Download and install Bun
 */
export async function install_bun(installPath: string, version?: string): Promise<string[]> {
  if (!validatePath(installPath))
    throw new Error(`Invalid installation path: ${installPath}`)

  // Determine the version to install
  const bunVersion = version || await get_latest_bun_version()
  if (config.verbose)
    console.warn(`Installing Bun version ${bunVersion}`)

  // Get the appropriate download URL
  const { filename, url } = get_bun_asset(bunVersion)
  if (config.verbose)
    console.warn(`Downloading from: ${url}`)

  // Create installation directory if it doesn't exist
  const binDir = path.join(installPath, 'bin')
  fs.mkdirSync(binDir, { recursive: true })

  // Create a temporary directory for the download
  const tempDir = path.join(installPath, 'temp')
  fs.mkdirSync(tempDir, { recursive: true })

  const zipPath = path.join(tempDir, filename)

  try {
    // Download the Bun archive
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Failed to download Bun: ${response.statusText}`)
    }

    // Save the downloaded file
    const fileStream = createWriteStream(zipPath)
    await pipeline(response.body as any, fileStream)

    if (config.verbose)
      console.warn(`Downloaded to ${zipPath}`)

    // Extract the archive
    if (filename.endsWith('.zip')) {
      // For zip files, use the unzip command
      const { exec } = await import('node:child_process')
      const { promisify } = await import('node:util')
      const execAsync = promisify(exec)

      await execAsync(`unzip -o "${zipPath}" -d "${tempDir}"`)

      // Move the bun executable to the bin directory
      const bundleName = platform() === 'win32' ? 'bun-*.exe' : 'bun-*'
      const bunExeName = platform() === 'win32' ? 'bun.exe' : 'bun'

      // Find the extracted executable
      const extractedDir = path.join(tempDir, 'bun-*')
      const { stdout: extractedDirs } = await execAsync(`ls -d ${extractedDir}`)
      const bunDir = extractedDirs.trim().split('\n')[0]

      // Move the executable to bin directory
      const sourcePath = path.join(bunDir, bundleName)
      const destPath = path.join(binDir, bunExeName)

      if (fs.existsSync(destPath))
        fs.unlinkSync(destPath)

      await execAsync(`cp ${sourcePath} ${destPath}`)
      await execAsync(`chmod +x ${destPath}`)
    }

    // Clean up
    fs.rmSync(tempDir, { recursive: true, force: true })

    return [path.join(binDir, platform() === 'win32' ? 'bun.exe' : 'bun')]
  }
  catch (error) {
    // Clean up on error
    if (fs.existsSync(tempDir))
      fs.rmSync(tempDir, { recursive: true, force: true })

    throw error
  }
}
