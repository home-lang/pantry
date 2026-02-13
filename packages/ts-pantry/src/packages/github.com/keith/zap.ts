/**
 * **zap** - A CLI for cleaning up after .apps
 *
 * @domain `github.com/keith/zap`
 * @programs `zap`
 * @version `1.2.0` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/keith/zap`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomkeithzap
 * console.log(pkg.name)        // "zap"
 * console.log(pkg.description) // "A CLI for cleaning up after .apps"
 * console.log(pkg.programs)    // ["zap"]
 * console.log(pkg.versions[0]) // "1.2.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/keith/zap.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const zapPackage = {
  /**
   * The display name of this package.
   */
  name: 'zap' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/keith/zap' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'A CLI for cleaning up after .apps' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/keith/zap/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/keith/zap' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/keith/zap' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/keith/zap -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/keith/zap' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'zap',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.2.0',
    '1.1.0',
  ] as const,
  aliases: [] as const,
}

export type ZapPackage = typeof zapPackage
