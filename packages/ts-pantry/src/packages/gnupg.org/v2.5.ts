/**
 * **v2.5** - pkgx package
 *
 * @domain `gnupg.org/v2.5`
 * @version `2.5.16` (16 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install gnupg.org/v2.5`
 * @dependencies `zlib.net^1.1`, `sourceware.org/bzip2`, `gnupg.org/npth`, ... (+9 more)
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.gnupgorgv25
 * console.log(pkg.name)        // "v2.5"
 * console.log(pkg.versions[0]) // "2.5.16" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/gnupg-org/v2-5.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gnupgorgv25Package = {
  /**
   * The display name of this package.
   */
  name: 'v2.5' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'gnupg.org/v2.5' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/gnupg.org/v2.5/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install gnupg.org/v2.5' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +gnupg.org/v2.5 -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install gnupg.org/v2.5' as const,
  programs: [] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'zlib.net^1.1',
    'sourceware.org/bzip2',
    'gnupg.org/npth',
    'gnupg.org/libgpg-error',
    'gnupg.org/libksba',
    'gnupg.org/libassuan@3',
    'gnupg.org/libgcrypt^1.11',
    'gnupg.org/pinentry',
    'gnutls.org^3',
    'openldap.org^2',
    'gnu.org/readline^8',
    'sqlite.org^3',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2.5.16',
    '2.5.14',
    '2.5.13',
    '2.5.12',
    '2.5.11',
    '2.5.10',
    '2.5.9',
    '2.5.8',
    '2.5.7',
    '2.5.6',
    '2.5.5',
    '2.5.4',
    '2.5.3',
    '2.5.2',
    '2.5.1',
    '2.5.0',
  ] as const,
  aliases: [] as const,
}

export type Gnupgorgv25Package = typeof gnupgorgv25Package
