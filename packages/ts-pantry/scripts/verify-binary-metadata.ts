#!/usr/bin/env bun

import { existsSync, readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { join } from 'node:path'
import { parseArgs } from 'node:util'
import { S3Client } from '@stacksjs/ts-cloud'
import {
  BINARY_SYNC_ALLOW_EMPTY_DOMAIN_SET,
  BINARY_SYNC_DOMAINS,
  BINARY_SYNC_REQUIRED_PLATFORMS,
  sanitizeDomainList,
} from './binary-sync-packages.ts'

interface S3ObjectInfo {
  Key: string
  LastModified?: string
  Size?: number
}

interface S3Like {
  listObjects(options: {
    bucket: string
    prefix?: string
    maxKeys?: number
    continuationToken?: string
  }): Promise<{ objects: S3ObjectInfo[], nextContinuationToken?: string }>
  getObject(bucket: string, key: string): Promise<string>
  getObjectBytes?(bucket: string, key: string): Promise<Uint8Array>
  headObject?(bucket: string, key: string): Promise<boolean>
  putObject?(options: { bucket: string, key: string, body: string, contentType?: string }): Promise<void>
  deleteObject?(bucket: string, key: string): Promise<void>
}

interface PlatformMetadata {
  tarball: string
  sha256: string
  size: number
  uploadedAt: string
}

interface PackageMetadata {
  name: string
  latestVersion: string
  versions: Record<string, { platforms: Record<string, PlatformMetadata> }>
  updatedAt: string
}

interface VerifyOptions {
  repair?: boolean
  deleteStrays?: boolean
  requireConfiguredPlatforms?: boolean
  region?: string
}

export interface VerifyResult {
  domain: string
  ok: boolean
  repaired: boolean
  deletedStrays: string[]
  repairedSha256: string[]
  errors: string[]
  warnings: string[]
  versionCount: number
  platformCount: number
}

function domainSafeName(domain: string): string {
  return domain.replace(/\//g, '-')
}

function domainToPackageFileKey(domain: string): string {
  return domain.replace(/[.\-/]/g, '').toLowerCase()
}

function isNewerVersion(a: string, b: string): boolean {
  const parse = (v: string) => {
    const dashIdx = v.indexOf('-')
    const numeric = (dashIdx === -1 ? v : v.slice(0, dashIdx)).split('.').map((s) => {
      const n = Number.parseInt(s, 10)
      return Number.isNaN(n) ? 0 : n
    })
    const prerelease = dashIdx === -1 ? null : v.slice(dashIdx + 1)
    return { numeric, prerelease }
  }
  const pa = parse(a)
  const pb = parse(b)
  const len = Math.max(pa.numeric.length, pb.numeric.length)
  for (let i = 0; i < len; i++) {
    const av = pa.numeric[i] ?? 0
    const bv = pb.numeric[i] ?? 0
    if (av !== bv) return av > bv
  }
  if (pa.prerelease === null && pb.prerelease !== null) return true
  if (pa.prerelease !== null && pb.prerelease === null) return false
  if (pa.prerelease !== null && pb.prerelease !== null) return pa.prerelease > pb.prerelease
  return false
}

function compareSemverDesc(a: string, b: string): number {
  if (isNewerVersion(a, b)) return -1
  if (isNewerVersion(b, a)) return 1
  return 0
}

async function listAllObjects(s3: S3Like, bucket: string, prefix: string): Promise<S3ObjectInfo[]> {
  const objects: S3ObjectInfo[] = []
  let continuationToken: string | undefined

  do {
    const page = await s3.listObjects({ bucket, prefix, maxKeys: 1000, continuationToken })
    objects.push(...page.objects)
    continuationToken = page.nextContinuationToken
  } while (continuationToken)

  return objects
}

function readCatalogVersions(domain: string): string[] {
  const packageFile = join(import.meta.dir, '..', 'src', 'packages', `${domainToPackageFileKey(domain)}.ts`)
  if (!existsSync(packageFile)) return []

  const content = readFileSync(packageFile, 'utf-8')
  const versionsMatch = content.match(/versions:\s*\[([\s\S]*?)\]\s*as const/)
  if (!versionsMatch) return []

  return Array.from(versionsMatch[1].matchAll(/'([^']+)'/g), match => match[1])
}

function parseSha256(text: string, key: string): string {
  const hash = text.trim().split(/\s+/)[0]
  if (!/^[a-fA-F0-9]{64}$/.test(hash)) {
    throw new Error(`Invalid sha256 file: ${key}`)
  }
  return hash.toLowerCase()
}

function s3ObjectUrl(bucket: string, region: string, key: string): string {
  return `https://${bucket}.s3.${region}.amazonaws.com/${key.split('/').map(encodeURIComponent).join('/')}`
}

async function readObjectBytes(s3: S3Like, bucket: string, key: string, region: string): Promise<Uint8Array> {
  if (s3.getObjectBytes) return s3.getObjectBytes(bucket, key)

  const response = await fetch(s3ObjectUrl(bucket, region, key), {
    headers: { Accept: 'application/octet-stream' },
  })
  if (!response.ok) {
    throw new Error(`Failed to read ${key}: HTTP ${response.status}`)
  }
  return new Uint8Array(await response.arrayBuffer())
}

async function repairSha256Object(
  s3: S3Like,
  bucket: string,
  tarballKey: string,
  shaKey: string,
  region: string,
): Promise<string> {
  if (!s3.putObject) throw new Error('S3 client does not support putObject repair')

  const bytes = await readObjectBytes(s3, bucket, tarballKey, region)
  const sha256 = createHash('sha256').update(bytes).digest('hex')
  await s3.putObject({
    bucket,
    key: shaKey,
    body: `${sha256}  ${tarballKey.split('/').at(-1)}\n`,
    contentType: 'text/plain',
  })
  return sha256
}

export async function rebuildMetadataFromObjects(
  s3: S3Like,
  bucket: string,
  domain: string,
  objects: S3ObjectInfo[],
  options: { repairSha256?: boolean, region?: string } = {},
): Promise<{ metadata: PackageMetadata, strays: string[], errors: string[], repairedSha256: string[] }> {
  const prefix = `binaries/${domain}/`
  const safeName = domainSafeName(domain)
  const tarballs = new Map<string, S3ObjectInfo>()
  const shaKeys = new Set<string>()
  const strays: string[] = []
  const errors: string[] = []
  const repairedSha256: string[] = []

  for (const object of objects) {
    const key = object.Key
    if (!key.startsWith(prefix) || key === `${prefix}metadata.json`) continue

    const parts = key.slice(prefix.length).split('/')
    if (parts.length !== 3) continue
    const [version, platform, filename] = parts
    const expectedTarball = `${safeName}-${version}.tar.gz`

    if (filename.endsWith('.tar.gz.sha256')) {
      shaKeys.add(key)
      const tarballName = filename.slice(0, -'.sha256'.length)
      if (tarballName !== expectedTarball && tarballName.startsWith(`${safeName}-`)) {
        strays.push(key)
      }
      continue
    }

    if (!filename.endsWith('.tar.gz')) continue
    if (filename !== expectedTarball) {
      if (filename.startsWith(`${safeName}-`)) strays.push(key)
      continue
    }

    tarballs.set(`${version}|${platform}`, object)
  }

  const metadata: PackageMetadata = {
    name: domain,
    latestVersion: '',
    versions: {},
    updatedAt: new Date().toISOString(),
  }

  const tarballEntries = [...tarballs.entries()].sort(([a], [b]) => a.localeCompare(b))
  for (const [id, object] of tarballEntries) {
    const [version, platform] = id.split('|')
    const tarballKey = object.Key
    const shaKey = `${tarballKey}.sha256`

    let sha256: string
    if (!shaKeys.has(shaKey)) {
      if (!options.repairSha256) {
        errors.push(`Missing sha256 for ${tarballKey}`)
        continue
      }
      try {
        sha256 = await repairSha256Object(s3, bucket, tarballKey, shaKey, options.region || 'us-east-1')
        repairedSha256.push(shaKey)
      }
      catch (error) {
        errors.push(error instanceof Error ? error.message : String(error))
        continue
      }
    }
    else {
      try {
        sha256 = parseSha256(await s3.getObject(bucket, shaKey), shaKey)
      }
      catch (error) {
        if (!options.repairSha256) {
          errors.push(error instanceof Error ? error.message : String(error))
          continue
        }
        try {
          sha256 = await repairSha256Object(s3, bucket, tarballKey, shaKey, options.region || 'us-east-1')
          repairedSha256.push(shaKey)
        }
        catch (repairError) {
          errors.push(repairError instanceof Error ? repairError.message : String(repairError))
          continue
        }
      }
    }

    metadata.versions[version] ??= { platforms: {} }
    metadata.versions[version].platforms[platform] = {
      tarball: tarballKey,
      sha256,
      size: object.Size ?? 0,
      uploadedAt: object.LastModified || metadata.updatedAt,
    }

    if (!metadata.latestVersion || isNewerVersion(version, metadata.latestVersion)) {
      metadata.latestVersion = version
    }
  }

  return { metadata, strays: [...new Set(strays)].sort(), errors, repairedSha256 }
}

function normalizeMetadata(metadata: PackageMetadata): string {
  const sortedVersions: PackageMetadata['versions'] = {}
  for (const version of Object.keys(metadata.versions).sort(compareSemverDesc)) {
    const platforms = metadata.versions[version].platforms
    sortedVersions[version] = {
      platforms: Object.fromEntries(Object.entries(platforms).sort(([a], [b]) => a.localeCompare(b))),
    }
  }
  return JSON.stringify({
    name: metadata.name,
    latestVersion: metadata.latestVersion,
    versions: sortedVersions,
  })
}

function checkConfiguredPlatforms(domain: string, metadata: PackageMetadata): string[] {
  const requiredPlatforms = BINARY_SYNC_REQUIRED_PLATFORMS[domain]
  if (!requiredPlatforms?.length) return []

  const catalogVersions = readCatalogVersions(domain)
  const missing: string[] = []
  for (const version of catalogVersions) {
    for (const platform of requiredPlatforms) {
      if (!metadata.versions[version]?.platforms?.[platform]) {
        missing.push(`${version} ${platform}`)
      }
    }
  }
  return missing
}

function countPlatforms(metadata: PackageMetadata): number {
  return Object.values(metadata.versions)
    .reduce((sum, version) => sum + Object.keys(version.platforms).length, 0)
}

async function verifyExistingMetadataObjects(
  s3: S3Like,
  bucket: string,
  metadata: PackageMetadata,
  region: string,
): Promise<string[]> {
  const errors: string[] = []

  for (const [version, versionMetadata] of Object.entries(metadata.versions)) {
    for (const [platform, platformMetadata] of Object.entries(versionMetadata.platforms)) {
      if (!/^[a-fA-F0-9]{64}$/.test(platformMetadata.sha256)) {
        errors.push(`Invalid metadata sha256 for ${metadata.name} ${version} ${platform}`)
        continue
      }

      try {
        const shaKey = `${platformMetadata.tarball}.sha256`
        const objectSha = parseSha256(await s3.getObject(bucket, shaKey), shaKey)
        if (objectSha !== platformMetadata.sha256.toLowerCase()) {
          errors.push(`sha256 mismatch for ${platformMetadata.tarball}`)
        }
      }
      catch (error) {
        errors.push(error instanceof Error ? error.message : String(error))
      }

      try {
        if (s3.headObject) {
          if (!await s3.headObject(bucket, platformMetadata.tarball)) {
            errors.push(`Missing tarball ${platformMetadata.tarball}`)
          }
        }
        else {
          const response = await fetch(s3ObjectUrl(bucket, region, platformMetadata.tarball), { method: 'HEAD' })
          if (!response.ok) {
            errors.push(`Missing tarball ${platformMetadata.tarball}: HTTP ${response.status}`)
          }
        }
      }
      catch (error) {
        errors.push(error instanceof Error ? error.message : String(error))
      }
    }
  }

  return errors
}

export async function verifyBinaryMetadata(
  s3: S3Like,
  bucket: string,
  domain: string,
  options: VerifyOptions = {},
): Promise<VerifyResult> {
  const metadataKey = `binaries/${domain}/metadata.json`
  const warnings: string[] = []
  const deletedStrays: string[] = []
  let existing: PackageMetadata | null = null
  try {
    existing = JSON.parse(await s3.getObject(bucket, metadataKey)) as PackageMetadata
  }
  catch {
    warnings.push('metadata.json does not exist')
  }

  const objects = await listAllObjects(s3, bucket, `binaries/${domain}/`)
  const { metadata, strays, errors, repairedSha256 } = await rebuildMetadataFromObjects(s3, bucket, domain, objects, {
    repairSha256: options.repair,
    region: options.region,
  })
  const platformCount = countPlatforms(metadata)
  const existingPlatformCount = existing ? countPlatforms(existing) : 0

  if (platformCount === 0 && existing && existingPlatformCount > 0 && !BINARY_SYNC_ALLOW_EMPTY_DOMAIN_SET.has(domain)) {
    warnings.push('S3 object listing returned no tarballs; verified existing metadata without rebuilding')
    errors.push(...await verifyExistingMetadataObjects(s3, bucket, existing, options.region || 'us-east-1'))
    if (options.requireConfiguredPlatforms) {
      const missing = checkConfiguredPlatforms(domain, existing)
      for (const item of missing) errors.push(`Missing required platform: ${domain} ${item}`)
    }

    return {
      domain,
      ok: errors.length === 0,
      repaired: false,
      deletedStrays,
      repairedSha256,
      errors,
      warnings,
      versionCount: Object.keys(existing.versions).length,
      platformCount: existingPlatformCount,
    }
  }

  if (platformCount === 0 && !BINARY_SYNC_ALLOW_EMPTY_DOMAIN_SET.has(domain)) {
    errors.push(`No binary tarballs found for ${domain}; refusing to rebuild metadata from an empty object listing`)
  }

  if (options.deleteStrays && s3.deleteObject) {
    for (const key of strays) {
      await s3.deleteObject(bucket, key)
      deletedStrays.push(key)
    }
  }
  else if (strays.length > 0) {
    warnings.push(`${strays.length} stale artifact object(s) found`)
  }

  const metadataChanged = !existing || normalizeMetadata(existing) !== normalizeMetadata(metadata)
  if (metadataChanged) {
    warnings.push('metadata.json differs from S3 object state')
    if (options.repair) {
      if (!s3.putObject) throw new Error('S3 client does not support putObject repair')
      if (errors.length === 0) {
        await s3.putObject({
          bucket,
          key: metadataKey,
          body: JSON.stringify(metadata, null, 2),
          contentType: 'application/json',
        })
      }
    }
  }

  if (options.requireConfiguredPlatforms) {
    const missing = checkConfiguredPlatforms(domain, metadata)
    for (const item of missing) errors.push(`Missing required platform: ${domain} ${item}`)
  }

  const ok = errors.length === 0 && (options.repair || !metadataChanged) && (options.deleteStrays || strays.length === 0)
  const repaired = Boolean(options.repair && (metadataChanged || repairedSha256.length > 0))

  return {
    domain,
    ok,
    repaired,
    deletedStrays,
    repairedSha256,
    errors,
    warnings,
    versionCount: Object.keys(metadata.versions).length,
    platformCount,
  }
}

function printHelp(): void {
  console.log(`
Verify and repair Pantry binary registry metadata.

Usage:
  bun scripts/verify-binary-metadata.ts -b pantry-registry -p cmake.org [options]

Options:
  -b, --bucket <name>             S3 bucket (required)
  -r, --region <region>           AWS region (default: us-east-1)
  -p, --package <domains>         Comma-separated package domains, repeatable
  --all-binary-sync               Verify every domain handled by sync-packages.ts
  --repair                        Rebuild metadata.json from S3 object state
  --delete-strays                 Delete tarballs whose filename version does not match the S3 version path
  --require-configured-platforms  Enforce required platform coverage from binary-sync-packages.json
  -h, --help                      Show help
`)
}

async function main(): Promise<void> {
  const { values } = parseArgs({
    options: {
      bucket: { type: 'string', short: 'b' },
      region: { type: 'string', short: 'r', default: 'us-east-1' },
      package: { type: 'string', short: 'p', multiple: true },
      'all-binary-sync': { type: 'boolean', default: false },
      repair: { type: 'boolean', default: false },
      'delete-strays': { type: 'boolean', default: false },
      'require-configured-platforms': { type: 'boolean', default: false },
      help: { type: 'boolean', short: 'h', default: false },
    },
  })

  if (values.help) {
    printHelp()
    return
  }

  if (!values.bucket) throw new Error('--bucket is required')

  const domains = values['all-binary-sync']
    ? BINARY_SYNC_DOMAINS
    : (values.package || []).flatMap(sanitizeDomainList)

  if (domains.length === 0) throw new Error('Provide --package or --all-binary-sync')

  const s3 = new S3Client(values.region || 'us-east-1') as unknown as S3Like
  const results: VerifyResult[] = []
  for (const domain of [...new Set(domains)]) {
    console.log(`\n🔎 Verifying ${domain}`)
    const result = await verifyBinaryMetadata(s3, values.bucket, domain, {
      repair: values.repair,
      deleteStrays: values['delete-strays'],
      requireConfiguredPlatforms: values['require-configured-platforms'],
    })
    results.push(result)
    console.log(`   versions=${result.versionCount} platforms=${result.platformCount} repaired=${result.repaired}`)
    for (const warning of result.warnings) console.log(`   ⚠️  ${warning}`)
    for (const key of result.repairedSha256) console.log(`   🔐 repaired ${key}`)
    for (const key of result.deletedStrays) console.log(`   🧹 deleted ${key}`)
    for (const error of result.errors) console.log(`   ❌ ${error}`)
  }

  const failed = results.filter(result => !result.ok)
  if (failed.length > 0) {
    throw new Error(`${failed.length} package(s) failed binary metadata verification`)
  }
}

const isDirectRun = import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('verify-binary-metadata.ts')
if (isDirectRun) {
  main().catch((error) => {
    console.error('❌ Binary metadata verification failed:', error.message)
    process.exit(1)
  })
}
