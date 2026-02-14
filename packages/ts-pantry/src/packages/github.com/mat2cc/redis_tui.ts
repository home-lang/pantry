/**
 * **redis_tui** - Redis terminal application
 *
 * @domain `github.com/mat2cc/redis_tui`
 * @programs `redis_tui`
 * @version `0.2.4` (6 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/mat2cc/redis_tui`
 * @buildDependencies `go.dev@^1.20` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcommat2ccredis_tui
 * console.log(pkg.name)        // "redis_tui"
 * console.log(pkg.description) // "Redis terminal application"
 * console.log(pkg.programs)    // ["redis_tui"]
 * console.log(pkg.versions[0]) // "0.2.4" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/mat2cc/redis_tui.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const redis_tuiPackage = {
  /**
  * The display name of this package.
  */
  name: 'redis_tui' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/mat2cc/redis_tui' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Redis terminal application' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/mat2cc/redis_tui/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/mat2cc/redis_tui' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/mat2cc/redis_tui' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/mat2cc/redis_tui -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/mat2cc/redis_tui' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'redis_tui',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@^1.20',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.2.4',
    '0.2.3',
    '0.2.2',
    '0.2.1',
    '0.2.0',
    '0.1.0',
  ] as const,
  aliases: [] as const,
}

export type Redis_tuiPackage = typeof redis_tuiPackage
