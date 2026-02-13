/**
 * **xmlwf** - :herb: Fast streaming XML parser written in C99 with >90% test coverage; moved from SourceForge to GitHub
 *
 * @domain `libexpat.github.io`
 * @programs `xmlwf`
 * @version `2.7.3` (11 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install libexpat.github.io`
 * @homepage https://libexpat.github.io/
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.libexpatgithubio
 * console.log(pkg.name)        // "xmlwf"
 * console.log(pkg.description) // ":herb: Fast streaming XML parser written in C99..."
 * console.log(pkg.programs)    // ["xmlwf"]
 * console.log(pkg.versions[0]) // "2.7.3" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/libexpat-github-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const libexpatgithubioPackage = {
  /**
   * The display name of this package.
   */
  name: 'xmlwf' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'libexpat.github.io' as const,
  /**
   * Brief description of what this package does.
   */
  description: ':herb: Fast streaming XML parser written in C99 with >90% test coverage; moved from SourceForge to GitHub' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/libexpat.github.io/package.yml' as const,
  homepageUrl: 'https://libexpat.github.io/' as const,
  githubUrl: 'https://github.com/libexpat/libexpat' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install libexpat.github.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +libexpat.github.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install libexpat.github.io' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'xmlwf',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2.7.3',
    '2.7.2',
    '2.7.1',
    '2.7.0',
    '2.6.4',
    '2.6.3',
    '2.6.2',
    '2.6.1',
    '2.6.0',
    '2.5.0',
    '2.4.9',
  ] as const,
  aliases: [] as const,
}

export type LibexpatgithubioPackage = typeof libexpatgithubioPackage
