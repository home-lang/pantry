import { afterAll, beforeAll, expect, it } from 'bun:test'
import { createServer, type Server } from 'node:http'
import { isInstallable } from '../src/installer'

const previousRegistry = process.env.PANTRY_REGISTRY_URL
const previousToken = process.env.GITHUB_TOKEN
const previousGhToken = process.env.GH_TOKEN
const platform = { os: 'linux', arch: 'x86_64' } as const
const metadata = { versions: { '1.0.0': { platforms: { 'linux-x86-64': { tarball: 'binaries/example/1.tar.gz' } } } } }
let registry: Server
let foreign: Server
let base: string
let foreignBase: string
let mode = ''
let requests = 0
let foreignRequests = 0
let credentials = 0
let recovered = false

async function listen(server: Server): Promise<string> {
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', resolve)
  })
  const address = server.address()
  if (!address || typeof address === 'string') throw new Error('Missing fixture port')
  return `http://127.0.0.1:${address.port}`
}

beforeAll(async () => {
  foreign = createServer((req, res) => {
    foreignRequests += 1
    if (req.headers.authorization) credentials += 1
    res.end(JSON.stringify(metadata))
  })
  foreignBase = await listen(foreign)
  registry = createServer((req, res) => {
    requests += 1
    if (req.headers.authorization) credentials += 1
    if (mode === 'redirect') {
      res.writeHead(302, { Location: `${foreignBase}/api.github.com/metadata.json` })
      res.end()
      return
    }
    if (mode === '503' || mode === '403' || mode === '404' || (mode === 'recovery' && !recovered)) {
      res.writeHead(mode === 'recovery' ? 503 : Number(mode))
      res.end('fixture status')
      return
    }
    if (mode === 'disconnect') return req.socket.destroy()
    if (mode === 'partial') {
      res.writeHead(200, { 'Content-Length': 1000 })
      res.write('{"versions":')
      setTimeout(() => res.destroy(), 5)
      return
    }
    res.end(mode === 'malformed' ? '{' : mode === 'null' ? 'null' : mode === 'array' ? '{"versions":[]}' : mode === 'empty' ? '{"versions":{}}' : mode === 'platforms' ? '{"versions":{"1.0.0":{"platforms":null}}}' : JSON.stringify(metadata))
  })
  base = await listen(registry)
  process.env.PANTRY_REGISTRY_URL = base
  process.env.GITHUB_TOKEN = 'disposable-fixture-github-token'
  delete process.env.GH_TOKEN
})

afterAll(async () => {
  for (const server of [registry, foreign]) {
    server.closeAllConnections()
    await new Promise<void>(resolve => server.close(() => resolve()))
  }
  for (const [key, value] of Object.entries({ PANTRY_REGISTRY_URL: previousRegistry, GITHUB_TOKEN: previousToken, GH_TOKEN: previousGhToken })) {
    if (value === undefined) delete process.env[key]
    else process.env[key] = value
  }
})

for (const failure of ['503', '403', 'malformed', 'null', 'array', 'platforms', 'disconnect', 'partial']) {
  it(`preserves ${failure} as a lookup failure rather than package absence`, async () => {
    mode = failure
    const before = requests
    await expect(isInstallable('availability.test', platform)).rejects.toThrow()
    expect(requests).toBeGreaterThan(before)
  }, 40_000)
}

it('only confirmed absence and valid empty metadata report unavailable', async () => {
  mode = '404'
  expect(await isInstallable('availability.test', platform)).toBe(false)
  mode = 'empty'
  expect(await isInstallable('availability.test', platform)).toBe(false)
})

it('does not cache a transient registry failure as package absence', async () => {
  mode = 'recovery'
  await expect(isInstallable('availability.test', platform)).rejects.toThrow()
  recovered = true
  expect(await isInstallable('availability.test', platform)).toBe(true)
}, 40_000)

it('withholds the GitHub token from a registry path containing api.github.com', async () => {
  mode = 'valid'
  credentials = 0
  expect(await isInstallable('api.github.com', platform)).toBe(true)
  expect(credentials).toBe(0)
})

it('rechecks credential scope on a real cross-origin redirect', async () => {
  mode = 'redirect'
  credentials = 0
  foreignRequests = 0
  expect(await isInstallable('api.github.com', platform)).toBe(true)
  expect(foreignRequests).toBe(1)
  expect(credentials).toBe(0)
})
