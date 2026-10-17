import { afterEach, expect, test } from 'bun:test'
import { chmodSync, mkdirSync, mkdtempSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fixUp } from '../scripts/fix-up'

let directory: string | undefined
afterEach(() => { if (directory) rmSync(directory, { recursive: true, force: true }) })

test('publication refuses a dynamic ELF when its loader cannot be normalized', async () => {
  directory = mkdtempSync(join(tmpdir(), 'pantry-required-elf-'))
  mkdirSync(join(directory, 'bin'))
  const elf = Buffer.alloc(120)
  elf.set([0x7f, 0x45, 0x4c, 0x46, 2, 1, 1])
  elf.writeUInt16LE(3, 16)
  elf.writeBigUInt64LE(64n, 32)
  elf.writeUInt16LE(56, 54)
  elf.writeUInt16LE(1, 56)
  elf.writeUInt32LE(2, 64)
  const artifact = join(directory, 'bin', 'openssl')
  writeFileSync(artifact, elf)
  chmodSync(artifact, 0o555)
  // This header-only fixture has a PT_DYNAMIC but no dynamic string table;
  // even a real installed patchelf cannot safely rewrite it.
  await expect(fixUp(directory, 'linux-x86-64')).rejects.toThrow('Cannot normalize ELF loader paths')
  expect(statSync(artifact).mode & 0o777).toBe(0o555)
})

test('macOS publication preserves read-only compiler object files without running loader edits on them', async () => {
  directory = mkdtempSync(join(tmpdir(), 'pantry-python-object-'))
  const configuration = join(directory, 'lib', 'python3.12', 'config-3.12-darwin')
  mkdirSync(configuration, { recursive: true })
  const header = Buffer.alloc(32)
  header.writeUInt32LE(0xfeedfacf)
  header.writeUInt32LE(1, 12) // MH_OBJECT, the real CPython python.o failure.
  const artifact = join(configuration, 'python.o')
  writeFileSync(artifact, header)
  chmodSync(artifact, 0o555)
  await fixUp(directory, 'darwin-arm64')
  expect(statSync(artifact).mode & 0o777).toBe(0o555)
})
