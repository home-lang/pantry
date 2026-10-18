import { expect, test } from 'bun:test'
import { mkdtempSync, realpathSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { interpolate } from '../scripts/build-package'

test('recipe tokens resolve while shell variables remain owned by the executing shell', () => {
  const root = mkdtempSync(join(tmpdir(), 'pantry-recipe-shell-'))
  try {
    const template = 'printf \'%s\\n\' "$PWD" "{{prefix}}" "${{version}}"'
    const script = interpolate(template, { prefix: '/installed', version: '1.2.3', PWD: '/not-the-shell-directory' })
    expect(script).toBe('printf \'%s\\n\' "$PWD" "/installed" "1.2.3"')
    const result = Bun.spawnSync(['bash', '-eu', '-c', script], { cwd: root })
    expect(result.exitCode).toBe(0)
    expect(result.stdout.toString()).toBe(`${realpathSync(root)}\n/installed\n1.2.3\n`)
    expect(interpolate('cat <<\'SOURCE\'\n$HOME\n\\$PWD\nSOURCE', {})).toBe('cat <<\'SOURCE\'\n$HOME\n\\$PWD\nSOURCE')
  }
  finally { rmSync(root, { recursive: true, force: true }) }
})
