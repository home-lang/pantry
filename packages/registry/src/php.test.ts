import { afterEach, describe, expect, it, beforeEach } from 'bun:test'
import {
  computePhpChecksum,
  generateComposerRequire,
  InMemoryPhpStorage,
  parseComposerJson,
  type PhpPackageMetadata,
} from './php'

// ============================================================================
// Unit tests: helper functions
// ============================================================================

describe('PHP helpers', () => {
  describe('computePhpChecksum', () => {
    it('returns a 64-char hex SHA256 digest', () => {
      const data = Buffer.from('hello world')
      const hash = computePhpChecksum(data)
      expect(hash).toHaveLength(64)
      expect(/^[a-f0-9]{64}$/.test(hash)).toBe(true)
    })

    it('is deterministic', () => {
      const data = Buffer.from('test data')
      expect(computePhpChecksum(data)).toBe(computePhpChecksum(data))
    })

    it('accepts ArrayBuffer', () => {
      const buf = new ArrayBuffer(4)
      new Uint8Array(buf).set([1, 2, 3, 4])
      const hash = computePhpChecksum(buf)
      expect(hash).toHaveLength(64)
    })
  })

  describe('parseComposerJson', () => {
    it('parses a minimal composer.json', () => {
      const manifest = parseComposerJson(JSON.stringify({
        name: 'vendor/package',
        description: 'A test package',
      }))
      expect(manifest.name).toBe('vendor/package')
      expect(manifest.description).toBe('A test package')
    })

    it('parses all standard fields', () => {
      const manifest = parseComposerJson(JSON.stringify({
        name: 'laravel/framework',
        version: '11.0.0',
        description: 'The Laravel Framework.',
        license: 'MIT',
        type: 'library',
        keywords: ['framework', 'laravel'],
        authors: [{ name: 'Taylor Otwell', email: 'taylor@laravel.com' }],
        require: { php: '>=8.2', 'illuminate/support': '^11.0' },
        'require-dev': { phpunit: '^10.0' },
        homepage: 'https://laravel.com',
        'minimum-stability': 'stable',
      }))
      expect(manifest.name).toBe('laravel/framework')
      expect(manifest.version).toBe('11.0.0')
      expect(manifest.license).toBe('MIT')
      expect(manifest.type).toBe('library')
      expect(manifest.keywords).toEqual(['framework', 'laravel'])
      expect(manifest.authors).toHaveLength(1)
      expect(manifest.authors![0].name).toBe('Taylor Otwell')
      expect(manifest.require?.php).toBe('>=8.2')
      expect(manifest['require-dev']?.phpunit).toBe('^10.0')
      expect(manifest.homepage).toBe('https://laravel.com')
      expect(manifest['minimum-stability']).toBe('stable')
    })

    it('handles array license', () => {
      const manifest = parseComposerJson(JSON.stringify({
        name: 'test/pkg',
        license: ['MIT', 'Apache-2.0'],
      }))
      expect(manifest.license).toEqual(['MIT', 'Apache-2.0'])
    })

    it('throws on invalid JSON', () => {
      expect(() => parseComposerJson('not valid json')).toThrow()
    })
  })

  describe('generateComposerRequire', () => {
    it('generates standard composer require command', () => {
      const cmd = generateComposerRequire('laravel/framework', '11.0.0')
      expect(cmd).toBe('composer require laravel/framework:^11.0.0')
    })

    it('works with simple versions', () => {
      const cmd = generateComposerRequire('monolog/monolog', '3.5.0')
      expect(cmd).toBe('composer require monolog/monolog:^3.5.0')
    })
  })
})

// ============================================================================
// Unit tests: InMemoryPhpStorage
// ============================================================================

describe('InMemoryPhpStorage', () => {
  let storage: InMemoryPhpStorage

  beforeEach(() => {
    storage = new InMemoryPhpStorage()
  })

  const makeMeta = (name: string, version: string): PhpPackageMetadata => ({
    name,
    version,
    description: `${name} package`,
    tarballUrl: `http://localhost/php/packages/${name}/${version}/tarball`,
    checksum: computePhpChecksum(Buffer.from(`${name}@${version}`)),
    publishedAt: new Date().toISOString(),
  })

  it('starts with count 0', async () => {
    expect(await storage.count()).toBe(0)
  })

  it('publishes and retrieves a package', async () => {
    const meta = makeMeta('vendor/package', '1.0.0')
    const tarball = new ArrayBuffer(8)
    await storage.publish(meta, tarball)

    const pkg = await storage.getPackage('vendor/package')
    expect(pkg).not.toBeNull()
    expect(pkg!.name).toBe('vendor/package')
    expect(pkg!.version).toBe('1.0.0')
    expect(await storage.count()).toBe(1)
  })

  it('retrieves a specific version', async () => {
    await storage.publish(makeMeta('vendor/pkg', '1.0.0'), new ArrayBuffer(4))
    await storage.publish(makeMeta('vendor/pkg', '2.0.0'), new ArrayBuffer(4))

    const v1 = await storage.getPackage('vendor/pkg', '1.0.0')
    expect(v1!.version).toBe('1.0.0')

    const v2 = await storage.getPackage('vendor/pkg', '2.0.0')
    expect(v2!.version).toBe('2.0.0')

    // Default returns latest
    const latest = await storage.getPackage('vendor/pkg')
    expect(latest!.version).toBe('2.0.0')
  })

  it('lists versions in descending order', async () => {
    await storage.publish(makeMeta('test/lib', '1.0.0'), new ArrayBuffer(4))
    await storage.publish(makeMeta('test/lib', '1.1.0'), new ArrayBuffer(4))
    await storage.publish(makeMeta('test/lib', '2.0.0'), new ArrayBuffer(4))

    const versions = await storage.listVersions('test/lib')
    expect(versions).toEqual(['2.0.0', '1.1.0', '1.0.0'])
  })

  it('returns empty array for nonexistent package versions', async () => {
    const versions = await storage.listVersions('nonexistent/pkg')
    expect(versions).toEqual([])
  })

  it('checks existence correctly', async () => {
    await storage.publish(makeMeta('a/b', '1.0.0'), new ArrayBuffer(4))
    expect(await storage.exists('a/b', '1.0.0')).toBe(true)
    expect(await storage.exists('a/b', '2.0.0')).toBe(false)
    expect(await storage.exists('x/y', '1.0.0')).toBe(false)
  })

  it('downloads tarballs', async () => {
    const tarball = new ArrayBuffer(16)
    new Uint8Array(tarball).set([1, 2, 3, 4])
    await storage.publish(makeMeta('dl/test', '1.0.0'), tarball)

    const downloaded = await storage.downloadTarball('dl/test', '1.0.0')
    expect(downloaded).not.toBeNull()
    expect(new Uint8Array(downloaded!)[0]).toBe(1)

    const missing = await storage.downloadTarball('dl/test', '9.9.9')
    expect(missing).toBeNull()
  })

  it('searches by name', async () => {
    await storage.publish(makeMeta('laravel/framework', '11.0.0'), new ArrayBuffer(4))
    await storage.publish(makeMeta('symfony/console', '7.0.0'), new ArrayBuffer(4))
    await storage.publish(makeMeta('monolog/monolog', '3.0.0'), new ArrayBuffer(4))

    const results = await storage.search('laravel')
    expect(results).toHaveLength(1)
    expect(results[0].name).toBe('laravel/framework')
  })

  it('searches by description', async () => {
    const meta = makeMeta('custom/pkg', '1.0.0')
    meta.description = 'A logging library'
    await storage.publish(meta, new ArrayBuffer(4))

    const results = await storage.search('logging')
    expect(results).toHaveLength(1)
    expect(results[0].name).toBe('custom/pkg')
  })

  it('searches with empty query returns all', async () => {
    await storage.publish(makeMeta('a/b', '1.0.0'), new ArrayBuffer(4))
    await storage.publish(makeMeta('c/d', '1.0.0'), new ArrayBuffer(4))

    const results = await storage.search('')
    expect(results).toHaveLength(2)
  })

  it('respects search limit', async () => {
    for (let i = 0; i < 5; i++) {
      await storage.publish(makeMeta(`vendor/pkg${i}`, '1.0.0'), new ArrayBuffer(4))
    }
    const results = await storage.search('', 3)
    expect(results).toHaveLength(3)
  })

  it('deletes a package', async () => {
    await storage.publish(makeMeta('del/me', '1.0.0'), new ArrayBuffer(4))
    await storage.publish(makeMeta('del/me', '2.0.0'), new ArrayBuffer(4))
    expect(await storage.count()).toBe(1)

    await storage.deletePackage('del/me')
    expect(await storage.count()).toBe(0)
    expect(await storage.getPackage('del/me')).toBeNull()
    expect(await storage.downloadTarball('del/me', '1.0.0')).toBeNull()
  })

  it('returns null for nonexistent package', async () => {
    expect(await storage.getPackage('no/such')).toBeNull()
  })
})

// ============================================================================
// Integration tests: PHP routes via HTTP
// ============================================================================

describe('PHP routes (HTTP)', () => {
  let port: number
  let baseUrl: string
  let server: ReturnType<typeof import('./server').createServer>

  const TEST_TOKEN = process.env.PANTRY_REGISTRY_TOKEN || process.env.PANTRY_TOKEN || 'ABCD1234'

  beforeEach(async () => {
    const { createServer } = await import('./server')
    const { createLocalRegistry } = await import('./registry')
    const { InMemoryAnalytics } = await import('./analytics')
    const { InMemoryPhpStorage } = await import('./php')

    port = 5000 + Math.floor(Math.random() * 1000)
    baseUrl = `http://localhost:${port}`

    const registry = createLocalRegistry(baseUrl)
    const analytics = new InMemoryAnalytics()
    const phpStorage = new InMemoryPhpStorage()

    server = createServer(registry, port, analytics, undefined, undefined, phpStorage)
    server.start()
  })

  afterEach(() => {
    server.stop()
  })

  it('GET /php/search returns empty results initially', async () => {
    const res = await fetch(`${baseUrl}/php/search?q=laravel`)
    expect(res.status).toBe(200)
    const body = await res.json() as any
    expect(body.results).toEqual([])
  })

  it('POST /php/publish requires auth', async () => {
    const form = new FormData()
    form.append('tarball', new File([new ArrayBuffer(8)], 'test-pkg-1.0.0.tar.gz'))
    const res = await fetch(`${baseUrl}/php/publish`, { method: 'POST', body: form })
    expect(res.status).toBe(401)
  })

  it('publishes and retrieves a PHP package', async () => {
    // Publish
    const composerJson = JSON.stringify({
      name: 'test/example',
      version: '1.0.0',
      description: 'A test package',
      type: 'library',
    })
    const form = new FormData()
    form.append('tarball', new File([Buffer.from('fake tarball')], 'test-example-1.0.0.tar.gz'))
    form.append('manifest', composerJson)

    const pubRes = await fetch(`${baseUrl}/php/publish`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${TEST_TOKEN}` },
      body: form,
    })
    expect(pubRes.status).toBe(201)
    const pubBody = await pubRes.json() as any
    expect(pubBody.success).toBe(true)
    expect(pubBody.composerRequire).toContain('composer require test/example')

    // Retrieve
    const getRes = await fetch(`${baseUrl}/php/packages/test/example`)
    expect(getRes.status).toBe(200)
    const pkg = await getRes.json() as any
    expect(pkg.name).toBe('test/example')
    expect(pkg.version).toBe('1.0.0')
    expect(pkg.composerRequire).toContain('composer require')
  })

  it('lists versions', async () => {
    // Publish two versions
    for (const ver of ['1.0.0', '2.0.0']) {
      const form = new FormData()
      form.append('tarball', new File([Buffer.from(`v${ver}`)], `test-ver-${ver}.tar.gz`))
      form.append('manifest', JSON.stringify({ name: 'test/versions', version: ver }))
      await fetch(`${baseUrl}/php/publish`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${TEST_TOKEN}` },
        body: form,
      })
    }

    const res = await fetch(`${baseUrl}/php/packages/test/versions/versions`)
    expect(res.status).toBe(200)
    const body = await res.json() as any
    expect(body.versions).toContain('1.0.0')
    expect(body.versions).toContain('2.0.0')
  })

  it('returns 409 on duplicate version', async () => {
    const publish = async () => {
      const form = new FormData()
      form.append('tarball', new File([Buffer.from('data')], 'dup-1.0.0.tar.gz'))
      form.append('manifest', JSON.stringify({ name: 'test/dup', version: '1.0.0' }))
      return fetch(`${baseUrl}/php/publish`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${TEST_TOKEN}` },
        body: form,
      })
    }

    const first = await publish()
    expect(first.status).toBe(201)

    const second = await publish()
    expect(second.status).toBe(409)
  })

  it('returns 404 for nonexistent package', async () => {
    const res = await fetch(`${baseUrl}/php/packages/no/such`)
    expect(res.status).toBe(404)
  })

  it('downloads tarball', async () => {
    const tarballContent = Buffer.from('tarball content here')
    const form = new FormData()
    form.append('tarball', new File([tarballContent], 'dl-test-1.0.0.tar.gz'))
    form.append('manifest', JSON.stringify({ name: 'test/dl', version: '1.0.0' }))
    await fetch(`${baseUrl}/php/publish`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${TEST_TOKEN}` },
      body: form,
    })

    const res = await fetch(`${baseUrl}/php/packages/test/dl/1.0.0/tarball`)
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toBe('application/gzip')
  })

  it('deletes a package with auth', async () => {
    // Publish first
    const form = new FormData()
    form.append('tarball', new File([Buffer.from('data')], 'del-1.0.0.tar.gz'))
    form.append('manifest', JSON.stringify({ name: 'test/delete', version: '1.0.0' }))
    await fetch(`${baseUrl}/php/publish`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${TEST_TOKEN}` },
      body: form,
    })

    // Delete
    const delRes = await fetch(`${baseUrl}/php/packages/test/delete`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${TEST_TOKEN}` },
    })
    expect(delRes.status).toBe(200)

    // Verify deleted
    const getRes = await fetch(`${baseUrl}/php/packages/test/delete`)
    expect(getRes.status).toBe(404)
  })

  it('search finds published packages', async () => {
    const form = new FormData()
    form.append('tarball', new File([Buffer.from('data')], 'search-1.0.0.tar.gz'))
    form.append('manifest', JSON.stringify({ name: 'laravel/search-test', version: '1.0.0', description: 'A search test' }))
    await fetch(`${baseUrl}/php/publish`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${TEST_TOKEN}` },
      body: form,
    })

    const res = await fetch(`${baseUrl}/php/search?q=laravel`)
    const body = await res.json() as any
    expect(body.results).toHaveLength(1)
    expect(body.results[0].name).toBe('laravel/search-test')
  })
})
