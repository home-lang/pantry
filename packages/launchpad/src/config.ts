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
  verbose: process.env.LAUNCHPAD_VERBOSE === 'true' || false,
  installationPath: getDefaultInstallPath(),
  sudoPassword: process.env.SUDO_PASSWORD || '',
  devAware: true,
  autoSudo: process.env.LAUNCHPAD_AUTO_SUDO !== 'false',
  maxRetries: 3,
  timeout: 60000, // 60 seconds
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
  services: {
    enabled: process.env.LAUNCHPAD_SERVICES_ENABLED !== 'false',
    dataDir: process.env.LAUNCHPAD_SERVICES_DATA_DIR || path.join(homedir(), '.local', 'share', 'launchpad', 'services'),
    logDir: process.env.LAUNCHPAD_SERVICES_LOG_DIR || path.join(homedir(), '.local', 'share', 'launchpad', 'logs'),
    configDir: process.env.LAUNCHPAD_SERVICES_CONFIG_DIR || path.join(homedir(), '.local', 'share', 'launchpad', 'services', 'config'),
    autoRestart: process.env.LAUNCHPAD_SERVICES_AUTO_RESTART !== 'false',
    startupTimeout: Number.parseInt(process.env.LAUNCHPAD_SERVICES_STARTUP_TIMEOUT || '30', 10),
    shutdownTimeout: Number.parseInt(process.env.LAUNCHPAD_SERVICES_SHUTDOWN_TIMEOUT || '10', 10),
    database: {
      username: process.env.LAUNCHPAD_DB_USERNAME || 'root',
      password: process.env.LAUNCHPAD_DB_PASSWORD || 'password',
      authMethod: (process.env.LAUNCHPAD_DB_AUTH_METHOD as 'trust' | 'md5' | 'scram-sha-256') || 'trust',
    },
    frameworks: {
      enabled: process.env.LAUNCHPAD_FRAMEWORKS_ENABLED !== 'false',
      preferredDatabase: (process.env.LAUNCHPAD_PREFERRED_DATABASE as 'postgres' | 'sqlite') || 'postgres',
      laravel: {
        enabled: process.env.LAUNCHPAD_LARAVEL_ENABLED !== 'false',
        autoDetect: process.env.LAUNCHPAD_LARAVEL_AUTO_DETECT !== 'false',
        postSetupCommands: {
          enabled: process.env.LAUNCHPAD_LARAVEL_POST_SETUP !== 'false',
          commands: [
            {
              name: 'migrate',
              command: 'php artisan migrate',
              description: 'Run database migrations',
              condition: 'hasUnrunMigrations',
              runInBackground: false,
              required: false,
            },
            {
              name: 'seed',
              command: 'php artisan db:seed',
              description: 'Seed the database with sample data',
              condition: 'hasSeeders',
              runInBackground: false,
              required: false,
            },
            {
              name: 'storage-link',
              command: 'php artisan storage:link',
              description: 'Create symbolic link for storage',
              condition: 'needsStorageLink',
              runInBackground: false,
              required: false,
            },
            {
              name: 'optimize',
              command: 'php artisan optimize',
              description: 'Optimize Laravel for production',
              condition: 'isProduction',
              runInBackground: false,
              required: false,
            },
          ],
        },
      },
      stacks: {
        enabled: process.env.LAUNCHPAD_STACKS_ENABLED !== 'false',
        autoDetect: process.env.LAUNCHPAD_STACKS_AUTO_DETECT !== 'false',
      },
    },
    php: {
      enabled: process.env.LAUNCHPAD_PHP_ENABLED !== 'false',
      strategy: 'source-build' as const,
      version: process.env.LAUNCHPAD_PHP_VERSION || '8.4.0',
      extensions: {
        core: [
          'cli',
          'fpm',
          'mbstring',
          'opcache',
          'intl',
          'exif',
          'bcmath',
        ],
        database: [
          'pdo-mysql',
          'pdo-pgsql',
          'pdo-sqlite',
          'mysqli',
          'pgsql',
          'sqlite3',
        ],
        web: [
          'curl',
          'openssl',
          'gd',
          'soap',
          'sockets',
        ],
        utility: [
          'zip',
          'bz2',
          'gettext',
          'readline',
          'libxml',
          'zlib',
        ],
        optional: [
          'pcntl',
          'posix',
          'shmop',
          'sysvmsg',
          'sysvsem',
          'sysvshm',
        ],
      },
      build: {
        parallelJobs: undefined, // Auto-detect CPU cores
        configureArgs: [
          '--disable-debug',
        ],
        timeout: 600000, // 10 minutes
        debug: false,
      },
    },
  },
}

// eslint-disable-next-line antfu/no-top-level-await
export const config: LaunchpadConfig = await loadConfig({
  name: 'launchpad',
  defaultConfig,
})
