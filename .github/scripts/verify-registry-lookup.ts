import { strict as assert } from 'node:assert'
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { createServer, type Server } from 'node:http'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

const cli = resolve(process.env.PANTRY_SOURCE_CLI || 'packages/zig/zig-out/bin/pantry')
const domain = 'registry-lookup.test'
const token = 'disposable-registry-fixture-token'
const root = await mkdtemp(join(tmpdir(), 'pantry-native-lookup-'))
const observations: object[] = []
const segment = process.env.PANTRY_LOOKUP_SEGMENT || 'metadata'
let mode = ''
let requests: string[] = []
let registryCredentials = 0
let foreignCredentials = 0
let foreignRequests = 0
let child: ReturnType<typeof Bun.spawn> | undefined
const failures: string[] = []
const metadata = { versions: { '1.0.0': { platforms: { 'linux-x86-64': { tarball: `binaries/${domain}/1.0.0/archive.tar.gz` } } } } }

async function listen(server: Server): Promise<string> {
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', resolve)
  })
  const address = server.address()
  if (!address || typeof address === 'string') throw new Error('No fixture port')
  return `http://127.0.0.1:${address.port}`
}

const foreign = createServer((req, res) => {
  foreignRequests += 1
  if (req.headers.authorization) foreignCredentials += 1
  res.end(JSON.stringify(metadata))
})
const foreignBase = await listen(foreign)
const registry = createServer((req, res) => {
  const url = req.url || ''
  requests.push(url)
  if (req.headers.authorization === `Bearer ${token}`) registryCredentials += 1
  if (!url.endsWith('/metadata.json')) {
    if (mode === 'artifact-stalled-head') return
    if (mode === 'artifact-stalled-body') {
      res.writeHead(200, { 'Content-Length': 1000 })
      res.write('partial archive bytes')
      return
    }
    res.writeHead(mode === 'artifact503' ? 503 : mode === 'artifact403' ? 403 : 404)
    res.end('fixture archive unavailable')
    return
  }
  if (mode === 'redirect') {
    res.writeHead(302, { Location: `${foreignBase}/metadata.json` })
    res.end()
    return
  }
  if (mode === '503' || mode === '403' || mode === '404') {
    res.writeHead(Number(mode))
    res.end('fixture status')
    return
  }
  if (mode === 'disconnect') return req.socket.destroy()
  if (mode === 'stalled-head') return
  if (mode === 'stalled-body') {
    res.writeHead(200, { 'Content-Length': 1000 })
    res.write('{"versions":')
    return
  }
  res.end(mode === 'malformed' ? '{' : mode === 'null' ? 'null' : mode === 'array' ? '{"versions":[]}' : mode === 'empty' ? '{"versions":{}}' : JSON.stringify(metadata))
})
const base = await listen(registry)
try {
  const scenarios = segment === 'metadata' ? ['503', '403', 'malformed', 'null', 'array', 'disconnect', 'stalled-head', 'stalled-body', 'artifact503', 'artifact403', 'redirect'] : [segment]
  for (const scenario of scenarios) {
    let timer: ReturnType<typeof setTimeout> | undefined
    try {
      mode = scenario
      requests = []
      registryCredentials = 0
      foreignCredentials = 0
      foreignRequests = 0
      const cwd = join(root, scenario)
      await mkdir(cwd)
      await writeFile(join(cwd, 'deps.yaml'), `dependencies:\n  ${domain}: 1.0.0\n`)
      const started = performance.now()
      child = Bun.spawn([cli, 'install', '--verbose'], {
        cwd,
        env: { ...process.env, HOME: join(cwd, 'home'), XDG_DATA_HOME: join(cwd, 'data'), XDG_CACHE_HOME: join(cwd, 'cache'), PANTRY_REGISTRY_URL: base, PANTRY_REGISTRY_TOKEN: token, PANTRY_TOKEN: token, CI: 'true' },
        stdout: 'pipe', stderr: 'pipe',
      })
      let killed = false
      const ownedChild = child
      timer = setTimeout(() => { killed = true; ownedChild.kill() }, scenario.startsWith('artifact-stalled') ? 330_000 : 45_000)
      const [stdout, stderr, exit] = await Promise.all([new Response(child.stdout).text(), new Response(child.stderr).text(), child.exited])
      clearTimeout(timer)
      child = undefined
      const output = stdout + stderr
      const elapsed = performance.now() - started
      console.log(JSON.stringify({ scenario, exit, elapsed, requests, registryCredentials, foreignCredentials, foreignRequests, killed }))
      console.log(output)
      assert.equal(killed, false, 'product must finish within its own deadline')
      assert.notEqual(exit, 0, 'an unavailable artifact must not install')
      assert.ok(requests.some(url => url.endsWith('/metadata.json')), 'normal registry setting must reach the owned fixture')
      assert.ok(registryCredentials > 0, 'configured registry must receive its scoped token')
      assert.equal(foreignCredentials, 0, 'credentials must not cross origin')
      if (scenario.startsWith('artifact')) assert.ok(requests.some(url => url === `/binaries/${domain}/1.0.0/archive.tar.gz`), 'artifact cases must reach the requested archive rather than fail on a dependency')
      if (scenario === 'redirect') assert.ok(foreignRequests > 0)
      else {
        assert.doesNotMatch(output, /not found in (?:pantry|registry)/i, 'failures cannot become package absence')
        if (scenario.includes('503')) assert.match(output, /HTTP 503/)
        else if (scenario.includes('403')) assert.match(output, /HTTP 403/)
        else if (scenario.includes('stalled')) assert.match(output, /timeout|timed out/i)
        else if (['malformed', 'null', 'array'].includes(scenario)) assert.match(output, /invalid.?registry.?metadata/i)
        if (!scenario.startsWith('artifact')) assert.equal(requests.filter(url => !url.endsWith('/metadata.json')).length, 0, 'metadata errors must stop fallback and archive downloads')
      }
      observations.push({ scenario, exit, elapsed, requests, registryCredentials, foreignCredentials, foreignRequests, killed })
    }
    catch (error) {
      failures.push(`${scenario}: ${error instanceof Error ? error.message : String(error)}`)
      console.error(failures.at(-1))
    }
    finally {
      clearTimeout(timer)
      if (child) { child.kill(); await child.exited; child = undefined }
      registry.closeAllConnections()
      foreign.closeAllConnections()
    }
  }
  await writeFile('artifacts/native-catalog/native-registry-lookup.json', `${JSON.stringify({ cli, observations, failures }, null, 2)}\n`)
  assert.equal(failures.length, 0, failures.join('\n'))
}
finally {
  if (child) { child.kill(); await child.exited }
  for (const server of [registry, foreign]) {
    server.closeAllConnections()
    await new Promise<void>(resolve => server.close(() => resolve()))
  }
  await rm(root, { recursive: true, force: true })
}
