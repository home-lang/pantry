import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { createReadStream, writeSync } from 'node:fs'
import { open } from 'node:fs/promises'

export function chromeEnvironments(inherited: NodeJS.ProcessEnv, home: string): { mode: string, environment: NodeJS.ProcessEnv }[] {
  const withoutLibraryPath: NodeJS.ProcessEnv = { ...inherited, LD_DEBUG: 'files' }
  delete withoutLibraryPath.LD_LIBRARY_PATH
  const clean = { HOME: home, PATH: '/usr/bin:/bin', LD_DEBUG: 'files' }
  return [
    { mode: 'inherited-action', environment: { ...inherited, LD_DEBUG: 'files' } },
    { mode: 'inherited-without-library-path', environment: withoutLibraryPath },
    { mode: 'clean-health', environment: clean },
    { mode: 'clean-with-action-library-path', environment: { ...clean, LD_LIBRARY_PATH: inherited.LD_LIBRARY_PATH } },
  ]
}

export function boundedLogWriter(fd: number, limitBytes: number): { consume: (chunk: Buffer) => void, writtenBytes: () => number, exceeded: () => boolean } {
  let written = 0
  let exceeded = false
  return {
    consume(chunk) {
      const accepted = Math.min(chunk.length, Math.max(0, limitBytes - written))
      let offset = 0
      while (offset < accepted) {
        const bytes = writeSync(fd, chunk, offset, accepted - offset)
        assert(bytes > 0, 'Log write made no progress')
        written += bytes
        offset += bytes
      }
      exceeded ||= chunk.length > accepted
    },
    writtenBytes: () => written,
    exceeded: () => exceeded,
  }
}

// Never serialize the complete inherited environment: service credentials remain
// available to the ordinary arm but must not appear in uploaded proof metadata.
export function visibleBrowserEnvironment(environment: NodeJS.ProcessEnv): Record<string, string | null> {
  return Object.fromEntries(['HOME', 'PATH', 'LD_LIBRARY_PATH', 'LD_PRELOAD', 'LD_DEBUG', 'XDG_DATA_HOME', 'XDG_CACHE_HOME', 'XDG_CONFIG_HOME', 'TMPDIR'].map(key => [key, environment[key] ?? null]))
}

export function nssLibraryOrigins(diagnostics: string): string[] {
  return [...new Set([...diagnostics.matchAll(/calling init: (.+)$/gm)]
    .map(match => match[1]!.trim())
    .filter(path => /\/lib(?:nss3|softokn3|freeblpriv3|nssckbi)\.so(?:\.\d+)*$/.test(path)))]
}

export async function sha256(path: string): Promise<string> {
  const hash = createHash('sha256')
  for await (const chunk of createReadStream(path)) hash.update(chunk)
  return hash.digest('hex')
}

export async function elfIdentity(path: string): Promise<object> {
  const file = await open(path, 'r')
  try {
    const header = Buffer.alloc(64)
    assert.equal((await file.read(header, 0, header.length, 0)).bytesRead, header.length, 'Truncated ELF header')
    assert.equal(header.subarray(0, 6).toString('hex'), '7f454c460201', 'Require the original Linux x64 ELF')
    assert.equal(header.readUInt16LE(18), 62)
    const offset = Number(header.readBigUInt64LE(32))
    const size = header.readUInt16LE(54)
    const count = header.readUInt16LE(56)
    assert(size >= 56 && count < 256)
    const table = Buffer.alloc(size * count)
    assert.equal((await file.read(table, 0, table.length, offset)).bytesRead, table.length, 'Truncated ELF program headers')
    const loads: object[] = []
    const buildIds: string[] = []
    let interpreter: string | undefined
    for (let index = 0; index < count; index++) {
      const entry = table.subarray(index * size, (index + 1) * size)
      const type = entry.readUInt32LE(0)
      const fileOffset = Number(entry.readBigUInt64LE(8))
      const fileBytes = Number(entry.readBigUInt64LE(32))
      if (type === 1) loads.push({ flags: entry.readUInt32LE(4), fileOffset, virtualAddress: entry.readBigUInt64LE(16).toString(), fileBytes, memoryBytes: entry.readBigUInt64LE(40).toString() })
      if (type !== 3 && type !== 4) continue
      assert(fileBytes < 1024 * 1024, 'Bound ELF note/interpreter reads')
      const data = Buffer.alloc(fileBytes)
      assert.equal((await file.read(data, 0, data.length, fileOffset)).bytesRead, data.length, 'Truncated ELF note/interpreter')
      if (type === 3) { interpreter = data.toString().replace(/\0+$/, ''); continue }
      for (let cursor = 0; cursor + 12 <= data.length;) {
        const nameBytes = data.readUInt32LE(cursor)
        const descriptionBytes = data.readUInt32LE(cursor + 4)
        const noteType = data.readUInt32LE(cursor + 8)
        cursor += 12
        const name = data.subarray(cursor, cursor + nameBytes).toString().replace(/\0+$/, '')
        cursor += Math.ceil(nameBytes / 4) * 4
        const description = data.subarray(cursor, cursor + descriptionBytes)
        cursor += Math.ceil(descriptionBytes / 4) * 4
        assert(cursor <= data.length, 'Truncated ELF note')
        if (name === 'GNU' && noteType === 3) buildIds.push(description.toString('hex'))
      }
    }
    return { path, sha256: await sha256(path), bytes: (await file.stat()).size, interpreter, buildIds, loads }
  }
  finally { await file.close() }
}
