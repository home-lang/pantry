import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { mkdir, mkdtemp, readFile, realpath, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { isAbsolute, join, relative } from 'node:path'

function within(root: string, path: string): boolean {
  const child = relative(root, path)
  return !!child && child !== '..' && !child.startsWith('../') && !isAbsolute(child)
}

export function ownedNssModules(stderr: string, ownedRoot: string): string[] {
  // Keep complete loader lines: package paths intentionally contain spaces.
  const initialized = [...stderr.matchAll(/calling init: (.+)$/gm)].map(match => match[1]!.trim())
  const modules = [...new Set(initialized.filter(path => /\/lib(?:softokn3|freeblpriv3)\.so$/.test(path)))]
  for (const name of ['libsoftokn3.so', 'libfreeblpriv3.so']) {
    const found = modules.filter(path => path.endsWith(`/${name}`))
    assert(found.length > 0, `Chrome never initialized ${name}`)
    for (const path of found) {
      assert(within(ownedRoot, path), `${name} came from ${path}, not the installed package`)
    }
  }
  return modules
}

/** Shared producer and installed-package health check; inherited libraries cannot satisfy it. */
export async function verifyChromeRuntime(entry: string, ownedRoot: string, binary?: string): Promise<{ rendered: true, nssModules: string[], sandboxProfile: string }> {
  assert.equal(process.platform, 'linux')
  assert.notEqual(process.getuid?.(), 0, 'Chrome must use its unprivileged sandbox')
  const owned = await realpath(ownedRoot)
  const executable = await realpath(binary ?? entry)
  assert(within(owned, executable), 'Chrome executable is outside its installed package')
  const root = await mkdtemp(join(tmpdir(), 'pantry Chrome runtime '))
  let loadedProfile: string | undefined
  let sandboxProfile = 'not restricted'
  try {
    const restricted = await readFile('/proc/sys/kernel/apparmor_restrict_unprivileged_userns', 'utf8').then(value => value.trim() === '1').catch(() => false)
    if (restricted) {
      assert(!/[\r\n]/.test(executable), 'Invalid executable path')
      sandboxProfile = `pantry-chrome-${process.pid}-${randomUUID()}`
      const profile = join(root, 'apparmor-profile')
      const quoted = executable.replaceAll('\\', '\\\\').replaceAll('"', '\\"')
      await Bun.write(profile, `abi <abi/4.0>,\ninclude <tunables/global>\nprofile ${sandboxProfile} "${quoted}" flags=(unconfined) {\n  userns,\n}\n`)
      const load = Bun.spawnSync(['sudo', '-n', 'apparmor_parser', '-r', profile], { stdout: 'pipe', stderr: 'pipe' })
      assert.equal(load.exitCode, 0, `Could not load the binary-scoped sandbox profile: ${load.stderr.toString()}`)
      loadedProfile = profile
    }
    const profile = join(root, 'browser-profile')
    await mkdir(profile)
    const stdout = join(root, 'render.stdout.log')
    const stderr = join(root, 'render.stderr.log')
    const child = Bun.spawn([entry, '--headless=new', '--disable-gpu', '--no-first-run', `--user-data-dir=${profile}`, '--dump-dom', 'data:text/html,<h1 id="pantry">rendered by the installed package</h1>'], {
      cwd: root,
      env: { HOME: root, PATH: '/usr/bin:/bin', LD_DEBUG: 'files' },
      stdout: Bun.file(stdout), stderr: Bun.file(stderr), signal: AbortSignal.timeout(60_000),
    })
    const code = await child.exited
    const output = await readFile(stdout, 'utf8')
    const diagnostics = await readFile(stderr, 'utf8')
    assert.equal(code, 0, `Chrome render failed: ${diagnostics.slice(-4000)}`)
    assert.match(output, /<h1 id="pantry">rendered by the installed package<\/h1>/)
    const nssModules = ownedNssModules(diagnostics, owned)
    for (const module of nssModules)
      assert(within(owned, await realpath(module)), `NSS module escapes the installed package: ${module}`)
    return { rendered: true, nssModules, sandboxProfile }
  }
  finally {
    try {
      if (loadedProfile) {
        const unload = Bun.spawnSync(['sudo', '-n', 'apparmor_parser', '-R', loadedProfile], { stdout: 'pipe', stderr: 'pipe' })
        assert.equal(unload.exitCode, 0, 'Could not remove the temporary binary-scoped sandbox profile')
      }
    }
    finally { await rm(root, { recursive: true, force: true }) }
  }
}

if (import.meta.main) {
  const [entry, prefix] = process.argv.slice(2)
  assert(entry && prefix, 'Provide the actual Chrome program and its installed prefix')
  console.log(JSON.stringify(await verifyChromeRuntime(entry, prefix)))
}
