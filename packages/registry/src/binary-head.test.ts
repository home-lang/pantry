import type { BinaryStorage } from './server'
import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { createLocalRegistry } from './registry'
import { createServer } from './server'
import { getAvailablePort } from './test-utils'
import { S3RequestError } from './storage/aws-client'

/** Binary storage stub so /binaries/... has something real to serve. */
class MockBinaryStorage implements BinaryStorage {
  private files = new Map<string, Buffer>()

  put(key: string, data: Buffer | string): void {
    this.files.set(key, typeof data === 'string' ? Buffer.from(data) : data)
  }

  async getObject(key: string): Promise<Buffer> {
    const data = this.files.get(key)
    if (!data) throw new S3RequestError('GET', 404, 'NoSuchKey')
    return data
  }
}

const PLUS_VERSION = '0.17.0-dev.1859+dcceb318e'
const QUARANTINED_UNDERSCORE = '0.17.0-dev.1282_c0f9b51d8'
const QUARANTINED_PLUS = '0.17.0-dev.1282+c0f9b51d8'

describe('binary proxy HEAD', () => {
  let baseUrl: string
  let server: ReturnType<typeof createServer>

  beforeEach(async () => {
    const port = await getAvailablePort()
    baseUrl = `http://localhost:${port}`
    const binaries = new MockBinaryStorage()
    binaries.put('binaries/curl.se/metadata.json', JSON.stringify({ name: 'curl.se', versions: {} }))
    // A Zig-style dev build: the object key holds a literal '+'.
    const tarball = `binaries/ziglang.org/${PLUS_VERSION}/linux-arm64/ziglang.org-${PLUS_VERSION}.tar.gz`
    binaries.put('binaries/ziglang.org/metadata.json', JSON.stringify({
      name: 'ziglang.org',
      versions: {
        [PLUS_VERSION]: {
          platforms: { 'linux-arm64': { tarball, sha256: 'a'.repeat(64), size: 4 } },
        },
      },
    }))
    binaries.put(tarball, 'zig!')
    binaries.put(`${tarball}.sha256`, 'a'.repeat(64))
    // Indexed under `_`, quarantined under `+` — the same build either way.
    const quarantined = `binaries/quarantined.test/${QUARANTINED_UNDERSCORE}/linux-arm64/quarantined.test-${QUARANTINED_UNDERSCORE}.tar.gz`
    binaries.put('binaries/quarantined.test/metadata.json', JSON.stringify({
      name: 'quarantined.test',
      versions: {
        [QUARANTINED_UNDERSCORE]: {
          platforms: { 'linux-arm64': { tarball: quarantined, sha256: 'a'.repeat(64), size: 4 } },
        },
      },
      malwareQuarantines: [{
        version: QUARANTINED_PLUS,
        platforms: ['linux-arm64'],
        artifactSha256: 'b'.repeat(64),
        engine: 'clamav',
        scannedAt: '2026-08-24T00:00:00.000Z',
        quarantinedAt: '2026-08-24T00:00:00.000Z',
      }],
    }))
    binaries.put(quarantined, 'evil')
    server = createServer(createLocalRegistry(baseUrl), port, undefined, undefined, binaries)
    server.start()
  })

  afterEach(() => {
    server.stop()
  })

  it('answers HEAD with the GET headers and no body', async () => {
    const head = await fetch(`${baseUrl}/binaries/curl.se/metadata.json`, { method: 'HEAD' })
    const get = await fetch(`${baseUrl}/binaries/curl.se/metadata.json`)

    expect(head.status).toBe(200)
    expect(head.headers.get('content-type')).toBe(get.headers.get('content-type'))
    expect(head.headers.get('content-length')).toBe(get.headers.get('content-length'))
    expect(head.headers.get('cache-control')).toBe(get.headers.get('cache-control'))
    expect(await head.text()).toBe('')
  })

  it('still reports a missing object on HEAD', async () => {
    const res = await fetch(`${baseUrl}/binaries/curl.se/does-not-exist/metadata.json`, { method: 'HEAD' })
    expect(res.status).toBe(404)
  })

  it('rejects methods that are neither GET nor HEAD', async () => {
    const res = await fetch(`${baseUrl}/binaries/curl.se/metadata.json`, { method: 'DELETE' })
    expect(res.status).toBe(405)
  })

  it('advertises HEAD in the CORS method list', async () => {
    const res = await fetch(`${baseUrl}/binaries/curl.se/metadata.json`)
    expect(res.headers.get('access-control-allow-methods')).toContain('HEAD')
  })

  // A correct HTTP client escapes '+' in a path to '%2B'. Serving the encoded
  // pathname straight to object storage looked for a key spelled '%2B' and
  // 404'd, so `pantry install ziglang.org@0.17.0-dev` failed for every client
  // that encoded properly while a client sending a raw '+' worked.
  it('resolves a percent-encoded + to the same object as a literal +', async () => {
    const key = (v: string): string => `/binaries/ziglang.org/${v}/linux-arm64/ziglang.org-${v}.tar.gz`

    const literal = await fetch(`${baseUrl}${key(PLUS_VERSION)}`)
    const encoded = await fetch(`${baseUrl}${key(PLUS_VERSION.replace('+', '%2B'))}`)

    expect(literal.status).toBe(200)
    expect(encoded.status).toBe(200)
    expect(await encoded.text()).toBe(await literal.text())
  })

  it('resolves a percent-encoded + for the checksum sidecar too', async () => {
    const encodedVersion = PLUS_VERSION.replace('+', '%2B')
    const res = await fetch(
      `${baseUrl}/binaries/ziglang.org/${encodedVersion}/linux-arm64/ziglang.org-${encodedVersion}.tar.gz.sha256`,
    )
    expect(res.status).toBe(200)
    expect(await res.text()).toContain('a'.repeat(64))
  })

  // A build indexed under one build-metadata spelling and quarantined under the
  // other was served anyway: the gate compared the request's spelling to the
  // manifest's verbatim, so the quarantine simply did not match.
  it('keeps a build quarantined under + blocked when it is requested as _', async () => {
    const res = await fetch(
      `${baseUrl}/binaries/quarantined.test/${QUARANTINED_UNDERSCORE}/linux-arm64/quarantined.test-${QUARANTINED_UNDERSCORE}.tar.gz`,
    )
    expect(res.status).not.toBe(200)
  })

  it('rejects a malformed escape rather than throwing', async () => {
    const res = await fetch(`${baseUrl}/binaries/curl.se/%zz/metadata.json`)
    expect(res.status).toBe(400)
  })
})
