/**
 * **reshape** - An easy-to-use, zero-downtime schema migration tool for Postgres
 *
 * @domain `fabianlindfors.se/reshape`
 * @programs `reshape`
 * @version `0.7.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install fabianlindfors.se/reshape`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.fabianlindforssereshape
 * console.log(pkg.name)        // "reshape"
 * console.log(pkg.description) // "An easy-to-use, zero-downtime schema migration ..."
 * console.log(pkg.programs)    // ["reshape"]
 * console.log(pkg.versions[0]) // "0.7.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/fabianlindfors-se/reshape.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const fabianlindforssereshapePackage = {
  /**
   * The display name of this package.
   */
  name: 'reshape' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'fabianlindfors.se/reshape' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'An easy-to-use, zero-downtime schema migration tool for Postgres' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/fabianlindfors.se/reshape/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/fabianlindfors/reshape' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install fabianlindfors.se/reshape' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +fabianlindfors.se/reshape -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install fabianlindfors.se/reshape' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'reshape',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.7.0',
  ] as const,
  aliases: [] as const,
}

export type FabianlindforssereshapePackage = typeof fabianlindforssereshapePackage
