/**
 * **gnupg** - GNU Pretty Good Privacy (PGP) package
 *
 * @domain `gnupg.org`
 * @programs `gpg`, `gpg-agent`, `gpg-connect-agent`, `gpg-wks-server`, `gpgconf`, ... (+8 more)
 * @version `2.4.9` (13 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install gnupg.org`
 * @homepage https://gnupg.org/
 * @dependencies `zlib.net^1.1`, `sourceware.org/bzip2`, `gnupg.org/npth`, ... (+9 more)
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.gnupgorg
 * console.log(pkg.name)        // "gnupg"
 * console.log(pkg.description) // "GNU Pretty Good Privacy (PGP) package"
 * console.log(pkg.programs)    // ["gpg", "gpg-agent", ...]
 * console.log(pkg.versions[0]) // "2.4.9" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/gnupg-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gnupgorgPackage = {
  /**
   * The display name of this package.
   */
  name: 'gnupg' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'gnupg.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'GNU Pretty Good Privacy (PGP) package' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/gnupg.org/package.yml' as const,
  homepageUrl: 'https://gnupg.org/' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install gnupg.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +gnupg.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install gnupg.org' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'gpg',
    'gpg-agent',
    'gpg-connect-agent',
    'gpg-wks-server',
    'gpgconf',
    'gpgparsemail',
    'gpgscm',
    'gpgsm',
    'gpgsplit',
    'gpgtar',
    'gpgv',
    'kbxutil',
    'watchgnupg',
  ] as const,
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
    'gnupg.org/libassuan@2',
    'gnupg.org/libgcrypt',
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
    '2.4.9',
    '2.4.8',
    '2.4.7',
    '2.4.6',
    '2.4.5',
    '2.4.4',
    '2.4.3',
    '2.4.2',
    '2.3.7',
    '2.2.45',
    '2.2.44',
    '2.2.43',
    '2.2.42',
  ] as const,
  aliases: [] as const,
}

export type GnupgorgPackage = typeof gnupgorgPackage
