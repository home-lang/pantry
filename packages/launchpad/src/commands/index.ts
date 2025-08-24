import type { Command } from '../cli/types'

// Lazy command resolvers. Add new commands here.
const registry: Record<string, () => Promise<Command>> = {
  'bootstrap': async () => (await import('./bootstrap')).default,
  'setup': async () => (await import('./setup')).default,
  'upgrade': async () => (await import('./upgrade')).default,
  'dev:check-updates': async () => (await import('./dev/check-updates')).default,
  'dev:find-project-root': async () => (await import('./dev/find-project-root')).default,
  'dev:md5': async () => (await import('./dev/md5')).default,
  'dev:scan-library-paths': async () => (await import('./dev/scan-library-paths')).default,
  'dev:scan-global-paths': async () => (await import('./dev/scan-global-paths')).default,
  'dev:integrate': async () => (await import('./dev/integrate')).default,
  'dev': async () => (await import('./dev/dev')).default,
  'env:list': async () => (await import('./env/list')).default,
  'env:inspect': async () => (await import('./env/inspect')).default,
  'env:clean': async () => (await import('./env/clean')).default,
  'env:remove': async () => (await import('./env/remove')).default,
  'uninstall': async () => (await import('./uninstall')).default,
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

// Aliases map to canonical command names
const aliases: Record<string, string> = {
  'remove': 'uninstall',
  'packages': 'tags',
  'cache:info': 'cache:stats',
  'up': 'update',
  'self-update': 'upgrade',
  'service': 'services',
}

export async function resolveCommand(name?: string): Promise<Command | undefined> {
  if (!name)
    return undefined
  const key = aliases[name] || name
  const loader = registry[key]
  if (!loader)
    return undefined
  return loader()
}

export function listCommands(): string[] {
  return Object.keys(registry).sort()
}
