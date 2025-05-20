import fs, { createWriteStream } from 'node:fs'
import { arch, platform } from 'node:os'
import path from 'node:path'
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
 * Get the latest Bun version from GitHub API
 */
export async function get_latest_bun_version(): Promise<string> {
  const response = await fetch('https://api.github.com/repos/oven-sh/bun/releases/latest')

  if (!response.ok) {
    throw new Error(`Failed to fetch latest Bun version: ${response.statusText}`)
  }

  const data = await response.json() as GithubRelease
  return data.tag_name.replace(/^v/, '') // Remove 'v' prefix
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
