/**
 * **git-gone** - Cleanup stale Git branches of pull requests
 *
 * @domain `crates.io/git-gone`
 * @programs `git-gone`
 * @version `1.2.5` (7 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install crates.io/git-gone`
 * @homepage https://crates.io/crates/git-gone
 * @dependencies `libgit2.org~1.7 # links to libgit2.so.1.7`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cratesiogitgone
 * console.log(pkg.name)        // "git-gone"
 * console.log(pkg.description) // "Cleanup stale Git branches of pull requests"
 * console.log(pkg.programs)    // ["git-gone"]
 * console.log(pkg.versions[0]) // "1.2.5" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crates-io/git-gone.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cratesiogitgonePackage = {
  /**
   * The display name of this package.
   */
  name: 'git-gone' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'crates.io/git-gone' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Cleanup stale Git branches of pull requests' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/git-gone/package.yml' as const,
  homepageUrl: 'https://crates.io/crates/git-gone' as const,
  githubUrl: 'https://github.com/swsnr/git-gone' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install crates.io/git-gone' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/git-gone -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install crates.io/git-gone' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'git-gone',
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
    '1.2.5',
    '1.2.4',
    '1.2.2',
    '1.2.0',
    '1.1.1',
    '1.1.0',
    '1.0.0',
  ] as const,
  aliases: [] as const,
}

export type CratesiogitgonePackage = typeof cratesiogitgonePackage
