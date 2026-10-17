import { expect, test } from 'bun:test'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { generateBuildScript } from '../scripts/buildkit'

test('relocated managed GCC selects managed binutils ahead of its configured system tools', async () => {
  const root = mkdtempSync(join(tmpdir(), 'pantry-gcc-tools-'))
  try {
    const gcc = join(root, 'gcc')
    const binutils = join(root, 'binutils')
    mkdirSync(join(gcc, 'bin'), { recursive: true })
    mkdirSync(join(root, 'clang', 'bin'), { recursive: true })
    const compiler = '#!/bin/sh\nprintf "%s\\n" "$@"\n'
    writeFileSync(join(gcc, 'bin', 'gcc'), compiler, { mode: 0o755 })
    writeFileSync(join(root, 'clang', 'bin', 'clang'), compiler, { mode: 0o755 })
    const script = generateBuildScript({ build: { script: ['true'] } }, 'fixture', '1.0.0', 'linux-x86-64', join(root, 'prefix'), root, {
      'deps.gnu.org/gcc.prefix': gcc,
      'deps.gnu.org/binutils.prefix': binutils,
    })
    // Execute the generated compiler wrappers, without the unrelated package
    // preparation or build steps. Both compilers receive the same caller args.
    const setup = script.slice(script.indexOf('__setup_cc_wrapper() {'), script.indexOf('\n__setup_cc_wrapper\n'))
    expect(setup).toContain('CCEOF')
    const probe = Bun.spawn(['bash', '-ec', `${setup}\n__setup_cc_wrapper\n"$TMPDIR/_cc_wrapper/gcc" -c source.c\n"$TMPDIR/_cc_wrapper/clang" -c source.c`], {
      env: { ...process.env, TMPDIR: root, PATH: `${gcc}/bin:${root}/clang/bin:${process.env.PATH}` },
      stdout: 'pipe', stderr: 'pipe',
    })
    const [status, stdout, stderr] = await Promise.all([probe.exited, new Response(probe.stdout).text(), new Response(probe.stderr).text()])
    expect(status, stderr).toBe(0)
    const argumentsPassed = stdout.trim().split('\n')
    expect(argumentsPassed.filter(arg => arg === `-B${binutils}/bin/`)).toHaveLength(1)
    expect(argumentsPassed.filter(arg => arg === 'source.c')).toHaveLength(2)
  }
  finally { rmSync(root, { recursive: true, force: true }) }
})

test('compiler aliases honor the explicitly selected managed C and C++ compilers', async () => {
  const root = mkdtempSync(join(tmpdir(), 'pantry selected compilers '))
  try {
    mkdirSync(join(root, 'bin'))
    for (const [name, identity] of [['managed-cc', 'managed-c'], ['managed-cxx', 'managed-cxx'], ['cc', 'unexpected-host'], ['c++', 'unexpected-host']])
      writeFileSync(join(root, 'bin', name), `#!/bin/sh\nprintf '%s\\n' '${identity}'\n`, { mode: 0o755 })
    const script = generateBuildScript({ build: { script: ['true'] } }, 'fixture', '1.0.0', 'linux-x86-64', join(root, 'prefix'), root, {})
    const setup = script.slice(script.indexOf('__setup_cc_wrapper() {'), script.indexOf('\n__setup_cc_wrapper\n'))
    const probe = Bun.spawn(['bash', '-ec', `${setup}\n__setup_cc_wrapper\nfor name in cc gcc clang c++ g++ clang++; do "$TMPDIR/_cc_wrapper/$name" -c source.c; done`], {
      env: { ...process.env, TMPDIR: root, PATH: `${root}/bin:${process.env.PATH}`, CC: 'managed-cc', CXX: 'managed-cxx' },
      stdout: 'pipe', stderr: 'pipe',
    })
    const [status, stdout, stderr] = await Promise.all([probe.exited, new Response(probe.stdout).text(), new Response(probe.stderr).text()])
    expect(status, stderr).toBe(0)
    expect(stdout.trim().split('\n')).toEqual(['managed-c', 'managed-c', 'managed-c', 'managed-cxx', 'managed-cxx', 'managed-cxx'])
  }
  finally { rmSync(root, { recursive: true, force: true }) }
})
