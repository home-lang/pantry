import { spawnSync } from 'node:child_process'
import { createHash, createPrivateKey, createPublicKey, sign, X509Certificate } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'

const APP_STORE_CONNECT_BASE_URL = 'https://api.appstoreconnect.apple.com/v1'

export type BundleIdPlatform = 'IOS' | 'MAC_OS' | 'UNIVERSAL'
export type AppStoreVersionPlatform = 'IOS' | 'MAC_OS'
export type MacDistributionCertificateType = 'MAC_APP_DISTRIBUTION' | 'MAC_INSTALLER_DISTRIBUTION'

export interface AppStoreConnectAuth {
  keyId?: string
  issuerId?: string
  keyPath?: string
}

export interface AppStoreConnectResource<T extends Record<string, unknown>> {
  type: string
  id: string
  attributes: T
  relationships?: Record<string, { data?: { type: string, id: string } | null }>
}

export interface BundleIdAttributes extends Record<string, unknown> {
  identifier: string
  name: string
  platform: BundleIdPlatform
  seedId?: string
}

export interface BundleIdCapabilityAttributes extends Record<string, unknown> {
  capabilityType: string
  settings?: Array<Record<string, unknown>>
}

export interface CertificateAttributes extends Record<string, unknown> {
  certificateType: MacDistributionCertificateType
  displayName?: string
  name?: string
  serialNumber?: string
  platform?: string
  expirationDate?: string
  certificateContent?: string
  activated?: boolean
}

export interface ProfileAttributes extends Record<string, unknown> {
  name: string
  platform?: BundleIdPlatform
  profileContent?: string
  uuid?: string
  createdDate?: string
  expirationDate?: string
  profileState: 'ACTIVE' | 'INVALID'
  profileType: 'MAC_APP_STORE'
}

export interface AppAttributes extends Record<string, unknown> {
  bundleId: string
  name: string
  primaryLocale: string
  sku: string
}

export interface AppStoreVersionAttributes extends Record<string, unknown> {
  platform: AppStoreVersionPlatform
  versionString: string
  appStoreState: string
}

export interface BuildAttributes extends Record<string, unknown> {
  version: string
  uploadedDate: string
  expired: boolean
  processingState: string
}

export interface PreReleaseVersionAttributes extends Record<string, unknown> {
  version: string
  platform: AppStoreVersionPlatform
}

export interface AppStoreBuildResult {
  id: string
  buildNumber: string
  version: string
  platform: AppStoreVersionPlatform
  processingState: string
}

export type AppStoreVersionStatus = 'ready' | 'deferred' | 'published'

export interface AppStoreVersionResult {
  platform: AppStoreVersionPlatform
  version: string
  created: boolean
  updated: boolean
  id: string
  status: AppStoreVersionStatus
  appStoreState: string
  reason?: string
}

export interface AppStoreBuildAttachmentResult {
  platform: AppStoreVersionPlatform
  versionId: string
  buildId: string
  buildNumber: string
}

export interface WaitForAppStoreBuildsOptions {
  /** Maximum time to wait for App Store Connect processing. @default 20 minutes */
  timeoutMs?: number
  /** Delay between App Store Connect processing checks. @default 15 seconds */
  pollIntervalMs?: number
  /** Test or host hook for waiting between processing checks. */
  sleep?: (milliseconds: number) => Promise<void>
  /** Test or host hook for the current time. */
  now?: () => number
}

export interface AppStoreConnectClientOptions extends AppStoreConnectAuth {
  baseUrl?: string
  fetch?: typeof globalThis.fetch
  now?: () => number
}

interface ApiListResponse<T extends Record<string, unknown>> {
  data: Array<AppStoreConnectResource<T>>
  included?: Array<AppStoreConnectResource<Record<string, unknown>>>
}

interface ApiResourceResponse<T extends Record<string, unknown>> {
  data: AppStoreConnectResource<T>
}

interface ApiError {
  status?: string
  code?: string
  title?: string
  detail?: string
  meta?: { associatedErrors?: Record<string, ApiError[]> }
}

interface ApiErrorResponse {
  errors?: ApiError[]
}

function apiErrorMessages(error: ApiError): string[] {
  const messages = [error.detail ?? error.title ?? error.code].filter((message): message is string => Boolean(message))
  for (const associated of Object.values(error.meta?.associatedErrors ?? {})) {
    for (const nested of associated)
      messages.push(...apiErrorMessages(nested))
  }
  return messages
}

function base64urlJson(value: unknown): string {
  return Buffer.from(JSON.stringify(value)).toString('base64url')
}

function resolveAuth(auth: AppStoreConnectAuth): Required<AppStoreConnectAuth> {
  const resolved = {
    keyId: auth.keyId || process.env.APP_STORE_CONNECT_API_KEY_ID || '',
    issuerId: auth.issuerId || process.env.APP_STORE_CONNECT_API_ISSUER_ID || '',
    keyPath: auth.keyPath || process.env.APP_STORE_CONNECT_API_KEY_PATH || '',
  }
  if (!resolved.keyId)
    throw new Error('[pantry] APP_STORE_CONNECT_API_KEY_ID is required')
  if (!resolved.issuerId)
    throw new Error('[pantry] APP_STORE_CONNECT_API_ISSUER_ID is required')
  if (!resolved.keyPath || !existsSync(resolved.keyPath))
    throw new Error('[pantry] APP_STORE_CONNECT_API_KEY_PATH must point to an existing .p8 file')
  return resolved
}

export function appStoreConnectToken(auth: Required<AppStoreConnectAuth>, now: number = Math.floor(Date.now() / 1000)): string {
  const header = { alg: 'ES256', kid: auth.keyId, typ: 'JWT' }
  const payload = {
    iss: auth.issuerId,
    iat: now,
    exp: now + 120,
    aud: 'appstoreconnect-v1',
  }
  const input = `${base64urlJson(header)}.${base64urlJson(payload)}`
  let key: ReturnType<typeof createPrivateKey>
  try {
    key = createPrivateKey(readFileSync(auth.keyPath, 'utf8'))
  }
  catch (error) {
    throw new Error(`[pantry] App Store Connect API key could not be parsed: ${error instanceof Error ? error.message : String(error)}`)
  }
  const signature = sign('sha256', Buffer.from(input), { key, dsaEncoding: 'ieee-p1363' })
  return `${input}.${signature.toString('base64url')}`
}

export class AppStoreConnectClient {
  private readonly auth: Required<AppStoreConnectAuth>
  private readonly baseUrl: string
  private readonly fetcher: typeof globalThis.fetch
  private readonly now: () => number

  constructor(options: AppStoreConnectClientOptions = {}) {
    this.auth = resolveAuth(options)
    this.baseUrl = (options.baseUrl ?? APP_STORE_CONNECT_BASE_URL).replace(/\/$/, '')
    this.fetcher = options.fetch ?? globalThis.fetch
    this.now = options.now ?? (() => Math.floor(Date.now() / 1000))
  }

  async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const url = /^https?:\/\//.test(path)
      ? path
      : /^\/v\d+\//.test(path)
        ? `${new URL(this.baseUrl).origin}${path}`
        : `${this.baseUrl}${path}`
    const response = await this.fetcher(url, {
      ...init,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${appStoreConnectToken(this.auth, this.now())}`,
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...init.headers,
      },
    })
    if (!response.ok) {
      const body = await response.json().catch(() => ({})) as ApiErrorResponse
      const details = [...new Set(body.errors?.flatMap(apiErrorMessages) ?? [])].join('; ')
      throw new Error(`[pantry] App Store Connect ${init.method ?? 'GET'} ${path} failed (${response.status})${details ? `: ${details}` : ''}`)
    }
    if (response.status === 204)
      return undefined as T
    return await response.json() as T
  }

  async upload(url: string, init: RequestInit): Promise<void> {
    const headers = new Headers(init.headers)
    // Send exactly the reserved byte range, independently of Buffer backing
    // allocations and transfer framing. Asset URLs do not receive the JWT.
    let body = init.body
    let bytes: Uint8Array | undefined
    if (ArrayBuffer.isView(body)) {
      const copy = new ArrayBuffer(body.byteLength)
      bytes = new Uint8Array(copy)
      bytes.set(new Uint8Array(body.buffer, body.byteOffset, body.byteLength))
      body = copy
    }
    else if (body instanceof ArrayBuffer) bytes = new Uint8Array(body)
    if (bytes) headers.set('Content-Length', String(bytes.byteLength))
    const response = await this.fetcher(url, { ...init, headers, body })
    if (!response.ok)
      throw new Error(`[pantry] App Store Connect asset upload failed (${response.status})`)
    const etag = response.headers.get('etag')?.replaceAll('"', '')
    if (bytes && etag && /^[a-f\d]{32}$/i.test(etag) && createHash('md5').update(bytes).digest('hex') !== etag.toLowerCase())
      throw new Error('[pantry] App Store Connect received an asset part with a different checksum')
  }

  async findBundleId(identifier: string): Promise<AppStoreConnectResource<BundleIdAttributes> | undefined> {
    const query = new URLSearchParams({ 'filter[identifier]': identifier })
    const response = await this.request<ApiListResponse<BundleIdAttributes>>(`/bundleIds?${query}`)
    return response.data.find(bundleId => bundleId.attributes.identifier === identifier)
  }

  async registerBundleId(identifier: string, name: string, platform: BundleIdPlatform = 'MAC_OS'): Promise<AppStoreConnectResource<BundleIdAttributes>> {
    const response = await this.request<ApiResourceResponse<BundleIdAttributes>>('/bundleIds', {
      method: 'POST',
      body: JSON.stringify({
        data: {
          type: 'bundleIds',
          attributes: { identifier, name, platform },
        },
      }),
    })
    return response.data
  }

  async ensureBundleId(identifier: string, name: string, options: { checkOnly?: boolean, platform?: BundleIdPlatform } = {}): Promise<{ bundleId?: AppStoreConnectResource<BundleIdAttributes>, created: boolean }> {
    const existing = await this.findBundleId(identifier)
    if (existing)
      return { bundleId: existing, created: false }
    if (options.checkOnly)
      return { created: false }
    return {
      bundleId: await this.registerBundleId(identifier, name, options.platform),
      created: true,
    }
  }

  async listBundleIdCapabilities(bundleIdId: string): Promise<Array<AppStoreConnectResource<BundleIdCapabilityAttributes>>> {
    // This relationship returns every capability at once and rejects `limit`
    // with a 400, unlike the top-level collections.
    const response = await this.request<ApiListResponse<BundleIdCapabilityAttributes>>(`/bundleIds/${bundleIdId}/bundleIdCapabilities`)
    return response.data
  }

  async enableBundleIdCapability(
    bundleIdId: string,
    capabilityType: string,
    settings: Array<Record<string, unknown>> = [],
  ): Promise<AppStoreConnectResource<BundleIdCapabilityAttributes>> {
    const response = await this.request<ApiResourceResponse<BundleIdCapabilityAttributes>>('/bundleIdCapabilities', {
      method: 'POST',
      body: JSON.stringify({
        data: {
          type: 'bundleIdCapabilities',
          attributes: { capabilityType, ...(settings.length ? { settings } : {}) },
          relationships: { bundleId: { data: { type: 'bundleIds', id: bundleIdId } } },
        },
      }),
    })
    return response.data
  }

  async listCertificates(certificateType: MacDistributionCertificateType): Promise<Array<AppStoreConnectResource<CertificateAttributes>>> {
    const query = new URLSearchParams({
      'filter[certificateType]': certificateType,
      'fields[certificates]': 'name,certificateType,displayName,serialNumber,platform,expirationDate,certificateContent,activated',
      'limit': '200',
    })
    const response = await this.request<ApiListResponse<CertificateAttributes>>(`/certificates?${query}`)
    return response.data
  }

  async createCertificate(certificateType: MacDistributionCertificateType, csrContent: string): Promise<AppStoreConnectResource<CertificateAttributes>> {
    const response = await this.request<ApiResourceResponse<CertificateAttributes>>('/certificates', {
      method: 'POST',
      body: JSON.stringify({
        data: {
          type: 'certificates',
          attributes: { certificateType, csrContent },
        },
      }),
    })
    return response.data
  }

  async listProfiles(bundleIdId: string): Promise<Array<AppStoreConnectResource<ProfileAttributes>>> {
    // `/profiles` has no bundleId filter (Apple answers it with a 400), so
    // list the type and match on the included bundleId relationship.
    const query = new URLSearchParams({
      'filter[profileType]': 'MAC_APP_STORE',
      'fields[profiles]': 'name,platform,profileContent,uuid,createdDate,expirationDate,profileState,profileType,bundleId,certificates',
      'include': 'bundleId,certificates',
      'limit': '200',
    })
    const response = await this.request<ApiListResponse<ProfileAttributes>>(`/profiles?${query}`)
    return response.data.filter(profile => relationshipIds(profile, 'bundleId').includes(bundleIdId))
  }

  async createMacAppStoreProfile(name: string, bundleIdId: string, certificateId: string): Promise<AppStoreConnectResource<ProfileAttributes>> {
    const response = await this.request<ApiResourceResponse<ProfileAttributes>>('/profiles', {
      method: 'POST',
      body: JSON.stringify({
        data: {
          type: 'profiles',
          attributes: { name, profileType: 'MAC_APP_STORE' },
          relationships: {
            bundleId: { data: { type: 'bundleIds', id: bundleIdId } },
            certificates: { data: [{ type: 'certificates', id: certificateId }] },
          },
        },
      }),
    })
    return response.data
  }

  async findApp(bundleId: string): Promise<AppStoreConnectResource<AppAttributes> | undefined> {
    const query = new URLSearchParams({ 'filter[bundleId]': bundleId })
    const response = await this.request<ApiListResponse<AppAttributes>>(`/apps?${query}`)
    return response.data.find(app => app.attributes.bundleId === bundleId)
  }

  async listAppStoreVersions(appId: string): Promise<Array<AppStoreConnectResource<AppStoreVersionAttributes>>> {
    const response = await this.request<ApiListResponse<AppStoreVersionAttributes>>(`/apps/${appId}/appStoreVersions?limit=200`)
    return response.data
  }

  async createAppStoreVersion(appId: string, platform: AppStoreVersionPlatform, versionString: string): Promise<AppStoreConnectResource<AppStoreVersionAttributes>> {
    const response = await this.request<ApiResourceResponse<AppStoreVersionAttributes>>('/appStoreVersions', {
      method: 'POST',
      body: JSON.stringify({
        data: {
          type: 'appStoreVersions',
          attributes: { platform, versionString },
          relationships: { app: { data: { type: 'apps', id: appId } } },
        },
      }),
    })
    return response.data
  }

  async updateAppStoreVersion(versionId: string, versionString: string): Promise<AppStoreConnectResource<AppStoreVersionAttributes>> {
    const response = await this.request<ApiResourceResponse<AppStoreVersionAttributes>>(`/appStoreVersions/${versionId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        data: {
          type: 'appStoreVersions',
          id: versionId,
          attributes: { versionString },
        },
      }),
    })
    return response.data
  }

  async listBuilds(appId: string, buildNumber: string): Promise<AppStoreBuildResult[]> {
    const query = new URLSearchParams({
      'filter[app]': appId,
      'filter[version]': buildNumber,
      'include': 'preReleaseVersion',
      'limit': '20',
      'fields[builds]': 'version,uploadedDate,expired,processingState,preReleaseVersion',
      'fields[preReleaseVersions]': 'version,platform',
    })
    const response = await this.request<ApiListResponse<BuildAttributes>>(`/builds?${query}`)
    const preReleaseVersions = new Map(
      (response.included ?? [])
        .filter(item => item.type === 'preReleaseVersions')
        .map(item => [item.id, item.attributes as PreReleaseVersionAttributes]),
    )
    return response.data.flatMap((build) => {
      const preReleaseVersionId = build.relationships?.preReleaseVersion?.data?.id
      const preReleaseVersion = preReleaseVersionId ? preReleaseVersions.get(preReleaseVersionId) : undefined
      if (!preReleaseVersion)
        return []
      return [{
        id: build.id,
        buildNumber: build.attributes.version,
        version: preReleaseVersion.version,
        platform: preReleaseVersion.platform,
        processingState: build.attributes.processingState,
      }]
    })
  }

  async attachBuild(versionId: string, buildId: string): Promise<void> {
    await this.request<void>(`/appStoreVersions/${versionId}/relationships/build`, {
      method: 'PATCH',
      body: JSON.stringify({ data: { type: 'builds', id: buildId } }),
    })
  }
}

const editableVersionStates = new Set([
  'PREPARE_FOR_SUBMISSION',
  'DEVELOPER_REJECTED',
  'REJECTED',
  'METADATA_REJECTED',
  'INVALID_BINARY',
])

const releasedVersionStates = new Set([
  'READY_FOR_DISTRIBUTION',
  'READY_FOR_SALE',
  'DEVELOPER_REMOVED_FROM_SALE',
  'REMOVED_FROM_SALE',
])

/** Create or align an editable App Store version for each requested Apple platform. */
export async function ensureAppStoreVersions(
  client: AppStoreConnectClient,
  appId: string,
  requestedVersions: Array<{ platform: AppStoreVersionPlatform, version: string }>,
): Promise<AppStoreVersionResult[]> {
  const versions = await client.listAppStoreVersions(appId)
  const results: AppStoreVersionResult[] = []
  const unique = new Map(requestedVersions.map(request => [request.platform, request]))

  for (const { platform, version } of unique.values()) {
    const exact = versions.find(item => item.attributes.platform === platform && item.attributes.versionString === version)
    if (exact) {
      const appStoreState = exact.attributes.appStoreState
      const status: AppStoreVersionStatus = editableVersionStates.has(appStoreState)
        ? 'ready'
        : releasedVersionStates.has(appStoreState)
          ? 'published'
          : 'deferred'
      results.push({
        platform,
        version,
        created: false,
        updated: false,
        id: exact.id,
        status,
        appStoreState,
        ...(status === 'deferred' ? { reason: `${platform} version ${version} is already ${appStoreState}` } : {}),
      })
      continue
    }

    const editable = versions.find(item => item.attributes.platform === platform && editableVersionStates.has(item.attributes.appStoreState))
    if (editable) {
      const updated = await client.updateAppStoreVersion(editable.id, version)
      editable.attributes.versionString = version
      results.push({
        platform,
        version,
        created: false,
        updated: true,
        id: updated.id,
        status: 'ready',
        appStoreState: updated.attributes.appStoreState,
      })
      continue
    }

    const blocking = versions.find(item => item.attributes.platform === platform && !releasedVersionStates.has(item.attributes.appStoreState))
    if (blocking) {
      results.push({
        platform,
        version,
        created: false,
        updated: false,
        id: blocking.id,
        status: 'deferred',
        appStoreState: blocking.attributes.appStoreState,
        reason: `${platform} version ${version} is queued behind ${blocking.attributes.versionString} (${blocking.attributes.appStoreState})`,
      })
      continue
    }

    const created = await client.createAppStoreVersion(appId, platform, version)
    versions.push(created)
    results.push({
      platform,
      version,
      created: true,
      updated: false,
      id: created.id,
      status: 'ready',
      appStoreState: created.attributes.appStoreState,
    })
  }
  return results
}

/** Wait for uploaded binaries to process, then select them for their App Store versions. */
export async function waitForAppStoreBuilds(
  client: AppStoreConnectClient,
  appId: string,
  versions: Array<Pick<AppStoreVersionResult, 'platform' | 'version' | 'id'>>,
  buildNumber: string,
  options: WaitForAppStoreBuildsOptions = {},
): Promise<AppStoreBuildAttachmentResult[]> {
  const timeoutMs = options.timeoutMs ?? 20 * 60_000
  const pollIntervalMs = options.pollIntervalMs ?? 15_000
  const now = options.now ?? Date.now
  const sleep = options.sleep ?? (milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds)))
  const deadline = now() + timeoutMs

  while (true) {
    const builds = await client.listBuilds(appId, buildNumber)
    const attachments: AppStoreBuildAttachmentResult[] = []

    for (const version of versions) {
      const build = builds.find(item => item.platform === version.platform && item.version === version.version)
      if (!build)
        continue
      if (build.processingState === 'FAILED' || build.processingState === 'INVALID')
        throw new Error(`[pantry] ${version.platform} build ${buildNumber} failed App Store Connect processing (${build.processingState})`)
      if (build.processingState !== 'VALID')
        continue
      attachments.push({
        platform: version.platform,
        versionId: version.id,
        buildId: build.id,
        buildNumber,
      })
    }

    if (attachments.length === versions.length) {
      for (const attachment of attachments)
        await client.attachBuild(attachment.versionId, attachment.buildId)
      return attachments
    }
    if (now() >= deadline) {
      const waiting = versions.map(item => item.platform).join(', ')
      throw new Error(`[pantry] timed out waiting for ${waiting} build ${buildNumber} to finish App Store Connect processing`)
    }
    await sleep(pollIntervalMs)
  }
}

export interface MacAppProvisionOptions extends AppStoreConnectClientOptions {
  identifier: string
  name: string
  capabilities?: string[]
  appCertificateCsr?: string
  installerCertificateCsr?: string
  profileName?: string
  checkOnly?: boolean
}

export interface MacAppProvisionResult {
  mode: 'plan' | 'apply'
  bundleId: { identifier: string, id?: string, exists: boolean, created: boolean }
  capabilities: Array<{ type: string, enabled: boolean, created: boolean }>
  certificates: Array<{
    type: MacDistributionCertificateType
    id?: string
    exists: boolean
    created: boolean
    expirationDate?: string
    certificateContent?: string
  }>
  profile: {
    id?: string
    name: string
    exists: boolean
    created: boolean
    expirationDate?: string
    profileContent?: string
  }
  appRecord: { exists: boolean, id?: string, manualAction?: string }
  actions: string[]
}

function activeCertificate(
  certificates: Array<AppStoreConnectResource<CertificateAttributes>>,
  now = Date.now(),
): AppStoreConnectResource<CertificateAttributes> | undefined {
  return certificates
    .filter(certificate => certificate.attributes.activated !== false)
    .filter(certificate => !certificate.attributes.expirationDate || Date.parse(certificate.attributes.expirationDate) > now)
    .sort((left, right) => Date.parse(right.attributes.expirationDate || '9999-12-31') - Date.parse(left.attributes.expirationDate || '9999-12-31'))[0]
}

function spkiFromPem(pem: string): string | undefined {
  try {
    return createPublicKey(pem).export({ type: 'spki', format: 'der' }).toString('base64')
  }
  catch {
    return undefined
  }
}

/** The public key a CSR asks Apple to certify, as base64 SPKI DER. */
export function certificateRequestPublicKey(csrContent: string): string | undefined {
  const result = spawnSync('openssl', ['req', '-pubkey', '-noout'], { input: csrContent, encoding: 'utf8' })
  if (result.error || result.status !== 0)
    return undefined
  return spkiFromPem(result.stdout)
}

/** The public key in an App Store Connect certificateContent, as base64 SPKI DER. */
export function certificatePublicKey(certificateContent: string | undefined): string | undefined {
  if (!certificateContent)
    return undefined
  try {
    return new X509Certificate(Buffer.from(certificateContent, 'base64')).publicKey.export({ type: 'spki', format: 'der' }).toString('base64')
  }
  catch {
    return undefined
  }
}

function relationshipIds(resource: AppStoreConnectResource<Record<string, unknown>>, relationship: string): string[] {
  const data = resource.relationships?.[relationship]?.data as
    | { type: string, id: string }
    | Array<{ type: string, id: string }>
    | null
    | undefined
  if (!data)
    return []
  return (Array.isArray(data) ? data : [data]).map(item => item.id)
}

export async function provisionMacApp(options: MacAppProvisionOptions): Promise<MacAppProvisionResult> {
  const client = new AppStoreConnectClient(options)
  const checkOnly = options.checkOnly !== false
  const actions: string[] = []
  const ensuredBundleId = await client.ensureBundleId(options.identifier, options.name, {
    checkOnly,
    platform: 'MAC_OS',
  })
  const bundleId = ensuredBundleId.bundleId
  if (!bundleId)
    actions.push(`Register macOS Bundle ID ${options.identifier}`)

  const capabilityResults: MacAppProvisionResult['capabilities'] = []
  const requestedCapabilities = [...new Set(options.capabilities ?? [])].filter(Boolean).sort()
  const existingCapabilities = bundleId ? await client.listBundleIdCapabilities(bundleId.id) : []
  for (const capabilityType of requestedCapabilities) {
    const existing = existingCapabilities.find(capability => capability.attributes.capabilityType === capabilityType)
    if (existing) {
      capabilityResults.push({ type: capabilityType, enabled: true, created: false })
      continue
    }
    actions.push(`Enable ${capabilityType} for ${options.identifier}`)
    if (!checkOnly && bundleId) {
      await client.enableBundleIdCapability(bundleId.id, capabilityType)
      capabilityResults.push({ type: capabilityType, enabled: true, created: true })
    }
    else {
      capabilityResults.push({ type: capabilityType, enabled: false, created: false })
    }
  }

  const certificateResults: MacAppProvisionResult['certificates'] = []
  const certificateInputs: Array<[MacDistributionCertificateType, string | undefined]> = [
    ['MAC_APP_DISTRIBUTION', options.appCertificateCsr],
    ['MAC_INSTALLER_DISTRIBUTION', options.installerCertificateCsr],
  ]
  for (const [certificateType, csrContent] of certificateInputs) {
    const listed = await client.listCertificates(certificateType)
    // With a CSR, only a certificate issued for its key is usable: one made
    // from another machine's key can sign nothing here and cannot be exported.
    const csrKey = csrContent ? certificateRequestPublicKey(csrContent) : undefined
    if (csrContent && !csrKey)
      throw new Error(`[pantry] ${certificateType} CSR could not be read; is it a PEM certificate request?`)
    const existing = activeCertificate(csrKey
      ? listed.filter(certificate => certificatePublicKey(certificate.attributes.certificateContent) === csrKey)
      : listed)
    if (existing) {
      certificateResults.push({
        type: certificateType,
        id: existing.id,
        exists: true,
        created: false,
        expirationDate: existing.attributes.expirationDate,
        certificateContent: existing.attributes.certificateContent,
      })
      continue
    }
    actions.push(csrKey && activeCertificate(listed)
      ? `Create ${certificateType} certificate (the active ones were issued for a different private key)`
      : `Create ${certificateType} certificate`)
    if (!checkOnly) {
      if (!csrContent)
        throw new Error(`[pantry] ${certificateType} certificate is missing; provide its CSR to apply the provisioning plan`)
      const created = await client.createCertificate(certificateType, csrContent)
      certificateResults.push({
        type: certificateType,
        id: created.id,
        exists: true,
        created: true,
        expirationDate: created.attributes.expirationDate,
        certificateContent: created.attributes.certificateContent,
      })
    }
    else {
      certificateResults.push({ type: certificateType, exists: false, created: false })
    }
  }

  const appCertificate = certificateResults.find(certificate => certificate.type === 'MAC_APP_DISTRIBUTION')
  const profileName = options.profileName || `${options.name} Mac App Store`
  const profiles = bundleId ? await client.listProfiles(bundleId.id) : []
  const activeProfile = profiles.find(profile => (
    profile.attributes.profileState === 'ACTIVE'
    && (!profile.attributes.expirationDate || Date.parse(profile.attributes.expirationDate) > Date.now())
    && (!appCertificate?.id || relationshipIds(profile, 'certificates').includes(appCertificate.id))
  ))
  let profile: MacAppProvisionResult['profile']
  if (activeProfile) {
    profile = {
      id: activeProfile.id,
      name: activeProfile.attributes.name,
      exists: true,
      created: false,
      expirationDate: activeProfile.attributes.expirationDate,
      profileContent: activeProfile.attributes.profileContent,
    }
  }
  else {
    actions.push(`Create MAC_APP_STORE profile ${profileName}`)
    if (!checkOnly) {
      if (!bundleId)
        throw new Error('[pantry] Bundle ID was not created')
      if (!appCertificate?.id)
        throw new Error('[pantry] MAC_APP_DISTRIBUTION certificate is required to create the profile')
      const created = await client.createMacAppStoreProfile(
        profiles.some(item => item.attributes.name === profileName) ? `${profileName} ${appCertificate.id.slice(0, 8)}` : profileName,
        bundleId.id,
        appCertificate.id,
      )
      profile = {
        id: created.id,
        name: created.attributes.name,
        exists: true,
        created: true,
        expirationDate: created.attributes.expirationDate,
        profileContent: created.attributes.profileContent,
      }
    }
    else {
      profile = { name: profileName, exists: false, created: false }
    }
  }

  const app = await client.findApp(options.identifier)
  if (!app)
    actions.push(`Create the ${options.identifier} app record in App Store Connect (manual Apple step)`)
  return {
    mode: checkOnly ? 'plan' : 'apply',
    bundleId: {
      identifier: options.identifier,
      id: bundleId?.id,
      exists: Boolean(bundleId),
      created: ensuredBundleId.created,
    },
    capabilities: capabilityResults,
    certificates: certificateResults,
    profile,
    appRecord: {
      exists: Boolean(app),
      id: app?.id,
      ...(!app ? { manualAction: 'Create the app record in App Store Connect; Apple does not expose an app-creation API.' } : {}),
    },
    actions,
  }
}
