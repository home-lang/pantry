/**
 * **mecab** - pkgx package
 *
 * @domain `taku910.github.io/mecab`
 * @programs `mecab`, `mecab-config`
 * @version `0.996.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install taku910.github.io/mecab`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.taku910githubiomecab
 * console.log(pkg.name)        // "mecab"
 * console.log(pkg.programs)    // ["mecab", "mecab-config"]
 * console.log(pkg.versions[0]) // "0.996.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/taku910-github-io/mecab.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const taku910githubiomecabPackage = {
  /**
   * The display name of this package.
   */
  name: 'mecab' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'taku910.github.io/mecab' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/taku910.github.io/mecab/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install taku910.github.io/mecab' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +taku910.github.io/mecab -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install taku910.github.io/mecab' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'mecab',
    'mecab-config',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.996.0',
  ] as const,
  aliases: [] as const,
}

export type Taku910githubiomecabPackage = typeof taku910githubiomecabPackage
