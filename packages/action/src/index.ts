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

    // Ensure pantry binary is available
    await ensurePantryBinary()

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
 * Ensure pantry binary is available by building it if necessary
 */
async function ensurePantryBinary(): Promise<void> {
  const pantryBin = getPantryBinaryPath()
  const fs = await import('node:fs/promises')

  try {
    await fs.access(pantryBin)
    core.info('pantry binary already exists')
    return
  }
  catch {
    core.info('pantry binary not found, bootstrapping...')
  }

  // Download or use pre-built pantry binary from release
  const zigDir = path.join(process.cwd(), 'packages', 'zig')

  core.startGroup('Downloading pantry binary')

  // Detect platform and architecture
  const platform = os.platform()
  const arch = os.arch()

  let binaryName = 'pantry'
  let downloadUrl = ''

  // Map to pantry's release binary names
  if (platform === 'darwin' && arch === 'arm64') {
    downloadUrl = 'https://github.com/stacksjs/pantry/releases/latest/download/macos-aarch64/pantry'
  }
  else if (platform === 'darwin' && arch === 'x64') {
    downloadUrl = 'https://github.com/stacksjs/pantry/releases/latest/download/macos-x86_64/pantry'
  }
  else if (platform === 'linux' && arch === 'arm64') {
    downloadUrl = 'https://github.com/stacksjs/pantry/releases/latest/download/linux-aarch64/pantry'
  }
  else if (platform === 'linux' && arch === 'x64') {
    downloadUrl = 'https://github.com/stacksjs/pantry/releases/latest/download/linux-x86_64/pantry'
  }
  else if (platform === 'win32' && arch === 'x64') {
    binaryName = 'pantry.exe'
    downloadUrl = 'https://github.com/stacksjs/pantry/releases/latest/download/windows-x86_64/pantry.exe'
  }
  else {
    throw new Error(`Unsupported platform: ${platform}-${arch}. Building from source...`)
  }

  try {
    // Download pre-built binary
    core.info(`Downloading pantry from ${downloadUrl}`)
    await exec.exec('curl', ['-L', '-o', pantryBin, downloadUrl])
    await exec.exec('chmod', ['+x', pantryBin])
    core.info('pantry binary downloaded successfully')
  }
  catch (error) {
    core.warning('Failed to download pre-built binary, building from source...')

    // Fallback: Build from source
    // First, bootstrap by cloning deps to fallback location
    const parentDir = path.join(process.cwd(), '..')
    const deps = ['zig-cli', 'zig-config', 'zig-test-framework']

    for (const dep of deps) {
      const depPath = path.join(parentDir, dep)
      try {
        await fs.access(depPath)
        core.info(`${dep} already exists`)
      }
      catch {
        core.info(`Cloning ${dep}...`)
        await exec.exec('git', [
          'clone',
          '--depth',
          '1',
          `https://github.com/zig-utils/${dep}.git`,
          depPath,
        ])
      }
    }

    core.info('Building pantry from source')
    await exec.exec('zig', ['build'], { cwd: zigDir })
    core.info('pantry binary built successfully')
  }

  core.endGroup()
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
 * Install project dependencies using pantry install
 * This reads from pantry.json, pantry.jsonc, package.json, or package.jsonc
 */
async function installProjectDependencies(configPath: string): Promise<void> {
  core.info('Installing project dependencies using pantry...')

  const options = {
    env: {
      ...process.env,
      PANTRY_VERBOSE: 'true',
      CONTEXT: JSON.stringify(github.context),
    },
  }

  const pantryBin = getPantryBinaryPath()

  // Just run `pantry install` - it will auto-detect pantry.json/package.json
  // and handle workspace installations automatically
  await exec.exec(pantryBin, ['install'], options)

  core.info('Project dependencies installation completed')
}

// Run the action if this is the main module
if (require.main === module) {
  run().catch((error) => {
    core.setFailed(error instanceof Error ? error.message : String(error))
  })
}
