import { expect, test } from 'bun:test'
import { mkdtemp, rm, writeFile, readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

test('deployment selects its requested commit after main advances during CI', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'pantry-deploy-revision-'))
  const env = { ...process.env, GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: join(directory, 'gitconfig'), GIT_AUTHOR_NAME: 'Fixture', GIT_AUTHOR_EMAIL: 'fixture@example.test', GIT_COMMITTER_NAME: 'Fixture', GIT_COMMITTER_EMAIL: 'fixture@example.test' }
  const git = (cwd: string, ...args: string[]): string => {
    const result = Bun.spawnSync(['git', ...args], { cwd, env, stdout: 'pipe', stderr: 'pipe' })
    expect(result.exitCode, result.stderr.toString()).toBe(0)
    return result.stdout.toString().trim()
  }
  try {
    await writeFile(env.GIT_CONFIG_GLOBAL, '')
    git(directory, 'init', '--bare', '--initial-branch=main', 'origin.git')
    git(directory, 'clone', join(directory, 'origin.git'), 'writer')
    const writer = join(directory, 'writer')
    await writeFile(join(writer, 'candidate.txt'), 'The approved candidate\n')
    git(writer, 'add', 'candidate.txt'); git(writer, 'commit', '-m', 'test: original candidate'); git(writer, 'push', 'origin', 'main')
    const approved = git(writer, 'rev-parse', 'HEAD')
    git(directory, 'clone', join(directory, 'origin.git'), 'deployed')
    const deployed = join(directory, 'deployed')
    await writeFile(join(writer, 'candidate.txt'), 'A later recipe update\n')
    git(writer, 'add', 'candidate.txt'); git(writer, 'commit', '-m', 'test: later update'); git(writer, 'push', 'origin', 'main')
    expect(git(writer, 'rev-parse', 'HEAD')).not.toBe(approved)

    // Execute the actual production checkout and identity-check block with a
    // local remote that moved after the approved deployment was requested.
    const workflow = await readFile(resolve(import.meta.dir, '../../../.github/workflows/deploy-registry.yml'), 'utf8')
    const block = workflow.match(/^ {12}git fetch [^\n]+\n[\s\S]*?^ {12}fi$/m)?.[0]
    expect(block).toBeDefined()
    const script = block!.split('\n').map(line => line.slice(12)).join('\n')
    const result = Bun.spawnSync(['bash', '-e', '-c', script], { cwd: deployed, env: { ...env, EXPECTED_SHA: approved }, stdout: 'pipe', stderr: 'pipe' })
    expect(result.exitCode, result.stderr.toString()).toBe(0)
    expect(git(deployed, 'rev-parse', 'HEAD')).toBe(approved)
    expect(await readFile(join(deployed, 'candidate.txt'), 'utf8')).toBe('The approved candidate\n')

    const missing = Bun.spawnSync(['bash', '-e', '-c', script], { cwd: deployed, env: { ...env, EXPECTED_SHA: 'f'.repeat(40) }, stdout: 'pipe', stderr: 'pipe' })
    expect(missing.exitCode).not.toBe(0)
    expect(git(deployed, 'rev-parse', 'HEAD')).toBe(approved)
  }
  finally { await rm(directory, { recursive: true, force: true }) }
})
