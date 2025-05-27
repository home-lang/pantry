import type { Path } from '../src/path'
import { exec } from 'node:child_process'
import fs from 'node:fs'
import { homedir, platform } from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { promisify } from 'node:util'
import { config } from './config'

const execAsync = promisify(exec)

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
 * Check if a path is already in the PATH environment variable
 */
export function isInPath(dir: string): boolean {
  const PATH = process.env.PATH || ''
  return PATH.split(path.delimiter).includes(dir)
}

/**
 * Check if a directory is a temporary directory that shouldn't be added to shell configuration
 */
export function isTemporaryDirectory(dir: string): boolean {
  const normalizedDir = path.normalize(dir).toLowerCase()

  // Common temporary directory patterns
  const tempPatterns = [
    '/tmp/',
    '/temp/',
    '\\tmp\\',
    '\\temp\\',
    'launchpad-test-',
    '/var/folders/', // macOS temp directories
    process.env.TMPDIR?.toLowerCase() || '',
    process.env.TEMP?.toLowerCase() || '',
    process.env.TMP?.toLowerCase() || '',
  ].filter(Boolean)

  return tempPatterns.some(pattern => normalizedDir.includes(pattern))
}

/**
 * Add a directory to the user's PATH in their shell configuration file
 * @param dir Directory to add to PATH
 * @returns Whether the operation was successful
 */
export function addToPath(dir: string): boolean {
  if (!config.autoAddToPath) {
    if (config.verbose)
      console.warn('Skipping adding to PATH (autoAddToPath is disabled)')

    return false
  }

  // Don't add temporary directories to shell configuration
  if (isTemporaryDirectory(dir)) {
    if (config.verbose)
      console.warn(`Skipping temporary directory: ${dir}`)

    return false
  }

  try {
    // Handle Windows differently
    if (platform() === 'win32') {
      return addToWindowsPath(dir)
    }

    // Unix systems
    const home = process.env.HOME || process.env.USERPROFILE || '~'
    if (home === '~') {
      if (config.verbose)
        console.warn('Could not determine home directory')

      return false
    }

    const exportLine = `export PATH="${dir}:$PATH"`

    // Determine which shell configuration file to use
    let shellConfigFile = ''

    // Check for zsh
    if (fs.existsSync(path.join(home, '.zshrc'))) {
      shellConfigFile = path.join(home, '.zshrc')
    }
    // Check for bash
    else if (fs.existsSync(path.join(home, '.bashrc'))) {
      shellConfigFile = path.join(home, '.bashrc')
    }
    else if (fs.existsSync(path.join(home, '.bash_profile'))) {
      shellConfigFile = path.join(home, '.bash_profile')
    }

    if (shellConfigFile) {
      // Check if the export line already exists
      const configContent = fs.readFileSync(shellConfigFile, 'utf-8')

      // More comprehensive check for existing PATH entries
      const pathAlreadyExists = configContent.includes(exportLine)
        || configContent.includes(`PATH="${dir}:`)
        || configContent.includes(`PATH=${dir}:`)
        || configContent.includes(`PATH="$PATH:${dir}"`)
        || configContent.includes(`PATH=$PATH:${dir}`)
        || configContent.match(new RegExp(`PATH="[^"]*${dir.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^"]*"`))
        || configContent.match(new RegExp(`PATH=[^\\s]*${dir.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^\\s]*`))

      if (!pathAlreadyExists) {
        fs.appendFileSync(shellConfigFile, `\n# Added by launchpad\n${exportLine}\n`)

        if (config.verbose)
          console.warn(`Added ${dir} to your PATH in ${shellConfigFile}`)

        return true
      }

      if (config.verbose)
        console.warn(`${dir} is already in PATH configuration`)

      return true
    }

    if (config.verbose)
      console.warn('Could not find shell configuration file')

    return false
  }
  catch (error) {
    if (config.verbose)
      console.error(`Could not update shell configuration: ${error instanceof Error ? error.message : String(error)}`)

    return false
  }
}

/**
 * Add a directory to the Windows PATH environment variable
 * @param dir Directory to add to PATH
 * @returns Whether the operation was successful
 */
function addToWindowsPath(dir: string): boolean {
  try {
    if (config.verbose)
      console.warn('Adding to Windows PATH requires running a PowerShell command with administrator privileges')

    // We can't directly modify the registry, but we can provide instructions
    console.warn('To add this directory to your PATH on Windows, run the following in an Administrator PowerShell:')
    console.warn(`[System.Environment]::SetEnvironmentVariable('PATH', $env:PATH + ';${dir.replace(/\//g, '\\')}', [System.EnvironmentVariableTarget]::Machine)`)

    // We return false since we're just providing instructions
    return false
  }
  catch (error) {
    if (config.verbose)
      console.error(`Error providing Windows PATH instructions: ${error instanceof Error ? error.message : String(error)}`)

    return false
  }
}

/**
 * Get the user's current shell
 */
export function getUserShell(): string {
  return process.env.SHELL || ''
}

// Helper function to ensure pkgx is installed
export async function ensurePkgxInstalled(installPath: Path): Promise<void> {
  try {
    // Check if pkgx is already available
    const { stdout } = await execAsync('command -v pkgx', { encoding: 'utf8' })
    if (stdout.trim()) {
      return // pkgx is already installed
    }
  }
  catch {
    // pkgx is not installed, proceed with installation
  }

  // eslint-disable-next-line no-console
  console.log('pkgx not found. Installing pkgx from GitHub releases...')

  try {
    await downloadAndInstallPkgx(installPath)
    // eslint-disable-next-line no-console
    console.log('✅ pkgx has been successfully installed!')

    // Check if pkgx is in PATH after installation
    try {
      const { stdout } = await execAsync('command -v pkgx', { encoding: 'utf8' })
      // eslint-disable-next-line no-console
      console.log(`pkgx is now available at: ${stdout.trim()}`)
    }
    catch {
      const binDir = path.join(installPath.string, 'bin')
      console.warn('pkgx is installed but not in your PATH.')
      console.warn(`Make sure ${binDir} is in your PATH.`)
      console.warn('You may need to restart your shell or run: source ~/.bashrc (or ~/.zshrc)')
    }
  }
  catch (error) {
    throw new Error(`Failed to install pkgx: ${error instanceof Error ? error.message : error}`)
  }
}

// Helper function to download and install pkgx from GitHub releases
export async function downloadAndInstallPkgx(installPath: Path): Promise<void> {
  const version = '2.7.0'
  const os = platform()
  const arch = process.arch

  // Determine the correct binary filename
  let binaryName: string
  if (os === 'darwin') {
    if (arch === 'arm64') {
      binaryName = `pkgx-${version}+darwin+aarch64.tar.gz`
    }
    else {
      binaryName = `pkgx-${version}+darwin+x86-64.tar.gz`
    }
  }
  else if (os === 'linux') {
    if (arch === 'arm64') {
      binaryName = `pkgx-${version}+linux+aarch64.tar.gz`
    }
    else {
      binaryName = `pkgx-${version}+linux+x86-64.tar.gz`
    }
  }
  else if (os === 'win32') {
    binaryName = `pkgx-${version}+windows+x86-64.zip`
  }
  else {
    throw new Error(`Unsupported platform: ${os}`)
  }

  const downloadUrl = `https://github.com/pkgxdev/pkgx/releases/download/v${version}/${binaryName}`
  const binDir = path.join(installPath.string, 'bin')
  const tempDir = path.join(installPath.string, '.tmp')
  const tempFile = path.join(tempDir, binaryName)

  // Create necessary directories
  fs.mkdirSync(binDir, { recursive: true })
  fs.mkdirSync(tempDir, { recursive: true })

  if (config.verbose) {
    // eslint-disable-next-line no-console
    console.log(`Downloading: ${downloadUrl}`)
    // eslint-disable-next-line no-console
    console.log(`To: ${tempFile}`)
  }

  try {
    // Download the binary using system curl (avoiding broken shims)
    let curlCmd = 'curl'
    // Try to find system curl in common locations
    const systemCurlPaths = ['/usr/bin/curl', '/bin/curl', '/usr/local/bin/curl']
    for (const curlPath of systemCurlPaths) {
      if (fs.existsSync(curlPath)) {
        curlCmd = curlPath
        break
      }
    }

    await execAsync(`${curlCmd} -fsSL "${downloadUrl}" -o "${tempFile}"`)

    // Extract the archive
    if (binaryName.endsWith('.tar.gz')) {
      await execAsync(`tar -xzf "${tempFile}" -C "${tempDir}"`)
    }
    else if (binaryName.endsWith('.zip')) {
      await execAsync(`unzip -q "${tempFile}" -d "${tempDir}"`)
    }

    // Find the pkgx binary in the extracted files
    const extractedFiles = fs.readdirSync(tempDir, { recursive: true, withFileTypes: true })
    let pkgxBinaryPath: string | null = null

    for (const file of extractedFiles) {
      if (file.isFile() && (file.name === 'pkgx' || file.name === 'pkgx.exe')) {
        pkgxBinaryPath = path.join(file.path || tempDir, file.name)
        break
      }
    }

    if (!pkgxBinaryPath || !fs.existsSync(pkgxBinaryPath)) {
      throw new Error('pkgx binary not found in downloaded archive')
    }

    // Move the binary to the bin directory
    const targetBinary = path.join(binDir, os === 'win32' ? 'pkgx.exe' : 'pkgx')
    fs.copyFileSync(pkgxBinaryPath, targetBinary)

    // Make it executable on Unix-like systems
    if (os !== 'win32') {
      fs.chmodSync(targetBinary, 0o755)
    }

    if (config.verbose) {
      // eslint-disable-next-line no-console
      console.log(`Installed pkgx binary to: ${targetBinary}`)
    }
  }
  finally {
    // Clean up temporary files
    try {
      fs.rmSync(tempDir, { recursive: true, force: true })
    }
    catch {
      // Ignore cleanup errors
    }
  }
}

export function getDataDir(): string {
  const xdgDataHome = process.env.XDG_DATA_HOME
  if (xdgDataHome) {
    return path.join(xdgDataHome, 'pkgx', 'dev')
  }

  const home = process.env.HOME || process.env.USERPROFILE
  if (!home) {
    throw new Error('Could not determine home directory')
  }

  switch (platform()) {
    case 'darwin':
      return path.join(home, 'Library', 'Application Support', 'pkgx', 'dev')
    case 'win32': {
      const localAppData = process.env.LOCALAPPDATA
      if (localAppData) {
        return path.join(localAppData, 'pkgx', 'dev')
      }
      return path.join(home, 'AppData', 'Local', 'pkgx', 'dev')
    }
    default:
      return path.join(home, '.local', 'share', 'pkgx', 'dev')
  }
}

export async function checkDevStatus(): Promise<boolean> {
  const cwd = process.cwd()
  const dataDir = getDataDir()
  const activationFile = path.join(dataDir, cwd.slice(1), 'dev.pkgx.activated')

  return fs.existsSync(activationFile)
}

export async function listActiveDevEnvs(): Promise<string[]> {
  const dataDir = getDataDir()
  const activeEnvs: string[] = []

  if (!fs.existsSync(dataDir)) {
    return activeEnvs
  }

  function walkDir(dir: string, basePath: string = ''): void {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)
        const relativePath = path.join(basePath, entry.name)

        if (entry.isFile() && entry.name === 'dev.pkgx.activated') {
          activeEnvs.push(`/${path.dirname(relativePath)}`)
        }
        else if (entry.isDirectory()) {
          walkDir(fullPath, relativePath)
        }
      }
    }
    catch {
      // Ignore errors reading directories
    }
  }

  walkDir(dataDir)
  return activeEnvs
}

export async function deactivateDevEnv(): Promise<boolean> {
  let dir = process.cwd()
  const dataDir = getDataDir()

  while (dir !== '/' && dir !== '.') {
    const activationFile = path.join(dataDir, dir.slice(1), 'dev.pkgx.activated')

    if (fs.existsSync(activationFile)) {
      fs.unlinkSync(activationFile)
      // eslint-disable-next-line no-console
      console.log(`Deactivated dev environment: ${dir}`)
      return true
    }

    dir = path.dirname(dir)
  }

  return false
}

export async function activateDevEnv(targetDir: string): Promise<boolean> {
  // Import sniff function to detect development files
  const { default: sniff } = await import('./dev/sniff.ts')

  try {
    const { pkgs } = await sniff({ string: targetDir })

    if (pkgs.length === 0) {
      return false
    }

    const dataDir = getDataDir()
    const activationDir = path.join(dataDir, targetDir.slice(1))
    const activationFile = path.join(activationDir, 'dev.pkgx.activated')

    // Create directory structure
    fs.mkdirSync(activationDir, { recursive: true })

    // Create activation file
    fs.writeFileSync(activationFile, '')

    // eslint-disable-next-line no-console
    console.log(`Detected packages: ${pkgs.map(pkg => `${pkg.project}@${pkg.constraint}`).join(' ')}`)
    return true
  }
  catch (error) {
    console.warn('Failed to sniff directory:', error instanceof Error ? error.message : error)
    return false
  }
}
