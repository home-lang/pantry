import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import { spawnSync } from 'node:child_process'
import { generateKeyPairSync } from 'node:crypto'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  AppStoreConnectClient,
  appStoreConnectToken,
  ensureAppStoreVersions,
  provisionMacApp,
  waitForAppStoreBuilds,
} from '../src/app-store-connect'

/** A private key, a CSR for it, and a certificate (as Apple returns it) for the same key. */
function keyMaterial(directory: string, name: string): { csr: string, certificateContent: string } {
  const key = join(directory, `${name}.key`)
  const run = (args: string[]) => {
    const result = spawnSync('openssl', args, { encoding: 'utf8' })
    if (result.status !== 0)
      throw new Error(result.stderr)
    return result.stdout
  }
  run(['genrsa', '-out', key, '2048'])
  const csr = run(['req', '-new', '-key', key, '-subj', `/CN=${name}`])
  const der = spawnSync('openssl', ['req', '-new', '-x509', '-key', key, '-subj', `/CN=${name}`, '-days', '1', '-outform', 'DER'])
  return { csr, certificateContent: Buffer.from(der.stdout).toString('base64') }
}

function rejectUnsupported(url: URL): Response | undefined {
  // Apple rejects both of these with a 400; the mocks must too, or a request
  // shape Apple refuses passes here and fails on first live use.
  if (url.pathname.endsWith('/bundleIdCapabilities') && url.searchParams.has('limit'))
    return Response.json({ errors: [{ status: '400', detail: 'The parameter \'limit\' can not be used with this request' }] }, { status: 400 })
  if (url.pathname.endsWith('/profiles') && url.searchParams.has('filter[bundleId]'))
    return Response.json({ errors: [{ status: '400', detail: '\'bundleId\' is not a valid filter type' }] }, { status: 400 })
  return undefined
}

describe('Pantry App Store Connect automation', () => {
  let directory: string
  let keyPath: string

  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), 'pantry-app-store-connect-'))
    keyPath = join(directory, 'AuthKey_TEST.p8')
    const { privateKey } = generateKeyPairSync('ec', { namedCurve: 'P-256' })
    writeFileSync(keyPath, privateKey.export({ type: 'pkcs8', format: 'pem' }))
  })

  afterEach(() => {
    rmSync(directory, { recursive: true, force: true })
  })

  test('generates a short-lived ES256 token', () => {
    const token = appStoreConnectToken({ keyId: 'KEY123', issuerId: 'issuer', keyPath }, 1000)
    const [header, payload, signature] = token.split('.')
    expect(JSON.parse(Buffer.from(header!, 'base64url').toString())).toEqual({
      alg: 'ES256',
      kid: 'KEY123',
      typ: 'JWT',
    })
    expect(JSON.parse(Buffer.from(payload!, 'base64url').toString())).toMatchObject({
      iss: 'issuer',
      iat: 1000,
      exp: 1120,
      aud: 'appstoreconnect-v1',
    })
    expect(Buffer.from(signature!, 'base64url')).toHaveLength(64)
  })

  test('plans missing resources without writes', async () => {
    const writes: string[] = []
    const result = await provisionMacApp({
      identifier: 'com.example.desktop',
      name: 'Example Desktop',
      capabilities: ['ICLOUD', 'APP_GROUPS'],
      keyId: 'KEY123',
      issuerId: 'issuer',
      keyPath,
      baseUrl: 'https://example.test/v1',
      checkOnly: true,
      fetch: (async (_input: string | URL | Request, init?: RequestInit) => {
        if (init?.method && init.method !== 'GET')
          writes.push(init.method)
        return Response.json({ data: [] })
      }) as typeof fetch,
    })

    expect(writes).toEqual([])
    expect(result.mode).toBe('plan')
    expect(result.bundleId.exists).toBeFalse()
    expect(result.actions).toEqual([
      'Register macOS Bundle ID com.example.desktop',
      'Enable APP_GROUPS for com.example.desktop',
      'Enable ICLOUD for com.example.desktop',
      'Create MAC_APP_DISTRIBUTION certificate',
      'Create MAC_INSTALLER_DISTRIBUTION certificate',
      'Create MAC_APP_STORE profile Example Desktop Mac App Store',
      'Create the com.example.desktop app record in App Store Connect (manual Apple step)',
    ])
  })

  test('creates the requested resources and profile using only the app certificate', async () => {
    const app = keyMaterial(directory, 'app')
    const installer = keyMaterial(directory, 'installer')
    const writes: Array<{ path: string, body: any }> = []
    const result = await provisionMacApp({
      identifier: 'com.example.desktop',
      name: 'Example Desktop',
      capabilities: ['APP_GROUPS'],
      appCertificateCsr: app.csr,
      installerCertificateCsr: installer.csr,
      keyId: 'KEY123',
      issuerId: 'issuer',
      keyPath,
      baseUrl: 'https://example.test/v1',
      checkOnly: false,
      fetch: (async (input: string | URL | Request, init?: RequestInit) => {
        const url = new URL(String(input))
        const body = init?.body ? JSON.parse(String(init.body)) : undefined
        if (init?.method === 'POST')
          writes.push({ path: url.pathname, body })
        const rejected = rejectUnsupported(url)
        if (rejected)
          return rejected
        if (url.pathname.endsWith('/bundleIds') && url.search)
          return Response.json({ data: [] })
        if (url.pathname.endsWith('/bundleIds') && init?.method === 'POST')
          return Response.json({ data: { ...body.data, id: 'bundle-123' } }, { status: 201 })
        if (url.pathname.endsWith('/bundleIds/bundle-123/bundleIdCapabilities'))
          return Response.json({ data: [] })
        if (url.pathname.endsWith('/bundleIdCapabilities'))
          return Response.json({ data: { ...body.data, id: 'capability-123' } }, { status: 201 })
        if (url.pathname.endsWith('/certificates') && url.search)
          return Response.json({ data: [] })
        if (url.pathname.endsWith('/certificates') && init?.method === 'POST') {
          const certificateType = body.data.attributes.certificateType
          return Response.json({
            data: {
              ...body.data,
              id: certificateType === 'MAC_APP_DISTRIBUTION' ? 'app-cert' : 'installer-cert',
              attributes: {
                ...body.data.attributes,
                activated: true,
                certificateContent: certificateType === 'MAC_APP_DISTRIBUTION' ? app.certificateContent : installer.certificateContent,
              },
            },
          }, { status: 201 })
        }
        if (url.pathname.endsWith('/profiles') && url.search)
          return Response.json({ data: [] })
        if (url.pathname.endsWith('/profiles') && init?.method === 'POST') {
          return Response.json({
            data: {
              ...body.data,
              id: 'profile-123',
              attributes: {
                ...body.data.attributes,
                profileState: 'ACTIVE',
                profileContent: Buffer.from('profile').toString('base64'),
              },
            },
          }, { status: 201 })
        }
        if (url.pathname.endsWith('/apps'))
          return Response.json({ data: [] })
        throw new Error(`Unexpected request: ${url}`)
      }) as typeof fetch,
    })

    expect(result.bundleId).toMatchObject({ id: 'bundle-123', created: true })
    expect(result.capabilities).toEqual([{ type: 'APP_GROUPS', enabled: true, created: true }])
    expect(result.certificates.map(certificate => [certificate.type, certificate.id])).toEqual([
      ['MAC_APP_DISTRIBUTION', 'app-cert'],
      ['MAC_INSTALLER_DISTRIBUTION', 'installer-cert'],
    ])
    expect(result.profile).toMatchObject({ id: 'profile-123', created: true })
    expect(writes.at(-1)?.body.data.relationships.certificates).toEqual({
      data: [{ type: 'certificates', id: 'app-cert' }],
    })
  })

  test('reuses only a certificate issued for the CSR key, and a profile only for its own bundle', async () => {
    const mine = keyMaterial(directory, 'mine')
    const foreign = keyMaterial(directory, 'foreign')
    const installer = keyMaterial(directory, 'installer')
    const created: string[] = []
    const certificate = (id: string, content: string) => ({
      type: 'certificates',
      id,
      attributes: { activated: true, expirationDate: '2999-01-01T00:00:00Z', certificateContent: content },
    })
    const result = await provisionMacApp({
      identifier: 'com.example.desktop',
      name: 'Example Desktop',
      appCertificateCsr: mine.csr,
      installerCertificateCsr: installer.csr,
      keyId: 'KEY123',
      issuerId: 'issuer',
      keyPath,
      baseUrl: 'https://example.test/v1',
      checkOnly: false,
      fetch: (async (input: string | URL | Request, init?: RequestInit) => {
        const url = new URL(String(input))
        const body = init?.body ? JSON.parse(String(init.body)) : undefined
        const rejected = rejectUnsupported(url)
        if (rejected)
          return rejected
        if (url.pathname.endsWith('/bundleIds'))
          return Response.json({ data: [{ type: 'bundleIds', id: 'bundle-123', attributes: { identifier: 'com.example.desktop', platform: 'MAC_OS' } }] })
        if (url.pathname.endsWith('/bundleIdCapabilities'))
          return Response.json({ data: [] })
        if (url.pathname.endsWith('/certificates') && init?.method === 'POST') {
          created.push(body.data.attributes.certificateType)
          return Response.json({ data: certificate('installer-new', installer.certificateContent) }, { status: 201 })
        }
        if (url.pathname.endsWith('/certificates')) {
          // A foreign app certificate expiring later sorts first; it must still lose.
          return Response.json({
            data: url.searchParams.get('filter[certificateType]') === 'MAC_APP_DISTRIBUTION'
              ? [certificate('app-mine', mine.certificateContent), { ...certificate('app-foreign', foreign.certificateContent), attributes: { ...certificate('', foreign.certificateContent).attributes, expirationDate: '3999-01-01T00:00:00Z' } }]
              : [certificate('installer-foreign', foreign.certificateContent)],
          })
        }
        if (url.pathname.endsWith('/profiles') && init?.method === 'POST')
          return Response.json({ data: { type: 'profiles', id: 'profile-new', attributes: { name: body.data.attributes.name, profileState: 'ACTIVE' } } }, { status: 201 })
        if (url.pathname.endsWith('/profiles')) {
          return Response.json({
            data: [{
              type: 'profiles',
              id: 'profile-other-bundle',
              attributes: { name: 'Example Desktop Mac App Store', profileState: 'ACTIVE' },
              relationships: {
                bundleId: { data: { type: 'bundleIds', id: 'bundle-999' } },
                certificates: { data: [{ type: 'certificates', id: 'app-mine' }] },
              },
            }],
          })
        }
        if (url.pathname.endsWith('/apps'))
          return Response.json({ data: [] })
        throw new Error(`Unexpected request: ${url}`)
      }) as typeof fetch,
    })

    expect(result.certificates.map(item => [item.type, item.id, item.created])).toEqual([
      ['MAC_APP_DISTRIBUTION', 'app-mine', false],
      ['MAC_INSTALLER_DISTRIBUTION', 'installer-new', true],
    ])
    expect(created).toEqual(['MAC_INSTALLER_DISTRIBUTION'])
    expect(result.actions).toContain('Create MAC_INSTALLER_DISTRIBUTION certificate (the active ones were issued for a different private key)')
    expect(result.profile).toMatchObject({ id: 'profile-new', created: true })
  })

  test('refuses a CSR it cannot read instead of matching nothing', async () => {
    await expect(provisionMacApp({
      identifier: 'com.example.desktop',
      name: 'Example Desktop',
      appCertificateCsr: 'not a certificate request',
      keyId: 'KEY123',
      issuerId: 'issuer',
      keyPath,
      baseUrl: 'https://example.test/v1',
      checkOnly: true,
      fetch: (async (_input: string | URL | Request, _init?: RequestInit) => Response.json({ data: [] })) as typeof fetch,
    })).rejects.toThrow('CSR could not be read')
  })

  test('aligns versions and attaches processed builds without product-specific logic', async () => {
    const writes: Array<{ path: string, method: string }> = []
    const client = new AppStoreConnectClient({
      keyId: 'KEY123',
      issuerId: 'issuer',
      keyPath,
      baseUrl: 'https://example.test/v1',
      fetch: (async (input: string | URL | Request, init?: RequestInit) => {
        const url = new URL(String(input))
        const method = init?.method ?? 'GET'
        if (method !== 'GET')
          writes.push({ path: url.pathname, method })
        if (url.pathname.endsWith('/apps/app-123/appStoreVersions')) {
          return Response.json({
            data: [{
              type: 'appStoreVersions',
              id: 'version-123',
              attributes: {
                platform: 'MAC_OS',
                versionString: '1.0.0',
                appStoreState: 'PREPARE_FOR_SUBMISSION',
              },
            }],
          })
        }
        if (url.pathname.endsWith('/builds')) {
          return Response.json({
            data: [{
              type: 'builds',
              id: 'build-123',
              attributes: {
                version: '42',
                uploadedDate: '2026-01-01T00:00:00Z',
                expired: false,
                processingState: 'VALID',
              },
              relationships: {
                preReleaseVersion: { data: { type: 'preReleaseVersions', id: 'pre-release-123' } },
              },
            }],
            included: [{
              type: 'preReleaseVersions',
              id: 'pre-release-123',
              attributes: { version: '1.0.0', platform: 'MAC_OS' },
            }],
          })
        }
        if (url.pathname.endsWith('/appStoreVersions/version-123/relationships/build'))
          return new Response(null, { status: 204 })
        throw new Error(`Unexpected request: ${method} ${url}`)
      }) as typeof fetch,
    })

    const versions = await ensureAppStoreVersions(client, 'app-123', [{ platform: 'MAC_OS', version: '1.0.0' }])
    const attachments = await waitForAppStoreBuilds(client, 'app-123', versions, '42')

    expect(versions).toEqual([{
      platform: 'MAC_OS',
      version: '1.0.0',
      created: false,
      updated: false,
      id: 'version-123',
      status: 'ready',
      appStoreState: 'PREPARE_FOR_SUBMISSION',
    }])
    expect(attachments).toEqual([{
      platform: 'MAC_OS',
      versionId: 'version-123',
      buildId: 'build-123',
      buildNumber: '42',
    }])
    expect(writes).toEqual([{
      path: '/v1/appStoreVersions/version-123/relationships/build',
      method: 'PATCH',
    }])
  })
})

test('asset uploads send the exact binary slice with length and verify server integrity', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'pantry-upload-'))
  try {
    const keyPath = join(directory, 'key.p8')
    const { privateKey } = generateKeyPairSync('ec', { namedCurve: 'P-256' })
    writeFileSync(keyPath, privateKey.export({ type: 'pkcs8', format: 'pem' }))
    const { createHash } = await import('node:crypto')
    const bytes = Buffer.from([99, 1, 2, 3, 88]).subarray(1, 4)
    let mismatch = false
    const server = Bun.serve({ port: 0, hostname: '127.0.0.1', async fetch(request) {
      expect(request.headers.get('authorization')).toBeNull()
      expect(request.headers.get('content-type')).toBe('image/png')
      expect(request.headers.get('content-length')).toBe('3')
      expect(new Uint8Array(await request.arrayBuffer())).toEqual(new Uint8Array([1, 2, 3]))
      return new Response(null, { headers: { etag: mismatch ? '00000000000000000000000000000000' : createHash('md5').update(bytes).digest('hex').toUpperCase() } })
    } })
    try {
      const client = new AppStoreConnectClient({ keyId: 'TEST', issuerId: 'test', keyPath })
      const init = { method: 'PUT', body: bytes, headers: { 'content-type': 'image/png' } }
      await client.upload(server.url.href, init)
      mismatch = true
      await expect(client.upload(server.url.href, init)).rejects.toThrow('different checksum')
    }
    finally { server.stop(true) }
  }
  finally { rmSync(directory, { recursive: true, force: true }) }
})
