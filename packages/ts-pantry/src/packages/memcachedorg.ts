export const memcachedorgPackage = {
  name: 'memcached' as const,
  domain: 'memcached.org' as const,
  description: 'Distributed memory object caching system' as const,
  packageYmlUrl: 'https://github.com/home-lang/pantry/tree/main/packages/ts-pantry/src/pantry/memcached.org/package.yml' as const,
  homepageUrl: 'https://memcached.org/' as const,
  githubUrl: 'https://github.com/memcached/memcached' as const,
  installCommand: 'launchpad install memcached.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +memcached.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install memcached.org' as const,
  programs: [
    'memcached',
  ] as const,
  companions: [] as const,
  dependencies: [
    'libevent.org',
  ] as const,
  buildDependencies: [
    'freedesktop.org/pkg-config',
  ] as const,
  versions: [
    '1.6.40',
  ] as const,
  aliases: [] as const,
}

export type MemcachedorgPackage = typeof memcachedorgPackage
