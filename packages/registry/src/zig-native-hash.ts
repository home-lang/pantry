import { existsSync, readFileSync } from 'node:fs'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { isAbsolute, join, resolve } from 'node:path'

export const registryZigVersion = '0.17.0'

/** The provisioner records the actual executable from Pantry's normal environment. */
export function managedRegistryZig(root: string = resolve(import.meta.dir, '..')): string | undefined {
  const receipt = join(root, 'pantry/registry-zig-path')
  if (!existsSync(receipt)) return undefined
  const path = readFileSync(receipt, 'utf8').trim()
  return isAbsolute(path) && existsSync(path) ? path : undefined
}

export class ZigPackageHashError extends Error {
  constructor(message: string, readonly status: 422 | 503) { super(message) }
}

async function execute(zig: string, args: string[], cwd: string): Promise<string> {
  let child: Bun.Subprocess<'ignore', 'pipe', 'pipe'>
  try { child = Bun.spawn([zig, ...args], { cwd, stdin: 'ignore', stdout: 'pipe', stderr: 'pipe' }) }
  catch { throw new ZigPackageHashError('The declared native Zig executable is unavailable', 503) }
  let timedOut = false
  const timer = setTimeout(() => {
    timedOut = true
    try { child.kill('SIGKILL') }
    catch { /* The process may have already exited. */ }
  }, 120_000)
  async function read(stream: ReadableStream<Uint8Array>): Promise<string> {
    const reader = stream.getReader()
    const chunks: Uint8Array[] = []
    let size = 0
    try {
      while (true) {
        const item = await reader.read()
        if (item.done) break
        size += item.value.byteLength
        if (size > 64 * 1024) throw new ZigPackageHashError('Native Zig output exceeded its limit', 503)
        chunks.push(item.value)
      }
      return Buffer.concat(chunks).toString('utf8')
    }
    finally { reader.releaseLock() }
  }
  try {
    const [stdout, stderr, code] = await Promise.all([read(child.stdout), read(child.stderr), child.exited])
    if (timedOut) throw new ZigPackageHashError('Native Zig package hashing exceeded its execution budget', 503)
    if (code !== 0) throw new ZigPackageHashError(`Native Zig rejected ${args[0]}: ${stderr.trim()}`, args[0] === 'fetch' ? 422 : 503)
    return stdout.trim()
  }
  catch (error) {
    try { child.kill('SIGKILL') }
    catch { /* Preserve the original failure after an already completed process. */ }
    await child.exited
    throw error
  }
  finally { clearTimeout(timer) }
}

/** Use the compiler's archive and manifest hashing contract without running build.zig. */
export async function computeZigHash(data: ArrayBuffer | Buffer): Promise<string> {
  const zig = process.env.PANTRY_ZIG_BIN || managedRegistryZig() || Bun.which('zig')
  if (!zig) throw new ZigPackageHashError(`The registry requires managed Zig ${registryZigVersion} for package hashing`, 503)
  const directory = await mkdtemp(join(tmpdir(), 'pantry-zig-hash-'))
  try {
    if (await execute(zig, ['version'], directory) !== registryZigVersion)
      throw new ZigPackageHashError(`The registry requires managed Zig ${registryZigVersion} for package hashing`, 503)
    const archive = join(directory, 'package.tar.gz')
    await writeFile(archive, Buffer.isBuffer(data) ? data : Buffer.from(data))
    const hash = await execute(zig, ['fetch', archive], directory)
    if (!validateZigHash(hash)) throw new ZigPackageHashError('The native compiler returned an invalid package hash', 503)
    return hash
  }
  finally { await rm(directory, { recursive: true, force: true }) }
}

/** Native name/version hashes and older compiler content hashes are opaque registry keys. */
export function validateZigHash(hash: string): boolean {
  if (hash.length > 256) return false
  return /^1220[a-f0-9]{64}$/i.test(hash)
    || /^[a-zA-Z0-9_.+-]+-[a-zA-Z0-9_-]{44}$/.test(hash)
}
