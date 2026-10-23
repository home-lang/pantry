import { afterEach, beforeEach, expect, test } from 'bun:test'
import { createObjectStorageClient } from '../scripts/object-storage'

const keys = ['STORAGE_PROVIDER', 'OBJECT_STORAGE_PROVIDER', 'S3_REGION', 'AWS_REGION', 'S3_ENDPOINT', 'S3_FORCE_PATH_STYLE', 'R2_ACCOUNT_ID', 'CLOUDFLARE_ACCOUNT_ID', 'S3_ACCESS_KEY_ID', 'S3_SECRET_ACCESS_KEY', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'AWS_SESSION_TOKEN']
const saved = new Map<string, string | undefined>()
const originalFetch = globalThis.fetch
beforeEach(() => {
  for (const key of keys) {
    saved.set(key, process.env[key])
    delete process.env[key]
  }
})
afterEach(() => {
  globalThis.fetch = originalFetch
  for (const key of keys) {
    const value = saved.get(key)
    if (value === undefined) delete process.env[key]
    else process.env[key] = value
  }
})

test('builders read, write and sign private R2 objects with the same configuration as the registry', async () => {
  Object.assign(process.env, {
    STORAGE_PROVIDER: 'r2', S3_REGION: 'auto', R2_ACCOUNT_ID: 'test-account',
    S3_ACCESS_KEY_ID: 'test-key', S3_SECRET_ACCESS_KEY: 'test-secret',
    S3_FORCE_PATH_STYLE: 'false',
  })
  const calls: { url: string, method: string }[] = []
  globalThis.fetch = Object.assign(async (input: Parameters<typeof fetch>[0], init?: RequestInit) => {
    const url = String(input)
    const method = init?.method || 'GET'
    calls.push({ url, method })
    expect(new Headers(init?.headers).get('authorization')).toContain('/auto/s3/aws4_request')
    return new Response(method === 'GET' ? '{}' : null)
  }, { preconnect: originalFetch.preconnect })
  const client = createObjectStorageClient()
  expect(await client.getObject('registry', 'metadata/index.json')).toBe('{}')
  await client.putObject({ bucket: 'registry', key: 'metadata/index.json', body: '{}' })
  await client.headObject('registry', 'binaries/tool.tar.gz')
  expect(calls).toEqual([
    { url: 'https://test-account.r2.cloudflarestorage.com/registry/metadata/index.json', method: 'GET' },
    { url: 'https://test-account.r2.cloudflarestorage.com/registry/metadata/index.json', method: 'PUT' },
    { url: 'https://test-account.r2.cloudflarestorage.com/registry/binaries/tool.tar.gz', method: 'HEAD' },
  ])
  const signed = new URL(await client.getSignedUrl({ bucket: 'registry', key: 'binaries/tool.tar.gz', expiresIn: 900 }))
  expect(signed.hostname).toBe('test-account.r2.cloudflarestorage.com')
  expect(signed.pathname).toBe('/registry/binaries/tool.tar.gz')
  expect(signed.searchParams.get('X-Amz-Credential')).toContain('/auto/s3/aws4_request')
})

test('builders reject stale regions before attempting an R2 transfer', () => {
  Object.assign(process.env, { STORAGE_PROVIDER: 'r2', R2_ACCOUNT_ID: 'test-account', S3_REGION: 'fsn1' })
  expect(() => createObjectStorageClient()).toThrow('R2 requires S3_REGION=auto')
})
