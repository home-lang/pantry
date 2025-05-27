import type { ActionInputs } from './types'
import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import * as process from 'node:process'
import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as github from '@actions/github'
import { detectProjectDependencies } from './dependency-detector'

export * from './types'

/**
 * Main function to run the GitHub Action
 */
export async function run(): Promise<void> {
  try {
    // Get inputs
    const inputs: ActionInputs = {
      packages: core.getInput('packages', { required: false }) || '',
      configPath: core.getInput('config-path', { required: false }) || 'launchpad.config.ts',
    }

    core.info('Starting Launchpad Installer')
    core.info(`Context: ${JSON.stringify(github.context)}`)

    // Setup Bun
    await setupBun()

    // Install launchpad
    await installLaunchpad()

    // Install pkgx
    await installPkgx()

    // Install dependencies
    if (inputs.packages) {
      await installSpecifiedPackages(inputs.packages)
    }
    else {
      await installProjectDependencies(inputs.configPath)
    }

    core.info('Launchpad installation completed successfully')
  }
  catch (error) {
    core.setFailed(error instanceof Error ? error.message : String(error))
  }
}

/**
 * Setup Bun in the environment
 */
async function setupBun(): Promise<void> {
  core.info('Setting up Bun...')

  // Check if Bun is already installed
  try {
    await exec.exec('which', ['bun'])
    core.info('Bun is already installed')
  }
  catch {
    core.info('Bun is not installed, installing now...')

    // Install Bun based on platform
    const platform = process.platform

    if (platform === 'darwin' || platform === 'linux') {
      // macOS or Linux
      await exec.exec('curl', ['-fsSL', 'https://bun.sh/install', '|', 'bash'])
    }
    else if (platform === 'win32') {
      // Windows
      await exec.exec('powershell', ['-Command', 'irm bun.sh/install.ps1 | iex'])
    }
    else {
      throw new Error(`Unsupported platform: ${platform}`)
    }

    // Add Bun to PATH
    const bunPath = path.join(os.homedir(), '.bun', 'bin')
    core.addPath(bunPath)

    core.info('Bun installation completed')
  }
}

/**
 * Install launchpad using Bun
 */
async function installLaunchpad(): Promise<void> {
  core.info('Installing launchpad...')
  await exec.exec('bun', ['install', '-g', 'launchpad'])
  core.info('launchpad installation completed')
}

/**
 * Install pkgx using launchpad
 */
async function installPkgx(): Promise<void> {
  core.info('Installing pkgx...')

  const options = {
    env: {
      ...process.env,
      LAUNCHPAD_VERBOSE: 'true',
      CONTEXT: JSON.stringify(github.context),
    },
  }

  await exec.exec('launchpad', ['pkgx', '--verbose'], options)
  core.info('pkgx installation completed')
}

/**
 * Install specified packages
 */
async function installSpecifiedPackages(packages: string): Promise<void> {
  core.info(`Installing specified packages: ${packages}`)

  const options = {
    env: {
      ...process.env,
      LAUNCHPAD_VERBOSE: 'true',
      CONTEXT: JSON.stringify(github.context),
    },
  }

  const args = ['install', '--verbose', ...packages.split(' ')]
  await exec.exec('launchpad', args, options)

  core.info('Package installation completed')
}

/**
 * Install project dependencies by detecting them from various sources
 */
async function installProjectDependencies(configPath: string): Promise<void> {
  core.info('Detecting project dependencies...')

  const options = {
    env: {
      ...process.env,
      LAUNCHPAD_VERBOSE: 'true',
      CONTEXT: JSON.stringify(github.context),
    },
  }

  const dependencies = await detectProjectDependencies(configPath)

  if (dependencies.length > 0) {
    core.info(`Found dependencies: ${dependencies.join(', ')}`)
    const args = ['install', '--verbose', ...dependencies]
    await exec.exec('launchpad', args, options)
    core.info('Project dependencies installation completed')
  }
  else {
    core.warning('No dependencies detected in project')
  }
}

// Run the action if this is the main module
if (require.main === module) {
  run().catch((error) => {
    core.setFailed(error instanceof Error ? error.message : String(error))
  })
}
