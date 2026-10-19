import { expect, test } from 'bun:test'
import { createServer } from 'node:http'
import { nativeArtifactCacheIdentity } from './native-cache'

const platform = { os: 'linux', arch: 'x64', binaryName: 'pantry', assetName: '' } as const
const metadata = { versions: { '1.0.0': { platforms: { 'linux-x86-64': {
  tarball: 'binaries/native-cache.test/1.0.0.tar.gz', sha256: 'a'.repeat(64),
} } } } }

async function withRegistry(
  responses: Array<{ status: number, body: unknown }>,
  check: (requests: () => number) => Promise<void>,
): Promise<void> {
  let requests = 0
  const previous = process.env.PANTRY_REGISTRY_URL
  const server = createServer((request, response) => {
    expect(request.method).toBe('GET')
    expect(request.url).toBe('/binaries/native-cache.test/metadata.json')
    expect(request.headers.authorization).toBeUndefined()
    const next = responses[Math.min(requests++, responses.length - 1)]!
    response.writeHead(next.status, { 'Content-Type': 'application/json' })
    response.end(typeof next.body === 'string' ? next.body : JSON.stringify(next.body))
  })
  try {
    await new Promise<void>((resolve, reject) => {
      server.once('error', reject)
      server.listen(0, '127.0.0.1', resolve)
    })
    const address = server.address()
    if (!address || typeof address === 'string') throw new Error('Fixture registry has no TCP port')
    process.env.PANTRY_REGISTRY_URL = `http://127.0.0.1:${address.port}`
    await check(() => requests)
  }
  finally {
    if (previous === undefined) delete process.env.PANTRY_REGISTRY_URL
    else process.env.PANTRY_REGISTRY_URL = previous
    server.closeAllConnections()
    await new Promise<void>(resolve => server.close(() => resolve()))
  }
}

const identity = () => nativeArtifactCacheIdentity(['native-cache.test@1.0.0'], platform, undefined, async () => [])

test('the Action shares SDK metadata retries and validates the recovered artifact identity', async () => {
  await withRegistry([{ status: 502, body: {} }, { status: 503, body: {} }, { status: 200, body: metadata }], async (requests) => {
    expect(await identity()).toMatch(/^[a-f0-9]{64}$/)
    expect(requests()).toBe(3)
  })
})

test('unavailable registry metadata exhausts a bounded three GET attempts', async () => {
  await withRegistry([{ status: 502, body: {} }], async (requests) => {
    await expect(identity()).rejects.toThrow('after 3 attempts')
    expect(requests()).toBe(3)
  })
})

for (const status of [401, 403, 404]) {
  test(`a permanent HTTP ${status} cannot authorize cache reuse or repeated requests`, async () => {
    await withRegistry([{ status, body: {} }], async (requests) => {
      await expect(identity()).rejects.toThrow(String(status))
      expect(requests()).toBe(1)
    })
  })
}

for (const body of ['{', { versions: null }]) {
  test(`malformed registry metadata ${JSON.stringify(body)} fails without another request`, async () => {
    await withRegistry([{ status: 200, body }], async (requests) => {
      await expect(identity()).rejects.toThrow()
      expect(requests()).toBe(1)
    })
  })
}
