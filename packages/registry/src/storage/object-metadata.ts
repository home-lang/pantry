import type { S3Client } from './aws-client'
import { InMemoryMetadataStorage } from './metadata'

/**
 * Object-storage-backed metadata store.
 *
 * Keeps the full registry metadata model in memory and persists it as a single
 * JSON object in the storage bucket — the same pattern as FileMetadataStorage,
 * but the durable target is an S3-compatible object (Backblaze B2 / Hetzner /
 * S3) instead of the local filesystem. This lets the registry run fully off
 * AWS DynamoDB.
 *
 * The registry runs as a single instance, so an in-memory model with debounced,
 * serialized writes is safe (no multi-writer contention). On boot it reloads the
 * snapshot from the bucket.
 */
export class ObjectMetadataStorage extends InMemoryMetadataStorage {
  private s3: S3Client
  private bucket: string
  private key: string
  private loaded: Promise<void>
  private saveTimeout: ReturnType<typeof setTimeout> | null = null
  private savePromise: Promise<void> | null = null

  constructor(s3: S3Client, bucket: string, key = 'metadata/registry-index.json') {
    super()
    this.s3 = s3
    this.bucket = bucket
    this.key = key
    this.loaded = this.load()
  }

  /** Resolves once the initial snapshot has loaded — await on boot before serving reads. */
  ready(): Promise<void> {
    return this.loaded
  }

  private async load(): Promise<void> {
    try {
      const buf = await this.s3.getObjectBuffer(this.bucket, this.key)
      if (!buf || buf.byteLength === 0)
        return
      const data = JSON.parse(buf.toString('utf-8'))
      this.applyState(data)
    }
    catch (err) {
      // A missing object on first run is expected (404/403). Anything else we
      // log loudly but still start empty rather than block the server boot —
      // and we do NOT overwrite the remote object until the next real save.
      const msg = (err as Error).message || ''
      if (!/\b40[34]\b/.test(msg)) {
        console.error(`ObjectMetadataStorage: failed to load ${this.bucket}/${this.key}: ${msg}. Starting empty.`)
      }
    }
  }

  // Persist after every mutation, debounced.
  protected onMutate(): void {
    if (this.saveTimeout)
      clearTimeout(this.saveTimeout)
    this.saveTimeout = setTimeout(() => {
      this.saveTimeout = null
      this.save().catch(err => console.error('ObjectMetadataStorage save failed:', (err as Error).message))
    }, 1000)
  }

  private async save(): Promise<void> {
    // Serialize saves so a slow upload can't be overtaken by a newer one.
    while (this.savePromise) await this.savePromise
    this.savePromise = this._doSave()
    try {
      await this.savePromise
    }
    finally {
      this.savePromise = null
    }
  }

  private async _doSave(): Promise<void> {
    const payload = JSON.stringify(this.captureState())
    await this.s3.putObject({
      bucket: this.bucket,
      key: this.key,
      body: payload,
      contentType: 'application/json',
    })
  }

  /** Flush any pending save immediately (e.g. before shutdown). */
  async flush(): Promise<void> {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout)
      this.saveTimeout = null
    }
    await this.save()
  }
}
