import { expect, test } from 'bun:test'
import { dependencyCache } from './cache-service'

test('a runner without the cache service never restores or creates an archive', async () => {
  const client = dependencyCache({
    isFeatureAvailable: () => false,
    restoreCache: async () => { throw new Error('Unsupported restore must not run') },
    saveCache: async () => { throw new Error('Unsupported archive creation must not run') },
  })
  expect(client.available).toBe(false)
  expect(await client.restore(['pantry'], 'exact', ['prefix'])).toBeUndefined()
  expect(await client.save(['pantry'], 'exact')).toBeUndefined()
})

test('a supported runner retains exact and prefix restore requests and accepted save IDs', async () => {
  const calls: unknown[][] = []
  const client = dependencyCache({
    isFeatureAvailable: () => true,
    restoreCache: async (...args) => { calls.push(args); return 'prefix-hit' },
    saveCache: async (...args) => { calls.push(args); return 123 },
  })
  expect(client.available).toBe(true)
  expect(await client.restore(['pantry'], 'exact', ['prefix'])).toBe('prefix-hit')
  expect(await client.save(['pantry'], 'exact')).toBe(123)
  expect(calls).toEqual([[['pantry'], 'exact', ['prefix']], [['pantry'], 'exact']])
})

test('an unavailable or rejected save cannot be reported as a successful cache', async () => {
  for (const id of [-1, 0]) {
    const client = dependencyCache({ isFeatureAvailable: () => true, restoreCache: async () => undefined, saveCache: async () => id })
    expect(await client.save(['pantry'], 'key')).toBeUndefined()
  }
})

test('supported service failures remain visible to the action error handler', async () => {
  const failure = new Error('Cache transport failed')
  const client = dependencyCache({
    isFeatureAvailable: () => true,
    restoreCache: async () => { throw failure },
    saveCache: async () => { throw failure },
  })
  await expect(client.restore(['pantry'], 'key', [])).rejects.toBe(failure)
  await expect(client.save(['pantry'], 'key')).rejects.toBe(failure)
})
