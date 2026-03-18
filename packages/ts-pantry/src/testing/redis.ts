/**
 * Redis test helpers powered by pantry.
 */
import { PantryService } from './service'

export interface RedisConfig {
  port?: number
  host?: string
  stopAfter?: boolean
}

export interface RedisConnection {
  port: number
  host: string
  url: string
}

const service = new PantryService({ name: 'redis' })

export async function startRedis(config?: RedisConfig): Promise<RedisConnection> {
  const status = await service.ensureRunning()
  const port = config?.port ?? status.port ?? 6379
  const host = config?.host ?? 'localhost'
  return { port, host, url: `redis://${host}:${port}` }
}

export async function stopRedis(): Promise<void> {
  await service.stop()
}

export function useRedis(config?: RedisConfig) {
  let connection: RedisConnection | null = null
  return {
    get connection(): RedisConnection {
      if (!connection) throw new Error('Redis not started. Ensure beforeAll has run.')
      return connection
    },
    beforeAll: async (): Promise<void> => { connection = await startRedis(config) },
    afterAll: async (): Promise<void> => { await stopRedis(); connection = null },
  }
}

export async function withRedis<T>(
  fn: (connection: RedisConnection) => Promise<T> | T,
  config?: RedisConfig,
): Promise<T> {
  const connection = await startRedis(config)
  try {
    return await fn(connection)
  }
  finally {
    if (config?.stopAfter !== false) await stopRedis()
  }
}
