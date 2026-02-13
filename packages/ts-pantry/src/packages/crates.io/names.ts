/**
 * **names** - Random name generator for Rust
 *
 * @domain `crates.io/names`
 * @programs `names`
 * @version `0.14.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install crates.io/names`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cratesionames
 * console.log(pkg.name)        // "names"
 * console.log(pkg.description) // "Random name generator for Rust"
 * console.log(pkg.programs)    // ["names"]
 * console.log(pkg.versions[0]) // "0.14.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crates-io/names.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cratesionamesPackage = {
  /**
   * The display name of this package.
   */
  name: 'names' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'crates.io/names' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Random name generator for Rust' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/names/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/fnichol/names' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install crates.io/names' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/names -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install crates.io/names' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'names',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.14.0',
  ] as const,
  aliases: [] as const,
}

export type CratesionamesPackage = typeof cratesionamesPackage
