import { afterEach, describe, expect, it, spyOn } from 'bun:test'
import { createHash } from 'node:crypto'
import { S3Client } from './storage/aws-client'
import { type AttributeValue, DynamoDBClient } from './storage/dynamodb-client'
import { DynamoDBZigStorage, type ZigPackageMetadata } from './zig'

const restorations: (() => void)[] = []
afterEach(() => { for (const restore of restorations.splice(0)) restore() })

function persistence() {
  const rows = new Map<string, Record<string, AttributeValue>>()
  const key = (table: string, row: Record<string, AttributeValue>) => `${table}/${row.PK?.S}/${row.SK?.S}`
  const put = spyOn(DynamoDBClient.prototype, 'putItem').mockImplementation(async ({ TableName, Item }) => {
    rows.set(key(TableName, Item), structuredClone(Item))
  })
  const get = spyOn(DynamoDBClient.prototype, 'getItem').mockImplementation(async ({ TableName, Key }) => ({ Item: structuredClone(rows.get(key(TableName, Key))) }))
  const uploads: Buffer[] = []
  const upload = spyOn(S3Client.prototype, 'putObject').mockImplementation(async ({ body }) => { uploads.push(Buffer.from(body)) })
  restorations.push(() => put.mockRestore(), () => get.mockRestore(), () => upload.mockRestore())
  const open = () => new DynamoDBZigStorage({ tableName: 'zig-fixture', bucket: 'fixture', region: 'us-east-1', baseUrl: 'https://registry.example.test' })
  return { rows, open, uploads }
}

describe('DynamoDB Zig package provenance', () => {
  it('retains independent native and compressed-archive identities across a new storage instance', async () => {
    const { open, uploads } = persistence()
    const bytes = new TextEncoder().encode('immutable original fixture archive').buffer
    const artifactSha256 = createHash('sha256').update(Buffer.from(bytes)).digest('hex')
    const hash = `mylib-0.4.0-${'A'.repeat(44)}`
    const metadata: ZigPackageMetadata = {
      name: 'mylib', version: '0.4.0', hash, artifactSha256,
      tarballUrl: 'https://registry.example.test/zig/packages/mylib/0.4.0/tarball',
      publishedAt: '2026-10-23T19:00:00.000Z',
      malwareScan: { verdict: 'clean', engine: 'fixture', scannedAt: '2026-10-23T19:00:00.000Z', durationMs: 1, artifactSha256 },
    }
    await open().publish(metadata, bytes)
    expect(uploads).toEqual([Buffer.from(bytes)])
    const reopened = open()
    for (const result of [await reopened.getPackage('mylib', '0.4.0'), await reopened.getPackage('mylib')]) {
      expect(result?.hash).toBe(hash)
      expect(result?.artifactSha256).toBe(artifactSha256)
      expect(result?.malwareScan).toEqual(metadata.malwareScan)
    }
    expect(await reopened.getByHash(hash)).toEqual({ name: 'mylib', version: '0.4.0', tarballUrl: metadata.tarballUrl })
  })

  it('reads historical records without inventing a compressed-archive digest from the native hash', async () => {
    const { rows, open } = persistence()
    const hash = `1220${'b'.repeat(64)}`
    rows.set('zig-fixture/ZIG_PACKAGE#legacy/VERSION#1.0.0', DynamoDBClient.marshal({
      PK: 'ZIG_PACKAGE#legacy', SK: 'VERSION#1.0.0', name: 'legacy', version: '1.0.0',
      hash, tarballUrl: 'https://registry.example.test/legacy.tar.gz', publishedAt: '2025-01-01T00:00:00.000Z',
    }))
    const result = await open().getPackage('legacy', '1.0.0')
    expect(result?.hash).toBe(hash)
    expect(result?.artifactSha256).toBeUndefined()
  })
})
