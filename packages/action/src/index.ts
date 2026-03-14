import type { ActionInputs, Platform } from './types'
import * as os from 'node:os'
import * as path from 'node:path'
import * as process from 'node:process'
import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as tc from '@actions/tool-cache'

export * from './types'

const REPO = 'home-lang/pantry'

function detectPlatform(): Platform {
  const platform = os.platform()
  const arch = os.arch()

  let osName: Platform['os']
  let archName: Platform['arch']

  switch (platform) {
    case 'darwin':
      osName = 'darwin'
      break
    case 'linux':
      osName = 'linux'
      break
    case 'win32':
      osName = 'windows'
      break
    default:
      throw new Error(`Unsupported platform: ${platform}`)
  }

  switch (arch) {
    case 'x64':
      archName = 'x64'
      break
    case 'arm64':
      archName = 'arm64'
      break
    default:
      throw new Error(`Unsupported architecture: ${arch}`)
  }

  const binaryName = osName === 'windows' ? 'pantry.exe' : 'pantry'
  const assetName = `pantry-${osName}-${archName}.zip`

  return { os: osName, arch: archName, binaryName, assetName }
}

async function resolveVersion(version: string): Promise<string> {
  if (version !== 'latest')
    return version.replace(/^v/, '')

  let output = ''
  await exec.exec('gh', ['release', 'view', '--repo', REPO, '--json', 'tagName', '--jq', '.tagName'], {
    listeners: {
      stdout: (data: Buffer) => {
        output += data.toString()
      },
    },
    silent: true,
  }).catch(() => {
    output = ''
  })

  if (output.trim())
    return output.trim().replace(/^v/, '')

  // Fallback: use GitHub API via curl
  let apiOutput = ''
  await exec.exec('curl', ['-sL', `https://api.github.com/repos/${REPO}/releases/latest`], {
    listeners: {
      stdout: (data: Buffer) => {
        apiOutput += data.toString()
      },
    },
    silent: true,
  })

  const release = JSON.parse(apiOutput)
  if (!release.tag_name)
    throw new Error('Could not determine latest pantry version. No releases found.')

  return release.tag_name.replace(/^v/, '')
}

function getDownloadUrl(version: string, assetName: string): string {
  if (version === 'latest')
    return `https://github.com/${REPO}/releases/latest/download/${assetName}`

  return `https://github.com/${REPO}/releases/download/v${version}/${assetName}`
}

async function downloadAndInstall(version: string, platform: Platform): Promise<string> {
  const toolName = 'pantry'

  // Check tool cache first (skip for "latest" since we don't know the exact version yet)
  if (version !== 'latest') {
    const cached = tc.find(toolName, version, platform.arch)
    if (cached) {
      core.info(`Found cached pantry ${version}`)
      return cached
    }
  }

  const downloadUrl = getDownloadUrl(version, platform.assetName)
  core.info(`Downloading pantry from ${downloadUrl}`)

  const zipPath = await tc.downloadTool(downloadUrl)
  const extractedDir = await tc.extractZip(zipPath)

  // Make binary executable on unix
  if (platform.os !== 'windows') {
    const binaryPath = path.join(extractedDir, platform.binaryName)
    await exec.exec('chmod', ['+x', binaryPath])
  }

  // Cache the tool for future runs
  if (version !== 'latest') {
    const cachedDir = await tc.cacheDir(extractedDir, toolName, version, platform.arch)
    return cachedDir
  }

  return extractedDir
}

async function runWithRetry(cmd: string, args: string[], env: Record<string, string | undefined>, retries = 2): Promise<void> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      await exec.exec(cmd, args, { env })
      return
    }
    catch (err) {
      if (attempt < retries) {
        const delay = (attempt + 1) * 5000
        core.warning(`${cmd} ${args.join(' ')} failed (attempt ${attempt + 1}/${retries + 1}), retrying in ${delay / 1000}s...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
      else {
        throw err
      }
    }
  }
}

export async function run(): Promise<void> {
  try {
    const inputs: ActionInputs = {
      version: core.getInput('version') || 'latest',
      packages: core.getInput('packages') || '',
      configPath: core.getInput('config-path') || 'pantry.config.ts',
      setupOnly: core.getInput('setup-only') === 'true',
    }

    const platform = detectPlatform()
    core.info(`Detected platform: ${platform.os}-${platform.arch}`)

    // Setup Pantry
    core.info(`Setting up pantry (version: ${inputs.version})`)

    // Resolve version
    const resolvedVersion = await resolveVersion(inputs.version)
    core.info(`Resolved version: ${resolvedVersion}`)

    // Download and install
    const installDir = await downloadAndInstall(resolvedVersion, platform)
    const binaryPath = path.join(installDir, platform.binaryName)

    // Add to PATH
    core.addPath(installDir)
    core.info(`Added ${installDir} to PATH`)

    // Verify installation
    let versionOutput = ''
    await exec.exec(binaryPath, ['--version'], {
      listeners: {
        stdout: (data: Buffer) => {
          versionOutput += data.toString()
        },
      },
      silent: true,
    }).catch(() => {
      core.warning('Could not verify pantry version')
    })

    const installedVersion = versionOutput.trim() || resolvedVersion

    // Set outputs
    core.setOutput('pantry-path', binaryPath)
    core.setOutput('version', installedVersion)

    core.info(`pantry ${installedVersion} is ready`)

    // If setup-only without packages, we're done (just pantry CLI in PATH)
    if (inputs.setupOnly && !inputs.packages) {
      core.info('Setup-only mode: skipping package installation')
      return
    }

    // If setup-only with packages, install them and add .bin to PATH
    if (inputs.setupOnly && inputs.packages) {
      const installEnv = { ...process.env, PANTRY_VERBOSE: 'true', NO_COLOR: '1' }
      core.info(`Installing packages: ${inputs.packages}`)
      const args = ['install', ...inputs.packages.split(/\s+/).filter(Boolean)]
      await runWithRetry('pantry', args, installEnv)
      core.info('Package installation completed')

      const cwd = process.cwd()
      const pantryBinDir = path.join(cwd, 'pantry', '.bin')
      core.addPath(pantryBinDir)
      core.info(`Added ${pantryBinDir} to PATH`)

      const homeDir = os.homedir()
      const globalPantryBin = path.join(homeDir, '.pantry', 'bin')
      core.addPath(globalPantryBin)
      return
    }

    // Install packages if specified
    const installEnv = {
      ...process.env,
      PANTRY_VERBOSE: 'true',
      NO_COLOR: '1',
    }

    if (inputs.packages) {
      core.info(`Installing packages: ${inputs.packages}`)
      const args = ['install', ...inputs.packages.split(/\s+/).filter(Boolean)]
      await runWithRetry('pantry', args, installEnv)
      core.info('Package installation completed')
    }
    else {
      // Run pantry install to auto-detect from pantry.json/package.json
      core.info('Installing project dependencies using pantry...')
      await runWithRetry('pantry', ['install'], installEnv)
      core.info('Project dependencies installation completed')
    }

    // Add pantry/.bin to PATH so installed package binaries are available
    const cwd = process.cwd()
    const pantryBinDir = path.join(cwd, 'pantry', '.bin')
    core.addPath(pantryBinDir)
    core.info(`Added ${pantryBinDir} to PATH`)

    // Also add global pantry bin if it exists
    const homeDir = os.homedir()
    const globalPantryBin = path.join(homeDir, '.pantry', 'bin')
    core.addPath(globalPantryBin)

    core.info('pantry setup completed successfully')
  }
  catch (error) {
    core.setFailed(error instanceof Error ? error.message : String(error))
  }
}

run()
