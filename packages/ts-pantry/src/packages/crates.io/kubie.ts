/**
 * **kubie** - pkgx package
 *
 * @domain `crates.io/kubie`
 * @version `0.26.1` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install crates.io/kubie`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cratesiokubie
 * console.log(pkg.name)        // "kubie"
 * console.log(pkg.versions[0]) // "0.26.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crates-io/kubie.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cratesiokubiePackage = {
  /**
   * The display name of this package.
   */
  name: 'kubie' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'crates.io/kubie' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/kubie/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install crates.io/kubie' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/kubie -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install crates.io/kubie' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.26.1',
    '0.26.0',
  ] as const,
  aliases: [] as const,
}

export type CratesiokubiePackage = typeof cratesiokubiePackage
