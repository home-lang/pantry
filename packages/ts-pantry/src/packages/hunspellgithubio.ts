/**
 * **hunspell** - Spell checker and morphological analyzer
 *
 * @domain `hunspell.github.io`
 * @programs `analyze`, `chmorph`, `hunspell`, `hunzip`, `hzip`, ... (+2 more)
 * @version `1.7.2` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install hunspell.github.io`
 * @homepage https://hunspell.github.io
 * @dependencies `gnu.org/readline`, `invisible-island.net/ncurses`, `gnu.org/gettext`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.hunspellgithubio
 * console.log(pkg.name)        // "hunspell"
 * console.log(pkg.description) // "Spell checker and morphological analyzer"
 * console.log(pkg.programs)    // ["analyze", "chmorph", ...]
 * console.log(pkg.versions[0]) // "1.7.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/hunspell-github-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const hunspellgithubioPackage = {
  /**
   * The display name of this package.
   */
  name: 'hunspell' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'hunspell.github.io' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Spell checker and morphological analyzer' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/hunspell.github.io/package.yml' as const,
  homepageUrl: 'https://hunspell.github.io' as const,
  githubUrl: 'https://github.com/hunspell/hunspell' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install hunspell.github.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +hunspell.github.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install hunspell.github.io' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'analyze',
    'chmorph',
    'hunspell',
    'hunzip',
    'hzip',
    'munch',
    'unmunch',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'gnu.org/readline',
    'invisible-island.net/ncurses',
    'gnu.org/gettext',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.7.2',
  ] as const,
  aliases: [] as const,
}

export type HunspellgithubioPackage = typeof hunspellgithubioPackage
