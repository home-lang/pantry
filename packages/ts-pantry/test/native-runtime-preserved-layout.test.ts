import { expect, test } from 'bun:test'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fixUp } from '../scripts/fix-up'

test.skipIf(!['darwin', 'linux'].includes(process.platform))('vendor loader layouts keep one internal library identity after relocation', async () => {
  const root = mkdtempSync(join(tmpdir(), 'pantry vendor runtime '))
  const stage = join(root, 'artifact')
  const mac = process.platform === 'darwin'
  const compiler: string[] = mac ? ['xcrun', 'clang'] : process.env.PANTRY_TEST_CC ? JSON.parse(process.env.PANTRY_TEST_CC) : ['cc']
  const env = { ...process.env }
  for (const key of ['LD_LIBRARY_PATH', 'LD_PRELOAD', 'DYLD_LIBRARY_PATH', 'DYLD_FALLBACK_LIBRARY_PATH']) delete env[key]
  const run = (args: string[]): string => {
    const p = Bun.spawnSync(args, { env, stdout: 'pipe', stderr: 'pipe' })
    expect(p.exitCode, p.stderr.toString()).toBe(0)
    return p.stdout.toString().trim()
  }
  try {
    mkdirSync(join(stage, 'lib/server'), { recursive: true })
    mkdirSync(join(stage, 'bin'))
    const name = mac ? 'libvendor-state.dylib' : 'libvendor-state.so.1'
    const library = join(stage, 'lib/server', name)
    const program = join(stage, 'bin/application')
    const source = join(root, 'library.c'), entry = join(root, 'application.c')
    writeFileSync(source, 'int vendor_state(void) { return 42; }')
    writeFileSync(entry, '#include <stdio.h>\nextern int vendor_state(void); int main(void) { printf("%d\\n", vendor_state()); return 0; }')
    run([...compiler, ...(mac ? ['-dynamiclib', '-Wl,-headerpad_max_install_names', '-install_name', `@rpath/server/${name}`] : ['-shared', '-fPIC', `-Wl,-soname,${name}`]), source, '-o', library])
    run([...compiler, entry, library, ...(mac ? ['-Wl,-headerpad_max_install_names', '-Wl,-rpath,@executable_path/../lib'] : ['-Wl,-rpath,$ORIGIN/../lib/server']), '-o', program])
    const digest = (file: string) => new Bun.CryptoHasher('sha256').update(readFileSync(file)).digest('hex')
    const before = [digest(program), digest(library)]
    expect(run([program])).toBe('42')
    await fixUp(stage, mac ? 'darwin-arm64' : 'linux-x86-64', [mac ? 'fix-machos' : 'fix-patchelf'])
    expect([digest(program), digest(library)]).toEqual(before)
    expect(existsSync(join(stage, 'lib', name))).toBe(false)
    const moved = join(root, 'fresh consumer')
    renameSync(stage, moved)
    expect(run([join(moved, 'bin/application')])).toBe('42')
  }
  finally { rmSync(root, { recursive: true, force: true }) }
}, 30_000)
