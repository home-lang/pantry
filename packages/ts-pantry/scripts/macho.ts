import { closeSync, fstatSync, openSync, readSync } from 'node:fs'

/** Runtime Mach-O images only: object files and static universal archives cannot carry RPATHs. */
export function isDynamicMachO(path: string): boolean {
  let file: number | undefined
  try {
    file = openSync(path, 'r')
    const size = fstatSync(file).size
    const header = Buffer.alloc(32)
    const length = readSync(file, header, 0, header.length, 0)
    if (length < 4) return false
    const dynamic = (offset: number, available: number): boolean => {
      const bytes = Buffer.alloc(32)
      const count = readSync(file!, bytes, 0, Math.min(bytes.length, available), offset)
      if (count < 4) return false
      const magic = bytes.readUInt32BE(0)
      const little = magic === 0xcefaedfe || magic === 0xcffaedfe
      if (![0xfeedface, 0xfeedfacf, 0xcefaedfe, 0xcffaedfe].includes(magic)) return false
      if (count < (magic === 0xfeedfacf || magic === 0xcffaedfe ? 32 : 28)) return false
      const kind = little ? bytes.readUInt32LE(12) : bytes.readUInt32BE(12)
      return [2, 6, 7, 8].includes(kind) // MH_EXECUTE, MH_DYLIB, MH_DYLINKER, MH_BUNDLE
    }
    const magic = header.readUInt32BE(0)
    if (![0xcafebabe, 0xbebafeca, 0xcafebabf, 0xbfbafeca].includes(magic)) return dynamic(0, size)
    if (length < 8) return false
    const little = magic === 0xbebafeca || magic === 0xbfbafeca
    const wide = magic === 0xcafebabf || magic === 0xbfbafeca
    const count = little ? header.readUInt32LE(4) : header.readUInt32BE(4)
    // Java class files share CAFEBABE; validate the complete universal-image table.
    const width = wide ? 32 : 20
    const tableEnd = 8 + count * width
    if (!count || count > 64 || tableEnd > size) return false
    for (let index = 0; index < count; index++) {
      const entry = Buffer.alloc(width)
      if (readSync(file, entry, 0, width, 8 + index * width) !== width) return false
      const offset = wide ? Number(little ? entry.readBigUInt64LE(8) : entry.readBigUInt64BE(8)) : little ? entry.readUInt32LE(8) : entry.readUInt32BE(8)
      const extent = wide ? Number(little ? entry.readBigUInt64LE(16) : entry.readBigUInt64BE(16)) : little ? entry.readUInt32LE(12) : entry.readUInt32BE(12)
      if (!Number.isSafeInteger(offset) || !Number.isSafeInteger(extent) || offset < tableEnd || extent < 28 || offset + extent > size || !dynamic(offset, extent)) return false
    }
    return true
  }
  catch { return false }
  finally { if (file !== undefined) closeSync(file) }
}
