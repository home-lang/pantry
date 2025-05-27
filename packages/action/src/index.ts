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

/**
 * Detect project dependencies from various sources
 */
async function detectProjectDependencies(configPath: string): Promise<string[]> {
  const dependencies: string[] = []

  // 1. Check launchpad config file first
  if (fs.existsSync(configPath)) {
    const configDeps = await extractFromLaunchpadConfig(configPath)
    dependencies.push(...configDeps)
  }

  // 2. Check package.json for Node.js projects
  if (fs.existsSync('package.json')) {
    dependencies.push('node')

    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))

    // Check for specific tools in scripts or dependencies
    if (packageJson.scripts) {
      const scripts = JSON.stringify(packageJson.scripts)
      if (scripts.includes('bun'))
        dependencies.push('bun')
      if (scripts.includes('typescript') || scripts.includes('tsc'))
        dependencies.push('typescript')
    }

    if (packageJson.devDependencies?.typescript || packageJson.dependencies?.typescript) {
      dependencies.push('typescript')
    }
  }

  // 3. Check for Python projects
  if (fs.existsSync('requirements.txt') || fs.existsSync('pyproject.toml') || fs.existsSync('setup.py')) {
    dependencies.push('python')
  }

  // 4. Check for Go projects
  if (fs.existsSync('go.mod') || fs.existsSync('go.sum')) {
    dependencies.push('go')
  }

  // 5. Check for Rust projects
  if (fs.existsSync('Cargo.toml')) {
    dependencies.push('rust')
  }

  // 6. Check for Ruby projects
  if (fs.existsSync('Gemfile') || fs.existsSync('Rakefile')) {
    dependencies.push('ruby')
  }

  // 7. Check for PHP projects
  if (fs.existsSync('composer.json')) {
    dependencies.push('php')
  }

  // 8. Check for Java projects
  if (fs.existsSync('pom.xml') || fs.existsSync('build.gradle') || fs.existsSync('build.gradle.kts')) {
    dependencies.push('java')
  }

  // Remove duplicates and return
  return [...new Set(dependencies)]
}

/**
 * Extract dependencies from launchpad config file
 */
async function extractFromLaunchpadConfig(configPath: string): Promise<string[]> {
  try {
    const content = fs.readFileSync(configPath, 'utf8')

    // Simple regex to extract quoted strings that look like package names
    const packageMatches = content.match(/"([\w\-@.]+)"/g) || []
    const packages = packageMatches
      .map((p: string) => p.replace(/"/g, ''))
      .filter((p: string) => {
        // Filter out obvious non-package strings
        return !p.includes('/') && !p.includes('\\') && !p.includes('.') && p.length > 1
      })

    return packages
  }
  catch (error) {
    core.warning(`Failed to extract packages from config: ${error instanceof Error ? error.message : String(error)}`)
    return []
  }
}

// Run the action if this is the main module
if (require.main === module) {
  run().catch((error) => {
    core.setFailed(error instanceof Error ? error.message : String(error))
  })
}
