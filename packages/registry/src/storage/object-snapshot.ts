import type { S3Client } from './aws-client'
import { isS3ObjectNotFound } from './aws-client'

/**
 * Reusable debounced JSON-snapshot persistence to an S3-compatible bucket.
 *
 * The registry runs as a single instance, so the per-subsystem stores keep their
 * full model in memory and persist it as one JSON object (the same pattern as
 * ObjectMetadataStorage). This composes that load/debounced-save machinery so
 * the PHP, Zig and auth stores can run fully off AWS DynamoDB without each
 * re-implementing it.
 *
 * Large binaries (tarballs) are NOT part of the snapshot — they are written to
 * the bucket under their own keys by the owning store.
 */
export class ObjectSnapshot {
  private hydrated = false
  private saveTimeout: ReturnType<typeof setTimeout> | null = null
  private savePromise: Promise<void> | null = null

  constructor(
    private s3: S3Client,
    private bucket: string,
    private key: string,
    private getState: () => unknown,
  ) {}

  /** Load and parse the snapshot, or return null when it does not exist yet. */
  async load(): Promise<unknown | null> {
    try {
      const buf = await this.s3.getObjectBuffer(this.bucket, this.key)
      const state = JSON.parse(buf.toString('utf-8'))
      this.hydrated = true
      return state
    }
    catch (err) {
      if (!isS3ObjectNotFound(err)) throw err
      this.hydrated = true
      return null
    }
  }

  /** Persist after a mutation, debounced. */
  scheduleSave(): void {
    if (this.saveTimeout)
      clearTimeout(this.saveTimeout)
    this.saveTimeout = setTimeout(() => {
      this.saveTimeout = null
      this.save().catch(err => console.error(`ObjectSnapshot save failed (${this.key}):`, (err as Error).message))
    }, 1000)
  }

  private async save(): Promise<void> {
    if (!this.hydrated)
      throw new Error(`Snapshot not hydrated: ${this.key}`)
    // Serialize saves so a slow upload can't be overtaken by a newer one.
    while (this.savePromise) await this.savePromise
    this.savePromise = this.s3.putObject({
      bucket: this.bucket,
      key: this.key,
      body: JSON.stringify(this.getState()),
      contentType: 'application/json',
    }).then(() => {})
    try {
      await this.savePromise
    }
    finally {
      this.savePromise = null
    }
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
