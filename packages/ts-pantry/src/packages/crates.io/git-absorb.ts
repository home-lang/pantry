/**
 * **git-absorb** - git commit --fixup, but automatic
 *
 * @domain `crates.io/git-absorb`
 * @programs `git-absorb`
 * @version `0.8.0` (9 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install crates.io/git-absorb`
 * @homepage https://crates.io/crates/git-absorb
 * @dependencies `libgit2.org~1.7 # links to libgit2.so.1.7`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cratesiogitabsorb
 * console.log(pkg.name)        // "git-absorb"
 * console.log(pkg.description) // "git commit --fixup, but automatic"
 * console.log(pkg.programs)    // ["git-absorb"]
 * console.log(pkg.versions[0]) // "0.8.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crates-io/git-absorb.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cratesiogitabsorbPackage = {
  /**
   * The display name of this package.
   */
  name: 'git-absorb' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'crates.io/git-absorb' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'git commit --fixup, but automatic' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/git-absorb/package.yml' as const,
  homepageUrl: 'https://crates.io/crates/git-absorb' as const,
  githubUrl: 'https://github.com/tummychow/git-absorb' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install crates.io/git-absorb' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/git-absorb -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install crates.io/git-absorb' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'git-absorb',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'libgit2.org~1.7 # links to libgit2.so.1.7',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.8.0',
    '0.7.0',
    '0.6.17',
    '0.6.16',
    '0.6.15',
    '0.6.13',
    '0.6.12',
    '0.6.11',
    '0.6.10',
  ] as const,
  aliases: [] as const,
}

export type CratesiogitabsorbPackage = typeof cratesiogitabsorbPackage
