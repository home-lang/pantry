type CacheClient = Pick<typeof import('@actions/cache'), 'isFeatureAvailable' | 'restoreCache' | 'saveCache'>

interface DependencyCache {
  available: boolean
  restore: (paths: string[], key: string, restoreKeys: string[]) => Promise<string | undefined>
  save: (paths: string[], key: string) => Promise<number | undefined>
}

/** Unsupported runners must not create archives for a service they lack. */
export function dependencyCache(client: CacheClient): DependencyCache {
  const available = client.isFeatureAvailable()
  return {
    available,
    async restore(paths, key, restoreKeys) {
      if (!available) return undefined
      return client.restoreCache(paths, key, restoreKeys)
    },
    async save(paths, key) {
      if (!available) return undefined
      const id = await client.saveCache(paths, key)
      return id > 0 ? id : undefined
    },
  }
}
