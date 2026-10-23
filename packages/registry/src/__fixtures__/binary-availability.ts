import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { InMemoryAnalytics } from '../analytics'
import { binaryAttestationKey } from '../binary-publishing'
import { Registry } from '../registry'
import { augmentMetadataWithPkgx } from '../pkgx-fallback'
import { createHandler, getEgressLedger } from '../server'
import { InMemoryZigStorage } from '../zig'

// A separate process gives every scenario fresh production caches and storage
// configuration. Only this fixture's S3 host is intercepted; no public storage,
// package service, registry credential, or injected BinaryStorage is used.
const scenario = process.argv[2]
const method = process.argv[3] || 'GET'
const domain = 'binary-availability.fixture.test'
const key = `binaries/${domain}/1.0.0/linux-x86-64/${domain}-1.0.0.tar.gz`
const digest = 'a'.repeat(64)
const record = {
  tarball: key,
  sha256: digest,
  size: 32,
  malwareScan: { verdict: 'clean', artifactSha256: digest },
}
const metadata = {
  name: domain,
  latestVersion: '1.0.0',
  versions: { '1.0.0': { platforms: { 'linux-x86-64': record } } },
}
const requests: string[] = []
const unexpectedNetwork: string[] = []
let metadataReads = 0
let attestationReads = 0
let storageHeads = 0
let fallbackDownloads = 0
const originalFetch = globalThis.fetch

function storageError(status: number, code: string): Response {
  return new Response(`<Error><Code>${code}</Code></Error>`, { status })
}

globalThis.fetch = Object.assign(async (input: Parameters<typeof fetch>[0], init?: RequestInit) => {
  const url = new URL(input instanceof Request ? input.url : String(input))
  if (url.hostname === 'dist.pkgx.dev' && url.pathname.startsWith(`/${domain}/`)) {
    if (init?.method === 'HEAD')
      return new Response(null, { status: url.pathname.includes('/linux/x86-64/') ? 200 : 404 })
    fallbackDownloads++
    return storageError(scenario === 'pending-fallback-503' && fallbackDownloads === 1 ? 503 : 404, 'FixtureUnavailable')
  }
  if (url.hostname !== 'binary-availability.storage.test' || !['GET', 'HEAD'].includes(init?.method || 'GET')) {
    unexpectedNetwork.push(`${init?.method || 'GET'} ${url.origin}${url.pathname}`)
    throw new Error('Unexpected network request outside the private S3 fixture')
  }
  const object = decodeURIComponent(url.pathname).replace('/pantry-registry/', '')
  requests.push(object)
  if (init?.method === 'HEAD') {
    storageHeads++
    if (scenario === 'pending-head-503' && storageHeads === 1) return new Response(null, { status: 503 })
    if (scenario === 'pending-head-denied' && storageHeads === 1) return new Response(null, { status: 403 })
    return new Response(null, { status: scenario === 'checksum-read-503' ? 200 : 404 })
  }
  if (object === `binaries/${domain}/metadata.json`) {
    metadataReads++
    if (scenario === 'metadata-missing') return storageError(404, 'NoSuchKey')
    if ((scenario === 'metadata-503' || scenario === 'metadata-route-503') && metadataReads === 1)
      return storageError(503, 'ServiceUnavailable')
    if (scenario === 'metadata-malformed' && metadataReads === 1)
      return new Response('{')
    return Response.json(scenario.startsWith('pending-') ? { ...metadata, versions: {} } : metadata)
  }
  if (object === binaryAttestationKey(key)) {
    attestationReads++
    if (scenario === 'attestation-missing') return storageError(404, 'NoSuchKey')
    if (scenario === 'attestation-malformed') return new Response('{')
    if ((scenario === 'attestation-503' || scenario === 'checksum-503') && attestationReads === 1)
      return storageError(503, 'ServiceUnavailable')
    if (scenario === 'attestation-denied' && attestationReads === 1)
      return storageError(403, 'AccessDenied')
    if (scenario === 'attestation-timeout' && attestationReads === 1)
      throw new DOMException('Fixture storage timed out', 'TimeoutError')
    return Response.json({ scan: {
      verdict: scenario === 'attestation-unclean' ? 'infected' : 'clean',
      artifactSha256: scenario === 'attestation-mismatch' ? 'b'.repeat(64) : digest,
    } })
  }
  if (object === `${key}.sha256`) {
    if (scenario === 'checksum-read-503' && requests.filter(request => request === object).length === 1)
      return storageError(503, 'ServiceUnavailable')
    return new Response(`${digest}  ${domain}-1.0.0.tar.gz`)
  }
  throw new Error('Unexpected fixture object')
}, { preconnect: originalFetch.preconnect })

const temporary = mkdtempSync(join(tmpdir(), 'registry-availability-'))
try {
  if (scenario.startsWith('pending-') || scenario === 'checksum-read-503')
    await augmentMetadataWithPkgx(domain, null, ['1.0.0'])
  const registry = new Registry({
    s3Bucket: 'local',
    dynamoTable: 'local',
    baseUrl: 'http://registry.fixture.test',
    localStoragePath: temporary,
    npmFallback: false,
  })
  const adapter = scenario === 'adapter-transport' ? {
    async getObject(object: string): Promise<Buffer> {
      requests.push(object)
      metadataReads++
      if (metadataReads === 1) throw new TypeError('Fixture adapter connection failed')
      return Buffer.from(JSON.stringify(metadata))
    },
    createDownloadUrl(object: string): string {
      return `https://binary-availability.storage.test/pantry-registry/${object}`
    },
  } : undefined
  const handler = createHandler(registry, new InMemoryAnalytics(), new InMemoryZigStorage(), 'http://registry.fixture.test', adapter)
  const path = scenario === 'metadata-route-503' ? `binaries/${domain}/metadata.json`
    : scenario === 'checksum-503' || scenario === 'checksum-read-503' ? `${key}.sha256` : key
  const responses = []
  for (let attempt = 0; attempt < 2; attempt++) {
    // Exercise the public production route with its normal S3 client, including
    // both the active-record lookup and the independent scan attestation read.
    const response = await handler(new Request(`http://registry.fixture.test/${path}`, { method }))
    const body = await response.text()
    responses.push({
      status: response.status,
      code: response.headers.get('content-type')?.includes('application/json') ? JSON.parse(body).code : undefined,
      location: response.headers.get('location'),
      cacheControl: response.headers.get('cache-control'),
      retryAfter: response.headers.get('retry-after'),
      storageHeads,
      fallbackDownloads,
    })
  }
  console.log(`AVAILABILITY_RESULT ${JSON.stringify({ responses, metadataReads, attestationReads, requests, unexpectedNetwork, downloads: getEgressLedger().snapshot().monthDownloads })}`)
}
finally {
  globalThis.fetch = originalFetch
  rmSync(temporary, { recursive: true, force: true })
}
