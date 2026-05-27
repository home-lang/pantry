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
 *   STORAGE_PROVIDER          aws | backblaze | hetzner   (default: aws)
 *   S3_REGION / AWS_REGION    region/location slug
 *   S3_ENDPOINT               endpoint host override (no scheme)
 *   S3_FORCE_PATH_STYLE       "true" to force path-style addressing
 *   Backblaze creds: B2_APPLICATION_KEY_ID + B2_APPLICATION_KEY (or S3_/AWS_ keys)
 *   Hetzner creds:   HETZNER_S3_ACCESS_KEY + HETZNER_S3_SECRET_KEY (or S3_/AWS_ keys)
 */

import { S3Client } from './aws-client'

export type StorageProvider = 'aws' | 'backblaze' | 'hetzner'

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
}

const DEFAULT_REGION: Record<StorageProvider, string> = {
  aws: 'us-east-1',
  backblaze: 'us-west-004',
  hetzner: 'fsn1',
}

export function providerEndpoint(provider: StorageProvider, region: string): string | undefined {
  switch (provider) {
    case 'backblaze':
      return `s3.${region}.backblazeb2.com`
    case 'hetzner':
      return `${region}.your-objectstorage.com`
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
}

/** Resolve the active object-storage configuration from overrides + environment. */
export function resolveStorageProvider(overrides: StorageOverrides = {}): ResolvedStorage {
  const provider = overrides.provider
    || (env('STORAGE_PROVIDER', 'OBJECT_STORAGE_PROVIDER') as StorageProvider | undefined)
    || 'aws'

  const region = overrides.region
    || (provider === 'backblaze' ? env('B2_REGION') : undefined)
    || (provider === 'hetzner' ? env('HETZNER_S3_REGION', 'HETZNER_REGION') : undefined)
    || env('S3_REGION', 'AWS_REGION', 'AWS_DEFAULT_REGION')
    || DEFAULT_REGION[provider]

  const endpoint = overrides.endpoint || env('S3_ENDPOINT') || providerEndpoint(provider, region)
  const forcePathStyle = overrides.forcePathStyle ?? (env('S3_FORCE_PATH_STYLE') === 'true')
  const credentials = resolveCredentials(provider)

  const publicBaseUrl = (bucket: string): string => {
    const base = endpoint || `s3.${region}.amazonaws.com`
    return forcePathStyle ? `https://${base}/${bucket}` : `https://${bucket}.${base}`
  }

  return { provider, region, endpoint, forcePathStyle, credentials, publicBaseUrl }
}

/** Build an {@link S3Client} from a resolved storage configuration. */
export function createS3Client(resolved: ResolvedStorage): S3Client {
  return new S3Client(resolved.region, {
    endpoint: resolved.endpoint,
    forcePathStyle: resolved.forcePathStyle,
    credentials: resolved.credentials,
  })
}
