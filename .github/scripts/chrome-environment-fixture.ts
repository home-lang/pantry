import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { createReadStream, writeSync } from 'node:fs'
import { open } from 'node:fs/promises'

export interface ChromeComparisonCase {
  mode: string
  environment: NodeJS.ProcessEnv
  addressSpaceKiB?: number | null
  enforcement?: boolean
}

export function chromeAddressSpaceCases(inherited: NodeJS.ProcessEnv): ChromeComparisonCase[] {
  return [
    { mode: 'normal-address-space', addressSpaceKiB: null },
    { mode: 'eight-gib-address-space', addressSpaceKiB: 8388608 },
    { mode: 'two-tib-address-space', addressSpaceKiB: 2147483648 },
    { mode: 'two-tib-enforcement', addressSpaceKiB: 2147483648, enforcement: true },
  ].map(entry => ({ ...entry, environment: { ...inherited, LD_DEBUG: 'files' } }))
}

export function addressSpaceArgv(capKiB: number | null, limitsPath: string, program: string[]): string[] {
  assert(capKiB === null || (Number.isSafeInteger(capKiB) && capKiB > 0))
  assert(program.length > 0)
  // All three Chrome arms execute the identical shell. Paths and browser
  // arguments are positional parameters, never interpolated shell source.
  return ['/bin/sh', '-c', 'set -eu\ncap=$1\nlimits=$2\nshift 2\nulimit -c 0\nif [ "$cap" != normal ]; then ulimit -v "$cap"; fi\nwhile IFS= read -r line; do printf "%s\\n" "$line"; done < /proc/self/limits > "$limits"\nexec "$@"', 'pantry-address-space', capKiB === null ? 'normal' : String(capKiB), limitsPath, ...program]
}

export function addressSpaceLimit(limits: string): { soft: string, hard: string } {
  const match = /^Max address space\s+(\S+)\s+(\S+)\s+bytes\s*$/m.exec(limits)
  assert(match, 'Missing actual /proc/self/limits address-space row')
  return { soft: match[1]!, hard: match[2]! }
}

// Invoked only as a separate Linux child after the finite candidate rendered.
// mmap(PROT_NONE, MAP_NORESERVE) reserves address names, never touches their pages.
// No compilation, native toolchain, or physical-memory stress is involved.
async function probeAddressSpaceEnforcement(): Promise<void> {
  assert.equal(process.platform, 'linux')
  assert.equal(process.arch, 'x64')
  assert.notEqual(process.getuid?.(), 0)
  const { dlopen, read } = await import('bun:ffi')
  const libc = dlopen('libc.so.6', {
    getrlimit: { args: ['i32', 'ptr'], returns: 'i32' },
    setrlimit: { args: ['i32', 'ptr'], returns: 'i32' },
    mmap: { args: ['ptr', 'u64', 'i32', 'i32', 'i32', 'i64'], returns: 'u64' },
    munmap: { args: ['u64', 'u64'], returns: 'i32' },
    __errno_location: { args: [], returns: 'u64' },
  })
  try {
    const limit = 2199023255552n
    const limits = (): { soft: string, hard: string } => {
      const buffer = Buffer.alloc(16)
      assert.equal(libc.symbols.getrlimit(9, buffer), 0)
      return { soft: buffer.readBigUInt64LE(0).toString(), hard: buffer.readBigUInt64LE(8).toString() }
    }
    const errno = (): number => read.i32(libc.symbols.__errno_location())
    const before = limits()
    assert.deepEqual(before, { soft: '2199023255552', hard: '2199023255552' })
    const mapFailed = 18446744073709551615n
    const small = libc.symbols.mmap(null, 67108864n, 0, 0x4022, -1, 0)
    assert.notEqual(small, mapFailed, 'A small PROT_NONE reservation must succeed')
    assert.equal(libc.symbols.munmap(small, 67108864n), 0)
    const oversized = libc.symbols.mmap(null, 3298534883328n, 0, 0x4022, -1, 0)
    const oversizedErrno = errno()
    if (oversized !== mapFailed) assert.equal(libc.symbols.munmap(oversized, 3298534883328n), 0)
    assert.equal(oversized, mapFailed, 'A 3 TiB reservation must fail under the finite 2 TiB cap')
    assert.equal(oversizedErrno, 12, 'Oversize reservation must fail with ENOMEM')
    const raised = Buffer.alloc(16)
    raised.writeBigUInt64LE(limit + 4096n, 0)
    raised.writeBigUInt64LE(limit + 4096n, 8)
    const raiseResult = libc.symbols.setrlimit(9, raised)
    const raiseErrno = errno()
    assert.equal(raiseResult, -1, 'An unprivileged child must not raise its inherited hard cap')
    assert.equal(raiseErrno, 1, 'Raising the hard cap must fail with EPERM')
    const after = limits()
    assert.deepEqual(after, before)
    console.log(JSON.stringify({ passed: true, before, after, smallReservationBytes: '67108864', smallReservationReleased: true, oversizedReservationBytes: '3298534883328', oversizedRejected: true, oversizedErrno, hardCapRaiseRejected: true, raiseErrno, protection: 'PROT_NONE', mapping: 'MAP_PRIVATE|MAP_ANONYMOUS|MAP_NORESERVE', reservedPagesTouched: false }))
  }
  finally { libc.close() }
}

export function chromeEnvironments(inherited: NodeJS.ProcessEnv, home: string): ChromeComparisonCase[] {
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

if (import.meta.main) {
  assert.equal(process.argv[2], '--probe-address-space-enforcement')
  await probeAddressSpaceEnforcement()
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
