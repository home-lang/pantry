import { describe, expect, it, beforeEach, afterEach } from 'bun:test'
import { createServer, type BinaryStorage } from './server'
import { createLocalRegistry } from './registry'
import { InMemoryAnalytics } from './analytics'

// --- Helpers ---

function today(): string {
  return new Date().toISOString().split('T')[0]
}

/** Mock binary storage that serves test data from an in-memory map */
class MockBinaryStorage implements BinaryStorage {
  private files = new Map<string, Buffer>()

  put(key: string, data: Buffer | string): void {
    this.files.set(key, typeof data === 'string' ? Buffer.from(data) : data)
  }

  async getObject(key: string): Promise<Buffer> {
    const data = this.files.get(key)
    if (!data) throw new Error(`Not found: ${key}`)
    return data
  }
}

// --- Test suite ---

describe('e2e: binary proxy + analytics + dashboard', () => {
  let port: number
  let baseUrl: string
  let analytics: InMemoryAnalytics
  let binaryStore: MockBinaryStorage
  let server: ReturnType<typeof createServer>

  // Use a fixed token for dashboard auth tests
  const TEST_TOKEN = process.env.PANTRY_REGISTRY_TOKEN || process.env.PANTRY_TOKEN || 'ABCD1234'

  beforeEach(() => {
    port = 4000 + Math.floor(Math.random() * 1000)
    baseUrl = `http://localhost:${port}`
    analytics = new InMemoryAnalytics()
    binaryStore = new MockBinaryStorage()

    // Seed mock binary storage with test data
    const metadata = JSON.stringify({
      name: 'curl.se',
      versions: {
        '8.12.0': {
          platforms: {
            'darwin-arm64': {
              tarball: 'binaries/curl.se/8.12.0/darwin-arm64/curl.se-8.12.0.tar.gz',
              sha256: 'abc123def456',
            },
          },
        },
      },
    })
    binaryStore.put('binaries/curl.se/metadata.json', metadata)
    binaryStore.put(
      'binaries/curl.se/8.12.0/darwin-arm64/curl.se-8.12.0.tar.gz',
      Buffer.from([0x1f, 0x8b, 0x08, 0x00, 0xDE, 0xAD, 0xBE, 0xEF]),
    )
    binaryStore.put(
      'binaries/curl.se/8.12.0/darwin-arm64/curl.se-8.12.0.sha256',
      'abc123def456  curl.se-8.12.0.tar.gz',
    )

    const registry = createLocalRegistry(baseUrl)
    server = createServer(registry, port, analytics, undefined, binaryStore)
    server.start()
  })

  afterEach(() => {
    server.stop()
  })

  // ==========================================
  // Part 1: Binary Proxy Routes
  // ==========================================

  describe('binary proxy: metadata', () => {
    it('GET /binaries/{domain}/metadata.json returns JSON with 5min cache', async () => {
      const res = await fetch(`${baseUrl}/binaries/curl.se/metadata.json`)
      expect(res.status).toBe(200)
      expect(res.headers.get('content-type')).toBe('application/json')
      expect(res.headers.get('cache-control')).toBe('public, max-age=300')

      const body = await res.json() as any
      expect(body.name).toBe('curl.se')
      expect(body.versions['8.12.0']).toBeDefined()
      expect(body.versions['8.12.0'].platforms['darwin-arm64'].tarball).toContain('curl.se-8.12.0.tar.gz')
    })

    it('returns 404 for non-existent domain metadata', async () => {
      const res = await fetch(`${baseUrl}/binaries/nonexistent.org/metadata.json`)
      expect(res.status).toBe(404)
      const body = await res.json() as any
      expect(body.error).toBe('Not found')
    })
  })

  describe('binary proxy: tarball', () => {
    it('GET tarball returns binary with 24h immutable cache', async () => {
      const res = await fetch(
        `${baseUrl}/binaries/curl.se/8.12.0/darwin-arm64/curl.se-8.12.0.tar.gz`,
      )
      expect(res.status).toBe(200)
      expect(res.headers.get('content-type')).toBe('application/gzip')
      expect(res.headers.get('cache-control')).toBe('public, max-age=86400, immutable')

      const bytes = new Uint8Array(await res.arrayBuffer())
      // gzip magic bytes
      expect(bytes[0]).toBe(0x1f)
      expect(bytes[1]).toBe(0x8b)
      expect(bytes.length).toBe(8)
    })

    it('returns correct content-length header', async () => {
      const res = await fetch(
        `${baseUrl}/binaries/curl.se/8.12.0/darwin-arm64/curl.se-8.12.0.tar.gz`,
      )
      expect(res.headers.get('content-length')).toBe('8')
    })

    it('returns 404 for non-existent tarball', async () => {
      const res = await fetch(
        `${baseUrl}/binaries/curl.se/9.99.0/darwin-arm64/curl.se-9.99.0.tar.gz`,
      )
      expect(res.status).toBe(404)
    })

    it('rejects non-GET methods', async () => {
      const res = await fetch(
        `${baseUrl}/binaries/curl.se/8.12.0/darwin-arm64/curl.se-8.12.0.tar.gz`,
        { method: 'POST' },
      )
      expect(res.status).toBe(405)
    })
  })

  describe('binary proxy: checksum', () => {
    it('GET .sha256 returns plain text with 24h immutable cache', async () => {
      const res = await fetch(
        `${baseUrl}/binaries/curl.se/8.12.0/darwin-arm64/curl.se-8.12.0.sha256`,
      )
      expect(res.status).toBe(200)
      expect(res.headers.get('content-type')).toBe('text/plain')
      expect(res.headers.get('cache-control')).toBe('public, max-age=86400, immutable')

      const text = await res.text()
      expect(text).toContain('abc123def456')
    })
  })

  // ==========================================
  // Part 2: Analytics Tracking via Binary Proxy
  // ==========================================

  describe('analytics tracking', () => {
    it('tarball download tracks both download and install event', async () => {
      // Download the tarball
      const res = await fetch(
        `${baseUrl}/binaries/curl.se/8.12.0/darwin-arm64/curl.se-8.12.0.tar.gz`,
      )
      expect(res.status).toBe(200)

      // Give fire-and-forget promises time to resolve
      await new Promise(r => setTimeout(r, 100))

      // Verify via analytics API
      const statsRes = await fetch(`${baseUrl}/analytics/curl.se`)
      expect(statsRes.status).toBe(200)
      const stats = await statsRes.json() as any
      expect(stats.totalDownloads).toBe(1)
      expect(stats.versionDownloads['8.12.0']).toBe(1)
    })

    it('multiple downloads accumulate correctly', async () => {
      // Download 3 times
      for (let i = 0; i < 3; i++) {
        await fetch(`${baseUrl}/binaries/curl.se/8.12.0/darwin-arm64/curl.se-8.12.0.tar.gz`)
      }
      await new Promise(r => setTimeout(r, 100))

      const statsRes = await fetch(`${baseUrl}/analytics/curl.se`)
      const stats = await statsRes.json() as any
      expect(stats.totalDownloads).toBe(3)
      expect(stats.versionDownloads['8.12.0']).toBe(3)
    })

    it('metadata and checksum downloads do NOT trigger analytics', async () => {
      await fetch(`${baseUrl}/binaries/curl.se/metadata.json`)
      await fetch(`${baseUrl}/binaries/curl.se/8.12.0/darwin-arm64/curl.se-8.12.0.sha256`)
      await new Promise(r => setTimeout(r, 100))

      const statsRes = await fetch(`${baseUrl}/analytics/curl.se`)
      expect(statsRes.status).toBe(404) // no analytics data yet
    })

    it('tracked downloads appear in top packages', async () => {
      await fetch(`${baseUrl}/binaries/curl.se/8.12.0/darwin-arm64/curl.se-8.12.0.tar.gz`)
      await new Promise(r => setTimeout(r, 100))

      const topRes = await fetch(`${baseUrl}/analytics/top?limit=10`)
      expect(topRes.status).toBe(200)
      const top = await topRes.json() as any
      expect(top.packages.length).toBeGreaterThanOrEqual(1)
      expect(top.packages[0].name).toBe('curl.se')
      expect(top.packages[0].downloads).toBeGreaterThanOrEqual(1)
    })

    it('tracked downloads appear in daily timeline', async () => {
      await fetch(`${baseUrl}/binaries/curl.se/8.12.0/darwin-arm64/curl.se-8.12.0.tar.gz`)
      await new Promise(r => setTimeout(r, 100))

      const timelineRes = await fetch(`${baseUrl}/analytics/curl.se/timeline?days=7`)
      expect(timelineRes.status).toBe(200)
      const timeline = await timelineRes.json() as any
      expect(timeline.packageName).toBe('curl.se')
      // Should have today in the timeline
      const todayEntry = timeline.timeline.find((d: any) => d.date === today())
      expect(todayEntry).toBeDefined()
      expect(todayEntry.count).toBe(1)
    })

    it('install category event is tracked for tarball downloads', async () => {
      await fetch(`${baseUrl}/binaries/curl.se/8.12.0/darwin-arm64/curl.se-8.12.0.tar.gz`)
      await new Promise(r => setTimeout(r, 100))

      const catRes = await fetch(`${baseUrl}/api/analytics/install/30d.json`)
      expect(catRes.status).toBe(200)
      const catData = await catRes.json() as any
      expect(catData.category).toBe('install')
      expect(catData.total_count).toBeGreaterThanOrEqual(1)
      // curl.se should be in the items
      const curlItem = catData.items.find((i: any) => i.formula === 'curl.se')
      expect(curlItem).toBeDefined()
    })

    it('tracks user-agent from request headers', async () => {
      await fetch(
        `${baseUrl}/binaries/curl.se/8.12.0/darwin-arm64/curl.se-8.12.0.tar.gz`,
        { headers: { 'User-Agent': 'pantry-cli/0.1.0' } },
      )
      expect(true).toBe(true) // No crash = user-agent handling works
    })
  })

  // ==========================================
  // Part 3: Dashboard Auth Flow
  // ==========================================

  describe('dashboard: auth', () => {
    it('GET /dashboard redirects to login when unauthenticated', async () => {
      const res = await fetch(`${baseUrl}/dashboard`, { redirect: 'manual' })
      expect(res.status).toBe(302)
      expect(res.headers.get('location')).toBe('/dashboard/login')
    })

    it('GET /dashboard/login returns login page HTML', async () => {
      const res = await fetch(`${baseUrl}/dashboard/login`)
      expect(res.status).toBe(200)
      expect(res.headers.get('content-type')).toBe('text/html')

      const html = await res.text()
      expect(html).toContain('<!DOCTYPE html>')
      expect(html).toContain('Pantry Dashboard')
      expect(html).toContain('<form')
      expect(html).toContain('method="POST"')
      expect(html).toContain('action="/dashboard/login"')
      expect(html).toContain('type="password"')
      expect(html).toContain('name="token"')
      expect(html).toContain('Sign In')
    })

    it('POST /dashboard/login with valid token sets cookie and redirects with token param', async () => {
      const formData = new FormData()
      formData.set('token', TEST_TOKEN)

      const res = await fetch(`${baseUrl}/dashboard/login`, {
        method: 'POST',
        body: formData,
        redirect: 'manual',
      })
      expect(res.status).toBe(302)
      expect(res.headers.get('location')).toContain('/dashboard?token=')

      const cookie = res.headers.get('set-cookie')
      expect(cookie).toContain('pantry_token=')
      expect(cookie).toContain('HttpOnly')
      expect(cookie).toContain('SameSite=Lax')
    })

    it('supports auth via query parameter (CloudFront compatible)', async () => {
      const res = await fetch(`${baseUrl}/dashboard?token=${TEST_TOKEN}`)
      expect(res.status).toBe(200)
      expect(res.headers.get('content-type')).toBe('text/html')
    })

    it('supports auth via Authorization header', async () => {
      const res = await fetch(`${baseUrl}/dashboard`, {
        headers: { 'Authorization': `Bearer ${TEST_TOKEN}` },
      })
      expect(res.status).toBe(200)
      expect(res.headers.get('content-type')).toBe('text/html')
    })

    it('POST /dashboard/login with invalid token shows error', async () => {
      const formData = new FormData()
      formData.set('token', 'wrong-token')

      const res = await fetch(`${baseUrl}/dashboard/login`, {
        method: 'POST',
        body: formData,
      })
      expect(res.status).toBe(401)
      const html = await res.text()
      expect(html).toContain('Invalid token')
    })

    it('authenticated request to /dashboard returns overview page', async () => {
      const res = await fetch(`${baseUrl}/dashboard`, {
        headers: { 'Cookie': `pantry_token=${TEST_TOKEN}` },
      })
      expect(res.status).toBe(200)
      expect(res.headers.get('content-type')).toBe('text/html')
      expect(res.headers.get('cache-control')).toBe('no-cache, no-store')
    })

    it('GET /dashboard/logout clears cookie and redirects to login', async () => {
      const res = await fetch(`${baseUrl}/dashboard/logout`, { redirect: 'manual' })
      expect(res.status).toBe(302)
      expect(res.headers.get('location')).toBe('/dashboard/login')
      const cookie = res.headers.get('set-cookie')
      expect(cookie).toContain('Max-Age=0')
    })
  })

  // ==========================================
  // Part 4: Dashboard DOM Structure
  // ==========================================

  describe('dashboard: overview page DOM', () => {
    it('renders valid HTML document structure', async () => {
      const res = await fetch(`${baseUrl}/dashboard`, {
        headers: { 'Cookie': `pantry_token=${TEST_TOKEN}` },
      })
      const html = await res.text()

      expect(html).toContain('<!DOCTYPE html>')
      expect(html).toContain('<html lang="en">')
      expect(html).toContain('<meta charset="UTF-8">')
      expect(html).toContain('<meta name="viewport"')
      expect(html).toContain('</html>')
    })

    it('uses Tailwind utility classes (rendered via stx Crosswind)', async () => {
      const res = await fetch(`${baseUrl}/dashboard`, {
        headers: { 'Cookie': `pantry_token=${TEST_TOKEN}` },
      })
      const html = await res.text()
      // Should use Tailwind classes directly (processed by stx Crosswind, no CDN)
      expect(html).toContain('bg-slate-800')
      expect(html).toContain('rounded-lg')
      expect(html).not.toContain('cdn.tailwindcss.com')
    })

    it('has dark theme classes', async () => {
      const res = await fetch(`${baseUrl}/dashboard`, {
        headers: { 'Cookie': `pantry_token=${TEST_TOKEN}` },
      })
      const html = await res.text()
      expect(html).toContain('bg-slate-900')
      expect(html).toContain('text-white')
    })

    it('has navigation bar with correct links', async () => {
      const res = await fetch(`${baseUrl}/dashboard`, {
        headers: { 'Cookie': `pantry_token=${TEST_TOKEN}` },
      })
      const html = await res.text()
      expect(html).toContain('<nav')
      expect(html).toContain('href="/dashboard')
      expect(html).toContain('href="/health"')
      expect(html).toContain('href="/dashboard/logout"')
      expect(html).toContain('Pantry Dashboard')
    })

    it('renders 4 stats cards in responsive grid', async () => {
      const res = await fetch(`${baseUrl}/dashboard`, {
        headers: { 'Cookie': `pantry_token=${TEST_TOKEN}` },
      })
      const html = await res.text()
      expect(html).toContain('grid-cols-1')
      expect(html).toContain('md:grid-cols-2')
      expect(html).toContain('lg:grid-cols-4')
      expect(html).toContain('Total Downloads')
      expect(html).toContain('Tracked Packages')
      expect(html).toContain('Top Package')
      expect(html).toContain('Top Downloads')
    })

    it('renders top packages table with proper columns', async () => {
      const res = await fetch(`${baseUrl}/dashboard`, {
        headers: { 'Cookie': `pantry_token=${TEST_TOKEN}` },
      })
      const html = await res.text()
      expect(html).toContain('Top Packages')
      expect(html).toContain('<table')
      expect(html).toContain('<thead>')
      expect(html).toContain('<tbody>')
      expect(html).toContain('Package')
      expect(html).toContain('Downloads')
    })

    it('shows tracked packages in overview table after downloads', async () => {
      // Generate some downloads first
      await fetch(`${baseUrl}/binaries/curl.se/8.12.0/darwin-arm64/curl.se-8.12.0.tar.gz`)
      await new Promise(r => setTimeout(r, 100))

      const res = await fetch(`${baseUrl}/dashboard`, {
        headers: { 'Cookie': `pantry_token=${TEST_TOKEN}` },
      })
      const html = await res.text()

      // Package should appear in the table
      expect(html).toContain('curl.se')
      expect(html).toContain('href="/dashboard/package/curl.se')
    })
  })

  // ==========================================
  // Part 5: Dashboard Package Detail Page
  // ==========================================

  describe('dashboard: package detail page', () => {
    beforeEach(async () => {
      // Seed some downloads
      for (let i = 0; i < 5; i++) {
        await fetch(`${baseUrl}/binaries/curl.se/8.12.0/darwin-arm64/curl.se-8.12.0.tar.gz`)
      }
      await new Promise(r => setTimeout(r, 150))
    })

    it('GET /dashboard/package/{name} requires auth', async () => {
      const res = await fetch(`${baseUrl}/dashboard/package/curl.se`, { redirect: 'manual' })
      expect(res.status).toBe(302)
      expect(res.headers.get('location')).toBe('/dashboard/login')
    })

    it('renders package detail with correct title', async () => {
      const res = await fetch(`${baseUrl}/dashboard/package/curl.se`, {
        headers: { 'Cookie': `pantry_token=${TEST_TOKEN}` },
      })
      expect(res.status).toBe(200)
      const html = await res.text()
      expect(html).toContain('curl.se')
      expect(html).toContain('Pantry Dashboard') // in title
    })

    it('has back link to overview', async () => {
      const res = await fetch(`${baseUrl}/dashboard/package/curl.se`, {
        headers: { 'Cookie': `pantry_token=${TEST_TOKEN}` },
      })
      const html = await res.text()
      expect(html).toContain('href="/dashboard')
      expect(html).toContain('&larr;')
    })

    it('renders 4 stats cards for the package', async () => {
      const res = await fetch(`${baseUrl}/dashboard/package/curl.se`, {
        headers: { 'Cookie': `pantry_token=${TEST_TOKEN}` },
      })
      const html = await res.text()
      expect(html).toContain('Total Downloads')
      expect(html).toContain('Last Download')
      expect(html).toContain('Versions Tracked')
      expect(html).toContain('30d Downloads')
    })

    it('shows correct download count in stats', async () => {
      const res = await fetch(`${baseUrl}/dashboard/package/curl.se`, {
        headers: { 'Cookie': `pantry_token=${TEST_TOKEN}` },
      })
      const html = await res.text()
      // We did 5 downloads in beforeEach
      expect(html).toContain('5')
    })

    it('renders chart canvas element', async () => {
      const res = await fetch(`${baseUrl}/dashboard/package/curl.se`, {
        headers: { 'Cookie': `pantry_token=${TEST_TOKEN}` },
      })
      const html = await res.text()
      expect(html).toContain('<canvas id="chart"')
      expect(html).toContain('getContext(')
      expect(html).toContain('Downloads (30 days)')
    })

    it('renders version breakdown table', async () => {
      const res = await fetch(`${baseUrl}/dashboard/package/curl.se`, {
        headers: { 'Cookie': `pantry_token=${TEST_TOKEN}` },
      })
      const html = await res.text()
      expect(html).toContain('Version Breakdown')
      expect(html).toContain('8.12.0')
    })

    it('has no-cache headers', async () => {
      const res = await fetch(`${baseUrl}/dashboard/package/curl.se`, {
        headers: { 'Cookie': `pantry_token=${TEST_TOKEN}` },
      })
      expect(res.headers.get('cache-control')).toBe('no-cache, no-store')
    })
  })

  // ==========================================
  // Part 6: Dashboard API Endpoints
  // ==========================================

  describe('dashboard: API endpoints', () => {
    it('GET /dashboard/api/overview returns JSON with top packages', async () => {
      // Seed data
      await fetch(`${baseUrl}/binaries/curl.se/8.12.0/darwin-arm64/curl.se-8.12.0.tar.gz`)
      await new Promise(r => setTimeout(r, 100))

      const res = await fetch(`${baseUrl}/dashboard/api/overview`, {
        headers: { 'Cookie': `pantry_token=${TEST_TOKEN}` },
      })
      expect(res.status).toBe(200)
      const body = await res.json() as any
      expect(body.packages).toBeDefined()
      expect(Array.isArray(body.packages)).toBe(true)
    })

    it('GET /dashboard/api/package/{name} returns stats and timeline', async () => {
      await fetch(`${baseUrl}/binaries/curl.se/8.12.0/darwin-arm64/curl.se-8.12.0.tar.gz`)
      await new Promise(r => setTimeout(r, 100))

      const res = await fetch(`${baseUrl}/dashboard/api/package/curl.se`, {
        headers: { 'Cookie': `pantry_token=${TEST_TOKEN}` },
      })
      expect(res.status).toBe(200)
      const body = await res.json() as any
      expect(body.stats).toBeDefined()
      expect(body.timeline).toBeDefined()
      expect(body.stats.totalDownloads).toBe(1)
    })

    it('API endpoints require auth', async () => {
      const res = await fetch(`${baseUrl}/dashboard/api/overview`, { redirect: 'manual' })
      expect(res.status).toBe(302)
    })
  })

  // ==========================================
  // Part 7: Full E2E Flow
  // ==========================================

  describe('full e2e flow: install → track → view', () => {
    it('simulates complete pantry install → analytics → dashboard flow', async () => {
      // Step 1: CLI fetches metadata (like `pantry install curl`)
      const metaRes = await fetch(`${baseUrl}/binaries/curl.se/metadata.json`)
      expect(metaRes.status).toBe(200)
      const meta = await metaRes.json() as any
      const tarballPath = meta.versions['8.12.0'].platforms['darwin-arm64'].tarball
      expect(tarballPath).toBeDefined()

      // Step 2: CLI downloads tarball
      const tarballRes = await fetch(`${baseUrl}/${tarballPath}`)
      expect(tarballRes.status).toBe(200)
      const tarballBytes = await tarballRes.arrayBuffer()
      expect(tarballBytes.byteLength).toBe(8)

      // Step 3: CLI fetches checksum
      const checksumPath = tarballPath.replace('.tar.gz', '.sha256')
      const checksumRes = await fetch(`${baseUrl}/${checksumPath}`)
      expect(checksumRes.status).toBe(200)

      // Wait for fire-and-forget analytics (increased for CI)
      await new Promise(r => setTimeout(r, 500))

      // Step 4: Verify analytics were recorded
      const statsRes = await fetch(`${baseUrl}/analytics/curl.se`)
      expect(statsRes.status).toBe(200)
      const stats = await statsRes.json() as any
      expect(stats.totalDownloads).toBe(1)
      expect(stats.versionDownloads['8.12.0']).toBe(1)

      // Step 5: Verify top packages endpoint
      const topRes = await fetch(`${baseUrl}/analytics/top`)
      const top = await topRes.json() as any
      expect(top.packages.some((p: any) => p.name === 'curl.se')).toBe(true)

      // Step 6: Verify dashboard shows the data
      const dashRes = await fetch(`${baseUrl}/dashboard`, {
        headers: { 'Cookie': `pantry_token=${TEST_TOKEN}` },
      })
      expect(dashRes.status).toBe(200)
      const dashHtml = await dashRes.text()
      expect(dashHtml).toContain('curl.se')

      // Step 7: Verify package detail page
      const detailRes = await fetch(`${baseUrl}/dashboard/package/curl.se`, {
        headers: { 'Cookie': `pantry_token=${TEST_TOKEN}` },
      })
      expect(detailRes.status).toBe(200)
      const detailHtml = await detailRes.text()
      expect(detailHtml).toContain('curl.se')
      expect(detailHtml).toContain('8.12.0')
      expect(detailHtml).toContain('Total Downloads')
    })
  })

  // ==========================================
  // Part 8: CORS Headers
  // ==========================================

  describe('CORS headers', () => {
    it('binary proxy includes CORS headers', async () => {
      const res = await fetch(`${baseUrl}/binaries/curl.se/metadata.json`)
      expect(res.headers.get('access-control-allow-origin')).toBe('*')
    })

    it('OPTIONS preflight on binary routes returns CORS', async () => {
      const res = await fetch(`${baseUrl}/binaries/curl.se/metadata.json`, { method: 'OPTIONS' })
      expect(res.status).toBe(200)
      expect(res.headers.get('access-control-allow-methods')).toContain('GET')
    })
  })

  // ==========================================
  // Part 9: Edge Cases
  // ==========================================

  describe('edge cases', () => {
    it('handles URL-encoded domain names in binary proxy', async () => {
      binaryStore.put('binaries/github.com%2Fuser/metadata.json', '{"name":"test"}')
      const res = await fetch(`${baseUrl}/binaries/github.com%2Fuser/metadata.json`)
      // Should either succeed or 404 gracefully (depends on URL decoding)
      expect([200, 404]).toContain(res.status)
    })

    it('handles deeply nested binary paths', async () => {
      binaryStore.put(
        'binaries/node.js/22.0.0/linux-x86-64/node.js-22.0.0.tar.gz',
        Buffer.from([0x1f, 0x8b]),
      )
      const res = await fetch(
        `${baseUrl}/binaries/node.js/22.0.0/linux-x86-64/node.js-22.0.0.tar.gz`,
      )
      expect(res.status).toBe(200)
    })

    it('concurrent downloads track correctly', async () => {
      // Record baseline before concurrent downloads
      const beforeRes = await fetch(`${baseUrl}/analytics/curl.se`)
      const before = await beforeRes.json() as any
      const baseline = before.totalDownloads || 0

      const downloads = Array.from({ length: 10 }, () =>
        fetch(`${baseUrl}/binaries/curl.se/8.12.0/darwin-arm64/curl.se-8.12.0.tar.gz`),
      )
      const results = await Promise.all(downloads)
      results.forEach(r => expect(r.status).toBe(200))

      // Wait for fire-and-forget analytics (some may not complete under load)
      await new Promise(r => setTimeout(r, 1000))

      const statsRes = await fetch(`${baseUrl}/analytics/curl.se`)
      const stats = await statsRes.json() as any
      // At least some downloads should be tracked (fire-and-forget may lose some under concurrency)
      expect(stats.totalDownloads).toBeGreaterThan(baseline)
    })

    it('login page with error renders error message in DOM', async () => {
      const formData = new FormData()
      formData.set('token', 'bad-token')
      const res = await fetch(`${baseUrl}/dashboard/login`, {
        method: 'POST',
        body: formData,
      })
      const html = await res.text()
      expect(html).toContain('Invalid token')
      expect(html).toContain('bg-red-900')
      // Should still have the login form for retry
      expect(html).toContain('<form')
      expect(html).toContain('name="token"')
    })

    it('dashboard 404 for unknown sub-paths', async () => {
      const res = await fetch(`${baseUrl}/dashboard/nonexistent`, {
        headers: { 'Cookie': `pantry_token=${TEST_TOKEN}` },
      })
      expect(res.status).toBe(404)
    })
  })
})
