import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

assert(process.argv[2], 'Supply the normally published or source-built Pantry CLI')
const cli = resolve(process.argv[2])
const mode = process.argv[3] || 'workspace'
assert(['single', 'workspace'].includes(mode))
const artifacts = resolve('artifacts/nested-js-graph')
await mkdir(artifacts, { recursive: true })
const root = await mkdtemp(join(tmpdir(), 'pantry nested graph '))
const project = join(root, 'project')
await mkdir(project)
const leaf = '@pantry-fixture/leaf'
const parent = '@pantry-fixture/parent'
const proof: Record<string, unknown> = { passed: false, mode, cliSha256: Bun.SHA256.hash(await readFile(cli), 'hex') }
const env = { ...process.env, XDG_DATA_HOME: join(root, 'data'), XDG_CACHE_HOME: join(root, 'cache'), BUN_INSTALL_CACHE_DIR: join(root, 'bun-cache'), NO_COLOR: '1' }
const packages = [
  { name: leaf, version: '1.0.0', code: 'module.exports = "1.0.0"\n', dependencies: {} },
  { name: leaf, version: '2.0.0', code: 'module.exports = "2.0.0"\n', dependencies: {} },
  { name: parent, version: '1.0.0', code: `module.exports = require('${leaf}')\n`, dependencies: { [leaf]: '2.0.0' } },
]
const archives = new Map<string, Buffer>()
const metadata = new Map<string, Record<string, unknown>>()
const requests: Array<{ method: string, path: string }> = []

async function run(name: string, args: string[], cwd = project): Promise<string> {
  const child = Bun.spawn(args, { cwd, env, stdout: 'pipe', stderr: 'pipe', signal: AbortSignal.timeout(120_000) })
  const [stdout, stderr, code] = await Promise.all([new Response(child.stdout).text(), new Response(child.stderr).text(), child.exited])
  await writeFile(join(artifacts, `${name}.log`), stdout + stderr)
  assert.equal(code, 0, `${name}: ${stdout}${stderr}`)
  return stdout.trim()
}

const server = Bun.serve({
  hostname: '127.0.0.1', port: 0,
  fetch(request) {
    const path = decodeURIComponent(new URL(request.url).pathname).replace(/^\//, '')
    requests.push({ method: request.method, path })
    if (request.method !== 'GET') return new Response('Fixture registry is read-only', { status: 405 })
    const archive = archives.get(path)
    if (archive) return new Response(archive)
    const entry = metadata.get(path)
    return entry ? Response.json(entry) : new Response('Unknown fixture package', { status: 404 })
  },
})

try {
  proof.cliVersion = await run('cli-version', [cli, '--version'])
  for (const [index, pkg] of packages.entries()) {
    const staging = join(root, `archive-${index}`)
    await mkdir(join(staging, 'package'), { recursive: true })
    await writeFile(join(staging, 'package/package.json'), JSON.stringify({ name: pkg.name, version: pkg.version, main: 'index.js', dependencies: pkg.dependencies }))
    await writeFile(join(staging, 'package/index.js'), pkg.code)
    const file = join(root, `package-${index}.tgz`)
    await run(`pack-${index}`, ['tar', '-czf', file, '-C', staging, 'package'])
    const bytes = Buffer.from(await readFile(file))
    const key = `archives/package-${index}.tgz`
    archives.set(key, bytes)
    const data = metadata.get(pkg.name) ?? { name: pkg.name, versions: {}, 'dist-tags': {} }
    const versions = data.versions as Record<string, unknown>
    versions[pkg.version] = { name: pkg.name, version: pkg.version, dependencies: pkg.dependencies, dist: {
      tarball: `${server.url}${key}`,
      shasum: createHash('sha1').update(bytes).digest('hex'),
      integrity: `sha512-${createHash('sha512').update(bytes).digest('base64')}`,
    } }
    data['dist-tags'] = { latest: pkg.version }
    metadata.set(pkg.name, data)
  }
  await writeFile(join(project, '.npmrc'), `registry=${server.url.origin}\n`)
  if (mode === 'workspace') {
    await mkdir(join(project, 'packages/member'), { recursive: true })
    await writeFile(join(project, 'packages/member/package.json'), JSON.stringify({ name: '@pantry-fixture/member', version: '1.0.0', private: true }))
  }
  await writeFile(join(project, 'package.json'), JSON.stringify({ name: 'nested-graph-fixture', version: '1.0.0', private: true, ...(mode === 'workspace' ? { workspaces: ['packages/*'] } : {}), dependencies: { [leaf]: '1.0.0', [parent]: '1.0.0' } }))
  await run('bun-install', ['bun', 'install'])
  const evaluate = async (tree: string, pkg: string, label: string): Promise<string> => run(label, ['bun', '-e', `console.log((await import(${JSON.stringify(pathToFileURL(join(project, tree, pkg, 'index.js')).href)})).default)`])
  assert.equal(await evaluate('node_modules', parent, 'bun-parent-binding'), '2.0.0')
  assert.equal(await evaluate('node_modules', leaf, 'bun-root-binding'), '1.0.0')
  await run('pantry-install', [cli, 'install'])
  const checkBindings = async (label: string): Promise<void> => {
    assert.equal(await evaluate('node_modules', leaf, `${label}-bun-root`), '1.0.0')
    assert.equal(await evaluate('node_modules', parent, `${label}-bun-parent`), '2.0.0')
    const duplicated = existsSync(join(project, 'pantry', parent, 'package.json'))
    proof.nativeNpmTreePresent = duplicated
    if (duplicated) {
      const actualRoot = await evaluate('pantry', leaf, `${label}-pantry-root`)
      const actualParent = await evaluate('pantry', parent, `${label}-pantry-parent`)
      proof.actualRootBinding = actualRoot
      proof.actualParentBinding = actualParent
      proof.expectedRootBinding = '1.0.0'
      proof.expectedParentBinding = '2.0.0'
      assert.equal(actualRoot, '1.0.0', 'Keep the direct root dependency at its declared version')
      assert.equal(actualParent, '2.0.0', 'Resolve the conflicting dependency from its parent, not the root hoist')
    }
  }
  if (existsSync(join(project, 'pantry.lock'))) await writeFile(join(artifacts, 'pantry.lock'), await readFile(join(project, 'pantry.lock')))
  const bunLock = await readFile(join(project, 'bun.lock'))
  await writeFile(join(artifacts, 'bun.lock'), bunLock)
  await checkBindings('cold')
  await run('pantry-warm', [cli, 'install'])
  await checkBindings('warm')
  await run('pantry-frozen', [cli, 'install', '--frozen-lockfile'])
  await checkBindings('frozen')
  assert.deepEqual(await readFile(join(project, 'bun.lock')), bunLock, 'The normal frozen install keeps the authoritative JS lock unchanged')
  proof.passed = true
}
finally {
  proof.requests = requests
  await server.stop(true)
  await rm(root, { recursive: true, force: true })
  proof.cleaned = true
  await writeFile(join(artifacts, 'proof.json'), JSON.stringify(proof, null, 2) + '\n')
}
