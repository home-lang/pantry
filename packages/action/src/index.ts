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
    }

    // Mask webhook URLs so they never appear in logs
    if (inputs.discordWebhook)
      core.setSecret(inputs.discordWebhook)
    if (inputs.slackWebhook)
      core.setSecret(inputs.slackWebhook)

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

    // If setup-only with no packages, skip to publish (if any)
    if (inputs.setupOnly && !inputs.packages) {
      if (inputs.publish) {
        await publishPackage(inputs.publish, inputs.registryUrl, cwd)
        await sendNotifications(inputs)
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
        }).catch(() => {
          core.warning('pantry install failed — will try fallback for critical deps (bun)')
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
      else {
        // Bun not installed via pantry (S3 download may have failed)
        // Fall back to direct bun install
        core.info('Bun not found in pantry — installing via direct download')
        const bunInstallDir = path.join(pantryDir, 'bun')
        await exec.exec('bash', ['-c', `curl -fsSL https://bun.sh/install | BUN_INSTALL="${bunInstallDir}" bash`])
        const directBunPath = path.join(bunInstallDir, 'bin', 'bun')
        if (fs.existsSync(directBunPath)) {
          // Symlink into pantry bin
          try { fs.symlinkSync(directBunPath, bunPath) }
          catch { /* already exists */ }
          try {
            if (!fs.existsSync(bunxPath))
              fs.symlinkSync(directBunPath, bunxPath)
          }
          catch { /* already exists */ }
          core.exportVariable('BUN_INSTALL', bunInstallDir)
          core.addPath(path.join(bunInstallDir, 'bin'))
          core.info('Bun installed via direct download')
        }
      }
    }
    catch (e) {
      core.warning(`Bun setup warning: ${e}`)
    }

    // ── Ensure zig works ──
    const zigPath = path.join(pantryBinDir, 'zig')
    try {
      if (!fs.existsSync(zigPath)) {
        // Zig not installed via pantry — install via mlugg/setup-zig pattern
        core.info('Zig not found in pantry — installing via direct download')
        const platform = process.platform === 'darwin' ? 'macos' : 'linux'
        const arch = process.arch === 'arm64' ? 'aarch64' : 'x86_64'
        const zigVersion = '0.14.1'
        const zigUrl = `https://ziglang.org/download/${zigVersion}/zig-${platform}-${arch}-${zigVersion}.tar.xz`
        const zigInstallDir = path.join(pantryDir, 'zig-install')

        await exec.exec('bash', ['-c', [
          `mkdir -p "${zigInstallDir}"`,
          `curl -fsSL "${zigUrl}" | tar xJ --strip-components=1 -C "${zigInstallDir}"`,
        ].join(' && ')])

        if (fs.existsSync(path.join(zigInstallDir, 'zig'))) {
          core.addPath(zigInstallDir)
          core.info(`Zig ${zigVersion} installed via direct download`)
        }
      }
    }
    catch (e) {
      core.warning(`Zig setup warning: ${e}`)
    }

    // ── Publish ──
    if (inputs.publish) {
      await publishPackage(inputs.publish, inputs.registryUrl, cwd)
      await sendNotifications(inputs)
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

  // Write manifest to temp file to avoid shell escaping issues with multiline content
  const manifestPath = path.join(os.tmpdir(), `${name}-manifest.zon`)
  fs.writeFileSync(manifestPath, zonContent)

  let output = ''
  let stderr = ''
  const exitCode = await exec.exec('curl', [
    '-s', '-w', '\\n%{http_code}',
    '-X', 'POST', url,
    '-H', `Authorization: Bearer ${token}`,
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

run()
