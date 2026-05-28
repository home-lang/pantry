import { describe, expect, test } from 'bun:test'
import { ObjectPhpStorage } from './php'
import { ObjectZigStorage } from './zig'

/** Minimal in-memory S3-compatible client for testing the snapshot backends. */
class MockS3 {
  store = new Map<string, Buffer>()

  async putObject(opts: { bucket: string, key: string, body: Buffer | string }): Promise<void> {
    const body = Buffer.isBuffer(opts.body) ? opts.body : Buffer.from(opts.body)
    this.store.set(`${opts.bucket}/${opts.key}`, body)
  }

  async getObjectBuffer(bucket: string, key: string): Promise<Buffer> {
    const v = this.store.get(`${bucket}/${key}`)
    if (!v)
      throw new Error('404 Not Found')
    return v
  }

  async deleteObject(bucket: string, key: string): Promise<void> {
    this.store.delete(`${bucket}/${key}`)
  }
}

describe('ObjectPhpStorage (Hetzner snapshot backend)', () => {
  test('publish persists metadata + tarball and survives a fresh instance', async () => {
    const s3 = new MockS3()
    const store = new ObjectPhpStorage({ s3: s3 as any, bucket: 'pantry-registry', baseUrl: 'https://registry.pantry.dev' })
    await store.ready()

    const tarball = new TextEncoder().encode('php-tarball').buffer
    await store.publish({ name: 'vendor/pkg', version: '1.2.3', tarballUrl: '', checksum: 'deadbeef', publishedAt: new Date().toISOString() }, tarball)
    await store.flush()

    // A separate instance must reload the snapshot from the same bucket.
    const reopened = new ObjectPhpStorage({ s3: s3 as any, bucket: 'pantry-registry', baseUrl: 'https://registry.pantry.dev' })
    await reopened.ready()

    const meta = await reopened.getPackage('vendor/pkg')
    expect(meta?.version).toBe('1.2.3')
    expect(meta?.tarballUrl).toBe('https://registry.pantry.dev/php/packages/vendor/pkg/1.2.3/tarball')
    expect(await reopened.listVersions('vendor/pkg')).toEqual(['1.2.3'])
    expect(await reopened.exists('vendor/pkg', '1.2.3')).toBe(true)
    const dl = await reopened.downloadTarball('vendor/pkg', '1.2.3')
    expect(dl && Buffer.from(dl).toString()).toBe('php-tarball')
  })

  test('deletePackage removes metadata and tarball', async () => {
    const s3 = new MockS3()
    const store = new ObjectPhpStorage({ s3: s3 as any, bucket: 'b', baseUrl: 'https://r' })
    await store.ready()
    await store.publish({ name: 'a/b', version: '1.0.0', tarballUrl: '', checksum: 'x', publishedAt: new Date().toISOString() }, new ArrayBuffer(4))
    await store.deletePackage('a/b')
    await store.flush()
    expect(await store.getPackage('a/b')).toBeNull()
    expect(await store.downloadTarball('a/b', '1.0.0')).toBeNull()
  })
})

describe('ObjectZigStorage (Hetzner snapshot backend)', () => {
  test('publish persists metadata, tarball and hash index across instances', async () => {
    const s3 = new MockS3()
    const store = new ObjectZigStorage({ s3: s3 as any, bucket: 'pantry-registry', baseUrl: 'https://registry.pantry.dev' })
    await store.ready()

    const tarball = new TextEncoder().encode('zig-tarball').buffer
    await store.publish({ name: 'mylib', version: '0.4.0', tarballUrl: '', hash: '1220abcd', publishedAt: new Date().toISOString() }, tarball)
    await store.flush()

    const reopened = new ObjectZigStorage({ s3: s3 as any, bucket: 'pantry-registry', baseUrl: 'https://registry.pantry.dev' })
    await reopened.ready()

    expect((await reopened.getPackage('mylib'))?.version).toBe('0.4.0')
    expect(await reopened.listVersions('mylib')).toEqual(['0.4.0'])
    const byHash = await reopened.getByHash('1220abcd')
    expect(byHash?.name).toBe('mylib')
    expect(byHash?.version).toBe('0.4.0')
    const dl = await reopened.downloadTarball('mylib', '0.4.0')
    expect(dl && Buffer.from(dl).toString()).toBe('zig-tarball')
  })
})
