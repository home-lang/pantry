/**
 * **mecab-ipadic** - pkgx package
 *
 * @domain `taku910.github.io/mecab-ipadic`
 * @version `2.7.0.20070801` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install taku910.github.io/mecab-ipadic`
 * @dependencies `taku910.github.io/mecab`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.taku910githubiomecabipadic
 * console.log(pkg.name)        // "mecab-ipadic"
 * console.log(pkg.versions[0]) // "2.7.0.20070801" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/taku910-github-io/mecab-ipadic.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const taku910githubiomecabipadicPackage = {
  /**
   * The display name of this package.
   */
  name: 'mecab-ipadic' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'taku910.github.io/mecab-ipadic' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/taku910.github.io/mecab-ipadic/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install taku910.github.io/mecab-ipadic' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +taku910.github.io/mecab-ipadic -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install taku910.github.io/mecab-ipadic' as const,
  programs: [] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'taku910.github.io/mecab',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2.7.0.20070801',
  ] as const,
  aliases: [] as const,
}

export type Taku910githubiomecabipadicPackage = typeof taku910githubiomecabipadicPackage
