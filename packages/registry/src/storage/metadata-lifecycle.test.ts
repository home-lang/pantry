import { expect, test } from 'bun:test'
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { FileMetadataStorage } from './metadata'

test('flush persists a queued mutation before a second store loads it', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'pantry-metadata-lifecycle-'))
  const file = join(directory, 'metadata.json')
  const store = new FileMetadataStorage(file)
  try {
    await store.putVersion('test-package', '1.0.0', { name: 'test-package', version: '1.0.0', publishedAt: '2026-10-18T00:00:00Z' })
    await store.flush()
    const reopened = new FileMetadataStorage(file)
    await reopened.flush()
    expect(await reopened.getPackageVersion('test-package', '1.0.0')).toMatchObject({ name: 'test-package', version: '1.0.0' })
    expect(existsSync(directory)).toBe(true)
  }
  finally {
    await store.flush()
    rmSync(directory, { recursive: true, force: true })
  }
})

test('flushing a read-only invalid snapshot preserves the original file', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'pantry-metadata-lifecycle-'))
  const file = join(directory, 'metadata.json')
  const original = 'invalid retained snapshot'
  writeFileSync(file, original)
  const store = new FileMetadataStorage(file)
  try {
    await store.flush()
    expect(readFileSync(file, 'utf8')).toBe(original)
  }
  finally {
    await store.flush()
    rmSync(directory, { recursive: true, force: true })
  }
})
