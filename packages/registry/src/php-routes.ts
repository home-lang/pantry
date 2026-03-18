/**
 * PHP/Composer Package Routes
 *
 * Endpoints:
 * GET  /php/packages/{vendor}/{package}                  - Get latest package metadata
 * GET  /php/packages/{vendor}/{package}/{version}        - Get specific version metadata
 * GET  /php/packages/{vendor}/{package}/{version}/tarball - Download tarball
 * GET  /php/packages/{vendor}/{package}/versions         - List all versions
 * GET  /php/search?q={query}&limit={n}                   - Search packages
 * POST /php/publish                                      - Publish a PHP package
 * DELETE /php/packages/{vendor}/{package}                 - Delete package (auth required)
 */

import {
  computePhpChecksum,
  createPhpStorage,
  generateComposerRequire,
  parseComposerJson,
  type PhpPackageMetadata,
  type PhpPackageStorage,
} from './php'

/**
 * Handle PHP package routes
 */
export async function handlePhpRoutes(
  path: string,
  req: Request,
  url: URL,
  storage: PhpPackageStorage,
  baseUrl: string,
  corsHeaders: Record<string, string>,
): Promise<Response | null> {
  // Remove /php prefix
  const phpPath = path.replace(/^\/php/, '')

  // GET /php/search
  if (phpPath === '/search' && req.method === 'GET') {
    const query = url.searchParams.get('q') || ''
    const limit = Number.parseInt(url.searchParams.get('limit') || '20', 10)
    const results = await storage.search(query, limit)

    return Response.json({
      results: results.map(r => ({
        name: r.name,
        version: r.latest,
        description: r.description,
        keywords: r.keywords,
        authors: r.authors,
        type: r.type,
      })),
    }, { headers: corsHeaders })
  }

  // POST /php/publish
  if (phpPath === '/publish' && req.method === 'POST') {
    return handlePhpPublish(req, storage, baseUrl, corsHeaders)
  }

  // DELETE /php/packages/{vendor}/{package}
  const deleteMatch = phpPath.match(/^\/packages\/([^/]+)\/([^/]+)$/)
  if (deleteMatch && req.method === 'DELETE') {
    const authResult = validateToken(req.headers.get('authorization'))
    if (!authResult.valid) {
      return Response.json({ error: authResult.error }, { status: 401, headers: corsHeaders })
    }
    const packageName = `${decodeURIComponent(deleteMatch[1])}/${decodeURIComponent(deleteMatch[2])}`
    await storage.deletePackage(packageName)
    return Response.json({ success: true, message: `Deleted ${packageName}` }, { headers: corsHeaders })
  }

  // Package routes: /php/packages/{vendor}/{package}...
  const packageMatch = phpPath.match(/^\/packages\/([^/]+)\/([^/]+)(?:\/(.+))?$/)
  if (packageMatch) {
    const packageName = `${decodeURIComponent(packageMatch[1])}/${decodeURIComponent(packageMatch[2])}`
    const rest = packageMatch[3]

    // GET /php/packages/{vendor}/{package}/versions
    if (rest === 'versions' && req.method === 'GET') {
      const versions = await storage.listVersions(packageName)
      return Response.json({ name: packageName, versions }, { headers: corsHeaders })
    }

    // GET /php/packages/{vendor}/{package}/{version}/tarball
    if (rest?.endsWith('/tarball') && req.method === 'GET') {
      const version = rest.replace('/tarball', '')
      const tarball = await storage.downloadTarball(packageName, version)

      if (!tarball) {
        return Response.json(
          { error: 'Package not found' },
          { status: 404, headers: corsHeaders },
        )
      }

      return new Response(tarball, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/gzip',
          'Content-Disposition': `attachment; filename="${packageName.replace('/', '-')}-${version}.tar.gz"`,
        },
      })
    }

    // GET /php/packages/{vendor}/{package}/{version}
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
        composerRequire: generateComposerRequire(packageName, metadata.version),
      }, { headers: corsHeaders })
    }

    // GET /php/packages/{vendor}/{package}
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
        composerRequire: generateComposerRequire(packageName, metadata.version),
      }, { headers: corsHeaders })
    }
  }

  // Not a PHP route
  return null
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

  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : authHeader

  if (token !== REGISTRY_TOKEN) {
    return { valid: false, error: 'Invalid token' }
  }

  return { valid: true }
}

/**
 * Handle PHP package publish
 */
async function handlePhpPublish(
  req: Request,
  storage: PhpPackageStorage,
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

    const tarball = await tarballFile.arrayBuffer()
    const checksum = computePhpChecksum(tarball)

    // Parse manifest if provided, otherwise extract from tarball name
    let name: string
    let version: string
    let type: string | undefined
    let license: string | string[] | undefined
    let homepage: string | undefined
    let authors: { name?: string, email?: string }[] | undefined
    let keywords: string[] | undefined

    if (manifestStr && typeof manifestStr === 'string') {
      const manifest = parseComposerJson(manifestStr)
      name = manifest.name
      version = manifest.version || ''
      type = manifest.type
      license = manifest.license
      homepage = manifest.homepage
      authors = manifest.authors
      keywords = manifest.keywords
    }
    else {
      // Try to extract from filename: vendor-package-version.tar.gz
      const filename = tarballFile.name
      const match = filename.match(/^(.+)-(\d+\.\d+\.\d+)\.tar\.gz$/)
      if (!match) {
        return Response.json(
          { error: 'Could not determine package name/version. Provide manifest or use vendor-package-version.tar.gz filename.' },
          { status: 400, headers: corsHeaders },
        )
      }
      name = match[1].replace('-', '/')
      version = match[2]
    }

    // Check if version already exists
    const exists = await storage.exists(name, version)
    if (exists) {
      return Response.json(
        { error: 'Version already exists' },
        { status: 409, headers: corsHeaders },
      )
    }

    const encodedName = name.split('/').map(encodeURIComponent).join('/')
    const tarballUrl = `${baseUrl}/php/packages/${encodedName}/${version}/tarball`

    const metadata: PhpPackageMetadata = {
      name,
      version,
      description: typeof descriptionStr === 'string' ? descriptionStr : undefined,
      type,
      license,
      homepage,
      authors,
      keywords,
      tarballUrl,
      checksum,
      publishedAt: new Date().toISOString(),
    }

    await storage.publish(metadata, tarball)

    return Response.json({
      success: true,
      message: `Published ${name}@${version}`,
      checksum,
      tarballUrl,
      composerRequire: generateComposerRequire(name, version),
    }, { status: 201, headers: corsHeaders })
  }

  return Response.json(
    { error: 'Unsupported content type. Use multipart/form-data.' },
    { status: 415, headers: corsHeaders },
  )
}

/**
 * Create default PHP storage
 */
export { createPhpStorage }
