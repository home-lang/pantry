import { expect, test } from 'bun:test'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { selectPublishedFiles } from '../scripts/published-files'
import { recipe } from '../src/recipes/postgresql.org/libpq'
import { recipe as freetype } from '../src/recipes/freetype.org'
import { recipe as x11 } from '../src/recipes/x.org/x11'
import { recipe as xcb } from '../src/recipes/x.org/xcb'

test('X11 and XCB export their libraries while canonical packages supply their dependency snapshots', () => {
  for (const [recipe, own, foreign] of [[x11, 'libX11.6.dylib', 'libxcb.1.dylib'], [xcb, 'libxcb.1.dylib', 'libXau.6.dylib']] as const) {
    const root = mkdtempSync(join(tmpdir(), 'pantry-x11-products-'))
    try {
      mkdirSync(join(root, 'lib'))
      for (const file of [own, foreign]) writeFileSync(join(root, 'lib', file), file)
      selectPublishedFiles(root, recipe.publish?.include)
      expect(existsSync(join(root, 'lib', own))).toBe(true)
      expect(existsSync(join(root, 'lib', foreign))).toBe(false)
    }
    finally { rmSync(root, { recursive: true, force: true }) }
  }
})

test('FreeType publishes its products before canonical declared runtimes are bundled', () => {
  const root = mkdtempSync(join(tmpdir(), 'pantry-freetype-products-'))
  try {
    for (const directory of ['lib/pkgconfig', 'include/freetype2']) mkdirSync(join(root, directory), { recursive: true })
    const products = ['lib/libfreetype.so.6.20.6', 'lib/pkgconfig/freetype2.pc', 'include/freetype2/ft2build.h']
    const privateSnapshots = ['lib/libpng16.so.16', 'lib/libbrotlidec.so.1', 'lib/libz.so.1']
    for (const file of [...products, ...privateSnapshots]) writeFileSync(join(root, file), file)
    symlinkSync('libfreetype.so.6.20.6', join(root, 'lib/libfreetype.so.6'))
    selectPublishedFiles(root, freetype.publish?.include)
    for (const file of [...products, 'lib/libfreetype.so.6']) expect(existsSync(join(root, file))).toBe(true)
    for (const file of privateSnapshots) expect(existsSync(join(root, file))).toBe(false)
    expect(freetype.dependencies?.['github.com/google/brotli']).toBe('1')
  }
  finally { rmSync(root, { recursive: true, force: true }) }
})

test('libpq exports its real client library, headers and license without server executables', () => {
  const root = mkdtempSync(join(tmpdir(), 'pantry-libpq-products-'))
  try {
    for (const directory of ['bin', 'include', 'lib/pkgconfig']) mkdirSync(join(root, directory), { recursive: true })
    for (const file of ['bin/initdb', 'bin/postgres', 'bin/pg_config', 'lib/libpq.so.5.18', 'include/libpq-fe.h', 'lib/pkgconfig/libpq.pc', 'COPYRIGHT']) writeFileSync(join(root, file), file)
    symlinkSync('libpq.so.5.18', join(root, 'lib/libpq.so.5'))
    symlinkSync('.', join(root, 'lib/directory-loop'))
    expect(() => selectPublishedFiles(root, ['../*'])).toThrow('package-relative')
    expect(() => selectPublishedFiles(root, ['missing/*'])).toThrow('no package products')
    expect(existsSync(join(root, 'bin/initdb'))).toBe(true)
    selectPublishedFiles(root, recipe.publish?.include)
    for (const file of ['bin/pg_config', 'include/libpq-fe.h', 'lib/libpq.so.5', 'lib/pkgconfig/libpq.pc', 'COPYRIGHT']) expect(existsSync(join(root, file))).toBe(true)
    expect(readFileSync(join(root, 'lib/libpq.so.5'), 'utf8')).toBe('lib/libpq.so.5.18')
    expect(existsSync(join(root, 'bin/initdb'))).toBe(false)
    expect(existsSync(join(root, 'bin/postgres'))).toBe(false)
    expect(existsSync(join(root, 'lib/directory-loop'))).toBe(false)
  }
  finally { rmSync(root, { recursive: true, force: true }) }
})

test('libpq source URLs preserve PostgreSQL upstream version spelling', async () => {
  const { loadRecipe } = await import('../scripts/recipe-loader')
  expect((await loadRecipe('postgresql.org/libpq', 'linux-x86-64', '18.0.0')).recipe.distributable?.url).toBe('https://ftp.postgresql.org/pub/source/v18.0/postgresql-18.0.tar.bz2')
  expect((await loadRecipe('postgresql.org/libpq', 'linux-x86-64', '18.0')).recipe.distributable?.url).toBe('https://ftp.postgresql.org/pub/source/v18.0/postgresql-18.0.tar.bz2')
  expect((await loadRecipe('postgresql.org/libpq', 'linux-x86-64', '17.10.0')).recipe.distributable?.url).toBe('https://ftp.postgresql.org/pub/source/v17.10/postgresql-17.10.tar.bz2')
  expect((await loadRecipe('postgresql.org/libpq', 'linux-x86-64', '9.6.24')).recipe.distributable?.url).toBe('https://ftp.postgresql.org/pub/source/v9.6.24/postgresql-9.6.24.tar.bz2')
})

test('sourceable interface declarations are checked before publication', async () => {
  const { writeProgramInterfaces } = await import('../scripts/published-files')
  const root = mkdtempSync(join(tmpdir(), 'pantry-program-interfaces-'))
  try {
    mkdirSync(join(root, 'bin'))
    writeFileSync(join(root, 'bin/library.sh'), '#!/bin/sh\nfixture() { :; }\n')
    expect(() => writeProgramInterfaces(root, ['../library.sh'])).toThrow('existing package bin files')
    expect(() => writeProgramInterfaces(root, ['missing.sh'])).toThrow('existing package bin files')
    writeProgramInterfaces(root, ['library.sh'])
    expect(JSON.parse(readFileSync(join(root, 'share/pantry/interfaces.json'), 'utf8'))).toEqual({ version: 1, sourceablePrograms: ['library.sh'] })
  }
  finally { rmSync(root, { recursive: true, force: true }) }
})
