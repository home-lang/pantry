import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { createS3Client, providerEndpoint, resolveStorageProvider } from './provider'
import { createRegistryFromEnv } from '../registry'

const KEYS = [
  'STORAGE_PROVIDER',
  'OBJECT_STORAGE_PROVIDER',
  'S3_REGION',
  'AWS_REGION',
  'AWS_DEFAULT_REGION',
  'S3_ENDPOINT',
  'S3_FORCE_PATH_STYLE',
  'S3_CDN_BASE_URL',
  'STORAGE_CDN_BASE_URL',
  'R2_ACCOUNT_ID',
  'CLOUDFLARE_ACCOUNT_ID',
  'R2_ACCESS_KEY_ID',
  'R2_SECRET_ACCESS_KEY',
  'S3_ACCESS_KEY_ID',
  'S3_SECRET_ACCESS_KEY',
  'S3_BUCKET',
  'METADATA_BACKEND',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_SESSION_TOKEN',
]

describe('storage provider resolution', () => {
  const saved: Record<string, string | undefined> = {}

  beforeEach(() => {
    for (const key of KEYS) {
      saved[key] = process.env[key]
      delete process.env[key]
    }
  })

  afterEach(() => {
    for (const key of KEYS) {
      if (saved[key] === undefined) delete process.env[key]
      else process.env[key] = saved[key]
    }
  })

  it('defaults to AWS with no CDN origin', () => {
    const resolved = resolveStorageProvider()
    expect(resolved.provider).toBe('aws')
    expect(resolved.cdnBaseUrl).toBeUndefined()
  })

  it('resolves R2 to its account-scoped endpoint with path-style addressing', () => {
    process.env.STORAGE_PROVIDER = 'r2'
    process.env.R2_ACCOUNT_ID = 'abc123'
    const resolved = resolveStorageProvider()

    expect(resolved.region).toBe('auto')
    expect(resolved.endpoint).toBe('abc123.r2.cloudflarestorage.com')
    // Virtual-host addressing 404s on R2, so it must not be opt-in.
    expect(resolved.forcePathStyle).toBe(true)
  })

  it('leaves the R2 endpoint unset when no account id is configured', () => {
    expect(providerEndpoint('r2', 'auto')).toBeUndefined()
    expect(() => resolveStorageProvider({ provider: 'r2' })).toThrow('R2 requires R2_ACCOUNT_ID or S3_ENDPOINT')
  })

  it('refuses stale Hetzner/AWS regions rather than signing R2 requests incorrectly', () => {
    process.env.R2_ACCOUNT_ID = 'abc123'
    process.env.S3_REGION = 'fsn1'
    expect(() => resolveStorageProvider({ provider: 'r2' })).toThrow('R2 requires S3_REGION=auto')
    process.env.S3_REGION = 'auto'
    expect(resolveStorageProvider({ provider: 'r2', forcePathStyle: false }).forcePathStyle).toBe(true)
  })

  it('the environment registry and signed reads both use R2 path-style addressing', async () => {
    process.env.STORAGE_PROVIDER = 'r2'
    process.env.S3_BUCKET = 'private-registry'
    process.env.S3_REGION = 'auto'
    process.env.S3_ENDPOINT = 'abc123.r2.cloudflarestorage.com'
    process.env.S3_FORCE_PATH_STYLE = 'false'
    process.env.S3_ACCESS_KEY_ID = 'test-r2-key'
    process.env.S3_SECRET_ACCESS_KEY = 'test-r2-secret'
    const originalFetch = globalThis.fetch
    const calls: string[] = []
    globalThis.fetch = Object.assign(async (input: Parameters<typeof fetch>[0], init?: RequestInit) => {
      calls.push(String(input))
      const headers = new Headers(init?.headers)
      expect(headers.get('Authorization')).toContain('/auto/s3/aws4_request')
      return String(input).endsWith('/metadata/registry-index.json')
        ? Response.json({}) : new Response('artifact')
    }, { preconnect: originalFetch.preconnect })
    try {
      const registry = createRegistryFromEnv()
      expect(Buffer.from(await registry.tarball.download('packages/tool.tgz')).toString()).toBe('artifact')
      expect(calls).toEqual([
        'https://abc123.r2.cloudflarestorage.com/private-registry/metadata/registry-index.json',
        'https://abc123.r2.cloudflarestorage.com/private-registry/packages/tool.tgz',
      ])
      const url = new URL(createS3Client(resolveStorageProvider()).generatePresignedGetUrl('private-registry', 'binaries/tool/1.0/tool.tar.gz'))
      expect(url.hostname).toBe('abc123.r2.cloudflarestorage.com')
      expect(url.pathname).toBe('/private-registry/binaries/tool/1.0/tool.tar.gz')
      expect(url.searchParams.get('X-Amz-Credential')).toContain('/auto/s3/aws4_request')
    }
    finally { globalThis.fetch = originalFetch }
  })

  it('prefers R2-specific credentials but accepts the generic ones', () => {
    process.env.STORAGE_PROVIDER = 'r2'
    process.env.R2_ACCOUNT_ID = 'abc123'
    process.env.R2_ACCESS_KEY_ID = 'r2-key'
    process.env.R2_SECRET_ACCESS_KEY = 'r2-secret'
    process.env.S3_ACCESS_KEY_ID = 'generic-key'
    expect(resolveStorageProvider().credentials?.accessKeyId).toBe('r2-key')

    delete process.env.R2_ACCESS_KEY_ID
    delete process.env.R2_SECRET_ACCESS_KEY
    process.env.S3_SECRET_ACCESS_KEY = 'generic-secret'
    expect(resolveStorageProvider().credentials?.accessKeyId).toBe('generic-key')
  })

  it('normalises the CDN origin and drops trailing slashes', () => {
    process.env.S3_CDN_BASE_URL = 'https://cdn.pantry.dev/  '.trim()
    expect(resolveStorageProvider().cdnBaseUrl).toBe('https://cdn.pantry.dev')

    process.env.S3_CDN_BASE_URL = 'https://cdn.pantry.dev///'
    expect(resolveStorageProvider().cdnBaseUrl).toBe('https://cdn.pantry.dev')
  })

  it('treats a blank CDN origin as unset', () => {
    process.env.S3_CDN_BASE_URL = '   '
    expect(resolveStorageProvider().cdnBaseUrl).toBeUndefined()
  })

  it('keeps existing providers unchanged', () => {
    process.env.STORAGE_PROVIDER = 'hetzner'
    process.env.S3_REGION = 'fsn1'
    const resolved = resolveStorageProvider()
    expect(resolved.endpoint).toBe('fsn1.your-objectstorage.com')
    expect(resolved.forcePathStyle).toBe(false)
  })
})
