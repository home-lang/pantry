import fs from 'node:fs'
import path from 'node:path'

/**
 * Core setup logic used by both setup and upgrade commands
 * Returns true if verification succeeded, false if it failed
 */
export async function performSetup(options: {
  targetVersion: string
  targetPath: string
  force?: boolean
  verbose?: boolean
}): Promise<boolean> {
  const { targetVersion, targetPath, force, verbose } = options

  // Validate version format
  if (targetVersion && !targetVersion.match(/^v?\d+\.\d+\.\d+$/)) {
    throw new Error(`Invalid version format: ${targetVersion}. Expected format: v0.3.6 or 0.3.6`)
  }

  // Check if target already exists
  if (fs.existsSync(targetPath) && !force) {
    try {
      const stats = fs.lstatSync(targetPath)
      let message = `File already exists at ${targetPath}`

      if (stats.isSymbolicLink()) {
        const linkTarget = fs.readlinkSync(targetPath)
        message = `Symlink already exists at ${targetPath} → ${linkTarget}`
      }

      throw new Error(`${message}\n\nOptions:\n• Use --force to overwrite\n• Choose a different --target path\n• Remove the existing file/symlink manually`)
    }
    catch (error) {
      if (error instanceof Error && error.message.includes('Options:')) {
        throw error
      }
      throw new Error(`Something already exists at ${targetPath}. Use --force to overwrite.`)
    }
  }

  // Detect platform and architecture
  const os = await import('node:os')
  const platform = os.platform()
  const arch = os.arch()

  let binaryName: string
  if (platform === 'darwin') {
    binaryName = arch === 'arm64' ? 'launchpad-darwin-arm64.zip' : 'launchpad-darwin-x64.zip'
  }
  else if (platform === 'linux') {
    binaryName = arch === 'arm64' ? 'launchpad-linux-arm64.zip' : 'launchpad-linux-x64.zip'
  }
  else if (platform === 'win32') {
    binaryName = 'launchpad-windows-x64.zip'
  }
  else {
    throw new Error(`Unsupported platform: ${platform}-${arch}\n\nSupported platforms:\n• macOS (arm64, x64)\n• Linux (arm64, x64)\n• Windows (x64)`)
  }

  if (verbose) {
    console.log(`📋 Platform: ${platform}-${arch}`)
    console.log(`🎯 Target: ${targetPath}`)
    console.log(`📌 Version: ${targetVersion}`)
  }

  // Download URL
  const downloadUrl = `https://github.com/stacksjs/launchpad/releases/download/${targetVersion}/${binaryName}`

  // Create temporary directory for download
  const tmpDir = path.join(os.tmpdir(), `launchpad-setup-${Date.now()}`)
  fs.mkdirSync(tmpDir, { recursive: true })

  const zipPath = path.join(tmpDir, binaryName)

  try {
    // Download the file
    const response = await globalThis.fetch(downloadUrl)
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Version ${targetVersion} not found. Please check available releases at: https://github.com/stacksjs/launchpad/releases`)
      }
      throw new Error(`Failed to download: ${response.status} ${response.statusText}`)
    }

    const contentLength = response.headers.get('content-length')
    const totalBytes = contentLength ? Number.parseInt(contentLength, 10) : 0

    // Show real-time download progress like Bun (silent by default)
    const reader = response.body?.getReader()
    const chunks: Uint8Array[] = []
    let downloadedBytes = 0

    if (reader && totalBytes > 0 && !verbose) {
      // Silent download with progress
      while (true) {
        const { done, value } = await reader.read()
        if (done)
          break

        if (value) {
          chunks.push(value)
          downloadedBytes += value.length

          // Show progress
          const progress = (downloadedBytes / totalBytes * 100).toFixed(0)
          process.stdout.write(`\r⬇️  ${downloadedBytes}/${totalBytes} bytes (${progress}%)`)
        }
      }
      process.stdout.write('\r\x1B[K') // Clear the progress line
    }
    else {
      // Verbose mode or fallback
      if (verbose) {
        if (totalBytes > 0) {
          console.log(`⬇️  Downloading ${(totalBytes / 1024 / 1024).toFixed(1)} MB...`)
        }
        else {
          console.log('⬇️  Downloading...')
        }
      }

      const buffer = await response.arrayBuffer()
      chunks.push(new Uint8Array(buffer))

      if (verbose) {
        console.log(`✅ Downloaded ${(chunks[0].length / 1024 / 1024).toFixed(1)} MB`)
      }
    }

    // Combine all chunks
    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
    const buffer = new Uint8Array(totalLength)
    let offset = 0
    for (const chunk of chunks) {
      buffer.set(chunk, offset)
      offset += chunk.length
    }

    fs.writeFileSync(zipPath, buffer)

    // Extract the zip file (silent by default)
    if (verbose) {
      console.log('📂 Extracting...')
    }

    const { execSync } = await import('node:child_process')

    try {
      execSync(`cd "${tmpDir}" && unzip -q "${binaryName}"`, { stdio: 'pipe' })
    }
    catch {
      throw new Error('Failed to extract zip file. Please ensure unzip is installed on your system.')
    }

    // Find the extracted binary
    const extractedFiles = fs.readdirSync(tmpDir).filter(f => f !== binaryName)
    let binaryFile = extractedFiles.find(f => f === 'launchpad' || f.startsWith('launchpad'))

    if (!binaryFile) {
      // Look in subdirectories
      for (const file of extractedFiles) {
        const filePath = path.join(tmpDir, file)
        if (fs.statSync(filePath).isDirectory()) {
          const subFiles = fs.readdirSync(filePath)
          const subBinary = subFiles.find(f => f === 'launchpad' || f.startsWith('launchpad'))
          if (subBinary) {
            binaryFile = path.join(file, subBinary)
            break
          }
        }
      }
    }

    if (!binaryFile) {
      throw new Error('Failed to find extracted binary in archive')
    }

    const sourceBinaryPath = path.join(tmpDir, binaryFile)

    // Ensure target directory exists
    const targetDir = path.dirname(targetPath)
    fs.mkdirSync(targetDir, { recursive: true })

    // Copy binary to target location
    fs.copyFileSync(sourceBinaryPath, targetPath)

    // Make executable (best-effort)
    try {
      fs.chmodSync(targetPath, 0o755)
    }
    catch {}

    // Basic verification: try to run --version (silent)
    const { execFileSync } = await import('node:child_process')
    try {
      execFileSync(targetPath, ['--version'], { stdio: 'pipe' })
      return true
    }
    catch {
      return false
    }
  }
  finally {
    // Cleanup temp directory
    try {
      fs.rmSync(path.dirname(zipPath), { recursive: true, force: true })
    }
    catch {}
  }
}
