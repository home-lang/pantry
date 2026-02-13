/**
 * **gpgme** - Library access to GnuPG
 *
 * @domain `gnupg.org/gpgme`
 * @programs `gpgme-config`, `gpgme-json`, `gpgme-tool`
 * @version `2.0.1` (12 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install gnupg.org/gpgme`
 * @homepage https://www.gnupg.org/related_software/gpgme/
 * @buildDependencies `gnupg.org`, `gnupg.org/libassuan@^2.0.2` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.gnupgorggpgme
 * console.log(pkg.name)        // "gpgme"
 * console.log(pkg.description) // "Library access to GnuPG"
 * console.log(pkg.programs)    // ["gpgme-config", "gpgme-json", ...]
 * console.log(pkg.versions[0]) // "2.0.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/gnupg-org/gpgme.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gnupgorggpgmePackage = {
  /**
   * The display name of this package.
   */
  name: 'gpgme' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'gnupg.org/gpgme' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Library access to GnuPG' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/gnupg.org/gpgme/package.yml' as const,
  homepageUrl: 'https://www.gnupg.org/related_software/gpgme/' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install gnupg.org/gpgme' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +gnupg.org/gpgme -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install gnupg.org/gpgme' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'gpgme-config',
    'gpgme-json',
    'gpgme-tool',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'gnupg.org',
    'gnupg.org/libassuan@^2.0.2',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2.0.1',
    '2.0.0',
    '1.24.3',
    '1.24.2',
    '1.24.1',
    '1.24.0',
    '1.23.2',
    '1.23.1',
    '1.23.0',
    '1.22.0',
    '1.19.0',
    '1.5.1',
  ] as const,
  aliases: [] as const,
}

export type GnupgorggpgmePackage = typeof gnupgorggpgmePackage
