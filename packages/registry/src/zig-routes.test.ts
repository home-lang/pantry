import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { createHash } from 'node:crypto'
import { InMemoryAnalytics } from './analytics'
import { createLocalRegistry } from './registry'
import { createServer } from './server'
import { getAvailablePort } from './test-utils'
import { InMemoryZigStorage } from './zig'
import { zigPackageFixture } from './zig-package-fixture'

describe('Zig registry routes', () => {
  let port: number
  let baseUrl: string
  let server: ReturnType<typeof createServer>
  let token: string

  beforeEach(async () => {
    token = `zig-test-${crypto.randomUUID()}`
    process.env.PANTRY_REGISTRY_TOKEN = token
    port = await getAvailablePort()
    baseUrl = `http://localhost:${port}`
    server = createServer(
      createLocalRegistry(baseUrl),
      port,
      new InMemoryAnalytics(),
      new InMemoryZigStorage(),
    )
    server.start()
  })

  afterEach(() => {
    server.stop()
    delete process.env.PANTRY_REGISTRY_TOKEN
  })

  async function publish(version = '1.0.0', authorization = token): Promise<Response> {
    const form = new FormData()
    form.append('tarball', new File([await zigPackageFixture(version)], `graphics_package_consumer-${version}.tar.gz`))
    form.append('manifest', `.name = .graphics_package_consumer,\n.version = "${version}",`)
    form.append('description', 'Example Zig package')
    return fetch(`${baseUrl}/zig/publish`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authorization}` },
      body: form,
    })
  }

  it('fails closed when publishing without authorization', async () => {
    const form = new FormData()
    form.append('tarball', new File([Buffer.from('data')], 'example-1.0.0.tar.gz'))
    const response = await fetch(`${baseUrl}/zig/publish`, { method: 'POST', body: form })

    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({ error: 'Authorization required' })
  })

  it('uses the current token after runtime rotation', async () => {
    const rotatedToken = `rotated-${crypto.randomUUID()}`
    process.env.PANTRY_REGISTRY_TOKEN = rotatedToken

    expect((await publish('1.0.0', token)).status).toBe(401)
    expect((await publish('1.0.0', rotatedToken)).status).toBe(201)
  })

  it('publishes canonical metadata and content-addressed evidence', async () => {
    const response = await publish()
    const body = await response.json() as any

    expect(response.status).toBe(201)
    expect(body.message).toBe('Published graphics-package-consumer@1.0.0')
    expect(body.hash).toBe('graphics_package_consumer-1.0.0-eF_X1KAAAAB7sPq4wQFLI6Urz5wPpAnB_liZ_wFl9Csi')
    expect(body.tarballUrl).toBe(`${baseUrl}/zig/packages/graphics-package-consumer/1.0.0/tarball`)
    expect(body.fetchCommand).toContain('zig fetch --save')
    expect(body.artifactSha256).toBe(createHash('sha256').update(await zigPackageFixture()).digest('hex'))
    expect(body.dependency).toContain('.@"graphics-package-consumer"')
  })

  it('retrieves latest and exact version metadata and lists versions', async () => {
    expect((await publish('1.0.0')).status).toBe(201)
    expect((await publish('2.0.0')).status).toBe(201)

    const latest = await (await fetch(`${baseUrl}/zig/packages/graphics-package-consumer`)).json() as any
    const exact = await (await fetch(`${baseUrl}/zig/packages/graphics-package-consumer/1.0.0`)).json() as any
    const versions = await (await fetch(`${baseUrl}/zig/packages/graphics-package-consumer/versions`)).json() as any

    expect(latest.version).toBe('2.0.0')
    expect(exact.version).toBe('1.0.0')
    expect(versions.versions).toEqual(['2.0.0', '1.0.0'])
  })

  it('downloads the exact published tarball and resolves its hash', async () => {
    const published = await (await publish()).json() as any
    const tarball = await fetch(`${baseUrl}/zig/packages/graphics-package-consumer/1.0.0/tarball`)
    const hashLookup = await fetch(`${baseUrl}/zig/hash/${published.hash}`)

    expect(tarball.status).toBe(200)
    expect(tarball.headers.get('content-type')).toBe('application/gzip')
    expect(Buffer.from(await tarball.arrayBuffer()).toString('base64')).toBe((await zigPackageFixture()).toString('base64'))
    expect((await hashLookup.json() as any).name).toBe('graphics-package-consumer')
  })

  it('searches published packages with a bounded JSON response', async () => {
    expect((await publish()).status).toBe(201)
    const response = await fetch(`${baseUrl}/zig/search?q=graphics&limit=1`)
    const body = await response.json() as any

    expect(response.status).toBe(200)
    expect(body.results).toHaveLength(1)
    expect(body.results[0].name).toBe('graphics-package-consumer')
  })

  it('rejects a malformed clean archive without publishing metadata', async () => {
    const form = new FormData()
    form.append('tarball', new File([Buffer.from('not an archive')], 'invalid-1.0.0.tar.gz'))
    form.append('manifest', '.{ .name = .invalid, .version = "1.0.0" }')
    const response = await fetch(`${baseUrl}/zig/publish`, {
      method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form,
    })
    expect(response.status).toBe(422)
    expect((await fetch(`${baseUrl}/zig/packages/invalid/1.0.0`)).status).toBe(404)
  })

  it('fails closed when the declared native compiler is unavailable', async () => {
    const previous = process.env.PANTRY_ZIG_BIN
    process.env.PANTRY_ZIG_BIN = '/missing-registry-zig-executable'
    try {
      expect((await publish()).status).toBe(503)
      expect((await fetch(`${baseUrl}/zig/packages/graphics-package-consumer/1.0.0`)).status).toBe(404)
    }
    finally {
      if (previous === undefined) delete process.env.PANTRY_ZIG_BIN
      else process.env.PANTRY_ZIG_BIN = previous
    }
  })

  it('rejects duplicate immutable versions', async () => {
    expect((await publish()).status).toBe(201)
    const duplicate = await publish()

    expect(duplicate.status).toBe(409)
    expect(await duplicate.json()).toEqual({ error: 'Version already exists' })
  })

  it('requires the current token to delete a package', async () => {
    expect((await publish()).status).toBe(201)
    expect((await fetch(`${baseUrl}/zig/packages/graphics-package-consumer`, { method: 'DELETE' })).status).toBe(401)

    const deleted = await fetch(`${baseUrl}/zig/packages/graphics-package-consumer`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(deleted.status).toBe(200)
    expect((await fetch(`${baseUrl}/zig/packages/graphics-package-consumer`)).status).toBe(404)
  })
})
