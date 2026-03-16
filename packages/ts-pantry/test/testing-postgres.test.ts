import { describe, expect, test } from 'bun:test'
import { startPostgres, stopPostgres, usePostgres, withPostgres } from '../src/testing/postgres'

describe('Postgres helpers', () => {
  test('startPostgres returns connection info', async () => {
    const conn = await startPostgres()
    expect(conn.port).toBe(5432)
    expect(conn.host).toBe('localhost')
    expect(conn.database).toBe('postgres')
    expect(typeof conn.username).toBe('string')
    await stopPostgres()
  })

  test('withPostgres provides connection and cleans up', async () => {
    let capturedPort = 0
    await withPostgres(async (conn) => {
      capturedPort = conn.port
      expect(conn.port).toBe(5432)
      expect(conn.host).toBe('localhost')
    })
    expect(capturedPort).toBe(5432)
  })

  test('usePostgres returns beforeAll/afterAll hooks', () => {
    const pg = usePostgres()
    expect(typeof pg.beforeAll).toBe('function')
    expect(typeof pg.afterAll).toBe('function')
  })

  test('usePostgres lifecycle works', async () => {
    const pg = usePostgres()
    await pg.beforeAll()
    expect(pg.connection.port).toBe(5432)
    expect(pg.connection.host).toBe('localhost')
    await pg.afterAll()
  })

  test('custom config is respected', async () => {
    const conn = await startPostgres({
      database: 'test_db',
      username: 'testuser',
    })
    expect(conn.database).toBe('test_db')
    expect(conn.username).toBe('testuser')
    await stopPostgres()
  })
})
