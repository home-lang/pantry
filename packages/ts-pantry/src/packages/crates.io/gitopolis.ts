/**
 * **gitopolis** - Manage multiple git repositories
 *
 * @domain `crates.io/gitopolis`
 * @programs `gitopolis`
 * @version `1.13.0` (29 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install crates.io/gitopolis`
 * @dependencies `openssl.org^1.1`, `zlib.net^1`, `git-scm.org^2`, ... (+1 more)
 * @buildDependencies `gnu.org/make` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cratesiogitopolis
 * console.log(pkg.name)        // "gitopolis"
 * console.log(pkg.description) // "Manage multiple git repositories"
 * console.log(pkg.programs)    // ["gitopolis"]
 * console.log(pkg.versions[0]) // "1.13.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crates-io/gitopolis.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cratesiogitopolisPackage = {
  /**
   * The display name of this package.
   */
  name: 'gitopolis' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'crates.io/gitopolis' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Manage multiple git repositories' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/gitopolis/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/rustworkshop/gitopolis' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install crates.io/gitopolis' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/gitopolis -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install crates.io/gitopolis' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'gitopolis',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'openssl.org^1.1',
    'zlib.net^1',
    'git-scm.org^2',
    'libgit2.org~1.7 # links to libgit2.so.1.7',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'gnu.org/make',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.13.0',
    '1.12.4',
    '1.12.3',
    '1.12.0',
    '1.11.0',
    '1.10.2',
    '1.10.1',
    '1.9.0',
    '1.8.0',
    '1.7.0',
    '1.6.0',
    '1.5.15',
    '1.5.14',
    '1.5.13',
    '1.5.11',
    '1.5.8',
    '1.5.7',
    '1.5.4',
    '1.5.3',
    '1.5.2',
    '1.5.1',
    '1.5.0',
    '1.4.2',
    '1.4.1',
    '1.4.0',
    '1.3.3',
    '1.3.2',
    '1.3.1',
    '1.3.0',
  ] as const,
  aliases: [] as const,
}

export type CratesiogitopolisPackage = typeof cratesiogitopolisPackage
