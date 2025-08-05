/* eslint-disable no-console */
import { Buffer } from 'node:buffer'
import fs from 'node:fs'
import { arch, platform } from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { config } from './config'

type Platform = 'darwin' | 'linux' | 'win32'

interface BunAsset {
  filename: string
  url: string
}

// Cache configuration for GitHub API responses
const CACHE_DIR = path.join(process.env.HOME || '.', '.cache', 'launchpad')

// Binary cache configuration
const BINARY_CACHE_DIR = path.join(CACHE_DIR, 'binaries', 'bun')

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
 * Validate if a file is a proper zip archive
 */
function validateZipFile(filePath: string): boolean {
  try {
    if (!fs.existsSync(filePath)) {
      return false
    }

    const stats = fs.statSync(filePath)

    // Check if file size is reasonable (bun should be at least 1MB, less than 200MB)
    if (stats.size < 1024 * 1024 || stats.size > 200 * 1024 * 1024) {
      if (config.verbose) {
        console.warn(`Invalid zip file size: ${stats.size} bytes (expected 1MB-200MB)`)
      }
      return false
    }

    // Read the first few bytes to check zip signature
    const buffer = Buffer.alloc(4)
    const fd = fs.openSync(filePath, 'r')
    try {
      fs.readSync(fd, buffer, 0, 4, 0)

      // Check for ZIP signature (PK\x03\x04 or PK\x05\x06 or PK\x07\x08)
      const signature = buffer.readUInt32LE(0)
      // eslint-disable-next-line unicorn/number-literal-case
      const isValidZip = signature === 0x04034b50 // Local file header
      // eslint-disable-next-line unicorn/number-literal-case
        || signature === 0x06054b50 // End of central directory
      // eslint-disable-next-line unicorn/number-literal-case
        || signature === 0x08074b50 // Data descriptor

      if (!isValidZip && config.verbose) {
        console.warn(`Invalid zip signature: 0x${signature.toString(16).padStart(8, '0')}`)
      }

      return isValidZip
    }
    finally {
      fs.closeSync(fd)
    }
  }
  catch (error) {
    if (config.verbose) {
      console.warn(`Error validating zip file: ${error}`)
    }
    return false
  }
}

/**
 * Get cached binary path for a specific version
 */
function getCachedBinaryPath(version: string, filename: string): string | null {
  const cachedArchivePath = path.join(BINARY_CACHE_DIR, version, filename)

  if (fs.existsSync(cachedArchivePath) && validateZipFile(cachedArchivePath)) {
    if (config.verbose) {
      console.warn(`Found cached binary: ${cachedArchivePath}`)
    }
    return cachedArchivePath
  }

  // Remove corrupted cache if it exists
  if (fs.existsSync(cachedArchivePath) && !validateZipFile(cachedArchivePath)) {
    try {
      fs.unlinkSync(cachedArchivePath)
      if (config.verbose) {
        console.warn(`Cached file is corrupted, removing: ${cachedArchivePath}`)
      }
    }
    catch {
      // Ignore errors removing cached file
    }
  }

  return null
}

/**
 * Save binary to cache
 */
function saveBinaryToCache(version: string, filename: string, sourcePath: string): string {
  const cacheVersionDir = path.join(BINARY_CACHE_DIR, version)
  const cachedArchivePath = path.join(cacheVersionDir, filename)

  try {
    // Create cache directory
    fs.mkdirSync(cacheVersionDir, { recursive: true })

    // Copy the downloaded file to cache
    fs.copyFileSync(sourcePath, cachedArchivePath)

    if (config.verbose) {
      console.warn(`Cached binary to: ${cachedArchivePath}`)
    }

    return cachedArchivePath
  }
  catch (error) {
    if (config.verbose) {
      console.warn(`Failed to cache binary: ${error instanceof Error ? error.message : String(error)}`)
    }
    // Return original path if caching fails
    return sourcePath
  }
}

/**
 * Get the latest Bun version from GitHub API
 */
export async function get_latest_bun_version(): Promise<string> {
  try {
    const { pantry } = await import('ts-pkgx')
    const bunPackage = pantry.bunsh

    if (bunPackage && bunPackage.versions && bunPackage.versions.length > 0) {
      // First version is always the latest in ts-pkgx
      return bunPackage.versions[0]
    }

    throw new Error('No Bun versions found in pantry')
  }
  catch (error) {
    throw new Error(`Failed to get latest Bun version: ${error instanceof Error ? error.message : String(error)}`)
  }
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

  const url = `https://github.com/oven-sh/bun/releases/download/bun-v${version}/${filename}`

  return { filename, url }
}

/**
 * Resolve bun version constraints using GitHub releases
 */
async function resolveBunVersionConstraint(versionSpec: string): Promise<string> {
  // For exact versions, return as-is
  if (/^\d+\.\d+\.\d+$/.test(versionSpec)) {
    return versionSpec
  }

  // For latest or *, get the latest version
  if (versionSpec === 'latest' || versionSpec === '*') {
    return await get_latest_bun_version()
  }

  // Get available versions from ts-pkgx pantry
  const availableVersions = await getBunVersionsFromPantry()

  // Use Bun's built-in semver if available
  if (typeof Bun !== 'undefined' && Bun.semver) {
    try {
      // Sort versions in descending order to get the latest compatible version first
      const sortedVersions = [...availableVersions].sort((a, b) => {
        try {
          return Bun.semver.order(b, a)
        }
        catch {
          return b.localeCompare(a, undefined, { numeric: true })
        }
      })

      for (const version of sortedVersions) {
        try {
          if (Bun.semver.satisfies(version, versionSpec)) {
            return version
          }
        }
        catch {
          continue
        }
      }
    }
    catch {
      // Fall through to manual parsing
    }
  }

  // Manual constraint parsing for caret (^) constraints
  if (versionSpec.startsWith('^')) {
    const baseVersion = versionSpec.slice(1)
    const [major, minor, patch] = baseVersion.split('.')

    // Find the latest version with the same major version that satisfies the constraint
    const compatibleVersions = availableVersions.filter((v) => {
      const vParts = v.split('.')
      const vMajor = Number.parseInt(vParts[0] || '0')
      const vMinor = Number.parseInt(vParts[1] || '0')
      const vPatch = Number.parseInt(vParts[2] || '0')

      const reqMajor = Number.parseInt(major || '0')
      const reqMinor = Number.parseInt(minor || '0')
      const reqPatch = Number.parseInt(patch || '0')

      // Caret constraint: same major, version >= requested version
      if (vMajor !== reqMajor)
        return false

      if (vMinor > reqMinor)
        return true
      if (vMinor < reqMinor)
        return false

      // Same major and minor, check patch
      return vPatch >= reqPatch
    })

    if (compatibleVersions.length > 0) {
      // Return the latest compatible version
      return compatibleVersions.sort((a, b) => {
        // Proper semantic version sorting
        const aParts = a.split('.').map(p => Number.parseInt(p))
        const bParts = b.split('.').map(p => Number.parseInt(p))

        for (let i = 0; i < 3; i++) {
          if (bParts[i] !== aParts[i]) {
            return bParts[i] - aParts[i]
          }
        }
        return 0
      })[0]
    }
  }

  // If constraint resolution fails, try the version as-is
  return versionSpec
}

/**
 * Get available bun versions from ts-pkgx pantry
 */
async function getBunVersionsFromPantry(): Promise<string[]> {
  try {
    const { pantry } = await import('ts-pkgx')
    const bunPackage = pantry.bunsh

    if (bunPackage && bunPackage.versions) {
      // ts-pkgx versions are already sorted with latest first
      return [...bunPackage.versions]
    }

    throw new Error('Bun package not found in pantry')
  }
  catch (error) {
    throw new Error(`Failed to get Bun versions from pantry: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Download and install Bun
 */
export async function install_bun(installPath: string, version?: string): Promise<string[]> {
  if (!validatePath(installPath))
    throw new Error(`Invalid installation path: ${installPath}`)

  // Determine the version to install, resolving constraints like ^1.2.19
  let bunVersion: string
  if (!version) {
    bunVersion = await get_latest_bun_version()
  }
  else {
    // Handle constraints for bun (^1.2.19, ~1.2.0, etc.)
    bunVersion = await resolveBunVersionConstraint(version)
  }

  if (config.verbose)
    console.warn(`Installing Bun version ${bunVersion}`)

  // Get the appropriate download URL
  const { filename, url } = get_bun_asset(bunVersion)

  // Check if we have a cached version first
  const cachedArchivePath = getCachedBinaryPath(bunVersion, filename)

  // Create installation directory if it doesn't exist
  const binDir = path.join(installPath, 'bin')
  fs.mkdirSync(binDir, { recursive: true })

  // Create a temporary directory for the download/extraction
  const tempDir = path.join(installPath, 'temp')
  try {
    fs.mkdirSync(tempDir, { recursive: true })
  }
  catch (error) {
    if (config.verbose) {
      console.warn(`Failed to create temp directory ${tempDir}:`, error)
    }
    throw new Error(`Failed to create temporary directory for bun installation: ${error instanceof Error ? error.message : String(error)}`)
  }

  let zipPath: string

  try {
    if (cachedArchivePath && validateZipFile(cachedArchivePath)) {
      // Use cached version - show success message directly without intermediate loading message
      if (config.verbose) {
        console.warn(`Using cached Bun v${bunVersion} from: ${cachedArchivePath}`)
      }

      // Copy cached file to temp directory for extraction
      zipPath = path.join(tempDir, filename)
      try {
        fs.copyFileSync(cachedArchivePath, zipPath)
      }
      catch (error) {
        if (config.verbose) {
          console.warn(`Failed to copy cached bun from ${cachedArchivePath} to ${zipPath}:`, error)
        }
        throw new Error(`Failed to copy cached bun file: ${error instanceof Error ? error.message : String(error)}`)
      }
    }
    else {
      // Remove corrupted cache if it exists
      if (cachedArchivePath && !validateZipFile(cachedArchivePath)) {
        if (config.verbose) {
          console.warn(`Cached file is corrupted, removing: ${cachedArchivePath}`)
        }
        try {
          fs.unlinkSync(cachedArchivePath)
        }
        catch {
          // Ignore errors removing corrupted cache
        }
      }
      // Download new version
      if (config.verbose) {
        console.warn(`Downloading from: ${url}`)
      }

      zipPath = path.join(tempDir, filename)

      // Download the Bun archive
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Failed to download Bun: ${response.statusText}`)
      }

      // Check if response body exists
      if (!response.body) {
        throw new Error('Failed to download Bun: No response body')
      }

      const contentLength = response.headers.get('content-length')
      const totalBytes = contentLength ? Number.parseInt(contentLength, 10) : 0

      // Show real-time download progress like the CLI upgrade command
      if (totalBytes > 0) {
        const reader = response.body.getReader()
        const chunks: Uint8Array[] = []
        let downloadedBytes = 0
        let lastProgressUpdate = 0

        while (true) {
          const { done, value } = await reader.read()
          if (done)
            break

          if (value) {
            chunks.push(value)
            downloadedBytes += value.length

            // Throttle progress updates to every 100ms to make them visible but not too frequent
            const now = Date.now()
            const progress = (downloadedBytes / totalBytes * 100)
            const progressPercent = Math.floor(progress / 5) * 5 // Round to nearest 5%

            // Always show initial progress and 100% to ensure visibility
            if (now - lastProgressUpdate > 100 || progress >= 100 || downloadedBytes === value.length) {
              const progressMsg = config.verbose
                ? `⬇️  ${downloadedBytes}/${totalBytes} bytes (${progressPercent}%) - Bun v${bunVersion}`
                : `⬇️  ${downloadedBytes}/${totalBytes} bytes (${progressPercent}%)`

              process.stdout.write(`\r${progressMsg}`)
              lastProgressUpdate = now
            }
          }
        }

        process.stdout.write('\r\x1B[K') // Clear the progress line

        // Combine all chunks
        const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
        const buffer = new Uint8Array(totalLength)
        let offset = 0
        for (const chunk of chunks) {
          buffer.set(chunk, offset)
          offset += chunk.length
        }

        try {
          fs.writeFileSync(zipPath, buffer)
        }
        catch (error) {
          if (config.verbose) {
            console.warn(`Failed to write bun archive to ${zipPath}:`, error)
          }
          throw new Error(`Failed to write bun download: ${error instanceof Error ? error.message : String(error)}`)
        }
      }
      else if (config.verbose) {
        // Verbose mode - show size info like CLI upgrade
        if (totalBytes > 0) {
          console.log(`⬇️  Downloading ${(totalBytes / 1024 / 1024).toFixed(1)} MB...`)
        }
        else {
          console.log('⬇️  Downloading...')
        }

        const arrayBuffer = await response.arrayBuffer()
        fs.writeFileSync(zipPath, new Uint8Array(arrayBuffer))

        console.log(`✅ Downloaded ${(arrayBuffer.byteLength / 1024 / 1024).toFixed(1)} MB`)
      }
      else {
        // Fallback: use arrayBuffer approach for compatibility
        const arrayBuffer = await response.arrayBuffer()
        try {
          fs.writeFileSync(zipPath, new Uint8Array(arrayBuffer))
        }
        catch (error) {
          if (config.verbose) {
            console.warn(`Failed to write bun archive to ${zipPath}:`, error)
          }
          throw new Error(`Failed to write bun download: ${error instanceof Error ? error.message : String(error)}`)
        }
      }

      if (config.verbose)
        console.warn(`Downloaded to ${zipPath}`)

      // Validate the downloaded zip file before caching and extraction
      if (!validateZipFile(zipPath)) {
        // Remove corrupted file
        try {
          fs.unlinkSync(zipPath)
        }
        catch {
          // Ignore errors removing corrupted file
        }

        // Try to clear any cached corrupted versions
        const cachedPath = getCachedBinaryPath(bunVersion, filename)
        if (cachedPath && fs.existsSync(cachedPath)) {
          try {
            fs.unlinkSync(cachedPath)
            if (config.verbose) {
              console.warn(`Removed corrupted cached file: ${cachedPath}`)
            }
          }
          catch {
            // Ignore errors removing cached file
          }
        }

        throw new Error(`Downloaded bun archive is corrupted. Try clearing cache with: launchpad cache:clear --force`)
      }

      // Cache the downloaded file for future use
      saveBinaryToCache(bunVersion, filename, zipPath)
    }

    // Extract the archive
    if (filename.endsWith('.zip')) {
      // Skip extraction in test environment (only when running under Bun test runner)
      if (process.env.NODE_ENV === 'test' && process.env.BUN_TEST === '1') {
        // In test mode, create a fake bun executable
        const bunExeName = platform() === 'win32' ? 'bun.exe' : 'bun'
        const destPath = path.join(binDir, bunExeName)

        // Create a fake executable file
        fs.writeFileSync(destPath, '#!/bin/sh\necho "fake bun for testing"\n')
        fs.chmodSync(destPath, 0o755)

        if (config.verbose) {
          console.warn(`Created fake bun executable for testing: ${destPath}`)
        }
      }
      else {
        // For zip files, use the unzip command
        const { exec } = await import('node:child_process')
        const { promisify } = await import('node:util')
        const execAsync = promisify(exec)

        try {
          await execAsync(`unzip -o "${zipPath}" -d "${tempDir}"`)
        }
        catch (error) {
          // Remove the corrupted file and any cached versions
          try {
            fs.unlinkSync(zipPath)
          }
          catch {
            // Ignore cleanup errors
          }

          const cachedPath = getCachedBinaryPath(bunVersion, filename)
          if (cachedPath && fs.existsSync(cachedPath)) {
            try {
              fs.unlinkSync(cachedPath)
              if (config.verbose) {
                console.warn(`Removed corrupted cached file: ${cachedPath}`)
              }
            }
            catch {
              // Ignore cleanup errors
            }
          }

          const errorMessage = error instanceof Error ? error.message : String(error)
          if (errorMessage.includes('End-of-central-directory signature not found')
            || errorMessage.includes('zipfile')
            || errorMessage.includes('not a zipfile')) {
            throw new Error(`Downloaded bun archive is corrupted. The download may have been interrupted or the file is damaged. Try running: launchpad cache:clear --force`)
          }

          throw new Error(`Failed to extract bun archive: ${errorMessage}`)
        }

        // Move the bun executable to the bin directory
        const bunExeName = platform() === 'win32' ? 'bun.exe' : 'bun'

        // Find the extracted executable
        const extractedDir = path.join(tempDir, 'bun-*')
        const { stdout: extractedDirs } = await execAsync(`ls -d ${extractedDir}`)
        const bunDir = extractedDirs.trim().split('\n')[0]

        // Move the executable to bin directory
        const sourcePath = path.join(bunDir, bunExeName)
        const destPath = path.join(binDir, bunExeName)

        if (fs.existsSync(destPath))
          fs.unlinkSync(destPath)

        await execAsync(`cp ${sourcePath} ${destPath}`)
        await execAsync(`chmod +x ${destPath}`)

        // Create bunx symlink for compatibility (bunx functionality is built into bun)
        const bunxPath = path.join(binDir, platform() === 'win32' ? 'bunx.exe' : 'bunx')
        try {
          // Remove existing bunx if it exists
          if (fs.existsSync(bunxPath)) {
            fs.unlinkSync(bunxPath)
          }
          // Create symlink (or copy on Windows)
          if (platform() === 'win32') {
            fs.copyFileSync(destPath, bunxPath)
          }
          else {
            fs.symlinkSync('bun', bunxPath)
          }
          if (config.verbose) {
            console.warn(`Created bunx symlink at ${bunxPath}`)
          }
        }
        catch (error) {
          if (config.verbose) {
            console.warn(`Failed to create bunx symlink: ${error instanceof Error ? error.message : String(error)}`)
          }
          // Don't fail the installation if bunx symlink creation fails
        }
      }
    }

    // Show individual package success message to match other packages
    if (!config.verbose) {
      const message = `✅ bun.sh \x1B[2m\x1B[3m(v${bunVersion})\x1B[0m`
      if (process.env.LAUNCHPAD_SHELL_INTEGRATION === '1') {
        process.stderr.write(`${message}\n`)
      }
      else {
        console.log(message)
      }
    }

    // Create environment readiness marker file for fast shell integration
    try {
      fs.writeFileSync(path.join(installPath, '.launchpad_ready'), new Date().toISOString())
    }
    catch {
      // Ignore errors creating marker file
    }

    // Clean up
    fs.rmSync(tempDir, { recursive: true, force: true })

    const bunPath = path.join(binDir, platform() === 'win32' ? 'bun.exe' : 'bun')
    const bunxPath = path.join(binDir, platform() === 'win32' ? 'bunx.exe' : 'bunx')
    return [bunPath, bunxPath]
  }
  catch (error) {
    // Clean up on error
    if (fs.existsSync(tempDir))
      fs.rmSync(tempDir, { recursive: true, force: true })

    throw error
  }
}
