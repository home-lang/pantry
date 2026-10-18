import { describe, expect, test } from 'bun:test'
import { execFile, spawn } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { promisify } from 'node:util'
import { startNativeService, stopNativeService } from './native-services'
import { parseServiceSpecs } from './services'
import { setSecret } from '@actions/core'
import { assertServiceDirectory, assertServiceProcess, claimServiceDirectory, serviceProcessIdentity } from './service-ownership'
import type { ServiceProcessIdentity } from './service-ownership'

const execute = promisify(execFile)
const options = { maskSecret: process.env.GITHUB_ACTIONS === 'true' ? setSecret : undefined }
const binDir = process.env.PANTRY_NATIVE_SERVICE_TEST_BIN
const mysqlVersion = process.env.PANTRY_NATIVE_MYSQL_TEST_VERSION || '26.7.0'
const integration = binDir ? describe : describe.skip

integration('Pantry native action services against installed packages', () => {
  // Public lifecycle + actual post action: catches parent cancellation before
  // readiness, including lost ownership. Does not prove runner hard-power loss.
  test('post cleanup recovers interrupted startup while preserving a foreign native service', async () => {
    const root = realpathSync(mkdtempSync(join(tmpdir(), 'pantry cancellation ')))
    const foreignRoot = join(root, 'foreign')
    const temporary = join(root, 'interrupted')
    const binaries = join(root, 'bin')
    mkdirSync(foreignRoot)
    mkdirSync(temporary)
    mkdirSync(binaries)
    const savedState = join(root, 'state.json')
    const ready = join(root, 'readiness-entered')
    for (const name of ['postgres', 'initdb', 'createdb', 'pg_ctl']) symlinkSync(join(binDir!, name), join(binaries, name))
    // A real query confirms the cluster is alive; delaying the readiness client
    // then leaves the action in the cancellation interval under test.
    writeFileSync(join(binaries, 'psql'), `#!/usr/bin/env bun
import { execFileSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
execFileSync(${JSON.stringify(join(binDir!, 'psql'))}, process.argv.slice(2), { stdio: 'inherit' })
writeFileSync(${JSON.stringify(ready)}, 'ready', { mode: 0o600 })
await Bun.sleep(120000)
`, { mode: 0o700 })
    const foreign = await startNativeService(parseServiceSpecs('postgres@17.11')[0]!, binDir!, foreignRoot, options)
    const child = spawn(process.execPath, [join(import.meta.dir, 'fixtures/native-service-cancellation.ts'), binaries, temporary, savedState], {
      env: process.env, stdio: 'ignore', detached: true,
    })
    const childSpawned = new Promise<void>((resolve, reject) => {
      child.once('spawn', resolve)
      child.once('error', reject)
    })
    let childError: Error | undefined
    const childExited = new Promise<void>((resolve) => {
      child.once('error', (error) => { childError = error; resolve() })
      child.once('exit', () => resolve())
    })
    let parent: ServiceProcessIdentity | undefined
    const parentAlive = async () => {
      if (!parent) return false
      if (parent.group !== parent.pid) throw new Error('Cancellation parent is not its owned process group leader')
      return assertServiceProcess(parent, root)
    }
    let fallback: Awaited<ReturnType<typeof startNativeService>>['state'] | undefined
    const captureFallback = async () => {
      for (const name of readdirSync(temporary)) {
        const directory = join(temporary, name)
        const pidfile = join(directory, 'data/postmaster.pid')
        if (!existsSync(pidfile)) continue
        const pid = Number(readFileSync(pidfile, 'utf8').split('\n')[0])
        const identity = await serviceProcessIdentity(pid)
        if (!identity || !await assertServiceProcess(identity, directory)) continue
        const owner = readFileSync(join(directory, '.pantry-service-owner'), 'utf8')
        assertServiceDirectory(directory, owner)
        fallback = { name: 'postgres', directory, owner, binDir: binaries, pid, process: identity, libraries: foreign.state.libraries }
      }
    }
    const runPost = async () => {
      const records = existsSync(savedState) ? readFileSync(savedState, 'utf8') : '[]'
      await execute(process.execPath, [join(import.meta.dir, 'post.ts')], {
        env: { ...process.env, 'STATE_native-services': records, 'STATE_apple-signing-keychain': '' }, timeout: 45_000,
      })
    }
    try {
      await childSpawned
      if (!child.pid) throw new Error('Cancellation parent did not spawn')
      parent = await serviceProcessIdentity(child.pid)
      const deadline = Date.now() + 90_000
      while (!existsSync(ready) && Date.now() < deadline) {
        if (childError) throw childError
        if (child.exitCode !== null || child.signalCode !== null) throw new Error('Cancellation parent exited before readiness')
        await new Promise(resolve => setTimeout(resolve, 25))
      }
      expect(existsSync(ready)).toBe(true)
      // Preserve independently captured ownership for teardown when the unfixed
      // implementation loses its post state. No unverified PID is signalled.
      await captureFallback()
      if (!fallback) throw new Error('Fixture did not capture its owned PostgreSQL process')
      const pid = fallback.pid!
      if (!parent || !await parentAlive()) throw new Error('Cancellation parent identity changed')
      process.kill(-parent.pid, 'SIGKILL')
      await childExited

      await runPost()
      expect(readdirSync(temporary)).toEqual([])
      expect(await serviceProcessIdentity(pid)).toBeUndefined()
      expect(await assertServiceProcess(foreign.state.process!, foreign.state.directory)).toBe(true)
      const query = await execute(join(binDir!, 'psql'), ['-X', '-A', '-t', '-c', 'SELECT 42'], {
        env: { ...process.env, ...foreign.state.libraries, ...foreign.environment }, timeout: 5000,
      })
      expect(query.stdout.trim()).toBe('42')
    }
    finally {
      const failures: unknown[] = []
      const attempt = async (cleanup: () => Promise<void>) => {
        try { await cleanup() }
        catch (error) { failures.push(error) }
      }
      // This path also runs when readiness times out or an assertion fails.
      await attempt(captureFallback)
      await attempt(async () => {
        if (parent && await parentAlive()) {
          process.kill(-parent.pid, 'SIGKILL')
          await childExited
        }
      })
      await attempt(runPost)
      await attempt(async () => {
        if (fallback && existsSync(fallback.directory)) await stopNativeService(fallback)
      })
      await attempt(() => stopNativeService(foreign.state))
      if (readdirSync(temporary).length || readdirSync(foreignRoot).length)
        failures.push(new Error('Cancellation fixture retained owned data for inspection'))
      if (failures.length) throw new AggregateError(failures, 'Cancellation fixture cleanup did not verify')
      rmSync(root, { recursive: true, force: true })
    }
  }, 180_000)

  test('a PostgreSQL readiness failure stops the owned server before removing its data', async () => {
    const root = mkdtempSync(join(tmpdir(), 'pantry postgres startup fault '))
    const owner = claimServiceDirectory(root)
    const binaries = join(root, 'bin')
    const temporary = join(root, 'services')
    mkdirSync(binaries)
    mkdirSync(temporary)
    for (const name of ['postgres', 'initdb', 'createdb']) symlinkSync(join(binDir!, name), join(binaries, name))
    writeFileSync(join(binaries, 'psql'), '#!/bin/sh\nexit 19\n', { mode: 0o700 })
    // Reproduce pg_ctl's documented failure after a server has started. The
    // foreground implementation never delegates startup to this daemonizer.
    const record = join(root, 'spawned.json')
    writeFileSync(join(binaries, 'pg_ctl'), `#!/usr/bin/env bun
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { assertServiceDirectory, assertServiceProcess, serviceProcessIdentity } from ${JSON.stringify(new URL('./service-ownership.ts', import.meta.url).pathname)}
const args = process.argv.slice(2)
execFileSync(${JSON.stringify(join(binDir!, 'pg_ctl'))}, args, { stdio: 'inherit' })
if (args.includes('start')) {
  const data = args[args.indexOf('-D') + 1]
  const directory = dirname(data)
  assertServiceDirectory(directory, readFileSync(join(directory, '.pantry-service-owner'), 'utf8'))
  const identity = await serviceProcessIdentity(Number(readFileSync(join(data, 'postmaster.pid'), 'utf8').split('\\n')[0]))
  if (!identity || !await assertServiceProcess(identity, directory)) throw new Error('Fault fixture could not identify its owned server')
  writeFileSync(${JSON.stringify(record)}, JSON.stringify(identity))
  process.exit(23)
}
`, { mode: 0o700 })
    let identity: ServiceProcessIdentity | undefined
    let finished = false
    const outcome = startNativeService(parseServiceSpecs('postgres@17.11')[0]!, binaries, temporary, options)
      .then(value => ({ value, error: undefined }), error => ({ value: undefined, error }))
      .finally(() => { finished = true })
    try {
      const deadline = Date.now() + 65_000
      while (!finished && !identity && Date.now() < deadline) {
        for (const name of readdirSync(temporary)) {
          const pidfile = join(temporary, name, 'data/postmaster.pid')
          if (!existsSync(pidfile)) continue
          const pid = Number(readFileSync(pidfile, 'utf8').split('\n')[0])
          if (Number.isSafeInteger(pid) && pid > 1) identity = await serviceProcessIdentity(pid)
        }
        if (!identity) await new Promise(resolve => setTimeout(resolve, 20))
      }
      if (!identity && existsSync(record)) identity = JSON.parse(readFileSync(record, 'utf8'))
      expect(identity).toBeDefined()
      const result = await outcome
      expect(result.value).toBeUndefined()
      expect(String(result.error)).toContain('startup failed')
      const live = identity ? await serviceProcessIdentity(identity.pid) : undefined
      expect(!live || live.birth !== identity?.birth).toBe(true)
      expect(readdirSync(temporary)).toEqual([])
    }
    finally {
      await outcome
      assertServiceDirectory(root, owner)
      // A red regression must also dispose only its proven, private fixture.
      if (!identity && existsSync(record)) identity = JSON.parse(readFileSync(record, 'utf8'))
      if (identity && await assertServiceProcess(identity, root)) {
        process.kill(identity.pid, 'SIGINT')
        const deadline = Date.now() + 10_000
        while (await assertServiceProcess(identity, root) && Date.now() < deadline) await new Promise(resolve => setTimeout(resolve, 25))
        if (await assertServiceProcess(identity, root)) throw new Error('Owned startup-fault fixture did not stop; retained its data')
      }
      if (!identity && readdirSync(temporary).length)
        throw new Error('Startup-fault fixture ownership was not captured; retained its data')
      rmSync(root, { recursive: true, force: true })
    }
  }, 120_000)

  test('owns two isolated PostgreSQL clusters, authenticates queries and cleans both', async () => {
    const root = mkdtempSync(join(tmpdir(), 'pantry services test '))
    const started: Awaited<ReturnType<typeof startNativeService>>[] = []
    try {
      for (let i = 0; i < 2; i++) started.push(await startNativeService(parseServiceSpecs('postgres@17.11')[0]!, binDir!, root, options))
      expect(started[0]!.environment.PGPORT).not.toBe(started[1]!.environment.PGPORT)
      const query = (at: number, sql: string) => execute(join(binDir!, 'psql'), ['-X', '-A', '-t', '-v', 'ON_ERROR_STOP=1', '-c', sql], { env: { ...process.env, ...started[at]!.state.libraries, ...started[at]!.environment } })
      await query(0, 'CREATE TABLE private_job (value integer); INSERT INTO private_job VALUES (42)')
      expect((await query(0, 'SELECT value FROM private_job')).stdout.trim()).toBe('42')
      expect((await query(1, "SELECT count(*) FROM pg_tables WHERE tablename = 'private_job'")).stdout.trim()).toBe('0')
      await expect(execute(join(binDir!, 'psql'), ['-X', '-c', 'SELECT 1'], { env: { ...process.env, ...started[0]!.environment, PGPASSWORD: 'wrong' } })).rejects.toThrow()
    }
    finally {
      for (const service of started.reverse()) await stopNativeService(service.state)
      expect(readdirSync(root)).toEqual([])
      rmSync(root, { recursive: true, force: true })
    }
  }, 120_000)

  test('owns two authenticated Redis instances with independent ports, data and cleanup', async () => {
    const root = mkdtempSync(join(tmpdir(), 'pantry redis test '))
    const started: Awaited<ReturnType<typeof startNativeService>>[] = []
    try {
      for (let i = 0; i < 2; i++) started.push(await startNativeService(parseServiceSpecs('redis@8.8.0')[0]!, binDir!, root, options))
      expect(started[0]!.environment.REDIS_PORT).not.toBe(started[1]!.environment.REDIS_PORT)
      const query = (at: number, command: string[]) => execute(join(binDir!, 'redis-cli'), ['-h', '127.0.0.1', '-p', started[at]!.environment.REDIS_PORT!, ...command], { env: { ...process.env, ...started[at]!.environment }, timeout: 5000 })
      expect((await query(0, ['SET', 'private-job', '42'])).stdout.trim()).toBe('OK')
      expect((await query(0, ['GET', 'private-job'])).stdout.trim()).toBe('42')
      expect((await query(1, ['GET', 'private-job'])).stdout.trim()).toBe('')
      for (const service of started) {
        const url = new URL(service.environment.REDIS_URL!)
        expect(url.username).toBe('default')
        expect(url.password).toBe(service.environment.REDIS_PASSWORD!)
        const uriQuery = await execute(join(binDir!, 'redis-cli'), ['-e', '-u', url.href, 'PING'], {
          env: { ...process.env, REDISCLI_AUTH: '' }, timeout: 5000,
        })
        expect(uriQuery.stdout.trim()).toBe('PONG')
        url.password = 'wrong'
        await expect(execute(join(binDir!, 'redis-cli'), ['-e', '-u', url.href, 'PING'], {
          env: { ...process.env, REDISCLI_AUTH: '' }, timeout: 5000,
        })).rejects.toMatchObject({ code: 1, stderr: expect.stringContaining('WRONGPASS') })
      }
      const rejected = await execute(join(binDir!, 'redis-cli'), ['-h', '127.0.0.1', '-p', started[0]!.environment.REDIS_PORT!, 'PING'], { env: { ...process.env, REDISCLI_AUTH: '' }, timeout: 5000 })
      expect(rejected.stdout).toContain('NOAUTH')
    }
    finally {
      for (const service of started.reverse()) await stopNativeService(service.state)
      expect(readdirSync(root)).toEqual([])
      rmSync(root, { recursive: true, force: true })
    }
  }, 90_000)

  test(`runs isolated MySQL ${mysqlVersion} databases with TLS, privileges, wrong-password rejection and cleanup`, async () => {
    const root = mkdtempSync(join(tmpdir(), 'pantry mysql test '))
    const started: Awaited<ReturnType<typeof startNativeService>>[] = []
    try {
      for (let i = 0; i < 2; i++) started.push(await startNativeService(parseServiceSpecs(`mysql@${mysqlVersion}`)[0]!, binDir!, root, options))
      expect(started[0]!.environment.MYSQL_PORT).not.toBe(started[1]!.environment.MYSQL_PORT)
      expect(started[0]!.environment.MYSQL_PORT).not.toBe('3306')
      const query = (at: number, sql: string, password = started[at]!.environment.MYSQL_PASSWORD) => execute(join(binDir!, 'mysql'), ['--no-defaults', '--protocol=TCP', '--ssl-mode=REQUIRED', '--host=127.0.0.1', `--port=${started[at]!.environment.MYSQL_PORT}`, '--user=pantry', '--database=pantry_ci', '--batch', '--skip-column-names', '--execute', sql], { env: { ...process.env, ...started[at]!.state.libraries, MYSQL_PWD: password }, timeout: 5000 })
      expect((await query(0, 'SELECT VERSION()')).stdout.trim()).toBe(mysqlVersion)
      expect((await query(0, "SHOW SESSION STATUS LIKE 'Ssl_cipher'")).stdout.trim()).toMatch(/^Ssl_cipher\t\S+$/)
      await expect(query(0, 'SELECT 1', 'wrong')).rejects.toThrow()
      await expect(execute(join(binDir!, 'mysql'), ['--no-defaults', '--protocol=TCP', '--ssl-mode=DISABLED', '--host=127.0.0.1', `--port=${started[0]!.environment.MYSQL_PORT}`, '--user=pantry', '--execute', 'SELECT 1'], { env: { ...process.env, ...started[0]!.state.libraries, MYSQL_PWD: started[0]!.environment.MYSQL_PASSWORD }, timeout: 5000 })).rejects.toThrow()
      await query(0, 'CREATE TABLE private_job (value integer); INSERT INTO private_job VALUES (42)')
      expect((await query(0, 'SELECT value FROM private_job')).stdout.trim()).toBe('42')
      expect((await query(1, "SELECT count(*) FROM information_schema.tables WHERE table_schema='pantry_ci' AND table_name='private_job'")).stdout.trim()).toBe('0')
      const database = `pantry_${crypto.randomUUID().replaceAll('-', '')}`
      await query(0, `CREATE DATABASE ${database}; DROP DATABASE ${database}`)
      // Exercise the exact published runtime client and TLS URL used by Stacks.
      for (const tls of [undefined, true]) {
        const sql = new Bun.SQL(started[0]!.environment.MYSQL_URL!, tls ? { tls } : {})
        let timeout: ReturnType<typeof setTimeout> | undefined
        try {
          const rows = await Promise.race([sql.unsafe("SHOW SESSION STATUS LIKE 'Ssl_cipher'"), new Promise<never>((resolve, reject) => {
            timeout = setTimeout(() => reject(new Error('MySQL TLS session query exceeded 10 seconds')), 10_000)
          })])
          expect(String(rows[0]?.Value || '')).not.toBe('')
        }
        finally {
          clearTimeout(timeout)
          await sql.close({ timeout: 1 })
        }
      }
    }
    finally {
      for (const service of started.reverse()) await stopNativeService(service.state)
      expect(readdirSync(root)).toEqual([])
      rmSync(root, { recursive: true, force: true })
    }
  }, 240_000)

  test('requires the Typesense API key, indexes and searches, then stops its own process', async () => {
    const root = mkdtempSync(join(tmpdir(), 'pantry-typesense-test-'))
    const service = await startNativeService(parseServiceSpecs('typesense@30.2')[0]!, binDir!, root, options)
    const url = service.environment.TYPESENSE_URL!
    const headers = { 'Content-Type': 'application/json', 'X-TYPESENSE-API-KEY': service.environment.TYPESENSE_API_KEY! }
    try {
      expect(service.version).toBe('30.2')
      expect((await fetch(`${url}/collections`)).status).toBe(401)
      expect((await fetch(`${url}/collections`, { method: 'POST', headers, body: JSON.stringify({ name: 'job', fields: [{ name: 'name', type: 'string' }] }) })).ok).toBe(true)
      expect((await fetch(`${url}/collections/job/documents`, { method: 'POST', headers, body: JSON.stringify({ id: 'one', name: 'Native Pantry service' }) })).ok).toBe(true)
      const response = await fetch(`${url}/collections/job/documents/search?q=Pantry&query_by=name`, { headers })
      expect((await response.json() as { found: number }).found).toBe(1)
    }
    finally {
      await stopNativeService(service.state)
      expect(existsSync(service.state.directory)).toBe(false)
      rmSync(root, { recursive: true, force: true })
    }
    await expect(fetch(`${url}/health`, { signal: AbortSignal.timeout(1000) })).rejects.toThrow()
  }, 90_000)

  test('rejects a running version mismatch and leaves no private service data', async () => {
    const root = mkdtempSync(join(tmpdir(), 'pantry-version-test-'))
    try {
      await expect(startNativeService(parseServiceSpecs('typesense@29.0')[0]!, binDir!, root, options)).rejects.toThrow('version mismatch')
      expect(readdirSync(root)).toEqual([])
    }
    finally { rmSync(root, { recursive: true, force: true }) }
  }, 90_000)
})

test('a failed native service startup removes only its own temporary directory', async () => {
  const root = mkdtempSync(join(tmpdir(), 'pantry-missing-service-'))
  try {
    await expect(startNativeService(parseServiceSpecs('postgres@17.10')[0]!, join(root, 'missing-bin'), root)).rejects.toThrow('startup failed')
    expect(readdirSync(root)).toEqual([])
  }
  finally { rmSync(root, { recursive: true, force: true }) }
})
