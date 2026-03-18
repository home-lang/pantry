/**
 * MySQL test helpers powered by pantry.
 */
import { PantryService } from './service'

export interface MysqlConfig {
  port?: number
  host?: string
  database?: string
  username?: string
  stopAfter?: boolean
}

export interface MysqlConnection {
  port: number
  host: string
  database: string
  username: string
}

const service = new PantryService({ name: 'mysql' })

export async function startMysql(config?: MysqlConfig): Promise<MysqlConnection> {
  const status = await service.ensureRunning()
  return {
    port: config?.port ?? status.port ?? 3306,
    host: config?.host ?? 'localhost',
    database: config?.database ?? 'test',
    username: config?.username ?? 'root',
  }
}

export async function stopMysql(): Promise<void> {
  await service.stop()
}

export function useMysql(config?: MysqlConfig) {
  let connection: MysqlConnection | null = null
  return {
    get connection(): MysqlConnection {
      if (!connection) throw new Error('MySQL not started. Ensure beforeAll has run.')
      return connection
    },
    beforeAll: async (): Promise<void> => { connection = await startMysql(config) },
    afterAll: async (): Promise<void> => { await stopMysql(); connection = null },
  }
}

export async function withMysql<T>(
  fn: (connection: MysqlConnection) => Promise<T> | T,
  config?: MysqlConfig,
): Promise<T> {
  const connection = await startMysql(config)
  try {
    return await fn(connection)
  }
  finally {
    if (config?.stopAfter !== false) await stopMysql()
  }
}
