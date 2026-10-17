import type { ActionInputs, Platform } from './types'
import { preferArchivedReleaseAssets, rawAssetNamesForArchives, resolveReleaseFilePatterns } from './release-assets'
import { normalizeReleaseMakeLatest, resolveSemanticMakeLatest } from './release-latest'
import { downloadReleaseAssetReliably } from './release-download'
import { isRetryableGitHubReleaseError, retryGitHubReleaseOperation, uploadReleaseAssetReliably } from './release-upload'
import { deliverReleaseToAppStore } from './release-app-store'
import { setupAppleSigning } from './apple-signing'
import { createReleaseManifest, writeReleaseManifest } from './release-manifest'
import type { ReleaseClient } from './release-draft'
import { findReleaseForTag, settleCreatedDraft } from './release-draft'
import { mirrorReleaseToS3 } from './release-s3'
import { isRollingVersionSpec, normalizeLockedVersion, reassertVersionSpec, shouldUseLockedVersion } from './lock-version'
import { setupBunRuntime } from './bun-runtime'
import { ensurePackageExecutorAliases } from './executor-aliases'
import { installRequiredSystemPackages, jsPackageManager, needsJsInstall, pantryConfigMaySetLinker, selectSystemPackages, shouldInstallWorkspace } from './install-mode'
import { installResolvedSystemPackage } from './system-packages'
import { nativeArtifactCacheIdentity } from './native-cache'
import type { ServiceSpec } from './services'
import { mergeServicePackages, nativeServiceEnvironment, parseRedisVersion, parseServiceSpecs, readServiceLog, redisLaunchArgs, waitForRedisPid } from './services'
import type { NativeServiceState } from './native-services'
import { startNativeService } from './native-services'
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

/**
 * Lenient boolean input parser. GitHub Actions passes every input as a string,
 * and `core.getBooleanInput` throws on anything but `true`/`false` (any case).
 * Accept the common forms — true/false, 1/0, yes/no, on/off — so both quoted
 * (`release: 'true'`) and bare YAML booleans (`release: true`) work, and fall
 * back to `fallback` when the input is empty.
 */
export function boolInput(name: string, fallback: boolean): boolean {
  const raw = core.getInput(name).trim().toLowerCase()
  if (raw === '')
    return fallback
  if (raw === 'true' || raw === '1' || raw === 'yes' || raw === 'on')
    return true
  if (raw === 'false' || raw === '0' || raw === 'no' || raw === 'off')
    return false
  throw new Error(`Input "${name}" must be a boolean (true/false), got: ${raw}`)
}

const REPO = 'pantry-pm/pantry'

async function installRequestedServicePackages(services: ServiceSpec[], pantryExecutable: string, platform: Platform): Promise<void> {
  if (!services.length) return
  if (platform.os === 'windows') throw new Error('Pantry Action services are not yet supported on Windows runners')

  core.startGroup(`Installing service packages through Pantry: ${services.map(service => service.packageSpec).join(', ')}`)
  try {
    for (const service of services) {
      const exitCode = await exec.exec(pantryExecutable, ['install', service.packageSpec, '--no-save'], {
        env: { ...process.env, CI: 'true', NO_COLOR: '1' } as { [key: string]: string },
      })
      if (exitCode !== 0) throw new Error(`Pantry could not install service package ${service.packageSpec}`)
    }
  }
  finally {
    core.endGroup()
  }
}

function configureNativeLibraryEnvironment(pantryBinDir: string, platform: Platform): Record<string, string> {
  const serviceEnvironment = nativeServiceEnvironment(pantryBinDir, platform.os)
  const libraryVariable = platform.os === 'darwin' ? 'DYLD_LIBRARY_PATH' : 'LD_LIBRARY_PATH'
  if (serviceEnvironment[libraryVariable])
    core.exportVariable(libraryVariable, serviceEnvironment[libraryVariable])
  return serviceEnvironment
}

async function startRequestedServices(services: ServiceSpec[], pantryBinDir: string, platform: Platform): Promise<void> {
  const serviceEnvironment = configureNativeLibraryEnvironment(pantryBinDir, platform)
  if (!services.length) return
  if (platform.os === 'windows') throw new Error('Pantry Action services are not yet supported on Windows runners')

  const nativeStates: NativeServiceState[] = []
  for (const service of services) {
    if (service.name !== 'redis') {
      core.startGroup(`Starting Pantry ${service.name} service`)
      try {
        const started = await startNativeService(service, pantryBinDir, process.env.RUNNER_TEMP || os.tmpdir())
        nativeStates.push(started.state)
        core.saveState('native-services', JSON.stringify(nativeStates))
        for (const [key, value] of Object.entries(started.environment)) {
          if (/PASSWORD|API_KEY/.test(key)) core.setSecret(value)
          core.exportVariable(key, value)
        }
        core.setOutput(`${service.name}-url`, started.environment[service.name === 'postgres' ? 'POSTGRES_URL' : 'TYPESENSE_URL'])
        core.setOutput(`${service.name}-version`, started.version)
        core.info(`${service.name} ${started.version} is healthy with private job data`)
      }
      finally { core.endGroup() }
      continue
    }
    const serviceDir = path.join(process.env.RUNNER_TEMP || os.tmpdir(), 'pantry-services', 'redis')
    fs.mkdirSync(serviceDir, { recursive: true })
    const server = path.join(pantryBinDir, 'redis-server')
    const client = path.join(pantryBinDir, 'redis-cli')
    const pidfile = path.join(serviceDir, 'redis.pid')
    const logfile = path.join(serviceDir, 'redis.log')
    if (!fs.existsSync(server) || !fs.existsSync(client))
      throw new Error('Redis service binaries were not installed into pantry/.bin')

    core.startGroup('Starting Pantry Redis service')
    try {
      await exec.exec(server, redisLaunchArgs(process.env.RUNNER_TEMP || os.tmpdir()), { env: serviceEnvironment })
      let pid: number
      try {
        pid = await waitForRedisPid(pidfile)
      }
      catch (error) {
        throw new Error(`${error instanceof Error ? error.message : String(error)}\nRedis startup log:\n${readServiceLog(logfile)}`)
      }
      core.saveState('redis-cli', client)
      core.saveState('redis-started', 'true')

      let ready = false
      for (let attempt = 0; attempt < 60; attempt++) {
        const exitCode = await exec.exec(client, ['-h', '127.0.0.1', '-p', '6379', 'ping'], {
          env: serviceEnvironment,
          silent: true,
        }).catch(() => 1)
        if (exitCode === 0) {
          ready = true
          break
        }
        await new Promise(resolve => setTimeout(resolve, 500))
      }
      if (!ready) throw new Error(`Redis did not become healthy. Startup log:\n${readServiceLog(logfile)}`)

      let versionOutput = ''
      await exec.exec(server, ['--version'], {
        env: serviceEnvironment,
        listeners: { stdout: (data: Buffer) => { versionOutput += data.toString() } },
        silent: true,
      })
      const version = parseRedisVersion(versionOutput)
      if (service.expectedVersion && service.expectedVersion !== version)
        throw new Error(`Redis service requested ${service.expectedVersion} but installed ${version}`)
      const url = 'redis://127.0.0.1:6379/0'
      core.exportVariable('REDIS_URL', url)
      core.exportVariable('REDIS_SERVICE_VERSION', version)
      core.setOutput('redis-url', url)
      core.setOutput('redis-version', version)
      core.info(`Redis ${version} (pid ${pid}) is healthy at ${url}`)
    }
    finally {
      core.endGroup()
    }
  }
}

function detectPlatform(): Platform {
  const platform = os.platform()
  const arch = os.arch()

  const osName = platform === 'darwin' ? 'darwin' : platform === 'win32' ? 'windows' : 'linux'
  if (arch !== 'arm64' && arch !== 'x64') {
    core.warning(`Unexpected architecture '${arch}', defaulting to x64`)
  }
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

  // URL will be like https://github.com/pantry-pm/pantry/releases/tag/v0.8.16
  const tagMatch = redirectOutput.trim().match(/\/tag\/(.+)$/)
  if (tagMatch)
    return tagMatch[1].replace(/^v/, '')

  // Last resort: GitHub API with auth (use fetch instead of curl to avoid token exposure in process args)
  const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN || ''
  let apiOutput = ''
  try {
    const headers: Record<string, string> = { 'User-Agent': 'pantry-action' }
    if (token) headers.Authorization = `token ${token}`
    const res = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`, { headers })
    if (res.ok) apiOutput = await res.text()
  }
  catch { apiOutput = '' }

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
    if (cached) {
      ensurePackageExecutorAliases(cached, platform)
      return cached
    }
  }

  // Use /releases/latest/download for non-semver versions (like 'main', 'latest')
  const isSemver = /^\d+\.\d+/.test(version)
  const url = !isSemver
    ? `https://github.com/${REPO}/releases/latest/download/${platform.assetName}`
    : `https://github.com/${REPO}/releases/download/v${version}/${platform.assetName}`

  const zipPath = await downloadReleaseAssetReliably(
    `Pantry ${version} ${platform.os}-${platform.arch} release asset`,
    () => tc.downloadTool(url),
    { onRetry: message => core.warning(message) },
  )
  const dir = await tc.extractZip(zipPath)

  if (platform.os !== 'windows')
    await exec.exec('chmod', ['+x', path.join(dir, platform.binaryName)])

  const installDir = version !== 'latest' ? await tc.cacheDir(dir, 'pantry', version, platform.arch) : dir
  ensurePackageExecutorAliases(installDir, platform)
  return installDir
}

/** Hash a file's contents for cache key */
function hashFile(filePath: string): string {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    return crypto.createHash('sha256').update(content).digest('hex')
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
 * Bootstrap standalone runtimes with the SDK and install registry packages
 * through the native Pantry resolver, including their runtime dependencies.
 * Package aliases and version selection are shared with the SDK.
 *
 * Version resolution precedence: explicit `@x.y.z` in spec > pantry.lock pin
 * *if it satisfies the spec* > deps file spec > latest. Semver ranges (`^`,
 * `~`, etc.) and `latest`/`*`/empty are passed through to `installPackage`,
 * which resolves them against the package's known-version list.
 *
 * A lock pin that doesn't satisfy the declared spec (e.g. deps bumped from
 * ^1.3.11 to ^1.3.13 while lockfile still pins 1.3.11) is treated as stale
 * and ignored — we log a warning so it's visible in CI and resolve the spec
 * normally. Writing back to pantry.lock from inside the action isn't safe in
 * CI (immutable checkout), so the user needs to re-run `pantry install`
 * locally to refresh the lock.
 */
/**
 * Versions the registry still publishes for this runner's platform, or
 * undefined when we could not find out.
 *
 * Undefined is meaningfully different from empty: it means "unknown", and the
 * caller falls back to resolving the channel rather than assuming a pin is
 * gone. A registry hiccup must never turn into a wrong version.
 */
async function publishedRegistryVersions(
  installer: typeof import('../../ts-pantry/src/installer'),
  domain: string,
): Promise<string[] | undefined> {
  try {
    const platform = installer.detectPlatform()
    const response = await fetch(
      `https://registry.pantry.dev/binaries/${encodeURI(domain)}/metadata.json`,
      { signal: AbortSignal.timeout(15_000) },
    )
    if (!response.ok)
      return undefined
    return installer.registryVersionsForPlatform(await response.json() as never, platform)
  }
  catch {
    return undefined
  }
}

async function installSystemPackage(
  spec: string,
  pantryDir: string,
  lockedVersions: Map<string, string>,
  pantryExecutable: string,
  resolvedVersions?: Map<string, string>,
  reuseResolved = false,
): Promise<void> {
  // Import from the pantry TS installer SDK
  const installer = await import('../../ts-pantry/src/installer')

  const [rawName, rawVersion = ''] = spec.includes('@') ? spec.split('@', 2) : [spec, '']
  const domain = resolvePackageDomain(rawName)

  const pinned = lockedVersions.get(domain)
  const declaredVersion = reuseResolved
    ? reassertVersionSpec(domain, rawVersion, resolvedVersions || new Map())
    : rawVersion
  // Only a rolling spec needs this, and only when there is a pin to validate:
  // one small metadata read decides whether we can keep the toolchain already
  // in the runner's cache instead of pulling the newest build again.
  const publishedVersions = pinned && isRollingVersionSpec(domain, rawVersion)
    ? await publishedRegistryVersions(installer, domain)
    : undefined
  let version: string
  let source: string
  if (reuseResolved && declaredVersion !== rawVersion) {
    version = declaredVersion
    source = ' (from this action run)'
  }
  else if (pinned && shouldUseLockedVersion(domain, pinned, rawVersion, publishedVersions)) {
    version = normalizeLockedVersion(domain, pinned)
    source = ' (from pantry.lock)'
  }
  else {
    if (pinned && rawVersion && !isRollingVersionSpec(domain, rawVersion)) {
      core.warning(
        `${domain}: pantry.lock pins ${pinned} but deps spec is ${rawVersion} — `
        + `lockfile is stale, resolving spec instead. Run \`pantry install\` locally to refresh.`,
      )
    }
    version = rawVersion || 'latest'
    source = rawVersion ? ' (from deps spec)' : ' (defaulted to latest)'
  }

  core.info(`Installing ${domain}@${version} via ${installer.isSupported(domain) ? 'Pantry SDK' : 'Pantry native dependency resolver'}${source}`)
  // `installPackage` handles "latest", "*", empty, semver ranges, and concrete
  // versions — don't pre-resolve here or semver ranges get flattened to latest.
  const installed = await installResolvedSystemPackage(domain, version, {
    installDir: pantryDir,
    onRetry: message => core.warning(message),
    nativeInstall: packageSpec => exec.exec(pantryExecutable, ['install', packageSpec, '--no-save'], {
      cwd: path.dirname(pantryDir),
      env: { ...process.env, CI: 'true', NO_COLOR: '1' } as { [key: string]: string },
    }),
  })
  resolvedVersions?.set(domain, installed)
}

/** Parse pantry.lock and return a map of `domain` → concrete `version`. */
function readLockedVersions(): Map<string, string> {
  const locked = new Map<string, string>()
  if (!fs.existsSync('pantry.lock')) return locked
  try {
    const parsed = JSON.parse(fs.readFileSync('pantry.lock', 'utf-8'))
    const pkgs = parsed?.packages || {}
    for (const entry of Object.values(pkgs) as Array<{ name?: string, version?: string }>) {
      if (entry?.name && entry?.version)
        locked.set(entry.name, entry.version)
    }
  }
  catch {
    // lockfile unreadable — fall through, caller uses spec version
  }
  return locked
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
        // Skip comments/blank lines without flipping state
        if (!line.trim() || line.trim().startsWith('#')) continue
        // Match top-level `dependencies:` key (not indented)
        if (/^dependencies:\s*$/.test(line)) {
          inDeps = true
          continue
        }
        if (inDeps && /^\s+\S/.test(line)) {
          // Capture `  name: version` (or `  name:` with no version).
          // Strip surrounding quotes from the version since YAML tolerates
          // both `bun.sh: "^1.3.11"` and `bun.sh: ^1.3.11`.
          const colon = line.indexOf(':')
          if (colon === -1) {
            const name = line.trim()
            if (name) deps.push(name)
            continue
          }
          const name = line.slice(0, colon).trim()
          const version = line.slice(colon + 1).trim().replace(/^["']|["']$/g, '')
          if (name) deps.push(version ? `${name}@${version}` : name)
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

/** Extract workspace (non-system) dependency names from package.json.
 *  These are npm-like deps that pantry install places at `pantry/<name>/`
 *  — e.g. zig-cli, zig-config, better-dx. Used to validate that a restored
 *  cache actually contains all declared deps, not just system binaries. */
function extractWorkspaceDeps(): string[] {
  const pkgJsonPath = 'package.json'
  if (!fs.existsSync(pkgJsonPath)) return []
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'))
    const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) }
    return Object.keys(deps)
      // Skip system deps (domain-style names like ziglang.org, bun.sh) —
      // those are validated via extractSystemDeps() / binary-presence checks.
      .filter(name => !name.includes('.'))
      // Skip workspace:* entries — resolved via symlinks, not installed.
      .filter(name => typeof deps[name] === 'string' && !deps[name].startsWith('workspace:'))
  }
  catch {
    return []
  }
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
      payload.content = ctx.mentions.slice(0, 500)

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
  catch (err) {
    core.warning(`Discord notification failed: ${err instanceof Error ? err.message : String(err)}`)
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
      lines.push(ctx.mentions.slice(0, 500))

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
  catch (err) {
    core.warning(`Slack notification failed: ${err instanceof Error ? err.message : String(err)}`)
  }
  core.endGroup()
}

export async function run(): Promise<void> {
  try {
    const inputs: ActionInputs = {
      version: core.getInput('version') || 'latest',
      packages: core.getInput('packages') || '',
      services: core.getInput('services') || '',
      configPath: core.getInput('config-path') || 'pantry.config.ts',
      setupOnly: !boolInput('install', true),
      publish: core.getInput('publish') || '',
      packageDir: core.getInput('package-dir') || '',
      registryUrl: core.getInput('registry-url') || 'https://registry.pantry.dev',
      token: core.getInput('token') || '',
      discordWebhook: core.getInput('discord-webhook') || '',
      slackWebhook: core.getInput('slack-webhook') || '',
      notificationTitle: core.getInput('notification-title') || '',
      notificationMentions: core.getInput('notification-mentions') || '',
      release: boolInput('release', false),
      releaseFiles: core.getInput('release-files') || '',
      releaseTag: core.getInput('release-tag') || process.env.GITHUB_REF_NAME || '',
      releaseMakeLatest: core.getInput('release-make-latest') || 'auto',
      releaseDraft: boolInput('release-draft', false),
      releasePrerelease: boolInput('release-prerelease', false),
      releaseNotes: core.getInput('release-notes') || '',
      releaseChangelog: core.getInput('release-changelog') || 'CHANGELOG.md',
      releaseChecksums: core.getInput('release-checksums') || '',
      releaseToken: core.getInput('release-token') || process.env.GITHUB_TOKEN || '',
      releaseDryRun: boolInput('release-dry-run', false),
      releaseAppStore: boolInput('release-app-store', false),
      releaseAppStorePackage: core.getInput('release-app-store-package') || '',
      releaseAppStoreBundleId: core.getInput('release-app-store-bundle-id') || '',
      releaseAppStoreVersion: core.getInput('release-app-store-version') || '',
      releaseAppStoreBuildNumber: core.getInput('release-app-store-build-number') || '',
      releaseAppStoreApiKeyId: core.getInput('release-app-store-api-key-id') || process.env.APP_STORE_CONNECT_API_KEY_ID || '',
      releaseAppStoreIssuerId: core.getInput('release-app-store-issuer-id') || process.env.APP_STORE_CONNECT_ISSUER_ID || '',
      releaseAppStorePrivateKey: core.getInput('release-app-store-private-key') || process.env.APP_STORE_CONNECT_PRIVATE_KEY || '',
      releaseAppStoreValidateOnly: boolInput('release-app-store-validate-only', false),
      releaseAppStoreRetryExisting: boolInput('release-app-store-retry-existing', true),
      releaseS3: boolInput('release-s3', false),
      releaseS3Provider: (core.getInput('release-s3-provider') || 'aws') as ActionInputs['releaseS3Provider'],
      releaseS3Bucket: core.getInput('release-s3-bucket') || '',
      releaseS3Region: core.getInput('release-s3-region') || process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || '',
      releaseS3Endpoint: core.getInput('release-s3-endpoint') || '',
      releaseS3Prefix: core.getInput('release-s3-prefix') || '',
      releaseS3PublicUrl: core.getInput('release-s3-public-url') || '',
      releaseS3ForcePathStyle: boolInput('release-s3-force-path-style', false),
      releaseS3CacheControl: core.getInput('release-s3-cache-control') || 'public, max-age=31536000, immutable',
      releaseS3AccessKeyId: core.getInput('release-s3-access-key-id') || process.env.AWS_ACCESS_KEY_ID || '',
      releaseS3SecretAccessKey: core.getInput('release-s3-secret-access-key') || process.env.AWS_SECRET_ACCESS_KEY || '',
      releaseS3SessionToken: core.getInput('release-s3-session-token') || process.env.AWS_SESSION_TOKEN || '',
      appleSigning: boolInput('apple-signing', false),
      appleSigningApplicationCertificate: core.getInput('apple-signing-application-certificate') || process.env.APPLE_APPLICATION_CERTIFICATE || '',
      appleSigningInstallerCertificate: core.getInput('apple-signing-installer-certificate') || process.env.APPLE_INSTALLER_CERTIFICATE || '',
      appleSigningCertificatePassword: core.getInput('apple-signing-certificate-password') || process.env.APPLE_CERTIFICATE_PASSWORD || '',
      appleSigningProvisioningProfile: core.getInput('apple-signing-provisioning-profile') || process.env.APPLE_PROVISIONING_PROFILE || '',
    }

    // Mask secrets so they never appear in logs
    if (inputs.discordWebhook)
      core.setSecret(inputs.discordWebhook)
    if (inputs.slackWebhook)
      core.setSecret(inputs.slackWebhook)
    if (inputs.releaseToken)
      core.setSecret(inputs.releaseToken)
    for (const secret of [
      inputs.releaseAppStoreApiKeyId,
      inputs.releaseAppStoreIssuerId,
      inputs.releaseAppStorePrivateKey,
      inputs.releaseS3AccessKeyId,
      inputs.releaseS3SecretAccessKey,
      inputs.releaseS3SessionToken,
      inputs.appleSigningApplicationCertificate,
      inputs.appleSigningInstallerCertificate,
      inputs.appleSigningCertificatePassword,
      inputs.appleSigningProvisioningProfile,
    ]) {
      if (secret)
        core.setSecret(secret)
    }

    // Export registry token as env vars for subsequent steps (e.g. pantry publish:commit)
    const token = inputs.token || process.env.PANTRY_TOKEN || process.env.PANTRY_REGISTRY_TOKEN || ''
    if (token) {
      core.setSecret(token)
      core.exportVariable('PANTRY_TOKEN', token)
      core.exportVariable('PANTRY_REGISTRY_TOKEN', token)
    }

    const platform = detectPlatform()
    const requestedServices = parseServiceSpecs(inputs.services)
    const cachePackages = mergeServicePackages(inputs.packages, requestedServices)
    const cwd = process.cwd()
    const homeDir = os.homedir()
    const pantryDir = path.join(cwd, 'pantry')
    const pantryBinDir = path.join(pantryDir, '.bin')

    // ── Install pantry CLI ──
    core.startGroup('Setup pantry')
    const resolvedVersion = await resolveVersion(inputs.version)
    if (!resolvedVersion) {
      throw new Error('Failed to resolve pantry version — check https://github.com/pantry-pm/pantry/releases')
    }
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

    // Signing has to happen before the build step that packages the app, so
    // configure it up front rather than alongside the release targets.
    await configureAppleSigning(inputs)

    // If setup-only with no packages, skip to publish/release (if any)
    if (inputs.setupOnly && !inputs.packages && !inputs.services) {
      // `install: false` skips `pantry install` of *project* deps, but the
      // action's core contract is to provide the bun runtime — always install
      // it so downstream steps can run `bun …` without a separate setup-bun.
      // (Without this, setup-only returned before any bun install, so a
      // workflow that only wanted the CLI got `bun: command not found`.)
      // A failed install fails the setup here, with the download error,
      // instead of a warning and a downstream `bun: command not found`.
      await setupBunRuntime({
        install: () => installSystemPackage('bun.sh', pantryDir, readLockedVersions(), path.join(installDir, platform.binaryName)),
        binDir: pantryBinDir,
        onLinked: () => core.exportVariable('BUN_INSTALL', pantryDir),
      })

      // Configure PATH so pantry-installed bins (incl. bun) are available
      if (fs.existsSync(pantryBinDir))
        core.addPath(pantryBinDir)
      core.addPath(path.join(homeDir, '.pantry', 'bin'))

      if (inputs.publish) {
        await publishPackage(inputs.publish, inputs.registryUrl, resolvePackageCwd(cwd, inputs.packageDir))
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
    const depsHash = (depsFileForKey && depsFileForKey !== lockfile) ? hashFile(depsFileForKey) : 'none'
    const systemDeps = selectSystemPackages(inputs.packages, inputs.setupOnly, extractSystemDeps)
    let artifactIdentity: string | undefined
    try {
      artifactIdentity = await nativeArtifactCacheIdentity(systemDeps, platform)
    }
    catch (error) {
      core.warning(`Native artifact identity unavailable; installing without a dependency cache: ${error}`)
    }
    const cachePrefix = `pantry-v4-${resolvedVer}-${platform.os}-${platform.arch}-${artifactIdentity}-`
    const cacheKey = `${cachePrefix}${lockHash}-${depsHash}-${cachePackages || 'all'}`
    // Restore keys: try same OS/arch with any lock hash
    const restoreKeys = [
      cachePrefix,
    ]
    let cacheHit = false
    // Whether `pantry install` ran in this step, and so may have re-pointed
    // system-package links that need re-asserting afterwards
    let ranPantryInstall = false

    // Try restoring from cache
    try {
      const hit = artifactIdentity ? await cache.restoreCache([pantryDir], cacheKey, restoreKeys) : undefined
      if (hit) {
        // Verify cache is valid — .bin dir should exist with actual binaries
        const binDirExists = fs.existsSync(pantryBinDir)
        const hasEntries = binDirExists && fs.readdirSync(pantryBinDir).length > 0
        if (hasEntries) {
          cacheHit = hit === cacheKey
          core.info(cacheHit ? `Exact cache hit: ${hit}` : `Restore-key cache hit: ${hit}; reconciling and saving ${cacheKey}`)
        }
        else {
          core.info('Cache restored but incomplete — reinstalling')
        }
      }
    }
    catch {
      // cache miss or unavailable
    }

    // Lockfile-pinned versions (map of domain → concrete version). Consulted
    // before falling back to the deps file / "latest" when installing system
    // packages, so the action stays in lockstep with `pantry install`.
    const lockedVersions = readLockedVersions()
    const resolvedSystemVersions = new Map<string, string>()

    // Bun is part of the action's baseline runtime contract even when callers
    // provide an explicit package/service list. Keep downstream `bun` steps
    // working without requiring every workflow to repeat `bun.sh`.
    await installSystemPackage('bun.sh', pantryDir, lockedVersions, path.join(installDir, platform.binaryName), resolvedSystemVersions)

    // Put `pantry/.bin` (and `~/.pantry/bin`) on PATH *before* any install
    // branch runs. `core.addPath` mutates `process.env.PATH` in-process in
    // addition to writing GITHUB_PATH, so `pantry install --no-save` — which
    // runs inside this step and may shell out to bun/zig/node installed by
    // the SDK moments earlier — can find them. Calling this after the install
    // branch (as it used to be) meant the child pantry couldn't see bun yet,
    // even though the final workflow step could.
    core.addPath(pantryBinDir)
    core.addPath(path.join(homeDir, '.pantry', 'bin'))

    // Service packages use Pantry's native resolver so their dependency graph,
    // integrity checks, registry platform mapping, and binary links stay
    // identical to `pantry install` outside GitHub Actions. The TypeScript SDK
    // intentionally covers only self-contained bootstrap tools.
    await installRequestedServicePackages(
      requestedServices,
      path.join(installDir, platform.binaryName),
      platform,
    )

    // Even on cache hit, reconcile critical deps. A stale cache may lack
    // system binaries (zig, bun) OR workspace source deps (e.g.
    // pantry/zig-cli/src/root.zig) needed by `zig build`. Validate both.
    //
    // We always call `installSystemPackage` instead of gating on a cheap
    // bin-existence check: the SDK's own "already installed" short-circuit
    // makes it a no-op when the correct version is on disk, and otherwise it
    // installs the right one. The cheap bin-existence check is unsafe because
    // a restore-key cache hit can bring in the right *binary name* at the
    // *wrong version* (e.g. cache has bun@1.3.11, deps/lock now say 1.3.13)
    // — the symlink exists so the check passes, and the stale version stays.
    if (cacheHit) {
      const installEnv = { ...process.env, CI: 'true', NO_COLOR: '1' }
      // Honour the explicit `packages:` input here too, not just deps files.
      // The cache key is constant for a rolling spec like `zig@0.17.0-dev`, so
      // without this a cache hit would serve whatever dev build was first cached
      // and never pick up a newer master — the reconcile re-resolves the spec
      // (installPackage is a no-op when the resolved version is already on disk).
      const systemDeps = selectSystemPackages(inputs.packages, inputs.setupOnly, extractSystemDeps)
      if (systemDeps.length > 0) {
        core.info(`Cache hit — reconciling system deps against lock/spec: ${systemDeps.join(', ')}`)
        await installRequiredSystemPackages(
          systemDeps,
          dep => installSystemPackage(dep, pantryDir, lockedVersions, path.join(installDir, platform.binaryName), resolvedSystemVersions),
        )
      }

      // Validate workspace deps: pantry/<name>/ dirs exist for every non-system
      // dep declared in package.json. A missing dir (e.g. zig-cli) means the
      // cache was saved before `pantry install` completed; re-run to heal it.
      if (shouldInstallWorkspace(inputs.packages, inputs.setupOnly)) {
        const workspaceDeps = extractWorkspaceDeps()
        const missingWorkspace = workspaceDeps.filter(dep => {
          const depDir = path.join(pantryDir, dep)
          return !fs.existsSync(depDir)
        })
        // The cache holds pantry/, not node_modules: JS deps the install hands
        // to bun (or npm, pnpm, yarn) are missing from every fresh checkout.
        const jsMissing = needsJsInstall(process.cwd())
        if (jsMissing && missingWorkspace.length === 0 && !pantryConfigMaySetLinker(process.cwd())) {
          // Everything else is in place, so do only what `pantry install`
          // would do now: run the package manager. Its own cache is in
          // pantry/ (BUN_INSTALL), so this is a link step, not a download.
          const pm = jsPackageManager(process.cwd())
          core.info(`Cache hit — installing JS deps with ${pm}`)
          const pmEnv = { ...installEnv, PATH: `${pantryBinDir}${path.delimiter}${process.env.PATH ?? ''}` }
          const code = await exec.exec(pm, ['install'], { env: pmEnv as { [key: string]: string }, ignoreReturnCode: true })
            .catch(() => null)
          if (code === 0) {
            fs.writeFileSync(path.join('node_modules', '.pantry-js-installed'), '')
          }
          else {
            // Not on PATH, or it failed: let `pantry install` do it in full
            core.info(`${pm} install ${code === null ? 'could not start' : `exited with code ${code}`} — running pantry install`)
            ranPantryInstall = true
            await exec.exec('pantry', ['install', '--no-save'], {
              env: installEnv as { [key: string]: string },
            }).catch(() => {
              core.warning('pantry workspace install failed')
            })
          }
        }
        else if (missingWorkspace.length > 0 || jsMissing) {
          ranPantryInstall = true
          core.info(missingWorkspace.length > 0
            ? `Cache hit but missing workspace deps: ${missingWorkspace.join(', ')} — running pantry install`
            : 'Cache hit — installing JS deps into node_modules')
          await exec.exec('pantry', ['install', '--no-save'], {
            env: installEnv as { [key: string]: string },
          }).catch(() => {
            core.warning('pantry workspace install failed')
          })
        }
      }
    }

    if (!cacheHit) {
      const installEnv = { ...process.env, CI: 'true', NO_COLOR: '1' }

      // Collect all system packages to install (from explicit input + deps files)
      if (systemDeps.length > 0) {
        core.startGroup(`Installing system packages: ${systemDeps.join(', ')}`)
        try {
          // Standalone runtimes use the SDK; package graphs use the native resolver.
          // Every selected package is part of the action contract; a partial
          // install must fail this step rather than surprising a later command.
          await installRequiredSystemPackages(
            systemDeps,
            dep => installSystemPackage(dep, pantryDir, lockedVersions, path.join(installDir, platform.binaryName), resolvedSystemVersions),
          )
        }
        finally {
          core.endGroup()
        }
      }

      if (shouldInstallWorkspace(inputs.packages, inputs.setupOnly)) {
        // Also run workspace install for JS deps (package.json)
        ranPantryInstall = true
        core.startGroup('Installing workspace dependencies')
        await exec.exec('pantry', ['install', '--no-save'], {
          env: installEnv as { [key: string]: string },
        }).catch(() => {
          core.warning('pantry workspace install failed')
        })
        core.endGroup()
      }

      // Cache compression may use a Pantry-installed zstd from a dependency.
      // Its matching libraries must be active during this action too.
      configureNativeLibraryEnvironment(pantryBinDir, platform)

      // Save to cache for next run
      try {
        if (artifactIdentity) {
          await cache.saveCache([pantryDir], cacheKey)
          core.info('Dependencies cached')
        }
      }
      catch {
        // cache save failed (already exists or unavailable)
      }
    }

    // ── Re-assert system-package bin links (post `pantry install`) ──
    // `pantry install` resolves system deps from the registry. For a platform
    // the registry lacks (e.g. darwin-x86-64 bun before it's been published),
    // it drops a placeholder stub and repoints `.bin/<name>` at it — clobbering
    // the genuine upstream binary that `installSystemPackage` (ts installer,
    // fetched from the official source) put in place earlier. Re-run the ts
    // or native installer for each system dep *after* `pantry install`: it's idempotent
    // (no-op download when present) and re-links `.bin/<name>` to the real
    // binary, so the stub never wins. Fixes the Intel-macOS bootstrap without
    // any per-workflow workaround.
    // Only `pantry install` re-points those links, so a run that skipped it
    // (a cache hit) has nothing to re-assert.
    if (ranPantryInstall) {
      const reassertDeps = selectSystemPackages(inputs.packages, inputs.setupOnly, extractSystemDeps)
      await installRequiredSystemPackages(
        reassertDeps,
        dep => installSystemPackage(dep, pantryDir, lockedVersions, path.join(installDir, platform.binaryName), resolvedSystemVersions, true),
      )
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
          // Also chmod the symlink target if it's a symlink (but only if within pantry dir)
          try {
            const realPath = fs.realpathSync(binPath)
            if (!path.relative(pantryDir, realPath).startsWith('..')) {
              fs.chmodSync(realPath, 0o755)
            }
          }
          catch { /* not a symlink */ }
        }
      }
      catch { /* .bin dir may not exist yet */ }
    }

    // ── Configure PATH for zig install directories ──
    // (pantry/.bin and ~/.pantry/bin were added earlier so `pantry install`
    // could already see them; here we only handle zig's versioned layout.)
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
        // Remove stale symlink before creating to avoid EEXIST race
        try { fs.unlinkSync(bunxPath) } catch { /* doesn't exist */ }
        fs.symlinkSync(bunPath, bunxPath)
        core.exportVariable('BUN_INSTALL', pantryDir)
      }
    }
    catch { /* bun not in deps */ }

    // Launch only after Pantry has installed the complete service dependency
    // graph and all executable-link reconciliation has finished.
    await startRequestedServices(requestedServices, pantryBinDir, platform)

    // ── Publish ──
    if (inputs.publish) {
      await publishPackage(inputs.publish, inputs.registryUrl, resolvePackageCwd(cwd, inputs.packageDir))
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
  if (type === 'zig') {
    const token = process.env.PANTRY_TOKEN || process.env.PANTRY_REGISTRY_TOKEN || ''
    if (!token) {
      throw new Error('PANTRY_TOKEN environment variable is required for publishing to the pantry registry')
    }
    await publishZigPackage(registryUrl, token, cwd)
  }
  else if (type === 'npm') {
    if (!process.env.NPM_TOKEN && !process.env.NODE_AUTH_TOKEN && !process.env.BUN_AUTH_TOKEN) {
      core.warning('NPM_TOKEN, NODE_AUTH_TOKEN, and BUN_AUTH_TOKEN are not set — pantry will fall back to OIDC trusted publishing.')
    }
    core.startGroup('Publishing to npm via pantry')
    await exec.exec('pantry', ['publish', '--npm', '--access', 'public'])
    core.endGroup()
  }
  else {
    throw new Error(`Unknown publish type: "${type}". Use "zig" or "npm".`)
  }
}

function resolvePackageCwd(root: string, packageDir: string): string {
  if (!packageDir.trim())
    return root

  const resolved = path.resolve(root, packageDir)
  const relative = path.relative(root, resolved)
  if (relative.startsWith('..') || path.isAbsolute(relative))
    throw new Error(`package-dir must stay inside the workspace: ${packageDir}`)

  if (!fs.existsSync(resolved))
    throw new Error(`package-dir does not exist: ${packageDir}`)

  return resolved
}

async function publishZigPackage(registryUrl: string, token: string, cwd: string): Promise<void> {
  core.startGroup('Publishing Zig package')

  const zonPath = path.join(cwd, 'build.zig.zon')
  if (!fs.existsSync(zonPath)) {
    throw new Error(`build.zig.zon not found in ${cwd}`)
  }

  const zonContent = fs.readFileSync(zonPath, 'utf-8')

  // Extract name and version from build.zig.zon
  // .name = .package_name or .name = .@"package-name" or .name = "package-name"
  const nameMatch = zonContent.match(/\.name\s*=\s*(?:\.@"([^"]+)"|\.(\w+)|"([^"]+)")/)
  const versionMatch = zonContent.match(/\.version\s*=\s*"([^"]+)"/)

  if (!nameMatch) throw new Error('Could not parse .name from build.zig.zon')
  if (!versionMatch) throw new Error('Could not parse .version from build.zig.zon')

  // Zig's `.name` field must be a valid enum literal, so packages use
  // underscores (e.g. `.zig_tls`). The pantry registry's canonical package
  // name uses hyphens (`zig-tls`) — normalize so Actions publish under the
  // same name the registry/site lists instead of a parallel `_` namespace.
  const rawName = nameMatch[1] || nameMatch[2] || nameMatch[3]
  const name = rawName.replace(/_/g, '-')
  const version = versionMatch[1]
  if (name !== rawName)
    core.info(`Normalized package name ${rawName} -> ${name}`)
  core.info(`Package: ${name}@${version}`)

  // Collect paths from build.zig.zon .paths field
  const pathsMatch = zonContent.match(/\.paths\s*=\s*\.?\{([^}]+)\}/)
  let includePaths: string[] = []
  if (pathsMatch) {
    includePaths = pathsMatch[1]
      .split(',')
      .map(p => p.trim().replace(/^"/, '').replace(/"$/, '').trim())
      .filter(p => p.length > 0 && !p.includes('..') && !p.startsWith('/') && !p.startsWith('\\') && !/^[a-zA-Z]:/.test(p))
  }

  // Create tarball
  const tarballName = `${name}-${version}.tar.gz`
  const tarballPath = path.join(os.tmpdir(), tarballName)

  if (includePaths.length > 0) {
    // Use explicit paths from build.zig.zon
    core.info(`Including: ${includePaths.join(', ')}`)
    await exec.exec('tar', ['czf', tarballPath, ...includePaths], { cwd })
  }
  else {
    // Fallback: include common zig package files
    await exec.exec('tar', ['czf', tarballPath, 'build.zig', 'build.zig.zon', 'src'], { cwd })
  }

  if (!fs.existsSync(tarballPath)) {
    throw new Error('Failed to create tarball — tar command may have failed')
  }
  const stat = fs.statSync(tarballPath)
  core.info(`Tarball: ${tarballName} (${(stat.size / 1024).toFixed(1)} KB)`)

  // Upload to registry via multipart POST
  const url = `${registryUrl}/zig/publish`
  core.info(`Publishing to ${url}`)

  // Write manifest and auth to temp files to avoid leaking secrets in process args
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pantry-publish-'))
  const manifestPath = path.join(tmpDir, 'manifest.zon')
  const headerFile = path.join(tmpDir, 'auth-header')
  // Send the manifest with the *normalized* (hyphenated) name so the registry
  // stores under the canonical name. The server parses `.name` from this manifest,
  // and zonContent's `.name` is the raw enum-literal form (underscores). Rewrite it
  // to the quoted form `.@"<name>"` (hyphens aren't valid bare enum literals).
  const manifestContent = name === rawName
    ? zonContent
    : zonContent.replace(/\.name\s*=\s*(?:\.@"[^"]+"|\.\w+|"[^"]+")/, `.name = .@"${name}"`)
  fs.writeFileSync(manifestPath, manifestContent)
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
  try { fs.rmSync(tmpDir, { recursive: true, force: true }) } catch { /* already cleaned */ }

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

/**
 * Generate this release's notes from git history with logsmith — bounded to the
 * previous tag → this tag — so a release always has proper, grouped notes
 * without a pre-committed CHANGELOG.md. Run through `bun x` (this action already
 * provisions bun) rather than bundled, since logsmith ships top-level await; it
 * writes the markdown to a temp file which we read back.
 */
async function generateReleaseNotes(tag: string, required = false): Promise<string> {
  try {
    const from = await previousTag(tag)
    const notesPath = path.join(os.tmpdir(), `release-notes-${tag.replace(/[^\w.-]/g, '_')}.md`)
    const args = ['x', '@stacksjs/logsmith', '--to', tag, '--output', notesPath, '--theme', 'github']
    if (from)
      args.push('--from', from)

    // Capture logsmith's own output. Running it `silent` and reporting only an
    // exit code made every failure here undiagnosable -- three consecutive
    // stacks releases failed at this step with nothing but "exit 1" to go on,
    // after the npm publish ahead of it had already succeeded.
    let stdout = ''
    let stderr = ''
    const code = await exec.exec('bun', args, {
      cwd: process.cwd(),
      ignoreReturnCode: true,
      silent: true,
      listeners: {
        stdout: (data: Buffer) => { stdout += data.toString() },
        stderr: (data: Buffer) => { stderr += data.toString() },
      },
    })

    if (code !== 0 || !fs.existsSync(notesPath)) {
      const detail = [
        `command: bun ${args.join(' ')}`,
        !fs.existsSync(notesPath) ? `no output written to ${notesPath}` : undefined,
        stderr.trim() ? `stderr:\n${stderr.trim()}` : undefined,
        stdout.trim() ? `stdout:\n${stdout.trim()}` : undefined,
      ].filter(Boolean).join('\n')

      const message = `logsmith did not produce notes for ${tag} (exit ${code})\n${detail}`
      if (required)
        throw new Error(message)
      core.warning(message)
      return ''
    }

    const content = fs.readFileSync(notesPath, 'utf-8').trim()
    if (!content && required)
      throw new Error(`logsmith produced empty release notes for ${tag}`)
    core.info(content
      ? `Generated release notes via logsmith (${from || 'start'}..${tag})`
      : `logsmith produced no notes for ${tag}`)
    return content
  }
  catch (err) {
    const message = `logsmith changelog generation failed: ${err instanceof Error ? err.message : String(err)}`
    if (required)
      throw new Error(message)
    core.warning(message)
    return ''
  }
}

/** The most recent tag before `tag` (empty for the first release). */
async function previousTag(tag: string): Promise<string> {
  let out = ''
  await exec.exec('git', ['describe', '--tags', '--abbrev=0', `${tag}^`], {
    listeners: { stdout: (d: Buffer) => { out += d.toString() } },
    silent: true,
    ignoreReturnCode: true,
  }).catch(() => {})
  return out.trim()
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
      if (capturing && (lower.includes('[compare changes]') || /^#{1,3}\s+v?\d+\.\d+\.\d+/.test(line)))
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

  // zig-out lives next to build.zig.zon. Support both a monorepo layout
  // (packages/zig/) and a root zig project.
  const zigDir = [path.join(cwd, 'packages', 'zig'), cwd].find(d => fs.existsSync(path.join(d, 'zig-out')))
  if (!zigDir) return []
  const zigOut = path.join(zigDir, 'zig-out')

  const packaged: string[] = []
  // Detect the name from the zig project dir (where build.zig.zon is), NOT the repo
  // root — a monorepo zig project (zon under packages/zig/) reads "unknown" at the
  // root, mis-naming assets unknown-*.zip.
  const { name } = detectPackageInfo(zigDir)
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
        // Recurse so a library layout (lib/, include/) is preserved rather than
        // flattened away; a flat single-binary target still zips cleanly.
        await exec.exec('zip', ['-r', zipPath, ...entries], { cwd: targetDir })
        packaged.push(zipPath)
        core.info(`Packaged: ${zipName}`)
      }
    }
  }

  return packaged
}

/**
 * Import Apple signing certificates so the build step can sign the app.
 *
 * The identities are published as outputs and as `APPLE_*` environment
 * variables, so a packaging step reads them without the workflow having to
 * know the certificate's common name.
 */
async function configureAppleSigning(inputs: ActionInputs): Promise<void> {
  if (!inputs.appleSigning)
    return

  core.startGroup('Apple code signing')
  try {
    const result = await setupAppleSigning({
      applicationCertificate: inputs.appleSigningApplicationCertificate,
      installerCertificate: inputs.appleSigningInstallerCertificate || undefined,
      certificatePassword: inputs.appleSigningCertificatePassword,
      provisioningProfile: inputs.appleSigningProvisioningProfile || undefined,
      outputDirectory: process.env.RUNNER_TEMP || undefined,
    })

    // The post step deletes the keychain even if the job fails.
    core.saveState('apple-signing-keychain', result.keychainPath)

    core.setOutput('apple-signing-identity', result.applicationIdentity)
    core.exportVariable('APPLE_SIGNING_IDENTITY', result.applicationIdentity)
    core.info(`Application identity: ${result.applicationIdentity}`)

    if (result.installerIdentity) {
      core.setOutput('apple-signing-installer-identity', result.installerIdentity)
      core.exportVariable('APPLE_INSTALLER_SIGNING_IDENTITY', result.installerIdentity)
      core.info(`Installer identity: ${result.installerIdentity}`)
    }

    if (result.provisioningProfilePath) {
      core.setOutput('apple-signing-provisioning-profile', result.provisioningProfilePath)
      core.exportVariable('APPLE_PROVISIONING_PROFILE_PATH', result.provisioningProfilePath)
    }
  }
  finally {
    core.endGroup()
  }
}

async function runReleaseTargets(options: {
  inputs: ActionInputs
  releaseFiles: string[]
  releaseDirectory: string
  manifest: ReturnType<typeof createReleaseManifest>
  manifestPath: string
  releaseNotes: string
  owner: string
  repo: string
}): Promise<string[]> {
  const { inputs, releaseFiles, releaseDirectory, manifest, manifestPath, releaseNotes, owner, repo } = options
  const receiptFiles: string[] = []

  if (inputs.releaseAppStore) {
    core.startGroup(inputs.releaseDryRun ? 'Plan Mac App Store delivery' : 'Mac App Store delivery')
    try {
      const configuredPackage = inputs.releaseAppStorePackage
        ? path.resolve(inputs.releaseAppStorePackage)
        : ''
      const packages = releaseFiles.filter(file => path.extname(file).toLowerCase() === '.pkg')
      const packagePath = configuredPackage || (packages.length === 1 ? packages[0] : '')
      if (!packagePath)
        throw new Error(`Mac App Store delivery needs exactly one .pkg release artifact; found ${packages.length}`)
      if (!releaseFiles.some(file => path.resolve(file) === path.resolve(packagePath)))
        throw new Error('Mac App Store package must also be included in release-files')

      const receipt = await deliverReleaseToAppStore({
        package: packagePath,
        bundleId: inputs.releaseAppStoreBundleId || undefined,
        version: inputs.releaseAppStoreVersion || undefined,
        buildNumber: inputs.releaseAppStoreBuildNumber || undefined,
        sourceRevision: process.env.GITHUB_SHA || undefined,
        apiKeyId: inputs.releaseAppStoreApiKeyId,
        issuerId: inputs.releaseAppStoreIssuerId,
        privateKey: inputs.releaseAppStorePrivateKey,
        validateOnly: inputs.releaseAppStoreValidateOnly,
        retryExisting: inputs.releaseAppStoreRetryExisting,
        dryRun: inputs.releaseDryRun,
      })
      const receiptPath = path.join(releaseDirectory, 'app-store-receipt.json')
      fs.writeFileSync(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`, { mode: 0o600 })
      receiptFiles.push(receiptPath)
      core.setOutput('release-app-store-receipt', receiptPath)
      core.info(inputs.releaseDryRun
        ? `Planned App Store delivery: ${receipt.package}`
        : `App Store delivery complete: ${receipt.package}`)
    }
    finally {
      core.endGroup()
    }
  }

  if (inputs.releaseS3) {
    core.startGroup(inputs.releaseDryRun ? 'Plan object storage mirror' : 'Object storage mirror')
    try {
      if (!['aws', 'backblaze', 'hetzner'].includes(inputs.releaseS3Provider))
        throw new Error(`Unsupported release-s3-provider: ${inputs.releaseS3Provider}`)
      const receipt = await mirrorReleaseToS3({
        config: {
          provider: inputs.releaseS3Provider,
          bucket: inputs.releaseS3Bucket,
          region: inputs.releaseS3Region,
          endpoint: inputs.releaseS3Endpoint,
          prefix: inputs.releaseS3Prefix || `releases/${owner}/${repo}`,
          publicUrl: inputs.releaseS3PublicUrl,
          forcePathStyle: inputs.releaseS3ForcePathStyle,
          cacheControl: inputs.releaseS3CacheControl,
          accessKeyId: inputs.releaseS3AccessKeyId,
          secretAccessKey: inputs.releaseS3SecretAccessKey,
          sessionToken: inputs.releaseS3SessionToken,
          dryRun: inputs.releaseDryRun,
        },
        manifest,
        manifestFile: manifestPath,
        releaseNotes,
        files: releaseFiles,
      })
      const receiptPath = path.join(releaseDirectory, 's3-release-receipt.json')
      fs.writeFileSync(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`, { mode: 0o600 })
      receiptFiles.push(receiptPath)
      core.setOutput('release-s3-receipt', receiptPath)
      core.info(`${inputs.releaseDryRun ? 'Planned' : 'Mirrored'} ${receipt.objects.length} object(s)`)
    }
    finally {
      core.endGroup()
    }
  }

  return receiptFiles
}

async function createGitHubRelease(inputs: ActionInputs): Promise<void> {
  core.startGroup('GitHub release')

  const { owner, repo } = github.context.repo
  const tag = inputs.releaseTag
  if (!tag) {
    throw new Error('Release tag is required (set release-tag input or push a tag)')
  }
  const makeLatestMode = normalizeReleaseMakeLatest(inputs.releaseMakeLatest)

  // Resolve file patterns — auto-discover if no explicit files given
  const requestedFilePatterns = resolveReleaseFilePatterns(inputs.releaseFiles)
  let filePatterns: string[]
  if (requestedFilePatterns === null) {
    // Auto-package build artifacts
    core.info('Auto-packaging build artifacts...')
    const packaged = await packageBuildArtifacts(process.cwd())
    filePatterns = packaged.length > 0 ? ['dist/*.zip'] : []
  }
  else {
    filePatterns = requestedFilePatterns
  }
  const matchedFiles: string[] = []
  for (const pattern of filePatterns) {
    const globber = await glob.create(pattern)
    matchedFiles.push(...await globber.glob())
  }
  const files = preferArchivedReleaseAssets(matchedFiles)
  const omittedRawAssets = matchedFiles.length - files.length
  core.info(`Matched ${files.length} file(s) from ${filePatterns.length} pattern(s)`)
  if (omittedRawAssets > 0)
    core.info(`Omitted ${omittedRawAssets} raw or duplicate asset(s) with packaged equivalents`)

  // Optionally generate a checksums manifest over the resolved assets and upload
  // it alongside them, so releases are verifiable without a manual sha256sum
  // step. `release-checksums: true` defaults to sha256; a named algorithm
  // (sha256/sha512/…) is honoured as-is.
  if (inputs.releaseChecksums && inputs.releaseChecksums !== 'false' && files.length) {
    const algorithm = inputs.releaseChecksums === 'true' ? 'sha256' : inputs.releaseChecksums
    try {
      const lines = files.map((file) => {
        const digest = crypto.createHash(algorithm).update(fs.readFileSync(file)).digest('hex')
        return `${digest}  ${path.basename(file)}`
      })
      const checksumPath = path.join(process.cwd(), 'checksums.txt')
      fs.writeFileSync(checksumPath, `${lines.join('\n')}\n`)
      files.push(checksumPath)
      core.info(`Generated checksums.txt (${algorithm}) for ${lines.length} asset(s)`)
    }
    catch (err) {
      throw new Error(`Checksum generation failed: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  const releaseFiles = [...files]
  const releaseDirectory = fs.mkdtempSync(path.join(process.env.RUNNER_TEMP || os.tmpdir(), 'pantry-release-'))
  const manifestPath = path.join(releaseDirectory, 'release-manifest.json')
  const manifest = createReleaseManifest({
    repository: `${owner}/${repo}`,
    tag,
    commit: process.env.GITHUB_SHA || '',
    files: releaseFiles,
  })
  writeReleaseManifest(manifestPath, manifest)
  files.push(manifestPath)
  core.setOutput('release-manifest', manifestPath)
  core.info(`Generated release-manifest.json for ${manifest.assets.length} artifact(s)`)

  // Get or create release
  let releaseId: number
  let releaseUrl = ''
  let publishCreatedDraft = false
  // `release-changelog: auto` generates this release's notes from git history
  // with logsmith (no pre-committed CHANGELOG.md needed); any other value is a
  // path to extract the tag's section from. Both fall back to `release-notes`.
  const body = (inputs.releaseChangelog === 'auto'
    ? await generateReleaseNotes(tag, true)
    : extractChangelogForVersion(inputs.releaseChangelog, tag)) || inputs.releaseNotes
  if (inputs.releaseDryRun) {
    await runReleaseTargets({
      inputs,
      releaseFiles,
      releaseDirectory,
      manifest,
      manifestPath,
      releaseNotes: body || '',
      owner,
      repo,
    })
    core.info(`Release plan complete: ${files.length} GitHub asset(s); no network changes made`)
    core.endGroup()
    return
  }
  const token = inputs.releaseToken
  if (!token)
    throw new Error('GitHub token is required for creating releases (set release-token or GITHUB_TOKEN)')
  const octokit = github.getOctokit(token)
  // Draft-aware: the tag lookup never returns drafts, so legs of one release
  // matrix each created their own (see release-draft.ts).
  const releaseClient: ReleaseClient = {
    getPublishedByTag: async (releaseTag) => {
      try {
        const response = await octokit.rest.repos.getReleaseByTag({ owner, repo, tag: releaseTag })
        return response.data
      }
      catch (err) {
        if ((err as { status?: number }).status === 404)
          return undefined
        throw err
      }
    },
    listRecent: async () => (await octokit.rest.repos.listReleases({ owner, repo, per_page: 100 })).data,
    deleteRelease: async (id) => {
      await octokit.rest.repos.deleteRelease({ owner, repo, release_id: id })
    },
  }
  const existingRelease = await retryGitHubReleaseOperation(
    `Lookup of release ${tag}`,
    () => findReleaseForTag(releaseClient, tag),
    { onRetry: message => core.warning(message) },
  )

  if (existingRelease) {
    const existing = existingRelease
    releaseId = existing.id
    releaseUrl = existing.html_url
    core.info(`Found existing release: ${tag} (${releaseId})`)

    // Keep an existing release synchronized with the current Logsmith output.
    const immutable = (existing as typeof existing & { immutable?: boolean }).immutable === true
    if (body && body !== existing.body && !immutable) {
      await retryGitHubReleaseOperation(
        `Update of release ${tag}`,
        () => octokit.rest.repos.updateRelease({ owner, repo, release_id: releaseId, body }),
        { onRetry: message => core.warning(message) },
      )
      core.info('Updated release body with changelog')
    }
  }
  else {
    const created = await retryGitHubReleaseOperation(`Creation of release ${tag}`, async () => {
      try {
        const response = await octokit.rest.repos.createRelease({
          owner,
          repo,
          tag_name: tag,
          name: tag,
          body,
          // Attach every asset before publication. This is required when release
          // immutability is enabled and avoids GitHub's release-policy race while
          // attestations are being generated for a newly published release.
          draft: true,
          prerelease: inputs.releasePrerelease,
        })
        return response.data
      }
      catch (error) {
        if (!isRetryableGitHubReleaseError(error))
          throw error

        // A request can reach GitHub successfully even when its response is a
        // transient error. Reconcile by tag before issuing another create.
        const reconciled = await octokit.rest.repos.getReleaseByTag({ owner, repo, tag }).catch(() => undefined)
        if (reconciled)
          return reconciled.data
        throw error
      }
    }, { onRetry: message => core.warning(message) })
    const settled = await retryGitHubReleaseOperation(
      `Reconciliation of release ${tag}`,
      () => settleCreatedDraft(releaseClient, tag, created),
      { onRetry: message => core.warning(message) },
    )
    releaseId = settled.release.id
    releaseUrl = settled.release.html_url
    // Only the leg whose draft is shared publishes it.
    publishCreatedDraft = settled.own && !inputs.releaseDraft
    core.info(settled.own
      ? `Created draft release: ${tag} (${releaseId})`
      : `Another leg created the draft for ${tag} at the same time; using it (${releaseId})`)
  }

  // Re-running a migrated workflow must also clean up raw binaries uploaded by
  // an older release job, leaving the release in the same archive-only state.
  const supersededNames = rawAssetNamesForArchives(files)
  if (supersededNames.size > 0) {
    const releaseAssets = await retryGitHubReleaseOperation(
      `Asset listing for release ${tag}`,
      () => octokit.paginate(octokit.rest.repos.listReleaseAssets, {
        owner,
        repo,
        release_id: releaseId,
        per_page: 100,
      }),
      { onRetry: message => core.warning(message) },
    )
    for (const asset of releaseAssets) {
      if (!supersededNames.has(asset.name))
        continue
      await retryGitHubReleaseOperation(
        `Removal of superseded asset ${asset.name}`,
        () => octokit.rest.repos.deleteReleaseAsset({ owner, repo, asset_id: asset.id }),
        { onRetry: message => core.warning(message) },
      )
      core.info(`Removed superseded raw asset: ${asset.name}`)
    }
  }

  // Upload assets
  const uploadFailures: string[] = []
  const uploadFile = async (file: string): Promise<void> => {
    const name = path.basename(file)
    try {
      const data = fs.readFileSync(file)
      const size = fs.statSync(file).size
      const result = await uploadReleaseAssetReliably({
        name,
        size,
        replaceExisting: existingRelease !== undefined,
        upload: async () => {
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
        },
        listAssets: async () => {
          return await retryGitHubReleaseOperation(
            `Asset reconciliation for release ${tag}`,
            () => octokit.paginate(octokit.rest.repos.listReleaseAssets, {
              owner,
              repo,
              release_id: releaseId,
              per_page: 100,
            }),
          )
        },
        deleteAsset: async (assetId) => {
          await retryGitHubReleaseOperation(
            `Removal of stale asset ${name}`,
            () => octokit.rest.repos.deleteReleaseAsset({ owner, repo, asset_id: assetId }),
          )
        },
        onRetry: message => core.warning(message),
      })
      core.info(`${result === 'uploaded' ? 'Uploaded' : 'Verified'}: ${name} (${(size / 1024).toFixed(1)} KB)`)
    }
    catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      uploadFailures.push(`${name}: ${msg}`)
      core.error(`Failed to upload ${name}: ${msg}`)
    }
  }
  for (const file of files) {
    await uploadFile(file)
  }

  if (uploadFailures.length > 0)
    throw new Error(`Failed to upload ${uploadFailures.length} release asset(s): ${uploadFailures.join('; ')}`)

  const receiptFiles = await runReleaseTargets({
    inputs,
    releaseFiles,
    releaseDirectory,
    manifest,
    manifestPath,
    releaseNotes: body || '',
    owner,
    repo,
  })

  for (const receiptFile of receiptFiles) {
    await uploadFile(receiptFile)
    files.push(receiptFile)
  }
  if (uploadFailures.length > 0)
    throw new Error(`Failed to upload ${uploadFailures.length} release receipt(s): ${uploadFailures.join('; ')}`)

  const repositoryTags = await retryGitHubReleaseOperation(
    'Repository tag listing',
    () => octokit.paginate(octokit.rest.repos.listTags, { owner, repo, per_page: 100 }),
    { onRetry: message => core.warning(message) },
  )
  const makeLatest = resolveSemanticMakeLatest(
    tag,
    repositoryTags.map(repositoryTag => repositoryTag.name),
    makeLatestMode,
    inputs.releasePrerelease,
  )

  if (publishCreatedDraft) {
    await retryGitHubReleaseOperation(
      `Publication of release ${tag}`,
      () => octokit.rest.repos.updateRelease({
        owner,
        repo,
        release_id: releaseId,
        draft: false,
        make_latest: makeLatest,
      }),
      { onRetry: message => core.warning(message) },
    )
    core.info(`Published release: ${tag}`)
  }
  else if (!inputs.releaseDraft) {
    await retryGitHubReleaseOperation(
      `Latest release reconciliation for ${tag}`,
      () => octokit.rest.repos.updateRelease({ owner, repo, release_id: releaseId, make_latest: makeLatest }),
      { onRetry: message => core.warning(message) },
    )
    core.info(`Reconciled latest release setting for ${tag}: ${makeLatest}`)
  }

  if (releaseUrl)
    core.setOutput('release-url', releaseUrl)

  core.info(`Release complete: ${files.length} file(s) attached`)
  core.endGroup()
}

run()
