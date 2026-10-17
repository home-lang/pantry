#!/usr/bin/env bun

/**
 * Fix-up — Post-build binary fixing for relocatable packages
 *
 * Ported from brewkit's lib/porcelain/fix-up.ts
 * Ensures built binaries work when installed to any prefix.
 */

import { chmodSync, existsSync, readdirSync, readFileSync, writeFileSync, unlinkSync, mkdirSync, statSync, lstatSync, realpathSync, openSync, readSync, closeSync } from 'node:fs'
import { execFileSync, execSync } from 'node:child_process'
import { join, relative, dirname, extname, basename, sep } from 'node:path'
import { bundleRuntimeLibraries, normalizeMachoRuntime, writeRuntimeProvenance, type RuntimePackage } from './native-runtime'

/**
 * Run all post-build fix-ups on a package prefix
 */
export async function fixUp(prefix: string, platform: string, skips: string[] = [], runtimeDependencies: RuntimePackage[] = []): Promise<void> {
  const [os] = platform.split('-')
  const osName = os === 'darwin' ? 'darwin' : 'linux'
  const originalModes = new Map<string, number>()
  const isBinary = osName === 'linux' ? isDynamicElf : isMachO
  try {
    for (const part of ['bin', 'sbin', 'lib', 'lib64', 'libexec']) {
      const directory = join(prefix, part)
      if (!existsSync(directory) || !lstatSync(directory).isDirectory()) continue
      walkFiles(directory, (file) => {
        if (!isBinary(file)) return
        const mode = statSync(file).mode & 0o7777
        if (!(mode & 0o200)) {
          originalModes.set(file, mode)
          chmodSync(file, mode | 0o200)
        }
      })
    }
    console.log(`\nRunning post-build fix-ups on ${prefix}...`)

    const bundled = (() => {
      try { return bundleRuntimeLibraries(prefix, platform, runtimeDependencies, osName === 'linux' ? isDynamicElf : isMachO) }
      catch (cause) { throw new Error(`Cannot normalize ${osName === 'linux' ? 'ELF loader paths' : 'Mach-O runtime libraries'}: ${cause instanceof Error ? cause.message : String(cause)}`, { cause }) }
    })()
    if (osName === 'darwin' && !skips.includes('fix-machos')) normalizeMachoRuntime(prefix, isMachO)
    else if (osName === 'linux' && !skips.includes('fix-patchelf')) fixElfRpaths(prefix)
    writeRuntimeProvenance(prefix, bundled)

    // Fix pkg-config files
    fixPkgConfigFiles(prefix)

    // Fix cmake files
    fixCmakeFiles(prefix)

    // Remove libtool .la files
    if (!skips.includes('libtool-cleanup')) {
      removeLaFiles(prefix)
    }

    console.log('Fix-ups complete.')
  }
  finally {
    for (const [file, mode] of originalModes) if (existsSync(file)) chmodSync(file, mode)
  }
}

export function fixElfRpaths(prefix: string, patchelf = 'patchelf'): void {
  const dirs = ['bin', 'sbin', 'lib', 'lib64', 'libexec'].filter(dir => existsSync(join(prefix, dir)) && lstatSync(join(prefix, dir)).isDirectory())
  for (const dir of dirs) {
    walkFiles(join(prefix, dir), (filePath) => {
      if (!isDynamicElf(filePath)) return
      try {
        const existing = execFileSync(patchelf, ['--print-rpath', filePath], { encoding: 'utf8' }).trim().split(':')
        const libraries = dir === 'lib64' ? ['lib64', 'lib'] : ['lib', 'lib64']
        const paths = new Set(libraries.filter(lib => existsSync(join(prefix, lib))).map((lib) => {
          const up = relative(dirname(filePath), join(prefix, lib)).split(sep).join('/')
          return up ? `$ORIGIN/${up}` : '$ORIGIN'
        }))
        // The package's own libraries must precede dependency and host paths.
        for (const path of existing) {
          if (!/^\$(?:ORIGIN|\{ORIGIN\})(?:\/|$)/.test(path)) continue
          // Mirrored artifacts can name a managed dependency's versioned
          // prefix rather than its library directory. ELF loaders do not
          // descend into lib automatically; preserve the dependency and make
          // its canonical library locations explicit before publication.
          if (/\/v\d[\w.+-]*$/.test(path)) {
            paths.add(`${path}/lib`)
            paths.add(`${path}/lib64`)
          }
          paths.add(path)
        }
        const expected = [...paths].join(':')
        applyElfRpath(filePath, expected, patchelf)
        if (execFileSync(patchelf, ['--print-rpath', filePath], { encoding: 'utf8' }).trim() !== expected)
          throw new Error('rewritten loader path did not match')
      }
      catch (cause) {
        throw new Error(`Cannot normalize ELF loader paths for ${filePath}: ${cause instanceof Error ? cause.message : String(cause)}; a working patchelf is required before publication`, { cause })
      }
    })
  }
}

/** Read only ELF headers; static executables and object files need no rewrite. */
function isDynamicElf(filePath: string): boolean {
  const file = openSync(filePath, 'r')
  try {
    const header = new Uint8Array(64)
    const length = readSync(file, header, 0, header.length, 0)
    if (length < 4 || header[0] !== 0x7f || header[1] !== 0x45 || header[2] !== 0x4c || header[3] !== 0x46) return false
    const bits = header[4]
    if ((bits !== 1 && bits !== 2) || (header[5] !== 1 && header[5] !== 2) || length < (bits === 2 ? 64 : 52))
      throw new Error(`Invalid ELF header in ${filePath}`)
    const view = new DataView(header.buffer)
    const little = header[5] === 1
    if (![2, 3].includes(view.getUint16(16, little))) return false
    const offset = bits === 2 ? Number(view.getBigUint64(32, little)) : view.getUint32(28, little)
    const size = view.getUint16(bits === 2 ? 54 : 42, little)
    const count = view.getUint16(bits === 2 ? 56 : 44, little)
    if (count === 0) return false
    if (!Number.isSafeInteger(offset) || offset < (bits === 2 ? 64 : 52) || size < (bits === 2 ? 56 : 32) || count === 0xffff || offset + size * count > statSync(filePath).size)
      throw new Error(`Invalid ELF program headers in ${filePath}`)
    const type = new Uint8Array(4)
    for (let index = 0; index < count; index++) {
      if (readSync(file, type, 0, 4, offset + index * size) !== 4)
        throw new Error(`Truncated ELF program header in ${filePath}`)
      if (new DataView(type.buffer).getUint32(0, little) === 2) return true
    }
    return false
  }
  finally { closeSync(file) }
}

export function applyElfRpath(filePath: string, rpath: string, patchelf = 'patchelf'): void {
  execFileSync(patchelf, ['--force-rpath', '--set-rpath', rpath, filePath], { stdio: 'pipe' })
}

/**
 * Fix pkg-config .pc files — replace hardcoded paths with ${pcfiledir}
 * From brewkit's fix_pc_files()
 */
function fixPkgConfigFiles(prefix: string): void {
  for (const part of ['lib', 'lib64', 'share']) {
    const pkgconfigDir = join(prefix, part, 'pkgconfig')
    if (!existsSync(pkgconfigDir)) continue

    const files = readdirSync(pkgconfigDir)
    for (const file of files) {
      if (!file.endsWith('.pc')) continue

      const filePath = join(pkgconfigDir, file)
      try {
        // Ensure we have read/write permissions (some installs like CUPS set restrictive perms)
        try { execSync(`chmod u+rw "${filePath}"`, { stdio: 'pipe' }) }
catch { /* ignore */ }
        const orig = readFileSync(filePath, 'utf-8')
        const relativePath = relative(dirname(filePath), prefix)

        const text = orig.replaceAll(prefix, `\${pcfiledir}/${relativePath}`)

        if (orig !== text) {
          console.log(`  Fixing pkg-config: ${file}`)
          writeFileSync(filePath, text)
        }
      }
catch (err: any) {
        console.log(`  ⚠️  Could not fix pkg-config ${file}: ${err.message}`)
      }
    }
  }
}

/**
 * Fix CMake .cmake files — replace hardcoded paths
 * From brewkit's fix_cmake_files()
 */
function fixCmakeFiles(prefix: string): void {
  const cmakeDir = join(prefix, 'lib', 'cmake')
  if (!existsSync(cmakeDir)) return

  walkFiles(cmakeDir, (filePath) => {
    if (!filePath.endsWith('.cmake')) return

    const orig = readFileSync(filePath, 'utf-8')
    const relativePath = relative(dirname(filePath), prefix)

    const text = orig.replaceAll(prefix, `\${CMAKE_CURRENT_LIST_DIR}/${relativePath}`)

    if (orig !== text) {
      console.log(`  Fixing cmake: ${basename(filePath)}`)
      writeFileSync(filePath, text)
    }
  })
}

/**
 * Remove libtool .la files from lib/ (they contain hardcoded paths)
 * From brewkit's remove_la_files()
 * Only removes top-level lib/*.la — subdirectory .la may be module descriptors
 */
export function removeLaFiles(prefix: string): void {
  const libDir = join(prefix, 'lib')
  if (!existsSync(libDir)) return

  const files = readdirSync(libDir)
  for (const file of files) {
    if (!file.endsWith('.la')) continue
    const filePath = join(libDir, file)
    // libpng installs libpng.la as a link to libpng16.la. Once the target is
    // gone (readdir order decides which comes first) a plain stat throws
    // ENOENT, which failed libpng 1.6.59's linux-arm64 build outright; the
    // dangling link is removed along with what it pointed at.
    const stat = statSync(filePath, { throwIfNoEntry: false })
    if (!stat) {
      if (lstatSync(filePath, { throwIfNoEntry: false })?.isSymbolicLink()) {
        console.log(`  Removing .la: ${file} (dangling link)`)
        unlinkSync(filePath)
      }
      continue
    }
    if (stat.isFile()) {
      console.log(`  Removing .la: ${file}`)
      unlinkSync(filePath)
    }
  }
}

// --- Helpers ---

/**
 * Walk files recursively in a directory
 */
function walkFiles(dir: string, callback: (filePath: string) => void): void {
  if (!existsSync(dir)) return

  const entries = readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      walkFiles(fullPath, callback)
    }
else if (entry.isFile()) {
      callback(fullPath)
    }
  }
}

/**
 * Check if a file is a Mach-O binary
 */
function isMachO(filePath: string): boolean {
  let file: number | undefined
  try {
    const buffer = new Uint8Array(4)
    file = require('node:fs').openSync(filePath, 'r')
    require('node:fs').readSync(file, buffer, 0, 4, 0)
    require('node:fs').closeSync(file)
    file = undefined

    // Mach-O magic: feedface, feedfacf, cafebabe (universal), bebafeca
    // Use >>> 0 to force unsigned 32-bit (JS << returns signed, causing overflow for 0xcf...)
    const magic = ((buffer[0] << 24) | (buffer[1] << 16) | (buffer[2] << 8) | buffer[3]) >>> 0
    return magic === 0xfeedface || magic === 0xfeedfacf
      || magic === 0xcafebabe || magic === 0xbebafeca
      || magic === 0xcffaedfe || magic === 0xcefaedfe
  }
  catch {
    return false
  }
  finally {
    if (file !== undefined) {
      try { require('node:fs').closeSync(file) } catch { /* already closed */ }
    }
  }
}
