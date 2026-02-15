#!/usr/bin/env bun

/**
 * Fix-up — Post-build binary fixing for relocatable packages
 *
 * Ported from brewkit's lib/porcelain/fix-up.ts
 * Ensures built binaries work when installed to any prefix.
 */

import { existsSync, readdirSync, readFileSync, writeFileSync, unlinkSync, renameSync, mkdirSync, symlinkSync, statSync, lstatSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { join, relative, dirname, extname, basename } from 'node:path'

/**
 * Run all post-build fix-ups on a package prefix
 */
export async function fixUp(prefix: string, platform: string, skips: string[] = []): Promise<void> {
  const [os] = platform.split('-')
  const osName = os === 'darwin' ? 'darwin' : 'linux'

  console.log(`\nRunning post-build fix-ups on ${prefix}...`)

  // Fix rpaths/install_names
  if (osName === 'darwin' && !skips.includes('fix-machos')) {
    fixMachoRpaths(prefix)
  } else if (osName === 'linux' && !skips.includes('fix-patchelf')) {
    fixElfRpaths(prefix)
  }

  // Fix pkg-config files
  fixPkgConfigFiles(prefix)

  // Fix cmake files
  fixCmakeFiles(prefix)

  // Remove libtool .la files
  if (!skips.includes('libtool-cleanup')) {
    removeLaFiles(prefix)
  }

  // Linux: consolidate lib64 -> lib
  if (osName === 'linux') {
    consolidateLib64(prefix)
  }

  console.log('Fix-ups complete.')
}

/**
 * Fix macOS Mach-O binaries using install_name_tool
 * Simplified version of brewkit's fix-machos.rb
 */
function fixMachoRpaths(prefix: string): void {
  console.log('  Fixing Mach-O rpaths...')

  const dirs = ['bin', 'sbin', 'lib', 'libexec'].filter(d => existsSync(join(prefix, d)))

  for (const dir of dirs) {
    const dirPath = join(prefix, dir)
    walkFiles(dirPath, (filePath) => {
      if (!isMachO(filePath)) return

      try {
        // Get current rpaths
        const otoolOutput = execSync(`otool -l "${filePath}" 2>/dev/null`, { encoding: 'utf-8' })

        // Remove any build-dir rpaths
        const rpathMatches = otoolOutput.matchAll(/path\s+(.+?)\s+\(offset/g)
        for (const match of rpathMatches) {
          const rpath = match[1]
          if (rpath.startsWith('/tmp') || rpath.includes('+brewing')) {
            try {
              execSync(`install_name_tool -delete_rpath "${rpath}" "${filePath}" 2>/dev/null`, { stdio: 'pipe' })
            } catch { /* rpath might not exist */ }
          }
        }

        // Add relative rpath if not already present
        const relRpath = dir === 'lib' ? '@loader_path' : '@loader_path/../lib'
        const existingRpaths = [...otoolOutput.matchAll(/path\s+(.+?)\s+\(offset/g)].map(m => m[1])
        if (!existingRpaths.includes(relRpath)) {
          try {
            execSync(`install_name_tool -add_rpath "${relRpath}" "${filePath}" 2>/dev/null`, { stdio: 'pipe' })
          } catch { /* ignore */ }
        }

        // Fix install_names that reference build paths
        const idOutput = execSync(`otool -D "${filePath}" 2>/dev/null`, { encoding: 'utf-8' })
        const lines = idOutput.trim().split('\n')
        if (lines.length > 1) {
          const currentId = lines[1].trim()
          if (currentId.startsWith('/tmp') || currentId.includes('+brewing')) {
            const newId = `@rpath/${basename(filePath)}`
            try {
              execSync(`install_name_tool -id "${newId}" "${filePath}" 2>/dev/null`, { stdio: 'pipe' })
            } catch { /* ignore */ }
          }
        }

        // Re-sign (required on Apple Silicon)
        try {
          execSync(`codesign --force --sign - "${filePath}" 2>/dev/null`, { stdio: 'pipe' })
        } catch { /* ignore signing errors */ }
      } catch {
        // Not a Mach-O or otool failed, skip
      }
    })
  }
}

/**
 * Fix Linux ELF binaries using patchelf
 * Simplified version of brewkit's fix-elf.ts
 */
function fixElfRpaths(prefix: string): void {
  console.log('  Fixing ELF rpaths...')

  // Check if patchelf is available
  try {
    execSync('which patchelf', { stdio: 'pipe' })
  } catch {
    console.log('  patchelf not found, skipping ELF rpath fixing')
    return
  }

  const dirs = ['bin', 'sbin', 'lib', 'libexec'].filter(d => existsSync(join(prefix, d)))

  for (const dir of dirs) {
    const dirPath = join(prefix, dir)
    walkFiles(dirPath, (filePath) => {
      if (!isELF(filePath)) return

      try {
        // Check if dynamically linked
        const fileOutput = execSync(`file "${filePath}"`, { encoding: 'utf-8' })
        if (fileOutput.includes('statically linked')) return

        // Set relative RPATH
        const relRpath = dir === 'lib' ? '$ORIGIN' : '$ORIGIN/../lib'
        execSync(`patchelf --set-rpath "${relRpath}" "${filePath}" 2>/dev/null`, { stdio: 'pipe' })
      } catch {
        // Not an ELF or patchelf failed, skip
      }
    })
  }
}

/**
 * Fix pkg-config .pc files — replace hardcoded paths with ${pcfiledir}
 * From brewkit's fix_pc_files()
 */
function fixPkgConfigFiles(prefix: string): void {
  for (const part of ['lib', 'share']) {
    const pkgconfigDir = join(prefix, part, 'pkgconfig')
    if (!existsSync(pkgconfigDir)) continue

    const files = readdirSync(pkgconfigDir)
    for (const file of files) {
      if (!file.endsWith('.pc')) continue

      const filePath = join(pkgconfigDir, file)
      const orig = readFileSync(filePath, 'utf-8')
      const relativePath = relative(dirname(filePath), prefix)

      const text = orig.replaceAll(prefix, `\${pcfiledir}/${relativePath}`)

      if (orig !== text) {
        console.log(`  Fixing pkg-config: ${file}`)
        writeFileSync(filePath, text)
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
function removeLaFiles(prefix: string): void {
  const libDir = join(prefix, 'lib')
  if (!existsSync(libDir)) return

  const files = readdirSync(libDir)
  for (const file of files) {
    if (!file.endsWith('.la')) continue
    const filePath = join(libDir, file)
    const stat = statSync(filePath)
    if (stat.isFile()) {
      console.log(`  Removing .la: ${file}`)
      unlinkSync(filePath)
    }
  }
}

/**
 * Consolidate lib64/ into lib/ (Linux standardization)
 * From brewkit's consolidate_lib64()
 */
function consolidateLib64(prefix: string): void {
  const lib64 = join(prefix, 'lib64')
  if (!existsSync(lib64)) return

  try {
    const stat = lstatSync(lib64)
    if (!stat.isDirectory()) return
  } catch {
    return
  }

  const libDir = join(prefix, 'lib')
  mkdirSync(libDir, { recursive: true })

  console.log('  Consolidating lib64 -> lib')
  const entries = readdirSync(lib64)
  for (const entry of entries) {
    const src = join(lib64, entry)
    const dest = join(libDir, entry)
    try {
      renameSync(src, dest)
    } catch {
      // might fail if destination exists, skip
    }
  }

  // Remove lib64 and replace with symlink
  execSync(`rm -rf "${lib64}"`)
  symlinkSync('lib', lib64)
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
    } else if (entry.isFile()) {
      callback(fullPath)
    }
  }
}

/**
 * Check if a file is a Mach-O binary
 */
function isMachO(filePath: string): boolean {
  try {
    const fd = Bun.file(filePath)
    // Quick check: read magic bytes
    const buffer = new Uint8Array(4)
    const file = require('node:fs').openSync(filePath, 'r')
    require('node:fs').readSync(file, buffer, 0, 4, 0)
    require('node:fs').closeSync(file)

    // Mach-O magic: feedface, feedfacf, cafebabe (universal), bebafeca
    const magic = (buffer[0] << 24) | (buffer[1] << 16) | (buffer[2] << 8) | buffer[3]
    return magic === 0xfeedface || magic === 0xfeedfacf ||
           magic === 0xcafebabe || magic === 0xbebafeca ||
           magic === 0xcffaedfe || magic === 0xcefaedfe
  } catch {
    return false
  }
}

/**
 * Check if a file is an ELF binary
 */
function isELF(filePath: string): boolean {
  try {
    const buffer = new Uint8Array(4)
    const file = require('node:fs').openSync(filePath, 'r')
    require('node:fs').readSync(file, buffer, 0, 4, 0)
    require('node:fs').closeSync(file)

    // ELF magic: 7f454c46 (.ELF)
    return buffer[0] === 0x7f && buffer[1] === 0x45 && buffer[2] === 0x4c && buffer[3] === 0x46
  } catch {
    return false
  }
}
