import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { renderTemplate } from '@stacksjs/stx'

const __dirname = typeof import.meta.dirname === 'string'
  ? import.meta.dirname
  : dirname(fileURLToPath(import.meta.url))
const PAGES_DIR = resolve(__dirname, '../pages')
const LAYOUT = `${PAGES_DIR}/layout.stx`

const REGISTRY_URL = process.env.REGISTRY_URL || 'https://registry.pantry.dev'

// ============================================================================
// Registry API helpers
// ============================================================================

async function registryFetch(path: string): Promise<any> {
  try {
    const res = await fetch(`${REGISTRY_URL}${path}`, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return null
    return res.json()
  }
  catch {
    return null
  }
}

/** Featured packages shown on the homepage */
const FEATURED_PACKAGES = [
  { domain: 'curl.se', label: 'curl', desc: 'Command line data transfer' },
  { domain: 'python.org', label: 'Python', desc: 'Programming language' },
  { domain: 'nodejs.org', label: 'Node.js', desc: 'JavaScript runtime' },
  { domain: 'go.dev', label: 'Go', desc: 'Programming language' },
  { domain: 'ruby-lang.org', label: 'Ruby', desc: 'Programming language' },
  { domain: 'cmake.org', label: 'CMake', desc: 'Build system generator' },
  { domain: 'openssl.org', label: 'OpenSSL', desc: 'TLS/SSL toolkit' },
  { domain: 'redis.io', label: 'Redis', desc: 'In-memory data store' },
  { domain: 'postgresql.org', label: 'PostgreSQL', desc: 'Relational database' },
  { domain: 'nginx.org', label: 'nginx', desc: 'Web server & reverse proxy' },
  { domain: 'sqlite.org', label: 'SQLite', desc: 'Embedded SQL database' },
  { domain: 'ffmpeg.org', label: 'FFmpeg', desc: 'Multimedia framework' },
]

// ============================================================================
// Route handler
// ============================================================================

const port = Number.parseInt(process.env.PORT || '3001', 10)

Bun.serve({
  port,
  async fetch(req) {
    const url = new URL(req.url)
    const path = url.pathname

    try {
      // CLI user-agent detection — serve install script for curl/wget/etc.
      const ua = req.headers.get('user-agent') || ''
      const isCLI = /^(curl|wget|httpie|fetch|libfetch|powershell)/i.test(ua) || !ua

      if (isCLI && (path === '/' || path === '')) {
        const script = await Bun.file(resolve(__dirname, '../../../public/install.sh')).text()
        return new Response(script, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
      }

      // Static health check
      if (path === '/health') {
        return Response.json({ status: 'ok', timestamp: new Date().toISOString() })
      }

      // Homepage
      if (path === '/' || path === '') {
        return await handleHome()
      }

      // Search
      if (path === '/search') {
        const q = url.searchParams.get('q') || ''
        return await handleSearch(q)
      }

      // Package detail
      const pkgMatch = path.match(/^\/package\/(.+)$/)
      if (pkgMatch) {
        const name = decodeURIComponent(pkgMatch[1])
        return await handlePackage(name)
      }

      // Docs
      if (path === '/docs') {
        return await handleStatic('docs.stx', 'Documentation')
      }

      // About
      if (path === '/about') {
        return await handleStatic('about.stx', 'About')
      }

      // Privacy
      if (path === '/privacy') {
        return await handleStatic('privacy.stx', 'Privacy Policy')
      }

      // Accessibility
      if (path === '/accessibility') {
        return await handleStatic('accessibility.stx', 'Accessibility')
      }

      return new Response('Not found', { status: 404, headers: { 'Content-Type': 'text/html' } })
    }
    catch (error) {
      console.error('Server error:', error)
      return new Response('Internal server error', { status: 500 })
    }
  },
})

console.log(`pantry.dev site running at http://localhost:${port}`)

// ============================================================================
// Render helper — uses stx natively
// ============================================================================

async function renderPage(file: string, context: Record<string, unknown> = {}): Promise<string> {
  const title = (context.title as string) || 'pantry'
  return renderTemplate(`${PAGES_DIR}/${file}`, {
    context: { ...context, title },
    layout: LAYOUT,
    options: { componentsDir: resolve(__dirname, '../components') },
    injectCSS: true,
  })
}

function htmlResponse(html: string, status = 200): Response {
  return new Response(html, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=60',
    },
  })
}

// ============================================================================
// Route handlers
// ============================================================================

async function handleHome(): Promise<Response> {
  const metaResults = await Promise.allSettled(
    FEATURED_PACKAGES.map(async (pkg) => {
      const meta = await registryFetch(`/binaries/${pkg.domain}/metadata.json`)
      return {
        ...pkg,
        version: meta?.latestVersion || null,
        versionCount: meta?.versions ? Object.keys(meta.versions).length : 0,
      }
    }),
  )

  const packages = metaResults.map((r, i) =>
    r.status === 'fulfilled' ? r.value : { ...FEATURED_PACKAGES[i], version: null, versionCount: 0 },
  )

  const searchData = await registryFetch('/search?q=&limit=1')
  const totalPackages = searchData?.results?.length ?? 500

  const html = await renderPage('index.stx', { packages, totalPackages })
  return htmlResponse(html)
}

async function handleSearch(query: string): Promise<Response> {
  let results: any[] = []
  if (query) {
    const searchData = await registryFetch(`/search?q=${encodeURIComponent(query)}&limit=50`)
    results = searchData?.results || []

    const metaData = await registryFetch(`/binaries/${query}/metadata.json`)
    if (metaData && metaData.name) {
      const exists = results.some((r: any) => r.name === metaData.name)
      if (!exists) {
        const latestVersion = metaData.latestVersion || ''
        const latestData = metaData.versions?.[latestVersion] || {}
        const platformKeys = Object.keys(latestData.platforms || {})
        const platformLabels = platformKeys.map((p: string) => {
          if (p.includes('darwin')) return 'macOS'
          if (p.includes('linux')) return 'Linux'
          return p
        }).filter((v: string, i: number, a: string[]) => a.indexOf(v) === i)

        results.unshift({
          name: metaData.name,
          version: latestVersion,
          description: metaData.description || `${Object.keys(metaData.versions || {}).length} versions available`,
          platforms: platformLabels,
        })
      }
    }
  }

  const html = await renderPage('search.stx', { query, results, title: query ? `search: ${query}` : 'search' })
  return htmlResponse(html)
}

async function handlePackage(name: string): Promise<Response> {
  const [meta, stats, timeline, pkgInfo] = await Promise.all([
    registryFetch(`/binaries/${name}/metadata.json`),
    registryFetch(`/analytics/${name}`),
    registryFetch(`/analytics/${name}/timeline?days=30`),
    registryFetch(`/packages/${name}`),
  ])

  // No data from either source
  if (!meta && !pkgInfo) {
    const html = await renderPage('package.stx', {
      name,
      notFound: true,
      meta: null,
      latestVersion: '',
      versions: [],
      platforms: [],
      stats: null,
      timeline: [],
      title: `${name} - not found`,
    })
    return htmlResponse(html, 404)
  }

  // Binary metadata available (pantry-built package)
  if (meta) {
    const versions = Object.keys(meta.versions || {})
    const latestVersion = meta.latestVersion || versions[0] || 'unknown'
    const latestData = meta.versions?.[latestVersion] || {}
    const platforms = Object.keys(latestData.platforms || {})

    const html = await renderPage('package.stx', {
      name,
      notFound: false,
      meta,
      latestVersion,
      versions,
      platforms,
      stats: stats || { totalDownloads: 0, versionDownloads: {} },
      timeline: timeline?.timeline || [],
      title: name,
    })
    return htmlResponse(html)
  }

  // Registry-only package (npm, no pantry binaries yet)
  const html = await renderPage('package.stx', {
    name,
    notFound: false,
    meta: pkgInfo,
    latestVersion: pkgInfo.version || 'unknown',
    versions: pkgInfo.version ? [pkgInfo.version] : [],
    platforms: [],
    stats: stats || { totalDownloads: pkgInfo.downloads || 0, versionDownloads: {} },
    timeline: timeline?.timeline || [],
    title: name,
  })
  return htmlResponse(html)
}

async function handleStatic(file: string, title: string): Promise<Response> {
  const html = await renderPage(file, { title })
  return htmlResponse(html)
}
