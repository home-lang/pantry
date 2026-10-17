import { afterAll, expect, test } from 'bun:test'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { isDynamicMachO } from '../scripts/macho'

const directory = mkdtempSync(join(tmpdir(), 'pantry-macho-'))
afterAll(() => rmSync(directory, { recursive: true, force: true }))
let sequence = 0

function thin(kind: number, wide = true, little = true): Buffer {
  const bytes = Buffer.alloc(wide ? 32 : 28)
  bytes.writeUInt32BE(wide ? little ? 0xcffaedfe : 0xfeedfacf : little ? 0xcefaedfe : 0xfeedface)
  if (little) bytes.writeUInt32LE(kind, 12)
  else bytes.writeUInt32BE(kind, 12)
  return bytes
}

function check(bytes: Buffer): boolean {
  const filename = join(directory, `image-${sequence++}`)
  writeFileSync(filename, bytes)
  return isDynamicMachO(filename)
}

test('loader normalization distinguishes executable images from relocatable objects and debug files', () => {
  for (const wide of [true, false]) {
    for (const little of [true, false]) {
      for (const kind of [2, 6, 7, 8]) expect(check(thin(kind, wide, little))).toBe(true)
      for (const kind of [1, 4, 5, 9, 10]) expect(check(thin(kind, wide, little))).toBe(false)
      expect(check(thin(6, wide, little).subarray(0, 20))).toBe(false)
    }
  }
})

test('universal images validate every slice instead of treating Java or static archives as dynamic', () => {
  for (const wide of [true, false]) {
    for (const little of [true, false]) {
      const width = wide ? 32 : 20
      const start = 8 + 2 * width
      const image = Buffer.alloc(start + 64)
      image.writeUInt32BE(wide ? little ? 0xbfbafeca : 0xcafebabf : little ? 0xbebafeca : 0xcafebabe)
      image[little ? 'writeUInt32LE' : 'writeUInt32BE'](2, 4)
      for (let index = 0; index < 2; index++) {
        const table = 8 + index * width
        if (wide) {
          image[little ? 'writeBigUInt64LE' : 'writeBigUInt64BE'](BigInt(start + index * 32), table + 8)
          image[little ? 'writeBigUInt64LE' : 'writeBigUInt64BE'](32n, table + 16)
        }
        else {
          image[little ? 'writeUInt32LE' : 'writeUInt32BE'](start + index * 32, table + 8)
          image[little ? 'writeUInt32LE' : 'writeUInt32BE'](32, table + 12)
        }
        thin(6).copy(image, start + index * 32)
      }
      expect(check(image)).toBe(true)
      thin(1).copy(image, start + 32)
      expect(check(image)).toBe(false)
      expect(check(image.subarray(0, start + 40))).toBe(false)
    }
  }
  const java = Buffer.from('cafebabe0000003d000301000454657374', 'hex')
  expect(check(java)).toBe(false)
  expect(check(Buffer.from('!<arch>\n'))).toBe(false)
  expect(check(Buffer.alloc(0))).toBe(false)
  expect(isDynamicMachO(join(directory, 'absent'))).toBe(false)
})
