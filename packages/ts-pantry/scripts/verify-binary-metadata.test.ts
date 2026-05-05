import { describe, expect, it } from 'bun:test'
import { createHash } from 'node:crypto'
import { rebuildMetadataFromObjects, verifyBinaryMetadata } from './verify-binary-metadata.ts'

class FakeS3 {
  objects = new Map<string, { body: string, size: number, lastModified: string }>()
  deleted: string[] = []

  put(key: string, body: string, size = body.length): void {
    this.objects.set(key, { body, size, lastModified: '2026-05-04T00:00:00.000Z' })
  }

  async listObjects({ prefix = '' }: { bucket: string, prefix?: string }) {
    return {
      objects: [...this.objects.entries()]
        .filter(([key]) => key.startsWith(prefix))
        .map(([Key, value]) => ({ Key, Size: value.size, LastModified: value.lastModified })),
    }
  }

  async getObject(_bucket: string, key: string): Promise<string> {
    const object = this.objects.get(key)
    if (!object) throw new Error(`missing ${key}`)
    return object.body
  }

  async getObjectBytes(_bucket: string, key: string): Promise<Uint8Array> {
    const object = this.objects.get(key)
    if (!object) throw new Error(`missing ${key}`)
    return new TextEncoder().encode(object.body)
  }

  async putObject(options: { key: string, body: string }): Promise<void> {
    this.put(options.key, options.body)
  }

  async headObject(_bucket: string, key: string): Promise<boolean> {
    return this.objects.has(key)
  }

  async deleteObject(_bucket: string, key: string): Promise<void> {
    this.deleted.push(key)
    this.objects.delete(key)
  }
}

describe('verify-binary-metadata', () => {
  it('rebuilds metadata from matching tarballs and ignores stale mismatched artifacts', async () => {
    const s3 = new FakeS3()
    s3.put('binaries/cmake.org/3.24.2/linux-x86-64/cmake.org-3.24.2.tar.gz', 'tarball', 123)
    s3.put('binaries/cmake.org/3.24.2/linux-x86-64/cmake.org-3.24.2.tar.gz.sha256', `${'a'.repeat(64)}  cmake.org-3.24.2.tar.gz\n`)
    s3.put('binaries/cmake.org/3.24.2/linux-x86-64/cmake.org-3.28.4.tar.gz', 'stale', 999)
    s3.put('binaries/cmake.org/3.24.2/linux-x86-64/cmake.org-3.28.4.tar.gz.sha256', `${'b'.repeat(64)}  cmake.org-3.28.4.tar.gz\n`)

    const objects = (await s3.listObjects({ bucket: 'bucket', prefix: 'binaries/cmake.org/' })).objects
    const { metadata, strays, errors } = await rebuildMetadataFromObjects(s3, 'bucket', 'cmake.org', objects)

    expect(errors).toEqual([])
    expect(strays).toEqual([
      'binaries/cmake.org/3.24.2/linux-x86-64/cmake.org-3.28.4.tar.gz',
      'binaries/cmake.org/3.24.2/linux-x86-64/cmake.org-3.28.4.tar.gz.sha256',
    ])
    expect(metadata.versions['3.24.2'].platforms['linux-x86-64']).toMatchObject({
      tarball: 'binaries/cmake.org/3.24.2/linux-x86-64/cmake.org-3.24.2.tar.gz',
      sha256: 'a'.repeat(64),
      size: 123,
    })
  })

  it('repairs metadata and deletes stale objects when requested', async () => {
    const s3 = new FakeS3()
    s3.put('binaries/cmake.org/3.24.2/darwin-arm64/cmake.org-3.24.2.tar.gz', 'tarball', 321)
    s3.put('binaries/cmake.org/3.24.2/darwin-arm64/cmake.org-3.24.2.tar.gz.sha256', `${'c'.repeat(64)}  cmake.org-3.24.2.tar.gz\n`)
    s3.put('binaries/cmake.org/3.24.2/darwin-arm64/cmake.org-3.28.4.tar.gz', 'stale', 999)
    s3.put('binaries/cmake.org/3.24.2/darwin-arm64/cmake.org-3.28.4.tar.gz.sha256', `${'d'.repeat(64)}  cmake.org-3.28.4.tar.gz\n`)
    s3.put('binaries/cmake.org/metadata.json', JSON.stringify({
      name: 'cmake.org',
      latestVersion: '3.28.4',
      versions: {
        '3.24.2': {
          platforms: {
            'darwin-arm64': {
              tarball: 'binaries/cmake.org/3.24.2/darwin-arm64/cmake.org-3.28.4.tar.gz',
              sha256: 'd'.repeat(64),
              size: 999,
              uploadedAt: '2026-05-04T00:00:00.000Z',
            },
          },
        },
      },
      updatedAt: '2026-05-04T00:00:00.000Z',
    }))

    const result = await verifyBinaryMetadata(s3, 'bucket', 'cmake.org', {
      repair: true,
      deleteStrays: true,
    })

    expect(result.ok).toBe(true)
    expect(result.repaired).toBe(true)
    expect(result.deletedStrays).toHaveLength(2)

    const repaired = JSON.parse(await s3.getObject('bucket', 'binaries/cmake.org/metadata.json'))
    expect(repaired.latestVersion).toBe('3.24.2')
    expect(repaired.versions['3.24.2'].platforms['darwin-arm64'].tarball)
      .toBe('binaries/cmake.org/3.24.2/darwin-arm64/cmake.org-3.24.2.tar.gz')
  })

  it('repairs missing sha256 objects from tarball bytes', async () => {
    const s3 = new FakeS3()
    s3.put('binaries/meilisearch.com/1.34.3/darwin-arm64/meilisearch.com-1.34.3.tar.gz', 'tarball-bytes', 13)

    const result = await verifyBinaryMetadata(s3, 'bucket', 'meilisearch.com', {
      repair: true,
    })

    const expectedSha = createHash('sha256').update(new TextEncoder().encode('tarball-bytes')).digest('hex')
    expect(result.ok).toBe(true)
    expect(result.repairedSha256).toEqual([
      'binaries/meilisearch.com/1.34.3/darwin-arm64/meilisearch.com-1.34.3.tar.gz.sha256',
    ])
    expect(await s3.getObject('bucket', result.repairedSha256[0])).toContain(expectedSha)

    const repaired = JSON.parse(await s3.getObject('bucket', 'binaries/meilisearch.com/metadata.json'))
    expect(repaired.versions['1.34.3'].platforms['darwin-arm64'].sha256).toBe(expectedSha)
  })

  it('refuses to replace metadata with an empty object listing for active binary domains', async () => {
    const s3 = new FakeS3()
    s3.put('binaries/cmake.org/3.24.2/darwin-arm64/cmake.org-3.24.2.tar.gz', 'tarball', 123)
    s3.put('binaries/cmake.org/3.24.2/darwin-arm64/cmake.org-3.24.2.tar.gz.sha256', `${'e'.repeat(64)}  cmake.org-3.24.2.tar.gz\n`)
    s3.put('binaries/cmake.org/metadata.json', JSON.stringify({
      name: 'cmake.org',
      latestVersion: '3.24.2',
      versions: {
        '3.24.2': {
          platforms: {
            'darwin-arm64': {
              tarball: 'binaries/cmake.org/3.24.2/darwin-arm64/cmake.org-3.24.2.tar.gz',
              sha256: 'e'.repeat(64),
              size: 123,
              uploadedAt: '2026-05-04T00:00:00.000Z',
            },
          },
        },
      },
      updatedAt: '2026-05-04T00:00:00.000Z',
    }))
    s3.listObjects = async () => ({ objects: [{ Key: 'binaries/cmake.org/metadata.json', Size: 1, LastModified: '2026-05-04T00:00:00.000Z' }] })

    const result = await verifyBinaryMetadata(s3, 'bucket', 'cmake.org', {
      repair: true,
    })

    expect(result.ok).toBe(true)
    expect(result.warnings).toContain('S3 object listing returned no tarballs; verified existing metadata without rebuilding')

    const metadata = JSON.parse(await s3.getObject('bucket', 'binaries/cmake.org/metadata.json'))
    expect(metadata.latestVersion).toBe('3.24.2')
  })
})
