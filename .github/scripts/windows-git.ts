import assert from 'node:assert/strict'
import { lstat, mkdir, mkdtemp, readFile, realpath, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { installResolvedSystemPackages } from '../../packages/action/src/system-packages'

assert.equal(process.platform, 'win32', 'Git execution qualification requires a Windows host')
const artifacts = resolve('artifacts/windows-git')
await mkdir(artifacts, { recursive: true })
const owned = await mkdtemp(join(tmpdir(), 'pantry Git bundle '))
const proof: Record<string, unknown> = { passed: false, host: process.platform, architecture: process.arch }
let workspace = join(owned, 'original workspace')
let tree = join(workspace, 'pantry')

async function run(name: string, command: string[], cwd = owned, extra: Record<string, string> = {}): Promise<string> {
  const env: Record<string, string | undefined> = { ...process.env, GIT_TERMINAL_PROMPT: '0', NO_COLOR: '1', ...extra }
  for (const key of Object.keys(env)) if (key.toLowerCase() === 'path') delete env[key]
  env.PATH = `${join(tree, '.bin')};${process.env.PATH ?? process.env.Path ?? ''}`
  const child = Bun.spawn(command, { cwd, env, stdin: 'ignore', stdout: 'pipe', stderr: 'pipe', signal: AbortSignal.timeout(180_000) })
  const [code, stdout, stderr] = await Promise.all([child.exited, new Response(child.stdout).text(), new Response(child.stderr).text()])
  await Bun.write(join(artifacts, `${name}.log`), stdout + stderr)
  assert.equal(code, 0, `${name}: ${stdout}\n${stderr}`)
  return stdout.trim()
}
async function install() {
  return installResolvedSystemPackages([{ domain: 'git-scm.org', version: '2.53.0' }], {
    installDir: tree,
    nativeInstall: async () => { throw new Error('The self-contained Windows bundle must use its verified SDK resolver') },
  })
}
try {
  await mkdir(workspace)
  const commandFiles: Record<string, string> = {}
  for (const channel of ['PATH', 'ENV', 'OUTPUT', 'STATE', 'STEP_SUMMARY']) {
    const file = join(workspace, `github-${channel.toLowerCase()}`)
    await Bun.write(file, '')
    commandFiles[`GITHUB_${channel}`] = file
  }
  const action = resolve(process.env.PANTRY_TEST_ACTION || '')
  assert(process.env.PANTRY_TEST_ACTION, 'The fixture requires the actual built source Action')
  proof.sourceActionSha256 = Bun.SHA256.hash(await readFile(action), 'hex')
  await run('source-action-cold-install', [process.execPath, action], workspace, {
    INPUT_VERSION: '0.11.113', INPUT_INSTALL: 'false', INPUT_PACKAGES: 'bun.com@1.4.3 git-scm.org@2.53.0',
    INPUT_CACHE: 'false', INPUT_SERVICES: '', INPUT_RELEASE: 'false', INPUT_PUBLISH: '',
    ...commandFiles,
  })
  const versions = await install()
  assert.equal(versions.get('git-scm.org'), '2.53.0+windows.1')
  const provider = join(tree, 'git-scm.org/v2.53.0+windows.1/cmd/git.exe')
  const providerHash = Bun.SHA256.hash(await readFile(provider), 'hex')
  assert((await readFile(join(tree, 'git-scm.org/v2.53.0+windows.1/LICENSE.txt'))).length > 0)
  const child = join(owned, 'child repository')
  const parent = join(owned, 'parent repository')
  for (const phase of ['installed', 'relocated']) {
    const git = join(tree, '.bin/git.exe')
    assert((await lstat(git)).isSymbolicLink())
    assert.equal(await realpath(git), await realpath(join(tree, 'git-scm.org/v2.53.0+windows.1/cmd/git.exe')))
    assert.equal(Bun.SHA256.hash(await readFile(git), 'hex'), providerHash)
    assert.equal(await run(`${phase}-version`, [git, '--version']), 'git version 2.53.0.windows.1')
    if (phase === 'installed') {
      await run('init-child', [git, 'init', child])
      await Bun.write(join(child, 'content.txt'), 'native Windows Git submodule\n')
      await run('add-child', [git, '-C', child, 'add', '.'])
      await run('commit-child', [git, '-C', child, '-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '-m', 'feat: fixture content'])
      await run('init-parent', [git, 'init', parent])
      await run('add-submodule', [git, '-C', parent, '-c', 'protocol.file.allow=always', 'submodule', 'add', child, 'vendor/child'])
      const status = await run('submodule-status', [git, '-C', parent, 'submodule', 'status'])
      assert.match(status, /^ [a-f0-9]{40} vendor\/child|^[a-f0-9]{40} vendor\/child/)
      const warm = await install()
      assert.equal(warm.get('git-scm.org'), versions.get('git-scm.org'))
      const moved = join(owned, 'relocated workspace')
      await run('relocate-prefix', ['powershell', '-NoProfile', '-NonInteractive', '-Command', 'Move-Item -LiteralPath $env:PANTRY_GIT_MOVE_SOURCE -Destination $env:PANTRY_GIT_MOVE_DESTINATION -ErrorAction Stop'], owned, { PANTRY_GIT_MOVE_SOURCE: workspace, PANTRY_GIT_MOVE_DESTINATION: moved })
      workspace = moved
      tree = join(workspace, 'pantry')
    }
    else {
      assert.equal((await install()).get('git-scm.org'), versions.get('git-scm.org'))
      assert.match(await run('relocated-submodule-status', [git, '-C', parent, 'submodule', 'status']), /[a-f0-9]{40} vendor\/child/)
      await run('relocated-submodule-foreach', [git, '-C', parent, 'submodule', 'foreach', '--recursive', 'git status --porcelain'])
    }
  }
  const cache = join(owned, 'verified-prefix-cache.tar.gz')
  await run('cache-pack', ['tar.exe', '-czf', cache, '-C', workspace, 'pantry'])
  const restored = join(owned, 'restored workspace')
  await mkdir(restored)
  await run('cache-restore', ['tar.exe', '-xzf', cache, '-C', restored])
  workspace = restored
  tree = join(workspace, 'pantry')
  assert.equal((await install()).get('git-scm.org'), versions.get('git-scm.org'))
  const git = join(tree, '.bin/git.exe')
  assert.equal(Bun.SHA256.hash(await readFile(git), 'hex'), providerHash)
  assert.equal(await run('restored-version', [git, '--version']), 'git version 2.53.0.windows.1')
  await run('restored-submodules', [git, '-C', parent, 'submodule', 'foreach', '--recursive', 'git status --porcelain'])
  proof.cacheRoundTripRetainedNativeProvider = true
  const fetched = join(owned, 'https fetch')
  await run('https-init', [git, 'init', fetched])
  await run('https-fetch', [git, '-C', fetched, 'fetch', '--depth=1', '--no-tags', 'https://github.com/zig-utils/zig-regex.git', 'fdd9c2e333ea6ac2fd06d080d939ef7f11d61b1b'])
  assert.equal(await run('https-identity', [git, '-C', fetched, 'rev-parse', 'FETCH_HEAD']), 'fdd9c2e333ea6ac2fd06d080d939ef7f11d61b1b')
  proof.httpsTransportFetchedExactFirstPartySource = true
  proof.version = versions.get('git-scm.org')
  proof.providerSha256 = providerHash
  proof.nativeVersionInitCommitSubmodulesWarmInstallAndRelocation = true
  proof.passed = true
}
finally {
  await rm(owned, { recursive: true, force: true })
  proof.cleaned = true
  await Bun.write(join(artifacts, 'proof.json'), JSON.stringify(proof, null, 2) + '\n')
}
