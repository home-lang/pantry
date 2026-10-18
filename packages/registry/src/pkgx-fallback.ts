// On-the-fly pkgx fallback for the install path.
//
// When a user installs a version we have NOT published, we try to download the
// official prebuilt from pkgx (dist.pkgx.dev) on demand instead of failing:
//   1. augmentMetadataWithPkgx() advertises tracked-but-unpublished versions in
//      metadata.json — but ONLY the (version, platform) pairs pkgx actually serves
//      (HEAD-verified, cached) — so the CLI can resolve them without ever being
//      pointed at a binary that doesn't exist.
//   2. materializeFromPkgx() runs on the first tarball request: download the pkgx
//      .tar.xz, repackage to our flat .tar.gz, upload it (+ .sha256) and patch
//      metadata.json, then the normal serving path takes over. Subsequent installs
//      hit S3 directly.
// If pkgx has no such binary, nothing is advertised / materialized and the caller
// returns its normal "not found" error.

import { BinaryPublishError, type BinaryArtifactPublisher } from './binary-publishing'
import { createHash } from 'node:crypto'
import { execSync } from 'node:child_process'
import { createReadStream, createWriteStream, existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { BoundedTtlCache } from './runtime-cache'

import { ALL_PLATFORMS as BUILD_PLATFORMS } from './platforms'

// Custom builds: we deliberately compile these with our own configure flags /
// extensions, so pkgx's vanilla binary would silently drop them. NEVER serve these
// from pkgx — they only ever come from our own build.
const CUSTOM_BUILD_DOMAINS = new Set<string>([
  'php.net',
  'postgresql.org',
  // Pantry owns curl's source-built release path and links it against OpenSSL 3.
  // Never replace a missing Pantry artifact with a differently linked pkgx build.
  'curl.se',
  // mysql.com is compiled with `-DWITH_ICU=bundled`, `-DWITH_SSL` pointed at
  // pantry's openssl, and libtirpc for the Sun RPC headers glibc dropped.
  // pkgx's vanilla build has none of that: its mysqld links an EXTERNAL
  // `libicuuc.so.<major>` that the registry does not carry, so the binary
  // installs cleanly and then cannot start at all. Observed on a real box as
  // "libicuuc.so.71: cannot open shared object file".
  'mysql.com',
])

export function isCustomBuildDomain(domain: string): boolean {
  return CUSTOM_BUILD_DOMAINS.has(domain)
}

export interface MaterializeResult { tarballKey: string, sha256: string, size: number }
interface PlatformBinary { tarball: string, sha256: string, size: number, uploadedAt: string }
interface PackageMetadata {
  name?: string
  latestVersion?: string
  versions?: Record<string, { platforms?: Record<string, PlatformBinary> }>
  updatedAt?: string
  malwareQuarantines?: Array<{
    version: string
    platforms: string[]
    artifactSha256: string
  }>
}

function pkgxOsArch(platform: string): { os: string, arch: string } | null {
  const dash = platform.indexOf('-')
  const os = dash > 0 ? platform.slice(0, dash) : ''
  const a = dash > 0 ? platform.slice(dash + 1) : ''
  const arch = a === 'arm64' ? 'aarch64' : a === 'x86-64' ? 'x86-64' : ''
  if ((os !== 'darwin' && os !== 'linux') || !arch)
    return null
  return { os, arch }
}

export function pkgxDistUrl(domain: string, version: string, platform: string): string | null {
  const m = pkgxOsArch(platform)
  if (!m)
    return null
  return `https://dist.pkgx.dev/${domain}/${m.os}/${m.arch}/v${version}.tar.xz`
}

function tarballKeyFor(domain: string, version: string, platform: string): string {
  return `binaries/${domain}/${version}/${platform}/${domain.replace(/\//g, '-')}-${version}.tar.gz`
}

// Loose newest-first comparator: numeric dotted segments compared as ints, so e.g.
// 1.10.0 sorts above 1.9.0. Non-numeric tails fall back to string compare.
function compareVersionsDesc(a: string, b: string): number {
  const pa = a.split(/[.+-]/)
  const pb = b.split(/[.+-]/)
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const na = Number(pa[i])
    const nb = Number(pb[i])
    if (Number.isNaN(na) || Number.isNaN(nb)) {
      const s = (pb[i] || '').localeCompare(pa[i] || '')
      if (s !== 0)
        return s
    }
    else if (na !== nb) {
      return nb - na
    }
  }
  return 0
}

// ── availability cache (HEAD dist.pkgx.dev) ──────────────────────────────────
const AVAIL_TTL_MS = 6 * 60 * 60 * 1000
const _availCache = new BoundedTtlCache<string, boolean>(20_000, AVAIL_TTL_MS)

export async function pkgxHasBinary(domain: string, version: string, platform: string): Promise<boolean> {
  if (isCustomBuildDomain(domain))
    return false
  const url = pkgxDistUrl(domain, version, platform)
  if (!url)
    return false
  const cacheKey = `${domain}@${version}#${platform}`
  const cached = _availCache.get(cacheKey)
  if (cached !== undefined)
    return cached
  let ok = false
  try {
    const res = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(8000) })
    ok = res.ok
  }
  catch {
    ok = false
  }
  _availCache.set(cacheKey, ok)
  return ok
}

// (domain, version, platform) pairs we have ADVERTISED via metadata augmentation
// but not yet materialized. The tarball route consults this so published versions
// keep their zero-round-trip optimistic redirect — only a pkgx-advertised version
// pays the existence-check + materialize cost.
const _pending = new Set<string>()
function pendKey(domain: string, version: string, platform: string): string {
  return `${domain}@${version}#${platform}`
}
export function isPendingMaterialize(domain: string, version: string, platform: string): boolean {
  return _pending.has(pendKey(domain, version, platform))
}

export function isQuarantinedFallback(
  metadata: PackageMetadata | null,
  version: string,
  platform: string,
): boolean {
  return metadata?.malwareQuarantines?.some(
    quarantine => quarantine.version === version
      && quarantine.platforms.includes(platform),
  ) === true
}

// ── metadata augmentation ────────────────────────────────────────────────────
const AUG_TTL_MS = 30 * 60 * 1000
const _augCache = new BoundedTtlCache<string, { sourceFingerprint: string, data: PackageMetadata }>(1_000, AUG_TTL_MS)
// How many of the most-recent tracked-but-unpublished versions to probe on pkgx.
const MAX_AUGMENT_VERSIONS = 20

/**
 * Merge pkgx-available versions into a package's metadata so the CLI can resolve a
 * version we track but haven't published yet. Only (version, platform) pairs that
 * pkgx actually serves are added — HEAD-verified, so the CLI is never pointed at a
 * binary that 404s. `catalogVersions` is the full tracked version list (newest-first
 * preferred); anything already in `published` is left untouched.
 */
export async function augmentMetadataWithPkgx(
  domain: string,
  published: PackageMetadata | null,
  catalogVersions: string[],
): Promise<PackageMetadata | null> {
  if (isCustomBuildDomain(domain))
    return published
  const sourceFingerprint = published
    ? `${published.updatedAt || ''}:${published.latestVersion || ''}:${Object.keys(published.versions || {}).length}`
    : 'unpublished'
  const cached = _augCache.get(domain)
  if (cached && cached.sourceFingerprint === sourceFingerprint)
    return cached.data

  const base: PackageMetadata = published
    ? { ...published, versions: { ...(published.versions || {}) } }
    : { name: domain, latestVersion: '', versions: {}, updatedAt: new Date().toISOString() }
  base.versions ??= {}

  // Candidate = tracked versions we haven't fully covered, newest-first, capped.
  const candidates = catalogVersions
    .filter(v => v && v !== '999.999.999' && v !== '0.0.0')
    .sort(compareVersionsDesc)
    .filter((v) => {
      const have = base.versions![v]?.platforms
      return !have || BUILD_PLATFORMS.some(p => !have[p])
    })
    .slice(0, MAX_AUGMENT_VERSIONS)

  await Promise.all(candidates.map(async (version) => {
    const present = base.versions![version]?.platforms || {}
    const missing = BUILD_PLATFORMS.filter(
      p => !present[p] && !isQuarantinedFallback(published, version, p),
    )
    const found = await Promise.all(missing.map(async p => ({ p, ok: await pkgxHasBinary(domain, version, p) })))
    const avail = found.filter(f => f.ok)
    if (avail.length === 0)
      return
    base.versions![version] ??= { platforms: {} }
    base.versions![version].platforms ??= {}
    for (const { p } of avail) {
      // Advertise the deterministic tarball key; the bytes are materialized lazily
      // on first fetch. sha256/size are filled in then (the CLI tolerates absence
      // and re-reads the .sha256 file alongside the tarball).
      base.versions![version].platforms![p] = {
        tarball: tarballKeyFor(domain, version, p),
        sha256: '',
        size: 0,
        uploadedAt: '',
      }
      _pending.add(pendKey(domain, version, p))
    }
  }))

  _augCache.set(domain, { sourceFingerprint, data: base })
  return base
}

// ── lazy materialization ─────────────────────────────────────────────────────
const _inflight = new Map<string, Promise<MaterializeResult | null>>()

async function sha256File(path: string): Promise<string> {
  const hash = createHash('sha256')
  for await (const chunk of createReadStream(path))
    hash.update(chunk)
  return hash.digest('hex')
}

/**
 * Download domain@version for `platform` from pkgx, repackage to our flat .tar.gz,
 * upload it (+ .sha256) and patch metadata.json. Returns null if pkgx has no such
 * binary (caller then returns its normal not-found error). Concurrency-safe per key.
 */
export async function materializeFromPkgx(
  domain: string,
  version: string,
  platform: string,
  publisher: BinaryArtifactPublisher,
): Promise<MaterializeResult | null> {
  if (isCustomBuildDomain(domain))
    return null
  const key = `${domain}@${version}#${platform}`
  const existing = _inflight.get(key)
  if (existing)
    return existing

  const job = (async (): Promise<MaterializeResult | null> => {
    const url = pkgxDistUrl(domain, version, platform)
    if (!url)
      return null
    const safe = domain.replace(/\//g, '-')
    const tarballKey = tarballKeyFor(domain, version, platform)
    const work = mkdtempSync(join(tmpdir(), `pkgx-${safe}-`))
    try {
      const xzPath = join(work, 'pkg.tar.xz')
      const res = await fetch(url, { signal: AbortSignal.timeout(120000) })
      if (res.status === 404)
        return null
      if (!res.ok || !res.body)
        throw new Error(`pkgx download unavailable: HTTP ${res.status}`)
      await pipeline(
        Readable.fromWeb(res.body as never),
        createWriteStream(xzPath),
      )
      const exDir = join(work, 'ex')
      mkdirSync(exDir, { recursive: true })
      execSync(`tar -xJf "${xzPath}" -C "${exDir}"`, { stdio: 'pipe' })

      // pkgx tarballs nest under <domain>/v<version>/ — flatten that prefix.
      let root = join(exDir, domain, `v${version}`)
      if (!existsSync(root)) {
        const domDir = join(exDir, domain)
        const vs = existsSync(domDir) ? readdirSync(domDir).filter(d => d.startsWith('v')) : []
        if (vs.length === 1)
          root = join(domDir, vs[0])
      }
      if (!existsSync(root))
        throw new Error('pkgx archive is missing its package directory')

      const gzPath = join(work, 'out.tar.gz')
      execSync(`tar -czf "${gzPath}" -C "${root}" .`, { stdio: 'pipe' })
      const size = statSync(gzPath).size
      const sha256 = await sha256File(gzPath)
      const initiated = publisher.initiate({
        domain,
        version,
        platforms: [platform],
        filename: `${safe}-${version}.tar.gz`,
        size,
        sha256,
      })
      const upload = await fetch(initiated.uploadUrl, {
        method: 'PUT',
        headers: {
          ...initiated.uploadHeaders,
          'Content-Length': String(size),
        },
        body: Bun.file(gzPath),
      })
      if (!upload.ok)
        throw new Error(`pkgx staged upload failed with HTTP ${upload.status}`)
      // Materialization runs in-process with nothing to poll a retryable 425
      // with, so wait for the actual verdict.
      await publisher.completeAwaitingScan(initiated.uploadId, '_pkgx', 'pkgx')
      _augCache.delete(domain) // augmented view is stale now that this is real
      _pending.delete(pendKey(domain, version, platform))
      return { tarballKey, sha256, size }
    }
    catch (err) {
      if (err instanceof BinaryPublishError && err.code === 'MALWARE_DETECTED') {
        _augCache.delete(domain)
        _pending.delete(pendKey(domain, version, platform))
        return null
      }
      console.error(`pkgx materialize failed for ${key}:`, (err as Error).message)
      throw err
    }
    finally {
      try { rmSync(work, { recursive: true, force: true }) }
      catch { /* best-effort */ }
    }
  })()

  _inflight.set(key, job)
  try {
    return await job
  }
  finally {
    _inflight.delete(key)
  }
}
