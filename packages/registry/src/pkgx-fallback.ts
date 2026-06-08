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

import type { S3Client } from './storage/aws-client'
import { createHash } from 'node:crypto'
import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const BUILD_PLATFORMS = ['darwin-arm64', 'darwin-x86-64', 'linux-x86-64', 'linux-arm64'] as const

// Custom builds: we deliberately compile these with our own configure flags /
// extensions, so pkgx's vanilla binary would silently drop them. NEVER serve these
// from pkgx — they only ever come from our own build.
const CUSTOM_BUILD_DOMAINS = new Set<string>(['php.net', 'postgresql.org'])

export interface MaterializeResult { tarballKey: string, sha256: string, size: number }
interface PlatformBinary { tarball: string, sha256: string, size: number, uploadedAt: string }
interface PackageMetadata {
  name?: string
  latestVersion?: string
  versions?: Record<string, { platforms?: Record<string, PlatformBinary> }>
  updatedAt?: string
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
const _availCache = new Map<string, { at: number, ok: boolean }>()
const AVAIL_TTL_MS = 6 * 60 * 60 * 1000

export async function pkgxHasBinary(domain: string, version: string, platform: string): Promise<boolean> {
  if (CUSTOM_BUILD_DOMAINS.has(domain))
    return false
  const url = pkgxDistUrl(domain, version, platform)
  if (!url)
    return false
  const cacheKey = `${domain}@${version}#${platform}`
  const cached = _availCache.get(cacheKey)
  if (cached && Date.now() - cached.at < AVAIL_TTL_MS)
    return cached.ok
  let ok = false
  try {
    const res = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(8000) })
    ok = res.ok
  }
  catch {
    ok = false
  }
  _availCache.set(cacheKey, { at: Date.now(), ok })
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

// ── metadata augmentation ────────────────────────────────────────────────────
const _augCache = new Map<string, { at: number, data: PackageMetadata }>()
const AUG_TTL_MS = 30 * 60 * 1000
// How many of the most-recent tracked-but-unpublished versions to probe on pkgx.
const MAX_AUGMENT_VERSIONS = 12

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
  if (CUSTOM_BUILD_DOMAINS.has(domain))
    return published
  const cached = _augCache.get(domain)
  if (cached && Date.now() - cached.at < AUG_TTL_MS)
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
    const missing = BUILD_PLATFORMS.filter(p => !present[p])
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

  _augCache.set(domain, { at: Date.now(), data: base })
  return base
}

// ── lazy materialization ─────────────────────────────────────────────────────
const _inflight = new Map<string, Promise<MaterializeResult | null>>()

/**
 * Download domain@version for `platform` from pkgx, repackage to our flat .tar.gz,
 * upload it (+ .sha256) and patch metadata.json. Returns null if pkgx has no such
 * binary (caller then returns its normal not-found error). Concurrency-safe per key.
 */
export async function materializeFromPkgx(
  domain: string,
  version: string,
  platform: string,
  bucket: string,
  s3: S3Client,
): Promise<MaterializeResult | null> {
  if (CUSTOM_BUILD_DOMAINS.has(domain))
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
      let xzBuf: Buffer
      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(120000) })
        if (!res.ok)
          return null
        xzBuf = Buffer.from(await res.arrayBuffer())
      }
      catch {
        return null
      }
      const xzPath = join(work, 'pkg.tar.xz')
      const exDir = join(work, 'ex')
      writeFileSync(xzPath, xzBuf)
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
        return null

      const gzPath = join(work, 'out.tar.gz')
      execSync(`tar -czf "${gzPath}" -C "${root}" .`, { stdio: 'pipe' })
      const gzBuf = readFileSync(gzPath)
      const sha256 = createHash('sha256').update(gzBuf).digest('hex')

      await s3.putObject({ bucket, key: tarballKey, body: gzBuf, contentType: 'application/gzip' })
      await s3.putObject({ bucket, key: `${tarballKey}.sha256`, body: `${sha256}  ${safe}-${version}.tar.gz\n`, contentType: 'text/plain' })
      await upsertMetadata(domain, version, platform, { tarball: tarballKey, sha256, size: gzBuf.length, uploadedAt: new Date().toISOString() }, bucket, s3)
      _augCache.delete(domain) // augmented view is stale now that this is real
      _pending.delete(pendKey(domain, version, platform))
      return { tarballKey, sha256, size: gzBuf.length }
    }
    catch (err) {
      console.error(`pkgx materialize failed for ${key}:`, (err as Error).message)
      return null
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

async function upsertMetadata(
  domain: string,
  version: string,
  platform: string,
  info: PlatformBinary,
  bucket: string,
  s3: S3Client,
): Promise<void> {
  const metaKey = `binaries/${domain}/metadata.json`
  let meta: PackageMetadata = { name: domain, latestVersion: version, versions: {}, updatedAt: new Date().toISOString() }
  try {
    meta = JSON.parse((await s3.getObjectBuffer(bucket, metaKey)).toString('utf8')) as PackageMetadata
  }
  catch { /* no metadata yet — start fresh */ }
  meta.versions ??= {}
  meta.versions[version] ??= { platforms: {} }
  meta.versions[version].platforms ??= {}
  meta.versions[version].platforms![platform] = info
  meta.updatedAt = new Date().toISOString()
  await s3.putObject({ bucket, key: metaKey, body: JSON.stringify(meta), contentType: 'application/json' })
}
