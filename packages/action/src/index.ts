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
 * Get the path to the locally built pantry binary
 */
function getPantryBinaryPath(): string {
  // The pantry binary is built in packages/zig/zig-out/bin/pantry
  // This action runs from the repo root, so we can use a relative path
  return path.join(process.cwd(), 'packages', 'zig', 'zig-out', 'bin', 'pantry')
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

  const pantryBin = getPantryBinaryPath()
  const args = ['install', '--verbose', ...packages.split(' ')]
  await exec.exec(pantryBin, args, options)

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
    const pantryBin = getPantryBinaryPath()
    const args = ['install', '--verbose', ...dependencies]
    await exec.exec(pantryBin, args, options)
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
