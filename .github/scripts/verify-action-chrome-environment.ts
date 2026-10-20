import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import type { ChildProcess } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { lstat, mkdir, mkdtemp, open, readFile, readdir, readlink, realpath, rm, writeFile } from 'node:fs/promises'
import { arch, release, tmpdir } from 'node:os'
import { isAbsolute, join, relative, resolve } from 'node:path'
import { resolveNativeExecutable } from '../../packages/action/src/native-executable'
import { ownedNssModules } from '../../packages/ts-pantry/src/recipes/props/google.com/chrome/health'
import { addressSpaceArgv, addressSpaceLimit, boundedLogWriter, chromeAddressSpaceCases, chromeEnvironments, elfIdentity, nssLibraryOrigins, sha256, visibleBrowserEnvironment } from './chrome-environment-fixture'

// Diagnostic only: no installer, Action behavior, or existing health oracle changes.
// Each pair changes only LD_LIBRARY_PATH; no process-wide environment is changed.
const artifacts = resolve('artifacts/action-chrome-environment')
await mkdir(artifacts, { recursive: true })
const comparison = process.env.PANTRY_CHROME_COMPARISON ?? 'environment'
assert(comparison === 'environment' || comparison === 'address-space')
const proof: Record<string, unknown> = { passed: false, comparison, action: 'pantry-pm/pantry/packages/action@8bb811bc8e1d241e8c21adf5c8d961cd498a8dcd', version: '0.11.105', outcomes: [] }
const outcomes = proof.outcomes as Record<string, unknown>[]
let root: string | undefined
let loadedProfile: string | undefined

async function installedPackages(directory: string, depth = 0): Promise<object[]> {
  assert(depth <= 6, 'Unexpected native tree nesting')
  const entries = await readdir(directory, { withFileTypes: true })
  const found: object[] = []
  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    if (!entry.isDirectory() || entry.name.startsWith('.')) continue
    const path = join(directory, entry.name)
    if (/^v\d/.test(entry.name)) {
      const manifests: object[] = []
      for (const name of ['package.json', 'pantry.json']) {
        try {
          const manifestPath = join(path, name)
          const info = await lstat(manifestPath)
          assert(info.isFile() && info.size < 1024 * 1024, 'Bound manifest reads')
          const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
          manifests.push({ path: manifestPath, sha256: await sha256(manifestPath), name: manifest.name, version: manifest.version, dependencies: manifest.dependencies })
        }
        catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error }
      }
      found.push({ path: relative(resolve('pantry'), path), manifests })
    }
    else found.push(...await installedPackages(path, depth + 1))
  }
  return found
}

async function policy(args: string[]): Promise<void> {
  const child = Bun.spawn(['sudo', '-n', 'apparmor_parser', ...args], { env: { PATH: '/usr/bin:/bin' }, stdout: 'pipe', stderr: 'pipe', signal: AbortSignal.timeout(10_000) })
  const [code, stdout, stderr] = await Promise.all([child.exited, new Response(child.stdout).text(), new Response(child.stderr).text()])
  assert.equal(code, 0, `AppArmor policy operation failed: ${stdout}${stderr}`)
}

try {
  assert.equal(process.platform, 'linux')
  assert.equal(process.arch, 'x64')
  assert.notEqual(process.getuid?.(), 0)
  assert.equal(Bun.version, '1.4.3')
  assert.equal((await readFile('/proc/sys/kernel/apparmor_restrict_unprivileged_userns', 'utf8')).trim(), '1', 'This reproduction requires the restricted Ubuntu sandbox, without a skip or sysctl change')
  assert.equal(process.env.POSTGRES_SERVICE_VERSION, '17.10')
  assert.equal(process.env.TYPESENSE_SERVICE_VERSION, '30.2')
  assert(process.env.LD_LIBRARY_PATH, 'Retain the ordinary Action aggregate library export')
  const cli = process.env.PANTRY_CHROME_ENVIRONMENT_CLI
  assert(cli && isAbsolute(cli))
  const version = Bun.spawnSync([cli, '--version'], { stdout: 'pipe', stderr: 'pipe' })
  assert.equal(version.exitCode, 0)
  assert.match(version.stdout.toString(), /pantry 0\.11\.105 \(8bb811bc8\)/)
  proof.host = { osRelease: await readFile('/etc/os-release', 'utf8'), kernel: release(), architecture: arch(), uid: process.getuid?.(), gid: process.getgid?.(), bun: Bun.version, bunExecutable: process.execPath }
  proof.parentAddressSpace = addressSpaceLimit(await readFile('/proc/self/limits', 'utf8'))
  proof.cli = { path: cli, version: version.stdout.toString().trim(), sha256: await sha256(cli) }
  const packages = await installedPackages(resolve('pantry'))
  proof.packages = packages
  proof.packageCount = packages.length
  const entry = resolve('pantry/.bin/google-chrome-stable')
  const executable = await realpath(resolveNativeExecutable(entry))
  const chromeRoot = await realpath(resolve('pantry/google.com/chrome/v155.0.8059.84.1'))
  const childPath = relative(chromeRoot, executable)
  assert(childPath && childPath !== '..' && !childPath.startsWith('../') && !isAbsolute(childPath))
  const activation = await lstat(entry)
  assert(activation.isSymbolicLink() || activation.size < 64 * 1024, 'Bound activation metadata reads')
  proof.activation = { entry, type: activation.isSymbolicLink() ? 'symlink' : 'file', content: activation.isSymbolicLink() ? await readlink(entry) : await readFile(entry, 'utf8'), executable }
  const identity = await elfIdentity(executable)
  assert.equal((identity as { sha256: string }).sha256, '7de178e4c291a24626d70c57267541407fbf9be457467f135d9f4f049ae2d878', 'Require the independently qualified original public Chrome ELF')
  assert.equal((identity as { bytes: number }).bytes, 298870153)
  proof.executableBefore = identity
  root = await mkdtemp(join(tmpdir(), 'pantry Chrome environment '))
  const profileFile = join(root, 'apparmor-profile')
  assert(!/[\r\n]/.test(executable))
  const profileName = `pantry-chrome-environment-${process.pid}-${randomUUID()}`
  const quoted = executable.replaceAll('\\', '\\\\').replaceAll('"', '\\"')
  const profile = `abi <abi/4.0>,\ninclude <tunables/global>\nprofile ${profileName} "${quoted}" flags=(unconfined) {\n  userns,\n}\n`
  await writeFile(profileFile, profile)
  proof.sandbox = { profileName, executable, profile, scope: 'Same exact binary-scoped userns permission for both arms; no global policy change' }
  await policy(['-Q', '-K', profileFile])
  // Register before loading: a timeout or uncertain load must still attempt removal.
  loadedProfile = profileFile
  await policy(['-r', '-K', profileFile])

  // Complete all four arms before asserting. Reset the identical disposable browser
  // profile path between arms; no package file or global environment is changed.
  const cases = comparison === 'address-space' ? chromeAddressSpaceCases(process.env) : chromeEnvironments(process.env, root)
  for (const { mode, environment, addressSpaceKiB, enforcement } of cases) {
    if (proof.ownedProcessUncertain) {
      outcomes.push({ mode, enforcement: enforcement ?? false, notAttempted: true, reason: 'Earlier owned process cleanup is unconfirmed', rendered: false, ownedNssPassed: false })
      continue
    }
    if (enforcement && !outcomes.some(outcome => outcome.mode === 'two-tib-address-space' && outcome.rendered && outcome.ownedNssPassed)) {
      outcomes.push({ mode, enforcement: true, notAttempted: true, reason: 'Finite candidate did not pass rendering and NSS checks', enforcementPassed: false })
      continue
    }
    const browserProfile = join(root, 'browser-profile')
    await rm(browserProfile, { recursive: true, force: true })
    await mkdir(browserProfile)
    const args = ['--headless=new', '--disable-gpu', '--no-first-run', `--user-data-dir=${browserProfile}`, '--dump-dom', 'data:text/html,<h1 id="pantry">rendered by the installed package</h1>']
    const program = enforcement ? [process.execPath, resolve(import.meta.dir, 'chrome-environment-fixture.ts'), '--probe-address-space-enforcement'] : [entry, ...args]
    const limitsPath = join(artifacts, `${mode}.limits.log`)
    const command = comparison === 'address-space' ? addressSpaceArgv(addressSpaceKiB ?? null, limitsPath, program) : program
    const stdoutPath = join(artifacts, `${mode}.stdout.log`)
    const stderrPath = join(artifacts, `${mode}.stderr.log`)
    const stdout = await open(stdoutPath, 'w')
    const stderr = await open(stderrPath, 'w')
    const result: Record<string, unknown> = { mode, enforcement: enforcement ?? false, args, command, cwd: root, environment: visibleBrowserEnvironment(environment), timeoutMs: 60_000, closeGraceMs: 5_000, logLimitBytesPerStream: 8 * 1024 * 1024, rendered: false, ownedNssPassed: false, cleanupConfirmed: false }
    outcomes.push(result)
    const started = performance.now()
    try {
      const child: ChildProcess = spawn(command[0]!, command.slice(1), { cwd: root, env: environment, detached: true, stdio: ['ignore', 'pipe', 'pipe'] })
      const killGroup = (): void => {
        if (!child.pid) return
        try { process.kill(-child.pid, 'SIGKILL') }
        catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ESRCH') result.killError = String(error) }
      }
      const capture = (stream: NodeJS.ReadableStream, fd: number, name: string): void => {
        const writer = boundedLogWriter(fd, 8 * 1024 * 1024)
        stream.on('data', (chunk: Buffer) => {
          try { writer.consume(chunk) }
          catch (error) { result.captureError = String(error); killGroup() }
          result[`${name}Bytes`] = writer.writtenBytes()
          if (writer.exceeded()) { result.logLimitExceeded = true; killGroup() }
        })
        stream.on('error', (error) => { result.captureError = String(error); killGroup() })
      }
      assert(child.stdout && child.stderr)
      capture(child.stdout, stdout.fd, 'stdout')
      capture(child.stderr, stderr.fd, 'stderr')
      const timer = setTimeout(() => { result.timedOut = true; killGroup() }, 60_000)
      let closeTimer: ReturnType<typeof setTimeout> | undefined
      let groupTimer: ReturnType<typeof setInterval> | undefined
      try {
        await new Promise<void>((resolveExit) => {
          const groupGone = (): boolean => {
            if (!child.pid) return true
            try { process.kill(-child.pid, 0); return false }
            catch (error) { return (error as NodeJS.ErrnoException).code === 'ESRCH' }
          }
          const confirmCleanup = (): void => {
            if (result.closeObserved && (result.exitObserved || !child.pid) && groupGone()) {
              result.cleanupConfirmed = true
              resolveExit()
            }
          }
          child.once('error', (error) => { result.error = String(error) })
          child.once('exit', (code, signal) => { result.exitObserved = true; result.exitCode = code; result.signal = signal; killGroup() })
          child.once('close', () => { result.closeObserved = true; confirmCleanup() })
          groupTimer = setInterval(confirmCleanup, 50)
          // This bound does not depend on 'close': an escaped descendant can
          // retain a pipe after the parent/group has been killed.
          closeTimer = setTimeout(() => {
            result.closeOrGroupUnconfirmed = true
            proof.ownedProcessUncertain = true
            killGroup()
            child.stdout?.removeAllListeners('data')
            child.stderr?.removeAllListeners('data')
            child.stdout?.destroy()
            child.stderr?.destroy()
            child.unref()
            resolveExit()
          }, 65_000)
        })
      }
      finally {
        clearTimeout(timer)
        if (closeTimer) clearTimeout(closeTimer)
        if (groupTimer) clearInterval(groupTimer)
        killGroup()
      }
    }
    catch (error) { result.error = String(error) }
    finally { await stdout.close(); await stderr.close(); result.elapsedMs = performance.now() - started }
    const output = await readFile(stdoutPath, 'utf8')
    const diagnostics = await readFile(stderrPath, 'utf8')
    result.nssLibraryOrigins = nssLibraryOrigins(diagnostics)
    result.stdoutSha256 = await sha256(stdoutPath)
    result.stderrSha256 = await sha256(stderrPath)
    if (comparison === 'address-space') {
      try {
        const effective = addressSpaceLimit(await readFile(limitsPath, 'utf8'))
        result.addressSpace = effective
        const expected = addressSpaceKiB === null ? proof.parentAddressSpace : { soft: (BigInt(addressSpaceKiB!) * 1024n).toString(), hard: (BigInt(addressSpaceKiB!) * 1024n).toString() }
        assert.deepEqual(effective, expected, 'The shell must enforce the requested actual soft AND hard limits')
        result.addressSpaceVerified = true
      }
      catch (error) { result.addressSpaceError = String(error) }
    }
    if (enforcement) {
      try {
        assert.equal(result.exitCode, 0)
        assert(result.cleanupConfirmed && result.addressSpaceVerified && !result.error && !result.timedOut && !result.captureError && !result.killError && !result.logLimitExceeded)
        const oracle = JSON.parse(output)
        assert(oracle.passed && oracle.oversizedRejected && oracle.hardCapRaiseRejected && oracle.smallReservationReleased && oracle.reservedPagesTouched === false)
        assert.equal(oracle.oversizedErrno, 12)
        assert.equal(oracle.raiseErrno, 1)
        result.oracle = oracle
        result.enforcementPassed = true
      }
      catch (error) { result.enforcementError = String(error) }
      continue
    }
    try {
      assert.equal(result.exitCode, 0)
      assert(result.cleanupConfirmed && !result.error && !result.timedOut && !result.captureError && !result.killError && !result.logLimitExceeded)
      if (comparison === 'address-space') assert(result.addressSpaceVerified)
      assert.match(output, /<h1 id="pantry">rendered by the installed package<\/h1>/)
      result.rendered = true
    }
    catch (error) { result.renderError = String(error) }
    try {
      result.nssModules = ownedNssModules(diagnostics, chromeRoot)
      for (const module of result.nssModules as string[]) {
        const resolved = relative(chromeRoot, await realpath(module))
        assert(resolved && resolved !== '..' && !resolved.startsWith('../') && !isAbsolute(resolved))
      }
      result.ownedNssPassed = true
    }
    catch (error) { result.nssOwnershipError = String(error) }
  }
  proof.executableAfter = await elfIdentity(executable)
  assert.deepEqual(proof.executableAfter, identity, 'Both arms must use unchanged installed ELF bytes')
  assert.equal(outcomes.length, 4)
  const browsers = outcomes.filter(outcome => !outcome.enforcement)
  proof.allRendered = browsers.every(outcome => outcome.rendered)
  proof.allOwnedNss = browsers.every(outcome => outcome.ownedNssPassed)
  if (comparison === 'address-space') {
    const baseline = outcomes.find(outcome => outcome.mode === 'normal-address-space')!
    const eight = outcomes.find(outcome => outcome.mode === 'eight-gib-address-space')!
    const candidate = outcomes.find(outcome => outcome.mode === 'two-tib-address-space')!
    const oracle = outcomes.find(outcome => outcome.mode === 'two-tib-enforcement')!
    proof.eightGiBSigtrapReproduced = eight.signal === 'SIGTRAP' && !eight.rendered && eight.addressSpaceVerified && eight.cleanupConfirmed
    proof.finiteCandidateRendered = candidate.rendered && candidate.ownedNssPassed && candidate.addressSpaceVerified
    proof.finiteCapEnforced = oracle.enforcementPassed
    assert(baseline.rendered && baseline.ownedNssPassed && baseline.addressSpaceVerified, 'Normal baseline must remain healthy')
    assert(proof.eightGiBSigtrapReproduced, 'Capture the actual 8 GiB SIGTRAP before attributing the HQ failure to this limit')
    assert(proof.finiteCandidateRendered && proof.finiteCapEnforced, 'Finite virtual-space candidate must render AND enforce its hard cap')
  }
  else assert(proof.allRendered && proof.allOwnedNss, 'Inspect all four separate render/NSS outcomes before any source fix')
  proof.passed = true
}
catch (error) { proof.error = String(error); throw error }
finally {
  try {
    if (loadedProfile && !proof.ownedProcessUncertain) { await policy(['-R', '-K', loadedProfile]); proof.sandboxUnloaded = true }
  }
  catch (error) { proof.passed = false; proof.policyCleanupError = String(error); throw error }
  finally {
    try {
      if (loadedProfile && !proof.sandboxUnloaded) {
        proof.cleaned = false
        proof.recoveryProfile = loadedProfile
      }
      else {
        if (root) await rm(root, { recursive: true, force: true })
        proof.cleaned = true
      }
    }
    catch (error) { proof.passed = false; proof.fixtureCleanupError = String(error); throw error }
    finally { await writeFile(join(artifacts, 'proof.json'), JSON.stringify(proof, null, 2) + '\n') }
  }
}
