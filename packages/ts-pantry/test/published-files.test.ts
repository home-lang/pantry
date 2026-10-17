import { expect, test } from 'bun:test'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { selectPublishedFiles } from '../scripts/published-files'
import { recipe } from '../src/recipes/postgresql.org/libpq'

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
