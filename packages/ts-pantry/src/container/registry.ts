import type { ImageReference, OciImageConfig, OciManifest } from './types'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import https from 'node:https'
import path from 'node:path'
import process from 'node:process'
import { digest, digestHex } from './oci'
import { MEDIA_TYPE } from './types'

/** Public pantry container registry (override with PANTRY_REGISTRY_URL). */
export const PANTRY_REGISTRY: string = (process.env.PANTRY_REGISTRY_URL || 'https://registry.pantry.dev').replace(/\/$/, '')
const DOCKER_HUB = 'registry-1.docker.io'

const ACCEPT_MANIFEST = [
  MEDIA_TYPE.manifest,
  MEDIA_TYPE.manifestList,
  MEDIA_TYPE.dockerManifest,
  MEDIA_TYPE.dockerManifestList,
].join(', ')

/**
 * Parse an image reference such as `oven/bun:1.3.10`, `alpine`,
 * `ghcr.io/owner/img@sha256:…`, or `registry.pantry.dev/team/img:tag`.
 */
export function parseImageRef(ref: string): ImageReference {
  let rest = ref
  let digestPin: string | undefined
  const at = rest.indexOf('@')
  if (at !== -1) {
    digestPin = rest.slice(at + 1)
    rest = rest.slice(0, at)
  }

  // Determine whether the first path segment is a registry host (contains a
  // dot or colon, or is `localhost`).
  const slash = rest.indexOf('/')
  let registry = ''
  let remainder = rest
  let implicitRegistry = true
  if (slash !== -1) {
    const first = rest.slice(0, slash)
    if (first === 'localhost' || first.includes('.') || first.includes(':')) {
      registry = first
      remainder = rest.slice(slash + 1)
      implicitRegistry = false
    }
  }

  let repository = remainder
  let tag = 'latest'
  const colon = remainder.lastIndexOf(':')
  if (colon !== -1 && !remainder.slice(colon).includes('/')) {
    repository = remainder.slice(0, colon)
    tag = remainder.slice(colon + 1)
  }

  // Docker Hub official images live under `library/`.
  if (implicitRegistry && !repository.includes('/'))
    repository = `library/${repository}`

  return { registry, repository, tag, digest: digestPin, implicitRegistry }
}

interface RequestResult {
  status: number
  headers: Record<string, string | string[] | undefined>
  body: Buffer
}

/** Low-level HTTPS request returning the buffered body (follows redirects). */
function request(
  url: string,
  opts: { method?: string, headers?: Record<string, string>, body?: Buffer, maxRedirects?: number } = {},
): Promise<RequestResult> {
  const { method = 'GET', headers = {}, body, maxRedirects = 5 } = opts
  return new Promise((resolve, reject) => {
    const u = new URL(url)
    const req = https.request(
      {
        method,
        hostname: u.hostname,
        port: u.port || 443,
        path: u.pathname + u.search,
        headers: { 'User-Agent': 'pantry-container', ...headers },
        timeout: 60000,
      },
      (res) => {
        const status = res.statusCode || 0
        if (status >= 300 && status < 400 && res.headers.location && maxRedirects > 0) {
          const loc = new URL(res.headers.location, url).toString()
          res.resume()
          // Drop auth on cross-origin redirect (blob CDNs reject foreign creds).
          const nextHeaders = { ...headers }
          if (new URL(loc).hostname !== u.hostname)
            delete nextHeaders.Authorization
          return request(loc, { method, headers: nextHeaders, body, maxRedirects: maxRedirects - 1 }).then(resolve, reject)
        }
        const chunks: Buffer[] = []
        res.on('data', c => chunks.push(c))
        res.on('end', () => resolve({ status, headers: res.headers, body: Buffer.concat(chunks) }))
      },
    )
    req.on('error', reject)
    req.on('timeout', () => {
      req.destroy()
      reject(new Error(`timeout: ${url}`))
    })
    if (body)
      req.write(body)
    req.end()
  })
}

/** Stream a URL to a file, following redirects. Returns bytes written. */
function download(url: string, dest: string, headers: Record<string, string> = {}, maxRedirects = 5): Promise<number> {
  return new Promise((resolve, reject) => {
    const u = new URL(url)
    const req = https.get(
      {
        hostname: u.hostname,
        port: u.port || 443,
        path: u.pathname + u.search,
        headers: { 'User-Agent': 'pantry-container', ...headers },
        timeout: 120000,
      },
      (res) => {
        const status = res.statusCode || 0
        if (status >= 300 && status < 400 && res.headers.location && maxRedirects > 0) {
          res.resume()
          const loc = new URL(res.headers.location, url).toString()
          const nextHeaders = { ...headers }
          if (new URL(loc).hostname !== u.hostname)
            delete nextHeaders.Authorization
          return download(loc, dest, nextHeaders, maxRedirects - 1).then(resolve, reject)
        }
        if (status < 200 || status >= 300) {
          res.resume()
          return reject(new Error(`HTTP ${status} downloading ${url}`))
        }
        const out = fs.createWriteStream(dest)
        let written = 0
        res.on('data', (c) => { written += c.length })
        res.pipe(out)
        out.on('finish', () => out.close(() => resolve(written)))
        out.on('error', reject)
      },
    )
    req.on('error', reject)
    req.on('timeout', () => {
      req.destroy()
      reject(new Error(`timeout: ${url}`))
    })
  })
}

/**
 * Obtain a bearer token for a registry host + repository scope. Implements the
 * standard Docker token flow (the 401 WWW-Authenticate challenge) and uses
 * PANTRY_REGISTRY_TOKEN for the pantry registry.
 */
async function authToken(host: string, repository: string, actions: string): Promise<string | undefined> {
  const base = host === 'pantry' ? PANTRY_REGISTRY : `https://${host}`
  // Pantry registry: static token auth.
  if (base === PANTRY_REGISTRY) {
    const tok = process.env.PANTRY_REGISTRY_TOKEN || process.env.PANTRY_TOKEN
    return tok || undefined
  }

  const probe = await request(`${base}/v2/`)
  if (probe.status !== 401)
    return undefined
  const challenge = String(probe.headers['www-authenticate'] || '')
  const realm = /realm="([^"]+)"/.exec(challenge)?.[1]
  const service = /service="([^"]+)"/.exec(challenge)?.[1]
  if (!realm)
    return undefined
  const tokenUrl = new URL(realm)
  if (service)
    tokenUrl.searchParams.set('service', service)
  tokenUrl.searchParams.set('scope', `repository:${repository}:${actions}`)

  // Anonymous credentials cover public pulls; DOCKER_USERNAME/PASSWORD enable
  // private repos and push.
  const headers: Record<string, string> = {}
  const user = process.env.DOCKER_USERNAME
  const pass = process.env.DOCKER_PASSWORD || process.env.DOCKER_TOKEN
  if (user && pass)
    headers.Authorization = `Basic ${Buffer.from(`${user}:${pass}`).toString('base64')}`

  const res = await request(tokenUrl.toString(), { headers })
  if (res.status !== 200)
    return undefined
  const json = JSON.parse(res.body.toString()) as { token?: string, access_token?: string }
  return json.token || json.access_token
}

/** Resolve which base URL + host-key to use, honoring pantry-first lookup. */
function resolveHosts(ref: ImageReference): Array<{ base: string, hostKey: string }> {
  if (!ref.implicitRegistry && ref.registry) {
    // Explicit registry — use it directly. If it's our own host, use the
    // pantry token path.
    const isPantry = PANTRY_REGISTRY.includes(ref.registry)
    return [{ base: isPantry ? PANTRY_REGISTRY : `https://${ref.registry}`, hostKey: isPantry ? 'pantry' : ref.registry }]
  }
  // Implicit registry: try the pantry registry first, then Docker Hub.
  return [
    { base: PANTRY_REGISTRY, hostKey: 'pantry' },
    { base: `https://${DOCKER_HUB}`, hostKey: DOCKER_HUB },
  ]
}

export interface PulledImage {
  manifest: OciManifest
  manifestDigest: string
  config: OciImageConfig
  /** Layer blob files on disk, in order, with their digests + diffIds. */
  layers: Array<{ digest: string, diffId: string, path: string, size: number }>
  /** Which registry served the image. */
  source: string
}

async function fetchManifest(base: string, repository: string, ref: string, token?: string): Promise<RequestResult> {
  const headers: Record<string, string> = { Accept: ACCEPT_MANIFEST }
  if (token)
    headers.Authorization = `Bearer ${token}`
  return request(`${base}/v2/${repository}/manifests/${ref}`, { headers })
}

/**
 * Pull an image's manifest, config, and layer blobs into `blobDir`. Tries the
 * pantry registry first for implicit refs, then Docker Hub.
 */
export async function pullImage(refStr: string, blobDir: string, opts: { platform?: string, quiet?: boolean } = {}): Promise<PulledImage> {
  const ref = parseImageRef(refStr)
  const wantOs = (opts.platform?.split('/')[0]) || 'linux'
  const wantArch = (opts.platform?.split('/')[1]) || (process.arch === 'arm64' ? 'arm64' : 'amd64')
  fs.mkdirSync(blobDir, { recursive: true })

  let lastErr: Error | undefined
  for (const { base, hostKey } of resolveHosts(ref)) {
    try {
      const token = await authToken(hostKey, ref.repository, 'pull')
      const reference = ref.digest || ref.tag
      let res = await fetchManifest(base, ref.repository, reference, token)
      if (res.status === 404 || res.status === 401) {
        lastErr = new Error(`${base}: HTTP ${res.status} for ${ref.repository}:${reference}`)
        continue
      }
      if (res.status !== 200)
        throw new Error(`${base}: manifest HTTP ${res.status}`)

      let manifest = JSON.parse(res.body.toString()) as any
      // Multi-arch index → select the matching platform manifest.
      if (manifest.manifests && Array.isArray(manifest.manifests)) {
        const pick = manifest.manifests.find((m: any) => m.platform?.os === wantOs && m.platform?.architecture === wantArch)
          || manifest.manifests.find((m: any) => m.platform?.architecture === wantArch)
          || manifest.manifests[0]
        if (!pick)
          throw new Error('no matching platform in image index')
        res = await fetchManifest(base, ref.repository, pick.digest, token)
        if (res.status !== 200)
          throw new Error(`${base}: platform manifest HTTP ${res.status}`)
        manifest = JSON.parse(res.body.toString())
      }

      const manifestDigest = digest(res.body)
      const authHeader: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {}

      // Config blob.
      const configDigest = manifest.config.digest
      const configRes = await request(`${base}/v2/${ref.repository}/blobs/${configDigest}`, { headers: authHeader })
      if (configRes.status !== 200)
        throw new Error(`${base}: config blob HTTP ${configRes.status}`)
      const config = JSON.parse(configRes.body.toString()) as OciImageConfig

      // Layer blobs → stream to disk.
      const layers: PulledImage['layers'] = []
      const diffIds = config.rootfs?.diff_ids || []
      for (let i = 0; i < manifest.layers.length; i++) {
        const layer = manifest.layers[i]
        const dest = path.join(blobDir, `${digestHex(layer.digest)}.tar.gz`)
        if (!opts.quiet)
          console.error(`  ↓ layer ${i + 1}/${manifest.layers.length} ${layer.digest.slice(0, 19)}…`)
        const size = await download(`${base}/v2/${ref.repository}/blobs/${layer.digest}`, dest, authHeader)
        layers.push({ digest: layer.digest, diffId: diffIds[i] || '', path: dest, size })
      }

      return { manifest, manifestDigest, config, layers, source: base }
    }
    catch (err) {
      lastErr = err as Error
    }
  }
  throw new Error(`Failed to pull ${refStr}: ${lastErr?.message || 'unknown error'}`)
}

/**
 * Push an image (config + layers + manifest) to a registry using the OCI
 * distribution monolithic-upload flow. Defaults to the pantry registry.
 */
export async function pushImage(opts: {
  repository: string
  tag: string
  registry?: string
  configBytes: Buffer
  configDigest: string
  layers: Array<{ digest: string, path: string, size: number }>
  manifestBytes: Buffer
  manifestMediaType: string
  quiet?: boolean
}): Promise<{ ref: string, digest: string }> {
  const base = (opts.registry || PANTRY_REGISTRY).replace(/\/$/, '')
  const hostKey = base === PANTRY_REGISTRY ? 'pantry' : new URL(base).hostname
  const token = await authToken(hostKey, opts.repository, 'push,pull')
  const auth: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {}

  const pushBlob = async (digestStr: string, data: Buffer): Promise<void> => {
    const head = await request(`${base}/v2/${opts.repository}/blobs/${digestStr}`, { method: 'HEAD', headers: auth })
    if (head.status === 200)
      return
    const start = await request(`${base}/v2/${opts.repository}/blobs/uploads/`, { method: 'POST', headers: auth })
    if (start.status !== 202)
      throw new Error(`push: upload start HTTP ${start.status} for ${opts.repository}`)
    const location = String(start.headers.location || '')
    const putUrl = new URL(location, base)
    putUrl.searchParams.set('digest', digestStr)
    const put = await request(putUrl.toString(), {
      method: 'PUT',
      headers: { ...auth, 'Content-Type': 'application/octet-stream' },
      body: data,
    })
    if (put.status !== 201)
      throw new Error(`push: blob PUT HTTP ${put.status}`)
  }

  // Config + layer blobs.
  if (!opts.quiet)
    console.error('  ↑ config')
  await pushBlob(opts.configDigest, opts.configBytes)
  for (let i = 0; i < opts.layers.length; i++) {
    if (!opts.quiet)
      console.error(`  ↑ layer ${i + 1}/${opts.layers.length}`)
    await pushBlob(opts.layers[i].digest, fs.readFileSync(opts.layers[i].path))
  }

  // Manifest.
  const manifestDigest = digest(opts.manifestBytes)
  const put = await request(`${base}/v2/${opts.repository}/manifests/${opts.tag}`, {
    method: 'PUT',
    headers: { ...auth, 'Content-Type': opts.manifestMediaType },
    body: opts.manifestBytes,
  })
  if (put.status !== 201 && put.status !== 200)
    throw new Error(`push: manifest PUT HTTP ${put.status}`)

  return { ref: `${base.replace(/^https?:\/\//, '')}/${opts.repository}:${opts.tag}`, digest: manifestDigest }
}

/**
 * Verify a gzipped layer blob on disk matches its digest. Used after pulls.
 */
export function verifyBlob(filePath: string, expectedDigest: string): boolean {
  const hash = createHash('sha256')
  hash.update(fs.readFileSync(filePath))
  return `sha256:${hash.digest('hex')}` === expectedDigest
}

/** Extract a gzipped layer tarball into a rootfs dir (system tar). */
export function extractLayer(layerGzPath: string, rootfsDir: string): void {
  fs.mkdirSync(rootfsDir, { recursive: true })
  execFileSync('tar', ['xzf', layerGzPath, '-C', rootfsDir], { stdio: 'pipe', maxBuffer: 1024 * 1024 * 512 })
}
