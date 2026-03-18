import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { RegistryConfig } from './types'
import { Registry, createLocalRegistry, createRegistryFromEnv } from './registry'
import { createAnalytics, type AnalyticsStorage, type AnalyticsCategory } from './analytics'
import { handleZigRoutes, createZigStorage } from './zig-routes'
import type { ZigPackageStorage } from './zig'
import { S3Client } from './storage/aws-client'
import { checkPaywallAccess, configurePaywall, createCheckoutSession, handleStripeWebhook, formatPrice } from './paywall'
import { renderTemplate } from '@stacksjs/stx'
import {
  generateSparkline,
  generateLineChart,
  generateHorizontalBarChart,
  generateMultiLineChart,
  formatCount as chartFormatCount,
} from './charts'

// Build domain→versions lookup from ts-pantry package metadata for version validation
const _knownVersions = new Map<string, Set<string>>()
try {
  const pantryPkgsPath = resolve(
    typeof import.meta.dirname === 'string' ? import.meta.dirname : dirname(fileURLToPath(import.meta.url)),
    '../../ts-pantry/src/packages/index.ts',
  )
  const { pantry: pantryPkgs } = await import(pantryPkgsPath)
  for (const val of Object.values(pantryPkgs as Record<string, any>)) {
    if (val && typeof val === 'object' && typeof val.domain === 'string' && Array.isArray(val.versions)) {
      _knownVersions.set(val.domain, new Set(val.versions))
    }
  }
  console.log(`Loaded ${_knownVersions.size} packages for version validation`)
}
catch (err) {
  console.warn('Could not load ts-pantry package metadata for version validation:', err)
}

function isKnownVersion(domain: string, version: string): boolean {
  const versions = _knownVersions.get(domain)
  if (!versions) return false // Unknown package — don't track
  return versions.has(version)
}

// Resolve dashboard pages directory relative to this file
const __dirname = typeof import.meta.dirname === 'string'
  ? import.meta.dirname
  : dirname(fileURLToPath(import.meta.url))
const DASHBOARD_DIR = resolve(__dirname, '../dashboard/pages')
const SITE_DIR = resolve(__dirname, '../site/pages')
const SITE_LAYOUT = resolve(SITE_DIR, 'layout.stx')
const SITE_COMPONENTS = resolve(__dirname, '../site/components')

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
// Render helpers — uses @stacksjs/stx
// ============================================================================

async function renderSitePage(file: string, context: Record<string, unknown> = {}): Promise<string> {
  const title = (context.title as string) || 'pantry'
  let html = await renderTemplate(resolve(SITE_DIR, file), {
    context: { ...context, title },
    layout: SITE_LAYOUT,
    options: { componentsDir: SITE_COMPONENTS },
    injectCSS: true,
    wrapInDocument: false,
  })
  // Strip STX-injected default meta tags that duplicate our custom ones in layout.stx.
  // STX auto-generates bare meta tags (no leading whitespace) — ours are indented.
  // Match only lines starting with < (no leading whitespace) to preserve our indented versions.
  html = html.replace(/^<meta[^>]*content="A website built with stx templating engine"[^>]*>\n?/gm, '')
  html = html.replace(/^<meta property="og:title" content="[^"]*">\n?/gm, '')
  html = html.replace(/^<meta name="twitter:title" content="[^"]*">\n?/gm, '')
  return html
}

async function renderDashboardPage(file: string, context: Record<string, unknown> = {}): Promise<string> {
  return renderTemplate(resolve(DASHBOARD_DIR, file), {
    context,
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

const categorySlugMap: Record<string, AnalyticsCategory> = {
  'install': 'install',
  'install-on-request': 'install_on_request',
  'build-error': 'build_error',
}

/**
 * Create the registry HTTP server
 *
 * API Endpoints (compatible with pantry Zig client):
 * GET  /packages/{name}           - Get latest package metadata
 * GET  /packages/{name}/{version} - Get specific version metadata
 * GET  /packages/{name}/{version}/tarball - Download tarball
 * GET  /packages/{name}/versions  - List all versions
 * GET  /search?q={query}          - Search packages
 * POST /publish                   - Publish package (multipart/form-data)
 * GET  /health                    - Health check
 *
 * Analytics endpoints:
 * GET  /analytics/{name}          - Get package download stats
 * GET  /analytics/{name}/timeline - Get download timeline (last 30 days)
 * GET  /analytics/{name}/requested-versions - Get most-requested missing versions
 * GET  /analytics/top             - Get top downloaded packages
 * GET  /analytics/{category}/{period} - Category analytics (install, install-on-request, build-error)
 * GET  /api/analytics/{category}/{period}.json - Category analytics (JSON API)
 * POST /analytics/events          - Report analytics event
 *
 * Commit publish endpoints (pkg-pr-new equivalent):
 * POST /publish/commit                       - Publish packages from a commit
 * GET  /commits/{sha}                        - List packages for a commit
 * GET  /commits/{sha}/{name}                 - Get commit package metadata
 * GET  /commits/{sha}/{name}/tarball         - Download commit tarball
 *
 * Zig package endpoints:
 * GET  /zig/packages/{name}                  - Get Zig package metadata
 * GET  /zig/packages/{name}/{version}        - Get specific version
 * GET  /zig/packages/{name}/{version}/tarball - Download tarball
 * GET  /zig/packages/{name}/versions         - List versions
 * GET  /zig/hash/{hash}                      - Lookup by content hash
 * GET  /zig/search?q={query}                 - Search Zig packages
 * POST /zig/publish                          - Publish Zig package
 *
 * npm bulk resolution:
 * POST /npm/resolve                    - Resolve all transitive deps from input constraints
 * GET  /npm/resolve/{specs}            - GET variant (comma-separated name@constraint pairs)
 *
 * Binary proxy (pantry CLI install):
 * GET  /binaries/{domain}/metadata.json                        - Package metadata (5min cache)
 * GET  /binaries/{domain}/{version}/{platform}/{file}.tar.gz   - Tarball download (24h cache, tracked)
 * GET  /binaries/{domain}/{version}/{platform}/{file}.sha256   - Checksum (24h cache)
 *
 * Dashboard:
 * GET  /dashboard            - Analytics overview (auth required)
 * GET  /dashboard/package/*  - Package detail (auth required)
 * GET  /dashboard/login      - Login page
 */
/**
 * Create the request handler (shared between Bun server and Lambda)
 */
/**
 * Interface for fetching binary data from storage (S3 in prod, mock in tests)
 */
export interface BinaryStorage {
  getObject(key: string): Promise<Buffer>
}

export function createHandler(
  registry: Registry,
  analyticsStorage: AnalyticsStorage,
  zigPackageStorage: ZigPackageStorage,
  baseUrl: string,
  binaryStorage?: BinaryStorage,
): (req: Request) => Promise<Response> {
  return async (req: Request): Promise<Response> => {
    const url = new URL(req.url)
    const path = url.pathname

    // CORS headers for browser access
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }

    // Handle preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders })
    }

    try {
      // CLI user-agent detection — serve install script for curl/wget/etc.
      const ua = req.headers.get('user-agent') || ''
      const isCLI = /^(curl|wget|httpie|fetch|libfetch|powershell)/i.test(ua) || !ua

      if (isCLI && (path === '/' || path === '')) {
        try {
          const script = await Bun.file(resolve(__dirname, '../../../public/install.sh')).text()
          return new Response(script, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
        }
        catch {
          return new Response('Install script not found', { status: 404 })
        }
      }

      // Health check
      if (path === '/health') {
        return Response.json({ status: 'ok', timestamp: new Date().toISOString() }, { headers: corsHeaders })
      }

      // Search — serve HTML for browsers, JSON for API clients
      if (path === '/search' && req.method === 'GET') {
        const accept = req.headers.get('accept') || ''
        // Serve JSON only if explicitly requesting JSON (API clients)
        const wantsJson = accept.includes('application/json') && !accept.includes('text/html')
        if (wantsJson) {
          const query = url.searchParams.get('q') || ''
          const limit = Number.parseInt(url.searchParams.get('limit') || '20', 10)
          const results = await registry.search(query, limit)
          return Response.json({ results }, { headers: corsHeaders })
        }
        // Default to HTML for browsers
        const q = url.searchParams.get('q') || ''
        const sort = url.searchParams.get('sort') || 'relevance'
        const view = url.searchParams.get('view') || 'list'
        return await handleSiteSearch(q, registry, binaryStorage, analyticsStorage, sort, view)
      }

      // Publish
      if (path === '/publish' && req.method === 'POST') {
        return handlePublish(req, registry, corsHeaders)
      }

      // Stripe webhook
      if (path === '/webhooks/stripe' && req.method === 'POST') {
        const signature = req.headers.get('stripe-signature')
        if (!signature) {
          return Response.json({ error: 'Missing stripe-signature header' }, { status: 400, headers: corsHeaders })
        }
        try {
          const rawBody = await req.text()
          const result = await handleStripeWebhook(registry.metadata, rawBody, signature)
          return Response.json(result, { headers: corsHeaders })
        }
        catch (err: any) {
          return Response.json({ error: err.message }, { status: 400, headers: corsHeaders })
        }
      }

      // Category analytics API (JSON endpoints)
      const categoryApiMatch = path.match(/^\/api\/analytics\/(install|install-on-request|build-error)\/(30|90|365)d\.json$/)
      if (categoryApiMatch && req.method === 'GET') {
        const category = categorySlugMap[categoryApiMatch[1]]
        const days = Number.parseInt(categoryApiMatch[2], 10) as 30 | 90 | 365
        const result = await analyticsStorage.getCategoryAnalytics(category, days)
        return Response.json(result, {
          headers: { ...corsHeaders, 'Cache-Control': 'public, max-age=3600' },
        })
      }

      // POST /analytics/events
      if (path === '/analytics/events' && req.method === 'POST') {
        return handleAnalyticsEvent(req, analyticsStorage, corsHeaders)
      }

      // Analytics routes
      const analyticsMatch = path.match(/^\/analytics(?:\/(.+))?$/)
      if (analyticsMatch && req.method === 'GET') {
        return handleAnalytics(analyticsMatch[1], url, analyticsStorage, corsHeaders)
      }

      // Commit publish routes (pkg-pr-new equivalent)
      if (path === '/publish/commit' && req.method === 'POST') {
        return handleCommitPublish(req, registry, baseUrl, corsHeaders)
      }

      // GET /commits/{sha} - List all packages for a commit
      // GET /commits/{sha}/{name} - Get commit package metadata
      // GET /commits/{sha}/{name}/tarball - Download commit tarball
      const commitMatch = path.match(/^\/commits\/([a-f0-9]+)(?:\/((?:@[^/]+\/[^/]+)|(?:[^@/][^/]*)))?(?:\/(tarball))?$/)
      if (commitMatch && req.method === 'GET') {
        const sha = commitMatch[1]
        const packageName = commitMatch[2] ? decodeURIComponent(commitMatch[2]) : undefined
        const action = commitMatch[3]

        // GET /commits/{sha}/{name}/tarball
        if (packageName && action === 'tarball') {
          const tarball = await registry.downloadCommitTarball(sha, packageName)
          if (!tarball) {
            return Response.json(
              { error: 'Commit package not found' },
              { status: 404, headers: corsHeaders },
            )
          }
          const safeName = packageName.replaceAll('@', '').replaceAll('/', '-')
          return new Response(tarball, {
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/gzip',
              'Content-Disposition': `attachment; filename="${safeName}-${sha.slice(0, 7)}.tgz"`,
            },
          })
        }

        // GET /commits/{sha}/{name}
        if (packageName && !action) {
          const publish = await registry.getCommitPackage(sha, packageName)
          if (!publish) {
            return Response.json(
              { error: 'Commit package not found' },
              { status: 404, headers: corsHeaders },
            )
          }
          return Response.json(publish, { headers: corsHeaders })
        }

        // GET /commits/{sha}
        if (!packageName) {
          const summary = await registry.getCommitPackages(sha)
          if (!summary) {
            return Response.json(
              { error: 'No packages found for this commit' },
              { status: 404, headers: corsHeaders },
            )
          }
          return Response.json(summary, { headers: corsHeaders })
        }
      }

      // Zig package routes
      if (path.startsWith('/zig/')) {
        const zigResponse = await handleZigRoutes(path, req, url, zigPackageStorage, baseUrl, corsHeaders)
        if (zigResponse) {
          return zigResponse
        }
      }

      // npm bulk resolution
      if (path === '/npm/resolve' && req.method === 'POST') {
        return handleNpmResolve(req, corsHeaders)
      }
      if (path.startsWith('/npm/resolve/') && req.method === 'GET') {
        return handleNpmResolveGet(path, corsHeaders)
      }

      // Binary proxy routes — proxy pantry binary tarballs from S3
      if (path.startsWith('/binaries/')) {
        return handleBinaryProxy(path, req, analyticsStorage, corsHeaders, binaryStorage)
      }

      // Dashboard routes
      if (path.startsWith('/dashboard')) {
        return handleDashboard(path, req, url, analyticsStorage, corsHeaders)
      }

      // Package routes
      const packageMatch = path.match(/^\/packages\/(@[^/]+\/[^/]+|[^/]+)(?:\/(.+))?$/)
      if (packageMatch) {
        const packageName = decodeURIComponent(packageMatch[1])
        const rest = packageMatch[2]

        // GET /packages/{name}/versions
        if (rest === 'versions' && req.method === 'GET') {
          const versions = await registry.listVersions(packageName)
          return Response.json({ versions }, { headers: corsHeaders })
        }

        // GET /packages/{name}/paywall — get paywall info
        if (rest === 'paywall' && req.method === 'GET') {
          const paywall = await registry.metadata.getPaywall(packageName)
          if (!paywall || !paywall.enabled) {
            return Response.json({ enabled: false }, { headers: corsHeaders })
          }
          return Response.json({
            enabled: true,
            price: paywall.price,
            currency: paywall.currency,
            formattedPrice: formatPrice(paywall.price, paywall.currency),
            freeVersions: paywall.freeVersions || [],
          }, { headers: corsHeaders })
        }

        // POST /packages/{name}/paywall — configure paywall (requires publish token)
        if (rest === 'paywall' && req.method === 'POST') {
          const authResult = validateToken(req.headers.get('authorization'))
          if (!authResult.valid) {
            return Response.json({ error: authResult.error }, { status: 401, headers: corsHeaders })
          }

          const body = await req.json() as { price: number, currency?: string, freeVersions?: string[], trialDays?: number }
          if (!body.price || typeof body.price !== 'number' || body.price < 100) {
            return Response.json({ error: 'Price must be at least 100 cents ($1.00)' }, { status: 400, headers: corsHeaders })
          }

          const paywall = await configurePaywall(registry.metadata, packageName, body)
          return Response.json({
            success: true,
            paywall: {
              enabled: paywall.enabled,
              price: paywall.price,
              currency: paywall.currency,
              formattedPrice: formatPrice(paywall.price, paywall.currency),
            },
          }, { status: 200, headers: corsHeaders })
        }

        // DELETE /packages/{name}/paywall — remove paywall (requires publish token)
        if (rest === 'paywall' && req.method === 'DELETE') {
          const authResult = validateToken(req.headers.get('authorization'))
          if (!authResult.valid) {
            return Response.json({ error: authResult.error }, { status: 401, headers: corsHeaders })
          }
          await registry.metadata.deletePaywall(packageName)
          return Response.json({ success: true }, { headers: corsHeaders })
        }

        // GET /packages/{name}/checkout — create Stripe checkout session
        if (rest === 'checkout' && req.method === 'GET') {
          const token = url.searchParams.get('token')
          if (!token) {
            return Response.json(
              { error: 'Token required — run `pantry auth login` first' },
              { status: 400, headers: corsHeaders },
            )
          }
          try {
            const session = await createCheckoutSession(registry.metadata, packageName, token, baseUrl)
            // Redirect browser to Stripe Checkout
            return new Response(null, {
              status: 302,
              headers: { ...corsHeaders, Location: session.url },
            })
          }
          catch (err: any) {
            return Response.json({ error: err.message }, { status: 400, headers: corsHeaders })
          }
        }

        // GET /packages/{name}/checkout/success — post-payment landing
        if (rest === 'checkout/success' && req.method === 'GET') {
          const html = `<!DOCTYPE html>
<html><head><title>Payment Successful</title></head>
<body style="font-family: system-ui; max-width: 480px; margin: 80px auto; text-align: center;">
<h1>Payment Successful</h1>
<p>You now have access to <strong>${packageName}</strong>.</p>
<p>Run <code>pantry install ${packageName}</code> to install it.</p>
</body></html>`
          return htmlResponse(html)
        }

        // GET /packages/{name}/{version}/tarball
        if (rest?.endsWith('/tarball') && req.method === 'GET') {
          const version = rest.replace('/tarball', '')

          // Check paywall before serving tarball
          const authToken = extractBearerToken(req.headers.get('authorization'))
            || url.searchParams.get('token')
          const access = await checkPaywallAccess(registry.metadata, packageName, version, authToken)
          if (!access.allowed && access.paywall) {
            const checkoutUrl = `${baseUrl}/packages/${encodeURIComponent(packageName)}/checkout`
            return Response.json(
              {
                error: 'Payment required',
                package: packageName,
                price: access.paywall.price,
                currency: access.paywall.currency,
                formattedPrice: formatPrice(access.paywall.price, access.paywall.currency),
                checkoutUrl,
                message: `This package requires payment (${formatPrice(access.paywall.price, access.paywall.currency)}). Visit ${checkoutUrl} to purchase access, or run: pantry auth login`,
              },
              { status: 402, headers: corsHeaders },
            )
          }

          const tarball = await registry.downloadTarball(packageName, version)

          if (!tarball) {
            return Response.json(
              { error: 'Package not found' },
              { status: 404, headers: corsHeaders },
            )
          }

          // Track download
          await analyticsStorage.trackDownload({
            packageName,
            version,
            timestamp: new Date().toISOString(),
            userAgent: req.headers.get('user-agent') || undefined,
          })

          return new Response(tarball, {
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/gzip',
              'Content-Disposition': `attachment; filename="${packageName}-${version}.tgz"`,
            },
          })
        }

        // GET /packages/{name}/{version}
        if (rest && !rest.includes('/') && req.method === 'GET') {
          const metadata = await registry.getPackage(packageName, rest)
          if (!metadata) {
            // Track all missing version requests, tagging whether the version is known
            analyticsStorage.trackMissingVersion(
              packageName,
              rest,
              req.headers.get('user-agent') || undefined,
              isKnownVersion(packageName, rest),
            ).catch(() => {}) // fire-and-forget
            return Response.json(
              { error: 'Package version not found' },
              { status: 404, headers: corsHeaders },
            )
          }
          return Response.json(metadata, { headers: corsHeaders })
        }

        // GET /packages/{name}
        if (!rest && req.method === 'GET') {
          const metadata = await registry.getPackage(packageName)
          if (!metadata) {
            return Response.json(
              { error: 'Package not found' },
              { status: 404, headers: corsHeaders },
            )
          }
          return Response.json(metadata, { headers: corsHeaders })
        }
      }

      // ================================================================
      // Site routes — public pantry.dev pages
      // ================================================================

      // Homepage
      if (path === '/' || path === '') {
        return await handleSiteHome(binaryStorage, analyticsStorage)
      }

      // Package detail page
      const sitePkgMatch = path.match(/^\/package\/(.+)$/)
      if (sitePkgMatch) {
        const name = decodeURIComponent(sitePkgMatch[1])
        return await handleSitePackage(name, analyticsStorage, binaryStorage, registry)
      }

      // Compare page
      if (path === '/compare') {
        const packagesParam = url.searchParams.get('packages') || ''
        return await handleSiteCompare(packagesParam, analyticsStorage, binaryStorage)
      }

      // Stats page
      if (path === '/stats') {
        return await handleSiteStats(analyticsStorage)
      }

      // Docs — serve bunpress-built static docs
      if (path === '/docs' || path.startsWith('/docs/')) {
        return await handleDocs(path)
      }

      // Static pages
      if (path === '/about') return htmlResponse(await renderSitePage('about.stx', { title: 'About', canonicalUrl: 'https://pantry.dev/about' }))
      if (path === '/privacy') return htmlResponse(await renderSitePage('privacy.stx', { title: 'Privacy Policy', canonicalUrl: 'https://pantry.dev/privacy' }))
      if (path === '/accessibility') return htmlResponse(await renderSitePage('accessibility.stx', { title: 'Accessibility', canonicalUrl: 'https://pantry.dev/accessibility' }))

      // API 404 (JSON) for /api/* and /packages/* paths
      if (path.startsWith('/api/') || path.startsWith('/packages/') || path.startsWith('/analytics/')) {
        return Response.json(
          { error: 'Not found' },
          { status: 404, headers: corsHeaders },
        )
      }

      // HTML 404 for everything else
      return htmlResponse(await renderSitePage('404.stx', { title: 'Not Found' }), 404)
    }
    catch (error) {
      console.error('Server error:', error)
      return Response.json(
        { error: 'Internal server error' },
        { status: 500, headers: corsHeaders },
      )
    }
  }
}

export function createServer(
  registry: Registry,
  port = 3000,
  analytics?: AnalyticsStorage,
  zigStorage?: ZigPackageStorage,
  binaryStorage?: BinaryStorage,
): { start: () => void, stop: () => void } {
  let server: ReturnType<typeof Bun.serve> | null = null
  const analyticsStorage = analytics || createAnalytics()
  const zigPackageStorage = zigStorage || createZigStorage()
  const baseUrl = process.env.BASE_URL || `http://localhost:${port}`
  const handler = createHandler(registry, analyticsStorage, zigPackageStorage, baseUrl, binaryStorage)

  const start = () => {
    server = Bun.serve({
      port,
      fetch: handler,
    })

    console.log(`Pantry Registry running at http://localhost:${port}`)
    console.log('Endpoints:')
    console.log('  GET  /packages/{name}           - Get package metadata')
    console.log('  GET  /packages/{name}/{version} - Get specific version')
    console.log('  GET  /packages/{name}/{version}/tarball - Download tarball')
    console.log('  GET  /packages/{name}/versions  - List versions')
    console.log('  GET  /search?q={query}          - Search packages')
    console.log('  POST /publish                   - Publish package')
    console.log('  GET  /analytics/{name}          - Package download stats')
    console.log('  GET  /analytics/{name}/timeline - Download timeline')
    console.log('  GET  /analytics/{name}/requested-versions - Most-requested missing versions')
    console.log('  GET  /analytics/top             - Top downloaded packages')
    console.log('  GET  /analytics/{category}/{30d,90d,365d} - Category analytics')
    console.log('  GET  /api/analytics/{category}/{period}.json - Category analytics (JSON API)')
    console.log('  POST /analytics/events          - Report analytics event')
    console.log('  Categories: install, install-on-request, build-error')
    console.log('Commit packages (pkg-pr-new equivalent):')
    console.log('  POST /publish/commit               - Publish from a commit')
    console.log('  GET  /commits/{sha}                - List packages for a commit')
    console.log('  GET  /commits/{sha}/{name}         - Get commit package metadata')
    console.log('  GET  /commits/{sha}/{name}/tarball  - Download commit tarball')
    console.log('Zig packages:')
    console.log('  GET  /zig/packages/{name}       - Get Zig package metadata')
    console.log('  GET  /zig/packages/{name}/{version}/tarball - Download')
    console.log('  GET  /zig/hash/{hash}           - Lookup by content hash')
    console.log('  GET  /zig/search?q={query}      - Search Zig packages')
    console.log('  POST /zig/publish               - Publish Zig package')
    console.log('  GET  /health                    - Health check')
    console.log('npm bulk resolution:')
    console.log('  POST /npm/resolve               - Resolve transitive deps')
    console.log('  GET  /npm/resolve/{specs}        - GET variant (name@constraint,...)')
    console.log('Binary proxy (pantry CLI):')
    console.log('  GET  /binaries/{domain}/metadata.json  - Package metadata')
    console.log('  GET  /binaries/{domain}/{ver}/{plat}/*  - Tarball/checksum')
    console.log('Dashboard:')
    console.log('  GET  /dashboard                 - Analytics overview')
    console.log('  GET  /dashboard/requested-versions - Missing version requests')
    console.log('  GET  /dashboard/package/{name}   - Package detail')
    console.log('  GET  /dashboard/login            - Login')
  }

  const stop = () => {
    if (server) {
      server.stop()
      server = null
    }
  }

  return { start, stop }
}

/**
 * Handle analytics requests
 */
async function handleAnalytics(
  path: string | undefined,
  url: URL,
  analytics: AnalyticsStorage,
  corsHeaders: Record<string, string>,
): Promise<Response> {
  // GET /analytics/{category}/{30d,90d,365d}
  const categoryMatch = path?.match(/^(install|install-on-request|build-error)\/(30|90|365)d$/)
  if (categoryMatch) {
    const category = categorySlugMap[categoryMatch[1]]
    const days = Number.parseInt(categoryMatch[2], 10) as 30 | 90 | 365
    const result = await analytics.getCategoryAnalytics(category, days)
    return Response.json(result, {
      headers: { ...corsHeaders, 'Cache-Control': 'public, max-age=3600' },
    })
  }

  // GET /analytics/top
  if (path === 'top' || !path) {
    const limit = Number.parseInt(url.searchParams.get('limit') || '10', 10)
    const packages = await analytics.getTopPackages(limit)
    return Response.json({ packages }, { headers: corsHeaders })
  }

  // GET /analytics/{name}/requested-versions
  if (path.endsWith('/requested-versions')) {
    const packageName = decodeURIComponent(path.replace('/requested-versions', ''))
    const limit = Number.parseInt(url.searchParams.get('limit') || '20', 10)
    const requests = await analytics.getMissingVersionRequests(packageName, limit)
    return Response.json({ packageName, requests }, { headers: corsHeaders })
  }

  // GET /analytics/{name}/timeline
  if (path.endsWith('/timeline')) {
    const packageName = decodeURIComponent(path.replace('/timeline', ''))
    const days = Number.parseInt(url.searchParams.get('days') || '30', 10)
    const timeline = await analytics.getDownloadTimeline(packageName, days)
    return Response.json({ packageName, timeline }, { headers: corsHeaders })
  }

  // GET /analytics/{name}
  const packageName = decodeURIComponent(path)
  const stats = await analytics.getPackageStats(packageName)

  if (!stats) {
    return Response.json(
      { error: 'No analytics data for this package' },
      { status: 404, headers: corsHeaders },
    )
  }

  return Response.json(stats, { headers: corsHeaders })
}

/**
 * Handle POST /analytics/events
 */
async function handleAnalyticsEvent(
  req: Request,
  analytics: AnalyticsStorage,
  corsHeaders: Record<string, string>,
): Promise<Response> {
  try {
    const body = await req.json() as { packageName?: string, category?: string, version?: string }
    const { packageName, category, version } = body

    if (!packageName || typeof packageName !== 'string') {
      return Response.json(
        { error: 'Missing or invalid packageName' },
        { status: 400, headers: corsHeaders },
      )
    }

    if (!category || !['install', 'install_on_request', 'build_error', 'download'].includes(category)) {
      return Response.json(
        { error: 'Missing or invalid category. Must be one of: install, install_on_request, build_error, download' },
        { status: 400, headers: corsHeaders },
      )
    }

    // 'download' category tracks both download stats and install event
    if (category === 'download') {
      await Promise.all([
        analytics.trackDownload({
          packageName,
          version: version || 'unknown',
          timestamp: new Date().toISOString(),
          userAgent: req.headers.get('user-agent') || undefined,
        }),
        analytics.trackEvent({
          packageName,
          category: 'install' as AnalyticsCategory,
          timestamp: new Date().toISOString(),
          version: version || undefined,
        }),
      ])
    }
    else {
      await analytics.trackEvent({
        packageName,
        category: category as AnalyticsCategory,
        timestamp: new Date().toISOString(),
        version: version || undefined,
      })
    }

    return Response.json({ success: true }, { headers: corsHeaders })
  }
  catch {
    return Response.json(
      { error: 'Invalid JSON body' },
      { status: 400, headers: corsHeaders },
    )
  }
}

// Simple token for authentication (replace with proper auth in production)
const REGISTRY_TOKEN = process.env.PANTRY_REGISTRY_TOKEN || process.env.PANTRY_TOKEN || 'ABCD1234'

/**
 * Extract bearer token from Authorization header (returns null if not present)
 */
function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader) return null
  return authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader
}

/**
 * Validate authorization token
 */
function validateToken(authHeader: string | null): { valid: boolean, error?: string } {
  if (!authHeader) {
    return { valid: false, error: 'Authorization required' }
  }

  // Support "Bearer <token>" format
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : authHeader

  if (token !== REGISTRY_TOKEN) {
    return { valid: false, error: 'Invalid token' }
  }

  return { valid: true }
}

/**
 * Handle package publish
 */
async function handlePublish(
  req: Request,
  registry: Registry,
  corsHeaders: Record<string, string>,
): Promise<Response> {
  const contentType = req.headers.get('content-type') || ''

  // Validate token
  const authHeader = req.headers.get('authorization')
  const authResult = validateToken(authHeader)
  if (!authResult.valid) {
    return Response.json(
      { error: authResult.error },
      { status: 401, headers: corsHeaders },
    )
  }

  // Handle multipart/form-data
  if (contentType.includes('multipart/form-data')) {
    const formData = await req.formData()
    const metadataStr = formData.get('metadata')
    const tarballFile = formData.get('tarball')

    if (!metadataStr || typeof metadataStr !== 'string') {
      return Response.json(
        { error: 'Missing metadata' },
        { status: 400, headers: corsHeaders },
      )
    }

    if (!tarballFile || !(tarballFile instanceof File)) {
      return Response.json(
        { error: 'Missing tarball' },
        { status: 400, headers: corsHeaders },
      )
    }

    const metadata = JSON.parse(metadataStr)
    const tarball = await tarballFile.arrayBuffer()

    // Check if version already exists
    const exists = await registry.exists(metadata.name, metadata.version)
    if (exists) {
      return Response.json(
        { error: 'Version already exists' },
        { status: 409, headers: corsHeaders },
      )
    }

    await registry.publish(metadata, tarball)

    return Response.json(
      { success: true, message: `Published ${metadata.name}@${metadata.version}` },
      { status: 201, headers: corsHeaders },
    )
  }

  // Handle JSON with base64 tarball (alternative)
  if (contentType.includes('application/json')) {
    const body = await req.json() as { metadata?: any, tarball?: string }
    const { metadata, tarball: tarballBase64 } = body

    if (!metadata || !tarballBase64) {
      return Response.json(
        { error: 'Missing metadata or tarball' },
        { status: 400, headers: corsHeaders },
      )
    }

    const tarball = Uint8Array.from(atob(tarballBase64), c => c.charCodeAt(0)).buffer

    const exists = await registry.exists(metadata.name, metadata.version)
    if (exists) {
      return Response.json(
        { error: 'Version already exists' },
        { status: 409, headers: corsHeaders },
      )
    }

    await registry.publish(metadata, tarball)

    return Response.json(
      { success: true, message: `Published ${metadata.name}@${metadata.version}` },
      { status: 201, headers: corsHeaders },
    )
  }

  return Response.json(
    { error: 'Unsupported content type' },
    { status: 415, headers: corsHeaders },
  )
}

/**
 * Handle POST /publish/commit — publish packages from a git commit
 * Accepts multipart/form-data with:
 *   - packages[]: tarball files
 *   - metadata: JSON string with { sha, repository, packages: [{ name, packageDir, version }] }
 * Or JSON body with:
 *   - sha: commit hash
 *   - repository: repo URL
 *   - packages: [{ name, tarball (base64), packageDir?, version? }]
 */
const MAX_COMMIT_TARBALL_SIZE = 50 * 1024 * 1024 // 50MB per tarball

async function handleCommitPublish(
  req: Request,
  registry: Registry,
  baseUrl: string,
  corsHeaders: Record<string, string>,
): Promise<Response> {
  const contentType = req.headers.get('content-type') || ''

  // Validate token
  const authHeader = req.headers.get('authorization')
  const authResult = validateToken(authHeader)
  if (!authResult.valid) {
    return Response.json(
      { error: authResult.error },
      { status: 401, headers: corsHeaders },
    )
  }

  if (contentType.includes('multipart/form-data')) {
    const formData = await req.formData()
    const metadataStr = formData.get('metadata')

    if (!metadataStr || typeof metadataStr !== 'string') {
      return Response.json(
        { error: 'Missing metadata' },
        { status: 400, headers: corsHeaders },
      )
    }

    const metadata = JSON.parse(metadataStr) as {
      sha: string
      repository?: string
      packages: Array<{ name: string, packageDir?: string, version?: string }>
    }

    if (!metadata.sha || !metadata.packages?.length) {
      return Response.json(
        { error: 'Missing sha or packages in metadata' },
        { status: 400, headers: corsHeaders },
      )
    }

    const results: Array<{ name: string, url: string, sha: string }> = []

    for (const pkg of metadata.packages) {
      const tarballFile = formData.get(`package:${pkg.name}`)
      if (!tarballFile || !(tarballFile instanceof File)) {
        continue
      }

      if (tarballFile.size > MAX_COMMIT_TARBALL_SIZE) {
        return Response.json(
          { error: `Tarball for ${pkg.name} exceeds maximum size of 50MB` },
          { status: 413, headers: corsHeaders },
        )
      }

      const tarball = await tarballFile.arrayBuffer()
      await registry.publishCommit(pkg.name, metadata.sha, tarball, {
        repository: metadata.repository,
        packageDir: pkg.packageDir,
        version: pkg.version,
      })

      results.push({
        name: pkg.name,
        url: `${baseUrl}/commits/${metadata.sha}/${encodeURIComponent(pkg.name)}/tarball`,
        sha: metadata.sha,
      })
    }

    return Response.json(
      {
        success: true,
        sha: metadata.sha,
        packages: results,
        message: `Published ${results.length} package(s) from commit ${metadata.sha.slice(0, 7)}`,
      },
      { status: 201, headers: corsHeaders },
    )
  }

  if (contentType.includes('application/json')) {
    const body = await req.json() as {
      sha: string
      repository?: string
      packages: Array<{ name: string, tarball: string, packageDir?: string, version?: string }>
    }

    if (!body.sha || !body.packages?.length) {
      return Response.json(
        { error: 'Missing sha or packages' },
        { status: 400, headers: corsHeaders },
      )
    }

    const results: Array<{ name: string, url: string, sha: string }> = []

    for (const pkg of body.packages) {
      const tarball = Uint8Array.from(atob(pkg.tarball), c => c.charCodeAt(0)).buffer

      if (tarball.byteLength > MAX_COMMIT_TARBALL_SIZE) {
        return Response.json(
          { error: `Tarball for ${pkg.name} exceeds maximum size of 50MB` },
          { status: 413, headers: corsHeaders },
        )
      }

      await registry.publishCommit(pkg.name, body.sha, tarball, {
        repository: body.repository,
        packageDir: pkg.packageDir,
        version: pkg.version,
      })

      results.push({
        name: pkg.name,
        url: `${baseUrl}/commits/${body.sha}/${encodeURIComponent(pkg.name)}/tarball`,
        sha: body.sha,
      })
    }

    return Response.json(
      {
        success: true,
        sha: body.sha,
        packages: results,
        message: `Published ${results.length} package(s) from commit ${body.sha.slice(0, 7)}`,
      },
      { status: 201, headers: corsHeaders },
    )
  }

  return Response.json(
    { error: 'Unsupported content type' },
    { status: 415, headers: corsHeaders },
  )
}

// ---------------------------------------------------------------------------
// npm bulk dependency resolution
// ---------------------------------------------------------------------------

/** Cache of npm registry metadata (package name -> abbreviated metadata) */
const npmMetadataCache = new Map<string, { data: any, ts: number }>()
const NPM_METADATA_TTL = 5 * 60 * 1000 // 5 minutes

/** Cache of full resolution results (input hash -> resolved tree) */
const npmResolutionCache = new Map<string, { data: any, ts: number }>()
const NPM_RESOLUTION_TTL = 5 * 60 * 1000 // 5 minutes

async function fetchNpmMetadata(name: string): Promise<any> {
  const cached = npmMetadataCache.get(name)
  if (cached && Date.now() - cached.ts < NPM_METADATA_TTL) {
    return cached.data
  }
  // Scoped packages: @scope/name -> @scope%2fname in URL
  const encodedName = name.startsWith('@') ? `@${encodeURIComponent(name.slice(1))}` : encodeURIComponent(name)
  const res = await fetch(`https://registry.npmjs.org/${encodedName}`, {
    headers: { 'Accept': 'application/vnd.npm.install-v1+json' },
  })
  if (!res.ok) {
    throw new Error(`npm registry returned ${res.status} for ${name}`)
  }
  const data = await res.json()
  npmMetadataCache.set(name, { data, ts: Date.now() })
  return data
}

/**
 * Parse a semver version string into [major, minor, patch] numbers.
 * Returns null for unparseable strings.
 */
function parseSemver(v: string): [number, number, number] | null {
  const m = v.match(/^(\d+)\.(\d+)\.(\d+)/)
  if (!m) return null
  return [Number(m[1]), Number(m[2]), Number(m[3])]
}

/** Compare two semver tuples. Returns <0, 0, or >0. */
function compareSemver(a: [number, number, number], b: [number, number, number]): number {
  for (let i = 0; i < 3; i++) {
    if (a[i] !== b[i]) return a[i] - b[i]
  }
  return 0
}

function semverGte(v: [number, number, number], target: [number, number, number]): boolean {
  return compareSemver(v, target) >= 0
}

function semverLt(v: [number, number, number], target: [number, number, number]): boolean {
  return compareSemver(v, target) < 0
}

/**
 * Check if version satisfies a single constraint like >=1.2.3, <2.0.0, etc.
 */
function satisfiesSingle(version: [number, number, number], constraint: string): boolean {
  const c = constraint.trim()
  if (!c || c === '*' || c === 'latest') return true

  const geMatch = c.match(/^>=\s*(\d+\.\d+\.\d+)/)
  if (geMatch) {
    const target = parseSemver(geMatch[1])
    return target ? semverGte(version, target) : false
  }

  const gtMatch = c.match(/^>\s*(\d+\.\d+\.\d+)/)
  if (gtMatch) {
    const target = parseSemver(gtMatch[1])
    return target ? compareSemver(version, target) > 0 : false
  }

  const leMatch = c.match(/^<=\s*(\d+\.\d+\.\d+)/)
  if (leMatch) {
    const target = parseSemver(leMatch[1])
    return target ? compareSemver(version, target) <= 0 : false
  }

  const ltMatch = c.match(/^<\s*(\d+\.\d+\.\d+)/)
  if (ltMatch) {
    const target = parseSemver(ltMatch[1])
    return target ? semverLt(version, target) : false
  }

  const eqMatch = c.match(/^=?\s*(\d+\.\d+\.\d+)/)
  if (eqMatch) {
    const target = parseSemver(eqMatch[1])
    return target ? compareSemver(version, target) === 0 : false
  }

  return false
}

/**
 * Resolve the best version that satisfies a constraint from a list of available versions.
 * Supports: ^, ~, >=, >, <=, <, exact, *, latest, x-ranges, || (or), space-separated (and).
 */
function resolveVersion(constraint: string, versions: string[], distTags?: Record<string, string>): string | null {
  const c = constraint.trim()

  // Handle 'latest', '*', or empty
  if (!c || c === '*' || c === 'latest' || c === '') {
    return distTags?.latest || versions[versions.length - 1] || null
  }

  // Handle dist-tag references (e.g. "next", "canary")
  if (distTags && distTags[c]) {
    return distTags[c]
  }

  // Handle npm: alias — npm:actual-package@version
  if (c.startsWith('npm:')) {
    // The caller handles alias resolution; this shouldn't normally reach here
    return null
  }

  // Handle || (or) ranges: at least one sub-range must match
  if (c.includes('||')) {
    const subRanges = c.split('||')
    let best: [number, number, number] | null = null
    let bestStr: string | null = null
    for (const sub of subRanges) {
      const resolved = resolveVersion(sub.trim(), versions, distTags)
      if (resolved) {
        const parsed = parseSemver(resolved)
        if (parsed && (!best || compareSemver(parsed, best) > 0)) {
          best = parsed
          bestStr = resolved
        }
      }
    }
    return bestStr
  }

  // Handle caret: ^major.minor.patch
  const caretMatch = c.match(/^\^(\d+)(?:\.(\d+))?(?:\.(\d+))?/)
  if (caretMatch) {
    const major = Number(caretMatch[1])
    const minor = caretMatch[2] !== undefined ? Number(caretMatch[2]) : 0
    const patch = caretMatch[3] !== undefined ? Number(caretMatch[3]) : 0
    const floor: [number, number, number] = [major, minor, patch]
    let ceiling: [number, number, number]
    if (major !== 0) {
      ceiling = [major + 1, 0, 0]
    }
else if (minor !== 0) {
      ceiling = [0, minor + 1, 0]
    }
else {
      ceiling = [0, 0, patch + 1]
    }
    return findBest(versions, floor, ceiling)
  }

  // Handle tilde: ~major.minor.patch
  const tildeMatch = c.match(/^~(\d+)(?:\.(\d+))?(?:\.(\d+))?/)
  if (tildeMatch) {
    const major = Number(tildeMatch[1])
    const minor = tildeMatch[2] !== undefined ? Number(tildeMatch[2]) : 0
    const patch = tildeMatch[3] !== undefined ? Number(tildeMatch[3]) : 0
    const floor: [number, number, number] = [major, minor, patch]
    const ceiling: [number, number, number] = [major, minor + 1, 0]
    return findBest(versions, floor, ceiling)
  }

  // Handle x-ranges: 1.x, 1.2.x, 1.x.x
  const xRangeMatch = c.match(/^(\d+)(?:\.(x|\*|\d+))?(?:\.(x|\*|\d+))?$/)
  if (xRangeMatch && (c.includes('x') || c.includes('*') || !c.includes('.'))) {
    const major = Number(xRangeMatch[1])
    if (!xRangeMatch[2] || xRangeMatch[2] === 'x' || xRangeMatch[2] === '*') {
      return findBest(versions, [major, 0, 0], [major + 1, 0, 0])
    }
    const minor = Number(xRangeMatch[2])
    if (!xRangeMatch[3] || xRangeMatch[3] === 'x' || xRangeMatch[3] === '*') {
      return findBest(versions, [major, minor, 0], [major, minor + 1, 0])
    }
  }

  // Handle space-separated AND ranges: >=1.0.0 <2.0.0
  // Split on spaces but keep operators attached to their versions
  const parts = c.match(/(>=?|<=?|=)?\s*\d+\.\d+\.\d+/g)
  if (parts && parts.length > 1) {
    let best: string | null = null
    let bestParsed: [number, number, number] | null = null
    for (const v of versions) {
      const parsed = parseSemver(v)
      if (!parsed) continue
      // Skip pre-release versions
      if (v.includes('-')) continue
      let allMatch = true
      for (const part of parts) {
        if (!satisfiesSingle(parsed, part.trim())) {
          allMatch = false
          break
        }
      }
      if (allMatch && (!bestParsed || compareSemver(parsed, bestParsed) > 0)) {
        best = v
        bestParsed = parsed
      }
    }
    return best
  }

  // Handle exact version
  const exactMatch = c.match(/^=?\s*(\d+\.\d+\.\d+)/)
  if (exactMatch) {
    const target = exactMatch[1]
    return versions.includes(target) ? target : null
  }

  // Handle single constraint (>=, >, <=, <)
  if (c.startsWith('>') || c.startsWith('<')) {
    let best: string | null = null
    let bestParsed: [number, number, number] | null = null
    for (const v of versions) {
      const parsed = parseSemver(v)
      if (!parsed || v.includes('-')) continue
      if (satisfiesSingle(parsed, c) && (!bestParsed || compareSemver(parsed, bestParsed) > 0)) {
        best = v
        bestParsed = parsed
      }
    }
    return best
  }

  return null
}

/** Find highest version in [floor, ceiling) */
function findBest(versions: string[], floor: [number, number, number], ceiling: [number, number, number]): string | null {
  let best: string | null = null
  let bestParsed: [number, number, number] | null = null
  for (const v of versions) {
    const parsed = parseSemver(v)
    if (!parsed) continue
    // Skip pre-release versions unless explicitly requested
    if (v.includes('-')) continue
    if (semverGte(parsed, floor) && semverLt(parsed, ceiling)) {
      if (!bestParsed || compareSemver(parsed, bestParsed) > 0) {
        best = v
        bestParsed = parsed
      }
    }
  }
  return best
}

interface ResolvedPackage {
  version: string
  tarball: string
  integrity: string
  dependencies?: Record<string, string>
}

/**
 * Resolve all transitive npm dependencies via BFS.
 */
async function resolveNpmDeps(
  inputDeps: Record<string, string>,
): Promise<Record<string, ResolvedPackage>> {
  const resolved = new Map<string, ResolvedPackage>()
  const visiting = new Set<string>() // circular dep guard

  // Queue items: [packageName, versionConstraint]
  const queue: Array<[string, string]> = []
  for (const [name, constraint] of Object.entries(inputDeps)) {
    queue.push([name, constraint])
  }

  while (queue.length > 0) {
    // Process in batches of 20
    const batch = queue.splice(0, 20)
    const toFetch: Array<[string, string]> = []

    for (const [name, constraint] of batch) {
      // Handle npm aliases: "npm:actual-package@^1.0.0"
      let actualName = name
      let actualConstraint = constraint
      if (constraint.startsWith('npm:')) {
        const aliasMatch = constraint.match(/^npm:(@?[^@]+)@(.+)$/)
        if (aliasMatch) {
          actualName = aliasMatch[1]
          actualConstraint = aliasMatch[2]
        }
      }

      // Skip if already resolved or being visited (circular)
      if (resolved.has(actualName) || visiting.has(actualName)) continue

      // Skip URL/git/file dependencies
      if (actualConstraint.startsWith('http') || actualConstraint.startsWith('git') || actualConstraint.startsWith('file:')) continue

      visiting.add(actualName)
      toFetch.push([actualName, actualConstraint])
    }

    if (toFetch.length === 0) continue

    // Fetch metadata concurrently
    const results = await Promise.allSettled(
      toFetch.map(async ([name, constraint]) => {
        const metadata = await fetchNpmMetadata(name)
        return { name, constraint, metadata }
      }),
    )

    for (const result of results) {
      if (result.status === 'rejected') continue
      const { name, constraint, metadata } = result.value

      const allVersions = Object.keys(metadata.versions || {})
      const bestVersion = resolveVersion(constraint, allVersions, metadata['dist-tags'])

      if (!bestVersion || !metadata.versions[bestVersion]) {
        visiting.delete(name)
        continue
      }

      const versionData = metadata.versions[bestVersion]
      const dist = versionData.dist || {}

      const entry: ResolvedPackage = {
        version: bestVersion,
        tarball: dist.tarball || `https://registry.npmjs.org/${name}/-/${name.split('/').pop()}-${bestVersion}.tgz`,
        integrity: dist.integrity || dist.shasum || '',
      }

      // Collect runtime + peer deps (skip dev deps for transitive)
      const deps: Record<string, string> = {
        ...(versionData.dependencies || {}),
        ...(versionData.peerDependencies || {}),
      }

      // Remove optional peer deps
      const peerMeta = versionData.peerDependenciesMeta || {}
      for (const [peerName, meta] of Object.entries(peerMeta)) {
        if ((meta as any)?.optional) {
          delete deps[peerName]
        }
      }

      if (Object.keys(deps).length > 0) {
        entry.dependencies = deps
        // Add transitive deps to queue
        for (const [depName, depConstraint] of Object.entries(deps)) {
          if (!resolved.has(depName) && !visiting.has(depName)) {
            queue.push([depName, depConstraint])
          }
        }
      }

      resolved.set(name, entry)
    }
  }

  // Convert to plain object
  const result: Record<string, ResolvedPackage> = {}
  for (const [name, entry] of resolved) {
    result[name] = entry
  }
  return result
}

function hashDeps(deps: Record<string, string>): string {
  const sorted = Object.entries(deps).sort(([a], [b]) => a.localeCompare(b))
  // Use a simple string hash
  const str = JSON.stringify(sorted)
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + chr
    hash |= 0
  }
  return hash.toString(36)
}

async function handleNpmResolve(req: Request, corsHeaders: Record<string, string>): Promise<Response> {
  try {
    const body = await req.json() as { dependencies?: Record<string, string> }
    const deps = body?.dependencies
    if (!deps || typeof deps !== 'object' || Object.keys(deps).length === 0) {
      return Response.json(
        { error: 'Missing or empty "dependencies" object in request body' },
        { status: 400, headers: corsHeaders },
      )
    }

    // Check resolution cache
    const cacheKey = hashDeps(deps)
    const cached = npmResolutionCache.get(cacheKey)
    if (cached && Date.now() - cached.ts < NPM_RESOLUTION_TTL) {
      return Response.json(cached.data, {
        headers: { ...corsHeaders, 'X-Cache': 'HIT' },
      })
    }

    const resolved = await resolveNpmDeps(deps)
    const responseData = { resolved }

    // Cache the result
    npmResolutionCache.set(cacheKey, { data: responseData, ts: Date.now() })

    // Evict old cache entries periodically
    if (npmResolutionCache.size > 1000) {
      const now = Date.now()
      for (const [key, val] of npmResolutionCache) {
        if (now - val.ts > NPM_RESOLUTION_TTL) {
          npmResolutionCache.delete(key)
        }
      }
    }

    return Response.json(responseData, {
      headers: { ...corsHeaders, 'X-Cache': 'MISS' },
    })
  }
  catch (error) {
    console.error('npm resolve error:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to resolve npm dependencies' },
      { status: 500, headers: corsHeaders },
    )
  }
}

async function handleNpmResolveGet(path: string, corsHeaders: Record<string, string>): Promise<Response> {
  try {
    // /npm/resolve/react@^16,react-dom@^16
    const specStr = decodeURIComponent(path.replace('/npm/resolve/', ''))
    if (!specStr) {
      return Response.json(
        { error: 'No package specs provided. Use /npm/resolve/name@constraint,name2@constraint2' },
        { status: 400, headers: corsHeaders },
      )
    }

    const deps: Record<string, string> = {}
    for (const spec of specStr.split(',')) {
      const trimmed = spec.trim()
      if (!trimmed) continue

      // Handle scoped packages: @scope/name@^1.0.0
      let name: string
      let constraint: string
      if (trimmed.startsWith('@')) {
        // Scoped: find the second @ for the version
        const secondAt = trimmed.indexOf('@', 1)
        if (secondAt === -1) {
          name = trimmed
          constraint = 'latest'
        }
else {
          name = trimmed.slice(0, secondAt)
          constraint = trimmed.slice(secondAt + 1)
        }
      }
else {
        const atIdx = trimmed.indexOf('@')
        if (atIdx === -1) {
          name = trimmed
          constraint = 'latest'
        }
else {
          name = trimmed.slice(0, atIdx)
          constraint = trimmed.slice(atIdx + 1)
        }
      }
      deps[name] = constraint || 'latest'
    }

    if (Object.keys(deps).length === 0) {
      return Response.json(
        { error: 'No valid package specs found' },
        { status: 400, headers: corsHeaders },
      )
    }

    // Check resolution cache
    const cacheKey = hashDeps(deps)
    const cached = npmResolutionCache.get(cacheKey)
    if (cached && Date.now() - cached.ts < NPM_RESOLUTION_TTL) {
      return Response.json(cached.data, {
        headers: { ...corsHeaders, 'X-Cache': 'HIT' },
      })
    }

    const resolved = await resolveNpmDeps(deps)
    const responseData = { resolved }

    npmResolutionCache.set(cacheKey, { data: responseData, ts: Date.now() })

    return Response.json(responseData, {
      headers: { ...corsHeaders, 'X-Cache': 'MISS' },
    })
  }
  catch (error) {
    console.error('npm resolve GET error:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to resolve npm dependencies' },
      { status: 500, headers: corsHeaders },
    )
  }
}

/**
 * Handle binary proxy requests — stream tarballs/metadata/checksums from S3
 */
async function handleBinaryProxy(
  path: string,
  req: Request,
  analytics: AnalyticsStorage,
  corsHeaders: Record<string, string>,
  storage?: BinaryStorage,
): Promise<Response> {
  if (req.method !== 'GET') {
    return Response.json({ error: 'Method not allowed' }, { status: 405, headers: corsHeaders })
  }

  // Strip leading slash to get S3 key: /binaries/curl.se/metadata.json -> binaries/curl.se/metadata.json
  const s3Key = path.slice(1)

  // Determine content type and cache policy
  const isMetadata = path.endsWith('/metadata.json')
  const isTarball = path.endsWith('.tar.gz')
  const isChecksum = path.endsWith('.sha256')

  const contentType = isMetadata ? 'application/json'
    : isTarball ? 'application/gzip'
    : isChecksum ? 'text/plain'
    : 'application/octet-stream'

  const cacheControl = isMetadata
    ? 'public, max-age=300'
    : (isTarball || isChecksum)
      ? 'public, max-age=86400, immutable'
      : 'public, max-age=300'

  // Use injected storage or fall back to S3
  const binaryStore: BinaryStorage = storage || (() => {
    const s3Bucket = process.env.S3_BUCKET || 'pantry-registry'
    const s3Region = process.env.AWS_REGION || 'us-east-1'
    const s3 = new S3Client(s3Region)
    return { getObject: (key: string) => s3.getObjectBuffer(s3Bucket, key) }
  })()

  try {
    const buffer = await binaryStore.getObject(s3Key)

    // Track tarball downloads fire-and-forget
    if (isTarball) {
      // Extract domain from path: binaries/{domain}/{version}/{platform}/{filename}.tar.gz
      const parts = s3Key.split('/')
      if (parts.length >= 4) {
        const domain = parts[1]
        const version = parts[2]
        analytics.trackDownload({
          packageName: domain,
          version,
          timestamp: new Date().toISOString(),
          userAgent: req.headers.get('user-agent') || undefined,
        }).catch(() => {}) // fire-and-forget
        analytics.trackEvent({
          packageName: domain,
          category: 'install',
          timestamp: new Date().toISOString(),
          version,
        }).catch(() => {}) // fire-and-forget
      }
    }

    return new Response(new Uint8Array(buffer), {
      headers: {
        ...corsHeaders,
        'Content-Type': contentType,
        'Cache-Control': cacheControl,
        'Content-Length': String(buffer.length),
      },
    })
  }
  catch (error) {
    console.error(`Binary proxy error for ${s3Key}:`, error)
    return Response.json(
      { error: 'Not found' },
      { status: 404, headers: corsHeaders },
    )
  }
}

/**
 * Handle dashboard routes — analytics UI (rendered via stx)
 */
const DASHBOARD_TOKEN = process.env.PANTRY_REGISTRY_TOKEN || process.env.PANTRY_TOKEN || 'ABCD1234'

function getDashboardAuth(req: Request, url?: URL): boolean {
  // Check cookie first (direct access / cookie-forwarding CDN)
  const cookieHeader = req.headers.get('cookie') || ''
  // eslint-disable-next-line max-statements-per-line -- semicolon is inside regex, not a statement separator
  const cookieMatch = cookieHeader.match(/pantry_token=([^;]+)/)
  if (cookieMatch && cookieMatch[1] === DASHBOARD_TOKEN)
    return true

  // Check Authorization header (CloudFront forwards this)
  const authHeader = req.headers.get('authorization') || ''
  if (authHeader.startsWith('Bearer ') && authHeader.slice(7) === DASHBOARD_TOKEN) return true

  // Check query parameter (CloudFront forwards query strings)
  if (url) {
    const tokenParam = url.searchParams.get('token')
    if (tokenParam === DASHBOARD_TOKEN) return true
  }

  return false
}

async function handleDashboard(
  path: string,
  req: Request,
  url: URL,
  analytics: AnalyticsStorage,
  corsHeaders: Record<string, string>,
): Promise<Response> {
  const noCacheHeaders = {
    ...corsHeaders,
    'Cache-Control': 'no-cache, no-store',
  }
  const htmlHeaders = { ...noCacheHeaders, 'Content-Type': 'text/html' }

  // Helper to build dashboard URLs that preserve the auth token
  const tokenParam = url.searchParams.get('token') || ''
  // eslint-disable-next-line max-statements-per-line -- semicolon is inside regex, not a statement separator
  const tokenFromCookie = (req.headers.get('cookie') || '').match(/pantry_token=([^;]+)/)?.[1] || ''
  const activeToken = tokenParam || tokenFromCookie
  const qs = activeToken ? `?token=${encodeURIComponent(activeToken)}` : ''
  const qsAmp = activeToken ? `&token=${encodeURIComponent(activeToken)}` : ''

  // Logout
  if (path === '/dashboard/logout') {
    return new Response(null, {
      status: 302,
      headers: {
        ...noCacheHeaders,
        'Location': '/dashboard/login',
        'Set-Cookie': 'pantry_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0',
      },
    })
  }

  // Login page
  if (path === '/dashboard/login') {
    if (req.method === 'POST') {
      const formData = await req.formData()
      const token = formData.get('token') as string
      if (token === DASHBOARD_TOKEN) {
        return new Response(null, {
          status: 302,
          headers: {
            ...noCacheHeaders,
            'Location': `/dashboard?token=${encodeURIComponent(token)}`,
            'Set-Cookie': `pantry_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`,
          },
        })
      }
      const html = await renderDashboardPage('login.stx', { error: 'Invalid token' })
      return new Response(html, { status: 401, headers: htmlHeaders })
    }
    const html = await renderDashboardPage('login.stx', {})
    return new Response(html, { headers: htmlHeaders })
  }

  // Auth gate for all other dashboard routes
  if (!getDashboardAuth(req, url)) {
    return new Response(null, {
      status: 302,
      headers: { ...noCacheHeaders, 'Location': '/dashboard/login' },
    })
  }

  // Dashboard API endpoints (JSON)
  if (path === '/dashboard/api/overview') {
    const topPackages = await analytics.getTopPackages(100)
    return Response.json({ packages: topPackages }, { headers: noCacheHeaders })
  }

  if (path === '/dashboard/api/requested-versions') {
    const allRequests = await analytics.getAllMissingVersionRequests(200)
    return Response.json({ requests: allRequests }, { headers: noCacheHeaders })
  }

  if (path.startsWith('/dashboard/api/package/')) {
    const packageName = decodeURIComponent(path.replace('/dashboard/api/package/', ''))
    const [stats, timeline] = await Promise.all([
      analytics.getPackageStats(packageName),
      analytics.getDownloadTimeline(packageName, 30),
    ])
    return Response.json({ stats, timeline }, { headers: noCacheHeaders })
  }

  // Package detail page
  if (path.startsWith('/dashboard/package/')) {
    const packageName = decodeURIComponent(path.replace('/dashboard/package/', ''))
    const [stats, timeline] = await Promise.all([
      analytics.getPackageStats(packageName),
      analytics.getDownloadTimeline(packageName, 30),
    ])

    // Generate charts via ts-charts
    const timelineData = (timeline || []).map((d: any) => ({ date: d.date, count: d.count || 0 }))
    const lineChart = generateLineChart(timelineData, 600, 200)

    // Version distribution chart
    const versionDownloads = stats?.versionDownloads || {}
    const versionItems = Object.entries(versionDownloads)
      .map(([label, value]) => ({ label, value: value as number }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)
    const versionChart = generateHorizontalBarChart(versionItems, 500, 24, 4, 100)

    const html = await renderDashboardPage('package.stx', { packageName, stats, timeline, lineChart, versionChart, qs, qsAmp })
    return new Response(html, { headers: htmlHeaders })
  }

  // Requested versions page
  if (path === '/dashboard/requested-versions') {
    const allRequests = await analytics.getAllMissingVersionRequests(500)
    const filter = url.searchParams.get('filter') || 'known'
    const page = Math.max(1, Number.parseInt(url.searchParams.get('page') || '1', 10))

    // Top requested packages bar chart
    const pkgCounts = new Map<string, number>()
    for (const r of allRequests) {
      pkgCounts.set(r.packageName, (pkgCounts.get(r.packageName) || 0) + (r.requestCount || 0))
    }
    const topRequested = [...pkgCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([label, value]) => ({ label, value }))
    const requestsChart = generateHorizontalBarChart(topRequested, 600, 24, 4, 140)

    const html = await renderDashboardPage('requested-versions.stx', { requests: allRequests, filter, page, perPage: 25, requestsChart, qs, qsAmp })
    return new Response(html, { headers: htmlHeaders })
  }

  // Overview page (default)
  if (path === '/dashboard' || path === '/dashboard/') {
    const topPackages = await analytics.getTopPackages(100)
    const page = Math.max(1, Number.parseInt(url.searchParams.get('page') || '1', 10))

    // Generate sparklines for visible packages on current page
    const startIdx = (page - 1) * 25
    const visiblePkgs = topPackages.slice(startIdx, startIdx + 25)
    const pkgsWithSparklines = await Promise.all(
      visiblePkgs.map(async (pkg) => {
        const tl = await analytics.getDownloadTimeline(pkg.name, 14).catch(() => [])
        const sparkData = (tl || []).map((d: any) => d.count || 0)
        const sparkline = generateSparkline(sparkData, 80, 24)
        return { ...pkg, sparklinePath: sparkline.path, sparklineAreaPath: sparkline.areaPath }
      }),
    )

    // Build aggregate timeline for global chart from top 15 packages
    const allTimelines = await Promise.all(
      topPackages.slice(0, 15).map(async (pkg) => {
        const tl = await analytics.getDownloadTimeline(pkg.name, 30).catch(() => [])
        return tl || []
      }),
    )
    const dateMap = new Map<string, number>()
    for (const tl of allTimelines) {
      for (const d of tl) {
        dateMap.set(d.date, (dateMap.get(d.date) || 0) + (d.count || 0))
      }
    }
    const globalTimeline = [...dateMap.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }))
    const globalChart = generateLineChart(globalTimeline, 700, 180)

    // Downloads distribution bar chart (top 10)
    const top10Items = topPackages.slice(0, 10).map(p => ({ label: p.name, value: p.downloads }))
    const downloadsBar = generateHorizontalBarChart(top10Items, 600, 24, 4, 140)

    const html = await renderDashboardPage('overview.stx', {
      packages: topPackages,
      pkgsWithSparklines,
      page,
      perPage: 25,
      globalChart,
      downloadsBar,
      qs,
      qsAmp,
    })
    return new Response(html, { headers: htmlHeaders })
  }

  return Response.json({ error: 'Not found' }, { status: 404, headers: noCacheHeaders })
}

// ============================================================================
// Site route handlers
// ============================================================================

async function fetchPackageMetadata(domain: string, storage?: BinaryStorage): Promise<any> {
  try {
    const store: BinaryStorage = storage || (() => {
      const s3Bucket = process.env.S3_BUCKET || 'pantry-registry'
      const s3Region = process.env.AWS_REGION || 'us-east-1'
      const s3 = new S3Client(s3Region)
      return { getObject: (key: string) => s3.getObjectBuffer(s3Bucket, key) }
    })()
    const buffer = await store.getObject(`binaries/${domain}/metadata.json`)
    return JSON.parse(Buffer.from(buffer).toString('utf-8'))
  }
  catch { return null }
}

async function handleSiteHome(binaryStorage?: BinaryStorage, analyticsStorage?: AnalyticsStorage): Promise<Response> {
  // Fetch featured package metadata + sparkline data in parallel
  const metaResults = await Promise.allSettled(
    FEATURED_PACKAGES.map(async (pkg) => {
      const [meta, timeline] = await Promise.all([
        fetchPackageMetadata(pkg.domain, binaryStorage),
        analyticsStorage?.getDownloadTimeline(pkg.domain, 14).catch(() => []) ?? [],
      ])
      const sparkData = (timeline || []).map((d: any) => d.count || 0)
      const sparkline = generateSparkline(sparkData, 60, 20)
      return {
        ...pkg,
        version: meta?.latestVersion || null,
        versionCount: meta?.versions ? Object.keys(meta.versions).length : 0,
        sparklinePath: sparkline.path,
        sparklineAreaPath: sparkline.areaPath,
      }
    }),
  )

  const packages = metaResults.map((r, i) =>
    r.status === 'fulfilled' ? r.value : { ...FEATURED_PACKAGES[i], version: null, versionCount: 0, sparklinePath: '', sparklineAreaPath: '' },
  )

  // Fetch top packages and aggregate stats
  let topPackages: any[] = []
  let stats: Record<string, any> = {}
  if (analyticsStorage) {
    try {
      const [top, installAnalytics] = await Promise.all([
        analyticsStorage.getTopPackages(10),
        analyticsStorage.getInstallAnalytics(30).catch(() => null),
      ])

      const totalDownloads = top.reduce((sum, p) => sum + p.downloads, 0)

      // Generate sparklines for top packages
      const topWithSparklines = await Promise.all(
        top.map(async (pkg, i) => {
          const timeline = await analyticsStorage.getDownloadTimeline(pkg.name, 14).catch(() => [])
          const sparkData = (timeline || []).map((d: any) => d.count || 0)
          const sparkline = generateSparkline(sparkData, 80, 24)
          return {
            ...pkg,
            rank: i + 1,
            formattedDownloads: chartFormatCount(pkg.downloads),
            sparklinePath: sparkline.path,
            sparklineAreaPath: sparkline.areaPath,
          }
        }),
      )
      topPackages = topWithSparklines

      stats = {
        totalDownloads,
        formattedDownloads: chartFormatCount(totalDownloads),
        totalCount: installAnalytics?.total_count || 0,
      }
    }
    catch { /* analytics are optional */ }
  }

  const totalPackages = _knownVersions.size || 500
  const html = await renderSitePage('index.stx', { packages, totalPackages, topPackages, stats, canonicalUrl: 'https://pantry.dev/' })
  return htmlResponse(html)
}

async function handleSiteSearch(
  query: string,
  registry: Registry,
  binaryStorage?: BinaryStorage,
  analyticsStorage?: AnalyticsStorage,
  sort = 'relevance',
  view = 'list',
): Promise<Response> {
  let results: any[] = []
  if (query) {
    const searchResults = await registry.search(query, 50)
    results = searchResults || []

    const metaData = await fetchPackageMetadata(query, binaryStorage)
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

    // Enrich results with download stats (limit to first 20 to avoid excessive API calls)
    if (analyticsStorage) {
      const enrichLimit = Math.min(results.length, 20)
      const statsResults = await Promise.allSettled(
        results.slice(0, enrichLimit).map(async (r: any) => {
          const pkgStats = await analyticsStorage.getPackageStats(r.name)
          return { ...r, downloads: pkgStats ? chartFormatCount(pkgStats.totalDownloads) : '', downloadCount: pkgStats?.totalDownloads || 0 }
        }),
      )
      const enriched = statsResults.map((r, i) =>
        r.status === 'fulfilled' ? r.value : { ...results[i], downloads: '', downloadCount: 0 },
      )
      results = [...enriched, ...results.slice(enrichLimit)]
    }

    // Sort results
    if (sort === 'downloads') {
      results.sort((a: any, b: any) => (b.downloadCount || 0) - (a.downloadCount || 0))
    }
    else if (sort === 'name') {
      results.sort((a: any, b: any) => (a.name || '').localeCompare(b.name || ''))
    }
  }

  const suggestions = ['python.org', 'nodejs.org', 'curl.se', 'go.dev', 'redis.io', 'postgresql.org', 'bun.sh', 'rust-lang.org']
  const html = await renderSitePage('search.stx', {
    query,
    results,
    sort,
    view,
    count: results.length,
    hasResults: results.length > 0,
    hasQuery: query.length > 0,
    suggestions,
    title: query ? `search: ${query}` : 'search',
    metaDescription: query ? `Search results for "${query}" on pantry.dev` : 'Search packages on pantry.dev',
    canonicalUrl: 'https://pantry.dev/search',
  })
  return htmlResponse(html)
}

async function handleSitePackage(
  name: string,
  analytics: AnalyticsStorage,
  binaryStorage?: BinaryStorage,
  registry?: Registry,
): Promise<Response> {
  const [meta, stats, timeline, pkgInfo] = await Promise.all([
    fetchPackageMetadata(name, binaryStorage),
    analytics.getPackageStats(name),
    analytics.getDownloadTimeline(name, 30),
    registry?.getPackage(name) ?? null,
  ])

  if (!meta && !pkgInfo) {
    const html = await renderSitePage('package.stx', {
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

  if (meta) {
    const versions = Object.keys(meta.versions || {})
    const latestVersion = meta.latestVersion || versions[0] || 'unknown'
    const latestData = meta.versions?.[latestVersion] || {}
    const platforms = Object.keys(latestData.platforms || {})

    // Pre-compute all template values (STX <script server> locals aren't accessible in template body)
    const pkgStats = stats || { totalDownloads: 0, weeklyDownloads: 0, monthlyDownloads: 0, versionDownloads: {} }
    const versionCount = versions.length
    const platformCount = platforms.length

    const platformLabels = platforms.map((p: string) => {
      if (p.includes('darwin-arm64')) return 'macOS (Apple Silicon)'
      if (p.includes('darwin-x86-64') || p.includes('darwin-x64')) return 'macOS (Intel)'
      if (p.includes('linux-arm64') || p.includes('linux-aarch64')) return 'Linux (ARM64)'
      if (p.includes('linux-x86-64') || p.includes('linux-x64')) return 'Linux (x86_64)'
      return p
    })

    const deps = meta.dependencies || {}
    const depList = Object.keys(deps)
    const hasDeps = depList.length > 0
    const depCount = depList.length

    const sortedVersions = [...versions].reverse()
    const recentVersions = sortedVersions.slice(0, 10)
    const hasMoreVersions = sortedVersions.length > 10
    const remainingCount = sortedVersions.length - 10

    // Generate charts via ts-charts
    const timelineData = (timeline || []).map((d: any) => ({ date: d.date, count: d.count || 0 }))
    const lineChart = generateLineChart(timelineData, 700, 200)

    // Version distribution chart
    const versionDownloads = pkgStats.versionDownloads || {}
    const versionItems = Object.entries(versionDownloads)
      .map(([label, value]) => ({ label, value: value as number }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8)
    const versionDistribution = generateHorizontalBarChart(versionItems, 600, 28, 6, 120)

    const pkgDescription = meta.description || `${name} — ${versionCount} versions available for macOS and Linux`
    const html = await renderSitePage('package.stx', {
      name,
      notFound: false,
      latestVersion,
      versionCount,
      platformCount,
      platformLabels,
      formattedDownloads: chartFormatCount(pkgStats.totalDownloads),
      formattedWeekly: chartFormatCount(pkgStats.weeklyDownloads),
      pkgDescription: meta.description || '',
      homepage: meta.homepage || '',
      source: meta.source || meta.repository || '',
      depList,
      hasDeps,
      depCount,
      sortedVersions,
      recentVersions,
      hasMoreVersions,
      remainingCount,
      lineChart,
      versionDistribution,
      title: name,
      metaDescription: `${pkgDescription} — Install with pantry.`,
      canonicalUrl: `https://pantry.dev/package/${name}`,
    })
    return htmlResponse(html)
  }

  // Fallback for packages only in npm registry (not S3)
  const fbTimeline = (timeline || []).map((d: any) => ({ date: d.date, count: d.count || 0 }))
  const fbLineChart = generateLineChart(fbTimeline, 700, 200)
  const fbStats = stats || { totalDownloads: (pkgInfo as any)?.downloads || 0, weeklyDownloads: 0, monthlyDownloads: 0, versionDownloads: {} }
  const fbVersion = (pkgInfo as any)?.version || 'unknown'
  const fbVersions = fbVersion !== 'unknown' ? [fbVersion] : []

  const html = await renderSitePage('package.stx', {
    name,
    notFound: false,
    latestVersion: fbVersion,
    versionCount: fbVersions.length,
    platformCount: 0,
    platformLabels: [],
    formattedDownloads: chartFormatCount(fbStats.totalDownloads),
    formattedWeekly: chartFormatCount(fbStats.weeklyDownloads),
    pkgDescription: '',
    homepage: '',
    source: '',
    depList: [],
    hasDeps: false,
    depCount: 0,
    sortedVersions: [...fbVersions].reverse(),
    recentVersions: fbVersions.slice(0, 10),
    hasMoreVersions: false,
    remainingCount: 0,
    lineChart: fbLineChart,
    versionDistribution: { bars: [] },
    title: name,
    metaDescription: `${name} — Install with pantry.`,
    canonicalUrl: `https://pantry.dev/package/${name}`,
  })
  return htmlResponse(html)
}

// ============================================================================
// Compare page handler
// ============================================================================
async function handleSiteCompare(
  packagesParam: string,
  analyticsStorage: AnalyticsStorage,
  binaryStorage?: BinaryStorage,
): Promise<Response> {
  const packageNames = packagesParam
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
    .slice(0, 4)

  if (packageNames.length === 0) {
    const html = await renderSitePage('compare.stx', {
      comparePackages: [],
      hasPackages: false,
      packagesQuery: packagesParam,
      title: 'Compare',
      metaDescription: 'Compare packages side by side on pantry.dev — downloads, versions, and platform support.',
      canonicalUrl: 'https://pantry.dev/compare',
    })
    return htmlResponse(html)
  }

  // Fetch data for all packages in parallel
  const pkgDataResults = await Promise.allSettled(
    packageNames.map(async (name) => {
      const [meta, pkgStats, timeline] = await Promise.all([
        fetchPackageMetadata(name, binaryStorage),
        analyticsStorage.getPackageStats(name),
        analyticsStorage.getDownloadTimeline(name, 30).catch(() => []),
      ])

      const versions = meta?.versions ? Object.keys(meta.versions) : []
      const latestVersion = meta?.latestVersion || versions[0] || 'unknown'
      const latestData = meta?.versions?.[latestVersion] || {}
      const platforms = Object.keys(latestData.platforms || {})

      return {
        name,
        latestVersion,
        totalDownloads: pkgStats?.totalDownloads || 0,
        formattedDownloads: chartFormatCount(pkgStats?.totalDownloads || 0),
        weeklyDownloads: pkgStats?.weeklyDownloads || 0,
        formattedWeekly: chartFormatCount(pkgStats?.weeklyDownloads || 0),
        versionCount: versions.length,
        platformCount: platforms.length,
        platforms,
        hasDarwinArm64: platforms.some(p => p.includes('darwin-arm64') || p.includes('darwin+aarch64')),
        hasDarwinX86: platforms.some(p => p.includes('darwin-x86') || p.includes('darwin+x86-64')),
        hasLinuxArm64: platforms.some(p => p.includes('linux-arm64') || p.includes('linux+aarch64')),
        hasLinuxX86: platforms.some(p => p.includes('linux-x86') || p.includes('linux+x86-64')),
        timeline: (timeline || []).map((d: any) => ({ date: d.date, count: d.count || 0 })),
      }
    }),
  )

  const comparePackages = pkgDataResults
    // eslint-disable-next-line no-unused-vars
    .map((r, i) =>
      r.status === 'fulfilled'
        ? r.value
        : {
            name: packageNames[i],
            latestVersion: '--',
            totalDownloads: 0,
            formattedDownloads: '--',
            weeklyDownloads: 0,
            formattedWeekly: '--',
            versionCount: 0,
            platformCount: 0,
            platforms: [],
            hasDarwinArm64: false,
            hasDarwinX86: false,
            hasLinuxArm64: false,
            hasLinuxX86: false,
            timeline: [],
          },
    )

  // Generate multi-line download trend chart (ts-charts)
  const multiLineChart = generateMultiLineChart(
    comparePackages.map(pkg => ({
      label: pkg.name,
      timeline: pkg.timeline,
    })),
    700,
    250,
  )

  // Generate downloads bar chart for comparison
  const maxDownloads = Math.max(...comparePackages.map(p => p.totalDownloads), 1)
  const COMPARE_COLORS = ['#5b9cf5', '#6dd97a', '#e6c84d', '#e25c5c']
  const downloadsBarChart = {
    bars: comparePackages.map((pkg, i) => ({
      label: pkg.name,
      value: pkg.totalDownloads,
      formattedValue: pkg.formattedDownloads,
      widthPct: Math.max((pkg.totalDownloads / maxDownloads) * 100, 2).toFixed(1),
      color: COMPARE_COLORS[i % COMPARE_COLORS.length],
    })),
  }

  const html = await renderSitePage('compare.stx', {
    comparePackages,
    hasPackages: comparePackages.length > 0,
    packagesQuery: packagesParam,
    multiLineChart,
    downloadsBarChart,
    title: `Compare: ${packageNames.join(' vs ')}`,
    metaDescription: `Compare ${packageNames.join(', ')} — downloads, versions, and platform support on pantry.dev.`,
    canonicalUrl: 'https://pantry.dev/compare',
  })
  return htmlResponse(html)
}

// ============================================================================
// Stats page handler
// ============================================================================
// eslint-disable-next-line no-unused-vars
async function handleSiteStats(
  analyticsStorage: AnalyticsStorage,
): Promise<Response> {
  const [topPkgs, installAnalytics30, installAnalytics90] = await Promise.all([
    analyticsStorage.getTopPackages(25),
    analyticsStorage.getInstallAnalytics(30).catch(() => null),
    analyticsStorage.getInstallAnalytics(90).catch(() => null),
  ])

  const totalDownloads30 = topPkgs.reduce((sum, p) => sum + p.downloads, 0)
  const totalDownloads90 = (installAnalytics90 as any)?.total_count || totalDownloads30

  // Generate sparklines for each top package
  const topPackages = await Promise.all(
    topPkgs.map(async (pkg, i) => {
      const timeline = await analyticsStorage.getDownloadTimeline(pkg.name, 30).catch(() => [])
      const sparkData = (timeline || []).map((d: any) => d.count || 0)
      const sparkline = generateSparkline(sparkData, 80, 24)
      return {
        ...pkg,
        rank: i + 1,
        formattedDownloads: chartFormatCount(pkg.downloads),
        sharePct: totalDownloads30 > 0 ? ((pkg.downloads / totalDownloads30) * 100).toFixed(1) : '0',
        sparklinePath: sparkline.path,
        sparklineAreaPath: sparkline.areaPath,
      }
    }),
  )

  // Build aggregate timeline for global chart
  const allTimelines = await Promise.all(
    topPkgs.slice(0, 15).map(async (pkg) => {
      const tl = await analyticsStorage.getDownloadTimeline(pkg.name, 30).catch(() => [])
      return tl || []
    }),
  )

  // Aggregate by date
  const dateMap = new Map<string, number>()
  for (const tl of allTimelines) {
    for (const d of tl) {
      dateMap.set(d.date, (dateMap.get(d.date) || 0) + (d.count || 0))
    }
  }
  const globalTimeline = [...dateMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }))

  const globalChart = generateLineChart(globalTimeline, 700, 220)

  const stats = {
    totalPackages: _knownVersions.size || 500,
    formatted30d: chartFormatCount(totalDownloads30),
    formatted90d: chartFormatCount(totalDownloads90),
    installAnalytics: installAnalytics30,
  }

  const html = await renderSitePage('stats.stx', {
    topPackages,
    stats,
    globalChart,
    title: 'Stats',
    metaDescription: 'pantry registry statistics — download trends, top packages, and install analytics.',
    canonicalUrl: 'https://pantry.dev/stats',
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

// Run server if this is the main module
if (import.meta.main) {
  const port = Number.parseInt(process.env.PORT || '3000', 10)
  const analyticsTable = process.env.DYNAMODB_ANALYTICS_TABLE
  const awsRegion = process.env.AWS_REGION || 'us-east-1'

  // Use environment-based config (supports both local and production)
  const registry = createRegistryFromEnv()
  const analytics = createAnalytics(
    analyticsTable ? { tableName: analyticsTable, region: awsRegion } : undefined,
  )

  const { start } = createServer(registry, port, analytics)
  start()

  console.log('\nEnvironment:')
  console.log(`  S3_BUCKET: ${process.env.S3_BUCKET || 'local'}`)
  console.log(`  DYNAMODB_TABLE: ${process.env.DYNAMODB_TABLE || 'pantry-registry'}`)
  console.log(`  BASE_URL: ${process.env.BASE_URL || `http://localhost:${port}`}`)
}
