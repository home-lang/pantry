import type { LaunchpadConfig } from './types'
import fs from 'node:fs'
import { homedir } from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { loadConfig } from 'bunfig'

function getDefaultInstallPath(): string {
  // Check for environment variable first
  if (process.env.LAUNCHPAD_INSTALL_PATH) {
    return process.env.LAUNCHPAD_INSTALL_PATH
  }

  // if /usr/local is writable, use that
  try {
    const testPath = path.join('/usr/local', '.writable_test')
    fs.mkdirSync(testPath, { recursive: true })
    fs.rmdirSync(testPath)
    return '/usr/local'
  }
  catch {
    const homePath = process.env.HOME || process.env.USERPROFILE || '~'
    return path.join(homePath, '.local')
  }
}

function getDefaultShimPath(): string {
  // Check for environment variable first
  if (process.env.LAUNCHPAD_SHIM_PATH) {
    return process.env.LAUNCHPAD_SHIM_PATH
  }

  const homePath = process.env.HOME || process.env.USERPROFILE || '~'
  return path.join(homePath, '.local', 'bin')
}

export const defaultConfig: LaunchpadConfig = {
  verbose: process.env.LAUNCHPAD_VERBOSE === 'true' || process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true' || false,
  sudoPassword: process.env.SUDO_PASSWORD || '',
  devAware: true,
  maxRetries: process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true' ? 5 : 3,
  timeout: process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true' ? 120000 : 60000, // 2 minutes in CI, 1 minute locally
  symlinkVersions: true,
  forceReinstall: false,
  shimPath: getDefaultShimPath(),
  autoAddToPath: process.env.LAUNCHPAD_AUTO_ADD_PATH !== 'false',
  showShellMessages: process.env.LAUNCHPAD_SHOW_ENV_MESSAGES !== 'false',
  shellActivationMessage: process.env.LAUNCHPAD_SHELL_ACTIVATION_MESSAGE || '✅ Environment activated for \x1B[3m{path}\x1B[0m',
  shellDeactivationMessage: process.env.LAUNCHPAD_SHELL_DEACTIVATION_MESSAGE || '⚪ Environment deactivated',
  useRegistry: true,
  installMethod: 'curl',
  installPath: getDefaultInstallPath(),
  // By default, do NOT install runtime dependencies unless explicitly enabled
  installDependencies: process.env.LAUNCHPAD_INSTALL_DEPS === '1' || process.env.LAUNCHPAD_INSTALL_DEPS === 'true' || false,
  // By default, do NOT install build-time dependencies (pantry/build deps)
  installBuildDeps: process.env.LAUNCHPAD_INSTALL_BUILD_DEPS === '1' || process.env.LAUNCHPAD_INSTALL_BUILD_DEPS === 'true' || false,
  postSetup: {
    enabled: process.env.LAUNCHPAD_POST_SETUP_ENABLED !== 'false',
    commands: [],
  },
  preSetup: {
    enabled: process.env.LAUNCHPAD_PRE_SETUP_ENABLED !== 'false',
    commands: [],
  },
  preActivation: {
    enabled: process.env.LAUNCHPAD_PRE_ACTIVATION_ENABLED !== 'false',
    commands: [],
  },
  postActivation: {
    enabled: process.env.LAUNCHPAD_POST_ACTIVATION_ENABLED !== 'false',
    commands: [],
  },
  services: {
    enabled: process.env.LAUNCHPAD_SERVICES_ENABLED !== 'false',
    dataDir: process.env.LAUNCHPAD_SERVICES_DATA_DIR || path.join(homedir(), '.local', 'share', 'launchpad', 'services'),
    logDir: process.env.LAUNCHPAD_SERVICES_LOG_DIR || path.join(homedir(), '.local', 'share', 'launchpad', 'logs'),
    configDir: process.env.LAUNCHPAD_SERVICES_CONFIG_DIR || path.join(homedir(), '.local', 'share', 'launchpad', 'services', 'config'),
    autoRestart: process.env.LAUNCHPAD_SERVICES_AUTO_RESTART !== 'false',
    startupTimeout: Number.parseInt(process.env.LAUNCHPAD_SERVICES_STARTUP_TIMEOUT || '30', 10),
    shutdownTimeout: Number.parseInt(process.env.LAUNCHPAD_SERVICES_SHUTDOWN_TIMEOUT || '10', 10),
    infer: process.env.LAUNCHPAD_SERVICES_INFER !== 'false',
    shouldAutoStart: process.env.LAUNCHPAD_SERVICES_SHOULD_AUTOSTART !== 'false',
    database: {
      username: process.env.LAUNCHPAD_DB_USERNAME || 'root',
      password: process.env.LAUNCHPAD_DB_PASSWORD || 'password',
      authMethod: (process.env.LAUNCHPAD_DB_AUTH_METHOD as 'trust' | 'md5' | 'scram-sha-256') || 'trust',
    },
    frameworks: {
      enabled: process.env.LAUNCHPAD_FRAMEWORKS_ENABLED !== 'false',
      laravel: {
        enabled: process.env.LAUNCHPAD_LARAVEL_ENABLED !== 'false',
        autoDetect: process.env.LAUNCHPAD_LARAVEL_AUTO_DETECT !== 'false',
      },
      stacks: {
        enabled: process.env.LAUNCHPAD_STACKS_ENABLED !== 'false',
        autoDetect: process.env.LAUNCHPAD_STACKS_AUTO_DETECT !== 'false',
      },
    },
    php: {
      enabled: process.env.LAUNCHPAD_PHP_ENABLED !== 'false',
      strategy: (process.env.LAUNCHPAD_PHP_STRATEGY as 'auto-detect') || 'auto-detect',
      version: process.env.LAUNCHPAD_PHP_VERSION || '8.4.0',
      // Smart auto-detection based on project analysis
      autoDetect: {
        enabled: process.env.LAUNCHPAD_PHP_AUTO_DETECT !== 'false',
        includeAllDatabases: process.env.LAUNCHPAD_PHP_ALL_DATABASES === 'true',
        includeEnterprise: process.env.LAUNCHPAD_PHP_ENTERPRISE === 'true',
      },
      // configuration (when auto-detect is disabled)
      configuration: (process.env.LAUNCHPAD_PHP_CONFIGURATION as 'laravel-mysql' | 'laravel-postgres' | 'laravel-sqlite' | 'api-only' | 'enterprise' | 'wordpress' | 'full-stack') || 'full-stack',
    },
  },
}

// eslint-disable-next-line antfu/no-top-level-await
export const config: LaunchpadConfig = await loadConfig({
  name: 'launchpad',
  defaultConfig,
})
