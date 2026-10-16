import { describe, expect, test } from 'bun:test'
import { execFile } from 'node:child_process'
import { existsSync, mkdtempSync, readdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { promisify } from 'node:util'
import { startNativeService, stopNativeService } from './native-services'
import { parseServiceSpecs } from './services'

const execute = promisify(execFile)
const binDir = process.env.PANTRY_NATIVE_SERVICE_TEST_BIN
const integration = binDir ? describe : describe.skip

integration('Pantry native action services against installed packages', () => {
  test('owns two isolated PostgreSQL clusters, authenticates queries and cleans both', async () => {
    const root = mkdtempSync(join(tmpdir(), 'pantry services test '))
    const started: Awaited<ReturnType<typeof startNativeService>>[] = []
    try {
      for (let i = 0; i < 2; i++) started.push(await startNativeService(parseServiceSpecs('postgres@17.10')[0]!, binDir!, root))
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

  test('requires the Typesense API key, indexes and searches, then stops its own process', async () => {
    const root = mkdtempSync(join(tmpdir(), 'pantry-typesense-test-'))
    const service = await startNativeService(parseServiceSpecs('typesense@30.2')[0]!, binDir!, root)
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
      await expect(startNativeService(parseServiceSpecs('typesense@29.0')[0]!, binDir!, root)).rejects.toThrow('version mismatch')
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
