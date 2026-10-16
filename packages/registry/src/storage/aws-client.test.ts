import { afterEach, describe, expect, it, mock } from 'bun:test'
import { S3Client } from './aws-client'

const originalFetch = globalThis.fetch
afterEach(() => { globalThis.fetch = originalFetch })

function installFetch(implementation: (input: Parameters<typeof fetch>[0], init?: RequestInit) => Promise<Response>) {
  const send = Object.assign(mock(implementation), { preconnect: originalFetch.preconnect })
  globalThis.fetch = send
  return send
}

function client() {
  return new S3Client('fsn1', {
    endpoint: 'storage.example.test',
    forcePathStyle: true,
    credentials: { accessKeyId: 'test-key', secretAccessKey: 'test-secret' },
  })
}

function failing(status: number) {
  return new Response('storage unavailable', { status, headers: { 'retry-after': '0' } })
}

describe('idempotent S3 writes', () => {
  it('recovers a Zig tarball upload from transient storage failures without changing its bytes or key', async () => {
    const requests: { url: string, init: RequestInit }[] = []
    installFetch(async (input, init) => {
      requests.push({ url: String(input), init: init! })
      return requests.length < 3 ? failing(503) : new Response(null)
    })
    const tarball = Buffer.from([0x1f, 0x8b, 0, 255])
    await client().putObject({ bucket: 'registry', key: 'zig/craft/0.0.194.tar.gz', body: tarball, contentType: 'application/gzip' })
    expect(requests).toHaveLength(3)
    for (const request of requests) {
      expect(request.url).toBe('https://storage.example.test/registry/zig/craft/0.0.194.tar.gz')
      expect(request.init.method).toBe('PUT')
      expect(Buffer.from(request.init.body as Uint8Array)).toEqual(tarball)
      const headers = request.init.headers as Record<string, string>
      expect(headers['content-type']).toBe('application/gzip')
      expect(headers.Authorization).toContain('AWS4-HMAC-SHA256')
      expect(request.init.signal).toBeInstanceOf(AbortSignal)
    }
  })

  it.each([408, 429, 500, 502, 503, 504])('retries HTTP %s', async (status) => {
    let calls = 0
    installFetch(async () => ++calls === 1 ? failing(status) : new Response(null))
    await client().putObject({ bucket: 'registry', key: 'metadata/index.json', body: '{}' })
    expect(calls).toBe(2)
  })

  it.each([400, 401, 403, 404, 409, 413])('does not retry permanent HTTP %s', async (status) => {
    const send = installFetch(async () => failing(status))
    await expect(client().putObject({ bucket: 'registry', key: 'artifact', body: 'bytes' }))
      .rejects.toThrow(`S3 PUT failed: ${status} storage unavailable`)
    expect(send).toHaveBeenCalledTimes(1)
  })

  it('stops after four attempts and surfaces the final storage error', async () => {
    const send = installFetch(async () => failing(503))
    await expect(client().putObject({ bucket: 'registry', key: 'artifact', body: 'bytes' }))
      .rejects.toThrow('S3 PUT failed: 503 storage unavailable')
    expect(send).toHaveBeenCalledTimes(4)
  })

  it('recovers a transport failure', async () => {
    let calls = 0
    installFetch(async () => {
      if (++calls === 1) throw new TypeError('fetch failed')
      return new Response(null)
    })
    await client().putObject({ bucket: 'registry', key: 'artifact', body: 'bytes' })
    expect(calls).toBe(2)
  })

  it('does not retry programming errors', async () => {
    const send = installFetch(async () => { throw new Error('invalid request') })
    await expect(client().putObject({ bucket: 'registry', key: 'artifact', body: 'bytes' }))
      .rejects.toThrow('invalid request')
    expect(send).toHaveBeenCalledTimes(1)
  })

  it('retries server-side copy at the same destination with its signed source', async () => {
    const requests: RequestInit[] = []
    installFetch(async (input, init) => {
      expect(String(input)).toBe('https://storage.example.test/registry/published/artifact')
      requests.push(init!)
      return requests.length === 1 ? failing(504) : new Response(null)
    })
    await client().copyObject('registry', 'staged/source artifact', 'published/artifact')
    expect(requests).toHaveLength(2)
    for (const request of requests) {
      expect((request.headers as Record<string, string>)['x-amz-copy-source']).toBe('/registry/staged/source%20artifact')
      expect(request.body).toBeUndefined()
    }
  })
})
