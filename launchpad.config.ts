import type { LaunchpadOptions } from './packages/launchpad/src/types'
import process from 'node:process'

const config: LaunchpadOptions = {
  verbose: false,
  // installationPath will be auto-detected based on permissions
  sudoPassword: process.env.SUDO_PASSWORD || '',
  devAware: true,
  autoSudo: true,
  maxRetries: 3,
  timeout: 60000,
  symlinkVersions: true,
  forceReinstall: false,
  shimPath: '~/.local/bin',
  autoAddToPath: true,
}

export default config
