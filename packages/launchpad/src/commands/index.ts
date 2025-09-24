import type { Command } from '../cli/types'

// Lazy command resolvers. Add new commands here.
const registry: Record<string, () => Promise<Command>> = {
  'bootstrap': async () => (await import('./bootstrap')).default,
  'setup': async () => (await import('./setup')).default,
  'upgrade': async () => (await import('./upgrade')).default,
  'dev:shellcode': async () => (await import('./shellcode')).default,
  'dev:check-updates': async () => (await import('./check-updates')).default,
  'dev:find-project-root': async () => (await import('./find-project-root')).default,
  'dev:md5': async () => (await import('./md5')).default,
  'dev:scan-library-paths': async () => (await import('./scan-library-paths')).default,
  'dev:scan-global-paths': async () => (await import('./scan-global-paths')).default,
  'dev:integrate': async () => (await import('./integrate')).default,
  'dev': async () => (await import('./dev')).default,
  'env:list': async () => (await import('./env/list')).default,
  'env:inspect': async () => (await import('./env/inspect')).default,
  'env:clean': async () => (await import('./env/clean')).default,
  'env:remove': async () => (await import('./env/remove')).default,
  'uninstall': async () => (await import('./uninstall')).default,
  'reinstall': async () => (await import('./reinstall')).default,
  'cache:clear': async () => (await import('./cache/clear')).default,
  'cache:stats': async () => (await import('./cache/stats')).default,
  'cache:clean': async () => (await import('./cache/clean')).default,
  'clean': async () => (await import('./clean')).default,
  'info': async () => (await import('./info')).default,
  'search': async () => (await import('./search')).default,
  'tags': async () => (await import('./tags')).default,
  'doctor': async () => (await import('./doctor')).default,
  'shim': async () => (await import('./shim')).default,
  'list': async () => (await import('./list')).default,
  'install': async () => (await import('./install')).default,
  'config': async () => (await import('./config')).default,
  'outdated': async () => (await import('./outdated')).default,
  'update': async () => (await import('./update')).default,
  'debug:deps': async () => (await import('./debug/deps')).default,
  'benchmark:file-detection': async () => (await import('./benchmark/file-detection')).default,
  'db:create': async () => (await import('./db/create')).default,
  // services
  'start': async () => (await import('./start')).default,
  'stop': async () => (await import('./stop')).default,
  'restart': async () => (await import('./restart')).default,
  'enable': async () => (await import('./enable')).default,
  'disable': async () => (await import('./disable')).default,
  'status': async () => (await import('./status')).default,
  'services': async () => (await import('./services')).default,
  // build env
  'build-env': async () => (await import('./build-env')).default,
}

export async function resolveCommand(name?: string): Promise<Command | undefined> {
  if (!name)
    return undefined
  const loader = registry[name]
  if (!loader)
    return undefined
  return loader()
}

export function listCommands(): string[] {
  return Object.keys(registry).sort()
}
