import type { LaunchpadConfig } from './src/types'

export const defaultConfig: LaunchpadConfig = {
  // Whether to show verbose output
  verbose: false,

  // Installation path for packages
  installPath: '/usr/local',

  // Installation method - 'direct' for direct downloads, 'registry' for package registry
  installMethod: 'curl',

  // Whether to use package registry instead of direct downloads
  useRegistry: false,

  // Sudo password for installations requiring sudo
  // Can also be specified in .env file as SUDO_PASSWORD
  sudoPassword: '',

  // Enable dev-aware installations
  // When true, packages installed to /usr/local with dev package present
  // will be dev-aware (will respect the current dev environment)
  devAware: true,

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

  // Service management configuration
  services: {
    enabled: true,
    dataDir: '~/.local/share/launchpad/services',
    logDir: '~/.local/share/launchpad/logs',
    configDir: '~/.local/share/launchpad/services/config',
    autoRestart: true,
    startupTimeout: 30,
    shutdownTimeout: 10,
    database: {
      username: 'root',
      password: 'password',
      authMethod: 'trust',
    },
    php: {
      enabled: true,
      version: '8.4.11',
    },
  },
}

/**
 * Launchpad configuration
 *
 * This file configures how launchpad installs and manages packages.
 */
const config: LaunchpadConfig = defaultConfig

export default config
