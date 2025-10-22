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
  shellDeactivationMessage: 'Environment deactivated',

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
  },

  // Package dependencies (similar to deps.yaml functionality)
  // Uncomment to declare dependencies directly in the config file
  // This eliminates the need for a separate deps.yaml file
  //
  // ✨ FULLY TYPED with ts-pkgx package names and versions!
  //
  // Option 1: Simple object format (works but limited type safety)
  // dependencies: {
  //   'bun.com': '^1.2.19',
  //   'redisio': '^8.0.0',
  //   'postgresqlorg': '^17.0.0',
  // },
  //
  // Option 2: Fully typed with helper function (RECOMMENDED)
  // import { defineDependencies, dep } from '@stacksjs/launchpad'
  // dependencies: defineDependencies({
  //   'bun.com': dep('^1.2.19'),        // Full IntelliSense + precise error highlighting!
  //   'nodejsorg': dep('^22.0.0'),      // Node.js (note: 'nodejsorg' not 'nodejs.org')
  //   'pythonorg': dep('^3.12.0'),      // Python
  //   'redisio': {
  //     version: '^8.0.0',              // Object format also works
  //     global: true,                   // Install this package globally
  //   },
  //   'postgresqlorg': dep('^17.0.0'),  // PostgreSQL
  // }),
  //
  // Option 3: Array format (uses latest versions) - fully typed!
  // import { definePackageList } from '@stacksjs/launchpad'
  // dependencies: definePackageList(['bun.com', 'nodejsorg', 'pythonorg']),
  //
  // Example 3: String format (space-separated, uses latest versions)
  // dependencies: 'bun.com nodejsorg pythonorg',
  //
  // Global flag (applies to all dependencies unless overridden individually)
  // global: false,
}

/**
 * Launchpad configuration
 *
 * This file configures how launchpad installs and manages packages.
 */
const config: LaunchpadConfig = defaultConfig

export default config
