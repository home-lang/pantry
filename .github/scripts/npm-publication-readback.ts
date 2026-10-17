import { createHash } from 'node:crypto'
import { mkdir } from 'node:fs/promises'
import { dirname } from 'node:path'
import { gunzipSync } from 'node:zlib'

/** Verify actual registry bytes, including the manifest inside the npm archive. */
export function verifyPublishedTarball(bytes: Uint8Array, integrity: string, name: string, version: string): string {
  const actual = `sha512-${createHash('sha512').update(bytes).digest('base64')}`
  if (!integrity.split(/\s+/).includes(actual)) throw new Error('Published npm tarball integrity mismatch')
  const tar = gunzipSync(bytes, { maxOutputLength: 256 * 1024 * 1024 })
  for (let offset = 0; offset + 512 <= tar.length;) {
    const header = tar.subarray(offset, offset + 512)
    if (header.every(value => value === 0)) break
    const field = (start: number, length: number): string => header.subarray(start, start + length).toString('utf8').split('\0')[0]!.trim()
    const sizeField = field(124, 12)
    if (!/^[0-7]+$/.test(sizeField)) throw new Error('Invalid npm tar entry size')
    const size = Number.parseInt(sizeField, 8)
    if (!Number.isSafeInteger(size) || offset + 512 + size > tar.length) throw new Error('Truncated npm tar entry')
    const prefix = field(345, 155)
    const filename = `${prefix ? `${prefix}/` : ''}${field(0, 100)}`
    if (filename === 'package/package.json') {
      if (header[156] !== 0 && header[156] !== 48) throw new Error('Published package manifest is not a regular file')
      const manifest = JSON.parse(tar.subarray(offset + 512, offset + 512 + size).toString('utf8'))
      if (manifest.name !== name || manifest.version !== version) throw new Error('Published npm archive manifest does not match the release')
      return actual
    }
    offset += 512 + Math.ceil(size / 512) * 512
  }
  throw new Error('Published npm archive has no package/package.json')
}

interface ReadbackOptions {
  fetcher?: typeof fetch
  now?: () => number
  wait?: (ms: number) => Promise<void>
  timeoutMs?: number
}

/** npm's 202 acknowledgement can precede public metadata and tarball visibility. */
export async function waitForNpmPublication(name: string, version: string, options: ReadbackOptions = {}): Promise<{ name: string, version: string, tarball: string, integrity: string, bytes: number }> {
  const fetcher = options.fetcher || fetch
  const now = options.now || Date.now
  const wait = options.wait || (ms => new Promise(resolve => setTimeout(resolve, ms)))
  const deadline = now() + (options.timeoutMs ?? 15 * 60_000)
  const metadataUrl = `https://registry.npmjs.org/${encodeURIComponent(name)}/${encodeURIComponent(version)}`
  let pending = 'metadata'
  while (now() < deadline) {
    const metadataResponse = await fetcher(metadataUrl, { signal: AbortSignal.timeout(Math.max(1, Math.min(15_000, deadline - now()))) })
    if (!metadataResponse.ok) {
      if (metadataResponse.status !== 404 && metadataResponse.status !== 429 && metadataResponse.status < 500)
        throw new Error(`Public npm metadata returned HTTP ${metadataResponse.status}`)
      pending = `metadata HTTP ${metadataResponse.status}`
      await metadataResponse.body?.cancel()
    }
    else {
      const metadata = await metadataResponse.json() as { name: string, version: string, dist: { tarball: string, integrity: string } }
      if (metadata.name !== name || metadata.version !== version || !metadata.dist?.integrity)
        throw new Error('Public npm metadata does not match the release')
      const url = new URL(metadata.dist.tarball)
      if (url.origin !== 'https://registry.npmjs.org' || url.username || url.password)
        throw new Error('Unexpected npm tarball origin')
      if (now() >= deadline) break
      const archive = await fetcher(url.href, { signal: AbortSignal.timeout(Math.max(1, Math.min(30_000, deadline - now()))) })
      if (archive.ok) {
        if (Number(archive.headers.get('Content-Length') || 0) > 64 * 1024 * 1024) throw new Error('Published npm archive exceeds the readback size limit')
        const bytes = new Uint8Array(await archive.arrayBuffer())
        if (bytes.length > 64 * 1024 * 1024) throw new Error('Published npm archive exceeds the readback size limit')
        const integrity = verifyPublishedTarball(bytes, metadata.dist.integrity, name, version)
        return { name, version, tarball: url.href, integrity, bytes: bytes.length }
      }
      if (archive.status !== 404 && archive.status !== 429 && archive.status < 500)
        throw new Error(`Public npm tarball returned HTTP ${archive.status}`)
      pending = `tarball HTTP ${archive.status}`
      await archive.body?.cancel()
    }
    await wait(Math.min(5000, Math.max(0, deadline - now())))
  }
  throw new Error(`Public npm publication did not become readable before its deadline (${pending})`)
}

if (import.meta.main) {
  const output = 'artifacts/npm-publication/proof.json'
  await mkdir(dirname(output), { recursive: true })
  const manifest = await Bun.file('packages/ts-pantry/package.json').json()
  try {
    const result = await waitForNpmPublication(manifest.name, manifest.version)
    await Bun.write(output, JSON.stringify({ at: new Date().toISOString(), passed: true, ...result }, null, 2) + '\n')
    console.log(`Verified public ${result.name}@${result.version}, ${result.bytes} archive bytes and SHA512 integrity`)
  }
  catch (error) {
    await Bun.write(output, JSON.stringify({ at: new Date().toISOString(), passed: false, name: manifest.name, version: manifest.version, error: error instanceof Error ? error.message : String(error) }, null, 2) + '\n')
    throw error
  }
}
