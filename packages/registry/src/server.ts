import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { RegistryConfig } from './types'
import { Registry, createLocalRegistry, createRegistryFromEnv } from './registry'
import { createAnalytics, type AnalyticsStorage, type AnalyticsCategory } from './analytics'
import { handleZigRoutes, createZigStorage } from './zig-routes'
import type { ZigPackageStorage } from './zig'
import { S3Client } from './storage/aws-client'

/**
 * Lightweight .stx template renderer — processes server scripts, directives and expressions.
 * Handles: <script server>, {{ expr }}, {!! expr !!}, @if/@else/@endif, @foreach/@endforeach, @for/@endfor
 */
async function stxRender(filePath: string, props: Record<string, unknown> = {}): Promise<string> {
  const raw = await Bun.file(filePath).text()

  // 1. Extract and evaluate <script server> blocks to build context
  const ctx: Record<string, any> = { props, ...props }
  const serverScriptRe = /<script\s+server\b[^>]*>([\s\S]*?)<\/script>/gi
  let templateContent = raw
  let match: RegExpExecArray | null
  const serverBlocks: string[] = []
  while ((match = serverScriptRe.exec(raw)) !== null) {
    serverBlocks.push(match[1])
  }
  // Remove server script tags from output
  templateContent = raw.replace(serverScriptRe, '')

  // Build evaluation function body from server blocks
  if (serverBlocks.length > 0) {
    const script = serverBlocks.join('\n')
    // Extract variable names assigned with const/let/var
    const varNames = new Set<string>()
    for (const m of script.matchAll(/(?:const|let|var)\s+(\w+)\s*=/g)) {
      varNames.add(m[1])
    }
    // Execute the script in a Function, returning declared variables
    const returnObj = [...varNames].map(v => `${v}`).join(', ')
    const fn = new Function('props', `${script}\nreturn { ${returnObj} }`)
    try {
      const result = fn(props)
      Object.assign(ctx, result)
    }
    catch { /* ignore script errors, variables stay as defaults from props */ }
  }

  // 2. Process directives
  templateContent = processBlock(templateContent, ctx)
  return templateContent
}

function processBlock(template: string, ctx: Record<string, any>): string {
  let output = ''
  const lines = template.split('\n')
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()

    // @if (condition)
    if (trimmed.startsWith('@if')) {
      const condMatch = trimmed.match(/@if\s*\((.+)\)\s*$/)
      if (condMatch) {
        const { ifBody, elseBody, endIndex } = extractIfBlock(lines, i)
        const condResult = evalExpr(condMatch[1], ctx)
        output += processBlock(condResult ? ifBody : elseBody, ctx)
        i = endIndex + 1
        continue
      }
    }

    // @foreach (array as item) or @foreach (array as item, index)
    if (trimmed.startsWith('@foreach')) {
      const foreachMatch = trimmed.match(/@foreach\s*\((\w+)\s+as\s+(\w+)(?:\s*,\s*(\w+))?\)/)
      if (foreachMatch) {
        const { body, endIndex } = extractBlock(lines, i, '@foreach', '@endforeach')
        const arr = evalExpr(foreachMatch[1], ctx)
        const itemName = foreachMatch[2]
        const indexName = foreachMatch[3]
        if (Array.isArray(arr)) {
          for (let j = 0; j < arr.length; j++) {
            const loopCtx = { ...ctx, [itemName]: arr[j] }
            if (indexName) loopCtx[indexName] = j
            output += processBlock(body, loopCtx)
          }
        }
        i = endIndex + 1
        continue
      }
    }

    // @for (let i = ...; i <= ...; i++)
    if (trimmed.startsWith('@for')) {
      const { body, endIndex } = extractBlock(lines, i, '@for', '@endfor')
      const forMatch = trimmed.match(/@for\s*\((.+)\)/)
      if (forMatch) {
        // Execute the for loop
        const forExpr = forMatch[1]
        const iterMatch = forExpr.match(/(?:let|var)\s+(\w+)\s*=\s*(.+?);\s*\1\s*([<>=!]+)\s*(.+?);\s*\1(\+\+|--)/)
        if (iterMatch) {
          const varName = iterMatch[1]
          let current = Number(evalExpr(iterMatch[2], ctx))
          const op = iterMatch[3]
          const limit = Number(evalExpr(iterMatch[4], ctx))
          const inc = iterMatch[5] === '++' ? 1 : -1
          const check = (v: number) => {
            if (op === '<=') return v <= limit
            if (op === '<') return v < limit
            if (op === '>=') return v >= limit
            if (op === '>') return v > limit
            return false
          }
          while (check(current)) {
            const loopCtx = { ...ctx, [varName]: current }
            output += processBlock(body, loopCtx)
            current += inc
          }
        }
      }
      i = endIndex + 1
      continue
    }

    // Regular line — process expressions
    output += processExpressions(line, ctx) + '\n'
    i++
  }

  return output
}

function extractIfBlock(lines: string[], startIdx: number): { ifBody: string, elseBody: string, endIndex: number } {
  let depth = 0
  let elseIdx = -1
  for (let i = startIdx; i < lines.length; i++) {
    const t = lines[i].trim()
    if (t.startsWith('@if')) depth++
    if (t === '@endif') {
      depth--
      if (depth === 0) {
        const ifLines = lines.slice(startIdx + 1, elseIdx >= 0 ? elseIdx : i)
        const elseLines = elseIdx >= 0 ? lines.slice(elseIdx + 1, i) : []
        return { ifBody: ifLines.join('\n'), elseBody: elseLines.join('\n'), endIndex: i }
      }
    }
    if (t === '@else' && depth === 1) elseIdx = i
  }
  return { ifBody: '', elseBody: '', endIndex: lines.length - 1 }
}

function extractBlock(lines: string[], startIdx: number, openTag: string, closeTag: string): { body: string, endIndex: number } {
  let depth = 0
  for (let i = startIdx; i < lines.length; i++) {
    const t = lines[i].trim()
    if (t.startsWith(openTag)) depth++
    if (t.startsWith(closeTag)) {
      depth--
      if (depth === 0) {
        return { body: lines.slice(startIdx + 1, i).join('\n'), endIndex: i }
      }
    }
  }
  return { body: '', endIndex: lines.length - 1 }
}

function processExpressions(line: string, ctx: Record<string, any>): string {
  // {!! expr !!} — raw (unescaped) output
  line = line.replace(/\{!!\s*(.+?)\s*!!\}/g, (_match, expr) => {
    try { return String(evalExpr(expr, ctx)) }
    catch { return '' }
  })
  // {{ expr }} — escaped output
  line = line.replace(/\{\{\s*(.+?)\s*\}\}/g, (_match, expr) => {
    try { return escapeHtml(String(evalExpr(expr, ctx))) }
    catch { return '' }
  })
  return line
}

function evalExpr(expr: string, ctx: Record<string, any>): any {
  const keys = Object.keys(ctx)
  const values = Object.values(ctx)
  const fn = new Function(...keys, `return (${expr})`)
  return fn(...values)
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// Resolve dashboard pages directory relative to this file
const __dirname = typeof import.meta.dirname === 'string'
  ? import.meta.dirname
  : dirname(fileURLToPath(import.meta.url))
const DASHBOARD_DIR = resolve(__dirname, '../dashboard/pages')

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

      // Binary proxy routes — proxy pantry binary tarballs from S3
      if (path.startsWith('/binaries/')) {
        return handleBinaryProxy(path, req, analyticsStorage, corsHeaders, binaryStorage)
      }

      // Dashboard routes
      if (path.startsWith('/dashboard')) {
        return handleDashboard(path, req, url, analyticsStorage, corsHeaders)
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
            // Track this missing version request asynchronously
            analyticsStorage.trackMissingVersion(
              packageName,
              rest,
              req.headers.get('user-agent') || undefined,
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
    console.log('Binary proxy (pantry CLI):')
    console.log('  GET  /binaries/{domain}/metadata.json  - Package metadata')
    console.log('  GET  /binaries/{domain}/{ver}/{plat}/*  - Tarball/checksum')
    console.log('Dashboard:')
    console.log('  GET  /dashboard                 - Analytics overview')
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

    if (!category || !['install', 'install_on_request', 'build_error'].includes(category)) {
      return Response.json(
        { error: 'Missing or invalid category. Must be one of: install, install_on_request, build_error' },
        { status: 400, headers: corsHeaders },
      )
    }

    await analytics.trackEvent({
      packageName,
      category: category as AnalyticsCategory,
      timestamp: new Date().toISOString(),
      version: version || undefined,
    })

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
  const cookieMatch = cookieHeader.match(/pantry_token=([^;]+)/)
  if (cookieMatch && cookieMatch[1] === DASHBOARD_TOKEN) return true

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

  // Logout
  if (path === '/dashboard/logout') {
    return new Response(null, {
      status: 302,
      headers: {
        ...noCacheHeaders,
        'Location': '/dashboard/login',
        'Set-Cookie': 'pantry_token=; Path=/dashboard; HttpOnly; SameSite=Strict; Max-Age=0',
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
            'Set-Cookie': `pantry_token=${token}; Path=/dashboard; HttpOnly; SameSite=Strict; Max-Age=86400`,
          },
        })
      }
      const html = await stxRender(`${DASHBOARD_DIR}/login.stx`, { error: 'Invalid token' })
      return new Response(html, { status: 401, headers: htmlHeaders })
    }
    const html = await stxRender(`${DASHBOARD_DIR}/login.stx`, {})
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
    const html = await stxRender(`${DASHBOARD_DIR}/package.stx`, { packageName, stats, timeline })
    return new Response(html, { headers: htmlHeaders })
  }

  // Overview page (default)
  if (path === '/dashboard' || path === '/dashboard/') {
    const topPackages = await analytics.getTopPackages(100)
    const page = Math.max(1, Number.parseInt(url.searchParams.get('page') || '1', 10))
    const html = await stxRender(`${DASHBOARD_DIR}/overview.stx`, { packages: topPackages, page, perPage: 25 })
    return new Response(html, { headers: htmlHeaders })
  }

  return Response.json({ error: 'Not found' }, { status: 404, headers: noCacheHeaders })
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
