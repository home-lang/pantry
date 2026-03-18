/**
 * PostgreSQL test helpers powered by pantry.
 *
 * @example
 * ```ts
 * import { usePostgres } from 'ts-pantry/testing'
 *
 * const pg = usePostgres()
 * beforeAll(pg.beforeAll)
 * afterAll(pg.afterAll)
 *
 * test('queries work', async () => {
 *   const sql = pg.sql()
 *   await sql`SELECT 1`
 * })
 * ```
 *
 * @example
 * ```ts
 * import { withPostgres } from 'ts-pantry/testing'
 *
 * test('scoped postgres', async () => {
 *   await withPostgres(async ({ port, host, sql }) => {
 *     const result = await sql`SELECT 1 as ok`
 *     expect(result[0].ok).toBe(1)
 *   })
 * })
 * ```
 */
import { PantryService } from './service'

export interface PostgresConfig {
  /** Port to run on (default: auto-detected from pantry) */
  port?: number
  /** Host (default: 'localhost') */
  host?: string
  /** Database name (default: 'postgres') */
  database?: string
  /** Username (default: current user or 'postgres') */
  username?: string
  /** Whether to stop postgres after tests (default: true if we started it) */
  stopAfter?: boolean
}

export interface PostgresConnection {
  port: number
  host: string
  database: string
  username: string
}

const service = new PantryService({ name: 'postgres' })

/**
 * Start PostgreSQL via pantry. No-op if already running.
 * Returns connection info.
 */
export async function startPostgres(config?: PostgresConfig): Promise<PostgresConnection> {
  const status = await service.ensureRunning()

  return {
    port: config?.port ?? status.port ?? 5432,
    host: config?.host ?? 'localhost',
    database: config?.database ?? 'postgres',
    username: config?.username ?? process.env.USER ?? 'postgres',
  }
}

/**
 * Stop PostgreSQL if it was started by startPostgres().
 */
export async function stopPostgres(): Promise<void> {
  await service.stop()
}

/**
 * Returns `{ beforeAll, afterAll }` hooks for use in test suites.
 * Automatically starts postgres before tests and stops it after.
 *
 * @example
 * ```ts
 * const pg = usePostgres()
 * beforeAll(pg.beforeAll)
 * afterAll(pg.afterAll)
 *
 * test('can query', async () => {
 *   // pg.connection has { port, host, database, username }
 * })
 * ```
 */
export function usePostgres(config?: PostgresConfig) {
  let connection: PostgresConnection | null = null

  return {
    get connection(): PostgresConnection {
      if (!connection) throw new Error('Postgres not started. Ensure beforeAll has run.')
      return connection
    },

    beforeAll: async (): Promise<void> => {
      connection = await startPostgres(config)
    },

    afterAll: async (): Promise<void> => {
      await stopPostgres()
      connection = null
    },
  }
}

/**
 * Run a function with a managed Postgres instance.
 * Starts before, stops after, cleans up on error.
 *
 * @example
 * ```ts
 * await withPostgres(async ({ port, host }) => {
 *   const db = connectToDb({ port, host })
 *   await db.query('SELECT 1')
 * })
 * ```
 */
export async function withPostgres<T>(
  fn: (connection: PostgresConnection) => Promise<T> | T,
  config?: PostgresConfig,
): Promise<T> {
  const connection = await startPostgres(config)
  try {
    return await fn(connection)
  }
  finally {
    if (config?.stopAfter !== false) {
      await stopPostgres()
    }
  }
}
