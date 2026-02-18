/**
 * **libgpg-error** - Common error values for all GnuPG components
 *
 * @domain `gnupg.org/libgpg-error`
 * @programs `gpg-error`, `gpg-error-config`, `gpgrt-config`, `yat2m`
 * @version `1.59.0` (13 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install gnupg.org/libgpg-error`
 * @homepage https://www.gnupg.org/related_software/libgpg-error/
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.gnupgorglibgpgerror
 * console.log(pkg.name)        // "libgpg-error"
 * console.log(pkg.description) // "Common error values for all GnuPG components"
 * console.log(pkg.programs)    // ["gpg-error", "gpg-error-config", ...]
 * console.log(pkg.versions[0]) // "1.59.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/gnupg-org/libgpg-error.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gnupgorglibgpgerrorPackage = {
  /**
  * The display name of this package.
  */
  name: 'libgpg-error' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'gnupg.org/libgpg-error' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Common error values for all GnuPG components' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/gnupg.org/libgpg-error/package.yml' as const,
  homepageUrl: 'https://www.gnupg.org/related_software/libgpg-error/' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install gnupg.org/libgpg-error' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +gnupg.org/libgpg-error -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install gnupg.org/libgpg-error' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'gpg-error',
    'gpg-error-config',
    'gpgrt-config',
    'yat2m',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.59.0',
    '1.57.0',
    '1.56.0',
    '1.55.0',
    '1.54.0',
    '1.53.0',
    '1.52.0',
    '1.51.0',
    '1.50.0',
    '1.49.0',
    '1.48.0',
    '1.47.0',
    '1.45.0',
  ] as const,
  aliases: [] as const,
}

export type GnupgorglibgpgerrorPackage = typeof gnupgorglibgpgerrorPackage
