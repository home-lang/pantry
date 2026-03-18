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

  // Try gh CLI first (uses GH_TOKEN/GITHUB_TOKEN automatically)
  let output = ''
  await exec.exec('gh', ['release', 'view', '--repo', REPO, '--json', 'tagName', '--jq', '.tagName'], {
    listeners: { stdout: (data: Buffer) => { output += data.toString() } },
    silent: true,
  }).catch(() => { output = '' })

  if (output.trim())
    return output.trim().replace(/^v/, '')

  // Fallback: follow the GitHub releases/latest redirect to get the tag
  let redirectOutput = ''
  await exec.exec('curl', ['-sI', '-o', '/dev/null', '-w', '%{url_effective}', '-L', `https://github.com/${REPO}/releases/latest`], {
    listeners: { stdout: (data: Buffer) => { redirectOutput += data.toString() } },
    silent: true,
  }).catch(() => { redirectOutput = '' })

  // URL will be like https://github.com/home-lang/pantry/releases/tag/v0.8.16
  const tagMatch = redirectOutput.trim().match(/\/tag\/(.+)$/)
  if (tagMatch)
    return tagMatch[1].replace(/^v/, '')

  // Last resort: GitHub API with auth
  const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN || ''
  const curlArgs = ['-sL']
  if (token)
    curlArgs.push('-H', `Authorization: token ${token}`)
  curlArgs.push(`https://api.github.com/repos/${REPO}/releases/latest`)

  let apiOutput = ''
  await exec.exec('curl', curlArgs, {
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

/** Extract system dependency names from the project's deps file.
 *  Supports: pantry.jsonc, pantry.json, deps.yaml, deps.yml, pantry.yaml, pantry.yml */
function extractSystemDeps(): string[] {
  // JSON-based: pantry.jsonc, pantry.json
  for (const f of ['pantry.jsonc', 'pantry.json']) {
    if (!fs.existsSync(f)) continue
    try {
      let content = fs.readFileSync(f, 'utf-8')
      // Strip JSONC comments
      content = content.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '')
      const parsed = JSON.parse(content)
      const deps = parsed.dependencies || {}
      // eslint-disable-next-line no-unused-vars
      return Object.keys(deps).filter(n =>
        n.includes('.') || ['bun', 'zig', 'node', 'python', 'ruby', 'go', 'rust', 'deno'].includes(n),
      )
    }
    catch { continue }
  }

  // YAML-based: deps.yaml, deps.yml, pantry.yaml, pantry.yml
  for (const f of ['deps.yaml', 'deps.yml', 'pantry.yaml', 'pantry.yml']) {
    if (!fs.existsSync(f)) continue
    try {
      const content = fs.readFileSync(f, 'utf-8')
      const deps: string[] = []
      let inDeps = false
      for (const line of content.split('\n')) {
        if (/^dependencies:\s*$/.test(line.trim())) {
          inDeps = true
          continue
        }
        if (inDeps && /^\s+\S/.test(line)) {
          const name = line.trim().split(':')[0].trim()
          if (name) deps.push(name)
        }
        else if (inDeps && /^\S/.test(line)) {
          inDeps = false
        }
      }
      if (deps.length > 0) return deps
    }
    catch { continue }
  }

  return []
}

/** Find the primary deps file for cache key hashing */
function findDepsFile(): string | null {
  const candidates = [
    'pantry.jsonc', 'pantry.json', 'pantry.yaml', 'pantry.yml',
    'deps.yaml', 'deps.yml',
    'config/deps.ts', '.config/deps.ts',
    'pantry.config.ts', '.config/pantry.ts',
  ]
  for (const f of candidates) {
    if (fs.existsSync(f))
      return f
  }
  return null
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
      publish: core.getInput('publish') || '',
      registryUrl: core.getInput('registry-url') || 'https://registry.pantry.dev',
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

    // If setup-only with no packages, skip to publish (if any)
    if (inputs.setupOnly && !inputs.packages) {
      if (inputs.publish) {
        await publishPackage(inputs.publish, inputs.registryUrl, cwd)
      }
      core.info('Setup complete')
      return
    }

    // ── Install deps with caching ──
    const lockfile = findLockfile()
    const depsFileForKey = findDepsFile()
    const resolvedVer = ver.trim().split(' ').pop()?.split('(')[0]?.trim() || resolvedVersion
    const lockHash = lockfile ? hashFile(lockfile) : 'no-lock'
    const depsHash = depsFileForKey ? hashFile(depsFileForKey) : ''
    const cacheKey = `pantry-v2-${resolvedVer}-${platform.os}-${platform.arch}-${lockHash}-${depsHash}-${inputs.packages || 'all'}`
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

        // Install system deps from deps file if it exists.
        // The workspace installer reads package.json for JS deps but
        // ignores dedicated deps files (deps.yaml, pantry.jsonc, etc.)
        // that declare system packages like bun.sh, ziglang.org.
        const systemDeps = extractSystemDeps()
        if (systemDeps.length > 0) {
          core.info(`Installing system deps: ${systemDeps.join(', ')}`)
          await exec.exec('pantry', ['install', '--no-save', ...systemDeps], {
            env: installEnv as { [key: string]: string },
          }).catch(() => {
            core.warning('Some system deps failed to install')
          })
        }
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

    // ── Publish ──
    if (inputs.publish) {
      await publishPackage(inputs.publish, inputs.registryUrl, cwd)
    }

    core.info('Setup complete')
  }
  catch (error) {
    core.setFailed(error instanceof Error ? error.message : String(error))
  }
}

/**
 * Publish a package to the pantry registry.
 * - "zig": reads build.zig.zon, creates tarball, POSTs to /zig/publish
 * - "npm": runs `pantry publish --npm --access public`
 */
async function publishPackage(type: string, registryUrl: string, cwd: string): Promise<void> {
  const token = process.env.PANTRY_TOKEN || process.env.PANTRY_REGISTRY_TOKEN || ''
  if (!token) {
    throw new Error('PANTRY_TOKEN environment variable is required for publishing')
  }

  if (type === 'zig') {
    await publishZigPackage(registryUrl, token, cwd)
  }
  else if (type === 'npm') {
    core.startGroup('Publishing to npm via pantry')
    await exec.exec('pantry', ['publish', '--npm', '--access', 'public'])
    core.endGroup()
  }
  else {
    throw new Error(`Unknown publish type: "${type}". Use "zig" or "npm".`)
  }
}

async function publishZigPackage(registryUrl: string, token: string, cwd: string): Promise<void> {
  core.startGroup('Publishing Zig package')

  const zonPath = path.join(cwd, 'build.zig.zon')
  if (!fs.existsSync(zonPath)) {
    throw new Error('build.zig.zon not found in current directory')
  }

  const zonContent = fs.readFileSync(zonPath, 'utf-8')

  // Extract name and version from build.zig.zon
  // .name = .package_name or .name = .@"package-name" or .name = "package-name"
  const nameMatch = zonContent.match(/\.name\s*=\s*(?:\.@"([^"]+)"|\.(\w+)|"([^"]+)")/)
  const versionMatch = zonContent.match(/\.version\s*=\s*"([^"]+)"/)

  if (!nameMatch) throw new Error('Could not parse .name from build.zig.zon')
  if (!versionMatch) throw new Error('Could not parse .version from build.zig.zon')

  const name = nameMatch[1] || nameMatch[2] || nameMatch[3]
  const version = versionMatch[1]
  core.info(`Package: ${name}@${version}`)

  // Collect paths from build.zig.zon .paths field
  const pathsMatch = zonContent.match(/\.paths\s*=\s*\.?\{([^}]+)\}/)
  let includePaths: string[] = []
  if (pathsMatch) {
    includePaths = pathsMatch[1]
      .split(',')
      .map(p => p.trim().replace(/^"/, '').replace(/"$/, '').trim())
      .filter(p => p.length > 0)
  }

  // Create tarball
  const tarballName = `${name}-${version}.tar.gz`
  const tarballPath = path.join(os.tmpdir(), tarballName)

  if (includePaths.length > 0) {
    // Use explicit paths from build.zig.zon
    core.info(`Including: ${includePaths.join(', ')}`)
    await exec.exec('tar', ['czf', tarballPath, ...includePaths])
  }
  else {
    // Fallback: include common zig package files
    await exec.exec('tar', ['czf', tarballPath, 'build.zig', 'build.zig.zon', 'src'])
  }

  const stat = fs.statSync(tarballPath)
  core.info(`Tarball: ${tarballName} (${(stat.size / 1024).toFixed(1)} KB)`)

  // Upload to registry via multipart POST
  const url = `${registryUrl}/zig/publish`
  core.info(`Publishing to ${url}`)

  // Use curl for multipart upload (simpler than FormData in Node)
  let output = ''
  await exec.exec('curl', [
    '-s', '-f',
    '-X', 'POST', url,
    '-H', `Authorization: Bearer ${token}`,
    '-F', `tarball=@${tarballPath};filename=${tarballName}`,
    '-F', `manifest=${zonContent}`,
  ], {
    listeners: { stdout: (d: Buffer) => { output += d.toString() } },
  })

  // Clean up
  fs.unlinkSync(tarballPath)

  try {
    const result = JSON.parse(output)
    if (result.success) {
      core.info(`Published ${name}@${version}`)
      core.info(`Hash: ${result.hash}`)
      core.info(`URL: ${result.tarballUrl}`)
    }
    else {
      throw new Error(result.error || 'Publish failed')
    }
  }
  catch (e) {
    if (output.includes('already exists')) {
      core.info(`${name}@${version} already published — skipping`)
    }
    else {
      throw e
    }
  }

  core.endGroup()
}

run()
