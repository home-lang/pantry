import type { LaunchpadConfig } from './types'
import fs from 'node:fs'
import { homedir } from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { loadConfig } from 'bunfig'

// Apply profile and validation
import { getEffectiveConfig, validateConfig } from './config-validation'

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

function getDefaultCacheDir(): string {
  const homePath = process.env.HOME || process.env.USERPROFILE || '~'
  return path.join(homePath, '.local', 'share', 'launchpad', 'cache')
}

function getDefaultLogDir(): string {
  const homePath = process.env.HOME || process.env.USERPROFILE || '~'
  return path.join(homePath, '.local', 'share', 'launchpad', 'logs')
}

function isCI(): boolean {
  return process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true'
}

export const defaultConfig: LaunchpadConfig = {
  verbose: process.env.LAUNCHPAD_VERBOSE === 'true' || isCI() || false,
  sudoPassword: process.env.SUDO_PASSWORD || '',
  devAware: true,
  maxRetries: isCI() ? 5 : 3,
  timeout: isCI() ? 120000 : 60000, // 2 minutes in CI, 1 minute locally
  symlinkVersions: true,
  forceReinstall: false,
  shimPath: getDefaultShimPath(),
  autoAddToPath: process.env.LAUNCHPAD_AUTO_ADD_PATH !== 'false',
  showShellMessages: process.env.LAUNCHPAD_SHOW_ENV_MESSAGES !== 'false' && !isCI(),
  shellActivationMessage: process.env.LAUNCHPAD_SHELL_ACTIVATION_MESSAGE || '✅ Environment activated for \x1B[3m{path}\x1B[0m',
  shellDeactivationMessage: process.env.LAUNCHPAD_SHELL_DEACTIVATION_MESSAGE || '⚪ Environment deactivated',
  useRegistry: true,
  installMethod: 'curl',
  installPath: getDefaultInstallPath(),
  // By default, install runtime dependencies - they are needed for packages to work properly
  installDependencies: !(process.env.LAUNCHPAD_INSTALL_DEPS === '0' || process.env.LAUNCHPAD_INSTALL_DEPS === 'false'),
  // By default, do NOT install build-time dependencies (pantry/build deps)
  installBuildDeps: process.env.LAUNCHPAD_INSTALL_BUILD_DEPS === '1' || process.env.LAUNCHPAD_INSTALL_BUILD_DEPS === 'true' || false,
  cache: {
    enabled: process.env.LAUNCHPAD_CACHE_ENABLED !== 'false',
    maxSize: Number.parseInt(process.env.LAUNCHPAD_CACHE_MAX_SIZE || '1024', 10),
    ttlHours: Number.parseInt(process.env.LAUNCHPAD_CACHE_TTL_HOURS || '168', 10), // 1 week
    autoCleanup: process.env.LAUNCHPAD_CACHE_AUTO_CLEANUP !== 'false',
    directory: process.env.LAUNCHPAD_CACHE_DIR || getDefaultCacheDir(),
    compression: process.env.LAUNCHPAD_CACHE_COMPRESSION !== 'false',
  },
  network: {
    timeout: Number.parseInt(process.env.LAUNCHPAD_NETWORK_TIMEOUT || '30000', 10),
    // Use slightly higher concurrency in CI to speed up installation
    maxConcurrent: Number.parseInt(process.env.LAUNCHPAD_NETWORK_MAX_CONCURRENT
      || (process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true' ? '4' : '3'), 10),
    retries: Number.parseInt(process.env.LAUNCHPAD_NETWORK_RETRIES || '3', 10),
    proxy: {
      http: process.env.HTTP_PROXY || process.env.http_proxy,
      https: process.env.HTTPS_PROXY || process.env.https_proxy,
      bypass: process.env.NO_PROXY || process.env.no_proxy,
    },
    userAgent: process.env.LAUNCHPAD_USER_AGENT || `launchpad/${process.env.npm_package_version || '1.0.0'}`,
    followRedirects: process.env.LAUNCHPAD_FOLLOW_REDIRECTS !== 'false',
  },
  security: {
    verifySignatures: process.env.LAUNCHPAD_VERIFY_SIGNATURES !== 'false',
    trustedSources: (process.env.LAUNCHPAD_TRUSTED_SOURCES || 'pkgx.dev,github.com').split(','),
    allowUntrusted: process.env.LAUNCHPAD_ALLOW_UNTRUSTED === 'true',
    checkVulnerabilities: process.env.LAUNCHPAD_CHECK_VULNERABILITIES !== 'false',
  },
  logging: {
    level: (process.env.LAUNCHPAD_LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error') || (isCI() ? 'info' : 'warn'),
    toFile: process.env.LAUNCHPAD_LOG_TO_FILE === 'true',
    filePath: process.env.LAUNCHPAD_LOG_FILE || path.join(getDefaultLogDir(), 'launchpad.log'),
    maxFileSize: Number.parseInt(process.env.LAUNCHPAD_LOG_MAX_SIZE || '10', 10),
    keepFiles: Number.parseInt(process.env.LAUNCHPAD_LOG_KEEP_FILES || '5', 10),
    timestamps: process.env.LAUNCHPAD_LOG_TIMESTAMPS !== 'false',
    json: process.env.LAUNCHPAD_LOG_JSON === 'true' || isCI(),
  },
  updates: {
    checkForUpdates: process.env.LAUNCHPAD_CHECK_UPDATES !== 'false',
    autoUpdate: process.env.LAUNCHPAD_AUTO_UPDATE === 'true',
    checkFrequency: Number.parseInt(process.env.LAUNCHPAD_UPDATE_FREQUENCY || '24', 10),
    includePrereleases: process.env.LAUNCHPAD_INCLUDE_PRERELEASES === 'true',
    channels: (process.env.LAUNCHPAD_UPDATE_CHANNELS || 'stable').split(',') as ('stable' | 'beta' | 'nightly')[],
  },
  resources: {
    maxDiskUsage: process.env.LAUNCHPAD_MAX_DISK_USAGE ? Number.parseInt(process.env.LAUNCHPAD_MAX_DISK_USAGE, 10) : undefined,
    maxMemoryUsage: process.env.LAUNCHPAD_MAX_MEMORY_USAGE ? Number.parseInt(process.env.LAUNCHPAD_MAX_MEMORY_USAGE, 10) : undefined,
    autoCleanup: process.env.LAUNCHPAD_AUTO_CLEANUP !== 'false',
    keepVersions: Number.parseInt(process.env.LAUNCHPAD_KEEP_VERSIONS || '3', 10),
  },
  profiles: {
    active: process.env.LAUNCHPAD_PROFILE || (isCI() ? 'ci' : 'development'),
    development: {
      verbose: false,
      logging: { level: 'warn' },
      cache: { autoCleanup: true },
      updates: { checkForUpdates: true, autoUpdate: false },
    },
    production: {
      verbose: false,
      logging: { level: 'error', json: true },
      cache: { autoCleanup: false },
      updates: { checkForUpdates: false, autoUpdate: false },
      security: { verifySignatures: true, allowUntrusted: false },
    },
    ci: {
      verbose: true,
      maxRetries: 5,
      timeout: 120000,
      logging: { level: 'info', json: true },
      cache: { enabled: true, autoCleanup: true },
      updates: { checkForUpdates: false, autoUpdate: false },
      network: { maxConcurrent: 1 }, // Be conservative in CI
    },
  },
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
  },
}

// Load and validate configuration
// eslint-disable-next-line antfu/no-top-level-await
const rawConfig = await loadConfig({
  name: 'launchpad',
  defaultConfig,
})

export const config: LaunchpadConfig = getEffectiveConfig(rawConfig)

// Validate configuration on load (non-blocking)
const validation = validateConfig(config, { checkPaths: false, checkPermissions: false })
if (!validation.valid && process.env.NODE_ENV !== 'test') {
  console.warn('⚠️ Configuration validation warnings:')
  for (const warning of validation.warnings) {
    console.warn(`  • ${warning}`)
  }
  if (validation.errors.length > 0) {
    console.warn('❌ Configuration errors:')
    for (const error of validation.errors) {
      console.warn(`  • ${error}`)
    }
  }
}
