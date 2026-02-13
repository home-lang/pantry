/**
 * **pinentry** - Passphrase entry dialog utilizing the Assuan protocol
 *
 * @domain `gnupg.org/pinentry`
 * @programs `pinentry`, `pinentry-tty`
 * @version `1.3.2` (4 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install gnupg.org/pinentry`
 * @homepage https://www.gnupg.org/related_software/pinentry/
 * @dependencies `gnupg.org/libassuan`, `gnupg.org/libgpg-error`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.gnupgorgpinentry
 * console.log(pkg.name)        // "pinentry"
 * console.log(pkg.description) // "Passphrase entry dialog utilizing the Assuan pr..."
 * console.log(pkg.programs)    // ["pinentry", "pinentry-tty"]
 * console.log(pkg.versions[0]) // "1.3.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/gnupg-org/pinentry.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gnupgorgpinentryPackage = {
  /**
   * The display name of this package.
   */
  name: 'pinentry' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'gnupg.org/pinentry' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Passphrase entry dialog utilizing the Assuan protocol' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/gnupg.org/pinentry/package.yml' as const,
  homepageUrl: 'https://www.gnupg.org/related_software/pinentry/' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install gnupg.org/pinentry' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +gnupg.org/pinentry -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install gnupg.org/pinentry' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'pinentry',
    'pinentry-tty',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'gnupg.org/libassuan',
    'gnupg.org/libgpg-error',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.3.2',
    '1.3.1',
    '1.3.0',
    '1.2.1',
  ] as const,
  aliases: [] as const,
}

export type GnupgorgpinentryPackage = typeof gnupgorgpinentryPackage
