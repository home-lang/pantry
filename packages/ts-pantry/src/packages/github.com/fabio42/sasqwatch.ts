/**
 * **sasqwatch** - A modern take on the classic watch command
 *
 * @domain `github.com/fabio42/sasqwatch`
 * @programs `sasqwatch`
 * @version `0.2.5` (7 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/fabio42/sasqwatch`
 * @buildDependencies `go.dev@^1.20` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomfabio42sasqwatch
 * console.log(pkg.name)        // "sasqwatch"
 * console.log(pkg.description) // "A modern take on the classic watch command"
 * console.log(pkg.programs)    // ["sasqwatch"]
 * console.log(pkg.versions[0]) // "0.2.5" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/fabio42/sasqwatch.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const sasqwatchPackage = {
  /**
   * The display name of this package.
   */
  name: 'sasqwatch' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/fabio42/sasqwatch' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'A modern take on the classic watch command' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/fabio42/sasqwatch/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/fabio42/sasqwatch' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/fabio42/sasqwatch' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/fabio42/sasqwatch -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/fabio42/sasqwatch' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'sasqwatch',
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
    '0.2.5',
    '0.2.4',
    '0.2.3',
    '0.2.2',
    '0.2.1',
    '0.2.0',
    '0.1.3',
  ] as const,
  aliases: [] as const,
}

export type SasqwatchPackage = typeof sasqwatchPackage
