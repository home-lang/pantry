/**
 * **tiny** - A terminal IRC client
 *
 * @domain `crates.io/tiny`
 * @programs `tiny`
 * @version `0.13.0` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install crates.io/tiny`
 * @dependencies `openssl.org^1.1`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cratesiotiny
 * console.log(pkg.name)        // "tiny"
 * console.log(pkg.description) // "A terminal IRC client "
 * console.log(pkg.programs)    // ["tiny"]
 * console.log(pkg.versions[0]) // "0.13.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crates-io/tiny.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cratesiotinyPackage = {
  /**
  * The display name of this package.
  */
  name: 'tiny' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'crates.io/tiny' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'A terminal IRC client ' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/tiny/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/osa1/tiny' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install crates.io/tiny' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/tiny -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install crates.io/tiny' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'tiny',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'openssl.org^1.1',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.13.0',
    '0.12.0',
    '0.11.0',
  ] as const,
  aliases: [] as const,
}

export type CratesiotinyPackage = typeof cratesiotinyPackage
