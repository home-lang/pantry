/* eslint-disable no-console */
import type { SupportedArchitecture, SupportedPlatform } from './types'
import { Buffer } from 'node:buffer'
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { config } from './config'
import { install } from './install'
import { logUniqueMessage } from './logging'
import { resolvePackageName } from './package-resolution'
import { getArchitecture, getPlatform, install_prefix } from './utils'

/**
 * Custom installer for Meilisearch - downloads from GitHub releases
 */
export async function installMeilisearch(installPath: string, requestedVersion?: string): Promise<string[]> {
  const os = getPlatform()
  const architecture = getArchitecture()

  // Default to latest stable version if not specified
  const version = requestedVersion || 'v1.15.2'

  // Map platform and architecture to Meilisearch binary names
  let binaryName: string
  if (os === 'darwin') {
    binaryName = architecture === 'aarch64' ? 'meilisearch-macos-apple-silicon' : 'meilisearch-macos-amd64'
  }
  else if (os === 'linux') {
    binaryName = architecture === 'aarch64' ? 'meilisearch-linux-aarch64' : 'meilisearch-linux-amd64'
  }
  else if (os === 'windows') {
    binaryName = 'meilisearch-windows-amd64.exe'
  }
  else {
    throw new Error(`Unsupported platform for Meilisearch: ${os}/${architecture}`)
  }

  const downloadUrl = `https://github.com/meilisearch/meilisearch/releases/download/${version}/${binaryName}`
  const domain = 'meilisearch.com'
  const versionStr = version.replace(/^v/, '') // Remove 'v' prefix for directory name

  // Create installation directories
  const packageDir = path.join(installPath, domain, `v${versionStr}`)
  const binDir = path.join(packageDir, 'bin')
  const tempDir = path.join(installPath, '.tmp', `meilisearch-${versionStr}`)

  try {
    // Create directories
    await fs.promises.mkdir(tempDir, { recursive: true })
    await fs.promises.mkdir(binDir, { recursive: true })

    const tempBinaryPath = path.join(tempDir, binaryName)
    const finalBinaryPath = path.join(binDir, 'meilisearch')

    // Download the binary
    if (config.verbose) {
      console.warn(`Downloading Meilisearch ${version} from: ${downloadUrl}`)
    }

    logUniqueMessage(`🔄 Downloading meilisearch ${version}...`)

    const response = await globalThis.fetch(downloadUrl)
    if (!response.ok) {
      throw new Error(`Failed to download Meilisearch: ${response.status} ${response.statusText}`)
    }

    // Get file size for progress tracking
    const contentLength = response.headers.get('content-length')
    const totalBytes = contentLength ? Number.parseInt(contentLength, 10) : 0

    // Download with progress tracking
    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('Failed to get response reader')
    }

    const chunks: Uint8Array[] = []
    let downloadedBytes = 0

    while (true) {
      const { done, value } = await reader.read()
      if (done)
        break

      if (value) {
        chunks.push(value)
        downloadedBytes += value.length

        if (totalBytes > 0 && !config.verbose) {
          const progress = Math.round((downloadedBytes / totalBytes) * 100)
          logUniqueMessage(`🔄 Downloading meilisearch ${version}... ${progress}%`)
        }
      }
    }

    // Combine chunks and write to file
    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
    const buffer = new Uint8Array(totalLength)
    let offset = 0
    for (const chunk of chunks) {
      buffer.set(chunk, offset)
      offset += chunk.length
    }

    await fs.promises.writeFile(tempBinaryPath, buffer)

    // Copy to final location and make executable
    await fs.promises.copyFile(tempBinaryPath, finalBinaryPath)
    await fs.promises.chmod(finalBinaryPath, 0o755)

    // Create metadata
    const metadata = {
      domain,
      version: versionStr,
      binaries: ['meilisearch'],
      installedAt: new Date().toISOString(),
      platform: os,
      architecture,
      downloadUrl,
    }

    const metadataPath = path.join(packageDir, 'metadata.json')
    await fs.promises.writeFile(metadataPath, JSON.stringify(metadata, null, 2))

    // Clean up temp directory
    await fs.promises.rm(tempDir, { recursive: true, force: true })

    // Create binary stubs in main bin directory
    const mainBinDir = path.join(installPath, 'bin')
    await fs.promises.mkdir(mainBinDir, { recursive: true })

    const stubPath = path.join(mainBinDir, 'meilisearch')
    const stubContent = `#!/bin/bash
exec "${finalBinaryPath}" "$@"
`
    await fs.promises.writeFile(stubPath, stubContent)
    await fs.promises.chmod(stubPath, 0o755)

    logUniqueMessage(`✅ meilisearch \x1B[2m\x1B[3m(v${versionStr})\x1B[0m`)

    return [stubPath]
  }
  catch (error) {
    // Clean up on error
    try {
      await fs.promises.rm(tempDir, { recursive: true, force: true })
    }
    catch {
      // Ignore cleanup errors
    }
    throw error
  }
}

/**
 * Test if a PHP binary actually works (can run --version without dyld errors)
 */
export async function testPhpBinary(phpPath: string): Promise<boolean> {
  try {
    if (!fs.existsSync(phpPath)) {
      return false
    }

    // Test with a short timeout to avoid hanging on broken binaries
    const { execSync } = await import('node:child_process')
    execSync(`"${phpPath}" --version`, {
      stdio: 'pipe',
      timeout: 5000,
      env: { ...process.env },
    })
    return true
  }
  catch (error) {
    if (config.verbose) {
      console.warn(`PHP binary test failed: ${error instanceof Error ? error.message : String(error)}`)
    }
    return false
  }
}

/**
 * Build SQLite from source
 */
export async function buildSqliteFromSource(installPath: string, requestedVersion?: string): Promise<string[]> {
  const version = requestedVersion || '3.50.4'
  const domain = 'sqlite.org'

  logUniqueMessage(`🔄 Building SQLite ${version} from source...`)

  // Create a source build directory
  const sourceDir = path.join(installPath, '.tmp', `sqlite-source-${version}`)
  await fs.promises.rm(sourceDir, { recursive: true, force: true })
  await fs.promises.mkdir(sourceDir, { recursive: true })

  try {
    // Download SQLite source
    logUniqueMessage(`📦 Downloading SQLite ${version} source...`)
    const sourceUrl = `https://www.sqlite.org/2024/sqlite-autoconf-3500400.tar.gz`
    const response = await fetch(sourceUrl)

    if (!response.ok) {
      throw new Error(`Failed to download SQLite source: ${response.status}`)
    }

    const tarPath = path.join(sourceDir, 'sqlite.tar.gz')
    await fs.promises.writeFile(tarPath, Buffer.from(await response.arrayBuffer()))

    // Extract source
    logUniqueMessage(`📂 Extracting SQLite ${version} source...`)
    execSync(`cd "${sourceDir}" && tar -xzf sqlite.tar.gz`, { stdio: 'inherit' })

    // Find the extracted directory
    const extractedDir = path.join(sourceDir, 'sqlite-autoconf-3500400')

    // Configure
    logUniqueMessage(`⚙️  Configuring SQLite ${version} build...`)
    const packageDir = path.join(installPath, domain, `v${version}`)
    await fs.promises.mkdir(packageDir, { recursive: true })

    execSync(`cd "${extractedDir}" && ./configure --prefix="${packageDir}" --enable-fts5 --enable-json1`, {
      stdio: 'inherit',
    })

    // Build
    logUniqueMessage(`🔨 Compiling SQLite ${version}...`)
    const { cpus } = await import('node:os')
    const makeJobs = cpus().length
    execSync(`cd "${extractedDir}" && make -j${makeJobs}`, {
      stdio: 'inherit',
    })

    // Install
    logUniqueMessage(`📦 Installing SQLite ${version}...`)
    execSync(`cd "${extractedDir}" && make install`, {
      stdio: 'inherit',
    })

    // Cleanup
    await fs.promises.rm(sourceDir, { recursive: true, force: true })

    return [`${packageDir}/bin/sqlite3`]
  }
  catch (error) {
    // Cleanup on error
    await fs.promises.rm(sourceDir, { recursive: true, force: true })

    const errorMessage = `SQLite ${version} source build failed: ${
      error instanceof Error ? error.message : String(error)
    }`
    throw new Error(errorMessage)
  }
}

/**
 * Install only the dependencies of packages, not the packages themselves
 * Useful for setting up build environments without installing the main package
 */
export async function installDependenciesOnly(packages: string[], installPath?: string): Promise<string[]> {
  if (!packages || packages.length === 0) {
    console.log('No packages specified for dependency installation')
    return []
  }

  const targetPath = installPath || install_prefix().string
  console.log(`🔧 Installing dependencies only for: ${packages.join(', ')}`)

  // Create installation directory
  await fs.promises.mkdir(targetPath, { recursive: true })

  const allInstalledFiles: string[] = []
  // const totalDepsProcessed = 0
  let totalDepsAlreadyInstalled = 0

  try {
    // Import pantry from ts-pkgx to get package dependencies
    const { pantry } = await import('ts-pkgx')

    for (const packageName of packages) {
      // Resolve package name to domain
      const domain = resolvePackageName(packageName)

      // Try different ways to find the package in pantry
      // For PHP, we need to check php.net specifically
      let packageKey: string | undefined

      // First, try exact matches
      packageKey = Object.keys(pantry).find(key => key === domain || key === packageName)

      // Handle PHP special case - check phpnet specifically
      if (!packageKey && packageName === 'php') {
        packageKey = Object.keys(pantry).find(key => key === 'phpnet')
      }

      // Fallback to partial matches only if no exact match found
      if (!packageKey) {
        packageKey = Object.keys(pantry).find(key =>
          key.includes(packageName) || key.includes(domain.split('.')[0]),
        )
      }

      const packageSpec = packageKey ? pantry[packageKey as keyof typeof pantry] : null

      if (!packageSpec || !packageSpec.dependencies) {
        console.warn(`⚠️ Package ${packageName} not found in pantry or has no dependencies`)
        continue
      }

      if (config.verbose) {
        console.log(`📋 ${packageName} has ${packageSpec.dependencies.length} dependencies: ${packageSpec.dependencies.join(', ')}`)
      }

      // Filter out problematic dependencies - these are now included since source builds don't exist
      const skipPatterns: string[] = [
        // Only skip dependencies that are truly problematic or incompatible
      ]

      const filteredDeps = packageSpec.dependencies.filter((dep: string) =>
        !skipPatterns.some(pattern => dep.includes(pattern)),
      )

      if (filteredDeps.length === 0) {
        console.log(`✅ No installable dependencies found for ${packageName}`)
        continue
      }

      // Filter out already installed dependencies and the main package itself
      const depsToInstall = filteredDeps.filter((dep: string) => {
        const depDomain = dep.split(/[<>=~^]/)[0]

        // Skip if this dependency is the same as the main package we're installing deps for
        if (depDomain === domain || depDomain === packageName
          || (packageName === 'php' && depDomain === 'php.net')
          || (domain === 'php.net' && depDomain === 'php.net')) {
          if (config.verbose) {
            console.log(`⏭️  Skipping ${dep} (this is the main package, not a dependency)`)
          }
          return false
        }

        const depInstallPath = path.join(targetPath, depDomain)
        const alreadyInstalled = fs.existsSync(depInstallPath)
        if (alreadyInstalled) {
          totalDepsAlreadyInstalled++
          if (config.verbose) {
            console.log(`✅ ${dep} already installed`)
          }
        }
        return !alreadyInstalled
      })

      // totalDepsProcessed += filteredDeps.length

      if (depsToInstall.length === 0) {
        if (config.verbose) {
          console.log(`✅ All ${filteredDeps.length} dependencies for ${packageName} already installed`)
        }
        continue
      }

      console.log(`📦 Installing ${depsToInstall.length} new dependencies for ${packageName}...`)
      if (config.verbose) {
        console.log(`   Dependencies to install: ${depsToInstall.join(', ')}`)
      }

      try {
        // Install dependencies using the main install function
        const installedFiles = await install(depsToInstall, targetPath)
        allInstalledFiles.push(...installedFiles)

        if (config.verbose) {
          console.log(`✅ Successfully installed ${depsToInstall.length} dependencies for ${packageName}`)
        }
      }
      catch {
        console.warn(`⚠️ Some dependencies for ${packageName} failed to install, trying individual installation`)

        // Fallback to individual installation
        for (const dep of depsToInstall) {
          try {
            const depFiles = await install([dep], targetPath)
            allInstalledFiles.push(...depFiles)
            if (config.verbose) {
              console.log(`✅ Installed ${dep}`)
            }
          }
          catch (depError) {
            console.warn(`⚠️ Warning: Could not install dependency ${dep}:`, depError instanceof Error ? depError.message : String(depError))
          }
        }
      }
    }

    // Improved final message
    if (allInstalledFiles.length > 0) {
      console.log(`🎉 Dependencies installation complete. Installed ${allInstalledFiles.length} files for ${packages.join(', ')}.`)
    }
    else if (totalDepsAlreadyInstalled > 0) {
      console.log(`✅ All ${totalDepsAlreadyInstalled} dependencies for ${packages.join(', ')} were already installed.`)
    }
    else {
      console.log(`ℹ️  No dependencies found to install for ${packages.join(', ')}.`)
    }

    return allInstalledFiles
  }
  catch (error) {
    console.warn(`⚠️ Failed to import ts-pkgx or process dependencies: ${error instanceof Error ? error.message : String(error)}`)
    return []
  }
}
