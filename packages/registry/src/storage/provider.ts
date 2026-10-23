/**
 * Object storage provider resolution for the registry.
 *
 * AWS S3, Backblaze B2 and Hetzner Object Storage all speak the S3 API + SigV4,
 * so one {@link S3Client} drives any of them — only the endpoint host,
 * addressing style and credentials differ. This resolves those from explicit
 * config and environment variables so the tarball store and the metadata store
 * stay in sync.
 *
 * Env vars:
 *   STORAGE_PROVIDER          aws | backblaze | hetzner | r2   (default: aws)
 *   S3_REGION / AWS_REGION    region/location slug
 *   S3_ENDPOINT               endpoint host override (no scheme)
 *   S3_FORCE_PATH_STYLE       "true" to force path-style addressing
 *   S3_CDN_BASE_URL           public CDN origin for artifacts (see cdnBaseUrl)
 *   Backblaze creds: B2_APPLICATION_KEY_ID + B2_APPLICATION_KEY (or S3_/AWS_ keys)
 *   Hetzner creds:   HETZNER_S3_ACCESS_KEY + HETZNER_S3_SECRET_KEY (or S3_/AWS_ keys)
 *   R2 creds:        R2_ACCESS_KEY_ID + R2_SECRET_ACCESS_KEY (or S3_/AWS_ keys),
 *                    plus R2_ACCOUNT_ID for the endpoint host
 */

import { S3Client } from './aws-client'

export type StorageProvider = 'aws' | 'backblaze' | 'hetzner' | 'r2'

interface Credentials {
  accessKeyId: string
  secretAccessKey: string
  sessionToken?: string
}

export interface ResolvedStorage {
  provider: StorageProvider
  region: string
  endpoint?: string
  forcePathStyle: boolean
  credentials?: Credentials
  /** Public HTTPS base URL for a bucket (no trailing slash). */
  publicBaseUrl: (bucket: string) => string
  /**
   * Public CDN origin that serves the bucket's objects, without a trailing
   * slash, or undefined when there isn't one.
   *
   * This is what makes a CDN worth putting in front of artifacts at all. A
   * presigned URL is unique per request, so a cache can never reuse one; a
   * plain URL under a CDN hostname is the same for everyone and can be served
   * from the edge, which is the difference between paying origin egress once
   * per download and once per object per edge location. Set it only for a
   * bucket whose objects are genuinely public — the registry stops signing
   * artifact URLs entirely when it is present.
   */
  cdnBaseUrl?: string
}

const DEFAULT_REGION: Record<StorageProvider, string> = {
  aws: 'us-east-1',
  backblaze: 'us-west-004',
  hetzner: 'fsn1',
  // R2 is a single global namespace; the S3 API expects the literal "auto".
  r2: 'auto',
}

export function providerEndpoint(provider: StorageProvider, region: string): string | undefined {
  switch (provider) {
    case 'backblaze':
      return `s3.${region}.backblazeb2.com`
    case 'hetzner':
      return `${region}.your-objectstorage.com`
    case 'r2': {
      // R2's S3 endpoint is account-scoped rather than region-scoped. Without
      // the account id there is no host to build, so leave it unset and let an
      // explicit S3_ENDPOINT (or a startup failure) surface the misconfiguration.
      const account = env('R2_ACCOUNT_ID', 'CLOUDFLARE_ACCOUNT_ID')
      return account ? `${account}.r2.cloudflarestorage.com` : undefined
    }
    default:
      return undefined
  }
}

function env(...names: string[]): string | undefined {
  for (const name of names) {
    const value = process.env[name]
    if (value)
      return value
  }
  return undefined
}

function resolveCredentials(provider: StorageProvider): Credentials | undefined {
  let accessKeyId: string | undefined
  let secretAccessKey: string | undefined

  if (provider === 'backblaze') {
    accessKeyId = env('B2_APPLICATION_KEY_ID', 'B2_KEY_ID', 'S3_ACCESS_KEY_ID', 'AWS_ACCESS_KEY_ID')
    secretAccessKey = env('B2_APPLICATION_KEY', 'B2_SECRET_KEY', 'S3_SECRET_ACCESS_KEY', 'AWS_SECRET_ACCESS_KEY')
  }
  else if (provider === 'hetzner') {
    accessKeyId = env('HETZNER_S3_ACCESS_KEY', 'HETZNER_ACCESS_KEY', 'S3_ACCESS_KEY_ID', 'AWS_ACCESS_KEY_ID')
    secretAccessKey = env('HETZNER_S3_SECRET_KEY', 'HETZNER_SECRET_KEY', 'S3_SECRET_ACCESS_KEY', 'AWS_SECRET_ACCESS_KEY')
  }
  else if (provider === 'r2') {
    accessKeyId = env('R2_ACCESS_KEY_ID', 'S3_ACCESS_KEY_ID', 'AWS_ACCESS_KEY_ID')
    secretAccessKey = env('R2_SECRET_ACCESS_KEY', 'R2_SECRET_KEY', 'S3_SECRET_ACCESS_KEY', 'AWS_SECRET_ACCESS_KEY')
  }
  else {
    // AWS: prefer generic S3_*, else let the client fall back to AWS_*/instance role.
    accessKeyId = env('S3_ACCESS_KEY_ID')
    secretAccessKey = env('S3_SECRET_ACCESS_KEY')
  }

  if (accessKeyId && secretAccessKey)
    return { accessKeyId, secretAccessKey, sessionToken: env('AWS_SESSION_TOKEN') }
  return undefined
}

export interface StorageOverrides {
  provider?: StorageProvider
  region?: string
  endpoint?: string
  forcePathStyle?: boolean
  cdnBaseUrl?: string
}

/** Resolve the active object-storage configuration from overrides + environment. */
export function resolveStorageProvider(overrides: StorageOverrides = {}): ResolvedStorage {
  const provider = overrides.provider
    || (env('STORAGE_PROVIDER', 'OBJECT_STORAGE_PROVIDER') as StorageProvider | undefined)
    || 'aws'
  if (!Object.hasOwn(DEFAULT_REGION, provider))
    throw new Error(`Unsupported storage provider: ${provider}`)

  const region = overrides.region
    || (provider === 'backblaze' ? env('B2_REGION') : undefined)
    || (provider === 'hetzner' ? env('HETZNER_S3_REGION', 'HETZNER_REGION') : undefined)
    || env('S3_REGION', 'AWS_REGION', 'AWS_DEFAULT_REGION')
    || DEFAULT_REGION[provider]

  const endpoint = overrides.endpoint || env('S3_ENDPOINT') || providerEndpoint(provider, region)
  if (provider === 'r2') {
    if (!endpoint)
      throw new Error('R2 requires R2_ACCOUNT_ID or S3_ENDPOINT')
    if (region !== 'auto')
      throw new Error('R2 requires S3_REGION=auto; clear any inherited AWS_REGION or set S3_REGION explicitly')
  }
  // R2 only serves the S3 API path-style; virtual-host addressing 404s there.
  const forcePathStyle = provider === 'r2' || (overrides.forcePathStyle
    ?? env('S3_FORCE_PATH_STYLE') === 'true')
  const credentials = resolveCredentials(provider)
  const cdnBaseUrl = (overrides.cdnBaseUrl || env('S3_CDN_BASE_URL', 'STORAGE_CDN_BASE_URL') || '')
    .trim()
    .replace(/\/+$/, '') || undefined

  const publicBaseUrl = (bucket: string): string => {
    const base = endpoint || `s3.${region}.amazonaws.com`
    return forcePathStyle ? `https://${base}/${bucket}` : `https://${bucket}.${base}`
  }

  return { provider, region, endpoint, forcePathStyle, credentials, publicBaseUrl, cdnBaseUrl }
}

/** Build an {@link S3Client} from a resolved storage configuration. */
export function createS3Client(resolved: ResolvedStorage): S3Client {
  return new S3Client(resolved.region, {
    endpoint: resolved.endpoint,
    forcePathStyle: resolved.forcePathStyle,
    credentials: resolved.credentials,
  })
}
