import assert from 'node:assert/strict'
import { cp, mkdir, mkdtemp, rename, rm, symlink } from 'node:fs/promises'
import { chmodSync, cpSync, mkdtempSync, renameSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, relative } from 'node:path'

assert.equal(process.platform, 'win32')
const root = await mkdtemp(join(tmpdir(), 'pantry relocation probe '))
const report: Record<string, unknown> = { bun: Bun.version, phases: [] }
const phases: Array<Record<string, unknown>> = []
report.phases = phases

async function launch(command: string[], dispose = false) {
  const child = Bun.spawn(command, { cwd: root, stdout: 'pipe', stderr: 'pipe' })
  const [code, stdout, stderr] = await Promise.all([child.exited, new Response(child.stdout).text(), new Response(child.stderr).text()])
  assert.equal(code, 0, stderr)
  assert.equal(stdout.trim(), '1.4.3')
  if (dispose) await child[Symbol.asyncDispose]()
}

try {
  for (const phase of ['unlaunched', 'async-real', 'async-link', 'disposed-link', 'sync-link', 'worker-link', 'copy-sync', 'copy-sync-launched', 'copy-readonly']) {
    const tree = join(root, phase, 'pantry')
    await mkdir(join(tree, '.bin'), { recursive: true })
    let binary = join(tree, 'package/bun.exe')
    if (phase.startsWith('copy-')) {
      const source = join(root, `${phase}-source`)
      await mkdir(join(source, 'lib/include'), { recursive: true })
      await cp(process.execPath, join(source, 'bun.exe'))
      for (let index = 0; index < 64; index++) writeFileSync(join(source, 'lib/include', `source-${index}.h`), 'fixture source bytes\n'.repeat(512))
      const domain = join(tree, 'ziglang.org')
      await mkdir(domain)
      const candidate = mkdtempSync(join(domain, '.pantry-install-'))
      cpSync(source, candidate, { recursive: true, verbatimSymlinks: true })
      chmodSync(candidate, phase === 'copy-readonly' ? 0o555 : statSync(source).mode & 0o777)
      const installed = join(domain, 'v0.17.0')
      renameSync(candidate, installed)
      binary = join(installed, 'bun.exe')
    }
    else {
      await mkdir(dirname(binary), { recursive: true })
      await cp(process.execPath, binary)
    }
    const alias = join(tree, '.bin/bun.exe')
    await symlink(relative(dirname(alias), binary), alias, 'file')
    if (phase === 'async-real') await launch([binary, '--version'])
    if (phase === 'async-link') await launch([alias, '--version'])
    if (phase === 'disposed-link') await launch([alias, '--version'], true)
    if (phase === 'copy-sync-launched') await launch([alias, '--version'])
    if (phase === 'sync-link') {
      const result = Bun.spawnSync([alias, '--version'], { cwd: root, stdout: 'pipe', stderr: 'pipe', timeout: 180_000 })
      assert.equal(result.exitCode, 0, result.stderr.toString())
      assert.equal(result.stdout.toString().trim(), '1.4.3')
    }
    if (phase === 'worker-link') {
      await launch([process.execPath, '-e', 'const p=Bun.spawn([process.argv[1],"--version"],{stdout:"pipe",stderr:"pipe"}); const [c,o,e]=await Promise.all([p.exited,new Response(p.stdout).text(),new Response(p.stderr).text()]);process.stdout.write(o);process.stderr.write(e);process.exitCode=c;', alias])
    }
    try {
      await rename(tree, join(root, phase, 'moved pantry'))
      phases.push({ phase, renamed: true })
    }
    catch (error) {
      phases.push({ phase, renamed: false, error: String(error) })
    }
    console.log(JSON.stringify(phases.at(-1)))
  }
}
finally {
  await rm(root, { recursive: true, force: true })
  report.cleaned = true
  await Bun.write('artifacts/windows-relocation-diagnostic.json', JSON.stringify(report, null, 2) + '\n')
}
if (phases.some(phase => !phase.renamed)) process.exitCode = 1
