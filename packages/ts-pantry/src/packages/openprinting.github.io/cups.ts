/**
 * **cups** - Common UNIX Printing System
 *
 * @domain `openprinting.github.io/cups`
 * @programs `cups-config`, `ippeveprinter`, `ipptool`
 * @version `2.4.16` (11 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install openprinting.github.io/cups`
 * @homepage https://openprinting.github.io/cups
 * @dependencies `kerberos.org`, `zlib.net`, `linux:openssl.org^1.1` (includes OS-specific dependencies with `os:package` format)
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.openprintinggithubiocups
 * console.log(pkg.name)        // "cups"
 * console.log(pkg.description) // "Common UNIX Printing System"
 * console.log(pkg.programs)    // ["cups-config", "ippeveprinter", ...]
 * console.log(pkg.versions[0]) // "2.4.16" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/openprinting-github-io/cups.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const openprintinggithubiocupsPackage = {
  /**
  * The display name of this package.
  */
  name: 'cups' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'openprinting.github.io/cups' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Common UNIX Printing System' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/openprinting.github.io/cups/package.yml' as const,
  homepageUrl: 'https://openprinting.github.io/cups' as const,
  githubUrl: 'https://github.com/OpenPrinting/cups' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install openprinting.github.io/cups' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +openprinting.github.io/cups -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install openprinting.github.io/cups' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'cups-config',
    'ippeveprinter',
    'ipptool',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
  */
  dependencies: [
    'kerberos.org',
    'zlib.net',
    'linux:openssl.org^1.1',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '2.4.16',
    '2.4.15',
    '2.4.14',
    '2.4.13',
    '2.4.12',
    '2.4.11',
    '2.4.10',
    '2.4.9',
    '2.4.8',
    '2.4.7',
    '2.4.6',
  ] as const,
  aliases: [] as const,
}

export type OpenprintinggithubiocupsPackage = typeof openprintinggithubiocupsPackage
