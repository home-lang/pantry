import { chmodSync, copyFileSync, existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, realpathSync, statSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { basename, dirname, join, relative, sep } from 'node:path'

export interface RuntimePackage { domain: string, version: string, prefix: string }
export interface RuntimeLibraryReceipt { name: string, domain: string, version: string, source: string, sourceSha256: string, licenseFiles: string[] }

const linuxStandardLibraries = /^(?:lib(?:c|m|dl|pthread|rt|resolv|util|anl)\.so\.[0-9]+|libstdc\+\+\.so\.6|libgcc_s\.so\.1|ld-linux[^/]*\.so\.[0-9]+|ld-musl[^/]*\.so\.[0-9]+)$/
const hash = (file: string) => createHash('sha256').update(readFileSync(file)).digest('hex')
const inside = (root: string, path: string) => path === root || path.startsWith(root + sep)

function walk(directory: string, visit: (file: string) => void): void {
  if (!existsSync(directory) || lstatSync(directory).isSymbolicLink()) return
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.name.endsWith('.app')) continue
    const path = join(directory, entry.name)
    if (entry.isDirectory()) walk(path, visit)
    else if (entry.isFile() || (entry.isSymbolicLink() && statSync(path).isFile())) visit(path)
  }
}

function preserveLicenses(prefix: string, dependency: RuntimePackage): string[] {
  const files: string[] = []
  const root = realpathSync(dependency.prefix)
  const copy = (source: string): void => {
    if (!inside(root, realpathSync(source))) throw new Error(`License escapes declared runtime package ${dependency.domain}`)
    const name = relative(root, source)
    if (!/(?:^|\/)(?:licen[sc]e|copying|copyright|notice)(?:[.\-_].*)?$/i.test(name)) return
    const destination = join(prefix, 'share/licenses/pantry-runtime', encodeURIComponent(`${dependency.domain}@${dependency.version}`), name)
    mkdirSync(dirname(destination), { recursive: true })
    copyFileSync(source, destination)
    files.push(relative(prefix, destination).split(sep).join('/'))
  }
  for (const file of readdirSync(root, { withFileTypes: true })) if (file.isFile()) copy(join(root, file.name))
  for (const folder of ['share/licenses', 'share/doc']) walk(join(root, folder), copy)
  return files
}

/** Copy the actual recursively required SONAMEs from declared runtime packages only. */
export function bundleRuntimeLibraries(
  prefix: string,
  platform: string,
  dependencies: RuntimePackage[],
  isBinary: (file: string) => boolean,
  patchelf = 'patchelf',
): RuntimeLibraryReceipt[] {
  const linux = platform.startsWith('linux-')
  const root = realpathSync(prefix)
  const index = new Map<string, { file: string, dependency?: RuntimePackage }[]>()
  const queue: string[] = []
  const receipts: RuntimeLibraryReceipt[] = []
  const licenses = new Map<string, string[]>()
  const register = (directory: string, dependency?: RuntimePackage): void => {
    const owner = realpathSync(directory)
    const manifest = join(owner, 'share/pantry/runtime-libraries.json')
    const bundled: Array<RuntimeLibraryReceipt & { bundledSha256: string }> = dependency && existsSync(manifest)
      ? JSON.parse(readFileSync(manifest, 'utf8')).libraries
      : []
    for (const part of ['lib', 'lib64']) walk(join(owner, part), (file) => {
      const actual = realpathSync(file)
      if (!inside(owner, actual)) throw new Error(`Library escapes declared runtime package: ${file}`)
      if (!isBinary(actual)) return
      // A dependency can already carry a normalized copy of another declared
      // package. Loader-path rewrites change its hash without creating a new
      // provider. Verify the complete provenance chain, then index the original
      // package instead of falsely treating that copy as a conflicting ABI.
      const receipt = bundled.find(library => actual === join(owner, 'lib', library.name))
      if (receipt) {
        if (hash(actual) !== receipt.bundledSha256) throw new Error(`Invalid bundled runtime provenance for ${receipt.name}`)
        const canonical = dependencies.find(pkg => pkg.domain === receipt.domain && pkg.version === receipt.version)
        if (canonical) {
          const sourceRoot = realpathSync(canonical.prefix)
          const source = realpathSync(join(sourceRoot, receipt.source))
          if (!inside(sourceRoot, source) || hash(source) !== receipt.sourceSha256)
            throw new Error(`Invalid canonical runtime provenance for ${receipt.name}`)
          return
        }
      }
      const entries = index.get(basename(file)) || []
      if (!entries.some(entry => entry.file === actual)) entries.push({ file: actual, dependency })
      index.set(basename(file), entries)
    })
  }
  register(root)
  for (const dependency of dependencies) register(dependency.prefix, dependency)
  for (const part of ['bin', 'sbin', 'lib', 'lib64', 'libexec']) walk(join(root, part), (file) => {
    if (!lstatSync(file).isSymbolicLink() && isBinary(file)) queue.push(file)
  })
  const visited = new Set<string>()
  for (let position = 0; position < queue.length; position++) {
    const file = queue[position]
    if (visited.has(file)) continue
    visited.add(file)
    const needed = linux
      ? execFileSync(patchelf, ['--print-needed', file], { encoding: 'utf8' }).trim().split('\n').filter(Boolean)
      : execFileSync('otool', ['-L', file], { encoding: 'utf8' }).trim().split('\n').slice(1).map(line => line.trim().replace(/\s+\(.*$/, '')).filter(Boolean)
    const ownInstallName = linux ? undefined : execFileSync('otool', ['-D', file], { encoding: 'utf8' }).trim().split('\n')[1]?.trim()
    for (const dependencyName of needed) {
      if (dependencyName === ownInstallName) continue
      if (!linux && (dependencyName.startsWith('/usr/lib/') || dependencyName.startsWith('/System/Library/'))) continue
      const name = basename(dependencyName)
      const candidates = index.get(name) || []
      if (candidates.length === 0 && linux && linuxStandardLibraries.test(name)) continue
      if (candidates.length === 0) throw new Error(`Undeclared or missing runtime library ${dependencyName} required by ${relative(root, file)}`)
      const selected = candidates.find(candidate => inside(root, candidate.file)) || candidates[0]
      if (!inside(root, selected.file) && candidates.some(candidate => hash(candidate.file) !== hash(selected.file)))
        throw new Error(`Conflicting declared runtime providers for ${name}`)
      const destination = join(root, 'lib', name)
      mkdirSync(dirname(destination), { recursive: true })
      if (!existsSync(destination)) {
        copyFileSync(selected.file, destination)
        chmodSync(destination, 0o755)
        if (selected.dependency) {
          const identity = `${selected.dependency.domain}@${selected.dependency.version}`
          if (!licenses.has(identity)) licenses.set(identity, preserveLicenses(root, selected.dependency))
          receipts.push({ name, domain: selected.dependency.domain, version: selected.dependency.version, source: relative(realpathSync(selected.dependency.prefix), selected.file).split(sep).join('/'), sourceSha256: hash(selected.file), licenseFiles: licenses.get(identity)! })
        }
      }
      else if (!inside(root, realpathSync(destination))) throw new Error(`Bundled runtime library escapes artifact: ${name}`)
      queue.push(destination)
      if (linux && dependencyName !== name)
        execFileSync(patchelf, ['--replace-needed', dependencyName, name, file], { stdio: 'pipe' })
      if (!linux && dependencyName !== `@rpath/${name}`)
        execFileSync('install_name_tool', ['-change', dependencyName, `@rpath/${name}`, file], { stdio: 'pipe' })
    }
  }
  return receipts
}

/** Normalize loader paths without searching or copying any host libraries. */
export function normalizeMachoRuntime(prefix: string, isBinary: (file: string) => boolean): void {
  for (const part of ['bin', 'sbin', 'lib', 'lib64', 'libexec']) walk(join(prefix, part), (file) => {
    if (lstatSync(file).isSymbolicLink() || !isBinary(file)) return
    const commands = execFileSync('otool', ['-l', file], { encoding: 'utf8' })
    const existing = [...commands.matchAll(/cmd LC_RPATH\s+cmdsize \d+\s+path (.+?) \(offset/g)].map(match => match[1])
    const wanted = ['lib', 'lib64'].filter(lib => existsSync(join(prefix, lib))).map((lib) => {
      const path = relative(dirname(file), join(prefix, lib)).split(sep).join('/')
      return path ? `@loader_path/${path}` : '@loader_path'
    })
    for (const path of new Set(existing)) if (!wanted.includes(path)) execFileSync('install_name_tool', ['-delete_rpath', path, file], { stdio: 'pipe' })
    for (const path of wanted) if (!existing.includes(path)) execFileSync('install_name_tool', ['-add_rpath', path, file], { stdio: 'pipe' })
    const id = execFileSync('otool', ['-D', file], { encoding: 'utf8' }).trim().split('\n')[1]
    if (id) execFileSync('install_name_tool', ['-id', `@rpath/${basename(file)}`, file], { stdio: 'pipe' })
    execFileSync('codesign', ['--force', '--sign', '-', file], { stdio: 'pipe' })
  })
}

export function writeRuntimeProvenance(prefix: string, libraries: RuntimeLibraryReceipt[]): void {
  if (!libraries.length) return
  const destination = join(prefix, 'share/pantry/runtime-libraries.json')
  mkdirSync(dirname(destination), { recursive: true })
  writeFileSync(destination, JSON.stringify({ version: 1, libraries: libraries.map(library => ({ ...library, bundledSha256: hash(join(prefix, 'lib', library.name)) })) }, null, 2) + '\n')
}
