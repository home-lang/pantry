import assert from 'node:assert/strict'
import { mkdir, mkdtemp, readFile, rm, stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { programsForPlatform } from '../../packages/ts-pantry/src/programs'
import { recipe as gitRecipe } from '../../packages/ts-pantry/src/recipes/git-scm.org'

assert.equal(process.platform, 'linux')
const cli = resolve(process.env.PANTRY_TEST_CLI || '')
assert(process.env.PANTRY_TEST_CLI, 'The all-platform build must supply the actual Linux CLI')
const artifacts = join(import.meta.dir, '../../artifacts/linux-native-tools')
await mkdir(artifacts, { recursive: true })
const root = await mkdtemp(join(tmpdir(), 'pantry native Linux '))
const proof: Record<string, unknown> = { cliSha256: Bun.SHA256.hash(await readFile(cli), 'hex') }

async function run(name: string, command: string[]): Promise<string> {
  const child = Bun.spawn(command, { cwd: root, env: { ...process.env, NO_COLOR: '1' }, stdout: 'pipe', stderr: 'pipe' })
  const timeout = setTimeout(() => child.kill(), 180_000)
  try {
    const [code, stdout, stderr] = await Promise.all([child.exited, new Response(child.stdout).text(), new Response(child.stderr).text()])
    await Bun.write(join(artifacts, `${name}.log`), stdout + stderr)
    assert.equal(code, 0, `${name}: ${stdout}${stderr}`)
    return stdout + stderr
  }
  finally { clearTimeout(timeout) }
}

try {
  proof.cliVersion = (await run('cli-version', [cli, '--version'])).trim()
  assert.match(String(proof.cliVersion), /^pantry \d+\.\d+\.\d+ \([0-9a-f]+\)$/)
  const installed = await run('git-install', [cli, 'install', 'git-scm.org@2.53.0', '--no-save', '--verbose'])
  assert.match(installed, /\[verbose:installer\] install\(\) called: name=git-scm\.org, version=2\.53\.0/,
    'Named package installs must forward verbose diagnostics to the actual installer')
  const bin = join(root, 'pantry/.bin')
  const programs = programsForPlatform(gitRecipe, 'linux-x86-64')
  assert(!programs.includes('git-credential-osxkeychain'))
  for (const name of programs) assert((await stat(join(bin, name))).isFile(), `Missing declared Git program: ${name}`)
  const git = join(bin, 'git')
  assert.equal((await run('git-version', [git, '--version'])).trim(), 'git version 2.53.0')
  await run('git-init', [git, 'init', 'repository'])
  assert.equal((await run('git-status', [git, '-C', 'repository', 'status', '--porcelain'])).trim(), '')
  proof.gitPrograms = programs
  proof.passed = true
}
finally {
  await rm(root, { recursive: true, force: true })
  proof.cleaned = true
  await Bun.write(join(artifacts, 'proof.json'), JSON.stringify(proof, null, 2) + '\n')
}
