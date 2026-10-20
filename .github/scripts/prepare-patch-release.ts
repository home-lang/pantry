import assert from 'node:assert/strict'
import { mkdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

interface SourceRun { id: number, name: string, head_sha: string, status: string, conclusion: string | null }
interface SourceJob { name: string, status: string, conclusion: string | null }

export function nextPatchVersion(version: unknown): string {
  assert.equal(typeof version, 'string')
  assert.match(version as string, /^\d+\.\d+\.\d+$/)
  const [major, minor, patch] = (version as string).split('.').map(Number) as [number, number, number]
  assert([major, minor, patch, patch + 1].every(Number.isSafeInteger))
  return `${major}.${minor}.${patch + 1}`
}

export function requireQualifiedSourceCi(expected: string, ci: SourceRun, jobs: { total_count: number, jobs: SourceJob[] }): void {
  assert.equal(ci.name, 'CI')
  assert.equal(ci.head_sha, expected)
  assert.equal(ci.status, 'completed')
  assert.equal(ci.conclusion, 'success')
  assert.equal(jobs.jobs.length, jobs.total_count)
  assert(jobs.jobs.filter(job => job.conclusion === 'success').length >= 13)
  for (const name of ['lint', 'typecheck', 'test', 'zig-tests', 'windows-native-runtime'])
    assert(jobs.jobs.some(job => job.name === name && job.conclusion === 'success'), `Required source gate ${name} did not succeed`)
  assert(jobs.jobs.every(job => job.status === 'completed' && ['success', 'skipped'].includes(job.conclusion ?? '')))
}

export function requireReleaseIdentity(identity: string, message: string): void {
  assert.equal(identity, 'Chris Breuer|chrisbreuer93@gmail.com|Chris Breuer|chrisbreuer93@gmail.com')
  assert.doesNotMatch(message, /^Co-authored-by:/im)
}

export function requireReleaseToolchain(declared: unknown, installed: unknown): void {
  assert.equal(declared, '0.2.25', 'The publisher must be an exact normal dependency on the fixed public release')
  assert.equal(installed, declared, 'The installed publisher must match the qualified lockfile dependency')
}

async function verifyToolchain(): Promise<void> {
  const manifest = JSON.parse(await readFile('package.json', 'utf8'))
  const installed = JSON.parse(await readFile('node_modules/@stacksjs/bumpx/package.json', 'utf8'))
  requireReleaseToolchain(manifest.devDependencies?.['@stacksjs/bumpx'], installed.version)
  const probe = Bun.spawnSync(['bun', 'x', '--bun', '@stacksjs/bumpx', 'patch', '--expected-source', 'invalid', '--dry-run', '--yes'], { stdout: 'pipe', stderr: 'pipe', timeout: 30_000 })
  assert.notEqual(probe.exitCode, 0, 'The public publisher must reject an invalid expected source')
  assert.match(Buffer.from(probe.stdout).toString() + Buffer.from(probe.stderr).toString(), /Expected source must be a full Git commit hash/)
}

function git(...args: string[]): string {
  const result = Bun.spawnSync(['git', ...args], { stdout: 'pipe', stderr: 'pipe', timeout: 30_000 })
  assert.equal(result.exitCode, 0, Buffer.from(result.stderr).toString())
  return Buffer.from(result.stdout).toString().trim()
}
async function get(url: string): Promise<Response> {
  // These are public repository/package readbacks. No secret is forwarded.
  return fetch(url, { signal: AbortSignal.timeout(20_000), headers: { Accept: 'application/vnd.github+json' } })
}
function identity(): void {
  assert.equal(git('config', '--get', 'user.name'), 'Chris Breuer')
  assert.equal(git('config', '--get', 'user.email'), 'chrisbreuer93@gmail.com')
}
async function main(): Promise<void> {
  const repo = 'pantry-pm/pantry'
  assert.equal(process.env.GITHUB_REPOSITORY, repo)
  const expected = process.env.PANTRY_RELEASE_EXPECTED_SHA ?? ''
  assert.match(expected, /^[a-f0-9]{40}$/)
  const directory = join(process.env.RUNNER_TEMP!, 'pantry-patch-release')
  await mkdir(directory, { recursive: true })
  const receipt = join(directory, 'receipt.json')
  if (process.argv[2] !== 'record')
    await Bun.write(receipt, JSON.stringify({ phase: 'started', operation: process.argv[2], expectedSource: expected, producerInvoked: false, publicationInvoked: false }, null, 2) + '\n')
  if (['toolchain', 'verify-toolchain'].includes(process.argv[2]!)) {
    assert.equal(git('rev-parse', 'HEAD'), expected)
    await verifyToolchain()
    if (process.argv[2] === 'toolchain') {
      const changedFiles = git('diff', '--name-only').split('\n').filter(Boolean)
      assert(changedFiles.every(file => ['package.json', 'bun.lock', 'pantry.lock', 'packages/action/dist/index.js', 'packages/action/dist/post.js'].includes(file)), 'Normal dependency adoption changed unexpected source files')
      await Bun.write(receipt, JSON.stringify({ phase: 'normal-public-toolchain-and-frozen-locks-verified', expectedSource: expected, bumpxVersion: '0.2.25', changedFiles, producerInvoked: false, publicationInvoked: false }, null, 2) + '\n')
    }
  }
  else if (process.argv[2] === 'preflight') {
    identity()
    assert.equal(git('branch', '--show-current'), 'main')
    assert.equal(git('status', '--porcelain'), '')
    git('fetch', 'origin', 'main')
    assert.equal(git('rev-parse', 'HEAD'), expected)
    assert.equal(git('rev-parse', 'origin/main'), expected)
    const runsResponse = await get(`https://api.github.com/repos/${repo}/actions/runs?head_sha=${expected}&per_page=100`)
    assert.equal(runsResponse.status, 200)
    const runs = await runsResponse.json() as { workflow_runs: Array<{ id: number, name: string, head_sha: string, status: string, conclusion: string }> }
    const ci = runs.workflow_runs.find(run => run.name === 'CI' && run.head_sha === expected)
    assert(ci, 'Exact source CI must exist')
    const jobsResponse = await get(`https://api.github.com/repos/${repo}/actions/runs/${ci.id}/jobs?per_page=100`)
    assert.equal(jobsResponse.status, 200)
    const jobs = await jobsResponse.json() as { total_count: number, jobs: Array<{ name: string, status: string, conclusion: string }> }
    requireQualifiedSourceCi(expected, ci, jobs)
    const { version } = JSON.parse(await readFile('package.json', 'utf8')) as { version: string }
    const next = nextPatchVersion(version)
    const tag = `v${next}`
    assert.equal(git('ls-remote', '--tags', 'origin', `refs/tags/${tag}`, `refs/tags/${tag}^{}`), '', 'Never replace an existing tag')
    assert.equal((await get(`https://api.github.com/repos/${repo}/releases/tags/${tag}`)).status, 404, 'Never replace an existing release')
    assert.equal((await get(`https://registry.npmjs.org/ts-pantry/${next}`)).status, 404, 'Never republish an accepted npm version')
    await Bun.write(receipt, JSON.stringify({ expectedSource: expected, sourceCiRun: ci.id, sourceJobs: jobs.jobs, currentVersion: version, nextVersion: next, tag, phase: 'preflight-passed', publicationInvoked: false }, null, 2) + '\n')
    assert.equal(git('rev-parse', 'HEAD'), expected)
    assert.equal(git('status', '--porcelain'), '')
  }
  else if (process.argv[2] === 'record') {
    const proof = JSON.parse(await readFile(receipt, 'utf8'))
    proof.producerStepOutcome = process.env.PANTRY_PATCH_PRODUCER_OUTCOME ?? 'unknown'
    proof.producerInvoked = ['success', 'failure', 'cancelled'].includes(proof.producerStepOutcome)
    proof.recordedAt = new Date().toISOString()
    await Bun.write(receipt, JSON.stringify(proof, null, 2) + '\n')
    assert.equal(proof.producerStepOutcome, 'success', 'Preserve the original producer step failure; never start a second producer')
    identity()
    const sha = git('rev-parse', 'HEAD')
    assert.equal(git('rev-parse', 'HEAD^'), expected, 'Stop before publication if the normal producer pulled another source base')
    assert.equal(git('status', '--porcelain'), '')
    requireReleaseIdentity(git('log', '-1', '--format=%an|%ae|%cn|%ce'), git('log', '-1', '--format=%B'))
    assert.equal(JSON.parse(await readFile('package.json', 'utf8')).version, proof.nextVersion)
    assert.equal(git('rev-parse', `${proof.tag}^{commit}`), sha)
    assert.equal(git('ls-remote', 'origin', 'refs/heads/main').split(/\s+/)[0], sha)
    const remoteTags = git('ls-remote', '--tags', 'origin', `refs/tags/${proof.tag}`, `refs/tags/${proof.tag}^{}`)
    assert(remoteTags.split('\n').some(line => line === `${sha}\trefs/tags/${proof.tag}^{}` || line === `${sha}\trefs/tags/${proof.tag}`))
    proof.phase = 'normal-producer-pushed-and-readback-verified'
    proof.releaseSha = sha
    proof.originalCommitBody = git('log', '-1', '--format=%B')
    proof.changedFiles = git('diff-tree', '--no-commit-id', '--name-only', '-r', sha).split('\n')
    proof.remoteTagReadback = remoteTags
    proof.publicationInvoked = false
    await Bun.write(receipt, JSON.stringify(proof, null, 2) + '\n')
    const output = process.env.GITHUB_OUTPUT
    assert(output)
    const file = Bun.file(output)
    await Bun.write(output, (await file.text()) + `tag=${proof.tag}\nrelease_sha=${sha}\n`)
  }
  else throw new Error('Expected toolchain, verify-toolchain, preflight or record stage')
}

if (import.meta.main) await main()
