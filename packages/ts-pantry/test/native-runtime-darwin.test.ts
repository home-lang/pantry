import { expect, test } from 'bun:test'
import { cpSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fixUp } from '../scripts/fix-up'

test.skipIf(process.platform !== 'darwin')('Mach-O publication uses only declared recursive runtime libraries and survives relocation', async () => {
  const root = mkdtempSync(join(tmpdir(), 'pantry-macho-runtime-'))
  const environment = { ...process.env }
  for (const key of ['DYLD_LIBRARY_PATH', 'DYLD_FALLBACK_LIBRARY_PATH', 'LD_LIBRARY_PATH', 'LD_PRELOAD']) delete environment[key]
  const run = (command: string[]) => {
    const child = Bun.spawnSync(command, { cwd: root, env: environment, stdout: 'pipe', stderr: 'pipe' })
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
    writeFileSync(join(root, 'second.c'), 'int second(void) { return 41; }')
    writeFileSync(join(root, 'first.c'), 'extern int second(void); int first(void) { return second() + 1; }')
    writeFileSync(join(root, 'main.c'), '#include <stdio.h>\nextern int first(void); int main(void) { printf("%d\\n", first()); return 0; }')
    const secondLib = join(second, 'lib64/libfixture-second.1.dylib')
    const firstLib = join(first, 'lib/libfixture-first.1.dylib')
    run(['xcrun', 'clang', '-dynamiclib', join(root, 'second.c'), '-Wl,-headerpad_max_install_names', '-install_name', '@rpath/libfixture-second.1.dylib', '-o', secondLib])
    run(['xcrun', 'clang', '-dynamiclib', join(root, 'first.c'), secondLib, `-Wl,-rpath,${second}/lib64`, '-Wl,-headerpad_max_install_names', '-install_name', '@rpath/libfixture-first.1.dylib', '-o', firstLib])
    run(['xcrun', 'clang', join(root, 'main.c'), firstLib, `-Wl,-rpath,${first}/lib`, '-Wl,-headerpad_max_install_names', '-o', join(stage, 'bin/fixture')])
    expect(run([join(stage, 'bin/fixture')])).toBe('42')
    const incomplete = join(root, 'incomplete')
    cpSync(stage, incomplete, { recursive: true })
    await expect(fixUp(incomplete, 'darwin-arm64', [], [{ domain: 'first.example', version: '1.0', prefix: first }])).rejects.toThrow('libfixture-second.1.dylib')
    await fixUp(stage, 'darwin-arm64', [], [{ domain: 'first.example', version: '1.0', prefix: first }, { domain: 'second.example', version: '1.0', prefix: second }])
    const fresh = join(root, 'fresh consumer/pantry/example.org/v1.0')
    mkdirSync(dirname(fresh), { recursive: true })
    renameSync(stage, fresh)
    rmSync(join(root, 'dependencies'), { recursive: true })
    rmSync(incomplete, { recursive: true })
    expect(run([join(fresh, 'bin/fixture')])).toBe('42')
    const provenance = JSON.parse(readFileSync(join(fresh, 'share/pantry/runtime-libraries.json'), 'utf8'))
    expect(provenance.libraries.map((library: { domain: string }) => library.domain).sort()).toEqual(['first.example', 'second.example'])
    for (const library of provenance.libraries) {
      expect(library.sourceSha256).toMatch(/^[a-f0-9]{64}$/)
      expect(library.bundledSha256).toMatch(/^[a-f0-9]{64}$/)
      expect(library.licenseFiles.length).toBe(1)
    }
  }
  finally { rmSync(root, { recursive: true, force: true }) }
}, 60_000)
