import { homedir, platform } from 'node:os'
import process from 'node:process'

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
