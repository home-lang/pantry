import { expect, test } from 'bun:test'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { bundleRuntimeLibraries } from '../scripts/native-runtime'

test('runtime validation reports every unresolved library before refusing publication', () => {
  const root = mkdtempSync(join(tmpdir(), 'pantry-missing-libraries-'))
  try {
    mkdirSync(join(root, 'bin'))
    writeFileSync(join(root, 'bin/app.fixture'), 'fixture')
    const tool = join(root, 'inspect-needed')
    writeFileSync(tool, '#!/bin/sh\nprintf "%s\\n" libmissing-first.so libmissing-second.so\n', { mode: 0o700 })
    let error: unknown
    try { bundleRuntimeLibraries(root, 'linux-x86-64', [], file => file.endsWith('.fixture'), tool) }
    catch (value) { error = value }
    expect(error).toBeInstanceOf(Error)
    expect(String(error)).toContain('libmissing-first.so required by bin/app.fixture')
    expect(String(error)).toContain('libmissing-second.so required by bin/app.fixture')
  }
  finally { rmSync(root, { recursive: true, force: true }) }
})
