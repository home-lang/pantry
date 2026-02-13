/**
 * **rucola** - Terminal-based markdown note manager.
 *
 * @domain `crates.io/rucola-notes`
 * @programs `rucola`
 * @version `0.8.2` (6 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install crates.io/rucola-notes`
 * @dependencies `openssl.org^1.1 # as of 0.6.0`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cratesiorucolanotes
 * console.log(pkg.name)        // "rucola"
 * console.log(pkg.description) // "Terminal-based markdown note manager."
 * console.log(pkg.programs)    // ["rucola"]
 * console.log(pkg.versions[0]) // "0.8.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crates-io/rucola-notes.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cratesiorucolanotesPackage = {
  /**
   * The display name of this package.
   */
  name: 'rucola' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'crates.io/rucola-notes' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Terminal-based markdown note manager.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/rucola-notes/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/Linus-Mussmaecher/rucola' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install crates.io/rucola-notes' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/rucola-notes -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install crates.io/rucola-notes' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'rucola',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'openssl.org^1.1 # as of 0.6.0',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.8.2',
    '0.8.1',
    '0.8.0',
    '0.7.0',
    '0.6.0',
    '0.5.0',
  ] as const,
  aliases: [] as const,
}

export type CratesiorucolanotesPackage = typeof cratesiorucolanotesPackage
