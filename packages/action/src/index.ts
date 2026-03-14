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

  // Check tool cache first
  if (version !== 'latest') {
    const cached = tc.find(toolName, version, platform.arch)
    if (cached) {
      core.info(`Using cached pantry ${version}`)
      return cached
    }
  }

  const downloadUrl = getDownloadUrl(version, platform.assetName)
  core.info(`Downloading pantry from ${downloadUrl}`)

  const zipPath = await tc.downloadTool(downloadUrl)
  const extractedDir = await tc.extractZip(zipPath)

  if (platform.os !== 'windows') {
    const binaryPath = path.join(extractedDir, platform.binaryName)
    await exec.exec('chmod', ['+x', binaryPath])
  }

  if (version !== 'latest') {
    const cachedDir = await tc.cacheDir(extractedDir, toolName, version, platform.arch)
    return cachedDir
  }

  return extractedDir
}

async function runPantryInstall(args: string[], env: Record<string, string | undefined>): Promise<void> {
  for (let attempt = 0; attempt <= 2; attempt++) {
    try {
      await exec.exec('pantry', args, { env: env as { [key: string]: string } })
      return
    }
    catch (err) {
      if (attempt < 2) {
        const delay = (attempt + 1) * 5000
        core.warning(`pantry ${args.join(' ')} failed (attempt ${attempt + 1}/3), retrying in ${delay / 1000}s...`)
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
      setupOnly: core.getInput('install') !== 'true',
    }

    const platform = detectPlatform()

    // ── Step 1: Install pantry CLI ──
    core.startGroup(`Setting up pantry (${inputs.version})`)
    const resolvedVersion = await resolveVersion(inputs.version)
    const installDir = await downloadAndInstall(resolvedVersion, platform)
    const binaryPath = path.join(installDir, platform.binaryName)
    core.addPath(installDir)

    let versionOutput = ''
    await exec.exec(binaryPath, ['--version'], {
      listeners: { stdout: (data: Buffer) => { versionOutput += data.toString() } },
      silent: true,
    }).catch(() => {})

    const installedVersion = versionOutput.trim() || resolvedVersion
    core.setOutput('pantry-path', binaryPath)
    core.setOutput('version', installedVersion)
    core.info(`pantry ${installedVersion} installed`)
    core.endGroup()

    // ── Step 2: Install dependencies (if enabled) ──
    if (inputs.setupOnly && !inputs.packages) {
      return
    }

    // Set CI env so pantry uses milestone progress (no spinner)
    const installEnv = {
      ...process.env,
      CI: 'true',
      NO_COLOR: '1',
    }

    // Check if pantry/ dir already has installed packages (cache hit from previous job)
    const cwd = process.cwd()
    const pantryBinDir = path.join(cwd, 'pantry', '.bin')
    const homeDir = os.homedir()

    if (inputs.packages) {
      core.startGroup(`Installing packages: ${inputs.packages}`)
      const args = ['install', '--no-save', ...inputs.packages.split(/\s+/).filter(Boolean)]
      await runPantryInstall(args, installEnv)
      core.endGroup()
    }
    else {
      core.startGroup('Installing project dependencies')
      await runPantryInstall(['install', '--no-save'], installEnv)
      core.endGroup()
    }

    // ── Step 3: Configure PATH ──
    core.addPath(pantryBinDir)
    const globalPantryBin = path.join(homeDir, '.pantry', 'bin')
    core.addPath(globalPantryBin)

    // ── Step 4: Ensure bun is fully configured ──
    const bunPath = path.join(pantryBinDir, 'bun')
    const bunxPath = path.join(pantryBinDir, 'bunx')
    try {
      await exec.exec('test', ['-f', bunPath], { silent: true })
      // Create bunx symlink (bun and bunx are the same binary)
      await exec.exec('bash', ['-c', `[ -f "${bunxPath}" ] || ln -s "${bunPath}" "${bunxPath}"`], { silent: true })
      // Set BUN_INSTALL so bun's postinstall check passes
      core.exportVariable('BUN_INSTALL', path.dirname(pantryBinDir))
    }
    catch {
      // bun not installed via pantry
    }

    core.info('Setup complete')
  }
  catch (error) {
    core.setFailed(error instanceof Error ? error.message : String(error))
  }
}

run()
