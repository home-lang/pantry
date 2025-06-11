import type { LaunchpadConfig } from './src/types'

export const defaultConfig: LaunchpadConfig = {
  // Set to true for additional log information
  verbose: false,

  // Path where binaries should be installed
  // Defaults to /usr/local if writable, otherwise ~/.local
  installationPath: '/usr/local',

  // Sudo password for installations requiring sudo
  // Can also be specified in .env file as SUDO_PASSWORD
  sudoPassword: '',

  // Enable dev-aware installations
  // When true, packages installed to /usr/local with dev package present
  // will be dev-aware (will respect the current dev environment)
  devAware: true,

  // Auto-elevate with sudo when needed
  autoSudo: true,

  // Max installation retries on failure
  maxRetries: 3,

  // Timeout for pkgx operations in milliseconds
  timeout: 60000, // 60 seconds

  // Whether to symlink versions (e.g., create v1 symlink for v1.2.3)
  symlinkVersions: true,

  // Whether to force reinstall if already installed
  forceReinstall: false,

  // Default path for shims
  shimPath: '~/.local/bin',

  // Whether to automatically add shim path to the system PATH
  autoAddToPath: true,

  // Whether to show shell environment activation messages
  showShellMessages: true,

  // Custom message to show when environment is activated
  // Use {path} placeholder to include the project path
  shellActivationMessage: '✅ Environment activated for {path}',

  // Custom message to show when environment is deactivated
  shellDeactivationMessage: 'dev environment deactivated',
}

/**
 * Launchpad configuration
 *
 * This file configures how launchpad installs and manages packages.
 */
const config: LaunchpadConfig = defaultConfig

export default config
