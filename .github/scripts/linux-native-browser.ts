import assert from 'node:assert/strict'
import { mkdir, mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { resolveNativeExecutable } from '../../packages/action/src/native-executable'

assert.equal(process.platform, 'linux')
assert.notEqual(process.getuid?.(), 0, 'Exercise installation as an unprivileged user')
assert(process.env.PANTRY_TEST_CLI, 'Supply the actual source Linux CLI')
const cli = resolve(process.env.PANTRY_TEST_CLI)
const artifacts = join(import.meta.dir, '../../artifacts/linux-native-browser')
await mkdir(artifacts, { recursive: true })
const root = await mkdtemp(join(tmpdir(), 'pantry native Chrome '))
const env = { ...process.env, XDG_DATA_HOME: join(root, 'data'), XDG_CACHE_HOME: join(root, 'cache'), PANTRY_VERBOSE: '1', NO_COLOR: '1' }
const proof: Record<string, unknown> = { passed: false, cliSha256: Bun.SHA256.hash(await readFile(cli), 'hex') }

async function run(name: string, args: string[], timeout = 30_000): Promise<string> {
  const stdout = join(artifacts, `${name}.stdout.log`)
  const stderr = join(artifacts, `${name}.stderr.log`)
  const child = Bun.spawn(args, { cwd: root, env, stdout: Bun.file(stdout), stderr: Bun.file(stderr), signal: AbortSignal.timeout(timeout) })
  const code = await child.exited
  const output = await Bun.file(stdout).text() + await Bun.file(stderr).text()
  if (name === 'install')
    assert.match(output, /\[verbose:installer\]/, 'Named native installs must preserve --verbose diagnostics')
  assert.equal(code, 0, `${name}: ${output}`)
  return output
}

/**
 * Run with nothing inherited but HOME and a PATH without the package, so only
 * its own layout resolves libraries. LD_DEBUG=files makes the dynamic loader
 * report each library it initialises (on stderr) without changing a lookup.
 */
async function runClean(name: string, args: string[], timeout = 60_000): Promise<{ stdout: string, stderr: string }> {
  const stdout = join(artifacts, `${name}.stdout.log`)
  const stderr = join(artifacts, `${name}.stderr.log`)
  const child = Bun.spawn(args, { cwd: root, env: { HOME: root, PATH: '/usr/bin:/bin', LD_DEBUG: 'files' }, stdout: Bun.file(stdout), stderr: Bun.file(stderr), signal: AbortSignal.timeout(timeout) })
  const code = await child.exited
  const output = { stdout: await Bun.file(stdout).text(), stderr: await Bun.file(stderr).text() }
  assert.equal(code, 0, `${name}: ${output.stdout}${output.stderr.slice(-4000)}`)
  return output
}

/**
 * Ubuntu 23.10+ lets an unprivileged program create user namespaces - which
 * Chrome's sandbox needs - only under an AppArmor profile that allows it.
 * Ubuntu ships one for /opt/google/chrome/chrome; this grants the same, and
 * only that, to the installed binary. The browser keeps its sandbox: no
 * --no-sandbox, and the restriction stays on for everything else.
 */
async function allowSandbox(binary: string): Promise<string> {
  const restricted = await readFile('/proc/sys/kernel/apparmor_restrict_unprivileged_userns', 'utf8').then(value => value.trim() === '1').catch(() => false)
  if (!restricted) return 'not restricted'
  const profile = join(root, 'pantry-chrome-userns')
  await Bun.write(profile, `abi <abi/4.0>,\ninclude <tunables/global>\nprofile pantry-chrome-userns "${binary}" flags=(unconfined) {\n  userns,\n}\n`)
  const load = Bun.spawnSync(['sudo', '-n', 'apparmor_parser', '-r', profile], { stdout: 'pipe', stderr: 'pipe' })
  assert.equal(load.exitCode, 0, `Could not load the sandbox profile: ${load.stderr.toString()}`)
  loadedProfile = profile
  return 'pantry-chrome-userns'
}
let loadedProfile: string | undefined

try {
  proof.cliVersion = (await run('cli-version', [cli, '--version'])).trim()
  // The exact published package and ordinary install path used by HQ's CI.
  // A private XDG tree prevents an inherited installation from hiding failure.
  await run('install', [cli, 'install', 'git-scm.org@2.53.0', 'google.com/chrome@155.0.8059.84', '--no-save', '--verbose'], 600_000)
  const entry = join(root, 'pantry/.bin/google-chrome-stable')
  const executable = resolveNativeExecutable(entry)
  assert(executable.startsWith(`${root}/pantry/`), 'Use the installed package, not a host browser')
  proof.executableSha256 = Bun.SHA256.hash(await readFile(executable), 'hex')
  proof.version = (await run('chrome-version', [entry, '--version'])).trim()
  assert.match(String(proof.version), /\b155\.0\.8059\.84\b/)

  // --version starts no browser: NSS, the sandbox and the renderer never load.
  // Render a page with the sandbox on, from a clean environment - no
  // LD_LIBRARY_PATH, nothing inherited - so every library has to come from the
  // package's own layout. This is what failed with nss_error=-8023 when the
  // package left out libfreeblpriv3, a provider NSS loads with dlopen.
  proof.sandboxProfile = await allowSandbox(executable)
  const page = join(root, 'render-profile')
  await mkdir(page)
  const rendered = await runClean('chrome-render', [entry, '--headless=new', '--disable-gpu', '--no-first-run', `--user-data-dir=${page}`, '--dump-dom', 'data:text/html,<h1 id="pantry">rendered by the installed package</h1>'])
  assert.match(rendered.stdout, /<h1 id="pantry">rendered by the installed package<\/h1>/, 'Chrome must render with its own libraries and its sandbox')
  proof.rendered = true

  // A render alone is not proof: a host NSS (GitHub's image ships one with its
  // own Chrome) answers NSS's dlopen fallback for a provider the package left
  // out, and the page renders anyway. Require the loader to have initialised
  // softokn and its crypto provider from the installed package itself.
  const initialised = [...rendered.stderr.matchAll(/calling init: (\S+)/g)].map(match => match[1]!)
  const nss = initialised.filter(path => /\/lib(?:softokn3|freeblpriv3)\.so$/.test(path))
  proof.nssModules = [...new Set(nss)]
  for (const module of ['libsoftokn3.so', 'libfreeblpriv3.so']) {
    const loaded = nss.filter(path => path.endsWith(`/${module}`))
    assert(loaded.length > 0, `Chrome never initialised ${module}`)
    for (const path of loaded)
      assert(path.startsWith(`${root}/pantry/`), `${module} came from ${path}, not the installed package`)
  }
  proof.passed = true
}
finally {
  if (loadedProfile) Bun.spawnSync(['sudo', '-n', 'apparmor_parser', '-R', loadedProfile])
  await rm(root, { recursive: true, force: true })
  proof.cleaned = true
  await Bun.write(join(artifacts, 'proof.json'), JSON.stringify(proof, null, 2) + '\n')
}
