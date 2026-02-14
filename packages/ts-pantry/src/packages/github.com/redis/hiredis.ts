/**
 * **hiredis** - Minimalistic C client for Redis >= 1.2
 *
 * @domain `github.com/redis/hiredis`
 * @version `1.3.0` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/redis/hiredis`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomredishiredis
 * console.log(pkg.name)        // "hiredis"
 * console.log(pkg.description) // "Minimalistic C client for Redis >= 1.2"
 * console.log(pkg.versions[0]) // "1.3.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/redis/hiredis.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const hiredisPackage = {
  /**
  * The display name of this package.
  */
  name: 'hiredis' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/redis/hiredis' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Minimalistic C client for Redis >= 1.2' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/redis/hiredis/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/redis/hiredis' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/redis/hiredis' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/redis/hiredis -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/redis/hiredis' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.3.0',
    '1.2.0',
    '1.1.0',
  ] as const,
  aliases: [] as const,
}

export type HiredisPackage = typeof hiredisPackage
