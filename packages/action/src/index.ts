import type { ActionInputs, Platform } from './types'
import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import * as process from 'node:process'
import * as crypto from 'node:crypto'
import * as cache from '@actions/cache'
import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as tc from '@actions/tool-cache'

export * from './types'

const REPO = 'home-lang/pantry'

function detectPlatform(): Platform {
  const platform = os.platform()
  const arch = os.arch()

  const osName = platform === 'darwin' ? 'darwin' : platform === 'win32' ? 'windows' : 'linux'
  const archName = arch === 'arm64' ? 'arm64' : 'x64'
  const binaryName = osName === 'windows' ? 'pantry.exe' : 'pantry'
  const assetName = `pantry-${osName}-${archName}.zip`

  return { os: osName as Platform['os'], arch: archName as Platform['arch'], binaryName, assetName }
}

async function resolveVersion(version: string): Promise<string> {
  if (version !== 'latest')
    return version.replace(/^v/, '')

  // Try gh CLI first (uses GITHUB_TOKEN automatically)
  let output = ''
  await exec.exec('gh', ['release', 'view', '--repo', REPO, '--json', 'tagName', '--jq', '.tagName'], {
    listeners: { stdout: (data: Buffer) => { output += data.toString() } },
    silent: true,
  }).catch(() => { output = '' })

  if (output.trim())
    return output.trim().replace(/^v/, '')

  // Fallback: GitHub API with auth token if available
  const token = process.env.GITHUB_TOKEN || ''
  const authHeader = token ? `-H "Authorization: token ${token}"` : ''
  let apiOutput = ''
  await exec.exec('bash', ['-c', `curl -sL ${authHeader} "https://api.github.com/repos/${REPO}/releases/latest"`], {
    listeners: { stdout: (data: Buffer) => { apiOutput += data.toString() } },
    silent: true,
  }).catch(() => { apiOutput = '' })

  try {
    const release = JSON.parse(apiOutput)
    if (release.tag_name)
      return release.tag_name.replace(/^v/, '')
  }
  catch {
    // JSON parse failed
  }

  throw new Error('Could not determine latest pantry version. Check GitHub API access.')
}

async function downloadAndInstall(version: string, platform: Platform): Promise<string> {
  if (version !== 'latest') {
    const cached = tc.find('pantry', version, platform.arch)
    if (cached)
      return cached
  }

  const url = version === 'latest'
    ? `https://github.com/${REPO}/releases/latest/download/${platform.assetName}`
    : `https://github.com/${REPO}/releases/download/v${version}/${platform.assetName}`

  const zipPath = await tc.downloadTool(url)
  const dir = await tc.extractZip(zipPath)

  if (platform.os !== 'windows')
    await exec.exec('chmod', ['+x', path.join(dir, platform.binaryName)])

  return version !== 'latest' ? await tc.cacheDir(dir, 'pantry', version, platform.arch) : dir
}

/** Hash a file's contents for cache key */
function hashFile(filePath: string): string {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    return crypto.createHash('sha256').update(content).digest('hex').slice(0, 16)
  }
  catch {
    return 'none'
  }
}

/** Find the lockfile for cache key (most accurate indicator of installed state) */
function findLockfile(): string | null {
  if (fs.existsSync('pantry.lock'))
    return 'pantry.lock'
  // Fall back to deps file if no lockfile yet
  const candidates = ['pantry.jsonc', 'pantry.json', 'deps.yaml', 'deps.yml', 'package.json']
  for (const f of candidates) {
    if (fs.existsSync(f))
      return f
  }
  return null
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
    const cwd = process.cwd()
    const homeDir = os.homedir()
    const pantryDir = path.join(cwd, 'pantry')
    const pantryBinDir = path.join(pantryDir, '.bin')

    // ── Install pantry CLI ──
    core.startGroup('Setup pantry')
    const resolvedVersion = await resolveVersion(inputs.version)
    const installDir = await downloadAndInstall(resolvedVersion, platform)
    core.addPath(installDir)

    let ver = ''
    await exec.exec(path.join(installDir, platform.binaryName), ['--version'], {
      listeners: { stdout: (d: Buffer) => { ver += d.toString() } },
      silent: true,
    }).catch(() => {})

    core.setOutput('pantry-path', path.join(installDir, platform.binaryName))
    core.setOutput('version', ver.trim() || resolvedVersion)
    core.info(`pantry ${ver.trim() || resolvedVersion}`)
    core.endGroup()

    if (inputs.setupOnly && !inputs.packages)
      return

    // ── Install deps with caching ──
    const lockfile = findLockfile()
    const resolvedVer = ver.trim().split(' ').pop()?.split('(')[0]?.trim() || resolvedVersion
    const cacheKey = `pantry-v${resolvedVer}-${platform.os}-${platform.arch}-${lockfile ? hashFile(lockfile) : 'no-lock'}-${inputs.packages || 'all'}`
    let cacheHit = false

    // Try restoring from cache
    try {
      const hit = await cache.restoreCache([pantryDir], cacheKey)
      if (hit) {
        // Verify cache is valid — .bin dir should exist with actual binaries
        const binDirExists = fs.existsSync(pantryBinDir)
        const hasEntries = binDirExists && fs.readdirSync(pantryBinDir).length > 0
        if (hasEntries) {
          cacheHit = true
          core.info(`Cache hit: ${cacheKey}`)
        }
        else {
          core.info('Cache restored but incomplete — reinstalling')
        }
      }
    }
    catch {
      // cache miss or unavailable
    }

    if (!cacheHit) {
      const installEnv = { ...process.env, CI: 'true', NO_COLOR: '1' }

      if (inputs.packages) {
        core.startGroup(`Installing: ${inputs.packages}`)
        await exec.exec('pantry', ['install', '--no-save', ...inputs.packages.split(/\s+/).filter(Boolean)], {
          env: installEnv as { [key: string]: string },
        })
        core.endGroup()
      }
      else {
        core.startGroup('Installing dependencies')
        await exec.exec('pantry', ['install', '--no-save'], {
          env: installEnv as { [key: string]: string },
        })
        core.endGroup()
      }

      // Save to cache for next run
      try {
        await cache.saveCache([pantryDir], cacheKey)
        core.info('Dependencies cached')
      }
      catch {
        // cache save failed (already exists or unavailable)
      }
    }

    // ── Configure PATH ──
    core.addPath(pantryBinDir)
    core.addPath(path.join(homeDir, '.pantry', 'bin'))

    // ── Ensure bun works ──
    const bunPath = path.join(pantryBinDir, 'bun')
    const bunxPath = path.join(pantryBinDir, 'bunx')
    try {
      if (fs.existsSync(bunPath)) {
        if (!fs.existsSync(bunxPath))
          fs.symlinkSync(bunPath, bunxPath)
        core.exportVariable('BUN_INSTALL', pantryDir)
      }
    }
    catch {
      // bun not in deps
    }

    core.info('Setup complete')
  }
  catch (error) {
    core.setFailed(error instanceof Error ? error.message : String(error))
  }
}

run()
