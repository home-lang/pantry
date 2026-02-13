/**
 * **cargo-binstall** - pkgx package
 *
 * @domain `crates.io/cargo-binstall`
 * @version `1.16.7` (12 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install crates.io/cargo-binstall`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cratesiocargobinstall
 * console.log(pkg.name)        // "cargo-binstall"
 * console.log(pkg.versions[0]) // "1.16.7" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crates-io/cargo-binstall.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cratesiocargobinstallPackage = {
  /**
   * The display name of this package.
   */
  name: 'cargo-binstall' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'crates.io/cargo-binstall' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/cargo-binstall/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install crates.io/cargo-binstall' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/cargo-binstall -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install crates.io/cargo-binstall' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.16.7',
    '1.16.6',
    '1.16.5',
    '1.16.4',
    '1.16.3',
    '1.16.2',
    '1.16.1',
    '1.16.0',
    '1.15.11',
    '1.15.10',
    '1.15.9',
    '1.15.8',
  ] as const,
  aliases: [] as const,
}

export type CratesiocargobinstallPackage = typeof cratesiocargobinstallPackage
