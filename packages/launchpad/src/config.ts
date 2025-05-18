import type { LaunchpadConfig } from './types'
import fs from 'node:fs'
import { platform } from 'node:os'
import path from 'node:path'
import process from 'node:process'
// @ts-expect-error the library has type issues atm
import { loadConfig } from 'bunfig'
import { Path } from './path'

function getDefaultInstallPath(): string {
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
  const homePath = process.env.HOME || process.env.USERPROFILE || '~'
  return path.join(homePath, '.local', 'bin')
}

export const defaultConfig: LaunchpadConfig = {
  verbose: false,
  installationPath: getDefaultInstallPath(),
  sudoPassword: process.env.SUDO_PASSWORD || '',
  devAware: true,
  autoSudo: true,
  maxRetries: 3,
  timeout: 60000, // 60 seconds
  symlinkVersions: true,
  forceReinstall: false,
  shimPath: getDefaultShimPath(),
}

// eslint-disable-next-line antfu/no-top-level-await
export const config: LaunchpadConfig = await loadConfig({
  name: 'launchpad',
  defaultConfig,
})
