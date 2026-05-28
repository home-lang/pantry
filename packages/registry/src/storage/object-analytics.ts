import type { S3Client } from './aws-client'
import { InMemoryAnalytics } from '../analytics'

/**
 * Object-storage-backed analytics.
 *
 * Keeps the aggregate analytics model (per-package stats, daily counts, category
 * counts, missing-version requests) in memory and persists it as a single JSON
 * object in the storage bucket — the same durable pattern as ObjectMetadataStorage.
 * This replaces the ephemeral InMemoryAnalytics used in production (which lost all
 * tracking on every restart) and the DynamoDB analytics, so download tracking
 * survives restarts and runs fully off AWS.
 *
 * The registry is single-instance, so an in-memory model with debounced, serialized
 * writes is safe. Tracking calls are fire-and-forget and very frequent, so writes
 * are debounced (counters accumulate in memory between flushes).
 */
export class ObjectAnalytics extends InMemoryAnalytics {
  private s3: S3Client
  private bucket: string
  private key: string
  private loaded: Promise<void>
  private saveTimeout: ReturnType<typeof setTimeout> | null = null
  private savePromise: Promise<void> | null = null

  constructor(s3: S3Client, bucket: string, key = 'analytics/registry-analytics.json') {
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
      this.applyAnalyticsState(JSON.parse(buf.toString('utf-8')))
    }
    catch (err) {
      const msg = (err as Error).message || ''
      // A missing object on first run is expected (404/403); start empty otherwise.
      if (!/\b40[34]\b/.test(msg)) {
        console.error(`ObjectAnalytics: failed to load ${this.bucket}/${this.key}: ${msg}. Starting empty.`)
      }
    }
  }

  // Persist after tracking mutations, debounced (analytics writes are very frequent).
  protected onMutate(): void {
    if (this.saveTimeout)
      clearTimeout(this.saveTimeout)
    this.saveTimeout = setTimeout(() => {
      this.saveTimeout = null
      this.save().catch(err => console.error('ObjectAnalytics save failed:', (err as Error).message))
    }, 5000)
  }

  private async save(): Promise<void> {
    while (this.savePromise) await this.savePromise
    this.savePromise = this.doSave()
    try {
      await this.savePromise
    }
    finally {
      this.savePromise = null
    }
  }

  private async doSave(): Promise<void> {
    const payload = JSON.stringify(this.captureAnalyticsState())
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
