import { expect, test } from 'bun:test'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { generateBuildScript } from '../scripts/buildkit'

// CI supplies the Pantry-managed Clang used by native package publication.
// This performs only preprocessing against its own temporary headers.
test.skipIf(!process.env.PANTRY_TEST_CC)('declared headers preserve upstream system wrappers and include_next in C and C++', () => {
  const root = mkdtempSync(join(tmpdir(), 'pantry-header-order-'))
  try {
    const dependency = join(root, 'dependency')
    const wrapper = join(root, 'upstream-override')
    mkdirSync(join(dependency, 'include'), { recursive: true })
    mkdirSync(wrapper)
    writeFileSync(join(dependency, 'include/pantry-order.h'), '#define PANTRY_HEADER_ORDER 1\n')
    writeFileSync(join(wrapper, 'pantry-order.h'), '#include_next <pantry-order.h>\n#if PANTRY_HEADER_ORDER != 1\n#error declared_dependency_missing\n#endif\n#undef PANTRY_HEADER_ORDER\n#define PANTRY_HEADER_ORDER 2\n')
    const source = join(root, 'probe.c')
    writeFileSync(source, '#include <pantry-order.h>\n#if PANTRY_HEADER_ORDER != 2\n#error upstream_header_wrapper_bypassed\n#endif\nint managed_header_precedence;\n')
    const script = generateBuildScript({ build: { script: ['true'] } }, 'fixture', '1.0.0', 'linux-x86-64', join(root, 'prefix'), join(root, 'build'), { 'deps.fixture.prefix': dependency })
    const exports = script.split('\n').filter(line => /^export (CPATH|C_INCLUDE_PATH|CPLUS_INCLUDE_PATH)=/.test(line) || line === 'unset CPATH').join('\n')
    const compiler: string[] = JSON.parse(process.env.PANTRY_TEST_CC!)
    for (const language of ['c', 'c++']) {
      const result = Bun.spawnSync(['bash', '-ec', `${exports}\nexec "$@"`, '--', ...compiler, '-E', '-P', '-x', language, '-isystem', wrapper, source], {
        cwd: root, env: { ...process.env, CPATH: '/unmanaged/include', C_INCLUDE_PATH: '/unmanaged/include', CPLUS_INCLUDE_PATH: '/unmanaged/include' }, stdout: 'pipe', stderr: 'pipe',
      })
      expect(result.exitCode, result.stderr.toString()).toBe(0)
      expect(result.stdout.toString()).toContain('int managed_header_precedence;')
    }
  }
  finally { rmSync(root, { recursive: true, force: true }) }
})
