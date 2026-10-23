import { mkdtemp, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { downloadDependencies } from '../../packages/ts-pantry/scripts/build-package'
import { createObjectStorageClient } from '../../packages/ts-pantry/scripts/object-storage'

if (process.env.PANTRY_BUILD_CACHE_READY !== 'true') throw new Error('GitHub archive cache was not configured by Setup Pantry')
const bucket = process.env.S3_BUCKET || 'pantry-registry'
const region = process.env.S3_REGION || 'us-east-1'
const s3 = createObjectStorageClient({ provider: process.env.STORAGE_PROVIDER as 'hetzner' | 'aws' | 'backblaze' })
const requireHit = process.env.REQUIRE_SHARED_CACHE_HIT === 'true'
let originRequests = 0
const storage = {
  getObject: (bucket: string, key: string) => s3.getObject(bucket, key),
  getSignedUrl: async (options: { bucket: string, key: string, expiresIn: number }) => {
    if (requireHit) throw new Error('Warm-run probe must not download an archive from object storage')
    originRequests++
    return s3.getSignedUrl(options)
  },
}
const directory = await mkdtemp(join(tmpdir(), 'pantry-cache-probe-'))
const dependencies = ['openssl.org ^1.1', 'curl.se/ca-certs', 'zlib.net']
try {
  for (const build of ['first-build', 'second-build']) {
    const before = originRequests
    const paths = await downloadDependencies(dependencies, join(directory, build), 'linux-x86-64', bucket, region, storage)
    if (!paths['openssl.org'] || !paths['curl.se/ca-certs'] || !paths['zlib.net']) throw new Error('Probe did not install all managed dependencies')
    if (build === 'second-build' && originRequests !== before) throw new Error('Second build repeated an origin archive download')
  }
  console.log(`CACHE_PROBE_PASS require_shared_hit=${requireHit} origin_archive_requests=${originRequests}`)
}
finally { await rm(directory, { recursive: true, force: true }) }
