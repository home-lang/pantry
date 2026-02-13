/**
 * **rip2** - A safe and ergonomic alternative to rm
 *
 * @domain `github.com/MilesCranmer/rip2`
 * @programs `rip`
 * @version `0.9.6` (7 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/MilesCranmer/rip2`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcommilescranmerrip2
 * console.log(pkg.name)        // "rip2"
 * console.log(pkg.description) // " A safe and ergonomic alternative to rm"
 * console.log(pkg.programs)    // ["rip"]
 * console.log(pkg.versions[0]) // "0.9.6" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/MilesCranmer/rip2.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const rip2Package = {
  /**
   * The display name of this package.
   */
  name: 'rip2' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/MilesCranmer/rip2' as const,
  /**
   * Brief description of what this package does.
   */
  description: ' A safe and ergonomic alternative to rm' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/MilesCranmer/rip2/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/MilesCranmer/rip2' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/MilesCranmer/rip2' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/MilesCranmer/rip2 -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/MilesCranmer/rip2' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'rip',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.9.6',
    '0.9.5',
    '0.9.4',
    '0.9.3',
    '0.9.2',
    '0.9.1',
    '0.9.0',
  ] as const,
  aliases: [] as const,
}

export type Rip2Package = typeof rip2Package
