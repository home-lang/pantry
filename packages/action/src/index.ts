import type { ActionInputs, Platform } from './types'
import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import * as process from 'node:process'
import * as crypto from 'node:crypto'
import * as cache from '@actions/cache'
import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as github from '@actions/github'
import * as glob from '@actions/glob'
import * as tc from '@actions/tool-cache'
import { getPrimaryBinary } from '../../ts-pantry/src/installer'
import { isKnownAlias, resolvePackageDomain } from '../../ts-pantry/src/utils'

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

  // Use /releases/latest/download for non-semver versions (like 'main', 'latest')
  const isSemver = /^\d+\.\d+/.test(version)
  const url = !isSemver
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

/** Strip JSONC comments while preserving strings containing // */
function stripJsoncComments(text: string): string {
  let result = ''
  let inString = false
  let escape = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (escape) {
      result += ch
      escape = false
      continue
    }
    if (inString) {
      result += ch
      if (ch === '\\') escape = true
      else if (ch === '"') inString = false
      continue
    }
    if (ch === '"') {
      inString = true
      result += ch
      continue
    }
    // Line comment
    if (ch === '/' && text[i + 1] === '/') {
      const nl = text.indexOf('\n', i)
      i = nl === -1 ? text.length : nl - 1
      continue
    }
    // Block comment
    if (ch === '/' && text[i + 1] === '*') {
      const end = text.indexOf('*/', i + 2)
      i = end === -1 ? text.length : end + 1
      continue
    }
    result += ch
  }
  return result
}

/** Get the binary name for a dependency spec (alias or domain) */
function getBinName(dep: string): string {
  const name = dep.includes('@') ? dep.split('@')[0] : dep
  const domain = resolvePackageDomain(name)
  return getPrimaryBinary(domain) || name.split('.')[0]
}

/**
 * Install a system package using the pantry TS installer SDK.
 * Works cross-platform (macOS, Linux, Windows) using Node.js APIs.
 * Supports: ziglang.org, bun.sh, nodejs.org (and all 1700+ aliases from ts-pantry)
 */
async function installSystemPackage(spec: string, pantryDir: string): Promise<void> {
  // Import from the pantry TS installer SDK
  const installer = await import('../../ts-pantry/src/installer')

  const { installPackage, isSupported, resolveLatestVersion } = installer

  const [rawName, rawVersion = ''] = spec.includes('@') ? spec.split('@', 2) : [spec, 'latest']
  const domain = resolvePackageDomain(rawName)
  if (!isSupported(domain)) {
    core.warning(`${rawName} (resolved to ${domain}): not supported by TS installer SDK, skipping`)
    return
  }

  // Resolve wildcards, "latest", empty, and semver ranges to concrete versions
  const needsResolve = !rawVersion || rawVersion === 'latest' || rawVersion === '*' || /^[\^~>=<]/.test(rawVersion)
  const version = needsResolve ? await resolveLatestVersion(domain) : rawVersion
  core.info(`Installing ${domain}@${version} via pantry SDK`)
  await installPackage(domain, version, { installDir: pantryDir, quiet: true })
}

/** Extract system dependency names from the project's deps file.
 *  Supports: pantry.jsonc, pantry.json, deps.yaml, deps.yml, pantry.yaml, pantry.yml */
function extractSystemDeps(): string[] {
  // JSON-based: pantry.jsonc, pantry.json
  for (const f of ['pantry.jsonc', 'pantry.json']) {
    if (!fs.existsSync(f)) continue
    try {
      const content = stripJsoncComments(fs.readFileSync(f, 'utf-8'))
      const parsed = JSON.parse(content)
      const deps = parsed.dependencies || {}
      return Object.entries(deps)
        .filter(([n]) => n.includes('.') || isKnownAlias(n))
        .map(([name, version]) => version ? `${name}@${version}` : name)
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
        // Match top-level `dependencies:` key (not indented)
        if (/^dependencies:\s*$/.test(line)) {
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
  const candidates = [
    'pantry.jsonc', 'pantry.json', 'pantry.yaml', 'pantry.yml',
    'deps.yaml', 'deps.yml', 'package.json',
  ]
  for (const f of candidates) {
    if (fs.existsSync(f))
      return f
  }
  return null
}

/** Detect package name and version from the project for notification context */
function detectPackageInfo(cwd: string): { name: string, version: string } {
  // Try package.json first (npm packages)
  const pkgJsonPath = path.join(cwd, 'package.json')
  if (fs.existsSync(pkgJsonPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'))
      if (pkg.name && pkg.version)
        return { name: pkg.name, version: pkg.version }
    }
    catch { /* ignore */ }
  }

  // Try build.zig.zon (zig packages)
  const zonPath = path.join(cwd, 'build.zig.zon')
  if (fs.existsSync(zonPath)) {
    try {
      const content = fs.readFileSync(zonPath, 'utf-8')
      const nameMatch = content.match(/\.name\s*=\s*(?:\.@"([^"]+)"|\.(\w+)|"([^"]+)")/)
      const versionMatch = content.match(/\.version\s*=\s*"([^"]+)"/)
      if (nameMatch && versionMatch)
        return { name: nameMatch[1] || nameMatch[2] || nameMatch[3], version: versionMatch[1] }
    }
    catch { /* ignore */ }
  }

  return { name: 'unknown', version: 'unknown' }
}

/** Send release notifications to all configured webhooks */
async function sendNotifications(inputs: ActionInputs): Promise<void> {
  const hasWebhook = inputs.discordWebhook || inputs.slackWebhook
  if (!hasWebhook) return

  const cwd = process.cwd()
  const pkg = detectPackageInfo(cwd)
  const repo = process.env.GITHUB_REPOSITORY || ''
  const sha = (process.env.GITHUB_SHA || '').slice(0, 7)
  const ref = process.env.GITHUB_REF_NAME || ''
  const actor = process.env.GITHUB_ACTOR || ''
  const runUrl = `${process.env.GITHUB_SERVER_URL || 'https://github.com'}/${repo}/actions/runs/${process.env.GITHUB_RUN_ID || ''}`
  const repoUrl = `${process.env.GITHUB_SERVER_URL || 'https://github.com'}/${repo}`
  const title = inputs.notificationTitle || `${pkg.name}@${pkg.version} — Published`

  if (inputs.discordWebhook) {
    await sendDiscordNotification(inputs.discordWebhook, {
      title,
      pkg,
      repo,
      sha,
      ref,
      actor,
      runUrl,
      repoUrl,
      mentions: inputs.notificationMentions,
      publishType: inputs.publish,
    })
  }

  if (inputs.slackWebhook) {
    await sendSlackNotification(inputs.slackWebhook, {
      title,
      pkg,
      repo,
      sha,
      ref,
      actor,
      runUrl,
      repoUrl,
      mentions: inputs.notificationMentions,
      publishType: inputs.publish,
    })
  }
}

interface NotificationContext {
  title: string
  pkg: { name: string, version: string }
  repo: string
  sha: string
  ref: string
  actor: string
  runUrl: string
  repoUrl: string
  mentions: string
  publishType: string
}

async function sendDiscordNotification(webhookUrl: string, ctx: NotificationContext): Promise<void> {
  core.startGroup('Discord notification')
  try {
    const npmUrl = ctx.publishType === 'npm' ? `https://www.npmjs.com/package/${ctx.pkg.name}` : ''
    const fields = [
      { name: 'Package', value: `\`${ctx.pkg.name}@${ctx.pkg.version}\``, inline: true },
      { name: 'Type', value: ctx.publishType, inline: true },
      { name: 'Actor', value: ctx.actor, inline: true },
    ]

    if (ctx.ref)
      fields.push({ name: 'Tag', value: `\`${ctx.ref}\``, inline: true })
    if (ctx.sha)
      fields.push({ name: 'Commit', value: `[\`${ctx.sha}\`](${ctx.repoUrl}/commit/${process.env.GITHUB_SHA || ctx.sha})`, inline: true })
    if (npmUrl)
      fields.push({ name: 'npm', value: `[View on npm](${npmUrl})`, inline: true })

    fields.push({ name: 'Workflow', value: `[View run](${ctx.runUrl})`, inline: false })

    const payload: Record<string, unknown> = {
      embeds: [{
        title: ctx.title,
        color: 3066993, // green
        fields,
        timestamp: new Date().toISOString(),
      }],
    }

    if (ctx.mentions)
      payload.content = ctx.mentions

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!response.ok)
      core.warning(`Discord notification failed: HTTP ${response.status}`)
    else
      core.info('Discord notification sent')
  }
  catch {
    core.warning('Discord notification failed')
  }
  core.endGroup()
}

async function sendSlackNotification(webhookUrl: string, ctx: NotificationContext): Promise<void> {
  core.startGroup('Slack notification')
  try {
    const npmUrl = ctx.publishType === 'npm' ? `https://www.npmjs.com/package/${ctx.pkg.name}` : ''
    const lines = [
      `*${ctx.title}*`,
      `*Package:* \`${ctx.pkg.name}@${ctx.pkg.version}\``,
      `*Type:* ${ctx.publishType}`,
      `*Actor:* ${ctx.actor}`,
    ]

    if (ctx.ref)
      lines.push(`*Tag:* \`${ctx.ref}\``)
    if (ctx.sha)
      lines.push(`*Commit:* <${ctx.repoUrl}/commit/${process.env.GITHUB_SHA || ctx.sha}|\`${ctx.sha}\`>`)
    if (npmUrl)
      lines.push(`*npm:* <${npmUrl}|View on npm>`)

    lines.push(`<${ctx.runUrl}|View workflow run>`)

    if (ctx.mentions)
      lines.push(ctx.mentions)

    const payload = {
      text: lines.join('\n'),
      unfurl_links: false,
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!response.ok)
      core.warning(`Slack notification failed: HTTP ${response.status}`)
    else
      core.info('Slack notification sent')
  }
  catch {
    core.warning('Slack notification failed')
  }
  core.endGroup()
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
      token: core.getInput('token') || '',
      discordWebhook: core.getInput('discord-webhook') || '',
      slackWebhook: core.getInput('slack-webhook') || '',
      notificationTitle: core.getInput('notification-title') || '',
      notificationMentions: core.getInput('notification-mentions') || '',
      release: core.getInput('release') === 'true',
      releaseFiles: core.getInput('release-files') || '',
      releaseTag: core.getInput('release-tag') || process.env.GITHUB_REF_NAME || '',
      releaseDraft: core.getInput('release-draft') === 'true',
      releasePrerelease: core.getInput('release-prerelease') === 'true',
      releaseNotes: core.getInput('release-notes') || '',
      releaseChangelog: core.getInput('release-changelog') || 'CHANGELOG.md',
      releaseToken: core.getInput('release-token') || process.env.GITHUB_TOKEN || '',
    }

    // Mask secrets so they never appear in logs
    if (inputs.discordWebhook)
      core.setSecret(inputs.discordWebhook)
    if (inputs.slackWebhook)
      core.setSecret(inputs.slackWebhook)
    if (inputs.releaseToken)
      core.setSecret(inputs.releaseToken)

    // Export registry token as env vars for subsequent steps (e.g. pantry publish:commit)
    const token = inputs.token || process.env.PANTRY_TOKEN || process.env.PANTRY_REGISTRY_TOKEN || ''
    if (token) {
      core.exportVariable('PANTRY_TOKEN', token)
      core.exportVariable('PANTRY_REGISTRY_TOKEN', token)
      core.setSecret(token)
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

    // If setup-only with no packages, skip to publish/release (if any)
    if (inputs.setupOnly && !inputs.packages) {
      // Still configure PATH so pantry-installed bins are available
      if (fs.existsSync(pantryBinDir))
        core.addPath(pantryBinDir)
      core.addPath(path.join(homeDir, '.pantry', 'bin'))

      if (inputs.publish) {
        await publishPackage(inputs.publish, inputs.registryUrl, cwd)
        await sendNotifications(inputs)
      }
      if (inputs.release)
        await createGitHubRelease(inputs)
      core.info('Setup complete')
      return
    }

    // ── Install deps with caching ──
    const lockfile = findLockfile()
    const depsFileForKey = findDepsFile()
    const resolvedVer = ver.trim().split(' ').pop()?.split('(')[0]?.trim() || resolvedVersion
    const lockHash = lockfile ? hashFile(lockfile) : 'no-lock'
    // Avoid hashing the same file twice when lockfile == depsFile
    const depsHash = (depsFileForKey && depsFileForKey !== lockfile) ? hashFile(depsFileForKey) : ''
    const cacheKey = `pantry-v2-${resolvedVer}-${platform.os}-${platform.arch}-${lockHash}-${depsHash}-${inputs.packages || 'all'}`
    // Restore keys: try same OS/arch with any lock hash
    const restoreKeys = [
      `pantry-v2-${resolvedVer}-${platform.os}-${platform.arch}-`,
    ]
    let cacheHit = false

    // Try restoring from cache
    try {
      const hit = await cache.restoreCache([pantryDir], cacheKey, restoreKeys)
      if (hit) {
        // Verify cache is valid — .bin dir should exist with actual binaries
        const binDirExists = fs.existsSync(pantryBinDir)
        const hasEntries = binDirExists && fs.readdirSync(pantryBinDir).length > 0
        if (hasEntries) {
          cacheHit = true
          core.info(`Cache hit: ${hit}`)
        }
        else {
          core.info('Cache restored but incomplete — reinstalling')
        }
      }
    }
    catch {
      // cache miss or unavailable
    }

    // Even on cache hit, verify critical system deps exist and install if missing
    if (cacheHit) {
      const installEnv = { ...process.env, CI: 'true', NO_COLOR: '1' }
      const systemDeps = extractSystemDeps()
      const isWin = platform.os === 'windows'
      const missingDeps = systemDeps.filter(dep => {
        const baseName = getBinName(dep)
        const binName = isWin ? `${baseName}.exe` : baseName
        return !fs.existsSync(path.join(pantryBinDir, binName)) && !fs.existsSync(path.join(pantryBinDir, baseName))
      })
      if (missingDeps.length > 0) {
        core.info(`Cache hit but missing: ${missingDeps.join(', ')} — installing`)
        for (const dep of missingDeps) {
          try {
            await installSystemPackage(dep, pantryDir)
          }
          catch {
            core.warning(`Failed to install ${dep}`)
          }
        }
      }
    }

    if (!cacheHit) {
      const installEnv = { ...process.env, CI: 'true', NO_COLOR: '1' }

      // Collect all system packages to install (from explicit input + deps files)
      const systemDeps = inputs.packages
        ? inputs.packages.split(/\s+/).filter(Boolean)
        : extractSystemDeps()

      if (systemDeps.length > 0) {
        core.startGroup(`Installing system packages: ${systemDeps.join(', ')}`)
        // Use the pantry TS installer SDK — works cross-platform via Node.js APIs
        for (const dep of systemDeps) {
          try {
            await installSystemPackage(dep, pantryDir)
          }
          catch (e) {
            core.warning(`${dep}: ${e instanceof Error ? e.message : 'install failed'}`)
          }
        }
        core.endGroup()
      }

      if (!inputs.packages) {
        // Also run workspace install for JS deps (package.json)
        core.startGroup('Installing workspace dependencies')
        await exec.exec('pantry', ['install', '--no-save'], {
          env: installEnv as { [key: string]: string },
        }).catch(() => {
          core.warning('pantry workspace install failed')
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

    // ── Ensure installed binaries are executable ──
    // Some extracted archives (e.g. zig from ziglang.org) may lose +x during copy
    if (platform.os !== 'windows') {
      try {
        const binEntries = fs.readdirSync(pantryBinDir)
        for (const entry of binEntries) {
          const binPath = path.join(pantryBinDir, entry)
          try {
            fs.chmodSync(binPath, 0o755)
          }
          catch { /* not a file or already executable */ }
          // Also chmod the symlink target if it's a symlink
          try {
            const realPath = fs.realpathSync(binPath)
            fs.chmodSync(realPath, 0o755)
          }
          catch { /* not a symlink */ }
        }
      }
      catch { /* .bin dir may not exist yet */ }
    }

    // ── Configure PATH ──
    core.addPath(pantryBinDir)
    core.addPath(path.join(homeDir, '.pantry', 'bin'))

    // Also add any zig install directories to PATH (zig is installed into
    // pantry/zig/<version>/ or ~/.pantry/global/packages/ziglang.org/v<version>/)
    const zigDirs = [
      path.join(pantryDir, 'zig'),
      path.join(homeDir, '.pantry', 'global', 'packages', 'ziglang.org'),
    ]
    for (const zigParent of zigDirs) {
      try {
        if (fs.existsSync(zigParent)) {
          for (const entry of fs.readdirSync(zigParent)) {
            const zigBinDir = path.join(zigParent, entry)
            const zigExe = path.join(zigBinDir, platform.os === 'windows' ? 'zig.exe' : 'zig')
            if (fs.existsSync(zigExe)) {
              core.addPath(zigBinDir)
              core.info(`Added zig to PATH: ${zigBinDir}`)
            }
          }
        }
      }
      catch { /* zig not installed */ }
    }

    // ── Ensure bun symlinks ──
    const bunPath = path.join(pantryBinDir, 'bun')
    const bunxPath = path.join(pantryBinDir, 'bunx')
    try {
      if (fs.existsSync(bunPath)) {
        if (!fs.existsSync(bunxPath))
          fs.symlinkSync(bunPath, bunxPath)
        core.exportVariable('BUN_INSTALL', pantryDir)
      }
    }
    catch { /* bun not in deps */ }

    // ── Publish ──
    if (inputs.publish) {
      await publishPackage(inputs.publish, inputs.registryUrl, cwd)
      await sendNotifications(inputs)
    }

    // ── GitHub Release ──
    if (inputs.release) {
      await createGitHubRelease(inputs)
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

  // Write manifest and auth to temp files to avoid leaking secrets in process args
  const manifestPath = path.join(os.tmpdir(), `${name}-manifest.zon`)
  const headerFile = path.join(os.tmpdir(), `${name}-auth-header`)
  fs.writeFileSync(manifestPath, zonContent)
  fs.writeFileSync(headerFile, `Authorization: Bearer ${token}`, { mode: 0o600 })

  let output = ''
  let stderr = ''
  const exitCode = await exec.exec('curl', [
    '-s', '-w', '\\n%{http_code}',
    '-X', 'POST', url,
    '-H', `@${headerFile}`,
    '-F', `tarball=@${tarballPath};filename=${tarballName}`,
    '-F', `manifest=<${manifestPath}`,
  ], {
    listeners: {
      stdout: (d: Buffer) => { output += d.toString() },
      stderr: (d: Buffer) => { stderr += d.toString() },
    },
    ignoreReturnCode: true,
  })

  // Clean up
  fs.unlinkSync(tarballPath)
  fs.unlinkSync(manifestPath)
  try { fs.unlinkSync(headerFile) } catch { /* already cleaned */ }

  if (exitCode !== 0) {
    throw new Error(`curl failed (exit ${exitCode}): ${stderr || output}`)
  }

  // Parse response — last line is HTTP status code from -w
  const lines = output.trim().split('\n')
  const httpCode = Number.parseInt(lines.pop() || '0', 10)
  const body = lines.join('\n')

  if (httpCode === 409 || body.includes('already exists')) {
    core.info(`${name}@${version} already published — skipping`)
    return
  }

  if (httpCode >= 400) {
    throw new Error(`Publish failed (HTTP ${httpCode}): ${body}`)
  }

  try {
    const result = JSON.parse(body)
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
    core.warning(`Unexpected response: ${body}`)
    throw e
  }

  core.endGroup()
}

/** Extract changelog content for a specific version from CHANGELOG.md */
function extractChangelogForVersion(changelogPath: string, tag: string): string {
  try {
    if (!fs.existsSync(changelogPath)) {
      core.warning(`Changelog not found: ${changelogPath}`)
      return ''
    }

    const content = fs.readFileSync(changelogPath, 'utf-8')
    const version = tag.startsWith('v') ? tag.substring(1) : tag
    // Escape dots for regex and match version with optional v prefix to handle both "0.2.0" and "v0.2.0"
    const versionRe = new RegExp(`\\bv?${version.replace(/\./g, '\\.')}\\b`)

    const lines = content.split('\n')
    let capturing = false
    const result: string[] = []

    for (const line of lines) {
      const lower = line.toLowerCase()

      // Match [compare changes] links or ## headings containing our exact version
      const isVersionHeader = (lower.includes('[compare changes]') || /^#{1,3}\s/.test(line)) && versionRe.test(line)

      if (!capturing && isVersionHeader) {
        capturing = true
        result.push(line)
        continue
      }

      // Stop at the next version section
      if (capturing && (lower.includes('[compare changes]') || /^#{1,3}\s+v?\d+\.\d+/.test(line)))
        break

      if (capturing)
        result.push(line)
    }

    const extracted = result.join('\n').trim()
    if (extracted)
      core.info(`Extracted ${result.length} lines from changelog for ${tag}`)
    else
      core.warning(`No changelog content found for ${tag}`)

    return extracted
  }
  catch (error) {
    core.warning(`Changelog extraction failed: ${error instanceof Error ? error.message : String(error)}`)
    return ''
  }
}

/** Create a GitHub release with optional file attachments and changelog */
/**
 * Auto-discover and package built binaries into platform-named zip archives.
 * Looks in standard Zig build output dirs (zig-out/bin/, zig-out/cross/)
 * and creates dist/*.zip files ready for GitHub release upload.
 *
 * Returns glob patterns for the packaged files.
 */
async function packageBuildArtifacts(cwd: string): Promise<string[]> {
  const distDir = path.join(cwd, 'dist')
  fs.mkdirSync(distDir, { recursive: true })

  const zigOut = path.join(cwd, 'packages', 'zig', 'zig-out')
  if (!fs.existsSync(zigOut)) return []

  const packaged: string[] = []
  const { name } = detectPackageInfo(cwd)
  const baseName = name.replace(/\.org$|\.com$|\.dev$|\.io$/, '').replace(/[^a-z0-9]/g, '')

  // Package native binary
  const nativeBin = path.join(zigOut, 'bin')
  if (fs.existsSync(nativeBin)) {
    const platform = detectPlatform()
    const archStr = platform.arch === 'arm64' ? 'arm64' : 'x64'
    const zipName = `${baseName}-${platform.os}-${archStr}.zip`
    const zipPath = path.join(distDir, zipName)

    const entries = fs.readdirSync(nativeBin).filter(f => !f.startsWith('.'))
    if (entries.length > 0) {
      await exec.exec('zip', ['-j', zipPath, ...entries.map(e => path.join(nativeBin, e))])
      packaged.push(zipPath)
      core.info(`Packaged: ${zipName}`)
    }
  }

  // Package cross-compiled binaries
  const crossDir = path.join(zigOut, 'cross')
  if (fs.existsSync(crossDir)) {
    for (const target of fs.readdirSync(crossDir)) {
      const targetDir = path.join(crossDir, target)
      if (!fs.statSync(targetDir).isDirectory()) continue

      const zipName = `${baseName}-${target}.zip`
      const zipPath = path.join(distDir, zipName)

      const entries = fs.readdirSync(targetDir).filter(f => !f.startsWith('.'))
      if (entries.length > 0) {
        await exec.exec('zip', ['-j', zipPath, ...entries.map(e => path.join(targetDir, e))])
        packaged.push(zipPath)
        core.info(`Packaged: ${zipName}`)
      }
    }
  }

  return packaged
}

async function createGitHubRelease(inputs: ActionInputs): Promise<void> {
  core.startGroup('GitHub release')

  const token = inputs.releaseToken
  if (!token)
    throw new Error('GitHub token is required for creating releases (set release-token or GITHUB_TOKEN)')

  const octokit = github.getOctokit(token)
  const { owner, repo } = github.context.repo
  const tag = inputs.releaseTag

  // Resolve file patterns — auto-discover if no explicit files given
  let filePatterns = inputs.releaseFiles.split('\n').map(p => p.trim()).filter(Boolean)
  if (filePatterns.length === 0 || (filePatterns.length === 1 && filePatterns[0] === 'auto')) {
    // Auto-package build artifacts
    core.info('Auto-packaging build artifacts...')
    const packaged = await packageBuildArtifacts(process.cwd())
    filePatterns = packaged.length > 0 ? ['dist/*.zip'] : []
  }
  const files: string[] = []
  for (const pattern of filePatterns) {
    const globber = await glob.create(pattern)
    files.push(...await globber.glob())
  }
  core.info(`Matched ${files.length} file(s) from ${filePatterns.length} pattern(s)`)

  // Get or create release
  let releaseId: number
  let releaseUrl = ''
  const body = extractChangelogForVersion(inputs.releaseChangelog, tag) || inputs.releaseNotes
  try {
    const { data: existing } = await octokit.rest.repos.getReleaseByTag({ owner, repo, tag })
    releaseId = existing.id
    releaseUrl = existing.html_url
    core.info(`Found existing release: ${tag} (${releaseId})`)

    // Update body with changelog if the existing release has no body
    if (body && !existing.body) {
      await octokit.rest.repos.updateRelease({ owner, repo, release_id: releaseId, body })
      core.info('Updated release body with changelog')
    }
  }
  catch {
    const { data: created } = await octokit.rest.repos.createRelease({
      owner,
      repo,
      tag_name: tag,
      name: tag,
      body,
      draft: inputs.releaseDraft,
      prerelease: inputs.releasePrerelease,
    })
    releaseId = created.id
    releaseUrl = created.html_url
    core.info(`Created release: ${tag} (${releaseId})`)
  }

  // Upload assets
  for (const file of files) {
    const name = path.basename(file)
    try {
      const data = fs.readFileSync(file)
      const size = fs.statSync(file).size
      await octokit.rest.repos.uploadReleaseAsset({
        owner,
        repo,
        release_id: releaseId,
        name,
        data: data as unknown as string,
        headers: {
          'content-type': 'application/octet-stream',
          'content-length': size,
        },
      })
      core.info(`Uploaded: ${name} (${(size / 1024).toFixed(1)} KB)`)
    }
    catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      // Asset already exists (409/422) — delete and retry once
      if (msg.includes('already_exists') || msg.includes('already exists')) {
        try {
          const { data: assets } = await octokit.rest.repos.listReleaseAssets({ owner, repo, release_id: releaseId })
          const existing = assets.find(a => a.name === name)
          if (existing) {
            await octokit.rest.repos.deleteReleaseAsset({ owner, repo, asset_id: existing.id })
            const data = fs.readFileSync(file)
            const size = fs.statSync(file).size
            await octokit.rest.repos.uploadReleaseAsset({
              owner, repo, release_id: releaseId, name,
              data: data as unknown as string,
              headers: { 'content-type': 'application/octet-stream', 'content-length': size },
            })
            core.info(`Replaced: ${name} (${(size / 1024).toFixed(1)} KB)`)
            continue
          }
        }
        catch { /* retry failed, fall through to warning */ }
      }
      core.warning(`Failed to upload ${name}: ${msg}`)
    }
  }

  if (releaseUrl)
    core.setOutput('release-url', releaseUrl)

  core.info(`Release complete: ${files.length} file(s) attached`)
  core.endGroup()
}

run()
