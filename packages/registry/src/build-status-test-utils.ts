import { S3Client, S3RequestError } from './storage/aws-client'
import { BuildStatusStore } from './storage/build-status'

/** Each HTTP fixture owns its snapshot objects and exercises normal hydration. */
class MemoryBuildStatusStorage extends S3Client {
  readonly objects: Map<string, Buffer> = new Map()

  constructor(private beforeRead?: (key: string) => Promise<void>) {
    super()
  }

  // eslint-disable-next-line pickier/no-unused-vars
  override async getObjectBuffer(bucket: string, key: string): Promise<Buffer> {
    await this.beforeRead?.(key)
    const bytes = this.objects.get(key)
    if (!bytes) throw new S3RequestError('GET', 404, 'NoSuchKey')
    return Buffer.from(bytes)
  }

  override async putObject(input: Parameters<S3Client['putObject']>[0]): Promise<void> {
    this.objects.set(input.key, Buffer.from(input.body))
  }

  override async list(input: Parameters<S3Client['list']>[0]): Promise<Array<{ Key: string, Size: number }>> {
    return [...this.objects.entries()]
      .filter(([key]) => key.startsWith(input.prefix || ''))
      .map(([key, value]) => ({ Key: key, Size: value.length }))
  }
}

export function createBuildStatusFixture(beforeRead?: (key: string) => Promise<void>): {
  storage: MemoryBuildStatusStorage
  bucket: string
  store: BuildStatusStore
} {
  const storage = new MemoryBuildStatusStorage(beforeRead)
  const bucket = 'owned-build-status-fixture'
  const store = new BuildStatusStore(storage, bucket)
  return { storage, bucket, store }
}
