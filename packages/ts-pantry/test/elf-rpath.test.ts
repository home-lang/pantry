import { afterEach, describe, expect, test } from 'bun:test'
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { applyElfRpath, fixElfRpaths } from '../scripts/fix-up'

const tempDirs: string[] = []

function dynamicElf(path: string, bits = 2, little = true, dynamic = true): void {
  const offset = bits === 2 ? 64 : 52
  const size = bits === 2 ? 56 : 32
  const bytes = new Uint8Array(offset + size)
  bytes.set([0x7f, 0x45, 0x4c, 0x46, bits, little ? 1 : 2, 1])
  const view = new DataView(bytes.buffer)
  view.setUint16(16, 3, little)
  if (bits === 2) view.setBigUint64(32, BigInt(offset), little)
  else view.setUint32(28, offset, little)
  view.setUint16(bits === 2 ? 54 : 42, size, little)
  view.setUint16(bits === 2 ? 56 : 44, 1, little)
  view.setUint32(offset, dynamic ? 2 : 1, little)
  writeFileSync(path, bytes)
}

function fixture(): { dir: string, tool: string } {
  const dir = mkdtempSync(join(tmpdir(), 'pantry-elf-prefix-'))
  tempDirs.push(dir)
  for (const name of ['bin', 'lib', 'lib64', 'libexec']) mkdirSync(join(dir, name))
  const tool = join(dir, 'patchelf')
  writeFileSync(tool, `#!/bin/sh
if [ "$1" = "--print-rpath" ]; then
  if [ -f "$2.rpath" ]; then cat "$2.rpath"; else printf '%s' '/../lib:$ORIGIN/../../../perl.org/v5'; fi
else
  printf '%s' "$3" > "$4.rpath"
fi
`)
  chmodSync(tool, 0o755)
  return { dir, tool }
}

afterEach(() => {
  for (const dir of tempDirs.splice(0))
    rmSync(dir, { recursive: true, force: true })
})

describe('ELF RPATH fix-up', () => {
  test('puts bundled libraries first and removes broken absolute paths at every depth', () => {
    const { dir, tool } = fixture()
    mkdirSync(join(dir, 'libexec', 'git-core'))
    mkdirSync(join(dir, 'lib', 'engines-3'))
    const executable = join(dir, 'bin', 'openssl')
    const nested = join(dir, 'libexec', 'git-core', 'git')
    const library = join(dir, 'lib64', 'libssl.so.3')
    const plugin = join(dir, 'lib', 'engines-3', 'legacy.so')
    for (const file of [executable, nested, library, plugin]) dynamicElf(file)
    fixElfRpaths(dir, tool)
    expect(readFileSync(`${executable}.rpath`, 'utf8')).toBe('$ORIGIN/../lib:$ORIGIN/../lib64:$ORIGIN/../../../perl.org/v5/lib:$ORIGIN/../../../perl.org/v5/lib64:$ORIGIN/../../../perl.org/v5')
    expect(readFileSync(`${nested}.rpath`, 'utf8')).toBe('$ORIGIN/../../lib:$ORIGIN/../../lib64:$ORIGIN/../../../perl.org/v5/lib:$ORIGIN/../../../perl.org/v5/lib64:$ORIGIN/../../../perl.org/v5')
    expect(readFileSync(`${library}.rpath`, 'utf8')).toBe('$ORIGIN:$ORIGIN/../lib:$ORIGIN/../../../perl.org/v5/lib:$ORIGIN/../../../perl.org/v5/lib64:$ORIGIN/../../../perl.org/v5')
    expect(readFileSync(`${plugin}.rpath`, 'utf8')).toBe('$ORIGIN/..:$ORIGIN/../../lib64:$ORIGIN/../../../perl.org/v5/lib:$ORIGIN/../../../perl.org/v5/lib64:$ORIGIN/../../../perl.org/v5')
    fixElfRpaths(dir, tool)
    expect(readFileSync(`${executable}.rpath`, 'utf8')).toBe('$ORIGIN/../lib:$ORIGIN/../lib64:$ORIGIN/../../../perl.org/v5/lib:$ORIGIN/../../../perl.org/v5/lib64:$ORIGIN/../../../perl.org/v5')
  })

  test('recognizes both ELF widths and byte orders without executing foreign binaries', () => {
    const { dir, tool } = fixture()
    for (const bits of [1, 2]) {
      for (const little of [false, true]) dynamicElf(join(dir, 'bin', `${bits}-${little}`), bits, little)
    }
    fixElfRpaths(dir, tool)
    for (const bits of [1, 2]) {
      for (const little of [false, true]) expect(existsSync(join(dir, 'bin', `${bits}-${little}.rpath`))).toBe(true)
    }
  })

  test('static executables and scripts do not require patchelf', () => {
    const { dir } = fixture()
    dynamicElf(join(dir, 'bin', 'static'), 2, true, false)
    writeFileSync(join(dir, 'bin', 'script'), '#!/bin/sh\nexit 0\n')
    expect(() => fixElfRpaths(dir, join(dir, 'missing-tool'))).not.toThrow()
  })

  test('missing, failing and ineffective patchers refuse publication', () => {
    const { dir, tool } = fixture()
    dynamicElf(join(dir, 'bin', 'openssl'))
    expect(() => fixElfRpaths(dir, join(dir, 'missing-tool'))).toThrow('Cannot normalize ELF loader paths')
    writeFileSync(tool, '#!/bin/sh\nexit 1\n')
    expect(() => fixElfRpaths(dir, tool)).toThrow('Cannot normalize ELF loader paths')
    writeFileSync(tool, '#!/bin/sh\nexit 0\n')
    expect(() => fixElfRpaths(dir, tool)).toThrow('Cannot normalize ELF loader paths')
  })

  test('does not traverse a package directory symlink into another prefix', () => {
    const { dir, tool } = fixture()
    const outside = mkdtempSync(join(tmpdir(), 'pantry-elf-outside-'))
    tempDirs.push(outside)
    const binary = join(outside, 'shared')
    dynamicElf(binary)
    rmSync(join(dir, 'libexec'), { recursive: true })
    symlinkSync(outside, join(dir, 'libexec'))
    fixElfRpaths(dir, tool)
    expect(existsSync(`${binary}.rpath`)).toBe(false)
  })

  test('passes the loader origin through without shell expansion', () => {
    const dir = mkdtempSync(join(tmpdir(), 'pantry-patchelf-'))
    const argsFile = join(dir, 'args')
    const patchelf = join(dir, 'patchelf')
    tempDirs.push(dir)
    writeFileSync(patchelf, `#!/bin/sh\nprintf "%s\\n" "$@" > "${argsFile}"\n`)
    chmodSync(patchelf, 0o755)

    applyElfRpath('/tmp/tool', '$ORIGIN/../lib', patchelf)

    expect(readFileSync(argsFile, 'utf8').split('\n')).toEqual([
      '--force-rpath',
      '--set-rpath',
      '$ORIGIN/../lib',
      '/tmp/tool',
      '',
    ])
  })
})

test('versioned dependency prefix entries search the managed library directories', () => {
  const { dir, tool } = fixture()
  const library = join(dir, 'lib', 'libpq.so.5')
  dynamicElf(library)
  writeFileSync(`${library}.rpath`, '$ORIGIN/../../../../openssl.org/v1:$ORIGIN/../../../../kerberos.org/v1:$ORIGIN/../../../../unicode.org/v71/lib')
  fixElfRpaths(dir, tool)
  const paths = readFileSync(`${library}.rpath`, 'utf8').split(':')
  expect(paths).toContain('$ORIGIN/../../../../openssl.org/v1/lib')
  expect(paths).toContain('$ORIGIN/../../../../openssl.org/v1/lib64')
  expect(paths).toContain('$ORIGIN/../../../../kerberos.org/v1/lib')
  expect(paths).not.toContain('$ORIGIN/../../../../unicode.org/v71/lib/lib')
  const once = readFileSync(`${library}.rpath`, 'utf8')
  fixElfRpaths(dir, tool)
  expect(readFileSync(`${library}.rpath`, 'utf8')).toBe(once)
})
