import { describe, expect, it } from 'bun:test'
import { fileURLToPath } from 'node:url'

interface Result {
  responses: { status: number, code?: string, location: string | null, cacheControl: string | null, retryAfter: string | null, storageHeads: number, fallbackDownloads: number }[]
  metadataReads: number
  attestationReads: number
  requests: string[]
  unexpectedNetwork: string[]
  downloads: number
}

function observe(scenario: string, method = 'GET'): Result {
  const child = Bun.spawnSync([
    process.execPath,
    '--no-env-file',
    fileURLToPath(new URL('./__fixtures__/binary-availability.ts', import.meta.url)),
    scenario,
    method,
  ], {
    timeout: 4000,
    env: {
      PATH: process.env.PATH || '/usr/bin:/bin',
      TMPDIR: process.env.TMPDIR || '/tmp',
      NODE_ENV: 'test',
      PANTRY_REQUIRE_BINARY_SCAN_ATTESTATION: 'true',
      STORAGE_PROVIDER: 'aws',
      S3_ENDPOINT: 'binary-availability.storage.test',
      S3_FORCE_PATH_STYLE: 'true',
      S3_ACCESS_KEY_ID: 'fixture-key',
      S3_SECRET_ACCESS_KEY: 'fixture-secret',
      PANTRY_BINARY_STAGING_SECRET: 'private-fixture-staging-secret-1234567890',
    },
  })
  if (child.exitCode !== 0)
    throw new Error(`Availability fixture exited ${child.exitCode}: ${child.stderr.toString()}`)
  expect(child.exitCode).toBe(0)
  const line = child.stdout.toString().split('\n').find(line => line.startsWith('AVAILABILITY_RESULT '))
  expect(line).toBeDefined()
  const result = JSON.parse(line!.slice('AVAILABILITY_RESULT '.length)) as Result
  expect(result.unexpectedNetwork).toEqual([])
  return result
}

describe('binary storage availability through the production HTTP route', () => {
  it('serves HEAD locally with clean evidence and no archive download', () => {
    const result = observe('attestation-clean', 'HEAD')
    expect(result.responses.map(response => [response.status, response.location])).toEqual([[200, null], [200, null]])
    expect(result.requests.every(key => !key.endsWith('.tar.gz'))).toBe(true)
    expect(result.attestationReads).toBe(1)
    expect(result.downloads).toBe(0)
  })

  it('keeps HEAD behind the independent attestation gate', () => {
    const result = observe('attestation-missing', 'HEAD')
    expect(result.responses.map(response => response.status)).toEqual([503, 503])
    expect(result.downloads).toBe(0)
  })

  it('does not materialize pending artifacts for HEAD', () => {
    const result = observe('pending-head-503', 'HEAD')
    expect(result.responses.map(response => response.status)).toEqual([404, 404])
    expect(result.responses.every(response => response.fallbackDownloads === 0 && response.storageHeads === 0)).toBe(true)
    expect(result.downloads).toBe(0)
  })

  it.each(['pending-head-503', 'pending-head-denied'])('%s refuses fallback until storage confirms absence', (scenario) => {
    const result = observe(scenario)
    expect(result.responses[0]).toMatchObject({ status: 503, code: 'BINARY_STORAGE_UNAVAILABLE', cacheControl: 'no-store', storageHeads: 1, fallbackDownloads: 0 })
    expect(result.responses[1]).toMatchObject({ status: 404, storageHeads: 2, fallbackDownloads: 1 })
  })

  it('does not materialize or retry a checksum after an unavailable storage read', () => {
    const result = observe('checksum-read-503')
    expect(result.responses[0]).toMatchObject({ status: 503, code: 'BINARY_STORAGE_UNAVAILABLE', cacheControl: 'no-store', storageHeads: 0, fallbackDownloads: 0 })
    expect(result.responses[1]).toMatchObject({ status: 200, storageHeads: 0, fallbackDownloads: 0 })
  })

  it('distinguishes a fallback provider outage from confirmed missing fallback bytes', () => {
    const result = observe('pending-fallback-503')
    expect(result.responses[0]).toMatchObject({ status: 503, code: 'BINARY_STORAGE_UNAVAILABLE', cacheControl: 'no-store', fallbackDownloads: 1 })
    expect(result.responses[1]).toMatchObject({ status: 404, fallbackDownloads: 2 })
  })

  it.each(['attestation-503', 'attestation-denied', 'attestation-timeout'])('%s recovers immediately without caching a failed attestation read', (scenario) => {
    const result = observe(scenario)
    expect(result.responses[0]).toMatchObject({
      status: 503,
      code: 'BINARY_STORAGE_UNAVAILABLE',
      location: null,
      cacheControl: 'no-store',
      retryAfter: '60',
    })
    expect(result.responses[1].status).toBe(302)
    expect(new URL(result.responses[1].location!).hostname).toBe('binary-availability.storage.test')
    expect(result.attestationReads).toBe(2)
  })

  it.each(['metadata-503', 'metadata-malformed'])('%s is temporary unavailability, rather than a missing artifact', (scenario) => {
    const result = observe(scenario)
    expect(result.responses[0]).toMatchObject({ status: 503, code: 'BINARY_STORAGE_UNAVAILABLE', location: null, cacheControl: 'no-store' })
    expect(result.responses[1].status).toBe(302)
    expect(result.metadataReads).toBe(2)
  })

  it('does not publish empty package metadata when its storage read fails', () => {
    const result = observe('metadata-route-503')
    expect(result.responses[0]).toMatchObject({ status: 503, code: 'BINARY_STORAGE_UNAVAILABLE', cacheControl: 'no-store' })
    expect(result.responses[1].status).toBe(200)
    expect(result.metadataReads).toBe(2)
  })

  it('recovers a checksum request after an unavailable attestation read', () => {
    const result = observe('checksum-503')
    expect(result.responses[0]).toMatchObject({ status: 503, code: 'BINARY_STORAGE_UNAVAILABLE', location: null, cacheControl: 'no-store' })
    expect(result.responses[1].status).toBe(200)
    expect(result.attestationReads).toBe(2)
  })

  it.each(['attestation-missing', 'attestation-malformed', 'attestation-unclean', 'attestation-mismatch'])('%s still refuses an artifact without matching clean evidence', (scenario) => {
    const result = observe(scenario)
    expect(result.responses.map(response => [response.status, response.code, response.location])).toEqual([
      [503, 'BINARY_SCAN_ATTESTATION_REQUIRED', null],
      [503, 'BINARY_SCAN_ATTESTATION_REQUIRED', null],
    ])
    expect(result.attestationReads).toBe(1)
  })

  it('keeps a genuine missing metadata object as 404', () => {
    const result = observe('metadata-missing')
    expect(result.responses.map(response => response.status)).toEqual([404, 404])
    expect(result.attestationReads).toBe(0)
  })

  it('does not interpret an unknown storage-adapter connection failure as a missing object', () => {
    // This exercises adapter error classification only. The scan-attestation
    // cases above all use the normal production S3 path without an adapter.
    const result = observe('adapter-transport')
    expect(result.responses[0]).toMatchObject({ status: 503, code: 'BINARY_STORAGE_UNAVAILABLE', location: null, cacheControl: 'no-store' })
    expect(result.responses[1].status).toBe(302)
    expect(result.metadataReads).toBe(2)
  })
})
