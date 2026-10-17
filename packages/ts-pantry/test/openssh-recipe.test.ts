import { expect, test } from 'bun:test'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { recipe } from '../src/recipes/openssh.com'
import { loadRecipe } from '../scripts/recipe-loader'

test('OpenSSH compiles both clients with the upstream portable transport setting', async () => {
  expect(recipe.dependencies['openssl.org']).toBe('^3')
  expect(recipe.build.script).toContain('make --jobs {{hw.concurrency}} SSH_PROGRAM=ssh')
  expect(recipe.build.script).toContain('make --jobs 1 SSH_PROGRAM=ssh install')
  expect((await loadRecipe('openssh.com')).recipe.test?.required).toBe(true)
  const builder = readFileSync(join(import.meta.dir, '../scripts/build-all-packages.ts'), 'utf8')
  expect(builder.slice(builder.indexOf('const CUSTOM_BUILD_DOMAINS'), builder.indexOf('/**', builder.indexOf('const CUSTOM_BUILD_DOMAINS')))).toContain("'openssh.com'")
})

for (const broken of [null, 'scp', 'sftp']) {
  test(`the required relocated-client gate ${broken ? `rejects an absolute build path in ${broken}` : 'accepts PATH-resolved managed transport'}`, async () => {
    const root = mkdtempSync(join(tmpdir(), 'pantry-openssh-health-'))
    const prefix = join(root, 'package with spaces')
    try {
      mkdirSync(join(prefix, 'bin'), { recursive: true })
      for (const client of ['scp', 'sftp'])
        writeFileSync(join(prefix, 'bin', client), `#!/bin/sh\nexec ${client === broken ? '/nonexistent/build-worker/bin/ssh' : 'ssh'} "$@"\n`, { mode: 0o755 })
      const script = join(root, 'health.sh')
      writeFileSync(script, `set -eu\n${recipe.test!.script.join('\n').replaceAll('{{prefix}}', prefix)}\n`)
      const child = Bun.spawn(['bash', script], { stdout: 'pipe', stderr: 'pipe' })
      const [status, stdout, stderr] = await Promise.all([child.exited, new Response(child.stdout).text(), new Response(child.stderr).text()])
      if (broken) expect(status).not.toBe(0)
      else expect(status, stdout + stderr).toBe(0)
    }
    finally { rmSync(root, { recursive: true, force: true }) }
  })
}
