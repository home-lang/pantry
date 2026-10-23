import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { createHash } from 'node:crypto'
import { InMemoryAnalytics } from './analytics'
import { InMemoryAuthStorage } from './auth'
import {
  BinaryArtifactPublisher,
  BinaryPublishError,
  filterBinaryMetadataForCleanScans,
  publicBinaryMetadata,
  S3BinaryArtifactStore,
  type BinaryArtifactStore,
  type BinaryPublishCompleted,
} from './binary-publishing'
import {
  scanBudgetMs,
  type MalwareScanContext,
  type MalwareScanResult,
  type MalwareScanner,
  type MalwareScannerHealth,
  type ScanUrlSource,
} from './malware-scanning'
import { createLocalRegistry } from './registry'
import { createServer } from './server'
import { getAvailablePort } from './test-utils'
import { InMemoryZigStorage } from './zig'

class MemoryArtifactStore implements BinaryArtifactStore {
  files = new Map<string, Buffer>()
  lastUploadKey = ''

  async getObject(key: string): Promise<Buffer> {
    const value = this.files.get(key)
    if (!value) throw new Error(`not found: ${key}`)
    return Buffer.from(value)
  }

  async getObjectStream(key: string): Promise<AsyncIterable<Uint8Array>> {
    const value = await this.getObject(key)
    return {
      async *[Symbol.asyncIterator]() {
        const midpoint = Math.ceil(value.byteLength / 2)
        yield value.subarray(0, midpoint)
        yield value.subarray(midpoint)
      },
    }
  }

  async putObject(key: string, body: Buffer | string, _contentType: string): Promise<void> {
    this.files.set(key, typeof body === 'string' ? Buffer.from(body) : Buffer.from(body))
  }

  async copyObject(sourceKey: string, destinationKey: string): Promise<void> {
    this.files.set(destinationKey, await this.getObject(sourceKey))
  }

  async deleteObject(key: string): Promise<void> {
    this.files.delete(key)
  }

  async headObject(key: string): Promise<Record<string, string>> {
    const value = await this.getObject(key)
    return {
      'content-length': String(value.byteLength),
      etag: createHash('sha256').update(value).digest('hex'),
    }
  }

  createUploadUrl(key: string): string {
    this.lastUploadKey = key
    return `memory://${encodeURIComponent(key)}`
  }
}

describe('S3BinaryArtifactStore', () => {
  it('creates short-lived signed download sources for isolated scans', () => {
    const s3 = {
      generatePresignedGetUrl: (bucket: string, key: string, expires: number) =>
        `https://objects.example.test/${bucket}/${key}?expires=${expires}`,
    }
    const store = new S3BinaryArtifactStore(s3 as never, 'test-bucket')

    expect(store.createDownloadUrl('artifact.tar.gz', 600))
      .toBe('https://objects.example.test/test-bucket/artifact.tar.gz?expires=600')
  })

  it('uses only read() from variant response-body readers', async () => {
    const chunks = [new Uint8Array([1, 2]), new Uint8Array([3])]
    let index = 0
    const body = {
      // Some Bun response bodies expose a non-conforming async iterator. The
      // stable Web Streams reader contract must remain the source of chunks.
      [Symbol.asyncIterator]: () => ({}),
      getReader: () => ({
        read: async () => index < chunks.length
          ? { done: false as const, value: chunks[index++] }
          : { done: true as const, value: undefined },
      }),
    } as ReadableStream<Uint8Array>
    const s3 = {
      getObjectStream: async () => ({ body }),
    }
    const store = new S3BinaryArtifactStore(s3 as never, 'test-bucket')
    const streamed: Uint8Array[] = []

    for await (const chunk of await store.getObjectStream('artifact.tar.gz')) {
      streamed.push(chunk)
    }

    expect(Buffer.concat(streamed)).toEqual(Buffer.from([1, 2, 3]))
  })
})

class TestScanner implements MalwareScanner {
  readonly enabled = true
  readonly required = true
  contexts: MalwareScanContext[] = []

  constructor(private verdict: MalwareScanResult['verdict'] = 'clean') {}

  async scan(data: ArrayBuffer, context: MalwareScanContext): Promise<MalwareScanResult> {
    this.contexts.push(context)
    return {
      verdict: this.verdict,
      engine: 'test-scanner',
      scannedAt: new Date().toISOString(),
      durationMs: 1,
      artifactSha256: createHash('sha256').update(Buffer.from(data)).digest('hex'),
      ...(this.verdict === 'blocked' ? { signature: 'Test.EICAR' } : {}),
      ...(this.verdict === 'error' ? { reason: 'scanner offline' } : {}),
    }
  }

  async scanStream(
    data: AsyncIterable<Uint8Array>,
    context: MalwareScanContext,
    expected: { sha256: string, size: number },
  ): Promise<MalwareScanResult> {
    const chunks: Buffer[] = []
    for await (const chunk of data) chunks.push(Buffer.from(chunk))
    const bytes = Buffer.concat(chunks)
    if (bytes.byteLength !== expected.size)
      throw new Error('test stream size mismatch')
    return this.scan(Uint8Array.from(bytes).buffer, context)
  }

  async health(): Promise<MalwareScannerHealth> {
    return { enabled: true, required: true, ready: true, engine: 'test-scanner' }
  }
}

class ConcurrentTestScanner extends TestScanner {
  active = 0
  maxActive = 0

  override async scan(data: ArrayBuffer, context: MalwareScanContext): Promise<MalwareScanResult> {
    this.active++
    this.maxActive = Math.max(this.maxActive, this.active)
    try {
      await Bun.sleep(25)
      return await super.scan(data, context)
    }
    finally {
      this.active--
    }
  }
}

class ControlledTestScanner extends TestScanner {
  private markStarted!: () => void
  private continueScan!: () => void
  readonly started = new Promise<void>(resolve => this.markStarted = resolve)
  private readonly released = new Promise<void>(resolve => this.continueScan = resolve)

  release(): void {
    this.continueScan()
  }

  override async scan(data: ArrayBuffer, context: MalwareScanContext): Promise<MalwareScanResult> {
    this.markStarted()
    await this.released
    return super.scan(data, context)
  }
}

class UrlArtifactStore extends MemoryArtifactStore {
  urls: string[] = []

  createDownloadUrl(key: string, expiresInSeconds: number): string {
    const url = `https://objects.example.test/${encodeURIComponent(key)}?expires=${expiresInSeconds}`
    this.urls.push(url)
    return url
  }
}

class UrlTestScanner extends TestScanner {
  urls: string[] = []

  override async scanStream(): Promise<MalwareScanResult> {
    throw new Error('stream scan must not run when isolated URL scanning is available')
  }

  /** URLs the store had already minted at the moment `scanUrl` was entered. */
  mintedBeforeScan: number[] = []
  mintedBefore: (() => number) | null = null

  async scanUrl(
    url: ScanUrlSource,
    context: MalwareScanContext,
    expected: { sha256: string, size: number },
  ): Promise<MalwareScanResult> {
    // Mirrors the real scanner: the URL is resolved only once the scan is
    // admitted, which here is "once scanUrl has been entered".
    this.mintedBeforeScan.push(this.mintedBefore?.() ?? 0)
    this.urls.push(typeof url === 'function' ? url() : url)
    this.contexts.push(context)
    return {
      verdict: 'clean',
      engine: 'test-scanner',
      scannedAt: new Date().toISOString(),
      durationMs: 1,
      artifactSha256: expected.sha256,
    }
  }
}

function request(bytes: Buffer, platforms = ['darwin-arm64']) {
  return {
    domain: 'example.com/tool',
    version: '1.2.3',
    platforms,
    filename: 'example.com-tool-1.2.3.tar.gz',
    size: bytes.byteLength,
    sha256: createHash('sha256').update(bytes).digest('hex'),
  }
}

async function seedLegacyArtifact(
  store: MemoryArtifactStore,
  bytes: Buffer,
  platforms = ['darwin-arm64'],
): Promise<string> {
  const tarball = 'binaries/example.com/tool/1.2.3/darwin-arm64/example.com-tool-1.2.3.tar.gz'
  const sha256 = createHash('sha256').update(bytes).digest('hex')
  await store.putObject(tarball, bytes, 'application/gzip')
  await store.putObject(`${tarball}.sha256`, `${sha256}  example.com-tool-1.2.3.tar.gz\n`, 'text/plain')
  await store.putObject('binaries/example.com/tool/metadata.json', JSON.stringify({
    name: 'example.com/tool',
    latestVersion: '1.2.3',
    versions: {
      '1.2.3': {
        platforms: Object.fromEntries(platforms.map(platform => [platform, {
          tarball,
          sha256,
          size: bytes.byteLength,
          uploadedAt: '2026-01-01T00:00:00.000Z',
        }])),
      },
    },
    updatedAt: '2026-01-01T00:00:00.000Z',
  }), 'application/json')
  return tarball
}

describe('binary scan-before-promote publisher', () => {
  it('isolates native object scanning behind a short-lived download URL', async () => {
    const store = new UrlArtifactStore()
    const scanner = new UrlTestScanner()
    scanner.mintedBefore = () => store.urls.length
    const publisher = new BinaryArtifactPublisher(store, scanner, {
      tokenSecret: 'test-secret-that-is-long-enough',
    })
    const bytes = Buffer.from('isolated retained artifact')
    await seedLegacyArtifact(store, bytes)

    const result = await publisher.rescanExisting({
      domain: 'example.com/tool',
      version: '1.2.3',
      platforms: ['darwin-arm64'],
    }, '_admin')

    expect(result.action).toBe('attested')
    expect(scanner.urls).toEqual(store.urls)
    expect(scanner.urls).toHaveLength(1)
    // Minted lazily. A presigned URL starts expiring when it is created, and
    // the scanner does not download until it has been admitted through its
    // concurrency gate — so minting at call time charges the queue wait
    // against the signature and the download 403s partway through.
    expect(scanner.mintedBeforeScan).toEqual([0])
    // ...and it outlives the budget the scan itself is given.
    const expires = Number(new URL(scanner.urls[0]).searchParams.get('expires'))
    expect(expires).toBeGreaterThan(scanBudgetMs(bytes.byteLength) / 1000)
    expect(scanner.contexts[0]).toMatchObject({
      surface: 'binary',
      name: 'example.com/tool',
      version: '1.2.3',
    })
  })

  it('promotes clean bytes, writes attestations, and indexes metadata last', async () => {
    const store = new MemoryArtifactStore()
    const scanner = new TestScanner()
    const publisher = new BinaryArtifactPublisher(store, scanner, {
      tokenSecret: 'test-secret-that-is-long-enough',
    })
    const bytes = Buffer.from('clean artifact')
    const initiated = publisher.initiate(request(bytes, ['darwin-arm64', 'linux-x86-64']))
    await store.putObject(store.lastUploadKey, bytes, 'application/gzip')

    const result = await publisher.complete(initiated.uploadId, '_admin')

    expect(result.scan.verdict).toBe('clean')
    expect(Object.keys(result.platforms)).toEqual(['darwin-arm64', 'linux-x86-64'])
    for (const record of Object.values(result.platforms)) {
      expect(store.files.get(record.tarball)?.toString()).toBe('clean artifact')
      expect(JSON.parse(store.files.get(`${record.tarball}.scan.json`)!.toString()).scan.verdict).toBe('clean')
    }
    const metadata = JSON.parse(store.files.get('binaries/example.com/tool/metadata.json')!.toString())
    expect(metadata.versions['1.2.3'].platforms['darwin-arm64'].malwareScan.verdict).toBe('clean')
    expect(store.files.has(store.lastUploadKey)).toBe(false)
    expect(scanner.contexts[0]).toEqual({
      surface: 'binary',
      name: 'example.com/tool',
      version: '1.2.3',
      publisher: '_admin',
    })
  })

  it('never creates installable keys for blocked bytes', async () => {
    const store = new MemoryArtifactStore()
    const publisher = new BinaryArtifactPublisher(store, new TestScanner('blocked'), {
      tokenSecret: 'test-secret-that-is-long-enough',
    })
    const bytes = Buffer.from('EICAR')
    const initiated = publisher.initiate(request(bytes))
    await store.putObject(store.lastUploadKey, bytes, 'application/gzip')

    await expect(publisher.complete(initiated.uploadId)).rejects.toMatchObject({
      code: 'MALWARE_DETECTED',
      status: 422,
    })
    expect([...store.files.keys()].filter(key => key.startsWith('binaries/'))).toEqual([])
    expect(store.files.has(store.lastUploadKey)).toBe(false)
  })

  it('durably quarantines a blocked pkgx fallback without creating installable keys', async () => {
    const store = new MemoryArtifactStore()
    const publisher = new BinaryArtifactPublisher(store, new TestScanner('blocked'), {
      tokenSecret: 'test-secret-that-is-long-enough',
    })
    const bytes = Buffer.from('blocked pkgx fallback')
    const initiated = publisher.initiate(request(bytes))
    await store.putObject(store.lastUploadKey, bytes, 'application/gzip')

    await expect(
      publisher.complete(initiated.uploadId, '_pkgx', 'pkgx'),
    ).rejects.toMatchObject({ code: 'MALWARE_DETECTED' })

    const metadata = JSON.parse(
      store.files.get('binaries/example.com/tool/metadata.json')!.toString(),
    )
    expect(metadata.versions).toEqual({})
    expect(metadata.malwareQuarantines).toEqual([expect.objectContaining({
      version: '1.2.3',
      platforms: ['darwin-arm64'],
      artifactSha256: createHash('sha256').update(bytes).digest('hex'),
      signature: 'Test.EICAR',
    })])
    expect([...store.files.keys()].some(
      key => key.startsWith('binaries/example.com/tool/1.2.3/'),
    )).toBe(false)
    expect([...store.files.keys()].filter(
      key => key.startsWith('.pantry-quarantine/malware/'),
    )).toHaveLength(2)
  })

  it('fails closed and cleans staging when the scanner is unavailable', async () => {
    const store = new MemoryArtifactStore()
    const publisher = new BinaryArtifactPublisher(store, new TestScanner('error'), {
      tokenSecret: 'test-secret-that-is-long-enough',
    })
    const bytes = Buffer.from('unknown')
    const initiated = publisher.initiate(request(bytes))
    await store.putObject(store.lastUploadKey, bytes, 'application/gzip')
    await expect(publisher.complete(initiated.uploadId)).rejects.toMatchObject({
      code: 'MALWARE_SCAN_UNAVAILABLE',
      status: 503,
    })
    expect(store.files.size).toBe(0)
  })

  it('rejects size, digest, token tampering, and expired uploads', async () => {
    const store = new MemoryArtifactStore()
    let now = Date.now()
    const publisher = new BinaryArtifactPublisher(store, new TestScanner(), {
      tokenSecret: 'test-secret-that-is-long-enough',
      stagingTtlSeconds: 1,
      now: () => now,
    })
    const bytes = Buffer.from('artifact')
    const initiated = publisher.initiate(request(bytes))
    await store.putObject(store.lastUploadKey, Buffer.from('different'), 'application/gzip')
    await expect(publisher.complete(initiated.uploadId)).rejects.toMatchObject({ code: 'BINARY_SIZE_MISMATCH' })

    const digestMismatch = publisher.initiate(request(bytes))
    await store.putObject(store.lastUploadKey, Buffer.from('artifacx'), 'application/gzip')
    await expect(publisher.complete(digestMismatch.uploadId)).rejects.toMatchObject({ code: 'BINARY_SHA256_MISMATCH' })
    await expect(publisher.complete(`${initiated.uploadId}x`)).rejects.toBeInstanceOf(BinaryPublishError)

    const expiring = publisher.initiate(request(bytes))
    now += 2_000
    await expect(publisher.complete(expiring.uploadId)).rejects.toMatchObject({ code: 'BINARY_UPLOAD_EXPIRED' })
  })

  it('is idempotent after successful promotion', async () => {
    const store = new MemoryArtifactStore()
    const publisher = new BinaryArtifactPublisher(store, new TestScanner(), {
      tokenSecret: 'test-secret-that-is-long-enough',
    })
    const bytes = Buffer.from('artifact')
    const initiated = publisher.initiate(request(bytes))
    await store.putObject(store.lastUploadKey, bytes, 'application/gzip')
    const first = await publisher.complete(initiated.uploadId)
    const second = await publisher.complete(initiated.uploadId)
    expect(second.scan.artifactSha256).toBe(first.scan.artifactSha256)
  })

  it('attests retained artifacts in place and skips a verified clean retry', async () => {
    const store = new MemoryArtifactStore()
    const scanner = new TestScanner()
    const publisher = new BinaryArtifactPublisher(store, scanner, {
      tokenSecret: 'test-secret-that-is-long-enough',
    })
    const bytes = Buffer.from('retained clean artifact')
    const tarball = await seedLegacyArtifact(store, bytes, ['darwin-arm64', 'linux-x86-64'])

    const first = await publisher.rescanExisting({
      domain: 'example.com/tool',
      version: '1.2.3',
      platforms: ['darwin-arm64', 'linux-x86-64'],
    }, '_admin')
    const second = await publisher.rescanExisting({
      domain: 'example.com/tool',
      version: '1.2.3',
      platforms: ['darwin-arm64', 'linux-x86-64'],
    }, '_admin')

    expect(first.action).toBe('attested')
    expect(second.action).toBe('already-clean')
    expect(scanner.contexts).toHaveLength(1)
    expect(store.files.get(tarball)?.toString()).toBe(bytes.toString())
    expect(JSON.parse(store.files.get(`${tarball}.scan.json`)!.toString()).scan.verdict).toBe('clean')
    const metadata = JSON.parse(store.files.get('binaries/example.com/tool/metadata.json')!.toString())
    expect(metadata.versions['1.2.3'].platforms['linux-x86-64'].malwareScan.verdict).toBe('clean')
  })

  it('restores metadata from a digest-bound durable attestation without rescanning', async () => {
    const store = new MemoryArtifactStore()
    const scanner = new TestScanner()
    const publisher = new BinaryArtifactPublisher(store, scanner, {
      tokenSecret: 'test-secret-that-is-long-enough',
    })
    const bytes = Buffer.from('previously scanned retained artifact')
    const tarball = await seedLegacyArtifact(store, bytes)
    const sha256 = createHash('sha256').update(bytes).digest('hex')
    await store.putObject(`${tarball}.scan.json`, JSON.stringify({
      scan: {
        verdict: 'clean',
        engine: 'clamav',
        scannedAt: '2026-01-01T00:00:00.000Z',
        durationMs: 42,
        artifactSha256: sha256,
      },
    }), 'application/json')

    const result = await publisher.rescanExisting({
      domain: 'example.com/tool',
      version: '1.2.3',
      platforms: ['darwin-arm64'],
    }, '_admin')

    expect(result.action).toBe('attested')
    expect(result.scan.artifactSha256).toBe(sha256)
    expect(scanner.contexts).toHaveLength(0)
    const metadata = JSON.parse(store.files.get('binaries/example.com/tool/metadata.json')!.toString())
    expect(metadata.versions['1.2.3'].platforms['darwin-arm64'].malwareScan).toMatchObject({
      verdict: 'clean',
      artifactSha256: sha256,
    })
  })

  it('rescans when a durable attestation does not match the retained digest', async () => {
    const store = new MemoryArtifactStore()
    const scanner = new TestScanner()
    const publisher = new BinaryArtifactPublisher(store, scanner, {
      tokenSecret: 'test-secret-that-is-long-enough',
    })
    const tarball = await seedLegacyArtifact(store, Buffer.from('changed retained artifact'))
    await store.putObject(`${tarball}.scan.json`, JSON.stringify({
      scan: {
        verdict: 'clean',
        engine: 'clamav',
        scannedAt: '2026-01-01T00:00:00.000Z',
        durationMs: 42,
        artifactSha256: 'a'.repeat(64),
      },
    }), 'application/json')

    const result = await publisher.rescanExisting({
      domain: 'example.com/tool',
      version: '1.2.3',
      platforms: ['darwin-arm64'],
    }, '_admin')

    expect(result.action).toBe('attested')
    expect(scanner.contexts).toHaveLength(1)
    expect(result.scan.artifactSha256).not.toBe('a'.repeat(64))
  })

  it('scans independent retained artifacts concurrently without racing metadata writes', async () => {
    const store = new MemoryArtifactStore()
    const scanner = new ConcurrentTestScanner()
    const publisher = new BinaryArtifactPublisher(store, scanner, {
      tokenSecret: 'test-secret-that-is-long-enough',
    })
    const artifacts = [
      { version: '1.0.0', bytes: Buffer.from('first retained artifact') },
      { version: '2.0.0', bytes: Buffer.from('second retained artifact') },
    ]
    const versions: Record<string, { platforms: Record<string, object> }> = {}
    for (const artifact of artifacts) {
      const tarball = `binaries/example.com/tool/${artifact.version}/darwin-arm64/example.com-tool-${artifact.version}.tar.gz`
      const sha256 = createHash('sha256').update(artifact.bytes).digest('hex')
      await store.putObject(tarball, artifact.bytes, 'application/gzip')
      await store.putObject(`${tarball}.sha256`, `${sha256}  ${tarball.split('/').at(-1)}\n`, 'text/plain')
      versions[artifact.version] = {
        platforms: {
          'darwin-arm64': {
            tarball,
            sha256,
            size: artifact.bytes.byteLength,
            uploadedAt: '2026-01-01T00:00:00.000Z',
          },
        },
      }
    }
    await store.putObject('binaries/example.com/tool/metadata.json', JSON.stringify({
      name: 'example.com/tool',
      latestVersion: '2.0.0',
      versions,
      updatedAt: '2026-01-01T00:00:00.000Z',
    }), 'application/json')

    await Promise.all(artifacts.map(artifact => publisher.rescanExisting({
      domain: 'example.com/tool',
      version: artifact.version,
      platforms: ['darwin-arm64'],
    }, '_admin')))

    expect(scanner.maxActive).toBe(2)
    const metadata = JSON.parse(store.files.get('binaries/example.com/tool/metadata.json')!.toString())
    expect(metadata.versions['1.0.0'].platforms['darwin-arm64'].malwareScan.verdict).toBe('clean')
    expect(metadata.versions['2.0.0'].platforms['darwin-arm64'].malwareScan.verdict).toBe('clean')
  })

  it('rejects a scan result when the retained object changes during scanning', async () => {
    const store = new MemoryArtifactStore()
    const scanner = new ControlledTestScanner()
    const publisher = new BinaryArtifactPublisher(store, scanner, {
      tokenSecret: 'test-secret-that-is-long-enough',
    })
    const bytes = Buffer.from('retained artifact before replacement')
    const tarball = await seedLegacyArtifact(store, bytes)

    const pending = publisher.rescanExisting({
      domain: 'example.com/tool',
      version: '1.2.3',
      platforms: ['darwin-arm64'],
    }, '_admin')
    await scanner.started
    const metadataKey = 'binaries/example.com/tool/metadata.json'
    const replacement = Buffer.from(bytes)
    replacement[0] ^= 1
    await store.putObject(tarball, replacement, 'application/gzip')
    scanner.release()

    await expect(pending).rejects.toMatchObject({
      status: 409,
      code: 'BINARY_RESCAN_ARTIFACT_CHANGED',
    })
    const stored = JSON.parse(store.files.get(metadataKey)!.toString())
    expect(stored.versions['1.2.3'].platforms['darwin-arm64'].malwareScan).toBeUndefined()
  })

  it('accepts cutoff-gated external ClamAV evidence for the exact retained object', async () => {
    const store = new UrlArtifactStore()
    const scanner = new TestScanner()
    const publisher = new BinaryArtifactPublisher(store, scanner, {
      tokenSecret: 'test-secret-that-is-long-enough',
      legacyScanAttestationCutoff: Date.parse('2026-01-02T00:00:00.000Z'),
    })
    const bytes = Buffer.from('externally scanned legacy artifact')
    const tarball = await seedLegacyArtifact(store, bytes)
    const request = {
      domain: 'example.com/tool',
      version: '1.2.3',
      platforms: ['darwin-arm64'],
    }

    const prepared = await publisher.prepareExternalRescan(request)
    expect(prepared).toMatchObject({
      action: 'prepared',
      tarball,
      sha256: createHash('sha256').update(bytes).digest('hex'),
      size: bytes.byteLength,
    })
    // The URL remains valid if a 30-minute whole-archive scan exhausts a
    // coverage limit and the client must fetch the same object for deep scan.
    expect(prepared.downloadUrl).toContain('expires=3600')
    expect(prepared.objectIdentity).toBeTruthy()
    expect(scanner.contexts).toHaveLength(0)

    const completed = await publisher.attestExternalRescan({
      ...request,
      tarball: prepared.tarball,
      sha256: prepared.sha256,
      size: prepared.size,
      objectIdentity: prepared.objectIdentity,
      scan: {
        verdict: 'clean',
        engine: 'clamav',
        scannedAt: new Date().toISOString(),
        durationMs: 123,
        artifactSha256: prepared.sha256,
        engineVersion: 'ClamAV 1.4.3',
        databaseVersion: '27690',
      },
    }, '_admin-external-scanner')

    expect(completed.action).toBe('attested')
    expect(JSON.parse(store.files.get(`${tarball}.scan.json`)!.toString()).scan).toMatchObject({
      verdict: 'clean',
      engine: 'clamav',
      artifactSha256: prepared.sha256,
    })
  })

  it('accepts long hosted scan evidence only within the bounded job window', async () => {
    const store = new UrlArtifactStore()
    const now = Date.parse('2026-07-30T12:00:00.000Z')
    const publisher = new BinaryArtifactPublisher(store, new TestScanner(), {
      tokenSecret: 'test-secret-that-is-long-enough',
      legacyScanAttestationCutoff: Date.parse('2026-01-02T00:00:00.000Z'),
      now: () => now,
    })
    const bytes = Buffer.from('legacy archive with hundreds of thousands of members')
    await seedLegacyArtifact(store, bytes)
    const selector = {
      domain: 'example.com/tool',
      version: '1.2.3',
      platforms: ['darwin-arm64'],
    }
    const prepared = await publisher.prepareExternalRescan(selector)
    const scan = {
      verdict: 'clean',
      engine: 'clamav',
      artifactSha256: prepared.sha256,
      engineVersion: 'ClamAV 1.5.3',
      databaseVersion: '28077',
    } as const
    const sixHours = 6 * 60 * 60_000

    await expect(publisher.attestExternalRescan({
      ...selector,
      ...prepared,
      scan: {
        ...scan,
        scannedAt: new Date(now - sixHours - 1).toISOString(),
        durationMs: sixHours + 1,
      },
    })).rejects.toMatchObject({ code: 'INVALID_BINARY_RESCAN_ATTESTATION' })

    await expect(publisher.attestExternalRescan({
      ...selector,
      ...prepared,
      scan: {
        ...scan,
        scannedAt: new Date(now - sixHours - 15 * 60_000 - 1).toISOString(),
        durationMs: 1,
      },
    })).rejects.toMatchObject({ code: 'INVALID_BINARY_RESCAN_ATTESTATION' })

    const durationMs = 49 * 60_000 + 18_594
    const completed = await publisher.attestExternalRescan({
      ...selector,
      ...prepared,
      scan: {
        ...scan,
        scannedAt: new Date(now - durationMs).toISOString(),
        durationMs,
      },
    }, '_admin-external-scanner')

    expect(completed).toMatchObject({
      action: 'attested',
      scan: {
        verdict: 'clean',
        durationMs,
        artifactSha256: prepared.sha256,
      },
    })
  })

  it('repairs a stale legacy checksum only after scanning the stable retained object', async () => {
    const store = new UrlArtifactStore()
    const publisher = new BinaryArtifactPublisher(store, new TestScanner(), {
      tokenSecret: 'test-secret-that-is-long-enough',
      legacyScanAttestationCutoff: Date.parse('2026-01-02T00:00:00.000Z'),
    })
    const bytes = Buffer.from('legacy bytes whose recorded checksum drifted')
    const actualSha256 = createHash('sha256').update(bytes).digest('hex')
    const staleSha256 = 'f'.repeat(64)
    const tarball = await seedLegacyArtifact(store, bytes)
    const metadataKey = 'binaries/example.com/tool/metadata.json'
    const metadata = JSON.parse(store.files.get(metadataKey)!.toString())
    metadata.versions['1.2.3'].platforms['darwin-arm64'].sha256 = staleSha256
    await store.putObject(metadataKey, JSON.stringify(metadata), 'application/json')
    await store.putObject(
      `${tarball}.sha256`,
      `${staleSha256}  example.com-tool-1.2.3.tar.gz\n`,
      'text/plain',
    )
    const selector = {
      domain: 'example.com/tool',
      version: '1.2.3',
      platforms: ['darwin-arm64'],
    }

    const prepared = await publisher.prepareExternalRescan(selector)
    expect(prepared.sha256).toBe(staleSha256)
    const completed = await publisher.attestExternalRescan({
      ...selector,
      tarball: prepared.tarball,
      preparedSha256: prepared.sha256,
      sha256: actualSha256,
      size: prepared.size,
      objectIdentity: prepared.objectIdentity,
      scan: {
        verdict: 'clean',
        engine: 'clamav',
        scannedAt: new Date().toISOString(),
        durationMs: 123,
        artifactSha256: actualSha256,
        engineVersion: 'ClamAV 1.4.3',
        databaseVersion: '27690',
      },
    }, '_admin-external-scanner')

    expect(completed).toMatchObject({
      action: 'attested',
      scan: { verdict: 'clean', artifactSha256: actualSha256 },
    })
    const repaired = JSON.parse(store.files.get(metadataKey)!.toString())
    expect(repaired.versions['1.2.3'].platforms['darwin-arm64']).toMatchObject({
      sha256: actualSha256,
      malwareScan: { verdict: 'clean', artifactSha256: actualSha256 },
    })
    expect(store.files.get(`${tarball}.sha256`)!.toString())
      .toBe(`${actualSha256}  example.com-tool-1.2.3.tar.gz\n`)
  })

  it('supports an explicit oversized legacy migration bound without raising the publish limit', async () => {
    const store = new UrlArtifactStore()
    // Above the publish cap (4 GiB) and below the legacy rescan bound (8 GiB),
    // which is the whole point: a migration bound must not become a publish
    // limit. Was 3 GB, which stopped straddling the two when the publish cap
    // rose to accept the artifacts we already serve.
    const legacySize = 5_000_000_000
    store.headObject = async () => ({
      'content-length': String(legacySize),
      etag: 'stable-legacy-object',
    })
    const publisher = new BinaryArtifactPublisher(store, new TestScanner(), {
      tokenSecret: 'test-secret-that-is-long-enough',
      legacyScanAttestationCutoff: Date.parse('2026-01-02T00:00:00.000Z'),
      legacyRescanMaxBytes: 8 * 1024 * 1024 * 1024,
    })
    const bytes = Buffer.from('oversized legacy object represented without allocating it')
    await seedLegacyArtifact(store, bytes)
    const selector = {
      domain: 'example.com/tool',
      version: '1.2.3',
      platforms: ['darwin-arm64'],
    }

    const prepared = await publisher.prepareExternalRescan(selector)
    expect(prepared.size).toBe(legacySize)
    expect(() => publisher.initiate({
      ...request(bytes),
      size: legacySize,
    })).toThrow('Binary artifact size must be between')
  })

  it('rejects external evidence for recent, changed, or malformed artifacts', async () => {
    const store = new UrlArtifactStore()
    const publisher = new BinaryArtifactPublisher(store, new TestScanner(), {
      tokenSecret: 'test-secret-that-is-long-enough',
      legacyScanAttestationCutoff: Date.parse('2026-01-02T00:00:00.000Z'),
    })
    const bytes = Buffer.from('legacy exact bytes')
    const tarball = await seedLegacyArtifact(store, bytes)
    const selector = {
      domain: 'example.com/tool',
      version: '1.2.3',
      platforms: ['darwin-arm64'],
    }
    const prepared = await publisher.prepareExternalRescan(selector)
    const validScan = {
      verdict: 'clean',
      engine: 'clamav',
      scannedAt: new Date().toISOString(),
      durationMs: 12,
      artifactSha256: prepared.sha256,
      engineVersion: 'ClamAV 1.4.3',
      databaseVersion: '27690',
    }

    await expect(publisher.attestExternalRescan({
      ...selector,
      ...prepared,
      scan: { ...validScan, artifactSha256: 'f'.repeat(64) },
    })).rejects.toMatchObject({ code: 'INVALID_BINARY_RESCAN_ATTESTATION' })

    await store.putObject(tarball, Buffer.from('changed exact bytes'), 'application/gzip')
    await expect(publisher.attestExternalRescan({
      ...selector,
      ...prepared,
      scan: validScan,
    })).rejects.toMatchObject({ code: 'BINARY_RESCAN_ARTIFACT_CHANGED' })

    const metadataKey = 'binaries/example.com/tool/metadata.json'
    const metadata = JSON.parse(store.files.get(metadataKey)!.toString())
    metadata.versions['1.2.3'].platforms['darwin-arm64'].uploadedAt = '2026-01-03T00:00:00.000Z'
    await store.putObject(metadataKey, JSON.stringify(metadata), 'application/json')
    await expect(publisher.prepareExternalRescan(selector))
      .rejects.toMatchObject({ code: 'BINARY_EXTERNAL_ATTESTATION_NOT_LEGACY' })
  })

  it('recovers durable clean publish evidence newer than the legacy cutoff', async () => {
    const store = new UrlArtifactStore()
    const publisher = new BinaryArtifactPublisher(store, new TestScanner(), {
      tokenSecret: 'test-secret-that-is-long-enough',
      legacyScanAttestationCutoff: Date.parse('2026-01-02T00:00:00.000Z'),
    })
    const bytes = Buffer.from('current publish with reconstructed metadata')
    const tarball = await seedLegacyArtifact(store, bytes)
    const sha256 = createHash('sha256').update(bytes).digest('hex')
    const metadataKey = 'binaries/example.com/tool/metadata.json'
    const metadata = JSON.parse(store.files.get(metadataKey)!.toString())
    const record = metadata.versions['1.2.3'].platforms['darwin-arm64']
    record.uploadedAt = '2026-01-03T00:00:00.000Z'
    delete record.malwareScan
    await store.putObject(metadataKey, JSON.stringify(metadata), 'application/json')
    await store.putObject(`${tarball}.scan.json`, JSON.stringify({
      domain: 'example.com/tool',
      version: '1.2.3',
      platform: 'darwin-arm64',
      filename: 'example.com-tool-1.2.3.tar.gz',
      scan: {
        verdict: 'clean',
        engine: 'clamav',
        scannedAt: '2026-01-03T00:00:00.000Z',
        durationMs: 123,
        artifactSha256: sha256,
      },
    }), 'application/json')

    const result = await publisher.prepareExternalRescan({
      domain: 'example.com/tool',
      version: '1.2.3',
      platforms: ['darwin-arm64'],
    })

    expect(result).toMatchObject({
      action: 'already-clean',
      sha256,
      scan: { verdict: 'clean', artifactSha256: sha256 },
    })
    const repaired = JSON.parse(store.files.get(metadataKey)!.toString())
    expect(repaired.versions['1.2.3'].platforms['darwin-arm64'].malwareScan)
      .toMatchObject({ verdict: 'clean', artifactSha256: sha256 })
  })

  it('quarantines blocked retained artifacts and removes every installable reference', async () => {
    const store = new MemoryArtifactStore()
    const publisher = new BinaryArtifactPublisher(store, new TestScanner('blocked'), {
      tokenSecret: 'test-secret-that-is-long-enough',
    })
    const bytes = Buffer.from('retained EICAR')
    const tarball = await seedLegacyArtifact(store, bytes, ['darwin-arm64', 'linux-x86-64'])

    const result = await publisher.rescanExisting({
      domain: 'example.com/tool',
      version: '1.2.3',
      platforms: ['darwin-arm64'],
    }, '_admin')

    expect(result.action).toBe('quarantined')
    expect(result.scan.verdict).toBe('blocked')
    expect(store.files.has(tarball)).toBe(false)
    expect(store.files.has(`${tarball}.sha256`)).toBe(false)
    const metadata = JSON.parse(store.files.get('binaries/example.com/tool/metadata.json')!.toString())
    expect(metadata.versions).toEqual({})
    expect(metadata.malwareQuarantines).toEqual([expect.objectContaining({
      version: '1.2.3',
      platforms: ['darwin-arm64', 'linux-x86-64'],
      artifactSha256: createHash('sha256').update(bytes).digest('hex'),
      signature: 'Test.EICAR',
    })])
    const quarantineKeys = [...store.files.keys()].filter(key => key.startsWith('.pantry-quarantine/malware/'))
    expect(quarantineKeys.some(key => !key.endsWith('.scan.json'))).toBe(true)
    expect(quarantineKeys.some(key => key.endsWith('.scan.json'))).toBe(true)
  })

  it('keeps a blocked quarantine review private and records fresh evidence', async () => {
    const store = new UrlArtifactStore()
    const bytes = Buffer.from('reviewed blocked artifact')
    await seedLegacyArtifact(store, bytes, ['darwin-arm64', 'linux-x86-64'])
    const publisher = new BinaryArtifactPublisher(store, new TestScanner('blocked'), {
      tokenSecret: 'test-secret-that-is-long-enough',
    })
    await publisher.rescanExisting({
      domain: 'example.com/tool',
      version: '1.2.3',
      platforms: ['darwin-arm64'],
    })
    const artifactSha256 = createHash('sha256').update(bytes).digest('hex')
    const selector = { domain: 'example.com/tool', version: '1.2.3', artifactSha256 }
    const prepared = await publisher.prepareExternalQuarantineReview(selector)
    expect(prepared.action).toBe('prepared')

    const result = await publisher.attestExternalQuarantineReview({
      ...selector,
      quarantineKey: prepared.quarantineKey,
      size: prepared.size,
      objectIdentity: prepared.objectIdentity,
      scan: {
        verdict: 'blocked',
        engine: 'clamav',
        scannedAt: new Date().toISOString(),
        durationMs: 10,
        artifactSha256,
        engineVersion: 'ClamAV 1.5.3',
        databaseVersion: '28078',
        signature: 'Macos.Test.FalsePositive',
      },
    })

    expect(result.action).toBe('still-quarantined')
    expect(result.platforms).toEqual({})
    expect([...store.files.keys()].some(key =>
      key.startsWith('binaries/example.com/tool/1.2.3/'),
    )).toBe(false)
    const metadata = JSON.parse(store.files.get('binaries/example.com/tool/metadata.json')!.toString())
    expect(metadata.malwareQuarantines[0]).toEqual(expect.objectContaining({
      artifactSha256,
      quarantineKey: prepared.quarantineKey,
      filename: 'example.com-tool-1.2.3.tar.gz',
      size: bytes.byteLength,
      databaseVersion: '28078',
      signature: 'Macos.Test.FalsePositive',
      reviewedAt: expect.any(String),
    }))
    expect([...store.files.keys()].some(key => key.includes('.review-'))).toBe(true)
  })

  it('releases only an identity-bound quarantine after a fresh clean verdict', async () => {
    const store = new UrlArtifactStore()
    const bytes = Buffer.from('reviewed clean artifact')
    await seedLegacyArtifact(store, bytes, ['darwin-arm64', 'linux-x86-64'])
    const publisher = new BinaryArtifactPublisher(store, new TestScanner('blocked'), {
      tokenSecret: 'test-secret-that-is-long-enough',
    })
    await publisher.rescanExisting({
      domain: 'example.com/tool',
      version: '1.2.3',
      platforms: ['darwin-arm64'],
    })
    const artifactSha256 = createHash('sha256').update(bytes).digest('hex')
    const selector = { domain: 'example.com/tool', version: '1.2.3', artifactSha256 }
    const prepared = await publisher.prepareExternalQuarantineReview(selector)
    const result = await publisher.attestExternalQuarantineReview({
      ...selector,
      quarantineKey: prepared.quarantineKey,
      size: prepared.size,
      objectIdentity: prepared.objectIdentity,
      scan: {
        verdict: 'clean',
        engine: 'clamav',
        scannedAt: new Date().toISOString(),
        durationMs: 10,
        artifactSha256,
        engineVersion: 'ClamAV 1.5.3',
        databaseVersion: '28079',
      },
    })

    expect(result.action).toBe('released')
    expect(Object.keys(result.platforms)).toEqual(['darwin-arm64', 'linux-x86-64'])
    for (const record of Object.values(result.platforms)) {
      expect(store.files.get(record.tarball)).toEqual(bytes)
      expect(store.files.has(`${record.tarball}.sha256`)).toBe(true)
      expect(store.files.has(`${record.tarball}.scan.json`)).toBe(true)
    }
    const metadata = JSON.parse(store.files.get('binaries/example.com/tool/metadata.json')!.toString())
    expect(metadata.malwareQuarantines).toBeUndefined()
    expect(Object.keys(metadata.versions['1.2.3'].platforms)).toEqual(['darwin-arm64', 'linux-x86-64'])
    expect([...store.files.keys()].some(key => key.startsWith('.pantry-quarantine/malware/'))).toBe(true)
    expect((await publisher.prepareExternalQuarantineReview(selector)).action).toBe('already-released')
  })

  it('supports legacy tombstones by filename and rejects changed quarantine bytes', async () => {
    const store = new UrlArtifactStore()
    const bytes = Buffer.from('legacy tombstone bytes')
    await seedLegacyArtifact(store, bytes)
    const publisher = new BinaryArtifactPublisher(store, new TestScanner('blocked'), {
      tokenSecret: 'test-secret-that-is-long-enough',
    })
    await publisher.rescanExisting({
      domain: 'example.com/tool',
      version: '1.2.3',
      platforms: ['darwin-arm64'],
    })
    const metadataKey = 'binaries/example.com/tool/metadata.json'
    const metadata = JSON.parse(store.files.get(metadataKey)!.toString())
    const quarantineKey = metadata.malwareQuarantines[0].quarantineKey
    delete metadata.malwareQuarantines[0].quarantineKey
    delete metadata.malwareQuarantines[0].filename
    delete metadata.malwareQuarantines[0].size
    await store.putObject(metadataKey, JSON.stringify(metadata), 'application/json')
    const artifactSha256 = createHash('sha256').update(bytes).digest('hex')
    const selector = { domain: 'example.com/tool', version: '1.2.3', artifactSha256 }

    await expect(publisher.prepareExternalQuarantineReview(selector))
      .rejects.toMatchObject({ code: 'BINARY_QUARANTINE_FILENAME_REQUIRED' })
    const prepared = await publisher.prepareExternalQuarantineReview({
      ...selector,
      filename: 'example.com-tool-1.2.3.tar.gz',
    })
    await store.putObject(quarantineKey, Buffer.from('changed tombstone byte'), 'application/gzip')
    await expect(publisher.attestExternalQuarantineReview({
      ...selector,
      filename: 'example.com-tool-1.2.3.tar.gz',
      quarantineKey: prepared.quarantineKey,
      size: prepared.size,
      objectIdentity: prepared.objectIdentity,
      scan: {
        verdict: 'clean',
        engine: 'clamav',
        scannedAt: new Date().toISOString(),
        durationMs: 10,
        artifactSha256,
        engineVersion: 'ClamAV 1.5.3',
        databaseVersion: '28079',
      },
    })).rejects.toMatchObject({ code: 'BINARY_QUARANTINE_ARTIFACT_CHANGED' })
  })

  it('recovers a lost quarantine tombstone only from its private scan evidence', async () => {
    const store = new UrlArtifactStore()
    const bytes = Buffer.from('recoverable quarantine bytes')
    await seedLegacyArtifact(store, bytes)
    const publisher = new BinaryArtifactPublisher(store, new TestScanner('blocked'), {
      tokenSecret: 'test-secret-that-is-long-enough',
    })
    await publisher.rescanExisting({
      domain: 'example.com/tool',
      version: '1.2.3',
      platforms: ['darwin-arm64'],
    })
    const metadataKey = 'binaries/example.com/tool/metadata.json'
    const metadata = JSON.parse(store.files.get(metadataKey)!.toString())
    const [lost] = metadata.malwareQuarantines
    delete metadata.malwareQuarantines
    await store.putObject(metadataKey, JSON.stringify(metadata), 'application/json')

    const prepared = await publisher.prepareExternalQuarantineReview({
      domain: 'example.com/tool',
      version: '1.2.3',
      artifactSha256: lost.artifactSha256,
      filename: lost.filename,
    })

    expect(prepared.action).toBe('prepared')
    expect(prepared.platforms).toEqual(['darwin-arm64'])
    const repaired = JSON.parse(store.files.get(metadataKey)!.toString())
    expect(repaired.malwareQuarantines).toEqual([expect.objectContaining({
      artifactSha256: lost.artifactSha256,
      quarantineKey: lost.quarantineKey,
      filename: lost.filename,
      platforms: ['darwin-arm64'],
      signature: 'Test.EICAR',
      size: bytes.byteLength,
    })])
  })

  it('does not recover a lost tombstone from mismatched private scan evidence', async () => {
    const store = new UrlArtifactStore()
    const bytes = Buffer.from('mismatched quarantine evidence')
    await seedLegacyArtifact(store, bytes)
    const publisher = new BinaryArtifactPublisher(store, new TestScanner('blocked'), {
      tokenSecret: 'test-secret-that-is-long-enough',
    })
    await publisher.rescanExisting({
      domain: 'example.com/tool',
      version: '1.2.3',
      platforms: ['darwin-arm64'],
    })
    const metadataKey = 'binaries/example.com/tool/metadata.json'
    const metadata = JSON.parse(store.files.get(metadataKey)!.toString())
    const [lost] = metadata.malwareQuarantines
    delete metadata.malwareQuarantines
    await store.putObject(metadataKey, JSON.stringify(metadata), 'application/json')
    const sidecar = JSON.parse(store.files.get(`${lost.quarantineKey}.scan.json`)!.toString())
    sidecar.scan.artifactSha256 = 'f'.repeat(64)
    await store.putObject(`${lost.quarantineKey}.scan.json`, JSON.stringify(sidecar), 'application/json')

    await expect(publisher.prepareExternalQuarantineReview({
      domain: 'example.com/tool',
      version: '1.2.3',
      artifactSha256: lost.artifactSha256,
      filename: lost.filename,
    })).rejects.toMatchObject({ code: 'BINARY_QUARANTINE_NOT_FOUND' })
  })

  it('does not release a clean artifact over another quarantine for the same platform', async () => {
    const store = new UrlArtifactStore()
    const bytes = Buffer.from('older quarantined artifact')
    await seedLegacyArtifact(store, bytes)
    const publisher = new BinaryArtifactPublisher(store, new TestScanner('blocked'), {
      tokenSecret: 'test-secret-that-is-long-enough',
    })
    await publisher.rescanExisting({
      domain: 'example.com/tool',
      version: '1.2.3',
      platforms: ['darwin-arm64'],
    })
    const metadataKey = 'binaries/example.com/tool/metadata.json'
    const metadata = JSON.parse(store.files.get(metadataKey)!.toString())
    const [older] = metadata.malwareQuarantines
    metadata.malwareQuarantines.push({
      ...older,
      artifactSha256: 'e'.repeat(64),
      quarantineKey: older.quarantineKey.replace(older.artifactSha256, 'e'.repeat(64)),
    })
    await store.putObject(metadataKey, JSON.stringify(metadata), 'application/json')
    const selector = {
      domain: 'example.com/tool',
      version: '1.2.3',
      artifactSha256: older.artifactSha256,
    }
    const prepared = await publisher.prepareExternalQuarantineReview(selector)
    const result = await publisher.attestExternalQuarantineReview({
      ...selector,
      quarantineKey: prepared.quarantineKey,
      size: prepared.size,
      objectIdentity: prepared.objectIdentity,
      scan: {
        verdict: 'clean',
        engine: 'clamav',
        scannedAt: new Date().toISOString(),
        durationMs: 10,
        artifactSha256: older.artifactSha256,
        engineVersion: 'ClamAV 1.5.3',
        databaseVersion: '28079',
      },
    })

    expect(result).toMatchObject({ action: 'released', platforms: {} })
    expect([...store.files.keys()].some(key =>
      key.startsWith('binaries/example.com/tool/1.2.3/'),
    )).toBe(false)
    const after = JSON.parse(store.files.get(metadataKey)!.toString())
    expect(after.malwareQuarantines).toEqual([
      expect.objectContaining({ artifactSha256: 'e'.repeat(64), platforms: ['darwin-arm64'] }),
    ])
  })

  it('reviews a shared quarantined object from each tombstoned version', async () => {
    const store = new UrlArtifactStore()
    const bytes = Buffer.from('shared version artifact')
    await seedLegacyArtifact(store, bytes)
    const metadataKey = 'binaries/example.com/tool/metadata.json'
    const metadata = JSON.parse(store.files.get(metadataKey)!.toString())
    metadata.versions['1.2.4'] = structuredClone(metadata.versions['1.2.3'])
    metadata.latestVersion = '1.2.4'
    await store.putObject(metadataKey, JSON.stringify(metadata), 'application/json')
    const publisher = new BinaryArtifactPublisher(store, new TestScanner('blocked'), {
      tokenSecret: 'test-secret-that-is-long-enough',
    })
    await publisher.rescanExisting({
      domain: 'example.com/tool',
      version: '1.2.3',
      platforms: ['darwin-arm64'],
    })
    const artifactSha256 = createHash('sha256').update(bytes).digest('hex')

    const prepared = await publisher.prepareExternalQuarantineReview({
      domain: 'example.com/tool',
      version: '1.2.4',
      artifactSha256,
    })

    expect(prepared.action).toBe('prepared')
    expect(prepared.quarantineKey).toContain(`/1.2.3/${artifactSha256}/`)
    expect(prepared.version).toBe('1.2.4')
  })

  it('strips private malware quarantine tombstones from public metadata', () => {
    const metadata: any = {
      name: 'example.com/tool',
      latestVersion: '',
      versions: {},
      updatedAt: new Date().toISOString(),
      malwareQuarantines: [{
        version: '1.2.3',
        platforms: ['darwin-arm64'],
        artifactSha256: 'a'.repeat(64),
      }],
    }

    expect(publicBinaryMetadata(metadata)).not.toHaveProperty('malwareQuarantines')
  })

  it('filters unattested metadata without mutating the stored snapshot', () => {
    const clean = {
      verdict: 'clean' as const,
      engine: 'test',
      scannedAt: new Date().toISOString(),
      durationMs: 1,
      artifactSha256: 'a'.repeat(64),
    }
    const metadata: any = {
      name: 'example.com/tool',
      latestVersion: '2.0.0',
      versions: {
        '1.0.0': { platforms: { 'darwin-arm64': { malwareScan: clean } } },
        '2.0.0': { platforms: { 'linux-x86-64': {} } },
      },
      updatedAt: new Date().toISOString(),
    }
    const filtered = filterBinaryMetadataForCleanScans(metadata)
    expect(Object.keys(filtered.versions)).toEqual(['1.0.0'])
    expect(filtered.latestVersion).toBe('1.0.0')
    expect(metadata.versions['2.0.0']).toBeTruthy()
  })
})

describe('binary publication API', () => {
  let server: ReturnType<typeof createServer>
  let baseUrl: string
  let token: string
  let store: UrlArtifactStore

  beforeEach(async () => {
    token = `binary-test-${crypto.randomUUID()}`
    process.env.PANTRY_REGISTRY_TOKEN = token
    const port = await getAvailablePort()
    baseUrl = `http://localhost:${port}`
    store = new UrlArtifactStore()
    const scanner = new TestScanner()
    const publisher = new BinaryArtifactPublisher(store, scanner, {
      tokenSecret: 'test-secret-that-is-long-enough',
      legacyScanAttestationCutoff: Date.parse('2026-01-02T00:00:00.000Z'),
    })
    server = createServer(
      createLocalRegistry(baseUrl),
      port,
      new InMemoryAnalytics(),
      new InMemoryZigStorage(),
      undefined,
      undefined,
      new InMemoryAuthStorage(),
      scanner,
      publisher,
    )
    server.start()
  })

  afterEach(() => {
    server.stop()
    delete process.env.PANTRY_REGISTRY_TOKEN
  })

  it('requires operator auth and completes a staged publication', async () => {
    const bytes = Buffer.from('api artifact')
    const unauthenticated = await fetch(`${baseUrl}/api/v1/binaries/uploads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request(bytes)),
    })
    expect(unauthenticated.status).toBe(401)

    const initiatedResponse = await fetch(`${baseUrl}/api/v1/binaries/uploads`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(request(bytes)),
    })
    expect(initiatedResponse.status).toBe(201)
    const initiated = await initiatedResponse.json() as any
    await store.putObject(store.lastUploadKey, bytes, 'application/gzip')

    const completed = await fetch(`${baseUrl}/api/v1/binaries/uploads/complete`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ uploadId: initiated.uploadId }),
    })
    expect(completed.status).toBe(201)
    expect((await completed.json() as any).scan.verdict).toBe('clean')
  })

  it('requires operator auth and rescans a retained artifact in place', async () => {
    const bytes = Buffer.from('api retained artifact')
    await seedLegacyArtifact(store, bytes)
    const body = JSON.stringify({
      domain: 'example.com/tool',
      version: '1.2.3',
      platforms: ['darwin-arm64'],
    })

    const unauthenticated = await fetch(`${baseUrl}/api/v1/binaries/rescan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    })
    expect(unauthenticated.status).toBe(401)

    const rescanned = await fetch(`${baseUrl}/api/v1/binaries/rescan`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body,
    })
    expect(rescanned.status).toBe(200)
    expect((await rescanned.json() as any).action).toBe('attested')
  })

  it('prepares and accepts an authenticated external legacy scan', async () => {
    const bytes = Buffer.from('api external retained artifact')
    await seedLegacyArtifact(store, bytes)
    const selector = {
      domain: 'example.com/tool',
      version: '1.2.3',
      platforms: ['darwin-arm64'],
    }
    const prepareResponse = await fetch(`${baseUrl}/api/v1/binaries/rescan/prepare`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(selector),
    })
    expect(prepareResponse.status).toBe(200)
    const prepared = await prepareResponse.json() as any
    expect(prepared.action).toBe('prepared')

    const attestResponse = await fetch(`${baseUrl}/api/v1/binaries/rescan/attest`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...selector,
        tarball: prepared.tarball,
        sha256: prepared.sha256,
        size: prepared.size,
        objectIdentity: prepared.objectIdentity,
        scan: {
          verdict: 'clean',
          engine: 'clamav',
          scannedAt: new Date().toISOString(),
          durationMs: 10,
          artifactSha256: prepared.sha256,
          engineVersion: 'ClamAV 1.4.3',
          databaseVersion: '27690',
        },
      }),
    })
    expect(attestResponse.status).toBe(200)
    expect((await attestResponse.json() as any).action).toBe('attested')
  })

  it('requires operator auth for quarantine review and releases clean bytes', async () => {
    const bytes = Buffer.from('api quarantined artifact')
    await seedLegacyArtifact(store, bytes)
    const blockedPublisher = new BinaryArtifactPublisher(store, new TestScanner('blocked'), {
      tokenSecret: 'test-secret-that-is-long-enough',
    })
    await blockedPublisher.rescanExisting({
      domain: 'example.com/tool',
      version: '1.2.3',
      platforms: ['darwin-arm64'],
    })
    const selector = {
      domain: 'example.com/tool',
      version: '1.2.3',
      artifactSha256: createHash('sha256').update(bytes).digest('hex'),
    }

    const unauthenticated = await fetch(`${baseUrl}/api/v1/binaries/quarantine/rescan/prepare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(selector),
    })
    expect(unauthenticated.status).toBe(401)

    const prepareResponse = await fetch(`${baseUrl}/api/v1/binaries/quarantine/rescan/prepare`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(selector),
    })
    expect(prepareResponse.status).toBe(200)
    const prepared = await prepareResponse.json() as any
    expect(prepared.action).toBe('prepared')

    const attestResponse = await fetch(`${baseUrl}/api/v1/binaries/quarantine/rescan/attest`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...selector,
        quarantineKey: prepared.quarantineKey,
        size: prepared.size,
        objectIdentity: prepared.objectIdentity,
        scan: {
          verdict: 'clean',
          engine: 'clamav',
          scannedAt: new Date().toISOString(),
          durationMs: 10,
          artifactSha256: selector.artifactSha256,
          engineVersion: 'ClamAV 1.5.3',
          databaseVersion: '28079',
        },
      }),
    })
    expect(attestResponse.status).toBe(200)
    expect((await attestResponse.json() as any).action).toBe('released')
  })
})

describe('completion resumes from a sealed artifact', () => {
  // complete() seals the upload (copy to sealed, delete staging) BEFORE
  // scanning. So "staging is gone" does not mean "nothing was uploaded" - it
  // usually means a completion got that far. Two cases were previously
  // indistinguishable and both returned BINARY_STAGING_NOT_FOUND:
  //
  //   - a concurrent attempt is mid-scan (retryable, resolves itself)
  //   - an earlier attempt DIED after sealing, e.g. its CI job hit a timeout
  //     mid-scan, which is exactly what happened to a 500MB package
  //
  // The second orphaned the upload permanently: staging deleted, promotion
  // never recorded, so every retry failed forever and the only way out was to
  // rebuild from scratch.
  // Mirrors the derivation in complete(): STAGING_PREFIX is
  // `.pantry-staging/malware`, and sealing swaps that for
  // `.pantry-staging/sealed`.
  const sealedKeyFor = (stagingKey: string): string =>
    stagingKey.replace('.pantry-staging/malware/', '.pantry-staging/sealed/')

  it('promotes an upload whose first completion died after sealing', async () => {
    const store = new MemoryArtifactStore()
    const scanner = new TestScanner()
    const publisher = new BinaryArtifactPublisher(store, scanner, {
      tokenSecret: 'test-secret-that-is-long-enough',
    })
    const bytes = Buffer.from('clean artifact')

    const initiated = publisher.initiate(request(bytes))
    await store.putObject(store.lastUploadKey, bytes, 'application/gzip')

    // Simulate the crash: sealed exists, staging is gone, nothing promoted.
    const staging = store.lastUploadKey
    await store.copyObject(staging, sealedKeyFor(staging))
    await store.deleteObject(staging)

    const result = await publisher.complete(initiated.uploadId, '_admin')

    expect(result.scan.verdict).toBe('clean')
    for (const record of Object.values(result.platforms))
      expect(store.files.get(record.tarball)?.toString()).toBe('clean artifact')
  })

  it('still reports not-found when nothing was ever uploaded', async () => {
    // The resume path must not mask a genuinely absent artifact.
    const store = new MemoryArtifactStore()
    const scanner = new TestScanner()
    const publisher = new BinaryArtifactPublisher(store, scanner, {
      tokenSecret: 'test-secret-that-is-long-enough',
    })
    const initiated = publisher.initiate(request(Buffer.from('clean artifact')))

    await expect(publisher.complete(initiated.uploadId, '_admin'))
      .rejects.toThrow(/not found or has expired/)
  })
})

describe('a retry does not start a competing scan', () => {
  // Resuming from the sealed copy fixed orphaned uploads, but naively it also
  // meant every retry began ANOTHER scan of the same artifact. A publisher
  // polls while the first completion is still scanning, so a slow scan turned
  // 60 polls into 60 concurrent scans of the same 180MB file - strictly worse
  // than the bug it replaced.
  it('tells a concurrent retry to wait instead of rescanning', async () => {
    const store = new MemoryArtifactStore()
    const scanner = new ControlledTestScanner()
    const publisher = new BinaryArtifactPublisher(store, scanner, {
      tokenSecret: 'test-secret-that-is-long-enough',
    })
    const bytes = Buffer.from('clean artifact')
    const initiated = publisher.initiate(request(bytes))
    await store.putObject(store.lastUploadKey, bytes, 'application/gzip')

    // First completion parks inside the scanner.
    const first = publisher.complete(initiated.uploadId, '_admin')
    await scanner.started

    // Second arrives mid-scan: staging is gone, sealed exists, someone is on it.
    await expect(publisher.complete(initiated.uploadId, '_admin'))
      .rejects.toThrow(/already in progress/)

    scanner.release()
    const result = await first
    expect(result.scan.verdict).toBe('clean')
    // One scan, not two.
    expect(scanner.contexts).toHaveLength(1)
  })

  // The scan used to run inside the HTTP request that asked for it, so its
  // budget was capped by the enclosing timeouts (255s Bun idle, 300s rpx). A
  // 183MB artifact needs longer, so it was killed at its deadline and reported
  // as MALWARE_SCAN_UNAVAILABLE - a working scanner, described as broken.
  // Polls until the detached completion settles. Sleeping a fixed interval
  // instead makes the test a race against machine load.
  const claimWhenSettled = async (
    publisher: BinaryArtifactPublisher,
    uploadId: string,
  ): Promise<BinaryPublishCompleted> => {
    for (let attempt = 0; attempt < 200; attempt++) {
      try {
        return await publisher.complete(uploadId, '_admin')
      }
      catch (error) {
        if (!/already in progress/.test((error as Error).message)) throw error
        await Bun.sleep(10)
      }
    }
    throw new Error('completion never settled')
  }

  // The scan used to run inside the HTTP request that asked for it, so its
  // budget was capped by the enclosing timeouts (255s Bun idle, 300s rpx). A
  // 183MB artifact needs longer, so it was killed at its deadline and reported
  // as MALWARE_SCAN_UNAVAILABLE - a working scanner, described as broken.
  it('keeps scanning after the response budget expires, and a later poll claims the result', async () => {
    const store = new MemoryArtifactStore()
    const scanner = new ControlledTestScanner()
    const publisher = new BinaryArtifactPublisher(store, scanner, {
      tokenSecret: 'test-secret-that-is-long-enough',
      // Stands in for "longer than a response can be held open".
      completionResponseBudgetMs: 50,
    })
    const bytes = Buffer.from('clean artifact')
    const initiated = publisher.initiate(request(bytes))
    await store.putObject(store.lastUploadKey, bytes, 'application/gzip')

    // The scan outlives the request that started it: the caller is told to
    // poll rather than the scan being abandoned.
    await expect(publisher.complete(initiated.uploadId, '_admin'))
      .rejects.toThrow(/already in progress/)
    await scanner.started
    scanner.release()

    const claimed = await claimWhenSettled(publisher, initiated.uploadId)
    expect(claimed.scan.verdict).toBe('clean')
    // Still exactly one scan across the abandoned request and every poll.
    expect(scanner.contexts).toHaveLength(1)
  })

  it('answers a poll without holding it for the response budget', async () => {
    const store = new MemoryArtifactStore()
    const scanner = new ControlledTestScanner()
    const publisher = new BinaryArtifactPublisher(store, scanner, {
      tokenSecret: 'test-secret-that-is-long-enough',
      // Deliberately huge: a poll that waited even a fraction of this would
      // put every retry back on the connection budget this change escapes.
      completionResponseBudgetMs: 60_000,
    })
    const bytes = Buffer.from('clean artifact')
    const initiated = publisher.initiate(request(bytes))
    await store.putObject(store.lastUploadKey, bytes, 'application/gzip')

    const first = publisher.complete(initiated.uploadId, '_admin')
    await scanner.started

    const polledAt = performance.now()
    await expect(publisher.complete(initiated.uploadId, '_admin'))
      .rejects.toThrow(/already in progress/)
    expect(performance.now() - polledAt).toBeLessThan(1_000)

    scanner.release()
    expect((await first).scan.verdict).toBe('clean')
    expect(scanner.contexts).toHaveLength(1)
  })

  it('makes an in-process caller wait for the verdict instead of handing it a 425', async () => {
    // publishBuffer and the pkgx fallback run inside the process with nothing
    // to poll with. A retryable "ask again later" is an error they cannot act
    // on, so they must get the real verdict however long it takes.
    const store = new MemoryArtifactStore()
    const scanner = new ControlledTestScanner()
    const publisher = new BinaryArtifactPublisher(store, scanner, {
      tokenSecret: 'test-secret-that-is-long-enough',
      completionResponseBudgetMs: 10,
    })
    const bytes = Buffer.from('clean artifact')
    const initiated = publisher.initiate(request(bytes))
    await store.putObject(store.lastUploadKey, bytes, 'application/gzip')

    const waiting = publisher.completeAwaitingScan(initiated.uploadId, '_pkgx', 'pkgx')
    await scanner.started
    // Well past the response budget, and still waiting rather than rejected.
    await Bun.sleep(60)
    scanner.release()

    expect((await waiting).scan.verdict).toBe('clean')
    expect(scanner.contexts).toHaveLength(1)
  })

  it('reports a detached failure to the poll rather than losing it', async () => {
    const store = new MemoryArtifactStore()
    const scanner = new ControlledTestScanner('blocked')
    const publisher = new BinaryArtifactPublisher(store, scanner, {
      tokenSecret: 'test-secret-that-is-long-enough',
      completionResponseBudgetMs: 50,
    })
    const bytes = Buffer.from('malicious artifact')
    const initiated = publisher.initiate(request(bytes))
    await store.putObject(store.lastUploadKey, bytes, 'application/gzip')

    await expect(publisher.complete(initiated.uploadId, '_admin'))
      .rejects.toThrow(/already in progress/)
    await scanner.started
    scanner.release()

    // A verdict reached after the request ended must still reach the client;
    // silently dropping it would let a blocked artifact look merely slow.
    await expect(claimWhenSettled(publisher, initiated.uploadId))
      .rejects.toThrow(/blocked by malware scanning/)
  })
})


it('server drain keeps native metadata readable while a detached completion settles and fences new writes', async () => {
  const port = await getAvailablePort(), base = `http://127.0.0.1:${port}`
  const store = new MemoryArtifactStore(), scanner = new ControlledTestScanner()
  const publisher = new BinaryArtifactPublisher(store, scanner, { tokenSecret: 'test-secret-that-is-long-enough', completionResponseBudgetMs: 10 })
  const bytes = Buffer.from('drained clean artifact'), initiated = publisher.initiate(request(bytes))
  await store.putObject(store.lastUploadKey, bytes, 'application/gzip')
  await expect(publisher.complete(initiated.uploadId, '_admin')).rejects.toMatchObject({ status: 425 })
  await scanner.started
  const server = createServer(createLocalRegistry(base), port, new InMemoryAnalytics(), new InMemoryZigStorage(), {
    getObject: async () => Buffer.from(JSON.stringify({ name: 'curl.se', versions: {}, latestVersion: '1.0.0' })),
  }, undefined, new InMemoryAuthStorage(), scanner, publisher)
  server.start()
  let draining: Promise<void> | undefined, drained = false
  try {
    draining = server.stop(false).then(() => { drained = true })
    const metadata = await fetch(`${base}/binaries/curl.se/metadata.json`)
    expect(metadata.status).toBe(200)
    expect(await metadata.json()).toMatchObject({ name: 'curl.se' })
    expect(drained).toBe(false)
    const refused = await fetch(`${base}/api/v1/binaries/uploads`, { method: 'POST', body: '{}' })
    expect(refused.status).toBe(503)
    expect(await refused.json()).toMatchObject({ code: 'REGISTRY_DRAINING' })
    scanner.release()
    await draining
    expect(store.files.has('binaries/example.com/tool/metadata.json')).toBe(true)
    expect(scanner.contexts).toHaveLength(1)
  }
  finally {
    scanner.release()
    await server.stop(true)
    await draining
  }
})
