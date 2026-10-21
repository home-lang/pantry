import type { AppStoreConnectClientOptions } from './app-store-connect'
import { createHash } from 'node:crypto'
import { basename, resolve } from 'node:path'
import { readFile } from 'node:fs/promises'
import { AppStoreConnectClient } from './app-store-connect'

export type AppStorePlatform = 'macos' | 'ios'
/** Compatibility names; placement groups are resolved from Apple's live catalog. */
export type AppStoreScreenshotDisplayType = 'APP_DESKTOP' | 'APP_IPHONE_67' | 'APP_IPAD_PRO_3GEN_129'
export interface AppStoreScreenshotGroup {
  platform: 'MAC_APP_STORE' | 'IPHONE_APP_STORE' | 'IPAD_APP_STORE'
  files: string[]
}
export type AppStoreReleaseType = 'MANUAL' | 'AFTER_APPROVAL' | 'SCHEDULED'
export type AppStoreAgeRatingFrequency = 'NONE' | 'INFREQUENT_OR_MILD' | 'FREQUENT_OR_INTENSE'

export interface AppStoreReviewContact {
  firstName: string
  lastName: string
  phone: string
  email: string
  /** Instructions that help App Review find and exercise the app. */
  notes?: string
}

/** App Store age-rating answers. Omitted answers default to no content. */
export interface AppStoreAgeRating {
  advertising?: boolean
  alcoholTobaccoOrDrugUseOrReferences?: AppStoreAgeRatingFrequency
  contests?: AppStoreAgeRatingFrequency
  gambling?: boolean
  gamblingSimulated?: AppStoreAgeRatingFrequency
  gunsOrOtherWeapons?: AppStoreAgeRatingFrequency
  healthOrWellnessTopics?: boolean
  lootBox?: boolean
  medicalOrTreatmentInformation?: AppStoreAgeRatingFrequency
  messagingAndChat?: boolean
  parentalControls?: boolean
  profanityOrCrudeHumor?: AppStoreAgeRatingFrequency
  ageAssurance?: boolean
  sexualContentGraphicAndNudity?: AppStoreAgeRatingFrequency
  sexualContentOrNudity?: AppStoreAgeRatingFrequency
  socialMedia?: boolean
  socialMediaAgeRestricted?: boolean
  horrorOrFearThemes?: AppStoreAgeRatingFrequency
  matureOrSuggestiveThemes?: AppStoreAgeRatingFrequency
  unrestrictedWebAccess?: boolean
  userGeneratedContent?: boolean
  violenceCartoonOrFantasy?: AppStoreAgeRatingFrequency
  violenceRealisticProlongedGraphicOrSadistic?: AppStoreAgeRatingFrequency
  violenceRealistic?: AppStoreAgeRatingFrequency
}

/** Metadata and assets managed through the official App Store Connect API. */
export interface AppStoreMetadata {
  /** Metadata locale. @default en-US */
  locale?: string
  subtitle: string
  privacyPolicyUrl: string
  description: string
  keywords: string
  supportUrl: string
  marketingUrl?: string
  promotionalText?: string
  whatsNew?: string
  copyright: string
  /** App Store category identifier, for example UTILITIES. */
  primaryCategory: string
  /** Whether the app displays or accesses third-party content. */
  contentRightsDeclaration: 'DOES_NOT_USE_THIRD_PARTY_CONTENT' | 'USES_THIRD_PARTY_CONTENT'
  /** Customer price in the base territory. Use '0' for a free app. */
  price: string
  /** ISO 3166-1 alpha-3 base territory. @default USA */
  baseTerritory?: string
  /** Automatically release once App Review approves the version. @default AFTER_APPROVAL */
  releaseType?: AppStoreReleaseType
  /** Make the app available in every current and future territory. @default true */
  availableInNewTerritories?: boolean
  /** Declare that the app does not use the advertising identifier. @default false */
  usesIdfa?: boolean
  /** Export-compliance answer applied to uploaded builds. @default false */
  usesNonExemptEncryption?: boolean
  ageRating?: AppStoreAgeRating
  reviewContact: AppStoreReviewContact
  /** Screenshot files keyed by Apple's display type. Paths are relative to the project root. */
  screenshots: AppStoreScreenshotGroup[] | Partial<Record<AppStoreScreenshotDisplayType, string[]>>
  /** Submit complete versions to App Review after upload. @default false */
  submitForReview?: boolean
}

interface Resource<T extends Record<string, unknown>> {
  type: string
  id: string
  attributes: T
  relationships?: Record<string, { data?: { type: string, id: string } | Array<{ type: string, id: string }> | null }>
}

interface ListResponse<T extends Record<string, unknown>> {
  data: Array<Resource<T>>
  included?: Array<Resource<Record<string, unknown>>>
}

interface ResourceResponse<T extends Record<string, unknown>> {
  data: Resource<T>
}

interface AppInfoAttributes extends Record<string, unknown> {
  appStoreState: string
}

interface LocalizationAttributes extends Record<string, unknown> {
  locale: string
}

interface UploadOperation {
  method: string
  url: string
  length: number
  offset: number
  requestHeaders: Array<{ name: string, value: string }>
}

interface ReviewSubmissionAttributes extends Record<string, unknown> {
  platform: 'IOS' | 'MAC_OS'
  state: string
}

export interface AppStoreVersion {
  platform: AppStorePlatform
  id: string
  buildId?: string
}

export interface AppStoreSubmissionOptions {
  cwd?: string
  /** Submit the prepared versions even if config.submitForReview is false. */
  submit?: boolean
  /** Maximum time to wait for screenshots to process. @default 10 minutes */
  screenshotTimeoutMs?: number
  /** Delay between screenshot processing checks. @default 5 seconds */
  screenshotPollIntervalMs?: number
}

export interface AppStoreSubmissionResult {
  appId: string
  versions: Array<{ platform: AppStorePlatform, versionId: string, localizationId: string }>
  reviewSubmissionIds: string[]
}

export interface SubmitAppStoreOptions extends AppStoreConnectClientOptions, AppStoreSubmissionOptions {
  /** Marketing version whose prepared platform listings should be submitted. */
  version: string
  bundleId: string
  /** Platforms to submit. @default ['macos'] */
  platforms?: AppStorePlatform[]
}

const frequencyFields: Array<keyof AppStoreAgeRating> = [
  'alcoholTobaccoOrDrugUseOrReferences',
  'contests',
  'gamblingSimulated',
  'gunsOrOtherWeapons',
  'medicalOrTreatmentInformation',
  'profanityOrCrudeHumor',
  'sexualContentGraphicAndNudity',
  'sexualContentOrNudity',
  'horrorOrFearThemes',
  'matureOrSuggestiveThemes',
  'violenceCartoonOrFantasy',
  'violenceRealisticProlongedGraphicOrSadistic',
  'violenceRealistic',
]

const booleanFields: Array<keyof AppStoreAgeRating> = [
  'advertising',
  'gambling',
  'healthOrWellnessTopics',
  'lootBox',
  'messagingAndChat',
  'parentalControls',
  'ageAssurance',
  'socialMedia',
  'socialMediaAgeRestricted',
  'unrestrictedWebAccess',
  'userGeneratedContent',
]

const editableVersionStates = new Set(['PREPARE_FOR_SUBMISSION', 'DEVELOPER_REJECTED', 'REJECTED', 'METADATA_REJECTED'])

function ageRatingAttributes(config: AppStoreAgeRating = {}): Record<string, boolean | string> {
  const attributes: Record<string, boolean | string> = {
    ageRatingOverrideV2: 'NONE',
    koreaAgeRatingOverride: 'NONE',
  }
  for (const field of frequencyFields)
    attributes[field] = config[field] ?? 'NONE'
  for (const field of booleanFields)
    attributes[field] = config[field] ?? false
  return attributes
}

function applePlatform(platform: AppStorePlatform): 'IOS' | 'MAC_OS' {
  return platform === 'ios' ? 'IOS' : 'MAC_OS'
}

async function updateAppInfo(client: AppStoreConnectClient, appId: string, config: AppStoreMetadata): Promise<string> {
  await client.request(`/apps/${appId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      data: {
        type: 'apps',
        id: appId,
        attributes: { contentRightsDeclaration: config.contentRightsDeclaration },
      },
    }),
  })
  const infos = await client.request<ListResponse<AppInfoAttributes>>(`/apps/${appId}/appInfos?limit=10`)
  const info = infos.data.find(item => item.attributes.appStoreState === 'PREPARE_FOR_SUBMISSION') ?? infos.data[0]
  if (!info)
    throw new Error('[pantry] App Store Connect has no editable app information resource')

  await client.request(`/appInfos/${info.id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      data: {
        type: 'appInfos',
        id: info.id,
        relationships: {
          primaryCategory: { data: { type: 'appCategories', id: config.primaryCategory } },
        },
      },
    }),
  })

  const localizations = await client.request<ListResponse<LocalizationAttributes>>(`/appInfos/${info.id}/appInfoLocalizations?limit=200`)
  const locale = config.locale ?? 'en-US'
  const localization = localizations.data.find(item => item.attributes.locale === locale)
  if (!localization)
    throw new Error(`[pantry] App Store Connect app information is missing the ${locale} localization`)
  await client.request(`/appInfoLocalizations/${localization.id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      data: {
        type: 'appInfoLocalizations',
        id: localization.id,
        attributes: {
          subtitle: config.subtitle,
          privacyPolicyUrl: config.privacyPolicyUrl,
        },
      },
    }),
  })

  await client.request(`/ageRatingDeclarations/${info.id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      data: {
        type: 'ageRatingDeclarations',
        id: info.id,
        attributes: ageRatingAttributes(config.ageRating),
      },
    }),
  })
  return info.id
}

async function ensurePrice(client: AppStoreConnectClient, appId: string, config: AppStoreMetadata): Promise<void> {
  try {
    const existing = await client.request<ListResponse<Record<string, unknown>>>(`/appPriceSchedules/${appId}/manualPrices?limit=200`)
    if (existing.data.length) return
  }
  catch (error) {
    // A new app exposes the schedule relationship before the schedule exists.
    if (!(error instanceof Error) || !error.message.includes('(404)')) throw error
  }
  const baseTerritory = config.baseTerritory ?? 'USA'
  const pricePoints = await client.request<ListResponse<{ customerPrice: string }>>(`/apps/${appId}/appPricePoints?filter[territory]=${encodeURIComponent(baseTerritory)}&limit=200`)
  const requestedPrice = Number(config.price)
  const pricePoint = pricePoints.data.find(item => Number(item.attributes.customerPrice) === requestedPrice)
  if (!pricePoint)
    throw new Error(`[pantry] App Store price ${config.price} is unavailable in ${baseTerritory}`)
  const localId = '${price}'
  await client.request('/appPriceSchedules', {
    method: 'POST',
    body: JSON.stringify({
      data: {
        type: 'appPriceSchedules',
        relationships: {
          app: { data: { type: 'apps', id: appId } },
          baseTerritory: { data: { type: 'territories', id: baseTerritory } },
          manualPrices: { data: [{ type: 'appPrices', id: localId }] },
        },
      },
      included: [{
        type: 'appPrices',
        id: localId,
        attributes: { startDate: null, endDate: null },
        relationships: { appPricePoint: { data: { type: 'appPricePoints', id: pricePoint.id } } },
      }],
    }),
  })
}

async function ensureAvailability(client: AppStoreConnectClient, appId: string, availableInNewTerritories = true): Promise<void> {
  try {
    const existing = await client.request<ResourceResponse<{ availableInNewTerritories: boolean }>>(`/apps/${appId}/appAvailabilityV2`)
    if (existing.data.attributes.availableInNewTerritories === availableInNewTerritories)
      return
    // Apple currently exposes creation and territory updates, but no direct
    // app-availability PATCH. Keep existing territory choices intact.
    return
  }
  catch (error) {
    if (!(error instanceof Error) || !error.message.includes('(404)'))
      throw error
  }

  const territories = await client.request<ListResponse<Record<string, unknown>>>('/territories?limit=200')
  const included = territories.data.map((territory, index) => {
    const id = `\${territory-${index}}`
    return {
      type: 'territoryAvailabilities',
      id,
      attributes: { available: true },
      relationships: { territory: { data: { type: 'territories', id: territory.id } } },
    }
  })
  await client.request('/v2/appAvailabilities', {
    method: 'POST',
    body: JSON.stringify({
      data: {
        type: 'appAvailabilities',
        attributes: { availableInNewTerritories },
        relationships: {
          app: { data: { type: 'apps', id: appId } },
          territoryAvailabilities: {
            data: included.map(item => ({ type: item.type, id: item.id })),
          },
        },
      },
      included,
    }),
  })
}

async function ensureVersionLocalization(
  client: AppStoreConnectClient,
  versionId: string,
  config: AppStoreMetadata,
): Promise<string> {
  const locale = config.locale ?? 'en-US'
  const localizations = await client.request<ListResponse<LocalizationAttributes>>(`/appStoreVersions/${versionId}/appStoreVersionLocalizations?limit=200`)
  let localization = localizations.data.find(item => item.attributes.locale === locale)
  if (!localization) {
    const created = await client.request<ResourceResponse<LocalizationAttributes>>('/appStoreVersionLocalizations', {
      method: 'POST',
      body: JSON.stringify({
        data: {
          type: 'appStoreVersionLocalizations',
          attributes: { locale },
          relationships: { appStoreVersion: { data: { type: 'appStoreVersions', id: versionId } } },
        },
      }),
    })
    localization = created.data
  }

  await client.request(`/appStoreVersionLocalizations/${localization.id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      data: {
        type: 'appStoreVersionLocalizations',
        id: localization.id,
        attributes: {
          description: config.description,
          keywords: config.keywords,
          supportUrl: config.supportUrl,
          ...(config.marketingUrl ? { marketingUrl: config.marketingUrl } : {}),
          ...(config.promotionalText ? { promotionalText: config.promotionalText } : {}),
          ...(config.whatsNew ? { whatsNew: config.whatsNew } : {}),
        },
      },
    }),
  })
  return localization.id
}

async function ensureReviewDetail(client: AppStoreConnectClient, versionId: string, config: AppStoreMetadata): Promise<void> {
  const response = await client.request<{ data: Resource<Record<string, unknown>> | null }>(`/appStoreVersions/${versionId}/appStoreReviewDetail`)
  const attributes = {
    contactFirstName: config.reviewContact.firstName,
    contactLastName: config.reviewContact.lastName,
    contactPhone: config.reviewContact.phone,
    contactEmail: config.reviewContact.email,
    demoAccountRequired: false,
    ...(config.reviewContact.notes ? { notes: config.reviewContact.notes } : {}),
  }
  if (response.data) {
    await client.request(`/appStoreReviewDetails/${response.data.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ data: { type: 'appStoreReviewDetails', id: response.data.id, attributes } }),
    })
    return
  }
  await client.request('/appStoreReviewDetails', {
    method: 'POST',
    body: JSON.stringify({
      data: {
        type: 'appStoreReviewDetails',
        attributes,
        relationships: { appStoreVersion: { data: { type: 'appStoreVersions', id: versionId } } },
      },
    }),
  })
}

interface LibraryImageAttributes extends Record<string, unknown> {
  fileName: string
  fileSize: number
  referenceName?: string
  specId?: string
  state: string
  stateDetails?: unknown
  uploadOperations?: UploadOperation[]
}

interface AssetReferenceData extends Record<string, unknown> {
  features: Array<{ featureId: string; placementPolicies: Array<{ placementType: string; groupLimits: Array<{ groupIds: string[]; maxCount: number }> }> }>
  placementProfileGroups: Array<{ placementProfileGroupId: string; platform: string }>
  placementTypes: Array<{ placementTypeId: string; specMappings: Array<{ placementGroupId: string; specs: string[] }> }>
}

async function listAssets<T extends Record<string, unknown>>(client: AppStoreConnectClient, path: string): Promise<Array<Resource<T>>> {
  const items: Array<Resource<T>> = []
  let next: string | undefined = path
  while (next) {
    const response: ListResponse<T> & { links?: { next?: string } } = await client.request(next)
    items.push(...response.data)
    next = response.links?.next
  }
  return items
}

async function readyImage(client: AppStoreConnectClient, id: string, timeoutMs: number, pollIntervalMs: number): Promise<Resource<LibraryImageAttributes>> {
  const deadline = Date.now() + timeoutMs
  while (true) {
    const { data } = await client.request<ResourceResponse<LibraryImageAttributes>>(`/appAssetLibraryImages/${id}`)
    if (data.attributes.specId && !['AWAITING_UPLOAD', 'UPLOAD_COMPLETE', 'PROCESSING', 'FAILED', 'REJECTED', 'ARCHIVED'].includes(data.attributes.state)) return data
    if (['FAILED', 'REJECTED', 'ARCHIVED'].includes(data.attributes.state))
      throw new Error(`[pantry] App Store image ${data.attributes.fileName} ${data.attributes.state}: ${JSON.stringify(data.attributes.stateDetails)}`)
    if (Date.now() >= deadline) throw new Error(`[pantry] timed out processing App Store image ${data.attributes.fileName}`)
    await new Promise(resolve => setTimeout(resolve, pollIntervalMs))
  }
}

function screenshotGroups(value: AppStoreMetadata['screenshots']): AppStoreScreenshotGroup[] {
  if (Array.isArray(value)) return value
  const platforms = { APP_DESKTOP: 'MAC_APP_STORE', APP_IPHONE_67: 'IPHONE_APP_STORE', APP_IPAD_PRO_3GEN_129: 'IPAD_APP_STORE' } as const
  return Object.entries(value).flatMap(([name, files]) => files ? [{ platform: platforms[name as AppStoreScreenshotDisplayType], files }] : [])
}

/** Use Apple's asset library and catalog, rather than deprecated screenshot sets. */
async function syncScreenshotPlacements(
  client: AppStoreConnectClient, appId: string, localizationId: string,
  sets: AppStoreScreenshotGroup[], cwd: string, timeoutMs: number, pollIntervalMs: number,
): Promise<void> {
  if (!sets.some(set => set.files.length)) return
  const { data: library } = await client.request<ResourceResponse<Record<string, unknown>>>(`/apps/${appId}/assetLibrary`)
  const { data: references } = await client.request<ListResponse<AssetReferenceData>>('/appAssetLibraryRefData')
  const catalog = references[0]?.attributes
  if (!catalog) throw new Error('[pantry] Apple returned no asset specification catalog')
  const images = await listAssets<LibraryImageAttributes>(client, `/appAssetLibraries/${library.id}/images?limit=200`)
  const placements = await listAssets<{ placementType: string; placementGroup: string }>(client, `/appStoreVersionLocalizations/${localizationId}/placements?filter[placementType]=APP_SCREENSHOT&include=image&limit=200`)
  const desired = new Map<string, string[]>()
  for (const set of sets) {
    for (const relative of set.files) {
      const path = resolve(cwd, relative)
      const bytes = await readFile(path)
      const referenceName = `sha256:${createHash('sha256').update(bytes).digest('hex')}`
      const previous = images.find(item => item.attributes.referenceName === referenceName)
      if (previous?.attributes.state === 'FAILED')
        await client.request(`/appAssetLibraryImages/${previous.id}`, { method: 'DELETE' })
      let image = previous?.attributes.state === 'FAILED' ? undefined : previous
      if (image && ['REJECTED', 'ARCHIVED'].includes(image.attributes.state))
        throw new Error(`[pantry] Existing image ${relative} is ${image.attributes.state}`)
      if (!image) {
        image = (await client.request<ResourceResponse<LibraryImageAttributes>>('/appAssetLibraryImages', {
          method: 'POST', body: JSON.stringify({ data: {
            type: 'appAssetLibraryImages',
            attributes: { fileName: basename(path), fileSize: bytes.byteLength, category: 'APP_SCREENSHOTS_AND_PREVIEWS', referenceName },
            relationships: { assetLibrary: { data: { type: 'appAssetLibraries', id: library.id } } },
          } }),
        })).data
      }
      if (image.attributes.state === 'AWAITING_UPLOAD') {
        if (!image.attributes.uploadOperations)
          image = (await client.request<ResourceResponse<LibraryImageAttributes>>(`/appAssetLibraryImages/${image.id}`)).data
        let uploaded = 0
        for (const op of image.attributes.uploadOperations ?? []) {
          if (op.offset !== uploaded || !Number.isSafeInteger(op.length) || op.length <= 0 || op.offset + op.length > bytes.byteLength)
            throw new Error('[pantry] Invalid Apple image upload byte range')
          await client.upload(op.url, { method: op.method, headers: Object.fromEntries(op.requestHeaders.map(header => [header.name, header.value])), body: bytes.subarray(op.offset, op.offset + op.length) })
          uploaded += op.length
        }
        if (uploaded !== bytes.byteLength) throw new Error('[pantry] Apple image upload operations do not cover the entire file')
        await client.request(`/appAssetLibraryImages/${image.id}`, {
          method: 'PATCH', body: JSON.stringify({ data: { type: 'appAssetLibraryImages', id: image.id, attributes: { uploaded: true } } }),
        })
      }
      image = await readyImage(client, image.id, timeoutMs, pollIntervalMs)
      if (!images.some(existing => existing.id === image!.id)) images.push(image)
      const mappings = catalog.placementTypes.find(type => type.placementTypeId === 'APP_SCREENSHOT')?.specMappings ?? []
      const group = mappings.find(mapping => mapping.specs.includes(image!.attributes.specId!) && catalog.placementProfileGroups.some(profile => profile.placementProfileGroupId === mapping.placementGroupId && profile.platform === set.platform))?.placementGroupId
      if (!group) throw new Error(`[pantry] Image ${relative} does not match an Apple screenshot specification for ${set.platform}`)
      const ids = desired.get(group) ?? []
      if (!ids.includes(image.id)) ids.push(image.id)
      desired.set(group, ids)
    }
  }
  for (const [group, images] of desired) {
    const limit = catalog.features.find(feature => feature.featureId === 'APP_STORE_VERSIONS')?.placementPolicies.find(policy => policy.placementType === 'APP_SCREENSHOT')?.groupLimits.find(limit => limit.groupIds.includes(group))?.maxCount
    if (limit === undefined || images.length > limit) throw new Error(`[pantry] Screenshot count exceeds Apple's limit for ${group}`)
    const current = placements.filter(placement => placement.attributes.placementGroup === group)
    const ordered: Array<{ type: string; id: string }> = []
    for (const imageId of images) {
      let placement = current.find(item => item.relationships?.image?.data && !Array.isArray(item.relationships.image.data) && item.relationships.image.data.id === imageId)
      if (!placement) placement = (await client.request<ResourceResponse<{ placementType: string; placementGroup: string }>>('/appAssetLibraryPlacements', {
        method: 'POST', body: JSON.stringify({ data: {
          type: 'appAssetLibraryPlacements', attributes: { placementType: 'APP_SCREENSHOT', placementGroup: group },
          relationships: { image: { data: { type: 'appAssetLibraryImages', id: imageId } }, appStoreVersionLocalization: { data: { type: 'appStoreVersionLocalizations', id: localizationId } } },
        } }),
      })).data
      ordered.push({ type: 'appAssetLibraryPlacements', id: placement.id })
    }
    for (const placement of current)
      if (!ordered.some(item => item.id === placement.id)) await client.request(`/appAssetLibraryPlacements/${placement.id}`, { method: 'DELETE' })
    await client.request('/appAssetLibraryPlacementOrderingRequests', { method: 'POST', body: JSON.stringify({ data: {
      type: 'appAssetLibraryPlacementOrderingRequests', attributes: { placementGroup: group },
      relationships: { orderedPlacements: { data: ordered }, appStoreVersionLocalization: { data: { type: 'appStoreVersionLocalizations', id: localizationId } } },
    } }) })
  }
}

async function updateVersion(client: AppStoreConnectClient, version: AppStoreVersion, config: AppStoreMetadata): Promise<void> {
  await client.request(`/appStoreVersions/${version.id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      data: {
        type: 'appStoreVersions',
        id: version.id,
        attributes: {
          copyright: config.copyright,
          releaseType: config.releaseType ?? 'AFTER_APPROVAL',
          usesIdfa: config.usesIdfa ?? false,
        },
      },
    }),
  })
  if (version.buildId) {
    const encryption = config.usesNonExemptEncryption ?? false
    const build = await client.request<ResourceResponse<{ usesNonExemptEncryption?: boolean }>>(`/builds/${version.buildId}?fields[builds]=usesNonExemptEncryption`)
    if (build.data.attributes.usesNonExemptEncryption === undefined || build.data.attributes.usesNonExemptEncryption === null) {
      await client.request(`/builds/${version.buildId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          data: {
            type: 'builds',
            id: version.buildId,
            attributes: { usesNonExemptEncryption: encryption },
          },
        }),
      })
    }
  }
}

async function submitVersions(client: AppStoreConnectClient, appId: string, versions: AppStoreVersion[]): Promise<string[]> {
  const existing = await client.request<ListResponse<ReviewSubmissionAttributes>>(`/apps/${appId}/reviewSubmissions?limit=200`)
  const ids: string[] = []
  for (const version of versions) {
    const platform = applePlatform(version.platform)
    const platformSubmissions = existing.data.filter(item => item.attributes.platform === platform)
    let submission: Resource<ReviewSubmissionAttributes> | undefined
    for (const candidate of platformSubmissions) {
      const items = await client.request<ListResponse<Record<string, unknown>>>(`/reviewSubmissions/${candidate.id}/items?include=appStoreVersion&limit=200`)
      const alreadyAdded = (items.included ?? []).some(item => item.type === 'appStoreVersions' && item.id === version.id)
      if (!alreadyAdded)
        continue
      submission = candidate
      if (candidate.attributes.state !== 'READY_FOR_REVIEW') {
        ids.push(candidate.id)
        break
      }
    }
    if (submission && submission.attributes.state !== 'READY_FOR_REVIEW')
      continue
    submission ??= platformSubmissions.find(item => item.attributes.state === 'READY_FOR_REVIEW')
    if (!submission) {
      submission = (await client.request<ResourceResponse<ReviewSubmissionAttributes>>('/reviewSubmissions', {
        method: 'POST',
        body: JSON.stringify({
          data: {
            type: 'reviewSubmissions',
            attributes: { platform },
            relationships: { app: { data: { type: 'apps', id: appId } } },
          },
        }),
      })).data
    }
    const items = await client.request<ListResponse<Record<string, unknown>>>(`/reviewSubmissions/${submission.id}/items?include=appStoreVersion&limit=200`)
    const alreadyAdded = (items.included ?? []).some(item => item.type === 'appStoreVersions' && item.id === version.id)
    if (!alreadyAdded) {
      await client.request('/reviewSubmissionItems', {
        method: 'POST',
        body: JSON.stringify({
          data: {
            type: 'reviewSubmissionItems',
            relationships: {
              reviewSubmission: { data: { type: 'reviewSubmissions', id: submission.id } },
              appStoreVersion: { data: { type: 'appStoreVersions', id: version.id } },
            },
          },
        }),
      })
    }
    await client.request(`/reviewSubmissions/${submission.id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        data: { type: 'reviewSubmissions', id: submission.id, attributes: { submitted: true } },
      }),
    })
    ids.push(submission.id)
  }
  return ids
}

/** Synchronize a App Store listing and optionally submit all configured platforms to App Review. */
export async function prepareAppStoreSubmission(
  client: AppStoreConnectClient,
  store: AppStoreMetadata,
  appId: string,
  versions: AppStoreVersion[],
  options: AppStoreSubmissionOptions = {},
): Promise<AppStoreSubmissionResult> {
  const cwd = options.cwd ?? process.cwd()
  const timeoutMs = options.screenshotTimeoutMs ?? 10 * 60_000
  const pollIntervalMs = options.screenshotPollIntervalMs ?? 5_000

  await updateAppInfo(client, appId, store)
  await ensurePrice(client, appId, store)
  await ensureAvailability(client, appId, store.availableInNewTerritories ?? true)

  const results: AppStoreSubmissionResult['versions'] = []
  for (const version of versions) {
    await updateVersion(client, version, store)
    const localizationId = await ensureVersionLocalization(client, version.id, store)
    await ensureReviewDetail(client, version.id, store)
    const screenshots = screenshotGroups(store.screenshots).filter(set => version.platform === 'macos' ? set.platform === 'MAC_APP_STORE' : set.platform !== 'MAC_APP_STORE')
    await syncScreenshotPlacements(client, appId, localizationId, screenshots, cwd, timeoutMs, pollIntervalMs)
    results.push({ platform: version.platform, versionId: version.id, localizationId })
  }

  const shouldSubmit = options.submit ?? store.submitForReview ?? false
  return {
    appId,
    versions: results,
    reviewSubmissionIds: shouldSubmit ? await submitVersions(client, appId, versions) : [],
  }
}

/** Prepare and submit an already-uploaded App Store version without rebuilding its binary. */
export async function submitAppStore(
  config: AppStoreMetadata,
  options: SubmitAppStoreOptions,
): Promise<AppStoreSubmissionResult> {
  if (!options.bundleId) throw new Error('[pantry] App Store submission requires a bundle ID')
  const client = new AppStoreConnectClient(options)
  const app = await client.findApp(options.bundleId)
  if (!app)
    throw new Error('[pantry] the App Store Connect app record is missing')
  const selectedPlatforms = options.platforms ?? ['macos']
  const availableVersions = await client.listAppStoreVersions(app.id)
  const versions: AppStoreVersion[] = []
  const versionStates: string[] = []
  for (const platform of selectedPlatforms) {
    const match = availableVersions.find(item => item.attributes.platform === applePlatform(platform) && item.attributes.versionString === options.version)
    if (!match)
      throw new Error(`[pantry] ${platform} App Store version ${options.version} does not exist`)
    const build = await client.request<{ data: Resource<Record<string, unknown>> | null }>(`/appStoreVersions/${match.id}/build`)
    versions.push({ platform, id: match.id, buildId: build.data?.id })
    versionStates.push(match.attributes.appStoreState)
  }
  const shouldSubmit = options.submit ?? config.submitForReview ?? false
  if (shouldSubmit && versionStates.every(state => !editableVersionStates.has(state))) {
    const preparedVersions = await Promise.all(versions.map(async (version) => {
      const localizations = await client.request<ListResponse<LocalizationAttributes>>(`/appStoreVersions/${version.id}/appStoreVersionLocalizations?limit=200`)
      return { platform: version.platform, versionId: version.id, localizationId: localizations.data[0]?.id ?? '' }
    }))
    return {
      appId: app.id,
      versions: preparedVersions,
      reviewSubmissionIds: await submitVersions(client, app.id, versions),
    }
  }
  return await prepareAppStoreSubmission(client, config, app.id, versions, options)
}
