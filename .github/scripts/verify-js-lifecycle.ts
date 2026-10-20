import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

assert(process.argv[2], 'Supply the normally built source CLI')
const cli = resolve(process.argv[2])
const artifacts = resolve('artifacts/nested-js-graph/lifecycle')
await mkdir(artifacts, { recursive: true })
const root = await mkdtemp(join(tmpdir(), 'pantry lifecycle '))
const observations: object[] = []
const proof = { passed: false, cliSha256: Bun.SHA256.hash(await readFile(cli), 'hex'), observations }
const hook = 'require("node:fs").appendFileSync(process.env.PANTRY_LIFECYCLE_LOG, process.argv[2] + "\\n")\n'
try {
  for (const mode of ['single', 'workspace']) {
    const project = join(root, mode)
    const staging = join(project, 'archive/package')
    const sentinel = join(project, 'hooks.log')
    await mkdir(staging, { recursive: true })
    const env = { ...process.env, XDG_DATA_HOME: join(project, 'data'), XDG_CACHE_HOME: join(project, 'cache'), BUN_INSTALL_CACHE_DIR: join(project, 'bun-cache'), PANTRY_LIFECYCLE_LOG: sentinel, NO_COLOR: '1' }
    const run = async (phase: string, args: string[]): Promise<void> => {
      const child = Bun.spawn(args, { cwd: project, env, stdout: 'pipe', stderr: 'pipe', signal: AbortSignal.timeout(120_000) })
      const [stdout, stderr, code] = await Promise.all([new Response(child.stdout).text(), new Response(child.stderr).text(), child.exited])
      await writeFile(join(artifacts, `${mode}-${phase}.log`), stdout + stderr)
      assert.equal(code, 0, `${mode}/${phase}: ${stdout}${stderr}`)
    }
    await writeFile(join(staging, 'package.json'), JSON.stringify({ name: '@pantry-fixture/lifecycle', version: '1.0.0', scripts: { postinstall: 'bun hook.cjs dependency' } }))
    await writeFile(join(staging, 'hook.cjs'), hook)
    await run('pack', ['tar', '-czf', join(project, 'dependency.tgz'), '-C', join(project, 'archive'), 'package'])
    await writeFile(join(project, 'hook.cjs'), hook)
    await writeFile(join(project, 'package.json'), JSON.stringify({
      name: 'pantry-lifecycle-fixture', version: '1.0.0', private: true,
      packageManager: `bun@${Bun.version}`, dependencies: { '@pantry-fixture/lifecycle': 'file:dependency.tgz' },
      trustedDependencies: ['@pantry-fixture/lifecycle'], scripts: { postinstall: 'bun hook.cjs root' },
      ...(mode === 'workspace' ? { workspaces: ['packages/*'] } : {}),
    }))
    if (mode === 'workspace') {
      await mkdir(join(project, 'packages/member'), { recursive: true })
      await writeFile(join(project, 'packages/member/hook.cjs'), hook)
      await writeFile(join(project, 'packages/member/package.json'), JSON.stringify({ name: '@pantry-fixture/member', version: '1.0.0', scripts: { postinstall: 'bun hook.cjs member' } }))
    }
    await run('ordinary-cold', [cli, 'install'])
    const ordinary = await readFile(sentinel, 'utf8')
    assert.match(ordinary, /root\n/, 'ordinary installs must actually run the root hook')
    assert.match(ordinary, /dependency\n/, 'the trusted dependency makes suppression observable')
    const locked = await readFile(join(project, 'bun.lock'))
    for (const [phase, args] of [
      ['ignored-cold', ['install', '--ignore-scripts']],
      ['ignored-frozen', ['install', '--frozen-lockfile', '--ignore-scripts']],
      ['ignored-ci', ['ci', '--ignore-scripts']],
    ] as const) {
      await rm(join(project, 'node_modules'), { recursive: true, force: true })
      await rm(sentinel, { force: true })
      await run(phase, [cli, ...args])
      assert.equal(existsSync(sentinel), false, `${mode}/${phase}: no root, member, or dependency hook may run`)
      assert.deepEqual(await readFile(join(project, 'bun.lock')), locked, 'lifecycle policy leaves the authoritative graph unchanged')
      await run(`${phase}-resume`, [cli, 'install'])
      assert.match(await readFile(sentinel, 'utf8'), /root\n/, 'an ignored-install marker cannot suppress a later ordinary install')
      observations.push({ mode, phase, ignoredHooks: 0, ordinaryHooksResumed: true })
    }
  }
  proof.passed = true
}
finally {
  await rm(root, { recursive: true, force: true })
  await writeFile(join(artifacts, 'proof.json'), JSON.stringify(proof, null, 2) + '\n')
}
