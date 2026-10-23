export interface CacheEnvironmentSink {
  exportVariable: (name: string, value: string) => void
  setSecret: (value: string) => void
}

// The runner supplies these to JavaScript actions, but not to subsequent shell
// steps. Opt in only for jobs that execute our repository's build scripts.
export function exportBuildCacheEnvironment(environment: NodeJS.ProcessEnv, sink: CacheEnvironmentSink): boolean {
  if (!environment.ACTIONS_RUNTIME_TOKEN || !(environment.ACTIONS_RESULTS_URL || environment.ACTIONS_CACHE_URL)) return false
  sink.setSecret(environment.ACTIONS_RUNTIME_TOKEN)
  for (const name of ['ACTIONS_RUNTIME_TOKEN', 'ACTIONS_RESULTS_URL', 'ACTIONS_CACHE_URL', 'ACTIONS_CACHE_SERVICE_V2', 'ACTIONS_RUNTIME_URL']) {
    if (environment[name]) sink.exportVariable(name, environment[name])
  }
  sink.exportVariable('PANTRY_BUILD_CACHE_READY', 'true')
  return true
}
