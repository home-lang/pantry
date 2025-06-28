import fs, { existsSync } from 'node:fs'
import { homedir, platform } from 'node:os'
import path, { join } from 'node:path'
import process from 'node:process'
import { config } from './config'

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

export function getDataDir(): string {
  const xdgDataHome = process.env.XDG_DATA_HOME
  if (xdgDataHome) {
    return path.join(xdgDataHome, 'launchpad', 'dev')
  }

  const home = process.env.HOME || process.env.USERPROFILE
  if (!home) {
    throw new Error('Could not determine home directory')
  }

  switch (platform()) {
    case 'darwin':
      return path.join(home, 'Library', 'Application Support', 'launchpad', 'dev')
    case 'win32': {
      const localAppData = process.env.LOCALAPPDATA
      if (localAppData) {
        return path.join(localAppData, 'launchpad', 'dev')
      }
      return path.join(home, 'AppData', 'Local', 'launchpad', 'dev')
    }
    default:
      return path.join(home, '.local', 'share', 'launchpad', 'dev')
  }
}

export async function checkDevStatus(): Promise<boolean> {
  const cwd = process.cwd()
  const dataDir = getDataDir()
  const activationFile = path.join(dataDir, cwd.slice(1), 'dev.launchpad.activated')

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

        if (entry.isDirectory()) {
          walkDir(fullPath, relativePath)
        }
        else if (entry.isFile() && entry.name === 'dev.launchpad.activated') {
          // Convert back to absolute path
          const envPath = path.join('/', basePath)
          activeEnvs.push(envPath)
        }
      }
    }
    catch {
      // Ignore directories we can't read
    }
  }

  walkDir(dataDir)
  return activeEnvs
}

export async function deactivateDevEnv(): Promise<boolean> {
  const cwd = process.cwd()
  const dataDir = getDataDir()
  const activationDir = path.join(dataDir, cwd.slice(1))
  const activationFile = path.join(activationDir, 'dev.launchpad.activated')

  if (fs.existsSync(activationFile)) {
    try {
      fs.unlinkSync(activationFile)

      // Clean up empty directories
      try {
        fs.rmdirSync(activationDir)
      }
      catch {
        // Directory not empty, that's fine
      }

      return true
    }
    catch {
      return false
    }
  }

  return false
}

export async function activateDevEnv(targetDir: string): Promise<boolean> {
  const dataDir = getDataDir()
  const activationDir = path.join(dataDir, targetDir.slice(1))
  const activationFile = path.join(activationDir, 'dev.launchpad.activated')

  try {
    fs.mkdirSync(activationDir, { recursive: true })
    fs.writeFileSync(activationFile, new Date().toISOString())
    return true
  }
  catch {
    return false
  }
}

// Binary path cache for performance optimization
const binaryPathCache = new Map<string, string | null>()
const cacheTimestamps = new Map<string, number>()
const BINARY_CACHE_TTL = 30000 // 30 seconds cache TTL

/**
 * Clear stale binary path cache entries
 */
function clearStaleBinaryCache(): void {
  const now = Date.now()
  for (const [key, timestamp] of cacheTimestamps) {
    if (now - timestamp > BINARY_CACHE_TTL) {
      binaryPathCache.delete(key)
      cacheTimestamps.delete(key)
    }
  }
}

/**
 * Find binary in PATH with caching for performance
 */
export function findBinaryInPath(binaryName: string): string | null {
  clearStaleBinaryCache()

  // Check cache first
  const cached = binaryPathCache.get(binaryName)
  if (cached !== undefined) {
    return cached
  }

  const pathEnv = process.env.PATH || ''
  const pathSeparator = process.platform === 'win32' ? ';' : ':'
  const pathDirs = pathEnv.split(pathSeparator)

  // Common binary extensions on Windows
  const extensions = process.platform === 'win32' ? ['.exe', '.cmd', '.bat', ''] : ['']

  for (const dir of pathDirs) {
    if (!dir)
      continue

    for (const ext of extensions) {
      const fullPath = join(dir, binaryName + ext)
      if (existsSync(fullPath)) {
        // Cache the result
        binaryPathCache.set(binaryName, fullPath)
        cacheTimestamps.set(binaryName, Date.now())
        return fullPath
      }
    }
  }

  // Cache the null result to avoid repeated lookups
  binaryPathCache.set(binaryName, null)
  cacheTimestamps.set(binaryName, Date.now())
  return null
}

/**
 * Clear binary path cache (useful for testing or when PATH changes)
 */
export function clearBinaryPathCache(): void {
  binaryPathCache.clear()
  cacheTimestamps.clear()
}
