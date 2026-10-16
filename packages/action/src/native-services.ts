import { execFile, spawn } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import { closeSync, existsSync, mkdirSync, mkdtempSync, openSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:net'
import { join } from 'node:path'
import { promisify } from 'node:util'
import type { ServiceSpec } from './services'
import { nativeServiceEnvironment } from './services'

const execute = promisify(execFile)
const pause = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

/** Only ownership and library paths are persisted for the action's post step. */
export interface NativeServiceState {
  name: 'postgres' | 'typesense'
  directory: string
  binDir: string
  pid?: number
  libraries: Record<string, string>
}

async function freePort(): Promise<number> {
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

function alive(pid: number): boolean {
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
  const env = { ...process.env, ...state.libraries }
  if (state.name === 'postgres') {
    const data = join(state.directory, 'data')
    if (existsSync(join(data, 'postmaster.pid'))) {
      await execute(join(state.binDir, 'pg_ctl'), ['-D', data, '-m', 'fast', '-w', '-t', '30', 'stop'], { env, timeout: 35_000 })
    }
  }
  else if (state.pid && alive(state.pid)) {
    process.kill(state.pid, 'SIGTERM')
    const deadline = Date.now() + 10_000
    while (alive(state.pid) && Date.now() < deadline) await pause(50)
    if (alive(state.pid)) {
      process.kill(state.pid, 'SIGKILL')
      const killDeadline = Date.now() + 2000
      while (alive(state.pid) && Date.now() < killDeadline) await pause(50)
      if (alive(state.pid)) throw new Error('Typesense did not stop; retained its data directory')
    }
  }
  rmSync(state.directory, { recursive: true, force: true })
}

/** Pantry-installed binaries, private data, authenticated readiness, bounded cleanup. */
export async function startNativeService(service: ServiceSpec, binDir: string, temporaryRoot: string): Promise<{ state: NativeServiceState, environment: Record<string, string>, version: string }> {
  if (service.name === 'redis') throw new Error('Redis uses its dedicated non-persistent service lifecycle')
  if (process.platform !== 'darwin' && process.platform !== 'linux') throw new Error('Native Pantry services require Linux or macOS')
  mkdirSync(temporaryRoot, { recursive: true })
  const directory = mkdtempSync(join(temporaryRoot, `pantry-${service.name}-`))
  const env = nativeServiceEnvironment(binDir, process.platform)
  const libraries = Object.fromEntries(['LD_LIBRARY_PATH', 'DYLD_LIBRARY_PATH'].filter(key => env[key]).map(key => [key, env[key]!]))
  const state: NativeServiceState = { name: service.name, directory, binDir, libraries }
  const port = await freePort()
  try {
    if (service.name === 'postgres') {
      const { stdout } = await execute(join(binDir, 'postgres'), ['--version'], { env, timeout: 10_000 })
      const version = /PostgreSQL\)?\s+(\d+\.\d+(?:\.\d+)?)/.exec(stdout)?.[1]
      if (!version || (service.expectedVersion && version !== service.expectedVersion)) throw new Error(`PostgreSQL version mismatch: requested ${service.expectedVersion || 'installed'}, received ${stdout.trim()}`)
      const data = join(directory, 'data')
      const password = randomBytes(24).toString('hex')
      const passwordFile = join(directory, 'password')
      writeFileSync(passwordFile, password, { mode: 0o600 })
      try {
        await execute(join(binDir, 'initdb'), ['-D', data, '--username=postgres', '--auth-local=trust', '--auth-host=scram-sha-256', `--pwfile=${passwordFile}`, '--no-locale', '--encoding=UTF8'], { env, timeout: 60_000 })
      }
      finally { rmSync(passwordFile, { force: true }) }
      // TCP only avoids macOS's short Unix socket path limit on hosted runners.
      await execute(join(binDir, 'pg_ctl'), ['-D', data, '-l', join(directory, 'server.log'), '-o', `-h 127.0.0.1 -p ${port} -k ''`, '-w', '-t', '30', 'start'], { env, timeout: 35_000 })
      const pg = { PGHOST: '127.0.0.1', PGPORT: String(port), PGUSER: 'postgres', PGPASSWORD: password, PGDATABASE: 'pantry_ci' }
      await execute(join(binDir, 'createdb'), ['pantry_ci'], { env: { ...env, ...pg }, timeout: 10_000 })
      // Verify a real authenticated query, rather than only an accepting socket.
      await execute(join(binDir, 'psql'), ['-X', '-v', 'ON_ERROR_STOP=1', '-c', 'SELECT 1'], { env: { ...env, ...pg }, timeout: 10_000 })
      return { state, version, environment: { ...pg, POSTGRES_URL: `postgres://postgres:${password}@127.0.0.1:${port}/pantry_ci`, POSTGRES_SERVICE_VERSION: version } }
    }
    const apiKey = randomBytes(24).toString('hex')
    const data = join(directory, 'data')
    mkdirSync(data)
    let peeringPort = await freePort()
    while (peeringPort === port) peeringPort = await freePort()
    const log = openSync(join(directory, 'server.log'), 'a', 0o600)
    let childError: Error | undefined
    try {
      const child = spawn(join(binDir, 'typesense-server'), ['--data-dir', data, '--api-address', '127.0.0.1', '--api-port', String(port), '--peering-address', '127.0.0.1', '--peering-port', String(peeringPort)], {
        env: { ...env, TYPESENSE_API_KEY: apiKey }, stdio: ['ignore', log, log], detached: true,
      })
      child.once('error', error => { childError = error })
      state.pid = child.pid
      child.unref()
    }
    finally { closeSync(log) }
    const url = `http://127.0.0.1:${port}`
    const deadline = Date.now() + 60_000
    let version = ''
    while (Date.now() < deadline) {
      if (childError) throw childError
      if (!state.pid || !alive(state.pid)) throw new Error('Typesense exited before becoming healthy')
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
    throw new Error(`${service.name} startup failed: ${error instanceof Error ? error.message : String(error)}\n${logs}`)
  }
}
