/**
 * **joshuto** - ranger-like terminal file manager written in Rust
 *
 * @domain `crates.io/joshuto`
 * @programs `joshuto`
 * @version `0.9.9` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install crates.io/joshuto`
 * @homepage https://crates.io/crates/joshuto
 * @dependencies `libgit2.org@1`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cratesiojoshuto
 * console.log(pkg.name)        // "joshuto"
 * console.log(pkg.description) // "ranger-like terminal file manager written in Rust"
 * console.log(pkg.programs)    // ["joshuto"]
 * console.log(pkg.versions[0]) // "0.9.9" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crates-io/joshuto.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cratesiojoshutoPackage = {
  /**
   * The display name of this package.
   */
  name: 'joshuto' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'crates.io/joshuto' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'ranger-like terminal file manager written in Rust' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/joshuto/package.yml' as const,
  homepageUrl: 'https://crates.io/crates/joshuto' as const,
  githubUrl: 'https://github.com/kamiyaa/joshuto' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install crates.io/joshuto' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/joshuto -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install crates.io/joshuto' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'joshuto',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'libgit2.org@1',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.9.9',
    '0.9.8',
  ] as const,
  aliases: [] as const,
}

export type CratesiojoshutoPackage = typeof cratesiojoshutoPackage
