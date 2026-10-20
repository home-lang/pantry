import assert from 'node:assert/strict'

/** Bumpx's normal post-version command: build and stage only tracked outputs. */
export function buildReleaseAction(cwd: string = process.cwd()): void {
  const outputs = ['packages/action/dist/index.js', 'packages/action/dist/post.js']
  const run = (args: string[]) => {
    const result = Bun.spawnSync(args, { cwd, stdout: 'pipe', stderr: 'pipe', timeout: 120_000 })
    assert.equal(result.exitCode, 0, Buffer.from(result.stdout).toString() + Buffer.from(result.stderr).toString())
  }
  run(['git', 'ls-files', '--error-unmatch', '--', ...outputs])
  run(['bun', 'run', '--cwd', 'packages/action', 'build'])
  run(['git', 'add', '--', ...outputs])
}

if (import.meta.main) buildReleaseAction()
