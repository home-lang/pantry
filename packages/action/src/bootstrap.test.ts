import { expect, test } from 'bun:test'
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { crc32, deflateRawSync } from 'node:zlib'
import { installBootstrap, readBootstrapBinary } from './bootstrap'
import type { Platform } from './types'

function archive(name: string, bytes: Buffer, method = 8, mode = 0o100755): Buffer {
  const filename = Buffer.from(name)
  const compressed = method === 8 ? deflateRawSync(bytes) : bytes
  const local = Buffer.alloc(30)
  local.writeUInt32LE(0x04034B50)
  local.writeUInt16LE(20, 4)
  local.writeUInt16LE(method, 8)
  local.writeUInt32LE(crc32(bytes), 14)
  local.writeUInt32LE(compressed.length, 18)
  local.writeUInt32LE(bytes.length, 22)
  local.writeUInt16LE(filename.length, 26)
  const central = Buffer.alloc(46)
  central.writeUInt32LE(0x02014B50)
  central.writeUInt16LE(0x0314, 4)
  central.writeUInt16LE(20, 6)
  central.writeUInt16LE(method, 10)
  central.writeUInt32LE(crc32(bytes), 16)
  central.writeUInt32LE(compressed.length, 20)
  central.writeUInt32LE(bytes.length, 24)
  central.writeUInt16LE(filename.length, 28)
  central.writeUInt32LE((mode << 16) >>> 0, 38)
  const end = Buffer.alloc(22)
  end.writeUInt32LE(0x06054B50)
  end.writeUInt16LE(1, 8)
  end.writeUInt16LE(1, 10)
  end.writeUInt32LE(central.length + filename.length, 12)
  end.writeUInt32LE(local.length + filename.length + compressed.length, 16)
  return Buffer.concat([local, filename, compressed, central, filename, end])
}

const binary = Buffer.from('native Pantry executable fixture')
const platform: Platform = { os: 'linux', arch: 'x64', binaryName: 'pantry', assetName: 'pantry-linux-x64.zip' }

test('decodes the exact native executable from stored and deflated release ZIPs', () => {
  for (const name of ['pantry', 'pantry.exe']) {
    for (const method of [0, 8]) expect(readBootstrapBinary(archive(name, binary, method), name)).toEqual(binary)
  }
})

test('rejects foreign paths, symlinks, encrypted entries, corrupt and oversized ZIPs', () => {
  for (const name of ['../pantry', '/pantry', 'dir/pantry', 'pantry.exe'])
    expect(() => readBootstrapBinary(archive(name, binary), 'pantry')).toThrow()
  expect(() => readBootstrapBinary(archive('pantry', binary, 8, 0o120777), 'pantry')).toThrow()
  expect(() => readBootstrapBinary(Buffer.from('truncated'), 'pantry')).toThrow()
  const encrypted = archive('pantry', binary)
  encrypted.writeUInt16LE(1, 6)
  expect(() => readBootstrapBinary(encrypted, 'pantry')).toThrow()
  const corrupt = archive('pantry', binary, 0)
  corrupt[36] = corrupt[36]! ^ 1
  expect(() => readBootstrapBinary(corrupt, 'pantry')).toThrow('checksum')
  const oversized = archive('pantry', binary)
  const central = oversized.readUInt32LE(oversized.length - 6)
  oversized.writeUInt32LE(65 * 1024 * 1024, central + 24)
  expect(() => readBootstrapBinary(oversized, 'pantry')).toThrow()
  const empty = archive('pantry', binary)
  empty.writeUInt16LE(0, empty.length - 12)
  expect(() => readBootstrapBinary(empty, 'pantry')).toThrow('exactly one')
})

test('installs atomically, verifies cached bytes and never trusts a corrupt cache', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'pantry bootstrap cache '))
  let downloads = 0
  const options = {
    version: '0.11.93', platform, toolCache: directory, temporaryDirectory: directory,
    fetchArchive: async (url: string) => {
      expect(url).toBe('https://github.com/pantry-pm/pantry/releases/download/v0.11.93/pantry-linux-x64.zip')
      downloads++
      return archive('pantry', binary)
    },
  }
  try {
    const [first, second] = await Promise.all([installBootstrap(options), installBootstrap(options)])
    expect(first).toBe(second)
    expect(readFileSync(join(first, 'pantry'))).toEqual(binary)
    expect(await installBootstrap(options)).toBe(first)
    expect(downloads).toBe(2)
    expect(readdirSync(join(directory, 'pantry-cli', '0.11.93'))).toEqual(['x64'])
    writeFileSync(join(first, 'pantry'), 'corrupt')
    await expect(installBootstrap(options)).rejects.toThrow('integrity mismatch')
    expect(readFileSync(join(first, 'pantry'), 'utf8')).toBe('corrupt')
  }
  finally { rmSync(directory, { recursive: true, force: true }) }
})

test('rolling releases use private staging without persisting a stale version cache', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'pantry bootstrap rolling '))
  try {
    const output = await installBootstrap({ version: 'main', platform, toolCache: directory, temporaryDirectory: directory,
      fetchArchive: async (url) => {
        expect(url).toBe('https://github.com/pantry-pm/pantry/releases/latest/download/pantry-linux-x64.zip')
        return archive('pantry', binary)
      } })
    expect(output.startsWith(join(directory, '.pantry-bootstrap-'))).toBe(true)
    expect(readFileSync(join(output, 'pantry'))).toEqual(binary)
    expect(readdirSync(directory)).toHaveLength(1)
  }
  finally { rmSync(directory, { recursive: true, force: true }) }
})
