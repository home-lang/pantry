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
  shellDeactivationMessage: process.env.LAUNCHPAD_SHELL_ACTIVATION_MESSAGE || 'Environment deactivated',
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
  },
}

// eslint-disable-next-line antfu/no-top-level-await
export const config: LaunchpadConfig = await loadConfig({
  name: 'launchpad',
  defaultConfig,
})
