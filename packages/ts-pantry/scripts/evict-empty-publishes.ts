#!/usr/bin/env bun
/**
 * Evict empty/broken published tarballs (builds that exited 0 but installed
 * nothing → ~109-byte `./`-only tar.gz that passes its own checksum). For each
 * (domain, version, platform) listed in an evict plan, delete the tarball + its
 * .sha256 from object storage and rewrite the package metadata.json without that
 * entry; drop versions/metadata that become empty. After eviction the package
 * shows as needs-build and will be rebuilt — and the strengthened empty-content
 * guard now makes a still-empty rebuild fail loudly instead of re-publishing.
 *
 * Plan format (JSON): { "<domain>": [["<version>","<platform>"], ...], ... }
 * Usage: bun scripts/evict-empty-publishes.ts --bucket <b> --region <r> --plan /tmp/evict.json [--dry]
 */
import { readFileSync } from 'node:fs'
import { parseArgs } from 'node:util'
import { createObjectStorageClient } from '@stacksjs/ts-cloud'

const { values } = parseArgs({
  options: {
    bucket: { type: 'string', short: 'b' },
    region: { type: 'string', short: 'r', default: 'us-east-1' },
    plan: { type: 'string' },
    dry: { type: 'boolean', default: false },
  },
})
if (!values.bucket || !values.plan)
  throw new Error('--bucket and --plan are required')

const bucket = values.bucket
const dry = values.dry
const s3: any = createObjectStorageClient({ region: values.region })
const plan: Record<string, [string, string][]> = JSON.parse(readFileSync(values.plan, 'utf8'))

let deletedObjects = 0
let metadataRewritten = 0
let metadataDeleted = 0

async function del(key: string): Promise<void> {
  if (dry) { console.log(`  [dry] delete ${key}`); deletedObjects++; return }
  try { await s3.deleteObject(bucket, key); deletedObjects++; console.log(`  ✗ ${key}`) }
  catch (e) { console.warn(`  ! delete failed ${key}: ${String(e).slice(0, 60)}`) }
}

for (const [domain, entries] of Object.entries(plan)) {
  const metaKey = `binaries/${domain}/metadata.json`
  let meta: any
  try { meta = JSON.parse(await s3.getObject(bucket, metaKey)) }
  catch { console.warn(`! no metadata for ${domain}, skipping`); continue }
  console.log(`\n${domain}: evicting ${entries.length} empty entr${entries.length === 1 ? 'y' : 'ies'}`)
  for (const [version, platform] of entries) {
    const pm = meta?.versions?.[version]?.platforms?.[platform]
    if (pm?.tarball) {
      await del(`binaries/${pm.tarball}`.replace('binaries/binaries/', 'binaries/'))
      await del(`binaries/${pm.tarball}.sha256`.replace('binaries/binaries/', 'binaries/'))
    }
    else {
      // fall back to the conventional key layout if metadata lacks the path
      const safe = domain.replace(/\//g, '-')
      const base = `binaries/${domain}/${version}/${platform}/${safe}-${version}.tar.gz`
      await del(base)
      await del(`${base}.sha256`)
    }
    if (meta?.versions?.[version]?.platforms)
      delete meta.versions[version].platforms[platform]
    if (meta?.versions?.[version] && Object.keys(meta.versions[version].platforms || {}).length === 0)
      delete meta.versions[version]
  }
  const remainingVersions = Object.keys(meta.versions || {})
  if (remainingVersions.length === 0) {
    // nothing left → remove the metadata entirely so the package reads as unbuilt
    if (!dry) { try { await s3.deleteObject(bucket, metaKey); metadataDeleted++ } catch (e) { console.warn(`  ! ${String(e).slice(0, 60)}`) } }
    else metadataDeleted++
    console.log(`  ⌫ metadata.json removed (no versions remain)`)
  }
  else {
    // recompute latestVersion among survivors (string-sort fallback)
    meta.latestVersion = remainingVersions.sort().at(-1)
    meta.updatedAt = meta.updatedAt // preserved
    if (!dry) { try { await s3.putObject({ bucket, key: metaKey, body: JSON.stringify(meta, null, 2), contentType: 'application/json' }); metadataRewritten++ } catch (e) { console.warn(`  ! ${String(e).slice(0, 60)}`) } }
    else metadataRewritten++
    console.log(`  ↻ metadata.json rewritten (${remainingVersions.length} versions remain)`)
  }
}

console.log(`\n=== ${dry ? 'DRY RUN' : 'DONE'}: ${deletedObjects} objects deleted, ${metadataRewritten} metadata rewritten, ${metadataDeleted} metadata removed ===`)
