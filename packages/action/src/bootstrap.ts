import { createHash } from 'node:crypto'
import { constants, accessSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { crc32, inflateRawSync } from 'node:zlib'
import { downloadReleaseAssetReliably } from './release-download'
import type { Platform } from './types'

const MAX_BINARY_BYTES = 64 * 1024 * 1024

/** Pantry publishes one native executable per ZIP; never extract arbitrary paths. */
export function readBootstrapBinary(bytes: Uint8Array, binaryName: string): Buffer {
  const archive = Buffer.from(bytes)
  if (!['pantry', 'pantry.exe'].includes(binaryName) || archive.length > MAX_BINARY_BYTES)
    throw new Error('Invalid Pantry bootstrap archive')
  let end = archive.length - 22
  const minimum = Math.max(0, end - 65535)
  for (; end >= minimum; end--) {
    if (archive.readUInt32LE(end) === 0x06054B50 && end + 22 + archive.readUInt16LE(end + 20) === archive.length) break
  }
  if (end < minimum || archive.readUInt16LE(end + 4) !== 0 || archive.readUInt16LE(end + 6) !== 0
    || archive.readUInt16LE(end + 8) !== 1 || archive.readUInt16LE(end + 10) !== 1)
    throw new Error('Pantry bootstrap ZIP must contain exactly one executable')
  const central = archive.readUInt32LE(end + 16)
  const centralSize = archive.readUInt32LE(end + 12)
  if (central + centralSize !== end || centralSize < 46 || archive.readUInt32LE(central) !== 0x02014B50)
    throw new Error('Invalid Pantry bootstrap ZIP directory')
  const flags = archive.readUInt16LE(central + 8)
  const method = archive.readUInt16LE(central + 10)
  const checksum = archive.readUInt32LE(central + 16)
  const compressedSize = archive.readUInt32LE(central + 20)
  const size = archive.readUInt32LE(central + 24)
  const nameLength = archive.readUInt16LE(central + 28)
  const extraLength = archive.readUInt16LE(central + 30)
  const commentLength = archive.readUInt16LE(central + 32)
  const mode = (archive.readUInt32LE(central + 38) >>> 16) & 0o170000
  const local = archive.readUInt32LE(central + 42)
  if ((flags & 1) || ![0, 8].includes(method) || size < 1 || size > MAX_BINARY_BYTES
    || ![0, 0o100000].includes(mode) || local !== 0 || archive.readUInt16LE(central + 34) !== 0
    || 46 + nameLength + extraLength + commentLength !== centralSize
    || archive.subarray(central + 46, central + 46 + nameLength).toString() !== binaryName
    || archive.readUInt32LE(local) !== 0x04034B50 || archive.readUInt16LE(local + 6) !== flags
    || archive.readUInt16LE(local + 8) !== method || archive.readUInt16LE(local + 26) !== nameLength
    || archive.subarray(local + 30, local + 30 + nameLength).toString() !== binaryName)
    throw new Error('Pantry bootstrap ZIP contains an unexpected entry')
  if (!(flags & 8) && (archive.readUInt32LE(local + 14) !== checksum
    || archive.readUInt32LE(local + 18) !== compressedSize || archive.readUInt32LE(local + 22) !== size))
    throw new Error('Pantry bootstrap ZIP headers disagree')
  const start = local + 30 + nameLength + archive.readUInt16LE(local + 28)
  if (start + compressedSize > central) throw new Error('Truncated Pantry bootstrap ZIP')
  const compressed = archive.subarray(start, start + compressedSize)
  const binary = method === 8 ? inflateRawSync(compressed, { maxOutputLength: size }) : compressed
  if (binary.length !== size || crc32(binary) !== checksum) throw new Error('Pantry bootstrap ZIP checksum mismatch')
  return binary
}

function digest(bytes: Uint8Array): string {
  return createHash('sha256').update(bytes).digest('hex')
}

async function download(url: string): Promise<Uint8Array> {
  const response = await fetch(url, { signal: AbortSignal.timeout(120_000) })
  if (!response.ok) throw Object.assign(new Error(`HTTP response ${response.status} downloading Pantry`), { status: response.status })
  if (!response.body) throw new Error('Pantry release download has no body')
  const reader = response.body.getReader()
  const chunks: Uint8Array[] = []
  let size = 0
  try {
    while (true) {
      const next = await reader.read()
      if (next.done) break
      size += next.value.byteLength
      if (size > MAX_BINARY_BYTES) throw new Error('Pantry release archive exceeds the bootstrap size limit')
      chunks.push(next.value)
    }
  }
  catch (error) {
    await reader.cancel().catch(() => {})
    throw error
  }
  finally { reader.releaseLock() }
  return Buffer.concat(chunks)
}

export interface BootstrapOptions {
  version: string
  platform: Platform
  toolCache?: string
  temporaryDirectory?: string
  fetchArchive?: (url: string) => Promise<Uint8Array>
  onRetry?: (message: string) => void
}

/** Node-only first-party bootstrap; works before Pantry or Bun is installed. */
export async function installBootstrap(options: BootstrapOptions): Promise<string> {
  const { version, platform } = options
  const toolCache = options.toolCache ?? process.env.RUNNER_TOOL_CACHE
  const exact = /^\d+\.\d+\.\d+(?:-[\da-z.-]+)?$/i.test(version)
  const target = exact && toolCache ? join(toolCache, 'pantry-cli', version, platform.arch) : undefined
  const markerName = '.pantry-bootstrap.json'
  const find = (): string | undefined => {
    if (!target || !existsSync(target)) return undefined
    const binary = join(target, platform.binaryName)
    const marker = join(target, markerName)
    if (!lstatSync(target).isDirectory() || lstatSync(target).isSymbolicLink()
      || !lstatSync(binary).isFile() || lstatSync(binary).isSymbolicLink()
      || !lstatSync(marker).isFile() || lstatSync(marker).isSymbolicLink())
      throw new Error('Invalid Pantry bootstrap cache ownership')
    const saved = JSON.parse(readFileSync(marker, 'utf8'))
    if (saved.version !== version || saved.arch !== platform.arch || saved.os !== platform.os
      || saved.binary !== platform.binaryName || saved.sha256 !== digest(readFileSync(binary)))
      throw new Error('Pantry bootstrap cache integrity mismatch')
    accessSync(binary, platform.os === 'windows' ? constants.R_OK : constants.X_OK)
    return target
  }
  const cached = find()
  if (cached) return cached
  const url = exact
    ? `https://github.com/pantry-pm/pantry/releases/download/v${version}/${platform.assetName}`
    : `https://github.com/pantry-pm/pantry/releases/latest/download/${platform.assetName}`
  const archive = await downloadReleaseAssetReliably(`Pantry ${version} ${platform.os}-${platform.arch} release asset`,
    () => (options.fetchArchive ?? download)(url), { onRetry: options.onRetry })
  const binary = readBootstrapBinary(archive, platform.binaryName)
  const parent = target ? join(toolCache!, 'pantry-cli', version) : options.temporaryDirectory ?? process.env.RUNNER_TEMP ?? tmpdir()
  mkdirSync(parent, { recursive: true })
  const stage = mkdtempSync(join(parent, '.pantry-bootstrap-'))
  let retained = false
  try {
    writeFileSync(join(stage, platform.binaryName), binary, { mode: 0o755, flag: 'wx' })
    writeFileSync(join(stage, markerName), JSON.stringify({ version, os: platform.os, arch: platform.arch, binary: platform.binaryName, sha256: digest(binary) }), { mode: 0o600, flag: 'wx' })
    if (!target) { retained = true; return stage }
    try { renameSync(stage, target) }
    catch (error) {
      if (!['EEXIST', 'ENOTEMPTY', 'EPERM'].includes((error as NodeJS.ErrnoException).code || '') || !existsSync(target)) throw error
      // Another invocation may have atomically installed the exact same CLI.
      // Its completed, hashed cache must verify before we use it.
      if (!find()) throw error
    }
    return find()!
  }
  finally {
    if (!retained) rmSync(stage, { recursive: true, force: true })
  }
}
