import type { RegistryConfig } from './types'
import { Registry, createLocalRegistry, createRegistryFromEnv } from './registry'
import { createAnalytics, type AnalyticsStorage } from './analytics'
import { handleZigRoutes, createZigStorage } from './zig-routes'
import type { ZigPackageStorage } from './zig'

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
 * GET  /analytics/top             - Get top downloaded packages
 *
 * Zig package endpoints:
 * GET  /zig/packages/{name}                  - Get Zig package metadata
 * GET  /zig/packages/{name}/{version}        - Get specific version
 * GET  /zig/packages/{name}/{version}/tarball - Download tarball
 * GET  /zig/packages/{name}/versions         - List versions
 * GET  /zig/hash/{hash}                      - Lookup by content hash
 * GET  /zig/search?q={query}                 - Search Zig packages
 * POST /zig/publish                          - Publish Zig package
 */
export function createServer(
  registry: Registry,
  port = 3000,
  analytics?: AnalyticsStorage,
  zigStorage?: ZigPackageStorage,
): { start: () => void, stop: () => void } {
  let server: ReturnType<typeof Bun.serve> | null = null
  const analyticsStorage = analytics || createAnalytics()
  const zigPackageStorage = zigStorage || createZigStorage()
  const baseUrl = process.env.BASE_URL || `http://localhost:${port}`

  const start = () => {
    server = Bun.serve({
      port,
      async fetch(req) {
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
          // Health check
          if (path === '/health') {
            return Response.json({ status: 'ok', timestamp: new Date().toISOString() }, { headers: corsHeaders })
          }

          // Search
          if (path === '/search' && req.method === 'GET') {
            const query = url.searchParams.get('q') || ''
            const limit = Number.parseInt(url.searchParams.get('limit') || '20', 10)
            const results = await registry.search(query, limit)
            return Response.json({ results }, { headers: corsHeaders })
          }

          // Publish
          if (path === '/publish' && req.method === 'POST') {
            return handlePublish(req, registry, corsHeaders)
          }

          // Install analytics API (JSON endpoints)
          const installApiMatch = path.match(/^\/api\/analytics\/install\/(30|90|365)d\.json$/)
          if (installApiMatch && req.method === 'GET') {
            const days = Number.parseInt(installApiMatch[1], 10) as 30 | 90 | 365
            const result = await analyticsStorage.getInstallAnalytics(days)
            return Response.json(result, {
              headers: { ...corsHeaders, 'Cache-Control': 'public, max-age=3600' },
            })
          }

          // Analytics routes
          const analyticsMatch = path.match(/^\/analytics(?:\/(.+))?$/)
          if (analyticsMatch && req.method === 'GET') {
            return handleAnalytics(analyticsMatch[1], url, analyticsStorage, corsHeaders)
          }

          // Zig package routes
          if (path.startsWith('/zig/')) {
            const zigResponse = await handleZigRoutes(path, req, url, zigPackageStorage, baseUrl, corsHeaders)
            if (zigResponse) {
              return zigResponse
            }
          }

          // Package routes
          const packageMatch = path.match(/^\/packages\/(@?[^/]+(?:\/[^/]+)?)(?:\/(.+))?$/)
          if (packageMatch) {
            const packageName = decodeURIComponent(packageMatch[1])
            const rest = packageMatch[2]

            // GET /packages/{name}/versions
            if (rest === 'versions' && req.method === 'GET') {
              const versions = await registry.listVersions(packageName)
              return Response.json({ versions }, { headers: corsHeaders })
            }

            // GET /packages/{name}/{version}/tarball
            if (rest?.endsWith('/tarball') && req.method === 'GET') {
              const version = rest.replace('/tarball', '')
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

          return Response.json(
            { error: 'Not found' },
            { status: 404, headers: corsHeaders },
          )
        }
        catch (error) {
          console.error('Server error:', error)
          return Response.json(
            { error: 'Internal server error' },
            { status: 500, headers: corsHeaders },
          )
        }
      },
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
    console.log('  GET  /analytics/top             - Top downloaded packages')
    console.log('  GET  /analytics/install/{30d,90d,365d} - Install analytics')
    console.log('  GET  /api/analytics/install/{period}.json - Install analytics (JSON API)')
    console.log('Zig packages:')
    console.log('  GET  /zig/packages/{name}       - Get Zig package metadata')
    console.log('  GET  /zig/packages/{name}/{version}/tarball - Download')
    console.log('  GET  /zig/hash/{hash}           - Lookup by content hash')
    console.log('  GET  /zig/search?q={query}      - Search Zig packages')
    console.log('  POST /zig/publish               - Publish Zig package')
    console.log('  GET  /health                    - Health check')
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
  // GET /analytics/install/{30d,90d,365d}
  const installMatch = path?.match(/^install\/(30|90|365)d$/)
  if (installMatch) {
    const days = Number.parseInt(installMatch[1], 10) as 30 | 90 | 365
    const result = await analytics.getInstallAnalytics(days)
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

// Simple token for authentication (replace with proper auth in production)
const REGISTRY_TOKEN = process.env.PANTRY_REGISTRY_TOKEN || 'ABCD1234'

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
  console.log(`  DYNAMODB_TABLE: ${process.env.DYNAMODB_TABLE || 'local'}`)
  console.log(`  BASE_URL: ${process.env.BASE_URL || `http://localhost:${port}`}`)
}
