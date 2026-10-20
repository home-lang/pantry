import { expect, test } from 'bun:test'
import { mkdtemp, open, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { boundedLogWriter, chromeEnvironments, elfIdentity, nssLibraryOrigins, visibleBrowserEnvironment } from '../../../.github/scripts/chrome-environment-fixture'

test('diagnostic files stop at their byte cap across chunks and surface write failures', async () => {
  const root = await mkdtemp(join(tmpdir(), 'pantry log cap '))
  const path = join(root, 'bounded.log')
  const file = await open(path, 'w')
  try {
    const writer = boundedLogWriter(file.fd, 7)
    writer.consume(Buffer.from('abc'))
    expect(writer.exceeded()).toBe(false)
    writer.consume(Buffer.from('defghijk'))
    writer.consume(Buffer.from('discarded'))
    expect(writer.writtenBytes()).toBe(7)
    expect(writer.exceeded()).toBe(true)
    expect(await readFile(path, 'utf8')).toBe('abcdefg')
    expect(() => boundedLogWriter(-1, 7).consume(Buffer.from('failure'))).toThrow()
  }
  finally { await file.close(); await rm(root, { recursive: true, force: true }) }
})

test('loader evidence retains package and external NSS providers with spaces before health validation', () => {
  const diagnostics = '42: calling init: /native Chrome/lib/libnss3.so\n43: calling init: /shared NSS/lib/libsoftokn3.so\n44: calling init: /native Chrome/lib/libfreeblpriv3.so\n45: calling init: /native Chrome/lib/libnssckbi.so\n46: calling init: /native Chrome/lib/libfreeblpriv3.so\n47: calling init: /lib/libother.so\n'
  expect(nssLibraryOrigins(diagnostics)).toEqual(['/native Chrome/lib/libnss3.so', '/shared NSS/lib/libsoftokn3.so', '/native Chrome/lib/libfreeblpriv3.so', '/native Chrome/lib/libnssckbi.so'])
})

test('ordinary Action inheritance stays intact while the clean control and uploaded metadata exclude credentials', () => {
  const inherited = { HOME: '/runner', PATH: '/native/bin:/usr/bin', LD_LIBRARY_PATH: '/native/alpha/lib:/native/beta/lib', XDG_CACHE_HOME: '/runner/cache', POSTGRES_URL: 'private-postgres', TYPESENSE_API_KEY: 'private-typesense' }
  const before = { ...inherited }
  const [ordinary, ordinaryWithoutLibraryPath, control, controlWithLibraryPath] = chromeEnvironments(inherited, '/disposable')
  expect(ordinary!.environment).toEqual({ ...inherited, LD_DEBUG: 'files' })
  expect(control!.environment).toEqual({ HOME: '/disposable', PATH: '/usr/bin:/bin', LD_DEBUG: 'files' })
  expect(ordinaryWithoutLibraryPath!.environment).toEqual({ HOME: '/runner', PATH: '/native/bin:/usr/bin', XDG_CACHE_HOME: '/runner/cache', POSTGRES_URL: 'private-postgres', TYPESENSE_API_KEY: 'private-typesense', LD_DEBUG: 'files' })
  expect(controlWithLibraryPath!.environment).toEqual({ HOME: '/disposable', PATH: '/usr/bin:/bin', LD_DEBUG: 'files', LD_LIBRARY_PATH: '/native/alpha/lib:/native/beta/lib' })
  expect(inherited).toEqual(before)
  const metadata = visibleBrowserEnvironment(ordinary!.environment)
  expect(metadata.LD_LIBRARY_PATH).toBe('/native/alpha/lib:/native/beta/lib')
  expect(metadata.XDG_CACHE_HOME).toBe('/runner/cache')
  expect(metadata.LD_PRELOAD).toBeNull()
  expect(JSON.stringify(metadata)).not.toContain('private-postgres')
  expect(JSON.stringify(metadata)).not.toContain('private-typesense')
  expect(visibleBrowserEnvironment(control!.environment).LD_LIBRARY_PATH).toBeNull()
})

test('static ELF evidence distinguishes file offsets and virtual addresses and rejects truncated input without executing it', async () => {
  const root = await mkdtemp(join(tmpdir(), 'pantry ELF fixture '))
  try {
    // ELF64 little-endian x86-64: one PT_LOAD, GNU build-id note, interpreter.
    const fixture = Buffer.alloc(512)
    fixture.set([0x7F, 0x45, 0x4C, 0x46, 2, 1])
    fixture.writeUInt16LE(62, 18)
    fixture.writeBigUInt64LE(64n, 32)
    fixture.writeUInt16LE(56, 54)
    fixture.writeUInt16LE(3, 56)
    fixture.writeUInt32LE(1, 64)
    fixture.writeUInt32LE(5, 68)
    fixture.writeBigUInt64LE(4096n, 72)
    fixture.writeBigUInt64LE(8192n, 80)
    fixture.writeBigUInt64LE(123n, 96)
    fixture.writeBigUInt64LE(456n, 104)
    fixture.writeUInt32LE(4, 120)
    fixture.writeBigUInt64LE(256n, 128)
    fixture.writeBigUInt64LE(20n, 152)
    fixture.writeUInt32LE(3, 176)
    fixture.writeBigUInt64LE(288n, 184)
    const interpreter = Buffer.from('/lib64/ld-linux-x86-64.so.2\0')
    fixture.writeBigUInt64LE(BigInt(interpreter.length), 208)
    fixture.writeUInt32LE(4, 256)
    fixture.writeUInt32LE(4, 260)
    fixture.writeUInt32LE(3, 264)
    fixture.write('GNU\0', 268)
    fixture.set([0xDE, 0xAD, 0xBE, 0xEF], 272)
    fixture.set(interpreter, 288)
    const path = join(root, 'not-executable.elf')
    await writeFile(path, fixture, { mode: 0o600 })
    const identity = await elfIdentity(path)
    expect(identity).toMatchObject({ bytes: 512, interpreter: '/lib64/ld-linux-x86-64.so.2', buildIds: ['deadbeef'], loads: [{ flags: 5, fileOffset: 4096, virtualAddress: '8192', fileBytes: 123, memoryBytes: '456' }] })
    expect(await readFile(path)).toEqual(fixture)
    for (const [bytes, message] of [[32, 'Truncated ELF header'], [100, 'Truncated ELF program headers'], [260, 'Truncated ELF note/interpreter']] as const) {
      await writeFile(path, fixture.subarray(0, bytes))
      await expect(elfIdentity(path)).rejects.toThrow(message)
    }
    const malformed = Buffer.from(fixture)
    malformed.writeUInt32LE(1024, 260)
    await writeFile(path, malformed)
    await expect(elfIdentity(path)).rejects.toThrow('Truncated ELF note')
  }
  finally { await rm(root, { recursive: true, force: true }) }
})
