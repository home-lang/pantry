import { expect, test } from 'bun:test'
import { createHash } from 'node:crypto'
import { gzipSync } from 'node:zlib'
import { verifyPublishedTarball, waitForNpmPublication } from '../../../.github/scripts/npm-publication-readback'

function fixture(name = 'ts-pantry', version = '1.2.3'): { bytes: Buffer, integrity: string } {
  const json = Buffer.from(JSON.stringify({ name, version }))
  const header = Buffer.alloc(512)
  header.write('package/package.json')
  header.write(json.length.toString(8).padStart(11, '0'), 124)
  header[156] = 48
  header.fill(32, 148, 156)
  header.write([...header].reduce((sum, value) => sum + value, 0).toString(8).padStart(6, '0') + '\0 ', 148)
  const bytes = gzipSync(Buffer.concat([header, json, Buffer.alloc(512 - json.length), Buffer.alloc(1024)]))
  return { bytes, integrity: `sha512-${createHash('sha512').update(bytes).digest('base64')}` }
}

test('public readback verifies actual tarball integrity and its internal release identity', () => {
  const archive = fixture()
  expect(verifyPublishedTarball(archive.bytes, archive.integrity, 'ts-pantry', '1.2.3')).toBe(archive.integrity)
  expect(() => verifyPublishedTarball(archive.bytes, 'sha512-wrong', 'ts-pantry', '1.2.3')).toThrow('integrity mismatch')
  expect(() => verifyPublishedTarball(archive.bytes, archive.integrity, 'ts-pantry', '1.2.4')).toThrow('manifest does not match')
  const invalid = gzipSync(Buffer.from('incomplete tar'))
  const integrity = `sha512-${createHash('sha512').update(invalid).digest('base64')}`
  expect(() => verifyPublishedTarball(invalid, integrity, 'ts-pantry', '1.2.3')).toThrow('no package/package.json')
})

test('an accepted asynchronous publication must expose both metadata and verified archive bytes', async () => {
  const archive = fixture()
  let clock = 0
  let requests = 0
  const result = await waitForNpmPublication('ts-pantry', '1.2.3', {
    now: () => clock, wait: async ms => { clock += ms }, timeoutMs: 30_000,
    fetcher: (async (url) => {
      requests++
      if (requests === 1 || requests === 3) return new Response(null, { status: 404 })
      if (String(url).endsWith('.tgz')) return new Response(archive.bytes)
      return Response.json({ name: 'ts-pantry', version: '1.2.3', dist: { tarball: 'https://registry.npmjs.org/ts-pantry/-/ts-pantry-1.2.3.tgz', integrity: archive.integrity } })
    }),
  })
  expect(requests).toBe(5)
  expect(clock).toBe(10_000)
  expect(result.integrity).toBe(archive.integrity)
})

test('a staged version that never becomes readable fails within the readback deadline', async () => {
  let clock = 0
  await expect(waitForNpmPublication('ts-pantry', '1.2.3', {
    now: () => clock, wait: async ms => { clock += ms }, timeoutMs: 10_000,
    fetcher: async () => new Response(null, { status: 404 }),
  })).rejects.toThrow('before its deadline')
  expect(clock).toBe(10_000)
})
