import { afterAll, describe, expect, test } from 'bun:test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { parseYamlScalar, readPantryPackageInfo } from '../src/fetch'

describe('parseYamlScalar', () => {
  test('drops an inline comment after a plain version', () => {
    expect(parseYamlScalar('=8.6.16 # 9.0.2 introduced a build issue on darwin')).toBe('=8.6.16')
    expect(parseYamlScalar('^2   # v0.7.0 requires it')).toBe('^2')
    expect(parseYamlScalar('~1.9\t# as of v4.1.0')).toBe('~1.9')
    expect(parseYamlScalar('^1.2')).toBe('^1.2')
  })

  test('a # with no whitespace before it is part of a plain value', () => {
    expect(parseYamlScalar('1.0#rc')).toBe('1.0#rc')
  })

  test('drops an inline comment after a quoted version', () => {
    expect(parseYamlScalar('\'>=3.11<3.15\' # the venv needs it')).toBe('>=3.11<3.15')
    expect(parseYamlScalar('"~3.12" # no torch<2.3.0 for 3.13')).toBe('~3.12')
    expect(parseYamlScalar('\'*\'')).toBe('*')
  })

  test('keeps a # inside quotes', () => {
    expect(parseYamlScalar('"1.0 # rc" # trailing')).toBe('1.0 # rc')
    expect(parseYamlScalar('\'it\'\'s # here\' # comment')).toBe('it\'s # here')
  })

  test('a comment that contains a quote does not cut the version', () => {
    // package.yml's `boost.org: <1.89 # doesn't build with 1.89` came out of
    // the old regex as `<1.89 # doesn`.
    expect(parseYamlScalar('<1.89 # doesn\'t build with 1.89')).toBe('<1.89')
  })
})

describe('readPantryPackageInfo strips inline comments from dependency versions', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pantry-yaml-comments-'))
  afterAll(() => fs.rmSync(dir, { recursive: true, force: true }))

  const pkg = 'example.org/tool'
  fs.mkdirSync(path.join(dir, pkg), { recursive: true })
  fs.writeFileSync(path.join(dir, pkg, 'package.yml'), [
    'dependencies:',
    '  zlib.net: 1',
    '  git-scm.org: ^2 # v0.7.0 requires it',
    '  boost.org: <1.89 # doesn\'t build with 1.89',
    '  python.org: \'~3.12\' # no torch<2.3.0 for 3.13',
    '  curl.se: \'*\'',
    '  linux:',
    '    gnu.org/gcc/libstdcxx: ^14 # needs newer libstdc++',
    '  darwin:',
    '    tcl-lang.org: =8.6.16 # 9.0.2 introduced a build issue on darwin',
    '',
    'runtime:',
    '  nodejs.org: \'>=18\' # for the hooks',
    '',
  ].join('\n'))

  test('runtime, OS-specific and companion dependencies', async () => {
    const info = await readPantryPackageInfo(pkg, dir)
    expect(info?.dependencies).toEqual([
      'zlib.net@1',
      'git-scm.org^2',
      'boost.org<1.89',
      'python.org~3.12',
      'curl.se',
      'linux:gnu.org/gcc/libstdcxx^14',
      'darwin:tcl-lang.org=8.6.16',
    ])
    expect(info?.companions).toEqual(['nodejs.org>=18'])
    for (const spec of [...info!.dependencies!, ...info!.companions!])
      expect(spec).not.toContain('#')
  })
})

describe('dependency platform groups in package metadata', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pantry-yaml-platforms-'))
  afterAll(() => fs.rmSync(dir, { recursive: true, force: true }))

  test('keeps OS/architecture groups, comments, blank lines and build scopes structural', async () => {
    const pkg = 'example.org/platforms'
    fs.mkdirSync(path.join(dir, pkg), { recursive: true })
    fs.writeFileSync(path.join(dir, pkg, 'package.yml'), `dependencies:
  zlib.net: 1
  python.org: 3.10 # keep the minor version's trailing zero
  darwin/x86-64: # since 15.1.0
    libisl.sourceforge.io: ^0

  # A note does not end the dependency section.
  linux/aarch64:
    openssl.org: ^3
  curl.se: '*'
build:
  dependencies:
    gnu.org/make: '*'
    linux/x86-64:
      gnu.org/gcc: ^14
  script:
    - echo build
runtime:
  nodejs.org: '>=18'
  python.org: 3.10
  env:
    PATH: '${'${{prefix}}'}/bin'
`)
    const info = await readPantryPackageInfo(pkg, dir)
    expect(info?.dependencies).toEqual([
      'zlib.net@1',
      'python.org@3.10',
      'darwin/x86-64:libisl.sourceforge.io^0',
      'linux/aarch64:openssl.org^3',
      'curl.se',
    ])
    expect(info?.buildDependencies).toEqual(['gnu.org/make', 'linux/x86-64:gnu.org/gcc^14'])
    expect(info?.companions).toEqual(['nodejs.org>=18', 'python.org@3.10'])
  })
})

describe('generate-zig never emits a dependency note', () => {
  test('stripSpecComment', async () => {
    const { stripSpecComment } = await import('../src/generate-zig')
    expect(stripSpecComment('git-scm.org^2 # v0.7.0 requires it')).toBe('git-scm.org^2')
    expect(stripSpecComment('darwin:tcl-lang.org=8.6.16 # 9.0.2 introduced a build issue on darwin')).toBe('darwin:tcl-lang.org=8.6.16')
    expect(stripSpecComment('zlib.net^1')).toBe('zlib.net^1')
  })

  test('no package file carries one', () => {
    const root = path.join(import.meta.dir, '..', 'src', 'packages')
    const offenders: string[] = []
    const walk = (dir: string): void => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name)
        if (entry.isDirectory()) {
          walk(full)
          continue
        }
        if (!entry.name.endsWith('.ts'))
          continue
        for (const m of fs.readFileSync(full, 'utf-8').matchAll(/(?:dependencies|buildDependencies|companions): \[([^\]]*)\]/g)) {
          for (const spec of m[1].matchAll(/'([^']*)'/g)) {
            if (/\s#/.test(spec[1]))
              offenders.push(`${path.relative(root, full)}: ${spec[1]}`)
          }
        }
      }
    }
    walk(root)
    expect(offenders).toEqual([])
  })
})
