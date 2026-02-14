/**
 * **jqp** - pkgx package
 *
 * @domain `github.com/noahgorstein/jqp`
 * @version `0.8.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/noahgorstein/jqp`
 * @buildDependencies `go.dev@=1.25.5` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomnoahgorsteinjqp
 * console.log(pkg.name)        // "jqp"
 * console.log(pkg.versions[0]) // "0.8.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/noahgorstein/jqp.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const jqpPackage = {
  /**
  * The display name of this package.
  */
  name: 'jqp' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/noahgorstein/jqp' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/noahgorstein/jqp/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/noahgorstein/jqp' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/noahgorstein/jqp -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/noahgorstein/jqp' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@=1.25.5',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.8.0',
  ] as const,
  aliases: [] as const,
}

export type JqpPackage = typeof jqpPackage
