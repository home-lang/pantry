/**
 * ObjectAnalytics round-trip tests.
 *
 * Production analytics was previously in-memory (lost on every restart). The
 * object-backed store persists the aggregate model to a bucket object so download
 * tracking survives restarts and runs off AWS. These tests pin that a fresh
 * instance reloads what a previous instance tracked, and that a missing snapshot
 * starts empty.
 */

import { describe, expect, it } from 'bun:test'
import { ObjectAnalytics } from './storage/object-analytics'

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

describe('ObjectAnalytics', () => {
  it('persists download + event + missing-version tracking and reloads it', async () => {
    const { client, store } = mockBucket()
    const a = new ObjectAnalytics(client as any, 'bkt', 'analytics/idx.json')
    await a.ready()

    const ts = new Date().toISOString()
    await a.trackDownload({ packageName: 'left-pad', version: '1.0.0', timestamp: ts } as any)
    await a.trackDownload({ packageName: 'left-pad', version: '1.0.0', timestamp: ts } as any)
    await a.trackEvent({ packageName: 'left-pad', category: 'install', timestamp: ts } as any)
    await a.trackMissingVersion('left-pad', '9.9.9', 'curl', false)
    await a.flush()

    expect(store.has('analytics/idx.json')).toBe(true)

    // Fresh instance backed by the same bucket must see the tracked totals.
    const b = new ObjectAnalytics(client as any, 'bkt', 'analytics/idx.json')
    await b.ready()
    const stats = await b.getPackageStats('left-pad')
    expect(stats?.totalDownloads).toBe(2)
    const top = await b.getTopPackages(5)
    expect(top[0]).toEqual({ name: 'left-pad', downloads: 2 })
    const missing = await b.getAllMissingVersionRequests(10)
    expect(missing.find(m => m.version === '9.9.9')?.requestCount).toBe(1)
  })

  it('starts empty when the snapshot object is missing (first run)', async () => {
    const { client } = mockBucket()
    const a = new ObjectAnalytics(client as any, 'bkt', 'analytics/idx.json')
    await a.ready()
    expect(await a.getPackageStats('nope')).toBeNull()
    expect(await a.getTopPackages(5)).toEqual([])
  })
})
