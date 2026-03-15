/**
 * **memcached** - pkgx package
 *
 * @domain `memcached.org`
 * @programs `memcached`
 *
 * @install `pantry install memcached.org`
 * @dependencies `libevent.org`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.memcachedorg
 * console.log(pkg.name)        // "memcached"
 * console.log(pkg.programs)    // ["memcached"]
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/memcached-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const memcachedorgPackage = {
  /**
  * The display name of this package.
  */
  name: 'memcached' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'memcached.org' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/memcached.org/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install memcached.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +memcached.org -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install memcached.org' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'memcached',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'libevent.org',
  ] as const,
  buildDependencies: [] as const,
  versions: [] as const,
  aliases: [] as const,
}

export type MemcachedorgPackage = typeof memcachedorgPackage
