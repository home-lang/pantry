import { expect, test } from 'bun:test'
import { realpathSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { recipe } from '../../ts-pantry/src/recipes/openssh.com'

const bin = process.env.PANTRY_NATIVE_OPENSSH_TEST_BIN

test.skipIf(!bin)('the Pantry-installed scp and sftp select managed SSH after relocation', async () => {
  const scp = realpathSync(join(bin!, 'scp'))
  const prefix = dirname(dirname(scp))
  expect(prefix).toContain('/openssh.com/')
  const child = Bun.spawn(['bash', '-ec', recipe.test!.script.join('\n').replaceAll('{{prefix}}', prefix)], {
    env: { ...process.env, PATH: `${bin}:${process.env.PATH}` }, stdout: 'pipe', stderr: 'pipe',
  })
  const [status, stdout, stderr] = await Promise.all([child.exited, new Response(child.stdout).text(), new Response(child.stderr).text()])
  expect(status, stdout + stderr).toBe(0)
}, 30_000)
