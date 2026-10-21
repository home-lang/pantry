import { createHash, generateKeyPairSync } from 'node:crypto'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { AppStoreConnectClient } from '../src/app-store-connect'
import { prepareAppStoreSubmission, submitAppStore } from '../src/app-store-submission'

describe('App Store Connect submission', () => {
  let dir: string
  let keyPath: string

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'pantry-store-'))
    keyPath = join(dir, 'AuthKey_TEST.p8')
    const { privateKey } = generateKeyPairSync('ec', { namedCurve: 'P-256' })
    writeFileSync(keyPath, privateKey.export({ type: 'pkcs8', format: 'pem' }))
  })

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true })
  })

  it.each([false, true])('synchronizes metadata, uploads screenshots, and submits an existing version (legacy input: %s)', async (legacy) => {
    const screenshotPath = join(dir, 'mac.png')
    writeFileSync(screenshotPath, Buffer.from('test screenshot'))
    const writes: Array<{ path: string, method: string, body?: any }> = []
    let screenshotCreated = false
    let screenshotUploaded = false
    const fetcher = (async (input: string | URL | Request, init?: RequestInit) => {
      const url = new URL(String(input))
      const method = init?.method ?? 'GET'
      const body = init?.body && typeof init.body === 'string' ? JSON.parse(init.body) : undefined
      if (method !== 'GET')
        writes.push({ path: url.pathname, method, body })
      if (url.hostname === 'upload.example.test') {
        screenshotUploaded = true
        return new Response(null, { status: 200 })
      }
      if (url.pathname.endsWith('/apps/app-123/appInfos'))
        return Response.json({ data: [{ type: 'appInfos', id: 'info-123', attributes: { appStoreState: 'PREPARE_FOR_SUBMISSION' } }] })
      if (url.pathname.endsWith('/appInfos/info-123/appInfoLocalizations'))
        return Response.json({ data: [{ type: 'appInfoLocalizations', id: 'info-loc', attributes: { locale: 'en-US' } }] })
      if (url.pathname.endsWith('/appPriceSchedules/app-123/manualPrices'))
        return Response.json({ errors: [{ detail: 'no price schedule' }] }, { status: 404 })
      if (url.pathname.endsWith('/apps/app-123/appPricePoints'))
        return Response.json({ data: [{ type: 'appPricePoints', id: 'free-price', attributes: { customerPrice: '0.0' } }] })
      if (url.pathname.endsWith('/apps/app-123/appAvailabilityV2'))
        return Response.json({ errors: [{ detail: 'missing' }] }, { status: 404 })
      if (url.pathname.endsWith('/territories'))
        return Response.json({ data: [{ type: 'territories', id: 'USA', attributes: {} }] })
      if (url.pathname.endsWith('/appStoreVersions/mac-version/appStoreVersionLocalizations'))
        return Response.json({ data: [{ type: 'appStoreVersionLocalizations', id: 'version-loc', attributes: { locale: 'en-US' } }] })
      if (url.pathname.endsWith('/appStoreVersions/mac-version/appStoreReviewDetail'))
        return Response.json({ data: null })
      if (url.pathname.endsWith('/apps/app-123/assetLibrary'))
        return Response.json({ data: { type: 'appAssetLibraries', id: 'library-123', attributes: {} } })
      if (url.pathname.endsWith('/appAssetLibraryRefData'))
        return Response.json({ data: [{ type: 'appAssetLibraryRefData', id: 'catalog', attributes: {
          placementProfileGroups: [{ placementProfileGroupId: 'MAC_GROUP_FROM_APPLE', platform: 'MAC_APP_STORE' }],
          placementTypes: [{ placementTypeId: 'APP_SCREENSHOT', specMappings: [{ placementGroupId: 'MAC_GROUP_FROM_APPLE', specs: ['mac-spec'] }] }],
          features: [{ featureId: 'APP_STORE_VERSIONS', placementPolicies: [{ placementType: 'APP_SCREENSHOT', groupLimits: [{ groupIds: ['MAC_GROUP_FROM_APPLE'], maxCount: 10 }] }] }],
        } }] })
      if (url.pathname.endsWith('/appAssetLibraries/library-123/images'))
        return Response.json({ data: legacy ? [{ type: 'appAssetLibraryImages', id: 'shot-123', attributes: {
          fileName: 'mac.png', fileSize: 15, state: 'AWAITING_UPLOAD', referenceName: `sha256:${createHash('sha256').update('test screenshot').digest('hex')}`,
          uploadOperations: [{ method: 'PUT', url: 'https://upload.example.test/part', length: 15, offset: 0, requestHeaders: [{ name: 'Content-Type', value: 'image/png' }] }],
        } }] : [] })
      if (url.pathname.endsWith('/appStoreVersionLocalizations/version-loc/placements'))
        return Response.json({ data: [] })
      if (url.pathname.endsWith('/appAssetLibraryImages') && method === 'POST') {
        screenshotCreated = true
        return Response.json({ data: { type: 'appAssetLibraryImages', id: 'shot-123', attributes: {
          fileName: 'mac.png', fileSize: 15, state: 'AWAITING_UPLOAD',
          uploadOperations: [{ method: 'PUT', url: 'https://upload.example.test/part', length: 15, offset: 0, requestHeaders: [{ name: 'Content-Type', value: 'image/png' }] }],
        } } }, { status: 201 })
      }
      if (url.pathname.endsWith('/appAssetLibraryImages/shot-123') && method === 'GET')
        return Response.json({ data: { type: 'appAssetLibraryImages', id: 'shot-123', attributes: { fileName: 'mac.png', state: 'PREPARE_FOR_SUBMISSION', specId: 'mac-spec' } } })
      if (url.pathname.endsWith('/appAssetLibraryPlacements') && method === 'POST')
        return Response.json({ data: { ...body.data, id: 'placement-123' } }, { status: 201 })
      if (url.pathname.endsWith('/apps/app-123/reviewSubmissions'))
        return Response.json({ data: [] })
      if (url.pathname.endsWith('/reviewSubmissions') && method === 'POST')
        return Response.json({ data: { type: 'reviewSubmissions', id: 'review-123', attributes: { platform: 'MAC_OS', state: 'READY_FOR_REVIEW' } } }, { status: 201 })
      if (url.pathname.endsWith('/reviewSubmissions/review-123/items'))
        return Response.json({ data: [], included: [] })
      return Response.json({ data: { type: 'result', id: 'ok', attributes: {} } })
    }) as typeof fetch
    const client = new AppStoreConnectClient({
      keyId: 'KEY123',
      issuerId: 'issuer-123',
      keyPath,
      fetch: fetcher,
      baseUrl: 'https://example.test/v1',
    })

    const result = await prepareAppStoreSubmission(client, {
        subtitle: 'Smaller images',
        privacyPolicyUrl: 'https://example.test/privacy',
        description: 'A private native app.',
        keywords: 'privacy,blocking',
        supportUrl: 'https://example.test/support',
        copyright: '2026 Example',
        primaryCategory: 'UTILITIES',
        contentRightsDeclaration: 'DOES_NOT_USE_THIRD_PARTY_CONTENT',
        price: '0',
        reviewContact: {
          firstName: 'Test',
          lastName: 'Reviewer',
          phone: '+1 555-555-0100',
          email: 'review@example.test',
        },
        screenshots: legacy ? { APP_DESKTOP: ['mac.png'] } : [{ platform: 'MAC_APP_STORE', files: ['mac.png'] }],
        submitForReview: true,
    }, 'app-123', [{ platform: 'macos', id: 'mac-version', buildId: 'mac-build' }], {
      cwd: dir,
      screenshotPollIntervalMs: 1,
    })

    expect(screenshotCreated).toBe(!legacy)
    expect(screenshotUploaded).toBe(true)
    const committed = writes.find(write => write.path === '/v1/appAssetLibraryImages/shot-123' && write.method === 'PATCH')
    expect(committed?.body.data.attributes).toEqual({ uploaded: true })
    expect(writes.find(write => write.path === '/v1/appAssetLibraryPlacements')?.body.data.attributes.placementGroup).toBe('MAC_GROUP_FROM_APPLE')
    expect(writes.find(write => write.path === '/v1/appAssetLibraryPlacementOrderingRequests')?.body.data.relationships.orderedPlacements.data).toEqual([{ type: 'appAssetLibraryPlacements', id: 'placement-123' }])
    expect(writes.some(write => write.path.includes('appScreenshots'))).toBe(false)
    expect(result.reviewSubmissionIds).toEqual(['review-123'])
    expect(writes.some(write => write.path === '/v1/ageRatingDeclarations/info-123' && write.body.data.attributes.advertising === false)).toBe(true)
    expect(writes.some(write => write.path === '/v1/builds/mac-build' && write.body.data.attributes.usesNonExemptEncryption === false)).toBe(true)
    expect(writes.some(write => write.path === '/v1/reviewSubmissions/review-123' && write.body.data.attributes.submitted === true)).toBe(true)
  })

  it('keeps an active review submission intact when a submit command is retried', async () => {
    let writes = 0
    const fetcher = (async (input: string | URL | Request, init?: RequestInit) => {
      if (init?.method && init.method !== 'GET')
        writes += 1
      const url = new URL(String(input))
      if (url.pathname.endsWith('/apps')) {
        return Response.json({ data: [{
          type: 'apps',
          id: 'app-123',
          attributes: { bundleId: 'dev.example.native-app', name: 'Native App', primaryLocale: 'en-US', sku: 'test' },
        }] })
      }
      if (url.pathname.endsWith('/apps/app-123/appStoreVersions')) {
        return Response.json({ data: [{
          type: 'appStoreVersions',
          id: 'mac-version',
          attributes: { platform: 'MAC_OS', versionString: '0.2.0', appStoreState: 'WAITING_FOR_REVIEW' },
        }] })
      }
      if (url.pathname.endsWith('/appStoreVersions/mac-version/build'))
        return Response.json({ data: { type: 'builds', id: 'mac-build', attributes: {} } })
      if (url.pathname.endsWith('/appStoreVersions/mac-version/appStoreVersionLocalizations'))
        return Response.json({ data: [{ type: 'appStoreVersionLocalizations', id: 'version-loc', attributes: { locale: 'en-US' } }] })
      if (url.pathname.endsWith('/apps/app-123/reviewSubmissions')) {
        return Response.json({ data: [{
          type: 'reviewSubmissions',
          id: 'review-123',
          attributes: { platform: 'MAC_OS', state: 'WAITING_FOR_REVIEW' },
        }] })
      }
      if (url.pathname.endsWith('/reviewSubmissions/review-123/items')) {
        return Response.json({
          data: [{ type: 'reviewSubmissionItems', id: 'item-123', attributes: { state: 'READY_FOR_REVIEW' } }],
          included: [{ type: 'appStoreVersions', id: 'mac-version', attributes: {} }],
        })
      }
      throw new Error(`Unexpected request ${url.pathname}`)
    }) as typeof fetch

    const result = await submitAppStore({
        subtitle: 'Smaller images',
        privacyPolicyUrl: 'https://example.test/privacy',
        description: 'A private native app.',
        keywords: 'privacy,blocking',
        supportUrl: 'https://example.test/support',
        copyright: '2026 Example',
        primaryCategory: 'UTILITIES',
        contentRightsDeclaration: 'DOES_NOT_USE_THIRD_PARTY_CONTENT',
        price: '0',
        reviewContact: {
          firstName: 'Test',
          lastName: 'Reviewer',
          phone: '+1 555-555-0100',
          email: 'review@example.test',
        },
        screenshots: [],
        submitForReview: true,
    }, {
      bundleId: 'dev.example.native-app',
      version: '0.2.0',
      keyId: 'KEY123',
      issuerId: 'issuer-123',
      keyPath,
      fetch: fetcher,
      baseUrl: 'https://example.test/v1',
    })

    expect(result.reviewSubmissionIds).toEqual(['review-123'])
    expect(writes).toBe(0)
  })
})
