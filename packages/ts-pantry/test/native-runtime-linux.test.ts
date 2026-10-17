import { expect, test } from 'bun:test'
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fixUp } from '../scripts/fix-up'

test.skipIf(process.platform !== 'linux')('native runtime closure survives fresh relocation and loads through FFI without build dependencies', async () => {
  const root = mkdtempSync(join(tmpdir(), 'pantry-runtime-closure-'))
  const compiler: string[] = process.env.PANTRY_TEST_CC ? JSON.parse(process.env.PANTRY_TEST_CC) : ['cc']
  const cleanEnv = { ...process.env }
  for (const key of ['LD_LIBRARY_PATH', 'LD_PRELOAD', 'DYLD_LIBRARY_PATH', 'DYLD_FALLBACK_LIBRARY_PATH']) delete cleanEnv[key]
  const run = (command: string[]) => {
    const child = Bun.spawnSync(command, { cwd: root, env: cleanEnv, stdout: 'pipe', stderr: 'pipe' })
    expect(child.exitCode, child.stderr.toString()).toBe(0)
    return child.stdout.toString().trim()
  }
  try {
    const first = join(root, 'dependencies/first')
    const second = join(root, 'dependencies/second')
    const stage = join(root, 'artifact')
    for (const path of [join(first, 'lib'), join(second, 'lib64'), join(stage, 'lib'), join(stage, 'bin')]) mkdirSync(path, { recursive: true })
    writeFileSync(join(first, 'LICENSE'), 'First fixture license\n')
    writeFileSync(join(second, 'COPYING'), 'Second fixture license\n')
    symlinkSync('.', join(first, 'lib', 'directory-loop'))
    writeFileSync(join(root, 'second.c'), 'int second(void) { return 41; }')
    writeFileSync(join(root, 'first.c'), 'extern int second(void); int first(void) { return second() + 1; }')
    writeFileSync(join(root, 'api.c'), 'extern int first(void); int value(void) { return first(); }')
    writeFileSync(join(root, 'main.c'), '#include <stdio.h>\nextern int first(void); int main(void) { printf("%d\\n", first()); return 0; }')
    run([...compiler, '-shared', '-fPIC', join(root, 'second.c'), '-Wl,-soname,libfixture-second.so.1', '-o', join(second, 'lib64/libfixture-second.so.1')])
    run([...compiler, '-shared', '-fPIC', join(root, 'first.c'), '-Wl,-soname,libfixture-first.so.1', join(second, 'lib64/libfixture-second.so.1'), `-Wl,-rpath,${second}/lib64`, '-o', join(first, 'lib/libfixture-first.so.1')])
    const link = [join(first, 'lib/libfixture-first.so.1'), `-Wl,-rpath,${first}/lib`, `-Wl,-rpath-link,${second}/lib64`]
    run([...compiler, '-shared', '-fPIC', join(root, 'api.c'), ...link, '-o', join(stage, 'lib/libfixture-api.so')])
    run([...compiler, join(root, 'main.c'), ...link, '-o', join(stage, 'bin/fixture')])
    expect(run([join(stage, 'bin/fixture')])).toBe('42')
    const incomplete = join(root, 'incomplete')
    cpSync(stage, incomplete, { recursive: true })
    await expect(fixUp(incomplete, 'linux-x86-64', [], [{ domain: 'first.example', version: '1.0', prefix: first }])).rejects.toThrow('libfixture-second.so.1')
    const conflict = join(root, 'conflict')
    mkdirSync(join(conflict, 'lib'), { recursive: true })
    writeFileSync(join(conflict, 'lib/libfixture-first.so.1'), Buffer.concat([readFileSync(join(first, 'lib/libfixture-first.so.1')), Buffer.from('different-provider')]))
    const conflicted = join(root, 'conflicted-artifact')
    cpSync(stage, conflicted, { recursive: true })
    await expect(fixUp(conflicted, 'linux-x86-64', [], [{ domain: 'first.example', version: '1.0', prefix: first }, { domain: 'conflict.example', version: '1.0', prefix: conflict }])).rejects.toThrow('Conflicting declared runtime providers')
    symlinkSync(join(second, 'lib64/libfixture-second.so.1'), join(conflict, 'lib/escape.so'))
    await expect(fixUp(conflicted, 'linux-x86-64', [], [{ domain: 'conflict.example', version: '1.0', prefix: conflict }])).rejects.toThrow('escapes declared runtime package')
    await fixUp(first, 'linux-x86-64', [], [{ domain: 'second.example', version: '1.0', prefix: second }])
    writeFileSync(join(root, 'second.c'), 'int second(void) { return 41; } int canonical_rebuild_marker(void) { return 0; }')
    run([...compiler, '-shared', '-fPIC', join(root, 'second.c'), '-Wl,-soname,libfixture-second.so.1', '-o', join(second, 'lib64/libfixture-second.so.1')])
    const currentSecondSha256 = new Bun.CryptoHasher('sha256').update(readFileSync(join(second, 'lib64/libfixture-second.so.1'))).digest('hex')
    await fixUp(stage, 'linux-x86-64', [], [{ domain: 'first.example', version: '1.0', prefix: first }, { domain: 'second.example', version: '1.0', prefix: second }])
    const fresh = join(root, 'fresh consumer/pantry/example.org/v1.0')
    mkdirSync(dirname(fresh), { recursive: true })
    renameSync(stage, fresh)
    rmSync(join(root, 'dependencies'), { recursive: true })
    rmSync(incomplete, { recursive: true })
    expect(run([join(fresh, 'bin/fixture')])).toBe('42')
    const probe = join(root, 'ffi.ts')
    writeFileSync(probe, `import { dlopen } from 'bun:ffi'; const lib = dlopen(process.argv[2], { value: { args: [], returns: 'i32' } }); try { console.log(lib.symbols.value()) } finally { lib.close() }`)
    expect(run([process.execPath, probe, join(fresh, 'lib/libfixture-api.so')])).toBe('42')
    const provenance = JSON.parse(readFileSync(join(fresh, 'share/pantry/runtime-libraries.json'), 'utf8'))
    expect(provenance.libraries.map((library: { domain: string }) => library.domain).sort()).toEqual(['first.example', 'second.example'])
    expect(provenance.libraries.find((library: { domain: string }) => library.domain === 'second.example').sourceSha256).toBe(currentSecondSha256)
    for (const library of provenance.libraries) {
      expect(library.sourceSha256).toMatch(/^[a-f0-9]{64}$/)
      expect(library.bundledSha256).toMatch(/^[a-f0-9]{64}$/)
      expect(library.licenseFiles.length).toBeGreaterThan(0)
      expect(existsSync(join(fresh, library.licenseFiles[0]))).toBe(true)
    }
  }
  finally { rmSync(root, { recursive: true, force: true }) }
}, 60_000)
