import fs from 'node:fs'
import { homedir, platform } from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { config } from './config'
import { Path } from './path'

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
      if (!configContent.includes(exportLine)
        && !configContent.includes(`PATH="${dir}:`)
        && !configContent.includes(`PATH=${dir}:`)) {
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
