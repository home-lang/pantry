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
): Promise<Response | null> {
  // Remove /zig prefix
  const zigPath = path.replace(/^\/zig/, '')

  // GET /zig/search
  if (zigPath === '/search' && req.method === 'GET') {
    const query = url.searchParams.get('q') || ''
    const limit = Number.parseInt(url.searchParams.get('limit') || '20', 10)
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
  const hashMatch = zigPath.match(/^\/hash\/([a-f0-9]+)$/i)
  if (hashMatch && req.method === 'GET') {
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
    return handleZigPublish(req, storage, baseUrl, corsHeaders)
  }

  // Package routes: /zig/packages/{name}...
  const packageMatch = zigPath.match(/^\/packages\/([^/]+)(?:\/(.+))?$/)
  if (packageMatch) {
    const packageName = decodeURIComponent(packageMatch[1])
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

/**
 * Handle Zig package publish
 */
async function handleZigPublish(
  req: Request,
  storage: ZigPackageStorage,
  baseUrl: string,
  corsHeaders: Record<string, string>,
): Promise<Response> {
  const contentType = req.headers.get('content-type') || ''

  // Check authorization
  const authHeader = req.headers.get('authorization')
  if (!authHeader) {
    return Response.json(
      { error: 'Authorization required' },
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
    const hash = computeZigHash(tarball)

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

    // Check if version already exists
    const exists = await storage.exists(name, version)
    if (exists) {
      return Response.json(
        { error: 'Version already exists' },
        { status: 409, headers: corsHeaders },
      )
    }

    const tarballUrl = `${baseUrl}/zig/packages/${encodeURIComponent(name)}/${version}/tarball`

    const metadata: ZigPackageMetadata = {
      name,
      version,
      description: typeof descriptionStr === 'string' ? descriptionStr : undefined,
      tarballUrl,
      hash,
      publishedAt: new Date().toISOString(),
    }

    await storage.publish(metadata, tarball)

    return Response.json({
      success: true,
      message: `Published ${name}@${version}`,
      hash,
      tarballUrl,
      fetchCommand: generateFetchCommand(tarballUrl),
      dependency: generateDependencyEntry(name, tarballUrl, hash),
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
