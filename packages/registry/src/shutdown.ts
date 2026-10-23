import { maxScanAdmissionWaitMs, maxScanBudgetMs } from './malware-scanning'

/** Account for admitted HTTP work, then detached completion work and persistence. */
export function registryShutdownBudgetMs(env: NodeJS.ProcessEnv = process.env): number {
  const budget = 2 * (maxScanBudgetMs() + maxScanAdmissionWaitMs(env) + 30_000) + 30_000
  if (!Number.isSafeInteger(budget) || budget <= 0) throw new Error('Registry shutdown budget exceeds the finite integer range')
  return budget
}

export function registrySystemdStopTimeoutSeconds(env: NodeJS.ProcessEnv = process.env): number {
  return Math.ceil(registryShutdownBudgetMs(env) / 1000) + 15
}

interface RegistryServer { stop: (closeActiveConnections?: boolean) => Promise<unknown> }

/** Stop admission, drain active responses, then persist every owned snapshot. */
export function createRegistryShutdown(server: RegistryServer, stores: readonly unknown[], timeoutMs: number = registryShutdownBudgetMs()): () => Promise<void> {
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs <= 0) throw new Error('Registry shutdown requires a finite positive deadline')
  let stopping: Promise<void> | undefined
  return () => {
    stopping ??= (async () => {
      let expired = false, timer: ReturnType<typeof setTimeout> | undefined
      const deadlineError = new Error('Registry shutdown deadline exhausted before drain and snapshot persistence completed')
      try {
        await Promise.race([
          (async () => {
            await server.stop(false)
            if (expired) throw deadlineError
            const results = await Promise.allSettled(stores.map(async store => {
              if (store && typeof store === 'object' && 'flush' in store && typeof store.flush === 'function') await store.flush()
            }))
            const failures = results.filter((result): result is PromiseRejectedResult => result.status === 'rejected')
            if (failures.length) throw new AggregateError(failures.map(result => result.reason), 'Registry snapshot persistence failed during shutdown')
          })(),
          new Promise<never>((_resolve, reject) => {
            timer = setTimeout(() => {
              expired = true
              reject(deadlineError)
            }, timeoutMs)
          }),
        ])
      }
      catch (error) {
        // Exit with failure even if forced disposal itself cannot complete.
        void server.stop(true).catch(closeError => console.error('Forced registry close failed:', closeError))
        throw error
      }
      finally { clearTimeout(timer) }
    })()
    return stopping
  }
}

/** Only the server entrypoint owns process signals; importing its API does not. */
export function installRegistryShutdown(server: RegistryServer, stores: readonly unknown[]): () => void {
  const shutdown = createRegistryShutdown(server, stores)
  let requested = false
  const onSignal = () => {
    if (requested) return
    requested = true
    shutdown().then(() => process.exit(0), error => {
      console.error('Registry shutdown failed:', error instanceof Error ? error.message : String(error), error)
      process.exit(1)
    })
  }
  process.on('SIGTERM', onSignal)
  process.on('SIGINT', onSignal)
  return () => {
    process.off('SIGTERM', onSignal)
    process.off('SIGINT', onSignal)
  }
}
