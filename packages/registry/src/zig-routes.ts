/**
 * Zig Package Routes
 *
 * Endpoints:
 * GET  /zig/packages/{name}                  - Get latest package metadata
 * GET  /zig/packages/{name}/{version}        - Get specific version metadata
 * GET  /zig/packages/{name}/{version}/tarball - Download tarball
 * GET  /zig/packages/{name}/versions         - List all versions
 * GET  /zig/hash/{hash}                      - Lookup package by hash
 * GET  /zig/search?q={query}                 - Search packages
 * POST /zig/publish                          - Publish a Zig package
 */

import {
  computeZigHash,
  createZigStorage,
  generateDependencyEntry,
  generateFetchCommand,
  parseZigZon,
  type ZigPackageMetadata,
  type ZigPackageStorage,
} from './zig'
import type { AnalyticsStorage } from './analytics'
import { validateZigHash, ZigPackageHashError } from './zig-native-hash'
import {
  malwareScanFailureResponse,
  publicScanResult,
  scanPackageArtifact,
  type MalwareScanner,
} from './malware-scanning'

/**
 * Handle Zig package routes
 */
export async function handleZigRoutes(
  path: string,
  req: Request,
  url: URL,
  storage: ZigPackageStorage,
  baseUrl: string,
  corsHeaders: Record<string, string>,
  analytics?: AnalyticsStorage,
  malwareScanner?: MalwareScanner,
): Promise<Response | null> {
  // Remove /zig prefix
  const zigPath = path.replace(/^\/zig/, '')

  // GET /zig/search
  if (zigPath === '/search' && req.method === 'GET') {
    const query = url.searchParams.get('q') || ''
    if (query.length > 256) {
      return Response.json({ error: 'Search query too long' }, { status: 400, headers: corsHeaders })
    }
    const limit = Math.min(Number.parseInt(url.searchParams.get('limit') || '20', 10), 100)
    const results = await storage.search(query, limit)

    return Response.json({
      results: results.map(r => ({
        name: r.name,
        version: r.latest,
        description: r.description,
        keywords: r.keywords,
        author: r.author,
      })),
    }, { headers: corsHeaders })
  }

  // GET /zig/hash/{hash}
  const hashMatch = zigPath.match(/^\/hash\/([a-zA-Z0-9_.+-]{1,256})$/)
  if (hashMatch && validateZigHash(hashMatch[1]) && req.method === 'GET') {
    const hash = hashMatch[1]
    const info = await storage.getByHash(hash)

    if (!info) {
      return Response.json(
        { error: 'Package not found for this hash' },
        { status: 404, headers: corsHeaders },
      )
    }

    return Response.json({
      ...info,
      hash,
      dependency: generateDependencyEntry(info.name, info.tarballUrl, hash),
    }, { headers: corsHeaders })
  }

  // POST /zig/publish
  if (zigPath === '/publish' && req.method === 'POST') {
    if (!malwareScanner) throw new Error('malware scanner is required for publishing')
    return handleZigPublish(req, storage, baseUrl, corsHeaders, analytics, malwareScanner)
  }

  // DELETE /zig/packages/{name}
  const deleteMatch = zigPath.match(/^\/packages\/([^/]+)$/)
  if (deleteMatch && req.method === 'DELETE') {
    const authResult = validateToken(req.headers.get('authorization'))
    if (!authResult.valid) {
      return Response.json({ error: authResult.error }, { status: 401, headers: corsHeaders })
    }
    const packageName = decodeURIComponent(deleteMatch[1])
    if (packageName.includes('..') || /[\x00-\x1f]/.test(packageName)) {
      return Response.json({ error: 'Invalid package name' }, { status: 400, headers: corsHeaders })
    }
    await storage.deletePackage(packageName)
    return Response.json({ success: true, message: `Deleted ${packageName}` }, { headers: corsHeaders })
  }

  // Package routes: /zig/packages/{name}...
  const packageMatch = zigPath.match(/^\/packages\/([^/]+)(?:\/(.+))?$/)
  if (packageMatch) {
    const packageName = decodeURIComponent(packageMatch[1])
    if (packageName.includes('..') || /[\x00-\x1f]/.test(packageName)) {
      return Response.json({ error: 'Invalid package name' }, { status: 400, headers: corsHeaders })
    }
    const rest = packageMatch[2]

    // GET /zig/packages/{name}/versions
    if (rest === 'versions' && req.method === 'GET') {
      const versions = await storage.listVersions(packageName)
      return Response.json({ name: packageName, versions }, { headers: corsHeaders })
    }

    // GET /zig/packages/{name}/{version}/tarball
    if (rest?.endsWith('/tarball') && req.method === 'GET') {
      const version = rest.replace('/tarball', '')
      const tarball = await storage.downloadTarball(packageName, version)

      if (!tarball) {
        return Response.json(
          { error: 'Package not found' },
          { status: 404, headers: corsHeaders },
        )
      }

      // Track download
      analytics?.trackDownload({
        packageName,
        version,
        timestamp: new Date().toISOString(),
        userAgent: req.headers.get('user-agent') || undefined,
      }).catch(err => console.warn('Analytics tracking failed:', err))

      return new Response(tarball, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/gzip',
          'Content-Disposition': `attachment; filename="${packageName}-${version}.tar.gz"`,
        },
      })
    }

    // GET /zig/packages/{name}/{version}
    if (rest && !rest.includes('/') && req.method === 'GET') {
      const metadata = await storage.getPackage(packageName, rest)
      if (!metadata) {
        return Response.json(
          { error: 'Package version not found' },
          { status: 404, headers: corsHeaders },
        )
      }

      return Response.json({
        ...metadata,
        fetchCommand: generateFetchCommand(metadata.tarballUrl),
        dependency: generateDependencyEntry(packageName, metadata.tarballUrl, metadata.hash),
      }, { headers: corsHeaders })
    }

    // GET /zig/packages/{name}
    if (!rest && req.method === 'GET') {
      const metadata = await storage.getPackage(packageName)
      if (!metadata) {
        return Response.json(
          { error: 'Package not found' },
          { status: 404, headers: corsHeaders },
        )
      }

      return Response.json({
        ...metadata,
        fetchCommand: generateFetchCommand(metadata.tarballUrl),
        dependency: generateDependencyEntry(packageName, metadata.tarballUrl, metadata.hash),
      }, { headers: corsHeaders })
    }
  }

  // Not a Zig route
  return null
}

// Read lazily so token rotation takes effect without importing this module again.
function getRegistryToken(): string | undefined {
  return process.env.PANTRY_REGISTRY_TOKEN || process.env.PANTRY_TOKEN
}

/**
 * Validate authorization token
 */
function validateToken(authHeader: string | null): { valid: boolean, error?: string } {
  const registryToken = getRegistryToken()
  if (!registryToken) {
    return { valid: false, error: 'Server misconfigured — no registry token set' }
  }

  if (!authHeader) {
    return { valid: false, error: 'Authorization required' }
  }

  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : authHeader

  // Pad both to same length to prevent length-based timing leaks
  const maxLen = Math.max(token.length, registryToken.length)
  const tokenBuf = Buffer.alloc(maxLen)
  const legacyBuf = Buffer.alloc(maxLen)
  Buffer.from(token).copy(tokenBuf)
  Buffer.from(registryToken).copy(legacyBuf)
  const crypto = require('node:crypto')
  if (!crypto.timingSafeEqual(tokenBuf, legacyBuf) || token.length !== registryToken.length) {
    return { valid: false, error: 'Invalid token' }
  }

  return { valid: true }
}

/**
 * Handle Zig package publish
 */
async function handleZigPublish(
  req: Request,
  storage: ZigPackageStorage,
  baseUrl: string,
  corsHeaders: Record<string, string>,
  analytics?: AnalyticsStorage,
  malwareScanner?: MalwareScanner,
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
    const tarballFile = formData.get('tarball')
    const manifestStr = formData.get('manifest')
    const descriptionStr = formData.get('description')

    if (!tarballFile || !(tarballFile instanceof File)) {
      return Response.json(
        { error: 'Missing tarball' },
        { status: 400, headers: corsHeaders },
      )
    }

    // Enforce tarball size limit (50MB)
    if (tarballFile.size > 50 * 1024 * 1024) {
      return Response.json(
        { error: 'Tarball exceeds maximum size of 50MB' },
        { status: 413, headers: corsHeaders },
      )
    }

    const tarball = await tarballFile.arrayBuffer()

    // Parse manifest if provided, otherwise extract from tarball name
    let name: string
    let version: string

    if (manifestStr && typeof manifestStr === 'string') {
      const manifest = parseZigZon(manifestStr)
      name = manifest.name
      version = manifest.version
    }
    else {
      // Try to extract from filename: name-version.tar.gz
      const filename = tarballFile.name
      const match = filename.match(/^(.+)-(\d+\.\d+\.\d+)\.tar\.gz$/)
      if (!match) {
        return Response.json(
          { error: 'Could not determine package name/version. Provide manifest or use name-version.tar.gz filename.' },
          { status: 400, headers: corsHeaders },
        )
      }
      name = match[1]
      version = match[2]
    }

    // Canonicalize the package name. Zig's `.name` field must be a valid enum
    // literal, so packages declare it with underscores (e.g. `.zig_test_framework`),
    // but the registry's canonical name — and what the site/search index list — uses
    // hyphens (`zig-test-framework`). Normalize here so every publish, regardless of
    // client, lands under the canonical name instead of a parallel `_` namespace.
    name = name.replace(/_/g, '-')

    // Check if version already exists
    const exists = await storage.exists(name, version)
    if (exists) {
      return Response.json(
        { error: 'Version already exists' },
        { status: 409, headers: corsHeaders },
      )
    }

    if (!malwareScanner) throw new Error('malware scanner is required for publishing')
    const scan = await scanPackageArtifact(malwareScanner, tarball, {
      surface: 'zig',
      name,
      version,
      publisher: '_admin',
    })
    if (scan.verdict !== 'clean')
      return malwareScanFailureResponse(scan, corsHeaders)

    // Hash only a clean archive. The native compiler validates the archive and
    // manifest; build.zig is never executed and dependencies are never built.
    let hash: string
    try { hash = await computeZigHash(tarball) }
    catch (error) {
      if (!(error instanceof ZigPackageHashError)) throw error
      return Response.json({ error: error.message }, { status: error.status, headers: corsHeaders })
    }

    const tarballUrl = `${baseUrl}/zig/packages/${encodeURIComponent(name)}/${version}/tarball`

    const metadata: ZigPackageMetadata = {
      name,
      version,
      description: typeof descriptionStr === 'string' ? descriptionStr : undefined,
      tarballUrl,
      hash,
      artifactSha256: scan.artifactSha256,
      publishedAt: new Date().toISOString(),
      malwareScan: scan,
    }

    await storage.publish(metadata, tarball)

    // Track publish event
    analytics?.trackEvent({
      packageName: name,
      category: 'install_on_request',
      timestamp: new Date().toISOString(),
      version,
    }).catch(err => console.warn('Analytics tracking failed:', err))

    return Response.json({
      success: true,
      message: `Published ${name}@${version}`,
      hash,
      artifactSha256: scan.artifactSha256,
      tarballUrl,
      fetchCommand: generateFetchCommand(tarballUrl),
      dependency: generateDependencyEntry(name, tarballUrl, hash),
      scan: publicScanResult(scan),
    }, { status: 201, headers: corsHeaders })
  }

  return Response.json(
    { error: 'Unsupported content type. Use multipart/form-data.' },
    { status: 415, headers: corsHeaders },
  )
}

/**
 * Create default Zig storage
 */
export { createZigStorage }
