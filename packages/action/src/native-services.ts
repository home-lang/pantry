import { execFile, spawn } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import { closeSync, existsSync, lstatSync, mkdirSync, mkdtempSync, openSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:net'
import { join } from 'node:path'
import { promisify } from 'node:util'
import type { ServiceSpec } from './services'
import { nativeServiceEnvironment } from './services'
import type { ServiceProcessIdentity } from './service-ownership'
import { assertServiceDirectory, assertServiceProcess, claimServiceDirectory, serviceProcessIdentity, serviceGroupHasLiveProcesses } from './service-ownership'
import { startNativeMysql } from './native-mysql'
import { startNativeDynamodb } from './native-dynamodb'

const execute = promisify(execFile)
const pause = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

/** Only ownership and library paths are persisted for the action's post step. */
export interface NativeServiceState {
  name: ServiceSpec['name']
  directory: string
  owner: string
  binDir: string
  pid?: number
  process?: ServiceProcessIdentity
  /** A gated, immutable launcher owns this foreground service's process group. */
  launcher?: boolean
  auxiliaryDirectories?: string[]
  libraries: Record<string, string>
}

export interface NativeServiceOptions {
  maskSecret?: (secret: string) => void
  /** Persist post-job ownership synchronously, before startup may continue. */
  onState?: (state: NativeServiceState) => void
}

export function checkpointNativeService(state: NativeServiceState, onState?: NativeServiceOptions['onState']): void {
  const pending: unknown = onState?.(state)
  if (pending !== undefined) {
    if (pending instanceof Promise) void pending.catch(() => {})
    throw new TypeError('Native service ownership must be persisted synchronously')
  }
}

function directoryExists(directory: string): boolean {
  try { lstatSync(directory); return true }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return false
    throw error
  }
}

export async function freeServicePort(): Promise<number> {
  const server = createServer()
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', resolve)
  })
  const address = server.address()
  const port = typeof address === 'object' && address ? address.port : 0
  await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()))
  if (!port) throw new Error('Could not allocate a loopback service port')
  return port
}

export function serviceAlive(pid: number): boolean {
  try {
    process.kill(pid, 0)
    return true
  }
  catch { return false }
}

function logTail(directory: string): string {
  const file = join(directory, 'server.log')
  return existsSync(file) ? readFileSync(file, 'utf8').slice(-8000) : 'No service log was created'
}

/** Stop only this action's private cluster/process, then remove its data. */
export async function stopNativeService(state: NativeServiceState): Promise<void> {
  if (state.launcher && (state.pid === undefined || !Number.isSafeInteger(state.pid) || state.pid <= 1 || !state.process || state.process.pid !== state.pid || state.process.group !== state.pid))
    throw new Error('Invalid native service launcher ownership; retained private data')
  // Startup failure may already have completed cleanup before the post step.
  if (!directoryExists(state.directory)) {
    if (state.pid && await serviceProcessIdentity(state.pid)) throw new Error('Missing native service ownership directory; refusing to signal a live PID')
    if (state.launcher && state.process && await serviceGroupHasLiveProcesses(state.process.group))
      throw new Error('Missing ownership directory with a live service group; retained auxiliary data')
    for (const directory of state.auxiliaryDirectories || []) {
      if (!directoryExists(directory)) continue
      assertServiceDirectory(directory, state.owner)
      rmSync(directory, { recursive: true, force: true })
    }
    return
  }
  assertServiceDirectory(state.directory, state.owner)
  for (const directory of state.auxiliaryDirectories || []) assertServiceDirectory(directory, state.owner)
  const env = { ...process.env, ...state.libraries }
  if (state.pid && !state.process && serviceAlive(state.pid))
    throw new Error('Service process identity was not captured; retained its private directory')
  const running = state.process && await assertServiceProcess(state.process, state.directory)
  if (state.launcher && running && state.process) {
    const identity = state.process
    if (identity.group !== identity.pid || identity.group <= 1)
      throw new Error('Native service launcher is not its owned process group leader')
    // The launcher retains its original PID/birth/command until its foreground
    // child exits. Check that identity immediately before each group signal.
    if (await assertServiceProcess(identity, state.directory)) process.kill(-identity.group, state.name === 'postgres' ? 'SIGINT' : 'SIGTERM')
    const deadline = Date.now() + 10_000
    while (await assertServiceProcess(identity, state.directory) && Date.now() < deadline) await pause(50)
    if (await assertServiceProcess(identity, state.directory)) {
      process.kill(-identity.group, 'SIGKILL')
      const killDeadline = Date.now() + 2000
      while (await assertServiceProcess(identity, state.directory) && Date.now() < killDeadline) await pause(50)
      if (await assertServiceProcess(identity, state.directory)) throw new Error('Native service group did not stop; retained its private data')
    }
  }
  else if (state.name === 'postgres' && running) {
    const data = join(state.directory, 'data')
    if (existsSync(join(data, 'postmaster.pid'))) {
      await execute(join(state.binDir, 'pg_ctl'), ['-D', data, '-m', 'fast', '-w', '-t', '30', 'stop'], { env, timeout: 35_000 })
    }
  }
  else if (running && state.process) {
    process.kill(state.process.pid, 'SIGTERM')
    const deadline = Date.now() + 10_000
    while (await assertServiceProcess(state.process, state.directory) && Date.now() < deadline) await pause(50)
    if (await assertServiceProcess(state.process, state.directory)) {
      process.kill(state.process.pid, 'SIGKILL')
      const killDeadline = Date.now() + 2000
      while (await assertServiceProcess(state.process, state.directory) && Date.now() < killDeadline) await pause(50)
      if (await assertServiceProcess(state.process, state.directory)) throw new Error('Native service did not stop; retained its data directory')
    }
  }
  // A dead launcher alone does not prove its children have exited, including
  // when it was already absent at post entry. Observation never authorizes a
  // signal after losing the recorded leader; a reused group retains the data.
  if (state.launcher && state.process) {
    const group = state.process.group
    const groupDeadline = Date.now() + 2000
    while (await serviceGroupHasLiveProcesses(group) && Date.now() < groupDeadline) await pause(50)
    if (await serviceGroupHasLiveProcesses(group)) throw new Error('Native service group still has live processes; retained its private data')
  }
  if (state.process && await assertServiceProcess(state.process, state.directory))
    throw new Error('Native service is still running; retained its private directory')
  for (const directory of state.auxiliaryDirectories || []) rmSync(directory, { recursive: true, force: true })
  rmSync(state.directory, { recursive: true, force: true })
}

/** Bind script execution to this PID and private invocation before admission. */
export async function waitForNativeLauncherReady(path: string, pid: number, owner: string, exited: Promise<void>): Promise<void> {
  let ended = false
  void exited.then(() => { ended = true })
  const deadline = Date.now() + 2000
  while (Date.now() < deadline) {
    if (ended) throw new Error('Native launcher exited before acknowledging execution')
    try {
      const metadata = lstatSync(path)
      if (!metadata.isFile() || metadata.nlink !== 1 || metadata.uid !== process.getuid?.() || metadata.size > 128)
        throw new Error('Invalid native launcher acknowledgement')
      const received = readFileSync(path, 'utf8')
      // Creation can be observed before printf completes its short record.
      if (received.endsWith('\n')) {
        if (received !== `${pid}:${owner}\n`) throw new Error('Invalid native launcher acknowledgement')
        return
      }
    }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
    }
    await pause(5)
  }
  throw new Error('Native launcher did not acknowledge execution')
}

/** Keep the unique private directory in argv, then capture the live process. */
export async function spawnNativeService(state: NativeServiceState, executable: string, args: string[], env: NodeJS.ProcessEnv, onState?: NativeServiceOptions['onState']): Promise<void> {
  const launcher = join(state.directory, 'launch.sh')
  // EOF before the checkpoint starts no server. After admission the immutable
  // launcher stays alive with its foreground child, so post cleanup can verify
  // PID, UID, birth, group and command before signalling the owned group.
  writeFileSync(launcher, `#!/bin/sh
stop_signal=
trap 'stop_signal=INT' INT
trap 'stop_signal=TERM' TERM
trap 'stop_signal=HUP' HUP
owner=$1
shift
(umask 077; set -C; printf '%s:%s\\n' "$$" "$owner" > "$0.ready") || exit 127
IFS= read -r permission || exit 125
[ "$permission" = start ] || exit 126
[ -z "$stop_signal" ] || exit 125
"$@" &
child=$!
# A stop can arrive after admission but before the foreground child forks.
# This live session leader still anchors the current owned process group.
if [ -n "$stop_signal" ]; then
  kill -s "$stop_signal" 0 || exit 126
fi
while :; do
  wait "$child"
  status=$?
  [ "$status" -lt 128 ] && exit "$status"
  kill -0 "$child" 2>/dev/null || exit "$status"
done
`, { mode: 0o700, flag: 'wx' })
  const log = openSync(join(state.directory, 'server.log'), 'a', 0o600)
  try {
    const child = spawn('/bin/sh', [launcher, state.owner, executable, ...args], { env, stdio: ['pipe', log, log], detached: true })
    const exited = new Promise<void>(resolve => {
      child.once('exit', () => resolve())
      child.once('error', () => resolve())
    })
    try {
      await new Promise<void>((resolve, reject) => {
        child.once('spawn', resolve)
        child.once('error', reject)
      })
      // Bun's spawn event can precede exec: /proc then still exposes the
      // parent's argv. Only the executed private script writes this PID/owner.
      // Ownership validation and permission to start remain separate gates.
      await waitForNativeLauncherReady(`${launcher}.ready`, child.pid!, state.owner, exited)
      const identity = child.pid ? await serviceProcessIdentity(child.pid) : undefined
      if (!identity || identity.group !== identity.pid || !await assertServiceProcess(identity, state.directory))
        throw new Error('Native launcher ownership could not be captured')
      state.pid = identity.pid
      state.process = identity
      state.launcher = true
      checkpointNativeService(state, onState)
      await new Promise<void>((resolve, reject) => {
        child.stdin!.once('error', reject)
        child.stdin!.end('start\n', resolve)
      })
      child.unref()
    }
    catch (error) {
      child.stdin?.destroy()
      let timeout: ReturnType<typeof setTimeout> | undefined
      try {
        await Promise.race([exited, new Promise<never>((resolve, reject) => {
          timeout = setTimeout(() => reject(new Error('Unadmitted native launcher did not exit')), 2000)
        })])
      }
      finally { clearTimeout(timeout) }
      throw error
    }
  }
  finally { closeSync(log) }
}

/** Pantry-installed binaries, private data, authenticated readiness, bounded cleanup. */
export async function startNativeService(service: ServiceSpec, binDir: string, temporaryRoot: string, options: NativeServiceOptions = {}): Promise<{ state: NativeServiceState, environment: Record<string, string>, version: string }> {
  if (process.platform !== 'darwin' && process.platform !== 'linux') throw new Error('Native Pantry services require Linux or macOS')
  if (service.name === 'dynamodb' && (process.platform !== 'linux' || process.arch !== 'x64'))
    throw new Error('Native DynamoDB Local currently requires Linux x86-64')
  mkdirSync(temporaryRoot, { recursive: true })
  const directory = realpathSync(mkdtempSync(join(temporaryRoot, `pantry-${service.name}-`)))
  const env = nativeServiceEnvironment(binDir, process.platform)
  const libraries = Object.fromEntries(['LD_LIBRARY_PATH', 'DYLD_LIBRARY_PATH'].filter(key => env[key]).map(key => [key, env[key]!]))
  const state: NativeServiceState = { name: service.name, directory, owner: claimServiceDirectory(directory), binDir, libraries }
  const secrets: string[] = []
  const secret = (): string => {
    const value = randomBytes(24).toString('hex')
    secrets.push(value)
    options.maskSecret?.(value)
    return value
  }
  try {
    checkpointNativeService(state, options.onState)
    const port = await freeServicePort()
    if (service.name === 'dynamodb') return await startNativeDynamodb(service, state, env, port, options.onState)
    if (service.name === 'mysql') return await startNativeMysql(service, state, env, port, secret, options.onState)
    if (service.name === 'postgres') {
      const { stdout } = await execute(join(binDir, 'postgres'), ['--version'], { env, timeout: 10_000 })
      const version = /PostgreSQL\)?\s+(\d+\.\d+(?:\.\d+)?)/.exec(stdout)?.[1]
      if (!version || (service.expectedVersion && version !== service.expectedVersion)) throw new Error(`PostgreSQL version mismatch: requested ${service.expectedVersion || 'installed'}, received ${stdout.trim()}`)
      const data = join(directory, 'data')
      const password = secret()
      const passwordFile = join(directory, 'password')
      writeFileSync(passwordFile, password, { mode: 0o600 })
      try {
        await execute(join(binDir, 'initdb'), ['-D', data, '--username=postgres', '--auth-local=trust', '--auth-host=scram-sha-256', `--pwfile=${passwordFile}`, '--no-locale', '--encoding=UTF8'], { env, timeout: 60_000 })
      }
      finally { rmSync(passwordFile, { force: true }) }
      // TCP only avoids macOS's short Unix socket path limit on hosted runners.
      await spawnNativeService(state, join(binDir, 'postgres'), ['-D', data, '-h', '127.0.0.1', '-p', String(port), '-k', ''], env, options.onState)
      const pg = { PGHOST: '127.0.0.1', PGPORT: String(port), PGUSER: 'postgres', PGPASSWORD: password, PGDATABASE: 'pantry_ci' }
      const deadline = Date.now() + 30_000
      for (;;) {
        if (!state.process || !await assertServiceProcess(state.process, directory)) throw new Error('PostgreSQL exited during startup')
        try {
          const result = await execute(join(binDir, 'psql'), ['-X', '--dbname=postgres', '-v', 'ON_ERROR_STOP=1', '-t', '-A', '-c', 'SELECT 1'], { env: { ...env, ...pg }, timeout: 2000 })
          if (result.stdout.trim() !== '1') throw new Error('Unexpected PostgreSQL readiness response')
          break
        }
        catch (error) {
          if (Date.now() >= deadline) throw error
          await pause(100)
        }
      }
      await execute(join(binDir, 'createdb'), ['pantry_ci'], { env: { ...env, ...pg }, timeout: 10_000 })
      // Verify a real authenticated query, rather than only an accepting socket.
      await execute(join(binDir, 'psql'), ['-X', '-v', 'ON_ERROR_STOP=1', '-c', 'SELECT 1'], { env: { ...env, ...pg }, timeout: 10_000 })
      return { state, version, environment: { ...pg, POSTGRES_URL: `postgres://postgres:${password}@127.0.0.1:${port}/pantry_ci`, POSTGRES_SERVICE_VERSION: version } }
    }
    if (service.name === 'redis') {
      const { stdout } = await execute(join(binDir, 'redis-server'), ['--version'], { env, timeout: 10_000 })
      const version = /\bv=(\d+\.\d+\.\d+)\b/.exec(stdout)?.[1]
      if (!version || (service.expectedVersion && version !== service.expectedVersion)) throw new Error('Redis version mismatch')
      const password = secret()
      const config = join(directory, 'redis.conf')
      writeFileSync(config, `bind 127.0.0.1\nport ${port}\nprotected-mode yes\nsave ""\nappendonly no\ndaemonize no\nset-proc-title no\nrequirepass ${password}\ndir ${JSON.stringify(directory)}\n`, { mode: 0o600 })
      await spawnNativeService(state, join(binDir, 'redis-server'), [config], env, options.onState)
      const client = join(binDir, 'redis-cli')
      const authenticated = { ...env, REDISCLI_AUTH: password }
      const deadline = Date.now() + 30_000
      while (true) {
        if (!state.pid || !serviceAlive(state.pid)) throw new Error('Redis exited before readiness')
        try {
          const ping = await execute(client, ['-h', '127.0.0.1', '-p', String(port), 'PING'], { env: authenticated, timeout: 2000 })
          if (ping.stdout.trim() === 'PONG') break
        }
        catch { /* Wait only for this private instance. */ }
        if (Date.now() >= deadline) throw new Error('Redis did not answer an authenticated readiness request')
        await pause(100)
      }
      const info = await execute(client, ['-h', '127.0.0.1', '-p', String(port), 'INFO', 'server'], { env: authenticated, timeout: 2000 })
      if (!info.stdout.includes(`redis_version:${version}\r\n`)) throw new Error('Redis readiness version mismatch')
      return { state, version, environment: { REDIS_HOST: '127.0.0.1', REDIS_PORT: String(port), REDIS_USERNAME: 'default', REDIS_PASSWORD: password, REDISCLI_AUTH: password, REDIS_URL: `redis://default:${password}@127.0.0.1:${port}/0`, REDIS_SERVICE_VERSION: version } }
    }
    const apiKey = secret()
    const data = join(directory, 'data')
    mkdirSync(data)
    let peeringPort = await freeServicePort()
    while (peeringPort === port) peeringPort = await freeServicePort()
    await spawnNativeService(state, join(binDir, 'typesense-server'), ['--data-dir', data, '--api-address', '127.0.0.1', '--api-port', String(port), '--peering-address', '127.0.0.1', '--peering-port', String(peeringPort)], { ...env, TYPESENSE_API_KEY: apiKey }, options.onState)
    const url = `http://127.0.0.1:${port}`
    const deadline = Date.now() + 60_000
    let version = ''
    while (Date.now() < deadline) {
      if (!state.pid || !serviceAlive(state.pid)) throw new Error('Typesense exited before becoming healthy')
      try {
        const health = await fetch(`${url}/health`, { signal: AbortSignal.timeout(2000) })
        if (health.ok && (await health.json() as { ok?: boolean }).ok) {
          const debug = await fetch(`${url}/debug`, { headers: { 'X-TYPESENSE-API-KEY': apiKey }, signal: AbortSignal.timeout(2000) })
          if (debug.ok) version = String((await debug.json() as { version?: string }).version || '')
          if (version) break
        }
      }
      catch { /* The local cluster may still be starting. */ }
      await pause(250)
    }
    if (!version) throw new Error('Typesense did not answer an authenticated readiness request')
    if (service.expectedVersion && version !== service.expectedVersion) throw new Error(`Typesense version mismatch: requested ${service.expectedVersion}, received ${version}`)
    return { state, version, environment: { TYPESENSE_HOST: '127.0.0.1', TYPESENSE_PORT: String(port), TYPESENSE_PROTOCOL: 'http', TYPESENSE_API_KEY: apiKey, TYPESENSE_URL: url, TYPESENSE_SERVICE_VERSION: version } }
  }
  catch (error) {
    const logs = logTail(directory)
    await stopNativeService(state)
    let detail = `${service.name} startup failed: ${error instanceof Error ? error.message : String(error)}\n${logs}`
    for (const value of secrets) detail = detail.replaceAll(value, '[REDACTED]')
    throw new Error(detail)
  }
}
