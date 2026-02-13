/**
 * **git-trim** - Automatically trims your branches whose tracking remote refs are merged or stray
 *
 * @domain `crates.io/git-trim`
 * @programs `git-trim`
 * @version `0.4.3` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install crates.io/git-trim`
 * @dependencies `openssl.org^1.1`, `zlib.net^1`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cratesiogittrim
 * console.log(pkg.name)        // "git-trim"
 * console.log(pkg.description) // "Automatically trims your branches whose trackin..."
 * console.log(pkg.programs)    // ["git-trim"]
 * console.log(pkg.versions[0]) // "0.4.3" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crates-io/git-trim.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cratesiogittrimPackage = {
  /**
   * The display name of this package.
   */
  name: 'git-trim' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'crates.io/git-trim' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Automatically trims your branches whose tracking remote refs are merged or stray' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/git-trim/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/foriequal0/git-trim' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install crates.io/git-trim' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/git-trim -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install crates.io/git-trim' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'git-trim',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'openssl.org^1.1',
    'zlib.net^1',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.4.3',
  ] as const,
  aliases: [] as const,
}

export type CratesiogittrimPackage = typeof cratesiogittrimPackage
