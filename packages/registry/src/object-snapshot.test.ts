import type { S3Client } from './storage/aws-client'
import { describe, expect, it } from 'bun:test'
import { S3RequestError } from './storage/aws-client'
import { ObjectSnapshot } from './storage/object-snapshot'
import { ObjectMetadataStorage } from './storage/object-metadata'
import { ObjectAnalytics } from './storage/object-analytics'

function bucket(body: string, failure?: Error) {
  let reads = 0
  let writes = 0
  const client = {
    async getObjectBuffer() {
      reads++
      if (failure) throw failure
      return Buffer.from(body)
    },
    async putObject() { writes++ },
  } as unknown as S3Client
  return { client, reads: () => reads, writes: () => writes }
}

describe('snapshot hydration safety', () => {
  for (const failure of [
    new S3RequestError('GET', 503, 'ServiceUnavailable'),
    new S3RequestError('GET', 403, 'AccessDenied'),
    new S3RequestError('GET', 404, 'NoSuchBucket'),
    new Error('transport unavailable'),
    new Error('adapter failed: 404 Not Found'),
  ]) {
    it(`rejects ${failure.message} without overwriting remote state`, async () => {
      const remote = bucket('{"existing":true}', failure)
      const snapshot = new ObjectSnapshot(remote.client, 'b', 'snapshot.json', () => ({}))
      await expect(snapshot.load()).rejects.toBe(failure)
      await expect(snapshot.flush()).rejects.toThrow()
      expect(remote.writes()).toBe(0)
    })
  }

  it('cannot flush before the initial read completes', async () => {
    const remote = bucket('{}')
    const snapshot = new ObjectSnapshot(remote.client, 'b', 'snapshot.json', () => ({}))
    await expect(snapshot.flush()).rejects.toThrow()
    expect(remote.reads()).toBe(0)
    expect(remote.writes()).toBe(0)
    await snapshot.load()
    await snapshot.flush()
    expect(remote.writes()).toBe(1)
  })

  it('permits a first save only after confirmed object absence', async () => {
    const remote = bucket('', new S3RequestError('GET', 404, 'NoSuchKey'))
    const snapshot = new ObjectSnapshot(remote.client, 'b', 'snapshot.json', () => ({}))
    expect(await snapshot.load()).toBeNull()
    await snapshot.flush()
    expect(remote.writes()).toBe(1)
  })

  it('rejects corrupt snapshots without replacing them', async () => {
    for (const body of ['', '{broken']) {
      const remote = bucket(body)
      const snapshot = new ObjectSnapshot(remote.client, 'b', 'snapshot.json', () => ({}))
      await expect(snapshot.load()).rejects.toThrow()
      await expect(snapshot.flush()).rejects.toThrow()
      expect(remote.writes()).toBe(0)
    }
  })

  it('metadata readiness rejects an outage and flush cannot overwrite the index', async () => {
    const remote = bucket('{}', new S3RequestError('GET', 503, 'ServiceUnavailable'))
    const storage = new ObjectMetadataStorage(remote.client, 'b')
    await expect(storage.ready()).rejects.toThrow('503')
    await expect(storage.flush()).rejects.toThrow()
    expect(remote.writes()).toBe(0)
  })

  it('analytics readiness rejects an outage and flush cannot overwrite counters', async () => {
    const remote = bucket('{}', new S3RequestError('GET', 503, 'ServiceUnavailable'))
    const storage = new ObjectAnalytics(remote.client, 'b')
    await expect(storage.ready()).rejects.toThrow('503')
    await expect(storage.flush()).rejects.toThrow()
    expect(remote.writes()).toBe(0)
  })
})
