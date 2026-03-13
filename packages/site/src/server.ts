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
  { domain: 'bun.sh', label: 'Bun', desc: 'JavaScript runtime & toolkit' },
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
  { domain: 'rust-lang.org', label: 'Rust', desc: 'Systems programming language' },
  { domain: 'deno.land', label: 'Deno', desc: 'Secure JavaScript runtime' },
  { domain: 'git-scm.org', label: 'Git', desc: 'Version control system' },
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

      // Docs — serve bunpress-built static docs
      if (path === '/docs' || path.startsWith('/docs/')) {
        return await handleDocs(path)
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

/** Lazily built set of doc page paths for link rewriting */
let docsPageCache: Set<string> | null = null

async function getDocsPages(docsDir: string): Promise<Set<string>> {
  if (docsPageCache) return docsPageCache
  const pages = new Set<string>(['/'])
  const { readdir } = await import('node:fs/promises')

  async function scan(dir: string, prefix: string) {
    try {
      const entries = await readdir(dir, { withFileTypes: true })
      for (const entry of entries) {
        if (entry.isFile() && entry.name.endsWith('.html') && entry.name !== '404.html') {
          const name = entry.name.replace('.html', '')
          pages.add(name === 'index' ? prefix || '/' : `${prefix}/${name}`)
        }
        else if (entry.isDirectory() && !entry.name.startsWith('.')) {
          await scan(resolve(dir, entry.name), `${prefix}/${entry.name}`)
        }
      }
    }
    catch { /* ignore missing dirs */ }
  }

  await scan(docsDir, '')
  docsPageCache = pages
  return pages
}

function rewriteDocsLinks(html: string, docsPages: Set<string>): string {
  return html.replace(/href="(\/[^"]*?)"/g, (_match, href) => {
    if (docsPages.has(href)) {
      return `href="/docs${href === '/' ? '' : href}"`
    }
    return _match
  })
}

async function handleDocs(reqPath: string): Promise<Response> {
  const docsDir = resolve(__dirname, '../../../dist/.bunpress')
  const subPath = reqPath === '/docs' || reqPath === '/docs/'
    ? '/index.html'
    : reqPath.replace('/docs', '')

  const candidates = [
    resolve(docsDir, `.${subPath}`),
    resolve(docsDir, `.${subPath}.html`),
    resolve(docsDir, `.${subPath}/index.html`),
  ]

  for (const candidate of candidates) {
    const file = Bun.file(candidate)
    if (await file.exists()) {
      const ext = candidate.split('.').pop()

      // For HTML files, rewrite internal links to include /docs prefix
      if (ext === 'html') {
        const docsPages = await getDocsPages(docsDir)
        let html = await file.text()
        html = rewriteDocsLinks(html, docsPages)
        return new Response(html, {
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'public, max-age=3600',
          },
        })
      }

      const contentTypes: Record<string, string> = {
        css: 'text/css; charset=utf-8',
        js: 'application/javascript; charset=utf-8',
        json: 'application/json',
        svg: 'image/svg+xml',
        png: 'image/png',
        jpg: 'image/jpeg',
        ico: 'image/x-icon',
        woff2: 'font/woff2',
        woff: 'font/woff',
      }
      return new Response(file, {
        headers: {
          'Content-Type': contentTypes[ext || ''] || 'application/octet-stream',
          'Cache-Control': 'public, max-age=3600',
        },
      })
    }
  }

  // Fallback to docs index
  const indexFile = Bun.file(resolve(docsDir, 'index.html'))
  if (await indexFile.exists()) {
    const docsPages = await getDocsPages(docsDir)
    let html = await indexFile.text()
    html = rewriteDocsLinks(html, docsPages)
    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }

  return new Response('Documentation not found', { status: 404 })
}

async function handleStatic(file: string, title: string): Promise<Response> {
  const html = await renderPage(file, { title })
  return htmlResponse(html)
}
