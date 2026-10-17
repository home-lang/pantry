import { expect, test } from 'bun:test'
import { generateBuildScript } from '../scripts/buildkit'
import { collectBuildDependencies } from '../scripts/build-package'

for (const platform of ['linux-x86-64', 'darwin-arm64']) {
  test(`${platform} uses declared dependency library and pkg-config roots`, async () => {
    const script = generateBuildScript({ build: { script: ['true'] } }, 'fixture', '1.0.0', platform, '/tmp/fixture-prefix', '/tmp/fixture-build', {
      'deps.example.org/library.prefix': '/tmp/managed-library',
      'deps.python.org.prefix': '/tmp/managed-python',
    })
    const exports = script.split('\n').filter(line => /^export (PKG_CONFIG_PATH|PKG_CONFIG_LIBDIR|LIBRARY_PATH|CPATH)=/.test(line)).join('\n')
    const child = Bun.spawn(['bash', '-ec', `${exports}\nprintf '%s\\n' "$PKG_CONFIG_PATH" "$PKG_CONFIG_LIBDIR" "$LIBRARY_PATH" "$CPATH"`], {
      env: { ...process.env, PKG_CONFIG_PATH: '/unmanaged/pc', PKG_CONFIG_LIBDIR: '/unmanaged/pc', LIBRARY_PATH: '/unmanaged/lib', CPATH: '/unmanaged/include' }, stdout: 'pipe', stderr: 'pipe',
    })
    const [status, stdout] = await Promise.all([child.exited, new Response(child.stdout).text(), new Response(child.stderr).text()])
    expect(status).toBe(0)
    expect(stdout).toContain('/tmp/managed-library/lib64/pkgconfig')
    expect(stdout).toContain('/tmp/managed-library/lib64')
    expect(stdout).not.toContain('/unmanaged')
    expect(stdout).not.toContain('/opt/homebrew')
    expect(stdout).not.toContain('/usr/lib')
    expect(script).not.toContain('SYSLIB_OVERRIDE_EOF')
    expect(script).not.toContain('_CARGO_REAL')
    expect(script).not.toContain('rustup default stable')
    expect(script).not.toContain('sudo rm -rf /usr/lib/python3')
    expect(script).not.toContain('pip install --quiet')
    expect(script).not.toContain('SCRUB_CMAKE_EOF')
    expect(script).not.toContain('BZIP2PC')
  })

  test(`${platform} dependency resolution retains declared readline, Meson and Cargo`, () => {
    const graph = collectBuildDependencies({ dependencies: ['gnu.org/readline ^8'], buildDependencies: ['rust-lang.org/cargo ^1'] }, ['mesonbuild.com ^1'], ['gnu.org/readline >=8<9'])
    expect(graph.get('gnu.org/readline')).toBe('gnu.org/readline >=8<9')
    expect(graph.get('mesonbuild.com')).toBe('mesonbuild.com ^1')
    expect(graph.get('rust-lang.org/cargo')).toBe('rust-lang.org/cargo ^1')
    expect(graph.size).toBe(3)
  })
}

test('the complete runtime closure retains all parent constraints and terminates cycles', async () => {
  const { resolveBuildDependencyGraph } = await import('../scripts/build-package')
  const recipes: Record<string, { dependencies?: Record<string, string>, build?: { dependencies: Record<string, string> } }> = {
    'a.org': { dependencies: { 'b.org': '^1', 'shared.org': '>=1' }, build: { dependencies: { 'unused-compiler.org': '*' } } },
    'b.org': { dependencies: { 'c.org': '^1' } },
    'c.org': { dependencies: { 'd.org': '^1' } },
    'd.org': { dependencies: { 'e.org': '^1', 'shared.org': '<2' } },
    'e.org': { dependencies: { 'a.org': '^1' } },
    'shared.org': {},
  }
  const visited: string[] = []
  const graph = await resolveBuildDependencyGraph(new Map([['a.org', 'a.org ^1']]), 'linux-x86-64', async (domain) => {
    visited.push(domain)
    if (!recipes[domain]) throw new Error('missing recipe')
    return recipes[domain]
  })
  expect(graph.has('e.org')).toBe(true)
  expect(graph.get('shared.org')).toBe('shared.org >=1 <2')
  expect(graph.has('unused-compiler.org')).toBe(false)
  expect(visited.length).toBe(6)
  await expect(resolveBuildDependencyGraph(new Map([['missing.org', 'missing.org ^1']]), 'linux-x86-64', async () => { throw new Error('missing recipe') })).rejects.toThrow('missing recipe')
})

test('recipe build and runtime bounds intersect even when metadata repeats the first bound', () => {
  const graph = collectBuildDependencies({ dependencies: ['shared.org >=1'] }, ['shared.org >=1'], ['shared.org <2'])
  expect(graph.get('shared.org')).toBe('shared.org >=1<2')
})
