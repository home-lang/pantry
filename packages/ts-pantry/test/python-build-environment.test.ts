import { expect, test } from 'bun:test'
import { mkdirSync, mkdtempSync, realpathSync, rmSync, symlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { dependencyPythonPaths } from '../scripts/python-build-environment'

test('declared Python modules include regular and private venv layouts without duplicate aliases', () => {
  const root = realpathSync(mkdtempSync(join(tmpdir(), 'pantry-python-modules-')))
  try {
    const plain = join(root, 'lib/python3.12/site-packages')
    const venv = join(root, 'venv/lib/python3.13/site-packages')
    mkdirSync(plain, { recursive: true })
    mkdirSync(venv, { recursive: true })
    symlinkSync('python3.12', join(root, 'lib/python3'))
    expect(dependencyPythonPaths([root, root])).toEqual([plain, venv])
    const outside = mkdtempSync(join(tmpdir(), 'pantry-foreign-python-'))
    try {
      symlinkSync(outside, join(root, 'lib/python3.14'))
      mkdirSync(join(outside, 'site-packages'))
      expect(() => dependencyPythonPaths([root])).toThrow('escapes its declared package')
    }
    finally { rmSync(outside, { recursive: true, force: true }) }
  }
  finally { rmSync(root, { recursive: true, force: true }) }
})
