import { createObjectStorageClient as createSdkStorageClient } from '@stacksjs/ts-cloud'
import { resolveStorageProvider, type StorageProvider } from '../../registry/src/storage/provider'

type SdkConfig = NonNullable<Parameters<typeof createSdkStorageClient>[0]>
type StorageConfig = Omit<SdkConfig, 'provider'> & { provider?: StorageProvider }

/** Keep builders and repair jobs compatible with the registry's R2 settings. */
export function createObjectStorageClient(config: StorageConfig = {}): ReturnType<typeof createSdkStorageClient> {
  const provider = config.provider || process.env.STORAGE_PROVIDER || process.env.OBJECT_STORAGE_PROVIDER || 'aws'
  if (provider !== 'r2') return createSdkStorageClient({ ...config, provider } as SdkConfig)

  // The pinned ts-cloud SDK has no named R2 provider yet. Its S3 client supports
  // R2 when given the explicit endpoint, signing region, credentials and path
  // style; resolve them through the same validated defaults as the registry.
  const storage = resolveStorageProvider({ ...config, provider: 'r2' })
  return createSdkStorageClient({
    ...config,
    provider: 'aws',
    region: storage.region,
    endpoint: storage.endpoint,
    forcePathStyle: storage.forcePathStyle,
    credentials: config.credentials || storage.credentials,
  })
}
