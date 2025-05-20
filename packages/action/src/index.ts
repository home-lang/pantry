import type { ActionInputs } from './types'
import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import * as process from 'node:process'
import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as github from '@actions/github'
import * as io from '@actions/io'

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
      useDev: core.getInput('use-dev', { required: false }) || 'false',
    }

    core.info('Starting Launchpad Installer')
    core.info(`Context: ${JSON.stringify(github.context)}`)

    // Setup Bun
    await setupBun()

    // Install launchpad
    await installLaunchpad()

    // Install pkgx
    await installPkgx()

    // Install dev package if requested
    if (inputs.useDev === 'true') {
      await installDevPackage()
    }

    // Install dependencies
    if (inputs.packages) {
      await installSpecifiedPackages(inputs.packages)
    }
    else {
      await installPackagesFromConfig(inputs.configPath)
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
 * Install the dev package
 */
async function installDevPackage(): Promise<void> {
  core.info('Installing dev package...')

  const options = {
    env: {
      ...process.env,
      LAUNCHPAD_VERBOSE: 'true',
      CONTEXT: JSON.stringify(github.context),
    },
  }

  await exec.exec('launchpad', ['dev', '--verbose'], options)
  core.info('dev package installation completed')
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
 * Install packages from config file
 */
async function installPackagesFromConfig(configPath: string): Promise<void> {
  core.info(`Looking for packages in config file: ${configPath}`)

  const platform = process.platform
  const options = {
    env: {
      ...process.env,
      LAUNCHPAD_VERBOSE: 'true',
      CONTEXT: JSON.stringify(github.context),
    },
  }

  if (!fs.existsSync(configPath)) {
    core.warning(`Config file not found: ${configPath}`)
    return
  }

  if (platform === 'win32') {
    // Windows
    await installPackagesFromConfigWindows(configPath, options)
  }
  else {
    // Unix-like
    await installPackagesFromConfigUnix(configPath, options)
  }
}

/**
 * Install packages from config file (Unix implementation)
 */
async function installPackagesFromConfigUnix(configPath: string, options: exec.ExecOptions): Promise<void> {
  // Extract packages using grep on Unix-like systems
  let packages = ''

  try {
    const output = await exec.getExecOutput('grep', ['-o', '\"[^\"]*\"', configPath], {
      silent: true,
    })

    if (output.stdout) {
      packages = output.stdout
        .split('\n')
        .map((p: string) => p.trim().replace(/"/g, ''))
        .filter(Boolean)
        .join(' ')
    }
  }
  catch (error) {
    core.warning(`Failed to extract packages from config: ${error instanceof Error ? error.message : String(error)}`)
  }

  if (packages) {
    core.info(`Found packages: ${packages}`)
    const args = ['install', '--verbose', ...packages.split(' ')]
    await exec.exec('launchpad', args, options)
    core.info('Package installation completed')
  }
  else {
    core.warning('No packages found in config file')
  }
}

/**
 * Install packages from config file (Windows implementation)
 */
async function installPackagesFromConfigWindows(configPath: string, options: exec.ExecOptions): Promise<void> {
  // Read file content
  const content = fs.readFileSync(configPath, 'utf8')

  // Extract packages using regex
  const packageMatches = content.match(/"([^"]*)"/g) || []
  const packages = packageMatches
    .map((p: string) => p.replace(/"/g, ''))
    .filter(Boolean)
    .join(' ')

  if (packages) {
    core.info(`Found packages: ${packages}`)
    const args = ['install', '--verbose', ...packages.split(' ')]
    await exec.exec('launchpad', args, options)
    core.info('Package installation completed')
  }
  else {
    core.warning('No packages found in config file')
  }
}

// Run the action if this is the main module
if (require.main === module) {
  run().catch((error) => {
    core.setFailed(error instanceof Error ? error.message : String(error))
  })
}
