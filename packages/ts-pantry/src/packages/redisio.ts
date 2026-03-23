/**
 * **redis** - Redis is an in-memory database that persists on disk. The data model is key-value, but many different kind of values are supported: Strings, Lists, Sets, Sorted Sets, Hashes, Streams, HyperLogLogs, Bitmaps.
 *
 * @domain `redis.io`
 * @programs `redis-server`, `redis-cli`, `redis-benchmark`
 * @version `8.6.0` (60 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install redis.io`
 * @name `redis`
 * @homepage http://redis.io
 * @dependencies `openssl.org^1`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * // Access the package
 * const pkg = pantry.redis
 * // Or access via domain
 * const samePkg = pantry.redisio
 * console.log(pkg === samePkg) // true
 * console.log(pkg.name)        // "redis"
 * console.log(pkg.description) // "Redis is an in-memory database that persists on..."
 * console.log(pkg.programs)    // ["redis-server", "redis-cli", ...]
 * console.log(pkg.versions[0]) // "8.6.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/redis-io.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const redisPackage = {
  /**
  * The display name of this package.
  */
  name: 'redis' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'redis.io' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Redis is an in-memory database that persists on disk. The data model is key-value, but many different kind of values are supported: Strings, Lists, Sets, Sorted Sets, Hashes, Streams, HyperLogLogs, Bitmaps.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/redis.io/package.yml' as const,
  homepageUrl: 'http://redis.io' as const,
  githubUrl: 'https://github.com/redis/redis' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install redis.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +redis.io -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install redis.io' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'redis-server',
    'redis-cli',
    'redis-benchmark',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'openssl.org^1',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '8.6.0',
    '8.4.2',
    '8.4.1',
    '8.4.0',
    '8.2.5',
    '8.2.4',
    '8.2.3',
    '8.2.2',
    '8.2.1',
    '8.2.0',
    '8.0.6',
    '8.0.5',
    '8.0.4',
    '8.0.3',
    '8.0.2',
    '8.0.1',
    '8.0.0',
    '7.4.8',
    '7.4.7',
    '7.4.6',
  ] as const,
  /**
  * Alternative names for this package.
  * You can use any of these names to access the package.
  */
  aliases: [] as const,
}

export type RedisPackage = typeof redisPackage
