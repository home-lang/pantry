import { strict as assert } from 'node:assert'
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

const cli = resolve(process.env.PANTRY_SOURCE_CLI || 'packages/zig/zig-out/bin/pantry')
const domain = 'registry-lookup.test'
const token = 'disposable-registry-fixture-token'
const root = await mkdtemp(join(tmpdir(), 'pantry-native-lookup-'))
await mkdir('artifacts/native-catalog', { recursive: true })
const observations: object[] = []
const segment = process.env.PANTRY_LOOKUP_SEGMENT || 'metadata'
let mode = ''
let requests: string[] = []
let metadataResponses: number[] = []
let registryCredentials = 0
let foreignCredentials = 0
let foreignRequests = 0
let transportDrops = 0
let rateResponses: Array<{ status: number, at: number, wallAt: number, retryAfter?: string }> = []
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
  if (mode === 'artifact429-redirect-recover') {
    const status = foreignRequests === 1 ? 429 : 403
    rateResponses.push({ status, at: performance.now(), wallAt: Date.now(), retryAfter: status === 429 ? '2' : undefined })
    res.writeHead(status, status === 429 ? { 'Retry-After': '2' } : {})
    res.end('foreign fixture status')
    return
  }
  res.end(JSON.stringify(metadata))
})
const foreignBase = await listen(foreign)
const handleRegistry = (req: IncomingMessage, res: ServerResponse) => {
  const url = req.url || ''
  requests.push(url)
  if (req.headers.authorization === `Bearer ${token}`) registryCredentials += 1
  if (mode === 'artifact429-redirect-recover' && !url.endsWith('/metadata.json')) {
    res.writeHead(302, { Location: `${foreignBase}/archive?fixture-secret-query=secret` })
    res.end()
    return
  }
  const rateTarget = mode.startsWith('artifact429') ? !url.endsWith('/metadata.json') : url.endsWith('/metadata.json')
  if (mode.includes('429') && rateTarget) {
    const attempt = rateResponses.length
    const recover = mode.includes('recover')
    const status = recover && attempt > 0 ? (mode.startsWith('artifact') ? 403 : 200) : mode.includes('mixed') && attempt === 0 ? 502 : 429
    const retryAfter = mode.includes('long') ? '9999999999999999999999999' : mode.includes('deadline') ? '60' : mode.includes('invalid') ? 'invalid' : mode.includes('date') ? new Date(Date.now() + 2000).toUTCString() : '2'
    rateResponses.push({ status, at: performance.now(), wallAt: Date.now(), retryAfter: status === 429 ? retryAfter : undefined })
    if (status !== 200) {
      res.writeHead(status, status === 429 && !mode.includes('missing') ? { 'Retry-After': retryAfter } : {})
      res.end('fixture status')
      return
    }
  }
  if (!url.endsWith('/metadata.json')) {
    if (mode === 'artifact-partial') {
      res.writeHead(200, { 'Content-Length': 1000 })
      res.write('partial archive bytes')
      setTimeout(() => res.destroy(), 5)
      return
    }
    if (mode === 'artifact-stalled-head') return
    if (mode === 'artifact-stalled-body') {
      res.writeHead(200, { 'Content-Length': 1000 })
      res.write('partial archive bytes')
      return
    }
    const archiveAttempts = requests.filter(path => path === url).length
    if (mode === 'artifact-disconnect-recover' && archiveAttempts === 1) {
      transportDrops++
      req.socket.destroy()
      return
    }
    const recoveredTransport = ['metadata-connect-recover', 'metadata-disconnect-recover', 'artifact-disconnect-recover'].includes(mode) || (mode.startsWith('metadata429') && mode.includes('recover'))
    res.writeHead(mode === 'artifact502-recover' ? (archiveAttempts === 1 ? 502 : 403) : mode === 'metadata502-recover' || recoveredTransport ? 403 : mode === 'artifact503' ? 503 : mode === 'artifact403' ? 403 : 404)
    res.end('fixture archive unavailable')
    return
  }
  if (mode === 'metadata-disconnect-recover' && transportDrops === 0) {
    transportDrops++
    req.socket.destroy()
    return
  }
  if (mode === 'metadata502-recover') {
    const status = metadataResponses.length === 0 ? 502 : 200
    metadataResponses.push(status)
    if (status === 502) {
      res.writeHead(status)
      res.end('temporary gateway failure')
      return
    }
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
  const selectedMetadata = mode.startsWith('artifact429') ? { versions: { '1.0.0': { platforms: { 'linux-x86-64': { tarball: `${metadata.versions['1.0.0'].platforms['linux-x86-64'].tarball}?fixture-secret-query=secret` } } } } } : metadata
  res.end(mode === 'malformed' ? '{' : mode === 'null' ? 'null' : mode === 'array' ? '{"versions":[]}' : mode === 'empty' ? '{"versions":{}}' : JSON.stringify(selectedMetadata))
}
const registry = createServer(handleRegistry)
const base = await listen(registry)
try {
  const scenarios = segment === 'rate-limit'
    ? ['metadata429-recover', 'metadata429-date-recover', 'metadata429-invalid-recover', 'metadata429-missing-recover', 'metadata429', 'metadata429-mixed', 'metadata429-long', 'metadata429-deadline', 'artifact429-recover', 'artifact429', 'artifact429-long', 'artifact429-redirect-recover']
    : segment === 'gateway-recovery'
    ? ['503', '403', 'metadata502-recover', 'artifact503', 'artifact403', 'artifact502-recover', 'redirect', 'disconnect', 'metadata-connect-recover', 'metadata-disconnect-recover', 'artifact-disconnect-recover']
    : segment === 'metadata' ? ['503', '403', 'malformed', 'null', 'array', 'disconnect', 'stalled-head', 'stalled-body', 'artifact503', 'artifact403', 'artifact-partial', 'redirect', 'metadata502-recover', 'artifact502-recover'] : [segment]
  for (const scenario of scenarios) {
    let timer: ReturnType<typeof setTimeout> | undefined
    let lateRegistry: Server | undefined
    let lateListening: Promise<void> | undefined
    let lateListenError: unknown
    let restoredConnection = false
    try {
      mode = scenario
      requests = []
      metadataResponses = []
      registryCredentials = 0
      foreignCredentials = 0
      foreignRequests = 0
      transportDrops = 0
      rateResponses = []
      const cwd = join(root, scenario)
      await mkdir(cwd)
      await writeFile(join(cwd, 'deps.yaml'), `dependencies:\n  ${domain}: 1.0.0\n`)
      let scenarioBase = base
      let restoreListener: (() => void) | undefined
      if (scenario === 'metadata-connect-recover') {
        lateRegistry = createServer(handleRegistry)
        scenarioBase = await listen(lateRegistry)
        const address = lateRegistry.address()
        assert.ok(address && typeof address !== 'string')
        const port = address.port
        await new Promise<void>((resolve, reject) => lateRegistry!.close(error => error ? reject(error) : resolve()))
        restoreListener = () => {
          if (restoredConnection) return
          restoredConnection = true
          lateListening = new Promise<void>((resolve, reject) => {
            lateRegistry!.once('error', reject)
            lateRegistry!.listen(port, '127.0.0.1', resolve)
          }).catch(error => { lateListenError = error })
        }
      }
      const started = performance.now()
      child = Bun.spawn([cli, 'install', '--verbose'], {
        cwd,
        env: { ...process.env, HOME: join(cwd, 'home'), XDG_DATA_HOME: join(cwd, 'data'), XDG_CACHE_HOME: join(cwd, 'cache'), PANTRY_REGISTRY_URL: scenarioBase, PANTRY_REGISTRY_TOKEN: token, PANTRY_TOKEN: token, CI: 'true' },
        stdout: 'pipe', stderr: 'pipe',
      })
      let killed = false
      const ownedChild = child
      timer = setTimeout(() => { killed = true; ownedChild.kill() }, scenario.startsWith('artifact-stalled') ? 330_000 : 45_000)
      async function collect(stream: ReadableStream<Uint8Array>): Promise<string> {
        const decoder = new TextDecoder()
        let output = ''
        for await (const chunk of stream) {
          output += decoder.decode(chunk, { stream: true })
          if (/Registry GET transport (?:ConnectionRefused|NetworkUnreachable); retry/.test(output)) restoreListener?.()
        }
        return output + decoder.decode()
      }
      const [stdout, stderr, exit] = await Promise.all([collect(child.stdout), collect(child.stderr), child.exited])
      await lateListening
      assert.equal(lateListenError, undefined, 'owned listener must recover on its own reserved port')
      clearTimeout(timer)
      child = undefined
      const output = stdout + stderr
      const elapsed = performance.now() - started
      console.log(JSON.stringify({ scenario, exit, elapsed, requests, metadataResponses, registryCredentials, foreignCredentials, foreignRequests, transportDrops, restoredConnection, killed }))
      console.log(output)
      assert.equal(killed, false, 'product must finish within its own deadline')
      assert.notEqual(exit, 0, 'an unavailable artifact must not install')
      assert.ok(requests.some(url => url.endsWith('/metadata.json')), 'normal registry setting must reach the owned fixture')
      assert.ok(registryCredentials > 0, 'configured registry must receive its scoped token')
      assert.equal(foreignCredentials, 0, 'credentials must not cross origin')
      if (scenario.startsWith('artifact')) {
        const archives = requests.filter(url => url.split('?')[0] === `/binaries/${domain}/1.0.0/archive.tar.gz`)
        const expected = scenario === 'artifact503' || scenario === 'artifact429' ? 3 : ['artifact502-recover', 'artifact-disconnect-recover', 'artifact429-recover'].includes(scenario) ? 2 : 1
        assert.equal(archives.length, expected, 'only bounded retries of the same primary archive transport are allowed')
      }
      if (scenario.includes('429')) {
        assert.match(output, /HTTP 429 from http:\/\/127\.0\.0\.1:/, 'diagnostics identify the responding origin')
        const statusDiagnostics = output.split('\n').filter(line => line.includes('Registry GET HTTP')).join('\n')
        assert.doesNotMatch(statusDiagnostics, /fixture-secret-query/, 'status diagnostics must not expose signed queries')
        if (scenario.includes('redirect')) {
          assert.equal(foreignRequests, 2)
          assert.ok(output.includes(`HTTP 429 from ${foreignBase}`), 'redirected throttling identifies the actual responding origin')
        }
        if (scenario.includes('long')) {
          assert.equal(rateResponses.length, 1, 'excessive server delay must stop without an early retry')
          assert.ok(elapsed < 10_000)
        }
        else if (scenario.includes('deadline')) {
          assert.equal(rateResponses.length, 1, 'overall metadata deadline must cancel Retry-After wait')
          assert.ok(elapsed >= 29_000 && elapsed < 40_000, 'original 30-second deadline includes backoff')
          assert.match(output, /timeout|timed out/i)
        }
        else {
          const expected = scenario.includes('recover') ? (scenario.startsWith('artifact') ? 2 : undefined) : 3
          if (expected) assert.equal(rateResponses.length, expected, 'gateway and rate-limit statuses share one two-retry budget')
          assert.ok(rateResponses.length >= 2)
          const minimumWait = scenario.includes('invalid') || scenario.includes('missing') || scenario.includes('mixed') || scenario.includes('date') ? 900 : 1900
          assert.ok(rateResponses[1]!.at - rateResponses[0]!.at >= minimumWait, 'server delay must not be shortened')
          if (scenario.includes('date')) {
            const notBefore = Date.parse(rateResponses[0]!.retryAfter!)
            assert.ok(rateResponses[1]!.wallAt >= notBefore, 'HTTP-date wait must reach the server timestamp')
          }
          if (scenario.includes('recover')) assert.match(output, /HTTP 403/, 'recovered rate limit must reach the actual terminal artifact')
        }
      }
      else if (scenario === 'metadata-connect-recover' || scenario === 'metadata-disconnect-recover' || scenario === 'artifact-disconnect-recover') {
        assert.match(output, /HTTP 403/, 'connection recovery must reach the actual terminal artifact response')
        assert.match(output, /Registry GET transport .*retry/, 'the native transport must exercise its own bounded retry')
        if (scenario === 'metadata-connect-recover') assert.equal(restoredConnection, true, 'the listener starts only after the actual refused connection diagnostic')
        else assert.equal(transportDrops, 1, 'exactly one owned TCP connection is interrupted')
        if (scenario !== 'artifact-disconnect-recover') assert.equal(requests.filter(url => !url.endsWith('/metadata.json')).length, 1)
      }
      else if (scenario === 'metadata502-recover') {
        // Resolution and installation may each read metadata. Observe recovery
        // of the failed GET separately from subsequent successful lookups.
        assert.deepEqual(metadataResponses.slice(0, 2), [502, 200])
        assert.ok(metadataResponses.slice(2).every(status => status === 200))
        assert.equal(requests.filter(url => !url.endsWith('/metadata.json')).length, 1)
        assert.match(output, /HTTP 403/, 'recovered metadata must reach the terminal artifact response')
      }
      else if (scenario === 'artifact502-recover') {
        assert.match(output, /HTTP 403/, 'recovery must preserve the final authentication failure')
      }
      else if (scenario === 'redirect') assert.ok(foreignRequests > 0)
      else {
        assert.doesNotMatch(output, /not found in (?:pantry|registry)/i, 'failures cannot become package absence')
        if (scenario.includes('503')) assert.match(output, /HTTP 503/)
        else if (scenario.includes('403')) assert.match(output, /HTTP 403/)
        else if (scenario.includes('stalled')) assert.match(output, /timeout|timed out/i)
        else if (['malformed', 'null', 'array'].includes(scenario)) assert.match(output, /invalid.?registry.?metadata/i)
        if (!scenario.startsWith('artifact')) assert.equal(requests.filter(url => !url.endsWith('/metadata.json')).length, 0, 'metadata errors must stop fallback and archive downloads')
        if (scenario === '503' || scenario === 'disconnect') assert.equal(requests.length, 3, 'metadata retries have a fixed request limit')
        if (scenario === '403') assert.equal(requests.length, 1, 'authentication failures never retry')
      }
      observations.push({ scenario, exit, elapsed, requests, metadataResponses, rateResponses, registryCredentials, foreignCredentials, foreignRequests, transportDrops, restoredConnection, killed })
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
      if (lateRegistry) {
        await lateListening
        lateRegistry.closeAllConnections()
        if (lateRegistry.listening) await new Promise<void>(resolve => lateRegistry!.close(() => resolve()))
      }
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
