import type { ActionInputs } from './types'
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
      configPath: core.getInput('config-path', { required: false }) || 'pantry.config.ts',
    }

    core.info('Starting pantry Installer')
    core.info(`Context: ${JSON.stringify(github.context)}`)

    // Setup Bun
    await setupBun()

    // Install pantry
    await installpantry()

    // Install dependencies
    if (inputs.packages) {
      await installSpecifiedPackages(inputs.packages)
    }
    else {
      await installProjectDependencies(inputs.configPath)
    }

    core.info('pantry installation completed successfully')
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
 * Get the command and args to run pantry
 */
async function getPantryCommand(): Promise<{ command: string, baseArgs: string[] }> {
  // Try to find pantry using 'which' command first
  try {
    let pantryPath = ''
    await exec.exec('which', ['pantry'], {
      listeners: {
        stdout: (data: Buffer) => {
          pantryPath += data.toString()
        },
      },
      silent: true,
    })

    const trimmedPath = pantryPath.trim()
    if (trimmedPath) {
      core.info(`Found pantry at: ${trimmedPath}`)
      return { command: trimmedPath, baseArgs: [] }
    }
  }
  catch {
    // Fall through to bun approach
  }

  // Use 'bun' to run pantry since global binaries might not be created
  core.info('Pantry not found in PATH, using bun to run it')
  return { command: 'bun', baseArgs: ['pantry'] }
}

/**
 * Install pantry using Bun
 */
async function installpantry(): Promise<void> {
  core.info('Installing pantry...')
  await exec.exec('bun', ['install', '-g', 'pantry'])

  // Add Bun's global bin to PATH
  const bunGlobalBin = path.join(os.homedir(), '.bun', 'bin')
  core.addPath(bunGlobalBin)
  core.info(`Added ${bunGlobalBin} to PATH`)

  // Debug: List files in Bun's global bin directory
  try {
    await exec.exec('ls', ['-la', bunGlobalBin])
  }
  catch (error) {
    core.warning(`Failed to list ${bunGlobalBin}: ${error}`)
  }

  // Debug: Try to find where pantry was actually installed
  try {
    await exec.exec('find', [os.homedir(), '-name', 'pantry', '-type', 'f', '-executable', '2>/dev/null', '|', 'head', '-5'])
  }
  catch {
    // Ignore errors
  }

  core.info('pantry installation completed')
}

/**
 * Install specified packages
 */
async function installSpecifiedPackages(packages: string): Promise<void> {
  core.info(`Installing specified packages: ${packages}`)

  const options = {
    env: {
      ...process.env,
      PANTRY_VERBOSE: 'true',
      CONTEXT: JSON.stringify(github.context),
    },
  }

  const { command, baseArgs } = await getPantryCommand()
  const args = [...baseArgs, 'install', '--verbose', ...packages.split(' ')]
  await exec.exec(command, args, options)

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
      PANTRY_VERBOSE: 'true',
      CONTEXT: JSON.stringify(github.context),
    },
  }

  const dependencies = await detectProjectDependencies(configPath)

  if (dependencies.length > 0) {
    core.info(`Found dependencies: ${dependencies.join(', ')}`)
    const { command, baseArgs } = await getPantryCommand()
    const args = [...baseArgs, 'install', '--verbose', ...dependencies]
    await exec.exec(command, args, options)
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
