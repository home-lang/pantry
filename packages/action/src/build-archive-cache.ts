// Shared by repository build scripts. Keep the Actions SDK dependency in this
// workspace; published ts-pantry consumers do not need GitHub's cache client.
import { createHash, randomUUID } from 'node:crypto'
import { createReadStream } from 'node:fs'
import { appendFile, copyFile, mkdir, readFile, readdir, rename, rm, stat, utimes, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { setTimeout } from 'node:timers/promises'

export interface ArchiveCacheClient {
  restoreCache: (paths: string[], key: string) => Promise<string | undefined>
  saveCache: (paths: string[], key: string) => Promise<number>
}

export interface BuildArchiveOptions {
  sha256: string
  destination: string
  label: string
  download: (destination: string) => Promise<void>
  cacheDir?: string
  remote?: ArchiveCacheClient | null
  maxBytes?: number
}

export interface BuildArchiveResult {
  source: 'local' | 'github' | 'origin'
  bytes: number
}

export class ArchiveChecksumError extends Error {}

export function buildArchiveCacheDir(): string {
  return process.env.PANTRY_BUILD_ARCHIVE_CACHE_DIR
    || join(process.env.GITHUB_WORKSPACE || homedir(), '.cache', 'pantry-build-archives', 'v1')
}

async function matches(path: string, digest: string): Promise<boolean> {
  try {
    const hash = createHash('sha256')
    for await (const chunk of createReadStream(path)) hash.update(chunk)
    return hash.digest('hex') === digest
  }
  catch { return false }
}

// Serialize archive acquisition on a runner, including child build processes.
// A killed build cannot strand the cache lock for the rest of the job.
async function lock(directory: string): Promise<() => Promise<void>> {
  const path = join(directory, '.lock')
  const started = Date.now()
  while (true) {
    try {
      await mkdir(path)
      await writeFile(join(path, 'pid'), String(process.pid))
      return () => rm(path, { recursive: true, force: true })
    }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error
      try {
        const pid = Number(await readFile(join(path, 'pid'), 'utf8'))
        if (Number.isInteger(pid) && pid > 0) {
          try { process.kill(pid, 0) }
          catch (cause) {
            if ((cause as NodeJS.ErrnoException).code === 'ESRCH') await rm(path, { recursive: true, force: true })
          }
        }
      }
      catch {
        // Allow the creator time to write its PID before recovering an orphan.
        const entry = await stat(path).catch(() => undefined)
        if (entry && Date.now() - entry.mtimeMs > 10_000) await rm(path, { recursive: true, force: true })
      }
      if (Date.now() - started > 20 * 60_000) throw new Error('Timed out waiting for build archive cache')
      await setTimeout(100)
    }
  }
}

async function githubCache(): Promise<ArchiveCacheClient | null> {
  if (process.env.PANTRY_BUILD_CACHE_READY !== 'true') return null
  const cache = await import('@actions/cache')
  return cache.isFeatureAvailable() ? cache : null
}

async function prune(directory: string, maxBytes: number): Promise<void> {
  const entries = await Promise.all((await readdir(directory)).filter(name => /^[a-f0-9]{64}$/.test(name)).map(async name => {
    const path = join(directory, name)
    const info = await stat(join(path, 'archive.tar.gz')).catch(() => undefined)
    return info ? { path, bytes: info.size, time: info.mtimeMs } : undefined
  }))
  const archives = entries.filter(entry => entry !== undefined).sort((a, b) => a.time - b.time)
  let bytes = archives.reduce((total, entry) => total + entry.bytes, 0)
  for (const archive of archives) {
    if (bytes <= maxBytes) break
    await rm(archive.path, { recursive: true, force: true })
    bytes -= archive.bytes
  }
}

async function record(directory: string, label: string, result: BuildArchiveResult, failed = false): Promise<void> {
  const { source, bytes } = result
  console.log(`[build-archive-cache] ${label}: ${source}, ${bytes} bytes, origin=${source === 'origin' ? bytes : 0}, avoided=${source === 'origin' ? 0 : bytes}${failed ? ', failed=true' : ''}`)
  if (process.env.PANTRY_BUILD_CACHE_READY === 'true') {
    await appendFile(join(directory, 'events.jsonl'), `${JSON.stringify({ ...result, label, failed })}\n`)
      .catch(() => console.warn('[build-archive-cache] Could not record traffic counters'))
  }
}

// Metadata is always fetched by the caller. Only immutable bytes with the exact
// manifest digest are reusable; extracted prefixes and signed URLs never enter
// the cache. Each GitHub entry holds one archive, avoiding directory snapshots
// duplicated by every stripe/run. Save immediately, even if the build later fails.
export async function obtainBuildArchive(options: BuildArchiveOptions): Promise<BuildArchiveResult> {
  if (!/^[a-f0-9]{64}$/i.test(options.sha256 || ''))
    throw new ArchiveChecksumError(`${options.label}: dependency archive checksum mismatch or missing`)
  const digest = options.sha256.toLowerCase()
  const directory = options.cacheDir || buildArchiveCacheDir()
  const archive = join(directory, digest, 'archive.tar.gz')
  const key = `pantry-build-archive-v1-${digest}`
  await mkdir(directory, { recursive: true })
  const release = await lock(directory)
  const temporary = join(directory, `download-${randomUUID()}`)
  try {
    for (const name of await readdir(directory)) {
      if (/^download-[a-f0-9-]{36}$/.test(name)) await rm(join(directory, name), { force: true })
    }
    let source: BuildArchiveResult['source'] = 'local'
    const remote = options.remote === undefined ? await githubCache() : options.remote
    if (!await matches(archive, digest)) {
      await rm(dirname(archive), { recursive: true, force: true })
      let restored = false
      if (remote) {
        try {
          restored = await remote.restoreCache([archive], key) === key && await matches(archive, digest)
          if (restored) source = 'github'
        }
        catch { console.warn(`[build-archive-cache] ${options.label}: GitHub restore unavailable; using origin`) }
      }
      if (!restored) {
        await rm(dirname(archive), { recursive: true, force: true })
        try {
          await options.download(temporary)
          if (!await matches(temporary, digest))
            throw new ArchiveChecksumError(`${options.label}: dependency archive checksum mismatch or missing`)
        }
        catch (error) {
          const partial = await stat(temporary).catch(() => undefined)
          await record(directory, options.label, { source: 'origin', bytes: partial?.size || 0 }, true)
          throw error
        }
        await mkdir(dirname(archive), { recursive: true })
        await rename(temporary, archive)
        source = 'origin'
        if (remote) {
          try {
            const id = await remote.saveCache([archive], key)
            if (id <= 0) console.warn(`[build-archive-cache] ${options.label}: GitHub save not accepted (another job may have saved it)`)
          }
          catch { console.warn(`[build-archive-cache] ${options.label}: GitHub save unavailable; retaining local archive`) }
        }
      }
    }
    await mkdir(dirname(options.destination), { recursive: true })
    await copyFile(archive, options.destination)
    const bytes = (await stat(archive)).size
    const now = new Date()
    await utimes(archive, now, now)
    const configuredLimit = options.maxBytes ?? Number(process.env.PANTRY_BUILD_ARCHIVE_CACHE_MAX_BYTES || 4 * 1024 ** 3)
    await prune(directory, Number.isFinite(configuredLimit) && configuredLimit >= 0 ? configuredLimit : 4 * 1024 ** 3)
    const result = { source, bytes }
    await record(directory, options.label, result)
    return result
  }
  finally {
    try { await rm(temporary, { force: true }) }
    finally { await release() }
  }
}
