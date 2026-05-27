/**
 * ObjectMetadataStorage round-trip tests.
 *
 * The B2-backed metadata store keeps the full model in memory and persists it as
 * a single JSON object. These tests pin that a fresh instance reloads everything
 * a previous instance wrote (packages AND commit publishes — the bits DynamoDB
 * used to hold), and that a missing snapshot starts empty rather than throwing.
 */

import type { CommitPublish, PackageMetadata } from './types'
import { describe, expect, it } from 'bun:test'
import { ObjectMetadataStorage } from './storage/object-metadata'

/** Minimal in-memory stand-in for the S3 client surface ObjectMetadataStorage uses. */
function mockBucket() {
  const store = new Map<string, Buffer>()
  const client = {
    async getObjectBuffer(_bucket: string, key: string): Promise<Buffer> {
      const v = store.get(key)
      if (!v)
        throw new Error('S3 GET failed: 404 Not Found')
      return v
    },
    async putObject(o: { bucket: string, key: string, body: Buffer | string }): Promise<void> {
      store.set(o.key, Buffer.isBuffer(o.body) ? o.body : Buffer.from(o.body))
    },
  }
  return { store, client }
}

describe('ObjectMetadataStorage', () => {
  it('persists packages + commit publishes and reloads them in a fresh instance', async () => {
    const { client, store } = mockBucket()
    const a = new ObjectMetadataStorage(client as any, 'bkt', 'metadata/idx.json')
    await a.ready()

    await a.putVersion('left-pad', '1.0.0', {
      name: 'left-pad',
      version: '1.0.0',
      tarballUrl: 'u',
      checksum: 'c',
      publishedAt: 't',
    } as PackageMetadata)
    await a.putCommitPublish({
      name: 'left-pad',
      sha: 'abc1234',
      tarballUrl: 'u2',
      checksum: 'c2',
      publishedAt: 't2',
    } as CommitPublish)
    await a.flush()

    expect(store.has('metadata/idx.json')).toBe(true)

    // Fresh instance backed by the same bucket must see both records.
    const b = new ObjectMetadataStorage(client as any, 'bkt', 'metadata/idx.json')
    await b.ready()
    expect((await b.getPackageVersion('left-pad', '1.0.0'))?.version).toBe('1.0.0')
    expect((await b.getCommitPublish('abc1234', 'left-pad'))?.tarballUrl).toBe('u2')
  })

  it('starts empty when the snapshot object is missing (first run)', async () => {
    const { client } = mockBucket()
    const store = new ObjectMetadataStorage(client as any, 'bkt', 'metadata/idx.json')
    await store.ready()
    expect(await store.getPackage('nope')).toBeNull()
  })
})
