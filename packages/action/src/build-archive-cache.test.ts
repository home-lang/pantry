import { expect, test } from 'bun:test'
import { createHash } from 'node:crypto'
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { obtainBuildArchive } from './build-archive-cache'
import { exportBuildCacheEnvironment } from './build-archive-cache-env'
import { buildArchiveCacheSummary } from './build-archive-cache-summary'

const bytes = Buffer.from('verified shared dependency archive')
const digest = createHash('sha256').update(bytes).digest('hex')

async function fixture(run: (directory: string) => Promise<void>): Promise<void> {
  const directory = await mkdtemp(join(tmpdir(), 'pantry-archive-cache-'))
  try { await run(directory) }
  finally { await rm(directory, { recursive: true, force: true }) }
}

test('concurrent builds acquire an archive once and receive independent copies', async () => {
  await fixture(async (directory) => {
    let downloads = 0
    const results = await Promise.all([1, 2, 3].map(build => obtainBuildArchive({
      cacheDir: join(directory, 'cache'), remote: null, sha256: digest,
      destination: join(directory, `build-${build}`, 'archive'), label: 'shared',
      download: async path => { downloads++; await writeFile(path, bytes) },
    })))
    expect(downloads).toBe(1)
    expect(results.map(result => result.source).sort()).toEqual(['local', 'local', 'origin'])
    await writeFile(join(directory, 'build-1/archive'), 'modified by build')
    expect(await readFile(join(directory, 'build-2/archive'))).toEqual(bytes)
    expect(await readFile(join(directory, 'cache', digest, 'archive.tar.gz'))).toEqual(bytes)
  })
})

test('a new process reuses an archive left by an earlier build', async () => {
  await fixture(async (directory) => {
    const cacheDir = join(directory, 'cache')
    await obtainBuildArchive({ cacheDir, remote: null, sha256: digest, destination: join(directory, 'first'), label: 'first', download: path => writeFile(path, bytes) })
    const script = join(directory, 'second.ts')
    await writeFile(script, `import { obtainBuildArchive } from ${JSON.stringify(join(import.meta.dir, 'build-archive-cache.ts'))};
      const options = ${JSON.stringify({ cacheDir, remote: null, sha256: digest, destination: join(directory, 'second'), label: 'second' })};
      const result = await obtainBuildArchive({ ...options, download: async () => { throw Error('origin must not run') } });
      if (result.source !== 'local') throw Error('expected local reuse');`)
    const child = Bun.spawn([process.execPath, script], { stdout: 'pipe', stderr: 'pipe' })
    expect(await child.exited).toBe(0)
    expect(await readFile(join(directory, 'second'))).toEqual(bytes)
  })
})

test('a fresh runner restores a verified GitHub entry without contacting object storage', async () => {
  await fixture(async (directory) => {
    const saved = join(directory, 'remote')
    const keys: string[] = []
    const remote = {
      restoreCache: async ([path]: string[], key: string) => {
        try { await mkdir(dirname(path), { recursive: true }); await copyFile(saved, path); return key }
        catch { return undefined }
      },
      saveCache: async ([path]: string[], key: string) => { keys.push(key); await copyFile(path, saved); return 1 },
    }
    const cacheDir = join(directory, 'cache')
    const options = { cacheDir, remote, sha256: digest, label: 'shared', destination: join(directory, 'first') }
    await obtainBuildArchive({ ...options, download: path => writeFile(path, bytes) })
    // Saved already, even though the caller's subsequent build can fail.
    expect(keys).toEqual([`pantry-build-archive-v1-${digest}`])
    await rm(cacheDir, { recursive: true })
    const result = await obtainBuildArchive({ ...options, destination: join(directory, 'next-run'), download: async () => { throw new Error('must not download') } })
    expect(result).toEqual({ source: 'github', bytes: bytes.length })
  })
})

test('tampered local and remote archives are discarded; bad origin bytes never reach extraction', async () => {
  await fixture(async (directory) => {
    const cacheDir = join(directory, 'cache')
    const archive = join(cacheDir, digest, 'archive.tar.gz')
    await mkdir(dirname(archive), { recursive: true })
    await writeFile(archive, 'tampered')
    let saves = 0
    const remote = {
      restoreCache: async ([path]: string[], key: string) => { await mkdir(dirname(path), { recursive: true }); await writeFile(path, 'also tampered'); return key },
      saveCache: async () => { saves++; return 1 },
    }
    const options = { cacheDir, remote, sha256: digest, destination: join(directory, 'build'), label: 'bad' }
    await expect(obtainBuildArchive({ ...options, download: path => writeFile(path, 'bad origin') })).rejects.toThrow('checksum mismatch')
    expect(await Bun.file(archive).exists()).toBe(false)
    expect(await Bun.file(options.destination).exists()).toBe(false)
    expect(saves).toBe(0)
    expect((await obtainBuildArchive({ ...options, download: path => writeFile(path, bytes) })).source).toBe('origin')
    expect(saves).toBe(1)
  })
})

test('changed manifest digest downloads new bytes; missing digest fails before any fetch', async () => {
  await fixture(async (directory) => {
    const options = { cacheDir: join(directory, 'cache'), remote: null, destination: join(directory, 'build'), label: 'same-version' }
    await obtainBuildArchive({ ...options, sha256: digest, download: path => writeFile(path, bytes) })
    const changed = Buffer.from('rebuilt same version')
    let downloads = 0
    const result = await obtainBuildArchive({ ...options, sha256: createHash('sha256').update(changed).digest('hex'), download: async path => { downloads++; await writeFile(path, changed) } })
    expect(result.source).toBe('origin')
    expect(downloads).toBe(1)
    expect(await readFile(options.destination)).toEqual(changed)
    await expect(obtainBuildArchive({ ...options, sha256: '', download: async () => { throw Error('must not fetch') } })).rejects.toThrow('checksum mismatch or missing')
  })
})

test('GitHub outages fall back to origin and a full local cache evicts without deleting the build copy', async () => {
  await fixture(async (directory) => {
    const remote = { restoreCache: async () => { throw Error('offline') }, saveCache: async () => { throw Error('offline') } }
    const options = { cacheDir: join(directory, 'cache'), remote, destination: join(directory, 'build'), label: 'offline', sha256: digest, maxBytes: 0 }
    expect((await obtainBuildArchive({ ...options, download: path => writeFile(path, bytes) })).source).toBe('origin')
    expect(await readFile(options.destination)).toEqual(bytes)
    expect(await Bun.file(join(options.cacheDir, digest, 'archive.tar.gz')).exists()).toBe(false)
  })
})

test('runtime credentials are masked and only the cache service variables are exported', () => {
  const exported: Record<string, string> = {}
  const secrets: string[] = []
  const sink = { exportVariable: (key: string, value: string) => { exported[key] = value }, setSecret: (value: string) => { secrets.push(value) } }
  expect(exportBuildCacheEnvironment({ ACTIONS_RUNTIME_TOKEN: 'job-token', ACTIONS_RESULTS_URL: 'https://cache', ACTIONS_CACHE_SERVICE_V2: 'True', S3_SECRET_ACCESS_KEY: 'must-not-export' }, sink)).toBe(true)
  expect(secrets).toEqual(['job-token'])
  expect(exported).toEqual({ ACTIONS_RUNTIME_TOKEN: 'job-token', ACTIONS_RESULTS_URL: 'https://cache', ACTIONS_CACHE_SERVICE_V2: 'True', PANTRY_BUILD_CACHE_READY: 'true' })
  expect(exportBuildCacheEnvironment({}, sink)).toBe(false)
})

test('traffic summary distinguishes cache hits from origin archive bytes', async () => {
  await fixture(async (directory) => {
    await writeFile(join(directory, 'events.jsonl'), [
      { source: 'origin', bytes: 1048576, label: 'openssl.org@1.1.1w' },
      { source: 'local', bytes: 1048576, label: 'openssl.org@1.1.1w' },
      { source: 'github', bytes: 2097152, label: 'curl.se/ca-certs' },
    ].map(event => JSON.stringify(event)).join('\n') + '\ninterrupted')
    const summary = await buildArchiveCacheSummary(directory)
    expect(summary).toContain('**1.00 MiB**')
    expect(summary).toContain('**3.00 MiB**')
    expect(summary).toContain('openssl.org@1.1.1w: 1.00 MiB')
  })
})
